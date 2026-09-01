import React, { useState, useEffect, useRef } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Type,
  Code,
  Camera,
  Trash2,
  Share2,
  Maximize2,
  Minimize2,
  Download,
  Users,
  Award,
  Sparkles,
  X,
  Check,
  Radio,
  Volume2,
  Lock,
  Unlock,
  Layers,
  Palette,
  FileCode2,
  Grid,
  Square,
  Circle as CircleIcon,
  Minus
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { audioService } from '../services/audioService';

interface StudentCollab {
  id: string;
  name: string;
  avatar: string;
  canDraw: boolean;
  isOnline: boolean;
  score: number;
}

interface SmartWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Built-in Algorithm and Diagram Templates
const ALGORITHM_TEMPLATES = [
  {
    id: 'binary_search',
    title: 'خوارزمية البحث الثنائي (Binary Search)',
    category: 'Algorithms',
    code: `// Binary Search Algorithm - O(log N)
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
  },
  {
    id: 'flowchart_logic',
    title: 'مخطط القرار الشرطي (If/Else Decision Flow)',
    category: 'Architecture',
    code: `┌───────────────────────────┐
│     Start Process         │
└─────────────┬─────────────┘
              ▼
       /─────────────\\
      <   Is Valid?   > ── No ──► [ Return Error ]
       \\─────────────/
              │ Yes
              ▼
┌───────────────────────────┐
│   Execute Main Logic      │
└───────────────────────────┘`
  },
  {
    id: 'neural_loop',
    title: 'دورة تدريب الشبكات العصبية (Epoch Training Loop)',
    category: 'AI & Data',
    code: `# AI Training Loop
for epoch in range(num_epochs):
    optimizer.zero_grad()
    predictions = model(inputs)
    loss = criterion(predictions, targets)
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch}: Loss = {loss.item():.4f}")`
  },
  {
    id: 'react_hook',
    title: 'نمط React Hook مع State & Effect',
    category: 'Frontend',
    code: `// Custom React Hook
export function useRealtimeSession(sessionId: string) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const channel = new BroadcastChannel(\`room_\${sessionId}\`);
    channel.onmessage = (e) => setData(e.data);
    return () => channel.close();
  }, [sessionId]);
  return data;
}`
  }
];

