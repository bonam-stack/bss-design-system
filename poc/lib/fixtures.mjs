// 흉내 모드용 Figma API 응답 예시 (poc/fixtures/figma/*.json). 브라우저 버전은 fixtures.browser.mjs.
import fs from "node:fs";
import path from "node:path";
import { POC_DIR } from "./persist.mjs";

let cache = null;
export function fixtures() {
  if (cache) return cache;
  const dir = path.join(POC_DIR, "fixtures", "figma");
  cache = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) : [];
  return cache;
}
