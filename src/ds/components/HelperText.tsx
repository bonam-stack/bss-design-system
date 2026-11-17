// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/helper-text/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=2359-22437
import data from '../../../components/helper-text/component.json';
import icon0 from '../../../icons/svg/line/asterisk.svg?raw';
import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** HelperText 속성 */
export interface HelperTextProps {
  /** 기본값 true */
  showLeadingIcon?: boolean;
  /** 기본값 false */
  showCount?: boolean;
  /** 기본값 "HelperText" */
  message?: string;
  /** 변형 · 기본값 "default" */
  state?: "default" | "error";
}

const icons: IconMap = {
  "d1a6f375b6583b2b4eebef5e419a5783c763a0f5": { svg: icon0, colored: false },
};

/**
 * 입력 필드 아래에 안내·오류 문구를 보여주는 도움말입니다. state: default 기본 안내(회색), error 오류 안내(빨강). message에서 문구를 바꾸고, showLeadingIcon으로 앞 아이콘을, showCount로 글자 수(_Item/HelperText/Count)를 켭니다. 글자는 caption/12/400, 색·치수는 helperText/* 배리어블에 연결합니다. 토큰 이름은 helperText-*입니다.
 */
export const HelperText = createFigmaComponent<HelperTextProps>(data as ComponentData, icons, "HelperText");
