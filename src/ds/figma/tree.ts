// component.json의 변형 레이어 하나 → 그릴 노드 트리.
// 레이어마다 클래스 하나와 CSS 선언을 만든다. Figma 값은 CSS로, Figma 변수에 묶인 값은 var(--token, 값)으로 적어
// 어떤 토큰이 그 값을 정하는지 코드에서 보이게 한다. 아이콘 인스턴스는 icons.json의 SVG로 바꿔 끼운다(컴포넌트 키로 찾음).
// 같은 트리를 React 요소(react.tsx)와 HTML · CSS 코드(html.ts) 두 가지로 내보낸다.

import type { ComponentData, IconMap, Layer, Paint, PropValues } from './types';

export type Css = Record<string, string>;

export interface RNode {
  kind: 'box' | 'text' | 'icon' | 'caret' | 'line';
  cls: string;
  css: Css;
  layer: Layer;
  text?: string;
  svg?: string;
  /** Figma SLOT 레이어 (React에서는 children으로 바꿔 끼울 수 있다) */
  slot?: boolean;
  /** 글자와 커서를 붙여 쓰는 입력 줄 (사이에 공백이 들어가면 커서 앞이 벌어진다) */
  tight?: boolean;
  children?: RNode[];
}

export interface Tree {
  root: RNode;
  /** 클래스 하나에 묶이지 않는 규칙 (@keyframes, 자식 선택자) */
  extra: [string, Css | string][];
}

export interface TreeOptions {
  values: PropValues;
  icons: IconMap;
  /** 클래스 앞자리 (미리보기마다 다르게, 코드 탭은 깔끔한 ds-<key>) */
  prefix: string;
}

const px = (n: number) => `${Math.round(n * 100) / 100}px`;
const slug = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'layer';

