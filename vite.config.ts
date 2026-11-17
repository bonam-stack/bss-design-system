import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 주소(/bss-design-system/)와 로컬 어디서 열어도 되도록 상대 경로로 빌드한다. 라우팅은 해시(#checkbox).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 4096, // 컴포넌트 JSON(Figma 레이어 데이터)이 커서 경고 기준을 올린다
  },
});
