# Kanca Üretici (Hook-Generator)

Türkçe ve İngilizce kısa video (Shorts / Reels / TikTok) kancası üreten sistem. **Kendi kendine öğrenmez.** Proje sahibinin verdiği veriye ve aylık niş analizine bakılarak, sahibin onayıyla elle güncellenen sürümlerle gelişir.
Bilgi tabanı: `bilgi/hook_stratejileri.md` (kurallar, 21 formül, §9 puanlama, §15 ilk veri seti). Kanca yazarken **her zaman** bu dosyayı ve `bilgi/surumler.md`'deki en son onaylı değişiklikleri esas al.

## Kullanıcı ve çalışma biçimi

- Proje sahibi ve ilk kullanıcı: **Kripz** (@kripzi, kanal ID `UCJTmbECTe9UwmJYGaBWqT5w`). Yüzsüz, Türkçe hayvan Shorts kanalı. Ortanca izlenme ~44K, "izlemeye devam etti" hedefi **≥%75**.
- Kısıtlar: **0 TL bütçe**, **kod bilgisi yok**, haftada **4–5 saat**.
- Kullanıcıyla **Türkçe**, kısa ve sade konuş. Kod gösterme, teknik terim kullanma. Ne yaptığını sonuç olarak anlat.
- Betikleri sen yazar ve çalıştırırsın. Kullanıcıdan komut çalıştırmasını isteme.
- Ücretli bir servis, kütüphane veya hesap önermeden önce sor. Varsayılan çözüm ücretsiz olmalı.
- Proje ileride public olacak ve gelir getirecek. Kod ve veri yapısını buna göre temiz tut, ama ilk sürümde ürün işlerine girme.

## Komutlar (kullanıcı bunları yazar)

### `kanca: <konu>`
1. Konu için 4–6 **doğrulanmış bilgi** öner. Her birine kaynak linki ekle (web araması). Kullanıcı onaylar veya düzeltir.
2. Kullanıcıdan (yoksa) ilk karede ne olduğunu sor (`visual_first_frame`, §12). "Bu bir X değil" kalıbını yalnızca görüntü destekliyorsa öner.
3. Formülleri `bilgi/formuller.json`'daki **öncelik listesinden** seç. **5 kanca**, her biri farklı formül. **1 tanesi** son 10 üretimde en az kullanılan formülden olsun (`veri/uretimler.jsonl`'a bak).
4. Her kancayı `arac/puanla.py` ile puanla. Göster: formül, 5 özellik puanı, sonuç, en zayıf özellik ve düzeltme önerisi.
5. 2–3 **ekran üst başlığı** öner (`Satır 1 | *Vurgu*`, §10).
6. Kullanıcı bir kanca seçince **tam metni** yaz (20–25 sn, 50–60 kelime, §4 şablonu, §8 dil kuralları). Metni kod bloğunda ver.
7. Kaydı `veri/uretimler.jsonl`'a, seçimi `veri/tercihler.csv`'ye yaz (`arac/veri.py` ile).

### `yayınladım: <YouTube linki>`
- Videoyu üretim kaydına bağla, `veri/videolar.csv`'ye satır aç.
- Yayınlanan kanca, varsayılan olarak seçilen metnin ilk cümlesidir. Kullanıcı değiştirdiyse yeni ilk cümleyi yazar. Döküm için vidIQ kredisi harcama.
- Üretilen ve yayınlanan kancayı ayrı alanlara yaz, fark varsa `duzenleme_var=1`.

### `sonuç: …`
- Kullanıcı sayıları ya da Studio ekran görüntüsünü verir. Birden fazla video toplu gelebilir.
- Oku ve `veri/videolar.csv`'deki doğru satıra yaz: izlenme, **"izlemeye devam etti" oranı** (Studio'daki gerçek oran), varsa ortalama izleme yüzdesi.
- Hangi videonun hangi satır olduğundan emin değilsen sor. Uydurma.
- Kanal ortancasını (son 25 video) ve izlenme katını güncelle.
- Kripz'in kendi sonuçları için vidIQ çağrısı **yapma**. Veri kullanıcıdan gelir.

