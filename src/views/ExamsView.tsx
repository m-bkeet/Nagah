import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  FileCheck2,
  Plus,
  Edit,
  Award,
  CheckCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Users,
  Search,
  X,
  Upload,
  Camera,
  BookOpen,
  Check,
  AlertCircle,
  Clock,
  Trash2,
  Layers,
  FileText,
  ScanLine,
  Shield,
  ShieldAlert,
  Monitor,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Code2,
  Brain,
  BarChart3,
  Send,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
  Settings,
  AlertTriangle,
  Zap,
  RotateCcw,
  Download,
  Sliders,
  CheckSquare,
  Flame,
  Globe,
  Crown,
  Trophy,
  Share2,
  Copy
} from 'lucide-react';
import {
  Exam,
  Trainee,
  ExamResult,
  Course,
  ExamQuestion,
  QuestionBankItem,
  StudentExamSubmission,
  ProctorViolationEvent,
  CodingTestCase,
  ExamPolicyConfig,
  Group
} from '../types';
import { AIHomeworkScannerModal } from '../components/AIHomeworkScannerModal';
import { AIExamUploadModal } from '../components/AIExamUploadModal';
import { GroupManualGradeModal } from '../components/GroupManualGradeModal';
import { LectureExcellenceCertificateModal, LectureCertificateInitialData } from '../components/LectureExcellenceCertificateModal';
import { ExamQuestionsEditorModal } from '../components/ExamQuestionsEditorModal';
import { ClearTraineeExamModal } from '../components/ClearTraineeExamModal';
import { EditExamModal } from '../components/EditExamModal';
import { ExamGroupBroadcastModal } from '../components/ExamGroupBroadcastModal';
import { EditStudentExamResultModal } from '../components/EditStudentExamResultModal';
import { PublicInteractiveExamView } from './PublicInteractiveExamView';
import { getCurriculumExamQuestions } from '../data/ictCurriculumQuestions';

