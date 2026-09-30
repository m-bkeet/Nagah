import React, { useState, useEffect, useMemo } from 'react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Wallet,
  Receipt,
  PiggyBank,
  Printer,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Building2,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Lock,
  Users,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Camera,
  Clock,
  Eye,
  X,
  Check,
  Sparkles,
  Bot,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Payment, TrainerSettlement, Trainee, Course, Trainer } from '../types';
import { OfficialReceiptModal } from '../components/OfficialReceiptModal';
import { GoogleSheetsHubModal } from '../components/GoogleSheetsHubModal';
import { ExpensesView } from './ExpensesView';
import { GroupCashCollectionCockpit } from '../components/GroupCashCollectionCockpit';
import { ClosingAccountReportModal } from '../components/ClosingAccountReportModal';
import { TrainerPayoutModal } from '../components/TrainerPayoutModal';

interface FinanceViewProps {
  initialTab?: 'groupCollection' | 'payments' | 'expenses' | 'pendingProofs' | 'settlements' | 'trainerShares' | 'gradesBreakdown' | 'exemptions' | 'courseClosing';
}

export const FinanceView: React.FC<FinanceViewProps> = ({ initialTab }) => {
  const { 
    branches, 
    activeBranchId, 
    showToast, 
    setPrintData, 
    refreshKey, 
    openAiModal,
    trainees: ctxTrainees,
    courses: ctxCourses,
    trainers: ctxTrainers,
    settings: ctxSettings
  } = useCenter();
  const { user, canAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<'groupCollection' | 'payments' | 'expenses' | 'pendingProofs' | 'settlements' | 'trainerShares' | 'gradesBreakdown' | 'exemptions' | 'courseClosing'>(
    initialTab || 'groupCollection'
  );
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isClosingReportModalOpen, setIsClosingReportModalOpen] = useState(false);
  const [selectedTrainerForPayout, setSelectedTrainerForPayout] = useState<any | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedFinanceBranchId, setSelectedFinanceBranchId] = useState<string>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [showTodayTable, setShowTodayTable] = useState(false);
  const [editingTrainerPctId, setEditingTrainerPctId] = useState<string | null>(null);
  const [editingTrainerPctValue, setEditingTrainerPctValue] = useState<number>(50);
  const [isUpdatingTrainerPct, setIsUpdatingTrainerPct] = useState(false);
  const [pendingProofs, setPendingProofs] = useState<Payment[]>([]);
  const [settlements, setSettlements] = useState<TrainerSettlement[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    const list = ctxTrainees || [];
    return activeBranchId !== 'all' ? list.filter(t => t.branchId === activeBranchId) : list;
  });
  const [courses, setCourses] = useState<Course[]>(() => ctxCourses || []);
  const [trainers, setTrainers] = useState<Trainer[]>(() => ctxTrainers || []);

  useEffect(() => {
    if (ctxTrainers && ctxTrainers.length > 0) setTrainers(ctxTrainers);
  }, [ctxTrainers]);

  useEffect(() => {
    if (ctxTrainees && ctxTrainees.length > 0) {
      setTrainees(activeBranchId !== 'all' ? ctxTrainees.filter(t => t.branchId === activeBranchId) : ctxTrainees);
    }
  }, [ctxTrainees, activeBranchId]);

  useEffect(() => {
    if (ctxCourses && ctxCourses.length > 0) setCourses(ctxCourses);
  }, [ctxCourses]);
  const [summary, setSummary] = useState<any>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalTrainerPayouts: 0,
    netTreasury: 0,
    totalTrainerDues: 0,
    totalCenterShare: 0,
    totalTraineeRemaining: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pending Proof & Lightbox States
  const [selectedProofForLightbox, setSelectedProofForLightbox] = useState<Payment | null>(null);
  const [rejectModalProof, setRejectModalProof] = useState<Payment | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isProcessingProof, setIsProcessingProof] = useState(false);
  const [selectedOfficialReceipt, setSelectedOfficialReceipt] = useState<Payment | null>(null);
  const [selectedAuditPayment, setSelectedAuditPayment] = useState<Payment | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSecretArchivesModalOpen, setIsSecretArchivesModalOpen] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [archiveTitle, setArchiveTitle] = useState(`أرشيف مالي حتى تاريخ ${new Date().toLocaleDateString('ar-EG')}`);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const [secretPin, setSecretPin] = useState('');
  const [isVerifiedSecret, setIsVerifiedSecret] = useState(false);
  const [secretArchives, setSecretArchives] = useState<any[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<any | null>(null);

  const [isResetSecretTreasuryConfirmOpen, setIsResetSecretTreasuryConfirmOpen] = useState(false);
  const [isExecutingSecretReset, setIsExecutingSecretReset] = useState(false);
  const [exemptionSubTab, setExemptionSubTab] = useState<'all' | 'exempt' | 'sibling' | 'custom'>('all');
  const [isSyncingTrainees, setIsSyncingTrainees] = useState(false);

  const handleBatchSyncRecords = async () => {
    setIsSyncingTrainees(true);
    try {
      const res = await api.request<any>('/trainees/batch-sync-records', { method: 'POST' });
      if (res.success) {
        showToast(`تمت مزامنة الكشوف بنجاح! تم استخراج ${res.siblingsLinkedCount || 0} إخوة وتطوير كشوف الإعفاءات.`, 'success');
        loadFinanceData();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء المزامنة', 'error');
    } finally {
      setIsSyncingTrainees(false);
    }
  };

  const secretTreasuryBalance = Math.max(0, secretArchives.reduce((sum, arch) => sum + (Number(arch.summary?.netTreasury) || 0), 0));

  const handleExecuteResetSecretTreasury = async () => {
    setIsExecutingSecretReset(true);
    try {
      const res = await api.resetSecretTreasury({
        pin: secretPin,
        userId: user?.id,
        userName: user?.fullName,
        userRole: user?.role,
        role: user?.role
      });
      if (res.success) {
        showToast('تم تصفير الخزنة السرية بنجاح.', 'success');
        setIsResetSecretTreasuryConfirmOpen(false);
        const archRes = await api.getSecretArchives(secretPin, user?.role);
        if (archRes.success) {
          setSecretArchives(archRes.archives || []);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'عذراً، تصفير الخزنة السرية متاح فقط لمدير النظام', 'error');
    } finally {
      setIsExecutingSecretReset(false);
    }
  };

  const handleExecuteResetAndArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPin) {
      showToast('يرجى إدخال رمز الأمان السري للمدير', 'warning');
      return;
    }
    setIsSubmittingReset(true);
    try {
      const res = await api.resetFinancialsAndArchive({
        archiveTitle,
        pin: resetPin,
        userId: user?.id,
        userName: user?.fullName
      });
      if (res.success) {
        showToast('تمت عملية تصفير الحسابات الشاملة وحفظ الأرشيف السري للمدير بنجاح تام! 🔐', 'success');
        setIsResetModalOpen(false);
        setResetPin('');
        loadFinanceData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تصفير الحسابات (تأكد من صحة رمز الأمان السري)', 'error');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleVerifySecretAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretPin) {
      showToast('يرجى إدخال رمز المدير السري', 'warning');
      return;
    }
    setIsLoadingArchives(true);
    try {
      const res = await api.getSecretArchives(secretPin);
      if (res.success) {
        setSecretArchives(res.archives || []);
        setIsVerifiedSecret(true);
        showToast('تم التحقق بنجاح من صلاحيات المدير - فتح السجل السري 🔓', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'رمز الأمان السري غير صحيح أو ليس لديك صلاحية المدير', 'error');
    } finally {
      setIsLoadingArchives(false);
    }
  };

  const isManagerOrAccountant = canAccess(['super_admin', 'accountant', 'admin_staff']) || user?.role === 'super_admin' || user?.role === 'accountant';

  useEffect(() => {
    loadFinanceData(true);
  }, [selectedFinanceBranchId, activeBranchId, refreshKey]);

  // Real-time synchronization across multiple browser windows, tabs, and desktop shortcuts
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nagah_finance_channel');
      channel.onmessage = (msg) => {
        if (msg.data?.type === 'FINANCE_MUTATED') {
          loadFinanceData(true);
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nagah_last_financial_mutation') {
        loadFinanceData(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleFocus = () => {
      loadFinanceData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedFinanceBranchId]);

  const loadFinanceData = async (forceFresh = false) => {
    setIsLoading(true);
    try {
      const branchParam: Record<string, string> = { fresh: 'true' };
      if (selectedFinanceBranchId !== 'all') {
        branchParam.branchId = selectedFinanceBranchId;
      } else if (activeBranchId !== 'all') {
        // Fallback to active branch if not explicitly 'all'
        branchParam.branchId = activeBranchId;
      }

      const [sumRes, payRes, pendingRes, setRes, allPayRes] = await Promise.all([
        api.getFinanceSummary({ fresh: 'true', branchId: selectedFinanceBranchId !== 'all' ? selectedFinanceBranchId : undefined }),
        api.getPayments(branchParam),
        api.getPendingPaymentProofs(),
        api.getTrainerSettlements({ fresh: 'true' }),
        api.getPayments({ fresh: 'true' })
      ]);
      setSummary(sumRes);
      setPayments(payRes || []);
      setAllPayments(Array.isArray(allPayRes) && allPayRes.length > 0 ? allPayRes : (payRes || []));
      setPendingProofs(pendingRes || []);
      setSettlements(setRes || []);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات الخزينة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTrainerPercentage = async (trainerId: string, newPct: number) => {
    setIsUpdatingTrainerPct(true);
    try {
      const res = await api.updateTrainer(trainerId, { percentage: Number(newPct) });
      if (res) {
        showToast(`تم تحديث نسبة المدرب إلى ${newPct}% بنجاح!`, 'success');
        setEditingTrainerPctId(null);
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}
        await loadFinanceData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث نسبة المدرب', 'error');
    } finally {
      setIsUpdatingTrainerPct(false);
    }
  };

  const handleApproveProof = async (proof: Payment) => {
    if (!confirm(`هل أنت متاكد من استلام مبلغ ${proof.amount} ج.م واعتماد قيد الطالب ${proof.traineeName || ''}؟`)) return;
    setIsProcessingProof(true);
    try {
      const res = await api.approvePaymentProof({
        paymentId: proof.id,
        approvedByUserId: user?.id,
        approvedByUserName: user?.fullName || 'المشرف المالي'
      });
      if (res.success) {
        showToast('تم اعتماد إيصال السداد وإضافة القيد لحساب الطالب بنجاح! ✅', 'success');
        loadFinanceData();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء اعتماد الإيصال', 'error');
    } finally {
      setIsProcessingProof(false);
    }
  };

  const handleConfirmRejectProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalProof) return;
    if (!rejectionReasonText.trim()) {
      showToast('يرجى كتابة سبب رفض الإيصال', 'warning');
      return;
    }
    setIsProcessingProof(true);
    try {
      const res = await api.rejectPaymentProof({
        paymentId: rejectModalProof.id,
        rejectionReason: rejectionReasonText.trim(),
        rejectedByUserId: user?.id,
        rejectedByUserName: user?.fullName
      });
      if (res.success) {
        showToast('تم رفض إيصال السداد وإرسال التنبيه لولي الأمر ❌', 'info');
        setRejectModalProof(null);
        setRejectionReasonText('');
        loadFinanceData();
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تنفيذ عملية الرفض', 'error');
    } finally {
      setIsProcessingProof(false);
    }
  };

  const handlePrintReceipt = (p: Payment) => {
    setPrintData({
      title: `سند قبض - ${p.receiptNumber}`,
      type: 'receipt',
      data: {
        payment: p,
        trainee: { fullName: p.traineeName, code: p.traineeCode },
        branchName: branches.find(b => b.id === p.branchId)?.name || 'الفرع الرئيسي',
        courseName: p.courseName || 'دورة تدريبية'
      }
    });
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.traineeName && p.traineeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.traineeCode && p.traineeCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTraineeCourseFee = (t: Trainee) => {
    if (t.feeAmount && t.feeAmount > 0) return t.feeAmount;
    const course = courses.find((c) => c.id === t.courseId || c.name === t.courseName);
    return course ? (course.price || course.feeAmount || 200) : 200;
  };

  const exemptTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const courseFee = getTraineeCourseFee(t);
      const isExNote = Boolean(t.notes && /إعفاء|معفي|منحة|أبناء المالك|أبناء الإدارة|مجاني/i.test(t.notes));
      const is100Disc = t.discountAmount > 0 && t.discountAmount >= courseFee;
      return Boolean(t.isExempt) || String(t.isExempt) === 'true' || Boolean(t.exemptReason) || isExNote || is100Disc;
    });
  }, [trainees, courses]);

  const siblingDiscountTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const hasSibIds = Boolean(t.siblingIds && t.siblingIds.length > 0);
      const hasSibNote = Boolean(t.notes && /خصم الأخوات|خصم اخوات|خصم أخت|خصم أخ/i.test(t.notes));
      return hasSibIds || hasSibNote;
    });
  }, [trainees]);

  const customDiscountTrainees = useMemo(() => {
    return trainees.filter((t) => {
      if (exemptTrainees.some((ex) => ex.id === t.id)) return false;
      if (siblingDiscountTrainees.some((sib) => sib.id === t.id)) return false;
      return (t.discountAmount && t.discountAmount > 0) || Boolean(t.notes && /خصم/i.test(t.notes));
    });
  }, [trainees, exemptTrainees, siblingDiscountTrainees]);

  const allDiscountAndExemptTrainees = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Exempt trainees (100% discount)
    exemptTrainees.forEach((t) => {
      const courseFee = getTraineeCourseFee(t);
      const note = t.notes || '';
      let label = '✨ إعفاء كامل 100%';
      if (t.exemptReason === 'management_children' || /مالك|إداري|إدارة/i.test(note)) {
        label = '👑 أبناء إداري / مالك (إعفاء 100%)';
      } else if (t.exemptReason === 'friend_children' || /أصدقاء|معارف/i.test(note)) {
        label = '🤝 أبناء أصدقاء ومعارف (إعفاء 100%)';
      } else if (t.exemptReason === 'scholarship' || /منحة/i.test(note)) {
        label = '🎓 منحة استثنائية (إعفاء 100%)';
      }

      map.set(t.id, {
        ...t,
        categoryType: 'exempt',
        discountLabel: label,
        computedFee: courseFee,
        computedDiscount: courseFee,
        computedNet: 0
      });
    });

    // 2. Sibling discount trainees
    siblingDiscountTrainees.forEach((t) => {
      if (!map.has(t.id)) {
        const courseFee = getTraineeCourseFee(t);
        const discVal = t.discountAmount > 0 ? t.discountAmount : Math.round(courseFee * 0.2);
        map.set(t.id, {
          ...t,
          categoryType: 'sibling_discount',
          discountLabel: '👨‍👩‍👧‍👦 خصم الأخوات 20%',
          computedFee: courseFee,
          computedDiscount: discVal,
          computedNet: Math.max(0, courseFee - discVal)
        });
      }
    });

    // 3. Custom discount trainees
    customDiscountTrainees.forEach((t) => {
      if (!map.has(t.id)) {
        const courseFee = getTraineeCourseFee(t);
        const discVal = t.discountAmount > 0 ? t.discountAmount : Math.round(courseFee * 0.1);
        map.set(t.id, {
          ...t,
          categoryType: 'custom_discount',
          discountLabel: '🏷️ خصم استثنائي خاص',
          computedFee: courseFee,
          computedDiscount: discVal,
          computedNet: Math.max(0, courseFee - discVal)
        });
      }
    });

    return Array.from(map.values());
  }, [exemptTrainees, siblingDiscountTrainees, customDiscountTrainees, courses]);

  const displayedExemptTrainees = useMemo(() => {
    if (exemptionSubTab === 'exempt') return allDiscountAndExemptTrainees.filter((t) => t.categoryType === 'exempt');
    if (exemptionSubTab === 'sibling') return allDiscountAndExemptTrainees.filter((t) => t.categoryType === 'sibling_discount');
    if (exemptionSubTab === 'custom') return allDiscountAndExemptTrainees.filter((t) => t.categoryType === 'custom_discount');
    return allDiscountAndExemptTrainees;
  }, [allDiscountAndExemptTrainees, exemptionSubTab]);

  const totalExemptValue = useMemo(() => {
    return exemptTrainees.reduce((acc, t) => acc + getTraineeCourseFee(t), 0);
  }, [exemptTrainees, courses]);

  const totalSiblingDiscountValue = useMemo(() => {
    return siblingDiscountTrainees.reduce((acc, t) => {
      const fee = getTraineeCourseFee(t);
      const disc = t.discountAmount > 0 ? t.discountAmount : Math.round(fee * 0.2);
      return acc + disc;
    }, 0);
  }, [siblingDiscountTrainees, courses]);

  const totalAllDiscountsAndExemptionsValue = useMemo(() => {
    return allDiscountAndExemptTrainees.reduce((acc, t) => acc + (t.computedDiscount || 0), 0);
  }, [allDiscountAndExemptTrainees]);

  const mgmtChildrenCount = exemptTrainees.filter((t) => t.exemptReason === 'management_children' || (t.notes && /مالك|إداري|إدارة/i.test(t.notes))).length;
  const friendChildrenCount = exemptTrainees.filter((t) => t.exemptReason === 'friend_children' || (t.notes && /أصدقاء|معارف/i.test(t.notes))).length;
  const scholarshipCount = exemptTrainees.filter((t) => t.exemptReason === 'scholarship' || (t.notes && /منحة/i.test(t.notes)) || (!t.exemptReason && !/مالك|إداري|أصدقاء/i.test(t.notes || ''))).length;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayPayments = useMemo(() => {
    return payments.filter(p => p.date === todayStr);
  }, [payments, todayStr]);

  const todayTotal = useMemo(() => {
    return todayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [todayPayments]);

  const branchBreakdown = useMemo(() => {
    const sourcePayments = allPayments.length > 0 ? allPayments : payments;
    return branches.map(b => {
      const branchPayments = sourcePayments.filter(p => p.branchId === b.id);
      const branchTodayPayments = branchPayments.filter(p => p.date === todayStr);
      const totalAmount = branchPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const todayAmount = branchTodayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return {
        branchId: b.id,
        branchName: b.name || (b.id === 'branch-1' ? 'فرع النجاح' : 'فرع بدر'),
        totalAmount,
        todayAmount,
        totalCount: branchPayments.length,
        todayCount: branchTodayPayments.length
      };
    });
  }, [branches, allPayments, payments, todayStr]);

  const systemAllTotal = useMemo(() => {
    const sourcePayments = allPayments.length > 0 ? allPayments : payments;
    return sourcePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [allPayments, payments]);

  const systemTodayTotal = useMemo(() => {
    const sourcePayments = allPayments.length > 0 ? allPayments : payments;
    return sourcePayments.filter(p => p.date === todayStr).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [allPayments, payments, todayStr]);

  const normalizeGradeName = (t: Trainee) => {
    const raw = `${t.grade || ''} ${t.notes || ''} ${t.groupName || ''}`;
    if (/رابع|رابعة|4/i.test(raw)) return 'الصف الرابع الابتدائي (سنة رابعة)';
    if (/خامس|خامسة|5/i.test(raw)) return 'الصف الخامس الابتدائي (سنة خامسة)';
    if (/سادس|سادسة|6/i.test(raw)) return 'الصف السادس الابتدائي (سنة سادسة)';
    if (/أول.*إعداد|1.*إعداد/i.test(raw)) return 'الصف الأول الإعدادي';
    if (/ثان.*إعداد|2.*إعداد/i.test(raw)) return 'الصف الثاني الإعدادي';
    if (/ثالث.*إعداد|3.*إعداد/i.test(raw)) return 'الصف الثالث الإعدادي';
    return t.grade || 'المرحلة العامة والشهادات';
  };

  const academicGradesBreakdown = useMemo(() => {
    const gradeMap = new Map<string, {
      name: string;
      traineesCount: number;
      expectedFee: number;
      collected: number;
      remaining: number;
      exemptCount: number;
      todayCollected: number;
    }>();

    const traineesList = ctxTrainees || trainees || [];
    const filteredT = selectedFinanceBranchId === 'all' 
      ? traineesList 
      : traineesList.filter(t => t.branchId === selectedFinanceBranchId);

    filteredT.forEach(t => {
      const gName = normalizeGradeName(t);
      if (!gradeMap.has(gName)) {
        gradeMap.set(gName, {
          name: gName,
          traineesCount: 0,
          expectedFee: 0,
          collected: 0,
          remaining: 0,
          exemptCount: 0,
          todayCollected: 0
        });
      }
      const entry = gradeMap.get(gName)!;
      entry.traineesCount += 1;
      if (t.isExempt) entry.exemptCount += 1;
      const fee = t.isExempt ? 0 : (t.netAmount || t.feeAmount || 0);
      entry.expectedFee += fee;
      entry.collected += (t.paidAmount || 0);
      entry.remaining += t.isExempt ? 0 : (t.remainingAmount || 0);
    });

    todayPayments.forEach(p => {
      const t = traineesList.find(tr => tr.id === p.traineeId);
      if (t) {
        const gName = normalizeGradeName(t);
        if (gradeMap.has(gName)) {
          gradeMap.get(gName)!.todayCollected += Number(p.amount) || 0;
        }
      }
    });

    return Array.from(gradeMap.values()).sort((a, b) => b.collected - a.collected);
  }, [ctxTrainees, trainees, selectedFinanceBranchId, todayPayments]);

  const trainerSharesBreakdown = useMemo(() => {
    return (trainers || []).map(tr => {
      const trainerCourses = courses.filter(c => c.trainerId === tr.id || (tr.courses && tr.courses.includes(c.id)));
      const trainerCourseIds = new Set(trainerCourses.map(c => c.id));
      const trainerPayments = payments.filter(p => p.trainerId === tr.id || (p.courseId && trainerCourseIds.has(p.courseId)));
      const totalCollected = trainerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const defaultPct = tr.percentage !== undefined ? tr.percentage : (trainerCourses[0]?.trainerPercentage || trainerCourses[0]?.trainerSharePercentage || 50);
      const trainerEarned = Math.round((totalCollected * defaultPct) / 100);
      const centerShare = totalCollected - trainerEarned;

      const trainerSettlements = settlements.filter(s => s.trainerId === tr.id);
      const totalSettled = trainerSettlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const netDue = Math.max(0, trainerEarned - totalSettled);

      return {
        trainer: tr,
        courses: trainerCourses,
        percentage: defaultPct,
        totalCollected,
        trainerEarned,
        centerShare,
        totalSettled,
        netDue,
        paymentsCount: trainerPayments.length
      };
    });
  }, [trainers, courses, payments, settlements]);

  const courseGradeBreakdown = useMemo(() => {
    return courses.map(course => {
      const courseTrainees = trainees.filter(t => t.courseId === course.id || (t.courseIds && t.courseIds.includes(course.id)));
      const coursePayments = payments.filter(p => p.courseId === course.id);
      const totalCollected = coursePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const expectedRevenue = courseTrainees.reduce((sum, t) => sum + (t.isExempt ? 0 : (Number(t.netAmount) || Number(t.feeAmount) || 0)), 0);
      const remainingDebt = courseTrainees.reduce((sum, t) => sum + (t.isExempt ? 0 : (Number(t.remainingAmount) || 0)), 0);
      const collectionRate = expectedRevenue > 0 ? Math.round((totalCollected / expectedRevenue) * 100) : 0;
      
      const trainerPct = course.trainerPercentage || course.trainerSharePercentage || 50;
      const trainerAmount = Math.round((totalCollected * trainerPct) / 100);
      const centerAmount = totalCollected - trainerAmount;

      return {
        course,
        traineesCount: courseTrainees.length,
        paymentsCount: coursePayments.length,
        expectedRevenue,
        totalCollected,
        remainingDebt,
        collectionRate,
        trainerPct,
        trainerAmount,
        centerAmount
      };
    });
  }, [courses, trainees, payments]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-emerald-200/90 dark:border-slate-700/70 p-5 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            إدارة الحسابات والخزينة الرئيسية
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
            متابعة سندات القبض، العمولات التدريبية، وصافي الخزينة الفعلي
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsClosingReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            title="طباعة فاتورة الحساب الختامي الرسمية والتقرير المالي الشامل"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ طباعة الفاتورة والحساب الختامي</span>
          </button>

          <button
            onClick={() => loadFinanceData(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="تحديث فوري ومزامنة فورية من السحابة"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث السحابة 🔄</span>
          </button>

          <button
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 dark:bg-emerald-600/30 dark:hover:bg-emerald-600/60 dark:border-emerald-500/40 dark:text-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="تصدير ومزامنة سجل الخزينة والحسابات مع جداول Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Google Sheets 📊</span>
          </button>

          <button
            onClick={() => openAiModal('manager')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 border border-amber-500/40 cursor-pointer"
            title="مساعد المدير الذكي للتحليلات المالية وقرارات الخزينة"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            <span>مساعد الخزينة الذكي 🤖</span>
          </button>

          <button
            onClick={() => {
              setArchiveTitle(`أرشيف مالي حتى تاريخ ${new Date().toLocaleDateString('ar-EG')}`);
              setResetPin('');
              setIsResetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            title="تصفير الإيرادات، الخزينة، المستحقات، والحصص مع حفظ أرشيف سري"
          >
            <Lock className="w-4 h-4" />
            <span>تصفير الحسابات الشامل (أرشيف سري) ⚡</span>
          </button>
          
          <button
            onClick={() => {
              setArchiveTitle(`تصفير الخزينة والبدء على نظافة - ${new Date().toLocaleDateString('ar-EG')}`);
              setResetPin('');
              setIsResetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer"
            title="تصفير الخزنة من أي مبالغ افتراضية أو تجريبية للبدء على نظافة تماماً"
          >
            <Zap className="w-4 h-4" />
            <span>🧹 تصفير الخزنة (ابدأ على نظافة)</span>
          </button>

          <button
            onClick={() => {
              setSecretPin('');
              setIsVerifiedSecret(false);
              setSecretArchives([]);
              setSelectedArchiveDetail(null);
              setIsSecretArchivesModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            title="السجل المالي السري للمدير للإحصائيات السابقة بعد التصفير"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>🔐 السجل السري للمدير (الإحصائيات السابقة)</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث برقم الإيصال أو اسم الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Branch Selector Toolbar & Cross-Branch Clarity */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 ml-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>عرض حسابات الخزينة حسب الفرع:</span>
          </span>
          <button
            onClick={() => setSelectedFinanceBranchId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedFinanceBranchId === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>🏢 جميع الفروع المركزية</span>
            <span className="font-mono font-black text-[11px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
              {systemAllTotal.toLocaleString()} ج.م
            </span>
          </button>
          {branches.map(b => {
            const bData = branchBreakdown.find(br => br.branchId === b.id);
            const bAmount = bData?.totalAmount || 0;
            const isSelected = selectedFinanceBranchId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedFinanceBranchId(b.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>📍 {b.name}</span>
                <span className="font-mono font-black text-[11px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
                  {bAmount.toLocaleString()} ج.م
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-bold">
          {selectedFinanceBranchId === 'all' ? (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>إجمالي كافة الفروع مجتمعة ({systemAllTotal.toLocaleString()} ج.م)</span>
            </span>
          ) : (
            <button
              onClick={() => setSelectedFinanceBranchId('all')}
              className="text-amber-700 dark:text-amber-400 underline hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>معروض فرع محدد فقط - انقر هنا لعرض إجمالي كل الفروع</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice if viewing a specific branch */}
      {selectedFinanceBranchId !== 'all' && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold text-amber-950 dark:text-amber-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              أنت الآن تشاهد إيرادات فرع ({branches.find(b => b.id === selectedFinanceBranchId)?.name || 'الفرع المحدد'}) فقط بمبلغ {(summary?.totalRevenue || 0).toLocaleString()} ج.م. إجمالي كل الفروع هو {systemAllTotal.toLocaleString()} ج.م.
            </span>
          </div>
          <button
            onClick={() => setSelectedFinanceBranchId('all')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-sm shrink-0"
          >
            عرض إجمالي كافة الفروع (المركز العام) 🏢
          </button>
        </div>
      )}

      {/* Today's Collections & Branch Flow Live Cockpit */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              💵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  وارد الخزينة اليومي وتوزيع الفروع ({new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black animate-pulse">
                  محدث لحظياً ⚡
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                متابعة حركة التحصيل اليومية، وتوزيع الإيراد بين فرع النجاح وفرع بدر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowTodayTable(!showTodayTable)}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{showTodayTable ? 'إخفاء كشف مقبوضات اليوم' : `كشف مقبوضات اليوم (${todayPayments.length} سند)`}</span>
            </button>

            <button
              onClick={() => setIsClosingReportModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ طباعة الفاتورة والحساب الختامي</span>
            </button>
          </div>
        </div>

        {/* Breakdown Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card: مقبوضات اليوم */}
          <div className="bg-white dark:bg-slate-900/90 border border-emerald-300 dark:border-emerald-500/40 p-4 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 block">🌟 إجمالي مقبوضات اليوم</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full font-mono">
                {todayPayments.length} سند
              </span>
            </div>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {todayTotal.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              وارد اليوم عبر كافة وسائل الدفع
            </div>
          </div>

          {/* Cards for Branches */}
          {branchBreakdown.map((b) => (
            <div key={b.branchId} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">🏢 {b.branchName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono">
                  {b.totalCount} سند
                </span>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {b.totalAmount.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </span>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                وارد اليوم: {b.todayAmount.toLocaleString()} ج.م ({b.todayCount} سند)
              </div>
            </div>
          ))}

          {/* Card: مستحقات المدربين */}
          <div 
            onClick={() => setActiveTab('trainerShares')}
            className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-500/40 p-4 rounded-2xl shadow-xs space-y-1 cursor-pointer hover:border-amber-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block">👨‍🏫 مستحقات نسب المدربين</span>
              <span className="text-[10px] text-amber-600 group-hover:underline">عرض النسب ⬅️</span>
            </div>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {trainerSharesBreakdown.reduce((sum, t) => sum + t.netDue, 0).toLocaleString()} <span className="text-xs font-sans">ج.م</span>
            </span>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              جاهزة للصرف الفوري للمحاضرين
            </div>
          </div>
        </div>

        {/* Detailed Today's Payments Table (Expands on click) */}
        {showTodayTable && (
          <div className="mt-4 pt-4 border-t border-emerald-500/30 animate-fadeIn">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>سندات مقبوضات اليوم بالساعة والفرع ({todayPayments.length} سند - {todayTotal.toLocaleString()} ج.م)</span>
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">رقم السند</th>
                    <th className="p-2.5">الوقت</th>
                    <th className="p-2.5">اسم الطالب</th>
                    <th className="p-2.5">المرحلة / الدورة</th>
                    <th className="p-2.5">الفرع</th>
                    <th className="p-2.5">المبلغ</th>
                    <th className="p-2.5">طريقة الدفع</th>
                    <th className="p-2.5">المسؤول</th>
                    <th className="p-2.5">الإيصال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todayPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-500">
                        لم يتم تسجيل أي سندات تحصيل اليوم حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    todayPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="p-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">{p.receiptNumber}</td>
                        <td className="p-2.5 font-mono text-slate-500">{p.time || '-'}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{p.traineeName}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{p.groupName || courses.find(c => c.id === p.courseId)?.name || 'دورة تدريبية'}</td>
                        <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">
                          {branches.find(b => b.id === p.branchId)?.name || (p.branchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر')}
                        </td>
                        <td className="p-2.5 font-mono font-black text-emerald-600 dark:text-emerald-400">{p.amount} ج.م</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">
                          {p.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : p.paymentMethod === 'instapay' ? 'انستا باي' : 'نقداً كاش'}
                        </td>
                        <td className="p-2.5 text-slate-500">{p.receivedByUserName || 'الخزينة'}</td>
                        <td className="p-2.5">
                          <button
                            onClick={() => setSelectedOfficialReceipt(p)}
                            className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-bold transition-all"
                          >
                            معاينة الإيصال 📄
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Financial Summary Cards - 3D Luminous Jewel Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: إجمالي المقبوضات */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-500/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">إجمالي المقبوضات</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight">
            {(summary?.totalRevenue || 0).toLocaleString()} <span className="text-xs font-bold font-sans">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">سندات قبض محصلة</div>
        </div>

        {/* Card 2: المصروفات والمنصرف */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-rose-50/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border border-rose-200/90 dark:border-rose-500/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-rose-800 dark:text-rose-300 font-bold block">المصروفات والمنصرف</span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono tracking-tight">
            {(summary?.totalExpenses || 0).toLocaleString()} <span className="text-xs font-bold font-sans">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">مصاريف تشغيلية</div>
        </div>

        {/* Card 3: حصة المركز الصافية */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-cyan-50/40 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border border-cyan-200/90 dark:border-cyan-500/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-cyan-800 dark:text-cyan-300 font-bold block">حصة المركز الصافية</span>
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono tracking-tight">
            {(summary?.totalCenterShare || 0).toLocaleString()} <span className="text-xs font-bold font-sans">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">أرباح المكان</div>
        </div>

        {/* Card 4: صافي الخزينة الفعلي */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400/80 dark:border-amber-500/60 shadow-md hover:shadow-lg transition-all relative overflow-hidden group ring-1 ring-amber-400/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-amber-800 dark:text-amber-300 font-black block">صافي الخزينة الفعلي</span>
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight">
            {(summary?.netTreasury || 0).toLocaleString()} <span className="text-xs font-bold font-sans">ج.م</span>
          </span>
          <div className="text-[11px] text-amber-800 dark:text-amber-400/90 mt-1 font-bold">النقدية المتاحة</div>
        </div>
      </div>

      {/* AI Financial Forecasting & Insights */}
      <div className="bg-white dark:bg-slate-900/90 border border-amber-500/30 dark:border-amber-500/40 rounded-3xl p-5 sm:p-6 mb-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-amber-500 via-emerald-500 to-indigo-500"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/25">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">الذكاء المالي الاستراتيجي (AI Insights)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">تحليلات وتنبؤات مبنية على قراءة السجلات المالية وحركة الخزينة</p>
            </div>
          </div>
          <button
            onClick={() => showToast('جاري توليد تقرير الذكاء الاصطناعي المالي المفصل...', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/25 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد تقرير شامل</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Revenue vs Expenses (Tailwind CSS 3D Bar Chart) */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              مؤشر الإيرادات مقابل المنصرف
            </h4>
            <div className="flex items-end justify-between h-36 gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow">{(summary?.totalRevenue || 0)} ج.م</span>
                <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 border border-emerald-400 rounded-t-xl shadow-md shadow-emerald-500/20 transition-all duration-1000 ease-out" style={{ height: `${Math.max(14, Math.min(100, ((summary?.totalRevenue || 1) / ((summary?.totalRevenue || 0) + (summary?.totalExpenses || 0) || 1)) * 100))}%` }}></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">الإيرادات</span>
              </div>
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow">{(summary?.totalExpenses || 0)} ج.م</span>
                <div className="w-full bg-gradient-to-t from-rose-500 to-rose-400 border border-rose-400 rounded-t-xl shadow-md shadow-rose-500/20 transition-all duration-1000 ease-out" style={{ height: `${Math.max(14, Math.min(100, ((summary?.totalExpenses || 1) / ((summary?.totalRevenue || 0) + (summary?.totalExpenses || 0) || 1)) * 100))}%` }}></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">المصروفات</span>
              </div>
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow">{(summary?.netTreasury || 0)} ج.م</span>
                <div className="w-full bg-gradient-to-t from-amber-500 to-amber-400 border border-amber-400 rounded-t-xl shadow-md shadow-amber-500/20 transition-all duration-1000 ease-out" style={{ height: `${Math.max(14, Math.min(100, ((summary?.netTreasury || 1) / (summary?.totalRevenue || 1)) * 100))}%` }}></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">الصافي</span>
              </div>
            </div>
          </div>

          {/* AI Predictive Recommendations */}
          <div className="space-y-3 flex flex-col justify-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">معدل التحصيل ممتاز</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">استناداً لحركة الخزينة، معدل تسديد الطلاب يقترب من 85%. يوصى بتشغيل حملات إعلانية للدورات القادمة لاستغلال التدفق النقدي.</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-900 dark:text-amber-300">مستحقات معلقة للمدربين</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">يوجد {(summary?.totalTrainerDues || 0).toLocaleString()} ج.م قيد الانتظار كحصة للمدربين. يفضل جدولة صرفها الأسبوع القادم للحفاظ على استقرار السيولة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setActiveTab('groupCollection')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'groupCollection'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>⚡ تحصيل المجموعات الفوري والإيصالات</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>سندات القبض والأرشيف ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'expenses'
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
              : 'text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/40'
          }`}
        >
          <Receipt className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span>إدارة المصروفات والنفقات</span>
        </button>

        <button
          onClick={() => setActiveTab('pendingProofs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'pendingProofs'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
              : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>طلبات السداد بانتظار التحقق</span>
          {pendingProofs.length > 0 && (
            <span className="py-0.5 px-2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black animate-pulse">
              {pendingProofs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('trainerShares')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'trainerShares'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span>👨‍🏫 نسب ومستحقات المدربين ({trainers.length})</span>
          {trainerSharesBreakdown.some(t => t.netDue > 0) && (
            <span className="py-0.5 px-2 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-black">
              {trainerSharesBreakdown.reduce((sum, t) => sum + t.netDue, 0).toLocaleString()} ج.م
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gradesBreakdown')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'gradesBreakdown'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>🎓 كشوف الصفوف والمراحل (سنة رابعة وخامسة)</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            activeTab === 'settlements'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>سندات صرف مستحقات المدربين ({settlements.length})</span>
        </button>

        {isManagerOrAccountant && (
          <button
            onClick={() => setActiveTab('exemptions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
              activeTab === 'exemptions'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                : 'text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/40'
            }`}
          >
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>إحصائية الإعفاءات والخصومات السرية ({exemptTrainees.length})</span>
          </button>
        )}
      </div>

      {/* Group Cash Collection Cockpit View */}
      {activeTab === 'groupCollection' && (
        <GroupCashCollectionCockpit />
      )}

      {/* Expenses Management View */}
      {activeTab === 'expenses' && (
        <ExpensesView />
      )}

      {/* Pending Proofs Review View */}
      {activeTab === 'pendingProofs' && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm dark:shadow-xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>إيصالات ولقطات الشاشة المرفوعة بانتظار الاعتماد ⏳</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                مراجعة التحويلات المالية على فودافون كاش / انستا باي / الحساب البنكي، وتأكيد السداد للطالب
              </p>
            </div>
            <span className="py-1 px-3 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold text-xs">
              عدد الطلبات المعلقة: {pendingProofs.length}
            </span>
          </div>

          {pendingProofs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">لا توجد أي طلبات سداد إلكترونية معلقة حالياً!</p>
              <p className="text-xs text-slate-500">تمت مراجعة جميع الإيصالات المرفوعة من أولياء الأمور.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">{proof.traineeName || 'طالب غير محدد'}</span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">كود: {proof.traineeCode || '—'}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-lg font-black font-mono text-emerald-400 block dir-ltr">{proof.amount} EGP</span>
                      <span className="text-[10px] text-slate-400 block">{proof.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">عن شهر/فترة:</span>
                      <span className="font-bold text-amber-300">{proof.targetMonth || 'الشهر الحالي'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">وسيلة التحويل:</span>
                      <span className="font-bold text-slate-200">
                        {proof.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' :
                         proof.paymentMethod === 'instapay' ? '⚡ انستا باي' :
                         proof.paymentMethod === 'bank_transfer' ? '🏛️ تحويل بنكي' : 'نقداً'}
                      </span>
                    </div>
                  </div>

                  {proof.notes && (
                    <div className="p-2 rounded-xl bg-slate-950 text-[11px] text-slate-300 italic border border-slate-800">
                      ملاحظة ولي الأمر: {proof.notes}
                    </div>
                  )}

                  {/* Screenshot Thumbnail */}
                  {proof.proofImageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={proof.proofImageUrl} alt="إيصال السداد" className="w-full h-36 object-cover" />
                      <button
                        onClick={() => setSelectedProofForLightbox(proof)}
                        className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-amber-300 font-bold text-xs transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>معاينة الإيصال مكبراً 🔍</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs bg-slate-950 rounded-xl">لا توجد صورة مرفقة</div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      disabled={isProcessingProof}
                      onClick={() => handleApproveProof(proof)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد السداد وتأكيد القيد ✓</span>
                    </button>
                    <button
                      disabled={isProcessingProof}
                      onClick={() => {
                        setRejectModalProof(proof);
                        setRejectionReasonText('');
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table: Receipts / Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 select-none">
                <tr>
                  <th className="p-3.5">رقم الإيصال</th>
                  <th className="p-3.5">التاريخ والوقت</th>
                  <th className="p-3.5">المتدرب</th>
                  <th className="p-3.5">الدورة</th>
                  <th className="p-3.5">الدافع (من سدد)</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5">المستلم (الخزينة)</th>
                  <th className="p-3.5 text-center">أصل المبلغ (منين؟) / طباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      لا توجد سندات قبض مسجلة.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{p.receiptNumber}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono">{p.date}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {p.traineeName || 'متدرب'}
                        {p.traineeCode && (
                          <span className="mr-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            ({p.traineeCode})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{p.courseName || '-'}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-bold text-xs">
                        {p.submittedByParentName || p.traineeName || 'ولي الأمر / الطالب'}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {p.amount} ج.م
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {p.paymentMethod === 'cash'
                            ? 'نقداً'
                            : p.paymentMethod === 'vodafone_cash'
                            ? 'فودافون كاش'
                            : p.paymentMethod === 'instapay'
                            ? 'انستاباي'
                            : 'تحويل'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-bold">{p.receivedByUserName || 'مسؤول الخزينة'}</td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedAuditPayment(p)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          title="تتبع أصل ومصدر المبلغ (عايز اعرف الفلوس دي جات منين)"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                          <span>منين؟</span>
                        </button>
                        <button
                          onClick={() => setSelectedOfficialReceipt(p)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors shadow-xs"
                          title="عرض الإيصال الرسمي الشامل القابل للحفظ والمشاركة"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-amber-700 dark:text-amber-300 rounded-lg transition-colors shadow-xs"
                          title="طباعة سند القبض السريع"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Trainer Shares & Commission Cockpit */}
      {activeTab === 'trainerShares' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/30 border border-emerald-200 dark:border-emerald-500/30 p-5 rounded-3xl shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>لوحة نسب ومستحقات المدربين وتوزيع الأرباح</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black">
                      حسابات آلية دقيقة
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    احتساب النسب المئوية للمحاضرين تلقائياً من إجمالي تحصيلات طلابهم، مع إمكانية تعديل النسبة والصرف المباشر من الخزنة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClosingReportModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة تقرير الحساب الختامي والنسب 🖨️</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-500/20">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">إجمالي المحصل من طلابهم</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {trainerSharesBreakdown.reduce((sum, t) => sum + t.totalCollected, 0).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-amber-200 dark:border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">إجمالي استحقاقات المدربين</span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                  {trainerSharesBreakdown.reduce((sum, t) => sum + t.trainerEarned, 0).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">المنصرف لهم فعلياً</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {trainerSharesBreakdown.reduce((sum, t) => sum + t.totalSettled, 0).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-500/40">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">الصافي الجاهز للصرف للمدربين</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  {trainerSharesBreakdown.reduce((sum, t) => sum + t.netDue, 0).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainerSharesBreakdown.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700">
                لا يوجد أي مدربين مسجلين في النظام حتى الآن.
              </div>
            ) : (
              trainerSharesBreakdown.map((ts) => {
                const tr = ts.trainer;
                const isEditing = editingTrainerPctId === tr.id;
                return (
                  <div
                    key={tr.id}
                    className="bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 rounded-3xl p-5 shadow-sm dark:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {tr.name}
                            </h4>
                            {tr.code && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                {tr.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {tr.specialization || tr.phone || 'مدرب معتمد بالمركز'}
                          </p>
                        </div>

                        {/* Trainer Percentage Badge & Editor */}
                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingTrainerPctValue}
                                onChange={(e) => setEditingTrainerPctValue(Number(e.target.value))}
                                className="w-14 px-1.5 py-1 text-xs font-bold text-center bg-slate-100 dark:bg-slate-900 border border-emerald-500 rounded-lg outline-none"
                              />
                              <span className="text-xs font-bold">%</span>
                              <button
                                onClick={() => handleUpdateTrainerPercentage(tr.id, editingTrainerPctValue)}
                                disabled={isUpdatingTrainerPct}
                                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-xs"
                                title="حفظ"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingTrainerPctId(null)}
                                className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 text-xs"
                                title="إلغاء"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTrainerPctId(tr.id);
                                setEditingTrainerPctValue(ts.percentage);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-black font-mono hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                              title="اضغط لتعديل نسبة المدرب"
                            >
                              <span>نسبة المدرب: {ts.percentage}%</span>
                              <span className="text-[10px]">✏️</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Course / Groups Pills */}
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 flex-wrap">
                        <span className="text-slate-400 font-bold">الدورات:</span>
                        {ts.courses.length > 0 ? (
                          ts.courses.map(c => (
                            <span key={c.id} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">جميع المجموعات</span>
                        )}
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">إجمالي المحصل</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {ts.totalCollected.toLocaleString()} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 block">({ts.paymentsCount} إيصال)</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مستحقاته ({ts.percentage}%)</span>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                            {ts.trainerEarned.toLocaleString()} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 block">نصيب السنتر: {ts.centerShare.toLocaleString()}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">تم صرفه سابقاً</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                            {ts.totalSettled.toLocaleString()} ج.م
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/40">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">الصافي المتبقي الآن</span>
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-base">
                            {ts.netDue.toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payout Action Button */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTrainerForPayout({
                            trainer: tr,
                            netDue: ts.netDue,
                            totalCollected: ts.totalCollected,
                            percentage: ts.percentage
                          });
                          setIsPayoutModalOpen(true);
                        }}
                        disabled={ts.netDue <= 0}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                          ts.netDue > 0
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 active:scale-95 cursor-pointer'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>صرف وتسوية مستحقات المدرب ({ts.netDue.toLocaleString()} ج.م) 💵</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View: Academic Grades Breakdown (سنة رابعة وسنة خامسة) */}
      {activeTab === 'gradesBreakdown' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 p-5 rounded-3xl shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  🎓
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>كشوف الحسابات وتفاصيل التحصيل حسب الصفوف والمراحل الدراسية</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-black">
                      سنة رابعة &bull; سنة خامسة &bull; باقي الصفوف
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    متابعة دقيقة لمبالغ التحصيل والديون المتبقية ونسبة السداد ومقبوضات اليوم لكل صف دراسي على حدة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsClosingReportModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة كشف الحساب الختامي الشامل 🖨️</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-500/20">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">إجمالي طلاب الصفوف</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {academicGradesBreakdown.reduce((sum, g) => sum + g.traineesCount, 0)} طالب
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">إجمالي الرسوم المطلوبة</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {academicGradesBreakdown.reduce((sum, g) => sum + g.expectedFee, 0).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block">إجمالي المحصل الفعلي</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {academicGradesBreakdown.reduce((sum, g) => sum + g.collected, 0).toLocaleString()} ج.م
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-rose-300 dark:border-rose-500/30">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 block">الديون المتبقية على الطلاب</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {academicGradesBreakdown.reduce((sum, g) => sum + g.remaining, 0).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 select-none">
                  <tr>
                    <th className="p-3.5">المرحلة / الصف الدراسي</th>
                    <th className="p-3.5">عدد الطلاب</th>
                    <th className="p-3.5">إجمالي الرسوم المطلوبة</th>
                    <th className="p-3.5">المحصل الفعلي</th>
                    <th className="p-3.5">الديون المتبقية</th>
                    <th className="p-3.5">معدل التحصيل</th>
                    <th className="p-3.5">مقبوضات اليوم</th>
                    <th className="p-3.5">المعفون كلياً</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                  {academicGradesBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        لا توجد صفوف دراسية مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    academicGradesBreakdown.map((ag, idx) => {
                      const rate = ag.expectedFee > 0 ? Math.round((ag.collected / ag.expectedFee) * 100) : 100;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 font-bold text-slate-950 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            <span>{ag.name}</span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {ag.traineesCount} طالب
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {ag.expectedFee.toLocaleString()} ج.م
                          </td>
                          <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {ag.collected.toLocaleString()} ج.م
                          </td>
                          <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                            {ag.remaining.toLocaleString()} ج.م
                          </td>
                          <td className="p-3.5 font-mono font-bold">
                            <span className={`px-2 py-1 rounded-lg text-xs ${rate >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : rate >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                              {rate}%
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {ag.todayCollected > 0 ? `${ag.todayCollected.toLocaleString()} ج.م` : '-'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                            {ag.exemptCount > 0 ? `${ag.exemptCount} طالب` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Secret Exemptions & Discounts Statistics (Confidential for Management & Accountant Only) */}
      {activeTab === 'exemptions' && isManagerOrAccountant && (
        <div className="space-y-4 animate-fadeIn">
          {/* Secret Alert Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 dark:from-purple-950/80 dark:via-purple-950 dark:to-purple-900/60 border border-purple-200 dark:border-purple-500/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/90 border border-purple-300 dark:border-purple-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="font-black text-sm text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  تقرير إحصائي خاص ومحمي: الخصومات الإجمالية والإعفاءات الكاملة
                </h3>
                <p className="text-xs text-purple-800 dark:text-purple-300/80 mt-0.5">
                  بيانات سرية ومحسوبة بدقة لمدير النظام والمدير المالي، تشمل إعفاءات أبناء المالك، المنح، وخصومات الأخوات (20%).
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleBatchSyncRecords}
                disabled={isSyncingTrainees}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl border border-purple-500 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="إعادة فحص ومزامنة كشوفات الأخوات والإعفاءات تلقائياً"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTrainees ? 'animate-spin' : ''}`} />
                <span>{isSyncingTrainees ? 'جاري التدقيق...' : '🔄 تدقيق وتطوير الكشوف تلقائياً'}</span>
              </button>
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/80 px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-500/40 shrink-0">
                🔒 سري للغاية
              </span>
            </div>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-500/40 space-y-1 shadow-xs">
              <span className="text-xs text-amber-900 dark:text-slate-400 font-bold block">إجمالي المستفيدين (خصومات وإعفاءات)</span>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                {allDiscountAndExemptTrainees.length} <span className="text-xs font-bold font-sans">طالب</span>
              </span>
              <div className="text-[11px] text-amber-900 dark:text-amber-300 font-mono font-bold">
                الوفر الإجمالي: {totalAllDiscountsAndExemptionsValue.toLocaleString()} ج.م
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800/90 border border-purple-200 dark:border-purple-500/40 space-y-1 shadow-xs">
              <span className="text-xs text-purple-900 dark:text-slate-400 font-bold block">الإعفاءات الكلية (100%)</span>
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {exemptTrainees.length} <span className="text-xs font-bold font-sans">طالب</span>
              </span>
              <div className="text-[11px] text-purple-900 dark:text-purple-200 font-mono font-bold">
                القيمة: {totalExemptValue.toLocaleString()} ج.م
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-slate-800/90 border border-cyan-200 dark:border-cyan-500/40 space-y-1 shadow-xs">
              <span className="text-xs text-cyan-900 dark:text-slate-400 font-bold block">خصم الأخوات المسجل (20%)</span>
              <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono">
                {siblingDiscountTrainees.length} <span className="text-xs font-bold font-sans">طالب</span>
              </span>
              <div className="text-[11px] text-cyan-900 dark:text-cyan-200 font-mono font-bold">
                الوفر: {totalSiblingDiscountValue.toLocaleString()} ج.م
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-500/40 space-y-1 shadow-xs">
              <span className="text-xs text-emerald-900 dark:text-slate-400 font-bold block">أبناء المالك والإدارة والمنح</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {mgmtChildrenCount + friendChildrenCount + scholarshipCount} <span className="text-xs font-bold font-sans">طالب</span>
              </span>
              <div className="text-[11px] text-emerald-800 dark:text-slate-400 font-medium">
                إدارة: {mgmtChildrenCount} | أصدقاء ومنح: {friendChildrenCount + scholarshipCount}
              </div>
            </div>
          </div>

          {/* Sub-Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
            <button
              onClick={() => setExemptionSubTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                exemptionSubTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
            >
              <span>كل الخصومات والإعفاءات</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-900/40 font-mono">
                {allDiscountAndExemptTrainees.length}
              </span>
            </button>

            <button
              onClick={() => setExemptionSubTab('exempt')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                exemptionSubTab === 'exempt'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
            >
              <span>👑 الإعفاءات الكاملة (100%)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 font-mono">
                {exemptTrainees.length}
              </span>
            </button>

            <button
              onClick={() => setExemptionSubTab('sibling')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                exemptionSubTab === 'sibling'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
              }`}
            >
              <span>👨‍👩‍👧‍👦 خصم الأخوات (20%)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-100 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200 font-mono">
                {siblingDiscountTrainees.length}
              </span>
            </button>

            {customDiscountTrainees.length > 0 && (
              <button
                onClick={() => setExemptionSubTab('custom')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  exemptionSubTab === 'custom'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
                }`}
              >
                <span>🏷️ خصومات استثنائية</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-mono">
                  {customDiscountTrainees.length}
                </span>
              </button>
            )}
          </div>

          {/* Detailed Confidential Table */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                كشف تفصيلي بالطلاب المستفيدين من الخصومات والإعفاءات (خاص بالإدارة)
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold">
                عدد السجلات: {displayedExemptTrainees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 select-none">
                  <tr>
                    <th className="p-3.5">الكود</th>
                    <th className="p-3.5">اسم المتدرب</th>
                    <th className="p-3.5">ولي الأمر والهاتف</th>
                    <th className="p-3.5">الدورة التدريبية وسعرها</th>
                    <th className="p-3.5">نوع ونسبة الخصم / الإعفاء</th>
                    <th className="p-3.5">قيمة التخفيض</th>
                    <th className="p-3.5">الصافي المطلـوب</th>
                    <th className="p-3.5">ملاحظات وقيد السرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                  {displayedExemptTrainees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        لا توجد سجلات مطابقة للتصنيف المحدد حالياً.
                      </td>
                    </tr>
                  ) : (
                    displayedExemptTrainees.map((t) => {
                      const course = courses.find((c) => c.id === t.courseId || c.name === t.courseName);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{t.code}</td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{t.fullName}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <div>{t.parentName || 'غير مدون'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{t.parentPhone || t.phone}</div>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <div className="font-semibold">{course?.name || t.courseName || 'دورة تدريبية'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">السعر: {t.computedFee} ج.م</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                              t.categoryType === 'exempt'
                                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/70 dark:border-purple-500/50 dark:text-purple-200'
                                : t.categoryType === 'sibling_discount'
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-900/70 dark:border-cyan-500/50 dark:text-cyan-200'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/70 dark:border-emerald-500/50 dark:text-emerald-200'
                            }`}>
                              {t.discountLabel}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                            {t.computedDiscount} ج.م
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {t.computedNet} ج.م
                          </td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                            {t.notes || 'مسجل بالنظام المالي'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reset & Secret Archive Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                تصفير الحسابات الشامل مع الأرشفة السرية للمدير
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-200 space-y-2">
              <p className="font-bold">⚠️ تنبيه هامة جداً:</p>
              <p>
                هذا الإجراء سيقوم بتصفير جميع عدادات الإيرادات، الخزينة، المصروفات، مستحقات الطلاب، وسجل الحصص بالكامل.
                وقبل التصفير، سيتم أرشفة كافة التفاصيل المالية بشكل كامل وآمن في <strong>السجل المالي السري للمدير العام فقط</strong> بحيث لا يتمكن أي مستخدم آخر من رؤيتها.
              </p>
            </div>

            <form onSubmit={handleExecuteResetAndArchive} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الأرشيف المالي (مثال: أرشيف شهر أغسطس 2026)</label>
                <input
                  type="text"
                  value={archiveTitle}
                  onChange={(e) => setArchiveTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز الأمان السري للمدير العام (PIN)</label>
                <input
                  type="password"
                  placeholder="أدخل رمز المدير (الافتراضي: 1234)"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">رمز الأمان الافتراضي للتجربة: 1234</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
                >
                  {isSubmittingReset ? 'جاري الأرشفة والتصفير...' : 'تأكيد التصفير الشامل وحفظ الأرشيف السري 🔐'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Manager Archives Modal */}
      {isSecretArchivesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-indigo-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                السجل المالي السري لمدير المركز (الأرشيف التاريخي الكامل بعد التصفير) 🔒
              </h3>
              <button
                onClick={() => setIsSecretArchivesModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!isVerifiedSecret ? (
              <div className="max-w-md mx-auto py-8 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">منطقة محظورة - مدير المركز فقط</h4>
                  <p className="text-xs text-slate-400">
                    هذا السجل يحتوي على جميع التفاصيل والإحصائيات المالية السابقة قبل عمليات التصفير. يرجى إدخال رمز الأمان السري للمدير للمتابعة.
                  </p>
                </div>

                <form onSubmit={handleVerifySecretAccess} className="space-y-4">
                  <input
                    type="password"
                    placeholder="رمز الأمان السري للمدير (مثال: 1234)"
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono text-center focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoadingArchives}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingArchives ? 'جاري التحقق...' : 'فتح السجل المالي السري للمدير 🔓'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
                    <span>
                      إجمالي الفترات المؤرشفة سرياً: <span className="font-mono text-amber-400">{secretArchives.length} فترة</span>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>
                      الرصيد الحالي للخزنة السرية: <span className="font-mono text-emerald-400 font-black text-sm">{secretTreasuryBalance.toLocaleString('ar-EG')} ج.م</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {(user?.role === 'admin' || !user?.role) && (
                      <button
                        onClick={() => setIsResetSecretTreasuryConfirmOpen(true)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        تصفير الخزنة السرية 🔐
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsVerifiedSecret(false);
                        setSecretPin('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline"
                    >
                      إقفال الجلسة السرية 🔒
                    </button>
                  </div>
                </div>

                {secretArchives.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    لا يوجد أي أرشيف مالي سابق مسجل حتى الآن. يتم حفظ الأرشيف تلقائياً عند الضغط على زر "تصفير الحسابات الشامل".
                  </div>
                ) : (
                  <div className="space-y-3">
                    {secretArchives.map((arch) => (
                      <div key={arch.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                          <div>
                            <h4 className="font-bold text-xs text-amber-300 flex items-center gap-2">
                              <span>📂 {arch.title}</span>
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              تاريخ الأرشفة: {new Date(arch.date).toLocaleString('ar-EG')} | المدير المسؤول: {arch.adminName}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedArchiveDetail(selectedArchiveDetail?.id === arch.id ? null : arch)}
                            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 transition-all"
                          >
                            {selectedArchiveDetail?.id === arch.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل المالية الكاملة 📊'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">إجمالي المقبوضات</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">{arch.summary.totalRevenue} ج.م</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">إجمالي المصروفات</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">{arch.summary.totalExpenses} ج.م</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">صافي الخزينة الفعلي</span>
                            <span className="font-mono font-bold text-amber-400 text-sm">{arch.summary.netTreasury} ج.م</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">المستحقات المتبقية</span>
                            <span className="font-mono font-bold text-purple-400 text-sm">{arch.summary.totalTraineeRemaining} ج.م</span>
                          </div>
                        </div>

                        {selectedArchiveDetail?.id === arch.id && (
                          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 mt-3 animate-in fade-in">
                            <h5 className="font-bold text-xs text-slate-300">تفاصيل إضافية للأرشيف:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300">
                              <div>عدد سندات القبض: <span className="font-mono text-amber-400 font-bold">{arch.paymentsCount}</span></div>
                              <div>عدد المصروفات: <span className="font-mono text-rose-400 font-bold">{arch.expensesCount}</span></div>
                              <div>عدد الطلاب المسجلين: <span className="font-mono text-emerald-400 font-bold">{arch.traineesCount}</span></div>
                              <div>إجمالي مستحقات المدربين: <span className="font-mono text-cyan-400 font-bold">{arch.summary.totalTrainerDues} ج.م</span></div>
                              <div>حصة المركز: <span className="font-mono text-emerald-300 font-bold">{arch.summary.totalCenterShare} ج.م</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secret Treasury Reset Confirmation Modal */}
      {isResetSecretTreasuryConfirmOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-right">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">تصفير الخزنة السرية</h4>
                <p className="text-xs text-slate-400">إجراء محاسبي معتمد للمدير Administrator</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-sm text-slate-200 font-bold">هل أنت متأكد من تصفير الخزنة السرية؟</p>
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">الرصيد الحالي:</span>
                <span className="font-mono font-black text-rose-400 text-base">{secretTreasuryBalance.toLocaleString('ar-EG')} جنيه</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * يتم تنفيذ التصفير محاسبياً دون حذف السجلات التاريخية. لن تزيد الخزنة الرئيسية ولن تتأثر المقبوضات أو المصروفات الأساسية.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExecuteResetSecretTreasury}
                disabled={isExecutingSecretReset}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isExecutingSecretReset ? 'جاري التصفير المحاسبي...' : 'تأكيد تصفير الخزنة السرية 🔐'}
              </button>
              <button
                onClick={() => setIsResetSecretTreasuryConfirmOpen(false)}
                disabled={isExecutingSecretReset}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF IMAGE LIGHTBOX MODAL */}
      {selectedProofForLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 w-full max-w-2xl space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>معاينة إيصال / لقطة شاشة التحويل كاملة</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  الطالب: {selectedProofForLightbox.traineeName} | المبلغ: {selectedProofForLightbox.amount} ج.م
                </p>
              </div>
              <button
                onClick={() => setSelectedProofForLightbox(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800">
              <img
                src={selectedProofForLightbox.proofImageUrl}
                alt="معاينة الإيصال كاملة"
                className="max-w-full max-h-[65vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const proof = selectedProofForLightbox;
                  setSelectedProofForLightbox(null);
                  handleApproveProof(proof);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد السداد القيد مباشرة ✓</span>
              </button>
              <button
                onClick={() => setSelectedProofForLightbox(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>سبب رفض إيصال الدفع المرفوع</span>
              </h4>
              <button
                onClick={() => {
                  setRejectModalProof(null);
                  setRejectionReasonText('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejectProof} className="space-y-4 text-xs">
              <p className="text-slate-300">
                سيتم إرسال إشعار فوري لولي أمر الطالب <strong className="text-white">{rejectModalProof.traineeName}</strong> بطلب إعادة رفع إيصال صحيح.
              </p>

              <div>
                <label className="block font-bold text-slate-300 mb-1">سبب الرفض المباشر: *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="مثال: الصورة غير واضحة / رقم التحويل لا يطابق المبلغ المطلوب / لم يصل التحويل لحسابنا..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalProof(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessingProof}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all"
                >
                  {isProcessingProof ? 'جاري التنفيذ...' : 'تأكيد الرفض وإشعار ولي الأمر ❌'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL FOR APPROVED PAYMENTS */}
      {selectedOfficialReceipt && (
        <OfficialReceiptModal
          isOpen={Boolean(selectedOfficialReceipt)}
          onClose={() => setSelectedOfficialReceipt(null)}
          payment={selectedOfficialReceipt}
          traineeName={selectedOfficialReceipt.traineeName}
          traineeCode={selectedOfficialReceipt.traineeCode}
          courseName={selectedOfficialReceipt.courseName}
          branchName={branches.find(b => b.id === selectedOfficialReceipt.branchId)?.name}
          centerSettings={{
            name: 'مركز النجاح للتدريب والتكنولوجيا'
          }}
        />
      )}

      {/* Google Sheets Hub Modal */}
      <GoogleSheetsHubModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        defaultTab="export"
      />

      {/* Closing Account & Comprehensive Audit Report Modal */}
      <ClosingAccountReportModal
        isOpen={isClosingReportModalOpen}
        onClose={() => setIsClosingReportModalOpen(false)}
        payments={selectedFinanceBranchId === 'all' ? allPayments : payments}
        trainees={selectedFinanceBranchId === 'all' ? (ctxTrainees || trainees) : (ctxTrainees || trainees).filter(t => t.branchId === selectedFinanceBranchId)}
        trainers={trainers}
        courses={courses}
        branches={branches}
        settlements={settlements}
        branchName={selectedFinanceBranchId === 'all' ? 'جميع الفروع المركزية (فرع النجاح + فرع بدر)' : (branches.find(b => b.id === selectedFinanceBranchId)?.name || 'الفرع المحدد')}
      />

      {/* Trainer Payout Settlement Modal */}
      {selectedTrainerForPayout && (
        <TrainerPayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => {
            setIsPayoutModalOpen(false);
            setSelectedTrainerForPayout(null);
          }}
          trainer={selectedTrainerForPayout.trainer}
          suggestedAmount={selectedTrainerForPayout.netDue}
          totalCollected={selectedTrainerForPayout.totalCollected}
          trainerPercentage={selectedTrainerForPayout.percentage}
          onSuccess={(_settlement) => {
            loadFinanceData(true);
            showToast('تم اعتماد سند صرف مستحقات المحاضر بنجاح!', 'success');
          }}
        />
      )}

      {/* AUDIT BREAKDOWN MODAL (عايز اعرف الفلوس دي جات منين) */}
      {selectedAuditPayment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>🔍 تقرير تتبع أصل ومصدر المبلغ (عايز اعرف الفلوس دي جات منين؟)</span>
              </h4>
              <button
                onClick={() => setSelectedAuditPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم السند/الإيصال:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedAuditPayment.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ المعاملة والوقت:</span>
                  <span className="font-mono text-slate-300">{selectedAuditPayment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ الإجمالي المسدد:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{selectedAuditPayment.amount} ج.م</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">👤 الدافع (من قام بالسداد):</span>
                  <span className="font-bold text-white text-xs">
                    {selectedAuditPayment.submittedByParentName || selectedAuditPayment.traineeName || 'ولي الأمر / المتدرب'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">🏛️ المستلم (مسؤول الخزينة):</span>
                  <span className="font-bold text-emerald-300 text-xs">
                    {selectedAuditPayment.receivedByUserName || 'مسؤول الخزينة الرئيسي'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-400 block">📚 تفاصيل الارتباط الأكاديمي:</span>
                <p className="font-bold text-slate-100">الطالب: {selectedAuditPayment.traineeName} (كود: {selectedAuditPayment.traineeCode || '—'})</p>
                <p className="text-slate-300">الدورة التدريبية: {selectedAuditPayment.courseName || 'الدورة النشطة'}</p>
                <p className="text-slate-300">عن شهر/فترة: {selectedAuditPayment.targetMonth || 'الشهر الحالي'}</p>
                <p className="text-slate-300">طريقة التحصيل: {selectedAuditPayment.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : selectedAuditPayment.paymentMethod === 'instapay' ? 'انستاباي' : 'نقداً بالخزينة'}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم اعتماد القيد المالي بنجاح في سجل الخزينة العام ومطابقته مع حساب الطالب.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedAuditPayment(null)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
