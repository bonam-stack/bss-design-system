// BSS 디자인 포털 화면 (문서 사이트형).
// 누구에게나 같은 문서 사이트가 보이고, 오른쪽 위에서 담당 역할을 고르면 같은 페이지에 에디터 모드가 켜진다.
// 관리 메뉴(초안 · 게시, 승격 요청, 변경 감지)는 담당 역할에서만 보인다. 고친 내용은 초안 → 포털 승인 담당 게시.
import * as P from './store.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const FIGMA_FILE = '9AioWOXVOVm5C7kdSxSEEP';

let role = 'viewer';
let ui = { q: '', kd: '', editRule: null, edit: null }; // edit: 지금 열린 편집 칸 키
let ctx = { rerender: () => {}, toast: () => {}, data: {} };

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* 없어도 동작 */ } }

export function init(c) {
  ctx = c;
  role = lsGet('bss-design-portal.role') || 'viewer';
  if (!P.ROLES[role]) role = 'viewer';
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('change', onChange);
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'rq') return;
    ui.q = e.target.value;
    clearTimeout(init.t);
    init.t = setTimeout(() => { ctx.rerender(); const el = document.getElementById('rq'); el?.focus(); el?.setSelectionRange(ui.q.length, ui.q.length); }, 250);
  });
}
export const currentRole = () => role;
export const isEditor = () => role !== 'viewer';
export function resetUi() { ui.edit = null; ui.editRule = null; }

// ---------- 조각 ----------

