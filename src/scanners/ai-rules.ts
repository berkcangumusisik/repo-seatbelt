import * as fs from 'fs';
import * as path from 'path';
import { AIRulesStatus } from '../types';

export function scanAIRules(cwd: string): AIRulesStatus {
  const hasConfig = fs.existsSync(path.join(cwd, '.repo-seatbelt.json'));

  const hasCLAUDEMD = fs.existsSync(path.join(cwd, 'CLAUDE.md'));

  const hasAGENTSMD = fs.existsSync(path.join(cwd, 'AGENTS.md'));

  const hasCursorRules =
    fs.existsSync(path.join(cwd, '.cursorrules')) ||
    fs.existsSync(path.join(cwd, '.cursor/rules')) ||
    fs.existsSync(path.join(cwd, '.cursor', 'rules'));

  return {
    hasConfig,
    hasCLAUDEMD,
    hasAGENTSMD,
    hasCursorRules,
  };
}
