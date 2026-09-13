import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    } catch {
      // Ignore media query errors
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
      }
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
      title="تثبيت التطبيق على الجهاز"
    >
      <Download className="w-3.5 h-3.5" />
      <span>تثبيت التطبيق</span>
    </button>
  );
}

