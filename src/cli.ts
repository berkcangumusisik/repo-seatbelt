#!/usr/bin/env node

import { Command } from 'commander';
import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';
import { doctorCommand } from './commands/doctor';
import { diffCommand } from './commands/diff';
import { rulesCommand } from './commands/rules';
import { protectCommand } from './commands/protect';
import { checkCommandCommand } from './commands/check-command';
import { badgeCommand } from './commands/badge';
import { reportCommand } from './commands/report';
import { dashboardCommand } from './commands/dashboard';
import { installHooksCommand } from './commands/install-hooks';
import { ciCommand } from './commands/ci';
import { watchCommand } from './commands/watch';
import { auditCommand } from './commands/audit';
import { updateCommand } from './commands/update';
import { mcpCommand } from './commands/mcp';
import { listPresets } from './presets';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('repo-seatbelt')
  .description('A safety layer for AI coding agents before they touch your repo.')
  .version(VERSION, '-v, --version')
  .addHelpText('afterAll', `
  Examples:
    $ repo-seatbelt init
    $ repo-seatbelt init --preset nextjs-stripe
    $ repo-seatbelt scan
    $ repo-seatbelt doctor --json
    $ repo-seatbelt diff
    $ repo-seatbelt rules --tool claude,cursor,windsurf
    $ repo-seatbelt protect .env.local
    $ repo-seatbelt check-command "rm -rf ./dist"
    $ repo-seatbelt install-hooks
    $ repo-seatbelt ci
    $ repo-seatbelt watch
    $ repo-seatbelt audit --since "1 month ago"
    $ repo-seatbelt update
  `);

// ── init ──────────────────────────────────────────────────────────────────────
const presetList = listPresets().map(p => p.name).join('|');
program
  .command('init')
  .description('Initialize repo-seatbelt in the current project')
  .option('--lang <lang>', 'Language: en or tr', 'en')
  .option('-y, --yes', 'Skip interactive prompts and use defaults')
  .option('--preset <name>', `Apply a project preset: ${presetList}`)
  .action(async (options) => { await initCommand(options); });

// ── scan ──────────────────────────────────────────────────────────────────────
program
  .command('scan')
  .description('Scan the current repo and print an AI safety report')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .option('--verbose', 'Show full details')
  .action(async (options) => { await scanCommand(options); });

// ── doctor ────────────────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Run a detailed scan with prioritized recommendations')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .action(async (options) => { await doctorCommand(options); });

// ── diff ──────────────────────────────────────────────────────────────────────
program
  .command('diff')
  .description('Analyze current git changes after an AI coding session')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .action(async (options) => { await diffCommand(options); });

// ── rules ─────────────────────────────────────────────────────────────────────
program
  .command('rules')
  .description('Generate AI safety rule files (CLAUDE.md, AGENTS.md, .cursorrules, .windsurfrules, CONVENTIONS.md, .clinerules, .rules)')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--tool <tool>', 'Comma-separated: claude,agents,cursor,windsurf,aider,cline,zed,all')
  .option('--all', 'Generate rules for all tools')
  .option('--json', 'Output JSON')
  .action(async (options) => { await rulesCommand(options); });

// ── protect ───────────────────────────────────────────────────────────────────
program
  .command('protect [pattern]')
  .description('Add a file or glob pattern to the protected files list')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--list', 'List currently protected files')
  .option('--json', 'Output JSON')
  .action((pattern, options) => { protectCommand(pattern, options); });

// ── check-command ─────────────────────────────────────────────────────────────
program
  .command('check-command [cmd]')
  .description('Check if a shell command is dangerous')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .action((cmd, options) => { checkCommandCommand(cmd, options); });

// ── badge ─────────────────────────────────────────────────────────────────────
program
  .command('badge')
  .description('Generate a README badge based on the latest scan score')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--score <score>', 'Use a specific score instead of running a scan')
  .option('--json', 'Output JSON')
  .action(async (options) => { await badgeCommand(options); });

// ── report ────────────────────────────────────────────────────────────────────
program
  .command('report')
  .description('Generate a markdown safety report at docs/repo-seatbelt-report.md')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--output <path>', 'Custom output path')
  .action(async (options) => { await reportCommand(options); });

// ── dashboard ─────────────────────────────────────────────────────────────────
program
  .command('dashboard')
  .description('Generate a local static HTML safety dashboard')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--output <path>', 'Custom output path')
  .action(async (options) => { await dashboardCommand(options); });

// ── install-hooks ─────────────────────────────────────────────────────────────
program
  .command('install-hooks')
  .description('Install a git pre-commit hook that runs `repo-seatbelt diff` and blocks high-risk commits')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--force', 'Overwrite an existing pre-commit hook (a .bak will be saved)')
  .option('--uninstall', 'Remove the repo-seatbelt pre-commit hook')
  .action((options) => { installHooksCommand(options); });

// ── ci ────────────────────────────────────────────────────────────────────────
program
  .command('ci')
  .description('Generate a GitHub Actions workflow at .github/workflows/seatbelt.yml')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--force', 'Overwrite an existing workflow')
  .option('--output <path>', 'Custom output path')
  .action((options) => { ciCommand(options); });

// ── watch ─────────────────────────────────────────────────────────────────────
program
  .command('watch')
  .description('Watch the repo and auto-update protection rules when sensitive folders appear')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--debounce <ms>', 'Debounce window in ms', '500')
  .action((options) => { watchCommand(options); });

// ── audit ─────────────────────────────────────────────────────────────────────
program
  .command('audit')
  .description('Scan git history for protected-file touches, .env commits, and large refactors')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--since <when>', 'Time window, e.g. "1 month ago" or 2024-01-01')
  .option('--limit <n>', 'Maximum commits to scan', '500')
  .action((options) => { auditCommand(options); });

// ── update ────────────────────────────────────────────────────────────────────
program
  .command('update')
  .description('Regenerate existing rule files from the current config; show diffs before applying')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('-y, --yes', 'Apply without prompting')
  .option('--diff-only', 'Show diffs but do not write')
  .action(async (options) => { await updateCommand(options); });

// ── mcp ───────────────────────────────────────────────────────────────────────
program
  .command('mcp')
  .description('Run as an MCP server (stdio) that provides runtime guardrails to AI agents. Use --print to show client-config snippet instead.')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON (with --print)')
  .option('--print', 'Print MCP client configuration snippet and exit')
  .action((options) => { mcpCommand(options); });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
