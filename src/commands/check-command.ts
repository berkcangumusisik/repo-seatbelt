import chalk from 'chalk';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig } from '../config';
import { printHeader } from '../display/renderer';

interface CheckCommandOptions {
  lang?: string;
  json?: boolean;
}

interface DangerousPattern {
  pattern: RegExp;
  description: string;
  level: 'high' | 'medium';
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  { pattern: /rm\s+-rf/i, description: 'Recursive force delete', level: 'high' },
  { pattern: /DROP\s+TABLE/i, description: 'SQL DROP TABLE', level: 'high' },
  { pattern: /DROP\s+DATABASE/i, description: 'SQL DROP DATABASE', level: 'high' },
  { pattern: /TRUNCATE/i, description: 'SQL TRUNCATE', level: 'high' },
  { pattern: /DELETE\s+FROM\s+\w+\s*(?!WHERE)/i, description: 'DELETE without WHERE clause', level: 'high' },
  { pattern: /prisma\s+migrate\s+reset/i, description: 'Prisma migrate reset', level: 'high' },
  { pattern: /prisma\s+db\s+push\s+--force-reset/i, description: 'Prisma force reset', level: 'high' },
  { pattern: /prisma\s+db\s+push\s+--accept-data-loss/i, description: 'Prisma accept data loss', level: 'high' },
  { pattern: /git\s+push\s+.*--force/i, description: 'Force git push', level: 'high' },
  { pattern: /git\s+push\s+-f\b/i, description: 'Force git push', level: 'high' },
  { pattern: /git\s+reset\s+--hard/i, description: 'Hard git reset', level: 'medium' },
  { pattern: /docker\s+volume\s+rm/i, description: 'Docker volume remove', level: 'high' },
  { pattern: /docker\s+system\s+prune/i, description: 'Docker system prune', level: 'high' },
  { pattern: /railway\s+volume\s+delete/i, description: 'Railway volume delete', level: 'high' },
  { pattern: /vercel\s+env\s+rm/i, description: 'Vercel env delete', level: 'high' },
  { pattern: />\s*\.env/i, description: 'Overwriting .env file', level: 'high' },
  { pattern: /db:reset/i, description: 'Database reset script', level: 'high' },
  { pattern: /npx\s+.*reset/i, description: 'npx reset command', level: 'medium' },
  { pattern: /knex\s+migrate\s+rollback.*--all/i, description: 'Knex rollback all migrations', level: 'high' },
  { pattern: /sequelize\s+db:drop/i, description: 'Sequelize drop database', level: 'high' },
  { pattern: /fly\s+volumes\s+destroy/i, description: 'Fly.io volumes destroy', level: 'high' },
  { pattern: /supabase\s+db\s+reset/i, description: 'Supabase DB reset', level: 'high' },
];

export function checkCommandCommand(cmd: string | undefined, options: CheckCommandOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!cmd) {
    console.log(chalk.yellow(`  ⚠  ${t('errors.commandRequired')}`));
    return;
  }

  printHeader(t('checkCommand.title'));
  console.log();
  console.log(chalk.dim('  Command: ') + chalk.white(`"${cmd}"`));
  console.log();

  // Check built-in dangerous patterns
  const matched: Array<{ description: string; level: 'high' | 'medium' }> = [];

  for (const dp of DANGEROUS_PATTERNS) {
    if (dp.pattern.test(cmd)) {
      matched.push({ description: dp.description, level: dp.level });
    }
  }

  // Check against user-configured blocked commands
  if (config) {
    for (const blocked of config.blockedCommands) {
      if (cmd.toLowerCase().includes(blocked.toLowerCase()) && !matched.some(m => m.description === blocked)) {
        matched.push({ description: `Matches blocked command: "${blocked}"`, level: 'high' });
      }
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ command: cmd, matched, safe: matched.length === 0 }, null, 2));
    return;
  }

  if (matched.length === 0) {
    console.log(chalk.green('  ✓  ' + t('checkCommand.safe')));
    console.log();
    return;
  }

  const hasHighRisk = matched.some(m => m.level === 'high');

  if (hasHighRisk) {
    console.log(chalk.red(chalk.bold('  ✗  ' + t('checkCommand.dangerous'))));
  } else {
    console.log(chalk.yellow(chalk.bold('  ⚠  ' + t('checkCommand.warning'))));
  }

  console.log();
  for (const m of matched) {
    const icon = m.level === 'high' ? chalk.red('  🔴') : chalk.yellow('  🟡');
    console.log(`${icon}  ${m.description}`);
  }

  console.log();
  console.log(chalk.dim('  ' + t('checkCommand.doNotRun')));
  console.log();
}
