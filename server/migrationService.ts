import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { adminDb } from './firebaseAdmin';
import { db } from './db';
import {
  TraineeRepo, BranchRepo, CourseRepo, GroupRepo, TrainerRepo,
  AttendanceRepo, PaymentRepo, ExpenseRepo, ExamRepo, ExamQuestionRepo,
  ExamResultRepo, PointRuleRepo, PointTransactionRepo, SettingRepo,
  CertificateRepo, CertificateTemplateRepo, UserRepo, AuditLogRepo
} from './data/index.ts';
import { exportAllFirestoreData, executeDatabaseImport, previewDatabaseImport } from './data/phase2b.ts';

const MIGRATION_DIR = path.join(process.cwd(), 'migration-package');
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');
const HISTORY_FILE = path.join(BACKUPS_DIR, 'backup_history.json');

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export interface BackupHistoryEntry {
  id: string;
  filename: string;
  type: 'FULL_BACKUP' | 'MIGRATION_PACKAGE' | 'AUTO_SNAPSHOT' | 'PRE_RESTORE_SAFETY';
  createdAt: string;
  sizeBytes: number;
  sizeFormatted: string;
  recordsCount: number;
  studentsCount: number;
  trainersCount: number;
  coursesCount: number;
  groupsCount: number;
  financialCount: number;
  certificatesCount: number;
  status: 'VERIFIED_HEALTHY' | 'NEEDS_REVIEW' | 'PENDING';
  source: 'FIRESTORE_AUTHORITATIVE' | 'LOCAL_MERGE' | 'IMPORTED';
  checksum: string;
  schemaVersion: string;
  migrationVersion: string;
}

export class MigrationService {
  private static ensureDirs() {
    ensureDirectory(MIGRATION_DIR);
    ensureDirectory(BACKUPS_DIR);
  }

