import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageLignee } from './PageLignee';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageLignee />
  </StrictMode>,
);
