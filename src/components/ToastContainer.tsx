import React from 'react';
import { useCenter } from '../context/CenterContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCenter();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none no-print toast-container">
      {toasts.map((toast) => {
        let bg = 'bg-white border-slate-200 text-slate-900 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100 shadow-xl';
        let Icon = Info;
        let iconColor = 'text-blue-600 dark:text-blue-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-700/80 dark:text-emerald-100 shadow-xl';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/90 dark:border-rose-700/80 dark:text-rose-100 shadow-xl';
          Icon = AlertCircle;
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/90 dark:border-amber-700/80 dark:text-amber-100 shadow-xl';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600 dark:text-amber-400';
        }

        return (
          <div
            key={toast.id}
            id={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <p className="text-sm font-bold leading-relaxed">{toast.text}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 mr-2 cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
