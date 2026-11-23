import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// BSS 디자인 포털 v2: 저장소의 v2/ 폴더가 원본. v1(저장소 루트)과 데이터 · 소스를 나눠 v2에서만 고친다.
// 배포 주소: <사이트>/v2/  ·  빌드 결과: dist/v2
const root = resolve(__dirname);

function dataVersion() {
  const h = createHash('sha256');
  const walk = (dir: string) => {
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(json|tsx|md)$/.test(f)) h.update(p).update(readFileSync(p));
    }
  };
  ['catalog', 'components', 'guides', 'patterns', 'tokens', 'src/ds/components'].forEach((d) => walk(join(root, d)));
  return h.digest('hex').slice(0, 12);
}

export default defineConfig({
  root,
  base: './',
  plugins: [react()],
  define: { __DATA_VERSION__: JSON.stringify(dataVersion()) },
  build: {
    outDir: resolve(root, '../dist/v2'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4096,
  },
});
