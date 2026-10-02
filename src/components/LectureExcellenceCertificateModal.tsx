import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCenter } from '../context/CenterContext';
import { 
  Award, Crown, Star, Medal, Printer, Download, Share2, 
  X, Sparkles, CheckCircle2, ShieldCheck, User, Calendar, 
  BookOpen, Eye, Check, Send, QrCode as QrIcon, Users, 
  MessageSquare, Copy, ExternalLink, Image as ImageIcon,
  ZoomIn, ZoomOut, Maximize2, Type, Sliders, Palette
} from 'lucide-react';
import QRCode from 'qrcode';
import { OfficialSealBadge } from './OfficialSealBadge';
import { captureElementToCanvas } from '../utils/captureUtils';
import confetti from 'canvas-confetti';
import { audioService } from '../services/audioService';
import { Trainee, Course, Group } from '../types';
import { api } from '../services/api';
import { getEffectiveCenterLogo, handleLogoError } from '../utils/centerLogo';
import { getPublicBaseUrl } from '../utils/urlHelper';

export interface LectureCertificateInitialData {
  traineeId?: string;
  traineeName?: string;
  traineeCode?: string;
  traineePhoto?: string;
  traineePhone?: string;
  courseId?: string;
  courseName?: string;
  groupId?: string;
  groupName?: string;
  whatsappGroupLink?: string;
  lectureTitle?: string;
  lectureDate?: string;
  points?: number;
  stars?: number;
  awardTitle?: string;
  trainerName?: string;
  hallName?: string;
}

interface LectureExcellenceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: LectureCertificateInitialData;
  onCertificateIssued?: (cert: any) => void;
}

type NameSizeMode = 'auto' | 'sm' | 'md' | 'lg' | 'xl';
type NameFontMode = 'amiri' | 'cairo' | 'aref' | 'tajawal';

const transliterateArabicToEnglish = (arabicName: string): string => {
  if (!arabicName) return '';
  
  const nameMap: { [key: string]: string } = {
    'محمد': 'Mohamed',
    'احمد': 'Ahmed',
    'أحمد': 'Ahmed',
    'محمود': 'Mahmoud',
    'علي': 'Ali',
    'حسن': 'Hassan',
    'حسين': 'Hussein',
    'ابراهيم': 'Ibrahim',
    'إبراهيم': 'Ibrahim',
    'عبد': 'Abdel',
    'الرحمن': 'Rahman',
    'الرحيم': 'Rahim',
    'الله': 'Allah',
    'خالد': 'Khaled',
    'عمر': 'Omar',
    'عمرو': 'Amr',
    'يوسف': 'Youssef',
    'مصطفى': 'Mostafa',
    'سعيد': 'Said',
    'سعد': 'Saad',
    'طه': 'Taha',
    'ياسر': 'Yasser',
    'هاني': 'Hany',
    'هشام': 'Hisham',
    'طارق': 'Tarek',
    'شريف': 'Sherif',
    'رائد': 'Raed',
    'عماد': 'Emad',
    'رفيف': 'Rafif',
    'محمد رمضان بخيت': 'Mohamed Ramadan Bkeet',
    'رمضان': 'Ramadan',
    'بخيت': 'Bkeet',
    'وليد': 'Waleed',
    'جمال': 'Gamal',
    'سامح': 'Sameh',
    'سيد': 'Sayed',
    'أيمن': 'Ayman',
    'ايمن': 'Ayman',
    'كريم': 'Karim',
    'مجدي': 'Magdy',
    'مريم': 'Maryam',
    'نور': 'Nour',
    'سارة': 'Sarah',
    'فاطمة': 'Fatma',
    'زينب': 'Zainab',
    'منى': 'Mona',
    'رنا': 'Rana',
    'ندى': 'Nada',
    'أميرة': 'Amira',
    'اميرة': 'Amira',
    'هدى': 'Hoda',
    'آية': 'Aya',
    'ايه': 'Aya',
    'دعاء': 'Doaa',
    'شيماء': 'Shaimaa',
    'إيمان': 'Eman',
    'ايمان': 'Eman',
    'منار': 'Manar',
    'منة': 'Menna',
    'منة الله': 'Menna Allah',
    'شروق': 'Shorouk',
    'أسماء': 'Asmaa',
    'نهى': 'Noha',
    'ريهام': 'Reham',
    'سلوى': 'Salwa'
  };

  const words = arabicName.trim().split(/\s+/);
  const englishWords = words.map(word => {
    if (nameMap[word]) return nameMap[word];
    const cleanedWord = word.replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');
    if (nameMap[cleanedWord]) return nameMap[cleanedWord];
    
    let eng = word;
    eng = eng.replace(/ش/g, 'sh');
    eng = eng.replace(/خ/g, 'kh');
    eng = eng.replace(/غ/g, 'gh');
    eng = eng.replace(/ع/g, 'a');
    eng = eng.replace(/ح/g, 'h');
    eng = eng.replace(/ج/g, 'g');
    eng = eng.replace(/ق/g, 'q');
    eng = eng.replace(/ص/g, 's');
    eng = eng.replace(/ض/g, 'd');
    eng = eng.replace(/ط/g, 't');
    eng = eng.replace(/ظ/g, 'z');
    eng = eng.replace(/ث/g, 'th');
    eng = eng.replace(/ذ/g, 'th');
    eng = eng.replace(/ف/g, 'f');
    eng = eng.replace(/ب/g, 'b');
    eng = eng.replace(/ت/g, 't');
    eng = eng.replace(/د/g, 'd');
    eng = eng.replace(/ر/g, 'r');
    eng = eng.replace(/ز/g, 'z');
    eng = eng.replace(/س/g, 's');
    eng = eng.replace(/ك/g, 'k');
    eng = eng.replace(/ل/g, 'l');
    eng = eng.replace(/م/g, 'm');
    eng = eng.replace(/ن/g, 'n');
    eng = eng.replace(/ه/g, 'h');
    eng = eng.replace(/و/g, 'w');
    eng = eng.replace(/ي/g, 'y');
    eng = eng.replace(/[أإآا]/g, 'a');
    eng = eng.replace(/[ُ]/g, 'u');
    eng = eng.replace(/[ِ]/g, 'i');
    eng = eng.replace(/[َ]/g, 'a');
    
    return eng.charAt(0).toUpperCase() + eng.slice(1);
  });

  return englishWords.join(' ');
};

