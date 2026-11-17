// BSS 디자인 포털 상태: 게시본(카탈로그 · 규칙 · 가이드 · 컴포넌트) + 초안 + 승격 + 버전.
// 편집 권한이 있는 담당이 고치면 초안이 되고, 포털 승인 담당이 게시하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀐다.
// 저장은 이 브라우저의 localStorage (POC). 게시본 = 저장소 JSON(기준) + 게시된 변경(pub).
// 바뀔 때마다 subscribe한 화면(useSyncExternalStore)이 다시 그려진다.
import { convertFromUrl, diffComponent } from './portal-core.js';
import type { ComponentData } from '../../ds/figma/types';
import type { Policy } from '../data';
import { guideRules } from '../guide';

const KEY = 'bss-design-portal.v2';
export type Role = 'viewer' | 'ux' | 'ds' | 'approver';
export const ROLES: Record<Role, string> = { viewer: '보기 (기획자)', ux: 'UX 가이드 담당', ds: '디자인 시스템 담당', approver: '포털 승인 담당' };
export type Kind = 'layout' | 'block' | 'comp';
export const KIND: Record<Kind, string> = { layout: '레이아웃 규칙', block: '블록', comp: '컴포넌트' };
export type Status = 'pub' | 'draft' | 'tmp';
export const STATUS: Record<Status, string> = { pub: '게시', draft: '초안', tmp: '임시' };
export const PROMO_STAGES: { stage: string; who: Role; act: string }[] = [
  { stage: '구조 확인', who: 'ux', act: '구조 확인 통과' },
  { stage: '모양 확인', who: 'ds', act: '모양 확인 · Figma 등록' },
  { stage: '최종 승인', who: 'approver', act: '최종 승인' },
];
// 누가 무엇을 고치나: 모양(블록 · 컴포넌트 · Figma)은 디자인 시스템 담당, 쓰는 방법(레이아웃 규칙 · 규칙 · 사용 가이드)은 UX 가이드 담당
export type EditType = Kind | 'figma' | 'code' | 'text' | 'rule' | 'guide';
export const EDITOR: Record<EditType, Role> = { block: 'ds', comp: 'ds', figma: 'ds', code: 'ds', text: 'ds', layout: 'ux', rule: 'ux', guide: 'ux' };

export type Bump = 'PATCH' | 'MINOR' | 'MAJOR';

