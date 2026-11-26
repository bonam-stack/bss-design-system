// Dialog: 저장 · 삭제처럼 사용자의 결정을 받는 확인 대화상자. 헤더(제목 · 닫기)(선택) + 메시지 + 버튼 2개(보조 버튼 선택).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Dialog › Dialog (4224:36893) · showHeader · showTitle · showClose · showAction · showSecondaryAction, title · message
// 토큰: DS 컴포넌트 명세 dialog (overlay-* 바탕 · 모서리 · 여백 · 제목/메시지 색, dialog-size-width 360, dialog-header/content-space-gap, overlay-group-space-gap, dialog-shadow, 버튼 button-action xlarge)
// 포털 미리보기 안에 보이도록 화면에 고정(fixed · portal)하지 않고 제자리에 그린다. 뒤 배경(Dim)은 showBackdrop으로 함께 그린다.
import { useId } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from './Button';
import { OverlayBackdrop, OverlayClose, escToClose, overlayBox, overlayTitle } from './Modal';
import { textStyle, tok } from '../shared';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 제목 · 닫기가 놓이는 위 영역. 끄면 제목 · 닫기를 모두 숨긴다 */
  showHeader?: boolean;
  /** 끄면 제목 없이 닫기 버튼만 둔다 */
  showTitle?: boolean;
  showClose?: boolean;
  /** 아래 버튼 영역 */
  showAction?: boolean;
  /** 취소처럼 결정을 미루는 보조 버튼 */
  showSecondaryAction?: boolean;
  title?: string;
  message?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** 주 버튼 색: 일반 작업 primary, 삭제 · 해지처럼 되돌릴 수 없는 작업 danger */
  primaryVariants?: 'primary' | 'danger';
  onPrimary?: () => void;
  onSecondary?: () => void;
  /** 닫기 버튼 · Esc */
  onClose?: () => void;
  /** 뒤 배경(Dim)을 함께 그린다 */
  showBackdrop?: boolean;
}

export function Dialog({ showHeader = true, showTitle = true, showClose = true, showAction = true, showSecondaryAction = true, title = 'Title', message = 'Sample Text', primaryLabel = 'Button', secondaryLabel = 'Button', primaryVariants = 'primary', onPrimary, onSecondary, onClose, showBackdrop = false, className, style, onKeyDown, ...rest }: DialogProps) {
  const titleId = useId();
  const msgId = useId();
  const hasTitle = showHeader && showTitle;
  return (
    <OverlayBackdrop on={showBackdrop}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={msgId}
        {...rest}
        className={`ds-dialog__root${className ? ` ${className}` : ''}`}
        onKeyDown={(e) => {
          escToClose(onClose)(e);
          onKeyDown?.(e);
        }}
        style={{ ...overlayBox, width: tok('dialog-size-width'), boxShadow: tok('dialog-shadow'), ...style }}
      >
        <div className="ds-dialog__contents" style={{ display: 'flex', flexDirection: 'column', gap: tok('dialog-content-space-gap') }}>
          {showHeader && (showTitle || showClose) ? (
            <div className="ds-dialog__header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', gap: tok('dialog-header-space-gap') }}>
              {showTitle ? (
                <h2 id={titleId} className="ds-dialog__title" style={overlayTitle}>
                  {title}
                </h2>
              ) : null}
              {showClose ? <OverlayClose className="ds-dialog__close" onClose={onClose} /> : null}
            </div>
          ) : null}
          <p id={msgId} className="ds-dialog__message" style={{ ...textStyle('body-16-400'), margin: 0, color: tok('overlay-message-color-fg-default'), whiteSpace: 'pre-line' }}>
            {message}
          </p>
        </div>
        {showAction ? (
          <div className="ds-dialog__actions" style={{ display: 'flex', alignItems: 'center', gap: tok('overlay-group-space-gap') }}>
            {showSecondaryAction ? <Button className="ds-dialog__secondaryAction" appearance="base" size="xlarge" label={secondaryLabel} onClick={onSecondary} style={{ flex: 1 }} /> : null}
            <Button className="ds-dialog__primaryAction" appearance={primaryVariants} size="xlarge" label={primaryLabel} onClick={onPrimary} style={{ flex: 1 }} />
          </div>
        ) : null}
      </div>
    </OverlayBackdrop>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Dialog.meta = { texts: { title: 'Title', message: 'Sample Text' } };