const st = (c, t) => `<span class="st ${c}">${esc(t)}</span>`;
const stOf = (s) => st(s === 'pub' ? 'ok' : s === 'tmp' ? 'ai' : 'wait', P.STATUS[s] || s);
const bump = (b) => (b ? `<span class="bp ${b}">${b}</span>` : '');
const can = (type) => role === P.EDITOR[type];
const KIND_SECTION = { shell: 'blocks', block: 'blocks', comp: 'components', layout: 'patterns' };
const KIND_LABEL = { shell: 'App shell', block: 'Blocks', comp: 'Components', layout: 'Layout rules' };
// SB 블록: SB Studio에서 만든 업무 전용 블록(tb-). 여러 SB에서 쓰이면 승격 요청으로 공통 블록(b-)이 된다
const isSb = (i) => i.kind === 'block' && /^tb-/.test(i.code);
const link = (code) => {
  const it = P.item(code);
  if (it) return `<a href="#${esc(code)}">${esc(it.name)}</a>`;
  const sl = P.slot(code);
  return esc(sl ? sl.name : code);
};
/** 글 속에 섞인 카탈로그 코드 · 빈칸 경로를 이름으로 바꿔 보여 준다 */
function human(text) {
  return esc(text).replace(/\b(?:tb|tc|c|b|s|l)-[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9.-]*)?/g, (code) => {
    const it = P.item(code);
    if (it) return it.name;
    const sl = P.slot(code);
    if (sl) return sl.name;
    // 빈칸 경로의 앞부분만 아는 경우 (b-content.column.body → 컨텐트 · column.body)
    const [head, ...rest] = code.split('.');
    const h = P.item(head);
    return h ? `${h.name} ${rest.join('.')}` : code;
  });
}
const table = (cols, rows) => `<div class="tw"><table class="t"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${cols.length}" class="muted">없음</td></tr>`}</tbody></table></div>`;
// 준비 상태 칸: 마름모 표시(있음 = 채움 · 없음 = 빈 테두리) + 이름 + 값(버전 등 숫자가 있으면 고정폭으로)
const check = (on, label) => {
  const m = String(label).match(/^(.*\S)\s+(\S*\d\S*)$/);
  const text = m ? `<span class="ck-k">${esc(m[1])}</span><b class="ck-v">${esc(m[2])}</b>` : `<span class="ck-k">${esc(label)}</span>`;
  return `<span class="ck ${on ? 'on' : 'off'}" title="${on ? '있음' : '없음'}"><i aria-hidden="true"></i>${text}<span class="sr">${on ? ' 있음' : ' 없음'}</span></span>`;
};
const editBtn = (key, label = '편집') => `<button type="button" class="edit-btn${ui.edit === key ? ' on' : ''}" data-act="edit" data-k="${esc(key)}">${ui.edit === key ? '닫기' : `✎ ${label}`}</button>`;

function draftBox(d) {
  if (!d) return '';
  const mine = role === d.by;
  return `<div class="dbox" role="note">
    <div class="dbox-h"><b>초안 ${esc(d.id)}</b>${bump(d.bump)}<span>${esc(P.ROLES[d.by])} · ${fmt(d.at)} · 게시 대기</span></div>
    <ul>${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <div class="row">${role === 'approver' ? `<button class="btn2 primary sm" data-act="publish-one" data-id="${d.id}">게시</button><button class="btn2 sm" data-act="discard" data-id="${d.id}">반려</button>` : ''}${mine ? `<button class="btn2 sm" data-act="discard" data-id="${d.id}">초안 버리기</button>` : ''}${isEditor() ? '<a class="lnk" href="#pub">초안 · 게시</a>' : ''}</div>
  </div>`;
}
const drafts = (type, target) => (isEditor() ? draftBox(P.openDraft(type, target)) : '');

// ---------- 머리 · 메뉴 ----------

// IA (SEED 문서 사이트와 같은 기획): 시작하기 · Foundations · Components · Blocks · Patterns · UX 거버넌스 · Updates
// 항목은 [경로, 이름, 그 앞에 붙는 소제목?]. 디자인 문서(#c-…)와 개발 문서(#dev-c-…)를 나눠 두고 서로 링크한다.
export function sections() {
  const I = P.items();
  const comps = I.filter((i) => i.kind === 'comp').sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const sub = (L, title) => L.map((x, n) => (n ? x : [...x, title]));
  const S = [
    ['governance', 'UX 거버넌스', [['rules', '규칙'], ['slots', '빈칸'], ['lint', '검증 규칙']]],
    ['start', '시작하기', [['overview', '개요'], ['stack', '조립 구조']]],
    ['foundations', 'Foundations', [['foundations', '개요'], ['color', '색상', '기본 요소'], ['typography', '타이포그래피'], ['dimension', '간격 · 모서리'], ['icons', '아이콘'], ['tokens', '토큰 구조', '구조']]],
    ['components', 'Components', [['components', '개요'], ['progress', '진행 현황'], ...sub(comps.map((i) => [i.code, i.name]), '컴포넌트')]],
    ['blocks', 'Blocks', [['blocks', '개요'],
      ...sub(I.filter((i) => i.kind === 'shell').map((i) => [i.code, i.name]), '앱쉘'),
      ...sub(I.filter((i) => i.kind === 'block' && !isSb(i)).map((i) => [i.code, i.name]), '공통 블록'),
      ...sub(I.filter(isSb).map((i) => [i.code, i.name]), 'SB 블록')]],
    ['patterns', 'Patterns', [['patterns', '개요'], ...(ctx.data.patterns || []).map((p) => [`pattern-${p.key}`, `${p.name} 패턴`]), ...I.filter((i) => i.kind === 'layout').map((i) => [i.code, `${i.name} 레이아웃`])]],
    ['updates', 'Updates', [['updates', '릴리스 노트']]],
  ];
  if (isEditor()) S.push(['admin', '관리', [['pub', '초안 · 게시'], ['promo', '승격 요청'], ['chg', '변경 감지']]]);
  return S;
}

export function sectionOf(route) {
  for (const [k, , items] of sections()) if (items.some(([r]) => r === route)) return k;
  if (route.startsWith('pattern-')) return 'patterns';
  // 개발 문서는 지금 메뉴에 없다: 토큰 목록은 Foundations, 컴포넌트 코드는 Components 아래로 표시
  if (route === 'dev-tokens') return 'foundations';
  if (route.startsWith('dev-')) return 'components';
  return 'start';
}

export function topNav(route) {
  const cur = sectionOf(route);
  return sections().map(([k, label, items]) => `<a href="#${items[0][0]}" class="${k === cur ? 'on' : ''}${k === 'admin' ? ' admin' : ''}"${k === cur ? ' aria-current="true"' : ''}>${label}${k === 'admin' ? count() : ''}</a>`).join('');
}

/** 머리 오른쪽: 검색 · 테마 · 역할 */
export function topTools() {
  const th = theme();
  const label = { system: '시스템 테마', light: '밝은 테마', dark: '어두운 테마' }[th];
  const icon = {
    system: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    dark: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor"/></svg>',
  }[th];
  return `<button type="button" class="tool-btn search-btn" data-act="search" aria-label="검색 (Ctrl+K)"><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span class="sb-l">검색</span><kbd>⌘K</kbd></button>
    <button type="button" class="tool-btn" data-act="theme" aria-label="테마 전환 · 지금 ${label}" title="${label}">${icon}</button>${roleMenu()}`;
}
const theme = () => lsGet('bss-design-portal.theme') || 'system';
export function applyTheme() {
  const t = theme();
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

/** 검색 대상: 모든 섹션의 문서 */
export function searchIndex() {
  return sections().flatMap(([, sec, items]) => items.map(([r, l]) => ({ route: r, label: l, section: sec, meaning: P.item(r)?.meaning || '' })));
}

/** 사이트 아래 바닥글 */
export function footer() {
  const S = sections().filter(([k]) => k !== 'admin');
  return `<div class="sf-in"><div class="sf-brand"><span class="brand-mark" aria-hidden="true"></span><b>BSS Design</b><p>BSS 백오피스 화면을 만드는 기준 · 게시 ${esc(P.version())}</p></div>
    <nav class="sf-nav" aria-label="바닥글 메뉴"><div><p>문서</p>${S.slice(0, 5).map(([, l, it]) => `<a href="#${esc(it[0][0])}">${esc(l)}</a>`).join('')}</div>
    <div><p>더 보기</p>${S.slice(5).map(([, l, it]) => `<a href="#${esc(it[0][0])}">${esc(l)}</a>`).join('')}</div>
    <div><p>원본</p><a href="https://www.figma.com/design/${FIGMA_FILE}/" target="_blank" rel="noopener">Figma 라이브러리 ↗</a><a href="#stack">조립 구조</a></div></nav></div>
    <p class="sf-copy">© 2026 BSS Design System · POC</p>`;
}
function count() {
  const n = P.drafts((d) => d.status === 'draft').length + P.promotions().filter((p) => p.status === '대기').length;
  return n ? ` <em>${n}</em>` : '';
}

export function sideNav(route) {
  const cur = sectionOf(route);
  const [, label, items] = sections().find(([k]) => k === cur) || sections()[0];
  const kindOf = (r) => P.item(r)?.kind;
  // 좁은 화면에서는 위쪽 섹션 메뉴가 숨으므로 목록 위에 섹션을 둔다
  let html = `<div class="m-sec">${sections().map(([k, l, it]) => `<a href="#${it[0][0]}" class="${k === cur ? 'on' : ''}">${esc(l)}</a>`).join('')}</div><div class="nav-title">${esc(label)}</div>`;
  let lastKind = null;
  for (const [r, l, subTitle] of items) {
    if (subTitle) html += `<div class="nav-sub">${esc(subTitle)}</div>`;
    const k = kindOf(r);
    if (cur === 'patterns' && k === 'layout' && lastKind !== 'layout') { html += '<div class="nav-sub">레이아웃 규칙</div>'; lastKind = 'layout'; }
    const it = P.item(r);
    const tag = it && it.status !== 'pub' ? `<span class="nv-st">${P.STATUS[it.status]}</span>` : '';
    const d = isEditor() && it && (P.openDraft('item', r) || P.openDraft('guide', it.key) || P.openDraft('figma', it.key)) ? '<i class="nv-dot" title="초안 있음"></i>' : '';
    const here = r === route || route === `dev-${r}` || (route === 'dev-tokens' && r === 'tokens');
    html += `<a href="#${esc(r)}" class="${here ? 'on' : ''}"${here ? ' aria-current="page"' : ''}>${esc(l)}${tag}${d}</a>`;
  }
  return html;
}

/** 이전 · 다음 (같은 섹션 안에서) */
export function pager(route) {
  const items = sections().find(([k]) => k === sectionOf(route))?.[2] || [];
  const i = items.findIndex(([r]) => r === route);
  if (i < 0) return '';
  const prev = items[i - 1];
  const next = items[i + 1];
  return `<nav class="pager" aria-label="이전 · 다음 문서">${prev ? `<a href="#${esc(prev[0])}"><span>이전 문서</span><b>${esc(prev[1])}</b></a>` : '<span></span>'}${next ? `<a class="nx" href="#${esc(next[0])}"><span>다음 문서</span><b>${esc(next[1])}</b></a>` : ''}</nav>`;
}

export function roleMenu() {
  return `<label class="role-pick${isEditor() ? ' on' : ''}"><span class="sr">역할</span>
    <select id="ptRole" aria-label="역할 (POC: SB Studio 로그인 대신)">${Object.entries(P.ROLES).map(([k, v]) => `<option value="${k}"${k === role ? ' selected' : ''}>${v}</option>`).join('')}</select></label>`;
}

/** 에디터 모드 띠: 역할 · 고칠 수 있는 것 · 초안 수 */
export function editorBar() {
  if (!isEditor()) return '';
  const what = { ux: '레이아웃 규칙 · 규칙 · 사용 가이드', ds: '앱쉘 · 블록 · 컴포넌트 · Figma 읽기', approver: '초안 게시 · 반려 · 롤백 · 승격 최종 승인' }[role];
  const mine = P.drafts((d) => d.status === 'draft' && (role === 'approver' || d.by === role)).length;
  return `<div class="ed-bar"><b>에디터 모드</b><span>${esc(P.ROLES[role])} · ${esc(what)}</span><a href="#pub">${role === 'approver' ? '게시 대기' : '내 초안'} ${mine}건</a><span class="ed-ver">게시 ${esc(P.version())}</span></div>`;
}

// ---------- 페이지 ----------

export function page(route) {
  switch (route) {
    case 'overview': return pageOverview();
    case 'stack': return pageStack();
    case 'updates': return pageUpdates();
    case 'foundations': return pageFoundations();
    case 'color': return pageColor();
    case 'typography': return pageType();
    case 'dimension': return pageDimension();
    case 'tokens': return pageTokens();
    case 'dev-tokens': return pageTokenRef();
    case 'progress': return pageProgress();
    case 'components': return pageList('comp');
    case 'blocks': return pageList('block');
    case 'patterns': return pagePatterns();
    case 'rules': return pageRules();
    case 'slots': return pageSlots();
    case 'lint': return pageLint();
    case 'pub': return isEditor() ? pagePub() : null;
    case 'promo': return isEditor() ? pagePromo() : null;
    case 'chg': return isEditor() ? pageChg() : null;
  }
  const it = P.item(route);
  if (it && !it.key) return pageItem(it);
  return null;
}
export const isPage = (r) => page(r) !== null;

const head = (eyebrow, title, lead, extra = '') => `<p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${lead ? `<p class="lead">${human(lead)}</p>` : ''}${extra}`;

function pageOverview() {
  const I = P.items();
  const n = (k) => I.filter((i) => i.kind === k).length;
  const H = P.history();
  const cards = [
    ['rules', 'UX 거버넌스', '규칙 · 빈칸 · 검증 규칙', 'UX표준가이드 규칙과 연결표 · 모든 화면의 기준'],
    ['foundations', 'Foundations', '색상 · 타이포그래피 · 간격 · 아이콘', '모든 부품이 쓰는 기본 요소'],
    ['components', 'Components', '최소 부품', '블록 안에 들어가는 버튼 · 입력 · 선택 등'],
    ['blocks', 'Blocks', '앱쉘 · 공통 블록 · SB 블록', '빈칸 하나를 채우는 업무 단위 묶음'],
    ['patterns', 'Patterns', 'UX 패턴 · 레이아웃 규칙', '화면을 어떤 순서로 쌓을지'],
    ['stack', '조립 구조', 'Stack 5단계', '앱쉘 → 레이아웃 → 빈칸 → 블록 → 컴포넌트'],
  ];
  return `${head('BSS Design System', 'BSS 디자인 포털', 'BSS 백오피스 화면을 만드는 기준입니다. SB Studio는 이 포털에 게시된 버전만 읽어 화면을 조립합니다.', `<div class="checks">${check(true, `게시 ${P.version()}`)}${check(true, '카탈로그 0.5')}${check(true, 'UX표준가이드 1.2')}${check(true, '디자인 토큰 v0.5')}</div>`)}
    <div class="cards">${cards.map((c) => `<a class="card" href="#${c[0]}"><span class="card-eb">${esc(c[1])}</span><b>${esc(c[2])}</b><span>${esc(c[3])}</span></a>`).join('')}</div>
    <h2 id="latest">최근 업데이트</h2>
    ${H.slice(0, 3).map(relCard).join('')}
    <p><a class="lnk" href="#updates">릴리스 노트 전체 보기</a></p>`;
}

function relCard(h) {
  return `<article class="rel"><div class="row"><b class="mono">${esc(h.version)}</b>${st(h.mode === '롤백' ? 'ng' : h.mode === '구축' ? 'wait' : 'ok', h.mode)}${bump(h.bump)}<span class="muted">${fmt(h.at)}${h.from ? ` · ${esc(h.from)}에서` : ''}</span></div>${h.reason ? `<p>${esc(h.reason)}</p>` : ''}${(h.notes || []).length ? `<ul>${h.notes.map((n) => `<li>${esc(n.title)}${n.lines ? ` · <span class="muted">${esc(n.lines.join(' · '))}</span>` : ''}</li>`).join('')}</ul>` : ''}</article>`;
}

function pageStack() {
  const I = P.items();
  const n = (k) => I.filter((i) => i.kind === k).length;
  const rows = [
    ['앱쉘', 's-', '화면이 바뀌어도 남는 바탕 틀', n('shell'), 'blocks'],
    ['레이아웃 규칙', 'l-', '본문 영역을 어떤 빈칸 순서로 나눌지 정하는 규칙', n('layout'), 'patterns'],
    ['빈칸(슬롯)', '경로', '부품이 들어갈 자리 · 고정 · 쌓기 · 자유', P.slots().length, 'slots'],
    ['블록', 'b-', '빈칸 하나를 채우는 업무 단위 묶음', n('block'), 'blocks'],
    ['컴포넌트', 'c-', '블록 안에 들어가는 최소 부품', n('comp'), 'components'],
  ];
  return `${head('시작하기', '조립 구조', '화면은 큰 단위에서 작은 단위로 쌓아 조립합니다. SB Studio는 4단계에서 이 순서대로 놓고 5단계에서 디자인 에셋을 입힙니다.')}
  <h2 id="stack">Stack</h2>
  <ol class="stk">${rows.map((x, i) => `<li><span class="sn">${i + 1}</span><a href="#${x[4]}"><b>${x[0]}</b></a><span>${x[2]}</span><em>${x[3]}개</em></li>`).join('')}</ol>
  <h2 id="types">화면 유형 판정 순서</h2>
  <p>규칙 <a href="#rules">R-WC-01</a> 순서로 판정합니다.</p>
  <ul><li><b>특수형</b> · 표준 틀로 만들 수 없는 예외 화면 · Stack 조립 제외 · 포털 승인 담당 승인</li><li><b>노드형</b> · 단계가 한 방향으로 이어지는 절차형 업무 · <a href="#s-node">노드 쉘</a></li><li><b>일반형</b> · 조회조건 → 상세정보 → 컨텐트 · <a href="#l-general">일반형 레이아웃</a></li><li><b>팝업</b> · 바탕 화면 위 레이어 · <a href="#l-popup">팝업 레이아웃</a></li></ul>
  <h2 id="owners">기준 원본 · 관리</h2>
  ${table(['대상', '원본', '편집', '게시'], [
    ['앱쉘 · 블록 · 컴포넌트 (모양)', 'Figma 디자인 시스템', P.ROLES.ds, P.ROLES.approver],
    ['레이아웃 규칙 · 규칙 · 사용 가이드', 'UX표준가이드 · 이 포털', P.ROLES.ux, P.ROLES.approver],
    ['임시 부품 tb- · tc-', 'SB Studio 생성', '승격 심사', P.ROLES.approver],
  ].map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`))}`;
}

function pageUpdates() {
  return `${head('Updates', '릴리스 노트', '게시된 버전과 변경 노트입니다. MAJOR는 기존 것을 고치거나 지울 때(이미 만든 SB 재검수), MINOR는 추가 · 승격, PATCH는 설명 수정입니다.')}
  ${P.history().map((h, i) => `<h2 id="v-${i}" class="sr">${esc(h.version)}</h2>${relCard(h)}`).join('')}`;
}

// ---------- Foundations ----------

const TK = () => Object.entries(ctx.data.tokens?.tokens || {}).map(([css, t]) => ({ css, ...t }));
const swatch = (hex) => `<i class="sw" style="background:${esc(hex)}"></i>`;
const COLOR_ROLE = { bg: '배경 (bg)', fg: '글자 · 아이콘 (fg)', border: '테두리 (border)' };

function pageFoundations() {
  const n = (col) => TK().filter((t) => t.collection === col).length;
  const cards = [
    ['color', '색상', `Semantic ${TK().filter((t) => t.collection === 'Semantic' && t.type === 'COLOR').length} · Primitive ${n('Primitive')}`, '역할(배경 · 글자 · 테두리)로 고르는 색'],
    ['typography', '타이포그래피', `${typeStyles().length}개 스타일`, 'Pretendard · 크기 · 줄 높이 · 굵기'],
    ['dimension', '간격 · 모서리', `${dimTokens().length}개 값`, '간격 · 크기 · 둥글기 · 두께'],
    ['icons', '아이콘', `${ctx.data.icons?.icons.length || 0}개`, 'Line · Filled · Colored'],
    ['tokens', '토큰 구조', '베이스 → 역할 → 컴포넌트', '색에서 컴포넌트 변형까지 이어지는 방식'],
  ];
  return `${head('Foundations', 'Foundations', '컴포넌트와 블록이 공통으로 쓰는 색 · 글자 · 간격 · 아이콘의 기준입니다. 값은 Figma 변수에서 읽은 디자인 토큰으로만 씁니다.')}
  <h2 id="principle">원칙</h2>
  <ol class="flow"><li><strong>값이 아니라 역할로 고릅니다</strong><span>#3617CE 대신 <code>color/bg/brand/strongest</code>처럼 쓰임새가 이름에 드러난 Semantic 토큰을 씁니다.</span></li>
  <li><strong>세 단계로 이어집니다</strong><span>Primitive(팔레트) → Semantic(역할) → Component(부품 전용). 부품은 Component 토큰만 보고, 바꿀 때는 Semantic에서 한 번에 바뀝니다.</span></li>
  <li><strong>Figma가 원본입니다</strong><span>디자인 시스템 담당이 Figma 변수를 고치면 포털이 다시 읽어 게시합니다.</span></li></ol>
  <h2 id="all">구성</h2>
  <div class="cards">${cards.map((c) => `<a class="card" href="#${c[0]}"><span class="card-eb">${esc(c[1])}</span><b>${esc(c[2])}</b><span>${esc(c[3])}</span></a>`).join('')}</div>`;
}

function pageColor() {
  const sem = TK().filter((t) => t.collection === 'Semantic' && t.type === 'COLOR');
  const prim = TK().filter((t) => t.collection === 'Primitive');
  const role = (t) => t.figma.split('/')[1];
  const roles = [...new Set(sem.map(role))];
  const hues = [...new Set(prim.map((t) => t.figma.split('/')[1]))];
  const primName = (css) => TK().find((t) => t.css === css)?.figma.replace(/^color\//, '') || '-';
  const usedBy = (css) => sem.filter((t) => t.ref === css).length;
  return `${head('Foundations', '색상', `색은 베이스(Palette) ${prim.length}개에서 시작합니다. 역할(Color role) ${sem.length}개가 베이스 색 하나씩을 가리키고, 컴포넌트는 역할을 변형 · 상태별로 다시 가리킵니다. 색 값은 이 페이지에만 있습니다.`)}
  <h2 id="palette">Palette <span class="count">베이스 · ${prim.length}</span></h2>
  <p class="note">Primitive 색입니다. 화면에서 바로 쓰지 않고 아래 Color role이 가리키는 원본으로만 씁니다. 숫자는 이 색을 가리키는 역할 수입니다.</p>
  ${hues.map((h) => {
    const L = prim.filter((t) => t.figma.split('/')[1] === h);
    return `<h3 id="pal-${esc(h)}">${esc(h)}</h3><div class="pal">${L.map((t) => `<div title="${esc(t.figma)}"><i style="background:${esc(t.value)}"></i><b>${esc(t.figma.split('/').slice(2).join('/') || h)}</b><span class="mono">${esc(t.value)}${usedBy(t.css) ? ` · 역할 ${usedBy(t.css)}` : ''}</span></div>`).join('')}</div>`;
  }).join('')}
  <h2 id="role">Color role <span class="count">파생 · ${sem.length}</span></h2>
  <p class="note">배경 · 글자 · 테두리마다 강도(faint → strongest)와 의미(brand · neutral · danger …)를 조합한 이름입니다. 컴포넌트 문서의 색 매트릭스는 이 이름을 씁니다.</p>
  ${roles.map((r) => `<h3 id="role-${esc(r)}">${esc(COLOR_ROLE[r] || r)} <span class="count">${sem.filter((t) => role(t) === r).length}</span></h3>
    ${table(['', '역할', '베이스', '값'], sem.filter((t) => role(t) === r).map((t) => `<tr><td class="sw-c">${swatch(t.value)}</td><td><code>${esc(t.figma.replace(/^color\//, ''))}</code></td><td class="mono">${esc(t.ref ? primName(t.ref) : '-')}</td><td class="mono muted">${esc(t.value)}</td></tr>`))}`).join('')}`;
}

/** Semantic font 토큰을 스타일(font/<역할>/<크기>/<굵기>) 단위로 묶는다 */
function typeStyles() {
  const comps = ctx.data.components || [];
  const map = new Map();
  for (const c of comps) for (const t of c.tokens) {
    const s = t.figma.split('/');
    if (s[0] !== 'font' || s.length !== 5) continue;
    const name = s.slice(1, 4).join('/');
    if (!map.has(name)) map.set(name, { name, role: s[1], used: new Set() });
    map.get(name)[s[4]] = t.value;
    map.get(name).used.add(c.name);
  }
  return [...map.values()].sort((a, b) => a.role.localeCompare(b.role) || Number(b.name.split('/')[1]) - Number(a.name.split('/')[1]));
}

function pageType() {
  const L = typeStyles();
  const fam = TK().filter((t) => t.figma.startsWith('font/'));
  return `${head('Foundations', '타이포그래피', '글꼴은 Pretendard 하나를 씁니다. 스타일 이름은 역할/크기/굵기(예: label/14/400)이고, 줄 높이와 자간이 함께 정해져 있습니다.')}
  <h2 id="scale">Type scale</h2>
  <div class="ts">${L.map((s) => `<div class="ts-r"><span class="ts-n"><code>${esc(s.name)}</code><small>${esc(s.size)} / ${esc(s.lineHeight)} · ${esc(s.weight)}</small></span><span class="ts-x" style="font-size:${Number(s.size)}px;line-height:${Number(s.lineHeight)}px;font-weight:${Number(s.weight)};letter-spacing:${Number(s.letterSpacing) || 0}px">BSS 백오피스 화면 Aa 123</span></div>`).join('')}</div>
  <h2 id="styles">스타일 목록</h2>
  ${table(['스타일', '크기', '줄 높이', '굵기', '자간', '쓰는 컴포넌트'], L.map((s) => `<tr><td><code>${esc(s.name)}</code></td><td class="mono">${esc(s.size)}</td><td class="mono">${esc(s.lineHeight)}</td><td class="mono">${esc(s.weight)}</td><td class="mono">${esc(s.letterSpacing)}</td><td>${[...s.used].map(esc).join(' · ')}</td></tr>`))}
  <h2 id="primitive">글자 토큰</h2>
  ${table(['토큰', '값'], fam.map((t) => `<tr><td><code>${esc(t.figma)}</code></td><td class="mono">${esc(t.value)}</td></tr>`))}`;
}

/** 컴포넌트 토큰이 가리키는 간격 · 크기 · 둥글기 · 두께 값 */
function dimTokens() {
  const map = new Map();
  for (const c of ctx.data.components || []) for (const t of c.tokens) {
    const a = t.alias || '';
    const kind = a.split('/')[0];
    if (!['space', 'size', 'radius', 'borderWidth'].includes(kind)) continue;
    if (!map.has(a)) map.set(a, { alias: a, kind, value: t.value, used: new Set() });
    map.get(a).used.add(c.name);
  }
  const num = (x) => (Number.isFinite(Number(x.value)) ? Number(x.value) : 0);
  return [...map.values()].sort((a, b) => a.kind.localeCompare(b.kind) || num(a) - num(b));
}

function pageDimension() {
  const L = dimTokens();
  const K = { space: ['간격', 'space', '요소 사이 · 안쪽 여백'], size: ['크기', 'size', '컨트롤 높이 · 아이콘 크기'], radius: ['모서리', 'radius', '둥글기 (full = 알약 모양)'], borderWidth: ['두께', 'border-width', '테두리 · 포커스 링 두께'] };
  return `${head('Foundations', '간격 · 모서리', '간격 · 크기 · 둥글기 · 두께는 정해진 단계만 씁니다. 아래 값은 컴포넌트 토큰이 실제로 가리키는 단계입니다.')}
  ${Object.entries(K).map(([k, [title, id, lead]]) => {
    const R = L.filter((x) => x.kind === k);
    if (!R.length) return '';
    return `<h2 id="${id}">${esc(title)} <span class="count">${R.length}</span></h2><p class="note">${esc(lead)}</p>
    ${table(['토큰', '값', '미리보기', '쓰는 컴포넌트'], R.map((x) => {
      const v = Math.min(Number(x.value) || 0, 96);
      const vis = k === 'radius' ? `<i class="dm dm-r" style="border-radius:${Math.min(Number(x.value) || 0, 24)}px"></i>` : k === 'borderWidth' ? `<i class="dm dm-b" style="border-width:${Number(x.value)}px"></i>` : `<i class="dm dm-s" style="width:${v}px"></i>`;
      return `<tr><td><code>${esc(x.alias)}</code></td><td class="mono">${esc(x.value)}</td><td>${vis}</td><td>${[...x.used].map(esc).join(' · ')}</td></tr>`;
    }))}`;
  }).join('')}`;
}

/** 컴포넌트 토큰 하나를 베이스까지 따라간 사슬 */
function chainOf(comp, t) {
  const byFigma = new Map(TK().map((x) => [x.figma, x]));
  const out = [{ name: t.figma, layer: 'Component', value: t.value }];
  let cur = byFigma.get(t.alias);
  if (!cur) return t.alias ? [...out, { name: t.alias, layer: '?', value: t.value }] : out;
  while (cur) {
    out.push({ name: cur.figma, layer: cur.collection, value: cur.value });
    cur = cur.ref ? TK().find((x) => x.css === cur.ref) : null;
  }
  return out;
}

function pageTokens() {
  const all = TK();
  const comps = ctx.data.components || [];
  const pick = (key, path) => { const c = comps.find((x) => x.key === key); const t = c?.tokens.find((x) => x.figma === path); return t ? chainOf(c, t) : null; };
  const examples = [
    ['Button · primary · hover 배경', pick('button', 'button/primary/color/bg/hover')],
    ['Checkbox · checked · default 배경', pick('checkbox', 'checkbox/checked/color/bg/default')],
    ['Checkbox · 미선택 hover 배경 (공유)', pick('checkbox', 'selectionControl/color/bg/hover')],
    ['TextField · error 테두리', pick('text-field', 'field/color/border/error')],
  ].filter((x) => x[1]);
  const LAYER = { Primitive: '베이스', Semantic: '역할', Component: '컴포넌트' };
  return `${head('Foundations', '토큰 구조', '토큰은 베이스 색에서 시작해 역할 → 컴포넌트 변형 순서로 이어집니다. 값은 베이스에만 있고, 그 아래 단계는 위 단계의 이름을 가리킵니다.')}
  <h2 id="layers">세 단계</h2>
  ${table(['단계', '개수', '뜻', '값이 있는 곳'], [
    ['베이스 · Primitive', all.filter((t) => t.collection === 'Primitive').length, '팔레트 원본 색 (예: gray/50)', '<a href="#color">색상 › Palette</a>'],
    ['역할 · Semantic', all.filter((t) => t.collection === 'Semantic').length, '배경 · 글자 · 테두리 역할과 글자 스타일. 베이스를 가리킴', '<a href="#color">색상 › Color role</a> · <a href="#typography">타이포그래피</a>'],
    ['컴포넌트 · Component', all.filter((t) => t.collection === 'Component').length, '부품의 변형 × 상태별 값. 역할을 가리킴', '각 컴포넌트 문서 › Specification'],
  ].map((r) => `<tr><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`))}
  <h2 id="chain">이어지는 예</h2>
  <p class="note">컴포넌트 토큰을 베이스까지 따라간 실제 사슬입니다. 베이스 색을 바꾸면 같은 사슬 위의 모든 컴포넌트가 함께 바뀝니다.</p>
  <div class="chains">${examples.map(([label, ch]) => `<div class="chain"><p class="chain-t">${esc(label)}</p><ol>${[...ch].reverse().map((x) => `<li><span class="chain-l">${esc(LAYER[x.layer] || x.layer)}</span>${/^#/.test(x.value) ? swatch(x.value) : ''}<code>${esc(x.name)}</code></li>`).join('')}</ol></div>`).join('')}</div>
  <h2 id="naming">이름 규칙</h2>
  ${table(['단계', '형식', '예'], [
    ['베이스', '<code>color/색상/단계</code>', '<code>color/indigo/600</code>'],
    ['역할', '<code>color/역할/의미/강도/상태</code>', '<code>color/bg/brand/strongest/hover</code>'],
    ['컴포넌트', '<code>부품/변형/color/역할/상태</code>', '<code>button/primary/color/bg/hover</code>'],
  ].map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`))}
  <h2 id="gap">간격 · 모서리의 베이스</h2>
  <p>컴포넌트 토큰이 <code>space/16</code> · <code>radius/8</code> 같은 이름을 가리키지만, 그 베이스 변수는 아직 토큰 파일에 없습니다. 지금 <a href="#dimension">간격 · 모서리</a> 페이지는 컴포넌트 토큰이 가리키는 값을 모아 보여 줍니다. Figma에서 space · radius 변수를 읽어 오면 색과 같은 구조가 됩니다.</p>
  <p class="note">CSS 변수 전체 목록은 <a href="#dev-tokens">토큰 레퍼런스</a>에 있습니다.</p>`;
}

function pageTokenRef() {
  const cols = ['Primitive', 'Semantic', 'Component'];
  const all = TK();
  return `${head('Foundations', '토큰 레퍼런스', `Figma 변수에서 읽은 토큰 ${all.length}개의 CSS 변수 목록입니다. 이름을 누르면 var(--…) 형태로 복사됩니다. 구조 설명은 Foundations › 토큰 구조에 있습니다.`)}
  ${cols.map((col) => {
    const L = all.filter((t) => t.collection === col);
    return `<h2 id="ref-${col.toLowerCase()}">${col} <span class="count">${L.length}</span></h2>
    <details class="ref"${col === 'Component' ? '' : ''}><summary>${col} 토큰 ${L.length}개 펼치기</summary>
    ${table(['Figma 변수', 'CSS 변수', '값', '가리키는 토큰'], L.map((t) => `<tr><td><code>${esc(t.figma)}</code></td><td><button class="copy" data-copy="var(${esc(t.css)})" title="클릭해서 복사">${esc(t.css)}</button></td><td class="mono nw">${t.type === 'COLOR' ? swatch(t.value) : ''}${esc(t.value)}</td><td class="mono muted">${esc(t.ref || '-')}</td></tr>`))}</details>`;
  }).join('')}`;
}

// ---------- Components 진행 현황 ----------

function pageProgress() {
  const I = P.items().filter((i) => i.kind === 'comp').sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const devKeys = ctx.data.devKeys || [];
  const guideKeys = ctx.data.guideKeys || [];
  const has = (i) => ({ fig: !!i.design, guide: !!i.key && guideKeys.includes(i.key), dev: !!i.key && devKeys.includes(i.key), ux: !!i.ux });
  const n = (f) => I.filter((i) => has(i)[f]).length;
  const bar = (k, label) => `<div class="pg"><span>${label}</span><b>${n(k)} / ${I.length}</b><i style="--p:${Math.round((n(k) / I.length) * 100)}%"></i></div>`;
  const mk = (on) => (on ? '<span class="ok-dot" aria-label="있음">●</span>' : '<span class="no-dot" aria-label="없음">○</span>');
  return `${head('Components', '진행 현황', '컴포넌트마다 Figma 디자인 에셋 · 사용 가이드 · 개발 문서 · UX 규칙이 어디까지 준비됐는지 보여 줍니다.')}
  <h2 id="summary">요약</h2>
  <div class="pgs">${bar('fig', 'Figma 에셋')}${bar('guide', '사용 가이드')}${bar('dev', '개발 문서')}${bar('ux', 'UX 규칙')}</div>
  <h2 id="board">컴포넌트별</h2>
  ${table(['컴포넌트', '상태', 'Figma', '사용 가이드', '개발 문서', 'UX 규칙'], I.map((i) => {
    const h = has(i);
    return `<tr><td><a href="#${esc(i.code)}">${esc(i.name)}</a></td><td>${stOf(i.status)}</td><td>${mk(h.fig)}</td><td>${mk(h.guide)}</td><td>${h.dev ? `<a href="#dev-${esc(i.code)}">${mk(true)}</a>` : mk(false)}</td><td>${mk(h.ux)}</td></tr>`;
  }))}`;
}



function pageList(kind) {
  const I = P.items().filter((i) => (kind === 'block' ? i.kind === 'block' || i.kind === 'shell' : i.kind === kind));
  const isComp = kind === 'comp';
  const pend = P.drafts((d) => d.status === 'draft' && d.type === 'figma' && d.isNew);
  const add = isComp && can('figma') ? `<section class="ed-panel" aria-label="컴포넌트 추가">
      <div class="ed-h"><b>컴포넌트 추가</b><span>UI팀이 Figma 디자인 시스템에 만든 컴포넌트 노드를 읽어 옵니다. 카탈로그 코드에 연결하면 그 항목의 디자인 에셋이 됩니다.</span></div>
      <form class="ef" data-form="figma-add"><div class="ef-r">
        <label>카탈로그 코드<select name="code"><option value="">새 코드 (c-이름)</option>${I.filter((i) => !i.key).map((i) => `<option value="${esc(i.code)}">${esc(i.code)} ${esc(i.name)}</option>`).join('')}</select></label>
        <label class="w">Figma 노드 주소<input name="url" required placeholder="https://www.figma.com/design/…?node-id=…"></label></div>
        <div class="row"><button class="btn2 primary sm">읽기 · 초안 저장</button><button type="button" class="lnk" data-act="sample">예시: Chip 노드 (흉내)</button></div></form>
      ${pend.map(draftBox).join('')}</section>` : '';
  return `${head(isComp ? 'Components' : 'Blocks', isComp ? '컴포넌트' : '블록', isComp ? '블록 안에 들어가는 최소 부품입니다. 그림은 Figma에서 읽은 기본 모양입니다.' : '앱쉘은 화면의 바탕 틀이고, 블록은 빈칸 하나를 채우는 업무 단위 묶음입니다. 블록은 포털이 관리하는 공통 블록과 SB Studio에서 만든 SB 블록으로 나뉩니다.')}
  ${add}
  ${kind === 'block' ? blockSections(I) : `<h2 id="all" class="sr">전체</h2>${grid(I)}`}`;
}
/** Blocks 개요: 앱쉘 · 공통 블록 · SB 블록(+ 승격 진행) */
function blockSections(I) {
  const sb = I.filter(isSb);
  const promos = P.promotions().filter((p) => /^tb-/.test(p.code));
  return `<h2 id="shell">앱쉘</h2><p class="note">화면이 바뀌어도 남는 바탕 틀입니다. 빈칸으로 나뉩니다.</p>${grid(I.filter((i) => i.kind === 'shell'))}
  <h2 id="common">공통 블록</h2><p class="note">Figma 디자인 시스템 기준으로 포털이 관리하는 블록입니다. 디자인 시스템 담당이 고치고 포털 승인 담당이 게시합니다. SB Studio는 이 블록을 먼저 고릅니다.</p>${grid(I.filter((i) => i.kind === 'block' && !isSb(i)))}
  <h2 id="sb">SB 블록</h2><p class="note">공통 블록으로 만들 수 없는 부분을 SB Studio에서 만든 업무 전용 블록입니다. 소스를 직접 고치고 자동 검사(토큰만 사용 · 스크립트 금지)를 거칩니다. 여러 SB에서 쓰이면 승격 요청으로 공통 블록이 됩니다.</p>
  ${sb.length ? grid(sb) : '<p class="muted">지금 등록된 SB 블록이 없습니다.</p>'}
  ${promos.length ? `<h3>승격 진행</h3>${table(['SB 블록', '출처', '판단', '단계', '상태'], promos.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.from)}</td><td>${human(p.judge)}</td><td class="nw">${esc(p.stage)}</td><td>${st(p.status === '승인' ? 'ok' : p.status === '반려' ? 'ng' : 'hold', p.status)}</td></tr>`))}` : ''}`;
}

