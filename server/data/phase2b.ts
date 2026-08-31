import { db } from '../db';
import { generateNextStudentCode, isValidStudentCode } from '../../src/domain/studentCodeEngine';

export async function exportAllFirestoreData(): Promise<any> {
  const data = db.getData();
  return {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };
}

export const EXCLUDED_TEST_NAMES = [
  'مرام محمد رمضان بخيت',
  'رفيف محمد رمضان بخيت',
  'لين محمد رمضان بخيت'
];

export const EXCLUDED_TEST_IDS_PHONES = [
  'tr-auto-1788136664261',
  '01011120336'
];

export function isTestStudentRecord(s: any): boolean {
  if (!s) return false;
  const name = String(s.fullName || s.name || '').trim();
  const phone = String(s.phone || '').trim();
  const id = String(s.id || s.legacy_student_id || '').trim();

  if (EXCLUDED_TEST_NAMES.some(tn => name.includes(tn))) return true;
  if (EXCLUDED_TEST_IDS_PHONES.some(p => phone === p || id === p)) return true;
  return false;
}

export interface StudentClassificationSummary {
  totalSourceStudents: number;
  importNewCount: number;
  matchUpdateCount: number;
  duplicateSourceCount: number;
  duplicateDatabaseCount: number;
  excludedTestCount: number;
  invalidCount: number;
  conflictReviewCount: number;
  validStudentsToImport: number;
  classifiedStudents: Array<{
    record: any;
    category: 'IMPORT_NEW' | 'MATCH_UPDATE' | 'DUPLICATE_SOURCE' | 'DUPLICATE_DATABASE' | 'EXCLUDED_TEST' | 'INVALID' | 'CONFLICT_REVIEW';
    reason: string;
    targetDbId?: string;
  }>;
}

export function classifyStudents(sourceStudents: any[], existingDbTrainees: any[]): StudentClassificationSummary {
  const classifiedStudents: StudentClassificationSummary['classifiedStudents'] = [];
  const seenSourceCodes = new Set<string>();
  const seenSourcePhones = new Set<string>();
  const seenSourceIds = new Set<string>();

  let importNewCount = 0;
  let matchUpdateCount = 0;
  let duplicateSourceCount = 0;
  let duplicateDatabaseCount = 0;
  let excludedTestCount = 0;
  let invalidCount = 0;
  let conflictReviewCount = 0;

  for (const s of sourceStudents) {
    const rawName = String(s.fullName || s.name || s.student_name || '').trim();
    const rawCode = String(s.code || s.studentCode || s.student_code || s.traineeCode || '').trim();
    const rawPhone = String(s.phone || '').trim();
    const rawParentPhone = String(s.parentPhone || s.parent_phone || s.guardianPhone || '').trim();
    const rawNationalId = String(s.nationalId || s.national_id || '').trim();
    const rawId = String(s.id || s.legacy_student_id || '').trim();

    // 1. Excluded Test Check
    if (isTestStudentRecord(s)) {
      excludedTestCount++;
      classifiedStudents.push({
        record: s,
        category: 'EXCLUDED_TEST',
        reason: 'طالب تجريبي مستبعد معتمد (اختبار منصة NAGAH MS)'
      });
      continue;
    }

    // 2. Invalid Record Check
    if (!rawName && !rawPhone && !rawCode) {
      invalidCount++;
      classifiedStudents.push({
        record: s,
        category: 'INVALID',
        reason: 'سجل غير صالح: الاسم والهاتف والكود مفقودون'
      });
      continue;
    }

    // 3. Duplicate Source Check
    const codeKey = rawCode.toUpperCase();
    const phoneKey = rawPhone || rawParentPhone;
    const idKey = rawId;

    let isSourceDup = false;
    if (codeKey && seenSourceCodes.has(codeKey)) isSourceDup = true;
    if (idKey && seenSourceIds.has(idKey)) isSourceDup = true;

    if (isSourceDup) {
      duplicateSourceCount++;
      classifiedStudents.push({
        record: s,
        category: 'DUPLICATE_SOURCE',
        reason: 'سجل مكرر داخل ملف المصدر JSON نفسه'
      });
      continue;
    }

    if (codeKey) seenSourceCodes.add(codeKey);
    if (phoneKey) seenSourcePhones.add(phoneKey);
    if (idKey) seenSourceIds.add(idKey);

    // 4. Database Match Check
    const matchedDbRecord = existingDbTrainees.find(dbItem => {
      const dbCode = String(dbItem.code || dbItem.studentCode || '').trim().toUpperCase();
      const dbId = String(dbItem.id || dbItem.legacy_student_id || '').trim();
      const dbNationalId = String(dbItem.nationalId || '').trim();
      const dbName = String(dbItem.fullName || dbItem.name || '').trim();
      const dbPhone = String(dbItem.phone || '').trim();

      if (codeKey && dbCode && codeKey === dbCode) return true;
      if (idKey && dbId && idKey === dbId) return true;
      if (rawNationalId && dbNationalId && rawNationalId === dbNationalId) return true;
      if (rawName && dbName && rawName.toLowerCase() === dbName.toLowerCase() && (rawPhone === dbPhone || rawPhone === dbItem.parentPhone)) return true;
      return false;
    });

    if (matchedDbRecord) {
      const dbName = String(matchedDbRecord.fullName || matchedDbRecord.name || '').trim();
      const dbPhone = String(matchedDbRecord.phone || '').trim();

      // Check conflict: same code/id but completely different name and phone
      if (codeKey && rawName && dbName && rawName.toLowerCase() !== dbName.toLowerCase() && rawPhone && dbPhone && rawPhone !== dbPhone) {
        conflictReviewCount++;
        classifiedStudents.push({
          record: s,
          category: 'CONFLICT_REVIEW',
          reason: `تعارض في الهوية: الكود (${codeKey}) مسجل باسم مختلف في قاعدة البيانات (${dbName})`,
          targetDbId: matchedDbRecord.id
        });
      } else {
        // Match Update or Duplicate Database
        matchUpdateCount++;
        classifiedStudents.push({
          record: s,
          category: 'MATCH_UPDATE',
          reason: `مطابقة مع سجل موجود في قاعدة البيانات (${matchedDbRecord.code || matchedDbRecord.id}) - سيتم التحديث/الدمج`,
          targetDbId: matchedDbRecord.id
        });
      }
      continue;
    }

    // 5. Import New
    importNewCount++;
    classifiedStudents.push({
      record: s,
      category: 'IMPORT_NEW',
      reason: 'طالب جديد صالح للاستيراد وتوثيق الكود'
    });
  }

  const validStudentsToImport = importNewCount + matchUpdateCount;

  return {
    totalSourceStudents: sourceStudents.length,
    importNewCount,
    matchUpdateCount,
    duplicateSourceCount,
    duplicateDatabaseCount,
    excludedTestCount,
    invalidCount,
    conflictReviewCount,
    validStudentsToImport,
    classifiedStudents
  };
}

