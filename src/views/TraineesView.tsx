import { WhatsAppShareModal } from "../components/WhatsAppShareModal";
import { ElectronicPaymentWidget } from "../components/ElectronicPaymentWidget";
import { getVodafoneCashUssdCode, executeVodafoneCashPayment, executeInstaPayPayment } from "../utils/paymentUtils";
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { cloudDb } from '../services/cloudDatabase';

const GRADE_OPTIONS = [
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
import {
  getTraineePaymentStatusInfo,
  isPaymentReminderWindow,
  isTraineeUnpaid
} from '../utils/paymentUtils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Edit,
  Trash2,
  Phone,
  CreditCard,
  MessageSquare,
  Star,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  X,
  FileText,
  Building,
  BookOpen,
  Sparkles,
  Shield,
  Camera,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Plus,
  Minus,
  Award,
  CheckSquare,
  Square,
  Send,
  ShieldCheck,
  Heart,
  UserCheck,
  Zap,
  Link as LinkIcon,
  GraduationCap,
  Wand2,
  Share2,
  RefreshCw,
  Check
} from 'lucide-react';
import { Trainee, Course, Group, Trainer, Branch, PaymentMethod } from '../types';
import { StudentPhotoCropperModal } from '../components/StudentPhotoCropperModal';
import { ShareRegistrationModal } from '../components/ShareRegistrationModal';
import { AIHomeworkScannerModal } from '../components/AIHomeworkScannerModal';
import { BatchPromotionModal } from '../components/BatchPromotionModal';
import { StudentPromotionModal } from '../components/StudentPromotionModal';
import { TraineeDigitalCardModal } from '../components/TraineeDigitalCardModal';
import { StudentCardsBroadcastModal } from '../components/StudentCardsBroadcastModal';
import { GoogleSheetsHubModal } from '../components/GoogleSheetsHubModal';
import { GoogleSheetsService } from '../services/googleSheets';
import { GoogleFormsImportModal } from '../components/GoogleFormsImportModal';

