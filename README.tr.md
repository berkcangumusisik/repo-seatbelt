<div align="center">

# 🔒 repo-seatbelt

### Yapay zekâ kodlama ajanları için güvenlik katmanı. Reponuza dokunmadan önce.

[![npm version](https://img.shields.io/npm/v/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![npm downloads](https://img.shields.io/npm/dm/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-%230f172a?labelColor=%231e293b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-%230f172a?labelColor=%231e293b&style=flat-square)](package.json)
[![MCP Hazır](https://img.shields.io/badge/MCP-haz%C4%B1r-%2310b981?labelColor=%231e293b&style=flat-square)](#mcp-sunucusu--%C3%A7al%C4%B1%C5%9Fma-an%C4%B1-koruma)
[![Diller](https://img.shields.io/badge/diller-EN%20%2F%20TR-%230f172a?labelColor=%231e293b&style=flat-square)](README.md)

<br/>

**Yapay zekâ kodlama ajanları güçlüdür. Belki fazla güçlü.**

`repo-seatbelt` projenizi tarar, riskli alanları tespit eder, **7 farklı yapay zekâ aracı**
için güvenlik kuralları üretir, **çalışma anında devreye giren MCP koruma sunucusu** sağlar,
**işlem öncesi git çengeli** ve **GitHub Actions iş akışı** kurar; reponuza 100 üzerinden
bir **Yapay Zekâ Güvenlik Puanı** verir — anadilinizde.

<br/>

> **Yapay zekâ dokunmadan önce, kemerini bağla.**

<br/>

[Hızlı Başlangıç](#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7) · [Komutlar](#komutlar) · [MCP Sunucusu](#mcp-sunucusu--%C3%A7al%C4%B1%C5%9Fma-an%C4%B1-koruma) · [Hazır Şablonlar](#haz%C4%B1r-%C5%9Fablonlar) · [CI / Çengeller](#cicd--git-%C3%A7engelleri) · [Puan Sistemi](#yapay-zek%C3%A2-g%C3%BCvenlik-puan%C4%B1) · [English](README.md)

</div>

---

## İçindekiler

1. [Neden var?](#neden-var)
2. [Hızlı Başlangıç](#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7)
3. [Ne elde edersiniz?](#ne-elde-edersiniz)
4. [Desteklenen Yapay Zekâ Araçları](#desteklenen-yapay-zek%C3%A2-ara%C3%A7lar%C4%B1)
5. [Komutlar](#komutlar)
6. [Hazır Şablonlar](#haz%C4%B1r-%C5%9Fablonlar)
7. [MCP Sunucusu — Çalışma Anı Koruma](#mcp-sunucusu--%C3%A7al%C4%B1%C5%9Fma-an%C4%B1-koruma)
8. [CI/CD & Git Çengelleri](#cicd--git-%C3%A7engelleri)
9. [İzleme Modu](#i%CC%87zleme-modu)
10. [Geçmiş Denetimi](#ge%C3%A7mi%C5%9F-denetimi)
11. [Yapay Zekâ Güvenlik Puanı](#yapay-zek%C3%A2-g%C3%BCvenlik-puan%C4%B1)
12. [Pano & Raporlar](#pano--raporlar)
13. [Yapılandırma Referansı](#yap%C4%B1land%C4%B1rma-referans%C4%B1)
14. [JSON Çıktısı](#json-%C3%A7%C4%B1kt%C4%B1s%C4%B1)
15. [Mimari](#mimari)
16. [Sıkça Sorulanlar](#s%C4%B1k%C3%A7a-sorulanlar)
17. [Yol Haritası](#yol-haritas%C4%B1)
18. [Katkıda Bulunma](#katk%C4%B1da-bulunma)
19. [Yıldız Geçmişi](#y%C4%B1ld%C4%B1z-ge%C3%A7mi%C5%9Fi)
20. [Lisans](#lisans)

---

## Neden var?

Claude Code, Cursor, Codex, Gemini CLI, Windsurf, Aider, Cline ve Zed gibi yapay zekâ
kodlama araçları gerçekten faydalıdır. Ama reponuzda neyin dokunulmaz olduğunu bilmezler.
Korkuluk olmadan bir ajan şunları yapabilir:

- 🔥 `.env` dosyanızı test değerleriyle ezebilir
- 🔥 Geri getirilemeyecek veritabanı göç dosyalarını silebilir
- 🔥 Kimlik doğrulama ara katmanını "temizlemek için" baştan yazabilir
- 🔥 Üretim veritabanında `prisma migrate reset` çalıştırabilir
- 🔥 Tek bir hatayı düzeltmek için 12 yeni bağımlılık ekleyebilir
- 🔥 "Tek bir metni değiştir" dediğinizde 30 dosyayı baştan kurgulayabilir

**`repo-seatbelt` bu sorunu dört katmanlı bir savunmayla çözer:**

| Katman | Ne yapar | Nasıl çalıştırılır |
|--------|----------|--------------------|
| **1. Sabit kurallar** | `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`, `CONVENTIONS.md`, `.clinerules`, `.rules` üretir; ajanlar oturum başında okur. | `npx repo-seatbelt rules` |
| **2. Çalışma anı MCP koruması** | Ajanların karar anında danıştığı canlı sunucu: `check_file_access`, `check_command`, `list_protections`. | `npx repo-seatbelt mcp` |
| **3. İşlem öncesi git çengeli** | Yüksek riskli işlemleri (commit) geliştiricinin makinesinden çıkmadan engeller. | `npx repo-seatbelt install-hooks` |
| **4. CI denetimi** | GitHub Actions iş akışı güvenlik puanını PR'a yorum olarak yazar; yüksek riskli değişikliklerde başarısız olur. | `npx repo-seatbelt ci` |

---

## Hızlı Başlangıç

```bash
# Sıfır kurulum
npx repo-seatbelt init                          # etkileşimli kurulum
npx repo-seatbelt init --preset nextjs-stripe   # veya hazır şablon uygula

# Günlük kullanım
npx repo-seatbelt scan                          # Güvenlik Puanı + riskler
npx repo-seatbelt diff                          # işlem öncesi yapay zekâ değişikliklerini incele
npx repo-seatbelt doctor                        # öncelikli aksiyon planı

# Kilitle
npx repo-seatbelt install-hooks                 # yüksek riskli işlemleri engelle
npx repo-seatbelt ci                            # GitHub Actions iş akışı kur
npx repo-seatbelt mcp --print                   # MCP istemci ayarını göster
```

---

## Ne elde edersiniz?

```text
.repo-seatbelt.json     ← makine okur yapılandırma (tek doğruluk kaynağı)
CLAUDE.md               ← Claude Code için kurallar
AGENTS.md               ← AGENTS.md uyumlu araçlar (Codex, Aider, Gemini)
CONVENTIONS.md          ← Aider için kurallar
.cursorrules            ← Cursor için kurallar
.windsurfrules          ← Windsurf için kurallar
.clinerules             ← Cline için kurallar
.rules                  ← Zed yapay zekâ asistanı için kurallar
.git/hooks/pre-commit   ← (isteğe bağlı) yüksek riskli işlemleri engeller
.github/workflows/      ← (isteğe bağlı) PR yorumlu CI denetimi
docs/repo-seatbelt-report.md       ← markdown güvenlik raporu
docs/repo-seatbelt-dashboard.html  ← etkileşimli HTML pano
```

Ayrıca: **çalışma anı MCP sunucusu** — ajanlar oturum sırasında ona başvurabilir.

---

## Desteklenen Yapay Zekâ Araçları

| Araç | Kural dosyası | Üretici | Çalışma anı MCP |
|------|--------------|---------|----------------|
| **Claude Code / Claude Desktop** | `CLAUDE.md` | ✅ | ✅ |
| **Cursor** | `.cursorrules` | ✅ | — |
| **Codex / ChatGPT** | `AGENTS.md` | ✅ | — |
| **Gemini CLI** | `AGENTS.md` | ✅ | — |
| **Windsurf** | `.windsurfrules` | ✅ | — |
| **Aider** | `CONVENTIONS.md` | ✅ | — |
| **Cline** | `.clinerules` | ✅ | — |
| **Zed AI** | `.rules` | ✅ | — |

> MCP destekli her istemci (Claude Desktop, Claude Code, Continue.dev vb.) repo-seatbelt
> sunucusuyla konuşabilir; karar anında canlı koruma sağlar.

---

## Komutlar

<details open>
<summary><b><code>init</code></b> — projeyi başlat</summary>

```bash
repo-seatbelt init                              # etkileşimli
repo-seatbelt init --yes                        # soru sormadan, varsayılanlarla
repo-seatbelt init --preset nextjs-stripe       # hazır şablon uygula
repo-seatbelt init --lang tr                    # Türkçe çıktı
```

`.repo-seatbelt.json`, `CLAUDE.md`, `AGENTS.md` (ve Cursor seçilirse `.cursorrules`)
oluşturur.

</details>

<details>
<summary><b><code>scan</code></b> — Güvenlik Puanı ve risk listesi</summary>

```bash
repo-seatbelt scan
repo-seatbelt scan --json            # makine okur
repo-seatbelt scan --verbose         # tüm ayrıntılar
repo-seatbelt scan --no-color        # kayıt için renksiz çıktı
```

Çatı (framework), paket yöneticisi, veritabanı, kimlik doğrulama ve ödeme sağlayıcılarını,
çevre değişkeni hijyenini, üretim ayarlarını ve yapay zekâ kural dosyalarının varlığını
inceler. 0–100 puan ve kategorilere ayrılmış risk listesi döner.

</details>

<details>
<summary><b><code>doctor</code></b> — öncelikli aksiyon planı</summary>

```bash
repo-seatbelt doctor
repo-seatbelt doctor --json
```

`scan` ile aynı veriyi öncelik sırasına dizilmiş yapılacaklar listesi olarak sunar.
İlk kurulum için idealdir.

</details>

<details>
<summary><b><code>diff</code></b> — işlem öncesi değişiklik incelemesi</summary>

```bash
repo-seatbelt diff
repo-seatbelt diff --json            # git çengelinin kullandığı biçim
```

Mevcut git değişikliklerini inceler. `.env` düzenlemeleri, kimlik doğrulama ve ödeme
dokunuşları, göç dosyası değişiklikleri, yeni bağımlılıklar, geniş kapsamlı yeniden
düzenlemeler ve eksik test kapsamı için uyarı verir. `info | low | medium | high`
düzeyinde genel risk döndürür.

</details>

<details>
<summary><b><code>rules</code></b> — kural dosyalarını üret</summary>

```bash
repo-seatbelt rules                                    # etkileşimli seçici
repo-seatbelt rules --all                              # 7 araca da
repo-seatbelt rules --tool claude,cursor,windsurf      # virgülle ayır
repo-seatbelt rules --tool aider                       # tek araç
repo-seatbelt rules --json                             # tümü + JSON özeti
```

Üzerine yazılmadan önce mevcut dosyalar `*.bak` uzantısıyla yedeklenir.

</details>

<details>
<summary><b><code>protect</code></b> — korunan yolları yönet</summary>

```bash
repo-seatbelt protect                          # mevcut korumaları listele
repo-seatbelt protect "config/secrets/**"      # desen ekle
repo-seatbelt protect --json
```

</details>

<details>
<summary><b><code>check-command</code></b> — kabuk komutunu doğrula</summary>

```bash
repo-seatbelt check-command "rm -rf node_modules"
repo-seatbelt check-command "git push --force" --json
```

`safe | dangerous` sonucunu gerekçeleriyle döndürür. Yerleşik desenler ile sizin
`blockedCommands` listenizi birlikte değerlendirir.

</details>

<details>
<summary><b><code>install-hooks</code></b> — işlem öncesi koruma</summary>

```bash
repo-seatbelt install-hooks                   # git pre-commit çengelini kur
repo-seatbelt install-hooks --force           # mevcut çengeli üzerine yaz (.bak alınır)
repo-seatbelt install-hooks --uninstall       # çengeli kaldır
```

Kurulan çengel `repo-seatbelt diff --json` çalıştırır; risk `high` ise işlemi (commit)
**engeller**. Gerektiğinde `git commit --no-verify` ile geçilebilir.

</details>

<details>
<summary><b><code>ci</code></b> — GitHub Actions iş akışı</summary>

```bash
repo-seatbelt ci                              # .github/workflows/seatbelt.yml oluştur
repo-seatbelt ci --force                      # üzerine yaz
repo-seatbelt ci --output ./custom.yml        # özel yol
```

Üretilen iş akışı:

- her gönderim ve PR'da `scan` çalıştırır
- PR'larda `diff` çalıştırır ve güvenlik puanı + bulgularla yorum yazar
- değişiklikler yüksek riskliyse CI'yi **başarısız sayar**

</details>

<details>
<summary><b><code>watch</code></b> — kuralları otomatik güncel tut</summary>

```bash
repo-seatbelt watch                           # 500ms erteleme (varsayılan)
repo-seatbelt watch --debounce 1500
```

Yeni hassas klasörleri (`auth/`, `payment/`, `stripe/`, …) ve repo köküne eklenen
`.env*` dosyalarını fark eder; `.repo-seatbelt.json`'u günceller ve **mevcut tüm
kural dosyalarını yeniden üretir**. Ek bağımlılık yoktur — Node'un yerleşik `fs.watch`
sistemini kullanır.

</details>

<details>
<summary><b><code>audit</code></b> — git geçmişi denetimi</summary>

```bash
repo-seatbelt audit                                 # son 500 işlem
repo-seatbelt audit --since "1 month ago"
repo-seatbelt audit --limit 1000 --json
```

Git geçmişinde şunları arar:

- işleme alınmış `.env` dosyaları
- dokunulmuş korunan dosyalar
- işlem başlığında engelli komut izleri
- "geniş kapsamlı yeniden düzenleme" işlemleri (≥25 dosya)

Mevcut bir repoya `repo-seatbelt`'i sonradan eklerken, kilitlemeden önce ne tür
hareketlerin yaşandığını görmek için idealdir.

</details>

<details>
<summary><b><code>update</code></b> — kural dosyalarını farkla yenile</summary>

```bash
repo-seatbelt update                          # farkı göster, onay iste
repo-seatbelt update --yes                    # sormadan uygula
repo-seatbelt update --diff-only              # sadece farkı göster, yazma
repo-seatbelt update --json
```

`.repo-seatbelt.json` üzerinden tüm kural dosyalarını yeniden hesaplar; `+N -M`
özetleri ve örnek satırlarla farkı yazdırır. Mevcut dosyalar `*.bak` olarak yedeklenir.

</details>

<details>
<summary><b><code>mcp</code></b> — çalışma anı MCP sunucusu</summary>

```bash
repo-seatbelt mcp                             # stdio MCP sunucusunu çalıştır
repo-seatbelt mcp --print                     # istemci yapılandırma örneğini göster
repo-seatbelt mcp --print --json
```

Ayrıntılar için: [MCP Sunucusu](#mcp-sunucusu--%C3%A7al%C4%B1%C5%9Fma-an%C4%B1-koruma).

</details>

<details>
<summary><b><code>badge</code></b> · <b><code>report</code></b> · <b><code>dashboard</code></b></summary>

```bash
repo-seatbelt badge                           # son taramadan README rozeti
repo-seatbelt badge --score 92 --json
repo-seatbelt report                          # docs/repo-seatbelt-report.md
repo-seatbelt dashboard                       # docs/repo-seatbelt-dashboard.html
```

</details>

---

## Hazır Şablonlar

Tekrarlayan ayar işinden kurtulun. Teknoloji yığınınızda neyin hassas olduğunu
bilen bir hazır şablon uygulayın.

| Şablon | Ne ekler |
|--------|----------|
| `nextjs-stripe` | `prisma/schema.prisma`, `.env.local`, `.env.production` korur. Stripe ödeme bildirimleri (webhook), `app/api/auth/**`, `next.config.*` için onay zorunluluğu koyar. Üretime karşı `stripe trigger` engeller. |
| `django` | `**/migrations/**`, `settings/production.py` korur. `auth/`, `payments/`, `manage.py` için onay ister. `manage.py flush` ve `reset_db` engeller. |
| `rails` | `db/migrate/**`, `db/schema.rb`, `config/credentials.yml.enc`, `config/master.key` korur. `rails db:drop`/`db:reset` engeller. |
| `expo` | `app.json`, `eas.json`, `google-services.json`, `GoogleService-Info.plist` korur. `eas build --profile production`, `expo publish` engeller. |
| `monorepo` | `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `packages/*/.env*` için çalışma alanına duyarlı koruma ekler. |
| `fastapi` | `alembic/versions/**`, `.env` korur. `alembic downgrade base` engeller. |

```bash
npx repo-seatbelt init --preset nextjs-stripe
```

> Hazır şablonlar üst üste eklemelidir — yapılandırmanızın yerine geçmez, üzerine
> birleşir.

---

## MCP Sunucusu — Çalışma Anı Koruma

Sabit kural dosyaları yalnızca ajan onları okursa işe yarar. **MCP sunucusu**, yapay
zekâ ajanlarının (Claude Desktop, Claude Code, Continue.dev ve diğer MCP istemcileri)
**karar anında** soracağı canlı bir JSON-RPC servisidir:

> *"Bu dosyayı düzenlemem güvenli mi?"*
> *"Bu kabuk komutu bu repoda izinli mi?"*

### Sunulan araçlar

| Araç | Amacı |
|------|-------|
| `check_file_access(path, operation)` | `allow` \| `ask` \| `block` döner. Her düzenleme öncesi çağırın. |
| `check_command(command)` | `safe` \| `warn` \| `block` ve gerekçeleri döner. Her kabuk komutu öncesi çağırın. |
| `list_protections()` | Korunan dosyaları, onay gerektiren desenleri, engelli komutları ve aktif modu listeler. |
| `scan_repo()` | Tam güvenlik taraması yapar; puanı ve riskleri döner. |

### Claude Desktop'a bağlama

```bash
npx repo-seatbelt mcp --print
```

Çıktıyı `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
dosyasına ya da işletim sisteminizdeki karşılığına ekleyin:

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

### Elle deneme

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_command","arguments":{"command":"rm -rf /"}}}' \
  | npx repo-seatbelt mcp
```

Şuna benzer bir yanıt alırsınız:

```json
{ "decision": "block", "reasons": ["Recursive force delete", "Matches blocked command: \"rm -rf\""] }
```

> MCP sunucusu **bağımlılıksızdır** — stdio üzerinden çalışan en küçük JSON-RPC,
> SDK yükü yoktur.

---

## CI/CD & Git Çengelleri

### İşlem öncesi çengel (yerel, gönderim öncesi)

```bash
npx repo-seatbelt install-hooks
```

Artık her `git commit` `repo-seatbelt diff --json` çalıştırır. Risk `high` ise işlem
açıklayıcı bir mesajla durdurulur. Bilinçli olarak geçmek için:

```bash
git commit --no-verify -m "kasıtlı yüksek riskli işlem"
```

### GitHub Actions iş akışı (uzak, her PR'da)

```bash
npx repo-seatbelt ci
git add .github/workflows/seatbelt.yml
git commit -m "chore: repo-seatbelt CI ekle"
```

İş akışı:

1. Her gönderim/PR'da `scan` çalıştırır
2. PR'larda `diff` çalıştırır; puan ve en kritik bulgularla kalıcı yorum bırakır
3. Değişiklik yüksek riskliyse denetimi **başarısız sayar**

Örnek PR yorumu:

```
## 🛡️ repo-seatbelt raporu

**Puan:** 71/100 — 4 risk bulundu

### Yüksek riskli bulgular
- .env dosyası değiştirildi (`.env.production`)
- Kimlik doğrulama dosyaları değiştirildi (`src/auth/middleware.ts`)

**Değişiklik riski:** high
- .env dosyaları değiştirildi
- Kimlik doğrulama dosyaları değiştirildi
```

---

## İzleme Modu

```bash
npx repo-seatbelt watch
```

Repo büyüdükçe kural dosyalarınızı eşzamanlı tutar. Sürekli çalışır, dosya sistemi
olaylarını ertelemeyle bekletir ve şu durumlarda `CLAUDE.md`, `AGENTS.md`, `.cursorrules`
gibi dosyaları kendiliğinden yeniden üretir:

- repo kökünde veya `src/`, `app/`, `lib/` altında yeni `auth/`, `payment/`, `stripe/`,
  `billing/` klasörü ortaya çıkarsa
- repo kökünde yeni bir `.env*` dosyası oluşursa

Çıktı:

```
  [14:23:01] Yapılandırma + 5 kural dosyası güncellendi
     +onay: src/payment/**
     +korunan: .env.staging
```

---

## Geçmiş Denetimi

```bash
npx repo-seatbelt audit --since "3 months ago"
```

Git geçmişinde riskli kalıpları arar. Kullanım örnekleri:

- Mevcut bir repoya `repo-seatbelt` ekledikten sonra geçmişteki hasarı görmek
- Bir dış geliştiricinin dalında güvenlik incelemesi yapmak
- Olay sonrası inceleme (postmortem) için kanıt toplamak

Örnek çıktı:

```
  🔴  env-committed (2)
     2024-09-12 a3f81de ali: .env.local
     2024-11-01 9c1d2bb veli: .env.production

  🟠  protected-touched (5)
     2025-02-04 4d8e7a1 ai-bot: prisma/migrations/20240204_drop_users/migration.sql

  🟡  large-refactor (1)
     2025-03-18 8b22f9c claude: 47 dosya değişti
```

---

## Yapay Zekâ Güvenlik Puanı

`repo-seatbelt`, "yapay zekâya hazır" olduğunuzu gösteren bir kontrol listesine göre
reponuzu puanlar:

| Aralık | Hüküm | Anlamı |
|--------|-------|--------|
| **80 – 100** | 🟢 Güvenli | Sağlam korumalar var. Çoğu ajan sorumlu davranır. |
| **60 – 79** | 🟡 Dikkat gerekli | Birkaç risk alanı var — uzun bir oturumdan önce gözden geçirin. |
| **40 – 59** | 🟠 Riskli | Önemli boşluklar var. `doctor` çalıştırın ve aksiyon planını izleyin. |
| **0 – 39** | 🔴 Hazır değil | `init` çalıştırmadan ajanları serbest bırakmayın. |

Puan, ağırlıklı kontrol noktalarından hesaplanır (çevre değişkeni hijyeni, kural dosyası
varlığı, riskli script'ler, çatı riski, çoklu paket yapısı vb.). Ayrıntı için
`scan --verbose`.

### Rozet ekleyin

```bash
npx repo-seatbelt badge
```

Çıktıdaki markdown'ı README'nize yapıştırın.

---

## Pano & Raporlar

```bash
npx repo-seatbelt report     # docs/repo-seatbelt-report.md
npx repo-seatbelt dashboard  # docs/repo-seatbelt-dashboard.html
```

HTML pano tamamen statiktir (derleme adımı yok, JS çatısı yok); puanı, risk dağılımını,
proje bilgilerini ve yapılandırılmış korumaları tek bakışta gösterir. Şirket içi
dokümantasyonunuza ekleyin ya da herhangi bir tarayıcıda yerel olarak açın.

---

## Yapılandırma Referansı

`.repo-seatbelt.json`:

```jsonc
{
  "version": "1",
  "mode": "strict",                   // "solo" | "team" | "strict"
  "language": "tr",                   // "en" | "tr"
  "projectType": "nextjs",
  "selectedTools": ["claude", "cursor"],

  "protectedFiles": [                 // onay olmadan oku/düzenle/sil yok
    ".env", ".env.*",
    "prisma/migrations/**",
    "config/credentials.yml.enc"
  ],

  "approvalRequired": [               // düzenlemeler açık insan onayı ister
    "auth/**", "lib/auth/**",
    "payment/**", "stripe/**",
    "middleware.ts"
  ],

  "blockedCommands": [                // ajanın reddetmesi gereken komutlar
    "rm -rf",
    "DROP TABLE",
    "prisma migrate reset",
    "git push --force"
  ],

  "ignoredPaths": [],                 // tarayıcının atladığı desenler
  "riskThresholds": {                 // puan → hüküm eşlemesi
    "low": 60, "medium": 40, "high": 0
  },
  "presets": ["nextjs-stripe"]
}
```

Elle ya da `repo-seatbelt protect` / `repo-seatbelt init` ile düzenleyin.

---

## JSON Çıktısı

Her komut script ve CI için `--json` destekler:

```bash
repo-seatbelt scan --json | jq '.score'
repo-seatbelt diff --json | jq '.overallRisk'
repo-seatbelt audit --json --since "1 week ago" | jq '.findings | length'
repo-seatbelt rules --json | jq '.written[] | .file'
repo-seatbelt badge --score 92 --json
```

İşlem öncesi git çengeli ve GitHub Actions iş akışı bu çıktıyı kullanır.

---

## Mimari

```text
┌──────────────────────────────────────────────────────────────┐
│                  .repo-seatbelt.json                         │
│        (tek doğruluk kaynağı — sizin sözleşmeniz)            │
└──────────────────────────────────────────────────────────────┘
            │
            ├─────────────► Sabit üreticiler (init / rules / update)
            │                  ├─ CLAUDE.md
            │                  ├─ AGENTS.md
            │                  ├─ .cursorrules / .windsurfrules
            │                  ├─ CONVENTIONS.md / .clinerules / .rules
            │
            ├─────────────► Tarayıcılar (scan / doctor / diff / audit)
            │                  ├─ çevre değişkeni hijyeni
            │                  ├─ kimlik doğrulama / ödeme / veritabanı tespiti
            │                  ├─ üretim ayarı tespiti
            │                  └─ kural dosyası varlığı + git geçmişi
            │
            ├─────────────► Yaptırım katmanı
            │                  ├─ işlem öncesi git çengeli (install-hooks)
            │                  ├─ GitHub Actions iş akışı (ci)
            │                  └─ izleme (otomatik yenileme)
            │
            └─────────────► MCP sunucusu (mcp)
                               ├─ check_file_access
                               ├─ check_command
                               ├─ list_protections
                               └─ scan_repo
```

---

## Sıkça Sorulanlar

<details>
<summary><b>Bu ajanımı yavaşlatır mı?</b></summary>

Sabit kural dosyaları oturum başında bir kez okunur — çalışma anı maliyeti sıfırdır.
MCP sunucusu her `check_file_access` çağrısında birkaç milisaniye ekler; bu, tek bir
modelin tek bir tokeniyle kıyaslandığında ihmal edilebilir.

</details>

<details>
<summary><b>Yapay zekâ bu kuralları aşabilir mi?</b></summary>

Sabit kurallar tavsiye niteliğindedir — düzgün davranan ajanlar bunlara saygı gösterir.
Sert yaptırım için **MCP sunucusunu** (karar anı) **işlem öncesi git çengeliyle**
(makine anı) birlikte kullanın. Çengel `--no-verify` ile geçilebilir, ancak bu
denetlenebilir, kasıtlı bir insan eylemidir.

</details>

<details>
<summary><b>Neden CLAUDE.md'yi elle yazmıyorum?</b></summary>

Yazabilirsiniz. Ama `repo-seatbelt` **7 farklı kural dosyasını** tek yapılandırmadan
eşzamanlı tutar, bir MCP sunucusu sağlar, CI'yi denetler ve geçmişi inceler.
Her proje için saatlerce iş tasarrufu demektir.

</details>

<details>
<summary><b>Node dışı projelere ne dersiniz?</b></summary>

Komut satırı aracı Node tabanlıdır, ama *ürettiği kurallar* dilden bağımsız markdown'dır.
Hazır şablonların çoğu (`django`, `rails`, `fastapi`, `expo`, …) Node dışı yığınlar içindir.

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

- [x] Sabit kural üreticileri (Claude, Cursor, AGENTS.md)
- [x] Windsurf, Aider, Cline, Zed üreticileri
- [x] İşlem öncesi git çengeli kurucusu
- [x] PR yorumlu GitHub Actions üreticisi
- [x] İzleme modu (dosya değişikliklerinde otomatik yenileme)
- [x] Git geçmişi denetimi
- [x] Farkı önizlemeli güncelleme komutu
- [x] Proje hazır şablonları (Next.js + Stripe, Django, Rails, Expo, FastAPI, Monorepo)
- [x] **Çalışma anı MCP koruma sunucusu**
- [x] Her komut için JSON çıktısı
- [ ] VS Code eklentisi (editör içi uyarılar + pano)
- [ ] İsteğe bağlı telemetri (anonim "korumalar X yakaladı" istatistikleri)
- [ ] Özel kural eklentileri
- [ ] Daha fazla dil (Almanca, Fransızca, İspanyolca)
- [ ] GitLab CI / Bitbucket Pipelines şablonları

---

## Katkıda Bulunma

Sorun bildirimleri ve birleştirme istekleri (PR) memnuniyetle karşılanır. Geniş
kapsamlı değişiklikler için önce sorun açın.

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

`repo-seatbelt` reponuzu kötü bir yapay zekâ oturumundan kurtardıysa:

> Claude Code'u kod tabanıma salmadan önce `npx repo-seatbelt scan` çalıştırdım.
> Haberim olmayan 3 yüksek riskli alan buldum. Sonra MCP sunucusunu ve işlem öncesi
> çengeli bağladım — artık ajanım `.env`'e dokunamıyor ya da `prisma migrate reset`
> çalıştıramıyor. Her yapay zekâ kodlama oturumundan önce zorunlu olmalı.
>
> github.com/berkcangumusisik/repo-seatbelt

---

## Yıldız Geçmişi

<a href="https://www.star-history.com/?repos=berkcangumusisik%2Frepo-seatbelt&type=date&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
 </picture>
</a>

---

## Lisans

[MIT](LICENSE) — kullan, çatalla, üzerine inşa et.

<div align="center">

Yapay zekâ ile kod üreten herkes için özenle yapıldı.
**İmdadınıza yetiştiyse repoyu yıldızlayın. ⭐**

</div>
