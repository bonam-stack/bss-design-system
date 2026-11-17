// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/checkbox/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=2778-16890
import data from '../../../components/checkbox/component.json';
import icon0 from '../../../icons/svg/line/indeterminate.svg?raw';
import icon1 from '../../../icons/svg/line/check-box.svg?raw';
import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** Checkbox 속성 */
export interface CheckboxProps {
  /** 기본값 false */
  showFocus?: boolean;
  /** 기본값 true */
  showLabel?: boolean;
  /** 기본값 "Label" */
  label?: string;
  /** 변형 · 기본값 "unchecked" */
  selection?: "unchecked" | "checked" | "indeterminate";
  /** 변형 · 기본값 "large" */
  size?: "large" | "medium";
  /** 변형 · 기본값 "default" */
  state?: "default" | "hover" | "pressed" | "disabled";
}

const icons: IconMap = {
  "195e114cf6b5a60f352db2e44f4baba1771344ca": { svg: icon0, colored: false },
  "bd5cc4f4450382b413ba79be99c766eade2e02b2": { svg: icon1, colored: false },
};

/**
 * 켜고 끄는 선택 또는 여러 항목 중 여러 개를 고릅니다. size 2종(large·medium) × selection 3종(unchecked·checked·indeterminate) × state 4종. indeterminate는 하위 항목이 일부만 선택된 상태입니다. showLabel·label로 라벨을, showFocus로 포커스 링을 표시하며 showFocus는 disabled를 포함한 모든 상태에서 사용합니다. 색상·치수는 selectionControl/*·checkbox/* 배리어블에 연결합니다(포커스 링은 focusRing/*).
 */
export const Checkbox = createFigmaComponent<CheckboxProps>(data as ComponentData, icons, "Checkbox");
