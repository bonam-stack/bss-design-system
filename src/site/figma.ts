// 브라우저에서 Figma를 읽는다: 담당이 이 브라우저에 넣은 개인 Figma 토큰(figd_…)으로 api.figma.com을 바로 부른다.
// 토큰이 없으면 포털 코어가 흉내 모드(운영 기준 · 예시 노드)로 읽는다. 토큰은 이 브라우저에만 저장하고 다른 곳으로 보내지 않는다.
import { parseFigmaUrl, setFigmaToken } from './portal/portal-core.js';

const KEY = 'bss-portal.figma-token';
export const getFigmaToken = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};
export const saveFigmaToken = (t: string) => {
  try {
    if (t) localStorage.setItem(KEY, t);
    else localStorage.removeItem(KEY);
  } catch {
    /* 저장 못 하면 이번 화면에서만 */
  }
  setFigmaToken(t);
};
setFigmaToken(getFigmaToken());

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const hex = (c?: { r: number; g: number; b: number; a?: number }) => {
  if (!c) return undefined;
  const h = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a !== undefined && c.a < 1 ? h(c.a) : ''}`.toUpperCase();
};
const paints = (L?: Node[]) => (L || []).filter((p) => p.visible !== false && p.type === 'SOLID').map((p) => hex({ ...p.color, a: (p.opacity ?? 1) * (p.color?.a ?? 1) }));

/** 코드를 만들 때 AI에게 보여 줄 만큼만 (이름 · 크기 · 자동 레이아웃 · 색 · 글자) */
export function trimNode(n: Node, depth = 0): Node {
  const b = n.absoluteBoundingBox;
  const out: Node = { name: n.name, type: n.type };
  if (b) out.size = [Math.round(b.width), Math.round(b.height)];
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    out.layout = { dir: n.layoutMode, gap: n.itemSpacing, pad: [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft], align: [n.primaryAxisAlignItems, n.counterAxisAlignItems] };
  }
  const fill = paints(n.fills);
  if (fill.length && n.type !== 'TEXT') out.fill = fill;
  const stroke = paints(n.strokes);
  if (stroke.length) out.stroke = { color: stroke, weight: n.strokeWeight };
  if (n.cornerRadius) out.radius = n.cornerRadius;
  if (n.type === 'TEXT') {
    out.text = n.characters;
    out.font = { size: n.style?.fontSize, weight: n.style?.fontWeight, lineHeight: n.style?.lineHeightPx, color: fill[0] };
  }
  if (n.boundVariables && Object.keys(n.boundVariables).length) out.vars = Object.keys(n.boundVariables);
  if (n.componentProperties) out.props = Object.fromEntries(Object.entries(n.componentProperties).map(([k, v]) => [k.replace(/#[\d:]+$/, ''), (v as Node).value]));
  if (n.visible === false) out.hidden = true;
  if (n.children && depth < 8) out.children = n.children.map((c: Node) => trimNode(c, depth + 1));
  return out;
}

/** Figma 노드의 레이어 구조 (토큰이 있을 때만). 변형이 많으면 앞쪽 몇 개만 */
export async function fetchFigmaLayers(url: string, maxVariants = 6): Promise<Node | null> {
  const token = getFigmaToken();
  if (!token) return null;
  const at = parseFigmaUrl(url);
  if (!at) throw new Error("Figma 노드 주소가 아닙니다");
  const { fileKey, nodeId } = at;
  const r = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`, { headers: { 'X-Figma-Token': token } });
  if (r.status === 403) throw new Error('Figma 토큰이 맞지 않거나 이 파일을 볼 권한이 없습니다');
  if (!r.ok) throw new Error(`Figma API ${r.status}`);
  const doc = (await r.json()).nodes?.[nodeId]?.document;
  if (!doc) throw new Error(`노드 ${nodeId}를 찾지 못했습니다`);
  const t = trimNode(doc);
  if (t.children && t.children.length > maxVariants) {
    t.note = `변형 ${t.children.length}개 중 앞 ${maxVariants}개만 보냄`;
    t.children = t.children.slice(0, maxVariants);
  }
  return t;
}
