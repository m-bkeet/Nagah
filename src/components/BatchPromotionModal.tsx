import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  ChevronRight,
  Check,
  HelpCircle,
  BookOpen,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { Course, Group, PromotionPreviewItem } from '../types';

interface BatchPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchPromotionModal: React.FC<BatchPromotionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [targetYear, setTargetYear] = useState('2027/2028');
  const [courses, setCourses] = useState<Course[]>([]);
  const [rules, setRules] = useState<Array<{
    fromCourseId: string;
    fromCourseName: string;
    toCourseId: string;
    toCourseName: string;
    createNewGroups: boolean;
  }>>([]);
  const [previewItems, setPreviewItems] = useState<PromotionPreviewItem[]>([]);
  const [autoUpgradeGroups, setAutoUpgradeGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  const [resultSummary, setResultSummary] = useState<{
    promotedCount: number;
    graduatedCount: number;
    upgradedGroupsCount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreviewData();
    } else {
      setStep(1);
      setResultSummary(null);
    }
  }, [isOpen]);

  const loadPreviewData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPromotionPreview();
      setAcademicYear(data.academicYear || '2026/2027');
      
      // Calculate default target year (e.g. 2026/2027 -> 2027/2028)
      const parts = (data.academicYear || '2026/2027').split('/');
      if (parts && parts.length === 2 && parts[0] && parts[1] && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
        setTargetYear(`${parseInt(parts[0]) + 1}/${parseInt(parts[1]) + 1}`);
      }

      setCourses(data.courses || []);
      setRules(data.rules || []);
      setPreviewItems(data.items || []);
    } catch (err: any) {
      alert(err.message || 'فشل تحميل بيانات الترقية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleTargetChange = (fromCourseId: string, toCourseId: string) => {
    const toCourse = courses.find((c) => c.id === toCourseId);
    const toCourseName = toCourseId === 'graduate' 
      ? '🎓 تخرج وإتمام المرحلة' 
      : toCourseId === 'stay' 
      ? 'البقاء في نفس الصف' 
      : toCourse?.name || '';

    setRules((prev) =>
      prev.map((r) =>
        r.fromCourseId === fromCourseId
          ? { ...r, toCourseId, toCourseName }
          : r
      )
    );

    // Update preview items corresponding to this rule
    setPreviewItems((prev) =>
      prev.map((item) => {
        if (item.currentCourseId === fromCourseId) {
          const action = toCourseId === 'graduate' ? 'graduate' : toCourseId === 'stay' ? 'stay' : 'promote';
          let targetGroupName = '';
          if (item.currentGroupName && toCourseId !== 'graduate' && toCourseId !== 'stay' && toCourse) {
            const oldCName = item.currentCourseName || '';
            if (oldCName && item.currentGroupName.includes(oldCName)) {
              targetGroupName = item.currentGroupName.replace(oldCName, toCourse.name);
            } else {
              targetGroupName = `${toCourse.name} - ${item.currentGroupName.split('-').pop()?.trim() || '1'}`;
            }
          }
          return {
            ...item,
            targetCourseId: toCourseId,
            targetCourseName: toCourseName,
            targetGroupName,
            action
          };
        }
        return item;
      })
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setPreviewItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const toggleItemSelection = (traineeId: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.traineeId === traineeId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleExecutePromotion = async () => {
    const selectedIds = previewItems.filter((i) => i.selected).map((i) => i.traineeId);
    if (selectedIds.length === 0) {
      alert('يرجى تحديد طالب واحد على الأقل للترقية والتصعيد.');
      return;
    }

    if (!confirm(`هل أنت متأكد من تنفيذ تصعيد وترقية (${selectedIds.length}) طالباً للعام الدراسي (${targetYear})؟\n- ستبقى أكواد ونقاط الطلاب محفوظة بالكامل.\n- سيتم تحديث المجموعات تلقائياً.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.executeBatchPromotion({
        academicYear: targetYear,
        selectedTraineeIds: selectedIds,
        mappings: rules,
        autoUpgradeGroups
      });

      if (res.success) {
        setResultSummary({
          promotedCount: res.promotedCount,
          graduatedCount: res.graduatedCount,
          upgradedGroupsCount: res.upgradedGroupsCount
        });
        setStep(3);
        onSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تنفيذ الترقية والتصعيد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredPreview = previewItems.filter((item) => {
    if (filterCourse !== 'all' && item.currentCourseId !== filterCourse) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.currentCourseName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedCount = previewItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-inner">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  تصعيد وترقية الطلاب للعام الدراسي الجديد
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                  بضغطة زر واحدة 🚀
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ترحيل الطلاب إلى الصفوف التالية وتحديث المجموعات تلقائياً مع الحفاظ الدائم على أكواد الطلاب وسجلاتهم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4 sm:gap-8">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? 'text-indigo-400 font-bold' : step > 1 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 1 ? 'bg-indigo-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span>خريطة تصعيد المراحل والمجموعات</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600" />

            <div
              className={`flex items-center gap-2 ${
                step === 2 ? 'text-indigo-400 font-bold' : step > 2 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 2 ? 'bg-indigo-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span>كشف ومعاينة الطلاب المستهدفين ({selectedCount})</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600" />

            <div
              className={`flex items-center gap-2 ${
                step === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </span>
              <span>نتيجة الترقية والاعتماد</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span>العام الحالي: <strong className="text-white">{academicYear}</strong></span>
            <span>←</span>
            <span>العام الجديد: <strong className="text-amber-400">{targetYear}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-medium">جاري فحص كشوفات الطلاب والمراحل الدراسية...</p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Mapping & Settings */
            <div className="space-y-6">
              {/* Year Target Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    📅 العام الدراسي الجديد المستهدف:
                  </label>
                  <input
                    type="text"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    placeholder="مثال: 2027/2028"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">سيتم توثيق الترقية في سجل الطالب تحت هذا العام</p>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-indigo-950/30 rounded-xl border border-indigo-500/20">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-black text-white">ترقية المجموعات تلقائياً</h4>
                      <p className="text-[11px] text-slate-400">نفس الموعد والمكان والمدرب (مثال: ICT4 - 1 ← ICT5 - 1)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoUpgradeGroups}
                      onChange={(e) => setAutoUpgradeGroups(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Course Mapping Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>خريطة انتقال المراحل والدورات (من الصف الحالي ← إلى الصف القادم):</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    يمكنك تعديل أي صف مستهدف أو اختيار تخريج الطلاب
                  </span>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-3">الصف / الدورة الحالية</th>
                        <th className="p-3 text-center">اتجاه التصعيد</th>
                        <th className="p-3">الصف / الدورة المستهدفة (العام القادم)</th>
                        <th className="p-3 text-center">الطلاب المؤهلون</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rules.map((rule) => {
                        const count = previewItems.filter(
                          (item) => item.currentCourseId === rule.fromCourseId
                        ).length;

                        return (
                          <tr key={rule.fromCourseId} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5 font-bold text-white flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                              <span>{rule.fromCourseName}</span>
                            </td>
                            <td className="p-3.5 text-center text-indigo-400 font-black">
                              <ArrowLeft className="w-4 h-4 mx-auto" />
                            </td>
                            <td className="p-3.5">
                              <select
                                value={rule.toCourseId}
                                onChange={(e) =>
                                  handleRuleTargetChange(rule.fromCourseId, e.target.value)
                                }
                                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none w-full max-w-xs"
                              >
                                <optgroup label="الدورات المتاحة للتصعيد">
                                  {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="خيارات إضافية">
                                  <option value="graduate">🎓 تخرج وإتمام المرحلة (Completed)</option>
                                  <option value="stay">⏸️ البقاء في نفس الصف دون تغيير</option>
                                </optgroup>
                              </select>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                                {count} طالب
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notice Card */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-300 leading-relaxed">
                  <strong>ضمان وثبات الأكواد:</strong> أكواد الطلاب الحالية (مثل <span className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-white font-bold">A001</span> أو <span className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-white font-bold">B001</span>) ستبقى ثابتة مع الطالب طوال مسيرته، ولن تتغير بعد الترقية، كما ستبقى سجلات الدرجات والنقاط ورصيد النجوم محفوظاً بالكامل.
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Student Preview Table */
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحديد الكل ({previewItems.length})</span>
                  </button>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>إلغاء التحديد</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="all">جميع الصفوف الحالية</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث باسم الطالب أو الكود..."
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-48"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                <div className="max-h-[46vh] overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/90 sticky top-0 text-slate-300 font-bold border-b border-slate-700 z-10">
                      <tr>
                        <th className="p-3 text-center w-12">تحديد</th>
                        <th className="p-3">كود الطالب</th>
                        <th className="p-3">اسم الطالب</th>
                        <th className="p-3">الصف والمجموعة الحالية</th>
                        <th className="p-3 text-center">←</th>
                        <th className="p-3">الصف والمجموعة بعد الترقية</th>
                        <th className="p-3 text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPreview.map((item) => (
                        <tr
                          key={item.traineeId}
                          onClick={() => toggleItemSelection(item.traineeId)}
                          className={`cursor-pointer transition-colors ${
                            item.selected ? 'bg-indigo-950/20 hover:bg-indigo-900/30' : 'opacity-60 hover:opacity-100 hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItemSelection(item.traineeId)}
                              className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-300">
                            {item.code}
                          </td>
                          <td className="p-3 font-bold text-white">
                            {item.fullName}
                          </td>
                          <td className="p-3 text-slate-300">
                            <span className="font-semibold">{item.currentCourseName}</span>
                            {item.currentGroupName && (
                              <span className="text-[11px] text-slate-400 block">
                                ({item.currentGroupName})
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center text-indigo-400 font-black">
                            <ArrowLeft className="w-4 h-4 mx-auto" />
                          </td>
                          <td className="p-3 text-emerald-300 font-bold">
                            <span>{item.targetCourseName}</span>
                            {autoUpgradeGroups && item.targetGroupName && (
                              <span className="text-[11px] text-emerald-400/80 block font-normal">
                                ({item.targetGroupName})
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.action === 'promote'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : item.action === 'graduate'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {item.action === 'promote' ? 'تصعيد للصف الأعلى' : item.action === 'graduate' ? 'تخرج وإتمام' : 'بقاء'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Step 3: Success Summary */
            <div className="py-8 text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">تمت عملية الترقية والتصعيد بنجاح!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  تم تصعيد الطلاب وتحديث المجموعات للعام الدراسي ({targetYear}) بنجاح تام.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-center">
                <div>
                  <div className="text-xl font-black text-indigo-400">
                    {resultSummary?.promotedCount || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">طالب تم تصعيدهم</div>
                </div>
                <div>
                  <div className="text-xl font-black text-amber-400">
                    {resultSummary?.graduatedCount || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">طالب تم تخرجهم</div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">
                    {resultSummary?.upgradedGroupsCount || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">مجموعة تم ترقيتها</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-600/30"
              >
                العودة إلى لوحة المتدربين
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step !== 3 && (
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                إلغاء
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع للخطوة السابقة</span>
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                <span>متابعة لمعاينة الطلاب ({previewItems.length})</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || selectedCount === 0}
                onClick={handleExecutePromotion}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs transition-all shadow-lg shadow-indigo-600/40 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تنفيذ الترقية والتصعيد...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>اعتماد وتصعيد ({selectedCount}) طالب للعام الجديد</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
