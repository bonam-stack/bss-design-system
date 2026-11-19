import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

// GitHub Pages 주소(/bss-design-system/)와 로컬 어디서 열어도 되도록 상대 경로로 빌드한다. 라우팅은 해시(#checkbox).
export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __DATA_VERSION__: JSON.stringify(dataVersion()) },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 4096, // 컴포넌트 JSON(Figma 레이어 데이터)이 커서 경고 기준을 올린다
  },
});
