"""컴포넌트 사용 가이드(components/<key>/guide.json의 policy)를 UX 패턴 가이드 새 릴리스 문서에서 다시 만든다.

규칙 문장은 guides/ux-pattern/docs/<id>.json에서 그대로 가져온다 (어느 절 · 어느 항목인지 SPEC에 적는다).
컴포넌트 쪽 사정(예: 필수 표기 변형이 아직 없음)인 gap은 기존 guide.json에서 이름이 같은 규칙의 것을 이어받는다.
실행: python3 scripts/sync_component_policy.py  →  바뀐 점을 출력한다.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "guides/ux-pattern/docs"
RELEASE = json.load(open(ROOT / "guides/ux-pattern/structure.json")).get("release") or "20261106"
_cache = {}


def doc(i):
    if i not in _cache:
        _cache[i] = json.load(open(DOCS / f"{i}.json"))
    return _cache[i]


def blocks(i, section, h=None):
    """절(section) 안의 블록. h가 있으면 그 소제목 다음부터 다음 소제목 전까지. 같은 이름 절이 여럿이면 처음 것"""
    for s in doc(i)["sections"]:
        if s["title"] != section:
            continue
        if h is None:
            return s["blocks"]
        out, on = [], False
        for b in s["blocks"]:
            if b["type"] == "h":
                if on:
                    break
                on = b["text"] == h
                continue
            if on:
                out.append(b)
        if out:
            return out
    raise KeyError(f"{i} › {section} › {h}")


def strip_md(t):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    return t.replace("**", "").replace("`", "").strip()


def item(i, section, h, name, rename=None):
    """목록의 '**이름**: 설명' 항목 → 규칙"""
    for b in blocks(i, section, h):
        if b["type"] != "list":
            continue
        for x in b["items"]:
            m = re.match(r"\*\*(.+?)\*\*\s*:\s*(.+)", x, re.S)
            if m and m.group(1).strip() == name:
                desc = strip_md(m.group(2))
                return {"name": rename or name.strip(), "desc": desc, "from": f"{doc(i)['title']} · {h or section}"}
    raise KeyError(f"{i} › {section} › {h} › {name}")


def text(i, section, h=None, n=0):
    L = [b["text"] for b in blocks(i, section, h) if b["type"] in ("text", "note")]
    return strip_md(L[n])


def pick(i, kind, *words):
    """문서 Do/Don't 중 단어가 하나라도 들어간 것 (문서 순서 그대로)"""
    return [strip_md(t) for t in doc(i)[kind] if any(w in t for w in words)]


def rel(i, desc):
    return {"name": doc(i)["title"], "desc": desc, "file": i}


def LABELS():
    """버튼 라벨 문서의 표준 명칭 표: (명칭, 의미, 쓰지 않는 말)"""
    t = next(b for b in blocks("layout-button-label", "라벨") if b["type"] == "table")
    return [(strip_md(r[0]), strip_md(r[1]), strip_md(r[2])) for r in t["rows"]]


IN = "ui-comp-input"
FV = "resp-form-validation"
def COMMON_REQ(where="field"):
    r = item(IN, "공통 설계 기준", None, "필수 표기")
    # 공통 문장(배경으로 표시 · 선택 아이콘은 아이콘 배경)을 이 컴포넌트에 맞는 쪽으로
    r["desc"] = "값을 반드시 받아야 하는 항목은 선택 아이콘의 배경을 칠해 표시합니다." if where == "icon" else "값을 반드시 받아야 하는 항목은 필드 배경으로 표시합니다."
    return r
SORT = lambda: item(IN, "공통 설계 기준", None, "정렬")
PH = lambda: item(IN, "공통 설계 기준", None, "플레이스홀더")
LOCK = {"name": "실행 버튼 잠금", "desc": "필수 항목이 비어 있거나 함께 고를 수 없는 조건을 동시에 골랐을 때 조회 · 저장 버튼을 비활성으로 두고, 어떤 항목이 비었는지 · 어떤 조건이 충돌하는지 알립니다.", "from": "일반 입력 · 실행 버튼을 잠급니다"}


def VALID(select=False):
    if select:
        cond = {"name": "고를 수 없는 항목", "desc": "조건에 맞지 않아 고를 수 없는 항목은 비활성(Disabled)으로 둡니다.", "from": "일반 입력 · 입력 조건을 정합니다"}
    else:
        cond = {"name": "입력 조건", "desc": " ".join(text(IN, "입력 유효성", "입력 조건을 정합니다").split("\n")), "from": "일반 입력 · 입력 조건을 정합니다"}
    return [cond, dict(LOCK)]


FIELD_ERR = lambda: [
    item(IN, "입력 유효성", "필드에 오류를 표시합니다", "판정 시점", "오류 판정 시점"),
    item(IN, "입력 유효성", "필드에 오류를 표시합니다", "표시 방법", "오류 표시 방법"),
    item(IN, "입력 유효성", "필드에 오류를 표시합니다", "해제 시점", "오류 해제 시점"),
]
SELECT_AVOID = {
    "multi": [
        {"text": "하나만 고르는 경우", "alt": "Radio"},
        {"text": "옵션이 많거나 노출 공간이 부족한 경우", "alt": "Multi Select"},
        {"text": "값을 확정하지 않고 보고 있는 목록의 범위를 좁히는 경우", "alt": "패싯 칩 · 다중 선택"},
        {"text": "기능의 활성 · 비활성 상태를 전환하는 경우", "alt": "Switch · Toggle"},
    ],
    "single": [
        {"text": "여럿을 고르는 경우", "alt": "Checkbox"},
        {"text": "옵션이 많거나 노출 공간이 부족한 경우", "alt": "Single Select"},
        {"text": "값을 확정하지 않고 보고 있는 목록의 범위를 바꾸는 경우", "alt": "패싯 칩 · 단일 선택"},
        {"text": "기능의 활성 · 비활성 상태를 전환하는 경우", "alt": "Switch · Toggle"},
    ],
}


# ---- BSS Design Guideline v2.0 (Figma 9aVw18Cj7CzvHE1ljGaM9m) 규칙 — 프레임 글을 옮긴 것 ----
def G(name, desc, frm):
    return {"name": name, "desc": desc, "from": f"Guideline · {frm}"}


