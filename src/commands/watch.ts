import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { Lang } from '../types';
import { readConfig, writeConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';
import { generateClaudeMd } from '../generators/claude-md';
import { generateAgentsMd } from '../generators/agents-md';
import { generateCursorRules } from '../generators/cursor-rules';
import { generateWindsurfRules } from '../generators/windsurf-rules';
import { generateAiderConventions } from '../generators/aider-conventions';
import { generateClineRules } from '../generators/cline-rules';
import { generateZedRules } from '../generators/zed-rules';

interface WatchOptions {
  lang?: string;
  debounce?: string;
}

const SENSITIVE_DIRS = ['auth', 'payment', 'payments', 'stripe', 'billing', 'middleware'];

function detectNewProtections(cwd: string, config: ReturnType<typeof readConfig>): { newApproval: string[]; newProtected: string[] } {
  if (!config) return { newApproval: [], newProtected: [] };
  const newApproval: string[] = [];
  const newProtected: string[] = [];

  // Walk top-level src/ and root for sensitive dirs (shallow)
  const roots = [cwd, path.join(cwd, 'src'), path.join(cwd, 'app'), path.join(cwd, 'lib')];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    let entries: string[] = [];
    try { entries = fs.readdirSync(root); } catch { continue; }
    for (const entry of entries) {
      if (!SENSITIVE_DIRS.includes(entry.toLowerCase())) continue;
      const rel = path.relative(cwd, path.join(root, entry)) + '/**';
      const norm = rel.replace(/\\/g, '/');
      if (!config.approvalRequired.includes(norm) && !newApproval.includes(norm)) {
        newApproval.push(norm);
      }
    }
  }

  // .env files in root
  try {
    for (const f of fs.readdirSync(cwd)) {
      if (f.startsWith('.env') && !config.protectedFiles.includes(f)) {
        newProtected.push(f);
      }
    }
  } catch { /* ignore */ }

  return { newApproval, newProtected };
}

function regenerateRuleFiles(cwd: string, config: ReturnType<typeof readConfig>, lang: Lang): string[] {
  if (!config) return [];
  const updated: string[] = [];
  const targets: { file: string; content: () => string }[] = [
    { file: 'CLAUDE.md',      content: () => generateClaudeMd(config, lang) },
    { file: 'AGENTS.md',      content: () => generateAgentsMd(config, lang) },
    { file: '.cursorrules',   content: () => generateCursorRules(config, lang) },
    { file: '.windsurfrules', content: () => generateWindsurfRules(config, lang) },
    { file: 'CONVENTIONS.md', content: () => generateAiderConventions(config, lang) },
    { file: '.clinerules',    content: () => generateClineRules(config, lang) },
    { file: '.rules',         content: () => generateZedRules(config, lang) },
  ];
  for (const t of targets) {
    const p = path.join(cwd, t.file);
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, t.content(), 'utf-8');
      updated.push(t.file);
    }
  }
  return updated;
}

export function watchCommand(options: WatchOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  printHeader('Watch Mode');

  if (!config) {
    console.log(chalk.red('  ✗  No .repo-seatbelt.json — run `repo-seatbelt init` first.'));
    process.exit(1);
  }

  const debounceMs = parseInt(options.debounce ?? '500', 10);
  console.log(chalk.dim(`  Watching ${cwd}`));
  console.log(chalk.dim('  Press Ctrl+C to stop.'));
  console.log();

  let pending: NodeJS.Timeout | null = null;
  const handler = () => {
    if (pending) clearTimeout(pending);
    pending = setTimeout(() => {
      pending = null;
      const fresh = readConfig(cwd);
      if (!fresh) return;
      const { newApproval, newProtected } = detectNewProtections(cwd, fresh);
      if (newApproval.length || newProtected.length) {
        fresh.approvalRequired = [...new Set([...fresh.approvalRequired, ...newApproval])];
        fresh.protectedFiles = [...new Set([...fresh.protectedFiles, ...newProtected])];
        writeConfig(fresh, cwd);
        const updated = regenerateRuleFiles(cwd, fresh, lang);
        const ts = new Date().toLocaleTimeString();
        console.log(chalk.green(`  [${ts}] Updated config + ${updated.length} rule file(s)`));
        if (newApproval.length) console.log(chalk.dim(`     +approval: ${newApproval.join(', ')}`));
        if (newProtected.length) console.log(chalk.dim(`     +protected: ${newProtected.join(', ')}`));
      }
    }, debounceMs);
  };

  // Initial pass
  handler();

  try {
    fs.watch(cwd, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const fname = filename.toString();
      if (fname.includes('node_modules') || fname.startsWith('.git/') || fname.includes('/.git/')) return;
      if (fname.endsWith('.bak') || fname.endsWith('~')) return;
      handler();
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`  ✗  fs.watch failed: ${msg}`));
    console.log(chalk.dim('     Recursive watch is not supported on all platforms (Linux <5.x).'));
    process.exit(1);
  }
}
