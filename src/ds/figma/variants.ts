// 변형 고르기와 속성 분석. React 컴포넌트와 문서 사이트 미리보기가 함께 쓴다.

import type { ComponentData, Layer, PropDef, PropValues, Variant } from './types';

/** 포인터 · 키보드가 움직이는 상태 값 (state 속성의 선택지) */
export const INTERACTIVE = ['hover', 'pressed', 'focus'];
const ON = ['checked', 'selected', 'on'];
const OFF = ['unchecked', 'unselected', 'off'];

export interface Analysis {
  vprops: PropDef[];
  /** hover · pressed가 있는 변형 속성 (보통 state) */
  stateProp?: PropDef;
  /** 켜기 · 끄기 선택 속성 (selection: checked · unchecked) */
  selectProp?: PropDef;
  flags: PropDef[];
  focusFlag?: PropDef;
  texts: PropDef[];
  /** 포인터가 상태를 움직여도 되는 쉬는 값 (default) */
  restOption?: string;
  on?: string;
  off?: string;
}

const cache = new WeakMap<ComponentData, Analysis>();

export function analyze(c: ComponentData): Analysis {
  const hit = cache.get(c);
  if (hit) return hit;
  const vprops = c.props.filter((p) => p.type === 'variant');
  const stateProp = vprops.find((p) => p.options!.some((o) => INTERACTIVE.includes(o)));
  const selectProp = vprops.find((p) => p.options!.some((o) => ON.includes(o)) && p.options!.some((o) => OFF.includes(o)));
  const a: Analysis = {
    vprops,
    stateProp,
    selectProp,
    flags: c.props.filter((p) => p.type === 'boolean' && !/focus/i.test(p.name)),
    focusFlag: c.props.find((p) => p.type === 'boolean' && /focus/i.test(p.name)),
    texts: c.props.filter((p) => p.type === 'text'),
    restOption: stateProp && (stateProp.options!.find((o) => !INTERACTIVE.includes(o) && o !== 'disabled') || String(stateProp.default)),
    on: selectProp?.options!.find((o) => ON.includes(o)),
    off: selectProp?.options!.find((o) => OFF.includes(o)),
  };
  cache.set(c, a);
  return a;
}

/** 변형 속성 기본값 */
export const defaultSelection = (c: ComponentData): Record<string, string> =>
  Object.fromEntries(c.props.filter((p) => p.type === 'variant').map((p) => [p.name, String(p.default)]));

/** 불리언 · 텍스트 속성 기본값 (Figma 속성 이름 → 값) */
export const defaultValues = (c: ComponentData): PropValues =>
  Object.fromEntries(c.props.filter((p) => p.type === 'boolean' || p.type === 'text').map((p) => [p.figmaName, p.default as string | boolean]));

/** 정확히 맞는 변형, 없으면 가장 많은 속성이 같은 변형 (Figma 세트는 비어 있는 조합이 있다).
 *  must는 반드시 같아야 하는 속성 (그 선택지의 케이스 카드) */
export function findVariant(c: ComponentData, want: Record<string, string>, must?: string): Variant {
  let best: Variant | null = null;
  let score = -1;
  for (const v of c.variants) {
    if (must && v.props[must] !== want[must]) continue;
    const s = Object.entries(want).filter(([k, val]) => v.props[k] === val).length;
    if (s > score) {
      best = v;
      score = s;
    }
  }
  return best || c.variants[0];
}

/** 예시에 쓸 변형 속성: 가이드가 적지 않은 속성은 컴포넌트 기본값으로 채운다 */
export const propsFor = (c: ComponentData, want: Record<string, string>, base: Record<string, string> = {}) => ({ ...defaultSelection(c), ...base, ...want });

/** 모든 속성이 정확히 맞는 변형 (없으면 null) */
export const variantOf = (c: ComponentData, props: Record<string, string>) => c.variants.find((v) => Object.entries(props).every(([k, val]) => v.props[k] === val)) || null;

/** 앞에서 고른 속성들과 함께 있을 수 있는 선택지 */
export function optionsFor(c: ComponentData, p: PropDef, sel: Record<string, string>): string[] {
  const { vprops } = analyze(c);
  const before = vprops.slice(0, vprops.indexOf(p));
  return p.options!.filter((o) => c.variants.some((v) => v.props[p.name] === o && before.every((q) => v.props[q.name] === sel[q.name])));
}

/** 없는 조합을 고르면 앞에서부터 있는 선택지로 맞춘다 */
export function fixSelection(c: ComponentData, sel: Record<string, string>): Record<string, string> {
  const out = { ...sel };
  for (const p of analyze(c).vprops) {
    const opts = optionsFor(c, p, out);
    if (!opts.includes(out[p.name])) out[p.name] = opts[0];
  }
  return out;
}

export interface UsedGroup {
  name: string;
  items: { figmaName: string; name: string; type: 'boolean' | 'text'; value: string | boolean }[];
}

/** 이 변형이 실제로 쓰는 속성: 보이는 레이어가 가리키는 맨 위 속성과, 안쪽 인스턴스(HelperText의 message, showCount …)의
 *  불리언 · 텍스트 속성을 인스턴스별로 묶는다. Figma에서 `_…` 이름의 인스턴스는 내부 부품이라 빼고, 아이콘 바꾸기도 뺀다. */
export function usedProps(c: ComponentData, layer: Layer, values: PropValues): { top: Set<string>; groups: UsedGroup[] } {
  const topNames = new Set(c.props.map((p) => p.figmaName));
  const top = new Set<string>();
  const groups = new Map<string, UsedGroup>();
  const walk = (l: Layer, group: UsedGroup | null) => {
    const refs = l.propRefs || {};
    for (const [kind, fig] of Object.entries(refs)) {
      if (kind === 'mainComponent' || kind === 'slotContentId') continue;
      if (topNames.has(fig)) top.add(fig);
      else if (group && !group.items.some((i) => i.figmaName === fig)) {
        group.items.push({ figmaName: fig, name: fig.replace(/#.*$/, ''), type: kind === 'visible' ? 'boolean' : 'text', value: kind === 'visible' ? l.visible !== false : l.text?.characters ?? '' });
      }
    }
    const visible = refs.visible && refs.visible in values ? !!values[refs.visible] : l.visible !== false;
    if (!visible) return;
    let next = group;
    if (l !== layer && l.type === 'INSTANCE') {
      if (l.name.startsWith('_')) next = null;
      else {
        if (!groups.has(l.name)) groups.set(l.name, { name: l.name, items: [] });
        next = groups.get(l.name)!;
      }
    }
    (l.children || []).forEach((ch) => walk(ch, next));
  };
  walk(layer, null);
  return { top, groups: [...groups.values()].filter((g) => g.items.length) };
}

/** 컴포넌트 안에서 쓰는 아이콘의 Figma 컴포넌트 키 */
export function iconKeys(c: ComponentData, known: Set<string>): string[] {
  const keys = new Set<string>();
  const walk = (l: Layer) => {
    if (l.main && known.has(l.main.key)) keys.add(l.main.key);
    (l.children || []).forEach(walk);
  };
  c.variants.forEach((v) => v.layer && walk(v.layer));
  if (c.layer) walk(c.layer);
  return [...keys];
}
