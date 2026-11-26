// FieldLabel: 입력칸 · 선택칸 위에 놓는 항목명. showRequired로 필수 별표를 붙인다. 실제 <label>이라 htmlFor로 칸과 잇는다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Label › Label (9944:178) · emphasis 2, showRequired · label
// 토큰: DS 컴포넌트 명세 fieldLabel (글자 field-label[-subtle]-color-fg-default, 별표 field-label-icon-*, 간격 field-label-space-gap)
import type { LabelHTMLAttributes } from 'react';
import { Icon, textStyle, tok, visuallyHidden } from '../shared';

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** strong 기본 진한 글자 · subtle 회색 글자 */
  emphasis?: 'strong' | 'subtle';
  /** 필수 표시 별표 */
  showRequired?: boolean;
  label?: string;
}

export function FieldLabel({ emphasis = 'strong', showRequired = false, label = 'Label', style, children, ...rest }: FieldLabelProps) {
  return (
    <label
      {...rest}
      data-emphasis={emphasis === 'subtle' ? 'subtle' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: tok('field-label-space-gap'),
        ...textStyle('font-label-14-500'),
        color: emphasis === 'subtle' ? tok('field-label-subtle-color-fg-default') : tok('field-label-color-fg-default'),
        ...style,
      }}
    >
      <span>{children ?? label}</span>
      {showRequired ? (
        <span className="ds-field-label__required" style={{ position: 'relative', display: 'flex', alignItems: 'center', height: tok('font-label-14-500-line-height') }}>
          <Icon name="line/asterisk" size={tok('field-label-icon-size')} color={tok('field-label-icon-color-fg-default')} />
          <span style={visuallyHidden}>(필수)</span>
        </span>
      ) : null}
    </label>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
FieldLabel.meta = { texts: { label: 'Label' } };
