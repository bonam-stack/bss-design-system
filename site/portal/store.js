// BSS 디자인 포털 상태: 게시본(카탈로그 · 규칙 · 가이드 · 컴포넌트) + 초안 + 승격 + 버전.
// 편집 권한이 있는 담당이 고치면 초안이 되고, 포털 승인 담당이 게시하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀐다.
// 저장은 이 브라우저의 localStorage (POC). 게시본 = 저장소 JSON(기준) + 게시된 변경(pub).
import { convertFromUrl, diffComponent } from '../portal-core.js';

const KEY = 'bss-design-portal.v2';
export const ROLES = { viewer: '보기 (기획자)', ux: 'UX 가이드 담당', ds: '디자인 시스템 담당', approver: '포털 승인 담당' };
export const KIND = { shell: '앱쉘', layout: '레이아웃 규칙', block: '블록', comp: '컴포넌트' };
export const STATUS = { pub: '게시', draft: '초안', tmp: '임시' };
export const PROMO_STAGES = [
  { stage: '구조 확인', who: 'ux', act: '구조 확인 통과' },
  { stage: '모양 확인', who: 'ds', act: '모양 확인 · Figma 등록' },
  { stage: '최종 승인', who: 'approver', act: '최종 승인' },
];
// 누가 무엇을 고치나: 모양(앱쉘 · 블록 · 컴포넌트 · Figma)은 디자인 시스템 담당, 쓰는 방법(레이아웃 규칙 · 규칙 · 사용 가이드)은 UX 가이드 담당
export const EDITOR = { shell: 'ds', block: 'ds', comp: 'ds', figma: 'ds', layout: 'ux', rule: 'ux', guide: 'ux' };

let base = null; // { catalog, comps: {key: 저장소 컴포넌트}, guides: {key: 정책} }
let S = null;
const now = () => new Date().toISOString();
const clone = (o) => JSON.parse(JSON.stringify(o));
const BUMPS = ['PATCH', 'MINOR', 'MAJOR'];
const maxBump = (L) => BUMPS[Math.max(...L.map((b) => BUMPS.indexOf(b)))];
function bumpVersion(v, b) {
  const [a, m, p] = v.split('.').map(Number);
  return b === 'MAJOR' ? `${a + 1}.0.0` : b === 'MINOR' ? `${a}.${m + 1}.0` : `${a}.${m}.${p + 1}`;
}

function fresh() {
  return {
    v: 2,
    version: base.catalog.meta.version,
    pub: { items: {}, added: [], rules: {}, addedRules: [], guides: {}, comps: {} },
    drafts: [],
    promotions: clone(base.catalog.promotions),
    detections: clone(base.catalog.detections),
    history: [{ version: base.catalog.meta.version, at: now(), mode: '구축', by: 'approver', notes: [{ title: 'SB Studio 포털 카탈로그 0.5 · 저장소 컴포넌트 · UX표준가이드 1.2 이관' }] }],
    seq: { draft: 1 },
  };
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* 저장 못 해도 이번 화면에서는 동작 */ }
}

export function init(b) {
  base = b;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { S = null; }
  if (!S || S.v !== 2) { S = fresh(); save(); }
}
export function reset() { S = fresh(); save(); }
export const version = () => S.version;
export const history = () => S.history;
export const drafts = (pred = () => true) => S.drafts.filter(pred);
export const openDraft = (type, target) => S.drafts.find((d) => d.status === 'draft' && d.type === type && d.target === target) || null;

// ---------- 게시본 ----------

/** 카탈로그 항목: SB Studio 카탈로그 + 저장소에만 있는 컴포넌트(c-<key>) + 게시된 수정 · 추가 */
export function items() {
  const L = clone(base.catalog.items);
  const linked = new Set(L.map((i) => i.key).filter(Boolean));
  for (const [key, c] of Object.entries(base.comps)) {
    if (linked.has(key)) continue;
    const variant = (c.props || []).filter((p) => p.type === 'variant' && p.name !== 'state').map((p) => p.options.join(' · ')).join(' / ');
    L.push({ code: `c-${key}`, kind: 'comp', name: c.name, status: 'pub', design: true, ux: !!base.guides[key], meaning: firstSentence(c.description), variants: variant || '-', key });
  }
  for (const a of S.pub.added) L.push(clone(a));
  return L.map((i) => (S.pub.items[i.code] ? { ...i, ...S.pub.items[i.code] } : i));
}
const firstSentence = (s) => String(s || '').split(/(?<=[.다])\s/)[0].slice(0, 80);
export const item = (code) => items().find((i) => i.code === code) || null;
export const itemByKey = (key) => items().find((i) => i.key === key) || null;
export const slots = () => base.catalog.slots;
export const slot = (path) => base.catalog.slots.find((s) => s.path === path) || null;
export const parts = () => base.catalog.parts;

