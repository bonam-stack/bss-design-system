// Divider: 영역을 나누는 선. 가로는 부모 폭을, 세로는 부모 높이를 채운다.
// Figma: BSS DS Library v2.0 ❖ Divider (type solid · dashed × direction horizontal · vertical)
import type { CSSProperties } from 'react';
import { tok } from '../shared';

export interface DividerProps {
  type?: 'solid' | 'dashed';
  direction?: 'horizontal' | 'vertical';
  /** 가로선 길이 · 세로선 높이 (기본: Figma 280 · 300, 부모 안에서는 100%로 줘도 된다) */
  length?: number | string;
  className?: string;
  style?: CSSProperties;
}

export function Divider({ type = 'solid', direction = 'horizontal', length, className, style }: DividerProps) {
  const h = direction === 'horizontal';
  const line = `${tok('border-width-thin')} ${type} ${tok('color-border-neutral-muted')}`;
  return (
    <span
      role="separator"
      aria-orientation={direction}
      className={className}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: h ? length ?? 280 : 0,
        height: h ? 0 : length ?? 300,
        borderTop: h ? line : undefined,
        borderLeft: h ? undefined : line,
        ...style,
      }}
    />
  );
}

Divider.meta = { texts: {} };
