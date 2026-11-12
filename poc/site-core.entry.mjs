// 문서 사이트(site/)가 쓰는 포털 코어. scripts/build-site-core.mjs가 ../site/portal-core.js로 묶는다.
// 서버와 같은 업무 코드(lib/*)를 브라우저 안에서 돌린다: 저장은 localStorage, Figma · AI는 흉내 모드.
export { request } from "./public/transport.local.js";
export { tokensCss, iconSvg } from "./lib/routes.mjs";
