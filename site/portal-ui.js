// 디자인 포털: 문서 사이트 페이지에 역할별 영역을 더한다 (SB Studio 안의 메뉴 하나로 쓰는 POC).
//   보기      : 수정 요청 · 아이콘 요청 · 내 요청 상태
//   DS 담당자 : 컴포넌트 추가 · 피그마 재변환 · 미리보기 챗 · 배포 요청
//   UX 담당자 : 가이드 · 패턴 규칙 편집(규칙 번호 자동) · SB 블록 편집 · 승격 1단 심사
//   관리자    : 운영 배포(정기 · 수동) · 롤백 · 버전
// 업무 규칙은 portal-core.js(poc/lib를 묶은 것)가 브라우저 안에서 돌린다. 저장은 이 브라우저에만.
import { request, tokensCss, iconSvg } from './portal-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const FIGMA_FILE = 'WcoI745J38TaON7iCKcutW';

export const ROLE_NAME = { viewer: '보기', ux: 'UX 담당자', ds: 'DS 담당자', admin: '관리자', studio: 'SB Studio' };
const OWNER = { ds: 'ds', icon: 'ds', promote: 'ds', ux: 'ux', sb: 'ux' };
const CASE_SHORT = { ds: '컴포넌트', ux: '가이드 · 규칙', sb: 'SB 블록', icon: '아이콘', promote: '승격' };
const STEPS = {
  ds: ['requested', 'working', 'preview', 'checked', 'deploy_requested', 'deployed'],
  icon: ['requested', 'working', 'preview', 'checked', 'deploy_requested', 'deployed'],
  promote: ['requested', 'working', 'preview', 'checked', 'deploy_requested', 'deployed'],
  ux: ['working', 'preview', 'checked', 'deploy_requested', 'deployed'],
  sb: ['working', 'preview', 'checked', 'deploy_requested', 'deployed'],
};
const STEP_LABEL = { requested: '요청', working: '작업 · 편집', preview: '미리보기', checked: '작동 확인', deploy_requested: '배포 요청', deployed: '운영 배포' };
const CLOSED = ['deployed', 'rejected', 'rolled_back'];

let S = null; // 포털 상태 (overview)
let role = 'viewer';
let rerender = () => {};
let toast = () => {};

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* 저장 못 해도 동작 */ } }

const api = (path, body) => request(path, body, role);
export const state = () => S;
export const currentRole = () => role;
const own = (c) => role === OWNER[c.case] || role === 'admin';
const openFor = (pred) => (S?.changes || []).filter((c) => !CLOSED.includes(c.status) && pred(c));

async function refresh() {
  S = await api('/api/state');
}

export async function init(opts) {
  rerender = opts.rerender;
  toast = opts.toast;
  role = lsGet('ds.portal.role') || 'viewer';
  await refresh();
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'portalRole') return;
    role = e.target.value;
    lsSet('ds.portal.role', role);
    refresh().then(() => rerender()).catch((err) => toast(err.message));
  });
}

// 실행 → 상태 다시 읽기 → 다시 그리기. go: 이동할 해시(함수면 결과로 만든다)
async function act(fn, ok, go) {
  document.body.classList.add('pt-busy');
  try {
    const out = await fn();
    await refresh();
    const hash = typeof go === 'function' ? go(out) : go;
    if (hash && location.hash !== hash) location.hash = hash; // hashchange가 다시 그린다
    else rerender();
    if (ok) toast(typeof ok === 'function' ? ok(out) : ok);
    return out;
  } catch (e) {
    toast(e.message);
    return null;
  } finally {
    document.body.classList.remove('pt-busy');
  }
}

// ---------- 배포된 기준을 사이트 데이터에 덮어쓰기 ----------

function applyRules(pl, rules) {
  const fromByName = Object.fromEntries((pl.rules || []).map((r) => [r.name, r.from]));
  pl.rules = rules.filter((r) => r.kind === 'rule').map((r) => {
    const i = r.text.indexOf(': ');
    const name = i > 0 ? r.text.slice(0, i) : '기준';
    return { id: r.id, name, desc: i > 0 ? r.text.slice(i + 2) : r.text, from: fromByName[name] || '포털에서 추가' };
  });
  pl.do = rules.filter((r) => r.kind === 'do').map((r) => ({ id: r.id, text: r.text }));
  pl.dont = rules.filter((r) => r.kind === 'dont').map((r) => ({ id: r.id, text: r.text }));
}

/** 저장소 JSON(base)에 운영 서버 기준을 덮어쓴 복사본. 포털에서 추가한 컴포넌트도 넣는다. */
export function overlay(base) {
  const out = base.map((c) => structuredClone(c));
  if (!S) return out;
  for (const rc of S.baseline.components) {
    const c = out.find((x) => x.key === rc.key);
    if (!c) {
      out.push({ key: rc.key, name: rc.name, description: rc.description, schemaVersion: 0, portalOnly: true, props: rc.props, figma: rc.figma, variants: [], variantCount: rc.variants, tokens: [] });
      continue;
    }
    c.description = rc.description;
    if (c.guide?.policy) c.guide.policy.lead = rc.guideLead;
  }
  for (const p of S.baseline.uxPatterns) {
    if (p.scope !== 'component') continue;
    const c = out.find((x) => x.key === p.key);
    if (c?.guide?.policy) applyRules(c.guide.policy, p.rules);
  }
  return out;
}

/** 포털에서 배포한 아이콘을 아이콘 목록에 더한다 (SVG는 포털이 보관) */
export function overlayIcons(base) {
  const out = structuredClone(base);
  if (!S) return out;
  const have = new Set(out.icons.map((i) => i.key));
  const added = S.baseline.icons.filter((i) => !have.has(i.key) && i.status === 'ready');
  if (!added.length) return out;
  const GROUP = '디자인 포털에서 추가';
  const sec = out.sections.find((x) => x.style === 'line') || out.sections[0];
  if (!sec.groups.includes(GROUP)) sec.groups.push(GROUP);
  for (const i of added) out.icons.push({ name: i.name, style: sec.style, group: GROUP, file: '', svg: (iconSvg(i.name) || '').trim(), figmaName: `Icon/Line/${i.name}`, nodeId: i.nodeId, key: i.key });
  return out;
}

