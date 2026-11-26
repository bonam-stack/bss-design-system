// LookupField: 검색 창(조회 팝업)에서 고른 값을 보여 주는 칸. 값은 직접 입력하지 않고, 오른쪽 검색 버튼 · 칸 클릭 · Enter로 검색 창을 연다(onSearch).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Lookup Field › LookupField (5168:16374) · importance 3 × state 5 × invalid 2 × size 3, showLabel · showHelperText · showSearchButton · showFocus
// 토큰: DS 컴포넌트 명세 lookupField (칸 lookup-field-*, 색 field-*), 검색 버튼은 Button type=icon base (button-icon-only-*)
import { useId } from 'react';
import type { CSSProperties, InputHTMLAttributes } from 'react';
import { FocusRing, bool, textStyle, tok, useInteraction } from '../shared';
import { bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';
import { Button } from './Button';
import { FieldLabel } from './FieldLabel';
import { HelperText } from './HelperText';

/** Figma state: selected는 조회해 고른 값이 있는 모양(코드 상태는 default). focus 상태는 없다 */
export type LookupFieldState = 'default' | 'hover' | 'selected' | 'readOnly' | 'disabled';

export interface LookupFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'readOnly'> {
  /** 고른 값 (검색 창에서 받은 값을 넣는다) */
  value?: string;
  defaultValue?: string;
  /** 검색 창을 열 때 (검색 버튼 · 칸 클릭 · Enter · Space) */
  onSearch?: () => void;
  size?: 'large' | 'medium' | 'small';
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 둔다 */
  state?: LookupFieldState;
  /** 값을 바꿀 수 없음 (검색 버튼도 비활성) */
  readOnly?: boolean;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  /** 오른쪽 검색 버튼 */
  showSearchButton?: boolean;
  showFocus?: boolean;
  /** 값 칸 폭 (기본 Figma 200, 검색 버튼 제외) */
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

const TEXT = { large: textStyle('font-label-16-400'), medium: textStyle('font-label-15-400'), small: textStyle('font-label-14-400') };

export function LookupField({ value, defaultValue = '', onSearch, size = 'large', importance = 'none', invalid, state, readOnly, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = true, showSearchButton = true, showFocus = false, width = 200, placeholder = 'Placeholder', disabled, id, className, style, onKeyDown, onClick, ...input }: LookupFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const v = value ?? defaultValue;
  const it = useInteraction();
  const forced: FieldState | undefined = state === 'selected' ? 'entered' : state;
  // 포커스 모양이 없는 필드라 focused는 넘기지 않는다 (포커스는 링으로만 보인다)
  const look = fieldLook({ state: forced, disabled: disabled || state === 'disabled', readOnly: readOnly || state === 'readOnly', focused: false, hover: it.hover, hasValue: !!v });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const locked = look === 'readOnly' || look === 'disabled';
  const helperError = c.error;
  const open = () => {
    if (!locked) onSearch?.();
  };

  return (
    <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', gap: tok('lookup-field-label-space-gap'), ...style }}>
      {showLabel && label ? (
        <FieldLabel htmlFor={fid} showRequired={importance === 'required'}>
          {label}
        </FieldLabel>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: tok('lookup-field-space-gap') }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tok('lookup-field-helper-space-gap'), width, minWidth: 0 }}>
          <div {...it.pointer} style={{ position: 'relative', display: 'flex' }}>
            <div
              style={{
                flex: '1 1 0',
                minWidth: 0,
                height: tok(`lookup-field-${size}-size-height`),
                display: 'flex',
                alignItems: 'center',
                padding: `0 ${tok(`lookup-field-${size}-space-padding-x`)}`,
                borderRadius: tok('lookup-field-radius'),
                background: c.background,
                boxShadow: `inset 0 0 0 ${tok('lookup-field-border-width')} ${c.border}`,
                outline: c.ring,
                ...TEXT[size],
                color: c.text,
              }}
            >
              <input
                {...input}
                id={fid}
                type="text"
                value={v}
                readOnly
                aria-readonly={locked || undefined}
                aria-haspopup="dialog"
                aria-invalid={helperError || undefined}
                aria-required={importance === 'required' || undefined}
                aria-describedby={showHelperText ? `${fid}-help` : undefined}
                disabled={look === 'disabled'}
                onClick={(e) => {
                  open();
                  onClick?.(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                  }
                  onKeyDown?.(e);
                }}
                {...it.focus}
                style={{ ...bareInput, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: look === 'disabled' ? 'not-allowed' : locked ? 'default' : 'pointer' }}
              />
              {!v ? (
                <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: `0 ${tok(`lookup-field-${size}-space-padding-x`)}`, color: c.placeholder, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {placeholder}
                </span>
              ) : null}
            </div>
            {showFocus || it.focusVisible ? <FocusRing radius={tok(`lookup-field-${size}-focus-ring-radius`)} /> : null}
          </div>
          {showHelperText && helperText ? <HelperText id={`${fid}-help`} state={helperError ? 'error' : 'default'} message={helperText} style={{ width: 'auto', alignSelf: 'stretch' }} /> : null}
        </div>
        {showSearchButton ? (
          // 필드가 hover여도 버튼은 기본 모양, readOnly · disabled이면 비활성 모양 (DS 명세 notes)
          <Button type="icon" variants="base" size={size} icon="line/search" label="검색" state={locked ? 'disabled' : undefined} onClick={open} />
        ) : null}
      </div>
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
LookupField.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { selected: { defaultValue: 'Selected' }, readOnly: { defaultValue: 'Selected' }, disabled: { defaultValue: 'Selected' } } };
