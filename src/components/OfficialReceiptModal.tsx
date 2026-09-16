import React, { useRef } from 'react';
import { X, Printer, Download, Share2, CheckCircle2, ShieldCheck, Building2, Calendar, CreditCard, User, Receipt, FileText, Phone, Clock, HardDrive, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Payment } from '../types';
import { numberToArabicWords } from '../utils/numberToArabicWords';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: (Payment & {
    time?: string;
    parentPhone?: string;
    traineePhone?: string;
    groupName?: string;
    previousDebt?: number;
    discountAmount?: number;
    isExempt?: boolean;
    nextDueDate?: string;
    paidMonths?: string[];
    gdriveSyncStatus?: string;
  }) | null;
  studentName?: string;
  studentCode?: string;
  traineeName?: string;
  traineeCode?: string;
  trainerName?: string;
  trainerCode?: string;
  courseName?: string;
  branchName?: string;
  parentPhone?: string;
  traineePhone?: string;
  groupName?: string;
  previousDebt?: number;
  discountAmount?: number;
  isExempt?: boolean;
  nextDueDate?: string;
  paidMonths?: string[];
  centerSettings?: {
    name?: string;
    phone?: string;
    logoUrl?: string;
    vodafoneCash?: string;
  };
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  studentName,
  studentCode,
  traineeName,
  traineeCode,
  trainerName,
  trainerCode,
  courseName,
  branchName,
  parentPhone,
  traineePhone,
  groupName,
  previousDebt,
  discountAmount,
  isExempt,
  nextDueDate,
  paidMonths,
  centerSettings
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isThermalMode, setIsThermalMode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen || !payment) return null;

  const displayName = payment.traineeName || studentName || traineeName || 'اسم الطالب غير محدد';
  const displayCode = payment.traineeCode || studentCode || traineeCode || '—';
  const displayTrainerCode = payment.trainerCode || trainerCode || '—';
  const displayTrainerName = payment.trainerName || trainerName || '';
  const displayCourse = payment.courseName || courseName || 'الدورة التدريبية';
  const displayBranch = branchName || 'الفرع الرئيسي';
  const displayGroupName = payment.groupName || groupName || '';
  const amountWords = numberToArabicWords(payment.amount);
  const targetMonthStr = payment.targetMonth || 'الشهر الحالي';
  const displayNextDueDate = payment.nextDueDate || nextDueDate;
  const displayPreviousDebt = payment.previousDebt !== undefined ? payment.previousDebt : previousDebt;
  const displayDiscount = payment.discountAmount !== undefined ? payment.discountAmount : discountAmount;
  const displayTime = payment.time || new Date(payment.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Resolve target phone for WhatsApp
  const rawPhone = payment.parentPhone || parentPhone || payment.traineePhone || traineePhone || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  let formattedWhatsAppPhone = '';
  if (cleanPhone) {
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      formattedWhatsAppPhone = '2' + cleanPhone;
    } else if (cleanPhone.startsWith('201') && cleanPhone.length === 12) {
      formattedWhatsAppPhone = cleanPhone;
    } else {
      formattedWhatsAppPhone = cleanPhone;
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'vodafone_cash': return 'فودافون كاش (Vodafone Cash)';
      case 'instapay': return 'انستا باي (InstaPay)';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'visa': return 'بطاقة إلكترونية / فيزا';
      case 'cash': default: return 'نقداً الخزينة';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `إيصال_سداد_${displayCode}_${payment.receiptNumber || 'REC'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to capture receipt image:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const verifyUrl = `${window.location.origin}/?verifyReceipt=${payment.receiptNumber || payment.id}&code=${displayCode}`;
    const text = `🏛️ *مركز النجاح للتدريب والتكنولوجيا*\n` +
      `🧾 *سند قبض وإيصال سداد رسمي معتمد*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *رقم السند:* ${payment.receiptNumber || payment.id}\n` +
      `👤 *الطالب:* ${displayName} (${displayCode})\n` +
      (displayGroupName ? `👥 *المجموعة:* ${displayGroupName}\n` : '') +
      `📚 *الدورة:* ${displayCourse}\n` +
      `💰 *المبلغ المقبوض:* ${payment.amount} ج.م (${amountWords})\n` +
      `📅 *عن فترة/شهر:* ${targetMonthStr}\n` +
      (displayDiscount && displayDiscount > 0 ? `🏷️ *الخصم المطبق:* ${displayDiscount} ج.م\n` : '') +
      (displayNextDueDate ? `🟢 *مسدد حتى تاريخ:* ${displayNextDueDate}\n` : '') +
      (displayPreviousDebt && displayPreviousDebt > 0 ? `⚠️ *المديونية المتبقية:* ${displayPreviousDebt} ج.م\n` : `✅ *حالة المديونية:* لا توجد مديونية سابقة\n`) +
      `💳 *طريقة السداد:* ${getMethodLabel(payment.paymentMethod)}\n` +
      `📆 *تاريخ ووقت التحصيل:* ${payment.date} - ${displayTime}\n` +
      `🛡️ *حالة السند:* معتمد وموثق بالسحابة والخزينة المركزية\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔍 *رابط التحقق الإلكتروني المباشر:*\n${verifyUrl}\n\n` +
      `📁 *ملاحظة:* تم حفظ السند وأرشفته إلكترونياً على سحابة المركز.\n` +
      `شكراً لثقتكم بنا! 🌟`;

    let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (formattedWhatsAppPhone) {
      url = `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleCopyVerifyLink = () => {
    const verifyUrl = `${window.location.origin}/?verifyReceipt=${payment.receiptNumber || payment.id}&code=${displayCode}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:w-full">
        
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-xs">سند قبض مالي معتمد</span>
            
            {/* Mode Switcher */}
            <button
              onClick={() => setIsThermalMode(!isThermalMode)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                isThermalMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isThermalMode ? '🖨️ نمط POS 80mm' : '📄 النمط القياسي A4/A5'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
              title="طباعة الإيصال"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 transition-all"
              title="تنزيل كصورة عالية الدقة"
            >
              <Download className="w-3.5 h-3.5" />
              <span>حفظ صورة</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              title={formattedWhatsAppPhone ? `إرسال واتساب للرقم ${formattedWhatsAppPhone}` : 'مشاركة عبر واتساب'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>واتساب {formattedWhatsAppPhone ? `📱` : ''}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recipient Target Phone Ribbon if available */}
        {rawPhone && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300 print:hidden">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>رقم ولي الأمر / المسجل للواتساب:</span>
              <span className="font-mono font-bold text-white dir-ltr">{rawPhone}</span>
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold transition-all"
            >
              إرسال مباشر بنقرة واحدة ⚡
            </button>
          </div>
        )}

        {/* PRINTABLE RECEIPT CARD BODY */}
        <div ref={receiptRef} className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-5 bg-slate-900 text-slate-100 print:bg-white print:text-slate-900 ${isThermalMode ? 'max-w-[320px] mx-auto text-xs space-y-3 font-mono print:w-[80mm]' : ''}`}>
          {isThermalMode ? (
            /* POS 80mm Thermal Receipt Layout */
            <div className="text-center space-y-2 border-b border-dashed border-slate-700 pb-3 print:border-black">
              <div className="font-black text-sm text-white print:text-black">{centerSettings?.name || 'مركز النجاح للتدريب والتكنولوجيا'}</div>
              <p className="text-[10px] text-slate-400 print:text-black">فرع {displayBranch} • ت: {centerSettings?.phone || '01000000000'}</p>
              <div className="py-1 bg-amber-500/20 text-amber-300 font-bold text-[11px] rounded print:bg-slate-200 print:text-black">
                إيصال سداد مالي # {payment.receiptNumber || payment.id}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dir-ltr px-1">
                <span>{payment.date}</span>
                <span>{displayTime}</span>
              </div>

              <div className="text-right space-y-1 pt-2 border-t border-dashed border-slate-700 print:border-black">
                <div className="flex justify-between font-bold">
                  <span>الطالب:</span>
                  <span className="text-amber-300 print:text-black">{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span>كود الطالب:</span>
                  <span className="font-mono">{displayCode}</span>
                </div>
                {displayGroupName && (
                  <div className="flex justify-between">
                    <span>المجموعة:</span>
                    <span>{displayGroupName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الدورة:</span>
                  <span>{displayCourse}</span>
                </div>
                <div className="flex justify-between">
                  <span>الشهر/الفترة:</span>
                  <span>{targetMonthStr}</span>
                </div>
                {displayNextDueDate && (
                  <div className="flex justify-between text-emerald-400 print:text-black font-bold">
                    <span>مسدد حتى:</span>
                    <span className="dir-ltr">{displayNextDueDate}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-emerald-400 print:text-black pt-1 border-t border-slate-700">
                  <span>المبلغ المسدد:</span>
                  <span>{payment.amount} EGP</span>
                </div>
                <div className="text-[9px] text-slate-400 italic pt-0.5">({amountWords})</div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-700 print:border-black text-[9px] text-slate-400">
                <p>طريقة الدفع: {getMethodLabel(payment.paymentMethod)}</p>
                <p className="font-bold text-emerald-400 print:text-black mt-1">حالة الإيصال: معتمد ومسدد بالكامل ✅</p>
                <div className="mt-2 flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/?verifyReceipt=${payment.receiptNumber || payment.id}&code=${displayCode}`)}`}
                    alt="QR Verification"
                    className="w-16 h-16 bg-white p-1 rounded shadow"
                  />
                </div>
                <p className="mt-1 text-[8px]">امسح الـ QR للتحقق من صحة الإيصال</p>
              </div>
            </div>
          ) : (
            /* Standard A4/A5 Printable Receipt Layout */
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg print:border print:border-amber-600">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white print:text-black">
                      {centerSettings?.name || 'مركز النجاح للتدريب والتكنولوجيا'}
                    </h2>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      إدارة الشؤون المالية والخزينة العامة • فرع {displayBranch}
                    </p>
                  </div>
                </div>

                <div className="text-left dir-ltr">
                  <span className="text-[10px] font-bold text-amber-400 print:text-amber-700 block uppercase tracking-wider">OFFICIAL RECEIPT</span>
                  <span className="font-mono font-black text-sm text-white print:text-black">#{payment.receiptNumber || payment.id}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{payment.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{displayTime}</span>
                  </div>
                </div>
              </div>

              {/* Student & Course Info Grid */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300 grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">اسم الطالب والمتدرب:</span>
                  <span className="font-black text-white print:text-black text-sm">{displayName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">كود الطالب:</span>
                  <span className="font-mono font-bold text-amber-400 print:text-amber-800">{displayCode}</span>
                </div>
                {displayGroupName && (
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">المجموعة التدريبية:</span>
                    <span className="font-bold text-cyan-300 print:text-cyan-800">{displayGroupName}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">الدورة التدريبية:</span>
                  <span className="font-bold text-slate-200 print:text-slate-800">{displayCourse}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">الفرع:</span>
                  <span className="font-bold text-slate-200 print:text-slate-800">{displayBranch}</span>
                </div>
                {displayTrainerCode !== '—' && (
                  <div>
                    <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-0.5">كود المحاضر:</span>
                    <span className="font-mono font-bold text-indigo-400 print:text-indigo-800">{displayTrainerCode} {displayTrainerName ? `(${displayTrainerName})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Amount Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 print:bg-emerald-50 print:border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 print:text-emerald-800">المبلغ المسدد المقبوض:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-700 dir-ltr">{payment.amount} EGP</span>
                </div>
                <p className="text-xs text-emerald-300/80 print:text-emerald-900 font-semibold italic border-t border-emerald-500/20 print:border-emerald-200 pt-1.5">
                  تفنيد المبلغ: {amountWords}
                </p>
              </div>

              {/* Financial Status Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">الشهر / الفترة:</span>
                  <span className="font-bold text-amber-300 print:text-amber-800">{targetMonthStr}</span>
                </div>
                
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">طريقة السداد:</span>
                  <span className="font-bold text-slate-200 print:text-slate-800">{getMethodLabel(payment.paymentMethod)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">تاريخ الاستحقاق القادم:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-800 dir-ltr">
                    {displayNextDueDate || 'تلقائي شهرياً'}
                  </span>
                </div>

                {displayDiscount && displayDiscount > 0 ? (
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 print:border-slate-300">
                    <span className="text-[10px] text-purple-400 block mb-0.5">الخصم المعتمد:</span>
                    <span className="font-bold text-purple-300">{displayDiscount} ج.م</span>
                  </div>
                ) : null}

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">المديونية السابقة/المتبقية:</span>
                  <span className="font-bold text-slate-300 print:text-slate-800">
                    {displayPreviousDebt && displayPreviousDebt > 0 ? `${displayPreviousDebt} ج.م` : 'لا توجد (خالص 🟢)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">أرشفة السند:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-400" />
                    Google Drive سحابي
                  </span>
                </div>
              </div>

              {/* QR Verification Bar & Electronic Stamp */}
              <div className="pt-3 border-t border-slate-800 print:border-slate-300 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/?verifyReceipt=${payment.receiptNumber || payment.id}&code=${displayCode}`)}`}
                    alt="QR Verification"
                    className="w-14 h-14 bg-white p-1 rounded-xl shadow border border-slate-700 print:border-black shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                      <span>سند معتمد وموثق إلكترونياً ✅</span>
                    </div>
                    <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                      امسح الرمز للاستعلام عن السند وصحته في الخزينة
                    </p>
                    <button
                      onClick={handleCopyVerifyLink}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold mt-1 flex items-center gap-1 print:hidden"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                      <span>{copiedLink ? 'تم نسخ رابط التحقق بنجاح!' : 'نسخ رابط التحقق المباشر'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] text-slate-400 print:text-slate-600">
                  <span className="block font-bold">الختم المالي المركزي</span>
                  <span className="text-[9px] text-amber-400/90 print:text-amber-800">NAGAH-FINANCE-SECURE</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">AUDIT-{payment.receiptNumber || payment.id}</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
