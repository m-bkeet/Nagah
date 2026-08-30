import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Sparkles, X, Crown, Heart, Award, CheckCircle2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SessionCelebrationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle?: string;
  groupName?: string;
  courseName?: string;
  starWinnerName?: string;
  starWinnerPoints?: number;
}

export const SessionCelebrationOverlay: React.FC<SessionCelebrationOverlayProps> = ({
  isOpen,
  onClose,
  sessionTitle = 'محاضرة النجاح والتميز',
  groupName = 'المجموعة التدريبية',
  courseName = 'الدورة التدريبية',
  starWinnerName,
  starWinnerPoints
}) => {
  const [balloons, setBalloons] = useState<Array<{ id: number; left: number; color: string; speed: number }>>([]);

  const handleClose = () => {
    audioService.stopAll();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      audioService.stopAll();
      return;
    }

    // Trigger audio fanfare & Egyptian Radio Announcer voice if winner exists
    const eventId = `celebrate_${sessionTitle}_${starWinnerName || 'none'}`;
    if (starWinnerName) {
      audioService.playWinnerAnnouncement(starWinnerName, eventId);
    } else {
      audioService.playSessionEndFanfare();
    }

    // Launch Canvas Confetti Cannon Stream
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        zIndex: 100000
      });
    }, 250);

    // Generate Floating Balloons
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
    const newBalloons = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      color: colors[i % colors.length],
      speed: Math.random() * 3 + 4
    }));
    setBalloons(newBalloons);

    return () => {
      clearInterval(interval);
      audioService.stopAll();
    };
  }, [isOpen, starWinnerName, sessionTitle]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fadeIn"
      dir="rtl"
    >
      {/* Floating Animated Balloons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {balloons.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-[-100px] animate-balloonFloat"
            style={{
              left: `${b.left}%`,
              animationDuration: `${b.speed}s`,
              animationIterationCount: 'infinite'
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className="w-12 h-14 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] shadow-lg flex items-center justify-center"
                style={{ backgroundColor: b.color }}
              >
                <div className="w-2 h-3 bg-white/30 rounded-full -mt-4 -ml-4" />
              </div>
              <div className="w-1 h-2 bg-slate-400" />
              <div className="w-0.5 h-10 bg-slate-300/50" />
            </div>
          </div>
        ))}

        {/* Floating Stars & Bubbles */}
        <div className="absolute top-1/4 right-10 animate-spin text-amber-300">
          <Star className="w-8 h-8 fill-amber-300/40" />
        </div>
        <div className="absolute bottom-1/4 left-10 animate-bounce text-yellow-400">
          <Sparkles className="w-10 h-10" />
        </div>
      </div>

      {/* Main Responsive Celebration Card */}
      <div className="relative z-10 w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center overflow-hidden animate-scaleUp">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 w-64 h-32 bg-amber-500/30 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce mb-4">
          <Trophy className="w-10 h-10" />
        </div>

        {/* Success Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>🎉 تهانينا! اكتملت المحاضرة بنجاح وتم تحصيل النجاح ✨</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
          {sessionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6">
          {groupName} • {courseName}
        </p>

        {/* Star Winner Section (If Available) */}
        {starWinnerName ? (
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-400/80 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-2 right-3 text-amber-400 opacity-20">
              <Crown className="w-16 h-16" />
            </div>

            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                🏆 نجم المركز الأول
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 my-1 drop-shadow-md">
              ⭐ {starWinnerName}
            </h3>

            <div className="flex items-center justify-center gap-2 text-xs text-amber-200 mt-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>🎉 مبروك يا بطل! وسام التميز والنجمة الذهبية</span>
              {starWinnerPoints !== undefined && (
                <span className="bg-amber-400/20 px-2 py-0.5 rounded-lg text-amber-300 font-mono">
                  {starWinnerPoints} نقطة
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-slate-200">
              أحسنتم جميعاً يا أبطال النجاح! مجهود عظيم وأداء متميز في محاضرة اليوم 👏
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          استمرار وتأكيد الختام 🚀
        </button>
      </div>

      {/* Inline Keyframe Styles for Animation */}
      <style>{`
        @keyframes balloonFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(15deg); opacity: 0; }
        }
        .animate-balloonFloat {
          animation: balloonFloat linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
