import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Globe,
  Zap,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Users,
  Star,
  UserCheck,
  Laptop,
  Check,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Lock,
  Eye,
  Award,
  Tv,
  Radio,
  Gamepad2,
  HelpCircle,
  BarChart2,
  BookOpen,
  FileCheck2
} from 'lucide-react';
import { Trainer, Group, Course, Trainee } from '../types';
import { SmartWhiteboardModal } from '../components/SmartWhiteboardModal';
import { CelebrationBalloonsOverlay } from '../components/CelebrationBalloonsOverlay';
import { AllInOneLessonPlanModal } from '../components/trainer/AllInOneLessonPlanModal';
import { LectureRecapManager } from '../components/homeworks/LectureRecapManager';
import { ProjectorAudioControlBar } from '../components/trainer/ProjectorAudioControlBar';
import { audioService } from '../services/audioService';

export const InteractiveSessionsView: React.FC = () => {
  const { activeBranchId, branches, showToast, refreshKey } = useCenter();
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isAllInOneModalOpen, setIsAllInOneModalOpen] = useState(false);

  // Main Active Tab
  const [activeTab, setActiveTab] = useState<'activities' | 'roster' | 'recap'>('activities');

  // Center Data
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Group for the session
  const [selectedGroupId, setSelectedGroupId] = useState<string>('auto');
  const [filterMode, setFilterMode] = useState<'present' | 'all'>('present');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Attendance Map: traineeId -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [celebrationOverlay, setCelebrationOverlay] = useState<{ active: boolean; title?: string; pointsBadge?: string; subtitle?: string }>({ active: false });

  // ClassPoint & Kahoot Broadcast State
  const [externalPlatform, setExternalPlatform] = useState<'ClassPoint' | 'Kahoot' | 'Quizizz' | 'Other'>('ClassPoint');
  const [externalPin, setExternalPin] = useState<string>('');
  const [externalUrl, setExternalUrl] = useState<string>('https://www.classpoint.app');
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null);
  const [isBroadcastingExternal, setIsBroadcastingExternal] = useState(false);

  // Quick Question State
  const [activeQuickQuestion, setActiveQuickQuestion] = useState<any>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<string>('A');
  const [pointsReward, setPointsReward] = useState<number>(5);

  // Load Initial Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [trainersData, groupsData, coursesData, traineesData] = await Promise.all([
        api.getTrainers().catch(() => []),
        api.getGroups().catch(() => []),
        api.getCourses().catch(() => []),
        api.getTrainees().catch(() => [])
      ]);
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTrainees(Array.isArray(traineesData) ? traineesData : []);
    } catch (e) {
      console.error('Error loading lab data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll current active Question & External Activity from Server
  const fetchActiveLabState = useCallback(async () => {
    try {
      const res = await fetch('/api/lab/quick-question?isTeacher=true');
      const json = await res.json();
      if (json) {
        setActiveQuickQuestion(json.data || null);
        if (json.externalActivity) {
          setActiveBroadcast(json.externalActivity);
          if (json.externalActivity.gamePin) {
            setExternalPin(json.externalActivity.gamePin);
          }
          if (json.externalActivity.platform) {
            setExternalPlatform(json.externalActivity.platform);
          }
        }
      }
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchActiveLabState();
    const timer = setInterval(fetchActiveLabState, 3000);
    return () => clearInterval(timer);
  }, [loadData, fetchActiveLabState, refreshKey]);

  // Available groups for active branch
  const branchGroups = useMemo(() => {
    if (!activeBranchId || activeBranchId === 'all') return groups;
    return groups.filter(g => g.branchId === activeBranchId);
  }, [groups, activeBranchId]);

  // Current active group
  const effectiveGroup = useMemo(() => {
    if (selectedGroupId === 'all_branch') return null;
    if (selectedGroupId !== 'auto') {
      return groups.find(g => g.id === selectedGroupId) || null;
    }
    return branchGroups?.[0] || groups?.[0] || null;
  }, [groups, branchGroups, selectedGroupId]);

  // Trainees of active group strictly filtered by actual registered enrollment
  const currentGroupTrainees = useMemo(() => {
    if (selectedGroupId === 'all_branch') {
      return trainees.filter(t => !activeBranchId || activeBranchId === 'all' || t.branchId === activeBranchId);
    }
    if (!effectiveGroup) {
      return trainees.filter(t => !activeBranchId || activeBranchId === 'all' || t.branchId === activeBranchId);
    }
    return trainees.filter(t => {
      const gId = t.groupId || (t as any).currentGroupId;
      return gId === effectiveGroup.id || (Array.isArray(effectiveGroup.traineeIds) && effectiveGroup.traineeIds.includes(t.id));
    });
  }, [trainees, effectiveGroup, selectedGroupId, activeBranchId]);

  // Attendance map initialization
  useEffect(() => {
    if (currentGroupTrainees.length > 0) {
      const savedKey = `nagah_lab_attendance_${effectiveGroup?.id || 'default'}`;
      try {
        const saved = localStorage.getItem(savedKey);
        if (saved) {
          setAttendanceMap(JSON.parse(saved));
          return;
        }
      } catch {}

      setAttendanceMap(prev => {
        const next = { ...prev };
        currentGroupTrainees.forEach(t => {
          if (!next[t.id]) {
            next[t.id] = 'present';
          }
        });
        return next;
      });
    }
  }, [currentGroupTrainees, effectiveGroup?.id]);

  const updateAttendance = (traineeId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceMap(prev => {
      const next = { ...prev, [traineeId]: status };
      const savedKey = `nagah_lab_attendance_${effectiveGroup?.id || 'default'}`;
      try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const displayedTrainees = useMemo(() => {
    return currentGroupTrainees.filter(t => {
      const status = attendanceMap[t.id] || 'present';
      if (filterMode === 'present' && status !== 'present' && status !== 'late') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (t.fullName || t.name || '').toLowerCase().includes(q);
        const codeMatch = (t.code || t.studentCode || '').toLowerCase().includes(q);
        return nameMatch || codeMatch;
      }
      return true;
    });
  }, [currentGroupTrainees, attendanceMap, filterMode, searchQuery]);

  const presentCount = useMemo(() => {
    return currentGroupTrainees.filter(t => attendanceMap[t.id] === 'present' || attendanceMap[t.id] === 'late').length;
  }, [currentGroupTrainees, attendanceMap]);

  // 1-Click Instant Points Award
  const handleAwardPoints = async (trainee: Trainee, pointsToAdd: number, reason: string) => {
    const pVal = Number(pointsToAdd);
    if (isNaN(pVal) || pVal === 0) return;

    setTrainees(prev =>
      prev.map(t => {
        if (t.id === trainee.id || (t.code && t.code === trainee.code)) {
          const current = Number(t.totalPoints !== undefined ? t.totalPoints : (t.points || 0));
          const next = Math.max(0, current + pVal);
          return { ...t, totalPoints: next, points: next };
        }
        return t;
      })
    );

    if (pVal > 0) {
      audioService.playStarSuccess();
      showToast(`⭐ تم منح +${pVal} نقطة للطالب ${trainee.fullName} فوراً!`, 'success');
    } else {
      showToast(`⚠️ تم خصم ${Math.abs(pVal)} نقطة من الطالب ${trainee.fullName}`, 'warning');
    }

    try {
      await api.addPoints({
        traineeIds: [trainee.id],
        points: pVal,
        reason: reason || 'تفاعل وتميز بالحصة التدريبية'
      });
    } catch (err: any) {
      console.warn('Point award sync error:', err);
    }
  };

  // Mass Points to All Present
  const handleMassAwardPresent = async (pointsToAdd: number) => {
    const presentTrainees = currentGroupTrainees.filter(t => attendanceMap[t.id] === 'present' || attendanceMap[t.id] === 'late');
    if (presentTrainees.length === 0) {
      showToast('لا يوجد طلاب مسجلين كحاضرين حالياً لمنحهم النقاط', 'warning');
      return;
    }

    const ids = presentTrainees.map(t => t.id);
    const idSet = new Set(ids);

    setTrainees(prev =>
      prev.map(t => {
        if (idSet.has(t.id)) {
          const current = Number(t.totalPoints !== undefined ? t.totalPoints : (t.points || 0));
          const next = Math.max(0, current + pointsToAdd);
          return { ...t, totalPoints: next, points: next };
        }
        return t;
      })
    );

    audioService.playFanfare();
    setCelebrationOverlay({
      active: true,
      title: `🎉 تم منح +${pointsToAdd} نجوم لجميع الحاضرين (${presentTrainees.length} طالب)!`,
      pointsBadge: `+${pointsToAdd} ⭐`,
      subtitle: `مجموعة ${effectiveGroup?.name || 'الحصة التدريبية'}`
    });

    try {
      await api.addPoints({
        traineeIds: ids,
        points: pointsToAdd,
        reason: 'مكافأة جماعية لتفاعل وتميز الحصة'
      });
    } catch (e) {}
  };

  // Broadcast ClassPoint / Kahoot / Quizizz
  const handleBroadcastExternal = async () => {
    const pin = externalPin.trim();
    if (!pin) {
      showToast(`يرجى إدخال كود مسابقة ${externalPlatform}`, 'warning');
      return;
    }

    let defaultUrl = externalUrl;
    if (externalPlatform === 'ClassPoint') defaultUrl = 'https://www.classpoint.app';
    else if (externalPlatform === 'Kahoot') defaultUrl = 'https://kahoot.it';
    else if (externalPlatform === 'Quizizz') defaultUrl = 'https://quizizz.com/join';

    setIsBroadcastingExternal(true);
    try {
      const res = await fetch('/api/lab/active-activity/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `مسابقة ${externalPlatform} الحية`,
          platform: externalPlatform,
          url: defaultUrl,
          gamePin: pin
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveBroadcast(data.activity);
        audioService.playFanfare();
        showToast(`🚀 تم بث كود ${externalPlatform} (${pin}) لجميع أجهزة وبوابات الطلاب بنجاح!`, 'success');
      }
    } catch (e) {
      showToast('فشل بث الكود للطلاب', 'error');
    } finally {
      setIsBroadcastingExternal(false);
    }
  };

  const handleClearExternalBroadcast = async () => {
    try {
      await fetch('/api/lab/active-activity/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', platform: '', url: '', gamePin: '' })
      });
      setActiveBroadcast(null);
      showToast('تم إنهاء وإغلاق بث المسابقة الحالية', 'info');
    } catch (e) {}
  };

  // 1. Launch 4-Choice MCQ (Secret hidden answer for projector)
  const handleLaunchMCQ = async () => {
    const qText = customQuestionInput.trim() || '🎧 استمع لسؤال المعلم شفوياً في القاعة أو انظر لشاشة العرض';
    try {
      const res = await fetch('/api/lab/quick-question/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'choices',
          questionText: qText,
          correctAnswer: '', // Intentionally empty initially so answer is hidden
          options: [
            { key: 'A', label: 'أ / A (أحمر)', color: 'bg-rose-600 hover:bg-rose-500' },
            { key: 'B', label: 'ب / B (أزرق)', color: 'bg-blue-600 hover:bg-blue-500' },
            { key: 'C', label: 'ج / C (أصفر)', color: 'bg-amber-500 hover:bg-amber-400' },
            { key: 'D', label: 'د / D (أخضر)', color: 'bg-emerald-600 hover:bg-emerald-500' }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveQuickQuestion(data.question);
        audioService.playChime();
        showToast('🚀 تم بث السؤال للشاشات! الطلاب يصوتون الآن والإجابة مخفية عنهم تماماً', 'success');
      }
    } catch (e) {
      showToast('فشل بث السؤال', 'error');
    }
  };

  // 2. Launch True / False Question
  const handleLaunchTrueFalse = async () => {
    const qText = customQuestionInput.trim() || '🎧 هل العبارة التي ذكرها المعلم صحيحة أم خاطئة؟';
    try {
      const res = await fetch('/api/lab/quick-question/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'true_false',
          questionText: qText,
          correctAnswer: '',
          options: [
            { key: 'true', label: 'صحيحة ✅ (أخضر)', color: 'bg-emerald-600 hover:bg-emerald-500' },
            { key: 'false', label: 'خاطئة ❌ (أحمر)', color: 'bg-rose-600 hover:bg-rose-500' }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveQuickQuestion(data.question);
        audioService.playChime();
        showToast('🚀 تم بث سؤال صح أو خطأ للشاشات! التصويت مفتوح والإجابة مخفية', 'success');
      }
    } catch (e) {
      showToast('فشل بث السؤال', 'error');
    }
  };

  // 3. Close Voting
  const handleCloseVoting = async () => {
    try {
      const res = await fetch('/api/lab/quick-question/close', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActiveQuickQuestion(data.question);
        audioService.playChime();
        showToast('🔒 تم قفل استقبال الإجابات! يمكنك الآن مناقشة الإجابات وكشف الفائزين', 'info');
      }
    } catch (e) {}
  };

  // 4. Reveal Correct Answer and Crown Winners
  const handleRevealAnswer = async (choiceKey: string) => {
    try {
      const res = await fetch('/api/lab/quick-question/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctAnswer: choiceKey,
          pointsToAward: pointsReward
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveQuickQuestion(data.question);
        audioService.playFanfare();

        setCelebrationOverlay({
          active: true,
          title: `🎉 الإجابة الصحيحة هي (${choiceKey})! تم تتويج ${data.correctCount} فائزين!`,
          pointsBadge: `+${pointsReward} ⭐`,
          subtitle: `تم إضافة النجوم فورياً في حسابات الطلاب المتفوقين`
        });

        showToast(`✨ تم كشف الإجابة (${choiceKey}) ومنح +${pointsReward} نجوم لـ ${data.correctCount} طالب! 🏆`, 'success');
        loadData(); // reload points
      }
    } catch (e) {
      showToast('فشل كشف الإجابة', 'error');
    }
  };

  // 5. Clear Question
  const handleClearQuestion = async () => {
    try {
      await fetch('/api/lab/quick-question/clear', { method: 'POST' });
      setActiveQuickQuestion(null);
      setCustomQuestionInput('');
      showToast('تم إنهاء السؤال وتجهيز المعمل للسؤال التالي', 'info');
    } catch (e) {}
  };

  // Reset Lab Session
  const handleResetLab = async () => {
    try {
      localStorage.removeItem(`nagah_lab_attendance_${effectiveGroup?.id || 'default'}`);
      setAttendanceMap({});
      await handleClearExternalBroadcast();
      await handleClearQuestion();
      showToast('تم تفريغ المعمل وإعادة الضبط بنجاح لبدء الجروب الجديد 🔄✨', 'success');
    } catch (e) {
      showToast('فشل إعادة ضبط المعمل', 'error');
    }
  };

  // Answer tallies calculation for projector bar charts
  const answersList = useMemo(() => {
    return Object.values(activeQuickQuestion?.answers || {}) as any[];
  }, [activeQuickQuestion]);

  const tallyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (activeQuickQuestion?.options) {
      activeQuickQuestion.options.forEach((opt: any) => {
        counts[opt.key] = 0;
      });
    }
    answersList.forEach((ans: any) => {
      const k = ans.answer;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [activeQuickQuestion, answersList]);

  const branchName = useMemo(() => {
    if (!activeBranchId || activeBranchId === 'all') return 'جميع الفروع';
    return branches.find(b => b.id === activeBranchId)?.name || 'الفرع المحدد';
  }, [branches, activeBranchId]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans dir-rtl text-right" dir="rtl">
      
      {/* 1. TOP HEADER & MAIN COCKPIT CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Title & Group Details */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 shrink-0">
            💻
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                المعمل التفاعلي جاهز
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
                {branchName} 📍
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              غرفة إدارة الحصة والمعمل التفاعلي
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              عرض البروجكتور التفاعلي، بث كلاس بوينت وكاهوت، كشف الإجابات الذكي، ورصد حضور ونقاط الطلاب
            </p>
          </div>
        </div>

        {/* Top Actions & Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Smart Whiteboard Button */}
          <button
            onClick={() => setIsWhiteboardOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer border border-indigo-400/50"
            title="فتح السبورة الذكية للشرح التفاعلي بالرسم والأشكال"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-black">السبورة الذكية 🎨</span>
          </button>

          {/* AI All-In-One Lesson Pack Button */}
          <button
            onClick={() => setIsAllInOneModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all active:scale-95 cursor-pointer border border-purple-400/50"
            title="توليد خطة الدرس ومسابقة الكاهوت بنقرة واحدة بالذكاء الاصطناعي"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span className="text-white font-black">حزمة الدرس (AI) 🪄</span>
          </button>

          {/* Hall Clapping Sound */}
          <button
            onClick={() => {
              audioService.playClapping(3.5);
              showToast('👏 تم تشغيل تصفيق حار وتشجيع جماعي بالقاعة!', 'success');
            }}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="تشغيل تصفيق حار وتشجيع للطلاب"
          >
            <span>👏 تصفيق وحماس</span>
          </button>

          {/* Reset Session Button */}
          <button
            onClick={handleResetLab}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="تفريغ المعمل وتجهيزه لاستقبال الجروب القادم"
          >
            <RotateCcw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>تبديل الجروب 🔄</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-2xl transition-all cursor-pointer shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* 2. AUDIO ROUTING & PROJECTOR SOUND ENGINE (توجيه صوت المايك للشاشة والبروجيكتور) */}
      <ProjectorAudioControlBar />

      {/* 3. GROUP SELECTOR & MAIN TABS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Main Tabs Navigation */}
        <div className="flex items-center gap-2 w-full xl:w-auto flex-wrap">
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Tv className={`w-4 h-4 ${activeTab === 'activities' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
            <span className={activeTab === 'activities' ? 'text-white font-black' : ''}>🎮 مسابقات الحصة والبروجكتور</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'roster' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span className={activeTab === 'roster' ? 'text-white font-black' : ''}>👥 كشف الحضور ورصد النجوم ({presentCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('recap')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-400 font-black'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'recap' ? 'text-slate-950 font-bold' : 'text-amber-500'}`} />
            <span className={activeTab === 'recap' ? 'text-slate-950 font-black' : ''}>📚 ملخص المحاضرة وتكليفات الواجب</span>
          </button>
        </div>

        {/* Group Selector & Quick Mass Points */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              المجموعة:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="auto">تلقائي (أول مجموعة بالفرع)</option>
              <option value="all_branch">جميع طلاب الفرع ({trainees.filter(t => !activeBranchId || activeBranchId === 'all' || t.branchId === activeBranchId).length} طالب مسجل)</option>
              {branchGroups.map(g => {
                const count = trainees.filter(t => t.groupId === g.id || (t as any).currentGroupId === g.id || (Array.isArray(g.traineeIds) && g.traineeIds.includes(t.id))).length;
                const crsName = courses.find(c => c.id === g.courseId)?.title || courses.find(c => c.id === g.courseId)?.name || '';
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} {crsName ? `(${crsName})` : ''} - [{count} طلاب]
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => handleMassAwardPresent(5)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer border border-emerald-400"
            title="منح 5 نجوم لجميع الطلاب الحاضرين حالياً بالقاعة بنقرة واحدة"
          >
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span className="text-white font-black">+5 نجوم للحاضرين ⭐</span>
          </button>
        </div>
      </div>

      {/* 3. TAB 1: ACTIVITIES & PROJECTOR PRESENTATION */}
      {activeTab === 'activities' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SECTION A: CLASSPOINT, KAHOOT & QUIZIZZ BROADCAST BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-500/30">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    بث مسابقات كلاس بوينت / كاهوت / كويزيز (ClassPoint & Kahoot)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    أدخل كود الفصل أو اللعبة واضغط بث، وسيفتح عند الطلاب بلمسة واحدة مع نسخ أسمائهم تلقائياً
                  </p>
                </div>
              </div>

              {activeBroadcast?.gamePin && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 rounded-full text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    البث نشط للطلاب ({activeBroadcast.platform}: {activeBroadcast.gamePin})
                  </span>
                  <button
                    onClick={handleClearExternalBroadcast}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 rounded-xl text-xs font-bold"
                  >
                    إنهاء البث
                  </button>
                </div>
              )}
            </div>

            {/* Platform & PIN Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              
              {/* Select Platform */}
              <div className="sm:col-span-4">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                  المنصة المستخدمة:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setExternalPlatform('ClassPoint');
                      setExternalUrl('https://www.classpoint.app');
                    }}
                    className={`py-2 px-2 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                      externalPlatform === 'ClassPoint'
                        ? '!bg-purple-600 !text-white !border-purple-500 shadow-md ring-2 ring-purple-400/40'
                        : '!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-100 !border-slate-300 dark:!border-slate-700'
                    }`}
                  >
                    <span>كلاس بوينت</span>
                    <span>✨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExternalPlatform('Kahoot');
                      setExternalUrl('https://kahoot.it');
                    }}
                    className={`py-2 px-2 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                      externalPlatform === 'Kahoot'
                        ? '!bg-purple-600 !text-white !border-purple-500 shadow-md ring-2 ring-purple-400/40'
                        : '!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-100 !border-slate-300 dark:!border-slate-700'
                    }`}
                  >
                    <span>كاهوت</span>
                    <span>🎮</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExternalPlatform('Quizizz');
                      setExternalUrl('https://quizizz.com/join');
                    }}
                    className={`py-2 px-2 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                      externalPlatform === 'Quizizz'
                        ? '!bg-purple-600 !text-white !border-purple-500 shadow-md ring-2 ring-purple-400/40'
                        : '!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-100 !border-slate-300 dark:!border-slate-700'
                    }`}
                  >
                    <span>كويزيز</span>
                    <span>⚡</span>
                  </button>
                </div>
              </div>

              {/* Game / Class PIN */}
              <div className="sm:col-span-4">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>كود الفصل أو اللعبة (PIN / Code):</span>
                  <span className="text-[10px] text-slate-500">يظهر فوراً للطالب</span>
                </label>
                <input
                  type="text"
                  placeholder="أدخل كود المسابقة هنا..."
                  value={externalPin}
                  onChange={(e) => setExternalPin(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border-2 border-purple-300 dark:border-purple-500/40 hover:border-purple-400 focus:border-purple-600 text-purple-700 dark:text-purple-300 font-mono text-base font-black text-center rounded-xl px-3 py-1.5 focus:outline-none tracking-widest shadow-inner"
                />
              </div>

              {/* Action Button */}
              <div className="sm:col-span-4">
                <button
                  onClick={handleBroadcastExternal}
                  disabled={isBroadcastingExternal || !externalPin.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 px-4 rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-purple-500"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isBroadcastingExternal ? 'جاري البث...' : `🚀 بث كود ${externalPlatform} للطلاب الآن`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION B: LIVE PROJECTOR QUESTION COCKPIT (عرض البروجكتور التفاعلي الكامل) */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Projector Header Badge */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-500/30">
                  <Tv className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] font-black rounded-lg border border-blue-200 dark:border-blue-500/30">
                      شاشة العرض المباشرة (البروجكتور) 📽️
                    </span>
                    {activeQuickQuestion && (
                      <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-black rounded-lg border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        {activeQuickQuestion.closed ? '🔒 التصويت مغلق' : '🟢 التصويت مفتوح'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    تحدي الحصة وسؤال التصويت اللحظي
                  </h2>
                </div>
              </div>

              {/* Question Rewards & Quick Launchers */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">جائزة الإجابة:</span>
                  <select
                    value={pointsReward}
                    onChange={(e) => setPointsReward(Number(e.target.value))}
                    className="bg-transparent text-blue-600 dark:text-blue-400 text-xs font-black focus:outline-none cursor-pointer"
                  >
                    <option value={3}>+3 نجوم ⭐</option>
                    <option value={5}>+5 نجوم 🌟</option>
                    <option value={10}>+10 نجوم 🏆</option>
                  </select>
                </div>

                {activeQuickQuestion && (
                  <button
                    onClick={handleClearQuestion}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>سؤال جديد</span>
                  </button>
                )}
              </div>
            </div>

            {/* IF NO ACTIVE QUESTION: LAUNCH CONTROLS */}
            {!activeQuickQuestion ? (
              <div className="space-y-5 py-4">
                
                {/* Optional Custom Question Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    نص السؤال (اختياري - يمكنك طرحه شفوياً بالقاعة أو كتابته هنا ليظهر على البروجكتور):
                  </label>
                  <input
                    type="text"
                    placeholder="اكتب نص السؤال هنا (أو اتركه فارغاً للسؤال الشفهي)..."
                    value={customQuestionInput}
                    onChange={(e) => setCustomQuestionInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-500 text-slate-900 dark:text-white rounded-2xl p-4 text-sm font-bold focus:outline-none placeholder:text-slate-400 shadow-inner"
                  />
                </div>

                {/* Launch Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Launch 4 Choices MCQ */}
                  <button
                    onClick={handleLaunchMCQ}
                    className="p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 cursor-pointer border border-indigo-500 text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🎯
                    </div>
                    <span className="text-lg font-black text-white">إطلاق سؤال 4 خيارات (A / B / C / D)</span>
                    <span className="text-xs text-indigo-100 opacity-90">
                      يظهر التصويت فوراً على الشاشات مع إخفاء الإجابة الصحيحة
                    </span>
                  </button>

                  {/* Launch True / False */}
                  <button
                    onClick={handleLaunchTrueFalse}
                    className="p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 cursor-pointer border border-emerald-500 text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      ⚖️
                    </div>
                    <span className="text-lg font-black text-white">إطلاق سؤال صح أو خطأ (True / False)</span>
                    <span className="text-xs text-emerald-100 opacity-90">
                      زرين ملونين عند الطلاب مع إخفاء النتيجة حتى تقرر كشفها
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE QUESTION DISPLAY ON PROJECTOR */
              <div className="space-y-6">
                
                {/* Question Banner on Projector */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-inner">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    {activeQuickQuestion.type === 'choices' ? 'سؤال اختيار من متعدد' : 'سؤال صح أو خطأ'}
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-relaxed">
                    {activeQuickQuestion.questionText || '🎧 استمع لسؤال المعلم شفوياً في القاعة واختر إجابتك الآن!'}
                  </h3>
                </div>

                {/* 4 Interactive Option Cards with Live Tallies */}
                <div className={`grid gap-4 ${activeQuickQuestion.type === 'true_false' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {(activeQuickQuestion.options || []).map((opt: any) => {
                    const count = tallyCounts[opt.key] || 0;
                    const isRevealed = !!activeQuickQuestion.revealed;
                    const isCorrect = isRevealed && String(activeQuickQuestion.correctAnswer).toLowerCase() === String(opt.key).toLowerCase();

                    return (
                      <div
                        key={opt.key}
                        className={`p-5 sm:p-6 rounded-3xl border-2 transition-all flex flex-col justify-between gap-4 ${
                          isRevealed
                            ? isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-4 ring-emerald-500/30 shadow-lg'
                              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-50'
                            : 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-lg ${opt.color}`}>
                              {opt.key}
                            </span>
                            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                              {opt.label}
                            </span>
                          </div>

                          {/* Live Votes Counter (Hidden who voted, only shows tally) */}
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                            <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                              {count} {count === 1 ? 'صوت' : 'أصوات'}
                            </span>
                          </div>
                        </div>

                        {/* If NOT REVEALED: Teacher Direct Reveal Button For This Option */}
                        {!isRevealed ? (
                          <button
                            type="button"
                            onClick={() => handleRevealAnswer(opt.key)}
                            className="w-full py-2.5 px-3 !bg-slate-100 hover:!bg-emerald-600 hover:!text-white !text-slate-900 dark:!bg-slate-800 dark:hover:!bg-emerald-600 dark:!text-slate-100 !border !border-slate-300 dark:!border-slate-700 hover:!border-emerald-500 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm group"
                            title={`انقر هنا لتعيين (${opt.key}) كإجابة صحيحة وتوزيع النجوم فوراً`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                            <span>تعيين هذا الخيار ({opt.key}) كإجابة صحيحة وكشف النتيجة ✨</span>
                          </button>
                        ) : isCorrect ? (
                          <div className="py-2 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-400 dark:border-emerald-500/40 rounded-xl text-center text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 animate-bounce">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span>الإجابة النموذجية الصحيحة ✅</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* TEACHER MASTER CONTROL TOOLBAR */}
                <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      إجمالي المشاركين: <strong className="text-slate-900 dark:text-white font-mono text-sm">{answersList.length}</strong> طالب
                    </span>
                    {activeQuickQuestion.revealed ? (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300 dark:border-emerald-500/30">
                        تم كشف الإجابة ({activeQuickQuestion.correctAnswer}) وتوزيع النجوم 🌟
                      </span>
                    ) : activeQuickQuestion.closed ? (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-black rounded-full border border-blue-200 dark:border-blue-500/30">
                        🔒 التصويت مغلق - جاهز لكشف الإجابة
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-200 dark:border-emerald-500/30">
                        🟢 التصويت جاري الآن
                      </span>
                    )}
                  </div>

                  {/* Master Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!activeQuickQuestion.closed && !activeQuickQuestion.revealed && (
                      <button
                        onClick={handleCloseVoting}
                        className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>قفل التصويت</span>
                      </button>
                    )}

                    <button
                      onClick={handleClearQuestion}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>سؤال جديد 🔄</span>
                    </button>
                  </div>
                </div>

                {/* WINNERS LIST (Only shown after reveal) */}
                {activeQuickQuestion.revealed && (
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>قائمة الفائزين أصحاب الإجابة الصحيحة ({answersList.filter(a => a.isCorrect).length} طالب):</span>
                      </h4>
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                        حصل كل منهم على +{pointsReward} نجوم تميز ⭐
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {answersList.filter(a => a.isCorrect).map((winner, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between shadow-sm"
                        >
                          <span className="truncate">{winner.studentName}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">✓ +{pointsReward}</span>
                        </div>
                      ))}
                      {answersList.filter(a => a.isCorrect).length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 col-span-full text-center py-2">
                          لم يقم أحد باختيار الإجابة الصحيحة في هذه الجولة
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: LIVE ROSTER & TARGETED POINTS (كشف الحضور ورصد النجوم) */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-5 animate-fadeIn">
          
          {/* Header & Filter Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>كشف حضور طلاب المجموعة ومنح النجوم الفورية</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                تسجيل الحضور الفعلي بنقرة واحدة، ومنح النقاط والنجوم المباشرة لكل متدرب
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setFilterMode('present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    filterMode === 'present'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  الحاضرين بالقاعة ({presentCount})
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  الكل ({currentGroupTrainees.length})
                </button>
              </div>

              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث بالطالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pr-9 pl-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayedTrainees.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs col-span-full">
                {currentGroupTrainees.length === 0
                  ? 'لا يوجد طلاب مسجلين بهذه المجموعة'
                  : 'لا يوجد طلاب مطابقين لفلتر البحث'}
              </div>
            ) : (
              displayedTrainees.map((trainee) => {
                const isPresent = (attendanceMap[trainee.id] || 'present') === 'present';
                const currentPts = trainee.totalPoints !== undefined ? trainee.totalPoints : (trainee.points || 0);

                return (
                  <div
                    key={trainee.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 transition-all shadow-sm"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => updateAttendance(trainee.id, isPresent ? 'absent' : 'present')}
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isPresent
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-200'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 hover:bg-rose-200'
                        }`}
                        title={isPresent ? 'مسجل حاضر (انقر للتحويل لغائب)' : 'مسجل غائب (انقر للتحويل لحاضر)'}
                      >
                        {isPresent ? '✓' : '✗'}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {trainee.fullName || trainee.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                            {trainee.code || trainee.studentCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-blue-500" />
                            {currentPts} نقطة
                          </span>
                          {!isPresent && (
                            <span className="text-[9px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 rounded">
                              غائب
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instant Points Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleAwardPoints(trainee, 1, 'إجابة سريعة')}
                        className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-xl text-xs font-black transition-all active:scale-90 cursor-pointer"
                        title="منح +1 نقطة"
                      >
                        +1 ⭐
                      </button>

                      <button
                        onClick={() => handleAwardPoints(trainee, 5, 'تفاعل ومشاركة متميزة')}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-90 cursor-pointer border border-indigo-500"
                        title="منح +5 نقاط"
                      >
                        +5 🌟
                      </button>

                      <button
                        onClick={() => handleAwardPoints(trainee, 10, 'إبداع وتفوق استثنائي')}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-90 cursor-pointer border border-purple-500"
                        title="منح +10 نقاط"
                      >
                        +10 🏆
                      </button>

                      <button
                        onClick={() => handleAwardPoints(trainee, -2, 'تنبيه انضباط')}
                        className="p-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-[10px] font-bold transition-all active:scale-90 cursor-pointer"
                        title="خصم 2 نقطة"
                      >
                        -2
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: LECTURE RECAP & HOMEWORK HUB (ملخص المحاضرة والواجبات) */}
      {activeTab === 'recap' && (
        <div className="animate-fadeIn">
          <LectureRecapManager
            mode="trainer_admin"
            currentGradeLevel={branchGroups.find(g => g.id === selectedGroupId)?.name || 'الصف الرابع الابتدائي (Grade 4 Languages)'}
          />
        </div>
      )}

      {/* MODALS */}
      {/* 1. Smart Whiteboard */}
      {isWhiteboardOpen && (
        <SmartWhiteboardModal
          isOpen={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}

      {/* 2. All In One AI Lesson Plan Pack */}
      {isAllInOneModalOpen && (
        <AllInOneLessonPlanModal
          isOpen={isAllInOneModalOpen}
          onClose={() => setIsAllInOneModalOpen(false)}
          activeBranchId={activeBranchId}
          courses={courses}
          groups={groups}
          trainers={trainers}
          onPlanGenerated={(plan) => {
            showToast('تم توليد حزمة الدرس بنجاح! 🪄', 'success');
          }}
        />
      )}

      {/* 3. Celebration Overlay */}
      {celebrationOverlay.active && (
        <CelebrationBalloonsOverlay
          active={celebrationOverlay.active}
          title={celebrationOverlay.title}
          pointsBadge={celebrationOverlay.pointsBadge}
          subtitle={celebrationOverlay.subtitle}
          onComplete={() => setCelebrationOverlay({ active: false })}
        />
      )}
    </div>
  );
};
