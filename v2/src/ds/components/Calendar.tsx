// Calendar: 날짜(단일) 또는 기간(시작 · 종료)을 달력에서 고른다. 날짜 칸은 방향키로 옮기고 Enter · Space로 고른다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Date Field / Date Picker › Calendar (5711:17631) · selectionMode 2, showTime · monthLabel
//        부품 _Item/Calendar/Date (5711:17035) · Day (5711:17595) · Time (5711:17608) · ButtonGroup (5711:17623), 빠른 기간 선택은 FilterChip small
// 토큰: DS 컴포넌트 명세 calendar (calendar-*). 월 이동은 Button(icon · base · small), 시간 칸은 Select(small) 컴포넌트, 아래 버튼은 Button(square · medium)
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Button } from './Button';
import { FilterChip } from './FilterChip';
import { Select } from './Select';
import { FocusRing, textStyle, tok, tokState } from '../shared';

export type CalendarSelectionMode = 'single' | 'range';

/** 날짜는 YYYY.MM.DD, 시간은 HH:mm:ss. single이면 start · startTime만 쓴다 */
export interface CalendarValue {
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
}

export interface CalendarProps {
  /** single 날짜 하나 · range 기간(시작 · 종료) */
  selectionMode?: CalendarSelectionMode;
  /** 아래 시간 입력(시 · 분 · 초) 표시 */
  showTime?: boolean;
  /** 처음 보여 줄 연월 (YYYY.MM). 머리 제목은 지금 보고 있는 달을 같은 형식으로 쓴다 */
  monthLabel?: string;
  /** 값. 주면 제어 컴포넌트 (onChange로 새 값을 받는다) */
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
  /** 오늘 (YYYY.MM.DD). 기본은 실제 오늘. 오늘 칸 위에 점을 찍는다 */
  today?: string;
  /** 고를 수 있는 가장 이른 · 늦은 날짜 (YYYY.MM.DD) */
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  /** 적용 버튼 */
  onApply?: (value: CalendarValue) => void;
  /** 취소 버튼 */
  onCancel?: () => void;
  className?: string;
  style?: CSSProperties;
}

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
type DayType = 'weekday' | 'sunday' | 'saturday';

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
const parse = (s?: string) => {
  const m = s && /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(s);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : undefined;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthOf = (label: string | undefined, fallback: Date) => {
  const m = label && /^(\d{4})\.(\d{1,2})/.exec(label);
  return m ? new Date(+m[1], +m[2] - 1, 1) : new Date(fallback.getFullYear(), fallback.getMonth(), 1);
};
const DAY_TYPE = (i: number): DayType => (i === 0 ? 'sunday' : i === 6 ? 'saturday' : 'weekday');
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEK_NAME = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const SIXTY = Array.from({ length: 60 }, (_, i) => pad(i));

/** 빠른 기간 선택 (기간 달력 위 FilterChip small) */
const SHORTCUTS: { label: string; range: (t: Date) => [Date, Date] }[] = [
  { label: '오늘', range: (t) => [t, t] },
  { label: '최근 7일', range: (t) => [addDays(t, -6), t] },
  { label: '최근 30일', range: (t) => [addDays(t, -29), t] },
  { label: '이번달', range: (t) => [new Date(t.getFullYear(), t.getMonth(), 1), new Date(t.getFullYear(), t.getMonth() + 1, 0)] },
];

/** _Item/Calendar/Time 안 시 · 분 · 초 칸: Select(small) 컴포넌트, 셋이 한 줄에 들어가게 최소 너비 없이 */
function TimeSelect({ value, options, label, onChange }: { value: string; options: string[]; label: string; onChange: (v: string) => void }) {
  return (
    <span style={{ flex: '1 1 0', minWidth: 0, display: 'flex' }}>
      <Select aria-label={label} size="small" width="100%" minWidth={0} placeholder="00" value={value} options={options} onChange={onChange} />
    </span>
  );
}

function TimeRow({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  const [h = '', m = '', s = ''] = (value || '').split(':');
  const set = (i: number, x: string) => {
    const parts = [h, m, s].map((p, j) => (j === i ? x : p || '00'));
    onChange(parts.join(':'));
  };
  const sep = <span aria-hidden="true" style={{ ...textStyle('font-label-16-400'), color: tok('calendar-separator-color-fg-default') }}>:</span>;
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: tok('calendar-label-space-gap') }}>
      <span style={{ flexShrink: 0, ...textStyle('font-label-12-600'), color: tok('calendar-label-color-fg-default') }}>{label}</span>
      <span style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: tok('calendar-value-space-gap') }}>
        <TimeSelect label={`${label} 시`} value={h} options={HOURS} onChange={(x) => set(0, x)} />
        {sep}
        <TimeSelect label={`${label} 분`} value={m} options={SIXTY} onChange={(x) => set(1, x)} />
        {sep}
        <TimeSelect label={`${label} 초`} value={s} options={SIXTY} onChange={(x) => set(2, x)} />
      </span>
    </div>
  );
}

