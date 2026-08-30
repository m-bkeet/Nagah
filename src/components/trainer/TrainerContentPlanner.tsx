import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Presentation,
  Upload,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Share2,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  HelpCircle,
  Lightbulb,
  Play,
  Send,
  Save,
  Download,
  RefreshCw,
  FileQuestion,
  Laptop,
  Globe,
  Wifi,
  AlertCircle,
  Check,
  BookOpen,
  Camera,
  Flame,
  UserCheck
} from 'lucide-react';
import { Trainer, Group, Course, CourseMaterial, CourseAssessment } from '../../types';
import { AIPresentationGenerator } from './AIPresentationGenerator';

interface TrainerContentPlannerProps {
  trainer: Trainer;
  groups: Group[];
  courses: Course[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshCourses?: () => void;
}

interface LessonSession {
  sessionNumber: number;
  weekNumber: number;
  proposedDate: string;
  title: string;
  theoreticalObjectives: string;
  practicalTask: string;
  assessmentType: string;
  isCompleted?: boolean;
}

interface MonthlyLessonPlan {
  courseName: string;
  educationType: string;
  totalHours: number;
  sessionsPerWeek: number;
  monthlyPlan: LessonSession[];
}

export const TrainerContentPlanner: React.FC<TrainerContentPlannerProps> = ({
  trainer,
  groups,
  courses,
  onShowToast,
  onRefreshCourses
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'lesson_plan' | 'ministry_wall' | 'paper_exams'>('slides');

  // Education Type State
  const [educationType, setEducationType] = useState<'arabic' | 'languages' | 'international' | 'general'>('arabic');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  // Lesson Plan Generator State
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [curriculumText, setCurriculumText] = useState('');
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedPlan, setGeneratedPlan] = useState<MonthlyLessonPlan | null>(null);

  // Ministry Link State
  const [ministryUrl, setMinistryUrl] = useState('');
  const [isSavingMinistryUrl, setIsSavingMinistryUrl] = useState(false);

  // Assessment to Social Wall Conversion State
  const [assessmentText, setAssessmentText] = useState('');
  const [assessmentTitle, setAssessmentTitle] = useState('تقييم الأسبوع الجاري');
  const [isConvertingAssessment, setIsConvertingAssessment] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<any[]>([]);

  // Paper Exams & Reminders State
  const [paperModelType, setPaperModelType] = useState<'A' | 'B' | 'unit_review' | 'monthly_exam'>('A');
  const [paperExamTitle, setPaperExamTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [paperReminders, setPaperReminders] = useState<any[]>([]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Update Ministry URL input when selected course changes
  React.useEffect(() => {
    if (selectedCourse) {
      setMinistryUrl(selectedCourse.ministryAssessmentUrl || '');
    }
  }, [selectedCourseId]);

  // Handle Generate Lesson Plan (8 Hours / Month = 2 sessions/week x 1 hr/session)
  const handleGenerateLessonPlan = async () => {
    if (!selectedCourse) {
      onShowToast('يرجى اختيار الدورة التدريبية أولاً', 'error');
      return;
    }
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/trainer/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: selectedCourse.name,
          curriculumText: curriculumText.trim(),
          educationType,
          grade: selectedCourse.grade || 'الصف الرابع الابتدائي',
          startDate: planStartDate
        })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
        onShowToast(' تم توليد خطة سير الدروس الشهرية (8 ساعات مقسمة على النتيجة) بنجاح وفق المواصفات العالمية!', 'success');
      } else {
        onShowToast(data.error || 'فشل توليد الخطة الزمنية', 'error');
      }
    } catch (err: any) {
      onShowToast('تعذر توليد الخطة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handle Save Ministry Link
  const handleSaveMinistryUrl = async () => {
    if (!selectedCourse) return;
    setIsSavingMinistryUrl(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ministryAssessmentUrl: ministryUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(' تم حفظ وتوثيق رابط تقييمات الوزارة المباشر ومزامنته مع جميع المجموعات والبوابات!', 'success');
        if (onRefreshCourses) onRefreshCourses();
      } else {
        onShowToast(data.error || 'فشل حفظ الرابط', 'error');
      }
    } catch (err: any) {
      onShowToast('فشل الاتصال بالخادم لحفظ الرابط', 'error');
    } finally {
      setIsSavingMinistryUrl(false);
    }
  };

  // Handle Convert Assessment to Interactive Wall Questions
  const handleConvertAssessmentToWall = async () => {
    if (!assessmentText.trim() && !assessmentTitle.trim()) {
      onShowToast('يرجى أدخال محتوى التقييم أو عنوانه لتمكين الذكاء الاصطناعي من تحويله', 'error');
      return;
    }
    setIsConvertingAssessment(true);
    try {
      const res = await fetch('/api/trainer/convert-assessment-to-wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentTitle,
          assessmentText,
          courseId: selectedCourse?.id,
          groupId: groups[0]?.id,
          trainerName: trainer.name
        })
      });
      const data = await res.json();
      if (data.success && data.dailyQuestions) {
        setDailyQuestions(data.dailyQuestions);
        onShowToast(' تم تحويل أسئلة التقييم الأسبوعي ونشرها فورياً على جدار المجتمع والنشاط الطلابي!', 'success');
      } else {
        onShowToast(data.error || 'فشل تحويل التقييم', 'error');
      }
    } catch (err) {
      onShowToast('تعذر الاتصال بالخادم لتحويل التقييم', 'error');
    } finally {
      setIsConvertingAssessment(false);
    }
  };

  // Handle Add Scheduled Reminder for Paper Exams / Reviews
  const handleAddPaperReminder = () => {
    if (!paperExamTitle.trim() || !reminderDate) {
      onShowToast('يرجى كتابة عنوان الاختبار واختيار تاريخ وتوقيت التنويه', 'error');
      return;
    }
    const newRem = {
      id: Date.now().toString(),
      title: paperExamTitle.trim(),
      modelType: paperModelType,
      reminderDate,
      courseName: selectedCourse?.name || 'الدورة',
      createdAt: new Date().toISOString()
    };
    setPaperReminders(prev => [newRem, ...prev]);
    setPaperExamTitle('');
    setReminderDate('');
    onShowToast(' تم تجهيز نموذج الاختبار وبرمجة تنبيه الذكاء الاصطناعي بنجاح وفق الخطة الزمنية!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Main Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-amber-300 shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>المساعد الذكي للمحتوى والدروس والتقييمات</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  AI Copilot
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                إعداد العروض التقديمية، تحويل الكتب، خطط السير (8 ساعات/شهر)، مزامنة روابط الوزارة والجدار التفاعلي.
              </p>
            </div>
          </div>

          {/* Education Type & Course Picker */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] text-amber-300 font-bold mb-1">نوع المسار التعليمي:</label>
              <select
                value={educationType}
                onChange={(e) => setEducationType(e.target.value as any)}
                className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-200 focus:outline-none"
              >
                <option value="arabic">🇪🇬 تعليم عربي (مناهج مصرية)</option>
                <option value="languages">🇬🇧 تعليم لغات (Language School)</option>
                <option value="international">🌐 تعليم دولي (International / IGCSE)</option>
                <option value="general">📚 مسار عام وتدريب حاسوبي</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-indigo-300 font-bold mb-1">الدورة التدريبية:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-200 focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('slides')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeSubTab === 'slides'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>العروض التقديمية والأنشطة (PowerPoint/PDF) 📽️</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lesson_plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeSubTab === 'lesson_plan'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>خطة سير الدروس التلقائية (8 ساعات/شهر) 📅</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ministry_wall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeSubTab === 'ministry_wall'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>رابط الوزارة وجدار التفاعل اليومي 🌐</span>
          </button>

          <button
            onClick={() => setActiveSubTab('paper_exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeSubTab === 'paper_exams'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>الاختبارات الورقية وتذكيرات الخطة 📝</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: PRESENTATION SLIDES & KAHOOT ACTIVITIES */}
      {activeSubTab === 'slides' && (
        <AIPresentationGenerator
          trainer={trainer}
          groups={groups}
          courses={courses}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB TAB 2: AUTOMATIC LESSON PLANNER (8 Hours / Month = 2 Sessions/Week x 1 Hr/Session) */}
      {activeSubTab === 'lesson_plan' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>مخطط سير الدروس والمحاضرات التلقائي بالذكاء الاصطناعي</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                نظام المعايير العالمية: الشهر يتكون من <span className="text-indigo-300 font-bold">8 ساعات دراسية</span> (ساعة كل محاضرة، يومان في الأسبوع).
              </p>
            </div>
            <button
              onClick={handleGenerateLessonPlan}
              disabled={isGeneratingPlan}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري صياغة الخطة الزمنية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد خطة الشهر الحالية (8 جلسات)</span>
                </>
              )}
            </button>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 font-bold mb-1">
                موضوعات ووحدات الكتاب المدرسي / المقرر (اختیاري للمزيد من الدقة):
              </label>
              <input
                type="text"
                placeholder="مثال: الوحدة الأولى: المستكشف النشط والأجهزة الرقمية، الوحدة الثانية: الأمن السيبراني والإنترنت..."
                value={curriculumText}
                onChange={(e) => setCurriculumText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">تاريخ بداية الشهر من النتيجة:</label>
              <input
                type="date"
                value={planStartDate}
                onChange={(e) => setPlanStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Display Generated Plan */}
          {generatedPlan ? (
            <div className="space-y-4">
              <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-300">الدورة:</span>
                  <span className="font-black text-white">{generatedPlan.courseName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300">نظام المواعيد:</span>
                  <span className="font-mono text-slate-200">2 محاضرة / أسبوعياً (1 ساعة / محاضرة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-300">إجمالي الشهر:</span>
                  <span className="font-black text-white">{generatedPlan.totalHours} ساعات حاسوبية</span>
                </div>
              </div>

              {/* Table of Sessions */}
              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-bold">رقم المحاضرة</th>
                      <th className="p-3 font-bold">الأسبوع والتاريخ المقترح</th>
                      <th className="p-3 font-bold">عنوان الدرس</th>
                      <th className="p-3 font-bold">الأهداف النظرية</th>
                      <th className="p-3 font-bold">التطبيق العملي حاسوبياً / شبكياً</th>
                      <th className="p-3 font-bold">نوع التقييم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {generatedPlan.monthlyPlan.map((s) => (
                      <tr key={s.sessionNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 font-mono font-black flex items-center justify-center text-xs border border-indigo-500/40">
                            {s.sessionNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">الأسبوع {s.weekNumber}</div>
                          <div className="text-[10px] font-mono text-slate-400">{s.proposedDate || 'حسب الجدول'}</div>
                        </td>
                        <td className="p-3 font-bold text-indigo-200">{s.title}</td>
                        <td className="p-3 text-slate-300 max-w-xs">{s.theoreticalObjectives}</td>
                        <td className="p-3 text-emerald-300 max-w-xs font-semibold flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span>{s.practicalTask}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                            {s.assessmentType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <Calendar className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-400">
                اضغط على زر "توليد خطة الشهر الحالية" لبناء خطة سير المحاضرات تلقائياً وفق تاريخ النتيجة المعتمد.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: MINISTRY LINKS & DAILY SOCIAL WALL QUESTIONS */}
      {activeSubTab === 'ministry_wall' && (
        <div className="space-y-6">
          {/* Section 1: Ministry Assessment Direct Link */}
          <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">رابط تقييمات الوزارة المباشر</h3>
                  <p className="text-xs text-slate-400">
                    رابط موقع الوزارة الرسمي لتقييمات دورة: <span className="text-teal-300 font-bold">{selectedCourse?.name}</span>
                  </p>
                </div>
              </div>
              {selectedCourse?.ministryAssessmentUrl && (
                <a
                  href={selectedCourse.ministryAssessmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white font-bold text-xs border border-teal-500/40 flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح الرابط المباشر للوزارة</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="ضع هنا رابط موقع الوزارة المباشر للتقييمات الأسبوعية (https://moe.gov.eg/...)"
                value={ministryUrl}
                onChange={(e) => setMinistryUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleSaveMinistryUrl}
                disabled={isSavingMinistryUrl}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-lg shadow-teal-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSavingMinistryUrl ? 'جاري الحفظ...' : 'حفظ ومزامنة فورية'}
              </button>
            </div>
          </div>

          {/* Section 2: Convert Assessment into Daily Questions on Student Interactive Wall */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <span>تحويل التقييم الأسبوعي لأسئلة تفاعلية يومية على جدار المجتمع الطلابي</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                يدخل الطالب يومياً على جدار المجتمع ليحل سؤال اليوم، يمنحه الذكاء الاصطناعي النقاط والشارات ويصدر تقريراً كاملاً بنهاية الأسبوع!
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">عنوان التقييم الأسبوعي:</label>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">نص أو أسئلة التقييم المرفوع من الوزارة / الكتاب:</label>
                <textarea
                  rows={3}
                  placeholder="انسخ نص أسئلة التقييم الأسبوعي هنا أو صوره ليتولى مساعد المدرب تحويله إلى 5 أسئلة يومية تفاعلية..."
                  value={assessmentText}
                  onChange={(e) => setAssessmentText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleConvertAssessmentToWall}
                  disabled={isConvertingAssessment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isConvertingAssessment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري تحويل التقييم ونشره...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تحويل لنشاط يومي ونشر على جدار المجتمع</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Daily Questions Preview */}
            {dailyQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>الأسئلة اليومية المنشورة على جدار التفاعل ({dailyQuestions.length} سؤال):</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dailyQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">{q.dayLabel}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          +{q.points || 20} نقطة
                        </span>
                      </div>
                      <p className="text-xs text-slate-100 font-bold">{q.question}</p>
                      <div className="text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-bold">الإجابة الصحيحة: </span>
                        {q.correctAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 4: PAPER EXAM MODELS & SCHEDULED REMINDERS */}
      {activeSubTab === 'paper_exams' && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-purple-400" />
              <span>نماذج الاختبارات الورقية وتنبيهات الخطة الزمنية المجدولة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تصوير وتجهيز نموذج أ، نموذج ب، ومراجعات الوحدات مع برمجة إشعارات تذكير قبل موعد المحاضرة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">نوع النموذج / المراجعة:</label>
              <select
                value={paperModelType}
                onChange={(e) => setPaperModelType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="A">نموذج (أ) - اختبار ورقي</option>
                <option value="B">نموذج (ب) - اختبار ورقي</option>
                <option value="unit_review">مراجعة وحدة من الكتاب المدرسي</option>
                <option value="monthly_exam">اختبار الشهر التراكمي الشامل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">عنوان النموذج / المراجعة:</label>
              <input
                type="text"
                placeholder="مثال: مراجعة الوحدتين الأولى والثانية - نموذج أ"
                value={paperExamTitle}
                onChange={(e) => setPaperExamTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">تاريخ ووقت التنبيه والنشر:</label>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddPaperReminder}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>جدولة التنبيه والجاهزية للنشر</span>
            </button>
          </div>

          {/* List of Scheduled Reminders */}
          {paperReminders.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>نماذج الاختبارات والتنويهات المجدولة ({paperReminders.length}):</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paperReminders.map(rem => (
                  <div key={rem.id} className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          {rem.modelType === 'A' ? 'نموذج أ' : rem.modelType === 'B' ? 'نموذج ب' : 'مراجعة وحدة'}
                        </span>
                        <h5 className="font-bold text-xs text-white">{rem.title}</h5>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        موعد التنبيه: <span className="font-mono text-amber-300">{rem.reminderDate.replace('T', ' ')}</span>
                      </p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" title="التنبيه نشط" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
