import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  RotateCw,
  RotateCcw,
  Users,
  Laptop,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Shuffle,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
  Sparkles,
  Hash,
  HelpCircle,
  ListChecks,
  Clock,
  RefreshCw,
  Award,
  Mic,
  Undo2,
  Filter
} from 'lucide-react';
import { Trainee, Group, LabScheduleSlot, AttendanceStatus } from '../types';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { findScheduledGroupForNow } from '../utils/scheduleMatcher';

export type WheelSourceMode = 'lab_present' | 'group_all' | 'questions' | 'seats' | 'custom';
export type WheelThemeId = 'classic_academy' | 'vibrant_game' | 'cinema_night' | 'calm_pastel';

export interface WheelSliceItem {
  id: string;
  label: string;
  subLabel?: string;
  trainee?: Trainee;
  deviceName?: string;
  isPresent?: boolean;
  isOnlineDevice?: boolean;
  attendanceStatus?: AttendanceStatus;
}

export interface SmartFortuneWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees?: Trainee[];
  groups?: Group[];
  labSchedules?: LabScheduleSlot[];
  devices?: any[];
  attendanceMap?: Record<string, AttendanceStatus>;
  attendanceDetails?: Record<string, { status: AttendanceStatus; notes?: string }>;
  activeBranchId?: string;
  selectedGroupId?: string;
  onSelectGroupId?: (groupId: string) => void;
  onToggleAttendance?: (traineeId: string, nextStatus: AttendanceStatus) => void;
  onAwardPoints?: (trainee: Trainee, points: number, reason: string) => Promise<void> | void;
}

interface WheelThemePalette {
  id: WheelThemeId;
  name: string;
  colors: string[];
  textColor: string;
  rimColor: string;
  hubBg: string;
}

const WHEEL_THEMES: Record<WheelThemeId, WheelThemePalette> = {
  classic_academy: {
    id: 'classic_academy',
    name: 'الأكاديمي الملكي',
    colors: ['#0284c7', '#059669', '#d97706', '#4f46e5', '#0d9488', '#e11d48', '#2563eb', '#ca8a04'],
    textColor: '#ffffff',
    rimColor: '#f59e0b',
    hubBg: '#0f172a'
  },
  vibrant_game: {
    id: 'vibrant_game',
    name: 'تحدي الألوان',
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
    textColor: '#ffffff',
    rimColor: '#fbbf24',
    hubBg: '#1e1b4b'
  },
  cinema_night: {
    id: 'cinema_night',
    name: 'ليلي سينمائي',
    colors: ['#1e293b', '#0f766e', '#b45309', '#1d4ed8', '#9f1239', '#374151', '#0369a1', '#4338ca'],
    textColor: '#f8fafc',
    rimColor: '#eab308',
    hubBg: '#020617'
  },
  calm_pastel: {
    id: 'calm_pastel',
    name: 'هادئ مريح للعين',
    colors: ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#818cf8', '#2dd4bf', '#a3e635', '#f472b6'],
    textColor: '#0f172a',
    rimColor: '#0284c7',
    hubBg: '#ffffff'
  }
};

const QUICK_REASONS = [
  'إجابة صحيحة ومميزة في عجلة الحظ',
  'مشاركة متفاعلة وسريعة بالمعمل',
  'حل التحدي العملي بنجاح',
  'شجاعة علمية ومبادرة متميزة'
];

