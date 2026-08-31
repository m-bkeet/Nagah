import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import {
  Trainee,
  Branch,
  Course,
  Program,
  Group,
  Trainer,
  AttendanceRecord,
  Payment,
  Expense,
  Exam,
  ExamQuestion,
  ExamResult,
  PointRule,
  PointTransaction,
  Certificate,
  CertificateTemplate,
  User,
  AuditLog,
  CenterSettings,
  Device,
  DeviceCommand,
  ComputerLab,
  InteractiveSession,
  TraineeScreenshot
} from '../../src/types';

const rawSupabaseUrl = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
const hasValidSupabase = Boolean(
  SUPABASE_URL &&
  !SUPABASE_URL.includes('placeholder') &&
  SUPABASE_KEY &&
  !SUPABASE_KEY.includes('placeholder')
);

export let supabaseClient: any = null;
if (hasValidSupabase) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (e: any) {
    console.error('[DataLayer] Failed to create Supabase client:', e.message);
    supabaseClient = null;
  }
}

export async function hydrateAllFromSupabase(): Promise<number> {
  if (!supabaseClient) {
    console.warn('[Hydration] No active Supabase client configured.');
    return 0;
  }

  try {
    const { data, error } = await supabaseClient
      .from('collections')
      .select('collection_name, id, data, updated_at')
      .range(0, 4999);

    if (error) {
      console.error('[Hydration] Error reading collections from Supabase:', error.message);
      return 0;
    }

    if (Array.isArray(data)) {
      const memData = db.getData() as any;
      const grouped: Record<string, any[]> = {};
      data.forEach((row: any) => {
        const cName = row.collection_name;
        if (!grouped[cName]) grouped[cName] = [];
        grouped[cName].push({ id: row.id, ...(row.data || {}) });
      });

      for (const [colName, items] of Object.entries(grouped)) {
        memData[colName] = items;
      }

      console.log(`[Hydration] Successfully loaded ${data.length} documents from Supabase public.collections across ${Object.keys(grouped).length} collections.`);
      return data.length;
    }
  } catch (err: any) {
    console.error('[Hydration] Exception hydrating from Supabase:', err.message);
  }
  return 0;
}

// Initial hydration attempt on module load
if (supabaseClient) {
  hydrateAllFromSupabase().catch((err) => {
    console.error('[Hydration] Auto-hydration on load failed:', err);
  });
}

function createRepo<T extends { id: string }>(key: string) {
  return {
    async getAll(): Promise<T[]> {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('collections')
            .select('id, data')
            .eq('collection_name', key)
            .range(0, 4999);

          if (!error && Array.isArray(data)) {
            const items = data.map((row: any) => ({
              id: row.id,
              ...(row.data || {})
            })) as T[];

            // Keep in-memory store in sync
            const memData = db.getData() as any;
            if (memData) {
              memData[key] = items;
            }

            return items;
          } else if (error) {
            console.error(`[SupabaseRepo] Error fetching collection "${key}":`, error.message);
          }
        } catch (err: any) {
          console.error(`[SupabaseRepo] Exception querying Supabase collection "${key}":`, err.message);
        }
      }

      const memData = db.getData() as any;
      const list = memData ? memData[key] : [];
      return Array.isArray(list) ? list : [];
    },

    async getById(id: string): Promise<T | null> {
      if (!id) return null;
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('collections')
            .select('id, data')
            .eq('collection_name', key)
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            return { id: data.id, ...(data.data || {}) } as T;
          }
        } catch (e: any) {
          console.warn(`[SupabaseRepo] getById error for ${key}/${id}:`, e.message);
        }
      }

      const all = await this.getAll();
      const idStr = String(id).trim().toLowerCase();
      return all.find(item => {
        const itemObj = item as any;
        return (
          (item.id && String(item.id).trim().toLowerCase() === idStr) ||
          (itemObj.legacyId && String(itemObj.legacyId).trim().toLowerCase() === idStr) ||
          (itemObj.code && String(itemObj.code).trim().toLowerCase() === idStr) ||
          (itemObj.studentCode && String(itemObj.studentCode).trim().toLowerCase() === idStr) ||
          (itemObj.traineeCode && String(itemObj.traineeCode).trim().toLowerCase() === idStr)
        );
      }) || null;
    },

    async getByTraineeId(traineeId: string): Promise<T[]> {
      const all = await this.getAll();
      if (!traineeId) return [];
      const idStr = String(traineeId).trim().toLowerCase();
      return all.filter(item => {
        const itemObj = item as any;
        const candidates = [
          itemObj.traineeId,
          itemObj.studentId,
          itemObj.trainee_id,
          itemObj.student_id,
          itemObj.traineeCode,
          itemObj.studentCode,
          itemObj.trainee_code,
          itemObj.student_code
        ];
        return candidates.some(c => c && String(c).trim().toLowerCase() === idStr);
      });
    },

    async getByStudentId(studentId: string): Promise<T[]> {
      return this.getByTraineeId(studentId);
    },

    async getByExamId(examId: string): Promise<T[]> {
      const all = await this.getAll();
      if (!examId) return [];
      const idStr = String(examId).trim().toLowerCase();
      return all.filter(item => {
        const itemObj = item as any;
        return itemObj.examId && String(itemObj.examId).trim().toLowerCase() === idStr;
      });
    },

    async query(filters: Array<{ field: string; operator: string; value: any }>): Promise<T[]> {
      const all = await this.getAll();
      if (!Array.isArray(filters) || filters.length === 0) return all;
      return all.filter(item => {
        const itemObj = item as any;
        return filters.every(f => {
          const val = itemObj[f.field];
          if (f.operator === '==' || f.operator === '===') return val === f.value;
          if (f.operator === '!=') return val !== f.value;
          return true;
        });
      });
    },

    async create(id: string, itemData: any): Promise<T> {
      const docId = id || itemData.id || ('doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
      const fullItem = { ...itemData, id: docId };

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .upsert({
              collection_name: key,
              id: docId,
              data: fullItem,
              updated_at: new Date().toISOString()
            }, { onConflict: 'collection_name,id' });

          if (error) {
            console.error(`[SupabaseRepo] Create error for ${key}/${docId}:`, error.message);
          }
        } catch (e: any) {
          console.error(`[SupabaseRepo] Create exception for ${key}/${docId}:`, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = fullItem;
        else list.push(fullItem);
      }

      return fullItem as T;
    },

    async update(id: string, updates: any): Promise<T | null> {
      const existing = await this.getById(id);
      const docId = existing ? existing.id : id;
      const updatedItem = { ...(existing || {}), ...updates, id: docId, updatedAt: new Date().toISOString() };

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .upsert({
              collection_name: key,
              id: docId,
              data: updatedItem,
              updated_at: new Date().toISOString()
            }, { onConflict: 'collection_name,id' });

          if (error) {
            console.error(`[SupabaseRepo] Update error for ${key}/${docId}:`, error.message);
          }
        } catch (e: any) {
          console.error(`[SupabaseRepo] Update exception for ${key}/${docId}:`, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = updatedItem;
      }

      return updatedItem as T;
    },

    async delete(id: string): Promise<boolean> {
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('collections')
            .delete()
            .eq('collection_name', key)
            .eq('id', id);

          if (error) {
            console.error(`[SupabaseRepo] Delete error for ${key}/${id}:`, error.message);
          }
        } catch (e: any) {
          console.error(`[SupabaseRepo] Delete exception for ${key}/${id}:`, e.message);
        }
      }

      const memData = db.getData() as any;
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === id);
        if (idx >= 0) list.splice(idx, 1);
      }

      return true;
    },

    invalidateCache() {
      // Direct queries to Supabase collections are always live
    }
  };
}