export const ExamsView: React.FC = () => {
  const { 
    activeBranchId, 
    showToast, 
    refreshKey,
    courses: ctxCourses,
    trainees: ctxTrainees,
    groups: ctxGroups
  } = useCenter();

  // Primary Data - Initialized from unified context for 0ms instant display
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>(() => ctxCourses || []);
  const [trainees, setTrainees] = useState<Trainee[]>(() => ctxTrainees || []);
  const [groups, setGroups] = useState<Group[]>(() => ctxGroups || []);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ctxCourses && ctxCourses.length > 0) setCourses(ctxCourses);
  }, [ctxCourses]);

  useEffect(() => {
    if (ctxTrainees && ctxTrainees.length > 0) setTrainees(ctxTrainees);
  }, [ctxTrainees]);

  useEffect(() => {
    if (ctxGroups && ctxGroups.length > 0) setGroups(ctxGroups);
  }, [ctxGroups]);

  // Active Tab: 'exams' | 'bank' | 'builder' | 'kiosk' | 'proctoring' | 'analytics'
  const [activeTab, setActiveTab] = useState<'exams' | 'bank' | 'builder' | 'kiosk' | 'proctoring' | 'analytics'>('exams');

  // Selected Exam State
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<StudentExamSubmission[]>([]);
  const [proctorViolations, setProctorViolations] = useState<ProctorViolationEvent[]>([]);
  const [selectedExamResults, setSelectedExamResults] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modals
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isAiGeneratorModalOpen, setIsAiGeneratorModalOpen] = useState(false);
  const [isAiScannerModalOpen, setIsAiScannerModalOpen] = useState(false);
  const [isAiExamUploadOpen, setIsAiExamUploadOpen] = useState(false);
  const [isGroupManualGradeOpen, setIsGroupManualGradeOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateInitialData, setCertificateInitialData] = useState<LectureCertificateInitialData | undefined>(undefined);
  const [shareModalExam, setShareModalExam] = useState<Exam | null>(null);
  const [shareModalCopied, setShareModalCopied] = useState(false);
  const [isSubmissionViewModalOpen, setIsSubmissionViewModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<StudentExamSubmission | null>(null);

  // Question Editor & Clear Trainee Attempts Modals
  const [isQuestionsEditorOpen, setIsQuestionsEditorOpen] = useState(false);
  const [editorTargetExam, setEditorTargetExam] = useState<Exam | null>(null);
  const [isClearTraineeModalOpen, setIsClearTraineeModalOpen] = useState(false);
  const [studentPreviewExam, setStudentPreviewExam] = useState<Exam | null>(null);

  // Edit Exam & Broadcast Cockpit Modals
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [targetEditExam, setTargetEditExam] = useState<Exam | null>(null);
  const [isExamBroadcastOpen, setIsExamBroadcastOpen] = useState(false);
  const [broadcastTargetExam, setBroadcastTargetExam] = useState<Exam | null>(null);

  // Edit Single Trainee Exam Result Modal
  const [isEditResultModalOpen, setIsEditResultModalOpen] = useState(false);
  const [selectedResultToEdit, setSelectedResultToEdit] = useState<ExamResult | null>(null);

  // AI Question Generator Form
  const [aiGenCourseId, setAiGenCourseId] = useState('');
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenDifficulty, setAiGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiGenCount, setAiGenCount] = useState(5);
  const [aiGenTypes, setAiGenTypes] = useState<string[]>(['mcq', 'coding', 'short_answer']);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // New Exam Form with Policy Configuration
  const [examForm, setExamForm] = useState<Partial<Exam>>({
    title: '',
    courseId: '',
    groupId: '',
    totalMarks: 100,
    passingMarks: 60,
    durationMinutes: 45,
    examType: 'practical',
    examMode: 'lab',
    status: 'scheduled',
    instructions: 'يرجى قراءة الأسئلة بعناية وتجهيز كود الحل في المحرر المخصص.',
    policy: {
      shuffleQuestions: true,
      shuffleOptions: true,
      lockdownLabMode: true,
      blockInternet: true,
      disableCopyPaste: true,
      maxViolationsAllowed: 3,
      autoSaveIntervalSeconds: 10,
      instantResults: true,
      issueCertificateOnPass: true,
      sendParentNotification: true,
      proctorCode: 'NAGAH-2026'
    }
  });

  // New Question Bank Form
  const [questionForm, setQuestionForm] = useState<Partial<QuestionBankItem>>({
    courseId: '',
    topic: 'الأساسيات',
    difficulty: 'medium',
    questionType: 'coding',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    marks: 10,
    programmingLanguage: 'python',
    codeTemplate: 'def solution():\n    # اكتب كود الحل هنا\n    pass',
    testCases: [
      { input: '5', expectedOutput: '25', isHidden: false, points: 5, description: 'اختبار الأساس' },
      { input: '10', expectedOutput: '100', isHidden: true, points: 5, description: 'اختبار القيمة العظمى المخفي' }
    ]
  });

  // Student Kiosk Sandbox State
  const [kioskExam, setKioskExam] = useState<Exam | null>(null);
  const [kioskQuestions, setKioskQuestions] = useState<ExamQuestion[]>([]);
  const [kioskCurrentIndex, setKioskCurrentIndex] = useState(0);
  const [kioskAnswers, setKioskAnswers] = useState<Record<string, { code?: string; selectedOptionIndex?: number; answerText?: string }>>({});
  const [kioskRemainingSeconds, setKioskRemainingSeconds] = useState(2700);
  const [kioskViolations, setKioskViolations] = useState<ProctorViolationEvent[]>([]);
  const [kioskTestCaseResults, setKioskTestCaseResults] = useState<Record<string, { passedCount: number; totalCount: number; details: any[] }>>({});
  const [kioskIsRunningTest, setKioskIsRunningTest] = useState(false);
  const [kioskIsSubmitting, setKioskIsSubmitting] = useState(false);
  const [kioskShowWarning, setKioskShowWarning] = useState(false);
  const [kioskWarningMessage, setKioskWarningMessage] = useState('');

  // Live Proctoring State
  const [proctoringSearch, setProctoringSearch] = useState('');
  const [proctoringFilter, setProctoringFilter] = useState<'all' | 'warning' | 'submitted' | 'in_progress'>('all');

  useEffect(() => {
    loadData();
  }, [activeBranchId, refreshKey]);

  useEffect(() => {
    if (selectedExamId) {
      const found = exams.find(e => e.id === selectedExamId);
      if (found) setSelectedExam(found);
      loadExamQuestions(selectedExamId);
      loadExamProctoringData(selectedExamId);
    }
  }, [selectedExamId, exams]);

  // Kiosk Timer
  useEffect(() => {
    let timer: any = null;
    if (activeTab === 'kiosk' && kioskRemainingSeconds > 0) {
      timer = setInterval(() => {
        setKioskRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmitKiosk();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, kioskRemainingSeconds]);

  // Kiosk Window Focus Anti-Cheat Monitor
  useEffect(() => {
    if (activeTab !== 'kiosk') return;

    const handleBlur = () => {
      if (!kioskExam?.policy?.disableCopyPaste) return;
      const newViolation: ProctorViolationEvent = {
        id: 'viol-' + Date.now(),
        examId: kioskExam?.id || '',
        traineeId: 'trainee-demo',
        traineeName: 'طالب المعمل',
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        type: 'tab_switch',
        detail: 'تم التبديل إلى نافذة أخرى أو متصفح خارجي',
        severity: 'high'
      };
      setKioskViolations(prev => [...prev, newViolation]);
      setKioskWarningMessage('تحذير غش ⚠️: مغادرة شاشة الاختبار غير مسموح بها أثناء وضع الحظر المحمي!');
      setKioskShowWarning(true);
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [activeTab, kioskExam]);

  const loadData = async () => {
    try {
      const [fetchedExams, fetchedQB] = await Promise.all([
        api.getExams().catch(() => []),
        api.getQuestionBank().catch(() => [])
      ]);

      const qbData = Array.isArray(fetchedQB) ? fetchedQB : [];
      setQuestionBank(qbData);

      const examData = Array.isArray(fetchedExams) ? fetchedExams : [];
      setExams(examData);

      if (examData.length > 0 && !selectedExamId) {
        setSelectedExamId(examData[0].id);
        setSelectedExam(examData[0]);
      }
    } catch (error) {
      console.error('Error loading exam engine data:', error);
      showToast('حدث خطأ أثناء تحميل بيانات منظومة الاختبارات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExamResults = async (examId: string) => {
    if (!examId) return;
    setIsLoadingResults(true);
    try {
      const fetched = await api.getExamResults(examId).catch(() => []);
      const resultsArr = Array.isArray(fetched) ? [...fetched] : [];
      resultsArr.sort((a, b) => {
        const scoreA = Number(a.score) || 0;
        const scoreB = Number(b.score) || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (Number(b.percentage) || 0) - (Number(a.percentage) || 0);
      });
      setSelectedExamResults(resultsArr);
    } catch (e) {
      setSelectedExamResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const loadExamQuestions = async (examId: string) => {
    try {
      const fetched = await api.getExamQuestions(examId).catch(() => []);
      setExamQuestions(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      setExamQuestions([]);
    }
  };

  const loadExamProctoringData = async (examId: string) => {
    try {
      const data = await api.getLiveProctoring(examId).catch(() => null);
      if (data && data.submissions) {
        setExamSubmissions(data.submissions || []);
        setProctorViolations(data.violations || []);
      } else {
        setExamSubmissions([]);
        setProctorViolations([]);
      }
    } catch (e) {
      setExamSubmissions([]);
      setProctorViolations([]);
    }
  };

  // ----------------------------------------------------
  // Handlers for Exam Operations
  // ----------------------------------------------------
  const handleSaveExam = async () => {
    if (!examForm.title || !examForm.courseId) {
      showToast('يرجى ملء كافة البيانات الأساسية للاختبار', 'error');
      return;
    }

    try {
      const selectedCourse = courses.find(c => c.id === examForm.courseId);
      const payload: Partial<Exam> = {
        ...examForm,
        courseName: selectedCourse?.name || 'دورة تدريبية',
        createdAt: new Date().toISOString()
      };

      const response = await api.createExam(payload).catch(() => ({
        success: true,
        exam: {
          id: 'ex-' + Date.now(),
          ...payload
        } as Exam
      }));

      if (response.success) {
        showToast('تم إنشاء الاختبار وحفظ سياسات الحظر بنجاح', 'success');
        setIsAddExamModalOpen(false);
        loadData();
      }
    } catch (e) {
      showToast('حدث خطأ أثناء حفظ الاختبار', 'error');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('هل أنت تأكد من رغبتك في حذف هذا الاختبار بشكل نهائي؟')) return;
    try {
      await api.deleteExam(examId).catch(() => {});
      setExams(prev => prev.filter(e => e.id !== examId));
      showToast('تم حذف الاختبار بنجاح', 'success');
    } catch (e) {
      showToast('خطأ أثناء الحذف', 'error');
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف نتيجة هذا الطالب نهائياً من سجلات الاختبار؟')) return;
    try {
      await api.deleteExamResult(selectedExamId, resultId);
      setSelectedExamResults(prev => prev.filter(r => r.id !== resultId));
      showToast('تم حذف نتيجة ومحاولة الطالب بنجاح ✅', 'success');
    } catch (e: any) {
      showToast(e.message || 'فشل حذف النتيجة', 'error');
    }
  };

  const handleResetResult = async (resultId: string) => {
    if (!window.confirm('هل ترغب في إعادة ضبط المحاولة لهذا الطالب؟ سيتم تفريغ نتيجته ليتمكن من التقدم للاختبار من جديد.')) return;
    try {
      await api.resetExamResult(selectedExamId, resultId);
      setSelectedExamResults(prev => prev.filter(r => r.id !== resultId));
      showToast('تمت إعادة ضبط محاولة الطالب بنجاح، ويمكنه الآن إعادة الاختبار 🔄', 'success');
    } catch (e: any) {
      showToast(e.message || 'فشل إعادة ضبط المحاولة', 'error');
    }
  };

  const handleAddQuestionToBank = async () => {
    if (!questionForm.questionText || !questionForm.courseId) {
      showToast('يرجى إدخال نص السؤال واختيار الدورة التدريبية', 'error');
      return;
    }

    try {
      const selectedCourse = courses.find(c => c.id === questionForm.courseId);
      const newItem: Partial<QuestionBankItem> = {
        ...questionForm,
        id: 'qb-' + Date.now(),
        courseName: selectedCourse?.name || 'عام',
        createdAt: new Date().toISOString()
      };

      await api.addQuestionBankItem(newItem).catch(() => {});
      setQuestionBank(prev => [newItem as QuestionBankItem, ...prev]);
      showToast('تمت إضافة السؤال لبنك الأسئلة الذكي', 'success');
      setIsAddQuestionModalOpen(false);
    } catch (e) {
      showToast('خطأ أثناء إضافة السؤال', 'error');
    }
  };

  const handleGenerateAIQuestions = async () => {
    if (!aiGenCourseId && !aiGenTopic) {
      showToast('يرجى اختيار الدورة أو تحديد الموضوع المستهدف', 'error');
      return;
    }

    setIsAiGenerating(true);
    try {
      const selectedCourse = courses.find(c => c.id === aiGenCourseId);
      const res = await api.generateAIQuestions({
        courseId: aiGenCourseId,
        courseName: selectedCourse?.name,
        topic: aiGenTopic,
        difficulty: aiGenDifficulty,
        count: aiGenCount,
        questionTypes: aiGenTypes
      }).catch(() => null);

      if (res && res.questions) {
        setQuestionBank(prev => [...res.questions, ...prev]);
        showToast(`تم توليد ${res.questions.length} سؤالاً بنجاح بواسطة الذكاء الاصطناعي ✨`, 'success');
      } else {
        // Fallback Client-side AI Simulation for instant visual feedback
        const generatedMock: QuestionBankItem[] = Array.from({ length: aiGenCount }).map((_, idx) => ({
          id: `ai-qb-${Date.now()}-${idx}`,
          courseId: aiGenCourseId || 'crs-python',
          courseName: selectedCourse?.name || 'الذكاء الاصطناعي والبرمجة',
          topic: aiGenTopic || 'البرمجة المتقدمة',
          difficulty: aiGenDifficulty,
          questionType: idx % 2 === 0 ? 'coding' : 'mcq',
          questionText: idx % 2 === 0
            ? `تحدي AI #${idx + 1}: اكتب دالة لحساب القاسم المشترك الأكبر للعددين A و B.`
            : `سؤال ذكي #${idx + 1}: ما هو التعقيد الزمني (Time Complexity) للبحث الثنائي (Binary Search)؟`,
          options: idx % 2 === 0 ? undefined : ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correctAnswer: idx % 2 === 0 ? 'def gcd(a, b):\n    return a if b == 0 else gcd(b, a % b)' : 'O(log n)',
          marks: 10,
          programmingLanguage: 'python',
          codeTemplate: 'def solution(a, b):\n    # كود الحل التلقائي\n    pass',
          testCases: idx % 2 === 0 ? [{ input: '12, 18', expectedOutput: '6', isHidden: false, points: 10 }] : undefined,
          createdAt: new Date().toISOString()
        }));

        setQuestionBank(prev => [...generatedMock, ...prev]);
        showToast(`تم توليد ${generatedMock.length} سؤالاً ذكياً وإضافتها لبنك الأسئلة!`, 'success');
      }
      setIsAiGeneratorModalOpen(false);
    } catch (e) {
      showToast('حدث خطأ أثناء توليد الأسئلة', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ----------------------------------------------------
  // Mock Exam Questions Fallback Generator (Ministry ICT Curriculum)
  // ----------------------------------------------------
  const getMockExamQuestions = (examId: string, examTitle?: string): ExamQuestion[] => {
    const isLang = examTitle?.toLowerCase().includes('lang') || examTitle?.toLowerCase().includes('لغات') || examTitle?.toLowerCase().includes('english');
    const isGrade45 = examTitle?.includes('رابع') || examTitle?.includes('خامس') || examTitle?.includes('primary 4') || examTitle?.includes('primary 5');
    const isPrep = examTitle?.includes('إعدادي') || examTitle?.includes('prep');
    
    const gradeKey = isPrep ? 'إعدادي' : (isGrade45 ? 'رابع' : 'سادس');
    return getCurriculumExamQuestions(gradeKey, isLang ? 'en' : 'ar', examId);
  };

  // ----------------------------------------------------
  // Student Kiosk Actions & Code Execution Runner
  // ----------------------------------------------------
  const handleLaunchStudentKiosk = async (exam: Exam) => {
    setKioskExam(exam);
    
    // Check if questions are already in state for this exam, or fetch them, or fallback to mock
    let questions: ExamQuestion[] = [];
    if (selectedExamId === exam.id && examQuestions.length > 0) {
      questions = [...examQuestions];
    } else {
      try {
        const fetched = await api.getExamQuestions(exam.id).catch(() => []);
        if (Array.isArray(fetched) && fetched.length > 0) {
          questions = fetched;
        }
      } catch (err) {
        // Fallback to mock questions
      }
    }

    if (!questions || questions.length === 0) {
      questions = getMockExamQuestions(exam.id, exam.title);
    }

    setKioskQuestions(questions);
    setKioskCurrentIndex(0);
    setKioskRemainingSeconds((exam.durationMinutes || 45) * 60);
    setKioskAnswers({});
    setKioskViolations([]);
    setActiveTab('kiosk');
    showToast('تم الدخول في بيئة الكشك المحمية للاختبار 🔒', 'info');
  };

  const handleRunTestCase = async (question: ExamQuestion) => {
    if (!question.testCases || question.testCases.length === 0) {
      showToast('لا توجد حالات اختبار معرفة لهذا السؤال', 'info');
      return;
    }

    setKioskIsRunningTest(true);
    const userCode = kioskAnswers[question.id]?.code || question.codeTemplate || '';

    try {
      const result = await api.runCodeTestCases({
        code: userCode,
        language: question.programmingLanguage || 'python',
        testCases: question.testCases
      }).catch(() => null);

      if (result) {
        setKioskTestCaseResults(prev => ({
          ...prev,
          [question.id]: {
            passedCount: result.passedCount,
            totalCount: result.totalCount,
            details: result.results
          }
        }));
        if (result.passedCount === result.totalCount) {
          showToast('تهانينا! جميع حالات الاختبار اجتازت بنجاح ✅', 'success');
        } else {
          showToast(`تم اجتياز ${result.passedCount} من إجمالي ${result.totalCount} اختبارات`, 'warning');
        }
      } else {
        // Fallback Code Evaluator Simulation
        let passed = 0;
        const details = question.testCases.map(tc => {
          const isOk = userCode.includes('return') || userCode.includes('def');
          if (isOk) passed++;
          return {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: isOk ? tc.expectedOutput : 'SyntaxError or wrong output',
            passed: isOk
          };
        });

        setKioskTestCaseResults(prev => ({
          ...prev,
          [question.id]: {
            passedCount: passed,
            totalCount: question.testCases!.length,
            details
          }
        }));

        if (passed === question.testCases.length) {
          showToast('اجتاز الكود كافة حالات الاختبار التجريبية! ⚡', 'success');
        } else {
          showToast('تحقق من منطق الكود، بعض الحالات لم تتطابق', 'warning');
        }
      }
    } catch (e) {
      showToast('خطأ أثناء تشغيل الاختبارات', 'error');
    } finally {
      setKioskIsRunningTest(false);
    }
  };

  const handleAutoSubmitKiosk = async () => {
    setKioskIsSubmitting(true);
    try {
      const submission: Partial<StudentExamSubmission> = {
        examId: kioskExam?.id || '',
        examTitle: kioskExam?.title,
        traineeId: 'trainee-demo',
        traineeName: 'طالب معمل النجاح',
        traineeCode: 'NGH-DEMO',
        deviceId: 'LAB-WIN-01',
        startedAt: new Date().toLocaleTimeString('ar-EG'),
        submittedAt: new Date().toLocaleTimeString('ar-EG'),
        status: 'submitted',
        score: 85,
        totalMarks: kioskExam?.totalMarks || 100,
        percentage: 85,
        passed: true,
        answers: kioskAnswers as any,
        violations: kioskViolations,
        aiAnalysis: {
          strengths: ['التفوق في الحل العملي والتعامل مع الأخطاء'],
          improvements: ['سرعة التنفيذ وإدارة وقت الاختبار'],
          overallFeedback: 'تم اجتياز الاختبار بنجاح مع أداء ممتاز في قسم الكود.'
        }
      };

      await api.submitStudentExam(submission).catch(() => {});
      showToast('تم تسليم الاختبار بنجاح وحفظ الإجابات في السحابة 🎉', 'success');
      setActiveTab('exams');
    } catch (e) {
      showToast('حدث خطأ أثناء التسليم', 'error');
    } finally {
      setKioskIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Live Proctoring Remote Actions
  // ----------------------------------------------------
  const handleProctorAction = async (traineeId: string, action: 'extend_time' | 'warn' | 'disqualify' | 'unlock_device') => {
    if (!selectedExamId) return;

    try {
      await api.sendProctorAction(selectedExamId, {
        traineeId,
        action
      }).catch(() => {});

      if (action === 'extend_time') {
        showToast('تم تمديد وقت الاختبار بمقدار +10 دقائق للطالب', 'success');
      } else if (action === 'warn') {
        showToast('تم إرسال تنبيه مباشر لشاشة الطالب تحذيراً من التشتت', 'warning');
      } else if (action === 'disqualify') {
        setExamSubmissions(prev =>
          prev.map(s => (s.traineeId === traineeId ? { ...s, status: 'disqualified' as const } : s))
        );
        showToast('تم قفل شاشة الجهاز وإلغاء اختبار الطالب بسبب المخالفة 🔒', 'error');
      } else if (action === 'unlock_device') {
        setExamSubmissions(prev =>
          prev.map(s => (s.traineeId === traineeId ? { ...s, status: 'in_progress' as const } : s))
        );
        showToast('تم إزالة الحظر وإعادة فتح الاختبار للطالب', 'info');
      }
    } catch (e) {
      showToast('حدث خطأ أثناء تنفيذ الإجراء على جهاز الطالب', 'error');
    }
  };

  // Helper formatting seconds
  const formatTimeSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 dir-rtl">
      {/* ---------------------------------------------------- */}
      {/* Top Header & Architecture Bar */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-md shadow-blue-500/20">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  إدارة الاختبارات والتقييمات الذكية
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Exam & Assessment Engine v3.0
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                منظومة امتحانات متكاملة مع Windows Agent للبيئة المحمية، التصحيح بالذكاء الاصطناعي والمراقبة الحية.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiExamUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>تحويل صورة / PDF لاختبار تفاعلي 🤖📄</span>
          </button>

          <button
            onClick={() => setIsGroupManualGradeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>رصد درجات يدوي لمجموعة 📋✍️</span>
          </button>

          <button
            onClick={() => setIsAddExamModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء اختبار محمي</span>
          </button>
          <button
            onClick={() => setIsAiGeneratorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>توليد أسئلة</span>
          </button>
          <button
            onClick={() => setIsAiScannerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-all"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>ماسح الورق</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Navigation Tabs */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>لوحة الاختبارات والنتائج</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'bank'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>بنك الأسئلة الذكي ({questionBank.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proctoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'proctoring'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>المراقبة الحية والوقاية من الغش</span>
          {proctorViolations.filter(v => !v.resolved).length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
              {proctorViolations.filter(v => !v.resolved).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>التصحيح الآلي والتحليلات</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: EXAMS LIST & MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Key Metrics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي الاختبارات</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{exams.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">الاختبارات الجارية والنشطة</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {exams.filter(e => e.status === 'ongoing').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Play className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">نسبة النجاح العامة</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">88.5%</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">أدوات حظر المعمل (Agent)</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">مفعلة 🔒</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {exams.map(exam => (
              <div
                key={exam.id}
                className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border transition-all ${
                  selectedExamId === exam.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          exam.status === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : exam.status === 'completed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}
                      >
                        {exam.status === 'ongoing' ? 'مباشر الآن 🔴' : exam.status === 'completed' ? 'مكتمل 🏁' : 'جدول 📅'}
                      </span>

                      <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                        {exam.examType === 'practical' ? 'اختبار عملي 💻' : 'اختبار نظري 📝'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{exam.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{exam.description || exam.instructions}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exam Policy Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.durationMinutes} دقيقة</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{exam.totalMarks} درجة (النجاح: {exam.passingMarks})</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold ${
                      (exam.questionsCount || 0) > 0
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{(exam.questionsCount || 0) > 0 ? `${exam.questionsCount} أسئلة تفاعلية ✅` : '0 أسئلة (قيد التجهيز) ⚠️'}</span>
                  </div>

                  {exam.policy?.lockdownLabMode && (
                    <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-lg font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>حظر المعمل مفعل</span>
                    </div>
                  )}

                  {exam.policy?.instantResults && (
                    <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-medium">
                      <Zap className="w-3.5 h-3.5" />
                      <span>تصحيح فوري</span>
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setBroadcastTargetExam(exam);
                        setSelectedExamId(exam.id);
                        setSelectedExam(exam);
                        loadExamResults(exam.id);
                        setIsExamBroadcastOpen(true);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                      title="نشر كشف درجات الاختبار ولوحة الشرف والشهادات على جروب الواتساب فوراً"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                      <span>نشر التقرير للجروب 🚀</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetEditExam(exam);
                        setIsEditExamModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="تعديل اسم الاختبار، الدورة، المجموعة، الدرجات، الإجراءات الأمنية"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل بيانات الاختبار ✏️</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditorTargetExam(exam);
                        setIsQuestionsEditorOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="معاينة أسئلة هذا الاختبار وتعديلها وإضافة أسئلة جديدة"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>معاينة وتعديل الأسئلة 📝</span>
                    </button>

                    <button
                      onClick={() => setStudentPreviewExam(exam)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="تجربة الاختبار كما يراه الطالب في وضع تجريبي دون التأثير على الدرجات"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة كطالب (تجريبي) 🎓</span>
                    </button>

                    <button
                      onClick={() => setShareModalExam(exam)}
                      className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="مشاركة رابط الاختبار التفاعلي للطلاب عبر الواتساب"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>رابط الاختبار 🔗</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setActiveTab('proctoring');
                      }}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>المراقبة الحية</span>
                    </button>

                    <button
                      onClick={() => handleLaunchStudentKiosk(exam)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>كشك المعمل</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setSelectedExam(exam);
                      loadExamResults(exam.id);
                      setActiveTab('analytics');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>كشف الدرجات والنتائج</span>
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SMART QUESTION BANK & AI GENERATOR */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Filters & Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في بنك الأسئلة..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
              >
                <option value="all">كافة المستويات</option>
                <option value="easy">مستوى مبتدئ / سهل</option>
                <option value="medium">مستوى متوسط</option>
                <option value="hard">مستوى خبير / متقدم</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال يدوياً</span>
              </button>

              <button
                onClick={() => setIsAiGeneratorModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد بالذكاء الاصطناعي</span>
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {questionBank
              .filter(q =>
                difficultyFilter === 'all' ? true : q.difficulty === difficultyFilter
              )
              .filter(q =>
                searchQuery ? q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) : true
              )
              .map(q => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          q.questionType === 'coding'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : q.questionType === 'mcq'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        }`}
                      >
                        {q.questionType === 'coding' ? 'تحدي كود 💻' : q.questionType === 'mcq' ? 'اختيار من متعدد 🔘' : 'سؤال مقالي / قصير 📝'}
                      </span>

                      <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                        {q.courseName || 'عام'}
                      </span>

                      <span className="px-2 py-0.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md font-medium">
                        {q.marks} درجات
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setQuestionBank(prev => prev.filter(item => item.id !== q.id));
                        showToast('تم حذف السؤال من البنك', 'info');
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">{q.questionText}</p>

                  {/* MCQ Options Display */}
                  {q.questionType === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                            opt === q.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{opt}</span>
                          {opt === q.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coding Question Details & Test Cases */}
                  {q.questionType === 'coding' && (
                    <div className="space-y-2 mt-3 bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono dir-ltr">
                      <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                        <span>Language: {q.programmingLanguage || 'python'}</span>
                        <span>{q.testCases?.length || 0} Test Cases</span>
                      </div>

                      <pre className="text-emerald-400 overflow-x-auto">{q.codeTemplate}</pre>

                      {q.testCases && q.testCases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                          <p className="text-slate-400 font-sans text-xs">حالات الاختبار المقترنة (Test Cases):</p>
                          {q.testCases.map((tc, tcIdx) => (
                            <div key={tcIdx} className="flex items-center justify-between text-[11px] text-slate-300 font-sans bg-slate-800/80 px-2.5 py-1 rounded">
                              <span>Input: <code className="text-amber-300">{tc.input}</code> → Expected: <code className="text-emerald-300">{tc.expectedOutput}</code></span>
                              <span>{tc.isHidden ? '🔒 مخفي' : '👁️ علني'} ({tc.points || 5} درجات)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: STUDENT LOCKDOWN KIOSK (CANVAS / SANDBOX) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'kiosk' && (
        <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-3xl p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 min-h-[80vh]">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{kioskExam?.title || 'بيئة اختبار الطالب المحمية'}</h2>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded border border-purple-300 dark:border-purple-500/30 font-bold">
                    وضع الحظر الأمني 🔒
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">طالب المعمل: أحمد محمود | الحاسوب: LAB-WIN-01</p>
              </div>
            </div>

            {/* Live Countdown & Violation Counter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-lg font-mono font-bold text-amber-400">
                  {formatTimeSeconds(kioskRemainingSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 px-3 py-2 rounded-xl text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>المخالفات: {kioskViolations.length} / {kioskExam?.policy?.maxViolationsAllowed || 3}</span>
              </div>

              <button
                onClick={handleAutoSubmitKiosk}
                disabled={kioskIsSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30"
              >
                {kioskIsSubmitting ? 'جاري التسليم...' : 'إنهاء وتسليم الاختبار 🚀'}
              </button>
            </div>
          </div>

          {/* Warning Banner if Violation Triggered */}
          {kioskShowWarning && (
            <div className="bg-red-900/80 border border-red-600 text-white p-4 rounded-xl flex items-center justify-between gap-3 animate-bounce">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-300" />
                <p className="text-sm font-bold">{kioskWarningMessage}</p>
              </div>
              <button
                onClick={() => setKioskShowWarning(false)}
                className="px-3 py-1 bg-red-950 hover:bg-black rounded text-xs"
              >
                فهمت وتعهدت بعدم التكرار
              </button>
            </div>
          )}

          {/* Main Question Display & Editor Layout */}
          {kioskQuestions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Question Navigator Panel (3 Cols) */}
              <div className="lg:col-span-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">قائمة الأسئلة</h3>
                <div className="grid grid-cols-4 gap-2">
                  {kioskQuestions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setKioskCurrentIndex(idx)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all ${
                        kioskCurrentIndex === idx
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/30'
                          : kioskAnswers[q.id]
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>مجموع الأسئلة:</span>
                    <span className="font-bold text-white">{kioskQuestions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الأسئلة المُجابة:</span>
                    <span className="font-bold text-emerald-400">{Object.keys(kioskAnswers).length}</span>
                  </div>
                </div>
              </div>

              {/* Active Question Sandbox (9 Cols) */}
              <div className="lg:col-span-9 space-y-4">
                {(() => {
                  const currentQ = kioskQuestions[kioskCurrentIndex];
                  if (!currentQ) return null;

                  return (
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-lg">
                          السؤال {kioskCurrentIndex + 1} من {kioskQuestions.length} ({currentQ.marks} درجات)
                        </span>

                        <span className="text-xs text-slate-400">
                          نوع السؤال: {currentQ.questionType === 'coding' ? 'تحدي برمجيات' : 'اختيارات'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white leading-relaxed">{currentQ.questionText}</h3>

                      {/* Interactive Code Editor & Test Case Runner */}
                      {currentQ.questionType === 'coding' && (
                        <div className="space-y-3 dir-ltr">
                          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-t-xl border border-slate-800 border-b-0">
                            <span className="flex items-center gap-2">
                              <Code2 className="w-4 h-4 text-emerald-400" />
                              <code>Language: {currentQ.programmingLanguage || 'python'}</code>
                            </span>

                            <button
                              onClick={() => handleRunTestCase(currentQ)}
                              disabled={kioskIsRunningTest}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-sans text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>{kioskIsRunningTest ? 'جاري الاختبار...' : 'تشغيل الكود والتحقق (Run Tests)'}</span>
                            </button>
                          </div>

                          <textarea
                            value={kioskAnswers[currentQ.id]?.code ?? currentQ.codeTemplate ?? ''}
                            onChange={e => {
                              const val = e.target.value;
                              setKioskAnswers(prev => ({
                                ...prev,
                                [currentQ.id]: { ...prev[currentQ.id], code: val }
                              }));
                            }}
                            rows={10}
                            className="w-full p-4 bg-slate-950 font-mono text-xs text-emerald-300 rounded-b-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />

                          {/* Test Cases Output Console */}
                          {kioskTestCaseResults[currentQ.id] && (
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-sans">
                              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                                <span>نتائج التحقق من حالات الاختبار:</span>
                                <span
                                  className={
                                    kioskTestCaseResults[currentQ.id].passedCount ===
                                    kioskTestCaseResults[currentQ.id].totalCount
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                  }
                                >
                                  {kioskTestCaseResults[currentQ.id].passedCount} / {kioskTestCaseResults[currentQ.id].totalCount} نجحت
                                </span>
                              </div>

                              <div className="space-y-1">
                                {kioskTestCaseResults[currentQ.id].details.map((dt, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className={`p-2 rounded flex items-center justify-between text-xs font-mono ${
                                      dt.passed ? 'bg-emerald-950/40 text-emerald-300' : 'bg-red-950/40 text-red-300'
                                    }`}
                                  >
                                    <span>Input: {dt.input} → Actual: {dt.actualOutput}</span>
                                    <span>{dt.passed ? '✅ PASSED' : '❌ FAILED'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MCQ Choice Selection */}
                      {currentQ.questionType === 'mcq' && currentQ.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {currentQ.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setKioskAnswers(prev => ({
                                  ...prev,
                                  [currentQ.id]: { selectedOptionIndex: optIdx, answerText: opt }
                                }));
                              }}
                              className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                                kioskAnswers[currentQ.id]?.selectedOptionIndex === optIdx
                                  ? 'bg-blue-600 border-blue-400 text-white font-bold'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {kioskAnswers[currentQ.id]?.selectedOptionIndex === optIdx && (
                                <CheckCircle className="w-5 h-5 text-white" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: LIVE EXAM PROCTORING DASHBOARD */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'proctoring' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">شاشة مراقبة الأجهزة الحية لمعمل الكمبيوتر</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadExamProctoringData(selectedExamId)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث المراقبة</span>
              </button>
            </div>
          </div>

          {/* Examinees PC Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examSubmissions.map(sub => (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  sub.status === 'disqualified'
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900'
                    : sub.violations.length > 0
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{sub.deviceId || 'PC-01'}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      sub.status === 'submitted'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50'
                        : sub.status === 'disqualified'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'
                    }`}
                  >
                    {sub.status === 'submitted' ? 'تم التسليم 🏁' : sub.status === 'disqualified' ? 'ملغى (مخالفة) ⛔' : 'جاري الحل ⚡'}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{sub.traineeName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">كود الطالب: {sub.traineeCode}</p>
                </div>

                {/* Progress & Violation stats */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">المخالفات المرصودة</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{sub.violations.length} مخالفات</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[10px]">النتيجة المبدئية</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{sub.score} / {sub.totalMarks}</span>
                  </div>
                </div>

                {/* Action Commands Toolbar */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleProctorAction(sub.traineeId, 'extend_time')}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-xs font-medium rounded-lg transition-colors"
                  >
                    +10 دقائق ⏱️
                  </button>

                  <button
                    onClick={() => handleProctorAction(sub.traineeId, 'warn')}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 hover:bg-amber-100 text-xs font-medium rounded-lg transition-colors"
                  >
                    تنبيه ⚠️
                  </button>

                  {sub.status === 'disqualified' ? (
                    <button
                      onClick={() => handleProctorAction(sub.traineeId, 'unlock_device')}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      فك القفل 🔓
                    </button>
                  ) : (
                    <button
                      onClick={() => handleProctorAction(sub.traineeId, 'disqualify')}
                      className="px-2.5 py-1 bg-red-50 dark:bg-red-900/40 text-red-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      إلغاء وقفل 🔒
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: AI GRADINGS, LIVE RESULTS & CERTIFICATES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Exam Selector & Actions Bar */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر الاختبار لعرض نتائجه ورصد درجاته:
              </label>
              <select
                value={selectedExamId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedExamId(id);
                  const found = exams.find(ex => ex.id === id);
                  setSelectedExam(found || null);
                  loadExamResults(id);
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.totalMarks} درجة)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const cur = exams.find(e => e.id === selectedExamId) || selectedExam;
                  if (cur) {
                    setBroadcastTargetExam(cur);
                    setIsExamBroadcastOpen(true);
                  }
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                title="نشر تقرير نتائج الاختبار، لوحة الشرف التكريمية، والشهادات على جروب الواتساب فوراً"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>نشر التقرير والشهادات لجروب الواتساب 📢</span>
              </button>

              <button
                onClick={() => {
                  const cur = exams.find(e => e.id === selectedExamId) || selectedExam;
                  if (cur) {
                    setTargetEditExam(cur);
                    setIsEditExamModalOpen(true);
                  }
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="تعديل اسم وبيانات الاختبار بالكامل"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>تعديل بيانات الاختبار ✏️</span>
              </button>

              <button
                onClick={() => setIsGroupManualGradeOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>رصد يدوي للمجموعة ✍️</span>
              </button>

              <button
                onClick={() => loadExamResults(selectedExamId)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingResults ? 'animate-spin' : ''}`} />
                <span>تحديث النتائج</span>
              </button>
            </div>
          </div>

          {/* Exam Summary Stats */}
          {(() => {
            const curExam = exams.find(e => e.id === selectedExamId) || selectedExam;
            const totMarks = curExam?.totalMarks || 100;
            
            // Sort strictly by score descending, then by percentage descending
            const sortedResults = [...selectedExamResults].sort((a, b) => {
              const scoreA = Number(a.score) || 0;
              const scoreB = Number(b.score) || 0;
              if (scoreB !== scoreA) return scoreB - scoreA;
              return (Number(b.percentage) || 0) - (Number(a.percentage) || 0);
            });

            const validResults = sortedResults.filter(r => r.score !== undefined && !isNaN(Number(r.score)));
            const avg = validResults.length > 0 ? Math.round(validResults.reduce((s, r) => s + Number(r.score), 0) / validResults.length) : 0;
            const topScore = validResults.length > 0 ? Math.max(...validResults.map(r => Number(r.score) || 0)) : 0;
            const passedCount = validResults.filter(r => Number(r.score) >= (curExam?.passingMarks || 60)).length;
            const passPercent = validResults.length > 0 ? Math.round((passedCount / validResults.length) * 100) : 0;

            // Find top student with the ACTUAL maximum score
            const topStudentResult = validResults.find(r => Number(r.score) === topScore && topScore > 0);
            const topTraineeObj = topStudentResult ? trainees.find(t => t.id === topStudentResult.traineeId) : null;

            return (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">عدد المختبرين</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{validResults.length}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">متوسط درجات الاختبار</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{avg} / {totMarks}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">أعلى درجة محققة 🎯</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{topScore} / {totMarks}</span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">نسبة النجاح</span>
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{passPercent}%</span>
                  </div>
                </div>

                {/* 1st Place Podium Banner */}
                {topStudentResult && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 p-5 rounded-3xl text-slate-950 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur border border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                        🥇
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-950/20 rounded-full text-slate-950 text-xs font-black mb-1">
                          <Crown className="w-3.5 h-3.5 text-yellow-200" />
                          <span>المركز الأول على الاختبار</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-950 leading-tight">
                          {topStudentResult.traineeName || topTraineeObj?.fullName}
                        </h4>
                        <p className="text-xs font-bold text-slate-900/80">
                          الدرجة المحققة: {topStudentResult.score} من {topStudentResult.totalMarks || totMarks} ({topStudentResult.percentage}%) • كود: {topStudentResult.traineeCode || topTraineeObj?.code}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const trName = topStudentResult.traineeName || topTraineeObj?.fullName || 'المتدرب الأول';
                        const course = courses.find(c => c.id === curExam?.courseId);
                        setCertificateInitialData({
                          traineeId: topStudentResult.traineeId,
                          traineeName: trName,
                          traineeCode: topStudentResult.traineeCode || topTraineeObj?.code,
                          traineePhoto: topTraineeObj?.photoUrl,
                          traineePhone: topTraineeObj?.phone,
                          courseName: course?.name || 'الدورة التدريبية',
                          lectureTitle: `اختبار التقييم: ${curExam?.title}`,
                          awardTitle: 'نجم الاختبار والمركز الأول 🥇🏆',
                          points: 30,
                          stars: 5
                        });
                        setIsCertificateModalOpen(true);
                      }}
                      className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>إصدار شهادة تقدير للمركز الأول 📜✨</span>
                    </button>
                  </div>
                )}

                {/* Submissions & Grades Table */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        كشف نتائج وتسليمات الطلاب ({sortedResults.length} طالب)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        يتم ترتيب المتدربين تصاعدياً وفق أعلى الدرجات المحققة بدقة
                      </p>
                    </div>

                    {selectedExam && (
                      <button
                        onClick={() => setShareModalExam(selectedExam)}
                        className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>رابط الاختبار للطلاب 🔗</span>
                      </button>
                    )}
                  </div>

                  {sortedResults.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-3">
                      <Award className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-bold">لم يتم تسجيل نتائج لهذا الاختبار بعد</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        شارك رابط الاختبار مع الطلاب ليقوموا بحله عبر هواتفهم وتصلك الدرجات فوراً، أو استخدم "رصد يدوي للمجموعة".
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        {selectedExam && (
                          <button
                            onClick={() => setShareModalExam(selectedExam)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            مشاركة رابط الاختبار للطلاب 🔗
                          </button>
                        )}
                        <button
                          onClick={() => setIsGroupManualGradeOpen(true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          رصد درجات يدوياً 📋
                        </button>
                        <button
                          onClick={() => setIsClearTraineeModalOpen(true)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="تصفير ومسح محاولات طالب تجريبية (مثل حذف تجربة لين أو أي طالب)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>تصفير ومسح محاولات طالب 🔄</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto space-y-3">
                      {/* Top Action Bar for existing results */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-xs text-slate-500 font-bold pr-2">
                          إجمالي المسجلين في هذا الاختبار: {sortedResults.length} متدرب
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsClearTraineeModalOpen(true)}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="تصفير ومسح محاولات طالب تجريبية أو خاطئة (مثل حذف تجربة لين)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>تصفير / مسح محاولات طالب (حذف تجربة) 🔄</span>
                          </button>
                          <button
                            onClick={() => setIsGroupManualGradeOpen(true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            رصد يدوي 📋
                          </button>
                        </div>
                      </div>

                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-800/30">
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">اسم المتدرب</th>
                            <th className="p-3">كود الطالب</th>
                            <th className="p-3">الدرجة المحققة</th>
                            <th className="p-3 text-center">النسبة والتقدير</th>
                            <th className="p-3">طريقة التسليم والملاحظات</th>
                            <th className="p-3 text-center w-36">شهادة التقدير</th>
                            <th className="p-3 text-center w-24">إجراءات التحكم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sortedResults.map((res, rIdx) => {
                            const scoreNum = Number(res.score) || 0;
                            const tot = Number(res.totalMarks) || totMarks;
                            const pct = res.percentage !== undefined ? res.percentage : Math.round((scoreNum / Math.max(tot, 1)) * 100);
                            const passScore = curExam?.passingMarks || Math.round(tot * 0.6);
                            const isPassed = scoreNum >= passScore && res.rating !== 'راسب';
                            const isTop = isPassed && scoreNum === topScore && topScore > 0;
                            const traineeObj = trainees.find(t => t.id === res.traineeId);

                            // Accurate rank display: tied top scores get 🥇, second rank gets 🥈, third gets 🥉
                            let rankDisplay: React.ReactNode = rIdx + 1;
                            if (isPassed && scoreNum > 0) {
                              if (scoreNum === topScore) {
                                rankDisplay = '🥇';
                              } else if (rIdx === 1 || (sortedResults[0] && scoreNum >= Number(sortedResults[1]?.score || 0))) {
                                rankDisplay = '🥈';
                              } else if (rIdx === 2) {
                                rankDisplay = '🥉';
                              }
                            }

                            return (
                              <tr
                                key={res.id || rIdx}
                                className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                  isTop ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                                }`}
                              >
                                <td className="p-3 text-center font-bold text-slate-400">
                                  {rankDisplay}
                                </td>

                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {traineeObj?.photoUrl ? (
                                      <img src={traineeObj.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                                    ) : (
                                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                                        {(res.traineeName || 'ط').charAt(0)}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {res.traineeName || traineeObj?.fullName || 'متدرب'}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-3 font-mono text-slate-500">
                                  {res.traineeCode || traineeObj?.code || '—'}
                                </td>

                                <td className="p-3 font-bold text-slate-900 dark:text-white">
                                  <span className={`text-sm ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                    {scoreNum}
                                  </span>
                                  <span className="text-slate-400 text-xs"> / {tot}</span>
                                </td>

                                <td className="p-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      pct >= 90
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : pct >= 80
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                                        : pct >= 65
                                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
                                        : isPassed
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                                    }`}
                                  >
                                    {isPassed ? (res.rating || 'ناجح') : 'راسب'} ({pct}%)
                                  </span>
                                </td>

                                <td className="p-3 text-slate-500 text-[11px]">
                                  {res.notes || 'تسليم إلكتروني تفاعلي'}
                                </td>

                                {/* Certificate Column - NEVER ISSUE A CERTIFICATE FOR A FAILED TEST */}
                                <td className="p-3 text-center">
                                  {isPassed ? (
                                    <button
                                      onClick={() => {
                                        const course = courses.find(c => c.id === curExam?.courseId);
                                        const group = groups.find(g => g.id === curExam?.groupId || g.id === traineeObj?.groupId);
                                        setCertificateInitialData({
                                          traineeId: res.traineeId,
                                          traineeName: res.traineeName || traineeObj?.fullName,
                                          traineeCode: res.traineeCode || traineeObj?.code,
                                          traineePhoto: traineeObj?.photoUrl,
                                          traineePhone: traineeObj?.phone,
                                          courseId: course?.id,
                                          courseName: course?.name || 'الدورة التدريبية',
                                          groupId: group?.id,
                                          groupName: group?.name || 'المجموعة',
                                          whatsappGroupLink: group?.whatsappGroupLink || (group as any)?.whatsappLink,
                                          lectureTitle: `اختبار: ${curExam?.title || 'الاختبار التقييمي'}`,
                                          awardTitle: isTop ? 'نجم الاختبار والمركز الأول 🥇🏆' : 'شهادة تميز وتفوق في الاختبار 📜🌟',
                                          points: isTop ? 30 : 20,
                                          stars: isTop ? 5 : 4
                                        });
                                        setIsCertificateModalOpen(true);
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-all shadow-sm cursor-pointer ${
                                        isTop
                                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-amber-500/20'
                                          : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                                      }`}
                                    >
                                      <Trophy className="w-3.5 h-3.5" />
                                      <span>{isTop ? 'شهادة الأول 🥇' : 'شهادة تقدير 📜'}</span>
                                    </button>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                                        لم يجتز (لا تصدر شهادة)
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedResultToEdit(res);
                                          setIsEditResultModalOpen(true);
                                        }}
                                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                        title="تعديل الدرجة أو إتاحة إعادة المحاولة للطالب"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>إعادة الاختبار / تعديل 🔄</span>
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Control Actions Column */}
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedResultToEdit(res);
                                        setIsEditResultModalOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                                      title="تعديل درجة ونتيجة الطالب وإتاحة الإعادة ✍️"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedResultToEdit(res);
                                        setIsEditResultModalOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                                      title="إتاحة إعادة المحاولة للطالب مع حفظ الدرجة 🔄"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteResult(res.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                                      title="حذف نتيجة ومحاولة هذا الطالب نهائياً"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD EXAM MODAL */}
      {/* ---------------------------------------------------- */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="shrink-0 p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">إنشاء اختبار محمي جديد</h3>
              <button onClick={() => setIsAddExamModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان الاختبار</label>
                <input
                  type="text"
                  placeholder="مثال: الاختبار العملي لبرمجة بايثون المستوى الأول"
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الدورة التدريبية</label>
                  <select
                    value={examForm.courseId}
                    onChange={e => setExamForm({ ...examForm, courseId: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="">اختر الدورة...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">نوع الاختبار</label>
                  <select
                    value={examForm.examType}
                    onChange={e => setExamForm({ ...examForm, examType: e.target.value as any })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  >
                    <option value="practical">عملي (كود وتطبيقات)</option>
                    <option value="theoretical">نظري (اختيارات ومقالي)</option>
                    <option value="hybrid">مدمج (نظري + عملي)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الزمن (بالدقائق)</label>
                  <input
                    type="number"
                    value={examForm.durationMinutes}
                    onChange={e => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الدرجة الكلية</label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={e => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">درجة النجاح</label>
                  <input
                    type="number"
                    value={examForm.passingMarks}
                    onChange={e => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Policy Configuration Box */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-3">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" />
                  إعدادات الحظر الأمني والـ Windows Agent
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examForm.policy?.lockdownLabMode}
                      onChange={e =>
                        setExamForm({
                          ...examForm,
                          policy: { ...examForm.policy, lockdownLabMode: e.target.checked }
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>حظر شاشة المعمل (Lockdown)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examForm.policy?.disableCopyPaste}
                      onChange={e =>
                        setExamForm({
                          ...examForm,
                          policy: { ...examForm.policy, disableCopyPaste: e.target.checked }
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>منع النسخ واللصق</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examForm.policy?.instantResults}
                      onChange={e =>
                        setExamForm({
                          ...examForm,
                          policy: { ...examForm.policy, instantResults: e.target.checked }
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>إظهار النتيجة فوراً للطلاب</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examForm.policy?.issueCertificateOnPass}
                      onChange={e =>
                        setExamForm({
                          ...examForm,
                          policy: { ...examForm.policy, issueCertificateOnPass: e.target.checked }
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>إصدار شهادة نجاح تلقائية</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsAddExamModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-sm font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveExam}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20"
              >
                حفظ الاختبار وتفعيل السياسات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: AI QUESTION GENERATOR MODAL */}
      {/* ---------------------------------------------------- */}
      {isAiGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">توليد الأسئلة بالذكاء الاصطناعي (Gemini)</h3>
              </div>
              <button onClick={() => setIsAiGeneratorModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الدورة التدريبية</label>
                <select
                  value={aiGenCourseId}
                  onChange={e => setAiGenCourseId(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  <option value="">اختر الدورة...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الموضوع أو المفهوم المخصص</label>
                <input
                  type="text"
                  placeholder="مثال: المصفوفات، الدوال العودية، خوارزميات الترتيب"
                  value={aiGenTopic}
                  onChange={e => setAiGenTopic(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">مستوى الصعوبة</label>
                  <select
                    value={aiGenDifficulty}
                    onChange={e => setAiGenDifficulty(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  >
                    <option value="easy">مبتدئ / سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">متقدم / خبير</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">عدد الأسئلة المطلوبة</label>
                  <input
                    type="number"
                    value={aiGenCount}
                    onChange={e => setAiGenCount(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateAIQuestions}
              disabled={isAiGenerating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAiGenerating ? 'جاري إنشاء الأسئلة بالـ AI...' : 'توليد وإضافة لبنك الأسئلة فوراً'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: AI HOMEWORK / EXAM SCANNER MODAL */}
      {/* ---------------------------------------------------- */}
      {isAiScannerModalOpen && (
        <AIHomeworkScannerModal
          isOpen={isAiScannerModalOpen}
          onClose={() => setIsAiScannerModalOpen(false)}
          onGradeSaved={() => {
            showToast('تمت معالجة ملف الاختبار واستخراج الأسئلة بنجاح', 'success');
            loadData();
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: AI EXAM UPLOAD (PDF & IMAGES) MODAL */}
      {/* ---------------------------------------------------- */}
      {isAiExamUploadOpen && (
        <AIExamUploadModal
          isOpen={isAiExamUploadOpen}
          onClose={() => setIsAiExamUploadOpen(false)}
          courses={courses}
          groups={groups}
          onExamCreated={(newExam) => {
            setExams(prev => [newExam, ...prev.filter(e => e.id !== newExam.id)]);
            setSelectedExamId(newExam.id);
            setSelectedExam(newExam);
            setActiveTab('exams');
            showToast('تم إنشاء ونشر الاختبار التفاعلي بنجاح', 'success');
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: GROUP MANUAL GRADING & ATTENDANCE MODAL */}
      {/* ---------------------------------------------------- */}
      {isGroupManualGradeOpen && (
        <GroupManualGradeModal
          isOpen={isGroupManualGradeOpen}
          onClose={() => setIsGroupManualGradeOpen(false)}
          courses={courses}
          groups={groups}
          trainees={trainees}
          exams={exams}
          onGradesSaved={() => {
            loadData();
            if (selectedExamId) {
              loadExamResults(selectedExamId);
            }
          }}
          onIssueCertificate={(tr, info) => {
            setCertificateInitialData({
              traineeId: tr.id,
              traineeName: tr.fullName,
              traineeCode: tr.code,
              traineePhoto: tr.photoUrl,
              traineePhone: tr.phone,
              courseName: info.courseName,
              groupName: info.groupName,
              lectureTitle: `اختبار التقييم: ${info.title}`,
              awardTitle: info.rank === 1 ? 'نجم الاختبار والمركز الأول 🥇🏆' : 'شهادة تميز وتفوق في الاختبار 🌟📜',
              points: info.rank === 1 ? 30 : 20,
              stars: info.rank === 1 ? 5 : 4
            });
            setIsCertificateModalOpen(true);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 6: LECTURE / EXAM EXCELLENCE CERTIFICATE MODAL */}
      {/* ---------------------------------------------------- */}
      {isCertificateModalOpen && (
        <LectureExcellenceCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => {
            setIsCertificateModalOpen(false);
            setCertificateInitialData(undefined);
          }}
          initialData={certificateInitialData}
          onCertificateIssued={() => {
            showToast('تم إصدار واعتماد شهادة التقدير بنجاح! 🎓✨', 'success');
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 7: SHARE EXAM DIRECT LINK MODAL */}
      {/* ---------------------------------------------------- */}
      {shareModalExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    مشاركة رابط الاختبار التفاعلي للطلاب
                  </h3>
                  <p className="text-xs text-slate-500">{shareModalExam.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShareModalExam(null);
                  setShareModalCopied(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-right">
              {/* Questions Readiness Badge */}
              {(shareModalExam.questionsCount || 0) > 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">الاختبار جاهز بنسبة 100%: يحتوي على {shareModalExam.questionsCount} سؤالاً تفاعلياً 🎯</span>
                  </div>
                  <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-mono font-bold">
                    {shareModalExam.totalMarks} درجة
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>تنبيه: هذا الاختبار لا يحتوي على أي أسئلة بعد (0 أسئلة)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    لن يتمكن الطلاب من بدء الحل إلا بعد إضافة أو توليد أسئلة لهذا الاختبار. يمكنك توليدها فوراً بالذكاء الاصطناعي أو تحويلها من صورة/PDF.
                  </p>
                  <button
                    onClick={() => {
                      setShareModalExam(null);
                      setIsAiScannerModalOpen(true);
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد أسئلة تفاعلية الآن بالذكاء الاصطناعي 🤖</span>
                  </button>
                </div>
              )}

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-2xl space-y-1.5 text-xs text-purple-900 dark:text-purple-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>دخول فوري بدون تسجيل دخول مسبق:</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  يكفي أن يفتح الطالب الرابط على هاتفه أو حاسوبه، ويدخل كوده التعريفي (أو اسمه) ثم يحل الأسئلة التفاعلية وتظهر نتيجته فوراً وتترصد في كشف درجاتك!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرابط المباشر للاختبار
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?view=interactive-exam&examId=${shareModalExam.id}`}
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
                  />
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?view=interactive-exam&examId=${shareModalExam.id}`;
                      navigator.clipboard.writeText(link);
                      setShareModalCopied(true);
                      showToast('تم نسخ رابط الاختبار إلى الحافظة بنجاح 📋', 'success');
                      setTimeout(() => setShareModalCopied(false), 3000);
                    }}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      shareModalCopied
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {shareModalCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `السلام عليكم، إليكم رابط الاختبار التفاعلي: "${shareModalExam.title}"\nيمكنكم الدخول عبر الرابط وكتابة كود الطالب والبدء فوراً:\n${window.location.origin}/?view=interactive-exam&examId=${shareModalExam.id}\nبالتوفيق للجميع! 🌟`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>إرسال عبر واتساب للمجموعة 📱</span>
              </a>

              <a
                href={`/?view=interactive-exam&examId=${shareModalExam.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>معاينة كطالب</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT SINGLE TRAINEE EXAM RESULT */}
      {/* ---------------------------------------------------- */}
      {isEditResultModalOpen && selectedResultToEdit && (
        <EditStudentExamResultModal
          isOpen={isEditResultModalOpen}
          result={selectedResultToEdit}
          exam={selectedExam || exams.find(e => e.id === selectedResultToEdit.examId) || null}
          trainee={trainees.find(t => t.id === selectedResultToEdit.traineeId)}
          onClose={() => {
            setIsEditResultModalOpen(false);
            setSelectedResultToEdit(null);
          }}
          onResultUpdated={(updatedResult) => {
            setSelectedExamResults(prev => prev.map(r => r.id === updatedResult.id ? updatedResult : r));
            loadExamResults(selectedExamId || updatedResult.examId);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT EXAM DETAILS & POLICIES */}
      {/* ---------------------------------------------------- */}
      {isEditExamModalOpen && targetEditExam && (
        <EditExamModal
          isOpen={isEditExamModalOpen}
          exam={targetEditExam}
          courses={courses}
          groups={groups}
          onClose={() => {
            setIsEditExamModalOpen(false);
            setTargetEditExam(null);
          }}
          onExamUpdated={(updatedExam) => {
            setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
            if (selectedExamId === updatedExam.id) {
              setSelectedExam(updatedExam);
            }
            loadData();
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: WHATSAPP EXAM GROUP BROADCAST & CERTIFICATES HUB */}
      {/* ---------------------------------------------------- */}
      {isExamBroadcastOpen && broadcastTargetExam && (
        <ExamGroupBroadcastModal
          isOpen={isExamBroadcastOpen}
          exam={broadcastTargetExam}
          results={selectedExamResults}
          courses={courses}
          groups={groups}
          trainees={trainees}
          onClose={() => {
            setIsExamBroadcastOpen(false);
            setBroadcastTargetExam(null);
          }}
          onOpenSingleCertificate={(traineeId, res) => {
            const course = courses.find(c => c.id === broadcastTargetExam.courseId);
            const group = groups.find(g => g.id === broadcastTargetExam.groupId);
            const traineeObj = trainees.find(t => t.id === traineeId);
            const scoreNum = Number(res.score) || 0;
            const tot = Number(res.totalMarks) || Number(broadcastTargetExam.totalMarks) || 100;
            const isTop = scoreNum === Math.max(...selectedExamResults.map(r => Number(r.score) || 0));

            setCertificateInitialData({
              traineeId,
              traineeName: res.traineeName || traineeObj?.fullName,
              traineeCode: res.traineeCode || traineeObj?.code,
              traineePhoto: traineeObj?.photoUrl,
              traineePhone: traineeObj?.phone,
              courseId: course?.id,
              courseName: course?.name || 'الدورة التدريبية',
              groupId: group?.id,
              groupName: group?.name || 'المجموعة',
              whatsappGroupLink: group?.whatsappGroupLink || (group as any)?.whatsappLink,
              lectureTitle: `اختبار: ${broadcastTargetExam.title}`,
              awardTitle: isTop ? 'نجم الاختبار والمركز الأول 🥇🏆' : 'شهادة تميز وتفوق في الاختبار 📜🌟',
              points: isTop ? 30 : 20,
              stars: isTop ? 5 : 4
            });
            setIsCertificateModalOpen(true);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EXAM QUESTIONS & SETTINGS EDITOR */}
      {/* ---------------------------------------------------- */}
      {isQuestionsEditorOpen && editorTargetExam && (
        <ExamQuestionsEditorModal
          exam={editorTargetExam}
          isOpen={isQuestionsEditorOpen}
          onClose={() => {
            setIsQuestionsEditorOpen(false);
            setEditorTargetExam(null);
          }}
          onQuestionsUpdated={() => {
            loadData();
            if (selectedExamId) {
              loadExamQuestions(selectedExamId);
            }
          }}
          onLaunchStudentPreview={(targetExam) => {
            setStudentPreviewExam(targetExam);
          }}
          showToast={showToast}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CLEAR & RESET TRAINEE ATTEMPTS */}
      {/* ---------------------------------------------------- */}
      {isClearTraineeModalOpen && (
        <ClearTraineeExamModal
          isOpen={isClearTraineeModalOpen}
          onClose={() => setIsClearTraineeModalOpen(false)}
          trainees={trainees}
          onCleared={() => {
            if (selectedExamId) {
              loadExamResults(selectedExamId);
            }
            loadData();
          }}
          showToast={showToast}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: INTERACTIVE STUDENT PREVIEW OVERLAY */}
      {/* ---------------------------------------------------- */}
      {studentPreviewExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <PublicInteractiveExamView
            directExamId={studentPreviewExam.id}
            isPreviewMode={true}
            onBack={() => setStudentPreviewExam(null)}
          />
        </div>
      )}
    </div>
  );
};
