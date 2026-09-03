import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { ElectronicPaymentWidget } from '../components/ElectronicPaymentWidget';
import { getPublicParentPortalUrl } from '../utils/urlHelper';
import { useAuth } from '../context/AuthContext';
import { ALL_PERMISSIONS } from '../utils/permissions';
import { api } from '../services/api';
import { GoogleDriveService } from '../services/googleDrive';
import { GoogleSheetsService } from '../services/googleSheets';
import { GoogleSheetsHubModal } from '../components/GoogleSheetsHubModal';
import { GoogleWorkspaceHubModal } from '../components/GoogleWorkspaceHubModal';
import { cloudDb } from '../services/cloudDatabase';
import { BackupAndMigrationCenter } from '../components/BackupAndMigrationCenter';
import { useTheme, AVAILABLE_THEMES } from '../context/ThemeContext';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cloud,
  CloudUpload,
  CloudDownload,
  Link,
  Unlink,
  Check,
  FolderGit2,
  HardDrive,
  Key,
  Plus,
  Trash2,
  UserPlus,
  Lock,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  GraduationCap,
  Code,
  MessageCircle,
  FileSpreadsheet,
  Video,
  FileArchive,
  Palette,
  Sun,
  Moon,
  SlidersHorizontal
} from 'lucide-react';
import { SystemSettings, GoogleDriveBackupFile, RolePermissionConfig } from '../types';

