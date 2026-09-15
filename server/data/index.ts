import { db } from '../db';
import { saveCollectionToFirestore } from '../firestoreStorage';
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

function createRepo<T extends { id: string }>(key: string) {
  return {
    async getAll(): Promise<T[]> {
      await db.ensureHydrated();
      const memData = db.getData() as any;
      if (!memData || !Array.isArray(memData[key])) {
        return [];
      }
      return memData[key] as T[];
    },

    async getById(id: string): Promise<T | null> {
      if (!id) return null;
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
      await db.ensureHydrated();
      const docId = id || itemData.id || ('doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
      const fullItem = { ...itemData, id: docId };

      const memData = db.getData() as any;
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = fullItem;
        else list.push(fullItem);
        // Direct write to target collection in Firestore and trigger immediate sync
        await saveCollectionToFirestore(key, memData[key]);
        await db.saveImmediate();
      }

      return fullItem as T;
    },

    async update(id: string, updates: any): Promise<T | null> {
      await db.ensureHydrated();
      const existing = await this.getById(id);
      const docId = existing ? existing.id : id;
      const updatedItem = { ...(existing || {}), ...updates, id: docId, updatedAt: new Date().toISOString() };

      const memData = db.getData() as any;
      if (memData) {
        if (!Array.isArray(memData[key])) memData[key] = [];
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === docId);
        if (idx >= 0) list[idx] = updatedItem;
        else list.push(updatedItem);
        // Direct write to target collection in Firestore and trigger immediate sync
        await saveCollectionToFirestore(key, memData[key]);
        await db.saveImmediate();
      }

      return updatedItem as T;
    },

    async delete(id: string): Promise<boolean> {
      await db.ensureHydrated();
      const memData = db.getData() as any;
      if (memData && Array.isArray(memData[key])) {
        const list = memData[key] as any[];
        const idx = list.findIndex(i => i.id === id);
        if (idx >= 0) list.splice(idx, 1);
        // Direct write to target collection in Firestore and trigger immediate sync
        await saveCollectionToFirestore(key, memData[key]);
        await db.saveImmediate();
      }

      return true;
    },

    invalidateCache() {
      // Local cache is always in-sync
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
    return db.getData().settings || {} as CenterSettings;
  },
  async update(updates: Partial<CenterSettings>): Promise<CenterSettings> {
    const current = await this.get();
    const finalSettings = { ...current, ...updates };
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
