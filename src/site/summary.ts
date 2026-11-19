// 핵심 요약: 게시된 기준(정책 · 규칙 · 속성)에서 자동으로 만든다. 사람이 편집하지 않는다.
// SB Studio API가 컴포넌트 · 블록을 판단할 때 가장 먼저 읽는 데이터다.
// 화면(AiSummary)과 빌드 때 만드는 API 파일(dist/api/summary/*.json, vite.config.ts)이 같은 함수를 쓴다.

export interface SummaryInput {
  kind: 'comp' | 'block';
  name: string;
  /** React 컴포넌트 이름 또는 카탈로그 코드 */
  codeName: string;
  catalog?: string;
  group?: string;
  meaning: string;
  use?: string[];
  avoid?: { text: string; alt?: string }[];
  rules?: { name: string; desc: string }[];
  do?: string[];
  dont?: string[];
  props?: { name: string; type: string; default?: unknown; options?: string[] }[];
  slot?: string;
  parts?: string[];
  guides?: string[];
  basis: string;
}

export interface Summary {
  kind: 'comp' | 'block';
  name: string;
  code: string;
  catalog?: string;
  group?: string;
  /** 한 줄 정의 */
  what: string;
  /** 쓸 때 (최대 2) */
  use: string[];
  /** 꼭 지킬 기준 (최대 3, 첫 문장) */
  rules: { name: string; rule: string }[];
  /** 대신 쓸 것 (최대 2) */
  instead: { case: string; use: string }[];
  /** 하지 않음 (최대 2, 기준과 겹치는 문장 제외) */
  dont: string[];
  /** 고르는 속성(선택지)과 켜고 끄는 속성 */
  props: { name: string; options?: string[] }[];
  slot?: string;
  parts?: string[];
  guides?: string[];
  basis: string;
}

export const plain = (s: string) => String(s || '').replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
/** 첫 문장만 */
export const firstSentence = (s: string) => (String(s).match(/^.+?[.다](?=\s|$)/) || [String(s)])[0];
const head = (t: string) => plain(t).replace(/\s/g, '').slice(0, 6);

export function makeSummary(i: SummaryInput): Summary {
  const rules = (i.rules || []).slice(0, 3).map((r) => ({ name: r.name, rule: firstSentence(plain(r.desc)) }));
  const inRules = new Set((i.rules || []).slice(0, 3).map((r) => head(r.desc)));
  return {
    kind: i.kind,
    name: i.name,
    code: i.codeName,
    catalog: i.catalog,
    group: i.group,
    what: plain(i.meaning),
    use: (i.use || []).map(plain).slice(0, 2),
    rules,
    instead: (i.avoid || []).slice(0, 2).map((a) => ({ case: plain(a.text), use: plain(a.alt || '') })),
    dont: (i.dont || []).map(plain).filter((t) => !inRules.has(head(t))).slice(0, 2),
    props: (i.props || []).filter((p) => p.type !== 'instance').map((p) => (p.options ? { name: p.name, options: p.options } : { name: p.name })),
    slot: i.slot,
    parts: i.parts,
    guides: i.guides,
    basis: i.basis,
  };
}
