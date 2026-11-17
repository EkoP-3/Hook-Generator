/* Kendi kanca motorumuz: dışarıya bağlı olmadan, tarayıcıda kanca üretir.
 *
 * Akış: konuyu çözümle -> konu türüne uyan bütün kalıpları doldur -> her adayı puanla
 *       -> aralık dışını ve iddia içerenleri ele -> 5 farklı formülden en iyi 5'i seç.
 *
 *   KancaMotor.uret(konu, dil, KALIPLAR, FORMULLER, { tur, puanla }) -> [{ formul, kanca, skor }] × 5
 *     KALIPLAR : bilgi/kaliplar_<dil>.json
 *     FORMULLER: bilgi/formuller.json (öncelik: 1 = öncelikli, 2+ = keşif)
 *     tur      : 0 ilk set, 1, 2 … "başka 5 kanca" (öncekilerde gösterilenler atlanır)
 *     puanla   : KancaPuan.puanla (prototip/puanla.js)
 * Rastgelelik yok: aynı girdi her zaman aynı sonucu verir.
 * Tarayıcıda <script> ile global `KancaMotor`; Node'da require().
 */
(function (kok) {
"use strict";

const ARALIK = { tr: [7, 16], en: [9, 24] };
const IDDIA = { tr: /\d|(^|\s)en\s/iu, en: /\d|\b(most|best|worst)\b/i };
const SORU_EKI = /^(mı|mi|mu|mü)$/iu;
const KARSILASTIRMA = {
  tr: /^(.+?)\s+(?:mı|mi|mu|mü)\s+(.+?)\s+(?:mı|mi|mu|mü)$|^(.+?)\s+(?:vs\.?|ya da|veya)\s+(.+)$/iu,
  en: /^(.+?)\s+(?:or|vs\.?|versus)\s+(.+)$/i,
};
const SORU = {
  tr: /(^|\s)(mı|mi|mu|mü|mısın|misin|ne|neden|niye|niçin|nasıl|kim|hangi|nerede|nereye|kaç)(\s|$)/iu,
  en: /^(what|why|how|who|which|where|when|is|are|do|does|did|can|could|should|would|will)\s/i,
};

// Türkçe soru eki: son ünlüye göre mı/mi/mu/mü. Ünlüsüz biten yabancı kelimede son "y" i gibi okunur (husky -> mi).
function soruEki(kelime) {
  const k = String(kelime).toLocaleLowerCase("tr").trim();
  let unlu = "";
  for (const c of k) if ("aıoueiöü".includes(c)) unlu = c;
  if (/[^aıoueiöü]y$/u.test(k)) unlu = "i";
  return { a: "mı", ı: "mı", o: "mu", u: "mu", e: "mi", i: "mi", ö: "mü", ü: "mü" }[unlu] || "mi";
}

function cozumle(konu, dil) {
  const ham = String(konu || "").trim().replace(/\s+/g, " ");
  const K = ham.replace(/[.?!…]+$/u, "").trim();
  const m = K.match(KARSILASTIRMA[dil] || KARSILASTIRMA.tr);
  if (m) {
    const A = (m[1] || m[3]).trim(), B = (m[2] || m[4]).trim();
    if (A && B && !SORU_EKI.test(A) && !SORU_EKI.test(B)) return { tur: "karsilastirma", K, A, B };
  }
  if (/\?\s*$/.test(ham) || (SORU[dil] || SORU.tr).test(K)) return { tur: "soru", K };
  return { tur: "isim", K };
}

// Cümle ortasına giren konunun baş harfi: kullanıcı yalnızca cümle başı olduğu için büyük yazdıysa küçült.
// Özel isim gibi görünenler (kesme işareti, tamamı büyük, karşılaştırmada iki taraf da büyük) korunur.
function ortaHal(x, yanindaki) {
  if (!x || /['’]/.test(x) || x === x.toLocaleUpperCase("tr")) return x;
  const kelimeler = x.split(" ");
  const buyuk = (w) => !!w && /^\p{Lu}/u.test(w);
  if (!buyuk(kelimeler[0])) return x;
  const sonraki = kelimeler.length > 1 ? kelimeler[1] : yanindaki;
  if (sonraki !== undefined && buyuk(sonraki)) return x;
  return x.charAt(0).toLocaleLowerCase("tr") + x.slice(1);
}

function doldur(kalip, c) {
  const A = ortaHal(c.A, c.B), B = ortaHal(c.B, c.A), K = ortaHal(c.K);
  return kalip
    .replace(/\{A\}/g, A || "").replace(/\{B\}/g, B || "")
    .replace(/\{qA\}/g, soruEki(c.A || "")).replace(/\{qB\}/g, soruEki(c.B || ""))
    .replace(/\{S\}/g, K + "?").replace(/\{K\}/g, K)
    .replace(/^(\p{Ll})/u, (h) => h.toLocaleUpperCase("tr"));
}

function adaylar(konu, dil, KALIPLAR, puanla) {
  const c = cozumle(konu, dil);
  const liste = (KALIPLAR.kaliplar[c.tur] || []);
  const [enAz, enCok] = ARALIK[dil] || ARALIK.tr;
  return liste.map((k, sira) => {
    const kanca = doldur(k.kalip, c);
    const kelime = kanca.split(/\s+/).length;
    const uygun = kelime >= enAz && kelime <= enCok && !IDDIA[dil].test(kanca.split(c.K).join(" "));
    return { formul: k.formul, kanca, skor: Math.round(puanla(kanca, dil).skor), uygun, sira };
  }).sort((a, b) => (b.uygun - a.uygun) || (b.skor - a.skor) || (a.sira - b.sira));
}

// Sıralı adaylardan 5 farklı formül; en az biri keşif formülü (öncelik >= 2).
function sec(havuz, oncelik) {
  const secilen = [];
  for (const x of havuz) {
    if (secilen.length === 5) break;
    if (!secilen.some((s) => s.formul === x.formul)) secilen.push(x);
  }
  if (secilen.length === 5 && !secilen.some((s) => (oncelik[s.formul] || 2) >= 2)) {
    const kesif = havuz.find((x) => (oncelik[x.formul] || 2) >= 2 && !secilen.some((s) => s.formul === x.formul));
    if (kesif) secilen[4] = kesif;
  }
  return secilen;
}

function uret(konu, dil, KALIPLAR, FORMULLER, ayar) {
  const a = ayar || {};
  const oncelik = {};
  for (const f of FORMULLER.formuller) oncelik[f.kod] = f.oncelik;
  const tum = adaylar(konu, dil, KALIPLAR, a.puanla);
  let havuz = tum.slice();
  let set = sec(havuz, oncelik);
  for (let t = 0; t < (a.tur || 0); t++) {
    const kullanilan = new Set(set.map((x) => x.kanca));
    havuz = havuz.filter((x) => !kullanilan.has(x.kanca));
    // Kalan havuz 5 farklı formül veremiyorsa baştan başla, ama hemen önceki seti tekrar etme.
    if (new Set(havuz.map((x) => x.formul)).size < 5) havuz = tum.filter((x) => !kullanilan.has(x.kanca));
    set = sec(havuz, oncelik);
    if (set.length < 5) { havuz = tum.slice(); set = sec(havuz, oncelik); }
  }
  return set.map(({ formul, kanca, skor }) => ({ formul, kanca, skor })).sort((x, y) => y.skor - x.skor);
}

const api = { uret, cozumle, soruEki, adaylar };
if (typeof module === "object" && module.exports) module.exports = api;
else kok.KancaMotor = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
