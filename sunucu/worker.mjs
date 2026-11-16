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
import KancaIstem from "../prototip/istem.js";
import FORMULLER from "../bilgi/formuller.json" with { type: "json" };

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
