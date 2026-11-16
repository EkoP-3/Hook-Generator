// DERLENMİŞ DOSYA — elle düzenleme. Kaynak: sunucu/worker.mjs (python3 sunucu/derle.py)
/* Kanca üretim istemi (prompt). Tarayıcı prototipi ve aracı sunucu (sunucu/worker.mjs) aynı metni kullanır.
 *
 *   KancaIstem.istem(konu, dil, FORMULLER, kullanim) -> string
 *   kullanim: { KOD: sayı } keşif formülü seçimi için (en az kullanılan önce); boş nesne olabilir.
 * Tarayıcıda <script> ile global `KancaIstem`; Node'da require().
 */
(function (kok) {
"use strict";

function istem(konu, dil, FORMULLER, kullanim) {
  const k = kullanim || {};
  const uygun = FORMULLER.formuller.filter((f) => f[dil]);
  const satir = (f) => `- ${f.kod} (${f.ad}): ${f.kalip}. Örnek: "${f[dil]}"`;
  const oncelikli = uygun.filter((f) => f.oncelik === 1).map(satir).join("\n");
  const kesif = uygun.filter((f) => f.oncelik === 2)
    .sort((a, b) => (k[a.kod] || 0) - (k[b.kod] || 0) || a.kod.localeCompare(b.kod)).slice(0, 3).map(satir).join("\n");
  const dilAdi = dil === "tr" ? "Türkçe" : "İngilizce";
  return `Kısa video (Shorts / Reels / TikTok) için kanca yaz: videonun ilk 1–3 saniyesinde söylenen cümle.

Konu: ${konu}
Dil: ${dilAdi}

KURALLAR
- Konu ilk 1–2 saniyede belli olsun; konunun ana ismi ilk cümlede geçsin. Selam, "bugün", "bu videoda" yok.
- Tek fikir, kısa cümle, somut isim. Zamirle başlama.
- İzleyiciye "sen" diye seslen (Türkçede sen/sence/-sın/-abilirsin; İngilizcede you/your).
- Bildiği şey ile şaşırtıcı gerçeği çarpıştır. Cevabı kancada verme ("çünkü", "yani" yok).
- Belirsiz sıfat yok (inanılmaz, muhteşem, çılgın / amazing, insane, crazy).
- Türkçede konuşma dili kullan, kitabi cümle kurma. Kanca ${dil === "tr" ? "7–16" : "9–24"} kelime.
- HİÇ sayı yazma ve "en hızlı / en büyük" gibi üstünlük iddiası kurma. Yalnızca herkesçe bilinen, kesin doğru bilgilere dayan; emin değilsen iddia yerine soru ya da karşılaştırma kur.
- Konu kişisel bilgi, nefret, şiddet ya da yetişkin içerik istiyorsa boş liste döndür.

FORMÜLLER: 5 kanca, her biri farklı formül.
Öncelikli:
${oncelikli}
Keşif (5 kancadan tam olarak biri bunlardan birini kullansın):
${kesif}

Yalnızca şu JSON'u döndür (${dilAdi}):
{"kancalar": [{"formul": "KOD", "kanca": "..."}]}`;
}

const api = { istem };
if (typeof module === "object" && module.exports) module.exports = api;
else kok.KancaIstem = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

const KancaIstem = globalThis.KancaIstem;
const FORMULLER = {"surum": "v0.1", "aciklama": "Kanca formülleri (hook_stratejileri.md §6) ve çelişki türleri (§3). 'oncelik' 1 = önce dene, 3 = nişe az uyuyor. Bu dosya yalnızca onaylı sürümle değişir (bkz. bilgi/surumler.md).", "formuller": [{"kod": "KARSILASTIRMA", "ad": "Karşılaştırma", "kalip": "A ↔ B", "oncelik": 1, "tr": "Jaguar mı leopar mı? Farkı beneklerde.", "en": "Jaguar or leopard? The spots tell you.", "bozulur": "İki taraf da sıkıcıysa"}, {"kod": "TERS", "ad": "Tersine çevirme", "kalip": "Herkes X der, gerçek Y", "oncelik": 1, "tr": "Herkes kral aslan der. Asıl tehlike su aygırı.", "en": "Everyone says the lion's king. It's not.", "bozulur": "Y zayıfsa"}, {"kod": "IMKANSIZ", "ad": "İmkânsız iddia", "kalip": "Akıl almaz ama doğru", "oncelik": 1, "tr": "Bu dev aslında yüzme bilmiyor.", "en": "This giant can't even swim.", "bozulur": "Doğru değilse (asla uydurma)"}, {"kod": "HITAP", "ad": "Doğrudan hitap", "kalip": "Eğer sen …san", "oncelik": 1, "tr": "Kedin varsa, bunu bilmen lazım.", "en": "If you own a cat, you need to know this.", "bozulur": "Hitap edilen kitle dar değilse"}, {"kod": "ENLER", "ad": "En'ler", "kalip": "En hızlı, en büyük, en tehlikeli", "oncelik": 2, "tr": "Afrika'nın asıl tehlikeli devi aslan değil.", "en": "Africa's deadliest giant isn't the lion.", "bozulur": "Doğrulanamazsa"}, {"kod": "ISTATISTIK", "ad": "İstatistik", "kalip": "Şaşırtıcı sayı + ne anlama geliyor", "oncelik": 2, "tr": "Su aygırının ısırığı aslanınkinin neredeyse üç katı.", "en": "A hippo bites almost 3x harder than a lion.", "bozulur": "Sayı uydurmaysa veya yuvarlak ve sıradansa"}, {"kod": "SORU", "ad": "Soru", "kalip": "Merak sorusu", "oncelik": 2, "tr": "Bir ayıdan mı kaçarsın, kurttan mı?", "en": "Could you outrun a bear or a wolf?", "bozulur": "Soru evet/hayır ile bitip gidiyorsa"}, {"kod": "IFSA", "ad": "İfşa", "kalip": "Sana göstereceğim…", "oncelik": 2, "tr": "Bu ikisini ayırmanın tek yolu kuyrukta.", "en": "There's one tell, and it's the tail.", "bozulur": "Gösterilen şey zaten biliniyorsa"}, {"kod": "UYARI", "ad": "Uyarı", "kalip": "Şunu yapmadan önce…", "oncelik": 2, "tr": "Bir kurt görürsen sakın arkanı dönme.", "en": "If you see a wolf, never turn your back.", "bozulur": "Uyarı abartılıysa"}, {"kod": "HATA", "ad": "Hata", "kalip": "İzleyicinin yaptığı yanlış", "oncelik": 2, "tr": "Ayıdan koşarak kaçmaya çalışıyorsan hata yapıyorsun.", "en": "If you'd run from a bear, you've already lost.", "bozulur": "Hata gerçek değilse"}, {"kod": "LISTE", "ad": "Liste", "kalip": "X şey (en fazla 3)", "oncelik": 2, "tr": "Kedinin sana asla söylemeyeceği 3 sır.", "en": "3 things your cat will never tell you.", "bozulur": "Liste uzunsa"}, {"kod": "ICERIDEN", "ad": "İçeriden bilgi", "kalip": "Kimsenin bilmediği…", "oncelik": 2, "tr": "Bunu hayvanat bahçesi bakıcıları bile bilmiyor.", "en": "Even zookeepers don't know this.", "bozulur": "Bilgi yaygınsa"}, {"kod": "ONCE_SONRA", "ad": "Önce / sonra", "kalip": "Aynı şeyin iki hali", "oncelik": 2, "tr": "Bu yavru pembe değil. Ama 2 yıl sonra öyle olacak.", "en": "Born grey. Turns pink.", "bozulur": "Görsel yoksa"}, {"kod": "KOKEN", "ad": "Köken", "kalip": "Her şey şununla başladı", "oncelik": 2, "tr": "Bütün köpekler aslında bir kurttan geliyor.", "en": "Every dog started as a wolf.", "bozulur": "Hikâye uzunsa"}, {"kod": "BASKASI", "ad": "Başkasının sonucu", "kalip": "Başkasına olan şaşırtıcı şey", "oncelik": 2, "tr": "Bu kobra onu ısırdı. 10 dakika sonra uyanıp kobrayı yedi.", "en": "The cobra bit it. Ten minutes later it woke up and ate the cobra.", "bozulur": "Kaynak belirsizse"}, {"kod": "KANIT", "ad": "Kanıt", "kalip": "İşte kayıt", "oncelik": 2, "tr": "Bu görüntü, orkanın beyaz köpekbalığını avladığı an.", "en": "This is the moment an orca hunts a great white.", "bozulur": "Görüntü kanıtlamıyorsa"}, {"kod": "SAAT", "ad": "Saat", "kalip": "X saniyede öğreneceksin", "oncelik": 2, "tr": "20 saniyede ikisini ayırmayı öğreneceksin.", "en": "In 20 seconds you'll never mix these up again.", "bozulur": "Videoda vaat tutulmazsa"}, {"kod": "DENEDIM", "ad": "Denedim", "kalip": "Deney sonucu", "oncelik": 3, "tr": "", "en": "I watched 100 hours of orca footage. Here's what scares sharks.", "bozulur": "Deney yoksa (yüzsüz kanalda zor)"}, {"kod": "SOKUM", "ad": "Söküm", "kalip": "Kalıbı parçalara ayır", "oncelik": 3, "tr": "", "en": "I broke down the 10 most-viewed animal Shorts.", "bozulur": "Nişe uymuyorsa"}, {"kod": "YIGIN", "ad": "Yığın", "kalip": "A + B = sonuç", "oncelik": 3, "tr": "", "en": "", "bozulur": "Hayvan nişinde nadir"}, {"kod": "SON_TARIH", "ad": "Son tarih", "kalip": "Zaman baskısı", "oncelik": 3, "tr": "", "en": "", "bozulur": "Yapay aciliyet"}], "celiski_turleri": [{"kod": "GORSEL", "ad": "Görsel çelişki", "kalip": "Bu bir X değil.", "kosul": "İlk karede X'e benzeyen hayvan olmalı (visual_first_frame)", "tr": "Bu bir kurt değil. Ama genlerinde gerçek bir kurt saklıyor.", "en": "This is not a wolf. But it still carries wolf DNA."}, {"kod": "BILGI", "ad": "Bilgi çelişkisi", "kalip": "En [sıfat] X aslında Y değil.", "tr": "Dünyanın en hızlı hayvanı çita değil.", "en": "The fastest animal on Earth isn't the cheetah."}, {"kod": "GUC", "ad": "Güç tersine dönmesi (av ↔ avcı)", "kalip": "X en korkulan avcı. Ama Y'yi görünce…", "tr": "Köpekbalığı okyanusun en korkulan avcısı. Ama orkayı görünce bölgeyi aylarca terk ediyor.", "en": "Great whites rule the ocean. Until an orca shows up."}, {"kod": "KIMLIK", "ad": "Akrabalık / kimlik çelişkisi", "kalip": "X ile Y akraba / X aslında Y değil", "tr": "Kızıl panda, pandanın akrabası bile değil.", "en": "A killer whale isn't a whale. It's a dolphin."}, {"kod": "GORUNUS", "ad": "Renk / görünüş çelişkisi", "kalip": "X aslında [renk] değil", "tr": "Kutup ayısı aslında beyaz değil.", "en": "Polar bears aren't white."}, {"kod": "ZAMAN", "ad": "Zaman çelişkisi", "kalip": "X, Y'den daha eski", "tr": "Köpekbalıkları ağaçlardan daha yaşlı.", "en": "Sharks are older than trees."}]};

/* Kanca Üretici aracı sunucusu (Cloudflare Worker, ücretsiz plan).
 *
 * Site konuyu buraya gönderir; burası gizli anahtarla Google Gemini'ye sorar ve 5 kanca döndürür.
 * Puanlama burada değil, tarayıcıda (prototip/puanla.js) yapılır.
 *
 *   POST /uret  {"konu": "...", "dil": "tr"|"en"}
 *   200 {"kancalar": [{"formul","kanca"}], "kalan": n}
 *   400 {"hata":"konu"} · 403 {"hata":"site"} · 429 {"hata":"hak"} · 503 {"hata":"kota"|"yapay_zeka"}
 *
 * Ortam (wrangler.toml + gizli ayarlar):
 *   GEMINI_ANAHTAR (gizli) · TUZ (gizli, sayaç anahtarını karıştırmak için)
 *   IZINLI: virgülle site adresleri · GUNLUK_HAK (vars. 3) · MODEL (vars. gemini-flash-latest)
 *   SAYAC: KV deposu (günlük hak sayacı)
 *
 * Gizlilik: konu ve ziyaretçi adresi kaydedilmez, günlüğe yazılmaz. Sayaç anahtarı
 * SHA-256(TUZ + gün + adres); açık adres saklanmaz, kayıt gün sonunda kendiliğinden silinir.
 */

const KONU_EN_AZ = 2;
const KONU_EN_COK = 120;
const KANCA_EN_COK = 220;

// Gemini'nin JSON metnini denetler: en az 3, en çok 5 kanca. Uymazsa null.
export function dogrula(metin) {
  let veri;
  try { veri = JSON.parse(metin); } catch { return null; }
  if (!veri || !Array.isArray(veri.kancalar)) return null;
  const kancalar = veri.kancalar
    .filter((x) => x && typeof x.kanca === "string" && x.kanca.trim())
    .map((x) => ({ formul: String(x.formul || "").trim().toUpperCase().slice(0, 40), kanca: x.kanca.trim() }))
    .slice(0, 5);
  if (kancalar.length < 3 || kancalar.some((x) => x.kanca.length > KANCA_EN_COK)) return null;
  return kancalar;
}

function izinliMi(origin, env) {
  return !!origin && String(env.IZINLI || "").split(",").map((s) => s.trim()).filter(Boolean).includes(origin);
}

function yanit(govde, durum, origin) {
  const h = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", vary: "Origin" };
  if (origin) Object.assign(h, {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  });
  return new Response(govde === null ? null : JSON.stringify(govde), { status: durum, headers: h });
}

async function sayacAnahtari(env, ip) {
  const gun = new Date().toISOString().slice(0, 10);
  const veri = new TextEncoder().encode(`${env.TUZ || ""}|${gun}|${ip}`);
  const ozet = await crypto.subtle.digest("SHA-256", veri);
  return "h:" + [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function geminiyeSor(konu, dil, env) {
  const model = env.MODEL || "gemini-flash-latest";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_ANAHTAR },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: KancaIstem.istem(konu, dil, FORMULLER, {}) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
    }),
  });
  if (r.status === 429) return { hata: "kota" };
  if (!r.ok) return { hata: "yapay_zeka" };
  const j = await r.json().catch(() => null);
  const metin = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const kancalar = dogrula(metin);
  return kancalar ? { kancalar } : { hata: "yapay_zeka" };
}

