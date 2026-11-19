// BSS 디자인 포털 상태: 게시본(카탈로그 · 규칙 · 가이드 · 컴포넌트 · 코드 · 토큰) + 초안 + 요청 + 승격 + 버전.
// 담당자가 고치면 초안 → 미리보기 확인 → 배포 요청 → 관리자가 운영 서버에 배포(정기 · 수동)하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀐다.
// 저장은 이 브라우저의 localStorage (POC). 게시본 = 저장소 JSON(기준) + 게시된 변경(pub).
// 바뀔 때마다 subscribe한 화면(useSyncExternalStore)이 다시 그려진다.
import { convertFromUrl, diffComponent } from './portal-core.js';
import type { ComponentData } from '../../ds/figma/types';
import type { Policy } from '../data';
import { guideRules } from '../guide';

const KEY = 'bss-design-portal.v2';
const VER_KEY = 'bss-design-portal.data-version';
let wiped = false;
/** 이번에 열 때 새 기준 데이터라 이전 기록을 지웠는지 */
export const wasWiped = () => wiped;
export const dataVersion = () => __DATA_VERSION__;
export type Role = 'viewer' | 'ux' | 'ds' | 'approver';
// 역할은 BSS SB Studio 계정에서 받는다 (POC는 오른쪽 위에서 고름)
export const ROLES: Record<Role, string> = { viewer: '보기', ux: 'UX 담당자', ds: 'DS 담당자', approver: '관리자' };
export type Kind = 'layout' | 'block' | 'comp';
export const KIND: Record<Kind, string> = { layout: '레이아웃 규칙', block: '블록', comp: '컴포넌트' };
export type Status = 'pub' | 'draft' | 'tmp';
export const STATUS: Record<Status, string> = { pub: '게시', draft: '초안', tmp: '임시' };
// 승격: 여러 Storyboard에서 쓰인 SB 블록 → 2단 심사(SB팀 표준 → UI팀 디자인) → 관리자 배포로 공통 블록
export const PROMO_STAGES: { stage: string; who: Role; act: string }[] = [
  { stage: 'SB팀 표준', who: 'ux', act: '표준 확인 통과' },
  { stage: 'UI팀 디자인', who: 'ds', act: '디자인 · Figma 등록' },
  { stage: '배포', who: 'approver', act: '공통 블록으로 배포' },
];
// 디자인 요청(케이스 1 · 4): 요청 → DS 담당자 작업 → 미리보기 확인 → 완료
export type ReqKind = 'icon' | 'comp' | 'block' | 'token';
export const REQ_KINDS: Record<ReqKind, string> = { icon: '아이콘 제작', comp: '컴포넌트 수정', block: '공통 블록 수정', token: '토큰 추가 · 수정' };
export const REQ_STAGES = ['요청됨', '디자인 작업', '미리보기 확인', '완료'] as const;
// 누가 무엇을 고치나: 토큰 · 컴포넌트 · 공통 블록 · Figma 변환은 DS 담당자, 레이아웃 규칙 · 규칙 · 사용 가이드 · SB 블록은 UX 담당자
export type EditType = Kind | 'sb' | 'figma' | 'code' | 'text' | 'rule' | 'guide' | 'token';
export const EDITOR: Record<EditType, Role> = { block: 'ds', comp: 'ds', figma: 'ds', code: 'ds', text: 'ds', token: 'ds', sb: 'ux', layout: 'ux', rule: 'ux', guide: 'ux' };
/** 여러 담당이 함께 고치는 것: 컴포넌트의 설명 · 사용 가이드(Do/Don't 포함) · 카탈로그 설명은 DS 담당자와 UX 담당자 모두 */
const SHARED: Partial<Record<EditType, Role[]>> = { comp: ['ds', 'ux'], text: ['ds', 'ux'], guide: ['ux', 'ds'] };
export const canEdit = (role: Role, type: EditType) => (SHARED[type] || [EDITOR[type]]).includes(role);
/** Blocks = 공통 블록 + SB 블록. SB 블록은 업무 구분(BSS · BO)으로 나눈다.
 *  SB 블록: SB Studio 미리보기에서 자동 생성(tb-)되거나 한 업무 시스템에만 쓰는 블록 → SB 설계 완료 시 게시 → 여러 업무에서 쓰이면 승격 */
