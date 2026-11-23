r"""NEXT BSS UX Pattern Guide 전체 마크다운 → 문서별 파일.

Input : caumuse 가이드에서 뽑은 전체 마크다운 하나 (next-bss-ux-pattern-guide-full.md, 문서는 `## 제목` 단위,
        각 문서 머리에 `경로: \`섹션 > … > 제목\` · 파일: \`pages/<id>.html\``)
Output: guides/ux-pattern/<id>.md      문서 하나 (머리 줄 빼고 본문만)
        guides/ux-pattern/index.json   문서 목록: id · 제목 · 섹션 · 경로 · 원본 파일, 출처 · 생성일

Usage: python3 scripts/split_ux_guide.py <전체 마크다운 파일>
새 릴리스가 나오면 같은 명령으로 다시 만든다 (guides/ux-pattern 안의 .md는 지우고 새로 쓴다).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "guides" / "ux-pattern"

src = Path(sys.argv[1]).read_text(encoding="utf-8")
meta = {}
fm = re.match(r"^---\n(.*?)\n---\n", src, re.S)
if fm:
    for line in fm.group(1).splitlines():
        k, _, v = line.partition(":")
        meta[k.strip()] = v.strip().strip('"')

HEAD = re.compile(r"^경로: `(?P<path>[^`]+)` · 파일: `pages/(?P<id>[a-z0-9-]+)\.html`\s*$", re.M)
docs = []
# `## 제목` 바로 다음에 경로 줄이 오는 것만 문서로 본다 (목차의 `## 목차` 같은 머리글은 건너뜀)
parts = re.split(r"^## (.+)$", src, flags=re.M)
for title, body in zip(parts[1::2], parts[2::2]):
    m = HEAD.search(body[:400])
    if not m:
        continue
    text = body[m.end():]
    # 다음 섹션 머리(`# 섹션`)와 구분선은 문서에 넣지 않는다
    text = re.split(r"^# ", text, maxsplit=1, flags=re.M)[0]
    text = re.sub(r"\n---\s*$", "\n", text.strip()) + "\n"
    # 추출하며 붙은 번호 중복("1. 1컨텐트")을 "1. 컨텐트"로
    text = re.sub(r"^(\s*)(\d+)\. \2(?=\S)", r"\1\2. ", text, flags=re.M)
    path = [p.strip() for p in m.group("path").split(">")]
    docs.append({"id": m.group("id"), "title": title.strip(), "section": path[0], "path": path, "file": f"pages/{m.group('id')}.html", "body": text})

if not docs:
    sys.exit("문서를 찾지 못했습니다. `## 제목` 다음 줄에 `경로: … · 파일: …`이 있는 형식인지 확인하세요")
ids = [d["id"] for d in docs]
dup = {i for i in ids if ids.count(i) > 1}
if dup:
    sys.exit(f"같은 id의 문서가 여러 개입니다: {sorted(dup)}")

OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob("*.md"):
    old.unlink()
for d in docs:
    (OUT / f"{d['id']}.md").write_text(d.pop("body"), encoding="utf-8")
index = {
    "$description": "NEXT BSS UX Pattern Guide 문서 목록. scripts/split_ux_guide.py가 만든다. 본문은 같은 폴더의 <id>.md",
    "title": meta.get("title", "NEXT BSS · UX Pattern Guide"),
    "source": meta.get("source", ""),
    "generated": meta.get("generated", ""),
    "docs": docs,
}
(OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {len(docs)} docs to {OUT.relative_to(ROOT)}")
