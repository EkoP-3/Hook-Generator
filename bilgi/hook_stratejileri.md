# Hook Stratejileri — Kısa Video Kanca Rehberi (TR / EN)

> Amaç: Otomatik hook üretici aracın (Türkçe + İngilizce) bilgi tabanı.
> Kaynaklar: Kripz (@kripzi) hayvan Shorts'larında yapılan denemeler ve Studio verileri; Türkçe niş analizi (Everest Files, Kırmızı Pencere, Teoxus, Olay Kayıtları); Kallaway'in kanca hataları çerçevesi; `youtube-agent-skill` reposundaki kanca formülü ve puanlama fikri (MIT lisansı, Jake Schincariol — public yapacaksan README'de kaynak göster).
> Not: Buradaki sayılar ve eşikler sezgisel başlangıç noktalarıdır. Araç public olacaksa kendi verinle yeniden ayarla.

---

## 0. Tek cümlelik özet

İyi bir kanca **ilk 1–2 saniyede konuyu söyler**, izleyiciye **"sen"** diye seslenir, **bildiği bir şeyle (A) şaşırtıcı bir gerçeği (B) çarpıştırır** ve **cevabı hemen vermez**. Cevap videonun sonunda gelir.

---

## 1. Neden kanca? (ölçülebilir hedef)

- Shorts'ta asıl metrik **"izlemeye devam etti / kaydırmadı" oranıdır** (Studio → Analitik → İçerik → Shorts; API'de `SHORTS_FEED_IMPRESSIONS_VTR`).
- Kripz verisi:
  - Eski kapışma videoları ortalama ~%66.
  - Yeni kanca formatı (Kaz–Ördek) %70,2'ye çıktı ve kanal ortancasının ~4,5 katı izlendi.
  - Milyon izlenen videolar %76–79 aralığında.
  - **Hedef: ≥%75.**
- Kanca, videonun ilk ~2 saniyesinde bu oranı belirler. Gövde ise tamamlanma oranını belirler.

---

## 2. Kallaway'in 4 kanca hatası (her kancayı bu testten geçir)

| # | Hata | Test sorusu | Düzeltme |
|---|---|---|---|
| 1 | **Gecikme (Delay)** | Konu ilk 1–2 saniyede belli mi? | Selamlama ve giriş cümlesi yok. Konu ve hayvan adı ilk cümlede geçsin. |
| 2 | **Belirsizlik (Confusion)** | Cümle tek bir şekilde mi anlaşılıyor? | Tek fikir, kısa cümle, somut isim. Zamir ile başlama ("O aslında…"). |
| 3 | **Alakasızlık (Irrelevance)** | İzleyici "bu beni ilgilendiriyor" diyor mu? | "Sen" kullan. İzleyiciyi işin içine kat ("Bunu gözlerine bakarak anlayabilirsin"). |
| 4 | **İlgisizlik (Disinterest)** | Merak boşluğu var mı? | Bilinen A ile şaşırtıcı B arasında **karşıtlık** kur. Cevabı sakla. |

**Karşıtlık (contrast) kuralı:** Kanca = *izleyicinin inandığı şey* ↔ *gerçek*.

- TR: "Aslan kral olabilir. Ama su aygırını görünce o bile yolunu değiştirir."
- EN: "The lion is the king. But even he steps aside for a hippo."

---

## 3. Çelişki kancası (Kripz'in ana formatı)

İlk cümle mutlaka bir **çelişki** içerir. Kanıtlanmış kalıplar:

### 3.1 "Bu bir X değil." (görsel çelişki)

Ekranda izleyicinin X sandığı hayvan var, ses "bu X değil" diyor.

- TR: "Bu bir kurt değil. Ama genlerinde gerçek bir kurt saklıyor."
- TR: "Bu bir leopar değil. Beneklerine bakarsan hemen anlarsın."
- TR: "Bu bir timsah değil. Ve bunu dişlerine bakarak anlayabilirsin."
- EN: "This is not a wolf. But it still carries wolf DNA."
- EN: "That's not a leopard. Look at its spots."

Koşul: görüntü ilk karede sesle çelişmeli. Görüntü yoksa bu kalıp çalışmaz.

### 3.2 "En [sıfat] X aslında Y değil." (bilgi çelişkisi)

