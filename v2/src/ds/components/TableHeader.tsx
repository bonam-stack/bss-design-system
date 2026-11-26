// TableHeader: 입력 · 조회 표(Table)의 머리 칸. 항목 제목 + 필수 표시(별표) + 안내 버튼 + 둘째 줄 보조 글자.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Table › TableHeader (5088:6298) · showSecondLabel · showRequired · showInfo · label · secondLabel
// 토큰: DS 컴포넌트 명세 table-formHeader (table-form-header-*, 제목 색 table-header-color-fg-default)
import type { HTMLAttributes, MouseEventHandler } from 'react';
import { Icon, textStyle, tok } from '../shared';
import { Button } from './Button';

export interface TableHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label?: string;
  secondLabel?: string;
  /** 제목 아래 보조 글자 줄 (단위 · 기준 · 입력 형식) */
  showSecondLabel?: boolean;
  /** 필수 입력 표시(별표) */
  showRequired?: boolean;
  /** 제목 옆 안내 버튼 (Tooltip 등으로 추가 설명) */
  showInfo?: boolean;
  onInfoClick?: MouseEventHandler<HTMLButtonElement>;
  /** 안내 버튼의 보조기기용 이름 */
  infoLabel?: string;
}

export function TableHeader({ label = 'Header', secondLabel = 'SubText', showSecondLabel = true, showRequired = true, showInfo = false, onInfoClick, infoLabel = 'Info', style, ...rest }: TableHeaderProps) {
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: tok('table-form-header-space-gap'),
        boxSizing: 'border-box',
        minHeight: tok('table-form-header-size-min-height'),
        padding: `${tok('table-form-header-space-padding-y')} ${tok('table-form-header-space-padding-x')}`,
        background: tok('table-form-header-color-bg-default'),
        borderBottom: `${tok('table-border-width')} solid ${tok('table-form-header-color-border-default')}`,
        textAlign: 'left',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tok('table-form-header-icon-space-gap') }}>
        <span style={{ ...textStyle('font-label-14-500'), color: tok('table-header-color-fg-default'), minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
        {showRequired ? (
          <span role="img" aria-label="필수" style={{ display: 'inline-flex' }}>
            <Icon name="line/asterisk" size={tok('table-form-header-icon-size')} color={tok('table-form-header-icon-color-fg-default')} />
          </span>
        ) : null}
        {showInfo ? <Button type="iconPlain" size="small" icon="line/info" label={infoLabel} onClick={onInfoClick} /> : null}
      </div>
      {showSecondLabel ? <span style={{ ...textStyle('font-label-13-400'), color: tok('table-form-header-sub-label-color-fg-default') }}>{secondLabel}</span> : null}
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
TableHeader.meta = { texts: { label: 'Header', secondLabel: 'SubText' } };
