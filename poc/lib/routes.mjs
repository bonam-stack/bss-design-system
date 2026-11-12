// API 경로 표 (server.mjs).
import { reset, getState } from "./store.mjs";
import * as portal from "./portal.mjs";
import { figmaMode } from "./figma.mjs";
import { aiMode } from "./ai.mjs";

// [메서드, 경로 패턴, 처리]
const routes = [
  ["GET", /^\/api\/state$/, (role) => ({ ...portal.overview(role), modes: { figma: figmaMode(), ai: aiMode() } })],
  ["POST", /^\/api\/changes$/, (role, b) => portal.createChange(role, b)],
  ["POST", /^\/api\/changes\/([\w-]+)\/start$/, (role, b, id) => portal.startWork(role, id)],
  ["POST", /^\/api\/changes\/([\w-]+)\/reject$/, (role, b, id) => portal.reject(role, id, b.reason)],
  ["POST", /^\/api\/changes\/([\w-]+)\/convert$/, (role, b, id) => portal.convertFigma(role, id, b.url)],
  ["POST", /^\/api\/changes\/([\w-]+)\/edit$/, (role, b, id) => portal.saveEdit(role, id, b)],
  ["POST", /^\/api\/changes\/([\w-]+)\/chat$/, (role, b, id) => portal.chat(role, id, String(b.message || ""))],
  ["POST", /^\/api\/changes\/([\w-]+)\/check$/, (role, b, id) => portal.markChecked(role, id)],
  ["POST", /^\/api\/changes\/([\w-]+)\/request-deploy$/, (role, b, id) => portal.requestDeploy(role, id, b.summary)],
  ["POST", /^\/api\/deploy$/, (role, b) => portal.deploy(role, b)],
  ["POST", /^\/api\/rollback$/, (role, b) => portal.rollback(role, b.reason)],
  ["POST", /^\/api\/sb\/([\w-]+)\/promote$/, (role, b, id) => portal.promoteReview(role, id, b.approve !== false, b.note)],
  // 포털 → Studio: 화면마다 기준 묶음 (운영 서버 버전만)
  ["GET", /^\/api\/bundle$/, (role, b, _id, q) => portal.buildBundle(q.get("version"), q.get("screenType"))],
  // Studio 시뮬레이터
  ["POST", /^\/api\/studio\/storyboards$/, (role, b) => portal.studioGenerate(b)],
  ["POST", /^\/api\/studio\/storyboards\/([\w-]+)\/recheck$/, (role, b, id) => portal.studioRecheck(id)],
  ["POST", /^\/api\/studio\/storyboards\/([\w-]+)\/handoff$/, (role, b, id) => portal.studioHandoff(id)],
  [
    "POST",
    /^\/api\/reset$/,
    (role) => {
      if (role !== "admin") throw new portal.HttpError(403, "관리자만 초기화합니다");
      reset();
      return { ok: true };
    },
  ],
];

export const normalizeRole = (r) => (portal.ROLES[r] ? r : "viewer");

/** 경로가 맞으면 { result }, 없으면 null. 업무 오류는 HttpError로 던진다. */
export async function handle(method, pathname, role, body = {}, query = new URLSearchParams()) {
  for (const [m, re, fn] of routes) {
    const hit = pathname.match(re);
    if (!hit || m !== method) continue;
    return { result: await fn(normalizeRole(role), body, hit[1], query) };
  }
  return null;
}

// 미리보기 iframe에 넣는 토큰 CSS 변수
export function tokensCss() {
  const { tokens } = getState();
  const css = Object.entries(tokens)
    .filter(([, t]) => t.value != null && /^[#\w(.,% -]+$/.test(String(t.value)))
    .map(([n, t]) => `${n}:${t.value};`)
    .join("");
  return `:root{${css}}`;
}

export const iconSvg = portal.iconSvg;
export const HttpError = portal.HttpError;
