import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  PenTool,
  Highlighter,
  Radio,
  Search,
  Square,
  Clock,
  Target,
  RotateCw,
  HelpCircle,
  UserCheck,
  Star,
  Trophy,
  Pin,
  Trash2,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle,
  Maximize2,
  Minimize2,
  Zap,
  Bot,
  Volume2,
  Share2,
  Users,
  Layers,
  Palette,
  Circle,
  Move, Video, Link2, Monitor,
  Lock,
  MessageSquare,
  Crown
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { SmartWhiteboardModal } from './SmartWhiteboardModal';
import { SmartSpeakerModal } from './SmartSpeakerModal';
import { PopoutPortal } from './PopoutPortal';
import { ExternalLink } from 'lucide-react';

interface FloatingTeachingToolsOverlayProps {
  activeSessionId?: string;
  onNavigateToView?: (view: string) => void;
}

const ConditionalPopoutWrapper: React.FC<{ isPoppedOut: boolean; onClose: () => void; children: React.ReactNode }> = ({ isPoppedOut, onClose, children }) => {
  return isPoppedOut ? (
    <PopoutPortal isOpen={isPoppedOut} onClose={onClose}>
      {children}
    </PopoutPortal>
  ) : (
    <>{children}</>
  );
};

export const FloatingTeachingToolsOverlay: React.FC<FloatingTeachingToolsOverlayProps> = ({
  activeSessionId,
  onNavigateToView
}) => {
  const { activeBranchId, branches, showToast, refreshKey } = useCenter();

  // Smart Speaker Modal State
  const [isSmartSpeakerOpen, setIsSmartSpeakerOpen] = useState(false);

  // Floating Bar Expansion & Position
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [isOpen, setIsIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('nagah_teaching_orb_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: Math.max(0, Math.min(window.innerWidth - 60, parsed.x)),
            y: Math.max(0, Math.min(window.innerHeight - 60, parsed.y))
          };
        }
      }
    } catch (e) {}
    return { x: 20, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 20, posY: 100 });
  const positionRef = useRef(position);
  positionRef.current = position;

  // Active Tool Mode
  // 'none' | 'pen' | 'highlighter' | 'laser' | 'lens' | 'focus' | 'whiteboard' | 'timer' | 'wheel' | 'quick_question' | 'student_picker' | 'points' | 'kahoot' | 'copilot'
  const [activeTool, setActiveTool] = useState<string>('none');

  // Recent Tools Persistence (Last 3 Used Tools)
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nagah_recent_tools');
      return saved ? JSON.parse(saved) : ['pen', 'laser', 'timer'];
    } catch (e) {
      return ['pen', 'laser', 'timer'];
    }
  });

  // Drawing Canvas State (Pen / Highlighter)
  const [drawColor, setDrawColor] = useState<string>('#ef4444'); // Red default
  const [drawSize, setDrawSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Laser Pointer State & Smooth Fading Particle Trail
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [laserTrail, setLaserTrail] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Magnifier Lens State
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 200, y: 200 });
  const [lensZoom, setLensZoom] = useState<number>(3.0);
  const [lensRadius, setLensRadius] = useState<number>(240);
  const [lensDomHtml, setLensDomHtml] = useState<string>('');

  // Focus Mode State
  const [focusCenter, setFocusCenter] = useState<{ x: number; y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [focusRadius, setFocusRadius] = useState<number>(180);
  const [focusShape, setFocusShape] = useState<'circle' | 'rectangle'>('circle');

  // Interactive Blackboard / Whiteboard State
  const [wbMode, setWbMode] = useState<'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text'>('pen');
  const [wbColor, setWbColor] = useState<string>('#3b82f6');
  const [wbBg, setWbBg] = useState<'black' | 'white' | 'grid'>('black');
  const [wbBroadcastMsg, setWbBroadcastMsg] = useState('');

  // Smart Timer State
  const [timerTaskTitle, setTimerTaskTitle] = useState('تحدي بايثون السريع - 5 دقائق');
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Random Wheel of Fortune State & Custom Items
  const [wheelType, setWheelType] = useState<'attendees' | 'questions' | 'codes' | 'teams'>('attendees');
  const [wheelItems, setWheelItems] = useState<string[]>([]);
  const [customWheelItems, setCustomWheelItems] = useState<string[]>([]);
  const [newWheelItemInput, setNewWheelItemInput] = useState<string>('');
  const [wheelIsSpinning, setWheelIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelWinner, setWheelWinner] = useState<string | null>(null);

  // Random Student Picker State
  const [pickingStudent, setPickingStudent] = useState<boolean>(false);
  const [selectedStudentResult, setSelectedStudentResult] = useState<string | null>(null);

  // Quick Question State
  const [qqPrompt, setQqPrompt] = useState('ما المفهوم الأساسي للـ State في React؟');
  const [qqOptions, setQqOptions] = useState<string[]>(['مخزن القيمة المحلي', 'دالة رسم الواجهة', 'مسار الربط بالسيرفر', 'ملف CSS']);
  const [qqCorrectIdx, setQqCorrectIdx] = useState<number>(0);
  const [qqTimer, setQqTimer] = useState<number>(30);
  const [qqIsActive, setQqIsActive] = useState(false);

  // Points Award State
  const [selectedTraineeForPoints, setSelectedTraineeForPoints] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<number>(10);
  const [pointsReason, setPointsReason] = useState<string>('إجابة ممتازة وتسريع الكود');
  const [selectedPointStudentIds, setSelectedPointStudentIds] = useState<string[]>([]);

  // AI Session Copilot Alerts State
  const [copilotAlerts, setCopilotAlerts] = useState<Array<{ id: string; type: 'warning' | 'info' | 'success'; text: string; actionText?: string }>>([
    { id: '1', type: 'warning', text: '7 طلاب في المجموعة أظهروا أخطاء في تكرار Loops', actionText: 'إعادة شرح مبسطة' },
    { id: '2', type: 'info', text: 'الطالب A014 لم يبدأ نشاط البرمجة بعد', actionText: 'تنبيه شاشة الطالب' },
    { id: '3', type: 'success', text: 'الطالب A009 أنهى المهمة في دقيقة واحدة!', actionText: 'منح 15 نقطة تفوق' }
  ]);

  // Dynamic Per-Branch Students Sync Engine with Smart Persistence
  const [liveStudents, setLiveStudents] = useState<string[]>([]);
  const [rawTrainees, setRawTrainees] = useState<any[]>([]);
  const [isSyncingStudents, setIsSyncingStudents] = useState<boolean>(false);

  const syncBranchStudents = useCallback(async (targetBranchId?: string, forceRefresh = false, silent = false) => {
    const bId = targetBranchId !== undefined ? targetBranchId : activeBranchId;
    setIsSyncingStudents(true);
    try {
      const storageKey = `nagah_locked_attendees_${bId}`;
      
      // If not forcing refresh, check if we already have persistent locked attendees for this branch
      if (!forceRefresh) {
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRawTrainees(parsed);
              setLiveStudents(parsed.map(t => `${t.code || t.id} - ${t.fullName}`));
              setSelectedPointStudentIds(parsed.map(t => t.id));
              if (parsed.length > 0) {
                setSelectedTraineeForPoints(`${parsed[0].code || parsed[0].id} - ${parsed[0].fullName}`);
              }
              setIsSyncingStudents(false);
              if (!silent) {
                showToast(`تم تحميل الحاضرين المرتبطين بالمعمل الحالي (${parsed.length} طالب) 🟢`, 'success');
              }
              return;
            }
          }
        } catch (e) {}
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const [allTrainees, attendanceRecords, devices] = await Promise.all([
        api.getTrainees().catch(() => []),
        api.getAttendance({ date: todayStr }).catch(() => []),
        api.getDevices().catch(() => [])
      ]);

      const safeTrainees = Array.isArray(allTrainees) ? allTrainees : [];
      const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];
      const safeDevices = Array.isArray(devices) ? devices : [];

      // Filter trainees strictly by target branch only (preventing cross-branch mixing like Badr vs Nagah)
      let branchTrainees = safeTrainees;
      if (bId && bId !== 'all') {
        branchTrainees = safeTrainees.filter(t => t.branchId === bId);
      }

      // Collect IDs of present trainees (marked attendance or active in device lab for this branch)
      const presentTraineeIds = new Set<string>();

      safeAttendance.forEach(a => {
        if ((a.status === 'present' || a.status === 'late') && (bId === 'all' || a.branchId === bId)) {
          presentTraineeIds.add(a.traineeId);
        }
      });

      safeDevices.forEach(d => {
        const devBranch = d.branchId || bId;
        if (d.isOnline && (bId === 'all' || devBranch === bId)) {
          const tId = (d as any).currentTraineeId;
          if (tId) presentTraineeIds.add(tId);
          else if (d.currentTraineeName) {
            const match = branchTrainees.find(t => t.fullName === d.currentTraineeName);
            if (match) presentTraineeIds.add(match.id);
          }
        }
      });

      let presentTraineesList = branchTrainees.filter(t => presentTraineeIds.has(t.id));

      // Fallback: If no explicit attendance yet, pull active branch trainees so trainer can immediately award stars
      if (presentTraineesList.length === 0 && branchTrainees.length > 0) {
        presentTraineesList = branchTrainees.slice(0, 15);
      }

      const formattedList = presentTraineesList.map(t => `${t.code || t.id} - ${t.fullName}`);
      setLiveStudents(formattedList);
      setRawTrainees(presentTraineesList);
      setSelectedPointStudentIds(presentTraineesList.map(t => t.id));

      // Persist in localStorage so names remain sticky until explicit reset ("تصفير")
      try {
        localStorage.setItem(storageKey, JSON.stringify(presentTraineesList));
      } catch (e) {}

      if (formattedList.length > 0) {
        setSelectedTraineeForPoints(formattedList[0]);
      }

      const activeBranchObj = branches.find(b => b.id === bId);
      const branchName = activeBranchObj ? activeBranchObj.name : (bId === 'all' ? 'جميع الفروع' : 'فرع المعمل الحاضر');

      if (!silent) {
        audioService.playChime([523, 659, 783]);
        showToast(`تمت مزامنة طلاب المعمل (${branchName}) بنجاح! 🟢 الحاضرون الآن: ${formattedList.length} طالب`, 'success');
      }
    } catch (err) {
      if (!silent) {
        showToast('تعذر مزامنة قائمة الطلاب حالياً', 'error');
      }
    } finally {
      setIsSyncingStudents(false);
    }
  }, [activeBranchId, branches, showToast]);

  // Initial Sync and Branch Switching Listener
  useEffect(() => {
    syncBranchStudents(activeBranchId, false, true);
  }, [activeBranchId, refreshKey, syncBranchStudents]);

  // Initialize Canvas for Drawing Overlay
  useEffect(() => {
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeTool]);

  // Timer Tick Listener
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            audioService.playSessionEndFanfare();
            setTimeout(() => showToast('انتهى الوقت المحدد للنشاط! 🎉', 'success'), 0);
            return 0;
          }
          if (prev === 61) {
            audioService.playFiveMinuteWarningAlert();
            setTimeout(() => showToast('تبقى دقيقة واحدة فقط على نهاية المؤقت! ⏱️', 'warning'), 0);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, showToast]);

  // Laser Pointer & Lens Mouse Tracker & Lens Mouse Wheel Zoom
  useEffect(() => {
    if (activeTool !== 'laser' && activeTool !== 'lens' && activeTool !== 'focus') return;

    let trailIdCounter = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (activeTool === 'laser') {
        setLaserPos({ x: e.clientX, y: e.clientY });
        const newPoint = { id: Date.now() + (trailIdCounter++), x: e.clientX, y: e.clientY };
        setLaserTrail(prev => [newPoint, ...prev.slice(0, 5)]);
      } else if (activeTool === 'lens') {
        setLensPos({ x: e.clientX, y: e.clientY });
      } else if (activeTool === 'focus') {
        setFocusCenter({ x: e.clientX, y: e.clientY });
      }
    };

    const handleWheelZoom = (e: WheelEvent) => {
      if (activeTool === 'lens') {
        e.preventDefault();
        if (e.deltaY < 0) {
          // Scroll Up: Increase Zoom & Lens Radius
          setLensZoom(prev => Math.min(8.0, Number((prev + 0.3).toFixed(1))));
          setLensRadius(prev => Math.min(480, prev + 20));
        } else {
          // Scroll Down: Decrease Zoom
          setLensZoom(prev => Math.max(1.5, Number((prev - 0.3).toFixed(1))));
          setLensRadius(prev => Math.max(140, prev - 20));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheelZoom);
    };
  }, [activeTool]);

  // Global Keyboard Shortcuts Listener for Teaching Tools
  useEffect(() => {
    const handleKeyDownShortcuts = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement;
      const tag = targetEl?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || targetEl?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        if (activeTool !== 'none') {
          setActiveTool('none');
          showToast('تم إيقاف الأداة الحالية (Esc) ❌', 'info');
        } else if (isOpen && !isPinned) {
          setIsIsOpen(false);
        }
        return;
      }

      if (e.altKey) {
        const key = e.code;
        let targetTool: string | null = null;
        let toolName = '';

        if (key === 'KeyP') { targetTool = 'pen'; toolName = 'القلم 🖊️'; }
        else if (key === 'KeyH') { targetTool = 'highlighter'; toolName = 'التمييز 🖍️'; }
        else if (key === 'KeyL') { targetTool = 'laser'; toolName = 'الليزر 🔴'; }
        else if (key === 'KeyM' || key === 'KeyZ') { targetTool = 'lens'; toolName = 'العدسة المكبرة 🔍'; }
        else if (key === 'KeyF') { targetTool = 'focus'; toolName = 'وضع التركيز 🎯'; }
        else if (key === 'KeyW') { targetTool = 'whiteboard'; toolName = 'السبورة التفاعلية ⬛'; }
        else if (key === 'KeyT') { targetTool = 'timer'; toolName = 'المؤقت الذكي ⏱️'; }
        else if (key === 'KeyR') { targetTool = 'wheel'; toolName = 'عجلة الحظ 🎡'; }

        if (targetTool) {
          e.preventDefault();
          const selected = targetTool;
          const isOpening = activeTool !== selected;
          setActiveTool(isOpening ? selected : 'none');
          if (isOpening) {
            audioService.playChime([700, 900]);
            showToast(`تفعيل أداة ${toolName} (Alt+${key.replace('Key', '')}) ⚡`, 'success');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownShortcuts);
    return () => window.removeEventListener('keydown', handleKeyDownShortcuts);
  }, [activeTool, isOpen, isPinned, showToast]);

  // Live Screen Snapshot capture for Magnifier Lens
  useEffect(() => {
    if (activeTool === 'lens') {
      const captureLiveDom = () => {
        const rootEl = document.getElementById('root') || document.body;
        if (rootEl) {
          const clone = rootEl.cloneNode(true) as HTMLElement;
          // Strip overlay tools and modals to prevent recursion inside lens
          const overlays = clone.querySelectorAll('.nagah-overlay-ignore, [class*="z-[99"]');
          overlays.forEach(el => el.remove());
          setLensDomHtml(clone.innerHTML);
        }
      };

      captureLiveDom();
      const interval = setInterval(captureLiveDom, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTool]);

  // Populate Random Wheel Items
  useEffect(() => {
    if (wheelType === 'attendees') {
      const defaultAttendees = liveStudents.length > 0
        ? liveStudents.map(s => {
            const parts = s.split(' - ');
            const code = parts[0] || '';
            const name = parts[1] || s;
            return `${code} ${name.split(' ')[0]}`;
          })
        : ['لا يوجد طلاب حاضرين حالياً'];
      setWheelItems([...defaultAttendees, ...customWheelItems]);
    } else if (wheelType === 'questions') {
      const defaultQuestions = ['سؤال البرمجة 1', 'تحدي الإكسيل 2', 'سؤال القواعد 3', 'تحدي المنطق 4', 'سؤال خوارزميات 5'];
      setWheelItems([...defaultQuestions, ...customWheelItems]);
    } else if (wheelType === 'codes') {
      // Codes auto-loaded automatically without manual typing as requested
      setWheelItems([
        'تحدي دالة Factorial (A001)',
        'تحدي ترتيب Array (A002)',
        'تحدي فلترة القوائم (A003)',
        'تحدي حساب المتوسط (A004)',
        'تحدي البحث الثنائي (A005)'
      ]);
    } else if (wheelType === 'teams') {
      const defaultTeams = ['الفريق الأحادي', 'الفريق الماسي', 'فريق الأبطال', 'فريق المبتكرين'];
      setWheelItems([...defaultTeams, ...customWheelItems]);
    }
  }, [wheelType, customWheelItems, liveStudents]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current) return;
    const ctx = ctxRef.current;

    ctx.lineWidth = activeTool === 'highlighter' ? drawSize * 4 : drawSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'highlighter') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)'; // Neon Yellow transparent
    } else {
      ctx.strokeStyle = drawColor;
    }

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvasOverlay = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        showToast('تم مسح الرسومات والتمييز عن الشاشة 🧹', 'info');
      }
    }
  };

  // Wheel Spin Trigger
  const handleSpinWheel = () => {
    if (wheelIsSpinning || wheelItems.length === 0) return;

    setWheelIsSpinning(true);
    setWheelWinner(null);

    const randomRotations = 5 + Math.floor(Math.random() * 5);
    const randomDegree = Math.floor(Math.random() * 360);
    const totalDegree = wheelRotation + randomRotations * 360 + randomDegree;

    setWheelRotation(totalDegree);

    setTimeout(() => {
      setWheelIsSpinning(false);
      const selectedIndex = Math.floor(Math.random() * wheelItems.length);
      const winner = wheelItems[selectedIndex] || wheelItems[0];
      setWheelWinner(winner);
      audioService.playSessionEndFanfare();
      showToast(`الفائز في السحب العشوائي: ${winner} 🎉`, 'success');
    }, 3500);
  };

  // Random Student Picker Trigger
  const handlePickRandomStudent = () => {
    setPickingStudent(true);
    setSelectedStudentResult(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * liveStudents.length);
      setSelectedStudentResult(liveStudents[randIdx]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setPickingStudent(false);
        audioService.playChime([523, 659, 783]);
        showToast(`وقع الاختيار العشوائي على الطالب: ${liveStudents[randIdx]} 👥`, 'success');
      }
    }, 100);
  };

  // Quick Points Award (ClassPoint style)
  const handleAwardPoints = async (toAllPresent: boolean = false) => {
    try {
      const targetTrainees = toAllPresent
        ? rawTrainees
        : rawTrainees.filter(t => selectedPointStudentIds.includes(t.id));

      if (targetTrainees.length === 0) {
        showToast('الرجاء اختيار طالب واحد على الأقل لمنح النقاط', 'warning');
        return;
      }

      await Promise.all(targetTrainees.map(t =>
        api.addPoints({
          traineeId: t.id || t.code,
          points: pointsAmount,
          reason: pointsReason
        }).catch(() => {})
      ));

      audioService.playChime([600, 800, 1000, 1200]);
      showToast(`تم إسناد +${pointsAmount} نقطة تميز بنجاح لـ ${targetTrainees.length} طالب حاضر بالمعمل ⭐🎉`, 'success');
      setActiveTool('none');
    } catch (e) {
      showToast('خطأ أثناء إسناد النقاط', 'error');
    }
  };

  // Add & Delete Custom Items for Random Wheel
  const handleAddCustomWheelItem = () => {
    if (!newWheelItemInput.trim()) return;
    setCustomWheelItems(prev => [...prev, newWheelItemInput.trim()]);
    setNewWheelItemInput('');
    showToast('تمت إضافة العنصر لعجلة الحظ 🎯', 'success');
  };

  const handleDeleteCustomWheelItem = (itemText: string) => {
    setCustomWheelItems(prev => prev.filter(item => item !== itemText));
    showToast('تم حذف العنصر من العجلة', 'info');
  };

  // Dragging Handlers for Floating Button (Mouse & Touch Mobile Friendly)
  const hasDraggedRef = useRef<boolean>(false);

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStartDrag = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDraggedRef.current = true;
      }
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, dragRef.current.posX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.posY + dy))
      });
    };

    const handleMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
    };

    const handleTouchMoveDrag = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEndDrag = () => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        localStorage.setItem('nagah_teaching_orb_pos', JSON.stringify(positionRef.current));
      } catch (e) {}
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag);
      window.addEventListener('mouseup', handleEndDrag);
      window.addEventListener('touchmove', handleTouchMoveDrag, { passive: false });
      window.addEventListener('touchend', handleEndDrag);
      window.addEventListener('touchcancel', handleEndDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveDrag);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMoveDrag);
      window.removeEventListener('touchend', handleEndDrag);
      window.removeEventListener('touchcancel', handleEndDrag);
    };
  }, [isDragging]);

  // Window Resize Clamping for Orb Position Boundaries
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition(prev => ({
        x: Math.max(0, Math.min(window.innerWidth - 60, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, prev.y))
      }));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Unified Central Tool Activation & History Tracking
  const handleSelectTool = (toolId: string) => {
    if (toolId === 'popout') {
      setIsPoppedOut(!isPoppedOut);
      showToast(!isPoppedOut ? 'تم فتح الأدوات في نافذة منفصلة ↗️' : 'تم استعادة الأدوات ↙️', 'info');
      audioService.playChime([700, 900]);
      if (!isPinned) setIsIsOpen(false);
      return;
    }
    if (toolId === 'smart_speaker') {
      setIsSmartSpeakerOpen(true);
      audioService.playChime([520, 680, 850]);
      showToast('جاري فتح مكبر الصوت الذكي وعازل الضوضاء 📢🎙️', 'info');
      if (!isPinned) setIsIsOpen(false);
      return;
    }
    
    if (toolId === 'clear') {
      clearCanvasOverlay();
      audioService.playChime([600, 800]);
      showToast('تم مسح رسم الشاشة بالكامل 🧹', 'info');
      return;
    }
    if (toolId === 'picker') {
      handlePickRandomStudent();
      audioService.playChime([600, 800]);
      return;
    }

    const nextTool = activeTool === toolId ? 'none' : toolId;
    setActiveTool(nextTool);

    // Intelligent Desktop & ZoomIt Integration (Unified Experience)
    if (nextTool !== 'none') {
      if (toolId === 'pen' || toolId === 'highlighter') {
        try {
          window.location.href = 'nagah-zoomit://draw';
        } catch (e) {}
        showToast('تم تفعيل القلم المتكامل (المنصة + سطح المكتب 🖊️)', 'success');
      } else if (toolId === 'screen_zoom' || toolId === 'lens') {
        try {
          window.location.href = 'nagah-zoomit://zoom';
        } catch (e) {}
        showToast('تم تفعيل تكبير وزوم سطح المكتب الشامل لبرامج وورد والنوافذ الخارجية (ZoomIt 🔍🔎)', 'success');
      } else if (toolId === 'focus') {
        showToast('تم تفعيل بقعة التركيز والشاشة المعتمة 🎯', 'success');
      } else if (toolId === 'laser') {
        try {
          window.location.href = 'nagah-zoomit://live';
        } catch (e) {}
        showToast('تم تفعيل مؤشر الليزر التفاعلي 🔴', 'success');
      }
    }

    if (nextTool !== 'none') {
      audioService.playChime([700, 900]);
      setRecentTools(prev => {
        const updated = [toolId, ...prev.filter(t => t !== toolId)].slice(0, 3);
        try {
          localStorage.setItem('nagah_recent_tools', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } else {
      audioService.playChime([400, 300]);
    }

    if (!isPinned) {
      setIsIsOpen(false);
    }
  };

  // Adaptive Edge-Aware Radial Position Calculator
  const getAdaptiveToolPosition = (idx: number, total: number, orbX: number, orbY: number) => {
    const isMobile = window.innerWidth < 640;
    const radius = isMobile ? 70 : 92;
    const isNearLeft = orbX < 110;
    const isNearRight = orbX > window.innerWidth - 110;
    const isNearTop = orbY < 110;
    const isNearBottom = orbY > window.innerHeight - 110;

    let startAngle = -90;
    let sweepAngle = 360;

    if (isNearLeft && isNearTop) {
      startAngle = 10; sweepAngle = 80;
    } else if (isNearRight && isNearTop) {
      startAngle = 100; sweepAngle = 80;
    } else if (isNearLeft && isNearBottom) {
      startAngle = -80; sweepAngle = 80;
    } else if (isNearRight && isNearBottom) {
      startAngle = -170; sweepAngle = 80;
    } else if (isNearLeft) {
      startAngle = -70; sweepAngle = 140;
    } else if (isNearRight) {
      startAngle = 110; sweepAngle = 140;
    } else if (isNearTop) {
      startAngle = 20; sweepAngle = 140;
    } else if (isNearBottom) {
      startAngle = -160; sweepAngle = 140;
    }

    const step = sweepAngle === 360 ? (360 / total) : (sweepAngle / Math.max(1, total - 1));
    const currentAngleDeg = startAngle + idx * step;
    const angleRad = (currentAngleDeg * Math.PI) / 180;

    return {
      x: Math.round(Math.cos(angleRad) * radius),
      y: Math.round(Math.sin(angleRad) * radius)
    };
  };

  const TOOLS_REGISTRY = [
    { id: 'smart_speaker', label: 'مكبر صوت 📢', category: 'صوت', shortcut: 'Alt+S', icon: Radio, textColor: 'text-emerald-400 group-hover:text-emerald-300' },
    { id: 'pen', label: 'قلم 🖊️', category: 'رسم', shortcut: 'Alt+P', icon: PenTool, textColor: 'text-red-400 group-hover:text-red-300' },
    { id: 'highlighter', label: 'تمييز 🖍️', category: 'رسم', shortcut: 'Alt+H', icon: Highlighter, textColor: 'text-amber-400 group-hover:text-amber-300' },
    { id: 'laser', label: 'ليزر 🔴', category: 'تركيز', shortcut: 'Alt+L', icon: Radio, textColor: 'text-red-500 group-hover:text-red-400' },
    { id: 'screen_zoom', label: 'زوم شاشة 🔍', category: 'سطح المكتب', shortcut: 'Alt+Z', icon: Maximize2, textColor: 'text-emerald-500 group-hover:text-emerald-400' },
    { id: 'lens', label: 'عدسة 🔎', category: 'تركيز', shortcut: 'Alt+M', icon: Search, textColor: 'text-blue-400 group-hover:text-blue-300' },
    { id: 'focus', label: 'تركيز 🎯', category: 'تركيز', shortcut: 'Alt+F', icon: Target, textColor: 'text-purple-400 group-hover:text-purple-300' },
    { id: 'whiteboard', label: 'سبورة ⬛', category: 'سبورة', shortcut: 'Alt+W', icon: Square, textColor: 'text-indigo-400 group-hover:text-indigo-300' },
    { id: 'timer', label: 'مؤقت ⏱️', category: 'تفاعل', shortcut: 'Alt+T', icon: Clock, textColor: 'text-emerald-400 group-hover:text-emerald-300' },
    { id: 'wheel', label: 'عجلة 🎡', category: 'تفاعل', shortcut: 'Alt+R', icon: RotateCw, textColor: 'text-yellow-400 group-hover:text-yellow-300' },
    { id: 'picker', label: 'طالب 👥', category: 'تفاعل', shortcut: '', icon: UserCheck, textColor: 'text-sky-400 group-hover:text-sky-300' },
    { id: 'points', label: 'نقاط ⭐', category: 'تفاعل', shortcut: '', icon: Star, textColor: 'text-amber-500 group-hover:text-amber-400' },
    { id: 'copilot', label: 'مساعد 🤖', category: 'مساعد', shortcut: '', icon: Bot, textColor: 'text-purple-400 group-hover:text-purple-300' },
    { id: 'popout', label: isPoppedOut ? 'استعادة' : 'فصل', category: 'أدوات', shortcut: '', icon: isPoppedOut ? Minimize2 : ExternalLink, textColor: 'text-indigo-400 group-hover:text-indigo-300' },
    { id: 'clear', label: 'مسح 🧹', category: 'أدوات', shortcut: '', icon: Trash2, textColor: 'text-rose-400 group-hover:text-rose-300' }
  ];

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* OVERLAY 1: Canvas Drawing Pen / Highlighter Overlay */}
      {/* ---------------------------------------------------- */}
      {(activeTool === 'pen' || activeTool === 'highlighter') && (
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="fixed inset-0 z-[9990] cursor-crosshair touch-none"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* OVERLAY 2: Laser Pointer Effect with Smooth Particle Trail */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'laser' && (
        <>
          {laserTrail.map((point, index) => {
            const opacity = (laserTrail.length - index) / laserTrail.length;
            const size = Math.max(4, 20 * opacity);
            return (
              <div
                key={point.id}
                className="fixed z-[9994] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 transition-opacity duration-300"
                style={{
                  left: point.x,
                  top: point.y,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity * 0.5,
                  boxShadow: '0 0 10px #ef4444'
                }}
              />
            );
          })}
          <div
            className="fixed z-[9995] pointer-events-none transition-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: laserPos.x, top: laserPos.y }}
          >
            <div className="w-8 h-8 rounded-full bg-red-500/30 animate-ping absolute -inset-1" />
            <div className="w-6 h-6 rounded-full bg-red-600 shadow-[0_0_20px_#ef4444] border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* OVERLAY 3: True Visual UI Magnifier Lens (Microscope Zoom for UI Elements & Icons) */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'lens' && (
        <div
          className="fixed z-[9995] pointer-events-none rounded-full border-4 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.9)] bg-slate-950 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{
            left: lensPos.x,
            top: lensPos.y,
            width: `${lensRadius}px`,
            height: `${lensRadius}px`,
            boxShadow: '0 0 50px rgba(245, 158, 11, 0.8), inset 0 0 30px rgba(245, 158, 11, 0.4)'
          }}
        >
          {/* Magnified UI Screen Mirror Layer */}
          <div
            className="absolute pointer-events-none origin-top-left overflow-hidden bg-slate-900"
            style={{
              width: `${window.innerWidth}px`,
              height: `${window.innerHeight}px`,
              transform: `scale(${lensZoom})`,
              transformOrigin: '0 0',
              left: `${lensRadius / 2 - lensPos.x * lensZoom}px`,
              top: `${lensRadius / 2 - lensPos.y * lensZoom}px`,
            }}
            dangerouslySetInnerHTML={{ __html: lensDomHtml || (document.getElementById('root') as HTMLElement)?.innerHTML || '' }}
          />

          {/* Precision Target Center Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 z-20">
            <div className="w-8 h-8 border border-amber-400/80 rounded-full animate-ping" />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
          </div>

          {/* Optical Glass Lens Reflection Glare */}
          <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-amber-500/10 via-transparent to-white/20 border-2 border-amber-300/50 z-30" />
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* OVERLAY 4: Focus Mode (Spotlight Dimming) */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'focus' && (
        <div
          className="fixed inset-0 z-[9980] pointer-events-auto bg-black/80 transition-all duration-75"
          style={{
            clipPath:
              focusShape === 'circle'
                ? `circle(${focusRadius}px at ${focusCenter.x}px ${focusCenter.y}px)`
                : `polygon(0% 0%, 0% 100%, ${focusCenter.x - focusRadius}px 100%, ${focusCenter.x - focusRadius}px ${focusCenter.y - focusRadius / 2}px, ${focusCenter.x + focusRadius}px ${focusCenter.y - focusRadius / 2}px, ${focusCenter.x + focusRadius}px ${focusCenter.y + focusRadius / 2}px, ${focusCenter.x - focusRadius}px ${focusCenter.y + focusRadius / 2}px, ${focusCenter.x - focusRadius}px 100%, 100% 100%, 100% 0%)`
          }}
        >
          {/* Controls Overlay Bar for Focus Mode */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-2xl border border-slate-700 flex items-center gap-4 text-xs z-[9999] pointer-events-auto shadow-2xl">
            <span className="font-bold text-amber-400">🎯 وضع التركيز (Focus Mode)</span>
            <button
              onClick={() => setFocusShape(s => (s === 'circle' ? 'rectangle' : 'circle'))}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              الشكل: {focusShape === 'circle' ? 'دائري' : 'مستطيل'}
            </button>
            <div className="flex items-center gap-1">
              <span>الحجم:</span>
              <input
                type="range"
                min="100"
                max="400"
                value={focusRadius}
                onChange={e => setFocusRadius(Number(e.target.value))}
                className="w-24 accent-amber-500"
              />
            </div>
            <button
              onClick={() => setActiveTool('none')}
              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* OVERLAY 5: Advanced Smart Interactive Whiteboard & Blackboard */}
      {/* ---------------------------------------------------- */}
      <ConditionalPopoutWrapper isPoppedOut={isPoppedOut} onClose={() => setIsPoppedOut(false)}>
      <SmartWhiteboardModal
        isOpen={activeTool === 'whiteboard'}
        onClose={() => setActiveTool('none')}
      />

      {/* ---------------------------------------------------- */}
      {/* FLOATING ACTION TOOLBAR BUTTON & RADIAL CIRCULAR MENU */}
      {/* ---------------------------------------------------- */}
      <div
        className={`fixed z-[9990] dir-rtl select-none touch-none max-w-full ${isDragging ? 'transition-none' : 'transition-all duration-200'}`}
        style={
          isPoppedOut 
            ? { right: '40px', bottom: '40px', left: 'auto', top: 'auto' } 
            : { left: `${Math.min(position.x, window.innerWidth - 60)}px`, top: `${Math.min(position.y, window.innerHeight - 80)}px` }
        }
      >
        <div className="relative flex items-center justify-center">
          {/* Main Floating Nagah Orb Button */}
          <button
            onMouseDown={handleMouseDownDrag}
            onTouchStart={handleTouchStartDrag}
            onDoubleClick={(e) => {
              e.stopPropagation();
              const next = !isPinned;
              setIsPinned(next);
              if (next) setIsIsOpen(true);
              showToast(next ? 'تم تثبيت قائمة أدوات الشرح مفتوحة 📌 (Double-Click)' : 'تم إلغاء التثبيت 🔓', 'info');
            }}
            onClick={(e) => {
              if (hasDraggedRef.current) {
                e.stopPropagation();
                e.preventDefault();
                hasDraggedRef.current = false;
                return;
              }
              if (activeTool !== 'none') {
                setActiveTool('none');
                showToast('تم إغلاق وإلغاء الأداة النشطة ❌', 'info');
              } else {
                setIsIsOpen(!isOpen);
                audioService.playChime([700, 900]);
              }
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-grab active:cursor-grabbing backdrop-blur-xl ${
              activeTool !== 'none'
                ? 'bg-red-600/90 text-white ring-4 ring-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse'
                : isOpen
                ? 'bg-purple-950/40 text-amber-300 border-2 border-amber-400 ring-4 ring-purple-600/60 shadow-[0_0_28px_rgba(147,51,234,0.75)]'
                : 'bg-transparent hover:bg-purple-950/20 text-amber-300 border-2 border-purple-500 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(147,51,234,0.6),inset_0_0_12px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.9),inset_0_0_16px_rgba(245,158,11,0.5)] hover:scale-105'
            }`}
            title={
              activeTool !== 'none'
                ? 'انقر لإلغاء وإغلاق الأداة الحالية ❌'
                : isPinned
                ? 'القائمة مثبتة 📌 (دبل كليك لإلغاء التثبيت | كليك للإغلاق)'
                : 'كليك شمال لفتح/إغلاق الأدوات 🖱️ | دبل كليك للتثبيت 📌 | اسحب للتحريك ✋'
            }
          >
            {activeTool !== 'none' ? (
              <X className="w-5 h-5 text-white animate-spin-once" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-300 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] animate-pulse" />
            )}
          </button>

          {/* Pinned State Badge Indicator */}
          {isPinned && (
            <span
              className="absolute -bottom-1 -left-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-md border border-slate-900 pointer-events-none"
              title="القائمة مثبتة"
            >
              <Pin className="w-2.5 h-2.5 fill-current" />
            </span>
          )}

          {/* Active Tool Indicator Badge */}
          {activeTool !== 'none' && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full shadow-md animate-bounce">
              نشط
            </span>
          )}

          {/* Radial / Adaptive Grid Circular Menu Options */}
          {isOpen && (
            <div className="absolute inset-0 pointer-events-none">
              {TOOLS_REGISTRY.map((tool, idx, arr) => {
                const orbX = Math.min(position.x, window.innerWidth - 60);
                const orbY = Math.min(position.y, window.innerHeight - 80);
                const pos = getAdaptiveToolPosition(idx, arr.length, orbX, orbY);
                const ToolIcon = tool.icon;
                const isSelected = activeTool === tool.id;
                const isRecent = recentTools.includes(tool.id);

                return (
                  <div
                    key={tool.id}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group"
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`
                    }}
                  >
                    <button
                      onClick={() => handleSelectTool(tool.id)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all duration-200 transform hover:scale-125 ${
                        isSelected
                          ? 'ring-2 ring-emerald-400 bg-emerald-950/90 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                          : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 shadow-lg'
                      }`}
                      title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
                    >
                      <ToolIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-emerald-400' : tool.textColor}`} />
                    </button>

                    {/* Recent Tool Indicator Glow */}
                    {isRecent && !isSelected && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] pointer-events-none" title="من الأدوات الأخيرة" />
                    )}

                    {/* Tooltip Label on Hover */}
                    <div className={`absolute ${pos.x < 0 ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 bg-slate-900/95 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-10 hidden sm:flex items-center gap-1`}>
                      <span className="text-slate-400 text-[8px]">[{tool.category}]</span>
                      <span>{tool.label}</span>
                      {tool.shortcut && <span className="text-[8px] text-slate-400 bg-slate-800 px-1 rounded border border-slate-700">{tool.shortcut}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING ACTIVE TOOL CONTEXT CONTROL STRIP */}
      {/* ---------------------------------------------------- */}
      {activeTool !== 'none' && ['pen', 'highlighter', 'laser', 'lens', 'focus'].includes(activeTool) && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[9996] w-max max-w-[95vw] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 text-white text-xs dir-rtl animate-fade-in-down">
          {/* Active Tool Label Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-xl border border-slate-700 text-amber-300 font-bold">
            {activeTool === 'pen' && <PenTool className="w-3.5 h-3.5 text-red-400" />}
            {activeTool === 'highlighter' && <Highlighter className="w-3.5 h-3.5 text-amber-400" />}
            {activeTool === 'laser' && <Radio className="w-3.5 h-3.5 text-red-500" />}
            {activeTool === 'lens' && <Search className="w-3.5 h-3.5 text-blue-400" />}
            {activeTool === 'focus' && <Target className="w-3.5 h-3.5 text-purple-400" />}
            <span>
              {activeTool === 'pen' && 'القلم الذكي'}
              {activeTool === 'highlighter' && 'قلم التمييز'}
              {activeTool === 'laser' && 'مؤشر الليزر'}
              {activeTool === 'lens' && 'العدسة المكبرة'}
              {activeTool === 'focus' && 'وضع التركيز'}
            </span>
          </div>

          {/* Controls for Pen / Highlighter */}
          {(activeTool === 'pen' || activeTool === 'highlighter') && (
            <>
              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 border-r border-l border-slate-800 px-2">
                {[
                  { color: '#ef4444', label: 'أحمر' },
                  { color: '#f59e0b', label: 'أصفر' },
                  { color: '#10b981', label: 'أخضر' },
                  { color: '#3b82f6', label: 'أزرق' },
                  { color: '#ffffff', label: 'أبيض' }
                ].map(c => (
                  <button
                    key={c.color}
                    onClick={() => setDrawColor(c.color)}
                    className={`w-5 h-5 rounded-full border border-white/30 transition-transform ${drawColor === c.color ? 'scale-125 ring-2 ring-amber-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Stroke Sizes */}
              <div className="flex items-center gap-1 px-1">
                {[2, 4, 8, 14].map(size => (
                  <button
                    key={size}
                    onClick={() => setDrawSize(size)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${drawSize === size ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {size === 2 ? 'رفيع' : size === 4 ? 'عادي' : size === 8 ? 'عريض' : 'ضخم'}
                  </button>
                ))}
              </div>

              <button
                onClick={clearCanvasOverlay}
                className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded-xl flex items-center gap-1 text-[11px] font-bold transition-all"
              >
                <Trash2 className="w-3 h-3" />
                <span>مسح الشاشة</span>
              </button>
            </>
          )}

          {/* Controls for Magnifier Lens */}
          {activeTool === 'lens' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">التكبير:</span>
              {[2.0, 3.0, 4.0, 5.0].map(z => (
                <button
                  key={z}
                  onClick={() => setLensZoom(z)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${lensZoom === z ? 'bg-blue-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {z}x
                </button>
              ))}
              <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">(عجلة الماوس تضبط القطر)</span>
            </div>
          )}

          {/* Controls for Spotlight Focus */}
          {activeTool === 'focus' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFocusShape(focusShape === 'circle' ? 'rectangle' : 'circle')}
                className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
              >
                {focusShape === 'circle' ? <Circle className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                <span>{focusShape === 'circle' ? 'دائري' : 'مستطيل'}</span>
              </button>
              <div className="flex items-center gap-1">
                {[120, 180, 260].map(r => (
                  <button
                    key={r}
                    onClick={() => setFocusRadius(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${focusRadius === r ? 'bg-purple-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {r === 120 ? 'صغير' : r === 180 ? 'متوسط' : 'كبير'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Close Active Tool Action */}
          <button
            onClick={() => setActiveTool('none')}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border-r border-slate-800 pr-2 mr-1"
            title="إغلاق الأداة (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL: SMART TIMER */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'timer' && (
        <div className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:left-6 z-[9992] bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl text-white w-full max-w-xs sm:w-80 mx-auto sm:mx-0 dir-rtl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold">المؤقت الذكي للأنشطة والتحديات</h3>
            </div>
            <button onClick={() => setActiveTool('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-4 text-center">
            <input
              type="text"
              value={timerTaskTitle}
              onChange={e => setTimerTaskTitle(e.target.value)}
              className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg w-full text-center mb-3 border border-slate-700"
              placeholder="اسم النشاط أو التحدي..."
            />
            <div className="text-4xl font-mono font-extrabold text-emerald-400 tracking-wider my-2">
              {formatTimer(timerSeconds)}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {[60, 180, 300, 600].map(s => (
              <button
                key={s}
                onClick={() => {
                  setTimerSeconds(s);
                  setTimerInitialSeconds(s);
                  setIsTimerRunning(false);
                }}
                className="py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300"
              >
                {s / 60} د
              </button>
            ))}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                isTimerRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'إيقاف مؤقت' : 'بدء العداد'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerInitialSeconds);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL: RANDOM WHEEL OF FORTUNE */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'wheel' && (
        <div className="fixed inset-0 z-[9996] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-3xl shadow-2xl text-white max-w-sm w-full space-y-3 relative">
            <button
              onClick={() => setActiveTool('none')}
              className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="inline-flex p-2 bg-amber-500/10 text-amber-400 rounded-2xl mb-1">
                <RotateCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <h2 className="text-base font-extrabold">عجلة الحظ التفاعلية 🎡</h2>
              <p className="text-[10px] text-slate-400">سحب عشوائي لطلاب المعمل الحاضرين في اللحظة الحالية فقط</p>
            </div>

            {/* Per-Branch Student Sync Status Bar */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/70 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>الحاضرون بالمعمل: <strong className="text-emerald-400">{liveStudents.length}</strong></span>
              </div>
              <button
                onClick={() => syncBranchStudents(activeBranchId)}
                disabled={isSyncingStudents}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 transition-all text-[10px]"
              >
                <RotateCcw className={`w-3 h-3 ${isSyncingStudents ? 'animate-spin' : ''}`} />
                <span>مزامنة 🔄</span>
              </button>
            </div>

            {/* Selector */}
            <div className="grid grid-cols-4 gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setWheelType('attendees')}
                className={`py-1 rounded-lg ${wheelType === 'attendees' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                الطلاب
              </button>
              <button
                onClick={() => setWheelType('questions')}
                className={`py-1 rounded-lg ${wheelType === 'questions' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                الأسئلة
              </button>
              <button
                onClick={() => setWheelType('codes')}
                className={`py-1 rounded-lg ${wheelType === 'codes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                الأكواد ⚡
              </button>
              <button
                onClick={() => setWheelType('teams')}
                className={`py-1 rounded-lg ${wheelType === 'teams' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                الفرق
              </button>
            </div>

            {/* Custom Input */}
            {wheelType !== 'codes' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newWheelItemInput}
                  onChange={e => setNewWheelItemInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCustomWheelItem()}
                  placeholder="إضافة عنصر إضافي للعجلة..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleAddCustomWheelItem}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-xl transition-all"
                >
                  إضافة ➕
                </button>
              </div>
            )}

            {/* Wheel Canvas Representation */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <div
                className="w-full h-full rounded-full border-6 border-amber-500 shadow-xl flex items-center justify-center transition-all duration-[3000ms] ease-out bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <div className="text-center p-2">
                  <Sparkles className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                  <p className="text-[11px] font-extrabold text-amber-200 mt-1 line-clamp-2">
                    {wheelWinner ? `🎉 ${wheelWinner}` : 'اضغط تدوير'}
                  </p>
                </div>
              </div>
              <div className="absolute -top-2.5 w-4 h-4 bg-red-600 clip-triangle shadow z-10 transform rotate-180" />
            </div>

            {/* Spin Button */}
            <button
              onClick={handleSpinWheel}
              disabled={wheelIsSpinning}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs disabled:opacity-50"
            >
              {wheelIsSpinning ? 'جاري الدوران... 🎡' : 'تدوير العجلة الآن 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL: RANDOM STUDENT PICKER */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'picker' && (
        <div className="fixed inset-0 z-[9996] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl text-white max-w-md w-full space-y-4 relative text-center">
            <button
              onClick={() => setActiveTool('none')}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex p-3 bg-sky-500/20 text-sky-400 rounded-2xl">
              <UserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold">مُنتخِب الطلاب العشوائي (Per-Branch)</h2>
            <p className="text-xs text-slate-400">اختيار طالب عشوائي من طلاب الفرع الحاضرين بالمعمل حالياً</p>

            <div className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-2xl border border-slate-700/70 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Users className="w-4 h-4 text-sky-400" />
                <span>طلاب الفرع الحاضرين: <strong className="text-emerald-400">{liveStudents.length}</strong></span>
              </div>
              <button
                onClick={() => syncBranchStudents(activeBranchId)}
                disabled={isSyncingStudents}
                className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px]"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncingStudents ? 'animate-spin' : ''}`} />
                <span>مزامنة الطلاب 🔄</span>
              </button>
            </div>

            <div className="p-6 bg-slate-950/70 rounded-2xl border border-slate-800 min-h-[100px] flex items-center justify-center">
              {pickingStudent ? (
                <div className="text-2xl font-black text-amber-400 animate-pulse">
                  {selectedStudentResult || 'جاري الاختيار العشوائي...'}
                </div>
              ) : selectedStudentResult ? (
                <div>
                  <span className="text-xs text-emerald-400 font-bold block mb-1">وقع الاختيار الفائز على:</span>
                  <span className="text-xl font-extrabold text-white">{selectedStudentResult}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">اضغط على زر الاختيار لبدء السحب العشوائي بين طلاب المعمل</span>
              )}
            </div>

            <button
              onClick={handlePickRandomStudent}
              disabled={pickingStudent || liveStudents.length === 0}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-slate-950 font-extrabold rounded-2xl shadow-xl transition-all disabled:opacity-50"
            >
              {pickingStudent ? 'جاري السحب... 🎲' : 'اختيار طالب عشوائي الآن 🎯'}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL: QUICK POINTS ASSIGNER (ClassPoint Style) */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'points' && (
        <div className="fixed inset-0 z-[9996] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 dir-rtl">
          <div className="bg-slate-900 border border-amber-500/50 p-4 rounded-2xl shadow-2xl text-white max-w-md w-full max-h-[82vh] overflow-y-auto space-y-3 relative flex flex-col">
            <button
              onClick={() => setActiveTool('none')}
              className="absolute top-3 left-3 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pr-1">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 shadow-inner shrink-0">
                <Star className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-amber-300 truncate">منح نقاط التميز - نظام كلاس بوينت</h2>
                <p className="text-[10px] text-slate-400 truncate">الطلاب الحاضرون والمتصلون بالمعمل والشبكة حالياً</p>
              </div>
            </div>

            {/* Select All / Deselect All / Reset (تصفير) Bar */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-2 rounded-xl border border-slate-700/70 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>الحاضرون: <strong className="text-emerald-400">{rawTrainees.length}</strong> | المحدد: <strong className="text-amber-400">{selectedPointStudentIds.length}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const bId = activeBranchId;
                    localStorage.removeItem(`nagah_locked_attendees_${bId}`);
                    setRawTrainees([]);
                    setLiveStudents([]);
                    setSelectedPointStudentIds([]);
                    showToast('تم تصفير قائمة الحاضرين بنجاح 🔄', 'info');
                  }}
                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold text-[10px]"
                  title="تصفير ومسح القائمة الحالية"
                >
                  تصفير 🔄
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPointStudentIds(rawTrainees.map(t => t.id))}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[10px]"
                >
                  الكل ✅
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPointStudentIds([])}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px]"
                >
                  إلغاء ❌
                </button>
              </div>
            </div>

            {/* Interactive Trainees Grid */}
            <div className="max-h-36 overflow-y-auto p-1.5 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-2 gap-1.5">
              {rawTrainees.length > 0 ? (
                rawTrainees.map(t => {
                  const isSelected = selectedPointStudentIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedPointStudentIds(prev =>
                          isSelected ? prev.filter(id => id !== t.id) : [...prev, t.id]
                        );
                      }}
                      className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow ring-1 ring-amber-500/50'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-75'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-amber-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                      />
                      <div className="truncate min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{t.fullName}</div>
                        <div className="text-[9px] text-amber-300 font-mono">{t.code || t.id}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-6 text-center text-[11px] text-slate-400">
                  لا توجد قائمة طلاب نشطة مرتبطة بالمعمل. انقر مزامنة بالأعلى أو اضغط تصفير.
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">مقدار النجوم / النقاط الفخرية:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 5, 10, 25, 50].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPointsAmount(pt)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        pointsAmount === pt ? 'bg-amber-500 text-slate-950 shadow scale-105' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      +{pt} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">سبب التميز والتحفيز:</label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={e => setPointsReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="مثال: إجابة نموذجية، سرعة إنجاز التحدي"
                />
              </div>

              {/* ClassPoint Dual Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAwardPoints(false)}
                  disabled={selectedPointStudentIds.length === 0}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  منح المحددين ({selectedPointStudentIds.length}) ⭐
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardPoints(true)}
                  disabled={rawTrainees.length === 0}
                  className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[11px] rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  منح للجميع دفعة واحدة 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* POPUP MODAL: SESSION COPILOT AI */}
      {/* ---------------------------------------------------- */}
      {activeTool === 'copilot' && (
        <div className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-[9996] bg-slate-900 border border-purple-500/40 p-5 rounded-3xl shadow-2xl text-white w-full max-w-sm mx-auto sm:mx-0 dir-rtl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300">مساعد الحصة الذكي (Session Copilot)</h3>
            </div>
            <button onClick={() => setActiveTool('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {copilotAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-xs space-y-2"
              >
                <p className="text-slate-200 font-medium">{alert.text}</p>
                {alert.actionText && (
                  <button
                    onClick={() => {
                      showToast(`تم تنفيذ الإجراء المقترح: ${alert.actionText}`, 'success');
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                  >
                    {alert.actionText} ⚡
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <SmartSpeakerModal
        isOpen={isSmartSpeakerOpen}
        onClose={() => setIsSmartSpeakerOpen(false)}
        activeSessionId={activeSessionId}
      />
      </ConditionalPopoutWrapper>
    </>
  );
};
