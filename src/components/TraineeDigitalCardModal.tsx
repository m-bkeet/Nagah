import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Share2,
  Phone,
  QrCode,
  Sparkles,
  CheckCircle2,
  Printer,
  Copy,
  GraduationCap,
  Calendar,
  Building2,
  Award,
  Layers,
  Camera,
  Sun,
  Moon,
  ShieldCheck,
  User,
  ExternalLink,
  Upload,
  Clock,
  Star
} from 'lucide-react';
import QRCode from 'qrcode';
import { captureElementToCanvas } from '../utils/captureUtils';
import { Trainee, Course, Group, Branch } from '../types';
import { getEffectiveCenterLogo, handleLogoError } from '../utils/centerLogo';
import { useCenter } from '../context/CenterContext';
import { useTheme } from '../context/ThemeContext';
import { getPublicStudentPortalUrl } from '../utils/urlHelper';
import { api } from '../services/api';

interface TraineeDigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee?: Trainee | null;
  course?: Course | null;
  group?: Group | null;
  branch?: Branch | null;
  customData?: {
    traineeName: string;
    traineeCode: string;
    courseName?: string;
    groupName?: string;
    branchName?: string;
    phone?: string;
    photoUrl?: string;
  };
  onPhotoUpdated?: (traineeId: string, newPhotoUrl: string) => void;
}

