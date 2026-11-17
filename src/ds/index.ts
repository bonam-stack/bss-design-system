// 생성 파일: scripts/gen-react.mjs (npm run gen). 직접 고치지 않는다.
// BSS 디자인 시스템 React 컴포넌트. components/index.json 순서.
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';
export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
export { HelperText } from './components/HelperText';
export type { HelperTextProps } from './components/HelperText';
export { PasswordField } from './components/PasswordField';
export type { PasswordFieldProps } from './components/PasswordField';
export { Radio } from './components/Radio';
export type { RadioProps } from './components/Radio';
export { RadioGroup } from './components/RadioGroup';
export type { RadioGroupProps } from './components/RadioGroup';
export { TextArea } from './components/TextArea';
export type { TextAreaProps } from './components/TextArea';
export { TextField } from './components/TextField';
export type { TextFieldProps } from './components/TextField';
export type { DsBaseProps, DsComponent } from './core/react';
export type { ComponentData, IconMap, PropValues } from './types';

import { Button } from './components/Button';
import { Checkbox } from './components/Checkbox';
import { Divider } from './components/Divider';
import { HelperText } from './components/HelperText';
import { PasswordField } from './components/PasswordField';
import { Radio } from './components/Radio';
import { RadioGroup } from './components/RadioGroup';
import { TextArea } from './components/TextArea';
import { TextField } from './components/TextField';

/** component.json 키 → React 컴포넌트 */
export const components = {
  "button": Button,
  "checkbox": Checkbox,
  "divider": Divider,
  "helper-text": HelperText,
  "password-field": PasswordField,
  "radio": Radio,
  "radio-group": RadioGroup,
  "text-area": TextArea,
  "text-field": TextField,
} as const;
