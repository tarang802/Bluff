import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Works offline once installed; registration failures are harmless.
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// Ask the browser to treat saved scores as important so it doesn't clear them under storage pressure.
navigator.storage?.persist?.().catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
