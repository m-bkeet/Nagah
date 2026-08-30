/**
 * NAGAH MS - Student Identity & Cohort Engine
 * Enforces Capital Letter + 3 Digits format (e.g. A001)
 * Preserves student identity code immutably across promotions and multi-enrollments.
 */

export interface CohortRecord {
  cohortId: string;
  cohortLetter: string; // e.g., 'A', 'B', 'C'
  academicYear: string; // e.g., '2026'
  description?: string;
  status: 'active' | 'archived';
}

export const INITIAL_COHORTS: CohortRecord[] = [
  { cohortId: 'cohort-2026-A', cohortLetter: 'A', academicYear: '2026', description: 'دفعة عام 2026 الفوج الأول', status: 'active' },
  { cohortId: 'cohort-2027-B', cohortLetter: 'B', academicYear: '2027', description: 'دفعة عام 2027 الفوج الثاني', status: 'active' },
];

/**
 * Validates whether a student code matches the NAGAH MS standard (e.g., A001, B124).
 */
export function isValidStudentCode(code: string): boolean {
  if (!code) return false;
  // Standard format: single capital letter followed by 1 to 4 digits (e.g., A001, A12, A5) or Arabic prefix preserved (م001)
  const regex = /^[A-Z\u0600-\u06FF]\d{1,4}$/i;
  return regex.test(code.trim());
}

/**
 * Normalizes student code to ensure capital letter + 3 digit padding.
 * Example: 'a1' -> 'A001', 'A24' -> 'A024', 'م5' -> 'م005'
 */
export function formatStudentCode(letter: string, sequenceNumber: number): string {
  const cleanLetter = letter.trim().charAt(0).toUpperCase() || 'A';
  const paddedSeq = sequenceNumber.toString().padStart(3, '0');
  return `${cleanLetter}${paddedSeq}`;
}

/**
 * Extracts sequence number from a student code if applicable.
 * Example: 'A042' -> 42
 */
export function parseStudentCodeSequence(code: string): number | null {
  if (!code) return null;
  const match = code.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Generates the next sequential Student Code for a given cohort letter.
 * Accepts existing list of student codes to avoid collisions.
 */
export function generateNextStudentCode(cohortLetter: string = 'A', existingCodes: string[] = []): string {
  const prefix = cohortLetter.trim().charAt(0).toUpperCase();
  let maxSeq = 0;

  existingCodes.forEach(code => {
    if (!code) return;
    const trimmed = code.trim().toUpperCase();
    if (trimmed.startsWith(prefix)) {
      const numPart = trimmed.substring(prefix.length);
      const seq = parseInt(numPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  return formatStudentCode(prefix, maxSeq + 1);
}
