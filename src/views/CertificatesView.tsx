import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import {
  Award,
  Plus,
  Printer,
  QrCode,
  Search,
  CheckCircle,
  X,
  ExternalLink,
  ShieldCheck,
  LayoutTemplate,
  Palette,
  Sparkles,
  Check,
  Settings,
  Eye,
  FileCheck,
  Trash2,
  Layers,
  Crown,
  Star
} from 'lucide-react';
import { Certificate, CertificateTemplate, Trainee, Course, Trainer } from '../types';
import { CertificateTemplateBuilderModal } from '../components/CertificateTemplateBuilderModal';
import { LectureExcellenceCertificateModal } from '../components/LectureExcellenceCertificateModal';

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

export const CertificatesView: React.FC = () => {
  const { 
    branches, 
    activeBranchId, 
    showToast, 
    setPrintData, 
    refreshKey,
    trainees: ctxTrainees,
    courses: ctxCourses,
    trainers: ctxTrainers
  } = useCenter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>(() => ctxTrainees || []);
  const [courses, setCourses] = useState<Course[]>(() => ctxCourses || []);
  const [trainers, setTrainers] = useState<Trainer[]>(() => ctxTrainers || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ctxTrainees && ctxTrainees.length > 0) setTrainees(ctxTrainees);
  }, [ctxTrainees]);

  useEffect(() => {
    if (ctxCourses && ctxCourses.length > 0) setCourses(ctxCourses);
  }, [ctxCourses]);

  useEffect(() => {
    if (ctxTrainers && ctxTrainers.length > 0) setTrainers(ctxTrainers);
  }, [ctxTrainers]);
  const [activeTab, setActiveTab] = useState<'certificates' | 'templates'>('certificates');
  const [certBranchFilter, setCertBranchFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCourseId, setBulkCourseId] = useState('');
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [isVisualBuilderOpen, setIsVisualBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Certificate Issuance Form State
  const [formData, setFormData] = useState<any>({
    traineeId: '',
    courseId: '',
    branchId: '',
    templateId: '',
    grade: 'امتياز مع مرتبة الشرف (A+)',
    issueDate: new Date().toISOString().split('T')[0],
    durationText: '30 ساعة تدريبية معتمدة',
    trainerName: 'المدرب المعتمد',
    managerName: 'د. محمد رمضان بخيت'
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState<Partial<CertificateTemplate>>({
    name: 'نموذج التميز الإداري',
    theme: 'classic_gold',
    primaryColor: '#d97706',
    accentColor: '#b45309',
    titleArabic: 'شهادة إتمام برنامج تدريبي وتفوق',
    titleEnglish: 'CERTIFICATE OF PROFESSIONAL ACHIEVEMENT',
    subTitleArabic: 'يشهد مركز النجاح للتدريب والاستشارات بأن المتدرب قد أتم بنجاح متطلبات البرنامج التدريبي',
    bodyTemplate: 'وقد اجتاز الاختبارات والتقييمات العملية بكفاءة وتفوق عاليين متمنين له دوام التوفيق والنجاح.',
    sealText: 'الختم الرسمي المعتمد',
    managerTitle: 'مدير عام المركز',
    managerName: 'د. محمد رمضان بخيت',
    trainerTitle: 'المدرب المعتمد',
    showQrCode: true,
    borderStyle: 'double',
    isDefault: false
  });

  useEffect(() => {
    loadData();
  }, [activeBranchId, refreshKey]);

  
  const handleSaveVisualTemplate = async (template: CertificateTemplate) => {
    try {
      if (editingTemplate) {
        // update (simulated or real api)
        await api.updateCertificateTemplate(template.id, template);
        showToast('تم تحديث القالب بنجاح', 'success');
      } else {
        await api.createCertificateTemplate(template);
        showToast('تم حفظ القالب بنجاح', 'success');
      }
      setIsVisualBuilderOpen(false);
      setEditingTemplate(undefined);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ القالب', 'error');
    }
  };

  
  const handleBulkIssue = async () => {
    if (!bulkCourseId || !formData.templateId) {
      showToast('يرجى تحديد الدورة التدريبية واختيار القالب', 'warning');
      return;
    }
    const eligibleTrainees = trainees.filter(t => t.courseId === bulkCourseId && t.status === 'completed');
    if (eligibleTrainees.length === 0) {
      showToast('لا يوجد طلاب خريجين (مكتملين) في هذه الدورة', 'error');
      return;
    }

    try {
      let count = 0;
      const course = courses.find(c => c.id === bulkCourseId);
      const courseCode = course?.code || (course?.name ? course.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'ICT4');
      for (const t of eligibleTrainees) {
        // Prevent duplicate certs
        if (!certificates.find(c => c.traineeId === t.id && c.courseId === bulkCourseId)) {
          const traineeCode = t.code || 'C001';
          const countExistingInCourse = certificates.filter(
            (c) => c.traineeId === t.id && c.courseId === bulkCourseId
          ).length;
          const nextNumber = countExistingInCourse + 1;
          const serial = `${courseCode}-${traineeCode}-C${nextNumber}`;

          await api.createCertificate({
            ...formData,
            traineeId: t.id,
            courseId: bulkCourseId,
            serialNumber: serial,
            certificateNumber: serial
          });
          count++;
        }
      }
      showToast(`تم إصدار ${count} شهادات مجمعة بنجاح`, 'success');
      setIsBulkModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const loadData = async () => {
    try {
      const [certRes, tmplRes] = await Promise.all([
        api.getCertificates().catch(() => []),
        api.getCertificateTemplates().catch(() => [])
      ]);
      const certList = Array.isArray(certRes) ? certRes : [];
      setCertificates(certList);
      setTemplates(Array.isArray(tmplRes) ? tmplRes : []);

      if (tmplRes && tmplRes.length > 0 && !formData.templateId) {
        const defaultTmpl = tmplRes.find(t => t.isDefault) || tmplRes?.[0];
        if (defaultTmpl?.id) {
          setFormData((prev: any) => ({ ...prev, templateId: defaultTmpl.id }));
        }
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل الشهادات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الشهادة الصادرة نهائياً؟')) return;
    try {
      const res = await api.deleteCertificate(id);
      if (res.success) {
        showToast('تم حذف الشهادة بنجاح 🗑️', 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف الشهادة', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف قالب الشهادة هذا نهائياً؟')) return;
    try {
      const res = await api.deleteCertificateTemplate(id);
      if (res.success) {
        showToast('تم حذف قالب الشهادة بنجاح 🗑️', 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف قالب الشهادة', 'error');
    }
  };

  const handleOpenAdd = () => {
    const defaultTmpl = (templates && templates.length > 0) ? (templates.find(t => t.isDefault) || templates?.[0]) : null;
    const initialCourseId = courses?.[0]?.id || '';
    const course = courses.find(c => c.id === initialCourseId);
    
    let trainerName = 'المدرب المعتمد';
    if (course && course.trainerId) {
      const trainer = trainers.find(t => t.id === course.trainerId);
      if (trainer) {
        const prefix = trainer.prefix || trainer.title;
        const prefixStr = prefix === 'DR' ? 'د. ' : prefix === 'ENG' ? 'م. ' : prefix === 'TR' ? 'المدرب ' : '';
        trainerName = `${prefixStr}${trainer.name}`;
      }
    }

    const eligibleTrainees = trainees.filter(t => t.courseId === initialCourseId || t.courseIds?.includes(initialCourseId));
    const firstTrainee = eligibleTrainees[0];
    const traineeId = firstTrainee ? firstTrainee.id : '';
    const traineeNameEn = firstTrainee ? transliterateArabicToEnglish(firstTrainee.fullName) : '';

    setFormData({
      traineeId,
      courseId: initialCourseId,
      branchId: activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1',
      templateId: defaultTmpl?.id || '',
      grade: 'امتياز مع مرتبة الشرف (A+)',
      issueDate: new Date().toISOString().split('T')[0],
      durationText: '30 ساعة تدريبية معتمدة',
      trainerName,
      managerName: 'د. محمد رمضان بخيت',
      language: 'ar',
      certificateTitle: 'شهادة تقدير',
      certificateTitleEn: 'Certificate of Appreciation',
      traineeNameEn
    });
    setIsAddModalOpen(true);
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    let trainerName = 'المدرب المعتمد';
    if (course && course.trainerId) {
      const trainer = trainers.find(t => t.id === course.trainerId);
      if (trainer) {
        const prefix = trainer.prefix || trainer.title;
        const prefixStr = prefix === 'DR' ? 'د. ' : prefix === 'ENG' ? 'م. ' : prefix === 'TR' ? 'المدرب ' : '';
        trainerName = `${prefixStr}${trainer.name}`;
      }
    }

    const eligibleTrainees = trainees.filter(t => t.courseId === courseId || t.courseIds?.includes(courseId));
    const firstTrainee = eligibleTrainees[0];
    const traineeId = firstTrainee ? firstTrainee.id : '';
    const traineeNameEn = firstTrainee ? transliterateArabicToEnglish(firstTrainee.fullName) : '';

    setFormData((prev: any) => ({
      ...prev,
      courseId,
      trainerName,
      traineeId,
      traineeNameEn
    }));
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.traineeId || !formData.courseId) return;

    try {
      const trainee = trainees.find(t => t.id === formData.traineeId);
      const course = courses.find(c => c.id === formData.courseId);
      const courseCode = course?.code || (course?.name ? course.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'ICT4');
      const traineeCode = trainee?.code || 'C001';

      // Calculate serial number based on existing certificates
      const countExistingInCourse = certificates.filter(
        (c) => c.traineeId === formData.traineeId && c.courseId === formData.courseId
      ).length;
      const nextNumber = countExistingInCourse + 1;
      const serial = `${courseCode}-${traineeCode}-C${nextNumber}`;

      const payload = {
        ...formData,
        traineeName: trainee?.fullName || '',
        courseName: course?.name || '',
        serialNumber: serial,
        certificateNumber: serial
      };

      const res = await api.createCertificate(payload);
      if (res.success) {
        showToast('تم إصدار الشهادة وتوثيقها بالباركود والـ QR بنجاح! 🎓', 'success');
        setIsAddModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إصدار الشهادة', 'error');
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.titleArabic) return;

    try {
      const res = await api.createCertificateTemplate(templateForm);
      if (res.success) {
        showToast(`تم إنشاء نموذج الشهادة (${res.template.name}) بنجاح! 🎨`, 'success');
        setIsAddTemplateModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ النموذج', 'error');
    }
  };

  const handlePrintCert = (c: Certificate) => {
    const certTemplate = templates.find(t => t.id === c.templateId) || templates.find(t => t.isDefault) || templates?.[0];
    const trainee = trainees.find(t => t.id === c.traineeId);
    const course = courses.find(cr => cr.id === c.courseId);

    setPrintData({
      title: `${c.certificateTitle || 'شهادة'} - ${c.traineeName || trainee?.fullName}`,
      type: 'certificate',
      data: {
        certificate: c,
        cert: c,
        template: certTemplate,
        trainee: trainee || { fullName: c.traineeName },
        course: course || { name: c.courseName },
        traineeName: c.traineeName || trainee?.fullName,
        courseName: c.courseName || course?.name,
        grade: c.grade,
        serialNumber: c.serialNumber || c.certificateNumber,
        issueDate: c.issueDate,
        branchName: branches.find(b => b.id === c.branchId)?.name || 'مركز النجاح للتدريب والاستشارات'
      }
    });
  };

  const handlePreviewBeforeIssue = () => {
    if (!formData.traineeId || !formData.courseId) {
      showToast('يرجى تحديد المتدرب والدورة التدريبية للمعاينة', 'error');
      return;
    }

    const trainee = trainees.find(t => t.id === formData.traineeId);
    const course = courses.find(cr => cr.id === formData.courseId);
    const certTemplate = templates.find(t => t.id === formData.templateId) || templates.find(t => t.isDefault) || templates?.[0];

    const mockCert: Certificate = {
      id: 'preview-temp',
      certificateNumber: 'CERT-PREVIEW-00000',
      serialNumber: 'CERT-PREVIEW-00000',
      traineeId: formData.traineeId,
      traineeName: trainee?.fullName || 'اسم المتدرب التجريبي',
      courseId: formData.courseId,
      courseName: course?.name || 'اسم الدورة التدريبية التجريبية',
      branchId: formData.branchId || trainee?.branchId || 'branch-1',
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      grade: formData.grade || 'امتياز مع مرتبة الشرف (A+)',
      durationText: formData.durationText || '30 ساعة تدريبية معتمدة',
      qrPayload: JSON.stringify({
        certificateNumber: 'CERT-PREVIEW-00000',
        traineeName: trainee?.fullName || 'اسم المتدرب التجريبي',
        courseName: course?.name || 'اسم الدورة التدريبية التجريبية',
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        center: 'مركز النجاح للتدريب والاستشارات'
      }),
      trainerName: formData.trainerName || 'المدرب المعتمد',
      managerName: formData.managerName || 'د. محمد رمضان بخيت',
      templateId: formData.templateId || undefined,
      certificateTitle: formData.certificateTitle || 'شهادة تقدير',
      certificateTitleEn: formData.certificateTitleEn || 'Certificate of Appreciation',
      traineeNameEn: formData.traineeNameEn || '',
      language: formData.language || 'ar'
    };

    setPrintData({
      title: `معاينة شهادة - ${mockCert.traineeName}`,
      type: 'certificate',
      data: {
        certificate: mockCert,
        cert: mockCert,
        template: certTemplate,
        trainee: trainee || { fullName: mockCert.traineeName },
        course: course || { name: mockCert.courseName },
        traineeName: mockCert.traineeName,
        courseName: mockCert.courseName,
        grade: mockCert.grade,
        serialNumber: mockCert.serialNumber,
        issueDate: mockCert.issueDate,
        branchName: branches.find(b => b.id === mockCert.branchId)?.name || 'مركز النجاح للتدريب والاستشارات'
      }
    });
  };

  const filtered = certificates.filter(
    (c) => {
      const matchBranch = certBranchFilter === 'all' || !c.branchId || c.branchId === certBranchFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (c.traineeName || '').toLowerCase().includes(q) ||
        (c.courseName || '').toLowerCase().includes(q) ||
        (c.certificateTitle || '').toLowerCase().includes(q) ||
        (c.serialNumber || c.certificateNumber || '').toLowerCase().includes(q);
      return matchBranch && matchQuery;
    }
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs backdrop-blur-md">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>إدارة نماذج والشهادات المعتمدة (Certificate Studio)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إصدار شهادات التقدير والتفوق في المحاضرات، ونماذج الشهادات المعتمدة بـ QR والباركود الذكي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Lecture Excellence Certificate Button */}
          <button
            onClick={() => setIsLectureModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer ring-2 ring-amber-400/40"
          >
            <Crown className="w-4 h-4 text-slate-950" />
            <span>+ شهادة تفوق في محاضرة 🎖️</span>
          </button>

          <button
            onClick={() => {
              setEditingTemplate(undefined);
              setIsVisualBuilderOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
          >
            <Palette className="w-4 h-4" />
            <span>+ تصميم شهادة مرئي</span>
          </button>

          <button
            onClick={() => setIsAddTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <LayoutTemplate className="w-4 h-4 text-indigo-500" />
            <span>نموذج نصي عادي</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>إصدار شهادة دورة</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>الشهادات الصادرة ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>نماذج وقوالب الشهادات ({templates.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar (Certificates Tab) */}
      {activeTab === 'certificates' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الفرع:</span>
            <button
              onClick={() => setCertBranchFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                certBranchFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              🏢 جميع الفروع ({certificates.length})
            </button>
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setCertBranchFilter(b.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  certBranchFilter === b.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📍 {b.name} ({certificates.filter(c => c.branchId === b.id).length})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث بالرقم المسلسل، اسم الطالب، أو الدورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold whitespace-nowrap">
              {filtered.length} شهادة صادرة
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: Issued Certificates Grid */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
              جاري تحميل سجل الشهادات...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-14 px-6 text-center bg-white dark:bg-slate-900/60 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                لا توجد شهادات صادرة تطابق البحث
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                يمكنك إصدار شهادة تقدير فورية لمتدرب متميز في محاضرة، أو إصدار شهادة دورة تدريبية معتمدة.
              </p>
              
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsLectureModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-105 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>إصدار شهادة تفوق في محاضرة 🎖️</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  إصدار شهادة دورة
                </button>
              </div>
            </div>
          ) : (
            filtered.map((cert) => {
              const tmpl = templates.find((t) => t.id === cert.templateId);
              const isMedal = cert.type === 'excellence' || cert.certificateTitle?.includes('وسام') || cert.grade?.includes('وسام');
              const isLectureCert = isMedal || cert.serialNumber?.includes('STAR') || cert.certificateNumber?.includes('STAR') || cert.grade?.includes('نجم') || cert.grade?.includes('نقطة');

              return (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{cert.serialNumber || cert.certificateNumber}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${
                        isMedal
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs'
                          : isLectureCert
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                            : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                        {isMedal ? '🏅 وسام تميز ملكي' : isLectureCert ? '⭐ تفوق في محاضرة' : 'مصدقة وفعالة 🌟'}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 mt-2">{cert.traineeName}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-bold">{cert.courseName}</p>

                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">التقدير / الاستحقاق:</span>
                        <span className="font-bold text-amber-700 dark:text-amber-300">{cert?.grade || 'امتياز'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">النموذج المستخدم:</span>
                        <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{tmpl?.name || 'النموذج الملكي الذهبي'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">تاريخ الإصدار:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300">{cert.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-amber-500" />
                      QR Verified
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/25 transition-all duration-150 active:scale-90 cursor-pointer"
                        title="حذف الشهادة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintCert(cert)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Certificate Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all relative overflow-hidden"
            >
              {tmpl.isDefault && (
                <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-br-xl shadow-xs">
                  النموذج الافتراضي ⭐
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: tmpl.primaryColor || '#d97706' }}
                  />
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">{tmpl.name}</h3>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center space-y-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold font-mono">
                    {tmpl.theme}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{tmpl.titleArabic}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{tmpl.subTitleArabic}</p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>{tmpl.trainerTitle}: المعتمد</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{tmpl.sealText}</span>
                    <span>{tmpl.managerTitle}: {tmpl.managerName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">إطار {tmpl.borderStyle}</span>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => handleDeleteTemplate(tmpl.id)}
                    className="text-[10px] bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded-lg shadow-2xs transition-all duration-150 flex items-center gap-1 active:scale-95 cursor-pointer"
                    title="حذف نموذج الشهادة"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                  {tmpl.isCustomVisual && (
                    <button
                      onClick={() => {
                        setEditingTemplate(tmpl);
                        setIsVisualBuilderOpen(true);
                      }}
                      className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 text-slate-800 dark:text-white px-2 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Palette className="w-3 h-3" />
                      تعديل
                    </button>
                  )}
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {tmpl.showQrCode ? '✓ يدعم الـ QR' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Issue Course Certificate */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="shrink-0 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm">إصدار وتوثيق شهادة دورة معتمدة</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الدورة التدريبية المجتازة *</label>
                <select
                  value={formData.courseId ?? ''}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.hoursCount} ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اختر المتدرب *</label>
                <select
                  value={formData.traineeId ?? ''}
                  onChange={(e) => {
                    const tid = e.target.value;
                    const tr = trainees.find(t => t.id === tid);
                    setFormData({
                      ...formData,
                      traineeId: tid,
                      traineeNameEn: tr ? transliterateArabicToEnglish(tr.fullName) : ''
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {trainees
                    .filter(t => !formData.courseId || t.courseId === formData.courseId || t.courseIds?.includes(formData.courseId))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.code}) - {t.phone}
                      </option>
                    ))
                  }
                  {trainees.filter(t => !formData.courseId || t.courseId === formData.courseId || t.courseIds?.includes(formData.courseId)).length === 0 && (
                    <option value="">لا يوجد متدربين في هذه الدورة</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نموذج وتصميم الشهادة *</label>
                <select
                  value={formData.templateId ?? ''}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.theme})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">لغة الشهادة</label>
                  <select
                    value={formData.language ?? 'ar'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">الإنجليزية (English)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نوع ومسمى الشهادة</label>
                  <select
                    value={formData.certificateTitle ?? 'شهادة تقدير'}
                    onChange={(e) => {
                      const title = e.target.value;
                      let titleEn = 'Certificate of Appreciation';
                      if (title === 'وسام تميز') titleEn = 'Medal of Excellence';
                      else if (title === 'شهادة إتمام دورة') titleEn = 'Certificate of Course Completion';
                      else if (title === 'شهادة') titleEn = 'Certificate';
                      setFormData({
                        ...formData,
                        certificateTitle: title,
                        certificateTitleEn: titleEn
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="شهادة تقدير">شهادة تقدير (Appreciation)</option>
                    <option value="وسام تميز">وسام تميز (Medal of Excellence)</option>
                    <option value="شهادة إتمام دورة">شهادة إتمام دورة (Completion)</option>
                    <option value="شهادة">شهادة (Certificate)</option>
                  </select>
                </div>
              </div>

              {formData.language === 'en' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <div>
                    <label className="block text-indigo-900 dark:text-indigo-300 font-bold mb-1">اسم المتدرب بالإنجليزية *</label>
                    <input
                      type="text"
                      required={formData.language === 'en'}
                      value={formData.traineeNameEn ?? ''}
                      onChange={(e) => setFormData({ ...formData, traineeNameEn: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                      placeholder="English Trainee Name"
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-900 dark:text-indigo-300 font-bold mb-1">مسمى الشهادة بالإنجليزية *</label>
                    <input
                      type="text"
                      required={formData.language === 'en'}
                      value={formData.certificateTitleEn ?? ''}
                      onChange={(e) => setFormData({ ...formData, certificateTitleEn: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                      placeholder="Certificate Title English"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">التقدير العام</label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="امتياز مع مرتبة الشرف (A+)">امتياز مع مرتبة الشرف (A+)</option>
                    <option value="ممتاز (Excellent - A)">ممتاز (Excellent - A)</option>
                    <option value="جيد جداً مرتفع (Very Good - B+)">جيد جداً مرتفع (Very Good - B+)</option>
                    <option value="جيد جداً (Very Good - B)">جيد جداً (Very Good - B)</option>
                    <option value="جيد (Good - C)">جيد (Good - C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ التوثيق والإصدار</label>
                  <input
                    type="date"
                    value={formData.issueDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم مدرب الدورة</label>
                  <input
                    type="text"
                    value={formData.trainerName ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم مدير عام المركز</label>
                  <input
                    type="text"
                    value={formData.managerName ?? ''}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handlePreviewBeforeIssue}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة ومراجعة</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md text-xs cursor-pointer"
                >
                  تأكيد وإصدار الشهادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Visual Certificate Template Builder */}
      <CertificateTemplateBuilderModal
        isOpen={isVisualBuilderOpen}
        onClose={() => {
          setIsVisualBuilderOpen(false);
          setEditingTemplate(undefined);
        }}
        onSave={handleSaveVisualTemplate}
        initialTemplate={editingTemplate}
      />

      {/* MODAL: Create Certificate Template */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="shrink-0 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm">تصميم نموذج شهادة جديد</h3>
              </div>
              <button onClick={() => setIsAddTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم النموذج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: النموذج الألماسي الفاخر"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الطابع الفني (Theme)</label>
                  <select
                    value={templateForm.theme}
                    onChange={(e) => setTemplateForm({ ...templateForm, theme: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="classic_gold">الملكي الذهبي (Royal Gold)</option>
                    <option value="modern_tech">التقني الحديث (Modern Tech)</option>
                    <option value="royal_emerald">الأكاديمي الزمردي (Royal Emerald)</option>
                    <option value="diamond_blue">الماسي الأزرق (Diamond Blue)</option>
                    <option value="custom_uploaded">قالب مخصص بخلفية (Custom)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">عنوان الشهادة الرئيسي بالعربية *</label>
                <input
                  type="text"
                  required
                  value={templateForm.titleArabic}
                  onChange={(e) => setTemplateForm({ ...templateForm, titleArabic: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">العنوان بالإنجليزية (Sub Title English)</label>
                <input
                  type="text"
                  value={templateForm.titleEnglish}
                  onChange={(e) => setTemplateForm({ ...templateForm, titleEnglish: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نص الاعتماد والافتتاحية</label>
                <textarea
                  rows={2}
                  value={templateForm.subTitleArabic}
                  onChange={(e) => setTemplateForm({ ...templateForm, subTitleArabic: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نص الختم المعتمد</label>
                  <input
                    type="text"
                    value={templateForm.sealText}
                    onChange={(e) => setTemplateForm({ ...templateForm, sealText: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نمط الإطار</label>
                  <select
                    value={templateForm.borderStyle}
                    onChange={(e) => setTemplateForm({ ...templateForm, borderStyle: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="double">إطار ذهبي مزدوج (Double)</option>
                    <option value="solid">إطار متصل عريض (Solid)</option>
                    <option value="ornate">زخرفي ملكي (Ornate)</option>
                    <option value="minimal">بسيط وبدون حواف (Minimal)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  حفظ النموذج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED LUXURY LECTURE EXCELLENCE CERTIFICATE MODAL */}
      <LectureExcellenceCertificateModal
        isOpen={isLectureModalOpen}
        onClose={() => setIsLectureModalOpen(false)}
        onCertificateIssued={() => loadData()}
      />
    </div>
  );
};
