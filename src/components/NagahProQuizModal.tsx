import React, { useState, useEffect, useRef } from 'react';
import { ExamQuestion, Trainee } from '../types';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { 
  Trophy, 
  Star, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Crown, 
  Gamepad2, 
  Volume2, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NagahProQuizModalProps {
  quiz: {
    id: string;
    title: string;
    nagahQuestions: ExamQuestion[];
    quizMode?: 'Individual' | 'Team' | 'Class';
  };
  trainee: Trainee | null;
  onClose: () => void;
  onAnswer: (response: {
    questionId: string;
    selectedOption: any;
    isCorrect: boolean;
    responseTimeSeconds: number;
    points: number;
  }) => void;
}

export const NagahProQuizModal: React.FC<NagahProQuizModalProps> = ({
  quiz,
  trainee,
  onClose,
  onAnswer,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = quiz.nagahQuestions[currentQuestionIndex];

  useEffect(() => {
    // Start with a small intro delay
    const introTimeout = setTimeout(() => {
      startQuestion();
    }, 2000);
    
    speakNaturalText(`جاهز يا بطل؟ مسابقة ${quiz.title} بدأت دلوقتي.. ركز وورينا شطارتك!`);

    return () => {
      clearTimeout(introTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startQuestion = () => {
    const q = quiz.nagahQuestions[currentQuestionIndex];
    if (!q) return;

    setShowQuestion(true);
    setIsAnswered(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(q.timeLimitSeconds || 30);
    startTimeRef.current = Date.now();

    speakNaturalText(q.questionText);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setStreak(0);
    speakNaturalText('للأسف الوقت خلص! ركز في اللي جاي يا بطل.');
  };

  const handleAnswer = (option: any) => {
    if (isAnswered || timeLeft <= 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
    
    const responseTime = (Date.now() - startTimeRef.current) / 1000;
    const correct = String(option) === String(currentQuestion.correctAnswer);
    
    // Calculate points based on time and correctness
    let pointsEarned = 0;
    if (correct) {
      const basePoints = currentQuestion.marks || 1000;
      const timeBonus = Math.max(0, (timeLeft / (currentQuestion.timeLimitSeconds || 30)) * basePoints);
      pointsEarned = Math.round(basePoints + timeBonus);
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setIsCorrect(true);
      speakNaturalText(`إجابة صحيحة يا وحش! الله ينور عليك، أنت ماشي تمام جداً!`);
      playChime([523.25, 659.25, 783.99, 1046.5]);
    } else {
      setStreak(0);
      setIsCorrect(false);
      speakNaturalText(`للأسف إجابة مش مظبوطة.. ولا يهمك يا بطل، لسه فيه فرص تانية جاية!`);
      playChime([300, 200, 150]);
    }

    setIsAnswered(true);
    setSelectedOption(option);
    
    onAnswer({
      questionId: currentQuestion.id,
      selectedOption: option,
      isCorrect: correct,
      responseTimeSeconds: responseTime,
      points: pointsEarned
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < quiz.nagahQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowQuestion(false);
      setTimeout(() => startQuestion(), 1000);
    } else {
      setShowQuestion(false);
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    speakNaturalText(`عاش يا بطل! خلصنا المسابقة وجمعت ${score} نقطة.. برافو عليك جداً وشرفتنا النهاردة!`);
    // After 8 seconds, close modal or show final leaderboard
    setTimeout(() => onClose(), 8000);
  };

  useEffect(() => {
    return () => {
      audioService.stopAll();
    };
  }, []);

  const speakNaturalText = async (text: string) => {
    if (isMuted) return;
    await audioService.speakText(text);
  };

  const playChime = (freqs: number[]) => {
    if (isMuted) return;
    audioService.playChime(freqs);
  };

  if (!showQuestion && currentQuestionIndex < quiz.nagahQuestions.length) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8" dir="rtl">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/20"
        >
          <Gamepad2 className="w-16 h-16" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tight">جاهز للسؤال الجاي؟</h2>
          <p className="text-xl text-amber-400 font-bold">السؤال {currentQuestionIndex + 1} من {quiz.nagahQuestions.length}</p>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-bold">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>النقاط: {score}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-2xl border border-orange-500/40 text-orange-400 animate-pulse">
              <Flame className="w-5 h-5" />
              <span>متتالي: {streak} 🔥</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= quiz.nagahQuestions.length) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-10 overflow-hidden" dir="rtl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth }}
              animate={{ y: window.innerHeight + 20 }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-2xl"
            >
              {['🌟', '🏆', '🎉', '🔥', '🥇'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl animate-bounce">
            <Crown className="w-16 h-16" />
          </div>
          <h2 className="text-5xl font-black text-white">خلصنا المسابقة! 🎉</h2>
          <p className="text-2xl text-slate-300 font-bold">عاش يا بطل، مجهود متميز جداً النهاردة</p>
          
          <div className="max-w-md mx-auto bg-slate-900/80 border-2 border-amber-500/50 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl">
            <div className="text-sm font-black text-amber-400 uppercase tracking-widest mb-2">رصيدك النهائي في الجولة</div>
            <div className="text-7xl font-black text-white font-mono">{score}</div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                ⭐ {Math.max(1, Math.floor(score / 500))} نجمة جديدة
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white text-slate-950 font-black rounded-3xl shadow-2xl transform hover:scale-105 transition-all text-lg"
          >
            العودة للقاعة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col text-slate-100 select-none overflow-hidden" dir="rtl">
      {/* Top Bar: Progress & Info */}
      <div className="h-20 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              {currentQuestionIndex + 1}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">السؤال الحالي</span>
              <span className="text-sm font-bold text-slate-200">{quiz.title}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-2xl border border-slate-800">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-mono font-black text-amber-400">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-2xl border border-orange-500/40 text-orange-400 font-black text-sm">
              <Flame className="w-4 h-4" />
              <span>{streak} Streak!</span>
            </div>
          )}
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white">
            <Volume2 className={isMuted ? 'text-rose-500' : ''} />
          </button>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-2 w-full bg-slate-800">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / (currentQuestion.timeLimitSeconds || 30)) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full ${timeLeft < 5 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-cyan-500'}`}
        />
      </div>

      {/* Main Question Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
        <div className="max-w-4xl w-full text-center space-y-6">
          <div className="inline-block px-5 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
            {currentQuestion.questionType === 'mcq' ? 'سؤال اختيار من متعدد' : 
             currentQuestion.questionType === 'true_false' ? 'صح أم خطأ' : 'سؤال ذكاء برو'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            {currentQuestion.questionText}
          </h1>
          
          {currentQuestion.imageUrl && (
            <div className="max-w-md mx-auto aspect-video rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
              <img src={currentQuestion.imageUrl} alt="Question" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className={`grid w-full max-w-5xl gap-4 ${currentQuestion.questionType === 'true_false' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
          <AnimatePresence mode="wait">
            {!isAnswered ? (
              <>
                {(currentQuestion.options || (currentQuestion.questionType === 'true_false' ? ['صح', 'خطأ'] : [])).map((option, idx) => {
                  const colors = [
                    'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20',
                    'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20',
                    'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20',
                    'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                  ];
                  const icons = [
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">▲</div>,
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">◆</div>,
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">●</div>,
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">■</div>
                  ];

                  return (
                    <motion.button
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleAnswer(option)}
                      className={`${colors[idx % 4]} p-6 md:p-8 rounded-[32px] text-white flex items-center gap-6 text-xl md:text-2xl font-black shadow-xl transform active:scale-95 transition-all text-right group`}
                    >
                      {icons[idx % 4]}
                      <span className="flex-1 drop-shadow-md">{option}</span>
                    </motion.button>
                  );
                })}
              </>
            ) : (
              <motion.div 
                key="feedback"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center space-y-8"
              >
                <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white shadow-2xl ${isCorrect ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                  {isCorrect ? <CheckCircle2 className="w-20 h-20" /> : <XCircle className="w-20 h-20" />}
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className={`text-4xl font-black ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? 'يا ولد! إجابة صحيحة' : 'للأسف إجابة خاطئة'}
                  </h2>
                  <p className="text-lg text-slate-400 font-bold">
                    {isCorrect ? `حصلت على ${score} نقطة في الجولة` : `ركز في اللي جاي يا بطل`}
                  </p>
                </div>

                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-500">الإجابة الصحيحة كانت:</span>
                    <span className="text-emerald-400 font-black">{currentQuestion.correctAnswer}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-500">إجابتك:</span>
                    <span className={`${isCorrect ? 'text-emerald-400' : 'text-rose-400'} font-black`}>{selectedOption || 'لم تجب'}</span>
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-10 py-4 bg-white text-slate-950 font-black rounded-3xl shadow-2xl transform hover:scale-105 transition-all"
                >
                  <span>{currentQuestionIndex + 1 < quiz.nagahQuestions.length ? 'السؤال اللي بعده' : 'عرض النتيجة النهائية'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="h-24 bg-slate-900/30 border-t border-slate-800/50 flex items-center justify-center">
        <div className="flex items-center gap-8 opacity-20 grayscale">
           <Zap className="w-8 h-8" />
           <Star className="w-8 h-8" />
           <Trophy className="w-8 h-8" />
           <Flame className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};
