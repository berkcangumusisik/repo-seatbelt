import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { t, setLang } from '../i18n';
import { RepoSeatbeltConfig, DEFAULT_CONFIG, Lang, SafetyMode } from '../types';
import { readConfig, writeConfig, configExists } from '../config';
import { generateClaudeMd } from '../generators/claude-md';
import { generateAgentsMd } from '../generators/agents-md';
import { generateCursorRules } from '../generators/cursor-rules';
import { printHeader } from '../display/renderer';

interface InitOptions {
  lang?: string;
  yes?: boolean;
}

const AI_TOOLS = [
  { title: 'Claude Code', value: 'claude' },
  { title: 'Cursor', value: 'cursor' },
  { title: 'Codex / ChatGPT', value: 'codex' },
  { title: 'Gemini CLI', value: 'gemini' },
  { title: 'Aider', value: 'aider' },
  { title: 'Windsurf', value: 'windsurf' },
  { title: 'Other', value: 'other' },
];

const PROJECT_TYPES = [
  { title: 'Next.js', value: 'nextjs' },
  { title: 'React', value: 'react' },
  { title: 'Node.js API', value: 'node' },
  { title: 'Full-stack SaaS', value: 'fullstack' },
  { title: 'React Native / Expo', value: 'reactnative' },
  { title: 'Other', value: 'other' },
];

const MODES = [
  { title: 'Solo - helpful warnings, not too strict', value: 'solo' },
  { title: 'Team - stronger approval rules, PR checklist emphasis', value: 'team' },
  { title: 'Strict - very conservative, all risky areas always flagged', value: 'strict' },
];

const MODES_TR = [
  { title: 'Solo - yardımcı uyarılar, çok katı değil', value: 'solo' },
  { title: 'Ekip - daha güçlü onay kuralları, PR kontrol listesi', value: 'team' },
  { title: 'Katı - çok muhafazakâr, tüm riskli alanlar her zaman işaretlenir', value: 'strict' },
];