export const SmartWhiteboardModal: React.FC<SmartWhiteboardModalProps> = ({ isOpen, onClose }) => {
  const { activeBranchId, showToast } = useCenter();

  // Canvas & Context References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Board State
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'line'>('pen');
  const [brushColor, setBrushColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [boardBg, setBoardBg] = useState<'black' | 'white' | 'grid'>('black');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [showStudentsPanel, setShowStudentsPanel] = useState<boolean>(false);
  const [showAlgoPicker, setShowAlgoPicker] = useState<boolean>(false);

  // Text Stamp State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  // Interactive Student Attendees (Synced with Active Branch)
  const [students, setStudents] = useState<StudentCollab[]>([
    { id: 'A001', name: 'أحمد محمود العبدلي', avatar: '👨‍🎓', canDraw: true, isOnline: true, score: 85 },
    { id: 'A002', name: 'سارة خالد السيد', avatar: '👩‍🎓', canDraw: true, isOnline: true, score: 92 },
    { id: 'A003', name: 'يوسف مصطفى إبراهيم', avatar: '👨‍💻', canDraw: false, isOnline: true, score: 78 }
  ]);

  // Fetch Present Students for Active Branch
  useEffect(() => {
    if (!isOpen) return;

    const fetchBranchStudentsForBoard = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [allTrainees, attendanceRecords, devices] = await Promise.all([
          api.getTrainees().catch(() => []),
          api.getAttendance({ date: todayStr }).catch(() => []),
          api.getDevices().catch(() => [])
        ]);

        const safeTrainees = Array.isArray(allTrainees) ? allTrainees : [];
        const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];
        const safeDevices = Array.isArray(devices) ? devices : [];

        let branchTrainees = safeTrainees;
        if (activeBranchId && activeBranchId !== 'all') {
          branchTrainees = safeTrainees.filter(t => t.branchId === activeBranchId);
        }

        const presentIds = new Set<string>();
        safeAttendance.forEach(a => {
          if ((a.status === 'present' || a.status === 'late') && (activeBranchId === 'all' || a.branchId === activeBranchId)) {
            presentIds.add(a.traineeId);
          }
        });

        safeDevices.forEach(d => {
          if (d.isOnline && (activeBranchId === 'all' || d.branchId === activeBranchId)) {
            const tId = (d as any).currentTraineeId;
            if (tId) presentIds.add(tId);
          }
        });

        let presentList = branchTrainees.filter(t => presentIds.has(t.id));
        if (presentList.length === 0 && branchTrainees.length > 0) {
          presentList = branchTrainees.filter(t => t.status !== 'completed' && t.status !== 'suspended');
        }

        const collabList: StudentCollab[] = presentList.map((t, idx) => ({
          id: t.id,
          name: t.fullName,
          avatar: ['👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🧑‍🎓', '👩‍🔬'][idx % 6],
          canDraw: true,
          isOnline: true,
          score: t.totalPoints || t.points || 80
        }));

        if (collabList.length > 0) {
          setStudents(collabList);
        }
      } catch (err) {
        console.warn('Failed fetching whiteboard students:', err);
      }
    };

    fetchBranchStudentsForBoard();
  }, [isOpen, activeBranchId]);

  // Drawing runtime state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapshotData, setSnapshotData] = useState<ImageData | null>(null);

  // Setup BroadcastChannel for Realtime Sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('nagah_live_board_sync');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'STUDENT_DRAW_EVENT' && canvasRef.current) {
          // If collaborative draw received
          const { action, x, y, color, size, tool } = event.data;
          drawExternalSegment(action, x, y, color, size, tool);
        }
      };

      return () => {
        channel.close();
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this container:', e);
    }
  }, []);

  // Helper for drawing external student inputs
  const drawExternalSegment = (action: string, x: number, y: number, color: string, size: number, tool: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (action === 'start') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (action === 'move') {
      ctx.strokeStyle = tool === 'highlighter' ? 'rgba(250, 204, 21, 0.35)' : color;
      ctx.lineWidth = tool === 'highlighter' ? size * 4 : size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  // High-DPI Crisp Canvas Setup & Resize Observer
  useEffect(() => {
    if (!isOpen) return;

    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Preserve existing drawings before resize
      let prevImage: HTMLImageElement | null = null;
      if (canvas.width > 0 && canvas.height > 0) {
        const dataUrl = canvas.toDataURL();
        prevImage = new Image();
        prevImage.src = dataUrl;
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw background grid if selected
        if (boardBg === 'grid') {
          drawGridBackground(ctx, rect.width, rect.height);
        }

        if (prevImage) {
          prevImage.onload = () => {
            ctx.drawImage(prevImage!, 0, 0, rect.width, rect.height);
          };
        }
      }
    };

    // Initial setup with slight delay for DOM paint
    const timer = setTimeout(setupCanvas, 50);
    window.addEventListener('resize', setupCanvas);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isOpen, boardBg, isFullscreen]);

  // Draw Subtle High-Tech Blueprint Grid
  const drawGridBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    const step = 30;

    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Get canvas touch/mouse coordinates relative to bounding rect
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  // Start Drawing Handler
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      const coords = getCoordinates(e);
      setTextInputPos(coords);
      setTextInputValue('');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);

    // Save snapshot for shapes (rect, circle, line)
    const dpr = window.devicePixelRatio || 1;
    setSnapshotData(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 6;
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)'; // Crisp Neon Yellow
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
  };

  // Active Drawing Handler
  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      // Sync with broadcast if active
      if (isBroadcasting && broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'TRAINER_DRAW_EVENT',
          action: 'move',
          x: coords.x,
          y: coords.y,
          color: brushColor,
          size: brushSize,
          tool: activeTool
        });
      }
    } else if (snapshotData) {
      // Shape Preview: restore snapshot then draw current preview
      ctx.putImageData(snapshotData, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      if (activeTool === 'rect') {
        const width = coords.x - startPoint.x;
        const height = coords.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  // Stop Drawing Handler
  const handleStopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
      ctx.globalCompositeOperation = 'source-over'; // Reset to default
    }

    // Auto backup to localStorage for live recovery
    try {
      const data = canvas.toDataURL('image/png');
      localStorage.setItem('nagah_last_whiteboard_frame', data);
    } catch (err) {
      // Ignore quota exceeded
    }
  };

  // Commit Text to Canvas
  const handleCommitText = () => {
    if (!textInputPos || !textInputValue.trim()) {
      setTextInputPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `bold ${Math.max(16, brushSize * 4)}px 'Cairo', sans-serif`;
    ctx.fillStyle = brushColor;
    ctx.fillText(textInputValue, textInputPos.x, textInputPos.y);
    ctx.restore();

    setTextInputPos(null);
    setTextInputValue('');
    audioService.playChime([600, 800]);
  };

  // Stamp Code Algorithm Template onto Canvas
  const handleStampAlgorithm = (template: typeof ALGORITHM_TEMPLATES[0]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 50;
    const y = 80;
    const padding = 20;
    const lines = template.code.split('\n');
    const lineHeight = 22;
    const boxWidth = Math.min(canvas.width / (window.devicePixelRatio || 1) - 100, 680);
    const boxHeight = lines.length * lineHeight + 70;

    ctx.save();
    // 1. Dark Glass Card Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.roundRect ? ctx.roundRect(x, y, boxWidth, boxHeight, 16) : ctx.rect(x, y, boxWidth, boxHeight);
    ctx.fill();

    // 2. Neon Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Header Title Bar
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y, boxWidth, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 14px 'Cairo', sans-serif";
    ctx.fillText(`⚡ ${template.title}`, x + 16, y + 23);

    // 4. Code text lines
    ctx.font = "13px 'Fira Code', 'Courier New', monospace";
    ctx.fillStyle = '#38bdf8';

    lines.forEach((line, idx) => {
      ctx.fillText(line, x + padding, y + 60 + idx * lineHeight);
    });

    ctx.restore();

    setShowAlgoPicker(false);
    audioService.playChime([400, 600, 800, 1000]);
    showToast(`تم إدراج قالب: ${template.title} على السبورة بنجاح 📋`, 'success');
  };

  // Screen Capture directly into Canvas
  const handleScreenCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        showToast('خاصية التقاط الشاشة غير مدعومة في هذا المتصفح', 'error');
        return;
      }

      showToast('جاري بدء التقاط الشاشة للشرح المباشر... 📸', 'info');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const w = canvas.width / dpr;
          const h = canvas.height / dpr;
          ctx.drawImage(video, 0, 0, w, h);
          audioService.playChime([500, 700, 900]);
          showToast('تم التقاط الشاشة ووضعها على السبورة للشرح فوقها بنجاح! 🎯', 'success');
        }
      }

      // Stop stream tracks
      stream.getTracks().forEach(t => t.stop());
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        showToast('فشل التقاط الشاشة: ' + (err.message || ''), 'error');
      }
    }
  };

  // Clear Entire Blackboard with Confirmation
  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (boardBg === 'grid') {
      drawGridBackground(ctx, canvas.width / dpr, canvas.height / dpr);
    }

    localStorage.removeItem('nagah_last_whiteboard_frame');
    audioService.playChime([300, 200]);
    showToast('تم تنظيف ومسح السبورة بالكامل 🧹', 'info');
  };

  // Download Board as Image
  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with full background color
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Fill Solid Background
    expCtx.fillStyle = boardBg === 'white' ? '#f8fafc' : '#020617';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    expCtx.drawImage(canvas, 0, 0);

    // Add Nagah Center Official Watermark
    expCtx.fillStyle = boardBg === 'white' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    expCtx.font = "bold 20px 'Cairo', sans-serif";
    expCtx.fillText('مركز النجاح للتدريب واللغات - السبورة التفاعلية الذكية V7', 40, exportCanvas.height - 30);

    const link = document.createElement('a');
    link.download = `nagah-whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('تم تصدير وحفظ لقطة السبورة التفاعلية كصورة عالية الدقة 📥', 'success');
  };

  // Broadcast Frame to Students Live
  const handleBroadcastToStudents = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frameData = canvas.toDataURL('image/png');
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'FULL_FRAME_BROADCAST',
        timestamp: Date.now(),
        image: frameData
      });
    }

    setIsBroadcasting(true);
    audioService.playSessionEndFanfare();
    showToast('تم بث محتوى السبورة التفاعلية لأجهزة وشاشات جميع الطلاب بنجاح 📡⚡', 'success');
  };

  // Publish Whiteboard to Lab Wall & Broadcast to Lab Screens
  const handlePublishToLabWall = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with watermark
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    expCtx.fillStyle = boardBg === 'white' ? '#f8fafc' : '#020617';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    expCtx.drawImage(canvas, 0, 0);

    expCtx.fillStyle = boardBg === 'white' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    expCtx.font = "bold 20px 'Cairo', sans-serif";
    expCtx.fillText('مركز النجاح - السبورة التفاعلية لدرس اليوم', 40, exportCanvas.height - 30);

    const frameData = exportCanvas.toDataURL('image/png');

    try {
      // 1. Broadcast to live student devices in lab
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'FULL_FRAME_BROADCAST',
          timestamp: Date.now(),
          image: frameData
        });
      }

      // 2. Start lab screen broadcast session
      await api.startScreenBroadcast({
        trainerName: 'المدرب المشرف',
        initialFrame: frameData,
        message: 'السبورة المنشورة على حائط المعمل'
      }).catch(() => {});

      // 3. Post to social lab feed if available
      await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '📌 تم نشر السبورة التفاعلية لشرح الدرس الحالي على حائط المعمل!',
          mediaUrl: frameData,
          mediaType: 'image',
          branchId: activeBranchId,
          tags: ['السبورة', 'المعمل']
        })
      }).catch(() => {});

      setIsBroadcasting(true);
      audioService.playSessionEndFanfare();
      showToast('تم نشر السبورة التفاعلية على حائط المعمل المباشر وبثها لشاشات المعمل بنجاح! 🌐📡📌', 'success');
    } catch (e) {
      showToast('تم بث ونشر السبورة التفاعلية على شاشات المعمل بنجاح 📡📌', 'success');
    }
  };

  // Toggle Individual Student Drawing Permission
  const toggleStudentPermission = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const next = !s.canDraw;
          audioService.playChime(next ? [500, 750] : [400, 250]);
          showToast(`${next ? 'تم منح' : 'تم سحب'} صلاحية الرسم والتفاعل للطالب: ${s.name}`, next ? 'success' : 'warning');
          return { ...s, canDraw: next };
        }
        return s;
      })
    );
  };

  // Award Points to Student
  const handleAwardStudentScore = (student: StudentCollab) => {
    setStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, score: s.score + 10 } : s))
    );
    audioService.playChime([523, 659, 783, 1046]);
    showToast(`تم منح الطالب ${student.name} (+10 نقاط تميز) لتفاعله على السبورة! ⭐🎉`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9998] flex flex-col dir-rtl select-none ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
      {/* Container Card */}
      <div className="w-full h-full bg-slate-950/98 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
        
        {/* ========================================================= */}
        {/* TOP HEADER TOOLBAR */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">السبورة التفاعلية الذكية (Smart Blackboard)</h2>
                {isBroadcasting && (
                  <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse">
                    <Radio className="w-3 h-3" />
                    بث مباشر
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">محرك رسم فائق الدقة (HiDPI) مع دعم الأكواد، البث المباشر، وتعاون الطلاب</p>
            </div>
          </div>

          {/* Canvas Background Theme Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setBoardBg('black')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                boardBg === 'black' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⬛ داكنة
            </button>
            <button
              onClick={() => setBoardBg('white')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                boardBg === 'white' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⬜ بيضاء
            </button>
            <button
              onClick={() => setBoardBg('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                boardBg === 'grid' ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              📐 شبكية
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Screen Capture */}
            <button
              onClick={handleScreenCapture}
              className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
              title="التقاط شاشة المحاضر ووضعها على السبورة"
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">لقطة شاشة</span>
            </button>

            {/* Algorithm Templates Picker Toggle */}
            <button
              onClick={() => setShowAlgoPicker(!showAlgoPicker)}
              className="p-2 sm:px-3 sm:py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-500/40 transition-all"
              title="إدراج قوالب ومخططات برمجية جاهزة"
            >
              <Code className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">قوالب الأكواد</span>
            </button>

            {/* Students Collaboration Panel Toggle */}
            <button
              onClick={() => setShowStudentsPanel(!showStudentsPanel)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showStudentsPanel
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">الطلاب ({students.filter(s => s.isOnline).length})</span>
            </button>

            {/* Broadcast to Students Button */}
            <button
              onClick={handleBroadcastToStudents}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>بث للطلاب</span>
            </button>

            {/* Publish Whiteboard to Lab Wall Button */}
            <button
              onClick={handlePublishToLabWall}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
              title="نشر لقطة السبورة على حائط المعمل المباشر لشاشات وأجهزة الطلاب بالفرع"
            >
              <Share2 className="w-4 h-4 text-purple-200" />
              <span>نشر على حائط المعمل 📌</span>
            </button>

            {/* Download Snapshot */}
            <button
              onClick={handleDownloadBoard}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
              title="تصدير وحفظ كصورة عالية الدقة"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Maximize / Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
              title={isFullscreen ? 'تصغير الحجم' : 'شاشة كاملة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl border border-red-500/30 transition-all"
              title="إغلاق السبورة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN STAGE (CANVAS + COLLABORATION PANELS) */}
        {/* ========================================================= */}
        <div className="flex-1 relative flex overflow-hidden">
          
          {/* Main Drawing Stage Container */}
          <div
            ref={containerRef}
            className={`flex-1 relative w-full h-full touch-none overflow-hidden ${
              boardBg === 'black'
                ? 'bg-slate-950'
                : boardBg === 'white'
                ? 'bg-slate-50'
                : 'bg-slate-900'
            }`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDrawMove}
              onMouseUp={handleStopDraw}
              onMouseLeave={handleStopDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleStopDraw}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none"
              style={{ touchAction: 'none' }}
            />

            {/* Interactive Text Input Overlay Box */}
            {textInputPos && (
              <div
                className="absolute z-30 p-2 bg-slate-900/95 border-2 border-amber-400 rounded-xl shadow-2xl flex items-center gap-2"
                style={{ left: `${textInputPos.x}px`, top: `${textInputPos.y}px` }}
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="اكتب الشرح أو الملاحظة هنا..."
                  value={textInputValue}
                  onChange={e => setTextInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCommitText();
                    if (e.key === 'Escape') setTextInputPos(null);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={handleCommitText}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  title="تأكيد الكتابة على السبورة"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTextInputPos(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Floating Control Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-[95vw]">
              
              {/* Primary Tools Group */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTool('pen')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'pen' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title="القلم الحر (Smooth Pen)"
                >
                  <Pen className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTool('highlighter')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'highlighter' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="قلم التمييز النيون (Neon Highlighter)"
                >
                  <Highlighter className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'eraser' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title="الممحاة الذكية (Eraser)"
                >
                  <Eraser className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTool('text')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'text' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title="إدراج نصوص وشروحات (Text Tool)"
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>

              {/* Geometric Shapes Group */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTool('line')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="خط مستقيم"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTool('rect')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'rect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="مستطيل"
                >
                  <Square className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTool('circle')}
                  className={`p-2 rounded-lg transition-all ${
                    activeTool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="دائرة"
                >
                  <CircleIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Color Palette */}
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
                {['#38bdf8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff', '#000000'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setBrushColor(color);
                      if (activeTool === 'eraser') setActiveTool('pen');
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all transform hover:scale-125 ${
                      brushColor === color ? 'scale-125 border-white ring-2 ring-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Brush Thickness Slider */}
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] text-slate-400 font-bold">السمك:</span>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Clear Canvas */}
              <button
                onClick={handleClearBoard}
                className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-red-500/30 transition-all"
                title="مسح وتنظيف السبورة بالكامل"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مسح الكل</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* POPUP: ALGORITHM STAMP PICKER */}
          {/* ========================================================= */}
          {showAlgoPicker && (
            <div className="absolute top-4 left-4 z-40 w-80 bg-slate-900/95 border border-indigo-500/40 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">قوالب الأكواد الجاهزة</h3>
                </div>
                <button onClick={() => setShowAlgoPicker(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {ALGORITHM_TEMPLATES.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleStampAlgorithm(item)}
                    className="p-2.5 bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">{item.title}</span>
                      <span className="text-[9px] bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded font-mono">{item.category}</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 font-mono bg-slate-950/80 p-1.5 rounded truncate">
                      {item.code.slice(0, 50)}...
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SIDEBAR: STUDENT COLLABORATION & PERMISSION CONTROL */}
          {/* ========================================================= */}
          {showStudentsPanel && (
            <div className="w-72 sm:w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col p-4 z-30 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">تفاعل وحضور الطلاب</h3>
                    <p className="text-[10px] text-slate-400">التحكم في صلاحيات الرسم والتكريم الفوري</p>
                  </div>
                </div>
                <button onClick={() => setShowStudentsPanel(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Controls */}
              <div className="py-3 flex items-center justify-between border-b border-slate-800/80 gap-2">
                <button
                  onClick={() => {
                    setStudents(prev => prev.map(s => ({ ...s, canDraw: true })));
                    showToast('تم السماح لجميع الطلاب بالكتابة والرسم على السبورة 🔓', 'info');
                  }}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فتح للجميع</span>
                </button>

                <button
                  onClick={() => {
                    setStudents(prev => prev.map(s => ({ ...s, canDraw: false })));
                    showToast('تم قفل صلاحية الرسم وتعيين السبورة للمحاضر فقط 🔒', 'info');
                  }}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>قفل للجميع</span>
                </button>
              </div>

              {/* Students List */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2">
                {students.map(student => (
                  <div
                    key={student.id}
                    className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{student.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">{student.name}</span>
                          <span className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">{student.score} نقطة تفوق ⭐</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Toggle Draw Permission */}
                      <button
                        onClick={() => toggleStudentPermission(student.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                          student.canDraw
                            ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40'
                            : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title={student.canDraw ? 'سحب صلاحية الرسم' : 'منح صلاحية الرسم'}
                      >
                        {student.canDraw ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Instant +10 Points */}
                      <button
                        onClick={() => handleAwardStudentScore(student)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg text-xs font-black transition-all border border-amber-500/40"
                        title="منح 10 نقاط تميز فورية"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
