# Konudan kanca üretme — kurulum

Model: rakip sitelerdeki gibi hesapsız, günde birkaç yapay zekâ hakkı; hak ya da kota bitince
hazır kalıplar (ReelForge modeli). Maliyet 0 TL: Cloudflare Workers ücretsiz plan + Google Gemini ücretsiz katman.

## Parçalar
- `sunucu/worker.mjs` — aracı sunucu (kaynak). `python3 sunucu/derle.py` → `sunucu/dagitim.mjs` (Cloudflare'e yüklenen tek dosya).
- `sunucu/wrangler.toml` — ayarlar. Gizli değerler (GEMINI_ANAHTAR, TUZ) bu dosyada YOK.
- `prototip/istem.js` — yapay zekâya giden metin (sunucu ve prototip ortak).
- `prototip/kalip.js` — yapay zekâsız yedek üretici. Framer'da `Kalip.tsx` (= kalip.js + dışa aktarma satırı).
- `prototip/framer/KancaArac.tsx` — Framer'daki aracın kopyası. "Sunucu adresi" boşsa yalnızca kalıp çalışır.
- Testler: `python3 -m unittest discover testler` (Node testleri dahil).

## Kullanıcının yapacağı (tek seferlik, ücretsiz)
1. **Google AI Studio** (aistudio.google.com) → Google hesabıyla gir → "Get API key" → "Create API key". Anahtarı kimseyle paylaşma, sohbete yazma.
2. **Cloudflare** (dash.cloudflare.com) → ücretsiz hesap aç. Kart istenirse dur, Claude'a sor.
3. Cloudflare → My Profile → API Tokens → "Create Token" → "Edit Cloudflare Workers" şablonu → oluştur. Bu jetonu Claude'un açacağı güvenli forma gir (sohbete değil).

## Claude'un yapacağı
1. KV deposu (SAYAC) oluşturur, `dagitim.mjs`'i yükler, IZINLI / GUNLUK_HAK / MODEL ayarlarını ve rastgele TUZ'u girer.
2. Kullanıcı Gemini anahtarını Cloudflare → Workers → kanca-uretici → Settings → Variables and Secrets → "Add" → tür **Secret**, ad `GEMINI_ANAHTAR` olarak kendisi yapıştırır.
3. Sunucu adresini (`https://kanca-uretici.<hesap>.workers.dev`) Framer'daki aracın "Sunucu adresi" alanına yazar.
4. AI Studio'daki gerçek günlük kotayı okur; gerekirse GUNLUK_HAK'ı ayarlar.
5. Site yayınlanınca yayın adresini IZINLI'ya ekler (önizleme adresi dahil).

## Bilinmesi gerekenler
- Gemini ücretsiz katman kotası kaynaklarda çelişiyor (günde 20–1.500 istek, doğrulanmadı). Gerçek sayı AI Studio'da.
- Ücretsiz katmanda Google gönderilen metni ürün geliştirmek için kullanabilir; sitede ve SSS'de yazıyor.
- Sayaç, ziyaretçi adresini açık saklamaz: SHA-256(TUZ|gün|adres), 26 saatte silinir.
