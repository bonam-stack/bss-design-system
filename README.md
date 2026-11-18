# BSS Design System

Figma 기준 파일: `9AioWOXVOVm5C7kdSxSEEP` ((공유용) BSS_DS_Library_Component v2.0, 2026-11-13부터. 이전: `WcoI745J38TaON7iCKcutW` Components Library v0.5)

## 문서 사이트 (React)

Vite + React 18 + TypeScript. 컴포넌트는 손으로 짠 React 코드(`src/ds/components/*.tsx`)이고, Figma에서 뽑은 `component.json`은 기준(원본)으로 둔다.

- 사이트: https://bonam-stack.github.io/bss-design-system/ (`main`에 올리면 GitHub Actions가 빌드해서 배포, 1~2분)
- 로컬: `npm install` 후 `npm run dev` (http://localhost:5173). 배포본 확인은 `npm run build && npm run preview`
- 페이지: `#overview`, `#components`, `#blocks`, `#patterns`, `#rules`, `#icons`, `#<카탈로그 코드>` (예: `#c-button`), `#compare-<key>`(모든 변형 Figma 비교), 관리 `#pub` · `#promo` · `#chg`

```
src/ds/                       BSS 디자인 시스템 React 컴포넌트
  components/<Name>.tsx       컴포넌트 하나 = 파일 하나 (구조 · 동작 · 스타일 모두 TSX 안, CSS 파일 없음)
  shared.tsx                  토큰 tok() · 글자 font() · Icon · 상호작용(hover · pressed · 포커스) · FocusRing
  field.tsx                   입력 칸 공통 (TextField · PasswordField · TextArea)
  index.ts                    모든 컴포넌트 · Props 타입 export
  figma/                      Figma 원본 그리기 (component.json 레이어 → 그림). React 컴포넌트와 견주는 기준
src/site/                     문서 사이트 · 디자인 포털 화면
  App.tsx · nav.tsx · ui.tsx  틀 · 메뉴 · 공통 조각
  pages/                      컴포넌트 · Figma 비교 · 아이콘 · 패턴 · 포털 페이지
  live.ts                     포털에서 고친 TSX를 브라우저에서 바로 컴파일 (sucrase)
  portal/store.ts             포털 상태 (초안 · 게시 · 롤백 · 승격, localStorage)
  portal/portal-core.js       생성: Figma 변환 코어 (poc에서 npm run build:site)
.github/workflows/pages.yml   main → 빌드 → GitHub Pages
```

### 역할별 페이지

- 보기(기획자): 문서 페이지. 미리보기는 실제 React 컴포넌트라 누르고 입력해 볼 수 있고, 코드 탭에 사용 예와 컴포넌트 코드가 있다.
- 디자인 시스템 담당 · UX 가이드 담당(에디터 모드, 컴포넌트는 두 담당 모두 모든 글을 고친다): 제목 옆 "✎ 편집"을 누르면 (누르기 전에는 보기 역할과 같은 화면) 페이지의 설명 글(페이지 설명 · 개요 · Anatomy · States · Variants · Spec 설명, 가이드에 없는 상태의 설명, 사용 정책 기준 표 · Do / Don't · 정책 요약)이 모두 입력칸이 된다. 규칙 번호는 데이터에만 두고 화면에는 보이지 않는다. 고친 뒤 아래 띠의 "초안 저장"으로 한 번에 초안이 되고(한 컴포넌트의 글은 "설명 수정" 초안 하나), 포털 승인 담당이 게시하면 모두에게 보인다.
- 디자인 시스템 담당: "AI로 코드 고치기"에서 고칠 점을 말로 요청하면 Claude(Opus 5.5)가 컴포넌트 TSX를 고쳐 미리보기 · 예시에 바로 반영한다. 정적 사이트라 담당이 자기 Anthropic API 키를 넣어 브라우저에서 바로 부르고(키는 그 브라우저에만 저장), 키가 없으면 "A를 B로 바꿔 줘" 글자 바꾸기 흉내 모드로 돈다. "코드 보기 · 직접 고치기"로 코드를 직접 고칠 수도 있다.
  "Figma 원본과 나란히" · `#compare-<key>`로 Figma와 견주고 "초안 저장" → 포털 승인 담당 게시. 속성(Props) 정의가 바뀌면 MAJOR, 아니면 PATCH. 롤백 · 저장소 코드로 되돌리기 가능.
- 게시된 코드는 POC라 브라우저(localStorage)에만 있다. 저장소에 반영하려면 그 코드를 `src/ds/components/<Name>.tsx`에 넣어 커밋한다.

### React 컴포넌트 쓰기

Figma 속성 이름이 그대로 React 속성이다. 실제 `<input>` · `<button>`을 쓰므로 폼 · 키보드 · 보조기기가 그대로 동작한다.

```tsx
import { Checkbox, Button, TextField, PasswordField, TextArea, RadioGroup, Radio } from './ds';

<Checkbox label="약관 동의" name="agree" />                               // 누르면 checked ↔ unchecked
<Checkbox selection={agree} onSelectionChange={setAgree} label="전체 동의" /> // 제어 컴포넌트
<Button type="square" variants="primary" size="medium" label="조회" onClick={search} />
<TextField size="medium" importance="required" label="고객명" showLabel value={name} onChange={setName} invalid={!name} helperText="필수 항목입니다" />
<PasswordField size="medium" placeholder="비밀번호" />
<TextArea maxLength={200} helperText="200자 이내" />
<RadioGroup value={type} onValueChange={setType}><Radio value="p" label="개인" /><Radio value="c" label="법인" /></RadioGroup>
```

- `state`는 문서 예시처럼 모양을 고정할 때만 쓴다. 비워 두면 포인터 · 포커스 · 값에 따라 hover · focus · entered가 저절로 그려진다.
- 색 · 치수는 `var(--토큰, Figma 값)`이라 토큰 CSS 없이도 Figma 값으로 그려지고, 토큰 CSS를 올리면 그 값을 따른다.
- Figma와 일치: 모든 변형을 그려 비교한 결과 Button 172 · Checkbox 24 · Radio 16 · RadioGroup 2 · Divider 4 · HelperText 2 · TextField 108 · TextArea 36개가 픽셀 단위로 같다. PasswordField는 Figma가 `********`를 글자로 그린 자리를 브라우저가 `●`로 가리는 차이만 있다.

### 새 컴포넌트 추가 (Figma 주소 → React 코드)

1. 디자인 시스템 담당이 Components 페이지의 "컴포넌트 추가"에 Figma 컴포넌트 노드 주소만 넣고 읽으면(카탈로그 코드는 같은 이름의 빈 카탈로그 항목에 자동으로 잇고, 없으면 `c-<key>`로 새로 등록), 게시 전 새 컴포넌트 페이지(`#new-<key>`)가 편집 모드로 열린다.
2. 그 페이지의 "React 코드 만들기"에서 첫 코드를 만든다.
   - **Figma 보고 AI로 만들기**: Anthropic API 키가 있으면 Claude가 Figma 속성과 레이어(크기 · 색 · 글자, Figma 토큰이 있을 때)를 보고 `src/ds/components/<Name>.tsx`를 처음부터 쓴다.
   - **속성으로 기본 틀 만들기**: 키 없이도 Figma 속성(변형 · 불리언 · 글)으로 기본 틀을 만든다.
   - 만든 코드는 바로 미리보기에 그려지고, 채팅으로 다듬은 뒤 초안으로 저장한다.
3. 포털 승인 담당이 Figma 초안과 코드 초안을 게시하면 모두에게 컴포넌트 목록 · 페이지 · 미리보기가 나온다.
4. 게시된 페이지에서 `<Name>.tsx`와 `component.json`을 내려받아 저장소에 커밋하면 저장소 컴포넌트가 된다.

컴포넌트 제목(카탈로그 이름)과 설명은 ✎ 편집에서 제목 칸을 바로 고쳐 초안으로 저장한다. 코드 이름(`<Name>.tsx` · `export function <Name>`)과 Figma 이름은 그대로다.

Figma 개인 토큰(figd_…)과 Anthropic API 키는 담당의 브라우저(localStorage)에만 저장되고, 각각 api.figma.com · api.anthropic.com으로만 보낸다. 토큰이 없으면 Figma는 흉내 모드(운영 기준 · `poc/fixtures/figma` 예시 노드)로 읽는다.

## UX 패턴 가이드 반영 (NEXT BSS UX Pattern Guide)

caumuse에 게시된 UX 패턴 가이드(https://mocks.caumuse.kr/release/20261106/)의 문서를 그대로 붙이지 않고, 포털 구조로 나눠 넣었다.

| 가이드 | 포털 | 형식 |
|---|---|---|
| UX 원칙 (3) | 시작하기 | 문서 페이지 |
| 파운데이션 (14) | Foundations (구조 · 화면 유형 · 사용 환경). 디자인 에셋(컬러 · 타이포그래피 · 디자인 토큰 · 아이콘)은 `tokens/variables.json` · `icons/`에서 그린다 | 문서 페이지 |
| 패턴 (31) | Patterns (화면 편성 · 조회·목록 · 편집 · 응답·예외 · 노드 진행 · 외부 연동 · 표준 기능) | 문서 페이지 |
| 모듈 (18) | Blocks (일반형 화면 · 노드 · 상세·처리 모듈) | 문서 페이지 + 관련 블록 페이지에 연결 |
| 컴포넌트 (13) | Components (컴포넌트 가이드) | 문서 페이지 + 관련 컴포넌트 페이지에 연결 |
| Do / Don't (878) | UX 거버넌스 › 규칙 (권장 451 · 금지 427, 데이터 안 번호 `GRID-BOARD-01` …, 화면에는 안 보임) | 컴포넌트 · 블록에 한꺼번에 걸지 않음 (규칙은 컴포넌트마다 각자의 사용 정책으로) |
| 용어사전 (222) | UX 거버넌스 › 용어사전 | 검색되는 표 |
| SB 작성 가이드 | UX 거버넌스 | 문서 페이지 |

문서 페이지(`#g-<문서 id>`)는 Overview(언제 쓰나 · 다른 것을 쓰나) → 구성요소(번호) · 동작 · 규격 표 → Do / Don't → 함께 볼 문서 순이다. 컴포넌트 · 블록 페이지에는 참고할 가이드 문서 링크가 붙는다.
화면 예시 목업과 "실제 예시" 절은 빼고 글 · 표 · 규칙만 옮겼다. 버전 이력은 추출본에 내용이 없어 넣지 않았다.

```
guides/ux-pattern/<id>.md          원문 (split_ux_guide.py가 전체 마크다운에서 나눔)
guides/ux-pattern/index.json       원문 문서 목록
guides/ux-pattern/docs/<id>.json   포털 구조로 나눈 문서 (structure_ux_guide.py)
guides/ux-pattern/structure.json   배치(place) · 대상 코드(targets) · 권장 · 금지 규칙
guides/ux-pattern/glossary.json    용어사전
scripts/split_ux_guide.py          가이드 전체 마크다운 → 원문 파일
scripts/structure_ux_guide.py      원문 → 포털 구조. 문서별 대상 코드(TARGETS)와 구성요소 이름 보정(FORCE_NAMES)이 여기 있다
```

새 릴리스 반영: `python3 scripts/split_ux_guide.py <전체 마크다운>` → `python3 scripts/structure_ux_guide.py` → 커밋.

컴포넌트 사용 가이드(`components/<key>/guide.json`의 Policy · 기준 · Do/Don't)는 새 UX 패턴 가이드 문서에서 다시 만든다: `python3 scripts/sync_component_policy.py`. 어느 문서의 어느 절 · 항목을 쓰는지는 스크립트의 `SPEC`에 컴포넌트별로 적혀 있고, 바뀐 기준을 출력한다. 컴포넌트 쪽 부족분(gap)은 기존 파일에서 이어받는다.

POC라 이력은 남기지 않는다. 저장소의 기준 데이터(카탈로그 · 컴포넌트 · UX 패턴 가이드 · 패턴 · 토큰 · React 컴포넌트 코드)가 바뀌어 새로 배포되면, 브라우저에 남은 이전 초안 · 게시 기록을 열 때 자동으로 지우고 새 기준으로 다시 시작한다(`vite.config.ts`의 데이터 지문). 역할 · API 키 · Figma 토큰은 남는다.

디자인 토큰은 Figma › 변수에서 컬렉션별로 내보낸 W3C 토큰 JSON을 `tokens/figma/<primitive|semantic|component>.tokens.json`에 두고 `python3 scripts/import_tokens.py`로 `tokens/variables.json`을 만든다. 사이트는 이 토큰을 CSS 변수로 깔고(`src/ds/tokens.ts`), 컴포넌트는 `tok()`로 그 변수를 읽는다.

## BSS 디자인 포털

SB Studio 안의 메뉴로 들어가는 디자인 포털이다. 누구에게나 같은 문서 사이트(시작하기 · Foundations · Components · Blocks · Patterns · UX 거버넌스)가 보이고,
오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.

- 디자인 시스템 담당: 컴포넌트 · 블록 · 앱쉘 페이지의 설명 · 변형 · 상태 편집, Figma에서 다시 읽기, 컴포넌트 목록에서 컴포넌트 추가
- UX 가이드 담당: 레이아웃 규칙 편집, 규칙 페이지에서 규칙 추가 · 수정 · 삭제(번호 자동), 컴포넌트 사용 가이드 편집(UX-BUTTON-NN)
- 포털 승인 담당: 초안 게시 · 반려 · 롤백
- 담당 역할에서만 보이는 "관리" 메뉴: 초안 · 게시, 승격 요청(구조 확인 → 모양 확인 → 최종 승인), 변경 감지

기준 카탈로그는 `catalog/catalog.json`(SB Studio 포털 카탈로그 0.5: 앱쉘 s- · 레이아웃 l- · 슬롯 · 블록 b- · 컴포넌트 c- · 규칙 R-),
컴포넌트 상세(미리보기 · 사용 가이드)는 `components/`에서 온다. 화면 코드는 `src/site/`. POC라 초안 · 게시 상태는 브라우저에만 저장된다.

## 컴포넌트

```
components/index.json            사이트에 보일 컴포넌트 key 목록 (React 컴포넌트는 src/ds/components/<Name>.tsx)
components/<key>/component.json  Figma에서 읽은 노드 ID·키·속성·변형·레이어·연결 토큰 (figma-to-json 스킬이 생성)
components/<key>/guide.json      사용 가이드 (components/guides.json에 있는 것만)
```

## 아이콘

Figma `❖ Icon Resource`(노드 2409:27235)의 마스터 컴포넌트 73개 (Line 43 · Filled 14 · Colored 16).

```
icons/svg/<style>/<name>.svg   아이콘 원본. Figma exportAsync로 내보낸 16×16 SVG
icons/icons.json               목록: 이름, 스타일, 그룹, 파일, Figma 노드 ID·컴포넌트 키
icons/template.html            목록 페이지 템플릿
icons/index.html               생성: 목록 페이지 (SVG를 넣은 단일 파일이라 더블클릭으로 열림)
scripts/build_icons.py         icons.json + svg → index.html
```

- Line·Filled는 `fill="currentColor"`라 글자색(`color`)을 따라갑니다. Colored는 원본 색을 유지합니다.
- `Loading`은 어두운 배경 위 흰색 아이콘이라 재색상하지 않습니다 (`onDark`).
- 크기는 SVG의 `width`/`height`만 바꾸면 됩니다 (viewBox 0 0 16 16 고정).

아이콘을 추가·수정하면 `icons/svg/`와 `icons/icons.json`을 고친 뒤 `python3 scripts/build_icons.py`를 실행합니다
(`--check`는 검사만). 단색 아이콘에 고정 색이 남아 있거나, 그라디언트 id가 다른 아이콘과 겹치거나, 파일이 없으면 아무것도 만들지 않습니다.
