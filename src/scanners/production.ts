import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';

export interface ProductionScanResult {
  hasCICD: boolean;
  hasDocker: boolean;
  hasProductionConfigs: boolean;
  productionFiles: string[];
}

const PROD_CONFIG_FILES = [
  'vercel.json',
  'netlify.toml',
  'render.yaml',
  'railway.toml',
  'fly.toml',
  '.railway.json',
  'heroku.yml',
  'app.yaml',
  'serverless.yml',
  'serverless.yaml',
  'wrangler.toml',
  'wrangler.json',
];

const DOCKER_FILES = [
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'docker-compose.prod.yml',
  '.dockerignore',
];

export async function scanProduction(cwd: string): Promise<ProductionScanResult> {
  const ignore = ['**/node_modules/**', '**/.git/**'];

  // CI/CD
  const ciFiles = await fg([
    '.github/workflows/**',
    '.gitlab-ci.yml',
    '.circleci/config.yml',
    'Jenkinsfile',
    '.travis.yml',
    'bitbucket-pipelines.yml',
    '.drone.yml',
    'azure-pipelines.yml',
  ], { cwd, ignore, absolute: false });

  const hasCICD = ciFiles.length > 0;

  // Docker
  const hasDocker = DOCKER_FILES.some(f => fs.existsSync(path.join(cwd, f)));

  // Production config files
  const productionFiles: string[] = [];
  for (const f of PROD_CONFIG_FILES) {
    if (fs.existsSync(path.join(cwd, f))) {
      productionFiles.push(f);
    }
  }

  // Also check for env-specific files
  const envProdFiles = await fg(['.env.production', '.env.prod', '.env.staging'], {
    cwd,
    dot: true,
    ignore,
    absolute: false,
  });
  productionFiles.push(...envProdFiles);

  if (hasDocker) {
    productionFiles.push(...DOCKER_FILES.filter(f => fs.existsSync(path.join(cwd, f))));
  }

  return {
    hasCICD,
    hasDocker,
    hasProductionConfigs: productionFiles.length > 0,
    productionFiles: [...new Set(productionFiles)].slice(0, 10),
  };
}
