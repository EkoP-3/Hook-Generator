"""Node testlerini (testler/uretim.test.mjs) unittest içinden çalıştırır."""
import shutil
import subprocess
import unittest
from pathlib import Path

BURASI = Path(__file__).resolve().parent


@unittest.skipUnless(shutil.which("node"), "node yok")
class UretimNode(unittest.TestCase):
    def test_node(self):
        r = subprocess.run(["node", "--test", str(BURASI / "uretim.test.mjs")],
                           capture_output=True, text=True, cwd=BURASI.parent)
        self.assertEqual(r.returncode, 0, r.stdout[-3000:] + r.stderr[-2000:])
