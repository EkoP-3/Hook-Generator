// Kanca üretimi testleri: kalıp üretici, istem metni, aracı sunucu.
// Çalıştırma: node --test testler/  (ya da python3 -m unittest discover testler)
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const KancaKalip = require("../prototip/kalip.js");
const KancaIstem = require("../prototip/istem.js");
const KancaPuan = require("../prototip/puanla.js");
const FORMULLER = JSON.parse(readFileSync(new URL("../bilgi/formuller.json", import.meta.url), "utf-8"));
const { dogrula, default: sunucu } = await import("../sunucu/worker.mjs");

const KONULAR = {
  tr: ["Kurt mu husky mi?", "Uykusuzluk beynine ne yapar", "  İstanbul'da en ucuz kahve  "],
  en: ["Wolf or husky?", "what sleep loss does to your brain"],
};

test("kalıp: her dilde 5 kanca, 5 farklı formül, hepsi konuyu içerir", () => {
  for (const dil of ["tr", "en"]) for (const konu of KONULAR[dil]) {
    const k = KancaKalip.uret(konu, dil, FORMULLER);
    assert.equal(k.length, 5, konu);
    assert.equal(new Set(k.map((x) => x.formul)).size, 5, konu);
    for (const x of k) {
      assert.ok(x.kanca.includes(konu.trim().replace(/[.?!]+$/, "")), x.kanca);
      assert.ok(FORMULLER.formuller.some((f) => f.kod === x.formul), x.formul);
    }
  }
});

test("kalıp: sayı ve üstünlük iddiası uydurmaz", () => {
  for (const dil of ["tr", "en"]) {
    const k = KancaKalip.uret("Konu", dil, FORMULLER);
    for (const x of k) assert.doesNotMatch(x.kanca.replace("Konu", ""), /\d|\ben\s|\bmost\b|\best\b/i, x.kanca);
  }
});

test("kalıp: karşılaştırma konusunda KARSILASTIRMA kullanılır", () => {
  assert.ok(KancaKalip.uret("Kurt mu husky mi?", "tr", FORMULLER).some((x) => x.formul === "KARSILASTIRMA"));
  assert.ok(KancaKalip.uret("Wolf or husky?", "en", FORMULLER).some((x) => x.formul === "KARSILASTIRMA"));
});

test("kalıp: puanlanabilir (motor hata vermez)", () => {
  for (const x of KancaKalip.uret("Uykusuzluk beynine ne yapar", "tr", FORMULLER)) {
    const p = KancaPuan.puanla(x.kanca, "tr");
    assert.ok(p.skor >= 0 && p.skor <= 100);
  }
});

test("istem: konu, dil ve öncelikli formüller metinde", () => {
  const m = KancaIstem.istem("Kurt mu husky mi?", "tr", FORMULLER, {});
  assert.match(m, /Konu: Kurt mu husky mi\?/);
  assert.match(m, /Dil: Türkçe/);
  for (const f of FORMULLER.formuller.filter((f) => f.oncelik === 1)) assert.ok(m.includes(f.kod), f.kod);
  assert.match(m, /HİÇ sayı yazma/);
  assert.match(KancaIstem.istem("x", "en", FORMULLER, {}), /Dil: İngilizce/);
});

test("doğrula: iyi yanıt 5 kancaya kırpılır, boşlar atılır", () => {
  const ham = JSON.stringify({ kancalar: [
    { formul: "TERS", kanca: " a " }, { formul: "SORU", kanca: "" }, { formul: "x", kanca: "b" },
    { formul: "y", kanca: "c" }, { formul: "z", kanca: "d" }, { formul: "w", kanca: "e" }, { formul: "v", kanca: "f" },
  ] });
  const k = dogrula(ham);
  assert.equal(k.length, 5);
  assert.deepEqual(k[0], { formul: "TERS", kanca: "a" });
});

test("doğrula: bozuk ya da az yanıt reddedilir", () => {
  assert.equal(dogrula("bu json değil"), null);
  assert.equal(dogrula(JSON.stringify({ kancalar: [{ formul: "A", kanca: "tek" }] })), null);
  assert.equal(dogrula(JSON.stringify({ baska: 1 })), null);
  assert.equal(dogrula(JSON.stringify({ kancalar: [{ kanca: "x".repeat(400) }, { kanca: "b" }, { kanca: "c" }] })), null);
});

