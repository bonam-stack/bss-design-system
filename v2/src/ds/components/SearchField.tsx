// SearchField: 검색어 입력. 칸 안 왼쪽 검색 버튼(또는 Enter)으로 검색하고, 값이 있으면 지우기 버튼을 보인다. 실제 <input role="searchbox"> (브라우저 기본 지우기 버튼이 겹치지 않게 type은 text).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Text Fields › SearchField (5168:15712) · importance 3 × state 6 × invalid 2 × size 3, showLabel · showHelperText · showClear · showSearchButton · showFocus
// 토큰: DS 컴포넌트 명세 searchField (칸 search-field-*, 색 field-*, 검색 · 지우기 버튼은 Button type=iconPlain)
import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { bool, textStyle, tok, useInteraction } from '../shared';
import { Button } from './Button';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 검색 버튼을 누르거나 Enter를 누를 때 */
  onSearch?: (value: string) => void;
  size?: 'large' | 'medium' | 'small';
  /** none 기본 · attention 주의 · required 필수 (칸 배경색으로 표시) */
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 둔다 */
  state?: FieldState;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  /** 값이 있을 때 지우기 버튼 */
  showClear?: boolean;
  /** 칸 안 왼쪽 검색 버튼 */
  showSearchButton?: boolean;
  showFocus?: boolean;
  /** 칸 폭 (기본 Figma 200) */
  width?: number | string;
}

const TEXT = { large: textStyle('font-label-16-400'), medium: textStyle('font-label-15-400'), small: textStyle('font-label-14-400') };

export function SearchField({ value, defaultValue = '', onChange, onSearch, size = 'large', importance = 'none', invalid, state, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = true, showClear = true, showSearchButton = true, showFocus = false, width = 200, placeholder = 'Placeholder', disabled, readOnly, id, className, style, onKeyDown, ...input }: SearchFieldProps) {
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
  const locked = look === 'readOnly' || look === 'disabled';
  const clear = showClear && !!v && (look === 'focus' || look === 'entered' || look === 'hover');
  const btnSize = size === 'small' ? 'small' : 'medium';

  return (
    <FieldFrame
      name="search-field"
      id={fid}
      width={width}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      ringRadius={tok(`search-field-${size}-focus-ring-radius`)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={style}
      pointer={it.pointer}
    >
      <div
        role="search"
        style={{
          flex: '1 1 0',
          minWidth: 0,
          height: tok(`search-field-${size}-size-height`),
          display: 'flex',
          alignItems: 'center',
          gap: tok('search-field-space-gap'),
          padding: `0 ${tok(`search-field-${size}-space-padding-x`)}`,
          borderRadius: tok('search-field-radius'),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('search-field-border-width')} ${c.border}`,
          outline: c.ring,
          ...TEXT[size],
          color: c.text,
        }}
      >
        {showSearchButton ? <Button type="iconPlain" size={btnSize} icon="line/search" label="검색" disabled={locked} onMouseDown={(e) => e.preventDefault()} onClick={() => onSearch?.(v)} /> : null}
        <span style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center' }}>
          <input
            {...input}
            id={fid}
            type="text"
            role="searchbox"
            enterKeyHint="search"
            value={v}
            disabled={look === 'disabled'}
            readOnly={readOnly || state === 'readOnly'}
            aria-invalid={bad || undefined}
            aria-describedby={showHelperText ? `${fid}-help` : undefined}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !locked) onSearch?.(v);
              onKeyDown?.(e);
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
        {clear ? <Button type="iconPlain" size={btnSize} icon="filled/close-circle" label="지우기" onMouseDown={(e) => e.preventDefault()} onClick={() => set('')} /> : null}
      </div>
    </FieldFrame>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
SearchField.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { focus: { defaultValue: 'Text' }, entered: { defaultValue: 'Text' }, readOnly: { defaultValue: 'Text' }, disabled: { defaultValue: 'Text' } } };