export function rules() {
  const L = base.catalog.rules.filter((r) => S.pub.rules[r.id] !== null).map((r) => (S.pub.rules[r.id] ? { ...r, ...S.pub.rules[r.id] } : r));
  return L.concat(S.pub.addedRules.map(clone));
}
export const rulesFor = (code) => rules().filter((r) => r.targets.includes(code));

/** 컴포넌트 사용 가이드 규칙: 저장소 정책을 UX-<KEY>-NN으로 번호 매김, 게시된 편집이 있으면 그것 */
export function guide(key) {
  if (S.pub.guides[key]) return clone(S.pub.guides[key]);
  const pl = base.guides[key];
  if (!pl) return null;
  const P = key.toUpperCase();
  let n = 0;
  const id = () => `UX-${P}-${String(++n).padStart(2, '0')}`;
  const rows = [
    ...(pl.rules || []).map((r) => ({ id: id(), kind: 'rule', text: `${r.name}: ${r.desc}`, from: r.from })),
    ...(pl.do || []).map((t) => ({ id: id(), kind: 'do', text: typeof t === 'string' ? t : t.text })),
    ...(pl.dont || []).map((t) => ({ id: id(), kind: 'dont', text: typeof t === 'string' ? t : t.text })),
  ];
  return { lead: pl.lead || '', rules: rows, next: n + 1 };
}

/** 저장소 컴포넌트에 게시된 변경(설명)을 덮은 것. 포털에서 새로 게시한 컴포넌트도 */
export function comp(key) {
  const p = S.pub.comps[key];
  if (base.comps[key]) return p ? { ...base.comps[key], description: p.description ?? base.comps[key].description, figmaSyncedAt: p.syncedAt } : base.comps[key];
  return p ? { ...p, portalOnly: true } : null;
}
export const newComps = () => Object.values(S.pub.comps).filter((c) => !base.comps[c.key]);
export const promotions = () => S.promotions;
export const detections = () => S.detections;

// ---------- 초안 ----------

function upsertDraft(d, role) {
  const cur = openDraft(d.type, d.target);
  if (cur) {
    Object.assign(cur, d, { at: now(), by: role });
    cur.log.push({ at: now(), by: role, text: '초안 수정' });
    save();
    return cur;
  }
  const nd = { id: `DR-${String(S.seq.draft++).padStart(4, '0')}`, status: 'draft', at: now(), by: role, log: [{ at: now(), by: role, text: '초안 저장' }], ...d };
  S.drafts.unshift(nd);
  save();
  return nd;
}

function must(role, type) {
  if (role !== EDITOR[type]) throw new Error(`${ROLES[EDITOR[type]]}만 고칠 수 있습니다`);
}

/** 카탈로그 항목(이름 · 뜻 · 변형/빈칸 · 상태) 수정 */
export function draftItem(role, code, fields) {
  const cur = item(code);
  if (!cur) throw new Error(`${code}가 없습니다`);
  must(role, cur.kind);
  const lines = [];
  let bump = 'PATCH';
  for (const [k, v] of Object.entries(fields)) {
    if ((cur[k] ?? '') === v) continue;
    lines.push(`${{ name: '이름', meaning: '뜻', variants: '변형', slot: '놓이는 빈칸', status: '상태' }[k] || k}: ${cur[k] ?? '-'} → ${v}`);
    if (k === 'status' || k === 'slot') bump = 'MAJOR';
    else if (k === 'variants') bump = String(cur[k] || '').split(/\s*·\s*/).every((x) => String(v).includes(x)) ? (bump === 'MAJOR' ? bump : 'MINOR') : 'MAJOR';
  }
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'item', target: code, title: `${code} ${cur.name} 수정`, after: fields, lines, bump }, role);
}

