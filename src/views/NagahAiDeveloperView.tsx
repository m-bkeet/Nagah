import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldCheck,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Server,
  Cloud,
  Lock,
  Activity,
  Image as ImageIcon,
  Wrench,
  Layers,
  AlertCircle
} from 'lucide-react';
import { request } from '../services/api';
import { useCenter } from '../context/CenterContext';

interface DiagnosticsResponse {
  success: boolean;
  timestamp: string;
  security: {
    signedSessionTokens: boolean;
    rateLimitingActive: boolean;
    serverSidePasscodeCheck: boolean;
    firestoreHardenedRules: boolean;
  };
  storage: {
    databaseFileBytes: number;
    databaseFileKB: number;
    extractedMediaFiles: number;
    extractedMediaKB: number;
    remainingBase64Blobs: number;
    topCollections: Array<{
      name: string;
      count: number;
      bytes: number;
      base64Count: number;
    }>;
  };
  integrity: {
    traineesTotal: number;
    paymentsTotal: number;
    expensesTotal: number;
    pointTransactionsTotal: number;
    duplicateCodes: Array<{ code: string; names?: string[]; count?: number }>;
    duplicateNames: Array<{ name: string; count?: number }>;
    financialDiscrepancies: number;
  };
}

interface QuotaStatusResponse {
  runtime?: {
    platform?: string;
    nodeVersion?: string;
    uptimeSeconds?: number;
    memoryRssMB?: number;
    heapUsedMB?: number;
  };
  firestore?: {
    readsToday: number;
    writesToday: number;
    deletesToday?: number;
    health?: string;
    limits?: {
      dailyReads: number;
      dailyWrites: number;
    };
  };
}