export const TraineeDigitalCardModal: React.FC<TraineeDigitalCardModalProps> = ({
  isOpen,
  onClose,
  trainee,
  course,
  group,
  branch,
  customData,
  onPhotoUpdated
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { theme } = useTheme();
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>(() => (theme === 'dark' ? 'dark' : 'light'));
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>(
    trainee?.photoUrl || (trainee as any)?.photo || customData?.photoUrl || (trainee?.id ? localStorage.getItem('student_session_photo_' + trainee.id) || localStorage.getItem('student_session_photo_' + trainee.code) : '') || undefined
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { showToast, settings } = useCenter();
  const centerLogo = getEffectiveCenterLogo(settings?.logoUrl);

  // Sync with global theme
  useEffect(() => {
    if (theme) {
      setCardTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  const name = trainee?.fullName || customData?.traineeName || 'متدرب النجاح';
  const code = trainee?.code || customData?.traineeCode || 'A001';
  const courseName = course?.name || customData?.courseName || 'الدورة التدريبية';
  const groupName = group?.name || customData?.groupName || 'المجموعة الأساسية';
  const branchName = branch?.name || customData?.branchName || 'الفرع الرئيسي';
  const phone = trainee?.phone || customData?.phone || '';
  const registrationDate = trainee?.registrationDate || new Date().toISOString().split('T')[0];
  const points = trainee?.totalPoints || trainee?.points || 150;
  const managerName = settings?.managerName || 'د. محمد رمضان بخيت';

  const parentPhone = trainee?.parentPhone;
  const grade = trainee?.grade;

  // Digital portal & direct attendance URL for the QR code (Memoized to prevent infinite loop)
  const portalUrl = React.useMemo(() => getPublicStudentPortalUrl(code), [code]);
  const attendanceScanUrl = React.useMemo(() => {
    return `${portalUrl}&action=checkin&source=carnet_scan`;
  }, [portalUrl]);

  // Keep current photo synced if trainee changes
  useEffect(() => {
    const resolved = trainee?.photoUrl || (trainee as any)?.photo || customData?.photoUrl || (trainee?.id ? localStorage.getItem('student_session_photo_' + trainee.id) || localStorage.getItem('student_session_photo_' + trainee.code) : '');
    setCurrentPhoto(resolved || undefined);
  }, [trainee?.photoUrl, (trainee as any)?.photo, customData?.photoUrl, trainee?.id, trainee?.code]);

  // Generate high-resolution QR Code
  useEffect(() => {
    if (!isOpen || !code) return;
    let isMounted = true;
    QRCode.toDataURL(attendanceScanUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: cardTheme === 'dark' ? '#0f172a' : '#78350f',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR generation error:', err));

    return () => {
      isMounted = false;
    };
  }, [isOpen, code, attendanceScanUrl, cardTheme]);

  if (!isOpen) return null;

  // Handle direct photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setCurrentPhoto(base64Data);

        if (trainee?.id) {
          try {
            // Save to localStorage for instant persistence across tabs and portals
            localStorage.setItem('student_session_photo_' + trainee.id, base64Data);
            if (trainee.code) {
              localStorage.setItem('student_session_photo_' + trainee.code, base64Data);
            }

            // Sync to backend APIs
            await api.updateTrainee(trainee.id, { photoUrl: base64Data });
            try {
              await api.updateStudentPhoto({ traineeId: trainee.id, photoUrl: base64Data });
            } catch {}

            // Broadcast photo update event across open views
            window.dispatchEvent(new CustomEvent('nagah_photo_updated', {
              detail: { traineeId: trainee.id, code: trainee.code, photoUrl: base64Data }
            }));

            if (onPhotoUpdated) {
              onPhotoUpdated(trainee.id, base64Data);
            }
            showToast('تم تحديث وحفظ صورة المتدرب بنجاح! ستظهر تلقائياً في كافة البطاقات والطباعات القادمة 🌟', 'success');
          } catch (apiErr) {
            console.error('Error saving photo to DB:', apiErr);
            showToast('تم عرض الصورة في البطاقة مؤقتاً، يرجى حفظ بيانات المتدرب لتثبيتها', 'info');
          }
        } else {
          showToast('تم تحديث صورة الكارت بنجاح', 'success');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing photo:', err);
      showToast('حدث خطأ أثناء معالجة الصورة', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const canvas = await captureElementToCanvas(cardRef.current, {
        scale: 3,
        backgroundColor: cardTheme === 'dark' ? '#070b14' : '#ffffff'
      });
      if (!canvas) throw new Error('Card capture failed');
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `كارنيه_متدرب_${code}_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('تم تحميل كارنيه المتدرب فائق الجودة بنجاح! 📸', 'success');
    } catch (err) {
      console.error('Error exporting card image:', err);
      showToast('تعذر حفظ صورة الكارت تلقائياً. يمكنك أخذ لقطة شاشة بدلاً من ذلك.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareText = `🌟 *مرحبا بكم في النجاح للتدريب والاستشارات* 🌟\n\nيسعدنا انضمامكم إلى أسرة المركز ونتمنى لكم رحلة تعليمية وتدريبية متميزة! 🎉\n\n🪪 *بطاقة العضوية والكارنيه الرقمي:*\n👤 *اسم المتدرب:* ${name}\n🔑 *كود المتدرب المعتمد:* ${code}\n📚 *الدورة / الصف التدريبي:* ${courseName}\n👥 *المجموعة والموعد:* ${groupName}\n🏢 *الفرع:* ${branchName}\n\n📲 *رابط الملف الرقمي وتسجيل الحضور المباشر:*\n${portalUrl}\n\n✍️ *الاعتماد:* مدير عام المركز: ${managerName}\n📍 *النجاح للتدريب والاستشارات - نحو مستقبل واعد*`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    showToast('تم نسخ نص الترحيب وبيانات الكارنيه بنجاح! 📋', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('يرجى السماح بفتح النوافذ المنبثقة للطباعة', 'error');
      return;
    }

    const isDark = cardTheme === 'dark';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة كارنيه المتدرب - ${name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@500;700;900&display=swap');
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body {
            font-family: 'Cairo', sans-serif;
            background: #f1f5f9;
            margin: 0;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .no-print { margin-bottom: 20px; }
          .print-btn {
            background: #d97706;
            color: #ffffff;
            border: none;
            padding: 12px 32px;
            font-size: 15px;
            font-weight: 800;
            font-family: 'Cairo', sans-serif;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
          }
          @media print {
            body { background: transparent; padding: 0; min-height: auto; }
            .no-print { display: none !important; }
            .card-wrapper { box-shadow: none !important; margin: 0 auto; page-break-inside: avoid; }
          }
          .card-wrapper {
            width: 92mm;
            height: 135mm;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            background: ${isDark ? 'linear-gradient(145deg, #090e1a, #0f172a, #1e1b4b)' : 'linear-gradient(145deg, #ffffff, #fffdf8, #f8fafc)'};
            color: ${isDark ? '#f8fafc' : '#0f172a'};
            border: 2px solid ${isDark ? '#f59e0b' : '#d97706'};
            box-shadow: 0 20px 35px -10px rgba(0,0,0,0.25);
            display: flex;
            flex-direction: column;
          }
          .lanyard-slot {
            width: 32px;
            height: 5px;
            background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'};
            border-radius: 10px;
            margin: 6px auto 0 auto;
          }
          .header-box {
            background: ${isDark ? 'linear-gradient(90deg, #1e293b, #0f172a)' : 'linear-gradient(90deg, #d97706, #b45309)'};
            color: #ffffff;
            padding: 10px 14px;
            border-bottom: 2px solid #f59e0b;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo-circle {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #ffffff;
            padding: 3px;
            border: 1.5px solid #f59e0b;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo-circle img { width: 100%; height: 100%; object-fit: contain; }
          .header-text { flex: 1; margin-right: 10px; }
          .center-name { font-size: 13px; font-weight: 900; color: #fbbf24; line-height: 1.2; }
          .badge-type { font-size: 9px; font-weight: 700; color: #e2e8f0; margin-top: 2px; }
          .body-content {
            padding: 12px 14px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .photo-code-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }
          .photo-frame {
            width: 72px;
            height: 72px;
            border-radius: 14px;
            border: 2px solid #f59e0b;
            overflow: hidden;
            background: ${isDark ? '#1e293b' : '#e2e8f0'};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          .photo-frame img { width: 100%; height: 100%; object-fit: cover; }
          .photo-placeholder {
            font-size: 28px;
            font-weight: 900;
            color: #d97706;
          }
          .code-box {
            flex: 1;
            background: ${isDark ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc'};
            border: 1.5px dashed ${isDark ? '#f59e0b' : '#94a3b8'};
            border-radius: 12px;
            padding: 8px 10px;
            text-align: center;
          }
          .code-title { font-size: 8.5px; font-weight: 700; color: ${isDark ? '#94a3b8' : '#64748b'}; }
          .code-value { font-family: monospace; font-size: 22px; font-weight: 900; color: #f59e0b; letter-spacing: 2px; margin: 2px 0; }
          .code-status { font-size: 8px; font-weight: 800; color: #10b981; }
          .info-table {
            width: 100%;
            background: ${isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff'};
            border-radius: 10px;
            border: 1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#e2e8f0'};
            padding: 8px 10px;
            margin-bottom: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            padding: 3px 0;
            border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'};
          }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: ${isDark ? '#94a3b8' : '#64748b'}; font-weight: 700; }
          .info-val { font-weight: 900; color: ${isDark ? '#ffffff' : '#0f172a'}; }
          .qr-signature-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 4px;
            padding-top: 6px;
            border-top: 1px dashed ${isDark ? '#334155' : '#cbd5e1'};
          }
          .qr-box {
            background: #ffffff;
            padding: 4px;
            border-radius: 8px;
            border: 1px solid #f59e0b;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 68px;
            flex-shrink: 0;
          }
          .qr-box img { width: 60px; height: 60px; object-fit: contain; }
          .qr-label { font-size: 7px; font-weight: 800; color: #0f172a; margin-top: 2px; }
          .signature-box {
            flex: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .signature-title { font-size: 8px; font-weight: 700; color: ${isDark ? '#94a3b8' : '#64748b'}; }
          .signature-manager { font-size: 10px; font-weight: 900; color: #f59e0b; margin-top: 2px; }
          .signature-stamp {
            width: 70px;
            height: 24px;
            margin-top: 2px;
            opacity: 0.9;
          }
          .card-footer-strip {
            background: ${isDark ? '#020617' : '#0f172a'};
            color: #94a3b8;
            font-size: 7.5px;
            font-weight: 700;
            padding: 5px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #f59e0b;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">طباعة الكارنيه الآن 🖨️</button>
        </div>
        <div class="card-wrapper">
          <div class="lanyard-slot"></div>
          <div class="header-box">
            <div class="logo-circle">
              <img src="${centerLogo}" alt="شعار المركز" onerror="this.src='/logo.png'" />
            </div>
            <div class="header-text">
              <div class="center-name">${settings?.centerName || 'النجاح للتدريب والاستشارات'}</div>
              <div class="badge-type">🌟 بطاقة العضوية والتدريب الرسمية الذكية</div>
            </div>
          </div>
          <div class="body-content">
            <div class="photo-code-row">
              <div class="photo-frame">
                ${
                  currentPhoto
                    ? `<img src="${currentPhoto}" alt="${name}" />`
                    : `<div class="photo-placeholder">${name.charAt(0)}</div>`
                }
              </div>
              <div class="code-box">
                <div class="code-title">كود المتدرب المعتمد</div>
                <div class="code-value">${code}</div>
                <div class="code-status">● عضوية مسجلة ومفعلة</div>
              </div>
            </div>

            <div class="info-table">
              <div class="info-row">
                <span class="info-label">اسم المتدرب:</span>
                <span class="info-val" style="font-size: 11.5px; color: ${isDark ? '#fef08a' : '#1e3a8a'};">${name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الصف / الدورة:</span>
                <span class="info-val">${courseName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">المجموعة والموعد:</span>
                <span class="info-val">${groupName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الفرع:</span>
                <span class="info-val">${branchName}</span>
              </div>
              ${
                phone
                  ? `<div class="info-row">
                      <span class="info-label">هاتف التواصل:</span>
                      <span class="info-val" dir="ltr" style="font-family: monospace;">${phone}</span>
                    </div>`
                  : ''
              }
            </div>

            <div class="qr-signature-row">
              <div class="qr-box">
                <img src="${qrDataUrl}" alt="QR Code" />
                <span class="qr-label">مسح للحضور والملف</span>
              </div>
              <div class="signature-box">
                <div class="signature-title">الاعتماد والتوقيع الرسمي</div>
                <div class="signature-manager">${managerName}</div>
                <div style="font-size: 7px; color: #10b981; font-weight: 700; margin-top: 1px;">✓ معتمد إلكترونياً من الإدارة</div>
                <svg class="signature-stamp" viewBox="0 0 140 40" fill="none">
                  <path d="M10 25 C30 5, 45 35, 70 15 C95 -5, 110 30, 130 18" stroke="${isDark ? '#38bdf8' : '#0284c7'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M40 32 C60 28, 85 32, 115 28" stroke="${isDark ? '#38bdf8' : '#0284c7'}" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card-footer-strip">
            <span>النجاح للتدريب والاستشارات © 2026/2027</span>
            <span style="color: #f59e0b;">معتمد رسمياً ★ SMART ID</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 450);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    showToast('تم إرسال بطاقة الكارنيه إلى نافذة الطباعة 🖨️', 'success');
  };

  const isDark = cardTheme === 'dark';

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full my-auto max-h-[95vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 modal-dialog-box animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>كارنيه وبطاقة هوية المتدرب الذكية</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  VIP ID
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                النجاح للتدريب والاستشارات • د. محمد رمضان بخيت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setCardTheme(cardTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700"
              title={cardTheme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
            >
              {cardTheme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">ليلي</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* THE LUXURY ID CARNET (Capturable Node) */}
          <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-3xl border-2 transition-all shadow-2xl p-4 sm:p-6 ${
              isDark
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 border-amber-500/80 shadow-amber-500/20'
                : 'bg-gradient-to-br from-white via-amber-50/25 to-slate-50 text-slate-900 border-amber-500 shadow-xl shadow-amber-950/10'
            }`}
            style={{ minHeight: '460px' }}
          >
            {/* Lanyard Punch Slot Visual */}
            <div className="w-14 h-1.5 mx-auto -mt-1 mb-3 rounded-full bg-slate-300 dark:bg-slate-700/80 border border-slate-400/20" />

            {/* Guilloche / Luxury Background Decorative Glows */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />

            {/* Official Top Header Strip with Logo & Brand */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between relative z-10 shadow-md ${
                isDark
                  ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-amber-500/40 text-white'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-amber-400 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Official Logo with Golden Halo */}
                <div className="w-13 h-13 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0">
                  <img
                    src={centerLogo}
                    alt="النجاح"
                    className="w-full h-full object-contain"
                    onError={handleLogoError}
                  />
                  <span className="hidden font-black text-xs text-amber-600">النجاح</span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-amber-100 dark:text-amber-400 leading-tight">
                    {settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}
                  </h4>
                  <p className="text-[10.5px] font-bold text-amber-50 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <span>🌟 بطاقة العضوية والتدريب الرسمية الذكية</span>
                    <span>•</span>
                    <span className="text-amber-200 dark:text-amber-300 font-extrabold">{branchName}</span>
                  </p>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-white/20 dark:bg-amber-500/20 text-white dark:text-amber-300 border border-white/40 dark:border-amber-400/50 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-200 dark:text-amber-400" />
                  <span>2026/2027</span>
                </span>
              </div>
            </div>

            {/* Trainee Photo & Prominent Code Row */}
            <div className="my-4 grid grid-cols-12 gap-3 items-center relative z-10">
              {/* Photo Frame with Live Upload Trigger */}
              <div className="col-span-4 sm:col-span-3 flex flex-col items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl border-2 border-amber-500 overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                  title="انقر لتغيير أو رفع صورة المتدرب"
                >
                  {currentPhoto ? (
                    <img
                      src={currentPhoto}
                      alt={name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-3xl font-black font-serif">{name.charAt(0)}</span>
                      <span className="text-[8px] font-bold mt-1 text-slate-950 leading-tight">
                        الصورة قيد المزامنة
                      </span>
                    </div>
                  )}

                  {/* Upload Overlay Hover Indicator */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[9.5px] font-bold gap-1">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>تغيير الصورة</span>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{currentPhoto ? 'تحديث الصورة' : 'رفع صورة 📷'}</span>
                </button>
              </div>

              {/* Trainee Code & Verified Badge */}
              <div className="col-span-8 sm:col-span-9">
                <div
                  className={`p-3.5 rounded-2xl border-2 shadow-sm flex items-center justify-between ${
                    isDark
                      ? 'bg-slate-900/90 border-amber-500/50 text-slate-100'
                      : 'bg-amber-50/60 border-amber-400/80 text-slate-900'
                  }`}
                >
                  <div className="text-right space-y-0.5">
                    <span
                      className={`text-[10.5px] font-bold block ${
                        isDark ? 'text-amber-300/80' : 'text-slate-700'
                      }`}
                    >
                      كود المتدرب الرسمي للدخول والحضور:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-widest font-mono select-all">
                        {code}
                      </span>
                      <button
                        onClick={handleCopyText}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                        title="نسخ الكود"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>عضوية رسمية مسجلة ومفعلة بالنظام</span>
                    </div>
                  </div>

                  {/* Points / Excellence pill */}
                  <div className="text-left hidden sm:block bg-amber-500/15 border border-amber-500/40 px-3.5 py-2 rounded-xl">
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">{points}</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-600 dark:text-slate-400">نقطة تميز</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trainee Details Grid */}
            <div
              className={`p-4 rounded-2xl border-2 mb-3.5 relative z-10 ${
                isDark
                  ? 'bg-slate-900/95 border-amber-500/40 text-slate-100'
                  : 'bg-white border-amber-200/90 text-slate-900 shadow-sm'
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className={`block text-[10.5px] font-bold ${
                      isDark ? 'text-amber-300' : 'text-slate-600'
                    }`}
                  >
                    اسم المتدرب الرباعي الكامل:
                  </span>
                  <span
                    className={`font-black text-base sm:text-lg leading-snug break-words block mt-0.5 ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    {name}
                  </span>
                </div>

                <div>
                  <span
                    className={`block text-[10.5px] font-bold ${
                      isDark ? 'text-amber-300' : 'text-slate-600'
                    }`}
                  >
                    الدورة / البرنامج:
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-xs block mt-0.5">
                    {courseName}
                  </span>
                </div>

                <div>
                  <span
                    className={`block text-[10.5px] font-bold ${
                      isDark ? 'text-amber-300' : 'text-slate-600'
                    }`}
                  >
                    المجموعة والموعد:
                  </span>
                  <span
                    className={`font-bold text-xs block mt-0.5 ${
                      isDark ? 'text-indigo-300' : 'text-indigo-800'
                    }`}
                  >
                    {groupName}
                  </span>
                </div>

                <div>
                  <span
                    className={`block text-[10.5px] font-bold ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    الفرع والقاعة:
                  </span>
                  <span className="font-bold text-xs block mt-0.5 text-slate-900 dark:text-slate-200">
                    {branchName}
                  </span>
                </div>

                {phone && (
                  <div>
                    <span
                      className={`block text-[10.5px] font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      هاتف المتدرب:
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-950 dark:text-slate-100" dir="ltr">
                      {phone}
                    </span>
                  </div>
                )}

                {parentPhone && (
                  <div>
                    <span
                      className={`block text-[10.5px] font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      هاتف ولي الأمر / الطوارئ:
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-950 dark:text-slate-100" dir="ltr">
                      {parentPhone}
                    </span>
                  </div>
                )}

                <div>
                  <span
                    className={`block text-[10.5px] font-bold ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    تاريخ التسجيل:
                  </span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-bold block mt-0.5">
                    {registrationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Barcode / QR Code & Official Director Signature Section */}
            <div
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 relative z-10 ${
                isDark
                  ? 'bg-slate-950/90 border-amber-500/30'
                  : 'bg-white border-amber-200/90 shadow-sm'
              }`}
            >
              {/* QR Code with Attendance Link */}
              <div className="flex items-center gap-3">
                {qrDataUrl ? (
                  <div className="bg-white p-1.5 rounded-2xl border-2 border-amber-500 shadow-md shrink-0 flex flex-col items-center">
                    <img src={qrDataUrl} alt="QR Code" className="w-17 h-17 object-contain" />
                    <span className="text-[8px] font-black text-slate-950 mt-0.5 font-sans">
                      مسح فوري للحضور
                    </span>
                  </div>
                ) : (
                  <div className="w-17 h-17 rounded-2xl bg-slate-200 animate-pulse" />
                )}

                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-black text-amber-600 dark:text-amber-400">
                    <QrCode className="w-4 h-4" />
                    <span>باركود الدخول الذكي والحضور</span>
                  </div>
                  <p
                    className={`text-[9.5px] leading-relaxed max-w-[170px] ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    يُمسح بالكاميرا لفتح الملف الرقمي أو تسجيل حضور الطالب فوراً بالمعمل
                  </p>
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>فتح الملف الرقمي للبوابة</span>
                  </a>
                </div>
              </div>

              {/* Director Signature & Stamp */}
              <div className="text-center flex flex-col items-center justify-center pl-2 border-r-2 border-slate-300 dark:border-slate-700 pr-4">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                  يعتمد
                </span>
                <span
                  className={`text-[9px] font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  مدير عام الأكاديمية
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-300 whitespace-nowrap mt-0.5">
                  {managerName}
                </span>
                {/* Official Signature SVG */}
                <svg className="w-24 h-6 mt-0.5" viewBox="0 0 140 40" fill="none">
                  <path
                    d="M10 25 C30 5, 45 35, 70 15 C95 -5, 110 30, 130 18"
                    stroke={isDark ? '#38bdf8' : '#0284c7'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M40 32 C60 28, 85 32, 115 28"
                    stroke={isDark ? '#38bdf8' : '#0284c7'}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card Footer Stamp */}
            <div
              className={`mt-3 pt-2 border-t flex items-center justify-between text-[9.5px] relative z-10 ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              <span>مركز النجاح للتدريب والاستشارات © 2026/2027</span>
              <span className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>رسمي ومعتمد من الإدارة العامة</span>
              </span>
            </div>
          </div>

          {/* Hidden File Input for Instant Photo Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Download as Image */}
              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'جاري تصدير الكارنيه...' : 'تحميل الكارنيه كصورة فاخرة 📸'}</span>
              </button>

              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-3 px-4 rounded-2xl text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 text-center cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-100" />
                <span>إرسال واتساب 📲</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Formatted Welcome Message */}
              <button
                onClick={handleCopyText}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{isCopied ? 'تم نسخ الرسالة بنجاح!' : 'نسخ نص الترحيب والرابط'}</span>
              </button>

              {/* Direct Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 py-2.5 px-5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>طباعة الكارنيه 🖨️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
