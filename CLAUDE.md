# Kanca Üretici (Hook-Generator)

Türkçe ve İngilizce kısa video (Shorts / Reels / TikTok) kancası üreten, yayınlanan videoların sonuçlarından öğrenen sistem.
Bilgi tabanı: `bilgi/hook_stratejileri.md` (kurallar, 21 formül, §9 puanlama, §14 öğrenme ilkeleri, §15 ilk veri seti). Kanca yazarken **her zaman** bu dosyayı esas al.

## Kullanıcı ve çalışma biçimi

- İlk kullanıcı: **Kripz** (@kripzi). Yüzsüz, Türkçe hayvan Shorts kanalı. Ortanca izlenme ~44K, "izlemeye devam etti" hedefi **≥%75**.
- Kısıtlar: **0 TL bütçe**, **kod bilgisi yok**, haftada **4–5 saat**.
- Kullanıcıyla **Türkçe**, kısa ve sade konuş. Kod gösterme, teknik terim kullanma. Ne yaptığını sonuç olarak anlat.
- Betikleri sen yazar ve çalıştırırsın. Kullanıcıdan komut çalıştırmasını isteme.
- Ücretli bir servis, kütüphane veya hesap önermeden önce sor. Varsayılan çözüm ücretsiz olmalı.
- Proje ileride public olacak ve gelir getirecek. Kod ve veri yapısını buna göre temiz tut, ama ilk sürümde ürün işlerine girme.

## Komutlar (kullanıcı bunları yazar)

### `kanca: <konu>`
1. Konu için 4–6 **doğrulanmış bilgi** öner. Her birine kaynak linki ekle (web araması). Kullanıcı onaylar veya düzeltir.
2. Kullanıcıdan (yoksa) ilk karede ne olduğunu sor (`visual_first_frame`, §12). "Bu bir X değil" kalıbını yalnızca görüntü destekliyorsa öner.
3. `arac/formul_sec.py` ile denenecek formülleri seç (hazır değilse §6 ve "Kripz'de en iyi çalışanlar" listesinden seç). **5 kanca**, her biri farklı formül, **1 tanesi keşif** (az denenmiş formül).
4. Her kancayı `arac/puanla.py` ile puanla. Göster: formül, 5 özellik puanı, sonuç, en zayıf özellik ve düzeltme önerisi.
5. 2–3 **ekran üst başlığı** öner (`Satır 1 | *Vurgu*`, §10).
6. Kullanıcı bir kanca seçince **tam metni** yaz (20–25 sn, 50–60 kelime, §4 şablonu, §8 dil kuralları). Metni kod bloğunda ver.
7. Kaydı `veri/uretimler.jsonl`'a, seçimi `veri/tercihler.csv`'ye yaz (`arac/veri.py` ile).

### `yayınladım: <YouTube linki>`
- Videoyu üretim kaydına bağla, `veri/videolar.csv`'ye satır aç.
- Yayınlanan kancayı videonun dökümünden oku (`vidiq_video_transcript`). Kullanıcıdan metin isteme.
- Üretilen ve yayınlanan kancayı ayrı alanlara yaz, fark varsa `duzenleme_var=1`.

### `sonuçları çek`
- 48 saati geçmiş ve sonucu boş videolar için vidIQ'dan (`vidiq_channel_analytics`, `filters='video==ID'`) şunları çek: `views`, `engagedViews`, `averageViewPercentage`, tutma eğrisi (`report='audience_retention'`, ilk %5–10).
- `devam_orani_48s` = `engagedViews / views` (Studio'daki "izlemeye devam etti" oranına en yakın ölçü; birebir aynı değil, bkz. Kararlar).
- Kanal ortancasını (son 25 video) ve izlenme katını güncelle.

### `değerlendir`
- 8–10 yeni sonuçlu video birikince çalıştır (`arac/rapor.py`).
- Formül bazında normalize sonuç, karıştırıcılara (konu, ilk kare, yayın saati) göre kırılım.
- Bulguları `ogrenilenler.md`'ye yaz: kural | kanıt (video id'leri) | durum (hipotez / doğrulandı / reddedildi).
- Puan ağırlığı veya sözlük değişirse yeni sürüm olarak commit et. Eski videolarda daha iyi tahmin etmiyorsa geri al (§14.9).

