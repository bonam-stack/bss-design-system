// 노드 트리 → React 요소, 그리고 Figma 컴포넌트 세트 하나를 React 컴포넌트로 만드는 createFigmaComponent.
// 생성된 컴포넌트(src/ds/components/*.tsx)는 component.json과 아이콘을 넘겨 이 함수를 부른다.

import { forwardRef, useMemo, useState } from 'react';
import type { CSSProperties, ForwardRefExoticComponent, KeyboardEvent, MouseEvent, ReactNode, RefAttributes } from 'react';
import type { ComponentData, IconMap, PropValues } from '../types';
import { buildTree } from './tree';
import type { Css, RNode } from './tree';
import { analyze, findVariant } from './variants';
import './ds.css';

const camel = (k: string) => (k.startsWith('-webkit-') ? `Webkit${k.slice(8).replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}` : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
export const toStyle = (css: Css): CSSProperties => Object.fromEntries(Object.entries(css).map(([k, v]) => [camel(k), v])) as CSSProperties;

function textLines(s: string): ReactNode {
  const parts = s.split('\n');
  return parts.map((p, i) => (i ? [<br key={i} />, p] : p));
}

function node(n: RNode, slot: ReactNode | undefined, key?: number): ReactNode {
  const style = toStyle(n.css);
  switch (n.kind) {
    case 'caret':
      return <span key={key} className={n.cls} style={style} aria-hidden="true" />;
    case 'icon':
      return <span key={key} className={n.cls} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: n.svg!.replace('<svg', '<svg style="display:block"') }} />;
    case 'text':
      return (
        <span key={key} className={n.cls} style={style}>
          {textLines(n.text ?? '')}
        </span>
      );
    case 'line':
      return (
        <span key={key} className={n.cls} style={style}>
          {(n.children || []).map((c, i) => node(c, slot, i))}
        </span>
      );
    default:
      return (
        <div key={key} className={n.cls} style={style}>
          {n.slot && slot !== undefined ? slot : (n.children || []).map((c, i) => node(c, slot, i))}
        </div>
      );
  }
}

export interface FigmaViewProps {
  data: ComponentData;
  icons: IconMap;
  /** 변형 속성 (size · state …) */
  selection: Record<string, string>;
  /** 불리언 · 텍스트 속성 (Figma 속성 이름 → 값) */
  values: PropValues;
  /** Figma SLOT 자리에 넣을 내용 */
  slot?: ReactNode;
  prefix?: string;
}

/** 고른 변형 하나를 그대로 그린다 (상호작용 없음) */
export function FigmaView({ data, icons, selection, values, slot, prefix }: FigmaViewProps) {
  const variant = findVariant(data, selection);
  const tree = useMemo(() => (variant.layer ? buildTree(data, variant.layer, { values, icons, prefix: prefix || `ds-${data.key}` }) : null), [data, variant, values, icons, prefix]);
  if (!tree) return null;
  return <>{node(tree.root, slot)}</>;
}

/** 생성된 컴포넌트가 모두 받는 공통 속성 */
export interface DsBaseProps {
  /** 안쪽 인스턴스 속성 (HelperText의 message 등). Figma 속성 이름(이름#id) → 값 */
  overrides?: PropValues;
  /** Figma SLOT 자리에 넣을 내용 (RadioGroup의 content) */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** false면 포인터 · 키보드에 반응하지 않는 그림으로만 그린다 (문서 예시) */
  interactive?: boolean;
  /** 선택 속성(selection 등)이 바뀔 때 새 값 */
  onChange?: (value: string) => void;
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
  'aria-label'?: string;
  id?: string;
}

export type DsComponent<P> = ForwardRefExoticComponent<P & DsBaseProps & RefAttributes<HTMLSpanElement>> & { data: ComponentData; icons: IconMap };

type AnyProps = Record<string, unknown> & DsBaseProps;

/** Figma 컴포넌트 세트 → React 컴포넌트.
 *  - 변형 속성은 문자열 선택지, 불리언 · 텍스트 속성은 그대로 받는다.
 *  - state를 주지 않으면(또는 default) 포인터가 hover · pressed를, 키보드 포커스가 포커스 링을 그린다.
 *  - 켜기 · 끄기 속성(selection)은 누르면 바뀐다. 값을 주면 제어 컴포넌트가 되고 onChange로 새 값을 알린다. */
