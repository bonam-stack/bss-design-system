// FilterChip: 목록을 걸러 보는 조건을 눌러서 선택 · 해제한다. 실제 <button aria-pressed>.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Chip › FilterChip (5768:1424) · size 3 × selection 2 × state 4, label · showFocus
// 토큰: DS 컴포넌트 명세 chip (chip-filter-*). large 선택은 채움형(chip-filter-filled-selected-*), medium · small 선택은 기본형(chip-filter-selected-*)
import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { FocusRing, textStyle, tok, tokState, useInteraction } from '../shared';

export type FilterChipSelection = 'unselected' | 'selected';

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** 선택 상태. 주면 제어 컴포넌트 (onSelectionChange로 새 값을 받는다) */
  selection?: FilterChipSelection;
  defaultSelection?: FilterChipSelection;
  onSelectionChange?: (selection: FilterChipSelection) => void;
  size?: 'large' | 'medium' | 'small';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: 'default' | 'hover' | 'pressed' | 'disabled';
  label?: string;
  /** 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
}

const TEXT = { large: textStyle('font-label-14-500'), medium: textStyle('font-label-14-500'), small: textStyle('font-label-12-500') };

export function FilterChip({ selection, defaultSelection = 'unselected', onSelectionChange, size = 'large', state, label = 'Label', showFocus = false, disabled, onClick, style, className, ...rest }: FilterChipProps) {
  const [inner, setInner] = useState<FilterChipSelection>(defaultSelection);
  const value = selection ?? inner;
  const on = value === 'selected';
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const filled = on && size === 'large';
  const pre = filled ? 'chip-filter-filled-selected' : on ? 'chip-filter-selected' : 'chip-filter';
  const bg = tokState(`${pre}-color-bg`, look);
  // 채움형은 테두리를 그리지 않는다 (높이 유지를 위해 테두리 색 = 채움색)
  const border = filled ? bg : tokState(`${pre}-color-border`, look);

  return (
    <button
      {...rest}
      type="button"
      aria-pressed={on}
      disabled={off}
      className={className}
      {...it.pointer}
      {...it.focus}
      onClick={(e) => {
        const next: FilterChipSelection = on ? 'unselected' : 'selected';
        if (selection === undefined) setInner(next);
        onSelectionChange?.(next);
        onClick?.(e);
      }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        margin: 0,
        border: 0,
        outline: 'none',
        height: tok(`chip-filter-${size}-size-height`),
        padding: `0 ${tok(`chip-filter-${size}-space-padding-x`)}`,
        borderRadius: tok('chip-filter-radius'),
        background: bg,
        boxShadow: `inset 0 0 0 ${tok('chip-filter-border-width')} ${border}`,
        color: tokState(`${pre}-color-fg`, look),
        ...TEXT[size],
        whiteSpace: 'nowrap',
        cursor: off ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {label}
      {showFocus || it.focusVisible ? <FocusRing radius={tok('chip-filter-focus-ring-radius')} /> : null}
    </button>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
FilterChip.meta = { texts: { label: 'Label' } };
