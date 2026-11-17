// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/divider/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=2366-22931
import data from '../../../components/divider/component.json';

import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** Divider 속성 */
export interface DividerProps {
  /** 변형 · 기본값 "solid" */
  type?: "solid" | "dashed";
  /** 변형 · 기본값 "horizontal" */
  direction?: "horizontal" | "vertical";
}

const icons: IconMap = {

};

/**
 * 영역이나 항목 사이를 나누는 구분선입니다. type: solid 실선, dashed 점선. direction: horizontal 가로, vertical 세로. 길이는 놓는 자리에 맞춰 늘립니다. 선 색은 Semantic color/border/neutral/muted에 바로 연결합니다(전용 컴포넌트 토큰 없음).
 */
export const Divider = createFigmaComponent<DividerProps>(data as ComponentData, icons, "Divider");
