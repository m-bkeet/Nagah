import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCenter } from '../context/CenterContext';
import { 
  Shield, 
  Lock, 
  User, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Wallet,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { AdminPasscodeModal } from '../components/AdminPasscodeModal';

export const LoginView: React.FC = () => {
  const { login, alwaysRequireLogin, setAlwaysRequireLogin } = useAuth();
  const { isDark } = useTheme();
  const { settings } = useCenter();
  
  const effectiveLogo = settings?.logoUrl || localStorage.getItem('nagah_custom_logo') || '/logo.svg';
  const effectiveCenterName = settings?.centerName || 'مركز النجاح للتدريب';
  const effectiveSubtitle = settings?.centerSubtitle || 'نظام الإدارة والتشغيل السحابي';
  
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(true);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState('المدير العام');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم أو كود الحساب');
      return;
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await login(username.trim(), password, rememberMe);
      if (!res.success) {
        setError(res.message || 'بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالنظام، يرجى التحقق من الاتصال بالإنترنت');
    } finally {
      setIsLoading(false);
    }
  };

  const quickRoles = [
    {
      id: 'super_admin',
      title: 'المدير العام',
      u: 'admin',
      p: '1234',
      icon: <Crown className="w-4 h-4 text-amber-500" />,
      desc: 'صلاحيات كاملة'
    },
    {
      id: 'accountant',
      title: 'الماليات والخزينة',
      u: 'accountant',
      p: '1234',
      icon: <Wallet className="w-4 h-4 text-emerald-500" />,
      desc: 'تحصيل ومصروفات'
    },
    {
      id: 'receptionist',
      title: 'الاستقبال وشؤون الطلاب',
      u: 'reception',
      p: '1234',
      icon: <ClipboardList className="w-4 h-4 text-blue-500" />,
      desc: 'حضور وتسجيل'
    },
    {
      id: 'trainer',
      title: 'المدرب والمحاضر',
      u: 'trainer',
      p: '1234',
      icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
      desc: 'المجموعات والدرجات'
    }
  ];

  const handleQuickSelect = (r: typeof quickRoles[0]) => {
    setUsername(r.u);
    setPassword(r.p);
    setSelectedRoleTitle(r.title);
    setError('');
  };

  return (
    <div 
      className="h-screen max-h-screen w-full flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden"
      style={{
        backgroundImage: isDark 
          ? `radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(15, 23, 42, 0.95) 0%, transparent 60%)`
          : `radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(226, 232, 240, 0.85) 0%, transparent 60%)`
      }}
      dir="rtl"
    >
      {/* Top Theme Switcher Button */}
      <div className="fixed top-3 left-3 z-30 flex items-center gap-2">
        <ThemeQuickSwitcher />
      </div>

      {/* Main Responsive Wide Frame */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/15 dark:shadow-none overflow-hidden flex flex-col lg:flex-row max-h-[96vh]">
        
        {/* Right Panel: Brand & Quick Roles (Horizontal on Desktop) */}
        <div className="lg:w-5/12 bg-gradient-to-br from-amber-500/10 via-slate-50 to-slate-100 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            {/* Logo & Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 p-1.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                <img 
                  src={effectiveLogo} 
                  alt={effectiveCenterName} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', '/logo.svg');
                  }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {effectiveCenterName}
                </h1>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 truncate">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{effectiveSubtitle}</span>
                </p>
              </div>
            </div>

            {/* Quick Roles Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <span>⚡</span>
                <span>اختر الحساب المطلوب للدخول الفوري:</span>
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                {quickRoles.map((r) => {
                  const isSelected = username === r.u;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleQuickSelect(r)}
                      className={`p-2 rounded-xl text-right transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-md scale-[1.02]'
                          : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-slate-950/15' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {r.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate ${isSelected ? 'font-black text-slate-950' : 'font-bold'}`}>
                          {r.title}
                        </p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-slate-900/80 font-bold' : 'text-slate-400'}`}>
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Public Portal Link Footer */}
          <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800">
            <a
              href="/#public"
              className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>بوابة الطلاب وأولياء الأمور العامة</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 rotate-180 text-amber-500" />
            </a>
          </div>
        </div>

        {/* Left Panel: Direct Login Form */}
        <div className="lg:w-7/12 p-4 sm:p-6 lg:p-7 flex flex-col justify-between bg-white dark:bg-slate-900">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    تسجيل الدخول إلى النظام
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    أدخل بيانات الاعتماد أو اضغط على أحد الحسابات السريعة
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                V7.0 سحابي
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Username Field */}
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 text-xs">
                  اسم المستخدم أو كود الحساب
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSelectedRoleTitle('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl pr-10 pl-4 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="اسم المستخدم..."
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1 text-xs">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedRoleTitle('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl pr-10 pl-10 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="كلمة المرور..."
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options: Remember Me & Lock */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                    تذكر الجلسة على هذا الجهاز
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setAlwaysRequireLogin(!alwaysRequireLogin)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                    alwaysRequireLogin
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {alwaysRequireLogin ? '🔒 قفل أمني مفعل' : '🔓 قفل أمني عادي'}
                </button>
              </div>

              {/* Selected role confirmation */}
              {selectedRoleTitle && (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>تم تجهيز بيانات حساب: <b>{selectedRoleTitle}</b></span>
                  </span>
                  <span className="text-[9.5px] font-mono opacity-80 font-bold">جاهز للدخول</span>
                </div>
              )}

              {/* Prominent Login Button - Always 100% In-View */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{isLoading ? 'جاري التحقق والدخول...' : 'تسجيل الدخول إلى النظام'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-400">
            <span>منظومة النجاح الذكية للتدريب والاستشارات V7.0 — جميع الحقوق محفوظة</span>
          </div>

        </div>

      </div>

      {/* Admin Passcode Gate Modal */}
      <AdminPasscodeModal
        isOpen={showPasscodeModal && !isPasscodeUnlocked}
        onClose={() => {
          setShowPasscodeModal(false);
          window.location.href = '/#public';
        }}
        onSuccess={() => {
          setIsPasscodeUnlocked(true);
          setShowPasscodeModal(false);
        }}
      />
    </div>
  );
};
