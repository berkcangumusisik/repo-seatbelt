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

const VERSION = '1.0.0';

const program = new Command();

program
  .name('repo-seatbelt')
  .description('A safety layer for AI coding agents before they touch your repo.')
  .version(VERSION, '-v, --version')
  .addHelpText('afterAll', `
  Examples:
    $ repo-seatbelt init
    $ repo-seatbelt scan
    $ repo-seatbelt scan --lang tr
    $ repo-seatbelt doctor
    $ repo-seatbelt diff
    $ repo-seatbelt rules
    $ repo-seatbelt protect .env.local
    $ repo-seatbelt check-command "rm -rf ./dist"
    $ repo-seatbelt badge
    $ repo-seatbelt report --lang tr
    $ repo-seatbelt dashboard --lang tr
  `);

// ── init ──────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize repo-seatbelt in the current project')
  .option('--lang <lang>', 'Language: en or tr', 'en')
  .option('-y, --yes', 'Skip interactive prompts and use defaults')
  .action(async (options) => {
    await initCommand(options);
  });

// ── scan ──────────────────────────────────────────────────────────────────────
program
  .command('scan')
  .description('Scan the current repo and print an AI safety report')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .option('--verbose', 'Show full details')
  .action(async (options) => {
    await scanCommand(options);
  });

// ── doctor ────────────────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Run a detailed scan with prioritized recommendations and action plan')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .action(async (options) => {
    await doctorCommand(options);
  });

// ── diff ──────────────────────────────────────────────────────────────────────
program
  .command('diff')
  .description('Analyze current git changes after an AI coding session')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .option('--no-color', 'Disable color output')
  .action(async (options) => {
    await diffCommand(options);
  });

// ── rules ─────────────────────────────────────────────────────────────────────
program
  .command('rules')
  .description('Generate AI safety rule files (CLAUDE.md, AGENTS.md, .cursorrules)')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--tool <tool>', 'Specific tool: claude, agents, cursor, all')
  .option('--all', 'Generate rules for all tools')
  .action(async (options) => {
    await rulesCommand(options);
  });

// ── protect ───────────────────────────────────────────────────────────────────
program
  .command('protect [pattern]')
  .description('Add a file or glob pattern to the protected files list')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--list', 'List currently protected files')
  .action((pattern, options) => {
    protectCommand(pattern, options);
  });

// ── check-command ─────────────────────────────────────────────────────────────
program
  .command('check-command [cmd]')
  .description('Check if a shell command is dangerous')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--json', 'Output JSON')
  .action((cmd, options) => {
    checkCommandCommand(cmd, options);
  });

// ── badge ─────────────────────────────────────────────────────────────────────
program
  .command('badge')
  .description('Generate a README badge based on the latest scan score')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--score <score>', 'Use a specific score instead of running a scan')
  .action(async (options) => {
    await badgeCommand(options);
  });

// ── report ────────────────────────────────────────────────────────────────────
program
  .command('report')
  .description('Generate a markdown safety report at docs/repo-seatbelt-report.md')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--output <path>', 'Custom output path')
  .action(async (options) => {
    await reportCommand(options);
  });

// ── dashboard ─────────────────────────────────────────────────────────────────
program
  .command('dashboard')
  .description('Generate a local static HTML safety dashboard')
  .option('--lang <lang>', 'Language: en or tr')
  .option('--output <path>', 'Custom output path')
  .action(async (options) => {
    await dashboardCommand(options);
  });

program.parse(process.argv);

// Show help if no command given
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
