import React, { useState } from 'react';
import {
  Users,
  Search,
  Edit3,
  ArrowRightLeft,
  X,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  FileText,
  Phone,
  BookOpen,
  RefreshCw,
  Save,
  UserCheck
} from 'lucide-react';
import { Trainer, Group, Course, Trainee } from '../../types';
import { formatTimeAMPM } from '../../utils/timeFormat';

interface TrainerGroupsManagerProps {
  trainer: Trainer;
  groups: Group[];
  courses: Course[];
  trainees: Trainee[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData: () => void;
}

export const TrainerGroupsManager: React.FC<TrainerGroupsManagerProps> = ({
  trainer,
  groups,
  courses,
  trainees,
  onShowToast,
  onRefreshData
}) => {
  // Filter trainer groups
  const trainerGroups = groups.filter(g =>
    g.trainerId === trainer.id ||
    courses.some(c => c.id === g.courseId && c.trainerId === trainer.id)
  );

  const [selectedGroupId, setSelectedGroupId] = useState<string>(trainerGroups[0]?.id || groups[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Group Editing State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editingGroupData, setEditingGroupData] = useState<{
    id: string;
    roomName: string;
    whatsappGroupLink: string;
    notes: string;
  } | null>(null);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // Student Transfer State
  const [transferringStudent, setTransferringStudent] = useState<Trainee | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const activeGroup = groups.find(g => g.id === selectedGroupId) || trainerGroups[0];
  const activeCourse = courses.find(c => c.id === activeGroup?.courseId);

  // Trainees in selected group
  const groupTrainees = trainees.filter(t => t.groupId === activeGroup?.id);
  const filteredTrainees = groupTrainees.filter(t =>
    t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone?.includes(searchQuery)
  );

  // Target groups available for transfer (same course)
  const availableTargetGroups = groups.filter(g =>
    g.id !== activeGroup?.id &&
    (g.courseId === activeGroup?.courseId || g.trainerId === trainer.id)
  );

  // Open Edit Group Modal
  const handleOpenEditGroup = (g: Group) => {
    setEditingGroupData({
      id: g.id,
      roomName: g.roomName || g.hallName || '',
      whatsappGroupLink: g.whatsappGroupLink || '',
      notes: g.notes || ''
    });
    setIsEditingGroup(true);
  };

  // Save Group Edit
  const handleSaveGroupEdit = async () => {
    if (!editingGroupData) return;
    setIsSavingGroup(true);
    try {
      const res = await fetch(`/api/groups/${editingGroupData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: editingGroupData.roomName,
          hallName: editingGroupData.roomName,
          whatsappGroupLink: editingGroupData.whatsappGroupLink,
          notes: editingGroupData.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(' تم تحديث بيانات القاعة والواتساب للمجموعة بنجاح!', 'success');
        setIsEditingGroup(false);
        onRefreshData();
      } else {
        onShowToast(data.error || 'فشل تحديث بيانات المجموعة', 'error');
      }
    } catch (err) {
      onShowToast('فشل الاتصال بالخادم لتحديث المجموعة', 'error');
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Handle Student Transfer
  const handleTransferStudent = async () => {
    if (!transferringStudent || !targetGroupId) {
      onShowToast('يرجى اختيار المجموعة الهدف للنقل إليها', 'error');
      return;
    }

    const targetGroup = groups.find(g => g.id === targetGroupId);
    if (!targetGroup) return;

    setIsTransferring(true);
    try {
      const res = await fetch(`/api/trainees/${transferringStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: targetGroup.id,
          groupName: targetGroup.name,
          notes: (transferringStudent.notes || '') + ` [تم النقل من ${activeGroup?.name || 'مجموعة'} إلى ${targetGroup.name} بتاريخ ${new Date().toLocaleDateString('ar-EG')}]`
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(` تم نقل الطالب ${transferringStudent.fullName} إلى ${targetGroup.name} بنجاح!`, 'success');
        setTransferringStudent(null);
        setTargetGroupId('');
        setTransferReason('');
        onRefreshData();
      } else {
        onShowToast(data.error || 'فشل نقل الطالب', 'error');
      }
    } catch (err: any) {
      onShowToast('تعذر نقل الطالب، يرجى إعادة المحاولة', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">إدارة المجموعات المخصصة والطلاب</h2>
            <p className="text-xs text-slate-400">
              عرض مجموعاتك التدريبية، تعديل القاعة والواتساب، ونقل الطلاب بين المجموعات المتاحة للدورة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">مجموعاتك النشطة</span>
            <span className="text-indigo-400 font-mono font-black text-sm">{trainerGroups.length} مجموعة</span>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">إجمالي الطلاب</span>
            <span className="text-emerald-400 font-mono font-black text-sm">{trainees.length} طالب</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Groups List Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 px-1">المجموعات التدريبية المتاحة ({trainerGroups.length}):</h3>

          {trainerGroups.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs font-bold">
              لا توجد مجموعات مسندة لك حالياً.
            </div>
          ) : (
            trainerGroups.map(g => {
              const crs = courses.find(c => c.id === g.courseId);
              const gTraineesCount = trainees.filter(t => t.groupId === g.id).length;
              const isSelected = g.id === activeGroup?.id;

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-600/20 scale-[1.01]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-white">{g.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                      {gTraineesCount} طالب
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{crs?.name || 'الدورة التدريبية'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{g.days?.join('، ') || 'أيام المحاضرات'} ({formatTimeAMPM(g.startTime || '16:00')} - {formatTimeAMPM(g.endTime || '18:00')})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>القاعة/المعمل: {g.roomName || g.hallName || 'معمل الحاسب الرئيسي'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    {g.whatsappGroupLink ? (
                      <a
                        href={g.whatsappGroupLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>جروب الواتساب</span>
                      </a>
                    ) : (
                      <span className="text-slate-500">لا يوجد رابط واتساب</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditGroup(g);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-amber-300" />
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Column 2 & 3: Selected Group Roster & Student Transfer Controls */}
        <div className="lg:col-span-2 space-y-4">
          {activeGroup ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              {/* Active Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{activeGroup.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                      {filteredTrainees.length} طالب مسجل
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    دورة: <span className="text-indigo-300 font-bold">{activeCourse?.name}</span> | المعمل: {activeGroup.roomName || activeGroup.hallName || 'المعمل الرئيسي'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="بحث عن طالب..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => handleOpenEditGroup(activeGroup)}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl text-xs font-bold border border-indigo-500/40 flex items-center gap-1 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل بيانات القاعة</span>
                  </button>
                </div>
              </div>

              {/* Roster Table / List */}
              {filteredTrainees.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-bold text-slate-400">لا يوجد طلاب مطابقون للبحث في هذه المجموعة.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrainees.map(st => (
                    <div
                      key={st.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black text-sm shrink-0">
                          {st.fullName?.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-100">{st.fullName}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                              {st.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            {st.phone && <span>الهاتف: <span className="font-mono text-slate-200">{st.phone}</span></span>}
                            {st.parentPhone && <span>ولي الأمر: <span className="font-mono text-slate-200">{st.parentPhone}</span></span>}
                          </div>
                        </div>
                      </div>

                      {/* Transfer Action Button */}
                      <button
                        onClick={() => {
                          setTransferringStudent(st);
                          setTargetGroupId(availableTargetGroups[0]?.id || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 text-xs font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        title="نقل أو تبديل الطالب إلى مجموعة أخرى نفس الدورة"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>نقل إلى مجموعة أخرى</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs font-bold">
              يرجى اختيار مجموعة من القائمة على اليمين لاستعراض طلابها.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT GROUP DETAILS */}
      {isEditingGroup && editingGroupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>تعديل معلومات القاعة ورابط الواتساب</span>
              </h3>
              <button
                onClick={() => setIsEditingGroup(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">اسم القاعة / المعمل:</label>
                <input
                  type="text"
                  placeholder="مثال: معمل البرمجة الحسابية 2"
                  value={editingGroupData.roomName}
                  onChange={(e) => setEditingGroupData({ ...editingGroupData, roomName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">رابط جروب الواتساب:</label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={editingGroupData.whatsappGroupLink}
                  onChange={(e) => setEditingGroupData({ ...editingGroupData, whatsappGroupLink: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">ملاحظات أو تنويهات المجموعة:</label>
                <textarea
                  rows={2}
                  placeholder="مثال: يرجى حضور الطلاب مع أجهزة اللابتوب الشخصية يوم الأربعاء..."
                  value={editingGroupData.notes}
                  onChange={(e) => setEditingGroupData({ ...editingGroupData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingGroup(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveGroupEdit}
                disabled={isSavingGroup}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                {isSavingGroup ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER STUDENT */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span>نقل / تبديل الطالب إلى مجموعة جديدة</span>
              </h3>
              <button
                onClick={() => setTransferringStudent(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div>الطالب: <span className="font-bold text-amber-300">{transferringStudent.fullName}</span> ({transferringStudent.code})</div>
              <div className="text-slate-400">المجموعة الحالية: <span className="font-semibold text-slate-200">{activeGroup?.name}</span></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-amber-300 font-bold mb-1">اختيار المجموعة المستهدفة للنقل *</label>
                {availableTargetGroups.length === 0 ? (
                  <p className="text-xs text-rose-400 font-bold">لا توجد مجموعات أخرى متاحة لنفس الدورة التدريبية.</p>
                ) : (
                  <select
                    value={targetGroupId}
                    onChange={(e) => setTargetGroupId(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-amber-200 focus:outline-none"
                  >
                    {availableTargetGroups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} - ({g.days?.join('، ') || 'مواعيد حرة'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">سبب النقل / ملاحظات (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: تغيير مواعيد الدروس المدرسية للطالب..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransferringStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleTransferStudent}
                disabled={isTransferring || availableTargetGroups.length === 0}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTransferring ? 'جاري النقل...' : 'تأكيد النقل المباشر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