// --- sunucu uçtan uca (Gemini ve KV sahte) ---
function sahteOrtam(geminiYaniti, durum = 200) {
  const kv = new Map();
  const cagrilar = [];
  globalThis.fetch = async (url, opt) => {
    cagrilar.push({ url, opt });
    return new Response(JSON.stringify(geminiYaniti), { status: durum });
  };
  return {
    cagrilar,
    env: {
      GEMINI_ANAHTAR: "sahte", IZINLI: "https://kanca.framer.website",
      TUZ: "t", GUNLUK_HAK: "3",
      SAYAC: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } },
    },
  };
}
const iyiGemini = { candidates: [{ content: { parts: [{ text: JSON.stringify({ kancalar: [
  { formul: "TERS", kanca: "Bir" }, { formul: "SORU", kanca: "İki" }, { formul: "HITAP", kanca: "Üç" },
  { formul: "UYARI", kanca: "Dört" }, { formul: "KARSILASTIRMA", kanca: "Beş" },
] }) }] } }] };
const istek = (govde, origin = "https://kanca.framer.website", ip = "1.2.3.4") => new Request("https://x.workers.dev/uret", {
  method: "POST", headers: { "content-type": "application/json", origin, "cf-connecting-ip": ip }, body: JSON.stringify(govde),
});

test("sunucu: iyi istek 5 kanca döndürür, anahtar başlıkta gider", async () => {
  const o = sahteOrtam(iyiGemini);
  const r = await sunucu.fetch(istek({ konu: "Kurt mu husky mi?", dil: "tr" }), o.env);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.kancalar.length, 5);
  assert.equal(j.kalan, 2);
  assert.equal(r.headers.get("access-control-allow-origin"), "https://kanca.framer.website");
  assert.equal(o.cagrilar[0].opt.headers["x-goog-api-key"], "sahte");
  assert.ok(!o.cagrilar[0].url.includes("sahte"));
});

test("sunucu: izinsiz site reddedilir", async () => {
  const o = sahteOrtam(iyiGemini);
  const r = await sunucu.fetch(istek({ konu: "a b", dil: "tr" }, "https://kotu.example"), o.env);
  assert.equal(r.status, 403);
  assert.equal(o.cagrilar.length, 0);
});

test("sunucu: geçersiz konu/dil reddedilir", async () => {
  const o = sahteOrtam(iyiGemini);
  assert.equal((await sunucu.fetch(istek({ konu: "", dil: "tr" }), o.env)).status, 400);
  assert.equal((await sunucu.fetch(istek({ konu: "x".repeat(200), dil: "tr" }), o.env)).status, 400);
  assert.equal((await sunucu.fetch(istek({ konu: "abc", dil: "de" }), o.env)).status, 400);
  assert.equal(o.cagrilar.length, 0);
});

test("sunucu: günde 3 hak, 4. istek 429 ve Gemini çağrılmaz", async () => {
  const o = sahteOrtam(iyiGemini);
  for (let i = 0; i < 3; i++) assert.equal((await sunucu.fetch(istek({ konu: "abc", dil: "tr" }), o.env)).status, 200);
  const r = await sunucu.fetch(istek({ konu: "abc", dil: "tr" }), o.env);
  assert.equal(r.status, 429);
  assert.equal((await r.json()).hata, "hak");
  assert.equal(o.cagrilar.length, 3);
  // başka ziyaretçi etkilenmez
  assert.equal((await sunucu.fetch(istek({ konu: "abc", dil: "tr" }, undefined, "5.6.7.8"), o.env)).status, 200);
});

test("sunucu: ziyaretçi adresi açık saklanmaz", async () => {
  const o = sahteOrtam(iyiGemini);
  const anahtarlar = [];
  const put = o.env.SAYAC.put; o.env.SAYAC.put = async (k, v, s) => { anahtarlar.push(k); return put(k, v, s); };
  await sunucu.fetch(istek({ konu: "abc", dil: "tr" }), o.env);
  assert.ok(anahtarlar.length === 1 && !anahtarlar[0].includes("1.2.3.4"));
});

test("sunucu: Gemini kotası dolunca 503 kota", async () => {
  const o = sahteOrtam({ error: { code: 429 } }, 429);
  const r = await sunucu.fetch(istek({ konu: "abc", dil: "tr" }), o.env);
  assert.equal(r.status, 503);
  assert.equal((await r.json()).hata, "kota");
});

test("derlenmiş dosya: aynı yanıtı verir", async () => {
  const { default: derli } = await import("../sunucu/dagitim.mjs");
  const o = sahteOrtam(iyiGemini);
  const r = await derli.fetch(istek({ konu: "Kurt mu husky mi?", dil: "tr" }), o.env);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).kancalar.length, 5);
  const govde = JSON.parse(o.cagrilar[0].opt.body);
  assert.match(govde.contents[0].parts[0].text, /Konu: Kurt mu husky mi\?/);
});

test("sunucu: tarayıcı ön kontrolü (OPTIONS) izinli siteye açık", async () => {
  const o = sahteOrtam(iyiGemini);
  const r = await sunucu.fetch(new Request("https://x.workers.dev/uret", { method: "OPTIONS", headers: { origin: "https://kanca.framer.website" } }), o.env);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("access-control-allow-origin"), "https://kanca.framer.website");
});
