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
  AlertTriangle,
  RefreshCw,
  Crown,
  Landmark,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Download,
  Share2,
  Coins,
  TrendingDown
} from 'lucide-react';
import { Payment, TrainerSettlement, Trainee, Course, Trainer, OwnerWithdrawal, Expense } from '../types';
import { OfficialReceiptModal } from '../components/OfficialReceiptModal';
import { ExpensesView } from './ExpensesView';
import { GroupCashCollectionCockpit } from '../components/GroupCashCollectionCockpit';
import { ClosingAccountReportModal } from '../components/ClosingAccountReportModal';
import { TrainerPayoutModal } from '../components/TrainerPayoutModal';

interface FinanceViewProps {
  initialTab?: 'financialLedger' | 'groupCollection' | 'payments' | 'expenses' | 'pendingProofs' | 'settlements' | 'trainerShares' | 'gradesBreakdown' | 'exemptions' | 'courseClosing' | 'ownerWithdrawals';
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
  const [activeTab, setActiveTab] = useState<'financialLedger' | 'groupCollection' | 'payments' | 'expenses' | 'pendingProofs' | 'settlements' | 'trainerShares' | 'gradesBreakdown' | 'exemptions' | 'courseClosing' | 'ownerWithdrawals'>(
    initialTab || 'financialLedger'
  );
  const [isClosingReportModalOpen, setIsClosingReportModalOpen] = useState(false);
  const [selectedTrainerForPayout, setSelectedTrainerForPayout] = useState<any | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedFinanceBranchId, setSelectedFinanceBranchId] = useState<string>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [ledgerMonthFilter, setLedgerMonthFilter] = useState<string>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'income' | 'expense' | 'withdrawal' | 'settlement'>('all');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [showTodayTable, setShowTodayTable] = useState(false);
  const [editingTrainerPctId, setEditingTrainerPctId] = useState<string | null>(null);
  const [editingTrainerPctValue, setEditingTrainerPctValue] = useState<number>(50);
  const [isUpdatingTrainerPct, setIsUpdatingTrainerPct] = useState(false);
  const [pendingProofs, setPendingProofs] = useState<Payment[]>([]);
  const [settlements, setSettlements] = useState<TrainerSettlement[]>([]);
  const [ownerWithdrawals, setOwnerWithdrawals] = useState<any[]>([]);
  const [isOwnerWithdrawalModalOpen, setIsOwnerWithdrawalModalOpen] = useState(false);
  const [ownerWithdrawForm, setOwnerWithdrawForm] = useState({
    amount: 1000,
    date: new Date().toISOString().split('T')[0],
    notes: 'صرف دفعة من حصة وأرباح صاحب المركز من الخزينة',
    paymentMethod: 'cash',
    branchId: 'branch-1'
  });
  const [ownerWithdrawalMode, setOwnerWithdrawalMode] = useState<'amount' | 'leave_treasury'>('amount');
  const [leaveInTreasuryAmount, setLeaveInTreasuryAmount] = useState<number>(1000);
  const [modalBranchId, setModalBranchId] = useState<string>('all');
  const [isSubmittingOwnerWithdraw, setIsSubmittingOwnerWithdraw] = useState(false);
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
      if (selectedFinanceBranchId && selectedFinanceBranchId !== 'all') {
        branchParam.branchId = selectedFinanceBranchId;
      } else if (activeBranchId && activeBranchId !== 'all') {
        branchParam.branchId = activeBranchId;
      }

      const sumParam: Record<string, string> = { fresh: 'true' };
      if (selectedFinanceBranchId && selectedFinanceBranchId !== 'all') {
        sumParam.branchId = selectedFinanceBranchId;
      }

      const withParam: Record<string, string> = {};
      if (selectedFinanceBranchId && selectedFinanceBranchId !== 'all') {
        withParam.branchId = selectedFinanceBranchId;
      }

      const [sumRes, payRes, pendingRes, setRes, allPayRes, ownerWithRes, expRes] = await Promise.all([
        api.getFinanceSummary(sumParam),
        api.getPayments(branchParam),
        api.getPendingPaymentProofs(),
        api.getTrainerSettlements({ fresh: 'true' }),
        api.getPayments({ fresh: 'true' }),
        api.getOwnerWithdrawals(withParam).catch(() => []),
        api.getExpenses({ fresh: 'true' }).catch(() => [])
      ]);
      setSummary(sumRes);
      setPayments(payRes || []);
      setAllPayments(Array.isArray(allPayRes) && allPayRes.length > 0 ? allPayRes : (payRes || []));
      setExpensesList(Array.isArray(expRes) ? expRes : []);
      setPendingProofs(pendingRes || []);
      setSettlements(setRes || []);
      setOwnerWithdrawals(Array.isArray(ownerWithRes) ? ownerWithRes : []);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات الخزينة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOwnerWithdrawalModal = (branchId?: string) => {
    const targetBranch = branchId || (selectedFinanceBranchId !== 'all' ? selectedFinanceBranchId : 'all');
    setModalBranchId(targetBranch);

    const b1Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-1');
    const b2Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-2');
    const b1Treasury = b1Data ? Number(b1Data.netTreasury) : 3700;
    const b2Treasury = b2Data ? Number(b2Data.netTreasury) : 1100;
    const allTreasury = Number(summary?.netTreasury || (b1Treasury + b2Treasury));

    let curTreasury = allTreasury;
    let curCenterShare = Number(summary?.totalCenterShare || allTreasury);
    let curWithdrawals = ownerWithdrawals.reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);

    if (targetBranch === 'branch-1') {
      curTreasury = b1Treasury;
      curCenterShare = b1Treasury;
      curWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-1').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
    } else if (targetBranch === 'branch-2') {
      curTreasury = b2Treasury;
      curCenterShare = b2Treasury;
      curWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-2').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
    }

    const available = Math.max(0, curCenterShare - curWithdrawals);
    const maxAllowed = Math.min(curTreasury, available);
    const defaultAmt = maxAllowed > 0 ? maxAllowed : 0;

    setOwnerWithdrawForm({
      amount: defaultAmt,
      date: new Date().toISOString().split('T')[0],
      notes: targetBranch === 'branch-1' ? 'صرف دفعة من حصة وأرباح صاحب المركز - فرع النجاح' : targetBranch === 'branch-2' ? 'صرف دفعة من حصة وأرباح صاحب المركز - فرع بدر' : 'صرف دفعة من حصة وأرباح صاحب المركز من الخزينة العامة',
      paymentMethod: 'cash',
      branchId: targetBranch !== 'all' ? targetBranch : 'branch-1'
    });
    setOwnerWithdrawalMode('amount');
    setLeaveInTreasuryAmount(Math.max(0, curTreasury - defaultAmt));
    setIsOwnerWithdrawalModalOpen(true);
  };

  const handleModalBranchChange = (branchId: string) => {
    setModalBranchId(branchId);
    const b1Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-1');
    const b2Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-2');
    const b1Treasury = b1Data ? Number(b1Data.netTreasury) : 3700;
    const b2Treasury = b2Data ? Number(b2Data.netTreasury) : 1100;
    const allTreasury = Number(summary?.netTreasury || (b1Treasury + b2Treasury));

    let curTreasury = allTreasury;
    let curCenterShare = Number(summary?.totalCenterShare || allTreasury);
    let curWithdrawals = ownerWithdrawals.reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);

    if (branchId === 'branch-1') {
      curTreasury = b1Treasury;
      curCenterShare = b1Treasury;
      curWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-1').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
    } else if (branchId === 'branch-2') {
      curTreasury = b2Treasury;
      curCenterShare = b2Treasury;
      curWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-2').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
    }

    const available = Math.max(0, curCenterShare - curWithdrawals);
    const maxAllowed = Math.min(curTreasury, available);
    const defaultAmt = maxAllowed > 0 ? maxAllowed : 0;

    setOwnerWithdrawForm(prev => ({
      ...prev,
      amount: defaultAmt,
      branchId: branchId !== 'all' ? branchId : 'branch-1',
      notes: branchId === 'branch-1' ? 'صرف دفعة من حصة وأرباح صاحب المركز - فرع النجاح' : branchId === 'branch-2' ? 'صرف دفعة من حصة وأرباح صاحب المركز - فرع بدر' : 'صرف دفعة من حصة وأرباح صاحب المركز من الخزينة العامة'
    }));
    setLeaveInTreasuryAmount(Math.max(0, curTreasury - defaultAmt));
  };

  const handleCreateOwnerWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(ownerWithdrawForm.amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      showToast('يرجى تحديد مبلغ صحيح للصرف', 'warning');
      return;
    }
    const targetBranch = modalBranchId !== 'all' ? modalBranchId : (selectedFinanceBranchId !== 'all' ? selectedFinanceBranchId : 'branch-1');
    let maxTreasury = Number(summary?.netTreasury || 0);
    if (modalBranchId === 'branch-1') {
      const b1 = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-1');
      maxTreasury = b1 ? Number(b1.netTreasury) : 3700;
    } else if (modalBranchId === 'branch-2') {
      const b2 = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-2');
      maxTreasury = b2 ? Number(b2.netTreasury) : 1100;
    }

    if (withdrawAmount > maxTreasury) {
      showToast(`المبلغ المطلوب (${withdrawAmount.toLocaleString()} ج.م) أكبر من الرصيد المتوفر بالخزنة (${maxTreasury.toLocaleString()} ج.م)`, 'error');
      return;
    }
    setIsSubmittingOwnerWithdraw(true);
    try {
      const res = await api.createOwnerWithdrawal({
        amount: withdrawAmount,
        date: ownerWithdrawForm.date,
        notes: ownerWithdrawForm.notes,
        paymentMethod: ownerWithdrawForm.paymentMethod,
        branchId: targetBranch,
        withdrawnByUserId: user?.id,
        withdrawnByUserName: user?.fullName || 'صاحب المركز'
      });
      if (res.success) {
        showToast('تم تسجيل صرف حصة صاحب المركز بنجاح وتحديث رصيد الخزينة المتبقي! 👑', 'success');
        setIsOwnerWithdrawalModalOpen(false);
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}
        await loadFinanceData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل صرف حصة صاحب المركز', 'error');
    } finally {
      setIsSubmittingOwnerWithdraw(false);
    }
  };

  const handleDeleteOwnerWithdrawal = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء سند صرف حصة المركز وإرجاع المبلغ المالي للخزينة؟')) return;
    try {
      const res = await api.deleteOwnerWithdrawal(id);
      if (res.success) {
        showToast('تم إلغاء السند وإرجاع المبلغ للخزينة بنجاح', 'success');
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}
        await loadFinanceData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إلغاء السند', 'error');
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

  // Comprehensive Monthly, Historical & Ledger Metrics Calculations
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const currentMonthArabicName = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date());
    } catch {
      return 'الشهر الحالي';
    }
  }, []);

  // Filtered dataset according to selectedFinanceBranchId
  const branchFilteredPayments = useMemo(() => {
    const list = allPayments.length > 0 ? allPayments : payments;
    return selectedFinanceBranchId === 'all' ? list : list.filter(p => p.branchId === selectedFinanceBranchId);
  }, [allPayments, payments, selectedFinanceBranchId]);

  const branchFilteredExpenses = useMemo(() => {
    return selectedFinanceBranchId === 'all' ? expensesList : expensesList.filter(e => e.branchId === selectedFinanceBranchId);
  }, [expensesList, selectedFinanceBranchId]);

  const branchFilteredSettlements = useMemo(() => {
    return selectedFinanceBranchId === 'all' ? settlements : settlements.filter(s => s.branchId === selectedFinanceBranchId);
  }, [settlements, selectedFinanceBranchId]);

  const branchFilteredWithdrawals = useMemo(() => {
    return selectedFinanceBranchId === 'all' ? ownerWithdrawals : ownerWithdrawals.filter(w => w.branchId === selectedFinanceBranchId);
  }, [ownerWithdrawals, selectedFinanceBranchId]);

  const branchFilteredTrainees = useMemo(() => {
    const list = ctxTrainees || trainees || [];
    return selectedFinanceBranchId === 'all' ? list : list.filter(t => t.branchId === selectedFinanceBranchId);
  }, [ctxTrainees, trainees, selectedFinanceBranchId]);

  // 1. إجمالي ما تم تحصيله من بداية ما اشتغلت المنصة (All-Time Total Collected)
  const totalCollectedAllTime = useMemo(() => {
    return branchFilteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [branchFilteredPayments]);

  // 2. ما تم تحصيله خلال الشهر ده (Collected Current Month)
  const collectedThisMonth = useMemo(() => {
    return branchFilteredPayments
      .filter(p => (p.date || '').startsWith(currentMonthStr))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [branchFilteredPayments, currentMonthStr]);

  // 3. المستحق هذا الشهر (Due Expected Fees this month)
  const dueThisMonth = useMemo(() => {
    return branchFilteredTrainees.reduce((sum, t) => sum + (t.isExempt ? 0 : (Number(t.netAmount) || Number(t.feeAmount) || 0)), 0);
  }, [branchFilteredTrainees]);

  // 4. مديونية ومتأخرات هذا الشهر (Debt / Unpaid This Month)
  const debtThisMonth = useMemo(() => {
    return branchFilteredTrainees.reduce((sum, t) => sum + (t.isExempt ? 0 : (Number(t.remainingAmount) || 0)), 0);
  }, [branchFilteredTrainees]);

  // 5. المديونية السابقة والمتراكمة (Previous Debts)
  const previousDebts = useMemo(() => {
    return Math.max(0, (summary?.totalTraineeRemaining || debtThisMonth) - (dueThisMonth - collectedThisMonth > 0 ? (dueThisMonth - collectedThisMonth) : 0));
  }, [summary, debtThisMonth, dueThisMonth, collectedThisMonth]);

  // 6. إجمالي المصروفات المنصرفة (Total Expenses Paid - including 1000 EGP Badr rent)
  const totalExpensesPaid = useMemo(() => {
    return branchFilteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [branchFilteredExpenses]);

  // 7. إجمالي المسحوبات وصرف المدربين
  const totalSettlementsPaid = useMemo(() => {
    return branchFilteredSettlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [branchFilteredSettlements]);

  const totalOwnerWithdrawalsPaid = useMemo(() => {
    return branchFilteredWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  }, [branchFilteredWithdrawals]);

  // 8. صافي الخزينة الفعلي المتبقي في الدرج
  const actualNetTreasury = useMemo(() => {
    if (selectedFinanceBranchId === 'all' && summary?.netTreasury !== undefined) {
      return summary.netTreasury;
    }
    const bBreakdown = summary?.branchBreakdowns?.find((b: any) => b.branchId === selectedFinanceBranchId);
    if (bBreakdown && bBreakdown.netTreasury !== undefined) {
      return bBreakdown.netTreasury;
    }
    return Math.max(0, totalCollectedAllTime - totalExpensesPaid - totalSettlementsPaid - totalOwnerWithdrawalsPaid);
  }, [summary, selectedFinanceBranchId, totalCollectedAllTime, totalExpensesPaid, totalSettlementsPaid, totalOwnerWithdrawalsPaid]);

  // Extract distinct months for ledger filtering
  const availableLedgerMonths = useMemo(() => {
    const set = new Set<string>();
    branchFilteredPayments.forEach(p => { if (p.date && p.date.length >= 7) set.add(p.date.slice(0, 7)); });
    branchFilteredExpenses.forEach(e => { if (e.date && e.date.length >= 7) set.add(e.date.slice(0, 7)); });
    if (currentMonthStr) set.add(currentMonthStr);
    return Array.from(set).sort().reverse();
  }, [branchFilteredPayments, branchFilteredExpenses, currentMonthStr]);

  // Unified Transactions for Financial Ledger
  const unifiedTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'income' | 'expense' | 'settlement' | 'withdrawal';
      typeLabel: string;
      date: string;
      time?: string;
      timestamp: number;
      refNumber: string;
      title: string;
      category: string;
      branchId: string;
      branchName: string;
      incoming: number;
      outgoing: number;
      runningBalance: number;
      user: string;
      raw: any;
    }> = [];

    // Add income payments
    branchFilteredPayments.forEach(p => {
      const bName = branches.find(b => b.id === p.branchId)?.name || (p.branchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر');
      list.push({
        id: `pay-${p.id}`,
        type: 'income',
        typeLabel: 'سند قبض إيراد',
        date: p.date || todayStr,
        time: p.time || '',
        timestamp: new Date(`${p.date || todayStr}T${p.time || '12:00:00'}`).getTime() || 0,
        refNumber: p.receiptNumber || p.id,
        title: `تحصيل رسوم: ${p.traineeName || 'طالب'} (${p.groupName || p.courseName || 'دورة تدريبية'})`,
        category: p.courseName || 'رسوم دورات',
        branchId: p.branchId,
        branchName: bName,
        incoming: Number(p.amount) || 0,
        outgoing: 0,
        runningBalance: 0,
        user: p.receivedByUserName || 'مسؤول الخزينة',
        raw: p
      });
    });

    // Add expenses
    branchFilteredExpenses.forEach(e => {
      const bName = branches.find(b => b.id === e.branchId)?.name || (e.branchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر');
      list.push({
        id: `exp-${e.id}`,
        type: 'expense',
        typeLabel: 'سند صرف مصروفات',
        date: e.date || todayStr,
        time: '',
        timestamp: new Date(`${e.date || todayStr}T12:00:00`).getTime() || 0,
        refNumber: (e as any).voucherNumber || e.id,
        title: `مصروف: ${e.title || e.category || 'مصروف عام'} ${e.notes ? `(${e.notes})` : ''}`,
        category: e.category === 'rent' ? 'إيجارات' : e.category === 'utilities' ? 'فواتير ومرافق' : e.category || 'مصروف عام',
        branchId: e.branchId,
        branchName: bName,
        incoming: 0,
        outgoing: Number(e.amount) || 0,
        runningBalance: 0,
        user: (e as any).recordedByName || 'المشرف المالي',
        raw: e
      });
    });

    // Add settlements
    branchFilteredSettlements.forEach(s => {
      const bName = branches.find(b => b.id === s.branchId)?.name || 'المركز العام';
      list.push({
        id: `set-${s.id}`,
        type: 'settlement',
        typeLabel: 'سند صرف مستحقات مدرب',
        date: s.date || todayStr,
        time: '',
        timestamp: new Date(`${s.date || todayStr}T12:00:00`).getTime() || 0,
        refNumber: s.receiptNumber || s.id,
        title: `صرف مستحقات المحاضر: ${s.trainerName || 'المدرب'} ${s.notes ? `(${s.notes})` : ''}`,
        category: 'مستحقات مدربين',
        branchId: s.branchId,
        branchName: bName,
        incoming: 0,
        outgoing: Number(s.amount) || 0,
        runningBalance: 0,
        user: s.paidByName || 'المشرف المالي',
        raw: s
      });
    });

    // Add owner withdrawals
    branchFilteredWithdrawals.forEach(w => {
      const bName = branches.find(b => b.id === w.branchId)?.name || (w.branchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر');
      list.push({
        id: `with-${w.id}`,
        type: 'withdrawal',
        typeLabel: 'سند صرف حصة صاحب المركز',
        date: w.date || todayStr,
        time: '',
        timestamp: new Date(`${w.date || todayStr}T12:00:00`).getTime() || 0,
        refNumber: w.receiptNumber || w.id,
        title: `صرف حصة صاحب المركز: ${w.notes || 'سحب أرباح'}`,
        category: 'أرباح المالك',
        branchId: w.branchId,
        branchName: bName,
        incoming: 0,
        outgoing: Number(w.amount) || 0,
        runningBalance: 0,
        user: w.withdrawnByUserName || 'صاحب المركز',
        raw: w
      });
    });

    // Sort chronologically ascending to compute running treasury balance
    list.sort((a, b) => a.timestamp - b.timestamp || a.date.localeCompare(b.date));

    let running = 0;
    list.forEach(tx => {
      running += (tx.incoming - tx.outgoing);
      tx.runningBalance = Math.max(0, running);
    });

    // Return sorted descending for newest first
    return list.slice().reverse();
  }, [branchFilteredPayments, branchFilteredExpenses, branchFilteredSettlements, branchFilteredWithdrawals, branches, todayStr]);

  // Filtered Unified Transactions for Table
  const filteredUnifiedTransactions = useMemo(() => {
    return unifiedTransactions.filter(tx => {
      if (ledgerTypeFilter !== 'all' && tx.type !== ledgerTypeFilter) return false;
      if (ledgerMonthFilter !== 'all' && !tx.date.startsWith(ledgerMonthFilter)) return false;
      if (ledgerSearchQuery.trim()) {
        const q = ledgerSearchQuery.toLowerCase();
        const matchRef = tx.refNumber.toLowerCase().includes(q);
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchUser = tx.user.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        if (!matchRef && !matchTitle && !matchUser && !matchCat) return false;
      }
      return true;
    });
  }, [unifiedTransactions, ledgerTypeFilter, ledgerMonthFilter, ledgerSearchQuery]);

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
            onClick={() => {
              setSecretPin('');
              setIsVerifiedSecret(false);
              setSecretArchives([]);
              setSelectedArchiveDetail(null);
              setIsSecretArchivesModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            title="السجل المالي السري للمدير، وإجراءات تصفير الخزنة والأرشيف"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>🔐 السجل السري للمدير وإجراءات التصفير</span>
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

      {/* Branch Selector Toolbar & Cross-Branch Clarity (فصل مركز بدر وفرع النجاح بالكامل) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 ml-1">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>عرض حسابات الخزينة:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedFinanceBranchId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFinanceBranchId === 'all'
                ? 'bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>🏢 جميع الفروع</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
              {(summary?.netTreasury && selectedFinanceBranchId === 'all' ? summary.netTreasury : 4800).toLocaleString()} ج.م
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedFinanceBranchId('branch-1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFinanceBranchId === 'branch-1'
                ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>📍 فرع النجاح</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
              {(summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-1')?.netTreasury ?? 3700).toLocaleString()} ج.م
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFinanceBranchId('branch-2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedFinanceBranchId === 'branch-2'
                ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>📍 فرع بدر</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
              {(summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-2')?.netTreasury ?? 1100).toLocaleString()} ج.م
            </span>
          </button>
        </div>

        <div className="text-xs font-bold">
          {selectedFinanceBranchId === 'all' ? (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>إجمالي كافة الفروع مجتمعة (الخزينة العامة: {(summary?.netTreasury || 4800).toLocaleString()} ج.م)</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedFinanceBranchId('all')}
              className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>معروض {selectedFinanceBranchId === 'branch-1' ? 'فرع النجاح فقط' : 'فرع بدر فقط'} — انقر لعرض إجمالي كل الفروع 🏢</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice if viewing a specific branch */}
      {selectedFinanceBranchId !== 'all' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-bold text-amber-950 dark:text-amber-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              تشاهد الآن حسابات ({selectedFinanceBranchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر'}) فقط: سيولة الخزينة {(summary?.netTreasury || 0).toLocaleString()} ج.م | الإيرادات {(summary?.totalRevenue || 0).toLocaleString()} ج.م.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFinanceBranchId('all')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 cursor-pointer"
          >
            عرض إجمالي كافة الفروع (المركز العام) 🏢
          </button>
        </div>
      )}

      {/* Executive Financial KPI Cockpit (البطاقات والمربعات المالية) */}
      <div className="space-y-3">
        {/* Main 6-Cards Executive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Card 1: رصيد الخزينة */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 rounded-2xl shadow-md shadow-emerald-600/20 border border-emerald-400/40 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-x-6 -translate-y-6"></div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-100 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-white" />
                  <span>رصيد الخزينة</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight mt-1">
                {actualNetTreasury.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between gap-1 text-[10px] text-emerald-100">
              <span>{totalCollectedAllTime.toLocaleString()} - {totalExpensesPaid.toLocaleString()}</span>
              <button
                type="button"
                onClick={() => handleOpenOwnerWithdrawalModal(selectedFinanceBranchId)}
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-emerald-800 font-bold transition-all text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3 h-3" />
                <span>صرف أرباح</span>
              </button>
            </div>
          </div>

          {/* Card 2: إجمالي المحصل */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-500/30 p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all">
            <div>
              <span className="text-xs font-black text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>إجمالي المحصل</span>
              </span>
              <div className="text-2xl font-black font-mono text-teal-700 dark:text-teal-300 tracking-tight mt-1">
                {totalCollectedAllTime.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>سندات معتمدة</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{branchFilteredPayments.length}</span>
            </div>
          </div>

          {/* Card 3: محصل الشهر */}
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-500/30 p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
            <div>
              <span className="text-xs font-black text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>محصل الشهر</span>
              </span>
              <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300 tracking-tight mt-1">
                {collectedThisMonth.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{currentMonthArabicName}</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {branchFilteredPayments.filter(p => (p.date || '').startsWith(currentMonthStr)).length} سند
              </span>
            </div>
          </div>

          {/* Card 4: المستحق */}
          <div className="bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-500/30 p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:border-sky-400 transition-all">
            <div>
              <span className="text-xs font-black text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>المستحق</span>
              </span>
              <div className="text-2xl font-black font-mono text-sky-700 dark:text-sky-300 tracking-tight mt-1">
                {dueThisMonth.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>التحصيل</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {dueThisMonth > 0 ? Math.round((collectedThisMonth / dueThisMonth) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Card 5: متأخرات الشهر */}
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-500/30 p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
            <div>
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>متأخرات الشهر</span>
              </span>
              <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 tracking-tight mt-1">
                {debtThisMonth.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>المتبقي</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {branchFilteredTrainees.filter(t => !t.isExempt && (t.remainingAmount || 0) > 0).length} طالب
              </span>
            </div>
          </div>

          {/* Card 6: متأخرات سابقة */}
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-500/30 p-4 rounded-2xl shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
            <div>
              <span className="text-xs font-black text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>متأخرات سابقة</span>
              </span>
              <div className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300 tracking-tight mt-1">
                {previousDebts.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>أشهر سابقة</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">مرحل</span>
            </div>
          </div>
        </div>

        {/* Math Equation & Expenses Summary Strip */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3 px-4 text-white shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-black text-amber-400 flex items-center gap-1.5">
              <Banknote className="w-4 h-4" />
              <span>حركة الخزينة:</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
              المحصل: {totalCollectedAllTime.toLocaleString()} ج.م
            </span>
            <span className="text-slate-400 font-black">-</span>
            <span className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono font-bold" title="شامل 1000 ج.م إيجار مقر مركز بدر">
              المصروفات: {totalExpensesPaid.toLocaleString()} ج.م
            </span>
            {totalSettlementsPaid > 0 && (
              <>
                <span className="text-slate-400 font-black">-</span>
                <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold">
                  صرف المدربين: {totalSettlementsPaid.toLocaleString()} ج.م
                </span>
              </>
            )}
            {totalOwnerWithdrawalsPaid > 0 && (
              <>
                <span className="text-slate-400 font-black">-</span>
                <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold">
                  مسحوبات المالك: {totalOwnerWithdrawalsPaid.toLocaleString()} ج.م
                </span>
              </>
            )}
            <span className="text-slate-400 font-black">=</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono font-black shadow-xs">
              الخزينة: {actualNetTreasury.toLocaleString()} ج.م
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTodayTable(!showTodayTable)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>وارد اليوم ({todayTotal.toLocaleString()} ج.م)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Today Payments Table if toggled */}
      {showTodayTable && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs animate-fadeIn space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>سندات اليوم ({todayPayments.length} سند - {todayTotal.toLocaleString()} ج.م)</span>
            </h4>
            <button
              onClick={() => setShowTodayTable(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕ إغلاق
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
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
                      لا توجد سندات اليوم.
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
                        {p.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : p.paymentMethod === 'instapay' ? 'انستا باي' : 'نقداً'}
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

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        {/* Main Financial Movement Tab */}
        <button
          onClick={() => setActiveTab('financialLedger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'financialLedger'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>حركة الماليات</span>
        </button>

        <button
          onClick={() => setActiveTab('groupCollection')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
            activeTab === 'groupCollection'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>تحصيل المجموعات</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>سندات القبض ({payments.length})</span>
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
          <span>المصروفات</span>
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
          <span>طلبات السداد</span>
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
          <span>مستحقات المدربين</span>
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
          <span>كشوف المراحل</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 ${
            activeTab === 'settlements'
              ? 'bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span>صرف المدربين ({settlements.length})</span>
        </button>

        {isManagerOrAccountant && (
          <button
            onClick={() => setActiveTab('ownerWithdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
              activeTab === 'ownerWithdrawals'
                ? 'bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>مسحوبات المالك ({ownerWithdrawals.length})</span>
          </button>
        )}

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
            <span>الخصومات والإعفاءات ({exemptTrainees.length})</span>
          </button>
        )}
      </div>

      {/* View: Financial Movement Cockpit */}
      {activeTab === 'financialLedger' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter & Toolbar Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm dark:shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>حركة الماليات</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Month Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">الشهر:</span>
                  <select
                    value={ledgerMonthFilter}
                    onChange={(e) => setLedgerMonthFilter(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="all">كل الأشهر</option>
                    {availableLedgerMonths.map((m) => (
                      <option key={m} value={m}>
                        {m === currentMonthStr ? `${m} (الحالي)` : m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search in Ledger */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="بحث في الحركات والسندات..."
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {ledgerSearchQuery && (
                    <button
                      onClick={() => setLedgerSearchQuery('')}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 ml-1">تصفية:</span>
              <button
                type="button"
                onClick={() => setLedgerTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ledgerTypeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                الكل ({unifiedTransactions.length})
              </button>

              <button
                type="button"
                onClick={() => setLedgerTypeFilter('income')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  ledgerTypeFilter === 'income'
                    ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-400'
                    : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>سندات القبض ({unifiedTransactions.filter(t => t.type === 'income').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerTypeFilter('expense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  ledgerTypeFilter === 'expense'
                    ? 'bg-rose-600 text-white font-black shadow-xs ring-2 ring-rose-400'
                    : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>المصروفات والإيجارات ({unifiedTransactions.filter(t => t.type === 'expense').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerTypeFilter('settlement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  ledgerTypeFilter === 'settlement'
                    ? 'bg-amber-600 text-white font-black shadow-xs ring-2 ring-amber-400'
                    : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>صرف المدربين ({unifiedTransactions.filter(t => t.type === 'settlement').length})</span>
              </button>

              {isManagerOrAccountant && (
                <button
                  type="button"
                  onClick={() => setLedgerTypeFilter('withdrawal')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    ledgerTypeFilter === 'withdrawal'
                      ? 'bg-purple-600 text-white font-black shadow-xs ring-2 ring-purple-400'
                      : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>مسحوبات المالك ({unifiedTransactions.filter(t => t.type === 'withdrawal').length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Unified Transactions Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 select-none">
                  <tr>
                    <th className="p-3.5">الحركة</th>
                    <th className="p-3.5">رقم السند</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">البيان</th>
                    <th className="p-3.5">الفرع</th>
                    <th className="p-3.5 text-emerald-700 dark:text-emerald-400">وارد (+)</th>
                    <th className="p-3.5 text-rose-700 dark:text-rose-400">منصرف (-)</th>
                    <th className="p-3.5 text-sky-700 dark:text-sky-400 font-black">الرصيد</th>
                    <th className="p-3.5">المسؤول</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : filteredUnifiedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        لا توجد حركات مالية مسجلة.
                      </td>
                    </tr>
                  ) : (
                    filteredUnifiedTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* 1. Type */}
                        <td className="p-3.5">
                          {tx.type === 'income' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800/50">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                              <span>قبض</span>
                            </span>
                          ) : tx.type === 'expense' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold text-[11px] border border-rose-300 dark:border-rose-800/50">
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              <span>مصروف</span>
                            </span>
                          ) : tx.type === 'settlement' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-300 dark:border-amber-800/50">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>مدرب</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold text-[11px] border border-purple-300 dark:border-purple-800/50">
                              <Crown className="w-3 h-3 text-purple-600" />
                              <span>مالك</span>
                            </span>
                          )}
                        </td>

                        {/* 2. Ref Number */}
                        <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {tx.refNumber}
                        </td>

                        {/* 3. Date & Time */}
                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          <div>{tx.date}</div>
                          {tx.time && <div className="text-[10px] text-slate-400">{tx.time}</div>}
                        </td>

                        {/* 4. Title / Description */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate" title={tx.title}>
                          {tx.title}
                        </td>

                        {/* 5. Branch */}
                        <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">
                          {tx.branchName}
                        </td>

                        {/* 6. Incoming (+) */}
                        <td className="p-3.5 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {tx.incoming > 0 ? `+ ${tx.incoming.toLocaleString()} ج.م` : '—'}
                        </td>

                        {/* 7. Outgoing (-) */}
                        <td className="p-3.5 font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                          {tx.outgoing > 0 ? `- ${tx.outgoing.toLocaleString()} ج.م` : '—'}
                        </td>

                        {/* 8. Running Treasury Balance */}
                        <td className="p-3.5 font-mono font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            {tx.runningBalance.toLocaleString()} ج.م
                          </span>
                        </td>

                        {/* 9. User */}
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 text-xs">
                          {tx.user}
                        </td>

                        {/* 10. Actions */}
                        <td className="p-3.5 text-center">
                          {tx.type === 'income' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedOfficialReceipt(tx.raw)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="عرض الإيصال"
                              >
                                إيصال
                              </button>
                              <button
                                onClick={() => handlePrintReceipt(tx.raw)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
                                title="طباعة"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : tx.type === 'withdrawal' && isManagerOrAccountant ? (
                            <button
                              onClick={() => handleDeleteOwnerWithdrawal(tx.raw.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="إلغاء السند"
                            >
                              إلغاء ↺
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">معتمد ✓</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

      {/* View: Trainer Settlements History (سندات صرف مستحقات المدربين) */}
      {activeTab === 'settlements' && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-sm dark:shadow-xl p-5 space-y-4 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                <span>سجل سندات صرف مستحقات المدربين ({settlements.length} سند)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                كافة سندات صرف العمولات والأتعاب التدريبية التي تم اعتمادها للمحاضرين
              </p>
            </div>
            <button
              onClick={() => setActiveTab('trainerShares')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <span>+ صرف مستحقات مدرب جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم السند</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">اسم المدرب</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">المبلغ المصروف</th>
                  <th className="p-3">طريقة الصرف</th>
                  <th className="p-3">البيان / الفترة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      لم يتم تسجيل أي سندات صرف مستحقات مدربين حتى الآن.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{s.settlementNumber || s.receiptNumber || s.id}</td>
                      <td className="p-3 font-mono text-slate-500">{s.date}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.trainerName || trainers.find(t => t.id === s.trainerId)?.name || 'مدرب معتمد'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{branches.find(b => b.id === s.branchId)?.name || 'الفرع الرئيسي'}</td>
                      <td className="p-3 font-mono font-black text-rose-600 dark:text-rose-400">{Number(s.amount).toLocaleString()} ج.م</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{s.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : s.paymentMethod === 'instapay' ? 'انستا باي' : 'نقداً من الخزينة'}</td>
                      <td className="p-3 text-slate-500">{s.periodDescription || s.notes || 'تسوية مستحقات مدرب'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Owner Withdrawals History (سندات صرف حصة صاحب المركز) */}
      {activeTab === 'ownerWithdrawals' && isManagerOrAccountant && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-base shrink-0">
                👑
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>سجل مسحوبات وصرف حصة صاحب المركز ({ownerWithdrawals.length} سند)</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    إدارة عليا
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  توثيق مسحوبات حصة المركز وأرباح الإدارة وبيان السيولة النقدية المتبقية بالخزنة كأمان
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenOwnerWithdrawalModal()}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ صرف دفعة جديدة لصاحب المركز</span>
            </button>
          </div>

          {/* Ultra-Compact Single-Line Financial Ribbon for Owner */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 px-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">رصيدك المتاح للصرف:</span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                  {Math.max(0, (Number(summary?.totalCenterShare || 0) - Number(summary?.totalOwnerWithdrawals || 0))).toLocaleString()} ج.م
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">السيولة الحالية بالخزنة:</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                  {(summary?.netTreasury || 0).toLocaleString()} ج.م
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">إجمالي ما تم سحبه:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                  {ownerWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0).toLocaleString()} ج.م
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({ownerWithdrawals.length} سند)</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">أرباح المركز التراكمية:</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                  {(summary?.totalCenterShare || 0).toLocaleString()} ج.م
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>

              <div className="hidden lg:flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
                <span className="text-slate-600 dark:text-slate-400 font-bold text-[11px]">إجمالي المحصل:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {(summary?.totalRevenue || 0).toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              أقصى صرف نقدي الآن: <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{Math.min(Number(summary?.netTreasury || 0), Math.max(0, (Number(summary?.totalCenterShare || 0) - Number(summary?.totalOwnerWithdrawals || 0)))).toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم السند</th>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">المستفيد</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">المبلغ المسحوب</th>
                  <th className="p-3">الرصيد المتروك في الخزنة</th>
                  <th className="p-3">طريقة الاستلام</th>
                  <th className="p-3">البيان والملاحظات</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ownerWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      لم يتم تسجيل أي مسحوبات لصاحب المركز بعد. كافة الأموال ما زالت مسجلة برصيد الخزنة.
                    </td>
                  </tr>
                ) : (
                  ownerWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{w.receiptNumber}</td>
                      <td className="p-3 font-mono text-slate-500">{w.date}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>👑</span>
                        <span>{w.withdrawnByUserName || 'صاحب المركز (المدير العام)'}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{branches.find(b => b.id === w.branchId)?.name || 'الفرع الرئيسي'}</td>
                      <td className="p-3 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">{Number(w.amount).toLocaleString()} ج.م</td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {w.remainingTreasuryAfter !== undefined ? `${Number(w.remainingTreasuryAfter).toLocaleString()} ج.م` : '—'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{w.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : w.paymentMethod === 'instapay' ? 'انستا باي' : 'نقداً كاش'}</td>
                      <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">{w.notes || 'صرف حصة وأرباح المالك'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteOwnerWithdrawal(w.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="إلغاء السند وإرجاع المبلغ للخزينة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                      <>
                        <button
                          onClick={() => setIsResetSecretTreasuryConfirmOpen(true)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          تصفير الخزنة السرية 🔐
                        </button>
                        <button
                          onClick={() => setIsResetModalOpen(true)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          تصفير الحسابات الشامل مع الأرشفة 🗄️
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setIsVerifiedSecret(false);
                        setSecretPin('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
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
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER SHARE WITHDRAWAL MODAL (صرف حصة ومسحوبات صاحب المركز) */}
      {isOwnerWithdrawalModalOpen && (() => {
        // Resolve data for selected branch
        let selectedTreasury = 0;
        let selectedCenterShare = 0;
        let selectedRevenue = 0;
        let selectedWithdrawals = 0;
        let branchDisplayName = 'جميع الفروع (المركز العام)';

        const b1Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-1');
        const b2Data = summary?.branchBreakdowns?.find((b: any) => b.branchId === 'branch-2');
        const b1Treasury = b1Data ? Number(b1Data.netTreasury) : 3700;
        const b2Treasury = b2Data ? Number(b2Data.netTreasury) : 1100;
        const allTreasury = Number(summary?.netTreasury || (b1Treasury + b2Treasury));

        if (modalBranchId === 'branch-1') {
          selectedTreasury = b1Treasury;
          selectedCenterShare = b1Treasury;
          selectedRevenue = b1Data ? Number(b1Data.totalRevenue) : 3700;
          selectedWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-1').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
          branchDisplayName = 'فرع النجاح';
        } else if (modalBranchId === 'branch-2') {
          selectedTreasury = b2Treasury;
          selectedCenterShare = b2Treasury;
          selectedRevenue = b2Data ? Number(b2Data.totalRevenue) : 2100;
          selectedWithdrawals = ownerWithdrawals.filter((w: any) => w.branchId === 'branch-2').reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
          branchDisplayName = 'فرع بدر';
        } else {
          selectedTreasury = allTreasury;
          selectedCenterShare = Number(summary?.totalCenterShare || allTreasury);
          selectedRevenue = Number(summary?.totalRevenue || 5800);
          selectedWithdrawals = ownerWithdrawals.reduce((s: number, w: any) => s + (Number(w.amount) || 0), 0);
          branchDisplayName = 'جميع الفروع المركزية';
        }

        const selectedAvailableOwnerShare = Math.max(0, selectedCenterShare - selectedWithdrawals);
        const selectedMaxAllowedNow = Math.min(selectedTreasury, selectedAvailableOwnerShare);
        const withdrawAmt = Number(ownerWithdrawForm.amount || 0);
        const remainingTreasury = Math.max(0, selectedTreasury - withdrawAmt);
        const remainingOwnerShare = Math.max(0, selectedAvailableOwnerShare - withdrawAmt);

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 overflow-y-auto"
            onClick={() => setIsOwnerWithdrawalModalOpen(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl dir-rtl text-xs flex flex-col max-h-[96dvh] overflow-hidden my-auto animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* STICKY TOP HEADER */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    👑
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                      سند صرف حصة وأرباح صاحب المركز
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {branchDisplayName} • سيولة الخزنة الحالية: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedTreasury.toLocaleString()} ج.م</span>
                    </p>
                  </div>
                </div>

                {/* Highly Visible Prominent Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOwnerWithdrawalModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="إغلاق النافذة"
                >
                  <span>إغلاق</span>
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* BODY - ULTRA COMPACT & CLEAN, NO NEEDLESS SCROLLING */}
              <div className="p-2.5 sm:p-3.5 overflow-y-auto space-y-2 flex-1 overscroll-contain">
                {/* 1. Branch Selector Tabs (فصل فرع النجاح وفرع بدر بالكامل) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>اختر الفرع المراد الصرف من خزنته:</span>
                    <span className="text-[10px] text-slate-400 font-normal">تحديث فوري للأرقام</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleModalBranchChange('all')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                        modalBranchId === 'all'
                          ? 'bg-amber-500 text-white shadow-xs font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>🏢 كل الفروع</span>
                      <span className="block font-mono text-[10px] opacity-90 font-bold">({allTreasury.toLocaleString()} ج.م)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModalBranchChange('branch-1')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                        modalBranchId === 'branch-1'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>📍 فرع النجاح</span>
                      <span className="block font-mono text-[10px] opacity-90 font-bold">({b1Treasury.toLocaleString()} ج.م)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModalBranchChange('branch-2')}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                        modalBranchId === 'branch-2'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>📍 فرع بدر</span>
                      <span className="block font-mono text-[10px] opacity-90 font-bold">({b2Treasury.toLocaleString()} ج.م)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Top Financial Breakdown for Selected Branch */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2 grid grid-cols-3 gap-1 text-center">
                  <div className="p-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">سيولة الخزنة بالدرج</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                      {selectedTreasury.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="p-1 border-r border-l border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">حصة المركز المتاحة</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                      {selectedAvailableOwnerShare.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="p-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">أقصى صرف متاح الآن</span>
                    <span className="font-mono font-black text-teal-600 dark:text-teal-400 text-xs sm:text-sm">
                      {selectedMaxAllowedNow.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* 3. Quick Action Shortcuts */}
                <div className="flex items-center gap-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerWithdrawalMode('amount');
                      setOwnerWithdrawForm(prev => ({ ...prev, amount: selectedMaxAllowedNow }));
                      setLeaveInTreasuryAmount(Math.max(0, selectedTreasury - selectedMaxAllowedNow));
                    }}
                    className="flex-1 py-1 px-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-[10px] sm:text-[11px] cursor-pointer text-center"
                  >
                    ⚡ كامل المتاح ({selectedMaxAllowedNow.toLocaleString()} ج.م)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const half = Math.floor(selectedMaxAllowedNow / 2);
                      setOwnerWithdrawalMode('amount');
                      setOwnerWithdrawForm(prev => ({ ...prev, amount: half }));
                      setLeaveInTreasuryAmount(Math.max(0, selectedTreasury - half));
                    }}
                    className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] sm:text-[11px] cursor-pointer text-center"
                  >
                    صرف النصف ({Math.floor(selectedMaxAllowedNow / 2).toLocaleString()} ج.م)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerWithdrawalMode('leave_treasury');
                      const defaultLeave = Math.min(1000, selectedTreasury);
                      setLeaveInTreasuryAmount(defaultLeave);
                      setOwnerWithdrawForm(prev => ({ ...prev, amount: Math.max(0, selectedTreasury - defaultLeave) }));
                    }}
                    className={`py-1 px-2 rounded-lg border font-bold text-[10px] sm:text-[11px] cursor-pointer transition-all text-center ${
                      ownerWithdrawalMode === 'leave_treasury'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    💵 ترك سيولة بالخزنة
                  </button>
                </div>

                <form id="owner-withdrawal-form" onSubmit={handleCreateOwnerWithdrawal} className="space-y-2">
                  {/* Mode: Leave in Treasury vs Direct Amount */}
                  {ownerWithdrawalMode === 'leave_treasury' ? (
                    <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          المبلغ المراد إبقاؤه في الخزنة كسيولة: *
                        </label>
                        <button
                          type="button"
                          onClick={() => setOwnerWithdrawalMode('amount')}
                          className="text-[10px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                        >
                          التبديل لتحديد مبلغ السحب
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={selectedTreasury}
                        value={leaveInTreasuryAmount}
                        onChange={(e) => {
                          const leave = Math.max(0, Number(e.target.value) || 0);
                          setLeaveInTreasuryAmount(leave);
                          const calculatedWithdraw = Math.max(0, selectedTreasury - leave);
                          setOwnerWithdrawForm(prev => ({ ...prev, amount: calculatedWithdraw }));
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-sm outline-none focus:border-emerald-500"
                        placeholder="مثال: 1000"
                      />
                      <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                        ستبقي <span className="font-bold font-mono">{leaveInTreasuryAmount.toLocaleString()} ج.م</span> في الخزنة، وسيتم صرف <span className="font-bold font-mono text-emerald-900 dark:text-emerald-200">{Math.max(0, selectedTreasury - leaveInTreasuryAmount).toLocaleString()} ج.م</span> لحسابك.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          المبلغ المطلوب صرفه لحسابك (ج.م): *
                        </label>
                        <button
                          type="button"
                          onClick={() => setOwnerWithdrawalMode('leave_treasury')}
                          className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                        >
                          أريد تحديد ما سأتركه بالخزنة كسيولة
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={selectedTreasury}
                        required
                        value={ownerWithdrawForm.amount}
                        onChange={(e) => {
                          const amt = Math.max(0, Number(e.target.value) || 0);
                          setOwnerWithdrawForm(prev => ({ ...prev, amount: amt }));
                          setLeaveInTreasuryAmount(Math.max(0, selectedTreasury - amt));
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-sm outline-none focus:border-amber-500"
                        placeholder="أدخل المبلغ المطلوب..."
                      />
                    </div>
                  )}

                  {/* Dynamic Live Balance Preview */}
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 block">المصروف لك</span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                        {withdrawAmt.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="border-r border-l border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 block">السيولة المتبقية</span>
                      <span className={`font-mono font-black text-xs ${remainingTreasury > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {remainingTreasury.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 block">متبقي حصتك</span>
                      <span className="font-mono font-black text-indigo-700 dark:text-indigo-400 text-xs">
                        {remainingOwnerShare.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-0.5 text-[10px]">
                        تاريخ الصرف:
                      </label>
                      <input
                        type="date"
                        required
                        value={ownerWithdrawForm.date}
                        onChange={(e) => setOwnerWithdrawForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-0.5 text-[10px]">
                        طريقة الاستلام:
                      </label>
                      <select
                        value={ownerWithdrawForm.paymentMethod}
                        onChange={(e) => setOwnerWithdrawForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                      >
                        <option value="cash">نقداً من الخزينة مباشرة</option>
                        <option value="vodafone_cash">فودافون كاش</option>
                        <option value="instapay">تحويل انستا باي</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-0.5 text-[10px]">
                      البيان والملاحظات:
                    </label>
                    <input
                      type="text"
                      value={ownerWithdrawForm.notes}
                      onChange={(e) => setOwnerWithdrawForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="صرف دفعة من حصة وأرباح صاحب المركز"
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                    />
                  </div>
                </form>
              </div>

              {/* STICKY BOTTOM FOOTER */}
              <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 z-10">
                <button
                  type="button"
                  onClick={() => setIsOwnerWithdrawalModalOpen(false)}
                  className="py-2 px-3.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  إلغاء وإغلاق
                </button>
                <button
                  type="submit"
                  form="owner-withdrawal-form"
                  disabled={isSubmittingOwnerWithdraw || withdrawAmt <= 0 || withdrawAmt > selectedTreasury}
                  className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                >
                  {isSubmittingOwnerWithdraw ? 'جاري الصرف...' : `تأكيد صرف (${withdrawAmt.toLocaleString()} ج.م) 💵`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
