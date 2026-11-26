// Modal: 화면 위에 레이어로 열려 정보 입력 · 수정 · 상세 확인 같은 별도 작업을 하게 하는 창. 제목 + 닫기 · content 슬롯 · 아래 버튼 영역.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Modal › Modal (3863:861) · size 3 (small 720 · medium 960 · large 1280), showClose · showAction, title, 슬롯 content · leadingActions · trailingActions
// 토큰: DS 컴포넌트 명세 modal (overlay-* 공통 바탕 · 모서리 · 여백, modal-<size>-size-width, modal-content/footer-space-gap, modal-shadow)
// 포털 미리보기 안에 보이도록 화면에 고정(fixed · portal)하지 않고 제자리에 그린다. 뒤 배경(Dim)은 showBackdrop으로 함께 그린다.
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { useId } from 'react';
import { Button } from './Button';
import { textStyle, tok } from '../shared';

export type ModalSize = 'small' | 'medium' | 'large';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  size?: ModalSize;
  /** 제목 오른쪽 닫기 버튼 */
  showClose?: boolean;
  /** 아래 버튼 영역(leadingActions · trailingActions) */
  showAction?: boolean;
  title?: string;
  /** Figma content 슬롯 (기본: 내용 자리 표시) */
  content?: ReactNode;
  /** Figma leadingActions 슬롯: 아래 왼쪽 버튼 */
  leadingActions?: ReactNode;
  /** Figma trailingActions 슬롯: 아래 오른쪽 버튼 (기본: secondary · primary 버튼) */
  trailingActions?: ReactNode;
  /** 닫기 버튼 · Esc */
  onClose?: () => void;
  /** 뒤 배경(Dim)을 함께 그린다 (Figma 컴포넌트에는 없고 Usage Examples 배경) */
  showBackdrop?: boolean;
}

/** Figma _ContentPlaceholder: 슬롯에 넣을 내용 자리 */
export function ContentPlaceholder({ label = 'Contents Area', minHeight, style }: { label?: string; minHeight?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        width: '100%',
        minHeight,
        flex: 1,
        border: `${tok('border-width-thin')} dashed ${tok('color-border-neutral-strong')}`,
        borderRadius: tok('radius-small'),
        background: tok('color-bg-neutral-faint'),
        color: tok('color-fg-neutral-muted-default'),
        ...textStyle('label-14-500'),
        ...style,
      }}
    >
      {label}
    </div>
  );
}

/** 모달 · 다이얼로그 뒤 배경(Dim): overlay-backdrop-color-bg-default. on이 아니면 그대로 돌려준다 */
export function OverlayBackdrop({ on, children }: { on: boolean; children: ReactNode }) {
  if (!on) return <>{children}</>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', width: '100%', padding: tok('space-24'), background: tok('overlay-backdrop-color-bg-default') }}>
      {children}
    </div>
  );
}

/** 오버레이 공통 상자 (overlay-* 바탕 · 모서리 · 여백 · 간격) */
export const overlayBox: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  maxWidth: '100%',
  gap: tok('overlay-space-gap'),
  padding: `${tok('overlay-space-padding-y')} ${tok('overlay-space-padding-x')}`,
  borderRadius: tok('overlay-radius'),
  background: tok('overlay-color-bg-default'),
};

/** 오버레이 제목 글자 (overlay-title, heading/20/700) */
export const overlayTitle: CSSProperties = { ...textStyle('heading-20-700'), flex: 1, minWidth: 0, margin: 0, color: tok('overlay-title-color-fg-default') };

/** 제목 옆 닫기 버튼 (button-iconOnly plain large, 28 상자 안) */
export function OverlayClose({ className, onClose }: { className: string; onClose?: () => void }) {
  return (
    <span className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: tok('size-28'), height: tok('size-28') }}>
      <Button type="iconPlain" size="large" icon="line/close" label="Close" onClick={onClose} />
    </span>
  );
}

export const escToClose = (onClose?: () => void) => (e: KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Escape' && onClose) {
    e.stopPropagation();
    onClose();
  }
};

export function Modal({ size = 'small', showClose = true, showAction = true, title = 'Title', content, leadingActions, trailingActions, onClose, showBackdrop = false, className, style, onKeyDown, ...rest }: ModalProps) {
  const titleId = useId();
  return (
    <OverlayBackdrop on={showBackdrop}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...rest}
        className={`ds-modal__root${className ? ` ${className}` : ''}`}
        onKeyDown={(e) => {
          escToClose(onClose)(e);
          onKeyDown?.(e);
        }}
        style={{ ...overlayBox, width: tok(`modal-${size}-size-width`), boxShadow: tok('modal-shadow'), ...style }}
      >
        <div className="ds-modal__contents" style={{ display: 'flex', flexDirection: 'column', gap: tok('modal-content-space-gap') }}>
          <div className="ds-modal__header" style={{ display: 'flex', alignItems: 'center', gap: tok('overlay-header-space-gap') }}>
            <h2 id={titleId} className="ds-modal__title" style={overlayTitle}>
              {title}
            </h2>
            {showClose ? <OverlayClose className="ds-modal__close" onClose={onClose} /> : null}
          </div>
          <div className="ds-modal__content" style={{ display: 'flex', flexDirection: 'column' }}>
            {content ?? <ContentPlaceholder minHeight={tok('size-274')} />}
          </div>
        </div>
        {showAction ? (
          <div className="ds-modal__footer" style={{ display: 'flex', alignItems: 'center', gap: tok('modal-footer-space-gap') }}>
            <div style={{ display: 'flex', flex: 1, gap: tok('overlay-group-space-gap') }}>{leadingActions}</div>
            <div className="ds-modal__actions" style={{ display: 'flex', gap: tok('overlay-group-space-gap') }}>
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
Modal.meta = { texts: { title: 'Title' } };
