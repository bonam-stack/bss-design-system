// 정적 빌드(GitHub Pages): 서버와 같은 업무 코드(lib/routes.mjs)를 브라우저 안에서 그대로 부른다.
// 상태는 이 브라우저의 localStorage에만 저장된다. 빌드: npm run build:pages
import { handle, tokensCss, iconSvg } from "../lib/routes.mjs";

export const runtime = "browser";

export async function request(path, body, role) {
  const u = new URL(path, "http://local");
  try {
    const out = await handle(body === undefined ? "GET" : "POST", u.pathname, role, body ?? {}, u.searchParams);
    if (!out) throw new Error("없는 API입니다");
    return JSON.parse(JSON.stringify(out.result)); // 서버처럼 복사본을 돌려준다
  } catch (e) {
    throw new Error(e.message || String(e));
  }
}

const dataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg || "")}`;
// 기존 아이콘은 같은 사이트의 SVG 파일을, 새로 배포한 아이콘은 상태에 든 SVG를 쓴다
export const iconUrl = (i) => (i.file ? `../icons/${i.file}` : dataUrl(iconSvg(i.name)));
export const tokensStyle = () => `<style>${tokensCss()}</style>`;
export const docsUrl = (key) => `../${key ? `#${key}` : ""}`;
