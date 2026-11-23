// Checkbox: 여러 항목 중 여럿을 고른다. 실제 <input type="checkbox">를 쓰므로 폼 · 키보드 · 보조기기가 그대로 동작한다.
// Figma: BSS DS Library v2.0 ❖ Checkbox (size 2 × selection 3 × state 4, showLabel · label · showFocus)
import { useEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FocusRing, Icon, font, tok, useInteraction, visuallyHidden } from '../shared';

export type CheckboxSelection = 'unchecked' | 'checked' | 'indeterminate';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'checked' | 'defaultChecked'> {
  /** 선택 상태. 주면 제어 컴포넌트 (onSelectionChange로 새 값을 받는다) */
  selection?: CheckboxSelection;
  defaultSelection?: CheckboxSelection;
  onSelectionChange?: (selection: CheckboxSelection) => void;
  size?: 'large' | 'medium';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 두면 포인터가 hover · pressed를 그린다 */
  state?: 'default' | 'hover' | 'pressed' | 'disabled';
  label?: string;
  showLabel?: boolean;
  /** 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
}

const SIZE = {
  large: { box: tok('checkbox-large-size', 20), icon: 16, ring: tok('checkbox-large-focus-ring-radius', 6), text: font('label', 16, 500), minH: 24 },
  medium: { box: tok('checkbox-medium-size', 16), icon: 12, ring: tok('checkbox-medium-focus-ring-radius', 6), text: font('label', 14, 400), minH: 20 },
};

export function Checkbox({ selection, defaultSelection = 'unchecked', onSelectionChange, size = 'large', state, label = 'Label', showLabel = true, showFocus = false, disabled, onChange, style, className, ...input }: CheckboxProps) {
  const [inner, setInner] = useState<CheckboxSelection>(defaultSelection);
  const value = selection ?? inner;
  const it = useInteraction();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = value === 'indeterminate';
  }, [value]);

  const off = disabled || state === 'disabled';
  const look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const on = value !== 'unchecked';
  const s = SIZE[size];

  return (
    <label
      className={className}
      {...it.pointer}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: tok('checkbox-space-gap', 6), minHeight: s.minH, cursor: off ? 'not-allowed' : 'pointer', userSelect: 'none', ...style }}
    >
      <input
        {...input}
        ref={ref}
        type="checkbox"
        checked={value === 'checked'}
        disabled={off}
        aria-label={showLabel ? undefined : label}
        onChange={(e) => {
          const next: CheckboxSelection = value === 'unchecked' ? 'checked' : 'unchecked';
          if (selection === undefined) setInner(next);
          onSelectionChange?.(next);
          onChange?.(e);
        }}
        {...it.focus}
        style={visuallyHidden}
      />
      <span
        className="ds-checkbox__checkbox"
        style={{
          width: s.box,
          height: s.box,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tok('checkbox-radius', 4),
          background: on
            ? tok(`checkbox-checked-color-bg-${look}`, { default: '#3617CE', hover: '#2F15B2', pressed: '#261091', disabled: '#B3B9C0' }[look])
            : tok(`selection-control-color-bg-${look}`, { default: '#FFFFFF', hover: '#F8F9FB', pressed: '#F1F3F5', disabled: '#E8ECEF' }[look]),
          boxShadow: `inset 0 0 0 ${tok('checkbox-border-width', 1.5)} ${
            on ? tok(`checkbox-checked-color-border-${look}`, { default: '#3617CE', hover: '#2F15B2', pressed: '#261091', disabled: '#B3B9C0' }[look]) : tok('selection-control-color-border-default', '#C4C9CF')
          }`,
        }}
      >
        {on ? <Icon name={value === 'checked' ? 'line/check-box' : 'line/indeterminate'} size={s.icon} color={tok('checkbox-checked-indicator-color-fg-default', '#FFFFFF')} /> : null}
      </span>
      {showLabel ? (
        <span className="ds-checkbox__label" style={{ ...s.text, whiteSpace: 'nowrap', color: tok(`selection-control-label-color-fg-${look}`, look === 'disabled' ? '#B3B9C0' : '#1C1F23') }}>
          {label}
        </span>
      ) : null}
      {showFocus || it.focusVisible ? <FocusRing radius={s.ring} style={{ inset: 'auto', left: -2, top: '50%', width: `calc(${s.box} + 4px)`, height: `calc(${s.box} + 4px)`, transform: 'translateY(-50%)' }} /> : null}
    </label>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Checkbox.meta = { texts: { label: 'Label' } };
