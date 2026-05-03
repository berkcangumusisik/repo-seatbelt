import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { Lang } from '../types';
import { readConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';

interface InstallHooksOptions {
  lang?: string;
  json?: boolean;
  force?: boolean;
  uninstall?: boolean;
}

const HOOK_MARKER = '# repo-seatbelt-hook';

const HOOK_SCRIPT = `#!/bin/sh
${HOOK_MARKER}
# Installed by repo-seatbelt. Run \`npx repo-seatbelt install-hooks --uninstall\` to remove.

if ! command -v npx >/dev/null 2>&1; then
  exit 0
fi

OUTPUT=$(npx --no-install repo-seatbelt diff --json 2>/dev/null)
if [ -z "$OUTPUT" ]; then
  exit 0
fi

# Block on high overall risk
RISK=$(printf '%s' "$OUTPUT" | sed -n 's/.*"overallRisk":[[:space:]]*"\\([a-z]*\\)".*/\\1/p' | head -n1)

if [ "$RISK" = "high" ]; then
  echo ""
  echo "  \\033[31m✗ repo-seatbelt: high-risk changes detected\\033[0m"
  echo "  Run 'npx repo-seatbelt diff' for details."
  echo "  To bypass: git commit --no-verify"
  echo ""
  exit 1
fi

exit 0
`;

function findGitDir(cwd: string): string | null {
  try {
    const out = execSync('git rev-parse --git-dir', { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return path.isAbsolute(out) ? out : path.join(cwd, out);
  } catch {
    return null;
  }
}

export function installHooksCommand(options: InstallHooksOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader('Install Git Hooks');

  const gitDir = findGitDir(cwd);
  if (!gitDir) {
    const msg = 'Not a git repository';
    if (options.json) console.log(JSON.stringify({ ok: false, error: msg }));
    else console.log(chalk.red(`  ✗  ${msg}`));
    process.exit(1);
  }

  const hooksDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  const hookPath = path.join(hooksDir, 'pre-commit');

  if (options.uninstall) {
    if (fs.existsSync(hookPath)) {
      const existing = fs.readFileSync(hookPath, 'utf-8');
      if (existing.includes(HOOK_MARKER)) {
        fs.unlinkSync(hookPath);
        if (options.json) console.log(JSON.stringify({ ok: true, uninstalled: hookPath }));
        else console.log(chalk.green(`  ✓  Removed ${hookPath}`));
        return;
      }
      if (options.json) console.log(JSON.stringify({ ok: false, error: 'pre-commit not owned by repo-seatbelt' }));
      else console.log(chalk.yellow('  ⚠  pre-commit hook exists but was not installed by repo-seatbelt; skipped.'));
      return;
    }
    if (options.json) console.log(JSON.stringify({ ok: true, uninstalled: null }));
    else console.log(chalk.dim('  ·  No hook to remove.'));
    return;
  }

  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, 'utf-8');
    if (existing.includes(HOOK_MARKER) && !options.force) {
      if (options.json) console.log(JSON.stringify({ ok: true, alreadyInstalled: true, path: hookPath }));
      else console.log(chalk.dim(`  ·  Already installed at ${hookPath}`));
      return;
    }
    if (!options.force) {
      if (options.json) console.log(JSON.stringify({ ok: false, error: 'pre-commit exists; use --force' }));
      else console.log(chalk.yellow(`  ⚠  pre-commit hook already exists. Use --force to overwrite (a .bak will be saved).`));
      process.exit(1);
    }
    fs.copyFileSync(hookPath, hookPath + '.bak');
  }

  fs.writeFileSync(hookPath, HOOK_SCRIPT, 'utf-8');
  fs.chmodSync(hookPath, 0o755);

  if (options.json) {
    console.log(JSON.stringify({ ok: true, installed: hookPath }, null, 2));
    return;
  }
  console.log(chalk.green(`  ✓  Installed ${hookPath}`));
  console.log(chalk.dim('     Blocks commits when `repo-seatbelt diff` reports high risk.'));
  console.log(chalk.dim('     Bypass with: git commit --no-verify'));
  console.log();
}
