import { RepoSeatbeltConfig } from '../types';

export interface Preset {
  name: string;
  title: string;
  description: string;
  projectType: string;
  protectedFiles?: string[];
  approvalRequired?: string[];
  blockedCommands?: string[];
}

export const PRESETS: Record<string, Preset> = {
  'nextjs-stripe': {
    name: 'nextjs-stripe',
    title: 'Next.js + Stripe SaaS',
    description: 'Next.js app with Stripe payments and a Prisma/Postgres database.',
    projectType: 'nextjs',
    protectedFiles: [
      '.env.local', '.env.production',
      'prisma/schema.prisma',
    ],
    approvalRequired: [
      'app/api/webhooks/stripe/**',
      'app/api/auth/**',
      'lib/stripe/**',
      'lib/billing/**',
      'next.config.*',
    ],
    blockedCommands: ['stripe trigger', 'stripe listen --forward-to-prod'],
  },
  'django': {
    name: 'django',
    title: 'Django',
    description: 'Django project with management commands and migrations.',
    projectType: 'django',
    protectedFiles: ['**/migrations/**', 'settings/production.py', 'settings/prod.py'],
    approvalRequired: ['**/auth/**', '**/payments/**', 'manage.py'],
    blockedCommands: ['python manage.py flush', 'python manage.py reset_db', 'python manage.py sqlflush'],
  },
  'rails': {
    name: 'rails',
    title: 'Ruby on Rails',
    description: 'Rails app with ActiveRecord migrations.',
    projectType: 'rails',
    protectedFiles: ['db/migrate/**', 'db/schema.rb', 'config/credentials.yml.enc', 'config/master.key'],
    approvalRequired: ['app/controllers/**/auth*', 'app/models/payment*', 'config/routes.rb'],
    blockedCommands: ['rails db:drop', 'rails db:reset', 'rake db:drop', 'rake db:reset'],
  },
  'expo': {
    name: 'expo',
    title: 'React Native / Expo',
    description: 'Expo / React Native mobile app.',
    projectType: 'reactnative',
    protectedFiles: ['app.json', 'eas.json', 'android/app/google-services.json', 'ios/GoogleService-Info.plist'],
    approvalRequired: ['app/_layout.tsx', 'app/(auth)/**', 'src/auth/**'],
    blockedCommands: ['eas build --profile production', 'expo publish'],
  },
  'monorepo': {
    name: 'monorepo',
    title: 'Monorepo (Turborepo / Nx / pnpm workspaces)',
    description: 'Multi-package monorepo. Adds workspace-aware protection.',
    projectType: 'monorepo',
    protectedFiles: ['turbo.json', 'nx.json', 'pnpm-workspace.yaml', 'packages/*/.env*'],
    approvalRequired: ['packages/*/package.json', 'apps/*/package.json'],
    blockedCommands: ['pnpm -r exec rm -rf', 'turbo prune --scope='],
  },
  'fastapi': {
    name: 'fastapi',
    title: 'FastAPI',
    description: 'FastAPI backend with Alembic migrations.',
    projectType: 'fastapi',
    protectedFiles: ['alembic/versions/**', '.env'],
    approvalRequired: ['app/auth/**', 'app/payments/**', 'app/main.py'],
    blockedCommands: ['alembic downgrade base', 'alembic stamp'],
  },
};

export function listPresets(): Preset[] {
  return Object.values(PRESETS);
}

export function applyPreset(config: RepoSeatbeltConfig, preset: Preset): RepoSeatbeltConfig {
  const dedup = <T,>(arr: T[]) => [...new Set(arr)];
  const next: RepoSeatbeltConfig = {
    ...config,
    projectType: preset.projectType || config.projectType,
    protectedFiles: dedup([...config.protectedFiles, ...(preset.protectedFiles ?? [])]),
    approvalRequired: dedup([...config.approvalRequired, ...(preset.approvalRequired ?? [])]),
    blockedCommands: dedup([...config.blockedCommands, ...(preset.blockedCommands ?? [])]),
    presets: dedup([...(config.presets ?? []), preset.name]),
  };
  return next;
}