export async function previewDatabaseImport(rawData: any): Promise<{
  collections: Record<string, number>;
  totalRecords: number;
  isValid: boolean;
  warnings: string[];
  studentClassification?: StudentClassificationSummary;
}> {
  if (!rawData || typeof rawData !== 'object') {
    return {
      collections: {},
      totalRecords: 0,
      isValid: false,
      warnings: ['صيغة بيانات غير صالحة: المتوقع كائن JSON'],
    };
  }

  const collections: Record<string, number> = {};
  let totalRecords = 0;
  const warnings: string[] = [];

  const keys = ['branches', 'trainees', 'students', 'trainers', 'courses', 'groups', 'attendance', 'payments', 'expenses', 'exams', 'certificates', 'users'];
  
  for (const k of keys) {
    if (Array.isArray(rawData[k])) {
      const canonicalKey = k === 'students' ? 'trainees' : k;
      collections[canonicalKey] = (collections[canonicalKey] || 0) + rawData[k].length;
      totalRecords += rawData[k].length;
    }
  }

  // Student Classification Engine
  const sourceStudents = Array.isArray(rawData.trainees) ? rawData.trainees : (Array.isArray(rawData.students) ? rawData.students : []);
  const currentData = db.getData();
  const existingDbTrainees = (currentData.trainees || []);

  const studentClassification = classifyStudents(sourceStudents, existingDbTrainees);

  if (sourceStudents.length > 0 && studentClassification.validStudentsToImport === 0) {
    warnings.push('تحذير أمان: ملف JSON يحتوي على طلاب ولكن عدد الطلاب الصالحين للاستيراد يساوي 0 (تم استبعاد سجلات الاختبار أوالتكرارات المرفوضة).');
  }

  return {
    collections,
    totalRecords,
    isValid: totalRecords > 0 || Object.keys(collections).length > 0,
    warnings,
    studentClassification
  };
}

