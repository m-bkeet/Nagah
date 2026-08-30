import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  BarChart3,
  DollarSign,
  Users,
  GraduationCap,
  Award,
  CheckCircle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { branches, activeBranchId, setPrintData, showToast, refreshKey } = useCenter();
  const [selectedReport, setSelectedReport] = useState<string>('financial_summary');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 17 reports catalog requested by user
  const reportCatalog = [
    { id: 'financial_summary', title: '1. التقرير المالي الشامل والأرباح', category: 'مالي' },
    { id: 'treasury_movements', title: '2. حركة الخزينة وسندات القبض اليومية', category: 'مالي' },
    { id: 'trainer_dues_statement', title: '3. كشف مستحقات وعمولات المدربين', category: 'مالي' },
    { id: 'expenses_by_category', title: '4. تقرير المصروفات التشغيلية والتصنيفات', category: 'مالي' },
    { id: 'remaining_balances', title: '5. تقرير المديونيات والمبالغ المتبقية على الطلاب', category: 'مالي' },
    { id: 'trainees_directory', title: '6. التقرير الشامل لبيانات المتدربين المسجلين', category: 'تدريب' },
    { id: 'attendance_commitment', title: '7. تقرير نسبة الحضور والغياب للمجموعات', category: 'تدريب' },
    { id: 'courses_performance', title: '8. إحصائيات الدورات التدريبية والإقبال', category: 'تدريب' },
    { id: 'groups_capacity', title: '9. تقرير إشغال القاعات والمعامل', category: 'تدريب' },
    { id: 'exams_results_summary', title: '10. ملخص نتائج الاختبارات ونسب النجاح', category: 'أكاديمي' },
    { id: 'points_leaderboard', title: '11. تقرير ترتيب النقاط وتفاعل الطلاب', category: 'أكاديمي' },
    { id: 'certificates_issued', title: '12. تقرير الشهادات الصادرة وأكواد التحقق', category: 'أكاديمي' },
    { id: 'branch_comparative', title: '13. تقرير المقارنة بين أداء الفروع', category: 'إداري' },
    { id: 'devices_status', title: '14. تقرير أجهزة المعامل والحالة الفنية', category: 'تقني' },
    { id: 'interactive_sessions_log', title: '15. تقرير الجلسات التفاعلية والمسابقات', category: 'تقني' },
    { id: 'user_activity_audit', title: '16. سجل تدقيق العمليات الأمنية (Audit Log)', category: 'إداري' },
    { id: 'monthly_executive', title: '17. التقرير التنفيذي الشهري للإدارة العليا', category: 'إداري' }
  ];

  useEffect(() => {
    loadReport();
  }, [selectedReport, activeBranchId, refreshKey]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReportData(selectedReport, {
        branchId: activeBranchId !== 'all' ? activeBranchId : undefined
      });
      setReportData(res);
    } catch (err: any) {
      showToast(err.message || 'فشل جلب بيانات التقرير', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const reportInfo = reportCatalog.find(r => r.id === selectedReport);
    setPrintData({
      title: reportInfo?.title || 'تقرير مركز النجاح',
      type: 'report',
      data: {
        reportTitle: reportInfo?.title,
        data: reportData,
        branchName: branches.find(b => b.id === activeBranchId)?.name || 'المركز العام'
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            مركز التقارير الشاملة والتحليلات البيانية (17 تقرير تفصيلي)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تقارير مالية، أكاديمية، إدارية، وتقنية مع دعم كامل للطباعة والتصدير
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الحالي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left 1 Col: Reports Catalog */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-2">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            فهرس التقارير المتاحة
          </h3>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {reportCatalog.map((r) => {
              const isSel = selectedReport === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r.id)}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    isSel
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="truncate">{r.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold mr-1 ${
                      isSel ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {r.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Active Report View */}
        <div className="lg:col-span-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {reportCatalog.find((r) => r.id === selectedReport)?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')} - الفرع:{' '}
                {branches.find((b) => b.id === activeBranchId)?.name || 'جميع الفروع'}
              </p>
            </div>

            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full">
              بيانات حية ومحدثة ⚡
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-400">جاري تجميع وحساب بيانات التقرير...</div>
          ) : reportData ? (
            <div className="space-y-4">
              {/* Financial KPI preview if financial */}
              {reportData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(reportData.summary).map(([key, val]: any, i) => (
                    <div key={i} className="p-3.5 bg-slate-900/70 border border-slate-700/70 rounded-xl">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {key === 'totalRevenue'
                          ? 'إجمالي الإيرادات'
                          : key === 'totalExpenses'
                          ? 'إجمالي المصروفات'
                          : key === 'netTreasury'
                          ? 'صافي الخزينة'
                          : key === 'totalTrainerPayouts'
                          ? 'مستحقات المدربين'
                          : key}
                      </span>
                      <span className="font-black text-lg font-mono text-amber-300">
                        {typeof val === 'number' ? val.toLocaleString() + ' ج.م' : val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      {reportData.columns?.map((col: string, idx: number) => (
                        <th key={idx} className="p-3">
                          {col}
                        </th>
                      )) || (
                        <>
                          <th className="p-3">البيان</th>
                          <th className="p-3">القيمة</th>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">الملاحظات</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {reportData.rows && reportData.rows.length > 0 ? (
                      reportData.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-700/30">
                          {Array.isArray(row) ? (
                            row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-3 font-mono">
                                {cell}
                              </td>
                            ))
                          ) : (
                            <>
                              <td className="p-3 font-bold">{row.title || row.name || '-'}</td>
                              <td className="p-3 font-mono text-amber-400">{row.value || row.amount || '-'}</td>
                              <td className="p-3 font-mono text-slate-400">{row.date || '-'}</td>
                              <td className="p-3 text-slate-400">{row.notes || '-'}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          سجلات التقرير جاهزة ومكتملة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">لا توجد بيانات متاحة لهذا التقرير حالياً.</div>
          )}
        </div>
      </div>
    </div>
  );
};
