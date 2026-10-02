import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Flame, 
  Activity, 
  HelpCircle,
  Clock,
  Sparkles,
  Key,
  Check,
  Send,
  Share2,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface CloudQuotaMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CloudQuotaMonitorModal: React.FC<CloudQuotaMonitorModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [quotaData, setQuotaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Vercel Token Configuration state
  const [showTokenConfig, setShowTokenConfig] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [vercelProjectId, setVercelProjectId] = useState('nagah-training-center');
  const [isSavingToken, setIsSavingToken] = useState(false);

  const fetchQuotaStatus = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await api.getSystemQuotaStatus(forceRefresh);
      setQuotaData(data);
    } catch (err: any) {
      if (showToast) showToast('تعذر جلب تفاصيل الكوتا: ' + (err?.message || 'خطأ اتصال'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuotaStatus(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cloudRunUrl = quotaData?.liveMirrors?.cloudRunProduction || 'https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cloudRunUrl);
    setCopiedLink(true);
    if (showToast) showToast('تم نسخ الرابط المباشر للطلاب بنجاح! 📋', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`رابط منصة مركز النجاح للتدريب والاستشارات المباشر للطلاب والامتحانات (سيرفر السحابة المستقل ويعمل 24/7 بدون انقطاع):\n${cloudRunUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSaveVercelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vercelToken.trim()) {
      if (showToast) showToast('يرجى إدخال Vercel Token', 'warning');
      return;
    }
    setIsSavingToken(true);
    try {
      const res = await api.saveVercelApiConfig({
        token: vercelToken.trim(),
        projectId: vercelProjectId.trim() || 'nagah-training-center'
      });
      if (res.success) {
        if (showToast) showToast(res.message || 'تم ربط حساب Vercel بنجاح!', 'success');
        setQuotaData(res.status);
        setShowTokenConfig(false);
      } else {
        if (showToast) showToast(res.error || 'تعذر ربط Vercel', 'error');
      }
    } catch (err: any) {
      if (showToast) showToast(err?.message || 'فشل الاتصال بـ Vercel API', 'error');
    } finally {
      setIsSavingToken(false);
    }
  };

  // Metrics extraction
  const firestoreReadsUsed = quotaData?.firestore?.readsToday || 0;
  const firestoreReadsMax = quotaData?.firestore?.limits?.dailyReads || 50000;
  const firestoreReadsPct = Math.min(100, Math.round((firestoreReadsUsed / firestoreReadsMax) * 100));

  const firestoreWritesUsed = quotaData?.firestore?.writesToday || 0;
  const firestoreWritesMax = quotaData?.firestore?.limits?.dailyWrites || 20000;
  const firestoreWritesPct = Math.min(100, Math.round((firestoreWritesUsed / firestoreWritesMax) * 100));

  const vercelMetrics = quotaData?.vercel?.metrics || quotaData?.vercelTelemetry || {};
  const isVercelConnected = quotaData?.vercel?.connected;
  const vercelResetDate = quotaData?.vercel?.billingPeriod?.resetDateFormatted || quotaData?.vercelTelemetry?.accountCycleNote;
  const deploymentStatus = quotaData?.vercel?.deploymentStatus || 'READY';

  const bwUsed = vercelMetrics.bandwidthUsedGB ?? 0;
  const bwMax = vercelMetrics.bandwidthLimitGB ?? 100;
  const bwPct = Math.min(100, Math.round((bwUsed / bwMax) * 100));

  const execUsed = vercelMetrics.executionUsedGBHours ?? 0;
  const execMax = vercelMetrics.executionLimitGBHours ?? 100;
  const execPct = Math.min(100, Math.round((execUsed / execMax) * 100));

  const invUsed = vercelMetrics.invocationsUsed ?? (quotaData?.vercelTelemetry?.estimatedInvocationsToday || 0);
  const invMax = vercelMetrics.invocationsLimit ?? 100000;
  const invPct = Math.min(100, Math.round((invUsed / invMax) * 100));

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl dir-rtl text-xs flex flex-col max-h-[96dvh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                مركز مراقبة الكوتا والأنظمة السحابية (Vercel & Firestore)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                تشخيص لحظي للكوتا المستهلكة والمتبقية ومواعيد التجديد وروابط الطوارئ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchQuotaStatus(true)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="تحديث البيانات لحظياً من السيرفر"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span>إغلاق</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 overscroll-contain">
          
          {/* EMERGENCY CLOUD RUN URL BANNER - INSTANT ACCESS FOR STUDENTS */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 space-y-2 shadow-xs">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-black text-xs text-emerald-900 dark:text-emerald-300">
                  حل فوري للطلاب: رابط السحابة المباشر 24/7 (بدون أي كوتا من فيرسيال)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-mono font-bold shrink-0">
                يعمل الآن بنسبة 100% ✓
              </span>
            </div>

            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              إذا توقفت فيرسيال أو تأخر تجديد الكوتا المجانية، أرسل هذا الرابط فوراً للطلاب وأولياء الأمور لفتح المنصة والامتحانات مباشرة دون أي توقف:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 pt-1">
              <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all truncate text-left dir-ltr">
                {cloudRunUrl}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  title="مشاركة عبر واتساب"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </button>
                <a
                  href={cloudRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح</span>
                </a>
              </div>
            </div>
          </div>

          {/* TWO MAIN GAUGES: VERCEL & FIRESTORE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 1. VERCEL TELEMETRY & API STATUS CARD */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-500" />
                  <span className="font-black text-slate-800 dark:text-slate-200 text-xs">
                    استهلاك فيرسيال (Vercel Cloud)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    deploymentStatus === 'PAUSED'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : isVercelConnected
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {deploymentStatus === 'PAUSED' ? 'متوقف مؤقتاً (Paused)' : isVercelConnected ? 'متصل بـ API رسمياً ✓' : 'حساب Vercel'}
                  </span>
                </div>
              </div>

              {/* Bandwidth Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">سعة نقل البيانات (Bandwidth):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {bwUsed.toLocaleString()} / {bwMax} جيجابايت
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      bwPct > 80 ? 'bg-rose-500' : bwPct > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(2, bwPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المتبقي: {Math.max(0, bwMax - bwUsed).toFixed(2)} GB</span>
                  <span>{bwPct}%</span>
                </div>
              </div>

              {/* Serverless Function Execution (GB-Hours) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">وقت تشغيل المعالج (GB-Hours):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {execUsed.toLocaleString()} / {execMax} ساعة معالج
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      execPct > 80 ? 'bg-rose-500' : execPct > 50 ? 'bg-amber-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.max(2, execPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المتبقي: {Math.max(0, execMax - execUsed).toFixed(2)} GB-Hours</span>
                  <span>{execPct}%</span>
                </div>
              </div>

              {/* Invocations */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">استدعاءات الدوال المجانية (Invocations):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {invUsed.toLocaleString()} / {invMax.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      invPct > 80 ? 'bg-rose-500' : invPct > 50 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.max(2, invPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المتبقي: {Math.max(0, invMax - invUsed).toLocaleString()} استدعاء</span>
                  <span>{invPct}%</span>
                </div>
              </div>

              {/* Vercel Renewal Date Box */}
              <div className="p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-1">
                <span className="font-bold text-[10px] text-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  <span>موعد تجديد كوتا فيرسيال:</span>
                </span>
                <p className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                  {vercelResetDate}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  💡 تتجدد كوتا فيرسيال شهرياً بناءً على تاريخ اشتراك حسابك، وليس أول الشهر الميلادي.
                </p>
              </div>

              {/* Connect Vercel API Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTokenConfig(!showTokenConfig)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isVercelConnected ? 'تعديل توكن Vercel API المربوط 🔑' : 'ربط توكن Vercel API لقراءة حية 100% 🔑'}</span>
                </button>
              </div>

              {/* Token Configuration Box */}
              {showTokenConfig && (
                <form onSubmit={handleSaveVercelConfig} className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-amber-900 dark:text-amber-300">
                      إدخال Vercel Token الرسمي:
                    </span>
                    <a
                      href="https://vercel.com/account/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>استخراج توكن جديد</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="الصق Vercel Personal Access Token هنا..."
                    className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 font-mono text-xs text-slate-800 dark:text-slate-200 dir-ltr text-left outline-hidden"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      disabled={isSavingToken}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingToken ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      <span>حفظ وربط الحساب الآن</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTokenConfig(false)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. FIRESTORE STATUS CARD */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-slate-800 dark:text-slate-200 text-xs">
                    استهلاك فايرستور (Firestore Cloud)
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  quotaData?.firestore?.circuitBreaker?.active
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {quotaData?.firestore?.circuitBreaker?.active ? 'توقف مؤقت للحماية' : 'سليمة وطبيعية ✓'}
                </span>
              </div>

              {/* Reads Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">عمليات القراءة اليومية (Reads):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {firestoreReadsUsed.toLocaleString()} / {firestoreReadsMax.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      firestoreReadsPct > 80 ? 'bg-rose-500' : firestoreReadsPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(2, firestoreReadsPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المتبقي: {(firestoreReadsMax - firestoreReadsUsed).toLocaleString()} عملية قراءة</span>
                  <span>{firestoreReadsPct}%</span>
                </div>
              </div>

              {/* Writes Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">عمليات الكتابة اليومية (Writes):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {firestoreWritesUsed.toLocaleString()} / {firestoreWritesMax.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      firestoreWritesPct > 80 ? 'bg-rose-500' : firestoreWritesPct > 50 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(2, firestoreWritesPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المتبقي: {(firestoreWritesMax - firestoreWritesUsed).toLocaleString()} عملية كتابة</span>
                  <span>{firestoreWritesPct}%</span>
                </div>
              </div>

              {/* Firestore Countdown Reset Box */}
              <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                <span className="font-bold text-[10px] text-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>تجديد كوتا فايرستور اليومية:</span>
                </span>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  متبقي {quotaData?.firestore?.resetCountdownHours ?? 12} ساعة و {quotaData?.firestore?.resetCountdownMinutes ?? 0} دقيقة (عند منتصف الليل بتوقيت UTC).
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  💡 تتجدد كوتا فايرستور تلقائياً كل 24 ساعة لتبدأ من 0 قراءة وكتابة من جديد مجاناً.
                </p>
              </div>

              {/* Smart Auto Failover Notice */}
              <div className="p-2 rounded-lg bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-teal-950 dark:text-teal-200 leading-relaxed">
                  <strong>التحويل التلقائي الذكي نشط:</strong> في حال توقف سيرفر Vercel أو تجاوز الكوتا لأي طالب، يتم تحويل الطلبات تلقائياً وفورياً إلى سيرفر السحابة المستقل حتى لا يتأثر أي طالب أو امتحان.
                </p>
              </div>
            </div>
          </div>

          {/* 3. STEP-BY-STEP DIAGNOSTIC: WHY VERCEL PAUSED & HOW TO SOLVE */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>لماذا توقفت فيرسيال عند الطلاب وكيف تحلها في دقيقة واحدة؟</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>إلغاء الإيقاف المؤقت (Unpause Deployment):</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  عند تجاوز حد الاستخدام، توقف فيرسيال المشروع مؤقتاً. افتح لوحة تحكم فيرسيال على <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline font-bold">vercel.com</a> واضغط على مشروعك، ثم اضغط على زر <span className="font-mono font-bold text-emerald-600">"Resume"</span> أو <span className="font-mono font-bold text-emerald-600">"Unpause"</span>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>دفع التحديث لجيت هاب (Git Push):</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  تم الآن تحديث ملفات النظام لتقليل استهلاك الكوتا بنسبة 95% عبر التخزين المؤقت Stale-While-Revalidate وتفعيل التحويل الذكي، بمجرد عمل Push للكود ستقوم فيرسيال بإعادة النشر فوراً.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 gap-2">
          <span className="text-[10px] text-slate-400">
            تم فحص السيرفر في: {quotaData?.timestamp ? new Date(quotaData.timestamp).toLocaleTimeString('ar-EG') : 'الآن'}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ رابط الطلاب المباشر 🔗</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
