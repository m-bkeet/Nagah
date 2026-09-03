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

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.VERCEL_ENV ||
  process.cwd().startsWith('/var/task') ||
  process.cwd() === '/'
);
const ACTUAL_DATA_DIR = isServerless ? path.join(os.tmpdir(), 'nagah_data') : path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(ACTUAL_DATA_DIR, 'backups');
const DB_FILE = path.join(ACTUAL_DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(ACTUAL_DATA_DIR, 'database.backup.json');
const BUNDLED_DB_PATHS = [ path.join(process.cwd(), 'data', 'database.json'), path.join(process.cwd(), 'database.json'), '/var/task/data/database.json', '/vercel/path0/data/database.json' ];

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
  computerLabs: [
    {
      id: 'lab-1',
      name: 'معمل النجاح',
      branchId: 'branch-1',
      branchName: 'فرع النجاح',
      capacity: 25,
      devicesCount: 20,
      status: 'active',
      notes: 'معمل الحاسب والبرمجة الرئيسي - فرع النجاح'
    },
    {
      id: 'lab-2',
      name: 'معمل بدر',
      branchId: 'branch-2',
      branchName: 'فرع بدر',
      capacity: 25,
      devicesCount: 20,
      status: 'active',
      notes: 'معمل الحاسب والتكنولوجيا الرئيسي - فرع بدر'
    }
  ],
  branches: [
    {
      id: 'branch-1',
      name: 'فرع النجاح',
      code: 'NGAH',
      address: 'المقر الرئيسي - مبنى النجاح للتدريب',
      phone: '01012345678',
      managerName: 'مدير فرع النجاح',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'branch-2',
      name: 'فرع بدر',
      code: 'BADR',
      address: 'فرع مدينة بدر - سنتر التدريب',
      phone: '01087654321',
      managerName: 'مدير فرع بدر',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      fullName: 'مدير عام النظام',
      role: 'super_admin',
      phone: '01000000000',
      email: 'admin@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-accountant',
      username: 'accountant',
      fullName: 'المدير المالي',
      role: 'accountant',
      branchId: 'branch-1',
      phone: '01055556666',
      email: 'finance@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-reception',
      username: 'reception',
      fullName: 'مسئول التسجيل',
      role: 'receptionist',
      branchId: 'branch-1',
      phone: '01077778888',
      email: 'reception@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-trainer',
      username: 'trainer',
      fullName: 'مدرب معتمد',
      role: 'trainer',
      branchId: 'branch-1',
      phone: '01099990000',
      email: 'trainer@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-branch-1',
      username: 'manager_ngah',
      fullName: 'مدير فرع النجاح',
      role: 'branch_manager',
      branchId: 'branch-1',
      phone: '01011112222',
      email: 'ngah@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-branch-2',
      username: 'manager_badr',
      fullName: 'مدير فرع بدر',
      role: 'branch_manager',
      branchId: 'branch-2',
      phone: '01033334444',
      email: 'badr@nagah.eg',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  trainers: [
    {
        "id": "trainer-1787349806643",
        "name": "د. محمد رمضان بخيت",
        "photoUrl": "",
        "phone": "01001500686",
        "email": "M_bkeet@yahoo.com",
        "branchId": "branch-1",
        "specialty": "ICT",
        "courseIds": [
            "course-1787347401956"
        ],
        "programIds": [],
        "commissionType": "percentage",
        "commissionRate": 40,
        "status": "active",
        "contractDate": "2026-08-21",
        "notes": "",
        "totalEarned": 0,
        "totalPaid": 0,
        "balanceDue": 0,
        "commissionValue": 40
    },
    {
        "id": "trainer-1787349870400",
        "name": "د. عماد حامد ابو النيل",
        "photoUrl": "",
        "phone": "01066264312",
        "email": "",
        "branchId": "branch-2",
        "specialty": "تكنولوجيا معلومات",
        "courseIds": [
            "course-1787347401956"
        ],
        "programIds": [],
        "commissionType": "percentage",
        "commissionRate": 40,
        "status": "active",
        "contractDate": "2026-08-21",
        "notes": "",
        "totalEarned": 0,
        "totalPaid": 0,
        "balanceDue": 0,
        "commissionValue": 40
    }
],
  trainees: [
    {
        "id": "trainee-1787347401956-karm",
        "code": "A002",
        "fullName": "كرمه احمد عصام ابو الخير",
        "grade": "الصف الرابع الابتدائي",
        "nationalId": "",
        "birthDate": "",
        "gender": "female",
        "phone": "01002345678",
        "parentPhone": "01002345678",
        "parentName": "احمد عصام ابو الخير",
        "address": "",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "groupId": "grp-1787350487970",
        "trainerId": "trainer-1787349806643",
        "registrationDate": "2026-08-25",
        "status": "active",
        "feeAmount": 200,
        "discountAmount": 0,
        "netAmount": 200,
        "paidAmount": 200,
        "remainingAmount": 0,
        "notes": "الصف الرابع الابتدائي - مسجلة بكود A002 المرتب",
        "totalPoints": 95,
        "ranking": 4,
        "points": 95,
        "courseIds": [
            "course-1787347401956"
        ]
    },
    {
        "id": "trainee-1787459300939-62ly",
        "code": "A001",
        "fullName": "لين محمد رمضان بخيت",
        "grade": "الصف الرابع الابتدائي",
        "nationalId": "",
        "birthDate": "",
        "gender": "female",
        "phone": "01001500686",
        "parentPhone": "01001500686",
        "parentName": "محمد رمضان بخيت",
        "address": "",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "groupId": "grp-1787350487970",
        "trainerId": "trainer-1787349806643",
        "registrationDate": "2026-08-23",
        "status": "active",
        "feeAmount": 0,
        "discountAmount": 0,
        "netAmount": 0,
        "paidAmount": 0,
        "remainingAmount": 0,
        "notes": "الصف الرابع الابتدائي - إعفاء أبناء الإدارة",
        "totalPoints": 133,
        "ranking": 3,
        "points": 133,
        "courseIds": [
            "course-1787347401956"
        ],
        "isExempt": true,
        "exemptReason": "management_children",
        "siblingIds": [
            "trainee-1787361330810-d1if",
            "trainee-1787361410293-aeko"
        ],
        "siblingNames": [
            "مرام محمد رمضان بخيت",
            "رفيف محمد رمضان بخيت"
        ]
    },
    {
        "id": "trainee-1787361410293-aeko",
        "code": "B001",
        "fullName": "رفيف محمد رمضان بخيت",
        "grade": "الصف الخامس الابتدائي",
        "nationalId": "",
        "birthDate": "",
        "gender": "female",
        "phone": "01005400325",
        "parentPhone": "01001500686",
        "parentName": "محمد رمضان بخيت",
        "address": "",
        "branchId": "branch-1",
        "courseId": "course-1787347462419",
        "groupId": "grp-1787431608023",
        "trainerId": "trainer-1787349806643",
        "registrationDate": "2026-08-22",
        "status": "active",
        "feeAmount": 0,
        "discountAmount": 0,
        "netAmount": 0,
        "paidAmount": 0,
        "remainingAmount": 0,
        "notes": "الصف الخامس الابتدائي - إعفاء أبناء الإدارة",
        "totalPoints": 200,
        "ranking": 2,
        "points": 200,
        "courseIds": [
            "course-1787347462419"
        ],
        "isExempt": true,
        "exemptReason": "management_children",
        "siblingIds": [
            "trainee-1787361330810-d1if",
            "trainee-1787459300939-62ly"
        ],
        "siblingNames": [
            "مرام محمد رمضان بخيت",
            "لين محمد رمضان بخيت"
        ]
    },
    {
        "id": "trainee-1787361330810-d1if",
        "code": "D001",
        "fullName": "مرام محمد رمضان بخيت",
        "grade": "الصف الأول الإعدادي",
        "nationalId": "",
        "birthDate": "",
        "gender": "female",
        "phone": "01001500686",
        "parentPhone": "01001500686",
        "parentName": "محمد رمضان بخيت",
        "address": "",
        "branchId": "branch-1",
        "courseId": "course-1787347569318",
        "groupId": "grp-1787358595611",
        "trainerId": "trainer-1787349806643",
        "registrationDate": "2026-08-22",
        "status": "active",
        "feeAmount": 0,
        "discountAmount": 0,
        "netAmount": 0,
        "paidAmount": 0,
        "remainingAmount": 0,
        "notes": "الصف الأول الإعدادي - إعفاء أبناء الإدارة",
        "totalPoints": 277,
        "ranking": 1,
        "points": 277,
        "courseIds": [
            "course-1787347569318"
        ],
        "isExempt": true,
        "exemptReason": "management_children",
        "siblingIds": [
            "trainee-1787361410293-aeko",
            "trainee-1787459300939-62ly"
        ],
        "siblingNames": [
            "رفيف محمد رمضان بخيت",
            "لين محمد رمضان بخيت"
        ]
    }
],
  courses: [
    {
        "id": "course-1787347401956",
        "code": "CRS-472",
        "name": "ICT4",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج مادة الحاسب الالي للصف الرابع",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "course-1787347462419",
        "code": "CRS-695",
        "name": "ICT5",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الخامس",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "course-1787347508908",
        "code": "CRS-182",
        "name": "ICT6",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف السادس",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "course-1787347569318",
        "code": "CRS-892",
        "name": "ICT-P1",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الاول الاعدادي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787427719238",
        "code": "CRS-573",
        "name": "ICT-P2",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الثاني الاعدادي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787427763144",
        "code": "CRS-644",
        "name": "ICT-P3",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 200,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الثالث الاعدادي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787427970903",
        "code": "CRS-220",
        "name": "ICT-S1",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 250,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الاول الثانوي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787428009076",
        "code": "CRS-796",
        "name": "ICT-S2",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 250,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الثاني الثانوي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787428039994",
        "code": "CRS-131",
        "name": "ICT-S3",
        "branchId": "branch-1",
        "hoursCount": 8,
        "lecturesCount": 64,
        "feeAmount": 250,
        "trainerPercentage": 40,
        "centerPercentage": 60,
        "startDate": "",
        "endDate": "",
        "maxTrainees": 20,
        "status": "active",
        "description": "دورة منهج الحاسب الالي الصف الثالث الثانوي",
        "category": "دورة منهج ICT",
        "billingType": "monthly",
        "trainerSharePercentage": 50,
        "centerSharePercentage": 50
    },
    {
        "id": "crs-1787502480417-0ggk",
        "name": "الصف الأول الإعدادي لغات",
        "code": "ICT-p1-L",
        "branchId": "branch-1",
        "category": "المدارس",
        "hoursCount": 20,
        "lecturesCount": 10,
        "feeAmount": 500,
        "status": "active"
    },
    {
        "id": "crs-1787502489944-bf2a",
        "name": "الصف الثاني الإعدادي",
        "code": "ICT-p1",
        "branchId": "branch-1",
        "category": "المدارس",
        "hoursCount": 20,
        "lecturesCount": 10,
        "feeAmount": 500,
        "status": "active"
    },
    {
        "id": "crs-1787502587826-q429",
        "name": "الصف الثالث الإعدادي لغات",
        "code": "ICT-p3-L",
        "branchId": "branch-1",
        "category": "المدارس",
        "hoursCount": 20,
        "lecturesCount": 10,
        "feeAmount": 500,
        "status": "active"
    }
],
  programs: [],
  groups: [
    {
        "id": "grp-1787350487970",
        "name": "ICT4 - 1",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الاثنين",
            "الخميس"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الاثنين",
            "الخميس"
        ],
        "startTime": "15:00",
        "endTime": "16:00",
        "maxCapacity": 11,
        "startDate": "",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
        "notes": ""
    },
    {
        "id": "grp-1787350488774",
        "name": "ICT4 - 2",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الاثنين",
            "الخميس"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الاثنين",
            "الخميس"
        ],
        "startTime": "16:00",
        "endTime": "17:00",
        "maxCapacity": 11,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
        "notes": ""
    },
    {
        "id": "grp-1787351870532",
        "name": "ICT4 - 3",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الاثنين",
            "الخميس"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الاثنين",
            "الخميس"
        ],
        "startTime": "18:00",
        "endTime": "19:00",
        "maxCapacity": 11,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
        "notes": ""
    },
    {
        "id": "grp-1787358559234",
        "name": "ICT - p1 - 1",
        "branchId": "branch-1",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الأحد",
            "الأربعاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الأحد",
            "الأربعاء"
        ],
        "startTime": "15:00",
        "endTime": "16:00",
        "maxCapacity": 11,
        "startDate": "2026-08-22",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
        "notes": ""
    },
    {
        "id": "grp-1787358595611",
        "name": "ICT - p1 - 2",
        "branchId": "branch-1",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الأربعاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الأربعاء"
        ],
        "startTime": "16:00",
        "endTime": "17:00",
        "maxCapacity": 11,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
        "notes": ""
    },
    {
        "id": "grp-1787358828709",
        "name": "ICT - p1 - 3",
        "branchId": "branch-1",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الاثنين",
            "الخميس"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الاثنين",
            "الخميس"
        ],
        "startTime": "17:00",
        "endTime": "18:00",
        "maxCapacity": 11,
        "startDate": "2026-08-22",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
        "notes": ""
    },
    {
        "id": "grp-1787431608023",
        "name": "ICT5 - 1",
        "branchId": "branch-1",
        "courseId": "course-1787347462419",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الاثنين",
            "الخميس"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الاثنين",
            "الخميس"
        ],
        "startTime": "14:00",
        "endTime": "15:00",
        "maxCapacity": 11,
        "startDate": "2026-08-22",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3",
        "notes": ""
    },
    {
        "id": "grp-1787431802246",
        "name": "ICT6 - 1",
        "branchId": "branch-1",
        "courseId": "course-1787347508908",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الأحد",
            "الأربعاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الأحد",
            "الأربعاء"
        ],
        "startTime": "14:00",
        "endTime": "15:00",
        "maxCapacity": 11,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
        "notes": ""
    },
    {
        "id": "grp-1787431825818",
        "name": "ICT6 - 2",
        "branchId": "branch-1",
        "courseId": "course-1787347508908",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الأحد",
            "الأربعاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 11,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الأحد",
            "الأربعاء"
        ],
        "startTime": "17:00",
        "endTime": "18:00",
        "maxCapacity": 11,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
        "notes": ""
    },
    {
        "id": "grp-1787432103884",
        "name": "ICT4 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347401956",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "السبت",
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "السبت",
            "الثلاثاء"
        ],
        "startTime": "18:00",
        "endTime": "19:00",
        "maxCapacity": 12,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LbqSa2quIAt3cvKjOTI5rI",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787432635686",
        "name": "ICT5 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347462419",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "السبت",
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "السبت",
            "الثلاثاء"
        ],
        "startTime": "15:00",
        "endTime": "16:00",
        "maxCapacity": 12,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/FoJVTjwgWDtLNEE4X38Qo3",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787433082510",
        "name": "ICT6 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347508908",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "الثلاثاء"
        ],
        "startTime": "16:00",
        "endTime": "17:00",
        "maxCapacity": 12,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/JjcTmBV8vnnKh9nhVTnQD1",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787433160347",
        "name": "ICT - p1 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "السبت",
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "السبت",
            "الثلاثاء"
        ],
        "startTime": "17:00",
        "endTime": "18:00",
        "maxCapacity": 12,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/LhAXWwUy35uJaFODxXZfdH",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787433234491",
        "name": "ICT - S1 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "السبت",
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "السبت",
            "الثلاثاء"
        ],
        "startTime": "14:00",
        "endTime": "15:00",
        "maxCapacity": 12,
        "startDate": "2026-09-01",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787433327552",
        "name": "ICT - S2 - B1",
        "branchId": "branch-2",
        "courseId": "course-1787347569318",
        "trainerId": "trainer-1787349806643",
        "hallName": "قاعة 1",
        "days": [
            "السبت",
            "الثلاثاء"
        ],
        "timeSlot": "04:00 م - 06:00 م",
        "maxStudents": 12,
        "status": "active",
        "roomName": "قاعة 1",
        "scheduleDays": [
            "السبت",
            "الثلاثاء"
        ],
        "startTime": "19:00",
        "endTime": "20:00",
        "maxCapacity": 12,
        "startDate": "2026-08-22",
        "endDate": "",
        "whatsappGroupLink": "https://chat.whatsapp.com/GTFUoMgvlkQ413pntoZAT9",
        "notes": "",
        "feeAmount": 250
    },
    {
        "id": "grp-1787502480417-ltuf",
        "name": "ICT-p1-L - 1",
        "branchId": "branch-1",
        "courseId": "crs-1787502480417-0ggk",
        "maxStudents": 10,
        "maxCapacity": 10,
        "status": "active",
        "days": [
            "الجمعة"
        ],
        "timeSlot": "04:00 م - 06:00 م"
    },
    {
        "id": "grp-1787502489945-o2sh",
        "name": "ICT-p1 - 1",
        "branchId": "branch-1",
        "courseId": "crs-1787502489944-bf2a",
        "maxStudents": 12,
        "maxCapacity": 12,
        "status": "active",
        "days": [
            "الجمعة"
        ],
        "timeSlot": "04:00 م - 06:00 م"
    },
    {
        "id": "grp-1787502587826-wvu7",
        "name": "ICT-p3-L - 1",
        "branchId": "branch-1",
        "courseId": "crs-1787502587826-q429",
        "maxStudents": 10,
        "maxCapacity": 10,
        "status": "active",
        "days": [
            "الجمعة"
        ],
        "timeSlot": "04:00 م - 06:00 م"
    }
],
  attendance: [
    {
        "id": "att-1787466295224-u89e",
        "date": "2026-08-23",
        "time": "٠٦:٢٤ ص",
        "branchId": "branch-1",
        "groupId": "grp-1787350487970",
        "courseId": "course-1787347401956",
        "traineeId": "trainee-1787459300939-62ly",
        "status": "present",
        "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)"
    },
    {
        "id": "att-1787464456274-6gb2",
        "date": "2026-08-23",
        "time": "٠٥:٥٤ ص",
        "branchId": "branch-1",
        "groupId": "grp-1787358595611",
        "courseId": "course-1787347569318",
        "traineeId": "trainee-1787361330810-d1if",
        "status": "present",
        "notes": "تسجيل حضور تلقائي من جهاز المعمل (جهاز PC-83 - IP: ais-dev-7wkppak7c63am6ebvulppu-481160813332.europe-west2.run.app)"
    }
],
  payments: [],
  expenses: [],
  trainerSettlements: [],
  pointRules: defaultPointRules,
  pointTransactions: [
    {
        "id": "pt-1787466295224",
        "traineeId": "trainee-1787459300939-62ly",
        "groupId": "grp-1787350487970",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-83)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-23T06:24:55.224Z"
    },
    {
        "id": "pt-reinf-1787465508933-s3j0",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 16,
        "reason": "[تعزيز وتحفيز مباشر]: مشاركة وتعاون متميز! - دعم ومساعدة الزملاء في حل التحديات البرمجية!",
        "addedByUserId": "trainer",
        "addedByUserName": "المدرب",
        "createdAt": "2026-08-23T06:11:48.933Z"
    },
    {
        "id": "pt-1787464456275",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-83)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-23T05:54:16.275Z"
    },
    {
        "id": "pt-1787459955413-444o",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787431608023",
        "branchId": "branch-1",
        "points": 100,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-23T04:39:15.413Z"
    },
    {
        "id": "pt-1787459946569-3pse",
        "traineeId": "trainee-1787459300939-62ly",
        "groupId": "grp-1787350487970",
        "branchId": "branch-1",
        "points": 100,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-23T04:39:06.569Z"
    },
    {
        "id": "pt-1787459938649-2nop",
        "traineeId": "trainee-1787459300939-62ly",
        "groupId": "grp-1787350487970",
        "branchId": "branch-1",
        "points": 23,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-23T04:38:58.649Z"
    },
    {
        "id": "pt-1787430858701-5izp",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 100,
        "reason": "إنجاز أسطوري وجائزة التميز الكبرى",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T20:34:18.701Z"
    },
    {
        "id": "pt-reinf-1787362796188-3kij",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 51,
        "reason": "[تعزيز وتحفيز مباشر]: تحية وتشجيع لجميع متدربي القاعة! 🚀 - تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!",
        "addedByUserId": "trainer",
        "addedByUserName": "المدرب",
        "createdAt": "2026-08-22T01:39:56.188Z"
    },
    {
        "id": "pt-1787362695962-fjl7",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 15,
        "reason": "إجابة صحيحة في الجلسة التفاعلية",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-22T01:38:15.962Z"
    },
    {
        "id": "pt-1787362526303-m12r",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 10,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-22T01:35:26.303Z"
    },
    {
        "id": "pt-1787362380117-64xv",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 15,
        "reason": "إجابة صحيحة في الجلسة التفاعلية",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-22T01:33:00.117Z"
    },
    {
        "id": "pt-1787362271687",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-22T01:31:11.687Z"
    },
    {
        "id": "pt-reinf-1787362006056-suqi",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 51,
        "reason": "[تعزيز وتحفيز مباشر]: تحية وتشجيع لجميع متدربي القاعة! 🚀 - تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!",
        "addedByUserId": "trainer",
        "addedByUserName": "المدرب",
        "createdAt": "2026-08-22T01:26:46.056Z"
    },
    {
        "id": "pt-1787361922519",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-22T01:25:22.519Z"
    },
    {
        "id": "pt-1787361433577-8oxr",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 30,
        "reason": "إجابة نموذجية وسرعة بديهة",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T01:17:13.577Z"
    },
    {
        "id": "pt-1787361426705-x0vc",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 30,
        "reason": "إجابة نموذجية وسرعة بديهة",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T01:17:06.705Z"
    },
    {
        "id": "pt-1787360877177",
        "traineeId": "trainee-1787352042655-o2znr",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-22T01:07:57.177Z"
    },
    {
        "id": "pt-1787359878296",
        "traineeId": "trainee-1787352042655-bkzr9",
        "groupId": "grp-1787358559234",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-22T00:51:18.296Z"
    },
    {
        "id": "pt-1787359713319",
        "traineeId": "trainee-1787352042654-aj70e",
        "groupId": "",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-22T00:48:33.319Z"
    },
    {
        "id": "pt-1787356997939-907a",
        "traineeId": "trainee-1787352054266-40z66",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-59aa",
        "traineeId": "trainee-1787352054266-s4ys4",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-ubxr",
        "traineeId": "trainee-1787352054266-jijye",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-pk4l",
        "traineeId": "trainee-1787352054266-1fxlt",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-5mia",
        "traineeId": "trainee-1787352054266-te1p2",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-fua0",
        "traineeId": "trainee-1787352054266-ab5pp",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-r3p6",
        "traineeId": "trainee-1787352054266-whiuc",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-z7py",
        "traineeId": "trainee-1787352054265-b1r9p",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-jin9",
        "traineeId": "trainee-1787352054265-mvg2v",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-k78n",
        "traineeId": "trainee-1787352054265-e68mx",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-r8hk",
        "traineeId": "trainee-1787352054265-tnqmk",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-6tg2",
        "traineeId": "trainee-1787352054265-89sik",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-mehg",
        "traineeId": "trainee-1787352054265-s3igz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-v46t",
        "traineeId": "trainee-1787352054265-jd4tp",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-7ffv",
        "traineeId": "trainee-1787352054265-hx8no",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-a2vo",
        "traineeId": "trainee-1787352054265-i39ds",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-p4jl",
        "traineeId": "trainee-1787352054265-h6wwj",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-b4g6",
        "traineeId": "trainee-1787352054265-x6x9f",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-rfh1",
        "traineeId": "trainee-1787352054264-rv552",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-4wwh",
        "traineeId": "trainee-1787352054264-zxwq0",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997939-1jqb",
        "traineeId": "trainee-1787352054264-kl9ca",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997938-qyyb",
        "traineeId": "trainee-1787352054264-0vyqu",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.939Z"
    },
    {
        "id": "pt-1787356997938-e6it",
        "traineeId": "trainee-1787352054264-b4aee",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-vyhk",
        "traineeId": "trainee-1787352054264-xkezz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-khrh",
        "traineeId": "trainee-1787352054263-tuyfw",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-2n68",
        "traineeId": "trainee-1787352054263-81qro",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-f7v9",
        "traineeId": "trainee-1787352054263-wuwwn",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-lkua",
        "traineeId": "trainee-1787352054263-e6srh",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-qbe5",
        "traineeId": "trainee-1787352054263-d4hmz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-tz9l",
        "traineeId": "trainee-1787352054263-2wlgz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-leow",
        "traineeId": "trainee-1787352054263-zrex8",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-i5ym",
        "traineeId": "trainee-1787352054262-fehxv",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-rhmr",
        "traineeId": "trainee-1787352054262-hvrlu",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-lvks",
        "traineeId": "trainee-1787352042663-wgwj3",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-z072",
        "traineeId": "trainee-1787352042663-jye60",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-g4qj",
        "traineeId": "trainee-1787352042663-lrb0e",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-ik96",
        "traineeId": "trainee-1787352042662-kh71r",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-cqb3",
        "traineeId": "trainee-1787352042662-58hi5",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-216e",
        "traineeId": "trainee-1787352042662-b5noo",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-k6tj",
        "traineeId": "trainee-1787352042662-avarj",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-mjlw",
        "traineeId": "trainee-1787352042662-t70xe",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-07j9",
        "traineeId": "trainee-1787352042662-b9go0",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-q89t",
        "traineeId": "trainee-1787352042662-z17c5",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-0cjj",
        "traineeId": "trainee-1787352042662-3tq3x",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-gme9",
        "traineeId": "trainee-1787352042661-yss51",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-i9yq",
        "traineeId": "trainee-1787352042661-vllz8",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-0cc2",
        "traineeId": "trainee-1787352042661-2h51r",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-n4r6",
        "traineeId": "trainee-1787352042661-4ky49",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-g88v",
        "traineeId": "trainee-1787352042661-gatx4",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-yr8d",
        "traineeId": "trainee-1787352042661-kwgj5",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-fd0x",
        "traineeId": "trainee-1787352042661-bn13o",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-v49t",
        "traineeId": "trainee-1787352042661-lazq8",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-985m",
        "traineeId": "trainee-1787352042661-5wiuu",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-9s5r",
        "traineeId": "trainee-1787352042660-83zkl",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-lciy",
        "traineeId": "trainee-1787352042660-3jdfj",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-s8uv",
        "traineeId": "trainee-1787352042660-rc13v",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-se6g",
        "traineeId": "trainee-1787352042660-3pzc7",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-5rl3",
        "traineeId": "trainee-1787352042660-oq0mk",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-4zwj",
        "traineeId": "trainee-1787352042660-fg0l2",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-xc39",
        "traineeId": "trainee-1787352042660-tm3jn",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-fon5",
        "traineeId": "trainee-1787352042660-55ejb",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-00pc",
        "traineeId": "trainee-1787352042660-fvl4h",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-0d04",
        "traineeId": "trainee-1787352042660-rhqwa",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-s81f",
        "traineeId": "trainee-1787352042660-9dlhd",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-s2ix",
        "traineeId": "trainee-1787352042659-ar42s",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-o6wx",
        "traineeId": "trainee-1787352042659-gqgsy",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-nz5m",
        "traineeId": "trainee-1787352042659-jh7kz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-angs",
        "traineeId": "trainee-1787352042659-e04f9",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-9tib",
        "traineeId": "trainee-1787352042659-vjfom",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-yyio",
        "traineeId": "trainee-1787352042659-evsvu",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-47rb",
        "traineeId": "trainee-1787352042659-30u4t",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-zkpq",
        "traineeId": "trainee-1787352042659-6w8y1",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-ajmv",
        "traineeId": "trainee-1787352042659-iulgm",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-ux8q",
        "traineeId": "trainee-1787352042658-h207g",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-tndb",
        "traineeId": "trainee-1787352042658-ftf8i",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-9pqe",
        "traineeId": "trainee-1787352042658-sthr3",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-q0rl",
        "traineeId": "trainee-1787352042658-ch8fv",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-zt8u",
        "traineeId": "trainee-1787352042658-ghc76",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-89ri",
        "traineeId": "trainee-1787352042658-1n9q9",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-weog",
        "traineeId": "trainee-1787352042657-1a5h3",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-2e73",
        "traineeId": "trainee-1787352042657-2qd5a",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-4dp6",
        "traineeId": "trainee-1787352042657-8fcyh",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-hvnv",
        "traineeId": "trainee-1787352042657-q46jv",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-125j",
        "traineeId": "trainee-1787352042656-rv47j",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-bv2g",
        "traineeId": "trainee-1787352042656-jn14r",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-kag7",
        "traineeId": "trainee-1787352042656-gud54",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-i9tu",
        "traineeId": "trainee-1787352042656-l3txa",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-fs6o",
        "traineeId": "trainee-1787352042655-3lihh",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-1s9h",
        "traineeId": "trainee-1787352042655-o2znr",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-ft81",
        "traineeId": "trainee-1787352042655-bkzr9",
        "groupId": "",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-vzcx",
        "traineeId": "trainee-1787352042654-pluyz",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-ll3o",
        "traineeId": "trainee-1787352042654-aj70e",
        "groupId": "",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-1787356997938-4g1k",
        "traineeId": "trainee-1787347185722-0aw8",
        "groupId": "",
        "branchId": "branch-1",
        "points": 30,
        "reason": "سلوك راقٍ ومساعدة الزملاء",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-22T00:03:17.938Z"
    },
    {
        "id": "pt-reinf-1787356402355-8ix9",
        "traineeId": "trainee-1787347185722-0aw8",
        "groupId": "",
        "branchId": "branch-1",
        "points": 6,
        "reason": "[تعزيز وتحفيز مباشر]: تقدير وتميز للمتدرب (جهاز PC-71) 🌟 - إجابة متقنة وتطبيق عملي متميز خلال التمرين!",
        "addedByUserId": "trainer",
        "addedByUserName": "المدرب",
        "createdAt": "2026-08-21T23:53:22.355Z"
    },
    {
        "id": "pt-reinf-1787356276902-zudl",
        "traineeId": "trainee-1787347185722-0aw8",
        "groupId": "",
        "branchId": "branch-1",
        "points": 21,
        "reason": "[تعزيز وتحفيز مباشر]: إجابة نموذجية وإبداع برمجي! - طريقة تفكير وحل استثنائي يستحق الإشادة!",
        "addedByUserId": "trainer",
        "addedByUserName": "المدرب",
        "createdAt": "2026-08-21T23:51:16.902Z"
    },
    {
        "id": "pt-1787356160111-dw3h",
        "traineeId": "trainee-1787352042654-pluyz",
        "branchId": "branch-1",
        "points": 50,
        "reason": "تفوق واختبار متميز 🌟",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-21T23:49:20.111Z"
    },
    {
        "id": "pt-1787356156650-h18e",
        "traineeId": "trainee-1787352042654-aj70e",
        "groupId": "",
        "branchId": "branch-1",
        "points": 50,
        "reason": "تفوق واختبار متميز 🌟",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-21T23:49:16.650Z"
    },
    {
        "id": "pt-1787355883695-uifc",
        "traineeId": "trainee-1787347185722-0aw8",
        "groupId": "",
        "branchId": "branch-1",
        "points": 30,
        "reason": "إجابة نموذجية وسرعة بديهة",
        "addedByUserId": "user-admin",
        "addedByUserName": "مدير عام النظام",
        "createdAt": "2026-08-21T23:44:43.695Z"
    },
    {
        "id": "pt-1787352904987",
        "traineeId": "trainee-1787347185722-0aw8",
        "branchId": "branch-1",
        "points": 10,
        "reason": "حضور المحاضرة عبر جهاز المعمل (جهاز PC-71)",
        "ruleId": "rule-1",
        "addedByUserId": "system",
        "addedByUserName": "النظام الآلي للمعمل",
        "createdAt": "2026-08-21T22:55:04.987Z"
    },
    {
        "id": "pt-1787352484632-vnjm",
        "traineeId": "trainee-1787352042654-aj70e",
        "groupId": "",
        "branchId": "branch-1",
        "points": 15,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-21T22:48:04.632Z"
    },
    {
        "id": "pt-1787352471508-uvf6",
        "traineeId": "trainee-1787352042654-aj70e",
        "groupId": "",
        "branchId": "branch-1",
        "points": 10,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-21T22:47:51.508Z"
    },
    {
        "id": "pt-1787350954168-igdw",
        "traineeId": "trainee-1787347185722-0aw8",
        "branchId": "branch-1",
        "points": 10,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-21T22:22:34.168Z"
    },
    {
        "id": "pt-1787349991130-8r97",
        "traineeId": "trainee-1787347185722-0aw8",
        "branchId": "branch-1",
        "points": 15,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-21T22:06:31.130Z"
    },
    {
        "id": "pt-1787349976876-o45n",
        "traineeId": "trainee-1787347185722-0aw8",
        "branchId": "branch-1",
        "points": 10,
        "reason": "مشاركة ممتازة وتسليم المشروع العملي",
        "addedByUserId": "admin",
        "addedByUserName": "مسؤول النقاط",
        "createdAt": "2026-08-21T22:06:16.876Z"
    },
    {
        "id": "pt-1787446474044",
        "traineeId": "trainee-1787361330810-d1if",
        "groupId": "grp-1787358595611",
        "branchId": "branch-1",
        "points": 55,
        "reason": "تسليم واجب: واجب تطبيق الدرس العملي والمشروع الرئيسي (تقييم ذكي: 100%)",
        "ruleId": "rule-3",
        "addedByUserId": "ai-engine",
        "addedByUserName": "نظام تصحيح الذكاء الاصطناعي",
        "createdAt": "2026-08-23T00:54:34.044Z"
    },
    {
        "id": "pt-1787451229685-5xl3",
        "traineeId": "trainee-1787361410293-aeko",
        "groupId": "grp-1787431608023",
        "branchId": "branch-1",
        "points": 20,
        "reason": "⭐ مكافأة إتقان (واجب تطبيق الدرس - الكتاب المدرسي): درجة 90/100 (90%)",
        "addedByUserId": "ai-scanner",
        "addedByUserName": "مصحح الذكاء الاصطناعي",
        "createdAt": "2026-08-23T02:13:49.685Z"
    }
],
  exams: [
    {
        "id": "exam-1787446743699",
        "title": "امتحان مادة تكنولوجيا المعلومات والاتصالات - الصف الخامس الابتدائي - الفصل الدراسي الأول",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "examDate": "2026-08-23",
        "totalMarks": 100,
        "passingMarks": 50,
        "durationMinutes": 90,
        "status": "scheduled",
        "instructions": "اختبار شامل لمادة تكنولوجيا المعلومات والاتصالات للصف الخامس الابتدائي، يغطي المفاهيم الأساسية لشبكات الإنترنت والإنترانت، مكونات الحاسوب ووحدات القياس، حماية حقوق النشر، التمييز بين الحقائق والآراء، استخدام برامج Microsoft Office، ومفاهيم الأمان الرقمي والتوصيل."
    },
    {
        "id": "hw-scan-1787451229685",
        "title": "واجب تطبيق الدرس - الكتاب المدرسي",
        "courseId": "course-1787347401956",
        "groupId": "grp-1787431608023",
        "branchId": "branch-1",
        "examDate": "2026-08-23",
        "totalMarks": 100,
        "passingMarks": 60,
        "durationMinutes": 30,
        "status": "completed",
        "instructions": "تصحيح ورقي آلي عبر الماسح الذكي وكود المتدرب"
    },
    {
        "id": "exam-1787463526231",
        "title": "الاختبار القبلي للدورة",
        "branchId": "branch-1",
        "courseId": "course-1787347401956",
        "examDate": "2026-08-23",
        "totalMarks": 100,
        "durationMinutes": 60,
        "status": "scheduled",
        "instructions": "يرجى الإجابة عن جميع الأسئلة والالتزام بالوقت المحدد."
    }
],
  questions: [
    {
        "id": "q-1787446743699-0-m40",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.",
        "options": [
            "A",
            "B",
            "C",
            "D"
        ],
        "correctAnswer": "C",
        "marks": 5
    },
    {
        "id": "q-1787446743699-1-0ij",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.",
        "options": [
            "word",
            "الراوتر",
            "بنك المعرفة المصري",
            "لوحة المفاتيح"
        ],
        "correctAnswer": "الراوتر",
        "marks": 5
    },
    {
        "id": "q-1787446743699-2-rg3",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "........ وحدة قياس لعدد الدورات التي تنفذها وحدة المعالجة المركزية في الثانية.",
        "options": [
            "ميجابايت في الثانية",
            "جيجا هرتز",
            "بايت",
            "كيلوبايت"
        ],
        "correctAnswer": "جيجا هرتز",
        "marks": 5
    },
    {
        "id": "q-1787446743699-3-van",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "لحل مشكلة بطء التحميل.............",
        "options": [
            "أعد تشغيل الكمبيوتر والراوتر",
            "حذف برنامج word",
            "تحديث النظام",
            "إيقاف تشغيل الشاشة"
        ],
        "correctAnswer": "أعد تشغيل الكمبيوتر والراوتر",
        "marks": 5
    },
    {
        "id": "q-1787446743699-4-v64",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "يستخدم ............. لمشاركة المعلومات عبر شبكة مغلقة، وهو أكثر أماناً.",
        "options": [
            "الإنترنت",
            "الإنترانت",
            "الويب",
            "وسائل التواصل الاجتماعي"
        ],
        "correctAnswer": "الإنترانت",
        "marks": 5
    },
    {
        "id": "q-1787446743699-5-ppk",
        "examId": "exam-1787446743699",
        "questionType": "true_false",
        "questionText": "WWW هو اختصار لـ world wide web.",
        "options": [
            "صح",
            "خطأ"
        ],
        "correctAnswer": "صح",
        "marks": 5
    },
    {
        "id": "q-1787446743699-6-pyf",
        "examId": "exam-1787446743699",
        "questionType": "true_false",
        "questionText": "مواقع التسوق المزيفة ترسل لك العناصر الصحيحة التي قمت بشرائها.",
        "options": [
            "صح",
            "خطأ"
        ],
        "correctAnswer": "خطأ",
        "marks": 5
    },
    {
        "id": "q-1787446743699-7-22x",
        "examId": "exam-1787446743699",
        "questionType": "true_false",
        "questionText": "واحدة من المشكلات الشائعة التي تواجهها عند استخدام الكمبيوتر والإنترنت هي بطء التحميل.",
        "options": [
            "صح",
            "خطأ"
        ],
        "correctAnswer": "صح",
        "marks": 5
    },
    {
        "id": "q-1787446743699-8-xpd",
        "examId": "exam-1787446743699",
        "questionType": "true_false",
        "questionText": "يمكننا ترتيب المعلومات أبجدياً في برنامج Excel باستخدام خاصية Sort.",
        "options": [
            "صح",
            "خطأ"
        ],
        "correctAnswer": "صح",
        "marks": 5
    },
    {
        "id": "q-1787446743699-9-n8l",
        "examId": "exam-1787446743699",
        "questionType": "true_false",
        "questionText": "مواقع الجوائز والمكافآت تقدم عروضاً مالية كبيرة وجوائز غير حقيقية.",
        "options": [
            "صح",
            "خطأ"
        ],
        "correctAnswer": "صح",
        "marks": 5
    },
    {
        "id": "q-1787446743699-10-7gz",
        "examId": "exam-1787446743699",
        "questionType": "short_answer",
        "questionText": "البايت هو وحدة قياس مساحة ............ بجهاز الكمبيوتر.",
        "options": [],
        "correctAnswer": "التخزين",
        "marks": 5
    },
    {
        "id": "q-1787446743699-11-8lm",
        "examId": "exam-1787446743699",
        "questionType": "short_answer",
        "questionText": "يستخدم برنامج ................ لكتابة التقارير.",
        "options": [],
        "correctAnswer": "Word",
        "marks": 5
    },
    {
        "id": "q-1787446743699-12-9c7",
        "examId": "exam-1787446743699",
        "questionType": "short_answer",
        "questionText": "يستخدم ................ الإنترنت لاقتحام أنظمة الكمبيوتر وسرقة المعلومات.",
        "options": [],
        "correctAnswer": "المخترقون",
        "marks": 5
    },
    {
        "id": "q-1787446743699-13-khg",
        "examId": "exam-1787446743699",
        "questionType": "short_answer",
        "questionText": "تستند الآراء إلى وجهة ............ الشخص وخبراته.",
        "options": [],
        "correctAnswer": "نظر",
        "marks": 5
    },
    {
        "id": "q-1787446743699-14-jvs",
        "examId": "exam-1787446743699",
        "questionType": "short_answer",
        "questionText": "يستخدم برنامج ................ لعمل الجداول الحسابية.",
        "options": [],
        "correctAnswer": "Excel",
        "marks": 5
    },
    {
        "id": "q-1787446743699-15-k02",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "1 جيجابايت تساوي:",
        "options": [
            "1024 ميجابايت",
            "1000 بايت",
            "1024 كيلوبايت",
            "8 بت"
        ],
        "correctAnswer": "1024 ميجابايت",
        "marks": 5
    },
    {
        "id": "q-1787446743699-16-2lq",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "سلك إيثرنت (Ethernet):",
        "options": [
            "هو سلك يربط جهاز الكمبيوتر بجهاز التوجيه (الراوتر)",
            "هي خدمة الإنترنت التي تقدمها الشركات المصرية",
            "تساعد المكفوفين على القراءة",
            "إدخال الصور والرسوم للكمبيوتر"
        ],
        "correctAnswer": "هو سلك يربط جهاز الكمبيوتر بجهاز التوجيه (الراوتر)",
        "marks": 5
    },
    {
        "id": "q-1787446743699-17-1qr",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "مزود خدمة الإنترنت (ISP):",
        "options": [
            "هي خدمة الإنترنت التي تقدمها الشركات للمستخدمين",
            "إدخال الصور والرسوم للكمبيوتر",
            "تساعد المكفوفين على القراءة",
            "وحدة قياس سرعة المعالج"
        ],
        "correctAnswer": "هي خدمة الإنترنت التي تقدمها الشركات للمستخدمين",
        "marks": 5
    },
    {
        "id": "q-1787446743699-18-blv",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "طريقة برايل (Braille):",
        "options": [
            "تساعد المكفوفين على القراءة",
            "إدخال الصور والرسوم للكمبيوتر",
            "سلك لربط الأجهزة",
            "برنامج للجداول الحسابية"
        ],
        "correctAnswer": "تساعد المكفوفين على القراءة",
        "marks": 5
    },
    {
        "id": "q-1787446743699-19-e3v",
        "examId": "exam-1787446743699",
        "questionType": "mcq",
        "questionText": "الماسح الضوئي (Scanner):",
        "options": [
            "إدخال الصور والرسوم للكمبيوتر",
            "تساعد المكفوفين على القراءة",
            "خدمة تزويد الإنترنت",
            "وحدة تخزين للبيانات"
        ],
        "correctAnswer": "إدخال الصور والرسوم للكمبيوتر",
        "marks": 5
    }
],
  examResults: [
    {
        "id": "res-1787451229685-hea2",
        "examId": "hw-scan-1787451229685",
        "traineeId": "trainee-1787361410293-aeko",
        "traineeName": "رفيف محمد رمضان بخيت",
        "score": 90,
        "totalMarks": 100,
        "percentage": 90,
        "status": "passed",
        "rating": "ممتاز",
        "notes": "أداء رائع ومتميز جداً! تم فحص وتصحيح الصفحة وإضافة الدرجات والنقاط التشجيعية إلى الملف بنجاح.",
        "submittedAt": "2026-08-23T02:13:49.685Z"
    }
],
  interactiveSessions: [
    {
        "id": "is-1787362644609",
        "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
        "platform": "Kahoot",
        "url": "https://kahoot.ithttps://kahoot.it/challenge/04274914?challenge-id=6f2f94ac-6722-4128-b6c1-72224d86b6ff_1787362624408",
        "groupId": "grp-1",
        "branchId": "branch-1",
        "sessionDate": "2026-08-22",
        "notes": "",
        "questions": [
            {
                "id": "q-1787362688971",
                "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
                "options": [
                    "useState()",
                    "useEffect()",
                    "useRef()",
                    "useMemo()"
                ],
                "correctOptionIndex": 1,
                "points": 15,
                "timeLimitSeconds": 30
            }
        ],
        "currentQuestionIndex": 0
    },
    {
        "id": "is-1787362394743",
        "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
        "platform": "Kahoot",
        "url": "https://kahoot.it",
        "groupId": "grp-1",
        "branchId": "branch-1",
        "sessionDate": "2026-08-22",
        "notes": ""
    },
    {
        "id": "is-1787362337448",
        "title": "مسابقة التحدي التفاعلي - بايثون وتطوير الويب",
        "platform": "Kahoot",
        "url": "https://kahoot.it",
        "groupId": "grp-1",
        "branchId": "branch-1",
        "sessionDate": "2026-08-22",
        "notes": "",
        "questions": [
            {
                "id": "q-1787362348311",
                "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
                "options": [
                    "useState()",
                    "useEffect()",
                    "useRef()",
                    "useMemo()"
                ],
                "correctOptionIndex": 1,
                "points": 15,
                "timeLimitSeconds": 30
            },
            {
                "id": "q-1787362373107",
                "text": "ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟",
                "options": [
                    "useState()",
                    "useEffect()",
                    "useRef()",
                    "useMemo()"
                ],
                "correctOptionIndex": 1,
                "points": 15,
                "timeLimitSeconds": 30
            }
        ],
        "currentQuestionIndex": 1
    }
],
  devices: [],
  deviceCommands: [
    {
        "id": "cmd-1787353097554-p0hu",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T22:58:17.554Z"
    },
    {
        "id": "cmd-1787353106454-soht",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T22:58:26.454Z"
    },
    {
        "id": "cmd-1787354001394-29ga",
        "deviceId": "PC-71",
        "commandType": "shutdown",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:21.394Z"
    },
    {
        "id": "cmd-1787354006700-aj23",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:26.700Z"
    },
    {
        "id": "cmd-1787354015351-86zr",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:35.351Z"
    },
    {
        "id": "cmd-1787354026862-rr6k",
        "deviceId": "PC-71",
        "commandType": "reboot",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:46.862Z"
    },
    {
        "id": "cmd-1787354029696-im13",
        "deviceId": "PC-71",
        "commandType": "shutdown",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:49.696Z"
    },
    {
        "id": "cmd-1787354031215-0bch",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:51.215Z"
    },
    {
        "id": "cmd-1787354032145-aecj",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:52.145Z"
    },
    {
        "id": "cmd-1787354032335-4ijw",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:13:52.335Z"
    },
    {
        "id": "cmd-1787354041352-4hy8",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:14:01.352Z"
    },
    {
        "id": "cmd-1787354064072-vh8f",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "يرجى الانتباه للشرح على شاشة العرض الرئيسية الآن",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:14:24.072Z"
    },
    {
        "id": "cmd-reinf-1787356276902-vhwg",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"إجابة نموذجية وإبداع برمجي!\",\"message\":\"طريقة تفكير وحل استثنائي يستحق الإشادة!\",\"stars\":2,\"points\":21,\"icon\":\"💡\",\"trainerName\":\"المدرب\",\"badgeText\":\"إجابة ذكية 💡\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787347185722-0aw8\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"م001\",\"points\":86,\"totalPoints\":86,\"starsCount\":8,\"overallRank\":1,\"totalTrainees\":93,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"المجموعة التدريبية\"},\"timestamp\":1787356276902}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-21T23:51:16.902Z"
    },
    {
        "id": "cmd-1787356296742-0kh6",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"clean_reset\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:51:36.742Z"
    },
    {
        "id": "cmd-reinf-1787356402355-v7bl",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"تقدير وتميز للمتدرب (جهاز PC-71) 🌟\",\"message\":\"إجابة متقنة وتطبيق عملي متميز خلال التمرين!\",\"stars\":1,\"points\":6,\"icon\":\"⭐\",\"trainerName\":\"المدرب\",\"badgeText\":\"نجم الحصة 🌟\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787347185722-0aw8\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"م001\",\"points\":92,\"totalPoints\":92,\"starsCount\":9,\"overallRank\":1,\"totalTrainees\":93,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"المجموعة التدريبية\"},\"timestamp\":1787356402355}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-21T23:53:22.355Z"
    },
    {
        "id": "cmd-1787356411197-0s5l",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:53:31.197Z"
    },
    {
        "id": "cmd-1787356414736-jjr2",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-21T23:53:34.736Z"
    },
    {
        "id": "cmd-1787359735524-d1qd",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:48:55.524Z"
    },
    {
        "id": "cmd-1787359750791-8wfc",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:49:10.791Z"
    },
    {
        "id": "cmd-1787359794426-l3ti",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T00:49:54.426Z"
    },
    {
        "id": "cmd-1787359844994-ulcx",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:50:44.994Z"
    },
    {
        "id": "cmd-1787359857348-su60",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"clean_reset\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:50:57.348Z"
    },
    {
        "id": "cmd-1787359891812-c3rp",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:51:31.812Z"
    },
    {
        "id": "cmd-1787359897685-4kor",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T00:51:37.685Z"
    },
    {
        "id": "cmd-1787361823607-h42c",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:23:43.607Z"
    },
    {
        "id": "cmd-1787361853660-46fb",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"open_url\",\"url\":\"https://ekb.eg\"}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:24:13.660Z"
    },
    {
        "id": "cmd-1787361946709-9afo",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:25:46.709Z"
    },
    {
        "id": "cmd-1787361949497-kdv9",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:25:49.497Z"
    },
    {
        "id": "cmd-1787361966040-apct",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"open_url\",\"url\":\"https://ekb.eg\"}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:26:06.040Z"
    },
    {
        "id": "cmd-reinf-1787362006056-hcvq",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":91,\"totalPoints\":91,\"starsCount\":9,\"overallRank\":1,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787362006056}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:26:46.056Z"
    },
    {
        "id": "cmd-1787362019251-7w0k",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"start_broadcast\",\"trainerName\":\"مدرب المعمل\"}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:26:59.251Z"
    },
    {
        "id": "cmd-1787362097808-gd69",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"clean_reset\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:28:17.808Z"
    },
    {
        "id": "cmd-1787362348513-a1gq",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362348311\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362337448\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:32:28.513Z"
    },
    {
        "id": "cmd-1787362373263-ez7g",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362373107\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362337448\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:32:53.263Z"
    },
    {
        "id": "cmd-1787362689677-yjfn",
        "deviceId": "PC-74",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362688971\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:38:09.677Z"
    },
    {
        "id": "cmd-1787362689678-ea43",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787362688971\",\"text\":\"ما هي الدالة المسؤولة عن تشغيل كود عند تحميل المكون في React؟\",\"options\":[\"useState()\",\"useEffect()\",\"useRef()\",\"useMemo()\"],\"correctOptionIndex\":1,\"points\":15,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-22T01:38:09.678Z"
    },
    {
        "id": "cmd-reinf-1787362796188-fq1i",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361410293-aeko\",\"fullName\":\"رفيف محمد رمضان بخيت\",\"code\":\"A002\",\"points\":80,\"totalPoints\":80,\"starsCount\":8,\"overallRank\":2,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥈\",\"courseName\":\"ICT5\",\"groupName\":\"ICT - p1 - 1\"},\"timestamp\":1787362796188}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:39:56.188Z"
    },
    {
        "id": "cmd-reinf-1787362796188-vx8o",
        "deviceId": "PC-74",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"تحية وتشجيع لجميع متدربي القاعة! 🚀\",\"message\":\"تفاعل ممتاز وجهد جماعي رائع في هذا التمرين التدريبي!\",\"stars\":5,\"points\":51,\"icon\":\"🌟\",\"trainerName\":\"المدرب\",\"badgeText\":\"أبطال المعمل 🏆\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":142,\"totalPoints\":142,\"starsCount\":14,\"overallRank\":1,\"totalTrainees\":2,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متقدم ذهبي 🏆\",\"badgeColor\":\"bg-yellow-500/20 text-yellow-300 border-yellow-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787362796188}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-22T01:39:56.188Z"
    },
    {
        "id": "cmd-1787465198118-7q91",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:38.118Z"
    },
    {
        "id": "cmd-1787465198120-pvb9",
        "deviceId": "PC-74",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:38.120Z"
    },
    {
        "id": "cmd-1787465198123-ij0i",
        "deviceId": "PC-83",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:38.123Z"
    },
    {
        "id": "cmd-1787465201407-6aig",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:41.407Z"
    },
    {
        "id": "cmd-1787465201413-919a",
        "deviceId": "PC-74",
        "commandType": "lock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:41.413Z"
    },
    {
        "id": "cmd-1787465201417-a9n3",
        "deviceId": "PC-83",
        "commandType": "lock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:41.417Z"
    },
    {
        "id": "cmd-1787465219889-1xrf",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:59.889Z"
    },
    {
        "id": "cmd-1787465219898-dti6",
        "deviceId": "PC-74",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:59.898Z"
    },
    {
        "id": "cmd-1787465219906-aue4",
        "deviceId": "PC-83",
        "commandType": "unlock",
        "payload": "{}",
        "status": "delivered",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:06:59.906Z"
    },
    {
        "id": "cmd-1787465249309-e2bi",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:07:29.309Z"
    },
    {
        "id": "cmd-1787465249333-45kp",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:07:29.333Z"
    },
    {
        "id": "cmd-1787465249341-is12",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:07:29.341Z"
    },
    {
        "id": "cmd-1787465251082-86ej",
        "deviceId": "PC-71",
        "commandType": "lock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:07:31.082Z"
    },
    {
        "id": "cmd-1787465255242-lpet",
        "deviceId": "PC-71",
        "commandType": "unlock",
        "payload": "{}",
        "status": "pending",
        "issuedByUserId": "admin",
        "createdAt": "2026-08-23T06:07:35.242Z"
    },
    {
        "id": "cmd-reinf-1787465508933-i05s",
        "deviceId": "PC-71",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361410293-aeko\",\"fullName\":\"رفيف محمد رمضان بخيت\",\"code\":\"A002\",\"points\":200,\"totalPoints\":200,\"starsCount\":20,\"overallRank\":2,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥈\",\"courseName\":\"ICT5\",\"groupName\":\"ICT5 - 1\"},\"timestamp\":1787465508933}",
        "status": "pending",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-23T06:11:48.933Z"
    },
    {
        "id": "cmd-reinf-1787465508933-sin1",
        "deviceId": "PC-74",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":383,\"totalPoints\":383,\"starsCount\":38,\"overallRank\":1,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787465508933}",
        "status": "pending",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-23T06:11:48.933Z"
    },
    {
        "id": "cmd-reinf-1787465508933-1vz5",
        "deviceId": "PC-83",
        "commandType": "message",
        "payload": "{\"action\":\"reinforcement\",\"title\":\"مشاركة وتعاون متميز!\",\"message\":\"دعم ومساعدة الزملاء في حل التحديات البرمجية!\",\"stars\":2,\"points\":16,\"icon\":\"🤝\",\"trainerName\":\"المدرب\",\"badgeText\":\"تعاون مثالي 🤝\",\"reinforcementType\":\"star_award\",\"traineeStats\":{\"id\":\"trainee-1787361330810-d1if\",\"fullName\":\"مرام محمد رمضان بخيت\",\"code\":\"A001\",\"points\":383,\"totalPoints\":383,\"starsCount\":38,\"overallRank\":1,\"totalTrainees\":3,\"groupRank\":1,\"groupTotal\":1,\"tierName\":\"متألق أسطوري 🌟\",\"badgeColor\":\"bg-amber-500/20 text-amber-300 border-amber-500/40\",\"rankBadge\":\"🥇\",\"courseName\":\"ICT-P1\",\"groupName\":\"ICT - p1 - 2\"},\"timestamp\":1787465508933}",
        "status": "delivered",
        "issuedByUserId": "trainer",
        "createdAt": "2026-08-23T06:11:48.933Z"
    },
    {
        "id": "cmd-1787465546210-zzpk",
        "deviceId": "dev-1787352892067",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:12:26.210Z",
        "issuedAt": "2026-08-23T06:12:26.211Z",
        "status": "pending"
    },
    {
        "id": "cmd-1787465546211-41zl",
        "deviceId": "dev-1787362571450",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:12:26.211Z",
        "issuedAt": "2026-08-23T06:12:26.211Z",
        "status": "pending"
    },
    {
        "id": "cmd-1787465546211-4no7",
        "deviceId": "dev-1787464212308",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465545797\",\"text\":\"يتم استخدام حرف ........ داخل دائرة وهو الرمز الدولي لحماية حقوق النشر.\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:12:26.211Z",
        "issuedAt": "2026-08-23T06:12:26.211Z",
        "status": "pending"
    },
    {
        "id": "cmd-1787465607959-4kac",
        "deviceId": "dev-1787352892067",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:13:27.959Z",
        "issuedAt": "2026-08-23T06:13:27.959Z",
        "status": "pending"
    },
    {
        "id": "cmd-1787465607959-1z3r",
        "deviceId": "dev-1787362571450",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:13:27.959Z",
        "issuedAt": "2026-08-23T06:13:27.959Z",
        "status": "pending"
    },
    {
        "id": "cmd-1787465607959-f87n",
        "deviceId": "dev-1787464212308",
        "commandType": "message",
        "payload": "{\"action\":\"interactive_question\",\"question\":{\"id\":\"q-1787465607546\",\"text\":\"..... هي بوابة تستخدم لتوصيل جهاز الكمبيوتر بالإنترنت.\",\"options\":[\"word\",\"الراوتر\",\"بنك المعرفة المصري\",\"لوحة المفاتيح\"],\"correctOptionIndex\":0,\"points\":5,\"timeLimitSeconds\":30},\"sessionId\":\"is-1787362644609\"}",
        "issuedByUserId": "trainer-live",
        "createdAt": "2026-08-23T06:13:27.959Z",
        "issuedAt": "2026-08-23T06:13:27.959Z",
        "status": "pending"
    }
],
  certificates: [
    {
        "id": "cert-1787450838230",
        "certificateNumber": "CERT-2026-38230",
        "serialNumber": "CERT-2026-38230",
        "traineeId": "trainee-1787361410293-aeko",
        "traineeName": "رفيف محمد رمضان بخيت",
        "courseId": "course-1787347401956",
        "courseName": "ICT4",
        "branchId": "branch-1",
        "issueDate": "2026-08-23",
        "grade": "امتياز مع مرتبة الشرف (A+)",
        "durationText": "30 ساعة تدريبية معتمدة",
        "qrPayload": "{\"certificateNumber\":\"CERT-2026-38230\",\"traineeName\":\"رفيف محمد رمضان بخيت\",\"courseName\":\"ICT4\",\"issueDate\":\"2026-08-23\",\"center\":\"مركز النجاح للتدريب والاستشارات\"}",
        "trainerName": "المدرب المعتمد",
        "managerName": "د. محمد رمضان بخيت",
        "templateId": "template-1787450798128"
    },
    {
        "id": "cert-1787347853394",
        "certificateNumber": "CERT-2026-53394",
        "serialNumber": "CERT-2026-53394",
        "traineeId": "trainee-1787347185722-0aw8",
        "traineeName": "مرام محمد رمضان بخيت",
        "courseId": "course-1787347401956",
        "courseName": "ICT4",
        "branchId": "branch-1",
        "issueDate": "2026-08-21",
        "grade": "ممتاز مع مرتبة الشرف",
        "durationText": "64 ساعة تدريبية",
        "qrPayload": "{\"certificateNumber\":\"CERT-2026-53394\",\"traineeName\":\"مرام محمد رمضان بخيت\",\"courseName\":\"ICT4\",\"issueDate\":\"2026-08-21\",\"center\":\"مركز النجاح للتدريب والاستشارات\"}",
        "trainerName": "المدرب المعتمد",
        "managerName": "مدير عام المركز"
    }
],
  certificateTemplates: [
    {
      id: 'template-nagah-official-ar',
      name: 'الشهادة المعتمدة الرسمية - عربي (مجلس الاعتماد)',
      theme: 'classic_gold',
      primaryColor: '#c59b27',
      accentColor: '#96741b',
      titleArabic: 'شــهــادة',
      titleEnglish: 'CERTIFICATE',
      subTitleArabic: 'تشهد أكاديمية النجاح للتدريب والاستشارات',
      bodyTemplate: 'أن المشارك قد اجتاز البرنامج التدريبي بنجاح وشارك بتميز وفاعلية مع التمنيات بدوام التوفيق',
      sealText: 'NGAH T&CN - معتمد',
      managerTitle: 'يعتمد: مدير الأكاديمية',
      managerName: 'د. محمد رمضان بخيت',
      trainerTitle: 'المدرب',
      showQrCode: true,
      borderStyle: 'double',
      isDefault: true
    },
    {
      id: 'template-nagah-official-en',
      name: 'Accredited Official Certificate - English (Accreditation Board)',
      theme: 'classic_gold',
      primaryColor: '#c59b27',
      accentColor: '#96741b',
      titleArabic: 'شــهــادة معتمدة بالإنجليزية',
      titleEnglish: 'CERTIFICATE OF COMPLETION',
      subTitleArabic: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
      bodyTemplate: 'Successfully Completed Training Program with Distinction & High Performance',
      sealText: 'NGAH ACCREDITED',
      managerTitle: 'Academy Director',
      managerName: 'Dr. Mohamed Bkeet',
      trainerTitle: 'Trainer',
      showQrCode: true,
      borderStyle: 'double',
      isDefault: false
    },
    {
      id: 'template-tech',
      name: 'النموذج المودرن التكنولوجي (Modern Tech)',
      theme: 'modern_tech',
      primaryColor: '#2563eb',
      accentColor: '#1d4ed8',
      titleArabic: 'أكاديمية النجاح لعلوم الحاسب والتكنولوجيا',
      titleEnglish: 'NGAH TECH & CONSULTING ACADEMY',
      subTitleArabic: 'شهادة كفاءة واجتياز تدريبي تخصصي',
      bodyTemplate: 'نقر بأن المتدرب قد أتم جميع المشاريع والتطبيقات العملية والمهام البرمجية بنجاح وحصل على درجة الكفاءة العالية.',
      sealText: 'مصدق إلكترونياً',
      managerTitle: 'مدير البرامج التقنية',
      managerName: 'إدارة مركز النجاح',
      trainerTitle: 'كبير المدربين والمطورين',
      showQrCode: true,
      borderStyle: 'modern',
      isDefault: false
    },
    {
      id: 'template-emerald',
      name: 'النموذج الأكاديمي الزمردي (Academic Emerald)',
      theme: 'royal_emerald',
      primaryColor: '#059669',
      accentColor: '#047857',
      titleArabic: 'مركز النجاح للتأهيل والتطوير المهني',
      titleEnglish: 'NGAH PROFESSIONAL DEVELOPMENT CENTER',
      subTitleArabic: 'شهادة تفوق وتقدير مهني معتمد',
      bodyTemplate: 'تقديراً للأداء الاستثنائي والمواظبة والانضباط تم منح هذه الشهادة الرسمية بعد اجتياز الاختبارات النظرية والعملية.',
      sealText: 'معتمد رسمياً',
      managerTitle: 'المدير التنفيذي',
      managerName: 'د. محمد رمضان بخيت',
      trainerTitle: 'المحاضر المعتمد',
      showQrCode: true,
      borderStyle: 'ornate',
      isDefault: false
    }
  ],
  auditLogs: [
    {
      id: 'log-init',
      userId: 'user-admin',
      userName: 'مدير عام النظام',
      action: 'تهيئة النظام',
      entity: 'النظام',
      details: 'تم بدء تشغيل نظام مركز النجاح V7 وتهيئة قاعدة البيانات بنجاح',
      timestamp: new Date().toISOString()
    }
  ],
  settings: {
    centerName: 'مركز النجاح للتدريب والاستشارات',
    centerSubtitle: 'Nagah M-S',
    logoUrl: '/logo.svg',
    defaultCurrency: 'جنيه مصري',
    traineeCodePrefix: 'A',
    autoCodeLength: 3,
    academicYear: '2026/2027',
    gradePrefixes: {
      'الصف الرابع': 'A',
      'الصف الخامس': 'B',
      'الصف السادس': 'C',
      'الصف الأول الإعدادي': 'D',
      'الصف الثاني الإعدادي': 'E',
      'الصف الثالث الإعدادي': 'F',
      'ICT4': 'A',
      'ICT5': 'B',
      'ICT6': 'C',
      'ICT-P1': 'D',
      'ICT-P2': 'E',
      'ICT-P3': 'F'
    },
    defaultTrainerCommission: 40,
    defaultCenterCommission: 60,
    serverIp: '127.0.0.1',
    primaryPhone: '01001500686',
    phone: '01001500686',
    vodafoneCash: '01001500686',
    instapay: 'm_bkeet@instapay',
    email: 'info@success-center.eg',
    address: 'جمهورية مصر العربية',
    pointRules: defaultPointRules,
    rolePermissions: [
      {
        id: 'super_admin',
        title: 'مدير عام المركز (كامل الصلاحيات)',
        description: 'صلاحيات كاملة وغير مقيدة على جميع الفروع والنظام',
        isSystem: true,
        permissions: ['dashboard', 'trainees', 'trainers', 'courses', 'programs', 'groups', 'attendance', 'finance', 'expenses', 'points', 'exams', 'interactive', 'devices', 'messages', 'reports', 'certificates', 'branches', 'audit', 'settings']
      },
      {
        id: 'branch_manager',
        title: 'مدير الفرع',
        description: 'إدارة شؤون الفرع والطلاب والدورات والتقارير المالية والتشغيلية',
        isSystem: true,
        permissions: ['dashboard', 'trainees', 'trainers', 'courses', 'programs', 'groups', 'attendance', 'finance', 'expenses', 'points', 'exams', 'interactive', 'devices', 'messages', 'reports', 'certificates']
      },
      {
        id: 'accountant',
        title: 'المحاسب المالي',
        description: 'إدارة الخزينة والواردات والمصروفات والرواتب وكشف حساب المدربين',
        isSystem: true,
        permissions: ['dashboard', 'finance', 'expenses', 'reports']
      },
      {
        id: 'receptionist',
        title: 'مسؤول الاستقبال والقبول',
        description: 'تسجيل الطلاب والحضور والغياب والتواصل وطباعة كشوف المجموعات',
        isSystem: true,
        permissions: ['dashboard', 'trainees', 'courses', 'programs', 'groups', 'attendance', 'messages', 'certificates']
      },
      {
        id: 'trainer',
        title: 'المدرب والمحاضر',
        description: 'إدارة مجموعات التدريب ورصد الحضور والغياب ونقاط الطلاب والتحكم بالأجهزة',
        isSystem: true,
        permissions: ['trainees', 'courses', 'groups', 'attendance', 'points', 'exams', 'interactive', 'devices']
      }
    ]
  },
  notifications: [
    {
      id: 'notif-welcome',
      type: 'course_end',
      title: 'مرحباً بك في مركز النجاح V7',
      message: 'تم تجهيز النظام للعمل بكامل الميزات وتخصيص الفرعين (فرع النجاح وفرع بدر).',
      createdAt: new Date().toISOString(),
      read: false
    }
  ],
  traineeScreenshots: [],
  secretFinancialArchives: [],
  deletedDeviceIds: [],
  labSchedules: [
    {
      id: 'sched-1',
      branchId: 'branch-1',
      groupName: 'مجموعة الأساسيات - A1',
      courseName: 'دبلومة الحاسب الآلي الشاملة',
      trainerName: 'محمد رمضان بخيت',
      roomName: 'قاعة المعمل الرئيسية (Hall A)',
      dayOfWeek: 'السبت',
      startTime: '16:00',
      endTime: '17:00',
      isAutoCreated: true
    },
    {
      id: 'sched-2',
      branchId: 'branch-1',
      groupName: 'مجموعة الأساسيات - A1',
      courseName: 'دبلومة الحاسب الآلي الشاملة',
      trainerName: 'محمد رمضان بخيت',
      roomName: 'قاعة المعمل الرئيسية (Hall A)',
      dayOfWeek: 'الثلاثاء',
      startTime: '16:00',
      endTime: '17:00',
      isAutoCreated: true
    }
  ],
  traineeBadges: [],
  traineeEvaluations: [],
  homeworkSubmissions: [],
  googleDriveSync: {
    autoSyncEnabled: true,
    lastSyncTime: new Date().toISOString(),
    syncStatus: 'success'
  },
  studentPosts: []
};

