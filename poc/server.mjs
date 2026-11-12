// BSS 디자인 포털 POC 서버.
//   node server.mjs            → http://localhost:8792
// 환경 변수: PORT, FIGMA_TOKEN(피그마 변환), ANTHROPIC_API_KEY(미리보기 챗 · Studio 생성), POC_DATA_DIR
// 역할은 요청 헤더 X-Role(viewer | ux | ds | admin)로 받는다. POC라 로그인은 없다.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { POC_DIR, REPO_DIR, reset, getState } from "./lib/store.mjs";
import * as portal from "./lib/portal.mjs";
import { figmaMode } from "./lib/figma.mjs";
import { aiMode } from "./lib/ai.mjs";

const PORT = Number(process.env.PORT || 8792);
const PUBLIC = path.join(POC_DIR, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".md": "text/markdown; charset=utf-8" };

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function serveFile(res, root, rel) {
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(root + path.sep) && p !== root) return send(res, 403, { error: "forbidden" });
  let file = p;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) return send(res, 404, { error: "not found" });
  send(res, 200, fs.readFileSync(file), TYPES[path.extname(file)] || "application/octet-stream");
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2_000_000) throw new portal.HttpError(413, "요청이 너무 큽니다");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new portal.HttpError(400, "JSON 형식이 아닙니다");
  }
}

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const role = portal.ROLES[req.headers["x-role"]] ? req.headers["x-role"] : "viewer";
  try {
    if (url.pathname.startsWith("/api/")) {
      for (const [m, re, fn] of routes) {
        const hit = url.pathname.match(re);
        if (!hit || m !== req.method) continue;
        const body = req.method === "POST" ? await readBody(req) : {};
        return send(res, 200, await fn(role, body, hit[1], url.searchParams));
      }
      if (url.pathname === "/api/tokens.css") {
        const { tokens } = getState();
        const css = Object.entries(tokens)
          .filter(([, t]) => t.value != null && /^[#\w(.,% -]+$/.test(String(t.value)))
          .map(([n, t]) => `${n}:${t.value};`)
          .join("");
        return send(res, 200, `:root{${css}}`, TYPES[".css"]);
      }
      if (url.pathname.startsWith("/api/icons/")) {
        const svg = portal.iconSvg(decodeURIComponent(url.pathname.slice(11)));
        return svg ? send(res, 200, svg, TYPES[".svg"]) : send(res, 404, { error: "no svg" });
      }
      return send(res, 404, { error: "없는 API입니다" });
    }
    // 기존 문서 사이트(저장소 루트)는 /ds/ 아래로 그대로 연다
    if (url.pathname.startsWith("/ds/")) return serveFile(res, REPO_DIR, decodeURIComponent(url.pathname.slice(4)) || "index.html");
    if (url.pathname === "/ds") {
      res.writeHead(302, { Location: "/ds/" });
      return res.end();
    }
    return serveFile(res, PUBLIC, decodeURIComponent(url.pathname.slice(1)) || "index.html");
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    return send(res, status, { error: e.message || String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`BSS 디자인 포털 POC: http://localhost:${PORT}  (피그마 ${figmaMode()} · AI ${aiMode()})`);
});
