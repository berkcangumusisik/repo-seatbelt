import chalk from 'chalk';
import { ScanResult, RiskItem, RiskLevel, AIRulesStatus, DiffResult } from '../types';
import { t, ta, getLang } from '../i18n';
import { getScoreLabel } from '../scoring';

const WIDTH = 54;

// ─── Primitives ───────────────────────────────────────────────────────────────

function upperLabel(s: string): string {
  const lang = getLang();
  return lang === 'tr' ? s.toLocaleUpperCase('tr-TR') : s.toUpperCase();
}

export function divider(label?: string): void {
  if (label) {
    console.log();
    console.log(chalk.dim('  ─────────────────────────────────────────────────────'));
    console.log(chalk.bold.white('  ' + upperLabel(label)));
    console.log(chalk.dim('  ─────────────────────────────────────────────────────'));
  } else {
    console.log(chalk.dim('  ─────────────────────────────────────────────────────'));
  }
}

export function blank(): void {
  console.log();
}

export function printHeader(title: string, subtitle?: string): void {
  console.log();
  console.log(chalk.bold.white('  🔒  repo-seatbelt'));
  if (subtitle) {
    console.log(chalk.dim('     ' + subtitle));
  } else {
    console.log(chalk.dim('     ' + title));
  }
  console.log();
}

export function printSuccess(msg: string): void {
  console.log(chalk.green('  ✓  ') + msg);
}

export function printWarning(msg: string): void {
  console.log(chalk.yellow('  ⚠  ') + msg);
}

export function printError(msg: string): void {
  console.log(chalk.red('  ✗  ') + msg);
}

export function printInfo(msg: string): void {
  console.log(chalk.cyan('  →  ') + msg);
}

export function printStep(step: string): void {
  console.log(chalk.dim('  ·  ') + chalk.white(step));
}

// ─── Score Display ────────────────────────────────────────────────────────────

export function printScore(score: number): void {
  const lang = getLang();
  const label = getScoreLabel(score, lang);
  let colorFn: chalk.Chalk;
  let icon: string;
  if (score >= 80) {
    colorFn = chalk.green;
    icon = '✓';
  } else if (score >= 60) {
    colorFn = chalk.yellow;
    icon = '⚠';
  } else if (score >= 40) {
    colorFn = chalk.hex('#FF8C00');
    icon = '⚠';
  } else {
    colorFn = chalk.red;
    icon = '✗';
  }

  console.log();
  console.log(colorFn(chalk.bold(`       ${score} / 100`)));
  console.log(colorFn(`       ${icon}  ${label}`));
  console.log();
}

// ─── Project Info ─────────────────────────────────────────────────────────────

export function printProjectInfo(result: ScanResult): void {
  const { projectInfo } = result;
  divider(t('scan.project'));

  const rows: [string, string][] = [];

  if (projectInfo.framework.length > 0) {
    rows.push([t('scan.framework'), projectInfo.framework.join(' · ')]);
  }

  rows.push([t('scan.packageManager'), projectInfo.packageManager]);

  if (projectInfo.databases.length > 0) {
    rows.push([t('scan.database'), projectInfo.databases.join(' · ')]);
  }
  if (projectInfo.authProviders.length > 0) {
    rows.push([t('scan.auth'), projectInfo.authProviders.join(' · ')]);
  }
  if (projectInfo.paymentProviders.length > 0) {
    rows.push([t('scan.payment'), projectInfo.paymentProviders.join(' · ')]);
  }

  for (const [label, value] of rows) {
    const pad = 20;
    const labelStr = chalk.dim(label.padEnd(pad));
    console.log(`  ${labelStr}${chalk.white(value)}`);
  }
}

// ─── Risk List ────────────────────────────────────────────────────────────────

function riskIcon(level: RiskLevel): string {
  switch (level) {
    case 'high': return chalk.red('  🔴');
    case 'medium': return chalk.yellow('  🟡');
    case 'low': return chalk.green('  🟢');
    default: return chalk.cyan('  ℹ');
  }
}

function riskLevelLabel(level: RiskLevel): string {
  return t(`risk.${level}`);
}

function riskColor(level: RiskLevel): chalk.Chalk {
  switch (level) {
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    case 'low': return chalk.green;
    default: return chalk.cyan;
  }
}

