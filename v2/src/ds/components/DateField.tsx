// DateField: 날짜 · 시간 · 기간을 정해진 형식(YYYY.MM.DD · HH:mm:ss)으로 직접 입력한다. 실제 <input>이라 폼 · 키보드가 그대로 동작한다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Date Field / Date Picker › DateField (5711:20277)
//        mode 4 × importance 3 × state 6 × invalid 2 × size 3, showLabel · showHelperText · showFocus. 입력 글자는 _Item/DateField/Input (12214:23362)
// 토큰: DS 컴포넌트 명세 dateField (치수 date-field-*, 색 field-*, 구분 기호 date-field-separator-*, 달력 버튼 button-icon-only-plain-*)
import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './Button';
import { bool, textStyle, tok, tokState, useInteraction } from '../shared';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export type DateFieldMode = 'date' | 'dateTime' | 'dateRange' | 'dateTimeRange';

/** 날짜는 YYYY.MM.DD, 시간은 HH:mm:ss. 기간이면 end* 까지 쓴다 */
export interface DateFieldValue {
  date?: string;
  time?: string;
  endDate?: string;
  endTime?: string;
}

export interface DateFieldProps {
  /** date 날짜 · dateTime 날짜+시간 · dateRange 기간 · dateTimeRange 기간+시간 */
  mode?: DateFieldMode;
  /** 값. 주면 제어 컴포넌트 (onChange로 새 값을 받는다) */
  value?: DateFieldValue;
  defaultValue?: DateFieldValue;
  onChange?: (value: DateFieldValue) => void;
  size?: 'large' | 'medium' | 'small';
  /** none 기본 · attention 주의 · required 필수 (칸 배경색으로 표시) */
  importance?: Importance;
  /** 오류: 테두리 · 바깥 링 · 도움말이 빨갛게 */
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 둔다 */
  state?: FieldState;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  showFocus?: boolean;
  /** 날짜 안내 글자 (Figma _Item/DateField/Input placeholder) */
  placeholder?: string;
  /** 시간 안내 글자 (Figma timePlaceholder) */
  timePlaceholder?: string;
  /** 칸 폭. 기본은 모드 · 사이즈별 최소 너비이고 이보다 좁아지지 않는다 ('100%'로 Fill) */
  width?: number | string;
  /** 달력 버튼을 눌렀을 때 (DatePicker가 달력을 연다) */
  onCalendarClick?: () => void;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

const TEXT = { large: textStyle('font-label-16-400'), medium: textStyle('font-label-15-400'), small: textStyle('font-label-14-400') };

/** 모드 · 사이즈별 기본(최소) 너비: DS 명세 field.dateFieldWidth 구현값 (너비 토큰 없음) */
const WIDTH: Record<DateFieldMode, Record<'large' | 'medium' | 'small', number>> = {
  date: { large: 136, medium: 132, small: 120 },
  dateTime: { large: 212, medium: 200, small: 188 },
  dateRange: { large: 248, medium: 236, small: 220 },
  dateTimeRange: { large: 396, medium: 376, small: 352 },
};

/** 숫자만 받아 2026.10.15 · 09:00:00 모양으로 */
function formatDigits(raw: string, kind: 'date' | 'time') {
  const d = raw.replace(/\D/g, '');
  if (kind === 'date') {
    const s = d.slice(0, 8);
    return [s.slice(0, 4), s.slice(4, 6), s.slice(6, 8)].filter(Boolean).join('.');
  }
  const s = d.slice(0, 6);
  return [s.slice(0, 2), s.slice(2, 4), s.slice(4, 6)].filter(Boolean).join(':');
}

export function DateField({ mode = 'date', value, defaultValue = {}, onChange, size = 'large', importance = 'none', invalid, state, disabled, readOnly, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = true, showFocus = false, placeholder = '0000.00.00', timePlaceholder = '00:00:00', width, onCalendarClick, id, name, className, style }: DateFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState<DateFieldValue>(defaultValue);
  const v = value ?? inner;
  const set = (patch: DateFieldValue) => {
    const next = { ...v, ...patch };
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const it = useInteraction();
  const range = mode === 'dateRange' || mode === 'dateTimeRange';
  const withTime = mode === 'dateTime' || mode === 'dateTimeRange';
  const hasValue = !!(v.date || (withTime && v.time) || (range && (v.endDate || (withTime && v.endTime))));
  const off = disabled || state === 'disabled';
  const ro = readOnly || state === 'readOnly';
  const look = fieldLook({ state, disabled: off, readOnly: ro, focused: it.focused, hover: it.hover, hasValue });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const locked = look === 'readOnly' || look === 'disabled';
  const sepKey = c.error ? 'error' : look === 'entered' ? 'default' : look === 'readOnly' ? 'readonly' : look;
  const minW = WIDTH[mode][size];

  const input = (key: keyof DateFieldValue, kind: 'date' | 'time', aria: string, grow: boolean) => {
    const text = v[key] || '';
    return (
      <span key={key} style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: grow ? '1 1 0' : '0 0 auto', minWidth: 0, width: grow ? undefined : `${kind === 'date' ? 10 : 8}ch` }}>
        <input
          name={name ? `${name}.${key}` : undefined}
          id={key === 'date' ? fid : undefined}
          value={text}
          aria-label={aria}
          inputMode="numeric"
          maxLength={kind === 'date' ? 10 : 8}
          disabled={off}
          readOnly={ro}
          aria-invalid={bad || undefined}
          aria-describedby={showHelperText ? `${fid}-help` : undefined}
          onChange={(e) => set({ [key]: formatDigits(e.target.value, kind) })}
          {...it.focus}
          style={{ ...bareInput, fontVariantNumeric: 'tabular-nums', cursor: off ? 'not-allowed' : undefined }}
        />
        {!text ? (
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', color: c.placeholder, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {kind === 'date' ? placeholder : timePlaceholder}
          </span>
        ) : null}
      </span>
    );
  };

