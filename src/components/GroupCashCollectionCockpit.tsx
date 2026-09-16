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
  Sparkles
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trainee, Group, Payment, Course, Branch } from '../types';
import { OfficialReceiptModal } from './OfficialReceiptModal';
import { numberToArabicWords } from '../utils/numberToArabicWords';

export const GroupCashCollectionCockpit: React.FC = () => {
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
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);

  const loadAllPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    try {
      const data = await api.getPayments();
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  // Trainees in Selected Group / Scope
  const groupTrainees = useMemo(() => {
    const list = trainees || [];
    return list.filter(t => {
      if (selectedBranchId !== 'all' && t.branchId && t.branchId !== selectedBranchId) return false;
      if (selectedGroupId !== 'all' && t.groupId !== selectedGroupId) return false;
      return true;
    });
  }, [trainees, selectedBranchId, selectedGroupId]);

  // Helpers to calculate financial status for a student
  const getTraineeFinancialInfo = (t: Trainee) => {
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
    const paid = t.paidAmount || 0;
    const remaining = isExempt ? 0 : Math.max(0, net - paid);
    
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

    // Determine if student is paid for next month
    const today = new Date().toISOString().split('T')[0];
    let isPaidUntilNextMonth = false;
    if (isExempt) {
      isPaidUntilNextMonth = true; // Exempt student has no pending debt
    } else if (t.nextPaymentDueDate) {
      isPaidUntilNextMonth = t.nextPaymentDueDate > today;
    } else if (paid > 0 && remaining === 0) {
      isPaidUntilNextMonth = true;
    }

    // Latest payment record
    const traineePayments = (paymentsList || []).filter(p => p.traineeId === t.id && p.status !== 'rejected');
    const latestPayment = traineePayments.length > 0 ? traineePayments[traineePayments.length - 1] : null;

    return {
      baseFee,
      discount,
      net,
      paid,
      remaining,
      isExempt,
      reasonLabel,
      isPaidUntilNextMonth,
      latestPayment,
      nextPaymentDueDate: t.nextPaymentDueDate
    };
  };

  // Group Summary Calculations
  const groupSummary = useMemo(() => {
    let totalStudents = groupTrainees.length;
    let paidCount = 0;
    let dueCount = 0;
    let exemptCount = 0;
    let totalCollectedInGroup = 0;
    let totalRemainingInGroup = 0;

    groupTrainees.forEach(t => {
      const info = getTraineeFinancialInfo(t);
      if (info.isExempt) {
        exemptCount++;
      } else if (info.isPaidUntilNextMonth) {
        paidCount++;
      } else {
        dueCount++;
      }
      totalCollectedInGroup += info.paid;
      totalRemainingInGroup += info.remaining;
    });

    return {
      totalStudents,
      paidCount,
      dueCount,
      exemptCount,
      totalCollectedInGroup,
      totalRemainingInGroup
    };
  }, [groupTrainees, paymentsList, currentCourse]);

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
        if (statusFilter === 'paid' && (!info.isPaidUntilNextMonth || info.isExempt)) return false;
        if (statusFilter === 'due' && (info.isPaidUntilNextMonth || info.isExempt)) return false;
        if (statusFilter === 'exempt' && !info.isExempt) return false;
      }

      return true;
    });
  }, [groupTrainees, searchTerm, statusFilter, paymentsList]);

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

    // Default target month (current month in Arabic)
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    setPaymentTargetMonth(currentMonthName);

    // Default next due date = exactly 1 month from now
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setNextDueDateInput(nextMonth.toISOString().split('T')[0]);

    setIsCollectionModalOpen(true);
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

      // Create Payment via API
      const res = await api.createPayment({
        traineeId: selectedTraineeForPayment.id,
        amount: isExemptToggle ? 0 : Number(paymentAmount),
        paymentMethod,
        targetMonth: paymentTargetMonth,
        notes: paymentNotes,
        receivedByUserId: user?.id || 'admin',
        receivedByUserName: user?.fullName || 'المدير المالي والخزينة',
        branchId: selectedTraineeForPayment.branchId,
        courseId: selectedTraineeForPayment.courseId,
        parentPhone: selectedTraineeForPayment.parentPhone || selectedTraineeForPayment.phone,
        traineePhone: selectedTraineeForPayment.phone,
        discountAmount: finalDiscount,
        isExempt: isExemptToggle,
        exemptReason: isExemptToggle ? exemptReasonSelect : undefined,
        nextDueDate: nextDueDateInput,
        paidMonths: [paymentTargetMonth]
      });

      if (res?.payment) {
        // Refresh local data
        await loadAllPayments();
        await refreshCoreData(true);

        setIsCollectionModalOpen(false);
        setSuccessToast(`تم تحصيل ${paymentAmount} ج.م بنجاح وتحويل حالة الطالب إلى "مسدد حتى ${nextDueDateInput}" 🟢`);
        showToast(`تم تسجيل السند رقم #${res.payment.receiptNumber || res.payment.id} بنجاح`, 'success');
        setTimeout(() => setSuccessToast(null), 4000);

        // Open Official Receipt Modal instantly!
        setActiveReceiptPayment(res.payment);
        setIsReceiptModalOpen(true);
      }
    } catch (err: any) {
      console.error('Payment collection error:', err);
      alert('حدث خطأ أثناء حفظ سند التحصيل: ' + (err.message || 'خطأ في الاتصال'));
    } finally {
      setIsSubmittingPayment(false);
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة التحصيل المالي المباشر للمجموعات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <DollarSign className="w-7 h-7 text-emerald-400 p-1 bg-emerald-950/60 border border-emerald-500/40 rounded-xl" />
              تحصيل المجموعات الفوري وإصدار الإيصالات المعتمدة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              اختر المجموعة والفرع، واستلم المبالغ نقدياً بنقرة واحدة، مع إصدار فوري للإيصال الرسمي، والتحديث التلقائي لحالة السداد حتى الشهر المقبل، مع الإرسال المباشر عبر واتساب والأرشفة السحابية.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="bg-slate-950/70 border border-slate-700 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">الأرشفة السحابية</span>
                <span className="text-xs font-bold text-emerald-300">Google Drive موثق ✅</span>
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
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Branch Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>تصفية حسب الفرع:</span>
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedGroupId('');
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">🏢 جميع الفروع المركزية</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>📍 {b.name}</option>
            ))}
          </select>
        </div>

        {/* Group Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>اختر المجموعة التدريبية:</span>
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>بحث فوري في الطلاب (اسم، كود، هاتف):</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="اسم الطالب، الكود، أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Group Quick Analytics Stats */}
      {currentGroup && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">إجمالي طلاب المجموعة</span>
              <span className="text-lg font-black text-white font-mono">{groupSummary.totalStudents}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-bold">مسدد حتى الشهر المقبل</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{groupSummary.paidCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-amber-400 block font-bold">مستحق السداد حالياً</span>
              <span className="text-lg font-black text-amber-400 font-mono">{groupSummary.dueCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-purple-400 block font-bold">معفى / خصومات خاصة</span>
              <span className="text-lg font-black text-purple-400 font-mono">{groupSummary.exemptCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">المحصل الفعلي (ج.م)</span>
              <span className="text-lg font-black text-emerald-300 font-mono">{groupSummary.totalCollectedInGroup.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            جميع الطلاب ({groupTrainees.length})
          </button>

          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'due'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-amber-950/40 border border-amber-500/30 text-amber-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>مستحق السداد ({groupSummary.dueCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white font-black shadow'
                : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المسددون بالكامل ({groupSummary.paidCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('exempt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'exempt'
                ? 'bg-purple-600 text-white font-black shadow'
                : 'bg-purple-950/40 border border-purple-500/30 text-purple-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>المعفون والمنح ({groupSummary.exemptCount})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-bold">
          المعروض: {displayedTrainees.length} طالب
        </span>
      </div>

      {/* Trainees Table / Roster */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-700 font-black">
              <tr>
                <th className="p-3.5">الطالب / الكود</th>
                <th className="p-3.5">بيانات التواصل والواتساب</th>
                <th className="p-3.5">الرسوم والمطلوب</th>
                <th className="p-3.5">حالة السداد والاستحقاق</th>
                <th className="p-3.5">آخر إيصال معتمد</th>
                <th className="p-3.5 text-center">إجراءات التحصيل المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {displayedTrainees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-sm">لا يوجد طلاب يطابقون خيارات البحث أو التصفية في هذه المجموعة</p>
                  </td>
                </tr>
              ) : (
                displayedTrainees.map((trainee) => {
                  const info = getTraineeFinancialInfo(trainee);
                  const hasParentPhone = Boolean(trainee.parentPhone || trainee.phone);

                  return (
                    <tr key={trainee.id} className="hover:bg-slate-700/30 transition-colors">
                      {/* Student Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-700/70 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                            {trainee.photoUrl ? (
                              <img src={trainee.photoUrl} alt={trainee.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-black text-amber-400">{trainee.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-black text-white block text-sm">{trainee.fullName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {trainee.code || 'بدون كود'}
                              </span>
                              {info.isExempt && (
                                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20 font-bold">
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
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono dir-ltr">{trainee.parentPhone || trainee.phone || 'غير مسجل'}</span>
                          </div>
                          {hasParentPhone && (
                            <button
                              onClick={() => handleDirectWhatsApp(trainee)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-all"
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
                            <div className="font-black text-purple-300">
                              المطلوب: <span className="font-mono text-emerald-400">0 ج.م</span>
                            </div>
                            <div className="text-[10px] text-purple-400 font-bold">
                              (إعفاء كامل 100%)
                            </div>
                            <div className="text-[10px] text-slate-400">
                              المتبقي: 0 ج.م
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-bold text-white">
                              الصافي: <span className="font-mono text-emerald-400">{info.net} ج.م</span>
                            </div>
                            {info.discount > 0 && (
                              <div className="text-[10px] text-purple-400">
                                (خصم: {info.discount} ج.م)
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400">
                              المدفوع: {info.paid} ج.م
                            </div>
                            <div className="text-[10px] text-amber-400 font-bold">
                              المتبقي: {info.remaining} ج.م
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {info.isExempt ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-500/50 text-purple-300 text-[11px] font-black shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>معفى رسمياً (0 ج.م)</span>
                            </div>
                            <span className="block text-[10px] text-purple-400 font-bold">
                              {info.reasonLabel}
                            </span>
                          </div>
                        ) : info.isPaidUntilNextMonth ? (
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>مسدد بالكامل 🟢</span>
                            </div>
                            <span className="block text-[10px] text-emerald-400/90 font-bold mt-1 dir-ltr">
                              حتى: {info.nextPaymentDueDate || 'الشهر المقبل'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>مستحق السداد ({info.remaining || info.net} ج.م)</span>
                            </div>
                            <span className="block text-[10px] text-amber-400/80 mt-1">
                              الشهر الحالي
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Latest Receipt */}
                      <td className="p-3.5">
                        {info.latestPayment ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setActiveReceiptPayment(info.latestPayment);
                                setIsReceiptModalOpen(true);
                              }}
                              className="text-amber-400 hover:text-amber-300 font-mono font-bold text-xs flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-all"
                              title="عرض وطباعة وإرسال سند القبض"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>#{info.latestPayment.receiptNumber || info.latestPayment.id}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 block">{info.latestPayment.date}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">
                            {info.isExempt ? 'إعفاء بدون سند نقدي' : 'لا يوجد سند سابق'}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {info.isExempt ? (
                            <button
                              onClick={() => handleOpenCollection(trainee)}
                              className="px-2.5 py-1.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                              title="فحص أو تعديل الإعفاء المالي"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                              <span>فحص الإعفاء (0 ج.م) 🛡️</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCollection(trainee)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                              title="تحصيل نقدي بالخزينة وإصدار إيصال معتمد"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>تحصيل / دفع 💵</span>
                            </button>
                          )}

                          {info.latestPayment && (
                            <button
                              onClick={() => {
                                setActiveReceiptPayment(info.latestPayment);
                                setIsReceiptModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
                              title="طباعة / واتساب الإيصال"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                            </button>
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
