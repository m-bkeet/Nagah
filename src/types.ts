export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  likes: string[];
  commentsCount: number;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

export type UserRole =
  | 'super_admin' // مدير عام
  | 'branch_manager' // مدير فرع
  | 'admin_staff' // موظف إدارة
  | 'accountant' // محاسب
  | 'receptionist' // استقبال
  | 'trainer' // مدرب
  | 'trainee_device' // مستخدم جهاز متدرب
  | (string & {}); // Support dynamic custom roles

export interface RolePermissionConfig {
  id: string; // role key, e.g. 'super_admin', 'branch_manager', 'custom_coordinator'
  title: string; // Display name in Arabic
  description: string;
  isSystem?: boolean; // System protected roles
  permissions: string[]; // List of enabled permission keys
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  branchId?: string; // empty means all branches if super_admin
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  trainerId?: string;
  traineeId?: string;
  permissions?: string[]; // Optional custom user overrides
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  managerName: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface Trainee {
  id: string;
  code: string; // e.g. م001
  prefix?: string;
  fullName: string;
  nationalId?: string;
  birthDate?: string;
  age?: number;
  gender: 'male' | 'female';
  phone: string;
  parentPhone?: string;
  parentName?: string;
  parentEmail?: string;
  parentNationalId?: string;
  parentPhotoUrl?: string;
  address?: string;
  grade?: string;
  track?: string;
  branchId: string;
  courseId?: string;
  courseIds?: string[];
  courseName?: string;
  programId?: string;
  groupId?: string;
  groupName?: string;
  trainerId?: string;
  registrationDate: string;
  createdAt?: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  feeAmount: number;
  billingType?: 'one_time' | 'monthly';
  billingDay?: number; // رسوم الدورة
  discountAmount: number; // الخصم
  netAmount: number; // الصافي
  paidAmount: number; // المدفوع
  remainingAmount: number; // المتبقي
  notes?: string;
  totalPoints: number; // النقاط
  points?: number; // Alias for totalPoints
  ranking?: number; // الترتيب
  photoUrl?: string;
  themeColor?: string;
  isExempt?: boolean;
  exemptReason?: 'management_children' | 'friend_children' | 'scholarship' | 'other';
  siblingIds?: string[];
  siblingNames?: string[];
  portalPassword?: string;
  parentPortalPassword?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
  };
}

export interface CourseMaterial {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'other';
  fileSize?: string;
  uploadedAt: string;
  description?: string;
  educationType?: 'arabic' | 'languages' | 'international' | 'general';
  convertedSlides?: {
    slideNumber: number;
    title: string;
    theoreticalContent: string;
    practicalContent: string;
    practicalAppAlert?: string;
    type?: 'content' | 'question' | 'activity';
  }[];
  interactiveQuestions?: {
    id: string;
    type: 'fill_blank' | 'true_false';
    question: string;
    answer: string;
    options?: string[];
  }[];
  practicalAlerts?: string[];
  lessonPlan?: {
    sessionNumber: number;
    date?: string;
    title: string;
    objectives: string;
    hours: number;
    practicalTask: string;
  }[];
}

export interface CourseAssessment {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  fileType: 'pdf' | 'other';
  type: 'weekly_assessment' | 'paper_exam' | 'other';
  uploadedAt: string;
  description?: string;
  weekOrGrade?: string;
  educationType?: 'arabic' | 'languages' | 'international' | 'general';
  ministryUrl?: string;
  paperExamModel?: 'A' | 'B' | 'unit_review' | 'monthly_exam';
  scheduledReminderDate?: string;
  dailyWallQuestions?: {
    dayNumber: number;
    question: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }[];
}

