// DataItem: 레이블과 값을 한 쌍으로 보여 주는 읽기 전용 데이터 항목.
// Figma: BSS_DS_Library_Component_v2.0 ❖ List › DataItem (8466:1835) · showValue · label · value
// 토큰: DS 컴포넌트 명세 dataItem (data-item-label · data-item-value 글자 색, data-item-space-gap)
import type { HTMLAttributes, ReactNode } from 'react';
import { textStyle, tok } from '../shared';

export interface DataItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label?: string;
  /** 값 (글자 대신 다른 요소를 넣을 수도 있다) */
  value?: ReactNode;
  showValue?: boolean;
}

export function DataItem({ label = 'Label', value = 'Text', showValue = true, style, ...rest }: DataItemProps) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'flex-start', gap: tok('data-item-space-gap'), ...style }}>
      <span style={{ ...textStyle('font-label-14-400'), color: tok('data-item-label-color-fg-default'), flexShrink: 0 }}>{label}</span>
      {showValue ? <span style={{ ...textStyle('font-label-14-600'), color: tok('data-item-value-color-fg-default'), minWidth: 0, overflowWrap: 'anywhere' }}>{value}</span> : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
DataItem.meta = { texts: { label: 'Label', value: 'Text' } };