export async function executeDatabaseImport(
  data: any,
  mode: 'merge' | 'replace' = 'merge',
  options?: { confirmReplace?: boolean; confirmToken?: string }
): Promise<{ success: boolean; importedCount: number; message: string; classificationSummary?: StudentClassificationSummary }> {
  if (!data || typeof data !== 'object') {
    return { success: false, importedCount: 0, message: 'بيانات غير صالحة للاستيراد' };
  }

  const currentData = db.getData();
  const sourceStudents = Array.isArray(data.trainees) ? data.trainees : (Array.isArray(data.students) ? data.students : []);
  const existingDbTrainees = (currentData.trainees || []);

  // Classify source students first
  const classification = classifyStudents(sourceStudents, existingDbTrainees);

  // CRITICAL SAFETY CHECK: Refuse execution if source students > 0 but validStudentsToImport === 0
  if (sourceStudents.length > 0 && classification.validStudentsToImport === 0) {
    return {
      success: false,
      importedCount: 0,
      message: 'IMPORT_BLOCKED_NO_VALID_STUDENT_RECORDS: تم إيقاف الاستيراد لأن عدد الطلاب الصالحين للاستيراد يساوي 0 رغم وجود سجلات في ملف JSON. يرجى مراجعة تصنيف السجلات واستبعاد بيانات الاختبار.'
    };
  }

  let count = 0;

  // Process Trainees with strict Student Code preservation and UPSERT
  const existingCodes = existingDbTrainees.map((t: any) => t.code || t.studentCode || '').filter(Boolean);
  const updatedTraineesList = [...existingDbTrainees];

  for (const item of classification.classifiedStudents) {
    if (item.category === 'EXCLUDED_TEST' || item.category === 'INVALID' || item.category === 'DUPLICATE_SOURCE') {
      continue; // Skip excluded and invalid
    }

    const s = item.record;
    let studentCode = String(s.code || s.studentCode || s.student_code || s.traineeCode || '').trim();

    // Preserve existing student code strictly! If missing for new student, generate using StudentCodeEngine
    if (!studentCode) {
      if (item.category === 'IMPORT_NEW') {
        studentCode = generateNextStudentCode('A', existingCodes);
        existingCodes.push(studentCode);
      }
    } else {
      studentCode = studentCode.toUpperCase();
      if (!existingCodes.includes(studentCode)) {
        existingCodes.push(studentCode);
      }
    }

    const normalizedStudentRecord = {
      id: s.id || s.legacy_student_id || `trainee-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: studentCode, // STRICTLY PRESERVED / IMMUTABLE
      fullName: s.fullName || s.name || s.full_name || 'طالب غير مسمى',
      phone: s.phone || '',
      parentPhone: s.parentPhone || s.parent_phone || s.guardianPhone || '',
      nationalId: s.nationalId || s.national_id || '',
      branchId: s.branchId || s.branch_id || 'branch-1',
      courseId: s.courseId || s.course_id || '',
      groupId: s.groupId || s.group_id || '',
      trainerId: s.trainerId || s.trainer_id || '',
      gender: s.gender || 'male',
      registrationDate: s.registrationDate || s.enrollment_date || new Date().toISOString().split('T')[0],
      status: s.status || 'active',
      feeAmount: Number(s.feeAmount || s.total_fee || 0),
      discountAmount: Number(s.discountAmount || 0),
      netAmount: Number(s.netAmount || 0),
      paidAmount: Number(s.paidAmount || s.paid_amount || 0),
      remainingAmount: Number(s.remainingAmount || s.remaining_amount || 0),
      points: Number(s.points || s.totalPoints || s.total_points || 0),
      totalPoints: Number(s.totalPoints || s.points || s.total_points || 0),
      notes: s.notes || s.care_vault_notes || ''
    };

    if (item.category === 'MATCH_UPDATE' && item.targetDbId) {
      const idx = updatedTraineesList.findIndex(t => t.id === item.targetDbId);
      if (idx !== -1) {
        // Merge updates into existing record without changing its canonical ID or code
        updatedTraineesList[idx] = {
          ...updatedTraineesList[idx],
          ...normalizedStudentRecord,
          id: updatedTraineesList[idx].id,
          code: updatedTraineesList[idx].code || normalizedStudentRecord.code
        };
      } else {
        updatedTraineesList.push(normalizedStudentRecord);
      }
    } else if (item.category === 'IMPORT_NEW') {
      const existsIdx = updatedTraineesList.findIndex(t => t.id === normalizedStudentRecord.id);
      if (existsIdx !== -1) {
        updatedTraineesList[existsIdx] = { ...updatedTraineesList[existsIdx], ...normalizedStudentRecord };
      } else {
        updatedTraineesList.push(normalizedStudentRecord);
      }
    }
    count++;
  }

  // Safe UPSERT into database (Never wipe trainees table destructively!)
  currentData.trainees = updatedTraineesList;

  // Process other collections safely
  const otherKeys = [
    'branches', 'trainers', 'courses', 'groups', 'programs',
    'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
    'pointTransactions', 'exams', 'questions', 'examResults', 'certificates',
    'certificateTemplates', 'users', 'auditLogs', 'assignments'
  ];

  for (const key of otherKeys) {
    if (Array.isArray(data[key])) {
      if (mode === 'replace' && key !== 'trainees') {
        (currentData as any)[key] = [...data[key]];
      } else {
        const existing = (currentData as any)[key] || [];
        const existingIds = new Set(existing.map((item: any) => item.id));
        for (const item of data[key]) {
          if (!existingIds.has(item.id)) {
            existing.push(item);
            existingIds.add(item.id);
          }
        }
        (currentData as any)[key] = existing;
      }
      count += data[key].length;
    }
  }

  if (data.settings && typeof data.settings === 'object') {
    currentData.settings = { ...(currentData.settings || {}), ...data.settings };
  }

  db.save();

  return {
    success: true,
    importedCount: classification.validStudentsToImport,
    message: `تم دمج واستيراد (${classification.validStudentsToImport}) طالب بنجاح مع المحافظة التامة على أكواد الطلاب وتصنيف سجلات الاختبار (${classification.excludedTestCount}).`,
    classificationSummary: classification
  };
}
