// Button: 실제 <button>. type 5종(square · round · icon · iconPlain · text) × appearance × size × state.
// Figma: BSS DS Library v2.0 ❖ Button (appearance · showLeadingIcon · showTrailingIcon · showUnderline · showFocus · label)
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { FocusRing, Icon, font, tok, tokState, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'fixed';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** square 기본 버튼 · round 알약형 · icon 테두리 아이콘 · iconPlain 아이콘만 · text 글자 링크형 */
  type?: 'square' | 'round' | 'icon' | 'iconPlain' | 'text';
  /** square: primary · secondary · base · accent · danger / round · icon: base · accent · danger / text: base · accent */
  appearance?: 'primary' | 'secondary' | 'base' | 'accent' | 'danger';
  /** @deprecated 예전 이름. Figma에서 appearance로 바뀌었다 */
  variants?: ButtonProps['appearance'];
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

// 크기별 글자 스타일 (DS 컴포넌트 명세 textStyles). 높이 · 여백 · 모서리 · 아이콘은 모두 크기별 토큰으로 읽는다
const TEXT = { xlarge: font('label', 16, 600), large: font('label', 15, 600), medium: font('label', 15, 500), small: font('label', 14, 500) };

export function Button({ type = 'square', appearance, variants: legacy, size = 'xlarge', state, label = 'Button', showLeadingIcon = false, showTrailingIcon = false, showUnderline = false, showFocus = false, leadingIcon = 'line/search', trailingIcon = 'line/search', icon = 'line/search', htmlType = 'button', disabled, style, className, ...rest }: ButtonProps) {
  const it = useInteraction();
  const variants = appearance ?? legacy ?? 'base';
  const off = disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const sz = (type === 'text' ? 'fixed' : type !== 'square' && size === 'xlarge' ? 'large' : size) as Size;

  let box: CSSProperties = {};
  let fg = '';
  let ring = tok('focus-ring-radius');
  let content: JSX.Element;

  if (type === 'square' || type === 'round') {
    const pre = type === 'square' ? `button-action-${sz}` : `button-inline-${sz}`;
    const v = type === 'round' && variants === 'primary' ? 'base' : variants;
    fg = tokState(`button-${v}-color-fg`, look);
    box = {
      height: tok(`${pre}-size-height`),
      minWidth: tok(`${pre}-size-min-width`),
      padding: `0 ${tok(`${pre}-space-padding-x`)}`,
      gap: tok(type === 'square' ? 'button-action-space-gap' : 'button-inline-space-gap'),
      borderRadius: type === 'square' ? tok(`${pre}-radius`) : tok('button-inline-radius'),
      background: tokState(`button-${v}-color-bg`, look),
      boxShadow: v === 'primary' ? undefined : `inset 0 0 0 ${tok(type === 'square' ? 'button-action-border-width' : 'button-inline-border-width')} ${tokState(`button-${v}-color-border`, look)}`,
      color: fg,
    };
    ring = type === 'square' ? tok(`${pre}-focus-ring-radius`) : tok(`${pre}-focus-ring-radius`);
    content = (
      <>
        {showLeadingIcon ? <span className="ds-button__iconslot" style={{ display: 'inline-flex' }}><Icon name={leadingIcon} size={tok(`${pre}-icon-size`)} /></span> : null}
        <span className="ds-button__label" style={{ ...TEXT[sz as keyof typeof TEXT], whiteSpace: 'nowrap', textAlign: 'center' }}>{label}</span>
        {showTrailingIcon ? <span className="ds-button__trailing" style={{ display: 'inline-flex' }}><Icon name={trailingIcon} size={tok(`${pre}-icon-size`)} /></span> : null}
      </>
    );
  } else if (type === 'icon' || type === 'iconPlain') {
    if (type === 'icon') {
      const v = variants === 'primary' || variants === 'secondary' ? 'base' : variants;
      fg = tokState(`button-${v}-color-fg`, look);
      box = {
        width: tok(`button-icon-only-${sz}-size`),
        height: tok(`button-icon-only-${sz}-size`),
        borderRadius: tok('button-icon-only-radius'),
        background: tokState(`button-${v}-color-bg`, look),
        boxShadow: `inset 0 0 0 ${tok('button-icon-only-border-width')} ${tokState(`button-${v}-color-border`, look)}`,
        color: fg,
      };
      ring = tok(`button-icon-only-${sz}-focus-ring-radius`);
    } else {
      fg = tokState(`button-icon-only-plain-color-fg`, look);
      box = { width: tok(`button-icon-only-${sz}-icon-size`), height: tok(`button-icon-only-${sz}-icon-size`), background: tok('button-icon-only-plain-color-bg-default'), color: fg };
    }
    content = <Icon name={icon} size={tok(`button-icon-only-${sz}-icon-size`)} />;
  } else {
    const v = variants === 'accent' ? 'accent' : 'base';
    fg = tok(v === 'accent' ? `button-text-color-fg-${look}` : `button-text-base-color-fg-${look}`);
    box = { gap: tok('button-text-space-gap'), minHeight: tok('font-label-14-400-line-height'), background: tok('button-text-color-bg-default'), color: fg };
    content = (
      <>
        {showLeadingIcon ? <span className="ds-button__iconslot" style={{ display: 'inline-flex' }}><Icon name={leadingIcon} size={tok('button-text-icon-size')} /></span> : null}
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', minHeight: tok('font-label-14-400-line-height') }}>
          <span className="ds-button__label" style={{ ...font('label', 14, 400), whiteSpace: 'nowrap' }}>{label}</span>
          {showUnderline ? <span className="ds-button__underline" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: tok('border-width-1'), background: fg }} /> : null}
        </span>
        {showTrailingIcon ? <span className="ds-button__trailing" style={{ display: 'inline-flex' }}><Icon name={trailingIcon} size={tok('button-text-icon-size')} /></span> : null}
      </>
    );
  }

  return (
    <button
      {...rest}
      type={htmlType}
      disabled={off}
      aria-label={type === 'icon' || type === 'iconPlain' ? label : rest['aria-label']}
      className={['ds-button__root', className].filter(Boolean).join(' ')}
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
      {showFocus || it.focusVisible ? <FocusRing radius={ring} className="ds-button__focusring" /> : null}
    </button>
  );
}

Button.meta = { texts: { label: 'Button' }, icons: { leadingIcon: 'line/search', trailingIcon: 'line/search', icon: 'line/search' } };