export interface Trainer {
  id: string;
  code?: string;
  title?: 'DR' | 'ENG' | 'MR' | 'TR' | string;
  prefix?: 'DR' | 'ENG' | 'MR' | 'TR';
  name: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  nationalId?: string;
  qualification?: string;
  branchId: string;
  specialty: string;
  portalPassword?: string;
  courseIds: string[];
  programIds?: string[];
  commissionType: 'percentage' | 'fixed_per_session' | 'fixed_per_hour' | 'per_trainee' | 'per_hour';
  commissionRate: number; // e.g. 40 (%) or 150 (EGP)
  commissionValue?: number; // Alias
  status: 'active' | 'inactive';
  contractDate?: string;
  notes?: string;
  totalEarned?: number;
  totalPaid?: number;
  balanceDue?: number;
  totalEarnings?: number;
  paidAmount?: number;
  remainingDues?: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  category?: string;
  grade?: string;
  level?: string;
  branchId: string;
  trainerId?: string;
  hoursCount: number;
  lecturesCount: number;
  feeAmount: number;
  price?: number;
  billingType?: 'one_time' | 'monthly';
  trainerPercentage?: number;
  trainerSharePercentage?: number;
  centerPercentage?: number;
  centerSharePercentage?: number;
  startDate?: string;
  endDate?: string;
  defaultGroupId?: string;
  maxTrainees?: number;
  maxCapacity?: number;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  description?: string;
  ministryAssessmentUrl?: string;
  educationType?: 'arabic' | 'languages' | 'international' | 'general';
  lessonPlans?: any[];
  materials?: CourseMaterial[];
  assessments?: CourseAssessment[];
}

export interface Program {
  id: string;
  code?: string;
  name: string;
  category?: string;
  targetAudience?: string;
  description: string;
  branchId?: string;
  courseIds: string[];
  totalFee?: number;
  originalPrice?: number;
  discountFee?: number;
  bundlePrice?: number;
  status?: 'active' | 'inactive' | 'upcoming' | 'completed';
  icon?: string;
  outcomes?: string[];
  createdAt?: string;
}

export interface Group {
  id: string;
  name: string;
  code?: string;
  branchId: string;
  courseId: string;
  programId?: string;
  trainerId?: string;
  hallName?: string;
  roomName?: string;
  days?: string[];
  scheduleDays?: string[];
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  whatsappGroupLink?: string;
  notes?: string;
  maxStudents?: number;
  maxCapacity?: number;
  feeAmount?: number;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  grade?: string;
  track?: string;
  materials?: CourseMaterial[];
  assessments?: CourseAssessment[];
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  branchId?: string;
  groupId: string;
  courseId?: string;
  trainerId?: string;
  traineeId: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy?: string;
  createdAt?: string;
}

export type PaymentMethod = 'cash' | 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'visa';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. REC2026001 (no hyphens)
  date: string;
  traineeId: string;
  traineeName?: string;
  traineeCode?: string;
  trainerId?: string;
  trainerName?: string;
  trainerCode?: string;
  courseId?: string;
  courseName?: string;
  branchId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedByUserId: string;
  receivedByUserName?: string;
  notes?: string;
  createdAt: string;
  targetMonth?: string; // e.g. "أغسطس 2026"
  proofImageUrl?: string; // photo/screenshot of receipt uploaded by parent
  status?: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  submittedByParentName?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedByUserName?: string;
}

