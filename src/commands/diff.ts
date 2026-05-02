import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { DiffResult, RiskLevel, Lang } from '../types';
import { printHeader, printDiffResult } from '../display/renderer';
import { t, setLang } from '../i18n';
import { readConfig } from '../config';

interface DiffOptions {
  lang?: string;
  json?: boolean;
  noColor?: boolean;
}

function runGit(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

export async function diffCommand(options: DiffOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (options.noColor) chalk.level = 0;

  if (!options.json) {
    printHeader(t('diff.title'), t('diff.subtitle'));
  }

  const spinner = options.json ? null : ora({
    text: chalk.dim(t('diff.subtitle')),
    spinner: 'dots',
    color: 'cyan',
  }).start();

  try {
    // Check git availability
    const gitCheck = runGit('git rev-parse --git-dir', cwd);
    if (!gitCheck) {
      if (spinner) spinner.stop();
      if (options.json) {
        console.log(JSON.stringify({ error: t('errors.noGit') }));
      } else {
        console.log();
        console.log(chalk.yellow(`  ⚠  ${t('diff.gitNotAvailable')}`));
        console.log();
      }
      return;
    }

    // Get changed files
    const statusOutput = runGit('git status --porcelain', cwd);
    if (!statusOutput) {
      if (spinner) spinner.stop();
      if (options.json) {
        console.log(JSON.stringify({ message: t('diff.noChanges') }));
      } else {
        console.log();
        console.log(chalk.green(`  ✓  ${t('diff.noChanges')}`));
        console.log();
      }
      return;
    }

    const lines = statusOutput.split('\n').filter(Boolean);
    const changedFiles: string[] = [];
    const deletedFiles: string[] = [];
    const newFiles: string[] = [];

    for (const line of lines) {
      const status = line.slice(0, 2).trim();
      const file = line.slice(3).trim();
      if (status === 'D' || status === 'MD') deletedFiles.push(file);
      else if (status === '??' || status === 'A') newFiles.push(file);
      else changedFiles.push(file);
    }

    const allFiles = [...changedFiles, ...deletedFiles, ...newFiles];

    // Analyze changes
    const hasLockFileChanges = allFiles.some(f =>
      f === 'package-lock.json' || f === 'yarn.lock' ||
      f === 'pnpm-lock.yaml' || f === 'bun.lock' || f === 'bun.lockb'
    );

    const hasEnvChanges = allFiles.some(f => {
      const base = f.split('/').pop() ?? '';
      return base.startsWith('.env');
    });

    const hasAuthChanges = allFiles.some(f =>
      /auth|session|jwt|middleware/i.test(f)
    );

    const hasPaymentChanges = allFiles.some(f =>
      /payment|billing|stripe|checkout|webhook/i.test(f)
    );

    const hasDbMigrationChanges = allFiles.some(f =>
      /migration|prisma\/migrations/i.test(f)
    );

    const hasProdConfigChanges = allFiles.some(f =>
      /vercel\.json|netlify\.toml|render\.yaml|railway\.toml|fly\.toml|Dockerfile|docker-compose/i.test(f)
    );

    const hasTestChanges = allFiles.some(f =>
      /\.test\.|\.spec\.|__tests__|\/tests\//i.test(f)
    );

    // Detect new dependencies
    const newDependencies: string[] = [];
    if (hasLockFileChanges) {
      try {
        const diff = runGit('git diff -- package.json', cwd);
        const added = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
        const depPattern = /"([a-zA-Z@][a-zA-Z0-9@/_-]*)"\s*:/;
        for (const line of added) {
          const m = depPattern.exec(line);
          if (m && !m[1].startsWith('//')) {
            newDependencies.push(m[1]);
          }
        }
      } catch { /* ignore */ }
    }

    // Risk calculation
    const riskReasons: string[] = [];
    let overallRisk: RiskLevel = 'info';

    if (hasEnvChanges) {
      riskReasons.push('.env files were modified');
      overallRisk = 'high';
    }
    if (hasDbMigrationChanges) {
      riskReasons.push('Database migrations were changed');
      overallRisk = 'high';
    }
    if (allFiles.length >= 25) {
      riskReasons.push(`${allFiles.length} files changed - large refactor`);
      if (overallRisk !== 'high') overallRisk = 'high';
    }
    if (hasAuthChanges && hasPaymentChanges) {
      riskReasons.push('Both auth and payment files were touched');
      if (overallRisk !== 'high') overallRisk = 'high';
    }
    if (hasAuthChanges && overallRisk !== 'high') {
      riskReasons.push('Auth files were modified');
      overallRisk = 'medium';
    }
    if (hasPaymentChanges && overallRisk !== 'high') {
      riskReasons.push('Payment files were modified');
      overallRisk = 'medium';
    }
    if (hasProdConfigChanges && overallRisk !== 'high') {
      riskReasons.push('Production config files were changed');
      if (overallRisk !== 'medium') overallRisk = 'medium';
    }
    if (allFiles.length >= 10 && overallRisk === 'info') {
      riskReasons.push(`${allFiles.length} files changed`);
      overallRisk = 'medium';
    }
    if (!hasTestChanges && allFiles.length > 3 && overallRisk === 'info') {
      riskReasons.push('No test files were changed');
      overallRisk = 'low';
    }
    if (newDependencies.length > 0 && overallRisk === 'info') {
      riskReasons.push(`${newDependencies.length} new dependencies added`);
      overallRisk = 'low';
    }

    if (spinner) spinner.stop();

    const diffResult: DiffResult = {
      changedFiles,
      deletedFiles,
      newFiles,
      newDependencies: [...new Set(newDependencies)].slice(0, 10),
      hasLockFileChanges,
      hasEnvChanges,
      hasAuthChanges,
      hasPaymentChanges,
      hasDbMigrationChanges,
      hasProdConfigChanges,
      hasTestChanges,
      overallRisk,
      riskReasons,
    };

    if (options.json) {
      console.log(JSON.stringify(diffResult, null, 2));
      return;
    }

    printDiffResult(diffResult);
  } catch (err) {
    if (spinner) spinner.stop();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`  ✗  ${t('errors.general', { message: msg })}`));
    process.exit(1);
  }
}
