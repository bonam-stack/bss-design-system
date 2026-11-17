// 문서 사이트 데이터. 모두 저장소 JSON에서 온다 (빌드 때 묶임):
//   components/index.json · components/<key>/component.json(src/ds의 생성 컴포넌트가 가져옴) · components/<key>/guide.json
//   icons/icons.json + icons/svg/*.svg · patterns/index.json + patterns/<key>/pattern.json · catalog/catalog.json
// 컴포넌트를 더하려면 Figma에서 뽑은 폴더를 넣고 components/index.json에 키를 더한 뒤 npm run gen.

import { components as dsComponents } from '../ds';
import type { DsComponent } from '../ds/core/react';
import type { ComponentData } from '../ds/types';
import type { Catalog } from './portal/store';
import catalogJson from '../../catalog/catalog.json';
import iconsJson from '../../icons/icons.json';
import patternIndex from '../../patterns/index.json';
import guideIndex from '../../components/guides.json';

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

const guideFiles = import.meta.glob<unknown>('../../components/*/guide.json', { eager: true, import: 'default' });
const patternFiles = import.meta.glob<unknown>('../../patterns/*/pattern.json', { eager: true, import: 'default' });
const patternSvgs = import.meta.glob<string>('../../patterns/*/*.svg', { eager: true, query: '?raw', import: 'default' });
const iconSvgs = import.meta.glob<string>('../../icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' });

export const catalog = catalogJson as Catalog;

export const icons = iconsJson as IconsData;
for (const i of icons.icons) if (i.file && !i.svg) i.svg = (iconSvgs[`../../icons/${i.file}`] || '').trim();

const registry = dsComponents as unknown as Record<string, DsComponent<Record<string, unknown>>>;
export interface SiteComponent {
  data: ComponentData;
  guide?: Guide;
  View: DsComponent<Record<string, unknown>>;
}
const guideKeys = new Set((guideIndex as { guides: string[] }).guides);
export const components: SiteComponent[] = Object.entries(registry).map(([key, View]) => ({
  data: View.data,
  View,
  guide: guideKeys.has(key) ? (guideFiles[`../../components/${key}/guide.json`] as Guide | undefined) : undefined,
}));
export const componentByKey = (key: string) => components.find((c) => c.data.key === key) || null;

export const patterns: Pattern[] = (patternIndex as { patterns: string[] }).patterns.map((key) => {
  const p = patternFiles[`../../patterns/${key}/pattern.json`] as Omit<Pattern, 'iconSvg'>;
  // 패턴마다 Figma 가이드에 그려진 아이콘을 색 그대로 가져온다
  const iconSvg = Object.fromEntries(Object.entries(p.icons || {}).map(([k, f]) => [k, (patternSvgs[`../../patterns/${key}/${f}`] || '').trim()]));
  return { ...p, iconSvg };
});
