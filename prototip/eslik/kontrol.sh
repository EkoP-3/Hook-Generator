#!/usr/bin/env bash
# arac/puanla.py ile prototip/puanla.js çıktılarını karşılaştırır (Node gerekir).
# Kullanım: bash prototip/eslik/kontrol.sh
set -euo pipefail
P="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$P/../.." && pwd)"
JS="$REPO/prototip/puanla.js"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
python3 -I -B "$P/vakalar.py" "$REPO/bilgi/hook_stratejileri.md" "$T/vakalar.json"
python3 -I -B "$P/calistir_py.py" "$REPO/arac" "$T/vakalar.json" "$REPO/bilgi/sozluk_tr.json" "$REPO/bilgi/sozluk_en.json" > "$T/py.jsonl"
node "$P/calistir_js.js" "$JS" "$T/vakalar.json" > "$T/js.jsonl"
python3 -I -B -c '
import sys
js = open(sys.argv[1], encoding="utf-8").read()
for yol in sys.argv[2:]:
    assert open(yol, encoding="utf-8").read().rstrip("\n") in js, yol + " puanla.js içinde aynen yok (derle.py ile yeniden üret)"
print("sözlükler puanla.js içinde aynen gömülü: evet")
' "$JS" "$REPO/bilgi/sozluk_tr.json" "$REPO/bilgi/sozluk_en.json"
satir=$(($(wc -l < "$T/py.jsonl") - 2))
if cmp -s "$T/py.jsonl" "$T/js.jsonl"; then
  echo "puanla(): $satir vaka, fark = 0 (Python ve JS aynı)"
else
  diff "$T/py.jsonl" "$T/js.jsonl" | head -40
  echo "puanla(): FARK VAR"; exit 1
fi
