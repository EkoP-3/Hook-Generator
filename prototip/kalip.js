/* Yapay zekâsız kanca üretici: konu, formül kalıplarına yerleştirilir.
 * Yapay zekâ hakkı ya da kotası bitince kullanılır. Bilgi iddiası kurmaz (sayı, "en …" yok);
 * yalnızca soru, uyarı, hitap gibi iddiasız kalıplar kullanır.
 *
 *   KancaKalip.uret(konu, dil, FORMULLER) -> [{ formul, kanca }] × 5, hepsi farklı formül
 * Tarayıcıda <script> ile global `KancaKalip`; Node'da require().
 */
(function (kok) {
"use strict";

// Konu soruysa ("Kurt mu husky mi?") kalıp sorunun ardına ayrı bir cümle ekler ({S} = konu + "?").
// Konu isimse ("İstanbul'da ucuz kahve") kalıp konuyu "hakkında/konusunda" ile cümleye alır ({K});
// böylece Türkçe ek uyumu bozulmaz.
const KALIPLAR = {
  tr: {
    soru: {
      KARSILASTIRMA: "{S} Farkı çoğu kişi ilk bakışta göremez.",
      SORU: "{S} Cevabı tahmin ettiğinden farklı.",
      TERS: "{S} Bildiğin cevap yanlış olabilir.",
      HITAP: "{S} Sence cevabı ne? Sonuna kadar izle.",
      UYARI: "{S} Cevabı bilmeden sakın karar verme.",
      IFSA: "{S} Kimsenin sana söylemediği bir taraf var.",
      HATA: "{S} Çoğu kişi bunu yanlış biliyor.",
    },
    isim: {
      SORU: "{K} hakkında ne biliyorsun? Cevabı tahmin ettiğinden farklı.",
      TERS: "{K} hakkında bildiğin şey yanlış olabilir.",
      HITAP: "{K} senin için önemliyse bunu sonuna kadar izle.",
      UYARI: "{K} hakkında bunu bilmeden karar verme.",
      IFSA: "{K} hakkında kimsenin söylemediği bir şey var.",
      HATA: "{K} konusunda çoğu kişi aynı hatayı yapıyor.",
    },
  },
  en: {
    soru: {
      KARSILASTIRMA: "{S} A lot of people can't tell the difference.",
      SORU: "{S} The answer isn't what you think.",
      TERS: "{S} What you think you know might be wrong.",
      HITAP: "{S} What's your guess? Watch till the end.",
      UYARI: "{S} Don't decide anything before you know this.",
      IFSA: "{S} Nobody tells you this part.",
      HATA: "{S} A lot of people get this wrong.",
    },
    isim: {
      SORU: "What do you really know about {K}? The answer isn't what you think.",
      TERS: "Everything you know about {K} might be wrong.",
      HITAP: "If you care about {K}, watch this till the end.",
      UYARI: "Don't decide anything about {K} before you know this.",
      IFSA: "Nobody tells you this about {K}.",
      HATA: "A lot of people get {K} wrong the same way.",
    },
  },
};
const KARSILASTIRMA_RE = { tr: /\s(mı|mi|mu|mü)\s.*\s(mı|mi|mu|mü)\s*[?.!]*$|\svs\.?\s/iu, en: /\s(or|vs\.?|versus)\s/i };
const SORU_RE = {
  tr: /\?\s*$|(^|\s)(mı|mi|mu|mü|ne|neden|niye|nasıl|kim|hangi|nerede|kaç)(\s|$)/iu,
  en: /\?\s*$|^(what|why|how|who|which|where|when|is|are|do|does|can|should)\s/i,
};

function temizle(konu) { return String(konu || "").trim().replace(/\s+/g, " ").replace(/[.?!…]+$/u, ""); }
function ozet(s) { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) >>> 0; return h; }

function uret(konu, dil, FORMULLER) {
  const ham = String(konu || "").trim();
  const K = temizle(ham);
  const d = KALIPLAR[dil] ? dil : "tr";
  const soruMu = SORU_RE[d].test(ham);
  const karsilastirma = KARSILASTIRMA_RE[d].test(" " + ham);
  const kaliplar = KALIPLAR[d][soruMu || karsilastirma ? "soru" : "isim"];
  const S = K + "?";
  const bilinen = new Set(FORMULLER.formuller.map((f) => f.kod));
  // Öncelikli dört formül + bir keşif formülü (konuya göre IFSA ya da HATA).
  const sira = [karsilastirma ? "KARSILASTIRMA" : "SORU", "TERS", "HITAP", "UYARI"];
  sira.push(["IFSA", "HATA"][ozet(K.toLowerCase()) % 2]);
  return sira.filter((kod) => bilinen.has(kod) && kaliplar[kod])
    .map((kod) => ({ formul: kod, kanca: kaliplar[kod].replace("{S}", S).replace("{K}", K) }));
}

const api = { uret, KALIPLAR };
if (typeof module === "object" && module.exports) module.exports = api;
else kok.KancaKalip = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
