// RadioGroup: Radio를 가로로 놓고 하나만 고르게 묶는다. children으로 Radio를 넣거나 options로 넘긴다.
// Figma: BSS DS Library v2.0 ❖ RadioGroup (size 2, content 슬롯, 간격 radio/group/space/gap 12)
import { useId, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Radio, RadioGroupContext } from './Radio';
import { tok } from '../shared';

export interface RadioGroupProps {
  size?: 'large' | 'medium';
  /** 고른 값. 주면 제어 컴포넌트 */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  /** children 대신 넘기는 항목 */
  options?: { value: string; label: string; disabled?: boolean }[];
  /** Figma content 슬롯: Radio들 */
  children?: ReactNode;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

const SAMPLE = [
  { value: '1', label: 'Label' },
  { value: '2', label: 'Label' },
  { value: '3', label: 'Label' },
];

export function RadioGroup({ size = 'large', value, defaultValue, onValueChange, name, disabled, options, children, className, style, ...aria }: RadioGroupProps) {
  const list: RadioGroupProps['options'] = children ? undefined : options ?? SAMPLE;
  const [inner, setInner] = useState(defaultValue ?? list?.[0]?.value ?? '');
  const auto = useId();
  const current = value ?? inner;
  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? auto,
        value: current,
        size,
        disabled,
        select: (v) => {
          if (value === undefined) setInner(v);
          onValueChange?.(v);
        },
      }}
    >
      <div role="radiogroup" aria-label={aria['aria-label']} className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: tok('radio-group-space-gap'), minHeight: tok(size === 'large' ? 'font-label-16-500-line-height' : 'font-label-14-400-line-height'), ...style }}>
        {children ?? list!.map((o) => <Radio key={o.value} value={o.value} label={o.label} disabled={o.disabled} />)}
      </div>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.meta = { texts: {} };
