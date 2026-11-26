// SidePanel: 화면 오른쪽에 열리는 패널. 열려 있는 동안에도 뒤 화면을 계속 조작할 수 있다(뒷배경 없음).
// 머리(제목 · 배지(선택) · 닫기) + 세로로 스크롤되는 본문(content 슬롯, 스크롤바 선택) + 아래 버튼 영역(actions 슬롯).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Side Panel › SidePanel (7916:479) · showScrollbar · showBadge, title, 슬롯 content · actions
// 토큰: DS 컴포넌트 명세 sidePanel (side-panel-*, 배지 Badge basic highlight, 닫기 button-iconOnly plain medium, 스크롤바 scrollbar medium, 아래 버튼 button-action xlarge)
// 포털 미리보기 안에 보이도록 화면 오른쪽에 고정(fixed)하지 않고 제자리에 그린다. 화면에 붙이는 위치는 쓰는 쪽이 정한다.
import { useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { ContentPlaceholder, escToClose } from './Modal';
import { Scrollbar, scrollbarOverlay } from './Scrollbar';
import { textStyle, tok } from '../shared';

export interface SidePanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'content'> {
  showScrollbar?: boolean;
  /** 제목 옆 배지 */
  showBadge?: boolean;
  title?: string;
  badgeLabel?: string;
  /** Figma content 슬롯: 본문 (여백 없음, 세로 스크롤) */
  content?: ReactNode;
  /** Figma actions 슬롯: 아래 버튼 (최대 2개) */
  actions?: ReactNode;
  onClose?: () => void;
}

export function SidePanel({ showScrollbar = false, showBadge = false, title = 'Title', badgeLabel = 'Badge', content, actions, onClose, className, style, onKeyDown, ...rest }: SidePanelProps) {
  const titleId = useId();
  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      {...rest}
      className={`ds-side-panel__root${className ? ` ${className}` : ''}`}
      onKeyDown={(e) => {
        escToClose(onClose)(e);
        onKeyDown?.(e);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        width: tok('side-panel-size-width'),
        maxWidth: '100%',
        overflow: 'hidden',
        borderRadius: tok('side-panel-radius'),
        background: tok('side-panel-color-bg-default'),
        boxShadow: tok('side-panel-shadow'),
        ...style,
      }}
    >
      <div
        className="ds-side-panel__header"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: tok('side-panel-header-space-gap'),
          padding: `${tok('side-panel-header-space-padding-top')} ${tok('side-panel-header-space-padding-x')} ${tok('side-panel-header-space-padding-bottom')}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: tok('side-panel-header-space-gap') }}>
          <h2 id={titleId} className="ds-side-panel__title" style={{ ...textStyle('title-16-700'), margin: 0, color: tok('side-panel-title-color-fg-default'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </h2>
          {showBadge ? <Badge className="ds-side-panel__badge" type="basic" tone="highlight" label={badgeLabel} /> : null}
        </div>
        <Button className="ds-side-panel__close" type="iconPlain" size="medium" icon="line/close" label="Close" onClick={onClose} />
      </div>
      <div className="ds-side-panel__content" style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: tok('size-360'), overflow: 'auto' }}>
        {content ?? <ContentPlaceholder style={{ borderRadius: 0 }} />}
        {showScrollbar ? <Scrollbar className="ds-side-panel__scrollbar" direction="vertical" size="medium" length="auto" style={scrollbarOverlay} /> : null}
      </div>
      <div
        className="ds-side-panel__footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: tok('side-panel-group-space-gap'),
          padding: `${tok('side-panel-footer-space-padding-y')} ${tok('side-panel-footer-space-padding-x')}`,
          borderTop: `${tok('side-panel-footer-border-width')} solid ${tok('side-panel-footer-color-border-default')}`,
        }}
      >
        {actions ?? (
          <>
            <Button variants="base" size="xlarge" label="Button" onClick={onClose} style={{ flex: 1 }} />
            <Button variants="primary" size="xlarge" label="Button" style={{ flex: 1 }} />
          </>
        )}
      </div>
    </aside>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
SidePanel.meta = { texts: { title: 'Title' } };
