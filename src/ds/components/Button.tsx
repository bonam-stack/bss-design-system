// Button: 실제 <button>. type 5종(square · round · icon · iconPlain · text) × variants × size × state.
// Figma: BSS DS Library v2.0 ❖ Button (showLeadingIcon · showTrailingIcon · showUnderline · showFocus · label)
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { FocusRing, Icon, font, tok, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'fixed';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** square 기본 버튼 · round 알약형 · icon 테두리 아이콘 · iconPlain 아이콘만 · text 글자 링크형 */
  type?: 'square' | 'round' | 'icon' | 'iconPlain' | 'text';
  /** square: primary · secondary · base · accent · danger / round · icon: base · accent · danger / text: base · accent */
  variants?: 'primary' | 'secondary' | 'base' | 'accent' | 'danger';
  /** square: xlarge~small / round · icon · iconPlain: large~small / text: fixed */
  size?: Size;
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: Look;
  /** 글자 (icon · iconPlain에서는 보조기기용 이름) */
  label?: string;
  showLeadingIcon?: boolean;
  showTrailingIcon?: boolean;
  /** text 버튼 밑줄 */
  showUnderline?: boolean;
  showFocus?: boolean;
  /** icons/svg 아래 이름 (예: line/search) */
  leadingIcon?: string;
  trailingIcon?: string;
  icon?: string;
  /** <button type> */
  htmlType?: 'button' | 'submit' | 'reset';
}

