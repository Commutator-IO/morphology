import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageConferences } from './PageConferences';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageConferences />
  </StrictMode>,
);