// ---------- 위쪽 막대 · 메뉴 ----------

export function topbar() {
  const r = S.release;
  return `
    <span class="pt-ver" title="SB Studio는 운영 버전만 읽습니다">운영 <b>${esc(r.current)}</b>${r.preparing ? ` · 준비 <b>${esc(r.preparing)}</b>` : ''}</span>
    <label class="pt-role"><span>역할</span>
      <select id="portalRole" aria-label="역할 (POC: SB Studio 로그인 대신)">
        ${['viewer', 'ux', 'ds', 'admin'].map((k) => `<option value="${k}" ${k === role ? 'selected' : ''}>${ROLE_NAME[k]}</option>`).join('')}
      </select>
    </label>`;
}

export function nav() {
  const mine = openFor((c) => OWNER[c.case] === role || c.requestedBy === role).length;
  const queue = S.changes.filter((c) => c.status === 'deploy_requested').length;
  const cnt = (n) => (n ? ` <span class="pt-count">${n}</span>` : '');
  return `
    <div class="nav-title">디자인 포털</div>
    <a href="#changes" data-route="changes">${role === 'viewer' ? '내 요청' : '변경 · 요청'}${cnt(mine)}</a>
    <a href="#releases" data-route="releases">버전 · 배포${role === 'admin' ? cnt(queue) : ''}</a>
    <a href="#sblib" data-route="sblib">SB library</a>`;
}

// ---------- 공통 조각 ----------

const pill = (cls, text) => `<span class="pt-pill ${cls}">${esc(text)}</span>`;
function statusPill(st) {
  const cls = { deployed: 'ok', deploy_requested: 'accent', checked: 'accent', preview: 'warn', rejected: 'bad', rolled_back: 'bad' }[st] || '';
  return pill(cls, S.statuses[st] || st);
}
const bumpPill = (b) => (b ? `<span class="pt-pill bump-${b}" title="버전 자리">${b}</span>` : '');
const changeLink = (c) => `<a href="#change-${c.id}" class="pt-change-link"><span class="mono">${c.id}</span> ${esc(c.title)} ${statusPill(c.status)}</a>`;

function changeTable(list, empty) {
  if (!list.length) return `<p class="pt-empty">${esc(empty)}</p>`;
  return `<div class="table-wrap"><table class="data pt-table"><thead><tr><th>번호</th><th>구분</th><th>제목</th><th>상태</th><th>버전 자리</th><th>요청</th><th>갱신</th></tr></thead><tbody>${list
    .map((c) => `<tr><td class="mono"><a href="#change-${c.id}">${c.id}</a></td><td>${CASE_SHORT[c.case]}</td><td><a href="#change-${c.id}">${esc(c.title)}</a></td><td>${statusPill(c.status)}</td><td>${bumpPill(c.diff?.bump)}</td><td>${ROLE_NAME[c.requestedBy] || esc(c.requestedBy)}</td><td class="pt-muted">${fmtTime(c.updatedAt)}</td></tr>`)
    .join('')}</tbody></table></div>`;
}

function checksBlock(checks) {
  if (!checks?.length) return '<p class="pt-muted">아직 자동 확인 전입니다.</p>';
  return `<ul class="pt-checks">${checks
    .map((c) => `<li>${pill(c.pass ? 'ok' : 'bad', c.pass ? '통과' : '미달')} <b>${esc(c.name)}</b> <span class="pt-muted">${esc(c.detail || '')}</span>${c.problems?.length ? `<ul class="pt-problems">${c.problems.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}</li>`)
    .join('')}</ul>`;
}

function previewFrame(source) {
  const doc = `<!doctype html><style>${tokensCss()}body{font:14px/1.5 system-ui,sans-serif;margin:12px;color:#1c1f23;background:#fff}</style>${source || ''}`;
  return `<iframe class="pt-frame" sandbox srcdoc="${esc(doc)}" title="미리보기"></iframe>`;
}

// ---------- 페이지에 더해지는 영역 ----------

/** 개요 페이지 위쪽 */
export function overviewPanel() {
  const open = openFor(() => true);
  const myQueue = role === 'admin' ? S.changes.filter((c) => c.status === 'deploy_requested').length : openFor((c) => OWNER[c.case] === role).length;
  const label = { viewer: '내 요청', ux: 'UX 담당 진행 중', ds: 'DS 담당 진행 중', admin: '배포 대기' }[role];
  const notes = S.notifications.slice(0, 5);
  return `
    <section class="pt-panel" aria-label="디자인 포털">
      <div class="pt-panel-head"><span class="pt-tag">디자인 포털</span><span class="pt-muted">${ROLE_NAME[role]}로 보는 중 · 역할은 위쪽에서 바꿉니다 (POC)</span></div>
      <div class="pt-stats">
        <a class="pt-stat" href="#releases"><span>운영 버전</span><b>${esc(S.release.current)}</b></a>
        <a class="pt-stat" href="#changes"><span>진행 중 변경</span><b>${open.length}</b></a>
        <a class="pt-stat" href="${role === 'admin' ? '#releases' : '#changes'}"><span>${label}</span><b>${role === 'viewer' ? openFor((c) => c.requestedBy === 'viewer').length : myQueue}</b></a>
      </div>
      ${notes.length ? `<ul class="pt-notes">${notes.map((n) => `<li><span class="pt-muted">${fmtTime(n.at)}</span> ${n.ref?.startsWith('CH-') ? `<a href="#change-${n.ref}">${esc(n.text)}</a>` : esc(n.text)}</li>`).join('')}</ul>` : ''}
      <p class="pt-muted pt-small">브라우저 데모: 진행한 내용은 이 브라우저에만 저장되고, 피그마 변환과 AI는 흉내 모드입니다.</p>
    </section>`;
}

