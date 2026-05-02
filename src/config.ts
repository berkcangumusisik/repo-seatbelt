import * as fs from 'fs';
import * as path from 'path';
import { RepoSeatbeltConfig, DEFAULT_CONFIG } from './types';

export const CONFIG_FILE = '.repo-seatbelt.json';

export function getConfigPath(cwd: string = process.cwd()): string {
  return path.join(cwd, CONFIG_FILE);
}

export function readConfig(cwd: string = process.cwd()): RepoSeatbeltConfig | null {
  const configPath = getConfigPath(cwd);
  if (!fs.existsSync(configPath)) return null;
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RepoSeatbeltConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return null;
  }
}

export function writeConfig(config: RepoSeatbeltConfig, cwd: string = process.cwd()): void {
  const configPath = getConfigPath(cwd);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function configExists(cwd: string = process.cwd()): boolean {
  return fs.existsSync(getConfigPath(cwd));
}

export function mergeConfig(
  existing: RepoSeatbeltConfig | null,
  updates: Partial<RepoSeatbeltConfig>
): RepoSeatbeltConfig {
  const base = existing ?? { ...DEFAULT_CONFIG };
  return {
    ...base,
    ...updates,
    protectedFiles: dedup([
      ...(base.protectedFiles ?? []),
      ...(updates.protectedFiles ?? []),
    ]),
    approvalRequired: dedup([
      ...(base.approvalRequired ?? []),
      ...(updates.approvalRequired ?? []),
    ]),
    blockedCommands: dedup([
      ...(base.blockedCommands ?? []),
      ...(updates.blockedCommands ?? []),
    ]),
    selectedTools: dedup([
      ...(base.selectedTools ?? []),
      ...(updates.selectedTools ?? []),
    ]),
  };
}

function dedup<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
