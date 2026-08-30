import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  Award,
  Database,
  Link as LinkIcon,
  Unlink,
  X
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { GoogleSheetsService, GoogleSpreadsheetItem } from '../services/googleSheets';
import { api } from '../services/api';

export interface GoogleSheetsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'export' | 'import' | 'sheets';
}

export const GoogleSheetsHubModal: React.FC<GoogleSheetsHubModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'export'
}) => {
  const { showToast } = useCenter();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'sheets'>(defaultTab);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUser, setConnectedUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetsList, setSheetsList] = useState<GoogleSpreadsheetItem[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  // Import fields
  const [importSheetUrl, setImportSheetUrl] = useState('');
  const [importRange, setImportRange] = useState('A1:Z100');
  const [isImporting, setIsImporting] = useState(false);
  const [importedPreview, setImportedPreview] = useState<(string | number)[][] | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = () => {
    const token = GoogleSheetsService.getStoredToken();
    const user = GoogleSheetsService.getConnectedUser();
    setIsConnected(Boolean(token));
    setConnectedUser(user);
    if (token) {
      loadUserSheets();
    }
  };

  const handleConnectGoogle = async () => {
    setError(null);
    try {
      showToast('جارٍ الاتصال بحساب Google... ⏳', 'info');
      await GoogleSheetsService.requestAccessToken();
      checkAuthStatus();
      showToast('تم الاتصال بحساب Google Sheets بنجاح! 🚀', 'success');
    } catch (err: any) {
      setError(err?.message || 'فشل الاتصال بحساب Google');
      showToast('فشل الاتصال بحساب Google', 'error');
    }
  };

  const handleDisconnect = () => {
    GoogleSheetsService.disconnect();
    setIsConnected(false);
    setConnectedUser(null);
    setSheetsList([]);
    showToast('تم تسجيل الخروج من Google Sheets', 'info');
  };

  const loadUserSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const list = await GoogleSheetsService.listSpreadsheets();
      setSheetsList(list);
    } catch {
      // ignore
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleExportTrainees = async () => {
    setIsExporting('trainees');
    setError(null);
    setActionSuccess(null);
    try {
      showToast('جارٍ إنشاء وتصدير جدول المتدربين إلى Google Sheets... ⏳', 'info');
      const [trainees, courses, groups] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getCourses().catch(() => []),
        api.getGroups().catch(() => [])
      ]);
      const result = await GoogleSheetsService.exportTrainees(trainees, courses, groups);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setActionSuccess('تم تصدير سجل المتدربين بنجاح إلى جدول Google Sheets!');
      showToast('تم تصدير سجل المتدربين بنجاح! 📊', 'success');
      loadUserSheets();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء التصدير');
      showToast('فشل التصدير إلى Google Sheets', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportFinance = async () => {
    setIsExporting('finance');
    setError(null);
    setActionSuccess(null);
    try {
      showToast('جارٍ جلب وتصدير المعاملات المالية والخزينة إلى Google Sheets... ⏳', 'info');
      const [payments, expenses, trainees] = await Promise.all([
        api.getPayments().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getTrainees().catch(() => [])
      ]);
      const result = await GoogleSheetsService.exportFinance(payments, expenses, trainees);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setActionSuccess('تم تصدير السجل المالي والخزينة بنجاح إلى Google Sheets!');
      showToast('تم إنشاء جدول الحسابات على Google Sheets بنجاح! 💰', 'success');
      loadUserSheets();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء التصدير');
      showToast('فشل تصدير الحسابات', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportAttendance = async () => {
    setIsExporting('attendance');
    setError(null);
    setActionSuccess(null);
    try {
      showToast('جارٍ تصدير سجلات الحضور والغياب إلى Google Sheets... ⏳', 'info');
      const [attendance, trainees, groups] = await Promise.all([
        api.getAttendance().catch(() => []),
        api.getTrainees().catch(() => []),
        api.getGroups().catch(() => [])
      ]);
      const result = await GoogleSheetsService.exportAttendance(attendance, trainees, groups);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setActionSuccess('تم تصدير كشف الحضور والغياب بنجاح إلى Google Sheets!');
      showToast('تم تصدير الحضور والغياب بنجاح! 📋', 'success');
      loadUserSheets();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تصدير الحضور');
      showToast('فشل تصدير الحضور', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCertificates = async () => {
    setIsExporting('certificates');
    setError(null);
    setActionSuccess(null);
    try {
      showToast('جارٍ تصدير سجل الشهادات المعتمدة إلى Google Sheets... ⏳', 'info');
      const [certificates, trainees, courses] = await Promise.all([
        api.getCertificates().catch(() => []),
        api.getTrainees().catch(() => []),
        api.getCourses().catch(() => [])
      ]);
      const result = await GoogleSheetsService.exportCertificates(certificates, trainees, courses);
      setCreatedSheetUrl(result.spreadsheetUrl);
      setActionSuccess('تم تصدير سجل الشهادات المعتمدة بنجاح إلى Google Sheets!');
      showToast('تم تصدير سجل الشهادات بنجاح! 🎓', 'success');
      loadUserSheets();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تصدير الشهادات');
      showToast('فشل تصدير الشهادات', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportFullDatabase = async () => {
    setIsExporting('full');
    setError(null);
    setActionSuccess(null);
    try {
      showToast('جارٍ تصدير قاعدة بيانات المركز بالكامل إلى Google Sheets... ⏳', 'info');
      const [trainees, courses, groups, trainers] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getCourses().catch(() => []),
        api.getGroups().catch(() => []),
        api.getTrainers().catch(() => [])
      ]);
      const result = await GoogleSheetsService.exportEntireCenterDatabase({
        trainees,
        courses,
        groups,
        trainers
      });
      setCreatedSheetUrl(result.spreadsheetUrl);
      setActionSuccess('تم إنشاء نسخة احتياطية سحابية كاملة على Google Sheets بنجاح!');
      showToast('تم تصدير قاعدة بيانات المركز بالكامل! 🗄️', 'success');
      loadUserSheets();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء التصدير الشامل');
      showToast('فشل التصدير الشامل', 'error');
    } finally {
      setIsExporting(null);
    }
  };

  const handleFetchImportPreview = async () => {
    if (!importSheetUrl.trim()) {
      setError('يرجى إدخال رابط أو معرف جدول Google Sheets');
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      let sheetId = importSheetUrl.trim();
      const match = importSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        sheetId = match[1];
      }

      const rows = await GoogleSheetsService.readSpreadsheetValues(sheetId, importRange);
      setImportedPreview(rows);
      showToast(`تمت قراءة ${rows.length} صف من الجدول بنجاح!`, 'success');
    } catch (err: any) {
      setError(err?.message || 'تعذر جلب البيانات من Google Sheet. تأكد من صحة الرابط والصلاحيات.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">مركز التكامل مع Google Sheets™</h3>
              <p className="text-xs text-slate-400">المزامنة السحابية والتصدير المباشر للجداول وقواعد البيانات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-lg text-xs text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{connectedUser?.email || 'متصل بـ Google'}</span>
                <button
                  onClick={handleDisconnect}
                  title="قطع الاتصال"
                  className="hover:text-rose-400 p-1 transition-colors"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                ربط حساب Google
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            تصدير إلى جداول Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            استيراد وقراءة من Google Sheet
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            الجداول المنشأة سابقاً ({sheetsList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{actionSuccess}</span>
              </div>
              {createdSheetUrl && (
                <a
                  href={createdSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح الجدول في Google
                </a>
              )}
            </div>
          )}

          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                اختر القسم أو السجل المراد تصديره فورياً إلى جدول Google Sheets مع دعم اللغة العربية وتنسيق الجداول:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Trainees */}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Users className="w-4 h-4" />
                      سجل المتدربين والبيانات الشخصية
                    </div>
                    <p className="text-xs text-slate-400">
                      تصدير كود المتدرب، الاسم، الهواتف، الدورة، المجموعة، المدفوع والمتبقي.
                    </p>
                  </div>
                  <button
                    onClick={handleExportTrainees}
                    disabled={isExporting !== null}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {isExporting === 'trainees' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    تصدير سجل المتدربين
                  </button>
                </div>

                {/* Export Finance */}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <DollarSign className="w-4 h-4" />
                      السجل المالي والمصروفات والخزينة
                    </div>
                    <p className="text-xs text-slate-400">
                      تصدير جدولين: سجل إيصالات المقبوضات وسجل النثريات والمصروفات بالتفصيل.
                    </p>
                  </div>
                  <button
                    onClick={handleExportFinance}
                    disabled={isExporting !== null}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {isExporting === 'finance' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    تصدير الخزينة والحسابات
                  </button>
                </div>

                {/* Export Attendance */}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <Calendar className="w-4 h-4" />
                      سجلات الحضور والغياب للمجموعات
                    </div>
                    <p className="text-xs text-slate-400">
                      تصدير كشوفات التحضير اليومي مع حالات الحضور والغياب والتأخير.
                    </p>
                  </div>
                  <button
                    onClick={handleExportAttendance}
                    disabled={isExporting !== null}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-sky-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {isExporting === 'attendance' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    تصدير كشف الحضور
                  </button>
                </div>

                {/* Export Certificates */}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Award className="w-4 h-4" />
                      سجل الشهادات المعتمدة والـ QR
                    </div>
                    <p className="text-xs text-slate-400">
                      تصدير الأرقام التسلسلية للشهادات وروابط التحقق السريع والتقديرات.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCertificates}
                    disabled={isExporting !== null}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-purple-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {isExporting === 'certificates' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    تصدير سجل الشهادات
                  </button>
                </div>
              </div>

              {/* Master Full Database Backup */}
              <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-800/60 to-cyan-950/40 border border-emerald-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    تصدير قاعدة بيانات المركز كاملة (Google Sheet متعدد الصفحات)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    ينشئ جدولاً واحداً يحتوي على 4 صفحات منفصلة: المتدربون، الدورات، المجموعات، والمدربون.
                  </p>
                </div>
                <button
                  onClick={handleExportFullDatabase}
                  disabled={isExporting !== null}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  {isExporting === 'full' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  تصدير شامل الآن
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  رابط جدول Google Sheets أو المعرف (Spreadsheet ID / URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importSheetUrl}
                    onChange={e => setImportSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1aB2cD3eF4.../edit"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={importRange}
                    onChange={e => setImportRange(e.target.value)}
                    placeholder="A1:Z100"
                    title="النطاق (Range)"
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 text-center"
                  />
                  <button
                    onClick={handleFetchImportPreview}
                    disabled={isImporting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    قراءة البيانات
                  </button>
                </div>
              </div>

              {importedPreview && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">معاينة البيانات المستخرجة ({importedPreview.length} صف):</h4>
                  <div className="max-h-64 overflow-auto border border-slate-700 rounded-xl bg-slate-950">
                    <table className="w-full text-xs text-right text-slate-300 border-collapse">
                      <tbody>
                        {importedPreview.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800/80 font-bold text-slate-100 border-b border-slate-700' : 'border-b border-slate-800/40 hover:bg-slate-900'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-l border-slate-800/40 truncate max-w-xs">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED SHEETS LIST */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">الجداول المتزامنة والمنشأة من النظام:</span>
                <button
                  onClick={loadUserSheets}
                  disabled={isLoadingSheets}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheets ? 'animate-spin' : ''}`} />
                  تحديث القائمة
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sheetsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    لم يتم العثور على جداول منشأة حتى الآن. قم بتصدير سجل المتدربين لإنشاء أول جدول.
                  </div>
                ) : (
                  sheetsList.map((sheet, idx) => (
                    <div
                      key={sheet.id || idx}
                      className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">{sheet.name}</p>
                          {sheet.modifiedTime && (
                            <p className="text-[10px] text-slate-400">
                              آخر تعديل: {new Date(sheet.modifiedTime).toLocaleString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={sheet.webViewLink || `https://docs.google.com/spreadsheets/d/${sheet.id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        فتح الجدول
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsHubModal;
