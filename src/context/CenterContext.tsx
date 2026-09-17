import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Branch, CenterSettings, SystemNotification, Trainee, Trainer, Course, Group } from '../types';
import { api } from '../services/api';
import { isTrainerSessionActive, setTrainerLabSessionState } from '../utils/labSecurity';
import { db as firestoreDb } from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { normalizeArabicFull } from '../utils/arabicUtils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

export interface PrintData {
  title: string;
  type: 'trainee_badge' | 'receipt' | 'attendance' | 'certificate' | 'statement' | 'report' | 'exam_results';
  data: any;
}

interface CenterContextType {
  branches: Branch[];
  activeBranchId: string; // 'all' or branch ID
  setActiveBranchId: (id: string) => void;
  settings: CenterSettings | null;
  notifications: SystemNotification[];
  unreadNotifsCount: number;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalTab: 'manager' | 'developer' | 'social_bots' | 'trainer';
  setAiModalTab: (tab: 'manager' | 'developer' | 'social_bots' | 'trainer') => void;
  openAiModal: (tab?: 'manager' | 'developer' | 'social_bots' | 'trainer') => void;
  printData: PrintData | null;
  setPrintData: (data: PrintData | null) => void;
  refreshAll: () => Promise<void>;
  refreshKey: number;
  serverIp: string;
  isTrainerLabActive: boolean;
  labAttendanceCount: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  showDateStatsModal: boolean;
  setShowDateStatsModal: (show: boolean) => void;
  toggleTrainerLabSession: (branchId?: string, trainerName?: string, active?: boolean, roomName?: string) => void;

  // Unified Shared States for Core Entities
  trainees: Trainee[];
  setTrainees: React.Dispatch<React.SetStateAction<Trainee[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  trainers: Trainer[];
  setTrainers: React.Dispatch<React.SetStateAction<Trainer[]>>;
  isLoadingData: boolean;
  refreshCoreData: (force?: boolean) => Promise<void>;

  // Optimistic UI Actions with Background Firebase Sync & Auto-Rollback
  updateTraineeOptimistic: (traineeId: string, updates: Partial<Trainee>) => Promise<boolean>;
  addPointsOptimistic: (traineeIds: string[], points: number, reason: string, meta?: any) => Promise<boolean>;
  createTraineeOptimistic: (trainee: Trainee) => Promise<boolean>;
  deleteTraineeOptimistic: (traineeId: string) => Promise<boolean>;
  updateSettingsOptimistic: (updates: Partial<CenterSettings>) => Promise<boolean>;
  updateCourseOptimistic: (courseId: string, updates: Partial<Course>) => Promise<boolean>;
  updateGroupOptimistic: (groupId: string, updates: Partial<Group>) => Promise<boolean>;
  updateTrainerOptimistic: (trainerId: string, updates: Partial<Trainer>) => Promise<boolean>;
}

export function deduplicateTraineeList(list: Trainee[]): Trainee[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const byId = new Map<string, Trainee>();
  const byCode = new Map<string, Trainee>();
  const byNormName = new Map<string, Trainee>();
  const result: Trainee[] = [];

  const cleanPhone = (p?: string) => String(p || '').replace(/\D/g, '').slice(-10);

  for (const t of list) {
    if (!t) continue;
    const id = t.id ? String(t.id).trim() : '';
    const code = t.code ? String(t.code).trim().toUpperCase() : '';
    const normName = normalizeArabicFull(t.fullName);
    const phone = cleanPhone(t.phone);
    const parentPhone = cleanPhone(t.parentPhone);

    let existing: Trainee | null = null;
    if (id && byId.has(id)) {
      existing = byId.get(id)!;
    } else if (code && byCode.has(code)) {
      existing = byCode.get(code)!;
    } else if (normName && byNormName.has(normName)) {
      const candidate = byNormName.get(normName)!;
      const cPhone = cleanPhone(candidate.phone);
      const cParentPhone = cleanPhone(candidate.parentPhone);
      const samePhone = (phone && (phone === cPhone || phone === cParentPhone)) ||
                        (parentPhone && (parentPhone === cPhone || parentPhone === cParentPhone));
      const sameGroupOrCourse = (t.groupId && candidate.groupId && t.groupId === candidate.groupId) ||
                                (t.courseId && candidate.courseId && t.courseId === candidate.courseId);
      if (samePhone || sameGroupOrCourse || (!phone && !parentPhone && !cPhone && !cParentPhone)) {
        existing = candidate;
      }
    }

    if (existing) {
      // Merge into existing record
      const mergedTotalPoints = Math.max(
        Number(existing.totalPoints !== undefined ? existing.totalPoints : (existing.points || 0)),
        Number(t.totalPoints !== undefined ? t.totalPoints : (t.points || 0))
      );
      const mergedPaidAmount = Math.max(Number(existing.paidAmount || 0), Number(t.paidAmount || 0));

      Object.assign(existing, {
        ...t,
        ...existing,
        id: existing.id || t.id,
        code: existing.code || t.code,
        fullName: existing.fullName || t.fullName,
        phone: existing.phone || t.phone,
        parentPhone: existing.parentPhone || t.parentPhone,
        nationalId: existing.nationalId || t.nationalId,
        totalPoints: mergedTotalPoints,
        points: mergedTotalPoints,
        paidAmount: mergedPaidAmount,
        notes: existing.notes ? (t.notes && !existing.notes.includes(t.notes) ? `${existing.notes} | ${t.notes}` : existing.notes) : (t.notes || '')
      });
    } else {
      const record = { ...t };
      result.push(record);
      if (id) byId.set(id, record);
      if (code) byCode.set(code, record);
      if (normName) byNormName.set(normName, record);
    }
  }

  return result;
}

const CenterContext = createContext<CenterContextType | undefined>(undefined);

export const CenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [settings, setSettings] = useState<CenterSettings | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<'manager' | 'developer' | 'social_bots' | 'trainer'>('manager');
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [isTrainerLabActive, setIsTrainerLabActive] = useState<boolean>(() => isTrainerSessionActive(activeBranchId));
  const [labAttendanceCount, setLabAttendanceCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showDateStatsModal, setShowDateStatsModal] = useState<boolean>(false);

