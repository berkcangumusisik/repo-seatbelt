import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';

export interface DatabaseScanResult {
  hasMigrations: boolean;
  migrationPaths: string[];
  hasPrisma: boolean;
  hasDrizzle: boolean;
  hasTypeORM: boolean;
  hasSequelize: boolean;
  hasSQLFiles: boolean;
}

export async function scanDatabase(cwd: string): Promise<DatabaseScanResult> {
  const ignore = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'];

  // Check for migration directories
  const migrationDirs = await fg(
    [
      'prisma/migrations',
      'prisma/migrations/**',
      'migrations',
      'migrations/**',
      '**/migrations',
      '**/migrations/**',
      'db/migrations/**',
      'database/migrations/**',
      'drizzle/**',
    ],
    { cwd, ignore, onlyFiles: false, markDirectories: true }
  );

  const hasMigrations = migrationDirs.length > 0;
  const migrationPaths = [...new Set(migrationDirs.map(d => {
    const parts = d.split('/');
    if (parts.includes('migrations')) {
      return parts.slice(0, parts.indexOf('migrations') + 1).join('/');
    }
    return parts[0];
  }))].slice(0, 5);

  const hasPrisma = fs.existsSync(path.join(cwd, 'prisma/schema.prisma')) ||
    fs.existsSync(path.join(cwd, 'prisma'));

  const hasDrizzle = fs.existsSync(path.join(cwd, 'drizzle.config.ts')) ||
    fs.existsSync(path.join(cwd, 'drizzle.config.js')) ||
    fs.existsSync(path.join(cwd, 'drizzle'));

  const hasTypeORM = fs.existsSync(path.join(cwd, 'ormconfig.ts')) ||
    fs.existsSync(path.join(cwd, 'ormconfig.js')) ||
    fs.existsSync(path.join(cwd, 'ormconfig.json'));

  const hasSequelize = fs.existsSync(path.join(cwd, '.sequelizerc'));

  // Check for raw SQL migration files
  const sqlFiles = await fg(['**/*.sql', '**/*.SQL'], {
    cwd,
    ignore,
    absolute: false,
  });
  const hasSQLFiles = sqlFiles.length > 0;

  return {
    hasMigrations,
    migrationPaths,
    hasPrisma,
    hasDrizzle,
    hasTypeORM,
    hasSequelize,
    hasSQLFiles,
  };
}
