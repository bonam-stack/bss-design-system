// TableCell: 입력 · 조회 표(Table)의 본문 칸. content 슬롯(children)에 글자 · 입력 · 버튼 등을 넣는다. 상태 변형이 없다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Table › TableCell (5220:1324) · content 슬롯, 추천 아이템 Item/TableCell/Text (5088:6327, type plain · bullet, text)
// 토큰: DS 컴포넌트 명세 table-formCell (table-form-cell-*, 칸 바탕 · 글자 table-cell-color-*-default, 목록 점 table-bullet-*)
import type { HTMLAttributes, ReactNode } from 'react';
import { textStyle, tok } from '../shared';

export interface TableCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Figma content 슬롯. 없으면 Item/TableCell/Text(text · textType)를 그린다 */
  children?: ReactNode;
  /** 기본 칸 글자 (Item/TableCell/Text의 text) */
  text?: string;
  /** 기본 칸 글자 형태 (Item/TableCell/Text의 type): plain 일반 · bullet 앞에 점 */
  textType?: 'plain' | 'bullet';
}

export function TableCell({ children, text = 'Text', textType = 'plain', style, ...rest }: TableCellProps) {
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        minWidth: 0,
        minHeight: tok('table-form-cell-size-min-height'),
        padding: `${tok('table-form-cell-space-padding-y')} ${tok('table-form-cell-space-padding-x')}`,
        background: tok('table-cell-color-bg-default'),
        color: tok('table-cell-color-fg-default'),
        borderBottom: `${tok('table-border-width')} solid ${tok('table-form-cell-color-border-default')}`,
        ...textStyle('font-label-14-400'),
        ...style,
      }}
    >
      {children ?? (
        <span style={{ display: 'flex', alignItems: 'flex-start', gap: tok('table-bullet-space-gap'), minWidth: 0 }}>
          {textType === 'bullet' ? (
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: tok('size-8'), height: tok('font-label-14-400-line-height') }}>
              <span style={{ width: tok('table-bullet-size'), height: tok('table-bullet-size'), borderRadius: tok('table-bullet-radius'), background: tok('table-bullet-color-bg-default') }} />
            </span>
          ) : null}
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{text}</span>
        </span>
      )}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
TableCell.meta = { texts: { text: 'Text' } };
