// Scrollbar: 영역을 넘치는 내용을 위아래 · 좌우로 옮겨 보는 스크롤 막대. 막대(thumb)에 hover · pressed 상태가 있다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Scrollbar › Scrollbar (5815:140) · direction 2 × size 2 × state 3
// 토큰: DS 컴포넌트 명세 scrollbar (길 두께는 막대 두께의 2배: large 12 · medium 8)
import type { HTMLAttributes } from 'react';
import { tok, tokState, useInteraction } from '../shared';

export interface ScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  size?: 'large' | 'medium';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: 'default' | 'hover' | 'pressed';
  /** 길(track) 길이. 기본: 가로 100% · 세로 274 크기 토큰 */
  length?: string;
  /** 막대 길이 (길 안쪽 대비 %, 보이는 비율) */
  thumbRatio?: number;
  /** 막대 위치 (0~100, 스크롤 위치) */
  position?: number;
}

export function Scrollbar({ direction = 'horizontal', size = 'large', state, length, thumbRatio = 40, position = 0, style, ...rest }: ScrollbarProps) {
  const it = useInteraction();
  const look = state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const h = direction === 'horizontal';
  const thick = tok(`scrollbar-${size}-size`);
  const pad = tok(h ? `scrollbar-${size}-space-padding-x` : `scrollbar-${size}-space-padding-y`);
  const ratio = Math.max(0, Math.min(100, thumbRatio));
  const offset = ((100 - ratio) * Math.max(0, Math.min(100, position))) / 100;

  return (
    <div
      aria-hidden="true"
      {...rest}
      {...it.pointer}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: h ? length ?? '100%' : `calc(${thick} * 2)`,
        height: h ? `calc(${thick} * 2)` : length ?? tok('size-274'),
        padding: h ? `0 ${pad}` : `${pad} 0`,
        background: tok('scrollbar-track-color-bg-default'),
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: h ? '100%' : thick, height: h ? thick : '100%' }}>
        <div
          style={{
            position: 'absolute',
            ...(h ? { left: `${offset}%`, top: 0, bottom: 0, width: `${ratio}%` } : { top: `${offset}%`, left: 0, right: 0, height: `${ratio}%` }),
            borderRadius: tok('scrollbar-thumb-radius'),
            background: tokState('scrollbar-thumb-color-bg', look),
          }}
        />
      </div>
    </div>
  );
}

Scrollbar.meta = { texts: {} };
