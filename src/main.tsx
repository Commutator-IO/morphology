import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageVocabulaire } from './PageVocabulaire';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageVocabulaire />
  </StrictMode>,
);
