import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { Lang } from '../types';
import { readConfig } from '../config';
import { setLang } from '../i18n';
import { printHeader } from '../display/renderer';

interface CiOptions {
  lang?: string;
  json?: boolean;
  force?: boolean;
  output?: string;
}

const WORKFLOW = `name: repo-seatbelt

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  seatbelt:
    name: AI Safety Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run repo-seatbelt scan
        id: scan
        run: npx --yes repo-seatbelt scan --json > seatbelt-scan.json || true

      - name: Run repo-seatbelt diff
        if: github.event_name == 'pull_request'
        id: diff
        run: npx --yes repo-seatbelt diff --json > seatbelt-diff.json || true

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let body = '## 🛡️ repo-seatbelt report\\n\\n';
            try {
              const scan = JSON.parse(fs.readFileSync('seatbelt-scan.json', 'utf-8'));
              body += \`**Score:** \${scan.score}/100 — \${scan.risks.length} risk(s) found\\n\\n\`;
              const high = scan.risks.filter(r => r.level === 'high');
              if (high.length) {
                body += '### High-risk findings\\n';
                for (const r of high.slice(0, 10)) {
                  body += \`- \${r.message}\${r.file ? ' (\`' + r.file + '\`)' : ''}\\n\`;
                }
                body += '\\n';
              }
            } catch (e) {}
            try {
              const diff = JSON.parse(fs.readFileSync('seatbelt-diff.json', 'utf-8'));
              if (diff.overallRisk) {
                body += \`**Diff risk:** \${diff.overallRisk}\\n\`;
                if (diff.riskReasons?.length) {
                  body += diff.riskReasons.map(r => '- ' + r).join('\\n') + '\\n';
                }
              }
            } catch (e) {}
            const { owner, repo } = context.repo;
            const issue_number = context.payload.pull_request.number;
            await github.rest.issues.createComment({ owner, repo, issue_number, body });

      - name: Fail on high risk
        run: |
          if [ -f seatbelt-diff.json ]; then
            RISK=$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('seatbelt-diff.json','utf-8')).overallRisk || '') } catch(e){}")
            if [ "$RISK" = "high" ]; then
              echo "::error::repo-seatbelt: high-risk diff"
              exit 1
            fi
          fi
`;

export function ciCommand(options: CiOptions): void {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  if (!options.json) printHeader('Generate GitHub Action');

  const outPath = options.output
    ? path.resolve(cwd, options.output)
    : path.join(cwd, '.github', 'workflows', 'seatbelt.yml');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (fs.existsSync(outPath) && !options.force) {
    if (options.json) console.log(JSON.stringify({ ok: false, error: 'exists', path: outPath }));
    else console.log(chalk.yellow(`  ⚠  ${outPath} already exists. Use --force to overwrite.`));
    process.exit(1);
  }

  if (fs.existsSync(outPath)) fs.copyFileSync(outPath, outPath + '.bak');
  fs.writeFileSync(outPath, WORKFLOW, 'utf-8');

  if (options.json) {
    console.log(JSON.stringify({ ok: true, path: outPath }, null, 2));
    return;
  }
  console.log(chalk.green(`  ✓  Wrote ${path.relative(cwd, outPath)}`));
  console.log(chalk.dim('     Commit and push — the workflow runs on PRs and main pushes.'));
  console.log();
}
