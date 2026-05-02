# AI Agent Güvenlik Kuralları

> [repo-seatbelt](https://github.com/berkcangumusisik/repo-seatbelt) tarafından oluşturuldu · Mod: strict · Araçlar: All AI tools

Bu dosya, bu depoda çalışan AI kodlama agent'ları için güvenlik kurallarını tanımlar.
**Herhangi bir değişiklik yapmadan önce bu kuralları okuyun ve uygulayın.**

---

## Temel Kurallar

1. **`.env` dosyalarını düzenlemeyin** - ortam değişkenleri geliştirici tarafından manuel olarak yönetilmelidir
2. **Migration dosyalarını silmeyin veya değiştirmeyin** - veritabanı migration'ları kritik ve genellikle geri alınamaz
3. **Auth veya ödeme dosyalarını** geliştirici onayı olmadan değiştirmeyin
4. **Yıkıcı komutları çalıştırmayın** - aşağıdaki engellenen komutlar listesine bakın
5. **Küçük, odaklı değişiklikler tercih edin** - açıkça istenmediği sürece büyük refaktörden kaçının
6. **Gerekmedikçe yeni bağımlılık eklemeyin** - geliştirici istemedikçe
7. **Riskli değişiklikleri uygulamadan önce açıklayın** - korunan dosyalara dokunan bir değişiklik için önce sorun
8. **Önce mevcut kalıpları kontrol edin** - yeni araçlar oluşturmadan önce var olan bir tane olup olmadığını kontrol edin
9. **İlgisiz dosyaları yeniden yazmayın** - istenen göreve odaklanın
10. **Üretim yapılandırmasını** açık onay olmadan değiştirmeyin
11. **Tüm veritabanı, auth ve ödeme alanlarını engelli kabul edin** - açıkça serbest bırakılmadıkça
12. **package.json'daki script'leri** önce geliştiriciye göstermeden çalıştırmayın
13. **approvalRequired listesindeki her dosya için onay isteyin**

---

## Korunan Dosyalar (Değiştirmeyin)

- `.env`
- `.env.*`
- `prisma/migrations/**`
- `migrations/**`
- `**/migrations/**`

---

## Açık Onay Gerektiren Dosyalar

Bu dosyalar için geliştirici "devam et" demeden dokunmayın:

- `auth/**`
- `lib/auth/**`
- `src/auth/**`
- `app/auth/**`
- `payment/**`
- `lib/payment/**`
- `src/payment/**`
- `middleware.ts`
- `middleware.js`
- `stripe/**`

---

## Engellenen Komutlar

Bu komutları açık onay olmadan hiçbir zaman çalıştırmayın:

- `rm -rf`
- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM`
- `prisma migrate reset`
- `prisma db push --force-reset`
- `git push --force`
- `git push -f`
- `docker volume rm`
- `vercel env rm`
- `railway volume delete`

---

## Genel Rehberlik

- **Emin değilseniz sorun.** Küçük bir kesinti, geri alınması zor bir hatadan daha iyidir.
- **Küçük commit'ler daha iyidir.** Büyük yeniden yazmalar yerine artımlı değişiklikler tercih edin.
- **Bitirmeden önce test edin.** Test mevcutsa, görevi tamamlamadan önce çalıştırın.
- **Geri alma planı.** Riskli değişiklikler yapmadan önce nasıl geri alınacağını düşünün.

---

## Proje Bilgileri

- **Güvenlik modu:** strict
- **Proje türü:** other
- **Dil:** tr

*Bu dosya [repo-seatbelt](https://github.com/berkcangumusisik/repo-seatbelt) tarafından oluşturuldu. Projeniz büyüdükçe güncel tutun.*
