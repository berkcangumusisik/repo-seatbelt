import fg from 'fast-glob';
import { DEFAULT_IGNORED_PATHS } from '../types';

export interface AuthScanResult {
  hasAuthFiles: boolean;
  authPaths: string[];
}

const AUTH_PATTERNS = [
  'auth/**',
  '**/auth/**',
  'lib/auth/**',
  'src/auth/**',
  'app/auth/**',
  'pages/api/auth/**',
  'app/api/auth/**',
  '**/middleware.ts',
  '**/middleware.js',
  '**/auth.ts',
  '**/auth.js',
  '**/session.ts',
  '**/session.js',
  '**/*auth*.ts',
  '**/*auth*.tsx',
  '**/*jwt*.ts',
  '**/[...nextauth]/**',
  '**/*session*.ts',
];

export async function scanAuth(cwd: string): Promise<AuthScanResult> {
  const files = await fg(AUTH_PATTERNS, {
    cwd,
    ignore: DEFAULT_IGNORED_PATHS,
    absolute: false,
  });

  // Deduplicate directories
  const authDirs = new Set<string>();
  for (const file of files) {
    const parts = file.split('/');
    if (parts.length > 1) {
      // Find auth-related parent directory
      for (let i = 0; i < parts.length - 1; i++) {
        if (/auth|session|jwt/i.test(parts[i])) {
          authDirs.add(parts.slice(0, i + 1).join('/'));
          break;
        }
      }
    }
    if (parts.length === 1 || /auth|session|jwt|middleware/i.test(parts[parts.length - 1])) {
      authDirs.add(file);
    }
  }

  const authPaths = [...authDirs].slice(0, 5);

  return {
    hasAuthFiles: files.length > 0,
    authPaths,
  };
}
