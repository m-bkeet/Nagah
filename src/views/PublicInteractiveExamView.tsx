import React, { useState, useEffect } from 'react';
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Send,
  ArrowRight,
  ArrowLeft,
  Share2,
  Printer,
  RotateCcw,
  Check,
  HelpCircle,
  ShieldCheck,
  Trophy,
  Sun,
  Moon,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { getCurriculumExamQuestions } from '../data/ictCurriculumQuestions';

interface PublicInteractiveExamViewProps {
  directExamId?: string;
  isPreviewMode?: boolean;
  onBack?: () => void;
}

export const PublicInteractiveExamView: React.FC<PublicInteractiveExamViewProps> = ({
  directExamId,
  isPreviewMode: isPreviewProp,
  onBack
}) => {
  // Theme state: defaults to Light Mode (الوضع النهاري المريح)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nagah_exam_theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('nagah_exam_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Resolve exam ID and preview mode from prop or URL params
  const [examId, setExamId] = useState<string>(() => {
    if (directExamId) return directExamId;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('examId') || urlParams.get('exam') || urlParams.get('id') || '';
  });

  const isPreviewMode = isPreviewProp || (new URLSearchParams(window.location.search).get('preview') === 'true');

  // Phases: 'lobby' | 'loading' | 'welcome' | 'testing' | 'submitting' | 'result' | 'error'
  const [phase, setPhase] = useState<'lobby' | 'loading' | 'welcome' | 'testing' | 'submitting' | 'result' | 'error'>(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialExamId = directExamId || urlParams?.get('examId') || urlParams?.get('exam') || urlParams?.get('id') || '';
    return initialExamId ? 'loading' : 'lobby';
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pinSearchInput, setPinSearchInput] = useState<string>('');

  // Exam and questions data
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Student identification state
  const [studentCodeInput, setStudentCodeInput] = useState<string>(() => {
    if (isPreviewMode) return 'DEMO-PREVIEW';
    return typeof localStorage !== 'undefined' ? localStorage.getItem('student_session_code') || '' : '';
  });
  const [studentNameInput, setStudentNameInput] = useState<string>(() => {
    if (isPreviewMode) return 'معاينة تجريبية';
    return '';
  });
  const [matchedStudent, setMatchedStudent] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  // Testing state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1800); // 30 mins default
  const [startTime, setStartTime] = useState<number>(0);

  // Result state
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Local Toasts
  const [examToasts, setExamToasts] = useState<Array<{ id: string; text: string; type: 'success' | 'error' | 'info' | 'warning' }>>([]);
  const showExamToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setExamToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setExamToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Default rich public exams curriculum
  const availablePublicExams = [
    {
      id: 'ict_g6_2026',
      title: 'اختبار تكنولوجيا المعلومات والاتصالات - الصف السادس الابتدائي',
      courseName: 'تكنولوجيا المعلومات والاتصالات ICT',
      gradeKey: 'سادس',
      durationMinutes: 30,
      totalMarks: 100,
      passingMarks: 60,
      icon: '💻',
      badge: 'المنهج المعتمد 2026',
      description: 'اختبار تفاعلي شامل يغطي مهارات الحوسبة السحابية، أدوات الذكاء الاصطناعي والأمن الرقمي.'
    },
    {
      id: 'ict_g5_2026',
      title: 'اختبار مهارات الحاسب والإنترنت - الصف الخامس الابتدائي',
      courseName: 'تكنولوجيا المعلومات والاتصالات ICT',
      gradeKey: 'خامس',
      durationMinutes: 30,
      totalMarks: 100,
      passingMarks: 60,
      icon: '🌐',
      badge: 'تقييم مهارات',
      description: 'تقييم شامل على أدوات معالجة الكلمات، الجداول الإلكترونية، والبحث الآمن على شبكة الإنترنت.'
    },
    {
      id: 'ict_g4_2026',
      title: 'اختبار أساسيات التكنولوجيا والتطبيقات - الصف الرابع الابتدائي',
      courseName: 'تكنولوجيا المعلومات والاتصالات ICT',
      gradeKey: 'رابع',
      durationMinutes: 25,
      totalMarks: 100,
      passingMarks: 60,
      icon: '🖥️',
      badge: 'تحدي الطلاب',
      description: 'اختبار تفاعلي ممتع في مكونات الحاسوب ووحدات الإدخال والإخراج ومهارات الرسام والتنسيق.'
    },
    {
      id: 'general_tech_quiz',
      title: 'مسابقة التحدي التفاعلية في تكنولوجيا المستقبل والبرمجة',
      courseName: 'المهارات الرقمية المتقدمة',
      gradeKey: 'سادس',
      durationMinutes: 20,
      totalMarks: 50,
      passingMarks: 30,
      icon: '⚡',
      badge: 'تحدي مباشر',
      description: 'مسابقة حية للمتدربين لقياس سرعة البديهة والمهارات التقنية مع إصدار شهادة فورية.'
    }
  ];

  const handleSelectLobbyExam = (exam: typeof availablePublicExams[0]) => {
    setExamId(exam.id);
    setExamData({
      id: exam.id,
      title: exam.title,
      courseName: exam.courseName,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      instructions: 'يرجى قراءة كل سؤال بعناية واختيار الإجابة الصحيحة قبل انتهاء الوقت.'
    });
    const loadedQuestions = getCurriculumExamQuestions(exam.gradeKey, 'ar', exam.id);
    setQuestions(loadedQuestions);
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setPhase('welcome');
  };

  const handlePinSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinSearchInput.trim();
    if (!pin) return;
    setExamId(pin);
  };

  // Safe navigation back / close
  const handleClose = () => {
    if (phase !== 'lobby' && !directExamId && !new URLSearchParams(window.location.search).get('examId')) {
      setPhase('lobby');
      return;
    }
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  // Load Exam Data on mount or when examId changes
  useEffect(() => {
    if (!examId) {
      setPhase('lobby');
      return;
    }

    const loadExam = async () => {
      setPhase('loading');
      try {
        const res = await api.getPublicExam(examId);
        if (res.success && res.exam) {
          setExamData(res.exam);
          const duration = Number(res.exam.durationMinutes) || 30;
          setTimeLeftSeconds(duration * 60);

          let loadedQuestions = res.questions || [];
          if (!loadedQuestions || loadedQuestions.length === 0) {
            const isLang = res.exam.title?.toLowerCase().includes('lang') || res.exam.title?.toLowerCase().includes('لغات') || res.exam.title?.toLowerCase().includes('english');
            const gradeKey = res.exam.title?.includes('رابع') ? 'رابع' : (res.exam.title?.includes('خامس') ? 'خامس' : 'سادس');
            loadedQuestions = getCurriculumExamQuestions(gradeKey, isLang ? 'en' : 'ar', examId);
          }

          setQuestions(loadedQuestions);
          setPhase('welcome');
        } else {
          // If not in db, find in available curriculum exams or fallback
          const matched = availablePublicExams.find(e => e.id === examId);
          if (matched) {
            handleSelectLobbyExam(matched);
          } else {
            const fallbackQuestions = getCurriculumExamQuestions('سادس', 'ar', examId);
            setExamData({
              id: examId,
              title: `اختبار التحدي التفاعلي (${examId})`,
              courseName: 'تكنولوجيا المعلومات والاتصالات',
              durationMinutes: 30,
              totalMarks: 100,
              passingMarks: 60,
              instructions: 'يرجى قراءة الأسئلة بدقة واختيار الإجابة الصحيحة.'
            });
            setQuestions(fallbackQuestions);
            setTimeLeftSeconds(30 * 60);
            setPhase('welcome');
          }
        }
      } catch (err: any) {
        console.error('Error loading public exam:', err);
        const fallbackQuestions = getCurriculumExamQuestions('سادس', 'ar', examId);
        setExamData({
          id: examId,
          title: 'اختبار تكنولوجيا المعلومات والاتصالات - الصف السادس الابتدائي',
          courseName: 'تكنولوجيا المعلومات والاتصالات',
          durationMinutes: 30,
          totalMarks: 100,
          passingMarks: 60,
          instructions: 'يرجى قراءة الأسئلة بدقة واختيار الإجابة الصحيحة.'
        });
        setQuestions(fallbackQuestions);
        setTimeLeftSeconds(30 * 60);
        setPhase('welcome');
      }
    };

    loadExam();
  }, [examId]);

  // Lookup student by code with debounce
  useEffect(() => {
    if (isPreviewMode) return;
    const code = studentCodeInput.trim();
    if (!code || code.length < 2) {
      setMatchedStudent(null);
      return;
    }

    setIsLookingUp(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.lookupTraineeByCode(code);
        if (res.success && res.trainee) {
          setMatchedStudent(res.trainee);
          setStudentNameInput(res.trainee.fullName);
        } else {
          setMatchedStudent(null);
        }
      } catch (e) {
        setMatchedStudent(null);
      } finally {
        setIsLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [studentCodeInput, isPreviewMode]);

  // Countdown Timer
  useEffect(() => {
    if (phase !== 'testing') return;

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Start Exam
  const handleStartExam = () => {
    const code = studentCodeInput.trim();
    const name = (matchedStudent?.fullName || studentNameInput).trim();

    if (!code && !name && !isPreviewMode) {
      showExamToast('يرجى إدخال كود الطالب أو اسمك للبدء في الاختبار.', 'warning');
      return;
    }

    if (code && !isPreviewMode) {
      localStorage.setItem('student_session_code', code);
    }

    setStartTime(Date.now());
    setCurrentIndex(0);
    setPhase('testing');
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (phase === 'submitting') return;

    const unansweredCount = questions.length - Object.keys(studentAnswers).length;
    if (unansweredCount > 0 && timeLeftSeconds > 10) {
      const confirmSubmit = window.confirm(`لديك ${unansweredCount} سؤال لم تجب عليه بعد. هل أنت متأكد من تسليم الاختبار الآن؟`);
      if (!confirmSubmit) return;
    }

    setPhase('submitting');
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // In Preview Mode, calculate score locally to avoid polluting production database
    if (isPreviewMode) {
      let earnedMarks = 0;
      let totalMarks = 0;
      const review = questions.map((q, idx) => {
        const studentAns = (studentAnswers[q.id] || '').trim();
        const correctAns = (q.correctAnswer || '').trim();
        const qMarks = Number(q.marks) || 10;
        totalMarks += qMarks;

        const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();
        if (isCorrect) earnedMarks += qMarks;

        return {
          questionNumber: idx + 1,
          questionText: q.questionText,
          studentAnswer: studentAns || 'لم تتم الإجابة',
          correctAnswer: correctAns,
          isCorrect,
          marksEarned: isCorrect ? qMarks : 0,
          marksTotal: qMarks,
          explanation: q.explanation || ''
        };
      });

      const percentage = Math.round((earnedMarks / Math.max(totalMarks, 1)) * 100);
      const passMarks = Number(examData?.passingMarks) || Math.round(totalMarks * 0.6);
      const passed = earnedMarks >= passMarks;

      const mockRes = {
        success: true,
        score: earnedMarks,
        totalMarks,
        percentage,
        passed,
        rating: percentage >= 90 ? 'ممتاز' : percentage >= 80 ? 'جيد جداً' : percentage >= 65 ? 'جيد' : passed ? 'مقبول' : 'يحتاج متابعة',
        traineeName: 'معاينة تجريبية (المعلم)',
        traineeCode: 'DEMO-PREVIEW',
        answerReview: review
      };

      setTimeout(() => {
        setSubmissionResult(mockRes);
        setPhase('result');
        if (passed) {
          try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        }
      }, 500);
      return;
    }

    // Real student submission to API
    try {
      const res = await api.submitPublicExam(examId, {
        traineeCode: studentCodeInput.trim() || matchedStudent?.code,
        traineeName: matchedStudent?.fullName || studentNameInput.trim() || 'طالب',
        answers: studentAnswers,
        timeSpentSeconds: timeSpent
      });

      if (res.success) {
        setSubmissionResult(res);
        setPhase('result');

        if (res.passed) {
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch (e) {}
        }
      } else {
        showExamToast('حدث خطأ أثناء إرسال الإجابات، يرجى المحاولة مرة أخرى.', 'error');
        setPhase('testing');
      }
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      showExamToast(err.message || 'فشل إرسال إجابات الاختبار', 'error');
      setPhase('testing');
    }
  };

  // Re-take exam (available in Preview Mode only)
  const handleRetakeExam = () => {
    setStudentAnswers({});
    setTimeLeftSeconds((examData?.durationMinutes || 30) * 60);
    setCurrentIndex(0);
    setSubmissionResult(null);
    setPhase('welcome');
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Share result WhatsApp
  const handleShareResult = () => {
    if (!submissionResult) return;
    const text = `🏆 *نتيجة الاختبار التفاعلي* 🌟\n\n👤 *الطالب:* ${submissionResult.traineeName}\n📝 *الاختبار:* ${examData?.title}\n🎯 *الدرجة:* ${submissionResult.score} من ${submissionResult.totalMarks} (${submissionResult.percentage}%)\n🎖️ *التقدير:* ${submissionResult.rating}\n\n*مركز النجاح للتدريب والاستشارات*`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Unified, Harmonious Theme Styles (NO white patches on dark background!)
  const containerClasses = isDarkMode
    ? 'dark bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900';

  const cardClasses = isDarkMode
    ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl'
    : 'bg-white border-slate-200 text-slate-900 shadow-xl';

  const subCardClasses = isDarkMode
    ? 'bg-slate-850/80 border-slate-800 text-slate-200'
    : 'bg-slate-50 border-slate-200 text-slate-800';

  const headerClasses = isDarkMode
    ? 'bg-slate-900/95 border-slate-800 text-white'
    : 'bg-white/95 border-slate-200 text-slate-900';

  const inputClasses = isDarkMode
    ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white';

  // ----------------------------------------------------
  // UNIVERSAL TOP CLOSE BUTTON & TOAST OVERLAY (Always visible on all screens!)
  // ----------------------------------------------------
  const renderTopCloseButton = () => (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[100] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800/90 hover:bg-slate-900 text-white flex items-center justify-center shadow-2xl border border-white/20 transition-transform active:scale-90 cursor-pointer"
        title="إغلاق والعودة (X)"
        aria-label="إغلاق"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {examToasts.length > 0 && (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {examToasts.map(t => (
            <div
              key={t.id}
              className={`p-3 rounded-2xl shadow-xl border text-xs font-bold pointer-events-auto transition-all animate-in slide-in-from-bottom-2 flex items-center justify-between gap-2 backdrop-blur-md ${
                t.type === 'success' ? 'bg-emerald-900/90 text-white border-emerald-500/40' :
                t.type === 'error' ? 'bg-rose-900/90 text-white border-rose-500/40' :
                t.type === 'warning' ? 'bg-amber-900/90 text-white border-amber-500/40' :
                'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ----------------------------------------------------
  // PHASE: LOBBY (Direct Exam Selection & PIN Entry)
  // ----------------------------------------------------
  if (phase === 'lobby') {
    return (
      <div className={`min-h-[100dvh] w-full overflow-y-auto ${containerClasses} flex flex-col items-center justify-start py-6 px-3 sm:px-6 transition-colors dir-rtl relative font-sans`} dir="rtl">
        {renderTopCloseButton()}

        {/* Top Controls */}
        <div className="max-w-4xl w-full flex items-center justify-between gap-2 mb-4 pt-10 sm:pt-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                منصة الاختبارات الإلكترونية والتحديات
              </h1>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                مركز النجاح للتدريب والاستشارات
              </p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title="تبديل الوضع النهاري / الليلي"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span className="hidden sm:inline">{isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
          </button>
        </div>

        {/* PIN Search Bar */}
        <div className={`max-w-4xl w-full ${cardClasses} border rounded-2xl p-4 sm:p-5 shadow-lg mb-5`}>
          <form onSubmit={handlePinSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <HelpCircle className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="لديك كود اختبار خاص (Exam PIN أو كود المعلم)؟ اكتبه هنا..."
                value={pinSearchInput}
                onChange={(e) => setPinSearchInput(e.target.value)}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${inputClasses}`}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>فتح الاختبار بالكود</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </form>
        </div>

        {/* Active Public Exams Grid */}
        <div className="max-w-4xl w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>📚 الاختبارات المتاحة والتحديات التفاعلية</span>
            </h2>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              تفاعلي مع التصحيح الفوري
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {availablePublicExams.map((exam) => (
              <div
                key={exam.id}
                className={`${cardClasses} border hover:border-blue-500/80 rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-3 group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                      {exam.icon}
                    </span>
                    <span className="text-[10px] font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      {exam.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {exam.title}
                  </h3>

                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                    {exam.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{exam.totalMarks} درجة (النجاح {exam.passingMarks})</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectLobbyExam(exam)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>بدء الاختبار الآن</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE: LOADING
  // ----------------------------------------------------
  if (phase === 'loading') {
    return (
      <div className={`min-h-screen ${containerClasses} flex flex-col items-center justify-center p-4 transition-colors relative`}>
        {renderTopCloseButton()}
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">جاري تحميل الاختبار...</h2>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
          يتم تجهيز الأسئلة والخيارات المعتمدة
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE: ERROR
  // ----------------------------------------------------
  if (phase === 'error') {
    return (
      <div className={`min-h-screen ${containerClasses} flex flex-col items-center justify-center p-4 text-center transition-colors relative`}>
        {renderTopCloseButton()}
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">عذراً، تعذر فتح الاختبار</h2>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md mb-6`}>{errorMessage}</p>
        <button
          type="button"
          onClick={handleClose}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
        >
          العودة
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE 1: WELCOME & IDENTIFICATION
  // ----------------------------------------------------
  if (phase === 'welcome') {
    return (
      <div className={`min-h-[100dvh] w-full overflow-y-auto overscroll-y-contain ${containerClasses} flex flex-col items-center justify-start sm:justify-center py-6 sm:py-10 px-3 sm:px-4 transition-colors dir-rtl relative`}>
        {/* Prominent Floating Close Button */}
        {renderTopCloseButton()}

        {/* Top Controls: Mode Indicator & Theme Switcher */}
        <div className="max-w-lg w-full flex items-center justify-between gap-2 mb-3 px-1 pt-10 sm:pt-0">
          {isPreviewMode ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-full text-xs shadow-sm">
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة المعلم</span>
            </div>
          ) : (
            <div />
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title="تبديل الوضع النهاري / الليلي"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
          </button>
        </div>

        {/* Main Card */}
        <div className={`max-w-lg w-full ${cardClasses} border rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl`}>

          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مركز النجاح للتدريب والاستشارات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-snug">
              {examData?.title}
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {examData?.courseName} {examData?.groupName ? `• ${examData?.groupName}` : ''}
            </p>
          </div>

          {/* Summary Cards with Perfect Theme Harmony */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className={`${subCardClasses} p-3 rounded-2xl border`}>
              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block`}>المدة</span>
              <span className="text-xs font-bold">{examData?.durationMinutes || 30} دقيقة</span>
            </div>

            <div className={`${subCardClasses} p-3 rounded-2xl border`}>
              <HelpCircle className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block`}>الأسئلة</span>
              <span className="text-xs font-bold">{questions.length} سؤال</span>
            </div>

            <div className={`${subCardClasses} p-3 rounded-2xl border`}>
              <Award className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block`}>الدرجة</span>
              <span className="text-xs font-bold">{examData?.totalMarks || 100} درجة</span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
            isDarkMode
              ? 'bg-blue-950/40 border-blue-900/60 text-blue-200'
              : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
          }`}>
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>تعليمات الاختبار:</span>
            </p>
            <p>{examData?.instructions || 'يرجى الإجابة عن جميع الأسئلة والالتزام بالوقت المحدد.'}</p>
          </div>

          {/* Student Identification / Preview Guidance */}
          <div className="space-y-4 pt-1">
            {!isPreviewMode ? (
              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center justify-between">
                  <span>كود الطالب أو رقم الهاتف:</span>
                  {isLookingUp && <span className="text-blue-500 text-[10px] animate-pulse">جاري التحقق...</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: A001 أو رقم الهاتف"
                    value={studentCodeInput}
                    onChange={e => setStudentCodeInput(e.target.value)}
                    className={`w-full p-3.5 ${inputClasses} border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {matchedStudent && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{matchedStudent.fullName}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-3.5 rounded-2xl text-xs space-y-1 border ${
                isDarkMode
                  ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <p className="font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>معاينة كطالب:</span>
                </p>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  أنت الآن في وضع المعاينة التجريبية للمعلم. يمكنك اختبار حل الأسئلة ورؤية كيفية ظهور شاشات الطالب والتصحيح دون تسجيل أي درجات في الكشوفات الرسمية.
                </p>
              </div>
            )}

            {/* Start Button */}
            <button
              type="button"
              onClick={handleStartExam}
              disabled={(!studentCodeInput.trim() && !studentNameInput.trim() && !isPreviewMode) || questions.length === 0}
              className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                (!studentCodeInput.trim() && !studentNameInput.trim() && !isPreviewMode) || questions.length === 0
                  ? 'bg-slate-400 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25 active:scale-[0.99]'
              }`}
            >
              <span>
                {questions.length === 0
                  ? 'لا توجد أسئلة متاحة حالياً'
                  : isPreviewMode
                  ? 'بدء المعاينة كطالب 🚀'
                  : 'بدء الاختبار الآن 🚀'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE 2: TESTING SCREEN
  // ----------------------------------------------------
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(studentAnswers).length;
  const progressPercent = Math.round((answeredCount / Math.max(questions.length, 1)) * 100);

  if (phase === 'testing' && currentQ) {
    return (
      <div className={`min-h-[100dvh] w-full overflow-y-auto overscroll-y-contain ${containerClasses} flex flex-col transition-colors dir-rtl relative`}>
        {/* Top Fixed Header with integrated X Close button */}
        <header className={`sticky top-0 z-40 ${headerClasses} backdrop-blur-md border-b px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-bold text-xs sm:text-sm truncate max-w-[160px] sm:max-w-md">{examData?.title}</h2>
                {isPreviewMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shrink-0">
                    معاينة
                  </span>
                )}
              </div>
              <p className={`text-[10px] sm:text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {matchedStudent?.fullName || studentNameInput || 'طالب'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Countdown Clock */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono font-bold text-xs ${
                timeLeftSeconds < 300
                  ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse'
                  : isDarkMode
                  ? 'bg-slate-850 border-slate-700 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="تبديل الوضع"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Prominent Header Close (X) Button */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-slate-700/60"
                title="إغلاق الاختبار والعودة (X)"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Progress Line */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        {/* Question Area */}
        <main className="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-6 pb-28 sm:pb-12 flex flex-col justify-between space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Question Card */}
            <div className={`${cardClasses} border rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-3 sm:space-y-4 shadow-xl`}>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs">
                  السؤال {currentIndex + 1} من {questions.length}
                </span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  {currentQ.marks || 10} درجات
                </span>
              </div>

              <h3 className="text-sm sm:text-lg font-bold leading-relaxed pt-1 sm:pt-2">
                {currentQ.questionText}
              </h3>

              {/* Options */}
              {Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
                <div className="space-y-2 sm:space-y-2.5 pt-2 sm:pt-4">
                  {currentQ.options.map((opt: string, optIdx: number) => {
                    const isSelected = studentAnswers[currentQ.id] === opt;
                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => {
                          setStudentAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
                        }}
                        className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-right font-medium text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                            : isDarkMode
                            ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
                            isSelected
                              ? 'bg-white text-blue-700 border-white'
                              : isDarkMode
                              ? 'border-slate-700 text-slate-400 bg-slate-800'
                              : 'border-slate-300 text-slate-500 bg-white'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 mr-1" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer / Fill Blanks Input */}
              {(!currentQ.options || currentQ.options.length === 0) && (
                <div className="pt-2 sm:pt-4">
                  <textarea
                    rows={3}
                    placeholder="اكتب إجابتك هنا بوضوح..."
                    value={studentAnswers[currentQ.id] || ''}
                    onChange={e => setStudentAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                    className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium ${inputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Navigation Controls for seamless mobile and desktop experience */}
          <div className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-2xl -mx-3 -mb-3 sm:mx-0 sm:mb-0 sm:rounded-2xl mt-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentIndex === 0
                    ? 'opacity-30 cursor-not-allowed border-transparent'
                    : isDarkMode
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-850'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>تسليم الاختبار وإنهاء 🏁</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>السؤال التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE: SUBMITTING
  // ----------------------------------------------------
  if (phase === 'submitting') {
    return (
      <div className={`min-h-screen ${containerClasses} flex flex-col items-center justify-center p-4 transition-colors relative`}>
        {renderTopCloseButton()}
        <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">جاري تسليم وتصحيح الاختبار...</h2>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
          يتم احتساب الدرجات وإعداد تقرير الأداء
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // PHASE 3: RESULTS SCREEN (CLEAN, NO STUDENT TAMPERING)
  // ----------------------------------------------------
  if (phase === 'result' && submissionResult) {
    return (
      <div className={`min-h-[100dvh] w-full overflow-y-auto overscroll-y-contain ${containerClasses} flex flex-col items-center justify-start sm:justify-center py-6 sm:py-10 px-3 sm:px-6 transition-colors dir-rtl relative`}>
        {/* Prominent Floating Close Button */}
        {renderTopCloseButton()}

        <div className={`max-w-2xl w-full ${cardClasses} border rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 my-4 sm:my-auto pt-10 sm:pt-8 shadow-2xl`}>

          {/* Trophy Header */}
          <div className="text-center space-y-3">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl ${
                submissionResult.passed
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30'
                  : isDarkMode
                  ? 'bg-slate-800 text-amber-400'
                  : 'bg-slate-100 text-amber-600'
              }`}
            >
              {submissionResult.passed ? <Trophy className="w-10 h-10 animate-bounce" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div>
              <span className="text-xs text-blue-500 font-bold uppercase tracking-wider block">
                نتيجة التقييم
              </span>
              <h2 className="text-2xl font-black mt-1">
                {submissionResult.passed ? 'مبارك النجاح والتفوق! 🎉' : 'تم تسليم الاختبار'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                المتدرب: <span className="font-bold">{submissionResult.traineeName}</span> • كود: {submissionResult.traineeCode}
              </p>
            </div>
          </div>

          {/* Score Showcase with Harmonious Colors */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={`${subCardClasses} p-4 rounded-2xl border`}>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block mb-1`}>الدرجة المحققة</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-500">
                {submissionResult.score} / {submissionResult.totalMarks}
              </p>
            </div>

            <div className={`${subCardClasses} p-4 rounded-2xl border`}>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block mb-1`}>النسبة</span>
              <p className="text-xl sm:text-2xl font-black text-blue-500">
                {submissionResult.percentage}%
              </p>
            </div>

            <div className={`${subCardClasses} p-4 rounded-2xl border`}>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block mb-1`}>التقدير</span>
              <p className={`text-lg sm:text-xl font-black ${submissionResult.passed ? 'text-amber-500' : 'text-slate-400'}`}>
                {submissionResult.passed ? submissionResult.rating : 'يحتاج متابعة'}
              </p>
            </div>
          </div>

          {/* Status Notice */}
          {submissionResult.passed ? (
            <div className={`p-3 rounded-2xl flex items-center gap-2.5 text-xs border ${
              isDarkMode
                ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>تم رصد درجاتك في سجل الاختبار بنجاح.</span>
            </div>
          ) : (
            <div className={`p-3.5 rounded-2xl text-xs space-y-1 border ${
              isDarkMode
                ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <p className="font-bold flex items-center gap-1.5 text-amber-500">
                <RotateCcw className="w-4 h-4" />
                <span>إشعار النتيجة:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                لم يتم اجتياز درجة النجاح في هذه المحاولة. يمكنك مراجعة الأسئلة والإجابات النموذجية أدناه لتعزيز المهارات.
              </p>
            </div>
          )}

          {/* Action Toolbar (NO delete button for students!) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isPreviewMode && (
              <button
                type="button"
                onClick={handleRetakeExam}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة التجربة (معاينة) 🔄</span>
              </button>
            )}

            {submissionResult.passed && (
              <button
                type="button"
                onClick={handleShareResult}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة النتيجة 💬</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة النتيجة 🖨️</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className={`py-2.5 px-6 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <span>إغلاق</span>
            </button>
          </div>

          {/* Question Review Section */}
          {submissionResult.answerReview && submissionResult.answerReview.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                مراجعة الإجابات النموذجية ({submissionResult.answerReview.length} سؤال):
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {submissionResult.answerReview.map((rev: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      rev.isCorrect
                        ? isDarkMode
                          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : isDarkMode
                          ? 'bg-red-950/20 border-red-800/60 text-red-200'
                          : 'bg-red-50/80 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {rev.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>السؤال {rev.questionNumber}: {rev.questionText}</span>
                      </span>
                      <span className="shrink-0 text-[11px]">
                        {rev.marksEarned} / {rev.marksTotal} درجة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <p>
                        <span className="opacity-70">إجابتك: </span>
                        <strong className={rev.isCorrect ? 'text-emerald-500' : 'text-red-500'}>
                          {rev.studentAnswer}
                        </strong>
                      </p>
                      {!rev.isCorrect && (
                        <p>
                          <span className="opacity-70">الإجابة الصحيحة: </span>
                          <strong className="text-emerald-500">{rev.correctAnswer}</strong>
                        </p>
                      )}
                    </div>

                    {rev.explanation && (
                      <p className={`text-[10px] pt-1 border-t ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        الشرح: {rev.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
};