export interface Item {
  code: string;
  kind: Kind;
  name: string;
  nameKo?: string;
  status: Status;
  design: boolean;
  ux: boolean;
  meaning: string;
  variants?: string;
  slot?: string;
  guide?: string;
  key?: string;
  promotedFrom?: string;
}
export interface Rule {
  id: string;
  /** UX 패턴 가이드에서 온 규칙 */
  source?: string;
  doc: string;
  section: string;
  kind: string;
  text: string;
  targets: string[];
}
export interface Slot {
  path: string;
  owner: string;
  mode: string;
  accepts: string;
  name: string;
}
export interface Part {
  block: string;
  slot: string;
  comp: string;
  required: boolean;
}
export interface Promotion {
  id: string;
  code: string;
  name: string;
  from: string;
  judge: string;
  stage: string;
  status: string;
  figma?: string;
  log?: { at: string; by: Role; text: string }[];
}
export interface Detection {
  at: string;
  file: string;
  target: string;
  change: string;
  impact: string;
  action: string;
  by?: Role;
}
export interface Catalog {
  meta: { catalog: string; uxGuide: string; tokens: string; version: string; source: string };
  items: Item[];
  slots: Slot[];
  parts: Part[];
  rules: Rule[];
  promotions: Promotion[];
  detections: Detection[];
}
export interface GuideRule {
  id: string;
  kind: 'rule' | 'do' | 'dont';
  text: string;
  from?: string;
  remove?: boolean;
}
export interface GuideDoc {
  lead: string;
  rules: GuideRule[];
  next: number;
}
export type DraftType = 'item' | 'rule' | 'guide' | 'figma' | 'code' | 'text';
export type DraftStatus = 'draft' | 'published' | 'rejected' | 'discarded' | 'rolled_back';
export interface Draft {
  id: string;
  type: DraftType;
  target: string;
  title: string;
  // 초안 종류마다 모양이 다르다 (item: 바뀐 칸, rule: 규칙, guide: GuideDoc, figma: 컴포넌트)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  after: any;
  lines: string[];
  bump: Bump;
  status: DraftStatus;
  at: string;
  by: Role;
  log: { at: string; by: Role; text: string }[];
  isNew?: boolean;
  key?: string;
  code?: string;
  version?: string;
  source?: { url: string; mode: string };
}
export interface PortalComp {
  key: string;
  name: string;
  description: string;
  figma: ComponentData['figma'];
  props: { name: string; type: string; default: unknown; options?: string[] }[];
  variants: { nodeId: string; key: string; props: Record<string, string> }[];
  tokens: unknown[];
  syncedAt?: string;
  portalOnly?: boolean;
}
interface Pub {
  items: Record<string, Partial<Item>>;
  added: Item[];
  rules: Record<string, Rule | null>;
  addedRules: Rule[];
  guides: Record<string, GuideDoc>;
  comps: Record<string, Partial<PortalComp> & { description?: string; syncedAt?: string }>;
  /** 게시된 React 컴포넌트 코드 (컴포넌트 key → TSX). 없으면 저장소 코드 */
  code: Record<string, string>;
  /** 게시된 글 수정 (컴포넌트 key → 글 자리 → 글). 페이지에서 바로 고친 설명 */
  texts: Record<string, Record<string, string>>;
}
export interface HistoryNote {
  id?: string;
  title: string;
  bump?: Bump;
  lines?: string[];
  impact?: string;
}
export interface HistoryEntry {
  version: string;
  from?: string;
  at: string;
  mode: string;
  by: Role;
  bump?: Bump;
  reason?: string;
  prevPub?: Pub;
  notes: HistoryNote[];
}
interface State {
  v: 2;
  version: string;
  pub: Pub;
  drafts: Draft[];
  promotions: Promotion[];
  detections: Detection[];
  history: HistoryEntry[];
  seq: { draft: number };
}
interface Base {
  catalog: Catalog;
  comps: Record<string, ComponentData>;
  guides: Record<string, Policy>;
}

let base: Base;
let S: State;
let rev = 0;
const listeners = new Set<() => void>();
const now = () => new Date().toISOString();
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const BUMPS: Bump[] = ['PATCH', 'MINOR', 'MAJOR'];
const maxBump = (L: Bump[]) => BUMPS[Math.max(...L.map((b) => BUMPS.indexOf(b)))];
export function bumpVersion(v: string, b: Bump) {
  const [a, m, p] = v.split('.').map(Number);
  return b === 'MAJOR' ? `${a + 1}.0.0` : b === 'MINOR' ? `${a}.${m + 1}.0` : `${a}.${m}.${p + 1}`;
}

function fresh(): State {
  return {
    v: 2,
    version: base.catalog.meta.version,
    pub: { items: {}, added: [], rules: {}, addedRules: [], guides: {}, comps: {}, code: {}, texts: {} },
    drafts: [],
    promotions: clone(base.catalog.promotions),
    detections: clone(base.catalog.detections),
    history: [{ version: base.catalog.meta.version, at: now(), mode: '구축', by: 'approver', notes: [{ title: 'SB Studio 포털 카탈로그 0.5 · 저장소 컴포넌트 · UX표준가이드 1.2 이관' }] }],
    seq: { draft: 1 },
  };
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {
    /* 저장 못 해도 이번 화면에서는 동작 */
  }
  rev++;
  listeners.forEach((l) => l());
}

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const revision = () => rev;

