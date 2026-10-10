
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class WindmillSimulatorTests(unittest.TestCase):

    def test_required_files_exist(self):
        for filename in ("index.html", "style.css", "script.js"):
            with self.subTest(file=filename):
                self.assertTrue((ROOT / filename).is_file())

    def test_html_references_assets(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8").lower()
        self.assertIn("<html", html)
        self.assertIn("</html>", html)
        self.assertIn("style.css", html)
        self.assertIn("script.js", html)

    def test_script_is_not_empty(self):
        script = (ROOT / "script.js").read_text(encoding="utf-8")
        self.assertGreater(len(script.strip()), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
