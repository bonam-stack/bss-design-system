// Figma 원본 그리기: component.json의 변형 레이어를 그대로 그린다 (React 컴포넌트와 견주는 기준 그림).
// 포털에서 디자인 시스템 담당이 코드를 고칠 때 옆에 놓고 Figma와 같은지 본다.

import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ComponentData, IconMap, PropValues } from './types';
import { buildTree } from './tree';
import type { Css, RNode } from './tree';
import { findVariant } from './variants';
import './figma.css';

const camel = (k: string) => (k.startsWith('-webkit-') ? `Webkit${k.slice(8).replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}` : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
export const toStyle = (css: Css): CSSProperties => Object.fromEntries(Object.entries(css).map(([k, v]) => [camel(k), v])) as CSSProperties;

function textLines(s: string): ReactNode {
  const parts = s.split('\n');
  return parts.map((p, i) => (i ? [<br key={i} />, p] : p));
}

function node(n: RNode, slot: ReactNode | undefined, key?: number): ReactNode {
  const style = toStyle(n.css);
  switch (n.kind) {
    case 'caret':
      return <span key={key} className={n.cls} style={style} aria-hidden="true" />;
    case 'icon':
      return <span key={key} className={n.cls} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: n.svg!.replace('<svg', '<svg style="display:block"') }} />;
    case 'text':
      return (
        <span key={key} className={n.cls} style={style}>
          {textLines(n.text ?? '')}
        </span>
      );
    case 'line':
      return (
        <span key={key} className={n.cls} style={style}>
          {(n.children || []).map((c, i) => node(c, slot, i))}
        </span>
      );
    default:
      return (
        <div key={key} className={n.cls} style={style}>
          {n.slot && slot !== undefined ? slot : (n.children || []).map((c, i) => node(c, slot, i))}
        </div>
      );
  }
}

export interface FigmaViewProps {
  data: ComponentData;
  icons: IconMap;
  /** 변형 속성 (size · state …) */
  selection: Record<string, string>;
  /** 불리언 · 텍스트 속성 (Figma 속성 이름 → 값) */
  values: PropValues;
  /** Figma SLOT 자리에 넣을 내용 */
  slot?: ReactNode;
  prefix?: string;
}

/** 고른 변형 하나를 그대로 그린다 (상호작용 없음) */
export function FigmaView({ data, icons, selection, values, slot, prefix }: FigmaViewProps) {
  const variant = findVariant(data, selection);
  const tree = useMemo(() => (variant.layer ? buildTree(data, variant.layer, { values, icons, prefix: prefix || `ds-${data.key}` }) : null), [data, variant, values, icons, prefix]);
  if (!tree) return null;
  return <>{node(tree.root, slot)}</>;
}