export interface TrainerAttestation {
  id: string;
  attestationNumber: string; // e.g. TRCERT2026001 (no hyphens)
  trainerId: string;
  trainerName: string;
  trainerCode: string;
  type: 'course_execution' | 'single_day_lecture' | 'workshop';
  title: string;
  courseId?: string;
  courseName?: string;
  groupId?: string;
  groupName?: string;
  executionDate: string;
  hoursCount: number;
  branchName?: string;
  issuedAt: string;
  notes?: string;
  qrCodeUrl?: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'internet'
  | 'maintenance'
  | 'tools'
  | 'marketing'
  | 'salaries'
  | 'transport'
  | 'hospitality'
  | 'trainers'
  | 'other';

export interface Expense {
  id: string;
  documentNumber: string;
  date: string;
  title?: string;
  category: ExpenseCategory;
  branchId: string;
  beneficiary: string;
  amount: number;
  description?: string;
  paymentMethod?: string;
  paidByUserId?: string;
  paidByUserName?: string;
  notes?: string;
  createdAt: string;
}

export interface TrainerSettlement {
  id: string;
  receiptNumber?: string;
  settlementNumber?: string;
  date: string;
  trainerId: string;
  trainerName?: string;
  branchId: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  periodDescription?: string;
  notes?: string;
  paidByUserId?: string;
  paidByUserName?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  createdAt: string;
}

export interface PointRule {
  id: string;
  title: string;
  pointValue: number; // can be positive (+10) or negative (-10)
  ruleType: 'attendance' | 'participation' | 'task' | 'excellence' | 'violation' | 'custom';
  description: string;
  isActive: boolean;
}

export interface PointTransaction {
  id: string;
  traineeId: string;
  groupId?: string;
  branchId?: string;
  points: number;
  reason: string;
  type?: string;
  ruleId?: string;
  addedByUserId?: string;
  addedByUserName?: string;
  createdAt: string;
  date?: string;
}

export interface CodingTestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  points?: number;
  description?: string;
}

export interface QuestionBankItem {
  id: string;
  courseId: string;
  courseName?: string;
  topic?: string;
  gradeLevel?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'coding';
  questionText: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
  timeLimitSeconds?: number;
  codeTemplate?: string;
  programmingLanguage?: 'python' | 'javascript' | 'html_css' | 'cpp' | 'sql';
  testCases?: CodingTestCase[];
  tags?: string[];
  createdAt?: string;
}

export interface ExamPolicyConfig {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  lockdownLabMode?: boolean;
  blockInternet?: boolean;
  disableCopyPaste?: boolean;
  maxViolationsAllowed?: number;
  autoSaveIntervalSeconds?: number;
  allowedApps?: string[];
  instantResults?: boolean;
  issueCertificateOnPass?: boolean;
  certificateTemplateId?: string;
  sendParentNotification?: boolean;
  proctorCode?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  branchId?: string;
  courseId: string;
  courseName?: string;
  groupId?: string;
  groupName?: string;
  trainerId?: string;
  trainerName?: string;
  examDate?: string;
  examType?: 'practical' | 'theoretical' | 'hybrid';
  totalMarks: number;
  passingMarks?: number;
  durationMinutes: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'scheduled';
  instructions?: string;
  policy?: ExamPolicyConfig;
  questionsCount?: number;
  isPublished?: boolean;
  examMode?: 'lab' | 'online' | 'hybrid';
  createdAt?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  timeLimitSeconds?: number;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'coding' | 'fill_blanks' | 'matching' | 'ordering';
  questionText: string;
  imageUrl?: string;
  options?: string[]; // Used for MCQ, Matching (keys), Ordering
  matchingPairs?: Record<string, string>; // For Matching
  correctAnswer: string; // Or JSON for complex types
  marks: number;
  timeLimitSeconds?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  codeTemplate?: string;
  programmingLanguage?: 'python' | 'javascript' | 'html_css' | 'cpp' | 'sql';
  testCases?: CodingTestCase[];
  explanation?: string;
}

