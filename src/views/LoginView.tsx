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
  Briefcase,
  GraduationCap,
  Users,
  Download,
  Building2,
  RefreshCw
} from 'lucide-react';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { AdminPasscodeModal } from '../components/AdminPasscodeModal';

export const LoginView: React.FC = () => {
  const { login, alwaysRequireLogin, setAlwaysRequireLogin } = useAuth();
  const { isDark } = useTheme();
  const { settings } = useCenter();
  
  const effectiveLogo = settings?.logoUrl || localStorage.getItem('nagah_custom_logo') || '/icon-512.png';
  const effectiveCenterName = settings?.centerName || 'مركز النجاح للتدريب والاستشارات';
  const effectiveSubtitle = settings?.centerSubtitle || 'نظام الإدارة والتشغيل السحابي المتكامل';
  
  const [activeTab, setActiveTab] = useState<'admin' | 'trainer'>('admin');
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(true);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  
  // Admin form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Trainer form state
  const [trainerCode, setTrainerCode] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [showTrainerPassword, setShowTrainerPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin login handler
  const handleAdminSubmit = async (e: React.FormEvent) => {
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

  // Trainer login handler
  const handleTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerCode.trim()) {
      setError('يرجى إدخال كود المدرب أو رقم الهاتف');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/trainer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trainerCode.trim(), password: trainerPassword.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success && data.trainer) {
        localStorage.setItem('trainer_session_code', trainerCode.trim());
        localStorage.setItem('nagah_trainer_session', JSON.stringify(data.trainer));
        window.location.href = '/?view=trainer_portal';
      } else {
        setError(data.error || 'كود المدرب غير مسجل أو كلمة المرور غير مطابقة');
      }
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالنظام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-gradient-to-br from-amber-50/70 via-white to-slate-100 text-slate-900 transition-colors duration-300 overflow-y-auto"
      dir="rtl"
    >
      {/* Top Theme Switcher Button */}
      <div className="fixed top-3 left-3 z-30 flex items-center gap-2">
        <ThemeQuickSwitcher />
      </div>

      {/* Main Responsive Wide Frame */}
      <div className="w-full max-w-4xl bg-white border-2 border-amber-300/80 rounded-3xl shadow-2xl shadow-amber-900/10 overflow-hidden flex flex-col lg:flex-row my-auto animate-fadeIn">
        
        {/* Right Panel: Brand & Info */}
        <div className="lg:w-5/12 bg-gradient-to-br from-amber-50 via-amber-100/30 to-white p-6 sm:p-8 border-b lg:border-b-0 lg:border-l border-amber-200 flex flex-col justify-between">
          <div>
            {/* Logo with 3D Golden Metallic Ring */}
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-28 h-28 rounded-full bg-white border-4 border-amber-400 p-1.5 shadow-xl shadow-amber-500/25 shrink-0 flex items-center justify-center overflow-hidden relative">
                <img 
                  src={effectiveLogo} 
                  alt={effectiveCenterName} 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', '/icon-512.png');
                  }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {effectiveCenterName}
                </h1>
                <p className="text-xs text-amber-800 font-bold flex items-center justify-center gap-1 mt-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{effectiveSubtitle}</span>
                </p>
              </div>
            </div>

            {/* Info Badge */}
            <div className="p-4 bg-white/90 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-2 leading-relaxed shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>منظومة الإدارة والتدريب المعتمدة</span>
              </div>
              <p className="text-[11px] text-slate-600">
                بوابة مخصصة للإدارة العامة، رؤساء الأقسام، والمحاضرين لإدارة الجداول والحصص والتقارير الأكاديمية والمالية.
              </p>
            </div>
          </div>

          {/* Student & Parent Link Footer */}
          <div className="pt-4 mt-4 border-t border-amber-200">
            <a
              href="/?view=student_portal"
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 hover:text-amber-950 font-bold text-xs flex items-center justify-between transition-all shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>بوابة الطلاب وأولياء الأمور 👨‍👩‍👧‍👦</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 rotate-180 text-amber-600" />
            </a>
          </div>
        </div>

        {/* Left Panel: Tabbed Login Forms */}
        <div className="lg:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-white">
          
          <div>
            {/* Top Navigation Tabs for Platform Admin vs Trainer */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>لوحة تحكم المنصة 🏢</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('trainer'); setError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'trainer'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>بوابة المدرب 👨‍🏫</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* FORM 1: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                    اسم المستخدم أو كود الحساب
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-mono"
                      placeholder="أدخل اسم المستخدم أو كود الحساب..."
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl pr-10 pl-10 py-2.5 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                      placeholder="أدخل كلمة المرور..."
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 bg-white"
                    />
                    <span className="text-[11px] text-slate-700 font-bold">
                      تذكر الجلسة على هذا الجهاز
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setAlwaysRequireLogin(!alwaysRequireLogin)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                      alwaysRequireLogin
                        ? 'text-amber-800 bg-amber-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {alwaysRequireLogin ? '🔒 قفل أمني مفعل' : '🔓 قفل أمني عادي'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2 border border-amber-300"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري التحقق والدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>دخول لوحة تحكم المنصة 🏢</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM 2: TRAINER LOGIN */}
            {activeTab === 'trainer' && (
              <form onSubmit={handleTrainerSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                    كود المدرب أو رقم الهاتف
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={trainerCode}
                      onChange={(e) => setTrainerCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-mono"
                      placeholder="اكتب كود المدرب أو رقم الهاتف..."
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                    كلمة المرور للبوابة
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type={showTrainerPassword ? 'text' : 'password'}
                      value={trainerPassword}
                      onChange={(e) => setTrainerPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 rounded-xl pr-10 pl-10 py-2.5 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                      placeholder="أدخل كلمة المرور الخاصة بك..."
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTrainerPassword(!showTrainerPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                    >
                      {showTrainerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2 border border-amber-300"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري التحقق من كود المدرب...</span>
                    </>
                  ) : (
                    <>
                      <span>دخول بوابة المدرب 👨‍🏫</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          <div className="pt-4 text-center text-[10px] text-slate-500 border-t border-slate-100 mt-4">
            <span>مركز النجاح للتدريب والاستشارات — المنظومة الشاملة المعتمدة</span>
          </div>

        </div>

      </div>

      {/* Admin Passcode Gate Modal */}
      <AdminPasscodeModal
        isOpen={showPasscodeModal && !isPasscodeUnlocked}
        onClose={() => {
          setShowPasscodeModal(false);
          window.location.href = '/?view=student_portal';
        }}
        onSuccess={() => {
          setIsPasscodeUnlocked(true);
          setShowPasscodeModal(false);
        }}
      />
    </div>
  );
};
