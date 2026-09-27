import React, { useState, useRef } from 'react';
import { 
  X, Users, Send, Share2, Award, Trophy, Crown, Sparkles, 
  CheckCircle2, Download, Printer, Copy, ExternalLink, Edit2, 
  Save, Phone, BookOpen, BarChart2, Star, ShieldCheck, Image as ImageIcon,
  Flame, FileSpreadsheet
} from 'lucide-react';
import { Exam, Group, Course, Trainee, ExamResult } from '../types';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { captureElementToCanvas } from '../utils/captureUtils';
import { OfficialSealBadge } from './OfficialSealBadge';

interface ExamGroupBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  results: ExamResult[];
  courses: Course[];
  groups: Group[];
  trainees: Trainee[];
  onOpenSingleCertificate?: (traineeId: string, result: ExamResult) => void;
}

export const ExamGroupBroadcastModal: React.FC<ExamGroupBroadcastModalProps> = ({
  isOpen,
  onClose,
  exam,
  results,
  courses,
  groups,
  trainees,
  onOpenSingleCertificate
}) => {
  const { showToast, settings } = useCenter();
  const [activeTab, setActiveTab] = useState<'report' | 'poster' | 'parents' | 'bulk_certs'>('report');
  const [isExportingPoster, setIsExportingPoster] = useState(false);
  const [isUpdatingGroupLink, setIsUpdatingGroupLink] = useState(false);
  const [customGroupLink, setCustomGroupLink] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [showDesktopNotice, setShowDesktopNotice] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  const centerLogo = settings?.logoUrl || localStorage.getItem('nagah_custom_logo') || '/logo.svg';

  if (!isOpen || !exam) return null;

  // Find course and group
  const course = courses.find(c => c.id === exam.courseId);
  const targetGroup = groups.find(g => g.id === exam.groupId) || groups.find(g => g.courseId === exam.courseId);

  // Group link
  const currentGroupLink = customGroupLink || targetGroup?.whatsappGroupLink || (targetGroup as any)?.whatsappLink || '';

  // Sort results strictly by score DESC
  const sortedResults = [...results].sort((a, b) => {
    const scoreA = Number(a.score) || 0;
    const scoreB = Number(b.score) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (Number(b.percentage) || 0) - (Number(a.percentage) || 0);
  });

  const totMarks = Number(exam.totalMarks) || 100;
  const passMarks = Number(exam.passingMarks) || 60;
  const validResults = sortedResults.filter(r => r.score !== undefined && !isNaN(Number(r.score)));
  const topScore = validResults.length > 0 ? Math.max(...validResults.map(r => Number(r.score) || 0)) : 0;
  const passedCount = validResults.filter(r => Number(r.score) >= passMarks).length;
  const passPercent = validResults.length > 0 ? Math.round((passedCount / validResults.length) * 100) : 0;
  const avgScore = validResults.length > 0 ? Math.round(validResults.reduce((s, r) => s + (Number(r.score) || 0), 0) / validResults.length) : 0;

  // Handle updating WhatsApp group link
  const handleSaveGroupLink = async () => {
    if (!targetGroup) return;
    if (!customGroupLink.trim()) {
      showToast('يرجى إدخال رابط الجروب (مثل: https://chat.whatsapp.com/...)', 'error');
      return;
    }
    setIsUpdatingGroupLink(true);
    try {
      await api.updateGroup(targetGroup.id, { whatsappGroupLink: customGroupLink.trim() });
      if (targetGroup) targetGroup.whatsappGroupLink = customGroupLink.trim();
      showToast('تم حفظ رابط جروب الواتساب للمجموعة بنجاح! 🔗✨', 'success');
      setIsEditingLink(false);
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ رابط الجروب', 'error');
    } finally {
      setIsUpdatingGroupLink(false);
    }
  };

  // Build Comprehensive Markdown Scoreboard for WhatsApp
  const generateWhatsAppScoreboard = () => {
    const lines: string[] = [];
    lines.push(`📊 *تقرير ونتائج الاختبار التقييمي الشامل* 🏆`);
    lines.push(`🏛️ *${settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📌 *المادة / الدورة:* ${course?.name || 'الدورة التدريبية'}`);
    if (targetGroup?.name) lines.push(`👥 *المجموعة:* ${targetGroup.name}`);
    lines.push(`📝 *عنوان الاختبار:* ${exam.title}`);
    lines.push(`🎯 *الدرجة العظمى:* ${totMarks} درجة | *درجة النجاح:* ${passMarks}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🏅 *كشف ترتيب الطلاب ودرجات الاختبار:*`);
    lines.push(``);

    sortedResults.forEach((r, idx) => {
      const score = Number(r.score) || 0;
      const pct = r.percentage !== undefined ? r.percentage : Math.round((score / Math.max(totMarks, 1)) * 100);
      const isPassed = score >= passMarks;
      let medal = '🔹';
      if (score === topScore && topScore > 0) medal = '🥇 *الأول*';
      else if (idx === 1 && isPassed) medal = '🥈 *الثاني*';
      else if (idx === 2 && isPassed) medal = '🥉 *الثالث*';
      else if (isPassed) medal = '⭐';
      else medal = '⚠️';

      const statusTag = isPassed ? (pct >= 90 ? '🌟 ممتاز جداً' : pct >= 80 ? '✨ جيد جداً' : '✅ ناجح') : '❌ يحتاج تحسين';

      lines.push(`${idx + 1}. ${medal} *${r.traineeName || 'متدرب'}* ⬅️ [ *${score} / ${totMarks}* ] (${pct}%) — ${statusTag}`);
    });

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📈 *إحصائيات الأداء العام للمجموعة:*`);
    lines.push(`• إجمالي المتقدمين: *${sortedResults.length}* متدرب`);
    lines.push(`• نسبة النجاح: *${passPercent}%* (${passedCount} ناجح)`);
    lines.push(`• أعلى درجة محققة: *${topScore} / ${totMarks}* 🏆`);
    lines.push(`• متوسط الدرجات: *${avgScore} / ${totMarks}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🎉 مبارك لجميع أبطالنا المتفوقين ونتمنى لكم دوام الريادة والتميز! 🚀👏`);

    return lines.join('\n');
  };

  // Copy and open group WhatsApp
  const handleSendReportToGroup = () => {
    const message = generateWhatsAppScoreboard();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).catch(() => {});
    }

    if (currentGroupLink && currentGroupLink.trim().startsWith('http')) {
      showToast('تم نسخ تقرير النتائج! جاري فتح جروب المجموعة، الصق التقرير بـ (Ctrl + V) 📋🚀', 'success');
      window.open(currentGroupLink.trim(), '_blank');
    } else {
      showToast('تم نسخ التقرير! اختر جروب المجموعة في الواتساب لإرساله 👥', 'info');
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Capture and share Honor Roll Poster image
  const handleSharePosterToGroup = async () => {
    if (!posterRef.current) return;
    setIsExportingPoster(true);
    try {
      const canvas = await captureElementToCanvas(posterRef.current);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('فشل إنشاء بوستر لوحة الشرف');

      const fileName = `لوحة_شرف_الاختبار_${exam.title.replace(/\s+/g, '_')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Mobile share
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `لوحة شرف اختبار ${exam.title}`
        });
        showToast('تمت مشاركة بوستر لوحة الشرف بنجاح! 🖼️✨', 'success');
        return;
      }

      // Desktop copy to clipboard + download
      try {
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } catch (e) {
        console.warn('Clipboard write error:', e);
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();

      // Open Group link directly
      if (currentGroupLink && currentGroupLink.trim().startsWith('http')) {
        window.open(currentGroupLink.trim(), '_blank');
        showToast('تم نسخ بوستر لوحة الشرف! جاري فتح جروب الواتساب، الصق الصورة بـ (Ctrl + V) 📋🖼️', 'success');
      } else {
        window.open('https://web.whatsapp.com/', '_blank');
        showToast('تم نسخ بوستر لوحة الشرف! الصقها مباشرة بـ (Ctrl + V) في جروب الواتساب 📋🖼️', 'success');
      }
      setShowDesktopNotice(true);
    } catch (err: any) {
      console.error('Poster export error:', err);
      showToast(err.message || 'فشل تصدير بوستر لوحة الشرف', 'error');
    } finally {
      setIsExportingPoster(false);
    }
  };

  // Top 3 Podium Students
  const topRank1 = sortedResults[0];
  const topRank2 = sortedResults[1];
  const topRank3 = sortedResults[2];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full my-auto overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-amber-500/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  مركز نشر تقارير وشهادات الاختبار على الواتساب 🚀
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {sortedResults.length} متدرب
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {course?.name} — {exam.title} {targetGroup?.name ? `(${targetGroup.name})` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Group Direct Connector Bar */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                  جروب المجموعة: <b>{targetGroup?.name || 'مجموعة الاختبار'}</b>
                </span>
                {currentGroupLink ? (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    ✓ رابط الجروب متصل
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    ⚠️ لم يتم تعيين رابط للجروب بعد
                  </span>
                )}
              </div>

              {!isEditingLink ? (
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate font-mono mt-0.5">
                  {currentGroupLink || 'أضف رابط الجروب لفتحه بنقرة واحدة دائماً'}
                </p>
              ) : (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="url"
                    value={customGroupLink}
                    onChange={(e) => setCustomGroupLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveGroupLink}
                    disabled={isUpdatingGroupLink}
                    className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingLink(false)}
                    className="py-1 px-2 text-slate-500 hover:text-slate-700 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingLink && (
              <button
                type="button"
                onClick={() => {
                  setCustomGroupLink(currentGroupLink);
                  setIsEditingLink(true);
                }}
                className="py-1.5 px-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{currentGroupLink ? 'تعديل الرابط' : 'تعيين رابط الجروب'}</span>
              </button>
            )}

            {currentGroupLink && (
              <a
                href={currentGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح الجروب 🚀</span>
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'report'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>كشف الدرجات والترتيب المنسق 📊</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'poster'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>بوستر لوحة الشرف التكريمية 🏆</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parents')}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'parents'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>إرسال فردي لأولياء الأمور 📱</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: WhatsApp Scoreboard Report */}
          {activeTab === 'report' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    معاينة رسالة تقرير النتائج المجهزة للإرسال إلى جروب الواتساب
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    مجهزة بتنسيق ماركداون احترافي يبرز المراكز والأوائل والنسب المئوية بدقة
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generateWhatsAppScoreboard());
                      showToast('تم نسخ نص التقرير بالكامل للحافظة! 📋✨', 'success');
                    }}
                    className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص فقط</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendReportToGroup}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال التقرير لجروب الواتساب فوراً 🚀</span>
                  </button>
                </div>
              </div>

              {/* Preformatted Text Preview Box */}
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[360px] shadow-inner">
                {generateWhatsAppScoreboard()}
              </div>
            </div>
          )}

          {/* TAB 2: Visual Honor Roll Graphic Poster */}
          {activeTab === 'poster' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    لوحة شرف الأوائل والمتفوقين في الاختبار 🌟
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    يتم تصديرها كصورة ملكية ملونة بدقة عالية ونشرها مباشرة على جروب الواتساب
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSharePosterToGroup}
                  disabled={isExportingPoster}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isExportingPoster ? 'جاري تجهيز الصورة...' : 'تصدير ومشاركة بوستر لوحة الشرف لجروب الواتساب 🖼️✨'}</span>
                </button>
              </div>

              {/* Poster Canvas Element */}
              <div className="overflow-x-auto p-2 flex justify-center">
                <div
                  ref={posterRef}
                  className="w-[720px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-7 border-4 border-amber-500/50 shadow-2xl relative overflow-hidden"
                  style={{ minHeight: '480px' }}
                  dir="rtl"
                >
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Poster Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-amber-500/30 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 border-amber-500/60 shadow-lg shrink-0 flex items-center justify-center overflow-hidden ring-4 ring-amber-400/20">
                        <img 
                          src={centerLogo} 
                          alt={settings?.centerName || "مركز النجاح"} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', '/logo.svg');
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-amber-400 font-serif">
                          {settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}
                        </h2>
                        <p className="text-xs text-slate-300 font-bold">
                          لوحة شرف الأبطال والمتفوقين — {course?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40">
                        {exam.title}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">
                        {targetGroup?.name || 'مجموعة التدريب'}
                      </p>
                    </div>
                  </div>

                  {/* Podium Top 3 Performers */}
                  <div className="py-6 grid grid-cols-3 gap-3.5 items-end relative z-10">
                    {/* Rank 2 - Silver */}
                    <div className="bg-slate-800/90 border border-slate-600 rounded-2xl p-3.5 text-center flex flex-col items-center justify-end relative h-56 shadow-lg">
                      <span className="text-3xl mb-1">🥈</span>
                      <span className="text-[10px] font-black text-slate-300 bg-slate-700 px-2.5 py-0.5 rounded-full mb-2 border border-slate-500">
                        المركز الثاني
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-white font-serif leading-snug break-words max-w-full px-1 min-h-[36px] flex items-center justify-center">
                        {topRank2 ? topRank2.traineeName : '—'}
                      </h4>
                      <div className="mt-2 text-slate-100 font-mono font-black text-sm bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700 w-full">
                        {topRank2 ? `${topRank2.score} / ${totMarks}` : '—'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold mt-1">
                        {topRank2?.percentage ? `${topRank2.percentage}%` : ''}
                      </span>
                    </div>

                    {/* Rank 1 - GOLD */}
                    <div className="bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-2xl p-4 text-center flex flex-col items-center justify-end relative h-64 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/30">
                      <div className="absolute -top-4 w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xl ring-2 ring-white">
                        <Crown className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-4xl mb-1">🥇</span>
                      <span className="text-[11px] font-black text-amber-950 bg-amber-400 px-3 py-0.5 rounded-full mb-2 shadow-md">
                        المركز الأول 🏆
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-amber-200 font-serif leading-snug break-words max-w-full px-1 min-h-[40px] flex items-center justify-center drop-shadow-sm">
                        {topRank1 ? topRank1.traineeName : '—'}
                      </h4>
                      <div className="mt-2 text-amber-300 font-mono font-black text-base bg-amber-950/60 px-3.5 py-1 rounded-xl border border-amber-500/50 w-full shadow-inner">
                        {topRank1 ? `${topRank1.score} / ${totMarks}` : '—'}
                      </div>
                      <span className="text-[11px] text-amber-400 font-bold mt-1">
                        {topRank1?.percentage ? `${topRank1.percentage}% (امتياز تفوق)` : '100%'}
                      </span>
                    </div>

                    {/* Rank 3 - Bronze */}
                    <div className="bg-slate-800/90 border border-amber-900/60 rounded-2xl p-3.5 text-center flex flex-col items-center justify-end relative h-52 shadow-lg">
                      <span className="text-3xl mb-1">🥉</span>
                      <span className="text-[10px] font-black text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full mb-2 border border-amber-800/70">
                        المركز الثالث
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-white font-serif leading-snug break-words max-w-full px-1 min-h-[36px] flex items-center justify-center">
                        {topRank3 ? topRank3.traineeName : '—'}
                      </h4>
                      <div className="mt-2 text-slate-100 font-mono font-black text-sm bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700 w-full">
                        {topRank3 ? `${topRank3.score} / ${totMarks}` : '—'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold mt-1">
                        {topRank3?.percentage ? `${topRank3.percentage}%` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Rest of Top Students Strip */}
                  {sortedResults.length > 3 && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 relative z-10">
                      <p className="text-[11px] font-bold text-amber-400 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>كوكبة النجوم والمتفوقين في المجموعة:</span>
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {sortedResults.slice(3, 10).map((r, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-medium border border-slate-700 flex items-center gap-1.5">
                            <span className="text-amber-400">★</span>
                            <span>{r.traineeName}</span>
                            <span className="font-mono font-bold text-amber-300">({r.score})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                    <span>منظومة النجاح الذكية للتدريب والتقييم السحابي V7.0</span>
                    <span className="font-bold text-amber-400">معتمدة رسمياً وموثقة عبر الرابط العام</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Individual Parent WhatsApp Dispatcher */}
          {activeTab === 'parents' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    إرسال الشهادة والتقرير الخاص لكل ولي أمر مباشرة 📱
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    إرسال رسالة تهنئة موجهة وشهادة تقدير برقم هاتف ولي الأمر المسجل لكل طالب
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3 text-center w-12">#</th>
                      <th className="p-3">اسم المتدرب</th>
                      <th className="p-3 text-center">الدرجة والنسبة</th>
                      <th className="p-3 text-center">التقييم</th>
                      <th className="p-3 text-center">هاتف ولي الأمر</th>
                      <th className="p-3 text-center w-40">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedResults.map((res, idx) => {
                      const traineeObj = trainees.find(t => t.id === res.traineeId);
                      const phone = traineeObj?.parentPhone || traineeObj?.phone || '';
                      const score = Number(res.score) || 0;
                      const pct = res.percentage !== undefined ? res.percentage : Math.round((score / Math.max(totMarks, 1)) * 100);
                      const isTop = idx === 0 && score === topScore;

                      const cleanPhone = phone.replace(/[^0-9]/g, '');
                      const parentMessage = `🌟🏆 تهانينا الحارة من مركز النجاح للتدريب والاستشارات! 🏆🌟\n\nنهنئكم بتفوق المتدرب المتميز: *${res.traineeName || traineeObj?.fullName}* 🎓\nفي اختبار: *${exam.title}*\n📌 المادة: ${course?.name}\n🎯 الدرجة المحققة: *${score} من ${totMarks}* (${pct}%)\n🏅 الحالة: *${score >= passMarks ? 'ناجح بتفوق 🌟' : 'يحتاج لمتابعة'}*\n\nنتمنى له دوام التألق والنجاح دائماً! 🚀\n${settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}`;

                      return (
                        <tr key={res.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center font-bold text-slate-400">
                            {isTop ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{res.traineeName || traineeObj?.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{traineeObj?.code || '—'}</p>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                            <span>{score} / {totMarks}</span>
                            <span className="text-[10px] text-emerald-600 block">({pct}%)</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              score >= passMarks ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {score >= passMarks ? 'ناجح ✅' : 'راسب ❌'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                            {phone || '—'}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Open Single Certificate Modal */}
                              {onOpenSingleCertificate && (
                                <button
                                  type="button"
                                  onClick={() => onOpenSingleCertificate(res.traineeId, res)}
                                  className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                                  title="عرض وإصدار الشهادة الفردية"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Direct WhatsApp to Parent */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!phone) {
                                    showToast('لا يوجد رقم هاتف مسجل لهذا الطالب أو ولي أمره', 'error');
                                    return;
                                  }
                                  const url = `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}?text=${encodeURIComponent(parentMessage)}`;
                                  window.open(url, '_blank');
                                }}
                                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>واتساب 📱</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
