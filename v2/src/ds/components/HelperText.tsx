// HelperText: 입력 칸 아래의 도움말 · 오류 문구, 글자 수 표시.
// Figma: BSS DS Library v2.0 ❖ HelperText (state default · error, showLeadingIcon · showCount · message)
import type { CSSProperties } from 'react';
import { Icon, font, tok } from '../shared';

export interface HelperTextProps {
  state?: 'default' | 'error';
  message?: string;
  showLeadingIcon?: boolean;
  showCount?: boolean;
  /** 지금 글자 수 · 최대 글자 수 (showCount) */
  count?: number;
  max?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export function HelperText({ state = 'default', message = 'HelperText', showLeadingIcon = true, showCount = false, count = 0, max, id, className, style }: HelperTextProps) {
  const color = tok(`helper-text-color-fg-${state}`, state === 'error' ? '#ED3B3E' : '#697582');
  const text = font('caption', 12, 400);
  return (
    <div id={id} className={className} role={state === 'error' ? 'alert' : undefined} style={{ display: 'flex', alignItems: 'flex-start', gap: tok('helper-text-space-gap', 4), width: 135, minHeight: 16, ...style }}>
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'flex-start' }}>
        {showLeadingIcon ? (
          <span style={{ display: 'flex', paddingTop: tok('helper-text-icon-space-padding-top', 2), minHeight: 16 }}>
            <Icon name="line/asterisk" size={tok('helper-text-icon-size', 12)} color={color} />
          </span>
        ) : null}
        <span style={{ ...text, flex: '1 1 0', minWidth: 0, color, overflowWrap: 'anywhere' }}>{message}</span>
      </div>
      {showCount ? (
        <span style={{ ...text, display: 'flex', gap: tok('helper-text-count-space-gap', 2), color: tok('helper-text-count-color-fg-default', '#697582'), whiteSpace: 'nowrap' }}>
          <span>{count}</span>
          <span>/</span>
          <span>{max ?? '-'}</span>
        </span>
      ) : null}
    </div>
  );
}

HelperText.meta = { texts: { message: 'HelperText' } };
