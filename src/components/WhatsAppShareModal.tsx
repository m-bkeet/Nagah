import React, { useState, useEffect } from 'react';
import { 
  Share2, X, Download, Printer, CheckCircle2, ShieldCheck, Zap, QrCode, Copy, ExternalLink, MessageCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { getPublicRegistrationUrl } from '../utils/urlHelper';

interface ShareModalProps {
  activeTrainee?: any;
  isOpen?: boolean;
  onClose: () => void;
  showToast?: (msg: string, type?: string) => void;
}

export const WhatsAppShareModal: React.FC<ShareModalProps> = ({ 
  activeTrainee, 
  isOpen = true, 
  onClose, 
  showToast = () => {} 
}) => {
  const [tab, setTab] = useState<'student_card' | 'public_link'>(activeTrainee ? 'student_card' : 'public_link');
  const [cardType, setCardType] = useState<'congrats' | 'receipt' | 'certificate' | 'report' | 'star'>('congrats');
  const [recipientType, setRecipientType] = useState<'parent' | 'student' | 'group'>('parent');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const registrationUrl = getPublicRegistrationUrl();

  useEffect(() => {
    if (isOpen) {
      setTab(activeTrainee ? 'student_card' : 'public_link');
    }
  }, [isOpen, activeTrainee]);

  useEffect(() => {
    if (tab === 'public_link') {
      QRCode.toDataURL(registrationUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR', err));
    }
  }, [tab, registrationUrl]);

  if (!isOpen) return null;

  const targetPhone = activeTrainee 
    ? (recipientType === 'parent' ? (activeTrainee.parentPhone || activeTrainee.phone) : (activeTrainee.phone || ''))
    : '';

  const getCardTitle = () => {
    switch(cardType) {
      case 'congrats': return '🌟 كارت تهنئة وترحيب رسمي';
      case 'receipt': return '🧾 إيصال سداد رسوم التدريب';
      case 'certificate': return '📜 شهادة إتمام الدورة المعتمدة';
      case 'report': return '📊 تقرير الأداء التدريبي';
      case 'star': return '⭐ نجم المحاضرة وأوسمة التميز (المركز الأول)';
    }
  };

  const getDefaultMsg = () => {
    if (!activeTrainee) return '';
    switch(cardType) {
      case 'congrats':
        return `🎓 مركز النجاح للتدريب والاستشارات يهنئ الطالب/ة ${activeTrainee.fullName} بمناسبة انضمامه/ا للدورة المعتمدة. نتمنى لك دوام التوفيق والنجاح والتألق! 🌟`;
      case 'receipt':
        return `🧾 مركز النجاح للتدريب - إيصال سداد رسوم:\nاسم المتدرب: ${activeTrainee.fullName}\nالكود: ${activeTrainee.code}\nالمبلغ المسدد: ${activeTrainee.initialPayment || 0} ج.م\nالمتبقي: ${Math.max(0, (activeTrainee.feeAmount || 0) - (activeTrainee.discountAmount || 0) - (activeTrainee.initialPayment || 0))} ج.م\nشكراً لثقتكم بنا! 🏛️`;
      case 'certificate':
        return `📜 مبروك! حصل المتدرب/ة ${activeTrainee.fullName} (كود: ${activeTrainee.code}) على شهادة إتمام الدورة التدريبية بنجاح من مركز النجاح للتدريب والاستشارات. نسأل الله لك مزيداً من التفوق! 🏆`;
      case 'report':
        return `📊 تقرير الأداء الأسبوعي/الشهري لمركز النجاح للتدريب:\nاسم المتدرب: ${activeTrainee.fullName}\nمجموع النقاط والنجوم: ${activeTrainee.points || 0} نقطة\nالحالة: منتظم ومتميز جداً في التطبيق العملي. 🚀`;
      case 'star':
        return `⭐ تهنئة خاصة من مركز النجاح للتدريب: حصل المتدرب المتميز ${activeTrainee.fullName} على المركز الأول / نجم المحاضرة بناءً على سرعة ودقة التفاعل العملي! 🏆🎉`;
    }
  };

  const publicWhatsappMsg = `🌟 *رابط التسجيل في دورات مركز النجاح للتدريب والاستشارات* 🌟\n\n` +
    `نرحب بجميع الطلاب وأولياء الأمور لتسجيل البيانات والالتحاق بالدورات التدريبية.\n\n` +
    `🔗 *رابط التسجيل المباشر (بدون تسجيل دخول أو إيميل):*\n` +
    `${registrationUrl}\n\n` +
    `📝 *خطوات التسجيل:*\n` +
    `1. افتح الرابط أعلاه.\n` +
    `2. املأ الاسم ورقم الهاتف والصف الدراسي.\n` +
    `3. اضغط (تأكيد التسجيل) لاستلام بطاقة المتدرب الرسمية وكود الدخول فوراً.\n\n` +
    `نتمنى لجميع طلابنا دوام التوفيق والنجاح! ✨`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    showToast('تم نسخ رابط التسجيل بنجاح! 📋', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode-student-registration.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('تم تحميل رمز QR لروابط التسجيل بنجاح! 📷', 'success');
  };

  const handleDownloadJpg = async () => {
    const element = document.getElementById('branded-card-preview');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#090d16' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${cardType}_${activeTrainee?.code || 'trainee'}.jpg`;
      link.click();
      showToast('تم تحميل المستند/الإيصال بصيغة JPG بنجاح! 🖼️', 'success');
    } catch (err) {
      showToast('فشل تحميل الصورة', 'error');
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('branded-card-preview');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#090d16' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <title>مستند رسمي - ${activeTrainee?.fullName || 'مركز النجاح'}</title>
            <style>
              body { background: #fff; color: #000; font-family: Tahoma, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
              .print-btn { margin-top: 20px; padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; }
              @media print { .print-btn { display: none; } }
            </style>
          </head>
          <body>
            <h3 style="margin-bottom: 15px; color: #1e293b;">مركز النجاح للتدريب والاستشارات - المستند الرسمي</h3>
            <img src="${imgData}" />
            <button class="print-btn" onclick="window.print()">طباعة أو حفظ بصيغة PDF 📄</button>
            <script>
              setTimeout(() => { window.print(); }, 500);
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast('تم تجهيز المستند للطباعة والحفظ بصيغة PDF! 📄', 'success');
      }
    } catch (err) {
      showToast('فشل تجهيز ملف PDF', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] backdrop-blur-xl p-4 md:p-6 overflow-y-auto" onClick={onClose} dir="rtl">
      <div className="bg-slate-900 border border-slate-700/60 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
        
        {/* Top Header & Tab Switcher */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">مركز مشاركة الروابط والمستندات الرسمية</h2>
              <p className="text-xs text-slate-400">واتساب، تصدير الصور، والـ QR الخاص بالمركز</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTrainee && (
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTab('student_card')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${tab === 'student_card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  كارت المتدرب ({activeTrainee?.fullName ? activeTrainee.fullName.split(' ')[0] : ''})
                </button>
                <button
                  onClick={() => setTab('public_link')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${tab === 'public_link' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  رابط التسجيل العام (QR)
                </button>
              </div>
            )}

            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Student Card (If activeTrainee) */}
        {tab === 'student_card' && activeTrainee && (
          <div className="flex flex-col md:flex-row w-full">
            {/* Left Side: Controls & Sharing Options */}
            <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">نوع المستند / الكارت</label>
                  <select 
                    value={cardType} 
                    onChange={e => setCardType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-xs"
                  >
                    <option value="congrats">🌟 كارت التهنئة (انضمام جديد)</option>
                    <option value="receipt">🧾 إيصال سداد (ماليات)</option>
                    <option value="star">⭐ وسام التميز (نجم المحاضرة)</option>
                    <option value="report">📊 تقرير تفوق (متابعة دراسية)</option>
                    <option value="certificate">📜 شهادة إتمام الدورة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">إرسال إلى (WhatsApp)</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button 
                      onClick={() => setRecipientType('parent')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${recipientType === 'parent' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      ولي الأمر
                    </button>
                    <button 
                      onClick={() => setRecipientType('student')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${recipientType === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      الطالب مباشرة
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5">
                  <label className="block text-xs font-bold text-emerald-500/80 mb-1.5">نص رسالة الواتساب الجاهزة</label>
                  <textarea 
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 min-h-[100px] outline-none"
                    defaultValue={getDefaultMsg()}
                  />
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <a 
                    href={`https://wa.me/${targetPhone?.startsWith('0') ? '2' + targetPhone : targetPhone}?text=${encodeURIComponent(getDefaultMsg())}`}
                    target="_blank" rel="noopener noreferrer"
                    className="col-span-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    إرسال للواتساب مباشرة
                  </a>
                  <button 
                    onClick={handleDownloadJpg}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    تصدير JPG
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    طباعة / PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: The Branded Card Preview */}
            <div className="w-full md:w-[55%] bg-slate-950 p-6 flex flex-col items-center justify-center border-r border-slate-800 relative overflow-hidden">
              <div 
                id="branded-card-preview"
                className="w-full max-w-md bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#020617] rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden my-4"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                      <span className="font-black text-white text-lg">ن</span>
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm">مركز النجاح للتدريب</h3>
                      <span className="text-[9px] text-slate-400 font-bold tracking-wider">TRAINING CENTER</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-400 opacity-80" />
                </div>

                <div className="text-center space-y-4 relative z-10 my-6">
                  <div className="inline-block px-3 py-1 bg-slate-800/80 border border-slate-700 text-indigo-300 rounded-full text-[11px] font-bold">
                    {getCardTitle()}
                  </div>
                  
                  <h1 className="text-2xl font-black text-white leading-tight">
                    {activeTrainee.fullName}
                  </h1>
                  
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <span className="block text-[9px] text-slate-500">كود الطالب</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">{activeTrainee.code || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <span className="block text-[9px] text-slate-500">المرحلة الدراسية</span>
                      <span className="text-xs font-bold text-slate-200">{activeTrainee.level || 'عام'}</span>
                    </div>
                  </div>

                  {cardType === 'receipt' && (
                    <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-right space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-xs text-slate-400">المبلغ المسدد</span>
                        <span className="text-sm font-black text-emerald-400">{activeTrainee.initialPayment || 0} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">الرصيد المتبقي</span>
                        <span className="text-xs font-bold text-rose-400">{Math.max(0, (activeTrainee.feeAmount || 0) - (activeTrainee.discountAmount || 0) - (activeTrainee.initialPayment || 0))} ج.م</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">مستند رسمي معتمد</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Public Registration Link & QR */}
        {tab === 'public_link' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200 space-y-1">
                <p className="font-bold text-emerald-300">رابط التسجيل المباشر العام للطلاب الجدد وأولياء الأمور</p>
                <p className="text-slate-400">يمكن نشر هذا الرابط على منصات التواصل الاجتماعي أو طباعته كـ QR Code للاستقبال ليتيح للطلاب التسجيل الفوري بدون حساب.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Column: Link Box & WhatsApp Share */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">رابط التسجيل العام:</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl p-2 pl-3">
                    <input
                      type="text"
                      readOnly
                      value={registrationUrl}
                      className="w-full bg-transparent text-xs text-indigo-300 font-mono focus:outline-none px-2"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">نص المنشور الجاهز للواتساب والمجموعات:</span>
                  <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-sans max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {decodeURIComponent(publicWhatsappMsg)}
                  </div>
                  <a
                    href={`https://wa.me/?text=${publicWhatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>مشاركة عبر واتساب المباشر 💬</span>
                  </a>
                </div>
              </div>

              {/* Right Column: QR Code Display */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>رمز QR Code الخاص بالتسجيل</span>
                </span>

                {qrDataUrl ? (
                  <div className="bg-white p-3 rounded-2xl shadow-xl">
                    <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain" />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-500">
                    جاري التجهيز...
                  </div>
                )}

                <button
                  onClick={handleDownloadQr}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل صورة الـ QR للطباعة</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Export alias for backward compatibility
export const ShareRegistrationModal = WhatsAppShareModal;
