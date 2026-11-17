// Kendi kanca motorumuz: prototip/motor.js + bilgi/kaliplar_*.json
// Çalıştırma: node --test testler/*.test.mjs  (ya da python3 -m unittest discover testler)
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const KancaMotor = require("../prototip/motor.js");
const KancaPuan = require("../prototip/puanla.js");
const oku = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf-8"));
const FORMULLER = oku("../bilgi/formuller.json");
const KALIPLAR = { tr: oku("../bilgi/kaliplar_tr.json"), en: oku("../bilgi/kaliplar_en.json") };
const uret = (konu, dil, tur = 0) => KancaMotor.uret(konu, dil, KALIPLAR[dil], FORMULLER, { tur, puanla: KancaPuan.puanla });

export const KONULAR = {
  tr: ["Kurt mu husky mi?", "Uykusuzluk beynine ne yapar", "İstanbul’da ucuz kahve", "Kedi mi köpek mi?", "Sabah sporu",
       "Köpekbalığı mı orka mı?", "Neden esneriz", "Kredi kartı borcu", "Telefon bağımlılığı", "Gül mü lale mi?"],
  en: ["Wolf or husky?", "morning routines", "why do we yawn", "cat vs dog", "credit card debt",
       "phone addiction", "shark or orca?", "how to sleep better", "coffee", "lion or tiger?"],
};
const ARALIK = { tr: [7, 16], en: [9, 24] };
const ESKI_ORTALAMA = { tr: 31.6, en: 38.0 }; // prototip/kalip.js, aynı 10 konu (2026-11-17)

test("soru eki ünlü uyumuna uyar", () => {
  const b = { kurt: "mu", husky: "mi", "köpekbalığı": "mı", kedi: "mi", "gül": "mü", lale: "mi", orka: "mı", "köpek": "mi", "sabah sporu": "mu" };
  for (const [k, e] of Object.entries(b)) assert.equal(KancaMotor.soruEki(k), e, k);
});

test("konu çözümleme: karşılaştırma, soru, isim", () => {
  assert.deepEqual(KancaMotor.cozumle("Kurt mu husky mi?", "tr"), { tur: "karsilastirma", K: "Kurt mu husky mi", A: "Kurt", B: "husky" });
  assert.deepEqual(KancaMotor.cozumle("Köpekbalığı mı orka mı", "tr"), { tur: "karsilastirma", K: "Köpekbalığı mı orka mı", A: "Köpekbalığı", B: "orka" });
  assert.deepEqual(KancaMotor.cozumle("kedi vs köpek", "tr"), { tur: "karsilastirma", K: "kedi vs köpek", A: "kedi", B: "köpek" });
  assert.equal(KancaMotor.cozumle("Uykusuzluk beynine ne yapar", "tr").tur, "soru");
  assert.equal(KancaMotor.cozumle("Neden esneriz?", "tr").tur, "soru");
  assert.equal(KancaMotor.cozumle("  Sabah sporu.  ", "tr").tur, "isim");
  assert.equal(KancaMotor.cozumle("Sabah sporu.", "tr").K, "Sabah sporu");
  assert.deepEqual(KancaMotor.cozumle("Wolf or husky?", "en"), { tur: "karsilastirma", K: "Wolf or husky", A: "Wolf", B: "husky" });
  assert.equal(KancaMotor.cozumle("why do we yawn", "en").tur, "soru");
  assert.equal(KancaMotor.cozumle("coffee", "en").tur, "isim");
});

test("kalıp bankası: bilinen formüller, iddia formülleri yok, her türde en az 6 formül", () => {
  const kodlar = new Set(FORMULLER.formuller.map((f) => f.kod));
  for (const dil of ["tr", "en"]) for (const [tur, liste] of Object.entries(KALIPLAR[dil].kaliplar)) {
    const formuller = new Set(liste.map((k) => k.formul));
    assert.ok(formuller.size >= 6, `${dil}/${tur}: ${formuller.size}`);
    for (const k of liste) {
      assert.ok(kodlar.has(k.formul), k.formul);
      assert.ok(!["ISTATISTIK", "ENLER", "IMKANSIZ"].includes(k.formul), k.formul);
      assert.doesNotMatch(k.kalip, /\d/, k.kalip);
    }
  }
});

