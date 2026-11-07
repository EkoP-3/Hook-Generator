import importlib
import json
import os
import shutil
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

GERCEK_KOK = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(GERCEK_KOK / "arac"))


class VeriTesti(unittest.TestCase):
    def setUp(self):
        self.gecici = Path(tempfile.mkdtemp())
        (self.gecici / "bilgi").mkdir()
        shutil.copy(GERCEK_KOK / "bilgi" / "formuller.json", self.gecici / "bilgi")
        os.environ["KANCA_KOK"] = str(self.gecici)
        import veri
        self.v = importlib.reload(veri)
        self.v.hazirla()

    def tearDown(self):
        os.environ.pop("KANCA_KOK", None)
        shutil.rmtree(self.gecici)

    def _uretim(self):
        return self.v.uretim_ekle({
            "dil": "tr", "konu": "kurt vs husky",
            "varyantlar": [
                {"formul": "TERS", "kanca": "Bu bir kurt değil."},
                {"formul": "KARSILASTIRMA", "kanca": "Kurt mu husky mi?"},
                {"formul": "UYARI", "kanca": "Bir kurt görürsen sakın arkanı dönme."},
            ]}, simdi=datetime(2026, 11, 7, tzinfo=timezone.utc))

    def test_uretim_id_ve_surum(self):
        self.assertEqual(self._uretim(), "U-20261107-01")
        self.assertEqual(self._uretim(), "U-20261107-02")
        self.assertEqual(self.v.uretimleri_oku()[0]["surum"], "v0.1")

    def test_bilinmeyen_formul_reddedilir(self):
        with self.assertRaises(self.v.VeriHatasi):
            self.v.uretim_ekle({"dil": "tr", "konu": "x", "varyantlar": [{"formul": "UYDURMA", "kanca": "x"}]})

    def test_secim_tercih_satiri_yazar(self):
        uid = self._uretim()
        self.v.secim_kaydet(uid, 0)
        satirlar = (self.gecici / "veri" / "tercihler.csv").read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(satirlar), 3)  # başlık + 2 kaybeden
        self.assertIn("TERS,KARSILASTIRMA", satirlar[1])
        self.assertEqual(self.v.uretimleri_oku()[0]["secilen"], 0)

    def test_video_ekle_guncelle_ve_duzenleme(self):
        uid = self._uretim()
        self.v.video_ekle({"video_id": "gKxl6dmS70o", "uretim_id": uid, "kanal": "kripz",
                           "yayin_zamani": "2026-10-25T05:30:22Z", "formul": "TERS",
                           "kanca_uretilen": "Bu bir ördek değil.", "kanca_yayinlanan": "Bu bir ördek değil!"})
        self.v.video_guncelle("gKxl6dmS70o", {"devam_orani_48s": "70,2", "veri_kaynagi": "studio"})
        s = self.v.videolari_oku()[0]
        self.assertEqual(s["devam_orani_48s"], "70.2")
        self.assertEqual(s["duzenleme_var"], "1")
        self.assertEqual(self.v.kontrol(), [])

    def test_hatali_alanlar_reddedilir(self):
        with self.assertRaises(self.v.VeriHatasi):
            self.v.video_ekle({"video_id": "a", "bilinmeyen": 1})
        self.v.video_ekle({"video_id": "a"})
        with self.assertRaises(self.v.VeriHatasi):
            self.v.video_ekle({"video_id": "a"})
        with self.assertRaises(self.v.VeriHatasi):
            self.v.video_guncelle("a", {"devam_orani_48s": 702})
        with self.assertRaises(self.v.VeriHatasi):
            self.v.video_guncelle("a", {"veri_kaynagi": "vidiq"})

    def test_ortanca_ve_kat(self):
        for i, izl in enumerate([10, 20, 30, 40, 50, 100]):
            self.v.video_ekle({"video_id": f"v{i}", "kanal": "kripz",
                               "yayin_zamani": f"2026-10-0{i + 1}", "izlenme_48s": izl * 1000})
        self.v.ortanca_guncelle()
        s = {r["video_id"]: r for r in self.v.videolari_oku()}
        self.assertEqual(s["v3"]["kanal_ortancasi"], "")      # 4 sonuç: henüz az
        self.assertEqual(s["v4"]["kanal_ortancasi"], "30000")  # 10,20,30,40,50
        self.assertEqual(s["v5"]["izlenme_kati"], "2.86")      # 100 / 35

    def test_formul_oneri_az_kullanilani_one_alir(self):
        self._uretim()
        o = self.v.formul_oneri("tr")
        self.assertIn("TERS", o["oncelikli"])
        self.assertNotIn("UYARI", o["kesif_adaylari"])  # az önce kullanıldı
        self.assertEqual(len(o["kesif_adaylari"]), 3)


if __name__ == "__main__":
    unittest.main()
