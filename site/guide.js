// Component usage guide (components/<key>/guide.json), shown in the "가이드" tab of a component page.
// The text comes from the Figma design guide; every example is the real component drawn from
// component.json, so the guide and the code can't drift apart. Spec marks are measured from the
// rendered example, so a number that disagrees with the guide shows up as a different number.

import { renderVariant } from './render.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lines = (s) => esc(s).replace(/\n/g, '<br />');
const figmaUrl = (src) => src.url || `https://www.figma.com/design/${src.fileKey}/?node-id=${src.nodeId.replace(':', '-')}`;

// Variant props for an example, filled with the component defaults for anything the guide leaves out.
const propsFor = (c, want, base = {}) => {
  const out = {};
  for (const p of c.props) if (p.type === 'variant') out[p.name] = p.default;
  return { ...out, ...base, ...want };
};
const variantOf = (c, props) => c.variants.find((v) => Object.entries(props).every(([k, val]) => v.props[k] === val));

const codeBtn = (props) => `<button class="gd-code" data-show-variant="${esc(JSON.stringify(props))}" title="위 미리보기에 이 변형을 띄우고 코드 보기">코드</button>`;
const slot = (id, props, cls = '') => `<span class="gd-slot ${cls}" id="${id}" data-props="${esc(JSON.stringify(props))}"></span>`;

// Component options the guide's table never shows (e.g. pressed), so merging the old case sheet
// into the guide doesn't drop any variant. They get a row marked as having no guide text.
function missingRows(c, rows, defaults) {
  const extra = [];
  const shown = (name, o) => rows.some((r) => r.props[name] === o);
  for (const p of c.props) {
    if (p.type !== 'variant' || !rows.some((r) => p.name in r.props)) continue;
    for (const o of p.options) if (!shown(p.name, o)) extra.push({ name: o[0].toUpperCase() + o.slice(1), props: { [p.name]: o }, missing: true });
  }
  return extra;
}

// Overview text at the top of the component page (above the playground).
// A guide may hold only a policy (no Figma guide yet): the lead then falls back to the policy summary.
export function guideIntro(c, g) {
  const text = g.overview || c.description || g.policy?.lead || '';
  return `
    <p class="lead pt-text">${lines(text)}</p>
    ${g.source ? `<p class="gd-source">가이드 출처 <a href="${esc(figmaUrl(g.source))}" target="_blank" rel="noopener">${esc(g.source.fileName)} · ${esc(g.source.name)}</a></p>` : ''}`;
}