const C = {
  bg: { primary: ['#3617CE', '#2F15B2', '#261091', '#B3B9C0'], secondary: ['#00000000', '#F8F9FB', '#F1F3F5', '#00000000'], base: ['#FFFFFF', '#F8F9FB', '#F1F3F5', '#FFFFFF'], accent: ['#00000000', '#F1F2FF', '#E1E3FF', '#00000000'], danger: ['#00000000', '#FFE9E9', '#FBE1E1', '#00000000'] },
  border: { secondary: ['#454F59', '#454F59', '#454F59', '#C4C9CF'], base: ['#B3B9C0', '#B3B9C0', '#B3B9C0', '#C4C9CF'], accent: ['#3617CE', '#3617CE', '#3617CE', '#C4C9CF'], danger: ['#ED3B3E', '#ED3B3E', '#ED3B3E', '#C4C9CF'] },
  fg: { primary: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'], secondary: ['#1C1F23', '#1C1F23', '#1C1F23', '#B3B9C0'], base: ['#1C1F23', '#1C1F23', '#1C1F23', '#B3B9C0'], accent: ['#3617CE', '#3617CE', '#3617CE', '#B3B9C0'], danger: ['#ED3B3E', '#ED3B3E', '#ED3B3E', '#B3B9C0'] },
  plain: ['#454F59', '#303942', '#1C1F23', '#B3B9C0'],
  text: { base: ['#454F59', '#303942', '#1C1F23', '#B3B9C0'], accent: ['#2F15B2', '#261091', '#231080', '#B3B9C0'] },
};
const LOOKS: Look[] = ['default', 'hover', 'pressed', 'disabled'];
const pick = (list: string[], look: Look) => list[LOOKS.indexOf(look)];

// 크기별 높이 · 좌우 여백 · 모서리 · 아이콘 · 글자 (square = action, round = inline, icon = icon-only)
const ACTION = {
  xlarge: { h: 48, px: 20, r: 8, ring: 10, icon: 20, minW: 82, text: font('label', 16, 600) },
  large: { h: 40, px: 16, r: 6, ring: 8, icon: 20, minW: 72, text: font('label', 15, 600) },
  medium: { h: 36, px: 14, r: 6, ring: 8, icon: 16, minW: 64, text: font('label', 15, 500) },
  small: { h: 28, px: 12, r: 6, ring: 8, icon: 14, minW: 56, text: font('label', 14, 500) },
};
const INLINE = { large: { h: 40, px: 16, icon: 16 }, medium: { h: 36, px: 14, icon: 16 }, small: { h: 28, px: 12, icon: 14 } };
const ICON_ONLY = { large: { box: 40, icon: 20 }, medium: { box: 36, icon: 16 }, small: { box: 28, icon: 14 } };

export function Button({ type = 'square', variants = 'primary', size = 'xlarge', state, label = 'Button', showLeadingIcon = false, showTrailingIcon = false, showUnderline = false, showFocus = false, leadingIcon = 'line/search', trailingIcon = 'line/search', icon = 'line/search', htmlType = 'button', disabled, style, className, ...rest }: ButtonProps) {
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const sz = (type === 'text' ? 'fixed' : type !== 'square' && size === 'xlarge' ? 'large' : size) as Size;

  let box: CSSProperties = {};
  let fg = '';
  let ring = tok('focus-ring-radius', 4);
  let iconSize = 16;
  let content: JSX.Element;

  if (type === 'square' || type === 'round') {
    const a = type === 'square' ? ACTION[sz as keyof typeof ACTION] : { ...ACTION[sz as keyof typeof INLINE], ...INLINE[sz as keyof typeof INLINE] };
    const pre = type === 'square' ? `button-action-${sz}` : `button-inline-${sz}`;
    const v = type === 'round' && variants === 'primary' ? 'base' : variants;
    fg = tok(`button-${v}-color-fg-${look}`, pick(C.fg[v], look));
    iconSize = a.icon;
    box = {
      height: tok(`${pre}-size-height`, a.h),
      minWidth: a.minW,
      padding: `0 ${tok(`${pre}-space-padding-x`, a.px)}`,
      gap: tok(type === 'square' ? 'button-action-space-gap' : 'button-inline-space-gap', 4),
      borderRadius: type === 'square' ? tok(`${pre}-radius`, a.r) : tok('button-inline-radius', 9999),
      background: tok(`button-${v}-color-bg-${look}`, pick(C.bg[v], look)),
      boxShadow: v === 'primary' ? undefined : `inset 0 0 0 ${tok(type === 'square' ? 'button-action-border-width' : 'button-inline-border-width', 1)} ${tok(`button-${v}-color-border-${look}`, pick(C.border[v as keyof typeof C.border], look))}`,
      color: fg,
    };
    ring = type === 'square' ? tok(`${pre}-focus-ring-radius`, (a as (typeof ACTION)['large']).ring) : tok(`${pre}-focus-ring-radius`, 9999);
    content = (
      <>
        {showLeadingIcon ? <Icon name={leadingIcon} size={tok(`${pre}-icon-size`, iconSize)} /> : null}
        <span style={{ ...a.text, whiteSpace: 'nowrap', textAlign: 'center' }}>{label}</span>
        {showTrailingIcon ? <Icon name={trailingIcon} size={tok(`${pre}-icon-size`, iconSize)} /> : null}
      </>
    );
  } else if (type === 'icon' || type === 'iconPlain') {
    const s = ICON_ONLY[sz as keyof typeof ICON_ONLY];
    iconSize = s.icon;
    if (type === 'icon') {
      const v = variants === 'primary' || variants === 'secondary' ? 'base' : variants;
      fg = tok(`button-${v}-color-fg-${look}`, pick(C.fg[v], look));
      box = {
        width: tok(`button-icon-only-${sz}-size`, s.box),
        height: tok(`button-icon-only-${sz}-size`, s.box),
        borderRadius: tok('button-icon-only-radius', 6),
        background: tok(`button-${v}-color-bg-${look}`, pick(C.bg[v], look)),
        boxShadow: `inset 0 0 0 ${tok('button-icon-only-border-width', 1)} ${tok(`button-${v}-color-border-${look}`, pick(C.border[v], look))}`,
        color: fg,
      };
      ring = tok(`button-icon-only-${sz}-focus-ring-radius`, 8);
    } else {
      fg = tok(`button-icon-only-plain-color-fg-${look}`, pick(C.plain, look));
      box = { width: tok(`button-icon-only-${sz}-icon-size`, s.icon), height: tok(`button-icon-only-${sz}-icon-size`, s.icon), background: tok('button-icon-only-plain-color-bg-default', '#00000000'), color: fg };
    }
    content = <Icon name={icon} size={tok(`button-icon-only-${sz}-icon-size`, s.icon)} />;
  } else {
    const v = variants === 'accent' ? 'accent' : 'base';
    fg = tok(v === 'accent' ? `button-text-color-fg-${look}` : `button-text-base-color-fg-${look}`, pick(C.text[v], look));
    box = { gap: tok('button-text-space-gap', 4), minHeight: 20, background: tok('button-text-color-bg-default', '#00000000'), color: fg };
    content = (
      <>
        {showLeadingIcon ? <Icon name={leadingIcon} size={tok('button-text-icon-size', 16)} /> : null}
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', minHeight: 20 }}>
          <span style={{ ...font('label', 14, 400), whiteSpace: 'nowrap' }}>{label}</span>
          {showUnderline ? <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: fg }} /> : null}
        </span>
        {showTrailingIcon ? <Icon name={trailingIcon} size={tok('button-text-icon-size', 16)} /> : null}
      </>
    );
  }

  return (
    <button
      {...rest}
      type={htmlType}
      disabled={off}
      aria-label={type === 'icon' || type === 'iconPlain' ? label : rest['aria-label']}
      className={className}
      {...it.pointer}
      {...it.focus}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        margin: 0,
        padding: 0,
        border: 0,
        outline: 'none',
        font: 'inherit',
        cursor: off ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        ...box,
        ...style,
      }}
    >
      {content}
      {showFocus || it.focusVisible ? <FocusRing radius={ring} /> : null}
    </button>
  );
}

Button.meta = { texts: { label: 'Button' } };
