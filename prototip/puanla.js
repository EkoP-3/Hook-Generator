/* Kanca puanlama, tarayıcı sürümü (bilgi/hook_stratejileri.md §9).
 *
 * arac/puanla.py'nin birebir karşılığı: aynı girdiye aynı çıktıyı verir.
 * Beş özellik, her biri 0-100: specificity, address, stakes, curiosity, brevity.
 * Sonuç = 0,6 x ortalama + 0,4 x en düşük - cezalar (0-100 arası).
 *
 * Bağımlılık yok, derleme yok. Sayfaya <script> ile eklenir:
 *   KancaPuan.puanla("Bu bir kurt değil. Ama genlerinde kurt saklıyor.", "tr")
 * Node'da: const KancaPuan = require("./puanla.js");
 *
 * Sözlükler bilgi/sozluk_tr.json ve bilgi/sozluk_en.json'dan aynen kopyalandı.
 * JSON dosyaları değişirse bu dosyadaki kopyalar da güncellenmeli.
 *
 * Python'la eşitlik için dikkat edilenler:
 * - Python'un \w'si Unicode harf/rakamı kapsar, JS'ninki yalnızca ASCII. Bu yüzden
 *   desenler \p{...} sınıflarıyla ve "u" bayrağıyla yazıldı; sözlükteki Python
 *   desenleri pyDesen() ile çevrilir.
 * - round(x, 1) Python'da tam ortadaki değerlerde çifte yuvarlar (pyYuvarla1).
 * - str.isupper / isalpha / isspace karşılıkları Unicode özellikleriyle yazıldı.
 */
