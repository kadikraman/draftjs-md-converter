import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'draft-js/dist/Draft.css';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('The page has no #root element');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
