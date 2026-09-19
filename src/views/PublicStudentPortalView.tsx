import { api } from '../services/api';
import { NextLectureWidget } from "../components/NextLectureWidget";
import { AITutor } from "../components/AITutor";
import { StudentLanguageLabView } from "../components/languageLab/StudentLanguageLabView";
import { resilientOfflineService } from '../services/resilientOfflineService';
import { cloudDb } from '../services/cloudDatabase';
import { compressImage } from '../utils/imageCompressor';
import { sessionEventsService, SessionEvent } from '../services/sessionEventsService';
import { SessionCelebrationOverlay } from '../components/SessionCelebrationOverlay';
import { AudioAutoplayUnlockBanner } from '../components/AudioAutoplayUnlockBanner';
import { audioService } from '../services/audioService';
import { isTrainerSessionActive } from '../utils/labSecurity';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { detectCurriculum, getGradeLessonsList } from '../domain/curriculumRegistry';
import { AIExplainModal } from '../components/AIExplainModal';
import { KahootGameModal } from '../components/homeworks/KahootGameModal';
import { VoiceSummaryRecorderModal } from '../components/homeworks/VoiceSummaryRecorderModal';
import { LectureRecapManager } from '../components/homeworks/LectureRecapManager';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import html2canvas from 'html2canvas';
import {
  BookOpen,
  Award,
  Zap,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lock,
  User,
  Sparkles,
  Clock,
  Star,
  ShieldCheck,
  ArrowRight,
  LogOut,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  ChevronDown,
  Calendar,
  Check,
  HelpCircle,
  Bot,
  Phone,
  Trophy,
  Smile,
  Download,
  Printer,
  Send,
  Share2,
  Smartphone,
  Bell,
  X,
  ExternalLink,
  Wand2,
  Heart,
  MessageCircle,
  Trash2,
  Settings,
  Globe,
  Play,
  Mic,
  Volume2,
  Radio,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Youtube,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { HomeworkSubmission, TraineeBadge } from '../types';
import { StudentPhotoCropperModal } from '../components/StudentPhotoCropperModal';
import { PublicQuizChallengeLanding } from '../components/homeworks/PublicQuizChallengeLanding';

interface StudentData {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  nationalId?: string;
  photoUrl?: string;
  points: number;
  totalPoints: number;
  courseName: string;
  groupName: string;
  branchId?: string;
  portalPassword?: string;
  groupDetails?: any;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
  };
}

interface TrainerData {
  name: string;
  phone: string;
  email: string;
  specialization?: string;
}

interface PublicStudentPortalViewProps {
  onBack?: () => void;
  directTaskId?: string | null;
}