export function init(b: Base) {
  base = b;
  try {
    S = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    S = null as unknown as State;
  }
  if (!S || S.v !== 2) {
    S = fresh();
    save();
  }
  S.pub.code ||= {}; // 코드 편집 전에 저장된 상태
  S.pub.texts ||= {};
}
export function reset() {
  S = fresh();
  save();
}
export const version = () => S.version;
export const history = () => S.history;
export const drafts = (pred: (d: Draft) => boolean = () => true) => S.drafts.filter(pred);
export const openDraft = (type: DraftType, target: string | undefined) => S.drafts.find((d) => d.status === 'draft' && d.type === type && d.target === target) || null;

// ---------- 게시본 ----------

const firstSentence = (s: string) => String(s || '').split(/(?<=[.다])\s/)[0].slice(0, 80);

/** 카탈로그 항목: SB Studio 카탈로그 + 저장소에만 있는 컴포넌트(c-<key>) + 게시된 수정 · 추가 */
export function items(): Item[] {
  const L = clone(base.catalog.items);
  const linked = new Set(L.map((i) => i.key).filter(Boolean));
  for (const [key, c] of Object.entries(base.comps)) {
    if (linked.has(key)) continue;
    const variant = (c.props || []).filter((p) => p.type === 'variant' && p.name !== 'state').map((p) => p.options!.join(' · ')).join(' / ');
    L.push({ code: `c-${key}`, kind: 'comp', name: c.name, status: 'pub', design: true, ux: !!base.guides[key], meaning: firstSentence(c.description), variants: variant || '-', key });
  }
  for (const a of S.pub.added) L.push(clone(a));
  return L.map((i) => (S.pub.items[i.code] ? { ...i, ...S.pub.items[i.code] } : i));
}
export const item = (code: string) => items().find((i) => i.code === code) || null;
export const itemByKey = (key: string) => items().find((i) => i.key === key) || null;
export const slots = () => base.catalog.slots;
export const slot = (path: string) => base.catalog.slots.find((s) => s.path === path) || null;
export const parts = () => base.catalog.parts;
export const catalogMeta = () => base.catalog.meta;

export function rules(): Rule[] {
  // 포털 규칙(카탈로그) + UX 패턴 가이드의 Do/Don't(권장 · 금지)
  const L = [...base.catalog.rules, ...guideRules].filter((r) => S.pub.rules[r.id] !== null).map((r) => (S.pub.rules[r.id] ? { ...r, ...S.pub.rules[r.id] } : r));
  return L.concat(S.pub.addedRules.map(clone));
}
export const rulesFor = (code: string) => rules().filter((r) => r.targets.includes(code));

/** 컴포넌트 사용 가이드 규칙: 저장소 정책을 UX-<KEY>-NN으로 번호 매김, 게시된 편집이 있으면 그것 */
export function guide(key: string): GuideDoc | null {
  if (S.pub.guides[key]) return clone(S.pub.guides[key]);
  const pl = base.guides[key];
  if (!pl) return null;
  const P = key.toUpperCase();
  let n = 0;
  const id = () => `UX-${P}-${String(++n).padStart(2, '0')}`;
  const text = (t: string | { text: string }) => (typeof t === 'string' ? t : t.text);
  const rows: GuideRule[] = [
    ...(pl.rules || []).map((r) => ({ id: id(), kind: 'rule' as const, text: `${r.name}: ${r.desc}`, from: r.from })),
    ...(pl.do || []).map((t) => ({ id: id(), kind: 'do' as const, text: text(t) })),
    ...(pl.dont || []).map((t) => ({ id: id(), kind: 'dont' as const, text: text(t) })),
  ];
  return { lead: pl.lead || '', rules: rows, next: n + 1 };
}

