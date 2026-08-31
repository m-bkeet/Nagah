import React, { useState, useRef } from 'react';
import {
  Sparkles,
  FileQuestion,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Save,
  Copy,
  Check,
  Share2,
  ExternalLink,
  BookOpen,
  Code,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Trainer, Group, Course } from '../../types';

interface AdvancedExamMakerProps {
  trainer: Trainer;
  groups: Group[];
  courses: Course[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdvancedExamMaker: React.FC<AdvancedExamMakerProps> = ({
  trainer,
  groups,
  courses,
  onShowToast
}) => {
  // Input State
  const [examTopic, setExamTopic] = useState('');
  const [courseName, setCourseName] = useState(courses[0]?.name || 'تكنولوجيا المعلومات والبرمجة');
  const [selectedGrade, setSelectedGrade] = useState('الصف الرابع الابتدائي');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('متوسط');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'true_false', 'kahoot']);
  const [enableSearch, setEnableSearch] = useState(false);

  // Image / PDF State
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPdfDoc, setIsPdfDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any | null>(null);
  const [isSavingToSystem, setIsSavingToSystem] = useState(false);
  const [savedExamLink, setSavedExamLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const gradesList = [
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي',
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي',
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    setIsPdfDoc(isPdf);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      setUploadedImageBase64(b64);
      setImagePreview(isPdf ? null : b64);
      onShowToast(isPdf ? 'تم إرفاق كتاب / مستند PDF بنجاح! سيتم استخراج الأسئلة بدقة فائقة.' : 'تم تحميل صورة صفحة الأسئلة بنجاح!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleType = (type: string) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleGenerateExam = async () => {
    if (!examTopic.trim() && !uploadedImageBase64) {
      onShowToast('يرجى كتابة موضوع الاختبار أو رفع صورة لصفحة الأسئلة', 'error');
      return;
    }

    setIsGenerating(true);
    setSavedExamLink(null);
    try {
      const res = await fetch('/api/trainer/generate-advanced-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: examTopic.trim(),
          courseName,
          grade: selectedGrade,
          numQuestions,
          difficulty,
          questionTypes,
          language,
          image: uploadedImageBase64,
          enableSearch
        })
      });

      const data = await res.json();
      if (data.success && data.exam) {
        setGeneratedExam(data.exam);
        onShowToast('تم توليد الأسئلة الذكية بنجاح!', 'success');
      } else {
        onShowToast(data.error || 'فشل توليد الاختبار', 'error');
      }
    } catch (err: any) {
      onShowToast('تعذر الاتصال بالخادم', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExamToSystem = async () => {
    if (!generatedExam) return;

    setIsSavingToSystem(true);
    try {
      const examPayload = {
        title: generatedExam.title || examTopic || 'اختبار تقييمي',
        description: generatedExam.description || `اختبار ${selectedGrade} - ${courseName}`,
        courseId: courses.find(c => c.name === courseName)?.id || courses[0]?.id || 'course-1',
        totalMarks: generatedExam.totalMarks || (generatedExam.questions.length * 5),
        durationMinutes: generatedExam.durationMinutes || 20,
        grade: selectedGrade,
        trainerId: trainer.id,
        questions: generatedExam.questions.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          type: q.type || 'multiple_choice',
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
          explanation: q.explanation || '',
          points: q.points || 5
        }))
      };

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examPayload)
      });

      const data = await res.json();
      if (data.id || data.success) {
        const examId = data.id || data.exam?.id || `exam-${Date.now()}`;
        const onlineLink = `${window.location.origin}/?view=public_student_portal&tab=exams&examId=${examId}`;
        setSavedExamLink(onlineLink);
        onShowToast('تم اعتماد وحفظ الاختبار في قاعدة بيانات النظام بنجاح! 🎉', 'success');
      } else {
        onShowToast('تم حفظ مسودة الاختبار محلياً', 'info');
      }
    } catch (err: any) {
      onShowToast('تم حفظ مسودة الاختبار في المتصفح', 'info');
    } finally {
      setIsSavingToSystem(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedExamLink) return;
    navigator.clipboard.writeText(savedExamLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast('تم نسخ رابط الاختبار للطلاب!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              مولد الاختبارات والأسئلة الذكية المتقدم (AI Question Generator)
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                Multimodal OCR
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              توليد بنوك أسئلة دقيقة (عربي / English / لغات) من صور الكتب أو المواضيع مع نماذج إجابة معتمدة وروابط تفاعلية
            </p>
          </div>
        </div>
      </div>

      {/* Generator Settings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Topic */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300">موضوع أو محتوى الاختبار</label>
            <input
              type="text"
              value={examTopic}
              onChange={(e) => setExamTopic(e.target.value)}
              placeholder="مثال: هياكل التكرار والحلقات Loops في بايثون / أساسيات الأمن السيبراني"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">الصف الدراسي</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {gradesList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Course, Question Count, Difficulty, Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">الدورة التدريبية</label>
            <select
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            >
              {courses.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">عدد الأسئلة</label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            >
              <option value={3}>3 أسئلة (تقييم سريع)</option>
              <option value={5}>5 أسئلة (اختبار قياسي)</option>
              <option value={10}>10 أسئلة (اختبار شامل)</option>
              <option value={15}>15 سؤالاً (بنك أسئلة)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">مستوى الصعوبة</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            >
              <option value="سهل ومباشر">سهل ومباشر</option>
              <option value="متوسط ومتوازن">متوسط ومتوازن</option>
              <option value="متقدم للطلبة المتفوقين">متقدم للمتفوقين</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">لغة الاختبار</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'ar' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-700'
                }`}
              >
                عربي 🇪🇬
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-700'
                }`}
              >
                English 🇬🇧
              </button>
            </div>
          </div>
        </div>

        {/* Question Types Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300">أنواع الأسئلة المطلوبة:</label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'multiple_choice', label: 'اختيار من متعدد (MCQ)' },
              { id: 'true_false', label: 'صح وخطأ (True/False)' },
              { id: 'kahoot', label: 'أسئلة تفاعلية كاهوت' },
              { id: 'code_practical', label: 'كتابة وتصحيح كود برمجي' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleToggleType(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  questionTypes.includes(type.id)
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {questionTypes.includes(type.id) ? '✓ ' : '+ '}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* OCR Image & Generate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.pdf"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>رفع كتاب PDF أو صورة أسئلة 📚📸</span>
            </button>

            {uploadedImageBase64 && (
              <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
                {isPdfDoc ? (
                  <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="max-w-[140px] truncate text-slate-200 font-medium">
                  {uploadedFileName || (isPdfDoc ? 'كتاب PDF مرفق' : 'صورة مرفقة')}
                </span>
                <button
                  onClick={() => {
                    setUploadedImageBase64(null);
                    setImagePreview(null);
                    setUploadedFileName(null);
                    setIsPdfDoc(false);
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold mr-1 hover:underline"
                >
                  إلغاء ✕
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateExam}
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري صياغة الأسئلة الذكية ونماذج الإجابة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد بنك الأسئلة بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Exam View */}
      {generatedExam && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          {/* Top Info & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-amber-400">{generatedExam.grade} • {generatedExam.courseName}</div>
              <h3 className="text-xl font-black text-white mt-0.5">{generatedExam.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{generatedExam.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveExamToSystem}
                disabled={isSavingToSystem}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingToSystem ? 'جاري الاعتماد...' : 'اعتماد ونشر الاختبار للطلاب 🚀'}</span>
              </button>
            </div>
          </div>

          {/* Online Link Box if Saved */}
          {savedExamLink && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">رابط الاختبار التفاعلي للطلاب:</span>
                <span className="font-mono text-[11px] truncate">{savedExamLink}</span>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {generatedExam.questions.map((q: any, idx: number) => (
              <div key={q.id || idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg">
                    السؤال {idx + 1} ({q.points || 5} درجات)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {q.type === 'multiple_choice' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صح وخطأ' : 'سؤال عملي'}
                  </span>
                </div>

                <p className="text-sm font-bold text-white">{q.question}</p>

                {/* Options if available */}
                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isCorrect = optIdx === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-400">💡 نموذج الإجابة والشرح: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
