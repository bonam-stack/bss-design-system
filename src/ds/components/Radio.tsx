// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/radio/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=4971-31497
import data from '../../../components/radio/component.json';

import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** Radio 속성 */
export interface RadioProps {
  /** 기본값 false */
  showFocus?: boolean;
  /** 기본값 "Label" */
  label?: string;
  /** 기본값 true */
  showLabel?: boolean;
  /** 변형 · 기본값 "unchecked" */
  selection?: "unchecked" | "checked";
  /** 변형 · 기본값 "large" */
  size?: "large" | "medium";
  /** 변형 · 기본값 "default" */
  state?: "default" | "hover" | "pressed" | "disabled";
}

const icons: IconMap = {

};

/**
 * 여러 선택지 중 하나를 고릅니다. size 2종(large·medium) × selection 2종(unchecked·checked) × state 4종. showLabel·label로 라벨을, showFocus로 포커스 링을 표시하며 showFocus는 disabled를 포함한 모든 상태에서 사용합니다. 색상·치수는 selectionControl/*·radio/* 배리어블에 연결합니다(포커스 링은 focusRing/*). 여러 개를 묶어 쓸 때는 RadioGroup을 씁니다.
 */
export const Radio = createFigmaComponent<RadioProps>(data as ComponentData, icons, "Radio");
