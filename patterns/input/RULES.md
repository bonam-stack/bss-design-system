# Input 패턴 규칙

> 출처: Figma [NextBSS Design Pattern Guide › Patterns/Input](https://www.figma.com/design/IMecsrrW0ILbT1jezfYQBJ/?node-id=1-4284) (노드 `1:4284`, 2026-10-28 읽음)
> 사이트: `design-system/index.html#pattern-input` · 데이터: [pattern.json](pattern.json)

Input 패턴은 사용자가 값을 입력하거나 조회 조건을 설정하는 입력 영역의 구성 방식이다.
입력 목적과 화면 특성에 따라 필드의 배치, 조합, 관계를 아래 세 유형 중 하나로 구성한다.

## 1. 유형 고르기

| 상황 | 유형 |
|---|---|
| 조회 조건이나 필터처럼 각 입력 항목의 의미를 이름으로 알려야 한다 | **Labeled Input** |
| 하나의 값을 여러 칸으로 나눠 받는다 (전화번호, 생년월일, 사업자번호 등) | **Segmented Input** |
| 앞의 선택에 따라 뒤 입력의 항목이나 범위가 바뀐다 | **Dependent Input** |

## 2. 구성 요소

| 번호 | 요소 | 역할 |
|---|---|---|
| 1 | Label (선택) | 각 조회 조건의 이름을 표시한다 |
| 2 | Input | 하나의 조건을 입력하거나 선택하는 기본 입력 요소 (Text Field, Single Select, Date Field) |
| 3 | Input Group | 하나의 값을 받기 위해 여러 입력 요소를 묶은 영역 |
| 4 | Parent Input | 종속 관계의 기준 입력. 이 값이 하위 입력의 항목·상태·선택 범위를 정한다 |
| 5 | Divider | 상위와 하위 입력을 시각적으로 나누는 세로 구분선 |
| 6 | Dependent Input | 상위 선택에 따라 항목·상태·입력 범위가 바뀌는 입력. 유효한 선택지만 보여 준다 |

## 3. 간격 (Spec)

| 위치 | 간격 | 유형 |
|---|---|---|
| Label → 그 Input | **12px** | Labeled |
| 조건(Label+Input) → 다음 조건 | **32px** | Labeled |
| Input → 다음 Input (서로 다른 값) | **16px** | Segmented |
| Input Group 안의 칸 사이 | **8px** | Segmented, Dependent |
| Parent Input → Dependent Input | **28px**, 가운데에 Divider | Dependent |

- Divider는 폭을 차지하지 않는 1px 선이다. 28px 구간의 가운데에 둔다(양쪽 14px).
- Divider 높이 22px, 색 `#DCE0E5`. Input과 세로 가운데 정렬.
- 줄 안의 모든 요소는 세로 가운데 정렬한다.

## 4. 크기

| 크기 | 높이 | 쓰는 곳 (가이드 예시) |
|---|---|---|
| Large | 38px | Labeled, Segmented |
| Medium | 32px | Dependent (검색 영역) |

- 가이드 예시에서는 한 줄 안의 입력이 모두 같은 크기다.
- 가이드 예시의 폭: Single Select 200 / 120 / 80px, Date Field(범위) 123px, Text Field 200 / 120 / 80px. 폭을 정하는 규칙은 가이드에 없다.
- Dependent Input 줄의 끝에는 조회 버튼(Secondary, Grey Ghost, Medium)을 8px 간격으로 둔다.

## 5. 입력 요소 모양 (가이드 예시 값)

| 항목 | 값 |
|---|---|
| 테두리 | 1px `#C4C9CF`, 둥글기 6px |
| 안쪽 여백 | 좌우 14px (Date Field 오른쪽 12px) |
| 글자 | Pretendard 14/20, 자간 -0.2px, 값 `#1A1A1A`, placeholder `#B3B9C0` |
| Label | Pretendard Medium 14/20, `#1A1A1A` |
| 날짜 숫자 | 자간 -0.6px, 고정폭 숫자(`tnum`) |
| 아이콘 | 16px. Select 오른쪽 아래 화살표, Date Field 오른쪽 달력. 글자와 10px 간격 |

## 6. 화면을 만들 때 확인

- [ ] 입력 영역마다 유형(Labeled / Segmented / Dependent)을 정했다
- [ ] 간격이 3장 표와 같다 (12 / 32 / 16 / 8 / 28)
- [ ] 입력 높이가 Large 38 또는 Medium 32다
- [ ] Segmented는 칸들이 하나의 값임을 알 수 있게 Input Group(8px)으로 묶었다
- [ ] Dependent는 상위 값을 바꾸면 하위 입력의 선택지가 바뀌고, Divider로 나눴다
- [ ] 규칙에 없는 경우(세로 배치, 여러 줄 등)는 임의로 정하지 않고 확인을 요청한다

## 가이드에 없는 것

- 조건이 한 줄을 넘칠 때의 줄바꿈 규칙, 세로 배치, 오류·도움말 표시 위치, 입력 폭을 정하는 규칙은 이 가이드에 없다.
