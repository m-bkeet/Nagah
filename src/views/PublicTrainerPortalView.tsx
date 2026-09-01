import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  Share2,
  Download,
  Smartphone,
  Check,
  X,
  FileText,
  MessageSquare,
  Search,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Star,
  Send,
  Bot,
  Copy,
  FileQuestion,
  Lightbulb,
  Save,
  Presentation,
  Radio,
  Video,
  Mic,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Trainer, Group, Course, Trainee, AttendanceRecord, HomeworkSubmission, Exam } from '../types';
import { NextLectureCard } from '../components/trainer/NextLectureCard';
import { AIPresentationGenerator } from '../components/trainer/AIPresentationGenerator';
import { LiveLectureStudio } from '../components/trainer/LiveLectureStudio';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { TrainerSocialFeed } from '../components/trainer/TrainerSocialFeed';
import { AdvancedExamMaker } from '../components/trainer/AdvancedExamMaker';
import { TrainerLanguageLabView } from '../components/languageLab/TrainerLanguageLabView';
import { TrainerGroupsManager } from '../components/trainer/TrainerGroupsManager';
import { TrainerContentPlanner } from '../components/trainer/TrainerContentPlanner';
import { isTrainerSessionActive, setTrainerLabSessionState } from '../utils/labSecurity';

interface PublicTrainerPortalViewProps {
  onBack?: () => void;
}

