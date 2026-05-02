<div align="center">

# 🔒 repo-seatbelt

### AI kodlama agentlari reponuza dokunmadan önce bir güvenlik katmanı.

[![npm sürümü](https://img.shields.io/npm/v/repo-seatbelt?color=%230f172a&labelColor=%231e293b&style=flat-square)](https://www.npmjs.com/package/repo-seatbelt)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-%230f172a?labelColor=%231e293b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-%230f172a?labelColor=%231e293b&style=flat-square)](package.json)
[![Diller](https://img.shields.io/badge/diller-TR%20%2F%20EN-%230f172a?labelColor=%231e293b&style=flat-square)](#dil-desteği)

<br/>

**AI kodlama agentları güçlü. Belki fazla güçlü.**

`repo-seatbelt` projenizi tarar, riskli alanları tespit eder, AI araçlarınız için güvenlik kuralları üretir
ve reponuza 100 üzerinden bir **AI Güvenlik Puanı** verir.

<br/>

> **AI reponuza dokunmadan önce emniyet kemerini bağla.**

<br/>

[Hızlı Başlangıç](#hızlı-başlangıç) · [Komutlar](#komutlar) · [Puan Sistemi](#ai-güvenlik-puanı) · [Pano](#pano) · [English](README.md)

</div>

---

## Neden var?

Claude Code, Cursor, Codex, Gemini CLI gibi AI kodlama araçları gerçekten işlevsel. Ama repoda neyin kritik olduğunu bilmiyorlar. Herhangi bir kural olmadan bir agent şunları yapabilir:

- `.env` dosyanızı test değerleriyle ezebilir
- Geri alınamayan veritabanı migration dosyalarını silebilir
- "Düzelteyim" diye auth middleware'ini yeniden yazabilir
- Üretim veritabanında `prisma migrate reset` çalıştırır
- Tek bir hatayı düzeltmek için 12 yeni bağımlılık ekleyebilir
- Bir kelimeyi değiştirmeni isterken 30 dosyayı yeniden yazabilir

`repo-seatbelt`, siz ve AI araçlarınız arasında bir güvenlik sözleşmesi oluşturur. Agentların otomatik okuduğu kural dosyaları üretir, oturum başlamadan riskli alanları işaret eder ve değişiklikler commit edilmeden önce incelemenize yardımcı olur.

---

## Hızlı Başlangıç

```bash
# Kurulum gerekmez
npx repo-seatbelt init    # güvenlik kurallarını kur
npx repo-seatbelt scan    # AI Güvenlik Puanını gör
npx repo-seatbelt diff    # AI değişikliklerini commit etmeden incele
```

---

## Örnek Çıktı

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
  RİSK ÖZETİ
  ─────────────────────────────────────────────────────

  🔴  YÜKSEK RİSK  (2)

    ●  .env dosyası tespit edildi - protectedFiles listesinde yok
       → .repo-seatbelt.json'daki protectedFiles'a .env ekleyin

    ●  AGENTS.md bulunamadı - AI agentların güvenlik kuralı yok
       → AI kural dosyaları oluşturmak için repo-seatbelt rules çalıştırın

  🟡  ORTA RİSK  (1)

    ●  .env.example dosyası eksik

  🟢  DÜŞÜK RİSK  (1)

    ●  Test dosyası tespit edilmedi - AI değişiklikler için riskli
       → AI agentların kodunuzu değiştirmesine izin vermeden önce test ekleyin

  ─────────────────────────────────────────────────────
  AI KURAL DURUMU
  ─────────────────────────────────────────────────────

  ✓  .repo-seatbelt.json     bulundu
  ✗  CLAUDE.md               bulunamadı
  ✗  AGENTS.md               bulunamadı
  ✗  Cursor kuralları        bulunamadı

  ─────────────────────────────────────────────────────
  SONRAKI ADIMLAR
  ─────────────────────────────────────────────────────

  1. Güvenlik kurallarını ayarlamak için repo-seatbelt init çalıştırın.
  2. .env.example dosyası oluşturun ve tüm ortam değişkenlerini belgeleyin.
  3. Ayrıntılı eylem planı için repo-seatbelt doctor çalıştırın.

  Tarama tamamlandı.
```

---

## Kurulum

```bash
# Tek seferlik kullanım için kurulum gerekmez
npx repo-seatbelt scan

# Global kurulum
npm install -g repo-seatbelt

# Geliştirici bağımlılığı olarak ekle
npm install --save-dev repo-seatbelt
pnpm add -D repo-seatbelt
```

---

## Komutlar

| Komut | Ne yapar |
|-------|----------|
| `init` | Etkileşimli kurulum: `.repo-seatbelt.json`, `CLAUDE.md`, `AGENTS.md`, isteğe bağlı `.cursorrules` oluşturur |
| `scan` | Tam güvenlik taraması - AI Güvenlik Puanını, risk kategorilerini, AI kural durumunu ve sonraki adımları gösterir |
| `doctor` | Aynı tarama, ek olarak önceliklendirilmiş eylem planı ve geri alma kontrol listesi |
| `diff` | AI oturumu sonrası commit edilmemiş git değişikliklerini analiz eder - riskli dosyaları, yeni bağımlılıkları ve büyük refaktörleri işaret eder |
| `rules` | Tam init çalıştırmadan seçilen araçlar için AI kural dosyaları üretir |
| `protect <desen>` | Yapılandırmaya bir dosya veya glob deseni ekler |
| `check-command <komut>` | Çalıştırmadan önce bir shell komutunun tehlikeli olup olmadığını kontrol eder |
| `badge` | Mevcut puandan README rozeti üretir |
| `report` | `docs/repo-seatbelt-report.md` adresine markdown güvenlik raporu yazar |
| `dashboard` | `docs/repo-seatbelt-dashboard.html` adresinde çevrimdışı HTML panosu üretir |

### Tüm komutlarda geçerli bayraklar

```
--lang en|tr     Çıktı dili (yapılandırmayı geçer)
--json           Makine okunabilir JSON çıktı
--no-color       CI ve pipe kullanımı için renksiz çıktı
--verbose        Tam detaylar, kısaltma yok
```

---

## AI Güvenlik Puanı

Her tarama, ağırlıklı güvenlik kontrol noktalarından 0 ile 100 arasında bir puan üretir.

| Kontrol Noktası | Puan |
|-----------------|------|
| `.repo-seatbelt.json` mevcut | 10 |
| `.env.example` mevcut | 10 |
| `.env`, `protectedFiles` içinde | 8 |
| `AGENTS.md` mevcut | 8 |
| Veritabanı migrasyonları korunuyor | 7 |
| Auth dosyaları `approvalRequired` içinde | 7 |
| Ödeme dosyaları `approvalRequired` içinde | 7 |
| `CLAUDE.md` mevcut | 5 |
| Testler mevcut | 5 |
| Riskli `package.json` scriptleri yok | 5 |
| Şüpheli public env anahtarları yok | 5 |
| Tehlikeli komutlar yapılandırılmış | 5 |
| Env değişkenleri `.env.example` ile tutarlı | 5 |
| README mevcut | 3 |
| Git deposu | 3 |

**Puan eşikleri:**

| Puan | Etiket |
|------|--------|
| 80 - 100 | ✅ Güvenli |
| 60 - 79 | ⚠️ Dikkat gerekiyor |
| 40 - 59 | 🟠 Riskli |
| 0 - 39 | 🔴 AI agent için hazır değil |

---

## Neler Tespit Edilir

**Risk kategorileri ve tetikleyiciler:**

| Kategori | Tespit edilen sinyaller |
|----------|------------------------|
| 🔴 Ortam Değişkenleri | `.env` korunmuyor, `.env.example` eksik, örnekten eksik değişkenler, `NEXT_PUBLIC_` ile açığa çıkmış şifreler |
| 🔴 Veritabanı | Prisma/Drizzle/TypeORM/Sequelize migrasyonları korunmuyor, SQL dosyaları mevcut |
| 🔴 Kimlik Doğrulama | Auth dosyaları var ama `approvalRequired` içinde değil (NextAuth, Clerk, JWT, session, middleware) |
| 🔴 Ödeme | Ödeme dosyaları var ama `approvalRequired` içinde değil (Stripe, Paddle, İyzico, PayTR, Moka) |
| 🟡 Üretim Ortamı | Vercel, Netlify, Railway, Fly.io, Dockerfile, CI/CD yapılandırmaları korunmuyor |
| 🟡 Bağımlılıklar | Lock dosyası değişti, diff'te yeni paketler tespit edildi |
| 🟡 Refaktör | 10+ değişen dosya (orta), 25+ değişen dosya (yüksek) |
| 🟢 AI Kuralları | AGENTS.md, CLAUDE.md, Cursor kuralları eksik |
| 🟢 Dokümantasyon | Test yok, README yok |

---

## Yapılandırma

`repo-seatbelt init` komutu proje kökünde `.repo-seatbelt.json` oluşturur:

```json
{
  "version": "1",
  "mode": "solo",
  "language": "tr",
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

### Güvenlik modları

| Mod | Davranış |
|-----|----------|
| `solo` | Yardımcı uyarılar, tavsiye tonu. Kişisel projeler için iyi. |
| `team` | Daha güçlü onay gereksinimleri. PR incelemesini vurgular. |
| `strict` | Çok muhafazakâr. Tüm riskli alanlar varsayılan olarak engellenir. |

---

## Üretilen Dosyalar

### `CLAUDE.md`

Her oturumun başında Claude Code tarafından otomatik okunur. Claude'un neye dokunamayacağını, hangi komutların engellendiğini ve hangi dosyaların onay gerektirdiğini tanımlar.

### `AGENTS.md`

Evrensel AI agent kural dosyası. Claude Code, Codex ve AGENTS.md konvansiyonunu destekleyen agentlar tarafından desteklenir.

### `.cursorrules`

Cursor'a özel kural dosyası. Cursor editörü tarafından otomatik yüklenir.

---

## Tehlikeli Komut Kontrolü

Riskli bir komut çalıştırmadan önce:

```bash
npx repo-seatbelt check-command "prisma migrate reset" --lang tr
```

```
  ✗  Bu komut TEHLİKELİ.

  🔴  Prisma migrate reset
      Bu komutu açık onay olmadan çalıştırmayın.
```

```bash
npx repo-seatbelt check-command "git status" --lang tr
```

```
  ✓  Bu komut güvenli görünüyor.
```

Şunları destekler: `rm -rf`, `DROP TABLE`, `TRUNCATE`, `DELETE FROM` (WHERE olmadan), force push, `docker volume rm`, `vercel env rm` ve daha fazlası.

---

## Diff Analizi

AI oturumu sonrası, commit etmeden önce:

```bash
npx repo-seatbelt diff --lang tr
```

```
  ─────────────────────────────────────────────────────
  AI DIFF ANALİZİ
  ─────────────────────────────────────────────────────

  Değişen dosyalar             14
  Silinen dosyalar             2
  Yeni dosyalar                3
  Yeni bağımlılıklar           @radix-ui/react-dialog
  Lock dosyası değişti         evet
  .env dosyaları değişti       hayır
  Auth dosyaları dokunuldu     evet
  Ödeme dosyaları dokunuldu    hayır
  Migrasyonlar değişti         hayır
  Üretim konfig değişti        hayır
  Testler değişti              hayır

  Genel risk                   ORTA

  → Auth dosyaları değiştirildi
  → 14 dosya değişti

  ⚠  Riskli değişiklikler tespit edildi - commit etmeden önce dikkatlice inceleyin.
```

---

## Pano

```bash
npx repo-seatbelt dashboard --lang tr
```

`docs/repo-seatbelt-dashboard.html` adresinde bağımsız, çevrimdışı hazır bir HTML sayfası üretir:

- Renk kodlamalı SVG halka puan göstergesi
- Risk istatistik kartları (yüksek / orta / düşük sayıları)
- Framework, auth, ödeme, test bilgilerini içeren proje paneli
- AI kural durumu tablosu
- Korunan dosyalar ve engellenen komutlar listeleri
- Etkileşimli geri alma kontrol listesi (tıklayarak işaretleme)
- Mobil uyumlu tam duyarlı tasarım
- Türkçe ve İngilizce çıktı (`--lang en` / `--lang tr`)

Sunucu yok, CDN yok, izleme yok, dış istek yok.

---

## Dil Desteği

Her yüzey Türkçe ve İngilizce'yi destekler: CLI çıktısı, komut istemleri, raporlar ve pano.

```bash
repo-seatbelt scan --lang tr
repo-seatbelt doctor --lang tr
repo-seatbelt dashboard --lang tr
repo-seatbelt report --lang tr
```

`repo-seatbelt init` sırasında kalıcı olarak ayarlanır veya `.repo-seatbelt.json` içinde:

```json
{ "language": "tr" }
```

İngilizce README: [README.md](README.md)

---

## Desteklenen AI Araçları

| Araç | Üretilen kural dosyası |
|------|----------------------|
| Claude Code (Anthropic) | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| Codex / ChatGPT (OpenAI) | `AGENTS.md` |
| Gemini CLI (Google) | `AGENTS.md` |
| Aider | `AGENTS.md` |
| Windsurf | `AGENTS.md` |

---

## Desteklenen Frameworkler

Next.js · React · Vite · Node.js · Express · Fastify · NestJS · Remix · Astro · Nuxt · React Native · Expo · SvelteKit · Angular · Vue

---

## Yol Haritası

- [ ] GitHub Actions entegrasyonu
- [ ] Pre-commit hook desteği
- [ ] VS Code eklentisi
- [ ] Monorepo desteği (`pnpm workspaces`, Turborepo)
- [ ] Daha fazla framework ön ayarı (SvelteKit, Expo Router)
- [ ] Yeni bağımlılıklar için çevrimdışı CVE kontrolü
- [ ] Özel kural eklentileri
- [ ] Daha fazla dil (Almanca, Fransızca, İspanyolca)

---

## Katkı

Sorunlar ve PR'lar memnuniyetle karşılanır. Büyük değişiklikler göndermeden önce bir sorun açın.

```bash
git clone https://github.com/berkcangumusisik/repo-seatbelt.git
cd repo-seatbelt
npm install
npm run build
node dist/cli.js scan --lang tr
```

---

## Paylaş

`repo-seatbelt` reponuzu kötü bir AI oturumundan kurtardıysa:

> AI kodu değiştirmeden önce `npx repo-seatbelt scan` çalıştırdım. Hiç bilmediğim 3 yüksek riskli alan buldu. Her AI kodlama oturumundan önce zorunlu olmalı.
> github.com/berkcangumusisik/repo-seatbelt

---

## Yıldız Geçmişi

<a href="https://www.star-history.com/?type=date&repos=berkcangumusisik%2Frepo-seatbelt">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=berkcangumusisik/repo-seatbelt&type=date&legend=bottom-right" />
 </picture>
</a>

---

## Lisans

[MIT](LICENSE) - kullan, fork'la, üzerine inşa et.

