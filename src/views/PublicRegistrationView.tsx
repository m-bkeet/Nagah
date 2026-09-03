import { api } from '../services/api';
import { Camera, Upload, Send, CheckCircle2, User, Phone, MapPin, BookOpen, Layers, Copy, ArrowRight, ShieldCheck, QrCode, Share2, Sparkles, RefreshCw, Download, Printer, Award, Lock, MessageSquare } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { uploadFile } from '../lib/storage';
import { cloudDb } from '../services/cloudDatabase';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { FloatingChatButton } from '../components/FloatingChatButton';

const API_URL = `${window.location.origin}/api/public/register`;
const BRANCHES_API = `${window.location.origin}/api/branches`;

interface PublicRegistrationViewProps {
  onBack?: () => void;
}

export const PublicRegistrationView: React.FC<PublicRegistrationViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    parentPhone: '',
    parentName: '',
    branchId: '',
    grade: 'الصف الرابع الابتدائي',
    track: 'عربي',
    customGrade: '',
    photoUrl: ''
  });
  
  const [branches, setBranches] = useState<any[]>([
    { id: 'branch-1', name: 'فرع المركز الرئيسي - مبنى النجاح للتدريب' },
    { id: 'branch-2', name: 'فرع بدر - سنتر التدريب' }
  ]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  const [registrationClosedMessage, setRegistrationClosedMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${window.location.origin}/api/public/registration-status`)
      .then(res => res.json())
      .then(data => {
        if (data && data.allowOnlineRegistration === false) {
          setIsRegistrationOpen(false);
          setRegistrationClosedMessage('تعتذر إدارة مركز النجاح للتدريب والاستشارات، تم إغلاق باب التسجيل الخارجي حالياً لاكتمال العدد بجميع المجموعات. يرجى التواصل المباشر مع إدارة المركز.');
        }
      })
      .catch(() => {});
  }, []);
  const [result, setResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isTextCopied, setIsTextCopied] = useState(false);
  const cardElementRef = useRef<HTMLDivElement>(null);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getBranches().then(data => {
        if (Array.isArray(data)) {
          setBranches(data);
          if (data.length > 0 && !formData.branchId) {
            setFormData(prev => ({ ...prev, branchId: data[0]?.id || '' }));
          }
        }
      })
      .catch(err => console.error('Failed to load branches', err));
  }, []);

  useEffect(() => {
    if (result?.traineeCode) {
      QRCode.toDataURL(
        JSON.stringify({
          code: result.traineeCode,
          name: result.traineeName,
          center: 'النجاح للتدريب والاستشارات',
          branch: result.branchName
        }),
        { width: 200, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } }
      )
        .then(url => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [result]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, `trainees/${Date.now()}_${photoFile.name}`);
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photoUrl })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'حدث خطأ أثناء التسجيل');
      }

      setFormData({
        fullName: '',
        phone: '',
        parentPhone: '',
        parentName: '',
        branchId: branches[0]?.id || '',
        grade: 'الصف الرابع الابتدائي',
        track: 'عربي',
        customGrade: '',
        photoUrl: ''
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setStep(2);
      setResult(data);
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.message || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (result?.traineeCode) {
      navigator.clipboard.writeText(result.traineeCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      parentPhone: '',
      parentName: '',
      branchId: branches?.[0]?.id || '',
      grade: 'الصف الرابع الابتدائي',
      track: 'عربي',
      customGrade: '',
      photoUrl: ''
    });
    setPhotoPreview(null);
    setResult(null);
    setStep(1);
  };

  const grades = [
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي',
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي',
    'الصف الأول الثانوي (عام)',
    'الصف الأول الثانوي (أزهر)',
    'الصف الأول الثانوي (تجاري)',
    'الصف الأول الثانوي (لغات)',
    'الصف الثاني الثانوي (عام)',
    'الصف الثاني الثانوي (أزهر)',
    'الصف الثاني الثانوي (تجاري)',
    'الصف الثاني الثانوي (لغات)',
    'الصف الثالث الثانوي',
    'أخرى'
  ];

  if (step === 2 && result) {
    const shareMessage = `🌟 *مرحبا بكم في النجاح للتدريب والاستشارات* 🌟\n\nيسعدنا انضمامكم إلى أسرة المركز ونتمنى لكم رحلة تعليمية وتدريبية متميزة! 🎉\n\n👤 *اسم المتدرب:* ${result.traineeName}\n🔑 *كود المتدرب الرسمي:* ${result.traineeCode}\n📚 *الصف الدراسي / الدورة:* ${result.courseName}\n👥 *المجموعة:* ${result.groupName}\n🏢 *الفرع:* ${result.branchName}\n\n⚠️ *تنبيه هام:* يرجى الاحتفاظ بهذا الكود [${result.traineeCode}] حيث يُستخدم في تسجيل الحضور على الأجهزة، دخول المعامل، وأداء الاختبارات.\n\n📍 *النجاح للتدريب والاستشارات - نحو مستقبل واعد`;

    const handleDownloadCardImage = async () => {
      if (!cardElementRef.current) return;
      try {
        setIsGeneratingImage(true);
        // Wait a bit to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(cardElementRef.current, {
          scale: 2,
          backgroundColor: "#090d16",
          useCORS: true
        });
        
        const dataUrl = canvas.toDataURL("image/png");
        
        setGeneratedImageUrl(dataUrl);
        
        // Try direct download for non-iframe environments
        try {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `كارت_المتدرب_${result.traineeCode}_${(result.traineeName || "طالب").replace(/\s+/g, "_")}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          // Ignore if blocked by iframe sandbox
        }
      } catch (err) {
        console.error("Error downloading card image:", err);
        alert("تعسّر تحميل صورة الكارت بسبب إعدادات المتصفح، يرجى أخذ لقطة شاشة (Screenshot) للبطاقة.");
      } finally {
        setIsGeneratingImage(false);
      }
    };

    const handleCopyFullText = () => {
      navigator.clipboard.writeText(shareMessage);
      setIsTextCopied(true);
      setTimeout(() => setIsTextCopied(false), 2500);
    };


    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden" dir="rtl">
        {/* Glow effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 relative z-10 backdrop-blur-xl">
          <div className="text-center space-y-1.5">
            {result.alreadyRegistered ? (
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            <h2 className="text-xl md:text-2xl font-black text-white">
              {result.alreadyRegistered ? 'تم التسجيل من قبل مسبقاً!' : 'تم التسجيل وتأكيد العضوية بنجاح!'}
            </h2>
            <p className="text-slate-300 text-xs">
              {result.alreadyRegistered 
                ? 'أهلاً بك مجدداً! بياناتك وكودك مسجلان بالفعل لدينا بالنظام. يمكنك استخدام بطاقتك أدناه:' 
                : 'تم إنشاء بطاقتك وتسكينك تلقائياً في المجموعة المناسبة.'}
            </p>
          </div>
          
          {/* THE DIGITAL TRAINEE CARD (Captured as image) */}
          <div 
            ref={cardElementRef}
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4 text-slate-100"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />
            
            {/* Card Header with Center Name & Logo */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-0.5 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 to-amber-100 font-black text-[11px]">
                      النجاح
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-400 to-white">
                    مرحبا بكم في النجاح للتدريب والاستشارات
                  </h3>
                  <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                    <span>🌟 بطاقة العضوية والتدريب الرسمية</span>
                    <span>•</span>
                    <span>{result.branchName || 'مركز التدريب'}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                معتمد
              </span>
            </div>
            
            {/* Student Code Box with QR */}
            <div className="bg-slate-950/85 p-4 rounded-xl border border-amber-500/40 flex items-center justify-between shadow-inner">
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 block">كود المتدرب الرسمي للدخول والحضور</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl md:text-4xl font-black text-amber-400 tracking-widest font-mono select-all">
                    {result.traineeCode}
                  </span>
                  <button 
                    onClick={handleCopyCode} 
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold">عضوية رسمية مسجلة بالنظام</p>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="bg-white p-1 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                  <img src={qrCodeUrl} alt="QR" className="w-16 h-16 object-contain" />
                  <span className="text-[7px] font-mono text-slate-900 font-bold mt-0.5">باركود الدخول</span>
                </div>
              )}
            </div>
            
            {/* Student Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">اسم المتدرب</span>
                <span className="text-slate-100 font-bold">{result.traineeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">الفرع</span>
                <span className="text-slate-100 font-bold">{result.branchName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">الدورة التدريبية</span>
                <span className="text-amber-300 font-bold">{result.courseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] mb-0.5">المجموعة والتوقيت</span>
                <span className="text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40 inline-block">
                  {result.groupName}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
              <span>النجاح للتدريب والاستشارات © 2026/2027</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                رسمي ومعتمد
              </span>
            </div>
          </div>

          {/* CRITICAL WARNING ALERT */}
          <div className="bg-rose-950/50 border-2 border-rose-600/60 rounded-2xl p-3.5 text-rose-200 text-xs font-bold leading-relaxed space-y-1 shadow-lg shadow-rose-950/30">
            <div className="flex items-center gap-1.5 text-rose-300 text-xs font-black">
              <span>⚠️ تنبيه فائق الأهمية:</span>
            </div>
            <p>
              يرجى حفظ كودك التدريبي <span className="bg-rose-500/30 px-1.5 py-0.5 rounded text-amber-300 font-mono text-sm tracking-wider font-black">{result.traineeCode}</span> وتحميل صورة الكارت للاحتفاظ بها في الهاتف.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {/* Download Card as Image */}
              <button
                onClick={handleDownloadCardImage}
                disabled={isGeneratingImage}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'جاري التحميل...' : 'تحميل صورة الكارت 📸'}</span>
              </button>

              {/* WhatsApp Share Button */}
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-3 rounded-xl font-black text-xs shadow-xl shadow-emerald-950/40 transition-all active:scale-95 text-center"
              >
                <Phone className="w-4 h-4" />
                <span>إرسال واتساب 📲</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFullText}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl font-bold text-xs border border-slate-700 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isTextCopied ? 'تم نسخ الرسالة!' : 'نسخ نص الترحيب'}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl font-bold text-xs border border-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>تسجيل طالب آخر</span>
              </button>
            </div>
            {generatedImageUrl && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" style={{ margin: 0 }}>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-white">تم تجهيز الكارت بنجاح 🎉</h3>
                    <p className="text-[10px] text-amber-400 font-bold">اضغط مطولاً على الصورة لحفظها (للهاتف) أو كليك يمين للكمبيوتر</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-amber-500 shadow-lg bg-white p-1">
                    <img src={generatedImageUrl} alt="Card" className="w-full h-auto rounded-xl" />
                  </div>
                  <button
                    onClick={() => setGeneratedImageUrl(null)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all border border-slate-700 text-sm"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}


            {onBack && (
              <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 p-2 rounded-xl font-medium text-xs border border-slate-800 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-10 px-4 font-sans relative overflow-hidden" dir="rtl">
      {/* Top action controls */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 z-20">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        ) : <div />}
        <ThemeQuickSwitcher />
      </div>

      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-5 relative z-10">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/20 text-slate-950 font-black text-xl mb-1">
            نجاح
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-amber-300 to-amber-400">
            مركز النجاح للتدريب والاستشارات
          </h1>
          <p className="text-xs text-slate-400 font-medium">نموذج التسجيل الإلكتروني السريع للطلاب والدورات</p>
        </div>

        {/* Form Container */}
        {!isRegistrationOpen ? (
          <div className="bg-slate-900/90 border border-amber-500/40 shadow-2xl rounded-3xl p-8 backdrop-blur-xl space-y-6 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-amber-400">باب التسجيل الخارجي مغلق حالياً</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto font-medium">
                {registrationClosedMessage || 'تعتذر إدارة مركز النجاح للتدريب والاستشارات، تم إغلاق باب التسجيل الخارجي حالياً لاكتمال العدد بجميع المجموعات.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/201001500686?text=%D8%A3%D9%87%D9%84%D8%A7%D9%8B%20%D8%A8%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%8BD%20%D8%A7%D9%83%D8%AA%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%B9%D8%AF%D8%AF"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>التواصل المباشر مع إدارة المركز (واتساب)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 shadow-2xl rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
          
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-3.5 text-center text-xs text-indigo-200 font-medium leading-relaxed">
            ✨ يرجى تعبئة البيانات بالأسفل، وسيتم توليد كودك التدريبي وتسكينك في دورتك ومجموعتك تلقائياً دون الحاجة لتسجيل دخول.
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Photo Upload (Optional) */}
            <div className="flex flex-col items-center gap-2.5 pb-4 border-b border-slate-800">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center bg-slate-850 cursor-pointer overflow-hidden hover:border-amber-500 hover:bg-slate-800 transition-all group relative shadow-inner"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-7 h-7 text-slate-400 group-hover:text-amber-400 mb-1" />
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-300 font-bold">صورة شخصية</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                capture="user"
                className="hidden" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                اضغط لالتقاط صورتك بالكاميرا أو رفعها من المعرض (اختياري، للشهادات والبطاقة)
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  اسم المتدرب (رباعي) *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName ?? ''}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => {
                      // Check if parentName is either empty or matches the auto-generated parent name of the PREVIOUS fullName
                      let nextParentName = prev.parentName;
                      const prevParts = (prev.fullName || '').trim().split(' ');
                      const prevAutoParent = prevParts.length > 1 ? prevParts.slice(1).join(' ') : '';
                      
                      const newParts = val.trim().split(' ');
                      const newAutoParent = newParts.length > 1 ? newParts.slice(1).join(' ') : '';

                      // Auto update if it was not manually modified to something else
                      if (!prev.parentName || prev.parentName.trim() === prevAutoParent) {
                        nextParentName = newAutoParent;
                      }

                      return { ...prev, fullName: val, parentName: nextParentName };
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-400"
                  placeholder="مثال: أحمد محمد محمود علي"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Phone className="w-4 h-4 text-amber-400" />
                  رقم هاتف الطالب (أو ولي الأمر للتواصل) *
                </label>
                <input 
                  type="tel" 
                  required
                  dir="ltr"
                  value={formData.phone ?? ''}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm text-right focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-400"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parent Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    اسم ولي الأمر (اختياري)
                  </label>
                  <input 
                    type="text" 
                    value={formData.parentName ?? ''}
                    onChange={e => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-400"
                    placeholder="مثال: محمد محمود علي"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    رقم هاتف ولي الأمر (للمتابعة)
                  </label>
                  <input 
                    type="tel" 
                    dir="ltr"
                    value={formData.parentPhone ?? ''}
                    onChange={e => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm text-right focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-slate-400"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch Selection Dropdown */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    الفرع المراد التسجيل به *
                  </label>
                  <select 
                    required
                    value={formData.branchId ?? ''}
                    onChange={e => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-all"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Grade / Stage Selection Dropdown */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    الصف الدراسي / المرحلة *
                  </label>
                  <select 
                    required
                    value={formData.grade ?? ''}
                    onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-all mb-2"
                  >
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  {/* Dynamic Custom Grade Input when 'أخرى' is selected */}
                  {formData.grade === 'أخرى' && (
                    <div className="animate-fadeIn">
                      <input 
                        type="text" 
                        required
                        value={formData.customGrade ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, customGrade: e.target.value }))}
                        className="w-full bg-slate-950 border-2 border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                        placeholder="اكتب اسم الصف أو المرحلة أو الدورة المطلوبة..."
                      />
                      <span className="text-[10px] text-indigo-300 mt-1 block">
                        ✨ سيقوم النظام بإنشاء تصنيف ودورة جديدة لك تلقائياً
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Track Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  نوع المسار / الدراسة *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, track: 'عربي' }))}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                      formData.track === 'عربي' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10' 
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🇪🇬 عربي
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, track: 'لغات' }))}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                      formData.track === 'لغات' 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10' 
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    🇬🇧 لغات (Languages)
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 p-4 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 rotate-180" />
                    <span>تأكيد التسجيل وإصدار بطاقة المتدرب</span>
                  </>
                )}
              </button>
            </div>
            
          </form>

          {onBack && (
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-bold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لشاشة الدخول الرئيسية</span>
              </button>
            </div>
          )}
        </div>
        )}
      </div>
      <FloatingChatButton />
    </div>
  );
};
