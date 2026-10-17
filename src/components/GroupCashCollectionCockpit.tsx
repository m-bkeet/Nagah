import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Receipt, 
  Share2, 
  Printer, 
  Phone, 
  Search, 
  Filter, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  CreditCard, 
  Percent, 
  Layers, 
  Check, 
  HardDrive, 
  UserCheck, 
  FileText,
  Sparkles,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trainee, Group, Payment, Course, Branch } from '../types';
import { OfficialReceiptModal } from './OfficialReceiptModal';
import { numberToArabicWords } from '../utils/numberToArabicWords';
import { parseYearMonthKey, formatYearMonthName, getTraineeStartMonthKey } from '../utils/paymentUtils';

export interface GroupCashCollectionCockpitProps {
  onPaymentSuccess?: (payment: Payment, updatedTrainee?: Trainee) => void;
  externalPayments?: Payment[];
  onRefreshParent?: () => void;
  initialBranchId?: string;
}

export const GroupCashCollectionCockpit: React.FC<GroupCashCollectionCockpitProps> = ({
  onPaymentSuccess,
  externalPayments,
  onRefreshParent,
  initialBranchId
}) => {
  const { 
    trainees = [], 
    groups = [], 
    courses = [], 
    branches = [], 
    settings,
    refreshCoreData,
    showToast
  } = useCenter();
  const { user } = useAuth();

  // Local payments state
  const [paymentsList, setPaymentsList] = useState<Payment[]>(externalPayments || []);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);

  useEffect(() => {
    if (externalPayments && externalPayments.length > 0) {
      setPaymentsList(externalPayments);
    }
  }, [externalPayments]);

  const loadAllPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    try {
      const data = await api.getPayments({ fresh: 'true' });
      if (Array.isArray(data)) {
        setPaymentsList(data);
      }
    } catch (err) {
      console.warn('Failed to load payments in GroupCashCollectionCockpit:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    loadAllPayments();
  }, [loadAllPayments]);

  // Selected State
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || 'all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (initialBranchId && initialBranchId !== selectedBranchId) {
      setSelectedBranchId(initialBranchId);
    }
  }, [initialBranchId]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'paid' | 'exempt'>('all');

  // Active Receipt Modal
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedTraineeForPayment, setSelectedTraineeForPayment] = useState<Trainee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vodafone_cash' | 'instapay' | 'visa' | 'bank_transfer'>('cash');
  const [paymentTargetMonth, setPaymentTargetMonth] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [nextDueDateInput, setNextDueDateInput] = useState<string>('');
  const [applyDiscount, setApplyDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [isExemptToggle, setIsExemptToggle] = useState<boolean>(false);
  const [exemptReasonSelect, setExemptReasonSelect] = useState<'management_children' | 'friend_children' | 'scholarship' | 'other'>('scholarship');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ⚡ One-Click Immediate Payment for Student for selected month (الافتراضي سبتمبر 2026 بداية العام المالي)
  const [targetQuickMonth, setTargetQuickMonth] = useState<string>('سبتمبر 2026');
  const [quickPayingStudentId, setQuickPayingStudentId] = useState<string | null>(null);
  const [isQuickBatchPaying, setIsQuickBatchPaying] = useState<boolean>(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return (groups || []).filter(g => {
      if (selectedBranchId !== 'all' && g.branchId !== selectedBranchId) return false;
      return true;
    });
  }, [groups, selectedBranchId]);

  // Active Group Object
  const currentGroup = useMemo(() => {
    if (selectedGroupId === 'all') return null;
    return (groups || []).find(g => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  // Group Course
  const currentCourse = useMemo(() => {
    if (!currentGroup?.courseId) return null;
    return (courses || []).find(c => c.id === currentGroup.courseId) || null;
  }, [currentGroup, courses]);

  // Trainees in Selected Group / Scope (EXCLUDING stopped, withdrawn, inactive, and unassigned students)
  const groupTrainees = useMemo(() => {
    const list = trainees || [];
    return list.filter(t => {
      // 1. Exclude stopped (متوقف), withdrawn (منسحب), and inactive trainees completely from finances & collection
      if (t.status === 'suspended' || t.status === 'dropped' || t.status === 'inactive') return false;

      // 2. Exclude trainees not assigned to a group or not assigned to a course
      const hasGroup = Boolean(t.groupId && t.groupId.trim() !== '' && t.groupId !== 'unassigned');
      const hasCourse = Boolean(t.courseId && t.courseId.trim() !== '' && t.courseId !== 'unassigned');
      if (!hasGroup || !hasCourse) return false;

      if (selectedBranchId !== 'all') {
        const traineeBranch = t.branchId || (groups.find(g => g.id === t.groupId)?.branchId);
        if (traineeBranch !== selectedBranchId) return false;
      }
      if (selectedGroupId && selectedGroupId !== 'all') {
        if (t.groupId !== selectedGroupId) return false;
      }
      return true;
    });
  }, [trainees, groups, selectedBranchId, selectedGroupId]);

  // Helpers to calculate financial status for a student for the TARGET SELECTED MONTH
  const getTraineeFinancialInfo = (t: Trainee) => {
    // Check suspended / dropped / unassigned FIRST
    const isSuspendedOrDropped = t.status === 'suspended' || t.status === 'dropped' || t.status === 'inactive';
    const isUnassigned = !t.groupId || t.groupId.trim() === '' || t.groupId === 'unassigned' || !t.courseId || t.courseId.trim() === '' || t.courseId === 'unassigned';
    
    // Latest payment record
    const traineePayments = (paymentsList || []).filter(p => (p.traineeId === t.id || (p.traineeCode && t.code && String(p.traineeCode).trim().toUpperCase() === String(t.code).trim().toUpperCase())) && p.status !== 'rejected');
    const latestPayment = traineePayments.length > 0 ? traineePayments[traineePayments.length - 1] : null;

    if (isSuspendedOrDropped || isUnassigned) {
      return {
        baseFee: 0,
        discount: 0,
        net: 0,
        paid: 0,
        remaining: 0,
        isExempt: false,
        reasonLabel: isSuspendedOrDropped 
          ? (t.status === 'suspended' ? '⏸️ متوقف (مستبعد من الحسابات)' : '🚫 منسحب (مستبعد من الحسابات)')
          : '⏳ غير مسكن بمجموعة (مستبعد)',
        isPaidUntilNextMonth: true,
        isPaidForTargetMonth: true,
        monthPaidAmount: 0,
        monthRemainingAmount: 0,
        latestPayment,
        nextPaymentDueDate: undefined
      };
    }

    // Check exemption flags FIRST
    const note = t.notes || '';
    const isExemptNote = /إعفاء|معفى|معفي|أبناء|منحة|مالك|إداري|استثنائي|مجاني/i.test(note);
    const isExempt = Boolean(
      t.isExempt === true || 
      String(t.isExempt) === 'true' || 
      Boolean(t.exemptReason) || 
      isExemptNote || 
      (t.discountAmount && t.feeAmount && t.discountAmount >= t.feeAmount && t.feeAmount > 0)
    );

    const course = (courses || []).find(c => c.id === t.courseId) || currentCourse;
    const courseFee = course?.fee || course?.price || course?.feeAmount || 0;
    const baseFee = (t.feeAmount !== undefined && t.feeAmount !== null && t.feeAmount > 0) ? t.feeAmount : (courseFee || 0);
    const discount = isExempt ? baseFee : (t.discountAmount || 0);
    const net = isExempt ? 0 : Math.max(0, baseFee - discount);
    
    let reasonLabel = 'إعفاء بقرار إدارة';
    if (t.exemptReason === 'management_children' || /مالك|إداري|إدارة/i.test(note)) {
      reasonLabel = '👑 أبناء إدارة / مالك المركز (إعفاء 100%)';
    } else if (t.exemptReason === 'friend_children' || /أصدقاء|معارف/i.test(note)) {
      reasonLabel = '🤝 أبناء معارف وأصدقاء الإدارة (إعفاء 100%)';
    } else if (t.exemptReason === 'scholarship' || /منحة/i.test(note)) {
      reasonLabel = '🎓 منحة دراسية استثنائية (إعفاء 100%)';
    } else if (discount >= baseFee && baseFee > 0) {
      reasonLabel = '✨ خصم كلي 100% مسجل';
    }

    // Check if trainee started their subscription in a month AFTER the target selected month
    const targetMonthKey = parseYearMonthKey(targetQuickMonth);
    const traineeStartKey = getTraineeStartMonthKey(t);
    const isJoinedLater = Boolean(targetMonthKey && traineeStartKey && traineeStartKey > targetMonthKey);
    const joinMonthReadable = formatYearMonthName(traineeStartKey);

    // Determine payment status SPECIFICALLY for targetQuickMonth
    const targetMonthPrefix = (targetQuickMonth || 'سبتمبر').split(' ')[0]; // e.g. "سبتمبر", "أكتوبر", "نوفمبر"
    
    // Check if September was paid
    const septPayments = traineePayments.filter(p => 
      p && p.status !== 'rejected' && (
        (p.targetMonth && (p.targetMonth.includes('سبتمبر') || p.targetMonth.includes('شهر 9'))) ||
        (Array.isArray(p.paidMonths) && p.paidMonths.some((m: string) => m && (m.includes('سبتمبر') || m.includes('شهر 9'))))
      )
    );
    const cleanPaidMonths = (Array.isArray(t.paidMonths) ? t.paidMonths : [])
      .filter(m => m && !/أكتوبر|نوفمبر|ديسمبر|يناير|10|١٠/i.test(m));
    const hasPaidSept = cleanPaidMonths.some(m => m.includes('سبتمبر') || m.includes('شهر 9')) || septPayments.length > 0;

    // Check payment records targeting this specific selected month
    const paymentsForThisMonth = traineePayments.filter(p => 
      p && p.status !== 'rejected' && (
        (p.targetMonth && p.targetMonth.includes(targetMonthPrefix)) ||
        (Array.isArray(p.paidMonths) && p.paidMonths.some((m: string) => m && m.includes(targetMonthPrefix)))
      )
    );
    const totalPaidForThisMonth = paymentsForThisMonth.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const monthLatestPayment = paymentsForThisMonth.length > 0 ? paymentsForThisMonth[paymentsForThisMonth.length - 1] : null;

    let isPaidForTargetMonth = false;
    let isNotDueYet = false;
    let isDueOverdue = false;
    let monthPaidAmount = 0;
    let monthRemainingAmount = 0;
    let finalReasonLabel = reasonLabel;

    if (isJoinedLater) {
      isPaidForTargetMonth = false;
      isNotDueYet = true;
      monthPaidAmount = 0;
      monthRemainingAmount = 0;
      finalReasonLabel = `التحق لاحقاً (${joinMonthReadable}) - غير ملزم بـ ${targetMonthPrefix}`;
    } else if (isExempt) {
      isPaidForTargetMonth = false;
      isNotDueYet = false;
      monthPaidAmount = 0;
      monthRemainingAmount = 0;
    } else if (targetMonthPrefix === 'سبتمبر') {
      if (hasPaidSept || totalPaidForThisMonth > 0) {
        isPaidForTargetMonth = true;
        isNotDueYet = false;
        isDueOverdue = false;
        monthPaidAmount = Math.max(totalPaidForThisMonth, net);
        monthRemainingAmount = 0;
        finalReasonLabel = 'تم سداد شهر سبتمبر بالكامل ✅';
      } else {
        isPaidForTargetMonth = false;
        isNotDueYet = false;
        isDueOverdue = true;
        monthPaidAmount = 0;
        monthRemainingAmount = net;
        finalReasonLabel = 'مستحق سداد سبتمبر (غير مسدد) ⏳';
      }
    } else {
      // For October and subsequent months (أكتوبر, نوفمبر, etc.)
      if (paymentsForThisMonth.length > 0 && totalPaidForThisMonth >= net && net > 0) {
        // Actual payment voucher for October!
        isPaidForTargetMonth = true;
        isNotDueYet = false;
        isDueOverdue = false;
        monthPaidAmount = totalPaidForThisMonth;
        monthRemainingAmount = 0;
        finalReasonLabel = `تم سداد شهر ${targetMonthPrefix} بالكامل ✅`;
      } else if (hasPaidSept) {
        // Paid September -> October is NOT DUE YET (not paid October yet!)
        isPaidForTargetMonth = false; // <-- CRITICAL: Nobody has paid October!
        isNotDueYet = true; // <-- NOT DUE YET until Oct 25
        isDueOverdue = false;
        monthPaidAmount = 0;
        monthRemainingAmount = 0;
        finalReasonLabel = `غير مستحق السداد حتى الآن (استحقاق 25 ${targetMonthPrefix}) ℹ️`;
      } else {
        // Did NOT pay September -> September arrears are overdue!
        isPaidForTargetMonth = false;
        isNotDueYet = false;
        isDueOverdue = true;
        monthPaidAmount = 0;
        monthRemainingAmount = net;
        finalReasonLabel = 'مستحق سداد متأخرات سبتمبر (غير مسدد) ⏳';
      }
    }

    return {
      baseFee,
      discount,
      net,
      paid: monthPaidAmount,
      remaining: monthRemainingAmount,
      isExempt,
      reasonLabel: finalReasonLabel,
      isPaidUntilNextMonth: isPaidForTargetMonth || isNotDueYet,
      isPaidForTargetMonth, // ONLY TRUE IF ACTUAL PAYMENT WAS RECEIVED FOR THIS TARGET MONTH!
      isNotDueYet,
      isDueOverdue,
      monthPaidAmount,
      monthRemainingAmount,
      isJoinedLater,
      joinMonthReadable,
      latestPayment: monthLatestPayment,
      nextPaymentDueDate: t.nextPaymentDueDate
    };
  };

  // Group Summary Calculations for the Selected Month
  const groupSummary = useMemo(() => {
    let totalStudents = groupTrainees.length;
    let paidCount = 0;
    let notDueCount = 0;
    let dueCount = 0;
    let exemptCount = 0;
    let totalCollectedInGroup = 0;
    let totalRemainingInGroup = 0;
    let totalExpectedInGroup = 0;

    groupTrainees.forEach(t => {
      const info = getTraineeFinancialInfo(t);
      if (info.isExempt) {
        exemptCount++;
      } else if (info.isPaidForTargetMonth) {
        paidCount++;
      } else if (info.isNotDueYet) {
        notDueCount++;
      } else if (info.isDueOverdue) {
        dueCount++;
      }
      totalCollectedInGroup += info.paid;
      totalRemainingInGroup += info.remaining;
      if (!info.isExempt && !info.isJoinedLater) {
        totalExpectedInGroup += info.net;
      }
    });

    const collectionRate = totalExpectedInGroup > 0 
      ? Math.round((totalCollectedInGroup / totalExpectedInGroup) * 100) 
      : (paidCount > 0 ? 100 : 0);

    return {
      totalStudents,
      paidCount,
      notDueCount,
      dueCount,
      exemptCount,
      totalCollectedInGroup,
      totalRemainingInGroup,
      totalExpectedInGroup,
      collectionRate
    };
  }, [groupTrainees, paymentsList, currentCourse, targetQuickMonth]);

  // Filtered & Searched Trainees List
  const displayedTrainees = useMemo(() => {
    return groupTrainees.filter(t => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = t.fullName?.toLowerCase().includes(query);
        const matchesCode = t.code?.toLowerCase().includes(query);
        const matchesPhone = t.phone?.includes(query) || t.parentPhone?.includes(query);
        if (!matchesName && !matchesCode && !matchesPhone) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        const info = getTraineeFinancialInfo(t);
        if (statusFilter === 'paid' && (!info.isPaidForTargetMonth || info.isExempt)) return false;
        if (statusFilter === 'notDueYet' && (!info.isNotDueYet || info.isExempt)) return false;
        if (statusFilter === 'due' && (!info.isDueOverdue || info.isExempt)) return false;
        if (statusFilter === 'exempt' && !info.isExempt) return false;
      }

      return true;
    });
  }, [groupTrainees, searchTerm, statusFilter, paymentsList, targetQuickMonth]);

  // Open Payment / Collection Modal for a Student
  const handleOpenCollection = (trainee: Trainee) => {
    const info = getTraineeFinancialInfo(trainee);
    setSelectedTraineeForPayment(trainee);
    
    // Default payment amount = monthly fee or remaining balance, or 0 if exempt
    if (info.isExempt) {
      setPaymentAmount(0);
      setIsExemptToggle(true);
      setApplyDiscount(info.baseFee);
      setExemptReasonSelect(trainee.exemptReason || 'management_children');
      setPaymentNotes('إعفاء رسمي معتمد من الإدارة');
    } else {
      const defaultAmount = info.net > 0 ? (info.remaining > 0 ? info.remaining : info.net) : (info.baseFee || 200);
      setPaymentAmount(defaultAmount);
      setIsExemptToggle(false);
      setApplyDiscount(trainee.discountAmount || 0);
      setExemptReasonSelect(trainee.exemptReason || 'scholarship');
      setPaymentNotes('تحصيل نقدي بالخزينة');
    }
    setPaymentMethod('cash');

    // Default target month = currently selected targetQuickMonth or active month (افتراضياً سبتمبر)
    setPaymentTargetMonth(targetQuickMonth || 'سبتمبر 2026');

    // Default next due date = Day 25 of next cycle (e.g. 25/10/2026)
    const dueYear = now.getFullYear();
    const dueMonth = now.getMonth(); // Current month index (e.g. 9 for October)
    const calcNextDueDate = new Date(dueYear, dueMonth, 25);
    setNextDueDateInput(calcNextDueDate.toISOString().split('T')[0]);

    setIsCollectionModalOpen(true);
  };

  // Helper to open receipt for student safely
  const handlePrintReceiptForTrainee = (trainee: Trainee, info: any) => {
    let p = info.latestPayment;
    if (!p) {
      p = (paymentsList || []).find(pay => pay.traineeId === trainee.id || (pay.traineeCode && trainee.code && pay.traineeCode === trainee.code));
    }
    if (!p) {
      const now = new Date();
      p = {
        id: 'rec-' + trainee.id,
        receiptNumber: trainee.lastReceiptNumber || `REC${(trainee.code || trainee.id).replace(/\D/g, '').slice(-4) || '202601'}`,
        date: trainee.lastPaymentDate || now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        traineeId: trainee.id,
        traineeName: trainee.fullName,
        traineeCode: trainee.code,
        courseId: trainee.courseId,
        branchId: trainee.branchId,
        amount: trainee.paidAmount || info.net || 200,
        paymentMethod: 'cash',
        receivedByUserId: 'admin',
        receivedByUserName: 'المدير المالي والخزينة',
        targetMonth: targetQuickMonth,
        notes: `سند تحصيل معتمد - ${targetQuickMonth}`,
        createdAt: now.toISOString(),
        status: 'approved'
      } as Payment;
    }
    setActiveReceiptPayment(p);
    setIsReceiptModalOpen(true);
  };

  // Submit Payment and Generate Receipt
  const handleConfirmPayment = async () => {
    if (!selectedTraineeForPayment) return;
    if (paymentAmount <= 0 && !isExemptToggle) {
      alert('يرجى إدخال مبلغ تحصيل صحيح');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const finalDiscount = Number(applyDiscount) || 0;
      const calculatedNetAmount = Math.max(0, (selectedTraineeForPayment.feeAmount || paymentAmount) - finalDiscount);

      const traineeGroup = (groups || []).find(g => g.id === selectedTraineeForPayment.groupId);
      // Create Payment via API
      const res = await api.createPayment({
        traineeId: selectedTraineeForPayment.id,
        amount: isExemptToggle ? 0 : Number(paymentAmount),
        paymentMethod,
        targetMonth: paymentTargetMonth,
        notes: paymentNotes,
        receivedByUserId: user?.id || 'admin',
        receivedByUserName: user?.fullName || 'المدير المالي والخزينة',
        branchId: selectedTraineeForPayment.branchId || traineeGroup?.branchId,
        courseId: selectedTraineeForPayment.courseId || traineeGroup?.courseId,
        trainerId: traineeGroup?.trainerId,
        parentPhone: selectedTraineeForPayment.parentPhone || selectedTraineeForPayment.phone,
        traineePhone: selectedTraineeForPayment.phone,
        discountAmount: finalDiscount,
        isExempt: isExemptToggle,
        exemptReason: isExemptToggle ? exemptReasonSelect : undefined,
        nextDueDate: nextDueDateInput,
        paidMonths: [paymentTargetMonth]
      });

      if (res?.payment) {
        // Optimistically update local payments
        setPaymentsList(prev => [res.payment, ...prev.filter(p => p.id !== res.payment.id)]);

        // Notify parent
        onPaymentSuccess?.(res.payment, res.trainee);
        onRefreshParent?.();

        // Cross-window and desktop shortcut instant synchronization
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}

        setIsCollectionModalOpen(false);
        setSuccessToast(`تم تحصيل ${paymentAmount} ج.م بنجاح وتحويل حالة الطالب إلى "مسدد حتى ${nextDueDateInput}" 🟢 (يمكنك طباعة الوصل في أي وقت من زر الوصل)`);
        showToast(`تم تسجيل السند رقم #${res.payment.receiptNumber || res.payment.id} بنجاح ✅`, 'success');
        setTimeout(() => setSuccessToast(null), 5000);

        // Background core refresh without blocking UI
        refreshCoreData(false).catch(() => {});
      }
    } catch (err: any) {
      console.error('Payment collection error:', err);
      alert('حدث خطأ أثناء حفظ سند التحصيل: ' + (err.message || 'خطأ في الاتصال'));
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // ⚡ One-Click Immediate Payment for Student for selected month
  const handleQuickPaySingle = async (trainee: Trainee) => {
    if (quickPayingStudentId) return;
    const info = getTraineeFinancialInfo(trainee);
    const amountToPay = info.net > 0 ? (info.remaining > 0 ? info.remaining : info.net) : (info.baseFee || 200);
    const traineeGroup = (groups || []).find(g => g.id === trainee.groupId);

    setQuickPayingStudentId(trainee.id);
    try {
      const res = await api.quickPay({
        traineeId: trainee.id,
        targetMonth: targetQuickMonth,
        amount: amountToPay,
        paymentMethod: 'cash',
        trainerId: traineeGroup?.trainerId,
        notes: `سداد فوري بنقرة واحدة - ${targetQuickMonth}`
      });

      if (res?.payment) {
        // Optimistically append payment to local payments list
        setPaymentsList(prev => [res.payment, ...prev.filter(p => p.id !== res.payment.id)]);

        // Notify parent
        onPaymentSuccess?.(res.payment, res.trainee);
        onRefreshParent?.();

        // Broadcast to other tabs
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}

        showToast(
          `تم سداد ${targetQuickMonth} للطالب "${trainee.fullName}" بمبلغ ${amountToPay} ج.م بنجاح! 🟢 (يمكنك طباعة الوصل من زر الوصل)`,
          'success'
        );
        setSuccessToast(`تم سداد ${targetQuickMonth} للطالب "${trainee.fullName}" بنجاح! رقم الإيصال: #${res.payment.receiptNumber}`);
        setTimeout(() => setSuccessToast(null), 5000);

        // Background core refresh without blocking UI
        refreshCoreData(false).catch(() => {});
      }
    } catch (err: any) {
      console.error('Quick pay error:', err);
      showToast('تعذر تسجيل السداد الفوري: ' + (err.message || 'خطأ غير متوقع'), 'error');
    } finally {
      setQuickPayingStudentId(null);
    }
  };

  const handleQuickBatchPayGroup = async () => {
    // Find all unpaid and non-exempt trainees in the displayed scope
    const unpaidTrainees = groupTrainees.filter(t => {
      const info = getTraineeFinancialInfo(t);
      return !info.isExempt && !info.isPaidUntilNextMonth;
    });

    if (unpaidTrainees.length === 0) {
      showToast('جميع طلاب هذه المجموعة مسددون بالفعل! 🎉', 'info');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من تسديد ${targetQuickMonth} لجميع طلاب المجموعة غير المسددين وعددهم (${unpaidTrainees.length} طالب) بنقرة واحدة؟`)) {
      return;
    }

    setIsQuickBatchPaying(true);
    try {
      const res = await api.quickBatchPay({
        traineeIds: unpaidTrainees.map(t => t.id),
        targetMonth: targetQuickMonth,
        paymentMethod: 'cash'
      });

      if (res?.payments) {
        // Optimistically update payments list
        setPaymentsList(prev => [...res.payments, ...prev]);

        onRefreshParent?.();

        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}

        showToast(`تم بنجاح تسديد ${targetQuickMonth} لعدد ${res.count} طالب في المجموعة! 🟢`, 'success');
        setSuccessToast(`تم بنجاح استخراج سندات السداد لـ ${res.count} طالب لشهر ${targetQuickMonth}`);
        setTimeout(() => setSuccessToast(null), 5000);

        refreshCoreData(true).catch(() => {});
      }
    } catch (err: any) {
      console.error('Batch pay error:', err);
      showToast('تعذر التسديد الجماعي: ' + (err.message || 'خطأ غير متوقع'), 'error');
    } finally {
      setIsQuickBatchPaying(false);
    }
  };

  // 🗑️ Delete Payment Action (حذف السداد وإلغاء الدفعة وإعادة فتح حساب الطالب)
  const handleDeletePayment = async (trainee: Trainee, payment?: Payment) => {
    let p = payment;
    if (!p) {
      p = (paymentsList || []).find(pay => 
        (pay.traineeId === trainee.id || (pay.traineeCode && trainee.code && pay.traineeCode === trainee.code)) &&
        pay.status !== 'rejected'
      );
    }

    if (!p) {
      showToast('لم يتم العثور على سند سداد مسجل لهذا الطالب لحذفه', 'error');
      return;
    }

    const confirmMsg = `هل أنت متأكد من حذف وإلغاء سند السداد رقم (${p.receiptNumber || p.id}) للطالب:\n"${trainee.fullName}" (${trainee.code})\nبمبلغ ${p.amount} ج.م؟\n\n⚠️ سيتم التراجع عن الدفعة وإعادة فتح استحقاق الطالب كغير مسدد فوراً.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingPaymentId(p.id);
      const res = await api.deletePayment(p.id);
      if (res?.success) {
        setPaymentsList(prev => prev.filter(pay => pay.id !== p!.id));
        showToast(`تم بنجاح حذف سند السداد للطالب ${trainee.fullName} وإعادة حسابه كغير مسدد 🗑️`, 'success');
        setSuccessToast(`تم حذف السند وإعادة فتح الاستحقاق للطالب ${trainee.fullName}`);
        setTimeout(() => setSuccessToast(null), 4000);

        onRefreshParent?.();
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}

        refreshCoreData(true).catch(() => {});
      }
    } catch (err: any) {
      console.error('Delete payment error:', err);
      showToast('تعذر حذف سند السداد: ' + (err.message || 'خطأ غير متوقع'), 'error');
    } finally {
      setDeletingPaymentId(null);
    }
  };

  // Quick Direct WhatsApp Trigger
  const handleDirectWhatsApp = (trainee: Trainee) => {
    const rawPhone = trainee.parentPhone || trainee.phone || '';
    if (!rawPhone) {
      alert('لا يوجد رقم هاتف مسجل لهذا الطالب أو ولي أمره');
      return;
    }
    const cleanPhone = rawPhone.replace(/\D/g, '');
    let formatted = cleanPhone;
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      formatted = '2' + cleanPhone;
    }
    const info = getTraineeFinancialInfo(trainee);
    const text = `السلام عليكم ورحمة الله، ولي أمر الطالب ${trainee.fullName} (${trainee.code})\n` +
      `بخصوص المصاريف والاشتراك في ${currentCourse?.name || 'الدورة التدريبية'}:\n` +
      (info.isPaidUntilNextMonth ? `✅ الطالب مسدد حتى تاريخ: ${info.nextPaymentDueDate || 'الشهر القادم'}` : `⚠️ نود تذكيركم بموعد سداد الرسوم المستحقة (${info.remaining || info.net} ج.م)`) +
      `\nمركز النجاح للتدريب والتكنولوجيا.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-indigo-50/80 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-emerald-200/90 dark:border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-2xl relative overflow-hidden text-slate-900 dark:text-white">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-black mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>لوحة التحصيل المالي المباشر للمجموعات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <DollarSign className="w-7 h-7 text-emerald-700 dark:text-emerald-400 p-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/50 rounded-xl" />
              تحصيل المجموعات الفوري وإصدار الإيصالات المعتمدة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-1 max-w-2xl font-medium">
              اختر المجموعة والفرع، واستلم المبالغ نقدياً بنقرة واحدة، مع إصدار فوري للإيصال الرسمي، والتحديث التلقائي لحالة السداد حتى الشهر المقبل، مع الإرسال المباشر عبر واتساب والأرشفة السحابية.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-xs dark:shadow-lg">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-300 block">الأرشفة السحابية</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Google Drive موثق ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Group & Branch Selector Toolbar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Branch Selector */}
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>تصفية حسب الفرع:</span>
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedGroupId('all');
            }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
          >
            <option value="all">🏢 جميع الفروع المركزية</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>📍 {b.name}</option>
            ))}
          </select>
        </div>

        {/* Group Selector */}
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>اختر المجموعة التدريبية:</span>
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-300 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
          >
            <option value="all">🌟 جميع المجموعات والطلاب (عرض شامل لكافة المتدربين)</option>
            {filteredGroups.map(g => (
              <option key={g.id} value={g.id}>
                👥 {g.name} ({g.code || 'بدون كود'}) - {courses.find(c => c.id === g.courseId)?.name || 'دورة غير محددة'}
              </option>
            ))}
          </select>
        </div>

        {/* Search & Filter */}
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>بحث فوري في الطلاب (اسم، كود، هاتف):</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="اسم الطالب، الكود، أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Group & Branch Quick Analytics Stats */}
      {(() => {
        const branchObj = branches.find(b => b.id === selectedBranchId);
        const titleScope = currentGroup 
          ? `المجموعة (${currentGroup.name})` 
          : (selectedBranchId !== 'all' ? `فرع (${branchObj?.name || 'الفرع المحدد'})` : 'كافة الفروع المركزية');

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">إجمالي طلاب {titleScope}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{groupSummary.totalStudents}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-bold">المسددون لـ ({targetQuickMonth.split(' ')[0]})</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{groupSummary.paidCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-sky-200 dark:border-sky-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-sky-700 dark:text-sky-400 block font-bold">غير مستحق حتى الآن</span>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400 font-mono">{groupSummary.notDueCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-amber-200 dark:border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block font-bold">مستحق السداد (متأخرات)</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{groupSummary.dueCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 border border-purple-200 dark:border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-purple-700 dark:text-purple-400 block font-bold">معفى / منح</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{groupSummary.exemptCount}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ⚡ Quick 1-Click Month Pay Action Bar (شريط التسديد الفوري بنقرة واحدة) */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>شهر التحصيل المستهدف:</span>
            </span>
            <select
              value={targetQuickMonth}
              onChange={(e) => setTargetQuickMonth(e.target.value)}
              className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-emerald-950 dark:text-emerald-200 font-black focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="سبتمبر 2026">📅 سبتمبر 2026 (شهر 9)</option>
              <option value="أكتوبر 2026">📅 أكتوبر 2026 (شهر 10)</option>
              <option value="نوفمبر 2026">📅 نوفمبر 2026 (شهر 11)</option>
              <option value="ديسمبر 2026">📅 ديسمبر 2026 (شهر 12)</option>
              <option value="يناير 2027">📅 يناير 2027 (شهر 1)</option>
            </select>
          </div>

          {/* Live Month Collection Report (تقرير التحصيل للشهر المحدد) */}
          <div className="flex items-center gap-2 flex-wrap bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-emerald-400/50 dark:border-emerald-500/40 text-xs font-black shadow-xs">
            <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span>✅ المسدد لـ {targetQuickMonth.split(' ')[0]}:</span>
              <span className="font-mono font-black">{groupSummary.paidCount} طالب</span>
              <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-lg font-bold">
                ({groupSummary.totalCollectedInGroup.toLocaleString()} ج.م)
              </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span>⏳ المتأخرات والمستحق:</span>
              <span className="font-mono font-black">{groupSummary.dueCount} طالب</span>
              <span className="font-mono text-[11px] text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-lg font-bold">
                ({groupSummary.totalRemainingInGroup.toLocaleString()} ج.م)
              </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <span>🎯 نسبة السداد:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{groupSummary.collectionRate}%</span>
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            💡 اضغط زرار "⚡ سداد" أمام أي طالب لتسجيل دفعه فوراً بدون استمارات!
          </p>
        </div>

        {groupSummary.dueCount > 0 && (
          <button
            onClick={handleQuickBatchPayGroup}
            disabled={isQuickBatchPaying}
            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {isQuickBatchPaying
                ? 'جاري التسديد الجماعي...'
                : `⚡ تسديد جميع غير المسددين لـ (${targetQuickMonth}) بنقرة واحدة (${groupSummary.dueCount} طالب)`}
            </span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            جميع الطلاب ({groupTrainees.length})
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المسددون لـ {targetQuickMonth.split(' ')[0]} ({groupSummary.paidCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('notDueYet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
              statusFilter === 'notDueYet'
                ? 'bg-sky-600 text-white font-black shadow-md shadow-sky-600/30 ring-2 ring-sky-400'
                : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>غير مستحق حتى الآن ({groupSummary.notDueCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
              statusFilter === 'due'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مستحق السداد ({groupSummary.dueCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('exempt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
              statusFilter === 'exempt'
                ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                : 'bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-400 hover:text-purple-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>المعفون والمنح ({groupSummary.exemptCount})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          المعروض: {displayedTrainees.length} طالب
        </span>
      </div>

      {/* Trainees Table / Roster */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 font-black">
              <tr>
                <th className="p-3.5">الطالب / الكود</th>
                <th className="p-3.5">بيانات التواصل والواتساب</th>
                <th className="p-3.5">الرسوم والمطلوب</th>
                <th className="p-3.5">حالة السداد والاستحقاق</th>
                <th className="p-3.5">آخر إيصال معتمد</th>
                <th className="p-3.5 text-center">إجراءات التحصيل المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {displayedTrainees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-300">لا يوجد طلاب يطابقون خيارات البحث أو التصفية في هذه المجموعة</p>
                  </td>
                </tr>
              ) : (
                displayedTrainees.map((trainee) => {
                  const info = getTraineeFinancialInfo(trainee);
                  const hasParentPhone = Boolean(trainee.parentPhone || trainee.phone);

                  return (
                    <tr key={trainee.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                            {trainee.photoUrl ? (
                              <img src={trainee.photoUrl} alt={trainee.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-black text-amber-600 dark:text-amber-400">{trainee.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-sm">{trainee.fullName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                                {trainee.code || 'بدون كود'}
                              </span>
                              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 font-bold">
                                📍 {branches.find(b => b.id === (trainee.branchId || groups.find(g => g.id === trainee.groupId)?.branchId))?.name || (trainee.branchId === 'branch-1' ? 'فرع النجاح' : 'فرع بدر')}
                              </span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded font-bold">
                                👥 {groups.find(g => g.id === trainee.groupId)?.name || trainee.groupName || 'مجموعة غير محددة'}
                              </span>
                              {info.isExempt && (
                                <span className="text-[10px] text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-500/20 font-bold">
                                  معفى
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contacts & WhatsApp */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            <span className="font-mono dir-ltr font-medium">{trainee.parentPhone || trainee.phone || 'غير مسجل'}</span>
                          </div>
                          {hasParentPhone && (
                            <button
                              onClick={() => handleDirectWhatsApp(trainee)}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold flex items-center gap-1 transition-all"
                              title="إرسال رسالة تذكير أو إيصال عبر واتساب"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>مراسلة واتساب فورية</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Fees */}
                      <td className="p-3.5">
                        {info.isExempt ? (
                          <div className="space-y-0.5">
                            <div className="font-black text-purple-800 dark:text-purple-300">
                              المطلوب: <span className="font-mono text-emerald-600 dark:text-emerald-400">0 ج.م</span>
                            </div>
                            <div className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                              (إعفاء كامل 100%)
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              المتبقي: 0 ج.م
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              المطلوب: <span className="font-mono text-emerald-600 dark:text-emerald-400">{info.net} ج.م</span>
                            </div>
                            {info.discount > 0 && (
                              <div className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                                (خصم: {info.discount} ج.م)
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              المدفوع لـ {targetQuickMonth.split(' ')[0]}: {info.monthPaidAmount || 0} ج.م
                            </div>
                            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                              المتبقي: {info.monthRemainingAmount || 0} ج.م
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {info.isExempt ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-500/50 text-purple-800 dark:text-purple-300 text-[11px] font-black shadow-xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>معفى رسمياً (0 ج.م)</span>
                            </div>
                            <span className="block text-[10px] text-purple-700 dark:text-purple-400 font-bold">
                              {info.reasonLabel}
                            </span>
                          </div>
                        ) : info.isJoinedLater ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 text-[11px] font-bold shadow-xs">
                              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span>التحق لاحقاً ℹ️</span>
                            </div>
                            <span className="block text-[10px] text-sky-700 dark:text-sky-400/90 font-bold mt-1">
                              بدء الاشتراك: {info.joinMonthReadable}
                            </span>
                          </div>
                        ) : info.isPaidForTargetMonth ? (
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>مسدد {targetQuickMonth.split(' ')[0]} 🟢</span>
                            </div>
                            <span className="block text-[10px] text-emerald-700 dark:text-emerald-400/90 font-bold mt-1">
                              تم سداد شهر {targetQuickMonth.split(' ')[0]} بالكامل ✓
                            </span>
                          </div>
                        ) : info.isNotDueYet ? (
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 text-[11px] font-bold shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span>غير مستحق السداد حتى الآن ℹ️</span>
                            </div>
                            <span className="block text-[10px] text-sky-700 dark:text-sky-400/90 font-bold mt-1">
                              استحقاق 25 من {targetQuickMonth.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold shadow-xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>مستحق السداد {targetQuickMonth.split(' ')[0]} ({info.remaining || info.net} ج.م) ⏳</span>
                            </div>
                            <span className="block text-[10px] text-amber-700 dark:text-amber-400/80 mt-1 font-bold">
                              {targetQuickMonth.includes('أكتوبر') ? 'متأخرات غير مسددة' : `لم يسدد ${targetQuickMonth.split(' ')[0]} حتى الآن`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Latest Receipt */}
                      <td className="p-3.5">
                        {info.latestPayment ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => handlePrintReceiptForTrainee(trainee, info)}
                              className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-mono font-bold text-xs flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 transition-all shadow-xs cursor-pointer"
                              title="عرض وطباعة وإرسال سند القبض"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>#{info.latestPayment.receiptNumber || info.latestPayment.id}</span>
                            </button>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{info.latestPayment.date}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">
                            {info.isExempt ? 'إعفاء بدون سند نقدي' : info.isJoinedLater ? 'غير مسجل بهذا الشهر' : 'لا يوجد سند سابق'}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {info.isExempt ? (
                            <>
                              <button
                                onClick={() => handleOpenCollection(trainee)}
                                className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/70 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-500/40 text-purple-800 dark:text-purple-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                title="فحص أو تعديل الإعفاء المالي"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span>فحص الإعفاء (0 ج.م) 🛡️</span>
                              </button>
                            </>
                          ) : info.isJoinedLater ? (
                            <>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-black shadow-xs">
                                <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                <span>التحق لاحقاً ({info.joinMonthReadable}) ℹ️</span>
                              </div>

                              <button
                                onClick={() => handleOpenCollection(trainee)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-all cursor-pointer"
                                title="تسجيل سداد مسبق أو تخصيص"
                              >
                                ⚙️
                              </button>
                            </>
                          ) : info.isPaidForTargetMonth ? (
                            <>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-black shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>تم السداد لـ {targetQuickMonth.split(' ')[0]} 🟢</span>
                              </div>
                              {info.latestPayment && (
                                <button
                                  onClick={() => handlePrintReceiptForTrainee(trainee, info)}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title={`عرض وطباعة سند ${targetQuickMonth.split(' ')[0]}`}
                                >
                                  <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>وصل {targetQuickMonth.split(' ')[0]}</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {/* ⚡ ONE-CLICK IMMEDIATE PAYMENT BUTTON */}
                              <button
                                onClick={() => handleQuickPaySingle(trainee)}
                                disabled={quickPayingStudentId === trainee.id}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                title={`تسجيل سداد ${targetQuickMonth} فوراً بنقرة واحدة`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                  {quickPayingStudentId === trainee.id
                                    ? 'جاري السداد...'
                                    : `⚡ سداد ${targetQuickMonth.split(' ')[0]} (${info.remaining || info.net || info.baseFee || 200} ج.م)`}
                                </span>
                              </button>

                              {(info.latestPayment || trainee.paidAmount > 0 || trainee.lastReceiptNumber) && (
                                <button
                                  onClick={() => handlePrintReceiptForTrainee(trainee, info)}
                                  className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title={`طباعة سند القبض السابق (${info.latestPayment?.targetMonth || 'سند سابق'})`}
                                >
                                  <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>🖨️ وصل {info.latestPayment?.targetMonth ? info.latestPayment.targetMonth.split(' ')[0] : 'سابق'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenCollection(trainee)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-all cursor-pointer"
                                title="تخصيص السداد / تقسيط / خصم"
                              >
                                ⚙️
                              </button>
                            </>
                          )}
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

      {/* QUICK CASH COLLECTION & RECEIPT ISSUANCE MODAL */}
      {isCollectionModalOpen && selectedTraineeForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">استلام وتحصيل نقدي فوري بالخزينة</h3>
                  <p className="text-[11px] text-slate-400">إصدار سند مالي معتمد وتحديث الاستحقاق للشهر المقبل</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              {/* Selected Trainee Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">اسم الطالب:</span>
                  <span className="font-black text-white text-sm">{selectedTraineeForPayment.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">كود الطالب:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedTraineeForPayment.code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">المجموعة:</span>
                  <span className="font-bold text-indigo-300">{currentGroup?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">رقم ولي الأمر المسجل:</span>
                  <span className="font-mono text-emerald-400 font-bold dir-ltr">{selectedTraineeForPayment.parentPhone || selectedTraineeForPayment.phone || 'غير مسجل'}</span>
                </div>
              </div>

              {/* Amount & Method Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المبلغ المحصل نقداً (ج.م): <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      disabled={isExemptToggle}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-base font-black text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">EGP</span>
                  </div>
                  <p className="text-[10px] text-emerald-400/80 mt-1 italic">
                    تفنيد المبلغ: {numberToArabicWords(paymentAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    طريقة الدفع / وسيلة التحصيل:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="cash">💵 نقداً الخزينة المركزية (Cash)</option>
                    <option value="vodafone_cash">📱 فودافون كاش (Vodafone Cash)</option>
                    <option value="instapay">⚡ انستا باي (InstaPay)</option>
                    <option value="visa">💳 بطاقة إلكترونية / فيزا</option>
                    <option value="bank_transfer">🏛️ تحويل بنكي</option>
                  </select>
                </div>
              </div>

              {/* Target Month & Next Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    عن شهر / فترة:
                  </label>
                  <input
                    type="text"
                    value={paymentTargetMonth}
                    onChange={(e) => setPaymentTargetMonth(e.target.value)}
                    placeholder="مثال: سبتمبر 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentTargetMonth('سبتمبر 2026 (شهر 9)');
                        setNextDueDateInput('2026-10-25');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    >
                      شهر 9 (سبتمبر)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentTargetMonth('أكتوبر 2026 (شهر 10)');
                        setNextDueDateInput('2026-11-25');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    >
                      شهر 10 (أكتوبر)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentTargetMonth('سبتمبر + أكتوبر 2026 (شهرين)');
                        setPaymentAmount(400);
                        setNextDueDateInput('2026-11-25');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 text-[10px] font-bold border border-emerald-700/60 cursor-pointer"
                    >
                      شهرين 9 + 10 (400 ج.م)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    تاريخ استحقاق الشهر القادم:
                  </label>
                  <input
                    type="date"
                    value={nextDueDateInput}
                    onChange={(e) => setNextDueDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">يتحول الطالب تلقائياً إلى "مسدد" حتى هذا التاريخ</p>
                </div>
              </div>

              {/* Financial Manager Privileges: Discounts & Exemption */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-purple-400" />
                    صلاحيات الخصم والإعفاء المالي:
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExemptToggle}
                      onChange={(e) => {
                        setIsExemptToggle(e.target.checked);
                        if (e.target.checked) setPaymentAmount(0);
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-[11px] text-purple-300 font-bold">إقرار إعفاء كامل</span>
                  </label>
                </div>

                {isExemptToggle ? (
                  <div>
                    <label className="block text-[10px] text-slate-300 mb-1 font-bold">سبب الإعفاء:</label>
                    <select
                      value={exemptReasonSelect}
                      onChange={(e: any) => setExemptReasonSelect(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-purple-300 focus:outline-none"
                    >
                      <option value="management_children">👑 أبناء الإدارة والمالكين</option>
                      <option value="friend_children">🤝 أبناء المعارف والأصدقاء</option>
                      <option value="scholarship">🎓 منحة دراسية / تفوق</option>
                      <option value="other">📌 ظروف استثنائية أخرى</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-300 mb-1">قيمة الخصم المعتمد (ج.م):</label>
                      <input
                        type="number"
                        min="0"
                        value={applyDiscount}
                        onChange={(e) => setApplyDiscount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">ملاحظات التحصيل (اختياري):</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="ملاحظات سند القبض..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isSubmittingPayment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmittingPayment ? (
                  <span>جاري تسجيل السند والاعتماد...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد استلام المبلغ وإصدار الإيصال الرسمي 🧾</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {isReceiptModalOpen && activeReceiptPayment && (
        <OfficialReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          payment={activeReceiptPayment}
          centerSettings={settings || undefined}
        />
      )}
    </div>
  );
};
