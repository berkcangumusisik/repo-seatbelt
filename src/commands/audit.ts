import { execSync } from 'child_process';
import chalk from 'chalk';
import picomatch from 'picomatch';
import { Lang } from '../types';
import { readConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';

interface AuditOptions {
  lang?: string;
  json?: boolean;
  since?: string;
  limit?: string;
}

interface AuditFinding {
  commit: string;
  date: string;
  author: string;
  subject: string;
  type: 'protected-touched' | 'env-committed' | 'blocked-command-trace' | 'large-refactor';
  detail: string;
}

function git(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024 }).trim();
  } catch {
    return '';
  }
}

export function auditCommand(options: AuditOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader('Git History Audit');

  if (!git('git rev-parse --git-dir', cwd)) {
    if (options.json) console.log(JSON.stringify({ error: 'not a git repo' }));
    else console.log(chalk.red('  ✗  Not a git repository'));
    process.exit(1);
  }

  const since = options.since ? `--since=${options.since}` : '';
  const limit = parseInt(options.limit ?? '500', 10);

  const log = git(
    `git log ${since} -n ${limit} --pretty=format:%H%x09%an%x09%ad%x09%s --date=short --name-only`,
    cwd
  );
  if (!log) {
    if (options.json) console.log(JSON.stringify({ findings: [] }));
    else console.log(chalk.green('  ✓  No commits in range.'));
    return;
  }

  // Parse: each commit block starts with hash\tauthor\tdate\tsubject, then file lines
  const blocks = log.split(/\n(?=[0-9a-f]{7,40}\t)/);
  const findings: AuditFinding[] = [];

  const protectedMatchers = (config?.protectedFiles ?? []).map(p => picomatch(p));
  const envFileRe = /(^|\/)\.env(\.|$)/;

  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    if (!lines.length) continue;
    const header = lines[0].split('\t');
    if (header.length < 4) continue;
    const [commit, author, date, ...subjectParts] = header;
    const subject = subjectParts.join('\t');
    const files = lines.slice(1);

    for (const f of files) {
      if (envFileRe.test(f)) {
        findings.push({ commit, date, author, subject, type: 'env-committed', detail: f });
      }
      if (protectedMatchers.some(m => m(f))) {
        findings.push({ commit, date, author, subject, type: 'protected-touched', detail: f });
      }
    }

    if (files.length >= 25) {
      findings.push({ commit, date, author, subject, type: 'large-refactor', detail: `${files.length} files changed` });
    }

    // Trace blocked commands in commit message
    for (const blocked of config?.blockedCommands ?? []) {
      if (subject.toLowerCase().includes(blocked.toLowerCase())) {
        findings.push({ commit, date, author, subject, type: 'blocked-command-trace', detail: blocked });
      }
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ findings, scanned: blocks.length }, null, 2));
    return;
  }

  console.log();
  console.log(chalk.dim(`  Scanned ${blocks.length} commit(s).`));
  console.log();

  if (!findings.length) {
    console.log(chalk.green('  ✓  No suspicious patterns found in git history.'));
    console.log();
    return;
  }

  const grouped = new Map<string, AuditFinding[]>();
  for (const f of findings) {
    const key = f.type;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(f);
  }

  for (const [type, items] of grouped) {
    const icon = type === 'env-committed' ? '🔴' : type === 'protected-touched' ? '🟠' : '🟡';
    console.log(chalk.bold(`  ${icon}  ${type} (${items.length})`));
    for (const it of items.slice(0, 10)) {
      console.log(chalk.dim(`     ${it.date} ${it.commit.slice(0, 7)} ${it.author}: `) + it.detail);
    }
    if (items.length > 10) console.log(chalk.dim(`     … ${items.length - 10} more`));
    console.log();
  }
}
