import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig, writeConfig } from '../config';
import { DEFAULT_CONFIG } from '../types';
import { generateClaudeMd } from '../generators/claude-md';
import { generateAgentsMd } from '../generators/agents-md';
import { generateCursorRules } from '../generators/cursor-rules';
import { printHeader } from '../display/renderer';

interface RulesOptions {
  lang?: string;
  tool?: string;
  all?: boolean;
}

const TOOL_CHOICES = [
  { title: 'Claude Code (CLAUDE.md)', value: 'claude' },
  { title: 'Generic AGENTS.md', value: 'agents' },
  { title: 'Cursor (.cursorrules)', value: 'cursor' },
  { title: 'All of the above', value: 'all' },
];

function safeWrite(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    const backup = filePath + '.bak';
    fs.copyFileSync(filePath, backup);
    console.log(chalk.dim(`  ·  Backup saved: ${path.basename(backup)}`));
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

export async function rulesCommand(options: RulesOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd) ?? { ...DEFAULT_CONFIG };
  const lang = ((options.lang as Lang) || config.language || 'en') as Lang;
  setLang(lang);

  printHeader(t('rules.title'));

  let tools: string[] = [];

  if (options.all || options.tool === 'all') {
    tools = ['claude', 'agents', 'cursor'];
  } else if (options.tool) {
    tools = [options.tool];
  } else {
    const answer = await prompts({
      type: 'multiselect',
      name: 'tools',
      message: t('rules.selectTools'),
      choices: TOOL_CHOICES,
      min: 1,
    });
    if (!answer.tools?.length) {
      console.log(chalk.dim('  Cancelled.'));
      return;
    }
    if (answer.tools.includes('all')) {
      tools = ['claude', 'agents', 'cursor'];
    } else {
      tools = answer.tools as string[];
    }
  }

  console.log();
  const spinner = ora({
    text: chalk.dim(t('rules.generating')),
    spinner: 'dots',
    color: 'cyan',
  }).start();

  if (tools.includes('claude')) {
    const content = generateClaudeMd(config, lang);
    safeWrite(path.join(cwd, 'CLAUDE.md'), content);
    spinner.stop();
    console.log(chalk.green('  ✓  ') + t('rules.claudeCreated'));
    spinner.start();
  }

  if (tools.includes('agents')) {
    const content = generateAgentsMd(config, lang);
    safeWrite(path.join(cwd, 'AGENTS.md'), content);
    spinner.stop();
    console.log(chalk.green('  ✓  ') + t('rules.agentsCreated'));
    spinner.start();
  }

  if (tools.includes('cursor')) {
    const content = generateCursorRules(config, lang);
    safeWrite(path.join(cwd, '.cursorrules'), content);
    spinner.stop();
    console.log(chalk.green('  ✓  ') + t('rules.cursorCreated'));
    spinner.start();
  }

  spinner.stop();
  console.log();
  console.log(chalk.bold.green('  ' + t('rules.done')));
  console.log();
}
