# BSS 디자인 포털 POC

덱 「BSS SB Studio 디자인 포맷 정의 및 연계 방식」의 흐름을 실제로 동작하는 서버로 옮긴 POC다.
포털은 기준만 내주고, AI 생성은 BSS SB Studio 안에서 한다. Studio 쪽은 연계를 확인하는 시뮬레이터로 넣었다.

## 실행

```bash
cd poc
npm install
npm start          # http://localhost:8792
```

| 환경 변수 | 없을 때 | 있을 때 |
|---|---|---|
| `FIGMA_TOKEN` | 흉내 모드: 운영 기준의 컴포넌트 주소와 `fixtures/figma/*.json`(Chip 예시)만 변환 | Figma REST API `GET /v1/files/:key/nodes`로 노드를 읽어 변환, 아이콘은 `/v1/images`로 SVG까지 |
| `ANTHROPIC_API_KEY` | 흉내 모드: 챗은 `"<칸>을 <값>으로 바꿔 줘"`, Studio는 낱말 규칙으로 화면 생성 | Claude가 미리보기 챗 수정 · Studio 화면 생성(UI 블록 대응 + 그리기 검수) |
| `PORT` | 8792 | |
| `POC_DATA_DIR` | `poc/data` | 상태 파일(`state.json`) 위치 |

처음 실행하면 저장소의 `components/` · `patterns/` · `icons/` · `tokens/`를 **1.0.0(구축)** 으로 일괄 이관한다.
`npm run reset` 또는 관리자 › 권한 · 초기화로 처음부터 다시 시작한다. 기존 문서 사이트는 `/ds/`에서 그대로 열린다.

```bash
npm test           # 케이스 1~4 · 승격 · 배포 · 롤백 · Studio 연계를 흉내 모드로 끝까지 돌림
```

## BSS 디자인 포털 (문서 사이트, GitHub Pages)

SB Studio 안에서 여는 BSS 디자인 포털과 같은 메뉴 · 틀로 저장소 루트 사이트(`index.html`)를 만들었다.
지금 쓰는 포털 화면은 이쪽이다. 이 폴더의 서버 · `public/` 화면은 서버 API와 Figma · Claude 실연결을 확인하는 개발용이다.

- 메뉴: 조립 구조 · UX 거버넌스(규칙 메타 DB · 레이아웃 규칙 · 빈칸 · UX 패턴 · 검증 규칙) · 블록 · 컴포넌트(아이콘) · 승격 요청 · 변경 감지 · 초안 · 게시
- 기준 데이터: `catalog/catalog.json`(SB Studio 포털 카탈로그 0.5) + 저장소 `components/` · `patterns/` · `icons/`
- 역할: 보기(기획자) · UX 가이드 담당 · 디자인 시스템 담당 · 포털 승인 담당. 요청 단계는 없고, 편집 권한이 있는 담당이 그 자리에서 고친다
  - 디자인 시스템 담당: 앱쉘 · 블록 · 컴포넌트 항목, Figma 노드 다시 읽기 · 새 컴포넌트 읽기
  - UX 가이드 담당: 레이아웃 규칙, 규칙 메타 DB(추가 · 수정 · 삭제, 번호 자동), 컴포넌트 사용 가이드(UX-BUTTON-NN)
  - 고친 내용은 초안이 되고, 포털 승인 담당이 게시하면 버전이 오른다 (MAJOR · MINOR · PATCH), 롤백 가능
- 승격 요청: 구조 확인(UX 가이드 담당) → 모양 확인 · Figma 등록(디자인 시스템 담당) → 최종 승인(포털 승인 담당), 승인되면 tb- → b-, tc- → c-
- 화면 코드 `../site/portal/`(store.js · views.js · portal.css), Figma 변환은 이 폴더 `lib/figma.mjs`를 묶은 `../site/portal-core.js`(`npm run build:site`)
- 상태는 보는 사람 브라우저(localStorage)에만 저장되고, Figma 변환은 흉내 모드다

## 덱 → POC 대응

