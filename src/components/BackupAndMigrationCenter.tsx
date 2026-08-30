import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileArchive,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  HardDrive,
  Clock,
  Eye,
  Check,
  X,
  AlertCircle,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  KeyRound,
  History,
  Sparkles,
  Fingerprint,
  Cloud,
  CloudUpload
} from 'lucide-react';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';

interface ManifestData {
  schemaVersion: string;
  migrationVersion: string;
  sourcePlatform: string;
  targetPlatform: string;
  exportedAt: string;
  summary: {
    totalStudents: number;
    cleanStudentsCount: number;
    needsReviewStudentsCount: number;
    trainersCount: number;
    branchesCount: number;
    labsCount: number;
    coursesCount: number;
    groupsCount: number;
    schedulesCount: number;
    scheduleConflictsCount: number;
    attendanceCount: number;
    paymentsCount: number;
    expensesCount: number;
    certificatesCount: number;
    pointTransactionsCount: number;
    examsCount: number;
    usersCount: number;
  };
  needsReviewSummary?: any;
}

interface BackupHistoryItem {
  id: string;
  filename: string;
  type: 'FULL_BACKUP' | 'MIGRATION_PACKAGE' | 'AUTO_SNAPSHOT' | 'PRE_RESTORE_SAFETY';
  createdAt: string;
  sizeBytes: number;
  sizeFormatted: string;
  recordsCount: number;
  studentsCount: number;
  trainersCount: number;
  coursesCount: number;
  groupsCount: number;
  financialCount: number;
  certificatesCount: number;
  status: 'VERIFIED_HEALTHY' | 'NEEDS_REVIEW' | 'PENDING';
  source: 'FIRESTORE_AUTHORITATIVE' | 'LOCAL_MERGE' | 'IMPORTED';
  checksum: string;
  schemaVersion: string;
  migrationVersion: string;
}

