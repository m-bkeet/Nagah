import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, 
  BookOpen, Sparkles, Award, ArrowUpRight, Bell, Layers, FileText, Check,
  X, AlertTriangle, Coffee, RotateCcw, CalendarCheck, HelpCircle, Save,
  Globe, Laptop, Users
} from 'lucide-react';
import { Course, Group, Exam } from '../../types';
import { MOE_CURRICULA, detectCurriculum, GradeCurriculum } from '../../domain/curriculumRegistry';
import { api } from '../../services/api';
import { useCenter } from '../../context/CenterContext';

interface AcademicCalendarAndExamsWidgetProps {
  courses: Course[];
  groups: Group[];
  onNavigate?: (view: string) => void;
  onOpenCurriculumPlan?: (courseId?: string, groupId?: string) => void;
}

export const AcademicCalendarAndExamsWidget: React.FC<AcademicCalendarAndExamsWidgetProps> = ({
  courses,
  groups,
  onNavigate,
  onOpenCurriculumPlan
}) => {
  const { showToast } = useCenter();

  // Active Selected Group (defaults to first available group)
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return groups && groups.length > 0 ? groups[0].id : '';
  });

  // Track: 'languages' (Default: English primary) or 'arabic'
  const [curriculumTrack, setCurriculumTrack] = useState<'languages' | 'arabic'>('languages');

  // Academic Months for Academic Year 2026/2027
  const academicMonths = useMemo(() => [
    { key: '2026-09', year: 2026, month: 8, labelAr: 'سبتمبر 2026', labelEn: 'September 2026' },
    { key: '2026-10', year: 2026, month: 9, labelAr: 'أكتوبر 2026', labelEn: 'October 2026' },
    { key: '2026-11', year: 2026, month: 10, labelAr: 'نوفمبر 2026', labelEn: 'November 2026' },
    { key: '2026-12', year: 2026, month: 11, labelAr: 'ديسمبر 2026', labelEn: 'December 2026' },
    { key: '2027-01', year: 2027, month: 0, labelAr: 'يناير 2027 (نصف العام)', labelEn: 'January 2027 (Mid-Year)' },
    { key: '2027-02', year: 2027, month: 1, labelAr: 'فبراير 2027 (الترم الثاني)', labelEn: 'February 2027 (Term 2)' },
    { key: '2027-03', year: 2027, month: 2, labelAr: 'مارس 2027', labelEn: 'March 2027' },
    { key: '2027-04', year: 2027, month: 3, labelAr: 'أبريل 2027', labelEn: 'April 2027' },
    { key: '2027-05', year: 2027, month: 4, labelAr: 'مايو 2027 (نهاية العام)', labelEn: 'May 2027 (Finals)' }
  ], []);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-10');
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  // Group details
  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  const activeCourse = useMemo(() => {
    if (!activeGroup) return courses[0] || null;
    return courses.find(c => c.id === activeGroup.courseId) || null;
  }, [courses, activeGroup]);

  // Current Month Data
  const currentMonthObj = useMemo(() => {
    return academicMonths.find(m => m.key === selectedMonthKey) || academicMonths[1];
  }, [academicMonths, selectedMonthKey]);

  const year = currentMonthObj.year;
  const month = currentMonthObj.month; // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
  const startDayOffset = (firstDayOfWeek + 1) % 7; // Shift so Saturday = index 0

  // Weekdays: Sat to Fri
  const weekDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  // Map Arabic weekday names to JS Date day index (0=Sun, 1=Mon, ..., 6=Sat)
  const dayNameToIndex: Record<string, number> = {
    'الأحد': 0, 'الاحد': 0, 'sun': 0, 'sunday': 0,
    'الاثنين': 1, 'الإثنين': 1, 'mon': 1, 'monday': 1,
    'الثلاثاء': 2, 'tue': 2, 'tuesday': 2,
    'الأربعاء': 3, 'الاربعاء': 3, 'wed': 3, 'wednesday': 3,
    'الخميس': 4, 'thu': 4, 'thursday': 4,
    'الجمعة': 5, 'fri': 5, 'friday': 5,
    'السبت': 6, 'sat': 6, 'saturday': 6
  };

  // Extract scheduled days for active group
  const groupScheduledDays = useMemo(() => {
    if (!activeGroup) return [1, 4]; // Default Mon & Thu
    const rawDays = activeGroup.days || activeGroup.scheduleDays || [];
    if (Array.isArray(rawDays) && rawDays.length > 0) {
      const idxs = rawDays
        .map(d => dayNameToIndex[d.trim().toLowerCase()] ?? dayNameToIndex[d.trim()])
        .filter(idx => idx !== undefined && idx >= 0);
      if (idxs.length > 0) return idxs;
    }

    // Try text heuristic from name or notes
    const combined = `${activeGroup.name || ''} ${activeGroup.notes || ''}`.toLowerCase();
    const detected: number[] = [];
    if (combined.includes('سبت') || combined.includes('sat')) detected.push(6);
    if (combined.includes('احد') || combined.includes('أحد') || combined.includes('sun')) detected.push(0);
    if (combined.includes('اثنين') || combined.includes('إثنين') || combined.includes('mon')) detected.push(1);
    if (combined.includes('ثلاثاء') || combined.includes('tue')) detected.push(2);
    if (combined.includes('اربعاء') || combined.includes('أربعاء') || combined.includes('wed')) detected.push(3);
    if (combined.includes('خميس') || combined.includes('thu')) detected.push(4);
    if (combined.includes('جمعة') || combined.includes('fri')) detected.push(5);

    return detected.length > 0 ? detected : [1, 4]; // fallback Mon & Thu
  }, [activeGroup]);

  // Compute all calendar lecture dates for the active group in this month
  const rawLectureDates = useMemo(() => {
    const list: { dayNum: number; dateStr: string; dayNameAr: string; dayNameEn: string; dayOfWeek: number }[] = [];
    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dow = dateObj.getDay();
      if (groupScheduledDays.includes(dow)) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        list.push({
          dayNum: d,
          dateStr: `${year}-${mm}-${dd}`,
          dayNameAr: dayNamesAr[dow],
          dayNameEn: dayNamesEn[dow],
          dayOfWeek: dow
        });
      }
    }
    return list;
  }, [daysInMonth, year, month, groupScheduledDays]);

  // Detect Official 2026/2027 MOE Curriculum for the active group
  const curriculum: GradeCurriculum = useMemo(() => {
    return detectCurriculum({
      groupName: activeGroup?.name,
      courseName: activeCourse?.name,
      grade: activeCourse?.grade || activeGroup?.grade,
      stage: activeCourse?.category
    });
  }, [activeGroup, activeCourse]);

  // Lessons from term 1
  const term1Units = curriculum?.terms?.term1?.units || [];
  const allTerm1Lessons = useMemo(() => {
    return term1Units.flatMap(u => u.lessons);
  }, [term1Units]);

  // Local Overrides state for this group and month
  // e.g. overrides[selectedMonthKey][lectureIndex] = { status: 'active' | 'cancelled' | 'revision' | 'catchup', note?: string }
  const [overrides, setOverrides] = useState<Record<string, { status: 'active' | 'cancelled' | 'revision' | 'catchup'; customTitle?: string }>>({});

  useEffect(() => {
    if (activeGroup?.monthlyScheduleOverrides?.[selectedMonthKey]) {
      setOverrides(activeGroup.monthlyScheduleOverrides[selectedMonthKey] as any);
    } else {
      setOverrides({});
    }
  }, [activeGroup, selectedMonthKey]);

  // Persist override to server
  const handleUpdateOverride = useCallback(async (
    lectureIdx: number, 
    newStatus: 'active' | 'cancelled' | 'revision' | 'catchup',
    customTitle?: string
  ) => {
    if (!activeGroup) return;
    const nextOverrides = {
      ...overrides,
      [lectureIdx]: { status: newStatus, customTitle: customTitle || overrides[lectureIdx]?.customTitle }
    };
    setOverrides(nextOverrides);

    const updatedGroupOverrides = {
      ...(activeGroup.monthlyScheduleOverrides || {}),
      [selectedMonthKey]: nextOverrides
    };

    setIsSavingOverride(true);
    try {
      await api.updateGroup(activeGroup.id, {
        monthlyScheduleOverrides: updatedGroupOverrides
      });
      showToast(
        newStatus === 'cancelled' 
          ? `تم تعيين المحاضرة رقم ${lectureIdx} كعطلة/إجازة معتمدة بنجاح`
          : newStatus === 'revision'
          ? `تم اعتماد المحاضرة رقم ${lectureIdx} كمراجعة ليلة الامتحان`
          : newStatus === 'catchup'
          ? `تم تخصيص المحاضرة رقم ${lectureIdx} كجلسة تعويضية للمتغيبين`
          : `تم تفعيل المحاضرة رقم ${lectureIdx} كحصة شرح وتطبيق رسمي`,
        'success'
      );
    } catch (e) {
      console.warn('Failed to save group schedule override:', e);
      showToast('تم التعديل محلياً (تعذر الحفظ بالسحابة مؤقتاً)', 'warning');
    } finally {
      setIsSavingOverride(false);
    }
  }, [activeGroup, overrides, selectedMonthKey, showToast]);

  // Batch action: Set standard 8 lectures (cancel extra 9th if exists)
  const handleSetStandard8Lectures = useCallback(async () => {
    if (rawLectureDates.length <= 8) {
      showToast('الشهر يحتوي بالفعل على 8 محاضرات منضبطة تماماً', 'info');
      return;
    }
    // Mark index 9 (and above) as cancelled / holiday
    const nextOverrides = { ...overrides };
    for (let i = 9; i <= rawLectureDates.length; i++) {
      nextOverrides[i] = { status: 'cancelled' };
    }
    setOverrides(nextOverrides);

    if (activeGroup) {
      setIsSavingOverride(true);
      try {
        await api.updateGroup(activeGroup.id, {
          monthlyScheduleOverrides: {
            ...(activeGroup.monthlyScheduleOverrides || {}),
            [selectedMonthKey]: nextOverrides
          }
        });
        showToast('تم إلغاء المحاضرة الإضافية واعتماد الشهر كـ 8 محاضرات رسمية فقط ✅', 'success');
      } catch (err) {
        showToast('تم التعديل محلياً', 'info');
      } finally {
        setIsSavingOverride(false);
      }
    }
  }, [rawLectureDates, overrides, activeGroup, selectedMonthKey, showToast]);

  // Batch action: Set extra lecture as revision
  const handleSetExtraAsRevision = useCallback(async () => {
    if (rawLectureDates.length <= 8) return;
    const nextOverrides = { ...overrides };
    for (let i = 9; i <= rawLectureDates.length; i++) {
      nextOverrides[i] = { status: 'revision', customTitle: 'محاضرة مراجعة إضافية ليلة الامتحان ونماذج أسئلة الوزارة' };
    }
    setOverrides(nextOverrides);

    if (activeGroup) {
      setIsSavingOverride(true);
      try {
        await api.updateGroup(activeGroup.id, {
          monthlyScheduleOverrides: {
            ...(activeGroup.monthlyScheduleOverrides || {}),
            [selectedMonthKey]: nextOverrides
          }
        });
        showToast('تم تعيين المحاضرة الإضافية كمراجعة ليلة الامتحان الشاملة 📝', 'success');
      } catch (err) {
        showToast('تم التعديل محلياً', 'info');
      } finally {
        setIsSavingOverride(false);
      }
    }
  }, [rawLectureDates, overrides, activeGroup, selectedMonthKey, showToast]);

  // Batch action: Reset all to active
  const handleActivateAllLectures = useCallback(async () => {
    const nextOverrides: any = {};
    setOverrides(nextOverrides);

    if (activeGroup) {
      setIsSavingOverride(true);
      try {
        await api.updateGroup(activeGroup.id, {
          monthlyScheduleOverrides: {
            ...(activeGroup.monthlyScheduleOverrides || {}),
            [selectedMonthKey]: nextOverrides
          }
        });
        showToast(`تم تفعيل كافة مواعيد المحاضرات (${rawLectureDates.length} محاضرات)`, 'success');
      } catch (err) {
        showToast('تم التعديل محلياً', 'info');
      } finally {
        setIsSavingOverride(false);
      }
    }
  }, [rawLectureDates, activeGroup, selectedMonthKey, showToast]);

  // Construct full detailed lectures list for the month with 2026/2027 Languages topics
  const fullMonthlyLectures = useMemo(() => {
    return rawLectureDates.map((item, idx) => {
      const lectureNum = idx + 1;
      const isExtra = lectureNum > 8;
      const override = overrides[lectureNum];
      const status: 'active' | 'cancelled' | 'revision' | 'catchup' = override?.status || 'active';

      // Curriculum Lesson matching
      let lessonTitleEn = '';
      let lessonTitleAr = '';
      let unitTitleEn = '';
      let unitTitleAr = '';
      let labTaskEn = '';
      let labTaskAr = '';

      if (status === 'revision' || lectureNum === 7) {
        unitTitleEn = 'Comprehensive Monthly Review & MOE Practice';
        unitTitleAr = 'محطة المراجعة الدورية ونماذج الوزارة';
        lessonTitleEn = `Intensive Revision for ${currentMonthObj.labelEn.split(' ')[0]} Exam`;
        lessonTitleAr = `مراجعة مكثفة ونماذج اختبار شهر ${currentMonthObj.labelAr.split(' ')[0]}`;
        labTaskEn = 'Interactive lab simulation solving past ministry model exams with instant scoring.';
        labTaskAr = 'حل ورشة عمل تفاعلية ومحاكاة الامتحان الفعلي على أجهزة المعمل.';
      } else if (lectureNum === 8) {
        unitTitleEn = 'Monthly Practical Assessment & Lab Capstone';
        unitTitleAr = 'التقييم العملي الشهري ومشروع المعمل';
        lessonTitleEn = 'Monthly Practical Skills Exam & Hands-on Presentation Project';
        lessonTitleAr = 'المشروع العملي التراكمي وتطبيق مهارات الشهر واختبار المعمل';
        labTaskEn = 'Hands-on practical execution on computers (Excel, PowerPoint, Python or Web Page).';
        labTaskAr = 'تنفيذ مشروع رقمي متكامل على الأجهزة وتقييم كفاءة كل طالب ورصد النجوم.';
      } else if (isExtra && status === 'active') {
        unitTitleEn = 'Bonus Applied Workshop';
        unitTitleAr = 'ورشة عمل إضافية وتطبيقات متقدمة';
        lessonTitleEn = 'Hands-on Coding Clinic, Advanced Exercises & Extra Practice';
        lessonTitleAr = 'محاضرة إضافية: تطبيقات عملية متقدمة وبنك أسئلة التفكير الناقد';
        labTaskEn = 'Advanced lab challenge & practical exercises for top students.';
        labTaskAr = 'تحدي المعمل المتقدم وأسئلة المتفوقين لدعم مستوى الأبطال.';
      } else {
        const lessonObj = allTerm1Lessons[idx] || allTerm1Lessons[idx % (allTerm1Lessons.length || 1)];
        unitTitleEn = lessonObj?.unitTitleEn || 'Unit 1: The Role of ICT';
        unitTitleAr = lessonObj?.unitTitleAr || 'الوحدة الأولى';
        lessonTitleEn = lessonObj?.titleEn || `Lesson ${lectureNum}: Digital Skills`;
        lessonTitleAr = lessonObj?.titleAr || `الدرس ${lectureNum}`;
        labTaskEn = `Guided computer lab practice: step-by-step hands-on implementation of ${lessonTitleEn}.`;
        labTaskAr = `تطبيق عملي خطوة بخطوة بالمعمل على أجهزة الطلاب (${lessonTitleAr}).`;
      }

      return {
        lectureNumber: lectureNum,
        dayNum: item.dayNum,
        dateStr: item.dateStr,
        dayNameAr: item.dayNameAr,
        dayNameEn: item.dayNameEn,
        unitTitleEn,
        unitTitleAr,
        lessonTitleEn,
        lessonTitleAr,
        labTaskEn,
        labTaskAr,
        theoryMinutes: 35,
        practicalMinutes: 70,
        evaluationMinutes: 15,
        totalMinutes: 120,
        isExtra,
        status,
        customTitle: override?.customTitle
      };
    });
  }, [rawLectureDates, overrides, allTerm1Lessons, currentMonthObj]);

  // Statistics
  const totalAvailableDates = rawLectureDates.length;
  const activeLecturesCount = fullMonthlyLectures.filter(l => l.status !== 'cancelled').length;
  const cancelledCount = fullMonthlyLectures.filter(l => l.status === 'cancelled').length;
  const hasExtraLectures = totalAvailableDates > 8;

  // Official MOE Exam Milestones for Academic Year 2026/2027 (Language Schools)
  const officialMoeExams = useMemo(() => [
    {
      id: 'moe-oct-2026',
      titleEn: 'Official October Monthly Exam (Languages)',
      titleAr: 'اختبار شهر أكتوبر الرسمي لمدارس اللغات',
      targetEn: 'Grades 4, 5, 6 & Prep 1, 2, 3 (Languages Track)',
      targetAr: 'المرحلة الابتدائية والإعدادية لغات',
      date: '2026-10-29',
      scopeEn: 'Theme 1: All Core Concepts, Digital Safety & Computer Systems',
      scopeAr: 'المحور الأول كاملاً (المستكشف النشط، أنظمة التشغيل، شبكات الحاسوب، والتحول الرقمي)',
      totalMarks: 30,
      duration: '45 mins',
      status: 'upcoming'
    },
    {
      id: 'moe-nov-2026',
      titleEn: 'Official November Monthly Exam (Languages)',
      titleAr: 'اختبار شهر نوفمبر الرسمي لمدارس اللغات',
      targetEn: 'Grades 4, 5, 6 & Prep 1, 2, 3 (Languages Track)',
      targetAr: 'المرحلة الابتدائية والإعدادية لغات',
      date: '2026-11-26',
      scopeEn: 'Theme 2: Cyber Security, Cloud Storage & Data Analysis',
      scopeAr: 'المحور الثاني (الأمن السيبراني، التخزين السحابي، وتحليل البيانات)',
      totalMarks: 30,
      duration: '45 mins',
      status: 'scheduled'
    },
    {
      id: 'moe-tasks-2026',
      titleEn: 'Official Performance Tasks 2026/2027 (المهام الأدائية لغات)',
      titleAr: 'المهام الأدائية الرسمية لمدارس اللغات (35 درجة)',
      targetEn: 'Primary 4, 5, 6 & Prep 1 (Official MOE Performance Task)',
      targetAr: 'سنوات النقل الابتدائي والإعدادي',
      date: '2026-12-17',
      scopeEn: 'Hands-on Creative Graphic Design & Algorithm Implementation',
      scopeAr: 'تصميم لوحة إعلانية، رسم مخطط تدفق، أو مشروع برمجي تفاعلي بالمعمل',
      totalMarks: 35,
      duration: '90 mins',
      status: 'scheduled'
    },
    {
      id: 'moe-prac-2026',
      titleEn: 'End of Term 1 Practical Lab Exam (امتحان المعمل العملي)',
      titleAr: 'الامتحان العملي بالمعمل (تطبيقات الحاسب والبرمجة)',
      targetEn: 'All Languages Groups (Grades 4 to Sec 2)',
      targetAr: 'جميع المراحل لغات',
      date: '2026-12-28',
      scopeEn: 'Live hands-on skills test on lab PCs with direct instructor grading',
      scopeAr: 'تنفيذ المهارات عملياً على أجهزة المعمل أمام المدرب المشرف',
      totalMarks: 20,
      duration: '60 mins',
      status: 'scheduled'
    },
    {
      id: 'moe-midyear-2027',
      titleEn: 'Term 1 Mid-Year Written Final Exams (امتحانات نصف العام التحريرية)',
      titleAr: 'امتحانات نصف العام التحريرية الرسمية 2027',
      targetEn: 'Directorate & District Centralized Exam',
      targetAr: 'إدارة التعليم ومديرية التربية والتعليم',
      date: '2027-01-14',
      scopeEn: 'Full Term 1 Curriculum Comprehensive Final Evaluation',
      scopeAr: 'المنهج الكامل للفصل الدراسي الأول لمدارس اللغات',
      totalMarks: 60,
      duration: '90 mins',
      status: 'scheduled'
    }
  ], []);

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-amber-300/80 dark:border-slate-800 p-4 sm:p-6 shadow-lg space-y-6 transition-colors" dir="rtl">
      
      {/* 1. TOP HEADER & INTERACTIVE FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-200/70 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>خريطة المحاضرات والتقويم الدراسي لمدارس اللغات 2026 / 2027</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                Languages 🌐
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              حساب دقيق لعدد محاضرات المجموعة شهرياً مع إدارة المحاضرات الإضافية وخطة المنهج المعتمد
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Languages vs Arabic Track Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurriculumTrack('languages')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                curriculumTrack === 'languages'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>مدارس اللغات (Languages)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurriculumTrack('arabic')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                curriculumTrack === 'arabic'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>عربي</span>
            </button>
          </div>

          {/* Curriculum Plan Map Modal trigger */}
          {onOpenCurriculumPlan && (
            <button
              type="button"
              onClick={() => onOpenCurriculumPlan(activeCourse?.id, activeGroup?.id)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>خريطة المنهج وتوزيع الـ 8 محاضرات 🗺️</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. GROUP SELECTOR & ACADEMIC MONTH SELECTOR BAR */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl border-2 border-amber-300/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Group Selector Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-black text-slate-900 dark:text-white shrink-0 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>المجموعة التدريبية:</span>
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="flex-1 md:w-72 bg-white dark:bg-slate-950 border-2 border-amber-400/80 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            {groups.map(g => {
              const matchedCourse = courses.find(c => c.id === g.courseId);
              const daysStr = Array.isArray(g.days) && g.days.length > 0 ? g.days.join(' و ') : 'مواعيد منتظمة';
              return (
                <option key={g.id} value={g.id}>
                  {g.name} — {matchedCourse?.grade || 'منهج اللغات'} ({daysStr})
                </option>
              );
            })}
          </select>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-black text-slate-900 dark:text-white shrink-0 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>الشهر الأكاديمي:</span>
          </label>
          <select
            value={selectedMonthKey}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="flex-1 md:w-60 bg-white dark:bg-slate-950 border-2 border-emerald-400/80 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            {academicMonths.map(m => (
              <option key={m.key} value={m.key}>
                {m.labelAr} ({m.labelEn})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 3. DYNAMIC MONTHLY LECTURE COUNTER & EXTRA LECTURE ENGINE (ما طلبه المستخدم بدقة) */}
      <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
        hasExtraLectures 
          ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/60 shadow-md'
          : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Information & Lecture Counts */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                مجموعة: <strong className="text-amber-800 dark:text-amber-300 font-mono underline">{activeGroup?.name || 'ICT'}</strong>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مواعيدها المعتمدة: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{activeGroup?.days?.join(' و ') || 'الاثنين والخميس'}</strong>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                منهج: <strong className="text-blue-700 dark:text-blue-400">{curriculum.subjectNameEn} ({curriculum.gradeNameAr})</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black">
                <span>إجمالي الأيام المتاحة في التقويم: </span>
                <span className="text-amber-700 dark:text-amber-400 font-mono text-sm">{totalAvailableDates} مواعيد</span>
              </div>

              <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black">
                <span>المحاضرات النشطة المعتمدة: </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{activeLecturesCount} محاضرة</span>
              </div>

              {cancelledCount > 0 && (
                <div className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-300 dark:border-rose-700 text-xs font-bold">
                  <span>تم استبعاد / إجازة: </span>
                  <span className="font-mono text-sm">{cancelledCount} محاضرة</span>
                </div>
              )}
            </div>

            {/* Smart Extra Lecture Advice */}
            {hasExtraLectures ? (
              <p className="text-xs text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>تنبيه إداري وميداني:</strong> يتضمن شهر {currentMonthObj.labelAr.split(' ')[0]} موعداً لمحاضرة إضافية ({totalAvailableDates} محاضرات بدلاً من الخطة الأساسية 8). يمكنك بنقرة واحدة إما إلغاؤها لضبط الشهر على 8 محاضرات بالضبط، أو اعتمادها كمراجعة ليلة الامتحان أو كجلسة تعويضية للمتغيبين!
                </span>
              </p>
            ) : (
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>الشهر مكتمل ومنضبط تماماً على 8 محاضرات (محاضرتين أسبوعياً على مدار 4 أسابيع).</span>
              </p>
            )}
          </div>

          {/* Quick Action Buttons for Extra Lecture Management */}
          {hasExtraLectures && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSetStandard8Lectures}
                disabled={isSavingOverride}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                title="إلغاء المحاضرة التاسعة واعتمادها كعطلة وراحة للطلاب ليكون الشهر 8 محاضرات بالضبط"
              >
                <Coffee className="w-4 h-4" />
                <span>إلغاء الإضافية (ضبط كـ 8 محاضرات فقط) ☕</span>
              </button>

              <button
                type="button"
                onClick={handleSetExtraAsRevision}
                disabled={isSavingOverride}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                title="اعتماد المحاضرة التاسعة كمراجعة شاملة ليلة الامتحان الشهري"
              >
                <Sparkles className="w-4 h-4" />
                <span>إبقاء الإضافية كمراجعة ليلة الامتحان 📝</span>
              </button>

              <button
                type="button"
                onClick={handleActivateAllLectures}
                disabled={isSavingOverride}
                className="px-2.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
                title="إعادة تفعيل كافة المحاضرات في التقويم"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. REAL-TIME DETAILED LECTURES TABLE / TIMELINE FOR THIS MONTH */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>جدول محاضرات المجموعة التفصيلي لشهر {currentMonthObj.labelAr} ({curriculumTrack === 'languages' ? 'منهج اللغات 2026/2027' : 'المنهج العربي'})</span>
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            مقسمة إلى 35 دقيقة شرح نظري + 70 دقيقة تطبيق عملي بالمعمل + 15 دقيقة تقييم ونجوم
          </span>
        </div>

        {/* Lectures Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {fullMonthlyLectures.map((lec) => {
            const isCancelled = lec.status === 'cancelled';
            const isRevision = lec.status === 'revision';
            const isCatchup = lec.status === 'catchup';

            return (
              <div
                key={lec.lectureNumber}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 shadow-xs ${
                  isCancelled
                    ? 'bg-slate-100/70 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 opacity-65'
                    : isRevision
                    ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500/50'
                    : lec.isExtra
                    ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-300 dark:border-purple-500/40'
                    : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                {/* Card Top: Number, Date, and Status Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono shadow-xs ${
                        isCancelled
                          ? 'bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          : isRevision
                          ? 'bg-amber-500 text-slate-950'
                          : lec.isExtra
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                      }`}>
                        #{lec.lectureNumber}
                      </span>
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block">
                          {lec.dayNameAr} ({lec.dateStr})
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                          {lec.dayNameEn}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div>
                      {isCancelled ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-black border border-rose-300">
                          عطلة / ملغاة ❌
                        </span>
                      ) : isRevision ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black border border-amber-400">
                          مراجعة مكثفة 📝
                        </span>
                      ) : isCatchup ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 font-black border border-blue-400">
                          تعويض غياب 🔄
                        </span>
                      ) : lec.isExtra ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 font-black border border-purple-400">
                          إضافية 🌟
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-black border border-emerald-400">
                          نشطة شرح وعملي ✅
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lesson Topic Aligned with 2026/2027 Languages Curriculum */}
                  <div className="pt-2.5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block line-clamp-1">
                      📁 {curriculumTrack === 'languages' ? lec.unitTitleEn : lec.unitTitleAr}
                    </span>

                    <h5 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                      {curriculumTrack === 'languages' ? lec.lessonTitleEn : lec.lessonTitleAr}
                    </h5>

                    {curriculumTrack === 'languages' && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {lec.lessonTitleAr}
                      </p>
                    )}

                    <div className="pt-1.5 text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                      <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong>المعمل:</strong> {curriculumTrack === 'languages' ? lec.labTaskEn : lec.labTaskAr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Lecture Timing & Action Status Toggle */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                    ⏱️ 35د نظري + 70د عملي
                  </span>

                  {/* 1-Click Status Toggler */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateOverride(lec.lectureNumber, isCancelled ? 'active' : 'cancelled')}
                      className={`px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer ${
                        isCancelled
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300'
                      }`}
                      title={isCancelled ? 'إلغاء الإجازة وتفعيل المحاضرة' : 'تعيين هذا الموعد كإجازة/عطلة'}
                    >
                      {isCancelled ? 'تفعيل ✅' : 'إجازة ❌'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateOverride(lec.lectureNumber, isRevision ? 'active' : 'revision')}
                      className={`px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer ${
                        isRevision
                          ? 'bg-slate-800 text-white'
                          : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                      }`}
                      title="تبديل إلى محاضرة مراجعة مكثفة"
                    >
                      مراجعة 📝
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. OFFICIAL 2026/2027 EXAM TIMETABLE FOR LANGUAGE SCHOOLS */}
      <div className="pt-4 border-t border-amber-200/70 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500 animate-bounce" />
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              جدول ومواعيد الاختبارات الرسمية لمدارس اللغات (2026 / 2027) 🏛️
            </h4>
          </div>
          <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
            معتمدة بقرارات وزارة التربية والتعليم
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {officialMoeExams.map((ex) => (
            <div
              key={ex.id}
              className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 p-3.5 rounded-2xl transition-all shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 mb-1">
                    {curriculumTrack === 'languages' ? ex.targetEn : ex.targetAr}
                  </span>
                  <h5 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                    {curriculumTrack === 'languages' ? ex.titleEn : ex.titleAr}
                  </h5>
                </div>
                <span className="px-2 py-1 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[10px] font-black font-mono shrink-0">
                  {ex.date}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                📖 <strong>نطاق المنهج:</strong> {curriculumTrack === 'languages' ? ex.scopeEn : ex.scopeAr}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span>⏱️ المدة: <strong className="text-slate-700 dark:text-slate-200 font-mono">{ex.duration}</strong></span>
                <span>🎯 الدرجة: <strong className="text-amber-700 dark:text-amber-400 font-mono">{ex.totalMarks} درجة</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">
                  مراجعة سابقة ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
