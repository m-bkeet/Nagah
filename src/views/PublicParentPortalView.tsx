import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { resilientOfflineService } from '../services/resilientOfflineService';
import { cloudDb } from '../services/cloudDatabase';
import { ThemeQuickSwitcher } from '../components/ThemeQuickSwitcher';
import { 
  Users, Award, CheckCircle2, Clock, ShieldCheck, Phone, BookOpen, 
  Search, Star, AlertCircle, LogOut, TrendingUp, Sparkles, Building, Download, 
  QrCode, ArrowRight, Calendar, DollarSign, Edit3, Camera, Send, MessageSquare, 
  Heart, Printer, X, Check, Mail, UserCheck, Receipt, Share2, Smartphone, FileText, Bell, Lock,
  ChevronDown, User, Shield, CreditCard, HelpCircle
} from 'lucide-react';
import { NextLectureWidget } from '../components/NextLectureWidget';
import { ElectronicPaymentWidget } from '../components/ElectronicPaymentWidget';
import { OfficialReceiptModal } from '../components/OfficialReceiptModal';
import { ParentLanguageInsights } from '../components/language/ParentLanguageInsights';
import { api } from '../services/api';
import { Trainee, TraineeBadge, TraineeEvaluation, AttendanceRecord, LabScheduleSlot, Payment } from '../types';
import { sessionEventsService, SessionEvent } from '../services/sessionEventsService';
import { SessionCelebrationOverlay } from '../components/SessionCelebrationOverlay';
import { AudioAutoplayUnlockBanner } from '../components/AudioAutoplayUnlockBanner';
import { audioService } from '../services/audioService';

interface ChildRecord extends Trainee {
  courseName: string;
  groupName: string;
  badges: TraineeBadge[];
  evaluations: TraineeEvaluation[];
  attendance: AttendanceRecord[];
  attendanceCount: number;
  totalAttendance: number;
  schedules: LabScheduleSlot[];
  payments?: Payment[];
  messages?: any[];
  groupDetails?: any;
  trainer?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    specialty: string;
    photoUrl?: string;
    branchName?: string;
  } | null;
}

interface PublicParentPortalViewProps {
  onBack?: () => void;
}

