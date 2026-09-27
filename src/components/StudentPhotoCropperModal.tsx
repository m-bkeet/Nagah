import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Check,
  X,
  Sliders,
  GraduationCap,
  Award,
  Crown,
  Shirt,
  Scissors,
  Wand2,
  Image as ImageIcon,
  Sun,
  Contrast,
  RefreshCw,
  Move,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Minimize2,
  Layers,
  Palette
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface StudentPhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoBase64: string) => void;
  studentName?: string;
  initialImage?: string | null;
}

export interface CostumeOption {
  id: string;
  name: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  type: 'graduation' | 'suit' | 'sash' | 'labcoat' | 'crown' | 'none';
}

const COSTUMES: CostumeOption[] = [
  {
    id: 'none',
    name: 'الصورة الطبيعية',
    icon: '📸',
    badge: 'الأصلية بدون زي',
    color: 'bg-slate-700',
    description: 'بدون إضافات',
    type: 'none'
  },
  {
    id: 'graduation',
    name: 'قبعة ورداء التخرج 🎓',
    icon: '🎓',
    badge: 'التفوق والتخرج',
    color: 'bg-indigo-600',
    description: 'قبعة تخرج ملكية بشراشيب ذهبية وياقة أكاديمية',
    type: 'graduation'
  },
  {
    id: 'suit',
    name: 'بدلة رسمية وكرافتة 👔',
    icon: '👔',
    badge: 'مظهر رسمي أنيق',
    color: 'bg-blue-600',
    description: 'بدلة كلاسيكية مع قميص أبيض وربطة عنق فاخرة',
    type: 'suit'
  },
  {
    id: 'sash',
    name: 'وشاح وسام التكريم 🏅',
    icon: '🏅',
    badge: 'المتدرب المثالي',
    color: 'bg-amber-500',
    description: 'وشاح مذهب مطرز بشعار النجاح',
    type: 'sash'
  },
  {
    id: 'crown',
    name: 'تاج المركز الأول 👑',
    icon: '👑',
    badge: 'الصدارة والتميز',
    color: 'bg-yellow-500',
    description: 'تاج ملكي مرصع بالأحجار الكريمة أعلى الرأس',
    type: 'crown'
  },
  {
    id: 'labcoat',
    name: 'زي المعامل والتكنولوجيا 🥼',
    icon: '🥼',
    badge: 'تطبيقات عملية',
    color: 'bg-teal-600',
    description: 'رداء المعمل والمهارات التقنية',
    type: 'labcoat'
  }
];

