import React, { useState } from 'react';
import { Lock, KeyRound, X } from 'lucide-react';
import { useCenter } from '../context/CenterContext';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { settings, showToast } = useCenter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings?.adminPasscode || localStorage.getItem('nagah_admin_passcode') || '2026';
    if (passcode.trim() === correctPin) {
      sessionStorage.setItem('nagah_admin_passcode_unlocked', 'true');
      showToast('تم التحقق بنجاح! مرحباً بك 🔓', 'success');
      onSuccess();
    } else {
      setError('الرقم السري غير صحيح! يرجى المحاولة مرة أخرى.');
      setPasscode('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-amber-950/50 relative space-y-6 text-right">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-slate-100">
            حماية بوابات الإدارة والمدربين 🔐
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            هذه المنطقة مخصصة لإدارة المركز والمدربين ومسؤولي النظام فقط. يرجى إدخال الرقم السري المعتمد للمتابعة.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              الرقم السري لدخول الإدارة
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-amber-400 absolute right-3.5 top-3" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                placeholder="أدخل الرقم السري..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-11 pl-4 py-3 text-slate-100 text-base font-mono focus:outline-none focus:border-amber-500 text-center tracking-widest"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تحقق ودخول 🔓</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