export const PublicParentPortalView: React.FC<PublicParentPortalViewProps> = ({ onBack }) => {
  const [codeOrPhone, setCodeOrPhone] = useState('');
  const [parentPasswordInput, setParentPasswordInput] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);

  // Main Parent Info State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentNationalId, setParentNationalId] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [parentPhotoUrl, setParentPhotoUrl] = useState('');
  
  // Offline status states
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Children & Selection
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'finance' | 'messages'>('overview');

  // Loading & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentAccounts, setPaymentAccounts] = useState({ vodafoneCash: '01001500686', instapay: 'm_bkeet@instapay' });

  // Drawers & Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Parent Profile Edit Form State
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editParentNationalId, setEditParentNationalId] = useState('');
  const [editParentEmail, setEditParentEmail] = useState('');
  const [editParentAddress, setEditParentAddress] = useState('');
  const [editParentPassword, setEditParentPassword] = useState('');
  const [editParentPhoto, setEditParentPhoto] = useState('');
  const [isSavingParentProfile, setIsSavingParentProfile] = useState(false);
  const [parentProfileSaveMsg, setParentProfileSaveMsg] = useState('');

  // Student Info Edit Modal State
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editStudentNationalId, setEditStudentNationalId] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentPhotoUrl, setEditStudentPhotoUrl] = useState('');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [studentUpdateMsg, setStudentUpdateMsg] = useState('');

  // Direct Messaging State
  const [chatRecipientType, setChatRecipientType] = useState<'admin' | 'trainer'>('admin');
  const [chatMessageType, setChatMessageType] = useState<'message' | 'greeting'>('message');
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [chatSuccessNotice, setChatSuccessNotice] = useState('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Payment Proof Upload State
  const [isUploadProofModalOpen, setIsUploadProofModalOpen] = useState(false);
  const [proofAmount, setProofAmount] = useState<number>(0);
  const [proofMonth, setProofMonth] = useState<string>('أغسطس 2026');
  const [proofMethod, setProofMethod] = useState<string>('vodafone_cash');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);
  const [proofNoticeMsg, setProofNoticeMsg] = useState<string>('');

  const handleFileChangeForProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    if (!proofAmount || proofAmount <= 0) {
      alert('يرجى كتابة مبلغ السداد الصحيح');
      return;
    }
    if (!proofImageBase64) {
      alert('يرجى إرفاق صورة إيصال الدفع أو لقطة الشاشة');
      return;
    }

    setIsSubmittingProof(true);
    setProofNoticeMsg('');
    try {
      const res = await api.submitParentPaymentProof({
        traineeId: selectedChild.id,
        amount: proofAmount,
        paymentMethod: proofMethod,
        targetMonth: proofMonth,
        notes: proofNotes,
        proofImageUrl: proofImageBase64,
        submittedByParentName: parentName
      });

      if (res.success) {
        setProofNoticeMsg('تم رفع إيصال السداد بنجاح! الإيصال الآن قيد التحقق ومراجعة الإدارة ⏳');
        setTimeout(() => {
          setIsUploadProofModalOpen(false);
          setProofImageBase64('');
          setProofNotes('');
          setProofNoticeMsg('');
          if (codeOrPhone) autoLoginParent(codeOrPhone);
        }, 1800);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفع إيصال السداد');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // PWA Installation Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlCode = urlParams?.get('code') || urlParams?.get('c') || urlParams?.get('phone') || urlParams?.get('studentCode');
    const targetCode = urlCode || localStorage.getItem('parent_session_code');
    if (targetCode) {
      setCodeOrPhone(targetCode);
      autoLoginParent(targetCode);
    }
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const autoLoginParent = async (phoneOrCode: string) => {
    setIsLoading(true);
    // 1. Instantly load from local offline-first cache
    try {
      const cached = resilientOfflineService.getFromCache('parent');
      if (cached) {
        populateParentData(cached);
        setIsOfflineFallback(true);
      }
    } catch (e) {
      console.warn('[Parent Auto-Login] No parent cache loaded:', e);
    }

    // 2. Revalidate in background if online
    const savedPassword = localStorage.getItem('parent_session_password') || '';
    try {
      const res = await fetch('/api/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeOrPhone: phoneOrCode, password: savedPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        populateParentData(data);
        // Cache the session data
        resilientOfflineService.saveToCache('parent', data);
        setIsOfflineFallback(false);
      } else {
        // Only remove session if the server says it's strictly invalid (e.g., bad credentials)
        if (data.error && data.error.includes('غير صحيحة')) {
          localStorage.removeItem('parent_session_code');
          localStorage.removeItem('parent_session_password');
        }
      }
    } catch (err) {
      console.warn('[Parent Offline] Failed autoLogin background refresh, staying on cache.', err);
    } finally {
      setIsLoading(false);
    }
  };

  const populateParentData = (data: any) => {
    let pName = data.parentName || 'السيد ولي الأمر المحترم';
    setParentName(pName);
    setParentPhotoUrl(data.parentPhotoUrl || '');
    setChildren(data.children || []);
    if (data.paymentAccounts) {
      setPaymentAccounts(data.paymentAccounts);
    }
    if (data.children && data.children.length > 0) {
      const firstChild = data.children[0];
      setSelectedChildId(firstChild.id);
      setParentPhone(firstChild.parentPhone || firstChild.phone || '');
      setParentNationalId((firstChild as any).parentNationalId || '');
      setParentEmail((firstChild as any).parentEmail || firstChild.email || '');
      setParentAddress(firstChild.address || '');
    }
  };

  const refreshParentData = async () => {
    if (!codeOrPhone) return;
    try {
      const res = await fetch('/api/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeOrPhone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        populateParentData(data);
        resilientOfflineService.saveToCache('parent', data);
        setIsOfflineFallback(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert('لتثبيت التطبيق على هاتفك:\n\n- في الآيفون (Safari): اضغط زر المشاركة ثم "إضافة للشاشة الرئيسية" (Add to Home Screen).\n\n- في الأندرويد (Chrome): افتح قائمة المتصفح ثم اختر "تثبيت التطبيق" (Install App).');
    }
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeOrPhone.trim()) return;
    setIsLoading(true);
    setError('');

    const rawInput = codeOrPhone.trim();
    const normalizedInput = normalizeDigits(rawInput).toLowerCase();
    const inputDigits = cleanPhoneDigits(rawInput);
    const isPhone = inputDigits.length >= 8;

    // --- Layer 1: Express Server API ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/parent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeOrPhone: rawInput, password: parentPasswordInput }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('parent_session_code', rawInput);
          if (parentPasswordInput) {
            localStorage.setItem('parent_session_password', parentPasswordInput);
          } else {
            localStorage.removeItem('parent_session_password');
          }
          populateParentData(data);
          resilientOfflineService.saveToCache('parent', data);
          setIsOfflineFallback(false);
          setIsLoading(false);
          return;
        }
      } else {
        const data = await res.json().catch(() => null);
        if (data?.needsPassword) {
          setRequiresPassword(true);
          setError(data.error || 'هذا الحساب محمي بكلمة مرور. يرجى إدخال كلمة المرور.');
          setIsLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('[Parent Portal] API unreachable, querying Cloud Firestore...', apiErr);
    }

    // --- Layer 2: Cloud Firestore (cloudDb) Fallback ---
    try {
      const [cloudTrainees, cloudCourses, cloudGroups, cloudTrainers] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getCourses().catch(() => []),
        api.getGroups().catch(() => []),
        api.getTrainers().catch(() => [])
      ]);

      let matchedChildren = cloudTrainees.filter(t => {
        if (!t) return false;
        const tCode = normalizeDigits(t.code || '').toLowerCase();
        const tNatId = normalizeDigits(t.nationalId || '').trim();
        const tId = (t.id || '').toLowerCase();

        // Code Match
        if (tCode && (tCode === normalizedInput || tCode === `م${normalizedInput}` || `م${tCode}` === normalizedInput || tCode === `tr-${normalizedInput}`)) return true;
        if (tNatId && tNatId === normalizedInput) return true;
        if (tId && tId === normalizedInput) return true;

        // Phone / Parent Phone match
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

      if (matchedChildren.length > 0) {
        // Find siblings sharing the same parent phone
        const pPhone = cleanPhoneDigits(matchedChildren[0].parentPhone || '');
        if (pPhone && pPhone.length >= 8) {
          const siblings = cloudTrainees.filter(t => 
            !matchedChildren.some(m => m.id === t.id) && 
            cleanPhoneDigits(t.parentPhone || '') === pPhone
          );
          matchedChildren.push(...siblings);
        }

        const formattedChildren = matchedChildren.map(t => {
          const course = cloudCourses.find(c => c.id === t.courseId);
          const group = cloudGroups.find(g => g.id === t.groupId);
          const trainer = group ? cloudTrainers.find(tr => tr.id === group.trainerId) : null;
          return {
            ...t,
            courseName: course?.name || 'الدورة التدريبية',
            groupName: group?.name || 'المجموعة التدريبية',
            badges: [],
            evaluations: [],
            attendance: [],
            attendanceCount: 0,
            totalAttendance: 0,
            schedules: [],
            payments: [],
            messages: [],
            groupDetails: group,
            trainer: trainer ? { id: trainer.id, name: trainer.name, phone: trainer.phone, email: trainer.email } : undefined
          };
        });

        const parentNameFound = matchedChildren[0].parentName || 'السيد ولي الأمر المحترم';
        const parentPayload = {
          success: true,
          parentName: parentNameFound.startsWith('السيد') ? parentNameFound : `السيد ولي الأمر / ${parentNameFound}`,
          parentPhotoUrl: (matchedChildren[0] as any).parentPhotoUrl || '',
          children: formattedChildren,
          paymentAccounts: { vodafoneCash: '01001500686', instapay: 'm_bkeet@instapay' }
        };

        localStorage.setItem('parent_session_code', rawInput);
        populateParentData(parentPayload);
        resilientOfflineService.saveToCache('parent', parentPayload);
        setIsOfflineFallback(true);
        setIsLoading(false);
        return;
      }
    } catch (cloudErr) {
      console.warn('[Parent Portal] Firestore fallback failed:', cloudErr);
    }

    // --- Layer 3: Local Offline Cache ---
    const cached = resilientOfflineService.getFromCache('parent');
    if (cached) {
      localStorage.setItem('parent_session_code', rawInput);
      populateParentData(cached);
      setIsOfflineFallback(true);
      setIsLoading(false);
      return;
    }

    setError(`لم يتم العثور على حساب مسجل برقم الهاتف أو الكود (${rawInput}). يرجى التأكد وإعادة المحاولة.`);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('parent_session_code');
    localStorage.removeItem('parent_session_password');
    localStorage.removeItem('nagah_parent_cache');
    setChildren([]);
    setParentName('');
    setCodeOrPhone('');
    setError('');
  };

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const parentMessages = selectedChild?.messages || [];

  // Session Celebration & Real-Time Event State for Parent
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ title?: string; winnerName?: string; winnerPoints?: number }>({});
  const [parentNotifications, setParentNotifications] = useState<Array<{ id: string; title: string; message: string; time: string; type: string }>>([]);

  useEffect(() => {
    const groupId = selectedChild?.groupDetails?.id || selectedChild?.groupId;
    if (!groupId || !selectedChild) return;

    const unsub = sessionEventsService.listenToGroupSessionEvents(groupId, (event: SessionEvent) => {
      const eventTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      if (event.eventType === 'SESSION_REMINDER') {
        audioService.playPreSessionAlert();
        setParentNotifications(prev => [{
          id: event.id,
          title: 'محاضرة الطالب تقترب...',
          message: `تنبيه: محاضرة ${event.courseName || selectedChild.courseName} للطالب ${selectedChild.fullName} تقترب...`,
          time: eventTime,
          type: 'reminder'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_STARTED') {
        audioService.playSessionStartAlert();
        setParentNotifications(prev => [{
          id: event.id,
          title: 'بدأت المحاضرة الآن',
          message: `بدأت الآن محاضرة ${event.courseName || selectedChild.courseName} للطالب ${selectedChild.fullName}.`,
          time: eventTime,
          type: 'start'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_FIVE_MINUTES') {
        audioService.playFiveMinuteWarningAlert();
        setParentNotifications(prev => [{
          id: event.id,
          title: 'تبقى 5 دقائق على نهاية المحاضرة',
          message: `تبقى 5 دقائق على انتهاء محاضرة الطالب ${selectedChild.fullName}. شكرًا لمتابعته وتشجيعه.`,
          time: eventTime,
          type: 'warning'
        }, ...prev]);
      } else if (event.eventType === 'SESSION_CELEBRATION' || event.eventType === 'SESSION_ENDED') {
        setCelebrationData({
          title: `محاضرة ${event.groupName || selectedChild.groupName}`,
          winnerName: event.starWinnerName,
          winnerPoints: event.starWinnerPoints
        });
        setShowCelebrationOverlay(true);
        setParentNotifications(prev => [{
          id: event.id,
          title: '🎉 انتهت المحاضرة',
          message: `انتهت محاضرة ${event.courseName || selectedChild.courseName}. أحسنت يا ${selectedChild.fullName} 👏`,
          time: eventTime,
          type: 'celebration'
        }, ...prev]);
      }
    });

    return () => unsub();
  }, [selectedChild]);

  // Open Parent Profile Edit Modal
  const handleOpenParentProfile = () => {
    setEditParentName(parentName.replace(/^السيد ولي الأمر \/ /, ''));
    setEditParentPhone(parentPhone || selectedChild?.parentPhone || selectedChild?.phone || '');
    setEditParentNationalId(parentNationalId || (selectedChild as any)?.parentNationalId || '');
    setEditParentEmail(parentEmail || (selectedChild as any)?.parentEmail || (selectedChild as any)?.email || '');
    setEditParentAddress(parentAddress || selectedChild?.address || '');
    setEditParentPassword(selectedChild?.parentPortalPassword || '');
    setEditParentPhoto(parentPhotoUrl);
    setParentProfileSaveMsg('');
    setIsProfileSettingsOpen(true);
  };

  const handleSaveParentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParentProfile(true);
    setParentProfileSaveMsg('');
    try {
      const res = await fetch('/api/parent/update-full-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: selectedChild?.id,
          parentPhone: editParentPhone,
          parentName: editParentName,
          parentNationalId: editParentNationalId,
          parentEmail: editParentEmail,
          address: editParentAddress,
          parentPortalPassword: editParentPassword,
          parentPhotoUrl: editParentPhoto
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setParentProfileSaveMsg('تم حفظ وتحديث بيانات ملف ولي الأمر بنجاح! ✓');
        setParentName(editParentName);
        setParentPhone(editParentPhone);
        setParentNationalId(editParentNationalId);
        setParentEmail(editParentEmail);
        setParentAddress(editParentAddress);
        setParentPhotoUrl(editParentPhoto);

        setTimeout(() => {
          setIsProfileSettingsOpen(false);
          refreshParentData();
        }, 1200);
      } else {
        alert(data.error || 'حدث خطأ أثناء حفظ البيانات');
      }
    } catch (err) {
      alert('حدث خطأ بالاتصال بالخادم');
    } finally {
      setIsSavingParentProfile(false);
    }
  };

  // Open Student Edit Modal
  const handleOpenStudentEdit = () => {
    if (!selectedChild) return;
    setEditStudentNationalId(selectedChild.nationalId || '');
    setEditStudentPhone(selectedChild.phone || '');
    setEditStudentPhotoUrl(selectedChild.photoUrl || (selectedChild as any).photo || '');
    setStudentUpdateMsg('');
    setIsEditStudentModalOpen(true);
  };

  const handleSaveStudentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    setIsUpdatingStudent(true);
    setStudentUpdateMsg('');
    try {
      const res = await fetch('/api/parent/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: selectedChild.id,
          nationalId: editStudentNationalId,
          phone: editStudentPhone,
          photoUrl: editStudentPhotoUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStudentUpdateMsg('تم تحديث بيانات وصورة الطالب بنجاح! ✓');
        setTimeout(() => {
          setIsEditStudentModalOpen(false);
          refreshParentData();
        }, 1200);
      } else {
        alert(data.error || 'حدث خطأ أثناء التحديث');
      }
    } catch (err) {
      alert('حدث خطأ بالاتصال بالخادم');
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // Send Direct Message to Admin or Trainer
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !chatInputText.trim()) return;
    setIsSendingChatMessage(true);
    setChatSuccessNotice('');
    try {
      const res = await fetch('/api/parent/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: selectedChild.id,
          senderName: parentName || selectedChild.parentName,
          recipientType: chatRecipientType,
          recipientId: chatRecipientType === 'trainer' ? selectedChild.trainer?.id : '',
          trainerName: selectedChild.trainer?.name || '',
          message: chatInputText,
          messageType: chatMessageType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatInputText('');
        setChatSuccessNotice('تم إرسال رسالتك بنجاح وسيتواصل معك الفريق قريباً! 💬');
        if (selectedChild.messages) {
          selectedChild.messages.unshift(data.message);
          if (data.aiReply) {
            selectedChild.messages.unshift(data.aiReply);
          }
        }
        refreshParentData();
        setTimeout(() => setChatSuccessNotice(''), 4000);
      } else {
        alert(data.error || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالشبكة');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Download Certificate Image
  const handleDownloadCertImage = async (certId: string, certName: string) => {
    const el = document.getElementById(`parent-cert-card-${certId}`);
    if (!el) {
      alert('تعذر الوصول لبطاقة الشهادة');
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
      alert('حدث خطأ أثناء تنزيل الشهادة كصورة');
    }
  };

  // Share Application with Direct App Download Links
  const handleShareApp = () => {
    const shareText = `🚀 حمّل تطبيق "بوابة الطالب الذكية - مركز النجاح للتدريب والاستشارات" الآن!
ليتمكن ابنك من متابعة دروسه، تسليم واجباته وصححها بالذكاء الاصطناعي، ومنافس زملائه على أوسمة الصدارة! 🏆

📱 روابط التحميل المباشرة:
🤖 للأندرويد (Google Play): https://play.google.com/store/apps/details?id=com.nagah.center
🍎 للأيفون (App Store): https://apps.apple.com/app/id164783389
💻 لويندوز والكمبيوتر (PWA): ${window.location.origin}

سجّل دخول ابنك بكود الطالب واستمتع بتجربة تعلم ممتازة! ✨`;

    if (navigator.share) {
      navigator.share({
        title: 'بوابة الطالب - مركز النجاح',
        text: shareText,
        url: window.location.origin
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert('📋 تم نسخ رابط ونص تحميل التطبيق بنجاح! يمكنك مشاركته مع العائلة والطلاب على واتساب وفيسبوك.');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('📋 تم نسخ رابط ونص تحميل التطبيق بنجاح! يمكنك مشاركته مع العائلة والطلاب على واتساب وفيسبوك.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 md:pb-6 antialiased dir-rtl select-none">
      
      {/* Simplified Header with App Share Option */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors border border-amber-500/30"
                title="الرجوع للرئيسية"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow shadow-indigo-600/30">
              ن
            </div>
            <div>
              <h1 className="text-xs font-bold text-white leading-tight">مركز النجاح للتدريب</h1>
              <p className="text-[9px] text-indigo-400 font-bold">بوابة ولي الأمر الذكية</p>
            </div>
          </div>

          {/* Action Header Buttons & Share */}
          <div className="flex items-center gap-2">
            <ThemeQuickSwitcher />
            <button
              onClick={handleShareApp}
              className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-colors flex items-center gap-1 text-[10px] font-bold"
              title="مشاركة تطبيق الطالب"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاركة تطبيق الطالب</span>
            </button>

            {children.length > 0 && (
              <>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 relative transition-all active:scale-95"
                  title="مراسلة الإدارة والمدرب"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900 animate-pulse"></span>
                </button>

                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 relative transition-all active:scale-95"
                  title="التنبيهات والإشعارات"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleOpenParentProfile}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 transition-all active:scale-95 flex items-center gap-1"
                  title="الملف الشخصي لولي الأمر"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline text-[10px] font-bold">حسابي</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-95"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Connectivity & Emergency Offline Warning Banner */}
      {(!isOnline || isOfflineFallback) && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 border-b border-indigo-500/40 text-white font-bold text-xs py-2 px-4 shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 animate-pulse shrink-0 text-amber-400" />
            <span>⚠️ وضع الطوارئ نشط: أنت تعمل دون اتصال بالإنترنت حالياً. تم تحميل آخر بيانات مسجلة محلياً لولي الأمر ومتابعة الأبناء.</span>
          </div>
        </div>
      )}

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">

        {/* LOGIN SCREEN (If not logged in) */}
        {children.length === 0 ? (
          <div className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">تسجيل دخول بوابة ولي الأمر</h2>
              <p className="text-xs text-slate-400">أدخل كود الطالب أو رقم هاتف ولي الأمر المسجل للوصول لتقارير الأبناء مباشرة</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كود الطالب أو رقم الهاتف المسجل</label>
                <input
                  type="text"
                  required
                  value={codeOrPhone}
                  onChange={(e) => setCodeOrPhone(e.target.value)}
                  placeholder="مثال: A001 أو 01001500686"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-mono text-center"
                />
              </div>

              {requiresPassword && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة مرور البوابة</label>
                  <input
                    type="password"
                    required
                    value={parentPasswordInput}
                    onChange={(e) => setParentPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-mono text-center"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Keep login persistent notice */}
              <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <input
                  type="checkbox"
                  id="remember_parent_login"
                  defaultChecked
                  disabled
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30 w-4.5 h-4.5 cursor-not-allowed"
                />
                <label htmlFor="remember_parent_login" className="text-[10px] text-slate-300 font-bold cursor-not-allowed select-none">
                  حفظ بيانات تسجيل الدخول تلقائياً على هذا الجهاز
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'جاري التحقق من سجلات الأبناء...' : 'دخول ومتابعة الأبناء 🔍'}
              </button>
            </form>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <button
                type="button"
                onClick={handleInstallPwa}
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Smartphone className="w-4 h-4" />
                <span>تثبيت البوابة كتطبيق على هاتفك PWA</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGGED IN DASHBOARD */
          <div className="space-y-5">

            {/* 3. PROMINENT ELEGANT CHILD SELECTOR BAR (Royal Vibrant Theme) */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-4 sm:p-5 rounded-3xl border border-purple-500/40 shadow-xl shadow-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
              
              {/* Selected Child Info Badge */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="relative shrink-0">
                  {selectedChild?.photoUrl || (selectedChild as any)?.photo ? (
                    <img 
                      src={selectedChild?.photoUrl || (selectedChild as any)?.photo} 
                      alt={selectedChild?.fullName} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-purple-950"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-amber-300 shadow-md">
                      {selectedChild?.fullName?.charAt(0) || 'ط'}
                    </div>
                  )}
                  <button
                    onClick={handleOpenStudentEdit}
                    title="تعديل صورة وبيانات الطالب"
                    className="absolute -bottom-1 -left-1 p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg border border-purple-900 shadow transition-transform hover:scale-110"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">{selectedChild?.fullName}</h2>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedChild?.code}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 mt-0.5">
                    البرنامج: <span className="text-amber-300 font-black">{selectedChild?.courseName || 'الدورة التدريبية'}</span> • المجموعة: <span className="text-purple-100 font-bold">{selectedChild?.groupName || 'المجموعة الأساسية'}</span>
                  </p>
                </div>
              </div>

              {/* Child Switcher Button (Opens popup modal) */}
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsChildSelectorOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>تغيير الابن للمتابعة ({children.length})</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 4. FACEBOOK PAGE STYLE TAB NAVIGATION */}
            <nav className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hidden md:flex items-center justify-between gap-1 shadow-md overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>الملف والمتابعة</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>الجدول والدورات</span>
              </button>

              <button
                onClick={() => setActiveTab('finance')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>المصروفات والسندات</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>المحادثات ({parentMessages.length})</span>
              </button>
            </nav>

            {/* TAB 1: OVERVIEW & QUICK STATS */}
            {activeTab === 'overview' && selectedChild && (
              <div className="space-y-5">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">نسبة الحضور</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedChild.totalAttendance > 0 
                        ? `${Math.round((selectedChild.attendanceCount / selectedChild.totalAttendance) * 100)}%` 
                        : '100%'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">حضر {selectedChild.attendanceCount} من أصل {selectedChild.totalAttendance || 1} محاضرة</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">رصيد النقاط</span>
                    </div>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{selectedChild.totalPoints || selectedChild.points || 0}</p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">نجمة مكافأة وتميز</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                      <Award className="w-4 h-4 text-rose-500" />
                      <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">الأوسمة والشارات</span>
                    </div>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{selectedChild.badges?.length || 0}</p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">وسام تكريم مكتسب</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">المتبقي</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selectedChild.remainingAmount || 0} ج.م</p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">رسوم متبقية للدورة</p>
                  </div>
                </div>

                {/* Next Lecture Widget */}
                {selectedChild.groupDetails && (
                  <NextLectureWidget groupDetails={selectedChild.groupDetails} variant="parent" />
                )}

                {/* Trainer Info Card */}
                {selectedChild.trainer && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                        {selectedChild.trainer.photoUrl ? (
                          <img src={selectedChild.trainer.photoUrl} alt={selectedChild.trainer.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <UserCheck className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold">المُحاضر / المدرب المباشر</span>
                        <h3 className="text-sm font-black text-white">{selectedChild.trainer.name}</h3>
                        <p className="text-xs text-slate-400">{selectedChild.trainer.specialty || 'مدرب معتمد بالمركز'}</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('messages');
                        setChatRecipientType('trainer');
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>مراسلة المدرب</span>
                    </button>
                  </div>
                )}

                {/* Badges Display */}
                {selectedChild.badges && selectedChild.badges.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>الأوسمة والشارات التكريمية للمتدرب</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedChild.badges.map((b) => (
                        <div key={b.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                          <span className="text-2xl">{b.icon || '🏅'}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{b.badgeTitle}</p>
                            <p className="text-[10px] text-slate-400">{b.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COURSES & SCHEDULE & ATTENDANCE */}
            {activeTab === 'courses' && selectedChild && (
              <div className="space-y-5">
                
                {/* Schedules */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>جدول المحاضرات والأيام الأسبوعية</span>
                  </h3>
                  {selectedChild.schedules && selectedChild.schedules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedChild.schedules.map((s, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{s.dayOfWeek}</span>
                          <span className="text-xs font-mono text-indigo-300 font-bold">{s.startTime} - {s.endTime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">المحاضرات قائمة بحسب المواعيد الرسمية للمجموعة.</p>
                  )}
                </div>

                {/* Attendance History */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>سجل الحضور والغياب التفصيلي</span>
                  </h3>
                  {selectedChild.attendance && selectedChild.attendance.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {selectedChild.attendance.map((att) => (
                        <div key={att.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-300">{att.date}</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            att.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {att.status === 'present' ? 'حاضر ✓' : 'غائب ✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">لا توجد سجلات حضور مسجلة بعد.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIALS & RECEIPTS */}
            {activeTab === 'finance' && selectedChild && (
              <div className="space-y-5">
                
                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400">إجمالي رسوم الدورة</span>
                    <p className="text-lg font-black text-white">{(selectedChild as any).coursePrice || (selectedChild as any).totalAmount || selectedChild.feeAmount || 0} ج.م</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400">المبلغ المدفوع</span>
                    <p className="text-lg font-black text-emerald-400">{selectedChild.paidAmount || 0} ج.م</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400">المبلغ المتبقي</span>
                    <p className="text-lg font-black text-rose-400">{selectedChild.remainingAmount || 0} ج.م</p>
                  </div>
                </div>

                {/* Action Card: Upload Receipt Proof */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-bold text-xs">
                      <Camera className="w-4 h-4" />
                      <span>إثبات السداد الإلكتروني 📸</span>
                    </div>
                    <p className="text-xs font-bold text-white">قم برفع صورة إيصال الدفع أو لقطة الشاشة ليتم تحقق واعتماد الخزينة</p>
                    <p className="text-[10px] text-slate-400">فودافون كاش • انستا باي • تحويل بنكي</p>
                  </div>
                  <button
                    onClick={() => {
                      setProofAmount(selectedChild.remainingAmount || 0);
                      setIsUploadProofModalOpen(true);
                    }}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4" />
                    <span>رفع صورة الإيصال الآن</span>
                  </button>
                </div>

                {/* Receipts History */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>سجل سندات القبض والدفعات المرفوعة</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {(selectedChild.payments || []).length} سند/طلب
                    </span>
                  </div>

                  {selectedChild.payments && selectedChild.payments.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedChild.payments.map((pmt) => {
                        const isApproved = pmt.status === 'approved' || !pmt.status;
                        const isPending = pmt.status === 'pending';
                        const isRejected = pmt.status === 'rejected';

                        return (
                          <div
                            key={pmt.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isPending
                                ? 'bg-amber-950/30 border-amber-500/40'
                                : isRejected
                                ? 'bg-rose-950/30 border-rose-500/40'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-amber-400 text-xs">
                                    سند #{pmt.receiptNumber || pmt.id}
                                  </span>
                                  {pmt.targetMonth && (
                                    <span className="py-0.5 px-2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                                      عن شهر: {pmt.targetMonth}
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="py-0.5 px-2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                                      <Clock className="w-3 h-3 animate-spin" />
                                      <span>قيد المراجعة والتحقق ⏳</span>
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="py-0.5 px-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>معتمد ومسدد ✅</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="py-0.5 px-2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                      ❌ مرفوض من الخزينة
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] text-slate-400">
                                  التاريخ: {pmt.date} • وسيلة السداد: {
                                    pmt.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                                    pmt.paymentMethod === 'instapay' ? 'انستا باي' :
                                    pmt.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'نقداً الخزينة'
                                  }
                                </p>

                                {pmt.notes && (
                                  <p className="text-[10px] text-slate-300 italic">ملاحظات: {pmt.notes}</p>
                                )}

                                {isRejected && pmt.rejectionReason && (
                                  <p className="text-[11px] text-rose-300 font-bold bg-rose-950/60 p-2 rounded-lg border border-rose-800/60 mt-1">
                                    سبب عدم الاعتماد: {pmt.rejectionReason}
                                  </p>
                                )}
                              </div>

                              <div className="text-left space-y-2 dir-ltr">
                                <span className="font-mono font-black text-emerald-400 text-base block">
                                  {pmt.amount} EGP
                                </span>

                                {isApproved && (
                                  <button
                                    onClick={() => setSelectedReceipt(pmt)}
                                    className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                                  >
                                    <Printer className="w-3 h-3 text-amber-400" />
                                    <span>طباعة الإيصال الرسمى</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">لا توجد طلبات أو سندات قبض مسجلة بعد.</p>
                  )}
                </div>

                {/* Electronic Payment Widget */}
                <ElectronicPaymentWidget
                  vodafoneCashNumber={paymentAccounts.vodafoneCash}
                  instapayAddress={paymentAccounts.instapay}
                  studentName={selectedChild.fullName}
                  defaultAmount={selectedChild.remainingAmount || 0}
                  adminPhone={paymentAccounts.vodafoneCash}
                  showTitle={true}
                />
              </div>
            )}

            {/* TAB 4: DIRECT MESSAGING CHAT FEED */}
            {activeTab === 'messages' && selectedChild && (
              <div className="space-y-5">
                
                {/* Send Message Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>إرسال رسالة جديدة للإدارة أو المدرب</span>
                  </h3>

                  <form onSubmit={handleSendChatMessage} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">الجهة الموجه إليها</label>
                        <select
                          value={chatRecipientType}
                          onChange={(e: any) => setChatRecipientType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        >
                          <option value="admin">إدارة المركز العامة</option>
                          <option value="trainer">المدرب المباشر ({selectedChild.trainer?.name || 'المدرب'})</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">نوع الرسالة</label>
                        <select
                          value={chatMessageType}
                          onChange={(e: any) => setChatMessageType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        >
                          <option value="message">💬 استفسار / ملاحظة عامة</option>
                          <option value="greeting">🌹 بطاقة شكر وتكريم</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        placeholder="اكتب استفسارك أو ملاحظتك هنا ليصل مباشرة للإدارة والمدرب..."
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {chatSuccessNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{chatSuccessNotice}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSendingChatMessage}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingChatMessage ? 'جاري إرسال الرسالة...' : 'إرسال الرسالة الآن 🚀'}</span>
                    </button>
                  </form>
                </div>

                {/* Message History Thread */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>سجل الرسائل والردود الردود الفورية</span>
                  </h3>

                  {parentMessages && parentMessages.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {parentMessages.map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl border ${
                            m.senderName?.includes('المساعد') || m.messageType === 'ai_reply'
                              ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 mr-4'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold text-indigo-400">{m.parentName || m.senderName || 'ولي الأمر'}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">لا توجد رسائل سابقة. يمكنك إرسال استفسارك من النموذج أعلاه.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. CHILD SELECTOR MODAL (When tapping Switch Child) */}
      {isChildSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>اختر الابن للمتابعة ({children.length})</span>
              </h3>
              <button
                onClick={() => setIsChildSelectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setIsChildSelectorOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                    selectedChild?.id === child.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {child.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{child.fullName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{child.courseName} • كود: {child.code}</p>
                    </div>
                  </div>
                  {selectedChild?.id === child.id && (
                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. PARENT ACCOUNT PROFILE & SETTINGS MODAL */}
      {isProfileSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>إعدادات ملف ولي الأمر الشخصي</span>
              </h3>
              <button
                onClick={() => setIsProfileSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParentProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم ولي الأمر</label>
                <input
                  type="text"
                  required
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الرقم القومي لولي الأمر (14 رقم)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={editParentNationalId}
                  onChange={(e) => setEditParentNationalId(e.target.value)}
                  placeholder="أدخل الرقم القومي..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editParentEmail}
                  onChange={(e) => setEditParentEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف الأساسي</label>
                <input
                  type="text"
                  required
                  value={editParentPhone}
                  onChange={(e) => setEditParentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">العنوان السكني</label>
                <input
                  type="text"
                  value={editParentAddress}
                  onChange={(e) => setEditParentAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة مرور دخول البوابة</label>
                <input
                  type="password"
                  value={editParentPassword}
                  onChange={(e) => setEditParentPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور جديدة أو اتركها كما هي..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center"
                />
              </div>

              {parentProfileSaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center">
                  {parentProfileSaveMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingParentProfile}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-all"
              >
                {isSavingParentProfile ? 'جاري الحفظ...' : 'حفظ البيانات المحدثة ✓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. STUDENT INFO EDIT MODAL */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>تحديث بيانات الطالب ({selectedChild?.fullName})</span>
              </h3>
              <button
                onClick={() => setIsEditStudentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentInfo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الرقم القومي للطالب (14 رقم)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={editStudentNationalId}
                  onChange={(e) => setEditStudentNationalId(e.target.value)}
                  placeholder="أدخل الرقم القومي للطالب..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم هاتف الطالب المباشر</label>
                <input
                  type="text"
                  value={editStudentPhone}
                  onChange={(e) => setEditStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center"
                />
              </div>

              {studentUpdateMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center">
                  {studentUpdateMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingStudent}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-all"
              >
                {isUpdatingStudent ? 'جاري الحفظ...' : 'تحديث بيانات الطالب ✓'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. NOTIFICATIONS DRAWER */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>مركز الإشعارات والتنبيهات</span>
              </h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <p className="font-bold text-amber-400">🎉 أهلاً بك في بوابة ولي الأمر الرسمية</p>
                <p className="text-slate-300">يمكنك الآن متابعة نسبة حضور الأبناء، الدرجات، والمصروفات أولاً بأول.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PAYMENT PROOF MODAL */}
      {isUploadProofModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Camera className="w-5 h-5" />
                <span>رفع صورة إيصال الدفع / لقطة الشاشة</span>
              </div>
              <button
                onClick={() => {
                  setIsUploadProofModalOpen(false);
                  setProofImageBase64('');
                  setProofNoticeMsg('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentProof} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedChild.fullName} (${selectedChild.code || ''})`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">المبلغ المسدد (ج.م): *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={proofAmount || ''}
                    onChange={(e) => setProofAmount(Number(e.target.value))}
                    placeholder="مثال: 350"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-black font-mono focus:border-emerald-500 outline-none text-base"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">الشهر / القسط المسدد عنه: *</label>
                  <select
                    value={proofMonth}
                    onChange={(e) => setProofMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:border-emerald-500 outline-none"
                  >
                    <option value="أغسطس 2026">أغسطس 2026</option>
                    <option value="سبتمبر 2026">سبتمبر 2026</option>
                    <option value="أكتوبر 2026">أكتوبر 2026</option>
                    <option value="نوفمبر 2026">نوفمبر 2026</option>
                    <option value="ديسمبر 2026">ديسمبر 2026</option>
                    <option value="القسط الأول">القسط الأول</option>
                    <option value="القسط الثاني">القسط الثاني</option>
                    <option value="كامل قيمة الدورة">كامل قيمة الدورة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">طريقة السداد المستخدمة: *</label>
                <select
                  value={proofMethod}
                  onChange={(e) => setProofMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:border-emerald-500 outline-none"
                >
                  <option value="vodafone_cash">📱 فودافون كاش (Vodafone Cash)</option>
                  <option value="instapay">⚡ انستا باي (InstaPay)</option>
                  <option value="bank_transfer">🏛️ تحويل بنكي (Bank Transfer)</option>
                  <option value="cash">💵 تحويل نقدي / مباشر</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">إرفاق صورة الإيصال أو لقطة الشاشة: *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChangeForProof}
                  className="hidden"
                  id="receipt-proof-file-input"
                />
                <label
                  htmlFor="receipt-proof-file-input"
                  className="w-full p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
                >
                  {proofImageBase64 ? (
                    <div className="space-y-2">
                      <img src={proofImageBase64} alt="إيصال الدفع" className="h-32 object-contain rounded-lg mx-auto border border-emerald-500" />
                      <span className="text-emerald-400 font-bold block text-[11px]">✓ تم اختيار صورة الإيصال بنجاح (انقر لتغييرها)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Camera className="w-8 h-8 text-amber-400 mx-auto" />
                      <span className="text-slate-300 font-bold block text-xs">اختر صورة الإيصال أو لقطة الشاشة</span>
                      <span className="text-slate-500 text-[10px]">يدعم الصور بصيغة PNG أو JPG</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ملاحظات ولي الأمر (اختياري):</label>
                <input
                  type="text"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="مثال: تم التحويل من رقم الهاتف 01012345678 باسم..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              {proofNoticeMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-center">
                  {proofNoticeMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingProof || !proofImageBase64 || !proofAmount}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmittingProof ? (
                  <span>جاري رفع الإيصال...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الإيصال للمراجعة والاعتماد ✓</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      <OfficialReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
        traineeName={selectedChild?.fullName}
        traineeCode={selectedChild?.code}
        courseName={selectedChild?.courseName}
        centerSettings={{
          name: 'مركز النجاح للتدريب والتكنولوجيا',
          vodafoneCash: paymentAccounts.vodafoneCash
        }}
      />

      {/* FOOTER */}
      <footer className="mt-12 text-center text-[11px] text-slate-500 space-y-1">
        <p>جميع الحقوق محفوظة © مركز النجاح للتدريب والاستشارات • بوابة ولي الأمر الذكية</p>
      </footer>

      {/* Mobile Bottom Navigation Bar for Parents */}
      {children.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex justify-around py-2 px-1 shadow-2xl md:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'overview' ? 'text-indigo-400 scale-105' : 'text-slate-400'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[9px] font-bold">الملف والمتابعة</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'courses' ? 'text-indigo-400 scale-105' : 'text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[9px] font-bold">الجدول والدورات</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'finance' ? 'text-indigo-400 scale-105' : 'text-slate-400'}`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[9px] font-bold">المصروفات والسندات</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${activeTab === 'messages' ? 'text-indigo-400 scale-105' : 'text-slate-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold">المحادثات ({parentMessages.length})</span>
          </button>
        </div>
      )}

      {/* Session Celebration Overlay for Parent */}
      <SessionCelebrationOverlay
        isOpen={showCelebrationOverlay}
        onClose={() => setShowCelebrationOverlay(false)}
        sessionTitle={celebrationData.title || `محاضرة ${selectedChild?.groupName || 'النجاح'}`}
        groupName={selectedChild?.groupName || 'المجموعة التدريبية'}
        courseName={selectedChild?.courseName || 'الدورة التدريبية'}
        starWinnerName={celebrationData.winnerName}
        starWinnerPoints={celebrationData.winnerPoints}
      />

    </div>
  );
};
