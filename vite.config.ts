import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { makeSummary } from './src/site/summary';

// 기준 데이터의 지문. 저장소의 기준(카탈로그 · 컴포넌트 · UX 패턴 가이드 · 패턴 · 토큰 · React 컴포넌트)이 바뀌어 새로 배포되면
// 브라우저에 남은 이전 초안 · 게시 기록을 지운다 (POC: 이력은 남기지 않고 새 기준으로 다시 시작).
function dataVersion() {
  const h = createHash('sha256');
  const walk = (dir: string) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(json|tsx|md)$/.test(f)) h.update(p).update(readFileSync(p));
    }
  };
  ['catalog', 'components', 'guides', 'patterns', 'tokens', 'src/ds/components'].forEach(walk);
  return h.digest('hex').slice(0, 12);
}

// 핵심 요약 API: 빌드할 때 저장소 기준 데이터로 컴포넌트 · 블록 요약을 만들어 dist/api에 둔다.
// SB Studio API는 화면을 만들기 전에 api/summary.json(목록) → api/summary/<카탈로그 코드>.json을 먼저 읽는다.
function summaryApi(): Plugin {
  const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
  return {
    name: 'summary-api',
    apply: 'build',
    generateBundle() {
      const cat = json('catalog/catalog.json');
      const structure = json('guides/ux-pattern/structure.json');
      const release = String(structure.source).replace(/^.*release\/(\d+)\/?$/, '$1');
      const basis = `포털 v${cat.meta.version} · UX 패턴 가이드 ${release}`;
      const repo: string[] = json('components/index.json').components;
      const pascal = (k: string) => k.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((x) => x[0].toUpperCase() + x.slice(1)).join('');
      const docTitle = (id: string) => structure.docs.find((d: { id: string }) => d.id === id)?.title || id;
      const ruleOf = (code: string) => cat.rules.filter((r: { targets: string[] }) => r.targets.includes(code)).map((r: { kind: string; text: string }) => ({ name: r.kind, desc: r.text }));
      const list: { code: string; kind: string; name: string; group?: string; file: string }[] = [];
      for (const it of cat.items) {
        if (it.kind !== 'comp' && it.kind !== 'block') continue;
        const key = it.key && repo.includes(it.key) ? it.key : null;
        const comp = key ? json(`components/${key}/component.json`) : null;
        let pol: { when?: { use?: string[]; avoid?: { text: string; alt?: string }[] }; rules?: { name: string; desc: string }[]; do?: (string | { text: string })[]; dont?: (string | { text: string })[] } | undefined;
        try {
          pol = key ? json(`components/${key}/guide.json`).policy : undefined;
        } catch {
          pol = undefined;
        }
        const t = (x: string | { text: string }) => (typeof x === 'string' ? x : x.text);
        const s = makeSummary({
          kind: it.kind,
          name: it.name,
          codeName: key ? pascal(key) : it.code,
          catalog: it.code,
          group: it.group,
          meaning: it.meaning,
          use: pol?.when?.use || it.policy?.use,
          avoid: pol?.when?.avoid || it.policy?.avoid,
          rules: pol?.rules || ruleOf(it.code),
          do: (pol?.do || it.policy?.do || []).map(t),
          dont: (pol?.dont || it.policy?.dont || []).map(t),
          props: comp?.props || [],
          slot: it.slot,
          parts: it.kind === 'block' ? [...new Set(cat.parts.filter((x: { block: string }) => x.block === it.code).map((x: { comp: string }) => x.comp))] as string[] : undefined,
          guides: (it.policy?.sources || []).map(docTitle),
          basis,
        });
        const file = `api/summary/${it.code}.json`;
        this.emitFile({ type: 'asset', fileName: file, source: JSON.stringify(s, null, 1) });
        list.push({ code: it.code, kind: it.kind, name: it.name, group: it.group, file });
      }
      this.emitFile({ type: 'asset', fileName: 'api/summary.json', source: JSON.stringify({ basis, generatedFrom: 'catalog · components · UX 패턴 가이드 (저장소 기준)', items: list }, null, 1) });
    },
  };
}

// GitHub Pages 주소(/bss-design-system/)와 로컬 어디서 열어도 되도록 상대 경로로 빌드한다. 라우팅은 해시(#checkbox).
export default defineConfig({
  base: './',
  plugins: [react(), summaryApi()],
  define: { __DATA_VERSION__: JSON.stringify(dataVersion()) },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 4096, // 컴포넌트 JSON(Figma 레이어 데이터)이 커서 경고 기준을 올린다
  },
});
