// Select: 목록에서 값 하나를 고른다. 칸(버튼)을 누르면 옵션 목록(listbox)이 열리고, 방향키 · Enter · Esc로도 고른다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Select / Dropdown › Select (3053:37864) · importance 3 × state 6 × invalid 2 × size 3, showLabel · showHelperText · showScrollbar · showFocus
//        옵션 _Item/Select/Option (3082:38648) · selection 2 × size 3 × state 4, showFocus
// 토큰: DS 컴포넌트 명세 select (칸 select-*, 색 field-*, 목록 select-list-*, 옵션 select-option-* · select-selected-option-*, 꺾쇠 button-icon-only-plain-*)
import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent } from 'react';
import { FocusRing, Icon, bool, textStyle, tok, tokState, useInteraction } from '../shared';
import { FieldFrame, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

/** Figma state: open은 목록을 펼친 모양(코드 상태는 focus), selected는 값을 고른 모양(코드 상태는 default) */
export type SelectState = 'default' | 'hover' | 'open' | 'selected' | 'readOnly' | 'disabled';
export interface SelectOption {
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** 고른 값. 주면 제어 컴포넌트 (onChange로 새 값을 받는다) */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 옵션 목록 (글자만 주면 값 = 글자) */
  options?: (string | SelectOption)[];
  size?: 'large' | 'medium' | 'small';
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). open이면 목록을 펼쳐 보인다 */
  state?: SelectState;
  readOnly?: boolean;
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  helperText?: string;
  showHelperText?: boolean;
  /** 옵션이 목록 높이를 넘으면 스크롤 (끄면 옵션을 모두 펼친다) */
  showScrollbar?: boolean;
  showFocus?: boolean;
  /** 칸 폭 (기본 Figma 200) */
  width?: number | string;
}

const TEXT = { large: textStyle('font-label-16-400'), medium: textStyle('font-label-15-400'), small: textStyle('font-label-14-400') };
const norm = (o: string | SelectOption): SelectOption => (typeof o === 'string' ? { value: o } : o);

