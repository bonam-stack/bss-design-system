// Breadcrumb: 현재 위치와 상위 경로를 보여 주고 각 단계로 이동하게 하는 보조 내비게이션. <nav> 안 <ol>에 링크와 현재 위치를 둔다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Breadcrumb › Breadcrumb (8822:541) · content 슬롯
//   항목: _Item/Breadcrumb/Item (8821:223, position link · current × state) · 구분 기호 _Item/Breadcrumb/Separator (9708:200)
// 토큰: DS 컴포넌트 명세 breadcrumb (링크 breadcrumb-link-label-color-fg-<상태>, 현재 위치 breadcrumb-current-label-*, 구분 기호 breadcrumb-separator-*)
//   구분 기호는 링크 밖 장식(aria-hidden)이고, 누르는 영역 · hover · pressed · 포커스는 라벨 링크만이다
import type { CSSProperties, MouseEvent } from 'react';
import { FocusRing, Icon, textStyle, tok, tokState, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** 경로 항목. 마지막 항목이 현재 위치(position=current)다 (기본: Home · Category · Current Page) */
  items?: BreadcrumbItem[];
  /** 링크 항목을 누를 때 (href 대신 앱 안에서 옮길 때) */
  onNavigate?: (item: BreadcrumbItem, index: number, e: MouseEvent<HTMLAnchorElement>) => void;
  /** 링크 항목 모양을 이 상태로 고정 (문서 예시용). 현재 위치는 default만 있다 */
  state?: Look;
  /** 마지막 링크 항목에 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

const SAMPLE: BreadcrumbItem[] = [{ label: 'Home', href: '#' }, { label: 'Category', href: '#' }, { label: 'Current Page' }];

function Link({ item, state, ring, onClick }: { item: BreadcrumbItem; state?: Look; ring: boolean; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const it = useInteraction();
  const look: Look = state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  return (
    <a
      href={item.href ?? '#'}
      onClick={onClick}
      {...it.pointer}
      {...it.focus}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        ...textStyle('font-label-14-400'),
        color: tokState('breadcrumb-link-label-color-fg', look),
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {item.label}
      {ring || it.focusVisible ? <FocusRing radius={tok('focus-ring-radius')} /> : null}
    </a>
  );
}

export function Breadcrumb({ items = SAMPLE, onNavigate, state, showFocus = false, className, style, ...aria }: BreadcrumbProps) {
  const lastLink = items.length - 2;
  return (
    <nav aria-label={aria['aria-label'] ?? '현재 위치'} className={className} style={{ display: 'inline-flex', ...style }}>
      <ol style={{ display: 'inline-flex', alignItems: 'center', gap: tok('breadcrumb-group-space-gap'), margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((x, i) => {
          const current = i === items.length - 1;
          return (
            <li key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: tok('breadcrumb-group-space-gap') }}>
              {i > 0 ? <Icon name="line/chevron-right" size={tok('breadcrumb-separator-size')} color={tok('breadcrumb-separator-color-fg-default')} /> : null}
              {current ? (
                <span aria-current="page" style={{ ...textStyle('font-label-14-400'), color: tok('breadcrumb-current-label-color-fg-default'), whiteSpace: 'nowrap' }}>
                  {x.label}
                </span>
              ) : (
                <Link item={x} state={state} ring={showFocus && i === lastLink} onClick={onNavigate ? (e) => onNavigate(x, i, e) : undefined} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Breadcrumb.meta = { texts: {} };
