// BSS 디자인 포털 화면: SB Studio 안 포털과 같은 메뉴(조립 구조 · UX 거버넌스 · 블록 · 컴포넌트 · 승격 요청 · 변경 감지)
// + 초안 · 게시. 행을 누르면 오른쪽 상세, 편집 권한이 있는 역할에는 같은 자리에 편집 칸이 열린다.
import * as P from './store.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const FIGMA_FILE = 'WcoI745J38TaON7iCKcutW';

let role = 'viewer';
let sel = null; // 오른쪽 상세에 연 코드
let ui = { gv: 'rules', q: '', kd: '', editRule: null, guideEdit: false };
let ctx = { rerender: () => {}, toast: () => {} };

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
    if (e.target.id !== 'pt-q') return;
    ui.q = e.target.value;
    clearTimeout(init.t);
    init.t = setTimeout(() => { ctx.rerender(); document.getElementById('pt-q')?.focus(); }, 250);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sel) { sel = null; ctx.rerender(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-sel]')) { e.preventDefault(); e.target.click(); }
  });
}
export const currentRole = () => role;
export const selected = () => sel;
export function clearSelection() { sel = null; }
export function openDetail(code) { sel = code; }

// ---------- 조각 ----------

const st = (c, t) => `<span class="st ${c}">${esc(t)}</span>`;
const stOf = (s) => st(s === 'pub' ? 'ok' : s === 'tmp' ? 'ai' : 'wait', P.STATUS[s] || s);
const asset = (r) => (r ? (r.design ? '<span class="as d">디자인 에셋</span>' : '') + (r.ux ? '<span class="as u">UX 에셋</span>' : '') + (!r.design && !r.ux ? '<span class="as t">에셋 없음</span>' : '') : '');
const bump = (b) => (b ? `<span class="bp ${b}">${b}</span>` : '');
function chip(code, cl = '') {
  const known = P.item(code) || P.slot(code);
  return `<button type="button" class="ch7 ${cl}${known ? '' : ' ghost'}" data-sel="${esc(code)}">${esc(code)}</button>`;
}
const table = (cols, rows) => `<div class="tw"><table class="t pt-t"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${cols.length}" class="pt-e">없음</td></tr>`}</tbody></table></div>`;
const tr = (code, cells) => `<tr class="pt-r${sel === code ? ' on' : ''}" data-sel="${esc(code)}" tabindex="0">${cells}</tr>`;
const can = (type) => role === P.EDITOR[type];
const drafted = (type, target) => P.openDraft(type, target);
const draftTag = (type, target) => (drafted(type, target) ? `<span class="st ai" title="게시 대기 초안">초안</span>` : '');

function draftBox(d) {
  if (!d) return '';
  const mine = role === d.by;
  return `<div class="dbox">
    <div class="dbox-h"><b>초안 ${esc(d.id)}</b>${bump(d.bump)}<span>${esc(P.ROLES[d.by])} · ${fmt(d.at)} · 포털 승인 담당 게시 대기</span></div>
    <ul>${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <div class="row">${role === 'approver' ? `<button class="pill sm dark" data-act="publish-one" data-id="${d.id}">게시</button><button class="pill sm" data-act="discard" data-id="${d.id}">반려</button>` : ''}${mine ? `<button class="pill sm" data-act="discard" data-id="${d.id}">초안 버리기</button>` : ''}<a class="lnk" href="#pub">초안 · 게시</a></div>
  </div>`;
}

// ---------- 위쪽 · 메뉴 ----------

export function topMeta() {
  const m = P.version();
  return `카탈로그 0.5 · UX표준가이드 1.2 · 디자인 토큰 v0.5 · 게시 <b>${esc(m)}</b>`;
}

export function roleSelect() {
  return `<label class="pt-role"><span>역할</span><select id="ptRole" aria-label="역할 (POC: SB Studio 로그인 대신)">${Object.entries(P.ROLES).map(([k, v]) => `<option value="${k}"${k === role ? ' selected' : ''}>${v}</option>`).join('')}</select></label>`;
}

export const TABS = [
  ['stack', '조립 구조'],
  ['gov', 'UX 거버넌스'],
  ['blk', '블록'],
  ['cmp', '컴포넌트'],
  ['promo', '승격 요청'],
  ['chg', '변경 감지'],
  ['pub', '초안 · 게시'],
];
/** 경로 → 메뉴 탭 */
export function tabOf(route) {
  if (/^(gov|pattern-)/.test(route)) return 'gov';
  if (/^(cmp|c-|tc-|icons|tokens)/.test(route)) return 'cmp';
  if (/^(blk|b-|tb-|s-)/.test(route)) return 'blk';
  return TABS.find((t) => t[0] === route)?.[0] || 'stack';
}

export function nav(route) {
  const tab = tabOf(route);
  const promo = P.promotions().filter((p) => p.status === '대기').length;
  const pend = P.drafts((d) => d.status === 'draft').length;
  const badge = (n) => `<em>${n || ''}</em>`;
  return TABS.map(([k, label]) => `<a href="#${k}" class="${tab === k ? 'on' : ''}"${tab === k ? ' aria-current="page"' : ''}>${label}${k === 'promo' ? badge(promo) : k === 'pub' ? badge(pend) : ''}</a>`).join('');
}

// ---------- 탭 ----------

export function page(route, data) {
  if (route === 'stack') return pageStack();
  if (route === 'gov' || route.startsWith('gov-')) return pageGov(route, data);
  if (route === 'blk') return pageBlocks();
  if (route === 'cmp') return pageComps();
  if (route === 'promo') return pagePromo();
  if (route === 'chg') return pageChg();
  if (route === 'pub') return pagePub();
  return null;
}
export const isPortalRoute = (r) => ['stack', 'blk', 'cmp', 'promo', 'chg', 'pub'].includes(r) || r === 'gov' || r.startsWith('gov-');

function pageStack() {
  const I = P.items();
  const n = (k) => I.filter((i) => i.kind === k).length;
  const rows = [
    ['앱쉘', 's-', '화면이 바뀌어도 남는 바탕 틀', n('shell')],
    ['레이아웃 규칙', 'l-', '본문 영역을 어떤 빈칸 순서로 나눌지 정하는 규칙', n('layout')],
    ['빈칸(슬롯)', '경로', '부품이 들어갈 자리 · 고정 · 쌓기 · 자유', P.slots().length],
    ['블록', 'b-', '빈칸 하나를 채우는 업무 단위 묶음', n('block')],
    ['컴포넌트', 'c-', '블록 안에 들어가는 최소 부품 · 예: c-button', n('comp')],
  ];
  return `<h3>조립 구조 · Stack</h3>
  <p class="pt-lead">화면은 큰 단위에서 작은 단위로 쌓아 조립 · SB Studio 생성 4단계에서 이 순서대로 놓고 5단계에서 디자인 에셋을 입힘</p>
  <ol class="pt-stk">${rows.map((x, i) => `<li><span class="pt-sn">${i + 1}</span><b>${x[0]}</b><code>${x[1]}</code><span>${x[2]}</span><em>${x[3]}개</em></li>`).join('')}</ol>
  <h4>화면 유형 판정 순서 · R-WC-01</h4>
  <ul class="bl"><li>특수형 · 표준 틀로 만들 수 없는 예외 화면 · Stack 조립 제외 · 자유 빈칸 하나 · 포털 승인 담당 승인</li><li>노드형 · 단계가 한 방향으로 이어지는 절차형 업무 · 노드 쉘(s-node)</li><li>일반형 · 조회조건 → 상세정보 → 컨텐트 · l-general</li><li>팝업 · 바탕 화면 위 레이어(c-popup) · l-popup</li></ul>
  <h4>기준 원본 · 누가 고치나</h4>
  ${table(['대상', '원본', '편집', '게시'], [
    ['모양 · 앱쉘 · 블록 · 컴포넌트', 'Figma 디자인 시스템 → 포털에서 노드 주소로 읽음', P.ROLES.ds, P.ROLES.approver],
    ['뜻 · 카탈로그', '이 포털 (카탈로그 JSON)', `${P.ROLES.ds} · 레이아웃 규칙은 ${P.ROLES.ux}`, P.ROLES.approver],
    ['규칙 · 사용 가이드', 'UX표준가이드 · 이 포털', P.ROLES.ux, P.ROLES.approver],
    ['임시 부품(tb- · tc-)', 'SB Studio 생성', '승격 심사 (구조 → 모양)', `${P.ROLES.approver} 최종 승인 뒤 정식 코드`],
  ].map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`))}
  <p class="pt-lead">${esc(P.ROLES[role])}로 보는 중 · 편집 권한이 있는 항목은 행을 누르면 오른쪽에서 고칠 수 있고, 고친 내용은 초안으로 저장된 뒤 포털 승인 담당이 게시합니다.</p>`;
}

function pageGov(route, data) {
  const gv = route.startsWith('gov-') ? route.slice(4) : 'rules';
  const sub = [['rules', '규칙 메타 DB'], ['layouts', '레이아웃 규칙'], ['slots', '빈칸'], ['patterns', 'UX 패턴'], ['lint', '검증 규칙']];
  let b = '';
  if (gv === 'rules') b = govRules();
  else if (gv === 'layouts')
    b = (can('layout') ? '<p class="pt-lead">행을 누르면 오른쪽에서 뜻 · 적용 빈칸 · 상태를 고칠 수 있습니다.</p>' : '') +
      table(['코드', '이름', '적용 빈칸', '뜻', '상태'], P.items().filter((i) => i.kind === 'layout').map((r) => tr(r.code, `<td><code>${esc(r.code)}</code> ${draftTag('item', r.code)}</td><td>${esc(r.name)}</td><td><code>${esc(r.slot)}</code></td><td class="pt-tx">${esc(r.meaning)}</td><td>${stOf(r.status)}</td>`)));
  else if (gv === 'slots')
    b = `<p class="pt-lead">빈칸은 단위가 아닌 자리 · 상위 부품(앱쉘 · 레이아웃 규칙 · 블록 · 컨테이너형 컴포넌트)에 딸린 자리를 경로로 표시</p>` +
      table(['경로', '이름', '소속', '방식', '들어갈 수 있는 것'], P.slots().map((s) => tr(s.path, `<td><code>${esc(s.path)}</code></td><td>${esc(s.name)}</td><td>${chip(s.owner)}</td><td>${esc(s.mode)}</td><td class="pt-tx">${esc(s.accepts)}</td>`)));
  else if (gv === 'patterns')
    b = `<p class="pt-lead">UX 패턴 가이드 · 쓰는 방법(흐름 · 배치 · 유형)과 간격 규격</p>` +
      table(['패턴', '쓰는 부품', '설명'], (data.patterns || []).map((p) => `<tr class="pt-r" data-href="#pattern-${esc(p.key)}" tabindex="0"><td><a href="#pattern-${esc(p.key)}"><b>${esc(p.name)}</b></a></td><td>${(p.components || []).map((k) => chip(P.itemByKey(k)?.code || `c-${k}`)).join('')}</td><td class="pt-tx">${esc((p.overview || '').split('\n')[0])}</td></tr>`));
  else
    b = `<p class="pt-lead">규칙 한 벌을 생성기 · 미리보기 · Figma 검사 · 카탈로그 게시가 같이 사용 · 독립 검수 기준 점검도 같은 규칙</p>` +
      table(['규칙', '내용', '심각도'], [['R-01', '앱쉘 빈칸에는 블록만', '오류'], ['R-02', '고정 빈칸은 허용 목록에서 하나', '오류'], ['R-03', '쌓기 빈칸 순서(일반형)', '오류'], ['R-04', '임시 코드(tb- · tc-)는 포털 승인 담당 승인 요청 동반', '경고'], ['R-05', '용어 대조(로제타)', '경고'], ['R-06', '출처 ID 반영률 100%', '오류'], ['R-07', '특수형 화면은 승인 기록 동반', '경고']].map((r) => `<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${st(r[2] === '오류' ? 'ng' : 'hold', r[2])}</td></tr>`));
  return `<h3>UX 거버넌스</h3><div class="pt-sub">${sub.map(([k, l]) => `<a class="ch7${gv === k ? ' on' : ''}" href="#${k === 'rules' ? 'gov' : `gov-${k}`}">${l}</a>`).join('')}</div>${b}`;
}

function govRules() {
  const q = ui.q.toLowerCase();
  const L = P.rules().filter((r) => (!ui.kd || r.kind === ui.kd) && (!q || `${r.id}${r.doc}${r.section}${r.text}${r.targets.join(' ')}`.toLowerCase().includes(q)));
  const editor = can('rule');
  const prefixes = [...new Set(P.rules().map((r) => r.id.replace(/-\d+$/, '')))];
  const kinds = ['판정', '배치', '구성', '동작', '표기'];
  const rowEdit = (r) => `<tr class="pt-edit"><td colspan="7"><form class="ef" data-form="rule" data-id="${esc(r.id)}">
      <div class="ef-r"><label>종류<select name="kind">${kinds.map((k) => `<option${k === r.kind ? ' selected' : ''}>${k}</option>`).join('')}</select></label><label>절<input name="section" value="${esc(r.section)}"></label><label class="w">내용<input name="text" value="${esc(r.text)}" required></label></div>
      <label>대상 코드 (쉼표로)<input name="targets" value="${esc(r.targets.join(', '))}"></label>
      <div class="row"><button class="pill sm dark">초안 저장</button><button type="button" class="pill sm" data-act="rule-cancel">취소</button><button type="button" class="pill sm danger" data-act="rule-remove" data-id="${esc(r.id)}">삭제 초안</button></div></form></td></tr>`;
  const rows = L.map((r) => {
    const sl = r.targets.filter((c) => P.slot(c));
    const rest = r.targets.filter((c) => !P.slot(c));
    const bl = rest.filter((c) => /^(b|tb)-/.test(c));
    const cp = rest.filter((c) => /^(c|tc)-/.test(c));
    const ly = rest.filter((c) => /^(l|s)-/.test(c));
    const main = `<tr><td><b>${esc(r.id)}</b> ${draftTag('rule', r.id)}<br><span class="pt-k">${esc(r.kind)}</span></td><td><code>${esc(r.doc)}</code><br>${esc(r.section)}</td><td class="pt-tx">${esc(r.text)}</td><td>${sl.map((c) => chip(c, 'sl')).join('') || '-'}${ly.length ? `<div>${ly.map((c) => chip(c)).join('')}</div>` : ''}</td><td>${bl.map((c) => chip(c, 'bl')).join('') || '-'}</td><td>${cp.map((c) => chip(c, 'cp')).join('') || '-'}</td>${editor ? `<td><button class="pill sm" data-act="rule-edit" data-id="${esc(r.id)}">수정</button></td>` : ''}</tr>`;
    return main + (editor && ui.editRule === r.id ? rowEdit(r) : '');
  });
  const pending = P.drafts((d) => d.status === 'draft' && d.type === 'rule');
  return `<p class="pt-lead">UX표준가이드 규칙 한 줄이 빈칸 → 블록 → 컴포넌트로 이어지는 연결표 · 생성 · 미리보기 · Figma 검사 · 독립 검수가 같은 규칙을 사용</p>
  ${editor ? `<details class="add"><summary>규칙 추가</summary><form class="ef" data-form="rule-add">
      <div class="ef-r"><label>번호 앞자리<select name="prefix">${prefixes.map((p) => `<option>${esc(p)}</option>`).join('')}</select></label><label>문서<input name="doc" placeholder="예: layout-work" required></label><label>절<input name="section" placeholder="예: 조회조건" required></label><label>종류<select name="kind">${kinds.map((k) => `<option>${k}</option>`).join('')}</select></label></div>
      <label>내용<input name="text" required placeholder="한 줄 규칙"></label>
      <label>대상 코드 (쉼표로)<input name="targets" placeholder="예: b-search-general, c-button"></label>
      <p class="pt-lead">번호는 앞자리 다음 번호로 자동으로 붙고, 게시 뒤에는 바뀌지 않습니다.</p>
      <button class="pill sm dark">초안 저장</button></form></details>` : ''}
  ${pending.length ? `<div class="dlist">${pending.map(draftBox).join('')}</div>` : ''}
  <div class="pt-fl"><input type="search" id="pt-q" value="${esc(ui.q)}" placeholder="규칙 · 빈칸 · 블록 · 컴포넌트 검색" aria-label="규칙 검색">${['', ...kinds].map((x) => `<button type="button" class="ch7${ui.kd === x ? ' on' : ''}" data-act="kd" data-k="${x}">${x || '전체'}</button>`).join('')}<span>${L.length}건 · 출처 UX표준가이드 1.2</span></div>
  ${table(['규칙', 'UX표준가이드', '내용', '빈칸', '블록', '컴포넌트', ...(editor ? [''] : [])], rows)}`;
}

function pageBlocks() {
  const I = P.items();
  const rows = (k) => I.filter((i) => i.kind === k).map((r) => tr(r.code, `<td><code>${esc(r.code)}</code> ${draftTag('item', r.code)}</td><td>${esc(r.name)}</td><td class="pt-tx">${esc(r.meaning)}</td><td>${stOf(r.status)}</td><td>${asset(r)}</td>`));
  return `<h3>블록</h3><p class="pt-lead">앱쉘과 블록 · 행을 누르면 뜻 · 구성 · 규칙 표시${can('block') ? ' · 디자인 시스템 담당은 오른쪽에서 바로 고칩니다' : ''}</p>
  <h4>앱쉘</h4>${table(['코드', '이름', '뜻', '상태', '에셋'], rows('shell'))}
  <h4>블록</h4>${table(['코드', '이름', '뜻', '상태', '에셋'], rows('block'))}`;
}

function pageComps() {
  const I = P.items().filter((i) => i.kind === 'comp');
  const noAsset = I.filter((i) => !i.key);
  const tk = ['--color-bg-brand-strongest-default', '--color-fg-neutral-strongest', '--color-fg-neutral-muted-default', '--color-bg-neutral-muted', '--color-bg-success-strongest', '--color-fg-danger-strong', '--color-border-neutral-muted', '--color-bg-brand-faint-default'];
  const pend = P.drafts((d) => d.status === 'draft' && d.type === 'figma' && d.isNew);
  return `<h3>컴포넌트</h3>
  <div class="pt-sub"><a class="ch7 on" href="#cmp">컴포넌트</a><a class="ch7" href="#icons">아이콘</a></div>
  <p class="pt-lead">행을 누르면 뜻 · 쓰이는 블록 · 규칙 · 상세 페이지 · 디자인 에셋이 있는 컴포넌트는 상세 페이지에서 미리보기와 사용 가이드를 봅니다</p>
  ${can('figma') ? `<details class="add"${pend.length ? '' : ''}><summary>Figma에서 컴포넌트 읽기</summary><form class="ef" data-form="figma-add">
      <p class="pt-lead">UI팀이 Figma 디자인 시스템에 만든 컴포넌트 노드 주소를 넣으면 형식을 맞춰 읽고 운영 게시본과 비교합니다. 카탈로그 코드에 연결하면 그 항목의 디자인 에셋이 됩니다.</p>
      <div class="ef-r"><label>카탈로그 코드<select name="code"><option value="">새 코드 (c-이름)</option>${noAsset.map((i) => `<option value="${esc(i.code)}">${esc(i.code)} ${esc(i.name)}</option>`).join('')}</select></label><label class="w">Figma 노드 주소<input name="url" required placeholder="https://www.figma.com/design/…?node-id=…"></label></div>
      <div class="row"><button class="pill sm dark">읽기 · 초안 저장</button><button type="button" class="lnk" data-act="sample">예시: Chip 노드 (흉내)</button></div></form></details>` : ''}
  ${pend.length ? `<div class="dlist">${pend.map(draftBox).join('')}</div>` : ''}
  ${table(['코드', '이름', '변형', '뜻', '상태', '에셋'], I.map((r) => tr(r.code, `<td><code>${esc(r.code)}</code> ${draftTag('item', r.code)}</td><td>${r.key ? `<a href="#${esc(r.code)}">${esc(r.name)}</a>` : esc(r.name)}</td><td>${esc(r.variants)}</td><td class="pt-tx">${esc(r.meaning)}</td><td>${stOf(r.status)}</td><td>${asset(r)}</td>`)))}
  <h4>디자인 토큰 v0.5</h4><p class="pt-lead">색 · 글꼴 · 모서리는 모두 디자인 토큰 사용 · Figma 변수에서 읽은 값</p>
  <div class="pt-tk">${tk.map((k) => `<div><i style="background:var(${k})"></i><code>${k}</code></div>`).join('')}</div>`;
}

function pagePromo() {
  const L = P.promotions();
  const actions = (p, k) => {
    if (p.status !== '대기') return '';
    const s = P.PROMO_STAGES.find((x) => x.stage === p.stage);
    if (!s) return '';
    if (role !== s.who) return `<span class="pt-k">${esc(P.ROLES[s.who])} 차례</span>`;
    const url = s.who === 'ds' ? `<input class="sm-in" id="promoUrl-${k}" placeholder="Figma 노드 주소" aria-label="Figma 노드 주소">` : '';
    return `${url}<button class="pill sm dark" data-act="promo" data-k="${k}" data-v="ok">${esc(s.act)}</button><button class="pill sm" data-act="promo" data-k="${k}" data-v="ng">반려</button>`;
  };
  return `<h3>승격 요청</h3><p class="pt-lead">임시 블록 · 컴포넌트(tb- · tc-)의 승격 · 사용 승인 SB 3건이 되면 SB Studio가 자동 등록 · 승격 심사: 구조 확인(UX 가이드 담당) → 모양 확인 · Figma 등록(디자인 시스템 담당) · 최종 승인: 포털 승인 담당 · 승인되면 코드 앞자리만 바뀜(tb- → b-, tc- → c-)</p>
  ${role === 'ux' ? `<details class="add"><summary>승격 요청 등록</summary><form class="ef" data-form="promo-add"><div class="ef-r"><label>임시 코드<input name="code" required pattern="t[bc]-[a-z0-9-]+" placeholder="tb-…"></label><label>이름<input name="name" required></label><label class="w">출처<input name="from" placeholder="SB · 화면 ID · 사용 승인 SB 건수"></label></div><label>변형 판단<input name="judge" placeholder="예: c-date-field 변형 후보"></label><button class="pill sm dark">등록</button></form></details>` : ''}
  ${table(['요청', '코드', '출처', '변형 판단', '심사', '상태', '처리'], L.map((p, k) => `<tr><td>${esc(p.id)}</td><td>${chip(p.code.split(' → ').pop(), 'bl')} ${esc(p.name)}</td><td class="pt-tx">${esc(p.from)}</td><td>${esc(p.judge)}</td><td>${esc(p.stage)}</td><td>${st(p.status === '승인' ? 'ok' : p.status === '반려' ? 'ng' : 'hold', p.status)}</td><td class="acts">${actions(p, k)}</td></tr>`))}`;
}

function pageChg() {
  const L = P.detections();
  const opts = ['새 버전 후보', '무시(토큰만)', '포털 승인 담당 승인 요청'];
  return `<h3>변경 감지 · 디자인 시스템</h3><p class="pt-lead">Figma 디자인 시스템 · UX 패턴 가이드 게시와 생성 SB의 Figma 수정을 감지 · 새 버전 후보 · 무시 · 포털 승인 담당 승인 요청 중 하나로 처리 · 새 버전 후보는 담당이 해당 페이지에서 Figma를 다시 읽어 초안으로 만듭니다</p>
  ${table(['감지', '파일', '대상', '변경', '영향', '처리'], L.map((r, k) => `<tr><td>${esc(r.at)}</td><td>${esc(r.file)}</td><td><code>${esc(r.target)}</code></td><td>${esc(r.change)}</td><td>${esc(r.impact)}</td><td>${role === 'viewer' ? st(/무시/.test(r.action) ? 'wait' : /승인 요청/.test(r.action) ? 'ai' : 'run', r.action) : `<select data-act="det" data-k="${k}" aria-label="처리">${opts.map((o) => `<option${o === r.action ? ' selected' : ''}>${o}</option>`).join('')}</select>`}</td></tr>`))}`;
}

function pagePub() {
  const pend = P.drafts((d) => d.status === 'draft');
  const done = P.drafts((d) => d.status !== 'draft');
  const H = P.history();
  const last = H[0];
  const approver = role === 'approver';
  const typeName = { item: '카탈로그', rule: '규칙', guide: '사용 가이드', figma: 'Figma' };
  const draftRow = (d) => `<tr><td>${approver ? `<input type="checkbox" name="ids" value="${d.id}" checked aria-label="${d.id} 고르기">` : ''}</td><td><b>${esc(d.id)}</b></td><td>${typeName[d.type]}</td><td>${esc(d.title)}<ul class="mini">${d.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></td><td>${esc(P.ROLES[d.by])}</td><td>${bump(d.bump)}</td><td class="acts">${approver ? `<button type="button" class="pill sm" data-act="discard" data-id="${d.id}">반려</button>` : role === d.by ? `<button type="button" class="pill sm" data-act="discard" data-id="${d.id}">버리기</button>` : ''}</td></tr>`;
  return `<h3>초안 · 게시</h3><p class="pt-lead">편집 권한이 있는 담당이 고친 내용은 초안으로 쌓이고, 포털 승인 담당이 게시하면 버전이 오르고 SB Studio가 읽는 게시본이 바뀝니다 · MAJOR 기존 것 수정 · 삭제(이미 만든 SB 재검수) · MINOR 추가 · 승격 · PATCH 설명</p>
  <h4>게시 대기 ${pend.length}건</h4>
  <form data-form="publish">${table(['', '초안', '종류', '내용', '담당', '자리', ''], pend.map(draftRow))}
  ${approver && pend.length ? `<div class="row pad"><input name="reason" class="grow" placeholder="게시 메모 (선택)"><button class="pill dark">고른 초안 게시 → ${esc(nextVersion(pend))}</button></div>` : !approver && pend.length ? '<p class="pt-lead">게시는 포털 승인 담당이 합니다.</p>' : ''}
  </form>
  ${approver && last.prevPub ? `<h4>롤백</h4><form data-form="rollback" class="row"><span>지금 게시 <b class="mono">${esc(P.version())}</b></span><input name="reason" class="grow" placeholder="롤백 사유"><button class="pill sm danger" data-confirm>${esc(last.from)}(으)로 되돌리기</button></form>` : ''}
  <h4>버전 · 변경 노트</h4>
  ${H.map((h) => `<article class="rel"><div class="row"><b class="mono">${esc(h.version)}</b>${st(h.mode === '롤백' ? 'ng' : h.mode === '구축' ? 'wait' : 'ok', h.mode)}${bump(h.bump)}<span class="pt-lead">${fmt(h.at)} · ${esc(P.ROLES[h.by] || h.by)}${h.from ? ` · ${esc(h.from)}에서` : ''}</span></div>${h.reason ? `<p>${esc(h.reason)}</p>` : ''}${(h.notes || []).length ? `<ul class="mini">${h.notes.map((n) => `<li>${n.id ? `<b>${esc(n.id)}</b> ` : ''}${esc(n.title)} ${bump(n.bump)}${n.lines ? ` · ${esc(n.lines.join(' · '))}` : ''}${n.impact ? ` <span class="pt-lead">(${esc(n.impact)})</span>` : ''}</li>`).join('')}</ul>` : ''}</article>`).join('')}
  ${done.length ? `<h4>처리된 초안</h4>${table(['초안', '내용', '담당', '결과'], done.map((d) => `<tr><td>${esc(d.id)}</td><td>${esc(d.title)}</td><td>${esc(P.ROLES[d.by])}</td><td>${st(d.status === 'published' ? 'ok' : 'ng', { published: `게시 ${d.version}`, rejected: '반려', discarded: '버림', rolled_back: '롤백' }[d.status])}</td></tr>`))}` : ''}
  ${approver ? '<h4>시연 데이터</h4><p class="row"><button class="pill sm danger" data-act="reset" data-confirm>처음 상태로 되돌리기</button><span class="pt-lead">이 브라우저에 저장된 초안 · 게시 · 승격 진행을 지웁니다</span></p>' : ''}`;
}
function nextVersion(L) {
  const B = ['PATCH', 'MINOR', 'MAJOR'];
  const b = B[Math.max(...L.map((d) => B.indexOf(d.bump)))];
  const [a, m, p] = P.version().split('.').map(Number);
  return b === 'MAJOR' ? `${a + 1}.0.0` : b === 'MINOR' ? `${a}.${m + 1}.0` : `${a}.${m}.${p + 1}`;
}

// ---------- 오른쪽 상세 ----------

export function detail() {
  if (!sel) return '';
  const r = P.item(sel);
  const sl = P.slot(sel);
  const ru = P.rulesFor(sel);
  const parts = P.parts().filter((p) => p.block === sel);
  const inB = [...new Set(P.parts().filter((p) => p.comp === sel).map((p) => p.block))];
  const nm = r ? r.name : sl ? sl.name : sel;
  const kd = r ? P.KIND[r.kind] : sl ? '빈칸' : '부품';
  const d = r ? drafted('item', r.code) : null;
  const editable = r && can(r.kind);
  return `<div class="pt-dh"><span class="pt-k">${kd}</span><b>${esc(nm)}</b><code>${esc(sel)}</code><button type="button" class="src-x" data-act="unsel" aria-label="상세 닫기">×</button></div>
  ${r ? `<dl class="kv"><dt>뜻</dt><dd>${esc(r.meaning)}</dd><dt>상태</dt><dd>${stOf(r.status)} ${asset(r)}</dd>
    ${r.kind === 'layout' ? `<dt>적용 빈칸</dt><dd><code>${esc(r.slot)}</code></dd><dt>근거 문서</dt><dd>${esc(r.guide)}</dd>` : ''}${r.kind === 'shell' ? `<dt>빈칸</dt><dd>${esc(r.slots)}</dd>` : ''}${r.kind === 'block' ? `<dt>놓이는 빈칸</dt><dd>${esc(r.slot)}</dd>` : ''}${r.kind === 'comp' ? `<dt>변형</dt><dd>${esc(r.variants)}</dd>` : ''}
    <dt>기준 원본</dt><dd>${r.design ? '모양 Figma 디자인 시스템 · 뜻 카탈로그' : r.kind === 'layout' ? `UX표준가이드 ${esc(r.guide)}` : 'UX 패턴 가이드 · 디자인 에셋 없음'}</dd>
    <dt>편집</dt><dd>${esc(P.ROLES[P.EDITOR[r.kind]])} → ${esc(P.ROLES.approver)} 게시</dd></dl>
    ${r.key ? `<p><a class="pill sm dark" href="#${esc(r.code)}">상세 페이지 · 미리보기 · 사용 가이드</a></p>` : ''}` : ''}
  ${sl ? `<dl class="kv"><dt>소속</dt><dd>${chip(sl.owner)}</dd><dt>방식</dt><dd>${esc(sl.mode)}</dd><dt>들어갈 수 있는 것</dt><dd>${esc(sl.accepts)}</dd></dl>` : ''}
  ${!r && !sl ? '<p class="pt-e">카탈로그에 없는 코드입니다</p>' : ''}
  ${draftBox(d)}
  ${editable ? itemForm(r, d) : ''}
  ${parts.length ? `<h4>구성(묶음)</h4><ul class="pt-pl">${parts.map((p) => `<li><span>${esc(p.slot)}</span>${chip(p.comp)}<em>${p.required ? '필수' : '선택'}</em></li>`).join('')}</ul>` : ''}
  ${inB.length ? `<h4>쓰이는 블록</h4><div>${inB.map((b) => chip(b)).join('')}</div>` : ''}
  ${ru.length ? `<h4>규칙 · UX표준가이드</h4><ul class="pt-rl">${ru.map((x) => `<li><b>${esc(x.id)}</b> ${esc(x.text)}<span>${esc(x.doc)} · ${esc(x.section)}</span></li>`).join('')}</ul>` : ''}`;
}

function itemForm(r, d) {
  const v = d ? { ...r, ...d.after } : r;
  const extra = r.kind === 'comp' ? ['variants', '변형'] : r.kind === 'shell' ? null : ['slot', r.kind === 'layout' ? '적용 빈칸' : '놓이는 빈칸'];
  return `<details class="add" open><summary>${d ? '초안 고치기' : '고치기'}</summary><form class="ef" data-form="item" data-code="${esc(r.code)}">
    <label>이름<input name="name" value="${esc(v.name)}" required></label>
    <label>뜻<textarea name="meaning" rows="3">${esc(v.meaning)}</textarea></label>
    ${extra ? `<label>${extra[1]}<input name="${extra[0]}" value="${esc(v[extra[0]])}"></label>` : ''}
    <label>상태<select name="status">${Object.entries(P.STATUS).map(([k, t]) => `<option value="${k}"${v.status === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    <button class="pill sm dark">초안 저장</button></form></details>`;
}

// ---------- 컴포넌트 상세 페이지에 더하는 칸 ----------

/** 상세 페이지 머리 아래: 카탈로그 코드 · 상태 · 에셋 · 역할별 편집(디자인 시스템: Figma 다시 읽기, UX: 사용 가이드 편집) */
export function compBar(c) {
  const r = P.itemByKey(c.key);
  const fd = drafted('figma', c.key);
  const gd = drafted('guide', c.key);
  const g = P.guide(c.key);
  const out = [`<div class="cbar"><div class="row">${r ? `<code class="code">${esc(r.code)}</code>${stOf(r.status)}${asset(r)}` : ''}<span class="pt-lead">게시 ${esc(P.version())}${c.figmaSyncedAt ? ` · Figma 읽음 ${fmt(c.figmaSyncedAt)}` : ''}</span>${r ? `<button class="lnk" data-act="open-detail" data-code="${esc(r.code)}">카탈로그 상세</button>` : ''}</div>`];
  if (can('figma')) {
    out.push(fd ? draftBox(fd) : `<form class="ef inline" data-form="figma-re" data-key="${esc(c.key)}"><label class="w">Figma에서 다시 읽기<input name="url" value="${esc(c.figma?.url || '')}" aria-label="Figma 노드 주소"></label><button class="pill sm dark">읽기 · 비교</button></form>`);
  }
  if (g && (can('guide') || gd)) {
    if (gd) out.push(draftBox(gd));
    if (can('guide')) out.push(ui.guideEdit ? guideEditor(c.key, gd?.after || g) : `<div class="row"><button class="pill sm dark" data-act="guide-edit">사용 가이드 편집</button><span class="pt-lead">규칙 번호(UX-${esc(c.key.toUpperCase())}-NN)는 저장할 때 붙고 고쳐도 바뀌지 않습니다</span></div>`);
  }
  out.push('</div>');
  return out.join('');
}

function guideEditor(key, g) {
  return `<form class="ef" data-form="guide" data-key="${esc(key)}">
    <label>정책 요약<textarea name="lead" rows="2">${esc(g.lead)}</textarea></label>
    <div class="ge">${g.rules.map((r) => `<div class="ge-r" data-rule="${esc(r.id)}"><code>${esc(r.id)}</code><select name="kind" aria-label="${esc(r.id)} 종류">${['rule', 'do', 'dont'].map((k) => `<option${k === r.kind ? ' selected' : ''}>${k}</option>`).join('')}</select><input name="text" value="${esc(r.text)}" aria-label="${esc(r.id)} 내용"><label class="cb"><input type="checkbox" name="remove"> 삭제</label></div>`).join('')}
    <div class="ge-r" data-new><span class="pt-lead">새 규칙</span><select name="kind" aria-label="새 규칙 종류"><option>do</option><option>dont</option><option>rule</option></select><input name="text" placeholder="rule은 '항목: 기준' 형태" aria-label="새 규칙 내용"><span></span></div></div>
    <div class="row"><button class="pill sm dark">초안 저장</button><button type="button" class="pill sm" data-act="guide-cancel">닫기</button></div></form>`;
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

/** 포털에서 Figma로 읽어 게시한(저장소에 레이어 데이터가 없는) 컴포넌트 페이지 */
export function portalOnlyPage(c) {
  const r = P.itemByKey(c.key);
  return `<p class="eyebrow">Component</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.description)}</p>${compBar(c)}
    <p class="note">디자인 포털에서 Figma 노드를 읽어 게시한 컴포넌트입니다${r ? ` (${esc(r.code)})` : ''}. 미리보기는 노드의 레이어 데이터를 받으면 그려집니다.</p>
    <h2>속성</h2><div class="table-wrap"><table class="data"><thead><tr><th>속성</th><th>타입</th><th>기본값</th><th>선택지</th></tr></thead><tbody>${c.props.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type)}</td><td>${esc(p.default)}</td><td>${esc((p.options || []).join(', '))}</td></tr>`).join('')}</tbody></table></div>
    <p class="note">변형 ${c.variants.length}개 · <a href="${esc(c.figma?.url)}" target="_blank" rel="noopener">Figma 노드 ${esc(c.figma?.nodeId)}</a></p>`;
}

