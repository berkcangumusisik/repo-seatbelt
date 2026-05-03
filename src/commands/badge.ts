import chalk from 'chalk';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig } from '../config';
import { runScan } from '../scanners';
import ora from 'ora';
import { printHeader } from '../display/renderer';

interface BadgeOptions {
  lang?: string;
  score?: string;
  json?: boolean;
}

function getShieldsBadgeUrl(score: number, label: string, color: string): string {
  const encodedLabel = encodeURIComponent(label);
  const encodedScore = encodeURIComponent(`${score}/100`);
  return `https://img.shields.io/badge/${encodedLabel}-${encodedScore}-${color}`;
}

function getBadgeLabel(score: number, lang: Lang): string {
  if (lang === 'tr') {
    if (score >= 80) return 'AI Güvenli';
    if (score >= 60) return 'AI Dikkat Gerektirir';
    if (score >= 40) return 'AI Riskli';
    return 'AI Hazır Değil';
  }
  if (score >= 80) return 'AI Safe';
  if (score >= 60) return 'AI Needs Attention';
  if (score >= 40) return 'AI Risky';
  return 'Not AI Ready';
}

function getBadgeColor(score: number): string {
  if (score >= 80) return 'brightgreen';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

export async function badgeCommand(options: BadgeOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader(t('badge.title'));

  let score: number;

  if (options.score) {
    score = parseInt(options.score, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      console.log(chalk.red(`  ✗  Invalid score value. Must be 0–100.`));
      return;
    }
  } else {
    const spinner = options.json ? null : ora({
      text: chalk.dim('Running scan to get score...'),
      spinner: 'dots',
      color: 'cyan',
    }).start();

    try {
      const result = await runScan(cwd);
      if (spinner) spinner.stop();
      score = result.score;
    } catch {
      if (spinner) spinner.stop();
      if (options.json) console.log(JSON.stringify({ error: 'no-scan' }));
      else console.log(chalk.yellow(`  ⚠  ${t('badge.noScanFound')}`));
      return;
    }
  }

  const label = getBadgeLabel(score, lang);
  const color = getBadgeColor(score);
  const url = getShieldsBadgeUrl(score, label, color);
  const markdownEarly = `![${label}](${url})`;
  const htmlEarly = `<img src="${url}" alt="${label}" />`;

  if (options.json) {
    console.log(JSON.stringify({ score, label, color, url, markdown: markdownEarly, html: htmlEarly }, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold(`  ${t('badge.badgeText')}`));
  console.log();

  // Markdown badge
  console.log(chalk.white(`  Markdown:`));
  console.log(chalk.cyan(`  ${markdownEarly}`));
  console.log();

  // HTML badge
  console.log(chalk.white(`  HTML:`));
  console.log(chalk.cyan(`  ${htmlEarly}`));
  console.log();

  // Direct URL
  console.log(chalk.white(`  URL:`));
  console.log(chalk.dim(`  ${url}`));
  console.log();
}
