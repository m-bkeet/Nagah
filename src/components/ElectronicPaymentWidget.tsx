import React, { useState } from 'react';
import {
  PhoneCall,
  Zap,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  DollarSign,
  Info,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import {
  getVodafoneCashUssdCode,
  getVodafoneCashTelUri,
  executeVodafoneCashPayment,
  getInstaPayDeepLinks,
  executeInstaPayPayment,
  getPaymentReceiptWhatsAppUrl,
  cleanEgyptianPhoneNumber
} from '../utils/paymentUtils';

interface ElectronicPaymentWidgetProps {
  vodafoneCashNumber?: string;
  instapayAddress?: string;
  studentName?: string;
  defaultAmount?: number;
  adminPhone?: string;
  showTitle?: boolean;
  className?: string;
}

export const ElectronicPaymentWidget: React.FC<ElectronicPaymentWidgetProps> = ({
  vodafoneCashNumber = '01001500686',
  instapayAddress = 'm_bkeet@instapay',
  studentName = '',
  defaultAmount = 0,
  adminPhone = '01001500686',
  showTitle = true,
  className = ''
}) => {
  const [amount, setAmount] = useState<number | ''>(defaultAmount > 0 ? defaultAmount : '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const numAmount = typeof amount === 'number' && amount > 0 ? amount : undefined;

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      }
    } catch (err) {
      console.warn('Failed to copy', err);
    }
  };

  const handleVodafoneClick = () => {
    executeVodafoneCashPayment(vodafoneCashNumber, numAmount);
    const ussd = getVodafoneCashUssdCode(vodafoneCashNumber, numAmount);
    setActiveNotice(`تم تحضير كود الدفع المباشر (${ussd}) على هاتفُك. اضغط "اتصال / موافق" في نافذة الهاتف واكتب الرقم السري للتأكيد!`);
  };

  const handleInstaPayClick = async () => {
    const res = await executeInstaPayPayment(instapayAddress, numAmount, studentName);
    setCopiedKey('instapay-direct');
    setTimeout(() => setCopiedKey(null), 3000);
    setActiveNotice(`تم نسخ عنوان انستا باي (${instapayAddress}) ${numAmount ? `والمبلغ (${numAmount} ج.م)` : ''} وجاري فتح تطبيق InstaPay...`);
  };

  const vodafoneUssd = getVodafoneCashUssdCode(vodafoneCashNumber, numAmount);
  const vodafoneTelUri = getVodafoneCashTelUri(vodafoneCashNumber, numAmount);
  const instapayDeep = getInstaPayDeepLinks(instapayAddress, numAmount);

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 shadow-xl space-y-4 text-right dir-rtl ${className}`}>
      
      {showTitle && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>بوابة السداد الإلكتروني المباشر</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  دفع فوري ⚡
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">حسابات المركز الرسمية - سداد مباشر بزر واحد بدون تعقيد</p>
            </div>
          </div>
        </div>
      )}

      {/* Amount Selector */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تحديد مبلغ الدفع المراد تحويله (ج.م)</span>
          </label>
          {defaultAmount > 0 && (
            <span className="text-[10px] font-bold text-indigo-400">
              المتبقي المطلوب: {defaultAmount} ج.م
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder={defaultAmount > 0 ? defaultAmount.toString() : 'أدخل المبلغ المطلوب (مثلاً: 250)'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 placeholder-slate-600 focus:border-amber-500 focus:outline-none text-right pl-12"
            />
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">ج.م</span>
          </div>

          {defaultAmount > 0 && (
            <button
              type="button"
              onClick={() => setAmount(defaultAmount)}
              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-all whitespace-nowrap"
            >
              كامل المبلغ ({defaultAmount})
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-slate-400">مبالغ سريعة:</span>
          {[100, 200, 300, 500].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                amount === val
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {val} ج.م
            </button>
          ))}
        </div>
      </div>

      {/* Payment Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* 1. VODAFONE CASH CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/40 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-rose-400" />
                <span>فودافون كاش Vodafone Cash</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono dir-ltr">{vodafoneCashNumber}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1 my-2">
              <span className="text-[10px] font-bold text-slate-400 block">كود الدفع السريع المباشر:</span>
              <code className="text-xs font-mono font-bold text-amber-400 block dir-ltr text-center bg-slate-900 py-1.5 px-2 rounded-lg border border-slate-800 select-all">
                {vodafoneUssd}
              </code>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 <strong className="text-slate-200">الدفع بضغطة زر:</strong> اضغط الزر الأحمر أدناه ليفتح هاتفك كود الدفع تلقائياً، اضغط موافق واكتب الرقم السري لمحفظتك!
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {/* Direct Dial Tel URI Link Button */}
            <a
              href={vodafoneTelUri}
              onClick={handleVodafoneClick}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 text-white animate-bounce" />
              <span>دفع فودافون كاش مباشر ({numAmount ? `${numAmount} ج.م` : 'كود *9*7*'})</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(vodafoneUssd, 'vodafone-code')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                {copiedKey === 'vodafone-code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم نسخ الكود!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-rose-400" />
                    <span>نسخ الكود (*9*7*)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopy(vodafoneCashNumber, 'vodafone-num')}
                className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                title="نسخ رقم المحفظة فقط"
              >
                {copiedKey === 'vodafone-num' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>الرقم</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. INSTAPAY CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 transition-all space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/40 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>انستا باي InstaPay</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono dir-ltr">{instapayAddress}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1 my-2">
              <span className="text-[10px] font-bold text-slate-400 block">عنوان InstaPay IPA المعتمد:</span>
              <code className="text-xs font-mono font-bold text-indigo-300 block dir-ltr text-center bg-slate-900 py-1.5 px-2 rounded-lg border border-slate-800 select-all">
                {instapayAddress}
              </code>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              ⚡ <strong className="text-slate-200">تحويل لحظي مباشر:</strong> النقر أدناه ينسخ العنوان {numAmount ? `والمبلغ (${numAmount} ج.م)` : ''} تلقائياً ويفتح تطبيق InstaPay على هاتفك مباشرة.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleInstaPayClick}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>فتح تطبيق InstaPay والدفع فوراً</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(instapayAddress, 'instapay-ipa')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                {copiedKey === 'instapay-ipa' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم نسخ العنوان!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>نسخ IPA Address</span>
                  </>
                )}
              </button>

              <a
                href={instapayDeep.webUri}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                title="رابط موقع انستا باي"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>الموقع</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Active Toast / Notice Banner */}
      {activeNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-white">{activeNotice}</p>
            <p className="text-[11px] text-emerald-300/80">بعد إتمام التحويل، يرجى إرسال إشعار للمركز أدناه لربط السند بحساب الطالب.</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNotice(null)}
            className="text-emerald-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* WhatsApp Confirmation Action */}
      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-bold">هل أتممت عملية التحويل؟ أرسل الإشعار للإدارة فوراً</span>
        </div>

        <a
          href={getPaymentReceiptWhatsAppUrl(
            adminPhone,
            studentName,
            numAmount || defaultAmount || 0,
            'فودافون كاش / InstaPay'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          <span>إرسال إشعار التحويل عبر واتساب 📲</span>
        </a>
      </div>

    </div>
  );
};