  /** _Item/DateField/Input: 날짜(+ 시간) 한 묶음 */
  const group = (dateKey: 'date' | 'endDate', timeKey: 'time' | 'endTime', prefix: string) => (
    <span style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: tok('date-field-value-space-gap') }}>
      {input(dateKey, 'date', `${prefix}날짜`, !withTime)}
      {withTime ? input(timeKey, 'time', `${prefix}시간`, true) : null}
    </span>
  );

  return (
    <FieldFrame
      name="date-field"
      id={fid}
      width={width ?? minW}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      ringRadius={tok(`date-field-${size}-focus-ring-radius`)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={{ minWidth: minW, ...style }}
      pointer={it.pointer}
    >
      <div
        role="group"
        aria-label={showLabel ? undefined : label}
        style={{
          flex: '1 1 0',
          minWidth: 0,
          boxSizing: 'border-box',
          height: tok(`date-field-${size}-size-height`),
          display: 'flex',
          alignItems: 'center',
          gap: tok('date-field-space-gap'),
          padding: `0 ${tok(`date-field-${size}-space-padding-end`)} 0 ${tok(`date-field-${size}-space-padding-start`)}`,
          borderRadius: tok('date-field-radius'),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('date-field-border-width')} ${c.border}`,
          outline: c.ring,
          ...TEXT[size],
          color: c.text,
        }}
      >
        {group('date', 'time', range ? '시작 ' : '')}
        {range ? (
          <>
            <span aria-hidden="true" style={{ flexShrink: 0, ...TEXT[size], color: tokState('date-field-separator-color-fg', sepKey) }}>
              -
            </span>
            {group('endDate', 'endTime', '종료 ')}
          </>
        ) : null}
        <Button
          type="iconPlain"
          size={size === 'small' ? 'small' : 'medium'}
          icon="line/calendar"
          label="달력 열기"
          disabled={locked}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCalendarClick}
        />
      </div>
    </FieldFrame>
  );
}

const SAMPLE: DateFieldValue = { date: '2026.10.15', time: '09:00:00', endDate: '2026.10.18', endTime: '18:00:00' };

/** 포털 미리보기 · 예시의 기본 글 */
DateField.meta = {
  texts: { label: 'Label', helperText: 'HelperText', placeholder: '0000.00.00', timePlaceholder: '00:00:00' },
  samples: { focus: { defaultValue: SAMPLE }, entered: { defaultValue: SAMPLE }, readOnly: { defaultValue: SAMPLE }, disabled: { defaultValue: SAMPLE } },
};
