import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { Lang } from '../types';
import { readConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';
import { generateClaudeMd } from '../generators/claude-md';
import { generateAgentsMd } from '../generators/agents-md';
import { generateCursorRules } from '../generators/cursor-rules';
import { generateWindsurfRules } from '../generators/windsurf-rules';
import { generateAiderConventions } from '../generators/aider-conventions';
import { generateClineRules } from '../generators/cline-rules';
import { generateZedRules } from '../generators/zed-rules';

interface UpdateOptions {
  lang?: string;
  json?: boolean;
  yes?: boolean;
  diffOnly?: boolean;
}

interface FileTarget { file: string; render: () => string; }

function lineDiff(oldText: string, newText: string): { added: number; removed: number; sample: string[] } {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const setA = new Set(a);
  const setB = new Set(b);
  const added = b.filter(l => !setA.has(l));
  const removed = a.filter(l => !setB.has(l));
  const sample: string[] = [];
  for (const l of removed.slice(0, 5)) sample.push('- ' + l);
  for (const l of added.slice(0, 5)) sample.push('+ ' + l);
  return { added: added.length, removed: removed.length, sample };
}

export async function updateCommand(options: UpdateOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader('Update Rule Files');

  if (!config) {
    if (options.json) console.log(JSON.stringify({ error: 'no-config' }));
    else console.log(chalk.red('  ✗  No .repo-seatbelt.json — run `repo-seatbelt init` first.'));
    process.exit(1);
  }

  const targets: FileTarget[] = [
    { file: 'CLAUDE.md',      render: () => generateClaudeMd(config, lang) },
    { file: 'AGENTS.md',      render: () => generateAgentsMd(config, lang) },
    { file: '.cursorrules',   render: () => generateCursorRules(config, lang) },
    { file: '.windsurfrules', render: () => generateWindsurfRules(config, lang) },
    { file: 'CONVENTIONS.md', render: () => generateAiderConventions(config, lang) },
    { file: '.clinerules',    render: () => generateClineRules(config, lang) },
    { file: '.rules',         render: () => generateZedRules(config, lang) },
  ];

  const changes: { file: string; added: number; removed: number; sample: string[]; isNew: boolean }[] = [];

  for (const t of targets) {
    const p = path.join(cwd, t.file);
    if (!fs.existsSync(p)) continue;
    const old = fs.readFileSync(p, 'utf-8');
    const next = t.render();
    if (old === next) continue;
    const diff = lineDiff(old, next);
    changes.push({ file: t.file, ...diff, isNew: false });
  }

  if (options.json) {
    if (!options.diffOnly) {
      for (const c of changes) {
        const t = targets.find(x => x.file === c.file)!;
        const p = path.join(cwd, c.file);
        fs.copyFileSync(p, p + '.bak');
        fs.writeFileSync(p, t.render(), 'utf-8');
      }
    }
    console.log(JSON.stringify({ changes, applied: !options.diffOnly }, null, 2));
    return;
  }

  if (!changes.length) {
    console.log(chalk.green('  ✓  All rule files are up to date.'));
    console.log();
    return;
  }

  console.log();
  console.log(chalk.bold('  Pending changes:'));
  console.log();
  for (const c of changes) {
    console.log(chalk.cyan(`  ${c.file}`) + chalk.dim(`  +${c.added} -${c.removed}`));
    for (const s of c.sample) {
      const color = s.startsWith('+') ? chalk.green : chalk.red;
      console.log('    ' + color(s));
    }
    console.log();
  }

  if (options.diffOnly) return;

  let proceed = options.yes ?? false;
  if (!proceed) {
    const answer = await prompts({
      type: 'confirm',
      name: 'ok',
      message: `Apply updates to ${changes.length} file(s)? (.bak backups will be saved)`,
      initial: true,
    });
    proceed = !!answer.ok;
  }

  if (!proceed) {
    console.log(chalk.dim('  Cancelled.'));
    return;
  }

  for (const c of changes) {
    const t = targets.find(x => x.file === c.file)!;
    const p = path.join(cwd, c.file);
    fs.copyFileSync(p, p + '.bak');
    fs.writeFileSync(p, t.render(), 'utf-8');
    console.log(chalk.green(`  ✓  ${c.file}`));
  }
  console.log();
}