function safeWriteFile(filePath: string, content: string, label: string): void {
  if (fs.existsSync(filePath)) {
    const backup = filePath + '.backup-' + Date.now();
    fs.copyFileSync(filePath, backup);
    console.log(chalk.dim(`  ·  ${label} already exists - backup saved as ${path.basename(backup)}`));
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const lang = (options.lang as Lang) || 'en';
  setLang(lang);

  printHeader(t('init.title'));
  console.log(chalk.white('  ' + t('init.welcome')));
  console.log();

  let selectedTools: string[] = [];
  let projectType = 'other';
  let mode: SafetyMode = 'solo';
  let chosenLang: Lang = lang;

  if (options.yes) {
    // Non-interactive mode: use defaults
    selectedTools = ['claude'];
    projectType = 'other';
    mode = 'solo';
    chosenLang = lang;
  } else {
    // Language selection first
    const langAnswer = await prompts({
      type: 'select',
      name: 'language',
      message: 'Which language do you want? / Hangi dili kullanmak istiyorsunuz?',
      choices: [
        { title: 'English', value: 'en' },
        { title: 'Türkçe', value: 'tr' },
      ],
      initial: lang === 'tr' ? 1 : 0,
    });

    if (!langAnswer.language) {
      console.log(chalk.dim('  Cancelled.'));
      return;
    }

    chosenLang = langAnswer.language as Lang;
    setLang(chosenLang);

    // Tools selection
    const toolsAnswer = await prompts({
      type: 'multiselect',
      name: 'tools',
      message: t('init.questionTools'),
      choices: AI_TOOLS,
      min: 0,
    });

    selectedTools = toolsAnswer.tools ?? [];

    // Project type
    const typeAnswer = await prompts({
      type: 'select',
      name: 'type',
      message: t('init.questionProjectType'),
      choices: PROJECT_TYPES,
    });

    projectType = typeAnswer.type ?? 'other';

    // Safety mode
    const modeAnswer = await prompts({
      type: 'select',
      name: 'mode',
      message: t('init.questionMode'),
      choices: chosenLang === 'tr' ? MODES_TR : MODES,
    });

    mode = (modeAnswer.mode as SafetyMode) ?? 'solo';
  }

  console.log();

  // Build config
  const existingConfig = readConfig(cwd);
  const base = existingConfig ?? { ...DEFAULT_CONFIG };

  const newConfig: RepoSeatbeltConfig = {
    ...base,
    version: '1',
    mode,
    language: chosenLang,
    projectType,
    selectedTools,
    protectedFiles: [
      '.env',
      '.env.*',
      'prisma/migrations/**',
      'migrations/**',
      '**/migrations/**',
      ...(base.protectedFiles ?? []),
    ],
    approvalRequired: [
      'auth/**',
      'lib/auth/**',
      'src/auth/**',
      'app/auth/**',
      'payment/**',
      'lib/payment/**',
      'src/payment/**',
      'middleware.ts',
      'middleware.js',
      ...(base.approvalRequired ?? []),
    ],
    blockedCommands: [
      'rm -rf',
      'DROP TABLE',
      'TRUNCATE',
      'DELETE FROM',
      'prisma migrate reset',
      'prisma db push --force-reset',
      'git push --force',
      'git push -f',
      'docker volume rm',
      'vercel env rm',
      'railway volume delete',
      ...(base.blockedCommands ?? []),
    ],
    ignoredPaths: base.ignoredPaths ?? [],
    riskThresholds: base.riskThresholds ?? DEFAULT_CONFIG.riskThresholds,
    presets: base.presets ?? [],
  };

  // Deduplicate arrays
  newConfig.protectedFiles = [...new Set(newConfig.protectedFiles)];
  newConfig.approvalRequired = [...new Set(newConfig.approvalRequired)];
  newConfig.blockedCommands = [...new Set(newConfig.blockedCommands)];

  // Write config
  const spinner = ora({ text: chalk.dim(t('init.creating')), spinner: 'dots', color: 'cyan' }).start();
  writeConfig(newConfig, cwd);
  spinner.succeed(chalk.green('  ✓  .repo-seatbelt.json ') + chalk.dim(t('common.created')));

  // Generate CLAUDE.md
  const claudeSpinner = ora({ text: chalk.dim(t('init.generatingCLAUDE')), spinner: 'dots', color: 'cyan' }).start();
  const claudeContent = generateClaudeMd(newConfig, chosenLang);
  safeWriteFile(path.join(cwd, 'CLAUDE.md'), claudeContent, 'CLAUDE.md');
  claudeSpinner.succeed(chalk.green('  ✓  CLAUDE.md ') + chalk.dim(t('common.created')));

  // Generate AGENTS.md
  const agentsSpinner = ora({ text: chalk.dim(t('init.generatingAGENTS')), spinner: 'dots', color: 'cyan' }).start();
  const agentsContent = generateAgentsMd(newConfig, chosenLang);
  safeWriteFile(path.join(cwd, 'AGENTS.md'), agentsContent, 'AGENTS.md');
  agentsSpinner.succeed(chalk.green('  ✓  AGENTS.md ') + chalk.dim(t('common.created')));

  // Generate Cursor rules if selected
  if (selectedTools.includes('cursor')) {
    const cursorSpinner = ora({ text: chalk.dim(t('init.generatingCursor')), spinner: 'dots', color: 'cyan' }).start();
    const cursorContent = generateCursorRules(newConfig, chosenLang);
    safeWriteFile(path.join(cwd, '.cursorrules'), cursorContent, '.cursorrules');
    cursorSpinner.succeed(chalk.green('  ✓  .cursorrules ') + chalk.dim(t('common.created')));
  }

  console.log();
  console.log(chalk.bold.green('  ' + t('init.done')));
  console.log(chalk.dim('  ' + t('init.hint')));
  console.log();
}
