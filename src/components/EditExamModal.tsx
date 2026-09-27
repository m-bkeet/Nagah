import React, { useState, useEffect } from 'react';
import { 
  X, Save, BookOpen, Users, Clock, Award, CheckCircle2, 
  ShieldAlert, Settings, Sparkles, Sliders, Shield, AlertCircle,
  FileText, HelpCircle, Layers, Check, Zap, Eye
} from 'lucide-react';
import { Exam, Course, Group, ExamPolicyConfig } from '../types';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';

interface EditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  courses: Course[];
  groups: Group[];
  onExamUpdated: (updatedExam: Exam) => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  courses,
  groups,
  onExamUpdated
}) => {
  const { showToast } = useCenter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'policy' | 'advanced'>('general');

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(60);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [examType, setExamType] = useState<string>('practical');
  const [examMode, setExamMode] = useState<'online' | 'lab'>('lab');
  const [status, setStatus] = useState<'scheduled' | 'active' | 'completed' | 'archived'>('scheduled');
  const [instructions, setInstructions] = useState('');
  
  // Policy State
  const [policy, setPolicy] = useState<ExamPolicyConfig>({
    shuffleQuestions: true,
    shuffleOptions: true,
    lockdownLabMode: true,
    blockInternet: true,
    disableCopyPaste: true,
    maxViolationsAllowed: 3,
    autoSaveIntervalSeconds: 10,
    instantResults: true,
    issueCertificateOnPass: true,
    sendParentNotification: true,
    proctorCode: 'NAGAH-2026'
  });

  useEffect(() => {
    if (exam) {
      setTitle(exam.title || '');
      setCourseId(exam.courseId || '');
      setGroupId(exam.groupId || '');
      setTotalMarks(Number(exam.totalMarks) || 100);
      setPassingMarks(Number(exam.passingMarks) || 60);
      setDurationMinutes(Number(exam.durationMinutes) || 45);
      setExamType(exam.examType || 'practical');
      setExamMode(exam.examMode || 'lab');
      setStatus(exam.status || 'scheduled');
      setInstructions(exam.instructions || '');
      if (exam.policy) {
        setPolicy({
          ...policy,
          ...exam.policy
        });
      }
    }
  }, [exam]);

  if (!isOpen || !exam) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى إدخال عنوان الاختبار', 'error');
      return;
    }
    if (!courseId) {
      showToast('يرجى اختيار الدورة التدريبية', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload: Partial<Exam> = {
        title: title.trim(),
        courseId,
        groupId: groupId || undefined,
        totalMarks: Number(totalMarks) || 100,
        passingMarks: Number(passingMarks) || 60,
        durationMinutes: Number(durationMinutes) || 45,
        examType: examType as any,
        examMode,
        status,
        instructions: instructions.trim(),
        policy
      };

      const res = await api.updateExam(exam.id, updatePayload);
      if (res && res.exam) {
        showToast('تم تحديث بيانات الاختبار بنجاح! ✨', 'success');
        onExamUpdated(res.exam);
        onClose();
      } else {
        // Fallback for mock/local updates
        const updatedLocal: Exam = {
          ...exam,
          ...updatePayload
        } as Exam;
        showToast('تم حفظ تعديلات الاختبار بنجاح! ✨', 'success');
        onExamUpdated(updatedLocal);
        onClose();
      }
    } catch (err: any) {
      console.error('Update exam error:', err);
      showToast(err.message || 'فشل حفظ تعديلات الاختبار', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGroups = groups.filter(g => !courseId || g.courseId === courseId);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                تعديل وتخصيص بيانات الاختبار
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تعديل العنوان، المادة، المجموعة، الدرجات، الإجراءات الأمنية وسياسات التقييم
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>البيانات الأساسية والدرجات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'policy'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>الأمان ومنع الغش والشهادات</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                  عنوان / اسم الاختبار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: الاختبار النصفي لمادة ICT - الأسبوع الرابع"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs sm:text-sm"
                />
              </div>

              {/* Course & Group Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                    المادة / البرنامج التدريبي <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="">-- اختر الدورة التدريبية --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                    المجموعة المخصصة (اختياري)
                  </label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="">جميع مجموعات الدورة (متاح عام)</option>
                    {filteredGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marks & Timing Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                    الدرجة العظمى (المجموع)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                    درجة النجاح الدنيا
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalMarks}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px]">
                    مدة الاختبار (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-center"
                  />
                </div>
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                    حالة الاختبار
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="scheduled">📅 مجدول (قادم)</option>
                    <option value="active">🟢 نشط ومتاح للحل</option>
                    <option value="completed">🏁 مكتمل ومغلق</option>
                    <option value="archived">📦 مؤرشف</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                    نوع الاختبار
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="practical">عملي تطبيقي</option>
                    <option value="theoretical">نظري وأسئلة اختيارية</option>
                    <option value="coding">برمجي وتحديات كود</option>
                    <option value="midterm">اختبار نصفي</option>
                    <option value="final">اختبار نهائي شامل</option>
                    <option value="quiz">كويز سريع</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                    نمط التقديم
                  </label>
                  <select
                    value={examMode}
                    onChange={(e) => setExamMode(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="online">🌐 أونلاين عبر الرابط العام</option>
                    <option value="lab">💻 معمل المركز (Kiosk Mode)</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                  تعليمات وتوجيهات الاختبار للطلاب
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="اكتب التوجيهات التي تظهر للطالب قبل بدء الحل..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>إعدادات الذكاء ومنع الغش والتكريم التلقائي للناجحين</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Shuffle Questions */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">تبديل ترتيب الأسئلة عشوائياً</p>
                    <p className="text-[10px] text-slate-500">ترتيب مختلف لكل طالب لمنع النقل</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.shuffleQuestions}
                    onChange={(e) => setPolicy({ ...policy, shuffleQuestions: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>

                {/* Shuffle Options */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">تبديل اختيارات الأسئلة</p>
                    <p className="text-[10px] text-slate-500">خلط الاختيارات المتعددة (A, B, C, D)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.shuffleOptions}
                    onChange={(e) => setPolicy({ ...policy, shuffleOptions: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>

                {/* Instant Results */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">عرض النتيجة فور التسليم</p>
                    <p className="text-[10px] text-slate-500">إظهار الدرجة والتقييم للطالب فوراً</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.instantResults}
                    onChange={(e) => setPolicy({ ...policy, instantResults: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>

                {/* Issue Certificate On Pass */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">إصدار شهادة تميز فورية للناجحين</p>
                    <p className="text-[10px] text-slate-500">منح شهادة تفوق رقمية معتمدة برمز QR</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.issueCertificateOnPass}
                    onChange={(e) => setPolicy({ ...policy, issueCertificateOnPass: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>

                {/* Disable Copy Paste */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">تعطيل النسخ واللصق (Anti-Cheat)</p>
                    <p className="text-[10px] text-slate-500">حظر النسخ من محركات البحث أو خارج الصفحة</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.disableCopyPaste}
                    onChange={(e) => setPolicy({ ...policy, disableCopyPaste: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>

                {/* Lockdown Lab Mode */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">مراقبة مغادرة التبويب</p>
                    <p className="text-[10px] text-slate-500">تسجيل مخالفة عند التبديل إلى نافذة أخرى</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policy.lockdownLabMode}
                    onChange={(e) => setPolicy({ ...policy, lockdownLabMode: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Proctor Code */}
              <div className="pt-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">
                  رمز مرور المراقب (لفتح القفل في المعمل)
                </label>
                <input
                  type="text"
                  value={policy.proctorCode || 'NAGAH-2026'}
                  onChange={(e) => setPolicy({ ...policy, proctorCode: e.target.value })}
                  placeholder="رمز المرور..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات وتحديث الاختبار ✨'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
