// Steps: 여러 단계로 나뉜 작업에서 전체 단계 중 현재 위치와 진행 상태를 번호 동그라미와 연결선으로 보여 준다. <ol> 목록이며 누를 수 없다.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Steps › Steps (7885:17523) · content 슬롯
//   항목: _Item/Steps/Step (7885:17522) · status upcoming · current · completed, showConnector, number
// 토큰: DS 컴포넌트 명세 steps (동그라미 steps-<status>-indicator-color-*, 연결선 steps-connector-*)
//   상태 표시: upcoming [data-status="upcoming"] · current [aria-current="step"] · completed [data-status="completed"]
import type { CSSProperties } from 'react';
import { Icon, textStyle, tok } from '../shared';

export type StepStatus = 'upcoming' | 'current' | 'completed';

export interface StepsProps {
  /** 현재 단계 번호(1부터). 앞 단계는 completed, 뒤 단계는 upcoming. 0이면 모두 upcoming, 전체보다 크면 모두 completed */
  currentStep?: string | number;
  /** 전체 단계 수 */
  totalSteps?: string | number;
  /** 단계마다 상태를 직접 줄 때 (주면 currentStep · totalSteps 대신 쓴다) */
  statuses?: StepStatus[];
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

const SAY: Record<StepStatus, string> = { upcoming: '진행 전', current: '진행 중', completed: '완료' };

export function Step({ number, status = 'upcoming', showConnector = true }: { number: string | number; status?: StepStatus; showConnector?: boolean }) {
  return (
    <li
      data-status={status === 'current' ? undefined : status}
      aria-current={status === 'current' ? 'step' : undefined}
      aria-label={`${number}단계 ${SAY[status]}`}
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: tok('steps-indicator-size'),
          height: tok('steps-indicator-size'),
          borderRadius: tok('steps-indicator-radius'),
          background: tok(`steps-${status}-indicator-color-bg-default`),
          color: tok(`steps-${status}-indicator-color-fg-default`),
          ...textStyle('font-label-12-600'),
        }}
      >
        {status === 'completed' ? <Icon name="line/check" size={tok('steps-icon-size')} /> : number}
      </span>
      {showConnector ? (
        <span aria-hidden="true" style={{ flexShrink: 0, width: tok('steps-connector-size-width'), height: 0, borderTop: `${tok('steps-connector-border-width')} solid ${tok('steps-connector-color-border-default')}` }} />
      ) : null}
    </li>
  );
}

export function Steps({ currentStep = '2', totalSteps = '5', statuses, className, style, ...aria }: StepsProps) {
  const cur = Number(currentStep) || 0;
  const list: StepStatus[] = statuses ?? Array.from({ length: Math.max(0, Number(totalSteps) || 0) }, (_, i) => (i + 1 < cur ? 'completed' : i + 1 === cur ? 'current' : 'upcoming'));
  return (
    <ol aria-label={aria['aria-label'] ?? '진행 단계'} className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 0, margin: 0, padding: 0, listStyle: 'none', ...style }}>
      {list.map((s, i) => (
        <Step key={i} number={i + 1} status={s} showConnector={i < list.length - 1} />
      ))}
    </ol>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Steps.meta = { texts: { currentStep: '2', totalSteps: '5' } };