export type SbDomain = 'BSS' | 'BO';
export const SB_DOMAINS: SbDomain[] = ['BSS', 'BO'];
/** 업무 전용 블록 (코드 → 업무 구분). tb- 블록은 따로 정하지 않으면 BSS */
const SB_DOMAIN: Record<string, SbDomain> = { 'b-gnb': 'BSS', 'b-lnb': 'BSS' };
export const sbDomain = (i: { kind: string; code: string; domain?: SbDomain }): SbDomain | null => (i.kind !== 'block' ? null : SB_DOMAIN[i.code] || (/^tb-/.test(i.code) ? i.domain || 'BSS' : null));
export const isSb = (i: { kind: string; code: string }) => !!sbDomain(i);
/** 이 항목을 고치는 권한 종류 (SB 블록은 UX 담당자) */
export const editKind = (i: { kind: Kind; code: string }): EditType => (isSb(i) ? 'sb' : i.kind);

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
  /** 컴포넌트 묶음 (내비게이션 · 버튼 · 입력 …) */
  group?: string;
  /** SB 블록의 업무 구분 */
  domain?: SbDomain;
  /** 블록 정책 (scripts/build_block_policy.py가 UX 패턴 가이드 모듈 문서에서 만든 초안) */
  policy?: { use: string[]; avoid: { text: string; alt: string }[]; do: string[]; dont: string[]; sources: string[] };
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
  meta: { catalog: string; uxGuide: string; tokens: string; version: string; source: string; compGroups?: string[] };
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
export type DraftType = 'item' | 'rule' | 'guide' | 'figma' | 'code' | 'text' | 'token';
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
  /** 담당자가 미리보기로 확인하고 배포 요청함 */
  requested?: boolean;
}
export interface Request {
  id: string;
  kind: ReqKind;
  title: string;
  detail: string;
  by: Role;
  stage: (typeof REQ_STAGES)[number];
  /** 아이콘: AI 더미로 기획 계속 중 */
  dummy?: boolean;
  notified?: boolean;
  log: { at: string; by: Role; text: string }[];
}
export interface Token {
  figma: string;
  collection: 'Primitive' | 'Semantic' | 'Component';
  type: string;
  value: string;
  ref: string | null;
  key?: string;
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
  /** 게시된 토큰 추가 · 수정(null = 삭제), CSS 변수 이름 → 토큰 */
  tokens: Record<string, Token | null>;
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
  requests: Request[];
  seq: { draft: number; req: number; preview: number };
}
interface Base {
  catalog: Catalog;
  comps: Record<string, ComponentData>;
  guides: Record<string, Policy>;
  /** 기준 토큰 (tokens/variables.json, Figma 변수) */
  tokens: Record<string, Token>;
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
    pub: { items: {}, added: [], rules: {}, addedRules: [], guides: {}, comps: {}, code: {}, texts: {}, tokens: {} },
    drafts: [],
    promotions: clone(base.catalog.promotions),
    detections: clone(base.catalog.detections),
    history: [{ version: base.catalog.meta.version, at: now(), mode: '구축', by: 'approver', notes: [{ title: 'SB Studio 포털 카탈로그 0.5 · 저장소 컴포넌트 · UX 패턴 가이드 20261106 이관' }] }],
    requests: seedRequests(),
    seq: { draft: 1, req: 3, preview: 0 },
  };
}

