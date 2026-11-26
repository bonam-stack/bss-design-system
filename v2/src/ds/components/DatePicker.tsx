// DatePicker: DateField 아래에 Calendar를 띄워 날짜 · 기간을 고른다. 달력 버튼으로 열고 닫으며, 적용하면 필드에 반영하고 닫는다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Date Field / Date Picker › DatePicker (5711:15939) · mode 4, showCalendar
// 토큰: DS 컴포넌트 명세 datePicker (필드–달력 거리 date-picker-space-offset). 색 · 글자는 dateField · calendar 토큰을 쓴다
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Calendar } from './Calendar';
import type { CalendarValue } from './Calendar';
import { DateField } from './DateField';
import type { DateFieldMode, DateFieldValue } from './DateField';
import { tok } from '../shared';
import type { Importance } from '../field';

export interface DatePickerProps {
  /** date 날짜 · dateTime 날짜+시간 · dateRange 기간 · dateTimeRange 기간+시간 (달력은 range · showTime을 이에 맞춘다) */
  mode?: DateFieldMode;
  /** 달력을 펼친다. 바꾸면 그 값으로 열고 닫으며, 달력 버튼 · 적용 · 취소 · Esc로도 열고 닫는다 */
  showCalendar?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 값. 주면 제어 컴포넌트 (onChange로 새 값을 받는다) */
  value?: DateFieldValue;
  defaultValue?: DateFieldValue;
  onChange?: (value: DateFieldValue) => void;
  size?: 'large' | 'medium' | 'small';
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  /** 달력에 처음 보여 줄 연월 (YYYY.MM). 기본은 값의 달, 값이 없으면 오늘의 달 */
  monthLabel?: string;
  /** 오늘 (YYYY.MM.DD). 기본은 실제 오늘 */
  today?: string;
  min?: string;
  max?: string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const toCalendar = (v: DateFieldValue): CalendarValue => ({ start: v.date, end: v.endDate, startTime: v.time, endTime: v.endTime });
const toField = (v: CalendarValue): DateFieldValue => ({ date: v.start, endDate: v.end, time: v.startTime, endTime: v.endTime });

export function DatePicker({ mode = 'date', showCalendar = true, onOpenChange, value, defaultValue = {}, onChange, size = 'large', importance = 'none', invalid, disabled, readOnly, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = false, monthLabel, today, min, max, width, className, style }: DatePickerProps) {
  const [open, setOpenInner] = useState(showCalendar);
  useEffect(() => setOpenInner(showCalendar), [showCalendar]);
  const setOpen = (o: boolean) => {
    setOpenInner(o);
    onOpenChange?.(o);
  };
  const [inner, setInner] = useState<DateFieldValue>(defaultValue);
  const v = value ?? inner;
  const set = (next: DateFieldValue) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const root = useRef<HTMLDivElement>(null);
  const range = mode === 'dateRange' || mode === 'dateTimeRange';
  const withTime = mode === 'dateTime' || mode === 'dateTimeRange';
  const locked = disabled || readOnly;
  const show = open && !locked;

  // 바깥을 누르면 닫는다
  useEffect(() => {
    if (!show) return;
    const close = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={root}
      className={className}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && show) {
          e.stopPropagation();
          setOpen(false);
        }
      }}
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', ...style }}
    >
      <DateField
        mode={mode}
        value={v}
        onChange={set}
        size={size}
        importance={importance}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        state={show ? 'focus' : undefined}
        label={label}
        showLabel={showLabel}
        helperText={helperText}
        showHelperText={showHelperText}
        width={width}
        onCalendarClick={() => setOpen(!open)}
      />
      {/* calendarAnchor: 높이 0, 달력은 필드 아래에 떠서 다른 내용을 밀지 않는다 */}
      <div style={{ position: 'relative', height: 0 }}>
        {show ? (
          <Calendar
            key={`${mode}`}
            selectionMode={range ? 'range' : 'single'}
            showTime={withTime}
            monthLabel={monthLabel ?? (v.date || today || todayKey()).slice(0, 7)}
            defaultValue={toCalendar(v)}
            today={today}
            min={min}
            max={max}
            onApply={(cv) => {
              set({ ...v, ...toField(cv) });
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
            style={{ position: 'absolute', top: tok('date-picker-space-offset'), left: 0, zIndex: 10 }}
          />
        ) : null}
      </div>
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
DatePicker.meta = { texts: { label: 'Label', helperText: 'HelperText' } };