export interface ProctorViolationEvent {
  id: string;
  examId: string;
  traineeId: string;
  traineeName?: string;
  timestamp: string;
  type: 'tab_switch' | 'window_blur' | 'copy_paste' | 'disallowed_app' | 'offline_drop';
  detail: string;
  severity: 'low' | 'medium' | 'high';
  resolved?: boolean;
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  examTitle?: string;
  traineeId: string;
  traineeName?: string;
  traineeCode?: string;
  deviceId?: string;
  ipAddress?: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'auto_submitted' | 'disqualified';
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, {
    answerText?: string;
    selectedOptionIndex?: number;
    code?: string;
    testCasesPassed?: number;
    totalTestCases?: number;
    pointsAwarded?: number;
    aiFeedback?: string;
    executionTimeMs?: number;
  }>;
  violations: ProctorViolationEvent[];
  aiAnalysis?: {
    strengths: string[];
    improvements: string[];
    overallFeedback: string;
    recommendedResources?: string[];
  };
  certificateIssued?: boolean;
  certificateId?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  traineeId: string;
  traineeName?: string;
  score: number;
  totalMarks?: number;
  percentage?: number;
  status?: 'passed' | 'failed';
  rating?: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'راسب';
  ranking?: number;
  notes?: string;
  submittedAt?: string;
  submissionId?: string;
}

export interface InteractiveSession {
  id: string;
  title: string;
  platform?: 'Kahoot' | 'Quizizz' | 'Microsoft Forms' | 'Google Forms' | 'Question Bank' | 'Nagah Quiz' | 'Other';
  url?: string;
  gamePin?: string;
  courseId?: string;
  groupId?: string;
  groupName?: string;
  trainerName?: string;
  trainerId?: string;
  branchId?: string;
  sessionDate?: string;
  status?: 'active' | 'completed';
  quizMode?: 'individual' | 'team_vs_team' | 'class_vs_class';
  questions?: Question[];
  nagahQuestions?: ExamQuestion[]; // Integrated Nagah Pro Quiz System
  currentQuestionIndex?: number;
  responses?: Array<any>;
  leaderboard?: Array<{ traineeId: string; traineeName: string; score: number; rank: number }>;
  notes?: string;
}

export interface DeviceTelemetry {
  cpuUsage?: number; // e.g. 18 (%)
  ramUsedMb?: number; // e.g. 6144
  ramTotalMb?: number; // e.g. 16384
  diskUsedGb?: number; // e.g. 120
  diskTotalGb?: number; // e.g. 512
  temperatureC?: number; // e.g. 48
  networkKbps?: number; // e.g. 1250
}

export interface DeviceExamPolicy {
  active: boolean;
  examId?: string;
  examTitle?: string;
  allowedApps?: string[]; // e.g. ['VS Code', 'Chrome (Nagah Exam Portal Only)', 'Python IDLE']
  blockInternet?: boolean;
  restrictNavigation?: boolean;
  lockWorkspace?: boolean;
  startedAt?: string;
}

export interface Device {
  id: string;
  deviceId?: string;
  name: string;
  assignedUser?: string;
  userType?: 'admin' | 'trainer' | 'trainee';
  branchId: string;
  branchName?: string;
  roomName?: string;
  labName?: string;
  ipAddress: string;
  macAddress?: string;
  os?: string; // e.g. 'Windows 11 Pro 23H2 (Build 22631)'
  agentVersion?: string; // e.g. 'v2.4.1'
  lastHeartbeat?: string;
  isOnline?: boolean;
  isLocked?: boolean;
  currentTraineeId?: string;
  currentTraineeCode?: string; // e.g. 'A001'
  currentTraineeName?: string;
  currentCourseName?: string;
  currentGroupName?: string;
  currentSessionTitle?: string;
  currentTrainerName?: string;
  loginTime?: string;
  status: 'active' | 'locked' | 'disabled' | 'offline' | 'busy' | 'available' | 'maintenance' | 'update_required' | 'ONLINE' | 'OFFLINE' | 'BUSY' | 'LOCKED' | 'IN_SESSION' | 'UPDATING' | 'ERROR';
  healthStatus?: 'healthy' | 'warning' | 'critical';
  telemetry?: DeviceTelemetry;
  installedApps?: string[];
  examPolicy?: DeviceExamPolicy;
  enrollmentKey?: string;
  lastScreenshotUrl?: string;
  lastScreenshotTime?: string;
  lastArchivedTime?: string;
  isMonitoring?: boolean;
  isAssisting?: boolean;
  streamingQuality?: 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH' | 'INTERACTIVE';
  lanIp?: string;
  connectionMode?: 'LAN' | 'Cloud';
}

