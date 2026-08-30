import React from 'react';
import { getNextLectureInfo } from '../utils/scheduleUtils';

interface NextLectureWidgetProps {
  groupDetails: any;
  variant?: 'student' | 'parent';
}

export const NextLectureWidget: React.FC<NextLectureWidgetProps> = ({ groupDetails, variant = 'parent' }) => {
  if (!groupDetails) return null;
  
  const nextLec = getNextLectureInfo(groupDetails);
  if (!nextLec) return null;
  
  if (variant === 'student') {
    return (
      <div className="flex items-center gap-3 bg-amber-950/20 border border-amber-500/20 p-2 rounded-2xl backdrop-blur-md shrink-0">
        <div className="bg-amber-500/20 text-amber-400 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
          {nextLec.daysLeft}
        </div>
        <div className="text-right">
          <span className="text-[10px] text-amber-500/80 font-bold block">متبقي على المحاضرة</span>
          <span className="text-xs text-amber-300 font-bold block">{nextLec.dayName} {nextLec.time ? `(${nextLec.time})` : ""}</span>
          <span className="text-[10px] text-slate-400 block">{nextLec.formattedDate}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded-xl backdrop-blur-md shrink-0">
      <div className="bg-amber-500/20 text-amber-400 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base">
        {nextLec.daysLeft}
      </div>
      <div className="text-right">
        <span className="text-[9px] text-amber-500/80 font-bold block">متبقي على المحاضرة</span>
        <span className="text-xs text-amber-300 font-bold block">{nextLec.dayName} {nextLec.time ? `(${nextLec.time})` : ""}</span>
      </div>
    </div>
  );
};