### `niş analizi` (ayda bir)
- Referans kanallar: Kırmızı Pencere (@KirmiziPencere), Teoxus (@Teoxus), Everest Files (@EverestFiles0), Olay Kayıtları (@OlayKayıtları), Kripz (@kripzi). İngilizce için Aşama 3'te İngilizce hayvan kanalları eklenir.
- Her kanalın son ~60 Short'unun izlenmesini **ücretsiz** yoldan topla (tarayıcı / herkese açık sayfa). Kanal ortancası, video başına kat = izlenme / ortanca.
- En yüksek ~5–10 outlier'ın kanca dökümünü vidIQ'dan çek (`vidiq_video_transcript`). Aylık bütçe en fazla ~50 kredi.
- Sonucu `veri/nis/<YYYY-MM>.csv`'ye yaz: kanal, video_id, başlık, izlenme, ortanca, kat, kanca (ilk cümle), formül etiketi.
- Ver: kanal ortancaları, en yüksek outlier'lar, **tek ortak yapısal özellik**, Kripz için bir uyarlama (kopya değil).

### `değerlendir`
- Ayda bir ya da 8–10 yeni sonuç birikince çalıştır (`arac/rapor.py`).
- Girdi: Kripz sonuçları (`veri/videolar.csv`) + son niş analizi (`veri/nis/`).
- Çıktı: **değişiklik önerileri listesi** (ör. "TERS formülünü önceliğe al", "sözlüğe 'bildiğin' ekle", "Brevity aralığını 6–14 yap"). Her öneride gerekçe ve kanıt (video id'leri).
- **Hiçbir şeyi kendiliğinden değiştirme.** Kullanıcı önerileri tek tek onaylar.
- Onaylananları uygula, `bilgi/surumler.md`'ye yaz, sürüm numarasını artır, commit et.

## Çalışma skilleri

`.claude/skills/` altında Superpowers ve Ponytail skilleri var (kaynak ve lisans: `.claude/skills/KAYNAK.md`). Geliştirme işlerinde aktif kullan:

- Yeni özellik ya da davranış değişikliği → `brainstorming`, sonra `writing-plans`. Tasarım ve planlar `docs/superpowers/specs/` ve `docs/superpowers/plans/` altına.
- Kod yazarken → `test-driven-development` (önce başarısız test) + `ponytail` (en az kod: önce mevcut kod, sonra standart kütüphane; yeni bağımlılık yok).
- Hata, beklenmeyen davranış → `systematic-debugging` (kök neden bulunmadan düzeltme yok).
- "Bitti", "geçti", "çalışıyor" demeden önce → `verification-before-completion` (komutu çalıştır, çıktıyı oku, sonra söyle).
- Büyük bir iş bitince → `requesting-code-review` ya da `ponytail-review`.
- Birbirinden bağımsız 2+ iş → `dispatching-parallel-agents`.

Bu dosyadaki kurallar skillerden önce gelir:
- Kullanıcıyla Türkçe, sade konuş; skillerin süreç terimlerini kullanıcıya taşıma.
- Kanca üretimi (`kanca:`, `sonuç:` vb.) bir geliştirme işi değildir; bu skiller gerekmez.
- Prototip (`prototip/`) atılabilir deneme sayılır. TDD zorunlu değil ama puanlama eşlik kontrolü her zaman çalışır.

## Değişmez kurallar

- **Sayı uydurma.** Sayı, "en …" veya kesin iddia içeren her cümle onaylı bilgiden gelir. Yoksa **"doğrulanmadı"** diye işaretle (§14.8).
- Kancalar birbirinin farklı söylenişi olmasın. Her biri farklı formül.
- Bir seferde **tek değişken** değiştir. 8–10 videodan az veriyle kural önerme. Tek video gürültüdür.
- Ham izlenmeyle karar verme. Her sonucu kanalın kendi ortancasına göre normalize et (§14.1).
- Kurallar, sözlükler ve formül öncelikleri **yalnızca onaylı sürümle** değişir.
- Türkçe veri İngilizce kuralları değiştirmez (dil başına ayrı değerlendirme).
- Kullanıcı verisi toplanmaz ve saklanmaz. Sistemin tek veri kaynağı proje sahibi ve herkese açık niş verisidir.
- Studio'ya veya bir hesaba erişirken şifre girme. Oturum kapalıysa kullanıcıdan açmasını iste.
- Türkçe büyük harf: i → İ, ı → I (`str.upper()` kullanma).

## Dosya yapısı

```
CLAUDE.md                     bu dosya
bilgi/hook_stratejileri.md    bilgi tabanı (kullanıcının dosyası)
bilgi/formuller.json          21 formül + çelişki türleri, kısa kodlar, "oncelik" alanı
bilgi/sozluk_tr.json          §9 sinyal kelimeleri, Türkçe ek regex'leri, cezalar
bilgi/sozluk_en.json          aynısı İngilizce
bilgi/surumler.md             sürüm geçmişi: tarih, değişiklik, gerekçe, kanıt video id'leri
arac/puanla.py                §9 puanlama: 5 özellik 0–100, sonuç = 0,6×ort + 0,4×min
arac/veri.py                  kayıt ekleme/güncelleme + şema kontrolü
arac/rapor.py                 değerlendirme: öneri listesi üretir, dosya değiştirmez
testler/                      python3 -m unittest discover testler
veri/uretimler.jsonl          her istek: girdi, bilgiler + kaynaklar, 5 varyant + puanlar, seçilen, sürüm
veri/videolar.csv             her yayın = 1 satır
veri/tercihler.csv            sahibin seçimleri: tarih, uretim_id, kazanan_formul, kaybeden_formul
veri/nis/<YYYY-MM>.csv        aylık niş analizi
veri/ham/                     ham referans veri (vidIQ, 2026-11-07)
prototip/kaynak.html          web sitesi prototipi (Aşama 4 için deneme; Claude üretimini sayfa içinden çağırır)
prototip/puanla.js            arac/puanla.py'nin tarayıcı sürümü (Python ile birebir aynı sonuç vermeli)
prototip/build.py             kaynak.html + puanla.js + formuller.json → prototip/index.html
```

`arac/puanla.py` veya sözlükler değişirse `prototip/puanla.js`'yi de güncelle, eşlik kontrolünü çalıştır, sonra `python3 prototip/build.py`.

Teknoloji: Python 3, **yalnızca standart kütüphane** (kurulum yok). Veri CSV/JSONL. Sürümleme git ile.
CSV'yi elle düzenleme, `arac/veri.py` üzerinden yaz.

### `veri/videolar.csv` sütunları

`video_id, uretim_id, kanal, yayin_zamani, dil, nis, konu, genis_kitle, formul, celiski_turu, ilk_kare_hareket, gorsel_ses_celiski, sure_sn, kanca_uretilen, kanca_yayinlanan, duzenleme_var, ust_baslik, surum, specificity, address, stakes, curiosity, brevity, skor, izlenme_48s, devam_orani_48s, ort_izleme_yuzdesi, kanal_ortancasi, izlenme_kati, veri_kaynagi, not`

- `genis_kitle`: 1–3 (3 = kurt, kedi, köpekbalığı gibi herkesin tanıdığı hayvan).
- `formul`: `bilgi/formuller.json` kodları, birden fazlaysa `+` ile (ör. `TERS+IMKANSIZ`).
- `surum`: kancanın üretildiği kural sürümü (ör. `v0.1`).
- `devam_orani_48s`: Studio'daki "izlemeye devam etti" oranı. 48 saatlik değer yoksa güncel değer yazılır ve `not`'a belirtilir.
- `veri_kaynagi`: `studio` / `elle`.

## Sürüm döngüsü

1. Üret: onaylı sürümün kurallarıyla.
2. Yayınla ve sonucu ver: kullanıcı istediği zaman, toplu.
3. Niş analizi: ayda bir.
4. Değerlendir: öneriler → kullanıcı onayı → yeni sürüm (`bilgi/surumler.md`) → herkes bu sürümü kullanır.

## Aşamalar

- [ ] **Aşama 0 — Kurulum**
  - [x] CLAUDE.md, bilgi tabanı depoda
  - [x] vidIQ bağlı (aylık 150 kredi, yalnızca niş analizinde döküm için)
  - [x] `bilgi/formuller.json` (öncelik dahil), `sozluk_tr.json`, `sozluk_en.json`
  - [x] `arac/puanla.py` + testler (§11: her "iyi" kanca "kötü" karşılığından yüksek puan almalı)
  - [x] `arac/veri.py`, boş `veri/` dosyaları, `bilgi/surumler.md` (v0.1 = bilgi tabanının ilk hali)
  - [ ] §15'teki 11 videonun kancaları ve formül etiketleri (kullanıcı onaylar; sonuçları kullanıcı verince eklenir)
  - [ ] Uçtan uca deneme: `kanca: kurt vs husky`
- [ ] **Aşama 1 — Kullanım (4–6 hafta):** haftada 2–3 video, sonuçlar kullanıcıdan toplu. İlk `niş analizi`.
- [ ] **Aşama 2 — İlk değerlendirme:** ~15–25 sonuçlu video + 1–2 niş analizi → ilk onaylı sürüm (v0.2). Puan ağırlıkları gerçek oranla karşılaştırılır, değişiklik öneri olarak sunulur.
- [ ] **Aşama 3 — İngilizce:** İngilizce hayvan kanallarıyla niş analizi, İngilizce kuralları güçlendir.
- [ ] **Aşama 4 — Ürün:** hesapsız, veri toplamayan basit web sayfası. Kullanıcı konuyu yazar, onaylı sürümle kanca alır. Ücretsiz barındırma. Yapay zekâ maliyeti için çözüm bu aşamada seçilir (ücretli bir şey önermeden önce sor). README'de kaynak gösterimi (youtube-agent-skill, MIT, Jake Schincariol; Kallaway).
- [ ] **Aşama 5 — Gelir:** freemium (aylık kanca hakkı). Ücretli planda niş analizi raporu ("senin nişinde ne tutuyor").

Kapsam dışı: kendi kendine öğrenme (bilgi tabanı §14.4 bandit, §14.6 kullanıcı tercih modeli), kullanıcı verisi toplama, "YouTube'u bağla" / OAuth, §14.7 veri zehirlenmesi koruması, §14.10 KVKK işleri, hesaplar, TikTok/Instagram verisi.

## Kararlar

- 2026-11-07 — MVP şekli: Claude + depo + standart kütüphaneli Python betikleri.
- 2026-11-07 — **Kürasyonlu sistem (v2):** sistem kendi kendine öğrenmez, kullanıcılardan veri alınmaz. Veri yalnızca proje sahibinden ve herkese açık niş verisinden gelir. Değişiklikleri Claude önerir, sahip onaylar, yeni sürüm herkese gider. (v1'deki otomatik öğrenme ve OAuth planının yerine geçti.)
- 2026-11-07 — Kripz sonuçlarını kullanıcı kendisi verir (sayı veya Studio ekran görüntüsü, istediği zaman). Asıl ölçü Studio'daki gerçek "izlemeye devam etti" oranı.
- 2026-11-07 — vidIQ kredisi 150/ay (her çağrı 5 kredi, 2 Aralık'ta yenilenir). Yalnızca niş analizinde outlier dökümleri için kullanılır, ayda en fazla ~50 kredi.
- 2026-11-07 — Not: `engagedViews / views` Studio oranının yerine geçmez (milyonluk videolarda ters sonuç verdi). Kullanılmıyor. Ham veri `veri/ham/` altında referans olarak duruyor.
- 2026-11-07 — İngilizce kanca üretilir. Türkçe veri İngilizce kuralları değiştirmez.
- 2026-11-07 — Doğrulanmış bilgileri Claude kaynak linkiyle araştırır, kullanıcı onaylar.
- 2026-11-07 — "Kanca" çıktısı: sesli ilk cümle + ekran üst başlığı + tam örnek metin.
