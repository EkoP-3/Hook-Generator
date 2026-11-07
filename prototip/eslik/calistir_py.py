"""Python puanla() çıktısı: her vaka bir satır JSON. Kullanım: calistir_py.py <arac dizini> <vakalar.json> <sozluk_tr> <sozluk_en>"""
import json
import sys

sys.path.insert(0, sys.argv[1])
from puanla import puanla  # noqa: E402

vakalar = json.load(open(sys.argv[2], encoding="utf-8"))
for yol in sys.argv[3:5]:
    print("SOZLUK " + json.dumps(json.load(open(yol, encoding="utf-8")), ensure_ascii=False, sort_keys=True))
for v in vakalar:
    print(json.dumps(puanla(v["metin"], v["dil"]), ensure_ascii=False, sort_keys=True))
