import ora from 'ora';
import chalk from 'chalk';
import { runScan } from '../scanners';
import { printHeader, printDoctorResult } from '../display/renderer';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig } from '../config';

interface DoctorOptions {
  lang?: string;
  json?: boolean;
  noColor?: boolean;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (options.noColor) chalk.level = 0;

  if (!options.json) {
    printHeader(t('doctor.title'), t('doctor.subtitle'));
  }

  const spinner = options.json ? null : ora({
    text: chalk.dim(t('doctor.subtitle')),
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

    printDoctorResult(result);
  } catch (err) {
    if (spinner) spinner.stop();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`  ✗  ${t('errors.general', { message: msg })}`));
    process.exit(1);
  }
}
