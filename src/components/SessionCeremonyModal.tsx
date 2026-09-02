import React, { useState, useEffect } from 'react';
import { Trainee, Group, AttendanceRecord } from '../types';
import { api } from '../services/api';
import { Trophy, Award, Star, Sparkles, X, Volume2, Crown, PartyPopper, Users, CheckCircle2, UserCheck, Shield, ChevronDown } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SessionCeremonyModalProps {
  trainees: Trainee[];
  groups: Group[];
  initialGroupId?: string;
  initialAttendeesOnly?: boolean;
  onClose: () => void;
  onAwardBonus: (traineeId: string, points: number, reason: string) => void;
}

export const SessionCeremonyModal: React.FC<SessionCeremonyModalProps> = ({
  trainees,
  groups,
  initialGroupId,
  initialAttendeesOnly = false,
  onClose,
  onAwardBonus,
}) => {
  // Celebration scope: 'last_lecture' | 'week_stars' | 'group' | 'center'
  const [celebrationScope, setCelebrationScope] = useState<'last_lecture' | 'week_stars' | 'group' | 'center'>('last_lecture');

  // Determine default selected group
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    if (initialGroupId && initialGroupId !== 'all') return initialGroupId;
    if (groups && groups.length > 0) {
      // Find group matching current time or return first group
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const matched = groups.find(g => {
        if (!g.scheduleTime) return false;
        const [h, m] = g.scheduleTime.split(':').map(Number);
        if (isNaN(h)) return false;
        const groupStart = h * 60 + (m || 0);
        return Math.abs(currentMinutes - groupStart) <= 120;
      });
      return matched?.id || groups[0].id;
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

  // Fetch attendance records (recent and today) and active lab devices
  useEffect(() => {
    let isMounted = true;
    const fetchSessionData = async () => {
      try {
        setIsLoadingAttendance(true);
        const todayStr = new Date().toISOString().split('T')[0];
        const [attList, devList] = await Promise.all([
          api.getAttendance({}).catch(() => [] as AttendanceRecord[]),
          api.getDevices().catch(() => [])
        ]);

        if (!isMounted) return;
        setAttendanceRecords(attList || []);

        const activeIds: string[] = [];
        (devList || []).forEach((d: any) => {
          if (d.currentTraineeId) activeIds.push(d.currentTraineeId);
          if (d.currentTraineeCode) activeIds.push(d.currentTraineeCode);
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
      audioService.stopAll();
    };
  }, []);

  // Update session name when scope or group changes
  useEffect(() => {
    if (celebrationScope === 'last_lecture') {
      const activeGrp = groups.find(g => g.id === selectedGroup);
      setSessionName(activeGrp ? `حفل نجوم آخر محاضرة (${activeGrp.name})` : 'حفل نجوم آخر محاضرة تدريبية بالمعمل 🌟');
    } else if (celebrationScope === 'week_stars') {
      setSessionName('🏆 حفل تتويج أبطال ونجوم الأسبوع الحالي');
    } else if (celebrationScope === 'center') {
      setSessionName('👑 حفل لوحة شرف المركز العام للتدريب');
    } else {
      const grp = groups.find(g => g.id === selectedGroup);
      setSessionName(grp ? `حفل ختام جلسة ${grp.name}` : 'حفل ختام المحاضرة التدريبية');
    }
  }, [celebrationScope, selectedGroup, groups]);

  // Compute eligible trainees based on celebrationScope
  const eligibleTrainees = React.useMemo(() => {
    let list: Trainee[] = [...trainees];

    if (celebrationScope === 'center') {
      // All center students sorted by total points
      return list.sort((a, b) => ((b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0)));
    }

    if (celebrationScope === 'week_stars') {
      // Sort students by points, ensuring only those with points > 0 or top ranks
      return list.sort((a, b) => ((b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0)));
    }

    if (celebrationScope === 'last_lecture' || celebrationScope === 'group') {
      const targetGroupId = selectedGroup !== 'all' ? selectedGroup : groups[0]?.id;
      
      // Filter by group if specified
      if (targetGroupId) {
        const groupMembers = list.filter(t => t.groupId === targetGroupId || (t as any).group_id === targetGroupId);
        if (groupMembers.length > 0) {
          list = groupMembers;
        }
      }

      // If present only mode, check attendance or lab devices
      if (filterMode === 'present_only') {
        const presentList = list.filter(t => {
          const hasAtt = attendanceRecords.some(a => 
            (a.traineeId === t.id || a.traineeId === t.code) && 
            (a.status === 'present' || a.status === 'late')
          );
          const isAtDevice = activeDeviceTraineeIds.includes(t.id) || (t.code && activeDeviceTraineeIds.includes(t.code));
          return hasAtt || isAtDevice;
        });

        // Fallback to all group members if no live attendance taken right now
        if (presentList.length > 0) {
          list = presentList;
        }
      }

      return list.sort((a, b) => ((b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0)));
    }

    return list.sort((a, b) => ((b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0)));
  }, [trainees, celebrationScope, selectedGroup, filterMode, attendanceRecords, activeDeviceTraineeIds, groups]);

  const top3 = eligibleTrainees.slice(0, 3);

  const handleCloseModal = () => {
    audioService.stopAll();
    onClose();
  };

  const playChime = (freqs: number[]) => {
    if (isMuted) return;
    audioService.playChime(freqs);
  };

  const speakText = async (text: string) => {
    if (isMuted) return;
    await audioService.speakText(text);
  };

  const startCeremony = async () => {
    if (top3.length === 0) return;
    setCeremonyStep(1); // Reveal 3rd
    playChime([440, 554.37, 659.25]);
    if (top3[2]) {
      speakText(`يا شباب، المركز الثالث في جلسة اليوم يذهب للبطل الرائع، ${top3[2].fullName}! مجهود ممتاز ومشاركة مشرفة، تحية كبيرة للبطل!`);
    }

    // Force instant broadcast to all students
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
      setCeremonyStep(2); // Reveal 2nd
      playChime([523.25, 659.25, 783.99]);
      if (top3[1]) {
        speakText(`ودلوقتي.. المركز الثاني في جلسة اليوم ونجم التميز.. البطل ${top3[1].fullName}! أداء استثنائي وتألق كبير، ألف مبروك!`);
      }
      try { await api.broadcastCeremony({ step: 2, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 2) {
      setCeremonyStep(3); // Reveal 1st (Champion)
      playChime([523.25, 659.25, 783.99, 1046.5]);
      if (top3[0]) {
        speakText(`والآن لحظة التتويج الكبرى.. بطل الجلسة الأول والمركز الأول والمتوج بتاج التميز هووو.. البطل الأسطوري ${top3[0].fullName}! مبروك يا بطل، أنت نجم الجلسة اليوم!`);
      }
      try { await api.broadcastCeremony({ step: 3, top3, sessionName }); } catch (e) {}
    } else if (ceremonyStep === 3) {
      setCeremonyStep(4); // Finished ceremony
      try { 
        await api.broadcastCeremony({ step: 4, top3, sessionName, isFinished: true });
        await api.forceCeremony(false);
      } catch (e) {}
    }
  };

  const handleGiveBonus = async (trainee: Trainee, points: number, rankTitle: string) => {
    if (bonusAwardedMap[trainee.id]) return;
    try {
      onAwardBonus(trainee.id, points, `مكافأة منصة التتويج (${rankTitle}) في ${sessionName}`);
      await api.addPoints({
        traineeId: trainee.id || trainee.code,
        points,
        reason: `مكافأة منصة التتويج (${rankTitle}) في ${sessionName}`
      });
      setBonusAwardedMap(prev => ({ ...prev, [trainee.id]: true }));
      playChime([600, 800, 1000]);
    } catch (e) {
      console.warn('Failed to add bonus points:', e);
    }
  };

  const activeGroupObj = groups.find(g => g.id === selectedGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto" dir="rtl">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-500/50 rounded-3xl shadow-2xl max-w-4xl w-full p-6 text-slate-100 relative overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
                منصة تتويج نجوم الجلسة الأبطال 🏆
              </h2>
              <p className="text-xs text-slate-300">
                إعلان أوائل المجموعة الحاضرين في الجلسة تصاعدياً مع نطق الأسماء والتأثيرات التفاعلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                isMuted ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
              title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ceremony Setup / Configuration (Step 0) */}
        <div className="py-6 space-y-6 relative z-10">
          {ceremonyStep === 0 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              
              {/* Scope Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setCelebrationScope('last_lecture')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    celebrationScope === 'last_lecture'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-black shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">🌟 نجوم آخر محاضرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('week_stars')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    celebrationScope === 'week_stars'
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-2 ring-indigo-400/40 font-black shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs">🏆 أبطال الأسبوع</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('group')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    celebrationScope === 'group'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40 font-black shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">👥 مجموعة مخصصة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCelebrationScope('center')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    celebrationScope === 'center'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-2 ring-purple-400/40 font-black shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">👑 أوائل المركز</span>
                </button>
              </div>

              {/* Filter & Group Selector Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-4 shadow-xl">
                {(celebrationScope === 'group' || celebrationScope === 'last_lecture') && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1">المجموعة التدريبية:</label>
                      <p className="text-[11px] text-slate-400">اختر المجموعة المراد استعراض نجومها وتكريمهم</p>
                    </div>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="bg-slate-900 border border-amber-500/40 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
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

                {/* Filter Mode Selector (Present Attendees vs All Group vs Center) */}
                {selectedGroup !== 'all' && (
                  <div className="pt-3 border-t border-slate-700/60">
                    <span className="block text-xs font-bold text-slate-300 mb-2">نطاق التتويج والتكريم:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterMode('present_only')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                          filterMode === 'present_only'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${filterMode === 'present_only' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="font-bold text-xs">الحاضرون في جلسة اليوم فقط 🟢</div>
                          <div className="text-[10px] opacity-80">استبعاد الغائبين وتتويج المتفاعلين بالحصة الحالية</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFilterMode('group_all')}
                        className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                          filterMode === 'group_all'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Users className={`w-4 h-4 mt-0.5 shrink-0 ${filterMode === 'group_all' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="font-bold text-xs">جميع طلاب المجموعة المسجلين 👥</div>
                          <div className="text-[10px] opacity-80">ترتيب تراكمي لكافة مقاعد المجموعة</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Title Input */}
                <div className="pt-3 border-t border-slate-700/60">
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الجلسة / المحاضرة:</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                    placeholder="مثال: حفل ختام جلسة البرمجة والذكاء الاصطناعي"
                  />
                </div>
              </div>

              {/* Candidate Preview Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    المؤهلون لمنصة التتويج ({eligibleTrainees.length} متدرب):
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">
                    {selectedGroup !== 'all' ? `مجموعة: ${activeGroupObj?.name || selectedGroup}` : 'الترتيب العام'}
                  </span>
                </div>

                {top3.length === 0 ? (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-bold text-center">
                    ⚠️ لم يتم العثور على متدربين لديهم نقاط في هذا النطاق. امنح الطلاب بعض النقاط خلال الجلسة لتتويجهم!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {top3.map((st, index) => {
                      const ranks = [
                        { label: 'المركز الأول 🥇', badge: 'bg-amber-500 text-slate-950', ring: 'ring-amber-400' },
                        { label: 'المركز الثاني 🥈', badge: 'bg-slate-300 text-slate-950', ring: 'ring-slate-300' },
                        { label: 'المركز الثالث 🥉', badge: 'bg-amber-700 text-white', ring: 'ring-amber-600' }
                      ];
                      const rank = ranks[index] || ranks[0];
                      const photo = st.photoUrl || (st as any).photo;

                      return (
                        <div key={st.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 ${rank.ring} bg-slate-900 flex items-center justify-center relative`}>
                            {photo ? (
                              <img src={photo} alt={st.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-xs text-amber-400">{st.fullName.slice(0, 1)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${rank.badge} inline-block mb-1`}>
                              {rank.label}
                            </span>
                            <div className="font-bold text-xs text-white truncate">{st.fullName}</div>
                            <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
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
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  <PartyPopper className="w-5 h-5" />
                  <span>بدء حفل التتويج وإعلان الأبطال على شاشات المعمل 🚀</span>
                </button>
              )}
            </div>
          )}

          {/* Active Podium Stages (Steps 1, 2, 3, 4) */}
          {ceremonyStep > 0 && (
            <div className="space-y-6">
              {/* Session Title Badge */}
              <div className="text-center space-y-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs shadow-inner">
                  🌟 {sessionName}
                </span>
                {selectedGroup !== 'all' && (
                  <p className="text-[11px] text-slate-400 font-bold">
                    تكريم أوائل {activeGroupObj?.name || 'المجموعة'} {filterMode === 'present_only' ? '(الحاضرون فقط)' : ''}
                  </p>
                )}
              </div>

              {/* Podium Stage */}
              <div className="grid grid-cols-3 gap-3 items-end pt-8 min-h-[340px]">
                
                {/* 2nd Place (Silver) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  {top3[1] && (
                    <div className="bg-gradient-to-b from-slate-700/90 to-slate-800 border-2 border-slate-400/80 rounded-2xl p-4 text-center shadow-xl relative space-y-3">
                      <div className="absolute -top-6 right-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-slate-300 border-2 border-slate-100 flex items-center justify-center font-black text-slate-950 shadow-md text-base">
                        🥈
                      </div>

                      {/* Photo Avatar */}
                      <div className="pt-2 flex justify-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900">
                          {top3[1].photoUrl || (top3[1] as any).photo ? (
                            <img src={top3[1].photoUrl || (top3[1] as any).photo} alt={top3[1].fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-700 font-black text-white text-base">
                              {top3[1].fullName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">المركز الثاني</span>
                        <h4 className="font-black text-xs sm:text-sm text-slate-100 mt-1 truncate">{top3[1].fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">كود: {top3[1].code}</p>
                      </div>

                      <div className="bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-700">
                        <span className="font-black text-slate-200 text-sm font-mono">{top3[1].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block">نقطة تميز</span>
                      </div>

                      <button
                        type="button"
                        disabled={bonusAwardedMap[top3[1].id]}
                        onClick={() => handleGiveBonus(top3[1], 15, 'المركز الثاني')}
                        className={`w-full py-1 rounded-lg text-[11px] font-bold transition-all ${
                          bonusAwardedMap[top3[1].id]
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {bonusAwardedMap[top3[1].id] ? 'تم منح المكافأة ✨' : '+15 نقطة وسام 🥈'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 1st Place (Gold Champion - Center & Tallest) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 3 ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-16'}`}>
                  {top3[0] && (
                    <div className="bg-gradient-to-b from-amber-500/30 via-slate-900 to-amber-950/60 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl relative space-y-3 ring-4 ring-amber-500/20">
                      <div className="absolute -top-8 right-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white flex items-center justify-center font-black text-slate-950 shadow-xl animate-bounce">
                        <Crown className="w-8 h-8 text-slate-950" />
                      </div>

                      {/* Photo Avatar */}
                      <div className="pt-4 flex justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-slate-950">
                          {top3[0].photoUrl || (top3[0] as any).photo ? (
                            <img src={top3[0].photoUrl || (top3[0] as any).photo} alt={top3[0].fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 font-black text-slate-950 text-xl">
                              {top3[0].fullName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">🥇 بطل الجلسة والتاج</span>
                        <h3 className="font-black text-sm sm:text-base text-white mt-1 truncate">{top3[0].fullName}</h3>
                        <p className="text-[11px] text-amber-200/80 font-mono mt-0.5">كود: {top3[0].code}</p>
                      </div>

                      <div className="bg-slate-950/80 py-2 px-4 rounded-xl border border-amber-500/50">
                        <span className="text-2xl font-black text-amber-400 font-mono">{top3[0].points || 0}</span>
                        <span className="text-[11px] text-amber-300 block font-bold">نقطة تميز أسطورية</span>
                      </div>

                      <button
                        type="button"
                        disabled={bonusAwardedMap[top3[0].id]}
                        onClick={() => handleGiveBonus(top3[0], 25, 'المركز الأول والبطل')}
                        className={`w-full py-1.5 rounded-lg text-xs font-black transition-all ${
                          bonusAwardedMap[top3[0].id]
                            ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        }`}
                      >
                        {bonusAwardedMap[top3[0].id] ? 'تم منح تاج التميز ⭐' : '+25 نقطة تاج البطل 👑'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 3rd Place (Bronze) */}
                <div className={`transition-all duration-700 transform ${ceremonyStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  {top3[2] && (
                    <div className="bg-gradient-to-b from-amber-900/40 to-slate-900 border-2 border-amber-700/80 rounded-2xl p-4 text-center shadow-xl relative space-y-3">
                      <div className="absolute -top-6 right-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-amber-700 border-2 border-amber-300 flex items-center justify-center font-black text-white shadow-md text-base">
                        🥉
                      </div>

                      {/* Photo Avatar */}
                      <div className="pt-2 flex justify-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600 shadow-md bg-slate-900">
                          {top3[2].photoUrl || (top3[2] as any).photo ? (
                            <img src={top3[2].photoUrl || (top3[2] as any).photo} alt={top3[2].fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-900 font-black text-amber-200 text-base">
                              {top3[2].fullName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">المركز الثالث</span>
                        <h4 className="font-black text-xs sm:text-sm text-slate-100 mt-1 truncate">{top3[2].fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">كود: {top3[2].code}</p>
                      </div>

                      <div className="bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-700">
                        <span className="font-black text-amber-600 text-sm font-mono">{top3[2].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block">نقطة تميز</span>
                      </div>

                      <button
                        type="button"
                        disabled={bonusAwardedMap[top3[2].id]}
                        onClick={() => handleGiveBonus(top3[2], 10, 'المركز الثالث')}
                        className={`w-full py-1 rounded-lg text-[11px] font-bold transition-all ${
                          bonusAwardedMap[top3[2].id]
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {bonusAwardedMap[top3[2].id] ? 'تم منح المكافأة ✨' : '+10 نقاط وسام 🥉'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ceremony Controls / Next Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCeremonyStep(0)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  تغيير المجموعة أو الفلترة ⚙️
                </button>

                {ceremonyStep < 3 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <span>{ceremonyStep === 1 ? 'إعلان المركز الثاني 🥈' : 'إعلان البطل الأول والتاج 👑'}</span>
                  </button>
                )}

                {ceremonyStep >= 3 && (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <span>إنهاء الحفل بنجاح 🎉</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
