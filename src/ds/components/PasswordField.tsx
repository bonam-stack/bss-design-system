// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// 원본: components/password-field/component.json · Figma https://www.figma.com/design/9AioWOXVOVm5C7kdSxSEEP?node-id=4971-32526
import data from '../../../components/password-field/component.json';
import icon0 from '../../../icons/svg/line/visibility.svg?raw';
import icon1 from '../../../icons/svg/line/asterisk.svg?raw';
import { createFigmaComponent } from '../core/react';
import type { ComponentData, IconMap } from '../types';

/** PasswordField 속성 */
export interface PasswordFieldProps {
  /** 기본값 false */
  showFocus?: boolean;
  /** 기본값 true */
  showHelperText?: boolean;
  /** 기본값 false */
  showLabel?: boolean;
  /** 변형 · 기본값 "none" */
  importance?: "none" | "attention" | "required";
  /** 변형 · 기본값 "default" */
  state?: "default" | "hover" | "focus" | "entered" | "readOnly" | "disabled";
  /** 변형 · 기본값 "false" */
  invalid?: "false" | "true" | boolean;
  /** 변형 · 기본값 "large" */
  size?: "large" | "medium" | "small";
}

const icons: IconMap = {
  "6afdd2a9e0a0ee7856146d27dd676cdce8f6ce4b": { svg: icon0, colored: false },
  "d1a6f375b6583b2b4eebef5e419a5783c763a0f5": { svg: icon1, colored: false },
};

/**
 * 비밀번호 입력 필드입니다. 라벨·입력 상자·도움말을 묶은 필드에 대응하며, 입력 글자는 _Item/PasswordField/InputText, 보기 전환 버튼은 _Item/PasswordField/VisibilityToggle을 씁니다. state: default 기본, hover :hover, focus :focus-within, entered 값 입력 완료(포커스 없음, 값 있음), readOnly readonly, disabled disabled. importance: none 기본, attention 노랑 강조, required 주황 필수. invalid=true는 aria-invalid=true입니다. 오류일 때 default는 오류 바탕·테두리·바깥 링(invalidBox), hover·focus는 바탕은 그 상태 값이고 테두리·바깥 링만 오류, readOnly·disabled는 오류를 표시하지 않습니다(attention·required도 같음). size: large 40·medium 36·small 28. showLabel은 라벨, showHelperText는 도움말, showFocus는 키보드 포커스 링입니다. 색은 field/*(변형은 field/attention·required/*), 치수는 passwordField/*, 오류 링은 field/ring/*, 포커스 링은 focusRing/*와 passwordField/[사이즈]/focusRing/radius에 연결합니다. 토큰 이름은 passwordField-*·field-*·visibilityToggle-*입니다.
 */
export const PasswordField = createFigmaComponent<PasswordFieldProps>(data as ComponentData, icons, "PasswordField");
