r"""guides/ux-pattern/<id>.md (split_ux_guide.py가 나눈 UX 패턴 가이드 문서) → 포털 구조 데이터.

문서를 그대로 보여 주지 않고, 포털 형식(언제 쓰나 · 구성요소 · 동작 · Do/Don't)으로 나눠 사이트 섹션에 배치한다.
  UX 원칙 → 시작하기 · 파운데이션 → Foundations · 패턴 → Patterns · 모듈 → Blocks · 컴포넌트 → Components
  가이드 활용(SB 작성 가이드 · 용어사전) → UX 거버넌스
Do/Don't는 번호를 붙여 UX 거버넌스 규칙으로 내보내고, 문서마다 관련 카탈로그 코드(블록 · 레이아웃 · 컴포넌트)를 잇는다.

Output: guides/ux-pattern/docs/<id>.json   문서 하나 (구조)
        guides/ux-pattern/structure.json   배치 · 연결 · 규칙 목록 (사이트가 바로 읽음)
        guides/ux-pattern/glossary.json    용어사전 (표준 이름 · 영문 · 약어 · 뜻 · 관련 문서)
Usage: python3 scripts/structure_ux_guide.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "guides" / "ux-pattern"
OUT = SRC / "docs"
index = json.loads((SRC / "index.json").read_text(encoding="utf-8"))
catalog = json.loads((ROOT / "catalog" / "catalog.json").read_text(encoding="utf-8"))
codes = {i["code"] for i in catalog["items"]}

# ---------- 배치 ----------
PLACE = {"UX 원칙": "start", "파운데이션": "foundations", "패턴": "patterns", "모듈": "blocks", "컴포넌트": "components", "가이드 활용": "governance", "유틸리티": None}
short = lambda s: re.sub(r"\s*\(.*\)\s*$", "", s)

# 문서 → 이 문서를 근거로 하는 카탈로그 항목 (레이아웃 l- · 블록 b- · 컴포넌트 c-)
TARGETS = {
    "work-composition": ["l-general", "l-node", "l-special"],
    "layout-common": ["b-gnb", "b-lnb", "b-context-bar"],
    "layout-layer": ["c-popup", "c-dialog", "c-toast"],
    "msg-system": ["c-callout", "c-toast", "c-dialog", "c-helper-text"],
    "layout-work": ["l-general", "b-top", "b-callout", "b-search-general", "b-detail-info", "b-content"],
    "layout-columns": ["l-columns", "b-content"],
    "layout-node": ["l-node", "b-hud", "b-node", "b-actionbar"],
    "layout-special": ["l-special"],
    "grid-board": ["b-table-basic", "b-action", "b-statusbar", "c-pagination"],
    "grid-biggrid": ["b-table-big", "b-action", "b-statusbar"],
    "grid-select": ["b-table-basic", "b-action", "c-checkbox"],
    "grid-tree": ["b-table-basic"], "grid-group": ["b-table-basic"], "grid-sum": ["b-table-basic"],
    "grid-composite": ["b-table-basic"], "grid-inline": ["b-table-basic"], "grid-expand": ["b-table-basic"], "grid-dnd-sort": ["b-table-basic"],
    "grid-fullview": ["b-statusbar", "c-popup"], "grid-excel-upload": ["b-action"],
    "form-big": ["c-text-field", "c-helper-text"], "resp-form-validation": ["c-text-field", "c-text-area", "c-password-field", "c-helper-text"],
    "resp-masking": ["c-password-field"],
    "node-flow-seq": ["l-node", "b-node", "b-hud", "b-actionbar"], "node-flow-branch": ["l-node", "b-node"], "node-flow-skip": ["l-node", "b-node"],
    "node-flow-fail": ["l-node", "b-node"], "node-flow-reverse": ["l-node", "b-node"],
    "std-target-customer": ["b-search-general"], "std-text-search": ["c-search-field"],
    "mod-general-overview": ["l-general", "b-context-bar", "b-top", "b-callout", "b-search-general", "b-detail-info", "b-content"],
    "search-conditions": ["b-search-general", "c-search-field", "c-date-field", "c-select"],
    "layout-content": ["b-content", "b-action", "b-statusbar"], "search-detail": ["b-content", "c-chip"],
    "grid-basic-behavior": ["b-table-basic", "b-table-big", "b-statusbar", "c-table-column-header", "c-table-text-cell"],
    "form-basic": ["c-text-field", "c-button"], "mod-split-content": ["l-columns", "b-content"],
    "node-comp-view": ["b-node"], "node-comp-select": ["b-node", "c-radio", "c-checkbox"], "node-comp-input": ["b-node", "c-text-field"],
    "node-comp-interaction": ["b-node"], "node-comp-process": ["b-node"], "node-comp-end": ["b-node"], "node-comp-fixed": ["b-node", "b-actionbar"],
    "popup": ["l-popup", "c-popup"], "view-full-popup": ["c-popup"],
    "layout-gnb": ["b-gnb"], "layout-lnb": ["b-lnb"],
    "layout-action": ["b-action", "b-actionbar", "c-button"], "layout-button-label": ["c-button"],
    "ui-comp-input": ["c-text-field", "c-text-area", "c-password-field", "c-search-field", "c-select", "c-date-field", "c-checkbox", "c-radio", "c-radio-group", "c-chip", "c-helper-text"],
    "ui-comp-input-extended": ["c-text-field", "c-date-field"],
    "ui-comp-table": ["c-table-column-header", "c-table-text-cell", "c-pagination"],
    "ui-comp-list": [], "ui-comp-container": ["c-tabs", "c-divider", "c-popup"], "ui-comp-graph": [],
    "ui-comp-feedback": ["c-callout", "c-badge", "c-tag", "c-toast", "c-dialog", "c-helper-text"],
    "resp-dialog": ["c-dialog"], "resp-toast": ["c-toast"],
}
for k, v in TARGETS.items():
    bad = [c for c in v if c not in codes]
    if bad:
        raise SystemExit(f"{k}: 카탈로그에 없는 코드 {bad}")

# ---------- 용어사전 (구성요소 이름을 나누는 사전으로도 쓴다) ----------
def table_rows(lines):
    rows = [l for l in lines if l.startswith("|")]
    if len(rows) < 2:
        return None, []
    cells = lambda l: [c.strip() for c in l.strip().strip("|").split(" | ")]
    return cells(rows[0]), [cells(l) for l in rows[2:]]

gl_text = (SRC / "glossary.md").read_text(encoding="utf-8")
glossary = []
for sec in re.split(r"^#### ", gl_text, flags=re.M)[1:]:
    title, _, rest = sec.partition("\n")
    head, rows = table_rows(rest.splitlines())
    if not head:
        continue
    for r in rows:
        row = dict(zip(head, r))
        term = row.get("대표어", "")
        name = re.split(r" (?:한글\.|상위\.|동의어\.)", term)[0].strip()
        en = row.get("영문", "")
        m = re.match(r"^(.*?)\s+([A-Z][A-Z0-9_]+)$", en)
        glossary.append({
            "section": title.strip(), "group": row.get("분류", ""), "term": name,
            "extra": term[len(name):].strip(), "en": m.group(1) if m else en, "abbr": m.group(2) if m else "",
            "meaning": row.get("뜻", ""), "docs": re.findall(r"\(([a-z0-9-]+)\.html\)", row.get("관련 문서", "")),
        })

TERMS = sorted({g["term"] for g in glossary} | {d["title"] for d in index["docs"]} | {i["name"] for i in catalog["items"]} | {
    "액션 영역", "테이블 영역", "상태바", "컨텐트 유틸리티", "CTA", "선택 피드백", "선택", "특이사항", "AI 가이드", "기본 정보", "입력", "결과",
    "헤더", "본문", "푸터", "타이틀", "닫기", "탭", "페이지 타이틀", "브레드크럼", "편의 기능", "검색", "필터", "칩", "요약", "진행 상태",
}, key=len, reverse=True)

PARTICLE = set("을를이가은는의에로과와도만한된하적들별간내상께서며고면인")
TOKEN = re.compile(r"[가-힣A-Za-z0-9]+")
CORPUS = {}
for _f in SRC.glob("*.md"):
    for _w in TOKEN.findall(_f.read_text(encoding="utf-8")):
        CORPUS[_w] = CORPUS.get(_w, 0) + 1

FORCE_NAMES = sorted([
    "필터 적용 상태 칩: 액션 영역 좌측", "테이블 영역: 고정열 + 스크롤열", "툴바 — 그룹 기준(좌) · 액션(우)", "그룹 소계 행 (그룹 머리)",
    "특이사항 (선택 · 최상단)", "조회 · 초기화", "상세조회 · 초기화", "화면 안 — 앱 셸 안쪽에서 겹치는 층", "화면 위 — 앱 셸까지 덮는 층",
    "상태바 (푸터)", "핵심 동작·상태", "오류 상태", "하단 상태바", "결과 · 프리뷰 영역", "액션 · CTA",
], key=len, reverse=True)
bad_rest = lambda r: r.lstrip().startswith(("해도", "합니", "에서", "쪽", "으로", "입니", "(", "이 ", "가 "))


def split_part(text, doc_text=""):
    """구성요소 한 줄을 이름과 설명으로. 추출하며 붙어 버린 '컨텐트 유틸리티목록을 좁히는…'을 나눈다.
    나누지 못하면 이름 없이 설명만 (단계 문장 등)."""
    t = text.strip()
    # 규칙으로 못 나누는 것: 이름을 직접 적어 둔다 (긴 것 먼저)
    for name in FORCE_NAMES:
        if t.startswith(name) and len(t) > len(name):
            return name, t[len(name):].strip()
    # 0) **이름** — 설명
    m = re.match(r"^\*\*(.+?)\*\*\s*(?:[—:-]\s*)?(.*)$", t)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    # 1) 사전의 용어로 시작하고 바로 글이 붙은 경우 (긴 용어 먼저)
    for term in TERMS:
        if len(term) >= 2 and t.startswith(term) and len(t) > len(term):
            rest = t[len(term):]
            if rest[0] in " :—-":
                m2 = re.match(r"^\s*[—:-]\s*(.{1,40}?)(?=[가-힣A-Za-z]{2,}[을를이가은는의에]\s)", rest)
                if rest.lstrip()[:1] in "—:-" and m2:
                    return (term + rest[: m2.end()]).strip(), rest[m2.end():].strip()
                continue
            if rest[0] in PARTICLE or bad_rest(rest):
                continue
            return term, rest.strip()
    # 3) 가이드 전체에서 따로 쓰이지 않는 낱말이 아는 두 낱말로 나뉘면 거기가 붙은 자리 ('영역폼' → '영역' + '폼')
    toks = TOKEN.findall(t)
    own = {}
    for w in toks:
        own[w] = own.get(w, 0) + 1
    known = lambda w: CORPUS.get(w, 0) - own.get(w, 0) > 0
    pos = 0
    for w in toks[:6]:
        at = t.index(w, pos)
        pos = at + len(w)
        if at > 30:
            break
        if known(w):
            continue
        for i in range(1, len(w)):
            left, right = w[:i], w[i:]
            if known(left) and known(right) and right[0] not in PARTICLE:
                name = t[: at + i].strip()
                if "다." not in name and "](" not in name and not bad_rest(t[at + i:]):
                    return name, t[at + i:].strip()
        break
    # 2) 짧은 이름 뒤 괄호가 닫히고 바로 글이 이어지는 곳 ('특이사항 (선택 · 최상단)업무 대상의…')
    m = re.match(r"^([^()\[\]]{1,25}?\s?\([^)]{1,30}\))(?=[^\s).,·:;])", t)
    if m and not bad_rest(t[m.end():]):
        return m.group(1).strip(), t[m.end():].strip()
    return "", t

# 추출하며 문장이 붙은 곳('나뉩니다.두 영역')을 띄운다
fix = lambda x: re.sub(r"([다요])\.(?=[^\s.,)\]”’\"0-9])", r"\1.\n", x)

# ---------- 본문 → 블록 ----------
DROP_SECTIONS = ("실제 예시", "사용 예시", "적응형 시뮬레이션")
NOTE_HEAD = re.compile(r"^(핵심 원칙|Why\?|이 사전을 읽는 법|참고|주의|유의 사항|유의사항|판단 기준|정리)(?=\S)")
noise = lambda l: "새 탭에서 크게 보기" in l or "※ 예시 이미지" in l

def when_list(lines):
    out = []
    for l in lines:
        l = l[2:].strip()
        m = re.match(r"^(.*?)\s*→\s*(.+)$", l)
        out.append({"text": m.group(1), "alt": m.group(2)} if m else {"text": l})
    return out

def glue_split(x):
    """띄어쓰기 없이 붙은 두 말('1024px모바일 앱' → '1024px' · '모바일 앱'). 못 나누면 None"""
    toks = TOKEN.findall(x)
    known = lambda w: CORPUS.get(w, 0) > 1
    pos = 0
    for w in toks:
        at = x.index(w, pos)
        pos = at + len(w)
        if known(w):
            continue
        for i in range(1, len(w)):
            left_ok = known(w[:i]) or re.fullmatch(r"\d+(?:px|%|건|개)", w[:i])
            if left_ok and known(w[i:]) and w[i] not in PARTICLE:
                return x[: at + i].strip(), x[at + i:].strip()
    # 기호 바로 뒤에 붙은 짧은 말 ('휠 · 줌 −/+맞춤' → '휠 · 줌 −/+' · '맞춤')
    m = re.match(r"^(.*[^\s가-힣A-Za-z0-9])([가-힣A-Za-z]{1,8})$", x)
    if m and len(m.group(1).strip()) > 1:
        return m.group(1).strip().rstrip("·").strip(), m.group(2)
    return None


is_tag = lambda l: 0 < len(l.strip()) <= 30 and not l.startswith(("#", "-", "|")) and not re.match(r"^\d+\. ", l) and "다." not in l


def card_run(lines, i):
    """카드 묶음: [태그][##### 제목] 설명… [칩+다음 태그][##### 제목] … 원문 추출에서 칩과 다음 카드 태그가 한 줄로 붙는다."""
    cards, tag, chips = [], lines[i].strip(), False
    while True:
        title, j, body = lines[i + 1][6:].strip(), i + 2, []
        while j < len(lines) and not lines[j].startswith(("#### ", "##### ")) and not (j + 1 < len(lines) and lines[j + 1].startswith("##### ") and is_tag(lines[j])):
            body.append(lines[j]); j += 1
        paras = [p.strip() for p in "\n".join(body).split("\n\n") if p.strip()]
        card = {"tag": tag, "title": title, "body": [fix(p) for p in paras], "chip": ""}
        if j + 1 < len(lines) and lines[j + 1].startswith("##### ") and is_tag(lines[j]):
            x = lines[j].strip()
            g = glue_split(x)
            if g and len(g[1]) <= 20:
                card["chip"], chips = g[0], True
                cards.append(card); tag, i = g[1], j; continue
            if chips:  # 앞 카드들에 칩이 있었으면 이 줄은 마지막 카드의 칩이다
                card["chip"] = x
                cards.append(card)
                return cards, j + 1, []
            cards.append(card); tag, i = x, j; continue
        # 마지막 카드: 다른 카드에 칩이 있었으면 설명 뒤 첫 짧은 글이 칩이고, 그 뒤는 카드 밖의 글이다
        rest = []
        if chips:
            k = next((k for k, b in enumerate(card["body"]) if k > 0 and len(b) <= 20), None)
            if k is not None:
                card["chip"] = card["body"][k]
                rest = card["body"][k + 1:]
                card["body"] = card["body"][:k]
        cards.append(card)
        return cards, j, rest


def blocks_of(lines, doc_text=""):
    blocks, i, para = [], 0, []
    def flush():
        if para:
            text = "\n".join(para).strip()
            m = NOTE_HEAD.match(text)
            blocks.append({"type": "note", "title": m.group(1), "text": fix(text[m.end():].strip())} if m else {"type": "text", "text": fix(text)})
            para.clear()
    while i < len(lines):
        l = lines[i]
        if noise(l):
            i += 1
            continue
        if not l.strip():
            flush(); i += 1; continue
        if is_tag(l) and i + 1 < len(lines) and lines[i + 1].startswith("##### ") and not para:
            cards, i, rest = card_run(lines, i)
            if len(cards) >= 2:
                blocks.append({"type": "cards", "items": cards})
                for t in rest:  # 카드 뒤에 붙어 있던 글
                    m = NOTE_HEAD.match(t)
                    blocks.append({"type": "note", "title": m.group(1), "text": t[m.end():].strip()} if m else {"type": "text", "text": t})
                continue
            # 카드가 하나뿐이면 묶음이 아니다: 글과 제목으로 둔다
            c = cards[0]
            blocks.append({"type": "text", "text": c["tag"]})
            blocks.append({"type": "h", "text": c["title"]})
            blocks += [{"type": "text", "text": b} for b in c["body"] + rest]
            if c["chip"]:
                blocks.append({"type": "text", "text": c["chip"]})
            continue
        if l.startswith("###### ") or l.startswith("##### "):
            flush()
            title = l.lstrip("#").strip()
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            items = []
            while j < len(lines) and lines[j].startswith("- "):
                items.append(lines[j]); j += 1
            if title.startswith("✓") and items:
                blocks.append({"type": "when", "use": [x["text"] if "alt" not in x else f"{x['text']} → {x['alt']}" for x in when_list(items)], "title": title.lstrip("✓ ").strip()}); i = j; continue
            if title.startswith("✕") and items:
                blocks.append({"type": "when", "avoid": when_list(items), "title": title.lstrip("✕ ").strip()}); i = j; continue
            blocks.append({"type": "h" if l.startswith("##### ") else "h4", "text": title}); i += 1; continue
        if l.startswith("|"):
            flush(); j = i
            while j < len(lines) and lines[j].startswith("|"):
                j += 1
            head, rows = table_rows(lines[i:j])
            if head:
                blocks.append({"type": "table", "head": head, "rows": rows})
            i = j; continue
        if l.startswith("- "):
            flush(); items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:].strip()); i += 1
            blocks.append({"type": "list", "items": items}); continue
        if re.match(r"^\d+\. ", l):
            flush(); items = []
            while i < len(lines) and re.match(r"^\d+\. ", lines[i]):
                n, text = re.match(r"^(\d+)\. (.*)$", lines[i]).groups()
                name, desc = split_part(text, doc_text)
                items.append({"n": int(n), "name": name, "desc": fix(desc)}); i += 1
            blocks.append({"type": "parts", "items": items}); continue
        para.append(l); i += 1
    flush()
    return blocks