## Değişmez kurallar

- **Sayı uydurma.** Sayı, "en …" veya kesin iddia içeren her cümle onaylı bilgiden gelir. Yoksa **"doğrulanmadı"** diye işaretle (§14.8).
- Kancalar birbirinin farklı söylenişi olmasın. Her biri farklı formül.
- Bir seferde **tek değişken** değiştir. 8–10 videodan az veriyle kural koyma. Tek video gürültüdür.
- Ham izlenmeyle öğrenme. Her sonucu kanalın kendi ortancasına göre normalize et (§14.1).
- Öğrenme durumu **niş × dil** bazında ayrı. Türkçe veri İngilizce önerileri etkilemez.
- Studio'ya veya bir hesaba erişirken şifre girme. Oturum kapalıysa kullanıcıdan açmasını iste.
- Türkçe büyük harf: i → İ, ı → I (`str.upper()` kullanma).

## Dosya yapısı

```
CLAUDE.md                     bu dosya
bilgi/hook_stratejileri.md    bilgi tabanı (kullanıcının dosyası)
bilgi/formuller.json          21 formül + çelişki türleri, kısa kodlarla
bilgi/sozluk_tr.json          §9 sinyal kelimeleri, Türkçe ek regex'leri, cezalar
bilgi/sozluk_en.json          aynısı İngilizce
arac/puanla.py                §9 puanlama: 5 özellik 0–100, sonuç = 0,6×ort + 0,4×min
arac/formul_sec.py            §14.4 Thompson sampling (niş × dil), %20 keşif, son 30 gün, tekrar cezası
arac/veri.py                  kayıt ekleme/güncelleme + şema kontrolü
arac/rapor.py                 değerlendirme raporu
testler/                      python3 -m unittest discover testler
veri/uretimler.jsonl          her istek: girdi, bilgiler + kaynaklar, 5 varyant + puanlar, seçilen, istem sürümü
veri/videolar.csv             her yayın = 1 satır
veri/tercihler.csv            ikili tercih: tarih, uretim_id, kazanan_formul, kaybeden_formul
ogrenilenler.md               öğrenilen kurallar
```

Teknoloji: Python 3, **yalnızca standart kütüphane** (kurulum yok). Veri CSV/JSONL. Sürümleme git ile.
CSV'yi elle düzenleme, `arac/veri.py` üzerinden yaz.

### `veri/videolar.csv` sütunları

`video_id, uretim_id, kanal, yayin_zamani, dil, nis, konu, genis_kitle, formul, celiski_turu, ilk_kare_hareket, gorsel_ses_celiski, sure_sn, kanca_uretilen, kanca_yayinlanan, duzenleme_var, ust_baslik, specificity, address, stakes, curiosity, brevity, skor, izlenme_48s, engaged_48s, devam_orani_48s, ort_izleme_yuzdesi, erken_tutma, kanal_ortancasi, izlenme_kati, veri_kaynagi, not`

- `genis_kitle`: 1–3 (3 = kurt, kedi, köpekbalığı gibi herkesin tanıdığı hayvan).
- `formul`: `bilgi/formuller.json` kodları, birden fazlaysa `+` ile (ör. `TERS+IMKANSIZ`).
- `veri_kaynagi`: `vidiq` / `youtube_api` / `studio` / `elle`.

## Öğrenme döngüsü

1. Üret: kazanan formüller öne, %20 keşif.
2. Seçim: seçilen kanca, seçilmeyenlere karşı tercih verisi (anında gelen ara sinyal).
3. Sonuç: 48 saat sonra otomatik çekilir. Ödül = normalize devam oranı + izlenme katı.
4. Değerlendir: 8–10 videoda bir. ~25 videodan sonra puan ağırlıkları gerçek oranla ayarlanır.

## Aşamalar

