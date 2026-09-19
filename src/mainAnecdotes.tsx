import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PageAnecdotes } from './PageAnecdotes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageAnecdotes />
  </StrictMode>,
);
