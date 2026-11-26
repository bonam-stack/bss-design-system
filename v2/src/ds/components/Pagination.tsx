// Pagination: 페이지 단위로 나뉜 콘텐츠를 옮겨 다니는 내비게이션. <nav> 안에 처음 · 이전 · 페이지 번호 · 다음 · 마지막 버튼을 둔다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Pagination › Pagination (4012:33172) · showBoundaryControls, pageItems 슬롯
//   항목: _Item/Pagination/Page (4012:17218, type number · ellipsis × selection × state) · _Item/Pagination/Control (4012:33043, direction 4 × state)
// 토큰: DS 컴포넌트 명세 pagination (항목 pagination-color-*-<상태>, 현재 페이지 pagination-current-color-*-<상태>, 묶음 pagination-group-*)
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { FocusRing, Icon, textStyle, tok, tokState, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
type Direction = 'first' | 'previous' | 'next' | 'last';

export interface PaginationProps {
  /** 처음 · 마지막 이동 버튼 표시 */
  showBoundaryControls?: boolean;
  /** 현재 페이지(1부터). 주면 제어 컴포넌트 (onPageChange로 새 값을 받는다) */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** 전체 페이지 수 */
  totalPages?: number;
  /** 한 번에 보이는 번호 수 (Figma 9) */
  pageWindow?: number;
  /** 페이지 번호 · 이동 버튼 모양을 이 상태로 고정 (문서 예시용). 이동할 수 없는 방향 버튼은 늘 disabled */
  state?: Look;
  /** 현재 페이지 번호에 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

const ICON: Record<Direction, string> = { first: 'line/first-page', previous: 'line/chevron-left', next: 'line/chevron-right', last: 'line/last-page' };
const NAME: Record<Direction, string> = { first: '첫 페이지', previous: '이전 페이지', next: '다음 페이지', last: '마지막 페이지' };

/** 보일 번호: 현재 페이지가 든 묶음(window개) + 앞뒤 끝 페이지와 생략(…) */
export function pageList(page: number, total: number, size: number): (number | 'ellipsis')[] {
  if (total <= size + 2) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.floor((page - 1) / size) * size + 1;
  const end = Math.min(start + size - 1, total);
  const out: (number | 'ellipsis')[] = [];
  if (start > 1) out.push(1, ...(start > 2 ? (['ellipsis'] as const) : []));
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total) out.push(...(end < total - 1 ? (['ellipsis'] as const) : []), total);
  return out;
}

function Item({ label, current = false, off, state, ring, square, onClick, children }: { label: string; current?: boolean; off: boolean; state?: Look; ring: boolean; square: boolean; onClick: () => void; children: ReactNode }) {
  const it = useInteraction();
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={off}
      onClick={onClick}
      {...it.pointer}
      {...it.focus}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        margin: 0,
        border: 0,
        outline: 'none',
        height: tok('pagination-size-height'),
        minWidth: tok('pagination-size-min-width'),
        padding: square ? 0 : `0 ${tok('pagination-space-padding-x')}`,
        borderRadius: tok('pagination-radius'),
        background: current ? tokState('pagination-current-color-bg', look) : tokState('pagination-color-bg', look),
        color: current ? tokState('pagination-current-color-fg', look) : tokState('pagination-color-fg', look),
        ...textStyle('font-label-13-500'),
        cursor: off ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
      {ring || it.focusVisible ? <FocusRing radius={tok('pagination-focus-ring-radius')} /> : null}
    </button>
  );
}

export function Pagination({ showBoundaryControls = true, page, defaultPage = 1, onPageChange, totalPages = 100, pageWindow = 9, state, showFocus = false, className, style, ...aria }: PaginationProps) {
  const [inner, setInner] = useState(defaultPage);
  const total = Math.max(1, totalPages);
  const cur = Math.min(Math.max(1, page ?? inner), total);
  const go = (p: number) => {
    const n = Math.min(Math.max(1, p), total);
    if (n === cur) return;
    if (page === undefined) setInner(n);
    onPageChange?.(n);
  };
  const allOff = state === 'disabled';

  const control = (d: Direction) => {
    const target = d === 'first' ? 1 : d === 'previous' ? cur - 1 : d === 'next' ? cur + 1 : total;
    const blocked = d === 'first' || d === 'previous' ? cur <= 1 : cur >= total;
    return (
      <Item key={d} label={NAME[d]} off={allOff || blocked} state={state} ring={false} square onClick={() => go(target)}>
        <Icon name={ICON[d]} size={tok('pagination-icon-size')} />
      </Item>
    );
  };

  return (
    <nav aria-label={aria['aria-label'] ?? '페이지 이동'} className={className} style={{ display: 'inline-flex', ...style }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tok('pagination-group-space-gap'),
          padding: `${tok('pagination-group-space-padding-y')} ${tok('pagination-group-space-padding-x')}`,
        }}
      >
        {showBoundaryControls ? control('first') : null}
        {control('previous')}
        {pageList(cur, total, Math.max(1, pageWindow)).map((p, i) =>
          p === 'ellipsis' ? (
            // 생략: 누를 수 없고 상태가 없다. 색은 번호 글자와 같다
            <span key={`e${i}`} aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: tok('pagination-size-height'), minWidth: tok('pagination-size-min-width'), color: tok('pagination-color-fg-default') }}>
              <Icon name="filled/more-horizontal" size={tok('pagination-icon-size')} />
            </span>
          ) : (
            <Item key={p} label={`${p} 페이지`} current={p === cur} off={allOff} state={state} ring={showFocus && p === cur} square={false} onClick={() => go(p)}>
              {p}
            </Item>
          ),
        )}
        {control('next')}
        {showBoundaryControls ? control('last') : null}
      </div>
    </nav>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Pagination.meta = { texts: {} };