export const TraineeRepo = createRepo<Trainee>('trainees');
export const BranchRepo = createRepo<Branch>('branches');
export const CourseRepo = createRepo<Course>('courses');
export const ProgramRepo = createRepo<Program>('programs');
export const GroupRepo = createRepo<Group>('groups');
export const TrainerRepo = createRepo<Trainer>('trainers');
export const AttendanceRepo = createRepo<AttendanceRecord>('attendance');
export const PaymentRepo = {
  ...createRepo<Payment>('payments'),
  async getPendingProofs(): Promise<Payment[]> {
    const all = await createRepo<Payment>('payments').getAll();
    return all.filter(p => p.status === 'pending' || p.status === 'pending_approval' || Boolean((p as any).proofUrl));
  }
};
export const ExpenseRepo = createRepo<Expense>('expenses');
export const ExamRepo = createRepo<Exam>('exams');
export const ExamQuestionRepo = createRepo<ExamQuestion>('questions');
export const ExamResultRepo = createRepo<ExamResult>('examResults');
export const PointRuleRepo = createRepo<PointRule>('pointRules');
export const PointTransactionRepo = createRepo<PointTransaction>('pointTransactions');
export const CertificateRepo = createRepo<Certificate>('certificates');
export const CertificateTemplateRepo = createRepo<CertificateTemplate>('certificateTemplates');
export const UserRepo = createRepo<User>('users');
export const DeviceRepo = createRepo<Device>('devices');
export const DeviceCommandRepo = createRepo<DeviceCommand>('deviceCommands');
export const ComputerLabRepo = createRepo<ComputerLab>('computerLabs');
export const InteractiveSessionRepo = createRepo<InteractiveSession>('interactiveSessions');
export const TraineeScreenshotRepo = createRepo<TraineeScreenshot>('traineeScreenshots');

export const SettingRepo = {
  async get(): Promise<CenterSettings> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('collections')
          .select('id, data')
          .eq('collection_name', 'settings')
          .eq('id', 'main')
          .maybeSingle();
        if (!error && data && data.data) {
          return data.data as CenterSettings;
        }
      } catch {}
    }
    return db.getData().settings || {} as CenterSettings;
  },
  async update(updates: Partial<CenterSettings>): Promise<CenterSettings> {
    const current = await this.get();
    const finalSettings = { ...current, ...updates };

    if (supabaseClient) {
      try {
        await supabaseClient
          .from('collections')
          .upsert({
            collection_name: 'settings',
            id: 'main',
            data: finalSettings,
            updated_at: new Date().toISOString()
          }, { onConflict: 'collection_name,id' });
      } catch (e: any) {
        console.error('[SettingRepo] Supabase update error:', e.message);
      }
    }

    const data = db.getData();
    data.settings = finalSettings;
    db.save();
    return finalSettings;
  }
};

export const AuditLogRepo = {
  ...createRepo<AuditLog>('auditLogs'),
  async log(action: string, details: string, user?: string): Promise<AuditLog> {
    const logItem: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: user || 'SYSTEM',
      userName: user || 'مدير النظام',
      action,
      entity: 'النظام',
      details,
      timestamp: new Date().toISOString()
    };
    await this.create(logItem.id, logItem);
    return logItem;
  }
};

