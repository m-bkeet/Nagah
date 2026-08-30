import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  Layers,
  Plus,
  BookOpen,
  Check,
  X,
  Tag,
  Code,
  Globe,
  Laptop,
  Brain,
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Users,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FolderPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { Program, Course, Group, Trainee } from '../types';

export const PROGRAM_CATEGORIES = [
  { id: 'برمجة وتطوير', label: 'برمجة وتطوير البرمجيات', icon: Code, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'لغات وترجمة', label: 'اللغات والترجمة', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'حاسب وتقنية', label: 'الحاسب الآلي والتقنية', icon: Laptop, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'تنمية بشرية', label: 'التنمية البشرية والقيادة', icon: Brain, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'قدرات ومواهب', label: 'القدرات والمواهب', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'مناهج دراسية', label: 'المناهج والصفوف الدراسية', icon: GraduationCap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'إداري ومالي', label: 'الإدارة والأعمال', icon: Briefcase, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { id: 'عام', label: 'عام وتخصصات أخرى', icon: Layers, color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
];

export const TARGET_AUDIENCES = [
  'جميع الفئات والمسارات',
  'الأطفال والناشئين (6 - 12 سنة)',
  'الفتية واليافعين (13 - 17 سنة)',
  'طلاب المدارس الابتدائي والإعدادي',
  'طلاب المرحلة الثانوية',
  'الجامعيين والخريجين',
  'المحترفين ورواد الأعمال'
];

export const STANDARD_GRADES = [
  'الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي', 
  'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
];

export const ProgramsView: React.FC = () => {
  const { showToast, refreshKey, activeBranchId, branches } = useCenter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'coursesCount'>('createdAt');

  // Expansion & Modals
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCoursesModalOpen, setIsAddCoursesModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [addFormData, setAddFormData] = useState({
    name: '',
    code: '',
    category: 'برمجة وتطوير',
    targetAudience: 'جميع الفئات والمسارات',
    description: '',
    bundlePrice: 0,
    status: 'active' as 'active' | 'inactive' | 'upcoming',
    generationType: 'grades' as 'grades' | 'levels' | 'manual',
    startGradeIdx: 3,
    endGradeIdx: 11,
    levelCount: 3,
    courseFee: 300,
    courseIds: [] as string[],
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    category: 'برمجة وتطوير',
    targetAudience: 'جميع الفئات والمسارات',
    description: '',
    bundlePrice: 0,
    status: 'active' as 'active' | 'inactive' | 'upcoming' | 'completed',
    courseIds: [] as string[],
  });

  const [appendCoursesData, setAppendCoursesData] = useState({
    generationType: 'levels' as 'grades' | 'levels' | 'manual',
    startGradeIdx: 0,
    endGradeIdx: 2,
    levelCount: 2,
    courseFee: 300,
    courseIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [progRes, coursesRes, groupsRes, traineesRes] = await Promise.all([
        api.getPrograms(),
        api.getCourses(),
        api.getGroups(),
        api.getTrainees()
      ]);
      setPrograms(progRes || []);
      setCourses(coursesRes || []);
      setGroups(groupsRes || []);
      setTrainees(traineesRes || []);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات البرامج التدريبية', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper getters
  const getCategoryMeta = (catName?: string) => {
    const found = PROGRAM_CATEGORIES.find(c => c.id === catName || catName?.includes(c.id));
    return found || PROGRAM_CATEGORIES[7]; // General
  };

  const getProgramStats = (prog: Program) => {
    const includedCourses = courses.filter(c => prog.courseIds.includes(c.id));
    const includedCourseIds = includedCourses.map(c => c.id);
    const relatedGroups = groups.filter(g => includedCourseIds.includes(g.courseId));
    const relatedGroupIds = relatedGroups.map(g => g.id);
    const enrolledTrainees = trainees.filter(t => (t.groupId && relatedGroupIds.includes(t.groupId)) || (t.courseId && includedCourseIds.includes(t.courseId)));
    const totalFeesSum = includedCourses.reduce((sum, c) => sum + (c.feeAmount || 0), 0);

    return {
      coursesCount: includedCourses.length,
      groupsCount: relatedGroups.length,
      traineesCount: enrolledTrainees.length,
      totalFeesSum,
      includedCourses,
      relatedGroups,
      enrolledTrainees
    };
  };

  // Open Handlers
  const handleOpenAdd = () => {
    setAddFormData({
      name: '',
      code: '',
      category: 'برمجة وتطوير',
      targetAudience: 'جميع الفئات والمسارات',
      description: '',
      bundlePrice: 0,
      status: 'active',
      generationType: 'grades',
      startGradeIdx: 3, // Grade 4 Primary
      endGradeIdx: 11, // Grade 3 Secondary
      levelCount: 3,
      courseFee: 300,
      courseIds: [],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prog: Program) => {
    setActiveProgram(prog);
    setEditFormData({
      name: prog.name || '',
      code: prog.code || '',
      category: prog.category || 'عام',
      targetAudience: prog.targetAudience || 'جميع الفئات والمسارات',
      description: prog.description || '',
      bundlePrice: prog.bundlePrice || 0,
      status: prog.status || 'active',
      courseIds: prog.courseIds || [],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAddCourses = (prog: Program) => {
    setActiveProgram(prog);
    setAppendCoursesData({
      generationType: 'levels',
      startGradeIdx: 0,
      endGradeIdx: 2,
      levelCount: 2,
      courseFee: 300,
      courseIds: [],
    });
    setIsAddCoursesModalOpen(true);
  };

  const handleOpenDetails = (prog: Program) => {
    setActiveProgram(prog);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (prog: Program) => {
    setActiveProgram(prog);
    setIsDeleteModalOpen(true);
  };

  // Form Submission Handlers
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim() || !addFormData.code.trim()) {
      showToast('اسم البرنامج والكود حقول إجبارية', 'warning');
      return;
    }

    if (addFormData.generationType === 'grades' && addFormData.startGradeIdx > addFormData.endGradeIdx) {
      showToast('تسلسل الصفوف غير صحيح (صف البداية أكبر من صف النهاية)', 'error');
      return;
    }

    let gradesList: { name: string, codeSuffix: string }[] = [];
    if (addFormData.generationType === 'grades') {
      const selectedGrades = STANDARD_GRADES.slice(addFormData.startGradeIdx, addFormData.endGradeIdx + 1);
      gradesList = selectedGrades.map(gName => {
        let suffix = '';
        if (gName.includes('الرابع الابتدائي')) suffix = '4';
        else if (gName.includes('الخامس الابتدائي')) suffix = '5';
        else if (gName.includes('السادس الابتدائي')) suffix = '6';
        else if (gName.includes('الأول الإعدادي')) suffix = 'P1';
        else if (gName.includes('الثاني الإعدادي')) suffix = 'P2';
        else if (gName.includes('الثالث الإعدادي')) suffix = 'P3';
        else if (gName.includes('الأول الثانوي')) suffix = 'S1';
        else if (gName.includes('الثاني الثانوي')) suffix = 'S2';
        else if (gName.includes('الثالث الثانوي')) suffix = 'S3';
        else if (gName.includes('الأول الابتدائي')) suffix = '1';
        else if (gName.includes('الثاني الابتدائي')) suffix = '2';
        else if (gName.includes('الثالث الابتدائي')) suffix = '3';
        return { name: gName, codeSuffix: suffix };
      });
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...addFormData,
        branchId: activeBranchId === 'all' ? (branches?.[0]?.id || '') : activeBranchId,
        gradesList
      };

      const res = await api.createProgram(payload);
      if (res.success) {
        showToast(`تم إنشاء البرنامج التدريبي (${res.program.name}) بنجاح`, 'success');
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء البرنامج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProgram) return;
    if (!editFormData.name.trim() || !editFormData.code.trim()) {
      showToast('اسم البرنامج والكود حقول إجبارية', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.updateProgram(activeProgram.id, editFormData);
      if (res.success) {
        showToast(`تم تحديث بيانات البرنامج التدريبي (${res.program.name})`, 'success');
        setIsEditModalOpen(false);
        setActiveProgram(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث البرنامج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppendCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProgram) return;

    let gradesList: { name: string, codeSuffix: string }[] = [];
    if (appendCoursesData.generationType === 'grades') {
      const selectedGrades = STANDARD_GRADES.slice(appendCoursesData.startGradeIdx, appendCoursesData.endGradeIdx + 1);
      gradesList = selectedGrades.map(gName => {
        let suffix = '';
        if (gName.includes('الرابع الابتدائي')) suffix = '4';
        else if (gName.includes('الخامس الابتدائي')) suffix = '5';
        else if (gName.includes('السادس الابتدائي')) suffix = '6';
        else if (gName.includes('الأول الإعدادي')) suffix = 'P1';
        else if (gName.includes('الثاني الإعدادي')) suffix = 'P2';
        else if (gName.includes('الثالث الإعدادي')) suffix = 'P3';
        else if (gName.includes('الأول الثانوي')) suffix = 'S1';
        else if (gName.includes('الثاني الثانوي')) suffix = 'S2';
        else if (gName.includes('الثالث الثانوي')) suffix = 'S3';
        else if (gName.includes('الأول الابتدائي')) suffix = '1';
        else if (gName.includes('الثاني الابتدائي')) suffix = '2';
        else if (gName.includes('الثالث الابتدائي')) suffix = '3';
        return { name: gName, codeSuffix: suffix };
      });
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...appendCoursesData,
        branchId: activeProgram.branchId || activeBranchId,
        gradesList
      };

      const res = await api.addCoursesToProgram(activeProgram.id, payload);
      if (res.success) {
        showToast(`تم إضافة ${res.addedCoursesCount} دورات جديدة للبرنامج بنجاح`, 'success');
        setIsAddCoursesModalOpen(false);
        setActiveProgram(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة الدورات للبرنامج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgramConfirm = async () => {
    if (!activeProgram) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteProgram(activeProgram.id);
      if (res.success) {
        showToast('تم حذف البرنامج التدريبي بنجاح', 'success');
        setIsDeleteModalOpen(false);
        setActiveProgram(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف البرنامج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredPrograms = programs.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'coursesCount') return (b.courseIds?.length || 0) - (a.courseIds?.length || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Calculate Global Header Stats
  const totalProgramsCount = programs.length;
  const activeProgramsCount = programs.filter(p => p.status === 'active' || !p.status).length;
  const totalBundledCourses = programs.reduce((sum, p) => sum + (p.courseIds?.length || 0), 0);
  const categoriesCount = new Set(programs.map(p => p.category || 'عام')).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              البرامج التدريبية الشاملة
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-mono font-bold border border-indigo-500/30">
                {totalProgramsCount} برنامج
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              إدارة وهيكلة المسارات والأقسام الرئيسية (البرمجة، اللغات، التنمية البشرية، الحاسب، المناهج التعليمية)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء برنامج جديد</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">إجمالي البرامج</span>
            <span className="text-lg font-black text-slate-100 font-mono">{totalProgramsCount}</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">البرامج النشطة</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{activeProgramsCount}</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">الدورات المندمجة</span>
            <span className="text-lg font-black text-blue-400 font-mono">{totalBundledCourses}</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl flex items-center gap-3.5 backdrop-blur-md">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">التخصصات والمجالات</span>
            <span className="text-lg font-black text-purple-400 font-mono">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Category Filter, Status Filter & Sorting */}
      <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم البرنامج، الكود، أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">كل المجال والتخصصات</option>
            {PROGRAM_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="upcoming">قريباً / قادم</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5">
          <ListFilter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt">الأحدث إنشاءً</option>
            <option value="name">أبجدياً بالاسم</option>
            <option value="coursesCount">الأكثر دورات مدمجة</option>
          </select>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>جاري تحميل البرامج التدريبية...</span>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="col-span-full py-16 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-center text-slate-400 space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto opacity-50" />
            <p className="font-bold text-sm text-slate-300">لا توجد برامج تدريبية مطابقة للبحث</p>
            <p className="text-xs text-slate-500">يمكنك إضافة برنامج جديد أو تعديل خيارات التصفية والبحث.</p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء برنامج جديد</span>
            </button>
          </div>
        ) : (
          filteredPrograms.map((p) => {
            const catMeta = getCategoryMeta(p.category);
            const CatIcon = catMeta.icon;
            const stats = getProgramStats(p);
            const isExpanded = expandedProgramId === p.id;

            return (
              <div
                key={p.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-200 group"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${catMeta.color} shadow-inner`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60 font-bold">
                            كود: {p.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catMeta.color}`}>
                            {catMeta.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      p.status === 'inactive'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : p.status === 'upcoming'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {p.status === 'inactive' ? 'غير نشط' : p.status === 'upcoming' ? 'قريباً' : 'نشط'}
                    </span>
                  </div>

                  {/* Target Audience Badge & Description */}
                  {p.targetAudience && (
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-md inline-block">
                        🎯 {p.targetAudience}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {p.description || 'برنامج تدريبي متكامل يشمل مسارات تعليمية وتدريبية متدرجة.'}
                  </p>

                  {/* Program Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl mb-4 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">الدورات</span>
                      <span className="text-xs font-black text-indigo-400 font-mono">{stats.coursesCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">المجموعات</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">{stats.groupsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">الطلاب</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">{stats.traineesCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">سعر الباقة</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {p.bundlePrice ? `${p.bundlePrice} ج.م` : 'حسب الكورس'}
                      </span>
                    </div>
                  </div>

                  {/* Included Courses Section */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        الدورات التابعة للبرنامج ({stats.coursesCount}):
                      </span>
                      {stats.coursesCount > 3 && (
                        <button
                          onClick={() => setExpandedProgramId(isExpanded ? null : p.id)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          <span>{isExpanded ? 'طي القائمة' : `عرض الكل (${stats.coursesCount})`}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {stats.coursesCount === 0 ? (
                      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center text-[11px] text-slate-500">
                        لا توجد دورات مدمجة بهذا البرنامج بعد.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(isExpanded ? stats.includedCourses : stats.includedCourses.slice(0, 3)).map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 text-xs text-slate-200 border border-slate-700/50 hover:border-slate-600 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate font-bold text-slate-200">{c.name}</span>
                              {c.code && (
                                <span className="font-mono text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {c.code}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] font-bold text-amber-400 shrink-0 mr-2">
                              {c.feeAmount} ج.م
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Tools Bar */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* Details Button */}
                    <button
                      onClick={() => handleOpenDetails(p)}
                      title="عرض التفاصيل الكاملة والهيكل"
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Add Courses Button */}
                    <button
                      onClick={() => handleOpenAddCourses(p)}
                      title="توليد وإضافة دورات إضافية لهذا البرنامج"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>إضافة دورات</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="تعديل بيانات البرنامج"
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleOpenDelete(p)}
                      title="حذف البرنامج"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
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

      {/* CREATE PROGRAM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">إنشاء برنامج تدريبي جديد</h3>
                  <p className="text-[11px] text-slate-400">إضافة قسم تدريبي رئيسي وتوليد دوراته تلقائياً</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم البرنامج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مادة الكمبيوتر والتكنولوجيا"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود البرنامج الموحد *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ICT أو DEV أو ENG"
                    value={addFormData.code}
                    onChange={(e) => setAddFormData({ ...addFormData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص / المجال الرئيسي *</label>
                  <select
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    {PROGRAM_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفئة المستهدفة</label>
                  <select
                    value={addFormData.targetAudience}
                    onChange={(e) => setAddFormData({ ...addFormData, targetAudience: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    {TARGET_AUDIENCES.map(aud => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">وصف شمولية البرنامج</label>
                <textarea
                  rows={2}
                  placeholder="اكتب نبذة عن أهداف هذا البرنامج المدمج والدورات التابعة له..."
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعر الباقة الكلي (اختياري)</label>
                  <input
                    type="number"
                    placeholder="خصم الباقة المدمجة ج.م"
                    value={addFormData.bundlePrice || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, bundlePrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حالة البرنامج</label>
                  <select
                    value={addFormData.status}
                    onChange={(e: any) => setAddFormData({ ...addFormData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    <option value="active">نشط ومتاح للحجز</option>
                    <option value="upcoming">قريباً / قادم</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Generation Options */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold">طريقة توليد وإدراج الدورات التابعة</label>
                <div className="flex items-center justify-between gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="radio"
                      name="genType"
                      checked={addFormData.generationType === 'grades'}
                      onChange={() => setAddFormData({ ...addFormData, generationType: 'grades' })}
                    />
                    تسلسل صفوف دراسية
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="radio"
                      name="genType"
                      checked={addFormData.generationType === 'levels'}
                      onChange={() => setAddFormData({ ...addFormData, generationType: 'levels' })}
                    />
                    تسلسل مستويات
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="radio"
                      name="genType"
                      checked={addFormData.generationType === 'manual'}
                      onChange={() => setAddFormData({ ...addFormData, generationType: 'manual' })}
                    />
                    ربط دورات موجودة
                  </label>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
                  {addFormData.generationType === 'grades' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">من الصف</label>
                        <select
                          value={addFormData.startGradeIdx}
                          onChange={(e) => setAddFormData({ ...addFormData, startGradeIdx: Number(e.target.value) })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                        >
                          {STANDARD_GRADES.map((g, i) => <option key={i} value={i}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">إلى الصف</label>
                        <select
                          value={addFormData.endGradeIdx}
                          onChange={(e) => setAddFormData({ ...addFormData, endGradeIdx: Number(e.target.value) })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                        >
                          {STANDARD_GRADES.map((g, i) => <option key={i} value={i}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {addFormData.generationType === 'levels' && (
                    <div>
                      <label className="block text-slate-400 mb-1">عدد المستويات المطلوبة لتوليدها</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={addFormData.levelCount}
                        onChange={(e) => setAddFormData({ ...addFormData, levelCount: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  )}

                  {addFormData.generationType === 'manual' && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {courses.length === 0 ? (
                        <p className="text-slate-500 text-center py-2">لا توجد دورات مسجلة بعد في النظام.</p>
                      ) : (
                        courses.map((c) => {
                          const isChecked = addFormData.courseIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                const next = isChecked
                                  ? addFormData.courseIds.filter(id => id !== c.id)
                                  : [...addFormData.courseIds, c.id];
                                setAddFormData({ ...addFormData, courseIds: next });
                              }}
                              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                                isChecked ? 'bg-indigo-900/60 border border-indigo-700/60 text-indigo-200' : 'bg-slate-800/80 border border-slate-700/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'}`}>
                                  {isChecked && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-bold">{c.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">{c.feeAmount} ج.م</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {addFormData.generationType !== 'manual' && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">رسوم كل دورة تولد تلقائياً:</span>
                      <input
                        type="number"
                        value={addFormData.courseFee}
                        onChange={(e) => setAddFormData({ ...addFormData, courseFee: Number(e.target.value) })}
                        className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإنشاء البرنامج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROGRAM MODAL */}
      {isEditModalOpen && activeProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">تعديل بيانات البرنامج التدريبي</h3>
                  <p className="text-[11px] text-slate-400">تحديث الكود، الاسم، المجال والدورات المدمجة</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم البرنامج *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الكود الموحد *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص / المجال الرئيسي</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    {PROGRAM_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفئة المستهدفة</label>
                  <select
                    value={editFormData.targetAudience}
                    onChange={(e) => setEditFormData({ ...editFormData, targetAudience: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    {TARGET_AUDIENCES.map(aud => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف الشامل</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعر الباقة المدمجة (ج.م)</label>
                  <input
                    type="number"
                    value={editFormData.bundlePrice || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, bundlePrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حالة البرنامج</label>
                  <select
                    value={editFormData.status}
                    onChange={(e: any) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-indigo-500"
                  >
                    <option value="active">نشط ومتاح</option>
                    <option value="upcoming">قريباً / قادم</option>
                    <option value="inactive">غير نشط</option>
                    <option value="completed">مكتمل</option>
                  </select>
                </div>
              </div>

              {/* Course Selection list */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">إدارة الدورات المندمجة بهذا البرنامج</label>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-700">
                  {courses.map((c) => {
                    const isChecked = editFormData.courseIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          const next = isChecked
                            ? editFormData.courseIds.filter(id => id !== c.id)
                            : [...editFormData.courseIds, c.id];
                          setEditFormData({ ...editFormData, courseIds: next });
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked ? 'bg-indigo-900/60 border border-indigo-700/60 text-indigo-200' : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="font-bold">{c.name}</span>
                        </div>
                        <span className="font-mono text-[10px]">{c.feeAmount} ج.م</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تحديث البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COURSES TO PROGRAM MODAL */}
      {isAddCoursesModalOpen && activeProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">إضافة دورات إضافية لبرنامج: {activeProgram.name}</h3>
                  <p className="text-[11px] text-slate-400">توليد مستويات أو صفوف إضافية ودمجها تلقائياً</p>
                </div>
              </div>
              <button onClick={() => setIsAddCoursesModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppendCourses} className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                  <input
                    type="radio"
                    name="appendGenType"
                    checked={appendCoursesData.generationType === 'levels'}
                    onChange={() => setAppendCoursesData({ ...appendCoursesData, generationType: 'levels' })}
                  />
                  إضافة مستويات تالية
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                  <input
                    type="radio"
                    name="appendGenType"
                    checked={appendCoursesData.generationType === 'grades'}
                    onChange={() => setAppendCoursesData({ ...appendCoursesData, generationType: 'grades' })}
                  />
                  إضافة صفوف دراسية
                </label>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                {appendCoursesData.generationType === 'levels' && (
                  <div>
                    <label className="block text-slate-400 mb-1">عدد المستويات الإضافية المطلوب إنشاؤها</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={appendCoursesData.levelCount}
                      onChange={(e) => setAppendCoursesData({ ...appendCoursesData, levelCount: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                    />
                  </div>
                )}

                {appendCoursesData.generationType === 'grades' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">من الصف</label>
                      <select
                        value={appendCoursesData.startGradeIdx}
                        onChange={(e) => setAppendCoursesData({ ...appendCoursesData, startGradeIdx: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        {STANDARD_GRADES.map((g, i) => <option key={i} value={i}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">إلى الصف</label>
                      <select
                        value={appendCoursesData.endGradeIdx}
                        onChange={(e) => setAppendCoursesData({ ...appendCoursesData, endGradeIdx: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        {STANDARD_GRADES.map((g, i) => <option key={i} value={i}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">رسوم الدورة الافتراضية:</span>
                  <input
                    type="number"
                    value={appendCoursesData.courseFee}
                    onChange={(e) => setAppendCoursesData({ ...appendCoursesData, courseFee: Number(e.target.value) })}
                    className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCoursesModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  {isSubmitting ? 'جاري الإضافة...' : 'توليد وإضافة الدورات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROGRAM DETAILS MODAL */}
      {isDetailsModalOpen && activeProgram && (() => {
        const catMeta = getCategoryMeta(activeProgram.category);
        const CatIcon = catMeta.icon;
        const stats = getProgramStats(activeProgram);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${catMeta.color}`}>
                    <CatIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{activeProgram.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/60 font-bold">
                        كود: {activeProgram.code}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">إجمالي الدورات</span>
                    <span className="text-base font-black text-indigo-400 font-mono">{stats.coursesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">المجموعات النشطة</span>
                    <span className="text-base font-black text-cyan-400 font-mono">{stats.groupsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">الطلاب المسجلين</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{stats.traineesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">سعر الباقة الكلي</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {activeProgram.bundlePrice ? `${activeProgram.bundlePrice} ج.م` : `${stats.totalFeesSum} ج.م`}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-300 mb-1">وصف البرنامج:</h4>
                  <p className="p-3 bg-slate-950 rounded-xl text-slate-300 leading-relaxed border border-slate-800">
                    {activeProgram.description || 'لا يوجد وصف مضاف لهذا البرنامج التدريبي.'}
                  </p>
                </div>

                {/* Courses breakdown list */}
                <div>
                  <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    الدورات المندرجة تحت هذا البرنامج ({stats.coursesCount}):
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {stats.includedCourses.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                        لا توجد دورات مضافة.
                      </p>
                    ) : (
                      stats.includedCourses.map((c) => {
                        const courseGroups = groups.filter(g => g.courseId === c.id);
                        return (
                          <div
                            key={c.id}
                            className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200 text-sm">{c.name}</span>
                                {c.code && (
                                  <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                                    {c.code}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                                <span>عدد المجموعات: {courseGroups.length}</span>
                                {c.grade && <span>الصف: {c.grade}</span>}
                                {c.level && <span>المستوى: {c.level}</span>}
                              </div>
                            </div>
                            <span className="font-mono font-black text-amber-400 text-sm">
                              {c.feeAmount} ج.م
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DELETE PROGRAM MODAL */}
      {isDeleteModalOpen && activeProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">تأكيد حذف البرنامج التدريبي</h3>
                <p className="text-xs text-slate-400">هل أنت متأكد من حذف هذا البرنامج؟</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mb-5">
              أنت على وشك حذف البرنامج التدريبي <strong className="text-rose-300">{activeProgram.name}</strong>.
              علماً أن الدورات المنشأة سابقاً ستظل قائمة ولن تمحى من النظام.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteProgramConfirm}
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                {isSubmitting ? 'جاري الحذف...' : 'نعم، تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
