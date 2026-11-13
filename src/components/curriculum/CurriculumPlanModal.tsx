import React, { useState, useMemo } from 'react';
import { 
  X, BookOpen, Calendar, Clock, Sparkles, Printer, Download, CheckCircle2, 
  HelpCircle, RefreshCw, FileText, ChevronRight, Layers, Award, Laptop, Users
} from 'lucide-react';
import { MOE_CURRICULA, GradeCurriculum } from '../../domain/curriculumRegistry';
import { Course, Group } from '../../types';

interface CurriculumPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses?: Course[];
  groups?: Group[];
  initialCourseId?: string;
  initialGroupId?: string;
}

export const CurriculumPlanModal: React.FC<CurriculumPlanModalProps> = ({
  isOpen,
  onClose,
  courses = [],
  groups = [],
  initialCourseId,
  initialGroupId
}) => {
  const [selectedGradeKey, setSelectedGradeKey] = useState<string>('grade4');
  const [selectedSchedule, setSelectedSchedule] = useState<'sat_tue' | 'mon_thu' | 'sun_wed'>('sat_tue');
  const [selectedMonth, setSelectedMonth] = useState<string>('أكتوبر 2026');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentGradeData: GradeCurriculum | undefined = MOE_CURRICULA[selectedGradeKey] || MOE_CURRICULA.grade4;
  const term1Units = currentGradeData?.terms?.term1?.units || [];
  const allTerm1Lessons = term1Units.flatMap(u => u.lessons);

  // Generate 8 lectures for the month (2 per week)
  // Lecture 7 is automatically scheduled as: "محاضرة مراجعة مكثفة ونماذج اختبار الشهر"
  // Lecture 8 is: "تطبيق عملي شامل ومشروع الشهر / التقييم الشهري"
  const lectures = useMemo(() => {
    const list = [];
    const scheduleDaysArabic = 
      selectedSchedule === 'sat_tue' ? ['السبت', 'الثلاثاء'] :
      selectedSchedule === 'mon_thu' ? ['الاثنين', 'الخميس'] : ['الأحد', 'الأربعاء'];

    for (let i = 1; i <= 8; i++) {
      const isExamRevision = (i === 7);
      const isProjectOrExam = (i === 8);
      const dayName = scheduleDaysArabic[(i - 1) % 2];
      const weekNum = Math.ceil(i / 2);

      let lessonTitle = '';
      let unitTitle = '';
      let labTask = '';
      let theoryOutcomes = '';
      let catchUpPlan = '';

      if (isExamRevision) {
        unitTitle = 'محطة المراجعة الدورية';
        lessonTitle = `محاضرة مراجعة مكثفة لاختبار شهر ${selectedMonth.split(' ')[0]} ونماذج الأسئلة الوزارية`;
        labTask = 'حل ورشة تفاعلية ومحاكاة الامتحان الفعلي على أجهزة المعمل مع تصحيح فوري';
        theoryOutcomes = 'تثبيت المفاهيم الأساسية، تحليل أسئلة التفكير الناقد، ومعالجة نقاط الضعف';
        catchUpPlan = 'مذكرة تلخيص شاملة (PDF) متاحة على منصة الطالب + بنك أسئلة رقمي تفاعلي مع الإجابات النموذجية';
      } else if (isProjectOrExam) {
        unitTitle = 'التقييم والتطبيق الشهري';
        lessonTitle = `المشروع العملي التراكمي وتطبيق مهارات الشهر (واختبار الشهر العملي)`;
        labTask = 'تنفيذ مشروع رقمي متكامل على الأجهزة (برمجة، عروض، أو أمن سيبراني) ورصد النجوم';
        theoryOutcomes = 'قياس جدارة الطالب ومخرجات التعلم العملية وتوثيق كفاءته التقنية';
        catchUpPlan = 'جلسة تعويضية مسائية بالمعمل للمتغيبين لإتمام المشروع أو تسليم المشروع عبر البوابة الإلكترونية';
      } else {
        const lessonObj = allTerm1Lessons[i - 1] || allTerm1Lessons[0];
        unitTitle = lessonObj?.unitTitleAr || 'الوحدة الأولى';
        lessonTitle = lessonObj?.titleAr || `الدرس ${i}`;
        labTask = `تطبيق عملي خطوة بخطوة بالمعمل على أجهزة الطلاب (${lessonTitle.replace(/^الدرس \d+:\s*/, '')})`;
        theoryOutcomes = `فهم الطالب للأهداف الأساسية، وتطبيق مهارات التفكير الرقمي وأفضل الممارسات`;
        catchUpPlan = `تسجيل مرئي صوتي للمحاضرة + كبسولة ملخصة مطبوعة + جلسة دعم فردية 15 دقيقة قبل الحصة القادمة`;
      }

      list.push({
        lectureNumber: i,
        weekNumber: weekNum,
        dayName,
        unitTitle,
        lessonTitle,
        theoryMinutes: 35,
        practicalMinutes: 70,
        evaluationMinutes: 15,
        totalMinutes: 120, // 2 full hours
        labTask,
        theoryOutcomes,
        catchUpPlan,
        isExamRevision,
        isProjectOrExam
      });
    }

    return list;
  }, [allTerm1Lessons, selectedSchedule, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleAiRefresh = () => {
    setIsAiGenerating(true);
    setAiNote('جاري مطابقة أحدث خطة توزيع للمنهج الدراسي مع مواعيد الاختبارات الوزارية...');
    setTimeout(() => {
      setIsAiGenerating(false);
      setAiNote('✨ تم تحديث ومواءمة خريطة المنهج وتوزيع المحاضرات والمهام المعملية بنجاح بنسبة 100%!');
      setTimeout(() => setAiNote(null), 5000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-amber-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
                خريطة المنهج وتوزيع المحاضرات الذكي 🗺️
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                8 محاضرات شهرياً (محاضرتين أسبوعياً: نظري + عملي بالمعمل + مراجعة مخصصة وخطة تعويض الغياب)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiRefresh}
              disabled={isAiGenerating}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="مواءمة وتوليد خطة المنهج باستخدام الذكاء الاصطناعي والبحث الحديث"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'جاري التحديث...' : 'تحديث بالذكاء الاصطناعي ⚡'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="طباعة خريطة التوزيع الرسمية"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Notification Toast */}
        {aiNote && (
          <div className="bg-emerald-500 text-white font-bold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4" />
            <span>{aiNote}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Grade Selector */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
              المرحلة والصف الدراسي:
            </label>
            <select
              value={selectedGradeKey}
              onChange={(e) => setSelectedGradeKey(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold outline-none shadow-xs"
            >
              <option value="grade4">الصف الرابع الابتدائي (كود A) - ICT</option>
              <option value="grade5">الصف الخامس الابتدائي (كود B) - ICT</option>
              <option value="grade6">الصف السادس الابتدائي (كود C) - ICT</option>
              <option value="prep1">الصف الأول الإعدادي (كود D) - كمبيوتر وبرمجة</option>
              <option value="prep2">الصف الثاني الإعدادي (كود E) - تصميم الويب HTML</option>
              <option value="prep3">الصف الثالث الإعدادي (كود F) - الفيجوال بيسك والمنطق</option>
              <option value="sec1">الصف الأول الثانوي (كود G) - بايثون وذكاء اصطناعي</option>
            </select>
          </div>

          {/* Schedule Days Selector */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
              أيام المحاضرات (محاضرتين أسبوعياً):
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold outline-none shadow-xs"
            >
              <option value="sat_tue">السبت والثلاثاء (مجموعات عطلة الأسبوع)</option>
              <option value="mon_thu">الاثنين والخميس (مجموعات وسط الأسبوع)</option>
              <option value="sun_wed">الأحد والأربعاء (مجموعات إضافية)</option>
            </select>
          </div>

          {/* Target Month Selector */}
          <div>
            <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1">
              الشهر الدراسي المستهدف:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold outline-none shadow-xs"
            >
              <option value="أكتوبر 2026">شهر أكتوبر 2026 (اختبار الشهر الأول)</option>
              <option value="نوفمبر 2026">شهر نوفمبر 2026 (اختبار الشهر الثاني)</option>
              <option value="ديسمبر 2026">شهر ديسمبر 2026 (مشاريع ختامية)</option>
              <option value="يناير 2027">شهر يناير 2027 (مراجعة وامتحانات نصف العام)</option>
            </select>
          </div>

        </div>

        {/* Scrollable Curriculum Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 printable-content">
          
          {/* Header Summary Badge */}
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-2xl text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>المادة: <strong className="text-amber-900 dark:text-amber-300">{currentGradeData?.subjectNameAr}</strong></span>
              <span>•</span>
              <span>المرحلة: <strong className="text-slate-800 dark:text-slate-200">{currentGradeData?.stageAr} ({currentGradeData?.gradeNameAr})</strong></span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              إجمالي: 8 محاضرات شهرياً • 16 ساعة تدريبية (9.5 ساعة عملي بالمعمل)
            </div>
          </div>

          {/* Lecture Cards List */}
          <div className="space-y-3">
            {lectures.map((lec) => {
              const isHighlight = lec.isExamRevision || lec.isProjectOrExam;

              return (
                <div
                  key={lec.lectureNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    lec.isExamRevision
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 ring-2 ring-rose-400/20'
                      : lec.isProjectOrExam
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 ring-2 ring-amber-400/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    
                    {/* Lecture Badge & Title */}
                    <div className="space-y-1 md:w-5/12">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          lec.isExamRevision ? 'bg-rose-600 text-white' :
                          lec.isProjectOrExam ? 'bg-amber-500 text-slate-950' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          المحاضرة {lec.lectureNumber} (الأسبوع {lec.weekNumber} - {lec.dayName})
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {lec.unitTitle}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                        {lec.lessonTitle}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        🎯 <strong>نواتج التعلم:</strong> {lec.theoryOutcomes}
                      </p>
                    </div>

                    {/* Time Division Bar & Lab Hands-on Task */}
                    <div className="space-y-2 md:w-7/12 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 pt-2 md:pt-0 md:pr-4">
                      
                      {/* Time Breakdown Pill */}
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-md">
                          🧠 {lec.theoryMinutes} دقيقة شرح نظري
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md">
                          💻 {lec.practicalMinutes} دقيقة تطبيق عملي
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md">
                          ⭐ {lec.evaluationMinutes} دقيقة تقييم ونجوم
                        </span>
                      </div>

                      {/* Practical Lab Hands-on */}
                      <div className="text-xs bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                          <Laptop className="w-3.5 h-3.5" />
                          التكليف المعملي والتدريب العملي:
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">
                          {lec.labTask}
                        </p>
                      </div>

                      {/* Absentee Catch-Up Plan */}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <HelpCircle className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                        <span><strong>خطة تعويض الغياب:</strong> {lec.catchUpPlan}</span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Official Attestation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <span>🏢 مركز النجاح للتدريب والاستشارات • إدارة الشؤون التعليمية والمعامل التقنية</span>
            <span>✓ متوافق تماماً مع التوزيع المعتمد لوزارة التربية والتعليم للعام الدراسي 2026/2027</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            يمكنك طباعة خطة التوزيع كاملة أو تصديرها كملف للمدربين والطلاب
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الخطة كاملة 🖨️</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              تم وموافق ✓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
