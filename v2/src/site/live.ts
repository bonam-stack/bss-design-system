// 포털에서 고친 컴포넌트 코드(TSX)를 브라우저에서 바로 돌린다.
// sucrase로 TypeScript · JSX를 걷어 내고, import는 사이트가 가진 모듈(react · ../shared · ../field · ./다른컴포넌트)로 잇는다.
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import type { ComponentType } from 'react';
import { transform } from 'sucrase';
import * as shared from '../ds/shared';
import * as field from '../ds/field';

const modules = import.meta.glob<Record<string, unknown>>('../ds/components/*.tsx', { eager: true });
/** 저장소에 있는 컴포넌트 원본 코드 (src/ds/components/<Name>.tsx) */
export const repoSources = import.meta.glob<string>('../ds/components/*.tsx', { eager: true, query: '?raw', import: 'default' });

export const pascal = (key: string) => key.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');
export const fileOf = (name: string) => `src/ds/components/${name}.tsx`;
export const repoComponent = (name: string) => (modules[`../ds/components/${name}.tsx`]?.[name] as ComponentType<Record<string, unknown>> & { meta?: Meta }) || null;
export const repoSource = (name: string) => repoSources[`../ds/components/${name}.tsx`] || '';

export interface Meta {
  /** 미리보기 글 칸의 기본값 */
  texts: Record<string, string>;
  /** state를 고정했을 때 함께 넣는 예시 값 (entered → defaultValue 'Text') */
  samples?: Record<string, Record<string, unknown>>;
}
export type LiveComponent = ComponentType<Record<string, unknown>> & { meta?: Meta };

function requireFor(spec: string): unknown {
  if (spec === 'react') return React;
  if (spec === 'react/jsx-runtime') return jsxRuntime;
  if (spec === '../shared') return shared;
  if (spec === '../field') return field;
  const m = spec.match(/^\.\/([A-Za-z0-9]+)$/);
  if (m && modules[`../ds/components/${m[1]}.tsx`]) return modules[`../ds/components/${m[1]}.tsx`];
  throw new Error(`가져올 수 없는 모듈입니다: ${spec} (react · ../shared · ../field · ./컴포넌트만 쓸 수 있습니다)`);
}

const cache = new Map<string, { Component?: LiveComponent; error?: string }>();

/** 코드 → 컴포넌트. 실패하면 이유 (문법 오류 · 이름 없음 · import 불가) */
export function compile(name: string, source: string): { Component?: LiveComponent; error?: string } {
  const k = `${name}\n${source}`;
  const hit = cache.get(k);
  if (hit) return hit;
  let out: { Component?: LiveComponent; error?: string };
  try {
    const { code } = transform(source, { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'automatic', production: true });
    const exports: Record<string, unknown> = {};
    const module = { exports };
    new Function('require', 'exports', 'module', code)(requireFor, exports, module);
    const C = (module.exports as Record<string, unknown>)[name] as LiveComponent | undefined;
    out = typeof C === 'function' ? { Component: C } : { error: `export function ${name}(…)이 없습니다. 컴포넌트 이름은 그대로 두세요` };
  } catch (e) {
    out = { error: (e as Error).message };
  }
  if (cache.size > 50) cache.clear();
  cache.set(k, out);
  return out;
}
