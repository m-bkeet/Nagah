import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { api, request } from '../services/api';
import { audioService } from '../services/audioService';
import { NagahProQuizModal } from '../components/NagahProQuizModal';
import { Trainee } from '../types';
import {
  getTraineePaymentStatusInfo,
  isPaymentReminderWindow,
  isTraineeUnpaid
} from '../utils/paymentUtils';
import { verifyStudentLabEntryAllowed } from '../utils/labSecurity';
import {
  Monitor,
  Globe,
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  Award,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Tv,
  Video,
  VideoOff,
  LogOut,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Clock,
  Play,
  Square,
  Share2,
  HardDrive,
  Trophy,
  Star,
  Flame,
  Zap,
  Crown,
  Camera,
  Cpu,
  Medal,
  X,
  Search,
  Code2,
  FolderOpen,
  Palette,
  Terminal,
  Calculator,
  Send,
  CornerDownLeft,
  Trash2,
  Sun,
  Moon,
  Maximize,
  Minimize
} from 'lucide-react';

export const StudentKioskView: React.FC = () => {
  const [deviceId, setDeviceId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    let dev = params.get('device') || sessionStorage.getItem('nagah_device_id');
    if (!dev) {
      dev = `PC-${Math.floor(10 + Math.random() * 90)}`;
      sessionStorage.setItem('nagah_device_id', dev);
    }
    return dev;
  });

  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [currentTrainee, setCurrentTrainee] = useState<any>(null);
  const [attendanceInfo, setAttendanceInfo] = useState<any>(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cloud & Local Network Security Verification State
  const [isSecurityVerified, setIsSecurityVerified] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') === 'nagah_lab_secure' || params.get('pin') === '1234') return true;
    if (localStorage.getItem('nagah_lab_auth_verified') === 'true') return true;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.endsWith('.local')) {
      return true;
    }
    return false;
  });
  const [securityPinInput, setSecurityPinInput] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Agent State Polling
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [activeNagahQuiz, setActiveNagahQuiz] = useState<any>(null);
  const [activeCeremony, setActiveCeremony] = useState<any>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [activeSessionId, setActiveSessionId] = useState<string>('session-live');
  const [activeExternalSession, setActiveExternalSession] = useState<any>(null);
  const [kahootPinInput, setKahootPinInput] = useState('');
  const [isLockedByMaster, setIsLockedByMaster] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  // Enforce Browser Fullscreen & Suppress All Device Inputs during Lock Screen Mode (Veyon Master Grade)
  useEffect(() => {
    if (!isLockedByMaster) return;

    // 1. Request Browser Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // 2. Prevent All Keyboard & Right-click Inputs
    const blockInputs = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Block common escape shortcuts
      if (e.key === 'F11' || e.key === 'Escape' || e.altKey || e.ctrlKey) {
        e.preventDefault();
      }
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', blockInputs, true);
    window.addEventListener('keypress', blockInputs, true);
    window.addEventListener('contextmenu', blockInputs, true);
    window.addEventListener('wheel', blockInputs, { passive: false, capture: true });
    window.addEventListener('touchmove', blockInputs, { passive: false, capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', blockInputs, true);
      window.removeEventListener('keypress', blockInputs, true);
      window.removeEventListener('contextmenu', blockInputs, true);
      window.removeEventListener('wheel', blockInputs, true);
      window.removeEventListener('touchmove', blockInputs, true);
    };
  }, [isLockedByMaster]);
  const [masterBroadcast, setMasterBroadcast] = useState<any>(null);
  const [isBroadcastAudioMuted, setIsBroadcastAudioMuted] = useState(false);
  const broadcastAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (masterBroadcast?.isBroadcasting && masterBroadcast?.streamAudioChunk && !isBroadcastAudioMuted && broadcastAudioRef.current) {
      broadcastAudioRef.current.src = masterBroadcast.streamAudioChunk;
      broadcastAudioRef.current.play().catch(() => {});
    }
  }, [masterBroadcast?.streamAudioChunk, isBroadcastAudioMuted]);

  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [remoteAssist, setRemoteAssist] = useState<any>(null);

  // Interactive Windows Desktop Kiosk State
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAppWindow, setActiveAppWindow] = useState<'search' | 'code' | 'files' | 'quiz' | 'paint' | 'calc' | 'terminal' | null>(null);
  const [codeInputValue, setCodeInputValue] = useState('# كود البرمجة للتطبيق العملي (مركز النجاح للتدريب):\ndef calculate_points(stars):\n    return stars * 10\n\nprint("أهلاً بك في المعمل العملي!")\n');
  const [currentTime, setCurrentTime] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Microsoft Windows Kiosk Terminal [Version 10.0.19045.3803]',
    'مركز النجاح للتدريب والاستشارات - المعمل البرمجي المباشر',
    'جاهز لتنفيذ الأوامر وإشارات الكيبورد والماوس المباشرة v2.0'
  ]);
  const [paintColor, setPaintColor] = useState('#22d3ee');
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Reinforcement & Kudos State
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeReinforcement, setActiveReinforcement] = useState<{
    title: string;
    message: string;
    stars: number;
    points: number;
    icon: string;
    trainerName: string;
    badgeText: string;
    timestamp: number;
  } | null>(null);
  const [showRankSparkle, setShowRankSparkle] = useState(false);

  // Payment Subscription Reminder Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Trigger payment subscription reminder modal automatically every time an unpaid trainee logs in between 28th and 5th
  useEffect(() => {
    if (currentTrainee && isPaymentReminderWindow() && isTraineeUnpaid(currentTrainee)) {
      setShowPaymentModal(true);
    } else {
      setShowPaymentModal(false);
    }
  }, [currentTrainee?.id, currentTrainee?.code]);

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({
    fullName: '',
    phone: '',
    nationalId: '',
    birthDate: '',
    photoUrl: '',
    themeColor: 'amber'
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrainee) return;
    try {
      const res = await api.updateTrainee(currentTrainee.id, profileEditForm);
      if (res.success && res.trainee) {
        setCurrentTrainee({
          ...res.trainee,
          stats: currentTrainee.stats
        });
        setActiveNotification('تم تحديث ملفك الشخصي، صورتك، ولون الصفحة بنجاح وتزامن مع الإدارة! ✨');
        setIsProfileModalOpen(false);
      }
    } catch (err: any) {
      setActiveNotification(err.message || 'فشل تحديث البيانات');
    }
  };

  // Floating Widget & Theme States
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Timer State for practical tasks
  const [taskTimer, setTaskTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTaskTimer(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Screen Sharing / Recording state
  const [isSharingToMaster, setIsSharingToMaster] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPracticalMode, setIsPracticalMode] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    if (isPracticalMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isPracticalMode]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = document.createElement('video');
    v.muted = true;
    v.autoplay = true;
    v.playsInline = true;
    hiddenVideoRef.current = v;
  }, []);

  // Audio Chime Synthesizer for Kudos & Reinforcements
  const playCelebrationFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      // Audio playback allowed upon user interaction
    }
  };

  // Save deviceId in localStorage
  useEffect(() => {
    localStorage.setItem('nagah_device_id', deviceId);
  }, [deviceId]);

  // Live Clock Updater for Taskbar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fast 250ms polling loop for instant responsive remote control from trainer
  useEffect(() => {
    const fastPoll = setInterval(async () => {
      try {
        const assistRes = await api.getRemoteAssistState(deviceId);
        if (assistRes.assistState && Date.now() - (assistRes.assistState.timestamp || 0) < 10000) {
          setRemoteAssist(assistRes.assistState);
        }
      } catch (e) {
        // quiet
      }
    }, 250);
    return () => clearInterval(fastPoll);
  }, [deviceId]);

  // Remote Mouse & Keyboard Click Emulation
  useEffect(() => {
    if (!remoteAssist) return;
    const eventTime = remoteAssist.timestamp || Date.now();
    if (Date.now() - eventTime > 8000) return;

    if (remoteAssist.action === 'click') {
      const x = (window.innerWidth * (remoteAssist.cursorX ?? 50)) / 100;
      const y = (window.innerHeight * (remoteAssist.cursorY ?? 50)) / 100;
      
      const el = document.elementFromPoint(x, y) as HTMLElement;
      if (el) {
        // Trigger a visual click ripple on the trainee's page
        const ripple = document.createElement('div');
        ripple.className = 'fixed w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-400/30 animate-ping pointer-events-none z-[200] shadow-2xl';
        ripple.style.left = `${x - 20}px`;
        ripple.style.top = `${y - 20}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);

        // Click and focus
        el.click();
        el.focus();
      }
    } else if (remoteAssist.action === 'keyboard' && remoteAssist.key) {
      const k = remoteAssist.key;

      if (k === 'Start' || k === 'Meta' || k === 'Super') {
        setIsStartMenuOpen(prev => !prev);
        return;
      }
      if (k === 'Escape') {
        setIsStartMenuOpen(false);
        setActiveAppWindow(null);
        return;
      }

      let activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;

      // If no active input element, default focus to Taskbar Search Bar
      if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
        const searchBox = document.getElementById('windows-taskbar-search-input') as HTMLInputElement;
        if (searchBox) {
          searchBox.focus();
          activeEl = searchBox;
        }
      }

      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        const start = activeEl.selectionStart || 0;
        const end = activeEl.selectionEnd || 0;
        const text = activeEl.value;

        if (k === 'Backspace') {
          if (start === end && start > 0) {
            activeEl.value = text.substring(0, start - 1) + text.substring(end);
            activeEl.selectionStart = activeEl.selectionEnd = start - 1;
          } else {
            activeEl.value = text.substring(0, start) + text.substring(end);
            activeEl.selectionStart = activeEl.selectionEnd = start;
          }
        } else if (k === 'Enter') {
          const evt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
          activeEl.dispatchEvent(evt);
        } else if (k.length === 1 || k === ' ') {
          const char = k === ' ' ? ' ' : k;
          activeEl.value = text.substring(0, start) + char + text.substring(end);
          activeEl.selectionStart = activeEl.selectionEnd = start + char.length;
        } else {
          activeEl.value = text.substring(0, start) + k + text.substring(end);
          activeEl.selectionStart = activeEl.selectionEnd = start + k.length;
        }
        
        // Trigger input event so React state syncs up
        const event = new Event('input', { bubbles: true });
        activeEl.dispatchEvent(event);
      }
    }
  }, [remoteAssist]);

  // Heartbeat Loop (Uses recursive setTimeout to prevent lag pile-up)
  const isMonitoringRef = useRef(false);
  const skipScreenshotCounter = useRef(0);

  useEffect(() => {
    let isSubscribed = true;
    let timerId: any;

    const performHeartbeat = async () => {
      if (!isSubscribed) return;

      try {
        let screenshotData: string | undefined = undefined;
        
        // Only take screenshot if being actively monitored, or every 10th heartbeat to save CPU
        const shouldTakeScreenshot = isMonitoringRef.current || skipScreenshotCounter.current % 10 === 0;
        skipScreenshotCounter.current++;

        if (shouldTakeScreenshot) {
          try {
            const rootElement = document.getElementById('student-kiosk-root');
            if (rootElement) {
              const canvas = await html2canvas(rootElement, {
                scale: 0.25, 
                logging: false,
                useCORS: true,
                backgroundColor: '#020617',
                imageTimeout: 300,
                removeContainer: true,
                ignoreElements: (el) => el.tagName === 'VIDEO' || el.classList.contains('no-capture') || el.classList.contains('fixed')
              });
              screenshotData = canvas.toDataURL('image/jpeg', 0.2);
            }
          } catch (e) {
            console.error('Screenshot failed:', e);
          }
        }

        const res = await api.sendAgentHeartbeat({
          deviceId,
          name: `جهاز ${deviceId}`,
          ip: window.location.hostname,
          screenshot: screenshotData,
          currentTraineeCode: currentTrainee?.code,
          currentTraineeName: currentTrainee?.fullName
        });

        if (!isSubscribed) return;

        isMonitoringRef.current = !!res.isMonitoring;

        // Process incoming commands from trainer / master console
        if (res.commands && res.commands.length > 0) {
          res.commands.forEach((cmd: any) => {
            if (cmd.commandType === 'lock') {
              setIsLockedByMaster(true);
              if (cmd.payload) setLockMessage(typeof cmd.payload === 'string' ? cmd.payload : cmd.payload?.text || 'تم قفل جهاز المعمل بواسطة المحاضر المشرف');
            } else if (cmd.commandType === 'unlock') {
              setIsLockedByMaster(false);
              setLockMessage('');
            } else if (cmd.commandType === 'message') {
              const msg = typeof cmd.payload === 'string' ? cmd.payload : cmd.payload?.text || '';
              if (msg) setLoginMessage(msg);
            } else if (cmd.commandType === 'award_points') {
              playCelebrationFanfare();
              setLoginMessage('🎉 تهانينا! تم منحك نقاط تميز إضافية من المحاضر المشرف!');
            } else if (cmd.commandType === 'open_url') {
              const url = typeof cmd.payload === 'string' ? cmd.payload : cmd.payload?.url;
              if (url) window.open(url, '_blank');
            }
          });
        }

        if (res.traineeStats) {
          setCurrentTrainee((prev: any) => {
            if (!prev) return null;
            return {
              ...prev,
              fullName: res.traineeStats?.fullName || prev.fullName,
              points: res.traineeStats?.points ?? prev.points,
              totalPoints: res.traineeStats?.totalPoints ?? prev.totalPoints,
              stats: res.traineeStats
            };
          });
        }

        if (res.deviceStatus === 'locked') {
          setIsLockedByMaster(true);
        } else if (res.deviceStatus === 'active' && !lockMessage) {
          setIsLockedByMaster(false);
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      } finally {
        if (isSubscribed) {
          timerId = setTimeout(performHeartbeat, 1500); // 1.5 seconds wait BEFORE next heartbeat
        }
      }
    };

    performHeartbeat();

    const handleBeforeUnload = () => {
      try {
        const payload = JSON.stringify({ deviceId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/agent/leave', new Blob([payload], { type: 'application/json' }));
        }
      } catch (e) {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isSubscribed = false;
      clearTimeout(timerId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [deviceId, lockMessage]);

  // Recording timer
  useEffect(() => {
    let t: any;
    if (isRecording) {
      t = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const speakNaturalText = async (text: string) => {
    await audioService.speakText(text);
  };

  // Effect to handle speaking ceremony steps automatically for students
  useEffect(() => {
    if (!activeCeremony) return;

    const step = activeCeremony.step;
    const top3 = activeCeremony.top3;
    if (!top3 || top3.length === 0) return;

    if (step === 1 && top3[2]) {
      speakNaturalText(`يا جماعة معانا النهاردة في المركز التالت البطل اللي منورنا، ${top3[2].fullName}! وحش بجد وعمل مجهود جبار، سقفوله يا شباب!`);
    } else if (step === 2 && top3[1]) {
      speakNaturalText(`ودلوقتي.. المركز التاني اللي كسر الدنيا النهاردة.. البرنس ${top3[1].fullName}! إيه الحلاوة دي يا بطل، برافو عليك جداً!`);
    } else if (step === 3 && top3[0]) {
      speakNaturalText(`وصلنا للحظة اللي الكل مستنيها.. بطل النهاردة اللي مفيش زيه، النجم اللي رفع التاج وخد المركز الأول هووو.. ${top3[0].fullName}! مبروك يا أسطورة، أنت النهاردة ملك القاعة!`);
    }
  }, [activeCeremony?.step, activeCeremony?.timestamp]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError('');
    setLoginMessage('');

    // Strict Lab Security Verification
    const securityCheck = verifyStudentLabEntryAllowed();
    if (!securityCheck.allowed) {
      setLoginError(securityCheck.reasonArabic);
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await api.studentCodeLogin({
        codeOrPhone: studentCodeInput,
        deviceId,
        deviceName: `جهاز ${deviceId}`
      });

      const traineeObj: any = {
        ...res.trainee,
        stats: res.trainee.stats
      };
      setCurrentTrainee(traineeObj);
      setProfileEditForm({
        fullName: traineeObj.fullName || '',
        phone: traineeObj.phone || '',
        nationalId: traineeObj.nationalId || '',
        birthDate: traineeObj.birthDate || '',
        photoUrl: traineeObj.photoUrl || '',
        themeColor: traineeObj.themeColor || 'amber'
      });
      setAttendanceInfo(res.attendance);
      setLoginMessage(res.message);
      playCelebrationFanfare();

      // Check monthly payment reminder window (from day 28 to day 5) upon opening hall
      if (isPaymentReminderWindow() && isTraineeUnpaid(traineeObj)) {
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      setLoginError(err.message || 'كود المتدرب غير صحيح أو غير مسجل في النظام');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStartScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Request screen and device/system audio (Zoom style)
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 15 },
          audio: true
        });

        // Request microphone audio for trainee voice
        let micStream = null;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e) {
          console.log('Microphone permission not granted or available', e);
        }

        let combinedAudioTrack = null;
        if (displayStream.getAudioTracks().length > 0 || (micStream && micStream.getAudioTracks().length > 0)) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const dest = audioCtx.createMediaStreamDestination();

            if (displayStream.getAudioTracks().length > 0) {
              const source1 = audioCtx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
              source1.connect(dest);
            }
            if (micStream && micStream.getAudioTracks().length > 0) {
              const source2 = audioCtx.createMediaStreamSource(new MediaStream(micStream.getAudioTracks()));
              source2.connect(dest);
            }

            const mixedTracks = dest.stream?.getAudioTracks() || [];
            if (mixedTracks.length > 0) {
              combinedAudioTrack = mixedTracks[0];
            }
          } catch (err) {
            console.warn('Audio mixing failed', err);
            const tracks = displayStream.getAudioTracks?.() || [];
            if (tracks.length > 0) {
              combinedAudioTrack = tracks[0];
            }
          }
        }

        const videoTracks = displayStream.getVideoTracks?.() || [];
        const tracks: MediaStreamTrack[] = videoTracks.length > 0 ? [videoTracks[0]] : [];
        if (combinedAudioTrack) {
          tracks.push(combinedAudioTrack);
        }
        const stream = new MediaStream(tracks);

        streamRef.current = stream;
        if (hiddenVideoRef.current) { hiddenVideoRef.current.srcObject = stream; hiddenVideoRef.current.play().catch(() => {}); } setIsSharingToMaster(true);

        const firstVid = stream.getVideoTracks?.()?.[0];
        if (firstVid) {
          firstVid.onended = () => {
            setIsSharingToMaster(false);
            if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = null; streamRef.current = null;
            if (micStream) micStream.getTracks().forEach(t => t.stop());
          };
        }
      }
    } catch (err) {
      console.warn('Screen share cancelled or not allowed', err);
    }
  };

  const handleStopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = null; streamRef.current = null;
    }
    setIsSharingToMaster(false);
  };

  const handleStartRecording = async () => {
    try {
      const stream =
        streamRef.current ||
        (await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }));
      streamRef.current = stream;
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        await api.uploadStudentRecording({
          deviceId,
          traineeId: currentTrainee?.id,
          traineeName: currentTrainee?.fullName,
          stepsLog: [{ time: new Date().toISOString(), event: 'تم إنهاء التسجيل بنجاح' }],
          durationSeconds: recordingSeconds
        });
        setActiveNotification('تم حفظ وتوثيق تسجيل شاشتك وإرساله للمدرب بنجاح! 🎬');
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.warn('Recording error:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCleanResetLocal = () => {
    setCurrentTrainee(null);
    setAttendanceInfo(null);
    setReceivedFiles([]);
    setStudentCodeInput('');
    setIsLockedByMaster(false);
    handleStopScreenShare();
  };

  const handleManualReset = async () => {
    // Replaced window.confirm with direct action due to iframe restrictions
    try {
      await api.resetDeviceSession(deviceId);
      handleCleanResetLocal();
    } catch (e) {
      handleCleanResetLocal();
    }
  };

  // Trainee stats helpers
  const traineePoints = currentTrainee?.points || currentTrainee?.totalPoints || currentTrainee?.stats?.points || 0;
  const starsCount = currentTrainee?.stats?.starsCount || Math.max(1, Math.floor(traineePoints / 10));
  const groupRank = currentTrainee?.stats?.groupRank || 1;
  const overallRank = currentTrainee?.stats?.overallRank || 1;
  const rankBadge = currentTrainee?.stats?.rankBadge || (overallRank === 1 ? '🥇' : overallRank === 2 ? '🥈' : overallRank === 3 ? '🥉' : '🏅');
  const tierName = currentTrainee?.stats?.tierName || (traineePoints >= 150 ? 'متألق أسطوري 🌟' : traineePoints >= 80 ? 'متقدم ذهبي 🏆' : traineePoints >= 30 ? 'نشط فضي 🥈' : 'مبتدئ صاعد ⭐');

  return (
    <div id="student-kiosk-root" className={`min-h-screen flex flex-col font-sans select-none relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      
      {/* Security Verification Overlay for Cloud / Remote Access */}
      {!isSecurityVerified && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-6 dir-rtl">
          <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-2xl animate-pulse">
            <Lock className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-black text-white">🔐 كود أمان المعمل السحابي</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              تنبيه أمان: هذه الواجهة مخصصة لتشغيل أجهزة معمل الكمبيوتر بالمركز. أدخل كود الأمان المعتمد من المحاضر للمتابعة (رمز الأمان الافتراضي: <span className="text-cyan-300 font-bold font-mono">1234</span>).
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSecurityError('');
              if (securityPinInput.trim() === '1234' || securityPinInput.trim() === 'nagah') {
                setIsSecurityVerified(true);
                localStorage.setItem('nagah_lab_auth_verified', 'true');
              } else {
                setSecurityError('كود الأمان غير صحيح. تواصل مع المدرب للرمز المعتمد.');
              }
            }}
            className="w-full max-w-xs space-y-3"
          >
            <input
              type="password"
              placeholder="أدخل كود أمان المعمل (PIN)"
              value={securityPinInput}
              onChange={e => setSecurityPinInput(e.target.value)}
              className="w-full text-center text-lg font-mono tracking-widest bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl text-cyan-300 focus:border-cyan-400 focus:outline-none"
              autoFocus
            />

            {securityError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-950/40 p-2 rounded-xl border border-rose-500/30">
                {securityError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
            >
              التحقق والدخول للمعمل 🚀
            </button>
          </form>

          <button
            onClick={() => {
              setIsSecurityVerified(true);
              localStorage.setItem('nagah_lab_auth_verified', 'true');
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            💡 تخطي مؤقت (وضع الاختبار المحلي)
          </button>
        </div>
      )}
      
      {/* Audio Context Interaction Overlay (Enforce user gesture for sound/TTS) */}
      {!hasInteracted && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8 backdrop-blur-2xl">
           <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl animate-pulse rounded-full" />
              <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-bounce">
                <Monitor className="w-16 h-16" />
              </div>
           </div>
           
           <div className="space-y-3">
             <h2 className="text-4xl font-black text-white drop-shadow-lg">أهلاً بك في معمل النجاح! 🚀</h2>
             <p className="text-lg text-slate-400 max-w-lg font-medium leading-relaxed">
               أنت الآن على وشك الدخول للجلسة التفاعلية المباشرة. اضغط على الزر بالأسفل لتفعيل الصوت والمؤثرات والاستعداد للشرح.
             </p>
           </div>

           <button
             onClick={() => {
               setHasInteracted(true);
               playCelebrationFanfare();
               // Unblock audio context
               const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
               if (AudioCtx) {
                 const ctx = new AudioCtx();
                 if (ctx.state === 'suspended') ctx.resume();
               }
               speakNaturalText("أهلاً بك يا بطل في معمل النجاح الذكي.. أنا جاهز لمساعدتك في أي وقت!");
             }}
             className="group relative px-12 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-2xl rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all active:scale-95 hover:-translate-y-1 flex items-center gap-3"
           >
             <span>دخول الجلسة الآن ✅</span>
             <Play className="w-6 h-6 fill-slate-950 transition-transform group-hover:translate-x-1" />
           </button>

           <div className="flex items-center gap-4 text-xs text-slate-600 font-bold">
             <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> نظام تحكم Veyon Master V7</span>
             <span>•</span>
             <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> ID: {deviceId}</span>
           </div>
        </div>
      )}
      {/* 🌟 UNIFIED TOP HEADER BAR OR FLOATING WIDGET 🌟 */}
      {/* ========================================================================= */}
      {!currentTrainee && (
        <header className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-40" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-sm text-slate-100">عميل المعمل - مركز النجاح للتدريب</h1>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  {deviceId}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('nagah_is_lab_device');
                    window.location.href = window.location.pathname;
                  }}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all shadow"
                  title="العودة لاختيار الدور أو تسجيل دخول جديد للإدارة"
                >
                  <span>🔑 اختيار الدور / تسجيل جديد</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                الجهاز جاهز لتسجيل دخول المتدرب
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>متصل بسيرفر المعمل الرئيسي</span>
          </div>
        </header>
      )}

      {/* Floating Student Widget (Draggable) */}
      {currentTrainee && (
        <motion.div
          drag
          dragMomentum={false}
          className={`fixed top-4 right-4 z-50 flex flex-col gap-2 ${isWidgetExpanded ? 'w-64' : 'w-16'} transition-all duration-300`}
        >
          {/* Main Bubble (Collapsed State) */}
          <div
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 shadow-[0_8px_30px_rgba(245,158,11,0.3)] border-2 border-white/20 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-slate-900 font-black text-xl leading-none">{currentTrainee.fullName?.charAt(0) || 'م'}</span>
            <span className="text-[9px] text-slate-900 font-bold bg-white/30 px-1 rounded-full mt-1">⭐ {starsCount}</span>
          </div>

          {/* Expanded Menu */}
          <AnimatePresence>
            {isWidgetExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`flex flex-col gap-2 p-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-slate-200'} `}
              >
                {/* Header Info */}
                <div className={`text-center pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentTrainee.fullName}</h3>
                  <div className="text-[10px] text-amber-500 font-bold mt-1">المركز #{groupRank} • {tierName}</div>
                </div>
                
                {/* Timer */}
                <div className={`flex items-center justify-between p-2 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                   <span className="text-[10px] font-bold text-slate-500">مؤقت التطبيق</span>
                   <span className={`font-mono font-black ${isTimerRunning ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}`}>
                     {formatTimer(taskTimer)}
                   </span>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-1 rounded bg-slate-700 text-white">
                     {isTimerRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                   </button>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button onClick={() => { setActiveAppWindow('code'); setIsPracticalMode(true); }} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
                    <Code2 className="w-4 h-4" />
                    <span className="text-[9px]">محرر الكود</span>
                  </button>
                  <button onClick={() => { setActiveAppWindow('terminal'); setIsPracticalMode(true); }} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                    <Terminal className="w-4 h-4" />
                    <span className="text-[9px]">الأوامر</span>
                  </button>
                  <button onClick={() => { setActiveAppWindow('calc'); setIsPracticalMode(true); }} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Calculator className="w-4 h-4" />
                    <span className="text-[9px]">الحاسبة</span>
                  </button>
                  <button onClick={() => { setActiveAppWindow('files'); setIsPracticalMode(true); }} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-amber-400 relative' : 'bg-amber-100 text-amber-600 relative'}`}>
                    <FolderOpen className="w-4 h-4" />
                    {receivedFiles.length > 0 && <span className="absolute top-1 left-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
                    <span className="text-[9px]">الإشعارات</span>
                  </button>
                  <button onClick={() => api.sendDeviceCommand('master', 'message', { text: `الطالب ${currentTrainee.fullName} يطلب المساعدة 👋`, isHelpRequest: true })} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <span className="text-[16px] leading-none">✋</span>
                    <span className="text-[9px]">مساعدة</span>
                  </button>
                  <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${isRecording ? 'bg-rose-500/20 text-rose-500' : (isDarkMode ? 'bg-slate-800 text-purple-400' : 'bg-purple-100 text-purple-600')}`}>
                    {isRecording ? <Square className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span className="text-[9px]">{isRecording ? 'إيقاف' : 'تسجيل'}</span>
                  </button>
                </div>
                
                <div className="flex gap-2 mt-1">
                   <button onClick={() => setIsDarkMode(!isDarkMode)} className={`flex-1 p-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                     {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                     <span>المظهر</span>
                   </button>
                   <button onClick={handleManualReset} className={`flex-1 p-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 ${isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                     <LogOut className="w-3 h-3" />
                     <span>إنهاء</span>
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Practical Mode Exit Button (Minimal) */}
      {isPracticalMode && currentTrainee && (
         <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsPracticalMode(false)}
              className="bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 border border-slate-600"
            >
              <Minimize className="w-4 h-4" />
              <span>الخروج من وضع العملي</span>
            </button>
         </div>
      )}

      {/* Notification Toast */}
      {activeNotification && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{activeNotification}</span>
          </div>
          <button onClick={() => setActiveNotification(null)} className="text-amber-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full flex flex-col justify-center">
        {!currentTrainee ? (
          /* STEP 1: Student Login & Instant Auto-Attendance */
          <div className="max-w-md mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-3">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-100">تسجيل حضور المتدرب</h2>
              <p className="text-xs text-slate-400 mt-1">
                أدخل كود المتدرب الخاص بك (مثال: <code className="text-amber-400 font-mono">1001</code> أو <code className="text-amber-400 font-mono">TR-1001</code>) أو رقم الهاتف لبدء الجلسة وتسجيل حضورك تلقائياً
              </p>
            </div>

            {loginMessage && (
              <div className="p-3 mb-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{loginMessage}</span>
              </div>
            )}

            {loginError && (
              <div className="p-3 mb-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كود المتدرب أو رقم الموبايل *</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="مثال: 1001 أو TR-1001 أو 01012345678"
                  value={studentCodeInput}
                  onChange={e => setStudentCodeInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 text-center font-mono font-bold focus:border-amber-500 focus:outline-none placeholder-slate-500 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-800/40 border border-slate-700/60 rounded-xl px-3 py-2 text-[11px] text-slate-400 text-center">
                  معرف هذا الجهاز: <span className="font-mono font-bold text-cyan-400">{deviceId}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || !studentCodeInput.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>تسجيل الحضور وبدء التدريب</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                ⚡ بمجرد تسجيل الدخول، يتم توثيق حضورك وإظهار رصيد النجوم والمركز في أعلى يمين الشاشة.
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Active Student Workspace */
          <div className="space-y-4">
            {/* Top Trainee Profile & Auto-Attendance Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                {currentTrainee.photoUrl ? (
                  <img src={currentTrainee.photoUrl} alt={currentTrainee.fullName} className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base">
                    {currentTrainee.fullName?.charAt(0) || 'م'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-slate-100">{currentTrainee.fullName}</h3>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2 py-0.5 rounded-lg font-mono font-bold">
                      {currentTrainee.code}
                    </span>
                    <button
                      onClick={() => {
                        setProfileEditForm({
                          fullName: currentTrainee.fullName || '',
                          phone: currentTrainee.phone || '',
                          nationalId: currentTrainee.nationalId || '',
                          birthDate: currentTrainee.birthDate || '',
                          photoUrl: currentTrainee.photoUrl || '',
                          themeColor: currentTrainee.themeColor || 'amber'
                        });
                        setIsProfileModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow"
                      title="تعديل بياناتي الشخصية، صورتي، ولون الصفحة"
                    >
                      <span>⚙️ تعديل بياناتي الشخصية</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {currentTrainee.courseName} • {currentTrainee.groupName}
                    {currentTrainee.phone ? ` • هاتف: ${currentTrainee.phone}` : ''}
                    {currentTrainee.nationalId ? ` • قومي: ${currentTrainee.nationalId}` : ''}
                    {currentTrainee.birthDate ? ` • ميلاد: ${currentTrainee.birthDate}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Subscription Payment Status Badge */}
                {(() => {
                  const payInfo = getTraineePaymentStatusInfo(currentTrainee, true);
                  return (
                    <div
                      onClick={() => isTraineeUnpaid(currentTrainee) && setShowPaymentModal(true)}
                      className={`rounded-xl px-3 py-1.5 text-center border cursor-pointer transition-all ${payInfo.statusBadgeClass}`}
                      title="اضغط لمعاينة تفاصيل حالة سداد الاشتراك والتنبيهات"
                    >
                      <span className="text-[10px] opacity-80 font-bold block">اشتراك الدورة</span>
                      <span className="text-xs font-black">{payInfo.shortLabel}</span>
                    </div>
                  );
                })()}

                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block">حالة الحضور اليوم</span>
                  <span className="text-xs font-black text-emerald-300">✓ حاضر بالمعمل</span>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block">رصيد النجوم والتميز</span>
                  <span className="text-xs font-black text-amber-300 font-mono">⭐ {starsCount} نجوم ({traineePoints} نقطة)</span>
                </div>

                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[10px] text-indigo-400 font-bold block">المركز الحالي</span>
                  <span className="text-xs font-black text-indigo-300">{rankBadge} المركز #{groupRank}</span>
                </div>
              </div>
            </div>

            {/* 🎮 KAHOOT! INTERACTIVE LAB STUDIO & STUDENT INCENTIVES BANNER 🎮 */}
            <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Left Info & Gamification Progress */}
                <div className="space-y-1.5 text-center sm:text-right w-full lg:w-auto">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      سلسلة التواجد: 7 أيام متتالية 🔥 (1.5x XP)
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🏆 المستوى 5: بطل المعمل
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>استوديو كاهوت والأنشطة التفاعلية بالمعمل 🎮</span>
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    أدخل رمز اللعبة (Game PIN) المعروض على شاشة المعمل أو زوم للانضمام الفوري للمنافسة وحصد نقاط التميز!
                  </p>
                </div>

                {/* Right PIN Entry Quick Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!kahootPinInput.trim()) return;
                    setActiveExternalSession({
                      title: `مسابقة كاهوت (PIN: ${kahootPinInput.trim()})`,
                      platform: 'Kahoot! Live Studio',
                      gamePin: kahootPinInput.trim(),
                      url: 'https://kahoot.it'
                    });
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto shrink-0"
                >
                  <div className="relative flex-1 sm:w-48">
                    <input
                      type="text"
                      placeholder="رمز اللعبة PIN (مثال: 849201)"
                      value={kahootPinInput}
                      onChange={(e) => setKahootPinInput(e.target.value)}
                      className="w-full bg-slate-950/90 border-2 border-purple-500/60 rounded-2xl px-4 py-3 text-sm text-center font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400 placeholder-slate-500 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>انضمام لكاهوت 🚀</span>
                  </button>
                </form>
              </div>

              {/* Student Incentive Quick Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-purple-500/30">
                <button
                  onClick={() => {
                    setActiveExternalSession({
                      title: 'تحدي كاهوت التجريبي السريع 🎯',
                      platform: 'Kahoot!',
                      gamePin: '849 201',
                      url: 'https://kahoot.it'
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-purple-900/40 border border-purple-500/30 text-right space-y-1 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🎮</span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">+100 XP</span>
                  </div>
                  <div className="text-xs font-black text-slate-200 group-hover:text-amber-300">فتح كاهوت المباشر</div>
                  <div className="text-[10px] text-slate-400">إدخال PIN والبدء فوراً</div>
                </button>

                <button
                  onClick={() => {
                    setActiveAppWindow('code');
                    setIsPracticalMode(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-cyan-900/40 border border-cyan-500/30 text-right space-y-1 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">💻</span>
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">معمل الكود</span>
                  </div>
                  <div className="text-xs font-black text-slate-200 group-hover:text-cyan-300">محرر التكويد البرمجي</div>
                  <div className="text-[10px] text-slate-400">كتابة بايثون وويب حياً</div>
                </button>

                <button
                  onClick={() => {
                    api.sendDeviceCommand('master', 'message', { text: `الطالب ${currentTrainee.fullName} يطلب المساعدة 👋`, isHelpRequest: true });
                    setActiveNotification('تم إرسال طلب المساعدة للمدرب على الشاشة الرئيسية! ✋');
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-emerald-900/40 border border-emerald-500/30 text-right space-y-1 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">🙋‍♂️</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">رفع اليد</span>
                  </div>
                  <div className="text-xs font-black text-slate-200 group-hover:text-emerald-300">طلب مساعدة المدرب</div>
                  <div className="text-[10px] text-slate-400">إشعار شاشة المدرب بالمعمل</div>
                </button>

                <button
                  onClick={() => {
                    setActiveAppWindow('files');
                    setIsPracticalMode(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-amber-900/40 border border-amber-500/30 text-right space-y-1 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">📚</span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">الملفات</span>
                  </div>
                  <div className="text-xs font-black text-slate-200 group-hover:text-amber-300">ملفات المحاضرة وتنزيلها</div>
                  <div className="text-[10px] text-slate-400">ملفات الشرح والتطبيقات</div>
                </button>
              </div>
            </div>

            {/* Top Payment Subscription Reminder Banner (From Day 25 to Day 5) */}
            {(() => {
              const payInfo = getTraineePaymentStatusInfo(currentTrainee, true);
              if (!payInfo.isReminderWindow || !payInfo.isUnpaid) return null;
              return (
                <div className="bg-rose-950/90 border-2 border-rose-500/80 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-100 shadow-2xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-rose-200 flex items-center gap-1.5">
                        <span>🚨 تنبيه هام: اشتراك الدورة التدريبية غير مسدد</span>
                      </h4>
                      <p className="text-xs text-rose-300 mt-0.5">
                        فترة التنبيه المحددة لسداد الاشتراك (من يوم 25 حتى 5 من الشهر التالي) — المبلغ المستحق: <strong className="font-mono text-amber-300 text-sm">{payInfo.remainingAmount} ج.م</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <span>تفاصيل السداد</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}

            {/* Master Broadcast Stream Player */}
            {masterBroadcast && masterBroadcast.isBroadcasting && masterBroadcast.streamFrame ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3">
                <audio ref={broadcastAudioRef} autoPlay style={{ display: 'none' }} />
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-300">
                      شاشة المدرب ({masterBroadcast.trainerName || 'المدرب'})
                    </span>
                  </div>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                  <img
                    src={masterBroadcast.streamFrame}
                    alt="Master Live Broadcast"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : null}

            {/* 🌟 INTERACTIVE WINDOWS 11 DESKTOP KIOSK (VEYON MASTER STYLE) 🌟 */}
            <div className="bg-slate-950 border-2 border-cyan-500/50 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-[580px]">
              {/* Desktop Wallpaper Canvas & App Windows */}
              <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 relative overflow-hidden flex flex-col justify-between select-none">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

                {/* System Info Watermark */}
                <div className="absolute top-4 left-4 text-slate-600/50 pointer-events-none font-black text-xs space-y-1 text-left">
                  <div className="text-xs text-slate-500/70 font-mono">Windows Veyon Kiosk • {currentTrainee?.fullName}</div>
                  <div className="text-[10px]">الماوس والكيبورد المباشر متصلين ومستجيبين للتفاعل</div>
                </div>

                {/* Desktop Apps Shortcuts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10 max-w-4xl">
                  {/* App 1: Code Editor */}
                  <button
                    onClick={() => setActiveAppWindow('code')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'code'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">محرر الكود</span>
                  </button>

                  {/* App 2: File Explorer & Course Files */}
                  <button
                    onClick={() => setActiveAppWindow('files')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'files'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">مستكشف الملفات</span>
                  </button>

                  {/* App 3: Quiz Exam System */}
                  <button
                    onClick={() => setActiveAppWindow('quiz')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'quiz'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">نظام التحديات</span>
                  </button>

                  {/* App 4: Paint & Canvas Whiteboard */}
                  <button
                    onClick={() => setActiveAppWindow('paint')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'paint'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Palette className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">الرسام والسبورة</span>
                  </button>

                  {/* App 5: Terminal Console */}
                  <button
                    onClick={() => setActiveAppWindow('terminal')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'terminal'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">موجه الأوامر</span>
                  </button>

                  {/* App 6: Calculator */}
                  <button
                    onClick={() => setActiveAppWindow('calc')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                      activeAppWindow === 'calc'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-lg'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-center">الحاسبة العلمية</span>
                  </button>
                </div>

                {/* Active Interactive App Window */}
                {activeAppWindow && (
                  <div className="my-4 bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl p-4 shadow-2xl relative z-20 animate-in zoom-in-95 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                        <h3 className="font-bold text-sm text-cyan-300">
                          {activeAppWindow === 'code' && '💻 محرر الأكواد والبرمجة التفاعلي (مباشر)'}
                          {activeAppWindow === 'files' && '📁 مستكشف ملفات الدورة التدريبية'}
                          {activeAppWindow === 'quiz' && '🏆 نظام التحديات والتقييم الفوري'}
                          {activeAppWindow === 'paint' && '🎨 الرسام والسبورة التفاعلية'}
                          {activeAppWindow === 'terminal' && '🖥️ موجه الأوامر (Windows Console)'}
                          {activeAppWindow === 'calc' && '🧮 الحاسبة الذكية'}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveAppWindow(null)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                        title="إغلاق النافذة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Window 1: Code Editor */}
                    {activeAppWindow === 'code' && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400">
                          الكتابة من الكيبورد المباشر للمدرب أو المتدرب تظهر فورياً داخل هذا المحرر:
                        </p>
                        <textarea
                          id="app-code-textarea"
                          rows={7}
                          value={codeInputValue}
                          onChange={e => setCodeInputValue(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-inner"
                          placeholder="اكتب الأكواد هنا..."
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-mono">
                            الأسطر: {codeInputValue.split('\n').length} | الحروف: {codeInputValue.length}
                          </span>
                          <button
                            onClick={() => {
                              setTerminalLogs(prev => [...prev, `> python script.py`, ...codeInputValue.split('\n'), `[تم تنفيذ الكود بنجاح! ⚡]`]);
                              setActiveAppWindow('terminal');
                            }}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>تشغيل الكود بداخل الترمينال</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Window 2: File Explorer & Course Files */}
                    {activeAppWindow === 'files' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                          <Search className="w-4 h-4 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            id="app-files-search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن ملفات الدورة، الملازم، أو التطبيقات..."
                            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {receivedFiles.length === 0 ? (
                            <div className="text-center py-6 text-xs text-slate-500">
                              لا توجد ملفات مرفوعة حالياً. أي ملف يرسله المدرب يظهر هنا فورياً!
                            </div>
                          ) : (
                            receivedFiles
                              .filter(f => !searchQuery || f.fileName?.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((f, i) => (
                                <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                    <span className="font-bold text-slate-200">{f.fileName}</span>
                                  </div>
                                  <a href={f.fileBase64 || f.fileUrl} download={f.fileName} className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                                    <Download className="w-3 h-3" />
                                    <span>تحميل</span>
                                  </a>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Window 3: Terminal Console */}
                    {activeAppWindow === 'terminal' && (
                      <div className="space-y-3 font-mono">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto text-xs space-y-1 text-emerald-400 shadow-inner">
                          {terminalLogs.map((log, idx) => (
                            <div key={idx}>{log}</div>
                          ))}
                        </div>
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            if (!terminalInput.trim()) return;
                            setTerminalLogs(prev => [...prev, `C:\\Users\\Student> ${terminalInput}`, `[OK] تم تنفيذ الأمر "${terminalInput}"`]);
                            setTerminalInput('');
                          }}
                          className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2"
                        >
                          <span className="text-cyan-400 text-xs font-bold">C:\&gt;</span>
                          <input
                            type="text"
                            id="app-terminal-input"
                            value={terminalInput}
                            onChange={e => setTerminalInput(e.target.value)}
                            placeholder="اكتب أمر النظام هنا (مثل: dir, python, run)..."
                            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                          />
                          <button type="submit" className="p-1 rounded bg-slate-800 text-cyan-300">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Window 4: Paint & Whiteboard */}
                    {activeAppWindow === 'paint' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">اختر اللون:</span>
                            {['#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a855f7', '#ffffff'].map(c => (
                              <button
                                key={c}
                                onClick={() => setPaintColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform ${paintColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const cvs = paintCanvasRef.current;
                              if (cvs) {
                                const ctx = cvs.getContext('2d');
                                if (ctx) ctx.clearRect(0, 0, cvs.width, cvs.height);
                              }
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>مسح السبورة</span>
                          </button>
                        </div>
                        <canvas
                          ref={paintCanvasRef}
                          width={600}
                          height={200}
                          onMouseDown={e => {
                            const cvs = paintCanvasRef.current;
                            if (!cvs) return;
                            const ctx = cvs.getContext('2d');
                            if (!ctx) return;
                            const rect = cvs.getBoundingClientRect();
                            ctx.beginPath();
                            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                            ctx.strokeStyle = paintColor;
                            ctx.lineWidth = 3;
                            cvs.onmousemove = me => {
                              ctx.lineTo(me.clientX - rect.left, me.clientY - rect.top);
                              ctx.stroke();
                            };
                          }}
                          onMouseUp={() => {
                            if (paintCanvasRef.current) paintCanvasRef.current.onmousemove = null;
                          }}
                          className="w-full h-48 bg-slate-950 rounded-xl border border-slate-700 cursor-crosshair"
                        />
                      </div>
                    )}

                    {/* Window 5: Calculator */}
                    {activeAppWindow === 'calc' && (
                      <div className="max-w-xs mx-auto space-y-3">
                        <input
                          type="text"
                          id="app-calc-input"
                          readOnly
                          value={searchQuery || '0'}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-left font-mono text-lg text-amber-300 font-bold"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
                            <button
                              key={btn}
                              onClick={() => {
                                if (btn === '=') {
                                  try {
                                    const expr = searchQuery.replace(/÷/g, '/').replace(/×/g, '*');
                                    const fn = new Function(`return (${expr})`);
                                    setSearchQuery(String(fn()));
                                  } catch (e) {
                                    setSearchQuery('خطأ');
                                  }
                                } else {
                                  setSearchQuery(prev => (prev === '0' || prev === 'خطأ' ? btn : prev + btn));
                                }
                              }}
                              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-100 shadow"
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Old Windows Start Menu removed */}
              </div>

              {/* Taskbar removed: Floating widget provides all tools now */}
            </div>

            {/* Received Files & Learning Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Files Received Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>الملفات والواجبات المرسلة من المدرب ({receivedFiles.length})</span>
                  </h4>
                </div>

                {receivedFiles.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    لم يقم المدرب بإرسال ملفات بعد. ستظهر هنا فور إرسالها.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {receivedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/80 border border-slate-700/70 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-slate-200">{file.fileName}</span>
                        </div>
                        {file.fileBase64 ? (
                          <a
                            href={file.fileBase64}
                            download={file.fileName}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>تحميل</span>
                          </a>
                        ) : file.fileUrl ? (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>فتح</span>
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Practical Step Recording Panel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>توثيق التطبيق العملي وتسجيل الشاشة</span>
                  </h4>
                  {isRecording && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                      جاري التسجيل: {recordingSeconds} ثانية
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  يمكنك تسجيل خطوات تنفيذ التمرين العملي على شاشتك وإرسالها للمدرب للتقييم الفوري ونيل نقاط التميز.
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>إيقاف التسجيل وإرسال للمدرب</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>بدء تسجيل خطوات التمرين</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      
      {/* 🌟 INTERACTIVE QUESTION MODAL 🌟 */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[110] backdrop-blur-xl p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-6 text-center leading-tight">
                {activeQuestion.text}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {activeQuestion.options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => !questionAnswered && setSelectedOptionIndex(idx)}
                    disabled={questionAnswered}
                    className={`p-4 rounded-2xl text-right font-bold text-sm transition-all border ${
                      questionAnswered
                        ? idx === activeQuestion.correctOptionIndex
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : idx === selectedOptionIndex
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 opacity-50'
                        : selectedOptionIndex === idx
                          ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 border-transparent'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-[10px] ${
                        questionAnswered
                          ? idx === activeQuestion.correctOptionIndex
                            ? 'bg-emerald-500 text-white'
                            : idx === selectedOptionIndex
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-700 text-slate-400'
                          : selectedOptionIndex === idx
                            ? 'bg-slate-950 text-amber-500'
                            : 'bg-slate-700 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center">
                {!questionAnswered ? (
                  <button
                    onClick={() => {
                      if (selectedOptionIndex !== null) {
                        setQuestionAnswered(true);
                        const isCorrect = selectedOptionIndex === activeQuestion.correctOptionIndex;
                        const elapsed = Number(((Date.now() - questionStartTime) / 1000).toFixed(1));

                        // Submit response to server live
                        api.submitInteractiveAnswer({
                          sessionId: activeSessionId,
                          questionId: activeQuestion.id || 'q-' + Date.now(),
                          traineeId: currentTrainee?.id,
                          traineeName: currentTrainee?.fullName || 'متدرب المعمل',
                          deviceId: deviceId,
                          selectedOption: selectedOptionIndex,
                          isCorrect,
                          responseTimeSeconds: elapsed,
                          points: activeQuestion.points || 10
                        }).catch(() => {});

                        if (isCorrect) {
                          playCelebrationFanfare();
                          setShowRankSparkle(true);
                          if (currentTrainee) {
                            api.addPoints({
                              traineeIds: [currentTrainee.id],
                              points: activeQuestion.points || 10,
                              reason: 'إجابة صحيحة في الجلسة التفاعلية'
                            }).catch(() => {});
                          }
                          setTimeout(() => setShowRankSparkle(false), 5000);
                        }
                        // Close after a delay
                        setTimeout(() => {
                          setActiveQuestion(null);
                        }, 5000);
                      }
                    }}
                    disabled={selectedOptionIndex === null}
                    className="px-8 py-3 rounded-xl font-black text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    تأكيد الإجابة وإرسال
                  </button>
                ) : (
                  <div className={`px-6 py-2 rounded-xl font-bold text-sm border ${
                    selectedOptionIndex === activeQuestion.correctOptionIndex
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  }`}>
                    {selectedOptionIndex === activeQuestion.correctOptionIndex
                      ? 'إجابة صحيحة! أحسنت + ' + activeQuestion.points + ' نقطة'
                      : 'إجابة خاطئة! حظاً أوفر في المرة القادمة'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 INTERACTIVE EXTERNAL SESSION MODAL (KAHOOT / QUIZIZZ / GOOGLE FORMS) 🌟 */}
      {activeExternalSession && (
        <div className="fixed inset-0 bg-slate-950/95 flex flex-col z-[120] backdrop-blur-2xl p-3 sm:p-5">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 mb-3 flex items-center justify-between flex-wrap gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-lg">
                🚀
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                  <span>{activeExternalSession.title || 'المسابقة التفاعلية الحية'}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-mono">
                    {activeExternalSession.platform || 'Kahoot'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  انضم الآن للمسابقة وقم بإدخال رمز اللعبة (PIN) إذا تطلب الأمر
                </p>
              </div>
            </div>

            {/* Game PIN & External Actions */}
            <div className="flex items-center gap-2">
              {activeExternalSession.gamePin && (
                <div className="bg-slate-950 border-2 border-emerald-500/80 px-4 py-2 rounded-xl text-center font-mono">
                  <span className="text-[10px] text-slate-400 block font-sans">رمز اللعبة Game PIN</span>
                  <span className="text-lg font-black text-emerald-400 tracking-wider">
                    {activeExternalSession.gamePin}
                  </span>
                </div>
              )}

              <a
                href={activeExternalSession.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <span>فتح بتبويب جديد ↗️</span>
              </a>

              <button
                onClick={() => setActiveExternalSession(null)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Iframe Live View Replaced with Safe Launch Pad */}
          <div className="flex-1 rounded-2xl border-2 border-amber-500/40 overflow-hidden bg-slate-900 shadow-2xl relative flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700 text-center shadow-xl">
              <Globe className="w-20 h-20 mx-auto mb-6 text-amber-500 opacity-80" />
              <h3 className="text-2xl font-black text-slate-100 mb-2">جلسة تفاعلية نشطة</h3>
              <p className="text-sm text-slate-400 mb-6">لقد قام المدرب بمشاركة رابط مباشر معك، يرجى الضغط على الزر أدناه لفتحه والمشاركة.</p>
              
              <div className="bg-slate-950 p-4 rounded-xl mb-8 border border-slate-800">
                <p className="text-xs font-mono text-cyan-400 truncate">{activeExternalSession.url}</p>
              </div>

              <a
                href={activeExternalSession.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1"
                onClick={() => setActiveNotification('جاري فتح الرابط في تبويب جديد...')}
              >
                الدخول للرابط الآن 🚀
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 FULL SCREEN CELEBRATION MODAL FOR INCOMING REINFORCEMENT FROM TRAINER 🌟 */}
      {/* ========================================================================= */}
      {activeReinforcement && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95">
          <div className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.4)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setActiveReinforcement(null)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Celebration Badge & Animated Icon */}
            <div className="relative mb-4 inline-block">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-5xl sm:text-6xl mx-auto shadow-2xl animate-bounce">
                {activeReinforcement.icon || '🌟'}
              </div>
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 border border-amber-400 text-amber-300 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                {activeReinforcement.badgeText}
              </span>
            </div>

            {/* Title & Trainer Praise */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-3 mb-1">
              {activeReinforcement.title}
            </h2>
            <p className="text-xs text-amber-300/90 font-bold mb-3">
              من المحاضر: {activeReinforcement.trainerName} 👨‍🏫
            </p>

            <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 mb-5 text-sm text-slate-200 leading-relaxed font-medium">
              "{activeReinforcement.message}"
            </div>

            {/* Star and Points Reward Pill */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <span className="text-[11px] text-amber-300 block font-bold">النجوم الممنوحة</span>
                <span className="text-xl font-black text-amber-400 font-mono">+{activeReinforcement.stars} ⭐</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3">
                <span className="text-[11px] text-emerald-300 block font-bold">رصيد النقاط الإضافي</span>
                <span className="text-xl font-black text-emerald-400 font-mono">+{activeReinforcement.points} نقطة</span>
              </div>
            </div>

            <button
              onClick={() => setActiveReinforcement(null)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all"
            >
              شكراً للمدرب! متابعة التدريب والتميز 🚀
            </button>
          </div>
        </div>
      )}

      {/* Screen Lock Freeze Modal Overlay (Veyon Master Full Screen Curtain) */}
      {isLockedByMaster && (
        <div className="fixed inset-0 z-[9999999] bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-8 select-none overflow-hidden cursor-not-allowed">
          {/* Top Status Header */}
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-rose-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-rose-400 font-bold tracking-widest block uppercase">
                  Veyon Master Grade • Screen Lock Enforcement
                </span>
                <h3 className="text-sm font-bold text-slate-200">نظام التحكم بالقاعة وإقغال شاشات الطلاب</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full font-bold">
                🔒 الشاشة والمدخلات مقفلة بالكامل
              </span>
            </div>
          </div>

          {/* Center Main Lock Message Box */}
          <div className="max-w-xl w-full bg-slate-900/90 border-2 border-rose-500/60 rounded-3xl p-10 shadow-2xl space-y-6 text-center backdrop-blur-2xl my-auto">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-rose-500/20 animate-ping" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-rose-600 to-rose-900 border-2 border-rose-400 flex items-center justify-center text-white shadow-2xl">
                <Lock className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-100 tracking-tight">
                الشاشة مقفلة بأمر المحاضر
              </h2>
              <p className="text-base font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 py-3 px-4 rounded-2xl">
                {lockMessage || 'يرجى التركيز والتوجه لمتابعة الشرح المباشر على شاشة العرض بالقاعة الآن 📺'}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5 text-right">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                <span>اسم الجهاز المصرح:</span>
                <span className="font-mono text-cyan-400">{deviceId || 'حاسوب الطالب'}</span>
              </div>
              <p className="pt-1">
                🔒 تم تجميد إدخالات الماوس والكيبورد وإخفاء الشاشة بالكامل لحين قيام المحاضر بإلغاء القفل.
              </p>
            </div>
          </div>

          {/* Bottom Lock Footer Bar */}
          <div className="w-full max-w-5xl border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>مركز النجاح للتدريب والاستشارات • نظام إدارة القاعات الذكية</span>
            <span className="font-mono text-[11px] text-slate-600">Locked via Nagah Lab Controller Engine</span>
          </div>
        </div>
      )}

      {/* Remote Trainer Live Interactive Cursor & Pointer Overlay */}
      {remoteAssist && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: `${remoteAssist.cursorX ?? 50}%`,
            top: `${remoteAssist.cursorY ?? 50}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {remoteAssist.action === 'highlight' ? (
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 bg-rose-500/30 animate-ping absolute -top-3 -left-3" />
              <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px] font-black">
                🔴
              </div>
              <span className="absolute top-7 right-0 whitespace-nowrap bg-rose-950/90 text-rose-200 border border-rose-500 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg">
                {remoteAssist.highlightText || `مؤشر المدرب: ${remoteAssist.trainerName || 'المحاضر'}`}
              </span>
            </div>
          ) : (
            <div className="relative">
              <div className="w-5 h-5 text-cyan-400 drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>
              </div>
              <span className="absolute top-4 right-0 whitespace-nowrap bg-cyan-950/90 text-cyan-200 border border-cyan-500 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg">
                {remoteAssist.key ? `أمر: ${remoteAssist.key}` : `تحكم المدرب: ${remoteAssist.trainerName || 'المحاضر'}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Trainee Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">تعديل بياناتي الشخصية وصورتي</h3>
                  <p className="text-xs text-slate-400">تتحدث وتتزامن تلقائياً لدى إدارة المركز</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={profileEditForm.fullName}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (الموبايل) *</label>
                <input
                  type="text"
                  required
                  value={profileEditForm.phone}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  placeholder="01012345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الرقم القومي (14 رقم)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={profileEditForm.nationalId}
                  onChange={(e) => {
                    const val = e.target.value;
                    let birthDate = profileEditForm.birthDate;
                    const clean = val.replace(/\D/g, '');
                    if (clean.length === 14) {
                      const cCode = clean[0];
                      const yy = clean.substring(1, 3);
                      const mm = clean.substring(3, 5);
                      const dd = clean.substring(5, 7);
                      const century = cCode === '3' ? '20' : '19';
                      const year = century + yy;
                      const parsed = `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
                      if (Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
                        birthDate = parsed;
                      }
                    }
                    setProfileEditForm({ ...profileEditForm, nationalId: val, birthDate });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  placeholder="أدخل الرقم القومي لاستخراج تاريخ ميلادك تلقائياً"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ الميلاد (يُحدد تلقائياً من الرقم القومي ويمكن تعديله)</label>
                <input
                  type="date"
                  value={profileEditForm.birthDate || ''}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, birthDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الصورة الشخصية (رفع مباشر من جهازك/كاميرتك)</label>
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                  <input
                    type="file"
                    id="kiosk-photo-file-input"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 4 * 1024 * 1024) {
                        setActiveNotification('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 4 ميجابايت');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setProfileEditForm({ ...profileEditForm, photoUrl: reader.result as string });
                        setActiveNotification('تم تحميل الصورة للمعاينة بنجاح! احفظ التغييرات الآن ✨');
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-amber-500/50 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    {profileEditForm.photoUrl ? (
                      <img src={profileEditForm.photoUrl} alt="معاينة" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Camera className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => document.getElementById('kiosk-photo-file-input')?.click()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all w-fit flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      رفع صورة من الجهاز / الموبايل
                    </button>
                    <p className="text-[10px] text-slate-400">اختر صورة من الموبايل أو الكمبيوتر لتظهر فوراً ببطاقتك</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">لون السمة / الصفحة المفضلة</label>
                <select
                  value={profileEditForm.themeColor}
                  onChange={(e) => setProfileEditForm({ ...profileEditForm, themeColor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="amber">⭐ ذهبي ملكي (Amber)</option>
                  <option value="emerald">💚 أخضر زمردي (Emerald)</option>
                  <option value="cyan">💙 أزرق سماوي (Cyan)</option>
                  <option value="purple">💜 بنفسجي ملكي (Purple)</option>
                  <option value="rose">🌹 أحمر وردي (Rose)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  حفظ التعديلات ومزامنتها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: Payment Subscription Reminder Alert ----------------- */}
      {showPaymentModal && currentTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-100 space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-rose-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-rose-300">🚨 طلب سداد اشتراك الدورة التدريبية</h3>
                  <span className="text-[11px] text-rose-400 font-mono">تنبيه إلزامي (فترة السداد: من 28 لـ 5)</span>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
                title="إغلاق الرسالة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl space-y-1.5">
                <p className="text-xs text-rose-200 leading-relaxed font-bold">
                  أهلاً بك المتدرب/ <span className="text-amber-300 font-black text-sm">{currentTrainee.fullName}</span> (كود: <span className="font-mono text-cyan-300">{currentTrainee.code}</span>) 👋
                </p>
                <p className="text-xs text-slate-200 leading-relaxed">
                  نسترعي انتباهكم بضرورة تسديد متبقي اشتراك الدورة التدريبية الخاص بكم لدى إدارة مركز النجاح للتدريب والاستشارات.
                </p>
              </div>

              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">حالة الاشتراك الحالية:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black border border-rose-500/40">
                    🔴 غير مسدد الاشتراك
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-700/60 pt-2">
                  <span className="text-slate-400">المبلغ المتبقي المطلوب سداده:</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {currentTrainee.remainingAmount ?? (currentTrainee.feeAmount ? currentTrainee.feeAmount - currentTrainee.paidAmount : 0)} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-700/60 pt-2">
                  <span className="text-slate-400">فترة إظهار طلب السداد:</span>
                  <span className="text-cyan-300 font-bold">من يوم 28 وحتى يوم 5 من الشهر التالي</span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  تظهر هذه الرسالة عند كل تسجيل دخول لك تلقائياً طوال فترة التنبيه وحتى إتمام سداد الرسوم بفرع المركز.
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs rounded-2xl shadow-xl transition-all border border-rose-400/30"
              >
                قمت بقراءة الطلب وسأقوم بالتوجه للإدارة لسداد الاشتراك 👍
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ----------------- MODAL: Nagah Pro Interactive Quiz (Kahoot Style) ----------------- */}
      {activeNagahQuiz && (
        <NagahProQuizModal
          quiz={activeNagahQuiz}
          trainee={currentTrainee}
          onClose={() => setActiveNagahQuiz(null)}
          onAnswer={(ans) => {
            request('/interactive/answer', {
              method: 'POST',
              body: JSON.stringify({
                sessionId: activeNagahQuiz.id,
                traineeId: currentTrainee?.id,
                traineeName: currentTrainee?.fullName,
                deviceId,
                ...ans
              })
            });
          }}
        />
      )}

      {/* ----------------- MODAL: Interactive Ceremony Broadcast (Enthusiastic Egyptian Tone) ----------------- */}
      {activeCeremony && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in zoom-in duration-500 overflow-hidden" dir="rtl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent animate-pulse" />
          </div>

          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-4 border-amber-500/60 rounded-[40px] shadow-[0_0_100px_rgba(245,158,11,0.3)] max-w-4xl w-full p-8 text-slate-100 relative overflow-hidden text-center space-y-8 ring-8 ring-amber-500/10">
            {/* Header / Intro */}
            <div className="space-y-2 relative z-10">
              <div className="w-24 h-24 mx-auto rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-2xl animate-bounce">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-amber-400 drop-shadow-lg">
                يا وحوش المعمل.. حفل التتويج بدأ! 🏆
              </h2>
              <p className="text-base text-slate-300 font-bold">
                الجلسة: <span className="text-cyan-400">{activeCeremony.sessionName}</span>
              </p>
            </div>

            {/* Podium for Students */}
            <div className="grid grid-cols-3 gap-6 items-end min-h-[350px] relative z-10 pt-10">
              {/* 2nd Place */}
              <div className={`transition-all duration-1000 transform ${activeCeremony.step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                {activeCeremony.top3[1] && (
                  <div className="bg-slate-800/80 border-2 border-slate-400/60 rounded-3xl p-5 shadow-2xl space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-300 border-4 border-slate-100 flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl">🥈</div>
                    <div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">المركز التاني بجدارة</span>
                      <h3 className="text-lg font-black text-white mt-1 truncate">{activeCeremony.top3[1].fullName}</h3>
                      <div className="mt-2 py-1.5 px-3 bg-slate-900 rounded-xl border border-slate-700">
                        <span className="text-xl font-black text-slate-200">{activeCeremony.top3[1].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">نقطة تميز</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1st Place (CHAMPION) */}
              <div className={`transition-all duration-1000 transform ${activeCeremony.step >= 3 ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-24'}`}>
                {activeCeremony.top3[0] && (
                  <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-amber-950 border-4 border-amber-400 rounded-[40px] p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] space-y-4 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-amber-500 border-4 border-white flex items-center justify-center shadow-2xl animate-spin-slow">
                      <Crown className="w-14 h-14 text-slate-950" />
                    </div>
                    <div className="pt-8">
                      <span className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] block animate-pulse">👑 بطل الجلسة الأول 👑</span>
                      <h3 className="text-2xl font-black text-white mt-2 leading-tight">{activeCeremony.top3[0].fullName}</h3>
                      <div className="mt-4 py-3 px-6 bg-slate-950 border-2 border-amber-500/50 rounded-2xl">
                        <span className="text-4xl font-black text-amber-400">{activeCeremony.top3[0].points || 0}</span>
                        <span className="text-xs text-amber-300 block font-bold mt-1">نقطة تميز أسطورية</span>
                      </div>
                      <div className="mt-3 text-xs bg-amber-500/20 text-amber-300 py-2 rounded-xl font-black">🌟 ملك المحاضرة 🌟</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3rd Place */}
              <div className={`transition-all duration-1000 transform ${activeCeremony.step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                {activeCeremony.top3[2] && (
                  <div className="bg-slate-800/80 border-2 border-amber-700/60 rounded-3xl p-5 shadow-2xl space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-700 border-4 border-amber-300 flex items-center justify-center font-black text-2xl text-white shadow-xl">🥉</div>
                    <div>
                      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">المركز التالت منور</span>
                      <h3 className="text-lg font-black text-white mt-1 truncate">{activeCeremony.top3[2].fullName}</h3>
                      <div className="mt-2 py-1.5 px-3 bg-slate-900 rounded-xl border border-slate-700">
                        <span className="text-xl font-black text-amber-500">{activeCeremony.top3[2].points || 0}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">نقطة تميز</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Closing Message */}
            {activeCeremony.isFinished && (
              <div className="relative z-10 animate-bounce">
                <p className="text-2xl font-black text-emerald-400">🎉 مبروك لكل الأبطال! شدوا حيلكم الجلسة الجاية 🎉</p>
                <button 
                  onClick={() => setActiveCeremony(null)}
                  className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                >
                  إغلاق منصة التكريم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
