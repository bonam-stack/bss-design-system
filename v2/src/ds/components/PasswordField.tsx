// PasswordField: 비밀번호 입력. 눈 버튼으로 가리기 · 보이기를 바꾼다. 실제 <input type="password">.
// Figma: BSS DS Library v2.0 ❖ PasswordField (importance 3 × state 6 × invalid 2 × size 3, showLabel · showHelperText · showFocus)
import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Icon, bool, font, tok, useInteraction } from '../shared';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'large' | 'medium' | 'small';
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: FieldState;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  showFocus?: boolean;
  width?: number | string;
}

const SIZE = {
  large: { text: font('label', 16, 400) },
  medium: { text: font('label', 15, 400) },
  small: { text: font('label', 14, 400) },
};

export function PasswordField({ value, defaultValue = '', onChange, size = 'large', importance = 'none', invalid, state, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = false, showFocus = false, width = 200, placeholder = 'Placeholder', disabled, readOnly, id, className, style, ...input }: PasswordFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const [shown, setShown] = useState(false);
  const v = value ?? inner;
  const it = useInteraction();
  const look = fieldLook({ state, disabled: disabled || state === 'disabled', readOnly: readOnly || state === 'readOnly', focused: it.focused, hover: it.hover, hasValue: !!v });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const s = SIZE[size];
  const locked = look === 'readOnly' || look === 'disabled';

  return (
    <FieldFrame
      name="password-field"
      id={fid}
      width={width}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      ringRadius={tok(`password-field-${size}-focus-ring-radius`)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={style}
      pointer={it.pointer}
    >
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          height: tok(`password-field-${size}-size-height`),
          display: 'flex',
          alignItems: 'center',
          gap: tok('password-field-space-gap'),
          padding: `0 ${tok(`password-field-${size}-space-padding-end`)} 0 ${tok(`password-field-${size}-space-padding-start`)}`,
          borderRadius: tok('password-field-radius'),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('password-field-border-width')} ${c.border}`,
          outline: c.ring,
          ...s.text,
          color: c.text,
        }}
      >
        <span style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center' }}>
          <input
            {...input}
            id={fid}
            type={shown ? 'text' : 'password'}
            value={v}
            disabled={disabled || state === 'disabled'}
            readOnly={readOnly || state === 'readOnly'}
            aria-invalid={bad || undefined}
            aria-describedby={showHelperText ? `${fid}-help` : undefined}
            onChange={(e) => {
              if (value === undefined) setInner(e.target.value);
              onChange?.(e.target.value);
            }}
            {...it.focus}
            style={{ ...bareInput, cursor: look === 'disabled' ? 'not-allowed' : undefined }}
          />
          {!v ? (
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', color: c.placeholder, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {placeholder}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          aria-label={shown ? '비밀번호 가리기' : '비밀번호 보기'}
          aria-pressed={shown}
          disabled={locked}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShown((x) => !x)}
          style={{ display: 'flex', flexShrink: 0, margin: 0, padding: 0, border: 0, background: tok('visibility-toggle-color-bg-default'), cursor: locked ? 'not-allowed' : 'pointer', color: tok(`visibility-toggle-color-fg-${locked ? 'disabled' : 'default'}`) }}
        >
          <Icon name={shown ? 'line/visibility-off' : 'line/visibility'} size={tok(size === 'small' ? 'size-icon-small' : 'size-icon-medium')} />
        </button>
      </div>
    </FieldFrame>
  );
}

PasswordField.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { focus: { defaultValue: 'password' }, entered: { defaultValue: 'password' }, readOnly: { defaultValue: 'password' }, disabled: { defaultValue: 'password' } } };
