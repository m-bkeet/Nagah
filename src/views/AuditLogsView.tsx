import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { ShieldAlert, Search, Filter, Clock, User, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types';

export const AuditLogsView: React.FC = () => {
  const { showToast, refreshKey } = useCenter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, [refreshKey]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل سجل التدقيق', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            سجل العمليات والتدقيق الأمني (Audit Trail & Activity Log)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            توثيق كامل لكل عملية إضافة، تعديل، حذف، صرف مالي، أو تسجيل دخول مع التاريخ والمستخدم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث في سجل العمليات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={loadLogs}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
            <tr>
              <th className="p-3.5">الوقت والتاريخ</th>
              <th className="p-3.5">المستخدم المسؤول</th>
              <th className="p-3.5">نوع العملية</th>
              <th className="p-3.5">تفاصيل الإجراء</th>
              <th className="p-3.5 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  جاري تحميل السجلات...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  لا توجد عمليات مسجلة.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>{log.userName}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{log.details}</td>
                  <td className="p-3.5 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ناجحة وموثقة ✓
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
