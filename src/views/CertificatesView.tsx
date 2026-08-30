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
  Trash2, Layers } from 'lucide-react';
import { Certificate, CertificateTemplate, Trainee, Course } from '../types';
import { CertificateTemplateBuilderModal } from '../components/CertificateTemplateBuilderModal';

export const CertificatesView: React.FC = () => {
  const { branches, activeBranchId, showToast, setPrintData, refreshKey } = useCenter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certificates' | 'templates'>('certificates');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      for (const t of eligibleTrainees) {
        // Prevent duplicate certs
        if (!certificates.find(c => c.traineeId === t.id && c.courseId === bulkCourseId)) {
          await api.createCertificate({
            ...formData,
            traineeId: t.id,
            courseId: bulkCourseId,
            serialNumber: 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + count
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
    setIsLoading(true);
    try {
      const [certRes, tmplRes, tRes, cRes] = await Promise.all([
        api.getCertificates(),
        api.getCertificateTemplates(),
        api.getTrainees(),
        api.getCourses()
      ]);
      const filtered = activeBranchId !== 'all' ? certRes.filter(c => c.branchId === activeBranchId) : certRes;
      setCertificates(filtered);
      setTemplates(tmplRes || []);
      setTrainees(tRes);
      setCourses(cRes);

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
    setFormData({
      traineeId: trainees?.[0]?.id || '',
      courseId: courses?.[0]?.id || '',
      branchId: activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1',
      templateId: defaultTmpl?.id || '',
      grade: 'امتياز مع مرتبة الشرف (A+)',
      issueDate: new Date().toISOString().split('T')[0],
      durationText: '30 ساعة تدريبية معتمدة',
      trainerName: 'المدرب المعتمد',
      managerName: 'د. محمد رمضان بخيت'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.traineeId || !formData.courseId) return;

    try {
      const res = await api.createCertificate(formData);
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
      title: `شهادة إتمام وتفوق - ${c.traineeName || trainee?.fullName}`,
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
      templateId: formData.templateId || undefined
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
    (c) =>
      (c.traineeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.courseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.serialNumber || c.certificateNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            إدارة نماذج والشهادات المعتمدة (Certificate Studio)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص نماذج الشهادات (Royal Gold, Modern Tech, Academic)، إصدار وتوثيق الشهادات بـ QR والباركود
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingTemplate(undefined);
              setIsVisualBuilderOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all animate-pulse shadow-indigo-500/20"
          >
            <Palette className="w-4 h-4" />
            <span>+ تصميم شهادة احترافي (مرئي)</span>
          </button>
          <button
            onClick={() => setIsAddTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-xs shadow transition-all"
          >
            <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            <span>نموذج نصي عادي</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار شهادة معتمدة</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'certificates'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>الشهادات الصادرة ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>نماذج وقوالب الشهادات ({templates.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar (Certificates Tab) */}
      {activeTab === 'certificates' && (
        <div className="flex items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالرقم المسلسل، اسم المتدرب، أو اسم الدورة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} شهادة
          </span>
        </div>
      )}

      {/* TAB 1: Issued Certificates Grid */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              جاري تحميل سجل الشهادات...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700">
              <Award className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="font-bold text-sm">لا توجد شهادات صادرة تطابق البحث</p>
              <p className="text-xs text-slate-400 mt-1">
                اضغط على زر "إصدار شهادة معتمدة" لإصدار أول شهادة رسمية
              </p>
            </div>
          ) : (
            filtered.map((cert) => {
              const tmpl = templates.find((t) => t.id === cert.templateId);

              return (
                <div
                  key={cert.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-amber-500/50 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{cert.serialNumber || cert.certificateNumber}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                        مصدقة وفعالة 🌟
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-100 mt-2">{cert.traineeName}</h3>
                    <p className="text-xs text-amber-300 font-semibold">{cert.courseName}</p>

                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">التقدير العام:</span>
                        <span className="font-bold text-amber-300">{cert.grade}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">النموذج المستخدم:</span>
                        <span className="text-indigo-300 font-semibold">{tmpl?.name || 'النموذج الملكي الذهبي'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">تاريخ الإصدار:</span>
                        <span className="font-mono text-slate-300">{cert.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      QR Verified
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/25 transition-all duration-150 active:scale-90"
                        title="حذف الشهادة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintCert(cert)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة الشهادة</span>
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
              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-indigo-500/50 transition-all relative overflow-hidden"
            >
              {tmpl.isDefault && (
                <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-br-xl shadow">
                  النموذج الافتراضي ⭐
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow"
                    style={{ backgroundColor: tmpl.primaryColor || '#d97706' }}
                  />
                  <h3 className="font-black text-sm text-slate-100">{tmpl.name}</h3>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/80 text-center space-y-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold font-mono">
                    {tmpl.theme}
                  </span>
                  <h4 className="font-bold text-xs text-slate-100">{tmpl.titleArabic}</h4>
                  <p className="text-[10px] text-slate-400">{tmpl.subTitleArabic}</p>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>{tmpl.trainerTitle}: المعتمد</span>
                    <span className="font-mono text-amber-400">{tmpl.sealText}</span>
                    <span>{tmpl.managerTitle}: {tmpl.managerName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                <span className="text-[11px] text-slate-400">إطار {tmpl.borderStyle}</span>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => handleDeleteTemplate(tmpl.id)}
                    className="text-[10px] bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-2 py-1 rounded shadow-sm transition-all duration-150 flex items-center gap-1 active:scale-95"
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
                      className="text-[10px] bg-slate-700 hover:bg-emerald-600 text-white px-2 py-1 rounded shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Palette className="w-3 h-3" />
                      تعديل
                    </button>
                  )}
                  <span className="text-[11px] text-emerald-400 font-bold">
                    {tmpl.showQrCode ? '✓ يدعم الـ QR' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Issue Certificate */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">إصدار وتوثيق شهادة تدريبية معتمدة</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اختر المتدرب *</label>
                <select
                  value={formData.traineeId ?? ''}
                  onChange={(e) => setFormData({ ...formData, traineeId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {trainees.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.code}) - {t.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الدورة التدريبية المجتازة *</label>
                <select
                  value={formData.courseId ?? ''}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.hoursCount} ساعة)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نموذج وتصميم الشهادة *</label>
                <select
                  value={formData.templateId ?? ''}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
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
                  <label className="block text-slate-300 font-bold mb-1">التقدير العام</label>
                  <select
                    value={formData.grade ?? ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="امتياز مع مرتبة الشرف (A+)">امتياز مع مرتبة الشرف (A+)</option>
                    <option value="ممتاز (Excellent - A)">ممتاز (Excellent - A)</option>
                    <option value="جيد جداً مرتفع (Very Good - B+)">جيد جداً مرتفع (Very Good - B+)</option>
                    <option value="جيد جداً (Very Good - B)">جيد جداً (Very Good - B)</option>
                    <option value="جيد (Good - C)">جيد (Good - C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">تاريخ التوثيق والإصدار</label>
                  <input
                    type="date"
                    value={formData.issueDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم مدرب الدورة</label>
                  <input
                    type="text"
                    value={formData.trainerName ?? ''}
                    onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم مدير عام المركز</label>
                  <input
                    type="text"
                    value={formData.managerName ?? ''}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handlePreviewBeforeIssue}
                  className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة ومراجعة</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg text-xs"
                >
                  تأكيد وإصدار الشهادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">تصميم نموذج شهادة جديد</h3>
              </div>
              <button onClick={() => setIsAddTemplateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم النموذج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: النموذج الألماسي الفاخر"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الطابع الفني (Theme)</label>
                  <select
                    value={templateForm.theme}
                    onChange={(e) => setTemplateForm({ ...templateForm, theme: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
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
                <label className="block text-slate-300 font-bold mb-1">عنوان الشهادة الرئيسي بالعربية *</label>
                <input
                  type="text"
                  required
                  value={templateForm.titleArabic}
                  onChange={(e) => setTemplateForm({ ...templateForm, titleArabic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">العنوان بالإنجليزية (Sub Title English)</label>
                <input
                  type="text"
                  value={templateForm.titleEnglish}
                  onChange={(e) => setTemplateForm({ ...templateForm, titleEnglish: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نص الاعتماد والافتتاحية</label>
                <textarea
                  rows={2}
                  value={templateForm.subTitleArabic}
                  onChange={(e) => setTemplateForm({ ...templateForm, subTitleArabic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نص الختم المعتمد</label>
                  <input
                    type="text"
                    value={templateForm.sealText}
                    onChange={(e) => setTemplateForm({ ...templateForm, sealText: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نمط الإطار</label>
                  <select
                    value={templateForm.borderStyle}
                    onChange={(e) => setTemplateForm({ ...templateForm, borderStyle: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="double">إطار ذهبي مزدوج (Double)</option>
                    <option value="solid">إطار متصل عريض (Solid)</option>
                    <option value="ornate">زخرفي ملكي (Ornate)</option>
                    <option value="minimal">بسيط وبدون حواف (Minimal)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTemplateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg"
                >
                  حفظ النموذج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
