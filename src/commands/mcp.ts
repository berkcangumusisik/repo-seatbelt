import * as path from 'path';
import chalk from 'chalk';
import { Lang } from '../types';
import { readConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';
import { startServer } from '../mcp/server';

interface McpOptions {
  lang?: string;
  json?: boolean;
  print?: boolean;
}

export function mcpCommand(options: McpOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (options.print) {
    const cliPath = path.resolve(__dirname, '..', 'mcp', 'server.js');
    const snippet = {
      mcpServers: {
        'repo-seatbelt': {
          command: 'node',
          args: [cliPath],
          // For published versions, prefer:
          // command: 'npx', args: ['-y', 'repo-seatbelt-mcp']
        },
      },
    };
    if (options.json) {
      console.log(JSON.stringify(snippet, null, 2));
      return;
    }
    printHeader('MCP Configuration Snippet');
    console.log();
    console.log(chalk.dim('  Add to ~/.claude.json or your MCP client config:'));
    console.log();
    console.log(JSON.stringify(snippet, null, 2));
    console.log();
    console.log(chalk.dim('  Or, after publishing:'));
    console.log(chalk.cyan('    "repo-seatbelt": { "command": "npx", "args": ["-y", "repo-seatbelt-mcp"] }'));
    console.log();
    return;
  }

  // Run the server
  startServer();
}
