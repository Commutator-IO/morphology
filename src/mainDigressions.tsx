import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageDigressions } from './PageDigressions';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageDigressions />
  </StrictMode>,
);
