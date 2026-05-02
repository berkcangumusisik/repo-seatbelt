export type Lang = 'en' | 'tr';
export type RiskLevel = 'high' | 'medium' | 'low' | 'info';
export type SafetyMode = 'solo' | 'team' | 'strict';

export type RiskCategory =
  | 'environment'
  | 'database'
  | 'auth'
  | 'payment'
  | 'production'
  | 'ai-rules'
  | 'dependency'
  | 'refactor'
  | 'documentation';

export interface RiskItem {
  category: RiskCategory;
  level: RiskLevel;
  file?: string;
  message: string;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
  recommendation?: string;
  recommendationKey?: string;
}

export interface AIRulesStatus {
  hasConfig: boolean;
  hasCLAUDEMD: boolean;
  hasAGENTSMD: boolean;
  hasCursorRules: boolean;
}

export interface EnvStatus {
  hasEnvFile: boolean;
  hasEnvExample: boolean;
  envFiles: string[];
  missingFromExample: string[];
  suspiciousPublicKeys: string[];
}

export interface ProjectInfo {
  path: string;
  framework: string[];
  packageManager: string;
  hasTypeScript: boolean;
  hasTests: boolean;
  hasReadme: boolean;
  isGitRepo: boolean;
  isMonorepo: boolean;
  databases: string[];
  authProviders: string[];
  paymentProviders: string[];
  riskyScripts: string[];
}

export interface ScanResult {
  score: number;
  risks: RiskItem[];
  projectInfo: ProjectInfo;
  aiRulesStatus: AIRulesStatus;
  envStatus: EnvStatus;
  config: RepoSeatbeltConfig | null;
  timestamp: string;
}

export interface DiffResult {
  changedFiles: string[];
  deletedFiles: string[];
  newFiles: string[];
  newDependencies: string[];
  hasLockFileChanges: boolean;
  hasEnvChanges: boolean;
  hasAuthChanges: boolean;
  hasPaymentChanges: boolean;
  hasDbMigrationChanges: boolean;
  hasProdConfigChanges: boolean;
  hasTestChanges: boolean;
  overallRisk: RiskLevel;
  riskReasons: string[];
}

export interface RepoSeatbeltConfig {
  version: string;
  mode: SafetyMode;
  language: Lang;
  projectType: string;
  selectedTools: string[];
  protectedFiles: string[];
  approvalRequired: string[];
  blockedCommands: string[];
  ignoredPaths: string[];
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  presets: string[];
}

export interface ScoreCheckpoint {
  name: string;
  weight: number;
  passed: boolean;
  label?: string;
}

export const DEFAULT_IGNORED_PATHS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/.git/**',
  '**/.yarn/**',
  '**/.turbo/**',
  '**/.cache/**',
  '**/out/**',
  '**/.output/**',
];

export const DEFAULT_CONFIG: RepoSeatbeltConfig = {
  version: '1',
  mode: 'solo',
  language: 'en',
  projectType: 'unknown',
  selectedTools: [],
  protectedFiles: [
    '.env',
    '.env.*',
    'prisma/migrations/**',
    'migrations/**',
    '**/migrations/**',
  ],
  approvalRequired: [
    'auth/**',
    'lib/auth/**',
    'src/auth/**',
    'payment/**',
    'lib/payment/**',
    'src/payment/**',
    'stripe/**',
    'middleware.ts',
    'middleware.js',
  ],
  blockedCommands: [
    'rm -rf',
    'DROP TABLE',
    'TRUNCATE',
    'prisma migrate reset',
    'prisma db push --force-reset',
    'git push --force',
    'docker volume rm',
    'vercel env rm',
    'railway volume delete',
  ],
  ignoredPaths: [],
  riskThresholds: {
    low: 60,
    medium: 40,
    high: 0,
  },
  presets: [],
};
