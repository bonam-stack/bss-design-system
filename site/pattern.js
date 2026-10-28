// Pattern guide pages (patterns/<key>/pattern.json): overview, anatomy with numbered parts,
// type table and spacing spec, all drawn from the Figma guide. Example inputs use the sizes and
// colors read from Figma; spacing marks in the spec are measured from the rendered example, so a
// mark that disagrees with Figma shows up as a different number.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lines = (s) => esc(s).replace(/\n/g, '<br />');

function node(n, marks, icons) {
  const id = n.id ? ` data-pt="${esc(n.id)}"` : '';
  const mark = marks && n.mark ? `<span class="pt-mark" style="left:${n.markX}px" aria-hidden="true"><span>${n.mark}</span></span>` : '';
  const size = (n.w ? `width:${n.w}px;` : '') + (n.h ? `height:${n.h}px;` : '');
  let inner;
  if (n.row) return `<div class="pt-row"${id} style="gap:${n.gap}px">${mark}${n.row.map((c) => node(c, marks, icons)).join('')}</div>`;
  if (n.label) inner = `<span class="pt-label"${id}>${mark}${esc(n.label)}</span>`;
  else if (n.select) inner = `<span class="pt-box pt-select"${id} style="${size}">${mark}<span class="pt-value">${esc(n.select)}</span>${icons.chevron}</span>`;
  else if (n.date) inner = `<span class="pt-box pt-date"${id} style="${size}">${mark}<span class="pt-value pt-num">${esc(n.date)}</span><span class="pt-cal">${icons.calendar}</span></span>`;
  else if (n.field) inner = `<span class="pt-box pt-field"${id} style="${size}">${mark}<span class="pt-value">${esc(n.field)}</span></span>`;
  else if (n.button) inner = `<span class="pt-button"${id}>${mark}${esc(n.button)}</span>`;
  else if (n.divider) inner = `<span class="pt-divider"${id} style="height:${n.divider}px">${mark}</span>`;
  return inner || '';
}

const figure = (p, key, marks, icons) => `<div class="pt-figure">${node(p.figures[key].layout, marks, icons)}</div>`;

export function pagePattern(p, icons) {
  const a = p.anatomy, t = p.types, s = p.spec;
  return `
    <p class="eyebrow">${esc(p.group)}</p>
    <h1>${esc(p.name)}</h1>
    <h2>Overview</h2>
    <p class="lead pt-text">${lines(p.overview)}</p>

    <h2>${esc(a.title)}</h2>
    <p class="note">${esc(a.lead)}</p>
    <div class="pt-canvases">
      ${a.examples.map((e) => `<section class="pt-canvas pt-marked"><h3>${esc(e.title)}</h3>${figure(p, e.figure, true, icons)}</section>`).join('')}
    </div>
    <ol class="pt-parts">
      ${a.parts.map((x) => `<li><span class="pt-num-badge">${x.n}</span><strong>${esc(x.name)}</strong><span>${esc(x.desc)}</span></li>`).join('')}
    </ol>

    <h2>${esc(t.title)}</h2>
    <p class="note">${esc(t.lead)}</p>
    <div class="table-wrap">
      <table class="data pt-types">
        <thead><tr><th>Type</th><th>Example</th><th>Description</th></tr></thead>
        <tbody>${t.rows.map((r) => `<tr><td class="pt-type">${esc(r.name)}</td><td><div class="pt-example">${figure(p, r.figure, false, icons)}</div></td><td class="pt-text">${lines(r.desc)}</td></tr>`).join('')}</tbody>
      </table>
    </div>

    <h2>${esc(s.title)}</h2>
    <p class="note">${esc(s.lead)}</p>
    <div class="pt-canvases">
      ${s.examples.map((e, i) => `<section class="pt-canvas pt-spec" data-spec="${i}">${figure(p, e.figure, false, icons)}</section>`).join('')}
    </div>`;
}

// Spacing marks: a translucent block over the gap with its width underneath, as in the Figma spec.
// They are placed from measured positions, so they are drawn once fonts are in and again on resize.
let current = null;
window.addEventListener('resize', () => current && drawGaps(current));

export function bindPattern(p) {
  current = p;
  return document.fonts.ready.then(() => drawGaps(p));
}

function drawGaps(p) {
  const out = [];
  document.querySelectorAll('.pt-gap, .pt-center').forEach((e) => e.remove());
  document.querySelectorAll('.pt-spec').forEach((canvas) => {
    const ex = p.spec.examples[Number(canvas.dataset.spec)];
    const box = canvas.getBoundingClientRect();
    const at = (id) => canvas.querySelector(`[data-pt="${id}"]`).getBoundingClientRect();
    for (const g of ex.gaps) {
      const a = at(g.from), b = at(g.to);
      const top = Math.min(a.top, b.top), bottom = Math.max(a.bottom, b.bottom);
      const width = Math.round(b.left - a.right);
      const gap = document.createElement('span');
      gap.className = 'pt-gap';
      Object.assign(gap.style, { left: `${a.right - box.left}px`, top: `${top - box.top}px`, width: `${b.left - a.right}px`, height: `${bottom - top}px` });
      gap.innerHTML = `<span class="pt-gap-num">${width}</span>`;
      canvas.appendChild(gap);
      if (width !== g.value) out.push(`${g.from}→${g.to}: ${width}px (Figma ${g.value}px)`);
      if (g.center) {
        const c = at(g.center);
        const tag = document.createElement('span');
        tag.className = 'pt-center';
        Object.assign(tag.style, { left: `${c.left + c.width / 2 - box.left}px`, top: `${c.top - box.top}px` });
        tag.innerHTML = '<span>Center</span>';
        canvas.appendChild(tag);
      }
    }
  });
  if (out.length) console.warn('pattern spacing differs from Figma', out);
  return out;
}
