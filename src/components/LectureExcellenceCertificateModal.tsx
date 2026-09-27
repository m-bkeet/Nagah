import React, { useState, useRef, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { 
  Award, Crown, Star, Medal, Printer, Download, Share2, 
  X, Sparkles, CheckCircle2, ShieldCheck, User, Calendar, 
  BookOpen, Eye, Check, Send, QrCode as QrIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import { OfficialSealBadge } from './OfficialSealBadge';
import { captureElementToCanvas } from '../utils/captureUtils';
import confetti from 'canvas-confetti';
import { audioService } from '../services/audioService';
import { Trainee, Course, Group } from '../types';
import { api } from '../services/api';

export interface LectureCertificateInitialData {
  traineeId?: string;
  traineeName?: string;
  traineeCode?: string;
  traineePhoto?: string;
  traineePhone?: string;
  courseId?: string;
  courseName?: string;
  groupName?: string;
  lectureTitle?: string;
  lectureDate?: string;
  points?: number;
  stars?: number;
  awardTitle?: string;
  trainerName?: string;
  hallName?: string;
}

interface LectureExcellenceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: LectureCertificateInitialData;
  onCertificateIssued?: (cert: any) => void;
}

export const LectureExcellenceCertificateModal: React.FC<LectureExcellenceCertificateModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onCertificateIssued
}) => {
  const { trainees, courses, groups, settings, showToast, refreshAll, activeBranchId, branches } = useCenter();
  const certRef = useRef<HTMLDivElement>(null);

  // Form selections
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialData?.courseId || '');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(initialData?.traineeId || '');
  const [traineeSearch, setTraineeSearch] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>(initialData?.lectureTitle || 'المحاضرة التفاعلية والتطبيق العملي');
  const [lectureDate, setLectureDate] = useState<string>(initialData?.lectureDate || new Date().toISOString().split('T')[0]);
  const [awardTitle, setAwardTitle] = useState<string>(initialData?.awardTitle || 'نجم المحاضرة الذهبي والمركز الأول');
  const [starsCount, setStarsCount] = useState<number>(initialData?.stars || 5);
  const [pointsEarned, setPointsEarned] = useState<number>(initialData?.points || 25);
  const [themeStyle, setThemeStyle] = useState<'royal_gold' | 'emerald_prestige' | 'sapphire_luxury'>('royal_gold');
  const [customPraise, setCustomPraise] = useState<string>('تقديراً لتفوقه الاستثنائي، وحضوره المبكر، وتفاعله النموذجي وإتقانه للتطبيقات العملية في المعمل');
  const [trainerName, setTrainerName] = useState<string>(initialData?.trainerName || settings?.trainerName || 'المحاضر المشرف');
  const [managerName, setManagerName] = useState<string>(settings?.managerName || 'د. محمد رمضان بخيت');

  // Preview & export states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>(() => `NGAH-STAR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Auto-init defaults
  useEffect(() => {
    if (initialData?.courseId) setSelectedCourseId(initialData.courseId);
    else if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0].id);

    if (initialData?.traineeId) setSelectedTraineeId(initialData.traineeId);
    else if (trainees.length > 0 && !selectedTraineeId) setSelectedTraineeId(trainees[0].id);

    if (initialData?.lectureTitle) setLectureTitle(initialData.lectureTitle);
    if (initialData?.lectureDate) setLectureDate(initialData.lectureDate);
    if (initialData?.awardTitle) setAwardTitle(initialData.awardTitle);
    if (initialData?.points) setPointsEarned(initialData.points);
    if (initialData?.stars) setStarsCount(initialData.stars);
    if (initialData?.trainerName) setTrainerName(initialData.trainerName);
  }, [initialData, courses, trainees]);

  // Resolve trainee details
  const currentTrainee = trainees.find(t => t.id === selectedTraineeId) || (initialData?.traineeName ? {
    id: initialData.traineeId || 'custom',
    fullName: initialData.traineeName,
    code: initialData.traineeCode || '101',
    photoUrl: initialData.traineePhoto || '',
    phone: initialData.traineePhone || '',
    parentPhone: ''
  } as any : null);

  const currentCourse = courses.find(c => c.id === selectedCourseId) || (initialData?.courseName ? {
    id: initialData.courseId || 'custom',
    name: initialData.courseName
  } as any : null);

  // Generate verification QR code
  useEffect(() => {
    const verificationText = `منظومة النجاح الذكية للتدريب\nشهادة تفوق وتقدير في محاضرة\nالمتدرب: ${currentTrainee?.fullName || 'متدرب متميز'}\nكود المتدرب: ${currentTrainee?.code || '—'}\nالدورة: ${currentCourse?.name || 'برنامج تدريبي'}\nالمحاضرة: ${lectureTitle}\nاللقب: ${awardTitle}\nالنقاط: ${pointsEarned} نقطة\nالرقم المرجعي: ${serialNumber}\nالتاريخ: ${lectureDate}\nمعتمدة من مركز النجاح للتدريب والاستشارات`;
    
    QRCode.toDataURL(verificationText, {
      width: 160,
      margin: 1,
      color: {
        dark: themeStyle === 'emerald_prestige' ? '#064e3b' : themeStyle === 'sapphire_luxury' ? '#1e3a8a' : '#78350f',
        light: '#ffffff'
      }
    }).then(setQrCodeDataUrl).catch(() => {});
  }, [currentTrainee, currentCourse, lectureTitle, awardTitle, pointsEarned, serialNumber, lectureDate, themeStyle]);

  if (!isOpen) return null;

  // Visual Theme palettes
  const themes = {
    royal_gold: {
      name: 'الملكي الذهبي (Royal Gold)',
      borderColor: '#b45309',
      borderOuter: '#d97706',
      goldGradient: 'from-amber-600 via-amber-400 to-amber-600',
      bgPaper: 'from-[#fffdf7] via-[#fffbf0] to-[#fff8eb]',
      primaryText: 'text-amber-950',
      accentColor: '#92400e',
      badgeBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950',
      ribbonText: 'text-amber-700',
      accentBorder: 'border-amber-400',
      watermarkColor: 'rgba(217, 119, 6, 0.05)'
    },
    emerald_prestige: {
      name: 'الزمردي الأكاديمي (Emerald Prestige)',
      borderColor: '#047857',
      borderOuter: '#059669',
      goldGradient: 'from-emerald-700 via-emerald-500 to-emerald-700',
      bgPaper: 'from-[#f6fcf8] via-[#eef9f2] to-[#f4faf6]',
      primaryText: 'text-emerald-950',
      accentColor: '#065f46',
      badgeBg: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white',
      ribbonText: 'text-emerald-700',
      accentBorder: 'border-emerald-400',
      watermarkColor: 'rgba(5, 150, 105, 0.05)'
    },
    sapphire_luxury: {
      name: 'الياقوتي الإمبراطوري (Imperial Sapphire)',
      borderColor: '#1d4ed8',
      borderOuter: '#2563eb',
      goldGradient: 'from-blue-700 via-indigo-500 to-blue-700',
      bgPaper: 'from-[#f8faff] via-[#f0f5ff] to-[#f5f8ff]',
      primaryText: 'text-slate-950',
      accentColor: '#1e40af',
      badgeBg: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 text-white',
      ribbonText: 'text-blue-700',
      accentBorder: 'border-blue-400',
      watermarkColor: 'rgba(37, 99, 235, 0.05)'
    }
  };

  const currentTheme = themes[themeStyle];

  // Award Presets
  const awardPresets = [
    { title: 'نجم المحاضرة الذهبي والمركز الأول', stars: 5, points: 25, reason: 'تقديراً لحصوله على المركز الأول والتفوق الاستثنائي في تفاعل وأنشطة المحاضرة' },
    { title: 'النجم الفضي والمركز الثاني', stars: 4, points: 20, reason: 'تقديراً لحصوله على المركز الثاني والإتقان الرائع للمهام التدريبية' },
    { title: 'النجم البرونزي والمركز الثالث', stars: 4, points: 15, reason: 'تقديراً لحصوله على المركز الثالث والتفاعل المتميز في قاعة التدريب' },
    { title: 'فارس التميز الأكاديمي والعملي', stars: 5, points: 30, reason: 'تقديراً للحلول المبتكرة والتطبيق العملي الاحترافي على أجهزة المعمل' },
    { title: 'وسام الانضباط والحضور المبكر', stars: 5, points: 20, reason: 'تقديراً لالتزامه النموذجي بالمواعيد، وحسن السمت والمشاركة الفعالة' }
  ];

  // Save certificate to database
  const handleSaveToCertificates = async () => {
    try {
      const branch = branches.find(b => b.id === activeBranchId) || branches[0];
      const newCertData = {
        certificateNumber: serialNumber,
        serialNumber: serialNumber,
        traineeId: currentTrainee?.id || 'manual',
        traineeName: currentTrainee?.fullName || 'متدرب متميز',
        courseId: currentCourse?.id || 'manual',
        courseName: currentCourse?.name || 'الدورة التدريبية',
        branchId: branch?.id || 'b1',
        issueDate: lectureDate,
        grade: `${awardTitle} (${pointsEarned} نقطة)`,
        durationText: lectureTitle,
        trainerName,
        managerName,
        templateTheme: themeStyle,
        qrPayload: serialNumber
      };

      await api.createCertificate(newCertData);
      setIsSaved(true);
      showToast('تم حفظ شهادة التقدير بنجاح في سجل الشهادات', 'success');
      if (onCertificateIssued) {
        onCertificateIssued(newCertData);
      }
      refreshAll();
    } catch (err: any) {
      console.error('Error saving lecture certificate:', err);
      showToast('تم إنشاء الشهادة بنجاح وجاهزة للطباعة', 'info');
    }
  };

  // Direct Print handler
  const handlePrint = () => {
    if (!isSaved) {
      handleSaveToCertificates();
    }
    
    // Play celebratory sound & confetti
    audioService.playClapping(2.5);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch {}

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1200px';
    printFrame.style.height = '850px';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc || !certRef.current) {
      window.print();
      return;
    }

    const certificateHtml = certRef.current.outerHTML;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>شهادة شكر وتقدير - ${currentTrainee?.fullName || 'متدرب'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 landscape;
              margin: 4mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: 'Cairo', system-ui, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              box-sizing: border-box;
            }
          </style>
          <link rel="stylesheet" href="${window.location.origin}/src/index.css" />
        </head>
        <body>
          <div style="width: 100%; max-width: 1060px; margin: 0 auto; padding: 2mm;">
            ${certificateHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 1000);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    frameDoc.close();
  };

  // Download High-Res Image
  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      if (!isSaved) handleSaveToCertificates();
      const canvas = await captureElementToCanvas(certRef.current);
      const link = document.createElement('a');
      link.download = `شهادة_تقدير_${currentTrainee?.fullName?.replace(/\s+/g, '_') || 'متدرب'}_${serialNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      showToast('تم تحميل الشهادة عالية الدقة بنجاح', 'success');
      audioService.playClapping(2);
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('حدث خطأ أثناء تحميل الصورة', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const phone = currentTrainee?.phone || currentTrainee?.parentPhone;
    const cleanPhone = phone?.replace(/[^0-9]/g, '');
    const message = `تهانينا الحارة من مركز النجاح للتدريب والاستشارات! 🌟🏆\n\nنهنئ المتدرب المتميز: *${currentTrainee?.fullName}* بمناسبة تفوقه وحصوله على لقب: *${awardTitle}* ⭐\n\n📌 الدورة: ${currentCourse?.name}\n📌 المحاضرة: ${lectureTitle}\n📌 رصيد النقاط المكتسب: ${pointsEarned} نقطة تميز\n📌 رقم الاعتماد المرجعي: ${serialNumber}\n\nنتمنى لك دوام التألق والريادة دائماً! 🎓🎉`;

    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-7xl w-full my-auto max-h-[96vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header Modal Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                إصدار وتوثيق شهادة تقدير
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full">
                  طراز ملكي
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                شهادة معتمدة بالاسم الرباعي، نجوم التميز، نقاط المحاضرة، الأختام الرسمية والباركود الذكي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns (Controls on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/50">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Trainee & Course Selection Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>بيانات المتدرب والدورة</span>
              </h3>

              {/* Course Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الدورة التدريبية:
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Trainee Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المتدرب المكرم:
                </label>
                <select
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {trainees.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (كود: {t.code})
                    </option>
                  ))}
                </select>
                {currentTrainee && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs">
                    <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center font-black text-amber-900 dark:text-amber-100 overflow-hidden shrink-0">
                      {currentTrainee.photoUrl ? (
                        <img src={currentTrainee.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        currentTrainee.fullName?.charAt(0) || '🎓'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-slate-100 truncate">{currentTrainee.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">الكود: {currentTrainee.code || '—'} {currentTrainee.phone ? `• هاتف: ${currentTrainee.phone}` : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lecture & Distinction Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>تفاصيل التميز ولقب المحاضرة</span>
              </h3>

              {/* Award Title / Preset Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لقب التكريم:
                </label>
                <input
                  type="text"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="مثال: نجم المحاضرة الذهبي والمركز الأول"
                />

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {awardPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAwardTitle(p.title);
                        setStarsCount(p.stars);
                        setPointsEarned(p.points);
                        setCustomPraise(p.reason);
                      }}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 transition-colors font-semibold"
                    >
                      {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lecture Title & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان / رقم المحاضرة:
                  </label>
                  <input
                    type="text"
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ المحاضرة:
                  </label>
                  <input
                    type="date"
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Points & Stars Count */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نقاط المحاضرة المكتسبة:
                  </label>
                  <input
                    type="number"
                    value={pointsEarned}
                    onChange={(e) => setPointsEarned(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عدد نجوم التميز:
                  </label>
                  <select
                    value={starsCount}
                    onChange={(e) => setStarsCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم - امتياز)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 نجوم - متقدم)</option>
                    <option value={3}>⭐⭐⭐ (3 نجوم - جيد جداً)</option>
                  </select>
                </div>
              </div>

              {/* Praise Sentence */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص عبارة التقدير والشكر:
                </label>
                <textarea
                  rows={2}
                  value={customPraise}
                  onChange={(e) => setCustomPraise(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
                />
              </div>

              {/* Visual Theme Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  طراز الشهادة:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(themes) as (keyof typeof themes)[]).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeStyle(key)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                        themeStyle === key 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {key === 'royal_gold' ? '👑 ذهبي ملكي' : key === 'emerald_prestige' ? '🌿 زمردي راقي' : '💎 ياقوتي فاخر'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar inside panel */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة فوراً / حفظ PDF</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isExporting}
                  className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isExporting ? 'جاري التحميل...' : 'تحميل صورة PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="إرسال تهنئة فورية لولي الأمر عبر الواتساب"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال واتساب</span>
                </button>
              </div>

              {isSaved && (
                <div className="text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم حفظ الشهادة وتوثيقها في سجل الشهادات الرسمي</span>
                </div>
              )}
            </div>
          </div>

          {/* Live High-Fidelity Preview Column (7 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-start overflow-x-auto pb-4">
            <div className="w-full flex items-center justify-between mb-2 px-1 text-xs text-slate-500">
              <span className="font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                معاينة الشهادة المطبوعة (A4 Landscape بدقة عالية)
              </span>
              <span className="font-mono text-[10px]">الرقم المرجعي: {serialNumber}</span>
            </div>

            {/* THE LUXURY CERTIFICATE CANVAS SHEET */}
            <div
              ref={certRef}
              dir="rtl"
              className={`w-full max-w-[880px] aspect-[1.414/1] bg-gradient-to-br ${currentTheme.bgPaper} text-slate-900 rounded-3xl p-6 sm:p-9 shadow-2xl relative border-[8px] sm:border-[12px] border-double select-none overflow-hidden flex flex-col justify-between`}
              style={{ 
                borderColor: currentTheme.borderColor,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 40px rgba(217, 119, 6, 0.04)'
              }}
            >
              {/* Background Watermark Crest */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-4"
                style={{
                  backgroundImage: `radial-gradient(circle at center, ${currentTheme.accentColor} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* 4 Ornate Antique Corner Rosettes */}
              <div className="absolute top-2 left-2 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.borderColor }}>❖</div>
              <div className="absolute top-2 right-2 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.borderColor }}>❖</div>
              <div className="absolute bottom-2 left-2 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.borderColor }}>❖</div>
              <div className="absolute bottom-2 right-2 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.borderColor }}>❖</div>

              {/* Inner Fine Gold Filigree Border */}
              <div className="absolute inset-3 sm:inset-4 border border-dashed rounded-2xl pointer-events-none" style={{ borderColor: currentTheme.borderOuter, opacity: 0.6 }} />

              {/* CERTIFICATE HEADER */}
              <div className="relative z-10 flex items-center justify-between border-b-2 pb-3 mb-2" style={{ borderColor: currentTheme.accentBorder }}>
                {/* Right: Center Name */}
                <div className="text-right">
                  <h1 className="text-lg sm:text-2xl font-black text-slate-950 font-serif tracking-tight">
                    مركز النجاح للتدريب والاستشارات
                  </h1>
                  <p className="text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider" style={{ color: currentTheme.accentColor }}>
                    NAGAH TRAINING &amp; CONSULTING CENTER
                  </p>
                  <p className="text-[9px] text-slate-600 font-medium">
                    منظومة التدريب الذكية المعتمدة • ترخيص مهني رقم 4402/2026
                  </p>
                </div>

                {/* Center: Center Logo & Emblem */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 border-2 shadow-md flex items-center justify-center shrink-0 ring-4 ring-amber-400/20" style={{ borderColor: currentTheme.borderColor }}>
                    <img src="/logo.svg" alt="مركز النجاح" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Left: Ref & Date */}
                <div className="text-left font-mono text-[10px] sm:text-[11px] text-slate-600 space-y-0.5">
                  <div>Ref: <span className="font-bold text-slate-950">{serialNumber}</span></div>
                  <div>Date: <span className="font-bold text-slate-950">{lectureDate}</span></div>
                  <div className="text-[9px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ معتمدة رسمياً
                  </div>
                </div>
              </div>

              {/* CERTIFICATE TITLE BANNER */}
              <div className="relative z-10 text-center my-1.5 sm:my-2">
                <div className="inline-flex items-center gap-2 px-6 sm:px-10 py-1.5 sm:py-2 rounded-full font-black text-sm sm:text-lg tracking-wide uppercase shadow-sm border border-amber-400" style={{ backgroundColor: '#fff', color: currentTheme.accentColor }}>
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                  <span>شهادة شكر وتقدير وتفوق في محاضرة</span>
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-[9px] sm:text-[10px] mt-1 font-mono uppercase tracking-widest font-black text-slate-500">
                  CERTIFICATE OF LECTURE EXCELLENCE &amp; ACADEMIC MERIT
                </p>
              </div>

              {/* CERTIFICATE BODY & RECIPIENT */}
              <div className="relative z-10 text-center space-y-2 my-1 px-4">
                <p className="text-slate-700 font-bold text-xs sm:text-sm">
                  يسر إدارة المركز والمحاضر المشرف منح هذه الشهادة بكل فخر واعتزاز للمتدرب:
                </p>

                {/* Trainee Name Calligraphy Banner */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {currentTrainee?.photoUrl && (
                    <img
                      src={currentTrainee.photoUrl}
                      alt={currentTrainee.fullName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md ring-2 ring-amber-400/40 shrink-0"
                      style={{ borderColor: currentTheme.borderColor }}
                    />
                  )}
                  <div>
                    <h2 
                      className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-serif border-b-2 px-6 pb-1 inline-block"
                      style={{ borderColor: currentTheme.borderColor, color: '#090d16' }}
                    >
                      {currentTrainee?.fullName || 'اسم المتدرب المتميز'}
                    </h2>
                    <div className="mt-1">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white/90 border border-slate-300 px-3 py-0.5 rounded-full shadow-2xs">
                        كود المتدرب: {currentTrainee?.code || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason of Honor & Lecture Details */}
                <p className="text-slate-800 text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-relaxed pt-1">
                  {customPraise} بمناسبة حصوله على استحقاق:
                </p>

                {/* Award Title Ribbon */}
                <div className="inline-block my-1">
                  <div className={`px-5 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-md border flex items-center justify-center gap-2 ${currentTheme.badgeBg}`}>
                    <Crown className="w-4 h-4 text-amber-200 fill-amber-200" />
                    <span>{awardTitle}</span>
                    <Crown className="w-4 h-4 text-amber-200 fill-amber-200" />
                  </div>
                </div>

                {/* Course & Lecture Details Card */}
                <div className="bg-white/85 border border-amber-300/80 rounded-2xl p-2.5 max-w-lg mx-auto shadow-2xs text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>الدورة التدريبية:</span>
                    <span className="text-amber-900 font-black">{currentCourse?.name || 'برنامج التدريب العملي'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>المحاضرة: <b className="text-slate-900">{lectureTitle}</b></span>
                    <span className="font-mono">تاريخ: {lectureDate}</span>
                  </div>
                </div>

                {/* Stars and Score Badge */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="flex items-center gap-1 bg-amber-100/90 border border-amber-400 px-3 py-1 rounded-xl shadow-2xs">
                    {Array.from({ length: starsCount }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                    <span className="text-xs font-black text-amber-950 mr-1.5">{starsCount} نجوم</span>
                  </div>

                  <div className="bg-slate-950 text-amber-400 font-mono text-xs font-black px-3.5 py-1 rounded-xl shadow-xs border border-amber-500/40">
                    +{pointsEarned} نقطة تميز تفاعلية ⚡
                  </div>
                </div>
              </div>

              {/* CERTIFICATE FOOTER: SIGNATURES, SEAL & QR */}
              <div className="relative z-10 grid grid-cols-3 gap-4 pt-3 border-t-2 items-end text-center" style={{ borderColor: currentTheme.accentBorder }}>
                
                {/* Trainer Signature */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">المحاضر المشرف على القاعة:</span>
                  <p className="font-black text-slate-900 text-xs sm:text-sm">{trainerName}</p>
                  {settings?.trainerSignatureUrl ? (
                    <img src={settings.trainerSignatureUrl} alt="توقيع المحاضر" className="w-20 h-10 object-contain" />
                  ) : (
                    <div className="w-28 border-b-2 border-slate-400 pt-4" />
                  )}
                  <p className="text-[9px] text-slate-400">التوقيع والاعتماد</p>
                </div>

                {/* Center Official Seal & Verification QR */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center gap-2">
                    <OfficialSealBadge sealUrl={settings?.sealImageUrl} className="w-16 h-16 sm:w-18 sm:h-18 shadow-xs" />
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-14 h-14 object-contain rounded-lg border border-slate-300 p-0.5 bg-white shadow-xs" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                        <QrIcon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-amber-800 tracking-wider">
                    الختم الرسمي والتوثيق الذكي المعتمد
                  </span>
                </div>

                {/* Managing Director Signature */}
                <div className="space-y-1 text-left">
                  <span className="text-[10px] text-slate-500 font-bold block">اعتماد مدير عام المركز:</span>
                  <p className="font-black text-slate-900 text-xs sm:text-sm">{managerName}</p>
                  {settings?.signatureImageUrl ? (
                    <img 
                      src={settings.signatureImageUrl} 
                      alt="توقيع الإدارة" 
                      className="w-24 h-10 object-contain ml-auto" 
                      style={{ mixBlendMode: 'multiply' }} 
                    />
                  ) : (
                    <div className="w-28 border-b-2 border-slate-400 pt-4 ml-auto" />
                  )}
                  <p className="text-[9px] text-slate-400">الاعتماد والختم النهائي</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
