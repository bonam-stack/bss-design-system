// Toolbar: 단계 진행 정보(제목 · Steps · 단계 수)를 왼쪽에, 보기 도구(배율 셀렉트 · 보기 모드 버튼 · 토글 버튼)를 오른쪽에 두는 막대.
// Figma: BSS_DS_Library_Component_v2.0 ❖ Toolbar › Toolbar (9080:243) · title · currentStep · totalSteps
//   토글 버튼: _Item/Toolbar/ToggleButton (9080:257) · selection 2 × state 4, showFocus (아이콘은 손 도구로 고정)
// 토큰: DS 컴포넌트 명세 toolbar · toggleButton. 안의 Steps는 steps, 셀렉트는 select medium + field, 버튼은 button-action base medium,
//   구분선은 Divider(세로)를 쓴다
import { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { Button } from './Button';
import { Divider } from './Divider';
import { Steps } from './Steps';
import { FocusRing, Icon, textStyle, tok, tokState, useInteraction } from '../shared';

type Look = 'default' | 'hover' | 'pressed' | 'disabled';
export type ToggleSelection = 'unselected' | 'selected';

export interface ToolbarToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** 켜짐 상태. 주면 제어 컴포넌트 (onSelectionChange로 새 값을 받는다) */
  selection?: ToggleSelection;
  defaultSelection?: ToggleSelection;
  onSelectionChange?: (selection: ToggleSelection) => void;
  /** 모양을 이 상태로 고정 (문서 예시용) */
  state?: Look;
  showFocus?: boolean;
  /** icons/svg 아래 이름 (Figma: 손 도구) */
  icon?: string;
  /** 보조기기에 읽어 줄 이름 */
  label?: string;
}

/** _Item/Toolbar/ToggleButton: 누를 때마다 선택 · 해제가 바뀌는 아이콘 버튼 (aria-pressed) */
export function ToolbarToggleButton({ selection, defaultSelection = 'unselected', onSelectionChange, state, showFocus = false, icon = 'line/hand-palm', label = '손 도구', disabled, onClick, style, ...rest }: ToolbarToggleButtonProps) {
  const [inner, setInner] = useState<ToggleSelection>(defaultSelection);
  const on = (selection ?? inner) === 'selected';
  const it = useInteraction();
  const off = disabled || state === 'disabled';
  const look: Look = off ? 'disabled' : state && state !== 'default' ? state : it.pressed ? 'pressed' : it.hover ? 'hover' : 'default';
  const pre = on ? 'toggle-button-selected-color' : 'toggle-button-color';
  return (
    <button
      {...rest}
      type="button"
      aria-pressed={on}
      aria-label={label}
      disabled={off}
      onClick={(e) => {
        const next: ToggleSelection = on ? 'unselected' : 'selected';
        if (selection === undefined) setInner(next);
        onSelectionChange?.(next);
        onClick?.(e);
      }}
      {...it.pointer}
      {...it.focus}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        border: 0,
        outline: 'none',
        width: tok('toggle-button-size'),
        height: tok('toggle-button-size'),
        borderRadius: tok('toggle-button-radius'),
        background: tokState(`${pre}-bg`, look),
        boxShadow: `inset 0 0 0 ${tok('toggle-button-border-width')} ${tokState(`${pre}-border`, look)}`,
        color: tokState(`${pre}-fg`, look),
        cursor: off ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <Icon name={icon} size={tok('toggle-button-icon-size')} />
      {showFocus || it.focusVisible ? <FocusRing radius={tok('toggle-button-focus-ring-radius')} /> : null}
    </button>
  );
}

/** 배율 셀렉트 (Select size medium, 라벨 · 도움말 없음). 실제 <select>를 쓴다 */
function ZoomSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const it = useInteraction();
  const look = it.focused ? 'focus' : it.hover ? 'hover' : 'default';
  return (
    <span {...it.pointer} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <select
        aria-label="화면 배율"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...it.focus}
        style={{
          appearance: 'none',
          boxSizing: 'border-box',
          margin: 0,
          border: 0,
          outline: 'none',
          height: tok('select-medium-size-height'),
          padding: `0 calc(${tok('select-medium-space-padding-end')} + ${tok('select-medium-icon-size')} + ${tok('select-space-gap')}) 0 ${tok('select-medium-space-padding-start')}`,
          borderRadius: tok('select-radius'),
          background: tokState('field-color-bg', look),
          boxShadow: `inset 0 0 0 ${tok('select-border-width')} ${tokState('field-color-border', look)}`,
          color: tokState('field-color-fg', look),
          ...textStyle('font-label-15-400'),
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="line/chevron-down" size={tok('select-medium-icon-size')} color={tokState('field-color-fg', look)} style={{ position: 'absolute', right: tok('select-medium-space-padding-end'), pointerEvents: 'none' }} />
      {it.focusVisible ? <FocusRing radius={tok('select-medium-focus-ring-radius')} /> : null}
    </span>
  );
}

