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
