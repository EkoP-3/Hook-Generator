"""Kanca puanlama (bilgi/hook_stratejileri.md §9).

Beş özellik, her biri 0-100: specificity, address, stakes, curiosity, brevity.
Sonuç = 0,6 x ortalama + 0,4 x en düşük - cezalar (0-100 arası).

Kullanım:
    python3 arac/puanla.py --dil tr "Bu bir kurt değil. Ama genlerinde kurt saklıyor."
    python3 arac/puanla.py --dil en --json "The fastest animal on Earth isn't the cheetah."
"""
import argparse
import json
import re
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
OZELLIKLER = ["specificity", "address", "stakes", "curiosity", "brevity"]

# Kısa Türkçe isimler (ör. "kaz", "fil", "at") yalnızca bu eklerle eşleşir; "kazan", "film" gibi
# başka kelimelere takılmasın diye.
TR_EKLER = ["", "lar", "ler", "ı", "i", "u", "ü", "a", "e", "ın", "in", "un", "ün", "nın", "nin",
            "nun", "nün", "dan", "den", "tan", "ten", "da", "de", "ta", "te", "yı", "yi", "yu", "yü",
            "ya", "ye", "yla", "yle", "ları", "leri", "ların", "lerin", "lara", "lere", "sı", "si",
            "su", "sü", "ndan", "nden", "n", "nı", "ni"]
EN_EKLER = ["", "s", "es", "'s"]

_sozluk_onbellek = {}


def sozluk_yukle(dil):
    if dil not in _sozluk_onbellek:
        yol = KOK / "bilgi" / f"sozluk_{dil}.json"
        _sozluk_onbellek[dil] = json.loads(yol.read_text(encoding="utf-8"))
    return _sozluk_onbellek[dil]


def kucult(metin, dil):
    if dil == "tr":
        metin = metin.replace("I", "ı").replace("İ", "i")
    return metin.lower().replace("’", "'")


def kelimelere_ayir(metin):
    return re.findall(r"[^\W_]+(?:'[^\W_]+)*|%|\?", metin)


def _ifade_var(ifade, kelimeler):
    """Çok kelimeli ifade (ör. 'bu videoda') kelime dizisinde tam olarak geçiyor mu?"""
    parca = ifade.split()
    n = len(parca)
    return any(kelimeler[i:i + n] == parca for i in range(len(kelimeler) - n + 1))


def _kok_var(kok, kelimeler):
    """Kök (ör. 'kaç', 'hayatta kal') kelime başından eşleşiyor mu? Son kelime ek alabilir."""
    parca = kok.split()
    n = len(parca)
    for i in range(len(kelimeler) - n + 1):
        if kelimeler[i:i + n - 1] == parca[:-1] and kelimeler[i + n - 1].startswith(parca[-1]):
            return True
    return False


def _isim_var(isim, kelimeler, dil):
    """Hayvan adı gibi somut isim, ekleriyle birlikte geçiyor mu? (ör. 'orkayı', "husky'nin")"""
    parca = isim.split()
    n = len(parca)
    ekler = TR_EKLER if dil == "tr" else EN_EKLER
    kok = parca[-1]
    for i in range(len(kelimeler) - n + 1):
        if kelimeler[i:i + n - 1] != parca[:-1]:
            continue
        son = kelimeler[i + n - 1]
        if dil == "tr":
            son = son.split("'")[0]
        if not son.startswith(kok):
            continue
        kalan = son[len(kok):]
        if kalan in ekler or (dil == "tr" and len(kok) >= 5):
            return True
    return False


def _ozel_isimler(orijinal):
    """Cümle başında olmayan, büyük harfle başlayan kelimeler (ör. 'Afrika')."""
    sayi = 0
    for m in re.finditer(r"[^\W\d_]+", orijinal):
        kelime = m.group(0)
        if not kelime[0].isupper() or kelime == "I":
            continue
        once = orijinal[:m.start()].rstrip()
        if once == "" or once[-1] in ".!?…:\"“":
            continue
        sayi += 1
    return sayi


