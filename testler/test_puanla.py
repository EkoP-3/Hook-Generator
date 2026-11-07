import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "arac"))
from puanla import puanla  # noqa: E402

# hook_stratejileri.md §11: (kötü, iyi)
TR_CIFTLER = [
    ("Merhaba arkadaşlar, bugün kaz ve ördeği karşılaştıracağız.",
     "Bu bir ördek değil. Ve aradaki farkı boynuna bakarak anlayabilirsin."),
    ("Morslar çok ilginç hayvanlardır.",
     "Morsun dişleri yemek için değil, buzda yürümek için."),
    ("Timsahlar ve aligatörler farklıdır çünkü burunları farklıdır.",
     "Bu bir timsah değil. Ve bunu dişlerine bakarak anlayabilirsin."),
    ("O aslında çok tehlikeli.",
     "Afrika'nın asıl tehlikeli devi aslan değil, su aygırı."),
]
EN_CIFTLER = [
    ("Hello guys, today we look at the fastest animal.",
     "The fastest animal on Earth isn't the cheetah."),
]


class Bolum11(unittest.TestCase):
    def test_tr_iyi_kanca_kotuden_yuksek(self):
        for kotu, iyi in TR_CIFTLER:
            with self.subTest(iyi=iyi):
                self.assertGreater(puanla(iyi, "tr")["skor"], puanla(kotu, "tr")["skor"])

    def test_en_iyi_kanca_kotuden_yuksek(self):
        for kotu, iyi in EN_CIFTLER:
            with self.subTest(iyi=iyi):
                self.assertGreater(puanla(iyi, "en")["skor"], puanla(kotu, "en")["skor"])


class Ozellikler(unittest.TestCase):
    def test_turkce_ekli_hitap(self):
        self.assertGreaterEqual(puanla("Bunu dişlerine bakarak anlayabilirsin.")["ozellikler"]["address"], 70)
        self.assertGreaterEqual(puanla("Bir ayıdan mı kaçarsın, kurttan mı?")["ozellikler"]["address"], 70)
        self.assertGreaterEqual(puanla("Bir kurt görürsen sakın arkanı dönme.")["ozellikler"]["address"], 70)

    def test_hayvan_adi_hitap_sayilmaz(self):
        self.assertEqual(puanla("Morsun dişleri yemek için değil.")["ozellikler"]["address"], 10)

    def test_ilk_alti_kelimede_hitap_bonusu(self):
        erken = puanla("Sen bunu bilmiyorsun ama kurtlar böyle değil.")["ozellikler"]["address"]
        gec = puanla("Kurtlar ile huskyler arasında tek bir fark var, onu bulabilirsin.")["ozellikler"]["address"]
        self.assertGreater(erken, gec)

    def test_ekli_hayvan_adi_somutluk(self):
        sonuc = puanla("Ama orkayı görünce bölgeyi terk ediyor.")
        self.assertIn("orka", sonuc["bulunan"]["specificity"])

    def test_kisa_isim_baska_kelimeye_takilmaz(self):
        # "kazanır" içinde "kaz", "film" içinde "fil" sayılmamalı
        sonuc = puanla("Bu filmde kim kazanır?")
        self.assertNotIn("kaz", sonuc["bulunan"]["specificity"])
        self.assertNotIn("fil", sonuc["bulunan"]["specificity"])

    def test_aslan_asla_karismaz(self):
        self.assertNotIn("asla", puanla("Aslan kral olabilir.")["bulunan"]["stakes"])

    def test_cevap_veren_kanca_merak_kaybeder(self):
        a = puanla("Timsah ve aligatör farklı, çünkü burunları farklı.")["ozellikler"]["curiosity"]
        b = puanla("Timsah ve aligatör farklı. Ama farkı burunda değil.")["ozellikler"]["curiosity"]
        self.assertGreater(b, a)

    def test_turkce_buyuk_harf(self):
        self.assertIn("değil", puanla("BU BİR KURT DEĞİL.")["bulunan"]["curiosity"])

    def test_skor_formulu(self):
        s = puanla("Bu bir kurt değil. Ama genlerinde gerçek bir kurt saklıyor.")
        o = list(s["ozellikler"].values())
        beklenen = round(0.6 * sum(o) / 5 + 0.4 * min(o) - sum(c["puan"] for c in s["cezalar"]), 1)
        self.assertEqual(s["skor"], max(0.0, min(100.0, beklenen)))
        self.assertEqual(s["en_zayif"], min(s["ozellikler"], key=s["ozellikler"].get))


if __name__ == "__main__":
    unittest.main()
