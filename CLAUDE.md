# Claude Code Güvenlik Kuralları

> [repo-seatbelt](https://github.com/berkcangumusisik/repo-seatbelt) tarafından oluşturuldu · Güvenlik modu: `strict`

## ÖNEMLİ - Herhangi Bir Şeyi Değiştirmeden Önce Okuyun

Bu depo repo-seatbelt tarafından korunmaktadır. Bu kurallar her oturum için geçerlidir.

---

## İzin Olmadan Dokunmayın

Aşağıdaki dosyalar ve klasörler **kesinlikle korunmaktadır**. Geliştirici açıkça izin vermedikçe okumayın, değiştirmeyin veya silmeyin:

- `.env`
- `.env.*`
- `prisma/migrations/**`
- `migrations/**`
- `**/migrations/**`

---

## Değiştirmeden Önce Sorun

Bu alanlar, değişiklik yapmanız için geliştiricinin açık onayını gerektirir:

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

**Nasıl sorulur:** "`[dosya]`'yı değiştirmem gerekiyor - uygun mu?" deyin ve onay bekleyin.

---

## Bu Komutları Asla Çalıştırmayın

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

Bunlardan birini çalıştırmanız gerekiyorsa, devam etmeden önce **neden gerektiğini açıklayın ve açık onay isteyin**.

---

## Güvenlik Modu: STRICT


- Tüm veritabanı, auth, ödeme ve prod yapılandırmasını varsayılan olarak engelli kabul edin
- Önemsiz olmayan her değişiklik için açık onay isteyin
- Script'leri önce göstermeden çalıştırmayı reddedin


---

## Genel İlkeler

- Amacı gerçekleştiren en küçük değişikliği yapın
- Mevcut kod stilini ve kalıplarını koruyun
- Riskli işlemler için yapmadan önce ne yapacağınızı açıklayın
- İstenen kapsam dışında bir şey fark ederseniz belirtin ama düzeltmeyin
- Değişiklik yaptıktan sonra testler mevcutsa çalıştırın

---

## Proje Bilgileri

```json
{
  "mode": "strict",
  "projectType": "other",
  "language": "tr",
  "selectedTools": []
}
```

*Bu dosya [repo-seatbelt](https://github.com/berkcangumusisik/repo-seatbelt) tarafından oluşturuldu. Projeniz geliştikçe güncelleyin.*
