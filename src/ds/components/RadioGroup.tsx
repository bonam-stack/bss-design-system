// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/radio-group/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=4971-31723
import data from '../../../components/radio-group/component.json';

import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** RadioGroup 속성 · content 슬롯은 children */
export interface RadioGroupProps {
  /** 변형 · 기본값 "large" */
  size?: "large" | "medium";
}

const icons: IconMap = {

};

/**
 * Radio를 가로로 배치하는 묶음입니다. size 2종(large·medium). content 슬롯에 Radio를 넣고, 항목 간격은 radio/group/space/gap(12)에 연결합니다.
 */
export const RadioGroup = createFigmaComponent<RadioGroupProps>(data as ComponentData, icons, "RadioGroup");
