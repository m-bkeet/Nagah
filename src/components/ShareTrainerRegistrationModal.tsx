import React, { useEffect, useState } from 'react';
import { X, Copy, CheckCircle2, Share2, QrCode, ExternalLink, ShieldCheck, Download, Sparkles, MessageCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { getPublicTrainerRegistrationUrl } from '../utils/urlHelper';

interface ShareTrainerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTrainerRegistrationModal: React.FC<ShareTrainerRegistrationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  const registrationUrl = getPublicTrainerRegistrationUrl();

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, registrationUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode-trainer-registration.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const whatsappMessage = encodeURIComponent(
    `🌟 *دعوة انضمام للمدربين - مركز النجاح* 🌟\n\n` +
    `نرحب بالمدربين والمعلمين المتميزين للانضمام إلى فريق العمل التدريبي.\n\n` +
    `🔗 *رابط تسجيل بيانات المدربين:*\n` +
    `${registrationUrl}\n\n` +
    `📝 *خطوات التسجيل:*\n` +
    `1. افتح الرابط أعلاه.\n` +
    `2. املأ بياناتك وتخصصك الدراسي.\n` +
    `3. اضغط تأكيد لإرسال طلب الانضمام وسيتم التواصل معك قريباً.\n\n` +
    `نتطلع للعمل معكم! ✨`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">مشاركة رابط تسجيل المدربين</h2>
              <p className="text-xs text-slate-400">رابط مباشر للمدربين لتسجيل بياناتهم كطلب انضمام للمركز</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature badge */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-200 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-emerald-300 mb-0.5">مفتوح ومباشر 100% للجميع:</span>
            يمكن لأي مدرب فتح هذا الرابط من هاتفه وملء النموذج مباشرة، لتصل بياناته إليك في شاشة المدربين كطلب جديد.
          </div>
        </div>

        {/* URL Box with Copy Button */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">رابط تسجيل المدربين:</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl p-2 pl-3">
            <input
              type="text"
              readOnly
              value={registrationUrl}
              className="bg-transparent text-amber-300 text-xs font-mono font-bold flex-1 outline-none select-all overflow-ellipsis"
              dir="ltr"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 object-contain" />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
            )}
          </div>
          <div className="space-y-2 text-center sm:text-right flex-1">
            <h3 className="text-xs font-black text-slate-200">رمز الاستجابة السريع (QR Code)</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              امسح الكود بكاميرا الموبايل لفتح الفورم فوراً، أو قم بتحميل الصورة لنشرها.
            </p>
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تحميل صورة الباركود</span>
            </button>
          </div>
        </div>

        {/* Actions (WhatsApp & Open in New Tab) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال عبر واتساب للمدربين</span>
          </a>
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>فتح وتجربة النموذج الآن</span>
          </a>
        </div>
      </div>
    </div>
  );
};