export interface LabAssistanceSession {
  sessionId: string;
  deviceId: string;
  teacherUserId: string;
  teacherName?: string;
  status: 'active' | 'ended' | 'expired';
  startedAt: string;
  expiresAt: string;
  allowMouse: boolean;
  allowKeyboard: boolean;
  lanIp?: string;
  nonce?: string;
}

export interface LabAudioSession {
  sessionId: string;
  teacherUserId: string;
  teacherName?: string;
  targetDeviceIds: string[] | 'all';
  status: 'active' | 'muted' | 'ended';
  startedAt: string;
  audioChunk?: string;
}

export interface TraineeScreenshot {
  id: string;
  deviceId?: string;
  deviceName: string;
  traineeName: string;
  screenshotUrl: string;
  timestamp: string;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  commandType: 'message' | 'lock' | 'unlock' | 'screenshot' | 'restart' | 'shutdown' | 'reboot' | 'open_app' | 'close_app' | 'set_exam_policy' | 'session_cleanup' | 'remote_assist' | 'update_agent';
  payload?: string;
  status: 'pending' | 'delivered' | 'executed' | 'failed' | 'requested' | 'authorized';
  issuedByUserId: string;
  issuedByName?: string;
  createdAt: string;
  issuedAt?: string | number;
  executedAt?: string;
  resultMessage?: string;
}

export interface DeviceAuditEntry {
  id: string;
  timestamp: string;
  operatorId?: string;
  operatorName?: string;
  operatorRole?: string;
  deviceId?: string;
  deviceName?: string;
  branchId?: string;
  commandType?: string;
  action?: string;
  details: string;
  status?: 'success' | 'failed' | 'authorized' | 'rejected';
  ipAddress?: string;
}


export interface VisualTemplateField {
  id: string; // 'traineeName' | 'courseName' | 'issueDate' | 'grade' | 'qrCode' | 'serialNo'
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number;
  color: string;
  fontFamily: string;
  width?: number; // for wrapping or QR code size
  textAlign?: 'left' | 'center' | 'right';
  visible: boolean;
  label?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  theme: 'classic_gold' | 'modern_tech' | 'royal_emerald' | 'diamond_blue' | 'custom_uploaded';
  bgImageUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  titleArabic: string;
  titleEnglish: string;
  subTitleArabic: string;
  bodyTemplate: string;
  sealText?: string;
  managerTitle?: string;
  managerName?: string;
  trainerTitle?: string;
  showQrCode: boolean;
  borderStyle?: 'double' | 'solid' | 'ornate' | 'modern' | 'minimal';
  isDefault?: boolean;
  isCustomVisual?: boolean;
  visualFields?: VisualTemplateField[];
}

export interface Certificate {
  id: string;
  certificateNumber?: string;
  serialNumber?: string;
  traineeId: string;
  traineeName?: string;
  courseId: string;
  courseName?: string;
  branchId: string;
  issueDate: string;
  grade: string;
  durationText?: string;
  qrPayload?: string;
  trainerName?: string;
  managerName?: string;
  templateId?: string;
  templateTheme?: string;
}

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entity?: string;
  entityId?: string;
  branchId?: string;
  deviceIp?: string;
  details?: string;
  timestamp: string;
}