for (const dil of ["tr", "en"]) {
  test(`${dil}: 10 konuda 5 kanca, 5 farklı formül, konu içinde, aralıkta, iddiasız`, () => {
    for (const konu of KONULAR[dil]) {
      const c = KancaMotor.cozumle(konu, dil);
      const k = uret(konu, dil);
      assert.equal(k.length, 5, konu);
      assert.equal(new Set(k.map((x) => x.formul)).size, 5, konu);
      assert.ok(k.some((x) => FORMULLER.formuller.find((f) => f.kod === x.formul).oncelik >= 2), konu + ": keşif yok");
      for (const x of k) {
        const parca = c.tur === "karsilastirma" ? [c.A, c.B] : [c.K];
        for (const p of parca) assert.ok(x.kanca.toLocaleLowerCase(dil).includes(p.toLocaleLowerCase(dil)), `${x.kanca} ⊅ ${p}`);
        assert.doesNotMatch(x.kanca, /\d/, x.kanca);
        assert.doesNotMatch(x.kanca, dil === "tr" ? /(^|\s)en\s/i : /\b(most|best|worst)\b/i, x.kanca);
        assert.doesNotMatch(x.kanca, /\{|\}/, x.kanca);
        const n = x.kanca.split(/\s+/).length;
        assert.ok(n >= ARALIK[dil][0] && n <= ARALIK[dil][1], `${n} kelime: ${x.kanca}`);
        assert.equal(x.skor, Math.round(KancaPuan.puanla(x.kanca, dil).skor));
      }
      assert.deepEqual(k.map((x) => x.skor), [...k.map((x) => x.skor)].sort((a, b) => b - a), "sıralı değil");
    }
  });

  test(`${dil}: aynı tur aynı sonuç, "başka 5" farklı sonuç`, () => {
    for (const konu of KONULAR[dil].slice(0, 4)) {
      assert.deepEqual(uret(konu, dil, 0), uret(konu, dil, 0));
      const a = new Set(uret(konu, dil, 0).map((x) => x.kanca));
      const b = uret(konu, dil, 1).map((x) => x.kanca);
      assert.equal(b.length, 5);
      assert.ok(b.filter((x) => a.has(x)).length <= 1, konu);
    }
  });

  test(`${dil}: ortalama puan eski kalıp üreticiden yüksek`, () => {
    let t = 0, n = 0;
    for (const konu of KONULAR[dil]) for (const x of uret(konu, dil)) { t += x.skor; n++; }
    const ort = t / n;
    console.log(`${dil} motor ortalaması ${ort.toFixed(1)} (eski ${ESKI_ORTALAMA[dil]})`);
    assert.ok(ort > ESKI_ORTALAMA[dil] + 5, ort.toFixed(1));
  });
}

test("cümle ortasında baş harf: yalnız cümle başı büyükse küçülür", () => {
  const hepsi = (konu) => uret(konu, "tr").concat(uret(konu, "tr", 1)).map((x) => x.kanca).join(" | ");
  // Cümle başları dışında "Kurt" büyük harfle geçmemeli.
  for (const x of uret("Kurt mu husky mi?", "tr").concat(uret("Kurt mu husky mi?", "tr", 1)))
    assert.doesNotMatch(x.kanca.replace(/(^|[.?!:]\s+)Kurt/g, "$1kurt"), /Kurt/, x.kanca);
  assert.match(hepsi("Messi mi Ronaldo mu?"), /Messi/);
  assert.doesNotMatch(hepsi("Messi mi Ronaldo mu?"), /messi/);
  assert.match(hepsi("İstanbul’da ucuz kahve"), /İstanbul’da/);
  for (const x of uret("Kredi kartı borcu", "tr")) assert.match(x.kanca, /^\p{Lu}/u, x.kanca);
});

test("çok uzun konu da 5 kanca verir", () => {
  const k = uret("Sabahları erken kalkıp spor yapmanın gün boyunca enerjiye ve odaklanmaya etkisi", "tr");
  assert.equal(k.length, 5);
});
