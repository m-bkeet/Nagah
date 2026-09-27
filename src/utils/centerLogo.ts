/**
 * Unified Center Logo Utility
 * Ensures the center's authentic logo (configured in settings / main screen)
 * is consistently and flawlessly used everywhere:
 * - Header & Main Navigation
 * - Certificates (both visual & royal modal)
 * - Trainee Digital Cards (كارنيه المتدرب)
 * - Student Cards Broadcast Sheets
 * - Attendance Sheets & Printable Reports
 * - Student & Trainer Portals
 */

export function getEffectiveCenterLogo(settingsLogo?: string | null): string {
  // 1. Settings logo from active database/context
  if (settingsLogo && typeof settingsLogo === 'string' && settingsLogo.trim().length > 0 && settingsLogo !== '/logo.svg') {
    return settingsLogo.trim();
  }

  // 2. LocalStorage cached custom logo
  if (typeof window !== 'undefined') {
    try {
      const customLogo = window.localStorage.getItem('nagah_custom_logo');
      if (customLogo && customLogo.trim().length > 0 && customLogo !== '/logo.svg') {
        return customLogo.trim();
      }
      const centerLogo = window.localStorage.getItem('nagah_center_logo');
      if (centerLogo && centerLogo.trim().length > 0 && centerLogo !== '/logo.svg') {
        return centerLogo.trim();
      }
    } catch {}
  }

  // 3. Bundled real logo asset
  return '/logo.png';
}

/**
 * Fallback handler for img elements: points to the verified logo.png asset
 */
export function handleLogoError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src && !target.src.endsWith('/logo.png')) {
    target.src = '/logo.png';
  }
}

/**
 * Robustly resolves a trainee's photo URL from direct properties or localStorage caches
 */
export function getResolvedTraineePhoto(trainee: any): string {
  if (!trainee) return '';
  if (trainee.photoUrl && typeof trainee.photoUrl === 'string' && trainee.photoUrl.trim().length > 0) {
    return trainee.photoUrl.trim();
  }
  if (trainee.photo && typeof trainee.photo === 'string' && trainee.photo.trim().length > 0) {
    return trainee.photo.trim();
  }
  if (typeof window !== 'undefined') {
    try {
      if (trainee.id) {
        const cached = window.localStorage.getItem('student_session_photo_' + trainee.id);
        if (cached && cached.trim().length > 0) return cached.trim();
      }
      if (trainee.code) {
        const cachedCode = window.localStorage.getItem('student_session_photo_' + trainee.code);
        if (cachedCode && cachedCode.trim().length > 0) return cachedCode.trim();
      }
      if (trainee.nationalId) {
        const cachedNat = window.localStorage.getItem('student_session_photo_' + trainee.nationalId);
        if (cachedNat && cachedNat.trim().length > 0) return cachedNat.trim();
      }
    } catch {}
  }
  return '';
}