/** 컴포넌트 페이지 위쪽 (제목 아래) */
export function componentPanel(c) {
  const mine = openFor((x) => x.target?.key === c.key && (x.case === 'ds' || x.case === 'ux'));
  const parts = [];
  parts.push(`<div class="pt-panel-head"><span class="pt-tag">디자인 포털</span><span class="pt-muted">운영 ${esc(S.release.current)} 기준</span>${mine.map(changeLink).join('')}</div>`);

  if (role === 'viewer') {
    parts.push(`<details class="pt-fold"><summary>수정 요청</summary>
      <form data-p-form="req-comp" data-key="${esc(c.key)}" class="pt-form">
        <label>무엇을 고쳐야 하나요<textarea name="detail" id="reqDetail-${esc(c.key)}" required placeholder="예: disabled 상태 대비가 낮아 읽기 어렵습니다"></textarea></label>
        <label>구분<select name="kind" id="reqKind-${esc(c.key)}"><option value="ds">디자인 (컴포넌트 · 토큰) → DS 담당자</option>${c.guide ? '<option value="ux">사용 가이드 · 규칙 → UX 담당자</option>' : ''}</select></label>
        <button class="btn pt-primary">요청 보내기</button>
      </form></details>`);
  }

  if (role === 'ds' || role === 'admin') {
    const dsOpen = mine.find((x) => x.case === 'ds');
    parts.push(dsOpen
      ? dsOpen.status === 'requested'
        ? `<p class="pt-row">수정 요청이 들어왔습니다: <a href="#change-${dsOpen.id}">${esc(dsOpen.detail || dsOpen.title)}</a><button class="btn pt-primary" data-p="start" data-id="${dsOpen.id}">작업 시작</button></p>`
        : `<p class="pt-row">DS 작업 중: <a class="btn" href="#change-${dsOpen.id}">${esc(dsOpen.id)} 열기</a></p>`
      : `<details class="pt-fold" open><summary>DS 작업 · 피그마에서 다시 읽기</summary>
        <form data-p-form="ds-reconvert" data-key="${esc(c.key)}" class="pt-form">
          <p class="pt-muted pt-small">UI팀이 피그마에서 고친 뒤, 그 노드 주소로 다시 변환합니다. 형식 · 키를 자동 확인하고 운영 버전과 비교한 미리보기를 만듭니다.</p>
          <div class="pt-row"><input name="url" id="figmaUrl-${esc(c.key)}" class="pt-grow" value="${esc(c.figma?.url || '')}" aria-label="피그마 주소"><button class="btn pt-primary">변환 · 미리보기</button></div>
        </form></details>`);
  }

  if ((role === 'ux' || role === 'admin') && c.guide?.policy) {
    const uxOpen = mine.find((x) => x.case === 'ux');
    parts.push(uxOpen
      ? uxOpen.status === 'requested'
        ? `<p class="pt-row">가이드 수정 요청이 들어왔습니다: <a href="#change-${uxOpen.id}">${esc(uxOpen.detail || uxOpen.title)}</a><button class="btn pt-primary" data-p="start" data-id="${uxOpen.id}">편집 시작</button></p>`
        : `<p class="pt-row">가이드 편집 중: <a class="btn" href="#change-${uxOpen.id}">${esc(uxOpen.id)} 열기</a></p>`
      : `<p class="pt-row"><button class="btn pt-primary" data-p="ux-edit" data-key="${esc(c.key)}">사용 가이드 · 규칙 편집</button><span class="pt-muted pt-small">규칙 번호는 저장할 때 붙고, 고쳐도 바뀌지 않습니다.</span></p>`);
  }

  if (role === 'admin') {
    const q = S.changes.filter((x) => x.status === 'deploy_requested' && x.target?.key === c.key);
    if (q.length) parts.push(`<p class="pt-row">배포 대기 ${q.length}건 · <a href="#releases">버전 · 배포에서 배포</a></p>`);
  }
  return `<section class="pt-panel" aria-label="디자인 포털">${parts.join('')}</section>`;
}