// 카드: 컴포넌트는 위쪽에 실제 컴포넌트 그림(기본 변형, app.js가 그림)을 두고, Figma · UX 표시는 두지 않는다
function grid(L) {
  const thumbs = ctx.data.devKeys || [];
  return `<div class="cards">${L.map((i) => {
    const thumb = i.kind === 'comp' ? (i.key && thumbs.includes(i.key) ? `<span class="card-thumb" data-thumb="${esc(i.key)}" aria-hidden="true"></span>` : '<span class="card-thumb empty" aria-hidden="true">그림 준비 중</span>') : '';
    return `<a class="card${thumb ? ' has-thumb' : ''}" href="#${esc(i.code)}">${thumb}<span class="card-in">${i.status !== 'pub' ? `<span class="card-eb">${P.STATUS[i.status]}</span>` : ''}<b>${esc(i.name)}${i.nameKo && i.nameKo !== i.name ? ` <small>${esc(i.nameKo)}</small>` : ''}</b><span>${human(i.meaning)}</span></span></a>`;
  }).join('')}</div>`;
}

function pagePatterns() {
  const L = P.items().filter((i) => i.kind === 'layout');
  return `${head('Patterns', '패턴', '화면을 어떤 순서로 쌓고, 부품을 어떻게 쓰는지 정한 UX 패턴과 레이아웃 규칙입니다.')}
  <h2 id="ux">UX 패턴</h2>
  <div class="cards">${(ctx.data.patterns || []).map((p) => `<a class="card" href="#pattern-${esc(p.key)}"><b>${esc(p.name)} 패턴</b><span>${esc((p.overview || '').split('\n')[0])}</span></a>`).join('')}</div>
  <h2 id="layouts">레이아웃 규칙</h2>${grid(L)}`;
}

