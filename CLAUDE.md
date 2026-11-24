# 작업 기준

- **포털은 v2만 고친다.** 작업 폴더는 `v2/`다 (`v2/src`, `v2/catalog`, `v2/components`, `v2/guides`, `v2/tokens`, `v2/icons`, `v2/patterns`, `v2/scripts`).
- 저장소 루트의 `src/` · `catalog/` · `components/` · `guides/` · `tokens/` · `icons/` · `patterns/`는 **v1이며 고치지 않는다** (배포 주소 `<사이트>/`에 그대로 남겨 둔다).
- v2 주소: `<사이트>/v2/` · 로컬 `npm run dev:v2` · 빌드 `npm run build`(v1 · v2 함께, 결과 `dist/` · `dist/v2/`).
- v2 메뉴: 거버넌스(UI 규칙 · 디자인 검수 기준 · Figma 작성 기준만) · Foundations · Components · Blocks · Workboard.
- v2에는 UX 가이드라인(원칙 · 화면 구조 · 레이아웃 · 조립 구조 · 화면 가이드)과 UX 쪽 거버넌스(규칙 · 검증 규칙 · 슬롯 · 연동 규격 · 용어사전 · 운영 절차)가 없다. 그 주소는 홈으로 보내고 링크는 글자만 남긴다. 데이터는 `v2/catalog` · `v2/guides`에 그대로 있다. 컴포넌트 · 블록(모듈) 가이드 문서만 페이지가 있다.
- 화면 문구는 한국어, 규칙 ID 같은 판정 코드는 화면에 보이지 않게 데이터에만 둔다.
- v2 컴포넌트 코드(`v2/src/ds`)는 색 · 치수 · 글자를 `tok('토큰-이름')`, 상태가 있는 속성은 `tokState('토큰-앞부분', 상태)`(상태 토큰이 없으면 -default)로만 쓴다. 헥스 색 · px 값을 적지 않는다. 토큰 값은 DS 전달본 `v2/tokens/ds/tokens.css`가 정하며 전달본은 고치지 않는다.
