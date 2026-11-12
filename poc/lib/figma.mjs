// 피그마 주소 → 소스 변환.
// FIGMA_TOKEN이 있으면 Figma REST API(GET /v1/files/:key/nodes)로 읽고, 없으면 흉내(mock) 모드로
// 운영 기준 · poc/fixtures/figma/*.json에서 같은 노드를 찾는다. 같은 입력이면 항상 같은 결과가 나온다.
import { fixtures } from "./fixtures.mjs";

const TOKEN = process.env.FIGMA_TOKEN || "";
export const figmaMode = () => (TOKEN ? "live" : "mock");

export function parseFigmaUrl(url) {
  const m = String(url).match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)(?:\/branch\/([A-Za-z0-9]+))?[^?]*(?:\?(.*))?/);
  if (!m) throw new Error("피그마 주소 형식이 아닙니다 (figma.com/design/<파일>?node-id=<노드>)");
  const fileKey = m[2] || m[1];
  const params = new URLSearchParams(m[3] || "");
  const node = params.get("node-id");
  if (!node) throw new Error("주소에 node-id가 없습니다. 피그마에서 컴포넌트를 선택하고 링크를 복사해 주세요");
  return { fileKey, nodeId: node.replace(/-/g, ":") };
}

const slug = (s) =>
  String(s)
    .replace(/^❖\s*/, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const cleanProp = (n) => n.replace(/#[\d:]+$/, "");

// Figma nodes API 응답 하나(nodes[id]) → 포털 컴포넌트 형식
export function convertNode(fileKey, nodeId, entry) {
  const doc = entry.document;
  if (!doc) throw new Error(`노드 ${nodeId}를 읽지 못했습니다`);
  if (doc.type === "COMPONENT" && /^icon\//i.test(doc.name)) {
    // 아이콘처럼 단일 컴포넌트
    const meta = entry.components?.[nodeId] || {};
    const parts = doc.name.split("/");
    return {
      kind: "icon",
      name: parts[parts.length - 1].replace(/\s+/g, ""),
      style: (parts[1] || "line").toLowerCase(),
      figmaName: doc.name,
      nodeId,
      key: meta.key || null,
    };
  }
  if (doc.type !== "COMPONENT_SET" && doc.type !== "COMPONENT") throw new Error(`컴포넌트가 아닌 노드입니다 (${doc.type})`);
  const defs = doc.componentPropertyDefinitions || {};
  const props = Object.entries(defs).map(([name, d]) => {
    const type = { BOOLEAN: "boolean", TEXT: "text", VARIANT: "variant", INSTANCE_SWAP: "instance" }[d.type] || d.type;
    return { name: cleanProp(name), type, default: d.defaultValue, ...(d.variantOptions ? { options: d.variantOptions } : {}) };
  });
  const variants = (doc.children || [])
    .filter((c) => c.type === "COMPONENT")
    .map((c) => ({
      nodeId: c.id,
      key: entry.components?.[c.id]?.key || null,
      props: Object.fromEntries(
        c.name.split(",").map((kv) => kv.split("=").map((s) => s.trim())).filter((kv) => kv.length === 2)
      ),
    }));
  const setMeta = entry.componentSets?.[nodeId] || entry.components?.[nodeId] || {};
  return {
    kind: "component",
    key: slug(doc.name),
    name: doc.name.replace(/^❖\s*/, ""),
    description: setMeta.description || doc.description || "",
    figma: {
      fileKey,
      nodeId,
      componentKey: setMeta.key || null,
      url: `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(/:/g, "-")}`,
    },
    props,
    variants,
    tokens: [],
  };
}

async function fetchLive(fileKey, nodeId) {
  const u = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const r = await fetch(u, { headers: { "X-Figma-Token": TOKEN } });
  if (!r.ok) throw new Error(`Figma API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const entry = j.nodes?.[nodeId];
  if (!entry) throw new Error(`파일 ${fileKey}에 노드 ${nodeId}가 없습니다`);
  return entry;
}

async function fetchIconSvg(fileKey, nodeId) {
  if (!TOKEN) return null;
  const r = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=svg`, {
    headers: { "X-Figma-Token": TOKEN },
  });
  if (!r.ok) return null;
  const url = (await r.json()).images?.[nodeId];
  if (!url) return null;
  const s = await fetch(url);
  return s.ok ? await s.text() : null;
}

function loadFixture(fileKey, nodeId) {
  const hit = fixtures().find((j) => j.nodeId === nodeId && (!j.fileKey || j.fileKey === fileKey));
  return hit ? hit.entry : null;
}

// 같은 입력이면 같은 key (흉내 모드). FNV-1a 두 번으로 40자리를 만든다.
function hash(s) {
  let out = "";
  for (const seed of [0x811c9dc5, 0x01000193, 0x5bd1e995, 0x1b873593, 0x85ebca6b]) {
    let h = seed >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    out += h.toString(16).padStart(8, "0");
  }
  return out;
}

const mockKey = (s) => "mock" + hash(s).slice(0, 36);
const placeholderSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.5"/></svg>';

/**
 * 변환. expect = "component" | "icon"; released = 운영 기준(흉내 모드에서 같은 노드를 찾는 데 씀)
 * hint = 아이콘 요청 이름(흉내 모드)
 */
export async function convertFromUrl(url, { expect, released, hint } = {}) {
  const { fileKey, nodeId } = parseFigmaUrl(url);
  if (TOKEN) {
    const entry = await fetchLive(fileKey, nodeId);
    const out = convertNode(fileKey, nodeId, entry);
    if (out.kind === "icon") out.svg = (await fetchIconSvg(fileKey, nodeId)) || placeholderSvg;
    return { mode: "live", fileKey, nodeId, result: out };
  }
  // 흉내 모드
  const fx = loadFixture(fileKey, nodeId);
  if (fx) return { mode: "mock", fileKey, nodeId, result: convertNode(fileKey, nodeId, fx) };
  if (expect === "block") {
    // 승격 블록: UI팀이 피그마에 새로 그린 공통 블록이라고 보고 key를 만든다
    return {
      mode: "mock",
      fileKey,
      nodeId,
      result: {
        kind: "component",
        key: slug(hint || nodeId),
        name: hint || nodeId,
        description: "",
        figma: { fileKey, nodeId, componentKey: mockKey(fileKey + nodeId), url: `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(/:/g, "-")}` },
        props: [],
        variants: [],
        tokens: [],
      },
    };
  }
  if (expect !== "icon") {
    const hit = Object.values(released.components).find((c) => c.figma.nodeId === nodeId);
    if (hit) return { mode: "mock", fileKey, nodeId, result: { kind: "component", ...JSON.parse(JSON.stringify(hit)) } };
    throw new Error(
      `흉내 모드: 노드 ${nodeId}를 찾지 못했습니다. 운영 기준의 컴포넌트 주소나 poc/fixtures/figma의 예시 주소를 쓰거나, FIGMA_TOKEN을 설정해 주세요`
    );
  }
  const name = hint || `Icon${nodeId.replace(/\D/g, "")}`;
  return {
    mode: "mock",
    fileKey,
    nodeId,
    result: { kind: "icon", name, style: "line", figmaName: `Icon/Line/${name}`, nodeId, key: mockKey(fileKey + nodeId), svg: placeholderSvg },
  };
}

// 운영 기준과 비교해 바뀐 점과 버전 자리를 정한다
export function diffComponent(prev, next) {
  if (!prev) return { bump: "MINOR", lines: [`새 컴포넌트 ${next.name} (props ${next.props.length} · 변형 ${next.variants.length})`] };
  const lines = [];
  let bump = null;
  const up = (b) => {
    const o = ["PATCH", "MINOR", "MAJOR"];
    if (!bump || o.indexOf(b) > o.indexOf(bump)) bump = b;
  };
  const pp = Object.fromEntries(prev.props.map((p) => [p.name, p]));
  const np = Object.fromEntries(next.props.map((p) => [p.name, p]));
  for (const n of Object.keys(pp)) if (!np[n]) (lines.push(`속성 삭제: ${n}`), up("MAJOR"));
  for (const n of Object.keys(np)) if (!pp[n]) (lines.push(`속성 추가: ${n}`), up("MINOR"));
  for (const n of Object.keys(np)) {
    if (!pp[n]) continue;
    const a = pp[n].options || [];
    const b = np[n].options || [];
    for (const o of a) if (!b.includes(o)) (lines.push(`${n} 선택지 삭제: ${o}`), up("MAJOR"));
    for (const o of b) if (!a.includes(o)) (lines.push(`${n} 선택지 추가: ${o}`), up("MINOR"));
    if (pp[n].default !== np[n].default) (lines.push(`${n} 기본값 ${pp[n].default} → ${np[n].default}`), up("MAJOR"));
  }
  if (prev.variants.length !== next.variants.length) (lines.push(`변형 ${prev.variants.length} → ${next.variants.length}개`), up(next.variants.length < prev.variants.length ? "MAJOR" : "MINOR"));
  if ((prev.description || "") !== (next.description || "")) (lines.push("설명 수정"), up("PATCH"));
  if ((prev.guideLead || "") !== (next.guideLead || "")) (lines.push("정책 문구 수정"), up("PATCH"));
  return { bump: bump || "PATCH", lines: lines.length ? lines : ["바뀐 점 없음"] };
}
