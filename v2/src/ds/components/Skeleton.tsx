// Skeleton: 콘텐츠를 불러오는 동안 같은 구조의 자리를 먼저 보여 주는 자리 표시.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Skeleton › Skeleton (9037:18) · shape 3 (rectangle · circle · capsule)
// 토큰: DS 컴포넌트 명세 skeleton. 크기는 놓이는 자리에서 정한다 (width · height)
import type { HTMLAttributes } from 'react';
import { tok } from '../shared';

export type SkeletonShape = 'rectangle' | 'circle' | 'capsule';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  shape?: SkeletonShape;
  /** CSS 너비 (기본: 사각 100% · 원 40 · 알약 72 크기 토큰) */
  width?: string;
  /** CSS 높이 (기본: 사각 · 알약 24 · 원은 너비와 같다) */
  height?: string;
  /** 사각 모양의 모서리를 실제 콘텐츠 반경 토큰으로 바꿀 때 (토큰 이름) */
  radiusToken?: string;
}

const SIZE: Record<SkeletonShape, { w: string; h: string }> = {
  rectangle: { w: '100%', h: tok('size-24') },
  circle: { w: tok('size-40'), h: tok('size-40') },
  capsule: { w: tok('size-72'), h: tok('size-24') },
};

export function Skeleton({ shape = 'rectangle', width, height, radiusToken, style, ...rest }: SkeletonProps) {
  const w = width ?? SIZE[shape].w;
  const h = height ?? (shape === 'circle' ? w : SIZE[shape].h);
  return (
    <span
      aria-hidden="true"
      {...rest}
      style={{
        display: 'block',
        flexShrink: 0,
        width: w,
        height: h,
        borderRadius: shape === 'rectangle' ? tok(radiusToken ?? 'skeleton-radius') : tok('skeleton-full-radius'),
        background: tok('skeleton-color-bg-default'),
        ...style,
      }}
    />
  );
}

Skeleton.meta = { texts: {} };
