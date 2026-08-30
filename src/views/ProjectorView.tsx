import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tv, Monitor, User, Maximize2, RefreshCw, Volume2, ShieldCheck } from 'lucide-react';

export const ProjectorView: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [projectorState, setProjectorState] = useState<{
    activeSource: 'master' | 'student';
    deviceId: string;
    deviceName: string;
    streamFrame: string;
    updatedAt: string;
  }>({
    activeSource: 'master',
    deviceId: '',
    deviceName: 'شاشة المدرب الرئيسية',
    streamFrame: '',
    updatedAt: new Date().toISOString()
  });

  const [broadcastState, setBroadcastState] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const [projRes, bcastRes] = await Promise.all([
          api.getProjectorState(),
          api.getBroadcastState()
        ]);
        setProjectorState(projRes);
        setBroadcastState(bcastRes);
      } catch (e) {
        console.error(e);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 300); // 300ms for fast responsive projector display
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (broadcastState?.isBroadcasting && broadcastState?.streamAudioChunk && !isAudioMuted && audioRef.current) {
      audioRef.current.src = broadcastState.streamAudioChunk;
      audioRef.current.play().catch(() => {});
    }
  }, [broadcastState?.streamAudioChunk, isAudioMuted]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const activeImage =
    projectorState.activeSource === 'student' && projectorState.streamFrame
      ? projectorState.streamFrame
      : broadcastState?.streamFrame;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none" dir="rtl">
      {/* Top Projector Floating Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-100">شاشة العرض المركزية (Classroom Projector)</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                بث مباشر نشط 🟢
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              المصدر الحالي المعروض: <strong className="text-cyan-400">{projectorState.deviceName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isAudioMuted ? 'صوت القاعة مكتوم' : 'صوت القاعة مفعّل'}</span>
          </button>

          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold transition-all border border-rose-500/40"
            >
              العودة للوحة التحكم
            </button>
          )}
        </div>
      </div>

      {/* Main Broadcast Screen Display */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-hidden relative">
        {activeImage ? (
          <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
            <img
              src={activeImage}
              alt="Projector Live Stream"
              className="w-full h-full object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            {/* Live Indicator overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/80 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>معروض من: {projectorState.deviceName}</span>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-lg p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Tv className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-100">
              مركز النجاح للتدريب والاستشارات - شاشة القاعة الرئيسية
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              شاشة البروجكتور متصلة بالشبكة وجاهزة لاستقبال بث المدرب المباشر أو عرض شاشات المتدربين للمناقشة الجماعية.
            </p>
            <div className="pt-2 flex justify-center items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>نظام التحكم في معمل الحاسب V7 متصل ومؤمن</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
