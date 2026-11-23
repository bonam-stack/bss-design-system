# 작업 기준

- **포털은 v2만 고친다.** 작업 폴더는 `v2/`다 (`v2/src`, `v2/catalog`, `v2/components`, `v2/guides`, `v2/tokens`, `v2/icons`, `v2/patterns`, `v2/scripts`).
- 저장소 루트의 `src/` · `catalog/` · `components/` · `guides/` · `tokens/` · `icons/` · `patterns/`는 **v1이며 고치지 않는다** (배포 주소 `<사이트>/`에 그대로 남겨 둔다).
- v2 주소: `<사이트>/v2/` · 로컬 `npm run dev:v2` · 빌드 `npm run build`(v1 · v2 함께, 결과 `dist/` · `dist/v2/`).
- v2에는 거버넌스 메뉴가 없다(규칙 · 검증 규칙 · 슬롯 · 연동 규격 · 용어사전 등의 데이터는 `v2/catalog`에 남아 있다).
- 화면 문구는 한국어, 규칙 ID 같은 판정 코드는 화면에 보이지 않게 데이터에만 둔다.
