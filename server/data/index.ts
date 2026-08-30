import { db } from '../db';
import {
  Trainee,
  Branch,
  Course,
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
  CenterSettings
} from '../../src/types';

function createRepo<T extends { id: string }>(key: keyof ReturnType<typeof db.getData>) {
  return {
    async getAll(): Promise<T[]> {
      const data = db.getData();
      const list = (data[key] as any) || [];
      return Array.isArray(list) ? list : [];
    },
    async getById(id: string): Promise<T | null> {
      const all = await this.getAll();
      return all.find(item => item.id === id || (item as any).legacyId === id || (item as any).code === id) || null;
    },
    async create(id: string, itemData: any): Promise<T> {
      const data = db.getData();
      if (!data[key]) (data as any)[key] = [];
      const list = data[key] as any[];
      const newItem = { id, ...itemData };
      list.push(newItem);
      db.save();
      return newItem;
    },
    async update(id: string, updates: any): Promise<T | null> {
      const data = db.getData();
      const list = (data[key] as any[]) || [];
      const idx = list.findIndex(item => item.id === id || item.legacyId === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates };
      db.save();
      return list[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = db.getData();
      const list = (data[key] as any[]) || [];
      const idx = list.findIndex(item => item.id === id);
      if (idx === -1) return false;
      list.splice(idx, 1);
      db.save();
      return true;
    },
    invalidateCache() {
      // In-memory db is authoritative
    }
  };
}

export const TraineeRepo = createRepo<Trainee>('trainees');
export const BranchRepo = createRepo<Branch>('branches');
export const CourseRepo = createRepo<Course>('courses');
export const GroupRepo = createRepo<Group>('groups');
export const TrainerRepo = createRepo<Trainer>('trainers');
export const AttendanceRepo = createRepo<AttendanceRecord>('attendance');
export const PaymentRepo = createRepo<Payment>('payments');
export const ExpenseRepo = createRepo<Expense>('expenses');
export const ExamRepo = createRepo<Exam>('exams');
export const ExamQuestionRepo = createRepo<ExamQuestion>('questions');
export const ExamResultRepo = createRepo<ExamResult>('examResults');
export const PointRuleRepo = createRepo<PointRule>('pointRules');
export const PointTransactionRepo = createRepo<PointTransaction>('pointTransactions');
export const CertificateRepo = createRepo<Certificate>('certificates');
export const CertificateTemplateRepo = createRepo<CertificateTemplate>('certificateTemplates');
export const UserRepo = createRepo<User>('users');

export const SettingRepo = {
  async get(): Promise<CenterSettings> {
    return db.getData().settings || {} as CenterSettings;
  },
  async update(updates: Partial<CenterSettings>): Promise<CenterSettings> {
    const data = db.getData();
    data.settings = { ...(data.settings || {}), ...updates };
    db.save();
    return data.settings;
  }
};

export const AuditLogRepo = {
  ...createRepo<AuditLog>('auditLogs'),
  async log(action: string, details: string, user?: string): Promise<AuditLog> {
    return db.logAudit({ action, details, user: user || 'SYSTEM' });
  }
};