(function (kok) {
"use strict";

const SOZLUK_TR = {
  "dil": "tr",
  "surum": "v0.1",
  "aciklama": "hook_stratejileri.md §9 sinyalleri. 'kokler' kelime başından eşleşir, 'kelimeler' tam kelime ya da ifade olarak eşleşir, 'regex' küçük harfe çevrilmiş metinde aranır.",
  "specificity": {
    "taban": 10,
    "sayi_puani": 40,
    "birim_puani": 20,
    "isim_puani": 20,
    "sayi_kelimeleri": [
      "iki",
      "üç",
      "dört",
      "beş",
      "altı",
      "yedi",
      "sekiz",
      "dokuz",
      "on",
      "yirmi",
      "otuz",
      "elli",
      "yüz",
      "bin",
      "milyon",
      "milyar",
      "yarım",
      "katı",
      "kat"
    ],
    "birimler": [
      "ton",
      "kilo",
      "kg",
      "gram",
      "km",
      "metre",
      "cm",
      "km/sa",
      "yıl",
      "yıllık",
      "saat",
      "dakika",
      "saniye",
      "derece",
      "litre",
      "%"
    ],
    "somut_isimler": [
      "kurt",
      "husky",
      "haski",
      "köpek",
      "kedi",
      "aslan",
      "kaplan",
      "leopar",
      "jaguar",
      "çita",
      "panter",
      "ayı",
      "fil",
      "zürafa",
      "zebra",
      "at",
      "eşek",
      "su aygırı",
      "gergedan",
      "goril",
      "maymun",
      "timsah",
      "aligatör",
      "yılan",
      "kobra",
      "anakonda",
      "köpekbalığı",
      "orka",
      "yunus",
      "balina",
      "ahtapot",
      "mors",
      "deniz aslanı",
      "fok",
      "penguen",
      "kartal",
      "doğan",
      "şahin",
      "baykuş",
      "kaz",
      "ördek",
      "tavuk",
      "horoz",
      "alpaka",
      "lama",
      "deve",
      "geyik",
      "keçi",
      "boğa",
      "inek",
      "domuz",
      "tilki",
      "çakal",
      "sırtlan",
      "panda",
      "kızıl panda",
      "kutup ayısı",
      "kanguru",
      "koala",
      "flamingo",
      "mamut",
      "çekirge",
      "karınca",
      "arı",
      "örümcek",
      "akrep",
      "kertenkele",
      "kaplumbağa",
      "denizanası",
      "su samuru",
      "mantis karidesi",
      "fener balığı",
      "güneş balığı"
    ]
  },
  "address": {
    "yok_puani": 10,
    "var_puani": 70,
    "erken_bonus": 30,
    "erken_kelime_sayisi": 6,
    "kelimeler": [
      "sen",
      "senin",
      "seni",
      "sana",
      "sence",
      "sende",
      "senden",
      "kendin"
    ],
    "regex": [
      "^\\w+(sın|sin|sun|sün)$",
      "^\\w+(sınız|siniz|sunuz|sünüz)$",
      "^\\w+(abilir|ebilir)(sin|sın)$",
      "^(mısın|misin|musun|müsün)$",
      "^\\w+(san|sen)$"
    ],
    "regex_istisna": [
      "hasan",
      "ihsan",
      "yasin",
      "olsun",
      "olsunlar",
      "gelsin"
    ]
  },
  "stakes": {
    "yok_puani": 10,
    "bir_puani": 60,
    "iki_puani": 100,
    "kokler": [
      "öl",
      "tehlike",
      "kaç",
      "sakın",
      "kaybet",
      "avla",
      "avcı",
      "saldır",
      "ısır",
      "zehir",
      "kork",
      "parçala",
      "yenebil",
      "yener",
      "yenil",
      "kazan",
      "hayatta kal",
      "kurtul",
      "öldür",
      "kapış",
      "dövüş",
      "savaş",
      "düşman"
    ],
    "kelimeler": [
      "asla",
      "sakın"
    ]
  },
  "curiosity": {
    "yok_puani": 10,
    "puanlar": [
      10,
      60,
      85,
      100
    ],
    "kelimeler": [
      "ama",
      "değil",
      "değildir",
      "değiller",
      "aslında",
      "neden",
      "nasıl",
      "hangisi",
      "hangi",
      "peki",
      "bile",
      "gerçek",
      "gerçekte",
      "gerçekten",
      "sanıyorsun",
      "sandığın",
      "sanılanın",
      "tek",
      "sır",
      "sırrı",
      "sırları",
      "?"
    ],
    "cevap_veren": [
      "çünkü",
      "yani",
      "bu yüzden",
      "bu nedenle"
    ],
    "cevap_cezasi": 40
  },
  "brevity": {
    "min": 7,
    "max": 16,
    "kisa_ceza": 8,
    "uzun_ceza": 8
  },
  "cezalar": {
    "dolgu": [
      "merhaba",
      "selam",
      "arkadaşlar",
      "bu videoda",
      "bugün",
      "hoş geldiniz",
      "abone ol",
      "beğenmeyi unutma"
    ],
    "dolgu_cezasi": 15,
    "belirsiz_sifat": [
      "inanılmaz",
      "muhteşem",
      "çılgın",
      "harika",
      "ilginç",
      "şaşırtıcı",
      "efsane"
    ],
    "belirsiz_cezasi": 10,
    "zamir_baslangic": [
      "o",
      "bu aslında",
      "onlar",
      "şu"
    ],
    "zamir_cezasi": 10
  },
  "oneriler": {
    "specificity": "Somut bir şey ekle: hayvan adı, sayı (yalnızca onaylı bilgiden) veya birim.",
    "address": "İzleyiciyi işin içine kat: 'sen', 'sence', '-abilirsin' (ör. 'gözlerine bakarak anlayabilirsin').",
    "stakes": "Risk ekle: tehlike, kaçış, kazanan/kaybeden, 'sakın'.",
    "curiosity": "Karşıtlık kur ve cevabı sakla: 'ama', 'değil', 'aslında'. Cevabı aynı cümlede verme.",
    "brevity": "Uzunluğu 7–16 kelimeye getir; her cümle en fazla 12 kelime."
  }
};

const SOZLUK_EN = {
  "dil": "en",
  "surum": "v0.1",
  "aciklama": "hook_stratejileri.md §9 signals (English). 'kokler' match at word start, 'kelimeler' match whole words or phrases, 'regex' is searched per lowercased word.",
  "specificity": {
    "taban": 10,
    "sayi_puani": 40,
    "birim_puani": 20,
    "isim_puani": 20,
    "sayi_kelimeleri": [
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "twenty",
      "hundred",
      "thousand",
      "million",
      "billion",
      "half",
      "twice",
      "3x",
      "2x",
      "10x"
    ],
    "birimler": [
      "ton",
      "tons",
      "kg",
      "pounds",
      "lbs",
      "mph",
      "km/h",
      "miles",
      "meters",
      "feet",
      "years",
      "hours",
      "minutes",
      "seconds",
      "degrees",
      "%"
    ],
    "somut_isimler": [
      "wolf",
      "husky",
      "dog",
      "cat",
      "lion",
      "tiger",
      "leopard",
      "jaguar",
      "cheetah",
      "panther",
      "bear",
      "elephant",
      "giraffe",
      "zebra",
      "horse",
      "donkey",
      "hippo",
      "rhino",
      "gorilla",
      "monkey",
      "crocodile",
      "alligator",
      "snake",
      "cobra",
      "anaconda",
      "shark",
      "great white",
      "orca",
      "killer whale",
      "dolphin",
      "whale",
      "octopus",
      "walrus",
      "sea lion",
      "seal",
      "penguin",
      "eagle",
      "falcon",
      "hawk",
      "owl",
      "goose",
      "duck",
      "chicken",
      "alpaca",
      "llama",
      "camel",
      "deer",
      "goat",
      "bull",
      "cow",
      "pig",
      "fox",
      "hyena",
      "panda",
      "red panda",
      "polar bear",
      "kangaroo",
      "koala",
      "flamingo",
      "mammoth",
      "grasshopper",
      "ant",
      "bee",
      "spider",
      "scorpion",
      "lizard",
      "turtle",
      "jellyfish",
      "otter",
      "mantis shrimp",
      "anglerfish",
      "sunfish"
    ]
  },
  "address": {
    "yok_puani": 10,
    "var_puani": 70,
    "erken_bonus": 30,
    "erken_kelime_sayisi": 6,
    "kelimeler": [
      "you",
      "your",
      "you're",
      "yours",
      "yourself",
      "you'd",
      "you'll",
      "you've"
    ],
    "regex": [],
    "regex_istisna": []
  },
  "stakes": {
    "yok_puani": 10,
    "bir_puani": 60,
    "iki_puani": 100,
    "kokler": [
      "lose",
      "lost",
      "die",
      "dead",
      "deadl",
      "kill",
      "never",
      "stop",
      "before",
      "risk",
      "danger",
      "attack",
      "bite",
      "venom",
      "poison",
      "fear",
      "scare",
      "run",
      "outrun",
      "escape",
      "survive",
      "hunt",
      "wins",
      "fight",
      "rule"
    ],
    "kelimeler": [
      "never"
    ]
  },
  "curiosity": {
    "yok_puani": 10,
    "puanlar": [
      10,
      60,
      85,
      100
    ],
    "kelimeler": [
      "why",
      "how",
      "which",
      "but",
      "actually",
      "isn't",
      "aren't",
      "not",
      "until",
      "turns out",
      "even",
      "only",
      "one tell",
      "secret",
      "?"
    ],
    "cevap_veren": [
      "because",
      "which means",
      "that's why",
      "so that"
    ],
    "cevap_cezasi": 40
  },
  "brevity": {
    "min": 9,
    "max": 24,
    "kisa_ceza": 6,
    "uzun_ceza": 6
  },
  "cezalar": {
    "dolgu": [
      "hello",
      "hi guys",
      "guys",
      "today",
      "in this video",
      "welcome",
      "subscribe",
      "don't forget to like"
    ],
    "dolgu_cezasi": 15,
    "belirsiz_sifat": [
      "amazing",
      "insane",
      "crazy",
      "incredible",
      "awesome",
      "interesting",
      "unbelievable"
    ],
    "belirsiz_cezasi": 10,
    "zamir_baslangic": [
      "it",
      "they",
      "this actually",
      "he",
      "she"
    ],
    "zamir_cezasi": 10
  },
  "oneriler": {
    "specificity": "Add something concrete: animal name, a number (only from verified facts) or a unit.",
    "address": "Pull the viewer in: 'you', 'your', 'if you…'.",
    "stakes": "Add stakes: danger, escape, who wins, 'never'.",
    "curiosity": "Build a contrast and hold the answer: 'but', 'isn't', 'actually'. Don't answer in the same sentence.",
    "brevity": "Keep it 9–24 words; first sentence ideally ≤12 words."
  }
};

const SOZLUK = { tr: SOZLUK_TR, en: SOZLUK_EN };
const OZELLIKLER = Object.freeze(["specificity", "address", "stakes", "curiosity", "brevity"]);

// Kısa Türkçe isimler (ör. "kaz", "fil", "at") yalnızca bu eklerle eşleşir; "kazan", "film" gibi
// başka kelimelere takılmasın diye.
const TR_EKLER = ["", "lar", "ler", "ı", "i", "u", "ü", "a", "e", "ın", "in", "un", "ün", "nın", "nin",
  "nun", "nün", "dan", "den", "tan", "ten", "da", "de", "ta", "te", "yı", "yi", "yu", "yü",
  "ya", "ye", "yla", "yle", "ları", "leri", "ların", "lerin", "lara", "lere", "sı", "si",
  "su", "sü", "ndan", "nden", "n", "nı", "ni"];
const EN_EKLER = ["", "s", "es", "'s"];

// Python karakter sınıflarının Unicode karşılıkları.
const W = "\\p{L}\\p{N}_";                        // \w      (str.isalnum() + "_")
const D = "\\p{Nd}";                              // \d      (str.isdecimal())
// str.isspace(): Zs kategorisi + çift yönlü türü WS, B veya S olanlar.
const S = "\\t\\n\\v\\f\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";

const KELIME_RE = /[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*|%|\?/gu;  // [^\W_]+(?:'[^\W_]+)*|%|\?
const HARF_DESENI = "[\\p{L}\\p{Nl}\\p{No}]+";                  // [^\W\d_]+
const RAKAM_RE = /\p{Nd}/u;                                     // \d
const BUYUK_RE = /^\p{Uppercase}/u;                             // ilk karakter için str.isupper()
const ALFA_RE = /^\p{L}+$/u;                                    // str.isalpha()
const BOSLUK_RE = new RegExp("[" + S + "]+", "u");
const SAG_BOSLUK_RE = new RegExp("[" + S + "]+$", "u");
const CUMLE_SONU = ".!?…:\"“";

// Python'un str.split() (argümansız) davranışı.
function bol(s) {
  return s.split(BOSLUK_RE).filter(function (x) { return x !== ""; });
}

// Python'un str.rstrip() (argümansız) davranışı.
function sagKirp(s) {
  return s.replace(SAG_BOSLUK_RE, "");
}

function esit(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// Python round(x, 1): tam ortadaki değerde (x = k + 0,25 / k + 0,75) çift rakama yuvarlar.
// toFixed da tam değer üzerinden yuvarlar ama ortada yukarı gider; yalnızca o durum ayrılır.
function pyYuvarla1(x) {
  if (!isFinite(x)) return x;
  const isaret = x < 0 || Object.is(x, -0) ? -1 : 1;
  const m = Math.abs(x);
  const dort = m * 4;
  let sonuc;
  if (Number.isInteger(dort) && dort % 2 === 1 && m < 1e15) {
    let n = Math.floor(m * 10);
    if (n % 2 === 1) n += 1;
    sonuc = n / 10;
  } else {
    sonuc = Number(m.toFixed(1));
  }
  return isaret * sonuc;
}

// Python re desenini JS'ye çevirir: \w \W \d \D \s \S \b \B Unicode anlamlarıyla.
function pyDesen(desen) {
  let cikti = "";
  let sinif = false;
  for (let i = 0; i < desen.length; i++) {
    const c = desen[i];
    if (c === "\\" && i + 1 < desen.length) {
      const d = desen[++i];
      if (d === "w") cikti += sinif ? W : "[" + W + "]";
      else if (d === "d") cikti += sinif ? D : "[" + D + "]";
      else if (d === "s") cikti += sinif ? S : "[" + S + "]";
      else if (!sinif && d === "W") cikti += "[^" + W + "]";
      else if (!sinif && d === "D") cikti += "[^" + D + "]";
      else if (!sinif && d === "S") cikti += "[^" + S + "]";
      else if (!sinif && d === "b") cikti += "(?:(?<=[" + W + "])(?![" + W + "])|(?<![" + W + "])(?=[" + W + "]))";
      else if (!sinif && d === "B") cikti += "(?:(?<=[" + W + "])(?=[" + W + "])|(?<![" + W + "])(?![" + W + "]))";
      else cikti += "\\" + d;
      continue;
    }
    if (sinif) {
      if (c === "]") sinif = false;
      cikti += c;
    } else if (c === "[") {
      sinif = true;
      cikti += c;
      if (desen[i + 1] === "^") { cikti += "^"; i++; }
      if (desen[i + 1] === "]") { cikti += "\\]"; i++; }  // Python'da baştaki "]" düz karakterdir
    } else {
      cikti += c;
    }
  }
  return cikti;
}

const _desenler = new Map();

// Python re.match(desen, s): yalnızca dizenin başından eşleşir.
function pyMatch(desen, s) {
  let re = _desenler.get(desen);
  if (!re) {
    re = new RegExp("^(?:" + pyDesen(desen) + ")", "u");
    _desenler.set(desen, re);
  }
  return re.test(s);
}

function sozlukYukle(dil) {
  if (!Object.prototype.hasOwnProperty.call(SOZLUK, dil)) {
    throw new Error("Bilinmeyen dil: " + dil + " (tr veya en olmalı)");
  }
  return SOZLUK[dil];
}

function kucult(metin, dil) {
  if (dil === "tr") metin = metin.replace(/I/g, "ı").replace(/İ/g, "i");
  return metin.toLowerCase().replace(/’/g, "'");
}

function kelimelereAyir(metin) {
  return metin.match(KELIME_RE) || [];
}

// Çok kelimeli ifade (ör. 'bu videoda') kelime dizisinde tam olarak geçiyor mu?
function ifadeVar(ifade, kelimeler) {
  const parca = bol(ifade);
  const n = parca.length;
  for (let i = 0; i < kelimeler.length - n + 1; i++) {
    if (esit(kelimeler.slice(i, i + n), parca)) return true;
  }
  return false;
}

// Kök (ör. 'kaç', 'hayatta kal') kelime başından eşleşiyor mu? Son kelime ek alabilir.
function kokVar(kokMetni, kelimeler) {
  const parca = bol(kokMetni);
  const n = parca.length;
  const bas = parca.slice(0, -1);
  const son = parca[n - 1];
  for (let i = 0; i < kelimeler.length - n + 1; i++) {
    if (esit(kelimeler.slice(i, i + n - 1), bas) && kelimeler[i + n - 1].startsWith(son)) return true;
  }
  return false;
}

// Hayvan adı gibi somut isim, ekleriyle birlikte geçiyor mu? (ör. 'orkayı', "husky'nin")
function isimVar(isim, kelimeler, dil) {
  const parca = bol(isim);
  const n = parca.length;
  const ekler = dil === "tr" ? TR_EKLER : EN_EKLER;
  const bas = parca.slice(0, -1);
  const isimKoku = parca[n - 1];
  for (let i = 0; i < kelimeler.length - n + 1; i++) {
    if (!esit(kelimeler.slice(i, i + n - 1), bas)) continue;
    let son = kelimeler[i + n - 1];
    if (dil === "tr") son = son.split("'")[0];
    if (!son.startsWith(isimKoku)) continue;
    const kalan = son.slice(isimKoku.length);
    if (ekler.indexOf(kalan) !== -1 || (dil === "tr" && isimKoku.length >= 5)) return true;
  }
  return false;
}

// Cümle başında olmayan, büyük harfle başlayan kelimeler (ör. 'Afrika').
function ozelIsimler(orijinal) {
  let sayi = 0;
  const re = new RegExp(HARF_DESENI, "gu");
  let m;
  while ((m = re.exec(orijinal)) !== null) {
    const kelime = m[0];
    if (!BUYUK_RE.test(kelime) || kelime === "I") continue;
    const once = sagKirp(orijinal.slice(0, m.index));
    // Son karakter vekil çiftinin yarısı olsa da CUMLE_SONU'nda yok; sonuç Python'la aynı.
    if (once === "" || CUMLE_SONU.indexOf(once[once.length - 1]) !== -1) continue;
    sayi += 1;
  }
  return sayi;
}

function puanla(metin, dil) {
  if (dil === undefined) dil = "tr";
  if (typeof metin !== "string") throw new TypeError("metin bir yazı olmalı");
  const s = sozlukYukle(dil);
  const kucuk = kucult(metin, dil);
  const kelimeler = kelimelereAyir(kucuk);
  const sozcukler = kelimeler.filter(function (k) { return k !== "?"; });
  const p = {};
  const bulunan = {};

  // Somutluk
  const sp = s.specificity;
  const sayiVar = RAKAM_RE.test(kucuk) || sozcukler.some(function (k) { return sp.sayi_kelimeleri.indexOf(k) !== -1; });
  const birimVar = sp.birimler.some(function (b) {
    return ALFA_RE.test(b) ? isimVar(b, kelimeler, dil) : kucuk.indexOf(b) !== -1;
  });
  let isimler = sp.somut_isimler.filter(function (i) { return isimVar(i, kelimeler, dil); });
  // "deniz aslanı" / "köpekbalığı" bulunduysa ayrıca "aslan" / "köpek" sayma
  const tumIsimler = isimler;
  isimler = tumIsimler.filter(function (i) {
    return !tumIsimler.some(function (j) { return i !== j && j.indexOf(i) !== -1; });
  });
  const ozel = ozelIsimler(metin);
  p.specificity = Math.min(100, sp.taban + (sayiVar ? sp.sayi_puani : 0)
    + (birimVar ? sp.birim_puani : 0)
    + sp.isim_puani * (isimler.length + ozel));
  bulunan.specificity = isimler.concat(sayiVar ? ["sayı"] : [], birimVar ? ["birim"] : []);

  // Hitap
  const ad = s.address;
  const hitapYerleri = [];
  const tekIsimler = sp.somut_isimler.filter(function (i) { return i.indexOf(" ") === -1; });
  sozcukler.forEach(function (k, i) {
    // "morsun" (morsun dişleri) bir hitap değil, hayvan adı + ek
    const isimMi = tekIsimler.some(function (isim) { return isimVar(isim, [k], dil); });
    if (ad.kelimeler.indexOf(k) !== -1 || (ad.regex_istisna.indexOf(k) === -1 && !isimMi
        && ad.regex.some(function (r) { return pyMatch(r, k); }))) {
      hitapYerleri.push(i);
    }
  });
  if (hitapYerleri.length) {
    p.address = Math.min(100, ad.var_puani + (hitapYerleri[0] < ad.erken_kelime_sayisi ? ad.erken_bonus : 0));
  } else {
    p.address = ad.yok_puani;
  }
  bulunan.address = hitapYerleri.map(function (i) { return sozcukler[i]; });

  // Risk
  const st = s.stakes;
  const kokRiskler = st.kokler.filter(function (k) { return kokVar(k, kelimeler); });
  const riskler = kokRiskler.concat((st.kelimeler || []).filter(function (k) {
    return ifadeVar(k, kelimeler) && kokRiskler.indexOf(k) === -1;
  }));
  p.stakes = !riskler.length ? st.yok_puani : (riskler.length === 1 ? st.bir_puani : st.iki_puani);
  bulunan.stakes = riskler;

  // Merak
  const cu = s.curiosity;
  const meraklar = cu.kelimeler.filter(function (k) { return ifadeVar(k, kelimeler); });
  p.curiosity = cu.puanlar[Math.min(meraklar.length, cu.puanlar.length - 1)];
  const cevaplar = cu.cevap_veren.filter(function (k) { return ifadeVar(k, kelimeler); });
  if (cevaplar.length) {
    p.curiosity = Math.max(0, p.curiosity - cu.cevap_cezasi);
  }
  bulunan.curiosity = meraklar;

  // Kısalık
  const br = s.brevity;
  const n = sozcukler.length;
  if (n < br.min) {
    p.brevity = Math.max(0, 100 - br.kisa_ceza * (br.min - n));
  } else if (n > br.max) {
    p.brevity = Math.max(0, 100 - br.uzun_ceza * (n - br.max));
  } else {
    p.brevity = 100;
  }
  bulunan.brevity = [n + " kelime"];

  // Cezalar
  const cz = s.cezalar;
  const cezalar = [];
  cz.dolgu.forEach(function (k) {
    if (ifadeVar(k, kelimeler)) cezalar.push(["dolgu: " + k, cz.dolgu_cezasi]);
  });
  cz.belirsiz_sifat.forEach(function (k) {
    if (kokVar(k, kelimeler)) cezalar.push(["belirsiz sıfat: " + k, cz.belirsiz_cezasi]);
  });
  for (const k of cz.zamir_baslangic) {
    const parca = bol(k);
    if (esit(sozcukler.slice(0, parca.length), parca)) {
      cezalar.push(["zamirle başlıyor: " + k, cz.zamir_cezasi]);
      break;
    }
  }
  if (cevaplar.length) {
    cezalar.push(["cevabı aynı cümlede veriyor: " + cevaplar.join(", "), 0]);
  }

  const degerler = OZELLIKLER.map(function (o) { return p[o]; });
  let toplam = 0;
  for (const d of degerler) toplam += d;
  const ortalama = toplam / degerler.length;
  const enDusuk = Math.min.apply(null, degerler);
  let ceza = 0;
  for (const c of cezalar) ceza += c[1];
  let skor = 0.6 * ortalama + 0.4 * enDusuk - ceza;
  skor = pyYuvarla1(Math.max(0.0, Math.min(100.0, skor)));
  // min(OZELLIKLER, key=...) gibi: eşitlikte sıradaki ilk özellik
  let enZayif = OZELLIKLER[0];
  for (const o of OZELLIKLER) if (p[o] < p[enZayif]) enZayif = o;

  const ozellikler = {};
  for (const o of OZELLIKLER) ozellikler[o] = p[o];
  return {
    metin: metin,
    dil: dil,
    ozellikler: ozellikler,
    bulunan: bulunan,
    cezalar: cezalar.map(function (c) { return { neden: c[0], puan: c[1] }; }),
    skor: skor,
    en_zayif: enZayif,
    oneri: s.oneriler[enZayif],
    sozluk_surumu: s.surum === undefined ? null : s.surum,
  };
}

const KancaPuan = {
  puanla: puanla,
  OZELLIKLER: OZELLIKLER,
  sozluk: { tr: SOZLUK_TR, en: SOZLUK_EN },
};

kok.KancaPuan = KancaPuan;
if (typeof module !== "undefined" && module.exports) module.exports = KancaPuan;
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));