/** 저장소 컴포넌트에 게시된 변경(설명)을 덮은 것. 포털에서 새로 게시한 컴포넌트도 */
export function comp(key: string): (ComponentData & { figmaSyncedAt?: string }) | (PortalComp & { portalOnly: true }) | null {
  const p = S.pub.comps[key];
  if (base.comps[key]) return p ? { ...base.comps[key], description: p.description ?? base.comps[key].description, figmaSyncedAt: p.syncedAt } : base.comps[key];
  return p ? ({ ...p, portalOnly: true } as PortalComp & { portalOnly: true }) : null;
}
export const isRepoComp = (key: string) => !!base.comps[key];
export const newComps = () => Object.values(S.pub.comps).filter((c) => !base.comps[c.key!]) as PortalComp[];
export const promotions = () => S.promotions;
export const detections = () => S.detections;

// ---------- 초안 ----------

function upsertDraft(d: Omit<Draft, 'id' | 'status' | 'at' | 'by' | 'log'>, role: Role): Draft {
  const cur = openDraft(d.type, d.target);
  if (cur) {
    Object.assign(cur, d, { at: now(), by: role });
    cur.log.push({ at: now(), by: role, text: '초안 수정' });
    save();
    return cur;
  }
  const nd: Draft = { id: `DR-${String(S.seq.draft++).padStart(4, '0')}`, status: 'draft', at: now(), by: role, log: [{ at: now(), by: role, text: '초안 저장' }], ...d };
  S.drafts.unshift(nd);
  save();
  return nd;
}

function must(role: Role, type: EditType) {
  if (role !== EDITOR[type]) throw new Error(`${ROLES[EDITOR[type]]}만 고칠 수 있습니다`);
}

const ITEM_LABEL: Record<string, string> = { name: '이름', meaning: '뜻', variants: '변형', slot: '놓이는 빈칸', status: '상태' };

/** 카탈로그 항목(이름 · 뜻 · 변형/빈칸 · 상태) 수정 */
export function draftItem(role: Role, code: string, fields: Partial<Item>) {
  const cur = item(code);
  if (!cur) throw new Error(`${code}가 없습니다`);
  must(role, cur.kind);
  const lines: string[] = [];
  let bump: Bump = 'PATCH';
  for (const [k, v] of Object.entries(fields) as [keyof Item, string][]) {
    if ((cur[k] ?? '') === v) continue;
    lines.push(`${ITEM_LABEL[k] || k}: ${cur[k] ?? '-'} → ${v}`);
    if (k === 'status' || k === 'slot') bump = 'MAJOR';
    else if (k === 'variants') bump = String(cur[k] || '').split(/\s*·\s*/).every((x) => String(v).includes(x)) ? (bump === 'MAJOR' ? bump : 'MINOR') : 'MAJOR';
  }
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'item', target: code, title: `${cur.name} 수정`, after: fields, lines, bump }, role);
}

/** 규칙 메타 DB: 수정 · 추가(id 없음) · 삭제 */
export function draftRule(role: Role, id: string | null, fields: Partial<Rule> & { prefix?: string }, remove = false) {
  must(role, 'rule');
  if (!id) {
    const prefix = fields.prefix || 'R-XX';
    const used = rules().map((r) => r.id).filter((x) => x.startsWith(prefix + '-')).map((x) => Number(x.split('-').pop()) || 0);
    const pend = S.drafts.filter((d) => d.status === 'draft' && d.type === 'rule' && d.target.startsWith(prefix + '-')).map((d) => Number(d.target.split('-').pop()) || 0);
    const nid = `${prefix}-${String(Math.max(0, ...used, ...pend) + 1).padStart(2, '0')}`;
    const after = { id: nid, doc: fields.doc, section: fields.section, kind: fields.kind, text: fields.text, targets: fields.targets };
    return upsertDraft({ type: 'rule', target: nid, title: `${nid} 규칙 추가`, after, isNew: true, lines: [`규칙 추가: ${fields.text}`], bump: 'MINOR' }, role);
  }
  const cur = rules().find((r) => r.id === id);
  if (!cur) throw new Error(`${id}가 없습니다`);
  if (remove) return upsertDraft({ type: 'rule', target: id, title: `${id} 규칙 삭제`, after: null, lines: [`규칙 삭제: ${cur.text}`], bump: 'MAJOR' }, role);
  const lines: string[] = [];
  const label: Record<string, string> = { kind: '종류', section: '절', text: '내용' };
  for (const k of ['kind', 'section', 'text'] as const) if (fields[k] !== undefined && fields[k] !== cur[k]) lines.push(`${label[k]}: ${cur[k]} → ${fields[k]}`);
  if (fields.targets && fields.targets.join(',') !== cur.targets.join(',')) lines.push(`대상: ${cur.targets.join(', ')} → ${fields.targets.join(', ')}`);
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'rule', target: id, title: `${id} 규칙 수정`, after: { ...cur, ...fields }, lines, bump: 'MAJOR' }, role);
}

