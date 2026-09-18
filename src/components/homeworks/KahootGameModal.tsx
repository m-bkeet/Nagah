import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, RotateCcw, Award, CheckCircle2, XCircle, Clock, 
  Flame, Sparkles, Send, Volume2, VolumeX, User, Share2, Star, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssignmentTask, Trainee, KahootQuestion } from '../../types';
import { api } from '../../services/api';

interface KahootGameModalProps {
  assignment: AssignmentTask;
  trainees?: Trainee[];
  currentStudentId?: string;
  onClose: () => void;
  onCompleted?: (result: any) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// ----------------------------------------------------
// Offline Web Audio Synthesizer (Zero External Dependencies)
// ----------------------------------------------------
class PureAudioSynth {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        const start = this.ctx!.currentTime + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  }

  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (e) {}
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      melody.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        const start = this.ctx!.currentTime + idx * 0.1;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {}
  }
}

const audioSynth = new PureAudioSynth();

export const KahootGameModal: React.FC<KahootGameModalProps> = ({
  assignment,
  trainees = [],
  currentStudentId,
  onClose,
  onCompleted,
  onShowToast
}) => {
  // Determine questions source
  const questions: KahootQuestion[] = React.useMemo(() => {
    if (assignment.quizGame?.questions && assignment.quizGame.questions.length > 0) {
      return assignment.quizGame.questions;
    }
    // Fallback question if none provided
    return [
      {
        id: 'q-demo-1',
        type: 'mcq',
        question: assignment.title || 'سؤال التقييم التفاعلي',
        options: [
          'الخيار الأول الصحيح 🌟',
          'الخيار الثاني 📌',
          'الخيار الثالث 💡',
          'الخيار الرابع 🎯'
        ],
        correctIndex: 0,
        timeLimit: 20,
        explanation: assignment.description || 'تم التحقق من الإجابة النموذجية المعتمدة.'
      }
    ];
  }, [assignment]);

  // Stage: 'lobby' | 'playing' | 'answer_revealed' | 'finished'
  const [stage, setStage] = useState<'lobby' | 'playing' | 'answer_revealed' | 'finished'>('lobby');

  // Player Selection State
  const initialStudent = trainees.find(t => t.id === currentStudentId) || trainees[0];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent?.id || 'guest');
  const [customStudentName, setCustomStudentName] = useState<string>(initialStudent?.name || 'متدرب متميز');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Game Engine State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQ = questions[currentIndex] || questions[0];
  const maxQuestionTime = currentQ.timeLimit || assignment.quizGame?.timeLimitDefault || 20;

  // Sync selected trainee name
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    if (id === 'guest') {
      setCustomStudentName('متدرب متميز (ضيف)');
    } else {
      const found = trainees.find(t => t.id === id);
      if (found) setCustomStudentName(found.name);
    }
  };

  // Start the Game
  const handleStartGame = () => {
    setStage('playing');
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectAnswersCount(0);
    setTotalTimeSpent(0);
    setIsSavedSuccessfully(false);
    startTimeRef.current = Date.now();
    startTimerForQuestion(maxQuestionTime);
  };

  const startTimerForQuestion = (secs: number) => {
    clearInterval(timerRef.current);
    setTimeLeft(secs);
    setSelectedOption(null);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          audioSynth.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    audioSynth.playWrong();
    setSelectedOption(-1); // Timeout
    setStreak(0);
    setStage('answer_revealed');
  };

  const handleChooseOption = (optIndex: number) => {
    if (stage !== 'playing') return;
    clearInterval(timerRef.current);
    setSelectedOption(optIndex);

    const isCorrect = optIndex === currentQ.correctIndex;
    const timeBonus = Math.round((timeLeft / maxQuestionTime) * 1000);
    const earnedThisQ = isCorrect ? (1000 + timeBonus) : 0;

    if (isCorrect) {
      audioSynth.playCorrect();
      setScore(prev => prev + earnedThisQ);
      setCorrectAnswersCount(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      audioSynth.playWrong();
      setStreak(0);
    }

    setStage('answer_revealed');
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setStage('playing');
      const nextQ = questions[nextIndex];
      startTimerForQuestion(nextQ.timeLimit || maxQuestionTime);
    } else {
      // Game Complete
      clearInterval(timerRef.current);
      const totalElapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setTotalTimeSpent(totalElapsed);
      setStage('finished');
      audioSynth.playFanfare();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Submit Result to Server to Record Points & Grade
  const handleSaveResultToDatabase = async () => {
    setIsSavingResult(true);
    try {
      const percentage = Math.round((correctAnswersCount / questions.length) * 100);
      const scaledGrade = Math.round((percentage / 100) * (assignment.totalMarks || 100));

      if (assignment.id.startsWith('preview-')) {
        setIsSavedSuccessfully(true);
        if (onShowToast) onShowToast('أحسنت! انتهت جلسة المعاينة بنجاح، المسابقة ممتازة وجاهزة للنشر للطلاب 🎉', 'success');
        if (onCompleted) onCompleted({ score: scaledGrade, percentage });
        return;
      }

      const traineeObj = trainees.find(t => t.id === selectedStudentId);

      const res = await api.submitQuizResult({
        assignmentId: assignment.id,
        traineeId: selectedStudentId !== 'guest' ? selectedStudentId : undefined,
        traineeCode: traineeObj?.code || 'م000',
        traineeName: traineeObj?.name || customStudentName,
        taskTitle: assignment.title,
        score: scaledGrade,
        maxScore: assignment.totalMarks || 100,
        percentage,
        starsEarned: percentage >= 85 ? 3 : percentage >= 65 ? 2 : 1,
        totalTimeSpent
      });

      if (res.success) {
        setIsSavedSuccessfully(true);
        if (onShowToast) onShowToast('تم رصد النتيجة وإضافة النجوم والنقاط للمتدرب بنجاح! 🎉', 'success');
        if (onCompleted) onCompleted(res.submission);
      }
    } catch (e: any) {
      if (onShowToast) onShowToast(e.message || 'فشل حفظ النتيجة', 'error');
    } finally {
      setIsSavingResult(false);
    }
  };

  // WhatsApp Share Message Generator
  const handleShareOnWhatsApp = () => {
    const pct = Math.round((correctAnswersCount / questions.length) * 100);
    const msg = `🏆 *إنجاز تحدي كاهوت التفاعلي - مركز النجاح* 🏆\n\n` +
      `👤 *المتدرب:* ${customStudentName}\n` +
      `📚 *المادة:* ${assignment.courseName || 'المنهج الدراسي'}\n` +
      `📝 *الواجب:* ${assignment.title}\n` +
      `🎯 *الدرجة:* ${correctAnswersCount} من ${questions.length} أسئلة (${pct}%)\n` +
      `🔥 *أعلى ستريك متتالي:* ${bestStreak}\n` +
      `⏱️ *الوقت المستغرق:* ${totalTimeSpent} ثانية\n\n` +
      `✨ عاش يا بطل! استمر في التفوق وتصدر لوحة الشرف! ⭐`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  // Classic Kahoot 4 Colors
  const kahootOptions = [
    { color: 'bg-red-500 hover:bg-red-600', border: 'border-red-400', icon: '🔺', name: 'أحمر' },
    { color: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-400', icon: '🔷', name: 'أزرق' },
    { color: 'bg-amber-400 hover:bg-amber-500 text-slate-950', border: 'border-amber-300', icon: '🟡', name: 'أصفر' },
    { color: 'bg-emerald-500 hover:bg-emerald-600', border: 'border-emerald-400', icon: '🟩', name: 'أخضر' }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-lg overflow-hidden animate-fade-in" dir="rtl">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{assignment.title}</h3>
                {assignment.id.startsWith('preview-') ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                    وضع معاينة المعلم 👁️
                  </span>
                ) : (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                    وضع كاهوت التفاعلي 🎮
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {assignment.courseName || 'التقييم الذكي المعتمد'} • {questions.length} أسئلة تفاعلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !isAudioMuted;
                setIsAudioMuted(next);
                audioSynth.isMuted = next;
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                isAudioMuted 
                  ? 'bg-rose-950/50 border-rose-800 text-rose-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isAudioMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">

          {/* 1. LOBBY STAGE */}
          {stage === 'lobby' && (
            <div className="max-w-xl mx-auto py-6 space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-purple-500/20 animate-bounce">
                🎯
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">تحدي الواجب التفاعلي الذكي</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  جاهز لبدء التحدي التفاعلي بنظام كاهوت؟ أجب بأقصى سرعة ودقة لتسجيل أعلى النقاط والظفر بالوسام الذهبي!
                </p>
              </div>

              {/* Assignment Details Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-right space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">عدد الأسئلة</span>
                    <strong className="text-sm text-amber-400 font-mono">{questions.length}</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">زمن السؤال</span>
                    <strong className="text-sm text-blue-400 font-mono">{maxQuestionTime}ث</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">الدرجة الكلية</span>
                    <strong className="text-sm text-emerald-400 font-mono">{assignment.totalMarks || 100}</strong>
                  </div>
                </div>

                {/* Trainee Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    المتدرب الذي سيقوم بحل التحدي:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="guest">👤 متدرب متميز (تجربة سريعة)</option>
                    {trainees.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code || 'بدون كود'}) - {t.grade || t.courseName || ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-purple-600 hover:opacity-95 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all transform active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>انطلق في التحدي التفاعلي الآن! 🚀</span>
              </button>
            </div>
          )}

          {/* 2 & 3. PLAYING / REVEALED STAGE */}
          {(stage === 'playing' || stage === 'answer_revealed') && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Progress & Stats Bar */}
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-mono">
                    {currentIndex + 1} / {questions.length}
                  </span>
                  <span>{customStudentName}</span>
                </div>

                <div className="flex items-center gap-4">
                  {streak > 1 && (
                    <div className="flex items-center gap-1 text-amber-400 font-black animate-pulse">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      <span>{streak}x ستريك متتالي!</span>
                    </div>
                  )}

                  <div className="bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-emerald-400 font-mono font-black">
                    {score} نقطة
                  </div>
                </div>
              </div>

              {/* Timer Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    المتبقي من الوقت
                  </span>
                  <span className={`font-mono font-black text-sm ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-slate-200'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(timeLeft / maxQuestionTime) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-lg relative">
                {currentQ.emojiOrTheme && (
                  <div className="text-3xl mb-3">{currentQ.emojiOrTheme}</div>
                )}
                <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Kahoot Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt, idx) => {
                  const kahootStyle = kahootOptions[idx % kahootOptions.length];
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const showResultState = stage === 'answer_revealed';

                  let cardClass = `${kahootStyle.color} ${kahootStyle.border}`;
                  if (showResultState) {
                    if (isCorrect) {
                      cardClass = 'bg-emerald-600 border-emerald-400 ring-4 ring-emerald-500/50';
                    } else if (isChosen) {
                      cardClass = 'bg-rose-600 border-rose-400 opacity-80';
                    } else {
                      cardClass = 'bg-slate-800 border-slate-700 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={stage !== 'playing'}
                      onClick={() => handleChooseOption(idx)}
                      className={`p-4 sm:p-5 rounded-2xl border text-right font-bold transition-all transform active:scale-95 flex items-center justify-between text-sm sm:text-base shadow-md cursor-pointer ${cardClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{kahootStyle.icon}</span>
                        <span className="text-slate-100 leading-snug">{opt}</span>
                      </div>

                      {showResultState && isCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-white shrink-0 animate-bounce" />
                      )}
                      {showResultState && isChosen && !isCorrect && (
                        <XCircle className="w-6 h-6 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Revealed Answer Explanation Box */}
              {stage === 'answer_revealed' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedOption === currentQ.correctIndex ? (
                        <span className="text-emerald-400 font-black text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          إجابة صحيحة يا بطل! 🎉 (+1000 نقطة)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-black text-sm flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          إجابة غير دقيقة! الإجابة الصحيحة كانت الخيار ({currentQ.correctIndex + 1})
                        </span>
                      )}
                    </div>
                  </div>

                  {currentQ.explanation && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block mb-1">💡 التفسير التعليمي المعتمد:</strong>
                      {currentQ.explanation}
                    </div>
                  )}

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'السؤال التالي ⬅️' : 'عرض النتيجة النهائية ولوحة الشرف 🏆'}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* 4. FINISHED / PODIUM STAGE */}
          {stage === 'finished' && (
            <div className="max-w-xl mx-auto py-6 space-y-6 text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30">
                🏆
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">مبروك إكمال التحدي التفاعلي!</h2>
                <p className="text-xs text-slate-400">
                  أداء رائع ومبهر للمتدرب: <strong className="text-amber-400">{customStudentName}</strong>
                </p>
              </div>

              {/* Stats Summary Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 block">إجمالي النقاط</span>
                  <strong className="text-lg font-mono font-black text-amber-400">{score}</strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 block">نسبة النجاح</span>
                  <strong className="text-lg font-mono font-black text-emerald-400">
                    {Math.round((correctAnswersCount / questions.length) * 100)}%
                  </strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 block">الإجابات الصحيحة</span>
                  <strong className="text-lg font-mono font-black text-blue-400">
                    {correctAnswersCount} / {questions.length}
                  </strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 block">الوقت المستغرق</span>
                  <strong className="text-lg font-mono font-black text-purple-400">{totalTimeSpent}s</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                {!isSavedSuccessfully ? (
                  <button
                    onClick={handleSaveResultToDatabase}
                    disabled={isSavingResult}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isSavingResult ? 'جاري توثيق النتيجة...' : 'رصد النتيجة رسمياً في سجل الطالب والنقاط 🌟'}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم توثيق النتيجة ومنح النقاط والنجوم للطالب بنجاح في النظام! 🎉</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleShareOnWhatsApp}
                    className="flex-1 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة النتيجة على الواتساب 📲</span>
                  </button>

                  <button
                    onClick={handleStartGame}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة التحدي 🔄</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