/** 카탈로그 항목 페이지 (상세 페이지가 따로 없는 앱쉘 · 블록 · 레이아웃 · 컴포넌트) */
function pageItem(it) {
  const parts = P.parts().filter((p) => p.block === it.code);
  const usedIn = [...new Set(P.parts().filter((p) => p.comp === it.code).map((p) => p.block))];
  const ru = P.rulesFor(it.code);
  const slotsOf = P.slots().filter((s) => s.owner === it.code);
  const editing = ui.edit === `item:${it.code}`;
  const d = P.openDraft('item', it.code);
  const kv = [
    ['상태', stOf(it.status)],
    it.kind === 'comp' ? ['변형', esc(it.variants)] : null,
    it.kind === 'block' ? ['구분', isSb(it) ? 'SB 블록 · SB Studio에서 만든 업무 전용 블록 (승격 대상)' : '공통 블록 · 포털 관리'] : null,
    it.kind === 'block' ? ['놓이는 빈칸', human(it.slot)] : null,
    it.kind === 'layout' ? ['적용 빈칸', link(it.slot)] : null,
    it.kind === 'layout' ? ['근거 문서', esc(it.guide)] : null,
    it.kind === 'shell' ? ['빈칸', human(it.slots)] : null,
    ['기준 원본', it.design ? '모양 Figma 디자인 시스템 · 뜻 카탈로그' : it.kind === 'layout' ? 'UX표준가이드' : 'UX 패턴 가이드 · 디자인 에셋 없음'],
    it.promotedFrom ? ['승격', `${esc(it.promotedFrom)}에서`] : null,
  ].filter(Boolean);
  return `${head(isSb(it) ? 'Blocks · SB 블록' : it.kind === 'block' ? 'Blocks · 공통 블록' : KIND_LABEL[it.kind], it.name, it.meaning, `<div class="checks">${check(it.design, 'Figma')}${check(it.ux, 'UX 가이드')}${check(it.status === 'pub', P.STATUS[it.status])}</div>`)}
  ${drafts('item', it.code)}
  <div class="sb-ph"><span>${it.design ? '디자인 에셋은 Figma 디자인 시스템에 있습니다 · 미리보기는 노드의 레이어 데이터를 받으면 그려집니다' : '디자인 에셋 없음 · UX 패턴 가이드 기준'}</span></div>
  ${slotsOf.length || parts.length ? `<h2>Anatomy</h2>
    ${slotsOf.length ? `<h3>빈칸</h3>${table(['이름', '방식', '들어갈 수 있는 것'], slotsOf.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.mode)}</td><td>${human(s.accepts)}</td></tr>`))}` : ''}
    ${parts.length ? `<h3>구성</h3>${table(['자리', '컴포넌트', '필수'], parts.map((p) => `<tr><td>${esc(p.slot)}</td><td>${link(p.comp)}</td><td>${p.required ? '필수' : '선택'}</td></tr>`))}` : ''}` : ''}
  <h2>Properties ${can(it.kind) ? editBtn(`item:${it.code}`) : ''}</h2>
  ${editing ? itemForm(it, d) : `<dl class="kv">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`}
  ${ru.length ? `<h2>Guidelines</h2><h3>UX표준가이드 규칙</h3>${ruleList(ru)}` : ''}
  ${usedIn.length ? `<h2>Usage</h2><h3>쓰이는 블록</h3><p class="chips">${usedIn.map((b) => link(b)).join(' · ')}</p>` : ''}`;
}

const ruleList = (L) => `<ul class="rl">${L.map((x) => `<li><a class="rid" href="#rules">${esc(x.id)}</a><span class="rk">${esc(x.kind)}</span><p>${human(x.text)}<small>${esc(x.doc)} · ${esc(x.section)}</small></p></li>`).join('')}</ul>`;

function itemForm(r, d) {
  const v = d ? { ...r, ...d.after } : r;
  const extra = r.kind === 'comp' ? ['variants', '변형'] : r.kind === 'shell' ? null : ['slot', r.kind === 'layout' ? '적용 빈칸' : '놓이는 빈칸'];
  return `<form class="ef ed-panel" data-form="item" data-code="${esc(r.code)}">
    <label>이름<input name="name" value="${esc(v.name)}" required></label>
    <label>뜻 (페이지 설명)<textarea name="meaning" rows="2">${esc(v.meaning)}</textarea></label>
    ${extra ? `<label>${extra[1]}<input name="${extra[0]}" value="${esc(v[extra[0]])}"></label>` : ''}
    <label>상태<select name="status">${Object.entries(P.STATUS).map(([k, t]) => `<option value="${k}"${v.status === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    <div class="row"><button class="btn2 primary sm">초안 저장</button><span class="muted">포털 승인 담당이 게시하면 반영됩니다</span></div></form>`;
}

function pageRules() {
  const q = ui.q.toLowerCase();
  const kinds = ['판정', '배치', '구성', '동작', '표기'];
  const L = P.rules().filter((r) => (!ui.kd || r.kind === ui.kd) && (!q || `${r.id}${r.doc}${r.section}${r.text}${r.targets.join(' ')}`.toLowerCase().includes(q)));
  const editor = can('rule');
  const prefixes = [...new Set(P.rules().map((r) => r.id.replace(/-\d+$/, '')))];
  const pending = isEditor() ? P.drafts((d) => d.status === 'draft' && d.type === 'rule') : [];
  const rowEdit = (r) => `<tr class="erow"><td colspan="${editor ? 5 : 4}"><form class="ef" data-form="rule" data-id="${esc(r.id)}">
      <div class="ef-r"><label>종류<select name="kind">${kinds.map((k) => `<option${k === r.kind ? ' selected' : ''}>${k}</option>`).join('')}</select></label><label>절<input name="section" value="${esc(r.section)}"></label><label class="w">내용<input name="text" value="${esc(r.text)}" required></label></div>
      <label>대상 코드 (쉼표로)<input name="targets" value="${esc(r.targets.join(', '))}"></label>
      <div class="row"><button class="btn2 primary sm">초안 저장</button><button type="button" class="btn2 sm" data-act="rule-cancel">취소</button><button type="button" class="btn2 sm danger" data-act="rule-remove" data-id="${esc(r.id)}">삭제 초안</button></div></form></td></tr>`;
  const rows = L.map((r) => `<tr><td><b class="nw">${esc(r.id)}</b>${P.openDraft('rule', r.id) && isEditor() ? ' <span class="st ai">초안</span>' : ''}<br><span class="rk">${esc(r.kind)}</span></td><td>${esc(r.doc)}<br><span class="muted">${esc(r.section)}</span></td><td>${human(r.text)}</td><td class="codes">${r.targets.map(link).join(' · ')}</td>${editor ? `<td><button class="edit-btn" data-act="rule-edit" data-id="${esc(r.id)}">✎</button></td>` : ''}</tr>${editor && ui.editRule === r.id ? rowEdit(r) : ''}`);
  return `${head('UX 거버넌스', '규칙', 'UX표준가이드 규칙 한 줄이 빈칸 → 블록 → 컴포넌트로 이어지는 연결표입니다. SB Studio의 생성 · 미리보기 · Figma 검사 · 독립 검수가 같은 규칙을 씁니다.')}
  ${editor ? `<section class="ed-panel"><div class="ed-h"><b>규칙 추가</b><span>번호는 앞자리 다음 번호로 자동으로 붙고, 게시 뒤에는 바뀌지 않습니다.</span></div><form class="ef" data-form="rule-add">
      <div class="ef-r"><label>번호 앞자리<select name="prefix">${prefixes.map((p) => `<option>${esc(p)}</option>`).join('')}</select></label><label>문서<input name="doc" placeholder="예: layout-work" required></label><label>절<input name="section" placeholder="예: 조회조건" required></label><label>종류<select name="kind">${kinds.map((k) => `<option>${k}</option>`).join('')}</select></label></div>
      <label>내용<input name="text" required placeholder="한 줄 규칙"></label>
      <label>대상 코드 (쉼표로)<input name="targets" placeholder="예: b-search-general, c-button"></label>
      <div class="row"><button class="btn2 primary sm">초안 저장</button></div></form>${pending.map(draftBox).join('')}</section>` : pending.map(draftBox).join('')}
  <h2 id="list" class="sr">규칙 목록</h2>
  <div class="filter"><input type="search" id="rq" value="${esc(ui.q)}" placeholder="규칙 · 빈칸 · 블록 · 컴포넌트 검색" aria-label="규칙 검색">${['', ...kinds].map((x) => `<button type="button" class="chip${ui.kd === x ? ' on' : ''}" data-act="kd" data-k="${x}">${x || '전체'}</button>`).join('')}<span class="muted">${L.length}건 · UX표준가이드 1.2</span></div>
  ${table(['규칙', '문서', '내용', '대상', ...(editor ? [''] : [])], rows)}`;
}

function pageSlots() {
  return `${head('UX 거버넌스', '빈칸', '빈칸은 단위가 아니라 자리입니다. 상위 부품(앱쉘 · 레이아웃 규칙 · 블록 · 컨테이너형 컴포넌트)에 딸린 자리를 경로로 적습니다.')}
  <h2 id="list" class="sr">빈칸 목록</h2>
  ${table(['이름', '소속', '방식', '들어갈 수 있는 것'], P.slots().map((s) => `<tr><td>${esc(s.name)}</td><td>${link(s.owner)}</td><td>${esc(s.mode)}</td><td>${human(s.accepts)}</td></tr>`))}`;
}

function pageLint() {
  const L = [['R-01', '앱쉘 빈칸에는 블록만', '오류'], ['R-02', '고정 빈칸은 허용 목록에서 하나', '오류'], ['R-03', '쌓기 빈칸 순서(일반형)', '오류'], ['R-04', '임시 코드(tb- · tc-)는 포털 승인 담당 승인 요청 동반', '경고'], ['R-05', '용어 대조(로제타)', '경고'], ['R-06', '출처 ID 반영률 100%', '오류'], ['R-07', '특수형 화면은 승인 기록 동반', '경고']];
  return `${head('UX 거버넌스', '검증 규칙', '규칙 한 벌을 생성기 · 미리보기 · Figma 검사 · 카탈로그 게시가 같이 씁니다. 독립 검수 기준 점검도 같은 규칙입니다.')}
  <h2 id="list" class="sr">검증 규칙</h2>${table(['규칙', '내용', '심각도'], L.map((r) => `<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${st(r[2] === '오류' ? 'ng' : 'hold', r[2])}</td></tr>`))}`;
}

// ---------- 관리 (담당 역할에서만) ----------

function pagePub() {
  const pend = P.drafts((d) => d.status === 'draft');
  const done = P.drafts((d) => d.status !== 'draft');
  const last = P.history()[0];
  const approver = role === 'approver';
  const typeName = { item: '카탈로그', rule: '규칙', guide: '사용 가이드', figma: 'Figma' };
  const where = (d) => (d.type === 'rule' ? '#rules' : d.type === 'guide' || d.type === 'figma' ? `#${P.itemByKey(d.key || d.target)?.code || d.code || d.target}` : `#${d.target}`);
  return `${head('관리', '초안 · 게시', '담당이 고친 내용은 초안으로 쌓이고, 포털 승인 담당이 게시하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀝니다.')}
  <h2 id="pending">게시 대기 ${pend.length}건</h2>
  <form data-form="publish">${table(['', '초안', '종류', '내용', '담당', '자리', ''], pend.map((d) => `<tr><td>${approver ? `<input type="checkbox" name="ids" value="${d.id}" checked aria-label="${d.id} 고르기">` : ''}</td><td><b class="nw">${esc(d.id)}</b></td><td class="nw">${typeName[d.type]}</td><td><a href="${esc(where(d))}">${esc(d.title)}</a><ul class="mini">${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></td><td class="nw">${esc(P.ROLES[d.by])}</td><td>${bump(d.bump)}</td><td class="nw">${approver ? `<button type="button" class="btn2 sm" data-act="discard" data-id="${d.id}">반려</button>` : role === d.by ? `<button type="button" class="btn2 sm" data-act="discard" data-id="${d.id}">버리기</button>` : ''}</td></tr>`))}
  ${approver && pend.length ? `<div class="row pad"><input name="reason" id="pubReason" class="grow" placeholder="게시 메모 (선택)"><button class="btn2 primary">고른 초안 게시 → ${esc(nextVersion(pend))}</button></div>` : pend.length ? '<p class="muted">게시는 포털 승인 담당이 합니다.</p>' : ''}</form>
  ${approver && last.prevPub ? `<h2 id="rollback">롤백</h2><form data-form="rollback" class="row"><span>지금 게시 <b class="mono">${esc(P.version())}</b></span><input name="reason" id="rbReason" class="grow" placeholder="롤백 사유"><button class="btn2 sm danger">${esc(last.from)}(으)로 되돌리기</button></form>` : ''}
  ${done.length ? `<h2 id="done">처리된 초안</h2>${table(['초안', '내용', '담당', '결과'], done.map((d) => `<tr><td class="nw">${esc(d.id)}</td><td>${esc(d.title)}</td><td class="nw">${esc(P.ROLES[d.by])}</td><td>${st(d.status === 'published' ? 'ok' : 'ng', { published: `게시 ${d.version}`, rejected: '반려', discarded: '버림', rolled_back: '롤백' }[d.status])}</td></tr>`))}` : ''}
  ${approver ? '<h2 id="reset">시연 데이터</h2><p class="row"><button class="btn2 sm danger" data-act="reset">처음 상태로 되돌리기</button><span class="muted">이 브라우저에 저장된 초안 · 게시 · 승격 진행을 지웁니다</span></p>' : ''}`;
}
function nextVersion(L) {
  const B = ['PATCH', 'MINOR', 'MAJOR'];
  const b = B[Math.max(...L.map((d) => B.indexOf(d.bump)))];
  const [a, m, p] = P.version().split('.').map(Number);
  return b === 'MAJOR' ? `${a + 1}.0.0` : b === 'MINOR' ? `${a}.${m + 1}.0` : `${a}.${m}.${p + 1}`;
}

function pagePromo() {
  const L = P.promotions();
  const actions = (p, k) => {
    if (p.status !== '대기') return '';
    const s = P.PROMO_STAGES.find((x) => x.stage === p.stage);
    if (!s) return '';
    if (role !== s.who) return `<span class="muted">${esc(P.ROLES[s.who])} 차례</span>`;
    const url = s.who === 'ds' ? `<input class="in-sm" id="promoUrl-${k}" placeholder="Figma 노드 주소" aria-label="Figma 노드 주소">` : '';
    return `${url}<button class="btn2 primary sm" data-act="promo" data-k="${k}" data-v="ok">${esc(s.act)}</button><button class="btn2 sm" data-act="promo" data-k="${k}" data-v="ng">반려</button>`;
  };
  return `${head('관리', '승격 요청', 'SB Studio에서 만든 임시 블록 · 컴포넌트(tb- · tc-)를 정식 부품으로 올립니다. 사용 승인 SB가 3건이 되면 자동 등록됩니다.')}
  <div class="checks">${P.PROMO_STAGES.map((s, i) => `<span class="ck on">${i + 1}. ${esc(s.stage)} · ${esc(P.ROLES[s.who])}</span>`).join('')}</div>
  ${role === 'ux' ? `<section class="ed-panel"><div class="ed-h"><b>승격 요청 등록</b></div><form class="ef" data-form="promo-add"><div class="ef-r"><label>임시 코드<input name="code" required pattern="t[bc]-[a-z0-9-]+" placeholder="tb-…"></label><label>이름<input name="name" required></label><label class="w">출처<input name="from" placeholder="SB · 화면 ID · 사용 승인 SB 건수"></label></div><label>변형 판단<input name="judge" placeholder="예: c-date-field 변형 후보"></label><div class="row"><button class="btn2 primary sm">등록</button></div></form></section>` : ''}
  <h2 id="list">요청 목록</h2>
  ${table(['요청', '이름', '출처', '변형 판단', '심사', '상태', '처리'], L.map((p, k) => `<tr><td class="nw">${esc(p.id)}</td><td>${P.item(p.code.split(' → ').pop()) ? link(p.code.split(' → ').pop()) : esc(p.name)}</td><td>${esc(p.from)}</td><td>${human(p.judge)}</td><td class="nw">${esc(p.stage)}</td><td>${st(p.status === '승인' ? 'ok' : p.status === '반려' ? 'ng' : 'hold', p.status)}</td><td class="acts">${actions(p, k)}</td></tr>`))}
  <p class="muted">최종 승인되면 코드 앞자리만 바뀌어(tb- → b-, tc- → c-) 바로 게시됩니다.</p>`;
}

function pageChg() {
  const L = P.detections();
  const opts = ['새 버전 후보', '무시(토큰만)', '포털 승인 담당 승인 요청'];
  return `${head('관리', '변경 감지', 'Figma 디자인 시스템 · UX 패턴 가이드 게시와 SB Studio가 만든 SB의 Figma 수정을 감지합니다. 새 버전 후보는 담당이 해당 페이지에서 Figma를 다시 읽어 초안으로 만듭니다.')}
  <h2 id="list" class="sr">감지 목록</h2>
  ${table(['감지', '파일', '대상', '변경', '영향', '처리'], L.map((r, k) => `<tr><td class="nw">${esc(r.at)}</td><td>${esc(r.file)}</td><td>${esc(r.target)}</td><td>${esc(r.change)}</td><td>${esc(r.impact)}</td><td><select data-act="det" data-k="${k}" aria-label="처리">${opts.map((o) => `<option${o === r.action ? ' selected' : ''}>${o}</option>`).join('')}</select></td></tr>`))}`;
}

// ---------- 컴포넌트 상세 페이지 (미리보기 · 사용 가이드가 있는 것) ----------

/** 제목 아래: ✓ Figma ✓ 사용 가이드 · 코드 · 상태 */
export function compChecks(c) {
  const r = P.itemByKey(c.key);
  return `<div class="checks">${check(true, 'Figma')}${check(!!c.guide, '사용 가이드')}${r ? stOf(r.status) : ''}${c.figmaSyncedAt ? `<span class="muted">Figma 읽음 ${fmt(c.figmaSyncedAt)}</span>` : ''}</div>`;
}

/** 페이지 위쪽 에디터 칸: 디자인 시스템 담당 = 설명 · Figma 다시 읽기 */
export function compEditor(c) {
  if (!isEditor()) return '';
  const r = P.itemByKey(c.key);
  const out = [];
  if (r) out.push(draftBox(P.openDraft('item', r.code)));
  out.push(draftBox(P.openDraft('figma', c.key)));
  if (can('figma')) {
    const open = ui.edit === `figma:${c.key}`;
    const openI = ui.edit === `item:${r?.code}`;
    out.push(`<section class="ed-panel"><div class="ed-h"><b>디자인 시스템 담당</b><span>모양은 Figma에서 고친 뒤 다시 읽고, 설명 · 변형은 여기서 고칩니다</span></div>
      <div class="row">${editBtn(`figma:${c.key}`, 'Figma에서 다시 읽기')}${r ? editBtn(`item:${r.code}`, '설명 · 변형 편집') : ''}</div>
      ${open ? `<form class="ef" data-form="figma-re" data-key="${esc(c.key)}"><label>Figma 노드 주소<input name="url" value="${esc(c.figma?.url || '')}"></label><div class="row"><button class="btn2 primary sm">읽기 · 게시본과 비교</button></div></form>` : ''}
      ${openI && r ? itemForm(r, P.openDraft('item', r.code)) : ''}</section>`);
  }
  return out.join('');
}

/** 사용 가이드(Policy) 앞에 붙는 UX 가이드 담당 편집 칸 */
export function guideEditor(c) {
  if (!isEditor() || !P.guide(c.key)) return '';
  const d = P.openDraft('guide', c.key);
  if (!can('guide')) return draftBox(d);
  const g = d?.after || P.guide(c.key);
  const open = ui.edit === `guide:${c.key}`;
  return `${draftBox(d)}<section class="ed-panel"><div class="ed-h"><b>UX 가이드 담당</b><span>규칙 번호(UX-${esc(c.key.toUpperCase())}-NN)는 저장할 때 붙고 고쳐도 바뀌지 않습니다</span></div>
    <div class="row">${editBtn(`guide:${c.key}`, '사용 가이드 편집')}</div>
    ${open ? `<form class="ef" data-form="guide" data-key="${esc(c.key)}">
      <label>정책 요약<textarea name="lead" rows="2">${esc(g.lead)}</textarea></label>
      <div class="ge">${g.rules.map((r) => `<div class="ge-r" data-rule="${esc(r.id)}"><code>${esc(r.id)}</code><select name="kind" aria-label="${esc(r.id)} 종류">${['rule', 'do', 'dont'].map((k) => `<option${k === r.kind ? ' selected' : ''}>${k}</option>`).join('')}</select><input name="text" value="${esc(r.text)}" aria-label="${esc(r.id)} 내용"><label class="cb"><input type="checkbox" name="remove"> 삭제</label></div>`).join('')}
      <div class="ge-r" data-new><span class="muted">새 규칙</span><select name="kind" aria-label="새 규칙 종류"><option>do</option><option>dont</option><option>rule</option></select><input name="text" placeholder="rule은 '항목: 기준' 형태" aria-label="새 규칙 내용"><span></span></div></div>
      <div class="row"><button class="btn2 primary sm">초안 저장</button></div></form>` : ''}</section>`;
}

/** Guidelines 안: 이 컴포넌트에 걸린 UX표준가이드 규칙 */
export function compRules(c) {
  const r = P.itemByKey(c.key);
  const ru = r ? P.rulesFor(r.code) : [];
  return ru.length ? `<h3>UX표준가이드 규칙</h3>${ruleList(ru)}` : '';
}

/** Usage: 이 컴포넌트를 쓰는 블록 · 패턴 */
export function compUsage(c) {
  const r = P.itemByKey(c.key);
  const usedIn = r ? [...new Set(P.parts().filter((p) => p.comp === r.code).map((p) => p.block))] : [];
  const pats = (ctx.data.patterns || []).filter((p) => (p.components || []).includes(c.key));
  if (!usedIn.length && !pats.length) return '';
  return `<h2>Usage</h2>${usedIn.length ? `<h3>쓰이는 블록</h3>${table(['블록', '자리', '필수'], P.parts().filter((p) => p.comp === r.code).map((p) => `<tr><td>${link(p.block)}</td><td>${esc(p.slot)}</td><td>${p.required ? '필수' : '선택'}</td></tr>`))}` : ''}${pats.length ? `<h3>쓰이는 패턴</h3><p class="chips">${pats.map((p) => `<a href="#pattern-${esc(p.key)}">${esc(p.name)} 패턴</a>`).join(' ')}</p>` : ''}`;
}

/** 저장소 정책(guide.policy)을 게시된 규칙(번호 포함)으로 바꿔 사용 가이드에 표시 */
export function applyGuide(c) {
  const g = P.guide(c.key);
  if (!g || !c.guide?.policy) return c;
  const pl = c.guide.policy;
  const fromByName = Object.fromEntries((pl.rules || []).map((r) => [r.name, r.from]));
  pl.lead = g.lead;
  pl.rules = g.rules.filter((r) => r.kind === 'rule').map((r) => {
    const i = r.text.indexOf(': ');
    const name = i > 0 ? r.text.slice(0, i) : '기준';
    return { id: r.id, name, desc: i > 0 ? r.text.slice(i + 2) : r.text, from: r.from || fromByName[name] || '포털에서 추가' };
  });
  pl.do = g.rules.filter((r) => r.kind === 'do').map((r) => ({ id: r.id, text: r.text }));
  pl.dont = g.rules.filter((r) => r.kind === 'dont').map((r) => ({ id: r.id, text: r.text }));
  return c;
}

/** Figma에서 읽어 게시한(저장소에 레이어 데이터가 없는) 컴포넌트 페이지 */
export function portalOnlyPage(c) {
  const r = P.itemByKey(c.key);
  return `${head('Components', c.name, r?.meaning || c.description, compChecks(c))}${compEditor(c)}
    <div class="sb-ph"><span>미리보기는 Figma 노드의 레이어 데이터를 받으면 그려집니다</span></div>
    <h2 id="props">Properties</h2><h3>속성 목록</h3>${table(['속성', '타입', '기본값', '선택지'], c.props.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type)}</td><td>${esc(p.default)}</td><td>${esc((p.options || []).join(', '))}</td></tr>`))}
    <p class="muted">변형 ${c.variants.length}개 · <a href="${esc(c.figma?.url)}" target="_blank" rel="noopener">Figma 노드 ${esc(c.figma?.nodeId)}</a></p>${compRules(c) ? `<h2>Guidelines</h2>${compRules(c)}` : ''}${compUsage(c)}`;
}

export const lastUpdated = () => `<p class="updated">게시 ${esc(P.version())} · ${fmt(P.history()[0].at)}</p>`;

// ---------- 이벤트 ----------

async function act(fn, ok, go) {
  document.body.classList.add('busy');
  try {
    const out = await fn();
    const hash = typeof go === 'function' ? go(out) : go;
    if (hash && location.hash !== hash) location.hash = hash;
    else ctx.rerender();
    if (ok) ctx.toast(typeof ok === 'function' ? ok(out) : ok);
    return out;
  } catch (e) {
    ctx.toast(e.message);
    return null;
  } finally {
    document.body.classList.remove('busy');
  }
}

function confirmTwice(b) {
  if (b.dataset.armed) return true;
  b.dataset.armed = '1';
  b.dataset.label = b.textContent;
  b.textContent = '한 번 더 누르면 실행';
  setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = b.dataset.label; } }, 4000);
  return false;
}

function onClick(e) {
  const t = e.target.closest('[data-act]');
  if (!t || t.tagName === 'SELECT') return;
  const d = t.dataset;
  switch (d.act) {
    case 'theme': {
      const order = ['system', 'light', 'dark'];
      lsSet('bss-design-portal.theme', order[(order.indexOf(theme()) + 1) % 3]);
      applyTheme();
      return ctx.rerender();
    }
    case 'search': return ctx.openSearch?.();
    case 'edit': ui.edit = ui.edit === d.k ? null : d.k; return ctx.rerender();
    case 'kd': ui.kd = d.k; return ctx.rerender();
    case 'rule-edit': ui.editRule = ui.editRule === d.id ? null : d.id; return ctx.rerender();
    case 'rule-cancel': ui.editRule = null; return ctx.rerender();
    case 'rule-remove': return act(() => P.draftRule(role, d.id, {}, true), (x) => `${x.target} 삭제 초안 저장`).then(() => { ui.editRule = null; ctx.rerender(); });
    case 'sample': {
      const f = t.closest('form');
      f.url.value = `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
      f.code.value = 'c-chip';
      return;
    }
    case 'discard': return act(() => P.discard(role, d.id), (x) => (x.status === 'rejected' ? `${x.id} 반려` : `${x.id} 초안을 버렸습니다`));
    case 'publish-one': return act(() => P.publish(role, [d.id]), (h) => `게시 ${h.version}`);
    case 'promo': {
      const inp = document.getElementById(`promoUrl-${d.k}`);
      if (d.v === 'ok' && inp && !inp.value.trim()) return ctx.toast('Figma 노드 주소를 넣어 주세요');
      return act(() => P.promote(role, Number(d.k), d.v === 'ok', { url: inp?.value.trim() }), (p) => (p.status === '승인' ? `최종 승인 · ${p.code} · 게시 ${P.version()}` : p.status === '반려' ? '반려했습니다' : `${p.stage} 단계로 넘겼습니다`));
    }
    case 'reset':
      if (!confirmTwice(t)) return;
      return act(() => P.reset(), '처음 상태로 되돌렸습니다', '#overview');
  }
}

