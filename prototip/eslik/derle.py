"""sablon.js + sözlük JSON'ları -> prototip/puanla.js (JSON metni aynen gömülür)."""
import sys
from pathlib import Path

sablon, tr, en, cikti = map(Path, sys.argv[1:5])
metin = sablon.read_text(encoding="utf-8")
for isaret, yol in (("__SOZLUK_TR__", tr), ("__SOZLUK_EN__", en)):
    assert metin.count(isaret) == 1, isaret
    metin = metin.replace(isaret, yol.read_text(encoding="utf-8").rstrip("\n"))
cikti.parent.mkdir(parents=True, exist_ok=True)
cikti.write_text(metin, encoding="utf-8")
print(cikti, len(metin.encode("utf-8")), "bayt")
