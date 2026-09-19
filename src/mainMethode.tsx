import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageMethode } from './PageMethode';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageMethode />
  </StrictMode>,
);
