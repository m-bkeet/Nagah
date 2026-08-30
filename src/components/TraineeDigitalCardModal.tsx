import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Phone,
  QrCode,
  Sparkles,
  CheckCircle2,
  Printer,
  Copy,
  GraduationCap,
  Calendar,
  Building2,
  Award,
  Layers
} from 'lucide-react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { Trainee, Course, Group, Branch } from '../types';
import { useCenter } from '../context/CenterContext';

interface TraineeDigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee?: Trainee | null;
  course?: Course | null;
  group?: Group | null;
  branch?: Branch | null;
  customData?: {
    traineeName: string;
    traineeCode: string;
    courseName?: string;
    groupName?: string;
    branchName?: string;
    phone?: string;
  };
}

export const TraineeDigitalCardModal: React.FC<TraineeDigitalCardModalProps> = ({
  isOpen,
  onClose,
  trainee,
  course,
  group,
  branch,
  customData
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = useCenter();

  const name = trainee?.fullName || customData?.traineeName || 'متدرب النجاح';
  const code = trainee?.code || customData?.traineeCode || 'A001';
  const courseName = course?.name || customData?.courseName || 'ICT';
  const groupName = group?.name || customData?.groupName || 'المجموعة الأولى';
  const branchName = branch?.name || customData?.branchName || 'فرع النجاح';
  const phone = trainee?.phone || customData?.phone || '';

  // Generate QR Code for Trainee
  useEffect(() => {
    if (code) {
      QRCode.toDataURL(
        JSON.stringify({
          code,
          name,
          center: 'النجاح للتدريب والاستشارات',
          branch: branchName
        }),
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        }
      )
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [code, name, branchName]);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      // Wait a bit to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#090d16",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `كارت_المتدرب_${code}_${name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("تم حفظ الكارت كصورة بنجاح! 📸", "success");

    } catch (err) {
      console.error('Error exporting card image:', err);
      showToast('تعذر حفظ صورة الكارت تلقائياً. يمكنك أخذ لقطة شاشة بدلاً من ذلك.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareText = `🌟 *مرحبا بكم في النجاح للتدريب والاستشارات* 🌟\n\nيسعدنا انضمامكم إلى أسرة المركز ونتمنى لكم رحلة تعليمية متميزة! 🎉\n\n👤 *اسم المتدرب:* ${name}\n🔑 *كود المتدرب الرسمي:* ${code}\n📚 *الصف الدراسي / الدورة:* ${courseName}\n👥 *المجموعة:* ${groupName}\n🏢 *الفرع:* ${branchName}\n\n⚠️ *تنبيه هام:* يرجى الاحتفاظ بكود المتدرب [${code}] لتسجيل الحضور، دخول المعامل، وأداء الاختبارات.\n\n📍 *النجاح للتدريب والاستشارات - نحو مستقبل واعد*`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden animate-in fade-in duration-200" dir="rtl">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-100">بطاقة المتدرب الرسمية والملف الشامل (Digital ID Card)</h3>
            <p className="text-xs text-amber-400 font-semibold">النجاح للتدريب والاستشارات</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <X className="w-4 h-4" />
          <span>إغلاق وعودة</span>
        </button>
      </div>

      {/* Full Page Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* THE DIGITAL CARD (To be captured as image) */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl text-slate-100"
          >
            {/* Watermark / Glows */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/30 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 to-amber-100 font-black text-xs tracking-tighter">
                      النجاح
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-400 to-white leading-tight">
                    مرحبا بكم في النجاح للتدريب والاستشارات
                  </h4>
                  <p className="text-[10px] text-amber-300/90 font-bold flex items-center gap-1 mt-0.5">
                    <span>🌟 بطاقة العضوية والتدريب الذكية</span>
                    <span>•</span>
                    <span>{branchName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trainee Code & Info Banner */}
            <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 shadow-inner flex items-center justify-between relative z-10">
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">كود المتدرب الرسمي المعتمد</span>
                <span className="text-3xl font-black text-amber-400 tracking-widest font-mono select-all">
                  {code}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>عضوية مفعلة ومسجلة</span>
                </div>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                  <img src={qrDataUrl} alt="QR Code" className="w-18 h-18 object-contain" />
                  <span className="text-[8px] font-mono text-slate-900 font-bold mt-0.5">Scan to Enter</span>
                </div>
              )}
            </div>

            {/* Trainee Info Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 relative z-10">
              <div>
                <span className="text-slate-400 block text-[10px]">اسم المتدرب:</span>
                <span className="text-slate-100 font-black text-xs md:text-sm truncate block">{name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">الصف / الدورة:</span>
                <span className="text-amber-300 font-bold text-xs truncate block">{courseName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">المجموعة والتوقيت:</span>
                <span className="text-indigo-300 font-bold text-xs truncate block">{groupName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">الفرع:</span>
                <span className="text-slate-200 font-bold text-xs truncate block">{branchName}</span>
              </div>
            </div>

            {/* Card Footer Stamp */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 relative z-10">
              <span>النجاح للتدريب والاستشارات © 2026/2027</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                رسمي ومعتمد
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Download as Image */}
              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'جاري إنشاء الصورة...' : 'تحميل الكارت كصورة 📸'}</span>
              </button>

              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 text-center"
              >
                <Phone className="w-4 h-4 text-emerald-100" />
                <span>إرسال واتساب 📲</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Formatted Welcome Message */}
              <button
                onClick={handleCopyText}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isCopied ? 'تم نسخ الرسالة بنجاح!' : 'نسخ نص الترحيب'}</span>
              </button>

              {/* Print Card */}
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};