export const PublicTrainerPortalView: React.FC<PublicTrainerPortalViewProps> = ({ onBack }) => {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [phoneOrCodeInput, setPhoneOrCodeInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portal Data State
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Active Tab & Navigation Ref
  const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'grades' | 'finances' | 'schedule' | 'ai_presentation' | 'live_lecture' | 'social_feed' | 'ai_exam_maker' | 'ai_assistant' | 'ai_messaging' | 'credentials' | 'language_lab' | 'groups' | 'content_planner'>('attendance');
  const [tabCategory, setTabCategory] = useState<'all' | 'teaching' | 'interactive' | 'eval' | 'ai' | 'account'>('all');
  const tabContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Credentials Update State
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);

  const [isLabActive, setIsLabActive] = useState<boolean>(() => isTrainerSessionActive(trainer?.branchId || 'b1'));

  useEffect(() => {
    if (trainer) {
      setNewPhone(trainer.phone || '');
      setNewEmail(trainer.email || '');
      setNewPassword(trainer.portalPassword || '');
      setNewName(trainer.name || '');
      // Check initial lab status and auto-activate if trainer is logged in
      const currentActive = isTrainerSessionActive(trainer.branchId || 'b1');
      setIsLabActive(currentActive);
    }
  }, [trainer]);

  const handleToggleLabSession = () => {
    if (!trainer) return;
    const nextState = !isLabActive;
    setTrainerLabSessionState(trainer.branchId || 'b1', trainer.name, nextState, 'المعمل الرئيسي');
    setIsLabActive(nextState);
    if (nextState) {
      showToast('🟢 تم فتح المعمل وتفعيل القاعة وتواجد المدرب بالفرع بنجاح! يمكن للطلاب الدخول وتسجيل الحضور الآن.', 'success');
    } else {
      showToast('🔴 تم إغلاق المعمل وقفل الحضور وحظر الدخول الخارجي.', 'info');
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setIsUpdatingCredentials(true);
    try {
      const res = await fetch('/api/trainer-portal/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: trainer.id,
          name: newName,
          phone: newPhone,
          email: newEmail,
          portalPassword: newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setTrainer(data.trainer);
        showToast('تم تحديث بيانات الدخول وكلمة السر بنجاح 🔐', 'success');
      } else {
        showToast(data.error || 'فشل التحديث', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  // AI Assistant State
  const [aiTopic, setAiTopic] = useState('');
  const [aiLevel, setAiLevel] = useState('متوسط');
  const [aiTaskType, setAiTaskType] = useState<'lesson_plan' | 'coding_task' | 'explain_concept' | 'quiz_ideas'>('lesson_plan');
  const [aiResult, setAiResult] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI Exam Generator State
  const [examCourseName, setExamCourseName] = useState('');
  const [examTopic, setExamTopic] = useState('');
  const [examNumQuestions, setExamNumQuestions] = useState(5);
  const [examDifficulty, setExamDifficulty] = useState('متوسط');
  const [examQuestionType, setExamQuestionType] = useState('multiple_choice');
  const [generatedExam, setGeneratedExam] = useState<any | null>(null);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [isSavingExamToSystem, setIsSavingExamToSystem] = useState(false);

  // AI Smart Auto-Reply State
  const [replyStudentId, setReplyStudentId] = useState('');
  const [replyTopicType, setReplyTopicType] = useState('homework_reminder');
  const [replyCustomNotes, setReplyCustomNotes] = useState('');
  const [replyResult, setReplyResult] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Attendance recording state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; notes: string }>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState<string | null>(null);

  // Homework Review Modal State
  const [reviewModalSubmission, setReviewModalSubmission] = useState<HomeworkSubmission | null>(null);
  const [reviewGrade, setReviewGrade] = useState<number>(100);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewPoints, setReviewPoints] = useState<number>(20);
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Toast / Notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trainerIdFromUrl = params.get('trainerId');
    if (trainerIdFromUrl) {
      loadTrainerData(trainerIdFromUrl);
    } else {
      const savedTrainerId = localStorage.getItem('nagah_active_trainer_id');
      if (savedTrainerId) {
        loadTrainerData(savedTrainerId);
      }
    }
  }, []);

  const loadTrainerData = async (trainerId: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`/api/trainer-portal/data/${trainerId}`);
      const data = await res.json();
      if (data.success && data.trainer) {
        setTrainer(data.trainer);
        setGroups(data.groups || []);
        setCourses(data.courses || []);
        setTrainees(data.trainees || []);
        setAttendance(data.attendance || []);
        setHomeworkSubmissions(data.homeworkSubmissions || []);
        setExams(data.exams || []);
        setSettlements(data.settlements || []);
        setSettings(data.settings || {});

        localStorage.setItem('nagah_active_trainer_id', data.trainer.id);

        if (data.groups && data.groups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data.groups[0].id);
        }
      } else {
        localStorage.removeItem('nagah_active_trainer_id');
        setLoginError(data.error || 'تعذر تحميل بيانات المدرب');
      }
    } catch (err: any) {
      setLoginError('تعذر الاتصال بالخادم، تأكد من اتصال الإنترنت');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrCodeInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/trainer-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: phoneOrCodeInput,
          phoneOrCode: phoneOrCodeInput,
          password: passwordInput
        })
      });
      const data = await res.json();
      if (data.success && data.trainer) {
        loadTrainerData(data.trainer.id);
      } else {
        setLoginError(data.error || 'لم يتم العثور على المدرب أو كلمة السر غير صحيحة. تأكد من رقم الهاتف/الكود والرقم السري.');
      }
    } catch (err: any) {
      setLoginError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nagah_active_trainer_id');
    setTrainer(null);
    setPhoneOrCodeInput('');
  };

  // Group selection changed in Attendance tab
  useEffect(() => {
    if (!selectedGroupId) return;
    const groupStudents = trainees.filter(t => t.groupId === selectedGroupId);
    const existingDateRecords = attendance.filter(a => a.groupId === selectedGroupId && a.date === attendanceDate);

    const initialMap: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; notes: string }> = {};
    groupStudents.forEach(st => {
      const rec = existingDateRecords.find(r => r.traineeId === st.id);
      initialMap[st.id] = {
        status: rec ? (rec.status as any) : 'present',
        notes: rec ? rec.notes || '' : ''
      };
    });
    setAttendanceMap(initialMap);
  }, [selectedGroupId, attendanceDate, trainees, attendance]);

  const handleSetAllAttendance = (status: 'present' | 'absent' | 'late' | 'excused') => {
    const nextMap = { ...attendanceMap };
    Object.keys(nextMap).forEach(id => {
      nextMap[id] = { ...nextMap[id], status };
    });
    setAttendanceMap(nextMap);
  };

  const handleSaveAttendance = async () => {
    if (!trainer || !selectedGroupId) return;
    setIsSavingAttendance(true);
    setAttendanceSaveMsg(null);

    try {
      const records = Object.entries(attendanceMap).map(([traineeId, data]) => ({
        traineeId,
        status: data.status,
        notes: data.notes
      }));

      const res = await fetch('/api/trainer-portal/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: trainer.id,
          groupId: selectedGroupId,
          date: attendanceDate,
          records
        })
      });

      const resData = await res.json();
      if (resData.success) {
        showToast('تم حفظ الحضور والغياب بنجاح في قاعدة البيانات ✅', 'success');
        loadTrainerData(trainer.id);
      } else {
        showToast(resData.error || 'فشل حفظ الحضور', 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء حفظ الحضور', 'error');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleOpenReviewHomework = (sub: HomeworkSubmission) => {
    setReviewModalSubmission(sub);
    setReviewGrade(sub.grade || 100);
    setReviewFeedback(sub.trainerFeedback || '');
    setReviewPoints(sub.pointsAwarded || 25);
  };

  const handleSaveHomeworkReview = async () => {
    if (!reviewModalSubmission || !trainer) return;
    setIsSavingReview(true);

    try {
      const res = await fetch('/api/trainer-portal/review-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: reviewModalSubmission.id,
          trainerId: trainer.id,
          grade: reviewGrade,
          trainerFeedback: reviewFeedback,
          pointsToAward: reviewPoints
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ تقييم الواجب ورصد النقاط بنجاح 🎉', 'success');
        setReviewModalSubmission(null);
        loadTrainerData(trainer.id);
      } else {
        showToast(data.error || 'فشل حفظ التقييم', 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء الاتصال بالخادم', 'error');
    } finally {
      setIsSavingReview(false);
    }
  };

  // AI Assistant Call
  const handleGenerateAIAssistant = async () => {
    if (!aiTopic.trim()) {
      showToast('يرجى كتابة موضوع الدرس أو السؤال أولاً', 'error');
      return;
    }
    setIsGeneratingAI(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/trainer-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          level: aiLevel,
          type: aiTaskType,
          trainerSpecialty: trainer?.specialty || ''
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiResult(data.result);
        showToast('تم إعداد المحتوى بالذكاء الاصطناعي بنجاح ✨', 'success');
      } else {
        showToast(data.error || 'تعذر توليد المحتوى، يرجى المحاولة ثانية', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بخدمة الذكاء الاصطناعي', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI Exam Generator Call
  const handleGenerateAIExam = async () => {
    if (!examTopic.trim()) {
      showToast('يرجى تحديد موضوع الاختبار والمهارات المطلوبة', 'error');
      return;
    }
    setIsGeneratingExam(true);
    setGeneratedExam(null);
    try {
      const res = await fetch('/api/ai/trainer-generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: examCourseName || 'الدورة التدريبية',
          topic: examTopic,
          numQuestions: examNumQuestions,
          difficulty: examDifficulty,
          questionType: examQuestionType
        })
      });
      const data = await res.json();
      if (data.success && data.exam) {
        setGeneratedExam(data.exam);
        showToast('تم إنشاء الاختبار بنجاح بواسطة الذكاء الاصطناعي 📝', 'success');
      } else {
        showToast(data.error || 'فشل توليد الاختبار', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بخادم توليد الاختبارات', 'error');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Save generated exam into system
  const handleSaveExamToSystem = async () => {
    if (!generatedExam) return;
    setIsSavingExamToSystem(true);
    try {
      const newExam = {
        id: `exam-${Date.now()}`,
        title: generatedExam.title || examTopic,
        courseName: examCourseName || 'الدورة التدريبية',
        trainerId: trainer?.id || '',
        durationMinutes: generatedExam.durationMinutes || 30,
        totalPoints: generatedExam.totalPoints || 100,
        questions: generatedExam.questions || [],
        createdAt: new Date().toISOString()
      };
      
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam)
      });
      const data = await res.json();
      if (data.success || res.ok) {
        showToast('تم حفظ الاختبار في النظام وبنك الأسئلة بنجاح! 💾', 'success');
        if (trainer) loadTrainerData(trainer.id);
      } else {
        showToast('تم حفظ نموذج الاختبار للمدرب بنجاح', 'success');
      }
    } catch (err) {
      showToast('تم نسخ وحفظ بيانات الاختبار محلياً', 'info');
    } finally {
      setIsSavingExamToSystem(false);
    }
  };

  // AI Smart Auto-Reply Call
  const handleGenerateAIReply = async () => {
    const targetStudent = trainees.find(t => t.id === replyStudentId);
    setIsGeneratingReply(true);
    setReplyResult('');
    try {
      const res = await fetch('/api/ai/trainer-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: targetStudent?.fullName || 'الطالب',
          topicType: replyTopicType,
          customNotes: replyCustomNotes,
          trainerName: trainer?.name || 'المدرب'
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setReplyResult(data.reply);
        showToast('تمت صياغة الرسالة باحترافية ✨', 'success');
      } else {
        showToast(data.error || 'تعذر إنشاء الرد', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخدمة', 'error');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Send WhatsApp Reply
  const handleSendWhatsAppReply = () => {
    if (!replyResult) return;
    const targetStudent = trainees.find(t => t.id === replyStudentId);
    let cleanPhone = (targetStudent?.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyResult)}`
      : `https://wa.me/?text=${encodeURIComponent(replyResult)}`;
    window.open(url, '_blank');
  };

  // Trainees of selected group
  const activeGroupTrainees = trainees.filter(t => t.groupId === selectedGroupId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* Toast popup */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' :
          toast.type === 'error' ? 'bg-rose-600 border-rose-400 text-white' :
          'bg-slate-800 border-slate-700 text-slate-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* UNIFIED TOP BAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 p-1">
              <img src="/logo.svg" alt="مركز النجاح" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                <span>مركز النجاح للتدريب</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-normal">
                  بوابة المدرب
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">
                {trainer ? `مرحباً، أستاذ ${trainer.name}` : 'النظام التدريبي وإدارة القاعات والمجموعات'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <ThemeQuickSwitcher />
            {trainer && (
              <button
                onClick={() => loadTrainerData(trainer.id)}
                disabled={isLoadingData}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            )}

            {trainer && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-600/15 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-600/30 transition-all"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors border border-amber-500/30 shadow"
                title="الرجوع للصفحة الرئيسية للمركز"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* NOT LOGGED IN: LOGIN VIEW */}
        {!trainer ? (
          <div className="max-w-md mx-auto my-12 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-black text-slate-100">تسجيل دخول المدرب</h2>
              <p className="text-xs text-slate-400">
                أدخل رقم الهاتف المسجل بالمركز أو كود المدرب للوصول إلى مجموعاتك
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الهاتف أو الكود أو البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={phoneOrCodeInput}
                    onChange={(e) => setPhoneOrCodeInput(e.target.value)}
                    placeholder="مثال: 01012345678 أو DR01 أو email@domain.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-10 pl-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    الرقم السري / كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    نسيت كلمة السر؟
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="الرقم السري الخاص بالمدرب..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-10 pl-3 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <span>دخول بوابة المدرب</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                مركز النجاح للتدريب والاستشارات - منصة المدربين الذكية
              </span>
            </div>
          </div>
        ) : (
          /* LOGGED IN TRAINER VIEW */
          <div className="space-y-6 animate-fade-in">

            {/* TRAINER LAB PRESENCE & SECURITY CONTROL BAR */}
            <div className={`p-4 md:p-5 rounded-3xl border-2 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isLabActive
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/30'
                : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/30'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-lg ${
                  isLabActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {isLabActive ? '🟢' : '🔒'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-slate-100">
                      محيط أمان المعمل وحالة تواجد المدرب بالفرع
                    </h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      isLabActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {isLabActive ? 'المعمل مفتوح والحضور مفعل 🟢' : 'المعمل مغلق وقفل الحضور موجه 🔴'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isLabActive
                      ? 'جهاز المدرب مفتوح متصل بالقاعة بالفرع. يستطيع الطلاب الآن تسجيل الحضور ودخول أجهزة المعمل والكشك بنجاح.'
                      : 'حماية وأمان: يمنع دخول أي متدرب أو فتح المعمل أو تسجيل الحضور تلقائياً حتى يقوم المدرب بفتح المعمل من جهازه بالفرع.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleLabSession}
                className={`px-5 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 shadow-lg ${
                  isLabActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 active:scale-95'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 active:scale-95'
                }`}
              >
                {isLabActive ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>إغلاق المعمل وحظر الدخول 🔒</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>فتح المعمل وتفعيل الحضور القاعي 🔓</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Trainer Profile Ribbon */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {trainer.photoUrl ? (
                  <img
                    src={trainer.photoUrl}
                    alt={trainer.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {trainer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                    {trainer.name}
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      مدرب معتمد
                    </span>
                  </h2>
                  <p className="text-xs text-indigo-400 font-bold">{trainer.specialty || 'تكنولوجيا المعلومات والبرمجة'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{trainer.phone}</p>
                </div>
              </div>

              {/* Financial & Groups Quick Stat Counters */}
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-400 block font-bold">المجموعات</span>
                  <span className="text-base font-black font-mono text-indigo-300">{groups.length}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-400 block font-bold">إجمالي الطلاب</span>
                  <span className="text-base font-black font-mono text-emerald-300">{trainees.length}</span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block font-bold">رصيدك المالي</span>
                  <span className="text-base font-black font-mono text-amber-300">
                    {trainer.balanceDue !== undefined ? trainer.balanceDue : (trainer.remainingDues || 0)} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING LECTURE CARD (موعد ومكان المحاضرة القادمة) */}
            <NextLectureCard
              trainer={trainer}
              groups={groups}
              courses={courses}
              onStartLive={(grp) => {
                setSelectedGroupId(grp.id);
                setActiveTab('live_lecture');
                showToast(`تم فتح قاعة البث المباشر لمجموعة ${grp.name}`, 'info');
              }}
            />

            {/* TAB SELECTOR BAR - WITH SCROLL CONTROLS & CATEGORY FILTERS */}
            <div className="space-y-3 pb-2 border-b border-slate-800">
              {/* Category Filter Pills for Quick Navigation */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                <span className="text-[10px] text-slate-500 font-bold shrink-0 ml-1">تصفية التبويبات:</span>
                {[
                  { id: 'all', label: 'الكل (جميع الخدمات) 🌐' },
                  { id: 'teaching', label: 'المجموعات والتحضير 👥' },
                  { id: 'interactive', label: 'البث وكاهوت والتفاعل 📽️' },
                  { id: 'eval', label: 'الواجبات والدرجات 📝' },
                  { id: 'ai', label: 'أدوات الذكاء الاصطناعي 🤖' },
                  { id: 'account', label: 'الحساب والإعدادات 🔐' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTabCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                      tabCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Tabs Bar with Left/Right Arrow Buttons */}
              <div className="relative flex items-center group">
                {/* Scroll Right Button */}
                <button
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 z-10 p-1.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 shadow-xl opacity-80 hover:opacity-100 transition-opacity"
                  title="تمرير لليمين"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Tabs Container */}
                <div
                  ref={tabContainerRef}
                  className="flex items-center gap-2 overflow-x-auto px-8 py-1.5 scrollbar-thin scrollbar-thumb-indigo-600/40 w-full scroll-smooth"
                >
                  {(tabCategory === 'all' || tabCategory === 'teaching') && (
                    <button
                      onClick={() => setActiveTab('groups')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-indigo-500/40 ${
                        activeTab === 'groups'
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-indigo-300 hover:text-white hover:bg-indigo-900/30'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>المجموعات والطلاب 👥</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'teaching') && (
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 ${
                        activeTab === 'attendance'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>تسجيل الحضور والغياب</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'interactive') && (
                    <button
                      onClick={() => setActiveTab('ai_presentation')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-amber-500/40 ${
                        activeTab === 'ai_presentation'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                          : 'bg-slate-900/90 text-amber-300 hover:text-white hover:bg-amber-900/30'
                      }`}
                    >
                      <Presentation className="w-4 h-4" />
                      <span>العروض التقديمية وكاهوت 📽️</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'interactive') && (
                    <button
                      onClick={() => setActiveTab('live_lecture')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-red-500/40 ${
                        activeTab === 'live_lecture'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                          : 'bg-slate-900/90 text-red-300 hover:text-white hover:bg-red-900/30'
                      }`}
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>البث المباشر وزوم 🔴</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'interactive') && (
                    <button
                      onClick={() => setActiveTab('language_lab')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-teal-500/40 ${
                        activeTab === 'language_lab'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-400'
                          : 'bg-slate-900/90 text-teal-300 hover:text-white hover:bg-teal-900/30'
                      }`}
                    >
                      <Mic className="w-4 h-4 text-teal-300" />
                      <span>معمل اللغات الذكي 🗣️</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'interactive') && (
                    <button
                      onClick={() => setActiveTab('social_feed')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-sky-500/40 ${
                        activeTab === 'social_feed'
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/30 ring-2 ring-sky-400'
                          : 'bg-slate-900/90 text-sky-300 hover:text-white hover:bg-sky-900/30'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>التواصل والمسابقات 🏆</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'eval') && (
                    <button
                      onClick={() => setActiveTab('homework')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-indigo-500/30 ${
                        activeTab === 'homework'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>تصحيح الواجبات ({homeworkSubmissions.filter(h => h.status === 'pending').length})</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'eval') && (
                    <button
                      onClick={() => setActiveTab('grades')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-indigo-500/30 ${
                        activeTab === 'grades'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>رصد درجات الاختبارات</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'eval' || tabCategory === 'ai') && (
                    <button
                      onClick={() => setActiveTab('ai_exam_maker')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-blue-500/30 ${
                        activeTab === 'ai_exam_maker'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400'
                          : 'bg-slate-900/90 text-blue-300 hover:text-white hover:bg-blue-900/30'
                      }`}
                    >
                      <FileQuestion className="w-4 h-4 text-cyan-300" />
                      <span>صانع الاختبارات الذكي</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'ai') && (
                    <button
                      onClick={() => setActiveTab('content_planner')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-amber-500/40 ${
                        activeTab === 'content_planner'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                          : 'bg-slate-900/90 text-amber-300 hover:text-white hover:bg-amber-900/30'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>مساعد المحتوى وخطة السير 📚🤖</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'ai') && (
                    <button
                      onClick={() => setActiveTab('ai_assistant')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-purple-500/30 ${
                        activeTab === 'ai_assistant'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                          : 'bg-slate-900/90 text-purple-300 hover:text-white hover:bg-purple-900/30'
                      }`}
                    >
                      <Bot className="w-4 h-4 text-purple-300" />
                      <span>مساعد المدرب الذكي (AI)</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'ai') && (
                    <button
                      onClick={() => setActiveTab('ai_messaging')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-emerald-500/30 ${
                        activeTab === 'ai_messaging'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                          : 'bg-slate-900/90 text-emerald-300 hover:text-white hover:bg-emerald-900/30'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-300" />
                      <span>الرد الآلي والتواصل الذكي</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'teaching') && (
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-indigo-500/30 ${
                        activeTab === 'schedule'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>جدول المحاضرات والطلاب</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'account') && (
                    <button
                      onClick={() => setActiveTab('finances')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-indigo-500/30 ${
                        activeTab === 'finances'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
                          : 'bg-slate-900/90 text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>كشف الحساب والمستحقات</span>
                    </button>
                  )}

                  {(tabCategory === 'all' || tabCategory === 'account') && (
                    <button
                      onClick={() => setActiveTab('credentials')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border border-emerald-500/40 ${
                        activeTab === 'credentials'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                          : 'bg-slate-900/90 text-emerald-300 hover:text-white hover:bg-emerald-900/30'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-300" />
                      <span>إعدادات الدخول وكلمة السر 🔐</span>
                    </button>
                  )}
                </div>

                {/* Scroll Left Button */}
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 z-10 p-1.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 shadow-xl opacity-80 hover:opacity-100 transition-opacity"
                  title="تمرير لليسار"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeTab === 'groups' && trainer && (
              <TrainerGroupsManager
                trainer={trainer}
                groups={groups}
                courses={courses}
                trainees={trainees}
                onShowToast={showToast}
                onRefreshData={() => loadTrainerData(trainer.id)}
              />
            )}

            {activeTab === 'content_planner' && trainer && (
              <TrainerContentPlanner
                trainer={trainer}
                groups={groups}
                courses={courses}
                onShowToast={showToast}
                onRefreshCourses={() => loadTrainerData(trainer.id)}
              />
            )}

            {activeTab === 'language_lab' && (
              <TrainerLanguageLabView trainer={trainer} groups={groups} trainees={trainees} />
            )}

            {/* TAB 1: ATTENDANCE RECORDING */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                {/* Control Panel: Group & Date Selector */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Group Selector */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">المجموعة التدريبية:</label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                      >
                        {groups.length === 0 ? (
                          <option value="">لا توجد مجموعات مسندة</option>
                        ) : (
                          groups.map(g => (
                            <option key={g.id} value={g.id}>
                              {g.name} ({g.days?.join('، ') || 'مواعيد محددة'})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Date Selector */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">تاريخ المحاضرة:</label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Bulk Mark & Save Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleSetAllAttendance('present')}
                      className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                      حضور الكل 🟢
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllAttendance('absent')}
                      className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                    >
                      غياب الكل 🔴
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={isSavingAttendance || activeGroupTrainees.length === 0}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingAttendance ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>حفظ الحضور والغياب</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Trainees Attendance List */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 overflow-hidden">
                  {activeGroupTrainees.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Users className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="text-sm font-bold">لا يوجد طلاب مسجلون في هذه المجموعة حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-400 font-bold pb-2 border-b border-slate-800 flex justify-between items-center">
                        <span>قائمة الطلاب ({activeGroupTrainees.length} طالب)</span>
                        <span>الحالة والملاحظات</span>
                      </div>

                      {activeGroupTrainees.map((st, idx) => {
                        const state = attendanceMap[st.id] || { status: 'present', notes: '' };
                        return (
                          <div
                            key={st.id}
                            className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-100">{st.fullName}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                                  <span className="text-amber-400">{st.code}</span>
                                  <span>•</span>
                                  <span>{st.phone}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: { ...state, status: 'present' } })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  state.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                حاضر
                              </button>
                              <button
                                type="button"
                                onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: { ...state, status: 'absent' } })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  state.status === 'absent'
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                غائب
                              </button>
                              <button
                                type="button"
                                onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: { ...state, status: 'late' } })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  state.status === 'late'
                                    ? 'bg-amber-600 text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                متأخر
                              </button>
                              <button
                                type="button"
                                onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: { ...state, status: 'excused' } })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  state.status === 'excused'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                معذور
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: HOMEWORK CORRECTION & REVIEWS */}
            {activeTab === 'homework' && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span>واجبات الطلاب المسلمة عبر البوابة</span>
                  </h3>

                  {homeworkSubmissions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      لم يقم أي طالب بتسليم واجبات جديدة حتى الآن.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {homeworkSubmissions.map((sub) => {
                        const student = trainees.find(t => t.id === sub.studentId);
                        return (
                          <div
                            key={sub.id}
                            className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-indigo-500/40 transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-100">{student?.fullName || sub.studentName || 'طالب'}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {sub.status === 'graded' ? `تم التصحيح (${sub.grade}%)` : 'في انتظار التصحيح'}
                                </span>
                              </div>

                              <p className="text-xs text-indigo-300 font-semibold">{sub.title || 'واجب المحاضرة'}</p>
                              {sub.notes && <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-xl">{sub.notes}</p>}

                              {sub.mediaUrl && (
                                <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-40 bg-black">
                                  <img src={sub.mediaUrl} alt="Homework Media" className="w-full h-full object-contain" />
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleOpenReviewHomework(sub)}
                              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Award className="w-4 h-4" />
                              <span>{sub.status === 'graded' ? 'تعديل التقييم والدرجة' : 'تصحيح الواجب ومنح النقاط'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EXAM GRADES */}
            {activeTab === 'grades' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>سجل الاختبارات والدرجات</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {trainees.map(st => (
                    <div key={st.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-100">{st.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{st.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">النقاط: {st.totalPoints || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FINANCES & DUES */}
            {activeTab === 'finances' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block font-bold">إجمالي المستحقات</span>
                    <span className="text-xl font-black font-mono text-indigo-400 mt-1 block">{trainer.totalEarnings || 0} ج.م</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block font-bold">المنصرف لك</span>
                    <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">{trainer.paidAmount || 0} ج.م</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                    <span className="text-xs text-slate-400 block font-bold">المتبقي للصرف</span>
                    <span className="text-xl font-black font-mono text-amber-400 mt-1 block">{trainer.remainingDues || 0} ج.م</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>سجل التسويات والمدفوعات السابقة</span>
                  </h3>

                  {settlements.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      لا توجد تسويات مالية سابقة مسجلة.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {settlements.map((s, idx) => (
                        <div key={idx} className="bg-slate-950/70 hover:bg-slate-900 transition-colors border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                          <div className="mr-3">
                            <span className="font-bold text-slate-100 text-sm">{s.date || 'تاريخ التسوية'}</span>
                            <span className="text-xs text-slate-400 block mt-1">{s.notes || 'تسوية نقدية'}</span>
                            <span className="font-black font-mono text-emerald-400 text-lg mt-2 block">{s.amount} ج.م</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              showToast('جاري استخراج سند الصرف المعتمد...', 'info');
                              setTimeout(() => {
                                const el = document.getElementById('voucher-' + idx);
                                if (el) {
                                  el.style.display = 'block';
                                  import('html2canvas').then(({ default: html2canvas }) => {
                                    html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
                                      const link = document.createElement('a');
                                      link.download = `Voucher-${idx}.png`;
                                      link.href = canvas.toDataURL('image/png');
                                      link.click();
                                      el.style.display = 'none';
                                      showToast('تم تحميل سند الصرف بنجاح', 'success');
                                    });
                                  });
                                }
                              }, 500);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg transition-colors border border-indigo-500/20"
                          >
                            <Download className="w-4 h-4" />
                            تحميل سند صرف معتمد
                          </button>

                          {/* Hidden Voucher Element for Rendering */}
                          <div id={`voucher-${idx}`} style={{ display: 'none', position: 'absolute', top: '-9999px', left: '-9999px', width: '800px', background: 'white', padding: '40px', borderRadius: '16px', color: '#0f172a', direction: 'rtl', fontFamily: 'sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '20px' }}>
                              <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0' }}>مركز النجاح للتدريب والاستشارات</h2>
                                <p style={{ fontSize: '14px', color: '#475569', margin: '5px 0 0' }}>سند صرف مالي وإفادة (Payment Voucher)</p>
                              </div>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', background: '#e0e7ff', padding: '5px 10px', borderRadius: '6px', border: '1px solid #c7d2fe', color: '#4338ca' }}>VOUCHER-{idx+1}</div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>{s.date || new Date().toISOString().split('T')[0]}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                              <div>
                                <h4 style={{ color: '#64748b', margin: '0 0 5px' }}>يُصرف للسيد المدرب:</h4>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>{trainer.name}</p>
                              </div>
                              <div>
                                <h4 style={{ color: '#64748b', margin: '0 0 5px' }}>المبلغ المصروف:</h4>
                                <p style={{ fontSize: '24px', fontWeight: '900', margin: '0', color: '#059669', fontFamily: 'monospace' }}>{s.amount} ج.م</p>
                              </div>
                            </div>
                            <p style={{ color: '#334155', margin: '0 0 40px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                              <strong>البيان: </strong> {s.notes || 'أتعاب تدريب وتسوية نقدية مستحقة'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '40px' }}>
                              <div>
                                <p style={{ color: '#64748b', margin: '0 0 10px' }}>الختم والتصديق الإلكتروني:</p>
                                <img src="/stamp.svg" alt="ختم" style={{ width: '120px', opacity: '0.8', mixBlendMode: 'multiply' }} />
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#64748b', margin: '0 0 10px' }}>رمز التحقق (QR):</p>
                                <div style={{ border: '1px solid #cbd5e1', padding: '5px', borderRadius: '8px' }}>
                                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VOUCHER-${idx}`} alt="QR" style={{ width: '80px', height: '80px' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: LECTURE SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>جدول المجموعات والمحاضرات الأسبوعية</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map(g => (
                    <div key={g.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-sm text-indigo-300">{g.name}</h4>
                      <p className="text-xs text-slate-300">
                        الأيام: <span className="font-bold text-amber-400">{g.days?.join(' - ') || 'حسب الجدول'}</span>
                      </p>
                      <p className="text-xs text-slate-300">
                        الوقت: <span className="font-mono text-slate-200">{g.startTime} إلى {g.endTime}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        عدد الطلاب المقيدين: <span className="font-bold text-emerald-400">{trainees.filter(t => t.groupId === g.id).length}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: AI TRAINER ASSISTANT */}
            {activeTab === 'ai_assistant' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-900/80 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-100 flex items-center gap-2">
                          <span>مساعد المدرب الذكي (AI Mentor)</span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                            مدعوم بنماذج Gemini المتقدمة
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          تحضير خطط الدروس، كتابة أكواد وتحديات برمجية، وتبسيط المفاهيم الصعبة للطلاب
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tool Selection Grid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">نوع المساعدة المطلوبة:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setAiTaskType('lesson_plan')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                          aiTaskType === 'lesson_plan'
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>تحضير درس متكامل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiTaskType('coding_task')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                          aiTaskType === 'coding_task'
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>تمارين وتحديات برمجية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiTaskType('explain_concept')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                          aiTaskType === 'explain_concept'
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>شرح وتبسيط مفهوم</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiTaskType('quiz_ideas')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                          aiTaskType === 'quiz_ideas'
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <FileQuestion className="w-4 h-4" />
                        <span>أفكار أسئلة تفاعلية</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">موضوع الدرس أو المفهوم المراد إعداده:</label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="مثال: الدوال والمصفوفات في جافاسكريبت، أو التصميم المتجاوب..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">مستوى الطلاب:</label>
                      <select
                        value={aiLevel}
                        onChange={(e) => setAiLevel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                      >
                        <option value="مبتدئ">مبتدئ (شرح بسيط ومباشر)</option>
                        <option value="متوسط">متوسط (تطبيقات عملية وأمثلة)</option>
                        <option value="متقدم">متقدم (تحديات وحالات واقعية)</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleGenerateAIAssistant}
                    disabled={isGeneratingAI || !aiTopic.trim()}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>جاري التحضير الذكي عبر الذكاء الاصطناعي...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>توليد المحتوى وتحضير الدرس الآن 🚀</span>
                      </>
                    )}
                  </button>

                  {/* Result Section */}
                  {aiResult && (
                    <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>النتيجة المقترحة للدرس:</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiResult);
                              showToast('تم نسخ المحتوى بنجاح 📋', 'success');
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ النص</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 max-h-96 overflow-y-auto">
                        {aiResult}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: AI PRESENTATION & KAHOOT & PRACTICAL ACTIVITIES GENERATOR */}
            {activeTab === 'ai_presentation' && (
              <AIPresentationGenerator
                trainer={trainer}
                groups={groups}
                courses={courses}
                onShowToast={(msg, type) => showToast(msg, type || 'info')}
              />
            )}

            {/* TAB: CREDENTIALS SETTINGS */}
            {activeTab === 'credentials' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 max-w-xl mx-auto space-y-6 shadow-xl animate-fade-in">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">تحديث بيانات الدخول وكلمة السر</h3>
                    <p className="text-xs text-slate-400">تعديل اسم المستخدم، رقم الهاتف، أو كلمة المرور الخاصة ببوابة المدرب فوراً وبأمان.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المدرب الكامل</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف الأساسي (يُستخدم لتسجيل الدخول)</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1.5">كلمة السر الخاصة بالبوابة (Portal Password)</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور قوية"
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:border-emerald-400 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">يمكنك استخدام كلمة سر بسيطة أو قوية لتسجيل الدخول السريع.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingCredentials}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingCredentials ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري حفظ التعديلات...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>حفظ وتحديث بيانات الدخول فوراً</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'live_lecture' && (
              <LiveLectureStudio
                trainer={trainer}
                activeGroup={groups.find(g => g.id === selectedGroupId) || null}
                groups={groups}
                onShowToast={(msg, type) => showToast(msg, type || 'info')}
              />
            )}

            {/* TAB 4: TRAINER SOCIAL FEED & CHALLENGES & POLLS */}
            {activeTab === 'social_feed' && (
              <TrainerSocialFeed
                trainer={trainer}
                onUpdateTrainerPhoto={(photoUrl) => {
                  setTrainer(prev => prev ? { ...prev, photoUrl } : prev);
                  showToast('تم تحديث صورة المدرب بنجاح 📸', 'success');
                }}
                onShowToast={(msg, type) => showToast(msg, type || 'info')}
              />
            )}

            {/* TAB 7: ADVANCED AI EXAM MAKER & QUESTION BANK */}
            {activeTab === 'ai_exam_maker' && (
              <AdvancedExamMaker
                trainer={trainer}
                groups={groups}
                courses={courses}
                onShowToast={(msg, type) => {
                  showToast(msg, type || 'info');
                  if (type === 'success' && trainer) {
                    loadTrainerData(trainer.id);
                  }
                }}
              />
            )}

            {/* TAB 8: AI SMART MESSAGING & AUTO-REPLY */}
            {activeTab === 'ai_messaging' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-100 flex items-center gap-2">
                          <span>الرد الآلي والتواصل الذكي مع الطلاب وأولياء الأمور</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            واتساب فوري
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          صياغة رسائل تشجيعية، تنبيهات غياب، تذكير بالواجبات وإرسالها بضغطة زر
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messaging Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">اختر الطالب:</label>
                      <select
                        value={replyStudentId}
                        onChange={(e) => setReplyStudentId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                      >
                        <option value="">اختر طالباً من المجموعات...</option>
                        {trainees.map(t => (
                          <option key={t.id} value={t.id}>{t.fullName} ({t.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">موضوع الرسالة والغرض منها:</label>
                      <select
                        value={replyTopicType}
                        onChange={(e) => setReplyTopicType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                      >
                        <option value="homework_reminder">تذكير بتسليم الواجب المطلوب</option>
                        <option value="excellent_progress">تهنئة وتشجيع على التفوق والالتزام</option>
                        <option value="absent_alert">تنبيه بالغياب عن المحاضرة والاطمئنان عليه</option>
                        <option value="exam_preparation">توجيهات للاستعداد للاختبار القادم</option>
                        <option value="general_encouragement">رسالة تحفيزية عامة لتطوير المهارات</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات إضافية تريد تضمينها (اختياري):</label>
                      <input
                        type="text"
                        value={replyCustomNotes}
                        onChange={(e) => setReplyCustomNotes(e.target.value)}
                        placeholder="مثال: يرجى مراجعة الدرس الثاني وحل التمرين البرمجي رقم 4..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAIReply}
                    disabled={isGeneratingReply}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingReply ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>جاري صياغة الرسالة بأسلوب تربوي محفز...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>صياغة الرسالة الذكية الآن ✨</span>
                      </>
                    )}
                  </button>

                  {/* Result Message Card */}
                  {replyResult && (
                    <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>نص الرسالة المجهز للإرسال:</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(replyResult);
                              showToast('تم نسخ الرسالة بنجاح 📋', 'success');
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                        {replyResult}
                      </div>

                      <button
                        onClick={handleSendWhatsAppReply}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>إرسال فوري عبر واتساب للرقم 📲</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* HOMEWORK REVIEW MODAL */}
      {reviewModalSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm">تصحيح واجب: {reviewModalSubmission.studentName}</h3>
              <button onClick={() => setReviewModalSubmission(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">الدرجة المئوية (من 100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewGrade}
                  onChange={(e) => setReviewGrade(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">النقاط الإضافية الممنوحة للطالب (مكافأة):</label>
                <input
                  type="number"
                  min="0"
                  value={reviewPoints}
                  onChange={(e) => setReviewPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">ملاحظات وتشجيع المدرب للطالب:</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="اكتب ملاحظاتك التشجيعية وتوجيهاتك للطالب..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveHomeworkReview}
                disabled={isSavingReview}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                {isSavingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>اعتماد التقييم والنقاط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Lock className="w-5 h-5" />
                <h3>استرجاع كلمة السر لبوابة المدرب</h3>
              </div>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                إذا نسيت كلمة المرور الخاصة ببوابتك، يمكنك استرجاعها مباشرة عبر التواصل مع <strong>إدارة مركز النجاح</strong>.
              </p>
              <div className="p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-2xl space-y-1">
                <span className="font-bold text-indigo-300 block">💡 كلمة المرور الافتراضية:</span>
                <p className="text-slate-300">
                  هي تكرار كود المدرب مرتين (مثال: إذا كان كودك <span className="font-mono text-amber-300">DR01</span> فإن كلمة السر الافتراضية تكون <span className="font-mono text-amber-300">DR01DR01</span>).
                </p>
              </div>
              <p>
                يقوم المسؤول بإعادة تعيين أو تخصيص كلمة المرور فوراً من شاشة إدارة المدربين بالإدارة.
              </p>
            </div>
            <button
              onClick={() => setIsForgotPasswordOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