def puanla(metin, dil="tr"):
    s = sozluk_yukle(dil)
    kucuk = kucult(metin, dil)
    kelimeler = kelimelere_ayir(kucuk)
    sozcukler = [k for k in kelimeler if k != "?"]
    p = {}
    bulunan = {}

    # Somutluk
    sp = s["specificity"]
    sayi_var = bool(re.search(r"\d", kucuk)) or any(k in sp["sayi_kelimeleri"] for k in sozcukler)
    birim_var = any((b in kucuk) if not b.isalpha() else _isim_var(b, kelimeler, dil) for b in sp["birimler"])
    isimler = [i for i in sp["somut_isimler"] if _isim_var(i, kelimeler, dil)]
    # "deniz aslanı" / "köpekbalığı" bulunduysa ayrıca "aslan" / "köpek" sayma
    isimler = [i for i in isimler if not any(i != j and i in j for j in isimler)]
    ozel = _ozel_isimler(metin)
    p["specificity"] = min(100, sp["taban"] + (sp["sayi_puani"] if sayi_var else 0)
                           + (sp["birim_puani"] if birim_var else 0)
                           + sp["isim_puani"] * (len(isimler) + ozel))
    bulunan["specificity"] = isimler + (["sayı"] if sayi_var else []) + (["birim"] if birim_var else [])

    # Hitap
    ad = s["address"]
    hitap_yerleri = []
    tek_isimler = [i for i in sp["somut_isimler"] if " " not in i]
    for i, k in enumerate(sozcukler):
        # "morsun" (morsun dişleri) bir hitap değil, hayvan adı + ek
        isim_mi = any(_isim_var(isim, [k], dil) for isim in tek_isimler)
        if k in ad["kelimeler"] or (k not in ad["regex_istisna"] and not isim_mi
                                    and any(re.match(r, k) for r in ad["regex"])):
            hitap_yerleri.append(i)
    if hitap_yerleri:
        p["address"] = min(100, ad["var_puani"] + (ad["erken_bonus"] if hitap_yerleri[0] < ad["erken_kelime_sayisi"] else 0))
    else:
        p["address"] = ad["yok_puani"]
    bulunan["address"] = [sozcukler[i] for i in hitap_yerleri]

    # Risk
    st = s["stakes"]
    riskler = [k for k in st["kokler"] if _kok_var(k, kelimeler)]
    riskler += [k for k in st.get("kelimeler", []) if _ifade_var(k, kelimeler) and k not in riskler]
    p["stakes"] = st["yok_puani"] if not riskler else (st["bir_puani"] if len(riskler) == 1 else st["iki_puani"])
    bulunan["stakes"] = riskler

    # Merak
    cu = s["curiosity"]
    meraklar = [k for k in cu["kelimeler"] if _ifade_var(k, kelimeler)]
    p["curiosity"] = cu["puanlar"][min(len(meraklar), len(cu["puanlar"]) - 1)]
    cevaplar = [k for k in cu["cevap_veren"] if _ifade_var(k, kelimeler)]
    if cevaplar:
        p["curiosity"] = max(0, p["curiosity"] - cu["cevap_cezasi"])
    bulunan["curiosity"] = meraklar

    # Kısalık
    br = s["brevity"]
    n = len(sozcukler)
    if n < br["min"]:
        p["brevity"] = max(0, 100 - br["kisa_ceza"] * (br["min"] - n))
    elif n > br["max"]:
        p["brevity"] = max(0, 100 - br["uzun_ceza"] * (n - br["max"]))
    else:
        p["brevity"] = 100
    bulunan["brevity"] = [f"{n} kelime"]

    # Cezalar
    cz = s["cezalar"]
    cezalar = []
    for k in cz["dolgu"]:
        if _ifade_var(k, kelimeler):
            cezalar.append(("dolgu: " + k, cz["dolgu_cezasi"]))
    for k in cz["belirsiz_sifat"]:
        if _kok_var(k, kelimeler):
            cezalar.append(("belirsiz sıfat: " + k, cz["belirsiz_cezasi"]))
    for k in cz["zamir_baslangic"]:
        parca = k.split()
        if sozcukler[:len(parca)] == parca:
            cezalar.append(("zamirle başlıyor: " + k, cz["zamir_cezasi"]))
            break
    if cevaplar:
        cezalar.append(("cevabı aynı cümlede veriyor: " + ", ".join(cevaplar), 0))

    ortalama = sum(p.values()) / len(p)
    en_dusuk = min(p.values())
    skor = 0.6 * ortalama + 0.4 * en_dusuk - sum(c for _, c in cezalar)
    skor = round(max(0.0, min(100.0, skor)), 1)
    en_zayif = min(OZELLIKLER, key=lambda o: p[o])
    return {
        "metin": metin,
        "dil": dil,
        "ozellikler": {o: p[o] for o in OZELLIKLER},
        "bulunan": bulunan,
        "cezalar": [{"neden": n_, "puan": c} for n_, c in cezalar],
        "skor": skor,
        "en_zayif": en_zayif,
        "oneri": s["oneriler"][en_zayif],
        "sozluk_surumu": s.get("surum"),
    }


def _tablo(sonuc):
    o = sonuc["ozellikler"]
    satir = " ".join(f"{k[:4]}={o[k]:>3}" for k in OZELLIKLER)
    cz = "; ".join(c["neden"] for c in sonuc["cezalar"])
    return (f"{sonuc['skor']:5.1f}  {satir}  en zayıf: {sonuc['en_zayif']}"
            + (f"  ceza: {cz}" if cz else "") + f"\n       {sonuc['metin']}")


def main(argv=None):
    ap = argparse.ArgumentParser(description="Kanca puanla (§9)")
    ap.add_argument("metinler", nargs="+")
    ap.add_argument("--dil", default="tr", choices=["tr", "en"])
    ap.add_argument("--json", action="store_true", help="JSON çıktı ver")
    a = ap.parse_args(argv)
    sonuclar = [puanla(m, a.dil) for m in a.metinler]
    if a.json:
        print(json.dumps(sonuclar if len(sonuclar) > 1 else sonuclar[0], ensure_ascii=False, indent=1))
    else:
        print("\n".join(_tablo(s) for s in sonuclar))


if __name__ == "__main__":
    sys.exit(main())
