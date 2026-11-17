// NEXT BSS UX Pattern Guide를 포털 구조로 나눈 것 (scripts/structure_ux_guide.py → guides/ux-pattern/structure.json · docs/<id>.json).
//   UX 원칙 → 시작하기 · 파운데이션 → Foundations · 패턴 → Patterns · 모듈 → Blocks · 컴포넌트 → Components
//   SB 작성 가이드 · 용어사전 → UX 거버넌스 · Do/Don't → UX 거버넌스 규칙
// 문서 목록 · 규칙은 바로 읽고, 문서 구조는 페이지를 열 때 불러온다.
import { Marked } from 'marked';
import structureJson from '../../guides/ux-pattern/structure.json';
import glossaryJson from '../../guides/ux-pattern/glossary.json';
import type { Rule } from './portal/store';

export type Place = 'start' | 'foundations' | 'patterns' | 'blocks' | 'components' | 'governance';

export interface GuideDocMeta {
  id: string;
  title: string;
  /** 가이드의 섹션 (UX 원칙 · 파운데이션 · 패턴 · 모듈 · 컴포넌트 · 가이드 활용) */
  section: string;
  /** 섹션 안의 묶음 (조회·목록 · 노드 모듈 …) */
  group: string;
  /** 포털에서 놓이는 섹션 */
  place: Place;
  /** 이 문서를 근거로 하는 카탈로그 코드 (레이아웃 · 블록 · 컴포넌트) */
  targets: string[];
  /** 본문에서 가리키는 다른 문서 */
  links: string[];
  lead: string;
}

export type Block =
  | { type: 'text'; text: string }
  | { type: 'note'; title: string; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'parts'; items: { n: number; name: string; desc: string }[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'h' | 'h4'; text: string }
  | { type: 'when'; title: string; use?: string[]; avoid?: { text: string; alt?: string }[] }
  | { type: 'cards'; items: { tag: string; title: string; body: string[]; chip: string }[] };

export interface GuideDoc extends GuideDocMeta {
  overview: Block[];
  when: { use: string[]; avoid: { text: string; alt?: string }[]; useTitle?: string; avoidTitle?: string };
  sections: { title: string; blocks: Block[] }[];
  do: string[];
  dont: string[];
  ruleIds: { do: string[]; dont: string[] };
}

export interface GlossaryTerm {
  section: string;
  group: string;
  term: string;
  extra: string;
  en: string;
  abbr: string;
  meaning: string;
  docs: string[];
}

const structure = structureJson as { source: string; generated: string; docs: GuideDocMeta[]; rules: (Rule & { source: string })[] };
export const guideSource = { url: structure.source, generated: structure.generated, release: structure.source.replace(/^.*release\/(\d+)\/?$/, '$1') };
export const guideDocs = structure.docs;
/** Do/Don't에서 온 UX 거버넌스 규칙 (kind: 권장 · 금지, source: UX 패턴 가이드) */
export const guideRules = structure.rules;
export const glossary = (glossaryJson as { terms: GlossaryTerm[] }).terms;

export const guideDoc = (id: string) => guideDocs.find((d) => d.id === id) || null;
export const guideRoute = (id: string) => `g-${id}`;
export const docsIn = (place: Place) => guideDocs.filter((d) => d.place === place);
/** 이 카탈로그 코드를 근거로 하는 가이드 문서 */
export const docsFor = (code: string) => guideDocs.filter((d) => d.targets.includes(code));

const files = import.meta.glob<GuideDoc>('../../guides/ux-pattern/docs/*.json', { import: 'default' });
const cache = new Map<string, GuideDoc>();
export async function loadGuideDoc(id: string): Promise<GuideDoc> {
  if (cache.has(id)) return cache.get(id)!;
  const load = files[`../../guides/ux-pattern/docs/${id}.json`];
  if (!load) throw new Error(`${id} 문서가 없습니다`);
  const d = await load();
  cache.set(id, d);
  return d;
}

/** 근거 문서 표기(work-composition, form-big.html)를 가이드 문서로 */
export function guideRef(ref?: string): GuideDocMeta | null {
  if (!ref) return null;
  const m = ref.match(/^(?:pages\/)?([a-z0-9-]+?)(?:\.html)?$/);
  return m ? guideDoc(m[1]) : null;
}

// 글 안의 굵게 · 코드 · 링크. 가이드의 다른 문서 링크(grid-board.html)는 포털 페이지로, 같은 문서 안 링크(#steps)는 글자만.
const md = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      const m = href.match(/^(?:\.\/|pages\/)?([a-z0-9-]+)\.html(?:#.*)?$/);
      if (m && guideDoc(m[1])) return `<a href="#${guideRoute(m[1])}">${text}</a>`;
      return /^https?:/.test(href) ? `<a href="${href}" target="_blank" rel="noopener">${text}</a>` : text;
    },
  },
});
export const inline = (text: string) => md.parseInline(text) as string;
