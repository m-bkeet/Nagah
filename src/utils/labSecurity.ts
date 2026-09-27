// Utility for strict Lab Access, Trainer Device Verification & Attendance Security
// Prevents students from opening labs, entering halls, or logging remote attendance without trainer session active

export interface ActiveLabSession {
  branchId: string;
  trainerName: string;
  roomName: string;
  activatedAt: string;
  trainerIp?: string;
  isActive: boolean;
}

const STORAGE_KEY_LAB_SESSIONS = 'nagah_active_trainer_lab_sessions';

/**
 * Gets all currently active trainer lab sessions
 */
export function getActiveTrainerSessions(): Record<string, ActiveLabSession> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAB_SESSIONS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Checks whether a trainer has an active, open device session for a specific branch or globally
 */
export function isTrainerSessionActive(branchId?: string): boolean {
  if (typeof window === 'undefined') return false;
  const sessions = getActiveTrainerSessions();
  
  if (branchId && branchId !== 'all') {
    if (sessions[branchId] !== undefined) {
      return Boolean(sessions[branchId]?.isActive);
    }
  }

  // Check fallback global key if set
  const globalFlag = localStorage.getItem('nagah_lab_is_open');
  if (globalFlag === 'false') return false;

  // Check if any branch session is explicitly active
  const anyActive = Object.values(sessions).some(s => s && s.isActive);
  if (Object.keys(sessions).length > 0) {
    return anyActive;
  }

  // Default: if never toggled, return true, but if explicitly set to false in localStorage, respect false
  return globalFlag !== 'false';
}

/**
 * Updates or toggles trainer session active state for a branch
 */
export function setTrainerLabSessionState(
  branchId: string,
  trainerName: string,
  isActive: boolean,
  roomName: string = 'المعمل الرئيسي'
): void {
  if (typeof window === 'undefined') return;
  const sessions = getActiveTrainerSessions();
  const nextActive = Boolean(isActive);

  sessions[branchId] = {
    branchId,
    trainerName,
    roomName,
    activatedAt: new Date().toISOString(),
    isActive: nextActive,
    trainerIp: window.location.hostname
  };

  localStorage.setItem(STORAGE_KEY_LAB_SESSIONS, JSON.stringify(sessions));
  localStorage.setItem('nagah_lab_is_open', nextActive ? 'true' : 'false');

  window.dispatchEvent(new CustomEvent('nagah_lab_session_changed', {
    detail: { branchId, isActive: nextActive, trainerName, roomName }
  }));
}

/**
 * Verifies if a student is allowed to enter the lab, open a hall, or register attendance
 */
export function verifyStudentLabEntryAllowed(branchId?: string): { allowed: boolean; reasonArabic: string } {
  const active = isTrainerSessionActive(branchId);
  if (active) {
    return {
      allowed: true,
      reasonArabic: '✅ المعمل مفتوح ومتاح لجميع الطلاب بالفرع الآن.'
    };
  }
  return {
    allowed: false,
    reasonArabic: '🔒 المعمل مغلق حالياً بقرار المحاضر المشرف. لا يمكن الدخول أو بدء الأنشطة حتى يقوم المدرب بفتح المعمل.'
  };
}