export const StudentPhotoCropperModal: React.FC<StudentPhotoCropperModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  studentName = 'المتدرب',
  initialImage = null
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Source Image
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Transformations
  const [zoom, setZoom] = useState<number>(0.9); // Default to slightly zoomed out so heads are never cut!
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [freeAngle, setFreeAngle] = useState<number>(0); // -45 to +45
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [scaleWidth, setScaleWidth] = useState<number>(100); // 70 - 140%
  const [scaleHeight, setScaleHeight] = useState<number>(100); // 70 - 140%
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [maskType, setMaskType] = useState<'square' | 'circle' | 'portrait'>('square');

  // Lighting & Studio Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // Selected Costume State & Positioning
  const [selectedCostume, setSelectedCostume] = useState<string>('none');
  const [costumeScale, setCostumeScale] = useState<number>(1);
  const [costumeOffsetY, setCostumeOffsetY] = useState<number>(0);
  const [costumeOffsetX, setCostumeOffsetX] = useState<number>(0);

  // AI Auto Enhance Loading
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Dragging Pan
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (initialImage) {
      setImageSrc(initialImage);
    }
  }, [initialImage]);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImageSrc(evt.target.result as string);
        stopCamera();
        resetAdjustments();
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('تعذر فتح الكاميرا، يرجى السماح بالوصول أو اختيار صورة من جهازك');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImageSrc(canvas.toDataURL('image/png'));
      stopCamera();
      resetAdjustments();
    }
  };

  const resetAdjustments = () => {
    setZoom(0.9);
    setRotation(0);
    setFreeAngle(0);
    setFlipH(false);
    setFlipV(false);
    setScaleWidth(100);
    setScaleHeight(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setPanX(0);
    setPanY(0);
    setCostumeScale(1);
    setCostumeOffsetX(0);
    setCostumeOffsetY(0);
  };

  const fitFullImage = () => {
    setZoom(0.85);
    setPanX(0);
    setPanY(15);
  };

  // Drag Panning for Mouse and Touch
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  // AI Presets
  const applyPreset = (type: 'studio' | 'smooth' | 'vibrant' | 'natural') => {
    if (type === 'studio') {
      setBrightness(108);
      setContrast(114);
      setSaturation(105);
      setAiMessage('تم تطبيق إضاءة استوديو متوازنة للوجه 💡');
    } else if (type === 'smooth') {
      setBrightness(112);
      setContrast(106);
      setSaturation(108);
      setAiMessage('تم تطبيق تصفية وتنعيم ذكي للبشرة ✨');
    } else if (type === 'vibrant') {
      setBrightness(106);
      setContrast(120);
      setSaturation(125);
      setAiMessage('تم زيادة تشبع ووضوح الألوان 🌟');
    } else {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setAiMessage('تمت استعادة الألوان الطبيعية 🌿');
    }
    setTimeout(() => setAiMessage(null), 3000);
  };

  // Render & Export Cropped Canvas Image
  const generateCroppedImage = async (): Promise<string | null> => {
    if (!imageSrc) return null;

    return new Promise((resolve) => {
      const exportWidth = 600;
      const exportHeight = maskType === 'portrait' ? 800 : 600;

      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, exportWidth, exportHeight);

        // Circular clipping if circular mask
        ctx.save();
        if (maskType === 'circle') {
          ctx.beginPath();
          ctx.arc(exportWidth / 2, exportHeight / 2, Math.min(exportWidth, exportHeight) / 2, 0, Math.PI * 2);
          ctx.clip();
        }

        // Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        // Transforms
        ctx.translate(exportWidth / 2 + panX, exportHeight / 2 + panY);
        const totalRotation = ((rotation + freeAngle) * Math.PI) / 180;
        ctx.rotate(totalRotation);

        const currentScaleX = zoom * (scaleWidth / 100) * (flipH ? -1 : 1);
        const currentScaleY = zoom * (scaleHeight / 100) * (flipV ? -1 : 1);
        ctx.scale(currentScaleX, currentScaleY);

        // Draw image maintaining aspect ratio
        const aspect = img.width / img.height;
        let drawWidth = exportWidth;
        let drawHeight = exportHeight;
        if (aspect > 1) {
          drawWidth = exportWidth * aspect;
        } else {
          drawHeight = exportWidth / aspect;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        // Draw Costume Overlay on Canvas
        if (selectedCostume !== 'none') {
          drawCostumeOverlayOnCanvas(ctx, selectedCostume, exportWidth, exportHeight);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(null);
      img.src = imageSrc;
    });
  };

  // High-Quality Vector Costume Drawing
  const drawCostumeOverlayOnCanvas = (
    ctx: CanvasRenderingContext2D,
    costumeId: string,
    width: number,
    height: number
  ) => {
    ctx.save();
    const cx = width / 2 + costumeOffsetX * (width / 400);
    const cy = height / 2 + costumeOffsetY * (height / 400);

    ctx.translate(cx, cy);
    ctx.scale(costumeScale, costumeScale);

    if (costumeId === 'graduation') {
      // 🎓 Cap Top
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.44);
      ctx.lineTo(width * 0.32, -height * 0.36);
      ctx.lineTo(0, -height * 0.28);
      ctx.lineTo(-width * 0.32, -height * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cap Skull Band
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-width * 0.18, -height * 0.35);
      ctx.quadraticCurveTo(0, -height * 0.31, width * 0.18, -height * 0.35);
      ctx.lineTo(width * 0.15, -height * 0.26);
      ctx.quadraticCurveTo(0, -height * 0.22, -width * 0.15, -height * 0.26);
      ctx.closePath();
      ctx.fill();

      // Golden Tassel
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.36);
      ctx.lineTo(width * 0.26, -height * 0.31);
      ctx.lineTo(width * 0.26, -height * 0.22);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(width * 0.26, -height * 0.21, 6, 0, Math.PI * 2);
      ctx.fill();

      // Gown Bottom
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-width * 0.48, height * 0.50);
      ctx.quadraticCurveTo(-width * 0.25, height * 0.28, 0, height * 0.30);
      ctx.quadraticCurveTo(width * 0.25, height * 0.28, width * 0.48, height * 0.50);
      ctx.closePath();
      ctx.fill();

      // Gold Trim Collar
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-width * 0.22, height * 0.32);
      ctx.lineTo(0, height * 0.46);
      ctx.lineTo(width * 0.22, height * 0.32);
      ctx.lineTo(width * 0.16, height * 0.30);
      ctx.lineTo(0, height * 0.41);
      ctx.lineTo(-width * 0.16, height * 0.30);
      ctx.closePath();
      ctx.fill();
    } else if (costumeId === 'suit') {
      // 👔 Suit Jacket & Tie
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-width * 0.48, height * 0.50);
      ctx.quadraticCurveTo(-width * 0.20, height * 0.26, 0, height * 0.28);
      ctx.quadraticCurveTo(width * 0.20, height * 0.26, width * 0.48, height * 0.50);
      ctx.closePath();
      ctx.fill();

      // White Shirt Collar
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-width * 0.14, height * 0.28);
      ctx.lineTo(0, height * 0.38);
      ctx.lineTo(width * 0.14, height * 0.28);
      ctx.lineTo(0, height * 0.26);
      ctx.closePath();
      ctx.fill();

      // Navy/Red Tie
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(-width * 0.04, height * 0.35);
      ctx.lineTo(width * 0.04, height * 0.35);
      ctx.lineTo(width * 0.06, height * 0.50);
      ctx.lineTo(0, height * 0.54);
      ctx.lineTo(-width * 0.06, height * 0.50);
      ctx.closePath();
      ctx.fill();
    } else if (costumeId === 'crown') {
      // 👑 Gold Imperial Tiara
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.25, -height * 0.36);
      ctx.lineTo(-width * 0.18, -height * 0.46);
      ctx.lineTo(-width * 0.08, -height * 0.40);
      ctx.lineTo(0, -height * 0.50);
      ctx.lineTo(width * 0.08, -height * 0.40);
      ctx.lineTo(width * 0.18, -height * 0.46);
      ctx.lineTo(width * 0.25, -height * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jewels
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -height * 0.42, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (costumeId === 'sash') {
      // 🏅 Diagonal Sash
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-width * 0.48, height * 0.20);
      ctx.lineTo(-width * 0.30, height * 0.10);
      ctx.lineTo(width * 0.48, height * 0.45);
      ctx.lineTo(width * 0.30, height * 0.55);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 14px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐ متدرب متميز ⭐', 0, height * 0.35);
    }

    ctx.restore();
  };

  const handleSave = async () => {
    const finalPhoto = await generateCroppedImage();
    if (finalPhoto) {
      onSavePhoto(finalPhoto);
      stopCamera();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-amber-200/90 text-slate-900'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/30">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>استوديو معالجة وتخصيص صورة المتدرب 📷</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {studentName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                تكبير وتصغير سلس، تدوير، قلب أفقي ورأسي، وضبط زي التكريم بدون قص الرأس
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 custom-scrollbar">
          {/* LEFT 7 COLS: Preview Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
            {/* Visual Canvas Stage */}
            <div
              className={`relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-3xl border-2 overflow-hidden shadow-xl flex items-center justify-center select-none group ${
                isDark ? 'bg-slate-950 border-amber-500/40' : 'bg-slate-100 border-amber-300'
              }`}
            >
              {isCameraActive ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 z-10">
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> التقاط الصورة الآن 📸
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-2 bg-rose-600 text-white rounded-xl cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : imageSrc ? (
                <div
                  className="relative w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {/* Photo with live transformations */}
                  <img
                    src={imageSrc}
                    alt={studentName}
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom * (scaleWidth / 100) * (flipH ? -1 : 1)}, ${zoom * (scaleHeight / 100) * (flipV ? -1 : 1)}) rotate(${rotation + freeAngle}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                      transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                    }}
                    className="max-w-none w-full h-full object-contain pointer-events-none"
                  />

                  {/* High Quality Costume SVG Live Stage Overlay */}
                  {selectedCostume !== 'none' && (
                    <div
                      style={{
                        transform: `translate(${costumeOffsetX}px, ${costumeOffsetY}px) scale(${costumeScale})`,
                        transition: 'transform 0.05s ease-out'
                      }}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
                    >
                      {selectedCostume === 'graduation' && (
                        <div className="relative w-full h-full flex flex-col justify-between">
                          {/* Graduation Cap */}
                          <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-44 drop-shadow-2xl">
                            <svg viewBox="0 0 200 120" className="w-full h-auto">
                              <polygon points="100,10 190,45 100,75 10,45" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
                              <path d="M50,55 Q100,75 150,55 L145,85 Q100,105 55,85 Z" fill="#1e293b" />
                              <line x1="100" y1="45" x2="170" y2="60" stroke="#f59e0b" strokeWidth="4" />
                              <line x1="170" y1="60" x2="170" y2="90" stroke="#f59e0b" strokeWidth="4" />
                              <circle cx="170" cy="95" r="7" fill="#fbbf24" />
                            </svg>
                          </div>
                          {/* Academic Collar */}
                          <div className="absolute bottom-0 inset-x-2 drop-shadow-xl">
                            <svg viewBox="0 0 200 80" className="w-full h-auto">
                              <path d="M10,80 Q50,20 100,25 Q150,20 190,80 Z" fill="#0f172a" />
                              <polygon points="60,30 100,70 140,30 125,25 100,55 75,25" fill="#f59e0b" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {selectedCostume === 'suit' && (
                        <div className="absolute bottom-0 inset-x-2 drop-shadow-2xl">
                          <svg viewBox="0 0 200 90" className="w-full h-auto">
                            <path d="M10,90 Q50,25 100,30 Q150,25 190,90 Z" fill="#0f172a" />
                            <polygon points="75,30 100,55 125,30 100,22" fill="#ffffff" />
                            <polygon points="92,48 108,48 112,85 100,90 88,85" fill="#2563eb" />
                          </svg>
                        </div>
                      )}

                      {selectedCostume === 'crown' && (
                        <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-32 drop-shadow-2xl">
                          <svg viewBox="0 0 160 100" className="w-full h-auto">
                            <polygon points="10,85 25,20 55,50 80,10 105,50 135,20 150,85" fill="#f59e0b" stroke="#b45309" strokeWidth="4" />
                            <circle cx="80" cy="50" r="8" fill="#dc2626" />
                            <circle cx="40" cy="65" r="6" fill="#2563eb" />
                            <circle cx="120" cy="65" r="6" fill="#10b981" />
                          </svg>
                        </div>
                      )}

                      {selectedCostume === 'sash' && (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="w-[120%] py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 -rotate-30 shadow-2xl flex items-center justify-center border-y-2 border-amber-300">
                            <span className="text-slate-950 font-black text-xs">
                              ⭐ المتدرب المتفوق - Nagah Center ⭐
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedCostume === 'labcoat' && (
                        <div className="absolute bottom-0 inset-x-2 drop-shadow-xl">
                          <svg viewBox="0 0 200 90" className="w-full h-auto">
                            <path d="M15,90 Q50,25 100,30 Q150,25 185,90 Z" fill="#f8fafc" stroke="#0d9488" strokeWidth="3" />
                            <line x1="100" y1="30" x2="100" y2="90" stroke="#0d9488" strokeWidth="3" />
                            <rect x="135" y="45" width="22" height="28" rx="3" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mask visual guide */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10 border-[24px] border-slate-950/60 transition-all"
                    style={{
                      borderRadius:
                        maskType === 'circle' ? '50%' : maskType === 'portrait' ? '16px' : '28px'
                    }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none z-10 border-2 border-amber-400/60"
                    style={{
                      borderRadius:
                        maskType === 'circle' ? '50%' : maskType === 'portrait' ? '16px' : '28px'
                    }}
                  />
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">لم يتم رفع صورة حتى الآن</h4>
                    <p className="text-xs text-slate-500 mt-0.5">اختر صورة من جهازك للبدء في ضبطها وتخصيصها</p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" /> رفع صورة
                    </button>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> الكاميرا
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Stage Quick Controls */}
            {imageSrc && !isCameraActive && (
              <div
                className={`flex flex-wrap items-center justify-center gap-1.5 p-2 rounded-2xl border text-xs ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  onClick={fitFullImage}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                  title="إظهار الرأس والصورة كاملة بدون قص"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>احتواء كامل (لا تقص الرأس)</span>
                </button>

                <button
                  onClick={() => setZoom((prev) => Math.min(prev + 0.15, 3))}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-800 dark:text-slate-200 transition-colors"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.3))}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-800 dark:text-slate-200 transition-colors"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-800 dark:text-slate-200 transition-colors"
                  title="تدوير يميناً 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-800 dark:text-slate-200 transition-colors"
                  title="تدوير يساراً 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    flipH
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                  title="قلب أفقي (انعكاس يمين/شمال)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    flipV
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                  title="قلب رأسي (فوق/تحت)"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>

                <button
                  onClick={resetAdjustments}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                  title="إعادة ضبط الكل"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* AI Message */}
            {aiMessage && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center animate-in fade-in">
                {aiMessage}
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Professional Tuning & AI Studio */}
          <div className="lg:col-span-5 space-y-4">
            {/* Aspect & Mask Chooser */}
            <div
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className="text-xs font-bold block mb-2 text-slate-700 dark:text-slate-300">
                نوع الإطار والشكل المطلوب:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMaskType('square')}
                  className={`py-1.5 rounded-xl font-bold transition-all ${
                    maskType === 'square'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  كارت مربعي 1:1
                </button>
                <button
                  type="button"
                  onClick={() => setMaskType('circle')}
                  className={`py-1.5 rounded-xl font-bold transition-all ${
                    maskType === 'circle'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  دائري للبروفايل
                </button>
                <button
                  type="button"
                  onClick={() => setMaskType('portrait')}
                  className={`py-1.5 rounded-xl font-bold transition-all ${
                    maskType === 'portrait'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  شخصية 3:4
                </button>
              </div>
            </div>

            {/* Width and Height Stretch Sliders */}
            {imageSrc && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> ضبط الطول والعرض وزاوية الميل الدقيقة:
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                      <span>العرض (تعريض):</span>
                      <span>{scaleWidth}%</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={140}
                      value={scaleWidth}
                      onChange={(e) => setScaleWidth(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                      <span>الطول (تطويل):</span>
                      <span>{scaleHeight}%</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={140}
                      value={scaleHeight}
                      onChange={(e) => setScaleHeight(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                    <span>زاوية الميل الحر (Free Angle):</span>
                    <span>{freeAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={freeAngle}
                    onChange={(e) => setFreeAngle(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* AI Lighting Presets */}
            {imageSrc && (
              <div
                className={`p-3 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> فلاتر الإضاءة الاستوديو الذكية:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => applyPreset('studio')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-xl text-right font-bold transition-all shadow-xs cursor-pointer"
                  >
                    💡 إضاءة استوديو
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('smooth')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-xl text-right font-bold transition-all shadow-xs cursor-pointer"
                  >
                    ✨ تصفية وتنعيم
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('vibrant')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-xl text-right font-bold transition-all shadow-xs cursor-pointer"
                  >
                    🌟 إشراقة وتباين
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('natural')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 rounded-xl text-right font-bold transition-all shadow-xs cursor-pointer"
                  >
                    🌿 ألوان طبيعية
                  </button>
                </div>
              </div>
            )}

            {/* Costumes Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                زي التكريم وقبعة التخرج الاحترافية:
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                {COSTUMES.map((costume) => (
                  <button
                    key={costume.id}
                    onClick={() => setSelectedCostume(costume.id)}
                    className={`p-2.5 rounded-2xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      selectedCostume === costume.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/40'
                        : isDark
                        ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{costume.icon}</span>
                    <div className="overflow-hidden">
                      <span className="block font-bold text-xs truncate">{costume.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {costume.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Costume Position & Scale Controls */}
            {selectedCostume !== 'none' && (
              <div
                className={`p-3 rounded-2xl border space-y-2 animate-in fade-in ${
                  isDark ? 'bg-slate-950/80 border-amber-500/30' : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    <Move className="w-3.5 h-3.5" /> ضبط حجم ومكان القبعة / الزي بدقة:
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    الحجم: {Math.round(costumeScale * 100)}%
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                      <span>تكبير / تصغير الزي:</span>
                      <span>{Math.round(costumeScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.2}
                      step={0.05}
                      value={costumeScale}
                      onChange={(e) => setCostumeScale(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                        <span>فوق / تحت Y:</span>
                        <span>{costumeOffsetY}px</span>
                      </div>
                      <input
                        type="range"
                        min={-120}
                        max={120}
                        value={costumeOffsetY}
                        onChange={(e) => setCostumeOffsetY(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                        <span>يمين / شمال X:</span>
                        <span>{costumeOffsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={costumeOffsetX}
                        onChange={(e) => setCostumeOffsetX(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`px-5 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> اختيار صورة أخرى
            </button>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" /> الكاميرا
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={!imageSrc}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" /> اعتماد وتثبيت صورة الطالب 📸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
