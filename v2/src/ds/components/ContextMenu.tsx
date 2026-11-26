// ContextMenu: 트리거(우클릭 · 더보기 버튼)로 여는 동작 메뉴. 항목을 고르면 그 명령을 바로 실행한다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Context Menu › ContextMenu (8487:11530) · content 슬롯
//        항목 _Item/ContextMenu/MenuItem (8487:11462) · state 4, showFocus · showDivider · showDescription, label · description → ContextMenuItem
// 토큰: DS 컴포넌트 명세 contextMenu (context-menu-*, 항목 context-menu-menu-item-color-bg/fg-<state>, 설명 context-menu-sub-label-color-fg-<state>, 구분선 color/border/neutral/muted · borderWidth/thin)
// 메뉴만 제자리에 그린다(portal · fixed 없음). 위 · 아래 화살표 · Home · End로 항목 사이를 옮긴다.
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { FocusRing, textStyle, tok, tokState, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';

export interface ContextMenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: Look;
  showFocus?: boolean;
  /** 항목 위 구분선 */
  showDivider?: boolean;
  showDescription?: boolean;
  label?: string;
  description?: string;
  /** 문서 미리보기에서 부위 표시에 쓰는 이름 앞부분 */
  partPrefix?: string;
}

/** _Item/ContextMenu/MenuItem: 위 구분선(선택) · 라벨 · 설명(선택) */
export function ContextMenuItem({ state, showFocus = false, showDivider = true, showDescription = true, label = 'Menu', description = 'Description', partPrefix = 'ds-context-menu', disabled, className, style, ...rest }: ContextMenuItemProps) {
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  return (
    <div role="none" className={className} style={{ display: 'flex', flexDirection: 'column', gap: tok('context-menu-space-gap'), ...style }}>
      {showDivider ? <span role="separator" className={`${partPrefix}__divider`} style={{ display: 'block', height: 0, borderTop: `${tok('border-width-thin')} solid ${tok('color-border-neutral-muted')}` }} /> : null}
      <button
        {...rest}
        type="button"
        role="menuitem"
        disabled={off}
        aria-disabled={off || undefined}
        className={`${partPrefix}__item`}
        {...it.pointer}
        {...it.focus}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: tok('context-menu-menu-item-space-gap'),
          boxSizing: 'border-box',
          width: '100%',
          margin: 0,
          border: 0,
          outline: 'none',
          padding: `${tok('context-menu-menu-item-space-padding-y')} ${tok('context-menu-menu-item-space-padding-x')}`,
          borderRadius: tok('context-menu-menu-item-radius'),
          background: tokState('context-menu-menu-item-color-bg', look),
          color: tokState('context-menu-menu-item-color-fg', look),
          textAlign: 'left',
          cursor: off ? 'not-allowed' : 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span className={`${partPrefix}__label`} style={{ ...textStyle('label-14-600') }}>
          {label}
        </span>
        {showDescription ? (
          <span className={`${partPrefix}__description`} style={{ ...textStyle('caption-12-400'), color: tokState('context-menu-sub-label-color-fg', look) }}>
            {description}
          </span>
        ) : null}
        {showFocus || it.focusVisible ? (
          <span className={`${partPrefix}__focusRing`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <FocusRing radius={tok('context-menu-menu-item-focus-ring-radius')} />
          </span>
        ) : null}
      </button>
    </div>
  );
}

export interface ContextMenuEntry {
  label: string;
  description?: string;
  disabled?: boolean;
  /** 항목 위 구분선 (기본: 첫 항목 없음, 나머지 있음) */
  showDivider?: boolean;
  onSelect?: () => void;
}

export interface ContextMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** 메뉴 항목. children(ContextMenuItem)을 주면 그것을 쓴다 */
  items?: ContextMenuEntry[];
  /** Figma content 슬롯: ContextMenuItem들 */
  children?: ReactNode;
  /** 기본 항목(Figma 예시 2개)의 모양: 첫 항목 상태 (문서 예시용) */
  state?: Look;
  /** 기본 항목: 첫 항목 포커스 링 */
  showFocus?: boolean;
  /** 기본 항목: 둘째 항목부터 위 구분선 */
  showDivider?: boolean;
  /** 기본 항목: 설명 */
  showDescription?: boolean;
  /** 기본 항목 글 */
  label?: string;
  description?: string;
}

function moveFocus(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const list = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
  if (!list.length) return;
  e.preventDefault();
  const i = list.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
  list[next].focus();
}

export function ContextMenu({ items, children, state, showFocus = false, showDivider = true, showDescription = true, label = 'Menu', description = 'Description', className, style, onKeyDown, ...rest }: ContextMenuProps) {
  const body =
    children ??
    (items
      ? items.map((x, i) => <ContextMenuItem key={i} label={x.label} description={x.description} showDescription={!!x.description} showDivider={x.showDivider ?? i > 0} disabled={x.disabled} onClick={x.onSelect} />)
      : [0, 1].map((i) => <ContextMenuItem key={i} label={label} description={description} showDescription={showDescription} showDivider={i > 0 && showDivider} state={i === 0 ? state : undefined} showFocus={i === 0 && showFocus} />));
  return (
    <div
      role="menu"
      {...rest}
      className={`ds-context-menu__root${className ? ` ${className}` : ''}`}
      onKeyDown={(e) => {
        moveFocus(e);
        onKeyDown?.(e);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        width: tok('context-menu-size-width'),
        maxWidth: '100%',
        gap: tok('context-menu-space-gap'),
        padding: `${tok('context-menu-space-padding-y')} ${tok('context-menu-space-padding-x')}`,
        border: `${tok('context-menu-border-width')} solid ${tok('context-menu-color-border-default')}`,
        borderRadius: tok('context-menu-radius'),
        background: tok('context-menu-color-bg-default'),
        boxShadow: tok('context-menu-shadow'),
        ...style,
      }}
    >
      {body}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
ContextMenu.meta = { texts: { label: 'Menu', description: 'Description' } };
