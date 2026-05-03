# Changelog

## [1.1.0] — 2026-05-03

### Added — runtime guardrails

- **`mcp` command + `repo-seatbelt-mcp` bin** — minimal stdio JSON-RPC MCP server exposing `check_file_access`, `check_command`, `list_protections`, `scan_repo`. Zero new dependencies.
- **`install-hooks` command** — installs a git `pre-commit` hook that runs `diff --json` and blocks high-risk commits. Supports `--force` and `--uninstall`.
- **`ci` command** — generates `.github/workflows/seatbelt.yml`. The workflow runs `scan` on every push/PR, posts a sticky PR comment with the safety score and findings, and fails CI on high-risk diffs.
- **`watch` command** — auto-regenerates rule files when sensitive folders (`auth/`, `payment/`, `stripe/`, …) or new `.env*` files appear. Uses Node's built-in `fs.watch` — no extra dependencies.
- **`audit` command** — scans git history for committed `.env` files, touches to protected files, blocked-command traces in commit subjects, and large refactors (≥25 files). Supports `--since` and `--limit`.
- **`update` command** — regenerates rule files from the current config with diff preview. Supports `--yes`, `--diff-only`, `--json`. Backs up existing files to `*.bak`.

### Added — new agent generators

- **Windsurf** (`.windsurfrules`)
- **Aider** (`CONVENTIONS.md`)
- **Cline** (`.clinerules`)
- **Zed AI** (`.rules`)

`rules` command now supports comma-separated `--tool claude,cursor,windsurf,...`.

### Added — project presets

`init --preset <name>` ships with six stack-aware presets:

- `nextjs-stripe` — Next.js + Stripe + Prisma
- `django` — Django with management commands and migrations
- `rails` — Rails with ActiveRecord
- `expo` — React Native / Expo mobile apps
- `monorepo` — Turborepo / Nx / pnpm workspaces
- `fastapi` — FastAPI with Alembic migrations

Presets are additive — they merge into existing config rather than replacing it.

### Added — JSON output everywhere

`--json` is now supported on every command (`protect`, `rules`, `badge`, `install-hooks`, `ci`, `audit`, `update`, `mcp --print`). Pre-commit hook and GitHub Action consume this output.

### Changed

- README rewritten end-to-end (EN + TR) with TOC, command reference, MCP setup guide, CI/hook setup, architecture diagram, FAQ, and themed Star History chart.
- New keywords in `package.json`: `mcp`, `model-context-protocol`, `windsurf`, `aider`, `cline`, `zed`, `github-actions`.

## [1.0.0] — 2026-05-02

Initial release.

- `init`, `scan`, `doctor`, `diff`, `rules`, `protect`, `check-command`, `badge`, `report`, `dashboard` commands.
- Generators for Claude Code (`CLAUDE.md`), generic agents (`AGENTS.md`), Cursor (`.cursorrules`).
- AI Safety Score (0–100) with weighted checkpoints.
- English and Turkish output support.
