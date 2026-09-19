import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageFiliation } from './PageFiliation';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageFiliation />
  </StrictMode>,
);
