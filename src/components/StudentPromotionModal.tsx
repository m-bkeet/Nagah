import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  RotateCw,
  Search,
  CheckSquare,
  Square,
  Users,
  ArrowLeft,
  Calendar,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { Branch } from '../types';

interface StudentPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  selectedBranch: string;
  onSuccess: () => void;
}

export const StudentPromotionModal: React.FC<StudentPromotionModalProps> = ({
  isOpen,
  onClose,
  branches,
  selectedBranch,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>(selectedBranch || 'all');
  const [autoCreateGroups, setAutoCreateGroups] = useState(true);
  const [newAcademicYear, setNewAcademicYear] = useState('2027/2028');
  const [customActionMap, setCustomActionMap] = useState<{ [id: string]: 'promote' | 'graduate' | 'stay' }>({});

  useEffect(() => {
    if (isOpen) {
      loadPreview();
    }
  }, [isOpen, branchFilter]);

  const loadPreview = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPromotionPreview({ branchId: branchFilter });
      setData(res);
      if (res.nextYear) {
        setNewAcademicYear(res.nextYear);
      }
      if (Array.isArray(res.students)) {
        setSelectedIds(res.students.map((s: any) => s.traineeId));
      }
    } catch (err: any) {
      console.error('Failed to load promotion preview', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const students = data?.students || [];
  const filteredStudents = students.filter((s: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.traineeCode?.toLowerCase().includes(q) ||
      s.currentCourseName?.toLowerCase().includes(q) ||
      s.currentGroupName?.toLowerCase().includes(q)
    );
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s: any) => s.traineeId));
    }
  };

  const handleExecutePromotion = async () => {
    if (selectedIds.length === 0) {
      alert('يرجى اختيار طالب واحد على الأقل للتصعيد');
      return;
    }

    const confirmMsg = `هل أنت متأكد من تصعيد وترقية ${selectedIds.length} طالب إلى العام الدراسي الجديد (${newAcademicYear})؟\n\n📌 سيبقى كود كل طالب ثابتاً كما هو، وسيتم نقله إلى الصف والمجموعة التالية تلقائياً.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsPromoting(true);
      const promotionsPayload = selectedIds.map((id) => {
        const student = students.find((s: any) => s.traineeId === id);
        const action = customActionMap[id] || student?.suggestedAction || 'promote';
        return {
          traineeId: id,
          action,
          targetCourseId: student?.targetCourseId,
          targetGroupId: student?.targetGroupId,
          nextGradeName: student?.nextGradeName,
          nextCourseCode: student?.nextCourseCode,
          suggestedGroupName: student?.suggestedGroupName
        };
      });

      const res = await fetch('/api/trainees/promote-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotions: promotionsPayload,
          autoCreateGroups,
          newAcademicYear,
          updateSettingsYear: true
        })
      }).then((r) => r.json());

      if (res.success) {
        alert(
          `🎉 تم تصعيد وترقية ${res.promotedCount || 0} متدرب بنجاح وتخريج ${res.graduatedCount || 0} طالب وإنشاء ${res.createdGroupsCount || 0} مجموعات جديدة للعام الجديد (${newAcademicYear})!`
        );
        onSuccess();
        onClose();
      } else {
        alert(res.error || 'فشلت عملية التصعيد');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تنفيذ الترقية');
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 my-4">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-100">نظام تصعيد وترقية الطلاب للعام الدراسي الجديد</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  بضغطة زر واحدة 🚀
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ترقية الطلاب من صف إلى آخر مع الحفاظ التام على الأكواد والمواعيد والمدربين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Rules Banner */}
        <div className="bg-indigo-950/50 border-b border-indigo-500/20 p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">ثبات كود الطالب</span>
              <span className="text-[11px] text-slate-400">
                طالب ICT4 ذو الكود A001 يظل كوده A001 عند انتقاله لـ ICT5
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/30">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">استمرار المجموعات والمواعيد</span>
              <span className="text-[11px] text-slate-400">
                مجموعة ICT4-1 تنتقل تلقائياً لـ ICT5-1 بنفس اليوم والوقت والمدرب
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/30">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">العام الدراسي الجديد</span>
              <span className="text-[11px] text-slate-400">
                من {data?.currentYear || '2026/2027'} إلى {newAcademicYear}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الكود أو الصف أو المجموعة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold">العام الجديد:</span>
              <input
                type="text"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono text-center font-bold"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 select-none">
              <input
                type="checkbox"
                checked={autoCreateGroups}
                onChange={(e) => setAutoCreateGroups(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-semibold">ترقية المجموعات تلقائياً</span>
            </label>
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400 px-1">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              {selectedIds.length === filteredStudents.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                تحديد الكل ({selectedIds.length} من {filteredStudents.length} محدد)
              </span>
            </button>

            <span>إجمالي الطلاب المؤهلين للتصعيد: {filteredStudents.length}</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
              <p>جاري تجهيز جدول تصعيد وترقية الطلاب...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold">لا يوجد طلاب مطابقين للبحث أو بحاجة للتصعيد في هذا الفرع</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((s: any) => {
                const isSelected = selectedIds.includes(s.traineeId);
                const currentAction = customActionMap[s.traineeId] || s.suggestedAction || 'promote';

                return (
                  <div
                    key={s.traineeId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-950/80 border-amber-500/50 shadow-md shadow-amber-950/10'
                        : 'bg-slate-950/30 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSelect(s.traineeId)}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                            {s.traineeCode}
                          </span>
                          <span className="font-bold text-sm text-slate-100">{s.fullName}</span>
                          {s.isGraduating && (
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                              مرحلة التخرج (الصف الثالث الإعدادي)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          هاتف: {s.phone || 'غير مسجل'} • المجموعة الحالية: {s.currentGroupName}
                        </p>
                      </div>
                    </div>

                    {/* Transition Arrow Visualizer */}
                    <div className="flex items-center gap-3 text-xs">
                      {/* Current Grade */}
                      <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-center min-w-[110px]">
                        <span className="text-[10px] text-slate-400 block">الصف الحالي</span>
                        <span className="font-bold text-slate-200">{s.currentCourseName}</span>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </div>

                      {/* Next Grade Target */}
                      <div className="bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-500/40 text-center min-w-[120px]">
                        <span className="text-[10px] text-indigo-300 block">الصف بعد الترقية</span>
                        <span className="font-black text-amber-300">
                          {s.isGraduating ? 'خريج معتمد' : s.targetCourseName}
                        </span>
                      </div>

                      {/* Action selector */}
                      <select
                        value={currentAction}
                        onChange={(e) => {
                          setCustomActionMap({
                            ...customActionMap,
                            [s.traineeId]: e.target.value as any
                          });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="promote">ترقية وتصعيد</option>
                        <option value="graduate">تخرج</option>
                        <option value="stay">إبقاء في نفس الصف</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-200">{selectedIds.length}</span> طلاب محددين للتصعيد الفوري
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isPromoting || selectedIds.length === 0}
              onClick={handleExecutePromotion}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPromoting ? 'جاري تنفيذ التصعيد والترقية...' : 'تنفيذ تصعيد وترقية الطلاب بضغطة زر 🚀'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