# 원문 추출에서 붙어 버려 규칙으로 못 나누는 곳 (카드 칩과 그 뒤 글)
RAW_FIXES = {
    "현재 노드 재포커스포커스": "현재 노드 재포커스 ·포커스",
    "고정 폭 · 참고 350px영역 치수(px)는": "고정 폭 · 참고 350px\n\n영역 치수(px)는",
    "Lv5유의사항사용자의": "Lv5\n\n유의사항사용자의",
}


def parse(doc, body):
    for a, b in RAW_FIXES.items():
        body = body.replace(a, b)
    lead, *secs = re.split(r"^#### ", body, flags=re.M)
    out = {"id": doc["id"], "title": doc["title"], "section": short(doc["section"]), "group": " › ".join(doc["path"][1:-1]),
           "place": PLACE[short(doc["section"])], "lead": "\n".join(l for l in lead.strip().splitlines() if not noise(l)),
           "overview": [], "when": {"use": [], "avoid": []}, "sections": [], "do": [], "dont": [], "targets": TARGETS.get(doc["id"], [])}
    for sec in secs:
        title, _, rest = sec.partition("\n")
        title = title.strip()
        lines = rest.strip("\n").splitlines()
        if title.startswith(DROP_SECTIONS):
            continue
        if title.startswith("Do / Don't"):
            cur = None
            for l in lines:
                if l.startswith("###### Don"):  # "Don't"도 "Do"로 시작하므로 먼저 본다
                    cur = out["dont"]
                elif l.startswith("###### Do"):
                    cur = out["do"]
                elif l.startswith("- ") and cur is not None:
                    cur.append(l[2:].strip())
            continue
        blocks = blocks_of(lines, body)
        if title.startswith("개요") and not out["overview"]:
            for b in blocks:
                if b["type"] == "when":
                    out["when"]["use"] += b.get("use", [])
                    out["when"]["avoid"] += b.get("avoid", [])
                    out["when"].setdefault("useTitle", b["title"]) if "use" in b else out["when"].setdefault("avoidTitle", b["title"])
                else:
                    out["overview"].append(b)
            continue
        if blocks:
            out["sections"].append({"title": title, "blocks": blocks})
    out["links"] = sorted(set(re.findall(r"\]\(([a-z0-9-]+)\.html", body)) - {doc["id"]})
    return out

