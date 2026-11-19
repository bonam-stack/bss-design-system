"""블록 정책(catalog.json 블록 항목의 policy)을 UX 패턴 가이드 모듈 문서에서 만든다.

- 블록만 다루는 문서(대상 첫째가 이 블록이고 그 블록 하나에 딸린 문서)가 있으면 그 문서의 쓸 때 · 다른 것 · 권장 · 금지를 쓴다.
- 여러 블록을 함께 다루는 개요 문서뿐이면, 블록 이름이 들어간 문장만 고른다.
- 문장은 가이드 원문 그대로(마크다운 링크 · 굵게만 걷어 냄). 포털에서 고친 글은 게시 텍스트로 덮인다.
실행: python3 scripts/build_block_policy.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CAT = ROOT / "catalog/catalog.json"
G = ROOT / "guides/ux-pattern"
KEYWORD = {
    "b-gnb": ["GNB"], "b-lnb": ["사이드 내비게이션 바"], "b-context-bar": ["콘텍스트 바", "컨텍스트 바"], "b-top": ["페이지 타이틀"],
    "b-callout": ["사용 안내"], "b-search-general": ["조회조건"], "b-detail-info": ["상세정보"], "b-content": ["컨텐트 모듈", "컨텐트"],
    "b-action": ["액션 영역", "실행 바"], "b-table-basic": ["테이블"], "b-table-big": ["빅 테이블", "빅 그리드"], "b-statusbar": ["상태바"],
    "b-hud": ["HUD"], "b-node": ["노드"], "b-actionbar": ["액션바"],
}
# 블록만 다루는 문서를 직접 정한 것 (None = 개요 문서들에서 이름으로 고름)
OWN = {"b-content": "layout-content", "b-node": None, "b-table-big": "grid-biggrid"}
plain = lambda s: re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", str(s)).replace("**", "").replace("`", "").strip()


def main():
    st = json.load(open(G / "structure.json"))
    docs = {d["id"]: d for d in st["docs"]}
    load = lambda i: json.load(open(G / "docs" / f"{i}.json"))
    cat = json.load(open(CAT))
    for it in cat["items"]:
        if it["kind"] != "block":
            continue
        b = it["code"]
        rel = [d for d in st["docs"] if b in d["targets"] and d["place"] in ("blocks", "foundations", "patterns")]
        rel.sort(key=lambda d: (d["place"] != "blocks", d["targets"].index(b), len(d["targets"])))
        if b in OWN:
            own = [docs[OWN[b]]] if OWN[b] else []
            if not OWN[b]:
                rel = [docs["layout-node"]] + [d for d in rel if d["id"] != "layout-node"]
        else:
            own = [d for d in rel if d["targets"][0] == b and d["place"] == "blocks"]
        kw = KEYWORD.get(b, [it["name"]])
        hit = lambda t: any(k in t for k in kw)
        pol = {"use": [], "avoid": [], "do": [], "dont": [], "sources": []}
        if own:
            d = load(own[0]["id"])
            pol["use"] = [plain(x) for x in d["when"]["use"]][:4]
            pol["avoid"] = [{"text": plain(a["text"]), "alt": plain(a.get("alt", ""))} for a in d["when"]["avoid"]][:4]
            pol["do"] = [plain(x) for x in d["do"]][:5]
            pol["dont"] = [plain(x) for x in d["dont"]][:5]
            pol["sources"] = [own[0]["id"]]
        else:
            for m in rel[:4]:
                d = load(m["id"])
                got = False
                for k in ("do", "dont"):
                    for x in d[k]:
                        if hit(x) and plain(x) not in pol[k] and len(pol[k]) < 5:
                            pol[k].append(plain(x))
                            got = True
                if got:
                    pol["sources"].append(m["id"])
        if not pol["sources"]:
            pol["sources"] = [m["id"] for m in rel[:2]]
        it["policy"] = pol
        print(b, {k: len(v) for k, v in pol.items()}, pol["sources"])
    CAT.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n")


main()
