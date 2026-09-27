import React, { useState } from 'react';
import {
  X,
  Printer,
  Send,
  MessageCircle,
  Award,
  Users,
  CheckCircle,
  Sun,
  Moon,
  Sparkles,
  QrCode,
  Search,
  Filter,
  Layers,
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import { Trainee, Course, Group, Branch } from '../types';
import { getPublicStudentPortalUrl } from '../utils/urlHelper';
import { useCenter } from '../context/CenterContext';
import { useTheme } from '../context/ThemeContext';
import { getEffectiveCenterLogo, handleLogoError } from '../utils/centerLogo';

interface StudentCardsBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  courses: Course[];
  groups: Group[];
  branches: Branch[];
  initialSelectedTrainee?: Trainee | null;
  initialGroupId?: string;
  initialCourseId?: string;
  initialBranchId?: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData: () => void;
}

export const StudentCardsBroadcastModal: React.FC<StudentCardsBroadcastModalProps> = ({
  isOpen,
  onClose,
  trainees,
  courses,
  groups,
  branches,
  initialSelectedTrainee,
  initialGroupId,
  initialCourseId,
  initialBranchId,
  onShowToast,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'broadcast'>('cards');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId || 'all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || 'all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { settings } = useCenter();
  const { theme } = useTheme();
  const [printTheme, setPrintTheme] = useState<'light' | 'dark'>(() => (theme === 'dark' ? 'dark' : 'light'));
  const [cardsPerPage, setCardsPerPage] = useState<'4' | '2' | '1'>('4');
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'مرحباً بك في مركز النجاح للتدريب والاستشارات. نود تذكيرك بموعد محاضرتك القادمة ومتابعة مهامك التدريبية عبر الملف الرقمي.'
  );
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>(
    initialSelectedTrainee ? [initialSelectedTrainee.id] : []
  );
  const managerName = settings?.managerName || 'د. محمد رمضان بخيت';
  const centerLogo = getEffectiveCenterLogo(settings?.logoUrl);

  useEffect(() => {
    if (theme) {
      setPrintTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  if (!isOpen) return null;

  const filteredTrainees = trainees.filter((t) => {
    if (selectedBranchId !== 'all' && t.branchId !== selectedBranchId) return false;
    if (
      selectedCourseId !== 'all' &&
      t.courseId !== selectedCourseId &&
      !(t.courseIds && t.courseIds.includes(selectedCourseId))
    )
      return false;
    if (selectedGroupId !== 'all' && t.groupId !== selectedGroupId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = t.fullName?.toLowerCase().includes(q);
      const matchCode = t.code?.toLowerCase().includes(q);
      const matchPhone = t.phone?.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedTraineeIds.length === filteredTrainees.length) {
      setSelectedTraineeIds([]);
    } else {
      setSelectedTraineeIds(filteredTrainees.map((t) => t.id));
    }
  };

  const handleToggleTrainee = (id: string) => {
    if (selectedTraineeIds.includes(id)) {
      setSelectedTraineeIds(selectedTraineeIds.filter((i) => i !== id));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, id]);
    }
  };

  // High-End VIP Carnet Batch Printing
  const handlePrintCards = async () => {
    const listToPrint =
      selectedTraineeIds.length > 0
        ? filteredTrainees.filter((t) => selectedTraineeIds.includes(t.id))
        : filteredTrainees;

    if (listToPrint.length === 0) {
      onShowToast('لا يوجد متدربين محددين للطباعة', 'error');
      return;
    }

    setIsPreparingPrint(true);
    onShowToast(`جاري توليد باركودات وبطاقات ${listToPrint.length} متدرب بجودة فائقة...`, 'info');

    try {
      // Generate QR codes for all trainees concurrently
      const qrCodesMap: Record<string, string> = {};
      await Promise.all(
        listToPrint.map(async (t) => {
          const studentCode = t.code || 'N/A';
          const scanUrl = `${getPublicStudentPortalUrl(studentCode)}&action=checkin&source=carnet_batch&time=${Date.now()}`;
          try {
            const qrUrl = await QRCode.toDataURL(scanUrl, {
              width: 260,
              margin: 1,
              color: {
                dark: printTheme === 'dark' ? '#0f172a' : '#0a192f',
                light: '#ffffff'
              },
              errorCorrectionLevel: 'M'
            });
            qrCodesMap[t.id] = qrUrl;
          } catch (e) {
            console.error('Failed to generate QR for trainee:', t.code, e);
          }
        })
      );

      const isDark = printTheme === 'dark';
      const gridColumns = cardsPerPage === '1' ? '1fr' : 'repeat(2, 1fr)';
      const cardHeight = cardsPerPage === '4' ? '128mm' : cardsPerPage === '2' ? '138mm' : '145mm';

      const cardsHtml = listToPrint
        .map((t) => {
          const branchObj = branches.find((b) => b.id === t.branchId);
          const courseObj = courses.find(
            (c) => c.id === t.courseId || (t.courseIds && t.courseIds.includes(c.id))
          );
          const groupObj = groups.find((g) => g.id === t.groupId);
          const qrCodeImg = qrCodesMap[t.id] || '';
          const photo = t.photoUrl || (t as any).photo || (t.id ? localStorage.getItem('student_session_photo_' + t.id) : null) || (t.code ? localStorage.getItem('student_session_photo_' + t.code) : null) || '';
          const initialLetter = t.fullName?.charAt(0) || 'م';
          const branchName = branchObj ? branchObj.name : 'الفرع الرئيسي';
          const courseName = courseObj ? courseObj.name : 'الدورة التدريبية';
          const groupName = groupObj ? groupObj.name : 'المجموعة الأساسية';

          return `
          <div class="trainee-carnet-card">
            <!-- Cut guide corner ticks -->
            <div class="cut-guide-corner top-left"></div>
            <div class="cut-guide-corner top-right"></div>
            <div class="cut-guide-corner bottom-left"></div>
            <div class="cut-guide-corner bottom-right"></div>

            <div class="lanyard-slot"></div>

            <!-- Card Header -->
            <div class="card-header">
              <div class="logo-box">
                <img src="${centerLogo}" alt="شعار المركز" onerror="this.src='/logo.png'" />
              </div>
              <div class="header-titles">
                <div class="org-name">${settings?.centerName || 'النجاح للتدريب والاستشارات'}</div>
                <div class="card-title">🌟 بطاقة العضوية والتدريب الرسمية الذكية</div>
              </div>
              <div class="year-pill">2026/2027</div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <div class="photo-code-row">
                <div class="photo-box">
                  ${
                    photo
                      ? `<img src="${photo}" alt="${t.fullName}" />`
                      : `<div class="photo-placeholder">
                          <span>${initialLetter}</span>
                          <span class="photo-note">الصورة قيد المزامنة</span>
                         </div>`
                  }
                </div>

                <div class="code-box">
                  <div class="code-title">كود المتدرب المعتمد</div>
                  <div class="code-val">${t.code || 'N/A'}</div>
                  <div class="code-badge">● عضوية مسجلة بالنظام</div>
                </div>
              </div>

              <!-- Student Info Table -->
              <div class="info-table">
                <div class="info-row">
                  <span class="info-lbl">اسم المتدرب:</span>
                  <span class="info-val name-val">${t.fullName}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">الصف / الدورة:</span>
                  <span class="info-val">${courseName}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">المجموعة والموعد:</span>
                  <span class="info-val group-val">${groupName}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">الفرع:</span>
                  <span class="info-val">${branchName}</span>
                </div>
                ${
                  t.phone
                    ? `<div class="info-row">
                        <span class="info-lbl">هاتف التواصل:</span>
                        <span class="info-val phone-val" dir="ltr">${t.phone}</span>
                      </div>`
                    : ''
                }
              </div>

              <!-- QR & Director Signature Section -->
              <div class="qr-sign-row">
                <div class="qr-container">
                  <img src="${qrCodeImg}" alt="QR Code" />
                  <span class="qr-text">مسح للحضور والملف</span>
                </div>

                <div class="signature-container">
                  <div class="sign-title">يعتمد</div>
                  <div class="sign-subtitle">مدير عام الأكاديمية</div>
                  <div class="sign-name">${managerName}</div>
                  <svg class="sign-svg" viewBox="0 0 140 40" fill="none">
                    <path d="M10 25 C30 5, 45 35, 70 15 C95 -5, 110 30, 130 18" stroke="${isDark ? '#38bdf8' : '#0284c7'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M40 32 C60 28, 85 32, 115 28" stroke="${isDark ? '#38bdf8' : '#0284c7'}" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
              <span>النجاح للتدريب والاستشارات © 2026/2027</span>
              <span class="seal-badge">معتمد رسمياً ★ SMART ID</span>
            </div>
          </div>
        `;
        })
        .join('');

      const fullPrintDocumentHtml = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طباعة بطاقات وكارنيهات المتدربين - مركز النجاح</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@500;700;900&display=swap');
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              font-family: 'Cairo', sans-serif;
              background: ${isDark ? '#0b0f19' : '#f8fafc'};
              color: ${isDark ? '#f8fafc' : '#0f172a'};
              margin: 0;
              padding: 24px;
            }
            .no-print {
              background: ${isDark ? '#1e293b' : '#ffffff'};
              border-radius: 16px;
              padding: 16px 24px;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
            }
            .print-btn {
              background: linear-gradient(135deg, #d97706, #b45309);
              color: #ffffff;
              border: none;
              padding: 12px 28px;
              font-size: 15px;
              font-weight: 800;
              font-family: 'Cairo', sans-serif;
              border-radius: 12px;
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
            }
            .print-info {
              font-size: 13px;
              font-weight: 700;
              color: ${isDark ? '#94a3b8' : '#475569'};
            }
            .grid-sheet {
              display: grid;
              grid-template-columns: ${gridColumns};
              gap: 20px;
              max-width: 210mm;
              margin: 0 auto;
            }
            @media print {
              body { background: transparent; padding: 0; }
              .no-print { display: none !important; }
              .grid-sheet {
                gap: 12px;
                width: 100%;
                max-width: none;
                page-break-inside: auto;
              }
              .trainee-carnet-card {
                page-break-inside: avoid;
                break-inside: avoid;
                box-shadow: none !important;
              }
            }
            .trainee-carnet-card {
              position: relative;
              width: 100%;
              max-width: 96mm;
              height: ${cardHeight};
              border-radius: 16px;
              overflow: hidden;
              background: ${isDark ? 'linear-gradient(145deg, #090e1a, #0f172a, #1e1b4b)' : '#ffffff'};
              color: ${isDark ? '#f8fafc' : '#0f172a'};
              border: 2px solid ${isDark ? '#f59e0b' : '#d97706'};
              box-shadow: 0 8px 20px rgba(0,0,0,0.12);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              margin: 0 auto;
            }
            .cut-guide-corner {
              position: absolute;
              width: 6px;
              height: 6px;
              border-color: rgba(148, 163, 184, 0.4);
              pointer-events: none;
            }
            .cut-guide-corner.top-left { top: 0; left: 0; border-top: 1px dashed; border-left: 1px dashed; }
            .cut-guide-corner.top-right { top: 0; right: 0; border-top: 1px dashed; border-right: 1px dashed; }
            .cut-guide-corner.bottom-left { bottom: 0; left: 0; border-bottom: 1px dashed; border-left: 1px dashed; }
            .cut-guide-corner.bottom-right { bottom: 0; right: 0; border-bottom: 1px dashed; border-right: 1px dashed; }
            .lanyard-slot {
              width: 32px;
              height: 4.5px;
              background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'};
              border-radius: 10px;
              margin: 5px auto 0 auto;
            }
            .card-header {
              background: ${isDark ? 'linear-gradient(90deg, #1e293b, #0f172a)' : 'linear-gradient(90deg, #fffbeb, #ffffff, #fffbeb)'};
              color: ${isDark ? '#ffffff' : '#0f172a'};
              padding: 7px 12px;
              border-bottom: 2px solid #f59e0b;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .logo-box {
              width: 38px;
              height: 38px;
              border-radius: 10px;
              background: #ffffff;
              padding: 2px;
              border: 1.5px solid #f59e0b;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .logo-box img { width: 100%; height: 100%; object-fit: contain; }
            .header-titles { flex: 1; margin-right: 8px; }
            .org-name { font-size: 11.5px; font-weight: 900; color: ${isDark ? '#fbbf24' : '#b45309'}; line-height: 1.2; }
            .card-title { font-size: 8px; font-weight: 700; color: ${isDark ? '#e2e8f0' : '#475569'}; margin-top: 1px; }
            .year-pill {
              font-size: 7.5px;
              font-weight: 800;
              background: ${isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'};
              color: ${isDark ? '#fbbf24' : '#92400e'};
              padding: 2px 6px;
              border-radius: 6px;
              border: 1px solid ${isDark ? 'rgba(245, 158, 11, 0.4)' : '#fde68a'};
            }
            .card-body {
              padding: 8px 11px;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: ${isDark ? 'transparent' : '#ffffff'};
            }
            .photo-code-row {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 6px;
            }
            .photo-box {
              width: 62px;
              height: 62px;
              border-radius: 12px;
              border: 2px solid #f59e0b;
              overflow: hidden;
              background: ${isDark ? '#1e293b' : '#f1f5f9'};
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .photo-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: #0f172a;
              font-weight: 900;
              font-size: 22px;
              text-align: center;
            }
            .photo-note { font-size: 6.5px; font-weight: 700; margin-top: 1px; line-height: 1; }
            .code-box {
              flex: 1;
              background: ${isDark ? 'rgba(15, 23, 42, 0.85)' : '#fffdfa'};
              border: 1.5px dashed ${isDark ? '#f59e0b' : '#d97706'};
              border-radius: 10px;
              padding: 5px 8px;
              text-align: center;
            }
            .code-title { font-size: 7.5px; font-weight: 700; color: ${isDark ? '#94a3b8' : '#78350f'}; }
            .code-val { font-family: monospace; font-size: 19px; font-weight: 900; color: ${isDark ? '#fbbf24' : '#b45309'}; letter-spacing: 2px; margin: 1px 0; }
            .code-badge { font-size: 7px; font-weight: 800; color: #059669; }
            .info-table {
              width: 100%;
              background: ${isDark ? 'rgba(30, 41, 59, 0.7)' : '#f8fafc'};
              border-radius: 9px;
              border: 1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#e2e8f0'};
              padding: 6px 8px;
              margin-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9px;
              padding: 2.5px 0;
              border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#edf2f7'};
            }
            .info-row:last-child { border-bottom: none; }
            .info-lbl { color: ${isDark ? '#94a3b8' : '#64748b'}; font-weight: 700; }
            .info-val { font-weight: 800; color: ${isDark ? '#ffffff' : '#0f172a'}; max-width: 75%; }
            .name-val { font-size: 11px; font-weight: 900; color: ${isDark ? '#fef08a' : '#1e3a8a'}; white-space: normal !important; word-break: break-word !important; line-height: 1.25; overflow: visible !important; text-overflow: clip !important; }
            .group-val { color: ${isDark ? '#a5b4fc' : '#4338ca'}; }
            .phone-val { font-family: monospace; }
            .qr-sign-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              margin-top: 2px;
              padding-top: 4px;
              border-top: 1px dashed ${isDark ? '#334155' : '#cbd5e1'};
            }
            .qr-container {
              background: #ffffff;
              padding: 3px;
              border-radius: 7px;
              border: 1px solid #f59e0b;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 58px;
              flex-shrink: 0;
            }
            .qr-container img { width: 50px; height: 50px; object-fit: contain; }
            .qr-text { font-size: 6px; font-weight: 800; color: #0f172a; margin-top: 1px; }
            .signature-container {
              flex: 1;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .sign-title { font-size: 8px; font-weight: 900; color: ${isDark ? '#f59e0b' : '#b45309'}; }
            .sign-subtitle { font-size: 7px; font-weight: 700; color: ${isDark ? '#94a3b8' : '#64748b'}; }
            .sign-name { font-size: 9.5px; font-weight: 900; color: ${isDark ? '#ffffff' : '#0f172a'}; margin-top: 1px; }
            .sign-svg { width: 65px; height: 18px; margin-top: 1px; }
            .card-footer {
              background: ${isDark ? '#020617' : '#ffffff'};
              color: ${isDark ? '#94a3b8' : '#64748b'};
              font-size: 7.5px;
              font-weight: 700;
              padding: 5px 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid ${isDark ? '#f59e0b' : '#e2e8f0'};
            }
            .seal-badge { color: ${isDark ? '#f59e0b' : '#b45309'}; font-weight: 800; }
          </style>
        </head>
        <body>
          <div class="no-print">
            <div>
              <button class="print-btn" onclick="window.print()">طباعة البطاقات الآن 🖨️</button>
            </div>
            <div class="print-info">
              تم إعداد <strong>${listToPrint.length}</strong> بطاقة كارنيه معتمدة للطباعة بجودة عالية
            </div>
          </div>
          <div class="grid-sheet">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); }, 400);
            }
          </script>
        </body>
        </html>
      `;

      // Safe printing via hidden iframe to completely eliminate browser popup blockers
      let printFrame = document.getElementById('nagah-student-cards-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'nagah-student-cards-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.top = '-9999px';
        printFrame.style.left = '-9999px';
        printFrame.style.width = '1200px';
        printFrame.style.height = '900px';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(fullPrintDocumentHtml);
        frameDoc.close();

        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            onShowToast(`تم إرسال ${listToPrint.length} بطاقة كارنيه إلى أمر الطباعة بنجاح دون أي حظر نوافذ! 🖨️✨`, 'success');
          } catch (e) {
            console.warn('Iframe print fallback to window:', e);
            window.print();
          } finally {
            setIsPreparingPrint(false);
          }
        }, 600);
      } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(fullPrintDocumentHtml);
          printWindow.document.close();
          onShowToast(`تم فتح صفحة طباعة ${listToPrint.length} كارنيه بنجاح! 🖨️`, 'success');
        } else {
          window.print();
        }
        setIsPreparingPrint(false);
      }
    } catch (err) {
      console.error('Error generating cards print:', err);
      onShowToast('حدث خطأ أثناء تجهيز البطاقات للطباعة', 'error');
    } finally {
      setIsPreparingPrint(false);
    }
  };

  const handleSendBroadcast = () => {
    if (selectedTraineeIds.length === 0) {
      onShowToast('يرجى اختيار متدرب واحد على الأقل للإرسال', 'error');
      return;
    }
    const selectedList = trainees.filter((t) => selectedTraineeIds.includes(t.id));
    let sentCount = 0;

    selectedList.forEach((t, idx) => {
      const phone = t.phone || t.parentPhone;
      if (phone) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const portalUrl = getPublicStudentPortalUrl(t.code);
        const personalizedMsg = `🌟 *مركز النجاح للتدريب والاستشارات* 🌟\n\nمرحباً بالمتدرب/ة *${t.fullName}* (كود: *${t.code || 'N/A'}*):\n\n${broadcastMessage}\n\n📲 *رابط ملفك الرقمي ومتابعة الدروس والحضور:*\n${portalUrl}\n\n✍️ *الاعتماد:* ${managerName}`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMsg)}`;

        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, idx * 300);
        sentCount++;
      }
    });

    if (sentCount === 0) {
      onShowToast('لا يوجد أرقام هواتف صالحة للمتدربين المختارين', 'error');
    } else {
      onShowToast(`تم فتح نافذة واتساب لـ ${sentCount} متدرب بنجاح! 📱`, 'success');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>طباعة كارنيهات وبطاقات المتدربين الرسمية</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  SMART ID
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توليد باركودات الحضور الذكية، صور الطلاب، والاعتماد الرسمي برئاسة {managerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/70 dark:bg-slate-950/40 gap-2 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cards'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>طباعة بطاقات المتدربين (VIP Carnet)</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال واتساب جماعي وفردي</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بحث بالاسم أو الكود
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفرع</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الدورة</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الدورات</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المجموعة</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع المجموعات</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'cards' ? (
            <div className="space-y-4">
              {/* Print Configuration Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Theme Selector */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setPrintTheme('light')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        printTheme === 'light'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>نهاري ملكي (طبيعي)</span>
                    </button>
                    <button
                      onClick={() => setPrintTheme('dark')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        printTheme === 'dark'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>ليلي فاخر (مذهب)</span>
                    </button>
                  </div>

                  {/* Cards Per Sheet */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>التقسيم بالصفحة:</span>
                    <select
                      value={cardsPerPage}
                      onChange={(e) => setCardsPerPage(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value="4">4 بطاقات / صفحة A4</option>
                      <option value="2">بطاقتان / صفحة A4</option>
                      <option value="1">بطاقة واحدة مفرغة</option>
                    </select>
                  </div>
                </div>

                {/* Print Trigger */}
                <button
                  onClick={handlePrintCards}
                  disabled={isPreparingPrint || filteredTrainees.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {isPreparingPrint
                      ? 'جاري تجهيز وتوليد الكارنيهات...'
                      : `طباعة (${
                          selectedTraineeIds.length > 0
                            ? selectedTraineeIds.length
                            : filteredTrainees.length
                        }) كارنيه رسمي 🖨️`}
                  </span>
                </button>
              </div>

              {/* Trainees List Selector */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  عدد المتدربين المطابقين: <strong className="text-amber-500 font-mono text-sm">{filteredTrainees.length}</strong> | محدد للطباعة: <strong className="text-emerald-500 font-mono text-sm">{selectedTraineeIds.length > 0 ? selectedTraineeIds.length : 'الكل (' + filteredTrainees.length + ')'}</strong>
                </span>

                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {selectedTraineeIds.length === filteredTrainees.length
                    ? 'إلغاء تحديد الكل'
                    : 'تحديد جميع المتدربين'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar p-1">
                {filteredTrainees.map((t) => {
                  const isSelected = selectedTraineeIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTrainee(t.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-750 hover:border-amber-300 dark:hover:border-amber-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl border border-amber-500/60 overflow-hidden bg-slate-800 text-amber-400 font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                          {t.photoUrl ? (
                            <img src={t.photoUrl} alt={t.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{t.fullName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{t.fullName}</span>
                            {t.photoUrl && (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                                صورة ✓
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            الكود: <span className="font-mono font-bold text-amber-500">{t.code}</span> | الهاتف: <span className="font-mono" dir="ltr">{t.phone || 'غير مسجل'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص الرسالة المرسلة مع رابط الكارنيه والملف الرقمي
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="اكتب نص الرسالة هنا..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {selectedTraineeIds.length === filteredTrainees.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'} (
                  {selectedTraineeIds.length})
                </button>
                <button
                  onClick={handleSendBroadcast}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال واتساب للمحددين ({selectedTraineeIds.length})</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/30 custom-scrollbar">
                {filteredTrainees.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTrainee(t.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedTraineeIds.includes(t.id)
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTraineeIds.includes(t.id)}
                        onChange={() => {}}
                        className="rounded text-amber-600 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{t.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-mono" dir="ltr">
                          {t.phone || 'بدون هاتف'}
                        </p>
                      </div>
                    </div>
                    {selectedTraineeIds.includes(t.id) && (
                      <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            الاعتماد الرسمي: <strong className="text-amber-500">{managerName}</strong> • مدير عام المركز
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
