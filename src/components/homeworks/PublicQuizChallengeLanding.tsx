import React, { useState, useEffect } from 'react';
import { 
  Play, Trophy, Award, Sparkles, Clock, CheckCircle2, User, 
  ArrowRight, BookOpen, Flame, Volume2, ShieldCheck, Share2, 
  RotateCcw, AlertCircle, RefreshCw 
} from 'lucide-react';
import { AssignmentTask, Trainee } from '../../types';
import { api } from '../../services/api';
import { KahootGameModal } from './KahootGameModal';
import { ThemeQuickSwitcher } from '../ThemeQuickSwitcher';

interface PublicQuizChallengeLandingProps {
  taskId: string;
  onGoToPortal?: () => void;
  onBack?: () => void;
}

export const PublicQuizChallengeLanding: React.FC<PublicQuizChallengeLandingProps> = ({
  taskId,
  onGoToPortal,
  onBack
}) => {
  const [assignment, setAssignment] = useState<AssignmentTask | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [studentName, setStudentName] = useState<string>(() => {
    try {
      const activeStr = localStorage.getItem('nagah_student_active_session');
      if (activeStr) {
        const parsed = JSON.parse(activeStr);
        if (parsed?.student?.fullName) return parsed.student.fullName;
      }
    } catch (e) {}
    return '';
  });
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('guest');
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [gameResult, setGameResult] = useState<any | null>(null);

  // Load challenge info
  useEffect(() => {
    let isMounted = true;

    const fetchChallenge = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getPublicChallenge(taskId);
        if (!isMounted) return;

        if (res.success && res.challenge) {
          setAssignment(res.challenge);
          if (Array.isArray(res.trainees)) {
            setTrainees(res.trainees);
          }
        } else {
          // Try fetching from general assignments list
          const allAssignments = await api.getAssignments();
          const match = (allAssignments || []).find((a: any) => a.id === taskId || a.shareableCode === taskId);
          if (match) {
            setAssignment(match);
          } else {
            setError('عذراً، لم نتمكن من العثور على هذا التحدي. قد يكون الرابط منتهي الصلاحية أو تم تحديثه.');
          }
        }
      } catch (err: any) {
        console.warn('Challenge fetch notice:', err);
        // Fallback: try local storage / general assignments
        try {
          const allAssignments = await api.getAssignments();
          const match = (allAssignments || []).find((a: any) => a.id === taskId || a.shareableCode === taskId);
          if (match && isMounted) {
            setAssignment(match);
          } else {
            setError('تعذر تحميل بيانات التحدي في الوقت الحالي. يرجى التحقق من اتصال الإنترنت أو كود التحدي.');
          }
        } catch (e) {
          setError('تعذر تحميل بيانات التحدي في الوقت الحالي.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchChallenge();

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const questionsCount = assignment?.quizGame?.questions?.length || 15;
  const timeLimit = assignment?.quizGame?.timeLimitDefault || 20;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">جاري تجهيز تحدي كاهوت التفاعلي...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          يتم استدعاء الأسئلة المعتمدة والمؤثرات الصوتية والمؤقتات الذكية لتجربة تعليمية شيقة!
        </p>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>لحظات ويتم الإطلاق ⚡</span>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">تعذر العثور على المسابقة</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          {error || 'لم يتم العثور على التحدي المطلوب. تأكد من صحة الرابط أو تواصل مع معلم المادة.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onGoToPortal && (
            <button
              onClick={onGoToPortal}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              الانتقال لبوابة الطالب
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              العودة للرئيسية
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Kahoot Game Session Overlay
  if (isPlayingGame) {
    return (
      <KahootGameModal
        assignment={assignment}
        trainees={trainees}
        currentStudentId={selectedTraineeId !== 'guest' ? selectedTraineeId : undefined}
        onClose={() => setIsPlayingGame(false)}
        onCompleted={(res) => {
          setGameResult(res);
          setIsPlayingGame(false);
        }}
        onShowToast={(msg) => console.log(msg)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" dir="rtl">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Quick Theme Switcher Floating Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <ThemeQuickSwitcher />
      </div>

      {/* Main Challenge Card */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-inner">
              <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                تحدي كاهوت التفاعلي ⚡
              </span>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {assignment.title}
              </h1>
            </div>
          </div>

          {assignment.evaluationSource && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{assignment.evaluationSource}</span>
            </span>
          )}
        </div>

        {/* Challenge Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1">المادة / المقرر</span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 truncate block">
              {assignment.courseName || 'المنهج الدراسي'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1">عدد الأسئلة</span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-300 block">
              {questionsCount} سؤالاً 🎯
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1">المؤقت لكل سؤال</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-300 block">
              {timeLimit} ثانية ⏱️
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1">الدرجة المستحقة</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
              {assignment.totalMarks || 100} درجة 🏆
            </span>
          </div>
        </div>

        {/* Previous completion banner if just finished */}
        {gameResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>تم إكمال التحدي بنجاح ورصد النتيجة! 🎉</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              حصلت على: <span className="font-bold text-amber-600 dark:text-amber-400">{gameResult.score || 0}</span> من أصل <span className="font-bold text-slate-900 dark:text-white">{assignment.totalMarks || 100}</span> ({gameResult.percentage || 0}%)
            </p>
          </div>
        )}

        {/* Player Name Form */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            أدخل اسم البطل / المتسابق للبدء وظهور اسمك في لوحة الشرف:
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="اكتب اسمك الثلاثي هنا (مثال: أحمد محمد علي)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus:border-amber-500 rounded-xl pr-9 pl-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            💡 سيتم تسجيل نقاطك وأوسمتك باسمك مباشرة، ويمكنك مشاركة شهادة فوزك عبر واتساب!
          </p>
        </div>

        {/* Big Start Challenge CTA Button */}
        <button
          type="button"
          onClick={() => setIsPlayingGame(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
          <span>{gameResult ? 'إعادة خوض التحدي لتحسين النتيجة 🔄' : '🚀 ابدأ تحدي كاهوت التفاعلي الآن!'}</span>
        </button>

        {/* Secondary portal navigation footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          {onGoToPortal && (
            <button
              type="button"
              onClick={onGoToPortal}
              className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>تسجيل الدخول إلى حساب الطالب الكامل</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}

          <span className="text-[11px] text-slate-400">
            مركز النجاح للتدريب والاستشارات - منصة التعلم التفاعلي الذكي
          </span>
        </div>
      </div>
    </div>
  );
};