/** 컴포넌트 사용 가이드(정책 요약 · 규칙) 편집. 새 규칙은 다음 번호를 받고, 번호는 고쳐도 그대로 */
export function draftGuide(role: Role, key: string, { lead, rules: rows, add }: { lead?: string; rules?: GuideRule[]; add?: { kind: GuideRule['kind']; text: string }[] }) {
  must(role, 'guide');
  const cur: GuideDoc | null = openDraft('guide', key)?.after || guide(key);
  if (!cur) throw new Error('사용 가이드가 없는 컴포넌트입니다');
  const before = guide(key)!;
  const next: GuideDoc = { lead: lead ?? cur.lead, rules: clone(rows ?? cur.rules).filter((r) => !r.remove), next: cur.next };
  for (const a of add || []) {
    if (!a.text?.trim()) continue;
    next.rules.push({ id: `UX-${key.toUpperCase()}-${String(next.next++).padStart(2, '0')}`, kind: a.kind, text: a.text.trim() });
  }
  const bi = Object.fromEntries(before.rules.map((r) => [r.id, r]));
  const ni = Object.fromEntries(next.rules.map((r) => [r.id, r]));
  const lines: string[] = [];
  let bump: Bump = 'PATCH';
  const up = (b: Bump) => {
    if (BUMPS.indexOf(b) > BUMPS.indexOf(bump)) bump = b;
  };
  for (const id of Object.keys(bi)) if (!ni[id]) (lines.push(`규칙 삭제: ${id}`), up('MAJOR'));
  for (const id of Object.keys(ni)) if (!bi[id]) (lines.push(`규칙 추가: ${id} (${ni[id].kind})`), up('MINOR'));
  for (const id of Object.keys(ni)) if (bi[id] && (bi[id].text !== ni[id].text || bi[id].kind !== ni[id].kind)) (lines.push(`규칙 수정: ${id}`), up('MAJOR'));
  if (before.lead !== next.lead) lines.push('정책 요약 수정');
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'guide', target: key, title: `${key} 사용 가이드 수정`, after: next, lines, bump }, role);
}

const portalShape = (key: string, c: ComponentData): PortalComp => ({
  key,
  name: c.name,
  description: c.description || '',
  figma: c.figma,
  props: (c.props || []).map((p) => ({ name: p.name, type: p.type, default: p.default, ...(p.options ? { options: p.options } : {}) })),
  variants: (c.variants || []).map((v) => ({ nodeId: v.nodeId, key: v.key, props: v.props })),
  tokens: [],
});

