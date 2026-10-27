// BSS Design System docs site. Everything comes from JSON so adding a component only needs
// its folder (made by the figma-to-json skill) and an entry in components/index.json:
//   components/index.json, components/<key>/component.json, icons/icons.json + icons/svg/*.svg
// Routes are bare hash tokens (#overview, #icons, #components, #<component key>) so links can be shared.

import { renderVariant, isRenderable } from './render.js';

const content = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const navComponents = document.getElementById('navComponents');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const figmaUrl = (fileKey, nodeId) => `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`;

async function getText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} (${r.status})`);
  return r.text();
}
const getJson = async (url) => JSON.parse(await getText(url));

// ---------- copy ----------
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}
// Must run inside the click handler. If the clipboard is refused, select the text instead.
function copy(text, el) {
  const fail = () => {
    if (el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    toast('텍스트를 선택했어요. Ctrl/Cmd+C로 복사하세요');
  };
  try {
    navigator.clipboard.writeText(text).then(() => toast('복사했어요'), fail);
  } catch {
    fail();
  }
}
const copyBtn = (value, label = value) => `<button class="copy" data-copy="${esc(value)}" title="클릭해서 복사">${esc(label)}</button>`;

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) copy(b.dataset.copy, b);
});

// ---------- pages ----------
function pageOverview({ components, icons }) {
  const variants = components.reduce((n, c) => n + c.variants.length, 0);
  const cards = components.map((c) => `
    <a class="card" href="#${esc(c.key)}">
      <span class="card-title">${esc(c.name)}</span>
      <span class="card-desc">변형 ${c.variants.length} · 속성 ${c.props.length} · 토큰 ${c.tokens.length}</span>
    </a>`).join('');
  return `
    <p class="eyebrow">시작하기</p>
    <h1>BSS Design System</h1>
    <p class="lead">Figma (공유용) Components Library v0.5를 기준으로 만든 디자인 시스템입니다. 컴포넌트를 골라 직접 눌러 보고, 속성을 바꿔 가며 모든 경우를 확인할 수 있어요.</p>
    <div class="meta">
      <a class="chip" href="${figmaUrl(icons.figma.fileKey, '0:1')}" target="_blank" rel="noopener">Figma 파일 ${esc(icons.figma.fileKey)} ↗</a>
    </div>

    <div class="cards">
      <a class="card" href="#components"><span class="card-desc">컴포넌트</span><span class="stat">${components.length}</span><span class="card-desc">변형 합계 ${variants}개</span></a>
      <a class="card" href="#icons"><span class="card-desc">아이콘 (마스터)</span><span class="stat">${icons.icons.length}</span><span class="card-desc">${icons.sections.map((s) => `${esc(s.title.replace(' Icon', ''))} ${icons.icons.filter((i) => i.style === s.style).length}`).join(' · ')}</span></a>
    </div>

    <h2>추가하는 방법</h2>
    <ol class="flow">
      <li><div><strong>Figma 링크 전달</strong><span>컴포넌트 세트, 변형, 인스턴스 중 어느 링크든 됩니다.</span></div></li>
      <li><div><strong>figma-to-json 스킬 실행</strong><span>Figma에서 읽은 값을 검사한 뒤 components/&lt;이름&gt;/component.json으로 저장하고 index.json에 추가합니다.</span></div></li>
      <li><div><strong>이 페이지에 자동 반영</strong><span>사이트가 JSON을 읽어 왼쪽 메뉴와 상세 페이지를 만듭니다. 다시 올리면 공유 링크에도 반영됩니다.</span></div></li>
    </ol>

    <h2>컴포넌트 <span class="count">${components.length}</span></h2>
    <div class="cards">${cards}</div>`;
}

function pageComponentList({ components }) {
  const cards = components.map((c) => `
    <a class="card" href="#${esc(c.key)}">
      <span class="card-title">${esc(c.name)}</span>
      <span class="card-desc">${c.props.filter((p) => p.type === 'variant').map((p) => esc(p.name)).join(' · ')}</span>
    </a>`).join('');
  return `
    <p class="eyebrow">Components</p>
    <h1>컴포넌트</h1>
    <p class="lead">컴포넌트를 누르면 미리보기에서 직접 써 볼 수 있어요.</p>
    <div class="cards">${cards}</div>`;
}

function variantSection(c) {
  const vprops = c.props.filter((p) => p.type === 'variant');
  if (!c.variants.length) return '';
  const total = vprops.reduce((n, p) => n * p.options.length, 1);
  const filters = vprops.map((p) => {
    const used = p.options.filter((o) => c.variants.some((v) => v.props[p.name] === o));
    return `<div class="filter-row" data-prop="${esc(p.name)}"><span class="label">${esc(p.name)}</span>
      <button class="chip" aria-pressed="true" data-val="">전체</button>
      ${used.map((o) => `<button class="chip" aria-pressed="false" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
  }).join('');
  const rows = c.variants.map((v) => `
    <tr data-variant='${esc(JSON.stringify(v.props))}'>
      ${vprops.map((p) => `<td class="mono">${esc(v.props[p.name])}</td>`).join('')}
      <td class="num">${v.size ? `${Math.round(v.size[0])}×${Math.round(v.size[1])}` : ''}</td>
      <td class="nowrap"><a class="mono" href="${figmaUrl(c.figma.fileKey, v.nodeId)}" target="_blank" rel="noopener">${esc(v.nodeId)}</a></td>
      <td>${copyBtn(v.key)}</td>
    </tr>`).join('');
  return `
    <h2>변형 <span class="count">${c.variants.length}</span></h2>
    <p class="note">${c.variants.length === total
      ? `속성 값의 모든 조합(${total}가지)이 Figma에 있습니다.`
      : `속성 값을 곱하면 ${total}가지지만 Figma에는 실제로 쓰는 ${c.variants.length}가지만 있습니다.`}
      노드 ID를 누르면 Figma에서 열리고, 컴포넌트 키를 누르면 복사됩니다.</p>
    <div class="filters" id="variantFilters">${filters}</div>
    <p class="note" id="variantShown"></p>
    <div class="table-wrap"><table class="data" id="variantTable">
      <thead><tr>${vprops.map((p) => `<th>${esc(p.name)}</th>`).join('')}<th>크기</th><th>노드 ID</th><th>컴포넌트 키</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

function bindVariantFilter() {
  const box = document.getElementById('variantFilters');
  if (!box) return;
  const apply = () => {
    const sel = {};
    box.querySelectorAll('.filter-row').forEach((row) => {
      const v = row.querySelector('[aria-pressed="true"]').dataset.val;
      if (v) sel[row.dataset.prop] = v;
    });
    let n = 0;
    document.querySelectorAll('#variantTable tbody tr').forEach((tr) => {
      const props = JSON.parse(tr.dataset.variant);
      const hit = Object.entries(sel).every(([k, v]) => props[k] === v);
      tr.hidden = !hit;
      if (hit) n++;
    });
    document.getElementById('variantShown').textContent = Object.keys(sel).length ? `조건에 맞는 변형 ${n}개` : '';
  };
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-val]');
    if (!b) return;
    b.closest('.filter-row').querySelectorAll('[data-val]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
}

function tokenSection(c) {
  if (!c.tokens.length) return '';
  const collections = [...new Set(c.tokens.map((t) => t.collection))];
  const tables = collections.map((col) => {
    const list = c.tokens.filter((t) => t.collection === col);
    const rows = list.map((t) => `
      <tr><td class="mono">${esc(t.figma)}</td><td>${copyBtn(`var(${t.css})`, t.css)}</td><td class="mono">${esc(t.type)}</td></tr>`).join('');
    return `<h3>${esc(col || '컬렉션 없음')} <span class="count">${list.length}</span></h3>
      <div class="table-wrap"><table class="data"><thead><tr><th>Figma 변수</th><th>CSS 변수</th><th>타입</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join('');
  return `
    <h2>연결된 토큰 <span class="count">${c.tokens.length}</span></h2>
    <p class="note">컴포넌트 안에 바인딩된 Figma 변수입니다. CSS 변수 이름을 누르면 <code>var(--…)</code> 형태로 복사됩니다. 값은 토큰 CSS를 만든 뒤에 연결합니다.</p>
    ${tables}`;
}

// Developer details (node IDs, keys, tokens) live in one collapsed block at the bottom.
function figmaDetails(c) {
  const propRows = c.props.map((p) => `
    <tr>
      <td class="mono">${esc(p.name)}</td>
      <td><span class="chip ${p.type === 'variant' ? 'chip--accent' : ''}">${esc(p.type)}</span></td>
      <td class="mono">${esc(JSON.stringify(p.default))}</td>
      <td>${p.options ? p.options.map((o) => `<code>${esc(o)}</code>`).join(' ') : '<span class="count">-</span>'}</td>
    </tr>`).join('');
  const styles = [...(c.textStyles || []), ...(c.otherStyles || [])];
  const styleRows = styles.map((s) => `<tr><td class="mono">${esc(s.name)}</td><td class="mono">${esc(s.type)}</td><td>${copyBtn(s.key)}</td></tr>`).join('');
  return `
    <details class="dev">
      <summary>Figma 정보 (노드 ID · 컴포넌트 키 · 토큰)</summary>
    <div class="btn-row"><a class="btn" href="${esc(c.figma.url)}" target="_blank" rel="noopener">Figma에서 보기 ↗</a></div>
    <h2>Figma 정보</h2>
    <dl class="dl">
      <dt>세트 노드 ID</dt><dd>${copyBtn(c.figma.nodeId)}</dd>
      <dt>세트 컴포넌트 키</dt><dd>${c.figma.componentKey ? copyBtn(c.figma.componentKey) : '-'}</dd>
      <dt>Figma 페이지</dt><dd>${esc(c.figma.page?.name || '-')} <span class="count mono">${esc(c.figma.page?.nodeId || '')}</span></dd>
      <dt>JSON 파일</dt><dd>${copyBtn(`components/${c.key}/component.json`)}</dd>
      <dt>읽은 날짜</dt><dd>${esc(c.figma.extractedAt || '-')}</dd>
    </dl>

    <h2>속성 <span class="count">${c.props.length}</span></h2>
    <div class="table-wrap"><table class="data"><thead><tr><th>이름</th><th>타입</th><th>기본값</th><th>옵션</th></tr></thead><tbody>${propRows}</tbody></table></div>

    ${variantSection(c)}
    ${tokenSection(c)}
    ${styles.length ? `<h2>스타일 <span class="count">${styles.length}</span></h2>
      <div class="table-wrap"><table class="data"><thead><tr><th>이름</th><th>종류</th><th>스타일 키</th></tr></thead><tbody>${styleRows}</tbody></table></div>` : ''}
    </details>`;
}

// ---------- component page: Storybook-style playground ----------
// Variant props become controls; a "state" prop with hover/pressed is driven by the pointer instead,
// and a selection prop (checked/selected) toggles on click. Everything is drawn from component.json.
const INTERACTIVE = ['hover', 'pressed', 'focus'];
const ON = ['checked', 'selected', 'on'];
const OFF = ['unchecked', 'unselected', 'off'];

function analyze(c) {
  const vprops = c.props.filter((p) => p.type === 'variant');
  const stateProp = vprops.find((p) => p.options.some((o) => INTERACTIVE.includes(o)));
  const selectProp = vprops.find((p) => p.options.some((o) => ON.includes(o)) && p.options.some((o) => OFF.includes(o)));
  const flags = c.props.filter((p) => p.type === 'boolean' && !/focus/i.test(p.name));
  const focusFlag = c.props.find((p) => p.type === 'boolean' && /focus/i.test(p.name));
  const texts = c.props.filter((p) => p.type === 'text');
  return { vprops, stateProp, selectProp, flags, focusFlag, texts };
}

// Exact match, else the variant sharing the most props (Figma sets can be sparse).
// `must` names a prop the match has to agree on (a case card for that option)
function findVariant(c, want, must) {
  let best = null, score = -1;
  for (const v of c.variants) {
    if (must && v.props[must] !== want[must]) continue;
    const s = Object.entries(want).filter(([k, val]) => v.props[k] === val).length;
    if (s > score) { best = v; score = s; }
  }
  return best;
}

function pageComponent(c) {
  const ok = isRenderable(c);
  return `
    <p class="eyebrow">Component</p>
    <h1>${esc(c.name)}</h1>
    <p class="lead">${c.description ? esc(c.description) : ''}</p>
    ${ok ? `
    <section class="sb">
      <div class="sb-tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="preview">미리보기</button>
        <button role="tab" aria-selected="false" data-tab="code">코드</button>
      </div>
      <div class="sb-body" data-panel="preview">
        <div class="sb-canvas"><div class="sb-stage" id="sbStage"></div></div>
        <div class="sb-controls" id="sbControls"></div>
      </div>
      <div class="sb-body sb-code" data-panel="code" hidden>
        <div class="code-head"><span>HTML</span><button class="btn" data-copy-target="codeHtml">복사</button></div>
        <pre id="codeHtml"></pre>
        <div class="code-head"><span>CSS</span><button class="btn" data-copy-target="codeCss">복사</button></div>
        <pre id="codeCss"></pre>
      </div>
    </section>
    ${analyze(c).stateProp || analyze(c).selectProp ? '<p class="note">마우스를 올리거나 눌러 보세요. 키보드 Tab으로 포커스할 수도 있어요.</p>' : ''}
    <h2>케이스</h2>
    <div id="sbCases"></div>` : `
    <p class="error">이 컴포넌트는 예전 형식 JSON이라 미리보기를 그릴 수 없어요. Figma 링크로 다시 읽으면 나타나요.</p>`}
    ${figmaDetails(c)}`;
}

async function bindComponent(c, ctx) {
  if (!isRenderable(c)) return;
  const icons = await iconMap(c, ctx.icons);
  const a = analyze(c);
  const stage = document.getElementById('sbStage');
  if (!stage) return; // navigated away while loading
  const controls = document.getElementById('sbControls');
  const cases = document.getElementById('sbCases');

  // current selection: every Figma variant prop (state included) plus boolean/text props
  const sel = Object.fromEntries(a.vprops.map((p) => [p.name, p.default]));
  const values = Object.fromEntries(c.props.filter((p) => p.type !== 'variant').map((p) => [p.figmaName, p.default]));
  const restOption = a.stateProp && (a.stateProp.options.find((o) => !INTERACTIVE.includes(o) && o !== 'disabled') || a.stateProp.default);
  let live = null; // hover | pressed while the pointer is on the stage
  let focused = false; // keyboard focus on the stage

  const isDisabled = () => a.stateProp && sel[a.stateProp.name] === 'disabled';
  // The pointer only animates the preview while the state control is at its resting option;
  // picking hover/pressed/disabled in the controls pins that state like Figma.
  const want = (useLive = true) => {
    const w = { ...sel };
    if (a.stateProp && useLive && live && sel[a.stateProp.name] === restOption) w[a.stateProp.name] = live;
    return w;
  };
  let seq = 0;
  const draw = (target, variant, extraValues = {}) => {
    const prefix = `p${++seq}`;
    const { html, css } = renderVariant(c, variant.layer, { values: { ...values, ...extraValues }, icons, prefix });
    target.innerHTML = `<style>${css}</style>${html}`;
  };
  const focusValues = () => (a.focusFlag && focused ? { [a.focusFlag.figmaName]: true } : {});

  function paintStage() {
    draw(stage, findVariant(c, want()), focusValues());
  }
  function paintCode() {
    const v = findVariant(c, want(false));
    const { html, css } = renderVariant(c, v.layer, { values, icons, prefix: `ds-${c.key}` });
    document.getElementById('codeHtml').textContent = html;
    document.getElementById('codeCss').textContent = css;
  }

  // options still possible given the other props chosen before this one
  const optionsFor = (p) => {
    const i = a.vprops.indexOf(p);
    const before = a.vprops.slice(0, i);
    return p.options.filter((o) => c.variants.some((v) => v.props[p.name] === o && before.every((q) => v.props[q.name] === sel[q.name])));
  };
  function fixSelection() {
    for (const p of a.vprops) {
      const opts = optionsFor(p);
      if (!opts.includes(sel[p.name])) sel[p.name] = opts[0];
    }
  }

  function renderControls() {
    const rows = a.vprops.map((p) => {
      const opts = optionsFor(p);
      return `<div class="ctl"><span class="ctl-name">${esc(p.name)}</span><div class="seg">${opts.map((o) =>
        `<button data-prop="${esc(p.name)}" data-val="${esc(o)}" aria-pressed="${sel[p.name] === o}">${esc(o)}</button>`).join('')}</div></div>`;
    });
    for (const p of [...a.flags, ...(a.focusFlag ? [a.focusFlag] : [])]) {
      rows.push(`<label class="ctl"><span class="ctl-name">${esc(p.name)}</span><input type="checkbox" data-flag="${esc(p.figmaName)}" ${values[p.figmaName] ? 'checked' : ''} /></label>`);
    }
    for (const p of a.texts) {
      rows.push(`<label class="ctl"><span class="ctl-name">${esc(p.name)} <span class="ctl-hint">Enter로 줄바꿈</span></span><textarea class="search" rows="2" data-text="${esc(p.figmaName)}">${esc(values[p.figmaName])}</textarea></label>`);
    }
    controls.innerHTML = rows.join('');
  }

  // Cases are a static sheet of every option, like the Figma frame.
  function renderCases() {
    const groups = a.vprops.map((p) => {
      const opts = optionsFor(p);
      if (opts.length < 2) return '';
      const items = opts.map((o, i) => `
        <div class="case"><span class="case-stage" id="case-${esc(p.name)}-${i}"></span><span class="case-name">${esc(o)}</span></div>`).join('');
      const focus = p === a.stateProp && a.focusFlag
        ? `<div class="case"><span class="case-stage" id="case-focus"></span><span class="case-name">${esc(a.focusFlag.name)}</span></div>` : '';
      return `<h3>${esc(p.name)}</h3><div class="cases">${items}${focus}</div>`;
    }).join('');
    cases.innerHTML = groups;
    // Cards are at least as wide as the widest variant so nothing is clipped.
    const widest = Math.max(...c.variants.map((v) => v.size?.[0] || 0));
    cases.style.setProperty('--case-w', `${Math.max(150, Math.ceil(widest) + 40)}px`);
    for (const p of a.vprops) {
      optionsFor(p).forEach((o, i) => {
        const box = document.getElementById(`case-${p.name}-${i}`);
        if (box) draw(box, findVariant(c, { ...sel, [p.name]: o }, p.name));
      });
    }
    const focusBox = document.getElementById('case-focus');
    if (focusBox) draw(focusBox, findVariant(c, { ...sel, [a.stateProp.name]: restOption }), { [a.focusFlag.figmaName]: true });
  }

  function refresh() {
    fixSelection();
    renderControls();
    paintStage();
    paintCode();
    renderCases();
  }

  // pointer and keyboard drive the live state
  const toggle = () => {
    if (isDisabled() || !a.selectProp) return;
    const p = a.selectProp;
    const on = p.options.find((o) => ON.includes(o));
    const off = p.options.find((o) => OFF.includes(o));
    sel[p.name] = sel[p.name] === off ? on : off;
    refresh();
  };
  stage.tabIndex = 0;
  stage.setAttribute('role', a.selectProp ? 'checkbox' : 'button');
  const has = (s) => a.stateProp && a.stateProp.options.includes(s);
  stage.addEventListener('pointerenter', () => { if (has('hover')) { live = 'hover'; paintStage(); } });
  stage.addEventListener('pointerleave', () => { live = null; paintStage(); });
  stage.addEventListener('pointerdown', () => { if (has('pressed')) { live = 'pressed'; paintStage(); } });
  stage.addEventListener('pointerup', () => { live = has('hover') ? 'hover' : null; paintStage(); });
  stage.addEventListener('click', toggle);
  stage.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  });
  stage.addEventListener('focus', () => { focused = stage.matches(':focus-visible'); paintStage(); });
  stage.addEventListener('blur', () => { focused = false; paintStage(); });

  controls.addEventListener('click', (e) => {
    const b = e.target.closest('[data-prop]');
    if (!b) return;
    sel[b.dataset.prop] = b.dataset.val;
    refresh();
  });
  controls.addEventListener('change', (e) => {
    if (!e.target.dataset.flag) return;
    values[e.target.dataset.flag] = e.target.checked;
    refresh();
  });
  // Text redraws the stage, code and cases but not the controls, so the textarea keeps focus.
  controls.addEventListener('input', (e) => {
    if (!e.target.dataset.text) return;
    values[e.target.dataset.text] = e.target.value;
    paintStage();
    paintCode();
    renderCases();
  });

  document.querySelector('.sb-tabs').addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    document.querySelectorAll('.sb-tabs [data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    document.querySelectorAll('.sb [data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.tab; });
  });
  document.querySelectorAll('[data-copy-target]').forEach((b) => b.addEventListener('click', () => {
    const pre = document.getElementById(b.dataset.copyTarget);
    copy(pre.textContent, pre);
  }));

  refresh();
}

// Icon SVGs used anywhere in the component, keyed by Figma component key.
async function iconMap(c, icons) {
  const byKey = new Map(icons.icons.map((i) => [i.key, i]));
  const keys = new Set();
  const walk = (l) => {
    if (l.main && byKey.has(l.main.key)) keys.add(l.main.key);
    (l.children || []).forEach(walk);
  };
  c.variants.forEach((v) => v.layer && walk(v.layer));
  if (c.layer) walk(c.layer);
  const out = new Map();
  await Promise.all([...keys].map(async (k) => {
    const i = byKey.get(k);
    out.set(k, { svg: (await getText(`icons/${i.file}`)).trim(), colored: i.style === 'colored' });
  }));
  return out;
}

// ---------- icons ----------
const SIZES = [16, 20, 24, 32, 48];
const sized = (svg, px) => svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`);

function pageIcons({ icons }) {
  const dlg = `
    <dialog id="iconDialog" aria-labelledby="iconName">
      <div class="d-head"><div><h2 id="iconName"></h2><div class="count" id="iconSub"></div></div><button class="icon-btn" id="iconClose" aria-label="닫기">✕</button></div>
      <div class="d-body"><div class="sizes" id="iconSizes"></div><dl class="dl" id="iconInfo"></dl></div>
      <div class="d-foot"><button class="btn" id="iconCopySvg">SVG 복사</button><button class="btn" id="iconCopyName">이름 복사</button></div>
    </dialog>`;
  return `
    <p class="eyebrow">Foundations</p>
    <h1>아이콘</h1>
    <p class="lead">Figma ❖ Icon Resource의 마스터 컴포넌트 ${icons.icons.length}개입니다. Line·Filled는 <code>currentColor</code>라 글자색을 따라가고, Colored는 원본 색을 유지합니다. 기준 크기는 ${icons.size}×${icons.size}입니다.</p>
    <div class="meta"><a class="chip" href="${figmaUrl(icons.figma.fileKey, icons.figma.nodeId)}" target="_blank" rel="noopener">Figma ❖ Icon Resource ↗</a></div>
    <div class="toolbar">
      <input type="search" class="search" id="iconSearch" placeholder="이름·그룹 검색 (예: arrow, Status)" aria-label="아이콘 검색" />
    </div>
    <div id="iconList"><p class="note">아이콘을 불러오는 중…</p></div>
    ${dlg}`;
}

async function bindIcons({ icons }) {
  const svgs = await Promise.all(icons.icons.map((i) => getText(`icons/${i.file}`).then((t) => t.trim())));
  icons.icons.forEach((i, n) => (i.svg = svgs[n]));
  const list = document.getElementById('iconList');
  if (!list) return; // navigated away while loading
  const render = (q) => {
    const match = (i) => !q || `${i.name} ${i.group} ${i.style} ${i.figmaName}`.toLowerCase().includes(q);
    const html = icons.sections.map((sec) => {
      const inSec = icons.icons.filter((i) => i.style === sec.style && match(i));
      if (!inSec.length) return '';
      const groups = sec.groups.map((g) => {
        const items = inSec.filter((i) => i.group === g);
        if (!items.length) return '';
        return `<h3>${esc(g)} <span class="count">${items.length}</span></h3><div class="icon-grid">${items.map((i) => `
          <button class="tile${i.onDark ? ' on-dark' : ''}" data-icon="${icons.icons.indexOf(i)}" title="${esc(i.figmaName)}">
            <span class="glyph" aria-hidden="true">${i.svg}</span><span class="tile-name">${esc(i.name)}</span>
          </button>`).join('')}</div>`;
      }).join('');
      return `<h2>${esc(sec.title)} <span class="count">${inSec.length}</span></h2><p class="note">${esc(sec.description)}</p>${groups}`;
    }).join('');
    list.innerHTML = html || '<p class="note">찾는 아이콘이 없습니다. 다른 이름이나 그룹으로 검색해 보세요.</p>';
  };
  render('');
  document.getElementById('iconSearch').addEventListener('input', (e) => render(e.target.value.trim().toLowerCase()));

  const dialog = document.getElementById('iconDialog');
  let current = null;
  let opener = null;
  list.addEventListener('click', (e) => {
    const tile = e.target.closest('[data-icon]');
    if (!tile) return;
    current = icons.icons[Number(tile.dataset.icon)];
    opener = tile;
    document.getElementById('iconName').textContent = current.name;
    document.getElementById('iconSub').textContent = `${current.style} · ${current.group}`;
    const sizes = document.getElementById('iconSizes');
    sizes.className = `sizes${current.onDark ? ' on-dark' : ''}`;
    sizes.innerHTML = SIZES.map((s) => `<figure>${sized(current.svg, s)}<figcaption>${s}px</figcaption></figure>`).join('');
    document.getElementById('iconInfo').innerHTML = `
      <dt>파일</dt><dd>${copyBtn(`icons/${current.file}`)}</dd>
      <dt>Figma 레이어</dt><dd class="mono">${esc(current.figmaName)}</dd>
      <dt>노드 ID</dt><dd><a class="mono" href="${figmaUrl(icons.figma.fileKey, current.nodeId)}" target="_blank" rel="noopener">${esc(current.nodeId)} ↗</a></dd>
      <dt>컴포넌트 키</dt><dd>${copyBtn(current.key)}</dd>
      <dt>색</dt><dd>${current.style === 'colored' ? '원본 색 고정' : 'currentColor (글자색을 따름)'}</dd>
      ${current.description ? `<dt>설명</dt><dd>${esc(current.description)}</dd>` : ''}`;
    dialog.showModal();
  });
  document.getElementById('iconClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());
  document.getElementById('iconCopySvg').addEventListener('click', (e) => copy(current.svg, null));
  document.getElementById('iconCopyName').addEventListener('click', () => copy(current.name, null));
}

// ---------- boot ----------
async function boot() {
  const [registry, icons] = await Promise.all([getJson('components/index.json'), getJson('icons/icons.json')]);
  const components = await Promise.all(registry.components.map((key) => getJson(`components/${key}/component.json`)));
  components.sort((a, b) => a.name.localeCompare(b.name));
  navComponents.innerHTML = components.map((c) => `<a href="#${esc(c.key)}" data-route="${esc(c.key)}">${esc(c.name)}</a>`).join('');
  const ctx = { components, icons };

  function render() {
    const route = location.hash.replace(/^#/, '') || 'overview';
    const comp = components.find((c) => c.key === route);
    const page = ['icons', 'components'].includes(route) ? route : comp ? comp.key : 'overview';
    sidebar.querySelectorAll('a[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === page));
    sidebar.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    try {
      if (page === 'icons') {
        content.innerHTML = pageIcons(ctx);
        bindIcons(ctx).catch((err) => {
          document.getElementById('iconList').innerHTML = `<p class="error">아이콘을 불러오지 못했어요: ${esc(err.message)}</p>`;
        });
      } else if (page === 'components') content.innerHTML = pageComponentList(ctx);
      else if (comp) {
        content.innerHTML = pageComponent(comp);
        bindVariantFilter();
        bindComponent(comp, ctx).catch((err) => {
          document.getElementById('sbStage')?.insertAdjacentHTML('beforeend', `<p class="error">미리보기를 그리지 못했어요: ${esc(err.message)}</p>`);
        });
      } else content.innerHTML = pageOverview(ctx);
    } catch (err) {
      content.innerHTML = `<p class="error">페이지를 그리지 못했어요: ${esc(err.message)}</p>`;
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  render();
}

menuBtn.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

boot().catch((err) => {
  content.innerHTML = `<p class="error">데이터를 불러오지 못했어요: ${esc(err.message)}<br />로컬에서 볼 때는 이 폴더를 서버로 열어 주세요: <code>python3 -m http.server 8791 --directory design-system</code></p>`;
});