- TR: "Dünyanın en hızlı hayvanı çita değil."
- TR: "Dünyanın en uzun yılanı anakonda değil."
- EN: "The fastest animal on Earth isn't the cheetah."

### 3.3 Güç tersine dönmesi (av ↔ avcı)

- TR: "Köpekbalığı okyanusun en korkulan avcısı. Ama orkayı görünce bölgeyi aylarca terk ediyor."
- EN: "Great whites rule the ocean. Until an orca shows up. Then they vanish for months."

### 3.4 Akrabalık / kimlik çelişkisi

- TR: "Mors ile deniz aslanı akraba. Ama morsun dişleri yemek için değil, yürümek için."
- TR: "Kızıl panda, pandanın akrabası bile değil."
- TR: "Kara panter diye bir tür yok."
- EN: "A killer whale isn't a whale. It's a dolphin."

### 3.5 Renk / görünüş çelişkisi

- TR: "Kutup ayısı aslında beyaz değil." / "Zebra aslında siyah bir hayvan."
- EN: "Polar bears aren't white."

### 3.6 Zaman çelişkisi

- TR: "Piramitler yapılırken mamutlar hâlâ yaşıyordu."
- TR: "Köpekbalıkları ağaçlardan daha yaşlı."
- EN: "Sharks are older than trees."

---

## 4. Kanca + gövde şablonu (20–25 sn, ~50–60 kelime)

```
[KANCA]    Çelişki cümlesi (hayvan adı + "sen" + karşıtlık)          0–3 sn
[BÜYÜT]    "Çünkü …" / "Ama …" → meseleyi büyüt                     3–5 sn
[FARK 1]   "İlk fark …" + 1–2 kısa cümle (her cümlede görüntü değişir)
[FARK 2]   "İkinci fark …" + 1–2 kısa cümle
[SÜRPRİZ]  "Ve en ilginç kısmı…" + şaşırtıcı bilgi (mümkünse kancanın cevabı)
[KAPANIŞ]  Yorum çağıran tek soru
```

İngilizce karşılıkları:

| TR | EN |
|---|---|
| Çünkü… / Ama… | Because… / But… |
| İlk fark… / İkinci fark… | First difference… / Second… / Here's the tell… |
| Ve en ilginç kısmı… | And the craziest part… / But here's the wild part… |
| Kapışsalar hangisi kazanır? | Who wins in a fight? |
| Sence hangisi daha tatlı? | Which one is cuter? |
| Sence okyanusun gerçek kralı hangisi? | So who's the real king of the ocean? |

**Açık döngü (open loop):** Kancada açılan soru en geç "en ilginç kısmı"nda kapanır. İzleyici sona kadar kalırsa tamamlanma oranı artar. Shorts döngüye girdiğinde de ilk cümle sondaki soruya bağlanır.

---

## 5. Kapanış soruları (yorum tetikleyici)

- **Kapışma konularında:** "Kapışsalar hangisi kazanır?" / "Sence galip kim olur?" → izleyici taraf tutar, yorumlarda tartışma çıkar.
- **Tatlı konularda:** "Sence hangisi daha tatlı?"
- **Karizma ve estetikte:** "Sence hangisi daha karizmatik?"
- **Kaçınılacaklar:** "Abone olmayı unutma", "Beğenmeyi unutmayın" (döngüyü kırar), cevabı tek kelime ve tartışmasız olan sorular.

---

## 6. 21 kanca formülü (genel amaçlı; hayvan nişine uyarlanmış)

Kaynak: `youtube-agent-skill/hooks.json` fikri, kendi cümlelerimle ve niş örnekleriyle.