// Store passwords safely in memory/db mapping
const userPasswordMap: Record<string, string> = {
  'user-admin': hashPassword('1234'),
  'user-accountant': hashPassword('1234'),
  'user-reception': hashPassword('1234'),
  'user-trainer': hashPassword('1234'),
  'user-branch-1': hashPassword('1234'),
  'user-branch-2': hashPassword('1234')
};

class DatabaseManager {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(ACTUAL_DATA_DIR)) {
        fs.mkdirSync(ACTUAL_DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[DB] Non-critical ensureDataDir notice:', e);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      let rawData: string | null = null;

      // 1. Try primary database file in runtime data dir
      if (fs.existsSync(DB_FILE)) {
        try {
          const content = fs.readFileSync(DB_FILE, 'utf-8');
          if (content && content.trim().length > 10) {
            rawData = content;
          }
        } catch (e) {
          console.warn('[DB] Error reading primary DB_FILE:', e);
        }
      }

      // 2. Try bundled database file (for Vercel / serverless deployments)
      if (!rawData) {
        for (const p of BUNDLED_DB_PATHS) {
          if (fs.existsSync(p)) {
            try {
              const content = fs.readFileSync(p, 'utf-8');
              if (content && content.trim().length > 10) {
                console.log('[DB] Loading from bundled database file:', p);
                rawData = content;
                break;
              }
            } catch (e) {
              console.warn('[DB] Error reading BUNDLED_DB_PATH:', p, e);
            }
          }
        }
      }

      // 3. Try backup file
      if (!rawData && fs.existsSync(BACKUP_FILE)) {
        try {
          const content = fs.readFileSync(BACKUP_FILE, 'utf-8');
          if (content && content.trim().length > 10) {
            console.log('[DB] Restoring data from BACKUP_FILE');
            rawData = content;
          }
        } catch (e) {
          console.warn('[DB] Error reading BACKUP_FILE:', e);
        }
      }

      // 4. Try latest timestamped backup in backups dir
      if (!rawData && fs.existsSync(BACKUPS_DIR)) {
        try {
          const backupFiles = fs.readdirSync(BACKUPS_DIR)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();
          if (backupFiles.length > 0) {
            const latestBackup = path.join(BACKUPS_DIR, backupFiles[0]);
            console.log('[DB] Restoring data from latest backup file:', latestBackup);
            rawData = fs.readFileSync(latestBackup, 'utf-8');
          }
        } catch (e) {
          console.warn('[DB] Error reading rotating backups:', e);
        }
      }

      if (rawData) {
        const parsed = JSON.parse(rawData);
        
        // Merge users to ensure all default roles exist and have correct emails
        const existingUsers = Array.isArray(parsed.users) ? parsed.users : [];
        for (const defaultUser of initialData.users) {
          const match = existingUsers.find((u: User) => u.username.toLowerCase() === defaultUser.username.toLowerCase());
          if (!match) {
            existingUsers.push(defaultUser);
          } else {
            // Force update system accounts with required credentials
            match.email = defaultUser.email;
            match.fullName = defaultUser.fullName;
          }
        }

        // Merge with defaults in case of missing or empty keys
        return {
          ...initialData,
          ...parsed,
          branches: (parsed.branches && parsed.branches.length > 0) ? parsed.branches : initialData.branches,
          trainees: (parsed.trainees && parsed.trainees.length > 0) ? parsed.trainees : initialData.trainees,
          trainers: (parsed.trainers && parsed.trainers.length > 0) ? parsed.trainers : initialData.trainers,
          courses: (parsed.courses && parsed.courses.length > 0) ? parsed.courses : initialData.courses,
          groups: (parsed.groups && parsed.groups.length > 0) ? parsed.groups : initialData.groups,
          certificateTemplates: (parsed.certificateTemplates && parsed.certificateTemplates.length > 0) ? parsed.certificateTemplates : initialData.certificateTemplates,
          exams: (parsed.exams && parsed.exams.length > 0) ? parsed.exams : initialData.exams,
          questions: (parsed.questions && parsed.questions.length > 0) ? parsed.questions : initialData.questions,
          pointTransactions: (parsed.pointTransactions && parsed.pointTransactions.length > 0) ? parsed.pointTransactions : initialData.pointTransactions,
          certificates: (parsed.certificates && parsed.certificates.length > 0) ? parsed.certificates : initialData.certificates,
          trainerAttestations: parsed.trainerAttestations || [],
          portalMessages: Array.isArray(parsed.portalMessages) ? parsed.portalMessages : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          homeworkSubmissions: Array.isArray(parsed.homeworkSubmissions) ? parsed.homeworkSubmissions : [],
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          schedules: Array.isArray(parsed.schedules) ? parsed.schedules : [],
          session_attendance_records: Array.isArray(parsed.session_attendance_records) ? parsed.session_attendance_records : [],
          users: existingUsers,
          settings: {
            ...initialData.settings,
            ...(parsed.settings || {}),
            email: parsed.settings?.email !== undefined ? parsed.settings.email : 'info@success-center.eg',
            address: parsed.settings?.address !== undefined ? parsed.settings.address : 'جمهورية مصر العربية',
            vodafoneCash: (!parsed.settings?.vodafoneCash || parsed.settings.vodafoneCash === '01012345678') ? '01001500686' : parsed.settings.vodafoneCash,
            instapay: (!parsed.settings?.instapay || parsed.settings.instapay === 'nagah@instapay') ? 'm_bkeet@instapay' : parsed.settings.instapay,
            phone: (!parsed.settings?.phone || parsed.settings.phone === '01012345678') ? '01001500686' : parsed.settings.phone,
            primaryPhone: (!parsed.settings?.primaryPhone || parsed.settings.primaryPhone === '01012345678') ? '01001500686' : parsed.settings.primaryPhone,
            rolePermissions: parsed.settings?.rolePermissions?.length ? parsed.settings.rolePermissions : initialData.settings.rolePermissions
          },
          pointRules: parsed.pointRules?.length ? parsed.pointRules : defaultPointRules
        };
      }
    } catch (err) {
      console.warn('[DB] Error loading database, falling back to initialData:', err);
    }
    
