"""DS 토큰 전달본(v2/tokens/ds/design-tokens.tokens.json, DTCG) → v2/tokens/variables.json.

전달본은 DS가 관리하는 원본에서 생성한 것이라 직접 고치지 않는다. 새 전달본을 받으면 v2/tokens/ds/를 통째로 바꾸고 이 스크립트를 다시 돌린다.
- name: $extensions.com.bss.css (CSS 변수 이름, 전달본의 규칙 그대로)
- value: 참조를 끝까지 풀어 낸 값. 그림자는 CSS box-shadow 문자열
- ref: 바로 가리키는 토큰의 CSS 변수 이름
실행: python3 v2/scripts/import_ds_tokens.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tokens/ds/design-tokens.tokens.json"
OUT = ROOT / "tokens/variables.json"
COLL = {"primitive": "Primitive", "semantic": "Semantic", "component": "Component"}
TYPE = {"color": "COLOR", "dimension": "FLOAT", "fontWeight": "FLOAT", "fontFamily": "STRING", "shadow": "SHADOW"}


def main():
    d = json.load(open(SRC))
    meta = d["$extensions"]["com.bss"]
    flat = {}

    def walk(o, path):
        if isinstance(o, dict) and "$value" in o:
            flat[".".join(path)] = o
            return
        if isinstance(o, dict):
            for k, v in o.items():
                if not k.startswith("$"):
                    walk(v, path + [k])

    walk(d, [])
    ref_re = re.compile(r"^\{([^}]+)\}$")

    def resolve(v, depth=0):
        if isinstance(v, str):
            m = ref_re.match(v)
            if m:
                return resolve(flat[m.group(1)]["$value"], depth + 1)
            return v
        if isinstance(v, (int, float)):
            return f"{v:g}px"
        if isinstance(v, dict) and "value" in v and "unit" in v:  # DTCG 치수 {value, unit}
            return f"{v['value']:g}{v['unit']}" if isinstance(v["value"], (int, float)) else f"{v['value']}{v['unit']}"
        if isinstance(v, dict):  # 그림자
            r = {k: resolve(x, depth + 1) for k, x in v.items()}
            return f"{r.get('offsetX', '0px')} {r.get('offsetY', '0px')} {r.get('blur', '0px')} {r.get('spread', '0px')} {r.get('color', '')}".strip()
        return str(v)

    tokens = {}
    for path, o in flat.items():
        b = o["$extensions"]["com.bss"]
        name = b["css"]
        raw = o["$value"]
        m = ref_re.match(raw) if isinstance(raw, str) else None
        val = resolve(raw)
        if o["$type"] == "fontWeight" and val.endswith("px"):
            val = val[:-2]
        tokens[name] = {
            "figma": (b.get("figma") or {}).get("variable") or path.split(".", 1)[1].replace(".", "/"),
            "path": path.split(".", 1)[1].replace(".", "/"),
            "collection": COLL[path.split(".")[0]],
            "type": TYPE.get(o["$type"], o["$type"].upper()),
            "value": val,
            "ref": flat[m.group(1)]["$extensions"]["com.bss"]["css"] if m else None,
            "description": o.get("$description", ""),
            "status": b.get("status"),
        }
    out = {
        "source": {
            "name": f"DS 토큰 v{meta['version']} · {meta['figmaFileName']}",
            "fileKey": meta["figmaFile"],
            "version": meta["version"],
            "note": "DS 토큰 전달본(v2/tokens/ds)에서 생성. 전달본은 직접 고치지 않는다",
        },
        "collections": {},
        "tokens": tokens,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    from collections import Counter
    print(f"v{meta['version']} · {len(tokens)}개", Counter(t["collection"] for t in tokens.values()), "· 값 없음", sum(1 for t in tokens.values() if not t["value"]))


main()
