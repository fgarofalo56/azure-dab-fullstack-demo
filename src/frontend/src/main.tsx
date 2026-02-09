import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { assertValidEnv, getEnvInfo } from './config/validateEnv';

// Validate environment variables at startup
// This provides clear error messages instead of cryptic MSAL failures
try {
  assertValidEnv();
  if (import.meta.env.DEV) {
    console.log('Environment configuration:', getEnvInfo());
  }
} catch (error) {
  // Show error in UI using safe DOM methods (no innerHTML)
  const root = document.getElementById('root');
  if (root) {
    const container = document.createElement('div');
    container.style.cssText = 'padding: 2rem; font-family: monospace; background: #1a1a1a; color: #ff6b6b; min-height: 100vh;';

    const h1 = document.createElement('h1');
    h1.style.color = '#ff6b6b';
    h1.textContent = 'Configuration Error';
    container.appendChild(h1);

    const pre = document.createElement('pre');
    pre.style.cssText = 'white-space: pre-wrap; background: #2a2a2a; padding: 1rem; border-radius: 8px;';
    pre.textContent = error instanceof Error ? error.message : 'Unknown error';
    container.appendChild(pre);

    const p = document.createElement('p');
    p.style.cssText = 'color: #888; margin-top: 1rem;';
    p.textContent = 'Check the browser console for more details.';
    container.appendChild(p);

    root.appendChild(container);
  }
  throw error;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
