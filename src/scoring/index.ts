import { AIRulesStatus, EnvStatus, ProjectInfo, RepoSeatbeltConfig, ScoreCheckpoint } from '../types';
import picomatch from 'picomatch';

interface ScoreInput {
  aiRulesStatus: AIRulesStatus;
  envStatus: EnvStatus;
  projectInfo: ProjectInfo;
  config: RepoSeatbeltConfig | null;
  dbHasMigrations: boolean;
  authHasFiles: boolean;
  paymentHasFiles: boolean;
}

function isCovered(filePath: string, patterns: string[]): boolean {
  if (!patterns.length) return false;
  return patterns.some(p => {
    try {
      return picomatch(p)(filePath);
    } catch {
      return filePath.startsWith(p.replace('/**', '').replace('**/', ''));
    }
  });
}

export function calculateScore(input: ScoreInput): number {
  const { aiRulesStatus, envStatus, projectInfo, config } = input;

  const checkpoints: ScoreCheckpoint[] = [
    // AI Rules presence
    {
      name: 'config',
      weight: 10,
      passed: aiRulesStatus.hasConfig,
      label: '.repo-seatbelt.json exists',
    },
    {
      name: 'agentsMd',
      weight: 8,
      passed: aiRulesStatus.hasAGENTSMD,
      label: 'AGENTS.md exists',
    },
    {
      name: 'claudeMd',
      weight: 5,
      passed: aiRulesStatus.hasCLAUDEMD,
      label: 'CLAUDE.md exists',
    },
    // Env safety
    {
      name: 'envExample',
      weight: 10,
      passed: envStatus.hasEnvExample || !envStatus.hasEnvFile,
      label: '.env.example exists',
    },
    {
      name: 'envProtected',
      weight: 8,
      passed: !envStatus.hasEnvFile || (config !== null && isCovered('.env', config.protectedFiles)),
      label: '.env is protected',
    },
    {
      name: 'envConsistency',
      weight: 5,
      passed: envStatus.missingFromExample.length === 0,
      label: 'No env vars missing from .env.example',
    },
    // Database safety
    {
      name: 'migrationsProtected',
      weight: 7,
      passed: !input.dbHasMigrations || (config !== null && (
        isCovered('prisma/migrations', config.protectedFiles) ||
        isCovered('migrations', config.protectedFiles) ||
        config.protectedFiles.some(p => p.includes('migration'))
      )),
      label: 'Migrations are protected',
    },
    // Auth safety
    {
      name: 'authApproval',
      weight: 7,
      passed: !input.authHasFiles || (config !== null && config.approvalRequired.some(p =>
        p.includes('auth') || p.includes('middleware')
      )),
      label: 'Auth files have approval rule',
    },
    // Payment safety
    {
      name: 'paymentApproval',
      weight: 7,
      passed: !input.paymentHasFiles || (config !== null && config.approvalRequired.some(p =>
        p.includes('payment') || p.includes('billing') || p.includes('stripe')
      )),
      label: 'Payment files have approval rule',
    },
    // Dangerous commands
    {
      name: 'blockedCommands',
      weight: 5,
      passed: config !== null && config.blockedCommands.length > 0,
      label: 'Dangerous commands listed',
    },
    // Package scripts
    {
      name: 'noRiskyScripts',
      weight: 5,
      passed: projectInfo.riskyScripts.length === 0,
      label: 'No risky package scripts',
    },
    // Documentation
    {
      name: 'hasReadme',
      weight: 3,
      passed: projectInfo.hasReadme,
      label: 'README.md exists',
    },
    {
      name: 'hasTests',
      weight: 5,
      passed: projectInfo.hasTests,
      label: 'Tests exist',
    },
    {
      name: 'isGitRepo',
      weight: 3,
      passed: projectInfo.isGitRepo,
      label: 'Git repository',
    },
    // No suspicious public keys
    {
      name: 'noSuspiciousKeys',
      weight: 5,
      passed: envStatus.suspiciousPublicKeys.length === 0,
      label: 'No suspicious public env keys',
    },
  ];

  const totalWeight = checkpoints.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = checkpoints.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);

  return Math.round((earnedWeight / totalWeight) * 100);
}

export function getScoreLabel(score: number, lang: 'en' | 'tr' = 'en'): string {
  if (lang === 'tr') {
    if (score >= 80) return 'Güvenli';
    if (score >= 60) return 'Dikkat gerekiyor';
    if (score >= 40) return 'Riskli';
    return 'AI agent için hazır değil';
  }
  if (score >= 80) return 'Safe';
  if (score >= 60) return 'Needs attention';
  if (score >= 40) return 'Risky';
  return 'Not ready for AI agents';
}

export function getScoreColor(score: number): 'green' | 'yellow' | 'red' | 'redBright' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'red';
  return 'redBright';
}