export function Select({ value, defaultValue = '', onChange, options = ['Option 1', 'Option 2', 'Option 3'], size = 'large', importance = 'none', invalid, state, readOnly, label = 'Label', showLabel = false, placeholder = 'Placeholder', helperText = 'HelperText', showHelperText = false, showScrollbar = true, showFocus = false, width = 200, disabled, id, className, style, onKeyDown, onClick, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const v = value ?? inner;
  const [openInner, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [pressIdx, setPressIdx] = useState(-1);
  const [keyNav, setKeyNav] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const it = useInteraction();
  const list = options.map(norm);

  const off = disabled || state === 'disabled';
  const ro = readOnly || state === 'readOnly';
  const locked = off || ro;
  const open = !locked && (state === 'open' || openInner);
  const forced: FieldState | undefined = state === 'open' ? 'focus' : state === 'selected' ? 'entered' : state;
  const look = fieldLook({ state: forced, disabled: off, readOnly: ro, focused: open, hover: it.hover, hasValue: !!v });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const current = list.find((o) => o.value === v);
  const shown = current ? current.label ?? current.value : v;

  useEffect(() => {
    if (!openInner) return;
    const close = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openInner]);

  const pick = (o: SelectOption) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
  };
  const move = (from: number, dir: 1 | -1) => {
    for (let i = 1; i <= list.length; i++) {
      const n = (from + dir * i + list.length * 2) % list.length;
      if (!list[n].disabled) return n;
    }
    return from;
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (locked || !list.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setKeyNav(true);
      if (!open) {
        setOpen(true);
        setActive(Math.max(0, list.findIndex((o) => o.value === v)));
      } else setActive(move(active < 0 ? (e.key === 'ArrowDown' ? -1 : 0) : active, e.key === 'ArrowDown' ? 1 : -1));
    } else if ((e.key === 'Enter' || e.key === ' ') && open && active >= 0) {
      e.preventDefault();
      pick(list[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  // 꺾쇠: 열림이면 위쪽, 잠김이면 비활성 색. 펼침 + 값 있음이면 값 글자색 (DS 명세 expandedState)
  const chevron = locked ? tok('button-icon-only-plain-color-fg-disabled') : open && v ? tok('field-color-fg-default') : tok('button-icon-only-plain-color-fg-default');
  // Figma 목록 높이 284 · 256 · 228 = 옵션 7개 + 목록 여백 (높이 토큰 없음)
  const maxHeight = `calc(${tok(`select-${size}-option-size-height`)} * 7 + ${tok('select-list-space-padding-y')})`;

  return (
    <div ref={root} style={{ display: 'inline-flex', position: 'relative' }}>
      <FieldFrame
        name="select"
        id={fid}
        width={width}
        label={label}
        showLabel={showLabel}
        importance={importance}
        helperText={helperText}
        showHelperText={showHelperText}
        invalid={bad}
        look={look}
        ringRadius={tok(`select-${size}-focus-ring-radius`)}
        showRing={showFocus || it.focusVisible}
        className={className}
        style={style}
        pointer={it.pointer}
      >
        <button
          {...rest}
          id={fid}
          type="button"
          disabled={off}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${fid}-list`}
          aria-readonly={ro || undefined}
          aria-invalid={c.error || undefined}
          aria-required={importance === 'required' || undefined}
          aria-describedby={showHelperText ? `${fid}-help` : undefined}
          aria-activedescendant={open && active >= 0 ? `${fid}-opt-${active}` : undefined}
          onClick={(e) => {
            onClick?.(e);
            if (locked) return;
            setKeyNav(false);
            setOpen(!openInner);
            setActive(list.findIndex((o) => o.value === v));
          }}
          onKeyDown={onKey}
          {...it.focus}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            height: tok(`select-${size}-size-height`),
            display: 'flex',
            alignItems: 'center',
            gap: tok('select-space-gap'),
            margin: 0,
            padding: `0 ${tok(`select-${size}-space-padding-end`)} 0 ${tok(`select-${size}-space-padding-start`)}`,
            border: 0,
            borderRadius: tok('select-radius'),
            background: c.background,
            boxShadow: `inset 0 0 0 ${tok('select-border-width')} ${c.border}`,
            outline: c.ring,
            ...TEXT[size],
            color: v || look === 'disabled' ? c.text : c.placeholder,
            textAlign: 'left',
            cursor: off ? 'not-allowed' : ro ? 'default' : 'pointer',
          }}
        >
          <span style={{ flex: '1 1 0', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v ? shown : placeholder}</span>
          <Icon name={open ? 'line/chevron-up' : 'line/chevron-down'} size={tok(`select-${size}-icon-size`)} color={chevron} />
        </button>
        {open ? (
          <ul
            id={`${fid}-list`}
            role="listbox"
            aria-labelledby={fid}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: tok('select-list-space-gap'),
              margin: `${tok('select-list-space-offset')} 0 0`,
              padding: `${tok('select-list-space-padding-y')} ${tok('select-list-space-padding-x')}`,
              listStyle: 'none',
              borderRadius: tok('select-list-radius'),
              background: tok('select-list-color-bg-default'),
              boxShadow: tok('select-list-shadow'),
              maxHeight: showScrollbar ? maxHeight : undefined,
              overflowY: showScrollbar ? 'auto' : 'visible',
              boxSizing: 'border-box',
            }}
          >
            {list.map((o, i) => {
              const sel = o.value === v;
              const st = o.disabled ? 'disabled' : pressIdx === i ? 'pressed' : hoverIdx === i || (keyNav && active === i) ? 'hover' : 'default';
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${fid}-opt-${i}`}
                  role="option"
                  aria-selected={sel}
                  aria-disabled={o.disabled || undefined}
                  onPointerEnter={() => setHoverIdx(i)}
                  onPointerLeave={() => {
                    setHoverIdx(-1);
                    setPressIdx(-1);
                  }}
                  onPointerDown={() => setPressIdx(i)}
                  onPointerUp={() => setPressIdx(-1)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  style={{
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    height: tok(`select-${size}-option-size-height`),
                    padding: `0 ${tok('select-option-space-padding-x')}`,
                    borderRadius: tok('select-option-radius'),
                    background: tokState(sel ? 'select-selected-option-color-bg' : 'select-option-color-bg', st),
                    color: tokState(sel ? 'select-selected-option-color-fg' : 'select-option-color-fg', st),
                    ...TEXT[size],
                    whiteSpace: 'nowrap',
                    cursor: o.disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.label ?? o.value}</span>
                  {keyNav && active === i ? <FocusRing radius={tok('select-option-focus-ring-radius')} /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </FieldFrame>
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Select.meta = { texts: { label: 'Label', helperText: 'HelperText', placeholder: 'Placeholder', value: '' }, samples: { selected: { defaultValue: 'Selected' }, readOnly: { defaultValue: 'Selected' }, disabled: { defaultValue: 'Selected' } } };
