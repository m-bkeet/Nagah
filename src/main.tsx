import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Universal safety polyfills for device enumeration and legacy components
if (typeof window !== 'undefined') {
  if (!(window as any).loadDevices) {
    (window as any).loadDevices = async () => {
      try {
        const res = await fetch('/api/devices').then(r => r.json()).catch(() => []);
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    };
  }
}

// PWA Service Worker management
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD && !window.location.hostname.includes('ais-dev')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[PWA] Service Worker active:', reg.scope))
        .catch(err => console.error('[PWA] Registration failed:', err));
    });
  } else {
    // In dev / preview mode, ensure clean state without service worker interference
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="حدث خطأ في واجهة المنصة">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


