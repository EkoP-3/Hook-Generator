"""Kayıt ekleme / güncelleme ve şema kontrolü.

Veri dosyalarına yalnızca bu betik üzerinden yaz (CLAUDE.md).

Kullanım (JSON argümanla):
    python3 arac/veri.py hazirla
    python3 arac/veri.py uretim-ekle '{"dil": "tr", "konu": "kurt vs husky", "varyantlar": [...]}'
    python3 arac/veri.py secim U-20261107-01 2
    python3 arac/veri.py video-ekle '{"video_id": "abc", "uretim_id": "U-20261107-01", ...}'
    python3 arac/veri.py video-guncelle abc '{"izlenme_48s": 52000, "devam_orani_48s": 71.5, "veri_kaynagi": "studio"}'
    python3 arac/veri.py ortanca
    python3 arac/veri.py formul-oneri --dil tr
    python3 arac/veri.py kontrol
"""
import argparse
import csv
import json
import os
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path

KOK = Path(os.environ.get("KANCA_KOK", Path(__file__).resolve().parent.parent))

VIDEO_SUTUNLARI = [
    "video_id", "uretim_id", "kanal", "yayin_zamani", "dil", "nis", "konu", "genis_kitle", "formul",
    "celiski_turu", "ilk_kare_hareket", "gorsel_ses_celiski", "sure_sn", "kanca_uretilen",
    "kanca_yayinlanan", "duzenleme_var", "ust_baslik", "surum", "specificity", "address", "stakes",
    "curiosity", "brevity", "skor", "izlenme_48s", "devam_orani_48s", "ort_izleme_yuzdesi",
    "kanal_ortancasi", "izlenme_kati", "veri_kaynagi", "not",
]
SAYISAL = {"genis_kitle", "ilk_kare_hareket", "gorsel_ses_celiski", "sure_sn", "duzenleme_var",
           "specificity", "address", "stakes", "curiosity", "brevity", "skor", "izlenme_48s",
           "devam_orani_48s", "ort_izleme_yuzdesi", "kanal_ortancasi", "izlenme_kati"}
TERCIH_SUTUNLARI = ["tarih", "uretim_id", "dil", "kazanan_formul", "kaybeden_formul"]
VERI_KAYNAKLARI = {"", "studio", "elle"}
ORTANCA_PENCERE = 25
ORTANCA_EN_AZ = 5


class VeriHatasi(ValueError):
    pass


def _yol(ad):
    return KOK / "veri" / ad


def _formuller():
    return json.loads((KOK / "bilgi" / "formuller.json").read_text(encoding="utf-8"))


def _formul_kodlari():
    return {f["kod"] for f in _formuller()["formuller"]}


def _formul_dogrula(deger):
    gecersiz = [k for k in deger.split("+") if k and k not in _formul_kodlari()]
    if gecersiz:
        raise VeriHatasi(f"bilinmeyen formül kodu: {', '.join(gecersiz)}")