    // Attempt saving initial data to writable storage if possible
    try {
      this.saveDataDirect(initialData);
    } catch {}

    return JSON.parse(JSON.stringify(initialData));
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public startTransaction(): DatabaseSchema {
    // Returns a deep copy of the database to perform isolated operations
    return JSON.parse(JSON.stringify(this.data));
  }

  public commitTransaction(txData: DatabaseSchema) {
    // Commit the changes by replacing the main database with the transaction state
    this.data = txData;
    this.saveDataDirect(this.data);
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public saveImmediate() {
    this.saveDataDirect(this.data);
  }

  private saveDataDirect(data: DatabaseSchema) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    try {
      this.ensureDataDir();
      const jsonStr = JSON.stringify(data, null, 2);
      const tempFile = `${DB_FILE}.tmp`;
      
      // Write atomic temp file then replace main
      fs.writeFileSync(tempFile, jsonStr, 'utf-8');
      fs.renameSync(tempFile, DB_FILE);

      // Save immediate secondary backup
      try {
        const tempBackup = `${BACKUP_FILE}.tmp`;
        fs.writeFileSync(tempBackup, jsonStr, 'utf-8');
        fs.renameSync(tempBackup, BACKUP_FILE);
      } catch (err) {
        console.warn('[DB] Non-critical BACKUP_FILE write notice:', err);
      }

      // Save hourly rotating backup
      try {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 13).replace('T', '_');
        const rotateFile = path.join(BACKUPS_DIR, `backup_${dateStr}.json`);
        fs.writeFileSync(rotateFile, jsonStr, 'utf-8');
      } catch (err) {
        console.warn('[DB] Non-critical rotating backup write notice:', err);
      }
    } catch (err) {
      console.warn('[DB] Note: saveDataDirect could not persist to local disk (stateless/read-only environment):', err);
    }
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 2000);
    }
    this.save();
  }

  public addNotification(notification: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>) {
    const newNotif: SystemNotification = {
      ...notification,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      read: false
    };
    this.data.notifications.unshift(newNotif);
    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }
    this.save();
  }

  public getPrefixForGradeOrCourse(gradeOrCourse?: string): string {
    if (!gradeOrCourse) {
      return this.data.settings.traineeCodePrefix || 'A';
    }
    const clean = String(gradeOrCourse).trim();
    const prefixes = this.data.settings.gradePrefixes || {};
    
    // Exact match in settings
    if (prefixes[clean]) return prefixes[clean];

    // Normalized representation
    const norm = clean.toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\s_\-]/g, '');

    // Check if grade matches keys in settings
    for (const [k, v] of Object.entries(prefixes)) {
      const kNorm = k.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\s_\-]/g, '');
      if (kNorm === norm || (kNorm.length > 2 && norm.includes(kNorm)) || (norm.length > 2 && kNorm.includes(norm))) {
        return v;
      }
    }

    // 1. Secondary Grades (المرحلة الثانوية)
    if (norm.includes('اولثانوي') || norm.includes('1ثانوي') || norm.includes('ثانوي1') || norm.includes('sec1') || norm.includes('s1') || norm.includes('ictsec1')) return 'G';
    if (norm.includes('ثانيثانوي') || norm.includes('تانيثانوي') || norm.includes('2ثانوي') || norm.includes('ثانوي2') || norm.includes('sec2') || norm.includes('s2') || norm.includes('ictsec2')) return 'H';
    if (norm.includes('ثالثثانوي') || norm.includes('تالتثانوي') || norm.includes('3ثانوي') || norm.includes('ثانوي3') || norm.includes('sec3') || norm.includes('s3') || norm.includes('ictsec3')) return 'I';

    // 2. Preparatory Grades (المرحلة الإعدادية)
    if (norm.includes('اولاعدادي') || norm.includes('1اعدادي') || norm.includes('اعدادي1') || norm.includes('ictp1') || norm.includes('p1') || norm.includes('prep1') || norm.includes('ict-p1')) return 'D';
    if (norm.includes('ثانياعدادي') || norm.includes('تانياعدادي') || norm.includes('2اعدادي') || norm.includes('اعدادي2') || norm.includes('ictp2') || norm.includes('p2') || norm.includes('prep2') || norm.includes('ict-p2')) return 'E';
    if (norm.includes('ثالثاعدادي') || norm.includes('تالتاعدادي') || norm.includes('3اعدادي') || norm.includes('اعدادي3') || norm.includes('ictp3') || norm.includes('p3') || norm.includes('prep3') || norm.includes('ict-p3')) return 'F';

    // 3. Primary Grades (المرحلة الابتدائية)
    if (norm.includes('رابع') || norm.includes('رابعه') || norm.includes('4ابتدائي') || norm.includes('ابتدائي4') || norm.includes('ict4') || norm.includes('grade4') || norm.includes('primary4') || norm === '4' || norm === 'صف4') return 'A';
    if (norm.includes('خامس') || norm.includes('خامسه') || norm.includes('5ابتدائي') || norm.includes('ابتدائي5') || norm.includes('ict5') || norm.includes('grade5') || norm.includes('primary5') || norm === '5' || norm === 'صف5') return 'B';
    if (norm.includes('سادس') || norm.includes('سادسه') || norm.includes('ساته') || norm.includes('6ابتدائي') || norm.includes('ابتدائي6') || norm.includes('ict6') || norm.includes('grade6') || norm.includes('primary6') || norm === '6' || norm === 'صف6') return 'C';

    return this.data.settings.traineeCodePrefix || 'A';
  }

  public getNextTraineeCode(prefixOrGrade?: string): string {
    console.log('[DB] getNextTraineeCode: prefixOrGrade=', prefixOrGrade);
    let p = 'A';
    if (prefixOrGrade && prefixOrGrade.length === 1 && /[A-Za-z0-9\u0600-\u06FF]/.test(prefixOrGrade)) {
      p = prefixOrGrade.toUpperCase();
    } else if (prefixOrGrade) {
      p = this.getPrefixForGradeOrCourse(prefixOrGrade);
    } else {
      p = this.data.settings.traineeCodePrefix || 'A';
    }
    console.log('[DB] getNextTraineeCode: p=', p);
    const len = this.data.settings.autoCodeLength || 3;
    
    // Find all numbers with matching prefix
    let maxNum = 0;
    const regex = new RegExp(`^${p}(\\d+)$`, 'i');
    for (const t of this.data.trainees) {
      const match = t.code?.trim().match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    const result = `${p}${String(nextNum).padStart(len, '0')}`;
    console.log('[DB] getNextTraineeCode: result=', result);
    return result;
  }

  public recalculateTraineeRankings() {
    try {
      if (!this.data.trainees || !Array.isArray(this.data.trainees)) return;
      
      // Sort trainees by total points descending, filtering out invalid items
      const validTrainees = this.data.trainees.filter(t => t && t.id);
      const sorted = [...validTrainees].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      
      sorted.forEach((t, index) => {
        const found = this.data.trainees.find(tr => tr && tr.id === t.id);
        if (found) {
          found.ranking = index + 1;
        }
      });
      this.save();
    } catch (err) {
      console.warn('[DB] recalculateTraineeRankings notice:', err);
    }
  }

  public recalculateTrainerFinances(trainerId?: string) {
    try {
      if (!this.data.trainers || !Array.isArray(this.data.trainers)) return;
      const trainersToUpdate = trainerId 
        ? this.data.trainers.filter(t => t && t.id === trainerId)
        : this.data.trainers.filter(t => Boolean(t && t.id));

      const coursesList = Array.isArray(this.data.courses) ? this.data.courses : [];
      const traineesList = Array.isArray(this.data.trainees) ? this.data.trainees : [];
      const paymentsList = Array.isArray(this.data.payments) ? this.data.payments : [];
      const settlementsList = Array.isArray(this.data.trainerSettlements) ? this.data.trainerSettlements : [];

      for (const trainer of trainersToUpdate) {
        if (!trainer || !trainer.id) continue;
        // Find courses taught by trainer
        const trainerCourses = coursesList.filter(c => c && (c.trainerId === trainer.id || (Array.isArray(trainer.courseIds) && trainer.courseIds.includes(c.id))));
        const courseIds = trainerCourses.map(c => c.id);

        // Trainees enrolled in these courses (checking both courseId and courseIds)
        const enrolledTrainees = traineesList.filter(t => {
          if (!t) return false;
          const cIds = Array.isArray(t.courseIds) && t.courseIds.length > 0 ? t.courseIds : (t.courseId ? [t.courseId] : []);
          return cIds.some(cid => courseIds.includes(cid));
        });
        
        let totalEarned = 0;
        for (const trainee of enrolledTrainees) {
          if (!trainee) continue;
          const traineeCourses = Array.isArray(trainee.courseIds) && trainee.courseIds.length > 0 ? trainee.courseIds : (trainee.courseId ? [trainee.courseId] : []);
          const relevantCourseIds = traineeCourses.filter(cid => courseIds.includes(cid));
          
          const traineePayments = paymentsList.filter(p => p && p.traineeId === trainee.id);
          const totalTraineePaid = trainee.paidAmount ?? traineePayments.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
          
          const totalTraineeCoursesCount = traineeCourses.length > 0 ? traineeCourses.length : 1;
          const effectivePaid = (totalTraineePaid * relevantCourseIds.length) / totalTraineeCoursesCount;

          for (const cid of relevantCourseIds) {
            const course = trainerCourses.find(c => c && c.id === cid) || coursesList.find(c => c && c.id === cid);
            const rate = trainer.commissionRate ?? course?.trainerPercentage ?? 50;
            const coursePortionPaid = effectivePaid / (relevantCourseIds.length || 1);
            
            if (trainer.commissionType === 'percentage') {
              totalEarned += (coursePortionPaid * rate) / 100;
            } else {
              totalEarned += rate / (relevantCourseIds.length || 1);
            }
          }
        }

        // Settlements paid to trainer
        const paid = settlementsList
          .filter(s => s && s.trainerId === trainer.id)
          .reduce((sum, s) => sum + (Number(s?.amount) || 0), 0);

        trainer.totalEarned = Math.round(totalEarned * 100) / 100;
        trainer.totalPaid = Math.round(paid * 100) / 100;
        trainer.balanceDue = Math.max(0, Math.round((totalEarned - paid) * 100) / 100);
      }
      this.save();
    } catch (err) {
      console.warn('[DB] recalculateTrainerFinances notice:', err);
    }
  }

  public getPasswordHash(userId: string): string | undefined {
    return userPasswordMap[userId];
  }

  public setPassword(userId: string, plainText: string) {
    userPasswordMap[userId] = hashPassword(plainText);
  }

  public restore(snapshot: DatabaseSchema) {
    this.data = {
      ...initialData,
      ...snapshot
    };
    this.saveDataDirect(this.data);
    this.recalculateTraineeRankings();
    this.recalculateTrainerFinances();
  }

  public recalculateAll() {
    for (const trainee of this.data.trainees) {
      const traineePayments = this.data.payments.filter(p => p.traineeId === trainee.id);
      const totalPaid = traineePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      trainee.paidAmount = totalPaid;
      trainee.netAmount = Math.max(0, (trainee.feeAmount || 0) - (trainee.discountAmount || 0));
      trainee.remainingAmount = Math.max(0, trainee.netAmount - trainee.paidAmount);
      if (!trainee.courseIds) {
        trainee.courseIds = trainee.courseId ? [trainee.courseId] : [];
      } else if (trainee.courseIds.length > 0 && !trainee.courseId) {
        trainee.courseId = trainee.courseIds?.[0];
      }
    }
    this.recalculateTraineeRankings();
    this.recalculateTrainerFinances();
  }

  public resetData(options: {
    trainees?: boolean;
    payments?: boolean;
    expenses?: boolean;
    trainers?: boolean;
    courses?: boolean;
    attendance?: boolean;
    exams?: boolean;
    auditLogs?: boolean;
    screenshotsArchive?: boolean;
    treasuryNet?: boolean;
    fullReset?: boolean;
  }) {
    if (options.fullReset) {
      const currentUsers = this.data.users?.length ? this.data.users : initialData.users;
      const currentBranches = this.data.branches?.length ? this.data.branches : initialData.branches;
      const currentSettings = this.data.settings ? this.data.settings : initialData.settings;
      const currentTemplates = this.data.certificateTemplates?.length ? this.data.certificateTemplates : initialData.certificateTemplates;
      const currentPointRules = this.data.pointRules?.length ? this.data.pointRules : initialData.pointRules;

      this.data = {
        ...JSON.parse(JSON.stringify(initialData)),
        users: currentUsers,
        branches: currentBranches,
        settings: currentSettings,
        certificateTemplates: currentTemplates,
        pointRules: currentPointRules,
        trainees: [],
        trainers: [],
        courses: [],
        programs: [],
        groups: [],
        attendance: [],
        payments: [],
        expenses: [],
        trainerSettlements: [],
        pointTransactions: [],
        exams: [],
        questions: [],
        examResults: [],
        interactiveSessions: [],
        devices: [],
        deviceCommands: [],
        certificates: [],
        traineeScreenshots: [],
        notifications: initialData.notifications || []
      };
    } else {
      if (options.trainees) {
        this.data.trainees = [];
        this.data.pointTransactions = [];
        this.data.attendance = [];
        this.data.examResults = [];
        this.data.certificates = [];
        this.data.traineeScreenshots = [];
      }
      if (options.payments) {
        this.data.payments = [];
      }
      if (options.expenses) {
        this.data.expenses = [];
      }
      if (options.treasuryNet) {
        this.data.payments = [];
        this.data.expenses = [];
        this.data.trainerSettlements = [];
      }
      if (options.trainers) {
        this.data.trainers = [];
        this.data.trainerSettlements = [];
      }
      if (options.courses) {
        this.data.courses = [];
        this.data.programs = [];
        this.data.groups = [];
      }
      if (options.attendance) {
        this.data.attendance = [];
      }
      if (options.exams) {
        this.data.exams = [];
        this.data.questions = [];
        this.data.examResults = [];
      }
      if (options.auditLogs) {
        this.data.auditLogs = [];
      }
      if (options.screenshotsArchive) {
        this.data.traineeScreenshots = [];
      }
    }
    // Synchronously write directly to disk to ensure immediate reset persistence
    this.saveDataDirect(this.data);
    this.recalculateTraineeRankings();
    this.recalculateTrainerFinances();
  }
}

export const db = new DatabaseManager();
