// 입력 칸 공통 (TextField · PasswordField · TextArea): 상태 판정, 칸 색, 라벨(FieldLabel), 도움말(HelperText), 포커스 링.
// Figma: 세 컴포넌트가 같은 field/* 토큰과 구조(Label → textfieldGroup[invalidBox › inputBox] → HelperText)를 쓴다.
import type { CSSProperties, ReactNode } from 'react';
import { FocusRing, tok, tokState } from './shared';
import { FieldLabel } from './components/FieldLabel';
import { HelperText } from './components/HelperText';

export type FieldState = 'default' | 'hover' | 'focus' | 'entered' | 'readOnly' | 'disabled';
export type Importance = 'none' | 'attention' | 'required';

/** 모양을 정하는 상태: 고정한 state가 있으면 그것, 없으면 실제 상태(비활성 → 읽기 전용 → 포커스 → hover → 값 있음) */
export function fieldLook(o: { state?: FieldState; disabled?: boolean; readOnly?: boolean; focused: boolean; hover: boolean; hasValue: boolean }): FieldState {
  if (o.disabled) return 'disabled';
  if (o.state && o.state !== 'default') return o.state;
  if (o.readOnly) return 'readOnly';
  if (o.focused) return 'focus';
  if (o.hover) return 'hover';
  return o.hasValue ? 'entered' : 'default';
}


/** 상태 · 중요도 · 오류에 따른 칸 색 */
export function fieldColors(look: FieldState, importance: Importance, invalid: boolean) {
  const t = look === 'entered' ? 'default' : look === 'readOnly' ? 'readonly' : look;
  const pre = importance === 'none' ? 'field' : `field-${importance}`;
  const error = invalid && ['default', 'hover', 'focus', 'entered'].includes(look);
  const bgKey = error && t === 'default' ? 'error' : t;
  const borderKey = error ? 'error' : t;
  const fgKey = t === 'hover' ? 'default' : t;
  return {
    error,
    background: tokState(`${pre}-color-bg`, bgKey),
    border: tokState(`${pre}-color-border`, borderKey),
    /** 바깥 2px 띠 (오류일 때만 보인다) */
    ring: `${tok('field-ring-border-width')} solid ${error ? tok('field-ring-color-border-error') : 'transparent'}`,
    text: tokState(`field-color-fg`, fgKey),
    placeholder: tok('field-placeholder-color-fg-default'),
  };
}

/** 입력 요소 기본 모양 지우기 */
export const bareInput: CSSProperties = { display: 'block', width: '100%', minWidth: 0, margin: 0, padding: 0, border: 0, outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit', letterSpacing: 'inherit' };

/** 라벨 · 칸 · 도움말을 세로로 쌓는 바깥 틀 */
export function FieldFrame(p: {
  /** 토큰 앞자리: text-field · password-field · text-area */
  name: string;
  id: string;
  width: number | string;
  /** 최소 너비 (기본: 예시 레이아웃 120 = size-40 × 3). 좁은 자리에 넣을 때 0 등으로 줄인다 */
  minWidth?: number | string;
  label?: string;
  showLabel: boolean;
  importance: Importance;
  helperText?: string;
  showHelperText: boolean;
  invalid: boolean;
  look: FieldState;
  count?: { count: number; max?: number };
  ringRadius: string;
  showRing: boolean;
  className?: string;
  style?: CSSProperties;
  pointer: Record<string, () => void>;
  children: ReactNode;
}) {
  const helperError = p.invalid && ['default', 'hover', 'focus', 'entered'].includes(p.look);
  return (
    <div className={p.className} style={{ display: 'inline-flex', flexDirection: 'column', gap: tok(`${p.name}-label-space-gap`), width: p.width, minWidth: p.minWidth ?? `calc(${tok('size-40')} * 3)`, ...p.style }}>
      {p.showLabel && p.label ? (
        <FieldLabel htmlFor={p.id} emphasis="strong" showRequired={p.importance === 'required'}>
          {p.label}
        </FieldLabel>
      ) : null}
      <div style={{ position: 'relative', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: tok(`${p.name}-helper-space-gap`) }}>
        <div {...p.pointer} style={{ position: 'relative', display: 'flex' }}>
          {p.children}
          {p.showRing ? <FocusRing radius={p.ringRadius} /> : null}
        </div>
        {p.showHelperText && p.helperText ? (
          <HelperText id={`${p.id}-help`} state={helperError ? 'error' : 'default'} message={p.helperText} showCount={!!p.count} count={p.count?.count} max={p.count?.max} style={{ width: 'auto', alignSelf: 'stretch' }} />
        ) : null}
      </div>
    </div>
  );
}