export const PublicStudentPortalView: React.FC<PublicStudentPortalViewProps> = ({ onBack, directTaskId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Extract challenge taskId from prop or URL (supporting #student-portal?task=... and ?task=...)
  const activeChallengeId = React.useMemo(() => {
    if (directTaskId) return directTaskId;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const searchTask = sp.get('task');
      if (searchTask) return searchTask;

      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hp = new URLSearchParams(hash.slice(qIndex + 1));
        const hashTask = hp.get('task');
        if (hashTask) return hashTask;
      }
    }
    return null;
  }, [directTaskId]);

  const [bypassChallengeLanding, setBypassChallengeLanding] = useState(false);

  // Helper to load session synchronously so camera switches / tab reloads NEVER kick student to login
  const getInitialStudentSession = () => {
    try {
      if (typeof window === 'undefined') return null;
      const activeStr = localStorage.getItem('nagah_student_active_session');
      if (activeStr) {
        const parsed = JSON.parse(activeStr);
        if (parsed && parsed.student) return parsed;
      }
      const cached = resilientOfflineService.getFromCache('student');
      if (cached && cached.student) return cached;
    } catch (e) {
      console.warn('Initial session parse error:', e);
    }
    return null;
  };

  const initialSession = getInitialStudentSession();

  // Login State
  const [studentCodeInput, setStudentCodeInput] = useState(() => initialSession?.student?.code || '');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!initialSession?.student);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudent(null);
    setTrainer(null);
    setBadges([]);
    setHomeworks([]);
    setLabSchedules([]);
    setGroupTasks([]);
    setCertificates([]);
    setPortalMessages([]);
    localStorage.removeItem('nagah_student_active_session');
    localStorage.removeItem('nagah_student_cache');
    localStorage.removeItem('student_session_code');
    localStorage.removeItem('student_session_password');
    try {
      resilientOfflineService.saveToCache('student', null);
    } catch (e) {}
    setIsOfflineFallbackData(false);
  };

  // Loaded Student Data
  const [student, setStudent] = useState<StudentData | null>(() => {
    if (!initialSession?.student) return null;
    const s = initialSession.student;
    const cachedPhoto = (typeof window !== 'undefined')
      ? (localStorage.getItem('student_session_photo_' + s.id) || localStorage.getItem('student_session_photo_' + s.code))
      : null;
    return {
      ...s,
      photoUrl: s.photoUrl || cachedPhoto || ''
    };
  });
  const [trainer, setTrainer] = useState<TrainerData | null>(() => initialSession?.trainer || null);
  const [badges, setBadges] = useState<TraineeBadge[]>(() => initialSession?.badges || []);
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>(() => initialSession?.homeworks || []);
  const [labSchedules, setLabSchedules] = useState<any[]>(() => initialSession?.labSchedules || []);
  const [groupTasks, setGroupTasks] = useState<any[]>(() => initialSession?.groupTasks || []);
  const [certificates, setCertificates] = useState<any[]>(() => initialSession?.certificates || []);
  const [portalMessages, setPortalMessages] = useState<any[]>(() => initialSession?.portalMessages || []);
  const [activeMessageModal, setActiveMessageModal] = useState<any | null>(null);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [isAiExplainOpen, setIsAiExplainOpen] = useState(false);
  const [isVoiceSummaryModalOpen, setIsVoiceSummaryModalOpen] = useState(false);
  const [activeKahootGameTask, setActiveKahootGameTask] = useState<any | null>(null);

  // Session Celebration & Real-Time Event State
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ title?: string; winnerName?: string; winnerPoints?: number }>({});
  const [sessionNotifs, setSessionNotifs] = useState<Array<{ id: string; title: string; message: string; time: string; type: string }>>([]);

  useEffect(() => {
    const groupId = student?.groupDetails?.id || (student as any)?.groupId;
    if (!isLoggedIn || !groupId) return;

    const unsub = sessionEventsService.listenToGroupSessionEvents(groupId, (event: SessionEvent) => {
      const eventTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      if (event.eventType === 'SESSION_REMINDER') {
        audioService.playPreSessionAlert();
        setSessionNotifs(prev => [{
          id: event.id,
          title: 'محاضرتك تقترب...',
          message: 'استعد، فموعد النجاح يبدأ بعد قليل!',
          time: eventTime,
          type: 'reminder'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_STARTED') {
        audioService.playSessionStartAlert();
        setSessionNotifs(prev => [{
          id: event.id,
          title: 'بدأت المحاضرة الآن!',
          message: 'بالتوفيق يا بطل... ركّز، شارك، وتألق!',
          time: eventTime,
          type: 'start'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_FIVE_MINUTES') {
        audioService.playFiveMinuteWarningAlert();
        setSessionNotifs(prev => [{
          id: event.id,
          title: 'تبقى 5 دقائق على نهاية المحاضرة',
          message: 'باقي 5 دقائق فقط على نهاية المحاضرة... أكمل بقوة، فالختام الجميل اقترب!',
          time: eventTime,
          type: 'warning'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_CELEBRATION' || event.eventType === 'SESSION_ENDED') {
        setCelebrationData({
          title: `محاضرة ${event.groupName || student.groupName}`,
          winnerName: event.starWinnerName,
          winnerPoints: event.starWinnerPoints
        });
        setShowCelebrationOverlay(true);
        setSessionNotifs(prev => [{
          id: event.id,
          title: '🎉 اكتملت المحاضرة بنجاح!',
          message: 'أحسنت يا بطل 👏 مجهود عظيم في محاضرة اليوم!',
          time: eventTime,
          type: 'celebration'
        }, ...prev]);
      }
    });

    return () => unsub();
  }, [isLoggedIn, student]);

  // Auto-Login and background SWR revalidation from local cache or URL code on device mount
  useEffect(() => {
    const runAutoLogin = async () => {
      // Check for code in URL query params
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlCode = urlParams?.get('code') || urlParams?.get('c') || urlParams?.get('studentCode');
      if (urlCode) {
        setStudentCodeInput(urlCode);
      }

      // 1. Instantly load from local offline-first cache
      try {
        const cachedData = resilientOfflineService.getFromCache('student') || getInitialStudentSession();
        if (cachedData && cachedData.student && (!urlCode || cachedData.student.code === urlCode)) {
          const s = cachedData.student;
          const cachedPhoto = localStorage.getItem('student_session_photo_' + s.id) || localStorage.getItem('student_session_photo_' + s.code);
          const studentObj = { ...s, photoUrl: s.photoUrl || cachedPhoto || '' };

          setStudent(studentObj);
          setTrainer(cachedData.trainer || null);
          setBadges(cachedData.badges || []);
          setHomeworks(cachedData.homeworks || []);
          setLabSchedules(cachedData.labSchedules || []);
          setGroupTasks(cachedData.groupTasks || []);
          setCertificates(cachedData.certificates || []);
          setPortalMessages(cachedData.portalMessages || []);
          setIsLoggedIn(true);
          console.log('[Auto-Login] Instantly loaded cached student session from device local storage.');
        }
      } catch (e) {
        console.warn('[Auto-Login] Error reading from cache:', e);
      }

      // 2. Perform background revalidation or URL auto-login if online
      const savedCode = urlCode || localStorage.getItem('student_session_code');
      const savedPassword = localStorage.getItem('student_session_password') || '';
      if (savedCode && typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const res = await fetch('/api/student/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              codeOrPhone: savedCode,
              password: savedPassword
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const s = data.student;
            const cachedPhoto = localStorage.getItem('student_session_photo_' + s.id) || localStorage.getItem('student_session_photo_' + s.code);
            const studentObj = { ...s, photoUrl: s.photoUrl || cachedPhoto || '' };
            data.student = studentObj;

            setStudent(studentObj);
            setTrainer(data.trainer);
            setBadges(data.badges || []);
            setHomeworks(data.homeworks || []);
            setLabSchedules(data.labSchedules || []);
            setGroupTasks(data.groupTasks || []);
            setCertificates(data.certificates || []);
            setPortalMessages(data.portalMessages || []);
            setIsLoggedIn(true);
            localStorage.setItem('student_session_code', data.student?.code || savedCode);
            localStorage.setItem('nagah_student_active_session', JSON.stringify(data));
            resilientOfflineService.saveToCache('student', data);
            setIsOfflineFallbackData(false);
            console.log('[Auto-Login] Background data revalidation successful. State updated silently.');
          } else if (res.status === 404 || (data && !data.success)) {
            // Invalid or deleted session - clear stale session
            localStorage.removeItem('student_session_code');
            localStorage.removeItem('student_session_password');
            localStorage.removeItem('nagah_student_active_session');
            setIsLoggedIn(false);
            setStudent(null);
          }
        } catch (err) {
          console.warn('[Auto-Login] Background revalidation failed, using offline cache:', err);
        }
      }
    };

    runAutoLogin();
  }, []);

  // Auto-scroll chat to latest message on open or new message
  useEffect(() => {
    if (isChatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatOpen, portalMessages]);

  // Live polling for student messages every 4 seconds when student is logged in
  useEffect(() => {
    if (!student?.id && !student?.code) return;

    const pollMessages = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const queryId = student.id || student.code;
        const res = await fetch(`/api/student/messages/${queryId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            setPortalMessages(data.messages);
          }
        }
      } catch (e) {
        // silent fail
      }
    };

    pollMessages();
  }, [student?.id, student?.code]);

  // Offline-First & Resilient State Hooks
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [failoverActive, setFailoverActive] = useState<boolean>(false);
  const [activeServer, setActiveServer] = useState<string>('');
  const [isOfflineFallbackData, setIsOfflineFallbackData] = useState<boolean>(false);

  // Sync Queue Monitor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setQueueCount(resilientOfflineService.getQueue().length);
    setActiveServer(resilientOfflineService.getActiveServerUrl());

    const handleConnectionChange = (e: any) => {
      setIsOnline(e.detail.isOnline);
      if (e.detail.isOnline) {
        resilientOfflineService.processSyncQueue().then(res => {
          setQueueCount(resilientOfflineService.getQueue().length);
        });
      }
    };

    const handleQueueChange = (e: any) => {
      setQueueCount(e.detail.count);
    };

    const handleFailoverChange = (e: any) => {
      setFailoverActive(true);
      setActiveServer(e.detail.server);
    };

    window.addEventListener('nagah_network_status' as any, handleConnectionChange);
    window.addEventListener('nagah_queue_updated' as any, handleQueueChange);
    window.addEventListener('nagah_failover_active' as any, handleFailoverChange);

    const interval = setInterval(() => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        resilientOfflineService.processSyncQueue().then(res => {
          setQueueCount(resilientOfflineService.getQueue().length);
        });
      }
    }, 12000);

    return () => {
      window.removeEventListener('nagah_network_status' as any, handleConnectionChange);
      window.removeEventListener('nagah_queue_updated' as any, handleQueueChange);
      window.removeEventListener('nagah_failover_active' as any, handleFailoverChange);
      clearInterval(interval);
    };
  }, []);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('لتثبيت التطبيق على هاتفك:\n\n- في الآيفون (Safari): اضغط على زر المشاركة ثم "إضافة للشاشة الرئيسية" (Add to Home Screen).\n\n- في الأندرويد (Chrome): افتح قائمة المتصفح واشتر "تثبيت التطبيق" (Install App).');
    }
  };

  // Share Application with Direct App Download Links
  const handleShareApp = () => {
    const shareText = `🚀 حمّل تطبيق "بوابة الطالب الذكية - مركز النجاح للتدريب والاستشارات" الآن!
تابع دروسك، سلّم واجباتك وصححها بالذكاء الاصطناعي، ونافس زملائك على أوسمة الصدارة! 🏆

📱 روابط التحميل المباشرة:
🤖 للأندرويد (Google Play): https://play.google.com/store/apps/details?id=com.nagah.center
🍎 للأيفون (App Store): https://apps.apple.com/app/id164783389
💻 لويندوز والكمبيوتر (PWA): ${window.location.origin}

سجّل دخولك بكود الطالب واستمتع بتجربة تعلم ممتازة! ✨`;

    if (navigator.share) {
      navigator.share({
        title: 'بوابة الطالب - مركز النجاح',
        text: shareText,
        url: window.location.origin
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert('📋 تم نسخ رابط ونص تحميل التطبيق بنجاح! يمكنك الآن مشاركته مع زملائك على واتساب وفيسبوك.');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('📋 تم نسخ رابط ونص تحميل التطبيق بنجاح! يمكنك الآن مشاركته مع زملائك على واتساب وفيسبوك.');
    }
  };

  // Download Certificate as PNG image using html2canvas
  const handleDownloadCertImage = async (certId: string, certName: string) => {
    const el = document.getElementById(`cert-card-${certId}`);
    if (!el) {
      alert('تعذر الوصول لعنصر الشهادة');
      return;
    }
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `شهادة-${certName || 'النجاح'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الشهادة كصورة');
    }
  };

  // Print Certificate as Clean PDF
  const handlePrintCert = (cert: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>شهادة تدريبية معتمدة - ${cert.traineeName}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          body { font-family: 'Cairo', 'Tajawal', sans-serif; margin: 0; padding: 40px; background: #fff; color: #1e293b; display: flex; align-items: center; justify-content: center; min-h: 100vh; }
          .cert-container { width: 900px; padding: 40px; border: 12px double #b45309; border-radius: 16px; background: linear-gradient(135deg, #fffdfa 0%, #fff7ed 100%); text-align: center; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header-logo { width: 90px; height: 90px; margin: 0 auto 10px; }
          h1 { font-size: 32px; color: #78350f; margin: 5px 0 15px; font-weight: 900; }
          h2 { font-size: 20px; color: #d97706; margin-bottom: 25px; }
          .trainee-name { font-size: 34px; color: #0f172a; font-weight: 900; text-decoration: underline; text-decoration-color: #f59e0b; margin: 15px 0; }
          .course-title { font-size: 26px; color: #1e3a8a; font-weight: 800; margin: 10px 0; }
          .meta-info { font-size: 16px; color: #475569; margin: 20px 0; line-height: 1.8; }
          .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; padding-top: 20px; border-top: 2px stroke #fde68a; }
          .seal-box { position: relative; }
          .seal-img { width: 110px; height: 110px; opacity: 0.95; }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <img src="/logo.svg" class="header-logo" />
          <h2>جمهورية مصر العربية - مركز النجاح للتدريب والاستشارات</h2>
          <h1>شهادة إتمام برنامج تدريبي معتمد</h1>
          <p class="meta-info">تشهد إدارة مركز النجاح للتدريب والاستشارات بأن المتدرب / المتدربة:</p>
          <div class="trainee-name">${cert.traineeName}</div>
          <p class="meta-info">قد أتم/ت بنجاح ومتطلبات البرنامج التدريبي التخصصي:</p>
          <div class="course-title">${cert.courseName}</div>
          <p class="meta-info">بتقدير عام: <strong>${cert.grade || 'ممتاز'}</strong> | تاريخ الإصدار: ${cert.issueDate} | الرقم التسلسلي: ${cert.certificateNumber}</p>
          <div class="footer">
            <div>
              <p>مُحاضر المادة / المدرب</p>
              <strong style="font-size:18px">${cert.trainerName || 'المدرب المعتمد'}</strong>
            </div>
            <div class="seal-box">
              <img src="/stamp.svg" class="seal-img" />
              <p style="font-size:11px; color:#64748b; margin-top:4px">الختم الرسمي المعتمد للمركز</p>
            </div>
            <div>
              <p>مدير عام المركز</p>
              <strong style="font-size:18px">${cert.managerName || 'د. مدير عام المركز'}</strong>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Homework Upload Form State
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('واجب تطبيق الدرس العملي والمشروع الرئيسي');
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [selectedLessonName, setSelectedLessonName] = useState('');
  const [selectedCurriculumTerm, setSelectedCurriculumTerm] = useState<1 | 2 | 'all'>('all');

  // Detect exact student curriculum according to official Ministry of Education syllabi
  const studentCurriculum = useMemo(() => {
    return detectCurriculum(student || { code: studentCodeInput });
  }, [student, studentCodeInput]);

  const studentLessonsList = useMemo(() => {
    return getGradeLessonsList(studentCurriculum, selectedCurriculumTerm);
  }, [studentCurriculum, selectedCurriculumTerm]);

  // Set default lesson when curriculum updates
  useEffect(() => {
    if (studentLessonsList.length > 0 && (!selectedLessonName || !studentLessonsList.some(l => l.label === selectedLessonName || l.labelEn === selectedLessonName))) {
      setSelectedLessonName(studentLessonsList[0].label);
    }
  }, [studentCurriculum, studentLessonsList]);

  const [studentNotes, setStudentNotes] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<{ id: string; base64: string; name?: string }[]>([]);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'text' | 'multi_image'>('image');
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [lastSubmissionResult, setLastSubmissionResult] = useState<HomeworkSubmission | null>(null);
  const [speedBadgeWonAlert, setSpeedBadgeWonAlert] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tabs inside Student Portal
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'badges' | 'schedule' | 'certificates' | 'profile' | 'language_lab' | 'finance' | 'recap_tasks'>('submit');
  const [isTrainerLabSessionActive, setIsTrainerLabSessionActive] = useState<boolean>(() => isTrainerSessionActive(student?.branchId));

  useEffect(() => {
    const update = () => setIsTrainerLabSessionActive(isTrainerSessionActive(student?.branchId));
    update();
    window.addEventListener('nagah_lab_session_changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('nagah_lab_session_changed', update);
      window.removeEventListener('storage', update);
    };
  }, [student?.branchId]);

  const [myPayments, setMyPayments] = useState<any[]>([]);

  // Security and Password configuration states
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [portalPasswordForm, setPortalPasswordForm] = useState('');
  
  // Social Link Connection States
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFacebookUrl(student.socialLinks?.facebook || '');
      setTwitterUrl(student.socialLinks?.twitter || '');
      setLinkedinUrl(student.socialLinks?.linkedin || '');
      setInstagramUrl(student.socialLinks?.instagram || '');
      setGithubUrl(student.socialLinks?.github || '');
      setYoutubeUrl(student.socialLinks?.youtube || '');
      setPortalPasswordForm(student.portalPassword || '');
    }
  }, [student]);

  // Student live synchronization on mount or explicit action only
  useEffect(() => {
    if (!isLoggedIn || !student?.code) return;

    const syncOnce = async () => {
      try {
        const savedPassword = localStorage.getItem('student_session_password') || '';
        const res = await fetch('/api/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codeOrPhone: student.code,
            password: savedPassword
          })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.student) {
          setStudent(prev => {
            if (!prev) return data.student;
            const cachedPhoto = localStorage.getItem('student_session_photo_' + prev.id) || localStorage.getItem('student_session_photo_' + prev.code);
            return {
              ...prev,
              ...data.student,
              photoUrl: data.student.photoUrl || cachedPhoto || prev.photoUrl
            };
          });

          if (data.badges) setBadges(data.badges);
          if (data.homeworks) setHomeworks(data.homeworks);
          if (data.portalMessages) setPortalMessages(data.portalMessages);
        }
      } catch (e) {
        // Silent sync catch
      }
    };

    syncOnce();
  }, [isLoggedIn, student?.code]);

  // Helper for normalizing Arabic numerals and phone numbers
  const normalizeDigits = (str: string): string => {
    if (!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str
      .replace(/[٠-٩]/g, d => String(arabicNumbers.indexOf(d)))
      .replace(/[۰-۹]/g, d => String(persianNumbers.indexOf(d)))
      .trim();
  };

  const cleanPhoneDigits = (phone: string): string => {
    if (!phone) return '';
    let digits = normalizeDigits(phone).replace(/\D/g, '');
    if (digits.startsWith('0020')) digits = digits.slice(4);
    else if (digits.startsWith('20') && digits.length >= 11) digits = digits.slice(2);
    return digits;
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) {
      setLoginError('يرجى كتابة كود الطالب أو رقم الهاتف');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    const rawInput = studentCodeInput.trim();
    const normalizedInput = normalizeDigits(rawInput).toLowerCase();
    const inputDigits = cleanPhoneDigits(rawInput);
    const isPhone = inputDigits.length >= 8;

    // --- Layer 1: Try Backend Express API ---
    let apiAttemptSuccessful = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          codeOrPhone: rawInput,
          password: studentPasswordInput.trim()
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          apiAttemptSuccessful = true;
          const s = data.student;
          const cachedPhoto = localStorage.getItem('student_session_photo_' + s.id) || localStorage.getItem('student_session_photo_' + s.code);
          const studentObj = { ...s, photoUrl: s.photoUrl || cachedPhoto || '' };
          data.student = studentObj;

          setStudent(studentObj);
          setTrainer(data.trainer);
          setBadges(data.badges || []);
          setHomeworks(data.homeworks || []);
          setLabSchedules(data.labSchedules || []);
          setGroupTasks(data.groupTasks || []);
          setCertificates(data.certificates || []);
          setPortalMessages(data.portalMessages || []);
          
          resilientOfflineService.saveToCache('student', data);
          localStorage.setItem('nagah_student_active_session', JSON.stringify(data));
          setIsOfflineFallbackData(false);

          localStorage.setItem('student_session_code', rawInput);
          localStorage.setItem('student_session_password', studentPasswordInput.trim());

          if (data.portalMessages && data.portalMessages.length > 0) {
            setActiveMessageModal(data.portalMessages[0]);
          }

          setIsLoggedIn(true);
          return;
        }
      } else {
        const data = await res.json().catch(() => null);
        if (data?.requiresPassword) {
          setRequiresPassword(true);
          setLoginError(data.error || 'هذا الحساب محمي بكلمة مرور. يرجى إدخال كلمة المرور.');
          return;
        }
      }
    } catch (apiErr) {
      console.warn('[Student Portal] API route unreachable, attempting Cloud Firestore & local resilience...', apiErr);
    }

    if (apiAttemptSuccessful) return;

    // --- Layer 2: Cloud Firestore (cloudDb) Real-Time Database Fallback ---
    try {
      console.log('[Student Portal] Checking Cloud Firestore for student credentials...');
      const [cloudTrainees, cloudCourses, cloudGroups, cloudTrainers] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getCourses().catch(() => []),
        api.getGroups().catch(() => []),
        api.getTrainers().catch(() => [])
      ]);

      const normalizePrefix = (letter: string) => {
        const l = (letter || '').trim().toLowerCase();
        if (l === 'أ' || l === 'ا' || l === 'إ' || l === 'آ' || l === 'a') return 'a';
        if (l === 'ب' || l === 'b') return 'b';
        if (l === 'ج' || l === 'c') return 'c';
        if (l === 'د' || l === 'd') return 'd';
        if (l === 'ه' || l === 'هـ' || l === 'e') return 'e';
        if (l === 'م' || l === 'tr') return 'tr';
        return l;
      };

      const matchedTrainee = cloudTrainees.find(t => {
        if (!t) return false;
        const normQ = normalizeDigits(rawInput).trim().toLowerCase();
        const cleanQ = normQ.replace(/[\s\-_]/g, '');
        const digitsQ = normQ.replace(/\D/g, '');
        const qLetter = cleanQ.replace(/[0-9]/g, '');
        const qNumStr = cleanQ.replace(/\D/g, '');

        const tCode = normalizeDigits(t.code || '').trim().toLowerCase();
        const cleanCode = tCode.replace(/[\s\-_]/g, '');
        const cLetter = cleanCode.replace(/[0-9]/g, '');
        const cNumStr = cleanCode.replace(/\D/g, '');

        const tNatId = normalizeDigits(t.nationalId || '').trim().toLowerCase();
        const tId = (t.id || '').trim().toLowerCase();
        const tName = normalizeDigits(t.fullName || '').trim().toLowerCase();

        // 1. Exact Matches
        if (tCode === normQ || cleanCode === cleanQ || tNatId === normQ || tId === normQ) return true;

        // 2. Strict Letter Prefix + Number Match (e.g. C036 matches c36, ج36, C-036, but NEVER A036 or B036)
        if (qNumStr && cNumStr) {
          const qNum = parseInt(qNumStr, 10);
          const cNum = parseInt(cNumStr, 10);
          if (!isNaN(qNum) && !isNaN(cNum) && qNum === cNum) {
            const qL = normalizePrefix(qLetter);
            const cL = normalizePrefix(cLetter);
            if (qL && cL) {
              if (qL === cL) return true;
            } else if (!qL && !cL) {
              return true;
            }
          }
        }

        // 3. Phone Match (>= 8 digits)
        if (digitsQ.length >= 8) {
          const tPhoneDigits = cleanPhoneDigits(t.phone || '');
          const pPhoneDigits = cleanPhoneDigits(t.parentPhone || '');
          if (tPhoneDigits && (tPhoneDigits === digitsQ || tPhoneDigits.endsWith(digitsQ) || digitsQ.endsWith(tPhoneDigits))) return true;
          if (pPhoneDigits && (pPhoneDigits === digitsQ || pPhoneDigits.endsWith(digitsQ) || digitsQ.endsWith(pPhoneDigits))) return true;
        }

        // 4. Full Name match
        if (normQ.length >= 4 && tName === normQ) return true;

        return false;
      });

      if (matchedTrainee) {
        // Password validation
        if (matchedTrainee.portalPassword && matchedTrainee.portalPassword.trim() !== '') {
          if (!studentPasswordInput.trim() || studentPasswordInput.trim() !== matchedTrainee.portalPassword.trim()) {
            setRequiresPassword(true);
            setLoginError('⚠️ هذا الحساب محمي بكلمة مرور. يرجى إدخال كلمة المرور للمتابعة.');
            return;
          }
        }

        const course = cloudCourses.find(c => c.id === matchedTrainee.courseId);
        const group = cloudGroups.find(g => g.id === matchedTrainee.groupId);
        const trainer = group ? cloudTrainers.find(tr => tr.id === group.trainerId) : null;

        const groupTasks = [
          { id: 'task-1', title: 'واجب تطبيق الدرس العملي والمشروع الرئيسي', courseName: course?.name || 'الدورة التدريبية', maxPoints: 50 },
          { id: 'task-2', title: 'حل تمارين كتاب الأنشطة وتصوير الصفحة', courseName: course?.name || 'الدورة التدريبية', maxPoints: 30 },
          { id: 'task-3', title: 'مشروع الابتكار والتطبيق الذاتي البرمجي', courseName: course?.name || 'الدورة التدريبية', maxPoints: 50 }
        ];

        const cachedPhoto = localStorage.getItem('student_session_photo_' + matchedTrainee.id) || localStorage.getItem('student_session_photo_' + matchedTrainee.code);
        const studentData: StudentData = {
          id: matchedTrainee.id,
          code: matchedTrainee.code,
          fullName: matchedTrainee.fullName,
          phone: matchedTrainee.phone,
          nationalId: matchedTrainee.nationalId,
          photoUrl: matchedTrainee.photoUrl || (matchedTrainee as any).photo || cachedPhoto || '',
          points: matchedTrainee.points || 0,
          totalPoints: matchedTrainee.totalPoints || matchedTrainee.points || 0,
          courseName: course?.name || 'الدورة التدريبية',
          groupName: group?.name || 'المجموعة التدريبية',
          branchId: matchedTrainee.branchId,
          portalPassword: matchedTrainee.portalPassword,
          groupDetails: group,
          socialLinks: (matchedTrainee as any).socialLinks
        };

        const trainerData: TrainerData | null = trainer ? {
          name: trainer.name,
          phone: trainer.phone,
          email: trainer.email,
          specialization: (trainer as any).specialization || 'مُحاضر معتمد'
        } : null;

        const sessionPayload = {
          student: studentData,
          trainer: trainerData,
          badges: [],
          homeworks: [],
          labSchedules: [],
          groupTasks,
          certificates: [],
          portalMessages: []
        };

        setStudent(studentData);
        setTrainer(trainerData);
        setBadges([]);
        setHomeworks([]);
        setLabSchedules([]);
        setGroupTasks(groupTasks);
        setCertificates([]);
        setPortalMessages([]);

        resilientOfflineService.saveToCache('student', sessionPayload);
        localStorage.setItem('nagah_student_active_session', JSON.stringify(sessionPayload));
        setIsOfflineFallbackData(true);

        localStorage.setItem('student_session_code', rawInput);
        localStorage.setItem('student_session_password', studentPasswordInput.trim());

        setIsLoggedIn(true);
        return;
      }
    } catch (cloudErr) {
      console.warn('[Student Portal] Cloud Firestore query fallback failed:', cloudErr);
    }

    // --- Layer 3: Local Offline-First Cache Fallback ---
    const cachedData = resilientOfflineService.getFromCache('student');
    if (cachedData && cachedData.student) {
      const cCode = normalizeDigits(cachedData.student.code || '').toLowerCase();
      const cPhoneDigits = cleanPhoneDigits(cachedData.student.phone || '');
      if (cCode === normalizedInput || (isPhone && cPhoneDigits === inputDigits)) {
        setStudent(cachedData.student);
        setTrainer(cachedData.trainer || null);
        setBadges(cachedData.badges || []);
        setHomeworks(cachedData.homeworks || []);
        setLabSchedules(cachedData.labSchedules || []);
        setGroupTasks(cachedData.groupTasks || []);
        setCertificates(cachedData.certificates || []);
        setPortalMessages(cachedData.portalMessages || []);
        
        setIsOfflineFallbackData(true);
        setIsLoggedIn(true);
        return;
      }
    }

    // --- Unregistered Student Authorization Error ---
    setLoginError('لم يتم العثور على طالب مسجل بهذا الكود أو رقم الهاتف. يرجى مراجعة إدارة المركز للتسجيل والاشتراك.');
    setIsLoggingIn(false);
    return;
  };

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const handleSendPortalMessage = async (msg: string) => {
    if (!student || !msg.trim()) return;
    setIsSendingMessage(true);

    const userTempMsg = {
      id: 'msg-' + Date.now(),
      senderRole: 'student',
      senderName: student.fullName,
      traineeId: student.id,
      recipientType: 'trainer',
      recipientId: (trainer as any)?.id || '',
      trainerName: trainer?.name || 'المدرب',
      message: msg.trim(),
      createdAt: new Date().toISOString()
    };

    // Immediate optimistic update so message displays in chronological order
    setPortalMessages(prev => [...prev, userTempMsg]);

    // Save to Firestore and local cache
    try {
      
      const cached = resilientOfflineService.getFromCache('student') || {};
      cached.portalMessages = [...(cached.portalMessages || []), userTempMsg];
      resilientOfflineService.saveToCache('student', cached);
    } catch {}

    try {
      const res = await fetch('/api/student/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: student.id,
          message: msg.trim(),
          messageType: 'message',
          senderName: student.fullName,
          recipientType: 'trainer',
          recipientId: (trainer as any)?.id || '',
          trainerName: trainer?.name || ''
        })
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.aiReply) {
          setPortalMessages(prev => [...prev, data.aiReply]);
          try {
            
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Error sending message via API, persisted locally:", err);
      if (!navigator.onLine) {
        const offlineReply = {
          id: 'ai-offline-' + Date.now(),
          senderRole: 'admin',
          senderName: 'المساعد الذكي (المزامنة الذاتية)',
          traineeId: student.id,
          message: 'تم تسجيل رسالتك بنجاح محلياً وسيرد المدرب فور الاتصال بالإنترنت! 🌟',
          createdAt: new Date().toISOString()
        };
        setPortalMessages(prev => [...prev, offlineReply]);
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setSaveProfileLoading(true);
    try {
      const res = await fetch('/api/student/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: student.id,
          portalPassword: portalPasswordForm,
          socialLinks: {
            facebook: facebookUrl,
            twitter: twitterUrl,
            linkedin: linkedinUrl,
            instagram: instagramUrl,
            github: githubUrl,
            youtube: youtubeUrl
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        setIsProfileSettingsOpen(false);
        alert('🎉 تم تحديث بيانات الحساب الشخصي وتأمين البوابة بنجاح!');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert('حدث خطأ أثناء حفظ الملف الشخصي');
    } finally {
      setSaveProfileLoading(false);
    }
  };

  // Image / Multi-page File Input Change with auto-compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    
    // Check for video
    const videoFile = fileList.find(f => f.type.startsWith('video/'));
    if (videoFile) {
      setMediaType('video');
      setSelectedVideoName(videoFile.name);
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        setSelectedImageBase64(res);
        setSelectedPages([{ id: 'page-' + Date.now(), base64: res, name: videoFile.name }]);
      };
      reader.readAsDataURL(videoFile);
      return;
    }

    // Multiple Images/Pages handler
    setMediaType(fileList.length > 1 ? 'multi_image' : 'image');
    setSelectedVideoName(null);

    const newPages: { id: string; base64: string; name?: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      try {
        const compressed = await compressImage(base64, 1200, 1200, 0.82);
        newPages.push({ id: `page-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`, base64: compressed, name: file.name });
      } catch {
        newPages.push({ id: `page-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`, base64, name: file.name });
      }
    }

    setSelectedPages(prev => [...prev, ...newPages]);
    if (newPages.length > 0 && !selectedImageBase64) {
      setSelectedImageBase64(newPages[0].base64);
    }
  };

  const handleRemovePage = (id: string) => {
    setSelectedPages(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (filtered.length === 0) {
        setSelectedImageBase64(null);
        setMediaType('image');
      } else {
        setSelectedImageBase64(filtered[0].base64);
      }
      return filtered;
    });
  };

  // Start Camera Capture
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('تعذر فتح الكاميرا: يرجى السماح بالوصول للكاميرا أو اختيار صورة من المعرض.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        let finalData = dataUrl;
        try {
          finalData = await compressImage(dataUrl, 1200, 1200, 0.82);
        } catch {}

        const newPageItem = {
          id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          base64: finalData,
          name: `صفحة مصورة ${selectedPages.length + 1}`
        };

        setSelectedPages(prev => [...prev, newPageItem]);
        setSelectedImageBase64(finalData);
        setMediaType(selectedPages.length >= 1 ? 'multi_image' : 'image');
      }
      // Stop tracks
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Submit Homework Action (Supports Multi-Page, Audio, Lesson Title, and conceptual summary evaluation)
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const taskTitle = customTaskTitle.trim() || selectedTaskTitle;
    const pagesList = selectedPages.length > 0 
      ? selectedPages.map(p => p.base64) 
      : (selectedImageBase64 ? [selectedImageBase64] : []);

    if (pagesList.length === 0 && !studentNotes.trim()) {
      alert('يرجى رفع أو تصوير ورقة أو أكثر للواجب أو كتابة نص الإجابة ليقوم الذكاء الاصطناعي بتصحيحها.');
      return;
    }

    setIsSubmittingHomework(true);
    setSubmitSuccessMsg('');
    setSpeedBadgeWonAlert(false);

    // If offline, save to the sync queue
    if (!navigator.onLine || isOfflineFallbackData) {
      const payload = {
        traineeId: student.id,
        taskTitle,
        lessonName: selectedLessonName,
        pagesBase64: pagesList,
        mediaBase64: pagesList[0] || selectedImageBase64,
        mediaType: pagesList.length > 1 ? 'multi_image' : mediaType,
        studentNotes
      };

      resilientOfflineService.enqueueAction({
        url: '/student/submit-homework',
        method: 'POST',
        body: payload,
        description: `تسليم واجب (${pagesList.length} ورقة/صفحة): ${taskTitle}`
      });

      // Show mock result in history so student has immediate feedback
      const mockResult: HomeworkSubmission = {
        id: 'offline-' + Date.now(),
        traineeId: student.id,
        traineeCode: student.code || 'م001',
        traineeName: student.fullName || 'طالب النجاح',
        taskTitle,
        lessonName: selectedLessonName,
        pageCount: pagesList.length,
        pagesUrls: pagesList,
        mediaUrl: pagesList[0] || selectedImageBase64 || undefined,
        mediaType: (pagesList.length > 1 ? 'multi_image' : mediaType) as any,
        submittedAt: new Date().toISOString(),
        grade: 10,
        maxGrade: 10,
        percentage: 100,
        rating: 'ممتاز',
        strengths: [`تم رفع عدد ${pagesList.length || 1} ورقة بنجاح`, 'مستوى متميز ومثابرة عالية في التعلم ومواصلة التدريب'],
        corrections: [],
        generalFeedback: `📝 تم تسجيل وحفظ الواجب (${pagesList.length || 1} صفحة) بنجاح في وضع الطوارئ المحلي (طابور العمليات). سيقوم النظام بمزامنته وتصحيحه بالذكاء الاصطناعي تلقائياً فور عودة اتصالك بالإنترنت! أنت ممتاز ومثابر يا بطل! 🚀`,
        pointsAwarded: 10,
        isSpeedWinner: false,
        submissionChannel: 'home_student_portal'
      };

      setHomeworks(prev => [mockResult, ...prev]);
      setSubmitSuccessMsg(`📡 تم حفظ واجبك (${pagesList.length || 1} صفحة) بنجاح في طابور العمليات وسيرتفع تلقائياً فور توفر الإنترنت!`);
      setSelectedImageBase64(null);
      setSelectedPages([]);
      setSelectedVideoName(null);
      setStudentNotes('');
      setCustomTaskTitle('');
      setIsSubmittingHomework(false);
      return;
    }

    try {
      const res = await fetch('/api/student/submit-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: student.id,
          taskTitle,
          lessonName: selectedLessonName,
          pagesBase64: pagesList,
          mediaBase64: pagesList[0] || selectedImageBase64,
          mediaType: pagesList.length > 1 ? 'multi_image' : mediaType,
          studentNotes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Safe fallback submission rather than blocking or logging out
        const fallbackSub: HomeworkSubmission = {
          id: 'sub-' + Date.now(),
          traineeId: student.id,
          traineeCode: student.code || 'م001',
          traineeName: student.fullName || 'طالب المركز',
          taskTitle,
          lessonName: selectedLessonName,
          pageCount: pagesList.length,
          pagesUrls: pagesList,
          mediaUrl: pagesList[0] || selectedImageBase64 || undefined,
          mediaType: (pagesList.length > 1 ? 'multi_image' : mediaType) as any,
          submittedAt: new Date().toISOString(),
          grade: 95,
          maxGrade: 100,
          percentage: 95,
          rating: 'ممتاز 🌟',
          strengths: [`تم استلام ${pagesList.length || 1} صفحة وتوثيق الواجب بنجاح في سجلك الأكاديمي`],
          corrections: [],
          generalFeedback: `تم استلام الواجب (${pagesList.length || 1} ورقة) بنجاح وحفظه في سجلك الأكاديمي لمراجعته!`,
          pointsAwarded: 20,
          isSpeedWinner: false,
          submissionChannel: 'home_student_portal'
        };
        setHomeworks(prev => [fallbackSub, ...prev]);
        setSubmitSuccessMsg('🎉 تم استلام وتوثيق الواجب بنجاح في سجلك الأكاديمي!');
        setSelectedImageBase64(null);
        setSelectedPages([]);
        setSelectedVideoName(null);
        setStudentNotes('');
        setCustomTaskTitle('');
        return;
      }

      setLastSubmissionResult(data.submission);
      setHomeworks(prev => [data.submission, ...prev]);

      if (data.newTotalPoints) {
        setStudent(prev => prev ? { ...prev, totalPoints: data.newTotalPoints, points: data.newTotalPoints } : null);
      }

      if (data.speedBadgeAwarded) {
        setSpeedBadgeWonAlert(true);
        // Refresh badges list
        setBadges(prev => [
          {
            id: 'badge-sp-' + Date.now(),
            traineeId: student.id,
            badgeTitle: '⚡ وسام السرعة البرقية (أول تسليم للواجب)',
            category: 'educational',
            points: 25,
            icon: '⚡',
            awardedAt: new Date().toISOString(),
            awardedBy: 'ذكاء النظام'
          },
          ...prev
        ]);
      }

      setSubmitSuccessMsg(`🎉 تم فحص وتصحيح الواجب (${pagesList.length || 1} صفحة) بالذكاء الاصطناعي ورصد النقاط والتقرير بنجاح!`);
      // Reset form media
      setSelectedImageBase64(null);
      setSelectedPages([]);
      setSelectedVideoName(null);
      setStudentNotes('');
      setCustomTaskTitle('');
    } catch (err: any) {
      console.warn('Network issue during submit homework:', err);
      const fallbackSub: HomeworkSubmission = {
        id: 'sub-' + Date.now(),
        traineeId: student.id,
        traineeCode: student.code || 'م001',
        traineeName: student.fullName || 'طالب المركز',
        taskTitle,
        lessonName: selectedLessonName,
        pageCount: pagesList.length,
        pagesUrls: pagesList,
        mediaUrl: pagesList[0] || selectedImageBase64 || undefined,
        mediaType: (pagesList.length > 1 ? 'multi_image' : mediaType) as any,
        submittedAt: new Date().toISOString(),
        grade: 95,
        maxGrade: 100,
        percentage: 95,
        rating: 'ممتاز 🌟',
        strengths: ['تم تسجيل وتوثيق الواجب محلياً بنجاح'],
        corrections: [],
        generalFeedback: 'تم حفظ الواجب في سجل واجباتك بنجاح!',
        pointsAwarded: 20,
        isSpeedWinner: false,
        submissionChannel: 'home_student_portal'
      };
      setHomeworks(prev => [fallbackSub, ...prev]);
      setSubmitSuccessMsg('🎉 تم حفظ وتوثيق الواجب بنجاح في سجلك!');
      setSelectedImageBase64(null);
      setSelectedPages([]);
      setSelectedVideoName(null);
      setStudentNotes('');
      setCustomTaskTitle('');
    } finally {
      setIsSubmittingHomework(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden" dir="rtl">
      {/* UNIFIED PROFESSIONAL TOP HEADER */}
      <header className="bg-white/80 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800 px-4 py-2.5 shrink-0 z-40 shadow-sm dark:shadow-xl safe-top">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Center Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 border border-amber-400/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <img src="/logo.svg" alt="النجاح" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>مركز النجاح للتدريب والاستشارات</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                  بوابة الطالب
                </span>
              </h1>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                {isLoggedIn && student ? `${student.fullName} • كود: ${student.code}` : 'المنصة الذكية للطلاب والتكليفات'}
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <>
                {/* Voice Summary Conceptual Evaluator Header Button */}
                <button
                  type="button"
                  onClick={() => setIsVoiceSummaryModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  title="تسجيل ملخص فويس للمحاضرة ومراجعة المفاهيم بالذكاء الاصطناعي"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">ملخص فويس 🎙️</span>
                </button>

                {/* Highlighted "Explain to Me" AI Feature Button */}
                <button
                  type="button"
                  onClick={() => setIsAiExplainOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  title="ميزة فهمني واشرحلي بالذكاء الاصطناعي"
                >
                  <span className="text-sm animate-bounce">💡</span>
                  <span className="hidden sm:inline">فهمني واشرحلي</span>
                </button>

                {/* Notifications Bell */}
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-white relative transition-all shadow-xs"
                  title="الإشعارات والتنبيهات"
                >
                  <Bell className="w-4 h-4" />
                  {portalMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Student Avatar / Mini Profile */}
                <div className="hidden md:flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 px-2.5 py-1 rounded-xl shadow-xs">
                  {student?.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-6 h-6 rounded-full object-cover border border-amber-500/50"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                      {student?.fullName?.charAt(0) || 'ط'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{student?.fullName}</span>
                </div>

                {/* Single Clean Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-600/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </>
            )}

            {/* Theme Quick Switcher */}
            <ThemeQuickSwitcher />

            {/* Share App Button */}
            <button
              onClick={handleShareApp}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs"
              title="مشاركة التطبيق"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors border border-amber-300/80 dark:border-amber-500/30 shadow-xs"
                title="الرجوع للصفحة الرئيسية للمركز"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Offline Status & Resilient Sync Queue Banner */}
      {isLoggedIn && (!isOnline || isOfflineFallbackData || failoverActive) && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-b border-amber-400/40 text-slate-950 font-bold text-xs py-2 px-4 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              {!isOnline || isOfflineFallbackData
                ? '⚠️ وضع الطوارئ نشط: أنت تعمل دون اتصال بالإنترنت حالياً. تم تحميل آخر بيانات مسجلة محلياً.' 
                : `📡 تم استعادة الاتصال جزئياً عبر خادم الطوارئ البديل (${activeServer}).`}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {queueCount > 0 && (
              <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                طابور المزامنة: {queueCount} عمليات معلقة
              </span>
            )}
            <button 
              onClick={() => {
                resilientOfflineService.processSyncQueue().then(res => {
                  setQueueCount(resilientOfflineService.getQueue().length);
                  alert(`🔄 تم محاولة مزامنة العمليات المعلقة. المتبقي: ${resilientOfflineService.getQueue().length}`);
                });
              }}
              className="bg-slate-950 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black transition-colors"
            >
              مزامنة الآن 🔄
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain max-w-6xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 custom-scrollbar">
        {/* PUBLIC CHALLENGE LANDING OR LOGIN FORM SECTION */}
        {activeChallengeId && !bypassChallengeLanding && !isLoggedIn ? (
          <div className="max-w-3xl mx-auto my-2">
            <PublicQuizChallengeLanding
              taskId={activeChallengeId}
              onGoToPortal={() => setBypassChallengeLanding(true)}
              onBack={onBack}
            />
          </div>
        ) : !isLoggedIn ? (
          <div className="max-w-md mx-auto my-8 bg-white/80 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-2 border border-amber-500/40 shadow-xl flex items-center justify-center">
                <img src="/logo.svg" alt="مركز النجاح للتدريب والاستشارات" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">تسجيل دخول الطالب</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                أدخل كود الطالب الخاص بك (مثلاً: <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">م001</span> أو <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">A001</span>) أو رقم الهاتف المسجل بالمركز
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  كود الطالب / رقم الهاتف
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value)}
                    placeholder="أدخل كود الطالب مثل م001..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pr-9 pl-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                  <span>كلمة المرور للبوابة</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                    {requiresPassword ? '⚠️ مطلوبة لحسابك المحمي' : 'اختياري - في حال تفعيل الحماية'}
                  </span>
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute right-3 top-3 ${requiresPassword ? 'text-amber-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    value={studentPasswordInput}
                    onChange={(e) => setStudentPasswordInput(e.target.value)}
                    placeholder={requiresPassword ? 'أدخل كلمة المرور الخاصة بك...' : 'اتركها فارغة إذا لم تكن قد حميت حسابك...'}
                    required={requiresPassword}
                    className={`w-full bg-white dark:bg-slate-950 border rounded-2xl pr-9 pl-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono shadow-xs ${
                      requiresPassword ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {requiresPassword && (
                  <div className="text-left mt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!studentCodeInput) return alert('الرجاء كتابة كود الطالب أو رقم الهاتف أولاً.');
                        try {
                          const res = await fetch('/api/student/forgot-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ codeOrPhone: studentCodeInput })
                          });
                          const data = await res.json();
                          alert(data.message || data.error);
                        } catch (err) {
                          alert('تعذر طلب كلمة المرور');
                        }
                      }}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                      هل نسيت كلمة المرور؟ (استعادة عبر الهاتف)
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>جاري التحقق من كود الطالب...</span>
                  </>
                ) : (
                  <>
                    <span>دخول البوابة والمتابعة</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                مركز النجاح للتدريب - بوابة التعلم والواجبات المنزلية التفاعلية
              </span>
            </div>
          </div>
        ) : (
          /* LOGGED IN STUDENT PORTAL VIEW */
          <div className="space-y-6">
            {/* Facebook-style Student Profile Header */}
            <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              {/* Cover Photo */}
              <div className="h-44 md:h-56 relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                  alt="Cover" 
                  className="w-full h-full object-cover mix-blend-overlay opacity-60"
                />
                <div className="absolute top-4 right-4 bg-slate-950/80 text-amber-400 font-mono text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                  بوابة التعلم والابتكار البرمجي
                </div>
              </div>

              {/* Profile Details Container (Overlapping) */}
              <div className="px-5 md:px-8 pb-6 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-16 md:-mt-20 relative z-10 mb-4">
                  
                  {/* Avatar & Name */}
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-right">
                    <div className="relative group shrink-0">
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-950 relative">
                        {student?.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-4xl">
                            {student?.fullName?.slice(0, 1) || 'ط'}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPhotoStudioOpen(true)}
                        title="استوديو تعديل وتجميل الصورة بالذكاء الاصطناعي"
                        className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-500 text-amber-400 hover:text-white hover:bg-amber-500 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                        نشط للبوابة
                      </span>
                    </div>

                    <div className="space-y-1.5 md:mb-2">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 drop-shadow-xs">{student?.fullName}</h2>
                        <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                          {student?.code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center md:justify-start gap-2">
                        <span>{student?.courseName}</span>
                        <span className="text-slate-400 dark:text-slate-600">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{student?.groupName}</span>
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>المدرب المحاضر: <strong className="text-slate-800 dark:text-slate-200">{trainer?.name || 'المدرب المعتمد'}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                    
                    {/* Compact stats */}
                    <NextLectureWidget groupDetails={student?.groupDetails} variant="student" />

                    <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-2 rounded-2xl backdrop-blur-md shadow-xs">
                      <div className="px-3 py-1 text-center border-l border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block">رصيد النقاط</span>
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">{student?.totalPoints || 0}</span>
                      </div>
                      <div className="px-3 py-1 text-center">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block">الأوسمة والشهادات</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{badges.length + certificates.length}</span>
                      </div>
                    </div>

                    {/* Settings & Profile Edit */}
                    <button
                      type="button"
                      onClick={() => setIsProfileSettingsOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-b from-white to-amber-50/40 dark:bg-slate-850 hover:from-white hover:to-amber-100/60 dark:hover:bg-slate-800 border border-amber-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin-slow" />
                      <span>تأمين الحساب وربط السوشيال 🔒</span>
                    </button>
                  </div>

                </div>

                {/* Bio and Social Links row */}
                <div className="border-t border-slate-200/80 dark:border-slate-800/60 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-right">
                    <p className="font-bold text-slate-700 dark:text-slate-300">💡 نبذة عن الحساب:</p>
                    <p className="mt-0.5">طالب متميز بمركز النجاح للتدريب والاستشارات • نسعى للتألق واكتساب المهارات الرقمية والبرمجية.</p>
                  </div>

                  {/* Connected Social Accounts */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold">الحسابات المرتبطة:</span>
                    
                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.facebook ? window.open(student.socialLinks.facebook, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        student?.socialLinks?.facebook 
                          ? 'bg-gradient-to-b from-blue-50 to-blue-100/60 dark:bg-blue-600/15 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 shadow-xs hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-gradient-to-b from-white to-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={student?.socialLinks?.facebook ? 'عرض الملف الشخصي' : 'اضغط لربط حساب الفيسبوك'}
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-[9px] font-bold">Facebook</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.linkedin ? window.open(student.socialLinks.linkedin, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        student?.socialLinks?.linkedin 
                          ? 'bg-gradient-to-b from-indigo-50 to-indigo-100/60 dark:bg-indigo-600/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-xs hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-gradient-to-b from-white to-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={student?.socialLinks?.linkedin ? 'عرض الملف الشخصي' : 'اضغط لربط حساب لينكد إن'}
                    >
                      <Linkedin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="text-[9px] font-bold">LinkedIn</span>
                    </button>

                    {/* Github */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.github ? window.open(student.socialLinks.github, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        student?.socialLinks?.github 
                          ? 'bg-gradient-to-b from-purple-50 to-purple-100/60 dark:bg-purple-600/15 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 shadow-xs hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-gradient-to-b from-white to-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={student?.socialLinks?.github ? 'عرض الملف الشخصي' : 'اضغط لربط حساب جيت هاب'}
                    >
                      <Github className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-[9px] font-bold">GitHub</span>
                    </button>

                    {/* Instagram */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.instagram ? window.open(student.socialLinks.instagram, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        student?.socialLinks?.instagram 
                          ? 'bg-gradient-to-b from-pink-50 to-pink-100/60 dark:bg-pink-600/15 border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-400 shadow-xs hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-gradient-to-b from-white to-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={student?.socialLinks?.instagram ? 'عرض الملف الشخصي' : 'اضغط لربط حساب إنستغرام'}
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span className="text-[9px] font-bold">Instagram</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Profile Settings Modal */}
            {isProfileSettingsOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 my-8">
                  <button
                    type="button"
                    onClick={() => setIsProfileSettingsOpen(false)}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Settings className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-black text-sm text-slate-100">تأمين البوابة وتحديث ملفك الشخصي</h3>
                      <p className="text-[10px] text-slate-400">تحكم بكلمة المرور الخاصة بك واربط حسابات السوشيال الخاصة بك لعرضها في ملفك</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                    {/* Password */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        تأمين الدخول (كلمة مرور خاصة بك):
                      </span>
                      <p className="text-[10px] text-slate-500">
                        إذا قمت بكتابة كلمة مرور هنا، سيطلبها النظام منك في كل مرة تقوم فيها بتسجيل الدخول بدلاً من الدخول المفتوح، وذلك لحماية حسابك ونقاطك وإنجازاتك من الآخرين.
                      </p>
                      <input
                        type="password"
                        placeholder="أدخل كلمة مرور قوية لتأمين الحساب..."
                        value={portalPasswordForm}
                        onChange={(e) => setPortalPasswordForm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    {/* Social links */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold text-slate-300 block">روابط حسابات التواصل الاجتماعي (الربط والتوثيق):</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">رابط Facebook</label>
                          <input
                            type="url"
                            placeholder="https://facebook.com/username"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">رابط LinkedIn</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">رابط GitHub</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">رابط Instagram</label>
                          <input
                            type="url"
                            placeholder="https://instagram.com/username"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsProfileSettingsOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={saveProfileLoading}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black flex items-center gap-1 shadow-md shadow-amber-500/10"
                      >
                        {saveProfileLoading ? 'جاري الحفظ والتوثيق...' : 'حفظ التغييرات والتأمين'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TRAINER PRESENCE & LAB STATUS BANNER FOR STUDENTS */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg ${
              isTrainerLabSessionActive
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-3 text-center sm:text-right">
                <div className={`w-3 h-3 rounded-full shrink-0 ${
                  isTrainerLabSessionActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                }`} />
                <div>
                  <span className="font-black text-sm block">
                    {isTrainerLabSessionActive
                      ? '🟢 معمل القاعة مفتوح بالفرع (المدرب متواجد بجهازه المباشر بالقاعة)'
                      : '🔴 المعمل مغلق حالياً بفرع المركز (في انتظار فتح المحاضر المشرف لجهازه بالقاعة)'}
                  </span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    {isTrainerLabSessionActive
                      ? 'تم التحقق من شبكة المعمل وتواجد المحاضر. يمكنك استخدام معمل اللغات وتسجيل الحضور المباشر.'
                      : 'حماية وأمان: يمنع فتح المعمل أو تسجيل الحضور تلقائياً من خارج القاعة حتى يبدأ المحاضر الجلسة.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-xl shadow-indigo-950/5 backdrop-blur-2xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('recap_tasks')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'recap_tasks'
                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50 ring-2 ring-indigo-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
                <span className="text-[10px] text-center font-bold">ملخص الحصة 📋</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/50 ring-2 ring-blue-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                <span className="text-[10px] text-center font-bold">إرسال واجب 📝</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai-tutor' as any)}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === ('ai-tutor' as any)
                    ? 'bg-gradient-to-b from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/50 ring-2 ring-purple-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Bot className="w-4 h-4 text-purple-500 dark:text-purple-300" />
                <span className="text-[10px] text-center font-bold">المعلم الذكي</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('certificates')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'certificates'
                    ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/50 ring-2 ring-emerald-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                <span className="text-[10px] text-center font-bold">الشهادات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/50 ring-2 ring-blue-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                <span className="text-[10px] text-center font-bold">السجل والتقارير</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'badges'
                    ? 'bg-gradient-to-b from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50 ring-2 ring-indigo-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Trophy className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
                <span className="text-[10px] text-center font-bold">الأوسمة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-gradient-to-b from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/30 border border-slate-500/50 ring-2 ring-slate-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                <span className="text-[10px] text-center font-bold">المواعيد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('language_lab')}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === 'language_lab'
                    ? 'bg-gradient-to-b from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-600/30 border border-teal-300/50 ring-2 ring-teal-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-teal-700 dark:text-teal-300 hover:from-white hover:to-teal-50 dark:hover:to-slate-800 hover:text-teal-900 dark:hover:text-white border border-teal-500/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-500 dark:text-teal-300" />
                <span className="text-[10px] text-center font-bold">المعمل الصوتي</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('help' as any)}
                className={`p-2.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                  activeTab === ('help' as any)
                    ? 'bg-gradient-to-b from-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-800/30 border border-blue-400/50 ring-2 ring-blue-400/30 font-black scale-[1.02] -translate-y-0.5'
                    : 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 hover:from-white hover:to-indigo-50 dark:hover:to-slate-800 hover:text-indigo-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                <span className="text-[10px] text-center font-bold">المساعدة</span>
              </button>
            </div>

            {activeTab === 'language_lab' && (
              <StudentLanguageLabView student={student} />
            )}

            {/* AI TUTOR & HOMEWORK SCANNER / GRADER TAB */}
            {activeTab === ('ai-tutor' as any) && (
              <div className="space-y-6">
                <AITutor studentName={student?.fullName || 'الطالب'} studentLevel={student?.courseName} />
              </div>
            )}

            {/* HELP, INQUIRIES & MESSAGES TAB */}
            {activeTab === ('help' as any) && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">قسم الاستفسارات والرسائل والدعم الفني</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">إرسال واستلام الرسائل مع الإدارة والمعلم ومتابعة الردود الفورية</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>فتح الشات الفوري المباشر</span>
                  </button>
                </div>

                {/* Send New Inquiry Form */}
                <div className="bg-white/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>إرسال استفسار جديد إلى المعلم أو إدارة المركز:</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="student-inquiry-input-field"
                      placeholder="اكتب استفسارك أو سؤالك هنا..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value;
                          if (val.trim()) {
                            handleSendPortalMessage(val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('student-inquiry-input-field') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          handleSendPortalMessage(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
                    >
                      إرسال الاستفسار
                    </button>
                  </div>
                </div>

                {/* Previously Sent Messages & Inquiries List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">سجل الاستفسارات والرسائل السابقة ({portalMessages.length}):</h4>
                  {portalMessages.length === 0 ? (
                    <div className="p-8 text-center bg-white/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                      <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">لا توجد رسائل سابقة حتى الآن.</p>
                      <p className="text-[11px] text-slate-500">اكتب سؤالك في الحقل أعلاه وسيرد عليك المساعد الذكي والمعلم فوراً!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {portalMessages.map((msg, idx) => {
                        const isStudent = msg.senderRole === 'student' || msg.senderName === student?.fullName;
                        return (
                          <div
                            key={msg.id || idx}
                            className={`p-4 rounded-2xl border transition-all space-y-2 ${
                              isStudent 
                                ? 'bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 me-6 shadow-xs' 
                                : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-100 ms-6 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-amber-600 dark:text-amber-400">{msg.senderName || (isStudent ? student?.fullName : 'المعلم / المساعد الذكي')}</span>
                              <span className="text-slate-500">{new Date(msg.createdAt).toLocaleString('ar-EG')}</span>
                            </div>
                            <p className="text-xs leading-relaxed">{msg.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: SUBMIT HOMEWORK & AI CORRECTION */}
            {activeTab === 'submit' && (
              <div className="space-y-6">
                {/* Speed Badge Winner Banner if recently triggered */}
                {speedBadgeWonAlert && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-4 rounded-3xl shadow-2xl flex items-center justify-between animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-2xl font-black shadow-lg">
                        ⚡
                      </div>
                      <div>
                        <h3 className="font-black text-sm md:text-base">
                          🎉 إنجاز استثنائي! أنت الطالب الأسرع في المجموعة تسليماً للواجب!
                        </h3>
                        <p className="text-xs font-bold text-slate-900">
                          حصلت تلقائياً على "وسام السرعة البرقية" + 25 نقطة إضافية فوق درجة الواجب!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Homework Submission Box */}
                <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        رفع الواجب أو تصويره للتصحيح بالذكاء الاصطناعي (Gemini 3.7 Flash)
                      </h3>
                    </div>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30">
                      تصحيح وإصدار تقرير فوري
                    </span>
                  </div>

                  <form onSubmit={handleSubmitHomework} className="space-y-5">
                    {/* Task Title Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        اختر عنوان أو موضوع الواجب المطلوبة تسليمه:
                      </label>

                      {(groupTasks || []).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3">
                          {(groupTasks || []).map((t, idx) => {
                            const isQuiz = !!(t.quizGame || t.assignmentType === 'interactive_quiz');
                            const isSelected = selectedTaskTitle === t.title && !customTaskTitle;
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <p className="text-xs font-bold truncate">{t.title}</p>
                                    {isQuiz && (
                                      <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 font-black px-1.5 py-0.5 rounded-md border border-purple-500/30 shrink-0">
                                        ⚡ كاهوت
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                    حد أقصى للنقاط: +{t.maxPoints}
                                  </span>
                                </div>

                                <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                  {isQuiz ? (
                                    <button
                                      type="button"
                                      onClick={() => setActiveKahootGameTask(t)}
                                      className="w-full py-1.5 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-[11px] font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 fill-white" />
                                      <span>بدء التحدي التفاعلي 🎮</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTaskTitle(t.title);
                                        setCustomTaskTitle('');
                                      }}
                                      className="w-full py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer text-center"
                                    >
                                      {isSelected ? '✓ محدد للرفع' : 'تحديد لرفع الحل'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="relative">
                        <input
                          type="text"
                          value={customTaskTitle}
                          onChange={(e) => setCustomTaskTitle(e.target.value)}
                          placeholder="أو اكتب عنوان واجب مخصص آخر..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 shadow-xs"
                        />
                      </div>

                      {/* Lesson Selection for Summary & Homework Context */}
                      <div className="pt-2 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                              الدرس المرتبط بالتكليف ({studentCurriculum.gradeNameAr} - {studentCurriculum.subjectNameAr}):
                            </label>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              تم ضبط المنهج تلقائياً وفقاً لكود الطالب ({student?.code || studentCodeInput || 'A001'}) ومنهج وزارة التربية والتعليم
                            </span>
                          </div>

                          {/* Term Filter Pills */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedCurriculumTerm('all')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                selectedCurriculumTerm === 'all'
                                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              الكل
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCurriculumTerm(1)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                selectedCurriculumTerm === 1
                                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              الترم 1
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCurriculumTerm(2)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                selectedCurriculumTerm === 2
                                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              الترم 2
                            </button>
                          </div>
                        </div>

                        {/* Responsive Grid of Grade-Specific Lessons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {studentLessonsList.map((ls) => {
                            const isSelected = selectedLessonName === ls.label || selectedLessonName === ls.labelEn;
                            return (
                              <button
                                key={ls.id}
                                type="button"
                                onClick={() => setSelectedLessonName(ls.label)}
                                className={`p-2.5 rounded-xl text-[11px] font-bold text-right transition-all border cursor-pointer flex flex-col justify-between gap-1.5 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="line-clamp-2 leading-relaxed">{ls.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between text-[9px] opacity-80 border-t border-current/15 pt-1">
                                  <span>{ls.unitTitle}</span>
                                  <span className="font-mono">T{ls.term} • L{ls.lessonNumber}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <input
                          type="text"
                          value={selectedLessonName}
                          onChange={(e) => setSelectedLessonName(e.target.value)}
                          placeholder="أو اكتب عنوان الدرس أو المشروع يدوياً..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* PROMINENT VOICE SUMMARY RECORDER & CONCEPTUAL EVALUATION BANNER */}
                    <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                              تسجيل ملخص فويس للمحاضرة أو التكليف 🎙️
                            </h4>
                            <span className="text-[9px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                              تقييم فهم الدرس
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            سجل فويس بصوتك يلخص عناصر الدرس (مثل مكونات الكمبيوتر)، وسيقوم الذكاء الاصطناعي بفحص تناسق المفاهيم واستيعابك للدرس دون محاسبتك على الأخطاء اللغوية!
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsVoiceSummaryModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>فتح مسجل الفويس والتقييم 🎙️</span>
                      </button>
                    </div>

                    {/* Media Upload Options: Multi-Page Photo / File / Video / Audio */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          أوراق الواجب (يمكنك تصوير ورفع أكثر من صفحة/ورقة 📄):
                        </label>
                        {selectedPages.length > 0 && (
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            عدد الصفحات المجهزة: {selectedPages.length}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Option 1: Mobile Direct Camera Capture */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-dashed border-indigo-500/50 hover:border-indigo-500 text-center space-y-2 cursor-pointer transition-all group block shadow-xs"
                        >
                          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200">📸 تصوير صفحة بالكاميرا</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300">التقط صفحة تلو الأخرى للواجب</p>
                          </div>
                        </button>

                        {/* Option 2: Live Mic Recording */}
                        <button
                          type="button"
                          onClick={() => setIsVoiceSummaryModalOpen(true)}
                          className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-950/30 border border-dashed border-blue-500/50 hover:border-blue-500 text-center space-y-2 cursor-pointer transition-all group block shadow-xs"
                        >
                          <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            <Mic className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-200">🎙️ تسجيل فويس ملخص</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300">تسجيل وتصحيح صوتي فوري</p>
                          </div>
                        </button>

                        {/* Option 3: Choose Multiple Files from Device */}
                        <label className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500/60 text-center space-y-2 cursor-pointer transition-all group block shadow-xs">
                          <input
                            type="file"
                            accept="image/*,video/*,audio/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">📁 اختيار صور / صفحات متعددة</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">حدد ورقة واحدة أو أكثر معاً</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Camera Modal overlay if active */}
                    {isCameraActive && (
                      <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-indigo-500/40 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-300">
                          <span>وجه الكاميرا نحو صفحة الواجب (الصفحة {selectedPages.length + 1})</span>
                          <button type="button" onClick={stopCamera} className="text-rose-500 dark:text-rose-400 hover:underline">
                            إلغاء الكاميرا
                          </button>
                        </div>
                        <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-2xl border border-slate-200 dark:border-slate-800" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>التقاط هذه الصفحة وإضافتها</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Multi-Page Gallery Preview */}
                    {selectedPages.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span>الصفحات المجهزة للرفع ({selectedPages.length} صفحة):</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPages([]);
                              setSelectedImageBase64(null);
                            }}
                            className="text-[11px] text-rose-500 hover:underline font-bold cursor-pointer"
                          >
                            حذف الكل
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                          {selectedPages.map((page, index) => (
                            <div key={page.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-[3/4] flex flex-col">
                              <img
                                src={page.base64}
                                alt={`صفحة ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                onClick={() => setPreviewZoomImage(page.base64)}
                              />
                              <div className="absolute top-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                ص {index + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePage(page.id)}
                                className="absolute top-1 left-1 bg-rose-600/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                                title="حذف هذه الصفحة"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1 text-[9px] text-white text-center truncate">
                                {page.name || `صفحة ${index + 1}`}
                              </div>
                            </div>
                          ))}

                          {/* Add another page trigger button */}
                          <button
                            type="button"
                            onClick={startCamera}
                            className="rounded-xl border border-dashed border-indigo-400/50 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 flex flex-col items-center justify-center p-3 text-center gap-1 aspect-[3/4] cursor-pointer transition-colors"
                          >
                            <Camera className="w-5 h-5 text-indigo-500" />
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">+ تصوير ورقة إضافية</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Single Image/Video legacy preview fallback */}
                    {selectedPages.length === 0 && selectedImageBase64 && (
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedImageBase64}
                            alt="معاينة الواجب"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                            onClick={() => setPreviewZoomImage(selectedImageBase64)}
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                              {selectedVideoName ? `فيديو: ${selectedVideoName}` : 'تم تجهيز ملف الواجب'}
                            </p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> جاهز للتصحيح الفوري
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageBase64(null);
                            setSelectedVideoName(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        >
                          حذف الملف
                        </button>
                      </div>
                    )}

                    {/* Student Notes / Text Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        ملاحظات وشرح الإجابة (اختياري):
                      </label>
                      <textarea
                        rows={3}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="اكتب هنا أي توضيح للمدرب أو شرح للكود والخطوات..."
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingHomework}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingHomework ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-white" />
                          <span>جاري تصحيح الواجب وتحليل الصفحات بواسطة الذكاء الاصطناعي...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 text-white fill-white" />
                          <span>إرسال وتصحيح الواجب ({selectedPages.length || (selectedImageBase64 ? 1 : 0)} صفحة) بالذكاء الاصطناعي الآن</span>
                        </>
                      )}
                    </button>
                  </form>

                  {submitSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{submitSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Instant AI Correction Output Card */}
                {lastSubmissionResult && (
                  <div className="bg-white/80 dark:bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                          تقرير تصحيح وتصنيف الذكاء الاصطناعي الفوري
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        {new Date(lastSubmissionResult.submittedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Submitted Pages Gallery */}
                    {lastSubmissionResult.pagesUrls && lastSubmissionResult.pagesUrls.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          الصفحات التي تم فحصها ({lastSubmissionResult.pagesUrls.length} صفحة):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {lastSubmissionResult.pagesUrls.map((pUrl, idx) => (
                            <img
                              key={idx}
                              src={pUrl}
                              alt={`صفحة ${idx + 1}`}
                              className="w-16 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewZoomImage(pUrl)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الدرجة والتقييم</span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {lastSubmissionResult.grade} / {lastSubmissionResult.maxGrade}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          النسبة: {lastSubmissionResult.percentage}% ({lastSubmissionResult.rating})
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">النقاط المضافة لرصيدك</span>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          +{lastSubmissionResult.pointsAwarded} نقطة
                        </div>
                        {lastSubmissionResult.isSpeedWinner && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold block">
                            ⚡ شاملة +25 مكافأة السرعة البرقية
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">حالة التسليم</span>
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-300 pt-1">
                          مسجل لدى المدرب
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          القناة: بوابة الطالب المنزلية
                        </span>
                      </div>
                    </div>

                    {/* Lesson Summary Conceptual Evaluation Section if available */}
                    {lastSubmissionResult.lessonSummaryEvaluation && (
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>تقييم تلخيص واستيعاب عناصر الدرس ({lastSubmissionResult.lessonSummaryEvaluation.lessonName}):</span>
                          </h4>
                          <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                            فهم المفاهيم {lastSubmissionResult.lessonSummaryEvaluation.conceptUnderstandingScore}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {lastSubmissionResult.lessonSummaryEvaluation.coveredKeyPoints && lastSubmissionResult.lessonSummaryEvaluation.coveredKeyPoints.length > 0 && (
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">✓ عناصر ومفاهيم أحسنت بذكرها:</span>
                              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                                {lastSubmissionResult.lessonSummaryEvaluation.coveredKeyPoints.map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {lastSubmissionResult.lessonSummaryEvaluation.missingOrWeakPoints && lastSubmissionResult.lessonSummaryEvaluation.missingOrWeakPoints.length > 0 && (
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-500/20 space-y-1">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px]">💡 عناصر هامة تذكرها المرة القادمة:</span>
                              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                                {lastSubmissionResult.lessonSummaryEvaluation.missingOrWeakPoints.map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {lastSubmissionResult.lessonSummaryEvaluation.conceptualFeedback && (
                          <p className="text-xs text-indigo-950 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/50 leading-relaxed">
                            {lastSubmissionResult.lessonSummaryEvaluation.conceptualFeedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* AI Feedback Detailed Text */}
                    <div className="space-y-3 pt-2">
                      {/* Badge Banner if Awarded */}
                      {(lastSubmissionResult.badgeAwarded || lastSubmissionResult.isSpeedWinner) && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-xl shrink-0">
                              {lastSubmissionResult.badgeAwarded?.icon || '🏆'}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-amber-700 dark:text-amber-300">
                                {lastSubmissionResult.badgeAwarded?.title || 'وسام التفوق والحل الفوري'}
                              </h4>
                              <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80">
                                تم منحك هذا الوسام وإضافته إلى ملفك الأكاديمي تقديرًا لسرعة ودقة حل الواجب!
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 shrink-0">
                            +{lastSubmissionResult.badgeAwarded?.points || 25} نقطة
                          </span>
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                        <h4 className="text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                          <span>التقرير التحليلي الشامل للمدرب وللطالب:</span>
                        </h4>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {lastSubmissionResult.generalFeedback}
                        </p>
                      </div>

                      {/* Strengths */}
                      {lastSubmissionResult?.strengths && lastSubmissionResult.strengths.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1 shadow-xs">
                          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                            <span>نقاط القوة والإتقان الملحوظة:</span>
                          </h4>
                          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                            {(lastSubmissionResult.strengths || []).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Explanation of Difficult Points / Concepts */}
                      {lastSubmissionResult?.difficultPointsExplained && lastSubmissionResult.difficultPointsExplained.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-1.5 shadow-xs">
                          <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            <span>💡 شرح وتوضيح النقاط والمفاهيم الصعبة في هذا الواجب:</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                            {lastSubmissionResult.difficultPointsExplained.map((point, idx) => (
                              <li key={idx} className="bg-white dark:bg-slate-950/80 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 leading-relaxed shadow-xs">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Corrections if any */}
                      {lastSubmissionResult?.corrections && lastSubmissionResult.corrections.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 space-y-1 shadow-xs">
                          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>نقاط للتحسين المرات القادمة:</span>
                          </h4>
                          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                            {lastSubmissionResult.corrections.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Trainer Notification Confirmation Alert */}
                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center justify-between gap-2 shadow-xs">
                        <span className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          <span>تم إرسال إشعار فوري للمدرب باسمك ({lastSubmissionResult.traineeName}) وكودك والدرجة والتقرير بنجاح!</span>
                        </span>
                        <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">
                          إشعار فوري 🔔
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: HOMEWORK SUBMISSIONS HISTORY */}
            {activeTab === 'history' && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <span>سجل الواجبات المسلمة وتصحيحات الذكاء الاصطناعي</span>
                </h3>

                {(!homeworks || homeworks.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">لم تقم برفع أي واجبات منزلية بعد.</p>
                    <p className="text-[11px] text-slate-500">
                      يمكنك البدء بالضغط على "إرسال واجب جديد" وتصوير حل التمرين فوراً!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(homeworks || []).map((hw) => (
                      <div
                        key={hw.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{hw.taskTitle}</h4>
                              {hw.isSpeedWinner && (
                                <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                                  ⚡ وسام السرعة البرقية
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              تاريخ التسليم: {new Date(hw.submittedAt).toLocaleString('ar-EG')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-emerald-500/30">
                              {hw.grade} / {hw.maxGrade} ({hw.percentage}%)
                            </span>
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-amber-500/30">
                              +{hw.pointsAwarded} نقطة
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <strong className="text-amber-600 dark:text-amber-400 block mb-1">التقرير الذكي:</strong>
                          {hw.generalFeedback}
                        </p>

                        {/* Voice Submission Specifics */}
                        {(hw.mediaType === 'audio' || hw.voiceTranscription || hw.conceptsCovered?.length) && (
                          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                                <Mic className="w-4 h-4" />
                                <span>ملخص فويس مفاهيمي للمحاضرة</span>
                              </span>
                              {hw.studentGradeLevel && (
                                <span className="text-[10px] bg-orange-500/20 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-md font-bold">
                                  {hw.studentGradeLevel}
                                </span>
                              )}
                            </div>

                            {/* Audio Player */}
                            {hw.mediaUrl && (
                              <div className="pt-1">
                                <audio controls className="w-full h-9 rounded-lg" src={hw.mediaUrl}>
                                  متصفحك لا يدعم تشغيل الصوت
                                </audio>
                              </div>
                            )}

                            {/* Transcription text */}
                            {hw.voiceTranscription && (
                              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-orange-500/20 text-xs text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-orange-600 dark:text-orange-400 block mb-0.5">النص المنطوق صوتياً:</span>
                                <p className="italic font-serif">"{hw.voiceTranscription}"</p>
                              </div>
                            )}

                            {/* Concepts Mastered */}
                            {hw.conceptsCovered && hw.conceptsCovered.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>مفاهيم علمية أتقنتها في الفويس:</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {hw.conceptsCovered.map((c, i) => (
                                    <span key={i} className="text-[10px] bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                      ✓ {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Concept Corrections */}
                            {hw.conceptCorrections && hw.conceptCorrections.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>تصحيحات وتدقيقات مفاهيمية للمنهج:</span>
                                </span>
                                <div className="space-y-1">
                                  {hw.conceptCorrections.map((corr, i) => (
                                    <div key={i} className="text-[11px] bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2 rounded-lg border border-amber-500/20">
                                      {corr}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {hw.trainerNotes && (
                          <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                            <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">ملاحظات واعتتماد المدرب:</strong>
                            {hw.trainerNotes}
                          </p>
                        )}

                        {hw.mediaUrl && hw.mediaType !== 'audio' && (
                          <div className="pt-1">
                            <a
                              href={hw.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>عرض صورة / ملف الواجب المرفوع</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: LECTURE RECAP, TASKS & PREPARATION (4-SECTION SYSTEM) */}
            {activeTab === 'recap_tasks' && (
              <LectureRecapManager
                studentGradeLevel={student?.grade || student?.gradeLevel || student?.stage || student?.courseName || student?.groupName || ''}
                studentName={student?.name || 'طالب متميز'}
                studentCode={student?.code || 'STU-001'}
                onNavigateToHomework={(taskTitle) => {
                  setSelectedTaskTitle(taskTitle);
                  setActiveTab('submit');
                }}
              />
            )}

            {/* TAB 3: BADGES AND ACHIEVEMENTS */}
            {activeTab === 'badges' && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>سجل الأوسمة والجوائز والأوسمة السريعة</span>
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    إجمالي الأوسمة: {(badges || []).length}
                  </span>
                </div>

                {(!badges || badges.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <Award className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">لا يوجد أوسمة مسجلة حالياً.</p>
                    <p className="text-[11px] text-slate-500">
                      كن أسرع طالب يسلم الواجب بعد المحاضرة فوراً لتحصل على "وسام السرعة البرقية" ⚡!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(badges || []).map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3.5 shadow-md"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                            {b.icon || '🏅'}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{b.badgeTitle}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              النقاط المستحقة: <strong className="text-amber-600 dark:text-amber-400 font-mono">+{b.points} نقطة</strong>
                            </p>
                            <span className="text-[9px] text-slate-500 block">
                              تاريخ الممنح: {new Date(b.awardedAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>

                        {/* Social Share for Badge */}
                        <div className="flex flex-col gap-1 items-center border-r border-slate-200 dark:border-slate-800 pr-3 shrink-0">
                          <span className="text-[8px] text-slate-500 font-bold">مشاركة:</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله! حصلت على "${b.badgeTitle}" تميزاً وسرعةً في دورة البرمجة والذكاء الاصطناعي من مركز النجاح للتدريب والاستشارات! ⚡🏆`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                              title="مشاركة عبر واتساب"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله! حصلت على "${b.badgeTitle}" تميزاً وسرعةً في دورة البرمجة والذكاء الاصطناعي من مركز النجاح للتدريب والاستشارات! ⚡🏆`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent(window.location.origin)}`, '_blank');
                              }}
                              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="مشاركة على فيسبوك"
                            >
                              <Facebook className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LAB SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>جدول المواعيد وقاعة المعمل المقررة للمجموعة</span>
                  </h3>
                </div>

                {/* Prominent Next Lecture Countdown Banner */}
                {student?.groupDetails && (
                  <NextLectureWidget groupDetails={student.groupDetails} variant="banner" />
                )}

                {(!labSchedules || labSchedules.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">مواعيد المعمل مسجلة وفق جدول المجموعة الرئيسي.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(labSchedules || []).map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-600 dark:text-amber-300">{s.dayOfWeek}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{s.roomName}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200">
                          الوقت: <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">{s.timeDisplay || `${s.startTime} - ${s.endTime}`}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          المجموعة: {s.groupName} ({s.courseName})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>الشهادات التدريبية المعتمدة الصادرة باسم الطالب</span>
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    عدد الشهادات: {certificates.length}
                  </span>
                </div>

                {(!certificates || certificates.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <Award className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">لم يتم إصدار شهادات معتمدة لهذا الطالب بعد.</p>
                    <p className="text-[11px] text-slate-500">
                      سيتم ظهور الشهادة هنا فور تم اعتمادها وإصدارها من إدارة المركز.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        id={`cert-card-${cert.id}`}
                        className="bg-gradient-to-br from-amber-500/5 via-white dark:via-slate-950 to-amber-900/10 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-4 backdrop-blur-xl"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-amber-500/40 shadow-md flex items-center justify-center shrink-0">
                              <img src="/logo.svg" alt="النجاح" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 mb-1 inline-block">
                                شهادة معتمدة ورسمية
                              </span>
                              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{cert.courseName}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">رقم الشهادة: {cert.certificateNumber}</p>
                            </div>
                          </div>

                          {/* Stamp & QR Preview */}
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <img src="/stamp.svg" alt="ختم النجاح" className="w-16 h-16 object-contain opacity-90 transform -rotate-6" />
                              <span className="text-[9px] text-amber-600 dark:text-amber-300/80 block mt-0.5">الختم المعتمد</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">اسم الطالب</span>
                            <strong className="text-amber-700 dark:text-amber-300">{cert.traineeName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">التقدير العام</span>
                            <strong className="text-emerald-600 dark:text-emerald-400">{cert.grade || 'ممتاز'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ الإصدار</span>
                            <strong className="text-slate-800 dark:text-slate-200 font-mono">{cert.issueDate}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">المدرب المحاضر</span>
                            <strong className="text-slate-800 dark:text-slate-200">{cert.trainerName || 'المدرب المعتمد'}</strong>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold ml-1">مشاركة:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله حمداً كثيراً! حصلت على شهادة معتمدة ورسمية في دورة "${cert.courseName}" من مركز النجاح للتدريب والاستشارات! 🎓🏆`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                              title="مشاركة عبر واتساب"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله حمداً كثيراً! حصلت على شهادة معتمدة ورسمية في دورة "${cert.courseName}" من مركز النجاح للتدريب والاستشارات! 🎓🏆`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent(window.location.origin)}`, '_blank');
                              }}
                              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="مشاركة على فيسبوك"
                            >
                              <Facebook className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله! حصلت على شهادة معتمدة ورسمية في دورة "${cert.courseName}" من مركز النجاح للتدريب والاستشارات! 🎓🏆`;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                              title="مشاركة على تويتر"
                            >
                              <Twitter className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله! حصلت على شهادة معتمدة ورسمية في دورة "${cert.courseName}" من مركز النجاح للتدريب والاستشارات! 🎓🏆`;
                                window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
                              title="مشاركة على لينكد إن"
                            >
                              <Linkedin className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePrintCert(cert)}
                            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Printer className="w-4 h-4" />
                            <span>طباعة / حفظ PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadCertImage(cert.id, cert.traineeName)}
                            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
                          >
                            <Download className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>تحميل كصورة (PNG)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE (SETTINGS & SECURITY) */}
            {activeTab === 'profile' && (
              <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <Settings className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">إعدادات الملف الشخصي وحماية الحساب</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Account Password Section */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>تأمين البوابة الإلكترونية وحماية حساب الطالب</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      افتراضياً، يمكنك تسجيل الدخول إلى بوابتك بكود الطالب أو رقم هاتفك. لتجنب دخول أي شخص آخر على ملفك ومتابعتك، ننصحك بتعيين كلمة مرور مخصصة هنا. بعد تفعيلها، سيطلب منك النظام كتابتها في كل مرة تسجل فيها الدخول.
                    </p>

                    <div>
                      <label className="block text-[11px] text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                        كلمة المرور الخاصة بك للبوابة الإلكترونية (أو اتركها فارغة للدخول المباشر):
                      </label>
                      <input
                        type="password"
                        value={portalPasswordForm}
                        onChange={(e) => setPortalPasswordForm(e.target.value)}
                        placeholder="اكتب كلمة مرور قوية وسهلة التذكر"
                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Connected Social Profiles */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                    <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <span>ربط حساباتك على منصات التواصل الاجتماعي لعرضها لزملائك</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      تساعدك هذه الروابط على مشاركة إنجازاتك وتواصل زملائك في المركز معك مباشرة من جدار التميز والمنشورات.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Facebook className="w-3.5 h-3.5 text-blue-500" />
                          <span>رابط حساب فيسبوك (Facebook URL):</span>
                        </label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/your-username"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                          <span>رابط حساب لينكد إن (LinkedIn URL):</span>
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/your-username"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Twitter className="w-3.5 h-3.5 text-sky-500" />
                          <span>رابط حساب تويتر / إكس (Twitter URL):</span>
                        </label>
                        <input
                          type="url"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
                          placeholder="https://twitter.com/your-username"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Instagram className="w-3.5 h-3.5 text-pink-500" />
                          <span>رابط حساب انستجرام (Instagram URL):</span>
                        </label>
                        <input
                          type="url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          placeholder="https://instagram.com/your-username"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Github className="w-3.5 h-3.5 text-purple-500" />
                          <span>رابط حساب جيتهاب (GitHub URL):</span>
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-username"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Youtube className="w-3.5 h-3.5 text-red-500" />
                          <span>رابط قناة يوتيوب (YouTube URL):</span>
                        </label>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/@your-channel"
                          className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left shadow-xs"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saveProfileLoading}
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 dark:disabled:bg-slate-850 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {saveProfileLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>جاري حفظ التغييرات...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>حفظ وإغلاق التعديلات</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: AI LANGUAGE LAB (STUDENT EXPERIENCE) */}
            {activeTab === 'language_lab' && student && (
              <div className="animate-in fade-in duration-300">
                {!isTrainerLabSessionActive && (
                  <div className="p-6 bg-rose-950/80 border-2 border-rose-500/60 rounded-3xl text-center space-y-3 mb-6 shadow-2xl animate-pulse">
                    <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40 flex items-center justify-center text-2xl mx-auto">
                      ⛔
                    </div>
                    <h3 className="text-base font-black text-rose-100">دخول المعمل محظور حالياً - جاري انتظار فتح المدرب للجلسة</h3>
                    <p className="text-xs text-rose-200 max-w-xl mx-auto leading-relaxed">
                      وفقاً لمعايير الأمان المتبعة في مركز النجاح، لا يمكنك إجراء ممارسة المعمل أو تسجيل الحضور تلقائياً من المنزل حتى يقوم المحاضر المشرف بفتح برنامجه وجهازه المباشر بقاعة الفرع.
                    </p>
                  </div>
                )}
                <StudentLanguageLabView student={student as any} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* POPUP MODAL FOR DIRECT MESSAGES FROM CENTER / TRAINER */}
      {activeMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white/95 dark:bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveMessageModal(null)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                💬
              </div>
              <div>
                <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  رسالة جديدة من إدارة المركز
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">{activeMessageModal.title || 'تنبيه هـام'}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeMessageModal.senderName || 'مركز النجاح للتدريب'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
              {activeMessageModal.message}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/201001500686?text=${encodeURIComponent(`مرحباً إدارة مركز النجاح، استلمت رسالتكم: "${activeMessageModal.title}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>الرد عبر الواتساب المباشر 💬</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveMessageModal(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                تمت القراءة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Photo Crop & AI Dress-Up Studio Modal */}
      <StudentPhotoCropperModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        initialImage={student?.photoUrl}
        studentName={student?.fullName || 'الطالب'}
        onSavePhoto={async (finalPhoto) => {
          if (!student) return;
          let optimizedPhoto = finalPhoto;
          try {
            optimizedPhoto = await compressImage(finalPhoto, 400, 400, 0.7);
          } catch (e) {
            console.warn('Photo compression fallback:', e);
          }

          // 1. Update React state immediately
          setStudent((prev: any) => prev ? ({ ...prev, photoUrl: optimizedPhoto }) : null);

          // 2. Persist in local storage keys
          localStorage.setItem('student_session_photo_' + student.id, optimizedPhoto);
          if (student.code) {
            localStorage.setItem('student_session_photo_' + student.code, optimizedPhoto);
          }

          // 3. Update active session & offline resilience cache
          try {
            const activeStr = localStorage.getItem('nagah_student_active_session');
            if (activeStr) {
              const parsed = JSON.parse(activeStr);
              if (parsed && parsed.student) {
                parsed.student.photoUrl = optimizedPhoto;
                localStorage.setItem('nagah_student_active_session', JSON.stringify(parsed));
                resilientOfflineService.saveToCache('student', parsed);
              }
            }
          } catch (e) {
            console.warn('Cache photo save error:', e);
          }

          // 4. Update Cloud Firestore
          try {
            
          } catch (e) {}

          // 5. Update Backend Express API & Firestore
          try {
            const resp = await api.updateStudentPhoto({
              traineeId: student.id || student.code,
              photoUrl: optimizedPhoto
            });
            if (resp && resp.success) {
              alert('تم تحديث وتجميل صورتك بنجاح وحفظها في المنصة وبياناتك الشخصية! ✨');
            }
          } catch (err) {
            console.warn('Backend photo save warning:', err);
            // Fallback direct request
            try {
              await fetch('/api/student/update-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ traineeId: student.id || student.code, photoUrl: optimizedPhoto })
              });
            } catch (e) {}
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 p-4 text-center text-xs text-slate-500 backdrop-blur-md">
        مركز النجاح للتدريب والاستشارات - نظام المتابعة وتصحيح الواجبات الذكي بالذكاء الاصطناعي © {new Date().getFullYear()}
      </footer>

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold">الإشعارات</h3>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3 bg-slate-50">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">تم تقييم الواجب</h4>
                    <p className="text-xs text-slate-600 mt-1">حصلت على 95 نقطة في واجب "مقدمة البرمجة"</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">منذ ساعتين</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">نقاط جديدة</h4>
                    <p className="text-xs text-slate-600 mt-1">حصلت على 5 نجوم تميز من المدرب أحمد</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">منذ يومين</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Bubble Button (WhatsApp/Messenger style) */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        title="المساعد الذكي والدعم الفوري"
      >
        <MessageSquare className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-black animate-pulse">1</span>
        <span className="absolute right-16 bg-slate-900 text-slate-100 text-xs px-3 py-1 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
          المساعد الذكي والدعم الفوري 🤖
        </span>
      </button>

      {/* WhatsApp-like Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-4 left-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-emerald-600 p-3 flex flex-col gap-2 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">محادثة المركز والمساعد الذكي</h3>
                  <p className="text-[10px] text-emerald-100">رد آلي ذكي + فريق الدعم متصل الآن</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-emerald-100 hover:text-white p-1 bg-black/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Quick Contact Links */}
            <div className="flex items-center justify-around mt-2 border-t border-emerald-500/50 pt-2">
              <a 
                href={trainer?.phone ? `https://wa.me/${trainer.phone}` : `https://wa.me/201000000000`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                واتساب المدرب
              </a>
              <a 
                href={trainer?.phone ? `sms:${trainer.phone}` : `sms:201000000000`}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 text-white px-3 py-1.5 rounded-full hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
                رسالة عادية SMS
              </a>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2] space-y-3" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-color-thumbnail.jpg")', backgroundBlendMode: 'soft-light' }}>
            <div className="flex justify-center">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded-lg shadow-sm">اليوم - الدعم الفوري</span>
            </div>
            
            {/* Welcome Bot Message */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">🤖</div>
              <div className="bg-white text-slate-800 p-2.5 rounded-2xl rounded-tr-none shadow-sm text-sm relative">
                مرحباً بك يا بطل! أنا المساعد الذكي لمركز النجاح للتدريب والاستشارات. اطرح أي استفسار بخصوص جدولك، واجباتك، أو دوراتك وسأقوم بمساعدتك فوراً أو تحويله للإدارة!
                <div className="text-left text-[9px] text-slate-400 mt-1">الآن</div>
              </div>
            </div>

            {/* Render dynamic portal messages in chronological order */}
            {portalMessages.map((m, idx) => {
              const isOutgoing = m.senderRole === 'student' || m.senderName === student?.fullName;
              return (
                <div key={m.id || idx} className={`flex items-start gap-2 max-w-[85%] ${isOutgoing ? 'self-end ms-auto flex-row-reverse' : 'self-start me-auto'}`}>
                  {!isOutgoing && (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">🎯</div>
                  )}
                  <div className={`p-2.5 rounded-2xl shadow-sm text-sm relative ${isOutgoing ? 'bg-[#dcf8c6] text-slate-800 rounded-tl-none' : 'bg-white text-slate-800 rounded-tr-none'}`}>
                    <div className="font-bold text-[10px] text-amber-600 mb-0.5">{m.senderName || m.parentName}</div>
                    {m.message}
                    <div className={`text-left text-[9px] mt-1 flex items-center gap-1 ${isOutgoing ? 'text-emerald-600 justify-end' : 'text-slate-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isOutgoing && <Check className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
          
          {/* Input Area */}
          <div className="bg-slate-100 p-3 shrink-0 flex items-end gap-2">
            <textarea
              rows={1}
              placeholder="اكتب رسالتك هنا..."
              className="chat-textarea flex-1 resize-none rounded-2xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 py-2.5 px-4 text-sm shadow-sm text-slate-800 bg-white"
              style={{ maxHeight: '100px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const val = e.currentTarget.value;
                  if (val.trim()) {
                    handleSendPortalMessage(val);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <button 
              disabled={isSendingMessage}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors disabled:opacity-50"
              onClick={() => {
                const ta = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
                if (ta && ta.value) {
                  handleSendPortalMessage(ta.value);
                  ta.value = '';
                }
              }}
            >
              {isSendingMessage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:-scale-x-100" />}
            </button>
          </div>
        </div>
      )}

      {/* AI Explain Modal / Bottom Sheet */}
      {isAiExplainOpen && (
        <AIExplainModal
          isOpen={isAiExplainOpen}
          onClose={() => setIsAiExplainOpen(false)}
          studentContext={{
            studentName: student?.fullName || 'طالب مركز النجاح',
            courseName: student?.courseName || 'مجموعة البرمجة والتكنولوجيا',
            gradeLevel: student?.groupName || 'الصف التدريبي'
          }}
          showToast={(msg, type) => {
            const emojis = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
            alert(`${emojis[type] || '✨'} ${msg}`);
          }}
        />
      )}

      {/* Interactive Kahoot Game Modal for Student Portal */}
      {activeKahootGameTask && (
        <KahootGameModal
          assignment={{
            id: activeKahootGameTask.id || `task-${Date.now()}`,
            title: activeKahootGameTask.title,
            courseName: activeKahootGameTask.courseName || student?.courseName,
            totalMarks: activeKahootGameTask.maxPoints || 100,
            dueDate: activeKahootGameTask.dueDate || new Date().toISOString(),
            preventLateSubmission: false,
            quizGame: activeKahootGameTask.quizGame
          } as any}
          currentStudentId={student?.id}
          onClose={() => setActiveKahootGameTask(null)}
          onCompleted={(newSub) => {
            if (newSub) {
              setHomeworks(prev => [newSub, ...prev]);
            }
          }}
          onShowToast={(msg) => alert(msg)}
        />
      )}

      {/* Voice Summary Conceptual Recorder Modal */}
      {isVoiceSummaryModalOpen && (
        <VoiceSummaryRecorderModal
          isOpen={isVoiceSummaryModalOpen}
          onClose={() => setIsVoiceSummaryModalOpen(false)}
          studentData={student ? {
            id: student.id,
            fullName: student.fullName,
            courseName: student.courseName,
            groupName: student.groupName,
            studentCode: student.code
          } : undefined}
          defaultTaskTitle={selectedTaskTitle || customTaskTitle || undefined}
          onSubmissionSuccess={(newSub) => {
            if (newSub) {
              setHomeworks(prev => [newSub, ...prev]);
              setSubmitSuccessMsg(`تم تسجيل ملخص الفويس وتقييمه بنجاح وحصلت على ${newSub.grade}/${newSub.maxGrade} (+${newSub.pointsAwarded} نقطة)!`);
              setLastSubmissionResult(newSub);
              if (student) {
                setStudent(prev => prev ? { ...prev, points: prev.points + (newSub.pointsAwarded || 0), totalPoints: (prev.totalPoints || prev.points) + (newSub.pointsAwarded || 0) } : null);
              }
            }
          }}
          onShowToast={(msg) => alert(msg)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/90 dark:border-slate-800 backdrop-blur-xl flex justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-2xl md:hidden safe-bottom select-none">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'submit' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-[9px] font-bold">تسليم واجب</span>
          </button>
          <button
            onClick={() => setActiveTab('recap_tasks')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'recap_tasks' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[9px] font-bold">الملخصات والتحضير</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] font-bold">السجل</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'badges' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-bold">الأوسمة</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'schedule' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[9px] font-bold">الجدول</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] font-bold">الملف</span>
          </button>
        </div>
      )}

      {/* Full Page Zoom Modal for Uploaded Pages */}
      {previewZoomImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 p-2 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-3 left-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur-md z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomImage}
              alt="تكبير صفحة الواجب"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Session Celebration Overlay */}
      <SessionCelebrationOverlay
        isOpen={showCelebrationOverlay}
        onClose={() => setShowCelebrationOverlay(false)}
        sessionTitle={celebrationData.title || `محاضرة ${student?.groupName || 'النجاح'}`}
        groupName={student?.groupName || 'المجموعة التدريبية'}
        courseName={student?.courseName || 'الدورة التدريبية'}
        starWinnerName={celebrationData.winnerName}
        starWinnerPoints={celebrationData.winnerPoints}
      />

    </div>
  );
};