# ---------- 규칙: Do/Don't → UX 거버넌스 ----------
OUT.mkdir(exist_ok=True)
for old in OUT.glob("*.json"):
    old.unlink()
docs, rules = [], []
plain = lambda s: re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s).replace("**", "")
for d in index["docs"]:
    if PLACE[short(d["section"])] is None:
        continue  # 버전 이력: 추출본에 내용이 없다
    body = (SRC / f"{d['id']}.md").read_text(encoding="utf-8")
    s = parse(d, body)
    pre = d["id"].upper()
    s["ruleIds"] = {"do": [], "dont": []}
    for kind, label in (("do", "권장"), ("dont", "금지")):
        for t in s[kind]:
            rid = f"{pre}-{len(s['ruleIds']['do']) + len(s['ruleIds']['dont']) + 1:02d}"
            s["ruleIds"][kind].append(rid)
            # 대상은 비워 둔다: 가이드의 권장 · 금지를 여러 컴포넌트에 한꺼번에 걸지 않는다 (규칙은 컴포넌트마다 달라질 수 있다)
            rules.append({"id": rid, "doc": d["id"], "section": d["title"], "kind": label, "text": plain(t), "targets": [], "source": "UX 패턴 가이드"})
    (OUT / f"{d['id']}.json").write_text(json.dumps(s, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    docs.append({k: s[k] for k in ("id", "title", "section", "group", "place", "targets", "links")} | {"lead": plain(s["lead"].split("\n")[0])})

structure = {
    "$description": "UX 패턴 가이드를 포털 구조로 나눈 결과. scripts/structure_ux_guide.py가 만든다. 문서 본문 구조는 docs/<id>.json",
    "source": index["source"], "generated": index["generated"], "docs": docs, "rules": rules,
}
(SRC / "structure.json").write_text(json.dumps(structure, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(SRC / "glossary.json").write_text(json.dumps({"$description": "UX 패턴 가이드 용어사전 (glossary.md)", "terms": glossary}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"docs {len(docs)} · rules {len(rules)} · glossary {len(glossary)}")
