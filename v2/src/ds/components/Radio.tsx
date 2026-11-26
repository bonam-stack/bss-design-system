// Radio: 여러 항목 중 하나를 고른다. 실제 <input type="radio">. RadioGroup 안에 두면 같은 name · 선택 값을 나눠 쓴다.
// Figma: BSS DS Library v2.0 ❖ Radio (size 2 × selection 2 × state 4, label · showLabel · showFocus)
import { createContext, useContext, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FocusRing, font, tok, tokState, useInteraction, visuallyHidden } from '../shared';

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
  large: { box: tok('radio-large-size'), dot: tok('radio-large-dot-size'), ring: tok('radio-large-focus-ring-radius'), text: font('label', 16, 500), minH: tok('font-label-16-500-line-height') },
  medium: { box: tok('radio-medium-size'), dot: tok('radio-medium-dot-size'), ring: tok('radio-medium-focus-ring-radius'), text: font('label', 14, 400), minH: tok('font-label-14-400-line-height') },
};

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
    <label className={className} {...it.pointer} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: tok('radio-space-gap'), minHeight: s.minH, cursor: off ? 'not-allowed' : 'pointer', userSelect: 'none', ...style }}>
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
          borderRadius: tok('radio-radius'),
          background: checked ? tok('radio-checked-color-bg-default') : tokState(`selection-control-color-bg`, look),
          boxShadow: `inset 0 0 0 ${tok('radio-border-width')} ${checked ? tokState(`radio-checked-color-border`, look) : tok('selection-control-color-border-default')}`,
        }}
      >
        {checked ? <span style={{ width: s.dot, height: s.dot, borderRadius: tok('radio-radius'), background: tokState(`radio-checked-dot-color-bg`, look) }} /> : null}
      </span>
      {showLabel ? (
        <span className="ds-radio__label" style={{ ...s.text, whiteSpace: 'nowrap', color: tokState(`selection-control-label-color-fg`, look) }}>
          {label}
        </span>
      ) : null}
      {showFocus || it.focusVisible ? <FocusRing radius={s.ring} style={{ inset: 'auto', left: `calc(-1 * ${tok('focus-ring-space-offset')})`, top: '50%', width: `calc(${s.box} + 2 * ${tok('focus-ring-space-offset')})`, height: `calc(${s.box} + 2 * ${tok('focus-ring-space-offset')})`, transform: 'translateY(-50%)' }} /> : null}
    </label>
  );
}

Radio.meta = { texts: { label: 'Label' } };
