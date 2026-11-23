// TextField: 한 줄 입력. 실제 <input>이라 값 입력 · 폼 · 키보드가 그대로 동작한다.
// Figma: BSS DS Library v2.0 ❖ TextField (importance 3 × state 6 × invalid 2 × size 3, showLabel · showHelperText · showClear · showFocus)
import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Icon, bool, font, tok, useInteraction } from '../shared';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'large' | 'medium' | 'small';
  /** none 기본 · attention 주의 · required 필수 (칸 배경색으로 표시) */
  importance?: Importance;
  /** 오류: 테두리 · 도움말이 빨갛게 */
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 둔다 */
  state?: FieldState;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  /** 값이 있을 때 지우기 버튼 */
  showClear?: boolean;
  showFocus?: boolean;
  /** 칸 폭 (기본 Figma 200) */
  width?: number | string;
}

const SIZE = {
  large: { h: 40, ps: 14, pe: 12, icon: 16, text: font('label', 16, 400) },
  medium: { h: 36, ps: 14, pe: 12, icon: 16, text: font('label', 15, 400) },
  small: { h: 28, ps: 12, pe: 10, icon: 14, text: font('label', 14, 400) },
};

export function TextField({ value, defaultValue = '', onChange, size = 'large', importance = 'none', invalid, state, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = true, showClear = true, showFocus = false, width = 200, placeholder = 'Placeholder', disabled, readOnly, id, className, style, ...input }: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const v = value ?? inner;
  const set = (x: string) => {
    if (value === undefined) setInner(x);
    onChange?.(x);
  };
  const it = useInteraction();
  const look = fieldLook({ state, disabled: disabled || state === 'disabled', readOnly: readOnly || state === 'readOnly', focused: it.focused, hover: it.hover, hasValue: !!v });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const s = SIZE[size];
  const clear = showClear && !!v && (look === 'focus' || look === 'entered' || look === 'hover');

  return (
    <FieldFrame
      name="text-field"
      id={fid}
      width={width}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      ringRadius={tok(`text-field-${size}-focus-ring-radius`, 8)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={style}
      pointer={it.pointer}
    >
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          height: tok(`text-field-${size}-size-height`, s.h),
          display: 'flex',
          alignItems: 'center',
          gap: tok('text-field-space-gap', 8),
          padding: `0 ${tok(`text-field-${size}-space-padding-end`, s.pe)} 0 ${tok(`text-field-${size}-space-padding-start`, s.ps)}`,
          borderRadius: tok('text-field-radius', 6),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('text-field-border-width', 1)} ${c.border}`,
          outline: c.ring,
          ...s.text,
          color: c.text,
        }}
      >
        <span style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center' }}>
          <input
            {...input}
            id={fid}
            value={v}
            disabled={disabled || state === 'disabled'}
            readOnly={readOnly || state === 'readOnly'}
            aria-invalid={bad || undefined}
            aria-describedby={showHelperText ? `${fid}-help` : undefined}
            onChange={(e) => set(e.target.value)}
            {...it.focus}
            style={{ ...bareInput, cursor: look === 'disabled' ? 'not-allowed' : undefined }}
          />
          {!v ? (
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', color: c.placeholder, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {placeholder}
            </span>
          ) : null}
        </span>
        {clear ? (
          <button
            type="button"
            aria-label="지우기"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => set('')}
            style={{ display: 'flex', flexShrink: 0, margin: 0, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', color: tok('button-icon-only-plain-color-fg-default', '#454F59') }}
          >
            <Icon name="filled/close" size={tok(size === 'small' ? 'button-icon-only-small-icon-size' : 'button-icon-only-medium-icon-size', s.icon)} />
          </button>
        ) : null}
      </div>
    </FieldFrame>
  );
}

TextField.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { focus: { defaultValue: 'Text' }, entered: { defaultValue: 'Text' }, readOnly: { defaultValue: 'Text' }, disabled: { defaultValue: 'Text' } } };
