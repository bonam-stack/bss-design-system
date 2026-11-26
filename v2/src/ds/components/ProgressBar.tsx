// ProgressBar: 작업 진행률을 가로 막대로 보여 준다. 트랙 위에 진행률만큼 채움 막대(indicator)가 찬다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Progress Bar › ProgressBar (8980:137) · value 0·25·50·75·100 × status 4 (completed는 100만)
// 토큰: DS 컴포넌트 명세 progressBar (status stopped → 상태 disabled, completed → progressBar-completed-*)
import type { HTMLAttributes } from 'react';
import { tok, tokState } from '../shared';

export type ProgressBarStatus = 'default' | 'error' | 'completed' | 'stopped';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 진행률 0~100 (Figma 변형은 0 · 25 · 50 · 75 · 100) */
  value?: number | '0' | '25' | '50' | '75' | '100';
  status?: ProgressBarStatus;
  /** 보조기기에 읽어 줄 이름 (화면의 Label이 없을 때도 지정) */
  label?: string;
}

export function ProgressBar({ value = 0, status = 'default', label = 'Progress', style, ...rest }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const fill = status === 'completed' ? tok('progress-bar-completed-indicator-color-bg-default') : tokState('progress-bar-indicator-color-bg', status === 'stopped' ? 'disabled' : status);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-invalid={status === 'error' || undefined}
      data-state={status === 'error' ? 'error' : status === 'stopped' ? 'disabled' : undefined}
      {...rest}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: tok('progress-bar-size-height'),
        borderRadius: tok('progress-bar-radius'),
        background: tok('progress-bar-track-color-bg-default'),
        ...style,
      }}
    >
      {v > 0 ? <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, borderRadius: tok('progress-bar-radius'), background: fill }} /> : null}
    </div>
  );
}

ProgressBar.meta = { texts: {} };
