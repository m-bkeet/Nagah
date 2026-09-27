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
import { getEffectiveCenterLogo, handleLogoError } from '../utils/centerLogo';

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
  const centerLogo = getEffectiveCenterLogo(settings?.logoUrl);

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
    printFrame.style.width = '1200px';
    printFrame.style.height = '850px';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const parentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>${printData.title || 'طباعة مستند'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700;900&display=swap" rel="stylesheet">
        ${parentStyles}
        <style>
          @page {
            size: A4 ${orientation};
            margin: ${isCertificate ? '0' : '8mm'};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            ${isCertificate ? 'width: 297mm; height: 210mm; max-height: 210mm; overflow: hidden !important;' : ''}
          }
          .print-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #ffffff !important;
            color: #0f172a !important;
            box-sizing: border-box;
            ${isCertificate ? 'padding: 4mm;' : ''}
          }
          .print-certificate-sheet {
            width: 100% !important;
            max-width: 289mm !important;
            height: 202mm !important;
            max-height: 202mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
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
          .inline-flex { display: inline-flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .grid { display: grid; }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .w-full { width: 100%; }
          .no-print { display: none !important; }
        </style>
        <script src="https://cdn.tailwindcss.com"></script>
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
                try { window.parent.document.body.removeChild(window.frameElement); } catch(e){}
              }, 1200);
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
                  <img src={centerLogo} alt="شعار المركز" className="w-full h-full object-contain" onError={handleLogoError} />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-xs sm:text-sm text-amber-400 leading-tight">{settings?.centerName || 'النجاح للتدريب والاستشارات'}</h3>
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
                  <img src={centerLogo} alt="مركز النجاح" className="w-full h-full object-contain" onError={handleLogoError} />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900">{settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}</h2>
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

        
        const isEnglish = cert?.language === 'en' || tmpl.theme === ('english_corporate' as any) || tmpl.name?.includes('انجليزي') || tmpl.name?.includes('English');
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

        const traineeName = isEnglish
          ? (cert?.traineeNameEn || cert?.traineeName || trainee?.fullName || 'Trainee Name')
          : (cert?.traineeName || trainee?.fullName || 'اسم المتدرب');

        const courseName = course?.name || cert?.courseName || 'اسم الدورة التدريبية';
        const durationText = cert?.durationText || `${course?.durationHours || 30} ${isEnglish ? 'Hours' : 'ساعة'}`;
        const periodText = cert?.periodText || (course?.startDate && course?.endDate ? `${course.startDate} - ${course.endDate}` : 'معتمدة');
        const courseCode = course?.code || (courseName ? courseName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'ICT4');
        const traineeCode = trainee?.code || 'C001';
        const serialNo = cert?.serialNumber || cert?.certificateNumber || `${courseCode}-${traineeCode}-C`;

        const nameLen = (traineeName || '').trim().length;
        let nameFontSize = 26;
        if (nameLen > 40) nameFontSize = 17;
        else if (nameLen > 30) nameFontSize = 20;
        else if (nameLen > 22) nameFontSize = 22;
        else if (nameLen > 15) nameFontSize = 24;
        else nameFontSize = 27;

        const isAppreciation = cert?.certificateTitle?.includes('تقدير') || cert?.certificateTitle?.includes('تميز') || cert?.certificateTitle?.includes('وسام');

        return (
          <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="print-certificate-sheet w-full max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl relative border-[8px] border-double select-none"
            style={{ borderColor: borderColor, minHeight: '580px', maxHeight: '680px', boxSizing: 'border-box' }}
          >
            {/* Elegant Ornamental Corners */}
            <div className="absolute top-2.5 left-2.5 text-lg font-bold select-none" style={{ color: borderColor }}>❖</div>
            <div className="absolute top-2.5 right-2.5 text-lg font-bold select-none" style={{ color: borderColor }}>❖</div>
            <div className="absolute bottom-2.5 left-2.5 text-lg font-bold select-none" style={{ color: borderColor }}>❖</div>
            <div className="absolute bottom-2.5 right-2.5 text-lg font-bold select-none" style={{ color: borderColor }}>❖</div>

            {/* Inner Border Frame with Smart Vertical Auto-Containment */}
            <div className="border border-slate-300/80 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/15 relative flex flex-col justify-between h-full overflow-hidden">
              {/* Background Watermark Logo */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-8 rounded-3xl z-0 overflow-hidden">
                <img src={centerLogo} alt="Watermark" className="w-80 h-80 object-contain grayscale" />
              </div>

              {/* 1. CERTIFICATE HEADER (Absolute centered title, logo left, pyramid text far-right) */}
              <div 
                className="relative z-10 w-full h-16 sm:h-20 flex items-center justify-between border-b pb-2 mb-1.5" 
                style={{ borderColor: borderColor }}
              >
                {/* Right Side: Symmetrical Stacked Title Pyramid, pushed to extreme right, smaller size */}
                <div className="flex flex-col items-start leading-none text-right justify-center shrink-0 pr-1 select-none">
                  <h1 className="text-[10px] sm:text-[11px] font-black text-slate-800 font-serif">
                    Nagah
                  </h1>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-800 font-serif mt-0.5">
                    Training & Consulting
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-800 font-serif mt-0.5">
                    Nagah-TC
                  </p>
                </div>

                {/* Center Column: Big Raised Title, absolutely mathematically centered */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-auto select-none">
                  <h2 
                    className="text-xl sm:text-3xl font-black tracking-wide leading-tight text-amber-700 font-serif whitespace-nowrap"
                  >
                    {isEnglish ? (cert?.certificateTitleEn || tmpl.titleEnglish || 'Certificate of Appreciation') : (cert?.certificateTitle || tmpl.titleArabic || 'شهادة تقدير')}
                  </h2>
                </div>

                {/* Left Column: Circular Seal Logo, pushed to extreme left */}
                <div className="flex justify-end pl-1 select-none">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white shadow-md border-2" style={{ borderColor }}>
                    <img src={centerLogo} alt="النجاح للتدريب والاستشارات" className="w-full h-full object-contain" onError={handleLogoError} />
                  </div>
                </div>
              </div>

              {/* 3. Certificate Recipient & Body */}
              <div className="text-center space-y-2.5 my-1 px-3">
                <p className="font-bold text-xs sm:text-sm text-slate-800">
                  {isEnglish ? (
                    isAppreciation 
                      ? 'Nagah Training & Consulting proudly presents this Certificate of Appreciation to:' 
                      : 'Nagah Training & Consulting hereby certifies that:'
                  ) : (
                    isAppreciation 
                      ? 'يمنح مركز النجاح للتدريب والاستشارات شهادة التقدير والتفوق هذه بكل فخر واعتزاز إلى المتدرب:' 
                      : 'تشهد النجاح للتدريب والاستشارات'
                  )}
                </p>
                {!isAppreciation && (
                  <p className="font-bold text-xs sm:text-sm text-slate-800">
                    {isEnglish ? 'That the participant has successfully completed and passed:' : 'بأن المشارك قد اجتاز بنجاح الدورة التدريبية المقررة:'}
                  </p>
                )}

                {/* Trainee Name Calligraphy Banner with Dynamic Smart Scaling */}
                <div className="flex items-center justify-center gap-3 py-0.5 my-0.5">
                  {trainee?.photoUrl && (
                    <img
                      src={trainee.photoUrl}
                      alt={traineeName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 shadow-sm shrink-0"
                      style={{ borderColor }}
                    />
                  )}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-amber-600 font-serif select-none text-base sm:text-lg shrink-0">❖ ───</span>
                    <h2 
                      style={{ 
                        fontSize: `${nameFontSize}px`,
                        fontFamily: isEnglish ? "'Cairo', sans-serif" : "'Amiri', 'Traditional Arabic', serif",
                        lineHeight: 1.25,
                        borderColor: borderColor
                      }}
                      className="font-black text-slate-900 border-b-2 pb-0.5 px-3 max-w-xl text-center break-words font-serif" 
                    >
                      {traineeName}
                    </h2>
                    <span className="text-amber-600 font-serif select-none text-base sm:text-lg shrink-0">─── ❖</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black mt-1" style={{ color: accentColor }}>
                  {courseName}
                </h3>

                {/* Placeholders: Hours in Compact Harmonious Bar (Hidden for Appreciation) */}
                {!isAppreciation && (
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1 text-xs text-slate-700">
                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                      {isEnglish ? 'Training Hours: ' : 'مدة البرنامج: '}
                      <strong className="font-black text-slate-900 inline-block mr-1">({durationText}) ساعة تدريبية</strong>
                    </span>
                  </div>
                )}

                <p className="text-xs sm:text-sm font-semibold pt-1 text-slate-800">
                  {isEnglish ? (
                    isAppreciation 
                      ? 'In recognition of their outstanding performance, exceptional dedication, and successful evaluations.'
                      : 'With active participation and excellent dedication, wishing them continued success.'
                  ) : (
                    isAppreciation 
                      ? 'وذلك تقديراً لأدائه المتميز وتفوقه الاستثنائي واجتيازه التقييمات المقررة، متمنين له دوام التوفيق والنجاح.'
                      : 'وقد شارك بتميز وفاعلية مع التمنيات بدوام التوفيق والنجاح المستمر.'
                  )}
                </p>
              </div>

              {/* 4. Bottom Signatures & QR Code */}
              <div className="grid grid-cols-3 items-end pt-2 sm:pt-3 border-t-2 border-slate-200/80 mt-1.5 text-xs text-center">
                {/* Right Side: Trainer Signature ("المدرب") */}
                <div className="space-y-1 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold block text-slate-700 text-center">{isEnglish ? 'Trainer' : 'المدرب'}</span>
                  <p className="font-black text-xs sm:text-sm text-slate-900 pb-0.5 text-center">{cert?.trainerName || 'المدرب المعتمد'}</p>
                  {settings?.trainerSignatureUrl ? (
                    <img src={settings.trainerSignatureUrl} alt="توقيع المدرب" className="w-20 h-8 sm:w-24 sm:h-9 object-contain mx-auto" />
                  ) : (
                    <div className="w-24 sm:w-28 border-b-2 border-slate-400 pt-3 mx-auto" />
                  )}
                </div>

                {/* Center: QR Code with Serial Code & Date Underneath */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="p-1 bg-white border border-slate-300 rounded-xl shadow-xs">
                    <QRCodeImage 
                      value={settings?.qrCodeVerificationUrl ? `${settings.qrCodeVerificationUrl}?id=${cert?.id || serialNo}` : `https://nagah-center.com/verify?id=${serialNo}`} 
                      size={48} 
                    />
                  </div>
                  <div className="text-[9px] font-mono font-bold text-center space-y-0.5 text-slate-600">
                    <div>كود: <span className="underline">{serialNo}</span></div>
                    <div>تاريخ: {cert?.issueDate || new Date().toISOString().split('T')[0]}</div>
                  </div>
                </div>

                {/* Left Side: Director Signature ("يعتمد") - Centered over Manager Name */}
                <div className="space-y-1 text-center flex flex-col items-center justify-center relative">
                  <span className="text-[10px] sm:text-xs font-bold block text-slate-700 text-center">{isEnglish ? 'Authorized by' : 'يعتمد'}</span>
                  <p className="font-black text-xs sm:text-sm text-slate-900 pb-0.5 text-center">{cert?.managerName || tmpl.managerName || settings?.managerName || 'د. محمد رمضان بخيت'}</p>
                  {settings?.signatureImageUrl ? (
                    <img src={settings.signatureImageUrl} alt="توقيع الإدارة" className="w-20 h-8 sm:w-24 sm:h-9 object-contain mx-auto" style={{ mixBlendMode: 'multiply' }} />
                  ) : (
                    <div className="w-24 sm:w-28 border-b-2 border-slate-400 pt-3 mx-auto" />
                  )}
                  {/* Completely empty stamp circle border next to "يعتمد" on the left side */}
                  <div className="absolute -left-12 top-2 w-12 h-12 rounded-full border border-slate-200" />
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