export interface ToolbarProps {
  /** 제목 */
  title?: string;
  /** 현재 단계 번호 */
  currentStep?: string;
  /** 전체 단계 수 */
  totalSteps?: string;
  /** 배율 셀렉트 값 · 목록 */
  zoom?: string;
  defaultZoom?: string;
  zoomOptions?: string[];
  onZoomChange?: (zoom: string) => void;
  /** 보기 모드 버튼 글 · 누를 때 */
  viewLabel?: string;
  onView?: () => void;
  /** 토글 버튼 켜짐 상태. 주면 제어 컴포넌트 */
  selection?: ToggleSelection;
  defaultSelection?: ToggleSelection;
  onSelectionChange?: (selection: ToggleSelection) => void;
  /** 토글 버튼 모양을 이 상태로 고정 (문서 예시용). Toolbar 자체에는 상태가 없다 */
  state?: Look;
  /** 토글 버튼에 포커스 링을 늘 표시 */
  showFocus?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ZOOMS = ['50%', '75%', '100%', '110%', '125%', '150%', '200%'];

export function Toolbar({ title = 'Title', currentStep = '2', totalSteps = '8', zoom, defaultZoom = '110%', zoomOptions = ZOOMS, onZoomChange, viewLabel = '전체뷰', onView, selection, defaultSelection, onSelectionChange, state, showFocus = false, className, style }: ToolbarProps) {
  const [innerZoom, setInnerZoom] = useState(defaultZoom);
  const z = zoom ?? innerZoom;
  const options = zoomOptions.includes(z) ? zoomOptions : [...zoomOptions, z];
  return (
    <div
      role="toolbar"
      aria-label={title}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tok('toolbar-space-gap'),
        boxSizing: 'border-box',
        padding: `${tok('toolbar-space-padding-y')} ${tok('toolbar-space-padding-x')}`,
        borderRadius: tok('toolbar-radius'),
        background: tok('toolbar-color-bg-default'),
        boxShadow: tok('toolbar-shadow'),
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', gap: tok('toolbar-space-gap') }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tok('toolbar-title-space-gap') }}>
          <span style={{ ...textStyle('font-label-14-600'), color: tok('toolbar-title-color-fg-default'), whiteSpace: 'nowrap' }}>{title}</span>
          <Steps currentStep={currentStep} totalSteps={totalSteps} />
          <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{ ...textStyle('font-label-14-500'), fontVariantNumeric: 'tabular-nums', color: tok('toolbar-current-count-color-fg-default') }}>{currentStep}</span>
            <span style={{ ...textStyle('font-label-14-500'), color: tok('toolbar-separator-color-fg-default') }}>/</span>
            <span style={{ ...textStyle('font-label-14-500'), fontVariantNumeric: 'tabular-nums', color: tok('toolbar-count-color-fg-default') }}>{totalSteps}</span>
          </span>
        </div>
        <Divider direction="vertical" length="auto" style={{ alignSelf: 'stretch' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tok('toolbar-group-space-gap') }}>
        <ZoomSelect
          value={z}
          options={options}
          onChange={(v) => {
            if (zoom === undefined) setInnerZoom(v);
            onZoomChange?.(v);
          }}
        />
        <Button type="square" variants="base" size="medium" label={viewLabel} onClick={onView} />
        <ToolbarToggleButton selection={selection} defaultSelection={defaultSelection} onSelectionChange={onSelectionChange} state={state} showFocus={showFocus} />
      </div>
    </div>
  );
}

/** 포털 미리보기 · 예시의 기본 글 */
Toolbar.meta = { texts: { title: 'Title', currentStep: '2', totalSteps: '8' } };
