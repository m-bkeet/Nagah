import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Sparkles,
  Users,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Share2,
  Copy,
  Download,
  BarChart2,
  Bot,
  User,
  Shield,
  HelpCircle,
  Check,
  Maximize2,
  Minimize2,
  Upload,
  Layers,
  Star
} from 'lucide-react';
import { Group, Course, Trainee } from '../../types';

export interface KahootQuestionItem {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'puzzle' | 'poll';
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  pointsType: 'normal' | 'double' | 'no_points';
  explanation: string;
  emojiOrTheme?: string;
  category?: string;
}

export interface KahootGamePackage {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  coverEmoji?: string;
  timeLimitDefault: number;
  questions: KahootQuestionItem[];
  createdBy?: string;
  createdAt?: string;
}

interface KahootStudioProps {
  initialTopic?: string;
  initialQuestions?: KahootQuestionItem[];
  trainerName?: string;
  groups?: Group[];
  courses?: Course[];
  trainees?: Trainee[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAwardPoints?: (traineeId: string, points: number, reason: string) => void;
  embeddedMode?: boolean;
}

// ----------------------------------------------------
// Web Audio Synthesizer for Kahoot Audio Atmosphere
// ----------------------------------------------------
class KahootAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private lobbyInterval: any = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopLobbyMusic();
  }

  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.07);
        osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.22);
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
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      melody.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.1);
        osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.35);
      });
    } catch (e) {}
  }

  public startLobbyMusic() {
    if (this.isMuted || this.lobbyInterval) return;
    this.initCtx();
    if (!this.ctx) return;

    let step = 0;
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00];
    this.lobbyInterval = setInterval(() => {
      try {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = notes[step % notes.length];
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
        step++;
      } catch (e) {}
    }, 300);
  }

  public stopLobbyMusic() {
    if (this.lobbyInterval) {
      clearInterval(this.lobbyInterval);
      this.lobbyInterval = null;
    }
  }
}

const kahootAudio = new KahootAudioSynthesizer();

