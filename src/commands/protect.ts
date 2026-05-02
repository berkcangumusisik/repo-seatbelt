import chalk from 'chalk';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig, writeConfig } from '../config';
import { printHeader } from '../display/renderer';

interface ProtectOptions {
  lang?: string;
  add?: string;
  list?: boolean;
}

export function protectCommand(pattern: string | undefined, options: ProtectOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  printHeader(t('protect.title'));

  if (!config) {
    console.log(chalk.yellow(`  ⚠  ${t('protect.noConfig')}`));
    return;
  }

  if (options.list || !pattern) {
    console.log();
    console.log(chalk.bold(`  ${t('protect.currentProtected')}:`));
    console.log();
    for (const f of config.protectedFiles) {
      console.log(chalk.dim('  ·  ') + chalk.white(f));
    }
    console.log();
    return;
  }

  const target = pattern;

  if (config.protectedFiles.includes(target)) {
    console.log(chalk.yellow(`  ⚠  ${t('protect.alreadyProtected')}: ${target}`));
    return;
  }

  config.protectedFiles.push(target);
  writeConfig(config, cwd);

  console.log(chalk.green(`  ✓  "${target}" ${t('protect.added')}`));
  console.log();
}