/** 규칙 메타 DB: 수정 · 추가(id 없음) · 삭제 */
export function draftRule(role, id, fields, remove = false) {
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
  const lines = [];
  for (const k of ['kind', 'section', 'text']) if (fields[k] !== undefined && fields[k] !== cur[k]) lines.push(`${{ kind: '종류', section: '절', text: '내용' }[k]}: ${cur[k]} → ${fields[k]}`);
  if (fields.targets && fields.targets.join(',') !== cur.targets.join(',')) lines.push(`대상: ${cur.targets.join(', ')} → ${fields.targets.join(', ')}`);
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'rule', target: id, title: `${id} 규칙 수정`, after: { ...cur, ...fields }, lines, bump: 'MAJOR' }, role);
}

/** 컴포넌트 사용 가이드(정책 요약 · 규칙) 편집. 새 규칙은 다음 번호를 받고, 번호는 고쳐도 그대로 */
export function draftGuide(role, key, { lead, rules: rows, add }) {
  must(role, 'guide');
  const cur = openDraft('guide', key)?.after || guide(key);
  if (!cur) throw new Error('사용 가이드가 없는 컴포넌트입니다');
  const before = guide(key);
  const next = { lead: lead ?? cur.lead, rules: clone(rows ?? cur.rules).filter((r) => !r.remove), next: cur.next };
  for (const a of add || []) {
    if (!a.text?.trim()) continue;
    next.rules.push({ id: `UX-${key.toUpperCase()}-${String(next.next++).padStart(2, '0')}`, kind: a.kind, text: a.text.trim() });
  }
  const bi = Object.fromEntries(before.rules.map((r) => [r.id, r]));
  const ni = Object.fromEntries(next.rules.map((r) => [r.id, r]));
  const lines = [];
  let bump = 'PATCH';
  const up = (b) => { if (BUMPS.indexOf(b) > BUMPS.indexOf(bump)) bump = b; };
  for (const id of Object.keys(bi)) if (!ni[id]) (lines.push(`규칙 삭제: ${id}`), up('MAJOR'));
  for (const id of Object.keys(ni)) if (!bi[id]) (lines.push(`규칙 추가: ${id} (${ni[id].kind})`), up('MINOR'));
  for (const id of Object.keys(ni)) if (bi[id] && (bi[id].text !== ni[id].text || bi[id].kind !== ni[id].kind)) (lines.push(`규칙 수정: ${id}`), up('MAJOR'));
  if (before.lead !== next.lead) lines.push('정책 요약 수정');
  if (!lines.length) throw new Error('바뀐 내용이 없습니다');
  return upsertDraft({ type: 'guide', target: key, title: `${key} 사용 가이드 수정`, after: next, lines, bump }, role);
}

const portalShape = (key, c) => ({
  key,
  name: c.name,
  description: c.description || '',
  figma: c.figma,
  props: (c.props || []).map((p) => ({ name: p.name, type: p.type, default: p.default, ...(p.options ? { options: p.options } : {}) })),
  variants: (c.variants || []).map((v) => ({ nodeId: v.nodeId, key: v.key, props: v.props })),
  tokens: [],
});

/** Figma 노드 주소로 다시 읽기(key) 또는 새 컴포넌트 읽기(key 없음, code로 카탈로그 항목에 연결) */
export async function draftFigma(role, { key, code, url }) {
  must(role, 'figma');
  const released = { components: Object.fromEntries(Object.entries(base.comps).map(([k, c]) => [k, portalShape(k, c)])) };
  for (const c of newComps()) released.components[c.key] = c;
  const conv = await convertFromUrl(url, { expect: 'component', released });
  const r = conv.result;
  if (r.kind !== 'component') throw new Error('컴포넌트 노드가 아닙니다');
  const k = key || r.key;
  const prev = key ? released.components[key] : released.components[k] || null;
  if (!key && prev) throw new Error(`${k}는 이미 있는 컴포넌트입니다. 그 컴포넌트 페이지에서 다시 읽어 주세요`);
  const after = { ...r, key: k };
  delete after.kind;
  const diff = diffComponent(prev, after);
  if (key && diff.lines.length === 1 && diff.lines[0] === '바뀐 점 없음') throw new Error(`Figma 노드와 게시본이 같습니다 · 바뀐 점 없음 (${conv.mode === 'mock' ? '흉내 모드' : 'Figma API'})`);
  const target = key ? k : code || `c-${k}`;
  return upsertDraft({ type: 'figma', target: key ? k : target, key: k, code: key ? itemByKey(k)?.code : target, title: key ? `${k} Figma 다시 읽기` : `${r.name} 추가 (Figma)`, after, isNew: !key, source: { url, mode: conv.mode }, lines: diff.lines, bump: diff.bump }, role);
}

