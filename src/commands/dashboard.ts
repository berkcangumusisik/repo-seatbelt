import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { t, setLang } from '../i18n';
import { Lang, ScanResult } from '../types';
import { readConfig } from '../config';
import { runScan } from '../scanners';
import { getScoreLabel } from '../scoring';
import { printHeader } from '../display/renderer';

interface DashboardOptions {
  lang?: string;
  output?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateDashboardHtml(result: ScanResult, lang: Lang): string {
  const isEn = lang === 'en';
  const otherLang = isEn ? 'tr' : 'en';
  const score = result.score;

  let scoreColor: string;
  let scoreGradient: string;
  if (score >= 80) { scoreColor = '#22c55e'; scoreGradient = '#16a34a, #22c55e'; }
  else if (score >= 60) { scoreColor = '#eab308'; scoreGradient = '#ca8a04, #eab308'; }
  else if (score >= 40) { scoreColor = '#f97316'; scoreGradient = '#ea580c, #f97316'; }
  else { scoreColor = '#ef4444'; scoreGradient = '#dc2626, #ef4444'; }

  const highRisks = result.risks.filter(r => r.level === 'high');
  const mediumRisks = result.risks.filter(r => r.level === 'medium');
  const lowRisks = result.risks.filter(r => r.level === 'low');

  const rollbackItemsEn = [
    'Review full git diff before committing',
    'Revert risky files first (.env, migrations, auth)',
    'Check environment files are intact',
    'Run full test suite',
    'Run build',
    'Verify auth and payment flows manually',
    'Commit only after review',
  ];
  const rollbackItemsTr = [
    "Commit etmeden önce tam git diff'i gözden geçirin",
    'Riskli dosyaları önce geri alın (.env, migrations, auth)',
    'Ortam dosyalarının sağlam olduğunu kontrol edin',
    'Tüm test paketini çalıştırın',
    'Build alın',
    'Kimlik doğrulama ve ödeme akışlarını manuel olarak doğrulayın',
    'İncelemeden sonra commit yapın',
  ];

  function riskList(risks: typeof result.risks): string {
    if (risks.length === 0) return `<p class="empty">${isEn ? 'No risks in this category' : 'Bu kategoride risk yok'}</p>`;
    return risks.map(r => `
      <div class="risk-item">
        <div class="risk-msg">${escapeHtml(r.message)}</div>
        ${r.recommendation ? `<div class="risk-rec">→ ${escapeHtml(r.recommendation)}</div>` : ''}
      </div>
    `).join('');
  }

  function statusRows(): string {
    const rows = [
      ['.repo-seatbelt.json', result.aiRulesStatus.hasConfig],
      ['CLAUDE.md', result.aiRulesStatus.hasCLAUDEMD],
      ['AGENTS.md', result.aiRulesStatus.hasAGENTSMD],
      [isEn ? 'Cursor rules' : 'Cursor kuralları', result.aiRulesStatus.hasCursorRules],
    ];
    return rows.map(([label, ok]) => `
      <div class="status-row">
        <span class="status-icon ${ok ? 'ok' : 'fail'}">${ok ? '✓' : '✗'}</span>
        <span class="status-label">${label}</span>
        <span class="status-val ${ok ? 'ok' : 'fail'}">${ok ? (isEn ? 'Found' : 'Bulundu') : (isEn ? 'Missing' : 'Eksik')}</span>
      </div>
    `).join('');
  }

  const scoreLabel = getScoreLabel(score, lang);
  const generatedAt = new Date(result.timestamp).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'repo-seatbelt - AI Safety Dashboard' : 'repo-seatbelt - AI Güvenlik Panosu'}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f1117;
      --bg2: #161b27;
      --bg3: #1e2434;
      --border: #2a3045;
      --text: #e2e8f0;
      --dim: #8892a4;
      --accent: ${scoreColor};
      --green: #22c55e;
      --yellow: #eab308;
      --orange: #f97316;
      --red: #ef4444;
      --blue: #3b82f6;
      --radius: 12px;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 0;
    }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Header */
    .header {
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-brand .lock { font-size: 22px; }
    .header-brand h1 { font-size: 18px; font-weight: 700; color: var(--text); }
    .header-brand span { font-size: 13px; color: var(--dim); margin-left: 6px; }
    .lang-btn {
      background: var(--bg3);
      border: 1px solid var(--border);
      color: var(--dim);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: all .15s;
    }
    .lang-btn:hover { color: var(--text); border-color: var(--dim); }

    /* Main layout */
    .main { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

    /* Score hero */
    .score-hero {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 40px 32px;
      display: flex;
      align-items: center;
      gap: 40px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(${scoreGradient} ${score * 3.6}deg, #2a3045 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    .score-circle::before {
      content: '';
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: var(--bg2);
    }
    .score-number {
      position: relative;
      z-index: 1;
      font-size: 26px;
      font-weight: 800;
      color: ${scoreColor};
      text-align: center;
    }
    .score-number small { display: block; font-size: 11px; color: var(--dim); font-weight: 400; }
    .score-info h2 { font-size: 26px; font-weight: 800; color: ${scoreColor}; }
    .score-info p { color: var(--dim); font-size: 14px; margin-top: 6px; }
    .score-meta { display: flex; gap: 16px; margin-top: 14px; flex-wrap: wrap; }
    .meta-pill {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      color: var(--dim);
    }

    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 900px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .grid-3 { grid-template-columns: 1fr; } }

    /* Cards */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--dim);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-title .dot {
      width: 6px; height: 6px; border-radius: 50%;
    }
    .dot-red { background: var(--red); }
    .dot-yellow { background: var(--yellow); }
    .dot-green { background: var(--green); }
    .dot-blue { background: var(--blue); }

    /* Risk stat cards */
    .stat-card {
      border-radius: var(--radius);
      padding: 20px 22px;
      border: 1px solid;
    }
    .stat-card.high { background: rgba(239,68,68,.07); border-color: rgba(239,68,68,.25); }
    .stat-card.medium { background: rgba(234,179,8,.07); border-color: rgba(234,179,8,.25); }
    .stat-card.low { background: rgba(34,197,94,.07); border-color: rgba(34,197,94,.25); }
    .stat-card .stat-icon { font-size: 22px; margin-bottom: 8px; }
    .stat-card .stat-num { font-size: 32px; font-weight: 800; }
    .stat-card.high .stat-num { color: var(--red); }
    .stat-card.medium .stat-num { color: var(--yellow); }
    .stat-card.low .stat-num { color: var(--green); }
    .stat-card .stat-label { font-size: 12px; color: var(--dim); margin-top: 4px; }

    /* Risk items */
    .risk-item { padding: 10px 0; border-bottom: 1px solid var(--border); }
    .risk-item:last-child { border-bottom: none; }
    .risk-msg { font-size: 13px; color: var(--text); }
    .risk-rec { font-size: 12px; color: var(--blue); margin-top: 4px; }
    .empty { color: var(--dim); font-size: 13px; font-style: italic; }

    /* Status rows */
    .status-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
    }
    .status-row:last-child { border-bottom: none; }
    .status-icon { font-size: 14px; font-weight: 700; width: 20px; text-align: center; }
    .status-icon.ok { color: var(--green); }
    .status-icon.fail { color: var(--red); }
    .status-label { flex: 1; font-size: 13px; font-family: monospace; color: var(--text); }
    .status-val { font-size: 12px; font-weight: 600; }
    .status-val.ok { color: var(--green); }
    .status-val.fail { color: var(--red); }

    /* List items */
    .list-item {
      font-size: 13px;
      color: var(--dim);
      font-family: monospace;
      padding: 5px 0;
      border-bottom: 1px solid var(--border);
    }
    .list-item:last-child { border-bottom: none; }

    /* Checklist */
    .check-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      font-size: 13px;
      color: var(--text);
      border-bottom: 1px solid var(--border);
    }
    .check-item:last-child { border-bottom: none; }
    .check-box {
      width: 16px;
      height: 16px;
      border: 1.5px solid var(--border);
      border-radius: 3px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Info rows */
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      gap: 16px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--dim); flex-shrink: 0; }
    .info-val { color: var(--text); text-align: right; word-break: break-word; }
    .badge-ok { color: var(--green); font-weight: 600; }
    .badge-fail { color: var(--red); font-weight: 600; }

    /* Footer */
    .footer {
      text-align: center;
      padding: 32px 24px;
      color: var(--dim);
      font-size: 12px;
      border-top: 1px solid var(--border);
      margin-top: 40px;
    }
    .footer a { color: var(--dim); }
    .footer a:hover { color: var(--text); }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <span class="lock">🔒</span>
      <h1>repo-seatbelt<span>${isEn ? 'AI Safety Dashboard' : 'AI Güvenlik Panosu'}</span></h1>
    </div>
    <button class="lang-btn" onclick="window.location.href='?lang=${otherLang}'" id="lang-toggle">
      ${isEn ? 'Türkçe' : 'English'}
    </button>
  </div>

  <div class="main">

    <!-- Score Hero -->
    <div class="score-hero">
      <div class="score-circle">
        <div class="score-number">${score}<small>/ 100</small></div>
      </div>
      <div class="score-info">
        <h2>${scoreLabel}</h2>
        <p>${isEn ? 'AI Safety Score' : 'AI Güvenlik Puanı'}</p>
        <div class="score-meta">
          <span class="meta-pill">${result.projectInfo.framework.join(' · ') || 'Unknown'}</span>
          <span class="meta-pill">${result.projectInfo.packageManager}</span>
          ${result.config ? `<span class="meta-pill">${result.config.mode}</span>` : ''}
          ${result.projectInfo.databases.length > 0 ? `<span class="meta-pill">${result.projectInfo.databases.join(', ')}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- Risk stat cards -->
    <div class="grid grid-3" style="margin-bottom: 20px;">
      <div class="stat-card high">
        <div class="stat-icon">🔴</div>
        <div class="stat-num">${highRisks.length}</div>
        <div class="stat-label">${isEn ? 'High Risk' : 'Yüksek Risk'}</div>
      </div>
      <div class="stat-card medium">
        <div class="stat-icon">🟡</div>
        <div class="stat-num">${mediumRisks.length}</div>
        <div class="stat-label">${isEn ? 'Medium Risk' : 'Orta Risk'}</div>
      </div>
      <div class="stat-card low">
        <div class="stat-icon">🟢</div>
        <div class="stat-num">${lowRisks.length}</div>
        <div class="stat-label">${isEn ? 'Low Risk' : 'Düşük Risk'}</div>
      </div>
    </div>

    <div class="grid">

      <!-- Project info -->
      <div class="card">
        <div class="card-title"><span class="dot dot-blue"></span>${isEn ? 'Project Info' : 'Proje Bilgileri'}</div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Framework' : 'Framework'}</span>
          <span class="info-val">${escapeHtml(result.projectInfo.framework.join(', ') || (isEn ? 'Unknown' : 'Bilinmiyor'))}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Package Manager' : 'Paket Yöneticisi'}</span>
          <span class="info-val">${result.projectInfo.packageManager}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Database' : 'Veritabanı'}</span>
          <span class="info-val">${escapeHtml(result.projectInfo.databases.join(', ') || (isEn ? 'None' : 'Yok'))}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Auth' : 'Kimlik Doğrulama'}</span>
          <span class="info-val">${escapeHtml(result.projectInfo.authProviders.join(', ') || (isEn ? 'None' : 'Yok'))}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Payments' : 'Ödeme'}</span>
          <span class="info-val">${escapeHtml(result.projectInfo.paymentProviders.join(', ') || (isEn ? 'None' : 'Yok'))}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Tests' : 'Testler'}</span>
          <span class="info-val ${result.projectInfo.hasTests ? 'badge-ok' : 'badge-fail'}">${result.projectInfo.hasTests ? '✓' : '✗'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'README' : 'README'}</span>
          <span class="info-val ${result.projectInfo.hasReadme ? 'badge-ok' : 'badge-fail'}">${result.projectInfo.hasReadme ? '✓' : '✗'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isEn ? 'Safety Mode' : 'Güvenlik Modu'}</span>
          <span class="info-val">${result.config?.mode ?? (isEn ? 'Not configured' : 'Yapılandırılmamış')}</span>
        </div>
      </div>

      <!-- AI Rules Status -->
      <div class="card">
        <div class="card-title"><span class="dot dot-blue"></span>${isEn ? 'AI Rules Status' : 'AI Kural Durumu'}</div>
        ${statusRows()}
      </div>

    </div>

    <!-- Risk details -->
    ${highRisks.length > 0 ? `
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title"><span class="dot dot-red"></span>${isEn ? 'High Risk Items' : 'Yüksek Risk Öğeleri'}</div>
      ${riskList(highRisks)}
    </div>` : ''}

    ${mediumRisks.length > 0 ? `
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title"><span class="dot dot-yellow"></span>${isEn ? 'Medium Risk Items' : 'Orta Risk Öğeleri'}</div>
      ${riskList(mediumRisks)}
    </div>` : ''}

    ${lowRisks.length > 0 ? `
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title"><span class="dot dot-green"></span>${isEn ? 'Low Risk Items' : 'Düşük Risk Öğeleri'}</div>
      ${riskList(lowRisks)}
    </div>` : ''}

    ${result.risks.length === 0 ? `
    <div class="card" style="margin-bottom: 20px; text-align: center; padding: 40px;">
      <div style="font-size: 36px; margin-bottom: 12px;">✅</div>
      <div style="font-size: 16px; font-weight: 600; color: var(--green);">${isEn ? 'No risks detected!' : 'Risk tespit edilmedi!'}</div>
      <div style="color: var(--dim); font-size: 13px; margin-top: 8px;">${isEn ? 'Your repo looks safe for AI agents.' : "Repo'nuz AI agent'lar için güvenli görünüyor."}</div>
    </div>` : ''}

    <div class="grid">

      <!-- Protected files -->
      ${result.config && result.config.protectedFiles.length > 0 ? `
      <div class="card">
        <div class="card-title"><span class="dot dot-red"></span>${isEn ? 'Protected Files' : 'Korunan Dosyalar'}</div>
        ${result.config.protectedFiles.map(f => `<div class="list-item">${escapeHtml(f)}</div>`).join('')}
      </div>` : ''}

      <!-- Blocked Commands -->
      ${result.config && result.config.blockedCommands.length > 0 ? `
      <div class="card">
        <div class="card-title"><span class="dot dot-red"></span>${isEn ? 'Blocked Commands' : 'Engellenen Komutlar'}</div>
        ${result.config.blockedCommands.map(c => `<div class="list-item">${escapeHtml(c)}</div>`).join('')}
      </div>` : ''}

    </div>

    <!-- Rollback Checklist -->
    <div class="card" style="margin-top: 20px;">
      <div class="card-title"><span class="dot dot-blue"></span>${isEn ? 'Rollback Checklist' : 'Geri Alma Kontrol Listesi'}</div>
      <p style="font-size: 12px; color: var(--dim); margin-bottom: 14px;">
        ${isEn ? 'Before committing AI-generated changes:' : 'AI tarafından oluşturulan değişiklikleri commit etmeden önce:'}
      </p>
      ${(isEn ? rollbackItemsEn : rollbackItemsTr).map(item => `
        <div class="check-item">
          <div class="check-box"></div>
          <span>${escapeHtml(item)}</span>
        </div>
      `).join('')}
    </div>

  </div>

  <div class="footer">
    ${isEn ? 'Generated' : 'Oluşturuldu'}: ${escapeHtml(generatedAt)} &nbsp;·&nbsp;
    <a href="https://github.com/berkcangumusisik/repo-seatbelt" target="_blank">repo-seatbelt</a>
    &nbsp;·&nbsp; ${isEn ? 'Powered by' : 'Tarafından desteklenmektedir'} repo-seatbelt
  </div>

  <script>
    // Language toggle preserves the page with a query param (static fallback)
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && lang !== '${lang}') {
      // Reload with different lang data - when served from disk this does nothing
      // Users should re-run: repo-seatbelt dashboard --lang ${otherLang}
      document.getElementById('lang-toggle').title =
        'Re-run: repo-seatbelt dashboard --lang ${otherLang}';
    }
  </script>
</body>
</html>`;
}

export async function dashboardCommand(options: DashboardOptions): Promise<void> {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const lang = ((options.lang as Lang) || config?.language || 'en') as Lang;
  setLang(lang);

  printHeader(t('dashboard.title'));

  const spinner = ora({
    text: chalk.dim(t('dashboard.generating')),
    spinner: 'dots',
    color: 'cyan',
  }).start();

  try {
    const result = await runScan(cwd);
    const html = generateDashboardHtml(result, lang);

    const outputPath = options.output ?? path.join(cwd, 'docs', 'repo-seatbelt-dashboard.html');
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf-8');
    spinner.stop();

    console.log(chalk.green('  ✓  ') + t('dashboard.saved', { path: outputPath }));
    console.log(chalk.dim('  →  ') + t('dashboard.open', { path: outputPath }));
    console.log();
  } catch (err) {
    spinner.stop();
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`  ✗  ${t('errors.general', { message: msg })}`));
    process.exit(1);
  }
}