// ---------- 이벤트 ----------

async function act(fn, ok, go) {
  document.body.classList.add('pt-busy');
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
    document.body.classList.remove('pt-busy');
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
  const row = e.target.closest('tr[data-href]');
  if (row && !e.target.closest('a,button')) { location.hash = row.dataset.href; return; }
  const s = e.target.closest('[data-sel]');
  if (s && !e.target.closest('[data-act], a, input, select, textarea, label')) {
    sel = s.dataset.sel === sel && s.tagName === 'TR' ? null : s.dataset.sel;
    ctx.rerender();
    return;
  }
  const t = e.target.closest('[data-act]');
  if (!t || t.tagName === 'SELECT') return;
  const d = t.dataset;
  switch (d.act) {
    case 'unsel': sel = null; return ctx.rerender();
    case 'open-detail': sel = d.code; return ctx.rerender();
    case 'kd': ui.kd = d.k; return ctx.rerender();
    case 'rule-edit': ui.editRule = ui.editRule === d.id ? null : d.id; return ctx.rerender();
    case 'rule-cancel': ui.editRule = null; return ctx.rerender();
    case 'rule-remove': return act(() => P.draftRule(role, d.id, {}, true), (x) => `${x.id} 삭제 초안 저장`).then(() => { ui.editRule = null; });
    case 'guide-edit': ui.guideEdit = true; return ctx.rerender();
    case 'guide-cancel': ui.guideEdit = false; return ctx.rerender();
    case 'sample': {
      const f = t.closest('form');
      f.url.value = `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
      f.code.value = 'c-chip';
      return;
    }
    case 'discard': return act(() => P.discard(role, d.id), (x) => (x.status === 'rejected' ? `${x.id} 반려` : `${x.id} 초안을 버렸습니다`));
    case 'publish-one': return act(() => P.publish(role, [d.id]), (h) => `게시 ${h.version}`);
    case 'promo': {
      const url = document.getElementById(`promoUrl-${d.k}`)?.value.trim();
      if (d.v === 'ok' && document.getElementById(`promoUrl-${d.k}`) && !url) return ctx.toast('Figma 노드 주소를 넣어 주세요');
      return act(() => P.promote(role, Number(d.k), d.v === 'ok', { url }), (p) => (p.status === '승인' ? `최종 승인 · ${p.code} · 게시 ${P.version()}` : p.status === '반려' ? '반려했습니다' : `${p.stage} 단계로 넘겼습니다`));
    }
    case 'reset':
      if (!confirmTwice(t)) return;
      return act(() => P.reset(), '처음 상태로 되돌렸습니다', '#stack');
  }
}

function onChange(e) {
  if (e.target.id === 'ptRole') {
    role = e.target.value;
    lsSet('bss-design-portal.role', role);
    ui.editRule = null;
    ui.guideEdit = false;
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
  switch (f.dataset.form) {
    case 'item': {
      const fields = { name: v.name, meaning: v.meaning, status: v.status };
      if ('variants' in v) fields.variants = v.variants;
      if ('slot' in v) fields.slot = v.slot;
      return act(() => P.draftItem(role, f.dataset.code, fields), (d) => `초안 ${d.id} 저장 · 포털 승인 담당 게시 대기`);
    }
    case 'rule':
      return act(() => P.draftRule(role, f.dataset.id, { kind: v.kind, section: v.section, text: v.text, targets: list(v.targets) }), (d) => `초안 ${d.id} 저장`).then((d) => { if (d) { ui.editRule = null; ctx.rerender(); } });
    case 'rule-add':
      return act(() => P.draftRule(role, null, { prefix: v.prefix, doc: v.doc, section: v.section, kind: v.kind, text: v.text, targets: list(v.targets) }), (d) => `${d.target} 추가 초안 저장`);
    case 'guide': {
      const rows = [...f.querySelectorAll('[data-rule]')].map((r) => ({ id: r.dataset.rule, kind: r.querySelector('[name=kind]').value, text: r.querySelector('[name=text]').value, remove: r.querySelector('[name=remove]').checked }));
      const nr = f.querySelector('[data-new]');
      const add = [{ kind: nr.querySelector('[name=kind]').value, text: nr.querySelector('[name=text]').value }];
      return act(() => P.draftGuide(role, f.dataset.key, { lead: v.lead, rules: rows, add }), (d) => `초안 ${d.id} 저장 · 포털 승인 담당 게시 대기`).then((d) => { if (d) { ui.guideEdit = false; ctx.rerender(); } });
    }
    case 'figma-re':
      return act(() => P.draftFigma(role, { key: f.dataset.key, url: v.url.trim() }), (d) => `Figma 읽기 · ${d.lines.join(' · ')} · 초안 ${d.id}`);
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