export const LectureExcellenceCertificateModal: React.FC<LectureExcellenceCertificateModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onCertificateIssued
}) => {
  const { trainees, courses, groups, settings, showToast, refreshAll, activeBranchId, branches, trainers = [] } = useCenter();
  const certRef = useRef<HTMLDivElement>(null);

  // Form selections & customizable data
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialData?.courseId || '');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(initialData?.traineeId || '');
  const [traineeSearch, setTraineeSearch] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>(initialData?.lectureTitle || 'المحاضرة التفاعلية والتطبيق العملي');
  const [lectureDate, setLectureDate] = useState<string>(initialData?.lectureDate || new Date().toISOString().split('T')[0]);
  const [awardTitle, setAwardTitle] = useState<string>(initialData?.awardTitle || 'نجم المحاضرة الذهبي والمركز الأول');
  const [starsCount, setStarsCount] = useState<number>(initialData?.stars || 5);
  const [pointsEarned, setPointsEarned] = useState<number>(initialData?.points || 25);
  const [themeStyle, setThemeStyle] = useState<'royal_gold' | 'emerald_prestige' | 'sapphire_luxury' | 'midnight_vip'>('royal_gold');
  
  // Intelligent Name Styling & Formatting Controls
  const [nameSizeMode, setNameSizeMode] = useState<NameSizeMode>('auto');
  const [nameCustomPx, setNameCustomPx] = useState<number>(32);
  const [nameFontMode, setNameFontMode] = useState<NameFontMode>('amiri');
  const [showFlourishes, setShowFlourishes] = useState<boolean>(true);
  const [showTraineePhoto, setShowTraineePhoto] = useState<boolean>(true);
  
  // Bilingual & Type Options (Arabic and English models)
  const [certLanguage, setCertLanguage] = useState<'ar' | 'en'>('ar');
  const [englishTraineeName, setEnglishTraineeName] = useState<string>('');
  const [englishAwardTitle, setEnglishAwardTitle] = useState<string>('Golden Star of the Lecture & First Place');
  const [certificateType, setCertificateType] = useState<'appreciation' | 'achievement' | 'excellence'>('appreciation');

  // Praise sentence & Signatures
  const [customPraise, setCustomPraise] = useState<string>('تقديراً لتفوقه الاستثنائي، وحضوره المبكر، وتفاعله النموذجي وإتقانه للتطبيقات العملية');
  const [trainerName, setTrainerName] = useState<string>(initialData?.trainerName || settings?.trainerName || 'المحاضر المشرف');
  const [managerName, setManagerName] = useState<string>(settings?.managerName || 'د. محمد رمضان بخيت');

  // Preview & Export States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showDesktopNotice, setShowDesktopNotice] = useState<boolean>(false);
  const [includeTextMessage, setIncludeTextMessage] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(100);

  // Load existing certificates to accurately calculate sequential index (C1, C2...)
  const [existingCerts, setExistingCerts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getCertificates()
        .then(res => {
          if (Array.isArray(res)) {
            setExistingCerts(res);
          }
        })
        .catch(err => console.error("Failed to load certificates:", err));
    }
  }, [isOpen]);

  // Auto-init defaults from initialData
  useEffect(() => {
    if (initialData?.courseId) setSelectedCourseId(initialData.courseId);
    else if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0].id);

    if (initialData?.traineeId) setSelectedTraineeId(initialData.traineeId);
    else if (trainees.length > 0 && !selectedTraineeId) setSelectedTraineeId(trainees[0].id);

    if (initialData?.lectureTitle) setLectureTitle(initialData.lectureTitle);
    if (initialData?.lectureDate) setLectureDate(initialData.lectureDate);
    if (initialData?.awardTitle) setAwardTitle(initialData.awardTitle);
    if (initialData?.points) setPointsEarned(initialData.points);
    if (initialData?.stars) setStarsCount(initialData.stars);
    if (initialData?.trainerName) setTrainerName(initialData.trainerName);
  }, [initialData, courses, trainees]);

  // Intelligent auto-update when course changes (Trainer auto-fill & Trainee list auto-filter)
  useEffect(() => {
    if (!selectedCourseId) return;
    
    // Find course
    const course = courses.find(c => c.id === selectedCourseId);
    if (course) {
      // 1. Update trainer name automatically from course
      if (course.trainerId && trainers && trainers.length > 0) {
        const trainer = trainers.find((t: any) => t.id === course.trainerId);
        if (trainer) {
          const prefix = trainer.prefix || trainer.title;
          const prefixStr = prefix === 'DR' ? 'د. ' : prefix === 'ENG' ? 'م. ' : prefix === 'TR' ? 'المدرب ' : '';
          setTrainerName(`${prefixStr}${trainer.name}`);
        } else if (course.trainerName) {
          setTrainerName(course.trainerName);
        }
      } else if (course.trainerName) {
        setTrainerName(course.trainerName);
      }
      
      // 2. Filter trainees for this course
      const courseTrainees = trainees.filter(t => t.courseId === selectedCourseId || t.courseIds?.includes(selectedCourseId));
      if (courseTrainees.length > 0) {
        const isCurrentInCourse = courseTrainees.some(t => t.id === selectedTraineeId);
        if (!isCurrentInCourse) {
          setSelectedTraineeId(courseTrainees[0].id);
        }
      } else {
        setSelectedTraineeId('');
      }
    }
  }, [selectedCourseId, courses, trainees, trainers]);

  // Resolve trainee details
  const currentTrainee = trainees.find(t => t.id === selectedTraineeId) || (initialData?.traineeName ? {
    id: initialData.traineeId || 'custom',
    fullName: initialData.traineeName,
    code: initialData.traineeCode || '101',
    photoUrl: initialData.traineePhoto || '',
    phone: initialData.traineePhone || '',
    parentPhone: ''
  } as any : null);

  const currentCourse = courses.find(c => c.id === selectedCourseId) || (initialData?.courseName ? {
    id: initialData.courseId || 'custom',
    name: initialData.courseName
  } as any : null);

  // Auto translate name when currentTrainee is resolved
  useEffect(() => {
    if (currentTrainee?.fullName) {
      setEnglishTraineeName(transliterateArabicToEnglish(currentTrainee.fullName));
    } else {
      setEnglishTraineeName('');
    }
  }, [currentTrainee]);

  // Resolve group and auto-detect group WhatsApp link
  const targetGroup = groups.find(g => 
    (initialData?.groupId && g.id === initialData.groupId) ||
    (currentTrainee?.groupId && g.id === currentTrainee.groupId) ||
    (g.courseId === selectedCourseId)
  );

  const courseCode = currentCourse?.code || (currentCourse?.name ? currentCourse.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'ICT4');
  const traineeCode = currentTrainee?.code || 'C001';

  // Calculate sequential C-index (e.g. C1, C2...) based on existing certificates
  const countExistingInCourse = useMemo(() => {
    if (!selectedTraineeId || !selectedCourseId) return 0;
    return existingCerts.filter(
      (c: any) => c.traineeId === selectedTraineeId && c.courseId === selectedCourseId
    ).length;
  }, [existingCerts, selectedTraineeId, selectedCourseId]);

  const nextNumber = countExistingInCourse + 1;
  const serialNumber = `${courseCode}-${traineeCode}-C${nextNumber}`;

  const detectedGroupLink = 
    initialData?.whatsappGroupLink ||
    targetGroup?.whatsappGroupLink ||
    (targetGroup as any)?.whatsappLink ||
    (currentCourse as any)?.whatsappGroupLink ||
    (currentCourse as any)?.whatsappLink ||
    settings?.whatsappGroupLink ||
    '';

  // Comprehensive theme palettes with 100% color logic & zero invisible text
  const themes = useMemo(() => ({
    royal_gold: {
      name: 'الملكي الذهبي الفاخر (Royal Imperial Gold)',
      isDark: false,
      borderColor: '#d97706',
      borderOuter: '#b45309',
      borderInner: '#f59e0b',
      rosetteColor: '#d97706',
      bgPaper: 'from-[#fffdf8] via-[#fffbf2] to-[#fff9ee]',
      watermarkColor: 'rgba(217, 119, 6, 0.04)',
      headerTitle: '#1c1917',
      headerSub: '#92400e',
      headerMeta: '#451a03',
      headerMetaMuted: '#78350f',
      titleBannerBg: 'bg-white',
      titleBannerBorder: '#f59e0b',
      titleBannerText: '#92400e',
      titleSubText: '#78350f',
      introText: '#451a03',
      nameColor: '#78350f',
      nameGlow: 'none',
      nameFlourishColor: '#d97706',
      codeTagBg: 'bg-amber-100 text-amber-950 border-amber-300',
      groupTagBg: 'bg-white text-slate-800 border-amber-200',
      praiseText: '#292524',
      awardRibbonBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black',
      awardRibbonBorder: '#d97706',
      infoCardBg: 'rgba(255, 255, 255, 0.95)',
      infoCardBorder: '#fde68a',
      infoCardLabel: '#92400e',
      infoCardText: '#1c1917',
      infoCardSub: '#475569',
      starsContainerBg: 'bg-amber-100/90 border-amber-300 text-amber-950',
      pointsBadgeBg: 'bg-slate-950 text-amber-300 border-amber-500/40',
      footerBorder: '#f59e0b',
      footerLabel: '#78350f',
      footerSign: '#1c1917',
      qrBg: '#ffffff',
      qrBorder: '#fde68a',
      sealCaption: '#92400e',
      sealBadgeClass: 'text-amber-700'
    },
    emerald_prestige: {
      name: 'الزمردي الإمبراطوري الراقي (Emerald Prestige)',
      isDark: false,
      borderColor: '#059669',
      borderOuter: '#047857',
      borderInner: '#10b981',
      rosetteColor: '#059669',
      bgPaper: 'from-[#f4fcf7] via-[#ebf9f1] to-[#f4fcf7]',
      watermarkColor: 'rgba(5, 150, 105, 0.04)',
      headerTitle: '#064e3b',
      headerSub: '#047857',
      headerMeta: '#065f46',
      headerMetaMuted: '#047857',
      titleBannerBg: 'bg-white',
      titleBannerBorder: '#10b981',
      titleBannerText: '#065f46',
      titleSubText: '#047857',
      introText: '#065f46',
      nameColor: '#064e3b',
      nameGlow: 'none',
      nameFlourishColor: '#059669',
      codeTagBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      groupTagBg: 'bg-white text-emerald-900 border-emerald-200',
      praiseText: '#1f2937',
      awardRibbonBg: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-black',
      awardRibbonBorder: '#059669',
      infoCardBg: 'rgba(255, 255, 255, 0.95)',
      infoCardBorder: '#a7f3d0',
      infoCardLabel: '#065f46',
      infoCardText: '#064e3b',
      infoCardSub: '#374151',
      starsContainerBg: 'bg-emerald-100/90 border-emerald-300 text-emerald-950',
      pointsBadgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      footerBorder: '#10b981',
      footerLabel: '#065f46',
      footerSign: '#064e3b',
      qrBg: '#ffffff',
      qrBorder: '#a7f3d0',
      sealCaption: '#065f46',
      sealBadgeClass: 'text-emerald-700'
    },
    sapphire_luxury: {
      name: 'الياقوتي الأزرق الفاخر (Imperial Sapphire)',
      isDark: false,
      borderColor: '#2563eb',
      borderOuter: '#1d4ed8',
      borderInner: '#3b82f6',
      rosetteColor: '#2563eb',
      bgPaper: 'from-[#f8faff] via-[#eff6ff] to-[#f8faff]',
      watermarkColor: 'rgba(37, 99, 235, 0.04)',
      headerTitle: '#1e3a8a',
      headerSub: '#1d4ed8',
      headerMeta: '#1e40af',
      headerMetaMuted: '#2563eb',
      titleBannerBg: 'bg-white',
      titleBannerBorder: '#3b82f6',
      titleBannerText: '#1e40af',
      titleSubText: '#1d4ed8',
      introText: '#1e40af',
      nameColor: '#1e3a8a',
      nameGlow: 'none',
      nameFlourishColor: '#2563eb',
      codeTagBg: 'bg-blue-100 text-blue-950 border-blue-300',
      groupTagBg: 'bg-white text-blue-900 border-blue-200',
      praiseText: '#1f2937',
      awardRibbonBg: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 text-white font-black',
      awardRibbonBorder: '#1d4ed8',
      infoCardBg: 'rgba(255, 255, 255, 0.95)',
      infoCardBorder: '#bfdbfe',
      infoCardLabel: '#1e40af',
      infoCardText: '#1e3a8a',
      infoCardSub: '#374151',
      starsContainerBg: 'bg-blue-100/90 border-blue-300 text-blue-950',
      pointsBadgeBg: 'bg-slate-950 text-blue-300 border-blue-500/40',
      footerBorder: '#3b82f6',
      footerLabel: '#1e40af',
      footerSign: '#1e3a8a',
      qrBg: '#ffffff',
      qrBorder: '#bfdbfe',
      sealCaption: '#1e40af',
      sealBadgeClass: 'text-blue-700'
    },
    midnight_vip: {
      name: 'الأونيكس والذهب الملكي VIP (Midnight Gold)',
      isDark: true,
      borderColor: '#fbbf24',
      borderOuter: '#d97706',
      borderInner: '#f59e0b',
      rosetteColor: '#fbbf24',
      bgPaper: 'from-[#070b14] via-[#0f172a] to-[#070b14]',
      watermarkColor: 'rgba(251, 191, 36, 0.08)',
      headerTitle: '#fef08a',
      headerSub: '#fbbf24',
      headerMeta: '#fde68a',
      headerMetaMuted: '#cbd5e1',
      titleBannerBg: 'bg-slate-900/90',
      titleBannerBorder: '#fbbf24',
      titleBannerText: '#fef08a',
      titleSubText: '#fbbf24',
      introText: '#fde68a',
      nameColor: '#fef08a',
      nameGlow: '0 0 16px rgba(251, 191, 36, 0.45)',
      nameFlourishColor: '#fbbf24',
      codeTagBg: 'bg-amber-950/80 text-amber-200 border-amber-600/60',
      groupTagBg: 'bg-slate-800 text-amber-100 border-amber-500/30',
      praiseText: '#f1f5f9',
      awardRibbonBg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black',
      awardRibbonBorder: '#fbbf24',
      infoCardBg: 'rgba(15, 23, 42, 0.92)',
      infoCardBorder: 'rgba(245, 158, 11, 0.55)',
      infoCardLabel: '#fbbf24',
      infoCardText: '#fef08a',
      infoCardSub: '#cbd5e1',
      starsContainerBg: 'bg-amber-950/70 border-amber-500/50 text-amber-200',
      pointsBadgeBg: 'bg-amber-400 text-slate-950 font-black border-amber-300',
      footerBorder: 'rgba(245, 158, 11, 0.6)',
      footerLabel: '#fbbf24',
      footerSign: '#ffffff',
      qrBg: '#ffffff',
      qrBorder: '#fbbf24',
      sealCaption: '#fbbf24',
      sealBadgeClass: 'text-amber-400'
    }
  }), []);

  const currentTheme = themes[themeStyle];

  // Dynamic Trainee Name Font Size Calculation
  const computedNameStyle = useMemo(() => {
    const rawName = certLanguage === 'en' 
      ? (englishTraineeName || 'Distinguished Trainee') 
      : (currentTrainee?.fullName || 'اسم المتدرب المتميز');
    const charCount = rawName.trim().length;

    // Font family mapping
    let fontFamily = certLanguage === 'en' 
      ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      : "'Amiri', 'Traditional Arabic', serif";
    if (certLanguage === 'ar') {
      if (nameFontMode === 'cairo') fontFamily = "'Cairo', system-ui, sans-serif";
      if (nameFontMode === 'aref') fontFamily = "'Aref Ruqaa', 'Amiri', serif";
      if (nameFontMode === 'tajawal') fontFamily = "'Tajawal', system-ui, sans-serif";
    } else {
      if (nameFontMode === 'cairo' || nameFontMode === 'tajawal') fontFamily = "system-ui, -apple-system, sans-serif";
      if (nameFontMode === 'aref' || nameFontMode === 'amiri') fontFamily = "'Georgia', 'Times New Roman', serif";
    }

    // Auto sizing logic based on character length
    if (nameSizeMode === 'auto') {
      let sizePx = 34;
      if (charCount > 40) sizePx = 20;
      else if (charCount > 30) sizePx = 23;
      else if (charCount > 22) sizePx = 27;
      else if (charCount > 15) sizePx = 31;
      else sizePx = 34;

      return {
        fontSize: `${sizePx}px`,
        lineHeight: 1.25,
        fontFamily,
        color: currentTheme.nameColor,
        textShadow: currentTheme.nameGlow
      };
    }

    // Manual size presets
    let sizePx = nameCustomPx;
    if (nameSizeMode === 'sm') sizePx = 20;
    if (nameSizeMode === 'md') sizePx = 26;
    if (nameSizeMode === 'lg') sizePx = 34;
    if (nameSizeMode === 'xl') sizePx = 42;

    return {
      fontSize: `${sizePx}px`,
      lineHeight: 1.25,
      fontFamily,
      color: currentTheme.nameColor,
      textShadow: currentTheme.nameGlow
    };
  }, [currentTrainee, englishTraineeName, certLanguage, nameSizeMode, nameCustomPx, nameFontMode, currentTheme]);

  // Generate verification QR code
  useEffect(() => {
    const verificationText = `منظومة النجاح الذكية للتدريب\nشهادة تفوق وتقدير في محاضرة\nالمتدرب: ${currentTrainee?.fullName || 'متدرب متميز'}\nكود المتدرب: ${currentTrainee?.code || '—'}\nالدورة: ${currentCourse?.name || 'برنامج تدريبي'}\nالمحاضرة: ${lectureTitle}\nاللقب: ${awardTitle}\nالنقاط: ${pointsEarned} نقطة\nالرقم المرجعي: ${serialNumber}\nالتاريخ: ${lectureDate}\nمعتمدة من مركز النجاح للتدريب والاستشارات`;
    
    QRCode.toDataURL(verificationText, {
      width: 160,
      margin: 1,
      color: {
        dark: themeStyle === 'emerald_prestige' ? '#064e3b' : themeStyle === 'sapphire_luxury' ? '#1e3a8a' : '#78350f',
        light: '#ffffff'
      }
    }).then(setQrCodeDataUrl).catch(() => {});
  }, [currentTrainee, currentCourse, lectureTitle, awardTitle, pointsEarned, serialNumber, lectureDate, themeStyle]);

  if (!isOpen) return null;

  const centerLogo = getEffectiveCenterLogo(settings?.logoUrl);

  // Award Presets
  const awardPresets = [
    { title: 'نجم المحاضرة الذهبي والمركز الأول', stars: 5, points: 25, reason: 'تقديراً لحصوله على المركز الأول والتفوق الاستثنائي في تفاعل وأنشطة المحاضرة' },
    { title: 'النجم الفضي والمركز الثاني', stars: 4, points: 20, reason: 'تقديراً لحصوله على المركز الثاني والإتقان الرائع للمهام التدريبية' },
    { title: 'النجم البرونزي والمركز الثالث', stars: 4, points: 15, reason: 'تقديراً لحصوله على المركز الثالث والتفاعل المتميز في قاعة التدريب' },
    { title: 'فارس التميز الأكاديمي والعملي', stars: 5, points: 30, reason: 'تقديراً للحلول المبتكرة والتطبيق العملي الاحترافي على أجهزة المعمل' },
    { title: 'وسام الانضباط والحضور المبكر', stars: 5, points: 20, reason: 'تقديراً لالتزامه النموذجي بالمواعيد، وحسن السمت والمشاركة الفعالة' }
  ];

  // Save certificate to database
  const handleSaveToCertificates = async () => {
    try {
      const branch = branches.find(b => b.id === activeBranchId) || branches[0];
      const certTitle = certificateType === 'excellence' 
        ? 'وسام تميز' 
        : certificateType === 'achievement' 
          ? 'شهادة إتمام وتفوق' 
          : 'شهادة شكر وتقدير';
      const certTitleEn = certificateType === 'excellence' 
        ? 'Medal of Excellence' 
        : certificateType === 'achievement' 
          ? 'Certificate of Completion' 
          : 'Certificate of Appreciation';

      const newCertData = {
        certificateNumber: serialNumber,
        serialNumber: serialNumber,
        traineeId: currentTrainee?.id || 'manual',
        traineeName: currentTrainee?.fullName || 'متدرب متميز',
        courseId: currentCourse?.id || 'manual',
        courseName: currentCourse?.name || 'الدورة التدريبية',
        branchId: currentTrainee?.branchId || (branch?.id !== 'all' ? branch?.id : 'branch-1') || 'branch-1',
        issueDate: lectureDate,
        grade: `${awardTitle} (${pointsEarned} نقطة)`,
        durationText: lectureTitle,
        trainerName,
        managerName,
        certificateTitle: certTitle,
        certificateTitleEn: certTitleEn,
        type: certificateType,
        templateTheme: themeStyle,
        qrPayload: serialNumber
      };

      await api.createCertificate(newCertData);
      setIsSaved(true);
      showToast(
        certificateType === 'excellence'
          ? `تم اعتماد وتوثيق وسام التميز بنجاح لـ (${currentTrainee?.fullName}) في ملف الطالب وسجل الشهادات 🏅`
          : `تم توثيق شهادة التقدير بنجاح لـ (${currentTrainee?.fullName}) في ملف الطالب وسجل الشهادات 📜`,
        'success'
      );
      audioService.playClapping(2);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (onCertificateIssued) {
        onCertificateIssued(newCertData);
      }
      refreshAll();
    } catch (err: any) {
      console.error('Error saving lecture certificate:', err);
      showToast('تم تجهيز الشهادة بنجاح وجاهزة للطباعة', 'info');
    }
  };

  // Direct Clean Safe Print handler
  const handlePrint = () => {
    if (!isSaved) {
      handleSaveToCertificates();
    }
    
    // Play celebratory sound & confetti
    audioService.playClapping(2.5);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch {}

    window.print();
  };

  // Download High-Res Image
  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      if (!isSaved) handleSaveToCertificates();
      const canvas = await captureElementToCanvas(certRef.current);
      const link = document.createElement('a');
      link.download = `شهادة_تقدير_${currentTrainee?.fullName?.replace(/\s+/g, '_') || 'متدرب'}_${serialNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      showToast('تم تحميل صورة الشهادة عالية الدقة بنجاح 🖼️✨', 'success');
      audioService.playClapping(2);
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('حدث خطأ أثناء تحميل الصورة', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Build rich congratulatory text
  const buildShareMessage = () => {
    const publicBase = getPublicBaseUrl();
    const verifyUrl = `${publicBase}/?verify=${serialNumber}&code=${currentTrainee?.code || ''}`;
    const studentPortalUrl = `${publicBase}/?view=student_portal&code=${currentTrainee?.code || ''}`;
    return `🌟🏆 تهانينا الحارة من مركز النجاح للتدريب والاستشارات! 🏆🌟\n\n` +
      `نهنئ المتدرب المتميز البطل: *${currentTrainee?.fullName || 'المتدرب'}* 🎓\n` +
      `بمناسبة تفوقه وحصوله على استحقاق:\n✨ *${awardTitle}* ✨\n\n` +
      `📌 المادة / الدورة: ${currentCourse?.name || 'الدورة التدريبية'}\n` +
      (targetGroup?.name ? `👥 المجموعة: ${targetGroup.name}\n` : '') +
      `📌 تفاصيل التكريم: ${lectureTitle}\n` +
      `⭐ التقييم: ${starsCount} نجوم (+${pointsEarned} نقطة تميز إضافية ⚡)\n` +
      `🔒 الرقم المرجعي المعتمد: ${serialNumber}\n\n` +
      `🔍 رابط فحص واعتماد الشهادة رسمياً:\n${verifyUrl}\n\n` +
      `🎓 بوابة المتدرب الشخصية لمتابعة الإنجازات:\n${studentPortalUrl}\n\n` +
      `نتمنى لك دوام التألق والريادة دائماً! 🚀👏\n` +
      `${settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}`;
  };

  // 1. Share Certificate Image to WhatsApp Group
  const handleShareImageToGroup = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      if (!isSaved) handleSaveToCertificates();
      const canvas = await captureElementToCanvas(certRef.current);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('فشل معالجة صورة الشهادة');

      const fileName = `شهادة_تقدير_${currentTrainee?.fullName?.replace(/\s+/g, '_') || 'متدرب'}_${serialNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const message = includeTextMessage ? buildShareMessage() : '';

      // Mobile / Web Share API with File
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const shareData: ShareData = {
          files: [file],
          title: `شهادة تقدير - ${currentTrainee?.fullName}`
        };
        if (message) shareData.text = message;

        await navigator.share(shareData);
        showToast('تمت مشاركة صورة الشهادة بنجاح! 🖼️✨', 'success');
        audioService.playClapping(2);
        return;
      }

      // Desktop fallback: copy image to clipboard + download PNG + open WhatsApp
      try {
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } catch (e) {
        console.warn('Clipboard write warning:', e);
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();

      let whatsappUrl = detectedGroupLink && detectedGroupLink.trim().startsWith('http')
        ? detectedGroupLink.trim()
        : (message ? `https://wa.me/?text=${encodeURIComponent(message)}` : `https://web.whatsapp.com/`);

      window.open(whatsappUrl, '_blank');
      setShowDesktopNotice(true);
      showToast('تم نسخ صورة الشهادة للحافظة! الصقها مباشرة بـ (Ctrl + V) في جروب الواتساب 📋🖼️', 'success');
    } catch (err: any) {
      console.error('Group image share error:', err);
      showToast(err.message || 'حدث خطأ أثناء تجهيز الصورة', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Share Certificate Image to Parent (Private Chat)
  const handleShareImageToParent = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      if (!isSaved) handleSaveToCertificates();
      const canvas = await captureElementToCanvas(certRef.current);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('فشل معالجة صورة الشهادة');

      const fileName = `شهادة_تقدير_${currentTrainee?.fullName?.replace(/\s+/g, '_') || 'متدرب'}_${serialNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const message = includeTextMessage ? buildShareMessage() : '';

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const shareData: ShareData = {
          files: [file],
          title: `شهادة تقدير - ${currentTrainee?.fullName}`
        };
        if (message) shareData.text = message;

        await navigator.share(shareData);
        showToast('تمت مشاركة صورة الشهادة بنجاح! 🖼️✨', 'success');
        audioService.playClapping(2);
        return;
      }

      try {
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } catch (e) {
        console.warn('Clipboard write warning:', e);
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();

      const phone = currentTrainee?.phone || currentTrainee?.parentPhone;
      const cleanPhone = phone?.replace(/[^0-9]/g, '');
      const whatsappUrl = cleanPhone 
        ? (message ? `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}`)
        : (message ? `https://wa.me/?text=${encodeURIComponent(message)}` : `https://web.whatsapp.com/`);

      window.open(whatsappUrl, '_blank');
      setShowDesktopNotice(true);
      showToast('تم نسخ صورة الشهادة للحافظة! الصقها بـ (Ctrl + V) في شات ولي الأمر 📋🖼️', 'success');
    } catch (err: any) {
      console.error('Parent image share error:', err);
      showToast(err.message || 'حدث خطأ أثناء تجهيز الصورة', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print-modal-overlay">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-[1400px] w-full my-auto max-h-[96vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 print-modal-box">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                إصدار وتوثيق شهادة التميز الملكية
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-full">
                  احتواء تلقائي متكامل 100%
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تصميم متناسق الألوان بدقة هندسية، تحكم مرن في حجم وتنميق اسم المتدرب، وضمان ظهور كامل المحتويات والأختام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Controls Column (Left) + Interactive Live Canvas Column (Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5 bg-slate-100/70 dark:bg-slate-950/50 print:p-0 print:bg-white print:block">
          
          {/* Controls Column (4 cols on large screens) */}
          <div className="lg:col-span-4 space-y-3.5 overflow-y-auto pr-0.5 custom-scrollbar print:hidden">
            
            {/* Trainee & Course Selection Card */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>بيانات المتدرب والدورة</span>
              </h3>

              {/* Course Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الدورة التدريبية:
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Trainee Selector with Search Filter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    المتدرب المكرم:
                  </label>
                  <input
                    type="text"
                    placeholder="بحث بالاسم..."
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    className="w-28 px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <select
                  value={selectedTraineeId}
                  onChange={(e) => setSelectedTraineeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {trainees
                    .filter(t => t.courseId === selectedCourseId || t.courseIds?.includes(selectedCourseId))
                    .filter(t => !traineeSearch || t.fullName.toLowerCase().includes(traineeSearch.toLowerCase()) || (t.code && t.code.includes(traineeSearch)))
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.code || '—'})
                      </option>
                    ))}
                  {trainees.filter(t => t.courseId === selectedCourseId || t.courseIds?.includes(selectedCourseId)).length === 0 && (
                    <option value="">لا يوجد متدربين في هذه الدورة</option>
                  )}
                </select>
              </div>

              {/* Toggle Photo Avatar */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>إظهار صورة المتدرب بالشهادة:</span>
                </span>
                <input
                  type="checkbox"
                  checked={showTraineePhoto}
                  onChange={(e) => setShowTraineePhoto(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Certificate Type Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع ونموذج الشهادة:
                </label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="appreciation">🏆 شهادة شكر وتقدير (Appreciation)</option>
                  <option value="achievement">🎓 شهادة دورة / إتمام (Completion)</option>
                  <option value="excellence">⭐ وسام تميز وتفوق (Excellence Medal)</option>
                </select>
              </div>

              {/* Certificate Language Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نموذج لغة الشهادة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCertLanguage('ar')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border cursor-pointer text-center transition-all ${
                      certLanguage === 'ar'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🇸🇦 نموذج عربي كامل
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertLanguage('en')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border cursor-pointer text-center transition-all ${
                      certLanguage === 'en'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🇺🇸 English Model (إنجليزي)
                  </button>
                </div>
              </div>

              {/* English Name Input - shown always for flexibility but crucial for English model */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  اسم المتدرب بالإنجليزية (قابل للتعديل):
                </label>
                <input
                  type="text"
                  value={englishTraineeName}
                  onChange={(e) => setEnglishTraineeName(e.target.value)}
                  placeholder="English Name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                />
              </div>

              {/* English Award Title Input */}
              {certLanguage === 'en' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    لقب التكريم بالإنجليزية (English Award Title):
                  </label>
                  <input
                    type="text"
                    value={englishAwardTitle}
                    onChange={(e) => setEnglishAwardTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              )}
            </div>

            {/* SMART NAME RESIZING & EMBELLISHMENT CONTROL (المطلوب في الشكوى) */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 shadow-xs space-y-3 ring-2 ring-amber-400/20">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-black text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-500" />
                  <span>تنميق وحجم اسم المتدرب (المرونة والذكاء)</span>
                </h3>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-full">
                  {nameSizeMode === 'auto' ? '⚡ ذكي تلقائي' : `${computedNameStyle.fontSize}`}
                </span>
              </div>

              {/* Quick Size Mode Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نمط القياس:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'auto', label: '⚡ احتواء تلقائي', title: 'يضبط حجم الاسم تلقائياً حسب طول الحروف ليظهر منمقاً' },
                    { id: 'sm', label: 'صغير منمق', title: 'حجم مقتضب وناعم يتناسق مع النصوص الطويلة' },
                    { id: 'md', label: 'متوسط متزن', title: 'حجم متوسط مثالي' },
                    { id: 'lg', label: 'كبير بارز', title: 'حجم عريض للاسم القصير' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setNameSizeMode(btn.id as NameSizeMode)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer text-center ${
                        nameSizeMode === btn.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                      title={btn.title}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Slider if not auto */}
              {nameSizeMode !== 'auto' && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                    <span>الضبط الدقيق لحجم الخط:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{nameCustomPx}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    step="1"
                    value={nameCustomPx}
                    onChange={(e) => {
                      setNameCustomPx(Number(e.target.value));
                      setNameSizeMode('custom' as any);
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Arabic Calligraphy Font Style */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الخط العربي لاسم المتدرب:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'amiri', label: 'النسخ الأميري' },
                    { id: 'aref', label: 'الرقعة الكلاسيكي' },
                    { id: 'cairo', label: 'كايرو الحديث' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setNameFontMode(font.id as NameFontMode)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                        nameFontMode === font.id
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-400 font-black'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Flourishes (❖ ───) Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-semibold">زخرفة جوانب الاسم (❖ ───):</span>
                <input
                  type="checkbox"
                  checked={showFlourishes}
                  onChange={(e) => setShowFlourishes(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* VISUAL THEME SELECTOR WITH LOGICAL COLOR HARMONY */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>المنطق والتناسق اللوني للشهادة</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(themes) as (keyof typeof themes)[]).map(key => {
                  const th = themes[key];
                  const isSelected = themeStyle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeStyle(key)}
                      className={`p-2 rounded-xl text-[11px] font-black border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-950 dark:text-white shadow-sm ring-2 ring-amber-400/40'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0" 
                            style={{ backgroundColor: th.borderColor }}
                          />
                          <span>
                            {key === 'royal_gold' ? '👑 ذهبي ملكي' : key === 'emerald_prestige' ? '🌿 زمردي راقي' : key === 'sapphire_luxury' ? '💎 ياقوتي فاخر' : '✨ أونيكس VIP'}
                          </span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">
                        {th.isDark ? 'خلفية أونيكس داكنة مع نصوص ذهبية منيرة' : 'خلفية عاجية كلاسيكية مع تباين عالي'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lecture & Award Configuration */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Medal className="w-4 h-4 text-amber-500" />
                <span>تفاصيل التكريم والاستحقاق</span>
              </h3>

              {/* Award Title Presets */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نماذج واستحقاقات التكريم السريعة:
                </label>
                <select
                  onChange={(e) => {
                    const preset = awardPresets[Number(e.target.value)];
                    if (preset) {
                      setAwardTitle(preset.title);
                      setStarsCount(preset.stars);
                      setPointsEarned(preset.points);
                      setCustomPraise(preset.reason);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  {awardPresets.map((p, i) => (
                    <option key={i} value={i}>{p.title} (+{p.points} نقطة)</option>
                  ))}
                </select>
              </div>

              {/* Custom Award Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لقب التكريم الظاهر على الوشاح:
                </label>
                <input
                  type="text"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                />
              </div>

              {/* Lecture Title & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان المحاضرة:
                  </label>
                  <input
                    type="text"
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ التكريم:
                  </label>
                  <input
                    type="date"
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Stars & Points */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    النقاط الإضافية:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={pointsEarned}
                    onChange={(e) => setPointsEarned(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التقييم بالنجوم:
                  </label>
                  <select
                    value={starsCount}
                    onChange={(e) => setStarsCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 نجوم)</option>
                    <option value={3}>⭐⭐⭐ (3 نجوم)</option>
                  </select>
                </div>
              </div>

              {/* Praise Sentence */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص عبارة التقدير والشكر:
                </label>
                <textarea
                  rows={2}
                  value={customPraise}
                  onChange={(e) => setCustomPraise(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Signatures Names */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المحاضر المشرف:
                  </label>
                  <input
                    type="text"
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مدير عام المركز:
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions & Export Buttons */}
            <div className="space-y-2 pt-1">
              {/* Image only toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>إرسال صورة الشهادة فقط (بدون نصوص إضافية)</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!includeTextMessage}
                    onChange={(e) => setIncludeTextMessage(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Notice Banner for Desktop Image Pasting */}
              {showDesktopNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-in fade-in">
                  <div className="font-black flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>تم نسخ صورة الشهادة للحافظة! 📋🖼️</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-300">
                    في محادثة الواتساب، اضغط فوراً على <b>Ctrl + V</b> للصق الصورة وإرسالها مباشرة.
                  </p>
                </div>
              )}

              {/* Direct Save & Issue Certificate/Medal Button */}
              <button
                type="button"
                onClick={handleSaveToCertificates}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ring-2 ring-amber-400/50"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>{isSaved ? '✅ تم التوثيق (إعادة حفظ وتحديث)' : '💾 اعتماد وتوثيق في ملف الطالب وسجل الشهادات'}</span>
              </button>

              {/* 1. Share Image to WhatsApp Group */}
              <button
                type="button"
                onClick={handleShareImageToGroup}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Users className="w-4 h-4 text-emerald-200" />
                <span>{isExporting ? 'جاري تجهيز الصورة...' : 'مشاركة صورة الشهادة على جروب الواتساب 👥'}</span>
              </button>

              {/* 2. Share Image to Parent */}
              <button
                type="button"
                onClick={handleShareImageToParent}
                disabled={isExporting}
                className="w-full py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-teal-200" />
                <span>{isExporting ? 'جاري تجهيز الصورة...' : 'إرسال صورة الشهادة لولي الأمر (خاص) 📱'}</span>
              </button>

              {/* Print / PDF Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة فوراً / حفظ PDF</span>
              </button>

              {/* Download PNG file */}
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExporting ? 'جاري التحميل...' : 'تحميل صورة الشهادة PNG عالية الدقة'}</span>
              </button>

              {isSaved && (
                <div className="text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم حفظ الشهادة وتوثيقها في سجل الشهادات الرسمي</span>
                </div>
              )}
            </div>
          </div>

          {/* Live High-Fidelity Preview Column (8 cols on large screens) */}
          <div className="lg:col-span-8 flex flex-col items-center justify-start overflow-y-auto pb-4 print:w-full print:block print:p-0 print:overflow-visible">
            
            {/* Preview Toolbar with Zoom Controls & Fit Notice */}
            <div className="w-full flex items-center justify-between mb-2 px-2 text-xs text-slate-600 dark:text-slate-400 print:hidden">
              <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Eye className="w-4 h-4 text-amber-500" />
                معاينة الشهادة المعتمدة (كاملة المحتويات والأختام دون أي اقتطاع)
              </span>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewScale(Math.max(75, previewScale - 5))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                  title="تصغير المعاينة"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] font-bold px-1">{previewScale}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale(Math.min(115, previewScale + 5))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                  title="تكبير المعاينة"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(100)}
                  className="text-[9px] font-bold text-amber-600 px-1 border-r border-slate-200 dark:border-slate-700 mr-1"
                  title="إعادة للوضع الافتراضي"
                >
                  100%
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER WITH SMART AUTO-CONTAINMENT */}
            <div 
              className="w-full flex justify-center items-start transition-transform duration-200"
              style={{ transform: previewScale !== 100 ? `scale(${previewScale / 100})` : 'none', transformOrigin: 'top center' }}
            >
              
              {/* THE LUXURY CERTIFICATE CANVAS SHEET (GUARANTEED NO OVERFLOW CUTOFF) */}
              <div
                ref={certRef}
                dir="rtl"
                className={`certificate-print-sheet w-full max-w-[890px] min-h-[580px] bg-gradient-to-br ${currentTheme.bgPaper} rounded-3xl p-5 sm:p-7 shadow-2xl relative border-[8px] sm:border-[10px] border-double select-none flex flex-col justify-between`}
                style={{ 
                  borderColor: currentTheme.borderColor,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), inset 0 0 30px rgba(0, 0, 0, 0.02)',
                  color: currentTheme.isDark ? '#f8fafc' : '#0f172a'
                }}
              >
                {/* Background Watermark Crest */}
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-8 rounded-3xl z-0 overflow-hidden">
                  <img src={centerLogo} alt="Watermark" className="w-80 h-80 object-contain grayscale" />
                </div>

                {/* 4 Ornate Antique Corner Rosettes */}
                <div className="absolute top-2.5 left-2.5 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.rosetteColor }}>❖</div>
                <div className="absolute top-2.5 right-2.5 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.rosetteColor }}>❖</div>
                <div className="absolute bottom-2.5 left-2.5 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.rosetteColor }}>❖</div>
                <div className="absolute bottom-2.5 right-2.5 text-2xl sm:text-3xl font-serif select-none" style={{ color: currentTheme.rosetteColor }}>❖</div>

                {/* Inner Fine Gold Filigree Border */}
                <div 
                  className="absolute inset-2 sm:inset-3 border border-dashed rounded-2xl pointer-events-none" 
                  style={{ borderColor: currentTheme.borderOuter, opacity: 0.55 }} 
                />

                {/* 1. CERTIFICATE HEADER (Absolutely centered, clean English-only brand stacked far-right) */}
                <div 
                  className="relative z-10 w-full h-16 sm:h-20 flex items-center justify-between border-b-2 pb-2 mb-1.5" 
                  style={{ borderColor: currentTheme.borderInner }}
                >
                  {/* Right Column: Symmetrical Stacked Title Pyramid, pushed to extreme right, smaller size */}
                  <div className="flex flex-col items-start leading-none text-right justify-center shrink-0 pr-1 select-none">
                    <h1 
                      className="text-[10px] sm:text-[11px] font-black font-serif"
                      style={{ color: currentTheme.headerTitle, fontFamily: computedNameStyle.fontFamily }}
                    >
                      Nagah
                    </h1>
                    <p 
                      className="text-[9px] sm:text-[10px] font-black font-serif mt-0.5"
                      style={{ color: currentTheme.headerTitle, fontFamily: computedNameStyle.fontFamily }}
                    >
                      Training & Consulting
                    </p>
                    <p 
                      className="text-[9px] sm:text-[10px] font-black font-serif mt-0.5"
                      style={{ color: currentTheme.headerTitle, fontFamily: computedNameStyle.fontFamily }}
                    >
                      Nagah-TC
                    </p>
                  </div>

                  {/* Center Column: Big Raised Title, absolutely mathematically centered */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-auto select-none">
                    <h2 
                      className="text-lg sm:text-2xl font-black tracking-wide leading-tight drop-shadow-xs whitespace-nowrap"
                      style={{ 
                        color: currentTheme.titleBannerText, 
                        fontFamily: nameFontMode === 'amiri' || nameFontMode === 'aref' ? "'Amiri', serif" : "'Cairo', sans-serif"
                      }}
                    >
                      {certLanguage === 'en' ? (
                        certificateType === 'appreciation' ? 'Certificate of Appreciation' :
                        certificateType === 'achievement' ? 'Certificate of Completion' :
                        'Medal of Excellence'
                      ) : (
                        certificateType === 'appreciation' ? 'شهادة تقدير' :
                        certificateType === 'achievement' ? 'شهادة' :
                        'وسام تميز'
                      )}
                    </h2>
                    <p 
                      className="text-[10px] sm:text-[11px] font-mono tracking-widest font-black uppercase opacity-90 mt-0.5"
                      style={{ color: currentTheme.titleSubText }}
                    >
                      {certificateType === 'appreciation' ? 'CERTIFICATE OF APPRECIATION' :
                       certificateType === 'achievement' ? 'CERTIFICATE OF COMPLETION' :
                       'HONORARY BADGE OF EXCELLENCE'}
                    </p>
                  </div>

                  {/* Left Column: Circular Seal Logo, pushed to extreme left */}
                  <div className="flex justify-end pl-1 select-none">
                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white shadow-md border-2"
                      style={{ borderColor: currentTheme.borderColor }}
                    >
                      <img 
                        src={centerLogo} 
                        alt="النجاح للتدريب والاستشارات" 
                        className="w-full h-full object-contain"
                        onError={handleLogoError}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. CERTIFICATE BODY & RECIPIENT SECTION */}
                <div className="relative z-10 text-center space-y-1 my-0.5 px-2">
                  <p 
                    className="font-bold text-xs sm:text-sm"
                    style={{ color: currentTheme.introText }}
                  >
                    {certLanguage === 'en' ? (
                      certificateType === 'appreciation' ? 'Nagah for Training & Consulting proudly presents this certificate of appreciation to:' :
                      certificateType === 'achievement' ? 'Nagah for Training & Consulting hereby certifies that the participant:' :
                      'Nagah for Training & Consulting proudly awards the Medal of Excellence to:'
                    ) : (
                      certificateType === 'appreciation' ? 'تتقدم إدارة النجاح للتدريب والاستشارات بخالص الشكر والتقدير إلى المتدرب:' :
                      certificateType === 'achievement' ? 'تشهد النجاح للتدريب والاستشارات أن المشارك قد اجتاز بنجاح الدورة التدريبية:' :
                      'تمنح إدارة النجاح للتدريب والاستشارات وسام التميز والتفوق الملكي إلى المتدرب:'
                    )}
                  </p>

                  {/* Trainee Name Calligraphy Banner with Smart Auto-Containment */}
                  <div className="flex items-center justify-center gap-3 py-0.5 my-0.5">
                    {showTraineePhoto && currentTrainee?.photoUrl && (
                      <img
                        src={currentTrainee.photoUrl}
                        alt={currentTrainee.fullName}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 shadow-md ring-2 ring-amber-400/40 shrink-0"
                        style={{ borderColor: currentTheme.borderColor }}
                      />
                    )}
                    
                    <div className="min-w-0 max-w-2xl px-2">
                      <div className="relative inline-flex items-center justify-center flex-wrap gap-1">
                        {showFlourishes && (
                          <span 
                            className="text-base sm:text-xl select-none font-serif shrink-0"
                            style={{ color: currentTheme.nameFlourishColor }}
                          >
                            ❖ ───
                          </span>
                        )}

                        {/* Student Name Header with Dynamic Scaling */}
                        <h2 
                          className="font-black tracking-normal px-2 text-center break-words max-w-full"
                          style={computedNameStyle}
                        >
                          {certLanguage === 'en' ? (englishTraineeName || 'Distinguished Trainee') : (currentTrainee?.fullName || 'اسم المتدرب المتميز')}
                        </h2>

                        {showFlourishes && (
                          <span 
                            className="text-base sm:text-xl select-none font-serif shrink-0"
                            style={{ color: currentTheme.nameFlourishColor }}
                          >
                            ─── ❖
                          </span>
                        )}
                      </div>

                      {/* Trainee Code & Group Badges */}
                      <div className="mt-0.5 flex items-center justify-center gap-2 flex-wrap">
                        <span 
                          className={`font-mono text-[10px] sm:text-xs font-black px-3 py-0.5 rounded-full border shadow-2xs ${currentTheme.codeTagBg}`}
                        >
                          {certLanguage === 'en' ? 'Trainee ID' : 'كود المتدرب'}: {currentTrainee?.code || '—'}
                        </span>
                        {targetGroup && (
                          <span 
                            className={`text-[10px] sm:text-xs font-bold px-3 py-0.5 rounded-full border shadow-2xs ${currentTheme.groupTagBg}`}
                          >
                            {certLanguage === 'en' ? 'Group' : 'المجموعة'}: {targetGroup.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason of Honor / Praise Sentence */}
                  <p 
                    className="text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-normal pt-0.5"
                    style={{ color: currentTheme.praiseText }}
                  >
                    {certLanguage === 'en' ? (
                      customPraise === 'تقديراً لتفوقه الاستثنائي، وحضوره المبكر، وتفاعله النموذجي وإتقانه للتطبيقات العملية'
                        ? 'In recognition of outstanding performance, active participation, and exemplary dedication to practical training'
                        : customPraise
                    ) : customPraise} {certLanguage === 'en' ? 'on being awarded:' : 'بمناسبة حصوله على استحقاق:'}
                  </p>

                  {/* Award Title Ribbon */}
                  <div className="inline-block mt-4 mb-6">
                    <div 
                      className={`px-4 sm:px-6 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-sm border flex items-center justify-center gap-2 ${currentTheme.awardRibbonBg}`}
                      style={{ borderColor: currentTheme.awardRibbonBorder }}
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      <span>{certLanguage === 'en' ? englishAwardTitle : awardTitle}</span>
                      <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                    </div>
                  </div>

                  {/* Sleek Integrated Info Bar (Course + Lecture + Stars + Points in One Compact Card) */}
                  <div 
                    className="border rounded-2xl p-2.5 max-w-xl mx-auto shadow-2xs text-xs space-y-1 mt-6"
                    style={{ 
                      backgroundColor: currentTheme.infoCardBg, 
                      borderColor: currentTheme.infoCardBorder 
                    }}
                  >
                    <div className="flex items-center justify-between font-bold flex-wrap gap-1">
                      <span style={{ color: currentTheme.infoCardLabel }}>
                        {certLanguage === 'en' ? 'Training Course:' : 'الدورة التدريبية:'}
                      </span>
                      <span className="font-black text-sm" style={{ color: currentTheme.infoCardText }}>
                        {currentCourse?.name || 'برنامج التدريب العملي'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-dashed border-amber-300/40 flex-wrap gap-1">
                      <span style={{ color: currentTheme.infoCardSub }}>
                        {certLanguage === 'en' ? 'Lecture:' : 'المحاضرة:'} <b style={{ color: currentTheme.infoCardText }}>{lectureTitle}</b>
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: starsCount }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                        {/* Points Badge */}
                        <span 
                          className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-lg border shadow-2xs ${currentTheme.pointsBadgeBg}`}
                        >
                          +{pointsEarned} {certLanguage === 'en' ? 'Points' : 'نقطة'} ⚡
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CERTIFICATE FOOTER: SIGNATURES & QR CODE (Clean & Centered Alignment) */}
                <div 
                  className="relative z-10 grid grid-cols-3 gap-2 pt-2.5 sm:pt-3 border-t-2 items-end text-center" 
                  style={{ borderColor: currentTheme.footerBorder }}
                >
                  
                  {/* Right Side: Trainer Signature ("المدرب") */}
                  <div className="space-y-1 text-center flex flex-col items-center justify-center">
                    <span 
                      className="text-[10px] sm:text-xs font-bold block text-center"
                      style={{ color: currentTheme.footerLabel }}
                    >
                      {certLanguage === 'en' ? 'Trainer' : 'المدرب'}
                    </span>
                    <p 
                      className="font-black text-xs sm:text-sm text-center font-serif"
                      style={{ color: currentTheme.footerSign }}
                    >
                      {certLanguage === 'en' ? 'Course Instructor' : trainerName}
                    </p>
                    {settings?.trainerSignatureUrl ? (
                      <img 
                        src={settings.trainerSignatureUrl} 
                        alt="توقيع المدرب" 
                        className="w-20 h-8 sm:w-24 sm:h-9 object-contain mx-auto" 
                      />
                    ) : (
                      <div className="w-24 sm:w-28 border-b border-slate-300 pt-3 mx-auto" />
                    )}
                  </div>

                  {/* Center: QR Code with Serial Code & Date Underneath */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {qrCodeDataUrl ? (
                      <div 
                        className="p-1 rounded-xl border shadow-xs bg-white"
                        style={{ borderColor: currentTheme.qrBorder }}
                      >
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <QrIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="text-[9px] font-mono font-bold text-center space-y-0.5" style={{ color: currentTheme.footerLabel }}>
                      <div>{certLanguage === 'en' ? 'ID' : 'كود'}: <span className="underline">{serialNumber}</span></div>
                      <div>{certLanguage === 'en' ? 'Date' : 'تاريخ'}: {lectureDate}</div>
                    </div>
                  </div>

                  {/* Left Side: Director Signature ("يعتمد") - Centered over Manager Name */}
                  <div className="space-y-1 text-center flex flex-col items-center justify-center">
                    <span 
                      className="text-[10px] sm:text-xs font-bold block text-center"
                      style={{ color: currentTheme.footerLabel }}
                    >
                      {certLanguage === 'en' ? 'Approved by' : 'يعتمد'}
                    </span>
                    <p 
                      className="font-black text-xs sm:text-sm text-center"
                      style={{ color: currentTheme.footerSign }}
                    >
                      {certLanguage === 'en' ? 'Dr. M. Ramadan Bkeet' : managerName}
                    </p>
                    {settings?.signatureImageUrl ? (
                      <img 
                        src={settings.signatureImageUrl} 
                        alt="توقيع الإدارة" 
                        className="w-20 h-8 sm:w-24 sm:h-9 object-contain mx-auto" 
                        style={{ mixBlendMode: currentTheme.isDark ? 'normal' : 'multiply' }} 
                      />
                    ) : (
                      <div className="w-24 sm:w-28 border-b border-slate-300 pt-3 mx-auto" />
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
