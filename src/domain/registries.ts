/**
 * NAGAH MS - Authoritative Domain Registries
 * Hierarchical Context: BRANCH -> TRACK -> FIELD -> LEVEL -> COURSE -> GROUP -> STUDENT/TRAINER -> SERVICE/TRANSACTION
 */

export interface BranchRegistryItem {
  branchId: string;
  name: string;
  code: string; // e.g. "N" for Nagah, "B" for Badr
  city?: string;
  status: 'active' | 'inactive';
}

export interface TrackRegistryItem {
  trackId: string;
  name: string;
  code: string; // e.g. "A" for Arabic, "E" for Languages
  description?: string;
  status: 'active' | 'inactive';
}

export interface FieldRegistryItem {
  fieldId: string;
  name: string;
  shortCode: string; // e.g. "C" (Computer), "P" (Programming), "L" (Languages), "H" (Human Dev), "V" (Prof Dev), "I" (ICT)
  trackCompatibility: string[]; // Track IDs or Codes compatible with this field
  status: 'active' | 'inactive';
}

export interface LevelRegistryItem {
  levelId: string;
  fieldId?: string; // If field-specific, or null for general
  name: string;
  shortCode: string; // Curriculum: M (Primary), P (Prep), S (Sec), U (Univ) | Skills: B (Beginner), I (Inter), A (Adv), P (Prof)
  ordering: number;
  status: 'active' | 'inactive';
}

export interface ServiceCodeRegistryItem {
  serviceType: string;
  serviceCode: string; // R (Receipt), P (Payment), X (Exam), C (Certificate), A (Assignment), T (Attendance)
  nameAr: string;
  description: string;
}

// Initial Central Registries
export const INITIAL_BRANCHES: BranchRegistryItem[] = [
  { branchId: 'nagah-main', name: 'فرع النجاح الرئيسي', code: 'N', city: 'القاهرة', status: 'active' },
  { branchId: 'badr-branch', name: 'فرع بدر التكنولوجي', code: 'B', city: 'مدينة بدر', status: 'active' },
];

export const INITIAL_TRACKS: TrackRegistryItem[] = [
  { trackId: 'arabic', name: 'المسار العربي العام', code: 'A', description: 'المناهج باللغة العربية', status: 'active' },
  { trackId: 'languages', name: 'مسار اللغات والتخصصات', code: 'E', description: 'المناهج والبرامج باللغة الإنجليزية', status: 'active' },
];

export const INITIAL_FIELDS: FieldRegistryItem[] = [
  { fieldId: 'computer', name: 'أساسيات الحاسب والـ ICT', shortCode: 'C', trackCompatibility: ['arabic', 'languages'], status: 'active' },
  { fieldId: 'programming', name: 'البرمجة والذكاء الاصطناعي', shortCode: 'P', trackCompatibility: ['arabic', 'languages'], status: 'active' },
  { fieldId: 'languages', name: 'اللغات والترجمة', shortCode: 'L', trackCompatibility: ['languages'], status: 'active' },
  { fieldId: 'human_dev', name: 'التنمية البشرية والتفكير الإبداعي', shortCode: 'H', trackCompatibility: ['arabic', 'languages'], status: 'active' },
  { fieldId: 'prof_dev', name: 'التطوير المهني وسوق العمل', shortCode: 'V', trackCompatibility: ['arabic', 'languages'], status: 'active' },
  { fieldId: 'ict_curriculum', name: 'تكنولوجيا المعلومات والاتصالات المدرسي', shortCode: 'I', trackCompatibility: ['arabic', 'languages'], status: 'active' },
];

