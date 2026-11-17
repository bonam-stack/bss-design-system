/// <reference types="vite/client" />

// JSON은 런타임에 Vite가 읽고, 타입은 쓰는 쪽에서 정한다 (컴포넌트 JSON이 커서 TS가 리터럴 타입을 뽑지 않게).
declare module '*.json' {
  const value: unknown;
  export default value;
}
