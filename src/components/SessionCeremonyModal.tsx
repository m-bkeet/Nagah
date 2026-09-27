import React, { useState, useEffect, useRef } from 'react';
import { Trainee, Group, AttendanceRecord } from '../types';
import { api } from '../services/api';
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  X,
  Volume2,
  Crown,
  PartyPopper,
  Users,
  CheckCircle2,
  UserCheck,
  Shield,
  ChevronDown,
  Camera,
  Share2,
  Download,
  Copy,
  MessageCircle,
  ExternalLink,
  Check,
  FileText,
  Send,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { captureElementToCanvas } from '../utils/captureUtils';
import { getResolvedTraineePhoto } from '../utils/centerLogo';
import confetti from 'canvas-confetti';

interface SessionCeremonyModalProps {
  trainees: Trainee[];
  groups: Group[];
  initialGroupId?: string;
  initialAttendeesOnly?: boolean;
  onClose: () => void;
  onAwardBonus: (traineeId: string, points: number, reason: string) => void;
}

export const SessionCeremonyModal: React.FC<SessionCeremonyModalProps> = ({
  trainees = [],
  groups = [],
  initialGroupId,
  initialAttendeesOnly = false,
  onClose,
  onAwardBonus,
}) => {
  // Celebration scope: 'last_lecture' | 'week_stars' | 'group' | 'center'
  const [celebrationScope, setCelebrationScope] = useState<'last_lecture' | 'week_stars' | 'group' | 'center'>('last_lecture');

  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeTrainees = Array.isArray(trainees) ? trainees : [];

  // Determine default selected group
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    if (initialGroupId && initialGroupId !== 'all') return initialGroupId;
    if (safeGroups.length > 0) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const matched = safeGroups.find(g => {
        if (!g?.scheduleTime) return false;
        const [h, m] = g.scheduleTime.split(':').map(Number);
        if (isNaN(h)) return false;
        const groupStart = h * 60 + (m || 0);
        return Math.abs(currentMinutes - groupStart) <= 120;
      });
      return matched?.id || safeGroups[0]?.id || 'all';
    }
    return 'all';
  });

  const [filterMode, setFilterMode] = useState<'present_only' | 'group_all'>('group_all');
  const [sessionName, setSessionName] = useState<string>('حفل تتويج نجوم آخر محاضرة تدريبية 🌟');

  const [ceremonyStep, setCeremonyStep] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeDeviceTraineeIds, setActiveDeviceTraineeIds] = useState<string[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);
  const [bonusAwardedMap, setBonusAwardedMap] = useState<Record<string, boolean>>({});

  // Capture & Share State
  const podiumCardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch attendance records (recent and today) and active lab devices
  useEffect(() => {
    let isMounted = true;
    const fetchSessionData = async () => {
      try {
        setIsLoadingAttendance(true);
        const [attList, devList] = await Promise.all([
          api.getAttendance({}).catch(() => [] as AttendanceRecord[]),
          api.getDevices().catch(() => [])
        ]);

        if (!isMounted) return;
        setAttendanceRecords(attList || []);

        const activeIds: string[] = [];
        (devList || []).forEach((d: any) => {
          if (d?.currentTraineeId) activeIds.push(d.currentTraineeId);
          if (d?.currentTraineeCode) activeIds.push(d.currentTraineeCode);
        });
        setActiveDeviceTraineeIds(activeIds);
      } catch (err) {
        console.warn('Attendance sync error for ceremony:', err);
      } finally {
        if (isMounted) setIsLoadingAttendance(false);
      }
    };

    fetchSessionData();
    return () => {
      isMounted = false;
      try { audioService.stopAll(); } catch (e) {}
    };
  }, []);

  // Update session name when scope or group changes
  useEffect(() => {
    if (celebrationScope === 'last_lecture') {
      const activeGrp = safeGroups.find(g => g?.id === selectedGroup);
      setSessionName(activeGrp ? `حفل نجوم آخر محاضرة (${activeGrp.name})` : 'حفل نجوم آخر محاضرة تدريبية بالمعمل 🌟');
    } else if (celebrationScope === 'week_stars') {
      setSessionName('🏆 حفل تتويج أبطال ونجوم الأسبوع الحالي');
    } else if (celebrationScope === 'center') {
      setSessionName('👑 حفل لوحة شرف المركز العام للتدريب');
    } else {
      const grp = safeGroups.find(g => g?.id === selectedGroup);
      setSessionName(grp ? `حفل ختام جلسة ${grp.name}` : 'حفل ختام المحاضرة التدريبية');
    }
  }, [celebrationScope, selectedGroup, safeGroups]);

  // Compute eligible trainees based on celebrationScope
  const eligibleTrainees = React.useMemo(() => {
    let list: Trainee[] = [...safeTrainees];

    if (celebrationScope === 'center' || celebrationScope === 'week_stars') {
      return list.sort((a, b) => ((b?.points ?? b?.totalPoints ?? 0) - (a?.points ?? a?.totalPoints ?? 0)));
    }

    if (celebrationScope === 'last_lecture' || celebrationScope === 'group') {
      const targetGroupId = selectedGroup !== 'all' ? selectedGroup : safeGroups[0]?.id;
      
      // Filter by group if specified
      if (targetGroupId) {
        const groupMembers = list.filter(t => t?.groupId === targetGroupId || (t as any)?.group_id === targetGroupId);
        if (groupMembers.length > 0) {
          list = groupMembers;
        }
      }

      // If present only mode, check attendance or lab devices
      if (filterMode === 'present_only') {
        const presentList = list.filter(t => {
          if (!t) return false;
          const hasAtt = (attendanceRecords || []).some(a => 
            a && (a.traineeId === t.id || a.traineeId === t.code) && 
            (a.status === 'present' || a.status === 'late')
          );
          const isAtDevice = (activeDeviceTraineeIds || []).includes(t.id) || (t.code && (activeDeviceTraineeIds || []).includes(t.code));
          return hasAtt || isAtDevice;
        });

        if (presentList.length > 0) {
          list = presentList;
        }
      }

      return list.sort((a, b) => ((b?.points ?? b?.totalPoints ?? 0) - (a?.points ?? a?.totalPoints ?? 0)));
    }

    return list.sort((a, b) => ((b?.points ?? b?.totalPoints ?? 0) - (a?.points ?? a?.totalPoints ?? 0)));
  }, [safeTrainees, celebrationScope, selectedGroup, filterMode, attendanceRecords, activeDeviceTraineeIds, safeGroups]);

  const top3 = eligibleTrainees.slice(0, 3);
  const activeGroupObj = safeGroups.find(g => g?.id === selectedGroup);

  const handleCloseModal = () => {
    try { audioService.stopAll(); } catch (e) {}
    if (onClose) onClose();
  };

  const playChime = (freqs: number[]) => {
    if (isMuted) return;
    try { audioService.playChime(freqs); } catch (e) {}
  };

  const speakText = async (text: string) => {
    if (isMuted) return;
    try { await audioService.speakText(text); } catch (e) {}
  };

  const fireConfetti = (originY = 0.6) => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: originY },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#818cf8', '#10b981']
      });
    } catch {}
  };

  const startCeremony = async () => {
    if (top3.length === 0) return;
    setCeremonyStep(1); // Reveal 3rd (Bronze)
    playChime([440, 554.37, 659.25]);
    fireConfetti(0.7);

    try {
      await api.broadcastCeremony({
        step: 1,
        top3,
        sessionName,
        isStarting: true
      });
      await api.forceCeremony(true);
    } catch (e) {
      console.error('Broadcast failed:', e);
    }
  };

  const nextStep = async () => {
    if (ceremonyStep === 1) {
      setCeremonyStep(2); // Reveal 2nd (Silver)
      playChime([523.25, 659.25, 783.99]);
      fireConfetti(0.6);
      try { await api.broadcastCeremony({ step: 2, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 2) {
      setCeremonyStep(3); // Reveal 1st (Gold Champion)
      if (!isMuted) {
        try { audioService.playWinnerFanfare(); } catch {}
        try { audioService.playClapping(4); } catch {}
      }
      playChime([523.25, 659.25, 783.99, 1046.5]);
      fireConfetti(0.5);
      try { await api.broadcastCeremony({ step: 3, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 3) {
      setCeremonyStep(4); // Finished ceremony
      fireConfetti(0.4);
      try { 
        await api.broadcastCeremony({ step: 4, top3, sessionName, isFinished: true });
        await api.forceCeremony(false);
      } catch (e) {}
    }
  };

  const handleGiveBonus = async (trainee: Trainee, points: number, rankTitle: string) => {
    if (!trainee) return;
    const traineeKey = trainee.id || trainee.code || 'unknown';
    if (bonusAwardedMap[traineeKey]) return;
    try {
      if (onAwardBonus) onAwardBonus(trainee.id, points, `مكافأة منصة التتويج (${rankTitle}) في ${sessionName}`);
      await api.addPoints({
        traineeId: trainee.id || trainee.code,
        points,
        reason: `مكافأة منصة التتويج (${rankTitle}) في ${sessionName}`
      });
      setBonusAwardedMap(prev => ({ ...prev, [traineeKey]: true }));
      playChime([600, 800, 1000]);
      fireConfetti(0.6);
    } catch (e) {
      console.warn('Failed to add bonus points:', e);
    }
  };

  // Build Arabic Congratulatory Text for WhatsApp & Sharing
  const buildCongratsMessage = () => {
    const groupName = activeGroupObj?.name || (selectedGroup === 'all' ? 'طلاب المركز العام' : 'المجموعة التدريبية');
    const firstPlace = top3[0] 
      ? `🥇 *المركز الأول (بطل الجلسة والتاج):* ${top3[0].fullName} (كود: ${top3[0].code || '---'}) - *${top3[0].points || 0} نقطة تميز* 👑` 
      : '';
    const secondPlace = top3[1] 
      ? `🥈 *المركز الثاني (فارس التميز):* ${top3[1].fullName} (كود: ${top3[1].code || '---'}) - *${top3[1].points || 0} نقطة تميز* ⭐` 
      : '';
    const thirdPlace = top3[2] 
      ? `🥉 *المركز الثالث (نجم الإصرار):* ${top3[2].fullName} (كود: ${top3[2].code || '---'}) - *${top3[2].points || 0} نقطة تميز* ⭐` 
      : '';

    return `🏆✨ *حفل تتويج نجوم وأبطال الجلسة التدريبية* ✨🏆\n🏢 *مركز النجاح للتدريب والاستشارات*\n👥 *المجموعة:* ${groupName}\n📅 *التاريخ:* ${new Date().toLocaleDateString('ar-EG')}\n\n🌟 *لوحة شرف وفرسان الحصة اليوم:*\n${firstPlace}\n${secondPlace}\n${thirdPlace}\n\n🎉 ألف مبروك لجميع أبطالنا المتميزين على تفاعلهم الاستثنائي! تم توثيق منصة التتويج بنجاح 🚀👏`;
  };

  // Generate high-resolution image capture of the podium (Guaranteed 100% visible & oklab safe)
  const capturePodiumCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!podiumCardRef.current) return null;
    setIsCapturing(true);
    
    // Give React 150ms to render the capture mode (ensuring all 3 cards are fully visible & buttons hidden)
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const isDark = document.documentElement.classList.contains('dark');
      const canvas = await captureElementToCanvas(podiumCardRef.current, {
        scale: 2,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        ignoreClass: 'no-capture'
      });
      return canvas;
    } catch (err) {
      console.error('Error generating podium snapshot:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  // Download Screenshot as PNG
  const handleDownloadSnapshot = async () => {
    const canvas = await capturePodiumCanvas();
    if (!canvas) {
      setActionNotice('⚠️ تعذر التقاط صورة المنصة، يرجى المحاولة مرة أخرى.');
      setTimeout(() => setActionNotice(null), 3000);
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const groupTitle = (activeGroupObj?.name || 'الطلاب').replace(/[\/\s]/g, '_');
    link.download = `منصة_تتويج_${groupTitle}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionNotice('📸 تم حفظ وتنزيل لقطة منصة التتويج بنجاح كملف PNG!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Copy Image to System Clipboard
  const handleCopySnapshot = async () => {
    const canvas = await capturePodiumCanvas();
    if (!canvas) {
      setActionNotice('⚠️ تعذر التقاط الصورة، يرجى المحاولة مرة أخرى.');
      setTimeout(() => setActionNotice(null), 3000);
      return;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopiedImage(true);
        setActionNotice('📋 تم نسخ صورة منصة التتويج إلى الحافظة! يمكنك لصقها (Ctrl+V) مباشرة في واتساب');
        setTimeout(() => setIsCopiedImage(false), 3500);
        setTimeout(() => setActionNotice(null), 5000);
        return;
      }
    } catch (err) {
      console.warn('Direct image clipboard copy failed, downloading image as fallback:', err);
    }

    // Fallback if clipboard image writing is denied
    handleDownloadSnapshot();
    setActionNotice('📥 تم تنزيل صورة المنصة مباشرة على جهازك لسهولة إرفاقها ومشاركتها!');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Share to WhatsApp (Direct WhatsApp Dispatch with Pre-filled Text + Image Auto-Save)
  const handleShareToWhatsApp = async () => {
    setActionNotice('⏳ جاري تجهيز نص التهنئة وصورة التتويج...');
    const msg = buildCongratsMessage();

    // 1. Trigger high-resolution snapshot download & clipboard copy in parallel
    handleDownloadSnapshot();
    try {
      const canvas = await capturePodiumCanvas();
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          await navigator.clipboard.write([
            new (window as any).ClipboardItem({ 'image/png': blob })
          ]);
        }
      }
    } catch {}

    // 2. Open WhatsApp directly with the complete formatted congratulatory text
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    setActionNotice('🚀 تم فتح الواتساب بنص التهنئة الكامل، وتم تنزيل ونسخ صورة التتويج بنجاح!');
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 dark:bg-slate-950/90 backdrop-blur-md overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-500/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
        
        {/* Ambient Subtle Shimmers in Header */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/15 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-400/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header (Fixed top) */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
                منصة تتويج نجوم الجلسة الأبطال 🏆
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                إعلان أوائل المجموعة الحاضرين في الجلسة تصاعدياً مع نطق الأسماء والتأثيرات التفاعلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  : 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
              }`}
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Bar (Toast for Capture / WhatsApp) */}
        {actionNotice && (
          <div className="bg-emerald-500 text-white font-bold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner transition-all animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 relative z-10 custom-scrollbar">
          {ceremonyStep === 0 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              
              {/* Scope Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCelebrationScope('last_lecture')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    celebrationScope === 'last_lecture'
                      ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 dark:border-amber-400 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/40 font-black shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs">🌟 نجوم آخر محاضرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('week_stars')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    celebrationScope === 'week_stars'
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-400 dark:border-indigo-400 text-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-400/40 font-black shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs">🏆 أبطال الأسبوع</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('group')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    celebrationScope === 'group'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-400 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-400/40 font-black shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs">👥 مجموعة مخصصة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('center')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    celebrationScope === 'center'
                      ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-400 dark:border-purple-400 text-purple-900 dark:text-purple-300 ring-2 ring-purple-400/40 font-black shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs">👑 أوائل المركز</span>
                </button>
              </div>

              {/* Filter & Group Selector Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-4 shadow-sm">
                {(celebrationScope === 'group' || celebrationScope === 'last_lecture') && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-black text-amber-800 dark:text-amber-300 mb-1">المجموعة التدريبية:</label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">اختر المجموعة المراد استعراض نجومها وتكريمهم</p>
                    </div>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 text-slate-900 dark:text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} {g.scheduleTime ? `(${g.scheduleTime})` : ''}
                        </option>
                      ))}
                      <option value="all">🌐 كل طلاب المركز</option>
                    </select>
                  </div>
                )}

                {/* Filter Mode Selector */}
                {selectedGroup !== 'all' && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">نطاق التتويج والتكريم:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterMode('present_only')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                          filterMode === 'present_only'
                            ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-400/50'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${filterMode === 'present_only' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-bold text-xs">الحاضرون في جلسة اليوم فقط 🟢</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">استبعاد الغائبين وتتويج المتفاعلين بالحصة الحالية</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFilterMode('group_all')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                          filterMode === 'group_all'
                            ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-400/50'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <Users className={`w-4 h-4 mt-0.5 shrink-0 ${filterMode === 'group_all' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-bold text-xs">جميع طلاب المجموعة المسجلين 👥</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">ترتيب تراكمي لكافة مقاعد المجموعة</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Title Input */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الجلسة / المحاضرة:</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold shadow-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="مثال: حفل ختام جلسة البرمجة والذكاء الاصطناعي"
                  />
                </div>
              </div>

              {/* Candidate Preview Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    المؤهلون لمنصة التتويج ({eligibleTrainees.length} متدرب):
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                    {selectedGroup !== 'all' ? `مجموعة: ${activeGroupObj?.name || selectedGroup}` : 'الترتيب العام'}
                  </span>
                </div>

                {top3.length === 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-rose-950/40 border border-amber-300 dark:border-rose-500/40 rounded-2xl text-amber-800 dark:text-rose-300 text-xs font-bold text-center">
                    ⚠️ لم يتم العثور على متدربين لديهم نقاط في هذا النطاق. امنح الطلاب بعض النجوم خلال الجلسة لتتويجهم!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {top3.map((st, index) => {
                      if (!st) return null;
                      const ranks = [
                        { label: 'المركز الأول 🥇', badge: 'bg-amber-500 text-slate-950', ring: 'ring-amber-400' },
                        { label: 'المركز الثاني 🥈', badge: 'bg-slate-300 text-slate-950', ring: 'ring-slate-300' },
                        { label: 'المركز الثالث 🥉', badge: 'bg-amber-700 text-white', ring: 'ring-amber-600' }
                      ];
                      const rank = ranks[index] || ranks[0];
                      const photo = getResolvedTraineePhoto(st);
                      const displayName = st.fullName || 'متدرب متميز';

                      return (
                        <div key={st.id || index} className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                          <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 ${rank.ring} bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative`}>
                            {photo ? (
                              <img src={photo} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-xs text-amber-600 dark:text-amber-400">{displayName.slice(0, 1)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${rank.badge} inline-block mb-1`}>
                              {rank.label}
                            </span>
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{displayName}</div>
                            <div className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold mt-0.5">
                              ⭐ {st.points || 0} نقطة
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Start Ceremony Button */}
              {top3.length > 0 && (
                <button
                  type="button"
                  onClick={startCeremony}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer border border-amber-300"
                >
                  <PartyPopper className="w-5 h-5 text-slate-950" />
                  <span>بدء حفل التتويج وإعلان الأبطال 🚀</span>
                </button>
              )}
            </div>
          )}

          {/* Active Podium Stages (Steps 1, 2, 3, 4) */}
          {ceremonyStep > 0 && (
            <div className="space-y-6">
              
              {/* Export & WhatsApp Quick Action Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    مشاركة وتوثيق منصة التتويج:
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Share on WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareToWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="مشاركة نتائج التتويج وبطاقة الأبطال على جروب الواتساب"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>مشاركة على الواتساب 📲</span>
                  </button>

                  {/* Download PNG Snapshot */}
                  <button
                    type="button"
                    disabled={isCapturing}
                    onClick={handleDownloadSnapshot}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="تنزيل منصة التتويج كصورة PNG عالية الجودة"
                  >
                    <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isCapturing ? 'جاري الالتقاط...' : 'لقطة شاشة (صورة) 📸'}</span>
                  </button>

                  {/* Copy Image to Clipboard */}
                  <button
                    type="button"
                    disabled={isCapturing}
                    onClick={handleCopySnapshot}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="نسخ الصورة للحافظة للصقها مباشرة في أي محادثة"
                  >
                    <Copy className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>نسخ كصورة 📋</span>
                  </button>
                </div>
              </div>

              {/* Podium Canvas for HTML2CANVAS Capture (Guaranteed 100% visible & clean when capturing) */}
              <div 
                ref={podiumCardRef} 
                id="podium-capture-card"
                className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 p-5 sm:p-7 rounded-3xl border-2 border-amber-300/80 dark:border-slate-800 shadow-md transition-colors relative"
              >
                {/* Header in Snapshot: Center Logo / Title */}
                <div className="text-center space-y-1.5 mb-6 pb-4 border-b border-amber-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400">
                    <Trophy className="w-5 h-5 fill-current" />
                    <span className="font-black text-sm uppercase tracking-wider">لوحة الشرف والتتويج الرسمية</span>
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    🌟 {sessionName}
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>👥 المجموعة: <strong className="text-amber-800 dark:text-amber-300">{activeGroupObj?.name || 'المركز العام'}</strong></span>
                    <span>•</span>
                    <span>📅 التاريخ: <strong className="font-mono text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('ar-EG')}</strong></span>
                  </div>
                </div>

                {/* Podium Stage Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end pt-6 pb-4">
                  
                  {/* 2nd Place (Silver) */}
                  <div className={`order-2 sm:order-1 transition-all duration-700 transform ${
                    (isCapturing || ceremonyStep === 0 || ceremonyStep >= 2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                  }`}>
                    {top3[1] && (
                      <div className="bg-gradient-to-b from-slate-50 via-sky-50 to-slate-200 dark:from-slate-200 dark:via-slate-300 dark:to-cyan-100 text-slate-950 border-2 border-slate-300 dark:border-white rounded-2xl p-4 text-center shadow-lg relative space-y-3">
                        <div className="absolute -top-6 right-1/2 translate-x-1/2 w-11 h-11 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-300 flex items-center justify-center font-black text-slate-800 dark:text-slate-100 shadow-md text-lg">
                          🥈
                        </div>

                        {/* Photo Avatar */}
                        <div className="pt-3 flex justify-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-sky-500 dark:border-cyan-600 shadow-md bg-white dark:bg-slate-900">
                            {top3[1]?.photoUrl || (top3[1] as any)?.photo ? (
                              <img 
                                src={top3[1]?.photoUrl || (top3[1] as any)?.photo} 
                                alt={top3[1]?.fullName || 'المتدرّب'} 
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 font-black text-sky-700 dark:text-cyan-400 text-lg">
                                {(top3[1]?.fullName || 'م').slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">المركز الثاني 🥈</span>
                          <h4 className="font-black text-xs sm:text-sm text-slate-950 mt-1 break-words font-serif leading-snug px-1 min-h-[32px] flex items-center justify-center">{top3[1]?.fullName || 'متدرب متميز'}</h4>
                          <p className="text-[10px] text-slate-600 font-mono font-bold mt-0.5">كود: {top3[1]?.code || '---'}</p>
                        </div>

                        {/* Points Pill */}
                        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-cyan-300 py-1.5 px-3 rounded-xl border border-slate-300 dark:border-cyan-400/40 shadow-sm">
                          <span className="font-black text-lg font-mono text-sky-700 dark:text-cyan-300">{top3[1]?.points || 0}</span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">نقطة تميز</span>
                        </div>

                        {/* Hide buttons when capturing screenshot */}
                        {!isCapturing && (
                          <button
                            type="button"
                            disabled={bonusAwardedMap[top3[1]?.id || top3[1]?.code || '2']}
                            onClick={() => handleGiveBonus(top3[1], 15, 'المركز الثاني')}
                            className={`w-full py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer no-capture ${
                              bonusAwardedMap[top3[1]?.id || top3[1]?.code || '2']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-sky-600 hover:bg-sky-700 text-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-cyan-300 dark:border dark:border-cyan-400/50 shadow active:scale-95'
                            }`}
                          >
                            {bonusAwardedMap[top3[1]?.id || top3[1]?.code || '2'] ? 'تم منح المكافأة ✨' : '+15 نقطة وسام 🥈'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 1st Place (Gold Champion - Center & Tallest) */}
                  <div className={`order-1 sm:order-2 transition-all duration-700 transform ${
                    (isCapturing || ceremonyStep === 0 || ceremonyStep >= 3) ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-16 pointer-events-none'
                  }`}>
                    {top3[0] && (
                      <div className="bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-300 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 text-slate-950 border-3 border-amber-400 dark:border-yellow-200 rounded-3xl p-5 text-center shadow-xl relative space-y-3 ring-4 ring-amber-400/30">
                        <div className="absolute -top-7 right-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-amber-500 text-white dark:bg-slate-950 dark:text-amber-400 border-2 border-white dark:border-amber-400 flex items-center justify-center font-black shadow-lg animate-bounce">
                          <Crown className="w-8 h-8 fill-current" />
                        </div>

                        {/* Photo Avatar */}
                        <div className="pt-4 flex justify-center">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-500 dark:border-slate-950 shadow-md bg-white dark:bg-slate-950">
                            {top3[0]?.photoUrl || (top3[0] as any)?.photo ? (
                              <img 
                                src={top3[0]?.photoUrl || (top3[0] as any)?.photo} 
                                alt={top3[0]?.fullName || 'البطل'} 
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-slate-950 font-black text-amber-700 dark:text-amber-400 text-2xl">
                                {(top3[0]?.fullName || 'ب').slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest block">🥇 بطل الجلسة والتاج</span>
                          <h3 className="font-black text-sm sm:text-base text-slate-950 mt-1 break-words font-serif leading-snug px-1 min-h-[36px] flex items-center justify-center">{top3[0]?.fullName || 'البطل الأول'}</h3>
                          <p className="text-[11px] text-amber-900 font-mono font-bold mt-0.5">كود: {top3[0]?.code || '---'}</p>
                        </div>

                        {/* Points Pill */}
                        <div className="bg-white dark:bg-slate-950 text-amber-950 dark:text-amber-400 py-2 px-4 rounded-2xl border border-amber-300 dark:border-amber-400/50 shadow-md">
                          <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">{top3[0]?.points || 0}</span>
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-bold">نقطة تميز أسطورية</span>
                        </div>

                        {/* Hide buttons when capturing screenshot */}
                        {!isCapturing && (
                          <button
                            type="button"
                            disabled={bonusAwardedMap[top3[0]?.id || top3[0]?.code || '1']}
                            onClick={() => handleGiveBonus(top3[0], 25, 'المركز الأول والبطل')}
                            className={`w-full py-2 rounded-xl text-xs font-black transition-all cursor-pointer no-capture ${
                              bonusAwardedMap[top3[0]?.id || top3[0]?.code || '1']
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md border border-amber-600/30 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-amber-300 dark:border-amber-400 active:scale-95'
                            }`}
                          >
                            {bonusAwardedMap[top3[0]?.id || top3[0]?.code || '1'] ? 'تم منح تاج التميز ⭐' : '+25 نقطة تاج البطل 👑'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3rd Place (Bronze) */}
                  <div className={`order-3 sm:order-3 transition-all duration-700 transform ${
                    (isCapturing || ceremonyStep === 0 || ceremonyStep >= 1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                  }`}>
                    {top3[2] && (
                      <div className="bg-gradient-to-b from-orange-100 via-amber-100 to-orange-200 dark:from-amber-700 dark:via-amber-800 dark:to-amber-900 text-slate-950 dark:text-white border-2 border-orange-300 dark:border-amber-500 rounded-2xl p-4 text-center shadow-lg relative space-y-3">
                        <div className="absolute -top-6 right-1/2 translate-x-1/2 w-11 h-11 rounded-full bg-orange-500 text-white dark:bg-slate-950 dark:text-amber-400 border-2 border-white dark:border-amber-500 flex items-center justify-center font-black shadow-md text-lg">
                          🥉
                        </div>

                        {/* Photo Avatar */}
                        <div className="pt-3 flex justify-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-orange-400 shadow-md bg-white dark:bg-slate-950">
                            {top3[2]?.photoUrl || (top3[2] as any)?.photo ? (
                              <img 
                                src={top3[2]?.photoUrl || (top3[2] as any)?.photo} 
                                alt={top3[2]?.fullName || 'المتدرّب'} 
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-slate-950 font-black text-orange-700 dark:text-amber-400 text-lg">
                                {(top3[2]?.fullName || 'م').slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black text-orange-800 dark:text-amber-300 uppercase tracking-wider block">المركز الثالث 🥉</span>
                          <h4 className="font-black text-xs sm:text-sm text-slate-950 dark:text-white mt-1 break-words font-serif leading-snug px-1 min-h-[32px] flex items-center justify-center">{top3[2]?.fullName || 'متدرب متميز'}</h4>
                          <p className="text-[10px] text-orange-800/80 dark:text-amber-200/80 font-mono font-bold mt-0.5">كود: {top3[2]?.code || '---'}</p>
                        </div>

                        {/* Points Pill */}
                        <div className="bg-white dark:bg-slate-950 text-orange-950 dark:text-amber-300 py-1.5 px-3 rounded-xl border border-orange-300 dark:border-amber-500/40 shadow-sm">
                          <span className="font-black text-lg font-mono text-orange-700 dark:text-amber-300">{top3[2]?.points || 0}</span>
                          <span className="text-[10px] text-orange-800 dark:text-slate-400 block font-bold">نقطة تميز</span>
                        </div>

                        {/* Hide buttons when capturing screenshot */}
                        {!isCapturing && (
                          <button
                            type="button"
                            disabled={bonusAwardedMap[top3[2]?.id || top3[2]?.code || '3']}
                            onClick={() => handleGiveBonus(top3[2], 10, 'المركز الثالث')}
                            className={`w-full py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer no-capture ${
                              bonusAwardedMap[top3[2]?.id || top3[2]?.code || '3']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white font-black shadow active:scale-95'
                            }`}
                          >
                            {bonusAwardedMap[top3[2]?.id || top3[2]?.code || '3'] ? 'تم منح المكافأة ✨' : '+10 نقاط وسام 🥉'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer in Snapshot: Watermark & Brand */}
                <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>🏢 مركز النجاح للتدريب والاستشارات</span>
                  <span>✨ منصة التتويج التفاعلية الذكية</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        {ceremonyStep > 0 && (
          <div className="shrink-0 p-4 border-t border-amber-200/80 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 dark:bg-slate-900/90 relative z-10">
            <button
              type="button"
              onClick={() => setCeremonyStep(0)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              تغيير المجموعة أو الفلترة ⚙️
            </button>

            <div className="flex items-center gap-2">
              {/* WhatsApp Share Button in Footer as well */}
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>مشاركة واتساب 📲</span>
              </button>

              {ceremonyStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer border border-amber-400"
                >
                  <span>{ceremonyStep === 1 ? 'إعلان المركز الثاني 🥈' : 'إعلان البطل الأول والتاج 👑'}</span>
                </button>
              )}

              {ceremonyStep >= 3 && (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>إنهاء الحفل بنجاح 🎉</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
