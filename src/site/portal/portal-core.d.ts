// portal-core.js(poc/scripts/build-site-core.mjs가 묶는 생성 파일)의 타입.
export interface Converted {
  mode: 'mock' | 'api' | string;
  result: { kind: string; key: string; name: string; description?: string; figma?: unknown; props: { name: string; type: string; default: unknown; options?: string[] }[]; variants: unknown[]; [k: string]: unknown };
}
export function convertFromUrl(url: string, opts: { expect: string; released: { components: Record<string, unknown> } }): Promise<Converted>;
export function diffComponent(prev: unknown, next: unknown): { lines: string[]; bump: 'PATCH' | 'MINOR' | 'MAJOR' };
export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null;
export function checkComponentFormat(c: unknown): unknown[];
