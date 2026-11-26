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


def radio():
    return {
        "sources": [IN],
        "lead": f"{text(IN, '단일 선택').splitlines()[0]} {text(IN, '단일 선택', 'Radio')}",
        "when": {"use": ["정해진 옵션 중에서 하나를 고르는 경우", "모든 옵션을 노출해도 될 만큼 옵션이 적은 경우"], "avoid": SELECT_AVOID["single"]},
        "rules": [SORT(), COMMON_REQ("icon"), *VALID(True)],
        "do": pick(IN, "do", "단일 선택과 다중 선택"),
        "dont": pick(IN, "dont", "옵션이 많은", "Switch", "다중 선택 컴포넌트"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    }


SPEC = {
    "checkbox": lambda: {
        "sources": [IN],
        "lead": f"{text(IN, '다중 선택').splitlines()[0]} {text(IN, '다중 선택', 'Checkbox')}",
        "when": {"use": ["정해진 옵션 중에서 여럿을 고르는 경우", "모든 옵션을 노출한 상태에서 선택하여 조합한 결과를 사용하는 경우"], "avoid": SELECT_AVOID["multi"]},
        "rules": [item(IN, "다중 선택", "Checkbox", "그룹 상태"), SORT(), COMMON_REQ("icon"), *VALID(True)],
        "do": pick(IN, "do", "단일 선택과 다중 선택"),
        "dont": pick(IN, "dont", "옵션이 많은", "다중 선택 컴포넌트"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "radio": radio,
    "radio-group": radio,
    "text-field": lambda: {
        "sources": [IN, FV],
        "lead": f"{text(IN, '입력')} 형식과 길이가 명확한 단일 값에 씁니다.",
        "when": {
            "use": ["정해진 옵션 없이 값을 직접 입력하는 경우", "형식과 길이가 명확한 단일 값을 받는 경우"],
            "avoid": [
                {"text": "길이를 예측하기 어려운 서술형 값", "alt": "Text Area"},
                {"text": "정해진 값이 아니라 키워드로 대상을 검색하는 경우", "alt": "Search Field"},
                {"text": "비밀번호처럼 노출되면 안 되는 값", "alt": "PasswordField"},
                {"text": "날짜와 기간을 받는 경우", "alt": "Date Field · Date Picker"},
                {"text": "고르는 항목", "alt": "Select (기본 문구에 항목 이름)"},
            ],
        },
        "rules": [
            item(IN, "입력", "Text Field · Text Area", "두 컴포넌트의 구분"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            item(IN, "입력", "Text Field · Text Area", "입력값 삭제"),
            item(IN, "입력", "Text Field · Text Area", "자동 채움"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때", "고르는 항목은 셀렉트"),
        "dont": pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만", "고르라는 뜻과"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "text-area": lambda: {
        "sources": [IN, FV],
        "lead": f"{text(IN, '입력')} 길이를 예측하기 어려운 서술형 값에 씁니다.",
        "when": {
            "use": ["정해진 옵션 없이 값을 직접 입력하는 경우", "길이를 예측하기 어려운 서술형 값을 받는 경우"],
            "avoid": [{"text": "형식과 길이가 명확한 단일 값", "alt": "Text Field"}, {"text": "정해진 값이 아니라 키워드로 대상을 검색하는 경우", "alt": "Search Field"}],
        },
        "rules": [
            item(IN, "입력", "Text Field · Text Area", "두 컴포넌트의 구분"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            item(IN, "입력", "Text Field · Text Area", "입력값 삭제"),
            item(IN, "입력", "Text Field · Text Area", "자동 채움"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때"),
        "dont": pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만", "고르라는 뜻과"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "password-field": lambda: {
        "sources": [IN, FV],
        "lead": "비밀번호와 같이 노출되면 안 되는 값을 직접 입력합니다. 입력값은 마스킹 처리합니다.",
        "when": {"use": ["비밀번호처럼 화면에 노출되면 안 되는 값을 입력하는 경우"], "avoid": [{"text": "노출되어도 되는 형식 · 길이가 명확한 단일 값", "alt": "Text Field"}]},
        "rules": [
            item(IN, "입력", "Text Field · Text Area", "마스킹"),
            item(IN, "입력", "Text Field · Text Area", "플레이스홀더"),
            COMMON_REQ(), *VALID(), *FIELD_ERR(),
        ],
        "do": pick(IN, "do", "플레이스홀더") + pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때"),
        "dont": pick(FV, "dont", "입력하는 중에", "플레이스홀더로", "색과 테두리만"),
        "related": [rel(FV, "입력값 검증과 오류 표시"), rel("form-big", "필수 미입력을 알리는 방식")],
    },
    "helper-text": lambda: {
        "sources": [FV, IN],
        "lead": "필드 아래에서 입력할 값의 조건을 미리 알리거나, 값을 받아야 알 수 있는 오류를 알립니다. 오류는 수정할 자리인 필드에 남깁니다.",
        "when": {
            "use": ["무엇을 얼마나 넣을 수 있는지 미리 알리는 경우", "형식 · 자릿수 · 서버 확인(중복 등)처럼 값을 받아야 알 수 있는 오류나 결과를 알리는 경우"],
            "avoid": [
                {"text": "필수 항목이 비어 실행할 수 없는 경우", "alt": "실행 버튼 잠금 · 빈 필수 항목에는 인라인 메시지를 달지 않음"},
                {"text": "저장 완료처럼 검증과 무관한 결과", "alt": "토스트"},
                {"text": "진행 차단 · 데이터 손실처럼 중대한 상황", "alt": "확인·경고 다이얼로그"},
            ],
        },
        "rules": [
            {"name": "미리 알림", "desc": "무엇을 얼마나 넣을 수 있는지는 미리 알립니다.", "from": "일반 입력 · 입력 조건을 정합니다"},
            *FIELD_ERR(),
            {"name": "메시지 문체", "desc": "원인과 해결을 한 문장에 담습니다. (예. ‘example@sk.com 형식으로 입력해 주세요’, ‘형식이 올바르지 않습니다’는 쓰지 않음)", "from": "폼 유효성 체크 · 메시지는 어떻게 씁니까"},
            {"name": "정상 표시", "desc": "정상 항목에 성공 표시를 두지 않습니다. 중복 확인처럼 서버에 확인해야 아는 항목만 성공 색 문구를 두고, 값이 바뀌면 걷습니다.", "from": "폼 유효성 체크 · 필드 상태"},
            {"name": "낭독기", "desc": "화면 낭독기가 어느 필드의 오류인지 읽을 수 있게 합니다. 색과 테두리만으로는 전달되지 않습니다.", "from": "폼 유효성 체크 · 메시지는 어떻게 씁니까"},
        ],
        "do": pick(FV, "do", "인라인으로", "원인과 해결", "필드를 벗어날 때", "서버에 확인해야"),
        "dont": pick(FV, "dont", "입력하는 중에", "토스트로만", "색과 테두리만", "빈 필수 항목에"),
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
