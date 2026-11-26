// Tabs: 한 화면(컨테이너) 안에서 비슷한 콘텐츠를 나눠 두고 바꿔 보게 하는 탭 목록. role="tablist" 안에 role="tab" 버튼을 둔다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Tabs › Tabs (7242:1095) · type 3 × size 3 중 4개(underline large·medium, contained medium, anchor small)
//   항목: _Item/Tabs/Underline (7242:851) · _Item/Tabs/Contained (7242:963) · _Item/Tabs/Anchor (7242:1051)
// 토큰: DS 컴포넌트 명세 tab-underline · tab-contained · tab-anchor (라벨 색 tab[-selected]-label-color-fg-<상태>, 밑줄 tab-selected-indicator-color-border-<상태>)
//   개수 배지는 Badge 컴포넌트 type=count small subtle (선택 highlight · 선택 안 됨 neutral)
import { useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { FocusRing, textStyle, tok, tokState, useInteraction } from '../shared';
import { Badge } from './Badge';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
export type TabsType = 'underline' | 'contained' | 'anchor';
export type TabsSize = 'large' | 'medium' | 'small';

export interface TabItem {
  value: string;
  label: string;
  /** 개수 배지 숫자 (underline에서 showCount일 때) */
  count?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  /** underline 기본 · contained Underline 하위 보조 · anchor 페이지 안 위치 이동 */
  type?: TabsType;
  /** underline: large · medium / contained: medium / anchor: small (맞지 않으면 그 type의 크기로 그린다) */
  size?: TabsSize;
  /** 탭 항목 (기본: Figma 예시 항목) */
  items?: TabItem[];
  /** 선택한 탭 value. 주면 제어 컴포넌트 */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 모든 항목 모양을 이 상태로 고정 (문서 예시용) */
  state?: Look;
  /** 선택한 항목에 포커스 링을 늘 표시 (키보드 포커스 때는 자동으로 표시) */
  showFocus?: boolean;
  /** underline 라벨 옆 개수 배지 (기본: large 켬 · medium 끔) */
  showCount?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

const SAMPLE: Record<TabsType, TabItem[]> = {
  underline: [
    { value: '1', label: 'Tab', count: 0 },
    { value: '2', label: 'Tab', count: 0 },
    { value: '3', label: 'Tab', count: 0 },
  ],
  contained: [
    { value: '1', label: 'Item' },
    { value: '2', label: 'Item' },
    { value: '3', label: 'Item' },
  ],
  anchor: [
    { value: '1', label: 'Label' },
    { value: '2', label: 'Label' },
    { value: '3', label: 'Label' },
    { value: '4', label: 'Label' },
    { value: '5', label: 'Label' },
  ],
};

const fixSize = (type: TabsType, size: TabsSize): TabsSize => (type === 'anchor' ? 'small' : type === 'contained' ? 'medium' : size === 'small' ? 'medium' : size);

function Tab({ type, size, item, index, last, selected, state, showFocus, showCount, onSelect, onKey }: { type: TabsType; size: TabsSize; item: TabItem; index: number; last: boolean; selected: boolean; state?: Look; showFocus: boolean; showCount: boolean; onSelect: () => void; onKey: (e: KeyboardEvent<HTMLButtonElement>) => void }) {
  const it = useInteraction();
  const off = !!item.disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const color = selected ? tokState('tab-selected-label-color-fg', look) : tokState('tab-label-color-fg', look);
  const line = tokState('tab-selected-indicator-color-border', look);

  let box: CSSProperties;
  let text: CSSProperties;
  if (type === 'underline') {
    box = {
      height: tok(`tab-underline-${size}-size-height`),
      padding: `0 ${tok('tab-underline-space-padding-x')}`,
      gap: tok('tab-underline-space-gap'),
      boxShadow: selected ? `inset 0 calc(-1 * ${tok('tab-underline-indicator-border-width')}) 0 ${line}` : undefined,
    };
    text = textStyle(size === 'large' ? 'font-label-18-700' : 'font-label-14-600');
  } else if (type === 'contained') {
    const thin = `${tok('tab-contained-border-width')} solid`;
    const edge = selected ? tokState('tab-contained-selected-color-border', look) : tok('tab-contained-color-border-default');
    box = {
      height: tok('tab-contained-size-height'),
      padding: `0 ${tok('tab-contained-space-padding-x')}`,
      gap: tok('tab-contained-space-gap'),
      background: tok('tab-contained-color-bg-default'),
      borderTop: selected ? `${tok('tab-contained-indicator-border-width')} solid ${edge}` : `${thin} ${edge}`,
      borderLeft: selected || index === 0 ? `${thin} ${edge}` : undefined,
      borderRight: `${thin} ${edge}`,
      // 선택한 탭은 왼쪽 테두리를 앞 탭 오른쪽 구분선 위에 겹친다
      marginLeft: selected && index > 0 ? `calc(-1 * ${tok('tab-contained-border-width')})` : undefined,
    };
    text = textStyle('font-label-16-600');
  } else {
    box = {
      height: tok('tab-anchor-size-height'),
      padding: 0,
      boxShadow: selected ? `inset 0 calc(-1 * ${tok('tab-anchor-indicator-border-width')}) 0 ${line}` : undefined,
    };
    text = textStyle('font-label-15-600');
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-disabled={off || undefined}
      tabIndex={selected ? 0 : -1}
      data-last={last || undefined}
      onClick={() => !off && onSelect()}
      onKeyDown={onKey}
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
        background: 'transparent',
        color,
        cursor: off ? 'not-allowed' : 'pointer',
        outline: 'none',
        ...box,
      }}
    >
      <span style={{ ...text, whiteSpace: 'nowrap' }}>{item.label}</span>
      {type === 'underline' && showCount && item.count !== undefined ? <Badge type="count" size="small" emphasis="subtle" tone={selected ? 'highlight' : 'neutral'} state={off ? 'disabled' : 'default'} count={String(item.count)} style={{ fontVariantNumeric: 'tabular-nums' }} /> : null}
      {(showFocus && selected) || it.focusVisible ? <FocusRing radius={tok('focus-ring-radius')} /> : null}
    </button>
  );
}

export function Tabs({ type = 'underline', size = 'large', items, value, defaultValue, onValueChange, state, showFocus = false, showCount, className, style, ...aria }: TabsProps) {
  const list = items ?? SAMPLE[type];
  const sz = fixSize(type, size);
  const [inner, setInner] = useState(defaultValue ?? list[0]?.value ?? '');
  const current = value ?? inner;
  const select = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  const count = showCount ?? sz === 'large';

  // 화살표 · Home · End로 옮겨 가며 고른다 (자동 활성화)
  const onKey = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const enabled = list.map((x, j) => (x.disabled ? -1 : j)).filter((j) => j >= 0);
    const at = enabled.indexOf(i);
    let to = -1;
    if (e.key === 'ArrowRight') to = enabled[(at + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') to = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') to = enabled[0];
    else if (e.key === 'End') to = enabled[enabled.length - 1];
    if (to < 0 || to === undefined) return;
    e.preventDefault();
    select(list[to].value);
    const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[to]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={aria['aria-label']}
      aria-orientation="horizontal"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'stretch', gap: type === 'anchor' ? tok('tab-anchor-group-space-gap') : 0, ...style }}
    >
      {list.map((x, i) => (
        <Tab key={x.value} type={type} size={sz} item={x} index={i} last={i === list.length - 1} selected={x.value === current} state={state} showFocus={showFocus} showCount={count} onSelect={() => select(x.value)} onKey={onKey(i)} />
      ))}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Tabs.meta = { texts: {} };