function onChange(e) {
  if (e.target.id === 'ptRole') {
    role = e.target.value;
    lsSet('bss-design-portal.role', role);
    resetUi();
    // 관리 페이지에 있다가 보기로 바꾸면 개요로
    if (!isEditor() && ['pub', 'promo', 'chg'].includes(location.hash.slice(1))) { location.hash = '#overview'; return; }
    return ctx.rerender();
  }
  if (e.target.dataset.act === 'det') return act(() => P.handleDetection(role, Number(e.target.dataset.k), e.target.value), '처리 방식을 바꿨습니다');
}

function onSubmit(e) {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const closeEdit = (x) => { if (x) { ui.edit = null; ui.editRule = null; ctx.rerender(); } return x; };
  switch (f.dataset.form) {
    case 'item': {
      const fields = { name: v.name, meaning: v.meaning, status: v.status };
      if ('variants' in v) fields.variants = v.variants;
      if ('slot' in v) fields.slot = v.slot;
      return act(() => P.draftItem(role, f.dataset.code, fields), (d) => `초안 ${d.id} 저장 · 포털 승인 담당 게시 대기`).then(closeEdit);
    }
    case 'rule':
      return act(() => P.draftRule(role, f.dataset.id, { kind: v.kind, section: v.section, text: v.text, targets: list(v.targets) }), (d) => `초안 ${d.id} 저장`).then(closeEdit);
    case 'rule-add':
      return act(() => P.draftRule(role, null, { prefix: v.prefix, doc: v.doc, section: v.section, kind: v.kind, text: v.text, targets: list(v.targets) }), (d) => `${d.target} 추가 초안 저장`);
    case 'guide': {
      const rows = [...f.querySelectorAll('[data-rule]')].map((r) => ({ id: r.dataset.rule, kind: r.querySelector('[name=kind]').value, text: r.querySelector('[name=text]').value, remove: r.querySelector('[name=remove]').checked }));
      const nr = f.querySelector('[data-new]');
      const add = [{ kind: nr.querySelector('[name=kind]').value, text: nr.querySelector('[name=text]').value }];
      return act(() => P.draftGuide(role, f.dataset.key, { lead: v.lead, rules: rows, add }), (d) => `초안 ${d.id} 저장 · 포털 승인 담당 게시 대기`).then(closeEdit);
    }
    case 'figma-re':
      return act(() => P.draftFigma(role, { key: f.dataset.key, url: v.url.trim() }), (d) => `Figma 읽기 · ${d.lines.join(' · ')} · 초안 ${d.id}`).then(closeEdit);
    case 'figma-add':
      return act(() => P.draftFigma(role, { code: v.code || null, url: v.url.trim() }), (d) => `${d.after.name} 읽기 · 초안 ${d.id} 저장`);
    case 'promo-add':
      return act(() => P.addPromotion(role, v), (p) => `${p.id} 등록 · 구조 확인 단계`);
    case 'publish': {
      const ids = [...f.querySelectorAll('input[name=ids]:checked')].map((x) => x.value);
      return act(() => P.publish(role, ids, v.reason), (h) => `게시 ${h.version} · SB Studio가 이 버전을 읽습니다`);
    }
    case 'rollback': {
      const b = e.submitter;
      if (b && !confirmTwice(b)) return;
      return act(() => P.rollback(role, v.reason), (h) => `${h.version}(으)로 되돌렸습니다`);
    }
  }
}
