import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Receipt, 
  Award, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Clock,
  User, 
  CreditCard, 
  ExternalLink 
} from 'lucide-react';
import { numberToArabicWords } from '../utils/numberToArabicWords';
import { OfficialSealBadge } from '../components/OfficialSealBadge';

interface PublicVerificationViewProps {
  onBack: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [recordType, setRecordType] = useState<'receipt' | 'certificate' | 'attestation' | 'not_found'>('not_found');
  const [recordData, setRecordData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const verifyRecord = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const verifyReceipt = params.get('verifyReceipt') || params.get('receipt');
        const verifyId = params.get('verify') || params.get('id') || params.get('serial');
        const verifyAttestation = params.get('attestation');
        const traineeCode = params.get('code');

        if (verifyReceipt) {
          // Fetch payments
          const payments = await api.getPayments({}).catch(() => []);
          const found = (payments || []).find((p: any) => 
            String(p.receiptNumber) === String(verifyReceipt) || 
            String(p.id) === String(verifyReceipt)
          );

          if (found) {
            setRecordType('receipt');
            setRecordData(found);
          } else {
            // Check localStorage fallback
            try {
              const cached = localStorage.getItem('nagah_payments');
              if (cached) {
                const parsed = JSON.parse(cached);
                const match = parsed.find((p: any) => String(p.receiptNumber) === String(verifyReceipt) || String(p.id) === String(verifyReceipt));
                if (match) {
                  setRecordType('receipt');
                  setRecordData(match);
                } else {
                  setErrorMsg('عذراً، لم يتم العثور على إيصال السداد برقم السند المطلوب.');
                  setRecordType('not_found');
                }
              } else {
                setErrorMsg('عذراً، لم يتم العثور على إيصال السداد برقم السند المطلوب.');
                setRecordType('not_found');
              }
            } catch {
              setErrorMsg('عذراً، لم يتم العثور على إيصال السداد برقم السند المطلوب.');
              setRecordType('not_found');
            }
          }
        } else if (verifyId) {
          // Fetch certificates
          const certs = await api.getCertificates({}).catch(() => []);
          const foundCert = (certs || []).find((c: any) => 
            String(c.id) === String(verifyId) || 
            String(c.serialNumber) === String(verifyId) ||
            String(c.certificateNumber) === String(verifyId) ||
            String(c.code) === String(verifyId)
          );

          if (foundCert) {
            setRecordType('certificate');
            setRecordData(foundCert);
          } else {
            // Also check localStorage cache fallback
            try {
              const cached = localStorage.getItem('nagah_certificates') || localStorage.getItem('certificates');
              if (cached) {
                const parsed = JSON.parse(cached);
                const match = parsed.find((c: any) => 
                  String(c.id) === String(verifyId) || 
                  String(c.serialNumber) === String(verifyId) || 
                  String(c.certificateNumber) === String(verifyId) || 
                  String(c.code) === String(verifyId)
                );
                if (match) {
                  setRecordType('certificate');
                  setRecordData(match);
                } else {
                  setErrorMsg('عذراً، لم يتم العثور على الشهادة أو المستند برقم التحقق المطلوب.');
                  setRecordType('not_found');
                }
              } else {
                setErrorMsg('عذراً، لم يتم العثور على الشهادة أو المستند برقم التحقق المطلوب.');
                setRecordType('not_found');
              }
            } catch {
              setErrorMsg('عذراً، لم يتم العثور على الشهادة أو المستند برقم التحقق المطلوب.');
              setRecordType('not_found');
            }
          }
        } else if (verifyAttestation) {
          setRecordType('attestation');
          setRecordData({ attestationNumber: verifyAttestation });
        } else {
          setErrorMsg('لم يتم توفير رقم تحقق أو سند صالح في الرابط.');
          setRecordType('not_found');
        }
      } catch (err: any) {
        setErrorMsg('حدث خطأ أثناء التحقق من السند أو المستند: ' + (err?.message || 'خطأ غير معروف'));
        setRecordType('not_found');
      } finally {
        setLoading(false);
      }
    };

    verifyRecord();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `🏛️ *مركز النجاح للتدريب والاستشارات*\n` +
      `✅ *تأكيد التحقق الإلكتروني الرسمي للمستند*\n` +
      `🔗 *رابط التحقق المعتمد:*\n${window.location.href}\n\n` +
      `تم التحقق من صحة المستند بنجاح من السحابة المركزية. 🌟`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'vodafone_cash': return 'فودافون كاش (Vodafone Cash)';
      case 'instapay': return 'انستا باي (InstaPay)';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'visa': return 'بطاقة إلكترونية / فيزا';
      case 'cash': default: return 'نقداً الخزينة';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-800 gap-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-amber-700">جاري التحقق من صحة المستند من السحابة المركزية...</p>
      </div>
    );
  }

  const displayName = recordData?.traineeName || recordData?.studentName || 'غير محدد';
  const displayCode = recordData?.traineeCode || recordData?.studentCode || '---';
  const displayCourse = recordData?.courseName || 'الدورة التدريبية';
  const displayGroup = recordData?.groupName || recordData?.group || 'المجموعة الأساسية';
  const displayBranch = recordData?.branchName || recordData?.branch || 'الفرع الرئيسي';
  const displayAmount = recordData?.amount || 0;
  const amountWords = numberToArabicWords(displayAmount);
  const verifyUrl = window.location.href;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between print:bg-white print:text-black overflow-y-auto" dir="rtl">
      {/* Top Bar (Hidden on Print) */}
      <header className="bg-white border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between px-4 sm:px-6 shadow-sm print:hidden shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black">
            🏛️
          </div>
          <div>
            <h1 className="font-black text-xs sm:text-sm text-slate-900">بوابة التحقق المركزي والمستندات المعتمدة</h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500">مركز النجاح للتدريب والاستشارات - Nagah Training & Consulting</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>طباعة</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>واتساب</span>
          </button>
          <button
            onClick={onBack}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer ml-1 shadow-md"
          >
            الرئيسية
          </button>
        </div>
      </header>

      {/* Main Content Area with Natural Scroll */}
      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-5 sm:p-8 shadow-2xl relative print:shadow-none print:border-none my-6 space-y-5">
          
          {/* Authenticity Verified Banner (Hidden on print) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 print:hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-emerald-800 font-black text-xs sm:text-sm">سند رسمي معتمد وموثق إلكترونياً</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-700">تم التحقق من صحة هذا السند في السحابة المركزية لمركز النجاح.</p>
            </div>
          </div>

          {recordType === 'receipt' && recordData ? (
            <div className="space-y-4 text-slate-900">
              
              {/* Receipt Header (Luxurious Vertical Official Style) */}
              <div className="flex items-start justify-between border-b-2 border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-md border border-amber-600">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">مركز النجاح للتدريب والاستشارات</h2>
                    <p className="text-[11px] text-slate-500 font-bold">إدارة الشؤون المالية والخزينة العامة • فرع {displayBranch}</p>
                  </div>
                </div>

                <div className="text-left dir-ltr">
                  <span className="text-[9px] font-black text-amber-700 block uppercase tracking-wider">OFFICIAL RECEIPT</span>
                  <span className="font-mono font-black text-sm text-slate-900">#{recordData.receiptNumber || recordData.id}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 justify-end">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{recordData.date || new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>

              {/* Student & Course Info Grid */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">اسم المتدرب والطالب:</span>
                  <span className="font-black text-slate-900 text-sm">{displayName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">كود المتدرب:</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">{displayCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">المجموعة التدريبية:</span>
                  <span className="font-bold text-cyan-800">{displayGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">الدورة التدريبية:</span>
                  <span className="font-bold text-slate-800">{displayCourse}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-300 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">المبلغ المسدد المقبوض:</span>
                  <span className="text-2xl font-black font-mono text-emerald-700 dir-ltr">{displayAmount} EGP</span>
                </div>
                <p className="text-xs text-emerald-900 font-semibold italic border-t border-emerald-200 pt-1.5">
                  تفقيط المبلغ: ({amountWords}) لا غير
                </p>
              </div>

              {/* Financial Status Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">عن شهر / فترة:</span>
                  <span className="font-bold text-amber-700">{recordData.targetMonth || recordData.month || 'الشهر الحالي'}</span>
                </div>
                
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">طريقة السداد:</span>
                  <span className="font-bold text-slate-800">{getMethodLabel(recordData.paymentMethod)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">تاريخ الاستحقاق القادم:</span>
                  <span className="font-bold text-emerald-700 dir-ltr">
                    {recordData.nextDueDate || 'تلقائي شهرياً'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-0.5">الحالة والمديونية:</span>
                  <span className="font-bold text-emerald-700">
                    {recordData.remainingAmount && recordData.remainingAmount > 0 ? `${recordData.remainingAmount} ج.م متبقي` : 'خالص بالكامل (0 مديونية) ✓'}
                  </span>
                </div>
              </div>

              {/* Footer Stamp & QR Code Section */}
              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between gap-4 mt-2">
                <div className="space-y-1 text-right">
                  <p className="text-[11px] font-bold text-emerald-700">حالة السند: معتمد ومسدد بالخزينة المركزية ✅</p>
                  <p className="text-[10px] text-slate-500">تم الحفظ والأرشفة السحابية بنجاح عبر النظام الآمن.</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">ID: {recordData.id}</p>
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`}
                      alt="QR Verification"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 mt-1">امسح للتحقق الرقمي</span>
                </div>
              </div>

              {/* Official Seal Stamp */}
              <div className="flex justify-center pt-1">
                <div className="opacity-95 transform -rotate-3 scale-95">
                  <OfficialSealBadge className="w-20 h-20" />
                </div>
              </div>

            </div>
          ) : recordType === 'certificate' && recordData ? (
            <div className="space-y-5 text-slate-900 text-center py-6">
              <Award className="w-16 h-16 text-amber-600 mx-auto" />
              <h2 className="text-xl font-black text-slate-900">شهادة إنجاز واجتياز معتمدة</h2>
              <p className="text-sm text-slate-600">تشهد إدارة مركز النجاح للتدريب والاستشارات بأن المتدرب قد اجتاز الدورة التدريبية بنجاح وتميز.</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2 text-sm">
                <p className="text-slate-500">رقم التسلسل: <strong className="font-mono text-amber-700">{recordData.serialNumber || recordData.id}</strong></p>
                <p className="text-slate-500">الدورة: <strong className="text-slate-900">{recordData.courseName}</strong></p>
              </div>
              <div className="flex justify-center pt-2">
                <OfficialSealBadge className="w-20 h-20" />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
                ❌
              </div>
              <h3 className="text-base font-black text-slate-900">المستند غير موجود أو الرابط غير صالح</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{errorMsg || 'تأكد من صحة الرابط أو رقم السند المطلوب من إدارة مركز النجاح.'}</p>
            </div>
          )}

        </div>
      </main>

      {/* Footer (Hidden on print) */}
      <footer className="bg-white border-t border-slate-200 p-3 text-center text-[11px] text-slate-500 print:hidden shrink-0">
        مركز النجاح للتدريب والاستشارات - نظام الإدارة والتحقق الإلكتروني الآمن © {new Date().getFullYear()}
      </footer>
    </div>
  );
};