export function printRisks(risks: RiskItem[], verbose = false): void {
  divider(t('risk.summary'));

  if (risks.length === 0) {
    console.log();
    printSuccess(t('risk.noRisksFound'));
    console.log();
    return;
  }

  const HIGH_LIMIT = verbose ? 999 : 5;
  const MED_LIMIT = verbose ? 999 : 5;
  const LOW_LIMIT = verbose ? 999 : 3;

  const byLevel: Record<RiskLevel, RiskItem[]> = {
    high: risks.filter(r => r.level === 'high'),
    medium: risks.filter(r => r.level === 'medium'),
    low: risks.filter(r => r.level === 'low'),
    info: risks.filter(r => r.level === 'info'),
  };

  const sections: [RiskLevel, number][] = [
    ['high', HIGH_LIMIT],
    ['medium', MED_LIMIT],
    ['low', LOW_LIMIT],
  ];

  for (const [level, limit] of sections) {
    const items = byLevel[level];
    if (items.length === 0) continue;

    console.log();
    const icon = level === 'high' ? '🔴' : level === 'medium' ? '🟡' : '🟢';
    const countStr = `(${items.length})`;
    console.log(riskColor(level)(chalk.bold(`  ${icon}  ${riskLevelLabel(level)}  ${chalk.dim(countStr)}`)));
    console.log();

    const shown = items.slice(0, limit);
    const rest = items.length - shown.length;

    for (const item of shown) {
      const msg = item.messageKey ? t(item.messageKey, item.messageParams) : item.message;
      const displayMsg = msg === item.messageKey ? item.message : msg; // fallback if key missing
      const rec = item.recommendationKey ? t(item.recommendationKey) : item.recommendation;
      console.log(chalk.white(`    ●  ${displayMsg}`));
      if (rec) {
        console.log(chalk.dim(`       → ${rec}`));
      }
      if (item.file) {
        console.log(chalk.dim(`       ${item.file}`));
      }
      console.log();
    }

    if (rest > 0) {
      console.log(chalk.dim(`    … and ${rest} more. Use --verbose to see all.`));
      console.log();
    }
  }
}

// ─── AI Rules Status ──────────────────────────────────────────────────────────

export function printAIRulesStatus(status: AIRulesStatus): void {
  divider(t('scan.aiRulesStatus'));
  console.log();

  const rows: [boolean, string][] = [
    [status.hasConfig, t('aiRules.' + (status.hasConfig ? 'configFound' : 'configMissing'))],
    [status.hasCLAUDEMD, t('aiRules.' + (status.hasCLAUDEMD ? 'claudeMdFound' : 'claudeMdMissing'))],
    [status.hasAGENTSMD, t('aiRules.' + (status.hasAGENTSMD ? 'agentsMdFound' : 'agentsMdMissing'))],
    [status.hasCursorRules, t('aiRules.' + (status.hasCursorRules ? 'cursorFound' : 'cursorMissing'))],
  ];

  for (const [ok, label] of rows) {
    const icon = ok ? chalk.green('  ✓') : chalk.red('  ✗');
    const text = ok ? chalk.white(label) : chalk.dim(label);
    console.log(`${icon}  ${text}`);
  }
}

// ─── Next Steps ───────────────────────────────────────────────────────────────

export function printNextSteps(result: ScanResult): void {
  const steps: string[] = [];
  const { aiRulesStatus, envStatus } = result;

  if (!aiRulesStatus.hasConfig) {
    steps.push(t('scan.runInit'));
  }
  if (!aiRulesStatus.hasAGENTSMD || !aiRulesStatus.hasCLAUDEMD) {
    steps.push(t('scan.runRules'));
  }
  if (envStatus.hasEnvFile && !envStatus.hasEnvExample) {
    steps.push(t('scan.createEnvExample'));
  }
  if (result.config && result.config.blockedCommands.length === 0) {
    steps.push(t('scan.addDangerousCommands'));
  }
  if (steps.length > 0) {
    steps.push(t('scan.runDoctor'));
  }

  if (steps.length === 0) {
    console.log();
    printSuccess(t('scan.safeMessage'));
    return;
  }

  divider(t('scan.nextSteps'));
  console.log();
  steps.forEach((step, i) => {
    console.log(chalk.cyan(`  ${i + 1}.`) + chalk.white(` ${step}`));
  });
}

// ─── Scan Summary ─────────────────────────────────────────────────────────────

export function printScanResult(result: ScanResult, verbose = false): void {
  printProjectInfo(result);
  divider(t('score.label'));
  printScore(result.score);
  printRisks(result.risks, verbose);
  printAIRulesStatus(result.aiRulesStatus);
  printNextSteps(result);
  console.log();
  console.log(chalk.dim(`  ${t('scan.done')}`));
  console.log();
}

// ─── Diff Output ──────────────────────────────────────────────────────────────