/** 포털에서 추가된(저장소 JSON에 없는) 컴포넌트 페이지 */
export function portalOnlyPage(c) {
  return `
    <p class="eyebrow">Component</p>
    <h1>${esc(c.name)}</h1>
    <p class="lead">${esc(c.description)}</p>
    ${componentPanel(c)}
    <p class="note">디자인 포털에서 추가되어 운영 ${esc(S.release.current)}에 배포된 컴포넌트입니다. 미리보기는 피그마 노드의 레이어 데이터를 받으면 그려집니다.</p>
    <h2>속성</h2>
    <div class="table-wrap"><table class="data"><thead><tr><th>속성</th><th>타입</th><th>기본값</th><th>선택지</th></tr></thead><tbody>${c.props
      .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type)}</td><td>${esc(p.default)}</td><td>${esc((p.options || []).join(', '))}</td></tr>`)
      .join('')}</tbody></table></div>
    <p class="note">변형 ${c.variantCount}개 · <a href="${esc(c.figma?.url)}" target="_blank" rel="noopener">피그마 노드 ${esc(c.figma?.nodeId)}</a></p>`;
}

/** 전체 목록 페이지 아래쪽 */
export function listPanel() {
  if (role === 'ds' || role === 'admin') {
    return `<section class="pt-panel" aria-label="컴포넌트 추가">
      <div class="pt-panel-head"><span class="pt-tag">DS 작업</span><b>컴포넌트 추가</b></div>
      <form data-p-form="ds-new" class="pt-form">
        <p class="pt-muted pt-small">UI팀이 피그마에 만든 컴포넌트 노드 주소를 넣으면 형식을 맞춰 변환하고 미리보기를 만듭니다. 확인 뒤 배포 요청하면 관리자가 운영에 배포합니다 (MINOR).</p>
        <div class="pt-row"><input name="title" id="newTitle" class="pt-grow" required placeholder="컴포넌트 이름 (예: Chip)"></div>
        <div class="pt-row"><input name="url" id="newUrl" class="pt-grow" required placeholder="https://www.figma.com/design/…?node-id=…"><button class="btn pt-primary">변환 · 미리보기</button></div>
        <p class="pt-muted pt-small">예시: <a href="#" data-p="fill-sample">Chip 노드 (흉내)</a></p>
      </form>
      ${openFor((x) => x.case === 'ds' && !x.target?.key).length ? `<h3>요청 · 진행 중</h3>${changeTable(openFor((x) => x.case === 'ds' && (!x.target?.key || x.target?.isNew)), '')}` : ''}
    </section>`;
  }
  return `<section class="pt-panel" aria-label="새 컴포넌트 요청">
    <details class="pt-fold"><summary>새 컴포넌트 요청</summary>
      <form data-p-form="req-new" class="pt-form">
        <label>이름<input name="title" id="reqNewTitle" required placeholder="예: Chip"></label>
        <label>왜 필요한가요<textarea name="detail" id="reqNewDetail" placeholder="쓰는 화면, 지금은 어떻게 대신하고 있는지"></textarea></label>
        <button class="btn pt-primary">요청 보내기</button>
      </form></details></section>`;
}

/** 아이콘 페이지 위쪽 */
export function iconsPanel() {
  const reqs = openFor((x) => x.case === 'icon');
  return `<section class="pt-panel" aria-label="아이콘 요청">
    <div class="pt-panel-head"><span class="pt-tag">디자인 포털</span><span class="pt-muted">새 아이콘 추가는 MINOR, 기존 아이콘 수정 · 삭제는 컴포넌트 수정(MAJOR)으로 갑니다.</span></div>
    ${reqs.length ? `<p class="pt-row">제작 요청 ${reqs.map(changeLink).join('')}</p>` : ''}
    <details class="pt-fold"><summary>아이콘 요청</summary>
      <form data-p-form="req-icon" class="pt-form">
        <div class="pt-grid2">
          <label>이름 (영문 PascalCase)<input name="name" id="iconName" required pattern="[A-Z][A-Za-z0-9]*" placeholder="예: Upload"></label>
          <label>쓰는 화면 · 크기<input name="screens" id="iconScreens" placeholder="예: 청구 내역 · 16"></label>
        </div>
        <p class="pt-muted pt-small">이름을 먼저 정해 두면 SB에 더미로 넣고 작업을 이어 갈 수 있습니다. 배포되면 더미가 자동으로 바뀝니다.</p>
        <button class="btn pt-primary">요청 보내기</button>
      </form></details></section>`;
}

/** 패턴 페이지 아래쪽: 규칙 번호 목록 + 편집 */
export function patternPanel(p) {
  const up = S.baseline.uxPatterns.find((x) => x.key === `pattern-${p.key}`);
  if (!up) return '';
  const open = openFor((x) => x.case === 'ux' && x.target?.key === up.key)[0];
  return `<section class="pt-panel" aria-label="패턴 규칙">
    <div class="pt-panel-head"><span class="pt-tag">디자인 포털</span><b>규칙 번호</b><span class="pt-muted">SB Studio 그리기 검수가 근거로 붙이는 번호입니다</span></div>
    <div class="table-wrap"><table class="data"><thead><tr><th>번호</th><th>종류</th><th>규칙</th></tr></thead><tbody>${up.rules
      .map((r) => `<tr><td class="mono">${esc(r.id)}</td><td class="kind-${r.kind}">${r.kind}</td><td>${esc(r.text)}</td></tr>`)
      .join('')}</tbody></table></div>
    ${role === 'ux' || role === 'admin'
      ? open
        ? open.status === 'requested'
          ? `<p class="pt-row">규칙 수정 요청이 들어왔습니다: <a href="#change-${open.id}">${esc(open.detail || open.title)}</a><button class="btn pt-primary" data-p="start" data-id="${open.id}">편집 시작</button></p>`
          : `<p class="pt-row">편집 중: <a class="btn" href="#change-${open.id}">${esc(open.id)} 열기</a></p>`
        : `<p class="pt-row"><button class="btn pt-primary" data-p="ux-edit" data-key="${esc(up.key)}">패턴 규칙 편집</button></p>`
      : role === 'viewer'
        ? `<details class="pt-fold"><summary>규칙 수정 요청</summary><form data-p-form="req-ux" data-key="${esc(up.key)}" class="pt-form"><label>내용<textarea name="detail" id="uxReq-${esc(up.key)}" required placeholder="현업 요청 · 반복되는 예외 사례 · 신규 패턴"></textarea></label><button class="btn pt-primary">요청 보내기</button></form></details>`
        : ''}
  </section>`;
}

// ---------- 포털 페이지 ----------

export const ROUTES = ['changes', 'releases', 'sblib'];
export const isPortalRoute = (r) => ROUTES.includes(r) || r.startsWith('change-');

export function page(route) {
  if (route === 'changes') return pageChanges();
  if (route === 'releases') return pageReleases();
  if (route === 'sblib') return pageSbLib();
  if (route.startsWith('change-')) return pageChange(route.slice(7));
  return '';
}

function pageChanges() {
  const all = S.changes;
  const mineOwn = all.filter((c) => OWNER[c.case] === role);
  const mineReq = all.filter((c) => c.requestedBy === role || (role === 'viewer' && c.requestedBy === 'studio'));
  return `
    <p class="eyebrow">디자인 포털</p>
    <h1>${role === 'viewer' ? '내 요청' : '변경 · 요청'}</h1>
    <p class="lead">요청 → 작업(피그마 · 포털 편집) → 미리보기 → 작동 확인 → 배포 요청 → 관리자가 운영에 배포. 각 페이지의 역할 영역에서 시작한 변경이 여기 모입니다.</p>
    ${role === 'ds' || role === 'ux' ? `<h2>내 담당 (${ROLE_NAME[role]})</h2>${changeTable(mineOwn, '담당 변경이 없습니다')}` : ''}
    <h2>내가 요청한 것</h2>${changeTable(mineReq, '요청한 것이 없습니다. 컴포넌트 · 아이콘 · 패턴 페이지의 "수정 요청"에서 시작합니다')}
    ${role !== 'viewer' ? `<h2>전체</h2>${changeTable(all, '변경이 없습니다')}` : ''}`;
}

function pageReleases() {
  const r = S.release;
  const q = S.changes.filter((c) => c.status === 'deploy_requested');
  const last = r.history[0];
  const admin = role === 'admin';
  return `
    <p class="eyebrow">디자인 포털</p>
    <h1>버전 · 배포</h1>
    <p class="lead">SB Studio는 운영 버전만 읽습니다. MAJOR는 기존 것을 고치거나 지울 때(이미 만든 SB 재검수), MINOR는 추가 · 승격, PATCH는 설명 · 오탈자입니다. 미리보기 중에는 <span class="mono">${esc(r.preparing || r.current)}-preview.N</span>으로 표기합니다.</p>
    ${admin ? `
    <h2>배포 대기 ${q.length}건</h2>
    ${q.length ? `<form data-p-form="deploy" class="pt-form">
      <div class="table-wrap"><table class="data pt-table"><thead><tr><th>수동</th><th>번호</th><th>구분</th><th>제목</th><th>변경 요약</th><th>자리</th></tr></thead><tbody>${q
        .map((c) => `<tr><td><input type="checkbox" name="ids" value="${c.id}" id="dep-${c.id}" aria-label="${c.id} 고르기"></td><td class="mono"><a href="#change-${c.id}">${c.id}</a></td><td>${CASE_SHORT[c.case]}</td><td>${esc(c.title)}</td><td>${esc(c.deploySummary)}</td><td>${bumpPill(c.diff.bump)}</td></tr>`)
        .join('')}</tbody></table></div>
      <div class="pt-row"><button class="btn pt-primary" name="mode" value="regular">정기 배포 (${q.length}건 모두)</button><input name="reason" id="depReason" class="pt-grow" placeholder="수동 배포 사유 (긴급 수정 · 아이콘 추가 등)"><button class="btn" name="mode" value="manual">고른 건 수동 배포</button></div>
    </form>` : '<p class="pt-empty">배포 요청이 없습니다</p>'}
    <h2>롤백</h2>
    <form data-p-form="rollback" class="pt-row">
      <span>지금 운영 <b class="mono">${esc(r.current)}</b></span>
      <input name="reason" id="rbReason" class="pt-grow" placeholder="롤백 사유">
      <button class="btn pt-danger" ${!last.from || last.mode === '롤백' ? 'disabled' : ''} data-confirm="${last.from ? `${last.from}(으)로 되돌리기` : ''}">${last.from && last.mode !== '롤백' ? `${esc(last.from)}(으)로 되돌리기` : '되돌릴 버전 없음'}</button>
    </form>` : `<p class="note">배포 · 롤백은 관리자 역할에서 열립니다.</p>`}
    <h2>버전 목록 · 변경 노트</h2>
    ${r.history.map((h) => `<article class="pt-release">
      <div class="pt-row"><b class="mono">${esc(h.version)}</b>${pill('', h.mode)}${bumpPill(h.bump)}<span class="pt-muted">${fmtTime(h.at)}${h.from ? ` · ${esc(h.from)}에서` : ''}</span></div>
      ${h.reason ? `<p class="pt-small">사유: ${esc(h.reason)}</p>` : ''}
      ${h.notes?.length ? `<ul class="pt-small">${h.notes.map((n) => `<li><a href="#change-${n.changeId}">${n.changeId}</a> ${esc(n.title)} ${bumpPill(n.bump)} · ${esc(n.what.join(' · '))} <span class="pt-muted">(${esc(n.impact)})</span></li>`).join('')}</ul>` : ''}
    </article>`).join('')}`;
}

function pageSbLib() {
  const list = S.baseline.sbBlocks;
  const min = S.promoteMinUsage;
  const ux = role === 'ux' || role === 'admin';
  const stageText = { 'sb-approved': '1단 통과 · UI팀 디자인 중', declined: '승격 안 함' };
  return `
    <p class="eyebrow">디자인 포털</p>
    <h1>SB library</h1>
    <p class="lead">SB Studio가 공통 블록 · 컴포넌트로 만들 수 없을 때 만든 1회성 블록입니다. 포털에서 소스로 고치고, Storyboard ${min}곳 이상에서 쓰이면 승격 후보가 되어 2단 심사(SB팀 표준 → UI팀 디자인)를 거쳐 공통 블록이 됩니다.</p>
    ${S.baseline.commonBlocks.length ? `<h2>공통 블록 (승격됨)</h2>${S.baseline.commonBlocks.map((b) => `<article class="pt-block"><div class="pt-row"><b>${esc(b.name)}</b><span class="mono pt-muted">${esc(b.id)}</span>${pill('ok', `${b.promotedIn} 승격`)}<span class="pt-muted">${esc(b.from)}에서</span></div>${previewFrame(b.source)}</article>`).join('')}` : ''}
    <h2>SB 블록</h2>
    ${list.length ? list.map((b) => {
      const stage = b.promotion?.stage;
      const cand = (b.usage || []).length >= min;
      const editing = openFor((x) => x.case === 'sb' && x.target?.key === b.id)[0];
      return `<article class="pt-block">
        <div class="pt-row"><b>${esc(b.name)}</b><span class="mono pt-muted">${esc(b.id)}</span>${pill('', `${(b.usage || []).length}곳 사용`)}${stage === 'promoted' ? pill('ok', `공통 블록 ${b.promotion.to}`) : stage ? pill(stage === 'declined' ? 'bad' : 'accent', stageText[stage]) : cand ? pill('warn', '승격 후보') : ''}</div>
        <p class="pt-small pt-muted">${esc(b.purpose)} · 만든 곳 ${esc(b.createdBy || '-')} · 사용: ${esc((b.usage || []).join(', ') || '-')}</p>
        ${previewFrame(b.source)}
        ${ux ? `<div class="pt-row">${editing ? `<a class="btn" href="#change-${editing.id}">${editing.id} 편집 중</a>` : `<button class="btn" data-p="sb-edit" data-key="${esc(b.id)}">소스 편집</button>`}${!stage && cand ? `<input id="note-${esc(b.id)}" class="pt-grow" placeholder="심사 메모 (선택)"><button class="btn pt-primary" data-p="promote" data-key="${esc(b.id)}">1단 심사 통과 (SB팀 표준)</button><button class="btn" data-p="decline" data-key="${esc(b.id)}">승격 안 함</button>` : ''}</div>` : ''}
      </article>`;
    }).join('') : '<p class="pt-empty">SB 블록이 없습니다</p>'}`;
}

// ---------- 변경 상세 (작업 공간) ----------

function sampleUrl(c) {
  if (c.case === 'icon') return `https://www.figma.com/design/${FIGMA_FILE}/Icons?node-id=9100-${c.id.replace(/\D/g, '')}`;
  if (c.case === 'promote') return `https://www.figma.com/design/${FIGMA_FILE}/Blocks?node-id=9200-${c.id.replace(/\D/g, '')}`;
  const comp = S.baseline.components.find((x) => x.key === c.target?.key);
  return comp ? comp.figma.url : `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
}

function targetLink(c) {
  const k = c.target?.key;
  if (!k) return '';
  if (c.case === 'ds' && S.baseline.components.some((x) => x.key === k)) return `<a href="#${esc(k)}">← ${esc(k)} 페이지</a>`;
  if (c.case === 'ux') return k.startsWith('pattern-') ? `<a href="#${esc(k)}">← 패턴 페이지</a>` : `<a href="#${esc(k)}">← ${esc(k)} 페이지</a>`;
  if (c.case === 'sb' || c.case === 'promote') return '<a href="#sblib">← SB library</a>';
  if (c.case === 'icon') return '<a href="#icons">← 아이콘</a>';
  return '';
}

function pageChange(id) {
  const c = S.changes.find((x) => x.id === id);
  if (!c) return `<p class="error">변경 ${esc(id)}가 없습니다. 이 브라우저에서 만든 변경만 보입니다.</p>`;
  const mine = own(c);
  const editable = mine && ['working', 'preview', 'checked'].includes(c.status);
  const list = STEPS[c.case];
  const at = list.indexOf(c.status);
  const out = [];
  out.push(`<p class="pt-small">${targetLink(c)}</p>
    <p class="eyebrow">${esc(S.cases[c.case])}</p>
    <h1>${esc(c.title)}</h1>
    <div class="pt-row">${statusPill(c.status)}${bumpPill(c.diff?.bump)}${c.previewVersion ? pill('warn mono', c.previewVersion) : ''}${c.deployedIn ? pill('ok mono', c.deployedIn) : ''}<span class="pt-muted">${c.id} · ${ROLE_NAME[c.requestedBy] || esc(c.requestedBy)} 요청 · 담당 ${ROLE_NAME[OWNER[c.case]]}</span></div>
    ${c.detail ? `<p class="note">${esc(c.detail)}</p>` : ''}
    <ol class="pt-steps">${list.map((s, k) => `<li class="${k < at || c.status === 'deployed' ? 'done' : ''} ${k === at && c.status !== 'deployed' ? 'now' : ''}">${STEP_LABEL[s]}</li>`).join('')}</ol>`);

  if (!mine && !CLOSED.includes(c.status)) out.push(`<p class="note">${ROLE_NAME[OWNER[c.case]]} 역할에서 이 변경을 처리합니다.</p>`);

  if (c.status === 'requested' && mine)
    out.push(`<section class="pt-panel"><div class="pt-panel-head"><b>요청 처리</b></div>
      <p class="pt-small pt-muted">${c.case === 'ux' ? '포털에서 가이드 · 규칙을 편집합니다.' : 'UI팀이 피그마에서 제작 · 수정한 뒤, 그 노드 주소로 변환합니다.'}</p>
      <form data-p-form="reject" data-id="${c.id}" class="pt-row"><button type="button" class="btn pt-primary" data-p="start" data-id="${c.id}">작업 시작</button><input name="reason" id="rej-${c.id}" class="pt-grow" placeholder="반려 사유"><button class="btn pt-danger">반려</button></form></section>`);

  if (editable) {
    if (['ds', 'icon', 'promote'].includes(c.case))
      out.push(`<section class="pt-panel"><div class="pt-panel-head"><b>피그마 주소 · 소스 변환</b></div>
        <form data-p-form="convert" data-id="${c.id}" class="pt-form">
          <p class="pt-small pt-muted">Figma REST API로 노드를 읽어 정해진 형식으로 바꾸고 형식 · 키를 자동 확인합니다. 같은 주소면 항상 같은 결과가 나옵니다. (지금은 흉내 모드)</p>
          <div class="pt-row"><input name="url" id="conv-${c.id}" class="pt-grow" value="${esc(c.source?.figmaUrl || sampleUrl(c))}" aria-label="피그마 주소"><button class="btn pt-primary">변환 · 미리보기</button></div>
        </form></section>`);
    else if (c.case === 'ux') out.push(uxEditor(c));
    else if (c.case === 'sb') out.push(sbEditor(c));
  }

  if (c.checks?.length || c.diff)
    out.push(`<div class="pt-grid2"><section class="pt-panel"><div class="pt-panel-head"><b>자동 확인</b></div>${checksBlock(c.checks)}</section>
      <section class="pt-panel"><div class="pt-panel-head"><b>운영 대비 바뀐 점</b>${bumpPill(c.diff?.bump)}</div>${c.diff ? `<ul class="pt-small">${c.diff.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</section></div>`);

  if (c.draft && c.status !== 'requested') out.push(`<section class="pt-panel"><div class="pt-panel-head"><b>미리보기</b>${c.previewVersion ? `<span class="mono pt-muted">${esc(c.previewVersion)}</span>` : ''}</div>${draftPreview(c)}</section>`);

  if (['preview', 'checked'].includes(c.status) || c.chat.length) {
    const canChat = mine && ['preview', 'checked'].includes(c.status);
    const hint = c.case === 'ux' ? '예: do 규칙 추가: 잠긴 이유를 버튼 옆에 적습니다' : c.case === 'sb' ? '예: 이름을 조회 결과 목록으로 바꿔 줘' : '예: 설명을 필터 칩으로 바꿔 줘';
    out.push(`<section class="pt-panel"><div class="pt-panel-head"><b>미리보기 챗</b>${pill('warn', '흉내 모드')}</div>
      <p class="pt-small pt-muted">말로 요청하면 소스를 고치고 미리보기가 갱신됩니다. 토큰 값 · variants · props처럼 피그마에서 온 칸은 막혀 있습니다.</p>
      ${c.chat.length ? `<div class="pt-chat">${c.chat.map((m) => `<p class="pt-msg ${m.from}">${esc(m.text)}</p>`).join('')}</div>` : ''}
      ${canChat ? `<form data-p-form="chat" data-id="${c.id}" class="pt-row"><input name="m" id="chat-${c.id}" class="pt-grow" placeholder="${esc(hint)}" autocomplete="off"><button class="btn pt-primary">보내기</button></form>` : ''}</section>`);
  }

  if (mine && c.status === 'preview')
    out.push(`<section class="pt-panel pt-row"><div class="pt-grow"><b>작동 확인</b><p class="pt-small pt-muted">미리보기로 확인했으면 넘깁니다. 이상이 있으면 챗으로 다시 고칩니다.</p></div><button class="btn pt-primary" data-p="check" data-id="${c.id}" ${c.checks.every((x) => x.pass) ? '' : 'disabled'}>작동 확인 완료</button></section>`);
  if (mine && c.status === 'checked')
    out.push(`<section class="pt-panel"><form data-p-form="request-deploy" data-id="${c.id}" class="pt-form"><b>배포 요청</b><p class="pt-small pt-muted">변경 요약과 함께 관리자에게 넘깁니다.</p><div class="pt-row"><input name="summary" id="sum-${c.id}" class="pt-grow" value="${esc(c.diff.lines.join(' · '))}"><button class="btn pt-primary">배포 요청</button></div></form></section>`);
  if (role === 'admin' && c.status === 'deploy_requested') out.push(`<p class="pt-row"><a class="btn pt-primary" href="#releases">버전 · 배포에서 배포하기</a></p>`);

  out.push(`<h2>이력</h2><ul class="pt-small pt-log">${c.log.map((l) => `<li>${fmtTime(l.at)} · ${ROLE_NAME[l.role] || esc(l.role)} · ${esc(l.text)}</li>`).join('')}</ul>`);
  return out.join('');
}

