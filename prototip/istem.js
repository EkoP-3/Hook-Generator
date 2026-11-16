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