- [ ] **Aşama 0 — Kurulum (1–2 hafta)**
  - [x] CLAUDE.md, bilgi tabanı depoda
  - [x] vidIQ: Kripz yetkili (UCJTmbECTe9UwmJYGaBWqT5w), Shorts listesi ve toplu istatistik `veri/ham/` altında
  - [ ] `bilgi/formuller.json`, `sozluk_tr.json`, `sozluk_en.json`
  - [ ] `arac/puanla.py` + testler (§11: her "iyi" kanca "kötü" karşılığından yüksek puan almalı)
  - [ ] `arac/veri.py`, boş `veri/` dosyaları
  - [ ] Geri dönük veri: §15'teki 11 video + diğer son Shorts (döküm + istatistik otomatik, formül etiketini Claude önerir, kullanıcı onaylar)
  - [ ] Ölçü ayarı: `engagedViews / views` ile Studio oranını 2–3 videoda karşılaştır (Kaz–Ördek = %70,2)
  - [ ] Uçtan uca deneme: `kanca: kurt vs husky`
- [ ] **Aşama 1 — Canlı döngü (4–6 hafta):** haftada 2–3 video. İngilizce kanca istenirse üretilir.
- [ ] **Aşama 2 — Öğrenme (~25 etiketli video):** `formul_sec.py`, `rapor.py`, puan ağırlıklarını ayarlama.
- [ ] **Aşama 3 — İngilizce:** İngilizce kanal veya test kullanıcısı gelince ayrı öğrenme durumu.
- [ ] **Aşama 4 — Ürün:** ücretsiz katmanlı web uygulaması, "YouTube'u bağla" (Google OAuth, `yt-analytics.readonly`), çoklu kullanıcı, §14.7 veri zehirlenmesi koruması, §14.10 KVKK/GDPR. README'de kaynak gösterimi (youtube-agent-skill, MIT, Jake Schincariol; Kallaway).
- [ ] **Aşama 5 — Gelir:** freemium (aylık kanca hakkı), ücretli planda otomatik öğrenme ve kanal analizi.

MVP dışı (Aşama 4'e kadar yapma): web arayüzü, çoklu kullanıcı, ödeme, TikTok/Instagram verisi.

## Kararlar

- 2026-11-07 — MVP şekli: Claude + depo + standart kütüphaneli Python betikleri. Web uygulaması Aşama 4'te.
- 2026-11-07 — Sonuç verisi **otomatik** çekilecek, kullanıcıdan ekran görüntüsü istenmeyecek. MVP'de vidIQ bağlantısı; kredi yetmezse kullanıcının kendi Google Cloud projesiyle ücretsiz YouTube Analytics API.
- 2026-11-07 — Studio'daki "izlemeye devam etti" (stayed to watch) oranı API'de birebir yok. Yerine `engagedViews / views` kullanılır ve Aşama 0'da Studio değerleriyle bir kez karşılaştırılır.
- 2026-11-07 — İngilizce kanca MVP'de üretilir. Öğrenme yalnızca Türkçe (Kripz) verisiyle yapılır.
- 2026-11-07 — Doğrulanmış bilgileri Claude kaynak linkiyle araştırır, kullanıcı onaylar.
- 2026-11-07 — vidIQ kredisi **150/ay** (her çağrı 5 kredi, 2 Aralık'ta yenilenir). Krediyi koru: mümkünse tek çağrıda çok video çek (`dimensions=['video']`). Video başına en fazla 2 çağrı (istatistik + tutma eğrisi). Kredi yetmezse ücretsiz YouTube Analytics API'ye geç.
- 2026-11-07 — İlk ölçüm: `engagedViews / views` yeni kanca formatında %61–64, eski kapışma videolarında %45–56 (Studio'daki yönle uyumlu). Ama milyonluk videolarda %53–55 çıktı (Studio'da %76–79). Muhtemelen tekrar izlemeler (döngü) `views`'u şişiriyor. Bu ölçü Studio değerleriyle ayarlanmadan ödül olarak kullanılmaz.
- 2026-11-07 — "Kanca" çıktısı: sesli ilk cümle + ekran üst başlığı + tam örnek metin.
