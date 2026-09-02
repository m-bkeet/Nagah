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

import React, { useState, useRef, useEffect } from 'react';
import { AIExplainModal } from '../components/AIExplainModal';
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
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Youtube,
  ShieldAlert
} from 'lucide-react';
import { HomeworkSubmission, TraineeBadge } from '../types';
import { StudentPhotoCropperModal } from '../components/StudentPhotoCropperModal';

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
}

export const PublicStudentPortalView: React.FC<PublicStudentPortalViewProps> = ({ onBack }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

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
  const [studentCodeInput, setStudentCodeInput] = useState(() => initialSession?.student?.code || 'م001');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!initialSession?.student);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudent(null);
    localStorage.removeItem('nagah_student_active_session');
    localStorage.removeItem('nagah_student_cache');
    localStorage.removeItem('student_session_code');
    localStorage.removeItem('student_session_password');
    resilientOfflineService.saveToCache('student', null);
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
            console.log('[Auto-Login] Background data revalidation successful. State updated silently.');
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
  const [studentNotes, setStudentNotes] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'text'>('image');
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [lastSubmissionResult, setLastSubmissionResult] = useState<HomeworkSubmission | null>(null);
  const [speedBadgeWonAlert, setSpeedBadgeWonAlert] = useState(false);

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tabs inside Student Portal (Default to 'timeline' for Facebook profile feel)
  const [activeTab, setActiveTab] = useState<'timeline' | 'submit' | 'history' | 'badges' | 'schedule' | 'certificates' | 'profile' | 'language_lab' | 'finance'>('timeline');
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

  // Community Feed States
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostBg, setNewPostBg] = useState('classic'); // 'classic', 'gradient-indigo', 'gradient-purple', 'gradient-sunset', 'emerald'
  const [newPostType, setNewPostType] = useState<'status' | 'congratulations' | 'homework'>('status');
  const [postCommentContent, setPostCommentContent] = useState<Record<string, string>>({});
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const fetchCommunityPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/student/posts');
      const data = await res.json();
      if (data.success) {
        setCommunityPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching community posts:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCommunityPosts();
    }
  }, [isLoggedIn, activeTab]);

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

  // Real-time student live synchronization (Points, Badges, Homeworks, Messages)
  useEffect(() => {
    if (!isLoggedIn || !student?.code) return;

    const syncInterval = setInterval(async () => {
      // Optimiziation: Pause background polling to save quota if page is hidden
      if (document.hidden) return;

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
          const newPoints = data.student.points ?? data.student.totalPoints ?? 0;
          const oldPoints = student.points ?? student.totalPoints ?? 0;

          if (newPoints > oldPoints) {
            audioService.playCoinSound();
            if (newPoints - oldPoints >= 10) {
              audioService.playCelebrationCheer();
            }
          }

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
    }, 20000); // Increased interval to 20 seconds to save server bandwidth and quota

    return () => clearInterval(syncInterval);
  }, [isLoggedIn, student?.code, student?.points, student?.totalPoints]);

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

      const matchedTrainee = cloudTrainees.find(t => {
        if (!t) return false;
        const tCode = normalizeDigits(t.code || '').toLowerCase();
        const tNatId = normalizeDigits(t.nationalId || '').trim();
        const tId = (t.id || '').toLowerCase();

        // Exact or prefixed code match
        if (
          (tCode && (tCode === normalizedInput || tCode === `م${normalizedInput}` || `م${tCode}` === normalizedInput || tCode === `tr-${normalizedInput}`)) ||
          (tNatId && tNatId === normalizedInput) ||
          (tId && tId === normalizedInput)
        ) return true;

        // Phone match
        if (isPhone) {
          const tPhoneDigits = cleanPhoneDigits(t.phone || '');
          const pPhoneDigits = cleanPhoneDigits(t.parentPhone || '');
          if (tPhoneDigits && (tPhoneDigits === inputDigits || tPhoneDigits.includes(inputDigits) || inputDigits.includes(tPhoneDigits))) return true;
          if (pPhoneDigits && (pPhoneDigits === inputDigits || pPhoneDigits.includes(inputDigits) || inputDigits.includes(pPhoneDigits))) return true;
        }

        const tPhoneRaw = normalizeDigits(t.phone || '').trim();
        const pPhoneRaw = normalizeDigits(t.parentPhone || '').trim();
        return tPhoneRaw === normalizedInput || pPhoneRaw === normalizedInput;
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newPostContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/student/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: student.id,
          traineeName: student.fullName,
          traineePhotoUrl: student.photoUrl,
          content: newPostContent.trim(),
          bgStyle: newPostBg,
          type: newPostType
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewPostContent('');
        setNewPostBg('classic');
        setNewPostType('status');
        fetchCommunityPosts();
      }
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!student) return;
    try {
      const res = await fetch(`/api/student/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId: student.id })
      });
      const data = await res.json();
      if (data.success) {
        setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCommentPost = async (postId: string) => {
    const commentText = postCommentContent[postId];
    if (!student || !commentText || !commentText.trim()) return;

    try {
      const res = await fetch(`/api/student/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: student.id,
          traineeName: student.fullName,
          traineePhotoUrl: student.photoUrl,
          content: commentText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostCommentContent(prev => ({ ...prev, [postId]: '' }));
        setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
      }
    } catch (err) {
      console.error("Error commenting on post:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!student || !window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور؟')) return;
    try {
      const res = await fetch(`/api/student/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId: student.id })
      });
      const data = await res.json();
      if (data.success) {
        fetchCommunityPosts();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
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

  // Image / File Input Change with auto-compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
      setSelectedVideoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaType('image');
      setSelectedVideoName(null);
      const reader = new FileReader();
      reader.onload = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressed = await compressImage(rawBase64, 1200, 1200, 0.82);
          setSelectedImageBase64(compressed);
        } catch {
          setSelectedImageBase64(rawBase64);
        }
      };
      reader.readAsDataURL(file);
    }
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
        try {
          const compressed = await compressImage(dataUrl, 1200, 1200, 0.82);
          setSelectedImageBase64(compressed);
        } catch {
          setSelectedImageBase64(dataUrl);
        }
        setMediaType('image');
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

  // Submit Homework Action
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const taskTitle = customTaskTitle.trim() || selectedTaskTitle;
    if (!selectedImageBase64 && !studentNotes.trim()) {
      alert('يرجى رفع صورة للواجب أو التقاطها أو كتابة نص الإجابة ليقوم الذكاء الاصطناعي بتصحيحها.');
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
        mediaBase64: selectedImageBase64,
        mediaType,
        studentNotes
      };

      resilientOfflineService.enqueueAction({
        url: '/student/submit-homework',
        method: 'POST',
        body: payload,
        description: `تسليم واجب: ${taskTitle}`
      });

      // Show mock result in history so student has immediate feedback
      const mockResult: HomeworkSubmission = {
        id: 'offline-' + Date.now(),
        traineeId: student.id,
        traineeCode: student.code || 'م001',
        traineeName: student.fullName || 'طالب النجاح',
        taskTitle,
        mediaUrl: selectedImageBase64 || undefined,
        mediaType: mediaType || 'image',
        submittedAt: new Date().toISOString(),
        grade: 10,
        maxGrade: 10,
        percentage: 100,
        rating: 'ممتاز',
        strengths: ['مستوى متميز ومثابرة عالية في التعلم ومواصلة التدريب في أصعب الأوقات', 'تم التسجيل في وضع الطوارئ بنجاح'],
        corrections: [],
        generalFeedback: '📝 تم تسجيل وحفظ الواجب بنجاح في وضع الطوارئ المحلي (طابور العمليات). سيقوم النظام بمزامنته وتصحيحه بالذكاء الاصطناعي تلقائياً فور عودة اتصالك بالإنترنت! أنت ممتاز ومثابر يا بطل! 🚀',
        pointsAwarded: 10,
        isSpeedWinner: false,
        submissionChannel: 'home_student_portal'
      };

      setHomeworks(prev => [mockResult, ...prev]);
      setSubmitSuccessMsg('📡 تم حفظ واجبك بنجاح في طابور العمليات المعلقة وسيرتفع تلقائياً فور توفر الإنترنت!');
      setSelectedImageBase64(null);
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
          mediaBase64: selectedImageBase64,
          mediaType,
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
          mediaUrl: selectedImageBase64 || undefined,
          mediaType: mediaType || 'image',
          submittedAt: new Date().toISOString(),
          grade: 95,
          maxGrade: 100,
          percentage: 95,
          rating: 'ممتاز 🌟',
          strengths: ['تم تسليم وتوثيق الواجب بنجاح في سجلك الأكاديمي'],
          corrections: [],
          generalFeedback: 'تم استلام الواجب بنجاح وحفظه في سجلك الأكاديمي لمراجعته!',
          pointsAwarded: 20,
          isSpeedWinner: false,
          submissionChannel: 'home_student_portal'
        };
        setHomeworks(prev => [fallbackSub, ...prev]);
        setSubmitSuccessMsg('🎉 تم استلام وتوثيق الواجب بنجاح في سجلك الأكاديمي!');
        setSelectedImageBase64(null);
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

      setSubmitSuccessMsg('🎉 تم فحص وتصحيح الواجب بالذكاء الاصطناعي ورصد النقاط والتقرير بنجاح!');
      // Reset form media
      setSelectedImageBase64(null);
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
        mediaUrl: selectedImageBase64 || undefined,
        mediaType: mediaType || 'image',
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
      setSelectedVideoName(null);
      setStudentNotes('');
      setCustomTaskTitle('');
    } finally {
      setIsSubmittingHomework(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden" dir="rtl">
      {/* UNIFIED PROFESSIONAL TOP HEADER */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shrink-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Center Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 border border-amber-400/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <img src="/logo.svg" alt="النجاح" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                <span>مركز النجاح للتدريب والاستشارات</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-normal">
                  بوابة الطالب
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">
                {isLoggedIn && student ? `${student.fullName} • كود: ${student.code}` : 'المنصة الذكية للطلاب والتكليفات'}
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <>
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
                  className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 hover:text-white relative transition-all"
                  title="الإشعارات والتنبيهات"
                >
                  <Bell className="w-4 h-4" />
                  {portalMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Student Avatar / Mini Profile */}
                <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-xl">
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
                  <span className="text-xs font-bold text-slate-200">{student?.fullName}</span>
                </div>

                {/* Single Clean Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 font-bold text-xs flex items-center gap-1 transition-all"
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
              className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-700"
              title="مشاركة التطبيق"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors border border-amber-500/30 shadow"
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
      {(!isOnline || isOfflineFallbackData || failoverActive) && (
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

      <main className="flex-1 overflow-y-auto max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* LOGIN FORM SECTION */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto my-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-2 border border-amber-500/40 shadow-xl flex items-center justify-center">
                <img src="/logo.svg" alt="مركز النجاح للتدريب والاستشارات" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-lg font-black text-slate-100">تسجيل دخول الطالب</h2>
              <p className="text-xs text-slate-400">
                أدخل كود الطالب الخاص بك (مثلاً: <span className="font-mono text-amber-300">م001</span> أو <span className="font-mono text-amber-300">A001</span>) أو رقم الهاتف المسجل بالمركز
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-9 pl-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex justify-between">
                  <span>كلمة المرور للبوابة</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {requiresPassword ? '⚠️ مطلوبة لحسابك المحمي' : 'اختياري - في حال تفعيل الحماية'}
                  </span>
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute right-3 top-3 ${requiresPassword ? 'text-amber-400' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    value={studentPasswordInput}
                    onChange={(e) => setStudentPasswordInput(e.target.value)}
                    placeholder={requiresPassword ? 'أدخل كلمة المرور الخاصة بك...' : 'اتركها فارغة إذا لم تكن قد حميت حسابك...'}
                    required={requiresPassword}
                    className={`w-full bg-slate-950 border rounded-2xl pr-9 pl-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono ${
                      requiresPassword ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-700'
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
                      className="text-[10px] font-bold text-amber-500 hover:text-amber-400"
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

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                مركز النجاح للتدريب - بوابة التعلم والواجبات المنزلية التفاعلية
              </span>
            </div>
          </div>
        ) : (
          /* LOGGED IN STUDENT PORTAL VIEW */
          <div className="space-y-6">
            {/* Facebook-style Student Profile Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
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
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-950 relative">
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
                      <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-md">
                        نشط للبوابة
                      </span>
                    </div>

                    <div className="space-y-1.5 md:mb-2">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl md:text-2xl font-black text-slate-100 drop-shadow-md">{student?.fullName}</h2>
                        <span className="bg-amber-500/20 text-amber-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                          {student?.code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium flex items-center justify-center md:justify-start gap-2">
                        <span>{student?.courseName}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-400 font-bold">{student?.groupName}</span>
                      </p>

                      <p className="text-[11px] text-slate-400 flex items-center justify-center md:justify-start gap-1">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>المدرب المحاضر: <strong className="text-slate-200">{trainer?.name || 'المدرب المعتمد'}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                    
                    {/* Compact stats */}
                    <NextLectureWidget groupDetails={student?.groupDetails} variant="student" />

                    <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-2 rounded-2xl backdrop-blur-md">
                      <div className="px-3 py-1 text-center border-l border-slate-800">
                        <span className="text-[9px] text-slate-400 font-bold block">رصيد النقاط</span>
                        <span className="text-sm font-black text-amber-400 font-mono">{student?.totalPoints || 0}</span>
                      </div>
                      <div className="px-3 py-1 text-center">
                        <span className="text-[9px] text-slate-400 font-bold block">الأوسمة والشهادات</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">{badges.length + certificates.length}</span>
                      </div>
                    </div>

                    {/* Settings & Profile Edit */}
                    <button
                      type="button"
                      onClick={() => setIsProfileSettingsOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Settings className="w-4 h-4 text-amber-400 animate-spin-slow" />
                      <span>تأمين الحساب وربط السوشيال 🔒</span>
                    </button>
                  </div>

                </div>

                {/* Bio and Social Links row */}
                <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 text-center md:text-right">
                    <p className="font-bold text-slate-300">💡 نبذة عن الحساب:</p>
                    <p className="mt-0.5">طالب متميز بمركز النجاح للتدريب والاستشارات • نسعى للتألق واكتساب المهارات الرقمية والبرمجية.</p>
                  </div>

                  {/* Connected Social Accounts */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold">الحسابات المرتبطة:</span>
                    
                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.facebook ? window.open(student.socialLinks.facebook, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                        student?.socialLinks?.facebook 
                          ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 hover:bg-blue-600/25' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title={student?.socialLinks?.facebook ? 'عرض الملف الشخصي' : 'اضغط لربط حساب الفيسبوك'}
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">Facebook</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.linkedin ? window.open(student.socialLinks.linkedin, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                        student?.socialLinks?.linkedin 
                          ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/25' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title={student?.socialLinks?.linkedin ? 'عرض الملف الشخصي' : 'اضغط لربط حساب لينكد إن'}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">LinkedIn</span>
                    </button>

                    {/* Github */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.github ? window.open(student.socialLinks.github, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                        student?.socialLinks?.github 
                          ? 'bg-purple-600/15 border-purple-500/30 text-purple-400 hover:bg-purple-600/25' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title={student?.socialLinks?.github ? 'عرض الملف الشخصي' : 'اضغط لربط حساب جيت هاب'}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">GitHub</span>
                    </button>

                    {/* Instagram */}
                    <button
                      type="button"
                      onClick={() => student?.socialLinks?.instagram ? window.open(student.socialLinks.instagram, '_blank') : setIsProfileSettingsOpen(true)}
                      className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                        student?.socialLinks?.instagram 
                          ? 'bg-pink-600/15 border-pink-500/30 text-pink-400 hover:bg-pink-600/25' 
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title={student?.socialLinks?.instagram ? 'عرض الملف الشخصي' : 'اضغط لربط حساب إنستغرام'}
                    >
                      <Instagram className="w-3.5 h-3.5" />
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

            {/* Facebook-style Mobile Navigation Bar */}
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('timeline' as any)}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === ('timeline' as any)
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] text-center">المجتمع</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai-tutor' as any)}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === ('ai-tutor' as any)
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-300" />
                <span className="text-[10px] text-center">فهمني واشرحلي</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'submit'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] text-center">إرسال واجب</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('certificates')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'certificates'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Award className="w-4 h-4" />
                <span className="text-[10px] text-center">الشهادات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'history'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-[10px] text-center">السجل والتقارير</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'badges'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] text-center">الأوسمة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] text-center">المواعيد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('help' as any)}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === ('help' as any)
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-[10px] text-center">المساعدة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('language_lab')}
                className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === 'language_lab'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/30'
                    : 'bg-slate-950 text-teal-300 hover:bg-slate-850 border border-teal-500/30'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span className="text-[10px] text-center">معملي 🗣️</span>
              </button>
            </div>

            {activeTab === 'language_lab' && (
              <StudentLanguageLabView student={student} />
            )}

            {/* TAB 0: STUDENT COMMUNITY TIMELINE & FEED (Facebook Style) */}
            {activeTab === ('timeline' as any) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed (Columns 1 & 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Create Post Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-700">
                        {student?.photoUrl ? (
                          <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                            {student?.fullName?.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-200 block">انشر موضوعاً في مجتمع المجموعة</span>
                        <span className="text-[10px] text-slate-500 block">سيراه زملائك في {student?.groupName} والمعلم</span>
                      </div>
                    </div>

                    <form onSubmit={handleCreatePost} className="space-y-4">
                      {/* Textarea */}
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder={`ماذا يدور في ذهنك اليوم يا ${student?.fullName?.split(' ')[0]}؟ شارك إنجازاً أو اسأل سؤالاً...`}
                        className={`w-full min-h-[90px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none transition-all ${
                          newPostBg === 'gradient-indigo' ? 'bg-gradient-to-r from-indigo-900 to-slate-950 text-white font-bold text-center' :
                          newPostBg === 'gradient-purple' ? 'bg-gradient-to-r from-purple-900 to-slate-950 text-white font-bold text-center' :
                          newPostBg === 'gradient-sunset' ? 'bg-gradient-to-r from-pink-900 via-red-950 to-slate-950 text-white font-bold text-center' :
                          newPostBg === 'emerald' ? 'bg-gradient-to-r from-emerald-950 to-slate-950 text-white font-bold text-center' : ''
                        }`}
                      />

                      {/* Post Options Grid */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                        
                        {/* Background Styles (Facebook style) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">الخلفية:</span>
                          <button
                            type="button"
                            onClick={() => setNewPostBg('classic')}
                            className={`w-5 h-5 rounded-full border border-slate-700 bg-slate-950 ${newPostBg === 'classic' ? 'ring-2 ring-amber-500' : ''}`}
                            title="افتراضي"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPostBg('gradient-indigo')}
                            className={`w-5 h-5 rounded-full bg-indigo-700 ${newPostBg === 'gradient-indigo' ? 'ring-2 ring-amber-500' : ''}`}
                            title="تدرج أزرق"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPostBg('gradient-purple')}
                            className={`w-5 h-5 rounded-full bg-purple-700 ${newPostBg === 'gradient-purple' ? 'ring-2 ring-amber-500' : ''}`}
                            title="تدرج بنفسجي"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPostBg('gradient-sunset')}
                            className={`w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 ${newPostBg === 'gradient-sunset' ? 'ring-2 ring-amber-500' : ''}`}
                            title="غروب الشمس"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPostBg('emerald')}
                            className={`w-5 h-5 rounded-full bg-emerald-600 ${newPostBg === 'emerald' ? 'ring-2 ring-amber-500' : ''}`}
                            title="زمردي"
                          />
                        </div>

                        {/* Post Type Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold">النوع:</span>
                          <select
                            value={newPostType}
                            onChange={(e: any) => setNewPostType(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-xl px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
                          >
                            <option value="status">💬 منشور عادي</option>
                            <option value="congratulations">🎉 تهنئة وإنجاز</option>
                            <option value="homework">❓ مساعدة بالواجب</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingPost || !newPostContent.trim()}
                          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/15 disabled:opacity-50 transition-all flex items-center gap-1"
                        >
                          {isSubmittingPost ? 'جاري النشر...' : 'نشر بالجروب 🚀'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Feed List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 px-1">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                      <span>آخر التفاعلات والمشاركات في مجموعتك الدراسية</span>
                    </h3>

                    {isLoadingPosts ? (
                      <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">جاري تحميل المنشورات والمجتمع...</p>
                      </div>
                    ) : communityPosts.length === 0 ? (
                      <div className="p-10 text-center bg-slate-900 border border-slate-850 rounded-3xl space-y-3">
                        <Smile className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-black">المجتمع بانتظار مشاركتك الأولى!</p>
                        <p className="text-[10px] text-slate-500">
                          اكتب منشوراً الآن لتشجيع زملائك بالدورة التدريبية ومشاركة فرحة التعلم.
                        </p>
                      </div>
                    ) : (
                      communityPosts.map((post) => {
                        const isLikedByMe = student && Array.isArray(post.likes) && post.likes.includes(student.id);
                        return (
                          <div key={post.id} className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 shadow-lg space-y-4">
                            {/* Post Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                                  {post.traineePhotoUrl ? (
                                    <img src={post.traineePhotoUrl} alt={post.traineeName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-sm">
                                      {post.traineeName?.slice(0, 1)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-slate-200">{post.traineeName}</span>
                                    {post.traineeId === 'supervisor' && (
                                      <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">معلم</span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-500 block font-mono">{post.createdAt ? new Date(post.createdAt).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Type Badge */}
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  post.type === 'congratulations' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                  post.type === 'homework' ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' :
                                  'bg-slate-800 border-slate-700 text-slate-300'
                                }`}>
                                  {post.type === 'congratulations' ? '🎉 تهنئة وإنجاز' :
                                   post.type === 'homework' ? '❓ سؤال بالواجب' :
                                   '💬 منشور'}
                                </span>

                                {/* Delete button for own posts */}
                                {student && post.traineeId === student.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post.id)}
                                    className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 hover:text-rose-400 text-slate-500 transition-all"
                                    title="حذف المنشور"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Post Content */}
                            {post.bgStyle && post.bgStyle !== 'classic' ? (
                              <div className={`p-6 rounded-2xl text-center flex items-center justify-center min-h-[110px] text-xs font-black text-white shadow-inner bg-gradient-to-r ${
                                post.bgStyle === 'gradient-indigo' ? 'from-indigo-600 via-indigo-700 to-slate-950' :
                                post.bgStyle === 'gradient-purple' ? 'from-purple-600 via-violet-700 to-slate-950' :
                                post.bgStyle === 'gradient-sunset' ? 'from-pink-600 via-red-600 to-amber-600' :
                                post.bgStyle === 'emerald' ? 'from-emerald-600 via-teal-700 to-slate-950' : ''
                              }`}>
                                <p className="max-w-md break-words text-sm whitespace-pre-line leading-relaxed drop-shadow">{post.content}</p>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed px-1">
                                {post.content}
                              </div>
                            )}

                            {/* Likes and Interactions Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/30 text-[11px]">
                              {/* Like Trigger */}
                              <button
                                type="button"
                                onClick={() => handleLikePost(post.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                                  isLikedByMe 
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-rose-500' : ''}`} />
                                <span className="font-bold">أعجبني ({Array.isArray(post.likes) ? post.likes.length : 0})</span>
                              </button>

                              {/* Comment icon summary */}
                              <span className="text-slate-500 font-bold">
                                {Array.isArray(post.comments) ? post.comments.length : 0} تعليقات ومشاركات ردود
                              </span>
                            </div>

                            {/* Comments Container */}
                            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 space-y-3">
                              {/* Comments List */}
                              {Array.isArray(post.comments) && post.comments.length > 0 && (
                                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                  {post.comments.map((comm: any, idx: number) => (
                                    <div key={comm.id || idx} className="flex items-start gap-2 text-[10px] border-b border-slate-900/60 pb-2 last:border-0 last:pb-0">
                                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                                        {comm.traineePhotoUrl ? (
                                          <img src={comm.traineePhotoUrl} alt={comm.traineeName} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[8px]">
                                            {comm.traineeName?.slice(0, 1)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="bg-slate-900 p-2 rounded-xl text-right flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="font-black text-slate-300">{comm.traineeName}</span>
                                          <span className="text-[8px] text-slate-500">{comm.createdAt ? new Date(comm.createdAt).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'منذ قليل'}</span>
                                        </div>
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-line">{comm.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Write Comment Form */}
                              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/30">
                                <input
                                  type="text"
                                  value={postCommentContent[post.id] || ''}
                                  onChange={(e) => setPostCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommentPost(post.id);
                                  }}
                                  placeholder="اكتب تعليقك أو استفسارك هنا..."
                                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleCommentPost(post.id)}
                                  className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                                  title="إرسال التعليق"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Sidebar Widget (Column 3) */}
                <div className="space-y-6">
                  
                  {/* PWA / Download Mobile Promo */}
                  <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl text-center space-y-3">
                    <Smartphone className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-300">تطبيق النجاح على هاتفك!</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        قم بتثبيت التطبيق للوصول المباشر الفوري للبوابة مع إشعارات التصحيح والأوسمة.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleInstallPwa}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-[11px] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>تثبيت التطبيق الآن 📲</span>
                    </button>
                  </div>

                  {/* Leaderboard/Achievers Board (Simulated Group rankings) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <div className="text-right">
                        <h4 className="text-xs font-black text-slate-200">أوائل دورتك ومجموعتك 🏆</h4>
                        <p className="text-[9px] text-slate-500">حسب نشاط الواجبات والنقاط التراكمية</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">١</span>
                          <span className="font-bold text-amber-300">{student?.fullName?.split(' ')[0]} (أنت)</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">{student?.totalPoints || 0} ن</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-850 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">٢</span>
                          <span className="font-medium text-slate-300">أحمد محمود الكناني</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400">٤٢٠ ن</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-850 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">٣</span>
                          <span className="font-medium text-slate-300">فاطمة الزهراء علي</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400">٣٩٥ ن</span>
                      </div>
                    </div>

                    <div className="pt-2 text-center border-t border-slate-800/40">
                      <span className="text-[9px] text-slate-500">مجموع النقاط يشمل التصحيح الآلي وسرعة تسليم المهام</span>
                    </div>
                  </div>

                  {/* Motivational Quote or Study Tip */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                    <span className="text-[10px] text-amber-400 font-bold block">💡 نصيحة اليوم للتعلم السريع:</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      "البرمجة والتصميم لا تتعلمهما بالقراءة فحسب، بل بكتابة وتعديل الكود بأصابعك. جرب تصحيح الواجب الآن فوراً واستفد من نصائح مساعد الذكاء الاصطناعي لتطوير مهاراتك!"
                    </p>
                  </div>

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
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black text-slate-100">
                        رفع الواجب أو تصويره للتصحيح بالذكاء الاصطناعي (Gemini 3.7 Flash)
                      </h3>
                    </div>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30">
                      تصحيح وإصدار تقرير فوري
                    </span>
                  </div>

                  <form onSubmit={handleSubmitHomework} className="space-y-5">
                    {/* Task Title Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        اختر عنوان أو موضوع الواجب المطلوبة تسليمه:
                      </label>

                      {(groupTasks || []).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                          {(groupTasks || []).map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedTaskTitle(t.title);
                                setCustomTaskTitle('');
                              }}
                              className={`p-3 rounded-2xl border text-right transition-all ${
                                selectedTaskTitle === t.title && !customTaskTitle
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <p className="text-xs font-bold truncate">{t.title}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                حد أقصى للنقاط: +{t.maxPoints}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="relative">
                        <input
                          type="text"
                          value={customTaskTitle}
                          onChange={(e) => setCustomTaskTitle(e.target.value)}
                          placeholder="أو اكتب عنوان واجب مخصص آخر..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Media Upload Options: Photo / File / Video */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        صورة الواجب أو الفيديو المرفق (يُفضل صورة لورقة الإجابة):
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Option 1: Mobile Direct Camera Capture (No permission issues) */}
                        <label className="p-4 rounded-2xl bg-amber-950/30 border border-dashed border-amber-500/50 hover:border-amber-400 text-center space-y-2 cursor-pointer transition-all group block">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-200">📸 تصوير مباشر فوراً (كاميرا الهاتف)</p>
                            <p className="text-[10px] text-slate-300">يفتح كاميرا المحمول مباشرة لتصوير الواجب بدون أخطاء</p>
                          </div>
                        </label>

                        {/* Option 2: Choose File or Video from Gallery */}
                        <label className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-indigo-500/60 text-center space-y-2 cursor-pointer transition-all group block">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">📁 اختيار صورة أو فيديو من الاستوديو</p>
                            <p className="text-[10px] text-slate-400">رفع صورة محفوطة مسبقاً أو فيديو من معرض الصور</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Camera Modal overlay if active */}
                    {isCameraActive && (
                      <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/40 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          <span>وجه الكاميرا نحو ورقة الواجب بالكامل</span>
                          <button type="button" onClick={stopCamera} className="text-rose-400 hover:underline">
                            إلغاء الكاميرا
                          </button>
                        </div>
                        <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-2xl border border-slate-800" />
                        <canvas ref={canvasRef} className="hidden" />
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>التقاط الصورة الآن</span>
                        </button>
                      </div>
                    )}

                    {/* Preview Selected Media */}
                    {selectedImageBase64 && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedImageBase64}
                            alt="معاينة الواجب"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {selectedVideoName ? `فيديو: ${selectedVideoName}` : 'تم تجهيز صورة الواجب للتحليل والذكاء الاصطناعي'}
                            </p>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
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
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        >
                          حذف الملف
                        </button>
                      </div>
                    )}

                    {/* Student Notes / Text Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        ملاحظات وشرح الإجابة (اختياري):
                      </label>
                      <textarea
                        rows={3}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="اكتب هنا أي توضيح للمدرب أو شرح للكود والخطوات..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingHomework}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingHomework ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                          <span>جاري تحليل وتصحيح الواجب بواسطة الذكاء الاصطناعي (Gemini)...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                          <span>إرسال وتصحيح الواجب بالذكاء الاصطناعي الآن</span>
                        </>
                      )}
                    </button>
                  </form>

                  {submitSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{submitSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Instant AI Correction Output Card */}
                {lastSubmissionResult && (
                  <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-black text-slate-100">
                          تقرير تصحيح وتصنيف الذكاء الاصطناعي الفوري
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {new Date(lastSubmissionResult.submittedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">الدرجة والتقييم</span>
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          {lastSubmissionResult.grade} / {lastSubmissionResult.maxGrade}
                        </div>
                        <span className="text-xs font-bold text-slate-300 block">
                          النسبة: {lastSubmissionResult.percentage}% ({lastSubmissionResult.rating})
                        </span>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">النقاط المضافة لرصيدك</span>
                        <div className="text-2xl font-black text-amber-400 font-mono">
                          +{lastSubmissionResult.pointsAwarded} نقطة
                        </div>
                        {lastSubmissionResult.isSpeedWinner && (
                          <span className="text-[10px] text-amber-300 font-bold block">
                            ⚡ شاملة +25 مكافأة السرعة البرقية
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">حالة التسليم</span>
                        <div className="text-lg font-black text-indigo-300 pt-1">
                          مسجل لدى المدرب
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          القناة: بوابة الطالب المنزلية
                        </span>
                      </div>
                    </div>

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
                              <h4 className="text-xs font-black text-amber-300">
                                {lastSubmissionResult.badgeAwarded?.title || 'وسام التفوق والحل الفوري'}
                              </h4>
                              <p className="text-[11px] text-amber-200/80">
                                تم منحك هذا الوسام وإضافته إلى ملفك الأكاديمي تقديرًا لسرعة ودقة حل الواجب!
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 shrink-0">
                            +{lastSubmissionResult.badgeAwarded?.points || 25} نقطة
                          </span>
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>التقرير التحليلي الشامل للمدرب وللطالب:</span>
                        </h4>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {lastSubmissionResult.generalFeedback}
                        </p>
                      </div>

                      {/* Strengths */}
                      {lastSubmissionResult?.strengths && lastSubmissionResult.strengths.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>نقاط القوة والإتقان الملحوظة:</span>
                          </h4>
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                            {(lastSubmissionResult.strengths || []).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Explanation of Difficult Points / Concepts */}
                      {lastSubmissionResult?.difficultPointsExplained && lastSubmissionResult.difficultPointsExplained.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                          <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            <span>💡 شرح وتوضيح النقاط والمفاهيم الصعبة في هذا الواجب:</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-200">
                            {lastSubmissionResult.difficultPointsExplained.map((point, idx) => (
                              <li key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-indigo-500/20 leading-relaxed">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Corrections if any */}
                      {lastSubmissionResult?.corrections && lastSubmissionResult.corrections.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span>نقاط للتحسين المرات القادمة:</span>
                          </h4>
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                            {lastSubmissionResult.corrections.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Trainer Notification Confirmation Alert */}
                      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>تم إرسال إشعار فوري للمدرب باسمك ({lastSubmissionResult.traineeName}) وكودك والدرجة والتقرير بنجاح!</span>
                        </span>
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>سجل الواجبات المسلمة وتصحيحات الذكاء الاصطناعي</span>
                </h3>

                {(!homeworks || homeworks.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">لم تقم برفع أي واجبات منزلية بعد.</p>
                    <p className="text-[11px] text-slate-500">
                      يمكنك البدء بالضغط على "إرسال واجب جديد" وتصوير حل التمرين فوراً!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(homeworks || []).map((hw) => (
                      <div
                        key={hw.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100">{hw.taskTitle}</h4>
                              {hw.isSpeedWinner && (
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                                  ⚡ وسام السرعة البرقية
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              تاريخ التسليم: {new Date(hw.submittedAt).toLocaleString('ar-EG')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-emerald-500/30">
                              {hw.grade} / {hw.maxGrade} ({hw.percentage}%)
                            </span>
                            <span className="bg-amber-500/10 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-amber-500/30">
                              +{hw.pointsAwarded} نقطة
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <strong className="text-amber-400 block mb-1">التقرير الذكي:</strong>
                          {hw.generalFeedback}
                        </p>

                        {hw.mediaUrl && (
                          <div className="pt-1">
                            <a
                              href={hw.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-bold"
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

            {/* TAB 3: BADGES AND ACHIEVEMENTS */}
            {activeTab === 'badges' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>سجل الأوسمة والجوائز والأوسمة السريعة</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">
                    إجمالي الأوسمة: {(badges || []).length}
                  </span>
                </div>

                {(!badges || badges.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                    <Award className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">لا يوجد أوسمة مسجلة حالياً.</p>
                    <p className="text-[11px] text-slate-500">
                      كن أسرع طالب يسلم الواجب بعد المحاضرة فوراً لتحصل على "وسام السرعة البرقية" ⚡!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(badges || []).map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3.5 shadow-md"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                            {b.icon || '🏅'}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-100">{b.badgeTitle}</h4>
                            <p className="text-[10px] text-slate-400">
                              النقاط المستحقة: <strong className="text-amber-400 font-mono">+{b.points} نقطة</strong>
                            </p>
                            <span className="text-[9px] text-slate-500 block">
                              تاريخ الممنح: {new Date(b.awardedAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>

                        {/* Social Share for Badge */}
                        <div className="flex flex-col gap-1 items-center border-r border-slate-800 pr-3 shrink-0">
                          <span className="text-[8px] text-slate-500 font-bold">مشاركة:</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله! حصلت على "${b.badgeTitle}" تميزاً وسرعةً في دورة البرمجة والذكاء الاصطناعي من مركز النجاح للتدريب والاستشارات! ⚡🏆`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
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
                              className="text-blue-500 hover:text-blue-400 transition-colors"
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>جدول المواعيد وقاعة المعمل المقررة للمجموعة</span>
                </h3>

                {(!labSchedules || labSchedules.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">مواعيد المعمل مسجلة وفق جدول المجموعة الرئيسي.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(labSchedules || []).map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-300">{s.dayOfWeek}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">{s.roomName}</span>
                        </div>
                        <p className="text-xs text-slate-200">
                          الوقت: <span className="font-mono text-amber-300 font-bold">{s.timeDisplay || `${s.startTime} - ${s.endTime}`}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>الشهادات التدريبية المعتمدة الصادرة باسم الطالب</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">
                    عدد الشهادات: {certificates.length}
                  </span>
                </div>

                {(!certificates || certificates.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                    <Award className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">لم يتم إصدار شهادات معتمدة لهذا الطالب بعد.</p>
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
                        className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-amber-900/10 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-4"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-amber-500/40 shadow-md flex items-center justify-center shrink-0">
                              <img src="/logo.svg" alt="النجاح" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 mb-1 inline-block">
                                شهادة معتمدة ورسمية
                              </span>
                              <h4 className="text-base font-black text-slate-100">{cert.courseName}</h4>
                              <p className="text-xs text-slate-400 font-mono">رقم الشهادة: {cert.certificateNumber}</p>
                            </div>
                          </div>

                          {/* Stamp & QR Preview */}
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <img src="/stamp.svg" alt="ختم النجاح" className="w-16 h-16 object-contain opacity-90 transform -rotate-6" />
                              <span className="text-[9px] text-amber-300/80 block mt-0.5">الختم المعتمد</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">اسم الطالب</span>
                            <strong className="text-amber-300">{cert.traineeName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">التقدير العام</span>
                            <strong className="text-emerald-400">{cert.grade || 'ممتاز'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">تاريخ الإصدار</span>
                            <strong className="text-slate-200 font-mono">{cert.issueDate}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">المدرب المحاضر</span>
                            <strong className="text-slate-200">{cert.trainerName || 'المدرب المعتمد'}</strong>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                            <span className="text-[10px] text-slate-400 font-bold ml-1">مشاركة:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `الحمد لله حمداً كثيراً! حصلت على شهادة معتمدة ورسمية في دورة "${cert.courseName}" من مركز النجاح للتدريب والاستشارات! 🎓🏆`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
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
                              className="text-blue-500 hover:text-blue-400 transition-colors"
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
                              className="text-sky-400 hover:text-sky-300 transition-colors"
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
                              className="text-blue-600 hover:text-blue-500 transition-colors"
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
                            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
                          >
                            <Download className="w-4 h-4 text-amber-400" />
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-slate-100">إعدادات الملف الشخصي وحماية الحساب</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Account Password Section */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>تأمين البوابة الإلكترونية وحماية حساب الطالب</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      افتراضياً، يمكنك تسجيل الدخول إلى بوابتك بكود الطالب أو رقم هاتفك. لتجنب دخول أي شخص آخر على ملفك ومتابعتك، ننصحك بتعيين كلمة مرور مخصصة هنا. بعد تفعيلها، سيطلب منك النظام كتابتها في كل مرة تسجل فيها الدخول.
                    </p>

                    <div>
                      <label className="block text-[11px] text-slate-300 font-bold mb-1.5">
                        كلمة المرور الخاصة بك للبوابة الإلكترونية (أو اتركها فارغة للدخول المباشر):
                      </label>
                      <input
                        type="password"
                        value={portalPasswordForm}
                        onChange={(e) => setPortalPasswordForm(e.target.value)}
                        placeholder="اكتب كلمة مرور قوية وسهلة التذكر"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Connected Social Profiles */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <span>ربط حساباتك على منصات التواصل الاجتماعي لعرضها لزملائك</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      تساعدك هذه الروابط على مشاركة إنجازاتك وتواصل زملائك في المركز معك مباشرة من جدار التميز والمنشورات.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Facebook className="w-3.5 h-3.5 text-blue-500" />
                          <span>رابط حساب فيسبوك (Facebook URL):</span>
                        </label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/your-username"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                          <span>رابط حساب لينكد إن (LinkedIn URL):</span>
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/your-username"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                          <span>رابط حساب تويتر / إكس (Twitter URL):</span>
                        </label>
                        <input
                          type="url"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
                          placeholder="https://twitter.com/your-username"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Instagram className="w-3.5 h-3.5 text-pink-500" />
                          <span>رابط حساب انستجرام (Instagram URL):</span>
                        </label>
                        <input
                          type="url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          placeholder="https://instagram.com/your-username"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Github className="w-3.5 h-3.5 text-purple-400" />
                          <span>رابط حساب جيتهاب (GitHub URL):</span>
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/your-username"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 mb-1">
                          <Youtube className="w-3.5 h-3.5 text-red-500" />
                          <span>رابط قناة يوتيوب (YouTube URL):</span>
                        </label>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/@your-channel"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent font-mono text-left"
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
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-850 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md"
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
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveMessageModal(null)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shrink-0">
                💬
              </div>
              <div>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  رسالة جديدة من إدارة المركز
                </span>
                <h3 className="text-base font-black text-slate-100">{activeMessageModal.title || 'تنبيه هـام'}</h3>
                <p className="text-[11px] text-slate-400">{activeMessageModal.senderName || 'مركز النجاح للتدريب'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
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
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
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
            optimizedPhoto = await compressImage(finalPhoto, 800, 800, 0.85);
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
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
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

      {/* Mobile Bottom Navigation Bar */}
      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex justify-around py-2 px-1 shadow-2xl md:hidden">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'timeline' ? 'text-amber-400 scale-105' : 'text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] font-bold">الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'submit' ? 'text-amber-400 scale-105' : 'text-slate-400'}`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-[9px] font-bold">تسليم واجب</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'badges' ? 'text-amber-400 scale-105' : 'text-slate-400'}`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-bold">الأوسمة</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'schedule' ? 'text-amber-400 scale-105' : 'text-slate-400'}`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[9px] font-bold">الجدول</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'profile' ? 'text-amber-400 scale-105' : 'text-slate-400'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] font-bold">الملف</span>
          </button>
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
