import { cloudDb } from './cloudDatabase';
import {
  User,
  Branch,
  Trainee,
  Trainer,
  Course,
  Program,
  Group,
  AttendanceRecord,
  Payment,
  Expense,
  TrainerSettlement,
  PointRule,
  PointTransaction,
  Exam,
  ExamQuestion,
  ExamResult,
  Question,
  QuestionBankItem,
  StudentExamSubmission,
  CodingTestCase,
  ProctorViolationEvent,
  InteractiveSession,
  Device,
  DeviceCommand,
  DeviceAuditEntry,
  Certificate,
  CertificateTemplate,
  AuditLog,
  CenterSettings,
  SystemSettings,
  SystemNotification,
  PromotionPreviewItem,
  LabScheduleSlot
} from '../types';

const CLOUD_RUN_API_URL = 'https://ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app/api';

const getApiBaseUrl = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const clean = String(envUrl).trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host.endsWith('vercel.app')) {
      return CLOUD_RUN_API_URL;
    }
  }
  return '/api';
};

const BASE_URL = getApiBaseUrl();

export async function request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle 429 Rate Limit / Resource Exhausted with exponential backoff retry
    if (response.status === 429 && retryCount < 3) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : (1000 * Math.pow(2, retryCount)) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return request<T>(endpoint, options, retryCount + 1);
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      let errMsg = 'حدث خطأ في الاتصال بالخادم';
      if (isJson) {
        try {
          const errJson = await response.json();
          if (errJson.error) errMsg = errJson.error;
        } catch {}
      } else {
        try {
          const text = await response.text();
          const lower = text.trim().toLowerCase();
          if (text && !lower.startsWith('<!doctype') && !lower.startsWith('<html')) {
            errMsg = text;
          }
        } catch {}
      }
      if (errMsg === 'حدث خطأ في الاتصال بالخادم') {
        errMsg = `خطأ ${response.status}: ${response.statusText}`;
      }
      throw new Error(errMsg);
    }

    if (isJson) {
      return response.json();
    } else {
      const text = await response.text();
      const trimmed = text.trim();
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('<!doctype') || lower.startsWith('<html') || lower.includes('<head>') || lower.includes('<body')) {
        if (retryCount < 1 && !BASE_URL.startsWith('http')) {
          try {
            const fallbackRes = await fetch(`${CLOUD_RUN_API_URL}${endpoint}`, { ...options, headers });
            if (fallbackRes.ok && fallbackRes.headers.get('content-type')?.includes('application/json')) {
              return await fallbackRes.json();
            }
          } catch {}
        }
        throw new Error(`انتهت الجلسة أو تعذر الاتصال بالخادم (${endpoint}). يرجى إعادة تحميل الصفحة.`);
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        if (trimmed.startsWith('<')) {
          throw new Error(`Invalid JSON response from ${endpoint}`);
        }
        return text as unknown as T;
      }
    }
  } catch (err: any) {
    if (retryCount < 2 && (err?.message?.includes('429') || err?.message?.includes('Rate exceeded') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.name === 'TypeError')) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return request<T>(endpoint, options, retryCount + 1);
    }
    throw err;
  }
}