export const SmartFortuneWheelModal: React.FC<SmartFortuneWheelModalProps> = ({
  isOpen,
  onClose,
  trainees: propTrainees,
  groups: propGroups,
  labSchedules: propLabSchedules,
  devices: propDevices,
  attendanceMap: propAttendanceMap,
  attendanceDetails: propAttendanceDetails,
  activeBranchId: propBranchId,
  selectedGroupId: propSelectedGroupId,
  onSelectGroupId,
  onToggleAttendance,
  onAwardPoints
}) => {
  const {
    trainees: ctxTrainees,
    groups: ctxGroups,
    activeBranchId: ctxBranchId,
    setTrainees: setCtxTrainees,
    addPointsOptimistic,
    showToast
  } = useCenter();

  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const wheelGroupRef = useRef<SVGGElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentRotationRef = useRef<number>(0);

  // Fallback internal fetches when opened outside InteractiveSessionsView (e.g. from Dashboard orb)
  const [fetchedDevices, setFetchedDevices] = useState<any[]>([]);
  const [fetchedSchedules, setFetchedSchedules] = useState<LabScheduleSlot[]>([]);
  const [fetchedAttendanceMap, setFetchedAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [fetchedAttendanceDetails, setFetchedAttendanceDetails] = useState<Record<string, any>>({});
  const [isRefreshingLab, setIsRefreshingLab] = useState(false);

  const trainees = propTrainees && propTrainees.length > 0 ? propTrainees : ctxTrainees;
  const groups = propGroups && propGroups.length > 0 ? propGroups : ctxGroups;
  const activeBranchId = propBranchId !== undefined ? propBranchId : ctxBranchId;
  const devices = propDevices !== undefined ? propDevices : fetchedDevices;
  const labSchedules = propLabSchedules !== undefined ? propLabSchedules : fetchedSchedules;
  const attendanceMap = propAttendanceMap !== undefined ? propAttendanceMap : fetchedAttendanceMap;
  const attendanceDetails = propAttendanceDetails !== undefined ? propAttendanceDetails : fetchedAttendanceDetails;

  // Group Selection (synced with parent if provided, or internal)
  const [internalGroupId, setInternalGroupId] = useState<string>(propSelectedGroupId || 'auto');
  useEffect(() => {
    if (propSelectedGroupId !== undefined) {
      setInternalGroupId(propSelectedGroupId);
    }
  }, [propSelectedGroupId]);

  const activeGroupChoice = propSelectedGroupId !== undefined ? propSelectedGroupId : internalGroupId;
  const handleChangeGroupChoice = (nextGid: string) => {
    setInternalGroupId(nextGid);
    if (onSelectGroupId) onSelectGroupId(nextGid);
    setExcludedIds(new Set());
  };

  // Source Mode & Studio Controls
  const [sourceMode, setSourceMode] = useState<WheelSourceMode>('lab_present');
  const [includeAllGroupWhenLabEmpty, setIncludeAllGroupWhenLabEmpty] = useState<boolean>(false);
  const [wheelTheme, setWheelTheme] = useState<WheelThemeId>('classic_academy');
  const [spinDurationSec, setSpinDurationSec] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceSpeakEnabled, setVoiceSpeakEnabled] = useState<boolean>(true);
  const [autoRemoveWinner, setAutoRemoveWinner] = useState<boolean>(false);
  const [deduplicateEnabled, setDeduplicateEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Spin & Spotlight State
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [winnerItem, setWinnerItem] = useState<WheelSliceItem | null>(null);
  const [linkedContestant, setLinkedContestant] = useState<Trainee | null>(null);
  const [roundHistory, setRoundHistory] = useState<Array<{ id: string; item: WheelSliceItem; time: string }>>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [shuffledOrderIds, setShuffledOrderIds] = useState<string[] | null>(null);

  // Winner Points Award UI state
  const [awardPointsVal, setAwardPointsVal] = useState<number>(10);
  const [awardReason, setAwardReason] = useState<string>(QUICK_REASONS[0]);
  const [awardedDoneInSpotlight, setAwardedDoneInSpotlight] = useState<number | null>(null);
  const [isAwarding, setIsAwarding] = useState<boolean>(false);

  // Generators / Custom Items State
  const [extraCustomStudents, setExtraCustomStudents] = useState<WheelSliceItem[]>([]);
  const [singleStudentInput, setSingleStudentInput] = useState('');

  const [questionModeType, setQuestionModeType] = useState<'numbers' | 'custom_text'>('numbers');
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [questionPrefix, setQuestionPrefix] = useState<string>('سؤال');
  const [customQuestionsText, setCustomQuestionsText] = useState<string>(
    'ما الفرق بين المتغير والثابت؟\nاشرح فائدة الحلقات التكرارية (Loops)\nما المقصود بالشرط المنطقي (If / Else)؟\nأعط مثالاً على دالة (Function)\nكيف نكتشف الخطأ البرمجي؟\nما أهمية الخوارزميات؟'
  );

  const [seatCount, setSeatCount] = useState<number>(16);
  const [seatPrefix, setSeatPrefix] = useState<'مقعد' | 'PC-' | 'رقم'>('مقعد');

  const [customItemsList, setCustomItemsList] = useState<string[]>([
    'الفريق الأول',
    'الفريق الثاني',
    'الفريق الثالث',
    'الفريق الرابع'
  ]);
  const [customBulkInput, setCustomBulkInput] = useState<string>('');
  const [customSingleInput, setCustomSingleInput] = useState<string>('');

  // Local attendance override state when parent didn't pass onToggleAttendance
  const [localAttendanceOverrides, setLocalAttendanceOverrides] = useState<Record<string, AttendanceStatus>>({});

  const refreshLiveLabSnapshot = useCallback(async () => {
    setIsRefreshingLab(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [devs, scheds, att] = await Promise.all([
        api.getDevices().catch(() => []),
        propLabSchedules ? Promise.resolve(propLabSchedules) : api.getLabSchedules().catch(() => []),
        propAttendanceMap ? Promise.resolve([]) : api.getAttendance({ date: todayStr }).catch(() => [])
      ]);
      if (Array.isArray(devs)) setFetchedDevices(devs);
      if (Array.isArray(scheds) && !propLabSchedules) setFetchedSchedules(scheds);
      if (Array.isArray(att) && !propAttendanceMap) {
        const map: Record<string, AttendanceStatus> = {};
        const det: Record<string, any> = {};
        att.forEach((r: any) => {
          if (r && r.traineeId) {
            map[r.traineeId] = r.status || 'present';
            det[r.traineeId] = r;
          }
        });
        setFetchedAttendanceMap(map);
        setFetchedAttendanceDetails(det);
      }
    } finally {
      setIsRefreshingLab(false);
    }
  }, [propLabSchedules, propAttendanceMap]);

  useEffect(() => {
    if (isOpen) {
      refreshLiveLabSnapshot();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsSpinning(false);
    }
  }, [isOpen]);

  // Track Fullscreen changes cleanly
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && modalContainerRef.current) {
        await modalContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen(prev => !prev);
    }
  };

  // Branch Groups & Schedule Auto-Match
  const branchGroups = useMemo(() => {
    if (!activeBranchId || activeBranchId === 'all') return groups;
    return groups.filter(g => g.branchId === activeBranchId);
  }, [groups, activeBranchId]);

  const scheduleMatch = useMemo(
    () => findScheduledGroupForNow(groups, labSchedules, activeBranchId),
    [groups, labSchedules, activeBranchId]
  );

  const effectiveGroup = useMemo(() => {
    if (activeGroupChoice === 'all_branch') return null;
    if (activeGroupChoice !== 'auto') {
      return groups.find(g => g.id === activeGroupChoice) || null;
    }
    return scheduleMatch.group || branchGroups?.[0] || groups?.[0] || null;
  }, [activeGroupChoice, groups, branchGroups, scheduleMatch]);

  // Fast Online Lab Device Lookup
  const onlineDeviceByTrainee = useMemo(() => {
    const map = new Map<string, any>();
    (devices || []).forEach((d: any) => {
      if (!d || !d.isOnline) return;
      if (d.currentTraineeId) map.set(`id:${String(d.currentTraineeId)}`, d);
      if (d.currentTraineeCode) map.set(`code:${String(d.currentTraineeCode).trim().toUpperCase()}`, d);
      if (d.currentTraineeName) map.set(`name:${String(d.currentTraineeName).trim()}`, d);
    });
    return map;
  }, [devices]);

  const getOnlineDevice = useCallback(
    (t: Trainee) => {
      return (
        onlineDeviceByTrainee.get(`id:${String(t.id)}`) ||
        (t.code ? onlineDeviceByTrainee.get(`code:${String(t.code).trim().toUpperCase()}`) : undefined) ||
        (t.fullName ? onlineDeviceByTrainee.get(`name:${String(t.fullName).trim()}`) : undefined) ||
        null
      );
    },
    [onlineDeviceByTrainee]
  );

  // Enrolled Trainees in Effective Group (or Branch)
  const groupTrainees = useMemo(() => {
    let base: Trainee[];
    if (activeGroupChoice === 'all_branch' || !effectiveGroup) {
      base = trainees.filter(t => !activeBranchId || activeBranchId === 'all' || t.branchId === activeBranchId);
    } else {
      base = trainees.filter(t => {
        const gId = t.groupId || (t as any).currentGroupId;
        return gId === effectiveGroup.id || (Array.isArray(effectiveGroup.traineeIds) && effectiveGroup.traineeIds.includes(t.id));
      });
    }

    // Also include any trainee who actively logged into a lab device right now (even if guest/compensation session)
    const seen = new Set(base.map(t => t.id));
    const merged = [...base];
    (devices || []).forEach((d: any) => {
      if (!d || !d.isOnline) return;
      const found = trainees.find(
        t =>
          (d.currentTraineeId && String(t.id) === String(d.currentTraineeId)) ||
          (d.currentTraineeCode && t.code && String(t.code).trim().toUpperCase() === String(d.currentTraineeCode).trim().toUpperCase())
      );
      if (found && !seen.has(found.id)) {
        seen.add(found.id);
        merged.unshift(found);
      }
    });

    return merged;
  }, [trainees, effectiveGroup, activeGroupChoice, activeBranchId, devices]);

  // Does explicit attendance exist (saved in DB/localDetails or manually overridden)?
  const hasExplicitAttendanceRecords = useMemo(() => {
    const detailsCount = Object.keys(attendanceDetails || {}).length;
    const overrideCount = Object.keys(localAttendanceOverrides).length;
    const hasExplicitAbsent = Object.values(attendanceMap || {}).some(st => st === 'absent' || st === 'excused');
    return detailsCount > 0 || overrideCount > 0 || hasExplicitAbsent;
  }, [attendanceDetails, localAttendanceOverrides, attendanceMap]);

  // Compute Effective Status for each Group Trainee
  const rosterWithPresence = useMemo(() => {
    return groupTrainees.map(t => {
      const onlineDev = getOnlineDevice(t);
      const override = localAttendanceOverrides[t.id];
      const mapStatus = attendanceMap[t.id];
      const explicitRecord = attendanceDetails[t.id]?.status;

      // Determine final attendance status
      let status: AttendanceStatus = override || explicitRecord || mapStatus || (onlineDev ? 'present' : 'absent');

      // Online Lab Device check: if student is seated at an active PC and wasn't explicitly marked absent by override
      const isOnlineDevice = Boolean(onlineDev);
      const isPresentByAttendance =
        override !== undefined
          ? override === 'present' || override === 'late'
          : explicitRecord !== undefined
          ? explicitRecord === 'present' || explicitRecord === 'late'
          : hasExplicitAttendanceRecords
          ? mapStatus === 'present' || mapStatus === 'late'
          : false;

      const isExplicitlyAbsent = status === 'absent' || status === 'excused';
      const isPresent = !isExplicitlyAbsent && (isOnlineDevice || isPresentByAttendance);

      return {
        trainee: t,
        onlineDev,
        isOnlineDevice,
        isPresent,
        status: isOnlineDevice && !override && !explicitRecord ? 'present' : status
      };
    });
  }, [groupTrainees, getOnlineDevice, localAttendanceOverrides, attendanceMap, attendanceDetails, hasExplicitAttendanceRecords]);

  const onlineDevicesCount = useMemo(
    () => rosterWithPresence.filter(r => r.isOnlineDevice).length,
    [rosterWithPresence]
  );

  const presentRosterCount = useMemo(
    () => rosterWithPresence.filter(r => r.isPresent).length,
    [rosterWithPresence]
  );

  // Helper to toggle a student's Present/Absent state inside the wheel & sync with session roster
  const handleToggleStudentPresence = (traineeId: string, currentlyPresent: boolean) => {
    const nextStatus: AttendanceStatus = currentlyPresent ? 'absent' : 'present';
    setLocalAttendanceOverrides(prev => ({ ...prev, [traineeId]: nextStatus }));
    if (onToggleAttendance) {
      onToggleAttendance(traineeId, nextStatus);
    }
    if (!currentlyPresent) {
      // If marking present, ensure they aren't excluded from wheel
      setExcludedIds(prev => {
        const next = new Set(prev);
        next.delete(traineeId);
        return next;
      });
    }
  };

  // Build Raw Slices based on Source Mode
  const rawSourceItems = useMemo<WheelSliceItem[]>(() => {
    if (sourceMode === 'lab_present') {
      const presentRows = rosterWithPresence.filter(r => r.isPresent);
      const targetRows =
        presentRows.length > 0
          ? presentRows
          : includeAllGroupWhenLabEmpty
          ? rosterWithPresence.filter(r => r.status !== 'absent' && r.status !== 'excused')
          : [];

      const items: WheelSliceItem[] = targetRows.map(r => ({
        id: r.trainee.id,
        label: r.trainee.fullName || (r.trainee as any).name || r.trainee.code || 'متدرب',
        subLabel: [r.trainee.code, r.onlineDev ? `💻 ${r.onlineDev.name || r.onlineDev.deviceId}` : '']
          .filter(Boolean)
          .join(' · '),
        trainee: r.trainee,
        deviceName: r.onlineDev ? r.onlineDev.name || r.onlineDev.deviceId : undefined,
        isPresent: true,
        isOnlineDevice: r.isOnlineDevice,
        attendanceStatus: r.status
      }));

      return [...items, ...extraCustomStudents];
    }

    if (sourceMode === 'group_all') {
      const items: WheelSliceItem[] = rosterWithPresence
        .filter(r => r.status !== 'absent' && r.status !== 'excused')
        .map(r => ({
          id: r.trainee.id,
          label: r.trainee.fullName || (r.trainee as any).name || r.trainee.code || 'متدرب',
          subLabel: [r.trainee.code, r.onlineDev ? `💻 ${r.onlineDev.name || r.onlineDev.deviceId}` : '']
            .filter(Boolean)
            .join(' · '),
          trainee: r.trainee,
          deviceName: r.onlineDev ? r.onlineDev.name || r.onlineDev.deviceId : undefined,
          isPresent: r.isPresent,
          isOnlineDevice: r.isOnlineDevice,
          attendanceStatus: r.status
        }));
      return [...items, ...extraCustomStudents];
    }

    if (sourceMode === 'questions') {
      if (questionModeType === 'numbers') {
        const count = Math.max(2, Math.min(60, questionCount || 15));
        return Array.from({ length: count }, (_, idx) => ({
          id: `q-num-${idx + 1}`,
          label: `${questionPrefix} ${idx + 1}`,
          subLabel: `رقم ${idx + 1}`
        }));
      }
      const lines = customQuestionsText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      return lines.map((line, idx) => ({
        id: `q-txt-${idx}-${line.slice(0, 12)}`,
        label: line,
        subLabel: `سؤال #${idx + 1}`
      }));
    }

    if (sourceMode === 'seats') {
      const count = Math.max(2, Math.min(60, seatCount || 16));
      return Array.from({ length: count }, (_, idx) => {
        const num = idx + 1;
        const formatted = seatPrefix === 'PC-' ? `PC-${String(num).padStart(2, '0')}` : `${seatPrefix} ${num}`;
        return {
          id: `seat-${num}`,
          label: formatted,
          subLabel: 'جهاز / مقعد'
        };
      });
    }

    // custom
    return customItemsList.map((txt, idx) => ({
      id: `custom-${idx}-${txt}`,
      label: txt,
      subLabel: `#${idx + 1}`
    }));
  }, [
    sourceMode,
    rosterWithPresence,
    includeAllGroupWhenLabEmpty,
    extraCustomStudents,
    questionModeType,
    questionCount,
    questionPrefix,
    customQuestionsText,
    seatCount,
    seatPrefix,
    customItemsList
  ]);

  // Apply Exclusions, Deduplication, and Optional Shuffle
  const activeWheelItems = useMemo(() => {
    let list = rawSourceItems.filter(item => !excludedIds.has(item.id));

    if (deduplicateEnabled) {
      const seenLabels = new Set<string>();
      list = list.filter(item => {
        const key = item.label.trim().toLowerCase();
        if (seenLabels.has(key)) return false;
        seenLabels.add(key);
        return true;
      });
    }

    if (shuffledOrderIds && shuffledOrderIds.length > 0) {
      const orderMap = new Map(shuffledOrderIds.map((id, idx) => [id, idx]));
      list = [...list].sort((a, b) => {
        const ia = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const ib = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return ia - ib;
      });
    }

    return list;
  }, [rawSourceItems, excludedIds, deduplicateEnabled, shuffledOrderIds]);

  const activeTheme = WHEEL_THEMES[wheelTheme];

  const handleShuffleItems = () => {
    if (activeWheelItems.length < 2 || isSpinning) return;
    const ids = activeWheelItems.map(i => i.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrderIds(ids);
    audioService.playChime([520, 680]);
    showToast('تم خلط ترتيب العناصر عشوائياً', 'info');
  };

  const handleRestoreAllExcluded = () => {
    setExcludedIds(new Set());
    setShuffledOrderIds(null);
    audioService.playChime([520, 780]);
    showToast('تمت استعادة جميع المحذوفين إلى العجلة', 'success');
  };

  const handleExcludeItem = (itemId: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleAddEmergencyStudentOrItem = () => {
    const val = singleStudentInput.trim();
    if (!val) return;
    const newItem: WheelSliceItem = {
      id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: val,
      subLabel: 'إضافة فورية'
    };
    setExtraCustomStudents(prev => [...prev, newItem]);
    setSingleStudentInput('');
    audioService.playChime([600, 800]);
  };

  const handleAddCustomListItem = () => {
    const val = customSingleInput.trim();
    if (!val) return;
    setCustomItemsList(prev => [...prev, val]);
    setCustomSingleInput('');
  };

  const handleApplyBulkCustomItems = () => {
    const lines = customBulkInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setCustomItemsList(lines);
    setCustomBulkInput('');
    setExcludedIds(new Set());
    showToast(`تم إدخال ${lines.length} عنصر في العجلة بنجاح`, 'success');
  };

  const triggerConfettiBurst = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 85,
        origin: { y: 0.55 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 55,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.65 }
        });
        confetti({
          particleCount: 55,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.65 }
        });
      }, 220);
    } catch {}
  };

  const speakWinnerAnnouncement = useCallback(
    (item: WheelSliceItem) => {
      if (!voiceSpeakEnabled) return;
      const cleanName = item.label.trim();
      let script = '';
      if (item.trainee) {
        script = `وقع اختيار عجلة الحظ على البطل... ${cleanName}! تفضل بالإجابة والمشاركة!`;
      } else if (sourceMode === 'questions') {
        script = `جاء الاختيار على ${cleanName}! حان وقت التحدي!`;
      } else {
        script = `الفائز في عجلة الحظ هو... ${cleanName}!`;
      }
      audioService.speakText(script, { eventId: `wheel_win_${item.id}_${Date.now()}` }).catch(() => {});
    },
    [voiceSpeakEnabled, sourceMode]
  );

  // Precision 60fps Spin Engine with Real-Time Peg Tick Sound & Exact Angle Math
  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    if (activeWheelItems.length === 0) {
      showToast('القائمة فارغة! يرجى إضافة طلاب أو عناصر أولاً قبل تدوير العجلة', 'warning');
      return;
    }

    setWinnerItem(null);
    setAwardedDoneInSpotlight(null);
    setIsSpinning(true);
    audioService.unlockAudio();

    const n = activeWheelItems.length;
    const sliceAngle = 360 / n;
    const chosenIdx = Math.floor(Math.random() * n);
    // Pick random landing offset inside slice (15%..85% of slice width) so needle never sits ambiguously on border
    const insideOffset = sliceAngle * (0.15 + Math.random() * 0.7);
    const localAngleAlpha = chosenIdx * sliceAngle + insideOffset; // 0..360 clockwise from slice 0 start

    // At rotation R, top 12 o'clock points to alpha = ((-R % 360) + 360) % 360.
    // So desired R mod 360 = (360 - localAngleAlpha) % 360
    const startRot = currentRotationRef.current;
    const startMod = ((startRot % 360) + 360) % 360;
    const desiredMod = (360 - (localAngleAlpha % 360) + 360) % 360;
    let deltaMod = (desiredMod - startMod + 360) % 360;
    if (deltaMod < 30) deltaMod += 360;

    const extraTurns = spinDurationSec <= 3 ? 6 : spinDurationSec <= 5 ? 10 : 15;
    const targetRot = startRot + extraTurns * 360 + deltaMod;
    const totalChange = targetRot - startRot;
    const durationMs = spinDurationSec * 1000;
    const startTime = performance.now();

    let lastSliceIdx = Math.floor((((-startRot % 360) + 360) % 360) / sliceAngle) % n;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutQuart(progress);
      const curRot = startRot + totalChange * eased;

      currentRotationRef.current = curRot;
      if (wheelGroupRef.current) {
        wheelGroupRef.current.style.transform = `rotate(${curRot}deg)`;
      }

      // Compute exact slice currently under top needle
      const alpha = ((-curRot % 360) + 360) % 360;
      const curSliceIdx = Math.floor(alpha / sliceAngle) % n;
      if (curSliceIdx !== lastSliceIdx) {
        lastSliceIdx = curSliceIdx;
        if (soundEnabled) {
          audioService.playWheelTick(progress);
        }
        if (pointerRef.current) {
          pointerRef.current.style.transform = 'translateX(-50%) rotate(-18deg)';
          setTimeout(() => {
            if (pointerRef.current) {
              pointerRef.current.style.transform = 'translateX(-50%) rotate(0deg)';
            }
          }, 55);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentRotationRef.current = targetRot;
        setWheelRotation(targetRot);
        setIsSpinning(false);

        const finalAlpha = ((-targetRot % 360) + 360) % 360;
        const winIdx = Math.floor(finalAlpha / sliceAngle) % n;
        const won = activeWheelItems[winIdx] || activeWheelItems[0];

        setWinnerItem(won);
        if (won.trainee) {
          setLinkedContestant(won.trainee);
        }
        setRoundHistory(prev => [
          {
            id: `hist-${Date.now()}`,
            item: won,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...prev.slice(0, 29)
        ]);

        if (autoRemoveWinner) {
          setExcludedIds(prev => {
            const next = new Set(prev);
            next.add(won.id);
            return next;
          });
        }

        triggerConfettiBurst();
        if (soundEnabled) {
          audioService.playFanfare();
          setTimeout(() => audioService.playClapping(2.2), 300);
        }
        if (voiceSpeakEnabled) {
          setTimeout(() => speakWinnerAnnouncement(won), 650);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [
    isSpinning,
    activeWheelItems,
    spinDurationSec,
    soundEnabled,
    voiceSpeakEnabled,
    autoRemoveWinner,
    showToast,
    speakWinnerAnnouncement
  ]);

  // Keyboard Shortcuts: Space to Spin, Esc to Close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (winnerItem) {
          setWinnerItem(null);
          handleSpin();
        } else {
          handleSpin();
        }
      } else if (e.key === 'Escape') {
        if (winnerItem) {
          setWinnerItem(null);
        } else if (!isSpinning) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, winnerItem, isSpinning, handleSpin, onClose]);

  // Award Points Right from Winner Spotlight
  const targetTraineeForPoints = winnerItem?.trainee || linkedContestant;

  const handleAwardToWinner = async (pointsToGive: number, reasonText?: string) => {
    if (!targetTraineeForPoints || isAwarding) return;
    setIsAwarding(true);
    const finalReason = (reasonText || awardReason || QUICK_REASONS[0]).trim();
    try {
      if (onAwardPoints) {
        await onAwardPoints(targetTraineeForPoints, pointsToGive, finalReason);
      } else if (addPointsOptimistic) {
        await addPointsOptimistic([targetTraineeForPoints.id], pointsToGive, finalReason);
      } else {
        await api.addPoints({
          traineeIds: [targetTraineeForPoints.id],
          points: pointsToGive,
          reason: finalReason
        });
      }

      // Update local trainee view if needed
      setCtxTrainees?.(prev =>
        prev.map(t => {
          if (t.id === targetTraineeForPoints.id) {
            const cur = Number(t.totalPoints !== undefined ? t.totalPoints : t.points || 0);
            const next = Math.max(0, cur + pointsToGive);
            return { ...t, totalPoints: next, points: next };
          }
          return t;
        })
      );

      setAwardedDoneInSpotlight(prev => (prev || 0) + pointsToGive);
      if (pointsToGive > 0 && soundEnabled) {
        audioService.playCoinSound();
        audioService.playStarSuccess();
        triggerConfettiBurst();
      }
    } finally {
      setIsAwarding(false);
    }
  };

  if (!isOpen) return null;

  // Build SVG Pie Slices Geometry (Center = 250,250, Radius = 230)
  const cx = 250;
  const cy = 250;
  const r = 228;
  const sliceCount = Math.max(1, activeWheelItems.length);
  const sliceAngle = 360 / sliceCount;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const buildSlicePath = (startDeg: number, endDeg: number) => {
    if (sliceCount === 1) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    }
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const labelFontSize =
    sliceCount <= 6 ? 18 : sliceCount <= 12 ? 14.5 : sliceCount <= 20 ? 11.5 : sliceCount <= 30 ? 9.5 : 8;
  const maxLabelChars = sliceCount <= 8 ? 22 : sliceCount <= 16 ? 17 : 13;

  // Live points total for currently featured winner trainee
  const liveFeaturedTrainee = targetTraineeForPoints
    ? trainees.find(t => t.id === targetTraineeForPoints.id) || targetTraineeForPoints
    : null;
  const featuredCurrentStars = liveFeaturedTrainee
    ? Number(liveFeaturedTrainee.totalPoints !== undefined ? liveFeaturedTrainee.totalPoints : liveFeaturedTrainee.points || 0)
    : 0;

  return (
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 dir-rtl animate-in fade-in duration-150"
      dir="rtl"
    >
      <div
        ref={modalContainerRef}
        className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 ${
          isFullscreen ? 'w-screen h-screen rounded-none' : 'w-[96vw] max-w-[1440px] h-[93vh] rounded-3xl'
        }`}
      >
        {/* TOP HEADER BAR (Clean 3-Zone Contract) */}
        <header className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <RotateCw className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                عجلة الحظ التفاعلية بالمعمل
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {effectiveGroup ? effectiveGroup.name : 'جميع طلاب الفرع'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeWheelItems.length} عنصر بالعجلة</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                  {onlineDevicesCount} جهاز متصل بالمعمل
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={refreshLiveLabSnapshot}
              disabled={isRefreshingLab}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="تحديث أسماء الحاضرين وأجهزة المعمل المتصلة الآن"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshingLab ? 'animate-spin' : ''}`} />
              <span>تحديث المعمل</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                soundEnabled
                  ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title="تشغيل / كتم المؤثرات الصوتية"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'الصوت مفعّل' : 'صامت'}</span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceSpeakEnabled(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                voiceSpeakEnabled
                  ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title="نطق اسم الفائز صوتياً فور التوقف"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{voiceSpeakEnabled ? 'نطق الاسم تلقائياً' : 'بدون نطق'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title={isFullscreen ? 'إنهاء ملء الشاشة' : 'عرض ملء الشاشة للبروجكتور'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                audioService.stopAll();
                onClose();
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 cursor-pointer"
              title="إغلاق عجلة الحظ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN TWO-ZONE BODY */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* ZONE 1: HUGE INTERACTIVE WHEEL STAGE (8 cols on desktop) */}
          <section className="lg:col-span-8 relative flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            {/* Linked Contestant Banner when spinning a Question for a chosen student */}
            {linkedContestant && sourceMode !== 'lab_present' && sourceMode !== 'group_all' && (
              <div className="mb-3 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-3 text-xs">
                <span className="font-bold text-blue-800 dark:text-blue-200">
                  المتسابق المختار حالياً: <strong className="font-black">{linkedContestant.fullName}</strong>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black tabular-nums">
                  ⭐ {Number(linkedContestant.totalPoints ?? linkedContestant.points ?? 0)}
                </span>
                <button
                  type="button"
                  onClick={() => setLinkedContestant(null)}
                  className="text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
                >
                  إلغاء الربط
                </button>
              </div>
            )}

            {/* EMPTY STATE GUIDE WHEN NO PRESENT LAB STUDENTS YET */}
            {activeWheelItems.length === 0 ? (
              <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Laptop className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {excludedIds.size > 0
                    ? 'انتهت جميع الأسماء في هذه الجولة!'
                    : 'لا يوجد طلاب مسجلون دخول بالمعمل حالياً'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {excludedIds.size > 0
                    ? 'تم اختيار كل المشاركين في الجولة الحالية. يمكنك استعادة القائمة لبدء جولة جديدة.'
                    : 'تعمل العجلة تلقائياً على سحب الأجهزة المتصلة بالمعمل والحاضرين فقط ومنع الغائبين. يمكنك تحديث المعمل، أو تحميل طلاب المجموعة وتحديد الحاضرين يدوياً، أو التبديل لعجلة الأرقام والأسئلة.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {excludedIds.size > 0 ? (
                    <button
                      type="button"
                      onClick={handleRestoreAllExcluded}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>استعادة جميع العناصر ({excludedIds.size})</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIncludeAllGroupWhenLabEmpty(true);
                          setSourceMode('group_all');
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-4 h-4" />
                        <span>استيراد طلاب المجموعة والتحضير ({groupTrainees.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceMode('questions')}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        التبديل لعجلة الأسئلة
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* HUGE PRECISION WHEEL CANVAS */
              <div className="flex flex-col items-center justify-center w-full gap-5">
                <div
                  className="relative flex items-center justify-center select-none"
                  style={{
                    width: isFullscreen ? 'min(660px, 72vh, 90vw)' : 'min(540px, 64vh, 88vw)',
                    height: isFullscreen ? 'min(660px, 72vh, 90vw)' : 'min(540px, 64vh, 88vw)'
                  }}
                >
                  {/* Top Spring-Loaded Pointer Needle */}
                  <div
                    ref={pointerRef}
                    className="absolute -top-4 left-1/2 z-30 pointer-events-none transition-transform duration-75 origin-top"
                    style={{ transform: 'translateX(-50%) rotate(0deg)' }}
                  >
                    <svg width="46" height="54" viewBox="0 0 46 54" className="drop-shadow-lg">
                      <path
                        d="M23 52 L6 14 C4 7 9 2 16 2 L30 2 C37 2 42 7 40 14 Z"
                        fill="#e11d48"
                        stroke="#ffffff"
                        strokeWidth="3"
                      />
                      <circle cx="23" cy="14" r="5.5" fill="#fbbf24" />
                    </svg>
                  </div>

                  {/* SVG Wheel Graphic */}
                  <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
                    {/* Outer Decorative Brass/Gold Rim */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={244}
                      fill={activeTheme.rimColor}
                      stroke="#0f172a"
                      strokeOpacity="0.2"
                      strokeWidth="3"
                    />
                    <circle cx={cx} cy={cy} r={232} fill="#0f172a" />

                    {/* Rotating Wheel Group */}
                    <g
                      ref={wheelGroupRef}
                      style={{
                        transformOrigin: '250px 250px',
                        transform: `rotate(${wheelRotation}deg)`
                      }}
                    >
                      {activeWheelItems.map((item, idx) => {
                        const startDeg = idx * sliceAngle - 90;
                        const endDeg = (idx + 1) * sliceAngle - 90;
                        const midDeg = startDeg + sliceAngle / 2;
                        const sliceColor = activeTheme.colors[idx % activeTheme.colors.length];

                        const rawName = item.label.trim();
                        const truncated =
                          rawName.length > maxLabelChars ? rawName.slice(0, maxLabelChars - 1) + '…' : rawName;

                        // Radial peg dot on outer rim boundary
                        const pegX = cx + 235 * Math.cos(toRad(startDeg));
                        const pegY = cy + 235 * Math.sin(toRad(startDeg));

                        // Place text radially from inner-mid to outer rim, readable along slice radius
                        const textRadius = sliceCount <= 6 ? 138 : 148;
                        const flipText = midDeg > 90 && midDeg < 270;

                        return (
                          <g key={item.id}>
                            <path
                              d={buildSlicePath(startDeg, endDeg)}
                              fill={sliceColor}
                              stroke="#ffffff"
                              strokeOpacity="0.85"
                              strokeWidth={sliceCount > 24 ? 1 : 2}
                            />
                            {/* Boundary Peg */}
                            <circle cx={pegX} cy={pegY} r="3.5" fill="#ffffff" fillOpacity="0.9" />
                            {/* Radial Slice Text */}
                            <g transform={`translate(${cx}, ${cy}) rotate(${midDeg})`}>
                              <text
                                x={flipText ? -textRadius : textRadius}
                                y={0}
                                fill={activeTheme.textColor}
                                fontSize={labelFontSize}
                                fontWeight="800"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={flipText ? 'rotate(180)' : undefined}
                                style={{
                                  fontFamily: 'inherit',
                                  textShadow:
                                    activeTheme.textColor === '#ffffff'
                                      ? '0 1px 3px rgba(0,0,0,0.55)'
                                      : 'none'
                                }}
                              >
                                {truncated}
                              </text>
                            </g>
                          </g>
                        );
                      })}
                    </g>

                    {/* Center Metallic Hub Ring */}
                    <circle cx={cx} cy={cy} r={42} fill="#ffffff" fillOpacity="0.95" />
                    <circle cx={cx} cy={cy} r={37} fill={activeTheme.hubBg} stroke={activeTheme.rimColor} strokeWidth="4" />
                  </svg>

                  {/* Center Interactive Spin Button */}
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={isSpinning || activeWheelItems.length === 0}
                    className="absolute z-20 w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center font-black text-xs text-white bg-transparent hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-60"
                    title="أدِر العجلة الآن (Space)"
                  >
                    <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''} ${activeTheme.id === 'calm_pastel' ? 'text-slate-900' : 'text-amber-400'}`} />
                    <span className={`text-[11px] font-black mt-0.5 ${activeTheme.id === 'calm_pastel' ? 'text-slate-900' : 'text-white'}`}>
                      {isSpinning ? '...' : 'أدِر'}
                    </span>
                  </button>
                </div>

                {/* Primary CTA Spin Bar */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={isSpinning || activeWheelItems.length === 0}
                    className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'العجلة تدور...' : 'تدوير العجلة الآن'}</span>
                  </button>

                  {excludedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreAllExcluded}
                      className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Undo2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="tabular-nums">استعادة المحذوفين ({excludedIds.size})</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* DRAMATIC FULL-STAGE WINNER SPOTLIGHT OVERLAY (HUGE NAME + POINTS + DELETE/KEEP) */}
            {winnerItem && (
              <div className="absolute inset-0 z-40 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
                <div className="max-w-3xl w-full bg-white dark:bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative">
                  <button
                    type="button"
                    onClick={() => setWinnerItem(null)}
                    className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="العودة للعجلة"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Avatar or Trophy Emblem */}
                  <div className="flex flex-col items-center gap-3">
                    {liveFeaturedTrainee?.photoUrl || (liveFeaturedTrainee as any)?.photo ? (
                      <img
                        src={liveFeaturedTrainee?.photoUrl || (liveFeaturedTrainee as any)?.photo}
                        alt={winnerItem.label}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-3xl object-cover border-4 border-amber-400 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                        <Trophy className="w-10 h-10" />
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>{winnerItem.trainee ? 'الاختيار العشوائي في الحصة' : 'نتيجة عجلة الحظ'}</span>
                      {winnerItem.deviceName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{winnerItem.deviceName}</span>
                        </>
                      )}
                      {liveFeaturedTrainee && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-600 dark:text-amber-400 font-black tabular-nums">
                            رصيده الحالي: {featuredCurrentStars} نجمة
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* HUGE FULL-STAGE WINNER NAME */}
                  <div className="py-4 px-4 rounded-2xl bg-amber-50/70 dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30">
                    <h1
                      className="font-black text-slate-900 dark:text-white leading-tight break-words"
                      style={{ fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
                    >
                      {winnerItem.label}
                    </h1>
                    {winnerItem.subLabel && (
                      <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300 mt-2">
                        {winnerItem.subLabel}
                      </p>
                    )}
                    {linkedContestant && !winnerItem.trainee && (
                      <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 mt-2">
                        السؤال موجّه للطالب: <strong>{linkedContestant.fullName}</strong>
                      </p>
                    )}
                  </div>

                  {/* Voice Replay & Clapping Quick Bar */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => speakWinnerAnnouncement(winnerItem)}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>نطق الاسم بالصوت</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => audioService.playClapping(2.8)}
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تصفيق وتشجيع</span>
                    </button>
                  </div>

                  {/* INSTANT POINTS AWARD DECK (after student answers!) */}
                  {liveFeaturedTrainee && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 text-right">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>منح نقاط لـ ({liveFeaturedTrainee.fullName}) بعد الإجابة:</span>
                        </span>
                        {awardedDoneInSpotlight !== null && (
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                            تمت إضافة +{awardedDoneInSpotlight} نقطة بنجاح
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {[5, 10, 15, 20, 30].map(pts => (
                          <button
                            key={pts}
                            type="button"
                            disabled={isAwarding}
                            onClick={() => handleAwardToWinner(pts)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-sm transition-transform active:scale-95 cursor-pointer tabular-nums"
                          >
                            +{pts} ⭐
                          </button>
                        ))}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
                          <input
                            type="number"
                            value={awardPointsVal}
                            onChange={e => setAwardPointsVal(Number(e.target.value))}
                            className="w-14 text-center font-black text-xs bg-transparent focus:outline-none tabular-nums"
                          />
                          <button
                            type="button"
                            disabled={isAwarding || !awardPointsVal}
                            onClick={() => handleAwardToWinner(awardPointsVal)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer"
                          >
                            منح مخصص
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {QUICK_REASONS.map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setAwardReason(r)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                              awardReason === r
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WINNER ROUND PROGRESSION BUTTONS */}
                  <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2 border-t border-slate-200 dark:border-slate-800">
                    {!autoRemoveWinner && !excludedIds.has(winnerItem.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleExcludeItem(winnerItem.id);
                          setWinnerItem(null);
                          showToast(`تم حذف (${winnerItem.label}) من العجلة لهذه الجولة`, 'info');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذفه من العجلة</span>
                      </button>
                    )}

                    {winnerItem.trainee && (
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedContestant(winnerItem.trainee!);
                          setWinnerItem(null);
                          setSourceMode('questions');
                          showToast(`تم تثبيت ${winnerItem.label} — اسحب له سؤالاً الآن`, 'info');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>اسحب له سؤالاً الآن</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setWinnerItem(null);
                        handleSpin();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{autoRemoveWinner ? 'تدوير للاختيار التالي' : 'إبقاء وتدوير مجدداً'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ZONE 2: SMART CONTROL, GROUP ROSTER & SETTINGS DECK (4 cols on desktop) */}
          <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col min-h-0 overflow-y-auto p-4 space-y-5">
            {/* 1. Smart Group & Hour Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>المجموعة الحالية (تلقائي حسب الساعة)</span>
                {activeGroupChoice === 'auto' && scheduleMatch.matchedTimeRange && (
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {scheduleMatch.matchedTimeRange}
                  </span>
                )}
              </label>
              <select
                value={activeGroupChoice}
                onChange={e => handleChangeGroupChoice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="auto">
                  تلقائي ذكي حسب الساعة الآن{scheduleMatch.group ? ` (${scheduleMatch.group.name})` : ''}
                </option>
                <option value="all_branch">جميع طلاب الفرع</option>
                {branchGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.startTime ? `(${g.startTime}${g.endTime ? ` - ${g.endTime}` : ''})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Source Mode Switcher */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">ماذا تريد أن تضع في العجلة؟</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSourceMode('lab_present')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    sourceMode === 'lab_present'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>الحاضرون بالمعمل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('group_all')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    sourceMode === 'group_all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>تحضير المجموعة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('questions')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    sourceMode === 'questions'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>أسئلة / أرقام أسئلة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('seats')}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    sourceMode === 'seats'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>أرقام المقاعد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('custom')}
                  className={`col-span-2 sm:col-span-1 lg:col-span-2 px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    sourceMode === 'custom'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>قائمة مخصصة أو فرق</span>
                </button>
              </div>
            </div>

            {/* 3. Dynamic Source Content Panel */}
            {(sourceMode === 'lab_present' || sourceMode === 'group_all') && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    {sourceMode === 'lab_present'
                      ? `طلاب المعمل والحاضرون (${presentRosterCount})`
                      : `تحضير طلاب المجموعة (${rosterWithPresence.length})`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleShuffleItems}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="خلط الأسماء عشوائياً"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                    {excludedIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleRestoreAllExcluded}
                        className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[11px] font-bold cursor-pointer"
                      >
                        استعادة ({excludedIds.size})
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Emergency Name */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={singleStudentInput}
                    onChange={e => setSingleStudentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddEmergencyStudentOrItem()}
                    placeholder="إضافة اسم طالب طارئ للعجلة..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmergencyStudentOrItem}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Interactive Attendance & Inclusion List */}
                <div className="max-h-60 overflow-y-auto space-y-1.5 pl-1">
                  {rosterWithPresence.map(row => {
                    const isExcluded = excludedIds.has(row.trainee.id);
                    const willAppearInWheel =
                      !isExcluded &&
                      (sourceMode === 'group_all'
                        ? row.status !== 'absent' && row.status !== 'excused'
                        : row.isPresent || (includeAllGroupWhenLabEmpty && presentRosterCount === 0 && row.status !== 'absent' && row.status !== 'excused'));

                    return (
                      <div
                        key={row.trainee.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-xs transition-colors ${
                          willAppearInWheel
                            ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                            : 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/40 opacity-60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {row.trainee.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>{row.trainee.code || 'بدون كود'}</span>
                            {row.onlineDev && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  متصل ({row.onlineDev.name || row.onlineDev.deviceId})
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentPresence(row.trainee.id, row.isPresent)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors ${
                              row.isPresent
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            }`}
                            title="تبديل حالة الحضور والغياب ومزامنتها مع الكشف"
                          >
                            {row.isPresent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{row.isPresent ? 'حاضر' : 'غائب'}</span>
                          </button>

                          {willAppearInWheel && (
                            <button
                              type="button"
                              onClick={() => handleExcludeItem(row.trainee.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="استبعاد مؤقت من العجلة"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {extraCustomStudents.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/30 text-xs"
                    >
                      <span className="font-bold truncate">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => setExtraCustomStudents(prev => prev.filter(x => x.id !== item.id))}
                        className="text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sourceMode === 'questions' && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setQuestionModeType('numbers')}
                    className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer ${
                      questionModeType === 'numbers'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    أرقام أسئلة تلقائية
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionModeType('custom_text')}
                    className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer ${
                      questionModeType === 'custom_text'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    كتابة نص الأسئلة
                  </button>
                </div>

                {questionModeType === 'numbers' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">البادئة</label>
                      <input
                        type="text"
                        value={questionPrefix}
                        onChange={e => setQuestionPrefix(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">عدد الأسئلة</label>
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={questionCount}
                        onChange={e => setQuestionCount(Number(e.target.value) || 10)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black tabular-nums"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      اكتب كل سؤال في سطر مستقل:
                    </label>
                    <textarea
                      rows={5}
                      value={customQuestionsText}
                      onChange={e => setCustomQuestionsText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {sourceMode === 'seats' && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">التسمية</label>
                    <select
                      value={seatPrefix}
                      onChange={e => setSeatPrefix(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold"
                    >
                      <option value="مقعد">مقعد (1..N)</option>
                      <option value="PC-">جهاز (PC-01..N)</option>
                      <option value="رقم">رقم فقط</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">عدد المقاعد / الأجهزة</label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={seatCount}
                      onChange={e => setSeatCount(Number(e.target.value) || 12)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}

            {sourceMode === 'custom' && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customSingleInput}
                    onChange={e => setCustomSingleInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomListItem()}
                    placeholder="أضف عنصراً أو جائزة أو اسماً..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomListItem}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomItemsList(Array.from({ length: 10 }, (_, i) => `رقم ${i + 1}`))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold cursor-pointer"
                  >
                    أرقام 1–10
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomItemsList(['+5 نجوم', '+10 نجوم', 'بونص تحفيزي', 'اختر زميلك', '+15 نجمة', 'سؤال إضافي'])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold cursor-pointer"
                  >
                    مكافآت ومفاجآت
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomItemsList(['الفريق الأحمر', 'الفريق الأزرق', 'الفريق الأخضر', 'الفريق الذهبي'])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold cursor-pointer"
                  >
                    الفرق الأربعة
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1">
                  {customItemsList.map((txt, i) => (
                    <div
                      key={`${txt}-${i}`}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <span className="font-bold truncate">{txt}</span>
                      <button
                        type="button"
                        onClick={() => setCustomItemsList(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={customBulkInput}
                    onChange={e => setCustomBulkInput(e.target.value)}
                    placeholder="أو الصق قائمة كاملة هنا (كل عنصر في سطر)..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkCustomItems}
                    className="w-full py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    اعتماد القائمة الملصوقة
                  </button>
                </div>
              </div>
            )}

            {/* 4. Spin Rules, Deduplication & Theme Controls */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">خيارات اللعبة والتدوير</span>

              {/* Auto-remove & Dedupe */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                <span className="font-bold">حذف الفائز تلقائياً (عدم تكرار)</span>
                <input
                  type="checkbox"
                  checked={autoRemoveWinner}
                  onChange={e => setAutoRemoveWinner(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                <span className="font-bold">إزالة التكرارات تلقائياً</span>
                <input
                  type="checkbox"
                  checked={deduplicateEnabled}
                  onChange={e => setDeduplicateEnabled(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>

              {/* Spin Duration */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">سرعة ومدة الدوران</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { sec: 3, label: 'سريعة 3ث' },
                    { sec: 5, label: 'متوازنة 5ث' },
                    { sec: 8, label: 'حماسية 8ث' }
                  ].map(opt => (
                    <button
                      key={opt.sec}
                      type="button"
                      onClick={() => setSpinDurationSec(opt.sec)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                        spinDurationSec === opt.sec
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Switcher */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">مظهر ألوان العجلة</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.values(WHEEL_THEMES).map(th => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setWheelTheme(th.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-between cursor-pointer ${
                        wheelTheme === th.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/15 text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{th.name}</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        {th.colors.slice(0, 3).map((c, idx) => (
                          <span key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Round Winners Log */}
            {roundHistory.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    سجل الفائزين بالجلسة ({roundHistory.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoundHistory([])}
                    className="text-[11px] text-slate-500 hover:text-rose-600 cursor-pointer"
                  >
                    مسح السجل
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {roundHistory.map((h, i) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-slate-400 tabular-nums">{i + 1}.</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{h.item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 tabular-nums">{h.time}</span>
                        {excludedIds.has(h.item.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              setExcludedIds(prev => {
                                const next = new Set(prev);
                                next.delete(h.item.id);
                                return next;
                              });
                            }}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            إرجاع
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
