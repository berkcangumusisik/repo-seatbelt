<div align="center">

# 🔒 repo-seatbelt

### A safety layer for AI coding agents. Before they touch your repo.

[![npm version](https://img.shields.io/npm/v/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![License: MIT](https://img.shields.io/badge/license-MIT-%230f172a?labelColor=%231e293b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-%230f172a?labelColor=%231e293b&style=flat-square)](package.json)
[![Languages](https://img.shields.io/badge/languages-EN%20%2F%20TR-%230f172a?labelColor=%231e293b&style=flat-square)](#language-support)

<br/>

**AI coding agents are powerful. Maybe too powerful.**

`repo-seatbelt` scans your project, detects risky areas, generates safety rules for your AI tools,
and gives your repo an **AI Safety Score** out of 100.

<br/>

> **Before AI touches your repo, buckle up.**

<br/>

[Quick Start](#quick-start) · [Commands](#commands) · [Score System](#ai-safety-score) · [Dashboard](#dashboard) · [Turkish / Türkçe](README.tr.md)

</div>

---

## Why this exists

AI coding tools like Claude Code, Cursor, Codex, and Gemini CLI are genuinely useful. But they don't know what's sacred in your repo. Without guardrails, an agent might:

- Overwrite your `.env` with test values
- Delete database migration files that can't come back
- Rewrite your auth middleware "to clean it up"
- Run `prisma migrate reset` on a production database
- Add 12 new dependencies to fix one bug
- Refactor 30 files when you asked to change one string

`repo-seatbelt` solves this by creating a safety contract between you and your AI tools. It generates rule files that agents read automatically, flags dangerous areas before a session starts, and helps you review changes before they get committed.

---

## Quick Start

```bash
# No install needed
npx repo-seatbelt init    # set up safety rules
npx repo-seatbelt scan    # check your AI Safety Score
npx repo-seatbelt diff    # review AI changes before committing
```

---

## Example Output

```
  🔒  repo-seatbelt
     AI Safety Scan

  ─────────────────────────────────────────────────────
  PROJECT
  ─────────────────────────────────────────────────────
  Framework           Next.js · TypeScript · Prisma
  Package manager     pnpm
  Database            Prisma
  Auth                NextAuth
  Payments            Stripe

  ─────────────────────────────────────────────────────
  AI SAFETY SCORE
  ─────────────────────────────────────────────────────

       72 / 100
       ⚠  Needs attention

  ─────────────────────────────────────────────────────
  RISK SUMMARY
  ─────────────────────────────────────────────────────

  🔴  HIGH RISK  (2)

    ●  .env file detected - not listed in protectedFiles
       → Add .env to protectedFiles in .repo-seatbelt.json

    ●  No AGENTS.md found - AI agents have no safety rules
       → Run repo-seatbelt rules to generate AI safety rule files

  🟡  MEDIUM RISK  (1)

    ●  .env.example is missing

  🟢  LOW RISK  (1)

    ●  No test files detected - risky for AI-assisted changes
       → Add tests before letting AI agents modify your code

  ─────────────────────────────────────────────────────
  AI RULES STATUS
  ─────────────────────────────────────────────────────

  ✓  .repo-seatbelt.json     found
  ✗  CLAUDE.md               not found
  ✗  AGENTS.md               not found
  ✗  Cursor rules            not found

  ─────────────────────────────────────────────────────
  NEXT STEPS
  ─────────────────────────────────────────────────────

  1. Run repo-seatbelt init to set up safety rules.
  2. Create .env.example and document all environment variables.
  3. Run repo-seatbelt doctor for a detailed action plan.

  Scan complete.
```

---

## Installation

```bash
# Run without installing (recommended for one-time use)
npx repo-seatbelt scan

# Install globally
npm install -g repo-seatbelt

# Add as a dev dependency
npm install --save-dev repo-seatbelt
pnpm add -D repo-seatbelt
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `init` | Interactive setup: creates `.repo-seatbelt.json`, `CLAUDE.md`, `AGENTS.md`, optional `.cursorrules` |
| `scan` | Full safety scan - shows AI Safety Score, risks by category, AI rules status, next steps |
| `doctor` | Same scan but with a prioritized action plan and rollback checklist |
| `diff` | Analyzes uncommitted git changes after an AI session - flags risky files, new deps, large refactors |
| `rules` | Generates AI rule files for selected tools without running full init |
| `protect <pattern>` | Adds a file or glob pattern to `protectedFiles` in your config |
| `check-command <cmd>` | Checks if a shell command is dangerous before running it |
| `badge` | Generates a README badge from your current score |
| `report` | Writes a markdown safety report to `docs/repo-seatbelt-report.md` |
| `dashboard` | Generates an offline HTML dashboard at `docs/repo-seatbelt-dashboard.html` |

### Flags available on all commands

```
--lang en|tr     Output language (overrides config)
--json           Machine-readable JSON output
--no-color       Plain output for CI and pipes
--verbose        Show full details, no truncation
```

---

## AI Safety Score

Every scan produces a score from 0 to 100 based on weighted safety checkpoints.

| Checkpoint | Points |
|------------|--------|
| `.repo-seatbelt.json` present | 10 |
| `.env.example` present | 10 |
| `.env` is in `protectedFiles` | 8 |
| `AGENTS.md` present | 8 |
| Database migrations protected | 7 |
| Auth files in `approvalRequired` | 7 |
| Payment files in `approvalRequired` | 7 |
| `CLAUDE.md` present | 5 |
| Tests exist | 5 |
| No risky `package.json` scripts | 5 |
| No suspicious public env keys | 5 |
| Dangerous commands configured | 5 |
| Env vars consistent in `.env.example` | 5 |
| README present | 3 |
| Git repo | 3 |

**Score thresholds:**

| Score | Label |
|-------|-------|
| 80 - 100 | ✅ Safe |
| 60 - 79 | ⚠️ Needs attention |
| 40 - 59 | 🟠 Risky |
| 0 - 39 | 🔴 Not ready for AI agents |

---

## What it detects

**Risk categories and what triggers them:**

| Category | Detected signals |
|----------|-----------------|
| 🔴 Environment | `.env` not protected, missing `.env.example`, env vars missing from example, secrets exposed via `NEXT_PUBLIC_` |
| 🔴 Database | Prisma/Drizzle/TypeORM/Sequelize migrations not protected, SQL files present |
| 🔴 Auth | Auth files found but not in `approvalRequired` (NextAuth, Clerk, JWT, session, middleware) |
| 🔴 Payment | Payment files found but not in `approvalRequired` (Stripe, Paddle, Iyzico, PayTR, Moka) |
| 🟡 Production | Vercel, Netlify, Railway, Fly.io, Dockerfile, CI/CD configs not protected |
| 🟡 Dependencies | Lock file changed, new packages detected in diff |
| 🟡 Refactor | 10+ files changed (medium), 25+ files changed (high) |
| 🟢 AI Rules | Missing AGENTS.md, CLAUDE.md, Cursor rules |
| 🟢 Documentation | No tests, no README |

---

## Configuration

Running `repo-seatbelt init` creates `.repo-seatbelt.json` at your project root:

```json
{
  "version": "1",
  "mode": "solo",
  "language": "en",
  "projectType": "nextjs",
  "selectedTools": ["claude", "cursor"],
  "protectedFiles": [
    ".env",
    ".env.*",
    "prisma/migrations/**",
    "migrations/**"
  ],
  "approvalRequired": [
    "auth/**",
    "lib/auth/**",
    "payment/**",
    "src/payment/**",
    "middleware.ts"
  ],
  "blockedCommands": [
    "rm -rf",
    "DROP TABLE",
    "TRUNCATE",
    "prisma migrate reset",
    "prisma db push --force-reset",
    "git push --force",
    "docker volume rm",
    "vercel env rm"
  ],
  "ignoredPaths": []
}
```

### Safety modes

| Mode | Behavior |
|------|----------|
| `solo` | Helpful warnings, advisory tone. Good for personal projects. |
| `team` | Stronger approval requirements. Emphasizes PR review. |
| `strict` | Very conservative. All risky areas blocked by default. |

---

## Generated Files

### `CLAUDE.md`

Read automatically by Claude Code at the start of every session. Defines what Claude can and cannot touch, which commands are blocked, and which files require approval.

### `AGENTS.md`

Universal AI agent rules file. Supported by Claude Code, Codex, and agents following the AGENTS.md convention.

### `.cursorrules`

Cursor-specific rules file. Loaded automatically by the Cursor editor.

---

## Dangerous Command Check

Before running a risky command:

```bash
npx repo-seatbelt check-command "prisma migrate reset"
```

```
  ✗  This command is DANGEROUS.

  🔴  Prisma migrate reset
      Do not run this command without explicit approval.
```

```bash
npx repo-seatbelt check-command "git status"
```

```
  ✓  This command looks safe.
```

Works with: `rm -rf`, `DROP TABLE`, `TRUNCATE`, `DELETE FROM` (without WHERE), force push, `docker volume rm`, `vercel env rm`, and more.

---

## Diff Analysis

After an AI coding session, before you commit:

```bash
npx repo-seatbelt diff
```

```
  ─────────────────────────────────────────────────────
  AI DIFF ANALYZER
  ─────────────────────────────────────────────────────

  Changed files               14
  Deleted files               2
  New files                   3
  New dependencies            @radix-ui/react-dialog
  Lock file changed           yes
  .env files changed          no
  Auth files touched          yes
  Payment files touched       no
  DB migrations changed       no
  Production config changed   no
  Test files changed          no

  Overall risk                MEDIUM

  → Auth files were modified
  → 14 files changed

  ⚠  Risky changes detected - review carefully before committing.
```

---

## Dashboard

```bash
npx repo-seatbelt dashboard
npx repo-seatbelt dashboard --lang tr
```

Generates `docs/repo-seatbelt-dashboard.html` - a self-contained, offline-ready HTML page with:

- Visual score gauge with color coding
- High / medium / low risk cards
- Project info panel
- AI rules status table
- Protected files and blocked commands lists
- Interactive rollback checklist

No server, no CDN, no tracking, no external requests.

---

## Language Support

Every surface supports English and Turkish: CLI output, prompts, reports, and the dashboard.

```bash
repo-seatbelt scan --lang tr
repo-seatbelt doctor --lang tr
repo-seatbelt dashboard --lang tr
repo-seatbelt report --lang tr
```

Set permanently during `repo-seatbelt init` or in `.repo-seatbelt.json`:

```json
{ "language": "tr" }
```

Turkish README: [README.tr.md](README.tr.md)

---

## Turkish output preview

```
  🔒  repo-seatbelt
     AI Güvenlik Taraması

  ─────────────────────────────────────────────────────
  PROJE
  ─────────────────────────────────────────────────────
  Framework           Next.js · TypeScript · Prisma
  Paket yöneticisi    pnpm
  Veritabanı          Prisma
  Kimlik doğrulama    NextAuth
  Ödeme               Stripe

  ─────────────────────────────────────────────────────
  AI GÜVENLİK PUANI
  ─────────────────────────────────────────────────────

       72 / 100
       ⚠  Dikkat gerekiyor

  ─────────────────────────────────────────────────────
  RISK ÖZETİ
  ─────────────────────────────────────────────────────

  🔴  YÜKSEK RİSK  (2)

    ●  .env dosyası tespit edildi - protectedFiles listesinde yok
       → .repo-seatbelt.json'daki protectedFiles'a .env ekleyin

    ●  AGENTS.md bulunamadı - AI agent'ların güvenlik kuralı yok
       → AI kural dosyaları oluşturmak için repo-seatbelt rules çalıştırın

  Tarama tamamlandı.
```

---

## Supported AI tools

| Tool | Rule file generated |
|------|-------------------|
| Claude Code (Anthropic) | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| Codex / ChatGPT (OpenAI) | `AGENTS.md` |
| Gemini CLI (Google) | `AGENTS.md` |
| Aider | `AGENTS.md` |
| Windsurf | `AGENTS.md` |

---

## Supported frameworks

Next.js · React · Vite · Node.js · Express · Fastify · NestJS · Remix · Astro · Nuxt · React Native · Expo · SvelteKit · Angular · Vue

---

## Roadmap

- [ ] GitHub Actions integration
- [ ] Pre-commit hook support
- [ ] VS Code extension
- [ ] Monorepo support (`pnpm workspaces`, Turborepo)
- [ ] More framework presets (SvelteKit, Expo Router)
- [ ] Offline CVE check for new dependencies
- [ ] Custom rule plugins
- [ ] More languages (German, French, Spanish)

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

---

## Share

If `repo-seatbelt` saved your repo from a bad AI session:

> Just ran `npx repo-seatbelt scan` before letting Claude Code loose on my codebase. Found 3 high-risk areas I had no idea about. This should be mandatory before any AI coding session.
> github.com/berkcangumusisik/repo-seatbelt

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=berkcangumusisik/repo-seatbelt&type=Date)](https://star-history.com/#berkcangumusisik/repo-seatbelt&Date)

---

## License

[MIT](LICENSE) - use it, fork it, build on it.

