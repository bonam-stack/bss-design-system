// BSS 디자인 시스템 React 컴포넌트가 함께 쓰는 것: 토큰 값, 글자 스타일, 아이콘, 상호작용 상태, 포커스 링.
// 스타일은 CSS 파일 없이 style 객체로 쓴다. 색 · 치수 · 글자는 모두 DS 토큰(CSS 변수)으로만 쓴다. 값(헥스 · px)을 코드에 적지 않는다.
// 토큰 값은 DS 전달본의 tokens.css가 정한다 (v2/tokens/ds).
import { useState } from 'react';
import variables from '../../tokens/variables.json';
import type { CSSProperties, FocusEvent } from 'react';

/** 디자인 토큰: var(--name). 값은 tokens.css가 정한다 */
export const tok = (name: string) => `var(--${name})`;

/** DS 전달본에 있는 토큰 이름 (상태 토큰이 있는지 보는 데 쓴다) */
const NAMES = new Set(Object.keys((variables as { tokens: Record<string, unknown> }).tokens));
/**
 * 상태 토큰: <이름>-<상태>가 있으면 그것, 없으면 <이름>-default.
 * DS 규칙: -default만 있는 속성은 모든 상태에서 그 값을 쓴다 (예: primary 버튼 글자색은 hover · pressed · disabled에도 default).
 */
export const tokState = (base: string, state: string) => tok(NAMES.has(`--${base}-${state}`) ? `${base}-${state}` : `${base}-default`);

/** 글자 스타일 토큰 (Figma 텍스트 스타일 label/16/500 → font-label-16-500-*) */
export function font(kind: 'label' | 'body' | 'caption', size: 12 | 14 | 15 | 16, weight: 400 | 500 | 600): CSSProperties {
  const p = `font-${kind}-${size}-${weight}`;
  return {
    fontFamily: `${tok(`${p}-family`)}, sans-serif`,
    fontWeight: tok(`${p}-weight`) as unknown as number,
    fontSize: tok(`${p}-size`),
    lineHeight: tok(`${p}-line-height`),
    letterSpacing: tok(`${p}-letter-spacing`),
  };
}

/** 글자 스타일 토큰 이름으로 (DS 컴포넌트 명세 textStyles의 style: 'font-title-14-700' 또는 'title-14-700') */
export function textStyle(style: string): CSSProperties {
  const p = style.startsWith('font-') ? style : `font-${style}`;
  return {
    fontFamily: `${tok(`${p}-family`)}, sans-serif`,
    fontWeight: tok(`${p}-weight`) as unknown as number,
    fontSize: tok(`${p}-size`),
    lineHeight: tok(`${p}-line-height`),
    letterSpacing: tok(`${p}-letter-spacing`),
  };
}

// ---------- 아이콘 (icons/svg, Figma ❖ Icon Resource) ----------

const svgs = import.meta.glob<string>('../../icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' });

/** name: 'line/check-box' · 'filled/close' … (icons/svg 아래 경로). line · filled는 color를 따른다 */
export function Icon({ name, size = 16, color, style }: { name: string; size?: number | string; color?: string; style?: CSSProperties }) {
  const raw = svgs[`../../icons/svg/${name}.svg`] || '';
  const svg = raw.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%" style="display:block"');
  const s = typeof size === 'number' ? `${size}px` : size;
  return <span aria-hidden="true" style={{ display: 'block', flexShrink: 0, width: s, height: s, color, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ---------- 상호작용 ----------

/** 포인터 · 키보드 상태. forced(state 속성)를 주면 그 상태로 고정해서 그린다 (Figma 변형처럼) */
export function useInteraction() {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  return {
    hover,
    pressed,
    focused,
    focusVisible,
    /** 바깥 요소에 */
    pointer: {
      onPointerEnter: () => setHover(true),
      onPointerLeave: () => {
        setHover(false);
        setPressed(false);
      },
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
    },
    /** 포커스를 받는 요소(input · button)에 */
    focus: {
      onFocus: (e: FocusEvent<HTMLElement>) => {
        setFocused(true);
        setFocusVisible(e.currentTarget.matches(':focus-visible'));
      },
      onBlur: () => {
        setFocused(false);
        setFocusVisible(false);
      },
    },
  };
}

/** 키보드 포커스 링 (Figma _FocusRing): 부모는 position: relative */
export function FocusRing({ radius, style, className }: { radius: string; style?: CSSProperties; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        // 링은 칸 밖으로 focus-ring-space-offset만큼 떨어진다
        inset: `calc(-1 * ${tok('focus-ring-space-offset')})`,
        borderRadius: radius,
        outline: `${tok('focus-ring-border-width')} solid ${tok('focus-ring-color-border')}`,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

/** 화면에는 안 보이고 보조기기 · 폼에는 있는 실제 입력 요소 */
export const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

/** 'true' · 'false' 문자열(Figma 변형)과 boolean을 함께 받는다 */
export const bool = (v: boolean | 'true' | 'false' | undefined) => v === true || v === 'true';
