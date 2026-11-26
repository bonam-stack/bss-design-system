// GridHeader: 데이터 그리드(Data Grid)의 머리 칸. 열 제목 + 안내 · 정렬 아이콘 버튼, 또는 전체 선택 체크박스.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Data Grid › GridHeader (9264:9962) · content 2 × align 3 (text: left · center · right, checkbox: center), showSort · showInfo · showLeadingSpace · showTrailingSpace · label
// 토큰: DS 컴포넌트 명세 table-gridHeader (table-grid-header-*, 제목 색 table-header-color-fg-default). 정렬 · 안내 버튼은 Button(iconPlain small), 체크박스는 Checkbox(medium)
import type { HTMLAttributes, MouseEventHandler } from 'react';
import { textStyle, tok } from '../shared';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import type { CheckboxSelection } from './Checkbox';

export interface GridHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** text 열 제목 · checkbox 행 선택 열의 전체 선택 */
  content?: 'text' | 'checkbox';
  /** 열 데이터와 같은 방향 (checkbox는 늘 center) */
  align?: 'left' | 'center' | 'right';
  label?: string;
  /** 정렬 버튼 (content=text) */
  showSort?: boolean;
  /** 안내 버튼 (content=text) */
  showInfo?: boolean;
  /** 앞 · 뒤 여백 (첫 열 · 끝 열) */
  showLeadingSpace?: boolean;
  showTrailingSpace?: boolean;
  onSortClick?: MouseEventHandler<HTMLButtonElement>;
  onInfoClick?: MouseEventHandler<HTMLButtonElement>;
  /** content=checkbox: 전체 선택 값. 주면 제어 컴포넌트 */
  selection?: CheckboxSelection;
  defaultSelection?: CheckboxSelection;
  onSelectionChange?: (selection: CheckboxSelection) => void;
}

const JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;

export function GridHeader({ content = 'text', align = 'left', label = 'Header', showSort = true, showInfo = false, showLeadingSpace = false, showTrailingSpace = false, onSortClick, onInfoClick, selection, defaultSelection, onSelectionChange, style, ...rest }: GridHeaderProps) {
  const check = content === 'checkbox';
  const space = <span aria-hidden="true" style={{ flexShrink: 0, width: tok('table-grid-header-space-padding-x') }} />;
  return (
    <div
      role="columnheader"
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY[check ? 'center' : align],
        gap: tok('table-grid-header-space-gap'),
        boxSizing: 'border-box',
        minHeight: tok('table-grid-header-size-min-height'),
        padding: `${tok('table-grid-header-space-padding-y')} ${tok('table-grid-header-space-padding-x')}`,
        background: tok('table-grid-header-color-bg-default'),
        borderBottom: `${tok('table-border-width')} solid ${tok('table-grid-header-color-border-default')}`,
        color: tok('table-header-color-fg-default'),
        ...style,
      }}
    >
      {showLeadingSpace ? space : null}
      {check ? (
        <Checkbox size="medium" showLabel={false} label={label} selection={selection} defaultSelection={defaultSelection} onSelectionChange={onSelectionChange} />
      ) : (
        <>
          <span style={{ ...textStyle('font-label-14-600'), minWidth: 0, overflowWrap: 'anywhere', textAlign: align }}>{label}</span>
          {showInfo ? <Button type="iconPlain" size="small" icon="line/info" label="Info" onClick={onInfoClick} /> : null}
          {showSort ? <Button type="iconPlain" size="small" icon="line/sort" label="Sort" onClick={onSortClick} /> : null}
        </>
      )}
      {showTrailingSpace ? space : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
GridHeader.meta = { texts: { label: 'Header' } };