// 시연용 요청 2건 (Storyboard 작성 중 발견)
function seedRequests(): Request[] {
  const t = now();
  return [
    { id: 'RQ-0001', kind: 'icon', title: 'export 아이콘', detail: '엑셀 내려받기 버튼 · 16px · SVC-02-001 조회 화면', by: 'viewer', stage: '디자인 작업', dummy: true, log: [{ at: t, by: 'viewer', text: '요청 (AI 더미로 기획 계속)' }, { at: t, by: 'ds', text: '디자인 작업 시작' }] },
    { id: 'RQ-0002', kind: 'comp', title: 'DateField 빠른 기간 버튼', detail: '오늘 · 1주 · 1개월 버튼을 변형으로 추가 · 부가서비스 가입 관리 SB', by: 'viewer', stage: '요청됨', log: [{ at: t, by: 'viewer', text: '요청' }] },
  ];
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
  // 새 기준 데이터로 배포되면 이전 초안 · 게시 기록을 지운다 (POC: 이력 없이 새로 시작)
  let ver = '';
  try {
    ver = localStorage.getItem(VER_KEY) || '';
  } catch {
    /* 읽지 못하면 그대로 */
  }
  if (S && ver !== __DATA_VERSION__) {
    S = null as unknown as State;
    wiped = true;
  }
  if (!S || S.v !== 2) {
    S = fresh();
    save();
  }
  try {
    localStorage.setItem(VER_KEY, __DATA_VERSION__);
  } catch {
    /* 저장 못 해도 이번 화면에서는 동작 */
  }
  S.pub.code ||= {}; // 코드 편집 전에 저장된 상태
  S.pub.texts ||= {};
  S.pub.tokens ||= {};
  S.requests ||= seedRequests();
  S.seq.req ||= 3;
  S.seq.preview ||= 0;
  // 예전 심사 단계 이름 → 2단 심사 이름
  const OLD: Record<string, string> = { '구조 확인': 'SB팀 표준', '모양 확인': 'UI팀 디자인', '최종 승인': '배포' };
  S.promotions.forEach((p) => {
    if (OLD[p.stage]) p.stage = OLD[p.stage];
  });
}
export function reset() {
  S = fresh();
  save();
}
export const version = () => S.version;
export const history = () => S.history;
export const drafts = (pred: (d: Draft) => boolean = () => true) => S.drafts.filter(pred);
export const draftById = (id: string) => S.drafts.find((d) => d.id === id) || null;
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
/** 아직 게시 전인 새 컴포넌트 (Figma 읽기 초안). 담당은 게시 전에 이 페이지에서 코드를 먼저 만든다 */
export function draftNewComp(key: string): (PortalComp & { portalOnly: true; draftId: string; code?: string }) | null {
  const d = S.drafts.find((x) => x.status === 'draft' && x.type === 'figma' && x.isNew && x.key === key);
  return d ? ({ ...(d.after as PortalComp), portalOnly: true, draftId: d.id, code: d.code } as PortalComp & { portalOnly: true; draftId: string; code?: string }) : null;
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
  if (!canEdit(role, type)) throw new Error(`${(SHARED[type] || [EDITOR[type]]).map((r) => ROLES[r]).join(' · ')}만 고칠 수 있습니다`);
}

const ITEM_LABEL: Record<string, string> = { name: '이름(제목)', meaning: '뜻', variants: '변형', slot: '놓이는 슬롯', status: '상태' };

