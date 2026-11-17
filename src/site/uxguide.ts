// NEXT BSS UX Pattern Guide (guides/ux-pattern): caumuse 가이드에서 뽑아 scripts/split_ux_guide.py로 나눈 문서 82개.
// 목록(index.json)은 바로 읽고, 본문(<id>.md)은 페이지를 열 때 불러온다.
import { Marked } from 'marked';
import indexJson from '../../guides/ux-pattern/index.json';

export interface UxDoc {
  id: string;
  title: string;
  /** 'UX 원칙 (Principles)' · '패턴 (Patterns)' … */
  section: string;
  /** 섹션 > 묶음 > 제목 */
  path: string[];
  file: string;
}
export const ux = indexJson as { title: string; source: string; generated: string; docs: UxDoc[] };
export const uxDoc = (id: string) => ux.docs.find((d) => d.id === id) || null;
/** 섹션 이름의 앞부분 (UX 원칙 (Principles) → UX 원칙) */
export const shortSection = (s: string) => s.replace(/\s*\(.*\)\s*$/, '');
/** 문서 경로의 가운데 묶음 (패턴 > 조회·목록 > 일반목록 → 조회·목록) */
export const groupOf = (d: UxDoc) => (d.path.length > 2 ? d.path.slice(1, -1).join(' › ') : '');
export const uxRoute = (id: string) => `ux-${id}`;

const bodies = import.meta.glob<string>('../../guides/ux-pattern/*.md', { query: '?raw', import: 'default' });
const cache = new Map<string, string>();
export async function loadUx(id: string): Promise<string> {
  if (cache.has(id)) return cache.get(id)!;
  const load = bodies[`../../guides/ux-pattern/${id}.md`];
  if (!load) throw new Error(`${id} 문서가 없습니다`);
  const text = await load();
  cache.set(id, text);
  return text;
}
export const loadAllUx = () => Promise.all(ux.docs.map(async (d) => ({ doc: d, text: await loadUx(d.id) })));

// 문서 안 제목은 ####부터 시작한다: #### → h2, ##### → h3, ###### → h4 (페이지 목차가 h2 · h3을 모은다)
const md = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    heading({ tokens, depth }) {
      const level = Math.min(6, Math.max(2, depth - 2));
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      // 가이드 안의 다른 문서(grid-board.html, grid-board.html#동작) → 이 사이트의 페이지
      const m = href.match(/^(?:\.\/|pages\/)?([a-z0-9-]+)\.html(?:#.*)?$/);
      if (m && uxDoc(m[1])) return `<a href="#${uxRoute(m[1])}">${text}</a>`;
      const t = title ? ` title="${title}"` : '';
      return /^https?:/.test(href) ? `<a href="${href}"${t} target="_blank" rel="noopener">${text}</a>` : `<span${t}>${text}</span>`;
    },
  },
});
export const renderUx = (text: string) => md.parse(text) as string;

/** 다른 페이지의 근거 문서 표기(work-composition, form-big.html)를 가이드 문서로 */
export function uxRef(ref?: string): UxDoc | null {
  if (!ref) return null;
  const m = ref.match(/^(?:pages\/)?([a-z0-9-]+?)(?:\.html)?$/);
  return m ? uxDoc(m[1]) : null;
}

/** 컴포넌트 페이지에서 이어 볼 UX 가이드 문서 */
export const UX_FOR_COMPONENT: Record<string, string[]> = {
  button: ['layout-action', 'layout-button-label'],
  checkbox: ['ui-comp-input'],
  radio: ['ui-comp-input'],
  'radio-group': ['ui-comp-input'],
  'text-field': ['ui-comp-input', 'resp-form-validation'],
  'text-area': ['ui-comp-input', 'resp-form-validation'],
  'password-field': ['ui-comp-input', 'resp-form-validation', 'resp-masking'],
  'helper-text': ['ui-comp-feedback', 'resp-form-validation'],
  divider: ['ui-comp-container'],
};