| 덱 | POC |
|---|---|
| IA: 보기 · UX 편집 · DS 작업 · 관리자 | 위쪽 **역할** 선택으로 메뉴와 권한이 바뀐다. 서버가 요청마다 `X-Role`을 확인한다 (로그인 없음) |
| 케이스 1 토큰 · 컴포넌트 · 공통 블록 | 요청 → 작업 시작 → **피그마 주소 변환** → 형식 · 키 자동 확인 → 미리보기 → 작동 확인 → 배포 요청 → 관리자 배포 |
| 케이스 2 UX 패턴 | 포털 편집 → 저장 시 **규칙 번호 자동 부여**(`UX-BUTTON-05`, 고친 뒤에도 번호 고정) · 중복 확인 → 미리보기 → … |
| 케이스 3 SB 블록 | 소스 직접 편집 → 자동 검사(hex 색 금지 · 토큰 존재 · script 금지) → 미리보기 → … |
| 케이스 4 아이콘 | Studio에서 묶음에 없는 아이콘 → **더미 + 제작 요청 자동 생성** → 변환(이름 · 중복 확인) → 수동 배포 → 더미 자동 교체 · 알림. 더미가 남으면 핸드오프 불가 |
| 승격 | SB 블록이 2개 이상 Storyboard에서 쓰이면 후보 → 1단(SB팀 표준, UX 담당자) → 2단(UI팀 디자인, DS 담당자 피그마 변환) → 공통 블록 |
| 미리보기 챗 | 미리보기 이후에만 열림. 고칠 수 있는 칸만 바꾸고, 토큰 · variants · props · figma key는 막는다. 고칠 때마다 미리보기 번호가 올라간다 |
| 버전 관리 | MAJOR(기존 수정 · 삭제) · MINOR(추가 · 승격) · PATCH(설명) 자동 판정, `1.4.0-preview.3` 표기, 정기 · 수동(사유) 배포, 롤백, 변경 노트 |
| 재검수 | MAJOR 배포 시 그 컴포넌트 · 블록 · 규칙을 쓴 Storyboard를 재검수 대상으로 표시 → 현재 버전으로 다시 검사해야 핸드오프 |
| 연계 · 입출력 | `GET /api/bundle?version=&screenType=` 기준 묶음(운영 서버 버전만) → Studio 생성 → **자동 검사 4종**(속성값 · 요소 ID · 규칙 · 토큰), 미달 시 1회 재생성 → **화면 지시서** JSON(기준 버전 기록) |

## 구조

```
server.mjs          HTTP 서버 · 정적 파일 (/ = public, /ds/ = 저장소 문서 사이트)
lib/routes.mjs      API 경로 표 (서버와 정적 빌드가 같이 씀)
lib/store.mjs       포털 상태
lib/persist.mjs     서버 저장(data/state.json) · 저장소 JSON → 1.0.0 이관
lib/portal.mjs      업무 규칙: 케이스 1~4 · 승격 · 미리보기 · 배포 · 롤백 · 기준 묶음 · Studio
lib/figma.mjs       피그마 주소 해석 · REST API 변환 · 흉내 모드 · 운영 대비 바뀐 점
lib/checks.mjs      변환 자동 확인, SB 소스 검사, 자동 검사 4종
lib/ai.mjs          Claude 연동(미리보기 챗 · 화면 생성, 구조화 출력) / ai.mock.mjs: 흉내 모드
lib/version.mjs     MAJOR.MINOR.PATCH · 미리보기 표기
public/             개발용 화면 (서버 API 확인)
scripts/build-site-core.mjs  문서 사이트 포털이 쓰는 Figma 변환 → ../site/portal-core.js
site-core.entry.mjs  그 번들의 입구
fixtures/figma/     흉내 모드용 Figma API 응답 예시
test/flow.test.mjs  전체 흐름 테스트
```

## 아직 정하지 않은 것 (덱의 "정할 것")

POC에서는 아래처럼 가정했다. 확정되면 바꾼다.

- Studio가 읽는 방식: API(`/api/bundle`)로 가정. 버전 고정 시점은 Storyboard 작업 시작 시
- 이미 만든 Storyboard에 SB 블록 수정을 반영할지: 소스 수정은 MAJOR로 보고 재검수 대상만 표시
- 챗 사용 권한: 그 케이스의 담당자(DS · UX)와 관리자
- 승격 기준: 2개 Storyboard 이상 (`PROMOTE_MIN_USAGE`)
- 토큰은 피그마 변수 API(Enterprise 전용)를 쓰지 않고 저장소 `tokens/variables.json`을 읽는다
- 공통 블록 · 레이아웃 규칙 형식: 공통 블록은 컴포넌트 형식 + 소스, 레이아웃 규칙은 패턴 규칙(유형 · 간격)으로 둠