# Field Rules (2654:182648): field/* 토큰을 쓰는 입력 컴포넌트(Text Field · Password Field · Text Area) 공통
def FR_RULES():
    sp = "Field Rules › States › State Priority"
    return [
        G("Importance", "필수 여부와 입력 강조는 importance 값으로 표현합니다. 필수·입력 권장 여부에 따라 None·Required·Attention 중 하나만 고르며, Attention과 Required가 모두 해당하면 Required를 고릅니다. ReadOnly에서는 Attention만 강조를 유지하고, Disabled에서는 강조를 표시하지 않습니다.", "Field Rules › Variants › Importance"),
        G("State Priority · Label", "모든 상태에서 같은 모양을 유지합니다. Error·ReadOnly·Disabled에서도 바뀌지 않습니다.", sp),
        G("State Priority · 배경", "배경은 필드의 성격을 유지해, 어떤 값을 넣어야 하는 필드인지 알 수 있게 합니다. 필드 스타일(None·Required·Attention)의 바탕이 기준입니다. Hover이면 같은 스타일의 한 단계 진한 바탕을 사용하고, Focus·Error이면 기준 바탕을 그대로 유지합니다. ReadOnly이면 읽기 전용 바탕(color/bg/neutral/muted)으로 바뀌며, Attention만 예외로 진한 강조 바탕(color/bg/attention/strong)을 사용합니다. Disabled이면 스타일과 관계없이 비활성 바탕입니다.", sp),
        G("State Priority · 테두리", "테두리는 지금 일어난 상태를 우선해, 지금 확인하거나 고쳐야 할 것을 알 수 있게 합니다. Error가 있으면 오류 테두리(color/border/danger/strong)가 다른 상태보다 우선합니다. Error가 없으면 Focus는 입력 중 테두리(color/border/neutral/focus)를, Default·Hover는 필드 스타일의 테두리를 사용합니다. ReadOnly·Disabled이면 각 상태의 테두리를 사용하고 Error를 표시하지 않습니다.", sp),
        G("State Priority · 바깥 링", "Error일 때만 오류 링(color/border/danger/faint)을 표시합니다. 그 밖의 상태와 ReadOnly·Disabled에서는 표시하지 않습니다.", sp),
        G("State Priority · Helper Text", "Error이면 오류 색(color/fg/danger/strong)과 아이콘으로 오류 메시지를 표시합니다. ReadOnly·Disabled이면 Error여도 기본 스타일을 유지합니다.", sp),
        G("State Priority · Focus Ring", "Disabled를 포함한 모든 상태 위에 겹쳐 표시합니다. 입력 중 테두리(Focus)와는 별개입니다.", sp),
        G("상태 조합", "Required·Attention + Error는 바탕(필수·강조)을 유지하고 오류 테두리와 오류 링을 표시합니다. Required + Focus는 필수 배경에 입력 중 테두리, Required + Filled는 필수 배경과 필수 테두리를 유지합니다. Required + ReadOnly는 필수 배경을 해제하고 읽기 전용 배경·테두리를, Attention + ReadOnly는 강조 배경을 한 단계 진하게 유지하고 강조 테두리를 씁니다. Required·Attention + Disabled는 비활성 배경과 비활성 테두리(color/border/neutral/disabled)입니다.", "Field Rules › States › State Combination Examples"),
        G("오류를 표시하지 않는 상태", "Disabled·ReadOnly에서는 오류를 표시하지 않습니다. 모든 입력 컴포넌트에 적용합니다.", "Field Rules › States › Availability"),
        *FR_ERROR(),
        G("필수 표기 · 배경", "필수 항목은 컨트롤 배경(required 스타일)으로 표시하고, ReadOnly·Disabled 필드는 제외합니다. 바탕색만으로는 필수 여부가 전달되지 않으므로, 개발에서 aria-required=\"true\"를 함께 적용합니다.", "Field Rules › Content › Required Mark"),
        G("필수 표기 · 화면별", "일반 폼은 컨트롤 배경과 폼 오른쪽 위쪽 범례로 바탕색이 필수라는 뜻을 알립니다. 노드 본문·사이드 패널은 자리가 좁아 범례 없이 컨트롤 배경만 씁니다. 선택 항목은 필수가 배경으로 이미 구분되므로 “(선택)”을 붙이지 않습니다.", "Field Rules › Content › Required Mark"),
        G("Label 없는 영역", "조회 조건 바처럼 필드마다 Label이 없는 영역에서도 필수는 컨트롤 배경으로 표시합니다. 보이는 이름이 없으므로 Placeholder에 항목명을 입력합니다.", "Field Rules › Content › Without Label"),
    ]


def FR_ERROR():
    """Field Rules › Anatomy(Inline Message) · Behavior(Display/Clear Timing)"""
    b = "Field Rules › Behavior › Display Timing"
    return [
        G("Inline Message", "오류는 필드 단위로 표시합니다. 오류가 발생한 필드의 테두리(Error Ring)와 바로 아래 Inline Message로, 오류 아이콘과 함께 원인과 해결 방법을 한 문장으로 안내합니다. 색과 테두리만으로는 오류가 전달되지 않으므로 아이콘과 문장을 함께 사용합니다.", "Field Rules › Anatomy"),
        G("표시 시점 · 처음 화면을 열 때", "필수 스타일(컨트롤 배경)은 바로 보입니다. 오류는 표시하지 않습니다.", b),
        G("표시 시점 · 포커스가 나갈 때", "그 필드의 형식만 검사합니다. 형식에 맞지 않으면 Error Ring과 Inline Message를 표시합니다. 비어 있는 필수 필드는 여기서 지적하지 않고, 제출할 때 표시합니다.", b),
        G("표시 시점 · 제출할 때", "필수·형식·서버 확인 항목을 모두 검사하고, 오류가 있는 필드마다 Error Ring과 Inline Message를 표시합니다. 오류가 2건 이상일 때의 요약(요약 배너·빅 폼의 프리뷰 레일)은 UX 패턴의 폼 유효성 체크를 따릅니다.", b),
        G("표시 시점 · 값을 올바르게 고칠 때", "오류가 표시된 필드는 값이 올바르게 바뀌는 순간 오류를 지웁니다(입력 중 바로 해제). 고친 결과를 바로 확인할 수 있습니다. 오류를 늘리는 판정은 필드를 벗어난 뒤, 줄이는 판정은 입력 즉시 합니다.", "Field Rules › Behavior › Display Timing · Clear Timing"),
    ]


