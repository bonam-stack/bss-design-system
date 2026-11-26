// Snackbar: 작업 결과를 제목과 항목별 건수로 잠깐 알리는 어두운 알림. 액션 버튼 1개와 닫기 버튼을 둘 수 있다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Toast / Snackbar › Snackbar (7436:389) · showAction · showClose · title · statusContent 슬롯
//        처리 현황 항목 _Item/Snackbar/Status (8865:404) · tone 3, showSeparator · label · count
// 토큰: DS 컴포넌트 명세 snackbar (액션 버튼은 button-inline base large, 닫기는 button-iconOnly plain medium에 snackbar-actionGroup 색을 덮어 쓴다)
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { textStyle, tok } from '../shared';
import { Button } from './Button';

export type SnackbarStatusTone = 'info' | 'success' | 'danger';

export interface SnackbarStatusProps {
  tone?: SnackbarStatusTone;
  /** 앞 구분 점 (보통 둘째 항목부터) */
  showSeparator?: boolean;
  label?: string;
  count?: string;
  style?: CSSProperties;
}

/** 처리 현황 항목 (_Item/Snackbar/Status): 구분 점 · 라벨 · 건수 */
export function SnackbarStatus({ tone = 'info', showSeparator = true, label = 'Label', count = '10', style }: SnackbarStatusProps) {
  return (
    <span data-tone={tone} style={{ display: 'inline-flex', alignItems: 'center', gap: tok('snackbar-group-space-gap'), ...style }}>
      {showSeparator ? <span aria-hidden="true" style={{ flexShrink: 0, width: tok('snackbar-separator-size'), height: tok('snackbar-separator-size'), borderRadius: tok('snackbar-separator-radius'), background: tok('snackbar-separator-color-bg-default') }} /> : null}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tok('snackbar-label-space-gap'), whiteSpace: 'nowrap' }}>
        <span style={{ ...textStyle('font-label-13-500'), color: tok('snackbar-label-color-fg-default') }}>{label}</span>
        <span style={{ ...textStyle('font-label-14-500'), fontVariantNumeric: 'tabular-nums', color: tok(`snackbar-${tone}-count-color-fg-default`) }}>{count}</span>
      </span>
    </span>
  );
}

export interface SnackbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  showAction?: boolean;
  showClose?: boolean;
  /** 액션 버튼 글자 */
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  /** statusContent 슬롯: 처리 현황 항목. 주지 않으면 status 목록으로 그린다 */
  statusContent?: ReactNode;
  /** statusContent를 주지 않을 때 그릴 처리 현황 항목. 빈 배열이면 제목만 보인다 */
  status?: SnackbarStatusProps[];
}

const DEFAULT_STATUS: SnackbarStatusProps[] = [
  { tone: 'info', label: 'Label', count: '10', showSeparator: false },
  { tone: 'success', label: 'Label', count: '10' },
  { tone: 'danger', label: 'Label', count: '10' },
];

export function Snackbar({ title = 'Title', showAction = true, showClose = true, actionLabel = 'Button', onAction, onClose, statusContent, status = DEFAULT_STATUS, style, ...rest }: SnackbarProps) {
  const fg = tok('snackbar-action-group-color-fg-default');
  const content = statusContent ?? (status.length ? status.map((s, i) => <SnackbarStatus key={i} {...s} />) : null);
  return (
    <div
      role="status"
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tok('snackbar-space-gap'),
        boxSizing: 'border-box',
        padding: `${tok('snackbar-space-padding-y')} ${tok('snackbar-space-padding-x')}`,
        borderRadius: tok('snackbar-radius'),
        background: tok('snackbar-color-bg-default'),
        backdropFilter: `blur(${tok('snackbar-effect-blur')})`,
        WebkitBackdropFilter: `blur(${tok('snackbar-effect-blur')})`,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: tok('snackbar-content-space-gap'), minWidth: 0 }}>
        <span style={{ ...textStyle('font-label-14-700'), color: tok('snackbar-title-color-fg-default') }}>{title}</span>
        {content ? <div style={{ display: 'flex', alignItems: 'center', gap: tok('snackbar-group-space-gap'), flexWrap: 'wrap' }}>{content}</div> : null}
      </div>
      {showAction || showClose ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: tok('snackbar-action-group-space-gap'), flexShrink: 0 }}>
          {showAction ? (
            <Button
              type="round"
              appearance="base"
              size="large"
              label={actionLabel}
              onClick={onAction}
              style={{ background: tok('snackbar-action-group-color-bg-default'), boxShadow: `inset 0 0 0 ${tok('snackbar-action-group-border-width')} ${tok('snackbar-action-group-color-border-default')}`, color: fg }}
            />
          ) : null}
          {showClose ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: tok('snackbar-close-button-size'), height: tok('snackbar-close-button-size') }}>
              <Button type="iconPlain" size="medium" icon="line/close" label="닫기" onClick={onClose} style={{ color: fg }} />
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

Snackbar.meta = { texts: { title: 'Title', actionLabel: 'Button' } };