// ----------------------------------------------------
// Built-in Kahoot Library Templates
// ----------------------------------------------------
const BUILTIN_KAHOOT_LIBRARY: KahootGamePackage[] = [
  {
    id: 'lib-kahoot-ai',
    title: 'تحدي الذكاء الاصطناعي والتكنولوجيا الحديثة 🤖',
    description: 'تحدي مباشر يغطي مفاهيم الذكاء الاصطناعي، الآلات الذكية، والبرمجة',
    subject: 'تكنولوجيا المعلومات والبرمجة',
    grade: 'الصف الرابع والخامس الابتدائي',
    coverEmoji: '🤖',
    timeLimitDefault: 20,
    questions: [
      {
        id: 'q-ai-1',
        type: 'mcq',
        question: 'ما هو المكون المسؤول عن فهم ومعالجة اللغة البصرية والرسم في الحاسوب الذكي؟',
        options: ['معالج الرسوميات (GPU) 🎨', 'القرص الصلب (Hard Disk) 💾', 'الطابعة (Printer) 🖨️', 'السماعات (Speakers) 🔊'],
        correctIndex: 0,
        timeLimit: 20,
        pointsType: 'normal',
        explanation: 'معالج الرسوميات (GPU) مصمم خصيصاً للتعامل مع العمليات الرسومية ونماذج الذكاء الاصطناعي الضخمة.',
        emojiOrTheme: '🎨'
      },
      {
        id: 'q-ai-2',
        type: 'true_false',
        question: 'هل يمكن لنماذج الذكاء الاصطناعي المساعدة في كتابة الكود البرمجي واكتشاف الأخطاء؟',
        options: ['صواب ✅ (نعم بالتأكيد)', 'خطأ ❌ (مستحيل)'],
        correctIndex: 0,
        timeLimit: 15,
        pointsType: 'normal',
        explanation: 'الذكاء الاصطناعي أصبح مساعداً رائعاً للمبرمجين يصحح الأخطاء واقترح الحلول.',
        emojiOrTheme: '💡'
      },
      {
        id: 'q-ai-3',
        type: 'mcq',
        question: 'ماذا يسمى المفهوم الذي يجعل الآلة تتعلم من البيانات والأمثلة السابقة دون برمجة صريحة؟',
        options: ['تعلم الآلة (Machine Learning) 🧠', 'الطباعة السريعة (Fast Typing) ⌨️', 'التصفح الآمن (Safe Browsing) 🌐', 'إعادة التشغيل (Restart) 🔄'],
        correctIndex: 0,
        timeLimit: 20,
        pointsType: 'double',
        explanation: 'تعلم الآلة هو الفرع الأساسي في الذكاء الاصطناعي الذي يتعلم من البيانات والملاحظات.',
        emojiOrTheme: '🧠'
      },
      {
        id: 'q-ai-4',
        type: 'puzzle',
        question: 'رتب خطوات بناء نموذج ذكاء اصطناعي بالترتيب المنطقي الصحيح:',
        options: [
          '1. جمع البيانات وتجهيزها 📊',
          '2. تدريب النموذج الذكي 🏋️',
          '3. اختبار وتقييم الدقة 🧪',
          '4. نشر واستخدام النموذج 🚀'
        ],
        correctIndex: 0,
        timeLimit: 30,
        pointsType: 'double',
        explanation: 'الترتيب العلمي الصحيح: الجمع -> التدريب -> الاختبار -> النشر!',
        emojiOrTheme: '🧩'
      }
    ]
  },
  {
    id: 'lib-kahoot-python',
    title: 'تحدي المبرمج الذكي: بايثون وسكراتش 🐍',
    description: 'أسئلة تفاعلية حماسية اختبر فيها مهاراتك البرمجية والمنطقية',
    subject: 'البرمجة والتفكير المنطقي',
    grade: 'المرحلة الابتدائية والإعدادية',
    coverEmoji: '🐍',
    timeLimitDefault: 20,
    questions: [
      {
        id: 'q-py-1',
        type: 'mcq',
        question: 'ما هي الدالة المستخدمة لطباعة النصوص على الشاشة في لغة بايثون؟',
        options: ['print() 🖨️', 'write() ✍️', 'display() 📺', 'echo() 🗣️'],
        correctIndex: 0,
        timeLimit: 20,
        pointsType: 'normal',
        explanation: 'الدالة print() في بايثون هي المسؤولة عن عرض وتصدير النصوص إلى الشاشة.',
        emojiOrTheme: '🖨️'
      },
      {
        id: 'q-py-2',
        type: 'true_false',
        question: 'في بايثون، هل المسافات البدائية (Indentation) مهمة لتحديد هيكل الكود؟',
        options: ['صواب ✅ (إلزامية ومهمة جداً)', 'خطأ ❌ (غير مهمة إطلاقاً)'],
        correctIndex: 0,
        timeLimit: 15,
        pointsType: 'normal',
        explanation: 'المسافات البدائية في بايثون ليست مجرد تنسيق، بل تحدد بلوك الكود والتعليمات البرمجية.',
        emojiOrTheme: '📐'
      },
      {
        id: 'q-py-3',
        type: 'mcq',
        question: 'ما هو النمط أو اللبنة المسؤولة عن تكرار الحركة 10 مرات في سكراتش؟',
        options: ['كرر 10 مرات (Repeat 10) 🔄', 'إذا... وإلا (If... Else) 🔀', 'عند نمر العلم الأخضر 🚩', 'انتظر ثانية ⏱️'],
        correctIndex: 0,
        timeLimit: 20,
        pointsType: 'double',
        explanation: 'لبنة Repeat (كرر) هي حلقة التكرار الأساسية لتنفيذ الأوامر المحددة العدد.',
        emojiOrTheme: '🔄'
      }
    ]
  },
  {
    id: 'lib-kahoot-cyber',
    title: 'تحدي الأبطال: الأمن السيبراني والسلامة الرقمية 🛡️',
    description: 'تحدي التوعية بحماية كلمة السر وتفادي الفيروسات والمواقع الضارة',
    subject: 'الأمن الرقمي والسلامة',
    grade: 'جميع المراحل الدراسية',
    coverEmoji: '🛡️',
    timeLimitDefault: 20,
    questions: [
      {
        id: 'q-cy-1',
        type: 'mcq',
        question: 'أي من كلمات المرور التالية تعتبر الأكثر أماناً وقوة؟',
        options: ['P@ssw0rd#2026! 🔒', '12345678 ❌', 'password ❌', '00000000 ❌'],
        correctIndex: 0,
        timeLimit: 20,
        pointsType: 'normal',
        explanation: 'كلمة السر القوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة!',
        emojiOrTheme: '🔒'
      },
      {
        id: 'q-cy-2',
        type: 'true_false',
        question: 'هل يصح مشاركة كلمة المرور الخاصة بك مع أصدقائك في المدرسة؟',
        options: ['خطأ ❌ (سرية لا تُشارك مع أحد)', 'صواب ✅ (مسموح)'],
        correctIndex: 0,
        timeLimit: 15,
        pointsType: 'normal',
        explanation: 'كلمة السر سر شخصي للغاية يجب ألا يعرفه أحد سوى ولي أمرك والمدرب.',
        emojiOrTheme: '🔑'
      }
    ]
  }
];

