// Alert: 꼭 알아야 할 정보를 알리고 확인 버튼 하나로만 닫는 알림 대화상자. 제목(선택) + 메시지 + primary 버튼 1개, 헤더 닫기 없음.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Alert › Alert (7414:324) · 단일 컴포넌트, showTitle, title · message
// 토큰: DS 컴포넌트 명세 alert (overlay-* 바탕 · 모서리 · 여백 · 제목/메시지 색, alert-size-width 360, alert-content-space-gap, alert-shadow, 버튼 button-action large)
// 포털 미리보기 안에 보이도록 화면에 고정(fixed · portal)하지 않고 제자리에 그린다. 뒤 배경(Dim)은 showBackdrop으로 함께 그린다.
import { useId } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from './Button';
import { OverlayBackdrop, overlayBox, overlayTitle } from './Modal';
import { textStyle, tok } from '../shared';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  showTitle?: boolean;
  title?: string;
  message?: string;
  /** 확인 버튼 글자 (내용을 인지했음을 나타내는 문구) */
  actionLabel?: string;
  /** 확인 버튼을 누를 때 (Alert은 이 버튼으로만 닫는다) */
  onConfirm?: () => void;
  /** 뒤 배경(Dim)을 함께 그린다 */
  showBackdrop?: boolean;
}

export function Alert({ showTitle = true, title = 'Title', message = 'Sample Text', actionLabel = 'Button', onConfirm, showBackdrop = false, className, style, ...rest }: AlertProps) {
  const titleId = useId();
  const msgId = useId();
  return (
    <OverlayBackdrop on={showBackdrop}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={showTitle ? titleId : undefined}
        aria-describedby={msgId}
        {...rest}
        className={`ds-alert__root${className ? ` ${className}` : ''}`}
        style={{ ...overlayBox, width: tok('alert-size-width'), boxShadow: tok('alert-shadow'), ...style }}
      >
        <div className="ds-alert__contents" style={{ display: 'flex', flexDirection: 'column', gap: tok('alert-content-space-gap') }}>
          {showTitle ? (
            <h2 id={titleId} className="ds-alert__title" style={overlayTitle}>
              {title}
            </h2>
          ) : null}
          <p id={msgId} className="ds-alert__message" style={{ ...textStyle('body-16-400'), margin: 0, color: tok('overlay-message-color-fg-default'), whiteSpace: 'pre-line' }}>
            {message}
          </p>
        </div>
        <div className="ds-alert__actions" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button variants="primary" size="large" label={actionLabel} onClick={onConfirm} />
        </div>
      </div>
    </OverlayBackdrop>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Alert.meta = { texts: { title: 'Title', message: 'Sample Text' } };
