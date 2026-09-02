import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BalloonItem {
  id: string;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

interface CelebrationBalloonsOverlayProps {
  isActive: boolean;
  title?: string;
  subtitle?: string;
  pointsBadge?: string;
  durationMs?: number;
  onComplete?: () => void;
}

const BALLOON_COLORS = [
  'from-rose-500 to-pink-600',
  'from-amber-400 to-yellow-500',
  'from-emerald-400 to-green-600',
  'from-cyan-400 to-blue-600',
  'from-purple-500 to-indigo-600',
  'from-orange-400 to-amber-600'
];

const FUN_EMOJIS = ['🎈', '🎉', '⭐', '🏆', '👑', '✨', '👏', '🚀'];

export const CelebrationBalloonsOverlay: React.FC<CelebrationBalloonsOverlayProps> = ({
  isActive,
  title,
  subtitle,
  pointsBadge,
  durationMs = 4500,
  onComplete
}) => {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);

  useEffect(() => {
    if (!isActive) {
      setBalloons([]);
      return;
    }

    // Generate 18-24 floating balloons and elements across the screen
    const items: BalloonItem[] = Array.from({ length: 22 }).map((_, i) => ({
      id: 'bal-' + i + '-' + Math.random(),
      x: Math.random() * 92 + 4, // 4% to 96%
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      size: Math.random() * 26 + 34, // 34px - 60px
      duration: Math.random() * 2 + 2.5, // 2.5s - 4.5s
      delay: Math.random() * 0.8,
      emoji: FUN_EMOJIS[i % FUN_EMOJIS.length]
    }));

    setBalloons(items);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isActive, durationMs, onComplete]);

  if (!isActive && balloons.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Floating Balloons */}
      <AnimatePresence>
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: '110vh', opacity: 0, x: `${b.x}vw`, scale: 0.5 }}
            animate={{
              y: '-20vh',
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.5, 1.1, 1, 1],
              rotate: [0, (Math.random() - 0.5) * 40]
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              ease: 'easeOut'
            }}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: 0 }}
          >
            <div
              className={`rounded-full bg-gradient-to-tr ${b.color} shadow-lg shadow-amber-500/20 flex items-center justify-center text-white font-black border-2 border-white/60`}
              style={{ width: b.size, height: b.size * 1.2, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}
            >
              <span className="text-base select-none drop-shadow">{b.emoji}</span>
            </div>
            {/* Balloon String */}
            <div className="w-0.5 h-8 bg-white/40 -mt-0.5" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center Celebration Card Banner if text provided */}
      {isActive && (title || pointsBadge) && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 14 }}
          className="bg-slate-950/95 border-2 border-amber-400 p-6 rounded-3xl text-center shadow-2xl shadow-amber-500/40 max-w-md w-full relative z-10 pointer-events-auto backdrop-blur-xl"
          dir="rtl"
        >
          <div className="text-4xl mb-2 animate-bounce">🎉 🏆 🎈</div>
          {pointsBadge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-sm mb-3 shadow-lg">
              {pointsBadge}
            </span>
          )}
          {title && <h3 className="text-xl font-black text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-amber-200 mt-1 font-bold">{subtitle}</p>}
        </motion.div>
      )}
    </div>
  );
};