const JUSTIFY: Record<string, string> = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
const ALIGN: Record<string, string> = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };
const TEXT_ALIGN: Record<string, string> = { LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify' };

export const isRenderable = (comp: ComponentData) => comp.schemaVersion >= 2 && (comp.variants.some((v) => v.layer) || !!comp.layer);

interface Typing {
  text: Layer;
  cursor: Layer;
  single: boolean;
}

export function buildTree(comp: ComponentData, layer: Layer, opts: TreeOptions): Tree {
  const tokenByFigma = new Map(comp.tokens.map((t) => [t.figma, t]));
  const prefix = opts.prefix;
  const used = new Map<string, number>();
  const extra: Tree['extra'] = [];

  const v = (node: Layer, fields: string | string[], raw: string) => {
    for (const f of ([] as string[]).concat(fields)) {
      const name = node.variables && (node.variables[f] || node.variables[`${f}[0]`]);
      const t = name && tokenByFigma.get(name);
      if (t) return `var(${t.css}, ${raw})`;
    }
    return raw;
  };
  const paint = (p: Paint) => {
    const t = p.variable && tokenByFigma.get(p.variable);
    return t ? `var(${t.css}, ${p.color})` : String(p.color);
  };
  const firstSolid = (list?: Paint[]) => (list || []).find((p) => p.visible !== false && p.type === 'SOLID');
  const descendantColor = (node: Layer): string | null => {
    const own = firstSolid(node.fills);
    if (own) return paint(own);
    for (const c of node.children || []) {
      const got = descendantColor(c);
      if (got) return got;
    }
    return null;
  };
  const className = (node: Layer) => {
    const base = node === layer ? prefix : `${prefix}__${slug(node.name)}`;
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const shown = (node: Layer) => {
    const ref = node.propRefs && node.propRefs.visible;
    if (ref && ref in opts.values) return !!opts.values[ref];
    return node.visible !== false;
  };

  function place(c: string, at: number, size: number, parentSize: number, start: string, end: string, prop: string, css: Css) {
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

  function sizeRules(node: Layer, parent: Layer | null, css: Css) {
    const dir = parent && parent.layout ? parent.layout.mode : null;
    const [sw, sh] = node.sizing || ['FIXED', 'FIXED'];
    const axis = (sizing: string, prop: 'width' | 'height', isMain: boolean, field: string) => {
      if (sizing === 'FIXED') {
        css[prop] = v(node, field, px(node.size[prop === 'width' ? 0 : 1]));
        if (dir) css['flex-shrink'] = '0';
      } else if (sizing === 'FILL' && dir) {
        if (isMain) {
          css.flex = '1 1 0';
          css[`min-${prop}`] = '0';
        } else {
          // 부모를 가로질러 늘이되, 부모가 내용에 맞춰 줄어들 때는 Figma 크기를 지킨다.
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
    // 세로로 내용에 맞추는 프레임은 Figma 높이를 최소로 지킨다 (Figma의 min-height가 늘 있지는 않고,
    // 절대 위치 자식은 CSS에서 내용 높이에 들어가지 않는다).
    if (sh === 'HUG' && node.type !== 'TEXT' && node.children && node.children.length && !css['min-height']) {
      css['min-height'] = px(node.size[1]);
    }
    if (parent && (!parent.layout || node.position) && node.position) {
      css.position = 'absolute';
      // Figma 제약: 부모가 커질 때(두 줄 라벨, 긴 버튼) 레이어를 가장자리나 가운데에 묶는다. 없으면 x/y에 머문다.
      const [ch, cv] = node.constraints || ['MIN', 'MIN'];
      place(ch, node.position[0], node.size[0], parent.size[0], 'left', 'right', 'width', css);
      place(cv, node.position[1], node.size[1], parent.size[1], 'top', 'bottom', 'height', css);
    }
  }

  function boxRules(node: Layer, css: Css) {
    if (node.layout) {
      const l = node.layout;
      css.display = 'flex';
      css['flex-direction'] = l.mode === 'VERTICAL' ? 'column' : 'row';
      if (l.wrap) css['flex-wrap'] = 'wrap';
      if (l.gap) css.gap = v(node, 'itemSpacing', px(l.gap));
      const [t, r, b, lft] = l.padding;
      if (t || r || b || lft) {
        css.padding = [v(node, 'paddingTop', px(t)), v(node, 'paddingRight', px(r)), v(node, 'paddingBottom', px(b)), v(node, 'paddingLeft', px(lft))].join(' ');
      }
      css['justify-content'] = JUSTIFY[l.align[0]] || 'flex-start';
      css['align-items'] = ALIGN[l.align[1]] || 'flex-start';
    }
    // x/y로 놓이는 자식(오토 레이아웃 없음, 또는 오토 레이아웃 안의 절대 위치)은 위치가 잡힌 부모가 있어야 한다.
    if ((node.children || []).some((c) => c.position) && !css.position) css.position = 'relative';
    if (node.radius !== undefined) {
      css['border-radius'] = Array.isArray(node.radius)
        ? node.radius.map((r, i) => v(node, [['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'][i], 'cornerRadius'], px(r))).join(' ')
        : v(node, ['topLeftRadius', 'cornerRadius'], px(node.radius));
    }
    const fill = firstSolid(node.fills);
    if (fill) css.background = paint(fill);
    const shadows: string[] = [];
    const stroke = firstSolid(node.strokes);
    if (stroke) {
      const w = Array.isArray(node.strokeWeight) ? null : v(node, ['strokeWeight', 'strokeTopWeight'], px(node.strokeWeight ?? 0));
      if (!w) {
        // 변마다 다른 두께: 박스 안쪽에 테두리로 그린다.
        css['box-sizing'] = 'border-box';
        css['border-style'] = 'solid';
        css['border-color'] = paint(stroke);
        css['border-width'] = (node.strokeWeight as number[]).map(px).join(' ');
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

  function textRules(node: Layer, css: Css) {
    const t = node.text!;
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
    // WIDTH_AND_HEIGHT는 한 줄로 늘어나고, 나머지는 폭 안에서 줄을 바꾼다. 긴 낱말도 Figma처럼 끊어 박스 밖으로 넘치지 않게 한다.
    if (t.autoResize === 'WIDTH_AND_HEIGHT') css['white-space'] = 'nowrap';
    else css['overflow-wrap'] = 'anywhere';
    // NONE은 고정 글상자: 긴 글은 높이 안에서 스크롤되고(textarea처럼) 프레임을 키우지 않는다.
    if (t.autoResize === 'NONE' && node.sizing && node.sizing[1] !== 'HUG') Object.assign(css, { height: px(node.size[1]), 'overflow-y': 'auto' });
    if (t.case === 'UPPER') css['text-transform'] = 'uppercase';
    if (t.decoration === 'UNDERLINE') css['text-decoration'] = 'underline';
    if (t.truncate) {
      // Figma에 maxLines가 있으면 그 줄 수, 없으면 고정 높이 상자의 마지막 줄이 "…"로 끝난다.
      const lh = t.lineHeight && t.lineHeight !== 'AUTO' && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : null;
      const fixedH = node.sizing && node.sizing[1] !== 'HUG' && t.autoResize !== 'HEIGHT';
      const lines = typeof t.truncate === 'number' ? t.truncate : fixedH && lh ? Math.max(1, Math.floor(node.size[1] / lh)) : 1;
      if (lines === 1) Object.assign(css, { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' });
      else {
        // 줄 자르기는 상자 밖의 줄만 숨기므로, 상자를 정확히 그 줄 수로 자른다.
        Object.assign(css, { display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': String(lines), overflow: 'hidden' });
        if (lh) Object.assign(css, { 'min-height': '0', 'max-height': px(lines * lh) });
      }
    }
  }

  // Figma는 입력 중 상태를 [글자(hug), 커서]로 나란히 그려서, 글자를 따라 움직이는 커서를 못 보여 준다.
  // 코드에서는 프레임을 한 줄의 글로 바꾸고 커서를 글 뒤에 붙인다: 여러 줄 글은 줄을 바꾸고 커서가 마지막 줄을 따라가며,
  // 한 줄 글(Figma에서 한 줄로 자름)은 한 줄로 두고 스크롤해서 끝과 커서가 보이게 한다.
  const typing = (node: Layer): Typing | null => {
    const kids = (node.children || []).filter(shown);
    if (kids.length !== 2 || kids[0].type !== 'TEXT') return null;
    const cursor = kids[1];
    if (cursor.type !== 'INSTANCE' || !/cursor/i.test(cursor.main?.name || cursor.name)) return null;
    return { text: kids[0], cursor, single: kids[0].text!.truncate === 1 };
  };
  const inTyping = new Map<Layer, Typing>();
  const caretBlink = () => {
    if (!extra.some(([k]) => k === '@keyframes ds-caret-blink')) extra.push(['@keyframes ds-caret-blink', '50% { opacity: 0; }']);
  };
  function typingText(t: Typing, css: Css) {
    for (const k of ['flex', 'flex-shrink', 'align-self', 'width', 'min-width', 'height', 'min-height', 'max-height', 'overflow', 'overflow-y', 'text-overflow', 'display', '-webkit-box-orient', '-webkit-line-clamp']) delete css[k];
    css['white-space'] = t.single ? 'pre' : 'pre-wrap';
  }

  function el(node: Layer, parent: Layer | null): RNode | null {
    if (!shown(node)) return null;
    const cls = className(node);
    const css: Css = {};
    sizeRules(node, parent, css);
    const inside = inTyping.get(node);
    if (inside && node === inside.cursor) {
      for (const k of ['flex-shrink', 'align-self', 'position']) delete css[k];
      Object.assign(css, { display: 'inline-block', 'vertical-align': 'middle', background: descendantColor(node) || 'currentColor', animation: 'ds-caret-blink 1s steps(1) infinite' });
      caretBlink();
      return { kind: 'caret', cls, css, layer: node };
    }
    const icon = node.type === 'INSTANCE' && node.main && opts.icons[node.main.key];
    if (icon) {
      css.display = 'block';
      css.width = css.width || px(node.size[0]);
      css.height = css.height || px(node.size[1]);
      if (!icon.colored) {
        const color = descendantColor(node);
        if (color) css.color = color;
      }
      // 인라인 svg는 글자 기준선에 앉아 상자 아래로 내려가므로 block으로 둔다
      extra.push([`.${cls} > svg`, { display: 'block' }]);
      const svg = icon.svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');
      return { kind: 'icon', cls, css, layer: node, svg };
    }
    if (node.type === 'TEXT') {
      textRules(node, css);
      if (inside) typingText(inside, css);
      const ref = node.propRefs && node.propRefs.characters;
      const text = ref && ref in opts.values ? String(opts.values[ref]) : node.text!.characters;
      return { kind: 'text', cls, css, layer: node, text };
    }
    boxRules(node, css);
    if (node === layer && !css.display) css.display = 'inline-block';
    if (node === layer && css.display === 'flex') css.display = 'inline-flex';
    const t = typing(node);
    if (t) {
      inTyping.set(t.text, t).set(t.cursor, t);
      for (const k of ['flex-direction', 'justify-content', 'align-items', 'gap']) delete css[k];
      css.display = 'block';
      // 줄 상자가 글자의 글꼴을 따라야 커서 때문에 줄이 높아지지 않는다
      const font: Css = {};
      textRules(t.text, font);
      for (const k of ['font-family', 'font-size', 'line-height']) if (font[k]) css[k] = font[k];
      if (t.single) Object.assign(css, { 'white-space': 'nowrap', overflow: 'hidden', direction: 'rtl', 'text-align': 'left' });
    }
    const out: RNode = { kind: 'box', cls, css, layer: node, slot: node.type === 'SLOT' || undefined, tight: !!t || undefined };
    let kids = (node.children || []).map((c) => el(c, node)).filter((x): x is RNode => !!x);
    if (t && t.single) {
      // 프레임의 rtl은 넘칠 때 끝이 보이게 하고, 줄 자체는 왼쪽부터 읽는다
      kids = [{ kind: 'line', cls: `${cls}__line`, css: { direction: 'ltr', 'unicode-bidi': 'isolate' }, layer: node, children: kids, tight: true }];
    }
    out.children = kids;
    return out;
  }

  const root = el(layer, null);
  if (!root) throw new Error(`${comp.name}: 맨 위 레이어가 숨겨져 있어 그릴 수 없습니다`);
  return { root, extra };
}
