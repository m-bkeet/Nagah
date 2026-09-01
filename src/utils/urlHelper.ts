/**
 * Helper to generate public shareable URLs that bypass developer authentication requirements.
 */
export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  return origin;
}

export function getPublicRegistrationUrl(): string {
  return `${getPublicBaseUrl()}/?view=register`;
}

export function getPublicKioskUrl(secured: boolean = false): string {
  const base = getPublicBaseUrl();
  return secured
    ? `${base}/?view=kiosk&token=nagah_lab_secure`
    : `${base}/?view=kiosk`;
}

export function getPublicTrainerRegistrationUrl(): string {
  return `${getPublicBaseUrl()}/?trainer_register=true`;
}

export function getPublicTrainerPortalUrl(trainerId?: string): string {
  const base = getPublicBaseUrl();
  return trainerId 
    ? `${base}/?view=trainer_portal&trainerId=${trainerId}`
    : `${base}/?view=trainer_portal`;
}

export function getPublicStudentPortalUrl(studentCode?: string): string {
  const base = getPublicBaseUrl();
  return studentCode
    ? `${base}/?view=student_portal&code=${studentCode}`
    : `${base}/?view=student_portal`;
}

export function getPublicParentPortalUrl(studentCode?: string): string {
  const base = getPublicBaseUrl();
  return studentCode
    ? `${base}/?view=parent_portal&code=${studentCode}`
    : `${base}/?view=parent_portal`;
}

