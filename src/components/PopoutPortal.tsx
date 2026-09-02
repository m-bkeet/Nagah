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
      try {
        if ('documentPictureInPicture' in window) {
          const pipWin = await (window as any).documentPictureInPicture.requestWindow({
            width,
            height,
          });
          pipWindowRef.current = pipWin;
          setupWindow(pipWin);
        } else {
          const left = (window.screen.width - width) / 2;
          const popup = window.open('', '', `width=${width},height=${height},left=${left},top=100,menubar=no,toolbar=no,location=no,status=no`);
          if (popup) {
            pipWindowRef.current = popup;
            setupWindow(popup);
          } else {
            console.error("Popup blocked");
            onClose();
          }
        }
      } catch (err) {
        console.error("Error opening popout", err);
        // Fallback to window open if pip fails
        try {
          const popup = window.open('', '', `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no`);
          if (popup) {
            pipWindowRef.current = popup;
            setupWindow(popup);
          }
        } catch (e) {
          onClose();
        }
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
