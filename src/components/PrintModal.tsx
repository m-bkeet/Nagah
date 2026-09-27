import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCenter } from '../context/CenterContext';
import { Printer, X, Download, FileText, CheckCircle, QrCode, Sparkles, Trophy } from 'lucide-react';
import QRCode from 'qrcode';
import { CertificateTemplate } from '../types';
import { OfficialSealBadge } from './OfficialSealBadge';
import { AttendanceSheetReport } from './AttendanceSheetReport';
import { SessionCelebrationOverlay } from './SessionCelebrationOverlay';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

const QRCodeImage: React.FC<{ value: string; size?: number; className?: string }> = ({ value, size = 64, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, { width: size * 2, margin: 1 })
      .then(url => setDataUrl(url))
      .catch(() => {});
  }, [value, size]);

  if (!dataUrl) return <QrCode className={`w-6 h-6 text-slate-700 ${className}`} />;
  return <img src={dataUrl} alt="QR Code" style={{ width: size, height: size }} className={`object-contain ${className}`} />;
};

export const PrintModal: React.FC = () => {
  const { printData, setPrintData, settings } = useCenter();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  if (!printData) return null;

  // Ultra-reliable standalone printable HTML generator & printer
  const handleDirectPrint = () => {
    if (!printContainerRef.current) {
      window.print();
      return;
    }

    const contentHtml = printContainerRef.current.innerHTML;
    const isCertificate = printData.type === 'certificate';
    const orientation = isCertificate ? 'landscape' : 'portrait';

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>${printData.title || 'طباعة مستند'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 ${orientation};
            margin: ${isCertificate ? '6mm' : '10mm'};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .print-wrapper {
            width: 100%;
            max-width: 100%;
            background: #ffffff !important;
            color: #0f172a !important;
          }
          /* Fallback Tailwind-like resets for printable sheet */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: 700; }
          .font-black { font-weight: 900; }
          .border-b { border-bottom: 1px solid #cbd5e1; }
          .border-t { border-top: 1px solid #cbd5e1; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .gap-2 { gap: 0.5rem; }
          .gap-4 { gap: 1rem; }
          .w-full { width: 100%; }
          .no-print { display: none !important; }
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Cairo', 'sans-serif'],
                  arabic: ['Amiri', 'serif']
                }
              }
            }
          }
        </script>
      </head>
      <body>
        <div class="print-wrapper">
          ${contentHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1500);
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    doc.close();
  };

  const renderContent = () => {
    switch (printData.type) {
      case 'trainee_badge': {
        const { trainee, branchName, courseName } = printData.data;
        const managerName = settings?.managerName || 'د. محمد رمضان بخيت';
        const scanUrl = `${window.location.origin}/?view=student_portal&code=${trainee.code || ''}&action=checkin&source=badge_print`;

        return (
          <div className="w-[360px] mx-auto bg-white text-slate-900 border-2 border-amber-500 rounded-3xl shadow-xl font-sans print:shadow-none print:border-amber-500 relative overflow-hidden flex flex-col justify-between" dir="rtl">
            {/* Lanyard punch slot guide */}
            <div className="w-10 h-1.5 mx-auto mt-2 bg-slate-300 rounded-full print:bg-slate-400" />

            {/* Top decorative header with Logo & Gold trim */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-3.5 mt-1 border-y-2 border-amber-500 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-white rounded-xl p-1 border border-amber-400 shadow flex items-center justify-center shrink-0">
                  <img src="/logo.svg" alt="شعار المركز" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-xs sm:text-sm text-amber-400 leading-tight">النجاح للتدريب والاستشارات</h3>
                  <p className="text-[9px] text-slate-200 font-bold mt-0.5">🌟 بطاقة العضوية والتدريب الرسمية الذكية</p>
                </div>
              </div>
              <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                2026/2027
              </span>
            </div>

            {/* Photo & Code Banner */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-18 h-18 rounded-2xl border-2 border-amber-500 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  {trainee.photoUrl ? (
                    <img
                      src={trainee.photoUrl}
                      alt={trainee.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex flex-col items-center justify-center">
                      <span>{trainee.fullName?.charAt(0) || 'م'}</span>
                      <span className="text-[7px] font-bold mt-0.5 text-slate-900">الصورة قيد المزامنة</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-500 block">كود المتدرب المعتمد</span>
                  <span className="text-xl font-black text-amber-600 font-mono tracking-widest block">{trainee.code}</span>
                  <span className="text-[8px] font-bold text-emerald-600 block mt-0.5">● عضوية مسجلة ومفعلة</span>
                </div>
              </div>

              {/* Trainee Details Table */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-right text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 text-[10px] font-bold">اسم المتدرب:</span>
                  <span className="font-black text-slate-900 text-xs">{trainee.fullName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 text-[10px] font-bold">الصف / الدورة:</span>
                  <span className="font-bold text-amber-700 text-xs">{courseName || 'الدورة التدريبية'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 text-[10px] font-bold">الفرع:</span>
                  <span className="font-semibold text-slate-800 text-xs">{branchName || 'فرع النجاح'}</span>
                </div>
                {trainee.phone && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="text-slate-500 text-[10px] font-bold">هاتف التواصل:</span>
                    <span className="font-mono text-xs text-slate-900" dir="ltr">{trainee.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] font-bold">تاريخ التسجيل:</span>
                  <span className="font-mono text-[10px] text-slate-600">{trainee.registrationDate || '2026/2027'}</span>
                </div>
              </div>

              {/* QR Code & Director Signature */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex flex-col items-center shrink-0 bg-white p-1 rounded-lg border border-amber-400">
                  <QRCodeImage value={scanUrl} size={56} />
                  <span className="text-[6.5px] font-bold text-slate-900 mt-0.5">مسح للحضور والملف</span>
                </div>

                <div className="flex-1 text-center">
                  <span className="text-[8px] font-bold text-slate-500 block">مدير عام المركز</span>
                  <span className="text-[11px] font-black text-amber-600 block mt-0.5">{managerName}</span>
                  <svg className="w-20 h-5 mx-auto mt-0.5" viewBox="0 0 140 40" fill="none">
                    <path d="M10 25 C30 5, 45 35, 70 15 C95 -5, 110 30, 130 18" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M40 32 C60 28, 85 32, 115 28" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span className="text-[7px] font-bold text-emerald-600 block">✓ معتمد رسمياً</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Strip */}
            <div className="bg-slate-900 text-slate-300 px-4 py-2 text-[8px] font-bold flex justify-between items-center border-t border-amber-500">
              <span>النجاح للتدريب والاستشارات © 2026/2027</span>
              <span className="text-amber-400">معتمد ★ SMART ID</span>
            </div>
          </div>
        );
      }

      case 'receipt': {
        const { payment, trainee, branchName, courseName } = printData.data;
        return (
          <div className="max-w-2xl mx-auto bg-white text-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-md print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-amber-500 p-1">
                  <img src="/logo.svg" alt="مركز النجاح" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900">مركز النجاح للتدريب والاستشارات</h2>
                  <p className="text-xs text-slate-600 font-medium">سند قبض مالي رسمي - Official Receipt</p>
                </div>
              </div>
              <div className="text-left font-mono">
                <div className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  {payment.receiptNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1">التاريخ: {payment.date}</div>
              </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">بيانات المتدرب:</span>
                <p className="font-bold text-sm text-slate-900">{trainee?.fullName || 'متدرب'}</p>
                <p className="text-slate-600 mt-0.5">كود: <span className="font-mono font-bold">{trainee?.code}</span></p>
                <p className="text-slate-600">الهاتف: {trainee?.phone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">بيانات الدورة والفرع:</span>
                <p className="font-bold text-sm text-slate-900">{courseName || 'دورة تدريبية'}</p>
                <p className="text-slate-600 mt-0.5">الفرع: {branchName || 'الرئيسي'}</p>
                <p className="text-slate-600">طريقة الدفع: {payment.paymentMethod}</p>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-amber-50 border-2 border-amber-500/40 rounded-xl p-4 text-center mb-6">
              <span className="text-xs font-bold text-slate-600 block">المبلغ المدفوع</span>
              <span className="text-3xl font-black text-amber-600 font-mono tracking-tight">
                {payment.amount} <span className="text-base font-bold text-slate-700">جنيه مصري</span>
              </span>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 mb-6">
              <div>
                <span className="text-slate-500 block">إجمالي الرسوم</span>
                <span className="font-bold font-mono">{trainee?.netAmount || 0} ج.م</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-slate-500 block">إجمالي المدفوع</span>
                <span className="font-bold font-mono text-emerald-600">{trainee?.paidAmount || 0} ج.م</span>
              </div>
              <div>
                <span className="text-slate-500 block">المتبقي</span>
                <span className="font-bold font-mono text-rose-600">{trainee?.remainingAmount || 0} ج.م</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block mb-8">المستلم (الخزينة): {payment.receivedByUserName || 'مسؤول الخزينة'}</span>
                <div className="w-32 border-b border-slate-400"></div>
              </div>
              
              <div className="text-center relative flex justify-center items-center">
                {settings?.sealImageUrl ? (
                  <img src={settings.sealImageUrl} alt="ختم المركز المعتمد" className="w-24 h-24 object-contain opacity-90" style={{ mixBlendMode: (settings?.sealBlendMode as any) || 'multiply' }} />
                ) : (
                  <img src="/stamp.svg" alt="ختم المركز المعتمد" className="w-24 h-24 object-contain opacity-90" />
                )}
                {settings?.qrCodeVerificationUrl && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none mix-blend-multiply">
                     <QRCodeImage value={`${settings.qrCodeVerificationUrl}?receipt=${payment.receiptNumber}`} size={48} />
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-8">توقيع المستلم / ولي الأمر:</span>
                <div className="w-32 border-b border-slate-400"></div>
              </div>
            </div>
          </div>
        );
      }

            case 'certificate': {
        const { cert, trainee, course, template } = printData.data;
        const tmpl: CertificateTemplate = template || {
          id: 'default',
          name: 'الملكي الذهبي',
          theme: 'classic_gold',
          primaryColor: '#d97706',
          accentColor: '#b45309',
          titleArabic: 'شهادة إتمام برنامج تدريبي وتفوق',
          titleEnglish: 'CERTIFICATE OF ACHIEVEMENT & EXCELLENCE',
          subTitleArabic: 'يشهد مركز النجاح للتدريب والاستشارات بأن المتدرب / المتدربة:',
          bodyTemplate: 'قد أتم بنجاح متطلبات الدورة واجتاز التقييمات العملية المقررة',
          sealText: 'ختم المركز المعتمد',
          managerTitle: 'مدير عام المركز',
          managerName: 'د. محمد رمضان بخيت',
          trainerTitle: 'المدرب المعتمد',
          showQrCode: true,
          borderStyle: 'double'
        };

        
        const isEnglish = tmpl.theme === ('english_corporate' as any) || tmpl.name?.includes('انجليزي') || tmpl.name?.includes('English');
        const isEmerald = tmpl.theme === 'royal_emerald';
        const isDiamond = tmpl.theme === 'diamond_blue';


        const issueDate = cert?.issueDate || new Date().toISOString().split('T')[0];
        const grade = cert?.grade || 'ممتاز';
        const trainerName = course?.trainerId ? 'المدرب' : 'المدرب';
        const branchName = 'الفرع';
        const groupName = 'المجموعة';
        const courseHours = course?.durationHours ? String(course.durationHours) : '30';


        if (tmpl.isCustomVisual && tmpl.bgImageUrl) {
          return (
            <div dir="rtl" className="w-full relative bg-white overflow-hidden flex flex-col" style={{ width: '1000px', height: '707px' }}>
              {/* Background Image */}
              <div 
                className="absolute inset-0 z-0" 
                style={{
                  backgroundImage: `url(${tmpl.bgImageUrl})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Overlay Fields */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {tmpl.visualFields?.filter(f => f.visible).map(field => {
                  let value = '';
                  if (field.id.startsWith('customField')) {
                    value = field.label; // Use label as the text content for custom fields
                  } else {
                    switch(field.id) {
                      case 'traineeName': value = traineeName; break;
                      case 'courseName': value = courseName; break;
                      case 'issueDate': value = issueDate; break;
                      case 'grade': value = grade; break;
                      case 'serialNo': value = serialNo; break;
                      case 'trainerName': value = trainerName; break;
                      case 'branchName': value = branchName; break;
                      case 'groupName': value = groupName; break;
                      case 'courseHours': value = courseHours; break;
                      case 'qrCode': value = 'QR'; break;
                      default: value = field.label; break;
                    }
                  }
                  
                  if (field.id === 'qrCode') {
                    return (
                      <div
                        key={field.id}
                        className="absolute pointer-events-auto"
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: `${field.width || field.fontSize}px`,
                            height: `${field.width || field.fontSize}px`
                          }}
                        >
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>
                      );
                  }
                  
                  return (
                    <div
                      key={field.id}
                      className="absolute pointer-events-auto"
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: field.color,
                        fontSize: `${field.fontSize}px`,
                        fontFamily: field.fontFamily,
                        textAlign: field.textAlign,
                        width: field.width ? `${field.width}px` : 'auto',
                        lineHeight: 1.2
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }


        const borderColor = isEmerald ? '#047857' : isDiamond ? '#2563eb' : '#d97706';
        const accentColor = isEmerald ? '#065f46' : isDiamond ? '#1e40af' : '#b45309';
        const badgeColor = isEmerald ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : isDiamond ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-900 border-amber-300';

        const traineeName = trainee?.fullName || cert?.traineeName || 'اسم المتدرب';
        const courseName = course?.name || cert?.courseName || 'اسم الدورة التدريبية';
        const durationText = cert?.durationText || `${course?.durationHours || 30} ${isEnglish ? 'Hours' : 'ساعة'}`;
        const periodText = cert?.periodText || (course?.startDate && course?.endDate ? `${course.startDate} - ${course.endDate}` : 'معتمدة');
        const serialNo = cert?.serialNumber || cert?.certificateNumber || `NGAH-CERT-${cert?.id?.slice(0, 6) || '2026'}`;

        return (
          <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="print-certificate-sheet w-full max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative border-[10px] border-double"
            style={{ borderColor: borderColor }}
          >
            {/* Elegant Ornamental Corners */}
            <div className="absolute top-3 left-3 text-xl font-bold" style={{ color: borderColor }}>❖</div>
            <div className="absolute top-3 right-3 text-xl font-bold" style={{ color: borderColor }}>❖</div>
            <div className="absolute bottom-3 left-3 text-xl font-bold" style={{ color: borderColor }}>❖</div>
            <div className="absolute bottom-3 right-3 text-xl font-bold" style={{ color: borderColor }}>❖</div>

            {/* Inner Border Frame */}
            <div className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="text-right">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                    مركز النجاح للتدريب والاستشارات
                  </h1>
                  <p className="text-[10px] sm:text-xs font-bold font-mono uppercase" style={{ color: borderColor }}>
                    NAGAH TRAINING &amp; CONSULTING CENTER
                  </p>
                  <p className="text-[9px] text-slate-500">معتمد برقم ترخيص مهني دولي ومحلي</p>
                </div>

                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2 border-2 shadow-md flex items-center justify-center shrink-0" style={{ borderColor }}>
                  <img src="/logo.svg" alt="مركز النجاح" className="w-full h-full object-contain" />
                </div>

                <div className="text-left font-mono text-[10px] text-slate-600 space-y-1">
                  <div>Ref: <span className="font-bold text-slate-900">{serialNo}</span></div>
                  <div>Date: <span className="font-bold text-slate-900">{cert?.issueDate || new Date().toISOString().split('T')[0]}</span></div>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center my-6">
                <div className={`inline-block px-12 py-3 rounded-full font-black text-base sm:text-lg tracking-wider uppercase shadow-sm border ${badgeColor}`}>
                  {isEnglish ? (tmpl.titleEnglish || 'CERTIFICATE OF ACHIEVEMENT') : (tmpl.titleArabic || 'شهادة إتمام وتفوق')}
                </div>
                {!isEnglish && tmpl.titleEnglish && (
                  <p className="text-xs mt-2 font-mono text-slate-500 uppercase tracking-wider font-bold">
                    {tmpl.titleEnglish}
                  </p>
                )}
              </div>

              {/* Certificate Recipient & Body */}
              <div className="text-center space-y-4 my-8 text-sm sm:text-base leading-relaxed px-4">
                <p className="text-slate-600 font-medium text-lg">
                  {isEnglish ? 'This is to proudly certify that:' : (tmpl.subTitleArabic || 'تشهد إدارة المركز بأن المتدرب/ـة')}
                </p>

                {/* Trainee Name & Photo Avatar if available */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {trainee?.photoUrl && (
                    <img
                      src={trainee.photoUrl}
                      alt={traineeName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 shadow-md shrink-0"
                      style={{ borderColor }}
                    />
                  )}
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 border-b-2 px-12 pb-2 inline-block" style={{ borderColor }}>
                    {traineeName}
                  </h2>
                </div>

                <p className="text-slate-600 font-medium text-lg pt-2 max-w-2xl mx-auto">
                  {isEnglish ? 'Has successfully fulfilled and completed all requirements for the training program in:' : (tmpl.bodyTemplate || 'قد أتم بنجاح متطلبات الدورة واجتاز التقييمات العملية المقررة للبرنامج التدريبي:')}
                </p>

                <h3 className="text-2xl sm:text-3xl font-black mt-2" style={{ color: accentColor }}>
                  {courseName}
                </h3>

                {/* Placeholders: Hours, Duration From-To, Grade */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 text-sm text-slate-700">
                  <span className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    {isEnglish ? 'Training Hours: ' : 'الساعات التدريبية: '}
                    <strong className="font-black text-slate-900 block mt-1">{durationText}</strong>
                  </span>
                  <span className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    {isEnglish ? 'Period: ' : 'المدة التدريبية: '}
                    <strong className="font-black text-slate-900 block mt-1">{periodText}</strong>
                  </span>
                  <span className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl shadow-sm">
                    {isEnglish ? 'Grade: ' : 'التقدير العام: '}
                    <strong className="font-black text-amber-900 block mt-1">{cert?.grade || 'ممتاز (A+)'}</strong>
                  </span>
                </div>
              </div>

              {/* Bottom Signatures, Stamp & Barcode */}
              <div className="grid grid-cols-3 items-end pt-12 border-t-2 border-slate-200 mt-12 text-xs">
                {/* Trainer Signature Place */}
                <div className={isEnglish ? 'text-left' : 'text-right'}>
                  <p className="text-slate-500 font-bold mb-10">{isEnglish ? 'Trainer / Instructor' : (tmpl.trainerTitle || 'مدرب البرنامج')}</p>
                  <div className="w-32 border-b-2 border-slate-400 mb-2" />
                  <p className="font-black text-sm text-slate-900">{cert?.trainerName || 'المدرب المعتمد'}</p>
                </div>

                {/* Center Seal, Stamp & QR Code */}
                <div className="text-center flex flex-col items-center justify-center relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-95 pointer-events-none mix-blend-multiply">
                    {settings?.sealImageUrl ? (
                      <img src={settings.sealImageUrl} alt="الختم الرسمي المعتمد" className="w-28 h-28 sm:w-32 sm:h-32 object-contain filter drop-shadow-md" style={{ mixBlendMode: 'multiply' }} />
                    ) : (
                      <img src="/stamp.svg" alt="الختم الرسمي المعتمد" className="w-28 h-28 sm:w-32 sm:h-32 object-contain" />
                    )}
                  </div>
                  {tmpl.showQrCode && (
                    <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl p-1 shadow-sm flex flex-col items-center justify-center mt-12 relative z-10">
                      
                      {settings?.qrCodeVerificationUrl ? (
                        <QRCodeImage value={`${settings.qrCodeVerificationUrl}?id=${cert?.id || Date.now()}`} size={56} />
                      ) : (
                        <QrCode className="w-8 h-8 text-slate-800" />
                      )}

                    </div>
                  )}
                  {tmpl.showQrCode && (
                     <span className="text-[9px] font-mono text-slate-500 font-bold mt-2 tracking-widest">{isEnglish ? 'VERIFY' : 'امسح للتحقق'}</span>
                  )}
                </div>

                {/* Director Signature Place */}
                <div className={isEnglish ? 'text-right' : 'text-left'}>
                  <p className="text-slate-500 font-bold mb-10">{isEnglish ? 'Managing Director' : (tmpl.managerTitle || 'مدير عام المركز')}</p>
                  {settings?.signatureImageUrl ? (
                    <img src={settings.signatureImageUrl} alt="التوقيع" className={`w-24 h-12 object-contain ${isEnglish ? 'ml-auto' : 'mr-auto'} mb-2`} style={{ mixBlendMode: 'multiply' }} />
                  ) : (
                    <div className={`w-32 border-b-2 border-slate-400 mb-2 ${isEnglish ? 'ml-auto' : 'mr-auto'}`} />
                  )}
                  <p className="font-black text-sm text-slate-900">{cert?.managerName || tmpl.managerName || settings?.managerName || 'د. محمد رمضان بخيت'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'attendance': {
        return (
          <AttendanceSheetReport
            data={printData.data}
            onPrint={handleDirectPrint}
            onClose={() => setPrintData(null)}
          />
        );
      }

      default: {
        return (
          <div className="p-4 text-center text-slate-800 bg-white rounded-2xl">
            <h3 className="font-bold text-base mb-2">{printData.title}</h3>
            <pre className="text-xs bg-slate-100 p-3 rounded text-left overflow-auto">
              {JSON.stringify(printData.data, null, 2)}
            </pre>
          </div>
        );
      }
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print-modal-overlay">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-5xl w-full my-auto max-h-[88vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 modal-dialog-box animate-in fade-in zoom-in-95">
        {/* Modal Topbar (hidden during print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print bg-slate-50 dark:bg-slate-900 modal-topbar">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{printData.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {printData.type === 'attendance' && (
              <button
                type="button"
                onClick={() => {
                  setIsCelebrationOpen(true);
                  audioService.playClapping(3.5);
                  const trainees = printData.data?.trainees || [];
                  const top = [...trainees].sort((a: any, b: any) => (b.points || b.totalPoints || 0) - (a.points || a.totalPoints || 0))[0];
                  const topName = top?.fullName || top?.name;
                  if (topName) {
                    audioService.playWinnerAnnouncement(topName, `topbar_${Date.now()}`);
                  } else {
                    audioService.playSessionEndFanfare();
                  }
                  try {
                    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                  } catch {}
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer animate-pulse"
                title="إنهاء الحصة وإطلاق احتفال ختام المحاضرة وتتويج النجوم والأبطال بالصوت والكونفيتي"
              >
                <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>🎉 إنهاء الحصة واحتفال النجوم</span>
              </button>
            )}
            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية / PDF</span>
            </button>
            <button
              onClick={() => setPrintData(null)}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div ref={printContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/60 print:p-0 print:bg-white print-container">
          {renderContent()}
        </div>
      </div>

      {/* Celebration Ceremony Overlay */}
      {isCelebrationOpen && printData.type === 'attendance' && (
        <SessionCelebrationOverlay
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          sessionTitle={`ختام محاضرة ${printData.data?.courseName || 'المحاضرة'}`}
          groupName={printData.data?.groupName || 'المجموعة التدريبية'}
          courseName={printData.data?.courseName || 'الدورة التدريبية'}
          starWinnerName={
            (() => {
              const trainees = printData.data?.trainees || [];
              const top = [...trainees].sort((a: any, b: any) => (b.points || b.totalPoints || 0) - (a.points || a.totalPoints || 0))[0];
              return top?.fullName || top?.name || 'بطل المحاضرة';
            })()
          }
          starWinnerPoints={
            (() => {
              const trainees = printData.data?.trainees || [];
              const top = [...trainees].sort((a: any, b: any) => (b.points || b.totalPoints || 0) - (a.points || a.totalPoints || 0))[0];
              return top?.points || top?.totalPoints || 0;
            })()
          }
        />
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
