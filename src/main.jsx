import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Imported first so the browser's install prompt is caught even if it fires before React renders.
import './lib/install.js';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Works offline once installed (and lets the browser offer installing); failures are harmless.
  const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}

// Ask the browser to treat saved scores as important so it doesn't clear them under storage pressure.
navigator.storage?.persist?.().catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
