import React, { useState, useEffect } from 'react';
import { getNextLectureInfo, NextLectureInfo } from '../utils/scheduleUtils';
import { Clock, Calendar, Sparkles } from 'lucide-react';

interface NextLectureWidgetProps {
  groupDetails: any;
  variant?: 'student' | 'parent' | 'banner';
  className?: string;
}

export const NextLectureWidget: React.FC<NextLectureWidgetProps> = ({ 
  groupDetails, 
  variant = 'parent',
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live timer tick every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!groupDetails) return null;
  
  const nextLec = getNextLectureInfo(groupDetails, currentTime);
  if (!nextLec) return null;

  // Banner variant for schedule tabs or prominent announcements
  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-2xl border transition-all ${
        nextLec.isOngoing 
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300' 
          : nextLec.isLessThanOneDay 
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200' 
            : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
      } ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shrink-0 ${
              nextLec.isOngoing 
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                : nextLec.isLessThanOneDay 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
            }`}>
              {nextLec.isOngoing ? (
                <span className="text-xs font-bold animate-pulse">الآن</span>
              ) : nextLec.isLessThanOneDay ? (
                <div className="text-center">
                  <span className="text-[11px] font-mono font-bold block leading-none">{nextLec.badgeText}</span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-base leading-none font-bold block">{nextLec.daysLeft}</span>
                  <span className="text-[9px] font-normal block text-indigo-500 dark:text-indigo-300">أيام</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Clock className={`w-3.5 h-3.5 ${nextLec.isOngoing ? 'text-emerald-500 dark:text-emerald-400 animate-spin-slow' : 'text-amber-500 dark:text-amber-400'}`} />
                <span className="text-xs font-bold">
                  {nextLec.isOngoing ? 'المحاضرة جارية الآن 🟢' : `متبقي على المحاضرة: ${nextLec.countdownFormatted}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {nextLec.dayName} {nextLec.time ? `(${nextLec.time})` : ''} • {nextLec.formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'student') {
    return (
      <div className={`flex items-center gap-3 border p-2 px-3 rounded-2xl backdrop-blur-md shrink-0 transition-all ${
        nextLec.isOngoing
          ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : nextLec.isLessThanOneDay
            ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'bg-white/80 dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800 shadow-xs'
      } ${className}`}>
        <div className={`rounded-xl flex flex-col items-center justify-center font-bold shrink-0 transition-all ${
          nextLec.isOngoing
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-12 h-10 border border-emerald-500/30 animate-pulse'
            : nextLec.isLessThanOneDay
              ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300 min-w-[58px] px-2 h-10 border border-amber-500/40'
              : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 w-10 h-10 border border-amber-500/20'
        }`}>
          {nextLec.isOngoing ? (
            <span className="text-xs font-black">الآن</span>
          ) : nextLec.isLessThanOneDay ? (
            <div className="text-center font-mono">
              <span className="text-[11px] font-black leading-none block">{nextLec.badgeText}</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-base font-black leading-none block">{nextLec.daysLeft}</span>
              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400/80 block mt-0.5 leading-none">
                {nextLec.daysLeft === 1 ? 'يوم' : nextLec.daysLeft === 2 ? 'يومان' : 'أيام'}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-bold block">
              {nextLec.isOngoing ? 'المحاضرة جارية الآن' : nextLec.isLessThanOneDay ? `متبقي: ${nextLec.countdownFormatted}` : 'متبقي على المحاضرة'}
            </span>
          </div>
          <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block leading-tight mt-0.5">
            {nextLec.dayName} {nextLec.time ? `(${nextLec.time})` : ''}
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">{nextLec.formattedDate}</span>
        </div>
      </div>
    );
  }

  // Parent Portal Variant
  return (
    <div className={`flex items-center gap-3 border px-3 py-2 rounded-xl backdrop-blur-md shrink-0 transition-all ${
      nextLec.isOngoing
        ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 shadow-sm'
        : nextLec.isLessThanOneDay
          ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 shadow-sm'
          : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 shadow-xs'
    } ${className}`}>
      <div className={`rounded-lg flex flex-col items-center justify-center font-bold shrink-0 ${
        nextLec.isOngoing
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-11 h-9 border border-emerald-500/30 animate-pulse'
          : nextLec.isLessThanOneDay
            ? 'bg-amber-500/25 text-amber-700 dark:text-amber-300 min-w-[54px] px-1.5 h-9 border border-amber-500/40 font-mono text-[10px]'
            : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 w-9 h-9 border border-amber-500/20 text-base'
      }`}>
        {nextLec.isOngoing ? (
          <span className="text-xs font-black">الآن</span>
        ) : nextLec.isLessThanOneDay ? (
          <span>{nextLec.badgeText}</span>
        ) : (
          <div className="text-center">
            <span className="text-sm font-black leading-none block">{nextLec.daysLeft}</span>
            <span className="text-[7px] text-amber-600 dark:text-amber-400/80 block leading-none">أيام</span>
          </div>
        )}
      </div>
      <div className="text-right">
        <span className="text-[9px] text-amber-600 dark:text-amber-500/80 font-bold block">
          {nextLec.isOngoing ? 'المحاضرة جارية الآن' : nextLec.isLessThanOneDay ? `متبقي: ${nextLec.countdownFormatted}` : 'متبقي على المحاضرة'}
        </span>
        <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block leading-tight mt-0.5">
          {nextLec.dayName} {nextLec.time ? `(${nextLec.time})` : ''}
        </span>
      </div>
    </div>
  );
};