export const INITIAL_LEVELS: LevelRegistryItem[] = [
  // School Curriculum Levels
  { levelId: 'primary', name: 'المرحلة الابتدائية', shortCode: 'M', ordering: 1, status: 'active' },
  { levelId: 'preparatory', name: 'المرحلة الإعدادية', shortCode: 'P', ordering: 2, status: 'active' },
  { levelId: 'secondary', name: 'المرحلة الثانوية', shortCode: 'S', ordering: 3, status: 'active' },
  { levelId: 'university', name: 'المرحلة الجامعية وما بعدها', shortCode: 'U', ordering: 4, status: 'active' },
  // Skill-based Levels
  { levelId: 'beginner', name: 'المستوى المبتدئ (Beginner)', shortCode: 'B', ordering: 10, status: 'active' },
  { levelId: 'intermediate', name: 'المستوى المتوسط (Intermediate)', shortCode: 'I', ordering: 11, status: 'active' },
  { levelId: 'advanced', name: 'المستوى المتقدم (Advanced)', shortCode: 'A', ordering: 12, status: 'active' },
  { levelId: 'professional', name: 'المستوى الاحترافي (Professional)', shortCode: 'P', ordering: 13, status: 'active' },
];

export const SERVICE_CODE_REGISTRY: Record<string, ServiceCodeRegistryItem> = {
  RECEIPT: { serviceType: 'RECEIPT', serviceCode: 'R', nameAr: 'سند إيصال استلام', description: 'إيصال مالي لسداد رسوم أو قسط' },
  PAYMENT: { serviceType: 'PAYMENT', serviceCode: 'P', nameAr: 'دفعة مالية', description: 'معاملة مالية مقيدة في الحسابات' },
  EXAM: { serviceType: 'EXAM', serviceCode: 'X', nameAr: 'اختبار / تقييم', description: 'اختبار أو تقييم رسمي للمتدرب' },
  CERTIFICATE: { serviceType: 'CERTIFICATE', serviceCode: 'C', nameAr: 'شهادة إتمام', description: 'شهادة معتمدة موثقة برمز' },
  ASSIGNMENT: { serviceType: 'ASSIGNMENT', serviceCode: 'A', nameAr: 'تطبيق عملي / واجب', description: 'مهمة عمل وتسليم تطبيقي' },
  ATTENDANCE: { serviceType: 'ATTENDANCE', serviceCode: 'T', nameAr: 'جلسة حضور', description: 'حضور وتفاعل في القاعة' },
};

/**
 * Registry Helper Functions
 */
export function getBranchCode(branchIdOrName?: string): string {
  if (!branchIdOrName) return 'N';
  const found = INITIAL_BRANCHES.find(b => b.branchId === branchIdOrName || b.name === branchIdOrName || b.code === branchIdOrName);
  return found ? found.code : (branchIdOrName.trim().charAt(0).toUpperCase() || 'N');
}

export function getTrackCode(trackIdOrName?: string): string {
  if (!trackIdOrName) return 'A';
  const found = INITIAL_TRACKS.find(t => t.trackId === trackIdOrName || t.name === trackIdOrName || t.code === trackIdOrName);
  return found ? found.code : (trackIdOrName.trim().charAt(0).toUpperCase() || 'A');
}

export function getFieldCode(fieldIdOrName?: string): string {
  if (!fieldIdOrName) return 'C';
  const found = INITIAL_FIELDS.find(f => f.fieldId === fieldIdOrName || f.name === fieldIdOrName || f.shortCode === fieldIdOrName);
  return found ? found.shortCode : (fieldIdOrName.trim().charAt(0).toUpperCase() || 'C');
}

export function getLevelCode(levelIdOrName?: string): string {
  if (!levelIdOrName) return 'B';
  const found = INITIAL_LEVELS.find(l => l.levelId === levelIdOrName || l.name === levelIdOrName || l.shortCode === levelIdOrName);
  return found ? found.shortCode : (levelIdOrName.trim().charAt(0).toUpperCase() || 'B');
}

export function getServiceCode(serviceType: string): string {
  const normalized = serviceType.toUpperCase();
  return SERVICE_CODE_REGISTRY[normalized]?.serviceCode || normalized.charAt(0) || 'S';
}
