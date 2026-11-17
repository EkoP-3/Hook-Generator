"""Framer'a konacak Motor.tsx'i üretir: prototip/motor.js + kalıp bankaları + formül öncelikleri.

Kullanım: python3 prototip/framer/derle.py   (motor.js ya da bilgi/kaliplar_*.json değişince)
Framer'a bu dosya GitHub'dan aynen çekilir; elle düzenlenmez.
"""
import json
from pathlib import Path

BURASI = Path(__file__).resolve().parent
KOK = BURASI.parent.parent

motor = (KOK / "prototip" / "motor.js").read_text(encoding="utf-8")
kalip = {d: json.loads((KOK / "bilgi" / f"kaliplar_{d}.json").read_text(encoding="utf-8")) for d in ("tr", "en")}
formuller = json.loads((KOK / "bilgi" / "formuller.json").read_text(encoding="utf-8"))
ozet = {"formuller": [{"kod": f["kod"], "oncelik": f["oncelik"]} for f in formuller["formuller"]]}

cikti = ("// @ts-nocheck\n// DERLENMİŞ DOSYA — elle düzenleme. Kaynak: prototip/motor.js + bilgi/kaliplar_*.json (python3 prototip/framer/derle.py)\n"
         + motor
         + "\nexport const KancaMotor = (globalThis as any).KancaMotor\n"
         + "export const KALIPLAR = " + json.dumps(kalip, ensure_ascii=False) + "\n"
         + "export const FORMULLER = " + json.dumps(ozet, ensure_ascii=False) + "\n")
(BURASI / "Motor.tsx").write_text(cikti, encoding="utf-8")
print(f"prototip/framer/Motor.tsx yazıldı ({len(cikti.encode('utf-8')) // 1024} KB)")
