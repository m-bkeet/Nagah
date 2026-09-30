import React, { useRef } from 'react';
import { X, Printer, Building2, Calendar, User, FileText, CheckCircle2, TrendingUp, Users, DollarSign, Award, Layers } from 'lucide-react';
import { Payment, Trainer, Course, Branch, Trainee, TrainerSettlement } from '../types';
import { getEffectiveCenterLogo, handleLogoError } from '../utils/centerLogo';

interface ClosingAccountReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: Payment[];
  trainers: Trainer[];
  courses: Course[];
  branches: Branch[];
  summary: any;
  centerSettings: any;
  activeBranchId?: string;
  trainees?: Trainee[];
  settlements?: TrainerSettlement[];
}

export const ClosingAccountReportModal: React.FC<ClosingAccountReportModalProps> = ({
  isOpen,
  onClose,
  payments,
  trainers,
  courses,
  branches,
  summary,
  centerSettings,
  activeBranchId = 'all',
  trainees = [],
  settlements = []
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const reportNumber = `ACC-${todayStr.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
  const currentBranchName = activeBranchId === 'all' 
    ? 'كافة الفروع (المركز الرئيسي وبدر)' 
    : (branches.find(b => b.id === activeBranchId)?.name || 'الفرع المحدد');

  // Filter payments if specific branch selected
  const filteredPayments = activeBranchId === 'all' 
    ? payments 
    : payments.filter(p => p.branchId === activeBranchId);

  // Today's collections
  const todayPayments = filteredPayments.filter(p => p.date === todayStr);
  const todayTotal = todayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // 1. Branch breakdown
  const branchBreakdown = branches.map(b => {
    const branchPayments = payments.filter(p => p.branchId === b.id);
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

  // 2. Course / Grade breakdown
  const courseGradeBreakdown = courses.map(course => {
    const coursePayments = filteredPayments.filter(p => p.courseId === course.id);
    const totalCollected = coursePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const trainerPct = course.trainerPercentage || course.trainerSharePercentage || 50;
    const trainerAmount = Math.round((totalCollected * trainerPct) / 100);
    const centerAmount = totalCollected - trainerAmount;

    return {
      courseId: course.id,
      courseName: course.name,
      category: course.category || 'دورة منهج',
      feeAmount: course.feeAmount || 0,
      totalCollected,
      paymentsCount: coursePayments.length,
      trainerPct,
      trainerAmount,
      centerAmount
    };
  });

  // 3. Trainer profit share breakdown
  const trainerSharesBreakdown = (trainers || []).map(tr => {
    const trainerCourses = courses.filter(c => c.trainerId === tr.id || (tr.courses && tr.courses.includes(c.id)));
    const trainerCourseIds = new Set(trainerCourses.map(c => c.id));
    const trainerPayments = filteredPayments.filter(p => p.trainerId === tr.id || (p.courseId && trainerCourseIds.has(p.courseId)));
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

  // 4. Academic Grades Breakdown (سنة رابعة، سنة خامسة، إلخ)
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

  const gradeMap = new Map<string, {
    name: string;
    traineesCount: number;
    expectedFee: number;
    collected: number;
    remaining: number;
    exemptCount: number;
    todayCollected: number;
  }>();

  const filteredTrainees = activeBranchId === 'all' 
    ? trainees 
    : trainees.filter(t => t.branchId === activeBranchId);

  filteredTrainees.forEach(t => {
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
    const t = trainees.find(tr => tr.id === p.traineeId);
    if (t) {
      const gName = normalizeGradeName(t);
      if (gradeMap.has(gName)) {
        gradeMap.get(gName)!.todayCollected += Number(p.amount) || 0;
      }
    }
  });

  const academicGradesBreakdown = Array.from(gradeMap.values()).sort((a, b) => b.collected - a.collected);

  const handlePrint = () => {
    window.print();
  };

  const centerLogo = getEffectiveCenterLogo(centerSettings);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print-modal-overlay" dir="rtl">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full my-auto max-h-[96vh] flex flex-col overflow-hidden print-modal-box">
        
        {/* Action Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-sm text-slate-900">تقرير الحساب الختامي وفاتورة الخزينة المعتمدة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة والحساب الختامي 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-emerald-600 pb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={centerLogo}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-2xl border border-slate-200 p-1 shadow-xs"
                onError={handleLogoError}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                  {centerSettings?.name || 'مركز النجاح للتدريب والاستشارات'}
                </h1>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  المنظومة المالية والإدارية المركزية &bull; قسم الحسابات والخزينة العامة
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
                  <span>🏢 {currentBranchName}</span>
                  <span>&bull;</span>
                  <span>📞 {centerSettings?.phone || '01005400325'}</span>
                </div>
              </div>
            </div>

            <div className="text-left space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black font-mono">
                {reportNumber}
              </span>
              <p className="text-xs font-bold text-slate-700">{todayFormatted}</p>
              <p className="text-[11px] text-slate-500 font-mono">الساعة: {timeFormatted}</p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              📊 كشف الحساب الختامي الشامل وتوزيع الإيرادات والنسب
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              بيان تفصيلي معتمد بحركة المقبوضات اليومية، وتوزيع الفروع، وحصص السنتر والمحاضرين
            </p>
          </div>

          {/* Section 1: Executive KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold block mb-1">🌟 مقبوضات اليوم</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                {todayTotal.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">({todayPayments.length} سندات قبض اليوم)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-700 font-bold block mb-1">💰 إجمالي المقبوضات الشامل</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {(summary?.totalRevenue || 0).toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">({filteredPayments.length} سندات معتمدة)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-800 font-bold block mb-1">📉 المصروفات والنفقات</span>
              <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
                {(summary?.totalExpenses || 0).toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">مصاريف ومستلزمات تشغيل</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200">
              <span className="text-xs text-cyan-800 font-bold block mb-1">🏛️ حصة المركز الصافية</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-800 font-mono">
                {(summary?.totalCenterShare || 0).toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">صافي أرباح المنشأة</span>
            </div>
          </div>

          {/* Section 2: Branch Comparison Table */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 border-b pb-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. بيان حركة المقبوضات وتوزيع الإيرادات حسب الفروع</span>
            </h3>
            <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-2.5 border border-slate-200">الفرع</th>
                  <th className="p-2.5 border border-slate-200">مقبوضات اليوم</th>
                  <th className="p-2.5 border border-slate-200">عدد سندات اليوم</th>
                  <th className="p-2.5 border border-slate-200">إجمالي مقبوضات الفرع</th>
                  <th className="p-2.5 border border-slate-200">إجمالي السندات</th>
                  <th className="p-2.5 border border-slate-200">نسبة المساهمة</th>
                </tr>
              </thead>
              <tbody>
                {branchBreakdown.map((b, idx) => {
                  const totalAll = summary?.totalRevenue || 1;
                  const sharePct = Math.round((b.totalAmount / totalAll) * 100);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-950">{b.branchName}</td>
                      <td className="p-2.5 border border-slate-200 font-mono font-bold text-emerald-700">{b.todayAmount.toLocaleString()} ج.م</td>
                      <td className="p-2.5 border border-slate-200 font-mono">{b.todayCount} سند</td>
                      <td className="p-2.5 border border-slate-200 font-mono font-bold text-slate-900">{b.totalAmount.toLocaleString()} ج.م</td>
                      <td className="p-2.5 border border-slate-200 font-mono">{b.totalCount} سند</td>
                      <td className="p-2.5 border border-slate-200 font-mono font-bold">{sharePct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: Academic Grades Breakdown (سنة رابعة وسنة خامسة إلخ) */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 border-b pb-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>2. بيان الحساب الختامي والتحصيل حسب الصفوف والمراحل الدراسية (سنة رابعة، سنة خامسة، إلخ)</span>
            </h3>
            <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-2 border border-slate-200">المرحلة / الصف الدراسي</th>
                  <th className="p-2 border border-slate-200">الطلاب</th>
                  <th className="p-2 border border-slate-200">إجمالي المطلوب</th>
                  <th className="p-2 border border-slate-200">المحصل الفعلي</th>
                  <th className="p-2 border border-slate-200">المتبقي (الديون)</th>
                  <th className="p-2 border border-slate-200">معدل التحصيل</th>
                  <th className="p-2 border border-slate-200">وارد اليوم</th>
                  <th className="p-2 border border-slate-200">معفى</th>
                </tr>
              </thead>
              <tbody>
                {academicGradesBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-3 text-center text-slate-500">لا توجد بيانات صفوف مسجلة</td>
                  </tr>
                ) : (
                  academicGradesBreakdown.map((ag, idx) => {
                    const rate = ag.expectedFee > 0 ? Math.round((ag.collected / ag.expectedFee) * 100) : 100;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 font-bold text-slate-950">{ag.name}</td>
                        <td className="p-2 border border-slate-200 font-mono">{ag.traineesCount} طالب</td>
                        <td className="p-2 border border-slate-200 font-mono font-bold">{ag.expectedFee.toLocaleString()} ج.م</td>
                        <td className="p-2 border border-slate-200 font-mono font-black text-emerald-700">{ag.collected.toLocaleString()} ج.م</td>
                        <td className="p-2 border border-slate-200 font-mono font-bold text-rose-600">{ag.remaining.toLocaleString()} ج.م</td>
                        <td className="p-2 border border-slate-200 font-mono font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${rate >= 80 ? 'bg-emerald-100 text-emerald-800' : rate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="p-2 border border-slate-200 font-mono font-bold text-emerald-700">
                          {ag.todayCollected > 0 ? `${ag.todayCollected.toLocaleString()} ج.م` : '-'}
                        </td>
                        <td className="p-2 border border-slate-200 font-mono text-slate-500">
                          {ag.exemptCount > 0 ? `${ag.exemptCount} طالب` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Section 4: Trainer Shares Breakdown */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 border-b pb-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>3. بيان نسب ومستحقات المحاضرين والمدربين المعتمدة وما تم صرفه</span>
            </h3>
            <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-2 border border-slate-200">اسم المدرب</th>
                  <th className="p-2 border border-slate-200">الدورات التابعة</th>
                  <th className="p-2 border border-slate-200">النسبة</th>
                  <th className="p-2 border border-slate-200">المحصل من طلابه</th>
                  <th className="p-2 border border-slate-200">إجمالي المستحق</th>
                  <th className="p-2 border border-slate-200">تم صرفه</th>
                  <th className="p-2 border border-slate-200">الصافي المتبقي</th>
                  <th className="p-2 border border-slate-200">حصة السنتر</th>
                </tr>
              </thead>
              <tbody>
                {trainerSharesBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-3 text-center text-slate-500">لا يوجد مدربون مسجلون</td>
                  </tr>
                ) : (
                  trainerSharesBreakdown.map((ts, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-bold text-slate-950">{ts.trainer.name}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">
                        {ts.courses.map(c => c.name).join('، ') || 'كل المجموعات'}
                      </td>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-indigo-600">{ts.percentage}%</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900">{ts.totalCollected.toLocaleString()} ج.م</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-amber-700">{ts.trainerEarned.toLocaleString()} ج.م</td>
                      <td className="p-2 border border-slate-200 font-mono text-slate-600">{ts.totalSettled.toLocaleString()} ج.م</td>
                      <td className="p-2 border border-slate-200 font-mono font-black text-emerald-700">{ts.netDue.toLocaleString()} ج.م</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-cyan-800">{ts.centerShare.toLocaleString()} ج.م</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Section 5: Today's Receipts Detail Table */}
          {todayPayments.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 border-b pb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. كشف سندات وإيصالات مقبوضات اليوم ({todayPayments.length} سند قبض - {todayTotal.toLocaleString()} ج.م)</span>
              </h3>
              <table className="w-full text-xs text-right border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border border-slate-200">رقم السند</th>
                    <th className="p-2 border border-slate-200">الوقت</th>
                    <th className="p-2 border border-slate-200">اسم الطالب</th>
                    <th className="p-2 border border-slate-200">الصف / الدورة</th>
                    <th className="p-2 border border-slate-200">الفرع</th>
                    <th className="p-2 border border-slate-200">المبلغ</th>
                    <th className="p-2 border border-slate-200">طريقة الدفع</th>
                  </tr>
                </thead>
                <tbody>
                  {todayPayments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 font-mono font-bold text-amber-700">{p.receiptNumber}</td>
                      <td className="p-2 border border-slate-200 font-mono text-slate-500">{p.time || '-'}</td>
                      <td className="p-2 border border-slate-200 font-bold text-slate-900">{p.traineeName}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">{p.groupName || courses.find(c => c.id === p.courseId)?.name || 'دورة تعليمية'}</td>
                      <td className="p-2 border border-slate-200 text-slate-700 font-medium">
                        {branches.find(b => b.id === p.branchId)?.name || (p.branchId === 'branch-1' ? 'النجاح' : 'بدر')}
                      </td>
                      <td className="p-2 border border-slate-200 font-mono font-black text-emerald-700">{Number(p.amount).toLocaleString()} ج.م</td>
                      <td className="p-2 border border-slate-200 font-medium text-slate-600">
                        {p.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : p.paymentMethod === 'instapay' ? 'انستا باي' : 'نقداً كاش'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Official Signatures & Stamps */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-4 text-center mt-6">
            <div className="space-y-8">
              <span className="text-xs font-bold text-slate-700 block">أمين الخزينة / المحصل</span>
              <span className="text-xs text-slate-400 block">..................................</span>
            </div>

            <div className="space-y-8">
              <span className="text-xs font-bold text-slate-700 block">المراجع المالي والحسابات</span>
              <span className="text-xs text-slate-400 block">..................................</span>
            </div>

            <div className="space-y-8">
              <span className="text-xs font-bold text-slate-700 block">ختم واعتماد المدير العام</span>
              <span className="text-xs text-slate-400 block">د. محمد رمضان بخيت</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-100">
            تم استخراج هذا التقرير آلياً وموثق إلكترونياً من السحابة المركزية لمركز النجاح للتدريب والاستشارات.
          </div>

        </div>

      </div>
    </div>
  );
};
