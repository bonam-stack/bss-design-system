import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './site/styles/site.css';
import './site/styles/portal.css';
import { App } from './site/App';
// 디자인 토큰: DS 전달본의 운영용 tokens.css를 그대로 깐다(직접 고치지 않음). 컴포넌트 모양이 토큰을 따른다
import '../tokens/ds/tokens.css';
import { installTokens } from './ds/tokens';

// 포털에서 배포한 토큰 수정이 있으면 그 위에 덮는다 (전달본 값과 같으면 그대로)
installTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
