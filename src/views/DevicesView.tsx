import React, { useState, useEffect, useRef } from 'react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Monitor,
  Lock,
  Unlock,
  RotateCcw,
  Power,
  MessageSquare,
  Cpu,
  Wifi,
  WifiOff,
  User,
  Search,
  CheckCircle2,
  X,
  Send,
  Radio,
  Share2,
  Tv,
  Upload,
  ExternalLink,
  FileText,
  Download,
  Eye,
  Maximize2,
  AlertTriangle,
  Sparkles,
  Terminal,
  ShieldCheck,
  Flame,
  MousePointer,
  Video,
  PenTool,
  CornerDownLeft,
  KeyRound,
  Play,
  Square,
  Star,
  Trophy,
  Award,
  Medal,
  Crown,
  Zap,
  Camera,
  Trash2,
  Edit2,
  Shield,
  Activity,
  Layers,
  Smartphone,
  RefreshCw,
  HardDrive,
  Thermometer,
  Filter,
  CheckSquare,
  Check,
  Copy,
  HelpCircle,
  Server,
  Globe,
  Building
} from 'lucide-react';
import { Device, DeviceAuditEntry, LabAssistanceSession } from '../types';
import { getPublicKioskUrl } from '../utils/urlHelper';

export const DevicesView: React.FC = () => {
  const { activeBranchId, branches, showToast, refreshKey } = useCenter();
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labFilter, setLabFilter] = useState<string>('all');

  // Navigation Sub-Views
  const [mainTab, setMainTab] = useState<
    'list' | 'map' | 'smart_tools' | 'multi_branch' | 'wall' | 'remote_control' | 'student_sim' | 'mobile_command' | 'installer_hub' | 'exam_policy' | 'audit_log' | 'health'
  >('list');

  // Smart Teacher Tools & Live Quiz State
  const [quizQuestion, setQuizQuestion] = useState('ما هو ناتج تنفيذ 5 + 3 * 2 في لغة بايثون؟');
  const [quizOptions, setQuizOptions] = useState(['16', '11', '10', 'خطأ نحوي']);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(1);
  const [quizPoints, setQuizPoints] = useState(25);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizResponsesCount, setQuizResponsesCount] = useState(0);
  const [announcementText, setAnnouncementText] = useState('يرجى الانتباه إلى الشاشة الرئيسية لورشة العمل والتركيز في الشرح الآن 🌟');

  // Multi-Selection State for Bulk Actions
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [isBulkCommandModalOpen, setIsBulkCommandModalOpen] = useState(false);
  const [bulkCommandType, setBulkCommandType] = useState<'lock' | 'unlock' | 'restart' | 'shutdown' | 'message' | 'cleanup'>('lock');
  const [bulkCommandMessage, setBulkCommandMessage] = useState('');

  // Editing & Single Device Inspect
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editingDeviceName, setEditingDeviceName] = useState('');
  const [inspectDevice, setInspectDevice] = useState<Device | null>(null);

  // Screen Broadcast State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const broadcastStreamRef = useRef<MediaStream | null>(null);
  const broadcastIntervalRef = useRef<any>(null);

  // Modals
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('يرجى الانتباه للشرح على شاشة العرض الرئيسية الآن');

  const [isPushFileModalOpen, setIsPushFileModalOpen] = useState(false);
  const [pushFileName, setPushFileName] = useState('');
  const [pushFileBase64, setPushFileBase64] = useState<string | null>(null);
  const [pushFileUrl, setPushFileUrl] = useState('');
  const [isPushingFile, setIsPushingFile] = useState(false);

  const [isOpenUrlModalOpen, setIsOpenUrlModalOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://kahoot.it');
  const [kahootPin, setKahootPin] = useState('');

  // Diagnostics & Health Check State
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Screenshots Archive State
  const [isScreenshotsModalOpen, setIsScreenshotsModalOpen] = useState(false);
  const [screenshotArchive, setScreenshotArchive] = useState<any[]>([]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [selectedArchivedShot, setSelectedArchivedShot] = useState<any | null>(null);

  // Remote Control / Interactive Assistance State
  const [remoteControlDevice, setRemoteControlDevice] = useState<Device | null>(null);
  const [remoteTool, setRemoteTool] = useState<'mouse' | 'laser' | 'pen' | 'keyboard' | 'magnifier'>('mouse');
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [magnifierZoom, setMagnifierZoom] = useState<number>(2.5);
  const [remoteKeyText, setRemoteKeyText] = useState('');
  const [isRemoteRecording, setIsRemoteRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<{ time: string; action: string }[]>([]);

  // Active Assistance Session & Realtime Controls
  const [activeAssistanceSession, setActiveAssistanceSession] = useState<LabAssistanceSession | null>(null);
  const [isStartingAssistance, setIsStartingAssistance] = useState(false);
  const [isMonitoringWall, setIsMonitoringWall] = useState(false);
  const [isAudioBroadcasting, setIsAudioBroadcasting] = useState(false);
  const [audioTargetMode, setAudioTargetMode] = useState<'all' | 'single'>('all');
  const [inputTextPayload, setInputTextPayload] = useState('');

  // Magnifier Lens for Screen Wall View
  const [wallMagnifierDev, setWallMagnifierDev] = useState<Device | null>(null);
  const [wallMagnifierPos, setWallMagnifierPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Student Agent Lock Screen Simulator State
  const [simStudentCode, setSimStudentCode] = useState('A001');
  const [simSelectedDeviceId, setSimSelectedDeviceId] = useState('LAB-A-01');
  const [simIsLoggingIn, setSimIsLoggingIn] = useState(false);
  const [simLoginResult, setSimLoginResult] = useState<any>(null);

  // Agent Installer & Script Hub State
  const [installerBranchId, setInstallerBranchId] = useState('branch-1');
  const [installerLabName, setInstallerLabName] = useState('المعمل الأول');
  const [copiedScript, setCopiedScript] = useState(false);

  // Exam Policy State
  const [examTitle, setExamTitle] = useState('اختبار بايثون للذكاء الاصطناعي - النصف فصلي');
  const [examAllowedApps, setExamAllowedApps] = useState(['VS Code', 'Chrome (Exam Portal)', 'Python IDLE']);
  const [examBlockInternet, setExamBlockInternet] = useState(true);
  const [examRestrictNav, setExamRestrictNav] = useState(true);
  const [isExamModeActive, setIsExamModeActive] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<DeviceAuditEntry[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // RBAC Permission Checks
  const isSuperOrManager = user?.role === 'super_admin' || user?.role === 'branch_manager' || user?.role === 'admin_staff';
  const canControlDevices = isSuperOrManager; // Supervisors & Admins have full control, Trainers have view/session control

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 1500); // Live poll devices status
    return () => clearInterval(interval);
  }, [activeBranchId, refreshKey]);

  useEffect(() => {
    if (mainTab === 'audit_log') {
      loadAuditLogs();
    }
  }, [mainTab]);

  const loadDevices = async () => {
    try {
      const res = await api.getDevices();
      const filtered = activeBranchId !== 'all' ? res.filter(d => d.branchId === activeBranchId) : res;
      setDevices(filtered);

      setRemoteControlDevice(prev => {
        if (!prev) return null;
        const updatedDev = filtered.find(d => d.id === prev.id || d.deviceId === prev.deviceId);
        return updatedDev ? updatedDev : prev;
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await api.getDeviceAuditLogs();
      setAuditLogs(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Start Remote Assistance Session
  const handleStartAssistance = async (dev: Device) => {
    setIsStartingAssistance(true);
    try {
      const res = await api.startRemoteAssistance(dev.deviceId || dev.id);
      if (res.success) {
        setActiveAssistanceSession(res.session);
        setRemoteControlDevice(dev);
        setMainTab('remote_control');
        showToast(`تم بدء جلسة التحكم المباشر والمساعدة للجهاز (${dev.name}) بنجاح 🎮`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل بدء جلسة التحكم والمساعدة', 'error');
    } finally {
      setIsStartingAssistance(false);
    }
  };

  // Emergency Stop Remote Assistance Session (Fail-Closed)
  const handleEmergencyStopAssistance = async () => {
    try {
      const devId = remoteControlDevice?.deviceId || remoteControlDevice?.id || '';
      await api.stopRemoteAssistance(devId, activeAssistanceSession?.sessionId);
      setActiveAssistanceSession(null);
      showToast('🚨 تم إيقاف التحكم المباشر والوصول عن بعد فورياً (Fail Closed Policy)', 'warning');
      loadDevices();
    } catch (err: any) {
      setActiveAssistanceSession(null);
      showToast('تم إلغاء الجلسة من جهة التحكم المحلية', 'info');
    }
  };

  // Send Remote Input Command (Mouse/Keyboard)
  const handleSendRemoteInput = async (action: string, extra: { x?: number; y?: number; button?: string; key?: string; text?: string } = {}) => {
    if (!remoteControlDevice) return;
    if (!activeAssistanceSession || activeAssistanceSession.status !== 'active') {
      showToast('لا توجد جلسة مساعدة نشطة ومصرح بها لهذا الجهاز', 'error');
      return;
    }

    try {
      await api.sendRemoteInput({
        deviceId: remoteControlDevice.deviceId || remoteControlDevice.id,
        sessionId: activeAssistanceSession.sessionId,
        action,
        ...extra
      });
      setRecordedSteps(prev => [{ time: new Date().toLocaleTimeString('ar-EG'), action: `${action}: ${extra.text || extra.key || extra.button || ''}` }, ...prev.slice(0, 15)]);
    } catch (err: any) {
      if (err.failClosed || err.message?.includes('Fail Closed') || err.message?.includes('منتهية')) {
        handleEmergencyStopAssistance();
      } else {
        showToast(err.message || 'فشل إرسال إشارة التحكم للجهاز', 'error');
      }
    }
  };

  // Toggle On-Demand Wall Monitoring
  const handleToggleMonitoringWall = async (isMon: boolean) => {
    try {
      const devIds = devices.map(d => d.id);
      await api.setMonitoringState({ deviceIds: devIds, isMonitoring: isMon, quality: isMon ? 'MEDIUM' : 'OFF' });
      setIsMonitoringWall(isMon);
      showToast(isMon ? 'تم تفعيل بث شاشات المعمل الحية (On-Demand Monitoring) 📡' : 'تم إيقاف المراقبة الحية للحفاظ على طاقة الأجهزة ⏹️', isMon ? 'success' : 'info');
      loadDevices();
    } catch (e: any) {
      showToast(e.message || 'فشل تغيير حالة مراقبة الشاشات', 'error');
    }
  };

  // Toggle Audio Broadcast
  const handleToggleAudioBroadcast = async () => {
    try {
      if (!isAudioBroadcasting) {
        await api.startAudioBroadcast({ targetDeviceIds: audioTargetMode === 'all' ? 'all' : (remoteControlDevice ? [remoteControlDevice.id] : 'all') });
        setIsAudioBroadcasting(true);
        showToast('🎙️ تم بدء البث الصوتي المباشر لجميع حواسيب المعمل', 'success');
      } else {
        await api.stopAudioBroadcast();
        setIsAudioBroadcasting(false);
        showToast('تم إنهاء البث الصوتي المعملي', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'فشل التحكم في البث الصوتي', 'error');
    }
  };

  // Device Commands
  const handleSendCommand = async (deviceId: string, commandType: any, payload?: string) => {
    if (['restart', 'shutdown', 'reboot'].includes(commandType) && !canControlDevices) {
      showToast('ليس لديك صلاحية التحكم الكامل والأوامر الحساسة للأجهزة', 'error');
      return;
    }

    try {
      await api.sendDeviceCommand(deviceId, commandType, payload);
      showToast(`تم إرسال أمر (${commandType}) للجهاز بنجاح ⚡`, 'success');
      loadDevices();
    } catch (e: any) {
      showToast(e.message || 'فشل إرسال الأمر للجهاز', 'error');
    }
  };

  // Bulk Command Execution
  const handleRunBulkCommand = async () => {
    if (selectedDeviceIds.length === 0) {
      showToast('يرجى تحديد جهاز واحد على الأقل أولاً', 'error');
      return;
    }

    try {
      const res = await api.sendBulkDeviceCommand({
        deviceIds: selectedDeviceIds,
        commandType: bulkCommandType,
        payload: bulkCommandMessage,
        issuedByUserId: user?.id || 'admin'
      });

      showToast(res.message || `تم تطبيق الأمر الجماعي على ${selectedDeviceIds.length} جهاز بنجاح 🎉`, 'success');
      setIsBulkCommandModalOpen(false);
      setSelectedDeviceIds([]);
      loadDevices();
    } catch (e: any) {
      showToast(e.message || 'فشل تنفيذ الأمر الجماعي', 'error');
    }
  };

  // Delete Single Device Permanently
  const handleDeleteDevice = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متاكد من رغبتك في حذف الجهاز "${name}" نهائياً من القائمة لتوفير المساحة؟`)) return;
    try {
      await api.deleteDevice(id);
      showToast(`تم حذف الجهاز "${name}" بنجاح 🗑️`, 'success');
      setSelectedDeviceIds(prev => prev.filter(devId => devId !== id));
      loadDevices();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الجهاز', 'error');
    }
  };

  // Delete Selected Devices
  const handleDeleteSelectedDevices = async () => {
    if (selectedDeviceIds.length === 0) return;
    if (!window.confirm(`هل أنت متاكد من حذف الأجهزة المحددة عدد (${selectedDeviceIds.length}) نهائياً من المعمل؟`)) return;
    try {
      for (const id of selectedDeviceIds) {
        await api.deleteDevice(id);
      }
      showToast(`تم حذف ${selectedDeviceIds.length} جهاز محدد بنجاح 🗑️`, 'success');
      setSelectedDeviceIds([]);
      loadDevices();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الأجهزة المحددة', 'error');
    }
  };

  // Delete All Offline Devices to clean up space
  const handleDeleteOfflineDevices = async () => {
    const offlineDevs = devices.filter(d => !d.isOnline);
    if (offlineDevs.length === 0) {
      showToast('لا توجد أجهزة غير متصلة (Offline) لحذفها حالياً 👍', 'info');
      return;
    }
    if (!window.confirm(`هل أنت متاكد من تنظيف وحذف جميع الأجهزة غير المتصلة عدد (${offlineDevs.length}) نهائياً من القائمة؟`)) return;
    try {
      for (const dev of offlineDevs) {
        await api.deleteDevice(dev.id);
      }
      showToast(`تم حذف وتنظيف ${offlineDevs.length} جهاز غير متصل بنجاح 🧹`, 'success');
      loadDevices();
    } catch (err: any) {
      showToast(err.message || 'فشل تنظيف الأجهزة غير المتصلة', 'error');
    }
  };

  // Student Agent Login Simulator
  const handleSimulateStudentLogin = async () => {
    if (!simStudentCode) {
      showToast('يرجى إدخال كود الطالب (مثال: A001)', 'error');
      return;
    }

    setSimIsLoggingIn(true);
    setSimLoginResult(null);

    try {
      const targetDev = devices.find(d => d.id === simSelectedDeviceId || d.deviceId === simSelectedDeviceId) || devices[0];
      const res = await api.studentCodeLogin({
        codeOrPhone: simStudentCode,
        deviceId: targetDev?.deviceId || 'LAB-A-01',
        deviceName: targetDev?.name || 'جهاز المعمل 01',
        ipAddress: targetDev?.ipAddress || '192.168.1.101'
      });

      setSimLoginResult(res);
      showToast(`تم تسجيل حضور الطالب ${res.trainee?.fullName || simStudentCode} وإرسال إشعار ولي الأمر بنجاح 🔔`, 'success');
      loadDevices();
    } catch (e: any) {
      setSimLoginResult({ error: e.message || 'لم يتم العثور على طالب مسجل بهذا الكود' });
      showToast(e.message || 'فشل تسجيل الدخول للرمز المخل', 'error');
    } finally {
      setSimIsLoggingIn(false);
    }
  };

  // Session Cleanup
  const handleSessionCleanup = async (deviceId: string) => {
    try {
      const res = await api.cleanupDeviceSession(deviceId);
      showToast(res.message || 'تم تنظيف الجلسة والملفات المؤقتة للجهاز بنجاح 🧹', 'success');
      loadDevices();
    } catch (e: any) {
      showToast('فشل تنظيف الجلسة', 'error');
    }
  };

  // Exam Policy Toggle
  const handleToggleExamMode = async () => {
    const nextState = !isExamModeActive;
    setIsExamModeActive(nextState);

    try {
      await api.setDeviceExamPolicy({
        deviceIds: selectedDeviceIds.length > 0 ? selectedDeviceIds : [],
        examPolicy: {
          active: nextState,
          examTitle,
          allowedApps: examAllowedApps,
          blockInternet: examBlockInternet,
          restrictNavigation: examRestrictNav,
          startedAt: new Date().toISOString()
        }
      });

      showToast(
        nextState
          ? 'تم تفعيل وضع الاختبار المحمي وقفل جميع التطبيقات غير المصرح بها 🔒'
          : 'تم إيقاف وضع الاختبار المحمي وإعادة الأجهزة إلى الوضع العادي 🔓',
        'success'
      );
      loadDevices();
    } catch (e: any) {
      showToast('فشل تطبيق سياسة الاختبار', 'error');
    }
  };

  // Diagnostics
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await api.runDiagnostics();
      setDiagnosticsResult(res);
      showToast(res.message || 'تم فحص وتشخيص أجهزة المعمل بنجاح 🩺', 'success');
      loadDevices();
    } catch (err: any) {
      showToast(err.message || 'فشل تشخيص الأجهزة', 'error');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Filtered devices
  const filteredDevices = devices.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.deviceId && d.deviceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.ipAddress && d.ipAddress.includes(searchQuery)) ||
      (d.currentTraineeName && d.currentTraineeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.assignedUser && d.assignedUser.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'online'
        ? d.isOnline
        : statusFilter === 'offline'
        ? !d.isOnline
        : statusFilter === 'busy'
        ? d.currentTraineeName || d.status === 'busy'
        : d.status === statusFilter;

    const matchesLab = labFilter === 'all' ? true : d.roomName === labFilter || d.labName === labFilter;

    return matchesSearch && matchesStatus && matchesLab;
  });

  // Extract unique lab names
  const labNames = Array.from(new Set(devices.map(d => d.roomName || d.labName || 'المعمل الرئيسي'))).filter(Boolean);

  // Stats calculation
  const totalCount = devices.length;
  const onlineCount = devices.filter(d => d.isOnline).length;
  const offlineCount = devices.filter(d => !d.isOnline).length;
  const busyCount = devices.filter(d => d.isOnline && (d.currentTraineeName || d.status === 'busy')).length;
  const availableCount = onlineCount - busyCount;
  const warningCount = devices.filter(d => d.healthStatus === 'warning' || d.healthStatus === 'critical' || d.status === 'update_required').length;

  // PowerShell Installer Script Generator for Windows
  const generatedPs1Script = `# ==============================================================================
# Nagah M-S Windows Native Lab Agent Installer (Zero-UI Background Daemon)
# ==============================================================================
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12;
Invoke-RestMethod -Uri "${window.location.origin}/api/download/lab-agent-ps1" -UseBasicParsing | Invoke-Expression`

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-lg">
              <Monitor className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-100">
                  إدارة معامل الكمبيوتر والأجهزة (Windows Agent Hub)
                </h1>
                <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Live Agent v2.4.1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                منظومة حقيقية متكاملة للربط المباشر مع أجهزة الطلاب، حضور كود الطالب تلقائياً (A001-Z999)، المراقبة والتحكم عن بعد، وتنظيف الجلسات.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setBulkCommandType('lock');
                setIsBulkCommandModalOpen(true);
              }}
              className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>قفل طوارئ جماعي 🔒</span>
            </button>

            <button
              onClick={() => {
                setBulkCommandType('unlock');
                setIsBulkCommandModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>فتح جميع الأجهزة 🔓</span>
            </button>

            <button
              onClick={handleToggleExamMode}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all border ${
                isExamModeActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isExamModeActive ? 'وضع الاختبار نَشِط (إيقاف) 📝' : 'تفعيل وضع الاختبار المحمي 📝'}</span>
            </button>

            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="تنشيط وإصلاح اتصال الأجهزة وتحديث الحالة"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin text-cyan-400' : ''}`} />
              <span>تشخيص وتنشيط الأجهزة 🩺</span>
            </button>

            {offlineCount > 0 && (
              <button
                onClick={handleDeleteOfflineDevices}
                className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                title="حذف جميع الأجهزة غير المتصلة نهائياً من القائمة"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>حذف غير المتصلة ({offlineCount}) 🧹</span>
              </button>
            )}
          </div>
        </div>

        {/* HIGH-DENSITY METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">إجمالي الأجهزة</span>
              <span className="text-lg font-black text-slate-100">{totalCount}</span>
            </div>
            <Monitor className="w-5 h-5 text-slate-500" />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 font-bold block">متصلة وجاهزة</span>
              <span className="text-lg font-black text-emerald-300">{onlineCount}</span>
            </div>
            <Wifi className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-rose-400 font-bold block">غير متصلة (Offline)</span>
              <span className="text-lg font-black text-rose-300">{offlineCount}</span>
            </div>
            <WifiOff className="w-5 h-5 text-rose-400" />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-cyan-400 font-bold block">مشغولة بالحصة</span>
              <span className="text-lg font-black text-cyan-300">{busyCount}</span>
            </div>
            <User className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-400 font-bold block">متاحة بدون طالب</span>
              <span className="text-lg font-black text-amber-300">{availableCount}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-400 font-bold block">تنبيهات وتحديثات</span>
              <span className="text-lg font-black text-purple-300">{warningCount}</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* DOMAIN NAVIGATION TAB STRIP */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-slate-800 no-scrollbar">
          {[
            { id: 'list', name: '📊 جدول الأجهزة الشامل', desc: 'عرض تفصيلي كثيف وتحكم بالأجهزة' },
            { id: 'map', name: '🗺️ خريطة المعمل', desc: 'الترتيب البصري لحواسيب القاعة' },
            { id: 'smart_tools', name: '⚡ أدوات المعمل الذكية والمسابقات', desc: 'بث الأسئلة الفورية ومنح النقاط والتحكم' },
            { id: 'multi_branch', name: '🏠 مراقبة الفروع من المنزل', desc: 'إشراف المدير عن بعد على معامل الفروع' },
            { id: 'wall', name: '🖥️ حائط الشاشات والعدسة', desc: 'بث الشاشات الحية والتكبير المباشر' },
            { id: 'remote_control', name: '🎮 التحكم والتقديم الذكي', desc: 'المساعدة التفاعلية وتحريك الماوس' },
            { id: 'student_sim', name: '💻 محاكي دخول الطالب', desc: 'تجربة كود الطالب (A001) ورفع الحضور' },
            { id: 'mobile_command', name: '📱 لوحة الموبايل', desc: 'تحكم سريع ومصمم للهواتف الذكية' },
            { id: 'installer_hub', name: '⚙️ تثبيت الـ Agent والربط', desc: 'توليد ملف PowerShell وترخيص Windows' },
            { id: 'exam_policy', name: '📝 وضع الاختبار المحمي', desc: 'حظر التطبيقات وتطبيق سياسة الامتحان' },
            { id: 'audit_log', name: '📜 سجل الأوامر والتدقيق', desc: 'أرشيف العمليات الإدارية الآمن' },
            { id: 'health', name: '🏥 عتاد الأجهزة والتطبيقات', desc: 'مراقبة الذاكرة والمعالج والتطبيقات' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                mainTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-lg font-black ring-2 ring-cyan-400/50'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB: SMART TEACHER TOOLS & LIVE QUIZ (أدوات المعمل الذكية والمسابقات الفورية) */}
      {/* ========================================================================= */}
      {mainTab === 'smart_tools' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LIVE QUIZ & POLL BROADCASTER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-black text-slate-100 text-sm flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>بث سؤال مسابقة تفاعلي فوري (Live Quiz Broadcast)</span>
                </h3>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-full border border-amber-500/30">
                  يعمل على الشبكة المحلية (LAN) والسحابة
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">نص السؤال أو التحدي:</label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={e => setQuizQuestion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quizOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => setQuizCorrectIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-all ${
                          quizCorrectIndex === idx ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'
                        }`}
                        title="حدد كإجابة صحيحة"
                      >
                        {idx + 1}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...quizOptions];
                          newOpts[idx] = e.target.value;
                          setQuizOptions(newOpts);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-200"
                        placeholder={`الخيار ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">النقاط الممنوحة للإجابة الصحيحة:</label>
                    <select
                      value={quizPoints}
                      onChange={e => setQuizPoints(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-bold"
                    >
                      <option value={10}>10 نقاط</option>
                      <option value={25}>25 نقطة</option>
                      <option value={50}>50 نقطة</option>
                      <option value={100}>100 نقطة</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setIsQuizActive(true);
                      setQuizResponsesCount(0);
                      showToast('🚀 تم بث السؤال الفوري والمسابقة لكل شاشات الطلاب في المعمل بنجاح!', 'success');
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    <span>بث السؤال لكل شاشات الطلاب 🎯</span>
                  </button>
                </div>

                {isQuizActive && (
                  <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-amber-300">⚡ المسابقة جارية الآن في المعمل!</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">تلقينا حتى الآن <span className="text-cyan-400 font-bold">{quizResponsesCount}</span> إجابة من أجهزة الطلاب.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsQuizActive(false);
                        showToast('تم إنهاء المسابقة وعرض لوحة الشرف بنجاح! 🏆', 'success');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
                    >
                      إيقاف المسابقة ⏹️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* INSTANT REWARD & CLASSROOM MANAGEMENT BOOSTER */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-black text-slate-100 text-sm flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>محفزات وأوامر المعمل السريعة (Veyon Master Pro)</span>
                </h3>
                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 font-bold text-[10px] rounded-full border border-cyan-500/30">
                  إدارة جماعية فورية
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-slate-200">🎁 منح نقاط تميز جماعية لكل طلاب المعمل المتصلين:</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('✨ تم منح +15 نقطة تميز لكل الأجهزة المتصلة بنجاح!', 'success')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      منح +15 نقطة للجميع ⭐
                    </button>
                    <button
                      onClick={() => showToast('👑 تم منح +50 نقطة وسام التميز لكل الأجهزة المتصلة!', 'success')}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      منح +50 نقطة وسام 🏆
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-slate-200">🔔 جرس لفت الانتباه وتنبيه شاشات الطلاب:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={announcementText}
                      onChange={e => setAnnouncementText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-100"
                    />
                    <button
                      onClick={() => showToast('🔔 تم إرسال إشعار التنبيه الصوتي والمرئي لشاشات الطلاب بنجاح!', 'success')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow"
                    >
                      إرسال التنبيه 📣
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                      💡
                    </div>
                    <div>
                      <p className="text-xs font-black text-cyan-200">وضع العمل على الشبكة المحلية (Offline LAN)</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">حتى لو انقطع الإنترنت، تظل أوامر المعمل وبث المسابقات والدرجات محفوظة ومحلية.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DENSE DEVICES TABLE (جدول الأجهزة المتكامل) */}
      {/* ========================================================================= */}
      {mainTab === 'list' && (
        <div className="space-y-4 animate-fadeIn">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="ابحث باسم الجهاز، IP، اسم الطالب، أو الكود (LAB-A-01)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 pr-10 pl-4 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="online">المتصلة فقط (Online)</option>
                <option value="offline">غير المتصلة (Offline)</option>
                <option value="busy">مشغولة بالطالب</option>
                <option value="locked">مقترنة/مقفلة</option>
              </select>

              <select
                value={labFilter}
                onChange={e => setLabFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">جميع المعامل</option>
                {labNames.map(lab => (
                  <option key={lab} value={lab}>
                    {lab}
                  </option>
                ))}
              </select>

              {selectedDeviceIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkCommandModalOpen(true)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>أوامر جماعية ({selectedDeviceIds.length})</span>
                  </button>

                  <button
                    onClick={handleDeleteSelectedDevices}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المحدد ({selectedDeviceIds.length}) 🗑️</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DENSE INFORMATION TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.length === filteredDevices.length && filteredDevices.length > 0}
                        onChange={e => {
                          if (e.target.checked) setSelectedDeviceIds(filteredDevices.map(d => d.id));
                          else setSelectedDeviceIds([]);
                        }}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                    </th>
                    <th className="p-3">اسم الجهاز / المعرف</th>
                    <th className="p-3">المعمل والفرع</th>
                    <th className="p-3">الطالب الجالس حالياً</th>
                    <th className="p-3">الحالة والاتصال</th>
                    <th className="p-3">عنوان IP والنظام</th>
                    <th className="p-3">إصدار Agent والنبض</th>
                    <th className="p-3 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200 font-mono text-[11px]">
                  {filteredDevices.map(dev => {
                    const isSelected = selectedDeviceIds.includes(dev.id);
                    return (
                      <tr key={dev.id} className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-cyan-950/30' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) setSelectedDeviceIds(selectedDeviceIds.filter(id => id !== dev.id));
                              else setSelectedDeviceIds([...selectedDeviceIds, dev.id]);
                            }}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                          />
                        </td>

                        <td className="p-3 font-sans font-bold">
                          <div className="flex items-center gap-2">
                            <Monitor className={`w-4 h-4 ${dev.isOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <div>
                              <p className="text-slate-100">{dev.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{dev.deviceId || dev.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-sans">
                          <p className="text-slate-200 font-bold">{dev.roomName || dev.labName || 'المعمل الرئيسي'}</p>
                          <p className="text-[10px] text-slate-400">
                            {branches.find(b => b.id === dev.branchId)?.name || 'الفرع الرئيسي'}
                          </p>
                        </td>

                        <td className="p-3 font-sans">
                          {dev.currentTraineeName ? (
                            <div className="bg-cyan-950/40 border border-cyan-500/30 p-1.5 rounded-xl">
                              <p className="text-cyan-300 font-bold flex items-center gap-1 text-[11px]">
                                <User className="w-3 h-3 text-cyan-400" />
                                {dev.currentTraineeName}
                              </p>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                الكود: {dev.currentTraineeCode || 'A001'} • حضور مؤكد
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">متاح (لا يوجد طالب)</span>
                          )}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                              dev.isOnline
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dev.isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                            {dev.isOnline ? 'متصل (Online)' : 'غير متصل (Offline)'}
                          </span>
                        </td>

                        <td className="p-3">
                          <p className="text-slate-300 font-bold">{dev.ipAddress || '192.168.1.101'}</p>
                          <p className="text-[10px] text-slate-400">{dev.os || 'Windows 11 Pro'}</p>
                        </td>

                        <td className="p-3">
                          <p className="text-cyan-300 font-bold">{dev.agentVersion || 'v2.4.1'}</p>
                          <p className="text-[10px] text-slate-400">
                            {dev.lastHeartbeat ? new Date(dev.lastHeartbeat).toLocaleTimeString('ar-EG') : 'منذ قليل'}
                          </p>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSendCommand(dev.id, dev.status === 'locked' ? 'unlock' : 'lock')}
                              className={`p-1.5 rounded-lg border transition-all ${
                                dev.status === 'locked'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                                  : 'bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
                              }`}
                              title={dev.status === 'locked' ? 'فتح قفل الجهاز' : 'قفل الجهاز'}
                            >
                              {dev.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleSendCommand(dev.id, 'restart')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                              title="إعادة تشغيل الجهاز"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setRemoteControlDevice(dev);
                                setMainTab('remote_control');
                              }}
                              className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-slate-950 border border-cyan-500/30"
                              title="التحكم المباشر والمساعدة عن بعد"
                            >
                              <MousePointer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSessionCleanup(dev.id)}
                              className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer"
                              title="تنظيف ملفات الجلسة والذاكرة المؤقتة"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
                            </button>

                            <button
                              onClick={() => handleDeleteDevice(dev.id, dev.name)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow"
                              title="حذف الجهاز نهائياً من القائمة لتوفير المساحة"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VISUAL LAB MAP VIEW (خريطة المعمل) */}
      {/* ========================================================================= */}
      {mainTab === 'map' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                  🗺️ خريطة أجهزة القاعة والمعمل الحية (Live Lab Visual Grid)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  عرض الترتيب المكاني للأجهزة بالقاعة لمعرفة الطالب الجالس، حالة الاتصال، ونشاط كل حاسوب فورياً.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> متاح
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> طالب نَشِط
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> مقفل / غائب
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> غير متصل
                </span>
              </div>
            </div>

            {/* Visual Computer Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredDevices.map(dev => {
                const isOnline = dev.isOnline;
                const hasStudent = !!dev.currentTraineeName;
                const isLocked = dev.status === 'locked';

                return (
                  <div
                    key={dev.id}
                    onClick={() => setInspectDevice(dev)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      !isOnline
                        ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                        : isLocked
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : hasStudent
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-lg ring-1 ring-cyan-500/30'
                        : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-xs text-slate-100">{dev.name}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          !isOnline ? 'bg-slate-600' : isLocked ? 'bg-rose-500' : hasStudent ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <Monitor className="w-7 h-7 text-slate-300" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-slate-100">{dev.currentTraineeName || 'متاح للحضور'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {hasStudent ? `كود: ${dev.currentTraineeCode || 'A001'}` : dev.ipAddress}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{dev.roomName || 'المعمل 1'}</span>
                      <span className="font-mono text-cyan-400 font-bold">{dev.agentVersion || 'v2.4'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTI-BRANCH REMOTE MONITORING (المراقبة من المنزل) */}
      {/* ========================================================================= */}
      {mainTab === 'multi_branch' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-base">
                    شاشة الإشراف والمراقبة المباشرة للفروع عن بعد (Remote Executive Dashboard) 🏠
                  </h3>
                  <p className="text-xs text-slate-400">
                    تسمح لمدير المركز والمشرف بمتابعة حالة كافة المعامل والأجهزة بجميع الفروع من المنزل أو الموبايل لحظياً.
                  </p>
                </div>
              </div>
            </div>

            {/* Branch Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map(branch => {
                const branchDevs = devices.filter(d => d.branchId === branch.id);
                const bOnline = branchDevs.filter(d => d.isOnline).length;
                const bOffline = branchDevs.filter(d => !d.isOnline).length;

                return (
                  <div key={branch.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-black text-slate-100 text-sm flex items-center gap-2">
                          <Building className="w-4 h-4 text-indigo-400" />
                          {branch.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{branch.address || 'فرع معتمد لمركز النجاح'}</p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-xl border border-indigo-500/30">
                        {branchDevs.length} حاسوب معملي
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-400 font-bold block">متصل Online</span>
                        <span className="text-base font-black text-emerald-300">{bOnline}</span>
                      </div>
                      <div className="bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                        <span className="text-[10px] text-rose-400 font-bold block">غير متصل Offline</span>
                        <span className="text-base font-black text-rose-300">{bOffline}</span>
                      </div>
                      <div className="bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/30">
                        <span className="text-[10px] text-cyan-400 font-bold block">نسبة الاستقرار</span>
                        <span className="text-base font-black text-cyan-300">
                          {branchDevs.length > 0 ? Math.round((bOnline / branchDevs.length) * 100) : 100}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REMOTE SCREEN WALL & MAGNIFIER (حائط الشاشات والعدسة) */}
      {/* ========================================================================= */}
      {mainTab === 'wall' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                  🖥️ حائط بث شاشات الطلاب المباشر والعدسة المكبرة (Screen Wall Grid)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  عرض حاد وعالي الدقة لشاشات أجهزة الطلاب بالمعمل حسب الطلب (On-Demand) لتوفير أداء الشبكة والمعالج.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* On-Demand Monitoring Toggle */}
                <button
                  onClick={() => handleToggleMonitoringWall(!isMonitoringWall)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-lg ${
                    isMonitoringWall
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Radio className={`w-4 h-4 ${isMonitoringWall ? 'animate-pulse text-slate-950' : 'text-emerald-400'}`} />
                  <span>{isMonitoringWall ? 'المراقبة الحية نشطة (On-Demand Active)' : 'تفعيل المراقبة الحية للشاشات'}</span>
                </button>

                {/* Magnifier Zoom Control Selector */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 mr-2">مستوى التكبير:</span>
                  {[2, 2.5, 3].map(z => (
                    <button
                      key={z}
                      onClick={() => setMagnifierZoom(z)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all ${
                        magnifierZoom === z ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SCREEN GRID WALL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevices.map(dev => (
                <div
                  key={dev.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group relative flex flex-col justify-between"
                >
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Monitor className={`w-4 h-4 ${dev.isOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div>
                        <span className="font-bold text-slate-100 block">{dev.name}</span>
                        <span className="text-[10px] text-slate-400">{dev.currentTraineeName || 'متاح (بدون طالب)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        dev.connectionMode === 'LAN' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {dev.lanIp ? `🟢 LAN Direct (${dev.lanIp})` : '☁️ Cloud Relay'}
                      </span>
                    </div>
                  </div>

                  {/* Screenshot / Screen Render with Magnifier Interaction */}
                  <div
                    className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair group/screen"
                    onMouseMove={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                      setWallMagnifierDev(dev);
                      setWallMagnifierPos({ x, y });
                    }}
                    onMouseLeave={() => setWallMagnifierDev(null)}
                  >
                    {dev.lastScreenshotUrl ? (
                      <img
                        src={dev.lastScreenshotUrl}
                        alt={dev.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Monitor className="w-8 h-8 text-slate-700 mx-auto" />
                        <p className="text-[11px] text-slate-500">الشاشة في وضع الاستعداد (Idle)</p>
                      </div>
                    )}

                    {/* Quick Hover Controls Overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover/screen:opacity-100 transition-all flex items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => handleStartAssistance(dev)}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1"
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>مساعدة وتفاعل</span>
                      </button>

                      <button
                        onClick={() => handleSendCommand(dev.id, dev.status === 'locked' ? 'unlock' : 'lock')}
                        className={`p-2 rounded-xl text-xs font-bold ${
                          dev.status === 'locked' ? 'bg-emerald-600 text-white' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        }`}
                        title={dev.status === 'locked' ? 'فتح القفل' : 'قفل الشاشة'}
                      >
                        {dev.status === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Magnifier Lens Overlay on Hover */}
                    {wallMagnifierDev?.id === dev.id && dev.lastScreenshotUrl && (
                      <div
                        className="absolute w-40 h-40 rounded-full border-4 border-amber-400 shadow-2xl pointer-events-none overflow-hidden z-30 bg-slate-900"
                        style={{
                          left: `calc(${wallMagnifierPos.x}% - 80px)`,
                          top: `calc(${wallMagnifierPos.y}% - 80px)`
                        }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={{
                            transform: `scale(${magnifierZoom})`,
                            transformOrigin: `${wallMagnifierPos.x}% ${wallMagnifierPos.y}%`
                          }}
                        >
                          <img src={dev.lastScreenshotUrl} alt="magnified" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4.5: INTERACTIVE REMOTE ASSISTANCE & AUDIO CONSOLE (التحكم والتقديم الذكي) */}
      {/* ========================================================================= */}
      {mainTab === 'remote_control' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
            {/* Control Header & Emergency Stop Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MousePointer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                    🎮 غرفة التحكم التفاعلي والمساعدة المباشرة (Live Interactive Control Room)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    جلسات مساعدة مصرح بها بترخيص وتوثيق كامل • سياسة الأمان: FAIL CLOSED عند انقطاع الاتصال.
                  </p>
                </div>
              </div>

              {/* Target Device Selector & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={remoteControlDevice?.id || ''}
                  onChange={e => {
                    const found = devices.find(d => d.id === e.target.value);
                    if (found) setRemoteControlDevice(found);
                  }}
                  className="bg-slate-950 border border-cyan-500/40 px-3 py-2 rounded-xl text-xs text-amber-300 font-bold"
                >
                  <option value="">-- اختر جهاز الطالب --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.currentTraineeName || 'متاح'}) - {d.ipAddress}
                    </option>
                  ))}
                </select>

                {/* Start Assistance Button */}
                {remoteControlDevice && (!activeAssistanceSession || activeAssistanceSession.status !== 'active') && (
                  <button
                    onClick={() => handleStartAssistance(remoteControlDevice)}
                    disabled={isStartingAssistance}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isStartingAssistance ? 'جاري الاتصال...' : 'بدء جلسة المساعدة المصرح بها'}</span>
                  </button>
                )}

                {/* EMERGENCY STOP BUTTON */}
                {activeAssistanceSession?.status === 'active' && (
                  <button
                    onClick={handleEmergencyStopAssistance}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-xl flex items-center gap-2 animate-pulse ring-2 ring-rose-400/50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>🚨 إيقاف التحكم الفوري (STOP ASSISTANCE)</span>
                  </button>
                )}
              </div>
            </div>

            {/* AUDIO BROADCAST CONTROLS TOOLBAR */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isAudioBroadcasting ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-slate-900 text-slate-400'}`}>
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">منصة البث الصوتي لمعلم المعمل (Audio Classroom Broadcast)</h4>
                  <p className="text-[10px] text-slate-400">بث مباشر لصوت المعلم لسماعات الطلاب بأقل زمن تأخير (Push-to-Talk & Live Stream)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={audioTargetMode}
                  onChange={e => setAudioTargetMode(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200"
                >
                  <option value="all">📢 بث لجميع أجهزة المعمل بالكامل</option>
                  <option value="single">🎯 بث للجهاز المحدد فقط</option>
                </select>

                <button
                  onClick={handleToggleAudioBroadcast}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow ${
                    isAudioBroadcasting ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{isAudioBroadcasting ? 'إيقاف البث الصوتي' : 'بدء البث الصوتي المباشر'}</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE DESKTOP CANVAS & TOOLBAR */}
            {remoteControlDevice ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Interactive Stream Canvas (3 Cols) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Active Session Status Bar */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${activeAssistanceSession?.status === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'}`} />
                      <span className="font-bold text-slate-200">
                        {activeAssistanceSession?.status === 'active' ? `جلسة مساعدة نشطة ومصرحة • جهاز: ${remoteControlDevice.name}` : 'الشاشة في وضع العرض فقط (المساعدة غير مفعّلة)'}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-cyan-300 font-bold">
                      {remoteControlDevice.lanIp ? `LAN Direct: ${remoteControlDevice.lanIp}` : 'Cloud Relay'}
                    </span>
                  </div>

                  {/* Desktop Viewport Canvas */}
                  <div
                    className="relative aspect-video bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair group/canvas"
                    onClick={e => {
                      if (activeAssistanceSession?.status === 'active') {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                        handleSendRemoteInput('mouse_click', { x, y, button: 'left' });
                      } else {
                        showToast('انقر فوق "بدء جلسة المساعدة المصرح بها" لتفعيل إرسال ضغطات الماوس للجهاز', 'info');
                      }
                    }}
                  >
                    {remoteControlDevice.lastScreenshotUrl ? (
                      <img
                        src={remoteControlDevice.lastScreenshotUrl}
                        alt="Remote Screen"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-8 text-center">
                        <Monitor className="w-16 h-16 text-slate-700 animate-pulse" />
                        <p className="text-xs text-slate-400 font-bold">جاري استقبال بث الشاشة المباشر لجهاز الطالب...</p>
                      </div>
                    )}

                    {/* Laser Pointer Tool Overlay */}
                    {remoteTool === 'laser' && (
                      <div
                        className="absolute w-6 h-6 rounded-full bg-rose-500/80 shadow-[0_0_20px_#f43f5e] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                        style={{ left: `${magnifierPos.x}%`, top: `${magnifierPos.y}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Interactive Tools & Control Panel (1 Col) */}
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
                    <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <PenTool className="w-4 h-4 text-cyan-400" />
                      أدوات المساعدة والإدخال عن بعد
                    </h4>

                    {/* Keyboard Text Injection */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 block">إرسال نص أو كود لجهاز الطالب:</label>
                      <input
                        type="text"
                        placeholder="اكتب هنا لإرساله مباشرة لشاشة الطالب..."
                        value={inputTextPayload}
                        onChange={e => setInputTextPayload(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-slate-100"
                      />
                      <button
                        onClick={() => {
                          if (inputTextPayload) {
                            handleSendRemoteInput('text_type', { text: inputTextPayload });
                            setInputTextPayload('');
                            showToast('تم كتابة النص على شاشة الطالب مباشرة ⌨️', 'success');
                          }
                        }}
                        disabled={!activeAssistanceSession || activeAssistanceSession.status !== 'active'}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow"
                      >
                        كتابة النص على جهاز الطالب ⌨️
                      </button>
                    </div>

                    {/* Native System Commands Quick Actions */}
                    <div className="space-y-2 border-t border-slate-800 pt-3">
                      <label className="text-[11px] font-bold text-slate-300 block">أوامر النظام السريعة:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSendCommand(remoteControlDevice.id, remoteControlDevice.status === 'locked' ? 'unlock' : 'lock')}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{remoteControlDevice.status === 'locked' ? 'فتح القفل' : 'قفل الجهاز'}</span>
                        </button>

                        <button
                          onClick={() => handleSendCommand(remoteControlDevice.id, 'restart')}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة تشغيل</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audit Log Stream for Current Device */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <h5 className="font-bold text-slate-300 text-xs">سجل خطوات المساعدة المباشرة:</h5>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto text-[10px] font-mono text-slate-400 dir-ltr text-left">
                      {recordedSteps.length === 0 ? (
                        <p className="text-slate-600 italic">لا توجد خطوات مسجلة حتى الآن...</p>
                      ) : (
                        recordedSteps.map((s, idx) => (
                          <div key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                            <span className="text-cyan-400 mr-2">[{s.time}]</span>
                            <span>{s.action}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-3">
                <Monitor className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="font-bold text-slate-200 text-sm">يرجى اختيار جهاز معملي لبدء التحكم المباشر</h4>
                <p className="text-xs text-slate-400">حدد جهاز الطالب من القائمة أعلاه لبدء المساعدة والتفاعل المباشر.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STUDENT AGENT LOCK SCREEN SIMULATOR (محاكي دخول الطالب) */}
      {/* ========================================================================= */}
      {mainTab === 'student_sim' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl max-w-3xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mx-auto shadow-xl">
              <KeyRound className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-100">شاشة البدء والقفل لـ Nagah Windows Agent 🔐</h2>
              <p className="text-xs text-slate-400 mt-1">
                الشاشة المباشرة البسيطة التي تظهر لجهاز الطالب فور تشغيل ويندوز بالمعمل قبل السماح بالدخول.
              </p>
            </div>

            {/* Lock Screen Form Simulation */}
            <div className="bg-slate-900/90 border border-slate-700/80 p-6 rounded-2xl max-w-md mx-auto space-y-4 shadow-inner">
              <div className="text-right">
                <label className="text-xs font-bold text-slate-300 block mb-1">رمز كود الطالب (Student Code):</label>
                <input
                  type="text"
                  placeholder="أدخل الكود مثل: A001 أو Z999"
                  value={simStudentCode}
                  onChange={e => setSimStudentCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-cyan-500/40 px-4 py-3 rounded-xl text-center text-base font-mono font-black text-amber-300 focus:outline-none tracking-widest"
                />
              </div>

              <div className="text-right">
                <label className="text-xs font-bold text-slate-300 block mb-1">اختر الجهاز المحاكى بالمعمل:</label>
                <select
                  value={simSelectedDeviceId}
                  onChange={e => setSimSelectedDeviceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-xs text-slate-200"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.deviceId})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSimulateStudentLogin}
                disabled={simIsLoggingIn}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {simIsLoggingIn ? 'جاري التحقق وتسجيل الحضور...' : 'تسجيل دخول فتح جهاز المعمل 🚀'}
              </button>

              {simLoginResult && (
                <div
                  className={`p-4 rounded-xl text-xs text-right space-y-1.5 animate-fadeIn ${
                    simLoginResult.error ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300' : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {simLoginResult.error ? (
                    <p className="font-bold">{simLoginResult.error}</p>
                  ) : (
                    <>
                      <p className="font-bold text-emerald-200">✅ تم إثبات حضور الطالب: {simLoginResult.trainee?.fullName}</p>
                      <p className="text-[11px] text-slate-300">
                        الدورة: {simLoginResult.courseName} • المجموعة: {simLoginResult.groupName}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono">📱 تم إرسال إشعار للوالد: STUDENT_ARRIVED</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AGENT INSTALLER & SCRIPT HUB (تثبيت الـ Agent والربط) */}
      {/* ========================================================================= */}
      {mainTab === 'installer_hub' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                ⚙️ مركز تثبيت وترخيص Windows Agent بالمعمل (Agent Setup & Enrollment Hub)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                توليد ملف التثبيت التلقائي (PowerShell Script) الجاهز للتشغيل على حواسيب المعمل للربط المباشر مع المنصة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اختر الفرع للترخيص:</label>
                <select
                  value={installerBranchId}
                  onChange={e => setInstallerBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-xs text-slate-200"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم المعمل والقاعة:</label>
                <input
                  type="text"
                  value={installerLabName}
                  onChange={e => setInstallerLabName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Direct Lab Access Link & Cloud Security Card */}
            <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/40 p-5 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-cyan-200 text-sm flex items-center gap-2">
                      <span>🔗 رابط المعمل المباشر للتشغيل والتأمين (Direct Lab Access & Kiosk Link)</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">نشط وجاهز</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      افتجه مباشرة على جهاز معمل الكمبيوتر الخاص بالطالب لتسجيل الحضور، استقبال النقاط ومراقبة الشاشة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getPublicKioskUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح واجهة المعمل الآن 🚀</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getPublicKioskUrl());
                      showToast('تم نسخ رابط المعمل المباشر حافظة الجهاز 📋', 'success');
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow"
                  >
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط المعمل</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 relative z-10">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    الرابط المباشر العادي (يتطلب كود أمان المعمل 1234 عند الاتصال الخارجي):
                  </span>
                  <div className="flex items-center gap-2 dir-ltr">
                    <input
                      type="text"
                      readOnly
                      value={getPublicKioskUrl()}
                      className="w-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300 px-3 py-1.5 rounded-lg select-all"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    الرابط السحابي المعتمد مسبقاً (Pre-authenticated Secure Link):
                  </span>
                  <div className="flex items-center gap-2 dir-ltr">
                    <input
                      type="text"
                      readOnly
                      value={getPublicKioskUrl(true)}
                      className="w-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-300 px-3 py-1.5 rounded-lg select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getPublicKioskUrl(true));
                        showToast('تم نسخ رابط المعمل المشفر والموثق بنجاح 🛡️', 'success');
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shrink-0 transition-all"
                    >
                      نسخ
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
                <span className="text-base">💡</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300 font-bold">تعليمات تشغيل رابط المعمل:</strong> عند فتح هذا الرابط على أجهزة المعمل، يقوم الجهاز بالتعرف التلقائي على محيط المعمل بالشبكة المحلية (LAN) وتوثيق حضور المتدرب فور إدخال كوده. يتم استقبال الأوامر الجماعية (قفل/فتح/منح نقاط/مراقبة الشاشة) مباشرة عبر هذا الرابط.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  NagahLabAgentSetup.ps1 (PowerShell Script)
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedPs1Script], { type: 'text/plain;charset=utf-8' });
                      // Fetch specific url
                      const specificPs1Url = `/api/download/lab-agent-ps1?branchId=${installerBranchId}&labName=${installerLabName}`;
                      fetch(specificPs1Url).then(r => r.blob()).then(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'NagahLabAgentSetup.ps1';
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('تم تحميل ملف السكريبت NagahLabAgentSetup.ps1 بنجاح 📥', 'success');
                      });
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل السكريبت (.ps1)</span>
                  </button>

                  <a
                    href={`/api/download/lab-agent-bat?branchId=${installerBranchId}&labName=${installerLabName}`}
                    download="Install-Nagah-Lab-Agent.bat"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف التثبيت المباشر (.bat)</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPs1Script);
                      setCopiedScript(true);
                      showToast('تم نسخ سكريبت تثبيت Agent بالكامل للذاكرة 📋', 'success');
                      setTimeout(() => setCopiedScript(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? 'تم النسخ بنجاح!' : 'نسخ الكود'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  💡 طريقة التثبيت على أجهزة معمل الكمبيوتر:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1 pr-1">
                  <li>افتح موجه أوامر <span className="text-cyan-300 font-mono font-bold">PowerShell كمسؤول (Run as Administrator)</span> على جهاز الطالب.</li>
                  <li>الصق الكود المنسوخ أعلاه واضغط <span className="text-amber-300 font-mono font-bold">Enter</span> (تم تفعيل بروتوكول TLS 1.2 السحابي لضمان الاتصال المشفر).</li>
                  <li>أو قم بتنزيل ملف <span className="text-emerald-300 font-mono font-bold">Install-Nagah-Lab-Agent.bat</span> وتشغيله مباشرة.</li>
                  <li>سيقوم المثبت بالربط مع السيرفر فوراً وإظهار الجهاز في لوحة التحكم وتجهيز وضع ملء الشاشة Kiosk Mode.</li>
                </ol>
              </div>

              <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-4 rounded-xl max-h-64 overflow-y-auto whitespace-pre-wrap select-text border border-slate-800 dir-ltr text-left">
                {generatedPs1Script}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AUDIT LOG (سجل الأوامر والتدقيق) */}
      {/* ========================================================================= */}
      {mainTab === 'audit_log' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="font-black text-slate-100 text-base mb-4 flex items-center gap-2">
              📜 سجل تدقيق وتوثيق أوامر الأجهزة (Device Command Audit Log)
            </h3>

            {isLoadingAudit ? (
              <p className="text-xs text-slate-400 text-center py-8">جاري تحميل سجل الأوامر...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{log.action || log.commandType}</p>
                      <p className="text-[10px] text-slate-400">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK COMMAND MODAL */}
      {isBulkCommandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4 shadow-2xl">
            <h3 className="font-black text-base text-slate-100 border-b border-slate-800 pb-3">
              تنفيذ أمر جماعي على {selectedDeviceIds.length} جهاز معملي ⚡
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اختر نوع الأمر الجماعي:</label>
                <select
                  value={bulkCommandType}
                  onChange={e => setBulkCommandType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-200"
                >
                  <option value="lock">🔒 قفل الشاشات والملاحة</option>
                  <option value="unlock">🔓 فتح قفل الأجهزة</option>
                  <option value="restart">🔄 إعادة تشغيل الحواسيب (Reboot)</option>
                  <option value="message">💬 إرسال رسالة تنبيهية فورية</option>
                  <option value="cleanup">🧹 تنظيف الملفات المؤقتة والجلسة</option>
                </select>
              </div>

              {bulkCommandType === 'message' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">نص الرسالة التنبيهية:</label>
                  <input
                    type="text"
                    value={bulkCommandMessage}
                    onChange={e => setBulkCommandMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-100"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleRunBulkCommand}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow"
              >
                تأكيد وتنفيذ للأجهزة المختارة
              </button>
              <button
                onClick={() => setIsBulkCommandModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
