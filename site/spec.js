// Specification section of a component design page, summarised from the Figma component tokens:
//   색 매트릭스  — rows: 변형 · 슬롯 · 속성, columns: 상태, cells: the color role it points at (with a swatch)
//   크기 표      — rows: 변형 · 슬롯, columns: 속성 (높이 · 여백 · 둥글기 …), cells: the value
// Tokens are grouped by owner (the component itself, then shared owners such as selectionControl).
// Typography tokens are not repeated here; the section links to Foundations instead.
// The full token list lives on the Develop page.
//   button/primary/color/bg/hover  → owner button · 변형 primary · 배경 · column hover
//   checkbox/large/focusRing/radius → owner checkbox · 변형 large · focusRing · 둥글기

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const STATES = ['default', 'hover', 'pressed', 'focus', 'entered', 'readonly', 'error', 'disabled'];
const PROPS = new Set(['color', 'bg', 'fg', 'border', 'space', 'paddingX', 'paddingY', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'gap', 'size', 'height', 'width', 'minWidth', 'radius', 'borderWidth']);
const COLOR_LABEL = { 'color/bg': '배경', 'color/fg': '글자 · 아이콘', 'color/border': '테두리' };
const DIM_LABEL = { size: '크기', 'size/height': '높이', 'size/minWidth': '최소 너비', 'space/gap': '간격', 'space/paddingX': '좌우 여백', 'space/paddingStart': '앞 여백', 'space/paddingEnd': '뒤 여백', 'space/paddingTop': '위 여백', radius: '둥글기', borderWidth: '테두리 두께', 'icon/size': '아이콘 크기' };
const camel = (s) => s.replace(/-([a-z])/g, (_, x) => x.toUpperCase());

function parse(t, options) {
  const segs = t.figma.split('/');
  const rest = segs.slice(1);
  let state = '';
  if (rest.length && STATES.includes(rest[rest.length - 1].toLowerCase())) state = rest.pop();
  let i = rest.findIndex((s) => PROPS.has(s));
  if (i < 0) i = rest.length - 1;
  const head = rest.slice(0, i);
  const cond = head.filter((s) => options.has(s.toLowerCase())).join(' · ');
  const slot = head.filter((s) => !options.has(s.toLowerCase())).join('.');
  const propPath = rest.slice(i).join('/');
  const isColor = propPath.startsWith('color/');
  return { owner: segs[0], cond, slot, state: state || 'enabled', isColor, prop: (isColor ? COLOR_LABEL : DIM_LABEL)[propPath] || propPath.replace(/\//g, '.') };
}

const roleName = (alias) => (alias || '').replace(/^color\//, '');
// 칸 머리가 상태라 역할 이름 끝의 같은 상태(…/hover)는 줄인다
const colorCell = (t, state) => `<td class="cm-c" title="${esc(`${t.figma} → ${t.alias || ''} · ${t.value}`)}"><i class="sw" style="background:${esc(t.value)}"></i><a class="tok" href="#color">${esc(roleName(t.alias).replace(new RegExp(`/${state}$`, 'i'), '') || t.value)}</a></td>`;
const dimCell = (t) => `<td class="nw" title="${esc(`${t.figma} → ${t.alias || ''}`)}"><b class="dv">${esc(t.value)}</b><span class="tok-v">${esc(t.alias || '')}</span></td>`;
const rowName = (r) => [r.cond, r.slot].filter(Boolean).join(' · ') || '공통';

function colorMatrix(R) {
  const states = STATES.map((s) => (s === 'default' ? null : s)).filter(Boolean);
  const cols = ['enabled', 'default', ...states].filter((s, i, a) => a.indexOf(s) === i && R.some((r) => r.state === s));
  const keys = [];
  for (const r of R) { const k = `${rowName(r)}|${r.prop}`; if (!keys.includes(k)) keys.push(k); }
  let prev = '';
  const rows = keys.map((k) => {
    const [name, prop] = k.split('|');
    const show = name !== prev; prev = name;
    return `<tr${show ? ' class="grp"' : ''}><th class="nw">${show ? esc(name) : ''}</th><td class="nw muted">${esc(prop)}</td>${cols.map((s) => {
      const r = R.find((x) => `${rowName(x)}|${x.prop}` === k && x.state === s);
      return r ? colorCell(r.t, s) : '<td class="cm-x">–</td>';
    }).join('')}</tr>`;
  }).join('');
  return `<div class="tw"><table class="t spec cm"><thead><tr><th>변형 · 슬롯</th><th>속성</th>${cols.map((s) => `<th>${esc(s)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function dimTable(R) {
  const props = [...new Set(R.map((r) => r.prop))];
  const names = [...new Set(R.map(rowName))];
  const rows = names.map((n) => `<tr><th class="nw">${esc(n)}</th>${props.map((p) => {
    const r = R.find((x) => rowName(x) === n && x.prop === p);
    return r ? dimCell(r.t) : '<td class="cm-x">–</td>';
  }).join('')}</tr>`).join('');
  return `<div class="tw"><table class="t spec"><thead><tr><th>변형 · 슬롯</th>${props.map((p) => `<th>${esc(p)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function specSection(c) {
  if (!c.tokens?.length) return '';
  const options = new Set(c.props.filter((p) => p.type === 'variant').flatMap((p) => p.options.map((o) => o.toLowerCase())));
  STATES.forEach((s) => options.delete(s));
  const own = camel(c.key);
  const fonts = [...new Set(c.tokens.filter((t) => t.figma.startsWith('font/')).map((t) => t.figma.split('/').slice(1, 4).join('/')))];
  const rows = c.tokens.filter((t) => !t.figma.startsWith('font/')).map((t) => ({ t, ...parse(t, options) }));
  const owners = [...new Set(rows.map((r) => r.owner))].sort((a, b) => (a === own ? -1 : b === own ? 1 : a.localeCompare(b)));
  const body = owners.map((o) => {
    const R = rows.filter((r) => r.owner === o);
    const col = R.filter((r) => r.isColor);
    const dim = R.filter((r) => !r.isColor);
    const title = o === own ? c.name : `공유 · ${o}`;
    return `<h3>${esc(title)}</h3>
      ${col.length ? `<h4>색 · 변형 × 상태</h4>${colorMatrix(col)}` : ''}
      ${dim.length ? `<h4>크기 · 간격</h4>${dimTable(dim)}` : ''}`;
  }).join('');
  return `<h2>Specification</h2>
    <p class="note">색 칸은 그 상태에서 쓰는 색 역할(<a href="#color">색상 › Color role</a>)이고, 크기 칸은 값입니다. 칸에 마우스를 올리면 컴포넌트 토큰 이름이 보입니다. 토큰 원본은 개발 문서에 있습니다.</p>
    ${body}
    ${fonts.length ? `<p class="note">글자 스타일: ${fonts.map((f) => `<a class="tok" href="#typography">${esc(f)}</a>`).join(' · ')}</p>` : ''}`;
}
