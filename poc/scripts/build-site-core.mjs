// 포털 코어 번들: BSS 디자인 포털(문서 사이트)이 쓰는 Figma 변환 코드를 ES 모듈 하나(../site/portal-core.js)로 묶는다.
//   npm run build:site
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { POC_DIR, REPO_DIR } from "../lib/persist.mjs";

const OUT = path.join(REPO_DIR, "site", "portal-core.js");

const swaps = { "./fixtures.mjs": "lib/fixtures.browser.mjs" };

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
        b.onResolve({ filter: /^\.\/fixtures\.mjs$/ }, (a) => ({ path: path.join(POC_DIR, swaps[a.path]) }));
      },
    },
  ],
  logLevel: "warning",
});
const banner = "// 생성 파일: poc/scripts/build-site-core.mjs (npm run build:site). 직접 고치지 않는다.\n";
fs.writeFileSync(OUT, banner + res.outputFiles[0].text);
console.log(`wrote ${path.relative(REPO_DIR, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
