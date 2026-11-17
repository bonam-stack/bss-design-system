// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/button/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=7225-918
import data from '../../../components/button/component.json';
import icon0 from '../../../icons/svg/line/search.svg?raw';
import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** Button 속성 */
export interface ButtonProps {
  /** 기본값 false */
  showLeadingIcon?: boolean;
  /** 기본값 false */
  showTrailingIcon?: boolean;
  /** 기본값 false */
  showFocus?: boolean;
  /** 기본값 "Button" */
  label?: string;
  /** 기본값 false */
  showUnderline?: boolean;
  /** 변형 · 기본값 "square" */
  type?: "square" | "round" | "icon" | "iconPlain" | "text";
  /** 변형 · 기본값 "primary" */
  variants?: "primary" | "secondary" | "base" | "accent" | "danger";
  /** 변형 · 기본값 "xlarge" */
  size?: "xlarge" | "large" | "medium" | "small" | "fixed";
  /** 변형 · 기본값 "default" */
  state?: "default" | "hover" | "pressed" | "disabled";
}

const icons: IconMap = {
  "b3d8804d628d3c2bd17795c2b0e42e3eab5c4453": { svg: icon0, colored: false },
};

/**
 * Button 통합 원본. type 5종: square(기본 버튼, variant primary·secondary·base·accent·danger, size xlarge·large·medium·small), round(알약형, base·accent·danger, large·medium·small), icon(테두리 있는 아이콘 버튼, base·accent·danger, large·medium·small), iconPlain(바탕·테두리 없는 아이콘 버튼, base, large·medium·small), text(글자 버튼, base·accent, 높이 20 고정 size=fixed). showLeadingIcon·showTrailingIcon은 square·round·text에, showUnderline은 text에 적용합니다. showFocus는 disabled를 포함한 모든 유형·상태에서 사용합니다. 색상·치수는 button/* 배리어블에 연결합니다(포커스 링은 focusRing/*). 토큰 이름은 square=button-action, round=button-inline, icon·iconPlain=button-iconOnly(outlined·plain), text=button-text입니다.
 */
export const Button = createFigmaComponent<ButtonProps>(data as ComponentData, icons, "Button");
