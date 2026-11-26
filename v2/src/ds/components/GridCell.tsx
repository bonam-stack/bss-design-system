// GridCell: 데이터 그리드(Data Grid)의 본문 칸. content 슬롯(children)에 글자 · 배지 · 입력 등을 넣는다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Data Grid › GridCell (9264:10041) · importance 2 × state 4 × invalid 2, showLeadingSpace · showTrailingSpace, content 슬롯(추천 Item/GridCell/Text 9264:10031, type plain · bullet, text)
// 토큰: DS 컴포넌트 명세 table-gridCell (table-grid-cell-*, 바탕 table-cell-color-bg-<상태> · table-selected-cell · table-attention-cell, 목록 점 table-bullet-*)
// 바탕 우선순위 (Guideline · State Priority): disabled › invalid › selected › attention › hover › default
import type { HTMLAttributes, ReactNode } from 'react';
import { textStyle, tok, useInteraction } from '../shared';

export interface GridCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** none 기본 · attention 확인이 필요한 값 (노란 바탕) */
  importance?: 'none' | 'attention';
  /** 모양을 이 상태로 고정 (문서 예시용). 주지 않으면 hover는 포인터를 따른다 */
  state?: 'default' | 'hover' | 'selected' | 'disabled';
  /** 입력값 오류 */
  invalid?: boolean | 'true' | 'false';
  /** 칸 안 정렬: 글자 · 날짜 left, 숫자 right, 행 선택 체크박스 center */
  align?: 'left' | 'center' | 'right';
  showLeadingSpace?: boolean;
  showTrailingSpace?: boolean;
  /** Figma content 슬롯. 없으면 Item/GridCell/Text(text · textType)를 그린다 */
  children?: ReactNode;
  /** 기본 칸 글자 (Item/GridCell/Text의 text) */
  text?: string;
  /** 기본 칸 글자 형태 (Item/GridCell/Text의 type): plain 일반 · bullet 앞에 점 */
  textType?: 'plain' | 'bullet';
}

const JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;

export function GridCell({ importance = 'none', state, invalid = false, align = 'left', showLeadingSpace = false, showTrailingSpace = false, children, text = 'Text', textType = 'plain', style, ...rest }: GridCellProps) {
  const it = useInteraction();
  const bad = invalid === true || invalid === 'true';
  const look = state ?? (it.hover ? 'hover' : 'default');
  const bg =
    look === 'disabled'
      ? tok('table-cell-color-bg-disabled')
      : bad
        ? tok('table-cell-color-bg-error')
        : look === 'selected'
          ? tok('table-selected-cell-color-bg-default')
          : importance === 'attention'
            ? tok('table-attention-cell-color-bg-default')
            : look === 'hover'
              ? tok('table-cell-color-bg-hover')
              : tok('table-cell-color-bg-default');
  const space = <span aria-hidden="true" style={{ flexShrink: 0, width: tok('table-grid-cell-space-padding-x') }} />;

  return (
    <div
      role="gridcell"
      aria-selected={look === 'selected' || undefined}
      aria-disabled={look === 'disabled' || undefined}
      aria-invalid={bad || undefined}
      {...rest}
      {...it.pointer}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY[align],
        boxSizing: 'border-box',
        minWidth: 0,
        minHeight: tok('table-grid-cell-size-min-height'),
        padding: `${tok('table-grid-cell-space-padding-y')} ${tok('table-grid-cell-space-padding-x')}`,
        background: bg,
        color: tok('table-cell-color-fg-default'),
        borderBottom: `${tok('table-border-width')} solid ${tok('table-grid-cell-color-border-default')}`,
        ...textStyle('font-label-14-400'),
        ...style,
      }}
    >
      {showLeadingSpace ? space : null}
      {children ?? (
        <span style={{ display: 'flex', alignItems: 'flex-start', gap: tok('table-bullet-space-gap'), minWidth: 0, textAlign: align }}>
          {textType === 'bullet' ? (
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: tok('size-8'), height: tok('font-label-14-400-line-height') }}>
              <span style={{ width: tok('table-bullet-size'), height: tok('table-bullet-size'), borderRadius: tok('table-bullet-radius'), background: tok('table-bullet-color-bg-default') }} />
            </span>
          ) : null}
          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{text}</span>
        </span>
      )}
      {showTrailingSpace ? space : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
GridCell.meta = { texts: { text: 'Text' } };
