<div align="center">

# 🔒 repo-seatbelt

### AI kodlama ajanları için güvenlik katmanı. Reponuza dokunmadan önce.

[![npm version](https://img.shields.io/npm/v/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![npm downloads](https://img.shields.io/npm/dm/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![License: MIT](https://img.shields.io/badge/license-MIT-%230f172a?labelColor=%231e293b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-%230f172a?labelColor=%231e293b&style=flat-square)](package.json)
[![MCP Hazır](https://img.shields.io/badge/MCP-haz%C4%B1r-%2310b981?labelColor=%231e293b&style=flat-square)](#mcp-server--%C3%A7al%C4%B1%C5%9Fma-zaman%C4%B1-koruma)
[![Diller](https://img.shields.io/badge/diller-EN%20%2F%20TR-%230f172a?labelColor=%231e293b&style=flat-square)](README.md)

<br/>

**AI kodlama ajanları güçlüdür. Belki fazla güçlü.**

`repo-seatbelt` projenizi tarar, riskli alanları tespit eder, **7 farklı AI aracı** için
güvenlik kuralları üretir, **çalışma zamanı MCP koruma sunucusu** sağlar, **pre-commit hook**
+ **GitHub Action** kurar ve reponuza 100 üzerinden bir **AI Güvenlik Skoru** verir — sizin
dilinizde.

<br/>

> **AI dokunmadan önce, kemerini bağla.**

<br/>

[Hızlı Başlangıç](#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7) · [Komutlar](#komutlar) · [MCP Server](#mcp-server--%C3%A7al%C4%B1%C5%9Fma-zaman%C4%B1-koruma) · [Presetler](#presetler) · [CI / Hooks](#cicd--git-hooks) · [Skor Sistemi](#ai-g%C3%BCvenlik-skoru) · [English](README.md)

</div>

---

## İçindekiler

1. [Neden var?](#neden-var)
2. [Hızlı Başlangıç](#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7)
3. [Ne elde edersiniz?](#ne-elde-edersiniz)
4. [Desteklenen AI Araçları](#desteklenen-ai-ara%C3%A7lar%C4%B1)
5. [Komutlar](#komutlar)
6. [Presetler](#presetler)
7. [MCP Server — Çalışma Zamanı Koruma](#mcp-server--%C3%A7al%C4%B1%C5%9Fma-zaman%C4%B1-koruma)
8. [CI/CD & Git Hooks](#cicd--git-hooks)
9. [Watch Modu](#watch-modu)
10. [Audit Modu](#audit-modu)
11. [AI Güvenlik Skoru](#ai-g%C3%BCvenlik-skoru)
12. [Dashboard & Raporlar](#dashboard--raporlar)
13. [Konfigürasyon Referansı](#konfig%C3%BCrasyon-referans%C4%B1)
14. [JSON Çıktı](#json-%C3%A7%C4%B1kt%C4%B1)
15. [Mimari](#mimari)
16. [SSS](#sss)
17. [Yol Haritası](#yol-haritas%C4%B1)
18. [Katkıda Bulunma](#katk%C4%B1da-bulunma)
19. [Star History](#star-history)
20. [Lisans](#lisans)

---

## Neden var?

Claude Code, Cursor, Codex, Gemini CLI, Windsurf, Aider, Cline, Zed gibi AI kodlama
araçları gerçekten faydalı. Ama reponuzda neyin kutsal olduğunu bilmezler. Korkuluk
olmadan bir ajan şunları yapabilir:

- 🔥 `.env` dosyanızı test değerleriyle ezebilir
- 🔥 Geri gelmeyen migration dosyalarını silebilir
- 🔥 Auth middleware'inizi "temizlemek için" yeniden yazabilir
- 🔥 Production veritabanında `prisma migrate reset` çalıştırabilir
- 🔥 Bir bug'ı düzeltmek için 12 yeni bağımlılık ekleyebilir
- 🔥 "Tek string değiştir" dediğinizde 30 dosyayı refactor edebilir

**`repo-seatbelt` bunu dört katmanlı bir savunmayla çözer:**

| Katman | Ne yapar | Nerede çalışır |
|--------|----------|---------------|
| **1. Statik kurallar** | `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`, `CONVENTIONS.md`, `.clinerules`, `.rules` üretir; ajanlar oturum başında okur. | `npx repo-seatbelt rules` |
| **2. Çalışma zamanı MCP koruması** | Ajanların karar anında çağırdığı canlı MCP sunucusu: `check_file_access`, `check_command`, `list_protections`. | `npx repo-seatbelt mcp` |
| **3. Pre-commit hook** | Yüksek-riskli commit'leri geliştiricinin makinesinden çıkmadan engeller. | `npx repo-seatbelt install-hooks` |
| **4. CI kapısı** | GitHub Action güvenlik skoru ile PR yorumu yazar ve high-risk diff'lerde fail eder. | `npx repo-seatbelt ci` |

---

## Hızlı Başlangıç

```bash
# Sıfır kurulum
npx repo-seatbelt init                          # interaktif kurulum
npx repo-seatbelt init --preset nextjs-stripe   # veya hazır preset uygula

# Günlük kullanım
npx repo-seatbelt scan                          # AI Güvenlik Skoru + riskler
npx repo-seatbelt diff                          # commit öncesi AI değişikliklerini incele
npx repo-seatbelt doctor                        # öncelikli aksiyon planı

# Kilitle
npx repo-seatbelt install-hooks                 # high-risk commit'leri engelle
npx repo-seatbelt ci                            # GitHub Action ekle
npx repo-seatbelt mcp --print                   # runtime MCP yapılandır
```

---

## Ne elde edersiniz?

```text
.repo-seatbelt.json     ← makine-okur konfigürasyon (tek doğru kaynağı)
CLAUDE.md               ← Claude Code için kurallar
AGENTS.md               ← AGENTS.md uyumlu araçlar (Codex, Aider, Gemini)
CONVENTIONS.md          ← Aider için kurallar
.cursorrules            ← Cursor için kurallar
.windsurfrules          ← Windsurf için kurallar
.clinerules             ← Cline için kurallar
.rules                  ← Zed AI asistanı için kurallar
.git/hooks/pre-commit   ← (opsiyonel) high-risk commit'leri engeller
.github/workflows/      ← (opsiyonel) PR yorumlu CI kapısı
docs/repo-seatbelt-report.md       ← markdown güvenlik raporu
docs/repo-seatbelt-dashboard.html  ← interaktif HTML dashboard
```

Artı: **Çalışma zamanı MCP sunucusu** — ajanlar oturum ortasında çağırabilir.

---

## Desteklenen AI Araçları

| Araç | Kural dosyası | Generator | Runtime MCP |
|------|--------------|-----------|------------|
| **Claude Code / Claude Desktop** | `CLAUDE.md` | ✅ | ✅ |
| **Cursor** | `.cursorrules` | ✅ | — |
| **Codex / ChatGPT** | `AGENTS.md` | ✅ | — |
| **Gemini CLI** | `AGENTS.md` | ✅ | — |
| **Windsurf** | `.windsurfrules` | ✅ | — |
| **Aider** | `CONVENTIONS.md` | ✅ | — |
| **Cline** | `.clinerules` | ✅ | — |
| **Zed AI** | `.rules` | ✅ | — |

> MCP destekli her host (Claude Desktop, Claude Code, Continue.dev, vb.) repo-seatbelt
> MCP sunucusu ile konuşabilir ve canlı, karar-anı koruma sağlayabilir.

---

## Komutlar

<details open>
<summary><b><code>init</code></b> — projeyi başlat</summary>

```bash
repo-seatbelt init                              # interaktif
repo-seatbelt init --yes                        # interaktif olmayan, varsayılanlar
repo-seatbelt init --preset nextjs-stripe       # preset uygula
repo-seatbelt init --lang tr                    # Türkçe çıktı
```

`.repo-seatbelt.json`, `CLAUDE.md`, `AGENTS.md` (ve Cursor seçilirse `.cursorrules`) yazar.

</details>

<details>
<summary><b><code>scan</code></b> — AI Güvenlik Skoru + risk listesi</summary>

```bash
repo-seatbelt scan
repo-seatbelt scan --json            # makine-okur
repo-seatbelt scan --verbose         # tüm detaylar
repo-seatbelt scan --no-color        # log için renk yok
```

Framework, paket yöneticisi, veritabanı, auth/ödeme sağlayıcıları, env hijyeni, prod
yapılandırması ve AI kural dosyalarını tespit eder. 0–100 skor + kategorize risk listesi.

</details>

<details>
<summary><b><code>doctor</code></b> — öncelikli aksiyon planı</summary>

```bash
repo-seatbelt doctor
repo-seatbelt doctor --json
```

`scan` ile aynı veriyi öncelikli yapılacaklar listesi olarak sunar. İlk kurulum için ideal.

</details>

<details>
<summary><b><code>diff</code></b> — commit öncesi AI değişikliklerini incele</summary>

```bash
repo-seatbelt diff
repo-seatbelt diff --json            # pre-commit hook'un kullandığı format
```

Mevcut git değişikliklerini inceler. `.env` mod, auth/ödeme dokunuşu, migration değişikliği,
yeni bağımlılık, büyük refactor ve test eksikliği işaretler. `info | low | medium | high`
seviyesinde `overallRisk` döner.

</details>

<details>
<summary><b><code>rules</code></b> — AI kural dosyalarını üret</summary>

```bash
repo-seatbelt rules                                    # interaktif seçici
repo-seatbelt rules --all                              # 7 araç da
repo-seatbelt rules --tool claude,cursor,windsurf      # virgülle ayır
repo-seatbelt rules --tool aider                       # tek
repo-seatbelt rules --json                             # tümü + JSON manifest
```

Mevcut dosyalar üzerine yazılmadan önce `*.bak` olarak yedeklenir.

</details>

<details>
<summary><b><code>protect</code></b> — korunan path'leri yönet</summary>

```bash
repo-seatbelt protect                          # mevcut korumaları listele
repo-seatbelt protect "config/secrets/**"      # glob ekle
repo-seatbelt protect --json
```

</details>

<details>
<summary><b><code>check-command</code></b> — shell komutunu doğrula</summary>

```bash
repo-seatbelt check-command "rm -rf node_modules"
repo-seatbelt check-command "git push --force" --json
```

`safe | dangerous` ve gerekçeleri döndürür. Built-in pattern'leri ve sizin
`blockedCommands`'larınızı birleştirir.

</details>

<details>
<summary><b><code>install-hooks</code></b> — pre-commit koruması</summary>

```bash
repo-seatbelt install-hooks                   # git pre-commit hook kur
repo-seatbelt install-hooks --force           # mevcut hook'u ez (.bak saklanır)
repo-seatbelt install-hooks --uninstall       # hook'u kaldır
```

Kurulan hook `repo-seatbelt diff --json` çalıştırır ve `overallRisk === "high"` olduğunda
**commit'i engeller**. Gerektiğinde `git commit --no-verify` ile bypass edilebilir.

</details>

<details>
<summary><b><code>ci</code></b> — GitHub Actions workflow</summary>

```bash
repo-seatbelt ci                              # .github/workflows/seatbelt.yml yazar
repo-seatbelt ci --force                      # ez
repo-seatbelt ci --output ./custom.yml        # özel path
```

Üretilen workflow:

- her push ve PR'da `scan` çalıştırır
- PR'larda `diff` çalıştırır ve güvenlik skoru + bulgularla yorum yazar
- diff `overallRisk === "high"` ise CI'yı **fail eder**

</details>

<details>
<summary><b><code>watch</code></b> — repo geliştikçe kuralları otomatik güncelle</summary>

```bash
repo-seatbelt watch                           # 500ms debounce (varsayılan)
repo-seatbelt watch --debounce 1500
```

Yeni hassas klasörleri (`auth/`, `payment/`, `stripe/`, …) ve repo'da görünen `.env*`
dosyalarını tespit eder, `.repo-seatbelt.json`'u günceller ve **var olan tüm kural
dosyalarını yeniden üretir**. Sıfır ek bağımlılık — Node'un dahili `fs.watch`'unu kullanır.

</details>

<details>
<summary><b><code>audit</code></b> — git geçmişi adli incelemesi</summary>

```bash
repo-seatbelt audit                                 # son 500 commit
repo-seatbelt audit --since "1 month ago"
repo-seatbelt audit --limit 1000 --json
```

Git geçmişinde şunları arar:

- commit'lenmiş `.env` dosyaları
- dokunulmuş korunan dosyalar
- commit subject'inde `blockedCommands` izleri
- "büyük refactor" commit'leri (≥25 dosya)

Mevcut bir repoya `repo-seatbelt` adapte ederken, AI'nin (veya insanların) kilitlemeden
önce neler yaptığını görmek için ideal.

</details>

<details>
<summary><b><code>update</code></b> — diff önizlemeli kural dosyası yeniden üretimi</summary>

```bash
repo-seatbelt update                          # diff göster, onay iste
repo-seatbelt update --yes                    # sormadan uygula
repo-seatbelt update --diff-only              # diff göster, yazma
repo-seatbelt update --json
```

`.repo-seatbelt.json`'dan tüm kural dosyalarını yeniden hesaplar ve `+N -M` özetleriyle
örnek satırları yazdırır. Mevcut dosyalar `*.bak` olarak yedeklenir.

</details>

<details>
<summary><b><code>mcp</code></b> — çalışma zamanı MCP sunucusu</summary>

```bash
repo-seatbelt mcp                             # stdio MCP sunucusunu çalıştır
repo-seatbelt mcp --print                     # client config snippet'i göster
repo-seatbelt mcp --print --json
```

Detaylar için: [MCP Server](#mcp-server--%C3%A7al%C4%B1%C5%9Fma-zaman%C4%B1-koruma).

</details>

<details>
<summary><b><code>badge</code></b> · <b><code>report</code></b> · <b><code>dashboard</code></b></summary>

```bash
repo-seatbelt badge                           # son scan'den README badge
repo-seatbelt badge --score 92 --json
repo-seatbelt report                          # docs/repo-seatbelt-report.md
repo-seatbelt dashboard                       # docs/repo-seatbelt-dashboard.html
```

</details>

---

## Presetler

Tekrarlanan işten kurtulun. Stack'inizde neyin hassas olduğunu bilen bir preset uygulayın.

| Preset | Ne ekler |
|--------|----------|
| `nextjs-stripe` | `prisma/schema.prisma`, `.env.local`, `.env.production` korur. Stripe webhook handler'ları, `app/api/auth/**`, `next.config.*` onay-gateler. Prod'a karşı `stripe trigger` engeller. |
| `django` | `**/migrations/**`, `settings/production.py` korur. `auth/`, `payments/`, `manage.py` onay-gateler. `manage.py flush` ve `reset_db` engeller. |
| `rails` | `db/migrate/**`, `db/schema.rb`, `config/credentials.yml.enc`, `config/master.key` korur. `rails db:drop`/`db:reset` engeller. |
| `expo` | `app.json`, `eas.json`, `google-services.json`, `GoogleService-Info.plist` korur. `eas build --profile production`, `expo publish` engeller. |
| `monorepo` | `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `packages/*/.env*` için workspace-bilinçli koruma. |
| `fastapi` | `alembic/versions/**`, `.env` korur. `alembic downgrade base` engeller. |

```bash
npx repo-seatbelt init --preset nextjs-stripe
```

> Presetler eklemelidir — config'inizi değiştirmek yerine birleştirir.

---

## MCP Server — Çalışma Zamanı Koruma

Statik kural dosyaları yalnızca ajan onları okursa işe yarar. **MCP sunucusu**, AI ajanlarının
(Claude Desktop, Claude Code, Continue.dev, herhangi bir MCP host'u) **karar anında**
soracağı canlı bir JSON-RPC servisidir:

> *"Bu dosyayı düzenlemem güvenli mi?"*
> *"Bu shell komutu bu repoda izinli mi?"*

### Mevcut araçlar

| Araç | Amaç |
|------|------|
| `check_file_access(path, operation)` | `allow` \| `ask` \| `block` döner. Her edit öncesi çağır. |
| `check_command(command)` | `safe` \| `warn` \| `block` ve gerekçeler döner. Her shell çalıştırma öncesi çağır. |
| `list_protections()` | Korunan dosyaları, onay-gerektiren glob'ları, engellenmiş komutları ve aktif modu listeler. |
| `scan_repo()` | Tam güvenlik taraması yapar ve skor + riskleri döner. |

### Claude Desktop'a bağlama

```bash
npx repo-seatbelt mcp --print
```

Yazılan snippet'i `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) veya platformunuzdaki eşdeğerine ekleyin:

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

### Claude Code'a bağlama

```bash
claude mcp add repo-seatbelt -- npx -y repo-seatbelt-mcp
```

### Manuel test

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_command","arguments":{"command":"rm -rf /"}}}' \
  | npx repo-seatbelt mcp
```

Şuna benzer cevap alırsınız:

```json
{ "decision": "block", "reasons": ["Recursive force delete", "Matches blocked command: \"rm -rf\""] }
```

> MCP sunucusu **bağımlılıksızdır** — stdio üzerinden minimal JSON-RPC, SDK yükü yok.

---

## CI/CD & Git Hooks

### Pre-commit hook (lokal, push'tan önce)

```bash
npx repo-seatbelt install-hooks
```

Artık her `git commit` `repo-seatbelt diff --json` çalıştırır. `overallRisk === "high"`
ise commit net bir mesajla engellenir. Bilinçli bypass:

```bash
git commit --no-verify -m "kasıtlı yüksek-riskli commit"
```

### GitHub Action (uzak, her PR'da)

```bash
npx repo-seatbelt ci
git add .github/workflows/seatbelt.yml
git commit -m "chore: repo-seatbelt CI ekle"
```

Workflow:

1. Her push/PR'da `scan` çalıştırır
2. PR'larda `diff` çalıştırır ve skor + en kritik bulgularla yapışkan yorum yazar
3. Diff high-risk ise check'i **fail eder**

Örnek PR yorumu:

```
## 🛡️ repo-seatbelt raporu

**Skor:** 71/100 — 4 risk bulundu

### Yüksek-risk bulgular
- .env dosyası değiştirildi (`.env.production`)
- Auth dosyaları değiştirildi (`src/auth/middleware.ts`)

**Diff riski:** high
- .env dosyaları değiştirildi
- Auth dosyaları değiştirildi
```

---

## Watch Modu

```bash
npx repo-seatbelt watch
```

Repo büyüdükçe kural dosyalarınızı senkron tutar. Sürekli çalışır, dosya sistemi olaylarını
debounce eder ve şunlar olduğunda `CLAUDE.md`, `AGENTS.md`, `.cursorrules` vb. otomatik
yeniden üretir:

- repo kökünde veya `src/`, `app/`, `lib/` altında yeni `auth/`, `payment/`, `stripe/`, `billing/` klasörü çıkarsa
- repo kökünde yeni `.env*` dosyası oluşursa

Çıktı:

```
  [14:23:01] Updated config + 5 rule file(s)
     +approval: src/payment/**
     +protected: .env.staging
```

---

## Audit Modu

```bash
npx repo-seatbelt audit --since "3 months ago"
```

Git geçmişinde riskli pattern'leri tarar. Kullanım senaryoları:

- Mevcut bir repoya `repo-seatbelt` adapte etme ve geçmiş hasarı görme
- Bir kontratçının branch'inde güvenlik incelemesi
- Postmortem için kanıt toplama

Örnek çıktı:

```
  🔴  env-committed (2)
     2024-09-12 a3f81de alice: .env.local
     2024-11-01 9c1d2bb bob:   .env.production

  🟠  protected-touched (5)
     2025-02-04 4d8e7a1 ai-bot: prisma/migrations/20240204_drop_users/migration.sql

  🟡  large-refactor (1)
     2025-03-18 8b22f9c claude: 47 dosya değişti
```

---

## AI Güvenlik Skoru

`repo-seatbelt`, "AI-dostu" sinyali veren bir kontrol listesine göre reponuzu puanlar:

| Aralık | Hüküm | Anlam |
|--------|-------|-------|
| **80 – 100** | 🟢 AI Güvenli | Sağlam korumalar. Çoğu ajan sorumlu davranır. |
| **60 – 79** | 🟡 Dikkat gerek | Bazı risk alanları — uzun AI oturumundan önce inceleyin. |
| **40 – 59** | 🟠 Riskli | Önemli boşluklar. `doctor` çalıştırın ve aksiyon planını izleyin. |
| **0 – 39** | 🔴 AI'a Hazır Değil | `init` çalıştırmadan ajanları serbest bırakmayın. |

Skor ağırlıklı kontrol noktalarından hesaplanır (env hijyeni, AI kural dosyaları, riskli
script'ler, framework riski, monorepo yapısı, …). Detay için `scan --verbose`.

### Badge ekleyin

```bash
npx repo-seatbelt badge
```

Çıktıdaki markdown'ı README'nize yapıştırın.

---

## Dashboard & Raporlar

```bash
npx repo-seatbelt report     # docs/repo-seatbelt-report.md
npx repo-seatbelt dashboard  # docs/repo-seatbelt-dashboard.html
```

HTML dashboard tamamen statiktir (build adımı yok, JS framework yok) ve skoru, risk
breakdown'ını, proje bilgisini ve yapılandırılmış korumaları tek bakışta gösterir.
Dahili dokümantasyonunuza ekleyin veya herhangi bir tarayıcıda lokal açın.

---

## Konfigürasyon Referansı

`.repo-seatbelt.json`:

```jsonc
{
  "version": "1",
  "mode": "strict",                   // "solo" | "team" | "strict"
  "language": "tr",                   // "en" | "tr"
  "projectType": "nextjs",
  "selectedTools": ["claude", "cursor"],

  "protectedFiles": [                 // onay olmadan oku/edit/sil yok
    ".env", ".env.*",
    "prisma/migrations/**",
    "config/credentials.yml.enc"
  ],

  "approvalRequired": [               // edit'ler açık insan onayı gerektirir
    "auth/**", "lib/auth/**",
    "payment/**", "stripe/**",
    "middleware.ts"
  ],

  "blockedCommands": [                // AI'nın reddetmesi gereken komutlar
    "rm -rf",
    "DROP TABLE",
    "prisma migrate reset",
    "git push --force"
  ],

  "ignoredPaths": [],                 // scanner'ın atladığı glob'lar
  "riskThresholds": {                 // skor → hüküm eşlemesi
    "low": 60, "medium": 40, "high": 0
  },
  "presets": ["nextjs-stripe"]
}
```

Elle veya `repo-seatbelt protect` / `repo-seatbelt init` ile düzenleyin.

---

## JSON Çıktı

Her komut script ve CI için `--json` destekler:

```bash
repo-seatbelt scan --json | jq '.score'
repo-seatbelt diff --json | jq '.overallRisk'
repo-seatbelt audit --json --since "1 week ago" | jq '.findings | length'
repo-seatbelt rules --json | jq '.written[] | .file'
repo-seatbelt badge --score 92 --json
```

Pre-commit hook ve GitHub Action bunu kullanır.

---

## Mimari

```text
┌──────────────────────────────────────────────────────────────┐
│                  .repo-seatbelt.json                         │
│         (tek doğru kaynağı — sizin kontratınız)              │
└──────────────────────────────────────────────────────────────┘
            │
            ├─────────────► Statik generator'lar (init / rules / update)
            │                  ├─ CLAUDE.md
            │                  ├─ AGENTS.md
            │                  ├─ .cursorrules / .windsurfrules
            │                  ├─ CONVENTIONS.md / .clinerules / .rules
            │
            ├─────────────► Scanner'lar (scan / doctor / diff / audit)
            │                  ├─ env hijyeni
            │                  ├─ auth / payment / db tespiti
            │                  ├─ prod konfig tespiti
            │                  └─ AI kural varlığı + git geçmişi
            │
            ├─────────────► Yaptırım katmanı
            │                  ├─ pre-commit hook (install-hooks)
            │                  ├─ GitHub Action (ci)
            │                  └─ watch (otomatik regen)
            │
            └─────────────► MCP server (mcp)
                               ├─ check_file_access
                               ├─ check_command
                               ├─ list_protections
                               └─ scan_repo
```

---

## SSS

<details>
<summary><b>Bu ajanımı yavaşlatır mı?</b></summary>

Statik kural dosyaları oturum başında bir kez okunur — sıfır runtime maliyeti. MCP
sunucusu her `check_file_access` çağrısında birkaç milisaniye ekler ki bu tek bir LLM
token'ına göre ihmal edilebilirdir.

</details>

<details>
<summary><b>AI bu kuralları aşabilir mi?</b></summary>

Statik kurallar tavsiye niteliğindedir — iyi davranan ajanlar bunlara saygı gösterir. Sert
yaptırım için **MCP sunucusunu** (karar-anı) **pre-commit hook** (makine-anı) ile birleştirin.
Hook `--no-verify` ile bypass edilebilir, ama bu denetlenebilir kasıtlı bir insan eylemidir.

</details>

<details>
<summary><b>Neden CLAUDE.md'yi elle yazmıyorum?</b></summary>

Yazabilirsiniz. Ama `repo-seatbelt` **7 farklı kural dosyasını** tek config'ten senkron
tutar, bir MCP sunucusu sağlar, CI'yı gateler ve geçmişi audit eder. Proje başına saatler
tasarrufu.

</details>

<details>
<summary><b>JS olmayan projelere?</b></summary>

CLI Node tabanlıdır, ama *ürettiği kurallar* dile bağımsız markdown'dır. Her preset
(`django`, `rails`, `fastapi`, `expo`, …) Node-dışı stack'ler için.

</details>

<details>
<summary><b>Her şeyi nasıl kaldırırım?</b></summary>

```bash
npx repo-seatbelt install-hooks --uninstall
rm .repo-seatbelt.json CLAUDE.md AGENTS.md .cursorrules .windsurfrules \
   CONVENTIONS.md .clinerules .rules
rm -rf .github/workflows/seatbelt.yml
```

</details>

---

## Yol Haritası

- [x] Statik kural generator'ları (Claude, Cursor, AGENTS.md)
- [x] Windsurf, Aider, Cline, Zed için generator'lar
- [x] Pre-commit hook installer
- [x] PR yorumlu GitHub Action generator
- [x] Watch modu (fs değişikliklerinde otomatik regen)
- [x] Git-history audit
- [x] Diff önizlemeli update komutu
- [x] Proje presetleri (Next.js + Stripe, Django, Rails, Expo, FastAPI, Monorepo)
- [x] **MCP runtime koruma sunucusu**
- [x] Her komut için JSON çıktı
- [ ] VS Code eklentisi (editör-içi uyarılar + dashboard)
- [ ] Telemetry opt-in (anonim "korumalar X yakaladı" istatistik)
- [ ] Özel kural plugin'leri
- [ ] Daha fazla dil (Almanca, Fransızca, İspanyolca)
- [ ] GitLab CI / Bitbucket Pipelines şablonları

---

## Katkıda Bulunma

Issue ve PR'lar memnuniyetle karşılanır. Büyük değişiklikler için önce issue açın.

```bash
git clone https://github.com/berkcangumusisik/repo-seatbelt.git
cd repo-seatbelt
npm install
npm run build
node dist/cli.js scan
```

Tam rehber: [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Paylaş

`repo-seatbelt` reponuzu kötü bir AI oturumundan kurtardıysa:

> Claude Code'u kod tabanıma salmadan önce `npx repo-seatbelt scan` çalıştırdım.
> Haberim olmayan 3 yüksek-risk alan buldum. Sonra MCP sunucusunu ve pre-commit
> hook'u bağladım — artık ajanım `.env`'e dokunamaz veya `prisma migrate reset`
> çalıştıramaz. Her AI kodlama oturumundan önce zorunlu olmalı.
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

## Lisans

[MIT](LICENSE) — kullan, fork'la, üstüne inşa et.

<div align="center">

AI ile kod üreten herkes için özenle yapıldı.
**Bacon'unuzu kurtardıysa repo'yu yıldızlayın. ⭐**

</div>
