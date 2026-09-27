import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  HelpCircle,
  Eye,
  Save,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Check,
  RefreshCw
} from 'lucide-react';
import { Exam, ExamQuestion } from '../types';
import { api } from '../services/api';
import { ICT_CURRICULUM_DATA, getCurriculumExamQuestions } from '../data/ictCurriculumQuestions';

interface ExamQuestionsEditorModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onQuestionsUpdated: () => void;
  onLaunchStudentPreview: (exam: Exam) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ExamQuestionsEditorModal: React.FC<ExamQuestionsEditorModalProps> = ({
  exam,
  isOpen,
  onClose,
  onQuestionsUpdated,
  onLaunchStudentPreview,
  showToast
}) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Question Form State (for adding or editing)
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'mcq' | 'true_false' | 'short_answer'>('mcq');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState<number>(10);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Exam Meta Settings Edit
  const [isEditingExamMeta, setIsEditingExamMeta] = useState(false);
  const [examTitle, setExamTitle] = useState(exam.title);
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 30);
  const [totalMarks, setTotalMarks] = useState(exam.totalMarks || 100);
  const [passingMarks, setPassingMarks] = useState(exam.passingMarks || 60);
  const [instructions, setInstructions] = useState(exam.instructions || '');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // Curriculum Fast-Load State
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('ict-primary-6-ar');

  useEffect(() => {
    if (isOpen && exam) {
      loadQuestions();
      setExamTitle(exam.title);
      setDurationMinutes(exam.durationMinutes || 30);
      setTotalMarks(exam.totalMarks || 100);
      setPassingMarks(exam.passingMarks || 60);
      setInstructions(exam.instructions || '');
    }
  }, [isOpen, exam]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const fetched = await api.getExamQuestions(exam.id).catch(() => []);
      if (Array.isArray(fetched) && fetched.length > 0) {
        setQuestions(fetched);
      } else {
        // Fallback to curriculum questions if empty
        const initial = getCurriculumExamQuestions('سادس', 'ar', exam.id);
        setQuestions(initial);
      }
    } catch (e) {
      setQuestions(getCurriculumExamQuestions('سادس', 'ar', exam.id));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setQuestionType('mcq');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setExplanation('');
    setMarks(10);
    setIsAddingNew(false);
  };

  const handleStartEdit = (q: ExamQuestion) => {
    setEditingQuestionId(q.id);
    setIsAddingNew(false);
    setQuestionText(q.questionText);
    setQuestionType((q.questionType as any) || 'mcq');
    setOptions(q.options && q.options.length > 0 ? [...q.options] : ['', '', '', '']);
    setCorrectAnswer(q.correctAnswer || '');
    setExplanation(q.explanation || '');
    setMarks(q.marks || 10);
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      showToast('يرجى كتابة نص السؤال', 'error');
      return;
    }

    if (questionType === 'mcq') {
      const validOpts = options.filter(o => o.trim().length > 0);
      if (validOpts.length < 2) {
        showToast('يرجى إدخال خيارين على الأقل لسؤال الاختيار من متعدد', 'error');
        return;
      }
      if (!correctAnswer.trim()) {
        showToast('يرجى تحديد الإجابة الصحيحة من الخيارات', 'error');
        return;
      }
    }

    if (questionType === 'true_false' && !correctAnswer.trim()) {
      showToast('يرجى تحديد ما إذا كانت العبارة صحيحة أم خاطئة', 'error');
      return;
    }

    try {
      const questionPayload: Partial<ExamQuestion> = {
        questionType,
        questionText: questionText.trim(),
        options: questionType === 'mcq' ? options.filter(o => o.trim().length > 0) : (questionType === 'true_false' ? ['صح', 'خطأ'] : []),
        correctAnswer: correctAnswer.trim(),
        explanation: explanation.trim(),
        marks: Number(marks) || 10
      };

      if (editingQuestionId) {
        await api.updateExamQuestion(exam.id, editingQuestionId, questionPayload);
        setQuestions(prev => prev.map(q => q.id === editingQuestionId ? { ...q, ...questionPayload } : q));
        showToast('تم تعديل السؤال بنجاح ✅', 'success');
      } else {
        const res = await api.addExamQuestion(exam.id, questionPayload);
        const newQ: ExamQuestion = res.question || {
          id: 'q-' + Date.now(),
          examId: exam.id,
          ...questionPayload
        } as ExamQuestion;
        setQuestions(prev => [...prev, newQ]);
        showToast('تمت إضافة السؤال الجديد للاختبار ✅', 'success');
      }

      resetForm();
      onQuestionsUpdated();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ السؤال', 'error');
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال من الاختبار؟')) return;
    try {
      await api.deleteExamQuestion(exam.id, qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
      showToast('تم حذف السؤال من الاختبار', 'info');
      onQuestionsUpdated();
    } catch (e: any) {
      showToast('فشل حذف السؤال', 'error');
    }
  };

  const handleImportCurriculumQuestions = async () => {
    const pkg = ICT_CURRICULUM_DATA.find(p => p.id === selectedCurriculumId);
    if (!pkg) return;

    if (questions.length > 0 && !window.confirm(`هل ترغب في استيراد أسئلة منهج (${pkg.grade} - ${pkg.subjectName})؟ ستضاف الأسئلة للاختبار الحالي.`)) {
      return;
    }

    try {
      const newItems: ExamQuestion[] = pkg.questions.map((q, idx) => ({
        ...q,
        id: `q-imp-${Date.now()}-${idx}`,
        examId: exam.id
      }));

      for (const item of newItems) {
        await api.addExamQuestion(exam.id, item).catch(() => {});
      }

      setQuestions(prev => [...prev, ...newItems]);
      showToast(`تم استيراد ${newItems.length} سؤالاً بنجاح من منهج تكنولوجيا المعلومات الوزاري! 📚✨`, 'success');
      onQuestionsUpdated();
    } catch (e) {
      showToast('خطأ أثناء استيراد الأسئلة', 'error');
    }
  };

  const handleSaveExamMeta = async () => {
    if (!examTitle.trim()) {
      showToast('عنوان الاختبار مطلوب', 'error');
      return;
    }
    setIsSavingMeta(true);
    try {
      await api.updateExam(exam.id, {
        title: examTitle.trim(),
        durationMinutes: Number(durationMinutes) || 30,
        totalMarks: Number(totalMarks) || 100,
        passingMarks: Number(passingMarks) || 60,
        instructions: instructions.trim()
      });
      showToast('تم تحديث إعدادات وبيانات الاختبار بنجاح ✅', 'success');
      setIsEditingExamMeta(false);
      onQuestionsUpdated();
    } catch (e: any) {
      showToast('فشل تحديث بيانات الاختبار', 'error');
    } finally {
      setIsSavingMeta(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="shrink-0 p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  معاينة وتعديل أسئلة الاختبار 📝
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white">
                  {questions.length} أسئلة
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {examTitle} • ({durationMinutes} دقيقة | الدرجة الكلية: {totalMarks})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Student Preview Button */}
            <button
              onClick={() => {
                onClose();
                onLaunchStudentPreview(exam);
              }}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-400/30 transition-all cursor-pointer"
              title="تجربة الاختبار في وضع الطالب"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة كطالب (تجريبي) 🎓</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader / Exam Meta & Curriculum Importer Bar */}
        <div className="shrink-0 bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingExamMeta(!isEditingExamMeta)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEditingExamMeta ? 'إغلاق تعديل الإعدادات' : 'تعديل زمن ودرجات الاختبار ⚙️'}</span>
              {isEditingExamMeta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsAddingNew(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال جديد ✍️</span>
            </button>
          </div>

          {/* Ministry Curriculum Quick Import */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              استيراد من مناهج تكنولوجيا الوزارة:
            </span>
            <select
              value={selectedCurriculumId}
              onChange={e => setSelectedCurriculumId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold focus:outline-none"
            >
              {ICT_CURRICULUM_DATA.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.grade} ({pkg.questions.length} أسئلة)
                </option>
              ))}
            </select>
            <button
              onClick={handleImportCurriculumQuestions}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              title="إضافة أسئلة هذا المنهج إلى الاختبار الحالي"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              <span>استيراد</span>
            </button>
          </div>
        </div>

        {/* Collapsible Exam Settings Panel */}
        {isEditingExamMeta && (
          <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-slate-800/90 border-b border-blue-100 dark:border-slate-700 space-y-4 animate-in slide-in-from-top duration-150">
            <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <span>تعديل إعدادات وسياسات الاختبار</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الاختبار:</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الزمن (بالدقائق):</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الدرجة الكلية:</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={e => setTotalMarks(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">درجة النجاح:</label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={e => setPassingMarks(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">تعليمات الاختبار للطالب:</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={2}
                placeholder="أدخل تعليمات وإرشادات الاختبار التي تظهر للطالب..."
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingExamMeta(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveExamMeta}
                disabled={isSavingMeta}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingMeta ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Question Add / Edit Form Panel */}
        {(isAddingNew || editingQuestionId) && (
          <div className="p-4 sm:p-5 bg-indigo-50/70 dark:bg-slate-800/95 border-b border-indigo-100 dark:border-slate-700 space-y-4 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <span>{editingQuestionId ? 'تعديل السؤال المحدد' : 'إضافة سؤال جديد إلى الاختبار'}</span>
              </h4>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نص السؤال *</label>
                <textarea
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  rows={2}
                  placeholder="مثال: أي من أجهزة الشبكة التالية يقوم بإرسال البيانات لجهاز محدد؟"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع السؤال</label>
                  <select
                    value={questionType}
                    onChange={e => {
                      const newType = e.target.value as any;
                      setQuestionType(newType);
                      if (newType === 'true_false') {
                        setOptions(['صح', 'خطأ']);
                        setCorrectAnswer('صح');
                      } else if (newType === 'mcq') {
                        setOptions(['', '', '', '']);
                        setCorrectAnswer('');
                      }
                    }}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="mcq">اختيار من متعدد (MCQ)</option>
                    <option value="true_false">صواب أو خطأ (صح/خطأ)</option>
                    <option value="short_answer">سؤال مقالي / قصير</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">درجة السؤال</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={e => setMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Options Input for MCQ */}
            {questionType === 'mcq' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  خيارات الإجابة (اختر الدائرة بجانب الإجابة الصحيحة):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="radio"
                        name="correctAnswerSelect"
                        checked={correctAnswer === opt && opt.trim().length > 0}
                        onChange={() => setCorrectAnswer(opt)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="تحديد هذه الإجابة كإجابة نموذجية صحيحة"
                      />
                      <input
                        type="text"
                        placeholder={`الخيار ${idx + 1}`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...options];
                          const oldVal = newOpts[idx];
                          newOpts[idx] = e.target.value;
                          setOptions(newOpts);
                          if (correctAnswer === oldVal) {
                            setCorrectAnswer(e.target.value);
                          }
                        }}
                        className="flex-1 text-xs bg-transparent border-0 focus:outline-none font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False Selection */}
            {questionType === 'true_false' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الإجابة الصحيحة للعبارة:
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="tf_answer"
                      value="صح"
                      checked={correctAnswer === 'صح'}
                      onChange={() => setCorrectAnswer('صح')}
                      className="text-emerald-600"
                    />
                    <span>صح (True)</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer text-xs font-bold">
                    <input
                      type="radio"
                      name="tf_answer"
                      value="خطأ"
                      checked={correctAnswer === 'خطأ'}
                      onChange={() => setCorrectAnswer('خطأ')}
                      className="text-red-600"
                    />
                    <span>خطأ (False)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Short Answer Exact Target */}
            {questionType === 'short_answer' && (
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  الإجابة النموذجية أو الكلمات المفتاحية:
                </label>
                <input
                  type="text"
                  placeholder="مثال: <p> أو المحول أو Switch"
                  value={correctAnswer}
                  onChange={e => setCorrectAnswer(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شرح توضيحي للإجابة (يظهر للطالب بعد التسليم):
              </label>
              <input
                type="text"
                placeholder="مثال: المحول جهاز شبكي يرسل البيانات فقط إلى الجهاز المعني."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ السؤال في الاختبار ✅</span>
              </button>
            </div>
          </div>
        )}

        {/* Questions List Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">جاري تحميل أسئلة الاختبار...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد أسئلة في هذا الاختبار بعد!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  يمكنك إضافة أسئلة يدوياً أو استيراد حزمة أسئلة منهج تكنولوجيا المعلومات والاتصالات المعتمدة بضغطة زر واحدة.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول سؤال</span>
                </button>
                <button
                  onClick={handleImportCurriculumQuestions}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>استيراد أسئلة الصف السادس ICT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    editingQuestionId === q.id
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
                          {q.questionType === 'mcq' && 'اختيار من متعدد 🔘'}
                          {q.questionType === 'true_false' && 'صواب أو خطأ ⚖️'}
                          {q.questionType === 'short_answer' && 'سؤال مقالي / قصير 📝'}
                          {q.questionType === 'coding' && 'تحدي عملي 💻'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                          {q.marks || 10} درجات
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-1">
                        {q.questionText}
                      </h4>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
                        title="تعديل هذا السؤال"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
                        title="حذف هذا السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options List */}
                  {q.questionType === 'mcq' && q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-750">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False or Short Answer Display */}
                  {q.questionType !== 'mcq' && q.correctAnswer && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">الإجابة النموذجية:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        {q.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Explanation preview */}
                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-2">
                      💡 التوضيح: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            إجمالي درجات الأسئلة: <span className="font-bold text-slate-800 dark:text-white">{questions.reduce((sum, q) => sum + (q.marks || 10), 0)} درجة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLaunchStudentPreview(exam);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة كطالب الآن 👁️</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
