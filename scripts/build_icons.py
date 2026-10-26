"""Icon list page build.

Input : icons/icons.json          master icon list from Figma ❖ Icon Resource (2409:27235)
        icons/svg/<style>/*.svg   one file per master component
        icons/template.html       page template (/*__ICONS__*/ is replaced with the data)
Output: icons/index.html          self-contained page (SVGs inlined, opens without a server)

Usage: python3 scripts/build_icons.py [--check]
  --check  validate only, write nothing
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
MANIFEST = ICONS / "icons.json"
TEMPLATE = ICONS / "template.html"
OUT = ICONS / "index.html"
MARK = "/*__ICONS__*/"


def main():
    check_only = "--check" in sys.argv[1:]
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    size = manifest["size"]
    styles = {s["style"]: s for s in manifest["sections"]}
    errors, seen_files, grad_ids = [], set(), {}

    for icon in manifest["icons"]:
        label = f"{icon['style']}/{icon['name']}"
        path = ICONS / icon["file"]
        if icon["style"] not in styles:
            errors.append(f"{label}: unknown style")
        elif icon["group"] not in styles[icon["style"]]["groups"]:
            errors.append(f"{label}: group '{icon['group']}' not in section groups")
        if icon["file"] in seen_files:
            errors.append(f"{label}: duplicate file {icon['file']}")
        seen_files.add(icon["file"])
        if not path.exists():
            errors.append(f"{label}: missing {icon['file']}")
            continue
        svg = path.read_text(encoding="utf-8").strip()
        if f'viewBox="0 0 {size} {size}"' not in svg:
            errors.append(f"{label}: viewBox is not 0 0 {size} {size}")
        fills = set(re.findall(r'fill="(#[0-9A-Fa-f]{3,8})"', svg))
        if icon["style"] != "colored" and fills:
            errors.append(f"{label}: monochrome icon has fixed colors {sorted(fills)} (use currentColor)")
        # Inlined SVGs share one document, so gradient ids must be unique across icons.
        for gid in re.findall(r'id="([^"]+)"', svg):
            if gid in grad_ids:
                errors.append(f"{label}: id '{gid}' also used by {grad_ids[gid]}")
            grad_ids[gid] = label
        for ref in re.findall(r'url\(#([^)]+)\)', svg):
            if ref not in re.findall(r'id="([^"]+)"', svg):
                errors.append(f"{label}: url(#{ref}) has no matching id")
        icon["svg"] = svg

    if errors:
        print(f"{len(errors)} error(s), nothing written:")
        for e in errors:
            print("  " + e)
        sys.exit(1)

    counts = {s: sum(1 for i in manifest["icons"] if i["style"] == s) for s in styles}
    print(f"ok: {len(manifest['icons'])} icons ({', '.join(f'{k} {v}' for k, v in counts.items())})")
    if check_only:
        return
    template = TEMPLATE.read_text(encoding="utf-8")
    if MARK not in template:
        sys.exit(f"{TEMPLATE.name}: marker {MARK} not found")
    # "</" inside a <script> would end it early; JSON allows escaping the slash.
    data = json.dumps(manifest, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    OUT.write_text(template.replace(MARK, data), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
