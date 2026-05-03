<div align="center">

# 🔒 repo-seatbelt

### A safety layer for AI coding agents. Before they touch your repo.

[![npm version](https://img.shields.io/npm/v/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![npm downloads](https://img.shields.io/npm/dm/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![License: MIT](https://img.shields.io/badge/license-MIT-%230f172a?labelColor=%231e293b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-%230f172a?labelColor=%231e293b&style=flat-square)](package.json)
[![MCP Ready](https://img.shields.io/badge/MCP-ready-%2310b981?labelColor=%231e293b&style=flat-square)](#mcp-server--runtime-guardrails)
[![Languages](https://img.shields.io/badge/languages-EN%20%2F%20TR-%230f172a?labelColor=%231e293b&style=flat-square)](README.tr.md)

<br/>

**AI coding agents are powerful. Maybe too powerful.**

`repo-seatbelt` scans your project, detects risky areas, generates safety rules for **7 AI tools**,
exposes a **runtime MCP guardrail server**, ships a **pre-commit hook** + **GitHub Action**, and gives your
repo an **AI Safety Score** out of 100 — in your language.

<br/>

> **Before AI touches your repo, buckle up.**

<br/>

[Quick Start](#quick-start) · [Commands](#commands) · [MCP Server](#mcp-server--runtime-guardrails) · [Presets](#presets) · [CI / Hooks](#cicd--git-hooks) · [Score System](#ai-safety-score) · [Türkçe](README.tr.md)

</div>

---

## Table of Contents

1. [Why this exists](#why-this-exists)
2. [Quick Start](#quick-start)
3. [What you get](#what-you-get)
4. [Supported AI Tools](#supported-ai-tools)
5. [Commands](#commands)
6. [Presets](#presets)
7. [MCP Server — Runtime Guardrails](#mcp-server--runtime-guardrails)
8. [CI/CD & Git Hooks](#cicd--git-hooks)
9. [Watch Mode](#watch-mode)
10. [Audit Mode](#audit-mode)
11. [AI Safety Score](#ai-safety-score)
12. [Dashboard & Reports](#dashboard--reports)
13. [Configuration Reference](#configuration-reference)
14. [JSON Output](#json-output)
15. [Architecture](#architecture)
16. [FAQ](#faq)
17. [Roadmap](#roadmap)
18. [Contributing](#contributing)
19. [Star History](#star-history)
20. [License](#license)

---

## Why this exists

AI coding tools like Claude Code, Cursor, Codex, Gemini CLI, Windsurf, Aider, Cline, and Zed are
genuinely useful. But they don't know what's sacred in your repo. Without guardrails, an agent might:

- 🔥 Overwrite your `.env` with test values
- 🔥 Delete database migration files that can't come back
- 🔥 Rewrite your auth middleware "to clean it up"
- 🔥 Run `prisma migrate reset` on a production database
- 🔥 Add 12 new dependencies to fix one bug
- 🔥 Refactor 30 files when you asked to change one string

**`repo-seatbelt` solves this with a four-layer defense:**

| Layer | What it does | Where it runs |
|------|--------------|---------------|
| **1. Static rules** | Generates `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`, `CONVENTIONS.md`, `.clinerules`, `.rules` so agents read your boundaries on session start. | `npx repo-seatbelt rules` |
| **2. Runtime MCP guardrail** | A live MCP server agents call at decision-time: `check_file_access`, `check_command`, `list_protections`. | `npx repo-seatbelt mcp` |
| **3. Pre-commit hook** | Blocks high-risk commits locally before they leave the developer's machine. | `npx repo-seatbelt install-hooks` |
| **4. CI gate** | GitHub Action posts a PR comment with the safety score and fails on high-risk diffs. | `npx repo-seatbelt ci` |

---

## Quick Start

```bash
# Zero install
npx repo-seatbelt init                          # interactive setup
npx repo-seatbelt init --preset nextjs-stripe   # or apply a preset

# Day-to-day
npx repo-seatbelt scan                          # AI Safety Score + risks
npx repo-seatbelt diff                          # review AI changes pre-commit
npx repo-seatbelt doctor                        # prioritized action plan

# Lock it down
npx repo-seatbelt install-hooks                 # block high-risk commits
npx repo-seatbelt ci                            # add a GitHub Action
npx repo-seatbelt mcp --print                   # configure runtime MCP
```

---

## What you get

```text
.repo-seatbelt.json     ← machine-readable config (the source of truth)
CLAUDE.md               ← rules for Claude Code
AGENTS.md               ← rules for any AGENTS.md-aware tool (Codex, Aider, Gemini)
CONVENTIONS.md          ← rules for Aider
.cursorrules            ← rules for Cursor
.windsurfrules          ← rules for Windsurf
.clinerules             ← rules for Cline
.rules                  ← rules for Zed AI assistant
.git/hooks/pre-commit   ← (optional) blocks high-risk commits
.github/workflows/      ← (optional) CI gate with PR comments
docs/repo-seatbelt-report.md       ← markdown safety report
docs/repo-seatbelt-dashboard.html  ← interactive HTML dashboard
```

Plus a **runtime MCP server** any agent can call mid-session.

---

## Supported AI Tools

| Tool | Rule file | Generator | Runtime MCP |
|------|-----------|-----------|------------|
| **Claude Code / Claude Desktop** | `CLAUDE.md` | ✅ | ✅ |
| **Cursor** | `.cursorrules` | ✅ | — |
| **Codex / ChatGPT** | `AGENTS.md` | ✅ | — |
| **Gemini CLI** | `AGENTS.md` | ✅ | — |
| **Windsurf** | `.windsurfrules` | ✅ | — |
| **Aider** | `CONVENTIONS.md` | ✅ | — |
| **Cline** | `.clinerules` | ✅ | — |
| **Zed AI** | `.rules` | ✅ | — |

> Any MCP-capable host (Claude Desktop, Claude Code, Continue.dev, etc.) can talk to the
> repo-seatbelt MCP server for live, decision-time enforcement.

---

## Commands

<details open>
<summary><b><code>init</code></b> — bootstrap the project</summary>

```bash
repo-seatbelt init                              # interactive
repo-seatbelt init --yes                        # non-interactive defaults
repo-seatbelt init --preset nextjs-stripe       # apply a preset
repo-seatbelt init --lang tr                    # Turkish output
```

Writes `.repo-seatbelt.json`, `CLAUDE.md`, `AGENTS.md` (and `.cursorrules` if you select Cursor).

</details>

<details>
<summary><b><code>scan</code></b> — AI Safety Score + risk list</summary>

```bash
repo-seatbelt scan
repo-seatbelt scan --json            # machine-readable
repo-seatbelt scan --verbose         # full details
repo-seatbelt scan --no-color        # plain output for logs
```

Detects framework, package manager, databases, auth & payment providers, env hygiene,
production config, and AI rule files. Outputs a 0–100 score and a categorized risk list.

</details>

<details>
<summary><b><code>doctor</code></b> — prioritized action plan</summary>

```bash
repo-seatbelt doctor
repo-seatbelt doctor --json
```

Same data as `scan`, but rendered as a prioritized to-do list. Best for first-time setup.

</details>

<details>
<summary><b><code>diff</code></b> — review AI changes before committing</summary>

```bash
repo-seatbelt diff                   # human-readable
repo-seatbelt diff --json            # used by the pre-commit hook
```

Inspects current git changes. Flags `.env` mods, auth/payment touches, migration changes,
new dependencies, large refactors, and missing test coverage. Returns an `overallRisk` of
`info | low | medium | high`.

</details>

<details>
<summary><b><code>rules</code></b> — generate AI rule files</summary>

```bash
repo-seatbelt rules                                    # interactive picker
repo-seatbelt rules --all                              # all 7 tools
repo-seatbelt rules --tool claude,cursor,windsurf      # comma-separated
repo-seatbelt rules --tool aider                       # single
repo-seatbelt rules --json                             # all + JSON manifest
```

Existing files are backed up to `*.bak` before overwrite.

</details>

<details>
<summary><b><code>protect</code></b> — manage protected paths</summary>

```bash
repo-seatbelt protect                          # list current protections
repo-seatbelt protect "config/secrets/**"      # add a glob
repo-seatbelt protect --json                   # JSON output
```

</details>

<details>
<summary><b><code>check-command</code></b> — validate a shell command</summary>

```bash
repo-seatbelt check-command "rm -rf node_modules"
repo-seatbelt check-command "git push --force" --json
```

Returns `safe | dangerous` with reasons. Combines built-in patterns with your
configured `blockedCommands`.

</details>

<details>
<summary><b><code>install-hooks</code></b> — pre-commit guardrail</summary>

```bash
repo-seatbelt install-hooks                   # install git pre-commit hook
repo-seatbelt install-hooks --force           # overwrite existing hook (.bak saved)
repo-seatbelt install-hooks --uninstall       # remove the hook
```

The installed hook runs `repo-seatbelt diff --json` and **blocks the commit** when
`overallRisk === "high"`. Bypassable with `git commit --no-verify` if needed.

</details>

<details>
<summary><b><code>ci</code></b> — GitHub Actions workflow</summary>

```bash
repo-seatbelt ci                              # writes .github/workflows/seatbelt.yml
repo-seatbelt ci --force                      # overwrite
repo-seatbelt ci --output ./custom.yml        # custom path
```

The generated workflow:

- runs `scan` on every push and PR
- runs `diff` on PRs and posts a sticky comment with the safety score and findings
- fails CI when the diff is `overallRisk === "high"`

</details>

<details>
<summary><b><code>watch</code></b> — auto-update rules as the repo evolves</summary>

```bash
repo-seatbelt watch                           # default 500ms debounce
repo-seatbelt watch --debounce 1500
```

Detects new sensitive folders (`auth/`, `payment/`, `stripe/`, …) and `.env*` files
appearing in the repo, updates `.repo-seatbelt.json`, and **regenerates every rule file
that already exists**. Zero extra dependencies — uses Node's built-in `fs.watch`.

</details>

<details>
<summary><b><code>audit</code></b> — git history forensics</summary>

```bash
repo-seatbelt audit                                 # last 500 commits
repo-seatbelt audit --since "1 month ago"
repo-seatbelt audit --limit 1000 --json
```

Scans git history for:

- `.env` files committed
- protected files touched
- traces of `blockedCommands` in commit subjects
- "large refactor" commits (≥25 files)

Excellent for adopting `repo-seatbelt` on an existing repo to see what AI (or humans) did
before you locked things down.

</details>

<details>
<summary><b><code>update</code></b> — regenerate rule files with diff preview</summary>

```bash
repo-seatbelt update                          # show diffs, ask for confirmation
repo-seatbelt update --yes                    # apply without prompting
repo-seatbelt update --diff-only              # show diffs, don't write
repo-seatbelt update --json                   # machine output
```

Recomputes every rule file from `.repo-seatbelt.json` and prints `+N -M` summaries with
sample lines. Existing files are backed up to `*.bak`.

</details>

<details>
<summary><b><code>mcp</code></b> — runtime MCP server</summary>

```bash
repo-seatbelt mcp                             # run the stdio MCP server
repo-seatbelt mcp --print                     # print client-config snippet
repo-seatbelt mcp --print --json              # JSON snippet
```

See [MCP Server](#mcp-server--runtime-guardrails) for full details.

</details>

<details>
<summary><b><code>badge</code></b> · <b><code>report</code></b> · <b><code>dashboard</code></b></summary>

```bash
repo-seatbelt badge                           # README badge from latest scan
repo-seatbelt badge --score 92 --json
repo-seatbelt report                          # docs/repo-seatbelt-report.md
repo-seatbelt dashboard                       # docs/repo-seatbelt-dashboard.html
```

</details>

---

## Presets

Skip the busywork. Apply a preset that knows what's sensitive in your stack.

| Preset | What it adds |
|--------|--------------|
| `nextjs-stripe` | Protects `prisma/schema.prisma`, `.env.local`, `.env.production`. Approval-gates Stripe webhook handlers, `app/api/auth/**`, `next.config.*`. Blocks `stripe trigger` against prod. |
| `django` | Protects `**/migrations/**`, `settings/production.py`. Approval-gates `auth/`, `payments/`, `manage.py`. Blocks `manage.py flush` and `reset_db`. |
| `rails` | Protects `db/migrate/**`, `db/schema.rb`, `config/credentials.yml.enc`, `config/master.key`. Blocks `rails db:drop`/`db:reset`. |
| `expo` | Protects `app.json`, `eas.json`, `google-services.json`, `GoogleService-Info.plist`. Blocks `eas build --profile production`, `expo publish`. |
| `monorepo` | Adds workspace-aware protection for `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `packages/*/.env*`. |
| `fastapi` | Protects `alembic/versions/**`, `.env`. Blocks `alembic downgrade base`. |

```bash
npx repo-seatbelt init --preset nextjs-stripe
```

> Presets are additive — they merge into your config rather than replacing it.

---

## MCP Server — Runtime Guardrails

Static rule files only help if the agent reads them. The **MCP server** is a live JSON-RPC
service that AI agents (Claude Desktop, Claude Code, Continue.dev, any MCP host) can call
**at decision-time** to ask:

> *"Is it safe for me to edit this file?"*
> *"Is this shell command allowed in this repo?"*

### Available tools

| Tool | Purpose |
|------|---------|
| `check_file_access(path, operation)` | Returns `allow` \| `ask` \| `block`. Call before any edit. |
| `check_command(command)` | Returns `safe` \| `warn` \| `block` with reasons. Call before any shell run. |
| `list_protections()` | Lists protected files, approval-required globs, blocked commands, and active mode. |
| `scan_repo()` | Runs the full safety scan and returns the score + risks. |

### Wire it into Claude Desktop

```bash
npx repo-seatbelt mcp --print
```

Add the printed snippet to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or the equivalent on your platform:

```json
{
  "mcpServers": {
    "repo-seatbelt": {
      "command": "npx",
      "args": ["-y", "repo-seatbelt-mcp"]
    }
  }
}
```

### Wire it into Claude Code

```bash
claude mcp add repo-seatbelt -- npx -y repo-seatbelt-mcp
```

### Smoke-test it manually

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_command","arguments":{"command":"rm -rf /"}}}' \
  | npx repo-seatbelt mcp
```

You'll get back something like:

```json
{ "decision": "block", "reasons": ["Recursive force delete", "Matches blocked command: \"rm -rf\""] }
```

> The MCP server is **dependency-free** — minimal JSON-RPC over stdio, no SDK weight.

---

## CI/CD & Git Hooks

### Pre-commit hook (local, before push)

```bash
npx repo-seatbelt install-hooks
```

Now every `git commit` runs `repo-seatbelt diff --json`. If `overallRisk === "high"`,
the commit is blocked with a clear message. To bypass intentionally:

```bash
git commit --no-verify -m "intentional high-risk commit"
```

### GitHub Action (remote, on every PR)

```bash
npx repo-seatbelt ci
git add .github/workflows/seatbelt.yml
git commit -m "chore: add repo-seatbelt CI"
```

The workflow:

1. Runs `scan` on every push/PR
2. Runs `diff` on PRs and posts a sticky comment with the score + top high-risk findings
3. **Fails the check** if the diff is high-risk

Example PR comment:

```
## 🛡️ repo-seatbelt report

**Score:** 71/100 — 4 risk(s) found

### High-risk findings
- .env file modified (`.env.production`)
- Auth files were modified (`src/auth/middleware.ts`)

**Diff risk:** high
- .env files were modified
- Auth files were modified
```

---

## Watch Mode

```bash
npx repo-seatbelt watch
```

Keeps your rule files in sync as the repo grows. Runs forever, debounces filesystem
events, and auto-regenerates `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, etc. when:

- a new `auth/`, `payment/`, `stripe/`, `billing/` folder appears under repo root or `src/`, `app/`, `lib/`
- a new `.env*` file is created in the repo root

Output:

```
  [14:23:01] Updated config + 5 rule file(s)
     +approval: src/payment/**
     +protected: .env.staging
```

---

## Audit Mode

```bash
npx repo-seatbelt audit --since "3 months ago"
```

Scans git history for risky patterns. Useful when:

- adopting `repo-seatbelt` on an existing repo and you want to see past damage
- doing a security review on a contractor's branch
- generating evidence for a postmortem

Sample output:

```
  🔴  env-committed (2)
     2024-09-12 a3f81de alice: .env.local
     2024-11-01 9c1d2bb bob:   .env.production

  🟠  protected-touched (5)
     2025-02-04 4d8e7a1 ai-bot: prisma/migrations/20240204_drop_users/migration.sql
     ...

  🟡  large-refactor (1)
     2025-03-18 8b22f9c claude: 47 files changed
```

---

## AI Safety Score

`repo-seatbelt` rates your repo against a checklist that signals "AI-friendly":

| Range | Verdict | Meaning |
|-------|---------|---------|
| **80 – 100** | 🟢 AI Safe | Solid guardrails. Most agents will behave responsibly. |
| **60 – 79** | 🟡 Needs attention | A few risk areas — review and patch before a long AI session. |
| **40 – 59** | 🟠 Risky | Significant gaps. Run `doctor` and follow the action plan. |
| **0 – 39** | 🔴 Not AI Ready | Don't let agents loose without `init` first. |

The score is computed from weighted checkpoints (env hygiene, AI rule files, dangerous
scripts, framework risk, monorepo structure, …). Run `scan --verbose` to see the
breakdown.

### Add a badge

```bash
npx repo-seatbelt badge
```

Copy-paste the markdown into your README.

---

## Dashboard & Reports

```bash
npx repo-seatbelt report     # docs/repo-seatbelt-report.md
npx repo-seatbelt dashboard  # docs/repo-seatbelt-dashboard.html
```

The HTML dashboard is fully static (no build step, no JS framework) and shows your score,
risk breakdown, project info, and configured protections at a glance. Drop it into your
internal docs or open it locally with any browser.

---

## Configuration Reference

`.repo-seatbelt.json`:

```jsonc
{
  "version": "1",
  "mode": "strict",                   // "solo" | "team" | "strict"
  "language": "en",                   // "en" | "tr"
  "projectType": "nextjs",
  "selectedTools": ["claude", "cursor"],

  "protectedFiles": [                 // never read/edit/delete without approval
    ".env", ".env.*",
    "prisma/migrations/**",
    "config/credentials.yml.enc"
  ],

  "approvalRequired": [               // edits require explicit human approval
    "auth/**", "lib/auth/**",
    "payment/**", "stripe/**",
    "middleware.ts"
  ],

  "blockedCommands": [                // shell commands the AI must refuse
    "rm -rf",
    "DROP TABLE",
    "prisma migrate reset",
    "git push --force"
  ],

  "ignoredPaths": [],                 // glob patterns the scanner skips
  "riskThresholds": {                 // score → verdict mapping
    "low": 60, "medium": 40, "high": 0
  },
  "presets": ["nextjs-stripe"]
}
```

Edit by hand or via `repo-seatbelt protect` / `repo-seatbelt init`.

---

## JSON Output

Every command supports `--json` for scripting and CI:

```bash
repo-seatbelt scan --json | jq '.score'
repo-seatbelt diff --json | jq '.overallRisk'
repo-seatbelt audit --json --since "1 week ago" | jq '.findings | length'
repo-seatbelt rules --json | jq '.written[] | .file'
repo-seatbelt badge --score 92 --json
```

This is what powers the pre-commit hook and the GitHub Action.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                  .repo-seatbelt.json                         │
│           (single source of truth — your contract)           │
└──────────────────────────────────────────────────────────────┘
            │
            ├─────────────► Static generators (init / rules / update)
            │                  ├─ CLAUDE.md
            │                  ├─ AGENTS.md
            │                  ├─ .cursorrules / .windsurfrules
            │                  ├─ CONVENTIONS.md / .clinerules / .rules
            │
            ├─────────────► Scanners (scan / doctor / diff / audit)
            │                  ├─ env hygiene
            │                  ├─ auth / payment / db detection
            │                  ├─ production config detection
            │                  └─ AI-rules presence + git history
            │
            ├─────────────► Enforcement layer
            │                  ├─ pre-commit hook (install-hooks)
            │                  ├─ GitHub Action (ci)
            │                  └─ watch (auto-regen)
            │
            └─────────────► MCP server (mcp)
                               ├─ check_file_access
                               ├─ check_command
                               ├─ list_protections
                               └─ scan_repo
```

---

## FAQ

<details>
<summary><b>Does this slow my agent down?</b></summary>

The static rule files are read once at session start — zero runtime cost. The MCP server
adds a few milliseconds per `check_file_access` call, which is negligible compared to a
single LLM token.

</details>

<details>
<summary><b>Can the AI bypass these rules?</b></summary>

The static rules are advisory — well-behaved agents respect them. For hard enforcement,
combine the **MCP server** (decision-time) with the **pre-commit hook** (machine-time). The
hook is bypassable with `--no-verify`, but that's a deliberate human action you can audit.

</details>

<details>
<summary><b>Why not just write CLAUDE.md by hand?</b></summary>

You can. But `repo-seatbelt` keeps **7 different rule files** in sync from one config,
ships an MCP server, gates CI, and audits history. That's hours of work per project,
saved.

</details>

<details>
<summary><b>What about non-JS projects?</b></summary>

The CLI is Node-based, but the *rules it generates* are language-agnostic markdown. Every
preset (`django`, `rails`, `fastapi`, `expo`, …) is for non-Node stacks.

</details>

<details>
<summary><b>How do I uninstall everything?</b></summary>

```bash
npx repo-seatbelt install-hooks --uninstall
rm .repo-seatbelt.json CLAUDE.md AGENTS.md .cursorrules .windsurfrules \
   CONVENTIONS.md .clinerules .rules
rm -rf .github/workflows/seatbelt.yml
```

</details>

---

## Roadmap

- [x] Static rule generators (Claude, Cursor, AGENTS.md)
- [x] Generators for Windsurf, Aider, Cline, Zed
- [x] Pre-commit hook installer
- [x] GitHub Action generator with PR comments
- [x] Watch mode (auto-regen on filesystem changes)
- [x] Git-history audit
- [x] Update command with diff preview
- [x] Project presets (Next.js + Stripe, Django, Rails, Expo, FastAPI, Monorepo)
- [x] **MCP runtime guardrail server**
- [x] JSON output for every command
- [ ] VS Code extension (in-editor warnings + dashboard)
- [ ] Telemetry opt-in (anonymous "guardrails caught X" stats)
- [ ] Custom rule plugins
- [ ] More languages (German, French, Spanish)
- [ ] GitLab CI / Bitbucket Pipelines templates

---

## Contributing

Issues and PRs are welcome. Please open an issue before submitting large changes.

```bash
git clone https://github.com/berkcangumusisik/repo-seatbelt.git
cd repo-seatbelt
npm install
npm run build
node dist/cli.js scan
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Share

If `repo-seatbelt` saved your repo from a bad AI session:

> Just ran `npx repo-seatbelt scan` before letting Claude Code loose on my codebase.
> Found 3 high-risk areas I had no idea about. Then wired up the MCP server and the
> pre-commit hook so my agent literally *can't* touch `.env` or run `prisma migrate reset`.
> This should be mandatory before any AI coding session.
>
> github.com/berkcangumusisik/repo-seatbelt

---

## Star History

<a href="https://www.star-history.com/?repos=berkcangumusisik%2Frepo-seatbelt&type=date&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
 </picture>
</a>

---

## License

[MIT](LICENSE) — use it, fork it, build on it.

<div align="center">

Made with care for everyone shipping code with AI.
**Star this repo if it saved your bacon. ⭐**

</div>
