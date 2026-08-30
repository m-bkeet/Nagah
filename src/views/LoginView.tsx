import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, User, CheckCircle2, ArrowRight, Download, Smartphone, Monitor, UserPlus, BookOpen } from 'lucide-react';
import { UserRole } from '../types';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';

export const LoginView: React.FC = () => {
  const { login, alwaysRequireLogin, setAlwaysRequireLogin } = useAuth();
  const { themeConfig } = useTheme();
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('nagah_saved_username') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devClicks, setDevClicks] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const handleDevClick = () => {
    setDevClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowDevPanel(true);
        return 0;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await login(username, password, rememberMe);
      if (!res.success) {
        setError(res.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالنظام');
    } finally {
      setIsLoading(false);
    }
  };

  const quickRoles: { role: UserRole; title: string; u: string; p: string; desc: string }[] = [
    {
      role: 'super_admin',
      title: 'المدير العام (Super Admin)',
      u: 'admin',
      p: '1234',
      desc: 'صلاحيات كاملة غير مقيدة على جميع الفروع'
    },
    {
      role: 'branch_manager',
      title: 'مدير فرع النجاح',
      u: 'manager_ngah',
      p: '1234',
      desc: 'إدارة عمليات فرع النجاح بالكامل والتقارير'
    },
    {
      role: 'accountant',
      title: 'المدير المالي والمحاسب',
      u: 'accountant',
      p: '1234',
      desc: 'إدارة الخزينة، سندات القبض والصرف والمصروفات'
    },
    {
      role: 'receptionist',
      title: 'مسؤول الاستقبال وشؤون الطلاب',
      u: 'reception',
      p: '1234',
      desc: 'تسجيل الطلاب، الحضور والغياب، وإصدار الشهادات'
    },
    {
      role: 'trainer',
      title: 'مدرب ومحاضر',
      u: 'trainer',
      p: '1234',
      desc: 'الجلسات التفاعلية، رصد درجات الاختبارات وكشف المستحقات'
    }
  ];

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
    setIsLoading(true);
    try {
      const res = await login(u, p);
      if (!res.success) {
        setError(res.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالنظام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300" 
      style={{
        background: `linear-gradient(to bottom, ${themeConfig.colors.bgMainGradientStart}, ${themeConfig.colors.bgMainGradientMid}, ${themeConfig.colors.bgMainGradientEnd})`,
        backgroundColor: themeConfig.colors.bgMain
      }}
      dir="rtl"
    >
      <div className="absolute top-4 left-4 z-20">
        <ThemeQuickSwitcher />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-amber-500/10 mb-2 p-3">
            <img 
              src="/logo.png" 
              alt="مركز النجاح" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.svg';
              }}
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-black text-slate-100">
            مركز النجاح للتدريب والاستشارات
          </h1>
          <p className="text-xs text-amber-400 font-mono font-bold tracking-wider">
            Nagah M-S
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              تسجيل الدخول إلى النظام
            </h2>
            <span 
              onClick={handleDevClick} 
              className="text-[10px] text-slate-400 font-mono cursor-pointer select-none active:text-amber-400"
              title="تفعيل وضع المطورين والتحكم والمدربين"
            >
              النسخة السابعة V7 {devClicks > 0 && `(${devClicks}/5)`}
            </span>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم المستخدم</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="اسم المستخدم..."
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me and Preferences */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-300 font-medium">
                  حفظ بيانات الدخول وتذكر الجلسة على هذا الجهاز
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alwaysRequireLogin}
                  onChange={(e) => setAlwaysRequireLogin(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-400">
                  إلزام تسجيل الدخول في كل مرة يتم فتح البرنامج (أمان إضافي)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{isLoading ? 'جاري التحقق...' : 'دخول النظام'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          {showDevPanel && (
            <div className="pt-4 border-t border-slate-800 space-y-2 animate-fadeIn">
              <span className="text-[11px] text-slate-400 font-bold block text-center">
                دخول سريع لحسابات الأدوار والصلاحيات (تجريبي):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickRoles.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickLogin(r.u, r.p)}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-right transition-all group"
                  >
                    <span className="font-bold text-[11px] text-slate-200 group-hover:text-amber-300 block">
                      {r.title}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student & Parent Portals Direct Access */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/?view=student_portal"
            className="bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 rounded-3xl p-4 text-center backdrop-blur-md space-y-2 shadow-xl block group transition-all"
          >
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs group-hover:text-amber-200">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>بوابة الطالب (الواجبات والذكاء)</span>
            </div>
            <p className="text-[10px] text-slate-400">
              رفع الواجبات وتصحيح Gemini الفوري
            </p>
          </a>

          <a
            href="/?view=parent_portal"
            className="bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-4 text-center backdrop-blur-md space-y-2 shadow-xl block group transition-all"
          >
            <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs group-hover:text-emerald-200">
              <User className="w-4 h-4 text-emerald-400" />
              <span>بوابة ولي الأمر</span>
            </div>
            <p className="text-[10px] text-slate-400">
              متابعة الحضور، النتائج والدفع
            </p>
          </a>
        </div>

        {/* Student Public Registration Button */}
        <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-3xl p-5 text-center backdrop-blur-md space-y-2.5 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold text-sm">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <span>تسجيل طالب جديد في الدورات التدريبية</span>
          </div>
          <p className="text-xs text-slate-300">
            للتسجيل الفوري للطلاب دون الحاجة لتسجيل دخول أو بريد إلكتروني
          </p>
          <a
            href="/?view=register"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all"
          >
            <span>فتح نموذج تسجيل الطلاب الآن</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </a>
        </div>

        {/* PWA Install Promotion Box */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">تثبيت التطبيق على جهازك</p>
              <p className="text-[10px] text-slate-400">للكمبيوتر (Windows/Mac) والموبايل (Android/iOS)</p>
            </div>
          </div>
          <PwaInstallPrompt />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          مركز النجاح للتدريب والاستشارات © {new Date().getFullYear()} - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};