export const api = {
  // Migration & Forensic Backup Center
  exportMigrationPackage: () => {
    window.location.href = '/api/migration/export-package';
  },
  exportFullDatabaseExcel: () => {
    window.location.href = '/api/migration/export-excel';
  },
  exportDeltaSyncPackage: async () => {
    // If it returns NO_CHANGES_DETECTED it's a 400 error, so we should fetch it first or use window.location if we just want the browser to download it.
    // Better to fetch to check for error, then download.
    const res = await fetch('/api/migration/export-delta', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error === 'NO_CHANGES_DETECTED') throw new Error('NO_CHANGES_DETECTED');
      throw new Error(data.error || 'Failed to export delta sync package');
    }
    // It's a file, so trigger download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disposition = res.headers.get('Content-Disposition');
    let filename = 'delta_sync.zip';
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename="([^"]*)"/.exec(disposition);
      if (matches != null && matches[1]) filename = matches[1];
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
  getMigrationManifest: () => request<{ success: boolean; manifest: any }>('/migration/manifest'),
  getMigrationHistory: () => request<{ success: boolean; history: any[] }>('/migration/history'),
  exportLegacyExcel: () => { window.location.href = '/api/migration/legacy-export-excel'; },
  exportLegacyJson: () => { window.location.href = '/api/migration/legacy-export-json'; },
  generateFullBackupArchive: () => request<{ success: boolean; filename: string; checksum: string; sizeBytes: number; backupData: any }>('/migration/full-backup', { method: 'POST' }),
  verifyIntegrity: (data?: any) => request<{ success: boolean; result: any }>('/migration/verify', { method: 'POST', body: JSON.stringify(data || {}) }),
  previewImportPackage: (data: any) => request<{ success: boolean; preview: any }>('/migration/preview-import', { method: 'POST', body: JSON.stringify(data) }),
  executeImportPackage: (payload: { data: any; mode?: 'MERGE' | 'SKIP_DUPLICATES' | 'REPLACE'; confirmReplace?: boolean; confirmToken?: string }) =>
    request<{ success: boolean; importedCount: number; backupFile?: string; message: string }>('/migration/execute-import', { method: 'POST', body: JSON.stringify(payload) }),

  // System Info & Backup / Restore
  getSystemInfo: () => request<any>('/system/info'),
  exportBackup: () => {
    window.location.href = '/api/system/export-backup';
  },
  importBackup: (backupData: any) =>
    request<{ success: boolean; message: string; stats?: any }>('/system/import-backup', {
      method: 'POST',
      body: JSON.stringify(backupData)
    }),
  getBackupsList: () => request<{ success: boolean; backups: any[] }>('/system/backups-list'),

  // Gemini TTS
  generateTTS: (text: string) => 
    request<{ success: boolean; audio: string }>('/gemini/tts', {
      method: 'POST',
      body: JSON.stringify({ text })
    }),

  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getUsers: () => request<User[]>('/auth/users'),
  createUser: (userData: any) =>
    request<{ success: boolean; user: User }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  updateUser: (id: string, userData: any) =>
    request<{ success: boolean; user: User }>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/auth/users/${id}`, {
      method: 'DELETE'
    }),

  // Branches
  getBranches: async () => {
    const res = await request<any>('/branches');
    if (Array.isArray(res)) return res as Branch[];
    if (res && Array.isArray(res.data)) return res.data as Branch[];
    if (res && Array.isArray(res.branches)) return res.branches as Branch[];
    return [] as Branch[];
  },
  createBranch: (branchData: Partial<Branch>) =>
    request<{ success: boolean; branch: Branch }>('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData)
    }),
  updateBranch: (id: string, branchData: Partial<Branch>) =>
    request<{ success: boolean; branch: Branch }>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData)
    }),
  deleteBranch: (id: string) =>
    request<{ success: boolean; message: string }>(`/branches/${id}`, {
      method: 'DELETE'
    }),
  duplicateBranch: (id: string) =>
    request<{ success: boolean; branch: Branch }>(`/branches/${id}/duplicate`, {
      method: 'POST'
    }),

  // Trainees
  getNextTraineeCode: (params?: { prefix?: string; courseId?: string; grade?: string } | string) => {
    let query = '';
    if (typeof params === 'string') {
      query = `?prefix=${encodeURIComponent(params)}`;
    } else if (params) {
      const q = new URLSearchParams();
      if (params.prefix) q.set('prefix', params.prefix);
      if (params.courseId) q.set('courseId', params.courseId);
      if (params.grade) q.set('grade', params.grade);
      query = `?${q.toString()}`;
    }
    return request<{ code: string; prefix?: string }>(`/trainees/next-code${query}`);
  },
  getPromotionPreview: (params?: { branchId?: string; academicYear?: string }) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<{
      academicYear?: string;
      currentYear?: string;
      nextYear?: string;
      rules?: any[];
      courses?: Course[];
      availableCourses?: Course[];
      availableGroups?: any[];
      totalEligible: number;
      items?: PromotionPreviewItem[];
      students?: any[];
    }>(`/trainees/promotion-preview${query ? `?${query}` : ''}`);
  },
  executeBatchPromotion: (data: {
    academicYear: string;
    selectedTraineeIds: string[];
    mappings: any[];
    autoUpgradeGroups: boolean;
  }) =>
    request<{
      success: boolean;
      promotedCount: number;
      graduatedCount: number;
      upgradedGroupsCount: number;
      academicYear?: string;
    }>('/trainees/promote-batch', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getTrainees: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    const res = await request<any>(`/trainees${query ? '?' + query : ''}`);
    if (Array.isArray(res)) return res as Trainee[];
    if (res && Array.isArray(res.data)) return res.data as Trainee[];
    if (res && Array.isArray(res.trainees)) return res.trainees as Trainee[];
    return [] as Trainee[];
  },
  getTraineeDetails: (id: string) =>
    request<{
      trainee: Trainee;
      payments: Payment[];
      attendance: AttendanceRecord[];
      points: PointTransaction[];
      exams: ExamResult[];
    }>(`/trainees/${id}`),
  createTrainee: (traineeData: any) =>
    request<{ success: boolean; trainee: Trainee }>('/trainees', {
      method: 'POST',
      body: JSON.stringify(traineeData)
    }),
  updateTrainee: (id: string, traineeData: any) =>
    request<{ success: boolean; trainee: Trainee }>(`/trainees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(traineeData)
    }),
  deleteTrainee: (id: string) => request<{success: boolean}>(`/trainees/${id}`, { method: 'DELETE' }),
  bulkAssignGroup: (ids: string[], groupId: string) =>
    request<{ success: boolean; count: number }>("/trainees/bulk-assign-group", {
      method: "POST",
      body: JSON.stringify({ traineeIds: ids, groupId })
    }),
  bulkDeleteTrainees: (ids: string[]) =>
    request<{ success: boolean; count: number }>('/trainees/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    }),
  bulkUpgradeTrainees: (ids: string[], status?: string) =>
    request<{ success: boolean; count: number }>('/trainees/bulk-upgrade', {
      method: 'POST',
      body: JSON.stringify({ ids, status: status || 'active' })
    }),
  bulkImportTrainees: (data: { rows: any[]; defaultBranchId?: string; defaultCourseId?: string }) =>
    request<{
      success: boolean;
      importedCount: number;
      errorsCount: number;
      errors: any[];
      importedTrainees: Trainee[];
    }>('/trainees/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  importPreviewTrainees: (data: { rows: any[]; defaultBranchId?: string }) =>
    request<{
      success: boolean;
      students: any[];
      groups: any[];
    }>('/trainees/import-preview', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  importCommitTrainees: (data: { students: any[] }) =>
    request<{
      success: boolean;
      importedCount: number;
      errorsCount: number;
      errors: any[];
    }>('/trainees/import-commit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  batchSyncTraineeRecords: () =>
    request<{
      success: boolean;
      totalTrainees: number;
      updatedCount: number;
      parentNamesAutoFilledCount: number;
      birthDatesExtractedCount: number;
      siblingsLinkedCount: number;
      exemptionsProcessedCount: number;
    }>('/trainees/batch-sync-records', {
      method: 'POST'
    }),

  // Trainers
  getTrainers: async () => {
    const res = await request<any>('/trainers');
    if (Array.isArray(res)) return res as Trainer[];
    if (res && Array.isArray(res.data)) return res.data as Trainer[];
    if (res && Array.isArray(res.trainers)) return res.trainers as Trainer[];
    return [] as Trainer[];
  },
  createTrainer: (trainerData: Partial<Trainer>) =>
    request<{ success: boolean; trainer: Trainer }>('/trainers', {
      method: 'POST',
      body: JSON.stringify(trainerData)
    }),
  updateTrainer: (id: string, trainerData: Partial<Trainer>) =>
    request<{ success: boolean; trainer: Trainer }>(`/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trainerData)
    }),
  fixTrainerCodes: () =>
    request<{ success: boolean; count: number; trainers: Trainer[] }>('/trainers/fix-codes', {
      method: 'POST'
    }),

  // Courses, Programs, Groups
  getCourses: async () => {
    const res = await request<any>('/courses');
    if (Array.isArray(res)) return res as Course[];
    if (res && Array.isArray(res.data)) return res.data as Course[];
    if (res && Array.isArray(res.courses)) return res.courses as Course[];
    return [] as Course[];
  },
  createCourse: (courseData: Partial<Course>) =>
    request<{ success: boolean; course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    }),
  updateCourse: (id: string, courseData: Partial<Course>) =>
    request<{ success: boolean; course: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    }),
  deleteCourse: (id: string) =>
    request<{ success: boolean; message: string }>(`/courses/${id}`, {
      method: 'DELETE'
    }),
  duplicateCourse: (id: string) =>
    request<{ success: boolean; course: Course }>(`/courses/${id}/duplicate`, {
      method: 'POST'
    }),
  addCourseMaterial: (courseId: string, materialData: any) =>
    request<{ success: boolean; material: any; course: Course }>(`/courses/${courseId}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialData)
    }),
  deleteCourseMaterial: (courseId: string, materialId: string) =>
    request<{ success: boolean; course: Course }>(`/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE'
    }),
  addCourseAssessment: (courseId: string, assessmentData: any) =>
    request<{ success: boolean; assessment: any; course: Course }>(`/courses/${courseId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    }),
  deleteCourseAssessment: (courseId: string, assessmentId: string) =>
    request<{ success: boolean; course: Course }>(`/courses/${courseId}/assessments/${assessmentId}`, {
      method: 'DELETE'
    }),

  getPrograms: async () => {
    const res = await request<any>('/programs');
    if (Array.isArray(res)) return res as Program[];
    if (res && Array.isArray(res.data)) return res.data as Program[];
    if (res && Array.isArray(res.programs)) return res.programs as Program[];
    return [] as Program[];
  },
  createProgram: (progData: Partial<Program> & Record<string, any>) =>
    request<{ success: boolean; program: Program }>('/programs', {
      method: 'POST',
      body: JSON.stringify(progData)
    }),
  updateProgram: (id: string, progData: Partial<Program>) =>
    request<{ success: boolean; program: Program }>(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(progData)
    }),
  deleteProgram: (id: string) =>
    request<{ success: boolean; message: string }>(`/programs/${id}`, {
      method: 'DELETE'
    }),
  addCoursesToProgram: (id: string, data: any) =>
    request<{ success: boolean; program: Program; addedCoursesCount: number }>(`/programs/${id}/add-courses`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getGroups: async () => {
    const res = await request<any>('/groups');
    if (Array.isArray(res)) return res as Group[];
    if (res && Array.isArray(res.data)) return res.data as Group[];
    if (res && Array.isArray(res.groups)) return res.groups as Group[];
    return [] as Group[];
  },
  createGroup: (groupData: Partial<Group>) =>
    request<{ success: boolean; group: Group }>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    }),
  batchCreateGroups: (data: { courseId: string; branchId: string; count: number; track?: string; prefixName?: string }) =>
    request<{ success: boolean; groups: Group[] }>('/groups/batch', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateGroup: (id: string, groupData: Partial<Group>) =>
    request<{ success: boolean; group: Group }>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    }),
  deleteGroup: (id: string) =>
    request<{ success: boolean; message: string }>(`/groups/${id}`, {
      method: 'DELETE'
    }),
  duplicateGroup: (id: string, overrides?: Partial<Group>) =>
    request<{ success: boolean; group: Group }>(`/groups/${id}/duplicate`, {
      method: 'POST',
      body: overrides ? JSON.stringify(overrides) : undefined
    }),

  // Attendance
  getAttendance: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    const res = await request<any>(`/attendance${query ? `?${query}` : ''}`);
    if (Array.isArray(res)) return res as AttendanceRecord[];
    if (res && Array.isArray(res.data)) return res.data as AttendanceRecord[];
    if (res && Array.isArray(res.attendance)) return res.attendance as AttendanceRecord[];
    return [] as AttendanceRecord[];
  },
  saveAttendanceBatch: (data: {
    records: { traineeId: string; status: string; notes?: string }[];
    date: string;
    groupId: string;
    branchId?: string;
    courseId?: string;
    trainerId?: string;
  }) =>
    request<{ success: boolean; count: number }>('/attendance/batch', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Finance
  getPayments: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<Payment[]>(`/finance/payments${query ? `?${query}` : ''}`);
  },
  createPayment: (paymentData: any) =>
    request<{ success: boolean; payment: Payment; trainee: Trainee }>('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }),

  getExpenses: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<Expense[]>(`/finance/expenses${query ? `?${query}` : ''}`);
  },
  createExpense: (expenseData: any) =>
    request<{ success: boolean; expense: Expense }>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    }),

  getTrainerSettlements: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<TrainerSettlement[]>(`/finance/trainer-settlements${query ? `?${query}` : ''}`);
  },
  createTrainerSettlement: (settlementData: any) =>
    request<{ success: boolean; settlement: TrainerSettlement; trainer: Trainer }>('/finance/trainer-settlements', {
      method: 'POST',
      body: JSON.stringify(settlementData)
    }),

  getFinanceSummary: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<{
      totalRevenue: number;
      totalExpenses: number;
      totalTrainerPayouts: number;
      netTreasury: number;
      totalTraineeRemaining: number;
      totalExpectedRevenue: number;
      totalTrainerDues: number;
      totalCenterShare: number;
      paymentsCount: number;
      expensesCount: number;
    }>(`/finance/summary${query ? `?${query}` : ''}`);
  },
  resetFinancialsAndArchive: (data: { archiveTitle: string; pin: string; userId?: string; userName?: string }) =>
    request<{ success: boolean; message: string; archiveId: string }>('/finance/reset-and-archive', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getSecretArchives: (pin: string, userRole?: string) =>
    request<{ success: boolean; archives: any[] }>('/finance/secret-archives', {
      method: 'POST',
      body: JSON.stringify({ pin, role: userRole, userRole })
    }),
  resetSecretTreasury: (data: { pin?: string; userId?: string; userName?: string; userRole?: string; role?: string }) =>
    request<{ success: boolean; message: string; previousBalance: number; newBalance: number }>('/finance/reset-secret-treasury', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Points
  getPointRules: () => request<PointRule[]>('/points/rules'),
  createPointRule: (ruleData: Partial<PointRule>) =>
    request<{ success: boolean; rule: PointRule }>('/points/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    }),
  getPointTransactions: () => request<PointTransaction[]>('/points/transactions'),
  addPoints: (data: {
    traineeIds?: string[];
    traineeId?: string;
    points: number;
    reason: string;
    ruleId?: string;
    branchId?: string;
    addedByUserId?: string;
    addedByUserName?: string;
  }) => {
    const payload = {
      ...data,
      traineeIds: data.traineeIds || (data.traineeId ? [data.traineeId] : [])
    };
    return request<{ success: boolean; modifiedCount: number }>('/points/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getLeaderboard: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<Trainee[]>(`/points/leaderboard${query ? `?${query}` : ''}`);
  },

  // Exams
  getExams: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<Exam[]>(`/exams${query ? `?${query}` : ''}`);
  },
  createExam: (examData: Partial<Exam>) =>
    request<{ success: boolean; exam: Exam }>('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    }),
  createFullExam: (data: { exam: Partial<Exam>; questions: any[] }) =>
    request<{ success: boolean; exam: Exam; questionsCount: number }>('/exams/create-full', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  extractExamQuestionsWithAI: (data: { imageBase64?: string; mimeType?: string; textPrompt?: string; courseName?: string }) =>
    request<{
      success: boolean;
      data: {
        title: string;
        subject?: string;
        suggestedDurationMinutes: number;
        totalMarks: number;
        passingMarks: number;
        questions: any[];
        summary: string;
      };
    }>('/ai/extract-exam-questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getExamQuestions: (examId: string) => request<ExamQuestion[]>(`/exams/${examId}/questions`),
  addExamQuestion: (examId: string, qData: Partial<ExamQuestion>) =>
    request<{ success: boolean; question: ExamQuestion }>(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(qData)
    }),
  getExamResults: (examId: string) => request<ExamResult[]>(`/exams/${examId}/results`),
  saveExamResultsBatch: (examId: string, data: { results: any[]; totalMarks: number }) =>
    request<{ success: boolean; count: number }>(`/exams/${examId}/results/batch`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  submitExamResult: (resultData: Partial<ExamResult>) =>
    request<{ success: boolean; result: ExamResult }>('/exams/results', {
      method: 'POST',
      body: JSON.stringify(resultData)
    }),
  updateExam: (id: string, examData: Partial<Exam>) =>
    request<{ success: boolean; exam: Exam }>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    }),
  deleteExam: (id: string) =>
    request<{ success: boolean; message: string }>(`/exams/${id}`, {
      method: 'DELETE'
    }),
  deleteExamQuestion: (examId: string, questionId: string) =>
    request<{ success: boolean }>(`/exams/${examId}/questions/${questionId}`, {
      method: 'DELETE'
    }),
  generateAIQuestions: (data: { courseId?: string; courseName?: string; topic?: string; difficulty: string; count: number; questionTypes: string[] }) =>
    request<{ success: boolean; questions: any[] }>('/ai/generate-exam-questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  addQuestionBankItem: (item: Partial<QuestionBankItem>) =>
    request<{ success: boolean; item: QuestionBankItem }>('/question-bank', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
  deleteQuestionBankItem: (id: string) =>
    request<{ success: boolean }>(`/question-bank/${id}`, {
      method: 'DELETE'
    }),
  submitStudentExam: (submission: Partial<StudentExamSubmission>) =>
    request<{ success: boolean; submission: StudentExamSubmission; certificateIssued?: boolean; certificateId?: string }>('/exams/submit-student-exam', {
      method: 'POST',
      body: JSON.stringify(submission)
    }),
  runCodeTestCases: (data: { code: string; language: string; testCases: CodingTestCase[] }) =>
    request<{
      success: boolean;
      passedCount: number;
      totalCount: number;
      results: { input: string; expectedOutput: string; actualOutput: string; passed: boolean; error?: string }[];
    }>('/exams/run-code-test-cases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Assignments & Task Creation
  getAssignments: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<any[]>(`/assignments${query ? `?${query}` : ''}`);
  },
  createAssignment: (data: any) =>
    request<{ success: boolean; assignment: any }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteAssignment: (id: string) =>
    request<{ success: boolean }>(`/assignments/${id}`, {
      method: 'DELETE'
    }),
  generateTestCases: (data: { title: string; description: string; programmingLanguage?: string; courseName?: string }) =>
    request<{ success: boolean; testCases: any[] }>('/assignments/generate-testcases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  autoGradeCode: (data: { taskTitle: string; taskDescription: string; studentCode: string; studentNotes?: string; maxGrade: number; testCases?: any[] }) =>
    request<{ success: boolean; result: any }>('/homeworks/auto-grade-code', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  batchGradeHomeworks: (data: { submissionIds: string[]; grade?: number; trainerNotes?: string; generalFeedback?: string; bonusPoints?: number }) =>
    request<{ success: boolean; updatedCount: number; message: string }>('/homeworks/batch-grade', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getLiveProctoring: (examId: string) =>
    request<{
      exam: Exam;
      submissions: StudentExamSubmission[];
      violations: ProctorViolationEvent[];
    }>(`/exams/${examId}/proctoring`),
  sendProctorAction: (examId: string, data: { traineeId: string; action: 'extend_time' | 'warn' | 'disqualify' | 'unlock_device'; payload?: any }) =>
    request<{ success: boolean; message: string }>(`/exams/${examId}/proctor-action`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Interactive Sessions
  getInteractiveSessions: () => request<InteractiveSession[]>('/interactive-sessions'),
  getNagahQuizzes: () => request<any[]>('/interactive/quizzes'),
  createNagahQuiz: (quizData: any) =>
    request<{ success: boolean; quiz: any }>('/interactive/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    }),
  createInteractiveSession: (sessionData: Partial<InteractiveSession>) =>
    request<{ success: boolean; session: InteractiveSession }>('/interactive-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }),
  updateInteractiveSession: (id: string, sessionData: Partial<InteractiveSession>) =>
    request<{ success: boolean; session: InteractiveSession }>(`/interactive-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    }),
  deleteInteractiveSession: (id: string) =>
    request<{ success: boolean }>(`/interactive-sessions/${id}`, {
      method: 'DELETE'
    }),
  broadcastInteractiveQuestion: (data: { sessionId?: string; question: Question }) =>
    request<{ success: boolean; count: number }>('/interactive-sessions/broadcast-question', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  broadcastNagahQuiz: (quiz: any) =>
    request<{ success: boolean; count: number }>('/interactive/broadcast-nagah-quiz', {
      method: 'POST',
      body: JSON.stringify({ quiz })
    }),
  broadcastInteractiveExternal: (data: { title: string; platform: string; url: string; gamePin?: string }) =>
    request<{ success: boolean; count: number }>('/interactive-sessions/broadcast-external', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  broadcastCeremony: (data: { step: number; top3: any[]; sessionName: string; isStarting?: boolean; isFinished?: boolean }) =>
    request<{ success: boolean; count: number }>('/interactive-sessions/broadcast-ceremony', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  forceCeremony: (active: boolean) =>
    request<{ success: boolean }>('/devices/force-ceremony', {
      method: 'POST',
      body: JSON.stringify({ active })
    }),
  submitInteractiveAnswer: (data: any) =>
    request<{ success: boolean; response: any }>('/interactive-sessions/answer', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getQuestionBank: () => request<any[]>('/question-bank'),

  // Devices & Agent
  getDevices: () => request<Device[]>('/devices'),
  registerDevice: (deviceData: Partial<Device>) =>
    request<{ success: boolean; device: Device }>('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData)
    }),
  sendDeviceCommand: (
    deviceId: string,
    command: string | { commandType: string; payload?: string; issuedByUserId?: string },
    extraPayload?: any
  ) => {
    const payload =
      typeof command === 'string'
        ? { commandType: command, payload: extraPayload?.message || JSON.stringify(extraPayload || {}) }
        : command;
    return request<{ success: boolean; command: DeviceCommand }>(`/devices/${deviceId}/command`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Lab Master Controller & Screen Broadcast
  startScreenBroadcast: (data: { trainerName: string; initialFrame?: string; activeUrl?: string; message?: string }) =>
    request<{ success: boolean; broadcast: any }>('/agent/broadcast/start', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  sendBroadcastFrame: (frame: string, audioChunk?: string, activeUrl?: string) =>
    request<{ success: boolean }>('/agent/broadcast/frame', {
      method: 'POST',
      body: JSON.stringify({ frame, audioChunk, activeUrl })
    }),
  stopScreenBroadcast: () =>
    request<{ success: boolean; broadcast: any }>('/agent/broadcast/stop', {
      method: 'POST'
    }),
  getBroadcastState: () =>
    request<{
      isBroadcasting: boolean;
      trainerName: string;
      streamFrame: string;
      activeUrl: string;
      activeMessage: string;
      pushedFile: any;
      updatedAt: string;
    }>('/agent/broadcast/state'),

  // Remote Push File & Open URL
  pushFileToDevices: (data: {
    fileName: string;
    fileUrl?: string;
    fileBase64?: string;
    fileType?: string;
    openImmediately?: boolean;
    targetDeviceIds?: string[];
  }) =>
    request<{ success: boolean; deliveredToCount: number }>('/agent/push-file', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  openUrlOnDevices: (url: string, targetDeviceIds?: string[]) =>
    request<{ success: boolean; deliveredToCount: number }>('/agent/open-url', {
      method: 'POST',
      body: JSON.stringify({ url, targetDeviceIds })
    }),

  // Student Kiosk Login & Auto-Attendance
  studentCodeLogin: (data: { codeOrPhone: string; deviceId?: string; deviceName?: string; ipAddress?: string }) =>
    request<{
      success: boolean;
      message: string;
      trainee: {
        id: string;
        code: string;
        fullName: string;
        phone: string;
        photoUrl?: string;
        points: number;
        totalPoints?: number;
        courseName: string;
        groupName: string;
        remainingAmount: number;
        stats?: {
          id: string;
          fullName: string;
          code: string;
          points: number;
          totalPoints: number;
          starsCount: number;
          overallRank: number;
          totalTrainees: number;
          groupRank: number;
          groupTotal: number;
          tierName: string;
          badgeColor: string;
          rankBadge: string;
          courseName: string;
          groupName: string;
        };
      };
      device: { id: string; deviceId: string; name: string };
      attendance: AttendanceRecord;
    }>('/agent/student-login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Send Reinforcement & Encouragements to Student Devices
  sendDeviceReinforcement: (data: {
    targetDeviceIds?: string[];
    targetTraineeIds?: string[];
    broadcastToAll?: boolean;
    reinforcementType?: string;
    title: string;
    message: string;
    stars?: number;
    points?: number;
    icon?: string;
    trainerName?: string;
    badgeText?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      deliveredDevicesCount: number;
      awardedTraineesCount: number;
    }>('/agent/send-reinforcement', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Lab Schedule
  getLabSchedules: (params?: { branchId?: string }) => {
    const q = params?.branchId && params.branchId !== 'all' ? `?branchId=${encodeURIComponent(params.branchId)}` : '';
    return request<LabScheduleSlot[]>(`/lab-schedules${q}`);
  },
  createLabSchedule: (data: Partial<LabScheduleSlot>) =>
    request<{ success: boolean; slot: LabScheduleSlot }>('/lab-schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteLabSchedule: (id: string) =>
    request<{ success: boolean; message: string }>(`/lab-schedules/${id}`, {
      method: 'DELETE'
    }),

  // Clean Session Reset
  resetDeviceSession: (deviceId: string) =>
    request<{ success: boolean; message: string }>('/agent/reset-device', {
      method: 'POST',
      body: JSON.stringify({ deviceId })
    }),

  // Projector Stream Mode
  setProjectorSource: (data: { source: 'master' | 'student'; deviceId?: string; deviceName?: string; streamFrame?: string }) =>
    request<{ success: boolean; projector: any }>('/agent/projector/set-source', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getProjectorState: () =>
    request<{
      activeSource: 'master' | 'student';
      deviceId: string;
      deviceName: string;
      streamFrame: string;
      updatedAt: string;
    }>('/agent/projector/state'),

  // Upload Recording & Step Logger
  uploadStudentRecording: (data: {
    deviceId: string;
    traineeId?: string;
    traineeName?: string;
    stepsLog: any[];
    durationSeconds: number;
  }) =>
    request<{ success: boolean; message: string }>('/agent/upload-recording', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Client Agent Heartbeat & Remote Assistance
  startRemoteAssistance: (deviceId: string) =>
    request<{ success: boolean; session: any }>('/agent/remote-assist/start', {
      method: 'POST',
      body: JSON.stringify({ deviceId })
    }),
  stopRemoteAssistance: (deviceId: string, sessionId?: string) =>
    request<{ success: boolean; message: string }>('/agent/remote-assist/stop', {
      method: 'POST',
      body: JSON.stringify({ deviceId, sessionId })
    }),
  sendRemoteInput: (data: { deviceId: string; sessionId: string; action: string; x?: number; y?: number; button?: string; key?: string; text?: string }) =>
    request<{ success: boolean }>('/agent/remote-assist/input', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  setMonitoringState: (data: { deviceIds: string[]; isMonitoring: boolean; quality?: string }) =>
    request<{ success: boolean }>('/devices/monitoring', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  startAudioBroadcast: (data: { targetDeviceIds: string[] | 'all' }) =>
    request<{ success: boolean; audioSession: any }>('/agent/audio/start', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  stopAudioBroadcast: () =>
    request<{ success: boolean }>('/agent/audio/stop', {
      method: 'POST'
    }),
  sendAudioChunk: (audioChunkBase64: string) =>
    request<{ success: boolean }>('/agent/audio/chunk', {
      method: 'POST',
      body: JSON.stringify({ audioChunk: audioChunkBase64 })
    }),
  sendRemoteAssistEvent: (deviceId: string, event: any) =>
    request<{ success: boolean }>('/agent/remote-assist/event', {
      method: 'POST',
      body: JSON.stringify({ deviceId, event })
    }),
  getRemoteAssistState: (deviceId: string) =>
    request<{ success: boolean; assistState: any }>(`/agent/remote-assist/state/${deviceId}`),

  getScreenshotArchive: () => request<any[]>('/devices/screenshots/archive'),
  deleteScreenshot: (id: string) => request<{ success: boolean }>(`/devices/screenshots/archive/${id}`, { method: 'DELETE' }),
  clearScreenshotArchive: () => request<{ success: boolean }>('/devices/screenshots/archive', { method: 'DELETE' }),
  deleteDevice: (id: string) => request<{ success: boolean }>('/devices/remove', {
    method: 'POST',
    body: JSON.stringify({ id })
  }),
  updateDeviceName: (id: string, name: string) => request<{ success: boolean; device: any }>(`/devices/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  runDiagnostics: () => request<any>('/devices/diagnostics', { method: 'POST' }),

  sendBulkDeviceCommand: (data: { deviceIds?: string[]; branchId?: string; commandType: string; payload?: string; issuedByUserId?: string }) =>
    request<{ success: boolean; executedCount: number; message: string }>('/devices/bulk-command', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  enrollDevice: (data: { enrollmentKey: string; pcName: string; branchId: string; labName: string; macAddress?: string; os?: string; agentVersion?: string }) =>
    request<{ success: boolean; device: Device; token: string }>('/devices/enroll', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  setDeviceExamPolicy: (data: { deviceIds: string[]; examPolicy: any }) =>
    request<{ success: boolean; message: string }>('/devices/exam-policy', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  cleanupDeviceSession: (deviceId: string) =>
    request<{ success: boolean; message: string }>('/devices/session-cleanup', {
      method: 'POST',
      body: JSON.stringify({ deviceId })
    }),

  getDeviceAuditLogs: () => request<DeviceAuditEntry[]>('/devices/audit-logs'),

  sendAgentHeartbeat: (data: { deviceId: string; name?: string; ip?: string; screenshot?: string; currentScreen?: string }) =>
    request<{
      success: boolean;
      commands: any[];
      deviceStatus: string;
      isMonitoring?: boolean;
      traineeStats?: {
        id: string;
        fullName: string;
        code: string;
        points: number;
        totalPoints: number;
        starsCount: number;
        overallRank: number;
        totalTrainees: number;
        groupRank: number;
        groupTotal: number;
        tierName: string;
        badgeColor: string;
        rankBadge: string;
        courseName: string;
        groupName: string;
      };
      remoteAssist?: any;
      masterBroadcast: any;
    }>('/agent/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Certificates & Templates
  getCertificateTemplates: () => request<CertificateTemplate[]>('/certificates/templates'),
  createCertificateTemplate: (templateData: Partial<CertificateTemplate>) =>
    request<{ success: boolean; template: CertificateTemplate }>('/certificates/templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    }),
  updateCertificateTemplate: (id: string, templateData: Partial<CertificateTemplate>) =>
    request<{ success: boolean; template: CertificateTemplate }>(`/certificates/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData)
    }),
  deleteCertificateTemplate: (id: string) =>
    request<{ success: boolean; message: string }>(`/certificates/templates/${id}`, {
      method: 'DELETE'
    }),
  getCertificates: () => request<Certificate[]>('/certificates'),
  createCertificate: (certData: Partial<Certificate>) =>
    request<{ success: boolean; certificate: Certificate }>('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData)
    }),
  deleteCertificate: (id: string) =>
    request<{ success: boolean; message: string }>(`/certificates/${id}`, {
      method: 'DELETE'
    }),

  // Global Search
  search: (query: string) =>
    request<{
      trainees: Trainee[];
      trainers: Trainer[];
      courses: Course[];
      payments: Payment[];
      devices: Device[];
    }>(`/search?q=${encodeURIComponent(query)}`),

  // Reports
  getReportData: async (reportId: string, params?: Record<string, string>) => {
    const query = new URLSearchParams(params || {}).toString();
    return request<any>(`/reports/${reportId}${query ? `?${query}` : ''}`);
  },

  // Notifications & Audit Logs
  getNotifications: () =>
    request<{ notifications: SystemNotification[]; arrearsCount: number; offlineDevicesCount: number }>(
      '/notifications'
    ),
  markNotificationsRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),

  // Settings & Backup
  getSettings: () => request<SystemSettings>('/settings'),
  updateSettings: (settingsData: Partial<SystemSettings | CenterSettings>) =>
    request<{ success: boolean; settings: SystemSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    }),
  getBackupUrl: () => `${BASE_URL}/backup`,
  getBackupData: () => request<any>('/backup'),
  restoreBackupData: (snapshotData: any) =>
    request<{ success: boolean; message: string }>('/restore', {
      method: 'POST',
      body: JSON.stringify(snapshotData)
    }),
  restoreBackup: (snapshotData: any) =>
    request<{ success: boolean; message: string }>('/restore', {
      method: 'POST',
      body: JSON.stringify(snapshotData)
    }),
  resetSystem: (options: any, userInfo?: { userId?: string; userRole?: string; userName?: string }) =>
    request<{ success: boolean; message: string }>('/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ options, ...(userInfo || {}) })
    }),
  syncSystem: () =>
    request<{ success: boolean; message: string }>('/system/sync', {
      method: 'POST'
    }),

  // AI & Bot Integrations
  askManagerAssistant: (prompt: string) =>
    request<{ success: boolean; reply: string }>('/ai/manager-assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),
  askDeveloperAgent: (prompt: string) =>
    request<{ success: boolean; result: string }>('/ai/developer-agent', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),
  applyDeveloperCode: (payload: { prompt: string; code: string }) =>
    request<{ success: boolean; message: string }>('/ai/developer-agent/apply', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  simulateFacebookLead: (payload: { senderName: string; phone: string; message: string; courseId?: string }) =>
    request<{ success: boolean; reply: string; trainee: Trainee }>('/ai/facebook-webhook', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  submitWhatsappHomework: (payload: { traineeId: string; homeworkText: string }) =>
    request<{ success: boolean; grade: number; pointsAwarded: number; feedback: string }>('/ai/whatsapp-homework', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  summarizeLecture: (payload: { lectureTitle: string; transcript: string; language: string }) =>
    request<{ success: boolean; summary: string }>('/ai/trainer-lecture-summary', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  publishSocial: (payload: { groupName: string; channel: 'whatsapp' | 'facebook'; content: string; imageUrl?: string }) =>
    request<{ success: boolean; message: string }>('/ai/publish-social', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // AI Homework & Exam Camera Scanner and Auto-Grader
  gradeHomeworkScan: (payload: {
    imageBase64: string;
    mimeType?: string;
    answerKey?: string;
    examOrHomeworkTitle?: string;
    maxScore?: number;
    courseId?: string;
    courseName?: string;
  }) =>
    request<{
      success: boolean;
      data: {
        detectedStudentCode?: string;
        detectedStudentName?: string;
        detectedTitle?: string;
        detectedSubject?: string;
        score: number;
        maxScore: number;
        percentage: number;
        rating: string;
        status: 'passed' | 'failed';
        suggestedPoints: number;
        strengths: string[];
        weaknesses: string[];
        mistakes: {
          questionNumber?: string;
          questionSummary: string;
          studentAnswer: string;
          correctAnswer: string;
          isCorrect: boolean;
          scoreAwarded: number;
          maxScore: number;
          explanation: string;
        }[];
        generalFeedback: string;
        confidence: number;
      };
      matchedTrainee: {
        id: string;
        code: string;
        fullName: string;
        phone: string;
        parentPhone?: string;
        courseId?: string;
        groupId?: string;
        totalPoints: number;
        photoUrl?: string;
      } | null;
    }>('/ai/grade-scan', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  confirmGradeScan: (payload: {
    traineeId: string;
    examId?: string;
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
    rating: string;
    awardedPoints: number;
    feedback: string;
    mistakes?: any[];
    scannedImage?: string;
    courseId?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      examResult: ExamResult;
      updatedTrainee: any;
      pointTransaction?: PointTransaction;
    }>('/ai/grade-scan/confirm', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Secure Switching
  secureSwitchRole: (currentRole: string, targetRole: string) =>
    request<{ allowed: boolean; error?: string }>('/auth/secure-switch-role', {
      method: 'POST',
      body: JSON.stringify({ currentRole, targetRole })
    }),

  // Student Profiles & Password Updates
  updateStudentProfile: (id: string, payload: { portalPassword?: string; socialLinks?: any }) =>
    request<{ success: boolean; trainee: Trainee }>(`/student/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Student Community Hub (Facebook-like)
  getStudentPosts: () => request<any[]>('/student/posts'),
  createStudentPost: (payload: {
    traineeId: string;
    traineeName: string;
    traineePhoto?: string;
    content: string;
    branchId?: string;
    tags?: string[];
  }) =>
    request<{ success: boolean; post: any }>('/student/posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  likeStudentPost: (postId: string, traineeId: string) =>
    request<{ success: boolean; likesCount: number; isLiked: boolean }>(`/student/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ traineeId })
    }),
  commentStudentPost: (postId: string, payload: {
    traineeId: string;
    traineeName: string;
    traineePhoto?: string;
    content: string;
  }) =>
    request<{ success: boolean; comment: any }>(`/student/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Storage Diagnostics
  getStorageInfo: () => request<{
    local: {
      dbSizeBytes: number;
      dbSizeMB: number;
      photosSizeMB: number;
      homeworksSizeMB: number;
      totalDeviceMB: number;
      totalLimitMB: number;
      formattedUsed: string;
    };
    cloud: {
      connected: boolean;
      accountEmail: string;
      usedMB: number;
      totalMB: number;
      remainingMB: number;
      formattedUsed: string;
      formattedTotal: string;
      syncStatus: string;
    };
  }>('/system/storage-info'),

  // Parent Portal APIs
  updateParentFullProfile: (payload: {
    traineeId?: string;
    parentPhone?: string;
    parentName?: string;
    parentNationalId?: string;
    parentEmail?: string;
    address?: string;
    parentPortalPassword?: string;
    parentPhotoUrl?: string;
  }) =>
    request<{ success: boolean; updatedCount: number; message: string }>('/parent/update-full-profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  sendParentPortalMessage: (payload: {
    traineeId: string;
    senderName?: string;
    recipientType?: 'admin' | 'trainer';
    recipientId?: string;
    trainerName?: string;
    message: string;
    messageType?: 'message' | 'greeting';
  }) =>
    request<{ success: boolean; message: any; aiReply?: any }>('/parent/send-message', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getParentMessages: (traineeId?: string) =>
    request<any[]>(`/parent/messages${traineeId ? `?traineeId=${traineeId}` : ''}`),

  // Payment Proof & Verification APIs
  submitParentPaymentProof: (payload: {
    traineeId: string;
    amount: number;
    paymentMethod: string;
    targetMonth?: string;
    notes?: string;
    proofImageUrl?: string;
    submittedByParentName?: string;
  }) =>
    request<{ success: boolean; payment: Payment }>('/parent/submit-payment-proof', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getPendingPaymentProofs: () =>
    request<Payment[]>('/finance/pending-proofs'),

  approvePaymentProof: (payload: {
    paymentId: string;
    approvedByUserId?: string;
    approvedByUserName?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; payment: Payment; trainee: Trainee }>('/finance/approve-proof', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  rejectPaymentProof: (payload: {
    paymentId: string;
    rejectionReason: string;
    rejectedByUserId?: string;
    rejectedByUserName?: string;
  }) =>
    request<{ success: boolean; payment: Payment }>('/finance/reject-proof', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // ==========================================
  // AI LANGUAGE LAB CORE ENDPOINTS
  // ==========================================
  languageLabChatTurn: (data: {
    scenarioId?: string;
    systemPersona?: string;
    userMessage: string;
    conversationHistory?: any[];
    cefrLevel?: string;
    studentName?: string;
  }) =>
    request<{
      success: boolean;
      reply: string;
      feedback: {
        score: number;
        praise: string;
        corrections: { original: string; improved: string; explanation: string }[];
        pronunciationTips: string[];
        suggestedFollowUpPhrases: string[];
      };
      modelUsed?: string;
    }>('/language-lab/chat-turn', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabAnalyzeSpeaking: (data: {
    targetPrompt: string;
    spokenText: string;
    cefrLevel?: string;
    mode?: string;
  }) =>
    request<{
      success: boolean;
      score: number;
      accuracyScore: number;
      fluencyScore: number;
      pronunciationScore: number;
      summaryAr: string;
      strengths: string[];
      improvements: string[];
      correctedErrors: { original: string; corrected: string; explanation: string }[];
      improvedVersion: string;
      modelUsed?: string;
    }>('/language-lab/analyze-speaking', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabAnalyzeWriting: (data: {
    topic: string;
    studentText: string;
    cefrLevel?: string;
    instructions?: string;
  }) =>
    request<{
      success: boolean;
      score: number;
      cefrEstimated: string;
      summaryAr: string;
      wordCount: number;
      strengths: string[];
      improvements: string[];
      correctedErrors: { original: string; corrected: string; rule: string; explanation: string }[];
      vocabularyEnhancements: { wordUsed: string; suggestedAlternatives: string[] }[];
      improvedParagraph: string;
      modelUsed?: string;
    }>('/language-lab/analyze-writing', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabGetCoachAdvice: (profile: any) =>
    request<{
      success: boolean;
      coach: {
        greetingAr: string;
        statusSummaryAr: string;
        todayFocusSkill: string;
        todayReasonAr: string;
        recommendedAction: { title: string; description: string; targetPillar: string };
        reviewWordsNotice: string;
        nextGoalAr: string;
      };
      modelUsed?: string;
    }>('/language-lab/ai-coach', {
      method: 'POST',
      body: JSON.stringify({ profile })
    }),

  languageLabGenerateActivity: (data: {
    prompt: string;
    skill?: string;
    level?: string;
    duration?: number;
    maxGrade?: number;
  }) =>
    request<{
      success: boolean;
      activity: any;
      modelUsed?: string;
    }>('/language-lab/generate-activity', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabAnalyzeGroup: (data: { groupName: string; trainees: any[] }) =>
    request<{
      success: boolean;
      analysis: {
        groupOverviewAr: string;
        averageLevel: string;
        tiers: {
          needsSupport: { studentNames: string[]; diagnosisAr: string; recommendedActionAr: string };
          developing: { studentNames: string[]; diagnosisAr: string; recommendedActionAr: string };
          good: { studentNames: string[]; diagnosisAr: string; recommendedActionAr: string };
          advanced: { studentNames: string[]; diagnosisAr: string; recommendedActionAr: string };
        };
      };
      modelUsed?: string;
    }>('/language-lab/analyze-group', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabGetLessonAssistant: (data: { topic: string; level?: string; skill?: string }) =>
    request<{
      success: boolean;
      assistant: {
        lessonTitleAr: string;
        targetObjectives: string[];
        lessonProgression: { phase: string; activity: string }[];
        commonStudentMistakes: { mistake: string; correctionGuide: string }[];
        remedialSuggestion: string;
        enrichmentSuggestion: string;
      };
      modelUsed?: string;
    }>('/language-lab/lesson-assistant', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabGetStudentProfile: (studentId: string) =>
    request<{ success: boolean; profile: any }>(`/language-lab/student/${studentId}`),

  languageLabSaveStudentProfile: (studentId: string, profile: any) =>
    request<{ success: boolean; profile: any }>(`/language-lab/student/${studentId}/save`, {
      method: 'POST',
      body: JSON.stringify(profile)
    }),

  languageLabGetTrainerActivities: (trainerId: string) =>
    request<{ success: boolean; activities: any[] }>(`/language-lab/trainer/${trainerId}/activities`),

  languageLabSaveActivity: (activity: any) =>
    request<{ success: boolean; activity: any }>('/language-lab/trainer/activity', {
      method: 'POST',
      body: JSON.stringify(activity)
    }),

  languageLabSubmitActivity: (submission: any) =>
    request<{ success: boolean; submission: any }>('/language-lab/student/submit-activity', {
      method: 'POST',
      body: JSON.stringify(submission)
    }),

  languageLabGradeSubmission: (data: {
    submissionId: string;
    grade: number;
    textNotes?: string;
    voiceCommentUrl?: string;
    trainerId: string;
    trainerName: string;
  }) =>
    request<{ success: boolean; message: string }>('/language-lab/trainer/grade-submission', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  languageLabGetParentInsights: (studentId: string) =>
    request<{ success: boolean; insights: any }>(`/language-lab/parent/${studentId}`)
};


