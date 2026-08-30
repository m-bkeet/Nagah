import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, RefreshCw, Printer, Share2, 
  CheckCircle2, AlertTriangle, Users, BookOpen, UserCheck, Building, Bell, BarChart2, Award
} from 'lucide-react';
import { LabScheduleSlot, Branch, Group, Trainer } from '../types';
import { formatTimeAMPM, timeToMinutes } from '../utils/timeFormat';

export const LabScheduleView: React.FC = () => {
  const [schedules, setSchedules] = useState<LabScheduleSlot[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSyncTime?: string; syncStatus?: string }>({});
  const [viewMode, setViewMode] = useState<'cards' | 'timetable'>('cards');

  // New slot form state
  const [newGroupname, setNewGroupname] = useState('');
  const [newCourseName, setNewCourseName] = useState('دبلومة الحاسب الآلي الشاملة');
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newRoomName, setNewRoomName] = useState('معمل النجاح');
  const [newDay, setNewDay] = useState('السبت');
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const url = selectedBranchId && selectedBranchId !== 'all' 
        ? `/api/lab-schedules?branchId=${selectedBranchId}` 
        : '/api/lab-schedules';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setSchedules(data);

      const brRes = await fetch('/api/branches');
      const brData = await brRes.json();
      if (Array.isArray(brData)) setBranches(brData);

      const grpRes = await fetch('/api/groups');
      const grpData = await grpRes.json();
      if (Array.isArray(grpData)) setGroups(grpData);

      const trRes = await fetch('/api/trainers');
      const trData = await trRes.json();
      if (Array.isArray(trData)) setTrainers(trData);

      const crsRes = await fetch('/api/courses');
      const crsData = await crsRes.json();
      if (Array.isArray(crsData)) setCourses(crsData);

      const syncRes = await fetch('/api/system/google-drive-sync');
      const syncData = await syncRes.json();
      setSyncStatus(syncData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedBranchId]);

  const handleAutoGenerate = async () => {
    try {
      const res = await fetch('/api/lab-schedules/auto-generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchSchedules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lab-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || 'branch-1'),
          groupName: newGroupname || 'مجموعة جديدة',
          courseName: newCourseName,
          trainerName: newTrainerName || 'مدرب معتمد',
          roomName: newRoomName,
          dayOfWeek: newDay,
          startTime: newStartTime,
          endTime: newEndTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewGroupname('');
        fetchSchedules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const normalizeDay = (day: string) => {
    if (!day) return '';
    const trimmed = day.trim();
    if (trimmed === 'الاثنين' || trimmed === 'الإثنين') return 'الإثنين';
    if (trimmed === 'الاحد' || trimmed === 'الأحد') return 'الأحد';
    if (trimmed === 'الاربعاء' || trimmed === 'الأربعاء') return 'الأربعاء';
    return trimmed;
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد نهائياً من الجدول الزمني؟')) return;
    try {
      const res = await fetch(`/api/lab-schedules/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      } else {
        alert(data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (e) {
      console.error(e);
      alert('فشل الاتصال بالسيرفر لحذف الموعد');
    }
  };

  const handleCloudSync = async () => {
    try {
      const res = await fetch('/api/system/google-drive-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchSchedules();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">الجدول الزمني والخريطة الزمنية للمعامل والفرع</h1>
            <p className="text-xs text-slate-400 mt-1">
              نظام المحاضرات (ساعة واحدة لكل محاضرة، يومان أسبوعياً) مع إمكانية التوليد التلقائي والطباعة ومزامنة Google Drive.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchSchedules}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs shadow-lg transition-all"
            title="تحديث ومزامنة الجدول الزمني"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
            title="توليد واستعادة المجموعات الافتراضية"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استعادة وتوليد المجموعات</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موعد جديد</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة الجدول</span>
          </button>

          <button
            onClick={handleCloudSync}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all"
            title="مزامنة فورية مع Google Drive"
          >
            <CloudSyncIcon className="w-4 h-4 text-cyan-400" />
            <span>نسخ Google Drive (محدث)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Building className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">تصفية حسب الفرع:</span>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">جميع فروع مركز النجاح</option>
              {(branches || []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>تقرير تحليل المعامل والأوقات الشاغرة</span>
          </button>
          <button
            onClick={() => setIsPosterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>بوستر النشر الاحترافي (فيس بوك وعرض)</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              عرض البطاقات (الأيام)
            </button>
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'timetable' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              جدول الحصص والتقويم (شبكة أسبوعية)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>آخر مزامنة سحابية: {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString('ar-EG') : 'الآن'}</span>
        </div>
      </div>

      {/* Conflict Warning Banner if real overlaps exist */}
      {(() => {
        const normStr = (s?: string) => (s || '').trim().toLowerCase();
        const conflicts: { slot1: LabScheduleSlot; slot2: LabScheduleSlot; type: 'room' | 'trainer' | 'group' | 'review'; reason: string }[] = [];

        for (let i = 0; i < (schedules || []).length; i++) {
          for (let j = i + 1; j < (schedules || []).length; j++) {
            const s1 = schedules[i];
            const s2 = schedules[j];

            const d1 = normalizeDay(s1.dayOfWeek);
            const d2 = normalizeDay(s2.dayOfWeek);
            if (!d1 || !d2 || d1 !== d2) continue;

            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime) || (start1 + 60);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime) || (start2 + 60);

            const hasOverlap = (start1 < end2 && end1 > start2);
            if (!hasOverlap) continue;

            const sameBranch = !s1.branchId || !s2.branchId || s1.branchId === s2.branchId;
            const room1 = normStr(s1.roomName);
            const room2 = normStr(s2.roomName);
            const sameRoom = room1 && room2 && room1 === room2;

            const trainer1 = normStr(s1.trainerId || s1.trainerName);
            const trainer2 = normStr(s2.trainerId || s2.trainerName);
            const sameTrainer = trainer1 && trainer2 && trainer1 === trainer2;

            const group1 = normStr(s1.groupId || s1.groupName);
            const group2 = normStr(s2.groupName);
            const sameGroup = group1 && group2 && group1 === group2;

            if (sameGroup) {
              conflicts.push({
                slot1: s1,
                slot2: s2,
                type: 'group',
                reason: `تعارض: المجموعة (${s1.groupName}) لديها محاضرتان في نفس الوقت (${s1.startTime} - ${s1.endTime}) يوم ${d1}`
              });
            } else if (sameTrainer) {
              conflicts.push({
                slot1: s1,
                slot2: s2,
                type: 'trainer',
                reason: `تعارض: المدرب (${s1.trainerName || 'المدرب'}) محجوز في مكانين في نفس الوقت (${s1.startTime} - ${s1.endTime}) يوم ${d1}`
              });
            } else if (sameRoom && sameBranch) {
              conflicts.push({
                slot1: s1,
                slot2: s2,
                type: 'room',
                reason: `تعارض: المعمل (${s1.roomName}) محجوز لمجموعتين (${s1.groupName} و ${s2.groupName}) في نفس الوقت يوم ${d1}`
              });
            } else if (!room1 || !room2 || !trainer1 || !trainer2) {
              conflicts.push({
                slot1: s1,
                slot2: s2,
                type: 'review',
                reason: `يحتاج مراجعة: تقاطع زمني بين (${s1.groupName}) و (${s2.groupName}) يوم ${d1} بسبب نقص بيانات المعمل/المدرب`
              });
            }
          }
        }

        if (conflicts.length === 0) return null;

        return (
          <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-2xl flex flex-col gap-3 text-amber-200 text-xs shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div>
                  <strong className="font-bold text-amber-300 text-sm block">تنبيه تعارضات الجدول الزمني ({conflicts.length}):</strong>
                  <span>تم الفحص بناءً على التداخل الزمني، القاعة، الفرع، والمدرب. التواجد في أماكن مختلفة لا يُعتبر تعارضاً.</span>
                </div>
              </div>
              <button
                onClick={() => setViewMode('timetable')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl shrink-0 transition-all text-xs"
              >
                عرض في الجدول
              </button>
            </div>
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-amber-500/20 max-h-36 overflow-y-auto">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-amber-200">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.type === 'review' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                  <span>{c.reason}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Schedule Weekly Grid / Cards or Timetable Matrix */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {daysOfWeek.map(day => {
            const daySlots = (schedules || []).filter(s => {
              return normalizeDay(s.dayOfWeek) === normalizeDay(day);
            }).sort((a, b) => {
              return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
            });
            return (
              <div key={day} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <h3 className="font-black text-sm text-slate-100">{day}</h3>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-indigo-300 font-bold">
                      {daySlots.length} محاضرات
                    </span>
                  </div>

                  <div className="space-y-3">
                    {daySlots.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        لا توجد مواعيد مسجلة في هذا اليوم
                      </div>
                    ) : (
                      daySlots.map(slot => (
                        <div key={slot.id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 relative group hover:border-indigo-500/50 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {formatTimeAMPM(slot.startTime)} - {formatTimeAMPM(slot.endTime)}
                              </span>
                              <h4 className="font-bold text-xs text-slate-100 mt-1.5">{slot.groupName}</h4>
                              <p className="text-[11px] text-indigo-300 mt-0.5">{slot.courseName}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-all"
                              title="حذف الموعد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span>{slot.trainerName || 'المدرب المعتمد'}</span>
                            </span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                              {slot.roomName}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>نظام المحاضرة: ساعة واحدة</span>
                  <span>إجمالي يومي: {daySlots.length * 60} دقيقة</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Timetable / Google Calendar Matrix View */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>جدول الحصص والتقويم الأسبوعي (عرض مصفوفة الساعات)</span>
            </h3>
            <span className="text-xs text-slate-400">إجمالي الحصص المعروضة: {(schedules || []).length} محاضرة أسبوعياً</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700 text-xs font-bold text-slate-300">
                  <th className="p-3 border-l border-slate-700 text-center w-28">الوقت / اليوم</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="p-3 border-l border-slate-700 text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(hour => (
                  <tr key={hour} className="hover:bg-slate-800/30 transition-all">
                    <td className="p-3 font-mono font-bold text-amber-400 bg-slate-950/45 border-l border-slate-800 text-center">
                      {formatTimeAMPM(hour)}
                    </td>
                    {daysOfWeek.map(day => {
                      // Find slots matching this day and starting near this hour
                      const matchingSlots = (schedules || []).filter(s => {
                        const isMatchingDay = normalizeDay(s.dayOfWeek) === normalizeDay(day);
                        if (!isMatchingDay) return false;
                        if (!s.startTime) return false;

                        const slotStartMins = timeToMinutes(s.startTime);
                        const hourMins = timeToMinutes(hour);

                        if (hour === '08:00') {
                          return slotStartMins < 540; // Anything before 9:00 AM
                        } else if (hour === '21:00') {
                          return slotStartMins >= 1260; // Anything at or after 9:00 PM
                        }
                        return slotStartMins >= hourMins && slotStartMins < hourMins + 60;
                      });

                      const hasOverlap = matchingSlots.length > 1;

                      return (
                        <td key={day} className="p-2 border-l border-slate-800 align-top min-w-[160px]">
                          {matchingSlots.length === 0 ? (
                            <button
                              onClick={() => {
                                setNewDay(day);
                                setNewStartTime(hour);
                                const hNum = parseInt(hour.substring(0, 2), 10);
                                const endH = String(Math.min(23, hNum + 1)).padStart(2, '0') + ':00';
                                setNewEndTime(endH);
                                setIsAddModalOpen(true);
                              }}
                              className="w-full py-4 text-slate-500 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/40 text-[10px] transition-all flex flex-col items-center justify-center gap-1 group"
                              title="إضافة أو استيراد موعد لمجموعة في هذا الوقت الفارغ"
                            >
                              <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                              <span>إضافة / استيراد</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              {hasOverlap && (
                                <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>تضارب {matchingSlots.length} محاضرات في نفس الساعة</span>
                                </div>
                              )}
                              {matchingSlots.map(slot => (
                                <div key={slot.id} className={`p-2.5 rounded-lg border shadow relative group ${hasOverlap ? 'bg-amber-950/40 border-amber-500/50' : 'bg-indigo-950/60 border-indigo-500/40'}`}>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                      {formatTimeAMPM(slot.startTime)} - {formatTimeAMPM(slot.endTime)}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="p-1 text-slate-400 hover:text-rose-400 transition-all rounded hover:bg-rose-950/50"
                                      title="حذف هذا الموعد نهائياً"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="font-bold text-slate-100 mt-1 text-xs">{slot.groupName}</div>
                                  <div className="text-[10px] text-indigo-200 mt-0.5">{slot.courseName}</div>
                                  <div className="mt-2 pt-1.5 border-t border-indigo-900/50 flex justify-between text-[9px] text-slate-400">
                                    <span>{slot.trainerName || 'المدرب'}</span>
                                    <span className="text-emerald-300">{slot.roomName}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-right">
            <h3 className="text-base font-black text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>إضافة موعد تدريبي جديد في جدول المعمل</span>
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">استيراد مجموعة مسجلة مسبقاً أو إضافة جديدة</label>
                <select
                  onChange={(e) => {
                    const gId = e.target.value;
                    const found = groups.find(g => g.id === gId);
                    if (found) {
                      setNewGroupname(found.name);
                      const crs = courses.find(c => c.id === found.courseId);
                      if (crs) setNewCourseName(crs.name);
                      const tr = trainers.find(t => t.id === found.trainerId);
                      if (tr) setNewTrainerName(tr.name);
                      if (found.roomName || (found as any).hallName) setNewRoomName(found.roomName || (found as any).hallName || '');
                      const gDays = found.scheduleDays || (found as any).days;
                      if (gDays && gDays.length > 0) setNewDay(gDays[0]);
                      if (found.startTime || (found as any).scheduleTime) setNewStartTime(found.startTime || (found as any).scheduleTime || '16:00');
                      if (found.endTime) setNewEndTime(found.endTime);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none mb-2 text-xs"
                >
                  <option value="">-- اختر مجموعة مسجلة للاستيراد السريع --</option>
                  {(groups || []).map(g => {
                    const crs = courses.find(c => c.id === g.courseId);
                    return (
                      <option key={g.id} value={g.id}>{g.name} ({crs?.name || 'دورة'})</option>
                    );
                  })}
                </select>
                <input
                  type="text"
                  value={newGroupname}
                  onChange={(e) => setNewGroupname(e.target.value)}
                  placeholder="مثال: مجموعة البرمجة المتقدمة - B2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الدورة / البرنامج</label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المدرب المحاضر</label>
                  <input
                    type="text"
                    value={newTrainerName}
                    onChange={(e) => setNewTrainerName(e.target.value)}
                    placeholder="مثال: د. محمد رمضان بخيت"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">يوم الأسبوع</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">معمل الكمبيوتر / القاعة</label>
                  <input
                    type="text"
                    list="labs-options-list"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    placeholder="اختر أو اكتب المعمل..."
                  />
                  <datalist id="labs-options-list">
                    <option value="معمل النجاح" />
                    <option value="معمل بدر" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">وقت البدء (ساعة واحدة)</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">وقت الانتهاء (بعد ساعة)</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
                >
                  حفظ الموعد في الجدول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ----------------- MODAL: Daily Lab Analytics & Free Time Report ----------------- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">تقرير تحليل المعامل والأوقات الشاغرة (Free Time & Gaps)</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300">
                تحليل تفصيلي لأيام الأسبوع يوضح عدد المحاضرات النشطة، توقيت البداية والنهاية لكل يوم، ورصد الأوقات الشاغرة (الفراغات) بين الحصص:
              </p>

              <div className="space-y-3">
                {daysOfWeek.map(day => {
                  const daySlots = (schedules || []).filter(s => {
                    return normalizeDay(s.dayOfWeek) === normalizeDay(day);
                  }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                  const count = daySlots.length;
                  const start = count > 0 ? formatTimeAMPM(daySlots[0].startTime) : 'لا يوجد';
                  const end = count > 0 ? formatTimeAMPM(daySlots[daySlots.length - 1].endTime) : 'لا يوجد';

                  // Calculate gaps between slots
                  const gaps: string[] = [];
                  for (let i = 0; i < daySlots.length - 1; i++) {
                    const currentEnd = daySlots[i].endTime;
                    const nextStart = daySlots[i + 1].startTime;
                    if (currentEnd < nextStart) {
                      gaps.push(`من ${formatTimeAMPM(currentEnd)} إلى ${formatTimeAMPM(nextStart)}`);
                    }
                  }

                  return (
                    <div key={day} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-amber-300">{day}</span>
                          <span className="bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                            {count} محاضرة
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px]">
                          فترة العمل: <span className="font-mono text-slate-200">{start}</span> ➔ <span className="font-mono text-slate-200">{end}</span>
                        </p>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 min-w-[220px]">
                        <span className="text-[10px] text-amber-400 font-bold block mb-1">الأوقات الشاغرة (فراغات المعمل):</span>
                        {gaps.length > 0 ? (
                          <div className="space-y-1">
                            {gaps.map((g, idx) => (
                              <span key={idx} className="block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                ⏱️ شاغر: {g}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">لا توجد أوقات فراغ (الجدول متصل تماماً)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  إغلاق التقرير
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Professional Facebook Poster & Print ----------------- */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">بوستر الجدول الزمني الاحترافي (للنشر على فيسبوك والتعليق)</h3>
              </div>
              <button onClick={() => setIsPosterModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Poster Preview Card */}
              <div id="schedule-poster-card" className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-slate-100 space-y-6 relative overflow-hidden">
                {/* Header with Logo */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-400 to-white">
                        مركز النجاح للتدريب والاستشارات
                      </h2>
                      <p className="text-xs text-indigo-300 font-semibold mt-0.5">جدول المعامل والمحاضرات الرسمية • الفصل التدريبي الحالي</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold block">
                      📅 جدول معتمد ومحدث
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">توقيت 12 ساعة (ص / م)</span>
                  </div>
                </div>

                {/* Days Grid in Poster */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daysOfWeek.map(day => {
                    const daySlots = (schedules || []).filter(s => normalizeDay(s.dayOfWeek) === normalizeDay(day));
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={day} className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-black text-sm text-amber-400">{day}</span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                            {daySlots.length} جلسات
                          </span>
                        </div>
                        <div className="space-y-2">
                          {daySlots.map(slot => (
                            <div key={slot.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/30 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-amber-300 text-[11px] font-bold">
                                  {formatTimeAMPM(slot.startTime)} - {formatTimeAMPM(slot.endTime)}
                                </span>
                                <span className="text-[10px] text-slate-400">{slot.roomName}</span>
                              </div>
                              <p className="font-bold text-slate-100">{slot.groupName}</p>
                              <p className="text-[11px] text-indigo-300">{slot.courseName} • المحاضر: {slot.trainerName}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <p>📍 المقر الرئيسي: الفروع المعتمدة • هاتف: 01000000000</p>
                  <p className="font-bold text-amber-400">✨ طريقك نحو الاحتراف والتميز</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsPosterModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة البوستر أو حفظه PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CloudSyncIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
      <path d="M12 12v9"></path>
      <path d="m16 16-4-4-4 4"></path>
    </svg>
  );
}
