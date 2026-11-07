"""Prototip sayfasını derler: kaynak.html + puanla.js + bilgi/formuller.json -> index.html

Kullanım: python3 prototip/build.py
"""
import json
from pathlib import Path

BURASI = Path(__file__).resolve().parent
KOK = BURASI.parent

sayfa = (BURASI / "kaynak.html").read_text(encoding="utf-8")
puanla = (BURASI / "puanla.js").read_text(encoding="utf-8")
formuller = json.loads((KOK / "bilgi" / "formuller.json").read_text(encoding="utf-8"))

for isaret in ("/*@@PUANLA@@*/", "/*@@FORMULLER@@*/"):
    assert sayfa.count(isaret) == 1, isaret
sayfa = sayfa.replace("/*@@PUANLA@@*/", puanla.replace("</script", "<\\/script"))
sayfa = sayfa.replace("/*@@FORMULLER@@*/", json.dumps(formuller, ensure_ascii=False).replace("</", "<\\/"))
(BURASI / "index.html").write_text(sayfa, encoding="utf-8")
print(f"prototip/index.html yazıldı ({len(sayfa.encode('utf-8')) // 1024} KB)")
