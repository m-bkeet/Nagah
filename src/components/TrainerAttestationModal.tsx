import React, { useRef } from 'react';
import { X, Printer, Download, Share2, ShieldCheck, Award, Calendar, Clock, Building2, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import { TrainerAttestation } from '../types';

interface TrainerAttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attestation: TrainerAttestation | null;
  centerSettings?: {
    name?: string;
    phone?: string;
    logoUrl?: string;
  };
}

export const TrainerAttestationModal: React.FC<TrainerAttestationModalProps> = ({
  isOpen,
  onClose,
  attestation,
  centerSettings
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !attestation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `إفادة_تنفيذ_مدرب_${attestation.trainerCode}_${attestation.attestationNumber}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to capture certificate image:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `📜 *إفادة رسمية بتنفيذ محاضرة/دورة تدريبية*\n` +
      `----------------------------------------\n` +
      `🏛️ *المركز:* ${centerSettings?.name || 'مركز النجاح للتدريب والتكنولوجيا'}\n` +
      `📌 *رقم الإفادة:* ${attestation.attestationNumber}\n` +
      `👨‍🏫 *المدرب/المحاضر:* ${attestation.trainerName} (كود: ${attestation.trainerCode})\n` +
      `📚 *عنوان الفعالية:* ${attestation.title}\n` +
      `🏷️ *النوع:* ${attestation.type === 'single_day_lecture' ? 'محاضرة اليوم الواحد المكثفة' : attestation.type === 'workshop' ? 'ورشة عمل تطبيقية' : 'دورة تدريبية معتمدة'}\n` +
      `⏱️ *عدد الساعات:* ${attestation.hoursCount} ساعة تدريبية\n` +
      `📅 *تاريخ التنفيذ:* ${attestation.executionDate}\n` +
      `🏛️ *الفرع:* ${attestation.branchName || 'الفرع الرئيسي'}\n` +
      `----------------------------------------\n` +
      `إفادة رسمية معتمدة ومسجلة بالسجلات الفنية للمركز. ✅`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'single_day_lecture': return 'محاضرة اليوم الواحد المكثفة';
      case 'workshop': return 'ورشة عمل تدريبية متخصصة';
      case 'course_execution': default: return 'دورة تدريبية معتمدة';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:w-full">
        
        {/* Modal Header Actions */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-amber-400 font-black text-sm">إفادة رسمية بتنفيذ محاضرة / دورة للمدربين</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة</span>
            </button>
            <button
              onClick={handleDownloadImage}
              className="py-1.5 px-3.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل صورة</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DIPLOMA FRAME CARD */}
        <div
          ref={certificateRef}
          className="p-8 md:p-12 bg-slate-950 text-slate-100 relative overflow-hidden print:bg-white print:text-slate-950 select-none"
        >
          {/* Luxury Gold Border Overlay */}
          <div className="absolute inset-3 border-2 border-amber-500/40 rounded-2xl pointer-events-none print:border-amber-700"></div>
          <div className="absolute inset-5 border border-dashed border-amber-500/20 rounded-xl pointer-events-none print:border-amber-600/50"></div>

          {/* Background Watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl text-amber-500">
            🏛️
          </div>

          <div className="relative z-10 space-y-8 text-center">
            
            {/* Header / Logo */}
            <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-6">
              <div className="flex items-center gap-3 text-right">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl print:border print:border-amber-600">
                  🏛️
                </div>
                <div>
                  <h2 className="text-lg font-black text-white print:text-black">
                    {centerSettings?.name || 'مركز النجاح للتدريب والتكنولوجيا واللغات'}
                  </h2>
                  <p className="text-xs text-amber-400 print:text-amber-800 font-bold">
                    إدارة التطوير الجودة والشؤون الأكاديمية
                  </p>
                </div>
              </div>

              <div className="text-left dir-ltr">
                <span className="text-[10px] font-bold text-amber-400 print:text-amber-800 block uppercase tracking-widest">OFFICIAL ATTESTATION</span>
                <span className="font-mono font-black text-xs text-slate-300 print:text-slate-800">#{attestation.attestationNumber}</span>
                <span className="block text-[10px] text-slate-500 print:text-slate-600 mt-0.5">{attestation.executionDate}</span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="space-y-2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider print:bg-amber-100 print:text-amber-900">
                إفادة رسمية بتنفيذ محاضرة / نشاط تدريبي
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 print:text-slate-950 leading-relaxed">
                شهادة وثيقة إثبات تنفيذ
              </h1>
            </div>

            {/* Main Attestation Statement */}
            <div className="space-y-6 max-w-2xl mx-auto leading-relaxed text-sm md:text-base text-slate-200 print:text-slate-900 font-medium">
              <p className="text-slate-400 print:text-slate-700">
                تشهد إدارة مركز النجاح للتدريب والاستشارات والتكنولوجيا بأن المحاضر والمدرب القدير:
              </p>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 print:bg-amber-50 print:border-amber-300 text-center space-y-1">
                <div className="text-2xl md:text-3xl font-black text-amber-300 print:text-amber-950">
                  {attestation.trainerName}
                </div>
                <div className="text-xs font-mono font-bold text-indigo-400 print:text-indigo-900 dir-ltr">
                  كود المدرب الرسمي: {attestation.trainerCode}
                </div>
              </div>

              <p className="text-slate-300 print:text-slate-800 leading-loose">
                قد أتم بنجاح وبكفاءة عالية تنفيذ <span className="font-bold text-amber-300 print:text-amber-900">({getTypeLabel(attestation.type)})</span> بعنوان:
              </p>

              <div className="text-xl md:text-2xl font-black text-white print:text-slate-950 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl print:bg-slate-100 print:border-slate-300 shadow-inner">
                « {attestation.title} »
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] font-bold">عدد الساعات المعتمدة:</span>
                  <span className="font-black text-amber-400 print:text-amber-900 text-sm">{attestation.hoursCount} ساعة تدريبية</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-100 print:border-slate-300">
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] font-bold">تاريخ التنفيذ:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{attestation.executionDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-100 print:border-slate-300 col-span-2 md:col-span-1">
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] font-bold">مقر التنفيذ / الفرع:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{attestation.branchName || 'الفرع الرئيسي'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 print:text-slate-600 italic">
                وقد حُررت هذه الإفادة بناءً على طلبه لتقديمها لمن يهمه الأمر دون أدنى مسؤولية على المركز تجاه حقوق الغير.
              </p>
            </div>

            {/* Footer Signatures & QR Seal */}
            <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex items-end justify-between text-xs">
              
              {/* QR Verification */}
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(attestation.qrCodeUrl || `https://nagah-center.com/verify?attestation=${attestation.attestationNumber}`)}`}
                  alt="QR Code Verification"
                  className="w-16 h-16 bg-white p-1 rounded-xl shadow-lg border border-amber-500/30"
                />
                <div className="text-right text-[10px] text-slate-400 print:text-slate-600">
                  <span className="font-bold text-amber-400 print:text-amber-800 block">رمز التحقق الرقمي</span>
                  <span>امسح الكود للتحقق من صحة الإفادة</span>
                </div>
              </div>

              {/* Official Seal / Signature */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-xl print:border-amber-700">
                  ✅
                </div>
                <div className="space-y-0.5">
                  <span className="block font-black text-white print:text-black text-xs">مدير الشؤون الأكاديمية والتدريب</span>
                  <span className="block text-[10px] text-amber-400 print:text-amber-800 font-bold">اعتماد مركز النجاح للتدريب 🏛️</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
