# Sürüm geçmişi

Kurallar, sözlükler ve formül öncelikleri yalnızca burada kayıtlı, kullanıcının onayladığı sürümlerle değişir.
Her sürümde: tarih, değişiklik, gerekçe, kanıt (video id'leri veya niş analizi dosyası).

## v0.1 — 2026-11-07

İlk sürüm. Kaynak: `bilgi/hook_stratejileri.md` (kullanıcının bilgi tabanı), Kripz deneyimi.

- `formuller.json`: 21 formül + 6 çelişki türü.
  - Öncelik 1: KARSILASTIRMA, TERS, IMKANSIZ, HITAP (§6, "Kripz'de en iyi çalışanlar").
  - Öncelik 3: DENEDIM, SOKUM, YIGIN, SON_TARIH (yüzsüz hayvan kanalına uymuyor).
- `sozluk_tr.json` / `sozluk_en.json`: §9 sinyalleri, ilk tahmin değerleri. Gerçek veriyle ayarlanmadı.
- `puanla.py`: sonuç = 0,6 × ortalama + 0,4 × en düşük − cezalar. §11'deki her iyi kanca kötü karşılığından yüksek puan alıyor (testlerde).
- Bilinen zayıflık: puanlama sezgisel. Düşük puan "tekrar bak" demek, yüksek puan garanti değil (§9 uyarısı). Aşama 2'de Studio oranlarıyla karşılaştırılacak.

### v0.1 eki — 2026-11-17: kanca motoru kalıp bankası (onay bekliyor)

- Yeni: `kaliplar_tr.json` / `kaliplar_en.json`. Sitenin "Konudan kanca üret" bölümündeki kendi motorumuzun (`prototip/motor.js`) kalıpları.
- Kural: sayı ve üstünlük iddiası yok, cevap verilmez. Konu yalnızca eksiz yapılarla kullanılır ("hakkında", "konusunda", "ile", soru eki).
- ISTATISTIK, ENLER, IMKANSIZ motorda yok. Bunlar doğrulanmış bilgi ister; yalnızca `kanca:` akışında Claude ile yazılır.
- Ölçüm (testler/motor.test.mjs, aynı 10 konu): ortalama puan TR 31,6 → 47,4, EN 38,0 → 49,6 (eski kalıp üreticiye göre).
- Kalıplar kural sayılır. Kullanıcı kalıp kalıp onaylar; değişiklikler yeni sürümle yapılır.
- Gözlenen sözlük boşluğu (öneri, uygulanmadı): TR risk kökleri "kaybet" içeriyor ama "kaybeden / kaybedersin" yazımını yakalamıyor (t→d yumuşaması). Öneri: köklere "kaybed" eklemek.
