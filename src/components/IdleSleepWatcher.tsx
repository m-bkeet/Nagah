import React, { useState, useEffect, useRef } from 'react';
import { Moon, Zap } from 'lucide-react';
import { useCenter } from '../context/CenterContext';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of complete inactivity

export const IdleSleepWatcher: React.FC = () => {
  const [isAsleep, setIsAsleep] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { refreshCoreData } = useCenter();

  useEffect(() => {
    const scheduleIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsAsleep(true);
      }, IDLE_TIMEOUT_MS);
    };

    const handleUserActivity = () => {
      if (isAsleep) {
        setIsAsleep(false);
        refreshCoreData(false);
      }
      scheduleIdle();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });
    scheduleIdle();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isAsleep, refreshCoreData]);

  if (!isAsleep) return null;

  return (
    <div 
      id="eco-sleep-overlay"
      onClick={() => {
        setIsAsleep(false);
        refreshCoreData(false);
      }}
      className="fixed bottom-4 right-4 z-50 bg-slate-900/95 border border-cyan-500/30 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 cursor-pointer hover:border-cyan-400 transition-colors"
      title="انقر للاستيقاظ"
    >
      <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
        <Moon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-cyan-300">
          وضع توفير البيانات والسكون
        </div>
        <div className="text-[11px] text-slate-400">
          انقر للمتابعة واستئناف العمل
        </div>
      </div>
      <button 
        id="wake-up-button"
        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-lg text-white transition-colors flex items-center gap-1 cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5" />
        استيقاظ
      </button>
    </div>
  );
};
