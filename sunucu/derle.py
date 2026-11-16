"""Aracı sunucuyu Cloudflare'e yüklenecek tek dosyaya derler (içe aktarma yok).

worker.mjs + prototip/istem.js + bilgi/formuller.json -> sunucu/dagitim.mjs
Kullanım: python3 sunucu/derle.py
"""
import json
from pathlib import Path

BURASI = Path(__file__).resolve().parent
KOK = BURASI.parent

worker = (BURASI / "worker.mjs").read_text(encoding="utf-8")
istem = (KOK / "prototip" / "istem.js").read_text(encoding="utf-8")
formuller = json.loads((KOK / "bilgi" / "formuller.json").read_text(encoding="utf-8"))

ice = ['import KancaIstem from "../prototip/istem.js";\n',
       'import FORMULLER from "../bilgi/formuller.json" with { type: "json" };\n']
for satir in ice:
    assert worker.count(satir) == 1, satir
    worker = worker.replace(satir, "")

cikti = ("// DERLENMİŞ DOSYA — elle düzenleme. Kaynak: sunucu/worker.mjs (python3 sunucu/derle.py)\n"
         + istem
         + "\nconst KancaIstem = globalThis.KancaIstem;\n"
         + "const FORMULLER = " + json.dumps(formuller, ensure_ascii=False) + ";\n\n"
         + worker)
(BURASI / "dagitim.mjs").write_text(cikti, encoding="utf-8")
print(f"sunucu/dagitim.mjs yazıldı ({len(cikti.encode('utf-8')) // 1024} KB)")
