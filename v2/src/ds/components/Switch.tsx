// Switch: 서로 반대되는 두 상태(On/Off)를 누르는 즉시 전환한다. 실제 <input type="checkbox" role="switch">를 쓴다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Switch / Toggle › Switch (7324:1141) · selection 2 × size 3 × state 4, showFocus
// 토큰: DS 컴포넌트 명세 switch (트랙 switch-*-size-*, 동그라미 switch-*-thumb-size, 색 switch[-checked]-color-bg-<상태>)
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FocusRing, tok, tokState, useInteraction, visuallyHidden } from '../shared';

export type SwitchSelection = 'unchecked' | 'checked';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'checked' | 'defaultChecked'> {
  /** 켜짐 상태. 주면 제어 컴포넌트 (onSelectionChange로 새 값을 받는다) */
  selection?: SwitchSelection;
  defaultSelection?: SwitchSelection;
  onSelectionChange?: (selection: SwitchSelection) => void;
  size?: 'large' | 'medium' | 'small';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: 'default' | 'hover' | 'pressed' | 'disabled';
  /** 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  /** 라벨 없이 쓰므로 보조기기에 읽어 줄 이름 */
  label?: string;
}

export function Switch({ selection, defaultSelection = 'unchecked', onSelectionChange, size = 'large', state, showFocus = false, label = 'Switch', disabled, onChange, style, className, ...input }: SwitchProps) {
  const [inner, setInner] = useState<SwitchSelection>(defaultSelection);
  const value = selection ?? inner;
  const on = value === 'checked';
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';

  return (
    <label
      className={className}
      {...it.pointer}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        flexShrink: 0,
        boxSizing: 'border-box',
        width: tok(`switch-${size}-size-width`),
        height: tok(`switch-${size}-size-height`),
        padding: `${tok('switch-space-padding-y')} ${tok('switch-space-padding-x')}`,
        borderRadius: tok('switch-radius'),
        background: on ? tokState('switch-checked-color-bg', look) : tokState('switch-color-bg', look),
        cursor: off ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <input
        {...input}
        type="checkbox"
        role="switch"
        checked={on}
        aria-checked={on}
        aria-label={label}
        disabled={off}
        onChange={(e) => {
          const next: SwitchSelection = on ? 'unchecked' : 'checked';
          if (selection === undefined) setInner(next);
          onSelectionChange?.(next);
          onChange?.(e);
        }}
        {...it.focus}
        style={visuallyHidden}
      />
      <span
        className="ds-switch__thumb"
        style={{ width: tok(`switch-${size}-thumb-size`), height: tok(`switch-${size}-thumb-size`), borderRadius: tok('switch-thumb-radius'), background: tok('switch-thumb-color-bg-default'), flexShrink: 0 }}
      />
      {showFocus || it.focusVisible ? <FocusRing radius={tok(`switch-${size}-focus-ring-radius`)} /> : null}
    </label>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Switch.meta = { texts: {} };
