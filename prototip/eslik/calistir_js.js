// JS puanla() çıktısı, Python json.dumps(ensure_ascii=False, sort_keys=True) biçiminde.
// Kullanım: node calistir_js.js <puanla.js> <vakalar.json>
"use strict";
const fs = require("fs");
const K = require(process.argv[2]);
const vakalar = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));

// Python'da yalnızca "skor" float; float repr'i tam sayıda ".0" ile biter.
function pyFloat(x) {
  if (Object.is(x, -0)) return "-0.0";
  return Number.isInteger(x) ? x + ".0" : String(x);
}
function pyDumps(v, anahtar) {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (anahtar === "skor") return pyFloat(v);
    if (!Number.isInteger(v)) throw new Error("int beklenirken float: " + anahtar + "=" + v);
    return String(v);
  }
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map((x) => pyDumps(x)).join(", ") + "]";
  const anahtarlar = Object.keys(v).sort();
  return "{" + anahtarlar.map((k) => JSON.stringify(k) + ": " + pyDumps(v[k], k)).join(", ") + "}";
}

const satirlar = [];
for (const d of ["tr", "en"]) satirlar.push("SOZLUK " + pyDumps(K.sozluk[d]));
for (const v of vakalar) {
  const r = K.puanla(v.metin, v.dil);
  if (typeof r.skor !== "number") throw new Error("skor sayı değil");
  satirlar.push(pyDumps(r));
}
process.stdout.write(satirlar.join("\n") + "\n");