export function createFigmaComponent<P>(data: ComponentData, icons: IconMap, displayName: string): DsComponent<P> {
  const a = analyze(data);
  const role = a.selectProp ? (/radio/i.test(data.key) ? 'radio' : 'checkbox') : a.stateProp?.options!.includes('pressed') ? 'button' : undefined;
  const C = forwardRef<HTMLSpanElement, P & DsBaseProps>((raw, ref) => {
    const props = raw as unknown as AnyProps;
    const interactive = props.interactive !== false;
    const [innerSel, setInnerSel] = useState<string | undefined>(undefined);
    const [live, setLive] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);

    const selection: Record<string, string> = {};
    for (const p of a.vprops) {
      const given = props[p.name];
      selection[p.name] = given === undefined || given === null ? String(p.default) : String(given);
    }
    if (a.selectProp && props[a.selectProp.name] === undefined && innerSel !== undefined) selection[a.selectProp.name] = innerSel;
    const disabled = !!a.stateProp && selection[a.stateProp.name] === 'disabled';
    const has = (s: string) => !!a.stateProp && a.stateProp.options!.includes(s);
    // 포인터는 state가 쉬는 값일 때만 미리보기를 움직인다. hover · pressed · disabled를 주면 Figma처럼 그 상태로 고정
    const want = { ...selection };
    if (interactive && a.stateProp && live && selection[a.stateProp.name] === a.restOption) want[a.stateProp.name] = live;

    const values: PropValues = {};
    for (const p of data.props) {
      if (p.type !== 'boolean' && p.type !== 'text') continue;
      const given = props[p.name];
      values[p.figmaName] = given === undefined ? (p.default as string | boolean) : (given as string | boolean);
    }
    Object.assign(values, props.overrides || {});
    if (interactive && a.focusFlag && focused) values[a.focusFlag.figmaName] = true;
    const memoValues = useMemo(() => values, [JSON.stringify(values)]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = () => {
      if (disabled || !a.selectProp) return;
      const cur = selection[a.selectProp.name];
      const next = role === 'radio' ? a.on! : cur === a.off ? a.on! : a.off!;
      if (next === cur) return;
      if (props[a.selectProp.name] === undefined) setInnerSel(next);
      props.onChange?.(next);
    };

    const on = interactive && !!(role || a.focusFlag);
    const handlers = on
      ? {
          tabIndex: disabled ? -1 : 0,
          onPointerEnter: () => has('hover') && setLive('hover'),
          onPointerLeave: () => setLive(null),
          onPointerDown: () => has('pressed') && setLive('pressed'),
          onPointerUp: () => setLive(has('hover') ? 'hover' : null),
          onClick: (e: MouseEvent<HTMLSpanElement>) => {
            if (disabled) return;
            toggle();
            props.onClick?.(e);
          },
          onKeyDown: (e: KeyboardEvent<HTMLSpanElement>) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.click();
            }
          },
          onFocus: (e: React.FocusEvent<HTMLSpanElement>) => setFocused(e.currentTarget.matches(':focus-visible')),
          onBlur: () => setFocused(false),
        }
      : {};
    return (
      <span
        ref={ref}
        id={props.id}
        className={`ds-root${props.className ? ` ${props.className}` : ''}`}
        style={props.style}
        role={on ? role : undefined}
        aria-label={props['aria-label']}
        aria-checked={on && a.selectProp ? selection[a.selectProp.name] === a.on ? true : selection[a.selectProp.name] === a.off ? false : 'mixed' : undefined}
        aria-disabled={on && disabled ? true : undefined}
        data-clickable={on && role && !disabled ? '' : undefined}
        {...handlers}
      >
        <FigmaView data={data} icons={icons} selection={want} values={memoValues} slot={props.children} />
      </span>
    );
  }) as unknown as DsComponent<P>;
  C.displayName = displayName;
  C.data = data;
  C.icons = icons;
  return C;
}
