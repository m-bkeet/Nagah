import { db } from '../db';

export async function exportAllFirestoreData(): Promise<any> {
  const data = db.getData();
  return {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };
}

export async function previewDatabaseImport(rawData: any): Promise<{
  collections: Record<string, number>;
  totalRecords: number;
  isValid: boolean;
  warnings: string[];
}> {
  if (!rawData || typeof rawData !== 'object') {
    return {
      collections: {},
      totalRecords: 0,
      isValid: false,
      warnings: ['Invalid data format: expected JSON object.'],
    };
  }

  const collections: Record<string, number> = {};
  let totalRecords = 0;
  const warnings: string[] = [];

  const keys = ['branches', 'trainees', 'trainers', 'courses', 'groups', 'attendance', 'payments', 'expenses', 'exams', 'certificates', 'users'];
  
  for (const k of keys) {
    if (Array.isArray(rawData[k])) {
      collections[k] = rawData[k].length;
      totalRecords += rawData[k].length;
    }
  }

  return {
    collections,
    totalRecords,
    isValid: totalRecords > 0 || Object.keys(collections).length > 0,
    warnings,
  };
}

export async function executeDatabaseImport(
  data: any,
  mode: 'merge' | 'replace' = 'merge',
  options?: { confirmReplace?: boolean; confirmToken?: string }
): Promise<{ success: boolean; importedCount: number; message: string }> {
  if (!data || typeof data !== 'object') {
    return { success: false, importedCount: 0, message: 'Invalid data payload' };
  }

  const currentData = db.getData();
  let count = 0;

  const arrayKeys = [
    'branches', 'trainees', 'trainers', 'courses', 'groups', 'programs',
    'attendance', 'payments', 'expenses', 'trainerSettlements', 'pointRules',
    'pointTransactions', 'exams', 'questions', 'examResults', 'certificates',
    'certificateTemplates', 'users', 'auditLogs', 'assignments'
  ];

  for (const key of arrayKeys) {
    if (Array.isArray(data[key])) {
      if (mode === 'replace') {
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
    importedCount: count,
    message: `تم استيراد ${count} سجل بنجاح (${mode === 'replace' ? 'استبدال كامل' : 'دمج البيانات'})`,
  };
}
