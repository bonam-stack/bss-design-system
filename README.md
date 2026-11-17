# BSS Design System

Figma 기준 파일: `9AioWOXVOVm5C7kdSxSEEP` ((공유용) BSS_DS_Library_Component v2.0, 2026-11-13부터. 이전: `WcoI745J38TaON7iCKcutW` Components Library v0.5)

## 문서 사이트

디자인 시스템은 JSON으로 만들고, 사이트(`index.html`, `site/`)가 그 JSON을 읽어 페이지를 만든다.

- 공유 링크: https://claude.ai/artifact/PU6iNoAkpJhThz5v2qvbKg
- 로컬: `python3 -m http.server 8791 --directory design-system` 후 http://localhost:8791 (JSON을 fetch하므로 더블클릭으로는 안 열림)
- IA: UX 거버넌스(맨 앞) · 시작하기 · Foundations(색상 · 타이포그래피 · 간격 · 아이콘 · 토큰 구조) · Components(개요 · 진행 현황) · Blocks(앱쉘 · 공통 블록 `b-` · SB 블록 `tb-`) · Patterns · Updates. SEED의 Develop · AI & Tools는 메뉴로 두지 않는다. 컴포넌트 코드 페이지(`#dev-c-<key>`)와 토큰 레퍼런스(`#dev-tokens`)는 메뉴 없이 링크로만 연다 (Figma 읽기 · SB Studio 연계는 포털 뒤에서 도는 기능)
- 컴포넌트는 디자인 문서 `#c-<key>`(대표 이미지 → Anatomy → Properties → Guidelines → Specification → Usage)와 개발 문서 `#dev-c-<key>`(미리보기 · 코드 → 사용하기 → Props → Examples → Figma · 변형 · 토큰)로 나뉜다. Specification(색 매트릭스 · 크기 표)은 `component.json`의 토큰 경로에서 만든다 (`site/spec.js`)
- 공통: 검색(Ctrl/Cmd+K), 테마 전환, 스크롤을 따라가는 목차, 이전 · 다음 문서, 바닥글
- 페이지: `#overview`, `#foundations`, `#components`, `#updates`, `#<카탈로그 코드>` (예: `#c-button`, `#b-search-general`; 예전 `#button`도 열림), 관리 `#pub` · `#promo` · `#chg`

컴포넌트 추가: Figma 링크로 `figma-to-json` 스킬 실행 → `components/<key>/component.json` + `components/index.json` 갱신 → 사이트에 자동으로 나타남.
공유 링크 갱신: `python3 scripts/build_publish_page.py`로 `dist/index.html`을 만든 뒤 같은 링크로 다시 올린다 (새 JSON·SVG 파일도 함께).

## BSS 디자인 포털

SB Studio 안의 메뉴로 들어가는 디자인 포털이다. 흐름은 덱 「BSS SB Studio 디자인 포맷 정의 및 연계 방식」을 따른다.
누구에게나 같은 문서(UX 거버넌스 · 시작하기 · Foundations · Components · Blocks · Patterns · Updates)와 **내 요청**이 보이고,
역할(SB Studio 계정에서 받음, POC는 오른쪽 위에서 고름)에 따라 작업 메뉴와 문서 안 편집 칸이 켜진다.

| 역할 | 작업 메뉴 | 하는 일 |
|---|---|---|
| 보기 | 내 요청 | 아이콘 · 컴포넌트 · 공통 블록 · 토큰 요청, 진행 상태 (아이콘은 AI 더미로 기획 계속, 완성 시 교체 · 알림) |
| UX 담당자 | UX 편집: 기준 편집 · SB library 편집 · 내 변경 · 승격 심사 | UX 패턴 · 레이아웃 규칙 · 앱쉘 · 사용 가이드 · 규칙(번호 자동) · SB 블록 소스, SB팀 표준 심사 |
| DS 담당자 | DS 작업: 디자인 요청 · 소스 변환 · 내 변경 · 승격 심사 | 토큰 · 컴포넌트 · 공통 블록 (Figma 주소 변환, 코드 · 토큰 편집), 요청 단계 처리, UI팀 디자인 심사 |
| 관리자 | 관리자: 운영 서버 배포 · 재검수 대상 SB · 권한 확인 · 승격 심사 | 배포 요청 처리(정기 · 수동, 수동은 사유 필수) · 롤백 · 재검수 대상 확인 |

변경 흐름: 담당자가 고치면 초안 → 미리보기 확인 → **배포 요청** → 관리자 배포 → 운영 버전 (다음 버전은 `1.4.0-preview.3`처럼 표시).
코드 편집은 미리보기 · 자동 검사(script 금지 · 색은 토큰 · 없는 토큰 이름), 토큰 편집은 베이스=값 · 역할 · 컴포넌트=가리키는 토큰, 게시되면 토큰 소스(:root CSS) · 미리보기에 반영.

기준 카탈로그는 `catalog/catalog.json`(앱쉘 s- · 레이아웃 l- · 빈칸 · 공통 블록 b- · SB 블록 tb- · 컴포넌트 c- · 규칙 R-),
컴포넌트 상세는 `components/`에서 온다. 화면 코드는 `site/portal/`. POC라 초안 · 배포 · 요청 상태는 브라우저에만 저장된다.

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
