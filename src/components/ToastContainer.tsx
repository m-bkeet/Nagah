import React from 'react';
import { useCenter } from '../context/CenterContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCenter();

  if (toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[75] flex flex-col items-center gap-1.5 max-w-md w-auto px-3 pointer-events-none no-print toast-container"
    >
      {toasts.map((toast) => {
        let bg = 'bg-white/95 border-slate-200 text-slate-800 dark:bg-slate-900/95 dark:border-slate-700 dark:text-slate-100';
        let Icon = Info;
        let iconColor = 'text-blue-600 dark:text-blue-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-50/95 border-emerald-300/80 text-emerald-950 dark:bg-emerald-950/95 dark:border-emerald-700/80 dark:text-emerald-100';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50/95 border-rose-300/80 text-rose-950 dark:bg-rose-950/95 dark:border-rose-700/80 dark:text-rose-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50/95 border-amber-300/80 text-amber-950 dark:bg-amber-950/95 dark:border-amber-700/80 dark:text-amber-100';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600 dark:text-amber-400';
        }

        return (
          <div
            key={toast.id}
            id={toast.id}
            onClick={() => removeToast(toast.id)}
            title="اضغط للإخفاء فوراً"
            className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 ${bg}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
            <p className="text-xs font-bold leading-snug max-w-[320px] truncate">{toast.text}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
