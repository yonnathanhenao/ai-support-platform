import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget.tsx';
import './widget.css';

const el = document.getElementById('asw-root');
if (!el) throw new Error('Mount node #asw-root not found');

createRoot(el).render(
  <StrictMode>
    <ChatWidget />
  </StrictMode>,
);
