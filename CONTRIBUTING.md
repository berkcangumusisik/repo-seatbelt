# Contributing to repo-seatbelt

Thanks for taking the time to contribute.

## Before you start

For small fixes (typos, minor bugs) just open a PR directly.
For larger changes, open an issue first so we can discuss the approach.

## Setup

```bash
git clone https://github.com/berkcangumusisik/repo-seatbelt.git
cd repo-seatbelt
npm install
npm run build
node dist/cli.js scan
```

## Development workflow

```bash
npm run dev       # run CLI via ts-node without building
npm run typecheck # type check without emitting
npm run build     # compile TypeScript to dist/
```

## Project structure

```
src/
  cli.ts              # entry point, Commander setup
  types.ts            # shared interfaces
  config.ts           # read/write .repo-seatbelt.json
  i18n/
    en.ts             # English strings
    tr.ts             # Turkish strings
    index.ts          # t() helper
  scanners/           # risk detection logic
  scoring/            # AI Safety Score calculation
  display/            # terminal output rendering
  commands/           # one file per CLI command
  generators/         # CLAUDE.md, AGENTS.md, .cursorrules templates
```

## Adding a new language

1. Copy `src/i18n/en.ts` to `src/i18n/xx.ts`
2. Translate all values (keep the keys in English)
3. Import and wire it in `src/i18n/index.ts`
4. Add the lang code to the `Lang` type in `src/types.ts`

## i18n rules

- All user-visible strings must go through `t(key)` - no hardcoded English in commands or display
- Use `{placeholder}` syntax for dynamic values: `t('key', { name: 'value' })`
- Turkish output must use proper characters: ğ ü ş ç ö ı İ Ğ Ü Ş Ç Ö

## Checklist before opening a PR

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run build` succeeds
- [ ] `node dist/cli.js scan --lang en` looks correct
- [ ] `node dist/cli.js scan --lang tr` looks correct (check Turkish chars)
- [ ] README updated if any behavior changed

## Commit style

```
fix: correct Turkish uppercase in section headers
feat: add GitHub Actions support
docs: update dashboard section in README
```

## License

By contributing you agree that your changes will be licensed under the [MIT License](LICENSE).
