import React, { useState, useEffect } from 'react';
import { 
  X, Save, Award, CheckCircle2, RotateCcw, AlertTriangle, 
  Sparkles, Star, User, BookOpen, Clock, Zap, ShieldCheck,
  TrendingUp, RefreshCw, Trophy, HeartHandshake, Check
} from 'lucide-react';
import { ExamResult, Trainee, Exam } from '../types';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';
import { audioService } from '../services/audioService';

interface EditStudentExamResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
  exam: Exam | null;
  trainee?: Trainee | null;
  onResultUpdated: (updatedResult: ExamResult) => void;
}

export const EditStudentExamResultModal: React.FC<EditStudentExamResultModalProps> = ({
  isOpen,
  onClose,
  result,
  exam,
  trainee,
  onResultUpdated
}) => {
  const { showToast } = useCenter();
  const [score, setScore] = useState<number>(0);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [notes, setNotes] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [isSaving, setIsSaving] = useState(false);
  const [isGrantingRetake, setIsGrantingRetake] = useState(false);

  useEffect(() => {
    if (result) {
      setScore(Number(result.score) || 0);
      setTotalMarks(Number(result.totalMarks) || Number(exam?.totalMarks) || 100);
      setNotes(result.notes || '');
      setAttendanceStatus((result as any).attendanceStatus || 'present');
    }
  }, [result, exam]);

  if (!isOpen || !result) return null;

  const passScore = Number(exam?.passingMarks) || Math.round(totalMarks * 0.6);
  const calculatedPct = Math.round((score / Math.max(totalMarks, 1)) * 100);
  const isPassed = score >= passScore && attendanceStatus !== 'absent';

  let calculatedRating = 'راسب';
  if (attendanceStatus === 'absent') calculatedRating = 'غائب';
  else if (calculatedPct >= 90) calculatedRating = 'ممتاز 🌟';
  else if (calculatedPct >= 80) calculatedRating = 'جيد جداً 🎯';
  else if (calculatedPct >= 65) calculatedRating = 'جيد 👍';
  else if (calculatedPct >= 50) calculatedRating = 'مقبول';

  // Apply quick bonus/grace marks
  const handleAddBonus = (pts: number) => {
    setScore(prev => Math.min(totalMarks, Math.max(0, prev + pts)));
    showToast(`تمت إضافة ${pts > 0 ? '+' + pts : pts} درجات تحسين للدرجة! ⚡`, 'info');
  };

  // Save manual score adjustment
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 0 || score > totalMarks) {
      showToast(`يرجى إدخال درجة بين 0 و ${totalMarks}`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<ExamResult> = {
        score,
        totalMarks,
        percentage: calculatedPct,
        rating: isPassed ? calculatedRating.replace(/[^\u0600-\u06FF\s]/g, '').trim() as any : 'راسب',
        notes: notes.trim(),
        traineeName: result.traineeName || trainee?.fullName,
        traineeCode: (result as any).traineeCode || trainee?.code
      };
      (payload as any).attendanceStatus = attendanceStatus;

      const res = await api.updateExamResult(result.examId, result.id, payload);
      if (res && res.result) {
        showToast('تم تعديل وحفظ درجة الطالب بنجاح! ✨', 'success');
        if (isPassed && Number(result.score) < passScore) {
          audioService.playSuccess();
        }
        onResultUpdated(res.result);
        onClose();
      } else {
        // Fallback local update
        const updatedLocal: ExamResult = {
          ...result,
          ...payload
        };
        showToast('تم حفظ تعديل الدرجة بنجاح! ✨', 'success');
        onResultUpdated(updatedLocal);
        onClose();
      }
    } catch (err: any) {
      console.error('Update result error:', err);
      showToast(err.message || 'فشل حفظ تعديل الدرجة', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Grant Smart Retake Attempt
  const handleGrantSmartRetake = async () => {
    setIsGrantingRetake(true);
    try {
      const res = await api.grantTraineeRetake(result.examId, result.id, {
        mode: 'keep_best',
        reason: 'إعادة الاختبار لتحسين الدرجة بناءً على طلب المعلم'
      });

      showToast('تم تفعيل إمكانية إعادة الاختبار للطالب مع الاحتفاظ بدرجته الحالية! 🔄✨', 'success');
      audioService.playClapping(1);
      if (res && res.result) {
        onResultUpdated(res.result);
      } else {
        const localUpdated: ExamResult = {
          ...result,
          notes: `${result.notes ? result.notes + ' | ' : ''}مسموح بإعادة المحاولة (الدرجة السابقة: ${result.score})`
        };
        (localUpdated as any).allowRetake = true;
        onResultUpdated(localUpdated);
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'فشل منح صلاحية إعادة الاختبار', 'error');
    } finally {
      setIsGrantingRetake(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full my-auto overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                تعديل درجة ونتيجة الطالب في الاختبار ✍️
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تعديل الدرجات المرصودة، إضافة درجات رأفة، أو السماح بإعادة المحاولة
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

        {/* Student Profile Strip */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {trainee?.photoUrl ? (
              <img src={trainee.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                {(result.traineeName || trainee?.fullName || 'ط').charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                {result.traineeName || trainee?.fullName}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono">
                كود: {trainee?.code || (result as any).traineeCode || '—'} • {exam?.title || 'الاختبار'}
              </p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-bold">الدرجة المرصودة حالياً</span>
            <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
              {result.score} / {result.totalMarks || totalMarks}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveResult} className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Live Score & Percentage Dashboard */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/40 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
              {/* Score Input */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                  الدرجة الجديدة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalMarks}
                  required
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-amber-500/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-black text-lg text-center focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Total Marks Input */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                  من إجمالي الدرجة
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-center"
                />
              </div>

              {/* Live Status Badge */}
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold">النسبة والتقدير</span>
                <span className={`font-black text-sm ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {calculatedPct}% ({calculatedRating})
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full mt-1 ${
                  isPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isPassed ? 'مؤهل للشهادة 📜' : 'دون درجة النجاح'}
                </span>
              </div>
            </div>

            {/* Quick Adjustment Buttons (+1, +2, +5, Max) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 ml-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>رأفة وتحسين:</span>
              </span>
              <button
                type="button"
                onClick={() => handleAddBonus(1)}
                className="py-1 px-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-black text-[11px] hover:bg-amber-200 transition-colors"
              >
                +1 درجة
              </button>
              <button
                type="button"
                onClick={() => handleAddBonus(2)}
                className="py-1 px-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-black text-[11px] hover:bg-amber-200 transition-colors"
              >
                +2 درجات
              </button>
              <button
                type="button"
                onClick={() => handleAddBonus(5)}
                className="py-1 px-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-black text-[11px] hover:bg-emerald-200 transition-colors"
              >
                +5 درجات
              </button>
              <button
                type="button"
                onClick={() => setScore(passScore)}
                className="py-1 px-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-[11px] hover:bg-blue-200 transition-colors"
              >
                حد النجاح ({passScore})
              </button>
              <button
                type="button"
                onClick={() => setScore(totalMarks)}
                className="py-1 px-2.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold text-[11px] hover:bg-purple-200 transition-colors"
              >
                الدرجة النهائية 💯
              </button>
            </div>
          </div>

          {/* Teacher Feedback / Notes */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
              ملاحظات المعلم وتقييم المحاولة (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم تعديل الدرجة بناءً على حل السؤال العملي الإضافي..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          {/* Smart Retake Permission Box (No Student Deletion!) */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-black text-blue-950 dark:text-blue-200 text-xs">
                  إتاحة إعادة الاختبار للطالب (دون حذف اسمه أو سجله) 🔄
                </span>
              </div>
            </div>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              عند الضغط على الزر، سيتم فتح قفل الاختبار للطالب ليتمكن من الدخول وحل الاختبار مجدداً، مع **الاحتفاظ بدرجته الحالية ({result.score} درجة)** في الكشوفات حتى لا يختفي الطالب من المجموعة.
            </p>
            <button
              type="button"
              onClick={handleGrantSmartRetake}
              disabled={isGrantingRetake}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isGrantingRetake ? 'جاري تفعيل الإعادة...' : 'تفعيل إمكانية إعادة الاختبار للطالب فوراً 🔄✨'}</span>
            </button>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ تعديل الدرجة والنتيجة ✨'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
