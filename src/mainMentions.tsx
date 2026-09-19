import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageMentions } from './PageMentions';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageMentions />
  </StrictMode>,
);