function uxEditor(c) {
  const p = c.draft;
  return `<section class="pt-panel"><div class="pt-panel-head"><b>가이드 · 규칙 편집</b></div>
    <form data-p-form="ux-save" data-id="${c.id}" class="pt-form">
      <label>설명 (정책 요약)<textarea name="description" id="uxDesc-${c.id}">${esc(p.description)}</textarea></label>
      <p class="pt-small pt-muted">규칙 번호는 고정입니다. 새 규칙은 저장할 때 번호가 붙습니다. rule은 '항목: 기준' 형태로 씁니다.</p>
      ${p.rules.map((r) => `<div class="pt-rule-edit" data-rule="${esc(r.id)}"><span class="mono">${esc(r.id)}</span><select name="kind" aria-label="${esc(r.id)} 종류">${['rule', 'do', 'dont'].map((k) => `<option ${r.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select><input name="text" value="${esc(r.text)}" aria-label="${esc(r.id)} 내용"><label class="pt-small"><input type="checkbox" name="remove"> 삭제</label></div>`).join('')}
      <div class="pt-rule-edit" data-new><span class="pt-muted pt-small">새 규칙</span><select name="kind" aria-label="새 규칙 종류"><option>do</option><option>dont</option><option>rule</option></select><input name="text" placeholder="새 규칙" aria-label="새 규칙 내용"><span></span></div>
      <button class="btn pt-primary">저장 · 미리보기</button>
    </form></section>`;
}

function sbEditor(c) {
  const b = c.draft;
  return `<section class="pt-panel"><div class="pt-panel-head"><b>소스 직접 수정</b></div>
    <form data-p-form="sb-save" data-id="${c.id}" class="pt-form">
      <div class="pt-grid2"><label>이름<input name="name" id="sbName-${c.id}" value="${esc(b.name)}"></label><label>용도<input name="purpose" id="sbPurpose-${c.id}" value="${esc(b.purpose)}"></label></div>
      <label>소스 (HTML, 색과 간격은 var(--토큰))<textarea class="pt-code" name="source" id="sbSrc-${c.id}">${esc(b.source)}</textarea></label>
      <button class="btn pt-primary">저장 · 자동 검사 · 미리보기</button>
    </form></section>`;
}

function draftPreview(c) {
  const d = c.draft;
  if (c.case === 'ds')
    return `<p><b>${esc(d.name)}</b> <span class="mono pt-muted">${esc(d.key)}</span></p><p class="pt-small">${esc(d.description)}</p>${d.guideLead ? `<p class="pt-small pt-muted">정책: ${esc(d.guideLead)}</p>` : ''}
      <div class="table-wrap"><table class="data"><thead><tr><th>속성</th><th>타입</th><th>기본값</th><th>선택지</th></tr></thead><tbody>${d.props.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type)}</td><td>${esc(p.default)}</td><td>${esc((p.options || []).join(', '))}</td></tr>`).join('')}</tbody></table></div>
      <p class="pt-small pt-muted">변형 ${d.variants.length}개 · componentKey <span class="mono">${esc(d.figma?.componentKey || '')}</span></p>`;
  if (c.case === 'icon') return `<div class="pt-icon"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(d.svg || '')}" alt="" width="32" height="32"><span>${esc(d.name)}</span></div>`;
  if (c.case === 'ux') {
    const before = Object.fromEntries((c.base?.rules || []).map((r) => [r.id, r]));
    const tag = (r) => (!before[r.id] ? pill('bump-MINOR', '추가') : before[r.id].text !== r.text || before[r.id].kind !== r.kind ? pill('bump-MAJOR', '수정') : '');
    return `<p class="pt-small">${esc(d.description)}</p><div class="table-wrap"><table class="data"><thead><tr><th>번호</th><th>종류</th><th>규칙</th></tr></thead><tbody>${d.rules
      .map((r) => `<tr><td class="mono">${esc(r.id)} ${tag(r)}</td><td class="kind-${r.kind}">${r.kind}</td><td>${esc(r.text)}</td></tr>`).join('')}${(c.base?.rules || [])
      .filter((r) => !d.rules.find((x) => x.id === r.id)).map((r) => `<tr><td class="mono">${esc(r.id)} ${pill('bump-MAJOR', '삭제')}</td><td></td><td><s>${esc(r.text)}</s></td></tr>`).join('')}</tbody></table></div>`;
  }
  return `<p><b>${esc(d.name)}</b> <span class="pt-small pt-muted">${esc(d.purpose || d.description || '')}</span></p>${previewFrame(d.source)}`;
}

