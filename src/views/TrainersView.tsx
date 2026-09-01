import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { cloudDb } from '../services/cloudDatabase';
import {
  GraduationCap,
  Plus,
  Edit,
  DollarSign,
  Printer,
  Search,
  BookOpen,
  Phone,
  Mail,
  CheckCircle,
  X,
  CreditCard,
  Building,
  Calendar,
  Share2,
  Clock,
  Sparkles,
  MessageCircle,
  Trash2,
  Upload,
  Camera,
  User,
  Award,
  IdCard,
  FileText,
  ExternalLink,
  Copy,
  Smartphone,
  Download,
  Send,
  Lock,
  Key,
  RefreshCw
} from 'lucide-react';
import { Trainer, Course, Branch, LabScheduleSlot } from '../types';
import { formatTimeAMPM, timeToMinutes } from '../utils/timeFormat';
import { ShareTrainerRegistrationModal } from '../components/ShareTrainerRegistrationModal';
import { TrainerPortalModal } from '../components/TrainerPortalModal';
import { TrainerAttestationsManagerModal } from '../components/TrainerAttestationsManagerModal';
import { getPublicTrainerPortalUrl } from '../utils/urlHelper';

export const TrainersView: React.FC = () => {
  const { branches, activeBranchId, showToast, setPrintData, refreshKey } = useCenter();
  const { user } = useAuth();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'specialty' | 'dues'>('createdAt');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTrainerPortalModalOpen, setIsTrainerPortalModalOpen] = useState(false);
  const [isAttestationsModalOpen, setIsAttestationsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [passwordResetTrainer, setPasswordResetTrainer] = useState<Trainer | null>(null);
  const [passwordResetValue, setPasswordResetValue] = useState('');
  const [isSavingPasswordReset, setIsSavingPasswordReset] = useState(false);
  const [activeTrainer, setActiveTrainer] = useState<Trainer | null>(null);
  const [trainerScheduleSlots, setTrainerScheduleSlots] = useState<LabScheduleSlot[]>([]);
  const [scheduleSortMode, setScheduleSortMode] = useState<'time-asc' | 'time-desc' | 'group' | 'course'>('time-asc');
  const [scheduleSortOrder, setScheduleSortOrder] = useState<'time-asc' | 'time-desc' | 'group-name'>('time-asc');

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    qualification: '',
    specialty: '',
    photoUrl: '',
    commissionType: 'percentage',
    commissionValue: 50,
    commissionRate: 50,
    status: 'active',
    contractDate: new Date().toISOString().split('T')[0],
    notes: '',
    courseIds: [] as string[],
    branchId: ''
  });

  // Settlement Form State
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [settlementMethod, setSettlementMethod] = useState<string>('cash');
  const [settlementNotes, setSettlementNotes] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [activeBranchId, refreshKey]);

  useEffect(() => {
    // Realtime live subscription to cloud Firestore trainers
    const unsubscribe = cloudDb.listenToCollection<Trainer>('trainers', (cloudTrainers) => {
      if (cloudTrainers && Array.isArray(cloudTrainers)) {
        setTrainers(activeBranchId !== 'all' ? cloudTrainers.filter(t => t.branchId === activeBranchId) : cloudTrainers);
      }
    });
    return () => unsubscribe();
  }, [activeBranchId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const safeCall = async <T,>(p: Promise<T>): Promise<T | null> => {
        try { return await p; } catch (e) { console.warn('[TrainersView] API fetch warning:', e); return null; }
      };

      const [trainersRes, coursesRes] = await Promise.all([
        safeCall(api.getTrainers()),
        safeCall(api.getCourses())
      ]);

      if (Array.isArray(trainersRes)) {
        setTrainers(activeBranchId !== 'all' ? trainersRes.filter(t => t.branchId === activeBranchId) : trainersRes);
      }
      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات المدربين', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPasswordResetModal = (t: Trainer) => {
    setPasswordResetTrainer(t);
    const defaultPass = t.portalPassword || (t.code ? `${t.code}${t.code}` : '123456');
    setPasswordResetValue(defaultPass);
    setIsPasswordResetModalOpen(true);
  };

  const handleSavePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetTrainer) return;
    if (!passwordResetValue.trim()) {
      showToast('يرجى إدخال كلمة المرور', 'warning');
      return;
    }
    setIsSavingPasswordReset(true);
    try {
      const res = await api.updateTrainer(passwordResetTrainer.id, {
        portalPassword: passwordResetValue.trim()
      });
      if (res.success) {
        showToast(`تم تغيير وتعيين كلمة السر للمدرب (${passwordResetTrainer.name}) بنجاح 🔐`, 'success');
        setIsPasswordResetModalOpen(false);
        loadData();
      } else {
        showToast('فشل حفظ كلمة السر الجديدة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ كلمة السر', 'error');
    } finally {
      setIsSavingPasswordReset(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev: any) => ({ ...prev, photoUrl: base64 }));
      showToast('تم اختيار ورفع صورة المدرب بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  const generateNextTrainerCode = (prefix: 'DR' | 'ENG' | 'MR' | 'TR', list: Trainer[]) => {
    const matchingCodes = list
      .map(t => (t.code || '').toUpperCase().trim())
      .filter(c => c.startsWith(prefix));

    let maxSeq = 0;
    matchingCodes.forEach(c => {
      const numPart = parseInt(c.substring(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    });

    const seqStr = String(maxSeq + 1).padStart(2, '0');
    return `${prefix}${seqStr}`;
  };

  const handlePrefixSelect = (newPrefix: 'DR' | 'ENG' | 'MR' | 'TR') => {
    const nextCode = generateNextTrainerCode(newPrefix, trainers);
    setFormData((prev: any) => ({
      ...prev,
      prefix: newPrefix,
      title: newPrefix,
      code: nextCode,
      portalPassword: `${nextCode}${nextCode}`
    }));
  };

  const handleFixAllTrainerCodes = async () => {
    try {
      setIsLoading(true);
      const res = await api.fixTrainerCodes();
      if (res.success) {
        showToast(` تم إنجاز توحيد وتحديث أكواد ${res.count} مدرب بنجاح وفق الألقاب والبادئات (DR, ENG, MR, TR)!`, 'success');
        loadData();
      }
    } catch (err: any) {
      showToast('تعذر تحديث الأكواد: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    const defaultPrefix: 'DR' | 'ENG' | 'MR' | 'TR' = 'TR';
    const generatedCode = generateNextTrainerCode(defaultPrefix, trainers);
    setFormData({
      prefix: defaultPrefix,
      title: defaultPrefix,
      code: generatedCode,
      name: '',
      phone: '',
      email: '',
      nationalId: '',
      qualification: '',
      specialty: '',
      photoUrl: '',
      portalPassword: `${generatedCode}${generatedCode}`,
      commissionType: 'percentage',
      commissionValue: 50,
      commissionRate: 50,
      status: 'active',
      contractDate: new Date().toISOString().split('T')[0],
      notes: '',
      courseIds: (courses || []).slice(0, 1).map(c => c.id),
      branchId: activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('يرجى ملء الاسم ورقم الهاتف', 'warning');
      return;
    }

    const commVal = Number(formData.commissionValue ?? formData.commissionRate ?? 50);
    const payload = {
      ...formData,
      commissionValue: commVal,
      commissionRate: commVal
    };

    try {
      const res = await api.createTrainer(payload);
      if (res.success) {
        if (res.trainer) {
          
        }
        showToast(`تمت إضافة المدرب (${res.trainer.name}) بنجاح`, 'success');
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المدرب', 'error');
    }
  };

  const handleOpenEditModal = (t: Trainer) => {
    setActiveTrainer(t);
    const commVal = t.commissionValue ?? t.commissionRate ?? 50;
    const pref = (t.prefix || t.title || 'TR') as 'DR' | 'ENG' | 'MR' | 'TR';
    const code = t.code || generateNextTrainerCode(pref, trainers);
    setFormData({
      prefix: pref,
      title: pref,
      code: code,
      portalPassword: t.portalPassword || `${code}${code}`,
      name: t.name,
      phone: t.phone,
      email: t.email || '',
      nationalId: t.nationalId || '',
      qualification: t.qualification || '',
      specialty: t.specialty,
      photoUrl: t.photoUrl || '',
      commissionType: t.commissionType || 'percentage',
      commissionValue: commVal,
      commissionRate: commVal,
      status: t.status || 'active',
      contractDate: t.contractDate || new Date().toISOString().split('T')[0],
      notes: t.notes || '',
      courseIds: t.courseIds || [],
      branchId: t.branchId
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainer) return;

    const commVal = Number(formData.commissionValue ?? formData.commissionRate ?? 50);
    const payload = {
      ...formData,
      commissionValue: commVal,
      commissionRate: commVal
    };

    try {
      const res = await api.updateTrainer(activeTrainer.id, payload);
      if (res.success) {
        if (res.trainer) {
          
        }
        showToast('تم تعديل بيانات المدرب بنجاح', 'success');
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل المدرب', 'error');
    }
  };

  const handleOpenSettlement = (t: Trainer) => {
    setActiveTrainer(t);
    setSettlementAmount(t.remainingDues > 0 ? t.remainingDues : 1000);
    setSettlementMethod('cash');
    setSettlementNotes(`صرف مستحقات تدريبية للمدرب ${t.name}`);
    setIsSettlementModalOpen(true);
  };

  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainer || settlementAmount <= 0) return;

    try {
      const res = await api.createTrainerSettlement({
        trainerId: activeTrainer.id,
        branchId: activeTrainer.branchId,
        amount: settlementAmount,
        paymentMethod: settlementMethod,
        notes: settlementNotes,
        paidByUserId: user?.id,
        paidByUserName: user?.fullName
      });

      if (res.success) {
        showToast(`تم صرف مبلغ ${settlementAmount} ج.م للمدرب ${activeTrainer.name} بنجاح`, 'success');
        setIsSettlementModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل التسوية', 'error');
    }
  };

  const handlePrintStatement = (t: Trainer) => {
    const branchName = branches.find(b => b.id === t.branchId)?.name;
    setPrintData({
      title: `كشف حساب ومستحقات المدرب - ${t.name}`,
      type: 'statement',
      data: {
        trainer: t,
        branchName,
        totalEarnings: t.totalEarnings,
        paidAmount: t.paidAmount,
        remainingDues: t.remainingDues
      }
    });
  };

  const handleOpenTrainerSchedule = async (t: Trainer) => {
    setActiveTrainer(t);
    try {
      const res = await fetch('/api/lab-schedules');
      const data = await res.json();
      if (Array.isArray(data)) {
        const slots = data.filter((s: LabScheduleSlot) => s.trainerId === t.id || s.trainerName === t.name);
        setTrainerScheduleSlots(slots);
      }
    } catch (e) {
      console.error(e);
      setTrainerScheduleSlots([]);
    }
    setIsScheduleModalOpen(true);
  };

  const handleSendTrainerScheduleWhatsApp = (t: Trainer, slots: LabScheduleSlot[]) => {
    const phone = t.phone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? '2' + phone : phone;

    let msg = `*جدول الحصص والمحاضرات الأسبوعي للمعلم/المدرب: ${t.name}*\n`;
    msg += `🏛️ *مركز النجاح للتدريب والاستشارات*\n`;
    msg += `التخصص: ${t.specialty} | الهاتف: ${t.phone}\n`;
    msg += `------------------------------------\n`;

    if (!slots || slots.length === 0) {
      msg += `لا توجد حصص مسجلة في الجدول حالياً.\n`;
    } else {
      const daysOrder = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      daysOrder.forEach(day => {
        const daySlots = slots.filter(s => {
          if (s.dayOfWeek === day) return true;
          if (day === 'الإثنين' && (s.dayOfWeek === 'الاثنين' || s.dayOfWeek === 'الإثنين')) return true;
          if (day === 'الأحد' && (s.dayOfWeek === 'الاحد' || s.dayOfWeek === 'الأحد')) return true;
          if (day === 'الأربعاء' && (s.dayOfWeek === 'الاربعاء' || s.dayOfWeek === 'الأربعاء')) return true;
          return false;
        }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        if (daySlots.length > 0) {
          msg += `\n📅 *يوم ${day}:*\n`;
          daySlots.forEach(s => {
            msg += `   • من ${formatTimeAMPM(s.startTime)} إلى ${formatTimeAMPM(s.endTime)}\n`;
            msg += `     المجموعة: ${s.groupName} (${s.courseName})\n`;
            msg += `     القاعة: ${s.roomName}\n`;
          });
        }
      });
    }

    msg += `\nنتمنى لكم دوام التوفيق والنجاح! 🚀`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleOpenTrainerPortal = (tr?: Trainer | null) => {
    const url = getPublicTrainerPortalUrl(tr?.id);
    window.open(url, '_blank');
  };

  const handleCopyTrainerPortalLink = (tr?: Trainer | null) => {
    const url = getPublicTrainerPortalUrl(tr?.id);
    navigator.clipboard.writeText(url);
    showToast(tr ? `تم نسخ رابط بوابة المدرب (${tr.name}) بنجاح! 📋` : 'تم نسخ رابط بوابة المدرب العام بنجاح! 📋', 'success');
  };

  const handleSendTrainerPortalWhatsApp = (tr: Trainer) => {
    const url = getPublicTrainerPortalUrl(tr.id);
    const cleanPhone = (tr.phone || '').replace(/\D/g, '');
    let targetPhone = cleanPhone;
    if (targetPhone.startsWith('01')) targetPhone = '2' + targetPhone;

    const message = `مرحباً أستاذ ${tr.name} 👨‍🏫
يسعدنا إرسال رابط بوابة المدرب الخاصة بك في مركز النجاح للتدريب والاستشارات:

🔗 ${url}

من خلال البوابة يمكنك:
✅ تسجيل الحضور والغياب للطلاب بلمسة واحدة
✅ تصحيح وتقييم الواجبات بالذكاء الاصطناعي
✅ استخدام مساعد المدرب الذكي وصانع الاختبارات الفورية
✅ متابعة رصيدك المالي ومستحقاتك لحظياً
✅ تثبيت البوابة كتطبيق مباشر على الموبايل والكمبيوتر!

بالتوفيق دائماً 🌟`;

    const waUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredTrainers = (Array.isArray(trainers) ? trainers : []).filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const sortedTrainers = [...filteredTrainers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'specialty') return (a.specialty || '').localeCompare(b.specialty || '', 'ar');
    if (sortBy === 'dues') return (b.remainingDues || 0) - (a.remainingDues || 0);
    return 0;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            إدارة المدربين ومستحقاتهم المالية
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold">
              {trainers.length} مدرب
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            حساب العمولات ونسب الدورات، صرف المستحقات، وجدولة المحاضرات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
            title="ترتيب المدربين"
          >
            <option value="createdAt">ترتيب: تاريخ الإنشاء</option>
            <option value="name">ترتيب: اسم المدرب</option>
            <option value="specialty">ترتيب: التخصص</option>
            <option value="dues">ترتيب: المستحقات المالية</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم المدرب، التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => { setActiveTrainer(null); setIsTrainerPortalModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>بوابة المدرب (فتح ونشر وتنزيل)</span>
          </button>

          <button
            onClick={() => setIsAttestationsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-md transition-all"
            title="إصدار وعرض الإفادات والشهادات الرسمية للمدربين"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>إفادات وشهادات المدربين 📜</span>
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-xs shadow-md transition-all border border-slate-600"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>رابط التسجيل والباركود</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدرب جديد</span>
          </button>
        </div>
      </div>

      {/* Top Trainer Portal Hub Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-blue-950/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">بوابة المدرب الذكية (PWA & Web)</h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  رابط عام مباشر بدون حساب جوجل
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تسجيل الحضور، تقييم الواجبات، صانع الاختبارات بالذكاء الاصطناعي، ومتابعة المستحقات
              </p>
            </div>
          </div>

          {/* 5 Dedicated Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleFixAllTrainerCodes}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs border border-purple-500/40 shadow-md transition-all cursor-pointer"
              title="تعديل وتوحيد كل أكواد المدربين تسلسلياً (DR01, ENG01, MR01, TR01)"
            >
              <Award className="w-4 h-4 text-purple-300" />
              <span>توحيد الأكواد (DR, ENG...)</span>
            </button>

            <button
              onClick={() => handleOpenTrainerPortal(null)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="فتح بوابة المدرب في تبويب جديد"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح البوابة</span>
            </button>

            <button
              onClick={() => handleCopyTrainerPortalLink(null)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/30 shadow-md transition-all cursor-pointer"
              title="نشر ونسخ رابط البوابة العام"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>نشر / نسخ الرابط</span>
            </button>

            <button
              onClick={() => {
                if (trainers.length > 0) {
                  handleSendTrainerPortalWhatsApp(trainers[0]);
                } else {
                  showToast('يرجى تسجيل مدرب أولاً لإرسال الرابط', 'warning');
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="إرسال رابط البوابة للمدرب عبر واتساب"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الرابط</span>
            </button>

            <button
              onClick={() => { setActiveTrainer(null); setIsTrainerPortalModalOpen(true); }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="تنزيل وتثبيت تطبيق بوابة المدرب على الكمبيوتر والموبايل"
            >
              <Smartphone className="w-4 h-4" />
              <span>تنزيل التطبيق (كمبيوتر وموبايل)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            جاري تحميل سجلات المدربين...
          </div>
        ) : sortedTrainers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            لا يوجد مدربون مسجلون مطابقون للبحث.
          </div>
        ) : (
          sortedTrainers.map((tr) => {
            const branch = branches.find((b) => b.id === tr.branchId);

            return (
              <div
                key={tr.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      {tr.photoUrl ? (
                        <img
                          src={tr.photoUrl}
                          alt={tr.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow shrink-0">
                          {tr.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-100">{tr.name}</h3>
                          {tr.code && (
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 tracking-wider">
                              {tr.code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-400 font-semibold">{tr.specialty}</p>
                        {tr.qualification && (
                          <p className="text-[10px] text-slate-400 truncate">{tr.qualification}</p>
                        )}
                        <p className="text-[10px] text-slate-400">{branch?.name || 'الفرع الرئيسي'}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tr.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                    >
                      {tr.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                  </div>

                  {/* Contact & Extra info */}
                  <div className="space-y-1 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 mb-2.5">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tr.phone}</span>
                    </div>
                    {tr.email && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{tr.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-[11px]">
                      <span className="text-slate-400">العمولة:</span>
                      <span className="font-bold text-amber-300">
                        {(() => {
                          const commType = tr.commissionType || 'percentage';
                          const commVal = tr.commissionValue ?? tr.commissionRate ?? 50;
                          if (commType === 'percentage') return `${commVal}% من رسوم الدورة`;
                          if (commType === 'per_hour' || commType === 'fixed_per_hour') return `${commVal} ج.م / ساعة`;
                          if (commType === 'per_trainee') return `${commVal} ج.م / متدرب`;
                          return `${commVal}% من رسوم الدورة`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Financial Balance Summary */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs p-2 rounded-xl bg-slate-900/40 border border-slate-800 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">المستحق</span>
                      <span className="font-bold font-mono text-slate-200 text-[11px]">{tr.totalEarnings || 0} ج</span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 block">المنصرف</span>
                      <span className="font-bold font-mono text-emerald-400 text-[11px]">{tr.paidAmount || 0} ج</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">المتبقي</span>
                      <span className="font-bold font-mono text-amber-400 text-[11px]">{tr.remainingDues || 0} ج</span>
                    </div>
                  </div>

                  {/* Dedicated Portal Action Buttons & Password Management for this Trainer */}
                  <div className="bg-indigo-950/40 border border-indigo-500/30 p-2.5 rounded-xl space-y-2 mb-2">
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-indigo-300">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>بوابة المدرب ({tr.name.split(' ')[0]}):</span>
                      </span>
                      <button
                        onClick={() => handleOpenPasswordResetModal(tr)}
                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                        title="تخصيص وتعديل أو استرجاع الرقم السري للمدرب"
                      >
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>الرقم السري ({tr.portalPassword || 'افتراضي'})</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleOpenTrainerPortal(tr)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all shadow"
                        title="فتح بوابة المدرب مباشرة"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>فتح البوابة</span>
                      </button>

                      <button
                        onClick={() => handleCopyTrainerPortalLink(tr)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-200 font-bold text-[11px] border border-indigo-500/30 transition-all"
                        title="نشر ونسخ رابط المدرب"
                      >
                        <Share2 className="w-3 h-3 text-indigo-400" />
                        <span>نشر الرابط</span>
                      </button>

                      <button
                        onClick={() => handleSendTrainerPortalWhatsApp(tr)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow"
                        title="إرسال الرابط عبر واتساب للمدرب"
                      >
                        <Send className="w-3 h-3" />
                        <span>إرسال الرابط</span>
                      </button>

                      <button
                        onClick={() => { setActiveTrainer(tr); setIsTrainerPortalModalOpen(true); }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-all"
                        title="تنزيل وتثبيت تطبيق بوابة المدرب"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>تثبيت التطبيق</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Management Bottom Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-700/60">
                  <button
                    onClick={() => handleOpenSettlement(tr)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>صرف مستحقات</span>
                  </button>

                  <button
                    onClick={() => handleOpenTrainerSchedule(tr)}
                    className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                    title="جدول المحاضرات الشخصي للمدرب"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTrainer(tr);
                      setIsAttestationsModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
                    title="إصدار وعرض الإفادات والشهادات الرسمية للمدرب 📜"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => handlePrintStatement(tr)}
                    className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 transition-colors"
                    title="طباعة كشف الحساب"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(tr)}
                    className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-blue-300 transition-colors"
                    title="تعديل بيانات المدرب"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ----------------- MODAL: Add Trainer ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">إضافة مدرب جديد</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddTrainer} className="space-y-3.5 text-xs">
              {/* Photo Upload Section */}
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/70 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="صورة المدرب"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-700 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 font-bold text-xl">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <label className="block text-slate-200 font-bold text-xs">صورة المدرب الشخصية</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-all"
                      >
                        حذف الصورة
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">اختر صورة من جهازك بصيغة JPG أو PNG</p>
                </div>
              </div>

              {/* Prefix & Auto Generated Trainer Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-2xl border border-amber-500/30">
                <div>
                  <label className="block text-amber-300 font-bold mb-1">بادئة لقب المدرب *</label>
                  <select
                    value={formData.prefix || 'TR'}
                    onChange={(e) => handlePrefixSelect(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold text-xs"
                  >
                    <option value="DR">دكتور (DR) - كود يبدأ بـ DR</option>
                    <option value="ENG">مهندس (ENG) - كود يبدأ بـ ENG</option>
                    <option value="MR">أستاذ (MR) - كود يبدأ بـ MR</option>
                    <option value="TR">مدرب عام (TR) - كود يبدأ بـ TR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1">كود المدرب المعتمد (2 رقم بعد البادئة) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().trim() })}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-mono font-black text-sm tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextC = generateNextTrainerCode(formData.prefix || 'TR', trainers);
                        setFormData({ ...formData, code: nextC, portalPassword: `${nextC}${nextC}` });
                      }}
                      className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 rounded-xl font-bold text-[11px] shrink-0 border border-amber-500/30"
                      title="إعادة توليد الكود التالي"
                    >
                      توليد
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    كلمة المرور الافتراضية للبوابة: <span className="font-mono text-emerald-400 font-bold">{formData.code ? `${formData.code}${formData.code}` : 'تكرار الكود'}</span>
                  </p>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المدرب *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. ياسر عبد المنعم"
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص التدريبي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: برمجة بايثون والذكاء الاصطناعي"
                    value={formData.specialty ?? ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Additional Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الرقم القومي / الهوية</label>
                  <input
                    type="text"
                    placeholder="14 رقم قومي"
                    value={formData.nationalId ?? ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المؤهل العلمي / الشهادات</label>
                  <input
                    type="text"
                    placeholder="مثال: بكالوريوس حاسبات ومعلومات"
                    value={formData.qualification ?? ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع الأساسي *</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {(branches || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ التعاقد</label>
                  <input
                    type="date"
                    value={formData.contractDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">كلمة مرور بوابة المدرب (Portal Password)</label>
                  <input
                    type="text"
                    placeholder="كلمة المرور الخاصة بدخول المدرب"
                    value={formData.portalPassword ?? ''}
                    onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Commission System */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">نظام العمولة والمستحقات المالية</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    افتراضي 50%
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">طريقة حساب المستحقات</label>
                    <select
                      value={formData.commissionType ?? 'percentage'}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="percentage">نسبة مئوية من رسوم الدورة (%)</option>
                      <option value="per_trainee">مبلغ ثابت لكل متدرب (ج.م)</option>
                      <option value="per_hour">أجر بالساعة التدريبية (ج.م)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">
                      {formData.commissionType === 'percentage'
                        ? 'النسبة المئوية (%)'
                        : formData.commissionType === 'per_hour'
                        ? 'الأجر بالساعة (ج.م)'
                        : 'المبلغ لكل متدرب (ج.م)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.commissionValue ?? 50}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({ ...formData, commissionValue: val, commissionRate: val });
                      }}
                      className="w-full bg-slate-800 border border-amber-500 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل أو ملاحظات شروط التعاقد..."
                  value={formData.notes ?? ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  حفظ المدرب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Edit Trainer ----------------- */}
      {isEditModalOpen && activeTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">تعديل بيانات المدرب: {activeTrainer.name}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTrainer} className="space-y-3.5 text-xs">
              {/* Photo Upload Section */}
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/70 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="صورة المدرب"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-700 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 font-bold text-xl">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <label className="block text-slate-200 font-bold text-xs">تغيير صورة المدرب</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة جديدة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-all"
                      >
                        حذف الصورة
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">اختر صورة جديدة لتحديث البروفايل الشخصي للمدرب</p>
                </div>
              </div>

              {/* Prefix & Auto Generated Trainer Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-2xl border border-blue-500/30">
                <div>
                  <label className="block text-blue-300 font-bold mb-1">بادئة لقب المدرب *</label>
                  <select
                    value={formData.prefix || 'TR'}
                    onChange={(e) => handlePrefixSelect(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold text-xs"
                  >
                    <option value="DR">دكتور (DR) - كود يبدأ بـ DR</option>
                    <option value="ENG">مهندس (ENG) - كود يبدأ بـ ENG</option>
                    <option value="MR">أستاذ (MR) - كود يبدأ بـ MR</option>
                    <option value="TR">مدرب عام (TR) - كود يبدأ بـ TR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-300 font-bold mb-1">كود المدرب المعتمد (2 رقم بعد البادئة) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().trim() })}
                      className="w-full bg-slate-900 border border-blue-500/50 rounded-xl px-3 py-2 text-blue-300 font-mono font-black text-sm tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextC = generateNextTrainerCode(formData.prefix || 'TR', trainers);
                        setFormData({ ...formData, code: nextC, portalPassword: `${nextC}${nextC}` });
                      }}
                      className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-200 hover:text-white rounded-xl font-bold text-[11px] shrink-0 border border-blue-500/30"
                      title="إعادة توليد الكود"
                    >
                      توليد
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    كلمة المرور الافتراضية للبوابة: <span className="font-mono text-emerald-400 font-bold">{formData.code ? `${formData.code}${formData.code}` : 'تكرار الكود'}</span>
                  </p>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المدرب *</label>
                  <input
                    type="text"
                    required
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">التخصص التدريبي *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty ?? ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <label className="block text-slate-400 font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Additional Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الرقم القومي / الهوية</label>
                  <input
                    type="text"
                    placeholder="14 رقم قومي"
                    value={formData.nationalId ?? ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المؤهل العلمي / الشهادات</label>
                  <input
                    type="text"
                    placeholder="مثال: بكالوريوس حاسبات ومعلومات"
                    value={formData.qualification ?? ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفرع الأساسي *</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {(branches || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">حالة الحساب</label>
                  <select
                    value={formData.status ?? 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Commission System */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">نظام العمولة والمستحقات المالية</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    العمولة الحالية
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">طريقة حساب المستحقات</label>
                    <select
                      value={formData.commissionType ?? 'percentage'}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="percentage">نسبة مئوية من رسوم الدورة (%)</option>
                      <option value="per_trainee">مبلغ ثابت لكل متدرب (ج.م)</option>
                      <option value="per_hour">أجر بالساعة التدريبية (ج.م)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">
                      {formData.commissionType === 'percentage'
                        ? 'النسبة المئوية (%)'
                        : formData.commissionType === 'per_hour'
                        ? 'الأجر بالساعة (ج.م)'
                        : 'المبلغ لكل متدرب (ج.م)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.commissionValue ?? 50}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({ ...formData, commissionValue: val, commissionRate: val });
                      }}
                      className="w-full bg-slate-800 border border-amber-500 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={formData.notes ?? ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Trainer Settlement ----------------- */}
      {isSettlementModalOpen && activeTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">سند صرف مستحقات تدريبية</h3>
              </div>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettlement} className="space-y-3.5 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <p className="text-slate-300 font-bold">المدرب: {activeTrainer.name}</p>
                <p className="text-slate-400 mt-1">
                  إجمالي المستحق له: <span className="font-mono text-slate-200">{activeTrainer.totalEarnings || 0} ج.م</span> | المتبقي للصرف: <span className="font-mono font-bold text-amber-400">{activeTrainer.remainingDues || 0} ج.م</span>
                </p>
              </div>

              <div>
                <label className="block text-emerald-400 font-bold mb-1">المبلغ المصروف الآن (ج.م) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">طريقة الصرف</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="cash">نقداً من خزينة المركز</option>
                  <option value="vodafone_cash">فودافون كاش</option>
                  <option value="instapay">انستاباي InstaPay</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">البيان / الملاحظات</label>
                <input
                  type="text"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  تأكيد الصرف وحفظ السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Trainer Personal Schedule ----------------- */}
      {isScheduleModalOpen && activeTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full p-6 text-slate-100 max-h-[92vh] overflow-y-auto" dir="rtl">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                    <span>جدول الحصص الأسبوعي للمعلم / المدرب: {activeTrainer.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTrainer.specialty} • هاتف: <span className="font-mono text-slate-300">{activeTrainer.phone}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Print */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendTrainerScheduleWhatsApp(activeTrainer, trainerScheduleSlots)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                  title="إرسال جدول الحصص للمدرب عبر واتساب"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>إرسال واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
                  title="طباعة جدول الحصص الأسبوعي"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>طباعة الجدول</span>
                </button>

                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official School/Teacher Timetable Grid */}
            <div className="py-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 gap-3">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  جدول حصص المحاضر الرسمي (موزع حسب أيام الأسبوع)
                </span>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-slate-400 font-bold shrink-0">ترتيب الحصص:</span>
                  <select
                    value={scheduleSortOrder}
                    onChange={(e: any) => setScheduleSortOrder(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="time-asc">🕒 التوقيت (من المبكر إلى المتأخر)</option>
                    <option value="time-desc">🕒 التوقيت (من المتأخر إلى المبكر)</option>
                    <option value="group-name">🔤 أبجدي حسب اسم المجموعة</option>
                  </select>
                  <span className="font-mono font-bold bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                    {trainerScheduleSlots.length} محاضرة
                  </span>
                </div>
              </div>

              {/* Timetable Table Grid */}
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60 shadow-inner">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                      <th className="p-3 border-l border-slate-800 w-28 text-center bg-slate-900/90">يوم الأسبوع</th>
                      <th className="p-3 border-l border-slate-800 text-center">تفاصيل المحاضرة والبرنامج</th>
                      <th className="p-3 border-l border-slate-800 w-44 text-center">الموعد والتوقيت</th>
                      <th className="p-3 border-l border-slate-800 w-32 text-center">القاعة</th>
                      <th className="p-3 w-20 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => {
                      const daySlots = trainerScheduleSlots.filter(s => {
                        const normS = s.dayOfWeek === 'الاثنين' ? 'الإثنين' : (s.dayOfWeek === 'الاحد' ? 'الأحد' : (s.dayOfWeek === 'الاربعاء' ? 'الأربعاء' : s.dayOfWeek));
                        const normD = day === 'الاثنين' ? 'الإثنين' : (day === 'الاحد' ? 'الأحد' : (day === 'الاربعاء' ? 'الأربعاء' : day));
                        return normS === normD;
                      }).sort((a, b) => {
                        if (scheduleSortOrder === 'time-asc') {
                          return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
                        } else if (scheduleSortOrder === 'time-desc') {
                          return timeToMinutes(b.startTime) - timeToMinutes(a.startTime);
                        } else {
                          return (a.groupName || '').localeCompare(b.groupName || '', 'ar');
                        }
                      });
                      if (daySlots.length === 0) {
                        return (
                          <tr key={day} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3 border-l border-slate-800 font-bold text-slate-400 bg-slate-900/40 text-center">
                              {day}
                            </td>
                            <td colSpan={4} className="p-3 text-center text-slate-600 text-xs italic">
                              لا توجد حصص مجدولة لهذا اليوم
                            </td>
                          </tr>
                        );
                      }

                      return daySlots.map((slot, idx) => (
                        <tr key={slot.id} className="hover:bg-slate-900/80 transition-colors">
                          {idx === 0 && (
                            <td
                              rowSpan={daySlots.length}
                              className="p-3 border-l border-slate-800 font-black text-amber-300 bg-slate-900/60 text-center align-middle"
                            >
                              <div className="space-y-1">
                                <div>{day}</div>
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                                  {daySlots.length} حصة
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="p-3 border-l border-slate-800">
                            <div className="font-bold text-slate-100 text-sm">{slot.groupName}</div>
                            <div className="text-xs text-indigo-300 mt-0.5">{slot.courseName}</div>
                          </td>
                          <td className="p-3 border-l border-slate-800 text-center">
                            <div className="inline-block bg-indigo-950/80 border border-indigo-500/40 px-3 py-1 rounded-xl text-indigo-200 font-mono font-bold text-xs">
                              {formatTimeAMPM(slot.startTime)} ➔ {formatTimeAMPM(slot.endTime)}
                            </div>
                          </td>
                          <td className="p-3 border-l border-slate-800 text-center">
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg inline-block">
                              📍 {slot.roomName}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={async () => {
                                if (!confirm('هل أنت متأكد من حذف هذه المحاضرة من جدول المدرب؟')) return;
                                try {
                                  await fetch(`/api/lab-schedules/${encodeURIComponent(slot.id)}`, { method: 'DELETE' });
                                  const res = await fetch('/api/lab-schedules');
                                  const data = await res.json();
                                  setTrainerScheduleSlots(data.filter((s: any) => s.trainerId === activeTrainer?.id || s.trainerName === activeTrainer?.name));
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-all"
                              title="حذف المحاضرة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                <span>* تم استخراج الجدول الزمني آلياً من نظام إدارة المعامل والمجموعات - مركز النجاح</span>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                >
                  إغلاق Window
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      <ShareTrainerRegistrationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      <TrainerPortalModal
        isOpen={isTrainerPortalModalOpen}
        onClose={() => setIsTrainerPortalModalOpen(false)}
        trainer={activeTrainer}
        trainersList={trainers}
        showToast={showToast}
      />
      <TrainerAttestationsManagerModal
        isOpen={isAttestationsModalOpen}
        onClose={() => setIsAttestationsModalOpen(false)}
        trainer={activeTrainer}
        allTrainers={trainers}
        branches={branches}
        onShowToast={showToast}
      />

      {/* ----------------- MODAL: Password Reset for Trainer ----------------- */}
      {isPasswordResetModalOpen && passwordResetTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">تخصيص / استرجاع كلمة السر للمدرب</h3>
              </div>
              <button
                onClick={() => setIsPasswordResetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePasswordReset} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="font-bold text-slate-200 block">{passwordResetTrainer.name}</span>
                <p className="text-[11px] text-slate-400">
                  الكود: <span className="font-mono text-amber-300 font-bold">{passwordResetTrainer.code || 'غير محدد'}</span> | الهاتف: <span className="font-mono text-slate-200">{passwordResetTrainer.phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  كلمة المرور / الرقم السري الجديد للبوابة:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={passwordResetValue}
                    onChange={(e) => setPasswordResetValue(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة..."
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const def = passwordResetTrainer.code ? `${passwordResetTrainer.code}${passwordResetTrainer.code}` : '123456';
                      setPasswordResetValue(def);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold shrink-0 border border-amber-500/30 text-[11px]"
                    title="إعادة تعيين للافتراضي (تكرار الكود)"
                  >
                    الافتراضي
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 كلمة المرور الافتراضية هي تكرار كود المدرب مرتين (مثال: {passwordResetTrainer.code ? `${passwordResetTrainer.code}${passwordResetTrainer.code}` : 'DR01DR01'})
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingPasswordReset}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  {isSavingPasswordReset && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ كلمة السر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