/** Figma 노드 주소로 다시 읽기(key) 또는 새 컴포넌트 읽기(key 없음, code로 카탈로그 항목에 연결) */
export async function draftFigma(role: Role, { key, code, url }: { key?: string; code?: string | null; url: string }) {
  must(role, 'figma');
  const released: { components: Record<string, unknown> } = { components: Object.fromEntries(Object.entries(base.comps).map(([k, c]) => [k, portalShape(k, c)])) };
  for (const c of newComps()) released.components[c.key] = c;
  const conv = await convertFromUrl(url, { expect: 'component', released });
  const r = conv.result;
  if (r.kind !== 'component') throw new Error('컴포넌트 노드가 아닙니다');
  const k = key || r.key;
  const prev = key ? released.components[key] : released.components[k] || null;
  if (!key && prev) throw new Error(`${k}는 이미 있는 컴포넌트입니다. 그 컴포넌트 페이지에서 다시 읽어 주세요`);
  const after: Record<string, unknown> = { ...r, key: k };
  delete after.kind;
  const diff = diffComponent(prev, after);
  if (key && diff.lines.length === 1 && diff.lines[0] === '바뀐 점 없음') throw new Error(`Figma 노드와 게시본이 같습니다 · 바뀐 점 없음 (${conv.mode === 'mock' ? '흉내 모드' : 'Figma API'})`);
  const target = key ? k : code || `c-${k}`;
  return upsertDraft({ type: 'figma', target: key ? k : target, key: k, code: key ? itemByKey(k)?.code : target, title: key ? `${k} Figma 다시 읽기` : `${r.name} 추가 (Figma)`, after, isNew: !key, source: { url, mode: conv.mode }, lines: diff.lines, bump: diff.bump }, role);
}

/** 게시된 컴포넌트 코드 (없으면 null = 저장소 코드) */
export const publishedCode = (key: string): string | null => S.pub.code?.[key] ?? null;

const propsBlock = (src: string) => (src.match(/export interface \w+Props[\s\S]*?\n}/) || [''])[0];
/** 줄 단위로 더한 줄 · 뺀 줄 수 */
function lineDiff(a: string, b: string) {
  const count = (L: string[]) => L.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map<string, number>());
  const A = count(a.split('\n'));
  const B = count(b.split('\n'));
  let add = 0;
  let del = 0;
  for (const [l, n] of B) add += Math.max(0, n - (A.get(l) || 0));
  for (const [l, n] of A) del += Math.max(0, n - (B.get(l) || 0));
  return { add, del };
}

/** 컴포넌트 React 코드 편집 (디자인 시스템 담당). repo면 저장소 코드로 되돌리는 초안 */
export function draftCode(role: Role, key: string, file: string, source: string, repoSource: string) {
  must(role, 'code');
  const before = publishedCode(key) ?? repoSource;
  if (before === source) throw new Error('바뀐 내용이 없습니다');
  const repo = source === repoSource;
  const { add, del } = lineDiff(before, source);
  const propsChanged = propsBlock(before) !== propsBlock(source);
  const lines = [repo ? `저장소 코드로 되돌리기 (${file})` : `${file} 수정 · +${add}줄 −${del}줄`];
  if (propsChanged) lines.push('속성(Props) 정의가 바뀜 · 이 컴포넌트를 쓰는 화면 확인 필요');
  return upsertDraft({ type: 'code', target: key, key, title: `${file.split('/').pop()} 코드 수정`, after: { source, repo }, lines, bump: propsChanged ? 'MAJOR' : 'PATCH' }, role);
}

/** 게시된 글 수정 (글 자리 → 글) */
export const publishedTexts = (key: string): Record<string, string> => S.pub.texts?.[key] || {};

/** 페이지에서 바로 고친 글 하나. 같은 컴포넌트의 글 수정은 초안 하나에 모은다 */
export function draftText(role: Role, key: string, name: string, path: string, label: string, before: string, value: string) {
  must(role, 'text');
  const cur = openDraft('text', key);
  const fields: Record<string, string> = { ...(cur?.after.fields || {}), [path]: value };
  const labels: Record<string, string> = { ...(cur?.after.labels || {}), [path]: label };
  const original: Record<string, string> = { ...(cur?.after.original || {}), [path]: cur?.after.original?.[path] ?? before };
  // 처음 글로 되돌린 자리는 초안에서 뺀다
  for (const p of Object.keys(fields)) if (fields[p] === original[p]) (delete fields[p], delete labels[p], delete original[p]);
  if (!Object.keys(fields).length) {
    if (cur) {
      cur.status = 'discarded';
      cur.log.push({ at: now(), by: role, text: '고친 글을 모두 되돌림' });
      save();
    }
    throw new Error('처음 글과 같아 초안을 지웠습니다');
  }
  const cut = (t: string) => (t.length > 24 ? `${t.slice(0, 24)}…` : t);
  const lines = Object.keys(fields).map((p) => `${labels[p]}: ${cut(original[p])} → ${cut(fields[p])}`);
  return upsertDraft({ type: 'text', target: key, key, title: `${name} 설명 수정`, after: { fields, labels, original }, lines, bump: 'PATCH' }, role);
}

