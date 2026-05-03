import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { t, setLang } from '../i18n';
import { Lang } from '../types';
import { readConfig } from '../config';
import { DEFAULT_CONFIG } from '../types';
import { generateClaudeMd } from '../generators/claude-md';
import { generateAgentsMd } from '../generators/agents-md';
import { generateCursorRules } from '../generators/cursor-rules';
import { generateWindsurfRules } from '../generators/windsurf-rules';
import { generateAiderConventions } from '../generators/aider-conventions';
import { generateClineRules } from '../generators/cline-rules';
import { generateZedRules } from '../generators/zed-rules';
import { printHeader } from '../display/renderer';

interface RulesOptions {
  lang?: string;
  tool?: string;
  all?: boolean;
  json?: boolean;
}

const TOOL_CHOICES = [
  { title: 'Claude Code (CLAUDE.md)', value: 'claude' },
  { title: 'Generic AGENTS.md', value: 'agents' },
  { title: 'Cursor (.cursorrules)', value: 'cursor' },
  { title: 'Windsurf (.windsurfrules)', value: 'windsurf' },
  { title: 'Aider (CONVENTIONS.md)', value: 'aider' },
  { title: 'Cline (.clinerules)', value: 'cline' },
  { title: 'Zed (.rules)', value: 'zed' },
  { title: 'All of the above', value: 'all' },
];

const ALL_TOOLS = ['claude', 'agents', 'cursor', 'windsurf', 'aider', 'cline', 'zed'];

interface ToolSpec {
  filename: string;
  generate: (cfg: ReturnType<typeof readConfig> extends infer C ? Exclude<C, null> : never, lang: Lang) => string;
}

const TOOL_SPECS: Record<string, ToolSpec> = {
  claude:   { filename: 'CLAUDE.md',       generate: (c, l) => generateClaudeMd(c, l) },
  agents:   { filename: 'AGENTS.md',       generate: (c, l) => generateAgentsMd(c, l) },
  cursor:   { filename: '.cursorrules',    generate: (c, l) => generateCursorRules(c, l) },
  windsurf: { filename: '.windsurfrules',  generate: (c, l) => generateWindsurfRules(c, l) },
  aider:    { filename: 'CONVENTIONS.md',  generate: (c, l) => generateAiderConventions(c, l) },
  cline:    { filename: '.clinerules',     generate: (c, l) => generateClineRules(c, l) },
  zed:      { filename: '.rules',          generate: (c, l) => generateZedRules(c, l) },
};

function safeWrite(filePath: string, content: string, silent = false): boolean {
  let backedUp = false;
  if (fs.existsSync(filePath)) {
    const backup = filePath + '.bak';
    fs.copyFileSync(filePath, backup);
    backedUp = true;
    if (!silent) console.log(chalk.dim(`  ·  Backup saved: ${path.basename(backup)}`));
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return backedUp;
}

export async function rulesCommand(options: RulesOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd) ?? { ...DEFAULT_CONFIG };
  const lang = ((options.lang as Lang) || config.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader(t('rules.title'));

  let tools: string[] = [];

  if (options.all || options.tool === 'all') {
    tools = [...ALL_TOOLS];
  } else if (options.tool) {
    tools = options.tool.split(',').map(s => s.trim()).filter(Boolean);
  } else if (options.json) {
    tools = [...ALL_TOOLS];
  } else {
    const answer = await prompts({
      type: 'multiselect',
      name: 'tools',
      message: t('rules.selectTools'),
      choices: TOOL_CHOICES,
      min: 1,
    });
    if (!answer.tools?.length) {
      console.log(chalk.dim('  Cancelled.'));
      return;
    }
    if (answer.tools.includes('all')) {
      tools = [...ALL_TOOLS];
    } else {
      tools = answer.tools as string[];
    }
  }

  const written: { tool: string; file: string; backedUp: boolean }[] = [];
  const unknown: string[] = [];

  if (!options.json) console.log();

  for (const tool of tools) {
    const spec = TOOL_SPECS[tool];
    if (!spec) { unknown.push(tool); continue; }
    const content = spec.generate(config, lang);
    const filePath = path.join(cwd, spec.filename);
    const backedUp = safeWrite(filePath, content, options.json);
    written.push({ tool, file: spec.filename, backedUp });
    if (!options.json) console.log(chalk.green('  ✓  ') + spec.filename);
  }

  if (options.json) {
    console.log(JSON.stringify({ written, unknown }, null, 2));
    return;
  }

  if (unknown.length) {
    console.log(chalk.yellow(`  ⚠  Unknown tools: ${unknown.join(', ')}`));
  }
  console.log();
  console.log(chalk.bold.green('  ' + t('rules.done')));
  console.log();
}
