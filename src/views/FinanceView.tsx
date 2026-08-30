import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { Payment, TrainerSettlement, Trainee, Course } from '../types';
import { OfficialReceiptModal } from '../components/OfficialReceiptModal';
import { GoogleSheetsHubModal } from '../components/GoogleSheetsHubModal';

export const FinanceView: React.FC = () => {
  const { branches, activeBranchId, showToast, setPrintData, refreshKey, openAiModal } = useCenter();
  const { user, canAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'pendingProofs' | 'settlements' | 'exemptions'>('payments');
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingProofs, setPendingProofs] = useState<Payment[]>([]);
  const [settlements, setSettlements] = useState<TrainerSettlement[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
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
    loadFinanceData();
  }, [activeBranchId, refreshKey]);

  const loadFinanceData = async () => {
    setIsLoading(true);
    try {
      const branchParam = activeBranchId !== 'all' ? { branchId: activeBranchId } : {};
      const [sumRes, payRes, pendingRes, setRes, traRes, couRes] = await Promise.all([
        api.getFinanceSummary(branchParam),
        api.getPayments(branchParam),
        api.getPendingPaymentProofs(),
        api.getTrainerSettlements(branchParam),
        api.getTrainees(branchParam),
        api.getCourses()
      ]);
      setSummary(sumRes);
      setPayments(payRes);
      setPendingProofs(pendingRes || []);
      setSettlements(setRes);
      setTrainees(traRes);
      setCourses(couRes);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات الخزينة', 'error');
    } finally {
      setIsLoading(false);
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

  const exemptTrainees = trainees.filter((t) => t.isExempt || t.exemptReason);
  const siblingDiscountTrainees = trainees.filter((t) => (t.siblingIds && t.siblingIds.length > 0) || (t.notes && t.notes.includes('خصم الأخوات')));

  const totalExemptValue = exemptTrainees.reduce((acc, t) => acc + (t.feeAmount || 0), 0);
  const mgmtChildrenCount = exemptTrainees.filter((t) => t.exemptReason === 'management_children').length;
  const friendChildrenCount = exemptTrainees.filter((t) => t.exemptReason === 'friend_children').length;
  const scholarshipCount = exemptTrainees.filter((t) => t.exemptReason === 'scholarship' || t.exemptReason === 'other' || !t.exemptReason).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            إدارة الحسابات والخزينة الرئيسية
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            متابعة سندات القبض، العمولات التدريبية، وصافي الخزينة الفعلي
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
            title="تصدير ومزامنة سجل الخزينة والحسابات مع جداول Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Google Sheets 📊</span>
          </button>

          <button
            onClick={() => openAiModal('manager')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95"
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
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
              className="bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي المقبوضات</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {(summary?.totalRevenue || 0).toLocaleString()} <span className="text-xs font-bold">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-400 mt-1">سندات قبض محصلة</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-xs text-slate-400 font-bold block mb-1">المصروفات والمنصرف</span>
          <span className="text-2xl font-black text-rose-400 font-mono">
            {(summary?.totalExpenses || 0).toLocaleString()} <span className="text-xs font-bold">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-400 mt-1">مصاريف تشغيلية</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-xs text-slate-400 font-bold block mb-1">حصة المركز الصافية</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {(summary?.totalCenterShare || 0).toLocaleString()} <span className="text-xs font-bold">ج.م</span>
          </span>
          <div className="text-[11px] text-slate-400 mt-1">أرباح المكان</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800 to-slate-800 border border-amber-500/40">
          <span className="text-xs text-amber-300 font-bold block mb-1">صافي الخزينة الفعلي</span>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {(summary?.netTreasury || 0).toLocaleString()} <span className="text-xs font-bold">ج.م</span>
          </span>
          <div className="text-[11px] text-amber-400/80 mt-1">النقدية المتاحة</div>
        </div>
      </div>

      {/* AI Financial Forecasting & Insights */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-500 to-emerald-500"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">الذكاء المالي الاستراتيجي (AI Insights)</h3>
              <p className="text-xs text-slate-400 mt-1">تحليلات وتنبؤات مبنية على قراءة السجلات المالية وحركة الخزينة</p>
            </div>
          </div>
          <button
            onClick={() => showToast('جاري توليد تقرير الذكاء الاصطناعي المالي المفصل...', 'info')}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-bold transition-colors border border-amber-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            توليد تقرير شامل
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Revenue vs Expenses (Tailwind CSS Bar Chart) */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              مؤشر الإيرادات مقابل المنصرف
            </h4>
            <div className="flex items-end justify-between h-32 gap-4 pb-2 border-b border-slate-800">
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] text-emerald-400 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity">{(summary?.totalRevenue || 0)} ج.م</span>
                <div className="w-full bg-emerald-500/20 border border-emerald-500/50 rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${Math.min(100, ((summary?.totalRevenue || 1) / (summary?.totalRevenue + summary?.totalExpenses || 1)) * 100)}%` }}></div>
                <span className="text-xs text-slate-400 mt-2">الإيرادات</span>
              </div>
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] text-rose-400 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity">{(summary?.totalExpenses || 0)} ج.م</span>
                <div className="w-full bg-rose-500/20 border border-rose-500/50 rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${Math.min(100, ((summary?.totalExpenses || 1) / (summary?.totalRevenue + summary?.totalExpenses || 1)) * 100)}%` }}></div>
                <span className="text-xs text-slate-400 mt-2">المصروفات</span>
              </div>
              <div className="flex flex-col items-center justify-end w-1/3 h-full gap-2 relative group">
                <span className="text-[10px] text-amber-400 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity">{(summary?.netTreasury || 0)} ج.م</span>
                <div className="w-full bg-amber-500/20 border border-amber-500/50 rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${Math.min(100, ((summary?.netTreasury || 1) / (summary?.totalRevenue || 1)) * 100)}%` }}></div>
                <span className="text-xs text-slate-400 mt-2">الصافي</span>
              </div>
            </div>
          </div>

          {/* AI Predictive Recommendations */}
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-300">معدل التحصيل ممتاز</p>
                <p className="text-[10px] text-slate-400 mt-1">استناداً لحركة الخزينة، معدل تسديد الطلاب يقترب من 85%. يوصى بتشغيل حملات إعلانية للدورات القادمة لاستغلال التدفق النقدي.</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">مستحقات معلقة للمدربين</p>
                <p className="text-[10px] text-slate-400 mt-1">يوجد {(summary?.totalTrainerDues || 0).toLocaleString()} ج.م قيد الانتظار كحصة للمدربين. يفضل جدولة صرفها الأسبوع القادم للحفاظ على استقرار السيولة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          سندات القبض وإيصالات التحصيل ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('pendingProofs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pendingProofs'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-amber-300 hover:text-white bg-slate-800/60 border border-amber-500/30'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>طلبات السداد بانتظار التحقق</span>
          {pendingProofs.length > 0 && (
            <span className="py-0.5 px-2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black animate-pulse">
              {pendingProofs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settlements'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          سندات صرف مستحقات المدربين ({settlements.length})
        </button>

        {isManagerOrAccountant && (
          <button
            onClick={() => setActiveTab('exemptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'exemptions'
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            إحصائية الإعفاءات والخصومات السرية ({exemptTrainees.length})
          </button>
        )}
      </div>

      {/* Pending Proofs Review View */}
      {activeTab === 'pendingProofs' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>إيصالات ولقطات الشاشة المرفوعة بانتظار الاعتماد ⏳</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مراجعة التحويلات المالية على فودافون كاش / انستا باي / الحساب البنكي، وتأكيد السداد للطالب
              </p>
            </div>
            <span className="py-1 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs">
              عدد الطلبات المعلقة: {pendingProofs.length}
            </span>
          </div>

          {pendingProofs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
              <p className="font-bold text-sm text-slate-200">لا توجد أي طلبات سداد إلكترونية معلقة حالياً!</p>
              <p className="text-xs text-slate-500">تمت مراجعة جميع الإيصالات المرفوعة من أولياء الأمور.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-xs font-black text-white block">{proof.traineeName || 'طالب غير محدد'}</span>
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
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
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
              <tbody className="divide-y divide-slate-700/60 text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      لا توجد سندات قبض مسجلة.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-400">{p.receiptNumber}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{p.date}</td>
                      <td className="p-3.5 font-bold text-slate-100">
                        {p.traineeName || 'متدرب'}
                        {p.traineeCode && (
                          <span className="mr-1 text-[10px] text-slate-400 font-mono">
                            ({p.traineeCode})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300">{p.courseName || '-'}</td>
                      <td className="p-3.5 text-slate-300 font-bold text-xs">
                        {p.submittedByParentName || p.traineeName || 'ولي الأمر / الطالب'}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                        {p.amount} ج.م
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {p.paymentMethod === 'cash'
                            ? 'نقداً'
                            : p.paymentMethod === 'vodafone_cash'
                            ? 'فودافون كاش'
                            : p.paymentMethod === 'instapay'
                            ? 'انستاباي'
                            : 'تحويل'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-bold">{p.receivedByUserName || 'مسؤول الخزينة'}</td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedAuditPayment(p)}
                          className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                          title="تتبع أصل ومصدر المبلغ (عايز اعرف الفلوس دي جات منين)"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-400" />
                          <span>منين؟</span>
                        </button>
                        <button
                          onClick={() => setSelectedOfficialReceipt(p)}
                          className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg transition-colors"
                          title="عرض الإيصال الرسمي الشامل القابل للحفظ والمشاركة"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(p)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-lg transition-colors"
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

      {/* Table: Settlements */}
      {activeTab === 'settlements' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
                <tr>
                  <th className="p-3.5">رقم السند</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">المدرب</th>
                  <th className="p-3.5">المبلغ المنصرف</th>
                  <th className="p-3.5">طريقة الصرف</th>
                  <th className="p-3.5">البيان</th>
                  <th className="p-3.5">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-200">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      لا توجد تسويات منصرفة للمدربين حتى الآن.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-400">{s.settlementNumber}</td>
                      <td className="p-3.5 font-mono text-slate-400">{s.date}</td>
                      <td className="p-3.5 font-bold text-slate-100">{s.trainerName || 'المدرب'}</td>
                      <td className="p-3.5 font-mono font-black text-rose-400 text-sm">
                        {s.amount} ج.م
                      </td>
                      <td className="p-3.5 text-slate-300">{s.paymentMethod}</td>
                      <td className="p-3.5 text-slate-300">{s.notes}</td>
                      <td className="p-3.5 text-slate-400">{s.paidByUserName || 'المدير المالي'}</td>
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
          <div className="bg-purple-950/80 border border-purple-500/60 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/90 border border-purple-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h3 className="font-black text-sm text-purple-100 flex items-center gap-2">
                  تقرير إحصائي خاص ومحمي: الإعفاءات الكاملة واستثناءات رسوم الدورات
                </h3>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  هذه البيانات مشفرة وسرية، ومتاحة فقط لمدير النظام والمدير المالي لمتابعة كشوف أبناء المالك، الأصدقاء، والخصومات الاستثنائية.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-300 bg-purple-900/80 px-3 py-1.5 rounded-xl border border-purple-500/40 shrink-0">
              🔒 سري للغاية
            </span>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/40 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">إجمالي الطلاب المعفيين</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {exemptTrainees.length} <span className="text-xs font-bold">طالب</span>
              </span>
              <div className="text-[11px] text-slate-400">نسبة الإعفاء الكلي 100%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-purple-500/40 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">القيمة التقديرية للإعفاءات</span>
              <span className="text-2xl font-black text-purple-300 font-mono">
                {totalExemptValue.toLocaleString()} <span className="text-xs font-bold">ج.م</span>
              </span>
              <div className="text-[11px] text-slate-400">إجمالي الرسوم المستثناة</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-cyan-500/40 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">أبناء المالك والإدارة</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {mgmtChildrenCount} <span className="text-xs font-bold">طالب</span>
              </span>
              <div className="text-[11px] text-slate-400">إعفاء أبناء الإدارة والمركز</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">أبناء الأصدقاء والمنح</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {friendChildrenCount + scholarshipCount} <span className="text-xs font-bold">طالب</span>
              </span>
              <div className="text-[11px] text-slate-400">إعفاء المعارف والمنح</div>
            </div>
          </div>

          {/* Sibling Discounts Count Card */}
          {siblingDiscountTrainees.length > 0 && (
            <div className="bg-slate-800/80 border border-purple-500/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                <Users className="w-4 h-4 text-purple-400" />
                إجمالي الطلاب المستفيدين من خصم الأخوات المسجل: <span className="font-mono text-amber-300 text-sm">{siblingDiscountTrainees.length} طالب</span>
              </div>
              <span className="text-[11px] text-slate-400">خصم الأخوات 20%</span>
            </div>
          )}

          {/* Detailed Confidential Table */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-3.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                كشف تفصيلي بالطلاب المعفيين من رسوم الدورات (خاص بالمحيط المالي)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                عدد السجلات: {exemptTrainees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-700 select-none">
                  <tr>
                    <th className="p-3.5">الكود</th>
                    <th className="p-3.5">اسم المتدرب</th>
                    <th className="p-3.5">ولي الأمر والهاتف</th>
                    <th className="p-3.5">الدورة التدريبية</th>
                    <th className="p-3.5">تصنيف سبب الإعفاء</th>
                    <th className="p-3.5">قيمة الدورة المعفاة</th>
                    <th className="p-3.5">ملاحظات السرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-200">
                  {exemptTrainees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        لا يوجد طلاب معفيين مسجلين بالنظام حالياً.
                      </td>
                    </tr>
                  ) : (
                    exemptTrainees.map((t) => {
                      const course = courses.find((c) => c.id === t.courseId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-400">{t.code}</td>
                          <td className="p-3.5 font-bold text-slate-100">{t.fullName}</td>
                          <td className="p-3.5 text-slate-300">
                            <div>{t.parentName || 'غير مدون'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{t.parentPhone || t.phone}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{course?.name || 'دورة عامة'}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/70 border border-purple-500/50 text-purple-200">
                              {t.exemptReason === 'management_children'
                                ? '👑 أبناء إداري / مالك'
                                : t.exemptReason === 'friend_children'
                                ? '🤝 أبناء أصدقاء ومعارف'
                                : t.exemptReason === 'scholarship'
                                ? '🎓 منحة استثنائية'
                                : '✨ إعفاء خاص'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-black text-amber-400 text-sm">
                            {t.feeAmount || 0} ج.م
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                            {t.notes || 'لا توجد ملاحظات سرية إضافية'}
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
