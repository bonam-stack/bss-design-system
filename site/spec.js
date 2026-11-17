// Specification section of a component design page: the Figma component tokens laid out as
// 상태 · 슬롯 · 속성 · 값 tables, grouped by token owner (h3) and by the variant options in the
// token path (h4). Everything is read from the token paths in component.json, e.g.
//   button/primary/color/bg/hover  →  h3 button · h4 primary · state hover · slot root · 배경색
//   checkbox/large/focusRing/radius → h3 checkbox · h4 large · slot focusRing · radius

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const STATES = ['default', 'hover', 'pressed', 'focus', 'entered', 'readonly', 'error', 'disabled'];
const PROPS = new Set(['color', 'bg', 'fg', 'border', 'space', 'paddingX', 'paddingY', 'paddingStart', 'paddingEnd', 'paddingTop', 'paddingBottom', 'gap', 'size', 'height', 'width', 'minWidth', 'radius', 'borderWidth']);
const LABEL = { 'color/bg': '배경색', 'color/fg': '글자색', 'color/border': '테두리색', 'space/gap': '간격 (gap)', size: '크기', radius: '둥글기', borderWidth: '테두리 두께' };
const camel = (s) => s.replace(/-([a-z])/g, (_, x) => x.toUpperCase());

function parse(c, t, options) {
  const segs = t.figma.split('/');
  if (segs[0] === 'font') {
    return { owner: '타이포그래피', cond: segs.slice(1, 4).join('/'), state: '', slot: 'text', prop: segs[4] || '' };
  }
  const rest = segs.slice(1);
  let state = '';
  if (rest.length && STATES.includes(rest[rest.length - 1].toLowerCase())) state = rest.pop();
  let i = rest.findIndex((s) => PROPS.has(s));
  if (i < 0) i = rest.length - 1;
  const head = rest.slice(0, i);
  const cond = head.filter((s) => options.has(s.toLowerCase()));
  const slot = head.filter((s) => !options.has(s.toLowerCase()));
  const propPath = rest.slice(i).join('/');
  return { owner: segs[0], cond: cond.join(' · '), state, slot: slot.join('.') || 'root', prop: LABEL[propPath] || propPath.replace(/\//g, '.') };
}

export function specSection(c) {
  if (!c.tokens?.length) return '';
  const options = new Set(c.props.filter((p) => p.type === 'variant').flatMap((p) => p.options.map((o) => o.toLowerCase())));
  STATES.forEach((s) => options.delete(s));
  const own = camel(c.key);
  const rows = c.tokens.map((t) => ({ t, ...parse(c, t, options) }));
  const owners = [...new Set(rows.map((r) => r.owner))].sort((a, b) => (a === own ? -1 : b === own ? 1 : a === '타이포그래피' ? 1 : b === '타이포그래피' ? -1 : a.localeCompare(b)));
  const stateRank = (s) => (s ? STATES.indexOf(s.toLowerCase()) + 1 : 0);
  const value = (t) => `${t.type === 'COLOR' ? `<i class="sw" style="background:${esc(t.value)}"></i>` : ''}<a class="tok" href="#tokens" title="${esc(t.figma)}">${esc(t.alias || t.figma)}</a><span class="tok-v">${esc(t.value)}</span>`;

  const body = owners.map((o) => {
    const R = rows.filter((r) => r.owner === o);
    const conds = [...new Set(R.map((r) => r.cond))].sort((a, b) => (a === '' ? -1 : b === '' ? 1 : 0));
    const title = o === own ? c.name : o === '타이포그래피' ? '타이포그래피' : `공유 토큰 · ${o}`;
    const fold = o !== own;
    return `<h3>${esc(title)} <span class="count">${R.length}</span></h3>
      ${fold ? `<details class="ref"><summary>${R.length}개 토큰 펼치기</summary>` : ''}${conds.map((cd) => {
        const L = R.filter((r) => r.cond === cd).sort((a, b) => stateRank(a.state) - stateRank(b.state) || a.slot.localeCompare(b.slot) || a.prop.localeCompare(b.prop));
        let ps = null, pl = null;
        const tr = L.map((r) => {
          const st = r.state || 'enabled';
          const showS = st !== ps; const showL = showS || r.slot !== pl;
          ps = st; pl = r.slot;
          return `<tr${showS ? ' class="grp"' : ''}><td>${showS ? `<span class="spec-st">${esc(st)}</span>` : ''}</td><td class="mono">${showL ? esc(r.slot) : ''}</td><td>${esc(r.prop)}</td><td class="nw">${value(r.t)}</td></tr>`;
        }).join('');
        return `<h4>${esc(cd || 'base')}</h4><div class="tw"><table class="t spec"><thead><tr><th>상태</th><th>슬롯</th><th>속성</th><th>값</th></tr></thead><tbody>${tr}</tbody></table></div>`;
      }).join('')}${fold ? '</details>' : ''}`;
  }).join('');
  return `<h2>Specification</h2>
    <p class="note">Figma 컴포넌트 토큰을 상태 · 슬롯 · 속성별로 정리했습니다. 값은 가리키는 디자인 토큰이고, 누르면 토큰 목록으로 갑니다.</p>
    ${body}`;
}