export interface ComputerLab {
  id: string;
  name: string;
  branchId?: string;
  branchName?: string;
  capacity?: number;
  devicesCount?: number;
  status?: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface SystemSettings {
  centerName: string;
  phone: string;
  vodafoneCash?: string;
  instapay?: string;
  email: string;
  address: string;
  currency: string;
  taxNumber?: string;
  allowOnlineRegistration?: boolean;
  pointsPerAttendance?: number;
  pointsPerFullAttendanceBonus?: number;
  traineeCodePrefix?: string;
  autoCodeLength?: number;
  gradePrefixes?: Record<string, string>;
  academicYear?: string;
  rolePermissions?: RolePermissionConfig[];
}

export interface CenterSettings {
  centerName: string;
  centerSubtitle?: string;
  logoUrl?: string;
  stampUrl?: string;
  sealImageUrl?: string;
  sealBlendMode?: string;
  qrCodeVerificationUrl?: string;
  signatureImageUrl?: string;
  managerName?: string;
  licenseNumber?: string;
  defaultCurrency?: string;
  traineeCodePrefix?: string;
  autoCodeLength?: number;
  gradePrefixes?: Record<string, string>;
  academicYear?: string;
  defaultTrainerCommission?: number;
  defaultCenterCommission?: number;
  serverIp?: string;
  primaryPhone?: string;
  phone?: string;
  vodafoneCash?: string;
  instapay?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  pointRules?: PointRule[];
  rolePermissions?: RolePermissionConfig[];
}

export interface PromotionRuleMapping {
  fromCourseId: string;
  fromCourseName: string;
  toCourseId: string; // 'graduate' for finished students or course ID
  toCourseName: string;
  createNewGroups: boolean; // whether to auto-create ICT5 - 1 from ICT4 - 1
  groupNamePattern?: string; // e.g. "ICT5 - {num}"
}

export interface PromotionPreviewItem {
  traineeId: string;
  code: string;
  fullName: string;
  currentCourseId?: string;
  currentCourseName?: string;
  currentGroupId?: string;
  currentGroupName?: string;
  targetCourseId: string;
  targetCourseName: string;
  targetGroupId?: string;
  targetGroupName?: string;
  action: 'promote' | 'graduate' | 'stay';
  selected: boolean;
}

export interface SystemNotification {
  id: string;
  type: 'arrears' | 'absence' | 'trainer_due' | 'device_offline' | 'exam' | 'course_end' | 'parent_message' | 'message' | 'system';
  title: string;
  message: string;
  linkView?: string;
  branchId?: string;
  metadata?: any;
  createdAt: string;
  read: boolean;
}

export interface LabScheduleSlot {
  id: string;
  branchId: string;
  groupId?: string;
  groupName: string;
  courseName: string;
  trainerId?: string;
  trainerName?: string;
  roomName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAutoCreated?: boolean;
}

export interface TraineeBadge {
  id: string;
  traineeId: string;
  badgeTitle: string;
  category: 'educational' | 'behavioral' | 'attendance' | 'hygiene' | 'organizational' | 'psychological' | 'general';
  points: number;
  icon: string;
  awardedAt: string;
  awardedBy: string;
}

export interface TraineeEvaluation {
  id: string;
  traineeId: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodLabel: string;
  score: number;
  behaviorScore: number;
  attendanceScore: number;
  participationScore: number;
  notes: string;
  evaluatorName: string;
  date: string;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'link';
}

export interface AssignmentTestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  description?: string;
  points?: number;
}

export interface AssignmentTask {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName?: string;
  groupId?: string;
  groupName?: string;
  branchId?: string;
  trainerId?: string;
  trainerName?: string;
  totalMarks: number;
  dueDate: string; // ISO String (Date & Time)
  preventLateSubmission: boolean; // Prevent submission after due date
  attachments?: AssignmentAttachment[];
  codeTemplate?: string;
  programmingLanguage?: string;
  testCases?: AssignmentTestCase[];
  createdAt: string;
  submissionsCount?: number;
  gradedCount?: number;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId?: string;
  traineeId: string;
  traineeCode: string;
  traineeName: string;
  groupId?: string;
  groupName?: string;
  courseId?: string;
  courseName?: string;
  taskTitle: string;
  submittedAt: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text' | 'code';
  codeSolution?: string;
  studentNotes?: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  rating: string;
  strengths: string[];
  corrections: string[];
  generalFeedback: string;
  trainerNotes?: string;
  audioFeedbackUrl?: string; // Teacher voice recording/note
  stars?: number;
  pointsAwarded: number;
  isSpeedWinner?: boolean;
  speedBadgeAwarded?: boolean;
  submissionChannel: 'home_student_portal';
  status?: 'pending' | 'reviewed' | 'approved' | 'graded';
  difficultPointsExplained?: string[];
  badgeAwarded?: { title: string; icon: string; category?: string; points?: number } | null;
  studentId?: string;
  studentName?: string;
  title?: string;
  notes?: string;
  trainerFeedback?: string;
  testCaseResults?: { input: string; expected: string; actual: string; passed: boolean }[];
  isLate?: boolean;
}

