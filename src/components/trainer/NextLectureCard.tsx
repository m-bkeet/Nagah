import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  Video,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Group, Course, Trainer, Trainee } from '../../types';
import { sessionEventsService } from '../../services/sessionEventsService';
import { SessionCelebrationOverlay } from '../SessionCelebrationOverlay';
import { cloudDb } from '../../services/cloudDatabase';
import { audioService } from '../../services/audioService';

interface NextLectureCardProps {
  trainer: Trainer;
  groups: Group[];
  courses: Course[];
  onStartLive: (group: Group) => void;
}

export const NextLectureCard: React.FC<NextLectureCardProps> = ({
  trainer,
  groups,
  courses,
  onStartLive
}) => {
  const [nextGroup, setNextGroup] = useState<Group | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>('');
  const [isHappeningNow, setIsHappeningNow] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [starWinner, setStarWinner] = useState<{ name: string; points: number } | undefined>(undefined);

  useEffect(() => {
    if (!groups || groups.length === 0) {
      setNextGroup(null);
      return;
    }

    const daysMap: Record<string, number> = {
      'الأحد': 0, 'الاحد': 0,
      'الإثنين': 1, 'الاثنين': 1,
      'الثلاثاء': 2,
      'الأربعاء': 3, 'الاربعاء': 3,
      'الخميس': 4,
      'الجمعة': 5, 'الجمعه': 5,
      'السبت': 6
    };

    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    let closestGroup: Group | null = null;
    let minDiffMinutes = Infinity;
    let happening = false;

    groups.forEach(g => {
      const gDays = Array.isArray(g.days) ? g.days : (Array.isArray(g.scheduleDays) ? g.scheduleDays : ['السبت']);
      let startH = 16;
      let startM = 0;

      if (g.startTime) {
        const [h, m] = g.startTime.split(':').map(Number);
        startH = h || 16;
        startM = m || 0;
      } else if (g.timeSlot) {
        const match = g.timeSlot.match(/(\d+):?(\d*)/);
        if (match) {
          startH = Number(match[1]) || 16;
          if (g.timeSlot.includes('م') && startH < 12) startH += 12;
        }
      }

      const slotStartMinutes = startH * 60 + startM;
      const slotEndMinutes = slotStartMinutes + 120;

      gDays.forEach(dayName => {
        const targetDay = daysMap[dayName.trim()];
        if (targetDay !== undefined) {
          let dayDiff = (targetDay - currentDay + 7) % 7;
          let diffMinutes = dayDiff * 24 * 60 + (slotStartMinutes - currentTimeVal);

          if (dayDiff === 0 && currentTimeVal >= slotStartMinutes && currentTimeVal <= slotEndMinutes) {
            happening = true;
            closestGroup = g;
            minDiffMinutes = 0;
          } else {
            if (diffMinutes < 0) {
              diffMinutes += 7 * 24 * 60;
            }
            if (diffMinutes < minDiffMinutes) {
              minDiffMinutes = diffMinutes;
              closestGroup = g;
            }
          }
        }
      });
    });

    const activeSelectedGroup = closestGroup || groups[0];
    setNextGroup(activeSelectedGroup);
    setIsHappeningNow(happening);

    if (happening) {
      setCountdownStr('المحاضرة جارية الآن بالمعمل!');
    } else if (minDiffMinutes < Infinity) {
      const hours = Math.floor(minDiffMinutes / 60);
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      const mins = minDiffMinutes % 60;

      if (days > 0) {
        setCountdownStr(`متبقي ${days} يوم و ${remHours} ساعة`);
      } else if (hours > 0) {
        setCountdownStr(`متبقي ${hours} ساعة و ${mins} دقيقة`);
      } else {
        setCountdownStr(`متبقي ${mins} دقيقة`);
      }
    } else {
      setCountdownStr('وفقاً للجدول الأسبوعي');
    }
  }, [groups]);

  // Load group top student for star winner announcement
  const loadStarWinner = async (groupId: string) => {
    try {
      const trainees = await cloudDb.getAllTrainees();
      const groupTrainees = trainees.filter(t => t.groupId === groupId);
      if (groupTrainees.length > 0) {
        groupTrainees.sort((a, b) => (b.points || b.totalPoints || 0) - (a.points || a.totalPoints || 0));
        const top = groupTrainees[0];
        setStarWinner({
          name: top.fullName || (top as any).name || 'طالب متميز',
          points: top.points || top.totalPoints || 0
        });
      }
    } catch (e) {
      console.warn('[NextLectureCard] Failed to load star winner:', e);
    }
  };

  const handleOpenConfirm = () => {
    if (!nextGroup) return;
    audioService.stopAll();
    loadStarWinner(nextGroup.id);
    setShowConfirmModal(true);
  };

  const handleConfirmEndSession = async () => {
    if (!nextGroup) return;
    audioService.stopAll();
    setIsEndingSession(true);
    setShowConfirmModal(false);

    const sessionId = `session_${nextGroup.id}_${new Date().toISOString().split('T')[0]}`;
    const course = courses.find(c => c.id === nextGroup.courseId);

    // Dispatch Firestore Session Celebration Event
    await sessionEventsService.dispatchSessionEvent({
      sessionId,
      groupId: nextGroup.id,
      groupName: nextGroup.name,
      courseId: nextGroup.courseId,
      courseName: course?.name || 'الدورة التدريبية',
      trainerId: trainer.id,
      trainerName: trainer.name,
      eventType: 'SESSION_CELEBRATION',
      starWinnerName: starWinner?.name,
      starWinnerPoints: starWinner?.points
    });

    setIsEndingSession(false);
    setShowCelebrationOverlay(true);
  };

  if (!nextGroup) return null;

  const course = courses.find(c => c.id === nextGroup.courseId);
  const locationName = nextGroup.hallName || nextGroup.roomName || 'معمل الحاسب الآلي 1 (Lab A)';
  const daysStr = (nextGroup.days || nextGroup.scheduleDays || ['السبت', 'الثلاثاء']).join(' - ');
  const timeStr = nextGroup.timeSlot || `${nextGroup.startTime || '04:00 م'} - ${nextGroup.endTime || '06:00 م'}`;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-amber-600 via-amber-700 to-slate-900 p-5 md:p-6 text-white shadow-xl border border-amber-500/30">
        {/* Background ambient pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                {isHappeningNow ? '🔴 جارية الآن' : 'موعد المحاضرة القادمة'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/60 backdrop-blur-md text-amber-200 border border-amber-400/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {countdownStr}
              </span>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                {nextGroup.name}
                {nextGroup.grade && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-normal">
                    {nextGroup.grade}
                  </span>
                )}
              </h3>
              {course && (
                <p className="text-sm text-amber-100 font-medium mt-0.5 flex items-center gap-1.5">
                  <span>{course.name}</span>
                  <span className="text-amber-300/60">•</span>
                  <span className="text-xs text-amber-200">{course.code}</span>
                </p>
              )}
            </div>

            {/* Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/40 px-3 py-2 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">القاعة / المعمل</div>
                  <div className="font-bold text-white truncate">{locationName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/40 px-3 py-2 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">الأيام والمواعيد</div>
                  <div className="font-bold text-white truncate">{daysStr} ({timeStr})</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/40 px-3 py-2 rounded-xl border border-white/10">
                <Users className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">السعة المقررة</div>
                  <div className="font-bold text-white">حد أقصى {nextGroup.maxCapacity || 25} طالب</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={() => onStartLive(nextGroup)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-amber-500/40 font-black text-sm shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95"
            >
              <Video className="w-4 h-4 text-red-400 animate-pulse" />
              <span>بدء بث المحاضرة لايف (Zoom)</span>
            </button>
            
            <button
              id="btn-end-session-celebrate"
              onClick={handleOpenConfirm}
              disabled={isEndingSession}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 ${
                isEndingSession 
                  ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              <PartyPopper className={`w-4 h-4 ${isEndingSession ? 'animate-bounce' : ''}`} />
              <span>{isEndingSession ? 'جاري إنهاء الحصة...' : 'إنهاء الحصة والاحتفال 🎉'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
              <PartyPopper className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-black text-white">
              تأكيد إنهاء المحاضرة والاحتفال بالطلاب 🎉
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من إنهاء الحصة الآن؟ سيتم إرسال إشعار الاحتفال والتصفيق وإطلاق الألعاب النارية فوراً لجميع الطلاب وأولياء الأمور المرتبطين بهذه المجموعة.
            </p>

            {starWinner && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>سيتم إعلان البطل: {starWinner.name} (نجم الجلسة)</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmEndSession}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
              >
                نعم، إنهاء الحصة والاحتفال 🚀
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Celebration Overlay */}
      <SessionCelebrationOverlay
        isOpen={showCelebrationOverlay}
        onClose={() => {
          audioService.stopAll();
          setShowCelebrationOverlay(false);
        }}
        sessionTitle={`محاضرة ${nextGroup.name}`}
        groupName={nextGroup.name}
        courseName={course?.name || 'الدورة التدريبية'}
        starWinnerName={starWinner?.name}
        starWinnerPoints={starWinner?.points}
      />
    </>
  );
};
