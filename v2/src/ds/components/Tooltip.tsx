// Tooltip: 트리거(아이콘 · 버튼 등) 주변에 짧은 보조 문구를 띄우는 말풍선. 본문 + 화살표(선택).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Tooltip / Popover › Tooltip (7324:3417) · state 2 (default · error) × placement 4 × align 3 (left · right는 center만, 변형 16개), showArrow, text
// 토큰: DS 컴포넌트 명세 tooltip (tooltip-color-bg/fg-<state>, tooltip-radius, tooltip-space-padding-x/y, tooltip-arrow-size-width/height, 글자 label/12/500)
// 말풍선만 제자리에 그린다(portal · fixed 없음). 트리거 옆에 놓는 위치는 쓰는 쪽이 정한다. placement는 트리거 기준 말풍선 위치, 화살표는 트리거를 가리킨다.
import type { CSSProperties, HTMLAttributes } from 'react';
import { textStyle, tok } from '../shared';

export type OverlayPlacement = 'top' | 'right' | 'bottom' | 'left';
export type OverlayAlign = 'start' | 'center' | 'end';

/** 말풍선 화살표: placement 쪽 반대편 가장자리에 붙어 트리거를 가리킨다. 부모는 position: relative */
export function OverlayArrow({ placement, align = 'center', color, width, height, className }: { placement: OverlayPlacement; align?: OverlayAlign; color: string; width: string; height: string; className?: string }) {
  const vertical = placement === 'top' || placement === 'bottom';
  const s: CSSProperties = { position: 'absolute', display: 'block', background: color, width: vertical ? width : height, height: vertical ? height : width, pointerEvents: 'none' };
  if (placement === 'top') Object.assign(s, { top: '100%', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' });
  if (placement === 'bottom') Object.assign(s, { bottom: '100%', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' });
  if (placement === 'right') Object.assign(s, { right: '100%', top: '50%', transform: 'translateY(-50%)', clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' });
  if (placement === 'left') Object.assign(s, { left: '100%', top: '50%', transform: 'translateY(-50%)', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' });
  if (vertical) {
    if (align === 'start') s.left = tok('space-16');
    else if (align === 'end') s.right = tok('space-16');
    else Object.assign(s, { left: '50%', transform: 'translateX(-50%)' });
  }
  return <span aria-hidden="true" className={className} style={s} />;
}

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  /** 유형 (사용 중에 바뀌지 않고 표시할 때 고른다): default 보조 정보 · error 입력 오류 등 문제 상황 */
  state?: 'default' | 'error';
  /** 트리거 기준 말풍선 위치 */
  placement?: OverlayPlacement;
  /** 화살표 위치 (top · bottom에서만, left · right는 center 고정) */
  align?: OverlayAlign;
  showArrow?: boolean;
  text?: string;
}

export function Tooltip({ state = 'default', placement = 'top', align = 'start', showArrow = true, text = 'Tooltip text', className, style, ...rest }: TooltipProps) {
  const al: OverlayAlign = placement === 'left' || placement === 'right' ? 'center' : align;
  const bg = tok(`tooltip-color-bg-${state}`);
  return (
    <div role="tooltip" {...rest} className={`ds-tooltip__root${className ? ` ${className}` : ''}`} style={{ position: 'relative', display: 'inline-flex', maxWidth: '100%', ...style }}>
      <span
        className="ds-tooltip__body"
        style={{
          display: 'block',
          boxSizing: 'border-box',
          padding: `${tok('tooltip-space-padding-y')} ${tok('tooltip-space-padding-x')}`,
          borderRadius: tok('tooltip-radius'),
          background: bg,
          color: tok(`tooltip-color-fg-${state}`),
          ...textStyle('label-12-500'),
        }}
      >
        {text}
      </span>
      {showArrow ? <OverlayArrow className="ds-tooltip__arrow" placement={placement} align={al} color={bg} width={tok('tooltip-arrow-size-width')} height={tok('tooltip-arrow-size-height')} /> : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Tooltip.meta = { texts: { text: 'Tooltip text' } };
