// Accordion: 제목 줄(머리)을 눌러 내용을 펼치고 접는다. 머리는 실제 <button aria-expanded>다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Accordion / Collapse › Accordion (8544:2786) · type 3 × size × listState 2, content 슬롯
//        머리 _Item/Accordion/Header (9843:1138) · state 4, showFocus · showBadge · title
// 토큰: DS 컴포넌트 명세 accordion-basic · accordion-compact · accordion-text (공통 accordion-color-* · accordion-header-color-*)
import { useId, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { FocusRing, Icon, textStyle, tok, tokState, useInteraction } from '../shared';
import { Badge } from './Badge';

export type AccordionListState = 'collapsed' | 'expanded';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** basic 기본 · compact 좌우 여백 없음 · text 바탕 · 구분선 없는 글자형 */
  type?: 'basic' | 'compact' | 'text';
  /** basic: large · medium / compact · text: fixed (맞지 않는 값은 고쳐 그린다) */
  size?: 'large' | 'medium' | 'fixed';
  /** 펼침 상태. 주면 제어 컴포넌트 (onListStateChange로 새 값을 받는다) */
  listState?: AccordionListState;
  defaultListState?: AccordionListState;
  onListStateChange?: (listState: AccordionListState) => void;
  /** 머리 모양을 이 상태로 고정 (문서 예시용) */
  state?: 'default' | 'hover' | 'pressed' | 'disabled';
  /** 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  showBadge?: boolean;
  title?: string;
  /** 배지 글자 (showBadge) */
  badgeLabel?: string;
  /** 머리를 열 수 없게 (state disabled와 같다) */
  disabled?: boolean;
  /** content 슬롯: 펼쳤을 때 보이는 내용 */
  children?: ReactNode;
}

const TITLE = { 'basic-large': 'font-title-16-700', 'basic-medium': 'font-title-14-700', compact: 'font-label-14-600', text: 'font-label-14-400' };

export function Accordion({ type = 'basic', size = 'large', listState, defaultListState = 'collapsed', onListStateChange, state, showFocus = false, showBadge = false, title = 'Title', badgeLabel = 'Badge', disabled, children, style, ...rest }: AccordionProps) {
  const [inner, setInner] = useState<AccordionListState>(defaultListState);
  const value = listState ?? inner;
  const open = value === 'expanded';
  const it = useInteraction();
  const id = useId();
  const off = disabled || state === 'disabled';
  const look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const sz = type === 'basic' ? (size === 'medium' ? 'medium' : 'large') : 'fixed';
  const pre = type === 'basic' ? `accordion-basic-${sz}` : `accordion-${type}`;
  const fg = type === 'text' ? tokState('accordion-text-header-color-fg', look) : tokState('accordion-header-color-fg', look);
  const titleStyle = textStyle(type === 'basic' ? TITLE[`basic-${sz as 'large' | 'medium'}`] : TITLE[type]);
  const toggle = () => {
    if (off) return;
    const next: AccordionListState = open ? 'collapsed' : 'expanded';
    if (listState === undefined) setInner(next);
    onListStateChange?.(next);
  };

  const header: CSSProperties =
    type === 'text'
      ? { display: 'inline-flex', alignItems: 'center', gap: tok('accordion-text-header-space-gap'), background: 'transparent' }
      : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: tok(`${pre}-size-height`),
          padding: type === 'basic' ? `0 ${tok(`${pre}-space-padding-x`)}` : 0,
          gap: tok(type === 'basic' ? 'accordion-basic-header-space-gap' : 'accordion-compact-header-space-gap'),
          background: tokState('accordion-header-color-bg', look),
        };

  const content: CSSProperties | null =
    type === 'basic'
      ? { padding: `${tok('accordion-basic-space-gap')} ${tok(`${pre}-space-padding-x`)} ${tok(`${pre}-content-space-padding-bottom`)}` }
      : type === 'compact'
        ? { padding: `${tok('accordion-compact-space-gap')} 0 ${tok('accordion-compact-content-space-padding-bottom')}` }
        : null;

  return (
    <div
      {...rest}
      style={{
        display: type === 'text' ? 'inline-flex' : 'block',
        flexDirection: 'column',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        width: type === 'text' ? undefined : '100%',
        background: type === 'text' ? undefined : tok('accordion-color-bg-default'),
        borderBottom: type === 'text' ? undefined : `${tok('accordion-border-width')} solid ${tok('accordion-color-border-default')}`,
        ...style,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        disabled={off}
        onClick={toggle}
        {...it.pointer}
        {...it.focus}
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          margin: 0,
          border: 0,
          outline: 'none',
          font: 'inherit',
          textAlign: 'left',
          color: fg,
          cursor: off ? 'not-allowed' : 'pointer',
          WebkitTapHighlightColor: 'transparent',
          ...(type === 'text' ? { padding: 0 } : {}),
          ...header,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: tok('accordion-title-space-gap'), minWidth: 0 }}>
          <span style={{ ...titleStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          {showBadge ? <Badge type="basic" tone="highlight" label={badgeLabel} /> : null}
        </span>
        <Icon name={open ? 'line/chevron-up' : 'line/chevron-down'} size={tok(`${pre}-icon-size`)} color={fg} />
        {showFocus || it.focusVisible ? <FocusRing radius={tok('focus-ring-radius')} /> : null}
      </button>
      {open && (content || children) ? (
        <div id={`${id}-content`} role="region" style={{ boxSizing: 'border-box', width: '100%', ...(content ?? {}) }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

Accordion.meta = { texts: { title: 'Title', badgeLabel: 'Badge' } };
