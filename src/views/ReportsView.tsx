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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>مركز التقارير الشاملة والتحليلات البيانية (17 تقرير تفصيلي)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            تقارير مالية، أكاديمية، إدارية، وتقنية مع دعم كامل للطباعة والتصدير
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer border border-amber-400"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>طباعة التقرير الحالي</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left 1 Col: Reports Catalog */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-2">
          <div className="px-2 py-1 mb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-xs text-slate-700 dark:text-slate-300">
              فهرس التقارير المتاحة
            </h3>
            <span className="text-[10px] text-slate-400 block mt-0.5">اختر التقرير لعرضه وتصديره</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {reportCatalog.map((r) => {
              const isSel = selectedReport === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r.id)}
                  className={`w-full text-right p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                    isSel
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md border-amber-400 shadow-amber-500/10'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  <span className="truncate">{r.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black mr-1 shrink-0 ${
                      isSel
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
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
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {reportCatalog.find((r) => r.id === selectedReport)?.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')} - الفرع:{' '}
                {branches.find((b) => b.id === activeBranchId)?.name || 'جميع الفروع'}
              </p>
            </div>

            <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-black px-3.5 py-1.5 rounded-full self-start sm:self-auto flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              بيانات حية ومحدثة ⚡
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              جاري تجميع وحساب بيانات التقرير...
            </div>
          ) : reportData ? (
            <div className="space-y-4">
              {/* Financial KPI preview if financial */}
              {reportData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(reportData.summary).map(([key, val]: any, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-bold">
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
                      <span className="font-black text-xl font-mono text-slate-900 dark:text-amber-400">
                        {typeof val === 'number' ? val.toLocaleString() + ' ج.م' : val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-black border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {reportData.columns?.map((col: string, idx: number) => (
                        <th key={idx} className="p-3.5">
                          {col}
                        </th>
                      )) || (
                        <>
                          <th className="p-3.5">البيان</th>
                          <th className="p-3.5">القيمة</th>
                          <th className="p-3.5">التاريخ</th>
                          <th className="p-3.5">الملاحظات</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                    {reportData.rows && reportData.rows.length > 0 ? (
                      reportData.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {Array.isArray(row) ? (
                            row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-3.5 font-mono">
                                {cell}
                              </td>
                            ))
                          ) : (
                            <>
                              <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.title || row.name || '-'}</td>
                              <td className="p-3.5 font-mono font-black text-amber-600 dark:text-amber-400">{row.value || row.amount || '-'}</td>
                              <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{row.date || '-'}</td>
                              <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.notes || '-'}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-500 dark:text-slate-400 font-bold">
                          سجلات التقرير جاهزة ومكتملة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 font-bold">لا توجد بيانات متاحة لهذا التقرير حالياً.</div>
          )}
        </div>
      </div>
    </div>
  );
};