export interface PortalMessage {
  id: string;
  traineeId: string;
  traineeCode?: string;
  traineeName?: string;
  parentName?: string;
  senderRole: 'admin' | 'trainer' | 'parent' | 'student';
  senderName: string;
  recipientRole: 'admin' | 'trainer' | 'parent' | 'student';
  recipientName?: string;
  message: string;
  messageType?: 'message' | 'greeting' | 'announcement' | 'reply';
  replyToId?: string;
  createdAt: string;
  read?: boolean;
}

export interface SecretFinancialArchive {
  id: string;
  date: string;
  title: string;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netTreasury: number;
    totalTrainerPayouts: number;
    totalTrainerDues: number;
    totalCenterShare: number;
    totalTraineeRemaining: number;
    totalExpectedRevenue: number;
  };
  paymentsCount: number;
  expensesCount: number;
  traineesCount: number;
  attendanceCount: number;
  adminName: string;
  notes?: string;
  rawPayments?: any[];
  rawExpenses?: any[];
}

export interface StudentPost {
  id: string;
  type: 'trainer_announcement' | 'poll' | 'challenge' | 'student_share' | string;
  authorId?: string;
  authorName?: string;
  authorRole?: 'trainer' | 'student' | 'admin' | string;
  authorAvatar?: string;
  traineeId?: string;
  traineeName?: string;
  traineePhotoUrl?: string;
  isTrainerPost?: boolean;
  content: string;
  mediaUrl?: string;
  bgStyle?: string;
  poll?: {
    question?: string;
    options: { id?: string; text: string; votes?: string[] }[];
  };
  pollOptions?: { text: string; votes: number; voters: string[] }[];
  challenge?: {
    title?: string;
    task?: string;
    rewardPoints?: number;
  };
  challengePoints?: number;
  challengeSubmissions?: { studentId: string; studentName: string; answer: string; submittedAt: string; isCorrect?: boolean }[];
  createdAt: string;
  likes?: string[];
  comments?: { id: string; authorId: string; authorName: string; authorRole: string; content: string; createdAt: string }[];
}

// ==========================================
// AI LANGUAGE LAB CORE TYPES & SCHEMAS
// ==========================================

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LanguageSkill =
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'vocabulary'
  | 'grammar'
  | 'pronunciation';

export interface LanguageSkillScores {
  speaking: number; // 0 - 100
  listening: number; // 0 - 100
  reading: number; // 0 - 100
  writing: number; // 0 - 100
  vocabulary: number; // 0 - 100
  grammar: number; // 0 - 100
  pronunciation: number; // 0 - 100
  overall: number; // 0 - 100
}

