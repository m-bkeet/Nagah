/**
 * NAGAH MS - Interoperable Data Exchange Package Engine
 * Facilitates safe data exchange, export, import, and reconciliation between NAGAH systems.
 * Enforces Absolute Student Data Preservation.
 */

export interface DataExchangeManifest {
  packageId: string;
  schemaVersion: string; // e.g., '1.0.0'
  sourceSystem: 'NAGAH_MS' | 'NAGAH';
  sourceVersion: string;
  exportedAt: string;
  exportedBy?: string;
  checksum: string;
  recordCounts: Record<string, number>;
}

export interface NagahDataExchangePackage {
  manifest: DataExchangeManifest;
  branches: any[];
  tracks: any[];
  fields: any[];
  levels: any[];
  programs: any[];
  courses: any[];
  groups: any[];
  cohorts: any[];
  students: any[];
  studentEnrollments: any[];
  trainers: any[];
  trainerAssignments: any[];
  attendance: any[];
  payments: any[];
  receipts: any[];
  assignments: any[];
  exams: any[];
  certificates: any[];
  transactions: any[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preservedStudentCodesCount: number;
  newRecordsCount: number;
}

/**
 * Validates a Nagah Data Exchange Package before import.
 * Enforces student code uniqueness and continuity.
 */
export function validateExchangePackage(pkg: NagahDataExchangePackage, existingStudentCodes: string[] = []): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pkg.manifest || !pkg.manifest.schemaVersion) {
    errors.push('بيان حزمة البيانات (Manifest) مفقود أو غير صالح.');
  }

  if (!Array.isArray(pkg.students)) {
    errors.push('قائمة المتدربين مفقودة أو تالفة في حزمة البيانات.');
  }

  let preservedCount = 0;
  let newCount = 0;

  if (Array.isArray(pkg.students)) {
    const codeSet = new Set<string>();
    pkg.students.forEach((s, idx) => {
      if (!s.fullName) {
        errors.push(`المتدرب في السطر ${idx + 1} لا يحتوي على اسم كامل.`);
      }
      if (!s.code) {
        warnings.push(`المتدرب "${s.fullName}" لا يحتوي على كود؛ سيتم توليد كود تلقائياً.`);
      } else {
        if (codeSet.has(s.code)) {
          errors.push(`كود المتدرب المكرر في الحزمة: ${s.code}`);
        }
        codeSet.add(s.code);

        if (existingStudentCodes.includes(s.code)) {
          preservedCount++;
        } else {
          newCount++;
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    preservedStudentCodesCount: preservedCount,
    newRecordsCount: newCount,
  };
}
