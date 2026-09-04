import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { cloudDb } from '../services/cloudDatabase';
import { GoogleMeetService } from '../services/googleMeet';
import { formatTimeAMPM } from '../utils/timeFormat';
import {
  Users2,
  Plus,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Users,
  BookOpen,
  Trash2,
  Copy,
  AlertTriangle,
  Search,
  Filter,
  GraduationCap,
  Printer,
  Share2,
  MessageCircle,
  Eye,
  ArrowRight,
  Sparkles,
  Layers,
  Phone,
  LayoutGrid,
  List,
  CheckSquare,
  Video
} from 'lucide-react';
import { Group, Course, Trainer, Branch, Trainee } from '../types';

interface GroupsViewProps {
  onNavigate?: (view: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ onNavigate }) => {
  const { branches, activeBranchId, showToast, refreshKey } = useCenter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'course' | 'branch' | 'startTime' | 'day'>('createdAt');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuickScheduleModalOpen, setIsQuickScheduleModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isTraineesModalOpen, setIsTraineesModalOpen] = useState(false);
  const [isPrintRosterModalOpen, setIsPrintRosterModalOpen] = useState(false);

  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<any>({
    name: '',
    courseId: '',
    trainerId: '',
    branchId: '',
    roomName: 'معمل النجاح',
    scheduleDays: ['السبت', 'الثلاثاء'],
    startTime: '16:00',
    endTime: '18:00',
    startDate: '',
    endDate: '',
    maxCapacity: 15,
    whatsappGroupLink: '',
    notes: '',
    status: 'active',
    grade: '',
    track: 'عربي'
  });

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFormData, setBatchFormData] = useState<{
    courseId: string;
    branchId: string;
    count: number;
    track: string;
    prefixName: string;
    feeAmount?: string | number;
  }>({
    courseId: '',
    branchId: '',
    count: 2,
    track: 'عربي',
    prefixName: '',
    feeAmount: ''
  });

  const handleOpenBatch = () => {
    setBatchFormData({
      courseId: courses?.[0]?.id || '',
      branchId: activeBranchId !== 'all' ? activeBranchId : (branches?.[0]?.id || ''),
      count: 2,
      track: 'عربي',
      prefixName: ''
    });
    setIsBatchModalOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFormData.courseId || !batchFormData.branchId || !batchFormData.count) {
      showToast('يرجى تحديد الدورة والفرع وعدد المجموعات', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.batchCreateGroups(batchFormData);
      if (res.success) {
        showToast(`تم إنشاء ${res.groups.length} مجموعات بنجاح`, 'success');
        setIsBatchModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل الإنشاء بالجملة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate Modal Form Data
  const [duplicateFormData, setDuplicateFormData] = useState<any>({
    name: '',
    branchId: '',
    trainerId: '',
    roomName: '',
    scheduleDays: ['السبت', 'الثلاثاء'],
    startTime: '16:00',
    endTime: '18:00',
    startDate: '',
    endDate: '',
    whatsappGroupLink: '',
    notes: '',
    status: 'active',
    grade: ''
  });

  const daysList = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const timePresets = [
    { label: 'صباحي مبكر', start: '09:00', end: '11:00' },
    { label: 'صباحي', start: '10:00', end: '12:00' },
    { label: 'ظهراً', start: '12:00', end: '14:00' },
    { label: 'عصراً', start: '14:00', end: '16:00' },
    { label: 'مسائي 1', start: '16:00', end: '18:00' },
    { label: 'مسائي 2', start: '18:00', end: '20:00' },
    { label: 'مسائي متأخر', start: '20:00', end: '22:00' }
  ];

  const dayPresets = [
    { label: 'سبت - ثلاثاء', days: ['السبت', 'الثلاثاء'] },
    { label: 'أحد - أربعاء', days: ['الأحد', 'الأربعاء'] },
    { label: 'اثنين - خميس', days: ['الاثنين', 'الخميس'] },
    { label: 'جمعة - سبت (مكثف)', days: ['الجمعة', 'السبت'] },
    { label: 'يومياً (مكثف)', days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'] }
  ];

  // Smart suggestions from existing data
  const existingGroupNames = Array.from(new Set((groups || []).map(g => g.name).filter(Boolean)));
  const existingRoomNames = Array.from(new Set([
    'معمل النجاح',
    'معمل بدر',
    ...(groups || []).map(g => g.roomName || g.hallName).filter(Boolean)
  ]));

  useEffect(() => {
    loadData();
  }, [activeBranchId, refreshKey]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const safeCall = async <T,>(p: Promise<T>): Promise<T | null> => {
        try { return await p; } catch (e) { console.warn('[GroupsView] API fetch warning:', e); return null; }
      };

      const [groupsRes, coursesRes, trainersRes, traineesRes] = await Promise.all([
        safeCall(api.getGroups()),
        safeCall(api.getCourses()),
        safeCall(api.getTrainers()),
        safeCall(api.getTrainees())
      ]);

      if (Array.isArray(groupsRes)) {
        setGroups(activeBranchId !== 'all' ? groupsRes.filter(g => g.branchId === activeBranchId) : groupsRes);
      }
      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
      }
      if (Array.isArray(trainersRes)) {
        setTrainers(trainersRes);
      }
      if (Array.isArray(traineesRes)) {
        setTrainees(traineesRes);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل التحميل', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTraineesForGroup = (groupId: string) => {
    return (trainees || []).filter(t => t.groupId === groupId);
  };

  const handleOpenAdd = () => {
    const defaultBranch = activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1';
    const defaultCourse = (courses || []).find(c => activeBranchId === 'all' || c.branchId === defaultBranch) || courses?.[0];
    const defaultTrainer = (trainers || []).find(t => activeBranchId === 'all' || t.branchId === defaultBranch) || trainers?.[0];

    setFormData({
      name: `مجموعة ${defaultCourse ? defaultCourse.name : 'تدريبية'} - فوج ${(groups || []).length + 1}`,
      courseId: defaultCourse?.id || '',
      trainerId: defaultTrainer?.id || '',
      branchId: defaultBranch,
      roomName: 'معمل الحاسب الرئيسي (Lab 1)',
      scheduleDays: ['السبت', 'الثلاثاء'],
      startTime: '16:00',
      endTime: '18:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      maxCapacity: 15,
      feeAmount: '',
      whatsappGroupLink: '',
      notes: '',
      status: 'active',
      grade: defaultCourse?.grade || '',
      track: 'عربي'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.courseId || !formData.branchId) {
      showToast('يرجى تحديد اسم المجموعة والدورة والفرع', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createGroup(formData);
      if (res.success) {
        if (res.group) {
          
        }
        showToast(`تم إنشاء المجموعة (${res.group.name}) بنجاح`, 'success');
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المجموعة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (g: Group) => {
    setActiveGroup(g);
    setFormData({
      name: g.name,
      courseId: g.courseId,
      trainerId: g.trainerId || '',
      branchId: g.branchId,
      roomName: g.roomName || g.hallName || 'معمل الحاسب الرئيسي (Lab 1)',
      scheduleDays: g.scheduleDays || g.days || ['السبت', 'الثلاثاء'],
      startTime: g.startTime || '16:00',
      endTime: g.endTime || '18:00',
      startDate: g.startDate || '',
      endDate: g.endDate || '',
      maxCapacity: g.maxCapacity || g.maxStudents || 15,
      feeAmount: g.feeAmount !== undefined && g.feeAmount !== null ? g.feeAmount : '',
      whatsappGroupLink: g.whatsappGroupLink || '',
      notes: g.notes || '',
      status: g.status || 'active',
      grade: g.grade || '',
      track: g.track || 'عربي'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    if (!formData.name.trim()) {
      showToast('اسم المجموعة مطلوب', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.updateGroup(activeGroup.id, formData);
      if (res.success) {
        if (res.group) {
          
        }
        showToast(`تم تعديل كافة تفاصيل المجموعة (${res.group.name}) بنجاح`, 'success');
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل التعديل', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Schedule Change Modal
  const handleOpenQuickSchedule = (g: Group) => {
    setActiveGroup(g);
    setFormData({
      ...g,
      scheduleDays: g.scheduleDays || g.days || ['السبت', 'الثلاثاء'],
      startTime: g.startTime || '16:00',
      endTime: g.endTime || '18:00',
      roomName: g.roomName || g.hallName || 'معمل الحاسب الرئيسي (Lab 1)',
      startDate: g.startDate || '',
      endDate: g.endDate || ''
    });
    setIsQuickScheduleModalOpen(true);
  };

  const handleSaveQuickSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    setIsSubmitting(true);
    try {
      const res = await api.updateGroup(activeGroup.id, {
        scheduleDays: formData.scheduleDays,
        days: formData.scheduleDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roomName: formData.roomName,
        hallName: formData.roomName,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      if (res.success) {
        showToast(`تم تحديث مواعيد وأيام وقاعة المجموعة (${res.group.name}) بنجاح`, 'success');
        setIsQuickScheduleModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل الموعد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Duplicate Modal
  const handleOpenDuplicateModal = (g: Group) => {
    setActiveGroup(g);
    setDuplicateFormData({
      name: `${g.name} (فوج جديد)`,
      branchId: g.branchId,
      trainerId: g.trainerId || '',
      roomName: g.roomName || g.hallName || 'معمل الحاسب الرئيسي (Lab 1)',
      scheduleDays: g.scheduleDays || g.days || ['السبت', 'الثلاثاء'],
      startTime: g.startTime || '16:00',
      endTime: g.endTime || '18:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      whatsappGroupLink: '',
      notes: g.notes || '',
      status: 'active',
      grade: g.grade || ''
    });
    setIsDuplicateModalOpen(true);
  };

  const handleSaveDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;

    if (!duplicateFormData.name.trim()) {
      showToast('يرجى كتابة اسم للمجموعة المنسوخة', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.duplicateGroup(activeGroup.id, duplicateFormData);
      if (res.success) {
        if (res.group) {
          
        }
        showToast(`تم نسخ وإنشاء المجموعة الجديدة (${res.group.name}) بنجاح`, 'success');
        setIsDuplicateModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تكرار المجموعة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (g: Group) => {
    try {
      const res = await api.deleteGroup(g.id);
      if (res.success) {
        
        showToast(`تم حذف المجموعة (${g.name}) بنجاح`, 'success');
        setGroupToDelete(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المجموعة', 'error');
    }
  };

  const toggleDay = (day: string, isDuplicate = false) => {
    if (isDuplicate) {
      const next = (duplicateFormData.scheduleDays || []).includes(day)
        ? (duplicateFormData.scheduleDays || []).filter((d: string) => d !== day)
        : [...(duplicateFormData.scheduleDays || []), day];
      setDuplicateFormData({ ...duplicateFormData, scheduleDays: next });
    } else {
      const next = (formData.scheduleDays || []).includes(day)
        ? (formData.scheduleDays || []).filter((d: string) => d !== day)
        : [...(formData.scheduleDays || []), day];
      setFormData({ ...formData, scheduleDays: next });
    }
  };

  const applyDayPreset = (days: string[], isDuplicate = false) => {
    if (isDuplicate) {
      setDuplicateFormData({ ...duplicateFormData, scheduleDays: [...days] });
    } else {
      setFormData({ ...formData, scheduleDays: [...days] });
    }
  };

  const applyTimePreset = (start: string, end: string, isDuplicate = false) => {
    if (isDuplicate) {
      setDuplicateFormData({ ...duplicateFormData, startTime: start, endTime: end });
    } else {
      setFormData({ ...formData, startTime: start, endTime: end });
    }
  };

  // Copy Group WhatsApp Info
  const handleCopyGroupInfo = (g: Group) => {
    const course = courses.find(c => c.id === g.courseId);
    const trainer = trainers.find(tr => tr.id === g.trainerId);
    const daysStr = (g.scheduleDays || g.days)?.join(' - ') || 'السبت - الثلاثاء';
    const timeStr = `${formatTimeAMPM(g.startTime || '16:00')} إلى ${formatTimeAMPM(g.endTime || '18:00')}`;

    const text = `🎓 *تفاصيل المجموعة التدريبية - مركز النجاح*\n` +
      `📌 *المجموعة:* ${g.name}\n` +
      `📚 *الدورة:* ${course?.name || 'دورة متخصصة'}\n` +
      `👨‍🏫 *المدرب:* ${trainer?.name || 'مدرب معتمد'}\n` +
      `🏢 *القاعة/المعمل:* ${g.roomName || g.hallName || 'معمل التدريب'}\n` +
      `🗓️ *الأيام:* ${daysStr}\n` +
      `⏰ *الموعد:* ${timeStr}\n` +
      (g.whatsappGroupLink ? `🔗 *قروب الواتساب:* ${g.whatsappGroupLink}\n` : '') +
      `نتمنى لكم تدريباً ممتعاً وموفقاً! 🌟`;

    navigator.clipboard.writeText(text);
    showToast('تم نسخ تفاصيل المجموعة التدريبية إلى الحافظة للمشاركة عبر واتساب', 'success');
  };

  // Launch Google Meet Online Lecture for Group
  const handleStartGoogleMeet = async (g: Group) => {
    try {
      showToast(`جارٍ إنشاء وتجهيز قاعة محاضرة Google Meet للمجموعة (${g.name})... 🎥`, 'info');
      const meet = await GoogleMeetService.createMeetingSpace({ topic: g.name });
      if (meet?.meetingUri) {
        // Automatically copy lecture link and open meeting
        navigator.clipboard.writeText(meet.meetingUri);
        showToast(`تم إنشاء قاعة Google Meet بنجاح! تم نسخ الرابط (${meet.meetingUri}) 🌟`, 'success');
        GoogleMeetService.openMeeting(meet.meetingUri);
      }
    } catch (err: any) {
      showToast(err?.message || 'تعذر فتح Google Meet', 'error');
    }
  };

  // Filter groups based on search and selections
  const filteredGroups = groups.filter(g => {
    const course = courses.find(c => c.id === g.courseId);
    const trainer = trainers.find(tr => tr.id === g.trainerId);

    const matchesSearch =
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.roomName && g.roomName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course && course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trainer && trainer.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = selectedCourseFilter === 'all' || g.courseId === selectedCourseFilter;
    const matchesTrainer = selectedTrainerFilter === 'all' || g.trainerId === selectedTrainerFilter;
    const matchesStatus = selectedStatusFilter === 'all' || g.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesTrainer && matchesStatus;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ar');
    }
    if (sortBy === 'course') {
      const courseA = courses.find(c => c.id === a.courseId)?.name || '';
      const courseB = courses.find(c => c.id === b.courseId)?.name || '';
      return courseA.localeCompare(courseB, 'ar');
    }
    if (sortBy === 'branch') {
      const branchA = branches.find(br => br.id === a.branchId)?.name || '';
      const branchB = branches.find(br => br.id === b.branchId)?.name || '';
      return branchA.localeCompare(branchB, 'ar');
    }
    if (sortBy === 'startTime') {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    }
    if (sortBy === 'day') {
      const daysA = (a.scheduleDays || a.days || []).join(', ');
      const daysB = (b.scheduleDays || b.days || []).join(', ');
      return daysA.localeCompare(daysB, 'ar');
    }
    return 0;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Suggestions datalists */}
      <datalist id="group-name-suggestions">
        {existingGroupNames.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>
      <datalist id="room-name-suggestions">
        {existingRoomNames.map((r, i) => (
          <option key={i} value={r} />
        ))}
      </datalist>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                إدارة المجموعات التدريبية والقاعات
                <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {groups.length} مجموعة
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعديل الأسماء، تعديل المواعيد والأيام، نسخ وتكرار المجموعات، متابعة القاعات، وكشوفات الحضور
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* View mode toggle */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="عرض كبطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="عرض كجدول"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">جدول</span>
            </button>
          </div>

          <button
            onClick={handleOpenBatch}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
            title="إنشاء مجموعات متعددة دفعة واحدة"
          >
            <Layers className="w-4 h-4" />
            <span>إنشاء مجموعات بالجملة</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء مجموعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs dark:shadow-none">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">إجمالي المجموعات</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">{groups.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs dark:shadow-none">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">المجموعات الجارية</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {groups.filter(g => g.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs dark:shadow-none">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">المتدربون المسجلون</div>
            <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              {trainees.filter(t => t.groupId).length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs dark:shadow-none">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">القاعات والمعامل</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{existingRoomNames.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-850/90 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs dark:shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المجموعة، الدورة، المدرب، القاعة..."
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Course filter */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">كل الدورات التدريبية</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Trainer filter */}
          <select
            value={selectedTrainerFilter}
            onChange={(e) => setSelectedTrainerFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">كل المدربين</option>
            {trainers.map(tr => (
              <option key={tr.id} value={tr.id}>{tr.name}</option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-800 dark:text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
            title="ترتيب المجموعات"
          >
            <option value="createdAt">ترتيب: تاريخ الإنشاء</option>
            <option value="name">ترتيب: اسم المجموعة</option>
            <option value="course">ترتيب: الدورة أو الصف</option>
            <option value="branch">ترتيب: الفرع</option>
            <option value="startTime">ترتيب: ساعة المحاضرة</option>
            <option value="day">ترتيب: اليوم التدريبي</option>
          </select>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                selectedStatusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                selectedStatusFilter === 'active'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              جارية
            </button>
            <button
              onClick={() => setSelectedStatusFilter('upcoming')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                selectedStatusFilter === 'upcoming'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              قادمة
            </button>
            <button
              onClick={() => setSelectedStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                selectedStatusFilter === 'completed'
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              مكتملة
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-sm">جاري تحميل المجموعات التدريبية...</p>
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <Users2 className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <p className="font-black text-base text-slate-200">
            {searchQuery || selectedCourseFilter !== 'all' || selectedTrainerFilter !== 'all'
              ? 'لا توجد نتائج مطابقة لخيارات البحث والتصفية'
              : 'لا توجد مجموعات تدريبية مضافة حتى الآن'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            أنشئ مجموعات لربط المتدربين والمدربين بالقاعات والمواعيد بسهولة
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> إنشاء مجموعة جديدة الآن
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroups.map((g) => {
            const course = courses.find((c) => c.id === g.courseId);
            const trainer = trainers.find((tr) => tr.id === g.trainerId);
            const branch = branches.find((b) => b.id === g.branchId);
            const groupTrainees = getTraineesForGroup(g.id);
            const maxCap = g.maxCapacity || g.maxStudents || 15;
            const percentage = Math.min(100, Math.round((groupTrainees.length / maxCap) * 100));

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-gradient-to-b dark:from-slate-850 dark:to-slate-900 border border-slate-200/90 dark:border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                {/* Top Highlight line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-80" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {branch?.name || 'الفرع الرئيسي'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            g.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-500/40'
                              : g.status === 'upcoming'
                              ? 'bg-blue-500/15 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300/80 dark:border-blue-500/40'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {g.status === 'active' ? 'جارية (نشطة)' : g.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
                        </span>
                      </div>

                      {/* Group Name with Click-to-Edit */}
                      <h3
                        onClick={() => handleOpenEdit(g)}
                        className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-pointer transition-colors flex items-center gap-1.5"
                        title="اضغط لتعديل كافة تفاصيل المجموعة"
                      >
                        {g.name}
                        <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:text-slate-500 dark:group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400/90 font-bold mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course?.name || 'دورة تدريبية'}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {g.grade && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>الصف: {g.grade}</span>
                          </div>
                        )}
                        {g.track && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20">
                            <span>المسار: {g.track}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Box */}
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-3 shadow-inner">
                    {/* Trainer */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        المدرب:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{trainer?.name || 'غير محدد'}</span>
                    </div>

                    {/* Room / Lab */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        المعمل / القاعة:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{g.roomName || g.hallName || 'معمل 1'}</span>
                    </div>

                    {/* Lecture Days */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        أيام المحاضرات:
                      </span>
                      <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                        {(g.scheduleDays || g.days)?.join(' • ') || 'السبت • الثلاثاء'}
                      </span>
                    </div>

                    {/* Lecture Time */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        التوقيت:
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                        {formatTimeAMPM(g.startTime || '16:00')} إلى {formatTimeAMPM(g.endTime || '18:00')}
                      </span>
                    </div>

                    {/* Fee Amount */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        رسوم المجموعة:
                      </span>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                        {g.feeAmount !== undefined && g.feeAmount !== null ? `${g.feeAmount} ج.م` : `${course?.feeAmount || 0} ج.م (أساسي)`}
                      </span>
                    </div>

                    {/* Period Dates if present */}
                    {g.startDate && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800/80">
                        <span className="text-slate-500 dark:text-slate-400">فترة الدورة:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {g.startDate} {g.endDate ? `إلى ${g.endDate}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Trainees Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        المتدربون المسجلون:
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {groupTrainees.length} / {maxCap} متدرب
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 mr-1">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage >= 100
                            ? 'bg-rose-500'
                            : percentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons Toolbar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                  {/* Primary Tools */}
                  <div className="flex items-center gap-1">
                    {/* Trainees List Button */}
                    <button
                      onClick={() => {
                        setActiveGroup(g);
                        setIsTraineesModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80 shadow-xs dark:bg-purple-950/70 dark:hover:bg-purple-900 dark:text-purple-300 dark:border-purple-800/80 dark:shadow-none text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="عرض وإدارة المتدربين في هذه المجموعة"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>الطلاب ({groupTrainees.length})</span>
                    </button>

                    {/* Attendance Shortcut */}
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 shadow-xs dark:bg-blue-950/70 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800/80 dark:shadow-none text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="رصد الحضور لهذه المجموعة"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>الحضور</span>
                      </button>
                    )}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    {/* Quick Reschedule */}
                    <button
                      onClick={() => handleOpenQuickSchedule(g)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-amber-500/20 dark:text-slate-300 dark:hover:text-amber-400 dark:border-slate-700 dark:shadow-none transition-colors cursor-pointer"
                      title="تعديل سريع للموعد والأيام والقاعة"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </button>

                    {/* Google Meet Online Session */}
                    <button
                      onClick={() => handleStartGoogleMeet(g)}
                      className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800 border border-teal-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-teal-500/20 dark:text-slate-300 dark:hover:text-teal-400 dark:border-slate-700 dark:shadow-none transition-colors cursor-pointer"
                      title="بدء محاضرة أونلاين عبر Google Meet"
                    >
                      <Video className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </button>

                    {/* Print Roster */}
                    <button
                      onClick={() => {
                        setActiveGroup(g);
                        setIsPrintRosterModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 border border-sky-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-blue-500/20 dark:text-slate-300 dark:hover:text-blue-400 dark:border-slate-700 dark:shadow-none transition-colors cursor-pointer"
                      title="طباعة كشف الحضور للمجموعة"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    </button>

                    {/* Copy Info / WhatsApp */}
                    <button
                      onClick={() => handleCopyGroupInfo(g)}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-emerald-500/20 dark:text-slate-300 dark:hover:text-emerald-400 dark:border-slate-700 dark:shadow-none transition-colors cursor-pointer"
                      title="نسخ بيانات المجموعة ومشاركتها عبر واتساب"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>

                    {/* Duplicate Clone */}
                    <button
                      onClick={() => handleOpenDuplicateModal(g)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-yellow-500/20 dark:text-slate-300 dark:hover:text-yellow-400 dark:border-slate-700 dark:shadow-none transition-colors cursor-pointer"
                      title="نسخ وتكرار المجموعة لإنشاء فوج جديد"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-yellow-400" />
                    </button>

                    {/* Full Edit */}
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200/80 shadow-xs dark:bg-blue-900/60 dark:hover:bg-blue-800 dark:text-blue-200 dark:border-blue-700 dark:shadow-none transition-colors cursor-pointer"
                      title="تعديل شامل لبيانات المجموعة"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-200" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setGroupToDelete(g)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/80 shadow-xs dark:bg-rose-950/70 dark:hover:bg-rose-900 dark:text-rose-300 dark:border-rose-800 dark:shadow-none transition-colors cursor-pointer"
                      title="حذف المجموعة"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">اسم المجموعة</th>
                  <th className="p-3.5">الدورة التدريبية</th>
                  <th className="p-3.5">المدرب</th>
                  <th className="p-3.5">المعمل / القاعة</th>
                  <th className="p-3.5">الأيام والمواعيد</th>
                  <th className="p-3.5">المتدربون</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات والأدوات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {sortedGroups.map((g) => {
                  const course = courses.find((c) => c.id === g.courseId);
                  const trainer = trainers.find((tr) => tr.id === g.trainerId);
                  const groupTrainees = getTraineesForGroup(g.id);
                  const maxCap = g.maxCapacity || g.maxStudents || 15;

                  return (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        <div
                          onClick={() => handleOpenEdit(g)}
                          className="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 font-bold"
                          title="اضغط للتعديل"
                        >
                          {g.name}
                        </div>
                        {g.notes && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-xs">{g.notes}</div>}
                      </td>

                      <td className="p-3.5 text-amber-700 dark:text-amber-400 font-bold">
                        {course?.name || 'دورة تدريبية'}
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {trainer?.name || 'غير محدد'}
                      </td>

                      <td className="p-3.5">
                        <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {g.roomName || g.hallName || 'معمل 1'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {(g.scheduleDays || g.days)?.join(' • ')}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {g.startTime} - {g.endTime}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">
                        <button
                          onClick={() => {
                            setActiveGroup(g);
                            setIsTraineesModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900 cursor-pointer"
                        >
                          {groupTrainees.length} / {maxCap}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            g.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                              : g.status === 'upcoming'
                              ? 'bg-blue-500/15 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-500/40'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {g.status === 'active' ? 'نشطة' : g.status === 'upcoming' ? 'قادمة' : 'مكتملة'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenQuickSchedule(g)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-amber-500/20 dark:text-slate-300 dark:hover:text-amber-400 dark:border-slate-700 dark:shadow-none cursor-pointer"
                            title="تعديل سريع للموعد"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </button>

                          <button
                            onClick={() => handleStartGoogleMeet(g)}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-teal-500/20 dark:text-slate-300 dark:hover:text-teal-400 dark:border-slate-700 dark:shadow-none cursor-pointer"
                            title="بدء قاعة Google Meet للمجموعة"
                          >
                            <Video className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          </button>

                          <button
                            onClick={() => handleOpenDuplicateModal(g)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-yellow-500/20 dark:text-slate-300 dark:hover:text-yellow-400 dark:border-slate-700 dark:shadow-none cursor-pointer"
                            title="نسخ وتكرار المجموعة"
                          >
                            <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-yellow-400" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 shadow-xs dark:bg-blue-900/60 dark:hover:bg-blue-800 dark:text-blue-200 dark:border-blue-700 dark:shadow-none cursor-pointer"
                            title="تعديل شامل"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-200" />
                          </button>

                          <button
                            onClick={() => setGroupToDelete(g)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 shadow-xs dark:bg-rose-950/70 dark:hover:bg-rose-900 dark:text-rose-300 dark:border-rose-800 dark:shadow-none cursor-pointer"
                            title="حذف المجموعة"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH CREATE GROUPS MODAL                                                */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">إنشاء مجموعات بالجملة دفعة واحدة</h3>
                  <p className="text-[11px] text-slate-400">إنشاء عدة مجموعات بنفس الدورة والفرع وتحديد رسوم فرع معينة</p>
                </div>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الدورة التدريبية *</label>
                <select
                  value={batchFormData.courseId ?? ''}
                  onChange={(e) => setBatchFormData({ ...batchFormData, courseId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.feeAmount} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع *</label>
                  <select
                    value={batchFormData.branchId ?? ''}
                    onChange={(e) => setBatchFormData({ ...batchFormData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">عدد المجموعات المراد إنشاؤها *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={batchFormData.count}
                    onChange={(e) => setBatchFormData({ ...batchFormData, count: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Fee Amount Override */}
              <div>
                <label className="block text-amber-300 font-bold mb-1">رسوم الدورة لهذه المجموعات (اختياري)</label>
                <input
                  type="number"
                  value={batchFormData.feeAmount ?? ''}
                  onChange={(e) => setBatchFormData({ ...batchFormData, feeAmount: e.target.value })}
                  placeholder="مثال: 250 لفرع بدر أو 200 لفرع النجاح"
                  className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">تحديد سعر خاص للفرع (يترك فارغاً للاستعانة بالسعر الأساسي للدورة)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسار / الشعبة</label>
                  <input
                    type="text"
                    value={batchFormData.track}
                    onChange={(e) => setBatchFormData({ ...batchFormData, track: e.target.value })}
                    placeholder="عربي / إنجليزي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">بادئة اسم المجموعة (اختياري)</label>
                  <input
                    type="text"
                    value={batchFormData.prefixName}
                    onChange={(e) => setBatchFormData({ ...batchFormData, prefixName: e.target.value })}
                    placeholder="مثال: مجموعة الذكاء الاصطناعي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المجموعات الآن 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD GROUP MODAL                                                       */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">إنشاء مجموعة تدريبية جديدة</h3>
                  <p className="text-[11px] text-slate-400">حدد بيانات وتوقيت وأيام القاعة للمجموعة</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>نظام المنهج المقرر: <strong>محاضرة لمدة ساعة واحدة فقط</strong>، بواقع <strong>يومان أسبوعياً</strong> (إجمالي ساعتين أسبوعياً).</span>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المجموعة التدريبية *</label>
                <input
                  type="text"
                  required
                  list="group-name-suggestions"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مجموعة البرمجة والذكاء الاصطناعي - فوج المساء"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold text-sm"
                />
              </div>

              {/* Arabic Grade Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصف الدراسي (لتوزيع الطلاب تلقائياً) *</label>
                  <select
                    required
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="">-- اختر الصف الدراسي --</option>
                    <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                    <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                    <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                    <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                    <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسار / نوع التعليم *</label>
                  <select
                    required
                    value={formData.track ?? 'عربي'}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="عربي">عربي (الدراسة باللغة العربية)</option>
                    <option value="لغات">لغات (الدراسة باللغة الإنجليزية/الفرنسية)</option>
                    <option value="أزهري">أزهري</option>
                    <option value="دولي">دولي</option>
                  </select>
                </div>
              </div>

              {/* Branch + Course */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع *</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الدورة التدريبية *</label>
                  <select
                    value={formData.courseId ?? ''}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fee Amount Override per Group */}
              <div>
                <label className="block text-amber-300 font-bold mb-1">رسوم الدورة لهذه المجموعة (اختياري)</label>
                <input
                  type="number"
                  value={formData.feeAmount ?? ''}
                  onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value !== '' ? Number(e.target.value) : '' })}
                  placeholder="يترك فارغاً لاستخدام السعر الافتراضي للدورة"
                  className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">مثال: فرع بدر 250، فرع النجاح 200 (يتطبق تلقائياً للمتدربين بهذه المجموعة)</p>
              </div>

              {/* Trainer + Room / Lab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المدرب المشرف</label>
                  <select
                    value={formData.trainerId ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- بدون تحديد مدرب حالياً --</option>
                    {trainers.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} - {tr.specialty || 'مدرب معتمد'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المعمل / القاعة</label>
                  <input
                    type="text"
                    list="room-name-suggestions"
                    value={formData.roomName ?? ''}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    placeholder="معمل الحاسب الرئيسي (Lab 1)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Days Selection with Quick Presets */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">أيام المحاضرات الأسبوعية</label>
                  <div className="text-[10px] text-slate-400">نماذج سريعة:</div>
                </div>

                {/* Day Presets */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {dayPresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyDayPreset(preset.days)}
                      className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Individual Days Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {daysList.map((day) => {
                    const isSel = (formData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                          isSel
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing Selection with Presets */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">توقيت المحاضرات</label>
                  <div className="text-[10px] text-slate-400">أوقات شائعة:</div>
                </div>

                {/* Time Slot Presets */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {timePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyTimePreset(preset.start, preset.end)}
                      className="px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-semibold"
                    >
                      {preset.label} ({preset.start}-{preset.end})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1">وقت البدء</label>
                    <input
                      type="time"
                      value={formData.startTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={formData.endTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dates + Capacity + Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formData.startDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.endDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعة المقاعد</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxCapacity ?? ''}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الحالة</label>
                  <select
                    value={formData.status ?? ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="active">جارية (نشطة)</option>
                    <option value="upcoming">قادمة (مجدولة)</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغاة</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp Link + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رابط قروب WhatsApp للمجموعة</label>
                  <input
                    type="url"
                    value={formData.whatsappGroupLink ?? ''}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ملاحظات وتعليمات</label>
                  <input
                    type="text"
                    value={formData.notes ?? ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="مثال: يرجى إحضار اللابتوب في المعمل"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإنشاء المجموعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMPREHENSIVE EDIT GROUP MODAL                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">تعديل كافة بيانات المجموعة: {activeGroup.name}</h3>
                  <p className="text-[11px] text-slate-400">يمكنك تعديل الاسم، المواعيد، الأيام، المدرب، والقاعة</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Group Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المجموعة التدريبية *</label>
                <input
                  type="text"
                  required
                  list="group-name-suggestions"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-bold text-sm"
                />
              </div>

              {/* Arabic Grade Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصف الدراسي (لتوزيع الطلاب تلقائياً) *</label>
                  <select
                    required
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="">-- اختر الصف الدراسي العربي --</option>
                    <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                    <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                    <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                    <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                    <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسار / نوع التعليم *</label>
                  <select
                    required
                    value={formData.track ?? 'عربي'}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="عربي">عربي (الدراسة باللغة العربية)</option>
                    <option value="لغات">لغات (الدراسة باللغة الإنجليزية/الفرنسية)</option>
                    <option value="أزهري">أزهري</option>
                    <option value="دولي">دولي</option>
                  </select>
                </div>
              </div>

              {/* Branch + Course */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع *</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الدورة التدريبية *</label>
                  <select
                    value={formData.courseId ?? ''}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fee Amount Override per Group */}
              <div>
                <label className="block text-blue-300 font-bold mb-1">رسوم الدورة لهذه المجموعة (اختياري)</label>
                <input
                  type="number"
                  value={formData.feeAmount ?? ''}
                  onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value !== '' ? Number(e.target.value) : '' })}
                  placeholder="يترك فارغاً لاستخدام السعر الافتراضي للدورة"
                  className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-3 py-2 text-blue-300 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">مثال: فرع بدر 250، فرع النجاح 200</p>
              </div>

              {/* Trainer + Room / Lab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المدرب المشرف</label>
                  <select
                    value={formData.trainerId ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- بدون تحديد مدرب --</option>
                    {trainers.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} - {tr.specialty || 'مدرب معتمد'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المعمل / القاعة</label>
                  <input
                    type="text"
                    list="room-name-suggestions"
                    value={formData.roomName ?? ''}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Days Selection */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">أيام المحاضرات</label>
                  <div className="text-[10px] text-slate-400">نماذج سريعة:</div>
                </div>

                <div className="flex flex-wrap gap-1.5 pb-1">
                  {dayPresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyDayPreset(preset.days)}
                      className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {daysList.map((day) => {
                    const isSel = (formData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                          isSel
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md font-black'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing Selection */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">التوقيت</label>
                  <div className="text-[10px] text-slate-400">أوقات شائعة:</div>
                </div>

                <div className="flex flex-wrap gap-1.5 pb-1">
                  {timePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyTimePreset(preset.start, preset.end)}
                      className="px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono"
                    >
                      {preset.label} ({preset.start}-{preset.end})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1">وقت البدء</label>
                    <input
                      type="time"
                      value={formData.startTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={formData.endTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dates + Capacity + Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formData.startDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.endDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعة المقاعد</label>
                  <input
                    type="number"
                    value={formData.maxCapacity ?? ''}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الحالة</label>
                  <select
                    value={formData.status ?? ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="active">جارية (نشطة)</option>
                    <option value="upcoming">قادمة (مجدولة)</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغاة</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp Link + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رابط قروب WhatsApp</label>
                  <input
                    type="url"
                    value={formData.whatsappGroupLink ?? ''}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ملاحظات وتعليمات</label>
                  <input
                    type="text"
                    value={formData.notes ?? ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setGroupToDelete(activeGroup);
                  }}
                  className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl inline-flex items-center gap-1.5 font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المجموعة</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. QUICK SCHEDULE MODAL                                                  */}
      {/* ========================================================================= */}
      {isQuickScheduleModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">تعديل سريع للموعد والأيام: {activeGroup.name}</h3>
                  <p className="text-[11px] text-slate-400">تغيير سريع لمواعيد المحاضرات والقاعة</p>
                </div>
              </div>
              <button onClick={() => setIsQuickScheduleModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSchedule} className="space-y-4 text-xs">
              {/* Room / Lab */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">المعمل / القاعة</label>
                <input
                  type="text"
                  list="room-name-suggestions"
                  value={formData.roomName ?? ''}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* Days selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">أيام المحاضرات</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dayPresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyDayPreset(preset.days)}
                      className="px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {daysList.map((day) => {
                    const isSel = (formData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                          isSel
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">وقت المحاضرة</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {timePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => applyTimePreset(preset.start, preset.end)}
                      className="px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono"
                    >
                      {preset.label} ({preset.start}-{preset.end})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">وقت البدء</label>
                    <input
                      type="time"
                      value={formData.startTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={formData.endTime ?? ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحفظ الموعد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DUPLICATE GROUP MODAL                                                 */}
      {/* ========================================================================= */}
      {isDuplicateModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl max-w-xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">نسخ وتكرار المجموعة التدريبية</h3>
                  <p className="text-[11px] text-slate-400">إنشاء فوج أو دورة جديدة مطابقة من: {activeGroup.name}</p>
                </div>
              </div>
              <button onClick={() => setIsDuplicateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuplicate} className="space-y-4 text-xs">
              {/* Cloned Group Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المجموعة الجديدة *</label>
                <input
                  type="text"
                  required
                  value={duplicateFormData.name}
                  onChange={(e) => setDuplicateFormData({ ...duplicateFormData, name: e.target.value })}
                  placeholder="مثال: مجموعة الجرافيك - فوج 2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold text-sm"
                />
              </div>

              {/* Arabic Grade Dropdown */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">الصف الدراسي للمجموعة الجديدة *</label>
                <select
                  required
                  value={duplicateFormData.grade ?? ''}
                  onChange={(e) => setDuplicateFormData({ ...duplicateFormData, grade: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="">-- اختر الصف الدراسي العربي --</option>
                  <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                  <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                  <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                  <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                  <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                  <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </select>
              </div>

              {/* Branch + Trainer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع</label>
                  <select
                    value={duplicateFormData.branchId}
                    onChange={(e) => setDuplicateFormData({ ...duplicateFormData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المدرب المشرف</label>
                  <select
                    value={duplicateFormData.trainerId}
                    onChange={(e) => setDuplicateFormData({ ...duplicateFormData, trainerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="">-- نفس المدرب --</option>
                    {trainers.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Days selection */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <label className="block text-slate-300 font-bold mb-1.5">الأيام</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysList.map((day) => {
                    const isSel = (duplicateFormData.scheduleDays || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day, true)}
                        className={`px-3 py-1 rounded-xl border font-bold text-xs transition-all ${
                          isSel
                            ? 'bg-yellow-500 text-slate-950 border-yellow-500 font-black'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={duplicateFormData.startTime}
                    onChange={(e) => setDuplicateFormData({ ...duplicateFormData, startTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={duplicateFormData.endTime}
                    onChange={(e) => setDuplicateFormData({ ...duplicateFormData, endTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">المعمل / القاعة</label>
                <input
                  type="text"
                  list="room-name-suggestions"
                  value={duplicateFormData.roomName}
                  onChange={(e) => setDuplicateFormData({ ...duplicateFormData, roomName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-yellow-500/25 flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري النسخ...' : 'تأكيد النسخ والتكرار'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GROUP TRAINEES MODAL / DRAWER                                         */}
      {/* ========================================================================= */}
      {isTraineesModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">
                    متدربو المجموعة: {activeGroup.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    عدد الطلاب: {getTraineesForGroup(activeGroup.id).length} من أصل {activeGroup.maxCapacity || 15} مقعد
                  </p>
                </div>
              </div>
              <button onClick={() => setIsTraineesModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {getTraineesForGroup(activeGroup.id).length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800 p-6">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-300 text-sm">لا يوجد متدربون مسجلون في هذه المجموعة بعد</p>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك تعيين متدربين لهذه المجموعة من شاشة (المتدربون) أو عند تسجيل متدرب جديد
                </p>
                {onNavigate && (
                  <button
                    onClick={() => {
                      setIsTraineesModalOpen(false);
                      onNavigate('trainees');
                    }}
                    className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                  >
                    الانتقال لشاشة المتدربين
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {getTraineesForGroup(activeGroup.id).map((t, idx) => (
                  <div
                    key={t.id}
                    className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center justify-between gap-3 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 font-mono text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt={t.fullName} className="w-9 h-9 rounded-full object-cover border border-amber-500/50" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {t.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{t.fullName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono bg-slate-900 px-1.5 py-0.2 rounded">{t.code}</span>
                          <span>{t.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.remainingAmount && t.remainingAmount > 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {t.remainingAmount && t.remainingAmount > 0
                          ? `متبقي: ${t.remainingAmount} ج.م`
                          : 'مسدد بالكامل'}
                      </span>

                      {t.phone && (
                        <a
                          href={`https://wa.me/2${t.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-4">
              <button
                onClick={() => {
                  setIsTraineesModalOpen(false);
                  setIsPrintRosterModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة كشف الحضور</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTraineesModalOpen(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PRINT ATTENDANCE ROSTER SHEET MODAL                                    */}
      {/* ========================================================================= */}
      {isPrintRosterModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full p-6 text-slate-100 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">معاينة وطباعة كشف الحضور للمجموعة: {activeGroup.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الكشف الآن</span>
                </button>
                <button onClick={() => setIsPrintRosterModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 shadow-inner font-sans text-xs">
              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
                <div className="text-right">
                  <h2 className="text-lg font-black text-slate-900">مركز النجاح للتدريب والاستشارات</h2>
                  <p className="text-[10px] text-slate-600 font-mono">NAGAH TRAINING & CONSULTING CENTER</p>
                  <p className="text-[10px] font-bold text-amber-700 mt-1">كشف تسجيل الحضور والغياب للمجموعة التدريبية</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-xl p-1 border-2 border-amber-600 flex items-center justify-center shadow-sm">
                  <img src="/logo.svg" alt="مركز النجاح" className="w-full h-full object-contain" />
                </div>
                <div className="text-left font-mono text-[10px] text-slate-600">
                  <div>تاريخ الطباعة: {new Date().toISOString().split('T')[0]}</div>
                  <div>المعمل: {activeGroup.roomName || activeGroup.hallName || 'معمل 1'}</div>
                </div>
              </div>

              {/* Group Info Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">المجموعة:</span>
                  <strong className="text-slate-900 font-black">{activeGroup.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">الدورة:</span>
                  <strong className="text-slate-900">{courses.find(c => c.id === activeGroup.courseId)?.name || 'دورة تدريبية'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">المدرب:</span>
                  <strong className="text-slate-900">{trainers.find(tr => tr.id === activeGroup.trainerId)?.name || 'المدرب المعتمد'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">المواعيد والأيام:</span>
                  <strong className="text-slate-900">{(activeGroup.scheduleDays || activeGroup.days)?.join(' - ')} ({formatTimeAMPM(activeGroup.startTime || '16:00')} - {formatTimeAMPM(activeGroup.endTime || '18:00')})</strong>
                </div>
              </div>

              {/* Trainees Attendance Table */}
              <table className="w-full text-right border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black">
                    <th className="border border-slate-300 p-2 w-8 text-center">م</th>
                    <th className="border border-slate-300 p-2">كود المتدرب</th>
                    <th className="border border-slate-300 p-2">اسم المتدرب رباعياً</th>
                    <th className="border border-slate-300 p-2">رقم الهاتف</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <th key={n} className="border border-slate-300 p-1 w-6 text-center">ح{n}</th>
                    ))}
                    <th className="border border-slate-300 p-2">ملاحظات المدرب</th>
                  </tr>
                </thead>
                <tbody>
                  {getTraineesForGroup(activeGroup.id).map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5 font-mono font-bold">{t.code}</td>
                      <td className="border border-slate-300 p-1.5 font-bold text-slate-900">{t.fullName}</td>
                      <td className="border border-slate-300 p-1.5 font-mono">{t.phone}</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <td key={n} className="border border-slate-300 p-1 text-center"></td>
                      ))}
                      <td className="border border-slate-300 p-1.5"></td>
                    </tr>
                  ))}
                  {/* Empty rows for late walk-ins */}
                  {[1, 2, 3].map(extra => (
                    <tr key={`extra-${extra}`} className="h-6">
                      <td className="border border-slate-300 p-1 text-center text-slate-400">{getTraineesForGroup(activeGroup.id).length + extra}</td>
                      <td className="border border-slate-300 p-1"></td>
                      <td className="border border-slate-300 p-1"></td>
                      <td className="border border-slate-300 p-1"></td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <td key={n} className="border border-slate-300 p-1"></td>
                      ))}
                      <td className="border border-slate-300 p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 mt-6 border-t border-slate-300 text-xs">
                <div>
                  <p className="font-bold text-slate-700">توقيع المدرب المسؤول:</p>
                  <p className="font-mono text-slate-400 mt-6">..........................................</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-700">اعتماد إدارة شؤون المتدربين:</p>
                  <p className="font-mono text-slate-400 mt-6">..........................................</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DELETE CONFIRMATION MODAL                                             */}
      {/* ========================================================================= */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">تأكيد حذف المجموعة التدريبية</h3>
                <p className="text-xs text-slate-400">سيتم إزالة المجموعة من النظام وقوائم التدريب</p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 my-4 space-y-1.5">
              <p>
                <strong className="text-slate-200">المجموعة:</strong> {groupToDelete.name}
              </p>
              <p>
                <strong className="text-slate-200">القاعة / المعمل:</strong> {groupToDelete.roomName || groupToDelete.hallName}
              </p>
              <p>
                <strong className="text-slate-200">الطلاب المسجلين:</strong> {getTraineesForGroup(groupToDelete.id).length} متدرب
              </p>
              <p className="text-amber-400/90 text-[11px] pt-1">
                نصيحة: يمكنك أيضاً تعديل الموعد أو تكرار المجموعة بدلاً من حذفها.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(groupToDelete)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
