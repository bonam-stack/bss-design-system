"""index.html -> dist/index.html for publishing as a claude.ai Artifact.

The Artifact host wraps the page in its own <html>/<head>/<body>, so this keeps only
what sits between the BEGIN:publish / END:publish markers and drops the wrapper tags.
Usage: python3 scripts/build_publish_page.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "dist" / "index.html"

html = SRC.read_text(encoding="utf-8")
body = html.split("<!-- BEGIN:publish -->", 1)[1].split("<!-- END:publish -->", 1)[0]
body = re.sub(r"^\s*(</head>|<body>|<!-- (END:head|BEGIN:body) -->)\s*\n", "", body, flags=re.M)
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(body.strip() + "\n", encoding="utf-8")
print(f"wrote {OUT.relative_to(ROOT)}")
