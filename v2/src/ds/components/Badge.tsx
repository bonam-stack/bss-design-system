// Badge: 상태 · 속성 · 개수처럼 바뀌는 정보를 짧게 강조한다. type 4종(basic · dot · notification · count)을 한 컴포넌트로 그린다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Badge › Badge (7261:300) · type × tone × size × state × emphasis × indicator, showLeadingIcon · label · count
// 토큰: DS 컴포넌트 명세 badge-basic · badge-dotted · badge-notification · badge-counter
import type { CSSProperties, HTMLAttributes } from 'react';
import { Icon, textStyle, tok } from '../shared';

export type BadgeType = 'basic' | 'dot' | 'notification' | 'count';
export type BadgeTone = 'highlight' | 'info' | 'success' | 'danger' | 'warning' | 'attention' | 'neutral';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** basic 옅은 바탕 글자 · dot 색 점 + 글자 · notification 새 소식(N · 점) · count 숫자 */
  type?: BadgeType;
  /** basic · dot: 7종 / notification: danger만 / count: highlight · neutral (그 밖의 값은 neutral로 그린다) */
  tone?: BadgeTone;
  /** count만 large · medium · small, 나머지는 fixed (count에 fixed를 주면 large) */
  size?: 'large' | 'medium' | 'small' | 'fixed';
  /** count만 disabled가 있다 (상위 컴포넌트를 쓸 수 없을 때) */
  state?: 'default' | 'disabled';
  /** count만: strong 채움 · subtle 옅은 바탕 */
  emphasis?: 'strong' | 'subtle';
  /** notification만: new(N 글자) · dot(점) */
  indicator?: 'new' | 'dot';
  /** basic만: 앞 아이콘 */
  showLeadingIcon?: boolean;
  /** basic · dot 글자 */
  label?: string;
  /** count 숫자 */
  count?: string;
  /** 앞 아이콘 이름 (icons/svg 아래, 예: line/info) */
  leadingIcon?: string;
}

const base: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box', whiteSpace: 'nowrap', verticalAlign: 'middle' };

export function Badge({ type = 'basic', tone = 'highlight', size = 'fixed', state = 'default', emphasis = 'strong', indicator = 'new', showLeadingIcon = false, label = 'Badge', count = '0', leadingIcon = 'line/info', style, ...rest }: BadgeProps) {
  if (type === 'dot') {
    return (
      <span {...rest} style={{ ...base, height: tok('badge-dotted-size-height'), gap: tok('badge-dotted-space-gap'), color: tok('badge-dotted-color-fg-default'), ...style }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: tok('badge-dotted-dot-size-width'), height: tok('badge-dotted-dot-size-height'), borderRadius: tok('badge-dotted-dot-radius'), background: tok(`badge-dotted-${tone}-dot-color-bg-default`) }} />
        <span style={textStyle('font-label-14-600')}>{label}</span>
      </span>
    );
  }

  if (type === 'notification') {
    if (indicator === 'dot') {
      return (
        <span
          role="img"
          aria-label={rest['aria-label'] ?? 'New'}
          {...rest}
          style={{ ...base, width: tok('badge-notification-dot-size-width'), height: tok('badge-notification-dot-size-height'), borderRadius: tok('badge-notification-radius'), background: tok('badge-notification-color-bg-default'), ...style }}
        />
      );
    }
    return (
      <span
        {...rest}
        style={{
          ...base,
          height: tok('badge-notification-size-height'),
          minWidth: tok('badge-notification-size-min-width'),
          padding: `0 ${tok('badge-notification-space-padding-x')}`,
          borderRadius: tok('badge-notification-radius'),
          background: tok('badge-notification-color-bg-default'),
          color: tok('badge-notification-color-fg-default'),
          ...textStyle('font-caption-12-500'),
          ...style,
        }}
      >
        N
      </span>
    );
  }

  if (type === 'count') {
    const sz = size === 'fixed' ? 'large' : size;
    const t = tone === 'highlight' ? 'highlight' : 'neutral';
    const pre = `badge-counter-${t}${emphasis === 'subtle' ? '-subtle' : ''}`;
    const st = state === 'disabled' ? 'disabled' : 'default';
    return (
      <span
        {...rest}
        aria-disabled={state === 'disabled' || undefined}
        style={{
          ...base,
          height: tok(`badge-counter-${sz}-size-height`),
          minWidth: tok(`badge-counter-${sz}-size-min-width`),
          padding: `0 ${tok(`badge-counter-${sz}-space-padding-x`)}`,
          borderRadius: tok('badge-counter-radius'),
          background: tok(`${pre}-color-bg-${st}`),
          color: tok(`${pre}-color-fg-${st}`),
          ...textStyle(sz === 'large' ? 'font-label-14-500' : 'font-label-12-500'),
          ...style,
        }}
      >
        {count}
      </span>
    );
  }

  // basic
  return (
    <span
      {...rest}
      style={{
        ...base,
        height: tok('badge-basic-size-height'),
        padding: `0 ${tok('badge-basic-space-padding-x')}`,
        gap: tok('badge-basic-space-gap'),
        borderRadius: tok('badge-basic-radius'),
        background: tok(`badge-basic-${tone}-color-bg-default`),
        color: tok(`badge-basic-${tone}-color-fg-default`),
        ...style,
      }}
    >
      {showLeadingIcon ? <Icon name={leadingIcon} size={tok('badge-basic-icon-size')} /> : null}
      <span style={textStyle('font-label-12-600')}>{label}</span>
    </span>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Badge.meta = { texts: { label: 'Badge', count: '0' } };