export function Calendar({ selectionMode = 'single', showTime = true, monthLabel = '2026.10', value, defaultValue = {}, onChange, today, min, max, isDateDisabled, onApply, onCancel, className, style }: CalendarProps) {
  const now = parse(today) ?? new Date();
  const todayKey = fmt(now);
  const [view, setView] = useState(() => monthOf(monthLabel, now));
  useEffect(() => setView(monthOf(monthLabel, now)), [monthLabel]); // eslint-disable-line react-hooks/exhaustive-deps
  const [inner, setInner] = useState<CalendarValue>(defaultValue);
  const v = value ?? inner;
  const set = (next: CalendarValue) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const [shortcut, setShortcut] = useState(-1);
  const [hoverKey, setHoverKey] = useState('');
  const [pressKey, setPressKey] = useState('');
  const [focusKey, setFocusKey] = useState('');
  const [ringKey, setRingKey] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  const range = selectionMode === 'range';

  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const startDay = addDays(first, -first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(startDay, i));
  const disabledDay = (k: string) => (min ? k < min : false) || (max ? k > max : false) || !!isDateDisabled?.(k);
  // 키보드 이동 기준 칸: 고른 날짜 → 오늘 → 1일 (보고 있는 달 안에서)
  const inView = (k?: string) => !!k && k.slice(0, 7) === `${year}.${pad(month + 1)}`;
  const rover = inView(focusKey) ? focusKey : inView(v.start) ? v.start! : inView(todayKey) ? todayKey : fmt(first);

  const pick = (k: string) => {
    setShortcut(-1);
    if (!range) return set({ ...v, start: k, end: undefined });
    if (!v.start || v.end) return set({ ...v, start: k, end: undefined });
    return k < v.start ? set({ ...v, start: k, end: v.start }) : set({ ...v, end: k });
  };

  const move = (k: string) => {
    const d = parse(k)!;
    if (d.getMonth() !== month || d.getFullYear() !== year) setView(new Date(d.getFullYear(), d.getMonth(), 1));
    setFocusKey(k);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>(`[data-date="${k}"]`)?.focus());
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, k: string) => {
    const d = parse(k)!;
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) {
      e.preventDefault();
      move(fmt(addDays(d, step[e.key])));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      move(fmt(new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate())));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      move(fmt(addDays(d, e.key === 'Home' ? -d.getDay() : 6 - d.getDay())));
    }
  };

  const cell = (d: Date, i: number) => {
    const k = fmt(d);
    const current = d.getMonth() === month;
    const dayType = DAY_TYPE(i % 7);
    const off = disabledDay(k);
    const look: Look = off ? 'disabled' : pressKey === k ? 'pressed' : hoverKey === k ? 'hover' : 'default';
    const both = range && v.start && v.end && v.start !== v.end;
    const isStart = k === v.start;
    const isEnd = range && k === v.end;
    const middle = !!both && k > v.start! && k < v.end!;
    const selected = isStart || isEnd;

    let fg: string;
    let circle: string;
    if (selected) {
      fg = tok('calendar-selected-date-color-fg-default');
      circle = tokState('calendar-selected-date-color-bg', look);
    } else if (middle) {
      // 범위 가운데 날짜의 hover · pressed는 기본과 같다
      fg = tokState('calendar-range-middle-date-color-fg', look);
      circle = 'transparent';
    } else {
      fg = !current ? tok('calendar-adjacent-date-color-fg-default') : tokState(dayType === 'weekday' ? 'calendar-date-color-fg' : `calendar-${dayType}-date-color-fg`, look);
      circle = tokState('calendar-date-color-bg', look);
    }
    const band = tok('calendar-range-middle-date-color-bg-default');
    const bandStyle: CSSProperties | null = middle ? { left: 0, right: 0 } : both && isStart ? { left: '50%', right: 0 } : both && isEnd ? { left: 0, right: '50%' } : null;

    return (
      <span key={k} role="gridcell" aria-selected={selected || middle} style={{ position: 'relative', display: 'flex', width: tok('calendar-date-size-width'), height: tok('calendar-date-size-height') }}>
        {bandStyle ? <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, ...bandStyle, background: band }} /> : null}
        <button
          type="button"
          data-date={k}
          tabIndex={k === rover ? 0 : -1}
          disabled={off}
          aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEK_NAME[i % 7]}${k === todayKey ? ', 오늘' : ''}`}
          aria-current={k === todayKey ? 'date' : undefined}
          onClick={() => pick(k)}
          onKeyDown={(e) => onKey(e, k)}
          onPointerEnter={() => setHoverKey(k)}
          onPointerLeave={() => {
            setHoverKey('');
            setPressKey('');
          }}
          onPointerDown={() => setPressKey(k)}
          onPointerUp={() => setPressKey('')}
          onFocus={(e) => {
            setFocusKey(k);
            setRingKey(e.currentTarget.matches(':focus-visible') ? k : '');
          }}
          onBlur={() => setRingKey('')}
          style={{
            position: 'relative',
            flex: '1 1 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            border: 0,
            outline: 'none',
            borderRadius: tok('calendar-date-radius'),
            background: circle,
            color: fg,
            ...textStyle('font-label-14-500'),
            fontVariantNumeric: 'tabular-nums',
            cursor: off ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {k === todayKey ? (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: tok('space-4'),
                left: '50%',
                transform: 'translateX(-50%)',
                width: tok('calendar-dot-size'),
                height: tok('calendar-dot-size'),
                borderRadius: tok('calendar-dot-radius'),
                background: selected ? tok('calendar-selected-today-dot-color-bg-default') : tok('calendar-today-dot-color-bg-default'),
              }}
            />
          ) : null}
          {d.getDate()}
          {ringKey === k ? <FocusRing radius={tok('calendar-focus-ring-radius')} /> : null}
        </button>
      </span>
    );
  };

  const title = `${year}.${pad(month + 1)}`;

  return (
    <div
      className={className}
      role="group"
      aria-label={range ? '기간 선택 달력' : '날짜 선택 달력'}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: tok('calendar-space-gap'),
        boxSizing: 'border-box',
        padding: `${tok('calendar-space-padding-y')} ${tok('calendar-space-padding-x')}`,
        borderRadius: tok('calendar-radius'),
        background: tok('calendar-color-bg-default'),
        boxShadow: `inset 0 0 0 ${tok('calendar-border-width')} ${tok('calendar-color-border-default')}, ${tok('calendar-shadow')}`,
        ...style,
      }}
    >
      {range ? (
        <div style={{ display: 'flex', gap: tok('calendar-group-space-gap'), flexWrap: 'wrap' }}>
          {SHORTCUTS.map((s, i) => (
            <FilterChip
              key={s.label}
              size="small"
              label={s.label}
              selection={shortcut === i ? 'selected' : 'unselected'}
              onSelectionChange={() => {
                const [a, b] = s.range(now);
                setShortcut(i);
                setView(new Date(b.getFullYear(), b.getMonth(), 1));
                set({ ...v, start: fmt(a), end: fmt(b) });
              }}
            />
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: tok('calendar-header-space-gap') }}>
        <Button type="icon" variants="base" size="small" icon="line/chevron-left" label="이전 달" onClick={() => setView(new Date(year, month - 1, 1))} />
        <span aria-live="polite" style={{ flex: '1 1 0', textAlign: 'center', ...textStyle('font-label-18-600'), fontVariantNumeric: 'tabular-nums', color: tok('calendar-title-color-fg-default') }}>
          {title}
        </span>
        <Button type="icon" variants="base" size="small" icon="line/chevron-right" label="다음 달" onClick={() => setView(new Date(year, month + 1, 1))} />
      </div>

      <div ref={grid} role="grid" aria-label={title} style={{ display: 'flex', flexDirection: 'column' }}>
        <div role="row" style={{ display: 'flex' }}>
          {WEEK.map((w, i) => {
            const t = DAY_TYPE(i);
            return (
              <span
                key={i}
                role="columnheader"
                aria-label={WEEK_NAME[i]}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: tok('calendar-date-size-width'),
                  height: tok('calendar-date-size-height'),
                  ...textStyle('font-label-12-600'),
                  color: tok(t === 'weekday' ? 'calendar-weekday-color-fg-default' : `calendar-${t}-weekday-color-fg-default`),
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} role="row" style={{ display: 'flex' }}>
            {days.slice(r * 7, r * 7 + 7).map((d, c) => cell(d, r * 7 + c))}
          </div>
        ))}
      </div>

      {showTime ? (
        range ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tok('calendar-time-space-gap') }}>
            <TimeRow label="시작" value={v.startTime} onChange={(x) => set({ ...v, startTime: x })} />
            <TimeRow label="종료" value={v.endTime} onChange={(x) => set({ ...v, endTime: x })} />
          </div>
        ) : (
          <TimeRow label="시간" value={v.startTime} onChange={(x) => set({ ...v, startTime: x })} />
        )
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tok('calendar-group-space-gap') }}>
        <Button type="square" variants="base" size="medium" label="취소" onClick={onCancel} />
        <Button type="square" variants="primary" size="medium" label="적용" onClick={() => onApply?.(v)} />
      </div>
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Calendar.meta = { texts: { monthLabel: '2026.10' } };
