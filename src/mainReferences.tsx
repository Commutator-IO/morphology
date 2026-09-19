import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageReferences } from './PageReferences';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageReferences />
  </StrictMode>,
);
