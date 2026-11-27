// RemoveChip: 선택한 값을 표시하고 × 버튼으로 지운다. 칩 본체는 <button aria-pressed>(선택 · 해제), 지우기는 별도 <button>.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Chip › RemoveChip (5768:1693) · appearance 2 × selection 2 × state 4, showLeadingIcon · showCount · showFocus · label
//        부품 _Item/RemoveChip/Count (5768:1642) · _Item/RemoveChip/Remove (5768:1655)
// 토큰: DS 컴포넌트 명세 chip (chip-remove-*). 선택 안 된 칩의 ×는 Button type=iconPlain medium(Figma Button 인스턴스), 선택된 칩의 ×는 _Item/RemoveChip/Remove(chip-remove-*-selected-clear-button-*, 포커스 링 focus-ring-radius)
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { FocusRing, Icon, textStyle, tok, tokState, useInteraction } from '../shared';
import { Button } from './Button';

export type RemoveChipSelection = 'unselected' | 'selected';
type Look = 'default' | 'hover' | 'pressed' | 'disabled';

export interface RemoveChipProps {
  /** filled 흰 바탕 · outlined 투명 바탕 + 테두리 */
  appearance?: 'filled' | 'outlined';
  /** 선택 상태. 주면 제어 컴포넌트 (onSelectionChange로 새 값을 받는다) */
  selection?: RemoveChipSelection;
  defaultSelection?: RemoveChipSelection;
  onSelectionChange?: (selection: RemoveChipSelection) => void;
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: Look;
  disabled?: boolean;
  label?: string;
  /** 라벨 뒤 개수 (Figma _Item/RemoveChip/Count의 count) */
  count?: string;
  showLeadingIcon?: boolean;
  showCount?: boolean;
  /** 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  /** 앞 아이콘 (icons/svg 아래 이름) */
  leadingIcon?: string;
  /** × 버튼을 눌렀을 때 */
  onRemove?: () => void;
  /** × 버튼의 보조기기용 이름 */
  removeLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const bare: CSSProperties = { display: 'inline-flex', alignItems: 'center', margin: 0, padding: 0, border: 0, outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit', letterSpacing: 'inherit', WebkitTapHighlightColor: 'transparent' };

export function RemoveChip({ appearance = 'filled', selection, defaultSelection = 'unselected', onSelectionChange, state, disabled, label = 'Text', count = '00', showLeadingIcon = true, showCount = true, showFocus = false, leadingIcon = 'filled/won', onRemove, removeLabel, className, style }: RemoveChipProps) {
  const [inner, setInner] = useState<RemoveChipSelection>(defaultSelection);
  const value = selection ?? inner;
  const on = value === 'selected';
  const it = useInteraction();
  const rm = useInteraction();
  const off = disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';

  let bg: string;
  let border: string | undefined;
  let fg: string;
  let countFg: string;
  // 선택 안 된 칩의 ×는 Button(iconPlain)이 그린다. 선택된 칩의 ×는 _Item/RemoveChip/Remove 부품 색
  let clearFg = '';
  if (!on) {
    bg = tokState(`chip-remove-${appearance}-color-bg`, look);
    border = appearance === 'outlined' ? tok('chip-remove-outlined-color-border-default') : undefined;
    fg = tokState('chip-remove-color-fg', look);
    // 개수 부품은 default · disabled뿐이라 칩 hover · pressed에서도 default
    countFg = tokState('chip-remove-count-color-fg', off ? 'disabled' : 'default');
  } else if (appearance === 'filled') {
    bg = tokState('chip-remove-filled-selected-color-bg', look);
    fg = tok('chip-remove-filled-selected-color-fg-default');
    countFg = tokState('chip-remove-filled-selected-count-color-fg', off ? 'disabled' : 'default');
    clearFg = tok('chip-remove-filled-selected-clear-button-color-fg-default');
  } else {
    bg = tokState('chip-remove-outlined-selected-color-bg', look);
    border = tokState('chip-remove-outlined-selected-color-border', look);
    fg = tokState('chip-remove-outlined-selected-color-fg', look);
    countFg = tokState('chip-remove-outlined-selected-count-color-fg', off ? 'disabled' : 'default');
    clearFg = tokState('chip-remove-outlined-selected-clear-button-color-fg', look);
  }

  return (
    <span
      className={className}
      {...it.pointer}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        gap: tok('chip-remove-space-gap'),
        height: tok('chip-remove-size-height'),
        padding: `0 ${tok('chip-remove-space-padding-x')}`,
        borderRadius: tok('chip-remove-radius'),
        background: bg,
        boxShadow: border ? `inset 0 0 0 ${tok('chip-remove-border-width')} ${border}` : undefined,
        color: fg,
        ...textStyle('font-label-14-500'),
        whiteSpace: 'nowrap',
        cursor: off ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <button
        type="button"
        aria-pressed={on}
        disabled={off}
        {...it.focus}
        onClick={() => {
          const next: RemoveChipSelection = on ? 'unselected' : 'selected';
          if (selection === undefined) setInner(next);
          onSelectionChange?.(next);
        }}
        style={{ ...bare, gap: tok('chip-remove-space-gap'), alignSelf: 'stretch', cursor: 'inherit' }}
      >
        {showLeadingIcon ? <Icon name={leadingIcon} size={tok('chip-remove-icon-size')} /> : null}
        <span>{label}</span>
        {showCount ? <span style={{ ...textStyle('font-label-14-600'), fontVariantNumeric: 'tabular-nums', color: countFg }}>{count}</span> : null}
      </button>
      {!on ? (
        <Button type="iconPlain" size="medium" icon="line/close" label={removeLabel ?? `${label} 지우기`} disabled={off} onClick={onRemove} />
      ) : (
        <button
          type="button"
          aria-label={removeLabel ?? `${label} 지우기`}
          disabled={off}
          {...rm.pointer}
          {...rm.focus}
          onClick={onRemove}
          style={{ ...bare, position: 'relative', color: clearFg, background: tok('chip-remove-clear-button-color-bg-default'), cursor: 'inherit' }}
        >
          <Icon name="line/close" size={tok('chip-remove-icon-size')} />
          {rm.focusVisible ? <FocusRing radius={tok('focus-ring-radius')} /> : null}
        </button>
      )}
      {showFocus || it.focusVisible ? <FocusRing radius={tok('chip-remove-focus-ring-radius')} /> : null}
    </span>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
RemoveChip.meta = { texts: { label: 'Text', count: '00' }, icons: { leadingIcon: 'filled/won' } };
