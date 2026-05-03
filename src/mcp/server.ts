#!/usr/bin/env node
/**
 * Minimal MCP server (JSON-RPC over stdio) exposing repo-seatbelt as runtime
 * guardrails for AI agents (Claude Desktop, Claude Code, etc.).
 *
 * Implements just enough of the MCP spec: initialize, tools/list, tools/call.
 */

import * as readline from 'readline';
import * as path from 'path';
import picomatch from 'picomatch';
import { readConfig } from '../config';
import { runScan } from '../scanners';

const PROTOCOL_VERSION = '2024-11-05';

interface JsonRpcReq {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: unknown;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function send(msg: object): void {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function sendResult(id: JsonRpcReq['id'], result: unknown): void {
  send({ jsonrpc: '2.0', id, result });
}

function sendError(id: JsonRpcReq['id'], code: number, message: string): void {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

const TOOLS = [
  {
    name: 'check_file_access',
    description: 'Check whether the AI agent is allowed to read/write a given file path. Returns one of: allow, ask, block. Call this BEFORE editing or creating any file. If "block" is returned, do not proceed. If "ask", request explicit human approval first.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to the repo root' },
        operation: { type: 'string', enum: ['read', 'write', 'delete'], description: 'Intended operation' },
      },
      required: ['path'],
    },
  },
  {
    name: 'check_command',
    description: 'Check whether a shell command is safe to run in this repo. Returns safe | warn | block. Call this BEFORE executing any shell command.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The full shell command' },
      },
      required: ['command'],
    },
  },
  {
    name: 'list_protections',
    description: 'List all protected files, approval-required globs, and blocked commands configured in .repo-seatbelt.json.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'scan_repo',
    description: 'Run a full repo safety scan and return the score plus a list of risks.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const DANGEROUS_COMMAND_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /\brm\s+-rf\b/i, reason: 'Recursive force delete' },
  { re: /\bDROP\s+(TABLE|DATABASE)\b/i, reason: 'SQL DROP' },
  { re: /\bTRUNCATE\b/i, reason: 'SQL TRUNCATE' },
  { re: /\bDELETE\s+FROM\s+\w+\s*(?!.*WHERE)/i, reason: 'DELETE without WHERE' },
  { re: /\bprisma\s+migrate\s+reset\b/i, reason: 'Prisma migrate reset' },
  { re: /\bprisma\s+db\s+push\s+--force-reset\b/i, reason: 'Prisma force reset' },
  { re: /\bgit\s+push\b.*--force\b/i, reason: 'Force git push' },
  { re: /\bgit\s+push\s+-f\b/i, reason: 'Force git push' },
  { re: /\bgit\s+reset\s+--hard\b/i, reason: 'Hard git reset' },
  { re: /\bdocker\s+volume\s+rm\b/i, reason: 'Docker volume remove' },
  { re: /\bvercel\s+env\s+rm\b/i, reason: 'Vercel env delete' },
  { re: />\s*\.env\b/i, reason: 'Overwriting .env' },
];

function normalizePath(cwd: string, p: string): string {
  if (path.isAbsolute(p)) return path.relative(cwd, p) || p;
  return p;
}

function checkFileAccess(cwd: string, filePath: string, operation: string): { decision: 'allow' | 'ask' | 'block'; reason?: string; matched?: string } {
  const config = readConfig(cwd);
  if (!config) return { decision: 'allow', reason: 'no config found' };
  const rel = normalizePath(cwd, filePath);

  for (const pattern of config.protectedFiles) {
    if (picomatch.isMatch(rel, pattern, { dot: true })) {
      return { decision: 'block', reason: `Path matches protected pattern (${operation || 'access'})`, matched: pattern };
    }
  }

  for (const pattern of config.approvalRequired) {
    if (picomatch.isMatch(rel, pattern, { dot: true })) {
      return { decision: 'ask', reason: 'Path requires explicit approval', matched: pattern };
    }
  }

  return { decision: 'allow' };
}

function checkCommand(cwd: string, cmd: string): { decision: 'safe' | 'warn' | 'block'; reasons: string[] } {
  const config = readConfig(cwd);
  const reasons: string[] = [];
  for (const dp of DANGEROUS_COMMAND_PATTERNS) {
    if (dp.re.test(cmd)) reasons.push(dp.reason);
  }
  if (config) {
    for (const blocked of config.blockedCommands) {
      if (cmd.toLowerCase().includes(blocked.toLowerCase())) {
        const reason = `Matches blocked command: "${blocked}"`;
        if (!reasons.includes(reason)) reasons.push(reason);
      }
    }
  }
  if (!reasons.length) return { decision: 'safe', reasons: [] };
  return { decision: 'block', reasons };
}

function asTextContent(text: string): JsonValue {
  return { content: [{ type: 'text', text }] };
}

async function handleToolCall(name: string, args: Record<string, unknown>, cwd: string): Promise<JsonValue> {
  switch (name) {
    case 'check_file_access': {
      const p = String(args.path ?? '');
      const op = String(args.operation ?? 'write');
      if (!p) return asTextContent('Error: path is required');
      const result = checkFileAccess(cwd, p, op);
      return asTextContent(JSON.stringify(result, null, 2));
    }
    case 'check_command': {
      const command = String(args.command ?? '');
      if (!command) return asTextContent('Error: command is required');
      const result = checkCommand(cwd, command);
      return asTextContent(JSON.stringify(result, null, 2));
    }
    case 'list_protections': {
      const config = readConfig(cwd);
      if (!config) return asTextContent('No .repo-seatbelt.json found in working directory.');
      return asTextContent(JSON.stringify({
        protectedFiles: config.protectedFiles,
        approvalRequired: config.approvalRequired,
        blockedCommands: config.blockedCommands,
        mode: config.mode,
      }, null, 2));
    }
    case 'scan_repo': {
      const result = await runScan(cwd);
      return asTextContent(JSON.stringify({
        score: result.score,
        risks: result.risks,
        timestamp: result.timestamp,
      }, null, 2));
    }
    default:
      return asTextContent(`Unknown tool: ${name}`);
  }
}

function startServer(): void {
  const cwd = process.cwd();
  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let req: JsonRpcReq;
    try {
      req = JSON.parse(trimmed) as JsonRpcReq;
    } catch {
      sendError(null, -32700, 'Parse error');
      return;
    }

    const { id, method, params } = req;

    try {
      switch (method) {
        case 'initialize':
          sendResult(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: { name: 'repo-seatbelt', version: '1.1.0' },
          });
          return;

        case 'initialized':
        case 'notifications/initialized':
          // Notification: no response
          return;

        case 'tools/list':
          sendResult(id, { tools: TOOLS });
          return;

        case 'tools/call': {
          const p = (params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
          const result = await handleToolCall(p.name ?? '', p.arguments ?? {}, cwd);
          sendResult(id, result);
          return;
        }

        case 'ping':
          sendResult(id, {});
          return;

        default:
          // Ignore unknown notifications, error on requests
          if (id !== undefined && id !== null) {
            sendError(id, -32601, `Method not found: ${method}`);
          }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendError(id ?? null, -32603, `Internal error: ${msg}`);
    }
  });

  rl.on('close', () => process.exit(0));

  // Log startup to stderr (stdout is reserved for JSON-RPC)
  process.stderr.write('[repo-seatbelt-mcp] listening on stdio\n');
}

if (require.main === module) {
  startServer();
}

export { startServer };