/** 카탈로그 항목(이름 · 뜻 · 변형/슬롯 · 상태) 수정 */
export function draftItem(role: Role, code: string, fields: Partial<Item>) {
  const cur = item(code);
  if (!cur) throw new Error(`${code}가 없습니다`);
  must(role, editKind(cur));
  // 같은 항목의 열린 초안(예: 이름 · 뜻을 따로 고침)은 하나로 합친다
  fields = { ...(openDraft('item', code)?.after || {}), ...fields };
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
    return upsertDraft({ type: 'rule', target: nid, title: `규칙 추가 · ${fields.text}`, after, isNew: true, lines: [`규칙 추가: ${fields.text}`], bump: 'MINOR' }, role);
  }
  const cur = rules().find((r) => r.id === id);
  if (!cur) throw new Error(`${id}가 없습니다`);
  if (remove) return upsertDraft({ type: 'rule', target: id, title: `규칙 삭제 · ${cur.text}`, after: null, lines: [`규칙 삭제: ${cur.text}`], bump: 'MAJOR' }, role);
  const lines: string[] = [];
  const label: Record<string, string> = { kind: '종류', section: '절', text: '내용' };
  for (const k of ['kind', 'section', 'text'] as const) if (fields[k] !== undefined && fields[k] !== cur[k]) lines.push(`${label[k]}: ${cur[k]} → ${fields[k]}`);
  if (fields.targets && fields.targets.join(',') !== cur.targets.join(',')) lines.push(`대상: ${cur.targets.join(', ')} → ${fields.targets.join(', ')}`);
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'rule', target: id, title: `규칙 수정 · ${cur.text}`, after: { ...cur, ...fields }, lines, bump: 'MAJOR' }, role);
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
  const cut24 = (t: string) => (t.length > 24 ? `${t.slice(0, 24)}…` : t);
  for (const id of Object.keys(bi)) if (!ni[id]) (lines.push(`규칙 삭제: ${cut24(bi[id].text)}`), up('MAJOR'));
  for (const id of Object.keys(ni)) if (!bi[id]) (lines.push(`규칙 추가 (${ni[id].kind}): ${cut24(ni[id].text)}`), up('MINOR'));
  for (const id of Object.keys(ni)) if (bi[id] && (bi[id].text !== ni[id].text || bi[id].kind !== ni[id].kind)) (lines.push(`규칙 수정: ${cut24(bi[id].text)} → ${cut24(ni[id].text)}`), up('MAJOR'));
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
  // 카탈로그 코드는 자동: 같은 이름 · 같은 코드(c-<key>)의 빈 카탈로그 항목이 있으면 거기에 잇고, 없으면 새 코드
  const norm = (x: string) => String(x || '').toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  const match = code || items().find((i) => i.kind === 'comp' && !i.key && (i.code === `c-${k}` || norm(i.name) === norm(r.name) || norm(i.code.replace(/^c-/, '')) === norm(k)))?.code;
  const target = key ? k : match || `c-${k}`;
  return upsertDraft({ type: 'figma', target: key ? k : target, key: k, code: key ? itemByKey(k)?.code : target, title: key ? `${k} Figma 다시 읽기` : `${r.name} 추가 (Figma)`, after, isNew: !key, source: { url, mode: conv.mode }, lines: key ? diff.lines : [...diff.lines, match ? `카탈로그 ${match} ${itemsName(match)}에 연결` : `카탈로그에 ${target}로 새로 등록`], bump: diff.bump }, role);
}
const itemsName = (code: string) => items().find((i) => i.code === code)?.name || '';

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

