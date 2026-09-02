import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Search,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import { Branch, Course, PromotionPreviewItem } from '../types';

interface StudentPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches?: Branch[];
  selectedBranch?: string;
  onSuccess: () => void;
}

export const StudentPromotionModal: React.FC<StudentPromotionModalProps> = ({
  isOpen,
  onClose,
  branches = [],
  selectedBranch = 'all',
  onSuccess
}) => {
  const [mode, setMode] = useState<'batch' | 'individual'>('batch');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Academic Year state
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [targetYear, setTargetYear] = useState('2027/2028');
  const [autoCreateGroups, setAutoCreateGroups] = useState(true);

  // Batch Mode States
  const [batchStep, setBatchStep] = useState<1 | 2 | 3>(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rules, setRules] = useState<Array<{
    fromCourseId: string;
    fromCourseName: string;
    toCourseId: string;
    toCourseName: string;
    createNewGroups: boolean;
  }>>([]);
  const [previewItems, setPreviewItems] = useState<PromotionPreviewItem[]>([]);
  const [batchSearch, setBatchSearch] = useState('');
  const [resultSummary, setResultSummary] = useState<{
    promotedCount: number;
    graduatedCount: number;
    upgradedGroupsCount: number;
  } | null>(null);

  // Individual Mode States
  const [indivStudents, setIndivStudents] = useState<any[]>([]);
  const [indivSearch, setIndivSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>(selectedBranch || 'all');
  const [customActionMap, setCustomActionMap] = useState<{ [id: string]: 'promote' | 'graduate' | 'stay' }>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setBatchStep(1);
      setResultSummary(null);
    }
  }, [isOpen, mode, branchFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (mode === 'batch') {
        const data = await api.getPromotionPreview();
        setAcademicYear(data.academicYear || '2026/2027');
        const parts = (data.academicYear || '2026/2027').split('/');
        if (parts && parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
          setTargetYear(`${parseInt(parts[0]) + 1}/${parseInt(parts[1]) + 1}`);
        }
        setCourses(data.courses || []);
        setRules(data.rules || []);
        setPreviewItems(data.items || []);
      } else {
        const res = await api.getPromotionPreview({ branchId: branchFilter });
        if (res.nextYear) setTargetYear(res.nextYear);
        if (Array.isArray(res.students)) {
          setIndivStudents(res.students);
          setSelectedIds(res.students.map((s: any) => s.traineeId));
        }
      }
    } catch (err: any) {
      console.error('فشل تحميل بيانات الترقية', err);
    } fontally: {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Batch Rule Target Change
  const handleRuleTargetChange = (fromCourseId: string, toCourseId: string) => {
    const toCourse = courses.find((c) => c.id === toCourseId);
    const toCourseName = toCourseId === 'graduate' 
      ? '🎓 تخرج وإتمام المرحلة' 
      : toCourseId === 'stay' 
      ? 'البقاء في نفس الصف' 
      : toCourse?.name || '';

    setRules(prev => prev.map(r => r.fromCourseId === fromCourseId ? { ...r, toCourseId, toCourseName } : r));
    setPreviewItems(prev => prev.map(item => {
      if (item.currentCourseId === fromCourseId) {
        return {
          ...item,
          targetCourseId: toCourseId,
          targetCourseName: toCourseName,
          status: toCourseId === 'graduate' ? 'GRADUATED' : toCourseId === 'stay' ? 'STAY' : 'PROMOTED'
        };
      }
      return item;
    }));
  };

  // Execute Batch Promotion
  const handleExecuteBatchPromotion = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.executeBatchPromotion({
        academicYear,
        targetYear,
        rules,
        autoUpgradeGroups,
        items: previewItems
      });
      setResultSummary({
        promotedCount: res.promotedCount || previewItems.filter(i => i.status === 'PROMOTED').length,
        graduatedCount: res.graduatedCount || previewItems.filter(i => i.status === 'GRADUATED').length,
        upgradedGroupsCount: res.upgradedGroupsCount || 0
      });
      setBatchStep(3);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تنفيذ الترقية الجماعية');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Individual Mode Handlers
  const filteredIndivStudents = indivStudents.filter((s: any) => {
    const q = indivSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.traineeCode?.toLowerCase().includes(q) ||
      s.currentCourseName?.toLowerCase().includes(q) ||
      s.currentGroupName?.toLowerCase().includes(q)
    );
  });

  const handleToggleSelectIndiv = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllIndiv = () => {
    if (selectedIds.length === filteredIndivStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIndivStudents.map((s: any) => s.traineeId));
    }
  };

  const handleExecuteIndivPromotion = async () => {
    if (selectedIds.length === 0) {
      alert('يرجى اختيار طالب واحد على الأقل للتصعيد');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = selectedIds.map(id => {
        const student = indivStudents.find((s: any) => s.traineeId === id);
        return {
          traineeId: id,
          action: customActionMap[id] || 'promote',
          targetYear,
          currentCourseId: student?.currentCourseId
        };
      });
      await api.executeBatchPromotion({
        academicYear,
        targetYear,
        autoCreateGroups,
        items: payload
      });
      alert('تم تصعيد وترقية الطلاب المحددين بنجاح! 🚀');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء ترقية الطلاب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">مركز ترقية وتصعيد الطلاب للعام الدراسي الجديد</h2>
              <p className="text-xs text-slate-400">الانتقال الشامل للصفوف والمراحل الدراسية الجديدة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMode('batch')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === 'batch' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                ترقية جماعية (حسب المقررات)
              </button>
              <button
                onClick={() => setMode('individual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === 'individual' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                ترقية وتصعيد فردي (بالطلاب)
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODE 1: BATCH PROMOTION */}
        {mode === 'batch' && (
          <div className="space-y-6">
            {/* Stepper Header */}
            <div className="flex items-center justify-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className={`flex items-center gap-2 text-xs font-bold ${batchStep === 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${batchStep === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'}`}>1</span>
                <span>تحديد القواعد والسنوات</span>
              </div>
              <span className="text-slate-700">←</span>
              <div className={`flex items-center gap-2 text-xs font-bold ${batchStep === 2 ? 'text-amber-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${batchStep === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'}`}>2</span>
                <span>المعاينة والتأكيد</span>
              </div>
              <span className="text-slate-700">←</span>
              <div className={`flex items-center gap-2 text-xs font-bold ${batchStep === 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${batchStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>3</span>
                <span>النتيجة والإنهاء</span>
              </div>
            </div>

            {/* Step 1: Rules & Academic Year */}
            {batchStep === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">العام الدراسي الحالي:</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">العام الدراسي الجديد للتصعيد:</label>
                    <input
                      type="text"
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">خطة الانتقال للمقررات والدورات:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {rules.map((rule) => (
                      <div key={rule.fromCourseId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-200">{rule.fromCourseName}</span>
                        <span className="text-xs text-amber-400 font-bold hidden sm:inline">← تنتقل إلى ←</span>
                        <select
                          value={rule.toCourseId}
                          onChange={(e) => handleRuleTargetChange(rule.fromCourseId, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-3 py-1.5 focus:outline-none"
                        >
                          <option value="graduate">🎓 تخرج وإتمام المرحلة</option>
                          <option value="stay">🛑 البقاء في نفس الصف</option>
                          {courses.filter(c => c.id !== rule.fromCourseId).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setBatchStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow"
                  >
                    <span>المعاينة والتأكيد</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preview & Confirm */}
            {batchStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">معاينة الترقية الجماعية ({previewItems.length} طالب):</span>
                  <input
                    type="text"
                    placeholder="بحث في المعاينة..."
                    value={batchSearch}
                    onChange={(e) => setBatchSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 divide-y divide-slate-800/60">
                  {previewItems.filter(i => !batchSearch || i.fullName.toLowerCase().includes(batchSearch.toLowerCase())).map((item) => (
                    <div key={item.traineeId} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.fullName}</span>
                        <span className="text-[10px] text-slate-400">{item.currentCourseName}</span>
                      </div>
                      <div className="text-left">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'GRADUATED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          item.status === 'STAY' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.targetCourseName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setBatchStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    رجوع للتعديل
                  </button>
                  <button
                    onClick={handleExecuteBatchPromotion}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'جاري تنفيذ الترقية...' : 'اعتماد وتنفيذ الترقية الجماعية الآن 🚀'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Result */}
            {batchStep === 3 && (
              <div className="text-center py-8 space-y-4 bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-emerald-300">تمت العملية بنجاح!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  تم تصعيد الطلاب وتحديث صفوفهم للعام الدراسي الجديد {targetYear} بنجاح.
                </p>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  إغلاق النافذة
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: INDIVIDUAL PROMOTION */}
        {mode === 'individual' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو الكود..."
                  value={indivSearch}
                  onChange={(e) => setIndivSearch(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllIndiv}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5"
                >
                  {selectedIds.length === filteredIndivStudents.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  <span>تحديد الكل ({filteredIndivStudents.length})</span>
                </button>
              </div>
            </div>

            {/* Student List Table */}
            <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 divide-y divide-slate-800/60">
              {filteredIndivStudents.map((s: any) => {
                const isSelected = selectedIds.includes(s.traineeId);
                const currentAction = customActionMap[s.traineeId] || 'promote';

                return (
                  <div key={s.traineeId} className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${isSelected ? 'bg-amber-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSelectIndiv(s.traineeId)}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-amber-400" /> : <Square className="w-5 h-5" />}
                      </button>
                      <div>
                        <span className="font-bold text-white block">{s.fullName}</span>
                        <span className="text-[10px] font-mono text-amber-400">{s.traineeCode} • {s.currentCourseName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={currentAction}
                        onChange={(e) => setCustomActionMap({ ...customActionMap, [s.traineeId]: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl px-2.5 py-1 focus:outline-none"
                      >
                        <option value="promote">🚀 تصعيد للصف التالي</option>
                        <option value="graduate">🎓 تخرج وإتمام المرحلة</option>
                        <option value="stay">🛑 بقاء في نفس الصف</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                المحدد: <strong className="text-amber-400">{selectedIds.length}</strong> من إجمالي {filteredIndivStudents.length} طالب
              </span>

              <button
                onClick={handleExecuteIndivPromotion}
                disabled={isSubmitting || selectedIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isSubmitting ? 'جاري المعالجة...' : 'تنفيذ ترقية الطلاب المحددين 🚀'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Export alias for backward compatibility
export const BatchPromotionModal = StudentPromotionModal;
