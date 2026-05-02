import { RiskItem, ScanResult, RepoSeatbeltConfig, DEFAULT_IGNORED_PATHS } from '../types';
import { detectProject } from './project';
import { scanEnv } from './env';
import { scanDatabase } from './database';
import { scanAuth } from './auth';
import { scanPayment } from './payment';
import { scanProduction } from './production';
import { scanAIRules } from './ai-rules';
import { calculateScore } from '../scoring';
import { readConfig } from '../config';
import picomatch from 'picomatch';

function isPatternCovered(filePath: string, patterns: string[]): boolean {
  if (!patterns.length) return false;
  return patterns.some(p => picomatch(p)(filePath) || filePath.startsWith(p.replace('/**', '').replace('**/', '')));
}

export async function runScan(cwd: string): Promise<ScanResult> {
  const config = readConfig(cwd);
  const [projectInfo, envStatus, dbResult, authResult, paymentResult, prodResult] = await Promise.all([
    detectProject(cwd),
    scanEnv(cwd),
    scanDatabase(cwd),
    scanAuth(cwd),
    scanPayment(cwd),
    scanProduction(cwd),
  ]);

  const aiRulesStatus = scanAIRules(cwd);
  const risks: RiskItem[] = [];

  // ── Environment risks ──────────────────────────────────────────────────────
  if (envStatus.hasEnvFile) {
    const isProtected = config ? isPatternCovered('.env', config.protectedFiles) : false;
    if (!isProtected) {
      risks.push({
        category: 'environment',
        level: 'high',
        file: '.env',
        message: '.env file detected - not listed in protectedFiles',
        messageKey: 'risks.envFileFound',
        recommendation: 'Add .env to protectedFiles in .repo-seatbelt.json',
        recommendationKey: 'recommendations.addEnvToProtected',
      });
    }
  }

  if (envStatus.hasEnvFile && !envStatus.hasEnvExample) {
    risks.push({
      category: 'environment',
      level: 'medium',
      message: '.env.example is missing',
      messageKey: 'risks.envExampleMissing',
      recommendation: 'Create .env.example and document all environment variables',
      recommendationKey: 'recommendations.createEnvExample',
    });
  }

  if (envStatus.missingFromExample.length > 0) {
    risks.push({
      category: 'environment',
      level: 'medium',
      message: `Env vars used in code but missing from .env.example: ${envStatus.missingFromExample.slice(0, 3).join(', ')}${envStatus.missingFromExample.length > 3 ? ` +${envStatus.missingFromExample.length - 3} more` : ''}`,
      messageKey: 'risks.missingFromExample',
      recommendation: 'Add missing variables to .env.example',
    });
  }

  for (const key of envStatus.suspiciousPublicKeys) {
    risks.push({
      category: 'environment',
      level: 'high',
      message: `Suspicious secret key may be exposed via public env prefix: ${key}`,
      messageKey: 'risks.suspiciousPublicKey',
    });
  }

  // ── Database risks ─────────────────────────────────────────────────────────
  if (dbResult.hasMigrations) {
    const isProtected = config ? dbResult.migrationPaths.some(mp =>
      isPatternCovered(mp, config.protectedFiles) ||
      isPatternCovered(mp + '/index', config.protectedFiles)
    ) : false;
    if (!isProtected) {
      risks.push({
        category: 'database',
        level: 'high',
        message: 'Database migrations found but not in protectedFiles',
        messageKey: 'risks.dbMigrationsUnprotected',
        recommendation: 'Add migrations folder to protectedFiles',
        recommendationKey: 'recommendations.addMigrationsToProtected',
      });
    }
  }

  // ── Auth risks ─────────────────────────────────────────────────────────────
  if (authResult.hasAuthFiles) {
    const isProtected = config ? authResult.authPaths.some(ap =>
      isPatternCovered(ap, config.approvalRequired)
    ) : false;
    if (!isProtected) {
      risks.push({
        category: 'auth',
        level: 'high',
        message: 'Auth-related files found but not in approvalRequired',
        messageKey: 'risks.authFilesUnprotected',
        recommendation: 'Add auth folder to approvalRequired',
        recommendationKey: 'recommendations.addAuthToApproval',
      });
    }
  }

  // ── Payment risks ──────────────────────────────────────────────────────────
  if (paymentResult.hasPaymentFiles) {
    const isProtected = config ? paymentResult.paymentPaths.some(pp =>
      isPatternCovered(pp, config.approvalRequired)
    ) : false;
    if (!isProtected) {
      risks.push({
        category: 'payment',
        level: 'high',
        message: 'Payment-related files found but not in approvalRequired',
        messageKey: 'risks.paymentFilesUnprotected',
        recommendation: 'Add payment folder to approvalRequired',
        recommendationKey: 'recommendations.addPaymentToApproval',
      });
    }
  }

  // ── AI Rules risks ─────────────────────────────────────────────────────────
  if (!aiRulesStatus.hasConfig) {
    risks.push({
      category: 'ai-rules',
      level: 'high',
      message: '.repo-seatbelt.json not found - no safety config',
      messageKey: 'risks.noConfig',
      recommendation: 'Run repo-seatbelt init',
      recommendationKey: 'recommendations.runInit',
    });
  }

  if (!aiRulesStatus.hasAGENTSMD) {
    risks.push({
      category: 'ai-rules',
      level: 'high',
      message: 'No AGENTS.md found - AI agents have no safety rules',
      messageKey: 'risks.noAgentsMd',
      recommendation: 'Run repo-seatbelt rules to generate AI safety rule files',
      recommendationKey: 'recommendations.runRules',
    });
  }

  if (!aiRulesStatus.hasCLAUDEMD) {
    risks.push({
      category: 'ai-rules',
      level: 'low',
      message: 'No CLAUDE.md found - Claude Code has no safety rules',
      messageKey: 'risks.noCLAUDEMd',
      recommendation: 'Run repo-seatbelt rules to generate AI safety rule files',
      recommendationKey: 'recommendations.runRules',
    });
  }

  // ── Production config risks ────────────────────────────────────────────────
  for (const pf of prodResult.productionFiles) {
    const isProtected = config ? isPatternCovered(pf, [...config.protectedFiles, ...config.approvalRequired]) : false;
    if (!isProtected && (pf.endsWith('.json') || pf.endsWith('.toml') || pf.endsWith('.yaml') || pf.endsWith('.yml'))) {
      risks.push({
        category: 'production',
        level: 'medium',
        file: pf,
        message: `Production config file found but not protected: ${pf}`,
        messageKey: 'risks.prodConfigUnprotected',
      });
    }
  }

  // ── Risky scripts ──────────────────────────────────────────────────────────
  for (const script of projectInfo.riskyScripts) {
    risks.push({
      category: 'dependency',
      level: 'medium',
      message: `package.json script may be dangerous: "${script}"`,
      messageKey: 'risks.riskyScript',
      messageParams: { script },
    });
  }

  // ── Documentation risks ────────────────────────────────────────────────────
  if (!projectInfo.hasTests) {
    risks.push({
      category: 'documentation',
      level: 'low',
      message: 'No test files detected - risky for AI-assisted changes',
      messageKey: 'risks.noTests',
      recommendation: 'Add tests before letting AI agents modify your code',
      recommendationKey: 'recommendations.addTests',
    });
  }

  if (!projectInfo.hasReadme) {
    risks.push({
      category: 'documentation',
      level: 'low',
      message: 'No README.md found',
      messageKey: 'risks.noReadme',
    });
  }

  const score = calculateScore({
    aiRulesStatus,
    envStatus,
    projectInfo,
    config,
    dbHasMigrations: dbResult.hasMigrations,
    authHasFiles: authResult.hasAuthFiles,
    paymentHasFiles: paymentResult.hasPaymentFiles,
  });

  return {
    score,
    risks,
    projectInfo,
    aiRulesStatus,
    envStatus,
    config,
    timestamp: new Date().toISOString(),
  };
}

export { DEFAULT_IGNORED_PATHS };
