// 포털 코어 번들: 문서 사이트에 붙는 포털 기능(요청 · 변환 · 미리보기 챗 · 배포 · 버전)을
// 서버 없이 돌리는 ES 모듈 하나(../site/portal-core.js)로 만든다.
//   npm run build:site
// 기준 데이터는 빌드할 때 저장소 JSON에서 1.0.0 시드로 만들어 넣는다.
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { seed, POC_DIR, REPO_DIR } from "../lib/persist.mjs";

const OUT = path.join(REPO_DIR, "site", "portal-core.js");

// SB library는 SB Studio가 채운다. 이 메뉴만 따로 볼 때 흐름이 보이도록 예시 블록을 넣는다.
const SAMPLE_SB = [
  {
    name: "결과 목록",
    purpose: "조회 결과를 표로 보여 줌. 공통 블록에 맞는 것이 없어 만든 블록",
    usage: ["고객 조회", "주문 조회", "청구 내역"],
    source:
      '<div style="border:1px solid var(--color-gray-200);border-radius:8px;padding:12px"><div style="font-weight:700;margin-bottom:8px">결과 목록</div><div style="color:var(--color-gray-500)">고객명 · 가입일 · 상태</div></div>',
  },
  {
    name: "기간 선택 바",
    purpose: "조회 기간 빠른 선택(오늘 · 1주 · 1개월)과 날짜 입력",
    usage: ["청구 내역", "사용량 조회"],
    source:
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="padding:4px 10px;border:1px solid var(--color-gray-200);border-radius:6px">오늘</span><span style="padding:4px 10px;border:1px solid var(--color-gray-200);border-radius:6px">1주</span><span style="padding:4px 10px;border:1px solid var(--color-gray-200);border-radius:6px">1개월</span><span style="color:var(--color-gray-500)">2026.11.01 ~ 2026.11.12</span></div>',
  },
  {
    name: "고객 요약 카드",
    purpose: "상담 화면 상단의 고객 기본 정보",
    usage: ["상담 메인"],
    source:
      '<div style="border:1px solid var(--color-gray-200);border-radius:8px;padding:12px"><b>홍길동</b> <span style="color:var(--color-gray-500)">010-****-1234 · 가입 3년</span></div>',
  },
];

function siteSeed() {
  const s = seed();
  const rel = s.release.snapshots[s.release.current];
  SAMPLE_SB.forEach((b, i) => {
    const id = `SB-${String(i + 1).padStart(4, "0")}`;
    rel.sbBlocks[id] = { id, name: b.name, purpose: b.purpose, source: b.source, createdBy: "SB Studio (예시)", createdAt: s.seededAt, usage: b.usage, promotion: null };
  });
  s.seq.sb = SAMPLE_SB.length + 1;
  return s;
}

const swaps = {
  "./persist.mjs": "lib/persist.browser.mjs",
  "./ai.mjs": "lib/ai.browser.mjs",
  "./fixtures.mjs": "lib/fixtures.browser.mjs",
};

const res = await build({
  entryPoints: [path.join(POC_DIR, "site-core.entry.mjs")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  minify: true,
  write: false,
  legalComments: "none",
  define: { "process.env": "{}" }, // 브라우저에는 키가 없다 → Figma 흉내 모드
  plugins: [
    {
      name: "browser-swap",
      setup(b) {
        b.onResolve({ filter: /^\.\/(persist|ai|fixtures)\.mjs$/ }, (a) => (swaps[a.path] ? { path: path.join(POC_DIR, swaps[a.path]) } : undefined));
        b.onResolve({ filter: /^virtual:seed$/ }, () => ({ path: "seed", namespace: "virtual" }));
        b.onLoad({ filter: /.*/, namespace: "virtual" }, () => ({ contents: JSON.stringify(siteSeed()), loader: "json" }));
      },
    },
  ],
  logLevel: "warning",
});
const banner = "// 생성 파일: poc/scripts/build-site-core.mjs (npm run build:site). 직접 고치지 않는다.\n";
fs.writeFileSync(OUT, banner + res.outputFiles[0].text);
console.log(`wrote ${path.relative(REPO_DIR, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