// Usage policy from the service UI guide (when to use, rules, do/don't).
// Rules and do/don't items may carry a portal rule number (id, e.g. UX-BUTTON-03); do/don't items are a
// string or { id, text }.
const ruleId = (id) => (id ? `<span class="rule-id">${esc(id)}</span> ` : '');
const itemText = (t) => (typeof t === 'string' ? esc(t) : ruleId(t.id) + esc(t.text));
function policySection(pl) {
  if (!pl) return '';
  const src = pl.source || {};
  return `
    <h2>${esc(pl.title)}</h2>
    ${pl.lead ? `<p class="note">${esc(pl.lead)}</p>` : ''}
    <div class="gd-when">
      <section class="gd-when-col gd-use"><h3>이럴 때 사용합니다</h3><ul>${(pl.when?.use || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
      <section class="gd-when-col gd-avoid"><h3>다른 컴포넌트를 사용합니다</h3><ul>${(pl.when?.avoid || []).map((x) => `<li>${esc(x.text)} <span class="gd-alt">→ ${esc(x.alt)}</span></li>`).join('')}</ul></section>
    </div>
    <h3>기준</h3>
    <div class="table-wrap">
      <table class="data gd-table gd-rules">
        <thead><tr><th>항목</th><th>기준</th><th>출처</th></tr></thead>
        <tbody>${pl.rules.map((r) => `<tr><td class="pt-type">${ruleId(r.id)}${esc(r.name)}</td><td class="pt-text">${esc(r.desc)}${r.gap ? `<span class="gd-gap-note">${esc(r.gap)}</span>` : ''}</td><td class="gd-from">${esc(r.from)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    ${(pl.do || []).length || (pl.dont || []).length ? `<div class="gd-dodont">
      ${(pl.do || []).length ? `<section class="gd-do"><h3>Do · 이렇게 합니다</h3><ul>${pl.do.map((t) => `<li>${itemText(t)}</li>`).join('')}</ul></section>` : ''}
      ${(pl.dont || []).length ? `<section class="gd-dont"><h3>Don't · 이건 피합니다</h3><ul>${pl.dont.map((t) => `<li>${itemText(t)}</li>`).join('')}</ul></section>` : ''}
    </div>` : ''}
    ${(pl.related || []).length ? `<p class="gd-related">함께 보기 ${pl.related.map((r) => `<span class="chip" title="${esc(r.file)}">${esc(r.name)} · ${esc(r.desc)}</span>`).join('')}</p>` : ''}
    <p class="gd-source">정책 출처 ${esc(src.title)} 문서 (${esc(src.id)}${src.status ? ` · ${esc(src.status)}` : ''})</p>`;
}

// Policy, anatomy, states, variants and spec, shown under the playground.
export function pageGuide(c, g) {
  const st = g.states, vr = g.variants, sp = g.spec, an = g.anatomy;
  return policySection(g.policy) + (an ? anatomySection(c, an) : '') + (st ? statesSection(c, st) : '')
    + (vr ? variantsSection(c, vr) : '') + (sp ? specSection(c, sp) : '')
    + ((g.notes || []).length ? `<ul class="gd-notes">${g.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '');
}

function anatomySection(c, an) {
  return `
    <h2>${esc(an.title)}</h2>
    <p class="note">${esc(an.lead)}</p>
    <div class="gd-canvas gd-anatomy">${slot('gdAnatomy', propsFor(c, an.example), 'gd-zoom')}</div>
    <ol class="pt-parts">
      ${an.parts.map((x) => `<li><span class="pt-num-badge">${x.n}</span><strong>${esc(x.name)}</strong><span>${esc(x.desc)}</span></li>`).join('')}
    </ol>`;
}

function statesSection(c, st) {
  const stateRows = [...st.rows, ...missingRows(c, st.rows, st.defaults)];
  return `
    <h2>${esc(st.title)}</h2>
    <p class="note">${esc(st.lead)}</p>
    <div class="table-wrap">
      <table class="data gd-table">
        <thead><tr><th>State</th><th>Example</th><th>Use case</th><th><span class="sr-only">코드</span></th></tr></thead>
        <tbody>${stateRows.map((r, i) => {
          const props = propsFor(c, r.props, st.defaults);
          const desc = r.missing ? '<span class="gd-missing">가이드 설명 없음 · 컴포넌트에만 있는 상태입니다.</span>' : esc(r.desc);
          return `<tr><td class="pt-type">${ruleId(r.id)}${esc(r.name)}</td><td class="gd-ex">${slot(`gdState${i}`, props)}</td><td class="pt-text">${desc}</td><td class="gd-act">${codeBtn(props)}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

function variantsSection(c, vr) {
  return `
    <h2>${esc(vr.title)}</h2>
    <p class="note">${esc(vr.lead)}</p>
    ${vr.groups.map((grp, gi) => `
      <h3>${esc(grp.title)}</h3>
      <p class="note">${esc(grp.lead)}</p>
      <div class="table-wrap">
        <table class="data gd-table">
          <thead><tr><th>Type</th><th>Example</th><th>Description</th><th><span class="sr-only">코드</span></th></tr></thead>
          <tbody>${grp.rows.map((r, i) => {
            const props = propsFor(c, r.props);
            return `<tr><td class="pt-type">${esc(r.name)}<span class="gd-prop">${esc(Object.entries(r.props).filter(([k]) => k === 'size').map(([k, v]) => `${k}=${v}`).join(''))}</span></td><td class="gd-ex">${slot(`gdVar${gi}-${i}`, props)}</td><td class="pt-text">${esc(r.desc)}</td><td class="gd-act">${codeBtn(props)}</td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>`).join('')}`;
}

function specSection(c, sp) {
  return `
    <h2>${esc(sp.title)}</h2>
    <p class="note">${esc(sp.lead)}</p>
    <div class="gd-canvas gd-spec">
      ${sp.items.map((it, i) => `
        <figure class="gd-spec-item">
          <figcaption>${esc(it.name)}</figcaption>
          ${slot(`gdSpec${i}`, propsFor(c, it.props), 'gd-zoom')}
        </figure>`).join('')}
    </div>
    <div class="table-wrap gd-spec-table">
      <table class="data">
        <thead><tr><th>Type</th><th>체크박스 크기</th><th>체크박스–라벨 간격</th><th>둥글기</th><th>라벨 글자</th></tr></thead>
        <tbody id="gdSpecRows"></tbody>
      </table>
    </div>`;
}

// Draws every example, then the anatomy and spec marks once fonts are in (and again on resize).
export function bindGuide(c, g, icons, values) {
  let seq = 0;
  const draw = (el) => {
    const v = variantOf(c, JSON.parse(el.dataset.props));
    if (!v) { el.innerHTML = '<span class="error">변형 없음</span>'; return null; }
    const prefix = `g${++seq}`;
    const { html, css } = renderVariant(c, v.layer, { values, icons, prefix });
    el.innerHTML = `<style>${css}</style>${html}`;
    el.dataset.prefix = prefix;
    return v;
  };
  document.querySelectorAll('.gd-slot').forEach(draw);

  const tokenFor = (node, field) => {
    const name = node && node.variables && (node.variables[field] || node.variables[`${field}[0]`]);
    return name ? (c.tokens.find((t) => t.figma === name) || { figma: name }) : null;
  };
  const tok = (t) => (t ? `<code class="gd-token">${esc(t.figma)}</code>` : '');
  const findLayer = (layer, name) => {
    if (layer.name === name) return layer;
    for (const ch of layer.children || []) { const f = findLayer(ch, name); if (f) return f; }
    return null;
  };

  // spec table from the component JSON itself, compared with the guide's numbers
  const rows = (g.spec?.items || []).map((it) => {
    const v = variantOf(c, propsFor(c, it.props));
    const box = findLayer(v.layer, 'checkbox');
    const label = findLayer(v.layer, 'label');
    const size = box.size[1], gap = v.layer.layout.gap, radius = box.radius;
    const flag = (have, want) => (want != null && have !== want ? ` <span class="chip chip--warn" title="가이드 값">가이드 ${want}</span>` : '');
    const font = label && label.text ? `${label.text.fontSize ?? ''}${label.text.fontWeight ? ` / ${label.text.fontWeight}` : ''}` : '';
    return `<tr><td class="pt-type">${esc(it.name)}</td>
      <td class="num">${size}px${flag(size, it.box)} ${tok(tokenFor(box, 'height'))}</td>
      <td class="num">${gap}px${flag(gap, it.gap)} ${tok(tokenFor(v.layer, 'itemSpacing'))}</td>
      <td class="num">${radius}px${flag(radius, it.radius)} ${tok(tokenFor(box, 'cornerRadius'))}</td>
      <td class="num">${esc(font)} ${tok(tokenFor(label, 'fontSize'))}</td></tr>`;
  });
  const specRows = document.getElementById('gdSpecRows');
  if (specRows) specRows.innerHTML = rows.join('');

  const marks = () => {
    document.querySelectorAll('.gd-mark').forEach((m) => m.remove());
    const rel = (el, host) => {
      const a = el.getBoundingClientRect(), b = host.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    };
    const part = (slotEl, name) => slotEl.querySelector(`.${slotEl.dataset.prefix}__${name}`);

    // anatomy: numbered badge above the indicator, to the right of the label
    const an = document.getElementById('gdAnatomy');
    const host = an?.parentElement;
    for (const p of an ? g.anatomy.parts : []) {
      const el = part(an, p.layer);
      if (!el) continue;
      const r = rel(el, host);
      const m = document.createElement('span');
      m.className = 'gd-mark gd-badge';
      m.innerHTML = `<span class="pt-num-badge">${p.n}</span>`;
      if (p.n === 1) Object.assign(m.style, { left: `${r.x + r.w / 2}px`, top: `${r.y - 12}px` });
      else Object.assign(m.style, { left: `${r.x + r.w + 14}px`, top: `${r.y + r.h / 2}px` });
      m.dataset.side = p.n === 1 ? 'top' : 'right';
      host.appendChild(m);
    }

    // spec: box height on the left, gap block between box and label, radius tag on the corner
    (g.spec?.items || []).forEach((it, i) => {
      const s = document.getElementById(`gdSpec${i}`);
      const fig = s.parentElement;
      const box = part(s, 'checkbox'), label = part(s, 'label');
      if (!box || !label) return;
      const b = rel(box, fig), l = rel(label, fig);
      const real = (n) => Math.round(n * 10) / 10;
      const add = (cls, style, text) => {
        const m = document.createElement('span');
        m.className = `gd-mark ${cls}`;
        Object.assign(m.style, style);
        if (text != null) m.innerHTML = `<span>${text}</span>`;
        fig.appendChild(m);
      };
      // getBoundingClientRect already includes zoom, so divide back to CSS px of the component
      const scale = box.offsetHeight ? b.h / box.offsetHeight : 1;
      add('gd-height', { left: `${b.x - 14}px`, top: `${b.y}px`, height: `${b.h}px` }, real(b.h / scale));
      add('gd-gap', { left: `${b.x + b.w}px`, top: `${b.y}px`, width: `${l.x - b.x - b.w}px`, height: `${b.h}px` }, real((l.x - b.x - b.w) / scale));
      add('gd-radius', { left: `${b.x - 6}px`, top: `${b.y - 22}px` }, `R${parseFloat(getComputedStyle(box).borderTopLeftRadius)}`);
    });
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(marks);
  let t;
  const onResize = () => { clearTimeout(t); t = setTimeout(() => document.getElementById('guideBody') && marks(), 120); };
  window.addEventListener('resize', onResize);
  return { redraw: marks, dispose: () => window.removeEventListener('resize', onResize) };
}
