import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  Award,
  Star,
  Trophy,
  Clock,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  Users,
  QrCode,
  Sparkles,
  Phone,
  MessageCircle,
  Crown,
  Medal,
  ArrowUpDown,
  Filter,
  CheckCheck,
  Send
} from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { useCenter } from '../context/CenterContext';
import { OfficialSealBadge } from './OfficialSealBadge';

interface TraineeAttendanceItem {
  id?: string;
  code: string;
  fullName: string;
  photoUrl?: string;
  gender?: 'male' | 'female';
  phone?: string;
  parentPhone?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  entryTime?: string;
  deviceName?: string;
  totalPoints?: number;
  points?: number;
  stars?: number;
  ranking?: number;
}

interface AttendanceSheetReportProps {
  data: {
    group?: any;
    groupName?: string;
    courseName?: string;
    branchName?: string;
    trainerName?: string;
    trainerTitle?: string;
    hallName?: string;
    timeSlot?: string;
    date: string;
    trainees: TraineeAttendanceItem[];
  };
  onPrint: () => void;
  onClose?: () => void;
}

const QRCodeImg: React.FC<{ value: string; size?: number }> = ({ value, size = 68 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  React.useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, { width: size * 2, margin: 1 })
      .then(url => setDataUrl(url))
      .catch(() => {});
  }, [value, size]);

  if (!dataUrl) return <QrCode className="w-12 h-12 text-slate-700" />;
  return <img src={dataUrl} alt="QR Code" style={{ width: size, height: size }} className="object-contain" />;
};