FR_DO = [
    "읽기 전용·비활성 필드는 오류 상태 없이 값만 보여 줍니다. (사용자가 값을 고칠 수 없는 필드라 오류 상태를 두지 않습니다.)",
    "필수 필드는 오류 테두리가 나와도 필수 배경을 유지합니다. (배경은 필드의 성격을 유지해, 어떤 값을 넣어야 하는 필드인지 계속 알려 줍니다.)",
    "오류는 아이콘과 Inline Message 문장으로 함께 알립니다. (필드 바로 아래에 오류 원인과 해결 방법을 한 문장으로 안내합니다.)",
    "필드 안 Placeholder로 항목명을 알리고, 필수 필드는 required 스타일로 표시합니다. (Label이 없어도 무엇을 입력하는 칸인지, 필수인지 알 수 있습니다.)",
]
FR_DONT = [
    "읽기 전용·비활성 필드에는 오류를 표시하지 않습니다. (고칠 방법이 없는 오류가 보여 사용자가 혼란을 겪습니다.)",
    "오류가 나도 배경을 빨강으로 바꾸지 않습니다. (필수·강조 배경이 사라져 어떤 값을 넣어야 하는 필드인지 알 수 없습니다.)",
    "색과 테두리만으로 오류를 알리지 않습니다. (색과 테두리만으로는 무엇이 잘못됐는지 전달되지 않습니다.)",
    "Placeholder로 필수 안내를 대체하지 않습니다. (Placeholder는 입력을 시작하면 사라져 필수 여부를 계속 알릴 수 없습니다. 필수는 배경으로 표시합니다.)",
]


# Text Fields (2430:92526): Text Field · Password Field · Text Area
def TF_RULES(kind):
    """kind: text · password · area"""
    tf = "Text Fields"
    icon = {
        "text": "ReadOnly·Disabled에서는 Clear Button을 비활성 색으로 표시합니다. Clear Button은 Focus·Filled에서만 표시합니다.",
        "password": "ReadOnly·Disabled에서는 Visibility Toggle을 비활성 색으로 표시합니다.",
        "area": "ReadOnly·Disabled에서는 Resize Handle을 비활성 색으로 표시합니다.",
    }[kind]
    out = [
        G("State Priority · Text", "Empty는 Placeholder를, Filled는 입력한 값을 표시합니다" + ("(Password Field는 값을 가려서 표시합니다)" if kind == "password" else "") + ". Disabled는 비활성 색으로 표시합니다.", f"{tf} › States › State Priority"),
        G("State Priority · Icon·Button", icon, f"{tf} › States › State Priority"),
        G("Validation · None", "오류가 없는 기본 상태는 유효성 검사 전후에 동일하게 유지되며, 통과 여부를 따로 표시하지 않습니다.", f"{tf} › States › Validation"),
    ]
    if kind == "area":
        out.append(G("크기", "Text Area는 한 가지 크기로 제공하며, Size가 없어 Importance만 고릅니다.", f"{tf} › Variants › Size · Combination"))
    else:
        out += [
            G("크기", "Large(높이 40px)는 입력이 화면의 주요 작업인 경우처럼 강조가 필요할 때, Medium(36px)은 일반적인 폼 입력의 기본 크기, Small(28px)은 Table·필터·Toolbar 등 공간이 제한된 영역에 씁니다.", f"{tf} › Variants › Size"),
            G("조합", "Importance × Size는 모든 조합을 사용할 수 있습니다.", f"{tf} › Variants › Combination"),
        ]
    out += [
        G("정보 완결성과 예측 가능성", "입력·노출되는 데이터는 잘림(Ellipsis)이나 별도 동작(Hover, 클릭 등) 없이 한눈에 확인할 수 있게 합니다. 데이터의 성격(글자 수, 형태)에 맞는 너비를 제공하여 사용자가 입력할 값을 직관적으로 예측할 수 있도록 합니다.", f"{tf} › Layout › Principle"),
        G("최대 너비 제한", "지나치게 넓은 입력 필드는 시선 이동 거리를 늘려 가독성과 입력 편의성을 떨어뜨립니다. 컨텍스트에 맞는 최대 너비(Maximum Width)를 적용하고, 화면 전체를 가로지르는 무분별한 확장(Stretch)은 지양합니다.", f"{tf} › Layout › Principle"),
        G("너비 · Flexible (가변형)", "입력 필드가 속한 상위 영역의 너비에 맞춰 100% 확장됩니다. 가독성 저해를 막기 위해 최대 너비(600px~800px 권장)를 설정하고, 콘텐츠 잘림을 방지하기 위해 최소 너비를 반드시 보장합니다.", f"{tf} › Layout › Type & Guideline"),
    ]
    if kind != "area":
        out += [
            G("너비 · Fixed (고정형)", "입력·노출되는 데이터의 일반적인 길이에 맞춰 크기를 고정합니다. 기본 너비 200px(고객명 등 일반적인 짧은 텍스트의 표준), 최소 너비 120px(한글 약 5자 / 영문 약 8~10자가 잘리지 않는 크기), 최대 너비 400px(기본 너비의 2배)을 적용합니다.", f"{tf} › Layout › Type & Guideline"),
            G("정렬 · Height", "같은 줄의 Select·Button과 Size(높이)를 맞춥니다.", f"{tf} › Layout › Alignment"),
        ]
    out += [
        G("정렬 · Label", "같은 화면 안에서 Label 위치(위쪽·왼쪽)를 하나로 통일합니다.", f"{tf} › Layout › Alignment"),
        G("문구 · Label", "입력할 값의 이름을 명사형으로 씁니다.(예: “고객명”) 필수 표기는 Field(입력 필드 공통) 문서를 따릅니다.", f"{tf} › Content › Writing"),
        G("문구 · Placeholder", "입력 예시나 형식을 씁니다.(예: “010-0000-0000”) 입력하면 사라지므로 필드 이름이나 필수 정보는 Placeholder에 쓰지 않습니다.", f"{tf} › Content › Writing"),
        G("문구 · Helper Text", "허용 형식·단위·예시·제약 사항을 안내합니다. 작성 규칙은 Helper Text 문서를 따릅니다.", f"{tf} › Content › Writing"),
        G("문구 · Error Message", "오류의 원인과 해결 방법을 함께 안내합니다. 작성 규칙은 Helper Text 문서를 따릅니다.", f"{tf} › Content › Writing"),
    ]
    return out


