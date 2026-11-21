import React, { useState, useEffect, useCallback } from 'react';
import { Award, CheckCircle2, Clock, RefreshCw, Sparkles, Star, MessageCircleHeart } from 'lucide-react';

export interface TraineeSessionSummary {
  traineeId: string;
  totalPoints: number;
  latestAttendance: {
    date: string;
    status: string;
    notes?: string;
    groupId?: string;
  } | null;
  latestSessionGrade: {
    date: string;
    score: number;
    maxScore: number;
    note?: string;
    updatedAt?: string;
  } | null;
  recentPointAwards: Array<{
    id: string;
    points: number;
    reason: string;
    date: string;
    addedByUserName?: string;
  }>;
  updatedAt?: string;
}

interface LatestSessionSummaryCardProps {
  traineeId: string;
  initialSummary?: TraineeSessionSummary | null;
  portalRole: 'student' | 'parent';
  studentName?: string;
}

function getPortalAuthToken(portalRole: 'student' | 'parent'): string | null {
  if (typeof window === 'undefined') return null;
  const portalKey = portalRole === 'student' ? 'nagah_student_portal_token' : 'nagah_parent_portal_token';
  return (
    sessionStorage.getItem(portalKey) ||
    localStorage.getItem(portalKey) ||
    sessionStorage.getItem('success_v7_token') ||
    localStorage.getItem('success_v7_token') ||
    null
  );
}

const ATTENDANCE_LABELS: Record<string, { label: string; color: string }> = {
  present: { label: 'حاضر ✅', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' },
  حاضر: { label: 'حاضر ✅', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' },
  late: { label: 'متأخر ⏰', color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  absent: { label: 'غائب ❌', color: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' },
  excused: { label: 'بعذر 📝', color: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300' }
};

export const LatestSessionSummaryCard: React.FC<LatestSessionSummaryCardProps> = ({
  traineeId,
  initialSummary,
  portalRole,
  studentName
}) => {
  const [summary, setSummary] = useState<TraineeSessionSummary | null>(initialSummary || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setSummary(initialSummary || null);
  }, [traineeId, initialSummary]);

  const handleRefresh = useCallback(async () => {
    if (!traineeId) return;
    const token = getPortalAuthToken(portalRole);
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/portal/session-summary/${encodeURIComponent(traineeId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.summary) {
          setSummary(json.summary);
        }
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  }, [traineeId, portalRole]);

  const att = summary?.latestAttendance;
  const grade = summary?.latestSessionGrade;
  const awards = summary?.recentPointAwards || [];
  const attBadge = att ? (ATTENDANCE_LABELS[att.status] || ATTENDANCE_LABELS.present) : null;

  return (
    <section className="rounded-3xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-500/25 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-l from-amber-50 via-white to-indigo-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-indigo-950/30 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              ملخص آخر حصة ورسائل التشجيع
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {studentName ? `تحديث مباشر لأداء ${studentName} في الحصص التفاعلية` : 'تحديث مباشر للحضور، درجة الحصة، ونقاط التميز'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Top Row: Latest Attendance + Latest Session Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>آخر حضور مسجل</span>
              </div>
              {att ? (
                <>
                  <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {att.date || 'اليوم'}
                  </p>
                  {att.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{att.notes}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">لم يُسجل حضور بعد</p>
              )}
            </div>
            {attBadge && (
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 ${attBadge.color}`}>
                {attBadge.label}
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>تقييم آخر حصة</span>
              </div>
              {grade ? (
                <>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {grade.score} <span className="text-xs text-slate-400">/ {grade.maxScore}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {grade.note ? grade.note : `بتاريخ ${grade.date}`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">بانتظار رصد درجة الحصة القادمة</p>
              )}
            </div>
            {grade && (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 shrink-0 font-mono">
                {Math.round((grade.score / Math.max(1, grade.maxScore)) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Recent Point Awards & Encouraging Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageCircleHeart className="w-4 h-4 text-amber-500" />
              <span>أحدث نقاط التميز ورسائل التشجيع من المحاضر</span>
            </span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
              الإجمالي: {summary?.totalPoints ?? 0} ⭐
            </span>
          </div>

          {awards.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              ستظهر هنا تلقائياً كل نقاط التشجيع والملاحظات الإيجابية فور منحها داخل الحصة التفاعلية.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {awards.slice(0, 6).map((item) => {
                const isPositive = item.points >= 0;
                const formattedDate = item.date
                  ? new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                  : '';
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.reason}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formattedDate || 'حديثاً'}</span>
                        {item.addedByUserName && <span>• {item.addedByUserName}</span>}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0 flex items-center gap-1 ${
                        isPositive
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{isPositive ? `+${item.points}` : item.points}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
