// Radio: 여러 항목 중 하나를 고른다. 실제 <input type="radio">. RadioGroup 안에 두면 같은 name · 선택 값을 나눠 쓴다.
// Figma: BSS DS Library v2.0 ❖ Radio (size 2 × selection 2 × state 4, label · showLabel · showFocus)
import { createContext, useContext, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FocusRing, font, tok, useInteraction, visuallyHidden } from '../shared';

export type RadioSelection = 'unchecked' | 'checked';

/** RadioGroup이 내려 주는 것 */
export const RadioGroupContext = createContext<{ name?: string; value?: string; size?: 'large' | 'medium'; disabled?: boolean; select?: (value: string) => void } | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'checked' | 'defaultChecked'> {
  /** 선택 상태. RadioGroup 안에서는 그룹 값이 정한다 */
  selection?: RadioSelection;
  defaultSelection?: RadioSelection;
  onSelectionChange?: (selection: RadioSelection) => void;
  size?: 'large' | 'medium';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: 'default' | 'hover' | 'pressed' | 'disabled';
  label?: string;
  showLabel?: boolean;
  showFocus?: boolean;
}

const SIZE = {
  large: { box: tok('radio-large-size', 20), dot: tok('radio-large-dot-size', 12), ring: tok('radio-large-focus-ring-radius', 9999), text: font('label', 16, 500), minH: 24 },
  medium: { box: tok('radio-medium-size', 16), dot: tok('radio-medium-dot-size', 8), ring: tok('radio-medium-focus-ring-radius', 9999), text: font('label', 14, 400), minH: 20 },
};
const DOT = { default: '#3617CE', hover: '#2F15B2', pressed: '#261091', disabled: '#B3B9C0' };

export function Radio({ selection, defaultSelection = 'unchecked', onSelectionChange, size, state, label = 'Label', showLabel = true, showFocus = false, disabled, value, name, onChange, style, className, ...input }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const [inner, setInner] = useState<RadioSelection>(defaultSelection);
  const it = useInteraction();
  const inGroup = !!group && value !== undefined && group.value !== undefined;
  const checked = inGroup ? group!.value === String(value) : (selection ?? inner) === 'checked';
  const sz = size ?? group?.size ?? 'large';
  const off = disabled || group?.disabled || state === 'disabled';
  const look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const s = SIZE[sz];

  return (
    <label className={className} {...it.pointer} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: tok('radio-space-gap', 6), minHeight: s.minH, cursor: off ? 'not-allowed' : 'pointer', userSelect: 'none', ...style }}>
      <input
        {...input}
        type="radio"
        name={name ?? group?.name}
        value={value}
        checked={checked}
        disabled={off}
        aria-label={showLabel ? undefined : label}
        onChange={(e) => {
          if (group?.select && value !== undefined) group.select(String(value));
          if (selection === undefined) setInner('checked');
          onSelectionChange?.('checked');
          onChange?.(e);
        }}
        {...it.focus}
        style={visuallyHidden}
      />
      <span
        className="ds-radio__radio"
        style={{
          width: s.box,
          height: s.box,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tok('radio-radius', 9999),
          background: checked ? tok('radio-checked-color-bg-default', '#FFFFFF') : tok(`selection-control-color-bg-${look}`, { default: '#FFFFFF', hover: '#F8F9FB', pressed: '#F1F3F5', disabled: '#E8ECEF' }[look]),
          boxShadow: `inset 0 0 0 ${tok('radio-border-width', 1.5)} ${checked ? tok(`radio-checked-color-border-${look}`, DOT[look]) : tok('selection-control-color-border-default', '#C4C9CF')}`,
        }}
      >
        {checked ? <span style={{ width: s.dot, height: s.dot, borderRadius: tok('radio-radius', 9999), background: tok(`radio-checked-dot-color-bg-${look}`, DOT[look]) }} /> : null}
      </span>
      {showLabel ? (
        <span className="ds-radio__label" style={{ ...s.text, whiteSpace: 'nowrap', color: tok(`selection-control-label-color-fg-${look}`, look === 'disabled' ? '#B3B9C0' : '#1C1F23') }}>
          {label}
        </span>
      ) : null}
      {showFocus || it.focusVisible ? <FocusRing radius={s.ring} style={{ inset: 'auto', left: -2, top: '50%', width: `calc(${s.box} + 4px)`, height: `calc(${s.box} + 4px)`, transform: 'translateY(-50%)' }} /> : null}
    </label>
  );
}

Radio.meta = { texts: { label: 'Label' } };