TF_DO_LAYOUT = "Text Field 너비는 놓이는 영역의 너비와 그리드에 맞게 적용합니다. (주소는 가변형으로 영역 너비를 채우고, 주소검색 버튼은 오른쪽에 나란히 배치합니다.)"
TF_DONT_LAYOUT = "영역 너비와 상관없이 Text Field 너비를 임의로 줄이지 않습니다. (주소처럼 긴 값을 입력하는 Text Field를 좁게 두어 내용이 잘리지 않게 합니다.)"
TF_DO_PW = "입력값을 가려야 하는 비밀번호는 Password Field로 입력받습니다. (입력한 값이 화면에 노출되지 않도록 가려서 표시합니다.)"
TF_DONT_PW = "비밀번호를 Text Field로 입력받지 않습니다. (입력한 값이 화면에 그대로 노출됩니다.)"
TF_DO_CONTENT = "Label에 필드 이름을 쓰고, Placeholder에는 입력 예시나 형식을 씁니다. (값을 입력해도 Label이 남아 있어 무엇을 입력하는 칸인지 알 수 있습니다.)"
TF_DONT_CONTENT = "필드 이름이나 필수 여부를 Placeholder에만 쓰지 않습니다. (값을 입력하면 Placeholder가 사라져 무엇을 입력하는 칸인지 알 수 없습니다.)"
TF_AVOID = [
    {"text": "정해진 옵션 중 하나를 고를 때", "alt": "Select · Radio"},
    {"text": "날짜·시간을 입력할 때", "alt": "Date Field"},
    {"text": "숫자를 일정 단위로 늘리거나 줄일 때", "alt": "Stepper"},
    {"text": "조회 팝업에서 값을 찾아 넣을 때", "alt": "Lookup Field"},
]
# UX 문서에서 고른 Do · Don't 중 Guideline 문장(이유 포함)과 같은 뜻인 것은 Guideline 쪽만 남긴다
DUP_UX = ("플레이스홀더로 필수 안내를", "색과 테두리만으로 오류를")
def ux_only(L):
    return [t for t in L if not any(t.startswith(d) for d in DUP_UX)]


# Selection (Checkbox 2430:92304 · Radio 2469:92485)
def merge_avoid(g, ux):
    """Guideline 대안을 앞에 두고, 같은 대안(첫 낱말 기준)을 가리키는 UX 문서 항목은 뺀다"""
    head = lambda a: a["alt"].split()[0]
    seen = {head(x) for x in g}
    return g + [x for x in ux if head(x) not in seen and not (x["alt"].endswith("Select") and "Select" in seen)]


def SIZE_RULE(name):
    return G("크기", f"Large는 헤더의 조회 영역처럼 강조가 필요한 곳에서, Medium은 일반적인 폼 입력에서 사용하는 기본 크기로 대부분의 입력 상황에 씁니다.", f"{name} › Variants › Size")


