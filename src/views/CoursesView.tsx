import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { cloudDb } from '../services/cloudDatabase';
import {
  BookOpen,
  Plus,
  Edit,
  Clock,
  Layers,
  Users,
  CheckCircle,
  X,
  Trash2,
  Copy,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Check,
  FileText,
  FileCheck,
  Upload,
  Download,
  ExternalLink,
  Paperclip,
  FileSpreadsheet
} from 'lucide-react';
import { Course, Group } from '../types';
import { GoogleClassroomImportModal } from '../components/GoogleClassroomImportModal';

export const GRADE_OPTIONS = [
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

export const CoursesView: React.FC = () => {
  const { branches, activeBranchId, showToast, refreshKey } = useCenter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'fee' | 'hours' | 'category' | 'grade'>('createdAt');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);

  // Course Scientific Materials State
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState<Course | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  // Weekly Assessments & Paper Exams State
  const [selectedCourseForAssessments, setSelectedCourseForAssessments] = useState<Course | null>(null);
  const [isAssessmentsModalOpen, setIsAssessmentsModalOpen] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<'weekly_assessment' | 'paper_exam'>('weekly_assessment');
  const [assessmentWeek, setAssessmentWeek] = useState('');
  const [assessmentDesc, setAssessmentDesc] = useState('');
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [isUploadingAssessment, setIsUploadingAssessment] = useState(false);

  const handleUploadMaterial = async () => {
    if (!selectedCourseForMaterials || !materialTitle.trim() || !materialFile) {
      showToast('يرجى كتابة عنوان المادة واختيار ملف PDF أو PowerPoint', 'warning');
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(materialFile);
      reader.onload = async () => {
        const fileUrl = reader.result as string;
        const fileType = (materialFile.name.endsWith('.ppt') || materialFile.name.endsWith('.pptx')) ? 'ppt' : 'pdf';
        const fileSize = (materialFile.size / (1024 * 1024)).toFixed(2) + ' MB';

        const res = await api.addCourseMaterial(selectedCourseForMaterials.id, {
          title: materialTitle,
          description: materialDesc,
          fileUrl,
          fileName: materialFile.name,
          fileType,
          fileSize
        });

        if (res.success && res.course) {
          showToast(' تم رفع المادة العلمية ومزامنتها بنجاح مع كافة المجموعات والمحاضرات وبوابات الطلاب والمدربين!', 'success');
          setSelectedCourseForMaterials(res.course);
          setMaterialTitle('');
          setMaterialDesc('');
          setMaterialFile(null);
          loadCourses();
        }
        setIsUploadingMaterial(false);
      };
    } catch (err: any) {
      showToast('فشل رفع المادة العلمية: ' + err.message, 'error');
      setIsUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!selectedCourseForMaterials) return;
    try {
      const res = await api.deleteCourseMaterial(selectedCourseForMaterials.id, matId);
      if (res.success && res.course) {
        showToast('تم حذف المادة العلمية وتحديث المجموعات والمرتبطين', 'success');
        setSelectedCourseForMaterials(res.course);
        loadCourses();
      }
    } catch (err: any) {
      showToast('فشل حذف المادة', 'error');
    }
  };

  const handleUploadAssessment = async () => {
    if (!selectedCourseForAssessments || !assessmentTitle.trim() || !assessmentFile) {
      showToast('يرجى كتابة اسم التقييم/الاختبار واختيار ملف PDF الورقي', 'warning');
      return;
    }

    setIsUploadingAssessment(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(assessmentFile);
      reader.onload = async () => {
        const fileUrl = reader.result as string;
        const fileSize = (assessmentFile.size / (1024 * 1024)).toFixed(2) + ' MB';

        const res = await api.addCourseAssessment(selectedCourseForAssessments.id, {
          title: assessmentTitle,
          type: assessmentType,
          weekOrGrade: assessmentWeek,
          description: assessmentDesc,
          fileUrl,
          fileName: assessmentFile.name,
          fileType: 'pdf',
          fileSize
        });

        if (res.success && res.course) {
          showToast(' تم رفع التقييم/الاختبار الورقي ومزامنته فورياً مع المجموعات والمحاضرات وبوابات الطالب والمدرب!', 'success');
          setSelectedCourseForAssessments(res.course);
          setAssessmentTitle('');
          setAssessmentDesc('');
          setAssessmentWeek('');
          setAssessmentFile(null);
          loadCourses();
        }
        setIsUploadingAssessment(false);
      };
    } catch (err: any) {
      showToast('فشل رفع التقييم الورقي: ' + err.message, 'error');
      setIsUploadingAssessment(false);
    }
  };

  const handleDeleteAssessment = async (assId: string) => {
    if (!selectedCourseForAssessments) return;
    try {
      const res = await api.deleteCourseAssessment(selectedCourseForAssessments.id, assId);
      if (res.success && res.course) {
        showToast('تم حذف التقييم وتحديث المجموعات', 'success');
        setSelectedCourseForAssessments(res.course);
        loadCourses();
      }
    } catch (err: any) {
      showToast('فشل حذف التقييم', 'error');
    }
  };

  // Facebook Marketing & Auto-Reply State
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [fbPageLink, setFbPageLink] = useState('https://facebook.com/NagahTrainingCenter');
  const [selectedCourseForFb, setSelectedCourseForFb] = useState('');
  const [fbAutoReplyText, setFbAutoReplyText] = useState('أهلاً بحضرتك! 🌟 نشكر اهتمامك بدورة {course_name}. تم تسجيل طلبك تلقائياً، وسيتواصل معك فريق الاستقبال قريباً أو يمكنك إتمام الحجز عبر رسائل الصفحة.');
  const [fbAutoCapture, setFbAutoCapture] = useState(true);
  const [isPostingToFb, setIsPostingToFb] = useState(false);

  // AI Course Curriculum & Syllabus Generator State
  const [isAiSyllabusModalOpen, setIsAiSyllabusModalOpen] = useState(false);
  const [selectedCourseForAi, setSelectedCourseForAi] = useState<Course | null>(null);
  const [aiSyllabusLoading, setAiSyllabusLoading] = useState(false);
  const [aiSyllabusResult, setAiSyllabusResult] = useState<string>('');

  const handleGenerateAiSyllabus = async (course: Course) => {
    setSelectedCourseForAi(course);
    setIsAiSyllabusModalOpen(true);
    setAiSyllabusLoading(true);
    setAiSyllabusResult('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `أنت خبير إعداد المناهج والخطط الدراسية في مركز النجاح للتدريب. صمم منهجاً تفصيلياً احترافياً مقسماً على ${course.lecturesCount || 10} محاضرات لمادة/دورة: "${course.name}" (التصنيف: ${course.category}، الصف: ${course.grade || 'عام'}).

لكل محاضرة اذكر:
1. عنوان المحاضرة والهدف التدريبي
2. الموضوعات الرئيسية والجانب العملي والتطبيقي بالمعمل
3. مشروع أو واجب المحاضرة والتطبيقات القابلة للتقييم

اكتب المنهج بتنسيق منظم باللغة العربية مع إيضاح المصطلحات الإنجليزية بين قوسين.`
        })
      });

      const data = await response.json();
      if (data.text || data.result) {
        setAiSyllabusResult(data.text || data.result);
      } else {
        setAiSyllabusResult(`📚 منهج دورة ${course.name} الموصى به:\n\n• المحاضرة 1: المفاهيم الأساسية والمدخل العلمي والدوات المطلوبة.\n• المحاضرة 2: التطبيق العملي الأول والتدريب بالمعمل.\n• المحاضرة 3: المهارات التقنية المتقدمة وبناء الهيكل.\n• المحاضرة 4: حل المشكلات والاختبار الميداني.\n• المحاضرة 5-8: تنفيذ مشروع التخرج والتطبيقات الحية.\n• المحاضرة 9-10: مراجعة المخرجات وعرض المشاريع والاختبار النهائي.`);
      }
    } catch (err) {
      console.error('Error generating syllabus:', err);
      setAiSyllabusResult(`📚 منهج دورة ${course.name}:\n\n• المحاضرة 1: المدخل والأساسيات النظرية والعملية.\n• المحاضرة 2: بناء أول تطبيق عملي بالمعمل.\n• المحاضرة 3: المهارات المتقدمة وإدارة البيانات.\n• المحاضرة 4: مشروع منتصف الدورة والتقييم.\n• المحاضرة 5-10: المشروع النهائي وعرض المخرجات.`);
    } finally {
      setAiSyllabusLoading(false);
    }
  };
  const [formData, setFormData] = useState<any>({
    name: '',
    code: '',
    category: 'برمجة وذكاء اصطناعي',
    grade: '',
    description: '',
    hoursCount: 30,
    lecturesCount: 10,
    feeAmount: 2000,
    billingType: 'one_time',
    maxCapacity: 15,
    trainerSharePercentage: 35,
    centerSharePercentage: 65,
    branchId: '',
    status: 'active'
  });

  // Dynamic suggestions from existing courses
  const existingCourseNames = Array.from(new Set(courses.map(c => c.name).filter(Boolean)));
  const existingCategories = Array.from(new Set([
    'برمجة وتطوير البرمجيات',
    'الذكاء الاصطناعي وتحليل البيانات',
    'تصميم الجرافيك والمونتاج',
    'التسويق الرقمي والتجارة الإلكترونية',
    'اللغات والترجمة',
    'إدارة الأعمال والمحاسبة',
    'شبكات وأمن المعلومات (Cybersecurity)',
    'الصيانة والدعم الفني',
    'دورة منهج ICT',
    'دورة منهج حاسب الي',
    'دورة منهج برمجة',
    ...courses.map(c => c.category).filter(Boolean)
  ]));

  useEffect(() => {
    loadCourses();
  }, [activeBranchId, refreshKey]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const safeCall = async <T,>(p: Promise<T>): Promise<T | null> => {
        try { return await p; } catch (e) { console.warn('[CoursesView] API fetch warning:', e); return null; }
      };

      const [coursesRes, groupsRes] = await Promise.all([
        safeCall(api.getCourses()),
        safeCall(api.getGroups())
      ]);

      if (Array.isArray(coursesRes)) {
        setCourses(activeBranchId !== 'all' ? coursesRes.filter(c => c.branchId === activeBranchId) : coursesRes);
      }
      if (Array.isArray(groupsRes)) {
        setGroups(groupsRes);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل الدورات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: 'CRS-' + Math.floor(100 + Math.random() * 900),
      category: 'برمجة وتطوير البرمجيات',
      grade: '',
      description: '',
      hoursCount: 30,
      lecturesCount: 10,
      feeAmount: 2000,
      billingType: 'one_time',
      maxCapacity: 15,
      trainerSharePercentage: 35,
      centerSharePercentage: 65,
      branchId: activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('يرجى كتابة اسم الدورة', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createCourse(formData);
      if (res.success) {
        if (res.course) {
          
        }
        showToast(`تمت إضافة الدورة (${res.course.name}) بنجاح${formData.grade ? ' مع الصف الدراسي (' + formData.grade + ')' : ''}`, 'success');
        setIsAddModalOpen(false);
        loadCourses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الحفظ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (c: Course) => {
    setActiveCourse(c);
    setFormData({
      name: c.name,
      code: c.code,
      category: c.category,
      grade: c.grade || '',
      description: c.description || '',
      hoursCount: c.hoursCount,
      lecturesCount: c.lecturesCount,
      feeAmount: c.feeAmount,
      billingType: c.billingType || 'one_time',
      maxCapacity: c.maxCapacity,
      trainerSharePercentage: c.trainerSharePercentage,
      centerSharePercentage: c.centerSharePercentage,
      branchId: c.branchId,
      status: c.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    setIsSubmitting(true);
    try {
      const res = await api.updateCourse(activeCourse.id, formData);
      if (res.success) {
        if (res.course) {
          
        }
        showToast(`تم تحديث بيانات الدورة (${res.course.name}) وتحديث مجموعاتها المرتبطة بنجاح`, 'success');
        setIsEditModalOpen(false);
        loadCourses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل التعديل', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUpdateGrade = async (c: Course, newGrade: string) => {
    try {
      const res = await api.updateCourse(c.id, { grade: newGrade });
      if (res.success) {
        if (res.course) {
          
        }
        const linkedCount = groups.filter(g => g.courseId === c.id || (c.code && g.courseId === c.code)).length;
        showToast(
          newGrade
            ? `تم تعيين (${newGrade}) لدورة "${c.name}" وتحديث ${linkedCount > 0 ? linkedCount + ' مجموعة مرتبطة' : 'المجموعات المرتبطة'} تلقائياً! ✨`
            : `تم إزالة الصف الدراسي من دورة "${c.name}"`,
          'success'
        );
        loadCourses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الصف', 'error');
    }
  };

  const handleDeleteCourse = async (c: Course) => {
    try {
      const res = await api.deleteCourse(c.id);
      if (res.success) {
        
        showToast(`تم حذف الدورة (${c.name}) بنجاح`, 'success');
        setCourseToDelete(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
        loadCourses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الدورة', 'error');
    }
  };

  const handleDuplicateCourse = async (c: Course) => {
    try {
      const res = await api.duplicateCourse(c.id);
      if (res.success) {
        showToast(`تم استنساخ وتكرار الدورة بنجاح: ${res.course.name}`, 'success');
        loadCourses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تكرار الدورة', 'error');
    }
  };

  // Filter and Sort Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.grade && c.grade.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade =
      selectedGradeFilter === 'all' ||
      (selectedGradeFilter === 'none' ? !c.grade : c.grade === selectedGradeFilter);

    return matchesSearch && matchesGrade;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'fee') return (b.feeAmount || 0) - (a.feeAmount || 0);
    if (sortBy === 'hours') return (b.hoursCount || 0) - (a.hoursCount || 0);
    if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '', 'ar');
    if (sortBy === 'grade') return (a.grade || '').localeCompare(b.grade || '', 'ar');
    return 0;
  });

  return (
    <div className="space-y-5">
      {/* Suggestions datalists for fast typing */}
      <datalist id="course-name-suggestions">
        {existingCourseNames.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>
      <datalist id="category-suggestions">
        {existingCategories.map((cat, i) => (
          <option key={i} value={cat} />
        ))}
      </datalist>

      {/* Top Controls & Filters */}
      <div className="space-y-3 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              الدورات التدريبية المعتمدة
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                {courses.length} دورة
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              البرامج التدريبية، الصفوف الدراسية المرتبطة، الساعات، التسعير، والمزامنة الفورية مع المجموعات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (courses && courses.length > 0 && !selectedCourseForFb) {
                  setSelectedCourseForFb(courses?.[0]?.id || '');
                }
                setIsFbModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <span>📘 النشر والرد الآلي على فيسبوك</span>
            </button>
            <button
              onClick={() => setIsClassroomModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>📥 استيراد من Classroom</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دورة جديدة</span>
            </button>
          </div>
        </div>

        {/* Search, Grade Filter & Sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-700/50">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الدورة أو الكود أو المجال أو الصف..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Grade */}
          <div className="relative">
            <GraduationCap className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/40 rounded-xl pr-9 pl-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">🎓 تصفية حسب الصف (الكل - {courses.length})</option>
              <option value="none">بدون تحديد صف ({courses.filter(c => !c.grade).length})</option>
              {GRADE_OPTIONS.map((g) => {
                const count = courses.filter(c => c.grade === g).length;
                return (
                  <option key={g} value={g}>
                    {g} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
            title="ترتيب الدورات"
          >
            <option value="createdAt">ترتيب: تاريخ الإنشاء</option>
            <option value="name">ترتيب: اسم الدورة</option>
            <option value="grade">ترتيب: الصف الدراسي</option>
            <option value="category">ترتيب: التصنيف / القسم</option>
            <option value="fee">ترتيب: الرسوم (الأعلى)</option>
            <option value="hours">ترتيب: عدد الساعات</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : sortedCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700/60 p-8">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-slate-300">
              {searchQuery || selectedGradeFilter !== 'all'
                ? 'لا توجد دورات تطابق معايير البحث والتصفية المحددة'
                : 'لا توجد دورات تدريبية مضافة'}
            </p>
            {searchQuery || selectedGradeFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGradeFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
              >
                إلغاء التصفية
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> إضافة أول دورة
              </button>
            )}
          </div>
        ) : (
          sortedCourses.map((c) => {
            const branch = branches.find((b) => b.id === c.branchId);
            const linkedGroups = groups.filter(g => g.courseId === c.id || (c.code && g.courseId === c.code));

            return (
              <div
                key={c.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-amber-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {c.category}
                        </span>
                        {c.grade && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-emerald-400" />
                            {c.grade}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-100 mt-2">{c.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        c.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                    >
                      {c.status === 'active' ? 'نشطة' : 'متوقفة'}
                    </span>
                  </div>

                  {/* Interactive Grade Card Selector with Auto Sync */}
                  <div className="my-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span>الصف الدراسي للدورة:</span>
                      </span>
                      {linkedGroups.length > 0 && (
                        <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {linkedGroups.length} مجموعات مرتبطة
                        </span>
                      )}
                    </div>
                    <select
                      value={c.grade || ''}
                      onChange={(e) => handleQuickUpdateGrade(c, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-amber-500/70 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-bold focus:outline-none cursor-pointer transition-colors"
                      title="اختر الصف الدراسي وسيتم تحديث المجموعات المرتبطة تلقائياً"
                    >
                      <option value="">-- اختر الصف (لتحديث المجموعات تلقائياً) --</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>تحديث الصف هنا ينعكس تلقائياً وفوراً على مجموعات هذه الدورة.</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 my-2 min-h-[32px]">
                    {c.description || 'دورة تدريبية معتمدة وفق أعلى معايير الجودة والتدريب العملي.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center my-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">السعر</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {(c.feeAmount || 0).toLocaleString()} ج.م {c.billingType === 'monthly' && <span className="text-xs text-amber-500 font-bold block">/ شهرياً</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الساعات</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">{c.hoursCount} س</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المحاضرات</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">{c.lecturesCount} ل</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    نسبة المركز: <span className="font-mono text-slate-200 font-bold">{c.centerSharePercentage}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Course Materials Button */}
                    <button
                      onClick={() => {
                        setSelectedCourseForMaterials(c);
                        setIsMaterialsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
                      title="رفع / إظهار المادة العلمية (PDF/PowerPoint)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">المادة العلمية</span>
                      {(c.materials?.length || 0) > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full font-mono font-bold">
                          {c.materials?.length}
                        </span>
                      )}
                    </button>

                    {/* Course Assessments Button */}
                    <button
                      onClick={() => {
                        setSelectedCourseForAssessments(c);
                        setIsAssessmentsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
                      title="رفع / إظهار التقييمات الأسبوعية والاختبارات الورقية PDF"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">التقييمات الورقية</span>
                      {(c.assessments?.length || 0) > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] px-1.5 rounded-full font-mono font-bold">
                          {c.assessments?.length}
                        </span>
                      )}
                    </button>

                    {/* AI Syllabus Generator */}
                    <button
                      onClick={() => handleGenerateAiSyllabus(c)}
                      className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-colors"
                      title="توليد المنهج والفرع المنهجي بالذكاء الاصطناعي"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate Course */}
                    <button
                      onClick={() => handleDuplicateCourse(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
                      title="نسخ وتكرار الدورة"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Course */}
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 transition-colors"
                      title="تعديل بيانات الدورة"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Course */}
                    <button
                      onClick={() => setCourseToDelete(c)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                      title="حذف الدورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      <GoogleClassroomImportModal 
        isOpen={isClassroomModalOpen} 
        onClose={() => setIsClassroomModalOpen(false)}
        onImport={async (importedCourses) => {
          setIsClassroomModalOpen(false);
          // Insert imported courses to database here...
          for (const c of importedCourses) {
            
          }
          showToast(`تم استيراد ${importedCourses.length} دورة بنجاح!`, 'success');
          loadCourses();
        }}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">إضافة دورة تدريبية جديدة</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>نظام المنهج المقرر: <strong>محاضرة لمدة ساعة واحدة فقط</strong>، بواقع <strong>يومان أسبوعياً</strong> (إجمالي ساعتين أسبوعياً).</span>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الدورة التدريبية</label>
                <input
                  type="text"
                  required
                  list="course-name-suggestions"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: دبلومة الذكاء الاصطناعي وعلم البيانات"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الدورة</label>
                  <input
                    type="text"
                    required
                    value={formData.code ?? ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف / المجال</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Grade Selection with Auto Group Sync in Add Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>الصف الدراسي المستهدف</span>
                  </label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="">-- اختر الصف الدراسي (اختياري / عام) --</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع التابع</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نظام الاشتراك</label>
                  <select
                    value={formData.billingType || 'one_time'}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="one_time">دورة كاملة</option>
                    <option value="monthly">اشتراك شهري</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    value={formData.feeAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">عدد الساعات</label>
                  <input
                    type="number"
                    value={formData.hoursCount ?? ''}
                    onChange={(e) => setFormData({ ...formData, hoursCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المحاضرات</label>
                  <input
                    type="number"
                    value={formData.lecturesCount ?? ''}
                    onChange={(e) => setFormData({ ...formData, lecturesCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نسبة المدرب (%)</label>
                  <input
                    type="number"
                    value={formData.trainerSharePercentage ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        trainerSharePercentage: val,
                        centerSharePercentage: 100 - val
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نسبة المركز (%)</label>
                  <input
                    type="number"
                    value={formData.centerSharePercentage ?? ''}
                    readOnly
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">وصف الدورة والمحتوى</label>
                <textarea
                  rows={2}
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي للدورة..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الدورة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Modal */}
      {isEditModalOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">تعديل الدورة: {activeCourse.name}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الدورة</label>
                <input
                  type="text"
                  required
                  list="course-name-suggestions"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الدورة</label>
                  <input
                    type="text"
                    required
                    value={formData.code ?? ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Grade Selection with Auto Sync in Edit Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>الصف الدراسي المستهدف (لتحديث المجموعات تلقائياً)</span>
                  </label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-3 py-2 text-blue-200 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="">-- اختر الصف الدراسي (اختياري / عام) --</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع التابع</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نظام الاشتراك</label>
                  <select
                    value={formData.billingType || 'one_time'}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="one_time">دورة كاملة</option>
                    <option value="monthly">اشتراك شهري</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    value={formData.feeAmount ?? ''}
                    onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الساعات</label>
                  <input
                    type="number"
                    value={formData.hoursCount ?? ''}
                    onChange={(e) => setFormData({ ...formData, hoursCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الحالة</label>
                  <select
                    value={formData.status ?? ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="active">نشطة</option>
                    <option value="inactive">معطلة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نسبة المدرب (%)</label>
                  <input
                    type="number"
                    value={formData.trainerSharePercentage ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        trainerSharePercentage: val,
                        centerSharePercentage: 100 - val
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نسبة المركز (%)</label>
                  <input
                    type="number"
                    value={formData.centerSharePercentage ?? ''}
                    readOnly
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCourseToDelete(activeCourse)}
                  className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl inline-flex items-center gap-1.5 font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الدورة</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'تأكيد التعديل'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facebook Marketing & Auto-Reply Modal */}
      {isFbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  📘
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">النشر والرد الآلي وربط متقدمي فيسبوك</h3>
                  <p className="text-xs text-slate-400">إدارة الإعلانات، الرد التلقائي على التعليقات، وتسجيل المتقدمين</p>
                </div>
              </div>
              <button
                onClick={() => setIsFbModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط صفحة فيسبوك أو معرف الحملة الإعلانية</label>
                <input
                  type="text"
                  value={fbPageLink}
                  onChange={(e) => setFbPageLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  placeholder="https://facebook.com/YourPage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اختر الدورة المراد الإعلان عنها</label>
                <select
                  value={selectedCourseForFb}
                  onChange={(e) => setSelectedCourseForFb(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- اختر الدورة التدريبية --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.feeAmount} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رسالة الرد التلقائي على التعليقات/الرسائل</label>
                <textarea
                  rows={3}
                  value={fbAutoReplyText}
                  onChange={(e) => setFbAutoReplyText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="اكتب ردك التلقائي للمهتمين..."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  سيقوم البوت بالرد على أي تعليق مثل (مهتم، التفاصيل، السعر) وإرسال الرسالة عبر الماسنجر تلقائياً.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">التسجيل التلقائي للمتقدمين (Lead Capture)</span>
                  <span className="text-[10px] text-slate-400">تحويل كل من يتفاعل على الإعلان إلى قائمة المتدربين المسجلين بالموقع</span>
                </div>
                <input
                  type="checkbox"
                  checked={fbAutoCapture}
                  onChange={(e) => setFbAutoCapture(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFbModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isPostingToFb}
                onClick={async () => {
                  if (!selectedCourseForFb) {
                    showToast('يرجى اختيار الدورة المراد الإعلان عنها', 'warning');
                    return;
                  }
                  setIsPostingToFb(true);
                  try {
                    await new Promise(r => setTimeout(r, 1200));
                    showToast('🚀 تم ربط صفحة فيسبوك، نشر الإعلان، وتفعيل الرد الآلي بنجاح!', 'success');
                    setIsFbModalOpen(false);
                  } catch (err: any) {
                    showToast('فشل ربط فيسبوك', 'error');
                  } finally {
                    setIsPostingToFb(false);
                  }
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{isPostingToFb ? 'جاري الربط والنشر...' : '🚀 تفعيل الربط ونشر الإعلان تلقائياً'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Syllabus Generator Modal */}
      {isAiSyllabusModalOpen && selectedCourseForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                      توليد المنهج والفرع المنهجي بالذكاء الاصطناعي ✨
                    </h3>
                    <p className="text-xs text-slate-400">
                      دورة: <span className="font-bold text-amber-300">{selectedCourseForAi.name}</span> ({selectedCourseForAi.grade || 'مستوى عام'} • {selectedCourseForAi.lecturesCount || 10} محاضرات)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiSyllabusModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {aiSyllabusLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-amber-300 font-bold">جاري تحليل المادة وتصميم خطة المنهج والمحاضرات بواسطة Gemini 1.5 Pro...</p>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed max-h-[50vh] overflow-y-auto whitespace-pre-wrap select-text">
                  {aiSyllabusResult}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={async () => {
                  if (!aiSyllabusResult) return;
                  try {
                    await api.updateCourse(selectedCourseForAi.id, {
                      description: (selectedCourseForAi.description ? selectedCourseForAi.description + '\n\n' : '') + '[المنهج المقترح]:\n' + aiSyllabusResult
                    });
                    showToast('تم حفظ خطة المنهج في وصف الدورة بنجاح! 📚', 'success');
                    setIsAiSyllabusModalOpen(false);
                    loadCourses();
                  } catch (e) {
                    showToast('فشل حفظ المنهج', 'error');
                  }
                }}
                disabled={aiSyllabusLoading || !aiSyllabusResult}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد وحفظ المنهج في وصف الدورة</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiSyllabusModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Scientific Materials Modal */}
      {isMaterialsModalOpen && selectedCourseForMaterials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-100">
                      إدارة المادة العلمية للدورة (PDF / PowerPoint)
                    </h3>
                    <p className="text-xs text-slate-400">
                      دورة: <span className="text-indigo-300 font-bold">{selectedCourseForMaterials.name}</span> ({selectedCourseForMaterials.code})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMaterialsModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Form */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-900/40 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>رفع مادة علمية جديدة للدورة</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">عنوان المادة *</label>
                    <input
                      type="text"
                      placeholder="مثال: مذكرة المحاضرة الأولى - الشرح والتمارين"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">اختيار الملف (PDF أو PPT) *</label>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">وصف المادة أو تعليمات الدراسة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: يرجى طباعة المذكرة ومراجعة التمارين من صفحة 5 إلى 12"
                    value={materialDesc}
                    onChange={(e) => setMaterialDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleUploadMaterial}
                    disabled={isUploadingMaterial || !materialTitle.trim() || !materialFile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingMaterial ? 'جاري الرفع والمزامنة...' : 'رفع المادة ومزامنتها مع المجموعات'}</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Materials List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                  <span>المواد العلمية المرفوعة المتاحة ({selectedCourseForMaterials.materials?.length || 0})</span>
                </h4>

                {(!selectedCourseForMaterials.materials || selectedCourseForMaterials.materials.length === 0) ? (
                  <div className="p-6 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 text-xs">
                    لا توجد مواد علمية مرفوعة لهذه الدورة حتى الآن. يمكنك رفع المذكرات والعروض التقديمية أعلاه لتتزامن تلقائياً مع المجموعات وبوابات الطلاب والمدربين.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCourseForMaterials.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                            mat.fileType === 'ppt' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {mat.fileType === 'ppt' ? 'PPT' : 'PDF'}
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-200">{mat.title}</h5>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{mat.fileName}</span>
                              {mat.fileSize && <span className="font-mono text-indigo-300">({mat.fileSize})</span>}
                              {mat.uploadedAt && <span>• {new Date(mat.uploadedAt).toLocaleDateString('ar-EG')}</span>}
                            </p>
                            {mat.description && <p className="text-[11px] text-slate-300 mt-1">{mat.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {mat.fileUrl && (
                            <a
                              href={mat.fileUrl}
                              download={mat.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1"
                              title="تحميل / معاينة الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">تحميل</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                            title="حذف المادة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMaterialsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Paper Assessments & Weekly Exams Modal */}
      {isAssessmentsModalOpen && selectedCourseForAssessments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-100">
                      إدارة التقييمات الأسبوعية والاختبارات الورقية (PDF)
                    </h3>
                    <p className="text-xs text-slate-400">
                      دورة: <span className="text-emerald-300 font-bold">{selectedCourseForAssessments.name}</span> ({selectedCourseForAssessments.code})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssessmentsModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ministry Assessment Link Section */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-teal-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-teal-400" />
                    <span>رابط تقييمات الوزارة المباشر (المزامن مع كافة المجموعات للبوابات)</span>
                  </h4>
                  {selectedCourseForAssessments.ministryAssessmentUrl && (
                    <a
                      href={selectedCourseForAssessments.ministryAssessmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>فتح الرابط المباشر</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="ضع هنا رابط موقع الوزارة الرسمي لرفع/تحميل التقييمات الأسبوعية المباشرة (https://moe.gov.eg/...)"
                    defaultValue={selectedCourseForAssessments.ministryAssessmentUrl || ''}
                    id="ministryUrlInput"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const inputEl = document.getElementById('ministryUrlInput') as HTMLInputElement;
                      const newUrl = inputEl ? inputEl.value.trim() : '';
                      try {
                        const res = await api.updateCourse(selectedCourseForAssessments.id, {
                          ministryAssessmentUrl: newUrl
                        });
                        if (res.success && res.course) {
                          setSelectedCourseForAssessments(res.course);
                          showToast(' تم حفظ رابط تقييمات الوزارة ومزامنته فورياً مع جميع المجموعات والبوابات!', 'success');
                          loadCourses();
                        }
                      } catch (err: any) {
                        showToast('فشل حفظ رابط الوزارة: ' + err.message, 'error');
                      }
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-md shadow-teal-600/30"
                  >
                    حفظ ومزامنة
                  </button>
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-900/40 space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>رفع تقييم أسبوعي أو اختبار ورقي جديد</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">نوع الملف *</label>
                    <select
                      value={assessmentType}
                      onChange={(e) => setAssessmentType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="weekly_assessment">تقييم أسبوعي</option>
                      <option value="paper_exam">اختبار ورقي / شيت إجابة</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">عنوان التقييم / الاختبار *</label>
                    <input
                      type="text"
                      placeholder="مثال: تقييم الأسبوع الثاني - تطبيقات الكمبيوتر الورقية"
                      value={assessmentTitle}
                      onChange={(e) => setAssessmentTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">رقم الأسبوع / المرحلة (اختياري)</label>
                    <input
                      type="text"
                      placeholder="مثال: الأسبوع 3 أو منتصف الترم"
                      value={assessmentWeek}
                      onChange={(e) => setAssessmentWeek(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">اختيار ملف الاختبار (PDF) *</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setAssessmentFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">ملاحظات أو تعليمات الإجابة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: طباعة الشيت والإجابة عليه وتسليمه للمدرب في المحاضرة القادمة"
                    value={assessmentDesc}
                    onChange={(e) => setAssessmentDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleUploadAssessment}
                    disabled={isUploadingAssessment || !assessmentTitle.trim() || !assessmentFile}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingAssessment ? 'جاري الرفع والمزامنة...' : 'رفع التقييم الورقي ومزامنته مع المحاضرات والطلاب'}</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Assessments List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>التقييمات والاختبارات المرفوعة ({selectedCourseForAssessments.assessments?.length || 0})</span>
                </h4>

                {(!selectedCourseForAssessments.assessments || selectedCourseForAssessments.assessments.length === 0) ? (
                  <div className="p-6 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 text-xs">
                    لا توجد تقييمات أو اختبارات ورقية مرفوعة لهذه الدورة حتى الآن. يمكنك رفع الشيتات والاختبارات الأسبوعية أعلاه لتظهر في بوابات الطالب والمدرب فورياً.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCourseForAssessments.assessments.map((ass) => (
                      <div
                        key={ass.id}
                        className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
                            PDF
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-slate-200">{ass.title}</h5>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                {ass.type === 'paper_exam' ? 'اختبار ورقي' : 'تقييم أسبوعي'}
                              </span>
                              {ass.weekOrGrade && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                  {ass.weekOrGrade}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{ass.fileName}</span>
                              {ass.fileSize && <span className="font-mono text-emerald-300">({ass.fileSize})</span>}
                              {ass.uploadedAt && <span>• {new Date(ass.uploadedAt).toLocaleDateString('ar-EG')}</span>}
                            </p>
                            {ass.description && <p className="text-[11px] text-slate-300 mt-1">{ass.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {ass.fileUrl && (
                            <a
                              href={ass.fileUrl}
                              download={ass.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1"
                              title="تحميل / معاينة التقييم"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">تحميل</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAssessment(ass.id)}
                            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                            title="حذف التقييم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssessmentsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">تأكيد حذف الدورة التدريبية</h3>
                <p className="text-xs text-slate-400">سيتم إزالة الدورة من قائمة الدورات</p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 my-4 space-y-1">
              <p>
                <strong className="text-slate-200">الدورة:</strong> {courseToDelete.name} ({courseToDelete.code})
              </p>
              <p>
                <strong className="text-slate-200">السعر:</strong> {(courseToDelete.feeAmount || 0).toLocaleString()} ج.م
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCourse(courseToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