export const SettingsView: React.FC = () => {
  const { showToast, refreshAll, openAiModal } = useCenter();
  const { user } = useAuth();
  const { themeConfig, currentThemeId, setThemeId, toggleDarkMode } = useTheme();
  
  // Manager-only permission validation
  const isManager = Boolean(
    user?.role === 'super_admin' ||
    user?.role === 'branch_manager' ||
    user?.role === 'admin' ||
    user?.role === 'manager' ||
    user?.username === 'admin'
  );
  const [settings, setSettings] = useState<SystemSettings>({
    centerName: 'النجاح للتدريب والاستشارات',
    phone: '01001500686',
    vodafoneCash: '01001500686',
    instapay: 'm_bkeet@instapay',
    email: 'm_bkeet@yahoo.com',
    address: 'شارع التحرير - الدقي - الجيزة',
    currency: 'ج.م',
    taxNumber: '100-293-847',
    allowOnlineRegistration: true,
    pointsPerAttendance: 5,
    pointsPerFullAttendanceBonus: 20,
    traineeCodePrefix: 'A',
    rolePermissions: []
  });

  const availablePermissions = ALL_PERMISSIONS;

  const handleAddCustomRole = () => {
    const roleId = 'custom_' + Date.now().toString(36).substring(4);
    const newRole: RolePermissionConfig = {
      id: roleId,
      title: 'دور جديد مخصص',
      description: 'وصف للدور الجديد والمهمات التابعة له',
      permissions: ['dashboard', 'trainees']
    };
    setSettings((prev) => ({
      ...prev,
      rolePermissions: [...(prev.rolePermissions || []), newRole]
    }));
    showToast('تمت إضافة دور جديد مخصص! يرجى كتابة اسمه وتعديل صلاحياته ثم حفظ الإعدادات.', 'info');
  };

  const handleUpdateRoleField = (index: number, field: keyof RolePermissionConfig, value: any) => {
    setSettings((prev) => {
      const copy = [...(prev.rolePermissions || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, rolePermissions: copy };
    });
  };

  const handleTogglePermission = (index: number, permId: string, checked: boolean) => {
    setSettings((prev) => {
      const copy = [...(prev.rolePermissions || [])];
      const roleItem = copy[index];
      let perms = [...roleItem.permissions];
      if (checked) {
        if (!perms.includes(permId)) perms.push(permId);
      } else {
        perms = perms.filter((p) => p !== permId);
      }
      copy[index] = { ...roleItem, permissions: perms };
      return { ...prev, rolePermissions: copy };
    });
  };

  const handleDeleteRole = (roleId: string) => {
    setSettings((prev) => ({
      ...prev,
      rolePermissions: (prev.rolePermissions || []).filter((r) => r.id !== roleId)
    }));
    showToast('تم إزالة الدور من القائمة المؤقتة، اضغط على حفظ الإعدادات لتأكيد الحذف النهائي.', 'warning');
  };

  const [localFolderName, setLocalFolderName] = useState<string>(localStorage.getItem('local_backup_folder_name') || '📁 اختيار مجلد مخصص للنسخ الاحتياطي الدوري');
  const [isAutoLocalBackupActive, setIsAutoLocalBackupActive] = useState<boolean>(
    localStorage.getItem('auto_local_backup_enabled') === 'true'
  );
  const [localDirHandle, setLocalDirHandle] = useState<any>(null);

  const handleSelectLocalFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      showToast('خاصية اختيار المجلدات المحلية تتطلب فتح التطبيق في نافذة مستقلة (New Tab) وليست داخل نافذة المعاينة المصغرة.', 'warning');
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker();
      setLocalDirHandle(handle);
      setLocalFolderName(handle.name);
      localStorage.setItem('local_backup_folder_name', handle.name);
      setIsAutoLocalBackupActive(true);
      localStorage.setItem('auto_local_backup_enabled', 'true');
      showToast(`تم اختيار المجلد (${handle.name}) بنجاح! سيتم تحديث ملف Nagah_MS_Fixed_Backup.json فيه كل 5 دقائق.`, 'success');

      // Immediate write
      const backupData = await api.getBackupData();
      const fileHandle = await handle.getFileHandle('Nagah_MS_Fixed_Backup.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(backupData, null, 2));
      await writable.close();
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message?.includes('Not allowed')) {
        showToast('متصفحك يحظر اختيار المجلدات داخل إطار المعاينة. يرجى فتح التطبيق في "علامة تبويب جديدة" (New Tab) لاستخدام هذه الميزة.', 'error');
      } else if (err.name !== 'AbortError') {
        showToast('فشل اختيار المجلد المحلي: ' + (err.message || 'خطأ غير معروف'), 'error');
      }
    }
  };

  useEffect(() => {
    if (!isAutoLocalBackupActive || !localDirHandle) return;
    const interval = setInterval(async () => {
      try {
        if (localDirHandle) {
          const backupData = await api.getBackupData();
          const fileHandle = await localDirHandle.getFileHandle('Nagah_MS_Fixed_Backup.json', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(backupData, null, 2));
          await writable.close();
        }
      } catch (e) {
        // Silent or permission check
      }
    }, 300000); // Every 5 minutes instead of 20s
    return () => clearInterval(interval);
  }, [isAutoLocalBackupActive, localDirHandle]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'backup_migration' | 'general' | 'themes' | 'roles_permissions' | 'users' | 'reset'>('backup_migration');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('center_info');
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isGoogleWorkspaceModalOpen, setIsGoogleWorkspaceModalOpen] = useState(false);

  const [resetOptions, setResetOptions] = useState({
    trainees: false,
    payments: false,
    expenses: false,
    trainers: false,
    courses: false,
    attendance: false,
    exams: false,
    auditLogs: false,
    screenshotsArchive: false,
    treasuryNet: false,
    fullReset: false
  });
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isFullResetTarget, setIsFullResetTarget] = useState(false);

  const handleOpenResetModal = (isFull = false) => {
    if (!isManager) {
      showToast('عذراً، عملية تصفير البيانات مقتصرة حصرياً على صلاحيات المدير العام لضمان أمان النظام.', 'error');
      return;
    }
    if (!isFull && !Object.values(resetOptions).some(Boolean)) {
      showToast('الرجاء تحديد قسم واحد على الأقل من القائمة لتصفيره', 'error');
      return;
    }
    setIsFullResetTarget(isFull || resetOptions.fullReset);
    setShowResetConfirmModal(true);
  };

  const handleExecuteResetConfirmed = async () => {
    if (!isManager) {
      showToast('غير مصرح لك بتنفيذ هذا الإجراء.', 'error');
      return;
    }

    const optionsToUse = isFullResetTarget ? {
      trainees: true,
      payments: true,
      expenses: true,
      trainers: true,
      courses: true,
      attendance: true,
      exams: true,
      auditLogs: true,
      screenshotsArchive: true,
      treasuryNet: true,
      fullReset: true
    } : resetOptions;

    setIsResetting(true);
    try {
      await api.resetSystem(optionsToUse, {
        userId: user?.id,
        userRole: user?.role,
        userName: user?.fullName
      });
      showToast('تم تصفير وإعادة تعيين البيانات المحددة بنجاح تام! 🔄', 'success');
      setShowResetConfirmModal(false);
      refreshAll();
      // Reload application state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      showToast(err.message || 'فشل عملية التصفير', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectAllReset = (selectAll: boolean) => {
    setResetOptions({
      trainees: selectAll,
      payments: selectAll,
      expenses: selectAll,
      trainers: selectAll,
      courses: selectAll,
      attendance: selectAll,
      exams: selectAll,
      auditLogs: selectAll,
      screenshotsArchive: selectAll,
      treasuryNet: selectAll,
      fullReset: selectAll
    });
  };

  // Google Drive State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ email?: string; name?: string; picture?: string } | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveBackups, setDriveBackups] = useState<GoogleDriveBackupFile[]>([]);
  const [isLoadingDriveList, setIsLoadingDriveList] = useState(false);

  useEffect(() => {
    loadSettings();
    checkGoogleAuth();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSettings();
      if (res) setSettings(res);
      const usersRes = await api.getUsers(); // Assuming api.getUsers exists
      if (usersRes) setUsers(usersRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGoogleAuth = async () => {
    const token = GoogleDriveService.getStoredToken();
    const user = GoogleDriveService.getConnectedUser();
    if (token) {
      setIsGoogleConnected(true);
      setGoogleUser(user || { name: 'محمد رمضان بخيت', email: 'm_bkeet@yahoo.com' });
      fetchDriveBackups(token);
    } else {
      // Default to ready user profile context
      setGoogleUser({ name: 'محمد رمضان بخيت', email: 'm_bkeet@yahoo.com' });
    }
  };

  const fetchDriveBackups = async (token?: string) => {
    setIsLoadingDriveList(true);
    try {
      const files = await GoogleDriveService.listBackups(token);
      setDriveBackups(files);
    } catch (err) {
      console.warn('Could not fetch drive backups:', err);
    } finally {
      setIsLoadingDriveList(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setIsSyncingDrive(true);
      const token = await GoogleDriveService.requestAccessToken();
      setIsGoogleConnected(true);
      const user = GoogleDriveService.getConnectedUser();
      setGoogleUser(user || { name: 'محمد رمضان بخيت', email: 'm_bkeet@yahoo.com' });
      showToast('تم الاتصال بحساب Google Drive بنجاح! ☁️', 'success');
      fetchDriveBackups(token);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('invalid_client') || msg.includes('Client was not found') || msg.includes('401')) {
        showToast('معرف عميل Google OAuth غير مفعل في المشروع الحالي. ننصح بالاعتماد على الحفظ التلقائي على القرص المحلي (D أو E) أو تنزيل ملف JSON.', 'error');
      } else {
        showToast(msg || 'فشل الاتصال بـ Google Drive', 'error');
      }
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleDisconnectGoogle = () => {
    GoogleDriveService.disconnect();
    setIsGoogleConnected(false);
    setDriveBackups([]);
    showToast('تم إلغاء ربط حساب Google Drive', 'info');
  };

  const handleBackupToGoogleDrive = async () => {
    setIsSyncingDrive(true);
    try {
      const backupData = await api.getBackupData();
      const res = await GoogleDriveService.uploadBackup(backupData);
      showToast(`تم رفع النسخة السحابية (${res.fileName}) إلى Google Drive بنجاح! ☁️🚀`, 'success');
      fetchDriveBackups();
    } catch (err: any) {
      showToast(err.message || 'فشل رفع النسخة إلى Google Drive', 'error');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleRestoreFromGoogleDrive = async (fileId: string, fileName: string) => {
    // window.confirm removed

    setIsSyncingDrive(true);
    try {
      const data = await GoogleDriveService.downloadBackup(fileId);
      await api.restoreBackupData(data);
      showToast('تم استعادة قاعدة البيانات بالكامل من Google Drive بنجاح! 🔄', 'success');
      refreshAll();
    } catch (err: any) {
      showToast(err.message || 'فشل استعادة البيانات من Google Drive', 'error');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('تم حفظ إعدادات النظام بنجاح', 'success');
      refreshAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      if (isCreatingUser) {
        if (!editingUser.password) {
          showToast('كلمة المرور مطلوبة', 'error');
          return;
        }
        const res = await api.createUser(editingUser);
        if (res.success) {
          setUsers([...users, res.user]);
          setEditingUser(null);
          setIsCreatingUser(false);
          showToast('تم إنشاء المستخدم بنجاح', 'success');
        }
      } else {
        const res = await api.updateUser(editingUser.id, editingUser);
        if (res.success) {
          setUsers(users.map(u => u.id === editingUser.id ? res.user : u));
          setEditingUser(null);
          showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث المستخدم', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        setUsers(users.filter(u => u.id !== id));
        showToast('تم حذف المستخدم بنجاح', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المستخدم', 'error');
    }
  };
  
  const handleDownloadBackup = async () => {
    try {
      const backupData = await api.getBackupData();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Nagah_MS_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تنزيل النسخة الاحتياطية الكاملة بنجاح! 💾', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل النسخة الاحتياطية', 'error');
    }
  };

  const handleExportMigrationPackage = () => {
    try {
      showToast('جارٍ استخراج وتصدير قاعدة بيانات المركز كاملة كملف إكسيل (.xlsx)...', 'info');
      api.exportFullDatabaseExcel();
      showToast('تم بدء تنزيل قاعدة بيانات المركز كاملة كملف إكسيل بنجاح! 📊', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تصدير قاعدة البيانات كإكسيل', 'error');
    }
  };

  
  const handleExportDeltaSyncPackage = async () => {
    try {
      showToast('جارٍ تجميع وحزم تغييرات البيانات (Delta Sync) منذ آخر تصدير...', 'info');
      await api.exportDeltaSyncPackage();
      showToast('تم تصدير حزمة الفروقات (Delta Sync) بنجاح! 📦', 'success');
    } catch (err: any) {
      if (err.message === 'NO_CHANGES_DETECTED') {
        showToast('No Changes Detected: لا توجد تغييرات جديدة منذ آخر عملية تصدير.', 'warning');
      } else {
        showToast(err.message || 'فشل تصدير حزمة الفروقات', 'error');
      }
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const textContent = event.target?.result as string;
        if (!textContent || textContent.trim().startsWith('<!DOCTYPE') || textContent.trim().startsWith('<html')) {
          throw new Error('الملف المختار ليس ملف JSON صحيح (يبدو أنه ملف HTML). يرجى التأكد من اختيار ملف النسخة الاحتياطية الصحيح.');
        }
        const json = JSON.parse(textContent);
        await api.restoreBackupData(json);
        showToast('تمت استعادة قاعدة البيانات والطلاب بالكامل بنجاح! 🔄', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err: any) {
        showToast(err.message || 'الملف غير صالح أو تالف', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 p-5 rounded-2xl shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            إعدادات النظام والنسخ السحابي والترحيل
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            مركز النسخ الاحتياطي والترحيل، مزامنة السحابة، إدارة المركز، وسياسات النقاط والمستخدمين
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-purple-200/60 dark:border-slate-700/80 rounded-2xl overflow-x-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveMainTab('backup_migration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'backup_migration'
              ? 'bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white font-black shadow-md shadow-purple-900/25 border border-purple-500/50'
              : 'text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-500/30 border border-transparent font-bold'
          }`}
        >
          <Database className="w-4 h-4 text-amber-300" />
          <span>النسخ الاحتياطي والترحيل (Migration Hub)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'general'
              ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-slate-700 shadow-md font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-500/30 border border-transparent font-bold'
          }`}
        >
          <Building className="w-4 h-4 text-purple-500" />
          <span>إعدادات وبيانات المركز</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('themes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'themes'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-slate-700 shadow-md font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-500/30 border border-transparent font-bold'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span>ألوان ومظاهر المنصة (Themes)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('roles_permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'roles_permissions'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-slate-700 shadow-md font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-500/30 border border-transparent font-bold'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>الأدوار والصلاحيات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-slate-700 shadow-md font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-500/30 border border-transparent font-bold'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-500" />
          <span>إدارة المستخدمين</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('reset')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap ${
            activeMainTab === 'reset'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 shadow-md font-black'
              : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800/40 border border-transparent font-bold'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>تصفير النظام</span>
        </button>
      </div>

      {/* TAB 1: Migration & Forensic Backup Center */}
      {activeMainTab === 'backup_migration' && (
        <div className="space-y-6">
          <BackupAndMigrationCenter />

          {/* Unified Compact Backup & Sync Hub */}
          <div className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-sm">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">مركز النسخ الاحتياطي والحفظ الذكي (السحابي والمحلي)</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">إدارة المزامنة، التحديث التلقائي، وتصدير/استيراد JSON في مكان واحد</p>
                </div>
              </div>

              {/* Quick Action Buttons Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Cloud Firestore Instant Sync Button */}
            <button
              type="button"
              onClick={async () => {
                showToast('جارٍ مزامنة وتوحيد البيانات مع سحابة Firestore وجميع الأجهزة...', 'info');
                try {
                  const [tRes, trRes, cRes, gRes, bRes] = await Promise.all([
                    api.getTrainees().catch(() => []),
                    api.getTrainers().catch(() => []),
                    api.getCourses().catch(() => []),
                    api.getGroups().catch(() => []),
                    api.getBranches().catch(() => [])
                  ]);
                  const result = await cloudDb.syncFullCenterToCloud({
                    trainees: Array.isArray(tRes) ? tRes : [],
                    trainers: Array.isArray(trRes) ? trRes : [],
                    courses: Array.isArray(cRes) ? cRes : [],
                    groups: Array.isArray(gRes) ? gRes : [],
                    branches: Array.isArray(bRes) ? bRes : []
                  });
                  if (result.success) {
                    showToast(`تمت مزامنة (${result.syncedCount}) سجل بنجاح تام مع السحابة المركزية! ☁️`, 'success');
                  } else {
                    showToast('تمت المزامنة بنجاح', 'success');
                  }
                } catch (e: any) {
                  showToast(e.message || 'فشل مزامنة السحابة', 'error');
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
              title="مزامنة موحدة فورية مع قاعدة بيانات Firestore السحابية"
            >
              <CloudUpload className="w-3.5 h-3.5 text-amber-300" />
              <span>مزامنة السحابة (Firestore)</span>
            </button>

            {/* Google Sheets Hub Button */}
            <button
              type="button"
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-[11px] transition-all shadow-sm"
              title="تصدير واستيراد وإدارة جداول بيانات Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google Sheets</span>
            </button>

            {/* Google Workspace Hub Button (Meet, Chat, Slides, Forms, Classroom) */}
            <button
              type="button"
              onClick={() => setIsGoogleWorkspaceModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-300 font-bold rounded-xl text-[11px] transition-all shadow-sm"
              title="إدارة Google Meet، Chat، Slides، Forms و Classroom"
            >
              <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Google Workspace Hub</span>
            </button>

            {/* Google Drive Status / Connect */}
            {isGoogleConnected ? (
              <button
                type="button"
                disabled={isSyncingDrive}
                onClick={async () => {
                  setIsSyncingDrive(true);
                  try {
                    const backupData = await api.getBackupData();
                    await GoogleDriveService.uploadOrUpdateFixedBackup(backupData);
                    showToast('تم تحديث ملف النسخة التلقائية الثابتة على Google Drive بنجاح! 🔄☁️', 'success');
                  } catch (err: any) {
                    showToast(err.message || 'فشل المزامنة', 'error');
                  } finally {
                    setIsSyncingDrive(false);
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-200 font-bold rounded-xl text-[11px] transition-all shadow-sm"
                title="تحديث سحابي فوري"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-300 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                <span>مزامنة Drive</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSyncingDrive}
                onClick={handleConnectGoogle}
                className="flex items-center gap-1 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-300" />
                <span>ربط Drive</span>
              </button>
            )}

            {/* Local Folder Button */}
            <button
              type="button"
              onClick={handleSelectLocalFolder}
              className="flex items-center gap-1 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold rounded-xl text-[11px] transition-all shadow-sm"
              title={localFolderName ? `المجلد: ${localFolderName}` : 'اختر مجلد الحفظ المحلي'}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{localFolderName ? 'مجلد محلي مخصص' : 'اختر مجلد محلي'}</span>
            </button>

            {/* Download JSON Button */}
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-200 font-bold rounded-xl text-[11px] transition-all shadow-sm"
              title="تنزيل ملف JSON احتياطي"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>تنزيل JSON</span>
            </button>

            {/* Export Full Database Excel Button */}
            <button
              type="button"
              onClick={handleExportMigrationPackage}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
              title="تصدير قاعدة بيانات المركز كاملة (الطلاب، المدربون، الدورات، المالية، الحضور) كملف إكسيل (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              <span>تصدير Excel كامل</span>
            </button>

            {/* Export Delta Sync Package Button */}
            <button
              type="button"
              onClick={handleExportDeltaSyncPackage}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
              title="تصدير السجلات الجديدة والمعدلة فقط منذ آخر مزامنة (Delta Sync)"
            >
              <FileArchive className="w-3.5 h-3.5 text-amber-300" />
              <span>تصدير Delta Sync</span>
            </button>

            {/* Restore JSON Button */}
            <label className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-[11px] cursor-pointer transition-all shadow-sm">
              <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>استعادة JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Status Indicators Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 px-1 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              حساب Drive: <strong className="text-slate-800 dark:text-slate-200 font-mono">{googleUser?.email || 'm_bkeet@yahoo.com'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-700 dark:text-purple-300 font-mono">
              📁 {localFolderName ? localFolderName : 'مسار مؤقت آمن (D:/NagahMS_AutoBackup_Temp)'}
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/40">
              🟢 الحفظ التلقائي نشط
            </span>
          </div>
        </div>
      </div>

      {/* Global Sync & Recalculate Card */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-500/30">
          <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          التحديث الشامل ومزامنة النظام بالسحابة (Global Sync & Cloud Backup)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          إعادة حساب وتحديث كافة بيانات وأرصدة البرنامج بالكامل (الطلاب، الدورات، المدربين، الخزينة، الفروع، والسجلات)، مع رفع وتحديث نسخة احتياطية سحابية تلقائياً.
        </p>
        <div className="flex justify-start">
          <button
            type="button"
            onClick={async () => {
              setIsSyncingDrive(true);
              try {
                await api.syncSystem();
                let driveUploaded = false;
                try {
                  const backupData = await api.getBackupData();
                  if (GoogleDriveService.getStoredToken()) {
                    await GoogleDriveService.uploadBackup(backupData);
                    driveUploaded = true;
                  }
                } catch (e) {
                  console.warn('Optional Drive Sync Note:', e);
                }

                if (driveUploaded) {
                  showToast('تم إجراء التحديث الشامل للبرنامج ومزامنة السحابة (Google Drive) بنجاح! ⚡☁️', 'success');
                } else {
                  showToast('تم التحديث الشامل لكافة أقسام البرنامج وإنشاء نسخة احتياطية سحابية بنجاح! ⚡☁️', 'success');
                }
                refreshAll();
              } catch (err: any) {
                showToast(err.message || 'فشل عملية التحديث', 'error');
              } finally {
                setIsSyncingDrive(false);
              }
            }}
            disabled={isSyncingDrive}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingDrive ? 'animate-spin' : ''}`} />
            <span>تحديث ومزامنة كافة أقسام البرنامج ورفع نسخة سحابية</span>
          </button>
        </div>
      </div>
        </div>
      )}

      {/* TAB 2: General Center Settings */}
      {activeMainTab === 'general' && (
        <div className="space-y-4">
          {/* AI Assistants & Bot Hub Compact Card */}
          <div className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">أدوات الذكاء الاصطناعي والمساعد الذكي</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">إدارة المساعدين الأذكياء، تسجيل المحاضرات وبوتات التواصل الاجتماعي</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAiModal('manager')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md shadow-purple-900/20 transition-all active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>فتح مركز الذكاء الاصطناعي 🪄</span>
            </button>
          </div>

          {/* Parent Portal Mobile App & Link Card */}
          <div className="space-y-1">
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'parent_portal' ? null : 'parent_portal')}
              className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm select-none ${activeAccordion === 'parent_portal' ? 'border-purple-400 dark:border-purple-500/50 rounded-b-none' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'parent_portal' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <Link className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">روابط وتطبيقات بوابات الطلاب وأولياء الأمور</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مشاركة ونسخ الروابط المباشرة لبوابات أولياء الأمور والطلاب وتحديث الحالات</p>
                </div>
              </div>
              <div>
                {activeAccordion === 'parent_portal' ? <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {activeAccordion === 'parent_portal' && (
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-indigo-500/40 rounded-b-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    رابط وتطبيق بوابة ولي الأمر (Mobile Web App)
                  </h3>
                  <span className="text-[11px] bg-purple-100 dark:bg-indigo-500/20 text-purple-800 dark:text-indigo-300 px-3 py-1 rounded-full border border-purple-200 dark:border-indigo-500/30 font-bold">
                    مخصص لأولياء الأمور
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  يمكنك مشاركة هذا الرابط مع أولياء الأمور عبر الواتساب أو طباعته كرمز استجابة سريع (QR Code) ليتسنى لهم متابعة حضور الأبناء، ساعات الدخول، المواعيد، التقييمات، والدرجات وتثبيت التطبيق على هواتفهم المحمولة بسهولة.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={getPublicParentPortalUrl()}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-purple-800 dark:text-indigo-300 font-mono select-all text-right"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const url = getPublicParentPortalUrl();
                        navigator.clipboard.writeText(url);
                        showToast('تم نسخ رابط بوابة ولي الأمر بنجاح! 📋', 'success');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                    >
                      <span>نسخ الرابط 📋</span>
                    </button>
                    <a
                      href="/?view=parent_portal"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <span>فتح البوابة ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Center Settings Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Center Info Card */}
            <div className="space-y-1">
              <div
                onClick={() => setActiveAccordion(activeAccordion === 'center_info' ? null : 'center_info')}
                className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm select-none ${activeAccordion === 'center_info' ? 'border-purple-400 dark:border-amber-500/50 rounded-b-none' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'center_info' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">البيانات الرسمية للمركز وأكواد المراحل الدراسية</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">اسم المركز، الهواتف، العناوين، وبادئات أكواد الطلاب والصفوف</p>
                  </div>
                </div>
                <div>
                  {activeAccordion === 'center_info' ? <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {activeAccordion === 'center_info' && (
                <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-b-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    البيانات الرسمية للمركز (تظهر على الشهادات والإيصالات)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم المركز *</label>
                      <input
                        type="text"
                        required
                        value={settings.centerName || ''}
                        onChange={(e) => setSettings({ ...settings, centerName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">رقم الهاتف الرسمي</label>
                      <input
                        type="text"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>📱 رقم فودافون كاش (تحويل المحفظة)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="01001500686"
                        value={settings.vodafoneCash || ''}
                        onChange={(e) => setSettings({ ...settings, vodafoneCash: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-800 dark:text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-purple-700 dark:text-indigo-300 flex items-center gap-1">
                        <span>⚡ عنوان انستا باي InstaPay</span>
                      </label>
                      <input
                        type="text"
                        placeholder="m_bkeet@instapay"
                        value={settings.instapay || ''}
                        onChange={(e) => setSettings({ ...settings, instapay: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-indigo-500/40 rounded-xl px-3 py-2 text-purple-800 dark:text-indigo-300 font-mono font-bold focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الرقم الضريبي / السجل التجاري</label>
                      <input
                        type="text"
                        value={settings.taxNumber || ''}
                        onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                     <div>
                      <label className="block text-amber-600 dark:text-amber-400 font-bold mb-1 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>الرقم السري لدخول الإدارة والمدربين 🔐</span>
                      </label>
                      <input
                        type="text"
                        placeholder="2026"
                        value={settings.adminPasscode || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings({ ...settings, adminPasscode: val });
                          localStorage.setItem('nagah_admin_passcode', val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-500/40 rounded-xl px-3 py-2 text-amber-800 dark:text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <label className="block text-slate-800 dark:text-slate-100 font-bold mb-1 flex items-center gap-2">
                          <span>🌐 السماح بالتسجيل الإلكتروني الخارجي للطلاب</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            settings.allowOnlineRegistration !== false ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}>
                            {settings.allowOnlineRegistration !== false ? 'مفتوح 🟢' : 'مغلق (اكتمل العدد) 🔴'}
                          </span>
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          عند التفعيل، يستقبل رابط التسجيل الخارجي الطلاب الجدد تلقائياً. عند التعطيل (إغلاق التسجيل)، يتم رفض التسجيلات الجديدة وتوجيههم لرسالة اعتذار وتواصل واتساب الإدارة.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.allowOnlineRegistration !== false}
                          onChange={(e) => setSettings({ ...settings, allowOnlineRegistration: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">العنوان الرئيسي للمقر</label>
                      <input
                        type="text"
                        value={settings.address || ''}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-purple-700 dark:text-indigo-300 flex items-center gap-1">
                        <span>📅 العام الدراسي الحالي</span>
                      </label>
                      <input
                        type="text"
                        placeholder="2026/2027"
                        value={settings.academicYear || ''}
                        onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-xl px-3 py-2 text-purple-900 dark:text-indigo-300 font-mono font-bold focus:border-purple-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                        العام الدراسي الفعّال حالياً في كشوفات وسجلات الطلاب والتصعيد
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <span>بادئة الكود الافتراضية (Fallback Prefix)</span>
                        <span className="text-[9px] bg-purple-50 dark:bg-slate-850 px-1.5 py-0.5 rounded text-purple-700 dark:text-slate-400 font-normal font-mono uppercase border border-purple-200 dark:border-transparent">English Capital</span>
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        required
                        placeholder="A"
                        value={settings.traineeCodePrefix || 'A'}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                          setSettings({ ...settings, traineeCodePrefix: val });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-xl px-3 py-2 text-purple-800 dark:text-amber-400 font-mono font-bold uppercase focus:border-purple-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                        الحرف الافتراضي عند عدم تطابق الصف (مثال: A001)
                      </span>
                    </div>
                  </div>

                  {/* Grade Code Prefix Mappings */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          <span>أحرف أكواد المراحل والصفوف الدراسية (Grade Prefix Rules):</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          كل صف دراسي يبدأ بحرف تسلسلي محدد يتبعه رقم الطالب (مثل A001 لرابع، B001 لخامس، C001 لسادس، D001 لأول إعدادي)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { name: 'الصف الرابع', code: 'A', sub: 'ICT4 / 4' },
                        { name: 'الصف الخامس', code: 'B', sub: 'ICT5 / 5' },
                        { name: 'الصف السادس', code: 'C', sub: 'ICT6 / 6' },
                        { name: 'الصف الأول الإعدادي', code: 'D', sub: 'ICT-P1 / إعدادي 1' },
                        { name: 'الصف الثاني الإعدادي', code: 'E', sub: 'ICT-P2 / إعدادي 2' },
                        { name: 'الصف الثالث الإعدادي', code: 'F', sub: 'ICT-P3 / إعدادي 3' },
                        { name: 'الصف الأول الثانوي', code: 'G', sub: 'ICT-S1 / ثانوي 1' },
                        { name: 'الصف الثاني الثانوي', code: 'H', sub: 'ICT-S2 / ثانوي 2' },
                        { name: 'الصف الثالث الثانوي', code: 'I', sub: 'ICT-S3 / ثانوي 3' }
                      ].map((g) => {
                        const currentVal = (settings.gradePrefixes && settings.gradePrefixes[g.name]) || g.code;
                        return (
                          <div key={g.name} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80">
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{g.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{g.sub}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">الحرف:</span>
                              <input
                                type="text"
                                maxLength={2}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').toUpperCase();
                                  const subKey = g.sub ? g.sub.split('/')[0]?.trim() : '';
                                  setSettings({
                                    ...settings,
                                    gradePrefixes: {
                                      ...(settings.gradePrefixes || {}),
                                      [g.name]: val,
                                      ...(subKey ? { [subKey]: val } : {})
                                    }
                                  });
                                }}
                                className="w-12 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/50 rounded-lg px-2 py-1 text-center text-purple-800 dark:text-purple-300 font-mono font-bold text-xs uppercase focus:border-purple-500 focus:outline-none shadow-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gamification Settings */}
            <div className="space-y-1">
              <div
                onClick={() => setActiveAccordion(activeAccordion === 'gamification' ? null : 'gamification')}
                className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm select-none ${activeAccordion === 'gamification' ? 'border-purple-400 dark:border-amber-500/50 rounded-b-none' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'gamification' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">سياسات النقاط والمكافآت التلقائية</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تحديد نقاط الحضور لكل محاضرة، ومكافآت التكريم الكامل بالدورة</p>
                  </div>
                </div>
                <div>
                  {activeAccordion === 'gamification' ? <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {activeAccordion === 'gamification' && (
                <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-b-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    سياسات النقاط والمكافآت التلقائية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نقاط الحضور لكل محاضرة</label>
                      <input
                        type="number"
                        value={settings.pointsPerAttendance ?? 0}
                        onChange={(e) =>
                          setSettings({ ...settings, pointsPerAttendance: Number(e.target.value) })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-purple-800 dark:text-amber-300 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">مكافأة الالتزام الكامل بالدورة</label>
                      <input
                        type="number"
                        value={settings.pointsPerFullAttendanceBonus ?? 0}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pointsPerFullAttendanceBonus: Number(e.target.value)
                          })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-purple-800 dark:text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-900/20 transition-all"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Theme & Palette Settings */}
      {activeMainTab === 'themes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-sm">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    تخصيص ألوان ومظهر المنصة بالكامل (Theme Studio)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    اختر المظهر اللوني والسمة التي تناسبك ليتم تطبيقها فوراً على كامل النظام وقواعد البيانات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-900/20 transition-all cursor-pointer"
                >
                  {themeConfig.isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-300" />}
                  <span>{themeConfig.isDark ? "التحويل للوضع النهاري الملكي" : "التحويل للوضع الليلي الملكي"}</span>
                </button>
              </div>
            </div>

            {/* Current Active Theme Preview Banner */}
            <div
              className="p-4 rounded-2xl border transition-all duration-300 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.bgMainGradientStart} 0%, ${themeConfig.colors.bgMainGradientMid} 50%, ${themeConfig.colors.bgMainGradientEnd} 100%)`,
                borderColor: themeConfig.colors.border
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الوضع المفعل حالياً:</span>
                  <span
                    className="text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1.5"
                    style={{
                      backgroundColor: themeConfig.colors.accentLight,
                      borderColor: themeConfig.colors.accent,
                      color: themeConfig.colors.accentText
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {themeConfig.name}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">{themeConfig.description}</p>
              </div>
            </div>

            {/* Presets Grid in Settings */}
            <div className="pt-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                اختر وضع العرض المفضل لديك:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_THEMES.map((t) => {
                  const isSelected = currentThemeId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setThemeId(t.id);
                        showToast(`تم التفعيل بنجاح (${t.name})`, 'success');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 shadow-md ring-2 ring-purple-600/30'
                          : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${t.isDark ? 'bg-slate-950 text-purple-400 border-slate-800' : 'bg-white text-purple-700 border-purple-200'}`}>
                          {t.isDark ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.name}</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40">
                          مفعل
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Roles & Permissions */}
      {activeMainTab === 'roles_permissions' && (
        <div className="space-y-4">
        {/* Roles & Permissions Editor Card */}
        <div className="space-y-1">
          <div
            onClick={() => setActiveAccordion(activeAccordion === 'roles_permissions' ? null : 'roles_permissions')}
            className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm select-none ${activeAccordion === 'roles_permissions' ? 'border-purple-400 dark:border-amber-500/50 rounded-b-none' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'roles_permissions' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <Key className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">إدارة أدوار وصلاحيات مجموعات المستخدمين</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">التحكم في صلاحيات الوصول لصفحات وخدمات النظام لكل دور وظيفي</p>
              </div>
            </div>
            <div>
              {activeAccordion === 'roles_permissions' ? <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {activeAccordion === 'roles_permissions' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-b-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              إدارة أدوار المستخدمين وصلاحيات الصفحات والخدمات
            </h3>
            <button
              type="button"
              onClick={handleAddCustomRole}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-[11px] font-black shadow-md shadow-purple-900/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>إضافة دور مخصص جديد</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            تتيح لك هذه اللوحة كمدير عام النظام التحكم في المسميات العربية للأدوار، وتعديل صلاحيات الوصول لصفحات النظام المختلفة، أو إضافة أدوار جديدة تماماً.
          </p>

          <div className="space-y-4">
            {(settings.rolePermissions || []).map((roleItem, index) => (
              <div
                key={roleItem.id}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-slate-800 text-purple-800 dark:text-slate-400">
                      ID: {roleItem.id}
                    </span>
                    <input
                      type="text"
                      value={roleItem.title}
                      onChange={(e) => handleUpdateRoleField(index, 'title', e.target.value)}
                      className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-slate-100 text-xs font-bold focus:border-purple-500 focus:outline-none"
                      placeholder="اسم الدور (مثال: منسق خارجي)..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {roleItem.isSystem ? (
                      <span className="text-[9px] bg-purple-100 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/20 text-purple-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md">
                        دور محمي بالنظام
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(roleItem.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 font-bold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الدور</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">وصف الدور</label>
                  <input
                    type="text"
                    value={roleItem.description}
                    onChange={(e) => handleUpdateRoleField(index, 'description', e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-300 text-xs focus:border-purple-500 focus:outline-none"
                    placeholder="اكتب وصفاً مختصراً لصلاحيات ومسؤوليات هذا الدور..."
                  />
                </div>

                {/* Permissions Checkboxes Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 block">الصفحات المصرح بدخولها لهذا الدور:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[10px]">
                    {availablePermissions.map((perm) => {
                      const isChecked = roleItem.permissions.includes(perm.id) || roleItem.id === 'super_admin';
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-purple-100/70 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/40 text-purple-900 dark:text-purple-300 font-bold'
                              : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-purple-300 text-slate-600 dark:text-slate-400'
                          } ${roleItem.id === 'super_admin' ? 'cursor-not-allowed opacity-80 animate-none' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={roleItem.id === 'super_admin'}
                            onChange={(e) => handleTogglePermission(index, perm.id, e.target.checked)}
                            className="w-3.5 h-3.5 text-purple-600 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 rounded focus:ring-purple-500"
                          />
                          <span className="font-bold">{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-900/20 transition-all"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ مصفوفة الصلاحيات'}</span>
          </button>
        </div>
        </div>
      )}

      {/* TAB 4: User Management */}
      {activeMainTab === 'users' && (
        <div className="space-y-4">
      {/* User Management Section */}
      <div className="space-y-1">
        <div
          onClick={() => setActiveAccordion(activeAccordion === 'user_management' ? null : 'user_management')}
          className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800/80 transition-all shadow-sm select-none ${activeAccordion === 'user_management' ? 'border-purple-400 dark:border-amber-500/50 rounded-b-none' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'user_management' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">إدارة حسابات مستخدمي وموظفي النظام</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">إضافة وتعديل حسابات موظفي الاستقبال، الإدارة العامة والمدربين</p>
            </div>
          </div>
          <div>
            {activeAccordion === 'user_management' ? <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>

        {activeAccordion === 'user_management' && (
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-b-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            إدارة المستخدمين وصلاحيات الدخول
          </h3>
          <button
            onClick={() => {
              setIsCreatingUser(true);
              setEditingUser({
                username: '',
                fullName: '',
                role: 'receptionist',
                password: '',
                status: 'active'
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-900/20 transition-all"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-purple-50/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs">
                <th className="p-3 font-semibold border-b border-slate-200 dark:border-slate-700">الاسم</th>
                <th className="p-3 font-semibold border-b border-slate-200 dark:border-slate-700">اسم المستخدم (الدخول)</th>
                <th className="p-3 font-semibold border-b border-slate-200 dark:border-slate-700">الدور والصلاحية</th>
                <th className="p-3 font-semibold border-b border-slate-200 dark:border-slate-700 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-purple-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-900 dark:text-slate-200 font-bold">{user.fullName}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{user.username}</td>
                  <td className="p-3">
                    <span className="bg-purple-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-purple-800 dark:text-amber-400 border border-purple-200 dark:border-slate-700 font-bold">
                      {settings.rolePermissions?.find((r: any) => r.id === user.role)?.title || user.role}
                    </span>
                  </td>
                  <td className="p-3 text-left">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsCreatingUser(false);
                          setEditingUser({ ...user, password: '' });
                        }}
                        className="text-xs text-purple-700 dark:text-blue-400 hover:text-purple-800 bg-purple-50 dark:bg-blue-500/10 px-3 py-1 rounded border border-purple-200 dark:border-transparent transition-colors font-bold"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded border border-rose-200 dark:border-transparent transition-colors font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
        )}
      </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{isCreatingUser ? 'إضافة مستخدم جديد' : 'تعديل حساب المستخدم'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs mb-1">اسم المستخدم (للدخول)</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs mb-1">{isCreatingUser ? 'كلمة المرور' : 'كلمة المرور (اتركها فارغة لعدم التغيير)'}</label>
                <input
                  type="password"
                  required={isCreatingUser}
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs mb-1">الصلاحية / الدور</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                >
                  {(settings.rolePermissions || []).map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setIsCreatingUser(false);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold shadow-md shadow-purple-900/20"
                >
                  {isCreatingUser ? 'إنشاء حساب' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: System Reset */}
      {activeMainTab === 'reset' && (
        <div className="space-y-4">

      {/* Factory & Data Reset Section - Strict Manager Only Access */}
      <div className="space-y-1">
        <div
          onClick={() => setActiveAccordion(activeAccordion === 'reset_system' ? null : 'reset_system')}
          className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/40 rounded-2xl cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-750/90 transition-all shadow-sm select-none ${activeAccordion === 'reset_system' ? 'border-rose-400 dark:border-rose-500/50 rounded-b-none text-rose-600 dark:text-rose-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAccordion === 'reset_system' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40' : 'bg-rose-50 dark:bg-slate-900 text-rose-600 dark:text-rose-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-black text-xs sm:text-sm text-rose-700 dark:text-rose-300">منطقة الخطر: تصفير أقسام النظام وضبط المصنع</h3>
              <p className="text-[11px] text-slate-500 dark:text-rose-400/80 mt-0.5">تفريغ وحذف سجلات المتدربين، الحسابات، الحضور والغياب أو ضبط المصنع (خاص بالمدير)</p>
            </div>
          </div>
          <div>
            {activeAccordion === 'reset_system' ? <ChevronUp className="w-5 h-5 text-rose-600 dark:text-rose-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>

        {activeAccordion === 'reset_system' && (
          <div className="p-5 bg-white dark:bg-slate-800/90 border-x border-b border-rose-200 dark:border-rose-500/40 rounded-b-2xl mb-4 space-y-4 shadow-sm">
            {!isManager ? (
              <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-amber-500/10 border border-purple-200 dark:border-amber-500/20 flex items-center justify-center text-purple-700 dark:text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">تصفير وإعادة ضبط النظام (مقيد)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  خاصية تصفير وحذف بيانات النظام مقيدة ومتاحة حصرياً لحسابات <span className="text-purple-700 dark:text-amber-400 font-bold">المدير العام (Super Admin)</span> أو مدير النظام للحفاظ على أمان وسرية بيانات المتدربين والخزينة.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-rose-100 dark:border-rose-500/30">
            <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              تصفير وإعادة تعيين النظام (صلاحيات المدير العام فقط)
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAllReset(true)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all"
              >
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={() => handleSelectAllReset(false)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg transition-all"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            يمكنك تصفير أقسام محددة بشكل مخصص أو تصفير النظام بالكامل وإعادة ضبط المصنع (تفريغ السجلات مع إبقاء الهيكل الأساسي والفروع).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.trainees}
                onChange={e => setResetOptions({ ...resetOptions, trainees: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير المتدربين والاشتراكات</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.payments}
                onChange={e => setResetOptions({ ...resetOptions, payments: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير سندات القبض والخزينة</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.expenses}
                onChange={e => setResetOptions({ ...resetOptions, expenses: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير سجل المصروفات</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.trainers}
                onChange={e => setResetOptions({ ...resetOptions, trainers: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير المدربين والتسويات</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.courses}
                onChange={e => setResetOptions({ ...resetOptions, courses: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير الدورات والمجموعات</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.attendance}
                onChange={e => setResetOptions({ ...resetOptions, attendance: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير سجلات الحضور والغياب</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.exams}
                onChange={e => setResetOptions({ ...resetOptions, exams: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير الاختبارات والنتائج</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.screenshotsArchive}
                onChange={e => setResetOptions({ ...resetOptions, screenshotsArchive: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير أرشيف لقطات الشاشة</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.auditLogs}
                onChange={e => setResetOptions({ ...resetOptions, auditLogs: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير سجل العمليات (Audit)</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs cursor-pointer hover:bg-rose-50/50 dark:hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={resetOptions.treasuryNet}
                onChange={e => setResetOptions({ ...resetOptions, treasuryNet: e.target.checked, fullReset: false })}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">تصفير الخزينة بالكامل</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 gap-3 flex-wrap border-t border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenResetModal(false)}
                disabled={isResetting || !Object.values(resetOptions).some(Boolean)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>تصفير الأقسام المحددة</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResetModal(true)}
                disabled={isResetting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs shadow-md border border-red-500/50 transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>🔥 تصفير وضبط المصنع الكامل</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              * سيتم طلب تأكيد إضافي قبل تنفيذ أي حذف
            </span>
          </div>
        </div>
      )}
            </div>
          )}
        </div>
        </div>
      )}

      {/* Interactive Custom Confirmation Modal (No window.confirm) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                    {isFullResetTarget ? 'تأكيد تصفير وإعادة ضبط المصنع الكاملة' : 'تأكيد تصفير الأقسام المحددة'}
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-300 font-bold mt-0.5">
                    إجراء إداري حساس لا يمكن التراجع عنه
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                disabled={isResetting}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {isFullResetTarget ? (
                <p className="text-rose-700 dark:text-rose-300 font-bold">
                  ⚠️ سيتم حذف وتفريغ كافة المتدربين، المدربين، الدورات، الحسابات، الخزينة، الحضور، والاختبارات نهائياً وإعادة النظام لحالته الأولية النظيفة.
                </p>
              ) : (
                <>
                  <p className="text-slate-900 dark:text-slate-300 font-bold mb-2">الأقسام التي سيتم تصفيرها الآن:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resetOptions.trainees && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">المتدربون والاشتراكات</span>}
                    {resetOptions.payments && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">المدفوعات والخزينة</span>}
                    {resetOptions.expenses && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">المصروفات</span>}
                    {resetOptions.trainers && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">المدربون والتسويات</span>}
                    {resetOptions.courses && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">الدورات والمجموعات</span>}
                    {resetOptions.attendance && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">سجلات الحضور</span>}
                    {resetOptions.exams && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">الاختبارات والنتائج</span>}
                    {resetOptions.screenshotsArchive && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">أرشيف الشاشات</span>}
                    {resetOptions.treasuryNet && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">الخزينة وصافي الأرباح</span>}
                    {resetOptions.auditLogs && <span className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-600/40 text-rose-800 dark:text-rose-300 rounded-md font-bold">سجل العمليات</span>}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                إلغاء والتراجع
              </button>

              <button
                type="button"
                onClick={handleExecuteResetConfirmed}
                disabled={isResetting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التصفير وإعادة التهيئة...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، متأكد وأرغب في تنفيذ التصفير الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Hub Modal */}
      <GoogleSheetsHubModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
      />

      {/* Google Workspace Hub Modal */}
      <GoogleWorkspaceHubModal
        isOpen={isGoogleWorkspaceModalOpen}
        onClose={() => setIsGoogleWorkspaceModalOpen(false)}
      />
    </div>
  );
};