// ---------- 이벤트 ----------

async function newDsChangeAndConvert(body, url) {
  const c = await api('/api/changes', body);
  await api(`/api/changes/${c.id}/start`, {});
  try {
    return await api(`/api/changes/${c.id}/convert`, { url });
  } catch (e) {
    toast(e.message);
    return c;
  }
}

function onClick(e) {
  const t = e.target.closest('[data-p]');
  if (!t) return;
  const d = t.dataset;
  e.preventDefault();
  if (d.p === 'fill-sample') {
    document.getElementById('newTitle').value ||= 'Chip';
    document.getElementById('newUrl').value = `https://www.figma.com/design/${FIGMA_FILE}/Lib?node-id=9000-1`;
    return;
  }
  if (d.p === 'ux-edit') return act(() => api('/api/changes', { case: 'ux', title: `${d.key} 가이드 편집`, targetKey: d.key }), '편집을 시작했습니다', (c) => `#change-${c.id}`);
  if (d.p === 'sb-edit') return act(() => api('/api/changes', { case: 'sb', title: `${d.key} 소스 편집`, targetKey: d.key }), '편집을 시작했습니다', (c) => `#change-${c.id}`);
  if (d.p === 'promote') return act(() => api(`/api/sb/${d.key}/promote`, { approve: true, note: document.getElementById(`note-${d.key}`)?.value || '' }), '1단 심사 통과 → DS 담당자에게 승격 요청');
  if (d.p === 'decline') return act(() => api(`/api/sb/${d.key}/promote`, { approve: false, note: document.getElementById(`note-${d.key}`)?.value || '' }), '승격하지 않기로 했습니다');
  if (d.p === 'start') return act(() => api(`/api/changes/${d.id}/start`, {}), '작업을 시작했습니다', `#change-${d.id}`);
  if (d.p === 'check') return act(() => api(`/api/changes/${d.id}/check`, {}), '작동 확인 완료');
}

