// 정적 빌드: 포털 POC를 GitHub Pages에서 서버 없이 도는 HTML 한 장(../portal/index.html)으로 만든다.
//   npm run build:pages
// 서버와 같은 업무 코드(lib/*)를 묶되, 저장은 localStorage, Figma · AI는 흉내 모드로 바꾼다.
// 기준 데이터는 빌드할 때 저장소 JSON에서 1.0.0 시드로 만들어 넣는다.
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { seed, POC_DIR, REPO_DIR } from "../lib/persist.mjs";

const OUT_DIR = path.join(REPO_DIR, "portal");
const OUT = path.join(OUT_DIR, "index.html");

const swaps = {
  "./transport.js": "public/transport.local.js",
  "./persist.mjs": "lib/persist.browser.mjs",
  "./ai.mjs": "lib/ai.browser.mjs",
  "./fixtures.mjs": "lib/fixtures.browser.mjs",
};

const browserSwap = {
  name: "browser-swap",
  setup(b) {
    b.onResolve({ filter: /^\.\/(transport|persist|ai|fixtures)\.m?js$/ }, (a) => {
      const to = swaps[a.path];
      // 교체본이 자기 자신을 부를 때(예: ai.browser → ai.mock)는 건드리지 않는다
      return to ? { path: path.join(POC_DIR, to) } : undefined;
    });
    b.onResolve({ filter: /^virtual:seed$/ }, () => ({ path: "seed", namespace: "virtual" }));
    b.onLoad({ filter: /.*/, namespace: "virtual" }, () => ({ contents: JSON.stringify(seed()), loader: "json" }));
  },
};

const res = await build({
  entryPoints: [path.join(POC_DIR, "public/app.js")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  minify: true,
  write: false,
  legalComments: "none",
  plugins: [browserSwap],
  define: { "process.env": "{}" }, // 브라우저에는 키가 없다 → Figma 흉내 모드
  logLevel: "warning",
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const css = fs.readFileSync(path.join(POC_DIR, "public/app.css"), "utf8").replace("/ds/site/fonts/", "../site/fonts/");
const shell = fs.readFileSync(path.join(POC_DIR, "public/index.html"), "utf8");
const html = shell
  .replace('<link rel="stylesheet" href="app.css" />', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', () => `<script type="module">\n${js}\n</script>`)
  .replace('<a class="brand" href="#home">', '<a class="brand" href="#home" title="디자인 포털 POC 홈">')
  .replace("<!-- PAGES:docs-link -->", '<a class="docs-link" href="../">컴포넌트 문서</a>');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`wrote ${path.relative(REPO_DIR, OUT)} (${(html.length / 1024).toFixed(0)} KB)`);
