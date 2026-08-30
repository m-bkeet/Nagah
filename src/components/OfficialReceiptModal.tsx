import React, { useRef } from 'react';
import { X, Printer, Download, Share2, CheckCircle2, ShieldCheck, Building2, Calendar, CreditCard, User, Receipt, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Payment } from '../types';
import { numberToArabicWords } from '../utils/numberToArabicWords';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  studentName?: string;
  studentCode?: string;
  traineeName?: string;
  traineeCode?: string;
  trainerName?: string;
  trainerCode?: string;
  courseName?: string;
  branchName?: string;
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
  centerSettings
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isThermalMode, setIsThermalMode] = React.useState(false);

  if (!isOpen || !payment) return null;

  const displayName = payment.traineeName || studentName || 'اسم الطالب غير محدد';
  const displayCode = payment.traineeCode || studentCode || '—';
  const displayTrainerCode = payment.trainerCode || trainerCode || '—';
  const displayTrainerName = payment.trainerName || trainerName || '';
  const displayCourse = payment.courseName || courseName || 'الدورة التدريبية';
  const displayBranch = branchName || 'الفرع الرئيسي';
  const amountWords = numberToArabicWords(payment.amount);
  const targetMonthStr = payment.targetMonth || 'الشهر الحالي';

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
    const text = `🧾 *إيصال سداد مالي رسمي - مركز النجاح للتدريب*\n` +
      `----------------------------------------\n` +
      `📌 *رقم السند:* ${payment.receiptNumber || payment.id}\n` +
      `👤 *اسم الطالب:* ${displayName} (${displayCode})\n` +
      `📚 *الدورة:* ${displayCourse}\n` +
      `💰 *المبلغ المسدد:* ${payment.amount} ج.م\n` +
      `📅 *عن شهر/فترة:* ${targetMonthStr}\n` +
      `💳 *طريقة السداد:* ${getMethodLabel(payment.paymentMethod)}\n` +
      `📆 *تاريخ السداد:* ${payment.date}\n` +
      `✅ *حالة السند:* معتمد ومسدد بالكامل\n` +
      `----------------------------------------\n` +
      `شكراً لثقتكم بنا! 🏛️`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:w-full">
        
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-xs">سند قبض مالي معتمد</span>
            
            {/* Mode Switcher */}
            <button
              onClick={() => setIsThermalMode(!isThermalMode)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                isThermalMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isThermalMode ? '🖨️ نمط الطابعة الحرارية POS 80mm' : '📄 النمط القياسي (A4/A5)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="py-1.5 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>حفظ صورة</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="py-1.5 px-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CARD BODY */}
        <div ref={receiptRef} className={`p-6 md:p-8 space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-slate-900 ${isThermalMode ? 'max-w-[320px] mx-auto text-xs space-y-3 font-mono print:w-[80mm]' : ''}`}>
          {isThermalMode ? (
            /* POS 80mm Thermal Receipt Layout */
            <div className="text-center space-y-2 border-b border-dashed border-slate-700 pb-3 print:border-black">
              <div className="font-black text-sm text-white print:text-black">{centerSettings?.name || 'مركز النجاح للتدريب'}</div>
              <p className="text-[10px] text-slate-400 print:text-black">فرع {displayBranch} • ت: {centerSettings?.phone || '01000000000'}</p>
              <div className="py-1 bg-amber-500/20 text-amber-300 font-bold text-[11px] rounded print:bg-slate-200 print:text-black">
                إيصال سداد مالي # {payment.receiptNumber || payment.id}
              </div>
              <div className="text-left text-[10px] text-slate-400 dir-ltr">{payment.date}</div>

              <div className="text-right space-y-1 pt-2 border-t border-dashed border-slate-700 print:border-black">
                <div className="flex justify-between font-bold">
                  <span>الطالب:</span>
                  <span className="text-amber-300 print:text-black">{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span>كود الطالب:</span>
                  <span>{displayCode}</span>
                </div>
                {displayTrainerCode !== '—' && (
                  <div className="flex justify-between text-indigo-300 print:text-black">
                    <span>كود المدرب:</span>
                    <span className="font-bold dir-ltr">{displayTrainerCode}</span>
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
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://nagah-center.com/verify?receipt=${payment.receiptNumber || payment.id}&code=${displayCode}`)}`}
                    alt="QR Verification"
                    className="w-16 h-16 bg-white p-1 rounded"
                  />
                </div>
                <p className="mt-1 text-[8px]">امسح الـ QR للتحقق من صحة الإيصال</p>
              </div>
            </div>
          ) : (
            /* Standard A4/A5 Printable Receipt Layout */
            <>
              {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg print:border print:border-amber-600">
                🏛️
              </div>
              <div>
                <h2 className="text-base font-black text-white print:text-black">
                  {centerSettings?.name || 'مركز النجاح للتدريب والتكنولوجيا'}
                </h2>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  إدارة الشؤون المالية والخزينة العامة
                </p>
              </div>
            </div>

            <div className="text-left dir-ltr">
              <span className="text-[10px] font-bold text-amber-400 print:text-amber-700 block uppercase tracking-wider">OFFICIAL RECEIPT</span>
              <span className="font-mono font-black text-sm text-white print:text-black">#{payment.receiptNumber || payment.id}</span>
              <span className="block text-[10px] text-slate-400 print:text-slate-600 mt-0.5">{payment.date}</span>
            </div>
          </div>

          {/* Student & Course Info Grid */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-100 print:border-slate-300 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-1">اسم الطالب والمتدرب:</span>
              <span className="font-black text-white print:text-black text-sm">{displayName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-1">كود الطالب:</span>
              <span className="font-mono font-bold text-amber-400 print:text-amber-800">{displayCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-1">كود المدرب / المحاضر:</span>
              <span className="font-mono font-bold text-indigo-400 print:text-indigo-800">{displayTrainerCode} {displayTrainerName ? `(${displayTrainerName})` : ''}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-1">الدورة التدريبية:</span>
              <span className="font-bold text-slate-200 print:text-slate-800">{displayCourse}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 font-bold block mb-1">الفرع:</span>
              <span className="font-bold text-slate-200 print:text-slate-800">{displayBranch}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 print:bg-emerald-50 print:border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 print:text-emerald-800">المبلغ المسدد المقبوض:</span>
              <span className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-700 dir-ltr">{payment.amount} EGP</span>
            </div>
            <p className="text-xs text-emerald-300/80 print:text-emerald-900 font-semibold italic border-t border-emerald-500/20 print:border-emerald-200 pt-2">
              تفنيد المبلغ: {amountWords}
            </p>
          </div>

          {/* Payment Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">الشهر / الفترة المسدد عنها:</span>
              <span className="font-bold text-amber-300 print:text-amber-800">{targetMonthStr}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-500 block mb-0.5">طريقة ووسيلة السداد:</span>
              <span className="font-bold text-slate-200 print:text-slate-800">{getMethodLabel(payment.paymentMethod)}</span>
            </div>
          </div>

          {/* Proof Screenshot Thumbnail if exists */}
          {payment.proofImageUrl && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 print:hidden space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 block">صورة / لقطة الشاشة المرفقة للإيصال:</span>
              <div className="relative group max-w-xs overflow-hidden rounded-lg border border-slate-700">
                <img src={payment.proofImageUrl} alt="إيصال السداد" className="w-full h-28 object-cover rounded-lg" />
                <a
                  href={payment.proofImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-amber-300 font-bold transition-all"
                >
                  🔍 تكبير الصورة
                </a>
              </div>
            </div>
          )}

          {/* Verification Stamp & Signatures */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-800 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400 print:text-emerald-700" />
              <div>
                <span className="block text-xs font-black">حالة السند: معتمد ومسدد ✅</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-normal">
                  تاريخ التحقق والاعتماد: {payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString('ar-EG') : payment.date}
                </span>
              </div>
            </div>

            <div className="text-left font-mono text-[10px] text-slate-400 print:text-slate-600">
              <span className="block font-bold">توقيع الختم الإلكتروني</span>
              <span className="text-[9px] text-amber-400/80 print:text-amber-800">NAGAH-CENTER-VERIFIED</span>
            </div>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
};
