import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './site/styles/site.css';
import './site/styles/portal.css';
import { App } from './site/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