/** 컴포넌트 React 코드 편집 (DS 담당자). repo면 저장소 코드로 되돌리는 초안 */
export function draftCode(role: Role, key: string, file: string, source: string, repoSource: string) {
  must(role, 'code');
  const before = publishedCode(key) ?? repoSource;
  if (before === source) throw new Error('바뀐 내용이 없습니다');
  const repo = source === repoSource;
  const { add, del } = lineDiff(before, source);
  const propsChanged = propsBlock(before) !== propsBlock(source);
  const lines = [repo && repoSource ? `저장소 코드로 되돌리기 (${file})` : !before ? `${file} 새로 만듦 · ${source.split('\n').length}줄` : `${file} 수정 · +${add}줄 −${del}줄`];
  if (propsChanged && before) lines.push('속성(Props) 정의가 바뀜 · 이 컴포넌트를 쓰는 화면 확인 필요');
  return upsertDraft({ type: 'code', target: key, key, title: `${file.split('/').pop()} ${before ? '코드 수정' : '새 코드'}`, after: { source, repo }, lines, bump: !before ? 'MINOR' : propsChanged ? 'MAJOR' : 'PATCH' }, role);
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

// ---------- 토큰 (DS 담당자) ----------
// 기준: tokens/variables.json(Figma 변수) + 게시된 추가 · 수정 · 삭제. 가리키는 토큰(ref)이 있으면 값은 그 토큰을 따라간다.

/** Figma 이름 → CSS 변수 이름 (color/bg/brand → --color-bg-brand, iconOnly → icon-only) */
export const cssName = (figma: string) => `--${String(figma).trim().replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9/._-]/g, '').replace(/[/.]+/g, '-')}`;

export function tokens(): Record<string, Token> {
  const T: Record<string, Token> = clone(base.tokens || {});
  for (const [css, t] of Object.entries(S.pub.tokens)) {
    if (t === null) delete T[css];
    else T[css] = { ...(T[css] || {}), ...t };
  }
  // 값 풀기: 가리키는 토큰의 값을 따라간다 (베이스 색이 바뀌면 역할 · 컴포넌트도 같이 바뀜)
  const resolve = (css: string, seen = new Set<string>()): string | undefined => {
    const t = T[css];
    if (!t || !t.ref || seen.has(css)) return t?.value;
    seen.add(css);
    return T[t.ref] ? resolve(t.ref, seen) : t.value;
  };
  for (const css of Object.keys(T)) T[css] = { ...T[css], value: resolve(css) ?? T[css].value };
  return T;
}

/** 토큰 추가 · 수정 · 삭제 초안. 추가는 MINOR, 기존 토큰 수정 · 삭제는 쓰는 부품이 바뀌어 MAJOR */
export function draftToken(role: Role, f: { figma: string; collection?: string; value?: string; ref?: string }, remove = false) {
  must(role, 'token');
  const T = tokens();
  const figma = String(f.figma || '').trim().replace(/^\/+|\/+$/g, '');
  if (!/^[a-zA-Z][\w./-]*$/.test(figma)) throw new Error('토큰 이름은 color/bg/brand/default처럼 영문 · 숫자 · / 로 씁니다');
  const css = cssName(figma);
  const cur = T[css] || null;
  if (remove) {
    if (!cur) throw new Error(`${figma} 토큰이 없습니다`);
    const users = Object.entries(T).filter(([, t]) => t.ref === css).map(([k]) => k);
    if (users.length) throw new Error(`이 토큰을 가리키는 토큰이 있어 지울 수 없습니다: ${users.slice(0, 3).join(', ')}${users.length > 3 ? ' …' : ''}`);
    return upsertDraft({ type: 'token', target: css, title: `${figma} 토큰 삭제`, after: null, lines: [`토큰 삭제: ${figma} (${cur.value})`], bump: 'MAJOR' }, role);
  }
  const collection = f.collection as Token['collection'];
  if (!['Primitive', 'Semantic', 'Component'].includes(collection)) throw new Error('단계를 고르세요');
  const refIn = (f.ref || '').trim();
  const refCss = refIn ? (refIn.startsWith('--') ? refIn : cssName(refIn)) : null;
  if (collection !== 'Primitive' && !refCss) throw new Error('역할 · 컴포넌트 토큰은 가리키는 토큰을 고릅니다 (값을 직접 넣지 않음)');
  if (refCss && !T[refCss]) throw new Error(`가리키는 토큰이 없습니다: ${refIn}`);
  if (refCss === css) throw new Error('자기 자신을 가리킬 수 없습니다');
  const type = refCss ? T[refCss].type : 'COLOR';
  const value = refCss ? T[refCss].value : String(f.value || '').trim();
  if (!refCss && !/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) && !Number.isFinite(Number(value))) throw new Error('값은 #RRGGBB 색이나 숫자로 넣습니다');
  const after: Token = { figma, collection, type: refCss ? type : /^#/.test(value) ? 'COLOR' : 'FLOAT', value, ref: refCss };
  const lines: string[] = [];
  if (!cur) lines.push(`토큰 추가: ${figma} = ${refCss ? `→ ${T[refCss].figma}` : value}`);
  else {
    if (cur.collection !== collection) lines.push(`단계: ${cur.collection} → ${collection}`);
    if ((cur.ref || null) !== after.ref) lines.push(`가리키는 토큰: ${cur.ref ? T[cur.ref]?.figma || cur.ref : '-'} → ${refCss ? T[refCss].figma : '-'}`);
    if (!refCss && cur.value !== value) lines.push(`값: ${cur.value} → ${value}`);
    if (!lines.length) throw new Error('바뀐 내용이 없습니다');
    const users = Object.values(T).filter((t) => t.ref === css).length;
    if (users) lines.push(`이 토큰을 가리키는 토큰 ${users}개도 함께 바뀜`);
  }
  return upsertDraft({ type: 'token', target: css, title: `${figma} 토큰 ${cur ? '수정' : '추가'}`, after, isNew: !cur, lines, bump: cur ? 'MAJOR' : 'MINOR' }, role);
}

// ---------- 요청 (내 요청 · 디자인 요청) ----------

export const requests = () => S.requests;

export function addRequest(role: Role, f: { kind: string; title: string; detail?: string }) {
  if (!(f.kind in REQ_KINDS)) throw new Error('요청 종류를 고르세요');
  if (!String(f.title || '').trim()) throw new Error('무엇이 필요한지 적어 주세요');
  const id = `RQ-${String(++S.seq.req).padStart(4, '0')}`;
  const kind = f.kind as ReqKind;
  S.requests.unshift({ id, kind, title: f.title.trim(), detail: (f.detail || '').trim(), by: role, stage: '요청됨', dummy: kind === 'icon', log: [{ at: now(), by: role, text: kind === 'icon' ? '요청 (AI 더미로 기획 계속)' : '요청' }] });
  save();
  return S.requests[0];
}

/** DS 담당자가 요청을 다음 단계로. 아이콘이 완료되면 더미를 교체하고 요청자에게 알린다 */
export function advanceRequest(role: Role, id: string) {
  if (role !== 'ds') throw new Error('DS 담당자가 처리합니다');
  const r = S.requests.find((x) => x.id === id);
  if (!r) throw new Error('없는 요청입니다');
  const i = REQ_STAGES.indexOf(r.stage);
  if (i >= REQ_STAGES.length - 1) throw new Error('이미 완료된 요청입니다');
  r.stage = REQ_STAGES[i + 1];
  r.log.push({ at: now(), by: role, text: r.stage });
  if (r.stage === '완료' && r.dummy) {
    r.dummy = false;
    r.notified = true;
    r.log.push({ at: now(), by: role, text: '더미 아이콘 교체 · 요청자에게 알림' });
  }
  save();
  return r;
}

// ---------- 내 변경 → 배포 요청 ----------

/** 미리보기로 확인한 초안을 관리자에게 배포 요청 (초안을 만든 담당자) */
export function requestDeploy(role: Role, id: string) {
  const d = S.drafts.find((x) => x.id === id);
  if (!d || d.status !== 'draft') throw new Error('초안이 아닙니다');
  if (d.by !== role) throw new Error('초안을 만든 담당자가 배포 요청합니다');
  if (d.requested) throw new Error('이미 배포 요청한 초안입니다');
  d.requested = true;
  S.seq.preview++;
  d.log.push({ at: now(), by: role, text: '미리보기 확인 · 배포 요청' });
  save();
  return d;
}

/** 다음 배포 버전의 미리보기 표기 (예: 1.4.0-preview.3) */
export function previewVersion() {
  const L = S.drafts.filter((d) => d.status === 'draft' && d.requested);
  if (!L.length) return null;
  return `${bumpVersion(S.version, maxBump(L.map((d) => d.bump)))}-preview.${S.seq.preview}`;
}

export interface RecheckRow {
  version: string;
  at: string;
  target: string;
  change: string;
  impact: string;
  source: string;
  action?: string;
  idx?: number;
}
/** 재검수 대상: MAJOR로 배포된 변경과 변경 감지에서 SB에 영향이 있는 것 */
export function recheck(): RecheckRow[] {
  const fromHistory = S.history
    .filter((h) => h.bump === 'MAJOR')
    .flatMap((h) => (h.notes || []).filter((n) => n.bump === 'MAJOR').map((n) => ({ version: h.version, at: h.at, target: n.title, change: (n.lines || []).join(' · '), impact: '이 버전 이전에 만든 SB', source: '배포' })));
  const fromDetect = S.detections.map((d, idx) => ({ d, idx })).filter(({ d }) => d.impact && !/영향 없음/.test(d.impact)).map(({ d, idx }) => ({ version: '-', at: d.at, target: d.target, change: d.change, impact: d.impact, source: d.file, action: d.action, idx }));
  return [...fromHistory, ...fromDetect];
}

export function discard(role: Role, id: string) {
  const d = S.drafts.find((x) => x.id === id);
  if (!d || d.status !== 'draft') throw new Error('초안이 아닙니다');
  if (role !== d.by && role !== 'approver') throw new Error('초안을 만든 담당자나 관리자만 버릴 수 있습니다');
  d.status = role === 'approver' ? 'rejected' : 'discarded';
  d.log.push({ at: now(), by: role, text: role === 'approver' ? '반려' : '초안 버림' });
  save();
  return d;
}

// ---------- 운영 서버 배포 · 롤백 (관리자) ----------

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
  else if (d.type === 'token') P.tokens[d.target] = d.after ? { ...d.after } : null;
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

export function publish(role: Role, ids: string[], reason?: string, mode: '정기' | '수동' = '정기') {
  if (role !== 'approver') throw new Error('배포는 관리자가 합니다');
  const L = S.drafts.filter((d) => d.status === 'draft' && d.requested && ids.includes(d.id));
  if (!L.length) throw new Error('배포할 요청을 고르세요 (담당자가 배포 요청한 초안만 배포됩니다)');
  if (mode === '수동' && !String(reason || '').trim()) throw new Error('수동 배포는 사유를 적어 주세요');
  const prevPub = clone(S.pub);
  const bump = maxBump(L.map((d) => d.bump));
  const from = S.version;
  S.version = bumpVersion(from, bump);
  for (const d of L) {
    apply(d);
    d.status = 'published';
    d.version = S.version;
    d.log.push({ at: now(), by: role, text: `${mode} 배포 → ${S.version}` });
  }
  S.history.unshift({ version: S.version, from, at: now(), mode: `${mode} 배포`, by: role, bump, reason: reason || '', prevPub, notes: L.map((d) => ({ id: d.id, title: d.title, bump: d.bump, lines: d.lines, impact: d.bump === 'MAJOR' ? '이미 만든 SB 재검수' : '영향 없음' })) });
  save();
  return S.history[0];
}

export function rollback(role: Role, reason?: string) {
  if (role !== 'approver') throw new Error('롤백은 관리자가 합니다');
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

// ---------- 승격 심사 ----------

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
    // 관리자 배포: 코드 앞자리만 바꿔 정식 부품으로 (tb- → b-, tc- → c-), 바로 배포
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
  if (role !== 'ux' && role !== 'approver') throw new Error('승격 후보 등록은 UX 담당자가 합니다');
  const n = S.promotions.length + 12;
  S.promotions.unshift({ id: `PR-${String(n + 1).padStart(4, '0')}`, code: f.code, name: f.name, from: f.from || '-', judge: f.judge || '-', stage: PROMO_STAGES[0].stage, status: '대기', log: [{ at: now(), by: role, text: '등록' }] });
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
