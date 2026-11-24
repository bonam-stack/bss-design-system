// HelperText: 입력 칸 아래의 도움말 · 오류 문구, 글자 수 표시.
// Figma: BSS DS Library v2.0 ❖ HelperText (state default · error, showLeadingIcon · showCount · message)
import type { CSSProperties } from 'react';
import { Icon, font, tok, tokState } from '../shared';

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
  const color = tokState(`helper-text-color-fg`, state);
  const text = font('caption', 12, 400);
  return (
    <div id={id} className={className} role={state === 'error' ? 'alert' : undefined} style={{ display: 'flex', alignItems: 'flex-start', gap: tok('helper-text-space-gap'), width: 135 /* Figma 예시 너비 (레이아웃) */, minHeight: tok('font-caption-12-400-line-height'), ...style }}>
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'flex-start' }}>
        {showLeadingIcon ? (
          <span style={{ display: 'flex', paddingTop: tok('helper-text-icon-space-padding-top'), minHeight: tok('font-caption-12-400-line-height') }}>
            <Icon name="line/asterisk" size={tok('helper-text-icon-size')} color={color} />
          </span>
        ) : null}
        <span style={{ ...text, flex: '1 1 0', minWidth: 0, color, overflowWrap: 'anywhere' }}>{message}</span>
      </div>
      {showCount ? (
        <span style={{ ...text, display: 'flex', gap: tok('helper-text-count-space-gap'), color: state === 'error' || (max !== undefined && count > max) ? tok('helper-text-count-color-fg-error') : tok('helper-text-count-color-fg-default'), whiteSpace: 'nowrap' }}>
          <span>{count}</span>
          <span>/</span>
          <span>{max ?? '-'}</span>
        </span>
      ) : null}
    </div>
  );
}

HelperText.meta = { texts: { message: 'HelperText' } };
