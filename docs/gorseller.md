# Site görselleri (Higgsfield)

## Güncel (2026-11-17): premium sürüm — sohbet uygulamasında deneme hakkıyla üretildi

İstem: `docs/higgsfield-istem.md`. Kaynak dosyalar kullanıcıdan (arşiv), dönüştürülmüş halleri `site/medya/`.
Framer'a GitHub raw adresinden `api.tree.assetReference` ile aktarıldı (mcp.framer.com yükleme adresi bu ortamda engelli).

| Dosya (`site/medya/`) | Kaynak | Kullanıldığı yer | Not |
|---|---|---|---|
| film-yatay.mp4 / .jpg | hf_20261116_223646_58a0b9a0 (1280×720, 9 sn) | Giriş, `KaydirFilm` masaüstü | ffmpeg `-g 2 -crf 23`, sessiz, faststart |
| film-dikey.mp4 / .jpg | hf_20261116_234159_945e9b25 (720×1280, 9 sn) | Giriş, `KaydirFilm` telefon (<810px) | aynı ayar |
| dongu.mp4 / .jpg | hf_20261117_022121_fd8bce44 (1280×720, 6 sn) | "Puan neyi ölçer" arka planı, `ArkaVideo` | `-crf 24` |
| logo-lacivert.png | hf_20261116_193003_a93263cc | Menü logosu, favicon, Apple simgesi | 512 px |
| logo-parlak.png | hf_20261117_033038_4bbe154c (şeffaf) | Alt bilgi logosu | 512 px |
| kapak.jpg | hf_20261117_043309_1b314d3e | Paylaşım görseli (og) | 1200×632 |

Kullanılmayan: hf_20261116_203104_cc62c922 ve hf_20261116_213145_11add3d3 (filmlerin ilk kare görselleri; poster olarak videonun ilk karesi kullanıldı).


## Güncel (2026-11-15, ikinci tur): konuyla ilgili görseller

Kullanıcı kararı: hayvan görseli yok, görseller kanca / kısa video konusuyla ilgili olsun. Maliyet 5 × 0,25 = 1,25 kredi (toplam ≈ 2,75).

| # | Kullanıldığı yer | Oran | Dosya | İstem (özet) |
|---|---|---|---|---|
| A | Giriş arka planı (parallax, %40 opaklık) | 16:9 | `hf_20261115_161957_6bc2ff09-30a3-4281-9c81-915ddc057713.png` | Açık gri zemin, sağda elde dikey video oynayan telefon, turuncu ilerleme çubuğu |
| B | Kart 1 "Konunu yaz" | 4:3 | `hf_20261115_161957_90a7941a-3e3a-4eeb-b524-232edbb74d54.png` | Telefon klavyesinde yazan eller, turuncu imleç |
| C | Kart 2 "5 farklı kanca" | 4:3 | `hf_20261115_161956_183d843d-fa58-4cf5-a4a2-63d053793767.png` | Lacivert zeminde sıra halinde 5 turuncu olta iğnesi |
| D | Kart 3 "0–100 puan" | 4:3 | `hf_20261115_161956_6981f2bf-07f4-4d0c-8c04-66ee5b240e08.png` | Lacivert gösterge, turuncu ibre |
| E | Paylaşım görseli (og) | 16:9 | `hf_20261115_161957_be6e6e08-2bb3-48d0-9998-e4b844f5507d.png` | Telefon ekranına takılmış turuncu olta iğnesi, lacivert zemin |

Favicon ilk turdan (#5) kalıyor. Aşağıdaki ilk turun 0–4 numaralı hayvan görselleri artık kullanılmıyor.

## İlk tur (kullanılmıyor, favicon hariç)

Üretim: 2026-11-15, model `gpt_image_2_6`, krediyle (deneme hakkı Claude Code'da geçmiyor).
Maliyet: 6 × 0,25 = **1,5 kredi**. Sınır: kullanıcı onayı olmadan 10 krediyi geçme.
Adres kökü: `https://d8j0ntlcm91z4.cloudfront.net/user_3FGKJwZUjhiRbNVK5hXtKOrbtvB/`

Ortak stil: soğuk açık kış ışığı, lacivert gölgeler, tek küçük turuncu güneş vurgusu, fotogerçekçi, yazısız.

| # | Kullanıldığı yer | Oran | Dosya | İstem (özet) |
|---|---|---|---|---|
| 0 | Giriş arka planı (kaydırmada parallax) | 16:9 | `hf_20261115_160847_1ca536b9-aca5-455c-91ae-d3932cd6d3d3.png` | Karlı çam ormanı, gün batımı, solda profilden gri kurt, ortada başlık için boşluk |
| 1 | Nasıl çalışır kart 1 | 4:3 | `hf_20261115_160848_c5eba5d1-0c14-4331-8ee2-355c80b19ac8.png` | Karlı ormanda gri kurt portresi |
| 2 | Nasıl çalışır kart 2 | 4:3 | `hf_20261115_160847_470bf31e-d936-476b-a866-19b887206742.png` | Mavi gözlü Sibirya husky'si, karda |
| 3 | Nasıl çalışır kart 3 | 4:3 | `hf_20261115_160847_2f0947de-2cb6-4366-ab82-908ff1317c51.png` | Soğuk denizde yüzeye çıkan orka, karlı dağlar |
| 4 | Paylaşım görseli (og) | 16:9 | `hf_20261115_160847_9569301a-eef2-4af7-b6a7-6e327c3949a4.png` | Karlı açıklıkta karşı karşıya kurt ve husky |
| 5 | Favicon | 1:1 | `hf_20261115_160848_8e9fc85c-1519-418c-91fc-660e7a24c7b7.png` | Lacivert zeminde turuncu olta iğnesi simgesi |

Film (kaydırınca oynayan video) üretilmedi: 10 sn ≈ 70 kredi. İleride deneme hakkıyla Claude sohbet uygulamasından üretilebilir.
