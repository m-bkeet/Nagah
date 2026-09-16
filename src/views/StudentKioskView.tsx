import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Award, 
  CheckCircle2, 
  Star, 
  Trophy, 
  Sparkles, 
  Clock, 
  BookOpen, 
  LogOut, 
  Play, 
  Gamepad2, 
  Send,
  Zap,
  Check,
  X,
  Volume2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface QuickQuestionState {
  id: string;
  type: 'choices' | 'true_false';
  questionText?: string;
  correctAnswer?: string;
  options?: { key: string; label: string; color: string }[];
  answers: Record<string, { studentCode: string; studentName: string; answer: string; isCorrect: boolean; timestamp: string }>;
}

export const StudentKioskView: React.FC = () => {
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [currentTrainee, setCurrentTrainee] = useState<any>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [traineeGroup, setTraineeGroup] = useState<any>(null);

  // Quick challenge / Question state from trainer
  const [activeQuestion, setActiveQuestion] = useState<QuickQuestionState | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Kahoot PIN input
  const [kahootPin, setKahootPin] = useState('');
  const [activeExternalActivity, setActiveExternalActivity] = useState<{
    title?: string;
    platform?: string;
    url?: string;
    gamePin?: string;
  } | null>(null);

  // Mini-Game Modal / Section
  const [isMiniGameActive, setIsMiniGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameStep, setGameStep] = useState(0);

  // Poll for trainer's quick question
  useEffect(() => {
    let isMounted = true;
    const checkQuickQuestion = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/lab/quick-question');
        const json = await res.json();
        if (isMounted) {
          if (json && json.data) {
            setActiveQuestion(json.data);
            // Check if current student already answered this specific question
            if (currentTrainee && json.data.answers && json.data.answers[currentTrainee.studentCode || currentTrainee.code]) {
              setSubmittedAnswer(json.data.answers[currentTrainee.studentCode || currentTrainee.code].answer);
            }
          } else {
            setActiveQuestion(null);
            setSubmittedAnswer(null);
          }

          if (json && json.externalActivity) {
            setActiveExternalActivity(json.externalActivity);
            if (json.externalActivity.gamePin) {
              setKahootPin(json.externalActivity.gamePin);
            }
          } else {
            setActiveExternalActivity(null);
          }
        }
      } catch (err) {
        // silent fail
      }
    };

    // Check immediately on mount or trainee login
    checkQuickQuestion();

    // Check on window focus (instant event-driven trigger when student clicks or returns to tab)
    const handleWindowFocus = () => {
      checkQuickQuestion();
    };
    window.addEventListener('focus', handleWindowFocus);

    // Lightweight fallback interval (25 seconds, only runs if window is active)
    const interval = setInterval(checkQuickQuestion, 25000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [currentTrainee]);

  const [attendanceFeedback, setAttendanceFeedback] = useState<any>(null);

  // Handle Login & Auto Check-in synchronized with Lecture Schedule
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = studentCodeInput.trim();
    if (!code) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      let devId = localStorage.getItem('nagah_lab_device_id');
      if (!devId) {
        devId = 'LAB-PC-' + Math.floor(100 + Math.random() * 900);
        localStorage.setItem('nagah_lab_device_id', devId);
      }

      const res = await fetch('/api/agent/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeOrPhone: code,
          deviceId: devId,
          deviceName: devId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'كود الطالب غير صحيح. يرجى التأكد من الكود المكتوب في الكارنيه.');
        return;
      }

      setCurrentTrainee(data.trainee);
      setAttendanceFeedback(data.attendanceResult || { status: 'present', message: data.message });
      if (data.trainee?.groupName) {
        setTraineeGroup({ name: data.trainee.groupName });
      }
    } catch (err) {
      setLoginError('تعذر الاتصال بالنظام، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit Answer to Trainer's Quick Challenge
  const handleAnswerSubmit = async (selectedOptionKey: string) => {
    if (!currentTrainee || !activeQuestion || isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);
    setSubmittedAnswer(selectedOptionKey);

    try {
      const studentCode = currentTrainee.studentCode || currentTrainee.code || currentTrainee.id;
      const studentName = currentTrainee.name || currentTrainee.fullName || 'طالب المعمل';

      await fetch('/api/lab/quick-question/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentCode,
          studentName,
          answer: selectedOptionKey
        })
      });

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Mini Game Questions (Simple, fun educational puzzle)
  const miniGameData = [
    {
      question: "ما هو العنصر الأساسي الذي يفهمه الحاسوب مباشرة؟",
      options: ["لغة الصفر والواحد (Binary 0/1)", "اللغة الإنجليزية", "الصور"],
      correct: 0
    },
    {
      question: "في لغة بايثون Python، أي دالة تستخدم لطباعة النصوص على الشاشة؟",
      options: ["print()", "write()", "show()"],
      correct: 0
    },
    {
      question: "ما هو اختصار شبكة الإنترنت العالمية؟",
      options: ["WWW", "HTML", "CPU"],
      correct: 0
    }
  ];

  // If not logged in, show the clean, welcoming Lab Check-in Screen
  if (!currentTrainee) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 select-none font-sans" dir="rtl">
        {/* Top Header */}
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-2xl shadow-lg shadow-amber-500/10">
              💻
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">معمل نجاح الذكي</h1>
              <p className="text-xs text-slate-400">بوابة الحضور والتفاعل اللحظي بأجهزة المعمل</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>المعمل متصل بالسيرفر</span>
          </div>
        </div>

        {/* Center Login Card */}
        <div className="max-w-md w-full mx-auto my-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl shadow-amber-500/25">
                🎓
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">تسجيل حضور المتدرب</h2>
              <p className="text-slate-400 text-sm mt-1.5">
                أدخل كودك الخاص لبدء الجلسة وتفعيل التفاعل الفوري
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="كود الطالب (مثال: STD-101)"
                  value={studentCodeInput}
                  onChange={(e) => setStudentCodeInput(e.target.value)}
                  className="w-full bg-slate-950/80 border-2 border-slate-700 hover:border-slate-600 focus:border-amber-400 text-white rounded-2xl px-5 py-4 text-center font-black text-xl tracking-widest placeholder:text-slate-600 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold animate-shake">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !studentCodeInput.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/25 active:scale-[0.98] disabled:opacity-50 text-base cursor-pointer"
              >
                {isLoggingIn ? 'جاري التحقق وتسجيل الحضور...' : 'تسجيل حضور وبدء الجلسة 🚀'}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <span>💡 يتم تسجيل الحضور في قاعدة بيانات المعمل تلقائياً</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-600 py-3">
          منظومة معامل سنتر النجاح التعليمي الذكية &bull; الإصدار السريع الخفيف
        </div>
      </div>
    );
  }

  // LOGGED-IN LAB SCREEN: Clean, Joyful, Highly Interactive
  const currentPoints = currentTrainee.totalPoints || currentTrainee.points || 120;
  const studentName = currentTrainee.name || currentTrainee.fullName || 'بطل المعمل';
  const studentCode = currentTrainee.studentCode || currentTrainee.code || currentTrainee.id;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 md:p-8 select-none flex flex-col justify-between font-sans" dir="rtl">
      
      {/* Top Banner: Student Welcome & Attendance Confirmation */}
      <div className="max-w-5xl mx-auto w-full space-y-5">
        
        <header className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
              {studentName[0] || 'ط'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg font-black tracking-wider">
                  {studentCode}
                </span>

                {attendanceFeedback?.status === 'present' ? (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 
                    {attendanceFeedback?.alreadyRecorded ? 'مسجل حاضر مسبقاً' : 'تم تسجيل الحضور (+5 نقاط)'}
                  </span>
                ) : attendanceFeedback?.status === 'not_scheduled' ? (
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> تدريب حر (خارج موعد المحاضرة)
                  </span>
                ) : (
                  <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    انتهى موعد المحاضرة
                  </span>
                )}

                {traineeGroup?.name && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-lg font-bold">
                    {traineeGroup.name}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                مرحباً بك يا {studentName} 🌟
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Group Ranking */}
            {currentTrainee.stats?.rankInGroup && (
              <div className="bg-slate-950 border border-purple-500/30 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
                <Trophy className="w-5 h-5 text-purple-400" />
                <div className="text-right">
                  <div className="text-lg font-black text-purple-400 leading-none">
                    #{currentTrainee.stats.rankInGroup}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    من {currentTrainee.stats.totalInGroup || 1} بمجموعتك
                  </div>
                </div>
              </div>
            )}

            {/* Stars Counter */}
            <div className="bg-slate-950 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              <div className="text-right">
                <div className="text-lg font-black text-amber-400 leading-none">{currentPoints}</div>
                <div className="text-[10px] text-slate-400 font-bold">نجمة تميز ⭐</div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                setCurrentTrainee(null);
                setActiveQuestion(null);
                setSubmittedAnswer(null);
                setAttendanceFeedback(null);
              }}
              title="خروج لتبديل الطالب"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Schedule & Attendance Message Banner if applicable */}
        {attendanceFeedback?.message && (
          <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 ${
            attendanceFeedback.status === 'present'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : attendanceFeedback.status === 'not_scheduled'
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0" />
            <p className="flex-1 leading-relaxed">{attendanceFeedback.message}</p>
          </div>
        )}

        {/* ACTIVE LIVE EXTERNAL CHALLENGE (كاهوت / كلاس بوينت) */}
        {activeExternalActivity && (
          <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-blue-900/50 border-2 border-purple-400/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fadeIn space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                      {activeExternalActivity.platform || 'Kahoot'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {activeExternalActivity.title || 'مسابقة تفاعلية أطلقها المعلم الآن!'}
                    </h3>
                  </div>
                  {activeExternalActivity.gamePin && (
                    <p className="text-xs text-purple-200 mt-1">
                      كود اللعبة (PIN): <span className="font-mono text-base font-black text-amber-300 tracking-wider mr-1">{activeExternalActivity.gamePin}</span>
                    </p>
                  )}
                </div>
              </div>

              <a
                href={
                  activeExternalActivity.platform?.toLowerCase().includes('kahoot') && activeExternalActivity.gamePin
                    ? `https://kahoot.it/?pin=${activeExternalActivity.gamePin}`
                    : activeExternalActivity.url || (activeExternalActivity.platform?.toLowerCase().includes('classpoint') ? 'https://www.classpoint.app' : 'https://kahoot.it')
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all"
              >
                <span>الانضمام للمسابقة الآن 🚀</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* ACTIVE LIVE QUESTION / QUICK TOOL (أداة المنكش السريع) */}
        {activeQuestion ? (
          <div className="bg-gradient-to-b from-purple-900/40 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <h2 className="text-lg sm:text-xl font-black text-purple-200 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                  تحدي المعمل اللحظي (المنكش السريع)!
                </h2>
              </div>
              <span className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full font-bold border border-purple-500/40">
                سؤال مباشر من المعلم ⚡
              </span>
            </div>

            {/* Question Text if provided */}
            <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 sm:p-6 text-center">
              {activeQuestion.questionText ? (
                <p className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                  {activeQuestion.questionText}
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-black text-amber-300">
                    🎧 استمع لسؤال المعلم شفوياً في القاعة
                  </p>
                  <p className="text-xs text-slate-400">
                    اختر إجابتك فوراً من الأزرار الملونة بالأسفل!
                  </p>
                </div>
              )}
            </div>

            {/* Large Interactive Buttons */}
            <div className={`grid gap-4 ${activeQuestion.type === 'true_false' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {(activeQuestion.options || []).map((opt) => {
                const isSelected = submittedAnswer === opt.key;
                return (
                  <button
                    key={opt.key}
                    disabled={isSubmittingAnswer}
                    onClick={() => handleAnswerSubmit(opt.key)}
                    className={`p-6 sm:p-8 rounded-3xl font-black text-xl sm:text-2xl transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer border-2 ${
                      isSelected
                        ? 'border-white scale-[1.02] ring-4 ring-white/30 shadow-2xl ' + opt.color
                        : 'border-transparent opacity-90 hover:opacity-100 hover:scale-[1.01] active:scale-95 ' + opt.color
                    } text-white`}
                  >
                    {isSelected && <Check className="w-7 h-7 animate-bounce" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status indicator */}
            {submittedAnswer && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                <p className="text-emerald-300 font-black text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> تم استلام إجابتك بنجاح! في انتظار إعلان النتائج من المعلم
                </p>
                <p className="text-[11px] text-slate-400">
                  يمكنك تغيير إجابتك بالضغط على خيار آخر قبل إنهاء السؤال
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Waiting Standby State */
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl shrink-0">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-200">في انتظار بدء تحدي الحصة</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  شاشتك جاهزة لاستقبال أسئلة ومسابقات المعلم اللحظية فور إطلاقها 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-bold">
                الجهاز نشط بالمعمل
              </span>
            </div>
          </div>
        )}

        {/* Quick Launchers: Kahoot & ClassPoint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Kahoot Quick Card */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-4 hover:border-purple-500/60 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-lg text-white">
                  K!
                </div>
                <div>
                  <h3 className="font-black text-white text-base">تحدي كاهوت (Kahoot)</h3>
                  <p className="text-[11px] text-purple-300">مسابقات الألعاب التفاعلية المباشرة</p>
                </div>
              </div>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                مباشر
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل كود اللعبة PIN"
                value={kahootPin}
                onChange={(e) => setKahootPin(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-center font-black text-base text-white focus:outline-none focus:border-purple-400"
              />
              <a
                href={kahootPin.trim() ? `https://kahoot.it/?pin=${kahootPin.trim()}` : "https://kahoot.it"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/30 cursor-pointer whitespace-nowrap"
              >
                <span>دخول</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ClassPoint Quick Card */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-5 space-y-4 hover:border-blue-500/60 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-lg text-white">
                  CP
                </div>
                <div>
                  <h3 className="font-black text-white text-base">كلاس بوينت (ClassPoint)</h3>
                  <p className="text-[11px] text-blue-300">السبورة التفاعلية واستطلاعات الرأي</p>
                </div>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                تفاعلي
              </span>
            </div>

            <a
              href="https://www.classpoint.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>فتح شاشة كلاس بوينت والانضمام للعرض</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Lightweight Educational Mini-Game Button */}
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">لعبة السرعة والتحدي الذكية</h4>
              <p className="text-xs text-slate-400">تحدى نفسك في ألغاز برمجية سريعة واكسب نجوم تميز إضافية!</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsMiniGameActive(true);
              setGameStep(0);
              setGameScore(0);
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>تشغيل اللعبة الآن</span>
          </button>
        </div>

      </div>

      {/* Mini-Game Modal */}
      {isMiniGameActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsMiniGameActive(false)}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {gameStep < miniGameData.length ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg font-black">
                    لغز {gameStep + 1} من {miniGameData.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    النقاط الحالية: {gameScore} ⭐
                  </span>
                </div>

                <h3 className="text-xl font-black text-white leading-snug">
                  {miniGameData[gameStep].question}
                </h3>

                <div className="space-y-3">
                  {miniGameData[gameStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx === miniGameData[gameStep].correct) {
                          setGameScore(prev => prev + 5);
                        }
                        setGameStep(prev => prev + 1);
                      }}
                      className="w-full text-right p-4 bg-slate-950 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-800 rounded-2xl text-sm font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">🏆</div>
                <h3 className="text-2xl font-black text-white">أحسنت يا بطل!</h3>
                <p className="text-slate-300 text-sm">
                  أكملت التحدي بنجاح وحققت <span className="text-amber-400 font-black">{gameScore}</span> نقطة تميز إضافية!
                </p>
                <button
                  onClick={() => setIsMiniGameActive(false)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all"
                >
                  العودة لشاشة المعمل
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Joyful Celebration Balloon / Star Effect */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-amber-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-lg shadow-2xl flex items-center gap-2 animate-bounce">
            <Star className="w-6 h-6 fill-current" />
            <span>تم تسجيل إجابتك بنجاح! أحسنت ⭐</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 py-3">
        سنتر النجاح التعليمي &bull; منصة المعمل التفاعلية الذكية
      </footer>
    </div>
  );
};