export default {
  async fetch(istek, env) {
    const origin = istek.headers.get("origin");
    const url = new URL(istek.url);
    if (url.pathname !== "/uret") return yanit({ hata: "yol" }, 404);
    if (!izinliMi(origin, env)) return yanit({ hata: "site" }, 403);
    if (istek.method === "OPTIONS") return yanit(null, 204, origin);
    if (istek.method !== "POST") return yanit({ hata: "yol" }, 405, origin);

    const govde = await istek.json().catch(() => null);
    const konu = typeof govde?.konu === "string" ? govde.konu.trim().replace(/\s+/g, " ") : "";
    const dil = govde?.dil;
    if (konu.length < KONU_EN_AZ || konu.length > KONU_EN_COK || !["tr", "en"].includes(dil)) {
      return yanit({ hata: "konu" }, 400, origin);
    }

    const hak = Number(env.GUNLUK_HAK || 3);
    const ip = istek.headers.get("cf-connecting-ip") || "bilinmiyor";
    const anahtar = await sayacAnahtari(env, ip);
    const kullanilan = Number((await env.SAYAC.get(anahtar)) || 0);
    if (kullanilan >= hak) return yanit({ hata: "hak", kalan: 0 }, 429, origin);

    const sonuc = await geminiyeSor(konu, dil, env);
    if (sonuc.hata) return yanit({ hata: sonuc.hata }, 503, origin);

    await env.SAYAC.put(anahtar, String(kullanilan + 1), { expirationTtl: 60 * 60 * 26 });
    return yanit({ kancalar: sonuc.kancalar, kalan: hak - kullanilan - 1 }, 200, origin);
  },
};
