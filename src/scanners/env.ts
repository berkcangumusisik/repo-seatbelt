import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { EnvStatus, DEFAULT_IGNORED_PATHS } from '../types';

const ENV_VAR_PATTERNS = [
  /process\.env\.([A-Z_][A-Z0-9_]*)/g,
  /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
  /process\.env\['([A-Z_][A-Z0-9_]*)'\]/g,
  /process\.env\["([A-Z_][A-Z0-9_]*)"\]/g,
];

const SUSPICIOUS_PUBLIC_PREFIXES = ['NEXT_PUBLIC_', 'VITE_', 'REACT_APP_'];
const SUSPICIOUS_KEY_PATTERNS = [
  /SECRET/i, /KEY/i, /TOKEN/i, /PASSWORD/i, /PRIVATE/i, /STRIPE/i, /JWT/i
];

function parseEnvFile(content: string): Set<string> {
  const vars = new Set<string>();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      vars.add(trimmed.slice(0, eq).trim());
    }
  }
  return vars;
}

export async function scanEnv(cwd: string): Promise<EnvStatus> {
  // Find .env files
  const envFiles = await fg(['.env', '.env.*', '**/.env', '**/.env.*'], {
    cwd,
    dot: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    absolute: false,
  });

  const filteredEnvFiles = envFiles.filter(f => !f.includes('node_modules') && !f.includes('.git'));
  const hasEnvFile = filteredEnvFiles.some(f => {
    const base = path.basename(f);
    return base === '.env' || base === '.env.local' || base === '.env.production' || base === '.env.development';
  });

  const hasEnvExample = filteredEnvFiles.some(f => {
    const base = path.basename(f);
    return base === '.env.example' || base === '.env.sample' || base === '.env.template';
  });

  // Parse .env.example
  let exampleVars = new Set<string>();
  const exampleFile = filteredEnvFiles.find(f => {
    const base = path.basename(f);
    return base === '.env.example' || base === '.env.sample' || base === '.env.template';
  });
  if (exampleFile) {
    try {
      const content = fs.readFileSync(path.join(cwd, exampleFile), 'utf-8');
      exampleVars = parseEnvFile(content);
    } catch { /* ignore */ }
  }

  // Scan source files for env variable usage
  const srcFiles = await fg(['**/*.{ts,tsx,js,jsx,mjs,cjs}'], {
    cwd,
    ignore: DEFAULT_IGNORED_PATHS,
    absolute: false,
  });

  const usedVars = new Set<string>();
  const suspiciousPublicKeys: string[] = [];

  for (const file of srcFiles.slice(0, 200)) {
    let content: string;
    try {
      content = fs.readFileSync(path.join(cwd, file), 'utf-8');
    } catch { continue; }

    for (const pattern of ENV_VAR_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];
        usedVars.add(varName);

        // Check suspicious public keys
        for (const prefix of SUSPICIOUS_PUBLIC_PREFIXES) {
          if (varName.startsWith(prefix)) {
            const suffix = varName.slice(prefix.length);
            if (SUSPICIOUS_KEY_PATTERNS.some(p => p.test(suffix))) {
              if (!suspiciousPublicKeys.includes(varName)) {
                suspiciousPublicKeys.push(varName);
              }
            }
          }
        }
      }
    }
  }

  // Find vars used in code but missing from example
  const missingFromExample: string[] = [];
  if (hasEnvExample) {
    for (const v of usedVars) {
      if (!exampleVars.has(v) && !v.startsWith('NODE_') && v !== 'NODE_ENV' && v !== 'PORT') {
        missingFromExample.push(v);
      }
    }
  }

  return {
    hasEnvFile,
    hasEnvExample,
    envFiles: filteredEnvFiles,
    missingFromExample: missingFromExample.slice(0, 10),
    suspiciousPublicKeys: suspiciousPublicKeys.slice(0, 5),
  };
}
