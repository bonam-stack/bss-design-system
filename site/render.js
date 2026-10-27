// component.json (schemaVersion 2) -> HTML + CSS for one variant.
// Every layer becomes an element with its own class; Figma values become CSS, and values bound to a
// Figma variable are written as var(--token, value) so the code shows which token drives them.
// Icon instances are swapped for the SVG from icons/icons.json (matched by component key).

const px = (n) => `${Math.round(n * 100) / 100}px`;
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'layer';
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const JUSTIFY = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
const ALIGN = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };
const TEXT_ALIGN = { LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify' };

export const isRenderable = (comp) => comp.schemaVersion >= 2 && (comp.variants.some((v) => v.layer) || comp.layer);

// opts.values      { [figmaPropName]: value } for boolean/text props
// opts.icons       Map(componentKey -> { svg, colored })
// opts.prefix      class prefix (unique per preview; the clean one for the code tab)
export function renderVariant(comp, layer, opts) {
  const tokenByFigma = new Map(comp.tokens.map((t) => [t.figma, t]));
  const prefix = opts.prefix;
  const used = new Map();
  const rules = [];

  const v = (node, fields, raw) => {
    for (const f of [].concat(fields)) {
      const name = node.variables && (node.variables[f] || node.variables[`${f}[0]`]);
      const t = name && tokenByFigma.get(name);
      if (t) return `var(${t.css}, ${raw})`;
    }
    return raw;
  };
  const paint = (p) => {
    const t = p.variable && tokenByFigma.get(p.variable);
    return t ? `var(${t.css}, ${p.color})` : p.color;
  };
  const firstSolid = (list) => (list || []).find((p) => p.visible !== false && p.type === 'SOLID');
  const descendantColor = (node) => {
    const own = firstSolid(node.fills);
    if (own) return paint(own);
    for (const c of node.children || []) {
      const got = descendantColor(c);
      if (got) return got;
    }
    return null;
  };
  const className = (node) => {
    const base = node === layer ? prefix : `${prefix}__${slug(node.name)}`;
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const shown = (node) => {
    const ref = node.propRefs && node.propRefs.visible;
    if (ref && ref in opts.values) return !!opts.values[ref];
    return node.visible !== false;
  };

  function sizeRules(node, parent, css) {
    const dir = parent && parent.layout ? parent.layout.mode : null;
    const [sw, sh] = node.sizing || ['FIXED', 'FIXED'];
    const axis = (sizing, prop, isMain, field) => {
      if (sizing === 'FIXED') {
        css[prop] = v(node, field, px(node.size[prop === 'width' ? 0 : 1]));
        if (dir) css['flex-shrink'] = '0';
      } else if (sizing === 'FILL' && dir) {
        if (isMain) { css.flex = '1 1 0'; css[`min-${prop}`] = '0'; } else {
          // Stretch across the parent, but keep the Figma size when the parent hugs its content.
          css['align-self'] = 'stretch';
          css[`min-${prop}`] = px(node.size[prop === 'width' ? 0 : 1]);
        }
      }
    };
    axis(sw, 'width', dir === 'HORIZONTAL', 'width');
    axis(sh, 'height', dir === 'VERTICAL', 'height');
    const [minW, maxW] = node.minMaxWidth || [];
    const [minH, maxH] = node.minMaxHeight || [];
    if (minW) css['min-width'] = px(minW);
    if (maxW) css['max-width'] = px(maxW);
    if (minH) css['min-height'] = px(minH);
    if (maxH) css['max-height'] = px(maxH);
    // A frame that hugs its content vertically keeps at least its Figma height (min-height in Figma
    // is not always set, and absolutely placed children do not count toward hugging in CSS).
    if (sh === 'HUG' && node.type !== 'TEXT' && node.children && node.children.length && !css['min-height']) {
      css['min-height'] = px(node.size[1]);
    }
    if (parent && (!parent.layout || node.position) && node.position) {
      css.position = 'absolute';
      // Figma constraints keep the layer tied to the parent's edges or center when the parent
      // grows (a two-line label, a longer button); without them it stays at its x/y.
      const [ch, cv] = node.constraints || ['MIN', 'MIN'];
      place(ch, node.position[0], node.size[0], parent.size[0], 'left', 'right', 'width', css);
      place(cv, node.position[1], node.size[1], parent.size[1], 'top', 'bottom', 'height', css);
    }
  }

  function place(c, at, size, parentSize, start, end, prop, css) {
    const rest = parentSize - at - size;
    if (c === 'MAX') css[end] = px(rest);
    else if (c === 'CENTER') css[start] = `calc(50% + ${px(at - parentSize / 2)})`;
    else if (c === 'STRETCH') {
      css[start] = px(at);
      css[end] = px(rest);
      delete css[prop];
    } else if (c === 'SCALE') {
      css[start] = `${(at / parentSize) * 100}%`;
      css[prop] = `${(size / parentSize) * 100}%`;
    } else css[start] = px(at);
  }

  function boxRules(node, css) {
    if (node.layout) {
      const l = node.layout;
      css.display = 'flex';
      css['flex-direction'] = l.mode === 'VERTICAL' ? 'column' : 'row';
      if (l.wrap) css['flex-wrap'] = 'wrap';
      if (l.gap) css.gap = v(node, 'itemSpacing', px(l.gap));
      const [t, r, b, lft] = l.padding;
      if (t || r || b || lft) {
        css.padding = [
          v(node, 'paddingTop', px(t)), v(node, 'paddingRight', px(r)),
          v(node, 'paddingBottom', px(b)), v(node, 'paddingLeft', px(lft)),
        ].join(' ');
      }
      css['justify-content'] = JUSTIFY[l.align[0]] || 'flex-start';
      css['align-items'] = ALIGN[l.align[1]] || 'flex-start';
    }
    // Children placed by x/y (no auto layout, or absolute inside auto layout) need a positioned parent.
    if ((node.children || []).some((c) => c.position) && !css.position) css.position = 'relative';
    if (node.radius !== undefined) {
      css['border-radius'] = Array.isArray(node.radius)
        ? node.radius.map((r, i) => v(node, [['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'][i], 'cornerRadius'], px(r))).join(' ')
        : v(node, ['topLeftRadius', 'cornerRadius'], px(node.radius));
    }
    const fill = firstSolid(node.fills);
    if (fill) css.background = paint(fill);
    const shadows = [];
    const stroke = firstSolid(node.strokes);
    if (stroke) {
      const w = Array.isArray(node.strokeWeight) ? null : v(node, ['strokeWeight', 'strokeTopWeight'], px(node.strokeWeight));
      if (!w) {
        // Per-side weights: borders drawn inside the box.
        css['box-sizing'] = 'border-box';
        css['border-style'] = 'solid';
        css['border-color'] = paint(stroke);
        css['border-width'] = node.strokeWeight.map(px).join(' ');
      } else if (node.strokeAlign === 'INSIDE') {
        shadows.push(`inset 0 0 0 ${w} ${paint(stroke)}`);
      } else {
        css.outline = `${w} solid ${paint(stroke)}`;
        css['outline-offset'] = node.strokeAlign === 'CENTER' ? `calc(${w} / -2)` : '0';
      }
    }
    for (const e of node.effects || []) {
      if (e.visible === false) continue;
      if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
        shadows.push(`${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${px(e.offset[0])} ${px(e.offset[1])} ${px(e.radius)} ${px(e.spread || 0)} ${e.color}`);
      } else if (e.type === 'LAYER_BLUR') css.filter = `blur(${px(e.radius)})`;
      else if (e.type === 'BACKGROUND_BLUR') css['backdrop-filter'] = `blur(${px(e.radius)})`;
    }
    if (shadows.length) css['box-shadow'] = shadows.join(', ');
    if (node.opacity !== undefined) css.opacity = String(node.opacity);
    if (node.clips) css.overflow = 'hidden';
  }

  function textRules(node, css) {
    const t = node.text;
    const fill = firstSolid(node.fills);
    if (fill) css.color = paint(fill);
    if (t.fontFamily) css['font-family'] = v(node, 'fontFamily', `'${t.fontFamily}', sans-serif`);
    if (t.fontWeight) css['font-weight'] = v(node, 'fontWeight', String(t.fontWeight));
    if (t.fontSize) css['font-size'] = v(node, 'fontSize', px(t.fontSize));
    if (t.lineHeight && t.lineHeight !== 'AUTO') {
      css['line-height'] = v(node, 'lineHeight', t.lineHeight.unit === 'PERCENT' ? `${t.lineHeight.value}%` : px(t.lineHeight.value));
    }
    if (t.letterSpacing && t.letterSpacing.value) {
      css['letter-spacing'] = v(node, 'letterSpacing', t.letterSpacing.unit === 'PERCENT' ? `${t.letterSpacing.value / 100}em` : px(t.letterSpacing.value));
    }
    if (t.align && TEXT_ALIGN[t.align[0]] && t.align[0] !== 'LEFT') css['text-align'] = TEXT_ALIGN[t.align[0]];
    // WIDTH_AND_HEIGHT grows on one line; every other mode wraps inside its width, breaking long
    // words like Figma does instead of spilling out of the box.
    if (t.autoResize === 'WIDTH_AND_HEIGHT') css['white-space'] = 'nowrap';
    else css['overflow-wrap'] = 'anywhere';
    // NONE is a fixed text box: longer text stays inside its height (scrolls, like a textarea)
    // instead of pushing the frame taller.
    if (t.autoResize === 'NONE' && node.sizing && node.sizing[1] !== 'HUG') Object.assign(css, { height: px(node.size[1]), 'overflow-y': 'auto' });
    if (t.case === 'UPPER') css['text-transform'] = 'uppercase';
    if (t.decoration === 'UNDERLINE') css['text-decoration'] = 'underline';
    if (t.truncate) {
      // maxLines when Figma has one; otherwise a fixed-height box ends with "…" on its last line.
      const lh = t.lineHeight && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : null;
      const fixedH = node.sizing && node.sizing[1] !== 'HUG' && t.autoResize !== 'HEIGHT';
      const lines = typeof t.truncate === 'number' ? t.truncate : fixedH && lh ? Math.max(1, Math.floor(node.size[1] / lh)) : 1;
      if (lines === 1) Object.assign(css, { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' });
      else {
        // the clamp only hides lines past the box, so the box is cut to exactly those lines
        Object.assign(css, { display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': String(lines), overflow: 'hidden' });
        if (lh) Object.assign(css, { 'min-height': '0', 'max-height': px(lines * lh) });
      }
    }
  }

  // Figma draws typing as [text (hug), cursor] side by side, which cannot show a caret that moves
  // with the text. In code the frame becomes a line of text with the cursor inline after it:
  // multi-line text wraps and the cursor follows the last line; single-line text (truncated to one
  // line in Figma) stays on one line and scrolls so its end and the cursor stay in view.
  const typing = (node) => {
    const kids = (node.children || []).filter(shown);
    if (kids.length !== 2 || kids[0].type !== 'TEXT') return null;
    const cursor = kids[1];
    if (cursor.type !== 'INSTANCE' || !/cursor/i.test(cursor.main?.name || cursor.name)) return null;
    return { text: kids[0], cursor, single: kids[0].text.truncate === 1 };
  };
  const inTyping = new Map(); // child node -> typing info of its frame
  const caretBlink = () => {
    if (!rules.some(([k]) => k === '@keyframes ds-caret-blink')) rules.push(['@keyframes ds-caret-blink', '50% { opacity: 0; }']);
  };

  function typingText(t, css) {
    for (const k of ['flex', 'flex-shrink', 'align-self', 'width', 'min-width', 'height', 'min-height', 'max-height',
      'overflow', 'overflow-y', 'text-overflow', 'display', '-webkit-box-orient', '-webkit-line-clamp']) delete css[k];
    css['white-space'] = t.single ? 'pre' : 'pre-wrap';
  }

  function el(node, parent, depth) {
    if (!shown(node)) return '';
    const cls = className(node);
    const css = {};
    const pad = '  '.repeat(depth);
    sizeRules(node, parent, css);
    const inside = inTyping.get(node);
    if (inside && node === inside.cursor) {
      for (const k of ['flex-shrink', 'align-self', 'position']) delete css[k];
      Object.assign(css, { display: 'inline-block', 'vertical-align': 'middle', background: descendantColor(node) || 'currentColor', animation: 'ds-caret-blink 1s steps(1) infinite' });
      caretBlink();
      rules.push([cls, css]);
      return `${pad}<span class="${cls}" aria-hidden="true"></span>\n`;
    }
    const icon = node.type === 'INSTANCE' && node.main && opts.icons.get(node.main.key);
    if (icon) {
      css.display = 'block';
      css.width = css.width || px(node.size[0]);
      css.height = css.height || px(node.size[1]);
      if (!icon.colored) {
        const color = descendantColor(node);
        if (color) css.color = color;
      }
      rules.push([cls, css]);
      // an inline svg sits on the text baseline and drops below its box; block keeps it in place
      rules.push([`${cls} > svg`, { display: 'block' }]);
      const svg = icon.svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');
      return `${pad}<span class="${cls}" aria-hidden="true">${svg}</span>\n`;
    }
    if (node.type === 'TEXT') {
      textRules(node, css);
      if (inside) typingText(inside, css);
      rules.push([cls, css]);
      const ref = node.propRefs && node.propRefs.characters;
      const text = ref && ref in opts.values ? opts.values[ref] : node.text.characters;
      // Line breaks typed into a text prop (or in the Figma text) show as real line breaks.
      return `${pad}<span class="${cls}">${escHtml(text).replace(/\n/g, '<br />')}</span>\n`;
    }
    boxRules(node, css);
    if (node === layer && !css.display) css.display = 'inline-block';
    if (node === layer && css.display === 'flex') css.display = 'inline-flex';
    const t = typing(node);
    if (t) {
      inTyping.set(t.text, t).set(t.cursor, t);
      for (const k of ['flex-direction', 'justify-content', 'align-items', 'gap']) delete css[k];
      css.display = 'block';
      // the line box takes the text's font so the cursor does not make the line taller
      const font = {};
      textRules(t.text, font);
      for (const k of ['font-family', 'font-size', 'line-height']) if (font[k]) css[k] = font[k];
      if (t.single) Object.assign(css, { 'white-space': 'nowrap', overflow: 'hidden', direction: 'rtl', 'text-align': 'left' });
    }
    rules.push([cls, css]);
    let kids = (node.children || []).map((c) => el(c, node, depth + 1)).join('');
    // no whitespace between the text and the cursor, or it shows as a gap before the caret
    if (t) kids = kids.replace(/\n\s*</g, '<').trim();
    if (t && t.single) {
      // rtl on the frame keeps the end in view when the line overflows; the line itself reads ltr
      rules.push([`${cls}__line`, { direction: 'ltr', 'unicode-bidi': 'isolate' }]);
      kids = `<span class="${cls}__line">${kids}</span>`;
    }
    if (t) return `${pad}<div class="${cls}">${kids}</div>\n`;
    return kids ? `${pad}<div class="${cls}">\n${kids}${pad}</div>\n` : `${pad}<div class="${cls}"></div>\n`;
  }

  const html = el(layer, null, 0);
  const css = rules
    .filter(([, decl]) => typeof decl === 'string' || Object.keys(decl).length)
    .map(([cls, decl]) => typeof decl === 'string' ? `${cls} { ${decl} }`
      : `.${cls} {\n${Object.entries(decl).map(([k, val]) => `  ${k}: ${val};`).join('\n')}\n}`)
    .join('\n');
  return { html: html.trimEnd(), css };
}
