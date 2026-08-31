import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
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
  InteractiveSession,
  Device,
  DeviceCommand,
  Certificate,
  TrainerAttestation,
  CertificateTemplate,
  AuditLog,
  CenterSettings,
  SystemNotification,
  TraineeScreenshot,
  ComputerLab,
  AssignmentTask
} from '../src/types.ts';

export interface DatabaseSchema {
  assignments?: AssignmentTask[];
  users: User[];
  branches: Branch[];
  trainees: Trainee[];
  trainers: Trainer[];
  courses: Course[];
  programs: Program[];
  groups: Group[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  expenses: Expense[];
  trainerSettlements: TrainerSettlement[];
  pointRules: PointRule[];
  pointTransactions: PointTransaction[];
  exams: Exam[];
  questions: ExamQuestion[];
  examResults: ExamResult[];
  interactiveSessions: InteractiveSession[];
  devices: Device[];
  deviceCommands: DeviceCommand[];
  certificates: Certificate[];
  certificateTemplates?: CertificateTemplate[];
  trainerAttestations?: TrainerAttestation[];
  auditLogs: AuditLog[];
  settings: CenterSettings;
  notifications: SystemNotification[];
  traineeScreenshots?: TraineeScreenshot[];
  secretFinancialArchives?: any[];
  deletedDeviceIds?: string[];
  labSchedules?: any[];
  traineeBadges?: any[];
  traineeEvaluations?: any[];
  homeworkSubmissions?: any[];
  computerLabs?: ComputerLab[];
  googleDriveSync?: any;
  studentPosts?: any[];
  socialComments?: any[];
  portalMessages?: any[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV);
const ACTUAL_DATA_DIR = isServerless ? path.join(os.tmpdir(), 'nagah_data') : path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(ACTUAL_DATA_DIR, 'backups');
const DB_FILE = path.join(ACTUAL_DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(ACTUAL_DATA_DIR, 'database.backup.json');
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'database.json');

// Simple secure hash
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_success_v7_salt').digest('hex');
}

const defaultPointRules: PointRule[] = [
  { id: 'rule-1', title: 'تسجيل الحضور', pointValue: 10, ruleType: 'attendance', description: 'نقاط الحضور في الموعد المحدد', isActive: true },
  { id: 'rule-2', title: 'المشاركة والتفاعل', pointValue: 20, ruleType: 'participation', description: 'التفاعل الإيجابي أثناء المحاضرة', isActive: true },
  { id: 'rule-3', title: 'إنجاز المهمة / الواجب', pointValue: 30, ruleType: 'task', description: 'تسليم التطبيقات العملية والواجبات', isActive: true },
  { id: 'rule-4', title: 'التميز والتفوق', pointValue: 50, ruleType: 'excellence', description: 'الحصول على المركز الأول أو عمل مميز', isActive: true },
  { id: 'rule-5', title: 'مخالفة أو تأخير', pointValue: -10, ruleType: 'violation', description: 'التأخير أو عدم الالتزام بقواعد القاعة', isActive: true },
];

const initialData: DatabaseSchema = {
  users: [
  {
    "id": "user-admin",
    "role": "super_admin",
    "email": "admin@nagah.eg",
    "phone": "01000000000",
    "status": "active",
    "fullName": "مدير عام النظام",
    "username": "admin",
    "createdAt": "2026-08-25T08:24:58.573Z"
  },
  {
    "id": "user-accountant",
    "role": "accountant",
    "email": "finance@nagah.eg",
    "phone": "01055556666",
    "status": "active",
    "branchId": "branch-1",
    "fullName": "المدير المالي",
    "username": "accountant",
    "createdAt": "2026-08-25T08:24:58.573Z"
  },
  {
    "id": "user-reception",
    "role": "receptionist",
    "email": "reception@nagah.eg",
    "phone": "01077778888",
    "status": "active",
    "branchId": "branch-1",
    "fullName": "مسئول التسجيل",
    "username": "reception",
    "createdAt": "2026-08-25T08:24:58.573Z"
  },
  {
    "id": "user-trainer",
    "role": "trainer",
    "email": "trainer@nagah.eg",
    "phone": "01099990000",
    "status": "active",
    "branchId": "branch-1",
    "fullName": "مدرب معتمد",
    "username": "trainer",
    "createdAt": "2026-08-25T08:24:58.573Z"
  },
  {
    "id": "user-branch-1",
    "role": "branch_manager",
    "email": "ngah@nagah.eg",
    "phone": "01011112222",
    "status": "active",
    "branchId": "branch-1",
    "fullName": "مدير فرع النجاح",
    "username": "manager_ngah",
    "createdAt": "2026-08-25T08:24:58.573Z"
  },
  {
    "id": "user-branch-2",
    "role": "branch_manager",
    "email": "badr@nagah.eg",
    "phone": "01033334444",
    "status": "active",
    "branchId": "branch-2",
    "fullName": "مدير فرع بدر",
    "username": "manager_badr",
    "createdAt": "2026-08-25T08:24:58.573Z"
  }
],
  branches: [
  {
    "id": "branch-1",
    "code": "NGAH",
    "name": "فرع النجاح",
    "phone": "01012345678",
    "status": "active",
    "address": "المقر الرئيسي - مبنى النجاح للتدريب",
    "createdAt": "2026-08-25T08:24:58.573Z",
    "managerName": "مدير فرع النجاح"
  },
  {
    "id": "branch-2",
    "code": "BADR",
    "name": "فرع بدر",
    "phone": "01087654321",
    "status": "active",
    "address": "فرع مدينة بدر - سنتر التدريب",
    "createdAt": "2026-08-25T08:24:58.573Z",
    "managerName": "مدير فرع بدر"
  }
],
  trainees: [
  {
    "id": "trainee-1787541849210-pp7bg",
    "code": "C001",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01289044043",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544071821",
    "ranking": 28,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "محمد عادل احمد محمد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2015-06-09",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:49.712Z",
    "nationalId": "31506091804157",
    "paidAmount": 0,
    "parentName": "عادل احمد محمد",
    "siblingIds": [],
    "parentPhone": "01118554646",
    "studentCode": "C001",
    "totalPoints": 0,
    "traineeCode": "C001",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-test-1787601054446-1",
    "code": "X001",
    "notes": "تجربة تسجيل حية (Vercel Test 1)",
    "phone": "01011112222",
    "gender": "male",
    "status": "active",
    "branchId": "branch-1",
    "fullName": "أحمد محمد بخيت (طالب تجريبي)",
    "feeAmount": 200,
    "netAmount": 200,
    "updatedAt": "2026-08-31T12:11:49.916Z",
    "paidAmount": 500,
    "parentName": "محمد بخيت",
    "parentPhone": "01033334444",
    "studentCode": "X001",
    "totalPoints": 10,
    "traineeCode": "X001",
    "isTestRecord": true,
    "reviewReason": "financial_discrepancy; ",
    "creditBalance": 300,
    "discountAmount": 0,
    "remainingAmount": 0,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787541849210-xqtko",
    "code": "C004",
    "grade": "الصف السادس الابتدائي",
    "notes": "مفيش",
    "phone": "01060389109",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431825818",
    "ranking": 24,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "رمضان وائل مهدي الخضراوي",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 100,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.134Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "وائل مهدي الخضراوي",
    "siblingIds": [],
    "parentPhone": "01060389109",
    "studentCode": "C004",
    "totalPoints": 0,
    "traineeCode": "C004",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 100,
    "remainingAmount": 100,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-13pem",
    "code": "C006",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01143598843",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431825818",
    "ranking": 22,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "انس محمد فتحي مبروك",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 198,
    "netAmount": 198,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.299Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد فتحي مبروك",
    "siblingIds": [],
    "parentPhone": "01102289446",
    "studentCode": "C006",
    "totalPoints": 0,
    "traineeCode": "C006",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 198,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787938303996",
    "code": "D002",
    "grade": "الصف الأول الإعدادي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01553471445",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "عبير أحمد الشهاوى الخولي",
    "photoUrl": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.362Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "إيناس جمال أمين ",
    "parentPhone": "01145811866",
    "studentCode": "D002",
    "totalPoints": 0,
    "traineeCode": "D002",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787959178130",
    "code": "A019",
    "grade": "الصف الرابع الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01143998886",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "مهاب هانى احمد موسى",
    "photoUrl": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.430Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "هانى احمد موسى",
    "parentPhone": "01143998886",
    "studentCode": "A019",
    "totalPoints": 0,
    "traineeCode": "A019",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-pmfbt",
    "code": "A002",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01067899283",
    "gender": "female",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 4,
    "branchId": "branch-2",
    "courseId": "course-1787347401956",
    "fullName": "أغابي بيمن عزت",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.566Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "بيمن عزت",
    "siblingIds": [],
    "parentPhone": "01067899283",
    "studentCode": "A002",
    "totalPoints": 0,
    "traineeCode": "A002",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-96lvp",
    "code": "S001",
    "grade": "الصف الأول الثانوي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الأول الثانوي",
    "phone": "01026171957",
    "gender": "female",
    "points": 0,
    "prefix": "S",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544591647",
    "ranking": 33,
    "branchId": "branch-1",
    "courseId": "crs-1787427970903",
    "fullName": "آيه محسن محمد فرحات",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2010-11-19",
    "courseIds": [
      "crs-1787427970903"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:50.710Z",
    "nationalId": "31011191800907",
    "paidAmount": 0,
    "parentName": "محسن محمد فرحات",
    "siblingIds": [],
    "parentPhone": "01115827771",
    "studentCode": "S001",
    "totalPoints": 0,
    "traineeCode": "S001",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787662382042",
    "code": "C007",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01113176378",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544071821",
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "عبدالرحمن السيد سلامه السيد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:50.773Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "السيد سلامه السيد",
    "siblingIds": [],
    "parentPhone": "01146335223",
    "studentCode": "C007",
    "totalPoints": 0,
    "traineeCode": "C007",
    "isTestRecord": false,
    "reviewReason": "financial_discrepancy; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "updatedByUserId": "user-admin",
    "registrationDate": "2026-08-25",
    "updatedByUserName": "مدير عام النظام",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787543652693-cz0n",
    "code": "A006",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تمت الاستعادة من نسخة احتياطية",
    "phone": "01281016041",
    "gender": "female",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 36,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "مريم رمسيس صبري مرسال",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "1982-12-14",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.972Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "رمسيس صبري مرسال",
    "siblingIds": [],
    "parentPhone": "01281016041",
    "studentCode": "A006",
    "totalPoints": 0,
    "traineeCode": "A006",
    "exemptReason": "",
    "isTestRecord": false,
    "reviewReason": "birth_date_age_grade_mismatch; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787955097802",
    "code": "C009",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01156745251",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "سيف تامر محمود محمد",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:51.034Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "تامر محمود محمد",
    "parentPhone": "01156745251",
    "studentCode": "C009",
    "totalPoints": 0,
    "traineeCode": "C009",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-vuvxz",
    "code": "A007",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي | ربط إخوة مع (أحمد حامد احمد السيد - C101) - تم تطبيق خصم الأخوات",
    "phone": "01555724745",
    "gender": "female",
    "points": 10,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 11,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "شيم حامد احمد السيد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.094Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "حامد احمد السيد",
    "siblingIds": [
      "trainee-1787541849209-ga4bt"
    ],
    "parentPhone": "01144363810",
    "studentCode": "A007",
    "totalPoints": 10,
    "traineeCode": "A007",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "أحمد حامد احمد السيد"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787361410293-aeko",
    "code": "B002",
    "grade": "الصف الخامس الابتدائي",
    "notes": "ربط إخوة مع (مرام محمد رمضان بخيت - A001) - تم تطبيق خصم الأخوات",
    "phone": "01005400325",
    "gender": "female",
    "points": 200,
    "prefix": "B",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431608023",
    "ranking": 2,
    "branchId": "branch-1",
    "courseId": "course-1787347462419",
    "fullName": "رفيف محمد رمضان بخيت",
    "isExempt": true,
    "birthDate": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 0,
    "netAmount": 0,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.160Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد رمضان بخيت",
    "siblingIds": [
      "trainee-1787361330810-d1if",
      "trainee-1787459300939-62ly"
    ],
    "parentPhone": "01001500686",
    "studentCode": "B002",
    "totalPoints": 200,
    "traineeCode": "B002",
    "exemptReason": "management_children",
    "isTestRecord": false,
    "siblingNames": [
      "مرام محمد رمضان بخيت",
      "لين محمد رمضان بخيت"
    ],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 0,
    "registrationDate": "2026-08-22",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787361330810-d1if",
    "code": "D003",
    "grade": "الصف الأول الإعدادي",
    "notes": "ابنة الإدارة - إعفاء كامل",
    "phone": "01001500686",
    "gender": "female",
    "points": 297,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787358595611",
    "ranking": 1,
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "مرام محمد رمضان بخيت",
    "isExempt": true,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 0,
    "netAmount": 0,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.384Z",
    "nationalId": "",
    "paidAmount": 500,
    "parentName": "محمد رمضان بخيت",
    "siblingIds": [
      "trainee-1787361410293-aeko",
      "trainee-1787459300939-62ly"
    ],
    "parentPhone": "01001500686",
    "studentCode": "D003",
    "totalPoints": 297,
    "traineeCode": "D003",
    "exemptReason": "management_children",
    "isTestRecord": false,
    "siblingNames": [
      "رفيف محمد رمضان بخيت",
      "لين محمد رمضان بخيت"
    ],
    "creditBalance": 500,
    "discountAmount": 0,
    "remainingAmount": 0,
    "registrationDate": "2026-08-22",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-vmr8g",
    "code": "B001",
    "grade": "الصف الخامس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الخامس الابتدائي",
    "phone": "01558118998",
    "gender": "male",
    "points": 0,
    "prefix": "B",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431608023",
    "ranking": 17,
    "branchId": "branch-1",
    "courseId": "course-1787347462419",
    "fullName": "مصطفى محمود احمد خلف",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.442Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمود احمد خلف",
    "siblingIds": [],
    "parentPhone": "01154387509",
    "studentCode": "B001",
    "totalPoints": 0,
    "traineeCode": "B001",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-og2bf",
    "code": "D004",
    "grade": "الصف الأول الإعدادي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الأول الإعدادي | ربط إخوة مع (كاراس بيشوي نبيل كرم - A113، شنوده بيشوي نبيل كرم - D101) - تم تطبيق خصم الأخوات",
    "phone": "01129124624",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787358828709",
    "ranking": 31,
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "مكاريوس بيشوي نبيل كرم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.505Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "بيشوي نبيل كرم",
    "siblingIds": [
      "trainee-1787541849209-v7dn1",
      "trainee-1787541849210-hstjh"
    ],
    "parentPhone": "01120530166",
    "studentCode": "D004",
    "totalPoints": 0,
    "traineeCode": "D004",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "كاراس بيشوي نبيل كرم",
      "شنوده بيشوي نبيل كرم"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-sfgme",
    "code": "A008",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01103791786",
    "gender": "female",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787351870532",
    "ranking": 15,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "هلا محمد فتحي يحيي",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.577Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد فتحي يحيي",
    "siblingIds": [],
    "parentPhone": "01149322292",
    "studentCode": "A008",
    "totalPoints": 0,
    "traineeCode": "A008",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787746135198",
    "code": "B003",
    "grade": "الصف الخامس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01022773941",
    "gender": "male",
    "points": 80,
    "prefix": "B",
    "status": "active",
    "address": "",
    "groupId": "grp-1787432635686",
    "branchId": "branch-2",
    "courseId": "course-1787347462419",
    "fullName": "حنين علي عبد الظاهر حسين",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.645Z",
    "nationalId": "",
    "paidAmount": 500,
    "parentName": "علي عبد الظاهر حسين",
    "siblingIds": [],
    "parentPhone": "01022773941",
    "studentCode": "B003",
    "totalPoints": 80,
    "traineeCode": "B003",
    "isTestRecord": false,
    "reviewReason": "financial_discrepancy; ",
    "siblingNames": [],
    "creditBalance": 250,
    "discountAmount": 0,
    "remainingAmount": 0,
    "updatedByUserId": "u-admin",
    "registrationDate": "2026-08-26",
    "updatedByUserName": "المدير العام (Super Admin)",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787863726447",
    "code": "C013",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01155953899",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "احمد ابراهيم احمد محمد",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:51.773Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "ابراهيم احمد محمد",
    "parentPhone": "01155953899",
    "studentCode": "C013",
    "totalPoints": 0,
    "traineeCode": "C013",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-27",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-0f0b4",
    "code": "A010",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01066747764",
    "gender": "female",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787432103884",
    "ranking": 14,
    "branchId": "branch-2",
    "courseId": "course-1787347401956",
    "fullName": "مارينا عماد ثروت سليم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.900Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "عماد ثروت سليم",
    "siblingIds": [],
    "parentPhone": "01066747764",
    "studentCode": "A010",
    "totalPoints": 0,
    "traineeCode": "A010",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787459300939-62ly",
    "code": "A012",
    "grade": "الصف الرابع الابتدائي",
    "notes": "ربط إخوة مع (مرام ورفيف محمد رمضان بخيت) - إعفاء أبناء الإدارة",
    "phone": "01001500686",
    "gender": "female",
    "points": 133,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 3,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "لين محمد رمضان بخيت",
    "isExempt": true,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 0,
    "netAmount": 0,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.031Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد رمضان بخيت",
    "siblingIds": [
      "trainee-1787361330810-d1if",
      "trainee-1787361410293-aeko"
    ],
    "parentPhone": "01001500686",
    "studentCode": "A012",
    "totalPoints": 133,
    "traineeCode": "A012",
    "exemptReason": "management_children",
    "isTestRecord": false,
    "siblingNames": [
      "مرام محمد رمضان بخيت",
      "رفيف محمد رمضان بخيت"
    ],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 0,
    "registrationDate": "2026-08-23",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-ekoi2",
    "code": "C017",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01007943393",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544071821",
    "ranking": 29,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "محمد محمود عبدالعزيز محمد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2013-12-20",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.091Z",
    "nationalId": "31312201802938",
    "paidAmount": 0,
    "parentName": "محمود عبدالعزيز محمد",
    "siblingIds": [],
    "parentPhone": "01094291702",
    "studentCode": "C017",
    "totalPoints": 0,
    "traineeCode": "C017",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787772955569",
    "code": "C014",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01143065278",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "معاذ السيد سلامه",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.273Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "السيد سلامه",
    "parentPhone": "01146335223",
    "studentCode": "C014",
    "totalPoints": 0,
    "traineeCode": "C014",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787910708566",
    "code": "C015",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01113320394",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "يوسف جلال جلال ابراهيم",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.338Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "جلال جلال ابراهيم",
    "parentPhone": "01157607060",
    "studentCode": "C015",
    "totalPoints": 0,
    "traineeCode": "C015",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-v7dn1",
    "code": "A011",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي | ربط إخوة مع (شنوده بيشوي نبيل كرم - D101، مكاريوس بيشوي نبيل كرم - D102) - تم تطبيق خصم الأخوات",
    "phone": "01120530166",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 12,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "كاراس بيشوي نبيل كرم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.400Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "بيشوي نبيل كرم",
    "siblingIds": [
      "trainee-1787541849210-hstjh",
      "trainee-1787541849210-og2bf"
    ],
    "parentPhone": "01120530166",
    "studentCode": "A011",
    "totalPoints": 0,
    "traineeCode": "A011",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "شنوده بيشوي نبيل كرم",
      "مكاريوس بيشوي نبيل كرم"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787955396186",
    "code": "C016",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01062982266",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "محمد حسام الدين محمد",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.464Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "حسام الدين محمد",
    "parentPhone": "01278393803",
    "studentCode": "C016",
    "totalPoints": 0,
    "traineeCode": "C016",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787875324594",
    "code": "C020",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01091957422",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "يوسف محمد محمد أمين الخربوطلي",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.664Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد محمد أمين الخربوطلي",
    "parentPhone": "01091957422",
    "studentCode": "C020",
    "totalPoints": 0,
    "traineeCode": "C020",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-dziuw",
    "code": "A015",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01151625616",
    "gender": "female",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350488774",
    "ranking": 10,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "سما سراج الدين محمد لطفي علي",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "1992-04-13",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.787Z",
    "nationalId": "29204131803226",
    "paidAmount": 0,
    "parentName": "سراج الدين محمد لطفي علي",
    "siblingIds": [],
    "parentPhone": "01019291820",
    "studentCode": "A015",
    "totalPoints": 0,
    "traineeCode": "A015",
    "exemptReason": "",
    "isTestRecord": false,
    "reviewReason": "birth_date_age_grade_mismatch; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787541962983-tp0u",
    "code": "A016",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تمت الاستعادة من نسخة احتياطية",
    "phone": "01031505848",
    "gender": "male",
    "points": 10,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787351870532",
    "ranking": 35,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "عبدالله عبدالملك رمضان بخيت",
    "isExempt": true,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 0,
    "netAmount": 0,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.919Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "عبدالملك رمضان بخيت",
    "siblingIds": [],
    "parentPhone": "01007153868",
    "studentCode": "A016",
    "totalPoints": 10,
    "traineeCode": "A016",
    "exemptReason": "management_children",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 200,
    "remainingAmount": 0,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-oqyov",
    "code": "D008",
    "grade": "الصف الثاني الإعدادي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الثاني الإعدادي",
    "phone": "01023768971",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787547775589",
    "ranking": 32,
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "محمود السيد مصطفى فايد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.990Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "السيد مصطفى فايد",
    "siblingIds": [],
    "parentPhone": "012821968208",
    "studentCode": "D008",
    "totalPoints": 0,
    "traineeCode": "D008",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787826204010",
    "code": "A013",
    "grade": "الصف الرابع الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01121541421",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "رونزا محمد سعد النجار",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.113Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد سعد النجار",
    "siblingIds": [],
    "parentPhone": "01121541421",
    "studentCode": "A013",
    "totalPoints": 0,
    "traineeCode": "A013",
    "isTestRecord": false,
    "reviewReason": "financial_discrepancy; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "updatedByUserId": "u-admin",
    "registrationDate": "2026-08-27",
    "updatedByUserName": "المدير العام (Super Admin)",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787541849209-bgqwo",
    "code": "A014",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01114692028",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 13,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "مارسلينو مايكل رشدي فواد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.177Z",
    "nationalId": "9509051800108",
    "paidAmount": 0,
    "parentName": "مايكل رشدي فواد",
    "siblingIds": [],
    "parentPhone": "01151870626",
    "studentCode": "A014",
    "totalPoints": 0,
    "traineeCode": "A014",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787663187137",
    "code": "D006",
    "grade": "الصف الأول الإعدادي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01096932831",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "نيروز محمد صلاح عرابى",
    "photoUrl": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.241Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد صلاح عرابى",
    "parentPhone": "01013732004",
    "studentCode": "D006",
    "totalPoints": 0,
    "traineeCode": "D006",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-25",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-brq6q",
    "code": "C022",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي | ربط إخوة مع (انس محمد عبدالبصير ربيع - A109) - تم تطبيق خصم الأخوات",
    "phone": "01154531351",
    "gender": "female",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431802246",
    "ranking": 21,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "اميرة محمد عبدالبصير ربيع",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.310Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد عبدالبصير ربيع",
    "siblingIds": [
      "trainee-1787541849209-nt607"
    ],
    "parentPhone": "01156569121",
    "studentCode": "C022",
    "totalPoints": 0,
    "traineeCode": "C022",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "انس محمد عبدالبصير ربيع"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787957712994",
    "code": "A018",
    "grade": "الصف الرابع الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01100959725",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "انس محمد فتحي مبروك عبدربه",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:53.504Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد فتحي مبروك عبدربه",
    "parentPhone": "01100959725",
    "studentCode": "A018",
    "totalPoints": 0,
    "traineeCode": "A018",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-28",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-8y0f7",
    "code": "C002",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01554943359",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544071821",
    "ranking": 19,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "أحمد حمدى محمد ابراهيم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2016-01-12",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:49.836Z",
    "nationalId": "31601121600376",
    "paidAmount": 0,
    "parentName": "حمدى محمد ابراهيم",
    "siblingIds": [],
    "parentPhone": "01021643616",
    "studentCode": "C002",
    "totalPoints": 0,
    "traineeCode": "C002",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-9h7fe",
    "code": "A003",
    "grade": "الصف الرابع الابتدائي",
    "notes": "نعم",
    "phone": "01153126039",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787351870532",
    "ranking": 6,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "ادم ربيع احمد احمد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2017-08-02",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:49.987Z",
    "nationalId": "31708022301412",
    "paidAmount": 0,
    "parentName": "ربيع احمد احمد",
    "siblingIds": [],
    "parentPhone": "01091164927",
    "studentCode": "A003",
    "totalPoints": 0,
    "traineeCode": "A003",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787762702428",
    "code": "C005",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01153644731",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "جنى نشأت حميده قاسم",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:50.202Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "نشأت حميده قاسم",
    "parentPhone": "01153644731",
    "studentCode": "C005",
    "totalPoints": 0,
    "traineeCode": "C005",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787936711415",
    "code": "D001",
    "grade": "الصف الرابع الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01277865657",
    "gender": "male",
    "points": 10,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787351870532",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "كرمه احمد عصام ابو الخير",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.622Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "احمد عصام ابو الخير",
    "siblingIds": [],
    "parentPhone": "01113415134",
    "studentCode": "D001",
    "totalPoints": 10,
    "traineeCode": "D001",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "updatedByUserId": "user-admin",
    "registrationDate": "2026-08-28",
    "updatedByUserName": "مدير عام النظام",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-d5zdo",
    "code": "C003",
    "grade": "الصف السادس الابتدائي",
    "notes": "لا ملاحظات مركز متميز ديما فى تفوق",
    "phone": "01011284718",
    "gender": "male",
    "points": 30,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787544071821",
    "ranking": 23,
    "branchId": "branch-2",
    "courseId": "course-1787347508908",
    "fullName": "رافائيل عبد المسيح درويش سليمان",
    "isExempt": false,
    "birthDate": "1991-10-24",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:50.497Z",
    "nationalId": "29110241800708",
    "paidAmount": 0,
    "parentName": "عبد المسيح درويش سليمان",
    "siblingIds": [],
    "parentPhone": "01070712374",
    "studentCode": "C003",
    "totalPoints": 30,
    "traineeCode": "C003",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-sguwt",
    "code": "A004",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01067504968",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 7,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "ارسانيوس بيشوى يوسف بشرى",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2016-08-19",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.626Z",
    "nationalId": "31608191801012",
    "paidAmount": 0,
    "parentName": "بيشوى يوسف بشرى",
    "siblingIds": [],
    "parentPhone": "01016563881",
    "studentCode": "A004",
    "totalPoints": 0,
    "traineeCode": "A004",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787754470045",
    "code": "C010",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01069789972",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "إنجي عاطف سعيد عبدالغفار",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:50.838Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "عاطف سعيد عبدالغفار",
    "parentPhone": "01069789972",
    "studentCode": "C010",
    "totalPoints": 0,
    "traineeCode": "C010",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787770178351-p956",
    "code": "A005",
    "grade": "الصف الرابع الابتدائي",
    "notes": "",
    "phone": "01002009086",
    "gender": "male",
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "محمد عبدالله رمضان بخيت",
    "isExempt": true,
    "photoUrl": "",
    "birthDate": "",
    "createdAt": "2026-08-26T18:49:38.351Z",
    "feeAmount": 0,
    "netAmount": 0,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:50.904Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "عبدالله رمضان بخيت",
    "siblingIds": [],
    "parentPhone": "",
    "studentCode": "A005",
    "traineeCode": "A005",
    "exemptReason": "management_children",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "initialPayment": 0,
    "_lastAutoParent": "عبدالله رمضان بخيت",
    "createdByUserId": "user-admin",
    "remainingAmount": 0,
    "updatedByUserId": "u-admin",
    "createdByUserName": "مدير عام النظام",
    "updatedByUserName": "المدير العام (Super Admin)",
    "dataValidationStatus": "verified",
    "initialPaymentMethod": "cash"
  },
  {
    "id": "trainee-1787541849210-hstjh",
    "code": "D005",
    "grade": "الصف الأول الإعدادي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الأول الإعدادي | ربط إخوة مع (كاراس بيشوي نبيل كرم - A113، مكاريوس بيشوي نبيل كرم - D102) - تم تطبيق خصم الأخوات",
    "phone": "01120530166",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787358828709",
    "ranking": 30,
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "fullName": "شنوده بيشوي نبيل كرم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.227Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "بيشوي نبيل كرم",
    "siblingIds": [
      "trainee-1787541849209-v7dn1",
      "trainee-1787541849210-og2bf"
    ],
    "parentPhone": "01120530166",
    "studentCode": "D005",
    "totalPoints": 0,
    "traineeCode": "D005",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "كاراس بيشوي نبيل كرم",
      "مكاريوس بيشوي نبيل كرم"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-mnsbr",
    "code": "C008",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01117835661",
    "gender": "female",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431802246",
    "ranking": 26,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "ريناده هيثم عبد الرحمن على",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2015-06-03",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.321Z",
    "nationalId": "31506031801442",
    "paidAmount": 0,
    "parentName": "هيثم عبد الرحمن على",
    "siblingIds": [],
    "parentPhone": "01129923256",
    "studentCode": "C008",
    "totalPoints": 0,
    "traineeCode": "C008",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-ge762",
    "code": "C011",
    "grade": "الصف السادس الابتدائي",
    "notes": "لا يوجد",
    "phone": "01013358527",
    "gender": "female",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431802246",
    "ranking": 27,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "شيرين مبروك محمد الحداد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2014-10-01",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:51.707Z",
    "nationalId": "31410011800345",
    "paidAmount": 0,
    "parentName": "مبروك محمد الحداد",
    "siblingIds": [],
    "parentPhone": "01012680192",
    "studentCode": "C011",
    "totalPoints": 0,
    "traineeCode": "C011",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-nhkiw",
    "code": "A009",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01229237000",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787543971890",
    "ranking": 5,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "احمد الشحات صلاح الشحات",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "1991-02-17",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:51.839Z",
    "nationalId": "29102171803582",
    "paidAmount": 0,
    "parentName": "الشحات صلاح الشحات",
    "siblingIds": [],
    "parentPhone": "01129992240",
    "studentCode": "A009",
    "totalPoints": 0,
    "traineeCode": "A009",
    "exemptReason": "",
    "isTestRecord": false,
    "reviewReason": "birth_date_age_grade_mismatch; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787734108051",
    "code": "B005",
    "grade": "الصف الخامس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01207194632",
    "gender": "male",
    "points": 0,
    "prefix": "B",
    "status": "active",
    "groupId": "grp-1787544021028",
    "branchId": "branch-1",
    "courseId": "course-1787347462419",
    "fullName": "احمد محمد  محمود علي",
    "photoUrl": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:51.970Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد  محمود علي",
    "parentPhone": "01207194632",
    "studentCode": "B005",
    "totalPoints": 0,
    "traineeCode": "B005",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-nk3i7",
    "code": "B004",
    "grade": "الصف الخامس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الخامس الابتدائي",
    "phone": "01552274216",
    "gender": "male",
    "points": 0,
    "prefix": "B",
    "status": "active",
    "address": "",
    "groupId": "grp-1787432635686",
    "ranking": 16,
    "branchId": "branch-2",
    "courseId": "course-1787347462419",
    "fullName": "ياسر عمار ياسر راشد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.214Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "Ammar Yasser rashid",
    "siblingIds": [],
    "parentPhone": "01002933575",
    "studentCode": "B004",
    "totalPoints": 0,
    "traineeCode": "B004",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787663430814",
    "code": "C018",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01129695966",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "منة اللة كريم طاهر",
    "isExempt": true,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.596Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "اللة كريم طاهر",
    "siblingIds": [],
    "parentPhone": "01129695966",
    "studentCode": "C018",
    "totalPoints": 0,
    "traineeCode": "C018",
    "exemptReason": "friend_children",
    "isTestRecord": false,
    "reviewReason": "financial_discrepancy; ",
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "updatedByUserId": "u-admin",
    "registrationDate": "2026-08-25",
    "updatedByUserName": "المدير العام (Super Admin)",
    "dataValidationStatus": "needs_review"
  },
  {
    "id": "trainee-1787541849210-lfic3",
    "code": "C021",
    "grade": "الصف السادس الابتدائي",
    "notes": "لا يوجد",
    "phone": "01093188503",
    "gender": "female",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787433082510",
    "ranking": 20,
    "branchId": "branch-2",
    "courseId": "course-1787347508908",
    "fullName": "اسيل محمد شوقي عبدالحافظ",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "1991-11-17",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.728Z",
    "nationalId": "29111171802925",
    "paidAmount": 0,
    "parentName": "محمد شوقي عبدالحافظ",
    "siblingIds": [],
    "parentPhone": "01093188503",
    "studentCode": "C021",
    "totalPoints": 0,
    "traineeCode": "C021",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787756086876",
    "code": "C012",
    "grade": "الصف السادس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01152870811",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "groupId": "grp-1787544696780",
    "branchId": "branch-1",
    "courseId": "crs-1787428009076",
    "fullName": "اياد محمد عبد المقصود جعفر",
    "photoUrl": "",
    "courseIds": [
      "crs-1787428009076"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.153Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد عبد المقصود جعفر",
    "parentPhone": "01152870811",
    "studentCode": "C012",
    "totalPoints": 0,
    "traineeCode": "C012",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787758397521",
    "code": "B006",
    "grade": "الصف الخامس الابتدائي",
    "notes": "[طالب حقيقي - تسجيل ذاتي عبر الرابط الخارجي]",
    "phone": "01009193365",
    "gender": "male",
    "points": 0,
    "prefix": "B",
    "status": "active",
    "groupId": "grp-1787432635686",
    "branchId": "branch-2",
    "courseId": "course-1787347462419",
    "fullName": "محمد علي عبد الظاهر حسين",
    "photoUrl": "",
    "courseIds": [
      "course-1787347462419"
    ],
    "feeAmount": 500,
    "netAmount": 500,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:52.530Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "علي عبد الظاهر حسين",
    "parentPhone": "01022773941",
    "studentCode": "B006",
    "totalPoints": 0,
    "traineeCode": "B006",
    "isTestRecord": false,
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 500,
    "registrationDate": "2026-08-26",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-aqkav",
    "code": "C019",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي",
    "phone": "01024444706",
    "gender": "female",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431802246",
    "ranking": 25,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "رودينا محمد جمال عبد السلام",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "2015-05-22",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.049Z",
    "nationalId": "31505222100529",
    "paidAmount": 0,
    "parentName": "محمد جمال عبد السلام",
    "siblingIds": [],
    "parentPhone": "01146779857",
    "studentCode": "C019",
    "totalPoints": 0,
    "traineeCode": "C019",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-ga4bt",
    "code": "C023",
    "grade": "الصف السادس الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف السادس الابتدائي | ربط إخوة مع (شيم حامد احمد السيد - A112) - تم تطبيق خصم الأخوات | ربط إخوة مع (شيم حامد احمد السيد - A112) - تم تطبيق خصم الأخوات",
    "phone": "01555724745",
    "gender": "male",
    "points": 0,
    "prefix": "C",
    "status": "active",
    "address": "",
    "groupId": "grp-1787431802246",
    "ranking": 18,
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "fullName": "أحمد حامد احمد السيد",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347508908"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.440Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "حامد احمد السيد",
    "siblingIds": [
      "trainee-1787541849209-vuvxz"
    ],
    "parentPhone": "01144363810",
    "studentCode": "C023",
    "totalPoints": 0,
    "traineeCode": "C023",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "شيم حامد احمد السيد"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-4xin8",
    "code": "A001",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي",
    "phone": "01100660031",
    "gender": "male",
    "points": 10,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787351870532",
    "ranking": 8,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "اسر محمد عصام ابو الخير",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 200,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.564Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد عصام ابو الخير",
    "siblingIds": [],
    "parentPhone": "01100270005",
    "studentCode": "A001",
    "totalPoints": 10,
    "traineeCode": "A001",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 200,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849210-n8r31",
    "code": "D007",
    "grade": "الصف الأول الإعدادي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الثاني الثانوي",
    "phone": "010935923",
    "gender": "male",
    "points": 0,
    "prefix": "D",
    "status": "active",
    "address": "",
    "groupId": "grp-1787545407365",
    "ranking": 34,
    "branchId": "branch-2",
    "courseId": "course-1787347569318",
    "fullName": "مصطفي عبد الله هاشم",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347569318"
    ],
    "feeAmount": 250,
    "netAmount": 250,
    "trainerId": "trainer-1787349870400",
    "updatedAt": "2026-08-31T12:11:52.847Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "عبد الله هاشم",
    "siblingIds": [],
    "parentPhone": "01025520613",
    "studentCode": "D007",
    "totalPoints": 0,
    "traineeCode": "D007",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [],
    "creditBalance": 0,
    "discountAmount": 0,
    "remainingAmount": 250,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  },
  {
    "id": "trainee-1787541849209-nt607",
    "code": "A017",
    "grade": "الصف الرابع الابتدائي",
    "notes": "تسكين ذكي بالذكاء الاصطناعي - الصف الرابع الابتدائي | ربط إخوة مع (اميرة محمد عبدالبصير ربيع - C104) - تم تطبيق خصم الأخوات | ربط إخوة مع (اميرة محمد عبدالبصير ربيع - C104) - تم تطبيق خصم الأخوات",
    "phone": "01119309697",
    "gender": "male",
    "points": 0,
    "prefix": "A",
    "status": "active",
    "address": "",
    "groupId": "grp-1787350487970",
    "ranking": 9,
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "fullName": "انس محمد عبدالبصير ربيع",
    "isExempt": false,
    "photoUrl": "",
    "birthDate": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "feeAmount": 200,
    "netAmount": 160,
    "trainerId": "trainer-1787349806643",
    "updatedAt": "2026-08-31T12:11:53.377Z",
    "nationalId": "",
    "paidAmount": 0,
    "parentName": "محمد عبدالبصير ربيع",
    "siblingIds": [
      "trainee-1787541849210-brq6q"
    ],
    "parentPhone": "01156569121",
    "studentCode": "A017",
    "totalPoints": 0,
    "traineeCode": "A017",
    "exemptReason": "",
    "isTestRecord": false,
    "siblingNames": [
      "اميرة محمد عبدالبصير ربيع"
    ],
    "creditBalance": 0,
    "discountAmount": 40,
    "remainingAmount": 160,
    "registrationDate": "2026-08-24",
    "dataValidationStatus": "verified"
  }
],
  trainers: [
  {
    "id": "trainer-1787349806643",
    "name": "د. محمد رمضان بخيت",
    "email": "M_bkeet@yahoo.com",
    "notes": "",
    "phone": "01001500686",
    "status": "active",
    "branchId": "branch-1",
    "photoUrl": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "specialty": "ICT",
    "totalPaid": 0,
    "balanceDue": 0,
    "programIds": [],
    "totalEarned": 0,
    "contractDate": "2026-08-21",
    "commissionRate": 40,
    "commissionType": "percentage",
    "commissionValue": 40
  },
  {
    "id": "trainer-1787349870400",
    "name": "د. عماد حامد ابو النيل",
    "email": "",
    "notes": "",
    "phone": "01066264312",
    "status": "active",
    "branchId": "branch-2",
    "photoUrl": "",
    "courseIds": [
      "course-1787347401956"
    ],
    "specialty": "تكنولوجيا معلومات",
    "totalPaid": 0,
    "balanceDue": 0,
    "programIds": [],
    "totalEarned": 0,
    "contractDate": "2026-08-21",
    "commissionRate": 40,
    "commissionType": "percentage",
    "commissionValue": 40
  }
],
  courses: [
  {
    "id": "crs-1787502480417-0ggk",
    "code": "ICT-p1-L",
    "name": "الصف الأول الإعدادي لغات",
    "status": "active",
    "branchId": "branch-1",
    "category": "المدارس",
    "feeAmount": 200,
    "hoursCount": 20,
    "lecturesCount": 10
  },
  {
    "id": "crs-1787502587826-q429",
    "code": "ICT-p3-L",
    "name": "الصف الثالث الإعدادي لغات",
    "status": "active",
    "branchId": "branch-1",
    "category": "المدارس",
    "feeAmount": 200,
    "hoursCount": 20,
    "lecturesCount": 10
  },
  {
    "id": "crs-1787428009076",
    "code": "CRS-796",
    "name": "ICT-S2",
    "grade": "الصف الثاني الثانوي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 250,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الثاني الثانوي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "course-1787347462419",
    "code": "CRS-695",
    "name": "ICT5",
    "grade": "الصف الخامس الابتدائي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الخامس",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "crs-1787427763144",
    "code": "CRS-644",
    "name": "ICT-P3",
    "grade": "الصف الثالث الإعدادي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الثالث الاعدادي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "crs-1787502489944-bf2a",
    "code": "ICT-p1",
    "name": "الصف الثاني الإعدادي",
    "status": "active",
    "branchId": "branch-1",
    "category": "المدارس",
    "feeAmount": 200,
    "hoursCount": 20,
    "lecturesCount": 10
  },
  {
    "id": "crs-1787427970903",
    "code": "CRS-220",
    "name": "ICT-S1",
    "grade": "الصف الأول الثانوي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 250,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الاول الثانوي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "crs-1787428039994",
    "code": "CRS-131",
    "name": "ICT-S3",
    "grade": "الصف الثالث الثانوي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 250,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الثالث الثانوي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "course-1787347401956",
    "code": "CRS-472",
    "name": "ICT4",
    "grade": "الصف الرابع الابتدائي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج مادة الحاسب الالي للصف الرابع",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "course-1787347508908",
    "code": "CRS-182",
    "name": "ICT6",
    "grade": "الصف السادس الابتدائي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف السادس",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "crs-1787427719238",
    "code": "CRS-573",
    "name": "ICT-P2",
    "grade": "الصف الثاني الإعدادي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الثاني الاعدادي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  },
  {
    "id": "course-1787347569318",
    "code": "CRS-892",
    "name": "ICT-P1",
    "grade": "الصف الأول الإعدادي",
    "status": "active",
    "endDate": "",
    "branchId": "branch-1",
    "category": "دورة منهج ICT",
    "feeAmount": 200,
    "startDate": "",
    "hoursCount": 8,
    "billingType": "monthly",
    "description": "دورة منهج الحاسب الالي الصف الاول الاعدادي",
    "maxTrainees": 20,
    "lecturesCount": 64,
    "centerPercentage": 60,
    "trainerPercentage": 40,
    "centerSharePercentage": 50,
    "trainerSharePercentage": 50
  }
],
  programs: [
  {
    "id": "prog-1787970812683",
    "code": "ICT",
    "name": "مادة الكمبيوتر",
    "status": "active",
    "branchId": "branch-1",
    "courseIds": [
      "crs-1787428009076",
      "course-1787347508908",
      "course-1787347569318",
      "crs-1787427970903",
      "course-1787347401956",
      "course-1787347462419",
      "crs-1787428039994",
      "crs-1787427719238",
      "crs-1787427763144"
    ],
    "createdAt": "2026-08-29T02:33:32.683Z",
    "description": ""
  }
],
  groups: [
  {
    "id": "grp-1787351870532",
    "days": [
      "الاثنين",
      "الخميس"
    ],
    "name": "ICT4 - 3",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "19:00",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "18:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الاثنين",
      "الخميس"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI"
  },
  {
    "id": "grp-1787502480417-ltuf",
    "days": [
      "الجمعة"
    ],
    "name": "ICT-p1-L - 1",
    "status": "active",
    "branchId": "branch-1",
    "courseId": "crs-1787502480417-0ggk",
    "timeSlot": "04:00 م - 06:00 م",
    "maxCapacity": 10,
    "maxStudents": 10
  },
  {
    "id": "grp-1787502587826-wvu7",
    "days": [
      "الجمعة"
    ],
    "name": "ICT-p3-L - 1",
    "status": "active",
    "branchId": "branch-1",
    "courseId": "crs-1787502587826-q429",
    "timeSlot": "04:00 م - 06:00 م",
    "maxCapacity": 10,
    "maxStudents": 10
  },
  {
    "id": "grp-1787432103884",
    "days": [
      "السبت",
      "الثلاثاء"
    ],
    "name": "ICT4 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "19:00",
    "branchId": "branch-2",
    "courseId": "course-1787347401956",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "18:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "السبت",
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI"
  },
  {
    "id": "grp-1787431802246",
    "days": [
      "الأحد",
      "الأربعاء"
    ],
    "name": "ICT6 - 1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "15:00",
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "14:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الأحد",
      "الأربعاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1"
  },
  {
    "id": "grp-1787433082510",
    "days": [
      "الثلاثاء"
    ],
    "name": "ICT6 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "17:00",
    "branchId": "branch-2",
    "courseId": "course-1787347508908",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "16:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1"
  },
  {
    "id": "grp-1787358828709",
    "days": [
      "الاثنين",
      "الخميس"
    ],
    "name": "ICT - p1 - 3",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "18:00",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-08-22",
    "startTime": "17:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الاثنين",
      "الخميس"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH"
  },
  {
    "id": "grp-1787502489945-o2sh",
    "days": [
      "الجمعة"
    ],
    "name": "ICT-p1 - 1",
    "status": "active",
    "branchId": "branch-1",
    "courseId": "crs-1787502489944-bf2a",
    "timeSlot": "04:00 م - 06:00 م",
    "maxCapacity": 12,
    "maxStudents": 12
  },
  {
    "id": "grp-1787433327552",
    "days": [
      "السبت",
      "الثلاثاء"
    ],
    "name": "ICT - S2 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "20:00",
    "branchId": "branch-2",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-08-22",
    "startTime": "19:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "السبت",
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9"
  },
  {
    "id": "grp-1787432635686",
    "days": [
      "السبت",
      "الثلاثاء"
    ],
    "name": "ICT5 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "16:00",
    "branchId": "branch-2",
    "courseId": "course-1787347462419",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "15:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "السبت",
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3"
  },
  {
    "id": "grp-1787431608023",
    "days": [
      "الاثنين",
      "الخميس"
    ],
    "name": "ICT5 - 1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "15:00",
    "branchId": "branch-1",
    "courseId": "course-1787347462419",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-08-22",
    "startTime": "14:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الاثنين",
      "الخميس"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3"
  },
  {
    "id": "grp-1787350488774",
    "days": [
      "الاثنين",
      "الخميس"
    ],
    "name": "ICT4 - 2",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "17:00",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "16:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الاثنين",
      "الخميس"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI"
  },
  {
    "id": "grp-1787350487970",
    "days": [
      "الاثنين",
      "الخميس"
    ],
    "name": "ICT4 - 1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "16:00",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "",
    "startTime": "15:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الاثنين",
      "الخميس"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI"
  },
  {
    "id": "grp-1787358559234",
    "days": [
      "الأحد",
      "الأربعاء"
    ],
    "name": "ICT - p1 - 1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "16:00",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-08-22",
    "startTime": "15:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الأحد",
      "الأربعاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH"
  },
  {
    "id": "grp-1787433234491",
    "days": [
      "السبت",
      "الثلاثاء"
    ],
    "name": "ICT - S1 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "15:00",
    "branchId": "branch-2",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "14:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "السبت",
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9"
  },
  {
    "id": "grp-1787433160347",
    "days": [
      "السبت",
      "الثلاثاء"
    ],
    "name": "ICT - p1 - B1",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "18:00",
    "branchId": "branch-2",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "feeAmount": 250,
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "17:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 12,
    "maxStudents": 12,
    "scheduleDays": [
      "السبت",
      "الثلاثاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH"
  },
  {
    "id": "grp-1787358595611",
    "days": [
      "الأربعاء"
    ],
    "name": "ICT - p1 - 2",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "17:00",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "16:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الأربعاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH"
  },
  {
    "id": "grp-1787431825818",
    "days": [
      "الأحد",
      "الأربعاء"
    ],
    "name": "ICT6 - 2",
    "notes": "",
    "status": "active",
    "endDate": "",
    "endTime": "18:00",
    "branchId": "branch-1",
    "courseId": "course-1787347508908",
    "hallName": "قاعة 1",
    "roomName": "قاعة 1",
    "timeSlot": "04:00 م - 06:00 م",
    "materials": [],
    "startDate": "2026-09-01",
    "startTime": "17:00",
    "trainerId": "trainer-1787349806643",
    "assessments": [],
    "maxCapacity": 11,
    "maxStudents": 11,
    "scheduleDays": [
      "الأحد",
      "الأربعاء"
    ],
    "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1"
  }
],
  attendance: [
  {
    "id": "att-1787464456274-6gb2",
    "date": "2026-08-23",
    "time": "٠٥:٥٤ ص",
    "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)",
    "status": "present",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "courseId": "course-1787347569318",
    "traineeId": "trainee-1787361330810-d1if"
  },
  {
    "id": "att-1787466295224-u89e",
    "date": "2026-08-23",
    "time": "٠٦:٢٤ ص",
    "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)",
    "status": "present",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "traineeId": "trainee-1787459300939-62ly"
  },
  {
    "id": "att-1788073818872-s3t7",
    "date": "2026-08-30",
    "time": "٠٧:١٠ ص",
    "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-38 - IP: ais-pre-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)",
    "status": "present",
    "groupId": "grp-1787351870532",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "traineeId": "trainee-1787541849209-4xin8"
  },
  {
    "id": "att-1788074652104-xgf9",
    "date": "2026-08-30",
    "time": "٠٧:٢٤ ص",
    "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-TESTER - IP: 127.0.0.1)",
    "status": "present",
    "groupId": "grp-1787351870532",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "traineeId": "trainee-1787936711415"
  }
],
  payments: [],
  expenses: [],
  trainerSettlements: [],
  pointRules: [
  {
    "id": "rule-2",
    "title": "المشاركة والتفاعل",
    "isActive": true,
    "ruleType": "participation",
    "pointValue": 20,
    "description": "التفاعل الإيجابي أثناء المحاضرة"
  },
  {
    "id": "rule-4",
    "title": "التميز والتفوق",
    "isActive": true,
    "ruleType": "excellence",
    "pointValue": 50,
    "description": "الحصول على المركز الأول أو عمل مميز"
  },
  {
    "id": "rule-1",
    "title": "تسجيل الحضور",
    "isActive": true,
    "ruleType": "attendance",
    "pointValue": 10,
    "description": "نقاط الحضور في الموعد المحدد"
  },
  {
    "id": "rule-3",
    "title": "إنجاز المهمة / الواجب",
    "isActive": true,
    "ruleType": "task",
    "pointValue": 30,
    "description": "تسليم التطبيقات العملية والواجبات"
  },
  {
    "id": "rule-5",
    "title": "مخالفة أو تأخير",
    "isActive": true,
    "ruleType": "violation",
    "pointValue": -10,
    "description": "التأخير أو عدم الالتزام بقواعد القاعة"
  }
],
  pointTransactions: [
  {
    "id": "pt-1787466295224",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-83)",
    "ruleId": "rule-1",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T06:24:55.224Z",
    "traineeId": "trainee-1787459300939-62ly",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1788036391076",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "grp-1787351870532",
    "branchId": "branch-1",
    "createdAt": "2026-08-29T20:46:31.076Z",
    "traineeId": "trainee-1787541849209-4xin8",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1788032262828",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "grp-1787351870532",
    "branchId": "branch-1",
    "createdAt": "2026-08-29T19:37:42.828Z",
    "traineeId": "trainee-1787541849209-4xin8",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-reinf-1787465508933-s3j0",
    "points": 16,
    "reason": "[تعزيز وتحفيز مباشر]: مشاركة وتعاون متميز! - دعم ومساعدة الزملاء في حل التحديات البرمجية!",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T06:11:48.933Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "trainer",
    "addedByUserName": "المدرب"
  },
  {
    "id": "pt-1787459955413-444o",
    "points": 100,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "grp-1787431608023",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T04:39:15.413Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787459938649-2nop",
    "points": 23,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T04:38:58.649Z",
    "traineeId": "trainee-1787459300939-62ly",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-reinf-1787362796188-3kij",
    "points": 51,
    "reason": "[تعزيز وتحفيز مباشر]: تحية وتشجيع لجميع متدربي القاعة! 🚀 - تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:39:56.188Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "trainer",
    "addedByUserName": "المدرب"
  },
  {
    "id": "pt-1787362526303-m12r",
    "points": 10,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:35:26.303Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787464456275",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-83)",
    "ruleId": "rule-1",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T05:54:16.275Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787459946569-3pse",
    "points": 100,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "grp-1787350487970",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T04:39:06.569Z",
    "traineeId": "trainee-1787459300939-62ly",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787430858701-5izp",
    "points": 100,
    "reason": "إنجاز أسطوري وجائزة التميز الكبرى",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T20:34:18.701Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787362695962-fjl7",
    "points": 15,
    "reason": "إجابة صحيحة في الجلسة التفاعلية",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:38:15.962Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787362380117-64xv",
    "points": 15,
    "reason": "إجابة صحيحة في الجلسة التفاعلية",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:33:00.117Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-reinf-1787362006056-suqi",
    "points": 51,
    "reason": "[تعزيز وتحفيز مباشر]: تحية وتشجيع لجميع متدربي القاعة! 🚀 - تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:26:46.056Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "trainer",
    "addedByUserName": "المدرب"
  },
  {
    "id": "pt-1787361433577-8oxr",
    "points": 30,
    "reason": "إجابة نموذجية وسرعة بديهة",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:17:13.577Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787360877177",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:07:57.177Z",
    "traineeId": "trainee-1787352042655-o2znr",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787359713319",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:48:33.319Z",
    "traineeId": "trainee-1787352042654-aj70e",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787356997939-59aa",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-s4ys4",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-pk4l",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-1fxlt",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-fua0",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-ab5pp",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-z7py",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-b1r9p",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-k78n",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-e68mx",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-6tg2",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-89sik",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-v46t",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-jd4tp",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-a2vo",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-i39ds",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-b4g6",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-x6x9f",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-4wwh",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054264-zxwq0",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787362271687",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:31:11.687Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787361922519",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:25:22.519Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787361426705-x0vc",
    "points": 30,
    "reason": "إجابة نموذجية وسرعة بديهة",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T01:17:06.705Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787359878296",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "groupId": "grp-1787358559234",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:51:18.296Z",
    "traineeId": "trainee-1787352042655-bkzr9",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787356997939-907a",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-40z66",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-ubxr",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-jijye",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-5mia",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-te1p2",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-r3p6",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054266-whiuc",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-jin9",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-mvg2v",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-r8hk",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-tnqmk",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-mehg",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-s3igz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-7ffv",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-hx8no",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-p4jl",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054265-h6wwj",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-rfh1",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054264-rv552",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997939-1jqb",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054264-kl9ca",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-e6it",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054264-b4aee",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-khrh",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-tuyfw",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-f7v9",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-wuwwn",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-qbe5",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-d4hmz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-leow",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-zrex8",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-qyyb",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.939Z",
    "traineeId": "trainee-1787352054264-0vyqu",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-vyhk",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054264-xkezz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-2n68",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-81qro",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-lkua",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-e6srh",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-tz9l",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054263-2wlgz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-i5ym",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054262-fehxv",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-lvks",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042663-wgwj3",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-g4qj",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042663-lrb0e",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-cqb3",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-58hi5",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-k6tj",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-avarj",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-07j9",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-b9go0",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-0cjj",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-3tq3x",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-i9yq",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-vllz8",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-n4r6",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-4ky49",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-yr8d",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-kwgj5",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-v49t",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-lazq8",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-9s5r",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-83zkl",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-s8uv",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-rc13v",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-5rl3",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-oq0mk",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-xc39",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-tm3jn",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-rhmr",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352054262-hvrlu",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-z072",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042663-jye60",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-ik96",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-kh71r",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-216e",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-b5noo",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-mjlw",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-t70xe",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-q89t",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042662-z17c5",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-gme9",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-yss51",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-0cc2",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-2h51r",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-g88v",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-gatx4",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-fd0x",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-bn13o",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-985m",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042661-5wiuu",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-lciy",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-3jdfj",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-se6g",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-3pzc7",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-4zwj",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-fg0l2",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-fon5",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-55ejb",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-0d04",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-rhqwa",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-s2ix",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-ar42s",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-nz5m",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-jh7kz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-9tib",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-vjfom",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-47rb",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-30u4t",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-00pc",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-fvl4h",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-s81f",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042660-9dlhd",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-o6wx",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-gqgsy",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-angs",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-e04f9",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-yyio",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-evsvu",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-zkpq",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-6w8y1",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-ux8q",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-h207g",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-9pqe",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-sthr3",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-zt8u",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-ghc76",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-weog",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042657-1a5h3",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-4dp6",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042657-8fcyh",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-125j",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042656-rv47j",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-kag7",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042656-gud54",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-fs6o",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042655-3lihh",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-ft81",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042655-bkzr9",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-ll3o",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042654-aj70e",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-reinf-1787356402355-8ix9",
    "points": 6,
    "reason": "[تعزيز وتحفيز مباشر]: تقدير وتميز للمتدرب (جهاز PC-71) 🌟 - إجابة متقنة وتطبيق عملي متميز خلال التمرين!",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T23:53:22.355Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "trainer",
    "addedByUserName": "المدرب"
  },
  {
    "id": "pt-1787356160111-dw3h",
    "points": 50,
    "reason": "تفوق واختبار متميز 🌟",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T23:49:20.111Z",
    "traineeId": "trainee-1787352042654-pluyz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787355883695-uifc",
    "points": 30,
    "reason": "إجابة نموذجية وسرعة بديهة",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T23:44:43.695Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787352484632-vnjm",
    "points": 15,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:48:04.632Z",
    "traineeId": "trainee-1787352042654-aj70e",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787356997938-ajmv",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042659-iulgm",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-tndb",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-ftf8i",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-q0rl",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-ch8fv",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-89ri",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042658-1n9q9",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-2e73",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042657-2qd5a",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-hvnv",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042657-q46jv",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-bv2g",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042656-jn14r",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-i9tu",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042656-l3txa",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-1s9h",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042655-o2znr",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-vzcx",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787352042654-pluyz",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787356997938-4g1k",
    "points": 30,
    "reason": "سلوك راقٍ ومساعدة الزملاء",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-22T00:03:17.938Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-reinf-1787356276902-zudl",
    "points": 21,
    "reason": "[تعزيز وتحفيز مباشر]: إجابة نموذجية وإبداع برمجي! - طريقة تفكير وحل استثنائي يستحق الإشادة!",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T23:51:16.902Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "trainer",
    "addedByUserName": "المدرب"
  },
  {
    "id": "pt-1787356156650-h18e",
    "points": 50,
    "reason": "تفوق واختبار متميز 🌟",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T23:49:16.650Z",
    "traineeId": "trainee-1787352042654-aj70e",
    "addedByUserId": "user-admin",
    "addedByUserName": "مدير عام النظام"
  },
  {
    "id": "pt-1787352904987",
    "points": 10,
    "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
    "ruleId": "rule-1",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:55:04.987Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "system",
    "addedByUserName": "النظام الآلي للمعمل"
  },
  {
    "id": "pt-1787352471508-uvf6",
    "points": 10,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "groupId": "",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:47:51.508Z",
    "traineeId": "trainee-1787352042654-aj70e",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787349991130-8r97",
    "points": 15,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:06:31.130Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787446474044",
    "points": 55,
    "reason": "تسليم واجب: واجب تطبيق الدرس العملي والمشروع الرئيسي (تقييم ذكي: 100%)",
    "ruleId": "rule-3",
    "groupId": "grp-1787358595611",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T00:54:34.044Z",
    "traineeId": "trainee-1787361330810-d1if",
    "addedByUserId": "ai-engine",
    "addedByUserName": "نظام تصحيح الذكاء الاصطناعي"
  },
  {
    "id": "pt-1787350954168-igdw",
    "points": 10,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:22:34.168Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787349976876-o45n",
    "points": 10,
    "reason": "مشاركة ممتازة وتسليم المشروع العملي",
    "branchId": "branch-1",
    "createdAt": "2026-08-21T22:06:16.876Z",
    "traineeId": "trainee-1787347185722-0aw8",
    "addedByUserId": "admin",
    "addedByUserName": "مسؤول النقاط"
  },
  {
    "id": "pt-1787451229685-5xl3",
    "points": 20,
    "reason": "⭐ مكافأة إتقان (واجب تطبيق الدرس - الكتاب المدرسي): درجة 90/100 (90%)",
    "groupId": "grp-1787431608023",
    "branchId": "branch-1",
    "createdAt": "2026-08-23T02:13:49.685Z",
    "traineeId": "trainee-1787361410293-aeko",
    "addedByUserId": "ai-scanner",
    "addedByUserName": "مصحح الذكاء الاصطناعي"
  }
],
  exams: [
  {
    "id": "exam-1787446743699",
    "title": "امتحان مادة تكنولوجيا المعلومات والاتصالات - الصف الخامس الابتدائي - الفصل الدراسي الأول",
    "status": "scheduled",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "examDate": "2026-08-23",
    "totalMarks": 100,
    "instructions": "اختبار شامل لمادة تكنولوجيا المعلومات والاتصالات للصف الخامس الابتدائي، يغطي المفاهيم الأساسية لشبكات الإنترنت والإنترانت، مكونات الحاسوب ووحدات القياس، حماية حقوق النشر، التمييز بين الحقائق والآراء، استخدام برامج Microsoft Office، ومفاهيم الأمان الرقمي والتوصيل.",
    "passingMarks": 50,
    "durationMinutes": 90
  },
  {
    "id": "hw-scan-1787451229685",
    "title": "واجب تطبيق الدرس - الكتاب المدرسي",
    "status": "completed",
    "groupId": "grp-1787431608023",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "examDate": "2026-08-23",
    "totalMarks": 100,
    "instructions": "تصحيح ورقي آلي عبر الماسح الذكي وكود المتدرب",
    "passingMarks": 60,
    "durationMinutes": 30
  },
  {
    "id": "exam-1787463526231",
    "title": "الاختبار القبلي للدورة",
    "status": "scheduled",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "examDate": "2026-08-23",
    "totalMarks": 100,
    "instructions": "يرجى الإجابة عن جميع الأسئلة والالتزام بالوقت المحدد.",
    "durationMinutes": 60
  }
],
  examQuestions: [
  {
    "id": "q-1787446743699-0-m40",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "questionText": "يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.",
    "questionType": "mcq",
    "correctAnswer": "C"
  },
  {
    "id": "q-1787446743699-1-0ij",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "word",
      "الراوتر",
      "بنك المعرفة المصري",
      "لوحة المفاتيح"
    ],
    "questionText": "..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.",
    "questionType": "mcq",
    "correctAnswer": "الراوتر"
  },
  {
    "id": "q-1787446743699-2-rg3",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "ميجابايت في الثانية",
      "جيجا هرتز",
      "بايت",
      "كيلوبايت"
    ],
    "questionText": "........ وحدة قياس لعدد الدورات التي تنفذها وحدة المعالجة المركزية في الثانية.",
    "questionType": "mcq",
    "correctAnswer": "جيجا هرتز"
  },
  {
    "id": "q-1787446743699-8-xpd",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "صح",
      "خطأ"
    ],
    "questionText": "يمكننا ترتيب المعلومات أبجدياً في برنامج Excel باستخدام خاصية Sort.",
    "questionType": "true_false",
    "correctAnswer": "صح"
  },
  {
    "id": "q-1787446743699-9-n8l",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "صح",
      "خطأ"
    ],
    "questionText": "مواقع الجوائز والمكافآت تقدم عروضاً مالية كبيرة وجوائز غير حقيقية.",
    "questionType": "true_false",
    "correctAnswer": "صح"
  },
  {
    "id": "q-1787446743699-10-7gz",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [],
    "questionText": "البايت هو وحدة قياس مساحة ............ بجهاز الكمبيوتر.",
    "questionType": "short_answer",
    "correctAnswer": "التخزين"
  },
  {
    "id": "q-1787446743699-12-9c7",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [],
    "questionText": "يستخدم ................ الإنترنت لاقتحام أنظمة الكمبيوتر وسرقة المعلومات.",
    "questionType": "short_answer",
    "correctAnswer": "المخترقون"
  },
  {
    "id": "q-1787446743699-14-jvs",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [],
    "questionText": "يستخدم برنامج ................ لعمل الجداول الحسابية.",
    "questionType": "short_answer",
    "correctAnswer": "Excel"
  },
  {
    "id": "q-1787446743699-16-2lq",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "هو سلك يربط جهاز الكمبيوتر بجهاز التوجيه (الراوتر)",
      "هي خدمة الإنترنت التي تقدمها الشركات المصرية",
      "تساعد المكفوفين على القراءة",
      "إدخال الصور والرسوم للكمبيوتر"
    ],
    "questionText": "سلك إيثرنت (Ethernet):",
    "questionType": "mcq",
    "correctAnswer": "هو سلك يربط جهاز الكمبيوتر بجهاز التوجيه (الراوتر)"
  },
  {
    "id": "q-1787446743699-18-blv",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "تساعد المكفوفين على القراءة",
      "إدخال الصور والرسوم للكمبيوتر",
      "سلك لربط الأجهزة",
      "برنامج للجداول الحسابية"
    ],
    "questionText": "طريقة برايل (Braille):",
    "questionType": "mcq",
    "correctAnswer": "تساعد المكفوفين على القراءة"
  },
  {
    "id": "q-1787446743699-3-van",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "أعد تشغيل الكمبيوتر والراوتر",
      "حذف برنامج word",
      "تحديث النظام",
      "إيقاف تشغيل الشاشة"
    ],
    "questionText": "لحل مشكلة بطء التحميل.............",
    "questionType": "mcq",
    "correctAnswer": "أعد تشغيل الكمبيوتر والراوتر"
  },
  {
    "id": "q-1787446743699-4-v64",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "الإنترنت",
      "الإنترانت",
      "الويب",
      "وسائل التواصل الاجتماعي"
    ],
    "questionText": "يستخدم ............. لمشاركة المعلومات عبر شبكة مغلقة، وهو أكثر أماناً.",
    "questionType": "mcq",
    "correctAnswer": "الإنترانت"
  },
  {
    "id": "q-1787446743699-5-ppk",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "صح",
      "خطأ"
    ],
    "questionText": "WWW هو اختصار لـ world wide web.",
    "questionType": "true_false",
    "correctAnswer": "صح"
  },
  {
    "id": "q-1787446743699-6-pyf",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "صح",
      "خطأ"
    ],
    "questionText": "مواقع التسوق المزيفة ترسل لك العناصر الصحيحة التي قمت بشرائها.",
    "questionType": "true_false",
    "correctAnswer": "خطأ"
  },
  {
    "id": "q-1787446743699-7-22x",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "صح",
      "خطأ"
    ],
    "questionText": "واحدة من المشكلات الشائعة التي تواجهها عند استخدام الكمبيوتر والإنترنت هي بطء التحميل.",
    "questionType": "true_false",
    "correctAnswer": "صح"
  },
  {
    "id": "q-1787446743699-11-8lm",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [],
    "questionText": "يستخدم برنامج ................ لكتابة التقارير.",
    "questionType": "short_answer",
    "correctAnswer": "Word"
  },
  {
    "id": "q-1787446743699-13-khg",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [],
    "questionText": "تستند الآراء إلى وجهة ............ الشخص وخبراته.",
    "questionType": "short_answer",
    "correctAnswer": "نظر"
  },
  {
    "id": "q-1787446743699-15-k02",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "1024 ميجابايت",
      "1000 بايت",
      "1024 كيلوبايت",
      "8 بت"
    ],
    "questionText": "1 جيجابايت تساوي:",
    "questionType": "mcq",
    "correctAnswer": "1024 ميجابايت"
  },
  {
    "id": "q-1787446743699-17-1qr",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "هي خدمة الإنترنت التي تقدمها الشركات للمستخدمين",
      "إدخال الصور والرسوم للكمبيوتر",
      "تساعد المكفوفين على القراءة",
      "وحدة قياس سرعة المعالج"
    ],
    "questionText": "مزود خدمة الإنترنت (ISP):",
    "questionType": "mcq",
    "correctAnswer": "هي خدمة الإنترنت التي تقدمها الشركات للمستخدمين"
  },
  {
    "id": "q-1787446743699-19-e3v",
    "marks": 5,
    "examId": "exam-1787446743699",
    "options": [
      "إدخال الصور والرسوم للكمبيوتر",
      "تساعد المكفوفين على القراءة",
      "خدمة تزويد الإنترنت",
      "وحدة تخزين للبيانات"
    ],
    "questionText": "الماسح الضوئي (Scanner):",
    "questionType": "mcq",
    "correctAnswer": "إدخال الصور والرسوم للكمبيوتر"
  }
],
  examResults: [
  {
    "id": "res-1787451229685-hea2",
    "notes": "أداء رائع ومتميز جداً! تم فحص وتصحيح الصفحة وإضافة الدرجات والنقاط التشجيعية إلى الملف بنجاح.",
    "score": 90,
    "examId": "hw-scan-1787451229685",
    "rating": "ممتاز",
    "status": "passed",
    "traineeId": "trainee-1787361410293-aeko",
    "percentage": 90,
    "totalMarks": 100,
    "submittedAt": "2026-08-23T02:13:49.685Z",
    "traineeName": "رفيف محمد رمضان بخيت"
  }
],
  interactiveSessions: [
  {
    "id": "is-1787362394743",
    "url": "https://kahoot.it",
    "notes": "",
    "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
    "groupId": "grp-1",
    "branchId": "branch-1",
    "platform": "Kahoot",
    "sessionDate": "2026-08-22"
  },
  {
    "id": "is-1787362644609",
    "url": "https://kahoot.ithttps://kahoot.it/challenge/04274914?challenge-id=6f2f94ac-6722-4128-b6c1-72224d86b6ff_1787362624408",
    "notes": "",
    "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
    "groupId": "grp-1",
    "branchId": "branch-1",
    "platform": "Kahoot",
    "questions": [
      {
        "id": "q-1787362688971",
        "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
        "points": 15,
        "options": [
          "useState()",
          "useEffect()",
          "useRef()",
          "useMemo()"
        ],
        "timeLimitSeconds": 30,
        "correctOptionIndex": 1
      }
    ],
    "sessionDate": "2026-08-22",
    "currentQuestionIndex": 0
  },
  {
    "id": "is-1787362337448",
    "url": "https://kahoot.it",
    "notes": "",
    "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
    "groupId": "grp-1",
    "branchId": "branch-1",
    "platform": "Kahoot",
    "questions": [
      {
        "id": "q-1787362348311",
        "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
        "points": 15,
        "options": [
          "useState()",
          "useEffect()",
          "useRef()",
          "useMemo()"
        ],
        "timeLimitSeconds": 30,
        "correctOptionIndex": 1
      },
      {
        "id": "q-1787362373107",
        "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
        "points": 15,
        "options": [
          "useState()",
          "useEffect()",
          "useRef()",
          "useMemo()"
        ],
        "timeLimitSeconds": 30,
        "correctOptionIndex": 1
      }
    ],
    "sessionDate": "2026-08-22",
    "currentQuestionIndex": 1
  }
],
  devices: [
  {
    "id": "dev-1787352892067",
    "name": "جهاز PC-71",
    "status": "active",
    "branchId": "branch-1",
    "deviceId": "PC-71",
    "isOnline": false,
    "userType": "trainee",
    "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
    "assignedUser": "اسر محمد عصام ابو الخير",
    "lastHeartbeat": "2026-08-29T20:46:29.223Z",
    "currentTraineeId": "trainee-1787541849209-4xin8",
    "lastArchivedTime": "2026-08-23T06:01:50.050Z",
    "lastScreenshotUrl": "data:image/jpeg;base64,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",
    "currentTraineeName": "اسر محمد عصام ابو الخير",
    "lastScreenshotTime": "2026-08-22T01:34:48.102Z"
  },
  {
    "id": "dev-1787464212308",
    "name": "جهاز PC-83",
    "status": "active",
    "branchId": "branch-1",
    "deviceId": "PC-83",
    "isOnline": false,
    "userType": "trainee",
    "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
    "assignedUser": "مرام محمد رمضان بخيت",
    "lastHeartbeat": "2026-08-23T06:32:38.297Z",
    "currentTraineeId": "trainee-1787361330810-d1if",
    "lastArchivedTime": "2026-08-23T06:32:12.588Z",
    "lastScreenshotUrl": "data:image/jpeg;base64,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",
    "currentTraineeName": "مرام محمد رمضان بخيت"
  },
  {
    "id": "dev-1788034811666",
    "os": "Windows 10/11",
    "name": "LAB-PC-01",
    "status": "active",
    "branchId": "branch-1",
    "deviceId": "LAB-MAIN-72",
    "isOnline": true,
    "roomName": "صالة المعمل",
    "userType": "trainee",
    "ipAddress": "127.0.0.1",
    "macAddress": "00:11:22:33:44:55",
    "agentVersion": "v2.4.1",
    "assignedUser": "جهاز معمل معتمد",
    "enrollmentKey": "NAGAH-CERT-2026-SECURE",
    "lastHeartbeat": "2026-08-29T21:22:09.895Z",
    "lastScreenshotUrl": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUzYThhIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMjA2MTciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIGZpbGw9InVybCgjYmcpIi8+PHJlY3QgeD0iMCIgeT0iNjgwIiB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzAyMDYxNyIgb3BhY2l0eT0iMC45Ii8+PHJlY3QgeD0iNTYwIiB5PSI2ODIiIHdpZHRoPSIxNjAiIGhlaWdodD0iMzYiIHJ4PSI4IiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjU4NSIgY3k9IjcwMCIgcj0iMTAiIGZpbGw9IiMzOGJkZjgiLz48cmVjdCB4PSI2MTAiIHk9IjY5NCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iI2NiZDVlMSIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLCA2MCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcng9IjEyIiBmaWxsPSIjZmJiZjI0Ii8+PHRleHQgeD0iMzAiIHk9IjM4IiBmb250LXNpemU9IjI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OBPC90ZXh0Pjx0ZXh0IHg9IjMwIiB5PSI3OCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7Yp9mE2YXYtNin2LHZiti5PC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MCwgMTYwKSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTIiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSIzMCIgeT0iMzgiIGZvbnQtc2l6ZT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkrs8L3RleHQ+PHRleHQgeD0iMzAiIHk9Ijc4IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPtiq2LfYqNmK2YLYp9iqPC90ZXh0PjwvZz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjY4MCIgaGVpZ2h0PSI0MjAiIHJ4PSIxMiIgZmlsbD0iIzBmMTcyYSIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIzMDAiIHk9IjEyMCIgd2lkdGg9IjY4MCIgaGVpZ2h0PSI0MCIgcng9IjEyIiBmaWxsPSIjMWUyOTNiIi8+PGNpcmNsZSBjeD0iMzI1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjZjQzZjVlIi8+PGNpcmNsZSBjeD0iMzQ1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjZmJiZjI0Ii8+PGNpcmNsZSBjeD0iMzY1IiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNjQwIiB5PSIxNDUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNlMmU4ZjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPtio2YrYptipINin2YTYqti32YjZitixINmI2KfZhNiq2K/YsdmK2Kgg2KfZhNi52YXZhNmKIC0g2LPYt9itINmF2YPYqtioINin2YTYt9in2YTYqDwvdGV4dD48dGV4dCB4PSI2NDAiIHk9IjMyMCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM4YmRmOCIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+2LTYp9i02Kkg2LPYt9itINmF2YPYqtioINin2YTYt9in2YTYqCDZhti02LfYqSDZiNis2KfZh9iy2Kkg2YTZhNmF2KrYp9io2LnYqSDwn5al77iPPC90ZXh0Pjwvc3Zn>"
  },
  {
    "id": "dev-1787362571450",
    "name": "جهاز PC-74",
    "status": "active",
    "branchId": "branch-1",
    "deviceId": "PC-74",
    "isOnline": false,
    "userType": "trainee",
    "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
    "assignedUser": "مرام محمد رمضان بخيت",
    "lastHeartbeat": "2026-08-22T01:46:31.883Z",
    "currentTraineeId": "trainee-1787361330810-d1if",
    "lastScreenshotUrl": "data:image/jpeg;base64,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Kq2+pGBiM5MgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA52am5/JBmpufyQhBGk2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAE2am5/JBmpufyQhAAGQFYBsjHOS7Wqqe5DOqfyO6BGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoDfVP5HdBqn8jugGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoDfVP5HdBqn8jugGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoDfVP5HdBqn8jugGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoDfVP5HdBqn8jugGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoDfVP5HdBqn8jugGgN9U/kd0GqfyO6AaA31T+R3Qap/I7oBoD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8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XDMR8risALOYj5XGk0zXsRrUVLLfaQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q==",
    "currentTraineeName": "مرام محمد رمضان بخيت",
    "lastScreenshotTime": "2026-08-22T01:46:31.883Z"
  },
  {
    "id": "dev-1787974783991",
    "name": "جهاز PC-15",
    "status": "active",
    "branchId": "branch-1",
    "deviceId": "PC-15",
    "isOnline": false,
    "userType": "trainee",
    "ipAddress": "ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app",
    "assignedUser": "مرام محمد رمضان بخيت",
    "lastHeartbeat": "2026-08-29T19:12:41.848Z",
    "currentTraineeId": "trainee-1787361330810-d1if",
    "lastArchivedTime": "2026-08-29T19:12:29.916Z",
    "lastScreenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=",
    "currentTraineeName": "مرام محمد رمضان بخيت"
  }
],
  deviceCommands: [
  {
    "id": "cmd-1787353097554-p0hu",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T22:58:17.554Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354001394-29ga",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:21.394Z",
    "commandType": "shutdown",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354015351-86zr",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:35.351Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354029696-im13",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:49.696Z",
    "commandType": "shutdown",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354032145-aecj",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:52.145Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354041352-4hy8",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:14:01.352Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787356276902-vhwg",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"إجابة نموذجية وإبداع برمجي!\",\"message\":\"طريقة تفكير وحل استثنائي يستحق الإشادة!\",\"stars\":2,\"points\":21,\"icon\":\"💡\",\"trainerName\":\"المدرب\",\"badgeText\":\"إجابة ذكية 💡\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787347185722-0aw8\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"م001\",\"points\":86,\"totalPoints\":86,\"starsCount\":8,\"overallRank\":1,\"totalTrainees\":93,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"المجموعة التدريبية\"},\"timestamp\":1787356276902}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:51:16.902Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-reinf-1787356402355-v7bl",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"تقدير وتميز للمتدرب (جهاز PC-71) 🌟\",\"message\":\"إجابة متقنة وتطبيق عملي متميز خلال التمرين!\",\"stars\":1,\"points\":6,\"icon\":\"⭐\",\"trainerName\":\"المدرب\",\"badgeText\":\"نجم الحصة 🌟\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787347185722-0aw8\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"م001\",\"points\":92,\"totalPoints\":92,\"starsCount\":9,\"overallRank\":1,\"totalTrainees\":93,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"المجموعة التدريبية\"},\"timestamp\":1787356402355}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:53:22.355Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787356414736-jjr2",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:53:34.736Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359750791-8wfc",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:49:10.791Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359844994-ulcx",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:50:44.994Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359891812-c3rp",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:51:31.812Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787361823607-h42c",
    "status": "delivered",
    "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:23:43.607Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787361946709-9afo",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:25:46.709Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787361966040-apct",
    "status": "delivered",
    "payload": "{\"action\":\"open_url\",\"url\":\"https://ekb.eg\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:26:06.040Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787362019251-7w0k",
    "status": "delivered",
    "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:26:59.251Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787362348513-a1gq",
    "status": "delivered",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362348311\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362337448\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:32:28.513Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787362689677-yjfn",
    "status": "delivered",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362688971\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-22T01:38:09.677Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465201407-6aig",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:06:41.407Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465201417-a9n3",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-83",
    "createdAt": "2026-08-23T06:06:41.417Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465219898-dti6",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-23T06:06:59.898Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787353106454-soht",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T22:58:26.454Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354006700-aj23",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:26.700Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354026862-rr6k",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:46.862Z",
    "commandType": "reboot",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354031215-0bch",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:51.215Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354032335-4ijw",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:13:52.335Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787354064072-vh8f",
    "status": "delivered",
    "payload": "يرجى الانتباه للشرح على شاشة العرض الرئيسية الآن",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:14:24.072Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787356296742-0kh6",
    "status": "delivered",
    "payload": "{\"action\":\"clean_reset\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:51:36.742Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787356411197-0s5l",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-21T23:53:31.197Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359735524-d1qd",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:48:55.524Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359794426-l3ti",
    "status": "delivered",
    "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:49:54.426Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787359857348-su60",
    "status": "delivered",
    "payload": "{\"action\":\"clean_reset\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:50:57.348Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787359897685-4kor",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T00:51:37.685Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787361853660-46fb",
    "status": "delivered",
    "payload": "{\"action\":\"open_url\",\"url\":\"https://ekb.eg\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:24:13.660Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787361949497-kdv9",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:25:49.497Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787362006056-hcvq",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":91,\"totalPoints\":91,\"starsCount\":9,\"overallRank\":1,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787362006056}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:26:46.056Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787362097808-gd69",
    "status": "delivered",
    "payload": "{\"action\":\"clean_reset\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:28:17.808Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787362373263-ez7g",
    "status": "delivered",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362373107\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362337448\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:32:53.263Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787362689678-ea43",
    "status": "delivered",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362688971\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:38:09.678Z",
    "commandType": "message",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787362796188-vx8o",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":142,\"totalPoints\":142,\"starsCount\":14,\"overallRank\":1,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787362796188}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-22T01:39:56.188Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787465198120-pvb9",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-23T06:06:38.120Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787362796188-fq1i",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361410293-aeko\",\"fullName\":\"رفيف محمد رمضان بخيت\",\"code\":\"A002\",\"points\":80,\"totalPoints\":80,\"starsCount\":8,\"overallRank\":2,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥈\",\"courseName\":\"ICT5\",\"groupName\":\"ICT - p1 - 1\"},\"timestamp\":1787362796188}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-22T01:39:56.188Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787465198118-7q91",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:06:38.118Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465198123-ij0i",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-83",
    "createdAt": "2026-08-23T06:06:38.123Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465201413-919a",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-23T06:06:41.413Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465219889-1xrf",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:06:59.889Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465219906-aue4",
    "status": "delivered",
    "payload": "{}",
    "deviceId": "PC-83",
    "createdAt": "2026-08-23T06:06:59.906Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465249333-45kp",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:07:29.333Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465251082-86ej",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:07:31.082Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787465508933-i05s",
    "status": "pending",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361410293-aeko\",\"fullName\":\"رفيف محمد رمضان بخيت\",\"code\":\"A002\",\"points\":200,\"totalPoints\":200,\"starsCount\":20,\"overallRank\":2,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥈\",\"courseName\":\"ICT5\",\"groupName\":\"ICT5 - 1\"},\"timestamp\":1787465508933}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:11:48.933Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-reinf-1787465508933-1vz5",
    "status": "delivered",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":383,\"totalPoints\":383,\"starsCount\":38,\"overallRank\":1,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787465508933}",
    "deviceId": "PC-83",
    "createdAt": "2026-08-23T06:11:48.933Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787465546211-41zl",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787362571450",
    "issuedAt": "2026-08-23T06:12:26.211Z",
    "createdAt": "2026-08-23T06:12:26.211Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  },
  {
    "id": "cmd-1787465607959-4kac",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787352892067",
    "issuedAt": "2026-08-23T06:13:27.959Z",
    "createdAt": "2026-08-23T06:13:27.959Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  },
  {
    "id": "cmd-1787465607959-f87n",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787464212308",
    "issuedAt": "2026-08-23T06:13:27.959Z",
    "createdAt": "2026-08-23T06:13:27.959Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  },
  {
    "id": "cmd-1787465249309-e2bi",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:07:29.309Z",
    "commandType": "lock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465249341-is12",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:07:29.341Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-1787465255242-lpet",
    "status": "pending",
    "payload": "{}",
    "deviceId": "PC-71",
    "createdAt": "2026-08-23T06:07:35.242Z",
    "commandType": "unlock",
    "issuedByUserId": "admin"
  },
  {
    "id": "cmd-reinf-1787465508933-sin1",
    "status": "pending",
    "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":383,\"totalPoints\":383,\"starsCount\":38,\"overallRank\":1,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787465508933}",
    "deviceId": "PC-74",
    "createdAt": "2026-08-23T06:11:48.933Z",
    "commandType": "message",
    "issuedByUserId": "trainer"
  },
  {
    "id": "cmd-1787465546210-zzpk",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787352892067",
    "issuedAt": "2026-08-23T06:12:26.211Z",
    "createdAt": "2026-08-23T06:12:26.210Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  },
  {
    "id": "cmd-1787465546211-4no7",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787464212308",
    "issuedAt": "2026-08-23T06:12:26.211Z",
    "createdAt": "2026-08-23T06:12:26.211Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  },
  {
    "id": "cmd-1787465607959-1z3r",
    "status": "pending",
    "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
    "deviceId": "dev-1787362571450",
    "issuedAt": "2026-08-23T06:13:27.959Z",
    "createdAt": "2026-08-23T06:13:27.959Z",
    "commandType": "message",
    "issuedByUserId": "trainer-live"
  }
],
  certificates: [
  {
    "id": "cert-1787347853394",
    "grade": "ممتاز مع مرتبة الشرف",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "issueDate": "2026-08-21",
    "qrPayload": "{\"certificateNumber\":\"CERT-2026-53394\",\"traineeName\":\"مرام محمد رمضان بخيت\",\"courseName\":\"ICT4\",\"issueDate\":\"2026-08-21\",\"center\":\"مركز النجاح للتدريب والاستشارات\"}",
    "traineeId": "trainee-1787347185722-0aw8",
    "courseName": "ICT4",
    "managerName": "مدير عام المركز",
    "traineeName": "مرام محمد رمضان بخيت",
    "trainerName": "المدرب المعتمد",
    "durationText": "64 ساعة تدريبية",
    "serialNumber": "CERT-2026-53394",
    "certificateNumber": "CERT-2026-53394"
  },
  {
    "id": "cert-1787450838230",
    "grade": "امتياز مع مرتبة الشرف (A+)",
    "branchId": "branch-1",
    "courseId": "course-1787347401956",
    "issueDate": "2026-08-23",
    "qrPayload": "{\"certificateNumber\":\"CERT-2026-38230\",\"traineeName\":\"رفيف محمد رمضان بخيت\",\"courseName\":\"ICT4\",\"issueDate\":\"2026-08-23\",\"center\":\"مركز النجاح للتدريب والاستشارات\"}",
    "traineeId": "trainee-1787361410293-aeko",
    "courseName": "ICT4",
    "templateId": "template-1787450798128",
    "managerName": "د. محمد رمضان بخيت",
    "traineeName": "رفيف محمد رمضان بخيت",
    "trainerName": "المدرب المعتمد",
    "durationText": "30 ساعة تدريبية معتمدة",
    "serialNumber": "CERT-2026-38230",
    "certificateNumber": "CERT-2026-38230"
  }
],
  trainerAttestations: [],
  certificateTemplates: [
  {
    "id": "template-nagah-official-ar",
    "name": "الشهادة المعتمدة الرسمية - عربي (مجلس الاعتماد)",
    "theme": "classic_gold",
    "sealText": "NGAH T&CN - معتمد",
    "isDefault": true,
    "showQrCode": true,
    "accentColor": "#96741b",
    "borderStyle": "double",
    "managerName": "د. محمد رمضان بخيت",
    "titleArabic": "شــهــادة",
    "bodyTemplate": "أن المشارك قد اجتاز البرنامج التدريبي بنجاح وشارك بتميز وفاعلية مع التمنيات بدوام التوفيق",
    "managerTitle": "يعتمد: مدير الأكاديمية",
    "primaryColor": "#c59b27",
    "titleEnglish": "CERTIFICATE",
    "trainerTitle": "المدرب",
    "subTitleArabic": "تشهد أكاديمية النجاح للتدريب والاستشارات"
  },
  {
    "id": "template-tech",
    "name": "النموذج المودرن التكنولوجي (Modern Tech)",
    "theme": "modern_tech",
    "sealText": "مصدق إلكترونياً",
    "isDefault": false,
    "showQrCode": true,
    "accentColor": "#1d4ed8",
    "borderStyle": "modern",
    "managerName": "إدارة مركز النجاح",
    "titleArabic": "أكاديمية النجاح لعلوم الحاسب والتكنولوجيا",
    "bodyTemplate": "نقر بأن المتدرب قد أتم جميع المشاريع والتطبيقات العملية والمهام البرمجية بنجاح وحصل على درجة الكفاءة العالية.",
    "managerTitle": "مدير البرامج التقنية",
    "primaryColor": "#2563eb",
    "titleEnglish": "NGAH TECH & CONSULTING ACADEMY",
    "trainerTitle": "كبير المدربين والمطورين",
    "subTitleArabic": "شهادة كفاءة واجتياز تدريبي تخصصي"
  },
  {
    "id": "template-nagah-official-en",
    "name": "Accredited Official Certificate - English (Accreditation Board)",
    "theme": "classic_gold",
    "sealText": "NGAH ACCREDITED",
    "isDefault": false,
    "showQrCode": true,
    "accentColor": "#96741b",
    "borderStyle": "double",
    "managerName": "Dr. Mohamed Bkeet",
    "titleArabic": "شــهــادة معتمدة بالإنجليزية",
    "bodyTemplate": "Successfully Completed Training Program with Distinction & High Performance",
    "managerTitle": "Academy Director",
    "primaryColor": "#c59b27",
    "titleEnglish": "CERTIFICATE OF COMPLETION",
    "trainerTitle": "Trainer",
    "subTitleArabic": "THIS CERTIFICATE IS PROUDLY PRESENTED TO"
  },
  {
    "id": "template-emerald",
    "name": "النموذج الأكاديمي الزمردي (Academic Emerald)",
    "theme": "royal_emerald",
    "sealText": "معتمد رسمياً",
    "isDefault": false,
    "showQrCode": true,
    "accentColor": "#047857",
    "borderStyle": "ornate",
    "managerName": "د. محمد رمضان بخيت",
    "titleArabic": "مركز النجاح للتأهيل والتطوير المهني",
    "bodyTemplate": "تقديراً للأداء الاستثنائي والمواظبة والانضباط تم منح هذه الشهادة الرسمية بعد اجتياز الاختبارات النظرية والعملية.",
    "managerTitle": "المدير التنفيذي",
    "primaryColor": "#059669",
    "titleEnglish": "NGAH PROFESSIONAL DEVELOPMENT CENTER",
    "trainerTitle": "المحاضر المعتمد",
    "subTitleArabic": "شهادة تفوق وتقدير مهني معتمد"
  }
],
  auditLogs: [
  {
    "id": "log-1788073029266-y363",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-30T06:57:09.266Z"
  },
  {
    "id": "log-1788039694699-dw66",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T21:41:34.699Z"
  },
  {
    "id": "log-1788038529903-7brk",
    "action": "ربط وتفعيل جهاز معمل جديد",
    "entity": "الأجهزة",
    "userId": "agent-enrollment",
    "details": "تم ربط وتفعيل جهاز الحاسوب PC-TEST-2 (LAB-MAIN-72) بالمعمل بنجاح",
    "branchId": "branch-1",
    "entityId": "dev-1788034811666",
    "userName": "Windows Agent Installer",
    "timestamp": "2026-08-29T21:22:09.903Z"
  },
  {
    "id": "log-1788072623770-ybxo",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-30T06:50:23.770Z"
  },
  {
    "id": "log-1788039035043-1jpw",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T21:30:35.043Z"
  },
  {
    "id": "log-1788038521843-6o40",
    "action": "ربط وتفعيل جهاز معمل جديد",
    "entity": "الأجهزة",
    "userId": "agent-enrollment",
    "details": "تم ربط وتفعيل جهاز الحاسوب PC-TEST (LAB-MAIN-72) بالمعمل بنجاح",
    "branchId": "branch-1",
    "entityId": "dev-1788034811666",
    "userName": "Windows Agent Installer",
    "timestamp": "2026-08-29T21:22:01.843Z"
  },
  {
    "id": "log-1788035507737-hamb",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T20:31:47.737Z"
  },
  {
    "id": "log-1788032653391-qr4d",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T19:44:13.391Z"
  },
  {
    "id": "log-1788032236502-jglj",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T19:37:16.502Z"
  },
  {
    "id": "log-1788013961678-7p1n",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T14:32:41.678Z"
  },
  {
    "id": "log-1788012408757-faq6",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T14:06:48.758Z"
  },
  {
    "id": "log-1787961083867-0ahn",
    "action": "تصفير الحسابات الشامل مع الأرشفة السرية",
    "entity": "الحسابات والخزينة",
    "userId": "user-admin",
    "details": "تمت عملية تصفير الخزينة محاسبياً وحفظ أرشيف سري برقم arch-1787961083634 (أرشيف مالي حتى تاريخ ٢٩‏/٨‏/٢٠٢٦) دون حذف البيانات التاريخية",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-28T23:51:23.867Z"
  },
  {
    "id": "log-1788036391085-ze1n",
    "action": "تسجيل دخول المتدرب على جهاز المعمل وتسجيل الحضور التلقائي",
    "entity": "المعمل والحضور",
    "userId": "trainee-1787541849209-4xin8",
    "details": "سجل المتدرب اسر محمد عصام ابو الخير (A001) دخوله على الجهاز جهاز PC-71 وتم توثيق حضوره رسمياً",
    "userName": "اسر محمد عصام ابو الخير",
    "timestamp": "2026-08-29T20:46:31.085Z"
  },
  {
    "id": "log-1788034811675-yac0",
    "action": "ربط وتفعيل جهاز معمل جديد",
    "entity": "الأجهزة",
    "userId": "agent-enrollment",
    "details": "تم ربط وتفعيل جهاز الحاسوب LAB-PC-01 (LAB-MAIN-72) بالمعمل بنجاح",
    "branchId": "branch-1",
    "entityId": "dev-1788034811666",
    "userName": "Windows Agent Installer",
    "timestamp": "2026-08-29T20:20:11.675Z"
  },
  {
    "id": "log-1788032262835-1xxj",
    "action": "تسجيل دخول المتدرب على جهاز المعمل وتسجيل الحضور التلقائي",
    "entity": "المعمل والحضور",
    "userId": "trainee-1787541849209-4xin8",
    "details": "سجل المتدرب اسر محمد عصام ابو الخير (A001) دخوله على الجهاز جهاز PC-71 وتم توثيق حضوره رسمياً",
    "userName": "اسر محمد عصام ابو الخير",
    "timestamp": "2026-08-29T19:37:42.835Z"
  },
  {
    "id": "log-1788031542299-ezz6",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T19:25:42.299Z"
  },
  {
    "id": "log-1788012879689-x97r",
    "action": "تسجيل دخول",
    "entity": "المستخدمين",
    "userId": "user-admin",
    "details": "تم تسجيل الدخول بنجاح للمستخدم (admin) دور: super_admin",
    "entityId": "user-admin",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-29T14:14:39.689Z"
  },
  {
    "id": "log-1787970812685-87bu",
    "action": "إضافة برنامج تدريبي",
    "entity": "البرامج",
    "userId": "admin",
    "details": "تم إنشاء برنامج تدريبي: مادة الكمبيوتر مع 9 دورات.",
    "entityId": "prog-1787970812683",
    "userName": "مدير النظام",
    "timestamp": "2026-08-29T02:33:32.685Z"
  },
  {
    "id": "log-init",
    "action": "تهيئة النظام",
    "entity": "النظام",
    "userId": "user-admin",
    "details": "تم بدء تشغيل نظام مركز النجاح V7 وتهيئة قاعدة البيانات بنجاح",
    "userName": "مدير عام النظام",
    "timestamp": "2026-08-25T08:24:58.573Z"
  }
],
  centerSettings: [],
  systemNotifications: [
  {
    "id": "notif-welcome",
    "read": true,
    "type": "course_end",
    "title": "مرحباً بك في مركز النجاح V7",
    "message": "تم تجهيز النظام للعمل بكامل الميزات وتخصيص الفرعين (فرع النجاح وفرع بدر).",
    "createdAt": "2026-08-25T08:24:58.573Z"
  }
],
  traineeScreenshots: [
  {
    "id": "shot-1788027316885-yhkm",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:15:16.885Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027194892-c8nq",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:13:14.892Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027019039-5fco",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:10:19.039Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026835883-vka9",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:07:15.883Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026714912-h0yx",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:05:14.912Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026355885-5fiy",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:59:15.885Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026177153-34sv",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:56:17.153Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026055882-44by",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:54:15.882Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025897410-zxl4",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:51:37.410Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025697627-9ypu",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:48:17.627Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025575038-dfms",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:46:15.038Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025444378-xzyj",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:44:04.378Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025215934-r2e9",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:40:15.934Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025094929-29ts",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:38:14.929Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788024951959-scrl",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:35:51.959Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788024696323-1j3j",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:31:36.323Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788024153648-9v5z",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:22:33.648Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788024021910-9343",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:20:21.910Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788023895922-tl1f",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:18:15.922Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788023774962-b1x3",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:16:14.962Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788023435914-yzct",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:10:35.914Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788023295921-fd6b",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:08:15.921Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788023175027-v9qe",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:06:15.027Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "متدرب معمل (متاح)",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028358872-nppb",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:32:38.872Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028227890-md1x",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:30:27.890Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028040953-tnge",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:27:20.953Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027914919-cpy8",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:25:14.919Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027749633-5l5o",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:22:29.633Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027616882-tuv9",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:20:16.882Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027450327-kmgb",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:17:30.327Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030646647-gshc",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:10:46.647Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030505026-cn0n",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:08:25.026Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030314841-tvx2",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:05:14.841Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030139754-7xln",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:02:19.755Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030015597-y32a",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:00:15.597Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029822014-08s3",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:57:02.014Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029594891-ngha",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:53:14.891Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029435863-etey",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:50:35.863Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029295849-0xk5",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:48:15.849Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029235012-cqmc",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:47:15.012Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028934904-b0o7",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:42:14.904Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028631910-29jq",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:37:11.910Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028492862-00aq",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:34:52.862Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030749916-qz38",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:12:29.916Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030576911-r9gq",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:09:36.911Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030374847-49e7",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:06:14.847Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030221876-7cmo",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:03:41.876Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788030075851-0e6q",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T19:01:15.851Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029897906-2mjz",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:58:17.906Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029678884-26fo",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:54:38.884Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029534872-7aum",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:52:14.872Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029367891-53ot",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:49:27.891Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029096113-9gjp",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:44:56.113Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788029013865-f4p8",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:43:33.865Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028830941-uwja",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:40:30.941Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028732599-xyb2",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:38:52.599Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028569007-zvg4",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:36:09.007Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028425875-efja",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:33:45.875Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028293857-zox2",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:31:33.857Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788028114903-bfsh",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:28:34.903Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027976339-t2d2",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:26:16.339Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027854874-a6iu",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:24:14.874Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027688936-hip1",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:21:28.936Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADhAZADASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIDBAUBBv/EADAQAQACAgEDAgQFAgcAAAAAAAABAgMRBBIhMRNBBSJRgRRhcZGhMvEVM0RiorHw/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EACARAQEAAgICAgMAAAAAAAAAAAABAhESMQMhsfBxgeH/2gAMAwEAAhEDEQA/APggHRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABfxePPKyTji9aW6dx1eJ/L8jj5MVYvTNitet9f036Jif1mJhrry+NxYtjx8bJ1RM6meRW0b1r2r3j7ueeWXWM+GsZO7WK2Ga4bZJtX5b9E1773/0nk400wVzRaLVmImfaYmZmNf8Za8XxDh4oya4V7Te3V8+Wtojz4iaTHup5XNx5cU48OCcVJ9pv1a7zPbtHbuzMvJb18LrHXbNhw3zW6aV7biJt7V3Ou8+yFomtprPmJ02cbFGGk8jJkwTTonpr1xNpt7fLHeO/vLXGfgz8OyXjFeJtli1sfr13M/evj7fXv8AVl5LL6myYyz25NKWvMxSs2mImZiI32X8XiTyMeXJ6uPFTFETa19+869oldzsvGzzWKYK8fJWNzeMkWrftuI1SsRv9Pu84HKrxuJy43X1MlaxSLUi0Tqe/aYmFuWVx3J7/pJJfbz/AA3J1/5uL0vT9T1tz09Pj6b89taU8jjW4/RPVXJS8bpem9W/fu1Yeb6+PkYeXlikZaVit4rqtJrO4jVY7R58QpvPF4+q4605Vpr81rdUVif9upif3THLOXWX39/fwWY69I34OfHw6cm9YrS9umsT5nt519Dl8T8Jecds+K+Ss6tWnVuv7xEJ48+Ovw6MXXMZI5EX1Fd9tefov+IcuM3F9PJyvxeWcs3rfpmOiuvHeI1v6R27Jyz5SVdY6cwB3cwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATrSbUtbcRFdefd08nwvmcyv4jFj3vHW0Vikx1fLG9TrX87Yy8mOPbUxt6ckba/Cefb/SZq/LM98c/t48o83g5OFGL1J36ld+PE+8fn/cnkwt1KcMpN6ZBr4fAzczXpVm0dUVt01mZrvxM69lvxH4d+DpSenLW0dr+rEVi0/Wn1gvkxmXHfs4XW3PF+DBPJ+TBjvbLWszMR36u/tH908nA5OHj3y58OXFFZiI68cxvf5yvPGXVqcb2yjdxPh2XkdNox5b47VmevFSbdMx7T+38w0W+DZ65Ml8OPLEUrFsdb0+a/bc9v/d9QxfNhLq1qePKzenJG/4tjrTPGqxW0zbqjWp/qn29u0/wwN4ZcptmzV0ANIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuwcjJx+r0+nVu0xekWiftMTDzLntmte2WK2vbXzeNa9oiO2vsqE4zezd6Eqz02i2onU71PiURRrnmUtWKW4uOuOu5jHSZiJt9ZmZmZ/TcMgJMZOlttSm8zWtZiNV8arET959065a1yxf0Mc11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027554880-2sho",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:19:14.880Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027380885-d9i7",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:16:20.885Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027255886-p57e",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:14:15.886Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788027086885-txnv",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:11:26.885Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026906883-c0sx",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:08:26.883Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026774997-kyak",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:06:14.997Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026436082-kmz9",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T18:00:36.082Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026294905-537c",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:58:14.905Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788026116873-p1j6",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:55:16.873Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025994882-bvph",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:53:14.882Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025769940-3n4y",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:49:29.940Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025635898-apd5",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:47:15.898Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025514920-qtiv",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:45:14.920Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025279896-pnr6",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:41:19.896Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025155905-rk8k",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:39:15.905Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788025034913-hdgn",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:37:14.913Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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c11qaT1an+d/yqDUTa7kci3ItWZrSlax01pSNRWFIEkk1C3YAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k="
  },
  {
    "id": "shot-1788024768904-0lju",
    "deviceId": "dev-1787974783991",
    "timestamp": "2026-08-29T17:32:48.904Z",
    "deviceName": "جهاز PC-15",
    "traineeName": "مرام محمد رمضان بخيت",
    "screenshotUrl": "data:image/jpeg;base64,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��|�r#7���z���1�Z"�ɛH��5I���D�ER���;�	��K&+3I�*��ƶ{~��]{<����؍�Ho3��B��V���.��988 ·�f|���4w-O���/��k�ٍ<�-�~K���4�=�ޮܞh��B���̼{y�N����e���j��*���[>�ft�|Gh��ͦ�Mέ��Nnv��G�k�f��'�_�-������زZ��mǺVO/��Qm��%�������eA�(�I�R�ˏ��3���չ6Zci���i�sp\���앨��F�Xz:�K��/_q��6���8�KU�r����VR�)�L.�͔>ٟZ�/�m"�UR��)wJ;��b�T\"K� Ӓ&SL��3�$_LfJmag7���gR��:��T� L}�������?��~R�{IՐG������?=|���?ÿ�p��¯�y�������q뚲����un��ڒ%������)��J&*�ӥa:'��Z��Z�/��w`�w�[��s�����i�R(���u�]=��*9ϻQ,[]��<)����*?�_u�^\eOo���]���o��>y��>]_��"���\v�V쀨����o����a�*Ge:��//j���h��j��P>���D����]}����ם��9�R��ţ�x�/���U�B�����20��mo'��	��ʝcIn��:�p�� ~Xf)�/`���@���F2��'P�x����dUK8{���/?ޞ}�nOU�7�x����ޕg�a]<�C�+�b]b���ܔ+�A'1W��g�w�V�)����a��sX�kM^?�K����������ٻj�ٖs�B�B(�י��	tY����:Ӱy7���q�_�����p��9�m�ihns_��k�"����jY\T���;��-�^����+e�\���P���/�����@�˞��~�Y.���r�C���ׇ���zQ盪n�`97U,�,FRu_L��}�It���:MP}[�w���+/��(��C��Tq;*�wbZl��G�(�R��@���e{���NAY��>)����ռ}�Z�*��l����Im`˭�ŕ5\�5�Y/LP��w#cd�;3�:���֡y}��ˡ��^׬�|�Tvv�i^�x���)�\L�'=�
��^�Z*^.*����r;m��(nu,}x�S���l��<]���\�l_����sAڹmt����>�u��qt�=�do;�b����E�lV�Z�kj4&5>#wG�amt�n����Sk�wr������^��x����5V�g�z͇;��yQ��ON
����6�?}ۙ�-3-�V������^��e�0k��mI(m%}�ܚ�����۫��^�sz�꣎ѳf�B�l�K�Y1w��X�j�\�R�C��:9W��G�#�:�lm'=��z�۴(fkB:?;��mXƬ[���Œ%�C�ur�f���*v�hR�{3�
u[�����k�B�r�G�f��W;�|��t�8�m}�����(
�r~��J���˶�N�.;��R�wӹ*�������MA����Vi61�y���ʸ�.֐��[o�Zf��@h;�YTk������P���_竗R�PO�o˳z��Ԩ-�ԑͬћN�����B3�S[��[�UA�)g嵖����[]�y�������D^�sÃav~��/��B����eq�jY��5��� ��Rz�������I�T��V��������P���V��U�iiY�X�[�>=-\��\O��o/��g���ژ/��x�8�)[�ii'^1���ʧ;�П��ˣ����d[�r���.�ݓ�y[of��uT�&����av�/�]����b��/��ˋ�r7�*�� s9RN�E��۹���A���;��l��lU����x�8����巤tW.��J�ݢw:8�(|D���H��s��h7?.:�m��3M�2��;,�����KB�XHN�z1�#�f�p���/���3<�=|��.A2���&�9��p�9�0��p�9�0��pK�=�Z8'[�J����})�#�v�B
�2����a8���s�a8���sXb�i=�S��KB19�~̾΁��s���&�sD�s�a8���s�a8���XznZ�䳹RVH�C��pNfWȥ�+�9������s�a8���s�a8�%�����9Yp�L>��1^��_�J)��pNlb8Gd8���s�a8���s�a����pN�[�Vn�y1���[�[���9���a8���s�a8���s�a�GZ�B�P��B�|�����IW�sb�9"�9�0��p�9�0��pK,=7��s2�L�P����b�����pe8'61�#2��p�9�0��p�9���s�z8g'�+e�����_�v�%�w2��'�sD�s�a8���s�a8���XznZ���+&��B�� ���S�����p��p�9�0��p�9�0��K�Mk�[+�y���-w^��ZvW�S�����p��p�9�0��p�9�0��K�M��b&�3�QWG/�s��L.\ΉM��0��p�9�0��p�9,��ܴ潵�b)�KzE������)��pNlb8Gd8���s�a8���s�a��禧qF/�RN(�rw,��᳻9a7�KW�sb�9"�9�0��p�9�0��pK,=7��sl��,Mǋ��9��n.�Z�sb�9"�9�0��p�9�0��pK,=7y8���
d}2�Y�8���.�>�}�R7��6¸������n!3Bu�g��+F'?��?��
���W���������_~���������e�sI�Թ�t�kH�<�!���WZ����ZK(���vZ-�Fb�>�,̀���H��F���3�/���?�B? ������f
p�e>�@Q���}J2M��M�fa�������W�r�
�M�1��� f��\�G��Gђh"���Mi�� ����˝�
��R�w�;N�����Ұ_k�e�dK7�NwY�L�����P��/�
 �y�K
��	�^Qz�������������i���&'����x�MEl��T����1��d��F�6��3�<3L��]�2Cܝ�4�k��������z\E���;N�,y�%���Y�ԍdh������-)����8h-��fwc�Cﻰy}ˇ�!��cdq�tS!���j�_�)��׆� h"�o�a���1�T�3����H&���m�����I5`WZ+�.�i�0 e���$� d�<�����K7<S�"ݪ��.��o��L��ַ�ל�odr�-@�S��z�}����Y5���ض���鎤%�QV��V��4e����=`~���4g"c��1��BAӱ�$S�&��n�*!??��T+߼D߄x�p�F�}��'�mݞ�O���������ϒ<�M������^��|>��j"�l'2U�n����w�/z����5��,�mL��9}S���͂O�bt���E�;�:��ɘ5i3`������5׃u\1;�5Hl����ml��Mݰ�<��b�D�1(�|W���1\ٶ�7��Aj��Zp5�8��?�<b=�rz�Q�{i�+-<:�J������!���y����iQ�����m���NS�G���>�cב�G�V��t'��$�ԓfct�r�o9IS��� ΀��� �P�fHBm:'\�8�0�eJ5�c�����p�w����x�K�<m0KN��p�PIㆹ��CfB�d/��MI$f�����Ō��$e�'�2�%�����-xYd`|A�BP���$(�A����`}�}n6UHh�4-4�$Y�h��n`\�[}����?`��.D��6.�8��:��!!F5!z7{ŀx�2�����3���j�͉
�� t7�L�%7BK_mY3CX#�JQ�,��δ�`�z���g�PV`.{.�}�ͦ�9���47���f�K�*���QiFD��f<*͈�f���AJ��A�rr�E��AIN.-�o�x6����)1vF��8(��4���e�6��節Ŕ�͌)^��8F!ĐК��4�T#_)]��x�6iPɣ���B���(1^^�(�JP��O����o�a��x�% :RD�)�W%�"�R�|�[Ļ�
7x�����1-Z8 ��+]�}�,�4�$����D����WS.�v��5�K�5�t��#���K��Y|���P����7a2�j��P���O�L��&eX��Z��ʂP؀�iNɓ�\:�x��������_~��W|7����jo&��o��ܐ���H=]C�g���A`k���qܱ�������:Aa��y�/\��A�T�����U�-�S�+#
iR_���g�4��;B��scs˂JM�k�F�$N��Y�!UC
��2��zP�����ӊ�T�d�����v!�7����ehZEFGu���9#_)?+��_r�د�����MS�xt��Scg/�����z�`\T�q�b����JuĩxV� o���N-^�Cc��wJ�B�?��^]gㆆ�dK�;�� ���|������	v)�F>�۴jo`A��ϺcU���zt����܇��@5�uq%#�U��29	�M�s�K�[�oÁͦ� 7�T�:X�N�{�Z��������d������M_�}R�h)$�~�]�sɸ�q�<���Zp�������.�OA�t�t$��~S"�����gU=�L���J�̓:'�(㎕\��zܝ�$j���d8�Q����E������3(��ݬ�e�;����l��\&T	�u�����ꓳm{��&�o]B�cq��O�渦���9�c;�S�g��l���$Wض�ktK�l@���Pw{�>�i�]��v�I���%��l%���6���Nh��+�n��lF\C�J�ε7��N�O��Q��̌�2à��Bf �/�[o��L�o���<$;�������)K?n���&6S&�Q��9!��r%��7�وp":!�)W�~k���W��wd3���G:���H�=�#B�|�3VK��cAp���&�X����b�}IXg�:VEQ�� �3>K�m֤�Ao#m�:9`ߌ� �:���LQ�|���`��G��D��Te������ 6�v��
�9���*Џn� 8K7�R��=��m�J������m��:�}Xr��X��Q��Ԭ3\"���<��)�K9j��ֆ�S�����i�@�Y	�	�u��>D�a��S��1����o`���]��P�����z�Q_��j�}Q���5�b�"߰s�t���E����SR�B��)��W]Rܚ]��(��i��M����*�y_l�����O��w<D����@7IAg�>�5L��oo����?j�"@� ����p��dK�8pCܠ�vY!������覄
�ǓGj7\���: P�@��R݊^]��>6ݶ��H��	��6g�7�#����mn���g�!���A[��)@�hb�F1'+D�P>4��V5y<S��d��R80u�8�1^+�I�N���O��a��l<�@��Sh�gÐ����t���o�z�~>��ZS�����F\36 ��σb����O���uMq�xqyZ\�1q���emq�xqZ��c����������@*H~�1�#��O�Jņ�fC�AJJ0�'���<֮��5�h�/.��-�v�2k�-C���T��p�o����|~۲k�-�F۲t���G��~x�� VP�jO���\�a[G<\��j�/kf�Ѩ�<�����<p�F�{�0��F�墭��o���}f���N��v���b{fD+C��ř(�].�k R Éa��Q�mX���h��p�F���4�^L^K�[>Y���/�|�:8��N�#� ;j�'���]�n�����lH/��(�Z��1���֍�����/U�Y:�ub[Df�Qな)�N�6�t�A?��$��}A��u�DZ�BX���t����i�~u1M|��_}��%~�{ek�o1�r��HѲ7�]��+A���ձR2��{Őd'�lown䆍�ވ�d�X�l����4��� S~�45xS�k>����
�$F�ˮ���℠�L|�����W���T�LM%����п`C~c���ן�)6�.�'��΄c�����_|���Ք�v��w�}�=��官�v'��jK7,�ކ�tK�'L�6�)#��ls�-FrEh����4VN|n���]�{1~�^����/r��J�Jhc_�$������`_�LH�\��KtSD놭4X�q�KH��͐l))+U	�<amC�pt�7��=}�)�Z�)	��2H�h�pmsn�cFA�'YxS{ � Z�np���?�������b���s��Lo�&���܍8V��p]o6��f#���$��aE"���8O���H�+���<��!w�)e]��I��l����N�Z��m���L��C��ٿ��_Ҥ��$W�"��T��3<��%�usc��s��a�X��W�S�.wĽrǖ�ڤd=�=m�th�O:�qg���6�.]�˻�9�4�,2���B������Ẓ�]I�.��S�#SN�}tK����,����B��^����1�G�$Ga���~��F��f�c� D�!72�g���7��a�1�+��l���㲣W��#��X���� ٛ���:���2e؈���kf���<�����} n�e�h��ê6A	O<_sq�dO$�jw���dͫ�TOVO�:�
r�7l����Eq��||��sJ�h�U��Ķ�Lb�P^���0p��f�G\���}�ve��-�Է�B]	S�J��;��7
�sܻmW���-��VU�	��νy�"e e&�DM0���M('N	 ILߤ$R{���9��vR�8�#�j�F���P�.�xc��C�9���D�������q�K�Ԑ����:����4�sDgG�ӷ���s��E`�_M�:F�lR���+����6�7���O5ߓ��<�ӮҀH�8�Z>�%V�7H��B�"궗S����p#lf.0�m��n
��;b��j]��Ob��l�ݫ����t4�G&>�����C�%2L2h���+#��Xp̛1cތ��mpI��O1^I����$C`�8�`j��c5��#���U��K�M@�$��f�m���B'����d�7��I� ���+�}�福ҟ��\��P���m���/'$��1��F+�V��@W��W?rDl��(aj����U��{�y~̃"�u�������[��<�����hc�ъ㱷[_=�����)5<0P+t0JX#�:sB4��4�|!a*Y=n����HI�[6n����I]Q���4��X1Q5�1�h��.�~
MHt<��[������G�_��#�<�M�20���?g�����0�����y2���ؾ�f0��%���G�)��(����NLΖ,i
V6*@�D�݋Q�����EC�93���
�G�Ml�`�}��1WʣO���}����u�?Tzi@�^�q.��+i����X�O<ǌ��r+���{��O%b��O�h�q�b��G�����+��y�3����r����P�\��n�P�T�]�/����'�_��z�'���6��~���vx$�)�k�r�g�t����y�I�_�<*	qpf�`�;�*FA���� ӈ�ԫ�0e��:�
��+��[-�k�	������mH�6k�f���ysg�<p!1���[��i�����Sh4���6��� 4�VWQ����ꇕ4������������ߐ���ԏ6g�zr<��I6���
=)*j��1��Z9GJ�����C�8���J�tf��Σ����=7^�����*�xLU��������ۊQ��g���G��O���%��5}f�������1>q��L���SDj�����~!ȇ��
8�m��c�#b��  �� y�<