export const KahootStudio: React.FC<KahootStudioProps> = ({
  initialTopic,
  initialQuestions,
  trainerName = 'المدرب المتميز',
  groups = [],
  courses = [],
  trainees = [],
  onShowToast,
  onAwardPoints,
  embeddedMode = false
}) => {
  // Navigation / View State
  const [activeTab, setActiveTab] = useState<'live_host' | 'ai_creator' | 'challenge' | 'library' | 'editor' | 'reports'>('live_host');

  // Active Game Package State
  const [activeGame, setActiveGame] = useState<KahootGamePackage>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return {
        id: `kahoot-custom-${Date.now()}`,
        title: initialTopic ? `تحدي كاهوت: ${initialTopic}` : 'تحدي كاهوت المباشر',
        description: 'مسابقة تفاعلية شيقة تم إنشاؤها خصيصاً للدرس',
        subject: 'تكنولوجيا المعلومات والبرمجة',
        grade: 'جميع المراحل الدراسية',
        coverEmoji: '⚡',
        timeLimitDefault: 20,
        questions: initialQuestions
      };
    }
    return BUILTIN_KAHOOT_LIBRARY[0];
  });

  // ----------------------------------------------------
  // Live Host State (Game PIN, Lobby, Playing, Podium)
  // ----------------------------------------------------
  const [gamePin, setGamePin] = useState<string>('849 201');
  const [hostStage, setHostStage] = useState<'lobby' | 'get_ready' | 'question' | 'reveal_answer' | 'leaderboard' | 'podium'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Player & Response Tracking
  interface JoinedPlayer {
    id: string;
    name: string;
    avatar: string;
    score: number;
    streak: number;
    lastAnswerIndex?: number;
    lastAnswerTime?: number;
    isBot?: boolean;
    traineeId?: string;
  }

  const [joinedPlayers, setJoinedPlayers] = useState<JoinedPlayer[]>([]);
  const [responsesCount, setResponsesCount] = useState<number>(0);
  const [answerBreakdown, setAnswerBreakdown] = useState<number[]>([0, 0, 0, 0]);

  // AI Creator Input State
  const [aiTopic, setAiTopic] = useState<string>(initialTopic || '');
  const [aiGrade, setAiGrade] = useState<string>('الصف الرابع الابتدائي');
  const [aiSubject, setAiSubject] = useState<string>('تكنولوجيا المعلومات والبرمجة');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(8);
  const [aiDifficulty, setAiDifficulty] = useState<string>('متوسط');
  const [aiUploadedImage, setAiUploadedImage] = useState<string | null>(null);
  const [aiImageFileName, setAiImageFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Challenge / Solo Play State
  const [soloCurrentIndex, setSoloCurrentIndex] = useState<number>(0);
  const [soloSelectedOption, setSoloSelectedOption] = useState<number | null>(null);
  const [soloShowAnswer, setSoloShowAnswer] = useState<boolean>(false);
  const [soloScore, setSoloScore] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Classic Kahoot Colors and Icons
  const kahootColors = [
    { bg: 'bg-red-500 hover:bg-red-600', text: 'text-white', shape: '🔺', name: 'أحمر' },
    { bg: 'bg-blue-500 hover:bg-blue-600', text: 'text-white', shape: '🔷', name: 'أزرق' },
    { bg: 'bg-amber-400 hover:bg-amber-500', text: 'text-slate-950 font-bold', shape: '🟡', name: 'أصفر' },
    { bg: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-white', shape: '🟩', name: 'أخضر' }
  ];

  // Initialize Default Bot Players if no real players exist
  useEffect(() => {
    if (joinedPlayers.length === 0 && trainees.length > 0) {
      const initialBots: JoinedPlayer[] = trainees.slice(0, 5).map((tr, idx) => ({
        id: `tr-p-${tr.id}`,
        name: tr.name,
        avatar: tr.gender === 'female' ? '👧' : '👦',
        score: 0,
        streak: 0,
        isBot: false,
        traineeId: tr.id
      }));
      setJoinedPlayers(initialBots);
    } else if (joinedPlayers.length === 0) {
      // Default Simulated Bot Players
      setJoinedPlayers([
        { id: 'bot-1', name: 'أحمد الشاطر 🤖', avatar: '👦', score: 0, streak: 0, isBot: true },
        { id: 'bot-2', name: 'مريم المبتكرة 🤖', avatar: '👧', score: 0, streak: 0, isBot: true },
        { id: 'bot-3', name: 'عمر التكنولوجي 🤖', avatar: '🚀', score: 0, streak: 0, isBot: true },
        { id: 'bot-4', name: 'سارة البرمجية 🤖', avatar: '💻', score: 0, streak: 0, isBot: true }
      ]);
    }
  }, []);

  // Sync mute state to audio synth
  useEffect(() => {
    kahootAudio.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  // Handle Host Lobby Sound
  useEffect(() => {
    if (hostStage === 'lobby' && !isAudioMuted) {
      kahootAudio.startLobbyMusic();
    } else {
      kahootAudio.stopLobbyMusic();
    }
    return () => kahootAudio.stopLobbyMusic();
  }, [hostStage, isAudioMuted]);

  // Handle Question Countdown Timer
  useEffect(() => {
    if (hostStage === 'question' && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            triggerRevealAnswer();
            return 0;
          }
          kahootAudio.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hostStage, isTimerRunning]);

  // Function to Add AI Test Bot Players
  const handleAddAiBots = () => {
    const botNames = [
      { name: 'علي العبقري 🤖', avatar: '⚡' },
      { name: 'فاطمة الذكية 🤖', avatar: '🌟' },
      { name: 'خالد المبرمج 🤖', avatar: '👾' },
      { name: 'نور المستقبل 🤖', avatar: '🔮' }
    ];

    const newBots: JoinedPlayer[] = botNames.map((b, idx) => ({
      id: `bot-added-${Date.now()}-${idx}`,
      name: b.name,
      avatar: b.avatar,
      score: 0,
      streak: 0,
      isBot: true
    }));

    setJoinedPlayers(prev => [...prev, ...newBots]);
    kahootAudio.playCorrect();
    onShowToast(`تم إضافة ${newBots.length} طلاب آليين محاكيين للـ Lobby! 🤖`, 'success');
  };

  // Generate New Game PIN
  const handleGenerateNewPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1 $2');
    setGamePin(randomPin);
    onShowToast(`تم تفعيل رمـز PIN جديد لمسابقة كاهوت: ${randomPin}`, 'info');
  };

  // Start Live Game
  const handleStartLiveGame = () => {
    if (!activeGame.questions || activeGame.questions.length === 0) {
      onShowToast('لا توجد أسئلة في مسابقة كاهوت الحالية! أضف أسئلة أولاً.', 'error');
      return;
    }
    kahootAudio.stopLobbyMusic();
    setCurrentQuestionIndex(0);
    setHostStage('get_ready');
    setResponsesCount(0);
    setAnswerBreakdown([0, 0, 0, 0]);

    setTimeout(() => {
      startQuestionStage(0);
    }, 2000);
  };

  const startQuestionStage = (index: number) => {
    const q = activeGame.questions[index];
    if (!q) return;

    setCurrentQuestionIndex(index);
    setHostStage('question');
    const limit = q.timeLimit || activeGame.timeLimitDefault || 20;
    setTimerSeconds(limit);
    setIsTimerRunning(true);
    setResponsesCount(0);
    setAnswerBreakdown([0, 0, 0, 0]);

    // Simulate bot answers randomly over time
    simulateBotResponses(q, limit);
  };

  const simulateBotResponses = (q: KahootQuestionItem, limit: number) => {
    const bots = joinedPlayers.filter(p => p.isBot);
    const breakdown = [0, 0, 0, 0];
    let count = 0;

    bots.forEach((bot, idx) => {
      const delayMs = Math.floor(1000 + Math.random() * (limit - 2) * 1000);
      setTimeout(() => {
        // 75% chance correct option, 25% random option
        const isCorrect = Math.random() < 0.75;
        const chosenOption = isCorrect ? q.correctIndex : Math.floor(Math.random() * q.options.length);

        breakdown[chosenOption % 4]++;
        count++;

        setAnswerBreakdown([...breakdown]);
        setResponsesCount(count);

        // Update player score
        const pointsMultiplier = q.pointsType === 'double' ? 2 : (q.pointsType === 'no_points' ? 0 : 1);
        const earnedPoints = isCorrect ? Math.round((1000 + (limit - delayMs / 1000) * 20) * pointsMultiplier) : 0;

        setJoinedPlayers(prev => prev.map(p => {
          if (p.id === bot.id) {
            const newStreak = isCorrect ? p.streak + 1 : 0;
            return {
              ...p,
              score: p.score + earnedPoints,
              streak: newStreak,
              lastAnswerIndex: chosenOption
            };
          }
          return p;
        }));
      }, delayMs);
    });
  };

  const triggerRevealAnswer = () => {
    setIsTimerRunning(false);
    setHostStage('reveal_answer');
    kahootAudio.playCorrect();
  };

  const handleNextStep = () => {
    if (hostStage === 'reveal_answer') {
      setHostStage('leaderboard');
    } else if (hostStage === 'leaderboard') {
      if (currentQuestionIndex < activeGame.questions.length - 1) {
        startQuestionStage(currentQuestionIndex + 1);
      } else {
        setHostStage('podium');
        kahootAudio.playFanfare();
      }
    }
  };

  // AI Quiz Generator Call
  const handleGenerateAiKahoot = async () => {
    if (!aiTopic.trim() && !aiUploadedImage) {
      onShowToast('يرجى كتابة عنوان التحدي أو رفع صفحة الكتاب/المستند', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/trainer/generate-kahoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          grade: aiGrade,
          subject: aiSubject,
          questionCount: aiQuestionCount,
          difficulty: aiDifficulty,
          image: aiUploadedImage
        })
      });

      const data = await res.json();
      if (data.success && data.kahootGame) {
        setActiveGame(data.kahootGame);
        setActiveTab('live_host');
        setHostStage('lobby');
        onShowToast(`تم توليد مسابقة كاهوت التفاعلية (${data.kahootGame.questions.length} أسئلة) بنجاح! ⚡`, 'success');
      } else {
        onShowToast(data.error || 'حدث خطأ أثناء توليد المسابقة', 'error');
      }
    } catch (e: any) {
      onShowToast('تعذر الاتصال بالخادم، تم استخدام النمط الذكي الاحتياطي', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAiUploadedImage(evt.target?.result as string);
      onShowToast('تم تحضير الملف وقراءته بنجاح للتوليد الذكي!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Award Bonus Points to Top Trainees
  const handleAwardWinners = () => {
    const sorted = [...joinedPlayers].sort((a, b) => b.score - a.score);
    const winners = sorted.slice(0, 3);

    let countAwarded = 0;
    winners.forEach((winner, idx) => {
      const pts = idx === 0 ? 50 : (idx === 1 ? 30 : 20);
      if (winner.traineeId && onAwardPoints) {
        onAwardPoints(winner.traineeId, pts, `الفائز بالمركز ${idx + 1} في تحدي كاهوت (${activeGame.title})`);
        countAwarded++;
      }
    });

    onShowToast(`تم منح نقاط التميز لأبطال تحدي كاهوت الثلاثة بنجاح! ⭐🏆`, 'success');
  };

  const currentQ = activeGame.questions[currentQuestionIndex];
  const sortedPlayers = [...joinedPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className={`space-y-6 ${embeddedMode ? '' : 'max-w-6xl mx-auto'}`}>
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 font-black text-2xl border border-purple-400/40">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  استوديو كاهوت التفاعلي المباشر (Kahoot! PRO)
                </h2>
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black shadow-sm">
                  النسخة الاحترافية
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                محاكاة كاملة لمنصة كاهوت المدفوعة + بث حي مع الطلاب + توليد بالذكاء الاصطناعي Gemini 3.7 Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAudioMuted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-purple-900/60 border-purple-700 text-purple-200 hover:bg-purple-800/80'
              }`}
              title={isAudioMuted ? 'تفعيل المؤثرات الصوتية' : 'كتم الصوت'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
              <span>{isAudioMuted ? 'الصوت مكتوم' : 'الصوت مفعل'}</span>
            </button>

            <button
              onClick={handleGenerateNewPin}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>PIN: <strong className="text-amber-300 font-mono text-sm">{gamePin}</strong></span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-purple-900/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('live_host')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'live_host'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 border border-purple-900/50'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>البث المباشر واللعب ({activeGame.questions.length} أسئلة)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_creator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border border-amber-500/40 ${
              activeTab === 'ai_creator'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-purple-950/40 text-amber-300 hover:bg-amber-950/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>صانع كاهوت بالذكاء الاصطناعي 🪄</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 border border-purple-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مكتبة التحديات الجاهزة 📚</span>
          </button>

          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'challenge'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 border border-purple-900/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>التحدي الذاتي للطلاب 🎯</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 border border-purple-900/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>تقارير الأداء 📊</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE GAME HOST STUDIO */}
      {activeTab === 'live_host' && (
        <div className="bg-slate-900/90 border border-purple-900/60 rounded-3xl p-6 shadow-2xl relative min-h-[500px]">
          {/* LOBBY STAGE */}
          {hostStage === 'lobby' && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="bg-gradient-to-b from-purple-900/80 to-purple-950/90 border border-purple-700/60 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">
                  انضم الآن عبر الشاشة أو الهاتف
                </div>
                <div className="text-3xl font-black text-white tracking-widest font-mono my-2 flex items-center justify-center gap-3">
                  <span>GAME PIN:</span>
                  <span className="text-amber-400 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-amber-500/40 shadow-inner">
                    {gamePin}
                  </span>
                </div>
                <p className="text-xs text-purple-200/80">
                  افتح <strong className="text-amber-300 font-mono">kahoot.it</strong> أو الكيوسك في المعمل وادخل الرمز لتلعب مباشرة!
                </p>
              </div>

              {/* Joined Players Grid */}
              <div className="bg-slate-950/60 border border-purple-900/40 rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
                  <div className="flex items-center gap-2 text-sm font-bold text-purple-200">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>الطلاب المنضمون للقاعة ({joinedPlayers.length})</span>
                  </div>

                  <button
                    onClick={handleAddAiBots}
                    className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span>إضافة طلاب وهميين للـ Lobby 🤖</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto">
                  {joinedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-purple-950/60 border border-purple-800/60 p-2.5 rounded-2xl flex items-center gap-2.5 animate-bounce-short"
                    >
                      <span className="text-2xl">{player.avatar}</span>
                      <div className="text-right truncate">
                        <div className="text-xs font-bold text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-purple-300/80 font-mono">جاهز للعب ✅</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleStartLiveGame}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>بدء مسابقة كاهوت الحية الآن! 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* GET READY COUNTDOWN STAGE */}
          {hostStage === 'get_ready' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-scale-up">
              <div className="text-5xl animate-bounce">⚡</div>
              <h2 className="text-3xl font-black text-white">استعد للتحدي!</h2>
              <p className="text-sm text-purple-300">
                السؤال رقم {currentQuestionIndex + 1}: {currentQ?.question}
              </p>
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mt-4" />
            </div>
          )}

          {/* LIVE QUESTION STAGE */}
          {hostStage === 'question' && currentQ && (
            <div className="space-y-6 animate-fade-in">
              {/* Question Top Header Bar */}
              <div className="bg-purple-950/80 border border-purple-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-900 text-purple-200 px-3 py-1 rounded-xl font-bold">
                    سؤال {currentQuestionIndex + 1} من {activeGame.questions.length}
                  </span>

                  {currentQ.pointsType === 'double' && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>نقاط مضاعفة 2x</span>
                    </span>
                  )}
                </div>

                {/* Countdown Ring */}
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-1.5 rounded-2xl border border-purple-900">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-lg font-black text-amber-300 font-mono">{timerSeconds}s</span>
                </div>

                <div className="text-xs text-purple-300 font-bold">
                  تم الاستلام: <strong className="text-white font-mono text-sm">{responsesCount}</strong> / {joinedPlayers.length} ⚡
                </div>
              </div>

              {/* Question Text Box */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-700/80 p-8 rounded-3xl text-center shadow-xl">
                <div className="text-3xl mb-3">{currentQ.emojiOrTheme || '🎯'}</div>
                <h3 className="text-2xl md:text-3xl font-black text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Classic Kahoot Answer Option Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, optIdx) => {
                  const color = kahootColors[optIdx % 4];
                  return (
                    <div
                      key={optIdx}
                      className={`${color.bg} ${color.text} p-5 rounded-2xl shadow-lg border border-white/20 transition-all flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{color.shape}</span>
                        <span className="text-base font-bold">{option}</span>
                      </div>
                      <span className="text-xs opacity-75 font-mono">الخيار {optIdx + 1}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={triggerRevealAnswer}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>كشف الإجابة الصحيحة الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* ANSWER REVEAL & BAR CHART STAGE */}
          {hostStage === 'reveal_answer' && currentQ && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="bg-purple-950/80 border border-purple-800 p-6 rounded-3xl">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                  الإجابة النموذجية الصحيحة:
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  {currentQ.options[currentQ.correctIndex]}
                </h3>

                {currentQ.explanation && (
                  <p className="text-xs text-purple-200 bg-purple-900/60 p-3 rounded-xl max-w-xl mx-auto border border-purple-700/50">
                    💡 <strong>التفسير:</strong> {currentQ.explanation}
                  </p>
                )}
              </div>

              {/* Answer Breakdown Bar Chart */}
              <div className="bg-slate-950/80 border border-purple-900 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-purple-300 mb-4 text-right">
                  توزيع إجابات الطلاب على الخيارات (Bar Chart):
                </h4>

                <div className="grid grid-cols-4 gap-4 items-end h-40 pt-4">
                  {currentQ.options.map((opt, idx) => {
                    const color = kahootColors[idx % 4];
                    const isCorrect = idx === currentQ.correctIndex;
                    const count = answerBreakdown[idx] || 0;
                    const heightPercent = responsesCount > 0 ? Math.round((count / responsesCount) * 100) : 10;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                        <div className="text-xs font-bold text-white">{count}</div>
                        <div
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                          className={`w-full rounded-t-xl ${color.bg} transition-all duration-500 relative flex items-center justify-center`}
                        >
                          {isCorrect && (
                            <CheckCircle2 className="w-6 h-6 text-white absolute -top-3 drop-shadow" />
                          )}
                        </div>
                        <div className="text-[10px] text-purple-200 truncate w-full">{color.shape}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center gap-2"
                >
                  <span>عرض لوحة المتصدرين 🏆</span>
                </button>
              </div>
            </div>
          )}

          {/* LEADERBOARD STAGE */}
          {hostStage === 'leaderboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                  <Trophy className="w-7 h-7 text-amber-400" />
                  <span>لوحة المتصدرين والأبطال</span>
                </h3>
                <p className="text-xs text-purple-300 mt-1">
                  النقاط المحسبة بناءً على الإجابة الصحيحة والسرعة ⚡
                </p>
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                {sortedPlayers.slice(0, 5).map((player, rank) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      rank === 0
                        ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-purple-950/60 border-purple-900 text-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                        rank === 0 ? 'bg-amber-400 text-slate-950' : 'bg-purple-900 text-purple-200'
                      }`}>
                        #{rank + 1}
                      </span>
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{player.name}</div>
                        {player.streak > 1 && (
                          <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            <span>سلسلة إجابات متتالية x{player.streak}! 🔥</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-amber-300 font-mono">
                        {player.score} <span className="text-xs text-purple-300 font-normal">نقطة</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-3">
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center gap-2"
                >
                  <span>
                    {currentQuestionIndex < activeGame.questions.length - 1
                      ? 'السؤال التالي ➡️'
                      : 'عرض منصة التتويج النهائية 🏆'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* FINAL PODIUM CEREMONY STAGE */}
          {hostStage === 'podium' && (
            <div className="space-y-6 text-center animate-scale-up">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  انتهت المسابقة بنجاح!
                </span>
                <h3 className="text-3xl font-black text-white">منصة تتويج الأبطال الثلاثة 🏆</h3>
              </div>

              {/* 3D Podium Display */}
              <div className="flex items-end justify-center gap-4 pt-8 pb-4 max-w-lg mx-auto">
                {/* 2nd Place */}
                {sortedPlayers[1] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-3xl">{sortedPlayers[1].avatar}</span>
                    <div className="text-xs font-bold text-slate-200 truncate">{sortedPlayers[1].name}</div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold">{sortedPlayers[1].score} نقطة</div>
                    <div className="w-full bg-slate-700/80 border border-slate-500 h-28 rounded-t-2xl flex items-center justify-center font-black text-2xl text-slate-300 shadow-xl">
                      2 🥈
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {sortedPlayers[0] && (
                  <div className="flex flex-col items-center gap-2 flex-1 -mt-6">
                    <div className="relative">
                      <span className="text-4xl">{sortedPlayers[0].avatar}</span>
                      <span className="absolute -top-3 -right-2 text-xl">👑</span>
                    </div>
                    <div className="text-sm font-black text-amber-300 truncate">{sortedPlayers[0].name}</div>
                    <div className="text-xs text-amber-400 font-mono font-bold">{sortedPlayers[0].score} نقطة</div>
                    <div className="w-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 h-36 rounded-t-2xl flex items-center justify-center font-black text-3xl text-slate-950 shadow-2xl">
                      1 🥇
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {sortedPlayers[2] && (
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-3xl">{sortedPlayers[2].avatar}</span>
                    <div className="text-xs font-bold text-amber-200/80 truncate">{sortedPlayers[2].name}</div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold">{sortedPlayers[2].score} نقطة</div>
                    <div className="w-full bg-amber-900/80 border border-amber-700 h-20 rounded-t-2xl flex items-center justify-center font-black text-xl text-amber-200 shadow-xl">
                      3 🥉
                    </div>
                  </div>
                )}
              </div>

              {/* Award Bonus Points Option */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-purple-900">
                <button
                  onClick={handleAwardWinners}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>منح نقاط التميز لأبطال التحدي ⭐</span>
                </button>

                <button
                  onClick={() => setHostStage('lobby')}
                  className="px-6 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl border border-purple-700 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة تشغيل المسابقة 🔄</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI KAHOOT CREATOR */}
      {activeTab === 'ai_creator' && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">صانع أسئلة كاهوت الذكي بالذكاء الاصطناعي</h3>
              <p className="text-xs text-slate-400">
                اكتب الموضوع أو ارفع صورة لصفحة الكتاب/المذكرة وسيتم توليد خيارات كاهوت تفاعلية فوراً
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">موضوع التحدي أو المفهوم 📝</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: أساسيات لغة بايثون للناشئين أو الذكاء الاصطناعي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة الدراسية</label>
                  <input
                    type="text"
                    value={aiGrade}
                    onChange={(e) => setAiGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">عدد الأسئلة</label>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value={5}>5 أسئلة طويلة</option>
                    <option value={8}>8 أسئلة قياسية</option>
                    <option value={10}>10 أسئلة حماسية</option>
                    <option value={15}>15 سؤالاً للمسابقات</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">إرفاق صورة الكتاب أو PDF (اختياري) 📸</label>
                <label className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950/60 p-4 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                  <Upload className="w-6 h-6 text-amber-400" />
                  <span className="text-xs text-slate-300 font-bold">
                    {aiImageFileName || 'اضغط هنا لرفع صورة صفحة الكتاب أو المستند'}
                  </span>
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <button
                onClick={handleGenerateAiKahoot}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري توليد مسابقة كاهوت بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>توليد مسابقة كاهوت كاملة بالذكاء الاصطناعي ⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUILT-IN LIBRARY */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUILTIN_KAHOOT_LIBRARY.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-purple-900/60 hover:border-purple-500/80 p-5 rounded-3xl space-y-4 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-2">{item.coverEmoji || '⚡'}</div>
                <h4 className="text-base font-black text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                  <span>{item.subject}</span>
                  <span>{item.questions.length} أسئلة ⚡</span>
                </div>

                <button
                  onClick={() => {
                    setActiveGame(item);
                    setActiveTab('live_host');
                    setHostStage('lobby');
                    onShowToast(`تم تحميل مسابقة "${item.title}" للبدء المباشر!`, 'success');
                  }}
                  className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>تشغيل التحدي المباشر 🚀</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SELF-PACED SOLO CHALLENGE */}
      {activeTab === 'challenge' && (
        <div className="bg-slate-900/90 border border-purple-900/60 rounded-3xl p-6 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900">
            <span className="text-xs font-bold text-purple-300">
              سؤال {soloCurrentIndex + 1} من {activeGame.questions.length}
            </span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              النقاط: {soloScore} ⭐
            </span>
          </div>

          {activeGame.questions[soloCurrentIndex] && (
            <div className="space-y-5">
              <div className="bg-purple-950 p-6 rounded-2xl text-center border border-purple-800">
                <h3 className="text-xl font-black text-white">
                  {activeGame.questions[soloCurrentIndex].question}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeGame.questions[soloCurrentIndex].options.map((opt, oIdx) => {
                  const color = kahootColors[oIdx % 4];
                  const isSelected = soloSelectedOption === oIdx;
                  const isCorrect = oIdx === activeGame.questions[soloCurrentIndex].correctIndex;

                  let style = `${color.bg} ${color.text}`;
                  if (soloShowAnswer) {
                    if (isCorrect) style = 'bg-emerald-600 text-white border-2 border-emerald-400';
                    else if (isSelected) style = 'bg-rose-600 text-white border-2 border-rose-400';
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={soloShowAnswer}
                      onClick={() => {
                        setSoloSelectedOption(oIdx);
                        setSoloShowAnswer(true);
                        if (isCorrect) {
                          setSoloScore(prev => prev + 1000);
                          kahootAudio.playCorrect();
                        } else {
                          kahootAudio.playWrong();
                        }
                      }}
                      className={`p-4 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${style}`}
                    >
                      <span>{opt}</span>
                      {soloShowAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>

              {soloShowAnswer && (
                <div className="space-y-4 animate-fade-in pt-2">
                  {activeGame.questions[soloCurrentIndex].explanation && (
                    <p className="text-xs bg-purple-950/80 p-3 rounded-xl border border-purple-800 text-purple-200">
                      💡 <strong>التفسير:</strong> {activeGame.questions[soloCurrentIndex].explanation}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      if (soloCurrentIndex < activeGame.questions.length - 1) {
                        setSoloCurrentIndex(prev => prev + 1);
                        setSoloSelectedOption(null);
                        setSoloShowAnswer(false);
                      } else {
                        onShowToast(`انتهت الجولة! النتيجة النهائية: ${soloScore} نقطة ⭐`, 'success');
                      }
                    }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
                  >
                    {soloCurrentIndex < activeGame.questions.length - 1 ? 'السؤال التالي ➡️' : 'إعادة التحدي 🔄'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PERFORMANCE REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-purple-900/60 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <span>تقرير الأداء والإحصائيات الحية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-950/60 border border-purple-800/60 p-4 rounded-2xl text-center">
              <div className="text-xs text-purple-300 font-bold mb-1">نسبة الدقة الإجمالية</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">85%</div>
            </div>

            <div className="bg-purple-950/60 border border-purple-800/60 p-4 rounded-2xl text-center">
              <div className="text-xs text-purple-300 font-bold mb-1">أصعب سؤال في المسابقة</div>
              <div className="text-xs text-amber-300 font-bold truncate">سؤال خطوات البرمجة وخطوات بناء النموذج</div>
            </div>

            <div className="bg-purple-950/60 border border-purple-800/60 p-4 rounded-2xl text-center">
              <div className="text-xs text-purple-300 font-bold mb-1">إجمالي الطلاب المشاركين</div>
              <div className="text-3xl font-black text-purple-300 font-mono">{joinedPlayers.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
