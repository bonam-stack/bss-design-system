// Callout: 화면 안에서 계속 보여 줄 안내 · 주의 사항을 바탕색과 아이콘으로 눈에 띄게 전한다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Callout › Callout (7430:80) · tone 7 × layout 2, showLeadingIcon · showTitle · showDescription · showBackground · showClose · title · description
// 토큰: DS 컴포넌트 명세 callout-horizontal · callout-vertical (공통 callout-*, tone 색 callout-<tone>-*)
import type { HTMLAttributes } from 'react';
import { Icon, textStyle, tok } from '../shared';
import { Button } from './Button';

export type CalloutTone = 'neutral' | 'info' | 'success' | 'attention' | 'warning' | 'danger' | 'highlight';

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: CalloutTone;
  /** horizontal 제목 옆 한 줄 본문 · vertical 제목 줄 아래 본문 */
  layout?: 'horizontal' | 'vertical';
  showLeadingIcon?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  /** horizontal에서만 끌 수 있다 (vertical은 바탕을 늘 둔다) */
  showBackground?: boolean;
  showClose?: boolean;
  title?: string;
  description?: string;
  /** 닫기 버튼을 눌렀을 때 */
  onClose?: () => void;
}

// Figma ColorIconSlot: tone별 filled 아이콘 (색은 callout-<tone>-icon-color-fg-default)
const ICON: Record<CalloutTone, string> = {
  neutral: 'filled/info',
  info: 'filled/info',
  success: 'filled/success',
  attention: 'filled/info',
  warning: 'filled/warning',
  danger: 'filled/danger',
  highlight: 'filled/info',
};

export function Callout({ tone = 'neutral', layout = 'horizontal', showLeadingIcon = true, showTitle = true, showDescription = true, showBackground = true, showClose = true, title = 'Title', description = 'Description', onClose, style, ...rest }: CalloutProps) {
  const vertical = layout === 'vertical';
  const bg = vertical || showBackground;
  const titleEl = showTitle ? <span style={{ ...textStyle('font-label-15-600'), color: tok('callout-title-color-fg-default'), flexShrink: 0 }}>{title}</span> : null;

  return (
    <div
      role="note"
      data-tone={tone}
      {...rest}
      style={{
        display: 'flex',
        alignItems: vertical ? 'flex-start' : 'center',
        gap: tok('callout-space-gap'),
        boxSizing: 'border-box',
        width: '100%',
        padding: `${tok('callout-space-padding-y')} ${tok(vertical ? 'callout-vertical-space-padding-x' : 'callout-horizontal-space-padding-x')}`,
        borderRadius: tok('callout-radius'),
        background: bg ? tok(`callout-${tone}-color-bg-default`) : 'transparent',
        ...style,
      }}
    >
      {showLeadingIcon ? (
        <span style={{ display: 'flex', alignItems: 'center', minHeight: vertical ? tok('font-label-15-600-line-height') : undefined }}>
          <Icon name={ICON[tone]} size={tok('callout-icon-size')} color={tok(`callout-${tone}-icon-color-fg-default`)} />
        </span>
      ) : null}
      {vertical ? (
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: tok('callout-vertical-content-space-gap') }}>
          {titleEl}
          {showDescription ? (
            <span style={{ ...textStyle('font-label-14-400'), color: tok('callout-vertical-message-color-fg-default'), paddingTop: showTitle ? tok('callout-vertical-message-space-padding-top') : 0, overflowWrap: 'anywhere' }}>{description}</span>
          ) : null}
        </div>
      ) : (
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: tok('callout-horizontal-title-space-gap') }}>
          {titleEl}
          {showDescription ? (
            <span style={{ ...textStyle('font-label-14-400'), color: tok('callout-horizontal-message-color-fg-default'), flex: '1 1 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</span>
          ) : null}
        </div>
      )}
      {showClose ? <Button type="iconPlain" size="large" icon="line/close" label="닫기" onClick={onClose} /> : null}
    </div>
  );
}

Callout.meta = { texts: { title: 'Title', description: 'Description' } };