export function discard(role, id) {
  const d = S.drafts.find((x) => x.id === id);
  if (!d || d.status !== 'draft') throw new Error('초안이 아닙니다');
  if (role !== d.by && role !== 'approver') throw new Error('초안을 만든 담당이나 포털 승인 담당만 버릴 수 있습니다');
  d.status = role === 'approver' ? 'rejected' : 'discarded';
  d.log.push({ at: now(), by: role, text: role === 'approver' ? '반려' : '초안 버림' });
  save();
  return d;
}

// ---------- 게시 · 롤백 (포털 승인 담당) ----------

function apply(d) {
  const P = S.pub;
  if (d.type === 'item') {
    const isAdded = P.added.find((a) => a.code === d.target);
    if (isAdded) Object.assign(isAdded, d.after);
    else P.items[d.target] = { ...(P.items[d.target] || {}), ...d.after };
  } else if (d.type === 'rule') {
    const added = P.addedRules.findIndex((r) => r.id === d.target);
    if (d.isNew) P.addedRules.push(d.after);
    else if (added >= 0) { if (d.after) P.addedRules[added] = d.after; else P.addedRules.splice(added, 1); }
    else P.rules[d.target] = d.after ? { ...d.after } : null;
  } else if (d.type === 'guide') P.guides[d.target] = d.after;
  else if (d.type === 'figma') {
    if (d.isNew) {
      P.comps[d.key] = { ...d.after, syncedAt: now() };
      const code = d.code;
      const exists = item(code);
      const variants = d.after.props.filter((p) => p.type === 'variant' && p.name !== 'state').map((p) => p.options.join(' · ')).join(' / ') || '-';
      if (exists) P.items[code] = { ...(P.items[code] || {}), key: d.key, design: true, status: 'pub', variants };
      else P.added.push({ code, kind: 'comp', name: d.after.name, status: 'pub', design: true, ux: false, meaning: d.after.description, variants, key: d.key });
    } else P.comps[d.key] = { ...(P.comps[d.key] || {}), description: d.after.description, syncedAt: now() };
  }
}

export function publish(role, ids, reason) {
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

export function rollback(role, reason) {
  if (role !== 'approver') throw new Error('롤백은 포털 승인 담당이 합니다');
  const last = S.history[0];
  if (!last.prevPub) throw new Error('되돌릴 게시가 없습니다');
  S.pub = clone(last.prevPub);
  for (const n of last.notes || []) {
    const d = S.drafts.find((x) => x.id === n.id);
    if (d) { d.status = 'rolled_back'; d.log.push({ at: now(), by: role, text: `${last.version} 롤백` }); }
  }
  S.history.unshift({ version: last.from, from: last.version, at: now(), mode: '롤백', by: role, reason: reason || '', notes: [] });
  S.version = last.from;
  save();
  return S.history[0];
}

// ---------- 승격 요청 ----------

export function promote(role, idx, ok, extra = {}) {
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

export function addPromotion(role, f) {
  if (role !== 'ux' && role !== 'approver') throw new Error('승격 요청 등록은 UX 가이드 담당이 합니다');
  const n = S.promotions.length + 12;
  S.promotions.unshift({ id: `PR-${String(n + 1).padStart(4, '0')}`, code: f.code, name: f.name, from: f.from || '-', judge: f.judge || '-', stage: '구조 확인', status: '대기', log: [{ at: now(), by: role, text: '등록' }] });
  save();
  return S.promotions[0];
}

// ---------- 변경 감지 처리 ----------

export function handleDetection(role, idx, action) {
  const d = S.detections[idx];
  if (!d) throw new Error('없는 항목입니다');
  if (role === 'viewer') throw new Error('담당자만 처리합니다');
  d.action = action;
  d.by = role;
  save();
  return d;
}