def hazirla():
    (KOK / "veri").mkdir(exist_ok=True)
    for ad, sutunlar in (("videolar.csv", VIDEO_SUTUNLARI), ("tercihler.csv", TERCIH_SUTUNLARI)):
        if not _yol(ad).exists():
            with open(_yol(ad), "w", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow(sutunlar)
    _yol("uretimler.jsonl").touch()


# ---------- üretimler ----------

def uretimleri_oku():
    yol = _yol("uretimler.jsonl")
    if not yol.exists():
        return []
    return [json.loads(s) for s in yol.read_text(encoding="utf-8").splitlines() if s.strip()]


def _uretimleri_yaz(kayitlar):
    with open(_yol("uretimler.jsonl"), "w", encoding="utf-8") as f:
        for k in kayitlar:
            f.write(json.dumps(k, ensure_ascii=False) + "\n")


def uretim_ekle(kayit, simdi=None):
    hazirla()
    for alan in ("dil", "konu", "varyantlar"):
        if not kayit.get(alan):
            raise VeriHatasi(f"üretim kaydında '{alan}' eksik")
    if kayit["dil"] not in ("tr", "en"):
        raise VeriHatasi("dil 'tr' ya da 'en' olmalı")
    for v in kayit["varyantlar"]:
        if not v.get("kanca") or not v.get("formul"):
            raise VeriHatasi("her varyantta 'kanca' ve 'formul' olmalı")
        _formul_dogrula(v["formul"])
    simdi = simdi or datetime.now(timezone.utc)
    kayitlar = uretimleri_oku()
    on_ek = "U-" + simdi.strftime("%Y%m%d") + "-"
    sira = 1 + sum(1 for k in kayitlar if k["id"].startswith(on_ek))
    kayit = {"id": f"{on_ek}{sira:02d}", "tarih": simdi.isoformat(timespec="seconds"),
             "surum": _formuller()["surum"], "secilen": None, **kayit}
    kayitlar.append(kayit)
    _uretimleri_yaz(kayitlar)
    return kayit["id"]


def secim_kaydet(uretim_id, secilen, simdi=None):
    """Seçilen varyantı (0'dan başlayan sıra) kaydet; seçilmeyenlere karşı tercih satırları yaz."""
    kayitlar = uretimleri_oku()
    kayit = next((k for k in kayitlar if k["id"] == uretim_id), None)
    if kayit is None:
        raise VeriHatasi(f"üretim bulunamadı: {uretim_id}")
    varyantlar = kayit["varyantlar"]
    if not 0 <= secilen < len(varyantlar):
        raise VeriHatasi(f"seçim 0–{len(varyantlar) - 1} arasında olmalı")
    kayit["secilen"] = secilen
    _uretimleri_yaz(kayitlar)
    tarih = (simdi or datetime.now(timezone.utc)).date().isoformat()
    kazanan = varyantlar[secilen]["formul"]
    with open(_yol("tercihler.csv"), "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for i, v in enumerate(varyantlar):
            if i != secilen and v["formul"] != kazanan:
                w.writerow([tarih, uretim_id, kayit["dil"], kazanan, v["formul"]])
    return varyantlar[secilen]


def formul_oneri(dil="tr", son=10):
    """Öncelik listesi + son N üretimde en az kullanılan formüller (keşif için)."""
    formuller = [f for f in _formuller()["formuller"] if f.get(dil)]
    sayac = {f["kod"]: 0 for f in formuller}
    for k in [k for k in uretimleri_oku() if k["dil"] == dil][-son:]:
        for v in k["varyantlar"]:
            for kod in v["formul"].split("+"):
                if kod in sayac:
                    sayac[kod] += 1
    oncelikli = [f["kod"] for f in formuller if f["oncelik"] == 1]
    kesif = sorted((f for f in formuller if f["oncelik"] <= 2 and f["kod"] not in oncelikli),
                   key=lambda f: (sayac[f["kod"]], f["oncelik"]))
    return {"oncelikli": oncelikli, "kesif_adaylari": [f["kod"] for f in kesif[:3]], "kullanim": sayac}


# ---------- videolar ----------

def videolari_oku():
    yol = _yol("videolar.csv")
    if not yol.exists():
        return []
    with open(yol, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _videolari_yaz(satirlar):
    with open(_yol("videolar.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=VIDEO_SUTUNLARI)
        w.writeheader()
        w.writerows(satirlar)


def _alanlari_dogrula(alanlar):
    bilinmeyen = set(alanlar) - set(VIDEO_SUTUNLARI)
    if bilinmeyen:
        raise VeriHatasi(f"bilinmeyen sütun: {', '.join(sorted(bilinmeyen))}")
    temiz = {}
    for k, v in alanlar.items():
        v = "" if v is None else v
        if k in SAYISAL and v != "":
            try:
                v = float(str(v).replace(",", ".").replace("%", ""))
            except ValueError:
                raise VeriHatasi(f"'{k}' sayı olmalı: {v!r}")
            v = int(v) if v.is_integer() else v
        if k == "formul" and v:
            _formul_dogrula(v)
        if k == "veri_kaynagi" and v not in VERI_KAYNAKLARI:
            raise VeriHatasi(f"veri_kaynagi şunlardan biri olmalı: {sorted(VERI_KAYNAKLARI - {''})}")
        if k == "devam_orani_48s" and v != "" and not 0 <= v <= 100:
            raise VeriHatasi("devam_orani_48s yüzde olarak 0–100 arası olmalı")
        temiz[k] = v
    return temiz


def video_ekle(alanlar):
    hazirla()
    alanlar = _alanlari_dogrula(alanlar)
    if not alanlar.get("video_id"):
        raise VeriHatasi("video_id eksik")
    satirlar = videolari_oku()
    if any(s["video_id"] == alanlar["video_id"] for s in satirlar):
        raise VeriHatasi(f"video zaten kayıtlı: {alanlar['video_id']}")
    if alanlar.get("kanca_uretilen") and alanlar.get("kanca_yayinlanan") and "duzenleme_var" not in alanlar:
        alanlar["duzenleme_var"] = int(alanlar["kanca_uretilen"].strip() != alanlar["kanca_yayinlanan"].strip())
    satirlar.append({s: alanlar.get(s, "") for s in VIDEO_SUTUNLARI})
    _videolari_yaz(satirlar)


def video_guncelle(video_id, alanlar):
    alanlar = _alanlari_dogrula(alanlar)
    satirlar = videolari_oku()
    satir = next((s for s in satirlar if s["video_id"] == video_id), None)
    if satir is None:
        raise VeriHatasi(f"video bulunamadı: {video_id}")
    satir.update({k: v for k, v in alanlar.items() if k != "video_id"})
    if satir.get("kanca_uretilen") and satir.get("kanca_yayinlanan") and "duzenleme_var" not in alanlar:
        satir["duzenleme_var"] = int(satir["kanca_uretilen"].strip() != satir["kanca_yayinlanan"].strip())
    _videolari_yaz(satirlar)


def ortanca_guncelle():
    """Her video için: kanalın o videoya kadarki son 25 sonucunun ortancası ve izlenme katı (§14.1)."""
    satirlar = videolari_oku()
    kanallar = {}
    for s in sorted(satirlar, key=lambda s: s["yayin_zamani"]):
        kanallar.setdefault(s["kanal"], []).append(s)
    for liste in kanallar.values():
        gecmis = []
        for s in liste:
            if s["izlenme_48s"] == "":
                continue
            gecmis.append(float(s["izlenme_48s"]))
            pencere = gecmis[-ORTANCA_PENCERE:]
            if len(pencere) >= ORTANCA_EN_AZ:
                ort = statistics.median(pencere)
                s["kanal_ortancasi"] = round(ort)
                s["izlenme_kati"] = round(float(s["izlenme_48s"]) / ort, 2)
            else:
                s["kanal_ortancasi"] = s["izlenme_kati"] = ""
    _videolari_yaz(satirlar)


def kontrol():
    sorunlar = []
    with open(_yol("videolar.csv"), newline="", encoding="utf-8") as f:
        baslik = next(csv.reader(f), [])
    if baslik != VIDEO_SUTUNLARI:
        sorunlar.append("videolar.csv başlığı şemayla uyuşmuyor")
    gorulen = set()
    for s in videolari_oku():
        if s["video_id"] in gorulen:
            sorunlar.append(f"tekrarlanan video: {s['video_id']}")
        gorulen.add(s["video_id"])
        try:
            _alanlari_dogrula(s)
        except VeriHatasi as e:
            sorunlar.append(f"{s['video_id']}: {e}")
    idler = {k["id"] for k in uretimleri_oku()}
    for s in videolari_oku():
        if s["uretim_id"] and s["uretim_id"] not in idler:
            sorunlar.append(f"{s['video_id']}: üretim kaydı yok ({s['uretim_id']})")
    return sorunlar


def main(argv=None):
    ap = argparse.ArgumentParser(description="Kanca verisi")
    alt = ap.add_subparsers(dest="komut", required=True)
    alt.add_parser("hazirla")
    p = alt.add_parser("uretim-ekle"); p.add_argument("json")
    p = alt.add_parser("secim"); p.add_argument("uretim_id"); p.add_argument("sira", type=int)
    p = alt.add_parser("video-ekle"); p.add_argument("json")
    p = alt.add_parser("video-guncelle"); p.add_argument("video_id"); p.add_argument("json")
    alt.add_parser("ortanca")
    p = alt.add_parser("formul-oneri"); p.add_argument("--dil", default="tr"); p.add_argument("--son", type=int, default=10)
    alt.add_parser("kontrol")
    a = ap.parse_args(argv)
    try:
        if a.komut == "hazirla":
            hazirla(); print("hazır")
        elif a.komut == "uretim-ekle":
            print(uretim_ekle(json.loads(a.json)))
        elif a.komut == "secim":
            print(json.dumps(secim_kaydet(a.uretim_id, a.sira), ensure_ascii=False))
        elif a.komut == "video-ekle":
            video_ekle(json.loads(a.json)); print("eklendi")
        elif a.komut == "video-guncelle":
            video_guncelle(a.video_id, json.loads(a.json)); print("güncellendi")
        elif a.komut == "ortanca":
            ortanca_guncelle(); print("güncellendi")
        elif a.komut == "formul-oneri":
            print(json.dumps(formul_oneri(a.dil, a.son), ensure_ascii=False, indent=1))
        elif a.komut == "kontrol":
            sorunlar = kontrol()
            print("\n".join(sorunlar) if sorunlar else "sorun yok")
            return 1 if sorunlar else 0
    except VeriHatasi as e:
        print(f"HATA: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