  // Core entities global states with localStorage hydration
  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    try {
      const cached = localStorage.getItem('nagah_trainees');
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return deduplicateTraineeList(parsed);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('nagah_courses');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      const cached = localStorage.getItem('nagah_groups');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [trainers, setTrainers] = useState<Trainer[]>(() => {
    try {
      const cached = localStorage.getItem('nagah_trainers');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Ref tracking pending optimistic updates to avoid being overwritten by incoming listeners
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Toast notification helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync lab active state on branch change or custom event
  useEffect(() => {
    const updateLabState = () => {
      setIsTrainerLabActive(isTrainerSessionActive(activeBranchId));
    };
    updateLabState();

    window.addEventListener('nagah_lab_session_changed', updateLabState);
    window.addEventListener('storage', updateLabState);

    return () => {
      window.removeEventListener('nagah_lab_session_changed', updateLabState);
      window.removeEventListener('storage', updateLabState);
    };
  }, [activeBranchId]);

  const toggleTrainerLabSession = useCallback((
    targetBranchId: string = activeBranchId === 'all' ? 'b1' : activeBranchId,
    trainerName: string = 'المحاضر المشرف',
    active?: boolean,
    roomName: string = 'المعمل الرئيسي'
  ) => {
    const nextState = active !== undefined ? active : !isTrainerSessionActive(targetBranchId);
    setTrainerLabSessionState(targetBranchId, trainerName, nextState, roomName);
    setIsTrainerLabActive(nextState);
    if (!nextState) {
      api.sessionCleanup().catch(() => {});
    }
  }, [activeBranchId]);

  const openAiModal = useCallback((tab: 'manager' | 'developer' | 'social_bots' | 'trainer' = 'manager') => {
    setAiModalTab(tab);
    setIsAiModalOpen(true);
  }, []);
  const [refreshKey, setRefreshKey] = useState(0);
  const [serverIp, setServerIp] = useState('127.0.0.1');

  // =========================================================================
  // OPTIMISTIC MUTATIONS (Instant UI response + Background Firebase Sync)
  // =========================================================================

  // 1. Optimistic Trainee Update (Names, codes, statuses, settings, fees)
  const updateTraineeOptimistic = useCallback(async (traineeId: string, updates: Partial<Trainee>): Promise<boolean> => {
    if (!traineeId) return false;
    pendingUpdatesRef.current.add(traineeId);

    let previousSnapshot: Trainee[] = [];
    setTrainees(prev => {
      previousSnapshot = [...prev];
      const updatedList = prev.map(t => (t.id === traineeId || t.code === traineeId) ? { ...t, ...updates } : t);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    // Broadcast across windows
    window.dispatchEvent(new CustomEvent('nagah_trainee_mutated', { detail: { traineeId, updates } }));

    try {
      await api.updateTrainee(traineeId, updates);
      pendingUpdatesRef.current.delete(traineeId);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Trainee update sync failed, rolling back:', err);
      setTrainees(previousSnapshot);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(previousSnapshot)); } catch {}
      pendingUpdatesRef.current.delete(traineeId);
      showToast('تعذر حفظ التعديل في السحابة، تمت استعادة البيانات السابقة', 'error');
      return false;
    }
  }, [showToast]);

  // 2. Optimistic Points Award / Deduction (Instant calculation + Firebase Background)
  const addPointsOptimistic = useCallback(async (
    traineeIds: string[],
    points: number,
    reason: string,
    meta?: any
  ): Promise<boolean> => {
    if (!traineeIds || traineeIds.length === 0 || isNaN(points)) return false;
    const pVal = Number(points);
    const idSet = new Set(traineeIds);

    traineeIds.forEach(id => pendingUpdatesRef.current.add(id));

    let previousSnapshot: Trainee[] = [];
    setTrainees(prev => {
      previousSnapshot = [...prev];
      const updatedList = prev.map(t => {
        if (idSet.has(t.id) || (t.code && idSet.has(t.code))) {
          const current = Number(t.totalPoints !== undefined ? t.totalPoints : (t.points || 0));
          const nextTotal = Math.max(0, current + pVal);
          return { ...t, totalPoints: nextTotal, points: nextTotal };
        }
        return t;
      });
      try { localStorage.setItem('nagah_trainees', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    showToast(pVal > 0 ? `تمت إضافة ${pVal} نقطة بنجاح! 🌟` : `تم خصم ${Math.abs(pVal)} نقطة بنجاح`, 'success');

    try {
      await api.addPoints({
        traineeIds,
        points: pVal,
        reason: reason || 'نشاط تدريبي وتفاعل متميز',
        ...meta
      });
      traineeIds.forEach(id => pendingUpdatesRef.current.delete(id));
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Points award sync failed, rolling back:', err);
      setTrainees(previousSnapshot);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(previousSnapshot)); } catch {}
      traineeIds.forEach(id => pendingUpdatesRef.current.delete(id));
      showToast('فشلت مزامنة النقاط مع السحابة، تمت الاستعادة تلقائياً', 'error');
      return false;
    }
  }, [showToast]);

  // 3. Optimistic Trainee Creation
  const createTraineeOptimistic = useCallback(async (trainee: Trainee): Promise<boolean> => {
    if (!trainee.id) return false;
    pendingUpdatesRef.current.add(trainee.id);

    let previousSnapshot: Trainee[] = [];
    setTrainees(prev => {
      previousSnapshot = [...prev];
      const normNew = normalizeArabicFull(trainee.fullName);
      const newCode = (trainee.code || '').trim().toUpperCase();
      const filtered = prev.filter(t => 
        t.id !== trainee.id &&
        (!newCode || String(t.code || '').trim().toUpperCase() !== newCode) &&
        (!normNew || normalizeArabicFull(t.fullName) !== normNew)
      );
      const updatedList = deduplicateTraineeList([trainee, ...filtered]);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    try {
      await api.createTrainee(trainee);
      pendingUpdatesRef.current.delete(trainee.id);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Trainee create sync failed, rolling back:', err);
      setTrainees(previousSnapshot);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(previousSnapshot)); } catch {}
      pendingUpdatesRef.current.delete(trainee.id);
      showToast('تعذر تسجيل المتدرب في السحابة، يرجى إعادة المحاولة', 'error');
      return false;
    }
  }, [showToast]);

  // 4. Optimistic Trainee Deletion
  const deleteTraineeOptimistic = useCallback(async (traineeId: string): Promise<boolean> => {
    if (!traineeId) return false;
    pendingUpdatesRef.current.add(traineeId);

    let previousSnapshot: Trainee[] = [];
    setTrainees(prev => {
      previousSnapshot = [...prev];
      const updatedList = prev.filter(t => t.id !== traineeId && t.code !== traineeId);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(updatedList)); } catch {}
      return updatedList;
    });

    try {
      await api.deleteTrainee(traineeId);
      pendingUpdatesRef.current.delete(traineeId);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Trainee delete sync failed, rolling back:', err);
      setTrainees(previousSnapshot);
      try { localStorage.setItem('nagah_trainees', JSON.stringify(previousSnapshot)); } catch {}
      pendingUpdatesRef.current.delete(traineeId);
      showToast('تعذر حذف المتدرب من السحابة', 'error');
      return false;
    }
  }, [showToast]);

  // 5. Optimistic Settings Update
  const updateSettingsOptimistic = useCallback(async (updates: Partial<CenterSettings>): Promise<boolean> => {
    let prevSettings = settings;
    setSettings(prev => {
      const next = prev ? { ...prev, ...updates } : updates as CenterSettings;
      try {
        if (next.logoUrl) localStorage.setItem('nagah_center_logo', next.logoUrl);
      } catch {}
      return next;
    });

    try {
      await api.updateSettings(updates);
      showToast('تم حفظ الإعدادات بنجاح في السحابة', 'success');
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Settings update failed, rolling back:', err);
      setSettings(prevSettings);
      showToast('تعذر حفظ الإعدادات في السحابة', 'error');
      return false;
    }
  }, [settings, showToast]);

  // 6. Optimistic Course Update
  const updateCourseOptimistic = useCallback(async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
    let prevCourses: Course[] = [];
    setCourses(prev => {
      prevCourses = [...prev];
      const next = prev.map(c => c.id === courseId ? { ...c, ...updates } : c);
      try { localStorage.setItem('nagah_courses', JSON.stringify(next)); } catch {}
      return next;
    });

    try {
      await api.updateCourse(courseId, updates);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Course update failed, rolling back:', err);
      setCourses(prevCourses);
      try { localStorage.setItem('nagah_courses', JSON.stringify(prevCourses)); } catch {}
      showToast('تعذر تحديث بيانات الدورة في السحابة', 'error');
      return false;
    }
  }, [showToast]);

  // 7. Optimistic Group Update
  const updateGroupOptimistic = useCallback(async (groupId: string, updates: Partial<Group>): Promise<boolean> => {
    let prevGroups: Group[] = [];
    setGroups(prev => {
      prevGroups = [...prev];
      const next = prev.map(g => g.id === groupId ? { ...g, ...updates } : g);
      try { localStorage.setItem('nagah_groups', JSON.stringify(next)); } catch {}
      return next;
    });

    try {
      await api.updateGroup(groupId, updates);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Group update failed, rolling back:', err);
      setGroups(prevGroups);
      try { localStorage.setItem('nagah_groups', JSON.stringify(prevGroups)); } catch {}
      showToast('تعذر تحديث بيانات المجموعة في السحابة', 'error');
      return false;
    }
  }, [showToast]);

  // 8. Optimistic Trainer Update
  const updateTrainerOptimistic = useCallback(async (trainerId: string, updates: Partial<Trainer>): Promise<boolean> => {
    let prevTrainers: Trainer[] = [];
    setTrainers(prev => {
      prevTrainers = [...prev];
      const next = prev.map(t => t.id === trainerId ? { ...t, ...updates } : t);
      try { localStorage.setItem('nagah_trainers', JSON.stringify(next)); } catch {}
      return next;
    });

    try {
      await api.updateTrainer(trainerId, updates);
      return true;
    } catch (err: any) {
      console.warn('[Optimistic] Trainer update failed, rolling back:', err);
      setTrainers(prevTrainers);
      try { localStorage.setItem('nagah_trainers', JSON.stringify(prevTrainers)); } catch {}
      showToast('تعذر تحديث بيانات المدرب في السحابة', 'error');
      return false;
    }
  }, [showToast]);

  // =========================================================================
  // CORE DATA REFRESH & REAL-TIME LISTENERS
  // =========================================================================

  const refreshCoreData = useCallback(async (force = true) => {
    const now = Date.now();
    const lastFetch = (window as any).lastCoreDataFetchTime || 0;

    if (!force && trainees.length > 0 && (now - lastFetch < 20000)) {
      return;
    }

    setIsLoadingData(trainees.length === 0);
    try {
      const [traineesRes, coursesRes, groupsRes, trainersRes] = await Promise.all([
        api.getTrainees().catch((e) => { console.warn('getTrainees failed:', e); return null; }),
        api.getCourses().catch((e) => { console.warn('getCourses failed:', e); return null; }),
        api.getGroups().catch((e) => { console.warn('getGroups failed:', e); return null; }),
        api.getTrainers().catch((e) => { console.warn('getTrainers failed:', e); return null; })
      ]);

      if (Array.isArray(traineesRes)) {
        setTrainees(prev => {
          const serverList = traineesRes;
          const prevList = Array.isArray(prev) ? prev : [];
          const serverMap = new Map(serverList.map(t => [t.id, t]));
          const serverCodes = new Set(serverList.map(t => (t.code || '').trim().toUpperCase()).filter(Boolean));
          const serverNormNames = new Set(serverList.map(t => normalizeArabicFull(t.fullName)).filter(Boolean));
          const merged = [...serverList];

          // Protect locally added or currently pending trainees from being overwritten,
          // while strictly preventing duplicate student injection
          for (const localT of prevList) {
            if (localT && localT.id) {
              const isPending = pendingUpdatesRef.current.has(localT.id);
              const existsOnServer = serverMap.has(localT.id);

              if (existsOnServer && isPending) {
                // Keep the pending optimistic local state for existing trainee
                const idx = merged.findIndex(m => m.id === localT.id);
                if (idx >= 0) merged[idx] = localT;
              } else if (!existsOnServer && isPending) {
                // Only inject if it was genuinely submitted and pending, AND not already duplicated semantically on server
                const localCode = (localT.code || '').trim().toUpperCase();
                const localNormName = normalizeArabicFull(localT.fullName);
                const isDupeOnServer = (localCode && serverCodes.has(localCode)) || (localNormName && serverNormNames.has(localNormName));

                if (!isDupeOnServer) {
                  merged.unshift(localT);
                  serverMap.set(localT.id, localT);
                  if (localCode) serverCodes.add(localCode);
                  if (localNormName) serverNormNames.add(localNormName);
                }
              }
            }
          }

          const deduped = deduplicateTraineeList(merged);
          try { localStorage.setItem('nagah_trainees', JSON.stringify(deduped)); } catch {}
          return deduped;
        });
      }
      if (Array.isArray(coursesRes)) {
        setCourses(coursesRes);
        try { localStorage.setItem('nagah_courses', JSON.stringify(coursesRes)); } catch {}
      }
      if (Array.isArray(groupsRes)) {
        setGroups(groupsRes);
        try { localStorage.setItem('nagah_groups', JSON.stringify(groupsRes)); } catch {}
      }
      if (Array.isArray(trainersRes)) {
        setTrainers(trainersRes);
        try { localStorage.setItem('nagah_trainers', JSON.stringify(trainersRes)); } catch {}
      }
      (window as any).lastCoreDataFetchTime = Date.now();
    } catch (err) {
      console.error('Error refreshing core data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [trainees.length]);

  const refreshAll = useCallback(async () => {
    try {
      const safeCall = async <T,>(p: Promise<T>): Promise<T | null> => {
        try { return await p; } catch (e) { console.warn('[CenterContext] API fetch warning:', e); return null; }
      };

      const [branchesRes, settingsRes, notifsRes, sysRes, attRes, devRes] = await Promise.all([
        safeCall(api.getBranches()),
        safeCall(api.getSettings()),
        safeCall(api.getNotifications()),
        safeCall(api.getSystemInfo()),
        safeCall(api.getAttendance({ date: new Date().toISOString().split('T')[0] })),
        safeCall(api.getDevices())
      ]);

      if (Array.isArray(branchesRes)) {
        setBranches(branchesRes);
      }
      if (settingsRes && typeof settingsRes === 'object' && !Array.isArray(settingsRes)) {
        const s = { ...settingsRes } as any;
        if (!s.logoUrl) {
          const cachedLogo = localStorage.getItem('nagah_center_logo');
          if (cachedLogo) {
            s.logoUrl = cachedLogo;
          }
        } else {
          localStorage.setItem('nagah_center_logo', s.logoUrl);
        }
        setSettings(s);
      } else {
        const cachedLogo = localStorage.getItem('nagah_center_logo');
        if (cachedLogo) {
          setSettings({ logoUrl: cachedLogo } as any);
        }
      }
      if (notifsRes && Array.isArray(notifsRes.notifications)) {
        setNotifications(notifsRes.notifications);
      }
      if (sysRes?.serverIp) {
        setServerIp(sysRes.serverIp);
      }

      let onlineDevCount = 0;
      if (Array.isArray(devRes)) {
        onlineDevCount = devRes.filter((d: any) => d.isOnline).length;
      }

      // Reflect only currently connected online devices
      setLabAttendanceCount(onlineDevCount);
      setRefreshKey(k => k + 1);

      // Centralized core data refresh triggered synchronously during full refresh
      await refreshCoreData(true);
    } catch (err) {
      console.error('Error refreshing center data:', err);
    }
  }, [refreshCoreData]);

  // Multi-Tab & Real-time Storage Listeners
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nagah_trainees' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTrainees(parsed);
        } catch {}
      } else if (e.key === 'nagah_courses' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCourses(parsed);
        } catch {}
      } else if (e.key === 'nagah_groups' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setGroups(parsed);
        } catch {}
      } else if (e.key === 'nagah_trainers' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTrainers(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Real-time Firestore Snapshot Listener for Live Multi-Device Sync
  useEffect(() => {
    let unsubscribeTraineesChunk: (() => void) | null = null;
    try {
      if (firestoreDb) {
        // Listen to chunk store document for instant server sync
        const chunkDocRef = doc(firestoreDb, 'nagah_store', 'trainees_chunk_0');
        unsubscribeTraineesChunk = onSnapshot(chunkDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data && Array.isArray(data.items)) {
              setTrainees(prev => {
                const incoming: Trainee[] = data.items;
                const prevMap = new Map(prev.map(p => [p.id, p]));
                const merged = incoming.map(inc => {
                  // Protect active pending optimistic updates from being overwritten
                  if (pendingUpdatesRef.current.has(inc.id) && prevMap.has(inc.id)) {
                    return prevMap.get(inc.id)!;
                  }
                  return inc;
                });
                const deduped = deduplicateTraineeList(merged);
                try { localStorage.setItem('nagah_trainees', JSON.stringify(deduped)); } catch {}
                return deduped;
              });
            }
          }
        }, (err) => {
          console.warn('[Firestore Real-time Listener Notice]', err?.message);
        });
      }
    } catch (e) {
      console.warn('[Firestore Init Listener Notice]', e);
    }

    return () => {
      if (unsubscribeTraineesChunk) unsubscribeTraineesChunk();
    };
  }, []);

  useEffect(() => {
    refreshAll();
    refreshCoreData(false);
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <CenterContext.Provider
      value={{
        branches,
        activeBranchId,
        setActiveBranchId,
        settings,
        notifications,
        unreadNotifsCount,
        toasts,
        showToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalTab,
        setAiModalTab,
        openAiModal,
        printData,
        setPrintData,
        refreshAll,
        refreshKey,
        serverIp,
        isTrainerLabActive,
        labAttendanceCount,
        selectedDate,
        setSelectedDate,
        showDateStatsModal,
        setShowDateStatsModal,
        toggleTrainerLabSession,

        // Exposing global core states
        trainees,
        setTrainees,
        courses,
        setCourses,
        groups,
        setGroups,
        trainers,
        setTrainers,
        isLoadingData,
        refreshCoreData,

        // Exposing optimistic mutation actions
        updateTraineeOptimistic,
        addPointsOptimistic,
        createTraineeOptimistic,
        deleteTraineeOptimistic,
        updateSettingsOptimistic,
        updateCourseOptimistic,
        updateGroupOptimistic,
        updateTrainerOptimistic
      }}
    >
      {children}
    </CenterContext.Provider>
  );
};

export const useCenter = () => {
  const context = useContext(CenterContext);
  if (!context) {
    throw new Error('useCenter must be used within a CenterProvider');
  }
  return context;
};