export function discard(role: Role, id: string) {
  const d = S.drafts.find((x) => x.id === id);
  if (!d || d.status !== 'draft') throw new Error('초안이 아닙니다');
  if (role !== d.by && role !== 'approver') throw new Error('초안을 만든 담당이나 포털 승인 담당만 버릴 수 있습니다');
  d.status = role === 'approver' ? 'rejected' : 'discarded';
  d.log.push({ at: now(), by: role, text: role === 'approver' ? '반려' : '초안 버림' });
  save();
  return d;
}

// ---------- 게시 · 롤백 (포털 승인 담당) ----------

function apply(d: Draft) {
  const P = S.pub;
  if (d.type === 'item') {
    const isAdded = P.added.find((a) => a.code === d.target);
    if (isAdded) Object.assign(isAdded, d.after);
    else P.items[d.target] = { ...(P.items[d.target] || {}), ...d.after };
  } else if (d.type === 'rule') {
    const added = P.addedRules.findIndex((r) => r.id === d.target);
    if (d.isNew) P.addedRules.push(d.after);
    else if (added >= 0) {
      if (d.after) P.addedRules[added] = d.after;
      else P.addedRules.splice(added, 1);
    } else P.rules[d.target] = d.after ? { ...d.after } : null;
  } else if (d.type === 'guide') P.guides[d.target] = d.after;
  else if (d.type === 'text') P.texts[d.target] = { ...(P.texts[d.target] || {}), ...d.after.fields };
  else if (d.type === 'code') {
    if (d.after.repo) delete P.code[d.target];
    else P.code[d.target] = d.after.source;
  }
  else if (d.type === 'figma') {
    const key = d.key!;
    if (d.isNew) {
      P.comps[key] = { ...d.after, syncedAt: now() };
      const code = d.code!;
      const exists = item(code);
      const variants = (d.after.props as PortalComp['props']).filter((p) => p.type === 'variant' && p.name !== 'state').map((p) => p.options!.join(' · ')).join(' / ') || '-';
      if (exists) P.items[code] = { ...(P.items[code] || {}), key, design: true, status: 'pub', variants };
      else P.added.push({ code, kind: 'comp', name: d.after.name, status: 'pub', design: true, ux: false, meaning: d.after.description, variants, key });
    } else P.comps[key] = { ...(P.comps[key] || {}), description: d.after.description, syncedAt: now() };
  }
}

export function publish(role: Role, ids: string[], reason?: string) {
  if (role !== 'approver') throw new Error('게시는 포털 승인 담당이 합니다');
  const L = S.drafts.filter((d) => d.status === 'draft' && ids.includes(d.id));
  if (!L.length) throw new Error('게시할 초안을 고르세요');
  const prevPub = clone(S.pub);
  const bump = maxBump(L.map((d) => d.bump));
  const from = S.version;
  S.version = bumpVersion(from, bump);
  for (const d of L) {
    apply(d);
    d.status = 'published';
    d.version = S.version;
    d.log.push({ at: now(), by: role, text: `게시 → ${S.version}` });
  }
  S.history.unshift({ version: S.version, from, at: now(), mode: '게시', by: role, bump, reason: reason || '', prevPub, notes: L.map((d) => ({ id: d.id, title: d.title, bump: d.bump, lines: d.lines, impact: d.bump === 'MAJOR' ? '이미 만든 SB 재검수' : '영향 없음' })) });
  save();
  return S.history[0];
}

