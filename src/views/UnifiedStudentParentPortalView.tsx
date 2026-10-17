import React, { useState, useEffect } from 'react';
import { PublicStudentPortalView } from './PublicStudentPortalView';
import { PublicParentPortalView } from './PublicParentPortalView';
import { PublicRegistrationView } from './PublicRegistrationView';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { useCenter } from '../context/CenterContext';
import { 
  GraduationCap, 
  Users, 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Download, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  UserPlus,
  HelpCircle,
  X,
  Send
} from 'lucide-react';
import { resilientOfflineService } from '../services/resilientOfflineService';

interface UnifiedStudentParentPortalViewProps {
  initialMode?: 'student' | 'parent';
  directTaskId?: string | null;
  onBack?: () => void;
}

export const UnifiedStudentParentPortalView: React.FC<UnifiedStudentParentPortalViewProps> = ({
  initialMode,
  directTaskId,
  onBack
}) => {
  const { settings } = useCenter();

  // Determine if already logged in to student or parent session
  const [activePortal, setActivePortal] = useState<'none' | 'student' | 'parent' | 'register'>(() => {
    if (typeof window === 'undefined') return 'none';
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const roleParam = params.get('role');
    const urlCode = params.get('code') || params.get('studentCode') || params.get('c');

    if (viewParam === 'register') return 'register';

    // If explicit URL code was provided, go straight to student portal
    if (urlCode) {
      return 'student';
    }

    // Only restore active session if active in current browser tab session
    const hasStudentTabSession = Boolean(sessionStorage.getItem('nagah_student_tab_session'));
    const hasParentTabSession = Boolean(sessionStorage.getItem('nagah_parent_tab_session'));

    if (viewParam === 'parent_portal' || viewParam === 'parent' || roleParam === 'parent') {
      return hasParentTabSession ? 'parent' : 'none';
    }
    if (viewParam === 'student_portal' || viewParam === 'student' || roleParam === 'student') {
      return hasStudentTabSession ? 'student' : 'none';
    }
    if (hasStudentTabSession) return 'student';
    if (hasParentTabSession) return 'parent';
    return 'none';
  });

  const [codeOrPhone, setCodeOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetAction, setTargetAction] = useState<'student' | 'parent' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Inquiry modal state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryText, setInquiryText] = useState('');

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  // Unified login submission
  const handleLoginSubmit = async (portalType: 'student' | 'parent') => {
    if (!codeOrPhone.trim()) {
      setErrorMessage('يرجى كتابة كود الطالب أو رقم الهاتف المسجل أولاً.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setTargetAction(portalType);

    const cleanInput = codeOrPhone.trim();

    try {
      if (portalType === 'student') {
        // Authenticate student endpoint
        const res = await fetch('/api/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeOrPhone: cleanInput, password: password.trim() })
        });
        const data = await res.json();

        if (res.ok && data.success && data.student) {
          localStorage.setItem('student_session_code', cleanInput);
          if (password.trim()) {
            localStorage.setItem('student_session_password', password.trim());
          }
          sessionStorage.setItem('nagah_student_tab_session', JSON.stringify(data));
          localStorage.setItem('nagah_student_active_session', JSON.stringify(data));
          resilientOfflineService.saveToCache('student', data);
          setActivePortal('student');
        } else {
          setErrorMessage(data.error || 'لم يتم العثور على حساب الطالب أو كلمة المرور غير مطابقة');
        }
      } else {
        // Authenticate parent endpoint
        const res = await fetch('/api/parent/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeOrPhone: cleanInput, password: password.trim() })
        });
        const data = await res.json();

        if (res.ok && data.success && data.children && data.children.length > 0) {
          localStorage.setItem('parent_session_code', cleanInput);
          if (password.trim()) {
            localStorage.setItem('parent_session_password', password.trim());
          }
          sessionStorage.setItem('nagah_parent_tab_session', JSON.stringify(data));
          localStorage.setItem('nagah_parent_cache', JSON.stringify(data));
          resilientOfflineService.saveToCache('parent', data);
          setActivePortal('parent');
        } else {
          setErrorMessage(data.error || 'لم يتم العثور على سجلات الأبناء المسجلة بهذا الكود أو رقم الهاتف');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت');
    } finally {
      setIsLoading(false);
      setTargetAction(null);
    }
  };

  const handleSendInquiryWhatsApp = () => {
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف أولاً');
      return;
    }
    const centerPhone = settings?.phone || '01001500686';
    const cleanPhone = centerPhone.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const message = `استفسار / شكوى من بوابة المتدرب وأولياء الأمور:\n👤 الاسم: ${inquiryName}\n📱 الهاتف: ${inquiryPhone}\n💬 الرسالة: ${inquiryText || 'لا توجد تفاصيل إضافية'}`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowInquiryModal(false);
  };

  // Render Logged-in Student Portal
  if (activePortal === 'student') {
    return (
      <PublicStudentPortalView directTaskId={directTaskId} onBack={() => setActivePortal('none')} />
    );
  }

  // Render Logged-in Parent Portal
  if (activePortal === 'parent') {
    return (
      <PublicParentPortalView onBack={() => setActivePortal('none')} />
    );
  }

  // Render Public Registration View
  if (activePortal === 'register') {
    return (
      <PublicRegistrationView onBack={() => setActivePortal('none')} />
    );
  }

  // UNIFIED LIGHT & ROYAL GOLD LOGIN VIEW (Student & Parent Entrance)
  return (
    <div 
      className="min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-amber-50/70 via-white to-slate-100 text-slate-900 relative overflow-y-auto"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-900/10 backdrop-blur-2xl space-y-4 relative z-10 my-auto">
        {/* Official Circular 3D Gold Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white border-4 border-amber-400 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center relative group">
            <img 
              src="/icon-512.png" 
              alt="مركز النجاح للتدريب والاستشارات" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              بوابة المتدرب وولي الأمر
            </h1>
            <p className="text-[11px] sm:text-xs text-amber-800 font-bold mt-0.5">
              مركز النجاح للتدريب والاستشارات — نحو مستقبل واعد
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Unified Clean Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              كود الطالب أو رقم الهاتف المسجل بالمركز
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={codeOrPhone}
                onChange={(e) => setCodeOrPhone(e.target.value)}
                placeholder="اكتب كود الطالب (مثال: A01) أو رقم الهاتف..."
                autoComplete="off"
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-xs transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>كلمة المرور / الرمز السري للبوابة</span>
              <span className="text-[10px] text-slate-500 font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="اتركها فارغة إذا لم تكن كلمة سر..."
                autoComplete="off"
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/10 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* TWO PRIMARY BRIGHT HIGH-CONTRAST ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* 1. Student Portal Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLoginSubmit('student')}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-amber-300"
            >
              {isLoading && targetAction === 'student' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <GraduationCap className="w-4 h-4 text-slate-950" />
              )}
              <span>دخول بوابة الطالب 🎓</span>
            </button>

            {/* 2. Parent Portal Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLoginSubmit('parent')}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-indigo-400"
            >
              {isLoading && targetAction === 'parent' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Users className="w-4 h-4 text-white" />
              )}
              <span>دخول بوابة ولي الأمر 👨‍👩‍👧‍👦</span>
            </button>
          </div>

          {/* 3 & 4. Additional Quick Action Buttons: New Registration & Inquiry/Complaint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActivePortal('register')}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>التسجيل لتسجيل جديد 📝</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInquiryModal(true)}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-black text-xs shadow-md shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-200"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>إرسال استفسار أو شكوى 💬</span>
            </button>
          </div>
        </div>

        {/* Inquiry / Complaint Modal */}
        {showInquiryModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-amber-300 space-y-4 animate-in fade-in zoom-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">إرسال استفسار أو شكوى</h3>
                    <p className="text-xs text-slate-500">سيتم الرد عبر واتساب الدعم الفني فوراً</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب أو ولي الأمر</label>
                  <input
                    type="text"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="اكتب اسمك الكريم..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="اكتب رقم هاتفك..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نص الاستفسار أو الشكوى</label>
                  <textarea
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="اكتب تفاصيل استفسارك أو مشكلتك هنا..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendInquiryWhatsApp}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال عبر واتساب 📲</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PWA Install Notice or Button */}
        {deferredPrompt && !isInstalled && (
          <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[11px] text-amber-900 font-bold">تثبيت التطبيق</span>
            </div>
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shadow-sm"
            >
              تثبيت 📲
            </button>
          </div>
        )}

        <div className="pt-1.5 text-center text-[10px] text-slate-500 border-t border-slate-100">
          مركز النجاح للتدريب والاستشارات — بوابة المتدرب وأولياء الأمور
        </div>
      </div>
    </div>
  );
};

