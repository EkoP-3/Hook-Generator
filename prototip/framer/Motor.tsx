// @ts-nocheck
// DERLENMİŞ DOSYA — elle düzenleme. Kaynak: prototip/motor.js + bilgi/kaliplar_*.json (python3 prototip/framer/derle.py)
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

export const KancaMotor = (globalThis as any).KancaMotor
export const KALIPLAR = {"tr": {"surum": "v0.1", "aciklama": "Kendi kanca motorunun Türkçe kalıp bankası (prototip/motor.js). Konu yalnızca eksiz kullanılır: 'hakkında', 'konusunda', 'ile', soru eki. Sayı ve üstünlük iddiası yok, cevap verilmez. Kalıplar kural sayılır; yalnızca onaylı sürümle değişir (bilgi/surumler.md).", "kaliplar": {"karsilastirma": [{"formul": "KARSILASTIRMA", "kalip": "{A} {qA} {B} {qB}? Sen farkı bildiğini sanıyorsun ama yanılıyor olabilirsin."}, {"formul": "KARSILASTIRMA", "kalip": "{A} {qA} {B} {qB}? Yanlış seçersen kaybeden sen olursun, peki hangisi?"}, {"formul": "KARSILASTIRMA", "kalip": "Sence {A} {qA} {B} {qB}? Aradaki gerçek farkı çoğu kişi bilmiyor."}, {"formul": "TERS", "kalip": "Sen {A} ile {B} aynı sanıyorsun ama gerçek hiç de öyle değil."}, {"formul": "TERS", "kalip": "Sandığın gibi değil: {A} ile {B} arasındaki farkı sen de kaçırıyorsun."}, {"formul": "HITAP", "kalip": "Sence {A} {qA} {B} {qB}? Cevabını aklında tut ama sakın değiştirme."}, {"formul": "HITAP", "kalip": "Sen olsan hangisini seçerdin: {A} {qA} {B} {qB}? Cevabın seni ele verecek."}, {"formul": "SORU", "kalip": "{A} {qA} {B} {qB}? Sence hangisi kazanır? Cevap tahmin ettiğin değil."}, {"formul": "SORU", "kalip": "Peki sen {A} ile {B} arasındaki tek gerçek farkı biliyor musun?"}, {"formul": "UYARI", "kalip": "{A} ile {B} arasında seçim yapmadan önce sakın bunu atlama, sen kaybedersin."}, {"formul": "UYARI", "kalip": "Sakın {A} ile {B} aynı deme. Aradaki fark sandığın gibi değil."}, {"formul": "IFSA", "kalip": "{A} ile {B} hakkında kimsenin sana söylemediği bir sır var."}, {"formul": "IFSA", "kalip": "Sana {A} ile {B} hakkında kimsenin anlatmadığı gerçeği söyleyeceğim."}, {"formul": "HATA", "kalip": "{A} ile {B} konusunda sen de aynı hatayı yapıyor olabilirsin. Sakın yapma."}, {"formul": "ONCE_SONRA", "kalip": "{A} ile {B} farkını öğrendikten sonra sen onlara asla aynı gözle bakmayacaksın."}, {"formul": "LISTE", "kalip": "{A} ile {B} farkını anlamanın birkaç yolu var ama sonuncusunu sen bile bilmiyorsun."}, {"formul": "KOKEN", "kalip": "{A} ile {B} neden bu kadar farklı? Sen sandığın cevabı bırak."}], "soru": [{"formul": "SORU", "kalip": "{S} Sen cevabı bildiğini sanıyorsun ama gerçek çok farklı."}, {"formul": "SORU", "kalip": "{S} Peki sen gerçekten biliyor musun? Cevap sandığın gibi değil."}, {"formul": "TERS", "kalip": "{S} Sana öğretilen cevap aslında doğru değil olabilir."}, {"formul": "TERS", "kalip": "{S} Herkesin sandığı cevap değil. Sen bir daha düşün."}, {"formul": "HITAP", "kalip": "{S} Sence cevabı ne? Aklında tut ama sakın değiştirme."}, {"formul": "HITAP", "kalip": "{S} Cevabını şimdi söyle, sonra sen bile şaşıracaksın."}, {"formul": "UYARI", "kalip": "{S} Cevabı bilmeden sakın bir karar verme, kaybeden sen olursun."}, {"formul": "UYARI", "kalip": "{S} Bunu bilmezsen sen de kaybedebilirsin, ama çoğu kişi bilmiyor."}, {"formul": "IFSA", "kalip": "{S} Sana kimsenin söylemediği gerçek cevap burada."}, {"formul": "IFSA", "kalip": "{S} Bu sorunun cevabında sana anlatılmayan bir sır var."}, {"formul": "HATA", "kalip": "{S} Bu soruda sen de aynı hatayı yapıyor olabilirsin. Sakın yapma."}, {"formul": "ONCE_SONRA", "kalip": "{S} Gerçek cevabı öğrendikten sonra sen asla eskisi gibi bakmayacaksın."}, {"formul": "LISTE", "kalip": "{S} Cevabın birkaç parçası var ama sonuncusunu sen bile tahmin edemezsin."}, {"formul": "KOKEN", "kalip": "{S} Cevap sandığından çok daha eskiye dayanıyor olabilir, peki sen biliyor musun?"}, {"formul": "BASKASI", "kalip": "{S} Bunu merak eden tek kişi sen değilsin, ama cevabı çok az kişi biliyor."}], "isim": [{"formul": "SORU", "kalip": "{K} hakkında sen gerçekten ne biliyorsun? Cevap sandığın gibi değil."}, {"formul": "SORU", "kalip": "Peki sen {K} hakkındaki gerçeği biliyor musun? Çoğu kişi bilmiyor."}, {"formul": "TERS", "kalip": "{K} hakkında sana anlatılanlar aslında doğru değil olabilir."}, {"formul": "TERS", "kalip": "Sen {K} konusunu bildiğini sanıyorsun ama gerçek hiç de öyle değil."}, {"formul": "HITAP", "kalip": "{K} senin için önemliyse bunu sakın kaçırma, sonuna kadar izle."}, {"formul": "HITAP", "kalip": "Sen de {K} konusunda bunu yapıyorsan hemen dur, sebebini göreceksin."}, {"formul": "KARSILASTIRMA", "kalip": "{K} konusunda sen hangi taraftasın? Cevabın seni ele verecek."}, {"formul": "UYARI", "kalip": "{K} hakkında bunu bilmeden sakın bir karar verme, kaybeden sen olursun."}, {"formul": "UYARI", "kalip": "Sakın {K} konusunda acele etme. Gerçek sandığın gibi değil."}, {"formul": "IFSA", "kalip": "{K} hakkında kimsenin sana söylemediği bir sır var."}, {"formul": "IFSA", "kalip": "Sana {K} hakkında kimsenin anlatmadığı gerçeği söyleyeceğim."}, {"formul": "HATA", "kalip": "{K} konusunda sen de aynı hatayı yapıyor olabilirsin. Sakın yapma."}, {"formul": "ONCE_SONRA", "kalip": "{K} hakkındaki gerçeği öğrenince sen asla eskisi gibi bakmayacaksın."}, {"formul": "LISTE", "kalip": "{K} hakkında bilmen gereken birkaç şey var ama sonuncusunu sen bile bilmiyorsun."}, {"formul": "KOKEN", "kalip": "{K} nereden çıktı? Sen sandığın hikâyeyi bırak, gerçek başka."}]}}, "en": {"surum": "v0.1", "aciklama": "English template bank for the hook engine (prototip/motor.js). No numbers, no superlatives, no answers. Templates are rules; they change only with an approved version (bilgi/surumler.md).", "kaliplar": {"karsilastirma": [{"formul": "KARSILASTIRMA", "kalip": "{A} or {B}? You think you know the difference, but you're probably wrong."}, {"formul": "KARSILASTIRMA", "kalip": "{A} or {B}? Pick the wrong one and you lose. So which is it?"}, {"formul": "TERS", "kalip": "You think {A} and {B} are basically the same, but they're actually not."}, {"formul": "TERS", "kalip": "Everything you think you know about {A} and {B} is not the whole story."}, {"formul": "HITAP", "kalip": "{A} or {B}? Lock in your answer now, but don't change it later."}, {"formul": "HITAP", "kalip": "Be honest: would you pick {A} or {B}? Your answer says more than you think."}, {"formul": "SORU", "kalip": "{A} or {B}? Which one actually wins? It's not the one you expect."}, {"formul": "SORU", "kalip": "Do you actually know the one real difference between {A} and {B}?"}, {"formul": "UYARI", "kalip": "Never choose between {A} and {B} before you know this one secret."}, {"formul": "UYARI", "kalip": "Stop calling {A} and {B} the same thing. You're missing the real difference."}, {"formul": "IFSA", "kalip": "Nobody tells you this secret about {A} and {B}, but you should know it."}, {"formul": "HATA", "kalip": "You might be making the same mistake with {A} and {B}. Stop before it's too late."}, {"formul": "ONCE_SONRA", "kalip": "Once you see the real difference between {A} and {B}, you'll never unsee it."}, {"formul": "LISTE", "kalip": "There are a few ways to tell {A} from {B}, but you won't even guess the last one."}, {"formul": "KOKEN", "kalip": "Why are {A} and {B} actually so different? It's not what you think."}], "soru": [{"formul": "SORU", "kalip": "{S} You think you know the answer, but the truth isn't what you expect."}, {"formul": "SORU", "kalip": "{S} Do you actually know? The real answer might surprise even you."}, {"formul": "TERS", "kalip": "{S} The answer you were taught is actually not the whole story."}, {"formul": "TERS", "kalip": "{S} It's not what everyone thinks. You need to hear this before you decide."}, {"formul": "HITAP", "kalip": "{S} Lock in your guess now, but don't change it until the end."}, {"formul": "HITAP", "kalip": "{S} Say your answer out loud, then watch. You'll be surprised."}, {"formul": "UYARI", "kalip": "{S} Never decide anything before you hear the real answer."}, {"formul": "UYARI", "kalip": "{S} Stop guessing. You could lose more than you think if you get this wrong."}, {"formul": "IFSA", "kalip": "{S} There's a secret part of the answer nobody tells you about."}, {"formul": "IFSA", "kalip": "{S} Here's the real answer nobody actually tells you."}, {"formul": "HATA", "kalip": "{S} You're probably making the same mistake everyone makes. Stop before it costs you."}, {"formul": "ONCE_SONRA", "kalip": "{S} Once you know the real answer, you'll never see it the same way."}, {"formul": "LISTE", "kalip": "{S} The answer has a few parts, but you won't even guess the last one."}, {"formul": "KOKEN", "kalip": "{S} The real answer goes back further than you think. Do you actually know it?"}, {"formul": "BASKASI", "kalip": "{S} You're not the only one wondering, but only a few people actually know."}], "isim": [{"formul": "SORU", "kalip": "What do you actually know about {K}? The truth isn't what you think."}, {"formul": "SORU", "kalip": "Do you really know the truth about {K}? A lot of it isn't what you expect."}, {"formul": "TERS", "kalip": "Everything you think you know about {K} might actually be wrong."}, {"formul": "TERS", "kalip": "You think you understand {K}, but the real story is not what you were told."}, {"formul": "HITAP", "kalip": "If {K} matters to you, don't skip this. Watch until the very end."}, {"formul": "HITAP", "kalip": "If you're doing this with {K}, you need to stop right now. Here's why."}, {"formul": "KARSILASTIRMA", "kalip": "When it comes to {K}, which side are you on? Your answer says a lot."}, {"formul": "UYARI", "kalip": "Never make a decision about {K} before you know this one secret."}, {"formul": "UYARI", "kalip": "Stop rushing into {K}. You could lose more than you think."}, {"formul": "IFSA", "kalip": "Nobody tells you this secret about {K}, but you deserve to know."}, {"formul": "HATA", "kalip": "You might be making the same mistake with {K} as everyone else. Stop now."}, {"formul": "ONCE_SONRA", "kalip": "Once you learn this about {K}, you'll never see it the same way again."}, {"formul": "LISTE", "kalip": "There are a few things you should know about {K}, but you won't guess the last one."}, {"formul": "KOKEN", "kalip": "Where did {K} even come from? The real story is not what you think."}]}}}
export const FORMULLER = {"formuller": [{"kod": "KARSILASTIRMA", "oncelik": 1}, {"kod": "TERS", "oncelik": 1}, {"kod": "IMKANSIZ", "oncelik": 1}, {"kod": "HITAP", "oncelik": 1}, {"kod": "ENLER", "oncelik": 2}, {"kod": "ISTATISTIK", "oncelik": 2}, {"kod": "SORU", "oncelik": 2}, {"kod": "IFSA", "oncelik": 2}, {"kod": "UYARI", "oncelik": 2}, {"kod": "HATA", "oncelik": 2}, {"kod": "LISTE", "oncelik": 2}, {"kod": "ICERIDEN", "oncelik": 2}, {"kod": "ONCE_SONRA", "oncelik": 2}, {"kod": "KOKEN", "oncelik": 2}, {"kod": "BASKASI", "oncelik": 2}, {"kod": "KANIT", "oncelik": 2}, {"kod": "SAAT", "oncelik": 2}, {"kod": "DENEDIM", "oncelik": 3}, {"kod": "SOKUM", "oncelik": 3}, {"kod": "YIGIN", "oncelik": 3}, {"kod": "SON_TARIH", "oncelik": 3}]}