function onSubmit(e) {
  const f = e.target.closest('form[data-p-form]');
  if (!f) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  const id = f.dataset.id;
  const key = f.dataset.key;
  switch (f.dataset.pForm) {
    case 'req-comp':
      return act(() => api('/api/changes', { case: v.kind, title: `${key} 수정 요청`, targetKey: key, detail: v.detail }), (c) => `${c.id} 요청을 보냈습니다 (${v.kind === 'ux' ? 'UX' : 'DS'} 담당자)`);
    case 'req-new':
      return act(() => api('/api/changes', { case: 'ds', title: `${v.title} 신규`, detail: v.detail }), (c) => `${c.id} 요청을 보냈습니다`);
    case 'req-icon':
      return act(() => api('/api/changes', { case: 'icon', title: `아이콘 제작: ${v.name}`, iconName: v.name.trim(), screens: v.screens }), (c) => `${c.id} 아이콘 요청을 보냈습니다`);
    case 'req-ux':
      return act(() => api('/api/changes', { case: 'ux', title: `${key} 규칙 수정 요청`, targetKey: key, detail: v.detail }), 'UX 담당자에게 요청을 보냈습니다');
    case 'ds-reconvert':
      return act(() => newDsChangeAndConvert({ case: 'ds', title: `${key} 수정`, targetKey: key }, v.url), (c) => (c.status === 'preview' ? `변환 · 자동 확인 통과 → ${c.previewVersion}` : '변환하지 못했습니다'), (c) => `#change-${c.id}`);
    case 'ds-new':
      return act(() => newDsChangeAndConvert({ case: 'ds', title: `${v.title} 추가` }, v.url), (c) => (c.status === 'preview' ? `변환 · 자동 확인 통과 → ${c.previewVersion}` : '변환하지 못했습니다'), (c) => `#change-${c.id}`);
    case 'reject':
      return act(() => api(`/api/changes/${id}/reject`, { reason: v.reason }), '반려했습니다');
    case 'convert':
      return act(() => api(`/api/changes/${id}/convert`, { url: v.url.trim() }), (c) => (c.status === 'preview' ? `변환 · 자동 확인 통과 → ${c.previewVersion}` : '자동 확인 미달: 반영을 멈췄습니다'));
    case 'ux-save': {
      const rules = [...f.querySelectorAll('[data-rule]')].map((row) => ({ id: row.dataset.rule, kind: row.querySelector('[name=kind]').value, text: row.querySelector('[name=text]').value, remove: row.querySelector('[name=remove]').checked }));
      const nr = f.querySelector('[data-new]');
      const text = nr.querySelector('[name=text]').value.trim();
      const addRules = text ? [{ kind: nr.querySelector('[name=kind]').value, text }] : [];
      return act(() => api(`/api/changes/${id}/edit`, { description: v.description, rules, addRules }), (c) => (c.status === 'preview' ? `저장 · 규칙 번호 부여 → ${c.previewVersion}` : '자동 확인 미달'));
    }
    case 'sb-save':
      return act(() => api(`/api/changes/${id}/edit`, { name: v.name, purpose: v.purpose, source: v.source }), (c) => (c.status === 'preview' ? `자동 검사 통과 → ${c.previewVersion}` : '자동 검사 미달: 소스를 고쳐 주세요'));
    case 'chat':
      if (!v.m?.trim()) return;
      return act(() => api(`/api/changes/${id}/chat`, { message: v.m.trim() }));
    case 'request-deploy':
      return act(() => api(`/api/changes/${id}/request-deploy`, { summary: v.summary }), '관리자에게 배포 요청을 보냈습니다');
    case 'deploy': {
      const mode = e.submitter?.value || 'regular';
      const ids = [...f.querySelectorAll('input[name=ids]:checked')].map((x) => x.value);
      return act(() => api('/api/deploy', { mode, ids, reason: v.reason }), (h) => `운영 ${h.version} 배포 완료`);
    }
    case 'rollback': {
      const b = e.submitter;
      if (b && !b.dataset.armed) {
        b.dataset.armed = '1';
        b.textContent = '한 번 더 누르면 되돌립니다';
        return;
      }
      return act(() => api('/api/rollback', { reason: v.reason }), (h) => `${h.version}(으)로 되돌렸습니다`);
    }
  }
}

export { iconSvg };
