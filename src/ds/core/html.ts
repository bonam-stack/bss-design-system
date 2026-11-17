// 노드 트리 → 붙여 넣어 쓰는 HTML · CSS 코드 (컴포넌트 페이지의 코드 탭).

import type { Css, RNode, Tree } from './tree';

const escHtml = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function html(n: RNode, depth: number): string {
  const pad = '  '.repeat(depth);
  switch (n.kind) {
    case 'caret':
      return `${pad}<span class="${n.cls}" aria-hidden="true"></span>\n`;
    case 'icon':
      return `${pad}<span class="${n.cls}" aria-hidden="true">${n.svg}</span>\n`;
    case 'text':
      // 텍스트 속성에 넣은 줄바꿈(또는 Figma 글의 줄바꿈)은 실제 줄바꿈으로 보인다.
      return `${pad}<span class="${n.cls}">${escHtml(n.text ?? '').replace(/\n/g, '<br />')}</span>\n`;
    case 'line':
      return `<span class="${n.cls}">${(n.children || []).map((c) => html(c, 0)).join('').replace(/\n\s*</g, '<').trim()}</span>`;
    default: {
      let kids = (n.children || []).map((c) => html(c, depth + 1)).join('');
      // 글자와 커서 사이에 공백이 있으면 커서 앞이 벌어진다
      if (n.tight) return `${pad}<div class="${n.cls}">${kids.replace(/\n\s*</g, '<').trim()}</div>\n`;
      return kids ? `${pad}<div class="${n.cls}">\n${kids}${pad}</div>\n` : `${pad}<div class="${n.cls}"></div>\n`;
    }
  }
}

function rules(n: RNode, out: [string, Css | string][]) {
  out.push([`.${n.cls}`, n.css]);
  for (const c of n.children || []) rules(c, out);
}

export function toHtmlCss(tree: Tree): { html: string; css: string } {
  const list: [string, Css | string][] = [];
  rules(tree.root, list);
  list.push(...tree.extra);
  const css = list
    .filter(([, decl]) => typeof decl === 'string' || Object.keys(decl).length)
    .map(([sel, decl]) => (typeof decl === 'string' ? `${sel} { ${decl} }` : `${sel} {\n${Object.entries(decl).map(([k, val]) => `  ${k}: ${val};`).join('\n')}\n}`))
    .join('\n');
  return { html: html(tree.root, 0).trimEnd(), css };
}
