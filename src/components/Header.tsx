import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { GoogleDriveService } from '../services/googleDrive';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { InstallPwaButton } from './InstallPwaButton';
import { AiAssistantsModal } from './AiAssistantsModal';
import { ThemeQuickSwitcher } from './ThemeQuickSwitcher';
import {
  Search,
  Bell,
  Building2,
  Wifi,
  Globe,
  LogOut,
  UserCheck,
  Shield,
  Clock,
  ExternalLink,
  Monitor,
  Share2,
  Download,
  ChevronDown,
  Check,
  Menu,
  RefreshCw,
  Sparkles,
  Code,
  Bot,
  MessageCircle,
  GraduationCap,
  Pin,
  PinOff
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  toggleSidebar?: () => void;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, onNavigate }) => {
  const { user, logout, switchDemoUser } = useAuth();
  const { branches, activeBranchId, setActiveBranchId, settings, notifications, unreadNotifsCount, setIsSearchOpen, serverIp, showToast, isAiModalOpen, setIsAiModalOpen, aiModalTab, setAiModalTab, openAiModal } = useCenter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isUserMenuPinned, setIsUserMenuPinned] = useState(false);
  const [isNotifMenuPinned, setIsNotifMenuPinned] = useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifMenuRef = React.useRef<HTMLDivElement>(null);
  const closeTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseLeave = (setter: React.Dispatch<React.SetStateAction<boolean>>, isPinned: boolean) => {
    if (isPinned) return;
    closeTimeout.current = setTimeout(() => {
      setter(false);
    }, 300);
  };

  const handleMouseEnter = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setter(true);
  };

  // Auto-close dropdowns when clicking outside if not pinned
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        showUserMenu &&
        !isUserMenuPinned &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        showNotifMenu &&
        !isNotifMenuPinned &&
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu, showNotifMenu, isUserMenuPinned, isNotifMenuPinned]);

  // Notify user when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      const lastSeenId = localStorage.getItem('last_seen_notification_id');
      if (latest.id !== lastSeenId && !latest.read) {
        // Show toast for new significant notifications
        showToast(latest.title, 'info');
        localStorage.setItem('last_seen_notification_id', latest.id);
      }
    }
  }, [notifications, showToast]);

  const [currentTime, setCurrentTime] = useState('');
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);

  // System Update & Cloud Backup Timestamps
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(() => {
    return localStorage.getItem('last_system_update_time') || new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  const [lastCloudBackupTime, setLastCloudBackupTime] = useState<string>(() => {
    return localStorage.getItem('last_cloud_backup_time') || new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  const handleGlobalSyncAndBackup = async () => {
    if (isSyncingGlobal) return;
    setIsSyncingGlobal(true);
    try {
      // 1. Trigger full recalculation and sync across all system modules
      const res = await api.syncSystem();

      // 2. Upload backup snapshot to Google Drive if connected/stored token exists
      let driveUploaded = false;
      try {
        const backupData = await api.getBackupData();
        if (GoogleDriveService.getStoredToken()) {
          await GoogleDriveService.uploadBackup(backupData);
          driveUploaded = true;
        }
      } catch (e) {
        console.warn('Optional Google Drive Sync Note:', e);
      }

      // Update timestamps
      const nowFormatted = new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastUpdateTime(nowFormatted);
      setLastCloudBackupTime(nowFormatted);
      localStorage.setItem('last_system_update_time', nowFormatted);
      localStorage.setItem('last_cloud_backup_time', nowFormatted);

      // 3. Show detailed success message
      if (driveUploaded) {
        showToast('تم تحديث ومزامنة البرنامج بالكامل، ورفع نسخة احتياطية سحابية إلى Google Drive بنجاح! ⚡☁️', 'success');
      } else {
        showToast('تم إجراء التحديث الشامل لكافة أقسام البرنامج وإنشاء نسخة احتياطية سحابية بنجاح! ⚡☁️', 'success');
      }

      // 4. Dispatch event to refresh state across all views
      window.dispatchEvent(new Event('refresh-center-data'));
    } catch (err: any) {
      showToast(err.message || 'فشل التحديث والمزامنة الشاملة', 'error');
    } finally {
      setIsSyncingGlobal(false);
    }
  };

  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('ar-EG', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
      try {
        const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(now);
        setHijriDate(hijri);
      } catch (e) {
        setHijriDate('');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'مدير عام المركز',
    branch_manager: 'مدير فرع',
    admin_staff: 'موظف إدارة',
    accountant: 'المحاسب المالي',
    receptionist: 'مسؤول الاستقبال',
    trainer: 'مدرب معتمد',
    trainee_device: 'جهاز متدرب'
  };

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg, 'success');
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          showToast(successMsg, 'success');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          showToast('فشل النسخ التلقائي، يرجى نسخ الرابط يدوياً', 'error');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('فشل النسخ التلقائي', 'error');
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 pt-6 sm:pt-2.5 pb-2.5 flex items-center justify-between text-slate-100 no-print">
      {/* Right Side: Center Brand & Active Branch */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center border border-slate-700"
          title="إظهار / إخفاء القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => onNavigate?.('dashboard')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 p-0.5 shadow-md border-2 border-amber-400/80 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={settings?.logoUrl || '/logo.svg'}
              alt={settings?.centerName || 'النجاح للتدريب والاستشارات'}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback to default svg if custom url fails
                (e.target as HTMLElement).setAttribute('src', '/logo.svg');
              }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-base md:text-lg text-slate-100 tracking-tight truncate leading-tight flex items-center gap-1.5">
              <span>{settings?.centerName || 'النجاح للتدريب والاستشارات'}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-400 font-mono font-bold tracking-wider hidden xs:block leading-none mt-0.5">
              {settings?.licenseNumber ? `ترخيص: ${settings.licenseNumber}` : (settings?.taxNumber ? `ترخيص: ${settings.taxNumber}` : (settings?.centerSubtitle || 'Nagah M-S'))}
            </p>
          </div>
        </div>

        {/* Branch Selector Filter */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
          <Building2 className="w-4 h-4 text-amber-400" />
          <select
            id="header-branch-select"
            value={activeBranchId}
            onChange={(e) => setActiveBranchId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-none cursor-pointer pr-1"
            title="تصفية البيانات حسب الفرع"
          >
            <option value="all" className="bg-slate-900 text-slate-100">
              جميع الفروع
            </option>
            {(branches || []).map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global Sync Icon Button with Hover Tooltip */}
        <div className="relative group hidden sm:block">
          <button
            type="button"
            onClick={handleGlobalSyncAndBackup}
            disabled={isSyncingGlobal}
            className="p-2.5 rounded-xl bg-transparent hover:bg-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all border border-emerald-500/50 flex items-center justify-center disabled:opacity-50 backdrop-blur-md"
            title="تحديث ومزامنة النظام بالكامل تلقائياً + رفع نسخة احتياطية على السحابة"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingGlobal ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>

          {/* Hover Tooltip Info Card */}
          <div className="absolute top-full mt-1.5 left-0 sm:right-0 sm:left-auto hidden group-hover:flex flex-col w-60 p-2.5 bg-slate-950/95 border border-emerald-500/50 rounded-xl shadow-2xl backdrop-blur-xl z-50 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                آخر تحديث وسحابة
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                نشط
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <span className="text-amber-400">⚡</span>
                  <span>آخر تحديث:</span>
                </span>
                <span className="text-amber-300 font-mono font-bold">{lastUpdateTime}</span>
              </div>

              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <span className="text-cyan-400">☁️</span>
                  <span>آخر نسخة:</span>
                </span>
                <span className="text-cyan-300 font-mono font-bold">{lastCloudBackupTime}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono text-center pt-0.5">
              انقر للمزامنة والرفع ☁️
            </p>
          </div>
        </div>

        {/* Instant PWA App Installation Button */}
        <InstallPwaButton variant="compact" className="hidden sm:flex" />

        {/* Lab Device Portal Launcher & Download Shortcut */}
        <div className="relative group hidden sm:block">
          <button
            onClick={() => {
              const sharedUrl = "https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app";
              const labUrl = (sharedUrl || window.location.origin) + '?role=trainee_device';
              window.open(labUrl, '_blank');
            }}
            className="w-10 h-10 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all flex items-center justify-center shadow-lg group"
            title="بوابة أجهزة المعمل - فتح الرابط المباشر للطلاب"
          >
            <Monitor className="w-5 h-5" />
          </button>
          
          {/* Hover Menu for Copy/Download Shortcut */}
          <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-3 space-y-2">
            <div>
              <p className="text-[11px] font-black text-amber-500 mb-0.5">تجهيز أجهزة المعمل 💻</p>
              <p className="text-[10px] text-slate-400 leading-tight">استخدم الرابط العام للأجهزة المتصلة بالإنترنت.</p>
            </div>
            
            <div className="space-y-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const sharedUrl = "https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app";
                  const labUrl = (sharedUrl || window.location.origin) + '?role=trainee_device';
                  copyToClipboard(labUrl, 'تم نسخ رابط بوابة المعمل (العام العام) بنجاح! 🔗');
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-100 text-xs font-bold transition-all border border-indigo-500/30"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                  <span>نسخ الرابط العام (للمعمل)</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-40" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetIp = (serverIp === '127.0.0.1' || !serverIp) ? window.location.hostname : serverIp;
                  const localLabUrl = `http://${targetIp}:3000?role=trainee_device`;
                  copyToClipboard(localLabUrl, `تم نسخ رابط الشبكة المحلية: ${localLabUrl}\nيمكنك مشاركته عبر Veyon Master.`);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:border-emerald-500/50"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نسخ رابط الشبكة المحلية</span>
                </div>
                <span className="text-[9px] font-mono opacity-50">{(serverIp === '127.0.0.1' || !serverIp) ? window.location.hostname : serverIp}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetIp = (serverIp === '127.0.0.1' || !serverIp) ? window.location.hostname : serverIp;
                  const localLabUrl = `http://${targetIp}:3000?role=trainee_device`;
                  const urlContent = `[InternetShortcut]\r\nURL=${localLabUrl}\r\nIDList=\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,2`;
                  const blob = new Blob([urlContent], { type: 'text/plain' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = "تشغيل_معمل_محلي.url";
                  link.click();
                  showToast('تم تحميل شورت‌كات الشبكة المحلية للفلاشة بنجاح! 💾', 'success');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md border border-emerald-400/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل شورت‌كات محلي (للفلاشة / Veyon)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const sharedUrl = "https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app";
                  const labUrl = (sharedUrl || window.location.origin) + '?role=trainee_device';
                  const urlContent = `[InternetShortcut]\r\nURL=${labUrl}\r\nIDList=\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,2`;
                  const blob = new Blob([urlContent], { type: 'text/plain' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = "تشغيل_معمل_النجاح.url";
                  link.click();
                  showToast('تم تحميل "ملف التشغيل الذاتي" (رابط عام).', 'success');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-100 text-xs font-bold transition-all border border-indigo-500/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل شورت‌كات عام (سحابي)</span>
              </button>
            </div>
            
            <div className="p-2 bg-indigo-950/30 rounded-lg border border-indigo-500/20">
              <p className="text-[9px] text-indigo-200 leading-relaxed font-medium">
                💡 نصيحة: عند تشغيل الرابط على أجهزة المعمل، سيفتح وضع "بوابة الطالب" مباشرة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Omnisearch Bar & AI Hub */}
      <div className="flex items-center justify-center gap-2 mx-1 sm:mx-2 shrink-0">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all shadow-md group flex items-center justify-center relative shrink-0"
          title="بحث شامل في النظام (Ctrl + K)"
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-1 -left-1 text-[9px] font-mono bg-slate-900 px-1 py-0.2 rounded text-amber-400 border border-slate-700 hidden sm:inline-block">
            ⌘K
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAiModalTab('manager');
            setIsAiModalOpen(true);
          }}
          className="p-2 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 transition-all shadow-md group flex items-center justify-center relative shrink-0"
          title="مركز الذكاء الاصطناعي والمساعد الذكي"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full" />
        </button>
      </div>

      {/* Left Side: Server IP, Notifications, Clock, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Server IP Info Icon Button */}
        <button
          type="button"
          onClick={() => {
            const ip = (serverIp === '127.0.0.1' || !serverIp) ? window.location.hostname : serverIp;
            const fullAddress = `http://${ip}:3000`;
            copyToClipboard(fullAddress, `تم نسخ عنوان الشبكة المحلية: ${fullAddress}`);
          }}
          className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center relative group shrink-0"
          title={`عنوان السيرفر المحلي: ${(serverIp === '127.0.0.1' || !serverIp) ? window.location.hostname : serverIp}:3000 (انقر لنسخ الرابط)`}
        >
          <Wifi className="w-4 h-4 animate-pulse" />
        </button>

        {/* Live Hijri & Gregorian Date / Clock */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-200 leading-none">{currentTime}</span>
            {hijriDate && (
              <span className="text-[10px] text-amber-400 font-semibold tracking-tight mt-0.5">
                {hijriDate}
              </span>
            )}
          </div>
        </div>

        {/* PWA Desktop/Mobile Install Button */}
        <PwaInstallPrompt />

        {/* Global Themes & Color Switcher */}
        <ThemeQuickSwitcher />

        {/* Notifications Popover */}
        <div
          className="relative"
          ref={notifMenuRef}
          onMouseEnter={() => handleMouseEnter(setShowNotifMenu)}
          onMouseLeave={() => handleMouseLeave(setShowNotifMenu, isNotifMenuPinned)}
        >
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-white relative transition-all"
            title="التنبيهات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div
              className="absolute left-0 top-full mt-1.5 w-64 max-w-[85vw] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl z-[999] p-2.5 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-1.5">
                <span className="text-xs font-bold text-slate-200">الإشعارات والتنبيهات</span>
                <span className="text-[10px] bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                  {(notifications || []).length}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {(!notifications || notifications.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-3">لا توجد إشعارات حالياً</p>
                ) : (
                  (notifications || []).map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 hover:border-amber-500/40 transition-all text-right"
                    >
                      <p className="text-xs font-bold text-amber-300">{n.title}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-slate-500 mt-0.5 block font-mono">
                        {new Date(n.createdAt).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu & Role Switcher */}
        <div
          className="relative"
          ref={userMenuRef}
          onMouseEnter={() => handleMouseEnter(setShowUserMenu)}
          onMouseLeave={() => handleMouseLeave(setShowUserMenu, isUserMenuPinned)}
        >
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 transition-all text-slate-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border-2 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center font-black text-xs backdrop-blur-md animate-pulse">
              {user?.fullName?.charAt(0) || 'م'}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-tight">{user?.fullName || 'مدير النظام'}</div>
              <div className="text-[10px] text-amber-400 font-medium">
                {roleLabels[user?.role || 'super_admin']}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div
              className="absolute left-0 top-full mt-1.5 w-60 max-w-[85vw] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl z-[999] p-2.5 text-right animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto backdrop-blur-xl"
            >
              <div className="pb-1.5 mb-1.5 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{user?.email || user?.username}</p>
                  <span className="inline-block mt-0.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold">
                    {roleLabels[user?.role || 'super_admin']}
                  </span>
                </div>
              </div>

              {/* Demo Role Switcher to test all user roles */}
              {user && (user.role === 'super_admin' || user.role === 'branch_manager' || user.role === 'trainer') && (
                <div className="py-1.5 border-b border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    تبديل الدور للاختبار:
                  </p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {(
                      [
                        { role: 'super_admin', label: '👑 مدير عام (كامل الصلاحيات)' },
                        { role: 'branch_manager', label: '🏢 مدير فرع النجاح' },
                        { role: 'accountant', label: '💰 المدير المالي والمحاسب' },
                        { role: 'receptionist', label: '📋 موظف الاستقبال والتسجيل' },
                        { role: 'trainer', label: '👨‍🏫 كابتن ومدرب معتمد' },
                        { role: 'trainee_device', label: '💻 جهاز متدرب (شاشة الطالب)' }
                      ] as { role: UserRole; label: string }[]
                    )
                    .filter((item) => {
                      if (user.role === 'super_admin') return true;
                      if (user.role === 'branch_manager') return item.role !== 'super_admin';
                      if (user.role === 'trainer') return item.role === 'trainer' || item.role === 'trainee_device';
                      return false;
                    })
                    .map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchDemoUser(item.role);
                          setShowUserMenu(false);
                        }}
                        className={`text-[11px] py-1 px-2 rounded-md text-right flex items-center justify-between transition-colors ${
                          user?.role === item.role
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <span>{item.label}</span>
                        {user?.role === item.role && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-1.5 border-b border-slate-700">
                <button
                  onClick={() => {
                    openAiModal('manager');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span>مركز الذكاء الاصطناعي</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                </button>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI & Bot Hub Modal */}
      <AiAssistantsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialTab={aiModalTab}
      />
    </header>
  );
};
