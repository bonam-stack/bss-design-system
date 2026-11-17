// TextArea: 여러 줄 입력. 실제 <textarea>. maxLength를 주면 도움말 오른쪽에 글자 수가 나온다.
// Figma: BSS DS Library v2.0 ❖ TextArea (importance 3 × state 6 × invalid 2, showLabel · showHelperText · showResizeHandle · showFocus)
import { useId, useState } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { Icon, bool, font, tok, useInteraction } from '../shared';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: FieldState;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  /** 오른쪽 아래 크기 조절 손잡이 표시 (Figma 모양) */
  showResizeHandle?: boolean;
  showFocus?: boolean;
  /** 칸 폭 · 입력 영역 높이 (기본 Figma 240 · 74) */
  width?: number | string;
  height?: number;
}

export function TextArea({ value, defaultValue = '', onChange, importance = 'none', invalid, state, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = true, showResizeHandle = true, showFocus = false, width = 240, height = 74, placeholder = 'Placeholder', maxLength, disabled, readOnly, id, className, style, ...input }: TextAreaProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const v = value ?? inner;
  const it = useInteraction();
  const look = fieldLook({ state, disabled: disabled || state === 'disabled', readOnly: readOnly || state === 'readOnly', focused: it.focused, hover: it.hover, hasValue: !!v });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);

  return (
    <FieldFrame
      name="text-area"
      id={fid}
      width={width}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      count={maxLength ? { count: v.length, max: maxLength } : undefined}
      ringRadius={tok('text-area-focus-ring-radius', 8)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={style}
      pointer={it.pointer}
    >
      <div
        style={{
          position: 'relative',
          flex: '1 1 0',
          minWidth: 0,
          display: 'flex',
          padding: `${tok('text-area-space-padding-y', 8)} ${tok('text-area-space-padding-x', 14)}`,
          borderRadius: tok('text-area-radius', 6),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('text-area-border-width', 1)} ${c.border}`,
          outline: c.ring,
          ...font('body', 14, 400),
          color: c.text,
        }}
      >
        <span style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex' }}>
          <textarea
            {...input}
            id={fid}
            value={v}
            maxLength={maxLength}
            disabled={disabled || state === 'disabled'}
            readOnly={readOnly || state === 'readOnly'}
            aria-invalid={bad || undefined}
            aria-describedby={showHelperText ? `${fid}-help` : undefined}
            onChange={(e) => {
              if (value === undefined) setInner(e.target.value);
              onChange?.(e.target.value);
            }}
            {...it.focus}
            style={{ ...bareInput, height, minHeight: 40, resize: 'none', overflowWrap: 'anywhere', cursor: look === 'disabled' ? 'not-allowed' : undefined }}
          />
          {!v ? (
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, color: c.placeholder, pointerEvents: 'none', overflow: 'hidden' }}>
              {placeholder}
            </span>
          ) : null}
        </span>
        {showResizeHandle ? (
          <span style={{ position: 'absolute', right: 8, bottom: 8, pointerEvents: 'none', color: tok(`button-icon-only-plain-color-fg-${look === 'disabled' || look === 'readOnly' ? 'disabled' : 'default'}`, look === 'disabled' || look === 'readOnly' ? '#B3B9C0' : '#454F59'), background: tok('button-icon-only-plain-color-bg-default', '#00000000') }}>
            <Icon name="line/drag-handle" size={tok('button-icon-only-medium-icon-size', 16)} />
          </span>
        ) : null}
      </div>
    </FieldFrame>
  );
}

TextArea.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { focus: { defaultValue: 'Text' }, entered: { defaultValue: 'Text' }, readOnly: { defaultValue: 'Text' }, disabled: { defaultValue: 'Text' } } };
