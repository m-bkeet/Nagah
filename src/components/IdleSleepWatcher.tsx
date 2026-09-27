import React, { useState, useEffect, useRef } from 'react';
import { Moon, Zap } from 'lucide-react';
import { useCenter } from '../context/CenterContext';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of complete inactivity

export const IdleSleepWatcher: React.FC = () => {
  const [isAsleep, setIsAsleep] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const { refreshCoreData } = useCenter();

  useEffect(() => {
    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      if (isAsleep) {
        setIsAsleep(false);
        // On wake-up, perform one gentle sync to make sure user sees fresh data
        refreshCoreData(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    const checkInterval = setInterval(() => {
      const now = Date.now();
      // If window is hidden or no activity for 10 minutes, sleep
      if (now - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        if (!isAsleep) {
          setIsAsleep(true);
        }
      }
    }, 30000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(checkInterval);
    };
  }, [isAsleep, refreshCoreData]);

  if (!isAsleep) return null;

  return (
    <div 
      id="eco-sleep-overlay"
      onClick={() => {
        lastActivityRef.current = Date.now();
        setIsAsleep(false);
        refreshCoreData(false);
      }}
      className="fixed bottom-4 right-4 z-50 bg-slate-900/95 border border-cyan-500/30 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 cursor-pointer hover:border-cyan-400 transition-all animate-pulse"
      title="انقر للاستيقاظ واستئناف التحديثات"
    >
      <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
        <Moon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <span>وضع توفير البيانات والسكون</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="text-[11px] text-slate-400">
          الموقع في وضع السكون لتوفير الاستهلاك — انقر للاستيقاظ
        </div>
      </div>
      <button 
        id="wake-up-button"
        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-lg text-white transition-all flex items-center gap-1 cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5" />
        استيقاظ
      </button>
    </div>
  );
};
