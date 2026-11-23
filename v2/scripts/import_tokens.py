"""Figma 변수 내보내기(W3C 디자인 토큰 JSON) → tokens/variables.json.

입력: tokens/figma/primitive.tokens.json · semantic.tokens.json · component.tokens.json (Figma › 변수 › 컬렉션별 내보내기)
없는 컬렉션 파일은 기존 tokens/variables.json의 그 층을 그대로 둔다.
Semantic 파일이 없으면 Component 토큰이 가리키는 Semantic 이름과 값을 거꾸로 찾아 빈 자리를 채우고 derived로 표시한다.
실행: python3 scripts/import_tokens.py
"""
import json, re, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tokens/figma"
OUT = ROOT / "tokens/variables.json"
COLL = {"primitive": "Primitive", "semantic": "Semantic", "component": "Component"}
TYPE = {"color": "COLOR", "number": "FLOAT", "string": "STRING", "boolean": "BOOLEAN"}
UNITLESS = {"FONT_WEIGHT", "OPACITY"}


def kebab(path):
    """Figma 경로(color/bg/brand) → CSS 변수(--color-bg-brand). 낙타 표기는 하이픈으로"""
    return "--" + "-".join(re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", p).lower() for p in path.split("/"))


def color(v):
    h = v.get("hex", "#000000").upper()
    a = v.get("alpha", 1)
    return h if a >= 1 else h + format(round(a * 255), "02X")


def walk(o, path, out):
    if isinstance(o, dict) and "$type" in o:
        out.append(("/".join(path), o))
        return
    if isinstance(o, dict):
        for k, v in o.items():
            if not k.startswith("$"):
                walk(v, path + [k], out)


def convert(kind, data):
    L = []
    walk(data, [], L)
    toks = {}
    for path, o in L:
        ext = o.get("$extensions", {})
        name = (ext.get("com.figma.codeSyntax", {}).get("WEB") or "").strip()
        name = re.match(r"var\((--[^)]+)\)", name).group(1) if name.startswith("var(") else kebab(path)
        t = TYPE.get(o["$type"], o["$type"].upper())
        v = o["$value"]
        scopes = ext.get("com.figma.scopes") or []
        if t == "COLOR":
            value = color(v)
        elif t == "FLOAT":
            unitless = set(scopes) & UNITLESS or "/weight" in path.lower()
            value = str(v) if unitless else f"{v:g}px"
        else:
            value = str(v)
        alias = ext.get("com.figma.aliasData") or {}
        toks[name] = {
            "figma": path,
            "collection": COLL[kind],
            "type": t,
            "value": value,
            "ref": kebab(alias["targetVariableName"]) if alias.get("targetVariableName") else None,
            "description": o.get("$description", ""),
            "id": ext.get("com.figma.variableId"),
        }
        if alias.get("targetVariableName"):
            toks[name]["refSet"] = alias.get("targetVariableSetName")
            toks[name]["refPath"] = alias["targetVariableName"]
    return toks


def main():
    old = json.load(open(OUT))
    tokens = {k: v for k, v in old["tokens"].items()}
    got = []
    for kind, coll in COLL.items():
        f = SRC / f"{kind}.tokens.json"
        if not f.exists():
            continue
        got.append(coll)
        new = convert(kind, json.load(open(f)))
        before = {k for k, v in tokens.items() if v["collection"] == coll}
        tokens = {k: v for k, v in tokens.items() if v["collection"] != coll}
        tokens.update(new)
        print(f"{coll}: {len(before)} → {len(new)} (새로 {len(set(new) - before)} · 빠짐 {len(before - set(new))})")
    derived = 0
    if "Semantic" not in got:
        # Component가 가리키는 Semantic이 기존 층에 없으면 Component 값으로 채운다
        for k, v in list(tokens.items()):
            if v["collection"] == "Component" and v.get("refSet") == "Semantic" and v["ref"] not in tokens:
                tokens[v["ref"]] = {"figma": v.get("refPath") or v["ref"][2:], "collection": "Semantic", "type": v["type"], "value": v["value"], "ref": None, "description": "Semantic 파일이 없어 Component 토큰에서 거꾸로 찾은 값", "derived": True}
                derived += 1
        print(f"Semantic: 파일 없음 · 기존 {sum(1 for v in tokens.values() if v['collection'] == 'Semantic' and not v.get('derived'))}개 유지 · Component에서 찾은 {derived}개 추가")
    order = {"Primitive": 0, "Semantic": 1, "Component": 2}
    tokens = dict(sorted(tokens.items(), key=lambda kv: order[kv[1]["collection"]]))
    missing = [k for k, v in tokens.items() if v.get("ref") and v["ref"] not in tokens]
    out = {
        "source": {
            **old["source"],
            "note": f"Figma 변수 내보내기({', '.join(got)})를 {datetime.date.today()}에 반영"
            + ("" if "Semantic" in got else ". Semantic은 이전에 읽은 값 + Component에서 거꾸로 찾은 값"),
            "imported": {c: str(datetime.date.today()) for c in got},
        },
        "collections": old.get("collections", {}),
        "tokens": tokens,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print("전체", len(tokens), "· 참조 대상이 없는 토큰", len(missing), missing[:8])


main()
