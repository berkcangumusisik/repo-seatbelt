import ora from 'ora';
import chalk from 'chalk';
import { runScan } from '../scanners';
import { printHeader, printScanResult } from '../display/renderer';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig } from '../config';

interface ScanOptions {
  lang?: string;
  json?: boolean;
  noColor?: boolean;
  verbose?: boolean;
}

export async function scanCommand(options: ScanOptions): Promise<void> {
  const cwd = process.cwd();

  // Determine language: flag > config > default
  const config = readConfig(cwd);
  const langFromConfig = config?.language ?? 'en';
  const lang = ((options.lang as Lang) || langFromConfig) as Lang;
  setLang(lang);

  if (options.noColor) {
    chalk.level = 0;
  }

  if (!options.json) {
    printHeader(t('scan.title'), t('scan.title'));
  }

  const spinner = options.json ? null : ora({
    text: chalk.dim(t('scan.scanning')),
    spinner: 'dots',
    color: 'cyan',
  }).start();

  try {
    const result = await runScan(cwd);

    if (spinner) spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    printScanResult(result, options.verbose);
  } catch (err) {
    if (spinner) spinner.stop();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`  ✗  ${t('errors.general', { message: msg })}`));
    process.exit(1);
  }
}
