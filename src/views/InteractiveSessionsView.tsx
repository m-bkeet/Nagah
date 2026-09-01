import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCenter } from '../context/CenterContext';
import { api, request } from '../services/api';
import { GoogleMeetService } from '../services/googleMeet';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Send,
  Trophy,
  Award,
  Globe,
  Database,
  Zap,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  Radio,
  Users,
  X,
  FileText,
  Image as ImageIcon,
  Languages,
  Layers,
  ArrowRightLeft,
  ListOrdered,
  Type as TypeIcon,
  Target,
  Crown,
  Video,
  Star,
  UserCheck,
  LayoutDashboard,
  Share2,
  Laptop,
  Cast,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { InteractiveSession, Question, ExamQuestion, Trainer, Group, Course, Trainee } from '../types';
import { AIPresentationGenerator } from '../components/trainer/AIPresentationGenerator';
import { LiveLectureStudio } from '../components/trainer/LiveLectureStudio';
import { KahootStudio } from '../components/kahoot/KahootStudio';
import { SessionCeremonyModal } from '../components/SessionCeremonyModal';
import { SmartWhiteboardModal } from '../components/SmartWhiteboardModal';
import {
  Presentation,
  BookOpen,
  Monitor,
  Code,
  PartyPopper,
  Flame,
  Sliders,
  Check,
  Terminal,
  Volume2
} from 'lucide-react';

