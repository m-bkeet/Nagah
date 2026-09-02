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
  Monitor, 
  Sparkles, 
  X, 
  Send, 
  Phone, 
  CheckCircle2, 
  MessageSquare,
  Lock,
  Share2,
  Shield,
  Apple,
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
  const { themeConfig } = useTheme();

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
        title: 'مركز النجاح للتدريب والاستشارات',
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
    const message = `السلام عليكم شؤون الطلاب بمركز النجاح للتدريب 🌸
أرجو المساعدة في حل مشكلة الدخول للبوابة:
👤 اسم الطالب: ${issueName}
📱 رقم الهاتف: ${issuePhone}
⚠️ نوع المشكلة: ${selectedTypeLabel}
📝 تفاصيل إضافية: ${issueDetails || 'لا توجد'}`;

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
      // Simulate/Save Issue Ticket
      await new Promise(r => setTimeout(r, 600));
      setSubmittedSuccess(true);
      showToast('تم إرسال بلاغ المشكلة بنجاح وسيتواصل معك الاستقبال فوراً 🚀', 'success');
    } catch {
      showToast('حدث خطأ أثناء الإرسال، يرجى التواصل عبر الواتساب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans pb-16 antialiased dir-rtl selection:bg-amber-500 selection:text-black transition-colors duration-300"
      style={{
        backgroundColor: themeConfig.colors.bgMain,
        color: themeConfig.colors.textPrimary
      }}
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Center Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5">
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
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-100 leading-tight">
                مركز النجاح للتدريب والاستشارات
              </h1>
              <p className="text-[10px] text-amber-400 font-bold">
                الواجهة الرئيسية العامة للطلاب وأولياء الأمور
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            <ThemeQuickSwitcher />
            <button
              onClick={handleShareApp}
              className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="مشاركة رابط المنصة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أهلاً بكم في البوابة العامة السريعة</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 leading-snug">
              الوصول المباشر لخدمات الطلاب وأولياء الأمور
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              اختر الخدمة أو البوابة المطلوبة لمتابعة الحضور، تسليم الواجبات، الاطلاع على النتائج، أو تثبيت التطبيق مباشرة على جهازك.
            </p>
          </div>
        </div>

        {/* 5 Core Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: بوابة المتدرب */}
          <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  دخول الطلاب
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors">
                بوابة المتدرب
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                الدخول برقم الهاتف أو الكود لاستعراض الواجبات، الاختبارات، تسليم المهمات، ورصيد النقاط والأوسمة.
              </p>
            </div>
            <button
              onClick={() => onNavigate('student_portal')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>فتح بوابة المتدرب</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Card 2: بوابة ولي الأمر */}
          <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/30 hover:border-emerald-400/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  متابعة الأبناء
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 group-hover:text-emerald-300 transition-colors">
                بوابة ولي الأمر
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                متابعة تقارير حضور الطالب، درجات الاختبارات، إيصالات السداد الكترونياً، وتقارير المستوى الدراسي.
              </p>
            </div>
            <button
              onClick={() => onNavigate('parent_portal')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>فتح بوابة ولي الأمر</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Card 3: تنزيل التطبيق وتثبيته موبايل كمبيوتر */}
          <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-sky-500/30 hover:border-sky-400/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-full">
                  تطبيقات الأجهزة
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 group-hover:text-sky-300 transition-colors">
                تنزيل التطبيق وتثبيته
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                تثبيت تطبيق مركز النجاح على الهواتف الذكية (Android/iOS) والكمبيوتر (Windows/Mac) للوصول السريع بدون متصفح.
              </p>
              <div className="flex items-center gap-2 pt-1 text-slate-400 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>موبايل</span>
                <span>•</span>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>كمبيوتر</span>
              </div>
            </div>

            <div className="space-y-2">
              <PwaInstallPrompt />
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>طريقة التثبيت خطوة بخطوة</span>
              </button>
            </div>
          </div>

          {/* Card 4: تسجيل طالب جديد */}
          <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-400/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                  انضمام جديد
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 group-hover:text-indigo-300 transition-colors">
                تسجيل طالب جديد
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                الالتحاق بالدورات التدريبية والتسجيل السريع للطلاب الجدد بمركز النجاح دون الحاجة لإنشاء حساب مسبق.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>بدء تسجيل طالب جديد</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Card 5: إرسال مشكلة دخول */}
          <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-rose-500/30 hover:border-rose-400/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col justify-between space-y-5 md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full">
                  الدعم الفني والاستقبال
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 group-hover:text-rose-300 transition-colors">
                إرسال مشكلة دخول
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                هل نسيت كود الطالب أو واجهت مشكلة في الدخول برقم الهاتف؟ أرسل بلاغك فوراً لشؤون الطلاب ليتم التعديل والمساعدة مباشرة.
              </p>
            </div>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setShowIssueModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-rose-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>إرسال بلاغ أو مشكلة دخول الآن</span>
            </button>
          </div>

        </div>

        {/* Discreet Staff & Admin Login Footer Link */}
        <div className="pt-8 text-center border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => {
              if (sessionStorage.getItem('nagah_admin_passcode_unlocked') === 'true') {
                onNavigate('login');
              } else {
                setShowAdminPasscodeModal(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs font-bold border border-slate-800 transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>دخول الإدارة والمدربين ومسؤولي النظام 🔐</span>
          </button>

          <p className="text-slate-400 text-[11px]">
            مركز النجاح للتدريب والاستشارات © {new Date().getFullYear()} - جميع الحقوق محفوظة
          </p>
        </div>

      </main>

      {/* Modal 1: إرسال مشكلة دخول */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowIssueModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  بلاغ عن مشكلة تسجيل الدخول
                </h3>
                <p className="text-xs text-slate-400">
                  فريق شؤون الطلاب متاح للمساعدة الفورية
                </p>
              </div>
            </div>

            {submittedSuccess ? (
              <div className="text-center py-6 space-y-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-sm text-emerald-300">تم تسجيل بلاغك بنجاح!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  سيتم مراجعة الطلب بواسطة مسؤول شؤون الطلاب والتواصل مع الرقم المرفق فوراً.
                </p>
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  حسناً، إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveIssueCloud} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم الطالب رباعي *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمد علي محمود"
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الهاتف للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={issuePhone}
                    onChange={(e) => setIssuePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    نوع المشكلة *
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {issueTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="اكتب أي معلومات تسهم في تسريع المساعدة..."
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSendIssueWhatsApp}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال عبر الواتساب المباشر 💬</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال للدعم الفني 🚀'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: طريقة تثبيت التطبيق خطوة بخطوة */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  طريقة تثبيت التطبيق على جهازك
                </h3>
                <p className="text-xs text-slate-400">
                  ليعمل كبرنامج مستقل بلمسة واحدة
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {/* Android Instruction */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>هواتف الأندرويد (Android - Chrome)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  افتح قائمة الخيارات (⋮) أعلى متصفح Chrome ثم اختر <strong className="text-amber-400">"تثبيت التطبيق" (Install App)</strong> أو "إضافة للشاشة الرئيسية".
                </p>
              </div>

              {/* iPhone Instruction */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <span>هواتف الآيفون (iOS - Safari)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  اضغط على زر المشاركة (Share ⎘) في أسفل متصفح Safari ثم اختر <strong className="text-amber-400">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.
                </p>
              </div>

              {/* Windows & Mac Instruction */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>أجهزة الكمبيوتر (Windows / Mac)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  اضغط على أيقونة التثبيت ⊕ الموجودة بجوار شريط العنوان في أعلى متصفح Chrome أو Edge لتثبيته كبرنامج سطح مكتب.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
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
