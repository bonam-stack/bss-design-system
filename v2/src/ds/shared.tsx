// BSS 디자인 시스템 React 컴포넌트가 함께 쓰는 것: 토큰 값, 글자 스타일, 아이콘, 상호작용 상태, 포커스 링.
// 스타일은 CSS 파일 없이 style 객체로 쓴다. 색 · 치수는 var(--토큰, Figma 값)이라 토큰 CSS가 없어도 Figma 값으로 그려진다.
import { useState } from 'react';
import type { CSSProperties, FocusEvent } from 'react';

/** 디자인 토큰: var(--name, Figma 값) */
export const tok = (name: string, fallback: string | number) => `var(--${name}, ${typeof fallback === 'number' ? `${fallback}px` : fallback})`;

const FONT_LINE: Record<string, number> = { '12': 16, '14': 20, '15': 24, '16': 24 };
/** 글자 스타일 토큰 (Figma 텍스트 스타일 label/16/500 → font-label-16-500-*) */
export function font(kind: 'label' | 'body' | 'caption', size: 12 | 14 | 15 | 16, weight: 400 | 500 | 600): CSSProperties {
  const p = `font-${kind}-${size}-${weight}`;
  return {
    fontFamily: `${tok(`${p}-family`, "'Pretendard'")}, sans-serif`,
    fontWeight: tok(`${p}-weight`, String(weight)) as unknown as number,
    fontSize: tok(`${p}-size`, size),
    lineHeight: tok(`${p}-line-height`, FONT_LINE[size]),
    letterSpacing: tok(`${p}-letter-spacing`, -0.2),
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
export function FocusRing({ radius, style }: { radius: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: -2,
        borderRadius: radius,
        outline: `${tok('focus-ring-border-width', 2)} solid ${tok('focus-ring-color-border', '#7FAEFF')}`,
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
