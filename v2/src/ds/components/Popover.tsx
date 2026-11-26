// Popover: 트리거를 누르면 열리는 패널. 머리(제목 · 닫기) + 내용(content 슬롯, 선택) + 아래 버튼(footer 슬롯, 선택) + 화살표(선택).
// Figma: BSS_DS_Library_Component_v2.0 ❖ Tooltip / Popover › Popover (7324:3459) · placement 4, showClose · showContent · showFooter · showArrow, title, 슬롯 content · footer
//        내용 부품 Item/Popover/Text (9827:902) · type plain · bullet, text → PopoverText
// 토큰: DS 컴포넌트 명세 popover (popover-*, 닫기 button-iconOnly plain small, 액션 button-text accent, 글자 label/14/600 · label/14/400)
// 패널만 제자리에 그린다(portal · fixed 없음). 너비 240은 대표 너비(정책 값 아님)라 style.width로 바꿔 쓴다.
import { useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Button } from './Button';
import { ContentPlaceholder, escToClose } from './Modal';
import { OverlayArrow } from './Tooltip';
import type { OverlayPlacement } from './Tooltip';
import { textStyle, tok } from '../shared';

export interface PopoverTextProps {
  /** plain 문단 · bullet 목록 */
  type?: 'plain' | 'bullet';
  text?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Item/Popover/Text: Popover 내용 글 한 줄 (문단 · 글머리 점) */
export function PopoverText({ type = 'plain', text = 'Text', className, style }: PopoverTextProps) {
  const txt: CSSProperties = { ...textStyle('label-14-400'), color: tok('popover-content-color-fg-default') };
  if (type === 'plain') return <p className={className} style={{ margin: 0, ...txt, ...style }}>{text}</p>;
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'flex-start', gap: tok('popover-bullet-space-gap'), ...txt, ...style }}>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: tok('size-8'), height: tok('font-label-14-400-line-height') }}>
        <span style={{ width: tok('popover-bullet-size'), height: tok('popover-bullet-size'), borderRadius: tok('popover-bullet-radius'), background: tok('popover-bullet-color-bg-default') }} />
      </span>
      <span>{text}</span>
    </div>
  );
}

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  /** 트리거 기준 패널 위치 (화살표는 트리거를 가리킨다) */
  placement?: OverlayPlacement;
  showClose?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  showArrow?: boolean;
  title?: string;
  /** Figma content 슬롯 (PopoverText 등) */
  content?: ReactNode;
  /** Figma footer 슬롯: 오른쪽 정렬 텍스트 버튼 */
  footer?: ReactNode;
  onClose?: () => void;
}

export function Popover({ placement = 'top', showClose = true, showContent = true, showFooter = true, showArrow = true, title = 'Title', content, footer, onClose, className, style, onKeyDown, ...rest }: PopoverProps) {
  const titleId = useId();
  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      {...rest}
      className={`ds-popover__root${className ? ` ${className}` : ''}`}
      onKeyDown={(e) => {
        escToClose(onClose)(e);
        onKeyDown?.(e);
      }}
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', width: `calc(${tok('size-360')} * 2 / 3)`, maxWidth: '100%', ...style }}
    >
      <div
        className="ds-popover__contents"
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          gap: tok('popover-space-gap'),
          padding: `${tok('popover-space-padding-y')} ${tok('popover-space-padding-x')}`,
          borderRadius: tok('popover-radius'),
          background: tok('popover-color-bg-default'),
          boxShadow: tok('popover-shadow'),
        }}
      >
        <div className="ds-popover__header" style={{ display: 'flex', alignItems: 'center', gap: tok('popover-header-space-gap') }}>
          <h3 id={titleId} className="ds-popover__title" style={{ ...textStyle('label-14-600'), flex: 1, minWidth: 0, margin: 0, color: tok('popover-title-color-fg-default') }}>
            {title}
          </h3>
          {showClose ? (
            <span className="ds-popover__close" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: tok('size-20'), height: tok('size-20') }}>
              <Button type="iconPlain" size="small" icon="line/close" label="Close" onClick={onClose} />
            </span>
          ) : null}
        </div>
        {showContent ? (
          <div className="ds-popover__content" style={{ display: 'flex', flexDirection: 'column', ...textStyle('label-14-400'), color: tok('popover-content-color-fg-default') }}>
            {content ?? <ContentPlaceholder minHeight={tok('size-44')} />}
          </div>
        ) : null}
        {showFooter ? (
          <div className="ds-popover__footer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: tok('popover-footer-space-gap') }}>
            {footer ?? <Button type="text" variants="accent" label="Text Button" />}
          </div>
        ) : null}
      </div>
      {showArrow ? <OverlayArrow className="ds-popover__arrow" placement={placement} align="center" color={tok('popover-color-bg-default')} width={tok('popover-arrow-size-width')} height={tok('popover-arrow-size-height')} /> : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Popover.meta = { texts: { title: 'Title' } };