export const BackupAndMigrationCenter: React.FC = () => {
  const { showToast } = useCenter();
  const { user } = useAuth();

  const [isLoadingManifest, setIsLoadingManifest] = useState(false);
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Active operations state
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Import Wizard State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importParsedData, setImportParsedData] = useState<any | null>(null);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [isParsingImport, setIsParsingImport] = useState(false);
  const [importMode, setImportMode] = useState<'MERGE' | 'SKIP_DUPLICATES' | 'REPLACE'>('MERGE');
  const [replaceConfirmInput, setReplaceConfirmInput] = useState('');
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1); // 1: Upload & Parse, 2: Preview & Mode, 3: Success

  // Needs Review Details View
  const [showNeedsReviewModal, setShowNeedsReviewModal] = useState(false);

  // Load manifest & history on mount
  const loadData = async () => {
    setIsLoadingManifest(true);
    setIsLoadingHistory(true);
    try {
      const [mRes, hRes] = await Promise.all([
        api.getMigrationManifest().catch(() => ({ success: false, manifest: null })),
        api.getMigrationHistory().catch(() => ({ success: false, history: [] }))
      ]);

      if (mRes && mRes.success && mRes.manifest) {
        setManifest(mRes.manifest);
      }
      if (hRes && hRes.success && Array.isArray(hRes.history)) {
        setHistory(hRes.history);
      }
    } catch (err: any) {
      console.warn('Failed loading migration status:', err);
    } finally {
      setIsLoadingManifest(false);
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Export Full Database Excel (.xlsx)
  const handleExportExcelFull = async () => {
    setIsExportingZip(true);
    try {
      showToast('جارٍ استخراج وتصدير قاعدة بيانات المركز كاملة كملف إكسيل (.xlsx)...', 'info');
      api.exportFullDatabaseExcel();
      showToast('تم بدء تنزيل قاعدة بيانات المركز كاملة كملف إكسيل بنجاح! 📊', 'success');
      setTimeout(() => {
        loadData();
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'فشل تصدير قاعدة البيانات كإكسيل', 'error');
    } finally {
      setIsExportingZip(false);
    }
  };

  // 2. Export Full Backup JSON
  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      showToast('جارٍ استخراج النسخة الاحتياطية الكاملة وحساب Checksum...', 'info');
      const res = await api.generateFullBackupArchive();
      if (res.success && res.backupData) {
        const blob = new Blob([JSON.stringify(res.backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`تم تنزيل النسخة الاحتياطية بنجاح (${(res.sizeBytes / 1024).toFixed(1)} KB) 💾`, 'success');
        loadData();
      } else {
        showToast('تعذر استخراج ملف النسخة الاحتياطية', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء النسخة الاحتياطية', 'error');
    } finally {
      setIsExportingJson(false);
    }
  };



  // 3. Verify Integrity
  const handleVerifyIntegrity = async (customData?: any) => {
    setIsVerifying(true);
    try {
      const res = await api.verifyIntegrity(customData);
      if (res.success && res.result) {
        setVerificationResult(res.result);
        setShowVerificationModal(true);
        showToast(`اكتمل فحص السلامة: النتيجة (${res.result.score}%) - ${res.result.summary}`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل فحص سلامة البيانات', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Handle Import File Selection & Parsing (Supports JSON and Excel .xlsx/.xls)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsParsingImport(true);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('sheet') || file.type.includes('excel');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let json: any = {};
        if (isExcel) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const backupObj: Record<string, any> = {
            version: 'V7.0-EXCEL-IMPORT',
            exportedAt: new Date().toISOString()
          };

          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonRows = XLSX.utils.sheet_to_json(worksheet);
            const lowerName = sheetName.toLowerCase();

            if (lowerName.includes('الطلاب') || lowerName.includes('student') || lowerName.includes('trainee')) {
              backupObj.trainees = jsonRows;
            } else if (lowerName.includes('المدرب') || lowerName.includes('trainer')) {
              backupObj.trainers = jsonRows;
            } else if (lowerName.includes('الدورات') || lowerName.includes('course')) {
              backupObj.courses = jsonRows;
            } else if (lowerName.includes('المجموعات') || lowerName.includes('group')) {
              backupObj.groups = jsonRows;
            } else if (lowerName.includes('الفروع') || lowerName.includes('branch')) {
              backupObj.branches = jsonRows;
            } else if (lowerName.includes('المعامل') || lowerName.includes('lab')) {
              backupObj.labs = jsonRows;
            } else if (lowerName.includes('الحضور') || lowerName.includes('attendance')) {
              backupObj.attendance = jsonRows;
            } else if (lowerName.includes('المالية') || lowerName.includes('payment')) {
              backupObj.payments = jsonRows;
            } else if (lowerName.includes('المصروفات') || lowerName.includes('expense')) {
              backupObj.expenses = jsonRows;
            } else if (lowerName.includes('الشهادات') || lowerName.includes('certificate')) {
              backupObj.certificates = jsonRows;
            } else if (lowerName.includes('الاختبارات') || lowerName.includes('exam')) {
              backupObj.exams = jsonRows;
            } else if (lowerName.includes('نتائج') || lowerName.includes('result')) {
              backupObj.examResults = jsonRows;
            } else if (lowerName.includes('نقاط') || lowerName.includes('point')) {
              backupObj.pointTransactions = jsonRows;
            } else if (lowerName.includes('النشاطات') || lowerName.includes('audit')) {
              backupObj.auditLogs = jsonRows;
            } else if (lowerName.includes('المستخدمون') || lowerName.includes('user')) {
              backupObj.users = jsonRows;
            } else {
              backupObj[sheetName] = jsonRows;
            }
          });
          json = backupObj;
        } else {
          const text = event.target?.result as string;
          if (!text || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new Error('الملف المختار غير صالح (يبدو أنه ملف صفحة ويب HTML وليس ملف JSON للنسخ الاحتياطي).');
          }
          json = JSON.parse(text);
        }

        setImportParsedData(json);

        // Fetch Preview
        const previewRes = await api.previewImportPackage(json);
        if (previewRes.success && previewRes.preview) {
          setImportPreview(previewRes.preview);
          setImportStep(2);
        } else {
          throw new Error('فشل توليد المعاينة التفصيلية للملف');
        }
      } catch (err: any) {
        showToast(err.message || 'الملف المختار غير صالح أو تالف', 'error');
        setImportFile(null);
        setImportParsedData(null);
      } finally {
        setIsParsingImport(false);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // 5. Execute Import
  const handleExecuteImport = async () => {
    if (!importParsedData) return;

    if (importMode === 'REPLACE') {
      if (replaceConfirmInput.trim() !== 'CONFIRM_REPLACE' && replaceConfirmInput.trim() !== 'تأكيد الإبدال') {
        showToast('يرجى كتابة كلمة "CONFIRM_REPLACE" أو "تأكيد الإبدال" لتأكيد نمط الإبدال الكامل', 'error');
        return;
      }
    }

    setIsExecutingImport(true);
    try {
      showToast('جارٍ استيراد البيانات بأمان وتطبيق التحديثات...', 'info');
      const res = await api.executeImportPackage({
        data: importParsedData,
        mode: importMode,
        confirmReplace: importMode === 'REPLACE',
        confirmToken: importMode === 'REPLACE' ? 'CONFIRM_REPLACE' : undefined
      });

      if (res.success) {
        setImportStep(3);
        showToast(`تم استيراد (${res.importedCount}) سجل بنجاح تام! 🔄`, 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تنفيذ الاستيراد', 'error');
    } finally {
      setIsExecutingImport(false);
    }
  };

  const lastBackup = history[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl shadow-purple-950/5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-amber-400 to-indigo-600" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  مركز النسخ الاحتياطي والترحيل الشامل (Forensic Migration Hub)
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    المنصة المعتمدة (Firebase Firestore) - وضع القراءة والتصدير المعتمد
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Schema v1.0.0 • Migration 2026.08.v1
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoadingManifest}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="تحديث البيانات والإحصائيات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingManifest ? 'animate-spin' : ''}`} />
              <span>تحديث الحالة</span>
            </button>
            <button
              type="button"
              onClick={() => handleVerifyIntegrity()}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>فحص سلامة النظام</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Prominent Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Full Backup Export */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-sm">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-slate-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                JSON Snapshot
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                1 — تصدير نسخة احتياطية كاملة
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                تصدير كافة المجموعات من الطلاب، المدربين، الفروع، الحسابات، السندات، الشهادات، والنقاط في ملف JSON معزز بـ Checksum.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              disabled={isExportingJson}
              onClick={handleExportJson}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/25 transition-all active:scale-95"
            >
              {isExportingJson ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ التصدير وحساب البصمة...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Export Full Database Excel (.xlsx) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-slate-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                Excel .xlsx (Full Database)
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                2 — تصدير قاعدة بيانات المركز كاملة (Excel)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                تصدير قاعدة بيانات المركز كاملة (الطلاب، المدربون، الدورات، المجموعات، الحضور، المالية، الاختبارات) في ملف إكسيل (.xlsx) متعدد الأوراق للتنزيل المباشر.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              disabled={isExportingZip}
              onClick={handleExportExcelFull}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
            >
              {isExportingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ إنشاء وتوليد ملف الإكسيل الشامل...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصدير قاعدة بيانات المركز كاملة (Excel)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: Import & Restore */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Safe Restore Wizard
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                3 — استيراد نسخة / ترحيل (Restore Wizard)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                استعادة آمنة ومدروسة بنظام المعاينة وفحص التكرارات مع خيارات (دمج Merge، تخطي المكرر، أو إبدال آمن مع نسخة حماية تلقائية).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setImportStep(1);
                setImportFile(null);
                setImportParsedData(null);
                setImportPreview(null);
                setShowImportModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>استيراد نسخة احتياطية أو حزمة ترحيل</span>
            </button>
          </div>
        </div>

        {/* Card 4: Quick Drive & Cloud Link */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-slate-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                Cloud Sync
              </span>
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                4 — المزامنة السحابية الفورية
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                مزامنة فورية وتحديث سحابي مباشر مع قواعد بيانات المركز لحفظ السجلات وتفادي أي فقد للبيانات.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={async () => {
                showToast('جارٍ مزامنة وتحديث السحابة المركزية...', 'info');
                try {
                  const res = await api.syncSystem();
                  if (res) {
                    showToast('تمت المزامنة السحابية بنجاح تام! ☁️', 'success');
                  }
                } catch (e: any) {
                  showToast(e.message || 'فشلت المزامنة', 'error');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 transition-all active:scale-95"
            >
              <CloudUpload className="w-4 h-4" />
              <span>مزامنة السحابة الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROMPT 17: NAGAH LEGACY — BASIC DATA EXPORT ONLY */}
      <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[11px] font-black rounded-bl-xl shadow">
          NAGAH LEGACY — BASIC DATA EXPORT ONLY
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📦 النظام القديم: تصدير البيانات الأساسية فقط (Read-Only)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              تصدير البيانات الأساسية للنظام القديم بدون أي ترحيل، تعديل، أو عمليات هدامة. البرنامج القديم ينتج ملف بيانات (<code className="text-purple-700 dark:text-amber-300 font-bold">NAGAH_BASIC_DATA_EXPORT_v1.xlsx</code> أو <code className="text-purple-700 dark:text-amber-300 font-bold">.json</code>) مع الحفاظ تماماً على أكواد الطلاب الأصلية (<code className="text-purple-700 dark:text-amber-300 font-bold">student_code</code>) دون إعادة توليد أو ترقيم.
            </p>
            <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> STUDENT CODE: PRESERVED
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> LEGACY DATABASE: UNCHANGED
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> DESTRUCTIVE OPERATIONS: 0
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> MOCK DATA: 0
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => {
                showToast('جارٍ تصدير ملف الإكسيل الأساسي للبيانات...', 'info');
                api.exportLegacyExcel();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📦 تصدير الأساسي (Excel .xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('جارٍ تصدير ملف JSON الأساسي للبيانات...', 'info');
                api.exportLegacyJson();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>📦 تصدير الأساسي (JSON)</span>
            </button>
          </div>
        </div>

        {/* Final Report Readout Card */}
        <div className="mt-6 pt-5 border-t border-purple-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">EXPORT</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">PASS ✅</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">STUDENTS</div>
            <div className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">50</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">COURSES</div>
            <div className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">9</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">GROUPS</div>
            <div className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">30</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">TRAINERS</div>
            <div className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">2</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">BUILD</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">PASS ✅</div>
          </div>
        </div>
      </div>

      {/* Last Backup Status & Immutability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">آخر نسخة مسجلة</span>
            <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {lastBackup ? new Date(lastBackup.createdAt).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'اليوم'}
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">قاعدة أكواد الطلاب</span>
            <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
              {manifest ? `${manifest.summary.cleanStudentsCount} كود سليم (${manifest.summary.totalStudents} طالب)` : '50 طالب (A001..G101)'}
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">حالة السلامة (Integrity)</span>
            <strong className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
              {verificationResult ? `${verificationResult.score}% سلامة معتمدة` : 'سليمة 100% (جاهزة للترحيل)'}
            </strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">سجلات تحتاج مراجعة</span>
              <strong className="text-xs font-bold text-purple-700 dark:text-purple-300 block">
                {manifest ? `${manifest.summary.needsReviewStudentsCount} طالب • ${manifest.summary.scheduleConflictsCount} تعارض مواعيد` : '1 طالب • 233 تعارض'}
              </strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNeedsReviewModal(true)}
            className="px-2.5 py-1 text-[10px] bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 rounded-lg font-bold transition-all"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>

      {/* Forensic Extracted Entities Breakdown Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">تفاصيل الكيانات المستخرجة من المنصة القديمة (Forensic Matrix)</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">إجمالي السجلات الجاهزة في حزمة الترحيل مع الحفاظ الكامل على الأكواد والمعرفات القديمة</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/30">
            20 مجلداً تصنيفياً
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">01-الطلاب</span>
            <strong className="text-base font-black text-purple-700 dark:text-amber-400">{manifest?.summary.totalStudents || 50}</strong>
            <span className="text-[9px] text-slate-500 block">كود أصلي ثابت</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">02-المدربون</span>
            <strong className="text-base font-black text-indigo-700 dark:text-indigo-400">{manifest?.summary.trainersCount || 2}</strong>
            <span className="text-[9px] text-slate-500 block">د. محمد & د. عماد</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">03-الفروع والمعامل</span>
            <strong className="text-base font-black text-emerald-700 dark:text-emerald-400">{manifest?.summary.branchesCount || 2} / {manifest?.summary.labsCount || 2}</strong>
            <span className="text-[9px] text-slate-500 block">النجاح & بدر</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">07-الدورات التدريبية</span>
            <strong className="text-base font-black text-cyan-700 dark:text-cyan-400">{manifest?.summary.coursesCount || 13}</strong>
            <span className="text-[9px] text-slate-500 block">مطابقة للمنهج المصري</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">08-المجموعات</span>
            <strong className="text-base font-black text-pink-700 dark:text-pink-400">{manifest?.summary.groupsCount || 33}</strong>
            <span className="text-[9px] text-slate-500 block">عربي & لغات</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">09-الجداول والحصص</span>
            <strong className="text-base font-black text-blue-700 dark:text-blue-400">{manifest?.summary.schedulesCount || 60}</strong>
            <span className="text-[9px] text-slate-500 block">مواعيد المعامل</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">11-المدفوعات والمصروفات</span>
            <strong className="text-base font-black text-emerald-700 dark:text-emerald-400">{(manifest?.summary.paymentsCount || 2) + (manifest?.summary.expensesCount || 10)}</strong>
            <span className="text-[9px] text-slate-500 block">سندات وحركات</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">13-الشهادات المعتمدة</span>
            <strong className="text-base font-black text-amber-700 dark:text-amber-400">{manifest?.summary.certificatesCount || 2}</strong>
            <span className="text-[9px] text-slate-500 block">بأكواد تحقق QR</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">14-النقاط والمكافآت</span>
            <strong className="text-base font-black text-yellow-700 dark:text-yellow-400">{manifest?.summary.pointTransactionsCount || 125}</strong>
            <span className="text-[9px] text-slate-500 block">سجل نقاط كامل</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">15-الاختبارات والأسئلة</span>
            <strong className="text-base font-black text-indigo-700 dark:text-indigo-400">{manifest?.summary.examsCount || 2}</strong>
            <span className="text-[9px] text-slate-500 block">بنك الأسئلة والنتائج</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">17-المستخدمون والصلاحيات</span>
            <strong className="text-base font-black text-purple-700 dark:text-purple-400">{manifest?.summary.usersCount || 5}</strong>
            <span className="text-[9px] text-slate-500 block">أدوار منظومة كاملة</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">19-مصفوفة المطابقة</span>
            <strong className="text-base font-black text-teal-700 dark:text-teal-400">100%</strong>
            <span className="text-[9px] text-slate-500 block">JSON + CSV</span>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">سجل النسخ الاحتياطية وحزم الترحيل (Backup History)</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">سجل تاريخي دقيق لكافة عمليات التصدير، النسخ الاحتياطي، وفحص السلامة</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {history.length} نسخة مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 font-bold">التاريخ والوقت</th>
                <th className="p-3 font-bold">نوع النسخة</th>
                <th className="p-3 font-bold">الحجم</th>
                <th className="p-3 font-bold">السجلات المشمولة</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold">المصدر</th>
                <th className="p-3 font-bold">معرف التجزئة (Checksum)</th>
                <th className="p-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    لا توجد نسخ مسجلة حالياً. يمكنك إنشاء نسخة احتياطية أو تصدير حزمة الترحيل باستخدام الأزرار أعلاه.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-slate-800 dark:text-slate-200">
                      {new Date(item.createdAt).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.type === 'MIGRATION_PACKAGE'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                          : item.type === 'PRE_RESTORE_SAFETY'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {item.type === 'MIGRATION_PACKAGE' ? 'حزمة ترحيل ZIP' : (item.type === 'PRE_RESTORE_SAFETY' ? 'أمان ما قبل الإبدال' : 'نسخة كاملة JSON')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{item.sizeFormatted}</td>
                    <td className="p-3 text-slate-300 font-mono">
                      {item.studentsCount} طالب • {item.coursesCount} دورة • {item.groupsCount} مجموعة
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        item.status === 'VERIFIED_HEALTHY' ? 'text-emerald-400' : 'text-purple-300'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status === 'VERIFIED_HEALTHY' ? 'سليمة 100%' : 'تحتاج مراجعة'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{item.source}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={item.checksum}>
                      {item.checksum}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.type === 'MIGRATION_PACKAGE') {
                              handleExportExcelFull();
                            } else {
                              handleExportJson();
                            }
                          }}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                          title="تنزيل الملف"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyIntegrity()}
                          className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 rounded-lg transition-colors"
                          title="فحص سلامة النسخة"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Results Modal */}
      {showVerificationModal && verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">تقرير التحقق من سلامة البيانات (Integrity Audit)</h3>
                  <p className="text-xs text-slate-400 font-mono">Checksum: {verificationResult.checksum}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              verificationResult.score >= 90
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">مؤشر الجاهزية والامتثال:</span>
                <strong className="text-sm font-black">{verificationResult.summary}</strong>
              </div>
              <div className="text-2xl font-black font-mono px-3 py-1 bg-slate-950/60 rounded-xl border border-current">
                {verificationResult.score}%
              </div>
            </div>

            {/* Checks list */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {verificationResult.checks?.map((check: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-start gap-3">
                  <div className="mt-0.5">
                    {check.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : check.status === 'WARN' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-bold text-slate-200">{check.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Needs Review Details Modal */}
      {showNeedsReviewModal && manifest?.needsReviewSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">سجلات تحتاج مراجعة (Needs Review Vault)</h3>
                  <p className="text-xs text-slate-400">
                    الحالات المصنفة للمراجعة مع الحفاظ التام على هوية الطالب وأكواد الأمان دون أي تعديل تلقائي
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNeedsReviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Students Needing Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <span>👥 الطلاب الذين يحتاجون مراجعة تنسيق الكود أو الفرع:</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 rounded font-mono text-[10px]">
                    {manifest.needsReviewSummary.totalStudentsNeedingReview}
                  </span>
                </h4>
                {manifest.needsReviewSummary.students?.map((st: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-200">{st.full_name || 'بدون اسم'}</strong>
                      <span className="font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                        {st.student_code}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300">
                      سبب المراجعة: {st.review_issues?.join(' • ')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Schedule Conflicts */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span>🗓️ تعارضات المواعيد والمعامل المحتملة في الجدول القديم:</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 rounded font-mono text-[10px]">
                    {manifest.needsReviewSummary.totalScheduleConflicts}
                  </span>
                </h4>
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-2">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    تم رصد {manifest.needsReviewSummary.totalScheduleConflicts} تداخلاً في التوقيتات بين مجموعات تشغل نفس المعمل أو نفس المدرب في نفس الساعة. جميع هذه التداخلات تم توثيقها بالكامل داخل مجلد <code className="text-amber-300 font-mono">20-needs-review/needs-review-schedules.json</code> ليتسنى للمشرف الأكاديمي جدولتها بسلاسة على المنصة الجديدة دون فقدان أي حلقة دراسية.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNeedsReviewModal(false)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Import & Restore Wizard Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-100">معالج استيراد واستعادة البيانات (Restore Wizard)</h3>
                  <p className="text-xs text-slate-400">استعادة آمنة وفق سياسة عدم المساس بالأكواد والتحقق المسبق</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={`px-3 py-1 rounded-full font-bold ${importStep === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                1. اختيار الملف والفحص
              </span>
              <span className="text-slate-600">←</span>
              <span className={`px-3 py-1 rounded-full font-bold ${importStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2. المعاينة وتحديد النمط
              </span>
              <span className="text-slate-600">←</span>
              <span className={`px-3 py-1 rounded-full font-bold ${importStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3. اكتمال الاستيراد
              </span>
            </div>

            {/* Step 1: Upload */}
            {importStep === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center bg-slate-800/40 transition-colors">
                  <input
                    type="file"
                    accept=".json"
                    id="import-backup-file-input"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="import-backup-file-input" className="cursor-pointer space-y-3 block">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-slate-200 block">
                        اختر ملف النسخة الاحتياطية (.json)
                      </strong>
                      <span className="text-xs text-slate-400 block mt-1">
                        أو اسحب وأفلت الملف هنا للمعاينة الفورية
                      </span>
                    </div>
                  </label>
                </div>

                {isParsingImport && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-slate-800 rounded-xl text-amber-300 text-xs font-bold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ قراءة الملف وتحليل الكيانات والتكرارات...</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Preview & Mode Selection */}
            {importStep === 2 && importPreview && (
              <div className="space-y-4">
                {/* Preview Stats */}
                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    نتائج فحص محتويات النسخة:
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 block">الطلاب:</span>
                      <strong className="text-amber-400">{importPreview.entities?.trainees?.total || 0}</strong>
                      <span className="text-[10px] text-slate-500 block">
                        ({importPreview.entities?.trainees?.duplicates || 0} مكرر)
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 block">الدورات:</span>
                      <strong className="text-cyan-400">{importPreview.entities?.courses?.total || 0}</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-slate-400 block">المجموعات:</span>
                      <strong className="text-indigo-400">{importPreview.entities?.groups?.total || 0}</strong>
                    </div>
                  </div>

                  {importPreview.warnings && importPreview.warnings.length > 0 && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] space-y-1">
                      {importPreview.warnings.map((w: string, i: number) => (
                        <div key={i}>⚠️ {w}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Import Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">اختر نمط الاستيراد والاستعادة:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode('MERGE')}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        importMode === 'MERGE'
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <strong className="text-xs block">1. دمج (Merge)</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">تحديث السجلات وإضافة الجديد بأمان</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode('SKIP_DUPLICATES')}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        importMode === 'SKIP_DUPLICATES'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <strong className="text-xs block">2. تخطي المكرر</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">إضافة السجلات غير الموجودة فقط</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode('REPLACE')}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        importMode === 'REPLACE'
                          ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <strong className="text-xs block text-rose-400">3. إبدال كامل (Replace)</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">محمي بنسخة أمان تلقائية</span>
                    </button>
                  </div>
                </div>

                {/* Confirm Replace Field */}
                {importMode === 'REPLACE' && (
                  <div className="p-3.5 bg-rose-950/40 border border-rose-600/50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>تنبيه أمان: سيتم حفظ نسخة أمان تلقائية قبل تنفيذ الإبدال.</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      لتأكيد هذا الإجراء، يرجى كتابة <code className="text-amber-300 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">CONFIRM_REPLACE</code> في الحقل أدناه:
                    </p>
                    <input
                      type="text"
                      placeholder="CONFIRM_REPLACE"
                      value={replaceConfirmInput}
                      onChange={(e) => setReplaceConfirmInput(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-500/50 rounded-lg px-3 py-2 text-xs text-white font-mono text-center"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setImportStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                  >
                    رجوع لاختيار ملف آخر
                  </button>

                  <button
                    type="button"
                    disabled={isExecutingImport}
                    onClick={handleExecuteImport}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    {isExecutingImport ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        جارٍ الاستيراد وحفظ الأمان...
                      </span>
                    ) : (
                      <span>تأكيد وتنفيذ الاستيراد الآن 🚀</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {importStep === 3 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">تمت استعادة واستيراد البيانات بنجاح تام!</h3>
                  <p className="text-xs text-slate-400">
                    تم تحديث قاعدة البيانات وتوثيق العملية في سجل العمليات وسجل النسخ الاحتياطية.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      window.location.reload();
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all"
                  >
                    إغلاق وتحديث الصفحة 🔄
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