export function printDiffResult(diff: DiffResult): void {
  divider(t('diff.title'));

  const col = 30;
  function row(label: string, value: string, warn = false): void {
    const l = chalk.dim(label.padEnd(col));
    const v = warn ? chalk.yellow(value) : chalk.white(value);
    console.log(`  ${l}${v}`);
  }

  console.log();
  row(t('diff.changedFiles'), String(diff.changedFiles.length), diff.changedFiles.length >= 10);
  row(t('diff.deletedFiles'), String(diff.deletedFiles.length), diff.deletedFiles.length > 0);
  row(t('diff.newFiles'), String(diff.newFiles.length));
  if (diff.newDependencies.length > 0) {
    row(t('diff.newDependencies'), diff.newDependencies.join(', '), true);
  }
  row(t('diff.lockfileChanged'), diff.hasLockFileChanges ? chalk.yellow('yes') : chalk.green('no'));
  row(t('diff.envChanged'), diff.hasEnvChanges ? chalk.red('yes') : chalk.green('no'), diff.hasEnvChanges);
  row(t('diff.authChanged'), diff.hasAuthChanges ? chalk.yellow('yes') : chalk.green('no'), diff.hasAuthChanges);
  row(t('diff.paymentChanged'), diff.hasPaymentChanges ? chalk.yellow('yes') : chalk.green('no'), diff.hasPaymentChanges);
  row(t('diff.dbMigrationChanged'), diff.hasDbMigrationChanges ? chalk.red('yes') : chalk.green('no'), diff.hasDbMigrationChanges);
  row(t('diff.prodConfigChanged'), diff.hasProdConfigChanges ? chalk.yellow('yes') : chalk.green('no'), diff.hasProdConfigChanges);
  row(t('diff.testsChanged'), diff.hasTestChanges ? chalk.green('yes') : chalk.yellow('no'));

  console.log();
  const riskLabel = t('diff.overallRisk');
  let riskValue: string;
  switch (diff.overallRisk) {
    case 'high': riskValue = chalk.red('HIGH'); break;
    case 'medium': riskValue = chalk.yellow('MEDIUM'); break;
    case 'low': riskValue = chalk.green('LOW'); break;
    default: riskValue = chalk.green('SAFE'); break;
  }
  console.log(`  ${chalk.bold(riskLabel.padEnd(col))}${riskValue}`);

  if (diff.riskReasons.length > 0) {
    console.log();
    for (const reason of diff.riskReasons) {
      console.log(chalk.dim(`  → `) + chalk.white(reason));
    }
  }

  console.log();
  if (diff.overallRisk === 'high' || diff.overallRisk === 'medium') {
    printWarning(t('diff.riskyDiff'));
  } else {
    printSuccess(t('diff.safe'));
  }
  console.log();
}

// ─── Doctor Output ────────────────────────────────────────────────────────────

export function printDoctorResult(result: ScanResult): void {
  divider(t('doctor.title'));
  printScore(result.score);

  const high = result.risks.filter(r => r.level === 'high');
  const medium = result.risks.filter(r => r.level === 'medium');
  const low = result.risks.filter(r => r.level === 'low');

  if (high.length === 0 && medium.length === 0 && low.length === 0) {
    console.log();
    printSuccess(t('doctor.nothingToDo'));
    console.log();
  } else {
    // Action plan
    divider(t('doctor.actionPlan'));
    console.log();
    let step = 1;

    if (high.length > 0) {
      console.log(chalk.red(chalk.bold(`  ${upperLabel(t('doctor.priorityHigh'))}`)));
      console.log();
      for (const item of high) {
        const translated = item.messageKey ? t(item.messageKey, item.messageParams) : null;
        const msg = (translated && translated !== item.messageKey) ? translated : item.message;
        const rec = (item.recommendationKey ? t(item.recommendationKey) : null) ?? item.recommendation;
        console.log(chalk.white(`  ${step++}. ${msg}`));
        if (rec) console.log(chalk.cyan(`     → ${rec}`));
        console.log();
      }
    }

    if (medium.length > 0) {
      console.log(chalk.yellow(chalk.bold(`  ${upperLabel(t('doctor.priorityMedium'))}`)));
      console.log();
      for (const item of medium) {
        const translated = item.messageKey ? t(item.messageKey, item.messageParams) : null;
        const msg = (translated && translated !== item.messageKey) ? translated : item.message;
        const rec = (item.recommendationKey ? t(item.recommendationKey) : null) ?? item.recommendation;
        console.log(chalk.white(`  ${step++}. ${msg}`));
        if (rec) console.log(chalk.cyan(`     → ${rec}`));
        console.log();
      }
    }

    if (low.length > 0) {
      console.log(chalk.green(chalk.bold(`  ${upperLabel(t('doctor.priorityLow'))}`)));
      console.log();
      for (const item of low) {
        const translated = item.messageKey ? t(item.messageKey, item.messageParams) : null;
        const msg = (translated && translated !== item.messageKey) ? translated : item.message;
        const rec = (item.recommendationKey ? t(item.recommendationKey) : null) ?? item.recommendation;
        console.log(chalk.white(`  ${step++}. ${msg}`));
        if (rec) console.log(chalk.cyan(`     → ${rec}`));
        console.log();
      }
    }
  }

  // Rollback checklist
  divider(t('doctor.rollbackChecklist'));
  console.log();
  const items = ta('doctor.rollbackItems');
  items.forEach((item, i) => {
    console.log(chalk.dim(`  ${i + 1}.`) + chalk.white(` ${item}`));
  });
  console.log();
}
