import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { ProjectInfo, DEFAULT_IGNORED_PATHS } from '../types';

export async function detectProject(cwd: string): Promise<ProjectInfo> {
  const pkgPath = path.join(cwd, 'package.json');
  let pkgJson: Record<string, unknown> = {};
  if (fs.existsSync(pkgPath)) {
    try {
      pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
    } catch { /* ignore */ }
  }

  const deps = {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  } as Record<string, string>;

  const framework: string[] = [];

  if (deps['next']) framework.push('Next.js');
  if (deps['react'] && !deps['next']) framework.push('React');
  if (deps['vite']) framework.push('Vite');
  if (deps['express']) framework.push('Express');
  if (deps['fastify']) framework.push('Fastify');
  if (deps['@nestjs/core']) framework.push('NestJS');
  if (deps['@remix-run/node'] || deps['@remix-run/react']) framework.push('Remix');
  if (deps['astro']) framework.push('Astro');
  if (deps['nuxt']) framework.push('Nuxt');
  if (deps['expo']) framework.push('Expo');
  if (deps['react-native']) framework.push('React Native');
  if (deps['@sveltejs/kit'] || deps['svelte']) framework.push('Svelte');
  if (deps['@angular/core']) framework.push('Angular');
  if (deps['vue']) framework.push('Vue');

  // Database
  const databases: string[] = [];
  if (deps['@prisma/client'] || deps['prisma']) databases.push('Prisma');
  if (deps['drizzle-orm']) databases.push('Drizzle');
  if (deps['typeorm']) databases.push('TypeORM');
  if (deps['sequelize']) databases.push('Sequelize');
  if (deps['mongoose']) databases.push('MongoDB');
  if (deps['@supabase/supabase-js']) databases.push('Supabase');
  if (deps['firebase'] || deps['firebase-admin']) databases.push('Firebase');

  // Tech
  if (deps['typescript'] || fs.existsSync(path.join(cwd, 'tsconfig.json'))) {
    framework.push('TypeScript');
  }
  if (deps['tailwindcss']) framework.push('Tailwind CSS');
  if (deps['@shadcn/ui'] || deps['shadcn-ui']) framework.push('shadcn/ui');

  // Auth providers
  const authProviders: string[] = [];
  if (deps['next-auth']) authProviders.push('NextAuth');
  if (deps['@auth/core']) authProviders.push('Auth.js');
  if (deps['@clerk/nextjs'] || deps['@clerk/clerk-sdk-node']) authProviders.push('Clerk');
  if (deps['@supabase/supabase-js']) authProviders.push('Supabase Auth');
  if (deps['firebase']) authProviders.push('Firebase Auth');
  if (deps['auth0']) authProviders.push('Auth0');
  if (deps['jsonwebtoken'] || deps['jose']) authProviders.push('JWT');
  if (deps['passport']) authProviders.push('Passport');
  if (deps['better-auth']) authProviders.push('Better Auth');

  // Payment providers
  const paymentProviders: string[] = [];
  if (deps['stripe']) paymentProviders.push('Stripe');
  if (deps['@paddle/paddle-js']) paymentProviders.push('Paddle');
  if (deps['lemonsqueezy']) paymentProviders.push('Lemon Squeezy');
  if (deps['paypal']) paymentProviders.push('PayPal');

  // Check for Turkish payment providers in source files
  const srcFiles = await fg(['**/*.{ts,tsx,js,jsx}'], {
    cwd,
    ignore: DEFAULT_IGNORED_PATHS,
    absolute: false,
  });
  const firstFewFiles = srcFiles.slice(0, 100);
  for (const file of firstFewFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), 'utf-8');
      if (/iyzico/i.test(content)) { if (!paymentProviders.includes('İyzico')) paymentProviders.push('İyzico'); }
      if (/paytr/i.test(content)) { if (!paymentProviders.includes('PayTR')) paymentProviders.push('PayTR'); }
      if (/moka/i.test(content)) { if (!paymentProviders.includes('Moka')) paymentProviders.push('Moka'); }
    } catch { /* ignore */ }
  }

  // Package manager
  let packageManager = 'npm';
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
  else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) packageManager = 'yarn';
  else if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) packageManager = 'bun';

  // Test files
  const testPatterns = ['**/*.test.*', '**/*.spec.*', '**/__tests__/**', '**/tests/**', '**/_test/**'];
  const testFiles = await fg(testPatterns, {
    cwd,
    ignore: DEFAULT_IGNORED_PATHS,
    absolute: false,
  });
  const hasTests = testFiles.length > 0;

  // Readme
  const hasReadme = fs.existsSync(path.join(cwd, 'README.md')) ||
    fs.existsSync(path.join(cwd, 'readme.md'));

  // Git
  const isGitRepo = fs.existsSync(path.join(cwd, '.git'));

  // Monorepo
  const isMonorepo = fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(cwd, 'lerna.json')) ||
    fs.existsSync(path.join(cwd, 'turbo.json')) ||
    (typeof pkgJson.workspaces === 'object');

  const hasTypeScript = deps['typescript'] !== undefined ||
    fs.existsSync(path.join(cwd, 'tsconfig.json'));

  // Risky scripts
  const riskyScripts: string[] = [];
  const scripts = (pkgJson.scripts ?? {}) as Record<string, string>;
  const RISKY_SCRIPT_PATTERNS = [
    /prisma\s+migrate\s+reset/i,
    /prisma\s+db\s+push\s+--force/i,
    /db:reset/i,
    /drop/i,
    /truncate/i,
    /rm\s+-rf/i,
    /sequelize.*db:drop/i,
    /knex.*migrate.*rollback.*--all/i,
  ];
  for (const [name, cmd] of Object.entries(scripts)) {
    if (RISKY_SCRIPT_PATTERNS.some(p => p.test(cmd))) {
      riskyScripts.push(`${name}: ${cmd}`);
    }
  }

  return {
    path: cwd,
    framework,
    packageManager,
    hasTypeScript,
    hasTests,
    hasReadme,
    isGitRepo,
    isMonorepo,
    databases,
    authProviders,
    paymentProviders,
    riskyScripts,
  };
}
