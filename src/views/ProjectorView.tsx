import React from 'react';

/**
 * ProjectorView has been disabled to eliminate aggressive background polling
 * and preserve edge request quotas.
 */
export const ProjectorView: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-amber-400">تم إيقاف وضع شاشة العرض (Projector)</h2>
        <p className="text-sm text-slate-400">
          تم إلغاء شاشة العرض لتوفير موارد الخادم والحد من الاستهلاك غير الضروري.
        </p>
        {onExit && (
          <button
            onClick={onExit}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
          >
            العودة للوحة التحكم
          </button>
        )}
      </div>
    </div>
  );
};