export interface VocabularyCard {
  id: string;
  word: string;
  phonetic?: string;
  translation: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  definition?: string;
  exampleSentence: string;
  exampleTranslation?: string;
  category: 'general' | 'programming' | 'ai' | 'web' | 'software' | 'database' | 'devops' | 'business';
  cefrLevel: CefrLevel;
  leitnerBox: 1 | 2 | 3 | 4 | 5; // Leitner Box 1 (daily) to 5 (mastered)
  lastReviewedAt?: string;
  nextReviewDate?: string;
  timesCorrect: number;
  timesWrong: number;
  audioUrl?: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'interview' | 'tech_meeting' | 'coding_interview' | 'project_pitch' | 'travel' | 'daily' | 'academic' | 'client_support' | 'custom';
  icon: string;
  targetCefr: CefrLevel;
  systemPersona: string;
  initialMessage: string;
  suggestedPhrases: string[];
  keyVocabulary: string[];
  grammarFocus?: string;
}

export interface LanguageDiagnosticResult {
  completedAt: string;
  determinedLevel: CefrLevel;
  overallScore: number;
  skillScores: LanguageSkillScores;
  strengths: string[];
  weaknesses: string[];
  recommendedPillars: LanguageSkill[];
  personalizedSummary: string;
}

export interface LanguageUserProfile {
  studentId: string;
  studentName: string;
  studentCode?: string;
  groupId?: string;
  groupName?: string;
  currentLevel: CefrLevel;
  isDiagnosticCompleted: boolean;
  diagnosticHistory: LanguageDiagnosticResult[];
  scores: LanguageSkillScores;
  wordsLearnedCount: number;
  totalPracticeMinutes: number;
  streakDays: number;
  lastPracticeDate?: string;
  xpPoints: number;
  starsCount: number;
  unlockedBadges: string[];
  dailyChallengeCompleted: boolean;
  weeklyChallengeCompleted: boolean;
  flashcards: VocabularyCard[];
  needsImprovementSkills: LanguageSkill[];
  strengthsSkills: LanguageSkill[];
  updatedAt: string;
}

export interface LanguageActivity {
  id: string;
  title: string;
  description: string;
  skill: LanguageSkill;
  targetLevel: CefrLevel;
  durationMinutes: number;
  maxGrade: number;
  deadline?: string;
  instructions: string;
  prompt?: string;
  audioUrl?: string;
  passage?: string;
  questions?: {
    id: string;
    type: 'mcq' | 'dictation' | 'ordering' | 'fill_blank' | 'short_answer';
    questionText: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  }[];
  rubric?: {
    accuracyWeight?: number;
    fluencyWeight?: number;
    vocabularyWeight?: number;
    grammarWeight?: number;
  };
  targetType: 'all' | 'group' | 'individual';
  targetGroupId?: string;
  targetGroupName?: string;
  targetStudentId?: string;
  targetStudentName?: string;
  trainerId: string;
  trainerName: string;
  createdAt: string;
  status: 'active' | 'archived';
  isAiGenerated?: boolean;
}

export interface LanguageActivitySubmission {
  id: string;
  activityId: string;
  activityTitle: string;
  skill: LanguageSkill;
  studentId: string;
  studentName: string;
  studentCode?: string;
  groupId?: string;
  groupName?: string;
  textAnswer?: string;
  audioBase64?: string;
  audioDurationSeconds?: number;
  wpm?: number;
  scores: {
    overall: number;
    accuracy?: number;
    fluency?: number;
    pronunciation?: number;
    grammar?: number;
    vocabulary?: number;
    comprehension?: number;
  };
  aiFeedback?: {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    correctedErrors: { original: string; corrected: string; explanation: string }[];
    improvedVersion?: string;
    pronunciationTips?: string[];
  };
  trainerFeedback?: {
    trainerId: string;
    trainerName: string;
    grade: number;
    textNotes?: string;
    voiceCommentUrl?: string;
    gradedAt: string;
  };
  status: 'submitted' | 'needs_review' | 'graded';
  submittedAt: string;
}

export interface AIModelRouteConfig {
  task: 'text_chat' | 'reasoning' | 'speech_transcription' | 'speech_synthesis' | 'grammar_audit' | 'activity_gen';
  primaryModel: string;
  fallbackModel: string;
  latencyMs?: number;
}

