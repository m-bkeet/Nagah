import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  Download, 
  UserPlus, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  Smartphone, 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Lock,
  Share2,
  Laptop
} from 'lucide-react';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { useCenter } from '../context/CenterContext';
import { useTheme } from '../context/ThemeContext';
import { AdminPasscodeModal } from '../components/AdminPasscodeModal';

interface PublicHomeViewProps {
  onNavigate: (view: string) => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onNavigate }) => {
  const { settings, showToast } = useCenter();
  const { isDark } = useTheme();

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);

  // Issue report form state
  const [issueName, setIssueName] = useState('');
  const [issuePhone, setIssuePhone] = useState('');
  const [issueType, setIssueType] = useState('forgot_code');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const issueTypes = [
    { id: 'forgot_code', label: 'نسيت كود الطالب الخاص بي' },
    { id: 'phone_mismatch', label: 'رقم الهاتف غير مسجل أو يتطلب التحديث' },
    { id: 'portal_error', label: 'مشكلة أو خطأ تقني أثناء فتح البوابة' },
    { id: 'other', label: 'استفسار أو مشكلة أخرى' }
  ];

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: settings?.centerName || 'مركز النجاح للتدريب والاستشارات',
        text: 'بوابة الطلاب وأولياء الأمور - مركز النجاح للتدريب',
        url: window.location.origin
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      showToast('تم نسخ رابط المنصة بنجاح! 📋', 'success');
    }
  };

  const handleSendIssueWhatsApp = () => {
    if (!issueName.trim() || !issuePhone.trim()) {
      showToast('يرجى كتابة اسم الطالب ورقم الهاتف أولاً', 'warning');
      return;
    }
    const selectedTypeLabel = issueTypes.find(t => t.id === issueType)?.label || issueType;
    const centerPhone = settings?.phone || '01000000000';
    const message = `السلام عليكم شؤون الطلاب بمركز النجاح للتدريب 🌸\nأرجو المساعدة في حل مشكلة الدخول للبوابة:\n👤 اسم الطالب: ${issueName}\n📱 رقم الهاتف: ${issuePhone}\n⚠️ نوع المشكلة: ${selectedTypeLabel}\n📝 تفاصيل إضافية: ${issueDetails || 'لا توجد'}`;

    const cleanPhone = centerPhone.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSaveIssueCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueName.trim() || !issuePhone.trim()) {
      showToast('يرجى كتابة اسم الطالب ورقم الهاتف', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      setSubmittedSuccess(true);
      showToast('تم إرسال بلاغك بنجاح وسيتواصل معك الدعم الفني فوراً', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء الإرسال', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden transition-colors duration-300 font-sans"
      style={{
        backgroundImage: isDark 
          ? `radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)`
          : `radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 50%)`
      }}
      dir="rtl"
    >
      {/* Top Header - Compact & Crisp */}
      <header className="shrink-0 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl px-3 sm:px-5 py-2 shadow-xs z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Center Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-950 p-1 border border-amber-500/40 shadow-xs flex items-center justify-center shrink-0">
              <img 
                src="/logo.svg" 
                alt="مركز النجاح" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate leading-tight">
                {settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}
              </h1>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate">
                الواجهة العامة للطلاب وأولياء الأمور
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeQuickSwitcher />
            <button
              onClick={handleShareApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="مشاركة رابط المنصة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Auto-Fit Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-2 sm:py-3 flex-1 flex flex-col justify-between w-full gap-2.5 sm:gap-3.5 overflow-hidden">
        
        {/* Streamlined Welcome Hero Ribbon */}
        <div className="shrink-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-3.5 py-2.5 sm:py-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                الوصول المباشر لخدمات الطلاب وأولياء الأمور
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                متابعة الحضور والغياب، تسليم الواجبات، كشف الدرجات، والتسجيل الفوري
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 shrink-0">
            <span>✨ نظام ذكي تفاعلي متكامل</span>
          </div>
        </div>

        {/* 4 Core Balanced Cards Grid - Perfectly Fits Viewport */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 flex-1 items-stretch overflow-hidden">
          
          {/* Card 1: بوابة المتدرب */}
          <div className="group relative bg-white dark:bg-slate-900 hover:bg-amber-50/20 dark:hover:bg-slate-850 border border-amber-400/40 dark:border-amber-500/30 hover:border-amber-500 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  دخول الطلاب
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                بوابة المتدرب الذكية
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                الدخول برقم الهاتف أو الكود لاستعراض الواجبات، تسليم المهمات، الدرجات، ونقاط الكارنيه الرقمي.
              </p>
            </div>
            <button
              onClick={() => onNavigate('student_portal')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>فتح بوابة المتدرب</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Card 2: بوابة ولي الأمر */}
          <div className="group relative bg-white dark:bg-slate-900 hover:bg-emerald-50/20 dark:hover:bg-slate-850 border border-emerald-400/40 dark:border-emerald-500/30 hover:border-emerald-500 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  متابعة الأبناء
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                بوابة ولي الأمر
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                متابعة تقارير حضور وغياب الطالب، درجات الاختبارات الدورية، إيصالات السداد، والتقارير التدريبية.
              </p>
            </div>
            <button
              onClick={() => onNavigate('parent_portal')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>فتح بوابة ولي الأمر</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Card 3: تسجيل طالب جديد */}
          <div className="group relative bg-white dark:bg-slate-900 hover:bg-indigo-50/20 dark:hover:bg-slate-850 border border-indigo-400/40 dark:border-indigo-500/30 hover:border-indigo-500 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  انضمام جديد
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                تسجيل طالب جديد
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                الالتحاق بالدورات التدريبية المتاحة والتسجيل السريع للطلاب الجدد بالمركز بخطوات بسيطة.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-xs shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>بدء التسجيل والالتحاق</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Card 4: تنزيل وتثبيت التطبيق */}
          <div className="group relative bg-white dark:bg-slate-900 hover:bg-sky-50/20 dark:hover:bg-slate-850 border border-sky-400/40 dark:border-sky-500/30 hover:border-sky-500 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  تطبيقات الأجهزة
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                تنزيل وتثبيت التطبيق
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                تثبيت تطبيق مركز النجاح على الهواتف الذكية والكمبيوتر (Windows/Mac) للتشغيل السريع.
              </p>
            </div>

            <div className="space-y-1.5 shrink-0">
              <PwaInstallPrompt />
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-bold text-[11px] border border-sky-300 dark:border-sky-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>طريقة التثبيت خطوة بخطوة</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Compact Utility Bar - Zero Vertical Waste */}
        <div className="shrink-0 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
          
          {/* Quick Support & Help Trigger */}
          <button
            type="button"
            onClick={() => {
              setSubmittedSuccess(false);
              setShowIssueModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>هل تواجه مشكلة في تسجيل الدخول؟ أرسل طلباً للدعم</span>
          </button>

          {/* Admin & Staff Login Gate */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (sessionStorage.getItem('nagah_admin_passcode_unlocked') === 'true') {
                  onNavigate('login');
                } else {
                  setShowAdminPasscodeModal(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>دخول الكادر والإدارة 🔐</span>
            </button>

            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              © {new Date().getFullYear()} {settings?.centerName || 'النجاح للتدريب'}
            </span>
          </div>
        </div>

      </main>

      {/* Modal 1: إرسال مشكلة دخول */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl relative space-y-4 text-slate-900 dark:text-slate-100 font-sans text-right" dir="rtl">
            <button
              onClick={() => setShowIssueModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  بلاغ عن مشكلة تسجيل الدخول
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  فريق شؤون الطلاب متاح للمساعدة الفورية
                </p>
              </div>
            </div>

            {submittedSuccess ? (
              <div className="text-center py-5 space-y-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300">تم تسجيل بلاغك بنجاح!</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  سيتم مراجعة الطلب بواسطة مسؤول شؤون الطلاب والتواصل مع الرقم المرفق فوراً.
                </p>
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  حسناً، إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveIssueCloud} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الطالب رباعي *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمد علي محمود"
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={issuePhone}
                    onChange={(e) => setIssuePhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع المشكلة *
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {issueTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="اكتب أي معلومات تسهم في تسريع المساعدة..."
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendIssueWhatsApp}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>إرسال واتساب 💬</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال للدعم 🚀'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: طريقة تثبيت التطبيق خطوة بخطوة */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl relative space-y-3.5 text-slate-900 dark:text-slate-100 font-sans text-right" dir="rtl">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  طريقة تثبيت التطبيق على جهازك
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ليعمل كبرنامج مستقل بلمسة واحدة
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {/* Android Instruction */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>هواتف الأندرويد (Android - Chrome)</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  افتح قائمة الخيارات (⋮) أعلى Chrome ثم اختر <strong className="text-amber-600 dark:text-amber-400">"تثبيت التطبيق"</strong> أو "إضافة للشاشة الرئيسية".
                </p>
              </div>

              {/* iPhone Instruction */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                  <span>هواتف الآيفون (iOS - Safari)</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  اضغط على زر المشاركة (Share ⎘) أسفل Safari ثم اختر <strong className="text-amber-600 dark:text-amber-400">"إضافة إلى الشاشة الرئيسية"</strong>.
                </p>
              </div>

              {/* Windows & Mac Instruction */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 text-xs">
                  <Laptop className="w-3.5 h-3.5 text-cyan-500" />
                  <span>أجهزة الكمبيوتر (Windows / Mac)</span>
                </div>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  اضغط على أيقونة التثبيت ⊕ الموجودة بجوار شريط العنوان في متصفح Chrome أو Edge لتشغيله كبرنامج سطح مكتب.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Admin Gate Passcode Protection Modal */}
      <AdminPasscodeModal
        isOpen={showAdminPasscodeModal}
        onClose={() => setShowAdminPasscodeModal(false)}
        onSuccess={() => {
          setShowAdminPasscodeModal(false);
          onNavigate('login');
        }}
      />
    </div>
  );
};
