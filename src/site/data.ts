// 문서 사이트 데이터. 모두 저장소 JSON에서 온다 (빌드 때 묶임):
//   components/index.json · components/<key>/component.json(src/ds의 생성 컴포넌트가 가져옴) · components/<key>/guide.json
//   icons/icons.json + icons/svg/*.svg · patterns/index.json + patterns/<key>/pattern.json · catalog/catalog.json
// 컴포넌트를 더하려면 Figma에서 뽑은 폴더를 넣고 components/index.json에 키를 더한 뒤 src/ds/components/<Name>.tsx를 만든다.

import type { ComponentData, IconMap } from '../ds/figma/types';
import { iconKeys } from '../ds/figma/variants';
import { pascal, repoComponent } from './live';
import type { LiveComponent } from './live';
import type { Catalog } from './portal/store';
import catalogJson from '../../catalog/catalog.json';
import iconsJson from '../../icons/icons.json';
import patternIndex from '../../patterns/index.json';
import guideIndex from '../../components/guides.json';
import componentIndex from '../../components/index.json';
import tokensJson from '../../tokens/variables.json';

// ---------- 사용 가이드 (components/<key>/guide.json) ----------

export interface Source {
  fileKey: string;
  fileName: string;
  nodeId: string;
  name: string;
  url?: string;
  extractedAt?: string;
}
export type PolicyItem = string | { id?: string; text: string };
export interface Policy {
  title: string;
  lead: string;
  source?: { id: string; title: string; status?: string; file?: string; extractedAt?: string };
  when?: { use: string[]; avoid: { text: string; alt: string }[] };
  rules: { id?: string; name: string; desc: string; from: string; gap?: string }[];
  do?: PolicyItem[];
  dont?: PolicyItem[];
  related?: { name: string; desc: string; file: string }[];
}
export interface GuideRow {
  id?: string;
  name: string;
  props: Record<string, string>;
  desc: string;
  missing?: boolean;
}
export interface Guide {
  source?: Source;
  group?: string;
  overview?: string;
  policy?: Policy;
  anatomy?: { title: string; lead: string; example: Record<string, string>; parts: { n: number; name: string; layer: string; desc: string }[] };
  states?: { title: string; lead: string; rows: GuideRow[]; defaults?: Record<string, string> };
  variants?: { title: string; lead: string; groups: { title: string; lead: string; rows: GuideRow[] }[] };
  spec?: { title: string; lead: string; items: { name: string; props: Record<string, string>; box?: number; gap?: number; radius?: number }[] };
  notes?: string[];
}

// ---------- 아이콘 ----------

export interface IconEntry {
  name: string;
  figmaName: string;
  group: string;
  style: 'line' | 'filled' | 'colored' | string;
  file?: string;
  nodeId: string;
  key: string;
  description?: string;
  onDark?: boolean;
  svg?: string;
}
export interface IconsData {
  size: number;
  figma: { fileKey: string; nodeId: string };
  sections: { style: string; title: string; description: string; groups: string[] }[];
  icons: IconEntry[];
}

// ---------- 패턴 ----------

export interface PNode {
  id?: string;
  mark?: number;
  markX?: number;
  w?: number;
  h?: number;
  row?: PNode[];
  gap?: number;
  label?: string;
  select?: string;
  date?: string;
  field?: string;
  button?: string;
  divider?: number;
}
export interface Pattern {
  key: string;
  name: string;
  group: string;
  figma?: unknown;
  components?: string[];
  icons?: Record<string, string>;
  iconSvg: Record<string, string>;
  overview: string;
  figures: Record<string, { nodeId: string; layout: PNode }>;
  anatomy: { title: string; lead: string; examples: { title: string; figure: string }[]; parts: { n: number; name: string; desc: string }[] };
  types: { title: string; lead: string; rows: { name: string; figure: string; desc: string }[] };
  spec: { title: string; lead: string; examples: { figure: string; gaps: { from: string; to: string; value: number; center?: string }[] }[] };
}

// ---------- 묶기 ----------

const componentFiles = import.meta.glob<unknown>('../../components/*/component.json', { eager: true, import: 'default' });
const guideFiles = import.meta.glob<unknown>('../../components/*/guide.json', { eager: true, import: 'default' });
const patternFiles = import.meta.glob<unknown>('../../patterns/*/pattern.json', { eager: true, import: 'default' });
const patternSvgs = import.meta.glob<string>('../../patterns/*/*.svg', { eager: true, query: '?raw', import: 'default' });
const iconSvgs = import.meta.glob<string>('../../icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' });

export const catalog = catalogJson as Catalog;

export const icons = iconsJson as IconsData;
/** 기준 토큰 (Figma 변수). 게시된 추가 · 수정은 portal/store의 tokens() */
export const baseTokens = (tokensJson as unknown as { tokens: Record<string, import('./portal/store').Token> }).tokens;
for (const i of icons.icons) if (i.file && !i.svg) i.svg = (iconSvgs[`../../icons/${i.file}`] || '').trim();

export interface SiteComponent {
  /** Figma 원본 (component.json) */
  data: ComponentData;
  guide?: Guide;
  /** React 컴포넌트 이름 = src/ds/components/<name>.tsx */
  name: string;
  /** 저장소의 React 컴포넌트 (포털에 게시된 코드가 있으면 페이지가 그것을 대신 쓴다) */
  Component: LiveComponent | null;
  /** Figma 원본 그리기용 아이콘 */
  icons: IconMap;
}
const guideKeys = new Set((guideIndex as { guides: string[] }).guides);
const iconByKey = new Map(icons.icons.filter((i) => i.svg).map((i) => [i.key, i]));
export const components: SiteComponent[] = (componentIndex as { components: string[] }).components.map((key) => {
  const data = componentFiles[`../../components/${key}/component.json`] as ComponentData;
  const name = pascal(key);
  return {
    data,
    name,
    Component: repoComponent(name),
    guide: guideKeys.has(key) ? (guideFiles[`../../components/${key}/guide.json`] as Guide | undefined) : undefined,
    icons: Object.fromEntries(iconKeys(data, new Set(iconByKey.keys())).map((k) => [k, { svg: iconByKey.get(k)!.svg!, colored: iconByKey.get(k)!.style === 'colored' }])),
  };
});
export const componentByKey = (key: string) => components.find((c) => c.data.key === key) || null;

export const patterns: Pattern[] = (patternIndex as { patterns: string[] }).patterns.map((key) => {
  const p = patternFiles[`../../patterns/${key}/pattern.json`] as Omit<Pattern, 'iconSvg'>;
  // 패턴마다 Figma 가이드에 그려진 아이콘을 색 그대로 가져온다
  const iconSvg = Object.fromEntries(Object.entries(p.icons || {}).map(([k, f]) => [k, (patternSvgs[`../../patterns/${key}/${f}`] || '').trim()]));
  return { ...p, iconSvg };
});
