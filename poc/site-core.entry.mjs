// 문서 사이트(BSS 디자인 포털)가 쓰는 Figma 변환 코어. scripts/build-site-core.mjs가 ../site/portal-core.js로 묶는다.
// 서버와 같은 변환 코드(lib/figma.mjs)를 브라우저에서 돌린다. FIGMA_TOKEN이 없으므로 흉내 모드.
export { convertFromUrl, diffComponent, parseFigmaUrl } from "./lib/figma.mjs";
export { checkComponentFormat } from "./lib/checks.mjs";