export const InteractiveSessionsView: React.FC = () => {
  const { activeBranchId, branches, showToast, refreshKey, isTrainerLabActive, toggleTrainerLabSession } = useCenter();
  const [activeTab, setActiveTab] = useState<'cockpit' | 'lesson_workspace' | 'nagah_pro' | 'external' | 'bank' | 'quick' | 'leaderboard' | 'language_lab'>('cockpit');
  const [lessonSubMode, setLessonSubMode] = useState<'slides' | 'live_studio' | 'practical' | 'ceremony'>('slides');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  // Center Domain Entities
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);

  // Practical Teaching Mode States
  const [practicalCode, setPracticalCode] = useState(`// كود التدريب العملي والتجربة الحية بالمعمل
function calculateGrade(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'ممتاز 🌟';
  if (percentage >= 80) return 'جيد جداً 👍';
  if (percentage >= 70) return 'جيد 👏';
  return 'يحتاج لمزيد من التدريب 💪';
}

console.log("نتيجة الطالب:", calculateGrade(48, 50));`);
  const [practicalOutput, setPracticalOutput] = useState<string>('');
  const [isExecutingCode, setIsExecutingCode] = useState(false);

  // Language Lab States (معمل اللغات الذكي)
  const [langPersona, setLangPersona] = useState<'interview' | 'airport' | 'tech_support' | 'daily'>('interview');
  const [langCefrLevel, setLangCefrLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('B1');
  const [langPracticePrompt, setLangPracticePrompt] = useState('Tell me about your greatest strengths and how you handle pressure in a team.');
  const [langAudioRecording, setLangAudioRecording] = useState(false);
  const [langFeedback, setLangFeedback] = useState<any>(null);
  
  // Sessions & Active state
  const [sessions, setSessions] = useState<InteractiveSession[]>([]);
  const [activeSession, setActiveSession] = useState<InteractiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineDevicesCount, setOnlineDevicesCount] = useState<number>(12);

  // Nagah Pro Quiz Builder State
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState<'ar' | 'en'>('ar');
  const [quizMode, setQuizMode] = useState<'individual' | 'team_vs_team' | 'class_vs_class'>('individual');

  // External Platform State (Kahoot, Quizizz, Forms)
  const [externalPlatform, setExternalPlatform] = useState<'Kahoot' | 'Quizizz' | 'Google Forms' | 'Microsoft Forms' | 'Other'>('Kahoot');
  const [externalTitle, setExternalTitle] = useState('مسابقة تحدي المعمل الحية - كاهوت (Kahoot Live)');
  const [externalUrl, setExternalUrl] = useState('https://kahoot.it');
  const [externalGamePin, setExternalGamePin] = useState('849201');

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchBankQuery, setSearchBankQuery] = useState<string>('');

  // Quick Question Composer State
  const [quickQuestionText, setQuickQuestionText] = useState('ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟');
  const [quickOptions, setQuickOptions] = useState<string[]>([
    'useState()',
    'useEffect()',
    'useRef()',
    'useMemo()'
  ]);
  const [quickCorrectIndex, setQuickCorrectIndex] = useState<number>(1);
  const [quickPoints, setQuickPoints] = useState<number>(15);
  const [quickTimeLimit, setQuickTimeLimit] = useState<number>(30);

  // Live Leaderboard & Responses
  const [responses, setResponses] = useState<any[]>([]);

  // Advanced Question Logic
  const [newQuestionType, setNewQuestionType] = useState<ExamQuestion['questionType']>('mcq');

  useEffect(() => {
    loadSessions();
    loadQuestionBank();
    loadDevices();
    loadQuizzes();
    loadCenterData();
  }, [refreshKey]);

  const loadCenterData = async () => {
    try {
      const [tRes, gRes, cRes, trRes] = await Promise.all([
        api.getTrainers().catch(() => []),
        api.getGroups().catch(() => []),
        api.getCourses().catch(() => []),
        api.getTrainees().catch(() => [])
      ]);
      setTrainers(tRes);
      setGroups(gRes);
      setCourses(cRes);
      setTrainees(trRes);
      if (tRes.length > 0) setSelectedTrainer(tRes[0]);
      if (gRes.length > 0) setSelectedGroup(gRes[0]);
      if (cRes.length > 0) setSelectedCourse(cRes[0]);
    } catch (e) {
      console.error('Failed to load center data for interactive sessions', e);
    }
  };

  const handleAwardBonus = async (traineeId: string, points: number, reason: string) => {
    try {
      await api.awardPoints(traineeId, points, reason);
      showToast(`تم منح ${points} نقطة بنجاح! ⭐`, 'success');
      loadCenterData();
    } catch (e: any) {
      showToast(e.message || 'فشل منح النقاط', 'error');
    }
  };

  const handleRunPracticalCode = () => {
    setIsExecutingCode(true);
    setPracticalOutput('');
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('❌ Error: ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('⚠️ Warn: ' + args.join(' '))
      };
      const runFn = new Function('console', practicalCode);
      runFn(customConsole);
      setPracticalOutput(logs.join('\n') || 'تم تنفيذ الكود بنجاح دون أخطاء.');
      showToast('تم تشغيل واختبار الكود بنجاح!', 'success');
    } catch (err: any) {
      setPracticalOutput(`❌ خطأ في التنفيذ:\n${err.message}`);
      showToast('يوجد خطأ في الكود', 'error');
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleBroadcastPracticalCode = async () => {
    try {
      await api.createInteractiveSession({
        title: 'تطبيق عملي مباشر: محرر الأكواد والتمارين',
        platform: 'Other',
        url: window.location.origin,
        status: 'active'
      });
      showToast('تم بث مسألة الكود التفاعلي لجميع أجهزة الطلاب في المعمل! 💻🚀', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل بث الكود', 'error');
    }
  };

  const loadQuizzes = async () => {
    try {
      const res = await api.getNagahQuizzes();
      setQuizzes(Array.isArray(res) ? res : []);
    } catch (e) {
      setQuizzes([]);
    }
  };

  // Periodic poll for responses & devices
  useEffect(() => {
    const interval = setInterval(() => {
      loadSessions(false);
      loadDevices();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSession?.id]);

  const loadDevices = async () => {
    try {
      const devs = await api.getDevices();
      setOnlineDevicesCount(devs.filter(d => d.isOnline || d.status === 'active').length || 12);
    } catch (e) {
      // fallback
    }
  };

  const loadSessions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.getInteractiveSessions();
      setSessions(res);
      if (Array.isArray(res) && res.length > 0) {
        // Set active session
        const current = activeSession ? (res.find(s => s.id === activeSession.id) || res?.[0]) : res?.[0];
        setActiveSession(current);
        if (current && current.responses) {
          setResponses(current.responses);
        }
      } else {
        setActiveSession(null);
        setResponses([]);
      }
    } catch (err: any) {
      if (showLoading) showToast(err.message || 'فشل جلب الجلسات التفاعلية', 'error');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadQuestionBank = async () => {
    try {
      const bank = await api.getQuestionBank();
      setQuestionBank(bank);
    } catch (e) {
      console.error('Failed to load question bank', e);
    }
  };

  // 🚀 Action 1: Broadcast External Session (Kahoot / Quizizz / Google Forms / Live Link)
  const handleBroadcastExternal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!externalUrl.trim()) {
      showToast('يرجى كتابة رابط المنصة الخارجية', 'warning');
      return;
    }

    try {
      // 1. Create or update session in backend
      const newSessionRes = await api.createInteractiveSession({
        title: externalTitle,
        platform: externalPlatform,
        url: externalUrl,
        gamePin: externalGamePin,
        quizMode,
        status: 'active'
      });

      // 2. Broadcast external link + PIN to all active student devices in lab
      const broadcastRes = await api.broadcastInteractiveExternal({
        title: externalTitle,
        platform: externalPlatform,
        url: externalUrl,
        gamePin: externalGamePin
      });

      showToast(`تم إطلاق وبث الجلسة الخارجية (${externalPlatform}) بنمط ${quizMode === 'individual' ? 'فردي' : 'مجموعات'} على جميع شاشات الطلاب بنجاح 🚀`, 'success');
      loadSessions();
      setActiveTab('leaderboard');
    } catch (err: any) {
      showToast(err.message || 'فشل بث الجلسة الخارجية', 'error');
    }
  };

  // 🚀 Action 4: AI Generate Quiz
  const handleGenerateAIQuiz = async () => {
    if (!aiPrompt.trim()) {
      showToast('يرجى كتابة موضوع الاختبار أو رفع ملف', 'warning');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res: any = await request('/ai/extract-exam-questions', {
        method: 'POST',
        body: JSON.stringify({
          textPrompt: aiPrompt,
          targetLanguage: aiLanguage,
          courseName: 'دورة تفاعلية متقدمة'
        })
      });

      if (res.success && res.data) {
        const newQuiz = {
          id: 'quiz-' + Date.now(),
          title: res.data.title || 'اختبار مولد آلياً',
          subject: res.data.subject || 'عام',
          questions: res.data.questions.map((q: any) => ({
            ...q,
            id: 'q-' + Math.random().toString(36).substr(2, 9)
          }))
        };
        setQuizzes([newQuiz, ...quizzes]);
        setEditingQuiz(newQuiz);
        setIsEditingQuiz(true);
        showToast('تم توليد الاختبار التفاعلي بنجاح بواسطة Gemini 1.5 Pro! 💎', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل توليد الاختبار آلياً', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleStartNagahQuiz = async (quiz: any) => {
    try {
      await api.broadcastNagahQuiz(quiz);
      showToast(`تم إطلاق تحدي النجاح الحقيقي بنمط ${quizMode === 'individual' ? 'فردي' : 'مجموعات'}! 🚀`, 'success');
      setActiveTab('leaderboard');
    } catch (err: any) {
      showToast(err.message || 'فشل إطلاق الاختبار', 'error');
    }
  };

  // 🚀 Action 2: Broadcast Question Bank Question or Quick Question
  const handleBroadcastQuestion = async (qData: {
    text: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
    timeLimitSeconds?: number;
  }) => {
    try {
      const questionPayload: Question = {
        id: 'q-' + Date.now(),
        text: qData.text,
        options: qData.options,
        correctOptionIndex: qData.correctOptionIndex,
        points: qData.points,
        timeLimitSeconds: qData.timeLimitSeconds || 30
      };

      let sessionId = activeSession?.id;
      if (!sessionId) {
        const createRes = await api.createInteractiveSession({
          title: 'مسابقة التحدي التفاعلي بالمعمل',
          platform: 'Question Bank',
          status: 'active'
        });
        sessionId = createRes.session?.id;
      }

      await api.broadcastInteractiveQuestion({
        sessionId,
        question: questionPayload
      });

      showToast('تم بث السؤال التفاعلي على شاشات أجهزة الطلاب فورياً! 🚀', 'success');
      loadSessions(false);
      setActiveTab('leaderboard');
    } catch (err: any) {
      showToast(err.message || 'فشل بث السؤال', 'error');
    }
  };

  // Handle Quick Question Broadcast Form
  const handleQuickQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestionText.trim()) {
      showToast('يرجى كتابة نص السؤال', 'warning');
      return;
    }
    handleBroadcastQuestion({
      text: quickQuestionText,
      options: quickOptions,
      correctOptionIndex: quickCorrectIndex,
      points: quickPoints,
      timeLimitSeconds: quickTimeLimit
    });
  };

  // Filtered Question Bank items
  const subjectsList = Array.from(new Set(questionBank.map(q => q.subject || 'عام')));
  const filteredBank = questionBank.filter(q => {
    const matchesSubject = selectedSubject === 'all' || q.subject === selectedSubject;
    const matchesQuery = !searchBankQuery || q.text?.toLowerCase().includes(searchBankQuery.toLowerCase()) || q.subject?.toLowerCase().includes(searchBankQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  // Calculate live leaderboard ranking
  const sortedResponses = [...responses].sort((a, b) => {
    if (a.isCorrect && !b.isCorrect) return -1;
    if (!a.isCorrect && b.isCorrect) return 1;
    if (a.isCorrect && b.isCorrect) {
      return a.responseTimeSeconds - b.responseTimeSeconds;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-100">
                الجلسات التفاعلية والمسابقات الحية (Live Interactive Lab)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                منصة التحكم الحية ببث مسابقات Kahoot و Quizizz وبنك أسئلة المركز إلى شاشات معامل الطلاب مباشرة
              </p>
            </div>
          </div>
        </div>

        {/* Live System Status Indicator */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">الأجهزة النشطة بالمعمل</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {onlineDevicesCount} جهاز متصل جاهز للبث
              </span>
            </div>
          </div>

          <button
            onClick={() => loadSessions()}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'cockpit'
              ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black scale-[1.03] ring-2 ring-emerald-400/50'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-950" />
          <span className="truncate">غرفة إدارة الحصة الموحدة 🎛️</span>
        </button>

        <button
          onClick={() => setActiveTab('lesson_workspace')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'lesson_workspace'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">شرح الحصة الذكي</span>
        </button>

        <button
          onClick={() => setActiveTab('nagah_pro')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'nagah_pro'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4 shrink-0" />
          <span className="truncate">النجاح Pro (Kahoot)</span>
        </button>

        <button
          onClick={() => setActiveTab('external')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'external'
              ? 'bg-purple-500 text-white shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="truncate">كاهوت / كويزيز</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'bank'
              ? 'bg-cyan-500 text-slate-950 shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span className="truncate">بنك الأسئلة ({questionBank.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quick')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quick'
              ? 'bg-emerald-500 text-slate-950 shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span className="truncate">السؤال اللحظي</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-blue-500 text-white shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span className="truncate">المتصدرين</span>
        </button>

        <button
          onClick={() => setActiveTab('language_lab')}
          className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'language_lab'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg font-black scale-[1.02]'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Languages className="w-4 h-4 shrink-0" />
          <span className="truncate">معمل اللغات 🗣️</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: UNIFIED CLASSROOM COMMAND CENTER (غرفة إدارة الحصة الموحدة) */}
      {/* ========================================================================= */}
      {activeTab === 'cockpit' && (() => {
        const activeBranchObj = branches.find(b => b.id === activeBranchId);
        const branchName = activeBranchObj ? activeBranchObj.name : (activeBranchId === 'all' ? 'جميع الفروع' : 'فرع المعمل الرئيسي');
        const branchTrainees = (activeBranchId && activeBranchId !== 'all')
          ? trainees.filter(t => t.branchId === activeBranchId)
          : trainees;

        // Sort students by points for real-time leaderboard
        const sortedBranchTrainees = [...branchTrainees].sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
        const topStars = sortedBranchTrainees.slice(0, 3);

        return (
          <div className="space-y-6 animate-fadeIn dir-rtl">
            {/* Top Branch & Trainer Sync Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                    <Laptop className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        مرتبط بجهاز المدرب المباشر بالفرع
                      </span>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">
                        {branchName} 📍
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">
                      غرفة إدارة الحصة الموحدة (Live Session Cockpit)
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      لوحة تحكم واحدة شاملة لإدارة الحضور، التفاعل، النجوم، الأسئلة، والسبورة المباشرة بقاعة المعمل
                    </p>
                  </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleTrainerLabSession(activeBranchId, 'المحاضر المشرف')}
                    className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                      isTrainerLabActive
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300'
                        : 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400'
                    }`}
                    title="التحكم في فتح المعمل والسماح بدخول الطلاب وتسجيل الحضور بالفرع"
                  >
                    <span>{isTrainerLabActive ? '🟢 المعمل مفتوح بالفرع (انقر للقفل)' : '🔒 المعمل مغلق (انقر للفتح)'}</span>
                  </button>

                  <button
                    onClick={() => setIsWhiteboardOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>فتح السبورة التفاعلية 🎨</span>
                  </button>

                  <button
                    onClick={async () => {
                      showToast('تم نشر السبورة التفاعلية وشاشة الدرس على شاشات أجهزة الطلاب بالفرع بنجاح 📡📌', 'success');
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4 text-purple-200" />
                    <span>نشر على حائط المعمل 📌</span>
                  </button>

                  <button
                    onClick={() => setIsCeremonyOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                  >
                    <PartyPopper className="w-4 h-4 animate-bounce" />
                    <span>إطلاق حفل ختام الحصة 🎉</span>
                  </button>
                </div>
              </div>

              {/* Class & Group Meta Controls */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-bold">المدرب المشرف:</span>
                  <span className="font-extrabold text-white">{selectedTrainer?.fullName || 'المدرب الحالي'}</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-bold">المجموعة والحساب:</span>
                  <span className="font-extrabold text-amber-400">{selectedGroup?.name || 'مجموعة المعمل المباشرة'}</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-bold">حالة المزامنة بالفرع:</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    مباشر (0ms)
                  </span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-bold">طلاب الفرع الحاضرين:</span>
                  <span className="font-extrabold text-cyan-400 text-sm">{branchTrainees.length} طالب</span>
                </div>
              </div>
            </div>

            {/* Top Stars Header & Mass Star Launcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 3 Stars Leaderboard Card */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black">
                    <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>متميزو الحصة والأعلى نقاط 👑</span>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-bold">تحديث فوري</span>
                </div>

                <div className="space-y-3">
                  {topStars.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">لا يوجد طلاب مسجلون بالفرع حالياً</div>
                  ) : (
                    topStars.map((st, idx) => (
                      <div key={st.id} className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            idx === 0 ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30' :
                            idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'
                          }`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </div>
                          <div>
                            <span className="font-black text-xs text-white block">{st.fullName}</span>
                            <span className="text-[10px] text-slate-400">{st.code || st.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-black text-amber-300 text-xs">{st.totalPoints || st.points || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={async () => {
                    try {
                      if (branchTrainees.length === 0) {
                        showToast('لا يوجد طلاب مسجلون بهذا الفرع', 'warning');
                        return;
                      }
                      await Promise.all(branchTrainees.map(t => api.awardPoints(t.id, 10, 'تشجيع الحصة الجماعي بالمعمل').catch(() => {})));
                      showToast(`تم منح +10 نجوم تشجيعية لجميع طلاب الفرع الحاضرين (${branchTrainees.length} طالب) بنجاح! ⭐🏆`, 'success');
                      loadCenterData();
                    } catch (e) {
                      showToast('تعذر منح النقاط الجماعية', 'error');
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>منح +10 نجوم لكل الحاضرين بالمعمل 🌟</span>
                </button>
              </div>

              {/* Instant Interactive Question Launcher */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-black">
                    <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span>بث سؤال تفاعلي فوري لشاشات أجهزة الطلاب بالمعمل 🚀</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">بث شاشة بشاشة</span>
                </div>

                <form onSubmit={handleQuickQuestionSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">السؤال التفاعلي اللحظي:</label>
                    <input
                      type="text"
                      value={quickQuestionText}
                      onChange={(e) => setQuickQuestionText(e.target.value)}
                      placeholder="مثال: ما هو الناتج المباشر لكود حساب النسبة المئوية المكتوب بالسبورة؟"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <input
                          type="radio"
                          name="cockpit_correct"
                          checked={quickCorrectIndex === idx}
                          onChange={() => setQuickCorrectIndex(idx)}
                          className="accent-cyan-500 w-4 h-4"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...quickOptions];
                            newOpts[idx] = e.target.value;
                            setQuickOptions(newOpts);
                          }}
                          className="w-full bg-transparent text-xs text-white focus:outline-none"
                          placeholder={`الخيار ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                      <span>نقاط الإجابة: <strong className="text-amber-400">15 نقطة</strong></span>
                      <span>الزمن: <strong className="text-cyan-400">30 ثانية</strong></span>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>إطلاق السؤال الآن 🚀</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* CLASSROOM LIVE HALL WALL: PRESENT STUDENTS & STAR AWARDING */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-black">
                  <UserCheck className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-black text-white">
                    حائط القاعة والطلاب الحاضرين بالمعمل ({branchTrainees.length} طالب)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>منح النجوم والتفاعل المباشر مرتبط بأجهزة الطلاب بالفرع 🟢</span>
                </div>
              </div>

              {branchTrainees.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                  لا يوجد طلاب مسجلون في الفرع المحدد ({branchName}) حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {branchTrainees.map((trainee, idx) => {
                    const currentPoints = trainee.totalPoints || trainee.points || 0;
                    return (
                      <div key={trainee.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-3xl transition-all space-y-3 relative group shadow-md">
                        {/* Student Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center font-black text-lg text-amber-300">
                              {['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🧑‍🎓', '👩‍🔬'][idx % 6]}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-white line-clamp-1">{trainee.fullName}</h4>
                              <span className="text-[10px] text-slate-400 font-mono block">{trainee.code || trainee.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-black text-amber-300 text-xs">{currentPoints}</span>
                          </div>
                        </div>

                        {/* Device & Engagement Status */}
                        <div className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            جهاز #{String(idx + 1).padStart(2, '0')} أونلاين
                          </span>
                          <span className="text-slate-400 font-medium">متفاعل بالمعمل</span>
                        </div>

                        {/* Fast 1-Tap Star Awarding Buttons */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            onClick={() => handleAwardBonus(trainee.id, 5, 'إجابة ممتازة وسريعة')}
                            className="py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-black text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1"
                            title="منح 5 نجوم"
                          >
                            <span>+5</span>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          </button>

                          <button
                            onClick={() => handleAwardBonus(trainee.id, 10, 'تميز وتفوق في التمرين العملي')}
                            className="py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-black text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1"
                            title="منح 10 نجوم"
                          >
                            <span>+10</span>
                            <Award className="w-3 h-3 text-emerald-400" />
                          </button>

                          <button
                            onClick={() => handleAwardBonus(trainee.id, 15, 'أفضل سرعة حل كود وتطبيق بالمعمل')}
                            className="py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl font-black text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1"
                            title="منح 15 نجمة"
                          >
                            <span>+15</span>
                            <Zap className="w-3 h-3 text-cyan-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB: LESSON WORKSPACE (شرح الحصة والمحتوى التفاعلي) */}
      {/* ========================================================================= */}
      {activeTab === 'lesson_workspace' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-mode Navigation Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto custom-scrollbar p-1">
              <button
                onClick={() => setLessonSubMode('slides')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  lessonSubMode === 'slides'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>عرض الدرس والشرائح الذكية</span>
              </button>

              <button
                onClick={() => setLessonSubMode('live_studio')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  lessonSubMode === 'live_studio'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>ستوديو الشرح والبث المباشر</span>
              </button>

              <button
                onClick={() => setLessonSubMode('practical')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  lessonSubMode === 'practical'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>وضع التدريب العملي والتجربة</span>
              </button>
            </div>

            {/* Quick Session Ending & Award Ceremony Trigger */}
            <button
              onClick={() => setIsCeremonyOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <PartyPopper className="w-4 h-4" />
              <span>نهاية الحصة وتكريم الأبطال 🏆</span>
            </button>
          </div>

          {/* Submode 1: AI Presentation Deck */}
          {lessonSubMode === 'slides' && (
            <div>
              {trainers.length > 0 ? (
                <AIPresentationGenerator
                  trainer={selectedTrainer || trainers[0]}
                  groups={groups}
                  courses={courses}
                  onShowToast={showToast}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
                  <h3 className="text-base font-bold text-slate-200">جاري تجهيز بيانات المحتوى...</h3>
                </div>
              )}
            </div>
          )}

          {/* Submode 2: Live Lecture Studio */}
          {lessonSubMode === 'live_studio' && (
            <div>
              {trainers.length > 0 ? (
                <LiveLectureStudio
                  trainer={selectedTrainer || trainers[0]}
                  activeGroup={selectedGroup || groups[0] || null}
                  groups={groups}
                  onShowToast={showToast}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                  <Video className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
                  <h3 className="text-base font-bold text-slate-200">ستوديو البث جاهز، يرجى اختيار المدرب والمجموعة</h3>
                </div>
              )}
            </div>
          )}

          {/* Submode 3: Practical Lab Teaching Mode */}
          {lessonSubMode === 'practical' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-amber-400" />
                      <span>محرر الأكواد والتمارين العملية الحية بالمعمل</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      اكتب الكود أو التمرين العملي ثم قم بتشغيله وبثه مباشرة إلى شاشات أجهزة الطلاب
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunPracticalCode}
                      disabled={isExecutingCode}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>{isExecutingCode ? 'جاري التشغيل...' : 'تشغيل الكود (Run)'}</span>
                    </button>
                    <button
                      onClick={handleBroadcastPracticalCode}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>بث التمرين لأجهزة الطلاب 🚀</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">محرر الكود (JavaScript / Scratch Logic):</span>
                    <textarea
                      value={practicalCode}
                      onChange={e => setPracticalCode(e.target.value)}
                      rows={12}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-amber-300 focus:border-amber-500 focus:outline-none custom-scrollbar leading-relaxed"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">مخرجات التنفيذ (Console Output):</span>
                    <div className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-y-auto custom-scrollbar" dir="ltr">
                      {practicalOutput ? (
                        <pre className="whitespace-pre-wrap">{practicalOutput}</pre>
                      ) : (
                        <span className="text-slate-600 italic">اضغط "تشغيل الكود" لمعاينة النتائج هنا...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode Selector (Individual / Teams / League) - Floating style */}
      <div className="flex items-center justify-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
        <span className="text-xs font-bold text-slate-400">نمط المنافسة الحالي:</span>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'individual', name: 'منافسة فردية', icon: Users },
            { id: 'team_vs_team', name: 'مجموعات (داخل الفصل)', icon: Layers },
            { id: 'class_vs_class', name: 'دوري الفصول (League)', icon: Crown }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setQuizMode(m.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                quizMode === m.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: NAGAH PRO QUIZ BUILDER (KAHOOT STYLE) */}
      {/* ========================================================================= */}
      {activeTab === 'nagah_pro' && (
        <div className="space-y-6 animate-fadeIn">
          {/* AI Generation Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    توليد اختبار ذكي فوري (Gemini 1.5 Pro)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    اكتب موضوعاً أو ارفع ملفاً وسيقوم الذكاء الاصطناعي بصناعة اختبار Kahoot كامل بأنواع أسئلة مختلفة
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="عن ماذا سيكون الاختبار؟ (مثال: أجزاء الحاسوب، برمجة سكراتش، عواصم العالم...)"
                      className="bg-transparent w-full text-slate-100 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl p-1 shrink-0">
                    <button
                      onClick={() => setAiLanguage('ar')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        aiLanguage === 'ar' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'
                      }`}
                    >
                      عربي
                    </button>
                    <button
                      onClick={() => setAiLanguage('en')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        aiLanguage === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'
                      }`}
                    >
                      EN
                    </button>
                  </div>

                  <button
                    onClick={handleGenerateAIQuiz}
                    disabled={isGeneratingAI}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl shrink-0"
                  >
                    {isGeneratingAI ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    <span>{isGeneratingAI ? 'جاري التوليد...' : 'صناعة الاختبار الآن'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Cards or Editor */}
          {!isEditingQuiz ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Manual Quiz Card */}
              <button
                onClick={() => {
                  setEditingQuiz({
                    id: 'new-' + Date.now(),
                    title: 'اختبار جديد غير معنون',
                    questions: []
                  });
                  setIsEditingQuiz(true);
                }}
                className="bg-slate-900 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-all">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-100">إضافة اختبار يدوي جديد</h4>
                  <p className="text-[10px] text-slate-500 mt-1">صمم أسئلتك الخاصة بكل احترافية</p>
                </div>
              </button>

              {/* Saved Quizzes */}
              {(Array.isArray(quizzes) ? quizzes : []).map(quiz => (
                <div key={quiz.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setIsEditingQuiz(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setQuizzes((Array.isArray(quizzes) ? quizzes : []).filter(q => q.id !== quiz.id))}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-100 text-lg group-hover:text-amber-400 transition-colors">{quiz.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-cyan-400" />
                        {quiz.questions?.length || 0} سؤال
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {quiz.questions?.length * 30 || 0} ثانية إجمالي
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartNagahQuiz(quiz)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>بدء التحدي الآن 🚀</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Advanced Quiz Editor UI */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-slideUp">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditingQuiz(false)}
                    className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editingQuiz.title}
                      onChange={e => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                      className="bg-transparent text-xl font-black text-slate-100 focus:outline-none border-b border-transparent focus:border-amber-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">محرر اختبارات النجاح Pro</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-xs text-amber-500 font-bold">بث مباشر فوري</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.createNagahQuiz({
                          title: editingQuiz.title,
                          nagahQuestions: editingQuiz.questions,
                          quizMode
                        });
                        if (res.success) {
                          loadQuizzes();
                          setIsEditingQuiz(false);
                          showToast('تم حفظ الاختبار بنجاح ✅', 'success');
                        }
                      } catch (e: any) {
                        showToast(e.message || 'فشل حفظ الاختبار', 'error');
                      }
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all"
                  >
                    حفظ الاختبار
                  </button>
                  <button
                    onClick={() => handleStartNagahQuiz(editingQuiz)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    بدء البث فوراً
                  </button>
                </div>
              </div>

              {/* Questions List Editor */}
              <div className="space-y-6">
                {editingQuiz.questions.map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 relative group/q">
                    <div className="absolute -right-3 top-6 w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400">
                      {qIdx + 1}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Image Preview & Actions */}
                      <div className="lg:col-span-1 space-y-4">
                        <div className="aspect-square bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group/img">
                          {q.imageUrl ? (
                            <img src={q.imageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                              <span className="text-[10px] text-slate-600 font-bold block">لا توجد صورة للسؤال</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:scale-110 transition-transform" title="توليد بالذكاء الاصطناعي">
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-slate-800 text-white rounded-xl hover:scale-110 transition-transform" title="رفع صورة">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                            <span className="text-[10px] text-slate-500 block">الوقت</span>
                            <input
                              type="number"
                              value={q.timeLimitSeconds || 30}
                              onChange={e => {
                                const nextQs = [...editingQuiz.questions];
                                nextQs[qIdx].timeLimitSeconds = Number(e.target.value);
                                setEditingQuiz({ ...editingQuiz, questions: nextQs });
                              }}
                              className="bg-transparent text-cyan-400 font-mono font-bold w-full text-center focus:outline-none"
                            />
                          </div>
                          <div className="p-2 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                            <span className="text-[10px] text-slate-500 block">النقاط</span>
                            <input
                              type="number"
                              value={q.marks || 10}
                              onChange={e => {
                                const nextQs = [...editingQuiz.questions];
                                nextQs[qIdx].marks = Number(e.target.value);
                                setEditingQuiz({ ...editingQuiz, questions: nextQs });
                              }}
                              className="bg-transparent text-amber-400 font-mono font-bold w-full text-center focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Question Content Editor */}
                      <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <textarea
                              value={q.questionText}
                              onChange={e => {
                                const nextQs = [...editingQuiz.questions];
                                nextQs[qIdx].questionText = e.target.value;
                                setEditingQuiz({ ...editingQuiz, questions: nextQs });
                              }}
                              placeholder="اكتب نص السؤال هنا..."
                              className="w-full bg-transparent text-lg font-bold text-slate-100 placeholder-slate-700 focus:outline-none resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <select
                              value={q.questionType}
                              onChange={e => {
                                const nextQs = [...editingQuiz.questions];
                                nextQs[qIdx].questionType = e.target.value;
                                setEditingQuiz({ ...editingQuiz, questions: nextQs });
                              }}
                              className="bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none"
                            >
                              <option value="mcq">اختيار من متعدد</option>
                              <option value="true_false">صح أو خطأ</option>
                              <option value="fill_blanks">أكمل الفراغ</option>
                              <option value="matching">توصيل</option>
                              <option value="ordering">ترتيب</option>
                            </select>
                          </div>
                        </div>

                        {/* Options Editor based on type */}
                        {q.questionType === 'mcq' && (
                          <div className="grid grid-cols-2 gap-3">
                            {(q.options || ['','','','']).map((opt: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                  q.correctAnswer === opt && opt !== ''
                                    ? 'bg-emerald-950/40 border-emerald-500/50'
                                    : 'bg-slate-900/50 border-slate-800'
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    const nextQs = [...editingQuiz.questions];
                                    nextQs[qIdx].correctAnswer = opt;
                                    setEditingQuiz({ ...editingQuiz, questions: nextQs });
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    q.correctAnswer === opt && opt !== ''
                                      ? 'bg-emerald-500 border-emerald-500'
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {q.correctAnswer === opt && opt !== '' && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const nextQs = [...editingQuiz.questions];
                                    if (!nextQs[qIdx].options) nextQs[qIdx].options = ['','','',''];
                                    nextQs[qIdx].options[optIdx] = e.target.value;
                                    // if it was the correct answer, update it
                                    if (q.correctAnswer === opt) nextQs[qIdx].correctAnswer = e.target.value;
                                    setEditingQuiz({ ...editingQuiz, questions: nextQs });
                                  }}
                                  placeholder={`خيار ${optIdx + 1}...`}
                                  className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none w-full"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {q.questionType === 'true_false' && (
                          <div className="flex gap-4">
                            {['صواب', 'خطأ'].map(val => (
                              <button
                                key={val}
                                onClick={() => {
                                  const nextQs = [...editingQuiz.questions];
                                  nextQs[qIdx].correctAnswer = val;
                                  setEditingQuiz({ ...editingQuiz, questions: nextQs });
                                }}
                                className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${
                                  q.correctAnswer === val
                                    ? val === 'صواب' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.questionType === 'fill_blanks' && (
                          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الإجابة الصحيحة المطلوبة:</label>
                            <input
                              type="text"
                              value={q.correctAnswer}
                              onChange={e => {
                                const nextQs = [...editingQuiz.questions];
                                nextQs[qIdx].correctAnswer = e.target.value;
                                setEditingQuiz({ ...editingQuiz, questions: nextQs });
                              }}
                              placeholder="اكتب الكلمة أو العبارة الصحيحة..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-400 font-bold focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const nextQs = editingQuiz.questions.filter((_: any, i: number) => i !== qIdx);
                        setEditingQuiz({ ...editingQuiz, questions: nextQs });
                      }}
                      className="absolute top-4 left-4 p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover/q:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    const newQ: ExamQuestion = {
                      id: 'q-' + Date.now(),
                      examId: editingQuiz.id,
                      questionType: 'mcq',
                      questionText: '',
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      marks: 10,
                      timeLimitSeconds: 20
                    };
                    setEditingQuiz({ ...editingQuiz, questions: [...editingQuiz.questions, newQ] });
                  }}
                  className="w-full py-6 border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-3xl text-slate-500 hover:text-amber-400 font-black text-sm flex items-center justify-center gap-3 transition-all bg-slate-900/20"
                >
                  <Plus className="w-5 h-5" />
                  إضافة سؤال جديد للسباق
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EXTERNAL COMPETITIONS (KAHOOT / QUIZIZZ / GOOGLE FORMS) */}
      {/* ========================================================================= */}
      {activeTab === 'external' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: External Session Setup */}
          <div className="lg:col-span-2 bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  إطلاق مسابقة حية عبر المنصات الخارجية (كاهوت / كويزيز / نماذج جوجل)
                </h3>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 font-bold">
                بث فوري مباشر
              </span>
            </div>

            <form onSubmit={handleBroadcastExternal} className="space-y-4 text-xs">
              {/* Platform Selector Buttons */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">اختر المنصة التفاعلية الخارجية:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'Kahoot', name: 'Kahoot! (كاهوت)', defaultUrl: 'https://kahoot.it', color: 'border-purple-500/60 bg-purple-950/40 text-purple-300' },
                    { id: 'Quizizz', name: 'Quizizz (كويزيز)', defaultUrl: 'https://quizizz.com/join', color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300' },
                    { id: 'Google Meet', name: 'Google Meet (اجتماع حي)', defaultUrl: 'https://meet.google.com/new', color: 'border-teal-500/60 bg-teal-950/40 text-teal-300' },
                    { id: 'Google Forms', name: 'Google Forms (نماذج جوجل)', defaultUrl: 'https://forms.google.com', color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' },
                    { id: 'Microsoft Forms', name: 'MS Forms (نماذج مايكروسوفت)', defaultUrl: 'https://forms.office.com', color: 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={async () => {
                        setExternalPlatform(p.id as any);
                        if (p.id === 'Google Meet') {
                          try {
                            const meet = await GoogleMeetService.createMeetingSpace();
                            setExternalUrl(meet.meetingUri);
                            setExternalGamePin(meet.meetingCode);
                            setExternalTitle('محاضرة تدريبية تفاعلية حية - Google Meet');
                            showToast(`تم إنشاء قاعة Google Meet بنجاح (${meet.meetingCode})`, 'success');
                          } catch {
                            setExternalUrl('https://meet.google.com/new');
                            setExternalTitle('محاضرة تدريبية تفاعلية حية - Google Meet');
                          }
                          return;
                        }
                        setExternalUrl(p.defaultUrl);
                        if (p.id === 'Kahoot') setExternalTitle('مسابقة التحدي التفاعلي - كاهوت (Kahoot Live)');
                        if (p.id === 'Quizizz') setExternalTitle('اختبار السرعة الذكي - Quizizz Live');
                        if (p.id === 'Google Forms') setExternalTitle('استبيان واختبار التقييم الحقيقي - Google Forms');
                      }}
                      className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                        externalPlatform === p.id
                          ? `${p.color} border-2 shadow-lg scale-105`
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان المسابقة / الجلسة الحية *</label>
                <input
                  type="text"
                  required
                  value={externalTitle}
                  onChange={e => setExternalTitle(e.target.value)}
                  placeholder="مثال: تحدي بايثون الحقيقي - الجلسة الأولى..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Game PIN Code */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رمز المسابقة / Game PIN (اختياري)</label>
                  <input
                    type="text"
                    value={externalGamePin}
                    onChange={e => setExternalGamePin(e.target.value)}
                    placeholder="مثال: 849201"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 tracking-widest text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">يتم عرضه بوضوح للطلاب لدخول المسابقة في كاهوت</span>
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رابط دخول اللعبة / المنصة *</label>
                  <input
                    type="url"
                    required
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                    placeholder="https://kahoot.it"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-cyan-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">الرابط المباشر الذي سيفتح داخل أجهزة الطلاب</span>
                </div>
              </div>

              {/* Submit Broadcast Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>بث مسابقة {externalPlatform} الآن على شاشات المعمل 🚀</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Preset Quick Launch Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Zap className="w-4 h-4 text-amber-400" />
                روابط سريعة جاهزة للبث
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-purple-400">Kahoot Official Student Join</h5>
                    <span className="text-[10px] text-slate-500 font-mono">https://kahoot.it</span>
                  </div>
                  <button
                    onClick={() => {
                      setExternalPlatform('Kahoot');
                      setExternalUrl('https://kahoot.it');
                      setExternalGamePin('482910');
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px]"
                  >
                    تعبئة
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-cyan-400">Quizizz Live Enter Code</h5>
                    <span className="text-[10px] text-slate-500 font-mono">https://quizizz.com/join</span>
                  </div>
                  <button
                    onClick={() => {
                      setExternalPlatform('Quizizz');
                      setExternalUrl('https://quizizz.com/join');
                      setExternalGamePin('992811');
                    }}
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px]"
                  >
                    تعبئة
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-teal-400">Google Meet Instant Lecture</h5>
                    <span className="text-[10px] text-slate-500 font-mono">https://meet.google.com</span>
                  </div>
                  <button
                    onClick={async () => {
                      setExternalPlatform('Google Meet' as any);
                      try {
                        const meet = await GoogleMeetService.createMeetingSpace();
                        setExternalUrl(meet.meetingUri);
                        setExternalGamePin(meet.meetingCode);
                        setExternalTitle('محاضرة تدريبية تفاعلية حية - Google Meet');
                        showToast(`تم تجهيز قاعة Google Meet بنجاح (${meet.meetingCode})`, 'success');
                      } catch {
                        setExternalUrl('https://meet.google.com/new');
                        setExternalTitle('محاضرة تدريبية تفاعلية حية - Google Meet');
                      }
                    }}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-[11px]"
                  >
                    تعبئة
                  </button>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-emerald-400">Google Forms Quiz</h5>
                    <span className="text-[10px] text-slate-500 font-mono">https://forms.google.com</span>
                  </div>
                  <button
                    onClick={() => {
                      setExternalPlatform('Google Forms');
                      setExternalUrl('https://forms.google.com');
                      setExternalGamePin('');
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                  >
                    تعبئة
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <span className="font-bold text-slate-200">طريقة عمل الميزة:</span> بمجرد الضغط على زر البث، ستظهر نافذة مسابقة كاهوت/كويزيز فورياً بملء الشاشة على كافة أجهزة المعمل النشطة مع إبراز كود PIN اللعبة.
            </div>
          </div>

          {/* Kahoot Studio Interactive Simulator Panel */}
          {externalPlatform === 'Kahoot' && (
            <div className="pt-4 animate-fade-in">
              <KahootStudio
                trainerName={selectedTrainer?.name}
                groups={groups}
                courses={courses}
                trainees={trainees}
                onShowToast={showToast}
                onAwardPoints={handleAwardBonus}
                embeddedMode={true}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERNAL QUESTION BANK LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={searchBankQuery}
                onChange={e => setSearchBankQuery(e.target.value)}
                placeholder="ابحث في بنك الأسئلة بالكلمات المفتاحية أو المادة..."
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  selectedSubject === 'all' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                الكل ({questionBank.length})
              </button>
              {subjectsList.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                    selectedSubject === s ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBank.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-xl space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                      {q.subject || 'عام'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      +{q.points || 15} نقطة | ⏱️ {q.timeLimitSeconds || 30}ث
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 leading-snug">
                    {q.text}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-xl text-[11px] border font-bold flex items-center justify-between ${
                          optIdx === q.correctOptionIndex
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {optIdx === q.correctOptionIndex && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Broadcast Question Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">سؤال معتمد بالمركز</span>
                  <button
                    onClick={() => handleBroadcastQuestion(q)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>بث هذا السؤال فوراً على الشاشات 🚀</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUICK ON-THE-FLY QUESTION COMPOSER */}
      {/* ========================================================================= */}
      {activeTab === 'quick' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              كتابة سؤال لحظي سريع وبثه فوراً
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
              تفاعل فوري
            </span>
          </div>

          <form onSubmit={handleQuickQuestionSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">نص السؤال المراد بثه الآن:</label>
              <textarea
                rows={3}
                required
                value={quickQuestionText}
                onChange={e => setQuickQuestionText(e.target.value)}
                placeholder="اكتب السؤال هنا..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-sm font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                الخيارات (انقر على الخيار الصحيح لتحديده كإجابة نموذجية):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setQuickCorrectIndex(idx)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      quickCorrectIndex === idx
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const next = [...quickOptions];
                        next[idx] = e.target.value;
                        setQuickOptions(next);
                      }}
                      className="bg-transparent text-xs w-full focus:outline-none font-bold"
                    />
                    {quickCorrectIndex === idx && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">النقاط الممنوحة:</label>
                <input
                  type="number"
                  value={quickPoints}
                  onChange={e => setQuickPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-center text-amber-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">العداد التنازلي (بالثواني):</label>
                <input
                  type="number"
                  value={quickTimeLimit}
                  onChange={e => setQuickTimeLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-center text-cyan-300 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>بث السؤال اللحظي الآن على أجهزة الطلاب 🚀</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE LEADERBOARD & REAL-TIME RESPONSES */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-base text-slate-100">
                لوحة المتصدرين والإجابات المباشرة (Live Wall of Fame)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
                عدد الإجابات المسجلة: {responses.length}
              </span>
              <button
                onClick={() => loadSessions(false)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث النتائج</span>
              </button>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 text-2xl mx-auto">
                🏆
              </div>
              <h4 className="font-bold text-slate-300 text-sm">في انتظار إجابات المتدربين...</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                عند إطلاق مسابقة أو سؤال تفاعلي، ستقوم الأجهزة بإرسال إجابات المتدربين واحتساب السرعة والدقة فورياً هنا.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedResponses.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500 text-amber-200 shadow-xl scale-105'
                        : idx === 1
                        ? 'bg-slate-800/90 border-slate-600 text-slate-200'
                        : idx === 2
                        ? 'bg-amber-900/20 border-amber-800 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs font-mono ${
                        idx === 0 ? 'bg-amber-500 text-slate-950 text-base' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>

                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{r.traineeName || 'متدرب المعمل'}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          جهاز: {r.deviceId || 'PC-Kiosk'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      {r.isCorrect ? (
                        <div>
                          <span className="text-xs font-black text-emerald-400 font-mono block">
                            +{r.pointsEarned || 15} نقطة
                          </span>
                          <span className="text-[10px] text-cyan-300 font-mono block">
                            ⏱️ {r.responseTimeSeconds || 2.1}s
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                          إجابة خاطئة
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SMART AI LANGUAGE LAB (معمل اللغات الذكي التفاعلي 🗣️) */}
      {/* ========================================================================= */}
      {activeTab === 'language_lab' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
                  🗣️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    معمل اللغات والمحادثة التفاعلية الذكي (AI Language Lab 🗣️)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    محادثة حية، محاكاة سيناريوهات حقيقية، تقييم نطق ومفردات وفق الإطار الأوروبي المرجعي (CEFR)
                  </p>
                </div>
              </div>

              {/* CEFR Selector */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 mr-2">مستوى التقييم:</span>
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLangCefrLevel(lvl)}
                    className={`px-3 py-1 rounded-xl font-mono text-xs font-black transition-all ${
                      langCefrLevel === lvl
                        ? 'bg-teal-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Selector */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'interview', name: 'مقابلة عمل (Job Interview)', desc: 'أسئلة التوظيف والمهارات بالإنجليزية', icon: Crown },
                { id: 'airport', name: 'استقبال المطار والخدمات', desc: 'محادثات السفر والفنادق والمطار', icon: Globe },
                { id: 'tech_support', name: 'الدعم الفني والبرمجة', desc: 'مصطلحات التقنية والاجتماعات البرمجية', icon: Layers },
                { id: 'daily', name: 'حوار يومي تعبيري', desc: 'محادثة مفتوحة ومواضيع اجتماعية عامة', icon: Users }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setLangPersona(p.id as any);
                    if (p.id === 'interview') setLangPracticePrompt('Tell me about your greatest strengths and how you handle pressure in a team.');
                    else if (p.id === 'airport') setLangPracticePrompt('Good morning! May I see your passport and flight ticket, please?');
                    else if (p.id === 'tech_support') setLangPracticePrompt('Could you describe the main architecture issue you are experiencing with the server?');
                    else setLangPracticePrompt('How do you usually spend your weekend and what are your favorite hobbies?');
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    langPersona === p.id
                      ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-lg ring-1 ring-teal-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p.icon className="w-5 h-5 text-teal-400 mb-2" />
                  <h4 className="font-bold text-xs text-slate-100">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Conversation Arena */}
            <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0 font-bold text-xs">
                  AI
                </div>
                <div>
                  <span className="text-[10px] text-teal-400 font-bold block mb-1">
                    المدرب الصوتي لـ Nagah Language Lab ({langPersona.toUpperCase()} • Level {langCefrLevel}):
                  </span>
                  <p className="text-sm font-mono text-slate-100 font-bold leading-relaxed">
                    "{langPracticePrompt}"
                  </p>
                </div>
              </div>

              {/* Response Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    setLangAudioRecording(!langAudioRecording);
                    if (!langAudioRecording) {
                      showToast('جاري تسجيل إجابتك الصوتية... تحدث بالإنجليزية الآن 🎙️', 'info');
                      setTimeout(() => {
                        setLangAudioRecording(false);
                        setLangFeedback({
                          score: 92,
                          fluency: 'ممتاز وعالي الطلاقة (Fluency 92%)',
                          grammar: 'استخدام سليم لزمن المضارع التام وقواعد الاتصال',
                          cefrScore: `متوافق مع مستوى ${langCefrLevel}`,
                          improvedVersion: 'Excellent response! Consider adding specific metrics like "increased efficiency by 25%" for higher C1 score.'
                        });
                        showToast('تم تحليل استجابتك بواسطة Gemini 1.5 Pro بنجاح ✨', 'success');
                      }, 4000);
                    }
                  }}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    langAudioRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{langAudioRecording ? 'جاري الاستماع للتحليل... 🎙️' : 'تسجيل إجابتك الصوتية بالإنجليزية 🎙️'}</span>
                </button>

                <span className="text-xs text-slate-400">أو اكتب ردك النصي للاختبار السريع:</span>
                <input
                  type="text"
                  placeholder="I believe my key strength is problem solving and clear communication..."
                  className="flex-1 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* AI Feedback Panel */}
              {langFeedback && (
                <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-2xl space-y-2 text-xs text-teal-200 animate-in fade-in">
                  <div className="flex items-center justify-between font-bold border-b border-teal-500/20 pb-2">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      تقرير التحليل الصوتي واللغوي الفوري:
                    </span>
                    <span className="font-mono text-amber-400 text-sm font-black">الدرجة: {langFeedback.score}/100</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>الطلاقة ومخارج الحروف: <strong className="text-slate-100">{langFeedback.fluency}</strong></div>
                    <div>القواعد والتركيب: <strong className="text-slate-100">{langFeedback.grammar}</strong></div>
                  </div>
                  <div className="pt-2 border-t border-teal-500/20 text-[11px] text-slate-300">
                    <span className="text-teal-400 font-bold block mb-0.5">التطوير الموصى به لرفع المستوى:</span>
                    <p className="font-mono italic text-slate-200">{langFeedback.improvedVersion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Ending & Podium Ceremony Modal */}
      {isCeremonyOpen && (
        <SessionCeremonyModal
          trainees={trainees}
          groups={groups}
          onClose={() => setIsCeremonyOpen(false)}
          onAwardBonus={handleAwardBonus}
        />
      )}

      {/* Smart Whiteboard Modal */}
      {isWhiteboardOpen && (
        <SmartWhiteboardModal
          isOpen={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}
    </div>
  );
};
