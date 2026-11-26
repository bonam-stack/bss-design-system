// Toast: 작업 결과를 한 줄로 잠깐 알리는 어두운 알림. 액션 · 닫기는 없다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Toast / Snackbar › Toast (7427:238) · status 5, message
// 토큰: DS 컴포넌트 명세 toast (앞 아이콘은 컬러 아이콘이라 색 토큰이 없다)
import type { HTMLAttributes } from 'react';
import { Icon, textStyle, tok } from '../shared';

export type ToastStatus = 'default' | 'success' | 'warning' | 'danger' | 'loading';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** default는 아이콘 없음, 나머지는 앞 컬러 아이콘만 바뀐다 */
  status?: ToastStatus;
  message?: string;
}

// Figma ColorIconSlot: status별 colored 아이콘
const ICON: Record<Exclude<ToastStatus, 'default'>, string> = {
  success: 'colored/success',
  warning: 'colored/warning',
  danger: 'colored/error',
  loading: 'colored/loading',
};

export function Toast({ status = 'default', message = 'Message', style, ...rest }: ToastProps) {
  return (
    <div
      role={status === 'danger' ? 'alert' : 'status'}
      aria-busy={status === 'loading' || undefined}
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tok('toast-space-gap'),
        boxSizing: 'border-box',
        padding: `${tok('toast-space-padding-y')} ${tok('toast-space-padding-x')}`,
        borderRadius: tok('toast-radius'),
        background: tok('toast-color-bg-default'),
        backdropFilter: `blur(${tok('toast-effect-blur')})`,
        WebkitBackdropFilter: `blur(${tok('toast-effect-blur')})`,
        color: tok('toast-color-fg-default'),
        ...style,
      }}
    >
      {status !== 'default' ? <Icon name={ICON[status]} size={tok('toast-icon-size')} /> : null}
      <span style={{ ...textStyle('font-label-14-500'), whiteSpace: 'nowrap' }}>{message}</span>
    </div>
  );
}

Toast.meta = { texts: { message: 'Message' } };
