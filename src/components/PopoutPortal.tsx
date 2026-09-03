import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopoutPortalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  width?: number;
  height?: number;
  isOpen: boolean;
}

export const PopoutPortal: React.FC<PopoutPortalProps> = ({ 
  children, 
  onClose,
  title = 'أدوات العرض والشرح',
  width = 420,
  height = 680,
  isOpen
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
      }
      return;
    }

    let isMounted = true;

    const setupWindow = (win: Window) => {
      win.document.title = title;
      
      // Copy all stylesheets from main window
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach((style) => {
        win.document.head.appendChild(style.cloneNode(true));
      });
      
      // Font setup
      const fontLink = win.document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap';
      fontLink.rel = 'stylesheet';
      win.document.head.appendChild(fontLink);

      // Tailwind Setup
      win.document.body.className = 'dark bg-slate-900 text-slate-100 font-sans relative overflow-hidden';
      win.document.body.dir = 'rtl';
      
      const div = win.document.createElement('div');
      div.className = 'w-full h-full relative';
      win.document.body.appendChild(div);
      
      if (isMounted) {
        setContainer(div);
      }

      win.addEventListener('pagehide', () => {
        if (isMounted) onClose();
      });
      win.addEventListener('unload', () => {
         if (isMounted) onClose();
      });
    };

    const openPip = async () => {
      // 1. Try synchronous window.open first to preserve user gesture activation in Edge / Windows 11
      let popup: Window | null = null;
      try {
        const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
        const top = 80;
        popup = window.open(
          'about:blank',
          'NagahToolsPopoutWindow',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`
        );
      } catch (winErr) {
        console.warn("Synchronous window.open failed in iframe:", winErr);
      }

      if (popup) {
        pipWindowRef.current = popup;
        setupWindow(popup);
        return;
      }

      // 2. Try Document Picture-in-Picture as alternative
      if ('documentPictureInPicture' in window) {
        try {
          const pipWin = await (window as any).documentPictureInPicture.requestWindow({
            width,
            height,
          });
          if (pipWin) {
            pipWindowRef.current = pipWin;
            setupWindow(pipWin);
            return;
          }
        } catch (pipErr) {
          console.warn("Document Picture-in-Picture blocked or unsupported:", pipErr);
        }
      }

      // 3. Fallback to Desktop Docked Bar inside body
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('📌 تم تفعيل شريط سطح المكتب الذكي المثبت في أعلى المنصة. يمكنك استخدامه مباشرة!', 'info');
      }

      if (isMounted) {
        let fallbackDiv = document.getElementById('nagah-desktop-dock-portal');
        if (!fallbackDiv) {
          fallbackDiv = document.createElement('div');
          fallbackDiv.id = 'nagah-desktop-dock-portal';
          fallbackDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-2 shadow-[0_0_40px_rgba(245,158,11,0.5)] backdrop-blur-xl animate-fade-in text-white dir-rtl';
          document.body.appendChild(fallbackDiv);
        }
        setContainer(fallbackDiv);
      }
    };

    openPip();

    return () => {
      isMounted = false;
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        try {
          pipWindowRef.current.close();
        } catch (e) {}
      }
    };
  }, [isOpen, width, height, title, onClose]);

  if (!isOpen || !container) return null;
  return createPortal(children, container);
};
