import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './site/styles/site.css';
import './site/styles/portal.css';
import { App } from './site/App';
import { installTokens } from './ds/tokens';

// 디자인 토큰(Figma 변수)을 CSS 변수로 깐다. 컴포넌트 모양이 토큰을 따른다
installTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
