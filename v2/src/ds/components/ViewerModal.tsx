// ViewerModal: 문서 · 이미지를 크게 보는 뷰어 모달. 제목 + 닫기 · 표시 영역(content 슬롯, 떠 있는 툴바 · 스크롤바) · 아래 버튼 영역.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Modal › ViewerModal (3863:862) · showClose · showAction · showLeadingToolbar · showTrailingToolbar · showScrollbar, title,
//        슬롯 content · leadingActions · trailingActions · leadingToolbar · trailingToolbar / 부품 _Item/ViewerModal/Toolbar (3865:800) type actions · page, currentPage · totalPages
// 토큰: DS 컴포넌트 명세 viewerModal (overlay-* 공통, viewer-modal-size-width 1280, viewer-modal-viewport/toolbar/current/separator-*, viewer-modal-shadow, 툴바 버튼 button-iconOnly plain medium, 스크롤바 scrollbar large)
// 포털 미리보기 안에 보이도록 화면에 고정(fixed · portal)하지 않고 제자리에 그린다.
import { useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Button } from './Button';
import { Scrollbar, scrollbarOverlay } from './Scrollbar';
import { ContentPlaceholder, OverlayBackdrop, OverlayClose, escToClose, overlayBox, overlayTitle } from './Modal';
import { textStyle, tok } from '../shared';

export interface ViewerModalToolbarProps {
  /** actions: 확대 · 축소 등 보기 동작 버튼 / page: 쪽 이동 · 쪽 표시 */
  type?: 'actions' | 'page';
  currentPage?: string;
  totalPages?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onFullscreen?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** _Item/ViewerModal/Toolbar: 뷰어 위에 떠 있는 툴바 */
export function ViewerModalToolbar({ type = 'actions', currentPage = '1', totalPages = '1', onZoomIn, onZoomOut, onFit, onFullscreen, onPrev, onNext, className, style }: ViewerModalToolbarProps) {
  const box: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: tok('viewer-modal-toolbar-size-height'),
    padding: `0 ${tok('viewer-modal-toolbar-space-padding-x')}`,
    gap: tok('viewer-modal-toolbar-space-gap'),
    borderRadius: tok('viewer-modal-toolbar-radius'),
    background: tok('viewer-modal-toolbar-color-bg-default'),
    boxShadow: tok('viewer-modal-toolbar-shadow'),
    ...style,
  };
  if (type === 'actions') {
    return (
      <div role="toolbar" aria-label="View" className={className} style={box}>
        <Button type="iconPlain" size="medium" icon="line/plus" label="Zoom in" onClick={onZoomIn} />
        <Button type="iconPlain" size="medium" icon="line/minus" label="Zoom out" onClick={onZoomOut} />
        <Button type="iconPlain" size="medium" icon="line/expand" label="Fit" onClick={onFit} />
        <Button type="iconPlain" size="medium" icon="line/fullscreen" label="Fullscreen" onClick={onFullscreen} />
      </div>
    );
  }
  const num: CSSProperties = { display: 'flex', justifyContent: 'center', minWidth: tok('size-20'), boxSizing: 'border-box', padding: `0 ${tok('viewer-modal-value-space-padding-x')}` };
  return (
    <div role="toolbar" aria-label="Page" className={className} style={box}>
      <Button type="iconPlain" size="medium" icon="line/chevron-left" label="Previous page" onClick={onPrev} />
      <span style={{ display: 'flex', alignItems: 'center', ...textStyle('label-13-500') }}>
        <span aria-current="page" style={{ ...num, color: tok('viewer-modal-current-toolbar-color-fg-default') }}>
          {currentPage}
        </span>
        <span aria-hidden="true" style={{ color: tok('viewer-modal-separator-color-fg-default') }}>
          /
        </span>
        <span style={{ ...num, color: tok('viewer-modal-toolbar-color-fg-default') }}>{totalPages}</span>
      </span>
      <Button type="iconPlain" size="medium" icon="line/chevron-right" label="Next page" onClick={onNext} />
    </div>
  );
}

