// Stepper: 숫자 입력. 가운데 숫자 칸에 직접 입력하거나 −/+ 버튼(또는 ↑/↓ 키)으로 step만큼 줄이고 늘린다. 실제 <input inputMode="numeric">.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Stepper › Stepper (7896:1164) · importance 3 × state 5 × invalid 2 × size 3, showLabel · showHelperText · showFocus
// 토큰: DS 컴포넌트 명세 stepper (칸 stepper-*, 색 field-*, −/+ 버튼은 Button type=iconPlain), 숫자는 font-label-[크기]-400 + tabular-nums
import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { bool, textStyle, tok, useInteraction } from '../shared';
import { Button } from './Button';
import { FieldFrame, bareInput, fieldColors, fieldLook } from '../field';
import type { FieldState, Importance } from '../field';

export type StepperState = 'default' | 'hover' | 'focus' | 'readOnly' | 'disabled';

export interface StepperProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'large' | 'medium' | 'small';
  importance?: Importance;
  invalid?: boolean | 'true' | 'false';
  /** 모양을 이 상태로 고정 (문서 예시용). 실제 화면에서는 비워 둔다 */
  state?: StepperState;
  label?: string;
  showLabel?: boolean;
  helperText?: string;
  showHelperText?: boolean;
  showFocus?: boolean;
  /** 칸 폭. 비워 두면 숫자 길이에 맞춘다 (Figma 98 · large, 값 1) */
  width?: number | string;
}

const TEXT = { large: textStyle('font-label-16-400'), medium: textStyle('font-label-15-400'), small: textStyle('font-label-14-400') };

/** −/+ 버튼: Figma decrement · increment 칸(좌우 여백) 안의 Button type=iconPlain. 칸 전체를 누를 수 있게 여백을 버튼에 준다 */
function StepButton({ icon, label, size, off, onClick }: { icon: string; label: string; size: 'large' | 'medium' | 'small'; off: boolean; onClick: () => void }) {
  return (
    <Button
      type="iconPlain"
      size={size === 'small' ? 'small' : 'medium'}
      icon={icon}
      label={label}
      tabIndex={-1}
      disabled={off}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{ alignSelf: 'stretch', boxSizing: 'content-box', height: 'auto', padding: `0 ${tok(`stepper-${size}-step-button-space-padding-x`)}` }}
    />
  );
}

export function Stepper({ value, defaultValue = 1, onChange, min = -Infinity, max = Infinity, step = 1, size = 'large', importance = 'none', invalid, state, label = 'Label', showLabel = false, helperText = 'HelperText', showHelperText = false, showFocus = false, width, disabled, readOnly, id, className, style, onKeyDown, onBlur, ...input }: StepperProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const n = value ?? inner;
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(n);
  const clamp = (x: number) => Math.min(max, Math.max(min, x));
  const set = (x: number) => {
    const next = clamp(x);
    if (value === undefined) setInner(next);
    if (next !== n) onChange?.(next);
  };
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const ro = readOnly || state === 'readOnly';
  const look = fieldLook({ state: state as FieldState | undefined, disabled: off, readOnly: ro, focused: it.focused, hover: it.hover, hasValue: true });
  const bad = bool(invalid);
  const c = fieldColors(look, importance, bad);
  const locked = off || ro;
  const commit = () => {
    if (draft === null) return;
    const x = Number(draft);
    if (draft.trim() !== '' && Number.isFinite(x)) set(x);
    setDraft(null);
  };

  return (
    <FieldFrame
      name="stepper"
      id={fid}
      width={width ?? 'auto'}
      label={label}
      showLabel={showLabel}
      importance={importance}
      helperText={helperText}
      showHelperText={showHelperText}
      invalid={bad}
      look={look}
      ringRadius={tok(`stepper-${size}-focus-ring-radius`)}
      showRing={showFocus || it.focusVisible}
      className={className}
      style={{ minWidth: 0, ...style }}
      pointer={it.pointer}
    >
      <div
        style={{
          flex: width === undefined ? '0 0 auto' : '1 1 0',
          minWidth: 0,
          height: tok(`stepper-${size}-size-height`),
          display: 'flex',
          alignItems: 'center',
          borderRadius: tok('stepper-radius'),
          background: c.background,
          boxShadow: `inset 0 0 0 ${tok('stepper-border-width')} ${c.border}`,
          outline: c.ring,
          ...TEXT[size],
          fontVariantNumeric: 'tabular-nums',
          color: c.text,
        }}
      >
        <StepButton icon="line/minus" label="줄이기" size={size} off={locked || n <= min} onClick={() => set(n - step)} />
        <span style={{ flex: width === undefined ? '0 0 auto' : '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'center', padding: `0 ${tok(`stepper-${size}-input-space-padding-x`)}` }}>
          <input
            {...input}
            id={fid}
            type="text"
            inputMode="numeric"
            role="spinbutton"
            aria-valuenow={n}
            aria-valuemin={Number.isFinite(min) ? min : undefined}
            aria-valuemax={Number.isFinite(max) ? max : undefined}
            aria-invalid={c.error || undefined}
            aria-required={importance === 'required' || undefined}
            aria-describedby={showHelperText ? `${fid}-help` : undefined}
            value={text}
            disabled={off}
            readOnly={ro}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9.-]/g, ''))}
            onKeyDown={(e) => {
              if (!locked && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                setDraft(null);
                set(n + (e.key === 'ArrowUp' ? step : -step));
              } else if (e.key === 'Enter') commit();
              onKeyDown?.(e);
            }}
            onFocus={it.focus.onFocus}
            onBlur={(e) => {
              commit();
              it.focus.onBlur();
              onBlur?.(e);
            }}
            style={{ ...bareInput, width: width === undefined ? `${Math.max(1, text.length)}ch` : '100%', textAlign: 'center', cursor: off ? 'not-allowed' : undefined }}
          />
        </span>
        <StepButton icon="line/plus" label="늘리기" size={size} off={locked || n >= max} onClick={() => set(n + step)} />
      </div>
    </FieldFrame>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Stepper.meta = { texts: { label: 'Label', helperText: 'HelperText' } };
