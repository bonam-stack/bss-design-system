// component.json (schemaVersion 2) 구조. Figma 추출(figma-to-json)이 만드는 그대로다.

export interface Paint {
  type: string;
  color?: string;
  visible?: boolean;
  variable?: string;
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR' | string;
  visible?: boolean;
  offset: [number, number];
  radius: number;
  spread?: number;
  color: string;
}

export interface TextInfo {
  characters: string;
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeight?: 'AUTO' | { unit: 'PIXELS' | 'PERCENT' | string; value: number };
  letterSpacing?: { unit: 'PIXELS' | 'PERCENT' | string; value: number };
  align?: string[];
  autoResize?: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'NONE' | 'TRUNCATE' | string;
  case?: string;
  decoration?: string;
  truncate?: number | boolean;
}

export type Sizing = 'FIXED' | 'HUG' | 'FILL';

export interface Layer {
  id?: string;
  name: string;
  type: string;
  visible?: boolean;
  size: [number, number];
  sizing?: [Sizing, Sizing];
  position?: [number, number];
  constraints?: [string, string];
  minMaxWidth?: [number | null, number | null];
  minMaxHeight?: [number | null, number | null];
  layout?: { mode: 'HORIZONTAL' | 'VERTICAL'; wrap?: boolean; gap?: number; padding: [number, number, number, number]; align: [string, string] };
  radius?: number | number[];
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number | number[];
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  effects?: Effect[];
  opacity?: number;
  clips?: boolean;
  dash?: number[];
  text?: TextInfo;
  main?: { key: string; name: string };
  propRefs?: Record<string, string>;
  variables?: Record<string, string>;
  styles?: Record<string, string>;
  children?: Layer[];
}

export interface PropDef {
  name: string;
  figmaName: string;
  type: 'variant' | 'boolean' | 'text' | 'slot' | 'instance';
  default: string | boolean | null;
  options?: string[];
}

export interface Variant {
  nodeId: string;
  key: string;
  props: Record<string, string>;
  size?: [number, number];
  layer?: Layer;
}

export interface TokenRef {
  figma: string;
  css: string;
  collection?: string;
  type: string;
  value?: unknown;
  alias?: string;
  key?: string;
}

export interface StyleRef {
  name: string;
  type: string;
  key: string;
  remote?: boolean;
}

export interface ComponentData {
  schemaVersion: number;
  key: string;
  name: string;
  description: string;
  figma: {
    fileKey: string;
    nodeId: string;
    url: string;
    page?: { nodeId: string; name: string };
    type?: string;
    componentKey?: string;
    extractedAt?: string;
  };
  props: PropDef[];
  variants: Variant[];
  tokens: TokenRef[];
  textStyles?: StyleRef[];
  otherStyles?: StyleRef[];
  layer?: Layer;
}

/** 아이콘 인스턴스를 바꿔 끼울 SVG (Figma 컴포넌트 키 → SVG) */
export type IconMap = Record<string, { svg: string; colored: boolean }>;

/** 불리언 · 텍스트 속성 값 (Figma 속성 이름 → 값). 안쪽 인스턴스 속성도 같은 이름 공간이다. */
export type PropValues = Record<string, string | boolean>;
