import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Register PWA Service Worker for Offline-First capability
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('[PWA] Service Worker registration failed:', err));
  });
} else if ('serviceWorker' in navigator) {
  // Also register in dev if desired, but limit console spam
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered in dev mode:', reg.scope))
      .catch(err => console.error('[PWA] Service Worker dev registration failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


