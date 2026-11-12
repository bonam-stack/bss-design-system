// BSS 디자인 포털 POC 서버.
//   node server.mjs            → http://localhost:8792
// 환경 변수: PORT, FIGMA_TOKEN(피그마 변환), ANTHROPIC_API_KEY(미리보기 챗 · Studio 생성), POC_DATA_DIR
// 역할은 요청 헤더 X-Role(viewer | ux | ds | admin)로 받는다. POC라 로그인은 없다.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { POC_DIR, REPO_DIR } from "./lib/persist.mjs";
import { handle, tokensCss, iconSvg, normalizeRole, HttpError } from "./lib/routes.mjs";
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
    if (raw.length > 2_000_000) throw new HttpError(413, "요청이 너무 큽니다");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "JSON 형식이 아닙니다");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const role = normalizeRole(req.headers["x-role"]);
  try {
    if (url.pathname.startsWith("/api/")) {
      const body = req.method === "POST" ? await readBody(req) : {};
      const out = await handle(req.method, url.pathname, role, body, url.searchParams);
      if (out) return send(res, 200, out.result);
      if (url.pathname === "/api/tokens.css") return send(res, 200, tokensCss(), TYPES[".css"]);
      if (url.pathname.startsWith("/api/icons/")) {
        const svg = iconSvg(decodeURIComponent(url.pathname.slice(11)));
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