| Formül | Kalıp | TR örnek | EN örnek | Ne zaman bozulur |
|---|---|---|---|---|
| İstatistik | Şaşırtıcı sayı + ne anlama geliyor | "Su aygırının ısırığı aslanınkinin neredeyse üç katı." | "A hippo bites almost 3x harder than a lion." | Sayı uydurmaysa veya yuvarlak ve sıradansa |
| Başkasının sonucu | Başkasına olan şaşırtıcı şey | "Bu kobra onu ısırdı. 10 dakika sonra uyanıp kobrayı yedi." | "The cobra bit it. Ten minutes later it woke up and ate the cobra." | Kaynak belirsizse |
| Hata | İzleyicinin yaptığı yanlış | "Ayıdan koşarak kaçmaya çalışıyorsan hata yapıyorsun." | "If you'd run from a bear, you've already lost." | Hata gerçek değilse |
| Tersine çevirme | "Herkes X der, gerçek Y" | "Herkes kral aslan der. Asıl tehlike su aygırı." | "Everyone says the lion's king. It's not." | Y zayıfsa |
| İfşa | "Sana göstereceğim…" | "Bu ikisini ayırmanın tek yolu kuyrukta." | "There's one tell, and it's the tail." | Gösterilen şey zaten biliniyorsa |
| En'ler | En hızlı, en büyük, en tehlikeli | "Afrika'nın asıl tehlikeli devi aslan değil." | "Africa's deadliest giant isn't the lion." | Doğrulanamazsa |
| Saat | "X saniyede öğreneceksin" | "20 saniyede ikisini ayırmayı öğreneceksin." | "In 20 seconds you'll never mix these up again." | Videoda vaat tutulmazsa |
| Denedim | Deney sonucu | (yüzsüz kanalda zor) | "I watched 100 hours of orca footage. Here's what scares sharks." | Deney yoksa |
| Soru | Merak sorusu | "Bir ayıdan mı kaçarsın, kurttan mı?" | "Could you outrun a bear or a wolf?" | Soru evet/hayır ile bitip gidiyorsa |
| Önce / sonra | Aynı şeyin iki hali | "Bu yavru pembe değil. Ama 2 yıl sonra öyle olacak." (flamingo) | "Born grey. Turns pink." | Görsel yoksa |
| Söküm | Kalıbı parçalara ayır | (eğitim kanalı) | "I broke down the 10 most-viewed animal Shorts." | Nişe uymuyorsa |
| Yığın | A + B = sonuç | — | — | Hayvan nişinde nadir |
| Uyarı | "Şunu yapmadan önce…" | "Bir kurt görürsen sakın arkanı dönme." | "If you see a wolf, never turn your back." | Uyarı abartılıysa |
| Liste | "X şey" | "Kedinin sana asla söylemeyeceği 3 sır." | "3 things your cat will never tell you." | Liste uzunsa (Shorts'ta en fazla 3) |
| Kanıt | "İşte kayıt" | "Bu görüntü, orkanın beyaz köpekbalığını avladığı an." | "This is the moment an orca hunts a great white." | Görüntü kanıtlamıyorsa |
| İçeriden bilgi | "Kimsenin bilmediği…" | "Bunu hayvanat bahçesi bakıcıları bile bilmiyor." | "Even zookeepers don't know this." | Bilgi yaygınsa |
| İmkânsız iddia | Akıl almaz ama doğru | "Bu dev aslında yüzme bilmiyor." | "This giant can't even swim." | Doğru değilse (asla uydurma) |
| Karşılaştırma | A ↔ B | "Jaguar mı leopar mı? Farkı beneklerde." | "Jaguar or leopard? The spots tell you." | İki taraf da sıkıcıysa |
| Köken | "Her şey şununla başladı" | "Bütün köpekler aslında bir kurttan geliyor." | "Every dog started as a wolf." | Hikâye uzunsa |
| Son tarih | Zaman baskısı | (nadir) | — | Yapay aciliyet |
| Doğrudan hitap | "Eğer sen …san" | "Kedin varsa, bunu bilmen lazım." | "If you own a cat, you need to know this." | Hitap edilen kitle dar değilse |

**Kripz'de en iyi çalışanlar:** Karşılaştırma + Tersine çevirme + İmkânsız iddia + Doğrudan hitap. Genellikle iki formül tek kancada birleşiyor. Örnek: "Bu bir kurt değil" (tersine çevirme) + "ama genlerinde kurt saklıyor" (imkânsız iddia).

---

## 7. Niş analizinden çıkan kalıplar (Türkçe hayvan / gizem nişi, Ekim 2026)

Yöntem: ham izlenmeye değil, **videonun kendi kanalının ortancasını kaç kat geçtiğine (outlier katı)** bakılır. Bu ölçü büyük kanalı değil, güçlü fikri öne çıkarır.

| Kanal | Ortanca izlenme (yaklaşık) |
|---|---|
| Everest Files | 1,07 M |
| Olay Kayıtları | 814 K |
| Kırmızı Pencere | 112 K |
| Kripz | 44 K |
| Teoxus | 41 K |

**En yüksek outlier'ların ortak yapısı: izleyiciyi işin içine katan seri kalıplar.**

- "…Kurtulma Şansın?" serisi (Teoxus, 0,7–4,6 M) → *sen* + hayatta kalma
- "Hangi hayvanı yenebilirsin?" → *sen* + kapışma
- "…Size Asla Söylemeyeceği Sırlar" → gizli bilgi + evcil hayvan
- Kedi konuları (Kırmızı Pencere, 1,4–2,2 M) → geniş kitleli evcil hayvan

**Çıkarımlar:**

1. Herkesin tanıdığı hayvanlar (kurt, fil, kedi, aslan, köpekbalığı) küçük nişlerden (gecko, tapir) çok daha yüksek tavan yapar. Kripz'in hitleri: Kurtlar 5,2 M (x118), Fil 4,3 M.
2. Su hayvanlarında da büyük ve tanınan türler (köpekbalığı, orka, yunus, ahtapot) aynı kitleye hitap eder. Küçük ve bilinmeyen balıklardan kaçın.
3. Bilgilendirme ("X hakkında 5 bilgi") yerine **karşılaştırma ve kapışma** daha iyi etkileşim alır. Bilgi videoları yorumlarda dalga konusu oluyor.

---

## 8. Dil kuralları

### Türkçe

- **Konuşma dili:** "bildiğin", "gel gör ki", "bu eleman", "hatta". Düzgün, kitabi cümleler yapay zekâ metni gibi duruyor (TTS'te özellikle).
- **"Sen" hitabı:** sen / senin / seni / sana / sence ve "-sın / -sin / -sun / -sün" ekleri ("anlayabilirsin", "kaçabilir misin").
- **Bağlaçlar:** Ama, Çünkü, Hatta, Ve en ilginç kısmı, Peki.
- Cümleler kısa olsun (≤12 kelime), çünkü her cümlede görüntü değişiyor.
- **TTS telaffuzu:** Yabancı isimleri sese uygun yaz ("Husky" → "Haski"), altyazıda doğru yazımı kullan.
- **Türkçe büyük harf:** i → İ, ı → I (altyazı üretirken `str.upper()` yanlış sonuç verir).

### English

- **Hitap kelimeleri:** you, your, you're, yourself, "if you…".
- **Bağlaçlar:** But, Because, Here's the thing, And the craziest part, Turns out.
- **Uzunluk:** 9–24 kelimelik konuşma kancası ~150 kelime/dk hızda 10 saniyeye sığar. Shorts'ta ilk cümle ideal olarak ≤12 kelime.

### Her iki dilde

- **Sayı uydurma.** Emin değilsen basitleştir ("neredeyse üç katı", "on binlerce yıl"). Yanlış bilgi yorumlarda yakalanır ve güveni bitirir.
- **Belirsiz sıfatlardan kaçın:** inanılmaz, muhteşem, çılgın / amazing, insane, crazy. Bunların yerine somut bir sayı, isim veya ayrıntı koy.

---

## 9. Kanca puanlama modeli (araç için öneri)

Beş özellik, her biri 0–100. **Sonuç = 0,6 × ortalama + 0,4 × en düşük puan.** En zayıf halka ağırlıklı, çünkü tek ölü özellik kancayı sızdırır ve ortalama bunu gizler.

| Özellik | Ne ölçer | TR sinyalleri | EN sinyalleri |
|---|---|---|---|
| **Somutluk (Specificity)** | Sayı, isim, birim | rakam, "ton", "kilo", "km/sa", "yıl", özel isim | digits, %, x, kg, mph, proper nouns |
| **Hitap (Address)** | İzleyiciye konuşuyor mu? İlk 6 kelimede ise bonus | sen, senin, seni, sana, sence, -sın/-sin/-sun/-sün, -abilirsin | you, your, you're, yourself |
| **Risk (Stakes)** | Kaybetme veya tehlike | öl-, tehlike, kaç-, sakın, asla, kaybet-, avla- | lose, die, deadly, never, stop, before, risk |
| **Merak (Curiosity)** | Açık soru veya karşıtlık | ama, değil, aslında, neden, nasıl, hangisi, peki, bile, ? | why, how, which, but, actually, isn't, until, ? |
| **Kısalık (Brevity)** | Kelime sayısı | 7–16 kelime ideal (Türkçe sondan eklemeli, daha az kelime) | 9–24 words |

- **Ceza:** Kanca kendi cevabını aynı cümlede veriyorsa ("…çünkü…", "…yani…", "because", "which means") merak düşer. Belirsiz sıfatlar ve dolgu kelimeleri ("arkadaşlar", "merhaba", "bu videoda", "guys", "today") da puan düşürür.
- **Türkçe ek eşleme:** Kelime sınırına güvenme. Ekleri regex ile yakala, örneğin `\b\w+(sın|sin|sun|sün)\b`, `\bsen(i|in|ce|e)?\b`.
- **Uyarı (dürüstlük):** Bu tür sezgisel puanlama kötü kancayı iyi kancadan iyi ayırır, ama bir yaratıcının kendi hitlerini kendi başarısızlıklarından zayıf ayırır. Düşük puan "tekrar bak" demektir. Yüksek puan bir garanti değildir. Araç gerçek tutma verisiyle (stayed-to-watch) kalibre edilmeli.

---

## 10. Başlık ve ilk kare (kancanın görsel tarafı)

- **YouTube başlığı:** anahtar kelime başta, mobilde ~40 karakteri geçmesin, sonda duygu + konu emojisi. Örnekler: "Kurt mu Husky mi? Gözlerine Bak 😳🐺", "Orka mı Köpekbalığı mı? 😳🦈".
- **Ekrandaki üst başlık:** 2 satır, ikinci satır vurgulu. Örnek: "Bu Bir | *Kurt Değil*", "Köpekbalığının | *Tek Korkusu*".
- **İlk 0,5 saniye:** ekranda hareket olmalı (koşan, fırlayan, kameraya yürüyen hayvan). Konuşma 0. saniyede başlar, sessiz giriş yok.
- **Görsel–ses çelişkisi:** "Bu bir X değil" derken ekranda X'e benzeyen hayvan olmalı.
- **Açılış ve kapanış:** bölünmüş ekran (iki hayvan). Döngü hissi verir.

---

## 11. Kötü kanca örnekleri ve düzeltmeleri

| Kötü | Neden | İyi |
|---|---|---|
| "Merhaba arkadaşlar, bugün kaz ve ördeği karşılaştıracağız." | Gecikme + selam + merak yok | "Bu bir ördek değil. Ve aradaki farkı boynuna bakarak anlayabilirsin." |
| "Morslar çok ilginç hayvanlardır." | Belirsiz sıfat, karşıtlık yok | "Morsun dişleri yemek için değil, buzda yürümek için." |
| "Timsahlar ve aligatörler farklıdır çünkü burunları farklıdır." | Cevabı hemen veriyor | "Bu bir timsah değil. Ve bunu dişlerine bakarak anlayabilirsin." |
| "Hello guys, today we look at the fastest animal." | Delay + filler | "The fastest animal on Earth isn't the cheetah." |
| "O aslında çok tehlikeli." | Zamirle başlıyor, belirsiz | "Afrika'nın asıl tehlikeli devi aslan değil, su aygırı." |

---

## 12. Araç için önerilen girdi ve çıktı

**Girdi:**

```json
{
  "lang": "tr | en",
  "topic": "kurt vs husky",
  "subjects": ["kurt", "husky"],
  "verified_facts": ["huskylerin gözleri mavi olabilir", "yetişkin kurtta mavi göz neredeyse yok", "..."],
  "visual_first_frame": "kurda benzeyen gri husky kameraya yürüyor",
  "tone": "kapışma | tatlı | gizem",
  "format": "comparison | series_escape | secrets"
}
```

**Çıktı:** 5–10 kanca. Her birinde şunlar bulunsun:

- formül adı
- 5 özelliğin puanı ve toplam sonuç
- en zayıf özellik ve düzeltme önerisi
- uygun "Çünkü/Ama" cümlesi
- "en ilginç kısmı" bağlantısı
- kapanış sorusu
- ~40 karakterlik başlık

**Kurallar:**

1. Yalnızca `verified_facts` içindeki bilgileri kullan, yeni sayı üretme.
2. Görsel çelişki kalıbını sadece `visual_first_frame` bunu destekliyorsa öner.
3. Kancalar birbirinin farklı söylenişi olmasın; farklı formüller kullan.
4. Dil başına ayrı sözlük ve regex kullan. Türkçe ekleri hesaba kat.

---

## 13. Ölçme ve döngü

- Her videonun yayından 48 saat sonraki izlenme ve "devam etti" oranını kaydet. Kanca metnini, formülünü ve puanını yanına yaz.
- **Bir seferde tek değişken değiştir:** konu türü, kanca formülü veya ilk kare.
- 8–10 videoluk gruplarla değerlendir, tek video gürültüdür.
- Zamanla aracın puan ağırlıklarını gerçek orana göre ayarla. Örneğin basit bir regresyon kur: özellik puanları → stayed-to-watch.

---

## 14. Kendini eğiten sistem: tasarım ilkeleri

Araç her kullanımdan ve her videonun sonucundan öğrenecek. Bu tür sistemler genelde öğrenme algoritmasında değil, **veri kalitesinde** bozulur. Aşağıdaki 10 ilke bunun için.

### 14.1 Doğru sinyali ölç

- **Birincil hedef:** videonun "izlemeye devam etti" oranı (Shorts stayed-to-watch) ve **kanalın kendi ortancasına göre izlenme katı** (views / channel_median).
- **Zayıf sinyaller** (yalnızca yardımcı olarak): beğeni butonu, "iyi gitti" yorumu.
- **Ham izlenmeyle eğitme.** Sistem "büyük kanalın kancası iyidir" diye öğrenir. Her sonucu o kanalın son 20–30 videosunun ortancasına göre normalize et.
- **Toplama:** Yayından 48 saat sonra kullanıcıdan iki sayı iste (oran + izlenme). Mümkünse otomatik çek.

### 14.2 Üretilen ve yayınlanan kancayı ayrı kaydet

- Kullanıcılar metni seslendirirken değiştirir. Model kendi önerdiğini değil, **gerçekte yayınlanan** kancanın sonucunu öğrenmeli.
- `generated_hook`, `published_hook` ve aradaki fark (diff) ayrı alanlarda tutulsun.
- **Düzenlemeler ayrı bir eğitim verisi:** Kullanıcıların sürekli değiştirdiği kalıplar (kelime seçimi, uzunluk, ton) üretim istemine geri beslensin.

### 14.3 Karıştırıcı değişkenleri kaydet

Video kanca yüzünden değil konu veya ilk kare yüzünden de patlayabilir. Her kayıtta bulunsun:

- niş
- dil
- konu (ve konunun "geniş kitle" puanı)
- süre
- ilk kare türü (hareket var mı, görsel–ses çelişkisi var mı)
- yayın saati
- kanal büyüklüğü

Bunlar olmadan model konu etkisini kanca etkisi sanar. Analizde bu değişkenleri kontrol değişkeni olarak kullan.

### 14.4 Keşif–sömürü dengesi (çok kollu bandit)

- Saf "en iyiyi öğren" yaklaşımı birkaç haftada tek bir formüle çöker.
- Formül seçimini **Thompson sampling** (veya UCB) ile yap. Her kol bir formül, ödül normalize edilmiş tutma oranı.
- Önerilerin **~%20'si** her zaman az denenmiş veya yeni formüllerden gelsin.
- Bandit durumunu **niş × dil** bazında ayrı tut. Türkçe hayvan nişinde işe yarayan, İngilizce teknoloji nişinde yaramayabilir.

### 14.5 Eskime ve aşırı kullanım cezası

- Araç public olunca aynı kalıplar her yere yayılır ve izleyici bağışıklık kazanır.
- Formül başına performansı zamana göre izle (kayan pencere, ör. son 30 gün). Düşüş trendinde ağırlığı azalt.
- Çok sık üretilen kalıplara (aynı açılış kelimeleri, aynı yapı) **yenilik cezası** uygula. Aynı kullanıcıya art arda benzer kancalar önerme.

### 14.6 İkili tercih verisi (pairwise)

- Her istekte en az iki farklı formülden kanca sun ve kullanıcının seçimini kaydet.
- Video sonuçları haftalar alır, tercih verisi anında gelir. Bunu **ara sinyal** olarak kullan (ör. Bradley–Terry veya Elo ile formül sıralaması).
- Nihai ağırlıkta gerçek tutma verisi tercih verisinden daha önemli olsun.

### 14.7 Veri zehirlenmesine karşı koruma

- Public araçta sahte "%95 tuttu" verisi modeli bozabilir.
- **Kullanıcı güven puanı:** hesap yaşı, gönderilen veri sayısı, tutarlılık.
- **Aykırı değer tespiti:** kanal geçmişine göre imkânsız sıçramaları işaretle.
- Doğrulanmış (otomatik çekilmiş) veriye daha yüksek ağırlık, elle girilen veriye daha düşük.
- Tek bir kullanıcının modele etkisini sınırla (kullanıcı başına ağırlık tavanı).

### 14.8 Bilgi doğrulama katmanı

- Otomatik kanca üreten araçlar bir noktada sayı ve iddia uydurur. "En tehlikeli", "üç katı" gibi iddialar da en çok tıklanan şeylerdir.
- **Kural:** sayı, üstünlük ("en …") veya kesin iddia içeren her kanca ya kullanıcının verdiği `verified_facts` listesinden gelsin ya da **"doğrulanmadı"** diye işaretlensin.
- Mümkünse iddia başına kaynak bağlantısı iste veya otomatik ara.
- Yanlış bilgi yorumlarda yakalanır ve kullanıcının kanalına zarar verir. Bu, aracın itibarını da doğrudan etkiler.

### 14.9 Sürümleme ve geri dönüş

- Her yeni ağırlık seti veya istem sürümü, eğitimde kullanılmamış eski videolarda (holdout) **eski sürümden daha iyi tahmin yapıyorsa** yayına girsin.
- Sürümleri sakla (model, istem, sözlük). Performans düşerse tek komutla geri dön.
- Yeni sürümü önce kullanıcıların küçük bir kısmına aç (canary / A-B).

### 14.10 Gizlilik ve platform kuralları

- Kullanıcı kanal verisi için KVKK / GDPR açısından açık rıza, anonimleştirme, silme hakkı ve veri saklama süresi gerekir.
- YouTube verisi çekilecekse YouTube API Hizmet Şartları'na uy (OAuth kapsamları, veri saklama ve önbellek kuralları).
- Eğitim verisinde kanal adlarını ve kişisel bilgileri ayır, model sadece anonim özellikleri görsün.

---

## 15. Başlangıç veri seti (cold start): Kripz kaydı

İlk etiketli veriyi Kripz'in kendi videoları sağlayacak. Her yayından sonra bir satır eklenir:

```csv
tarih,dil,nis,konu,kanca_uretilen,kanca_yayinlanan,formul,celiski_turu,ilk_kare,sure_sn,specificity,address,stakes,curiosity,brevity,verdict,izlenme_48s,kanal_ortancasi,izlenme_kati,stayed_to_watch_48s
2026-11-08,tr,hayvan,orka vs kopekbaligi,"Köpekbalığı okyanusun en korkulan avcısı. Ama orkayı görünce bölgeyi aylarca terk ediyor.","Köpekbalığı okyanusların en korkulan avcısıdır. Ama nedense orkayı görünce aylarca bölgeyi terk ediyor.",Tersine çevirme + İmkânsız iddia,av-avci,hareket (fırlayan köpekbalığı),26.5,,,,,,,,,,
```

**Etiketlenecek mevcut videolar** (hepsi Kasım 2026, kanca formatı sabit):

- Kaz–Ördek
- Mors–Deniz aslanı
- Timsah–Aligatör
- Çita–Doğan
- Alpaka–Lama
- Zürafa
- Kedi–Köpek
- Kurt–Husky
- Aslan–Su aygırı
- Orka–Köpekbalığı
- Jaguar–Leopar

Tatil haftasının sonunda ~25 videoluk gerçek, etiketli bir başlangıç verisi olur.

**Bilinen referans değerler:**

- Eski format ortalaması ~%66.
- Kaz–Ördek %70,2 (izlenme katı ~x4,5).
- Milyonluk videolar %76–79.
