import React, { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';

interface InstallPwaButtonProps {
  className?: string;
  variant?: 'button' | 'banner' | 'compact';
}

export function InstallPwaButton({
  className = '',
  variant = 'button'
}: InstallPwaButtonProps) {
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
      // ignore
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

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all ${className}`}
        title="تثبيت التطبيق مباشرة على سطح المكتب أو الشاشة الرئيسية"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>تثبيت Nagah TC</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>تثبيت تطبيق النجاح للتدريب</span>
    </button>
  );
}

