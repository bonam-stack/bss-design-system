# BSS Design System

Figma 기준 파일: `WcoI745J38TaON7iCKcutW` ((공유용) Components Library v0.5)

## 문서 사이트

디자인 시스템은 JSON으로 만들고, 사이트(`index.html`, `site/`)가 그 JSON을 읽어 페이지를 만든다.

- 공유 링크: https://claude.ai/artifact/PU6iNoAkpJhThz5v2qvbKg
- 로컬: `python3 -m http.server 8791 --directory design-system` 후 http://localhost:8791 (JSON을 fetch하므로 더블클릭으로는 안 열림)
- 페이지: `#overview`, `#components`, `#blocks`, `#patterns`, `#rules`, `#icons`, `#<카탈로그 코드>` (예: `#c-button`, `#b-search-general`; 예전 `#button`도 열림), 관리 `#pub` · `#promo` · `#chg`

컴포넌트 추가: Figma 링크로 `figma-to-json` 스킬 실행 → `components/<key>/component.json` + `components/index.json` 갱신 → 사이트에 자동으로 나타남.
공유 링크 갱신: `python3 scripts/build_publish_page.py`로 `dist/index.html`을 만든 뒤 같은 링크로 다시 올린다 (새 JSON·SVG 파일도 함께).

## BSS 디자인 포털

SB Studio 안의 메뉴로 들어가는 디자인 포털이다. 누구에게나 같은 문서 사이트(시작하기 · Foundations · Components · Blocks · Patterns · UX 거버넌스)가 보이고,
오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.

- 디자인 시스템 담당: 컴포넌트 · 블록 · 앱쉘 페이지의 설명 · 변형 · 상태 편집, Figma에서 다시 읽기, 컴포넌트 목록에서 컴포넌트 추가
- UX 가이드 담당: 레이아웃 규칙 편집, 규칙 페이지에서 규칙 추가 · 수정 · 삭제(번호 자동), 컴포넌트 사용 가이드 편집(UX-BUTTON-NN)
- 포털 승인 담당: 초안 게시 · 반려 · 롤백
- 담당 역할에서만 보이는 "관리" 메뉴: 초안 · 게시, 승격 요청(구조 확인 → 모양 확인 → 최종 승인), 변경 감지

기준 카탈로그는 `catalog/catalog.json`(SB Studio 포털 카탈로그 0.5: 앱쉘 s- · 레이아웃 l- · 빈칸 · 블록 b- · 컴포넌트 c- · 규칙 R-),
컴포넌트 상세(미리보기 · 사용 가이드)는 `components/`에서 온다. 화면 코드는 `site/portal/`. POC라 초안 · 게시 상태는 브라우저에만 저장된다.

## 컴포넌트

```
components/index.json            사이트에 보일 컴포넌트 key 목록
components/<key>/component.json  Figma에서 읽은 노드 ID·키·속성·변형·연결 토큰 (figma-to-json 스킬이 생성)
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