def radio(group=False):
    r = "Radio"
    sp = f"{r} › States › State Priority"
    layout = [
        G("나열 방향", "여러 개의 Radio는 RadioGroup으로 묶어 나열합니다. 기본은 가로 나열이며, Form 구성에 따라 세로로 나열할 수도 있습니다.", f"{r} › Layout › Alignment"),
        G("항목 간격", "항목 사이 간격은 RadioGroup에 정해진 고정 간격(12px)을 사용합니다. 간격은 Size와 관계없이 같습니다.", f"{r} › Layout › Alignment · Spec"),
        G("Size 일치", "RadioGroup과 그 안의 Radio는 같은 Size를 사용합니다. 예를 들어 RadioGroup이 Medium이면 안에 들어가는 Radio도 모두 Medium으로 설정합니다.", f"{r} › Layout › Alignment"),
    ]
    prio = [
        G("State Priority · 배경", "Unchecked이면 Interaction State와 Availability에 따라 바뀝니다. Checked이면 Interaction State·Availability와 관계없이 기본 배경을 유지합니다.", sp),
        G("State Priority · 테두리", "Checked이면 Interaction State에 따라 바뀌고, Disabled이면 비활성 색으로 표시합니다. Unchecked이면 Interaction State·Availability와 관계없이 기본 테두리 색을 유지합니다.", sp),
        G("State Priority · 선택 점", "Checked일 때만 표시하며, 테두리와 같은 상태를 따릅니다.", sp),
        G("State Priority · Label", "Value와 관계없이 Disabled일 때만 비활성 색으로 표시합니다.", sp),
        G("State Priority · Focus Ring", "Disabled를 포함한 모든 상태 위에 겹쳐 표시합니다.", sp),
        G("값 전환", "Unchecked 항목을 누르면 선택되고, 같은 그룹의 기존 선택은 해제됩니다. 같은 그룹에서 하나만 선택할 수 있습니다.", f"{r} › States › Value"),
    ]
    g_avoid = [
        {"text": "여러 항목을 함께 골라야 할 때", "alt": "Checkbox"},
        {"text": "하나의 설정을 켜거나 끌 때", "alt": "Switch"},
        {"text": "선택지가 많아 화면 공간이 부족할 때", "alt": "Select"},
    ]
    return {
        "sources": [IN],
        "lead": f"{text(IN, '단일 선택').splitlines()[0]} {text(IN, '단일 선택', 'Radio')}",
        "when": {
            "use": ["두 개 이상의 항목 중 하나만 골라야 할 때", "선택지를 모두 펼쳐 한눈에 비교하게 할 때", "선택지가 적어 모두 펼쳐 둘 공간이 있을 때"],
            "avoid": merge_avoid(g_avoid, SELECT_AVOID["single"]),
        },
        "rules": ([] if group else prio) + [SIZE_RULE(r)] + layout + [SORT(), COMMON_REQ("icon"), *VALID(True)],
        "do": ["같은 그룹에서는 하나의 항목만 선택할 수 있게 합니다. (새 항목을 선택하면 기존 선택은 해제됩니다.)"] + pick(IN, "do", "단일 선택과 다중 선택"),
        "dont": ["같은 그룹에서 여러 항목을 선택할 때 사용하지 않습니다. (여러 개를 선택해야 하는 경우에는 Checkbox를 사용합니다.)"] + pick(IN, "dont", "옵션이 많은", "Switch", "다중 선택 컴포넌트"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    }


SPEC = {
    "checkbox": lambda: {
        "sources": [IN],
        "lead": f"{text(IN, '다중 선택').splitlines()[0]} {text(IN, '다중 선택', 'Checkbox')}",
        "when": {
            "use": ["여러 항목 중 하나 이상을 함께 고를 때", "하위 항목 전체를 한 번에 선택·해제하는 상위 항목이 필요할 때", "모든 옵션을 노출한 상태에서 선택하여 조합한 결과를 사용하는 경우"],
            "avoid": merge_avoid([{"text": "여러 항목 중 하나만 골라야 할 때", "alt": "Radio"}, {"text": "누르는 즉시 기능이 켜지고 꺼져야 할 때", "alt": "Switch"}], SELECT_AVOID["multi"]),
        },
        "rules": [
            G("State Priority · State Indicator 바탕", "Value로 색 계열을 정하고, Interaction State로 단계를 정합니다. Disabled이면 Interaction State와 관계없이 Disabled 색을 따릅니다.", "Checkbox › States › State Priority"),
            G("State Priority · State Indicator 테두리", "Unchecked는 모든 상태에서 같은 테두리 색을 사용합니다. Checked·Indeterminate는 바탕과 같은 색을 따릅니다.", "Checkbox › States › State Priority"),
            G("State Priority · 체크 아이콘", "Value에 따라 체크·가로선 모양이 정해지며, 색은 모든 상태에서 같습니다.", "Checkbox › States › State Priority"),
            G("State Priority · Label", "Disabled일 때만 흐리게 바뀌며, Value와 Interaction State의 영향을 받지 않습니다.", "Checkbox › States › State Priority"),
            G("State Priority · Focus Ring", "Disabled를 포함한 모든 상태 위에 겹쳐 표시합니다.", "Checkbox › States › State Priority"),
            G("상위 항목의 값", "하위 항목이 일부만 선택되면 상위 Checkbox를 Indeterminate로, 모두 선택되면 Checked, 모두 해제되면 Unchecked로 표시합니다.", "Checkbox › States › Value · Do & Don't"),
            SIZE_RULE("Checkbox"),
            G("계층", "하위 Checkbox는 상위 Checkbox 아래에 들여 써서 계층을 드러냅니다.", "Checkbox › Layout › Alignment"),
            G("나열 방향", "여러 개의 Checkbox는 가로 또는 세로 방향으로 나열할 수 있습니다.", "Checkbox › Layout › Alignment"),
            item(IN, "다중 선택", "Checkbox", "그룹 상태"), SORT(), COMMON_REQ("icon"), *VALID(True),
        ],
        "do": [
            "하위 항목이 일부만 선택되면 상위 Checkbox를 Indeterminate로 표시합니다. (하위 항목이 모두 선택되면 Checked, 모두 해제되면 Unchecked로 표시합니다.)",
            "여러 항목을 함께 고를 수 있을 때 Checkbox를 사용합니다. (예: “알림 수신 방법”)",
        ] + pick(IN, "do", "단일 선택과 다중 선택"),
        "dont": [
            "하위 항목이 일부만 선택된 상태에서 상위 Checkbox를 Checked로 표시하지 않습니다. (전체가 선택된 것으로 오인할 수 있습니다.)",
            "하나만 골라야 하는 항목에 Checkbox를 사용하지 않습니다. (Radio를 사용합니다. 예: “가입 구분”)",
        ] + pick(IN, "dont", "옵션이 많은", "다중 선택 컴포넌트"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "radio": radio,
    "radio-group": lambda: radio(group=True),
    "text-field": lambda: {
        "sources": [IN, FV],
        "lead": f"{text(IN, '입력')} 형식과 길이가 명확한 단일 값에 씁니다.",
        "when": {
            "use": ["고객명·ID·금액·코드처럼 한 줄 값을 직접 입력할 때", "정해진 옵션 없이 값을 직접 입력하는 경우", "형식과 길이가 명확한 단일 값을 받는 경우"],
            "avoid": merge_avoid(TF_AVOID, [
                {"text": "길이를 예측하기 어려운 서술형 값", "alt": "Text Area"},
                {"text": "정해진 값이 아니라 키워드로 대상을 검색하는 경우", "alt": "Search Field"},
                {"text": "비밀번호처럼 노출되면 안 되는 값", "alt": "PasswordField"},
                {"text": "날짜와 기간을 받는 경우", "alt": "Date Field · Date Picker"},
                {"text": "고르는 항목", "alt": "Select (기본 문구에 항목 이름)"},
            ]),
        },
        "rules": [
            *TF_RULES("text"), *FR_RULES(),
            item(IN, "입력", "Text Field · Text Area", "두 컴포넌트의 구분"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            item(IN, "입력", "Text Field · Text Area", "입력값 삭제"),
            item(IN, "입력", "Text Field · Text Area", "자동 채움"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": [TF_DO_LAYOUT, TF_DO_PW, TF_DO_CONTENT, *FR_DO] + ux_only(pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때", "고르는 항목은 셀렉트")),
        "dont": [TF_DONT_LAYOUT, TF_DONT_PW, TF_DONT_CONTENT, *FR_DONT] + ux_only(pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만", "고르라는 뜻과")),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "text-area": lambda: {
        "sources": [IN, FV],
        "lead": f"{text(IN, '입력')} 길이를 예측하기 어려운 서술형 값에 씁니다.",
        "when": {
            "use": ["메모·사유·상세 설명처럼 여러 줄을 입력할 때", "정해진 옵션 없이 값을 직접 입력하는 경우", "길이를 예측하기 어려운 서술형 값을 받는 경우"],
            "avoid": merge_avoid(TF_AVOID, [{"text": "형식과 길이가 명확한 단일 값", "alt": "Text Field"}, {"text": "정해진 값이 아니라 키워드로 대상을 검색하는 경우", "alt": "Search Field"}]),
        },
        "rules": [
            *TF_RULES("area"), *FR_RULES(),
            item(IN, "입력", "Text Field · Text Area", "두 컴포넌트의 구분"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            item(IN, "입력", "Text Field · Text Area", "입력값 삭제"),
            item(IN, "입력", "Text Field · Text Area", "자동 채움"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": [TF_DO_CONTENT, *FR_DO] + ux_only(pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때")),
        "dont": [TF_DONT_CONTENT, *FR_DONT] + ux_only(pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만", "고르라는 뜻과")),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "password-field": lambda: {
        "sources": [IN, FV],
        "lead": "비밀번호와 같이 노출되면 안 되는 값을 직접 입력합니다. 입력값은 마스킹 처리합니다.",
        "when": {
            "use": ["비밀번호처럼 입력값을 가려야 할 때", "비밀번호처럼 화면에 노출되면 안 되는 값을 입력하는 경우"],
            "avoid": merge_avoid(TF_AVOID, [{"text": "노출되어도 되는 형식 · 길이가 명확한 단일 값", "alt": "Text Field"}]),
        },
        "rules": [
            *TF_RULES("password"), *FR_RULES(),
            item(IN, "입력", "Text Field · Text Area", "마스킹"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": [TF_DO_PW, TF_DO_LAYOUT, TF_DO_CONTENT, *FR_DO] + ux_only(pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때")),
        "dont": [TF_DONT_PW, TF_DONT_LAYOUT, TF_DONT_CONTENT, *FR_DONT] + ux_only(pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만")),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "helper-text": lambda: {
        "sources": [FV, IN],
        "lead": "필드 아래에서 입력할 값의 조건을 미리 알리거나, 값을 받아야 알 수 있는 오류를 알립니다. 오류는 수정할 자리인 필드에 남깁니다.",
        "when": {
            "use": ["필드의 허용 형식·단위·예시·제약 사항을 안내할 때", "입력값 오류의 원인과 해결 방법을 필드 바로 아래에 안내할 때", "무엇을 얼마나 넣을 수 있는지 미리 알리는 경우", "형식 · 자릿수 · 서버 확인(중복 등)처럼 값을 받아야 알 수 있는 오류나 결과를 알리는 경우"],
            "avoid": [
                {"text": "필수 항목이 비어 실행할 수 없는 경우", "alt": "실행 버튼 잠금 · 빈 필수 항목에는 인라인 메시지를 달지 않음"},
                {"text": "저장 완료처럼 검증과 무관한 결과", "alt": "토스트"},
                {"text": "진행 차단 · 데이터 손실처럼 중대한 상황", "alt": "확인·경고 다이얼로그"},
            ],
        },
        "rules": [
            G("문구 · Helper Text", "허용 형식·단위·예시·제약 사항을 안내합니다.", "Text Fields › Content › Writing"),
            G("문구 · Error Message", "오류의 원인과 해결 방법을 함께 안내합니다.", "Text Fields › Content › Writing"),
            G("State Priority · Helper Text", "Error이면 오류 색(color/fg/danger/strong)과 아이콘으로 오류 메시지를 표시합니다. ReadOnly·Disabled이면 Error여도 기본 스타일을 유지합니다.", "Field Rules › States › State Priority"),
            G("오류를 표시하지 않는 상태", "Disabled·ReadOnly에서는 오류를 표시하지 않습니다. 모든 입력 컴포넌트에 적용합니다.", "Field Rules › States › Availability"),
            G("Validation · None", "오류가 없는 기본 상태는 유효성 검사 전후에 동일하게 유지되며, 통과 여부를 따로 표시하지 않습니다.", "Text Fields › States › Validation"),
            *FR_ERROR(),
            {"name": "미리 알림", "desc": "무엇을 얼마나 넣을 수 있는지는 미리 알립니다.", "from": "일반 입력 · 입력 조건을 정합니다"},
            *FIELD_ERR(),
            {"name": "메시지 문체", "desc": "원인과 해결을 한 문장에 담습니다. (예. ‘example@sk.com 형식으로 입력해 주세요’, ‘형식이 올바르지 않습니다’는 쓰지 않음)", "from": "폼 유효성 체크 · 메시지는 어떻게 씁니까"},
            {"name": "정상 표시", "desc": "정상 항목에 성공 표시를 두지 않습니다. 중복 확인처럼 서버에 확인해야 아는 항목만 성공 색 문구를 두고, 값이 바뀌면 걷습니다.", "from": "폼 유효성 체크 · 필드 상태"},
            {"name": "낭독기", "desc": "화면 낭독기가 어느 필드의 오류인지 읽을 수 있게 합니다. 색과 테두리만으로는 전달되지 않습니다.", "from": "폼 유효성 체크 · 메시지는 어떻게 씁니까"},
        ],
        "do": [FR_DO[2], FR_DO[0]] + ux_only(pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때", "서버에 확인해야")),
        "dont": [FR_DONT[2], FR_DONT[0]] + ux_only(pick(FV, "dont", "입력하는 중에", "토스트로만", "색과 테두리만", "빈 필수 항목에")),
        "related": [rel(FV, "판정 시점 · 표시 자리 · 메시지 문체")],
    },
    "button": lambda: {
        "sources": ["layout-action", "layout-button-label"],
        "lead": "버튼은 행동의 중요도에 따라 위계(High·Medium·Low·Lowest)를 나눠 조합합니다. 자리는 그 액션이 영향을 미치는 범위가 정하고, 라벨은 표준 명칭으로 쓰며, 아이콘은 눌렀을 때 이어지는 UI를 예고합니다.",
        "when": {
            "use": ["화면에서 작업을 실행하거나 다음 단계로 진행할 때", "테이블 등 콘텐츠 영역 안에서 보조 행동을 실행할 때", "추가 · 삭제 · 저장 · 조회 등 실행 버튼을 둘 때", "모듈 · 페이지의 값을 확정하는 CTA를 둘 때", "버튼 라벨 문구와 아이콘을 정할 때"],
            "avoid": [
                {"text": "보고 있는 목록의 범위만 바꾸는 경우 (조회 버튼을 두지 않음)", "alt": "패싯 칩"},
                {"text": "다른 업무 화면으로 이동만 하는 경우", "alt": "텍스트 링크"},
                {"text": "설정을 켜거나 끌 때", "alt": "Switch"},
                {"text": "필터 조건을 선택하거나 해제할 때", "alt": "Filter Chip"},
            ],
        },
        "rules": [
            {"name": "위계 매핑", "desc": "High는 Primary(채움, Square), Medium은 Secondary(진한 아웃라인, Square), Low는 Base(연한 아웃라인, Square·Round·Icon·IconPlain), Lowest는 Text(텍스트형)를 씁니다.", "from": "Guideline · Variants › Hierarchy"},
            {"name": "Accent", "desc": "한 화면에 같은 타입의 버튼이 여러 개일 때 그중 특정 행동을 강조해야 하는 경우에만 씁니다.", "from": "Guideline · Variants › Style"},
            {"name": "Danger", "desc": "삭제·해지·초기화·탈퇴처럼 되돌릴 수 없는 파괴적 행동에만 씁니다. 제출처럼 되돌릴 수 없어도 기존 상태를 무효화하지 않는 행동은 Secondary·Base를 씁니다.", "from": "Guideline · Variants › Style · Do & Don't"},
            {"name": "크기", "desc": "Xlarge(48)는 Modal·Dialog 아래쪽·폼 제출 같은 최종 행동, Large(40)는 일반 폼 영역의 기본, Medium(36)은 보조 입력 영역·정보 밀도가 높은 화면, Small(28)은 테이블·필터·Toolbar에 씁니다. Text는 Fixed(20) 하나입니다.", "from": "Guideline · Variants › Size"},
            {"name": "최소 너비", "desc": "Label이 있는 버튼의 최소 너비는 72px이며 Label은 최소 2글자로 씁니다. Label이 4글자 이상이면 길이에 맞춰 늘어나며(Hug), Label을 줄여 72px에 맞추지 않습니다. 아이콘만 있는 버튼에는 적용하지 않습니다.", "from": "Guideline · Layout › Width"},
            {"name": "고정 너비", "desc": "Side Panel 하단처럼 정해진 영역은 전체 폭에 맞춰 같은 너비의 버튼으로 구성합니다(Fixed).", "from": "Guideline · Layout › Width"},
            {"name": "버튼 간격", "desc": "같은 타입의 버튼끼리는 8px(예: Dialog 아래쪽 취소·저장), 다른 타입의 버튼끼리는 16px(예: 조회 영역의 초기화(Text)·조회(Primary)) 띄웁니다.", "from": "Guideline · Layout › Spacing"},
            {"name": "위계 조합", "desc": "강조하려는 행동이 보이도록 서로 다른 위계를 조합합니다: Medium–High · Low–High · Low–Medium · Lowest–High.", "from": "Guideline · Layout › Combination"},
            {"name": "정렬", "desc": "수평 배치가 기본이며 위계가 낮은 버튼은 왼쪽, 높은 버튼은 오른쪽에 둡니다. 영역이 모자라 수직으로 둘 때는 낮은 버튼을 아래쪽, 높은 버튼을 위쪽에 둡니다.", "from": "Guideline · Layout › Alignment"},
            {"name": "아이콘 사용", "desc": "Label만 쓰는 것이 기본이며, 아이콘은 의미를 보조해야 하는 버튼에만 씁니다. 오른쪽 방향(→) 뒤 아이콘은 Node UI에서만 씁니다.", "from": "Guideline · Anatomy · Do & Don't"},
            item("layout-action", "인터랙션 배치", None, "가장 가까운 지점에 둡니다", "자리"),
            item("layout-action", "인터랙션 배치", None, "한 액션은 한 지점에만 둡니다", "중복 금지"),
            item("layout-action", "인터랙션 배치", None, "주요 액션은 영역당 하나입니다", "Primary는 하나"),
            item("layout-action", "인터랙션 배치", None, "위험한 실행은 확인을 거칩니다", "위험한 실행"),
            {"name": "모듈 CTA", "desc": "값을 고치는 모듈은 " + item("layout-action", "CTA — 모듈 CTA · 페이지 CTA", "모듈 CTA", "값을 고치는 모듈")["desc"], "from": "버튼 구조 및 동작 · 모듈 CTA"},
            {"name": "페이지 CTA", "desc": "여러 모듈에 걸치는 확정은 페이지 CTA 하나로 두고, 남는 모듈 CTA는 Secondary로 낮춥니다. 입력 · 편집 화면은 스크롤과 무관하게 보이는 하단 고정 바에 둡니다.", "from": "버튼 구조 및 동작 · 페이지 CTA"},
            dict(LOCK),
            item(IN, "입력 유효성", "실행 버튼을 잠급니다", "잠그지 않는 경우"),
            item("layout-action", "버튼 그룹", None, "비필수는 묶습니다", "버튼 그룹"),
            {"name": "표준 명칭", "desc": "라벨은 표준 명칭에서 고릅니다: " + " · ".join(r[0] for r in LABELS()) + ". 쓰지 않는 말: " + " · ".join(f"{r[2]}(→ {r[0]})" for r in LABELS() if r[2] and r[2] not in {x[0] for x in LABELS()}) + ". 상세보기(페이지 · 팝업으로 상세 조회)와 더보기(지금 페이지에서 이어서 노출)는 서로 바꿔 쓰지 않습니다.", "from": "버튼 라벨 · 아이콘 · 라벨"},
            item("layout-button-label", "라벨", None, "‘~하기’ 형태는 권장하지 않습니다", "라벨"),
            item("layout-button-label", "라벨", None, "대상을 앞에 붙일 수 있습니다", "대상 붙이기"),
            item("layout-button-label", "아이콘", None, "이어지는 UI를 예고합니다", "아이콘의 뜻"),
            item("layout-button-label", "아이콘", None, "아이콘은 라벨 왼쪽이 원칙", "아이콘 자리"),
            item("layout-button-label", "아이콘", None, "나가는 방향은 오른쪽입니다", "→ · ↗ 자리"),
            {"name": "수정 · 변경", "desc": "원래 값이 틀렸거나 최신이 아니면 ‘수정’, 원래 값도 유효한데 다른 값을 고르면 ‘변경’을 씁니다. 주소는 통상 쓰는 말에 맞춰 ‘변경’을 우선합니다.", "from": "버튼 라벨 · 아이콘 · 라벨"},
            item("layout-button-label", "라벨", "노드 CTA 라벨", "진행은 ‘다음’입니다", "노드 진행 라벨"),
            item("layout-button-label", "라벨", "노드 CTA 라벨", "‘완료’는 마지막 노드에만 씁니다", "‘완료’ 자리"),
            item("layout-button-label", "라벨", "노드 CTA 라벨", "실행은 행위를 라벨로 씁니다", "노드 실행 라벨"),
            item("layout-button-label", "라벨", "노드 CTA 라벨", "실행 라벨에도 다음 노드가 있으면 `→`를 붙입니다", "→ · ✓"),
            item("layout-button-label", "라벨", "노드 CTA 라벨", "한 번 눌러 실행하고 이어서 진행합니다", "실행 뒤 진행"),
            {"name": "특수 기능 라벨", "desc": "업무 페이지 전체에 영향을 주는 라벨은 정해진 목록(상담 종료)만 쓰고, 화면마다 새로 만들지 않습니다. ‘완료’는 지금 노드 흐름을, ‘상담 종료’는 상담 전체와 업무 페이지를 끝냅니다.", "from": "버튼 라벨 · 아이콘 · 노드 CTA 특수 기능 라벨"},
            item("layout-button-label", "아이콘", None, "노드 하단 CTA는 모두 오른쪽입니다", "노드 CTA 아이콘 자리"),
            {"name": "기능 아이콘", "desc": "저장 · 다운로드 · 업로드 · 인쇄 · 검색 · 버튼 그룹은 이어지는 UI가 아니라 기능 자체를 나타내는 아이콘으로, 라벨 왼쪽에 붙입니다. 버튼 그룹 아이콘은 그룹을 여는 버튼에만 붙입니다.", "from": "버튼 라벨 · 아이콘 · 기능 아이콘"},
            {"name": "아이콘만 쓰는 버튼", "desc": "더보기 · 추가 · 초기화 · 닫기 · 다운로드 · 업로드 여섯만 라벨 없이 아이콘만 쓰며, 대체 텍스트를 둡니다.", "from": "버튼 라벨 · 아이콘 · 아이콘만 쓰는 경우"},
            {"name": "노드 하단 버튼", "desc": "노드 UI 하단 버튼은 주 동작 하나와 보조 하나까지, 주 동작은 오른쪽에 둡니다. 하나면 전체 너비로 둡니다.", "from": "버튼 구조 및 동작 · 노드 UI 개수 · 위계"},
        ],
        "do": ["주요 행동은 높은 위계, 나머지 행동은 낮은 위계의 버튼으로 조합합니다. (주요 행동이 가장 먼저 보입니다.)", "삭제처럼 되돌릴 수 없는 파괴적 행동에는 Danger(아웃라인) 버튼을 사용합니다. (위험을 알리되 과도하게 강조하지 않습니다.)", "아이콘은 의미를 보조해야 하는 버튼에만 사용합니다. (Label만 사용하는 것이 기본입니다.)"] + pick("layout-action", "do", "Primary로 강조", "비활성으로 둡니다", "파괴적 액션") + pick("layout-button-label", "do", "표준 명칭으로", "`→`", "브라우저 팝업", "버튼 그룹 아이콘", "노드 하단 CTA", "대체 텍스트"),
        "dont": ["우선순위가 다른 행동에 같은 위계의 버튼을 사용하지 않습니다. (주요 행동을 구분하기 어렵습니다.)", "파괴적 행동이 아닌 버튼에 적색을 사용하지 않습니다. (제출처럼 기존 상태를 무효화하지 않는 행동은 Secondary·Base를 사용합니다.)", "모든 버튼에 아이콘을 넣지 않습니다. (시각적 노이즈가 늘어 사용성이 떨어집니다.)", "Node UI가 아닌 화면에 오른쪽 방향(→) 뒤 아이콘을 사용하지 않습니다. (이어지는 단계가 없어 화면 이동으로 오해할 수 있습니다.)"] + pick("layout-action", "dont", "중복해", "파괴적 액션", "셋 이상") + pick("layout-button-label", "dont", "사용하지 않는 말", "‘수정’과 ‘변경’", "‘완료’를 넣거나", "특수 기능 라벨", "장식용", "브라우저 팝업 아이콘", "라벨을 생략") + pick(IN, "dont", "패싯 칩에"),
        "related": [rel("layout-action", "버튼 자리 · CTA · 버튼 그룹"), rel("layout-button-label", "표준 라벨 · 아이콘"), rel("resp-dialog", "위험한 실행 전 확인"), rel(FV, "실행 버튼 잠금")],
    },
}


def main():
    for key, make in SPEC.items():
        p = ROOT / f"components/{key}/guide.json"
        g = json.load(open(p))
        old = g.get("policy") or {}
        gaps = {r["name"]: r["gap"] for r in old.get("rules", []) if r.get("gap")}
        new = make()
        srcs = new.pop("sources")
        for r in new["rules"]:
            if r["name"] in gaps:
                r["gap"] = gaps[r["name"]]
        # 컴포넌트 쪽 사정(gap)은 이름이 바뀐 규칙에도 잇는다
        if "입력값 삭제" in gaps:
            pass
        pl = {
            "title": "Policy (사용 정책)",
            "lead": new["lead"],
            "source": {"id": srcs[0], "title": doc(srcs[0])["title"], "release": RELEASE},
            "sources": [{"id": s, "title": doc(s)["title"]} for s in srcs],
            "when": new["when"],
            "rules": new["rules"],
            "do": new["do"],
            "dont": new["dont"],
            "related": new["related"],
        }
        # 바뀐 점
        on = {r["name"]: r["desc"] for r in old.get("rules", [])}
        nn = {r["name"]: r["desc"] for r in pl["rules"]}
        added = [n for n in nn if n not in on]
        removed = [n for n in on if n not in nn]
        changed = [n for n in nn if n in on and on[n] != nn[n]]
        print(f"== {key}: 기준 +{len(added)} −{len(removed)} ~{len(changed)} · Do {len(old.get('do', []))}→{len(pl['do'])} · Don't {len(old.get('dont', []))}→{len(pl['dont'])}")
        for n in added:
            print("   + ", n)
        for n in removed:
            print("   − ", n)
        for n in changed:
            print("   ~ ", n, "|", on[n][:50], "→", nn[n][:50])
        g["policy"] = pl
        p.write_text(json.dumps(g, ensure_ascii=False, indent=2) + "\n")


main()