export const TraineesView: React.FC = () => {
  const { branches, activeBranchId, showToast, setPrintData, refreshKey, settings } = useCenter();
  const { user } = useAuth();

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: Table or Student Cards (Auto-adaptive default on mobile)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileToolsDrawerOpen, setIsMobileToolsDrawerOpen] = useState(false);

  // Auto switch to cards if window resizes to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode(prev => (prev === 'table' ? 'cards' : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_desc');

  const matchBranch = (traineeBranchId: string | undefined | null, targetBranchId: string, allBranches: Branch[]) => {
    if (!targetBranchId || targetBranchId === 'all') return true;
    if (!traineeBranchId) return true;
    if (traineeBranchId === targetBranchId) return true;

    const normalize = (id: string) => {
      const s = String(id || '').trim().toLowerCase();
      if (s === 'branch-1' || s === 'nagah-main' || s === 'main' || s === 'فرع النجاح الرئيسي') return 'branch-main';
      if (s === 'branch-2' || s === 'badr-branch' || s === 'فرع بدر التكنولوجي') return 'branch-badr';
      return s;
    };

    if (normalize(traineeBranchId) === normalize(targetBranchId)) return true;

    const targetBranch = (allBranches || []).find(b => b.id === targetBranchId || b.branchId === targetBranchId || b.name === targetBranchId);
    const traineeBranch = (allBranches || []).find(b => b.id === traineeBranchId || b.branchId === traineeBranchId || b.name === traineeBranchId);

    if (targetBranch && traineeBranch) {
      if (targetBranch.id === traineeBranch.id || targetBranch.branchId === traineeBranch.branchId || targetBranch.name === traineeBranch.name) {
        return true;
      }
    }

    if (targetBranch && (targetBranch.id === traineeBranchId || targetBranch.branchId === traineeBranchId || targetBranch.name === traineeBranchId)) {
      return true;
    }

    return false;
  };

  const filteredTrainees = React.useMemo(() => {
    let result = (Array.isArray(trainees) ? trainees : []).filter((t) => {
      if (selectedBranch && selectedBranch !== 'all') {
        const traineeBranch = t.branchId || (t as any).branch_id || (t as any).branchCode;
        if (!matchBranch(traineeBranch, selectedBranch, branches)) {
          return false;
        }
      }
      if (selectedCourse && selectedCourse !== 'all' && t.courseId !== selectedCourse) {
        if (!t.courseIds || !t.courseIds.includes(selectedCourse)) {
          return false;
        }
      }
      if (selectedGroup && selectedGroup !== 'all' && t.groupId !== selectedGroup) {
        return false;
      }
      if (selectedTrainer && selectedTrainer !== 'all' && t.trainerId !== selectedTrainer) {
        return false;
      }
      if (selectedStatus && selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match = (t.fullName && t.fullName.toLowerCase().includes(q)) ||
          (t.code && String(t.code).toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q)) ||
          (t.parentPhone && t.parentPhone.includes(q));
        if (!match) return false;
      }
      if (selectedPaymentStatus === 'reminder_window') {
        return isPaymentReminderWindow() && isTraineeUnpaid(t);
      }
      if (selectedPaymentStatus === 'unpaid') {
        return isTraineeUnpaid(t);
      }
      if (selectedPaymentStatus === 'paid') {
        return !t.isExempt && !isTraineeUnpaid(t);
      }
      if (selectedPaymentStatus === 'exempt') {
        return t.isExempt === true;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'name_desc':
          return (b.fullName || '').localeCompare(a.fullName || '');
        case 'code_asc':
          return String(a.code || '').localeCompare(String(b.code || ''));
        case 'code_desc':
          return String(b.code || '').localeCompare(String(a.code || ''));
        case 'points_desc':
          return (b.totalPoints || 0) - (a.totalPoints || 0);
        case 'points_asc':
          return (a.totalPoints || 0) - (b.totalPoints || 0);
        case 'debt_desc':
          return (Number(b.remainingAmount) || 0) - (Number(a.remainingAmount) || 0);
        case 'debt_asc':
          return (Number(a.remainingAmount) || 0) - (Number(b.remainingAmount) || 0);
        case 'created_asc':
          return new Date(a.createdAt || a.registrationDate || 0).getTime() - new Date(b.createdAt || b.registrationDate || 0).getTime();
        case 'created_desc':
        default:
          return new Date(b.createdAt || b.registrationDate || 0).getTime() - new Date(a.createdAt || a.registrationDate || 0).getTime();
      }
    });

    return result;
  }, [trainees, selectedBranch, selectedCourse, selectedGroup, selectedTrainer, selectedStatus, selectedPaymentStatus, searchQuery, sortBy]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormsImportModalOpen, setIsFormsImportModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [isSyncingBatch, setIsSyncingBatch] = useState(false);
  const [syncBatchResultModal, setSyncBatchResultModal] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAiScannerModalOpen, setIsAiScannerModalOpen] = useState(false);
  const [scannerTraineeId, setScannerTraineeId] = useState<string | undefined>(undefined);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [selectedDigitalCardTrainee, setSelectedDigitalCardTrainee] = useState<Trainee | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // UI states for organized top bar dropdowns
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

  // Star Award State
  const [starTargetTrainees, setStarTargetTrainees] = useState<Trainee[]>([]);
  const [starCount, setStarCount] = useState<number>(1);
  const [starPoints, setStarPoints] = useState<number>(10);
  const [starReason, setStarReason] = useState<string>('مشاركة متميزة وتفاعل إيجابي في المحاضرة');
  const [starCustomReason, setStarCustomReason] = useState<string>('');
  const [starSendWhatsApp, setStarSendWhatsApp] = useState<boolean>(false);
  const [isSubmittingStars, setIsSubmittingStars] = useState<boolean>(false);

  // Selected trainee data
  const [activeTrainee, setActiveTrainee] = useState<Trainee | null>(null);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [bulkAssignGroupId, setBulkAssignGroupId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, type: 'single' | 'bulk', trainee?: Trainee} | null>(null);
  const [traineeProfileData, setTraineeProfileData] = useState<any>(null);

  // Student Care Vault & Early Warning States
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [vaultPinInput, setVaultPinInput] = useState<string>('');
  const [careNotes, setCareNotes] = useState<any[]>([]);
  const [newCareNote, setNewCareNote] = useState<string>('');
  const [careCategory, setCareCategory] = useState<'psychological' | 'social' | 'academic_support' | 'counselor_plan'>('psychological');

  // Form states
  const [formData, setFormData] = useState<any>({
    fullName: '',
    code: '',
    phone: '',
    parentPhone: '',
    parentName: '',
    nationalId: '',
    birthDate: '',
    gender: 'male',
    address: '',
    branchId: '',
    courseId: '',
    groupId: '',
    trainerId: '',
    feeAmount: 0,
    discountAmount: 0,
    initialPayment: 0,
    initialPaymentMethod: 'cash',
    photoUrl: '',
    status: 'active',
    notes: ''
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // Student Photo Studio State
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [photoStudioTargetMode, setPhotoStudioTargetMode] = useState<'add' | 'edit'>('add');


  const [nextCode, setNextCode] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  // WhatsApp Message State
  const [waMessage, setWaMessage] = useState('');

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResults, setImportResults] = useState<{
    importedCount: number;
    errorsCount: number;
    errors: any[];
  } | null>(null);

  // AI Excel Smart Placement State
  const [importPreviewStudents, setImportPreviewStudents] = useState<any[] | null>(null);
  const [importAvailableGroups, setImportAvailableGroups] = useState<any[]>([]);
  const [isImportPreviewLoading, setIsImportPreviewLoading] = useState(false);
  const [isImportCommiting, setIsImportCommiting] = useState(false);

  // Broadcast Student Cards & Codes Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTargetTrainee, setBroadcastTargetTrainee] = useState<Trainee | null>(null);

  const handleOpenBroadcastModal = (t?: Trainee) => {
    setBroadcastTargetTrainee(t || null);
    setIsBroadcastModalOpen(true);
  };

  useEffect(() => {
    setSelectedBranch(activeBranchId);
  }, [activeBranchId]);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useEffect(() => {
    // Realtime live subscription to cloud Firestore trainees
    const unsubscribe = cloudDb.listenToTrainees((cloudTrainees) => {
      if (cloudTrainees && Array.isArray(cloudTrainees)) {
        setTrainees(cloudTrainees);
        try { localStorage.setItem('nagah_trainees', JSON.stringify(cloudTrainees)); } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [traineesRes, coursesRes, groupsRes, trainersRes] = await Promise.all([
        api.getTrainees().catch((e) => { console.warn('getTrainees failed:', e); return null; }),
        api.getCourses().catch((e) => { console.warn('getCourses failed:', e); return null; }),
        api.getGroups().catch((e) => { console.warn('getGroups failed:', e); return null; }),
        api.getTrainers().catch((e) => { console.warn('getTrainers failed:', e); return null; })
      ]);

      if (Array.isArray(traineesRes)) {
        const traineeMap = new Map<string, Trainee>();
        traineesRes.forEach(t => traineeMap.set(t.id, t));
        const freshList = Array.from(traineeMap.values());
        setTrainees(freshList);
        try { localStorage.setItem('nagah_trainees', JSON.stringify(freshList)); } catch {}
      } else {
        const cached = localStorage.getItem('nagah_trainees');
        if (cached) {
          try { setTrainees(JSON.parse(cached)); } catch {}
        }
      }

      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
        try { localStorage.setItem('nagah_courses', JSON.stringify(coursesRes)); } catch {}
      } else {
        const cached = localStorage.getItem('nagah_courses');
        if (cached) {
          try { setCourses(JSON.parse(cached)); } catch {}
        }
      }

      if (Array.isArray(groupsRes)) {
        setGroups(groupsRes);
        try { localStorage.setItem('nagah_groups', JSON.stringify(groupsRes)); } catch {}
      } else {
        const cached = localStorage.getItem('nagah_groups');
        if (cached) {
          try { setGroups(JSON.parse(cached)); } catch {}
        }
      }

      if (Array.isArray(trainersRes)) {
        setTrainers(trainersRes);
        try { localStorage.setItem('nagah_trainers', JSON.stringify(trainersRes)); } catch {}
      } else {
        const cached = localStorage.getItem('nagah_trainers');
        if (cached) {
          try { setTrainers(JSON.parse(cached)); } catch {}
        }
      }
    } catch (err: any) {
      console.warn('loadData warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectedSiblings = React.useMemo(() => {
    if (!formData.parentPhone && !formData.parentName) return [];
    const currentId = activeTrainee?.id;
    const pPhone = formData.parentPhone?.replace(/\D/g, '').slice(-10);
    const pName = formData.parentName?.trim().toLowerCase();
    const fullNameParts = (formData.fullName || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const familyName = fullNameParts.length >= 2 ? fullNameParts[fullNameParts.length - 1] : '';

    return (trainees || []).filter((t) => {
      if (t.id === currentId) return false;
      if (t.fullName?.trim().toLowerCase() === formData.fullName?.trim().toLowerCase()) return false;
      
      const tPPhone = (t.parentPhone || t.phone || '')?.replace(/\D/g, '').slice(-10);
      const tPName = t.parentName?.trim().toLowerCase();
      const tFullNameParts = (t.fullName || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const tFamilyName = tFullNameParts.length >= 2 ? tFullNameParts[tFullNameParts.length - 1] : '';

      const phoneMatches = pPhone && pPhone.length >= 8 && tPPhone && tPPhone === pPhone;
      
      // اقتصار مطابقة الإخوة على رقم هاتف ولي الأمر الفعلي حصرياً
      return Boolean(phoneMatches);
    });
  }, [formData.fullName, formData.parentName, formData.parentPhone, trainees, activeTrainee]);

  const fetchCodeForCourse = async (courseId?: string, grade?: string) => {
    if (!courseId && !grade) return;
    setIsGeneratingCode(true);
    try {
      const res = await api.getNextTraineeCode({ courseId, grade });
      if (res && res.code) {
        setFormData((prev: any) => ({ ...prev, code: res.code }));
        setNextCode(res.code);
      }
    } catch (err) {
      console.error('Failed to get next code for course:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      code: '',
      phone: '',
      parentPhone: '',
      parentName: '',
      nationalId: '',
      birthDate: '',
      gender: 'male',
      address: '',
      branchId: selectedBranch !== 'all' ? selectedBranch : branches?.[0]?.id || 'branch-1',
      courseId: '',
      groupId: '',
      trainerId: trainers?.[0]?.id || '',
      feeAmount: 0,
      discountAmount: 0,
      initialPayment: 0,
      initialPaymentMethod: 'cash',
      photoUrl: '',
      isExempt: false,
      exemptReason: undefined,
      siblingIds: [],
      siblingNames: [],
      status: 'active',
      notes: ''
    });
    setNextCode('');
    setIsAddModalOpen(true);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتعدى 3 ميجابايت', 'warning');
      return;
    }
    
    // Instead of saving base64 directly, upload it
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: base64Data, fileName: file.name })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormData((prev: any) => ({ ...prev, photoUrl: data.url }));
        } else {
          setFormData((prev: any) => ({ ...prev, photoUrl: base64Data }));
        }
      } catch(e) {
        setFormData((prev: any) => ({ ...prev, photoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAddTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.branchId) {
      showToast('يرجى ملء جميع الحقول الإجبارية (الاسم، الهاتف، والفرع)', 'warning');
      return;
    }

    try {
      const res = await api.createTrainee({
        ...formData,
        createdByUserId: user?.id,
        createdByUserName: user?.fullName
      });
      if (res.success) {
        if (res.trainee) {
          
        }
        showToast(`تمت إضافة المتدرب ${res.trainee.fullName} بنجاح بكود (${res.trainee.code})`, 'success');
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المتدرب', 'error');
    }
  };

  const handleOpenEditModal = (t: Trainee) => {
    setActiveTrainee(t);
    // Smartly resolve courseId from t.courseId, t.courseIds[0], or from group's courseId, or grade
    let resolvedCourseId = t.courseId || (t.courseIds && t.courseIds[0]) || '';
    if (!resolvedCourseId && t.groupId) {
      const g = groups.find(grp => grp.id === t.groupId);
      if (g && g.courseId) resolvedCourseId = g.courseId;
    }
    if (resolvedCourseId && !courses.some(c => c.id === resolvedCourseId)) {
      const foundByName = courses.find(c => c.name === resolvedCourseId || (t.grade && c.name.includes(t.grade)));
      if (foundByName) resolvedCourseId = foundByName.id;
    }
    if (!resolvedCourseId && t.grade) {
      const foundByGrade = courses.find(c => c.name.includes(t.grade) || t.grade.includes(c.name));
      if (foundByGrade) resolvedCourseId = foundByGrade.id;
    }

    setFormData({
      fullName: t.fullName,
      code: t.code,
      phone: t.phone,
      parentPhone: t.parentPhone || '',
      parentName: t.parentName || '',
      nationalId: t.nationalId || '',
      birthDate: t.birthDate || '',
      gender: t.gender || 'male',
      address: t.address || '',
      grade: t.grade || '',
      branchId: t.branchId || (branches[0]?.id || 'branch-1'),
      courseId: resolvedCourseId,
      groupId: t.groupId || '',
      trainerId: t.trainerId || '',
      feeAmount: t.feeAmount,
      discountAmount: t.discountAmount,
      photoUrl: t.photoUrl || '',
      isExempt: Boolean(t.isExempt),
      exemptReason: t.exemptReason || undefined,
      siblingIds: t.siblingIds || [],
      siblingNames: t.siblingNames || [],
      status: t.status,
      notes: t.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee) return;

    try {
      const currentPaid = activeTrainee.paidAmount || 0;
      const netAmt = (formData.feeAmount || 0) - (formData.discountAmount || 0);
      const remainingAmt = netAmt - currentPaid;

      const res = await api.updateTrainee(activeTrainee.id, {
        ...formData,
        netAmount: netAmt,
        remainingAmount: remainingAmt,
        updatedByUserId: user?.id,
        updatedByUserName: user?.fullName
      });
      if (res.success) {
        if (res.trainee) {
          
        }
        showToast('تم تحديث بيانات المتدرب بنجاح', 'success');
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل المتدرب', 'error');
    }
  };

  const handleBulkDelete = () => {
    setDeleteConfirm({ isOpen: true, type: 'bulk' });
  };
  
  const executeBulkDelete = async () => {
    if (!selectedTraineeIds || selectedTraineeIds.length === 0) return;
    const idsToDelete = [...selectedTraineeIds];
    try {
      await api.bulkDeleteTrainees(idsToDelete);
      setTrainees(prev => {
        const next = prev.filter(t => !idsToDelete.includes(t.id));
        try { localStorage.setItem('nagah_trainees', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast(`تم حذف ${idsToDelete.length} متدربين بنجاح`, 'success');
      setSelectedTraineeIds([]);
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحذف', 'error');
    }
  };

  const executeBulkAssignGroup = async () => {
    if (!bulkAssignGroupId) return;
    try {
      await api.bulkAssignGroup(selectedTraineeIds, bulkAssignGroupId);
      showToast(`تم نقل ${selectedTraineeIds.length} متدربين بنجاح للمجموعة`, "success");
      setSelectedTraineeIds([]);
      setIsBulkAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء النقل", "error");
    }
  };

  const handleBulkUpgrade = async () => {
    try {
      await api.bulkUpgradeTrainees(selectedTraineeIds, 'active');
      showToast(`تم ترقية وتفعيل ${selectedTraineeIds.length} متدربين بنجاح`, 'success');
      setSelectedTraineeIds([]);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الترقية', 'error');
    }
  };

  const handleDeleteTrainee = (t: Trainee) => {
    setDeleteConfirm({ isOpen: true, type: 'single', trainee: t });
  };
  
  const executeDeleteSingle = async () => {
    if (!deleteConfirm?.trainee) return;
    const targetId = deleteConfirm.trainee.id;
    try {
      await api.deleteTrainee(targetId);
      setTrainees(prev => {
        const next = prev.filter(t => t.id !== targetId);
        try { localStorage.setItem('nagah_trainees', JSON.stringify(next)); } catch {}
        return next;
      });
      showToast('تم حذف المتدرب بنجاح', 'info');
      setDeleteConfirm(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل الحذف', 'error');
    }
  };

  const handleOpenProfile = async (t: Trainee) => {
    setActiveTrainee(t);
    try {
      const details = await api.getTraineeDetails(t.id);
      setTraineeProfileData(details);
      setIsProfileModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب ملف المتدرب', 'error');
    }
  };

  const handleOpenPaymentModal = (t: Trainee) => {
    setActiveTrainee(t);
    setPaymentAmount(t.remainingAmount > 0 ? t.remainingAmount : 500);
    setPaymentMethod('cash');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee || paymentAmount <= 0) return;

    try {
      const res = await api.createPayment({
        traineeId: activeTrainee.id,
        courseId: activeTrainee.courseId,
        branchId: activeTrainee.branchId,
        amount: paymentAmount,
        paymentMethod,
        notes: paymentNotes,
        receivedByUserId: user?.id,
        receivedByUserName: user?.fullName
      });

      if (res.success) {
        showToast(`تم تسجيل الدفعة بنجاح برقم إيصال ${res.payment.receiptNumber}`, 'success');
        setIsPaymentModalOpen(false);
        loadData();

        // Prompt user to print receipt
        const branchName = branches.find(b => b.id === activeTrainee.branchId)?.name;
        const courseName = courses.find(c => c.id === activeTrainee.courseId)?.name;
        setPrintData({
          title: `إيصال قبض - ${res.payment.receiptNumber}`,
          type: 'receipt',
          data: {
            payment: res.payment,
            trainee: res.trainee,
            branchName,
            courseName
          }
        });
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدفعة', 'error');
    }
  };

  // Open WhatsApp Modal
  const handleOpenWhatsApp = (t: Trainee) => {
    setActiveTrainee(t);
    const msg = `مرحباً ولي أمر المتدرب/ ${t.fullName}،\nنحيطكم علماً من إدارة "مركز النجاح للتدريب والاستشارات" بخصوص متطلبات دورة (${courses.find(c => c.id === t.courseId)?.name || 'التدريب'}).\nالرسوم المتبقية: ${t.remainingAmount} ج.م.\nشاكرين لتعاونكم معنا.`;
    setWaMessage(msg);
    setIsWhatsAppModalOpen(true);
  };

  const handleSendWhatsApp = () => {
    if (!activeTrainee) return;
    const phone = (activeTrainee.parentPhone || activeTrainee.phone).replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '20' + phone.substring(1) : phone;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
    setIsWhatsAppModalOpen(false);
  };

  // Star Tier Calculation
  const getTraineeStarTier = (points: number = 0) => {
    if (points >= 150) {
      return {
        name: 'متألق أسطوري 🌟',
        stars: 5,
        badgeColor: 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border-amber-500/50',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        icon: '🌟'
      };
    } else if (points >= 80) {
      return {
        name: 'متقدم ذهبي 🏆',
        stars: 4,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
        icon: '🏆'
      };
    } else if (points >= 30) {
      return {
        name: 'نشط فضي 🥈',
        stars: 3,
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
        badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40',
        icon: '🥈'
      };
    } else {
      return {
        name: 'مبتدئ صاعد ⭐',
        stars: 1,
        badgeColor: 'bg-slate-700/60 text-slate-300 border-slate-600',
        badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        icon: '⭐'
      };
    }
  };

  // Open Star Award Modal
  const handleOpenStarModal = (target: Trainee | Trainee[]) => {
    const list = Array.isArray(target) ? target : [target];
    if (list.length === 0) {
      showToast('يرجى تحديد متدرب واحد على الأقل لمنح النجوم', 'warning');
      return;
    }
    setStarTargetTrainees(list);
    setStarCount(1);
    setStarPoints(10);
    setStarReason('مشاركة متميزة وتفاعل إيجابي في المحاضرة');
    setStarCustomReason('');
    setStarSendWhatsApp(false);
    setIsStarModalOpen(true);
  };

  // Quick 1-Click Star Award
  const handleQuickAward = async (t: Trainee, stars: number = 1, defaultReason?: string) => {
    const pts = stars * 10;
    const reason = defaultReason || (stars === 1 ? 'مشاركة ممتازة في الحصة ⭐' : stars === 2 ? 'إتمام الواجب والتطبيق العملي ⭐⭐' : stars === 3 ? 'إجابة نموذجية وسرعة بديهة ⭐⭐⭐' : `مكافأة ${stars} نجوم تميز 🌟`);
    
    try {
      const res = await api.addPoints({
        traineeId: t.id,
        points: pts,
        reason,
        addedByUserId: user?.id,
        addedByUserName: user?.fullName || 'المعلم / الإدارة'
      });

      if (res.success) {
        showToast(`🎉 تم منح المتدرب (${t.fullName}) ${stars} نجوم بنجاح (+${pts} نقطة)!`, 'success');
        
        // Update local trainees state immediately
        setTrainees(prev => prev.map(item => {
          if (item.id === t.id) {
            const newTotal = Math.max(0, (item.totalPoints || 0) + pts);
            return { ...item, totalPoints: newTotal, points: newTotal };
          }
          return item;
        }));

        // If profile modal is open for this trainee, update it in real-time
        if (activeTrainee && activeTrainee.id === t.id) {
          const newTotal = Math.max(0, (activeTrainee.totalPoints || 0) + pts);
          setActiveTrainee(prev => prev ? { ...prev, totalPoints: newTotal, points: newTotal } : null);
          setTraineeProfileData((prev: any) => {
            if (!prev) return prev;
            const newPt = {
              id: 'pt-' + Date.now(),
              points: pts,
              reason,
              createdAt: new Date().toISOString(),
              addedByUserName: user?.fullName || 'المعلم / الإدارة'
            };
            return {
              ...prev,
              points: [newPt, ...(prev.points || [])]
            };
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'فشل منح النجوم', 'error');
    }
  };

  // Submit Star Award Modal
  const handleSaveStarModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (starTargetTrainees.length === 0 || starPoints === 0) return;

    setIsSubmittingStars(true);
    try {
      const finalReason = starReason === 'custom' ? (starCustomReason || 'نشاط تدريبي مميز') : starReason;
      const res = await api.addPoints({
        traineeIds: starTargetTrainees.map(t => t.id),
        points: starPoints,
        reason: finalReason,
        addedByUserId: user?.id,
        addedByUserName: user?.fullName || 'المعلم / الإدارة'
      });

      if (res.success) {
        showToast(
          `🎉 تم منح ${starPoints > 0 ? '+' : ''}${starPoints} نقطة (${starCount} نجوم) لعدد ${starTargetTrainees.length} متدرب بنجاح!`,
          'success'
        );

        // Update local trainees list
        setTrainees(prev => prev.map(t => {
          if (starTargetTrainees.some(st => st.id === t.id)) {
            const newTotal = Math.max(0, (t.totalPoints || 0) + starPoints);
            return { ...t, totalPoints: newTotal, points: newTotal };
          }
          return t;
        }));

        // If profile is open
        if (activeTrainee && starTargetTrainees.some(st => st.id === activeTrainee.id)) {
          const newTotal = Math.max(0, (activeTrainee.totalPoints || 0) + starPoints);
          setActiveTrainee(prev => prev ? { ...prev, totalPoints: newTotal, points: newTotal } : null);
          setTraineeProfileData((prev: any) => {
            if (!prev) return prev;
            const newPt = {
              id: 'pt-' + Date.now(),
              points: starPoints,
              reason: finalReason,
              createdAt: new Date().toISOString(),
              addedByUserName: user?.fullName || 'المعلم / الإدارة'
            };
            return {
              ...prev,
              points: [newPt, ...(prev.points || [])]
            };
          });
        }

        // WhatsApp trigger if requested for single trainee
        if (starSendWhatsApp && starTargetTrainees && starTargetTrainees.length === 1) {
          const t = starTargetTrainees[0];
          if (t) {
            const phone = (t.parentPhone || t.phone || '').replace(/[^0-9]/g, '');
            const cleanPhone = phone.startsWith('0') ? '20' + phone.substring(1) : phone;
            const msg = `⭐ *تهنئة وتكريم من مركز النجاح للتدريب* ⭐\n\nنبارك للمتدرب/ة المتميز/ة: *${t.fullName}*\nلحصوله على *${starCount} نجوم تميز 🌟 (+${starPoints} نقطة)*\nالسبب: ${finalReason}\nرصيده الحالي: ${(t.totalPoints || 0) + starPoints} نقطة.\n\nنتمنى له دوام التوفيق والتميز والإبداع! 🎓✨`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
          }
        }

        setIsStarModalOpen(false);
        setSelectedTraineeIds([]);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل منح النجوم', 'error');
    } finally {
      setIsSubmittingStars(false);
    }
  };

  // Batch Sync Records (Retroactive logic application for siblings, exemptions, birth dates & parent names)
  const handleBatchSyncRecords = async () => {
    setIsSyncingBatch(true);
    try {
      const res = await api.batchSyncTraineeRecords();
      if (res.success) {
        setSyncBatchResultModal(res);
        showToast(`🎉 تم فحص ومزامنة ${res.totalTrainees} متدرب بنجاح!`, 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء مزامنة وتحديث السجلات', 'error');
    } finally {
      setIsSyncingBatch(false);
    }
  };

  // Print Trainee Badge
  const handlePrintBadge = (t: Trainee) => {
    const branchName = branches.find(b => b.id === t.branchId)?.name;
    const courseName = courses.find(c => c.id === t.courseId)?.name;
    setPrintData({
      title: `بطاقة متدرب - ${t.fullName}`,
      type: 'trainee_badge',
      data: { trainee: t, branchName, courseName }
    });
  };

  // Download Excel Template (Full or Simplified)
  const handleDownloadTemplate = (type: 'full' | 'simple' = 'full') => {
    if (type === 'simple') {
      const simpleData = [
        { 'الاسم': 'أحمد محمد علي', 'السن': 16 },
        { 'الاسم': 'سارة محمود حسن', 'السن': 15 },
        { 'الاسم': 'عمر خالد إبراهيم', 'السن': 17 },
        { 'الاسم': 'مريم أحمد عبد الله', 'السن': 14 }
      ];
      const ws = XLSX.utils.json_to_sheet(simpleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'نموذج_مبسط');
      XLSX.writeFile(wb, 'نموذج_مبسط_الاسم_والسن_مركز_النجاح.xlsx');
      showToast('تم تحميل نموذج الأسماء والسن المبسط بنجاح', 'success');
      return;
    }

    const templateData = [
      {
        'اسم المتدرب': 'محمد أحمد علي',
        'السن': 18,
        'النوع': 'ذكر',
        'رقم الهاتف': '01012345678',
        'هاتف ولي الأمر': '01098765432',
        'اسم ولي الأمر': 'أحمد علي',
        'الرقم القومي': '29901011234567',
        'الفرع': 'فرع النجاح',
        'رسوم الدورة': 2500,
        'الخصم': 200,
        'المدفوع': 1000,
        'العنوان': 'القاهرة',
        'ملاحظات': 'متدرب متميز'
      },
      {
        'اسم المتدرب': 'سارة محمود حسن',
        'السن': 16,
        'النوع': 'أنثى',
        'رقم الهاتف': '01123456789',
        'هاتف ولي الأمر': '01198765432',
        'اسم ولي الأمر': 'محمود حسن',
        'الرقم القومي': '',
        'الفرع': 'فرع بدر',
        'رسوم الدورة': 3000,
        'الخصم': 0,
        'المدفوع': 1500,
        'العنوان': 'مدينة بدر',
        'ملاحظات': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج_المتدربين');
    XLSX.writeFile(wb, 'نموذج_استيراد_متدربين_مركز_النجاح.xlsx');
    showToast('تم تحميل نموذج Excel الشامل بنجاح', 'success');
  };

  // Export Trainees to Excel
  const handleExportExcel = () => {
    if (trainees.length === 0) {
      showToast('لا توجد بيانات متدربين لتصديرها', 'warning');
      return;
    }

    const exportRows = trainees.map((t, idx) => ({
      'م': idx + 1,
      'كود المتدرب': t.code,
      'الاسم رباعي': t.fullName,
      'النوع': t.gender === 'female' ? 'أنثى' : 'ذكر',
      'الهاتف': t.phone,
      'هاتف ولي الأمر': t.parentPhone || '',
      'اسم ولي الأمر': t.parentName || '',
      'الفرع': branches.find(b => b.id === t.branchId)?.name || '',
      'الدورة التدريبية': courses.find(c => c.id === t.courseId)?.name || '',
      'المجموعة': groups.find(g => g.id === t.groupId)?.name || '',
      'المدرب': trainers.find(tr => tr.id === t.trainerId)?.name || '',
      'رسوم الدورة': t.feeAmount,
      'الخصم': t.discountAmount,
      'الصافي': t.netAmount,
      'المدفوع': t.paidAmount,
      'المتبقي': t.remainingAmount,
      'النقاط': t.totalPoints,
      'الحالة': t.status === 'active' ? 'نشط' : t.status === 'completed' ? 'مكتمل' : 'متوقف',
      'تاريخ التسجيل': t.registrationDate
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل_المتدربين');
    XLSX.writeFile(wb, `كشف_متدربي_مركز_النجاح_${Date.now()}.xlsx`);
    showToast(`تم تصدير ${trainees.length} متدرب إلى ملف Excel بنجاح`, 'success');
  };

  // Process Excel Import File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportPreviewLoading(true);
    setImportResults(null);
    setImportPreviewStudents(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames?.[0];
        if (!wsName) {
          showToast('ملف الإكسل لا يحتوي على صفحات بيانات صالحة', 'error');
          setIsImportPreviewLoading(false);
          return;
        }
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          showToast('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة', 'error');
          setIsImportPreviewLoading(false);
          return;
        }

        const res = await api.importPreviewTrainees({
          rows: data,
          defaultBranchId: selectedBranch !== 'all' ? selectedBranch : branches?.[0]?.id
        });

        if (res.success) {
          setImportPreviewStudents(res.students);
          setImportAvailableGroups(res.groups);
          showToast('تم تحليل وتوزيع المتدربين ذكياً بالذكاء الاصطناعي مسبقاً! يرجى مراجعة التقرير والتسكين.', 'success');
        } else {
          showToast('فشل في استيراد المعاينة', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'خطأ أثناء قراءة ملف Excel وتحليله', 'error');
      } finally {
        setIsImportPreviewLoading(false);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
    if (!importPreviewStudents) return;
    setIsImportCommiting(true);
    try {
      const res = await api.importCommitTrainees({
        students: importPreviewStudents.map(s => ({
          fullName: s.fullName,
          nationalId: s.nationalId,
          phone: s.phone,
          parentPhone: s.parentPhone,
          parentName: s.parentName,
          address: s.address,
          notes: s.notes,
          gender: s.gender,
          age: s.age,
          feeAmount: s.feeAmount,
          discountAmount: s.discountAmount,
          paidAmount: s.paidAmount,
          class: s.class,
          grade: s.normalizedGrade || s.class,
          language: s.language,
          branchId: s.branchId,
          groupId: s.suggestedGroupId,
          courseId: s.suggestedCourseId
        }))
      });

      if (res.success) {
        showToast(`تم استيراد ${res.importedCount} متدرب بنجاح!`, 'success');
        if (res.errorsCount > 0) {
          showToast(`تم تخطي ${res.errorsCount} صفوف (مسجلين مسبقاً) لضمان عدم التكرار.`, 'info');
        }
        setImportResults({
          importedCount: res.importedCount,
          errorsCount: res.errorsCount,
          errors: res.errors
        });
        setImportPreviewStudents(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ وحفظ وتسكين الطلاب', 'error');
    } finally {
      setIsImportCommiting(false);
    }
  };

  const handleCreateNewGroupsForUnassigned = () => {
    if (!importPreviewStudents) return;
    const updated = importPreviewStudents.map(st => {
      if (st.status === 'unassigned' || !st.suggestedGroupId) {
        const className = st.class || 'مجموعة جديدة';
        const placeholderId = `CREATE_NEW:${className}:${st.branchId || 'branch-1'}`;
        return {
          ...st,
          suggestedGroupId: placeholderId,
          suggestedGroupName: `➕ مجموعة ${className} (جديدة)`,
          status: 'assigned' as const,
          reason: 'تم تحويله لتأسيس مجموعة نشطة جديدة له تلقائياً'
        };
      }
      return st;
    });
    setImportPreviewStudents(updated);
    showToast('تم إسناد الطلاب غير المسكنين إلى مجموعات جديدة سيتم تأسيسها تلقائياً عند التأكيد!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Adaptive Action Toolbar */}
      <div className="flex flex-col gap-3 bg-slate-800/60 border border-slate-700/70 p-3 sm:p-4 rounded-2xl backdrop-blur-md relative z-30">
        
        {/* Title row with stats & refresh */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2 truncate">
              <Users className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="truncate">إدارة الطلاب والمتدربين</span>
              <span className="text-[11px] sm:text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                {trainees.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              تسجيل المتدربين، الحسابات المالية، التحفيز والنجوم، ملفات Excel، وطباعة البطاقات
            </p>
          </div>

          {/* Quick Refresh & View Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Toggle: Table or Cards */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 shadow-inner">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  viewMode === 'cards' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض بطاقات تفاعلية"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">بطاقات</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="عرض جدول مفصل"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px]">جدول</span>
              </button>
            </div>

            <button
              onClick={() => {
                loadData();
                showToast('تم تحديث قائمة الطلاب بنجاح 🔄', 'success');
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-700/80 transition-all active:scale-90"
              title="تحديث البيانات يدوياً"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Adaptive Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
          
          {/* Left Side: Bulk Selection Actions if any selected */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedTraineeIds.length > 0 ? (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-xl animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-300 ml-1">
                  محدد: {selectedTraineeIds.length}
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="p-1 sm:px-2 sm:py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  title="حذف المحددين"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">حذف</span>
                </button>
                <button
                  onClick={handleBulkUpgrade}
                  className="p-1 sm:px-2 sm:py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  title="ترقية المحددين"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ترقية</span>
                </button>
                <button
                  onClick={() => setSelectedTraineeIds([])}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                  title="إلغاء التحديد"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Right Side: Fluid Operations & Primary Add */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 sm:flex-initial justify-end">
            
            {/* AI Camera Correction (Flexible) */}
            <button
              onClick={() => {
                setScannerTraineeId(undefined);
                setIsAiScannerModalOpen(true);
              }}
              className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/30 shadow-md transition-all active:scale-95"
              title="تصحيح واجبات واختبارات الطلاب بالكاميرا ورصد الدرجات"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">تصحيح بالكاميرا</span>
            </button>

            {/* Broadcast WhatsApp (Flexible) */}
            <button
              onClick={() => handleOpenBroadcastModal()}
              className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-400/30 shadow-md transition-all active:scale-95"
              title="إرسال كروت وأكواد الطلاب وبوابات الخدمات عبر الواتساب"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span className="hidden lg:inline">إرسال كروت وأكواد الطلاب</span>
            </button>

            {/* Desktop Dropdowns */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Dropdown 1: Excel Operations */}
              <div className="relative">
                <button
                  onClick={() => {
                    setExcelDropdownOpen(!excelDropdownOpen);
                    setPortalsDropdownOpen(false);
                    setToolsDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>ملفات Excel 📊</span>
                </button>
                {excelDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-2xl z-[999] space-y-1 text-right max-h-[80vh] overflow-y-auto backdrop-blur-xl">
                    <button
                      onClick={() => {
                        handleDownloadTemplate('full');
                        setExcelDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-200 text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>تحميل نموذج Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setImportResults(null);
                        setIsImportModalOpen(true);
                        setExcelDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-200 text-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>استيراد Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportExcel();
                        setExcelDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-200 text-xs transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تصدير ملف Excel محلي</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsGoogleSheetsModalOpen(true);
                        setExcelDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-emerald-300 text-xs transition-colors border-t border-slate-800 font-bold"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>جداول Google Sheets السحابية 📊</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Portals & Registration Links */}
              <div className="relative">
                <button
                  onClick={() => {
                    setPortalsDropdownOpen(!portalsDropdownOpen);
                    setExcelDropdownOpen(false);
                    setToolsDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
                >
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                  <span>بوابات وروابط 📱</span>
                </button>
                {portalsDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 p-2 shadow-2xl z-[999] space-y-2 text-right max-h-[80vh] overflow-y-auto backdrop-blur-xl">
                    {/* Student Portal */}
                    <div className="p-1 space-y-1 bg-slate-950/40 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between px-2 py-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">بوابة الطالب الذكية</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            window.open('/?view=student_portal', '_blank');
                            setPortalsDropdownOpen(false);
                          }}
                          className="flex-1 py-1 px-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded text-[10px] font-bold text-center transition-all"
                        >
                          فتح البوابة
                        </button>
                        <button
                          onClick={() => {
                            let origin = window.location.origin;
                            if (origin.includes('ais-dev-')) origin = origin.replace('ais-dev-', 'ais-pre-');
                            const link = `${origin}/?view=student_portal`;
                            navigator.clipboard.writeText(link);
                            showToast('تم نسخ رابط بوابة الطالب بنجاح! 📋', 'success');
                            setPortalsDropdownOpen(false);
                          }}
                          className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-all"
                        >
                          نسخ الرابط
                        </button>
                      </div>
                    </div>

                    {/* Parent Portal */}
                    <div className="p-1 space-y-1 bg-slate-950/40 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between px-2 py-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">بوابة ولي الأمر</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            window.open('/?view=parent_portal', '_blank');
                            setPortalsDropdownOpen(false);
                          }}
                          className="flex-1 py-1 px-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded text-[10px] font-bold text-center transition-all"
                        >
                          فتح البوابة
                        </button>
                        <button
                          onClick={() => {
                            let origin = window.location.origin;
                            if (origin.includes('ais-dev-')) origin = origin.replace('ais-dev-', 'ais-pre-');
                            const link = `${origin}/?view=parent_portal`;
                            navigator.clipboard.writeText(link);
                            showToast('تم نسخ رابط بوابة ولي الأمر بنجاح! 📋', 'success');
                            setPortalsDropdownOpen(false);
                          }}
                          className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-all"
                        >
                          نسخ الرابط
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 3: Advanced Tools */}
              <div className="relative">
                <button
                  onClick={() => {
                    setToolsDropdownOpen(!toolsDropdownOpen);
                    setExcelDropdownOpen(false);
                    setPortalsDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>أدوات متقدمة ⚡</span>
                </button>
                {toolsDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 p-1.5 shadow-2xl z-[999] space-y-1 text-right max-h-[80vh] overflow-y-auto backdrop-blur-xl">
                    <button
                      onClick={() => {
                        setIsPromotionModalOpen(true);
                        setToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-slate-200 text-xs transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-bold">تصعيد وترقية الطلاب 🎓</div>
                        <div className="text-[9px] text-slate-400">للأعوام الدراسية الجديدة والمجموعات</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleBatchSyncRecords();
                        setToolsDropdownOpen(false);
                      }}
                      disabled={isSyncingBatch}
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-lg text-slate-200 text-xs transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold">مزامنة وتحديث الكشوفات ⚡</div>
                        <div className="text-[9px] text-slate-400">فحص الخصومات والإخوة وتواريخ الميلاد</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Share Registration Link & QR (Desktop) */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs shadow-md transition-all border border-slate-700"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>الباركود</span>
              </button>
            </div>

            {/* Mobile "More Tools / المزيد ⋯" Button */}
            <button
              onClick={() => setIsMobileToolsDrawerOpen(true)}
              className="md:hidden flex items-center gap-1 p-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95"
              title="المزيد من الأدوات والعمليات"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>أدوات ⋯</span>
            </button>

            {/* Primary Action Button: Add Trainee */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex-1 sm:flex-initial"
            >
              <UserPlus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span className="whitespace-nowrap">إضافة متدرب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with Mobile Accordion Toggle */}
      <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60 space-y-2.5">
        {/* Top Search Input & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الهاتف، القومي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isMobileFiltersOpen || selectedBranch !== 'all' || selectedCourse !== 'all' || selectedGroup !== 'all' || selectedTrainer !== 'all' || selectedStatus !== 'all' || selectedPaymentStatus !== 'all'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية</span>
          </button>
        </div>

        {/* Filters Grid: Always visible on tablet/desktop (sm:), collapsible on mobile */}
        <div className={`${isMobileFiltersOpen ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60`}>
          
          {/* Sort By Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="created_desc">الأحدث إضافة</option>
              <option value="created_asc">الأقدم إضافة</option>
              <option value="name_asc">الاسم (أ - ي)</option>
              <option value="name_desc">الاسم (ي - أ)</option>
              <option value="code_asc">الكود (تصاعدي)</option>
              <option value="code_desc">الكود (تنازلي)</option>
              <option value="points_desc">الأعلى نقاطاً</option>
              <option value="points_asc">الأقل نقاطاً</option>
              <option value="debt_desc">الأعلى مديونية</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الدورات</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع المجموعات</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط ومستمر</option>
              <option value="completed">أتم الدورة</option>
              <option value="dropped">منسحب / متوقف</option>
            </select>
          </div>

          {/* Payment Subscription Filter */}
          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الاشتراكات</option>
              <option value="reminder_window">🚨 تنبيه السداد (من 28 لـ 5)</option>
              <option value="unpaid">🔴 غير مسدد الاشتراك</option>
              <option value="paid">✅ مسدد بالكامل</option>
              <option value="exempt">🎓 معفي من الاشتراك</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Tools Bottom Sheet / Drawer */}
      {isMobileToolsDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">عمليات وأدوات إدارة المتدربين</h3>
              </div>
              <button
                onClick={() => setIsMobileToolsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Excel Operations Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400">ملفات وإكسل 📊</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleDownloadTemplate('full');
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95"
                >
                  <Download className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">تحميل نموذج Excel</span>
                </button>

                <button
                  onClick={() => {
                    setImportResults(null);
                    setIsImportModalOpen(true);
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95"
                >
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">استيراد من Excel</span>
                </button>

                <button
                  onClick={() => {
                    handleExportExcel();
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95"
                >
                  <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">تصدير ملف Excel</span>
                </button>

                <button
                  onClick={() => {
                    setIsGoogleSheetsModalOpen(true);
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Google Sheets 📊</span>
                </button>
              </div>
            </div>

            {/* Smart Portals & Links */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400">البوابات والروابط 📱</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    window.open('/?view=student_portal', '_blank');
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1 text-center active:scale-95"
                >
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">بوابة الطالب الذكية</span>
                </button>

                <button
                  onClick={() => {
                    window.open('/?view=parent_portal', '_blank');
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1 text-center active:scale-95"
                >
                  <UserCheck className="w-5 h-5 text-lime-400" />
                  <span className="text-xs font-bold text-slate-200">بوابة ولي الأمر</span>
                </button>
              </div>
            </div>

            {/* Advanced Upgrades & Sync */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400">أدوات متقدمة ⚡</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsPromotionModalOpen(true);
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1 text-center active:scale-95"
                >
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">تصعيد وترقية الطلاب</span>
                </button>

                <button
                  onClick={() => {
                    handleBatchSyncRecords();
                    setIsMobileToolsDrawerOpen(false);
                  }}
                  disabled={isSyncingBatch}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center gap-1 text-center active:scale-95 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">مزامنة الكشوفات</span>
                </button>
              </div>
            </div>

            {/* Share QR */}
            <button
              onClick={() => {
                setIsShareModalOpen(true);
                setIsMobileToolsDrawerOpen(false);
              }}
              className="w-full p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة رابط التسجيل والباركود QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Toolbar when Trainees are Selected */}
      {selectedTraineeIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <CheckSquare className="w-4 h-4" />
            <span>تم تحديد {selectedTraineeIds.length} متدرب</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDeleteConfirm({ isOpen: true, type: 'bulk' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl font-bold text-xs border border-rose-800/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
            <button
              onClick={handleBulkUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-xl font-bold text-xs border border-emerald-800/50 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ترقية</span>
            </button>
            <button
              onClick={() => setIsBulkAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 rounded-xl font-bold text-xs border border-indigo-800/50 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>تكوين مجموعة / نقل</span>
            </button>
            <button
              onClick={() => {
                const selectedList = trainees.filter(t => selectedTraineeIds.includes(t.id));
                handleOpenStarModal(selectedList);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>منح نجوم ({selectedTraineeIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedTraineeIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Trainees Content: Table View OR Cards View */}
      {viewMode === 'cards' ? (
        /* ------------------ CARDS GRID VIEW ------------------ */
        isLoading ? (
          <div className="py-16 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700/60">
            <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p>جاري تحميل بطاقات المتدربين...</p>
          </div>
        ) : filteredTrainees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 flex flex-col items-center justify-center gap-3">
            <Users className="w-10 h-10 text-slate-500 stroke-[1.5]" />
            <p className="text-slate-300 font-bold text-sm">لا توجد سجلات متدربين مطابقة للبحث أو الفلاتر المحددة.</p>
            {(selectedBranch !== 'all' || selectedCourse !== 'all' || selectedGroup !== 'all' || selectedTrainer !== 'all' || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedBranch('all');
                  setSelectedCourse('all');
                  setSelectedGroup('all');
                  setSelectedTrainer('all');
                  setSelectedStatus('all');
                  setSelectedPaymentStatus('all');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all"
              >
                إعادة ضبط جميع الفلاتر وعرض كل المتدربين
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTrainees.map((t) => {
              const branch = branches.find((b) => b.id === t.branchId);
              const course = courses.find((c) => c.id === t.courseId);
              const group = groups.find((g) => g.id === t.groupId);
              const isSelected = selectedTraineeIds.includes(t.id);
              const tier = getTraineeStarTier(t.totalPoints || t.points || 0);
              const payInfo = getTraineePaymentStatusInfo(t);

              return (
                <div
                  key={t.id}
                  className={`bg-slate-800/90 border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md transition-all flex flex-col justify-between relative group ${
                    isSelected ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-900/90 to-slate-850 border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTraineeIds(prev =>
                            isSelected ? prev.filter(id => id !== t.id) : [...prev, t.id]
                          );
                        }}
                        className="text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                      </button>
                      <span className="font-mono text-xs font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        {t.code}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        t.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : t.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {t.status === 'active' ? 'نشط' : t.status === 'completed' ? 'مكتمل' : 'متوقف'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3.5 text-right">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      {t.photoUrl ? (
                        <img
                          src={t.photoUrl}
                          alt={t.fullName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/60 shadow-md shrink-0 cursor-pointer"
                          onClick={() => handleOpenProfile(t)}
                        />
                      ) : (
                        <div
                          onClick={() => handleOpenProfile(t)}
                          className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0 cursor-pointer"
                        >
                          {t.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => handleOpenProfile(t)}
                          className="font-bold text-sm text-slate-100 truncate hover:text-amber-300 transition-colors cursor-pointer"
                          title={t.fullName}
                        >
                          {t.fullName}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {course?.name || 'دورة تدريبية'} {group?.name ? `• ${group.name}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {t.phone} {t.parentPhone ? `| و.أ: ${t.parentPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stars & Gamification Interactive Section */}
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                          {tier.name}
                        </span>
                        <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{t.totalPoints || t.points || 0} نقطة</span>
                        </div>
                      </div>

                      {/* Quick Star Buttons */}
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">منح نجوم:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAward(t, 1, 'مشاركة وتفاعل إيجابي ⭐')}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition-colors"
                            title="إضافة 1 نجمة (+10 نقاط)"
                          >
                            +1 ⭐
                          </button>
                          <button
                            onClick={() => handleQuickAward(t, 2, 'إتمام الواجب والتطبيق العملي ⭐⭐')}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition-colors"
                            title="إضافة 2 نجوم (+20 نقطة)"
                          >
                            +2 ⭐
                          </button>
                          <button
                            onClick={() => handleQuickAward(t, 5, 'تفوق واختبار متميز 🌟')}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/40 transition-colors"
                            title="إضافة 5 نجوم (+50 نقطة)"
                          >
                            +5 🌟
                          </button>
                          <button
                            onClick={() => handleOpenStarModal(t)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                            title="تخصيص النجوم مع السبب"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary & Subscription Status */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-400">المدفوع / المتبقي:</span>
                        <div className="font-mono font-bold">
                          <span className="text-emerald-400">{t.paidAmount}</span>
                          <span className="text-slate-600 mx-1">/</span>
                          {t.remainingAmount > 0 ? (
                            <span className="text-rose-400">{t.remainingAmount} ج.م</span>
                          ) : (
                            <span className="text-emerald-400 text-[10px]">خالص ✓</span>
                          )}
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-xl text-center text-[11px] font-bold border ${payInfo.statusBadgeClass}`}>
                        <span>{payInfo.statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                    <div className="p-3 bg-slate-900/60 border-t border-slate-700/60 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* Star Button */}
                      <button
                        onClick={() => handleOpenStarModal(t)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-colors"
                        title="منح نجوم وتكريم"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </button>

                      {/* Payment */}
                      <button
                        onClick={() => handleOpenPaymentModal(t)}
                        className="p-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 rounded-lg border border-emerald-700/60 transition-colors"
                        title="تسجيل دفعة وسند قبض"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Badge */}
                      <button
                        onClick={() => handlePrintBadge(t)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        title="طباعة بطاقة المتدرب الورقية"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* Digital ID Card */}
                      <button
                        onClick={() => setSelectedDigitalCardTrainee(t)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-colors flex items-center gap-1"
                        title="كارت المتدرب الرقمي المعتمد مع اللوجو والترحيب وتحميل صورة"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      {/* WhatsApp / Student Card Broadcast */}
                      <button
                        onClick={() => handleOpenBroadcastModal(t)}
                        className="p-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-400 rounded-lg border border-emerald-700/60 transition-colors"
                        title="إرسال كارت وبيانات كود المتدرب وروابط البوابات عبر الواتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Full Profile */}
                      <button
                        onClick={() => handleOpenProfile(t)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        title="الملف الشامل"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 bg-blue-950/60 hover:bg-blue-800 text-blue-300 rounded-lg border border-blue-700/60 transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ------------------ TABLE VIEW ------------------ */
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
                <tr>
                  <th className="p-3 w-8">
                    <button
                      onClick={() => {
                        if (selectedTraineeIds.length === filteredTrainees.length) {
                          setSelectedTraineeIds([]);
                        } else {
                          setSelectedTraineeIds(filteredTrainees.map(t => t.id));
                        }
                      }}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {selectedTraineeIds.length === filteredTrainees.length && filteredTrainees.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">الكود</th>
                  <th className="p-3">اسم المتدرب</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">الدورة / المجموعة</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">الرسوم</th>
                  <th className="p-3">المدفوع</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3 text-center">النقاط</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center sticky left-0 bg-slate-900/95 z-20 shadow-[-4px_0_12px_rgba(0,0,0,0.5)] border-l border-slate-700 min-w-[170px]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-2" />
                      جاري تحميل سجلات المتدربين...
                    </td>
                  </tr>
                ) : filteredTrainees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <Users className="w-8 h-8 text-slate-500 stroke-[1.5]" />
                        <p className="text-slate-300 font-bold">لا توجد سجلات متدربين مطابقة للبحث أو الفلتر المحدد.</p>
                        {(selectedBranch !== 'all' || selectedCourse !== 'all' || selectedGroup !== 'all' || selectedTrainer !== 'all' || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || searchQuery.trim()) && (
                          <button
                            onClick={() => {
                              setSelectedBranch('all');
                              setSelectedCourse('all');
                              setSelectedGroup('all');
                              setSelectedTrainer('all');
                              setSelectedStatus('all');
                              setSelectedPaymentStatus('all');
                              setSearchQuery('');
                            }}
                            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all mt-1"
                          >
                            إعادة ضبط الفلاتر وعرض الجميع
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrainees.map((t) => {
                    const branch = branches.find((b) => b.id === t.branchId);
                    const course = courses.find((c) => c.id === t.courseId);
                    const group = groups.find((g) => g.id === t.groupId);
                    const isSelected = selectedTraineeIds.includes(t.id);
                    const tier = getTraineeStarTier(t.totalPoints || t.points || 0);
                    const payInfo = getTraineePaymentStatusInfo(t);

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-700/40 transition-colors ${
                          isSelected ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Select checkbox */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setSelectedTraineeIds(prev =>
                                isSelected ? prev.filter(id => id !== t.id) : [...prev, t.id]
                              );
                            }}
                            className="text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Code */}
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {t.code}
                          </span>
                        </td>

                        {/* Name with Photo Avatar */}
                        <td className="p-3.5 min-w-[200px]">
                          <div className="flex items-center gap-3 bg-slate-900/40 p-2 rounded-2xl border border-slate-700/30 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all duration-300 shadow-sm relative group">
                            <div className="relative shrink-0">
                              {t.photoUrl ? (
                                <img
                                  src={t.photoUrl}
                                  alt={t.fullName}
                                  className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-slate-700/50 group-hover:border-amber-500/50 transition-colors"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-black text-sm text-amber-400 shadow-inner border border-slate-600/50 group-hover:border-amber-500/50 transition-colors">
                                  {t.fullName?.charAt(0) || '?'}
                                </div>
                              )}
                              {t.status === 'active' && (
                                <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm"></div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 relative z-10">
                              <div
                                className="cursor-pointer font-black text-[13px] text-slate-100 group-hover:text-amber-400 transition-colors truncate block"
                                onClick={() => handleOpenProfile(t)}
                                title={t.fullName}
                              >
                                {t.fullName}
                              </div>
                              {t.parentName ? (
                                <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5" title={`ولي الأمر: ${t.parentName}`}>
                                  ولي الأمر: <span className="text-slate-300">{t.parentName}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.code}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="p-3.5 text-slate-300">
                          <span className="text-[11px] bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                            {branch?.name || 'الفرع الرئيسي'}
                          </span>
                        </td>

                        {/* Course / Group */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{course?.name || 'دورة عامة'}</div>
                          <div className="text-[10px] text-slate-400">{group?.name || 'مجموعة 1'}</div>
                        </td>

                        {/* Phone */}
                        <td className="p-3.5 font-mono text-slate-300">
                          <div>{t.phone}</div>
                          {t.parentPhone && (
                            <div className="text-[10px] text-slate-400">ولي الأمر: {t.parentPhone}</div>
                          )}
                        </td>

                        {/* Fee */}
                        <td className="p-3.5 font-mono font-semibold">{t.netAmount}</td>

                        {/* Paid */}
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{t.paidAmount}</td>

                        {/* Remaining & Subscription Status */}
                        <td className="p-3.5 font-mono font-bold">
                          <div className="flex flex-col gap-1 items-start">
                            {t.remainingAmount > 0 ? (
                              <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                                {t.remainingAmount} ج.م
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[11px]">مسدد بالكامل ✓</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${payInfo.statusBadgeClass}`}>
                              {payInfo.shortLabel}
                            </span>
                          </div>
                        </td>

                        {/* Points & Stars (Interactive) */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-full group/star">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-mono font-black text-amber-300 text-xs">
                              {t.totalPoints || t.points || 0}
                            </span>
                            <button
                              onClick={() => handleQuickAward(t, 1, 'مشاركة وتفاعل إيجابي ⭐')}
                              className="ml-1 px-1.5 py-0.2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded text-[10px] font-bold transition-all"
                              title="إضافة 1 نجمة سريعة (+10)"
                            >
                              +⭐
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : t.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {t.status === 'active' ? 'نشط' : t.status === 'completed' ? 'مكتمل' : 'متوقف'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center sticky left-0 bg-slate-900/95 z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.5)] border-l border-slate-700/60 min-w-[170px]">
                          <div className="grid grid-cols-4 gap-1">
                            {/* AI Homework Scanner Button */}
                            <button
                              onClick={() => {
                                setScannerTraineeId(t.id);
                                setIsAiScannerModalOpen(true);
                              }}
                              className="p-1.5 bg-indigo-950/60 hover:bg-indigo-800 text-indigo-300 rounded-lg border border-indigo-700/60 transition-colors flex items-center justify-center"
                              title="تصحيح واجب/اختبار الطالب بالكاميرا والذكاء الاصطناعي"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-300" />
                            </button>

                            {/* Star Reward Button */}
                            <button
                              onClick={() => handleOpenStarModal(t)}
                              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-lg border border-amber-500/50 transition-colors flex items-center justify-center"
                              title="منح نجوم وتكريم المتدرب"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            </button>

                            {/* Payment Button */}
                            <button
                              onClick={() => handleOpenPaymentModal(t)}
                              className="p-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 rounded-lg border border-emerald-700/60 transition-colors flex items-center justify-center"
                              title="تسجيل دفعة وسند قبض"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Badge */}
                            <button
                              onClick={() => handlePrintBadge(t)}
                              className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-600 transition-colors flex items-center justify-center"
                              title="طباعة بطاقة المتدرب الورقية"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Digital ID Card */}
                            <button
                              onClick={() => setSelectedDigitalCardTrainee(t)}
                              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-colors flex items-center justify-center"
                              title="كارت المتدرب الرقمي الرسمي مع اللوجو وتحميل الصورة"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            {/* WhatsApp / Student Card Broadcast */}
                            <button
                              onClick={() => handleOpenBroadcastModal(t)}
                              className="p-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-400 rounded-lg border border-emerald-700/60 transition-colors flex items-center justify-center"
                              title="إرسال عبر WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Profile */}
                            <button
                              onClick={() => handleOpenProfile(t)}
                              className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-600 transition-colors flex items-center justify-center"
                              title="الملف الشامل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="p-1.5 bg-blue-950/60 hover:bg-blue-800 text-blue-300 rounded-lg border border-blue-700/60 transition-colors flex items-center justify-center"
                              title="تعديل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Add Trainee ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">تسجيل متدرب جديد في النظام</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddTrainee} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 hover:border-amber-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group shrink-0 relative"
                >
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="صورة الطالب" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1">
                      <Camera className="w-5 h-5 text-slate-400 group-hover:text-amber-400 mx-auto" />
                      <span className="text-[8px] text-slate-400 block mt-0.5">أضف صورة</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-right space-y-1">
                  <p className="text-xs font-bold text-slate-200">صورة المتدرب الشخصية</p>
                  <p className="text-[10px] text-slate-400">تظهر الصورة في ملف المتدرب، بطاقة الدخول، وشاشات التحكم والشهادات المعتمدة</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoStudioTargetMode('add');
                        setIsPhotoStudioOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-[10px] flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>فتح استوديو قص وتلبيس الصورة ✨</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 1: Code + Full Name + Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-semibold text-xs">كود المتدرب (حسب الصف)</label>
                    <button
                      type="button"
                      onClick={() => fetchCodeForCourse(formData.courseId)}
                      disabled={isGeneratingCode}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                      title="إعادة توليد كود جديد للمرحلة الحالية"
                    >
                      <Sparkles className={`w-3 h-3 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                      تحديث الكود
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.code ?? ''}
                    placeholder="اختر الصف لتحديد الكود..."
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    💡 يبدأ الكود بحرف الصف تلقائياً (رابع A، خامس B، سادس C، إعدادي D...)
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">الاسم رباعي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمد علي محمود"
                    value={formData.fullName || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.trim().split(/\s+/);
                      let parentName = formData.parentName;
                      if (parts.length >= 2) {
                        const suggested = parts.slice(1).join(' ');
                        if (!parentName || parentName === (formData as any)._lastAutoParent) {
                          parentName = suggested;
                          (formData as any)._lastAutoParent = suggested;
                        }
                      }
                      setFormData({ ...formData, fullName: val, parentName });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Parent Phone + Parent Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">هاتف ولي الأمر</label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={formData.parentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">اسم ولي الأمر (تلقائي/تعديل)</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">كلمة مرور الطالب (اختياري)</label>
                  <input
                    type="text"
                    placeholder="لإعادة تعيين المرور أو التعديل"
                    value={formData.portalPassword || ''}
                    onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">يستخدمها الطالب لدخول البوابة مع رقم هاتفه</p>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">كلمة مرور ولي الأمر (اختياري)</label>
                  <input
                    type="text"
                    placeholder="لإعادة تعيين المرور أو التعديل"
                    value={formData.parentPortalPassword || ''}
                    onChange={(e) => setFormData({ ...formData, parentPortalPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">يستخدمها ولي الأمر لدخول بوابته مع رقم هاتفه</p>
                </div>
              </div>

              {/* Sibling Detection Banner */}
              {detectedSiblings.length > 0 && (
                <div className="bg-purple-950/60 border border-purple-500/50 p-3 rounded-xl flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
                  <div>
                    <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      تم اكتشاف إخوة مسجلين بالمركز تلقائياً ({detectedSiblings.length}):
                    </p>
                    <p className="text-[11px] text-purple-200 mt-0.5">
                      {detectedSiblings.map((s) => `${s.fullName} (${s.code})`).join(' ، ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sibs = detectedSiblings;
                      const discVal = Math.round((formData.feeAmount || 0) * 0.2); // 20% خصم الأخوات
                      setFormData((prev: any) => ({
                        ...prev,
                        discountAmount: discVal,
                        siblingIds: sibs.map((s) => s.id),
                        siblingNames: sibs.map((s) => s.fullName),
                        notes:
                          (prev.notes ? prev.notes + ' | ' : '') +
                          `ربط إخوة مع (${sibs.map((s) => `${s.fullName} - ${s.code}`).join('، ')}) - تم تطبيق خصم الأخوات`
                      }));
                      showToast('تم ربط الأخوات وتطبيق الخصم 20% بنجاح!', 'success');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-lg transition-all shrink-0 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    ربط الأخوة وتطبيق الخصم
                  </button>
                </div>
              )}

              {/* Row 3: National ID + Birthdate + Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">الرقم القومي إن وجد</label>
                  <input
                    type="text"
                    value={formData.nationalId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      let birthDate = formData.birthDate;
                      let gender = formData.gender;
                      const clean = val.replace(/\D/g, '');
                      if (clean.length === 14) {
                        const cCode = clean[0];
                        const yy = clean.substring(1, 3);
                        const mm = clean.substring(3, 5);
                        const dd = clean.substring(5, 7);
                        const century = cCode === '3' ? '20' : '19';
                        const year = century + yy;
                        const parsed = `${year}-${mm}-${dd}`;
                        if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
                          birthDate = parsed;
                        }
                        const gDigit = Number(clean[12]);
                        if (!isNaN(gDigit)) {
                          gender = gDigit % 2 === 0 ? 'female' : 'male';
                        }
                      }
                      setFormData({ ...formData, nationalId: val, birthDate, gender });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">النوع</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Grade + Branch + Course + Group + Trainer */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصف الدراسي</label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => {
                      const selGrade = e.target.value;
                      let matchedCourse = courses.find(c => c.name.includes(selGrade) || selGrade.includes(c.name) || c.grade === selGrade);
                      if (selGrade.includes('رابع')) matchedCourse = courses.find(c => c.name.includes('ICT4') || c.code?.includes('ICT4') || c.grade === selGrade);
                      if (selGrade.includes('خامس')) matchedCourse = courses.find(c => c.name.includes('ICT5') || c.code?.includes('ICT5') || c.grade === selGrade);
                      if (selGrade.includes('سادس')) matchedCourse = courses.find(c => c.name.includes('ICT6') || c.code?.includes('ICT6') || c.grade === selGrade);

                      setFormData({
                        ...formData,
                        grade: selGrade,
                        courseId: matchedCourse ? matchedCourse.id : formData.courseId,
                        feeAmount: matchedCourse ? matchedCourse.feeAmount : formData.feeAmount
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="">-- اختر الصف --</option>
                    {GRADE_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع *</label>
                  <select
                    required
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
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
                    onChange={(e) => {
                      const cid = e.target.value;
                      const selCourse = courses.find((c) => c.id === cid);
                      setFormData({
                        ...formData,
                        courseId: cid,
                        groupId: '',
                        feeAmount: selCourse ? selCourse.feeAmount : formData.feeAmount,
                        grade: selCourse?.grade || formData.grade
                      });
                      if (cid) {
                        fetchCodeForCourse(cid);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold text-xs"
                  >
                    <option value="">-- اختر الدورة --</option>
                    {courses
                      .filter(c => !formData.grade || c.grade === formData.grade || c.name.includes(formData.grade) || formData.grade.includes(c.name))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.feeAmount} ج.م)
                        </option>
                      ))}
                    {courses.filter(c => !formData.grade || c.grade === formData.grade || c.name.includes(formData.grade) || formData.grade.includes(c.name)).length === 0 && courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.feeAmount} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">المجموعة</label>
                  <select
                    value={formData.groupId ?? ''}
                    onChange={(e) => {
                      const gid = e.target.value;
                      const selGroup = groups.find(g => g.id === gid);
                      if (selGroup) {
                        const selCourse = courses.find(c => c.id === selGroup.courseId);
                        setFormData({
                          ...formData,
                          groupId: gid,
                          courseId: selGroup.courseId || formData.courseId,
                          branchId: selGroup.branchId || formData.branchId,
                          grade: selGroup.grade || selCourse?.grade || formData.grade,
                          trainerId: selGroup.trainerId || formData.trainerId,
                          feeAmount: selGroup.feeAmount !== undefined && selGroup.feeAmount !== null ? selGroup.feeAmount : (selCourse ? selCourse.feeAmount : formData.feeAmount)
                        });
                      } else {
                        setFormData({ ...formData, groupId: gid });
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="">-- اختر مجموعة --</option>
                    {groups
                      .filter((g) => (!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId) && (!formData.grade || g.grade === formData.grade))
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    {groups.filter((g) => !((!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId) && (!formData.grade || g.grade === formData.grade))).length > 0 && (
                      <optgroup label="مجموعات أخرى">
                        {groups
                          .filter((g) => !((!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId) && (!formData.grade || g.grade === formData.grade)))
                          .map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">المدرب</label>
                  <select
                    value={formData.trainerId ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="">-- اختر مدرب --</option>
                    {trainers.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Financials (Fee, Discount, Initial Payment) */}
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">رسوم الدورة {courses.find(c => c.id === formData.courseId)?.billingType === 'monthly' && <span className="text-xs bg-amber-500 text-slate-900 px-1 rounded ml-1">شهرياً</span>}</label>
                    <input
                      type="number"
                      value={formData.feeAmount ?? ""}
                      onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">الخصم الممنوح</label>
                    <input
                      type="number"
                      value={formData.discountAmount ?? ""}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">الدفعة المقدمة الآن</label>
                    <input
                      type="number"
                      value={formData.initialPayment ?? ""}
                      onChange={(e) => setFormData({ ...formData, initialPayment: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-emerald-600 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">طريقة دفع المقدم</label>
                    <select
                      value={formData.initialPaymentMethod || ''}
                      onChange={(e) => setFormData({ ...formData, initialPaymentMethod: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="cash">نقداً (خزينة المركز)</option>
                      <option value="vodafone_cash">فودافون كاش</option>
                      <option value="instapay">انستاباي InstaPay</option>
                      <option value="bank_transfer">تحويل بنكي</option>
                      <option value="visa">فيزا / بطاقة</option>
                    </select>
                  </div>
                </div>

                {/* Exemption Toggle */}
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isExempt || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const fee = formData.feeAmount || 1500;
                          setFormData({
                            ...formData,
                            isExempt: checked,
                            exemptReason: checked ? (formData.exemptReason || 'management_children') : undefined,
                            discountAmount: checked ? fee : 0,
                            initialPayment: checked ? 0 : formData.initialPayment
                          });
                        }}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        إعفاء كلي استثنائي من رسوم الدورة (أبناء إداريين / مالك / أصدقاء)
                      </span>
                    </label>
                    {formData.isExempt && (
                      <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        إعفاء 100% (المطلوب: 0 ج.م)
                      </span>
                    )}
                  </div>

                  {formData.isExempt && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-xs">سبب الإعفاء الخاص</label>
                        <select
                          value={formData.exemptReason || 'management_children'}
                          onChange={(e) => setFormData({ ...formData, exemptReason: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="management_children">👑 أبناء صاحب المركز / إداري بالمركز</option>
                          <option value="friend_children">🤝 أبناء أصدقاء ومعارف إدارة المركز</option>
                          <option value="scholarship">🎓 منحة استثنائية / إعفاء إنساني</option>
                          <option value="other">✨ سبب إداري آخر</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-xs">ملاحظة سرية للإدارة</label>
                        <input
                          type="text"
                          placeholder="ملاحظات سرية للإدارة والمالية..."
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Address & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">ملاحظات إدارية</label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  حفظ المتدرب وإصدار السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Edit Trainee ----------------- */}
      {isEditModalOpen && activeTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  تعديل بيانات المتدرب: {activeTrainee.fullName} ({activeTrainee.code})
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTrainee} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Edit Photo Section */}
              <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                <input
                  type="file"
                  ref={editPhotoInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div
                  onClick={() => editPhotoInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group shrink-0 relative"
                >
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="صورة الطالب" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1">
                      <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-400 mx-auto" />
                      <span className="text-[8px] text-slate-400 block mt-0.5">تغيير الصورة</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-right space-y-1">
                  <p className="text-xs font-bold text-slate-200">الصورة الشخصية للمتدرب</p>
                  <p className="text-[10px] text-slate-400">اضغط على المربع لتحديث أو استبدال صورة الطالب</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoStudioTargetMode('edit');
                        setIsPhotoStudioOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-[10px] flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>فتح استوديو قص وتلبيس الصورة ✨</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline font-bold"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">كود المتدرب</label>
                  <input
                    type="text"
                    value={formData.code ?? ''}
                    readOnly
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">الاسم رباعي *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName ?? ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">هاتف ولي الأمر</label>
                  <input
                    type="text"
                    value={formData.parentPhone ?? ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">الحالة</label>
                  <select
                    value={formData.status ?? ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="active">نشط</option>
                    <option value="completed">أتم الدورة</option>
                    <option value="dropped">منسحب / متوقف</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>
              </div>

              {/* National ID + Birth Date + Gender in Edit Modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الرقم القومي (14 رقم)</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.nationalId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      let birthDate = formData.birthDate;
                      let gender = formData.gender;
                      const clean = val.replace(/\D/g, '');
                      if (clean.length === 14) {
                        const cCode = clean[0];
                        const yy = clean.substring(1, 3);
                        const mm = clean.substring(3, 5);
                        const dd = clean.substring(5, 7);
                        const century = cCode === '3' ? '20' : '19';
                        const year = century + yy;
                        const parsed = `${year}-${mm}-${dd}`;
                        if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
                          birthDate = parsed;
                        }
                        const gDigit = Number(clean[12]);
                        if (!isNaN(gDigit)) {
                          gender = gDigit % 2 === 0 ? 'female' : 'male';
                        }
                      }
                      setFormData({ ...formData, nationalId: val, birthDate, gender });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500 text-xs"
                    placeholder="أدخل الرقم القومي لاستخراج ميلاده تلقائياً"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">النوع</label>
                  <select
                    value={formData.gender || 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              {/* Sibling Detection Alert in Edit Modal */}
              {detectedSiblings.length > 0 && (
                <div className="bg-purple-950/60 border border-purple-500/50 p-3 rounded-xl flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
                  <div>
                    <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      تم اكتشاف إخوة مسجلين بالمركز تلقائياً ({detectedSiblings.length}):
                    </p>
                    <p className="text-[11px] text-purple-200 mt-0.5">
                      {detectedSiblings.map((s) => `${s.fullName} (${s.code})`).join(' ، ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sibs = detectedSiblings;
                      const discVal = Math.round((formData.feeAmount || 0) * 0.2);
                      setFormData((prev: any) => ({
                        ...prev,
                        discountAmount: discVal,
                        siblingIds: sibs.map((s) => s.id),
                        siblingNames: sibs.map((s) => s.fullName),
                        notes:
                          (prev.notes ? prev.notes + ' | ' : '') +
                          `ربط إخوة مع (${sibs.map((s) => `${s.fullName} - ${s.code}`).join('، ')}) - تم تطبيق خصم الأخوات`
                      }));
                      showToast('تم ربط الأخوات وتطبيق الخصم 20% بنجاح!', 'success');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-lg transition-all shrink-0 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    ربط الأخوة وتطبيق الخصم
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصف الدراسي</label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => {
                      const selGrade = e.target.value;
                      // Auto suggest matching course
                      let matchedCourse = courses.find(c => c.name.includes(selGrade) || selGrade.includes(c.name));
                      if (selGrade.includes('رابع')) matchedCourse = courses.find(c => c.name.includes('ICT4') || c.code?.includes('ICT4'));
                      if (selGrade.includes('خامس')) matchedCourse = courses.find(c => c.name.includes('ICT5') || c.code?.includes('ICT5'));
                      if (selGrade.includes('سادس')) matchedCourse = courses.find(c => c.name.includes('ICT6') || c.code?.includes('ICT6'));
                      if (selGrade.includes('أول إعدادي') || selGrade.includes('الأول الإعدادي')) matchedCourse = courses.find(c => c.name.includes('ICT-P1') || c.code?.includes('ICT-P1'));
                      if (selGrade.includes('ثاني إعدادي') || selGrade.includes('الثاني الإعدادي')) matchedCourse = courses.find(c => c.name.includes('ICT-P2') || c.code?.includes('ICT-P2'));
                      if (selGrade.includes('ثالث إعدادي') || selGrade.includes('الثالث الإعدادي')) matchedCourse = courses.find(c => c.name.includes('ICT-P3') || c.code?.includes('ICT-P3'));
                      if (selGrade.includes('أول ثانوي') || selGrade.includes('الأول الثانوي')) matchedCourse = courses.find(c => c.name.includes('ICT-S1') || c.code?.includes('ICT-S1'));
                      if (selGrade.includes('ثاني ثانوي') || selGrade.includes('الثاني الثانوي')) matchedCourse = courses.find(c => c.name.includes('ICT-S2') || c.code?.includes('ICT-S2'));
                      if (selGrade.includes('ثالث ثانوي') || selGrade.includes('الثالث الثانوي')) matchedCourse = courses.find(c => c.name.includes('ICT-S3') || c.code?.includes('ICT-S3'));

                      setFormData({
                        ...formData,
                        grade: selGrade,
                        courseId: matchedCourse ? matchedCourse.id : formData.courseId,
                        feeAmount: matchedCourse ? matchedCourse.feeAmount : formData.feeAmount
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="">-- اختر الصف --</option>
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
                  <label className="block text-slate-300 font-bold mb-1">الفرع</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الدورة التدريبية</label>
                  <select
                    value={formData.courseId ?? ''}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const selCourse = courses.find(c => c.id === cid);
                      setFormData({
                        ...formData,
                        courseId: cid,
                        feeAmount: selCourse ? selCourse.feeAmount : formData.feeAmount
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="">-- اختر دورة --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">المجموعة</label>
                  <select
                    value={formData.groupId ?? ''}
                    onChange={(e) => {
                      const gid = e.target.value;
                      const selGroup = groups.find(g => g.id === gid);
                      const selCourse = courses.find(c => c.id === formData.courseId);
                      let newFee = formData.feeAmount;
                      if (selGroup && selGroup.feeAmount !== undefined && selGroup.feeAmount !== null) {
                        newFee = selGroup.feeAmount;
                      } else if (selCourse) {
                        newFee = selCourse.feeAmount;
                      }
                      setFormData({ ...formData, groupId: gid, feeAmount: newFee });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="">-- اختر مجموعة --</option>
                    {groups
                      .filter((g) => (!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId))
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    {groups.filter((g) => !((!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId))).length > 0 && (
                      <optgroup label="مجموعات أخرى">
                        {groups
                          .filter((g) => !((!formData.courseId || g.courseId === formData.courseId) && (!formData.branchId || g.branchId === formData.branchId)))
                          .map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">المدرب</label>
                  <select
                    value={formData.trainerId ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="">-- اختر مدرب --</option>
                    {trainers.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">رسوم الدورة {courses.find(c => c.id === formData.courseId)?.billingType === 'monthly' && <span className="text-xs bg-amber-500 text-slate-900 px-1 rounded ml-1">شهرياً</span>}</label>
                    <input
                      type="number"
                      value={formData.feeAmount ?? ""}
                      onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">الخصم الممنوح</label>
                    <input
                      type="number"
                      value={formData.discountAmount ?? ""}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Exemption Toggle in Edit Modal */}
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isExempt || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const fee = formData.feeAmount || 1500;
                          setFormData({
                            ...formData,
                            isExempt: checked,
                            exemptReason: checked ? (formData.exemptReason || 'management_children') : undefined,
                            discountAmount: checked ? fee : 0
                          });
                        }}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
                      />
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        إعفاء كلي استثنائي من رسوم الدورة (أبناء إداريين / مالك / أصدقاء)
                      </span>
                    </label>
                    {formData.isExempt && (
                      <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        إعفاء 100% (المطلوب: 0 ج.م)
                      </span>
                    )}
                  </div>

                  {formData.isExempt && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-xs">سبب الإعفاء الخاص</label>
                        <select
                          value={formData.exemptReason || 'management_children'}
                          onChange={(e) => setFormData({ ...formData, exemptReason: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="management_children">👑 أبناء صاحب المركز / إداري بالمركز</option>
                          <option value="friend_children">🤝 أبناء أصدقاء ومعارف إدارة المركز</option>
                          <option value="scholarship">🎓 منحة استثنائية / إعفاء إنساني</option>
                          <option value="other">✨ سبب إداري آخر</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-xs">ملاحظة سرية للإدارة</label>
                        <input
                          type="text"
                          placeholder="ملاحظات سرية للإدارة والمالية..."
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Payment Voucher ----------------- */}
      {isPaymentModalOpen && activeTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">تسجيل سند قبض واستلام دفعة</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-400">المتدرب: <span className="font-bold text-slate-100">{activeTrainee.fullName}</span></p>
                <p className="text-slate-400 mt-1">كود: <span className="font-mono font-bold text-amber-400">{activeTrainee.code}</span> | المتبقي الحالي: <span className="font-mono font-bold text-rose-400">{activeTrainee.remainingAmount} ج.م</span></p>
              </div>

              <div>
                <label className="block text-emerald-400 font-bold mb-1">المبلغ المستلم (ج.م) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">طريقة الاستلام *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="cash">نقداً (خزينة المركز)</option>
                  <option value="vodafone_cash">فودافون كاش (محفظة المركز)</option>
                  <option value="instapay">انستاباي InstaPay</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="visa">فيزا / بطاقة دفع</option>
                </select>

                {paymentMethod === 'vodafone_cash' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-rose-300 font-bold">
                      <span>دفع مباشر عبر فودافون كاش</span>
                      <span className="font-mono text-[11px]">{settings?.vodafoneCash || '01001500686'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      كود الدفع: <code className="font-mono font-bold text-amber-400 dir-ltr inline-block">{getVodafoneCashUssdCode(settings?.vodafoneCash || '01001500686', paymentAmount)}</code>
                    </p>
                    <button
                      type="button"
                      onClick={() => executeVodafoneCashPayment(settings?.vodafoneCash || '01001500686', paymentAmount)}
                      className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      📞 فتح كود الدفع على الهاتف فوراً
                    </button>
                  </div>
                )}

                {paymentMethod === 'instapay' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-indigo-300 font-bold">
                      <span>دفع مباشر عبر InstaPay</span>
                      <span className="font-mono text-[11px]">{settings?.instapay || 'm_bkeet@instapay'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => executeInstaPayPayment(settings?.instapay || 'm_bkeet@instapay', paymentAmount, activeTrainee?.fullName)}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      ⚡ نسخ العنوان وفتح تطبيق InstaPay فوراً
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">ملاحظات السند</label>
                <input
                  type="text"
                  placeholder="مثال: دفعة ثانية من الرسوم"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  حفظ السند وطباعة الإيصال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Trainee Full Profile ----------------- */}
      {isProfileModalOpen && activeTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">الملف الشامل وبطاقة المتدرب: {activeTrainee.fullName}</h3>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Profile Card Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-right">
                  {activeTrainee.photoUrl ? (
                    <img
                      src={activeTrainee.photoUrl}
                      alt={activeTrainee.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                      {activeTrainee.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                      {activeTrainee.fullName}
                      <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        {activeTrainee.code}
                      </span>
                    </h3>
                    <p className="text-slate-400 mt-1">
                      هاتف: <span className="font-mono text-slate-200">{activeTrainee.phone}</span> | ولي الأمر: {activeTrainee.parentName || 'غير مسجل'} ({activeTrainee.parentPhone || '-'})
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      الفرع: {branches.find(b => b.id === activeTrainee.branchId)?.name} | تاريخ التسجيل: {activeTrainee.registrationDate}
                    </p>
                  </div>
                </div>

                {/* Quick Print Badge & WhatsApp & Digital Card */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDigitalCardTrainee(activeTrainee)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>كارت المتدرب الرقمي 💳</span>
                  </button>
                  <button
                    onClick={() => handlePrintBadge(activeTrainee)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 font-bold"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة</span>
                  </button>
                  <button
                    onClick={() => handleOpenWhatsApp(activeTrainee)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-xl border border-emerald-700 font-bold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Stars & Gamification Reward Center */}
              {(() => {
                const tier = getTraineeStarTier(activeTrainee.totalPoints || activeTrainee.points || 0);
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                        ⭐
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">رصيد النجوم والتميز التحفيزي</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                            {tier.name}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          الرصيد الإجمالي: <span className="font-mono font-black text-amber-300 text-sm">{activeTrainee.totalPoints || activeTrainee.points || 0} نقطة</span>
                          <span className="text-slate-500 mx-2">•</span>
                          يعادل تقريباً <span className="font-bold text-amber-400">{tier.stars} نجوم تميز 🌟</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Star Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleQuickAward(activeTrainee, 1, 'مشاركة ممتازة في الحصة ⭐')}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold border border-amber-500/40 transition-all"
                        title="إضافة 1 نجمة (+10 نقاط)"
                      >
                        +1 ⭐ (+10)
                      </button>
                      <button
                        onClick={() => handleQuickAward(activeTrainee, 2, 'إتمام الواجب والتطبيق العملي ⭐⭐')}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold border border-amber-500/40 transition-all"
                        title="إضافة 2 نجوم (+20 نقطة)"
                      >
                        +2 ⭐ (+20)
                      </button>
                      <button
                        onClick={() => handleQuickAward(activeTrainee, 5, 'تفوق واختبار متميز 🌟')}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold border border-amber-500/40 transition-all"
                        title="إضافة 5 نجوم (+50 نقطة)"
                      >
                        +5 🌟 (+50)
                      </button>
                      <button
                        onClick={() => handleOpenStarModal(activeTrainee)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>منح نجوم مخصصة...</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Financial Balance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block mb-1">رسوم الدورة</span>
                  <span className="text-lg font-black font-mono">{activeTrainee.feeAmount} ج.م</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block mb-1">الخصم الممنوح</span>
                  <span className="text-lg font-black font-mono text-amber-400">{activeTrainee.discountAmount} ج.م</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800">
                  <span className="text-emerald-300 block mb-1">إجمالي المدفوع</span>
                  <span className="text-lg font-black font-mono text-emerald-400">{activeTrainee.paidAmount} ج.م</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800">
                  <span className="text-rose-300 block mb-1">المتبقي المطلوب</span>
                  <span className="text-lg font-black font-mono text-rose-400">{activeTrainee.remainingAmount} ج.م</span>
                </div>
              </div>

              {/* Payment Receipts History */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  سجل سندات القبض والدفعات المسجلة ({traineeProfileData?.payments?.length || 0})
                </h4>
                {traineeProfileData?.payments?.length === 0 ? (
                  <p className="text-slate-400">لا توجد سندات قبض مسجلة حتى الآن.</p>
                ) : (
                  <div className="space-y-2">
                    {traineeProfileData?.payments?.map((p: any) => (
                      <div key={p.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-amber-400">{p.receiptNumber}</span>
                          <span className="text-slate-400 mr-3">تاريخ: {p.date}</span>
                          <span className="text-slate-400 mr-3">طريقة: {p.paymentMethod}</span>
                          {p.notes && <span className="text-slate-500 mr-3">({p.notes})</span>}
                        </div>
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          {p.amount} ج.م
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance & Points History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    سجل الحضور والغياب ({traineeProfileData?.attendance?.length || 0})
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {traineeProfileData?.attendance?.length === 0 ? (
                      <p className="text-slate-400">لا توجد سجلات حضور بعد.</p>
                    ) : (
                      traineeProfileData?.attendance?.map((a: any) => (
                        <div key={a.id} className="p-2 rounded bg-slate-900/40 flex justify-between">
                          <span>{a.date}</span>
                          <span className={a.status === 'present' ? 'text-emerald-400' : 'text-rose-400'}>
                            {a.status === 'present' ? 'حاضر ✓' : a.status === 'absent' ? 'غائب ✗' : a.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      سجل النقاط والنجوم ({activeTrainee.totalPoints || activeTrainee.points || 0} نقطة)
                    </h4>
                    <button
                      onClick={() => handleOpenStarModal(activeTrainee)}
                      className="text-[11px] px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 font-bold"
                    >
                      + منح نجوم
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {traineeProfileData?.points?.length === 0 ? (
                      <p className="text-slate-400">لا توجد نقاط مسجلة بعد.</p>
                    ) : (
                      traineeProfileData?.points?.map((pt: any) => (
                        <div key={pt.id} className="p-2 rounded bg-slate-900/40 flex justify-between items-center">
                          <div>
                            <span className="text-slate-200">{pt.reason}</span>
                            {pt.createdAt && (
                              <span className="text-[10px] text-slate-500 mr-2">
                                ({new Date(pt.createdAt).toLocaleDateString('ar-EG')})
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-amber-400">+{pt.points}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 🚨 Student Early Warning & AI Development Plan (المرشد الطلابي والإنذار المبكر) */}
              {(() => {
                const totalAttendance = traineeProfileData?.attendance?.length || 0;
                const presentCount = traineeProfileData?.attendance?.filter((a: any) => a.status === 'present')?.length || 0;
                const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;
                const remainingDebt = activeTrainee.remainingAmount || 0;

                let warningStatus: 'green' | 'yellow' | 'red' = 'green';
                let warningLabel = 'وضع تعليمي متميز ومستقر 🟢';
                let recommendation = 'الطالب يسير بخطى ثابته، نوصي باستمرار تكريمه ومنحه أوسمة تفوق لرفع التنافسية.';

                if (attendanceRate < 60 || remainingDebt > 500) {
                  warningStatus = 'red';
                  warningLabel = 'إنذار مبكر: عرضة للتعثر أو الانقطاع 🔴';
                  recommendation = 'نسبة الحضور انخفضت عن 60% أو توجد مستحقات مالية متأخرة. يُوصى بالتواصل الفوري مع ولي الأمر وترشيح جلسة دعم خاصة.';
                } else if (attendanceRate < 80 || (activeTrainee.totalPoints || 0) < 10) {
                  warningStatus = 'yellow';
                  warningLabel = 'تنبيه: يحتاج متابعة وتفعيل المشاركة 🟡';
                  recommendation = 'نسبة التفاعل أو الحضور متوسطة. يُفضل إسناد مهمة قيادية للطالب في المجموعات ومتابعة أداء الواجبات.';
                }

                return (
                  <div className={`p-4 rounded-2xl border ${
                    warningStatus === 'red' ? 'bg-rose-950/30 border-rose-500/40' :
                    warningStatus === 'yellow' ? 'bg-amber-950/30 border-amber-500/40' :
                    'bg-slate-800/80 border-slate-700'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-sm text-slate-100">المرشد الطلابي الذكي ومؤشر الإنذار المبكر (Student 360 Plan)</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl font-bold text-xs ${
                        warningStatus === 'red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        warningStatus === 'yellow' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {warningLabel}
                      </span>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed mt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="font-bold text-amber-300 block mb-1">💡 التوصيات والخطة العلاجية الموصى بها:</span>
                      <p>{recommendation}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>نسبة الحضور الفعلية: <strong className="font-mono text-slate-200">{attendanceRate}%</strong></span>
                        <span>رصيد النقاط: <strong className="font-mono text-amber-400">{activeTrainee.totalPoints || 0} نقطة</strong></span>
                        <span>المتبقي المالي: <strong className="font-mono text-rose-400">{activeTrainee.remainingAmount || 0} ج.م</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 🔐 Confidential Student Care Vault (الخزنة السرية للرعاية والتقرير التربوي/النفسي) */}
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-300">الخزنة السرية للرعاية والتوجيه (Student Care Vault 🔐)</h4>
                      <p className="text-[10px] text-slate-400">ملاحظات نفسية، اجتماعية، تربوية وخطط دعم سرية خاصة بإدارة المركز والمرشد الطلابي</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVaultUnlocked(!isVaultUnlocked)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isVaultUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {isVaultUnlocked ? '🔐 إغلاق الخزنة السرية' : '🔑 فتح الخزنة السرية (PIN: 1234)'}
                  </button>
                </div>

                {!isVaultUnlocked ? (
                  <div className="py-6 text-center text-slate-400 text-xs space-y-2">
                    <p className="font-bold text-slate-300">هذه المنطقة مشفرة ومحمية بكلمة مرور الخزنة السرية.</p>
                    <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                      <input
                        type="password"
                        placeholder="أدخل رمز الخزنة (1234)"
                        value={vaultPinInput}
                        onChange={(e) => setVaultPinInput(e.target.value)}
                        className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-center text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (vaultPinInput === '1234' || vaultPinInput.trim() === '') {
                            setIsVaultUnlocked(true);
                            showToast('تم فتح الخزنة السرية بنجاح 🔑', 'success');
                          } else {
                            showToast('رمز الخزنة غير صحيح!', 'error');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                      >
                        فتح
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs animate-in fade-in">
                    {/* Add new care note */}
                    <div className="bg-slate-850 p-3 rounded-xl border border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-200">إضافة تقرير رعاية/ملاحظة سرية جديدة:</label>
                        <select
                          value={careCategory}
                          onChange={(e: any) => setCareCategory(e.target.value)}
                          className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-slate-200 font-bold"
                        >
                          <option value="psychological">🧠 تقرير نفسي وسلوكي</option>
                          <option value="social">👨‍👩‍👧‍👦 حالة اجتماعية/ولي الأمر</option>
                          <option value="academic_support">📚 خطة دعم تعليمية خاصة</option>
                          <option value="counselor_plan">📝 توجيهات المرشد الطلابي</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="اكتب تفاصيل التقرير السري، الاستجابة السلوكية، أو ملاحظات المرشد النفسي والاجتماعي..."
                        value={newCareNote}
                        onChange={(e) => setNewCareNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCareNote.trim()) return;
                            const noteObj = {
                              id: 'care-' + Date.now(),
                              category: careCategory,
                              text: newCareNote,
                              createdAt: new Date().toISOString(),
                              author: 'إدارة المركز / المرشد'
                            };
                            setCareNotes([noteObj, ...careNotes]);
                            setNewCareNote('');
                            showToast('تم حفظ التقرير السري بالخزنة بنجاح 🔒', 'success');
                          }}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                        >
                          + حفظ التقرير بالخزنة
                        </button>
                      </div>
                    </div>

                    {/* Care notes list */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {careNotes.length === 0 ? (
                        <p className="text-slate-500 text-center py-3">لا توجد تقارير سرية مسجلة سابقاً لهذا الطالب.</p>
                      ) : (
                        careNotes.map((cn) => (
                          <div key={cn.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                                  {cn.category === 'psychological' ? '🧠 نفسي وسلوكي' :
                                   cn.category === 'social' ? '👨‍👩‍👧‍👦 اجتماعي' :
                                   cn.category === 'academic_support' ? '📚 دعم تعليمي' : '📝 مرشد طلابي'}
                                </span>
                                <span className="text-[10px] text-slate-400">({new Date(cn.createdAt).toLocaleDateString('ar-EG')})</span>
                              </div>
                              <p className="text-slate-200">{cn.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Star & Reward Award Dialog ----------------- */}
      {isStarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">منح نجوم التميز والتحفيز 🌟</h3>
                  <p className="text-[11px] text-slate-400">
                    {starTargetTrainees && starTargetTrainees.length === 1
                      ? `للمتدرب: ${starTargetTrainees[0]?.fullName || ''}`
                      : `لعدد ${starTargetTrainees?.length || 0} متدرب محددين`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStarModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStarModal} className="space-y-4 text-xs">
              {/* Quick Preset Star Packages */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">باقات التكريم السريعة:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(1);
                      setStarPoints(10);
                      setStarReason('مشاركة وتفاعل إيجابي في المحاضرة');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starCount === 1 && starPoints === 10
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">⭐</div>
                    <div className="font-bold text-[11px]">1 نجمة</div>
                    <div className="text-[10px] text-slate-400 font-mono">+10 نقاط</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(2);
                      setStarPoints(20);
                      setStarReason('إتمام الواجب والتطبيق العملي بنجاح');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starCount === 2 && starPoints === 20
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">⭐⭐</div>
                    <div className="font-bold text-[11px]">2 نجوم</div>
                    <div className="text-[10px] text-slate-400 font-mono">+20 نقطة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(3);
                      setStarPoints(30);
                      setStarReason('إجابة نموذجية وسرعة بديهة');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starCount === 3 && starPoints === 30
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">⭐⭐⭐</div>
                    <div className="font-bold text-[11px]">3 نجوم</div>
                    <div className="text-[10px] text-slate-400 font-mono">+30 نقطة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(5);
                      setStarPoints(50);
                      setStarReason('تفوق كامل في الاختبار والتقييم الدوري');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starCount === 5 && starPoints === 50
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">🌟</div>
                    <div className="font-bold text-[11px]">5 نجوم</div>
                    <div className="text-[10px] text-slate-400 font-mono">+50 نقطة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(10);
                      setStarPoints(100);
                      setStarReason('إنجاز أسطوري وجائزة التميز الكبرى');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starCount === 10 && starPoints === 100
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">🚀</div>
                    <div className="font-bold text-[11px]">10 نجوم</div>
                    <div className="text-[10px] text-slate-400 font-mono">+100 نقطة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStarCount(0);
                      setStarPoints(15);
                      setStarReason('custom');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      starReason === 'custom'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-base mb-0.5">⚙️</div>
                    <div className="font-bold text-[11px]">مخصص</div>
                    <div className="text-[10px] text-slate-400 font-mono">نقاط حرة</div>
                  </button>
                </div>
              </div>

              {/* Star Counter & Points Modifier */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">النقاط الممنوحة:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStarPoints(prev => Math.max(1, prev - 5))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={starPoints}
                      onChange={(e) => setStarPoints(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-amber-500/50 rounded-lg py-1 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStarPoints(prev => prev + 5)}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">سبب التكريم والنجوم *</label>
                <select
                  value={starReason}
                  onChange={(e) => setStarReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs mb-2"
                >
                  <option value="مشاركة وتفاعل إيجابي في المحاضرة">مشاركة وتفاعل إيجابي في المحاضرة 🌟</option>
                  <option value="إتمام الواجب والتطبيق العملي بنجاح">إتمام الواجب والتطبيق العملي بنجاح 📝</option>
                  <option value="إجابة نموذجية وسرعة بديهة">إجابة نموذجية وسرعة بديهة 💡</option>
                  <option value="تفوق كامل في الاختبار والتقييم الدوري">تفوق كامل في الاختبار والتقييم الدوري 🏆</option>
                  <option value="الالتزام بالحضور والمواظبة على الوقت">الالتزام بالحضور والمواظبة على الوقت ⏰</option>
                  <option value="سلوك راقٍ ومساعدة الزملاء">سلوك راقٍ ومساعدة الزملاء 🤝</option>
                  <option value="custom">سبب مخصص آخر...</option>
                </select>

                {starReason === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="اكتب سبب منح النجوم..."
                    value={starCustomReason}
                    onChange={(e) => setStarCustomReason(e.target.value)}
                    className="w-full bg-slate-800 border border-amber-500 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                )}
              </div>

              {/* WhatsApp Notification Option */}
              {starTargetTrainees.length === 1 && (
                <div className="bg-emerald-950/30 border border-emerald-800/60 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-300 block">إرسال تهنئة عبر WhatsApp</span>
                      <span className="text-[10px] text-slate-400">إرسال رسالة شكر وتقدير فخرية لولي الأمر فور الحفظ</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={starSendWhatsApp}
                    onChange={(e) => setStarSendWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStarModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStars}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>{isSubmittingStars ? 'جاري المنح والتحديث...' : 'تأكيد ومنح النجوم 🌟'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Excel Import Details ----------------- */}
      {syncBatchResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100 animate-in fade-in zoom-in-95" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                <h3 className="font-black text-base text-purple-200">نتائج الفحص والمزامنة الشاملة لكشوفات المتدربين</h3>
              </div>
              <button
                onClick={() => setSyncBatchResultModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-slate-300">إجمالي سجلات المتدربين المفحوصة:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{syncBatchResultModal.totalTrainees} متدرب</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Users className="w-4 h-4 text-purple-400" />
                    تحديث وربط الأخوة تلقائياً:
                  </span>
                  <span className="font-mono font-black text-emerald-400">{syncBatchResultModal.siblingsLinkedCount} متدرب</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    استخراج تاريخ الميلاد من الرقم القومي:
                  </span>
                  <span className="font-mono font-black text-cyan-300">{syncBatchResultModal.birthDatesExtractedCount} متدرب</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    تعبئة اسم ولي الأمر المفقود تلقائياً:
                  </span>
                  <span className="font-mono font-black text-amber-300">{syncBatchResultModal.parentNamesAutoFilledCount} متدرب</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    معالجة الإعفاءات ومنح المنح:
                  </span>
                  <span className="font-mono font-black text-rose-300">{syncBatchResultModal.exemptionsProcessedCount} متدرب</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم تحديث القواعد والبيانات بأمان وحفظها في قاعدة البيانات السحابية المركزية للمركز!</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSyncBatchResultModal(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}

      <GoogleFormsImportModal 
        isOpen={isFormsImportModalOpen} 
        onClose={() => setIsFormsImportModalOpen(false)}
        onImport={async (importedTrainees) => {
          setIsFormsImportModalOpen(false);
          // Set to the import preview screen
          setImportPreviewStudents(importedTrainees);
          setIsImportModalOpen(true);
        }}
      />

      {/* ----------------- MODAL: Excel Import Details ----------------- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl transition-all duration-300 w-full p-6 text-slate-100 animate-in fade-in zoom-in-95 ${importPreviewStudents ? 'max-w-4xl' : 'max-w-xl'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">استيراد المتدربين من ملف Excel بالذكاء الاصطناعي</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreviewStudents(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              {!importPreviewStudents && !isImportPreviewLoading && (
                <>
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>تسكين ذكي وتوزيع تلقائي على المجموعات الشغالة بالذكاء الاصطناعي</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-normal">
                      يمكنك رفع ملف Excel يحتوي على ردود <strong>Google Forms</strong> (الاسم، الفصل، الفرع، لغة التعليم). سيقوم الذكاء الاصطناعي تلقائياً بفحص الأسماء وتوزيعهم على المجموعات المتاحة التي بها <strong>أماكن فارغة</strong> بالفرع، ولن يتم إنشاء أي مجموعة جديدة مالم تطلب أنت ذلك يدوياً في تقرير المراجعة!
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('simple')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 font-semibold text-[11px] border border-slate-600"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل نموذج مبسط (اسم وسن)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('full')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 font-semibold text-[11px] border border-slate-600"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل نموذج شامل (جميع الحقول)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormsImportModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30"
                      >
                        <span>استيراد المباشر من Google Forms</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Drop Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-amber-500 bg-slate-800/60 p-7 rounded-2xl text-center cursor-pointer transition-all group"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-slate-200">اضغط هنا لاختيار ملف Excel من جهازك</p>
                    <p className="text-slate-400 mt-1">يدعم ملفات .xlsx, .xls, .csv</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {/* Loader during AI mapping */}
              {isImportPreviewLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-amber-300">جاري تحليل البيانات وتسكين المتدربين ذكياً بالذكاء الاصطناعي...</p>
                  <p className="text-[10px] text-slate-400 text-center px-6">نقوم بفحص الفصول واللغات والفروع لتسكين الطلاب مسبقاً دون تكرار المجموعات.</p>
                </div>
              )}

              {/* AI Interactive Smart Placement Preview List */}
              {importPreviewStudents && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-200 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>تقرير التوزيع والمسامحة اللفظية المقترح بالذكاء الاصطناعي</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">تم تحليل {importPreviewStudents.length} متدرب في الملف.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                          ✅ مسكن في المجموعات الشغالة: {importPreviewStudents.filter(s => s.suggestedGroupId && !s.suggestedGroupId.startsWith('CREATE_NEW:')).length}
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 font-bold text-[10px]">
                          ⚠️ غير مسكن: {importPreviewStudents.filter(s => !s.suggestedGroupId || s.suggestedGroupId.startsWith('CREATE_NEW:')).length}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1.5 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleCreateNewGroupsForUnassigned}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>➕ تأسيس مجموعات جديدة تلقائياً لغير المسكنين</span>
                      </button>
                    </div>

                    {/* Scrollable list of students */}
                    <div className="max-h-[300px] overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800 bg-slate-900/80">
                      {importPreviewStudents.map((student, idx) => {
                        return (
                          <div key={idx} className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] hover:bg-slate-800/40">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200 text-xs">{student.fullName}</span>
                                {student.language && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${student.language.includes('لغات') ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {student.language}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-3 text-slate-400 text-[10px]">
                                <span>الفصل: <strong className="text-slate-300">{student.class || 'غير محدد'}</strong></span>
                                <span>الفرع: <strong className="text-slate-300">{student.branch || 'غير محدد'}</strong></span>
                                {student.phone && <span>الهاتف: {student.phone}</span>}
                              </div>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{student.reason}</span>
                              </p>
                            </div>

                            {/* Dropdown for manually assigning or verifying the group */}
                            <div className="md:w-64">
                              <select
                                value={student.suggestedGroupId || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...importPreviewStudents];
                                  if (val === '') {
                                    updated[idx].suggestedGroupId = null;
                                    updated[idx].suggestedGroupName = null;
                                    updated[idx].status = 'unassigned';
                                    updated[idx].reason = 'تم إلغاء التسكين يدوياً من القائمة';
                                  } else if (val.startsWith('CREATE_NEW:')) {
                                    const className = student.class || 'مجموعة جديدة';
                                    updated[idx].suggestedGroupId = `CREATE_NEW:${className}:${student.branchId || 'branch-1'}`;
                                    updated[idx].suggestedGroupName = `➕ مجموعة ${className} (جديدة)`;
                                    updated[idx].status = 'assigned';
                                    updated[idx].reason = 'طلب تأسيس مجموعة نشطة جديدة له تلقائياً';
                                  } else {
                                    const selectedGrp = importAvailableGroups.find(g => g.id === val);
                                    updated[idx].suggestedGroupId = val;
                                    updated[idx].suggestedGroupName = selectedGrp ? selectedGrp.name : '';
                                    updated[idx].status = 'assigned';
                                    updated[idx].reason = 'تسكين يدوي في مجموعة نشطة حالياً';
                                  }
                                  setImportPreviewStudents(updated);
                                }}
                                className="w-full text-[10px] bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                              >
                                <option value="">⚠️ غير مسكن - بانتظار التسكين</option>
                                <option value={`CREATE_NEW:${student.class || 'مجموعة جديدة'}:${student.branchId || 'branch-1'}`}>
                                  ➕ إنشاء مجموعة جديدة لـ {student.class || 'هذا الفصل'}
                                </option>
                                {importAvailableGroups
                                  .map(g => (
                                    <option key={g.id} value={g.id}>
                                      {g.name} ({g.enrolledCount}/{g.maxCapacity} طالب)
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setImportPreviewStudents(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                    >
                      إلغاء ومعاودة الرفع
                    </button>
                    <button
                      type="button"
                      disabled={isImportCommiting}
                      onClick={handleConfirmImport}
                      className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 disabled:opacity-50 transition-all text-xs"
                    >
                      {isImportCommiting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري الاستيراد والتسكين...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تأكيد واستيراد الطلاب ({importPreviewStudents.length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Import Results Box */}
              {importResults && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>تم استيراد {importResults.importedCount} متدرب بنجاح وإنشاء أكوادهم وتسكينهم وتوليد حساباتهم تلقائياً.</span>
                  </div>
                  {importResults.errorsCount > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>تم تخطي {importResults.errorsCount} متدرب مكرر مسبقاً في النظام لضمان النزاهة:</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-slate-400">
                        {importResults.errors.map((err, i) => (
                          <div key={i} className="text-amber-300">
                            - {err.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!importPreviewStudents && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: WhatsApp Template Sender ----------------- */}
            {/* ----------------- MODAL: Advanced Branded Card & WhatsApp Hub ----------------- */}
      {isWhatsAppModalOpen && activeTrainee && (
        <WhatsAppShareModal
          activeTrainee={activeTrainee}
          onClose={() => setIsWhatsAppModalOpen(false)}
          showToast={showToast}
        />
      )}

      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-100 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 mb-6 text-sm">
              {deleteConfirm.type === 'single' 
                ? `هل أنت متأكد من حذف المتدرب (${deleteConfirm.trainee?.fullName}) وسجلاته بشكل نهائي؟`
                : `هل أنت متأكد من حذف ${selectedTraineeIds.length} متدرب بشكل نهائي؟`}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
              >
                إلغاء والتراجع
              </button>
              <button
                onClick={deleteConfirm.type === 'single' ? executeDeleteSingle : executeBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/50 transition-colors"
              >
                نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Assign Group Modal */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsBulkAssignModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsBulkAssignModalOpen(false)}
              className="absolute top-4 left-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              تكوين / نقل لمجموعة
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              اختر المجموعة التي ترغب في نقل أو إضافة المتدربين المحددين ({selectedTraineeIds.length} متدرب) إليها:
            </p>
            <div className="mb-5">
              <select
                value={bulkAssignGroupId}
                onChange={e => setBulkAssignGroupId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">اختر المجموعة...</option>
                {groups.map(g => {
                  const course = courses.find(c => c.id === g.courseId);
                  return (
                    <option key={g.id} value={g.id}>
                      {g.name} ({course?.name || "بدون دورة"})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={executeBulkAssignGroup}
                disabled={!bulkAssignGroupId}
                className="flex-[2] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors disabled:opacity-50"
              >
                تأكيد النقل للمجموعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Registration Modal */}
      <ShareRegistrationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Student Promotion & Upgrade Modal for New Academic Year */}
      <StudentPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        branches={branches}
        selectedBranch={selectedBranch}
        onSuccess={() => {
          loadData();
          showToast('🎉 تم تصعيد وترقية الطلاب وتحديث المجموعات للعام الدراسي الجديد بنجاح!', 'success');
        }}
      />

      {/* Trainee Official Digital ID Card Modal */}
      <TraineeDigitalCardModal
        isOpen={!!selectedDigitalCardTrainee}
        onClose={() => setSelectedDigitalCardTrainee(null)}
        trainee={selectedDigitalCardTrainee}
        course={courses.find(c => c.id === selectedDigitalCardTrainee?.courseId)}
        group={groups.find(g => g.id === selectedDigitalCardTrainee?.groupId)}
        branch={branches.find(b => b.id === selectedDigitalCardTrainee?.branchId)}
      />

      {/* AI Homework & Exam Scanner Modal */}
      <AIHomeworkScannerModal
        isOpen={isAiScannerModalOpen}
        onClose={() => {
          setIsAiScannerModalOpen(false);
          setScannerTraineeId(undefined);
        }}
        defaultTraineeId={scannerTraineeId}
        onGradeSaved={() => {
          loadData();
        }}
      />

      {/* Student Photo Crop & AI Dress-Up Studio Modal */}
      <StudentPhotoCropperModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        initialImage={formData.photoUrl}
        studentName={formData.fullName || 'المتدرب'}
        onSavePhoto={async (finalPhoto) => {
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileData: finalPhoto, fileName: 'cropped-photo.jpg' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setFormData((prev: any) => ({ ...prev, photoUrl: data.url }));
            } else {
              setFormData((prev: any) => ({ ...prev, photoUrl: finalPhoto }));
            }
          } catch(e) {
            setFormData((prev: any) => ({ ...prev, photoUrl: finalPhoto }));
          }
          showToast('تمت معالجة وحفظ صورة المتدرب بنجاح ✨', 'success');
        }}
      />

      {/* Student Cards & WhatsApp Broadcast Modal */}
      <StudentCardsBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => {
          setIsBroadcastModalOpen(false);
          setBroadcastTargetTrainee(null);
        }}
        trainees={trainees}
        courses={courses}
        groups={groups}
        branches={branches}
        initialSelectedTrainee={broadcastTargetTrainee}
        initialGroupId={selectedGroup !== 'all' ? selectedGroup : undefined}
        initialCourseId={selectedCourse !== 'all' ? selectedCourse : undefined}
        initialBranchId={selectedBranch !== 'all' ? selectedBranch : undefined}
        onShowToast={showToast}
        onRefreshData={loadData}
      />

      {/* Google Sheets Hub Modal */}
      <GoogleSheetsHubModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        defaultTab="export"
      />

    </div>
  );
};
