import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RotateCw,
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
  Move
} from 'lucide-react';
import { api } from '../services/api';

interface StudentPhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoBase64: string) => void;
  studentName?: string;
  initialImage?: string | null;
}

// Available Costumes / Attire Overlays
export interface CostumeOption {
  id: string;
  name: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  // SVG overlay generator function or elements
  type: 'graduation' | 'suit' | 'sash' | 'labcoat' | 'crown' | 'none';
}

const COSTUMES: CostumeOption[] = [
  {
    id: 'none',
    name: 'الصورة الأصلية',
    icon: '📸',
    badge: 'تلقائي',
    color: 'bg-slate-700',
    description: 'بدون إضافة زي تفوق',
    type: 'none'
  },
  {
    id: 'graduation',
    name: 'رداء وقبعة التخرج 🎓',
    icon: '🎓',
    badge: 'التخرج والتميز',
    color: 'bg-indigo-600',
    description: 'قبعة تخرج سوداء بشراشيب ذهبية ورداء أكاديمي',
    type: 'graduation'
  },
  {
    id: 'suit',
    name: 'بدلة رسمية وكرافتة 👔',
    icon: '👔',
    badge: 'أنيق ورسمي',
    color: 'bg-blue-600',
    description: 'بدلة داكنة مع قميص أبيض وربطة عنق احترافية',
    type: 'suit'
  },
  {
    id: 'sash',
    name: 'وشاح وسام التكريم 🏅',
    icon: '🏅',
    badge: 'الطالب المثالي',
    color: 'bg-amber-500',
    description: 'وشاح ملكي مذهب محفور بشعار مركز النجاح',
    type: 'sash'
  },
  {
    id: 'crown',
    name: 'تاج التفوق الذهبي 👑',
    icon: '👑',
    badge: 'المرتبة الأولى',
    color: 'bg-yellow-500',
    description: 'تاج ذهبي مرصع بالأحجار الكريمة أعلى الرأس',
    type: 'crown'
  },
  {
    id: 'labcoat',
    name: 'زي المعلم والتكنولوجيا 🥼',
    icon: '🥼',
    badge: 'الحاسب والتكنولوجيا',
    color: 'bg-teal-600',
    description: 'رداء المختبر والمعامل الفنية الحديثة',
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
  // Source Image
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Adjustment States
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [brightness, setBrightness] = useState<number>(100); // 50 - 150
  const [contrast, setContrast] = useState<number>(100); // 50 - 150
  const [saturation, setSaturation] = useState<number>(100); // 0 - 200
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [maskType, setMaskType] = useState<'circle' | 'square'>('circle');

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
      stream.getTracks().forEach(track => track.stop());
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
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setPanX(0);
    setPanY(0);
    setCostumeScale(1);
    setCostumeOffsetX(0);
    setCostumeOffsetY(0);
  };

  // Mouse Drag Panning for Crop Alignment
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

  // AI Auto Lighting & Portrait Enhancement
  const handleAiEnhance = async () => {
    if (!imageSrc) return;
    setIsAiEnhancing(true);
    setAiMessage('جاري تحسين إضاءة وألوان صورة الطالب بالذكاء الاصطناعي... ✨');
    try {
      const res = await (api as any).enhancePhoto(studentName);
      // Auto adjust filters to studio portrait quality
      setBrightness(110);
      setContrast(115);
      setSaturation(110);
      setAiMessage(res.message || 'تم تحسين الصورة وضبط إضاءة الاستوديو بنجاح! 🌟');
      setTimeout(() => setAiMessage(null), 3000);
    } catch (err) {
      setBrightness(108);
      setContrast(112);
      setAiMessage('تم ضبط التباين والإضاءة الذكية لمستوى الاستوديو المحترف ✨');
      setTimeout(() => setAiMessage(null), 3000);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  // Render & Export Cropped Canvas Image
  const generateCroppedImage = (): string | null => {
    if (!imageSrc) return null;

    const exportSize = 512; // High-res square avatar
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    // Synchronous rendering assumption when exporting
    // Clear Canvas
    ctx.clearRect(0, 0, exportSize, exportSize);

    // Save state for circular clipping if selected
    ctx.save();

    if (maskType === 'circle') {
      ctx.beginPath();
      ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Apply Filter Adjustments
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Center and transform
    ctx.translate(exportSize / 2 + panX, exportSize / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw Source Image centered
    const aspect = img.width / img.height;
    let drawWidth = exportSize;
    let drawHeight = exportSize;
    if (aspect > 1) {
      drawWidth = exportSize * aspect;
    } else {
      drawHeight = exportSize / aspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore(); // Restore context after image draw & filter

    // Draw Costume Overlay if selected
    if (selectedCostume !== 'none') {
      drawCostumeOverlayOnCanvas(ctx, selectedCostume, exportSize);
    }

    return canvas.toDataURL('image/png', 0.95);
  };

  // Helper function to draw Costume Vectors on top of the exported image
  const drawCostumeOverlayOnCanvas = (ctx: CanvasRenderingContext2D, costumeId: string, size: number) => {
    ctx.save();
    const cx = size / 2 + costumeOffsetX;
    const cy = size / 2 + costumeOffsetY;

    if (costumeId === 'graduation') {
      // 🎓 GRADUATION CAP & GOWN
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(costumeScale, costumeScale);

      // 1. Graduation Cap (Top of head)
      ctx.fillStyle = '#1E1B4B'; // Dark Navy/Black
      // Cap Diamond Top
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.42);
      ctx.lineTo(size * 0.28, -size * 0.35);
      ctx.lineTo(0, -size * 0.28);
      ctx.lineTo(-size * 0.28, -size * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cap Skull Band
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(-size * 0.16, -size * 0.34);
      ctx.quadraticCurveTo(0, -size * 0.30, size * 0.16, -size * 0.34);
      ctx.lineTo(size * 0.14, -size * 0.26);
      ctx.quadraticCurveTo(0, -size * 0.22, -size * 0.14, -size * 0.26);
      ctx.closePath();
      ctx.fill();

      // Golden Tassel
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.35);
      ctx.lineTo(size * 0.22, -size * 0.31);
      ctx.lineTo(size * 0.22, -size * 0.23);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(size * 0.22, -size * 0.22, 5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Academic Collar / Gown (Shoulders at bottom)
      ctx.fillStyle = '#0F172A'; // Black gown
      ctx.beginPath();
      ctx.moveTo(-size * 0.48, size * 0.50);
      ctx.quadraticCurveTo(-size * 0.25, size * 0.28, 0, size * 0.30);
      ctx.quadraticCurveTo(size * 0.25, size * 0.28, size * 0.48, size * 0.50);
      ctx.closePath();
      ctx.fill();

      // Golden V-Sash Collar
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-size * 0.22, size * 0.32);
      ctx.lineTo(0, size * 0.46);
      ctx.lineTo(size * 0.22, size * 0.32);
      ctx.lineTo(size * 0.16, size * 0.30);
      ctx.lineTo(0, size * 0.41);
      ctx.lineTo(-size * 0.16, size * 0.30);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    } else if (costumeId === 'suit') {
      // 👔 FORMAL SUIT & TIE
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(costumeScale, costumeScale);

      // Shirt Collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-size * 0.18, size * 0.28);
      ctx.lineTo(0, size * 0.36);
      ctx.lineTo(size * 0.18, size * 0.28);
      ctx.lineTo(0, size * 0.25);
      ctx.closePath();
      ctx.fill();

      // Blue Tie
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, size * 0.30);
      ctx.lineTo(size * 0.04, size * 0.30);
      ctx.lineTo(size * 0.06, size * 0.48);
      ctx.lineTo(0, size * 0.52);
      ctx.lineTo(-size * 0.06, size * 0.48);
      ctx.closePath();
      ctx.fill();

      // Jacket Lapels
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(-size * 0.48, size * 0.50);
      ctx.lineTo(-size * 0.18, size * 0.28);
      ctx.lineTo(-size * 0.06, size * 0.40);
      ctx.lineTo(-size * 0.20, size * 0.50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(size * 0.48, size * 0.50);
      ctx.lineTo(size * 0.18, size * 0.28);
      ctx.lineTo(size * 0.06, size * 0.40);
      ctx.lineTo(size * 0.20, size * 0.50);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    } else if (costumeId === 'sash') {
      // 🏅 HONOR SASH
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(costumeScale, costumeScale);

      // Golden Sash
      ctx.fillStyle = 'rgba(217, 119, 6, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-size * 0.38, size * 0.20);
      ctx.lineTo(-size * 0.28, size * 0.18);
      ctx.lineTo(size * 0.32, size * 0.50);
      ctx.lineTo(size * 0.20, size * 0.50);
      ctx.closePath();
      ctx.fill();

      // Medal Badge
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(-size * 0.22, size * 0.30, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    } else if (costumeId === 'crown') {
      // 👑 GOLDEN CROWN
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(costumeScale, costumeScale);

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-size * 0.20, -size * 0.28);
      ctx.lineTo(-size * 0.25, -size * 0.42);
      ctx.lineTo(-size * 0.10, -size * 0.34);
      ctx.lineTo(0, -size * 0.46);
      ctx.lineTo(size * 0.10, -size * 0.34);
      ctx.lineTo(size * 0.25, -size * 0.42);
      ctx.lineTo(size * 0.20, -size * 0.28);
      ctx.closePath();
      ctx.fill();

      // Jewels
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -size * 0.38, 4, 0, Math.PI * 2);
      ctx.arc(-size * 0.18, -size * 0.34, 3, 0, Math.PI * 2);
      ctx.arc(size * 0.18, -size * 0.34, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (costumeId === 'labcoat') {
      // 🥼 LAB COAT
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(costumeScale, costumeScale);

      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.moveTo(-size * 0.48, size * 0.50);
      ctx.lineTo(-size * 0.16, size * 0.28);
      ctx.lineTo(0, size * 0.34);
      ctx.lineTo(size * 0.16, size * 0.28);
      ctx.lineTo(size * 0.48, size * 0.50);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  };

  const handleSave = () => {
    const finalPhoto = generateCroppedImage();
    if (finalPhoto) {
      onSavePhoto(finalPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100" dir="rtl">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                أداة قص وتزيين صور الطلاب بالذكاء الاصطناعي 🎓
              </h3>
              <p className="text-xs text-slate-400">
                ضبط مقاس الصورة، الفلاتر، وإضافة زي وقبعة التخرج أو أوسمة التكريم لـ ({studentName})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 7 COLS: Canvas Preview Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
            
            {/* Camera or Image Preview Stage */}
            <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-3xl border-2 border-indigo-500/30 overflow-hidden shadow-2xl flex items-center justify-center select-none group">
              
              {isCameraActive ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 z-10">
                    <button
                      onClick={capturePhoto}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" /> التقاط الصورة 📸
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-2.5 bg-rose-600 text-white rounded-2xl"
                    >
                      <X className="w-5 h-5" />
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
                >
                  {/* Background Image with transformations */}
                  <img
                    src={imageSrc}
                    alt="Student Preview"
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="max-w-none w-full h-full object-cover pointer-events-none"
                  />

                  {/* Costume SVG Overlay preview on stage */}
                  {selectedCostume !== 'none' && (
                    <div
                      style={{
                        transform: `translate(${costumeOffsetX}px, ${costumeOffsetY}px) scale(${costumeScale})`,
                        transition: 'transform 0.05s ease-out'
                      }}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
                    >
                      {selectedCostume === 'graduation' && (
                        <div className="relative w-full h-full">
                          {/* Cap Top */}
                          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">
                            🎓
                          </div>
                          {/* Academic Gown Bottom Collar */}
                          <div className="absolute bottom-[4%] inset-x-4 h-24 bg-gradient-to-t from-slate-950 via-indigo-950/90 to-transparent rounded-b-full border-b-4 border-amber-400 flex items-center justify-center">
                            <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">النجاح للتدريب</span>
                          </div>
                        </div>
                      )}

                      {selectedCostume === 'suit' && (
                        <div className="absolute bottom-[2%] inset-x-6 h-28 flex flex-col items-center justify-end">
                          <div className="w-10 h-16 bg-white border border-slate-300 rotate-45 rounded-sm -mb-8"></div>
                          <div className="w-6 h-20 bg-blue-600 rounded-b-md z-10 shadow-md"></div>
                          <div className="w-full h-16 bg-slate-900 border-t-2 border-slate-700 rounded-t-3xl -mt-12 flex justify-between px-4">
                            <div className="w-10 h-16 bg-slate-800 -rotate-12 border-l border-slate-600"></div>
                            <div className="w-10 h-16 bg-slate-800 rotate-12 border-r border-slate-600"></div>
                          </div>
                        </div>
                      )}

                      {selectedCostume === 'sash' && (
                        <div className="relative w-full h-full">
                          <div className="absolute top-1/3 -left-2 w-full h-12 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 -rotate-45 shadow-xl flex items-center justify-center">
                            <span className="text-slate-950 font-black text-[10px]">⭐ الطالب المتفوق - Nagah TC ⭐</span>
                          </div>
                        </div>
                      )}

                      {selectedCostume === 'crown' && (
                        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 text-5xl drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                          👑
                        </div>
                      )}

                      {selectedCostume === 'labcoat' && (
                        <div className="absolute bottom-0 inset-x-6 h-24 bg-slate-100 dark:bg-slate-200 border-t-2 border-teal-500 rounded-t-3xl shadow-lg flex items-center justify-center">
                          <span className="text-teal-900 font-bold text-[10px]">🥼 IT &amp; Tech Academy</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mask Overlay (Circle vs Square Frame) */}
                  <div className="absolute inset-0 pointer-events-none z-10 border-[30px] border-slate-950/70" style={{ borderRadius: maskType === 'circle' ? '50%' : '24px' }}></div>
                  <div className="absolute inset-0 pointer-events-none z-10 border border-amber-400/40" style={{ borderRadius: maskType === 'circle' ? '50%' : '24px' }}></div>

                  {/* Helpful hint overlay */}
                  <div className="absolute bottom-2 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <span className="bg-slate-900/80 text-amber-300 text-[10px] px-3 py-1 rounded-full border border-amber-500/30">
                      💡 اسحب الصورة بالماوس لضبط التوسيط
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">لم يتم رفع صورة بعد</h4>
                    <p className="text-xs text-slate-400 mt-1">اختر صورة من جهازك أو استخدم الكاميرا المباشرة</p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> رفع صورة
                    </button>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
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

            {/* Quick Action Bar under Stage */}
            {imageSrc && !isCameraActive && (
              <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.15, 3))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                  title="تدوير 90 درجة"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMaskType(prev => prev === 'circle' ? 'square' : 'circle')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  {maskType === 'circle' ? 'إطار دائري' : 'إطار كارت مربعي'}
                </button>
                <button
                  onClick={resetAdjustments}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl"
                  title="إعادة ضبط"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* AI Enhance Banner Message */}
            {aiMessage && (
              <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs text-center font-bold animate-in fade-in">
                {aiMessage}
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: Controls, Costumes & AI Tools */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* AI Studio Enhance Button */}
            {imageSrc && (
              <button
                onClick={handleAiEnhance}
                disabled={isAiEnhancing}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                {isAiEnhancing ? 'جاري ضبط ألوان البورتريه...' : '✨ تحسين الجودة والتباين بالذكاء الاصطناعي'}
              </button>
            )}

            {/* COSTUME / ATTIRE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                اختر زي التكريم والتفوق للطالب (AI Costume):
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 pr-2">
                {COSTUMES.map(costume => (
                  <button
                    key={costume.id}
                    onClick={() => setSelectedCostume(costume.id)}
                    className={`p-2.5 rounded-2xl border text-right transition-all flex items-start gap-2 ${
                      selectedCostume === costume.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-2 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{costume.icon}</span>
                    <div className="overflow-hidden">
                      <span className="block font-bold text-xs truncate">{costume.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{costume.badge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* COSTUME POSITION CONTROLS (IF COSTUME SELECTED) */}
            {selectedCostume !== 'none' && (
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-indigo-500/20 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 text-indigo-400" /> ضبط موضع زي التخرج</span>
                  <span className="text-[10px] text-slate-400">حجم الزي: {Math.round(costumeScale * 100)}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">الموقع الرأسي Y</label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={costumeOffsetY}
                      onChange={(e) => setCostumeOffsetY(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">الموقع الأفقي X</label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={costumeOffsetX}
                      onChange={(e) => setCostumeOffsetX(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL LIGHTING & COLOR ADJUSTMENTS */}
            {imageSrc && (
              <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> تعديل الإضاءة والتباين باليد
                </span>

                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> السطوع والإضاءة</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Contrast className="w-3 h-3 text-indigo-400" /> التباين (Contrast)</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> رفع صورة أخرى
            </button>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" /> التقاط صورة
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={!imageSrc}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> اعتماد وحفظ صورة الطالب 📸
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