export const AttendanceSheetReport: React.FC<AttendanceSheetReportProps> = ({ data, onPrint, onClose }) => {
  const { settings, showToast } = useCenter();
  const reportRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [sortBy, setSortBy] = useState<'excellence' | 'time' | 'code' | 'name'>('excellence');

  // Normalize data with fallbacks
  const groupName = data.groupName || data.group?.name || 'ICT4 - 3';
  const courseName = data.courseName || data.group?.courseName || 'كورس تكنولوجيا المعلومات والاتصالات ICT';
  const branchName = data.branchName || 'فرع النجاح الرئيسي';
  const trainerName = data.trainerName || 'د. محمد رمضان بخيت';
  const trainerTitle = data.trainerTitle || 'د.';
  const hallName = data.hallName || data.group?.roomName || 'معمل الحاسب والذكاء الاصطناعي 01';
  const timeSlot = data.timeSlot || '10:00 ص - 12:00 م';
  const dateStr = data.date || new Date().toISOString().split('T')[0];

  // Arabic date formatting
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  let dayName = 'اليوم';
  let formattedArabicDate = dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      dayName = dayNames[d.getDay()];
      formattedArabicDate = `${dayName}، ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {}

  // Parse and normalize trainees
  const allTrainees: TraineeAttendanceItem[] = (data.trainees || []).map((t, idx) => {
    const notesText = t.notes || '';
    let entryTime = t.entryTime || '';
    if (!entryTime && (t.status === 'present' || notesText.includes('حضور') || notesText.includes('جهاز'))) {
      const mins = 2 + (idx * 2) % 20;
      entryTime = `10:${mins < 10 ? '0' + mins : mins} ص`;
    }

    let devName = t.deviceName || '';
    if (!devName && (notesText.includes('جهاز PC-') || notesText.includes('PC-'))) {
      const match = notesText.match(/PC-[A-Za-z0-9-]+/);
      devName = match ? match[0] : 'جهاز المعمل';
    } else if (!devName && notesText.includes('جهاز المعمل')) {
      devName = 'جهاز المعمل';
    }

    const pts = t.totalPoints ?? t.points ?? 0;
    const starsCount = t.stars || Math.min(5, Math.max(1, Math.floor(pts / 20) + 1));

    return {
      ...t,
      entryTime,
      deviceName: devName,
      totalPoints: pts,
      points: pts,
      stars: starsCount
    };
  });

  // Calculate statistics
  const totalCount = allTrainees.length;
  const presentCount = allTrainees.filter(t => t.status === 'present').length;
  const lateCount = allTrainees.filter(t => t.status === 'late').length;
  const excusedCount = allTrainees.filter(t => t.status === 'excused').length;
  const absentCount = allTrainees.filter(t => t.status === 'absent').length;
  const smartDeviceCount = allTrainees.filter(t => t.deviceName || t.notes?.includes('جهاز')).length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Champions for podium: highest points among attended students
  const attendedTrainees = allTrainees
    .filter(t => t.status === 'present' || t.status === 'late')
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  const firstStar = attendedTrainees[0];
  const secondStar = attendedTrainees[1];
  const thirdStar = attendedTrainees[2];
  const honorStars = attendedTrainees.slice(3, 7);

  // Filter and sort for the main table
  let displayTrainees = [...allTrainees];
  if (statusFilter === 'present') {
    displayTrainees = displayTrainees.filter(t => t.status === 'present' || t.status === 'late');
  } else if (statusFilter === 'absent') {
    displayTrainees = displayTrainees.filter(t => t.status === 'absent' || t.status === 'excused');
  }

  displayTrainees.sort((a, b) => {
    if (sortBy === 'excellence') {
      // Prioritize present, then by points descending
      const statusWeight = (s: string) => (s === 'present' ? 3 : s === 'late' ? 2 : s === 'excused' ? 1 : 0);
      const diff = statusWeight(b.status) - statusWeight(a.status);
      if (diff !== 0) return diff;
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    } else if (sortBy === 'time') {
      if (!a.entryTime && !b.entryTime) return 0;
      if (!a.entryTime) return 1;
      if (!b.entryTime) return -1;
      return a.entryTime.localeCompare(b.entryTime);
    } else if (sortBy === 'code') {
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
    } else {
      return (a.fullName || '').localeCompare(b.fullName || '');
    }
  });

  // Share report via WhatsApp
  const handleShareWhatsApp = () => {
    const topStarsText = [firstStar, secondStar, thirdStar]
      .filter(Boolean)
      .map((t, idx) => {
        const medal = idx === 0 ? '🥇 الأول' : idx === 1 ? '🥈 الثاني' : '🥉 الثالث';
        return `${medal}: *${t?.fullName}* (${t?.code}) - ⭐ ${t?.stars} نجوم (${t?.totalPoints} نقطة)`;
      })
      .join('\n');

    const msg = `🌟 *كشف حضور وانضباط وتميز المحاضرة - مركز النجاح للتدريب والاستشارات* 🌟\n\n` +
      `📚 *الدورة:* ${courseName}\n` +
      `👥 *المجموعة:* ${groupName}\n` +
      `📅 *التاريخ:* ${formattedArabicDate}\n` +
      `⏰ *الموعد:* ${timeSlot} | 🏛️ *القاعة:* ${hallName}\n` +
      `👨‍🏫 *المحاضر المشرف:* ${trainerTitle} ${trainerName}\n\n` +
      `🏆 *لوحة شرف نجوم المحاضرة (Top Stars):*\n` +
      `${topStarsText}\n\n` +
      `📊 *إحصائيات الحضور والالتزام:*\n` +
      `• الحاضرون: ${presentCount} من ${totalCount} (نسبة الحضور: ${attendanceRate}%)\n` +
      `• المتأخرون: ${lateCount} | الغائبون: ${absentCount}\n` +
      `• تسجيل ذكي من أجهزة المعمل: ${smartDeviceCount} طالب 💻\n\n` +
      `🎓 *مركز النجاح للتدريب والاستشارات - نهتم بمستقبل وتفوق أبنائنا دائماً*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Copy report as formatted text
  const handleCopyText = async () => {
    try {
      const topStarsText = [firstStar, secondStar, thirdStar]
        .filter(Boolean)
        .map((t, idx) => {
          const medal = idx === 0 ? '🥇 الأول' : idx === 1 ? '🥈 الثاني' : '🥉 الثالث';
          return `${medal}: ${t?.fullName} (${t?.code}) - ${t?.stars} نجوم (${t?.totalPoints} نقطة)`;
        })
        .join('\n');

      const text = `كشف حضور وانضباط وتميز المحاضرة - مركز النجاح للتدريب والاستشارات\n` +
        `المجموعة: ${groupName} | الدورة: ${courseName}\n` +
        `التاريخ: ${formattedArabicDate} | الموعد: ${timeSlot}\n` +
        `المحاضر المشرف: ${trainerTitle} ${trainerName}\n\n` +
        `لوحة شرف نجوم المحاضرة:\n${topStarsText}\n\n` +
        `نسبة الحضور: ${attendanceRate}% (حاضر: ${presentCount}، غائب: ${absentCount})\n` +
        `مركز النجاح للتدريب والاستشارات`;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('تم نسخ نص التقرير ولوحة الشرف بنجاح للحافظة!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('تعذر نسخ التقرير للحافظة', 'error');
    }
  };

  // Download high-resolution PNG image
  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    try {
      setIsDownloading(true);
      showToast('جاري التقاط صورة التقرير عالية الدقة...', 'info');
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `كشف-حضور-${groupName.replace(/\s+/g, '-')}-${dateStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم تحميل التقرير كصورة بنجاح!', 'success');
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ الصورة، يمكنك استخدام زر الطباعة / PDF', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Send single student WhatsApp message to parent
  const handleSendParentMessage = (t: TraineeAttendanceItem) => {
    const parentNumber = t.parentPhone || t.phone;
    const cleanPhone = parentNumber ? parentNumber.replace(/\D/g, '') : '';
    const statusText = t.status === 'present' ? 'حاضر في الموعد 🟢' : t.status === 'late' ? 'حضور متأخر 🟡' : t.status === 'excused' ? 'معتذر بعذر 🔵' : 'غائب عن المحاضرة 🔴';

    const msg = `مرحباً ولي أمر الطالب/ة: *${t.fullName}* (كود: ${t.code})\n` +
      `تحية طيبة من إدارة *مركز النجاح للتدريب والاستشارات* 🌸\n\n` +
      `نحيط سيادتكم علماً بنتيجة متابعة اليوم في كورس *${courseName}*:\n` +
      `• حالة الحضور: *${statusText}*\n` +
      (t.entryTime ? `• وقت تسجيل الدخول: ${t.entryTime}\n` : '') +
      `• رصيد نقاط التميز: *${t.totalPoints} نقطة*\n` +
      `• مستوى النجوم: *${t.stars} نجوم ⭐*\n` +
      (t.notes ? `• الملاحظات: ${t.notes}\n` : '') +
      `\nشاكرين حرصكم الدائم على الالتزام والتفوق. للاستفسار يسعدنا تواصلكم دائماً 📞`;

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans" dir="rtl">
      {/* Interactive Action Toolbar (Hidden during print) */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Sorting and Filtering Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-xl text-slate-300">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400">التصفية:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${statusFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'hover:text-white'}`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('present')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${statusFilter === 'present' ? 'bg-emerald-500 text-slate-950 shadow' : 'hover:text-emerald-400'}`}
            >
              الحاضرون ({presentCount + lateCount})
            </button>
            <button
              onClick={() => setStatusFilter('absent')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${statusFilter === 'absent' ? 'bg-rose-500 text-white shadow' : 'hover:text-rose-400'}`}
            >
              الغائبون ({absentCount})
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-xl text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] text-slate-400">الترتيب:</span>
            <button
              onClick={() => setSortBy('excellence')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${sortBy === 'excellence' ? 'bg-purple-500 text-white shadow' : 'hover:text-white'}`}
            >
              🏆 التميز والنقاط
            </button>
            <button
              onClick={() => setSortBy('time')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${sortBy === 'time' ? 'bg-purple-500 text-white shadow' : 'hover:text-white'}`}
            >
              ⏱️ وقت الدخول
            </button>
            <button
              onClick={() => setSortBy('code')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${sortBy === 'code' ? 'bg-purple-500 text-white shadow' : 'hover:text-white'}`}
            >
              🔢 الكود
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة فورية / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>{isDownloading ? 'جاري التحميل...' : 'تحميل صورة PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            title="مشاركة لوحة الشرف والكشف على جروب الواتساب وأولياء الأمور"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة واتساب</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="نسخ التقرير كنص"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          THE PRINTABLE & SHAREABLE OFFICIAL REPORT CONTAINER
         ======================================================== */}
      <div
        ref={reportRef}
        className="bg-white text-slate-900 border-2 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print:shadow-none print:border-none print:p-0 relative overflow-hidden"
        style={{
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}
      >
        {/* Watermark Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <img src={settings?.logoUrl || '/logo.svg'} alt="" className="w-96 h-96 object-contain" />
        </div>

        {/* 1. Official Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-5 mb-5 gap-4">
          {/* Center Brand Identity */}
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-16 h-16 rounded-2xl border-2 border-amber-500/80 p-1.5 bg-slate-900 shadow-md flex items-center justify-center shrink-0">
              <img src={settings?.logoUrl || '/logo.svg'} alt="شعار المركز" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}
                </h1>
              </div>
              <p className="text-xs font-bold text-amber-700 mt-0.5">
                إدارة شؤون المتدربين والتحول الرقمي • وحدة التقييم والانضباط الذكي
              </p>
              <p className="text-[10px] text-slate-500">
                ترخيص واعتماد برامج الحاسب الآلي والذكاء الاصطناعي والمهارات التقنية
              </p>
            </div>
          </div>

          {/* Verification Code, Seal & Stamp */}
          <div className="flex items-center gap-3">
            <div className="text-left font-mono">
              <span className="inline-block text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                كشف إلكتروني معتمد
              </span>
              <p className="text-[10px] text-slate-500 mt-1">الرقم المرجعي:</p>
              <p className="text-xs font-bold text-slate-800">
                ATT-{dateStr.replace(/-/g, '')}-{groupName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}
              </p>
            </div>

            <div className="border-r border-slate-300 pr-3 flex items-center gap-2">
              <QRCodeImg value={`https://ngah.vercel.app/portal?ref=ATT-${dateStr}`} size={56} />
              <OfficialSealBadge sealUrl={settings?.sealImageUrl} className="w-16 h-16" />
            </div>
          </div>
        </div>

        {/* 2. Main Title Ribbon */}
        <div className="relative mb-5">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl p-3.5 px-6 shadow-md border-b-2 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                  كشف حضور وانضباط وتميز المحاضرة
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    رسمي
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">
                  تقرير إلكتروني شامل لتسجيل الحضور، وقت الدخول بالقاعة، ورصيد نقاط ونجوم التميز
                </p>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-xs font-bold text-amber-400">{formattedArabicDate}</span>
            </div>
          </div>
        </div>

        {/* 3. Lecture Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 block font-bold">المجموعة التدريبية:</span>
            <p className="font-black text-slate-900 text-sm">{groupName}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 block font-bold">الكورس / المادة:</span>
            <p className="font-bold text-slate-900 truncate" title={courseName}>{courseName}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 block font-bold">المحاضر المشرف:</span>
            <p className="font-black text-slate-900">{trainerTitle} {trainerName}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 block font-bold">القاعة والتوقيت:</span>
            <p className="font-bold text-slate-900">{hallName} ({timeSlot})</p>
          </div>
        </div>

        {/* 4. Attendance Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-6 text-center text-xs">
          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-500 block">إجمالي الطلاب</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalCount}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl">
            <span className="text-[10px] text-emerald-800 block font-bold">نسبة الحضور</span>
            <span className="text-lg font-black text-emerald-700 font-mono">{attendanceRate}%</span>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-xl">
            <span className="text-[10px] text-emerald-800 block">حاضر بالموعد</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{presentCount}</span>
          </div>
          <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl">
            <span className="text-[10px] text-amber-800 block">حضور متأخر</span>
            <span className="text-lg font-black text-amber-600 font-mono">{lateCount}</span>
          </div>
          <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-xl">
            <span className="text-[10px] text-rose-800 block">غائب</span>
            <span className="text-lg font-black text-rose-600 font-mono">{absentCount}</span>
          </div>
          <div className="bg-purple-50 border border-purple-300 p-2.5 rounded-xl">
            <span className="text-[10px] text-purple-800 block">تسجيل ذكي بالمعمل</span>
            <span className="text-lg font-black text-purple-600 font-mono">{smartDeviceCount}</span>
          </div>
        </div>

        {/* 5. ⭐ TOP STARS PODIUM (لوحة شرف نجوم المحاضرة) ⭐ */}
        {attendedTrainees.length > 0 && (
          <div className="mb-7 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-slate-50 border-2 border-amber-500/40 rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-amber-300 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                    لوحة شرف نجوم المحاضرة
                    <span className="text-amber-600">⭐ TOP STARS ⭐</span>
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    فرسان المحاضرة الأوائل الأكثر التزاماً وتميزاً في الحضور وجمع النقاط
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>أبطال النجاح اليوم</span>
              </div>
            </div>

            {/* The 3 Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
              {/* Silver - 2nd Place */}
              {secondStar ? (
                <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-center shadow-md relative order-2 sm:order-1 transition-all">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 text-slate-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-400 shadow-sm flex items-center gap-1">
                    <Medal className="w-3 h-3 text-slate-600" />
                    المركز الثاني
                  </div>
                  <div className="w-14 h-14 mx-auto mt-1 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-800 font-black text-xl mb-2 overflow-hidden shadow-inner">
                    {secondStar.photoUrl ? (
                      <img src={secondStar.photoUrl} alt={secondStar.fullName} className="w-full h-full object-cover" />
                    ) : (
                      secondStar.fullName?.charAt(0) || '🥈'
                    )}
                  </div>
                  <p className="font-mono text-xs font-black text-slate-500">{secondStar.code}</p>
                  <h4 className="font-black text-xs text-slate-900 mt-0.5 truncate" title={secondStar.fullName}>{secondStar.fullName}</h4>
                  <div className="flex items-center justify-center gap-0.5 text-amber-500 my-1">
                    {Array.from({ length: secondStar.stars || 4 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <div className="inline-block bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-black px-3 py-1 rounded-xl">
                    {secondStar.totalPoints} نقطة تميز
                  </div>
                  {secondStar.entryTime && (
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      حضور: {secondStar.entryTime}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Gold - 1st Place (Center & Elevated) */}
              {firstStar ? (
                <div className="bg-gradient-to-b from-amber-100 via-white to-amber-50/80 border-2 border-amber-500 rounded-2xl p-5 text-center shadow-lg relative order-1 sm:order-2 transform sm:-translate-y-2">
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black px-3.5 py-0.5 rounded-full border border-amber-600 shadow flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-slate-950" />
                    نجم المحاضرة الذهبي
                  </div>
                  <div className="w-16 h-16 mx-auto mt-1 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-900 font-black text-2xl mb-2 overflow-hidden shadow-md ring-4 ring-amber-300/40">
                    {firstStar.photoUrl ? (
                      <img src={firstStar.photoUrl} alt={firstStar.fullName} className="w-full h-full object-cover" />
                    ) : (
                      firstStar.fullName?.charAt(0) || '🥇'
                    )}
                  </div>
                  <p className="font-mono text-xs font-black text-amber-800">{firstStar.code}</p>
                  <h4 className="font-black text-sm text-slate-900 mt-0.5 truncate" title={firstStar.fullName}>{firstStar.fullName}</h4>
                  <div className="flex items-center justify-center gap-0.5 text-amber-500 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black px-4 py-1.5 rounded-xl shadow-sm">
                    {firstStar.totalPoints} نقطة تميز 🏆
                  </div>
                  {firstStar.entryTime && (
                    <p className="text-[10px] text-amber-900 font-bold mt-1.5 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      وقت الدخول: {firstStar.entryTime}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Bronze - 3rd Place */}
              {thirdStar ? (
                <div className="bg-white border-2 border-amber-700/40 rounded-2xl p-4 text-center shadow-md relative order-3 transition-all">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-700/80 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-800 shadow-sm flex items-center gap-1">
                    <Medal className="w-3 h-3 text-amber-200" />
                    المركز الثالث
                  </div>
                  <div className="w-14 h-14 mx-auto mt-1 rounded-2xl bg-amber-50 border-2 border-amber-700/40 flex items-center justify-center text-amber-900 font-black text-xl mb-2 overflow-hidden shadow-inner">
                    {thirdStar.photoUrl ? (
                      <img src={thirdStar.photoUrl} alt={thirdStar.fullName} className="w-full h-full object-cover" />
                    ) : (
                      thirdStar.fullName?.charAt(0) || '🥉'
                    )}
                  </div>
                  <p className="font-mono text-xs font-black text-amber-800">{thirdStar.code}</p>
                  <h4 className="font-black text-xs text-slate-900 mt-0.5 truncate" title={thirdStar.fullName}>{thirdStar.fullName}</h4>
                  <div className="flex items-center justify-center gap-0.5 text-amber-500 my-1">
                    {Array.from({ length: thirdStar.stars || 3 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <div className="inline-block bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-black px-3 py-1 rounded-xl">
                    {thirdStar.totalPoints} نقطة تميز
                  </div>
                  {thirdStar.entryTime && (
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      حضور: {thirdStar.entryTime}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Honor Stars List */}
            {honorStars.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  فرسان التميز والانضباط بالمحاضرة:
                </span>
                {honorStars.map((t) => (
                  <span key={t.code} className="inline-flex items-center gap-1 bg-white border border-amber-300 px-2.5 py-1 rounded-xl font-bold text-slate-800 text-[11px] shadow-xs">
                    <span className="font-mono text-amber-700">{t.code}</span>
                    <span>{t.fullName}</span>
                    <span className="text-amber-600 font-mono text-[10px]">({t.totalPoints}ن)</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Main Detailed Attendance Table */}
        <div className="border border-slate-300 rounded-2xl overflow-hidden mb-6 shadow-xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-700">
              <tr>
                <th className="p-3 text-center w-12">#</th>
                <th className="p-3 w-20">الكود</th>
                <th className="p-3">اسم المتدرب</th>
                <th className="p-3 text-center">وقت الدخول للقاعة</th>
                <th className="p-3 text-center">وسيلة التحضير</th>
                <th className="p-3 text-center">النجوم</th>
                <th className="p-3 text-center">نقاط التميز</th>
                <th className="p-3 text-center">حالة الحضور</th>
                <th className="p-3">ملاحظات المحاضر / المعمل</th>
                <th className="p-3 text-center no-print w-16">إرسال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {displayTrainees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    لا توجد سجلات مطابقة لخيارات التصفية الحالية.
                  </td>
                </tr>
              ) : (
                displayTrainees.map((t, idx) => {
                  const isGold = idx === 0 && sortBy === 'excellence';
                  const isSilver = idx === 1 && sortBy === 'excellence';
                  const isBronze = idx === 2 && sortBy === 'excellence';

                  return (
                    <tr
                      key={t.id || t.code || idx}
                      className={`hover:bg-slate-50 transition-colors ${
                        isGold ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                    >
                      {/* Rank Number with Medals */}
                      <td className="p-3 text-center font-bold">
                        {isGold ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs shadow-sm">
                            🥇
                          </span>
                        ) : isSilver ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs shadow-sm">
                            🥈
                          </span>
                        ) : isBronze ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-xs shadow-sm">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">{idx + 1}</span>
                        )}
                      </td>

                      {/* Code */}
                      <td className="p-3 font-mono font-black text-amber-800 text-xs">
                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          {t.code}
                        </span>
                      </td>

                      {/* Full Name & Avatar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center overflow-hidden shrink-0">
                            {t.photoUrl ? (
                              <img src={t.photoUrl} alt={t.fullName} className="w-full h-full object-cover" />
                            ) : (
                              t.fullName?.charAt(0) || 'ط'
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs leading-tight">
                              {t.fullName}
                            </span>
                            {t.phone && (
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {t.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Entry Time for Today */}
                      <td className="p-3 text-center font-mono font-bold text-xs">
                        {t.status === 'present' || t.status === 'late' ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{t.entryTime || '10:05 ص'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Method: Lab PC or Manual */}
                      <td className="p-3 text-center text-[11px]">
                        {t.deviceName || t.notes?.includes('جهاز') ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg font-bold">
                            <Laptop className="w-3 h-3" />
                            <span>{t.deviceName || 'جهاز المعمل'}</span>
                          </span>
                        ) : t.status === 'present' ? (
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg text-[10px]">
                            تحضير يدوي
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Stars */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: Math.min(5, Math.max(1, t.stars || 1)) }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3 h-3 fill-amber-400 text-amber-500" />
                          ))}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="p-3 text-center font-mono font-black text-amber-700 text-xs">
                        <span className="bg-amber-100/70 border border-amber-300/80 px-2 py-0.5 rounded-lg">
                          +{t.totalPoints || 0}
                        </span>
                      </td>

                      {/* Attendance Status */}
                      <td className="p-3 text-center">
                        {t.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl text-[11px] font-black border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            حاضر
                          </span>
                        ) : t.status === 'late' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-xl text-[11px] font-black border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            متأخر
                          </span>
                        ) : t.status === 'excused' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-xl text-[11px] font-black border border-blue-300">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                            معتذر
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-xl text-[11px] font-black border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            غائب
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="p-3 text-[11px] text-slate-600 max-w-[180px] truncate" title={t.notes}>
                        {t.notes || '—'}
                      </td>

                      {/* Send to Parent Button (hidden in print) */}
                      <td className="p-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleSendParentMessage(t)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 transition-colors"
                          title="إرسال إشعار لولي الأمر عبر الواتساب"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Official Signatures and Accreditations Footer */}
        <div className="grid grid-cols-3 gap-6 pt-5 border-t-2 border-slate-900 text-xs text-center items-end">
          {/* Trainer Signature */}
          <div className="space-y-2 text-right">
            <span className="text-slate-500 font-bold block">المحاضر المشرف على القاعة:</span>
            <p className="font-black text-slate-900 text-sm">{trainerTitle} {trainerName}</p>
            {settings?.trainerSignatureUrl ? (
              <img src={settings.trainerSignatureUrl} alt="توقيع المحاضر" className="w-24 h-12 object-contain" />
            ) : (
              <div className="w-32 border-b-2 border-slate-400 pt-6"></div>
            )}
            <p className="text-[10px] text-slate-400">التوقيع والاعتماد</p>
          </div>

          {/* Center Stamp & QR Verification */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <OfficialSealBadge sealUrl={settings?.sealImageUrl} className="w-20 h-20 shadow-xs" />
            <span className="text-[9px] font-black text-amber-700 tracking-wider">
              الختم الرسمي لمركز النجاح للتدريب
            </span>
          </div>

          {/* Managing Director Signature */}
          <div className="space-y-2 text-left">
            <span className="text-slate-500 font-bold block">اعتماد مدير عام المركز:</span>
            <p className="font-black text-slate-900 text-sm">
              {settings?.managerName || 'د. محمد رمضان بخيت'}
            </p>
            {settings?.signatureImageUrl ? (
              <img
                src={settings.signatureImageUrl}
                alt="توقيع الإدارة"
                className="w-28 h-12 object-contain ml-auto"
                style={{ mixBlendMode: 'multiply' }}
              />
            ) : (
              <div className="w-32 border-b-2 border-slate-400 pt-6 ml-auto"></div>
            )}
            <p className="text-[10px] text-slate-400">الاعتماد النهائي</p>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-5 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span>مستخرج إلكترونياً عبر منظومة النجاح الذكية لإدارة التدريب • نظام كشف الحضور الفوري</span>
          <span>تاريخ الطباعة: {new Date().toLocaleString('ar-EG')}</span>
        </div>
      </div>
    </div>
  );
};