export const NagahAiDeveloperView: React.FC = () => {
  const { showToast } = useCenter();
  const [diag, setDiag] = useState<DiagnosticsResponse | null>(null);
  const [quota, setQuota] = useState<QuotaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const loadDiagnostics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [diagRes, quotaRes] = await Promise.all([
        request<DiagnosticsResponse>('/system/diagnostics'),
        request<QuotaStatusResponse>('/system/quota-status').catch(() => null)
      ]);
      setDiag(diagRes);
      setQuota(quotaRes);
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل بيانات الفحص. تأكد من تسجيل الدخول بحساب مدير النظام.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  const handleOptimizeMedia = async () => {
    setIsOptimizing(true);
    try {
      const res = await request<{
        success: boolean;
        extractedCount: number;
        savedKB: number;
        newDatabaseKB: number;
      }>('/system/optimize-media', { method: 'POST' });

      const msg =
        res.extractedCount > 0
          ? `تم استخراج ${res.extractedCount} ملف وسائط وتوفير ${res.savedKB} KB (الحجم الجديد: ${res.newDatabaseKB} KB)`
          : `قاعدة البيانات محسّنة بالفعل (${res.newDatabaseKB} KB) ولا توجد ملفات كبيرة غير مستخرجة.`;
      showToast(msg, 'success');
      await loadDiagnostics();
    } catch (err: any) {
      showToast(err?.message || 'فشل ضغط الوسائط', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatUptime = (seconds?: number) => {
    const s = Math.max(0, Number(seconds) || 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (hrs > 0) return `${hrs} س ${mins} د`;
    return `${mins} دقيقة`;
  };

  const duplicateCodes = diag?.integrity?.duplicateCodes || [];
  const duplicateNames = diag?.integrity?.duplicateNames || [];
  const financialIssuesCount = Number(diag?.integrity?.financialDiscrepancies) || 0;
  const totalIssues = duplicateCodes.length + financialIssuesCount;

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              مركز صحة النظام والأمان والتخزين
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              قراءات حية وحقيقية من الخادم: حجم قاعدة البيانات، كوتا Firestore، سلامة سجلات الطلاب، وضغط الصور.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOptimizeMedia}
            disabled={isOptimizing || loading}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isOptimizing ? 'جاري استخراج الصور...' : 'ضغط واستخراج الصور من القاعدة'}</span>
          </button>
          <button
            onClick={loadDiagnostics}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الفحص</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !diag ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : diag ? (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">حجم database.json</span>
                <Database className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {diag.storage.databaseFileKB >= 1024
                    ? `${(diag.storage.databaseFileKB / 1024).toFixed(2)} MB`
                    : `${diag.storage.databaseFileKB} KB`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                وسائط مفصولة: {diag.storage.extractedMediaFiles} ملف ({diag.storage.extractedMediaKB} KB)
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">استهلاك Firestore اليوم</span>
                <Cloud className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {quota?.firestore?.readsToday ?? 0} قراءة / {quota?.firestore?.writesToday ?? 0} كتابة
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                الحالة: {quota?.firestore?.health === 'optimal' ? 'ممتازة (محلي أولاً)' : 'نشط'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">أداء الخادم والذاكرة</span>
                <Server className="w-5 h-5 text-sky-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {quota?.runtime?.heapUsedMB ?? '--'} MB
                </span>
                <span className="text-xs text-slate-400">/ {quota?.runtime?.memoryRssMB ?? '--'} MB RSS</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                مدة التشغيل: {formatUptime(quota?.runtime?.uptimeSeconds)} • {quota?.runtime?.nodeVersion || 'Node.js'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">سلامة البيانات والتكرار</span>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalIssues === 0 ? 'سليم 100%' : `${totalIssues} ملاحظة`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                الطلاب: {diag.integrity.traineesTotal} • الدفعات: {diag.integrity.paymentsTotal} • النقاط: {diag.integrity.pointTransactionsTotal}
              </p>
            </div>
          </div>

          {/* Security Checklist + Data Integrity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">حالة التحصين الأمني الفعلي</h2>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'توقيع الجلسات بتشفير HMAC-SHA256 (بدون توكنات وهمية)', ok: diag.security.signedSessionTokens },
                  { label: 'حماية Brute-Force Rate Limiting على تسجيل الدخول والـ PIN', ok: diag.security.rateLimitingActive },
                  { label: 'التحقق من الرقم السري للإدارة على الخادم فقط (timingSafeEqual)', ok: diag.security.serverSidePasscodeCheck },
                  { label: 'قواعد Firestore محكمة (Default-Deny + Allowlist)', ok: diag.security.firestoreHardenedRules }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                    {item.ok ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4" /> مفعّل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-black">
                        <AlertTriangle className="w-4 h-4" /> يحتاج مراجعة
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Integrity Audit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">تدقيق سلامة السجلات والمالية</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{duplicateCodes.length}</div>
                  <div className="text-[11px] font-bold text-slate-500">أكواد مكررة</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{duplicateNames.length}</div>
                  <div className="text-[11px] font-bold text-slate-500">أسماء متشابهة</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{financialIssuesCount}</div>
                  <div className="text-[11px] font-bold text-slate-500">فروقات مالية</div>
                </div>
              </div>

              {duplicateCodes.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
                  <div className="text-xs font-black text-amber-800 dark:text-amber-300">أكواد متدربين مكررة:</div>
                  {duplicateCodes.slice(0, 5).map((d, i) => (
                    <div key={i} className="text-[11px] text-amber-700 dark:text-amber-200">
                      الكود <span className="font-mono font-bold">{d.code}</span>
                      {d.names ? `: ${d.names.join('، ')}` : ''}
                    </div>
                  ))}
                </div>
              )}

              {totalIssues === 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>جميع أكواد الطلاب ({diag.integrity.traineesTotal} متدرب) وأرصدتهم المالية متطابقة تماماً بدون أي تضارب.</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Breakdown by Collection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">أكبر الجداول في قاعدة البيانات</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                آخر فحص: {new Date(diag.timestamp).toLocaleTimeString('ar-EG')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(diag.storage.topCollections || []).map((col) => (
                <div
                  key={col.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60"
                >
                  <div className="text-[11px] font-mono text-slate-500 truncate" title={col.name}>
                    {col.name}
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-base font-black text-slate-900 dark:text-white">{col.count} سجل</span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(col.bytes / 1024)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