export interface ViewerModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  showClose?: boolean;
  showAction?: boolean;
  /** 표시 영역 왼쪽 위 툴바 (기본: actions 툴바) */
  showLeadingToolbar?: boolean;
  /** 표시 영역 오른쪽 위 툴바 (기본: page 툴바) */
  showTrailingToolbar?: boolean;
  showScrollbar?: boolean;
  title?: string;
  /** page 툴바의 현재 쪽 · 전체 쪽 */
  currentPage?: string;
  totalPages?: string;
  /** Figma content 슬롯: 문서 · 이미지 */
  content?: ReactNode;
  leadingActions?: ReactNode;
  trailingActions?: ReactNode;
  leadingToolbar?: ReactNode;
  trailingToolbar?: ReactNode;
  onClose?: () => void;
  /** 뒤 배경(Dim)을 함께 그린다 */
  showBackdrop?: boolean;
}

export function ViewerModal({ showClose = true, showAction = true, showLeadingToolbar = true, showTrailingToolbar = true, showScrollbar = true, title = 'Title', currentPage = '1', totalPages = '1', content, leadingActions, trailingActions, leadingToolbar, trailingToolbar, onClose, showBackdrop = false, className, style, onKeyDown, ...rest }: ViewerModalProps) {
  const titleId = useId();
  const float = (side: 'left' | 'right'): CSSProperties => ({ position: 'absolute', top: tok('space-16'), [side]: tok('space-16') });
  return (
    <OverlayBackdrop on={showBackdrop}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...rest}
        className={`ds-viewer-modal__root${className ? ` ${className}` : ''}`}
        onKeyDown={(e) => {
          escToClose(onClose)(e);
          onKeyDown?.(e);
        }}
        style={{ ...overlayBox, width: tok('viewer-modal-size-width'), boxShadow: tok('viewer-modal-shadow'), ...style }}
      >
        <div className="ds-viewer-modal__contents" style={{ display: 'flex', flexDirection: 'column', gap: tok('viewer-modal-content-space-gap') }}>
          <div className="ds-viewer-modal__header" style={{ display: 'flex', alignItems: 'center', gap: tok('overlay-header-space-gap') }}>
            <h2 id={titleId} className="ds-viewer-modal__title" style={overlayTitle}>
              {title}
            </h2>
            {showClose ? <OverlayClose className="ds-viewer-modal__close" onClose={onClose} /> : null}
          </div>
          <div className="ds-viewer-modal__viewport" style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: tok('size-360'), overflow: 'hidden', background: tok('viewer-modal-viewport-color-bg-default') }}>
            {content ?? <ContentPlaceholder style={{ background: 'transparent' }} />}
            {showLeadingToolbar ? <div className="ds-viewer-modal__leadingToolbar" style={float('left')}>{leadingToolbar ?? <ViewerModalToolbar type="actions" />}</div> : null}
            {showTrailingToolbar ? (
              <div className="ds-viewer-modal__trailingToolbar" style={float('right')}>
                {trailingToolbar ?? <ViewerModalToolbar type="page" currentPage={currentPage} totalPages={totalPages} />}
              </div>
            ) : null}
            {showScrollbar ? <Scrollbar className="ds-viewer-modal__scrollbar" direction="vertical" size="large" length="auto" style={scrollbarOverlay} /> : null}
          </div>
        </div>
        {showAction ? (
          <div className="ds-viewer-modal__footer" style={{ display: 'flex', alignItems: 'center', gap: tok('viewer-modal-footer-space-gap') }}>
            <div style={{ display: 'flex', flex: 1, gap: tok('overlay-group-space-gap') }}>{leadingActions}</div>
            <div className="ds-viewer-modal__actions" style={{ display: 'flex', gap: tok('overlay-group-space-gap') }}>
              {trailingActions ?? (
                <>
                  <Button appearance="secondary" size="xlarge" label="Button" onClick={onClose} />
                  <Button appearance="primary" size="xlarge" label="Button" />
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </OverlayBackdrop>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
ViewerModal.meta = { texts: { title: 'Title', currentPage: '1', totalPages: '1' } };