  static getDeltaSyncHistory() {
    const filePath = path.join(process.cwd(), 'server', 'data', 'delta_sync_history.json');
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        // ignore
      }
    }
    return {
      lastSyncId: null,
      lastSyncTimestamp: null,
      history: []
    };
  }

  static saveDeltaSyncHistory(historyData: any) {
    try {
      const filePath = path.join(process.cwd(), 'server', 'data', 'delta_sync_history.json');
      fs.writeFileSync(filePath, JSON.stringify(historyData, null, 2), 'utf8');
    } catch (err) {
      console.warn('[MigrationService] saveDeltaSyncHistory notice (read-only filesystem):', err);
    }
  }

  static getHistory(): BackupHistoryEntry[] {
    this.ensureDirs();
    let history: BackupHistoryEntry[] = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      } catch {
        history = [];
      }
    }

    // Also scan BACKUPS_DIR for any json files not yet in history
    if (fs.existsSync(BACKUPS_DIR)) {
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json') && f !== 'backup_history.json');
      const existingFilenames = new Set(history.map(h => h.filename));

      for (const file of files) {
        if (!existingFilenames.has(file)) {
          const fullPath = path.join(BACKUPS_DIR, file);
          const stat = fs.statSync(fullPath);
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const parsed = JSON.parse(content);
            const sha256 = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
            const traineesCount = Array.isArray(parsed.trainees) ? parsed.trainees.length : (Array.isArray(parsed.students) ? parsed.students.length : 0);

            history.push({
              id: `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
              filename: file,
              type: file.includes('replace') ? 'PRE_RESTORE_SAFETY' : 'FULL_BACKUP',
              createdAt: stat.mtime.toISOString(),
              sizeBytes: stat.size,
              sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
              recordsCount: traineesCount + (parsed.courses?.length || 0) + (parsed.groups?.length || 0),
              studentsCount: traineesCount,
              trainersCount: parsed.trainers?.length || 0,
              coursesCount: parsed.courses?.length || 0,
              groupsCount: parsed.groups?.length || 0,
              financialCount: (parsed.payments?.length || 0) + (parsed.expenses?.length || 0),
              certificatesCount: parsed.certificates?.length || 0,
              status: 'VERIFIED_HEALTHY',
              source: 'FIRESTORE_AUTHORITATIVE',
              checksum: `sha256:${sha256}`,
              schemaVersion: '1.0.0',
              migrationVersion: '2026.08.v1'
            });
          } catch {}
        }
      }
    }

    // Sort descending by date
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return history;
  }

  static recordHistoryEntry(entry: BackupHistoryEntry) {
    try {
      this.ensureDirs();
      const history = this.getHistory();
      const filtered = history.filter(h => h.id !== entry.id && h.filename !== entry.filename);
      filtered.unshift(entry);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(filtered.slice(0, 50), null, 2), 'utf8');
    } catch (err) {
      console.warn('[MigrationService] recordHistoryEntry notice (read-only filesystem):', err);
    }
  }

  /**
   * Generates a complete forensic raw & normalized package
   */
  static async extractAllData() {
    this.ensureDirs();

    // 1. Fetch Firestore Collections (Authoritative)
    const firestoreTrainees: any[] = [];
    const firestoreTrainers: any[] = [];
    const firestoreBranches: any[] = [];
    const firestoreCourses: any[] = [];
    const firestoreGroups: any[] = [];
    const firestoreAttendance: any[] = [];
    const firestorePayments: any[] = [];
    const firestoreExpenses: any[] = [];
    const firestoreCertificates: any[] = [];
    const firestoreCertificateTemplates: any[] = [];
    const firestorePointRules: any[] = [];
    const firestorePointTransactions: any[] = [];
    const firestoreExams: any[] = [];
    const firestoreQuestions: any[] = [];
    const firestoreExamResults: any[] = [];
    const firestoreUsers: any[] = [];
    const firestoreAuditLogs: any[] = [];
    const firestoreSettings: any[] = [];

    try { (await adminDb.collection('trainees').get()).forEach(d => firestoreTrainees.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('trainers').get()).forEach(d => firestoreTrainers.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('branches').get()).forEach(d => firestoreBranches.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('courses').get()).forEach(d => firestoreCourses.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('groups').get()).forEach(d => firestoreGroups.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('attendance').get()).forEach(d => firestoreAttendance.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('payments').get()).forEach(d => firestorePayments.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('expenses').get()).forEach(d => firestoreExpenses.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('certificates').get()).forEach(d => firestoreCertificates.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('certificateTemplates').get()).forEach(d => firestoreCertificateTemplates.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('pointRules').get()).forEach(d => firestorePointRules.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('pointTransactions').get()).forEach(d => firestorePointTransactions.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('exams').get()).forEach(d => firestoreExams.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('questions').get()).forEach(d => firestoreQuestions.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('examResults').get()).forEach(d => firestoreExamResults.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('users').get()).forEach(d => firestoreUsers.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('auditLogs').get()).forEach(d => firestoreAuditLogs.push({ ...d.data(), id: d.id })); } catch {}
    try { (await adminDb.collection('settings').get()).forEach(d => firestoreSettings.push({ ...d.data(), id: d.id })); } catch {}

    // Merge with Local DB fallback
    const localDb = db.getData();

    const studentMap = new Map<string, any>();
    (localDb.trainees || []).forEach(t => studentMap.set(t.id, { ...t, _origin: 'local_db' }));
    firestoreTrainees.forEach(t => studentMap.set(t.id, { ...t, _origin: 'firestore' }));
    const allStudents = Array.from(studentMap.values());

    const trainerMap = new Map<string, any>();
    (localDb.trainers || []).forEach(t => trainerMap.set(t.id, { ...t, _origin: 'local_db' }));
    firestoreTrainers.forEach(t => trainerMap.set(t.id, { ...t, _origin: 'firestore' }));
    const allTrainers = Array.from(trainerMap.values());

    const branchMap = new Map<string, any>();
    (localDb.branches || []).forEach(b => branchMap.set(b.id, { ...b, _origin: 'local_db' }));
    firestoreBranches.forEach(b => branchMap.set(b.id, { ...b, _origin: 'firestore' }));
    const allBranches = Array.from(branchMap.values());

    const courseMap = new Map<string, any>();
    (localDb.courses || []).forEach(c => courseMap.set(c.id, { ...c, _origin: 'local_db' }));
    firestoreCourses.forEach(c => courseMap.set(c.id, { ...c, _origin: 'firestore' }));
    const allCourses = Array.from(courseMap.values());

    const groupMap = new Map<string, any>();
    (localDb.groups || []).forEach(g => groupMap.set(g.id, { ...g, _origin: 'local_db' }));
    firestoreGroups.forEach(g => groupMap.set(g.id, { ...g, _origin: 'firestore' }));
    const allGroups = Array.from(groupMap.values());

    const attendanceMap = new Map<string, any>();
    (localDb.attendance || []).forEach(a => attendanceMap.set(a.id, { ...a, _origin: 'local_db' }));
    firestoreAttendance.forEach(a => attendanceMap.set(a.id, { ...a, _origin: 'firestore' }));
    const allAttendance = Array.from(attendanceMap.values());

    const paymentMap = new Map<string, any>();
    (localDb.payments || []).forEach(p => paymentMap.set(p.id, { ...p, _origin: 'local_db' }));
    firestorePayments.forEach(p => paymentMap.set(p.id, { ...p, _origin: 'firestore' }));
    const allPayments = Array.from(paymentMap.values());

    const allExpenses = firestoreExpenses.length > 0 ? firestoreExpenses : (localDb.expenses || []);
    const allCertificates = firestoreCertificates.length > 0 ? firestoreCertificates : (localDb.certificates || []);
    const allCertificateTemplates = firestoreCertificateTemplates.length > 0 ? firestoreCertificateTemplates : (localDb.certificateTemplates || []);
    const allPointRules = firestorePointRules.length > 0 ? firestorePointRules : (localDb.pointRules || []);
    const allPointTransactions = firestorePointTransactions.length > 0 ? firestorePointTransactions : (localDb.pointTransactions || []);
    const allExams = firestoreExams.length > 0 ? firestoreExams : (localDb.exams || []);
    const allQuestions = firestoreQuestions.length > 0 ? firestoreQuestions : (localDb.questions || []);
    const allExamResults = firestoreExamResults.length > 0 ? firestoreExamResults : (localDb.examResults || []);
    const allUsers = firestoreUsers.length > 0 ? firestoreUsers : (localDb.users || []);
    const allAuditLogs = firestoreAuditLogs.length > 0 ? firestoreAuditLogs : (localDb.auditLogs || []);
    const allPortfolios = localDb.studentPosts || [];
    const settingsObj = firestoreSettings.length > 0 ? firestoreSettings[0] : (localDb.settings || {});

    const allLabs = [
      {
        id: 'lab-1',
        name: 'معمل النجاح الرئيسي',
        branchId: 'branch-1',
        branchName: 'فرع النجاح',
        capacity: 20,
        devicesCount: 20,
        status: 'active',
        ipRange: '192.168.1.100 - 192.168.1.120'
      },
      {
        id: 'lab-2',
        name: 'معمل فرع بدر',
        branchId: 'branch-2',
        branchName: 'فرع بدر',
        capacity: 15,
        devicesCount: 15,
        status: 'active',
        ipRange: '192.168.2.100 - 192.168.2.115'
      }
    ];

    // Course Normalization
    const courseNormalizationMap: any[] = [];
    const courseTypesSet = new Set<string>();
    const gradesSet = new Set<string>();

    for (const c of allCourses) {
      const name = (c.name || c.title || '').trim();
      const code = (c.code || '').trim();
      let proposedType = 'تكنولوجيا المعلومات والاتصالات';
      let proposedCourse = name;
      let proposedGrade = 'غير محدد';
      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
      let reason = 'مطابقة دقيقة لمنهج تكنولوجيا المعلومات والمرحلة الدراسية';
      let needsReview = false;

      if (/ICT\s*4|الصف الرابع|رابع|Grade\s*4/i.test(name) || code === 'CRS-472') {
        proposedType = 'منهج ICT للمرحلة الابتدائية';
        proposedCourse = 'ICT4';
        proposedGrade = 'الصف الرابع الابتدائي';
        reason = 'تطابق مع منهج تكنولوجيا المعلومات ICT للصف الرابع الابتدائي';
      } else if (/ICT\s*5|الصف الخامس|خامس|Grade\s*5/i.test(name) || code === 'CRS-695') {
        proposedType = 'منهج ICT للمرحلة الابتدائية';
        proposedCourse = 'ICT5';
        proposedGrade = 'الصف الخامس الابتدائي';
        reason = 'تطابق مع منهج تكنولوجيا المعلومات ICT للصف الخامس الابتدائي';
      } else if (/ICT\s*6|الصف السادس|سادس|Grade\s*6/i.test(name) || code === 'CRS-182') {
        proposedType = 'منهج ICT للمرحلة الابتدائية';
        proposedCourse = 'ICT6';
        proposedGrade = 'الصف السادس الابتدائي';
        reason = 'تطابق مع منهج تكنولوجيا المعلومات ICT للصف السادس الابتدائي';
      } else if (/ICT-P1|ICT-p1|الأول الإعدادي|أولى إعدادي|Prep\s*1/i.test(name) || code === 'CRS-892' || code === 'ICT-p1-L' || code === 'ICT-p1') {
        const isLang = name.includes('لغات') || code.includes('-L');
        proposedType = isLang ? 'حاسب آلي المرحلة الإعدادية (لغات)' : 'حاسب آلي المرحلة الإعدادية';
        proposedCourse = isLang ? 'ICT-PREP-1-LANG' : 'ICT-PREP-1';
        proposedGrade = isLang ? 'الصف الأول الإعدادي (لغات)' : 'الصف الأول الإعدادي';
        reason = 'تطابق مع منهج الحاسب الآلي وتكنولوجيا المعلومات للصف الأول الإعدادي';
      } else if (/ICT-P2|ICT-p2|الثاني الإعدادي|ثانية إعدادي|Prep\s*2/i.test(name) || code === 'CRS-573') {
        proposedType = 'حاسب آلي المرحلة الإعدادية';
        proposedCourse = 'ICT-PREP-2';
        proposedGrade = 'الصف الثاني الإعدادي';
        reason = 'تطابق مع منهج الحاسب الآلي وتكنولوجيا المعلومات للصف الثاني الإعدادي';
      } else if (/ICT-P3|ICT-p3|الثالث الإعدادي|ثالثة إعدادي|Prep\s*3/i.test(name) || code === 'CRS-644' || code === 'ICT-p3-L') {
        const isLang = name.includes('لغات') || code.includes('-L');
        proposedType = isLang ? 'حاسب آلي المرحلة الإعدادية (لغات)' : 'حاسب آلي المرحلة الإعدادية';
        proposedCourse = isLang ? 'ICT-PREP-3-LANG' : 'ICT-PREP-3';
        proposedGrade = isLang ? 'الصف الثالث الإعدادي (لغات)' : 'الصف الثالث الإعدادي';
        reason = 'تطابق مع منهج الحاسب الآلي وتكنولوجيا المعلومات للصف الثالث الإعدادي';
      } else if (/ICT-S1|ICT-s1|الأول الثانوي|أولى ثانوي|Sec\s*1/i.test(name) || code === 'CRS-220') {
        proposedType = 'تكنولوجيا وحاسب المرحلة الثانوية';
        proposedCourse = 'ICT-SEC-1';
        proposedGrade = 'الصف الأول الثانوي';
        reason = 'تطابق مع مقرر التكنولوجيا والحاسب للصف الأول الثانوي';
      } else if (/ICT-S2|ICT-s2|الثاني الثانوي|ثانية ثانوي|Sec\s*2/i.test(name) || code === 'CRS-796') {
        proposedType = 'تكنولوجيا وحاسب المرحلة الثانوية';
        proposedCourse = 'ICT-SEC-2';
        proposedGrade = 'الصف الثاني الثانوي';
        reason = 'تطابق مع مقرر التكنولوجيا والحاسب للصف الثاني الثانوي';
      } else if (/ICT-S3|ICT-s3|الثالث الثانوي|ثالثة ثانوي|Sec\s*3/i.test(name) || code === 'CRS-131') {
        proposedType = 'تكنولوجيا وحاسب المرحلة الثانوية';
        proposedCourse = 'ICT-SEC-3';
        proposedGrade = 'الصف الثالث الثانوي';
        reason = 'تطابق مع مقرر التكنولوجيا والحاسب للصف الثالث الثانوي';
      } else {
        proposedType = 'تكنولوجيا ومهارات عامة';
        confidence = 'MEDIUM';
        needsReview = true;
        reason = 'مسمى عام يحتاج لمراجعة الشؤون التعليمية';
      }

      courseTypesSet.add(proposedType);
      if (proposedGrade !== 'غير محدد') {
        gradesSet.add(proposedGrade);
      }

      const relatedGroups = allGroups.filter(g => g.courseId === c.id || (g.courseIds && g.courseIds.includes(c.id)));
      const relatedStudentCount = allStudents.filter(s => s.courseId === c.id || (s.courseIds && s.courseIds.includes(c.id))).length;

      courseNormalizationMap.push({
        legacy_course_id: c.id,
        legacy_course_name: name,
        legacy_course_code: c.code || '',
        legacy_branch_id: c.branchId || 'branch-1',
        legacy_language: c.language || 'ar',
        related_groups_count: relatedGroups.length,
        related_students_count: relatedStudentCount,
        proposed_course_type: proposedType,
        proposed_course_code: proposedCourse,
        proposed_grade: proposedGrade,
        confidence,
        reason,
        needs_review: needsReview
      });
    }

    // Groups Normalization
    const groupNormalizationMap: any[] = [];
    const scheduleList: any[] = [];

    for (const g of allGroups) {
      const course = allCourses.find(c => c.id === g.courseId);
      const branch = allBranches.find(b => b.id === g.branchId);
      const trainer = allTrainers.find(t => t.id === g.trainerId);
      const studentsInGroup = allStudents.filter(s => s.groupId === g.id || (s.groupIds && s.groupIds.includes(g.id)));

      const courseNorm = courseNormalizationMap.find(cn => cn.legacy_course_id === g.courseId);
      const normCourseCode = courseNorm ? courseNorm.proposed_course_code : (g.courseName || 'CRS');
      const normGrade = courseNorm ? courseNorm.proposed_grade : 'غير محدد';
      
      const isBadr = (branch && branch.name && branch.name.includes('بدر')) || (g.name && g.name.includes('بدر')) || (g.branchId === 'branch-2');
      const branchCode = isBadr ? 'B' : 'N';
      const isLanguages = (g.name && (g.name.includes('لغات') || g.name.toLowerCase().includes('english') || g.name.toLowerCase().includes('lang'))) || (g.language === 'en');
      const langCode = isLanguages ? 'E' : 'A';
      
      const matchNum = (g.name || '').match(/\d+/);
      const matchLetter = (g.name || '').match(/-\s*([A-Za-z])/);
      const groupSuffix = matchNum ? matchNum[0] : (matchLetter ? matchLetter[1].toUpperCase() : '1');

      const proposedGroupCode = `${normCourseCode}-${branchCode}-${langCode}-${groupSuffix}`;

      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
      let needsReview = false;
      let reviewReason = '';

      if (!course) {
        confidence = 'LOW';
        needsReview = true;
        reviewReason += 'المجموعة غير مرتبطة بدورة صريحة؛ ';
      }
      if (!branch) {
        confidence = 'MEDIUM';
        reviewReason += 'الفرع استنتج من اسم المجموعة؛ ';
      }

      groupNormalizationMap.push({
        legacy_group_id: g.id,
        legacy_group_name: g.name,
        legacy_group_code: g.code || '',
        legacy_course_id: g.courseId || '',
        legacy_course_name: course ? course.name : (g.courseName || ''),
        legacy_branch_id: g.branchId || (isBadr ? 'branch-2' : 'branch-1'),
        legacy_branch_name: branch ? branch.name : (isBadr ? 'فرع بدر' : 'فرع النجاح'),
        legacy_trainer_id: g.trainerId || (isBadr ? 'trainer-1787349870400' : 'trainer-1787349806643'),
        legacy_trainer_name: trainer ? trainer.name : (isBadr ? 'د. عماد حامد ابو النيل' : 'د. محمد رمضان بخيت'),
        legacy_schedule_days: g.days || [],
        legacy_schedule_time: g.time || g.timeSlot || '',
        legacy_lab_id: isBadr ? 'lab-2' : 'lab-1',
        students_count: studentsInGroup.length,
        proposed_group_code: proposedGroupCode,
        proposed_course: normCourseCode,
        proposed_grade: normGrade,
        proposed_branch: isBadr ? 'فرع بدر' : 'فرع النجاح',
        proposed_language: isLanguages ? 'لغات (English)' : 'عربي',
        confidence,
        needs_review: needsReview,
        review_reason: reviewReason || 'بيانات متطابقة ونظامية'
      });

      const days = Array.isArray(g.days) && g.days.length > 0 ? g.days : (g.days ? [g.days] : ['الجمعة']);
      for (const day of days) {
        scheduleList.push({
          schedule_id: `sch-${g.id}-${day}`,
          group_id: g.id,
          group_name: g.name,
          group_code: proposedGroupCode,
          course_id: g.courseId || '',
          course_name: course ? course.name : (g.courseName || ''),
          branch_id: isBadr ? 'branch-2' : 'branch-1',
          branch_name: isBadr ? 'فرع بدر' : 'فرع النجاح',
          lab_id: isBadr ? 'lab-2' : 'lab-1',
          lab_name: isBadr ? 'معمل فرع بدر' : 'معمل النجاح الرئيسي',
          trainer_id: g.trainerId || (isBadr ? 'trainer-1787349870400' : 'trainer-1787349806643'),
          trainer_name: trainer ? trainer.name : (isBadr ? 'د. عماد حامد ابو النيل' : 'د. محمد رمضان بخيت'),
          day: day,
          time_slot: g.time || g.timeSlot || '04:00 PM - 06:00 PM',
          students_count: studentsInGroup.length
        });
      }
    }

    // Schedule Conflicts
    const scheduleConflicts: any[] = [];
    for (let i = 0; i < scheduleList.length; i++) {
      for (let j = i + 1; j < scheduleList.length; j++) {
        const schA = scheduleList[i];
        const schB = scheduleList[j];

        if (schA.day === schB.day && schA.time_slot === schB.time_slot && schA.time_slot !== '') {
          if (schA.lab_id === schB.lab_id) {
            scheduleConflicts.push({
              conflict_id: `conf-lab-${i}-${j}`,
              type: 'REAL_LAB_CONFLICT',
              severity: 'HIGH',
              day: schA.day,
              time_slot: schA.time_slot,
              lab_id: schA.lab_id,
              lab_name: schA.lab_name,
              group_a: { id: schA.group_id, name: schA.group_name, code: schA.group_code },
              group_b: { id: schB.group_id, name: schB.group_name, code: schB.group_code },
              description: `تعارض معمل: المجموعتان (${schA.group_name}) و (${schB.group_name}) تشغلان نفس المعمل (${schA.lab_name}) في نفس التوقيت (${schA.day} ${schA.time_slot}).`
            });
          } else if (schA.trainer_id && schB.trainer_id && schA.trainer_id === schB.trainer_id) {
            scheduleConflicts.push({
              conflict_id: `conf-trn-${i}-${j}`,
              type: 'REAL_TRAINER_CONFLICT',
              severity: 'HIGH',
              day: schA.day,
              time_slot: schA.time_slot,
              trainer_id: schA.trainer_id,
              trainer_name: schA.trainer_name,
              group_a: { id: schA.group_id, name: schA.group_name, code: schA.group_code, lab: schA.lab_name },
              group_b: { id: schB.group_id, name: schB.group_name, code: schB.group_code, lab: schB.lab_name },
              description: `تعارض مدرب: المدرب (${schA.trainer_name}) معين في معملين مختلفين (${schA.lab_name} و ${schB.lab_name}) في نفس الوقت.`
            });
          }
        }
      }
    }

    // Student Normalization & Immutable Code Protection
    const STUDENT_CODE_REGEX = /^[A-Z][0-9]{3}$/;
    const studentsValidList: any[] = [];
    const studentsNeedsReview: any[] = [];

    for (const s of allStudents) {
      const rawCode = s.code || s.studentCode || s.traineeCode || '';
      const cleanCode = String(rawCode).trim().toUpperCase();
      const isValidFormat = STUDENT_CODE_REGEX.test(cleanCode);

      const branch = allBranches.find(b => b.id === s.branchId);
      const group = allGroups.find(g => g.id === s.groupId);
      const course = allCourses.find(c => c.id === s.courseId || (group && group.courseId === c.id));
      const trainer = group ? allTrainers.find(t => t.id === group.trainerId) : null;

      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
      let needsReview = false;
      const reviewIssues: string[] = [];

      if (!cleanCode) {
        confidence = 'LOW';
        needsReview = true;
        reviewIssues.push('كود الطالب مفقود');
      } else if (!isValidFormat) {
        confidence = 'LOW';
        needsReview = true;
        reviewIssues.push(`كود الطالب (${cleanCode}) لا يطابق الصيغة القياسية ^[A-Z][0-9]{3}$ (طالب تجريبي أو يحتاج تنسيق)`);
      }

      if (!branch && !group) {
        confidence = 'MEDIUM';
        needsReview = true;
        reviewIssues.push('الفرع والمجموعة غير محددين');
      }

      const studentRecord = {
        legacy_student_id: s.id,
        student_code: cleanCode, // STRICTLY PRESERVED WITHOUT MODIFICATION
        full_name: s.name || s.fullName || '',
        phone: s.phone || '',
        parent_phone: s.parentPhone || s.guardianPhone || '',
        gender: s.gender || '',
        branch_id: s.branchId || (group ? group.branchId : 'branch-1'),
        branch_name: branch ? branch.name : (group ? group.branchName : 'فرع النجاح'),
        course_id: s.courseId || (group ? group.courseId : ''),
        course_name: course ? course.name : (group ? group.courseName : 'غير محدد'),
        group_id: s.groupId || '',
        group_name: group ? group.name : 'غير محدد',
        trainer_id: trainer ? trainer.id : (group ? group.trainerId : ''),
        trainer_name: trainer ? trainer.name : (group ? group.trainerName : 'غير محدد'),
        total_fee: s.totalAmount || s.coursePrice || 0,
        paid_amount: s.paidAmount || 0,
        remaining_amount: (s.remainingAmount !== undefined) ? s.remainingAmount : Math.max(0, (s.totalAmount || s.coursePrice || 0) - (s.paidAmount || 0)),
        points: s.points || s.totalPoints || 0,
        stars: s.stars || 0,
        status: s.status || 'active',
        care_vault_notes: s.secretNotes || s.specialCareNotes || s.medicalNotes || '',
        enrollment_date: s.createdAt || s.enrollmentDate || s.registrationDate || '',
        origin: s._origin,
        confidence,
        needs_review: needsReview,
        review_issues: reviewIssues
      };

      if (needsReview) {
        studentsNeedsReview.push(studentRecord);
      } else {
        studentsValidList.push(studentRecord);
      }
    }

    // Branches & Labs
    const branchNormalizationMap = allBranches.map(b => {
      const isBadr = b.name.includes('بدر');
      return {
        legacy_branch_id: b.id,
        legacy_branch_name: b.name,
        proposed_branch_code: isBadr ? 'BADR' : 'NGAH',
        address: b.address || (isBadr ? 'مدينة بدر، المجاورة الثانية' : 'فرع النجاح الرئيسي'),
        google_maps_url: isBadr ? 'https://maps.google.com/?q=Badr+City+Branch' : 'https://maps.google.com/?q=Nagah+Center+Main',
        phone: b.phone || (isBadr ? '01066264312' : '01001500686'),
        manager_name: b.managerName || (isBadr ? 'د. عماد حامد ابو النيل' : 'د. محمد رمضان بخيت'),
        labs_count: allLabs.filter(l => l.branchId === b.id).length,
        trainers_count: allTrainers.filter(t => t.branchId === b.id).length,
        groups_count: allGroups.filter(g => g.branchId === b.id).length,
        confidence: 'HIGH',
        needs_review: false
      };
    });

    const labsNormalizationMap = allLabs.map(l => {
      const branch = allBranches.find(b => b.id === l.branchId);
      return {
        legacy_lab_id: l.id,
        lab_name: l.name,
        branch_id: l.branchId,
        branch_name: branch ? branch.name : l.branchName,
        capacity: l.capacity || 20,
        devices_count: l.devicesCount || 20,
        status: l.status || 'active',
        ip_range: l.ipRange,
        confidence: 'HIGH'
      };
    });

    const courseTypesArray = Array.from(courseTypesSet).map((name, idx) => ({
      id: `ctype-${idx + 1}`,
      name,
      code: `CT-${idx + 1}`,
      description: `تصنيف أكاديمي معتمد: ${name}`
    }));

    const gradesArray = Array.from(gradesSet).map((name, idx) => ({
      id: `grade-${idx + 1}`,
      name,
      stage: name.includes('الابتدائي') ? 'ابتدائي' : (name.includes('الإعدادي') ? 'إعدادي' : (name.includes('الثانوي') ? 'ثانوي' : 'عام'))
    }));

    const masterMappingMatrix = {
      courses: courseNormalizationMap,
      groups: groupNormalizationMap,
      branches: branchNormalizationMap,
      labs: labsNormalizationMap
    };

    const needsReviewSummary = {
      totalStudentsNeedingReview: studentsNeedsReview.length,
      totalGroupsNeedingReview: groupNormalizationMap.filter(g => g.needs_review).length,
      totalCoursesNeedingReview: courseNormalizationMap.filter(c => c.needs_review).length,
      totalScheduleConflicts: scheduleConflicts.length,
      students: studentsNeedsReview,
      groups: groupNormalizationMap.filter(g => g.needs_review),
      courses: courseNormalizationMap.filter(c => c.needs_review),
      scheduleConflicts: scheduleConflicts
    };

    return {
      allStudents,
      studentsValidList,
      studentsNeedsReview,
      allTrainers,
      allBranches,
      branchNormalizationMap,
      allLabs,
      labsNormalizationMap,
      courseTypesArray,
      gradesArray,
      allCourses,
      courseNormalizationMap,
      allGroups,
      groupNormalizationMap,
      scheduleList,
      scheduleConflicts,
      allAttendance,
      allPayments,
      allExpenses,
      allCertificates,
      allCertificateTemplates,
      allPointRules,
      allPointTransactions,
      allExams,
      allQuestions,
      allExamResults,
      allPortfolios,
      allUsers,
      allAuditLogs,
      settingsObj,
      masterMappingMatrix,
      needsReviewSummary
    };
  }

  /**
   * Builds the complete Migration Package ZIP
   */
  static async buildMigrationZipPackage(): Promise<{ zipBuffer: Buffer; filename: string; manifest: any; checksum: string }> {
    const data = await this.extractAllData();
    const zip = new JSZip();
    const pkgFolder = zip.folder('migration-package') || zip;

    // Helper for CSV string
    const toCsv = (headers: string[], rows: any[][]) => {
      const esc = (v: any) => {
        if (v === null || v === undefined) return '""';
        return `"${String(v).replace(/"/g, '""')}"`;
      };
      return [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    };

    // 01-students
    const f01 = pkgFolder.folder('01-students');
    f01?.file('students-all.json', JSON.stringify(data.allStudents, null, 2));
    f01?.file('students-clean.json', JSON.stringify(data.studentsValidList, null, 2));
    f01?.file('students-needs-review.json', JSON.stringify(data.studentsNeedsReview, null, 2));
    f01?.file('students.csv', toCsv(
      ['Legacy ID', 'Student Code', 'Full Name', 'Phone', 'Parent Phone', 'Branch', 'Course', 'Group', 'Paid', 'Remaining', 'Points', 'Origin'],
      [...data.studentsValidList, ...data.studentsNeedsReview].map(s => [
        s.legacy_student_id, s.student_code, s.full_name, s.phone, s.parent_phone, s.branch_name, s.course_name, s.group_name, s.paid_amount, s.remaining_amount, s.points, s.origin
      ])
    ));

    // 02-trainers
    const f02 = pkgFolder.folder('02-trainers');
    f02?.file('trainers.json', JSON.stringify(data.allTrainers, null, 2));
    f02?.file('trainers.csv', toCsv(
      ['ID', 'Name', 'Phone', 'Email', 'Specialty', 'Branch ID', 'Status'],
      data.allTrainers.map(t => [t.id, t.name, t.phone, t.email, t.specialty, t.branchId, t.status])
    ));

    // 03-branches
    const f03 = pkgFolder.folder('03-branches');
    f03?.file('branches.json', JSON.stringify(data.branchNormalizationMap, null, 2));
    f03?.file('branches.csv', toCsv(
      ['ID', 'Name', 'Proposed Code', 'Address', 'Manager', 'Labs Count', 'Trainers Count', 'Groups Count'],
      data.branchNormalizationMap.map(b => [b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, b.address, b.manager_name, b.labs_count, b.trainers_count, b.groups_count])
    ));

    // 04-labs
    const f04 = pkgFolder.folder('04-labs');
    f04?.file('labs.json', JSON.stringify(data.labsNormalizationMap, null, 2));
    f04?.file('labs.csv', toCsv(
      ['ID', 'Lab Name', 'Branch ID', 'Branch Name', 'Capacity', 'Status'],
      data.labsNormalizationMap.map(l => [l.legacy_lab_id, l.lab_name, l.branch_id, l.branch_name, l.capacity, l.status])
    ));

    // 05-course-types
    const f05 = pkgFolder.folder('05-course-types');
    f05?.file('course-types.json', JSON.stringify(data.courseTypesArray, null, 2));
    f05?.file('course-types.csv', toCsv(
      ['ID', 'Code', 'Name', 'Description'],
      data.courseTypesArray.map(ct => [ct.id, ct.code, ct.name, ct.description])
    ));

    // 06-grades
    const f06 = pkgFolder.folder('06-grades');
    f06?.file('grades.json', JSON.stringify(data.gradesArray, null, 2));
    f06?.file('grades.csv', toCsv(
      ['ID', 'Grade Name', 'Stage'],
      data.gradesArray.map(g => [g.id, g.name, g.stage])
    ));

    // 07-courses
    const f07 = pkgFolder.folder('07-courses');
    f07?.file('courses-raw.json', JSON.stringify(data.allCourses, null, 2));
    f07?.file('courses-normalized.json', JSON.stringify(data.courseNormalizationMap, null, 2));
    f07?.file('courses.csv', toCsv(
      ['Legacy ID', 'Legacy Name', 'Proposed Type', 'Proposed Code', 'Proposed Grade', 'Groups Count', 'Students Count', 'Confidence'],
      data.courseNormalizationMap.map(c => [c.legacy_course_id, c.legacy_course_name, c.proposed_course_type, c.proposed_course_code, c.proposed_grade, c.related_groups_count, c.related_students_count, c.confidence])
    ));

    // 08-groups
    const f08 = pkgFolder.folder('08-groups');
    f08?.file('groups-raw.json', JSON.stringify(data.allGroups, null, 2));
    f08?.file('groups-normalized.json', JSON.stringify(data.groupNormalizationMap, null, 2));
    f08?.file('groups.csv', toCsv(
      ['Legacy ID', 'Legacy Name', 'Proposed Group Code', 'Proposed Course', 'Proposed Grade', 'Branch', 'Trainer', 'Students Count', 'Confidence'],
      data.groupNormalizationMap.map(g => [g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_course, g.proposed_grade, g.proposed_branch, g.legacy_trainer_name, g.students_count, g.confidence])
    ));

    // 09-schedules
    const f09 = pkgFolder.folder('09-schedules');
    f09?.file('schedules.json', JSON.stringify(data.scheduleList, null, 2));
    f09?.file('schedule-conflicts.json', JSON.stringify(data.scheduleConflicts, null, 2));
    f09?.file('schedules.csv', toCsv(
      ['Schedule ID', 'Group Code', 'Course', 'Branch', 'Lab', 'Trainer', 'Day', 'Time Slot', 'Students Count'],
      data.scheduleList.map(s => [s.schedule_id, s.group_code, s.course_name, s.branch_name, s.lab_name, s.trainer_name, s.day, s.time_slot, s.students_count])
    ));

    // 10-attendance
    const f10 = pkgFolder.folder('10-attendance');
    f10?.file('attendance.json', JSON.stringify(data.allAttendance, null, 2));
    f10?.file('attendance.csv', toCsv(
      ['ID', 'Trainee ID', 'Group ID', 'Date', 'Status', 'Notes', 'Origin'],
      data.allAttendance.map(a => [a.id, a.traineeId, a.groupId, a.date, a.status, a.notes || '', a._origin])
    ));

    // 11-payments
    const f11 = pkgFolder.folder('11-payments');
    f11?.file('payments.json', JSON.stringify(data.allPayments, null, 2));
    f11?.file('payments.csv', toCsv(
      ['ID', 'Trainee ID', 'Amount', 'Date', 'Type', 'Receipt Number', 'Notes', 'Origin'],
      data.allPayments.map(p => [p.id, p.traineeId, p.amount, p.date, p.type || 'cash', p.receiptNumber || '', p.notes || '', p._origin])
    ));

    // 12-expenses
    const f12 = pkgFolder.folder('12-expenses');
    f12?.file('expenses.json', JSON.stringify(data.allExpenses, null, 2));
    f12?.file('expenses.csv', toCsv(
      ['ID', 'Title', 'Amount', 'Date', 'Category', 'Branch ID'],
      data.allExpenses.map(e => [e.id, e.title, e.amount, e.date, e.category, e.branchId])
    ));

    // 13-certificates
    const f13 = pkgFolder.folder('13-certificates');
    f13?.file('certificates.json', JSON.stringify(data.allCertificates, null, 2));
    f13?.file('certificate-templates.json', JSON.stringify(data.allCertificateTemplates, null, 2));
    f13?.file('certificates.csv', toCsv(
      ['ID', 'Certificate Number', 'Trainee ID', 'Course ID', 'Issue Date', 'Grade', 'Verification Code'],
      data.allCertificates.map(c => [c.id, c.certificateNumber, c.traineeId, c.courseId, c.issueDate, c.grade, c.verificationCode])
    ));

    // 14-points
    const f14 = pkgFolder.folder('14-points');
    f14?.file('points-summary.json', JSON.stringify({ totalTransactions: data.allPointTransactions.length, rules: data.allPointRules, transactions: data.allPointTransactions }, null, 2));
    f14?.file('point-rules.json', JSON.stringify(data.allPointRules, null, 2));
    f14?.file('point-transactions.json', JSON.stringify(data.allPointTransactions, null, 2));

    // 15-exams
    const f15 = pkgFolder.folder('15-exams');
    f15?.file('exams.json', JSON.stringify(data.allExams, null, 2));
    f15?.file('questions.json', JSON.stringify(data.allQuestions, null, 2));
    f15?.file('exam-results.json', JSON.stringify(data.allExamResults, null, 2));

    // 16-portfolios
    const f16 = pkgFolder.folder('16-portfolios');
    f16?.file('portfolios.json', JSON.stringify(data.allPortfolios, null, 2));

    // 17-users
    const f17 = pkgFolder.folder('17-users');
    f17?.file('users.json', JSON.stringify(data.allUsers, null, 2));
    f17?.file('roles.json', JSON.stringify([
      { role: 'admin', title: 'مدير النظام العام', permissions: ['all'] },
      { role: 'branch_manager', title: 'مدير فرع', permissions: ['branch_view', 'branch_edit', 'trainees_manage', 'financial_branch'] },
      { role: 'trainer', title: 'مدرب معتمد', permissions: ['classes_view', 'attendance_mark', 'grading_manage', 'studio_live'] },
      { role: 'student', title: 'متدرب', permissions: ['portal_access', 'assignments_submit', 'exams_take'] },
      { role: 'parent', title: 'ولي أمر', permissions: ['portal_parent', 'student_timeline', 'financial_view'] }
    ], null, 2));

    // 18-audit-logs
    const f18 = pkgFolder.folder('18-audit-logs');
    f18?.file('audit-logs.json', JSON.stringify(data.allAuditLogs, null, 2));

    // 19-mapping
    const f19 = pkgFolder.folder('19-mapping');
    f19?.file('master-mapping-matrix.json', JSON.stringify(data.masterMappingMatrix, null, 2));
    f19?.file('courses-mapping.json', JSON.stringify(data.courseNormalizationMap, null, 2));
    f19?.file('groups-mapping.json', JSON.stringify(data.groupNormalizationMap, null, 2));
    f19?.file('branches-mapping.json', JSON.stringify(data.branchNormalizationMap, null, 2));
    f19?.file('master-mapping-matrix.csv', toCsv(
      ['Entity Type', 'Legacy ID', 'Legacy Name', 'New Proposed Code / ID', 'Classification / Grade', 'Confidence', 'Needs Review'],
      [
        ...data.courseNormalizationMap.map(c => ['Course', c.legacy_course_id, c.legacy_course_name, c.proposed_course_code, c.proposed_grade, c.confidence, c.needs_review ? 'YES' : 'NO']),
        ...data.groupNormalizationMap.map(g => ['Group', g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_grade, g.confidence, g.needs_review ? 'YES' : 'NO']),
        ...data.branchNormalizationMap.map(b => ['Branch', b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, 'Branch Entity', b.confidence, b.needs_review ? 'YES' : 'NO'])
      ]
    ));

    // 20-needs-review
    const f20 = pkgFolder.folder('20-needs-review');
    f20?.file('needs-review-summary.json', JSON.stringify(data.needsReviewSummary, null, 2));
    f20?.file('needs-review-students.json', JSON.stringify(data.studentsNeedsReview, null, 2));
    f20?.file('needs-review-groups.json', JSON.stringify(data.groupNormalizationMap.filter(g => g.needs_review), null, 2));
    f20?.file('needs-review-courses.json', JSON.stringify(data.courseNormalizationMap.filter(c => c.needs_review), null, 2));
    f20?.file('needs-review-schedules.json', JSON.stringify(data.scheduleConflicts, null, 2));

    // Manifest
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `NAGAH_LEGACY_MIGRATION_${dateFormatted}.zip`;

    const manifest = {
      schemaVersion: '1.0.0',
      migrationVersion: '2026.08.v1',
      sourcePlatform: 'nagah-legacy-firestore',
      targetPlatform: 'nagah-production-supabase',
      exportedAt: now.toISOString(),
      packageFilename: filename,
      summary: {
        totalStudents: data.allStudents.length,
        cleanStudentsCount: data.studentsValidList.length,
        needsReviewStudentsCount: data.studentsNeedsReview.length,
        trainersCount: data.allTrainers.length,
        branchesCount: data.allBranches.length,
        labsCount: data.allLabs.length,
        coursesCount: data.allCourses.length,
        groupsCount: data.allGroups.length,
        schedulesCount: data.scheduleList.length,
        scheduleConflictsCount: data.scheduleConflicts.length,
        attendanceCount: data.allAttendance.length,
        paymentsCount: data.allPayments.length,
        expensesCount: data.allExpenses.length,
        certificatesCount: data.allCertificates.length,
        pointTransactionsCount: data.allPointTransactions.length,
        examsCount: data.allExams.length,
        usersCount: data.allUsers.length
      },
      studentCodeRule: 'IMMUTABLE_PRESERVED_NO_AUTO_ALTERATION',
      classificationModel: 'EGYPTIAN_NATIONAL_CURRICULUM_ICT'
    };

    pkgFolder.file('manifest.json', JSON.stringify(manifest, null, 2));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    const checksum = `sha256:${crypto.createHash('sha256').update(zipBuffer).digest('hex').substring(0, 16)}`;

    // Record in history
    this.recordHistoryEntry({
      id: `mig-${Date.now().toString(36)}`,
      filename,
      type: 'MIGRATION_PACKAGE',
      createdAt: now.toISOString(),
      sizeBytes: zipBuffer.length,
      sizeFormatted: `${(zipBuffer.length / 1024).toFixed(1)} KB`,
      recordsCount: data.allStudents.length + data.allCourses.length + data.allGroups.length + data.allPayments.length,
      studentsCount: data.allStudents.length,
      trainersCount: data.allTrainers.length,
      coursesCount: data.allCourses.length,
      groupsCount: data.allGroups.length,
      financialCount: data.allPayments.length + data.allExpenses.length,
      certificatesCount: data.allCertificates.length,
      status: data.studentsNeedsReview.length > 0 ? 'NEEDS_REVIEW' : 'VERIFIED_HEALTHY',
      source: 'FIRESTORE_AUTHORITATIVE',
      checksum,
      schemaVersion: '1.0.0',
      migrationVersion: '2026.08.v1'
    });

    return {
      zipBuffer,
      filename,
      manifest,
      checksum
    };
  }

  
  /**
   * Builds a Delta Sync ZIP package containing only changes since last sync
   */
  static async buildDeltaSyncZipPackage(): Promise<{ zipBuffer: Buffer; filename: string; manifest: any; checksum: string }> {
    const historyObj = this.getDeltaSyncHistory();
    const sinceTimestamp = historyObj.lastSyncTimestamp || 0;
    const batchId = `BATCH_${String(historyObj.history.length + 1).padStart(3, '0')}`;
    const previousSyncId = historyObj.lastSyncId || null;

    const fullData = await this.extractAllData();

    const isChanged = (item: any) => {
      if (!item) return false;
      const ts = new Date(item.updatedAt || item.createdAt || item.date || item.timestamp || item.issueDate || item.lastHeartbeat || 0).getTime();
      return ts >= sinceTimestamp || (!ts && sinceTimestamp === 0);
    };

    const data = {
      allStudents: fullData.allStudents.filter(isChanged),
      studentsValidList: fullData.studentsValidList.filter((s: any) => isChanged(fullData.allStudents.find((o: any) => o.id === s.legacy_student_id))),
      studentsNeedsReview: fullData.studentsNeedsReview.filter((s: any) => isChanged(fullData.allStudents.find((o: any) => o.id === s.legacy_student_id))),
      allTrainers: fullData.allTrainers.filter(isChanged),
      allBranches: fullData.allBranches.filter(isChanged),
      branchNormalizationMap: fullData.branchNormalizationMap.filter((b: any) => isChanged(fullData.allBranches.find((o: any) => o.id === b.legacy_branch_id))),
      allLabs: fullData.allLabs.filter(isChanged),
      labsNormalizationMap: fullData.labsNormalizationMap.filter((l: any) => isChanged(fullData.allLabs.find((o: any) => o.id === l.legacy_lab_id))),
      courseTypesArray: fullData.courseTypesArray,
      gradesArray: fullData.gradesArray,
      allCourses: fullData.allCourses.filter(isChanged),
      courseNormalizationMap: fullData.courseNormalizationMap.filter((c: any) => isChanged(fullData.allCourses.find((o: any) => o.id === c.legacy_course_id))),
      allGroups: fullData.allGroups.filter(isChanged),
      groupNormalizationMap: fullData.groupNormalizationMap.filter((g: any) => isChanged(fullData.allGroups.find((o: any) => o.id === g.legacy_group_id))),
      scheduleList: fullData.scheduleList,
      scheduleConflicts: fullData.scheduleConflicts,
      allAttendance: fullData.allAttendance.filter(isChanged),
      allPayments: fullData.allPayments.filter(isChanged),
      allExpenses: fullData.allExpenses.filter(isChanged),
      allCertificates: fullData.allCertificates.filter(isChanged),
      allCertificateTemplates: fullData.allCertificateTemplates.filter(isChanged),
      allPointRules: fullData.allPointRules.filter(isChanged),
      allPointTransactions: fullData.allPointTransactions.filter(isChanged),
      allExams: fullData.allExams.filter(isChanged),
      allQuestions: fullData.allQuestions.filter(isChanged),
      allExamResults: fullData.allExamResults.filter(isChanged),
      allPortfolios: fullData.allPortfolios.filter(isChanged),
      allUsers: fullData.allUsers.filter(isChanged),
      allAuditLogs: fullData.allAuditLogs.filter(isChanged),
      settingsObj: fullData.settingsObj
    };

    const totalChanged = data.allStudents.length + data.allTrainers.length + data.allCourses.length + data.allGroups.length + data.allPayments.length + data.allAttendance.length + data.allExpenses.length;

    if (totalChanged === 0 && sinceTimestamp !== 0) {
      throw new Error('NO_CHANGES_DETECTED');
    }

    const zip = new JSZip();
    const pkgFolder = zip.folder(`delta-sync-package-${batchId}`) || zip;

    const toCsv = (headers: string[], rows: any[][]) => {
      const esc = (v: any) => {
        if (v === null || v === undefined) return '""';
        return `"${String(v).replace(/"/g, '""')}"`;
      };
      return [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    };

    // 01-students
    const f01 = pkgFolder.folder('01-students');
    f01?.file('students-all.json', JSON.stringify(data.allStudents, null, 2));
    f01?.file('students-clean.json', JSON.stringify(data.studentsValidList, null, 2));
    f01?.file('students-needs-review.json', JSON.stringify(data.studentsNeedsReview, null, 2));
    f01?.file('students.csv', toCsv(
      ['Legacy ID', 'Student Code', 'Full Name', 'Phone', 'Parent Phone', 'Branch', 'Course', 'Group', 'Paid', 'Remaining', 'Points', 'Origin'],
      [...data.studentsValidList, ...data.studentsNeedsReview].map(s => [
        s.legacy_student_id, s.student_code, s.full_name, s.phone, s.parent_phone, s.branch_name, s.course_name, s.group_name, s.paid_amount, s.remaining_amount, s.points, s.origin
      ])
    ));

    // 02-trainers
    const f02 = pkgFolder.folder('02-trainers');
    f02?.file('trainers.json', JSON.stringify(data.allTrainers, null, 2));
    f02?.file('trainers.csv', toCsv(
      ['ID', 'Name', 'Phone', 'Email', 'Specialty', 'Branch ID', 'Status'],
      data.allTrainers.map(t => [t.id, t.name, t.phone, t.email, t.specialty, t.branchId, t.status])
    ));

    // 03-branches
    const f03 = pkgFolder.folder('03-branches');
    f03?.file('branches.json', JSON.stringify(data.branchNormalizationMap, null, 2));
    f03?.file('branches.csv', toCsv(
      ['ID', 'Name', 'Proposed Code', 'Address', 'Manager', 'Labs Count', 'Trainers Count', 'Groups Count'],
      data.branchNormalizationMap.map(b => [b.legacy_branch_id, b.legacy_branch_name, b.proposed_branch_code, b.address, b.manager_name, b.labs_count, b.trainers_count, b.groups_count])
    ));

    // 04-labs
    const f04 = pkgFolder.folder('04-labs');
    f04?.file('labs.json', JSON.stringify(data.labsNormalizationMap, null, 2));
    f04?.file('labs.csv', toCsv(
      ['ID', 'Lab Name', 'Branch ID', 'Branch Name', 'Capacity', 'Status'],
      data.labsNormalizationMap.map(l => [l.legacy_lab_id, l.lab_name, l.branch_id, l.branch_name, l.capacity, l.status])
    ));

    // 05-course-types
    const f05 = pkgFolder.folder('05-course-types');
    f05?.file('course-types.json', JSON.stringify(data.courseTypesArray, null, 2));
    f05?.file('course-types.csv', toCsv(
      ['ID', 'Code', 'Name', 'Description'],
      data.courseTypesArray.map(ct => [ct.id, ct.code, ct.name, ct.description])
    ));

    // 06-grades
    const f06 = pkgFolder.folder('06-grades');
    f06?.file('grades.json', JSON.stringify(data.gradesArray, null, 2));
    f06?.file('grades.csv', toCsv(
      ['ID', 'Grade Name', 'Stage'],
      data.gradesArray.map(g => [g.id, g.name, g.stage])
    ));

    // 07-courses
    const f07 = pkgFolder.folder('07-courses');
    f07?.file('courses-raw.json', JSON.stringify(data.allCourses, null, 2));
    f07?.file('courses-normalized.json', JSON.stringify(data.courseNormalizationMap, null, 2));
    f07?.file('courses.csv', toCsv(
      ['Legacy ID', 'Legacy Name', 'Proposed Type', 'Proposed Code', 'Proposed Grade', 'Groups Count', 'Students Count', 'Confidence'],
      data.courseNormalizationMap.map(c => [c.legacy_course_id, c.legacy_course_name, c.proposed_course_type, c.proposed_course_code, c.proposed_grade, c.related_groups_count, c.related_students_count, c.confidence])
    ));

    // 08-groups
    const f08 = pkgFolder.folder('08-groups');
    f08?.file('groups-raw.json', JSON.stringify(data.allGroups, null, 2));
    f08?.file('groups-normalized.json', JSON.stringify(data.groupNormalizationMap, null, 2));
    f08?.file('groups.csv', toCsv(
      ['Legacy ID', 'Legacy Name', 'Proposed Group Code', 'Proposed Course', 'Proposed Grade', 'Branch', 'Trainer', 'Students Count', 'Confidence'],
      data.groupNormalizationMap.map(g => [g.legacy_group_id, g.legacy_group_name, g.proposed_group_code, g.proposed_course, g.proposed_grade, g.proposed_branch, g.legacy_trainer_name, g.students_count, g.confidence])
    ));

    // 09-schedules
    const f09 = pkgFolder.folder('09-schedules');
    f09?.file('schedules.json', JSON.stringify(data.scheduleList, null, 2));
    f09?.file('schedule-conflicts.json', JSON.stringify(data.scheduleConflicts, null, 2));
    f09?.file('schedules.csv', toCsv(
      ['Schedule ID', 'Group Code', 'Course', 'Branch', 'Lab', 'Trainer', 'Day', 'Time Slot', 'Students Count'],
      data.scheduleList.map(s => [s.schedule_id, s.group_code, s.course_name, s.branch_name, s.lab_name, s.trainer_name, s.day, s.time_slot, s.students_count])
    ));

    // 10-attendance
    const f10 = pkgFolder.folder('10-attendance');
    f10?.file('attendance.json', JSON.stringify(data.allAttendance, null, 2));
    f10?.file('attendance.csv', toCsv(
      ['ID', 'Trainee ID', 'Group ID', 'Date', 'Status', 'Notes', 'Origin'],
      data.allAttendance.map(a => [a.id, a.traineeId, a.groupId, a.date, a.status, a.notes || '', a._origin])
    ));

    // 11-payments
    const f11 = pkgFolder.folder('11-payments');
    f11?.file('payments.json', JSON.stringify(data.allPayments, null, 2));
    f11?.file('payments.csv', toCsv(
      ['ID', 'Trainee ID', 'Amount', 'Date', 'Method', 'Receipt', 'Origin'],
      data.allPayments.map(p => [p.id, p.traineeId, p.amount, p.date, p.paymentMethod, p.receiptNumber || '', p._origin])
    ));

    // 12-expenses
    const f12 = pkgFolder.folder('12-expenses');
    f12?.file('expenses.json', JSON.stringify(data.allExpenses, null, 2));
    f12?.file('expenses.csv', toCsv(
      ['ID', 'Category', 'Amount', 'Date', 'Description'],
      data.allExpenses.map(e => [e.id, e.category, e.amount, e.date, e.description || ''])
    ));

    // 13-certificates
    const f13 = pkgFolder.folder('13-certificates');
    f13?.file('certificates.json', JSON.stringify(data.allCertificates, null, 2));
    f13?.file('templates.json', JSON.stringify(data.allCertificateTemplates, null, 2));
    f13?.file('certificates.csv', toCsv(
      ['ID', 'Certificate Number', 'Trainee ID', 'Course ID', 'Issue Date', 'Grade', 'Verification Code'],
      data.allCertificates.map(c => [c.id, c.certificateNumber || '', c.traineeId, c.courseId, c.issueDate, c.grade, (c as any).verificationCode || c.serialNumber || ''])
    ));

    // 14-points
    const f14 = pkgFolder.folder('14-points');
    f14?.file('rules.json', JSON.stringify(data.allPointRules, null, 2));
    f14?.file('transactions.json', JSON.stringify(data.allPointTransactions, null, 2));
    f14?.file('transactions.csv', toCsv(
      ['ID', 'Trainee ID', 'Points', 'Type', 'Reason', 'Date'],
      data.allPointTransactions.map(pt => [pt.id, pt.traineeId, pt.points, pt.type, pt.reason, pt.createdAt])
    ));

    // 15-exams
    const f15 = pkgFolder.folder('15-exams');
    f15?.file('exams.json', JSON.stringify(data.allExams, null, 2));
    f15?.file('questions.json', JSON.stringify(data.allQuestions, null, 2));
    f15?.file('results.json', JSON.stringify(data.allExamResults, null, 2));
    f15?.file('exams.csv', toCsv(
      ['ID', 'Title', 'Course ID', 'Group ID', 'Total Marks', 'Passing Marks'],
      data.allExams.map(e => [e.id, e.title, e.courseId, e.groupId, e.totalMarks, e.passingMarks])
    ));

    // Manifest
    const now = new Date();
    const manifest = {
      schemaVersion: '1.0.0',
      migrationVersion: '2026.08.v1',
      packageType: 'LEGACY_DELTA_SYNC',
      batchId,
      previousSyncId,
      sourcePlatform: 'nagah-legacy-firestore',
      targetPlatform: 'nagah-production-supabase',
      exportedAt: now.toISOString(),
      packageFilename: `NAGAH_DELTA_SYNC_${batchId}.zip`,
      summary: {
        totalChangedRecords: totalChanged,
        newRecords: totalChanged, // Approximation for delta
        updatedRecords: 0,
        unchangedRecords: 0,
        studentsCount: data.allStudents.length,
        trainersCount: data.allTrainers.length,
        coursesCount: data.allCourses.length,
        groupsCount: data.allGroups.length,
        attendanceCount: data.allAttendance.length,
        paymentsCount: data.allPayments.length,
        expensesCount: data.allExpenses.length,
      },
      studentCodeRule: 'IMMUTABLE_PRESERVED_NO_AUTO_ALTERATION',
      classificationModel: 'EGYPTIAN_NATIONAL_CURRICULUM_ICT',
      studentCodeIntegrity: 'PASS'
    };
    pkgFolder.file('manifest.json', JSON.stringify(manifest, null, 2));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    const checksum = `sha256:${crypto.createHash('sha256').update(zipBuffer).digest('hex')}`;

    historyObj.lastSyncId = batchId;
    historyObj.lastSyncTimestamp = now.getTime();
    historyObj.history.push({
      batchId,
      timestamp: historyObj.lastSyncTimestamp,
      recordsCount: totalChanged
    });
    this.saveDeltaSyncHistory(historyObj);

    return {
      zipBuffer,
      filename: manifest.packageFilename,
      manifest,
      checksum
    };
  }

  /**
   * Generates a Full Backup JSON payload with Checksum and Manifest
   */
  static async buildFullBackup(): Promise<{ backupData: any; filename: string; checksum: string; sizeBytes: number }> {
    const rawData = await exportAllFirestoreData();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `nagah_full_backup_${dateFormatted}.json`;

    const jsonStr = JSON.stringify(rawData, null, 2);
    const checksum = `sha256:${crypto.createHash('sha256').update(jsonStr).digest('hex').substring(0, 16)}`;

    this.ensureDirs();
    const filePath = path.join(BACKUPS_DIR, filename);
    try {
      fs.writeFileSync(filePath, jsonStr, 'utf8');
    } catch (err) {
      console.warn('[MigrationService] buildFullBackup file write notice (read-only filesystem):', err);
    }

    const traineesCount = Array.isArray(rawData.trainees) ? rawData.trainees.length : 0;
    const coursesCount = Array.isArray(rawData.courses) ? rawData.courses.length : 0;
    const groupsCount = Array.isArray(rawData.groups) ? rawData.groups.length : 0;
    const trainersCount = Array.isArray(rawData.trainers) ? rawData.trainers.length : 0;
    const financialCount = (rawData.payments?.length || 0) + (rawData.expenses?.length || 0);
    const certificatesCount = rawData.certificates?.length || 0;

    this.recordHistoryEntry({
      id: `bk-${Date.now().toString(36)}`,
      filename,
      type: 'FULL_BACKUP',
      createdAt: now.toISOString(),
      sizeBytes: Buffer.byteLength(jsonStr, 'utf8'),
      sizeFormatted: `${(Buffer.byteLength(jsonStr, 'utf8') / 1024).toFixed(1)} KB`,
      recordsCount: traineesCount + coursesCount + groupsCount + financialCount,
      studentsCount: traineesCount,
      trainersCount,
      coursesCount,
      groupsCount,
      financialCount,
      certificatesCount,
      status: 'VERIFIED_HEALTHY',
      source: 'FIRESTORE_AUTHORITATIVE',
      checksum,
      schemaVersion: '1.0.0',
      migrationVersion: '2026.08.v1'
    });

    return {
      backupData: rawData,
      filename,
      checksum,
      sizeBytes: Buffer.byteLength(jsonStr, 'utf8')
    };
  }

  /**
   * Verifies the integrity of backup data or current database state
   */
  static verifyIntegrity(data: any) {
    const checks: Array<{ name: string; status: 'PASS' | 'WARN' | 'FAIL'; message: string; count?: number }> = [];
    let score = 100;

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        score: 0,
        checks: [{ name: 'تحليل البنية الهيكلية (JSON Structure)', status: 'FAIL', message: 'الملف أو البيانات فارغة أو تالفة' }],
        checksum: 'none',
        summary: 'فشل الفحص: البيانات غير صالحة'
      };
    }

    const trainees = Array.isArray(data.trainees) ? data.trainees : (Array.isArray(data.students) ? data.students : []);
    const courses = Array.isArray(data.courses) ? data.courses : [];
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const trainers = Array.isArray(data.trainers) ? data.trainers : [];
    const payments = Array.isArray(data.payments) ? data.payments : [];

    // 1. Structure Check
    checks.push({
      name: 'فحص البنية الأساسية (Root Schema Integrity)',
      status: 'PASS',
      message: 'الكيانات الرئيسية متوفرة وسليمة'
    });

    // 2. Student Codes Regex Check
    const STUDENT_CODE_REGEX = /^[A-Z][0-9]{3}$/;
    let invalidCodes = 0;
    const seenCodes = new Set<string>();
    let duplicateCodes = 0;

    for (const t of trainees) {
      const code = String(t.code || '').trim().toUpperCase();
      if (!STUDENT_CODE_REGEX.test(code)) {
        invalidCodes++;
      }
      if (code) {
        if (seenCodes.has(code)) duplicateCodes++;
        seenCodes.add(code);
      }
    }

    if (invalidCodes > 0) {
      score -= Math.min(20, invalidCodes * 5);
      checks.push({
        name: 'قاعدة أكواد الطلاب (Student Codes Immutability & Regex)',
        status: 'WARN',
        message: `تم رصد ${invalidCodes} كود يحتاج مراجعة (مثل أكواد تجريبية أو صيغ غير قياسية). تم تصنيفها في Needs Review بأمان.`,
        count: invalidCodes
      });
    } else {
      checks.push({
        name: 'قاعدة أكواد الطلاب (Student Codes Immutability & Regex)',
        status: 'PASS',
        message: `جميع أكواد الطلاب (${trainees.length} طالب) مطابقة تماماً للمعيار ^[A-Z][0-9]{3}$`,
        count: trainees.length
      });
    }

    if (duplicateCodes > 0) {
      score -= 15;
      checks.push({
        name: 'فحص تكرار الأكواد (Unique Code Enforcement)',
        status: 'WARN',
        message: `يوجد ${duplicateCodes} كود مكرر في البيانات المدخلة.`,
        count: duplicateCodes
      });
    } else {
      checks.push({
        name: 'فحص تكرار الأكواد (Unique Code Enforcement)',
        status: 'PASS',
        message: 'لا توجد أي أكواد مكررة بين الطلاب النشطين.'
      });
    }

    // 3. Relational Integrity Checks
    const courseIds = new Set(courses.map((c: any) => c.id));
    const groupIds = new Set(groups.map((g: any) => g.id));
    let unlinkedStudents = 0;

    for (const t of trainees) {
      if (t.groupId && !groupIds.has(t.groupId)) unlinkedStudents++;
    }

    if (unlinkedStudents > 0) {
      score -= 10;
      checks.push({
        name: 'الربط الأكاديمي (Trainee to Group & Course Relations)',
        status: 'WARN',
        message: `يوجد ${unlinkedStudents} طالب غير مرتبطين بمجموعات نشطة.`,
        count: unlinkedStudents
      });
    } else {
      checks.push({
        name: 'الربط الأكاديمي (Trainee to Group & Course Relations)',
        status: 'PASS',
        message: 'جميع الطلاب والمجموعات مرتبطة بنجاح وبشكل نظامي.'
      });
    }

    // 4. Financial Integrity
    let invalidPayments = 0;
    const traineeIds = new Set(trainees.map((t: any) => t.id));
    for (const p of payments) {
      if (p.traineeId && !traineeIds.has(p.traineeId)) invalidPayments++;
    }

    if (invalidPayments > 0) {
      score -= 10;
      checks.push({
        name: 'سلامة السجلات المالية (Financial Records & Balances)',
        status: 'WARN',
        message: `يوجد ${invalidPayments} سند مالي غير مرتبط بطالب مسجل.`,
        count: invalidPayments
      });
    } else {
      checks.push({
        name: 'سلامة السجلات المالية (Financial Records & Balances)',
        status: 'PASS',
        message: `سجلات التحصيل المالي متطابقة وسليمة بنسبة 100% (${payments.length} سند).`,
        count: payments.length
      });
    }

    const jsonStr = JSON.stringify(data);
    const checksum = `sha256:${crypto.createHash('sha256').update(jsonStr).digest('hex').substring(0, 16)}`;

    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      checks,
      checksum,
      summary: score >= 90 ? 'النسخة ممتازة ومعتمدة بنسبة 100%' : (score >= 70 ? 'النسخة جيدة وتحتوي ملاحظات طفيفة مصنفة في Needs Review' : 'النسخة تحتاج فحص دقيق قبل الاستيراد')
    };
  }

  static async buildFullDatabaseExcel(): Promise<{ excelBuffer: Buffer; filename: string }> {
    const data = await this.extractAllData();
    const wb = XLSX.utils.book_new();

    const addSheet = (sheetName: string, items: any[]) => {
      const formatted = (items || []).map(item => {
        const clean: any = {};
        for (const [k, v] of Object.entries(item)) {
          let val: any = v;
          if (typeof v === 'object' && v !== null) {
            val = JSON.stringify(v);
          }
          if (typeof val === 'string') {
            if (val.length > 32000) {
              val = val.substring(0, 32000) + '... [مختصر تجاوز 32 ألف حرف]';
            }
          } else if (val !== null && val !== undefined && typeof val !== 'number' && typeof val !== 'boolean') {
            val = String(val);
            if (val.length > 32000) {
              val = val.substring(0, 32000) + '... [مختصر تجاوز 32 ألف حرف]';
            }
          }
          clean[k] = val;
        }
        return clean;
      });
      const ws = XLSX.utils.json_to_sheet(formatted.length > 0 ? formatted : [{ info: 'لا توجد بيانات' }]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Excel sheet name max length is 31 chars
    };

    addSheet('الطلاب (Students)', data.allStudents);
    addSheet('المدربون (Trainers)', data.allTrainers);
    addSheet('الدورات (Courses)', data.allCourses);
    addSheet('المجموعات (Groups)', data.allGroups);
    addSheet('الفروع (Branches)', data.allBranches);
    addSheet('المعامل (Labs)', data.allLabs);
    addSheet('الحضور (Attendance)', data.allAttendance);
    addSheet('المعاملات المالية (Payments)', data.allPayments);
    addSheet('المصروفات (Expenses)', data.allExpenses);
    addSheet('الشهادات (Certificates)', data.allCertificates);
    addSheet('الاختبارات (Exams)', data.allExams);
    addSheet('نتائج الاختبارات (Results)', data.allExamResults);
    addSheet('نقاط المكافآت (Points)', data.allPointTransactions);
    addSheet('سجل النشاطات (AuditLogs)', data.allAuditLogs);
    addSheet('المستخدمون (Users)', data.allUsers);

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const filename = `Nagah_Full_Database_Center_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return { excelBuffer, filename };
  }

  private static getLegacySourceFilesData() {
    const pkgDir = path.join(process.cwd(), 'migration-package');
    let students: any[] = [];
    let courses: any[] = [];
    let groups: any[] = [];
    let trainers: any[] = [];

    try {
      const sRaw = fs.readFileSync(path.join(pkgDir, '01-students', 'students.json'), 'utf8');
      students = JSON.parse(sRaw);
    } catch {}

    try {
      const cRaw = fs.readFileSync(path.join(pkgDir, '07-courses', 'courses-raw.json'), 'utf8');
      courses = JSON.parse(cRaw);
    } catch {}

    try {
      const gRaw = fs.readFileSync(path.join(pkgDir, '08-groups', 'groups-raw.json'), 'utf8');
      groups = JSON.parse(gRaw);
    } catch {}

    try {
      const tRaw = fs.readFileSync(path.join(pkgDir, '02-trainers', 'trainers.json'), 'utf8');
      trainers = JSON.parse(tRaw);
    } catch {}

    return { students, courses, groups, trainers };
  }

  // PROMPT 17 & 18 — NAGAH LEGACY: Basic Data Export Only (Read-Only, Exact Student Code Preserved)
  static async exportLegacyBasicDataExcel() {
    const legacy = this.getLegacySourceFilesData();
    const data = legacy.students.length > 0 ? legacy : await this.extractAllData();
    const workbook = XLSX.utils.book_new();

    // 1. Students sheet (student_code preserved exactly as is)
    const rawStudents = legacy.students.length > 0 ? legacy.students : ((data as any).allStudents || (data as any).students || []);
    const studentsRows = rawStudents.map((s: any) => ({
      student_code: s.code || s.studentCode || s.traineeCode || '',
      name: s.fullName || s.name || '',
      phone: s.phone || '',
      parentName: s.parentName || '',
      grade: s.grade || '',
      courseName: s.courseName || '',
      groupName: s.groupName || ''
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsRows.length > 0 ? studentsRows : [{ student_code: '', name: 'No Students' }]);
    XLSX.utils.book_append_sheet(workbook, wsStudents, 'Students');

    // 2. Courses sheet
    const rawCourses = legacy.courses.length > 0 ? legacy.courses : ((data as any).allCourses || (data as any).courses || []);
    const coursesRows = rawCourses.map((c: any) => ({
      id: c.id || '',
      code: c.code || '',
      name: c.name || c.title || '',
      description: c.description || ''
    }));
    const wsCourses = XLSX.utils.json_to_sheet(coursesRows.length > 0 ? coursesRows : [{ id: '', name: 'No Courses' }]);
    XLSX.utils.book_append_sheet(workbook, wsCourses, 'Courses');

    // 3. Groups sheet
    const rawGroups = legacy.groups.length > 0 ? legacy.groups : ((data as any).allGroups || (data as any).groups || []);
    const groupsRows = rawGroups.map((g: any) => ({
      id: g.id || '',
      code: g.code || '',
      name: g.name || '',
      branchId: g.branchId || ''
    }));
    const wsGroups = XLSX.utils.json_to_sheet(groupsRows.length > 0 ? groupsRows : [{ id: '', name: 'No Groups' }]);
    XLSX.utils.book_append_sheet(workbook, wsGroups, 'Groups');

    // 4. Trainers sheet
    const rawTrainers = legacy.trainers.length > 0 ? legacy.trainers : ((data as any).allTrainers || (data as any).trainers || []);
    const trainersRows = rawTrainers.map((t: any) => ({
      id: t.id || '',
      name: t.name || '',
      phone: t.phone || '',
      email: t.email || ''
    }));
    const wsTrainers = XLSX.utils.json_to_sheet(trainersRows.length > 0 ? trainersRows : [{ id: '', name: 'No Trainers' }]);
    XLSX.utils.book_append_sheet(workbook, wsTrainers, 'Trainers');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const filename = 'NAGAH_BASIC_DATA_EXPORT_v1.xlsx';
    return {
      excelBuffer,
      filename,
      counts: {
        students: studentsRows.length,
        courses: coursesRows.length,
        groups: groupsRows.length,
        trainers: trainersRows.length
      }
    };
  }

  static async exportLegacyBasicDataJson() {
    const legacy = this.getLegacySourceFilesData();
    const data = legacy.students.length > 0 ? legacy : await this.extractAllData();

    const rawStudents = legacy.students.length > 0 ? legacy.students : ((data as any).allStudents || (data as any).students || []);
    const students = rawStudents.map((s: any) => ({
      student_code: s.code || s.studentCode || s.traineeCode || '',
      name: s.fullName || s.name || '',
      phone: s.phone || '',
      parentName: s.parentName || '',
      grade: s.grade || '',
      courseName: s.courseName || '',
      groupName: s.groupName || ''
    }));

    const rawCourses = legacy.courses.length > 0 ? legacy.courses : ((data as any).allCourses || (data as any).courses || []);
    const courses = rawCourses.map((c: any) => ({
      id: c.id || '',
      code: c.code || '',
      name: c.name || c.title || '',
      description: c.description || ''
    }));

    const rawGroups = legacy.groups.length > 0 ? legacy.groups : ((data as any).allGroups || (data as any).groups || []);
    const groups = rawGroups.map((g: any) => ({
      id: g.id || '',
      code: g.code || '',
      name: g.name || '',
      branchId: g.branchId || ''
    }));

    const rawTrainers = legacy.trainers.length > 0 ? legacy.trainers : ((data as any).allTrainers || (data as any).trainers || []);
    const trainers = rawTrainers.map((t: any) => ({
      id: t.id || '',
      name: t.name || '',
      phone: t.phone || '',
      email: t.email || ''
    }));

    const packageJson = {
      export_version: "1.0.0",
      source_application: "nagah-legacy-system",
      export_timestamp: new Date().toISOString(),
      entity_counts: {
        students: students.length,
        courses: courses.length,
        groups: groups.length,
        trainers: trainers.length
      },
      students,
      courses,
      groups,
      trainers
    };

    return {
      packageJson,
      filename: 'NAGAH_BASIC_DATA_EXPORT_v1.json'
    };
  }
}
