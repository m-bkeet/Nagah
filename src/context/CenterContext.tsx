import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Branch, CenterSettings, SystemNotification } from '../types';
import { api } from '../services/api';
import { isTrainerSessionActive, setTrainerLabSessionState } from '../utils/labSecurity';

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
    } catch (err) {
      console.error('Error refreshing center data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const livePoll = setInterval(async () => {
      try {
        const devRes = await api.getDevices().catch(() => []);
        let onlineDevCount = 0;
        if (Array.isArray(devRes)) {
          onlineDevCount = devRes.filter((d: any) => d.isOnline).length;
        }
        setLabAttendanceCount(onlineDevCount);
      } catch (e) {}
    }, 2500);
    return () => clearInterval(livePoll);
  }, [refreshAll]);

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
        toggleTrainerLabSession
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
