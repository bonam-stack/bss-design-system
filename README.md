# BSS Design System

Figma 기준 파일: `9AioWOXVOVm5C7kdSxSEEP` ((공유용) BSS_DS_Library_Component v2.0, 2026-11-13부터. 이전: `WcoI745J38TaON7iCKcutW` Components Library v0.5)

## 문서 사이트 (React)

디자인 시스템은 JSON으로 만들고, React 사이트(`src/`)가 그 JSON으로 페이지와 컴포넌트를 만든다. Vite + React 18 + TypeScript.

- 사이트: https://bonam-stack.github.io/bss-design-system/ (`main`에 올리면 GitHub Actions가 빌드해서 배포, 1~2분)
- 로컬: `npm install` 후 `npm run dev` (http://localhost:5173). 배포본 확인은 `npm run build && npm run preview`
- 페이지: `#overview`, `#components`, `#blocks`, `#patterns`, `#rules`, `#icons`, `#<카탈로그 코드>` (예: `#c-button`, `#b-search-general`; 예전 `#button`도 열림), 관리 `#pub` · `#promo` · `#chg`

컴포넌트 추가: Figma 링크로 `figma-to-json` 스킬 실행 → `components/<key>/component.json` + `components/index.json` 갱신 → `npm run gen`(dev · build가 먼저 부름)이 React 컴포넌트를 만들고 사이트에 자동으로 나타남.

```
src/ds/                       BSS 디자인 시스템 React 컴포넌트
  components/<Name>.tsx       생성: component.json → 타입 있는 React 컴포넌트 (scripts/gen-react.mjs, 직접 고치지 않음)
  index.ts                    생성: 모든 컴포넌트 · Props 타입 export
  core/tree.ts                Figma 레이어 → 그릴 노드 트리 (오토 레이아웃 · 제약 · 토큰 var(--…) · 아이콘 바꿔 끼우기)
  core/react.tsx              노드 트리 → React 요소, createFigmaComponent (hover · pressed · 포커스 · 선택 토글)
  core/html.ts                노드 트리 → HTML · CSS 코드 (사이트의 코드 탭)
  core/variants.ts            변형 고르기 · 속성 분석
src/site/                     문서 사이트 · 디자인 포털 화면
  App.tsx · nav.tsx · ui.tsx  틀 · 메뉴 · 공통 조각
  pages/                      컴포넌트 · 아이콘 · 패턴 · 포털 페이지
  portal/store.ts             포털 상태 (초안 · 게시 · 롤백 · 승격, localStorage)
  portal/portal-core.js       생성: Figma 변환 코어 (poc에서 npm run build:site)
scripts/gen-react.mjs         component.json → src/ds/components
.github/workflows/pages.yml   main → 빌드 → GitHub Pages
```

### React 컴포넌트 쓰기

Figma 속성이 그대로 React 속성이 된다. 변형 속성은 선택지 문자열, 불리언 · 텍스트 속성은 `boolean` · `string`, Figma SLOT은 `children`.

```tsx
import { Checkbox, Button, TextField, RadioGroup, Radio } from './ds';

<Checkbox label="약관 동의" />                                     // 누르면 checked ↔ unchecked, hover · 포커스 링은 알아서
<Checkbox selection={agree} onChange={(v) => setAgree(v)} />       // 값을 주면 제어 컴포넌트
<Button type="square" variants="primary" size="medium" label="조회" onClick={search} />
<TextField size="medium" state="entered" invalid="true" overrides={{ 'message#2359:5': '필수 항목입니다' }} />
<RadioGroup size="medium"><Radio label="개인" /><Radio label="법인" /></RadioGroup>
```

- `state`를 주지 않으면(또는 `default`) 포인터가 hover · pressed를, 키보드 포커스가 포커스 링(showFocus)을 그린다. `hover` · `disabled` 등을 주면 그 상태로 고정된다.
- `overrides`는 안쪽 인스턴스 속성(HelperText의 message 등)을 Figma 속성 이름으로 바꾼다. 이름은 사이트 컴포넌트 페이지의 코드 탭(React)에 나온다.
- 색 · 치수는 `var(--토큰, Figma 값)`으로 그려져, 토큰 CSS를 올리면 그 값을 따른다.

## BSS 디자인 포털

SB Studio 안의 메뉴로 들어가는 디자인 포털이다. 누구에게나 같은 문서 사이트(시작하기 · Foundations · Components · Blocks · Patterns · UX 거버넌스)가 보이고,
오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.

- 디자인 시스템 담당: 컴포넌트 · 블록 · 앱쉘 페이지의 설명 · 변형 · 상태 편집, Figma에서 다시 읽기, 컴포넌트 목록에서 컴포넌트 추가
- UX 가이드 담당: 레이아웃 규칙 편집, 규칙 페이지에서 규칙 추가 · 수정 · 삭제(번호 자동), 컴포넌트 사용 가이드 편집(UX-BUTTON-NN)
- 포털 승인 담당: 초안 게시 · 반려 · 롤백
- 담당 역할에서만 보이는 "관리" 메뉴: 초안 · 게시, 승격 요청(구조 확인 → 모양 확인 → 최종 승인), 변경 감지

기준 카탈로그는 `catalog/catalog.json`(SB Studio 포털 카탈로그 0.5: 앱쉘 s- · 레이아웃 l- · 빈칸 · 블록 b- · 컴포넌트 c- · 규칙 R-),
컴포넌트 상세(미리보기 · 사용 가이드)는 `components/`에서 온다. 화면 코드는 `src/site/`. POC라 초안 · 게시 상태는 브라우저에만 저장된다.

## 컴포넌트

```
components/index.json            사이트 · React 컴포넌트로 만들 key 목록
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
