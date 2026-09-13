import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Upload,
  Link as LinkIcon,
  Eye,
  Trash2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  FileUp,
  Download,
  Maximize2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Course, Group, CourseMaterial } from '../types';
import { extractGoogleDriveId, getGoogleDrivePreviewUrl, getGoogleDriveViewUrl } from '../utils/googleDriveHelper';
import { GoogleDriveService } from '../services/googleDrive';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';

interface CourseGroupMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'course' | 'group';
  target: Course | Group;
  parentCourse?: Course | null; // Needed when targetType === 'group' to resolve inherited curriculum
  onUpdated?: (updatedTarget: Course | Group) => void;
}

type TrackTab = 'arabic' | 'languages' | 'all';

export const CourseGroupMaterialsModal: React.FC<CourseGroupMaterialsModalProps> = ({
  isOpen,
  onClose,
  targetType,
  target,
  parentCourse,
  onUpdated
}) => {
  const { showToast } = useCenter();

  // Determine initial track tab based on group track or default to arabic
  const initialTrack: TrackTab = (() => {
    if (targetType === 'group') {
      const g = target as Group;
      if (g.track === 'لغات' || g.track === 'languages') return 'languages';
      return 'arabic';
    }
    return 'arabic';
  })();

  const [activeTab, setActiveTab] = useState<TrackTab>(initialTrack);

  // Link vs Upload mode
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [driveUrlOrId, setDriveUrlOrId] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState('');

  // In-app embedded document/drive previewer state
  const [previewMaterial, setPreviewMaterial] = useState<{
    title: string;
    previewUrl: string;
    isDrive: boolean;
    directDownloadUrl?: string;
  } | null>(null);

  // Keep local target state for instant optimistic updates
  const [currentTarget, setCurrentTarget] = useState<Course | Group>(target);

  useEffect(() => {
    setCurrentTarget(target);
    if (targetType === 'group') {
      const g = target as Group;
      if (g.track === 'لغات' || g.track === 'languages') {
        setActiveTab('languages');
      } else {
        setActiveTab('arabic');
      }
    }
  }, [target, targetType]);

  if (!isOpen) return null;

  const isCourse = targetType === 'course';
  const courseObj = isCourse ? (currentTarget as Course) : parentCourse;
  const groupObj = !isCourse ? (currentTarget as Group) : null;

  // Track name helper
  const getTrackLabel = (track: TrackTab) => {
    if (track === 'arabic') return 'المسار العربي';
    if (track === 'languages') return 'مسار اللغات التجريبي / الدولي';
    return 'المواد العامة والمرفقات';
  };

  // Resolve active curriculum for current track
  // For a Group:
  // 1. Group custom material for this track (group.arabicMaterial / group.languagesMaterial)
  // 2. OR inherited from parentCourse (parentCourse.arabicMaterial / parentCourse.languagesMaterial)
  const getActiveCurriculumForTrack = (track: 'arabic' | 'languages'): {
    material: CourseMaterial | null;
    isInherited: boolean;
  } => {
    if (isCourse) {
      const c = currentTarget as Course;
      if (track === 'arabic') {
        const mat = c.arabicMaterial || c.materials?.find(m => m.track === 'arabic' || m.track === 'عربي' || m.educationType === 'arabic');
        return { material: mat || null, isInherited: false };
      } else {
        const mat = c.languagesMaterial || c.materials?.find(m => m.track === 'languages' || m.track === 'لغات' || m.educationType === 'languages');
        return { material: mat || null, isInherited: false };
      }
    } else {
      const g = currentTarget as Group;
      // Check group-specific override first
      if (track === 'arabic' && g.arabicMaterial) {
        return { material: g.arabicMaterial, isInherited: false };
      }
      if (track === 'languages' && g.languagesMaterial) {
        return { material: g.languagesMaterial, isInherited: false };
      }
      const groupMat = g.materials?.find(m => 
        track === 'arabic' ? (m.track === 'arabic' || m.track === 'عربي') : (m.track === 'languages' || m.track === 'لغات')
      );
      if (groupMat) {
        return { material: groupMat, isInherited: false };
      }

      // Check inherited from parent course!
      if (parentCourse) {
        if (track === 'arabic') {
          const inherited = parentCourse.arabicMaterial || parentCourse.materials?.find(m => m.track === 'arabic' || m.track === 'عربي' || m.educationType === 'arabic');
          if (inherited) return { material: inherited, isInherited: true };
        } else {
          const inherited = parentCourse.languagesMaterial || parentCourse.materials?.find(m => m.track === 'languages' || m.track === 'لغات' || m.educationType === 'languages');
          if (inherited) return { material: inherited, isInherited: true };
        }
      }

      return { material: null, isInherited: false };
    }
  };

  const currentArabicInfo = getActiveCurriculumForTrack('arabic');
  const currentLanguagesInfo = getActiveCurriculumForTrack('languages');

  // Active track info
  const activeTrackCurriculum = activeTab === 'arabic' ? currentArabicInfo : activeTab === 'languages' ? currentLanguagesInfo : null;

  // Handle saving material (either Google Drive link or uploaded file)
  const handleSaveCurriculum = async () => {
    if (activeTab === 'all') {
      showToast('يرجى اختيار إما المسار العربي أو مسار اللغات لربط المنهج المخصص', 'warning');
      return;
    }

    let finalDriveId: string | undefined = undefined;
    let finalFileUrl = '';
    let finalFileName = '';
    let finalFileType: 'pdf' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'gdrive' | 'other' = 'gdrive';
    let finalFileSize = '';

    if (inputMode === 'link') {
      if (!driveUrlOrId.trim()) {
        showToast('يرجى إدخال رابط أو معرّف ملف Google Drive', 'warning');
        return;
      }
      const extractedId = extractGoogleDriveId(driveUrlOrId);
      if (!extractedId) {
        showToast('تعذر التعرف على معرّف Google Drive. يرجى التأكد من نسخ رابط مشاركة صالح من جوجل درايف', 'error');
        return;
      }
      finalDriveId = extractedId;
      finalFileUrl = getGoogleDriveViewUrl(extractedId);
      finalFileName = materialTitle.trim() || `منهج ${activeTab === 'arabic' ? 'عربي' : 'لغات'} - Google Drive`;
      finalFileType = 'gdrive';
      finalFileSize = 'Google Cloud Drive';
    } else {
      if (!selectedFile) {
        showToast('يرجى اختيار ملف المنهج من جهازك أولاً (PDF أو PowerPoint أو Word)', 'warning');
        return;
      }
      
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      finalFileName = selectedFile.name;
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'ppt' || ext === 'pptx') finalFileType = 'ppt';
      else if (ext === 'doc' || ext === 'docx') finalFileType = 'doc';
      else finalFileType = 'pdf';

      finalFileSize = fileSizeMB >= 1024 
        ? (fileSizeMB / 1024).toFixed(2) + ' GB' 
        : fileSizeMB.toFixed(2) + ' MB';
    }

    setIsSubmitting(true);

    try {
      // If local file, upload directly to Google Drive
      if (inputMode === 'upload' && selectedFile) {
        let token = GoogleDriveService.getStoredToken();
        if (!token) {
          showToast('جاري الاتصال بحساب Google لرفع الملف مباشرة إلى Drive وحفظه بأمان...', 'info');
          token = await GoogleDriveService.requestAccessToken();
          if (!token) {
            throw new Error('فشل تسجيل الدخول بحساب Google Drive');
          }
        }
        
        setUploadProgress(0);
        setUploadStatusText('جاري فحص وتجهيز مجلد المناهج في Google Drive...');
        showToast('جاري إنشاء مجلد المناهج ورفع الملف إلى Google Drive...', 'info');
        const folderId = await GoogleDriveService.getOrCreateCurriculumFolder(token);
        
        setUploadStatusText(`جاري رفع الملف إلى Google Drive (${finalFileSize})...`);
        const uploadRes = await GoogleDriveService.uploadFile(
          selectedFile, 
          folderId, 
          token,
          (pct, loaded, total) => {
            setUploadProgress(pct);
            const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
            const totalMB = (total / (1024 * 1024)).toFixed(1);
            setUploadStatusText(`جاري رفع الملف إلى Google Drive: ${pct}% (${loadedMB} MB من ${totalMB} MB)...`);
          }
        );
        
        if (!uploadRes.success || !uploadRes.fileId) {
          throw new Error('فشل رفع الملف إلى Google Drive. يرجى التحقق من اتصال الإنترنت وحساب Google الخاص بك.');
        }
        
        finalDriveId = uploadRes.fileId;
        finalFileUrl = getGoogleDriveViewUrl(uploadRes.fileId);
      }

      const newMaterial: CourseMaterial = {
        id: 'mat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: materialTitle.trim() || (inputMode === 'link' ? `منهج ${getTrackLabel(activeTab)}` : finalFileName),
        fileName: finalFileName,
        fileUrl: finalFileUrl,
        fileType: finalFileType,
        fileSize: finalFileSize,
        uploadedAt: new Date().toISOString(),
        description: materialDesc.trim() || undefined,
        track: activeTab === 'arabic' ? 'arabic' : 'languages',
        educationType: activeTab === 'arabic' ? 'arabic' : 'languages',
        driveFileId: finalDriveId,
        drivePreviewUrl: finalDriveId ? getGoogleDrivePreviewUrl(finalDriveId) : undefined,
        isGoogleDrive: !!finalDriveId,
        courseId: isCourse ? currentTarget.id : (currentTarget as Group).courseId,
        groupId: !isCourse ? currentTarget.id : undefined,
        groupName: !isCourse ? (currentTarget as Group).name : undefined
      };

      if (isCourse) {
        const c = currentTarget as Course;
        const updatedCourse: Course = {
          ...c,
          materials: [newMaterial, ...(c.materials || []).filter(m => m.track !== activeTab && m.track !== (activeTab === 'arabic' ? 'عربي' : 'لغات'))],
          arabicMaterial: activeTab === 'arabic' ? newMaterial : c.arabicMaterial,
          languagesMaterial: activeTab === 'languages' ? newMaterial : c.languagesMaterial
        };

        // Persist to backend
        try {
          await api.updateCourse(c.id, updatedCourse);
        } catch (e) {
          console.warn('[MaterialsModal] updateCourse fallback:', e);
        }

        setCurrentTarget(updatedCourse);
        if (onUpdated) onUpdated(updatedCourse);

        showToast(` تم ربط منهج ${getTrackLabel(activeTab)} بنجاح! سينعكس تلقائياً على كل مجموعات هذا المسار.`, 'success');
      } else {
        const g = currentTarget as Group;
        const updatedGroup: Group = {
          ...g,
          materials: [newMaterial, ...(g.materials || []).filter(m => m.track !== activeTab && m.track !== (activeTab === 'arabic' ? 'عربي' : 'لغات'))],
          arabicMaterial: activeTab === 'arabic' ? newMaterial : g.arabicMaterial,
          languagesMaterial: activeTab === 'languages' ? newMaterial : g.languagesMaterial
        };

        // Persist to backend
        try {
          await api.updateGroup(g.id, updatedGroup);
        } catch (e) {
          console.warn('[MaterialsModal] updateGroup fallback:', e);
        }

        setCurrentTarget(updatedGroup);
        if (onUpdated) onUpdated(updatedGroup);

        showToast(` تم تخصيص وربط منهج ${getTrackLabel(activeTab)} لمجموعة "${g.name}" بنجاح!`, 'success');
      }

      // Reset input fields
      setDriveUrlOrId('');
      setMaterialTitle('');
      setMaterialDesc('');
      setSelectedFile(null);
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المنهج', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
      setUploadStatusText('');
    }
  };

  // Remove curriculum
  const handleRemoveCurriculum = async (track: 'arabic' | 'languages') => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في إزالة منهج ${getTrackLabel(track)}؟`)) return;

    if (isCourse) {
      const c = currentTarget as Course;
      const updatedCourse: Course = {
        ...c,
        materials: (c.materials || []).filter(m => m.track !== track && m.track !== (track === 'arabic' ? 'عربي' : 'لغات')),
        arabicMaterial: track === 'arabic' ? undefined : c.arabicMaterial,
        languagesMaterial: track === 'languages' ? undefined : c.languagesMaterial
      };

      try {
        await api.updateCourse(c.id, updatedCourse);
      } catch {}

      setCurrentTarget(updatedCourse);
      if (onUpdated) onUpdated(updatedCourse);
      showToast(`تم إزالة منهج ${getTrackLabel(track)} من الدورة`, 'info');
    } else {
      const g = currentTarget as Group;
      const updatedGroup: Group = {
        ...g,
        materials: (g.materials || []).filter(m => m.track !== track && m.track !== (track === 'arabic' ? 'عربي' : 'لغات')),
        arabicMaterial: track === 'arabic' ? undefined : g.arabicMaterial,
        languagesMaterial: track === 'languages' ? undefined : g.languagesMaterial
      };

      try {
        await api.updateGroup(g.id, updatedGroup);
      } catch {}

      setCurrentTarget(updatedGroup);
      if (onUpdated) onUpdated(updatedGroup);
      showToast(`تم إزالة التخصيص الخاص للمجموعة؛ ستعتمد الآن على منهج الدورة الرئيسي تلقائياً.`, 'info');
    }
  };

  // Open preview dialog
  const handleOpenPreview = (material: CourseMaterial) => {
    if (material.driveFileId) {
      setPreviewMaterial({
        title: material.title,
        previewUrl: getGoogleDrivePreviewUrl(material.driveFileId),
        isDrive: true,
        directDownloadUrl: getGoogleDriveViewUrl(material.driveFileId)
      });
    } else if (material.fileUrl) {
      setPreviewMaterial({
        title: material.title,
        previewUrl: material.fileUrl,
        isDrive: false,
        directDownloadUrl: material.fileUrl
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-hidden">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl max-w-3xl w-full text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Modal Header */}
          <div className="shrink-0 p-4 sm:p-5 flex items-start justify-between border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-white">
                    إدارة مناهج ومذكرات {isCourse ? 'الدورة' : 'المجموعة'} (Google Drive)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {isCourse ? 'على مستوى الدورة' : 'على مستوى المجموعة'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isCourse ? (
                    <>الدورة: <span className="text-emerald-300 font-bold">{(currentTarget as Course).name}</span> (كود: {(currentTarget as Course).code})</>
                  ) : (
                    <>المجموعة: <span className="text-emerald-300 font-bold">{(currentTarget as Group).name}</span> {parentCourse && <>| الدورة: <span className="text-amber-300 font-bold">{parentCourse.name}</span></>}</>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">

            {/* Smart Track Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('arabic')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'arabic'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>🇪🇬 منهج المسار العربي</span>
                {currentArabicInfo.material && (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                )}
                {currentArabicInfo.isInherited && (
                  <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">موروث</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('languages')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'languages'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>🌐 منهج مسار اللغات (تجريبي / دولي)</span>
                {currentLanguagesInfo.material && (
                  <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                )}
                {currentLanguagesInfo.isInherited && (
                  <span className="text-[10px] bg-blue-900/80 px-1.5 py-0.5 rounded text-blue-200">موروث</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>كل المواد</span>
              </button>
            </div>

            {/* If viewed in Group mode: Notification about inheritance */}
            {!isCourse && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">ميزة الربط التلقائي والوراثة الذكية:</span>
                  مناهج الدورة الرئيسية ترتبط تلقائياً بمجموعات المسار المقابل (عربي / لغات). رفع المنهج مرة واحدة في الدورة يجعله متاحاً فورياً لكافة الطلاب والمدربين في المجموعة، ويمكنك أيضاً تخصيص منهج منفصل لهذه المجموعة إذا رغبت.
                </div>
              </div>
            )}

            {/* Active Track Status Card */}
            {(activeTab === 'arabic' || activeTab === 'languages') && (
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      المنهج النشط لـ {getTrackLabel(activeTab)}:
                    </span>
                    {activeTrackCurriculum?.material ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        مربوط وجاهز
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        غير مربوط بعد
                      </span>
                    )}
                  </div>

                  {activeTrackCurriculum?.isInherited && (
                    <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      موروث من الدورة ({parentCourse?.name})
                    </span>
                  )}
                </div>

                {activeTrackCurriculum?.material ? (
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        {activeTrackCurriculum.material.isGoogleDrive ? (
                          <span className="font-bold text-xs">Drive</span>
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-white truncate">
                          {activeTrackCurriculum.material.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span>{activeTrackCurriculum.material.fileSize || 'Google Drive'}</span>
                          <span>•</span>
                          <span>{activeTrackCurriculum.material.fileName}</span>
                          {activeTrackCurriculum.material.isGoogleDrive && (
                            <span className="text-emerald-400 font-mono text-[10px]">Cloud Synced</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Interactive View Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(activeTrackCurriculum.material!)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                        title="معاينة وقراءة المنهج التفاعلي"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة وقراءة المنهج</span>
                      </button>

                      {/* Open in Google Drive */}
                      {activeTrackCurriculum.material.driveFileId && (
                        <a
                          href={getGoogleDriveViewUrl(activeTrackCurriculum.material.driveFileId)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="فتح في علامة تبويب جديدة على Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Remove Button (only if not inherited or if explicitly overriding) */}
                      {(!activeTrackCurriculum.isInherited || !isCourse) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCurriculum(activeTab)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-colors"
                          title="حذف هذا المنهج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    لا يوجد منهج مربوط لمسار ({getTrackLabel(activeTab)}) حالياً. استخدم النموذج أدناه للربط الفوري عبر Google Drive أو رفع ملف PDF.
                  </div>
                )}
              </div>
            )}

            {/* Upload or Link Section */}
            {(activeTab === 'arabic' || activeTab === 'languages') && (
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>{activeTrackCurriculum?.material ? 'تحديث أو استبدال المنهج' : 'ربط أو رفع منهج جديد'} ({getTrackLabel(activeTab)})</span>
                  </h4>

                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode('link')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        inputMode === 'link' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>رابط Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        inputMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileUp className="w-3 h-3" />
                      <span>رفع ملف من الجهاز</span>
                    </button>
                  </div>
                </div>

                {inputMode === 'link' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">
                        رابط مشاركة ملف Google Drive (أو معرّف الملف) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="مثال: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up0Y/view?usp=sharing"
                          value={driveUrlOrId}
                          onChange={(e) => setDriveUrlOrId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        {driveUrlOrId && extractGoogleDriveId(driveUrlOrId) && (
                          <div className="absolute left-3 top-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>معرّف صالح</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        💡 يمكنك لصق رابط المشاركة المباشر من Google Drive لأي مذكرة أو كتاب، وسيقوم النظام باستخراج معرّف الملف وربطه فورياً بقارئ المناهج التفاعلي.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-300 font-bold block mb-1">عنوان المنهج / المذكرة (اختياري)</label>
                        <input
                          type="text"
                          placeholder={`مثال: مذكرة ${getTrackLabel(activeTab)} الرسمية`}
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-bold block mb-1">تعليمات أو ملاحظات للطلاب (اختياري)</label>
                        <input
                          type="text"
                          placeholder="مثال: يرجى دراسة الوحدة الأولى قبل بدء المحاضرة"
                          value={materialDesc}
                          onChange={(e) => setMaterialDesc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-300 font-bold block mb-1">عنوان المادة *</label>
                        <input
                          type="text"
                          placeholder={`مثال: كتاب الشرح - ${getTrackLabel(activeTab)}`}
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-bold block mb-1">اختيار الملف (PDF أو PPT أو DOC) *</label>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx,.doc,.docx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-200 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                          <span className="font-bold text-white truncate max-w-xs">{selectedFile.name}</span>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium whitespace-nowrap self-start sm:self-auto">
                          ☁️ مدعوم بالكامل على حساب Google Drive (5 TB)
                        </span>
                      </div>
                    )}

                    {uploadProgress !== null && (
                      <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            {uploadStatusText || 'جاري الرفع إلى Google Drive...'}
                          </span>
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">وصف أو تعليمات المنهج (اختياري)</label>
                      <input
                        type="text"
                        placeholder="مثال: المذكرة المقررة للفصل الدراسي الأول"
                        value={materialDesc}
                        onChange={(e) => setMaterialDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveCurriculum}
                    disabled={isSubmitting || (inputMode === 'link' ? !driveUrlOrId.trim() : !selectedFile)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ والمزامنة...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>حفظ ومزامنة المنهج فورياً ({getTrackLabel(activeTab)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: All Materials */}
            {activeTab === 'all' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>جميع المواد والمرفقات المسجلة ({currentTarget.materials?.length || 0})</span>
                </h4>

                {(!currentTarget.materials || currentTarget.materials.length === 0) ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    لا توجد مواد علمية أو مناهج مسجلة حالياً. اختر المسار العربي أو مسار اللغات بالأعلى لربط المنهج المخصص.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentTarget.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                            {mat.fileType.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-white">{mat.title}</h5>
                              {mat.track && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                  {mat.track === 'arabic' || mat.track === 'عربي' ? '🇪🇬 عربي' : '🌐 لغات'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{mat.fileName} • {mat.fileSize || 'Drive'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(mat)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="shrink-0 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/95">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>مربوط بسلاسة مع Google Drive وقاعدة بيانات الإنتاج</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>

        </div>
      </div>

      {/* Embedded Document & Google Drive Interactive Reader Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white truncate max-w-md">
                  قارئ المنهج التفاعلي: {previewMaterial.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {previewMaterial.directDownloadUrl && (
                  <a
                    href={previewMaterial.directDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح في صفحة مستقلة</span>
                  </a>
                )}
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe Reader */}
            <div className="flex-1 bg-slate-950 w-full h-full relative">
              <iframe
                src={previewMaterial.previewUrl}
                className="w-full h-full border-0"
                title={previewMaterial.title}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