export function rollback(role: Role, reason?: string) {
  if (role !== 'approver') throw new Error('롤백은 포털 승인 담당이 합니다');
  const last = S.history[0];
  if (!last.prevPub) throw new Error('되돌릴 게시가 없습니다');
  S.pub = clone(last.prevPub);
  for (const n of last.notes || []) {
    const d = S.drafts.find((x) => x.id === n.id);
    if (d) {
      d.status = 'rolled_back';
      d.log.push({ at: now(), by: role, text: `${last.version} 롤백` });
    }
  }
  S.history.unshift({ version: last.from!, from: last.version, at: now(), mode: '롤백', by: role, reason: reason || '', notes: [] });
  S.version = last.from!;
  save();
  return S.history[0];
}

// ---------- 승격 요청 ----------

export function promote(role: Role, idx: number, ok: boolean, extra: { note?: string; url?: string } = {}) {
  const p = S.promotions[idx];
  if (!p || p.status !== '대기') throw new Error('대기 중인 승격 요청이 아닙니다');
  const st = PROMO_STAGES.find((x) => x.stage === p.stage);
  if (!st) throw new Error('알 수 없는 심사 단계입니다');
  if (role !== st.who) throw new Error(`${p.stage}은(는) ${ROLES[st.who]}가 합니다`);
  p.log = p.log || [];
  if (!ok) {
    p.status = '반려';
    p.log.push({ at: now(), by: role, text: `${p.stage}에서 반려 ${extra.note || ''}` });
    save();
    return p;
  }
  p.log.push({ at: now(), by: role, text: `${st.act}${extra.url ? ` (${extra.url})` : ''}` });
  if (extra.url) p.figma = extra.url;
  const i = PROMO_STAGES.indexOf(st);
  if (i < PROMO_STAGES.length - 1) p.stage = PROMO_STAGES[i + 1].stage;
  else {
    // 최종 승인: 코드 앞자리만 바꿔 정식 부품으로 (tb- → b-, tc- → c-), 바로 게시
    const code = p.code.replace(/^tb-/, 'b-').replace(/^tc-/, 'c-');
    const prevPub = clone(S.pub);
    S.pub.added.push({ code, kind: code.startsWith('b-') ? 'block' : 'comp', name: p.name, status: 'pub', design: !!p.figma, ux: true, meaning: `${p.judge} · ${p.from}에서 승격`, variants: '-', slot: '-', promotedFrom: p.code });
    const from = S.version;
    S.version = bumpVersion(from, 'MINOR');
    p.stage = '완료';
    p.status = '승인';
    p.code = `${p.code} → ${code}`;
    S.history.unshift({ version: S.version, from, at: now(), mode: '승격', by: role, bump: 'MINOR', prevPub, notes: [{ id: p.id, title: `${p.name} 승격 (${code})`, bump: 'MINOR', lines: [p.judge], impact: '영향 없음' }] });
  }
  save();
  return p;
}

export function addPromotion(role: Role, f: { code: string; name: string; from?: string; judge?: string }) {
  if (role !== 'ux' && role !== 'approver') throw new Error('승격 요청 등록은 UX 가이드 담당이 합니다');
  const n = S.promotions.length + 12;
  S.promotions.unshift({ id: `PR-${String(n + 1).padStart(4, '0')}`, code: f.code, name: f.name, from: f.from || '-', judge: f.judge || '-', stage: '구조 확인', status: '대기', log: [{ at: now(), by: role, text: '등록' }] });
  save();
  return S.promotions[0];
}

// ---------- 변경 감지 처리 ----------

export function handleDetection(role: Role, idx: number, action: string) {
  const d = S.detections[idx];
  if (!d) throw new Error('없는 항목입니다');
  if (role === 'viewer') throw new Error('담당자만 처리합니다');
  d.action = action;
  d.by = role;
  save();
  return d;
}
