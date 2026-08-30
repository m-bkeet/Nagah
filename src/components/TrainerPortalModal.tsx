import React, { useState } from 'react';
import {
  X,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Download,
  QrCode,
  GraduationCap,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Trainer } from '../types';
import { getPublicTrainerPortalUrl } from '../utils/urlHelper';

interface TrainerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer | null;
  trainersList?: Trainer[];
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const TrainerPortalModal: React.FC<TrainerPortalModalProps> = ({
  isOpen,
  onClose,
  trainer,
  trainersList = [],
  showToast
}) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainer?.id || (trainersList[0]?.id || ''));
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'install_mobile' | 'install_pc'>('link');

  if (!isOpen) return null;

  const currentTrainer = trainersList.find(t => t.id === selectedTrainerId) || trainer || trainersList[0];

  // Base portal URL (Public / No Google Login required)
  const portalUrl = getPublicTrainerPortalUrl(currentTrainer?.id);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    showToast('تم نسخ رابط بوابة المدرب إلى الحافظة 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPortal = () => {
    window.open(portalUrl, '_blank');
  };

  const handleSendWhatsApp = () => {
    if (!currentTrainer) return;
    const cleanPhone = (currentTrainer.phone || '').replace(/\D/g, '');
    let targetPhone = cleanPhone;
    if (targetPhone.startsWith('01')) {
      targetPhone = '2' + targetPhone;
    }

    const message = `مرحباً أستاذ ${currentTrainer.name} 👨‍🏫
يسعدنا إرسال رابط بوابة المدرب الخاصة بك في مركز النجاح للتدريب والاستشارات:

🔗 ${portalUrl}

من خلال البوابة يمكنك:
✅ تسجيل حضور وغياب المتدربين في محاضراتك بلمسة واحدة
✅ مراجعة وتقييم واجبات الطلاب ورصد النقاط
✅ رصد درجات الاختبارات والتكليفات
✅ متابعة رصيدك المالي ونسبتك المحسوبة أولاً بأول
✅ يمكنك تثبيت البوابة كتطبيق مباشر على الموبايل والكمبيوتر!

بالتوفيق دائماً 🌟`;

    const encoded = encodeURIComponent(message);
    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                بوابة المدرب الذكية
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  تطبيق الويب والموبايل
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل الحضور، تقييم الواجبات، رصد الدرجات، ومتابعة المستحقات المالية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trainer Selector (if multiple) */}
        {trainersList.length > 1 && (
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              اختر المدرب لإنشاء رابطه المخصص:
            </label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
            >
              {trainersList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty || 'مدرب'}) - {t.phone}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'link'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>الرابط والوصول السريع</span>
          </button>
          <button
            onClick={() => setActiveTab('install_mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'install_mobile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>تنزيل على الموبايل (Android/iPhone)</span>
          </button>
          <button
            onClick={() => setActiveTab('install_pc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'install_pc'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>تثبيت على الكمبيوتر (Windows/Mac)</span>
          </button>
        </div>

        {/* TAB 1: Link and Quick Actions */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleOpenPortal}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <ExternalLink className="w-6 h-6" />
                <span>فتح بوابة المدرب الآن</span>
                <span className="text-[10px] text-indigo-200 font-normal">عرض شاشة المدرب</span>
              </button>

              <button
                onClick={handleSendWhatsApp}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
                <span>إرسال الرابط عبر واتساب</span>
                <span className="text-[10px] text-emerald-200 font-normal">
                  {currentTrainer?.phone ? `إلى ${currentTrainer.phone}` : 'مشاركة واتساب'}
                </span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs border border-slate-700 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6 text-amber-400" />}
                <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ رابط الدخول'}</span>
                <span className="text-[10px] text-slate-400 font-normal">لإرساله للمدرب بأي وسيلة</span>
              </button>
            </div>

            {/* Direct Link Box */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">رابط البوابة المباشر:</span>
                <span className="text-[11px] text-indigo-400">لا يحتاج لكلمة مرور معقدة</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-xs text-amber-300 break-all select-all">
                <span className="flex-1">{portalUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                  title="نسخ"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Features preview badge */}
            <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>ماذا يستطيع المدرب فعله من البوابة؟</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> رصد حضور وغياب المجموعات فورياً
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> مراجعة وتصحيح واجبات الطلاب ومنح النقاط
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> إدخال وتعديل درجات الاختبارات
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span> متابعة كشف الحساب والمستحقات المالية
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Install Mobile */}
        {activeTab === 'install_mobile' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                خطوات تثبيت تطبيق بوابة المدرب على الموبايل
              </h3>

              <div className="space-y-3 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <strong className="text-white block font-bold">📱 لهواتف الأندرويد (Google Chrome):</strong>
                  <p>1. افتح رابط بوابة المدرب في متصفح Chrome.</p>
                  <p>2. اضغط على زر القائمة (الثلاث نقاط الرأسية أعلى اليسار).</p>
                  <p>3. اختر <span className="text-amber-400 font-bold">"تثبيت التطبيق" (Install app)</span> أو <span className="text-amber-400 font-bold">"إضافة إلى الشاشة الرئيسية"</span>.</p>
                  <p>4. سيظهر رمز التطبيق على شاشة هاتفك الرئيسية ويعمل فورياً بدون الحاجة لفتح المتصفح!</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <strong className="text-white block font-bold">🍏 لهواتف الآيفون والآيباد (Apple Safari):</strong>
                  <p>1. افتح رابط بوابة المدرب في متصفح Safari.</p>
                  <p>2. اضغط على زر <span className="text-sky-400 font-bold">المشاركة (Share 📤)</span> في أسفل الشاشة.</p>
                  <p>3. مرر لأسفل واختر <span className="text-amber-400 font-bold">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen ➕)</span>.</p>
                  <p>4. اضغط "إضافة (Add)" في أعلى اليمين. سيصبح تطبيقاً كاملاً على الشاشة الرئيسية!</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال التعليمات والرابط للمدرب على واتساب</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Install PC */}
        {activeTab === 'install_pc' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                تثبيت بوابة المدرب كتطبيق سطح مكتب على الكمبيوتر (Windows / Mac)
              </h3>

              <div className="space-y-3 text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <strong className="text-white block font-bold">🖥️ عبر Google Chrome أو Microsoft Edge:</strong>
                  <p>1. افتح رابط بوابة المدرب في المتصفح.</p>
                  <p>2. ستلاحظ ظهور أيقونة كمبيوتر صغيرة أو رمز تنزيل <span className="text-amber-400 font-bold">(➕ تثبيت)</span> في أقصى يسار شريط عنوان الويب (Address Bar).</p>
                  <p>3. اضغط عليها واختر <span className="text-indigo-400 font-bold">"تثبيت التطبيق" (Install)</span>.</p>
                  <p>4. ستفتح البوابة في نافذة مستقلة أنيقة بدون شريط متصفح مع اختصار مباشر على سطح المكتب وقائمة Start!</p>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">يعمل بكفاءة وسرعة فائقة بدون استهلاك موارد</span>
                <button
                  onClick={handleOpenPortal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح الرابط للتثبيت الآن</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>اتصال مشفر وآمن ومربوط مباشرة مع قاعدة بيانات المركز</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
