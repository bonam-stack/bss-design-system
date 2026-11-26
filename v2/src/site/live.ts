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

// ---------- 컴포넌트끼리 연결 ----------
// 컴포넌트는 다른 컴포넌트를 './Button'처럼 가져다 쓴다 (Modal → Button). 포털에 게시된 코드가 있으면
// 그 컴포넌트를 쓰는 다른 컴포넌트도 게시본으로 그린다: Button을 고쳐 게시하면 Modal 안의 버튼도 바뀐다.

/** 이름(Button) → 포털에 게시된 코드 (없으면 null). 사이트가 시작할 때 store와 잇는다 */
let overrideOf: (name: string) => string | null = () => null;
export function setOverrideSource(f: (name: string) => string | null) {
  overrideOf = f;
}
/** 지금 그릴 코드: 게시본 → 저장소 */
const sourceOf = (name: string) => overrideOf(name) ?? repoSource(name);
/** 이 코드가 가져다 쓰는 컴포넌트 이름 */
export const depsOf = (source: string) => [...new Set([...source.matchAll(/from\s+['"]\.\/([A-Za-z0-9]+)['"]/g)].map((m) => m[1]))];
/** 이 컴포넌트가 직접 · 간접으로 쓰는 컴포넌트 (자기 자신 빼고) */
export function depTree(name: string, seen = new Set<string>()): string[] {
  for (const d of depsOf(sourceOf(name))) {
    if (seen.has(d) || d === name) continue;
    seen.add(d);
    depTree(d, seen);
  }
  return [...seen];
}
/** 게시본이 섞여 있으면 그 조합을 나타내는 표시 (없으면 빈 글) */
const sig = (names: string[]) => names.filter((n) => overrideOf(n) !== null).map((n) => `${n}:${overrideOf(n)!.length}:${hash(overrideOf(n)!)}`).join('|');
const hash = (t: string) => {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
  return h.toString(36);
};
/** 쓰는 컴포넌트 중 게시본이 있는가 (있으면 저장소 모듈 대신 코드로 다시 그려야 이어진다) */
const touched = (name: string) => overrideOf(name) !== null || depTree(name).some((d) => overrideOf(d) !== null);

/** 다른 컴포넌트를 가져올 때: 게시본이 닿아 있으면 코드로 다시 만든 모듈, 아니면 저장소 모듈 */
function moduleOf(name: string): Record<string, unknown> | undefined {
  if (touched(name)) {
    const m = compileModule(name, sourceOf(name));
    if (m.exports) return m.exports;
  }
  return modules[`../ds/components/${name}.tsx`];
}

function requireFor(spec: string): unknown {
  if (spec === 'react') return React;
  if (spec === 'react/jsx-runtime') return jsxRuntime;
  if (spec === '../shared') return shared;
  if (spec === '../field') return field;
  const m = spec.match(/^\.\/([A-Za-z0-9]+)$/);
  const mod = m ? moduleOf(m[1]) : undefined;
  if (mod) return mod;
  throw new Error(`가져올 수 없는 모듈입니다: ${spec} (react · ../shared · ../field · ./컴포넌트만 쓸 수 있습니다)`);
}

const modCache = new Map<string, { exports?: Record<string, unknown>; error?: string }>();
/** 코드 → 모듈 (export 전부). 가져다 쓰는 컴포넌트의 게시본까지 반영한다 */
function compileModule(name: string, source: string): { exports?: Record<string, unknown>; error?: string } {
  const k = `${name}\n${sig(depsOf(source).flatMap((d) => [d, ...depTree(d)]))}\n${source}`;
  const hit = modCache.get(k);
  if (hit) return hit;
  let out: { exports?: Record<string, unknown>; error?: string };
  try {
    const { code } = transform(source, { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'automatic', production: true });
    const exports: Record<string, unknown> = {};
    const module = { exports };
    new Function('require', 'exports', 'module', code)(requireFor, exports, module);
    out = { exports: module.exports as Record<string, unknown> };
  } catch (e) {
    out = { error: (e as Error).message };
  }
  if (modCache.size > 200) modCache.clear();
  modCache.set(k, out);
  return out;
}

/** 지금 그릴 컴포넌트: 자기 · 쓰는 컴포넌트에 게시본이 있으면 코드로 다시 만들고, 없으면 저장소 컴포넌트 */
export function liveComponent(name: string): LiveComponent | null {
  if (!touched(name)) return repoComponent(name);
  return compile(name, sourceOf(name)).Component || repoComponent(name);
}

/** 코드 → 컴포넌트. 실패하면 이유 (문법 오류 · 이름 없음 · import 불가). 가져다 쓰는 컴포넌트는 게시본까지 반영 */
export function compile(name: string, source: string): { Component?: LiveComponent; error?: string } {
  const m = compileModule(name, source);
  if (m.error) return { error: m.error };
  const C = m.exports![name] as LiveComponent | undefined;
  return typeof C === 'function' ? { Component: C } : { error: `export function ${name}(…)이 없습니다. 컴포넌트 이름은 그대로 두세요` };
}
