import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mic, BookOpen, CheckCircle2, Clock, Share2, Copy, Send, 
  Plus, Edit3, Trash2, Check, ChevronDown, ChevronUp, Layers, Award,
  Cpu, HardDrive, Zap, Info, Play, MessageSquare, AlertCircle, RefreshCw, FileText,
  Filter, Users, Calendar, MapPin, Tag
} from 'lucide-react';
import { LectureRecap } from '../../types';

export const GRADE_OPTIONS = [
  'الصف الرابع الابتدائي (Grade 4 Languages)',
  'الصف الرابع الابتدائي (Grade 4 عربي)',
  'الصف الخامس الابتدائي (Grade 5 Languages)',
  'الصف الخامس الابتدائي (Grade 5 عربي)',
  'الصف السادس الابتدائي (Grade 6 Languages)',
  'الصف السادس الابتدائي (Grade 6 عربي)',
  'الصف الأول الإعدادي (Prep 1)',
  'الصف الثاني الإعدادي (Prep 2)',
  'الصف الثالث الإعدادي (Prep 3)',
  'المرحلة الثانوية (Secondary Stage)',
  'دورة بايثون والذكاء الاصطناعي (Python & AI)',
  'دورة الروبوتكس والإلكترونيات (Robotics & IoT)',
  'دورة التحول الرقمي والحاسب الآلي (ICT / ICDL)',
  'عام لجميع المجموعات (All Groups)'
];

export const SUBJECT_OPTIONS = [
  'تكنولوجيا المعلومات والاتصالات ICT & Computer',
  'برمجة بايثون وتطبيقات الذكاء الاصطناعي Python & AI',
  'الروبوتكس وتطبيقات الذكاء الاصطناعي Robotics',
  'اللغة الإنجليزية والمحادثة English Languages',
  'الحاسب الآلي وتطبيقات المكاتب ICDL & Office Skills'
];

export const GROUP_OPTIONS = [
  'جروب الصف الرابع لغات - مركز بدر والنجاح',
  'جروب الصف الرابع عربي - الأحد 2م',
  'جروب الصف الخامس لغات - السبت 2م',
  'جروب الصف السادس لغات - الأحد 4م',
  'جروب الأول الإعدادي لغات - الاثنين 3م',
  'جروب بايثون والذكاء الاصطناعي - الخميس 4م',
  'جروب الروبوتكس والإلكترونيات - الجمعة 10ص',
  'جروب مخصص (أدخل اسم المجموعة يدويًا)'
];

export const BRANCH_OPTIONS = [
  'فرع مركز بدر والنجاح (الرئيسي)',
  'فرع إيتاي البارود',
  'أونلاين (Online)',
  'جميع الفروع'
];

interface LectureRecapManagerProps {
  mode?: 'trainer_admin' | 'student_view' | 'parent_view';
  currentGradeLevel?: string;
  studentGradeLevel?: string;
  studentName?: string;
  studentCode?: string;
  onSelectTaskToSubmit?: (taskTitle: string, lessonName: string) => void;
  onNavigateToHomework?: (taskTitle: string) => void;
}

export const LectureRecapManager: React.FC<LectureRecapManagerProps> = ({
  mode = 'student_view',
  currentGradeLevel = 'الصف الرابع الابتدائي (Grade 4 Languages)',
  studentGradeLevel,
  studentName,
  studentCode,
  onSelectTaskToSubmit,
  onNavigateToHomework
}) => {
  const [recaps, setRecaps] = useState<LectureRecap[]>([]);
  const [selectedRecapId, setSelectedRecapId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [parentCheckedTasks, setParentCheckedTasks] = useState<{ [key: string]: boolean }>({});
  
  // Trainer Filter
  const [trainerGradeFilter, setTrainerGradeFilter] = useState<string>('all');

  const toggleParentTaskCheck = (taskId: string) => {
    setParentCheckedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Trainer Creator / AI Voice Structuring State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [voiceMemoText, setVoiceMemoText] = useState('');
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Selected Group and Grade for new recap
  const [selectedGrade, setSelectedGrade] = useState<string>(currentGradeLevel || GRADE_OPTIONS[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>(GROUP_OPTIONS[0]);
  const [customGroupInput, setCustomGroupInput] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCH_OPTIONS[0]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  // New Recap Form
  const [formData, setFormData] = useState<Partial<LectureRecap>>({
    title: 'أبطال الصف الرابع لغات - فرع مركز بدر والنجاح 💻🌟',
    gradeLevel: currentGradeLevel || GRADE_OPTIONS[0],
    groupName: GROUP_OPTIONS[0],
    subject: SUBJECT_OPTIONS[0],
    trainerName: 'المهندس / المدرب المعتمد',
    recapSummary: {
      points: [
        '1. مراجعة شاملة Revision على ما تم دراسته سابقاً.',
        '2. أسئلة تفاعلية وتطبيقية على الدرس الأول والثاني.',
        '3. حل وتصحيح الواجبات والتأكد من إتقان كل بطل للأسئلة.',
        '4. مسابقة كاهوت Kahoot حماسية لتثبيت المعلومات والتنافس الشريف.',
        '5. فتح الدرس الجديد مع عرض فيديو تمهيدي شيق وممتع.',
        '6. فك الـ Case عملياً والتعرف على الأجزاء الداخلية للأجهزة.',
        '7. مكونات الكيسة الخمسة: (عمو الكهربائي = Power Supply ⚡️، ماما نوسة = Motherboard 👩‍🍳، المخيخ = CPU 🧠، السمكة = RAM 🐟، الخزنة = Hard Disk 🔒).',
        '8. دورة البيانات والمعلومات Data vs Information (دخول Data -> تحويل ومعالجة بالمخيخ CPU -> خروج Information مفيدة).'
      ],
      detailedNotes: 'تمت المحاضرة وسط تفاعل عالي واستيعاب تطبيقي مباشر حيث قام الطلاب بالتعرف على مكونات الحاسوب وفك الكيسة وملاحظة وظيفة كل قطعة وربطها بالتشبيهات الذكية.'
    },
    homeworkTasks: {
      tasks: [
        '1. كتابة وتوثيق أسماء مكونات الكيسة الخمسة بالعربي والإنجليزي في الكشكول.',
        '2. تلخيص Lesson 1 & Lesson 2 في نصف صفحة + حل الأسئلة المهمة في النصف الثاني.',
        '3. تلخيص تحضيري لـ Lesson 3 في صفحة كاملة.',
        '4. إمكانية تصوير ورفع أكثر من ورقة/صفحة في الواجب عبر بوابة المتدرب.'
      ],
      bonusChallenge: '🌟 بونص إضافي خاص: تسجيل فيديو أو فويس وأنت تشاور على مكونات الكيسة وتشرحها بصوتك!',
      allowMultiPageUpload: true
    },
    nextLecturePrep: {
      prepPoints: [
        'ربط المسميات الأساسية (Power Supply, Motherboard, CPU, RAM, Hard Disk).',
        'إحضار كشكول التدريب وأدوات المعمل والاستعداد لمسابقة كاهوت وتطبيق عملي جديد في المعمل.'
      ],
      teaserNotes: 'المحاضرة القادمة ستشهد تحديات برمجية وعملية تفاعلية وتفكيك كيسات جديدة داخل المعمل!'
    },
    closingMessage: 'أبطال المستقبل، فخور جداً بتركيزكم وفهمكم العملي، أنتم لستم مستخدمين عاديين بل مهندسون ومبتكرون! ننتظر إبداعاتكم في تلخيص الدروس والتطبيق العملي. 🚀🌟',
    isPublished: true
  });

  useEffect(() => {
    loadRecaps();
  }, []);

  const loadRecaps = async () => {
    setIsLoading(true);
    try {
      const [res, coursesRes, groupsRes] = await Promise.all([
        fetch('/api/lecture-recaps').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/courses').then(r => r.json()).catch(() => []),
        fetch('/api/groups').then(r => r.json()).catch(() => [])
      ]);

      if (res.success && Array.isArray(res.recaps)) {
        setRecaps(res.recaps);
      }
      if (Array.isArray(coursesRes)) {
        setAvailableCourses(coursesRes);
      }
      if (Array.isArray(groupsRes)) {
        setAvailableGroups(groupsRes);
      }
    } catch (e) {
      console.warn('Could not load lecture recaps from server:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine effective student grade level
  const effectiveGrade = (studentGradeLevel || currentGradeLevel || '').trim();

  // Smart Matching Logic for Student / Parent
  const isMatchingTarget = (recap: LectureRecap) => {
    if (mode === 'trainer_admin') {
      if (trainerGradeFilter === 'all') return true;
      const tf = trainerGradeFilter.toLowerCase();
      const rg = (recap.gradeLevel || '').toLowerCase();
      const rgn = (recap.groupName || '').toLowerCase();
      return rg.includes(tf) || rgn.includes(tf);
    }

    if (!effectiveGrade) return true;

    const target = effectiveGrade.toLowerCase();
    const recapGrade = (recap.gradeLevel || '').toLowerCase();
    const recapGroup = (recap.groupName || '').toLowerCase();
    const recapCourse = ((recap as any).courseName || '').toLowerCase();

    // Universal recaps explicitly marked for all groups
    if (recapGrade.includes('جميع المجموعات') || recapGrade.includes('all') || recap.groupId === 'all') {
      return true;
    }

    // STRICT Grade 4 Check:
    const isTargetG4 = target.includes('رابع') || target.includes('grade 4') || target.includes('رابعة') || target.includes('primary 4') || target.includes('ict4');
    const isRecapG4 = recapGrade.includes('رابع') || recapGrade.includes('grade 4') || recapGrade.includes('رابعة') || recapGroup.includes('رابع') || recapGroup.includes('ict4') || recapCourse.includes('ict4');

    // STRICT Grade 5 Check:
    const isTargetG5 = target.includes('خامس') || target.includes('grade 5') || target.includes('خامسة') || target.includes('primary 5') || target.includes('ict5');
    const isRecapG5 = recapGrade.includes('خامس') || recapGrade.includes('grade 5') || recapGrade.includes('خامسة') || recapGroup.includes('خامس') || recapGroup.includes('ict5') || recapCourse.includes('ict5');

    // STRICT Grade 6 Check:
    const isTargetG6 = target.includes('سادس') || target.includes('grade 6') || target.includes('سادسة') || target.includes('primary 6') || target.includes('ict6');
    const isRecapG6 = recapGrade.includes('سادس') || recapGrade.includes('grade 6') || recapGrade.includes('سادسة') || recapGroup.includes('سادس') || recapGroup.includes('ict6') || recapCourse.includes('ict6');

    // STRICT Prep 1 Check:
    const isTargetPrep1 = target.includes('أول إعدادي') || target.includes('اول اعدادي') || target.includes('prep 1') || target.includes('prep1');
    const isRecapPrep1 = recapGrade.includes('أول إعدادي') || recapGrade.includes('اول اعدادي') || recapGrade.includes('prep 1');

    // STRICT Prep 2 Check:
    const isTargetPrep2 = target.includes('ثاني إعدادي') || target.includes('ثاني اعدادي') || target.includes('prep 2');
    const isRecapPrep2 = recapGrade.includes('ثاني إعدادي') || recapGrade.includes('prep 2');

    // STRICT Prep 3 Check:
    const isTargetPrep3 = target.includes('ثالث إعدادي') || target.includes('ثالث اعدادي') || target.includes('prep 3');
    const isRecapPrep3 = recapGrade.includes('ثالث إعدادي') || recapGrade.includes('prep 3');

    // Python & AI Check:
    const isTargetPython = target.includes('بايثون') || target.includes('python') || target.includes('ذكاء');
    const isRecapPython = recapGrade.includes('بايثون') || recapGrade.includes('python') || recapGroup.includes('بايثون');

    // Robotics Check:
    const isTargetRobotics = target.includes('روبوت') || target.includes('robot') || target.includes('إلكترونيات');
    const isRecapRobotics = recapGrade.includes('روبوت') || recapGrade.includes('robot');

    // If target belongs to any specific grade/program, strictly prevent cross-grade leakage:
    if (isTargetG4) return isRecapG4;
    if (isTargetG5) return isRecapG5;
    if (isTargetG6) return isRecapG6;
    if (isTargetPrep1) return isRecapPrep1;
    if (isTargetPrep2) return isRecapPrep2;
    if (isTargetPrep3) return isRecapPrep3;
    if (isTargetPython) return isRecapPython;
    if (isTargetRobotics) return isRecapRobotics;

    // Direct match if exact group or grade
    return recapGrade.includes(target) || (target.length > 3 && recapGrade.includes(target));
  };

  const visibleRecaps = recaps.filter(isMatchingTarget);
  const activeRecap = visibleRecaps.find(r => r.id === selectedRecapId) || visibleRecaps[0] || null;

  // Start voice recording for teacher memo
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        setAudioChunks(chunks);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          handleAiStructureVoice(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل ملخص المحاضرة.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const finalGroupName = selectedGroup.includes('مخصص') ? (customGroupInput || 'مجموعة مخصصة') : selectedGroup;

  const handleAiStructureVoice = async (audioBase64?: string) => {
    if (!audioBase64 && !voiceMemoText.trim()) {
      alert('يرجى تسجيل صوتك أو كتابة ملاحظات المحاضرة أولاً لتنظيمها بالذكاء الاصطناعي.');
      return;
    }

    setIsAiStructuring(true);
    try {
      const res = await fetch('/api/lecture-recaps/ai-structure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: 'audio/webm',
          teacherNotes: voiceMemoText,
          targetGrade: selectedGrade,
          targetGroup: finalGroupName,
          targetCourse: selectedSubject
        })
      });

      const data = await res.json();
      if (data.success && data.structured) {
        const s = data.structured;
        setFormData((prev) => ({
          ...prev,
          title: s.title || prev.title,
          gradeLevel: selectedGrade,
          groupName: finalGroupName,
          subject: selectedSubject,
          recapSummary: s.recapSummary || prev.recapSummary,
          homeworkTasks: s.homeworkTasks || prev.homeworkTasks,
          nextLecturePrep: s.nextLecturePrep || prev.nextLecturePrep,
          closingMessage: s.closingMessage || prev.closingMessage
        }));
        alert(`✨ تم تنظيم وهيكلة ملخص وتاسكات المحاضرة بالذكاء الاصطناعي بنجاح خصيصاً لمرحلة: (${selectedGrade})!`);
      }
    } catch (e: any) {
      alert('تعذر تحويل التسجيل الصوتي بالذكاء الاصطناعي: ' + e.message);
    } finally {
      setIsAiStructuring(false);
    }
  };

  const handlePublishRecap = async () => {
    try {
      const payload = {
        ...formData,
        gradeLevel: selectedGrade,
        groupName: finalGroupName,
        subject: selectedSubject,
        branchId: selectedBranch
      };

      const res = await fetch('/api/lecture-recaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.recap) {
        setRecaps((prev) => [data.recap, ...prev.filter(r => r.id !== data.recap.id)]);
        setSelectedRecapId(data.recap.id);
        setIsCreatorOpen(false);
        alert('🎉 ' + data.message);
      }
    } catch (e: any) {
      alert('فشل حفظ ونشر الملخص: ' + e.message);
    }
  };

  const handleDeleteRecap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف ملخص وتكليف هذه المحاضرة؟')) return;
    try {
      await fetch(`/api/lecture-recaps/${id}`, { method: 'DELETE' });
      setRecaps(prev => prev.filter(r => r.id !== id));
      if (selectedRecapId === id) setSelectedRecapId(null);
    } catch (err: any) {
      alert('تعذر حذف الملخص: ' + err.message);
    }
  };

  const copyForWhatsApp = (recap: LectureRecap) => {
    const text = `
*${recap.title}*
📅 التاريخ: ${new Date(recap.lectureDate).toLocaleDateString('ar-EG')}
🎯 الصف المستهدف: ${recap.gradeLevel}
👥 المجموعة: ${recap.groupName || 'المجموعة المعتمدة'} | المادة: ${recap.subject || 'ICT'}
👨‍🏫 المدرب: ${recap.trainerName || 'المدرب المعتمد'}

*1️⃣ ملخص ما تم في المحاضرة والمراجعة:*
${recap.recapSummary.points.join('\n')}

*2️⃣ التكليفات والواجبات المطلوبة في الكشكول:*
${recap.homeworkTasks.tasks.join('\n')}
${recap.homeworkTasks.bonusChallenge ? `\n🔥 ${recap.homeworkTasks.bonusChallenge}` : ''}

*3️⃣ الاستعداد للمحاضرة القادمة:*
${recap.nextLecturePrep.prepPoints.join('\n')}

*4️⃣ رسالة المدرب للأبطال:*
${recap.closingMessage || 'بالتوفيق يا أبطال النجاح! 🌟'}

🌐 رابط تسليم الواجب متعدد الصفحات من البوابة:
${window.location.origin}/student
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(recap.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
        <p className="text-xs text-slate-500 font-bold">جاري تحميل ملخص وتاسكات المحاضرات المخصصة لمجموعتك...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200" dir="rtl">
      {/* Top Header & Targeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                ملخص وتاسك المحاضرة 📢
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/30 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>المرحلة المستهدفة: {activeRecap?.gradeLevel || effectiveGrade || 'الصف الرابع'}</span>
              </span>
              {activeRecap?.groupName && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>{activeRecap.groupName}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>{activeRecap?.title || `ملخص وتكليفات المحاضرة (${effectiveGrade})`}</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              الهيكل التعليمي الرباعي المعتمد: ما تم إنجازه وشرحه عملياً، التكليفات والواجبات المطلوبة في الكشكول، الاستعداد والتشويق للمحاضرة القادمة، ورسالة المدرب.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeRecap && (
              <button
                type="button"
                onClick={() => copyForWhatsApp(activeRecap)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                title="نسخ ملخص وتكليفات المحاضرة للواتساب"
              >
                {copiedId === activeRecap.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ بنجاح! ✓</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>نسخ للواتساب 📱</span>
                  </>
                )}
              </button>
            )}

            {mode === 'trainer_admin' && (
              <button
                type="button"
                onClick={() => setIsCreatorOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نشر ملخص جديد لمجموعة محددة بـ AI 🪄</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TRAINER VIEW: Filter Bar & Target Stage Switcher */}
      {mode === 'trainer_admin' && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span>تصفية الملخصات حسب المرحلة والمجموعة:</span>
          </div>

          <select
            value={trainerGradeFilter}
            onChange={(e) => setTrainerGradeFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-amber-500"
          >
            <option value="all">عرض جميع المراحل والدورات ({recaps.length})</option>
            {GRADE_OPTIONS.map((g, idx) => (
              <option key={idx} value={g}>{g}</option>
            ))}
          </select>
        </div>
      )}

      {/* MULTIPLE RECAPS SELECTOR TABS (If there are multiple lectures for this grade/group) */}
      {visibleRecaps.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>المحاضرات المنشورة:</span>
          </span>
          {visibleRecaps.map((recap) => {
            const isSelected = activeRecap?.id === recap.id;
            return (
              <button
                key={recap.id}
                onClick={() => setSelectedRecapId(recap.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                }`}
              >
                <span>{recap.title.split(':')[0] || recap.title}</span>
                {mode === 'trainer_admin' && (
                  <Trash2
                    onClick={(e) => handleDeleteRecap(recap.id, e)}
                    className="w-3 h-3 text-rose-500 hover:text-rose-700 ml-1"
                    title="حذف هذا الملخص"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* TRAINER CREATOR / AI VOICE MODAL WITH TARGET GROUP SELECTION */}
      {isCreatorOpen && mode === 'trainer_admin' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 md:p-7 space-y-6 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-slate-100">
                إنشاء وهيكلة ملخص وتاسكات المحاضرة (مع تحديد المجموعة والصف المستهدف)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatorOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إغلاق ✕
            </button>
          </div>

          {/* STEP 1: TARGET AUDIENCE SELECTION (CRITICAL) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
            <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>الخطوة 1: تحديد الصف والمجموعة المستهدفة (ليصل التكليف لطلاب هذا الجروب فقط):</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الصف / المرحلة الدراسية:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setFormData(prev => ({ ...prev, gradeLevel: e.target.value }));
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {GRADE_OPTIONS.map((g, idx) => (
                    <option key={idx} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المجموعة / الجروب المستهدف:</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setFormData(prev => ({ ...prev, groupName: e.target.value }));
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {availableGroups.length > 0 && (
                    <optgroup label="مجموعات المركز الفعلية المسجلة">
                      {availableGroups.map((grp: any) => (
                        <option key={grp.id} value={grp.name || grp.id}>{grp.name || grp.id} ({grp.courseName || 'دورة'})</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="المجموعات النموذجية">
                    {GROUP_OPTIONS.map((grp, idx) => (
                      <option key={idx} value={grp}>{grp}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة / الدورة التدريبية:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setFormData(prev => ({ ...prev, subject: e.target.value }));
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {availableCourses.length > 0 && (
                    <optgroup label="الدورات المعتمدة بالنظام">
                      {availableCourses.map((c: any) => (
                        <option key={c.id} value={c.name || c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="المواد والمسارات التدريبية">
                    {SUBJECT_OPTIONS.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الفرع المعتمد:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {BRANCH_OPTIONS.map((br, idx) => (
                    <option key={idx} value={br}>{br}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedGroup.includes('مخصص') && (
              <div className="pt-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">أدخل اسم المجموعة المخصصة:</label>
                <input
                  type="text"
                  value={customGroupInput}
                  onChange={(e) => setCustomGroupInput(e.target.value)}
                  placeholder="مثال: مجموعة أولى لغات - فرع بدر الثلاثاء 3م"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* STEP 2: AI VOICE MEMO & NOTES (TARGETED) */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-500" />
                <span>تسجيل صوتي للمدرب أو كتابة ملاحظات المحاضرة ليقوم الذكاء الاصطناعي بهيكلتها للمجموعة المحددة ({selectedGrade}):</span>
              </span>
              {isRecording && (
                <span className="text-rose-500 font-bold text-xs animate-pulse flex items-center gap-1">
                  ● جاري التسجيل...
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={voiceMemoText}
              onChange={(e) => setVoiceMemoText(e.target.value)}
              placeholder="مثال: راجعنا على الدرس الأول والثاني وعملنا كاهوت، وبعدين شرحنا مكونات الكيسة والباور سبلاي والمذر بورد والبروسيسور، وتكليف الواجب كتابة المكونات في الكشكول وتلخيص الدرس 1 و2 مع إمكانية رفع أكتر من صفحة..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center gap-2 flex-wrap">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>بدء تسجيل صوتي 🎙️</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>إيقاف ومعالجة التسجيل ⏹</span>
                </button>
              )}

              <button
                type="button"
                disabled={isAiStructuring || (!voiceMemoText.trim() && audioChunks.length === 0)}
                onClick={() => handleAiStructureVoice()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiStructuring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الهيكلة والتنسيق بـ AI لمرحلة ({selectedGrade})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>هيكلة الملخص بالأقسام الأربعة بـ AI للمجموعة المحددة 🪄</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Fields for 4 Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1">عنوان المحاضرة:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">اسم المدرب المعتمد:</label>
              <input
                type="text"
                value={formData.trainerName}
                onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreatorOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handlePublishRecap}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر الملخص والتاسك لطلاب ({finalGroupName || selectedGrade}) 📢</span>
            </button>
          </div>
        </div>
      )}

      {/* IF NO RECAPS FOUND FOR THIS STUDENT / GRADE */}
      {!activeRecap ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
            📚
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
              لا توجد تكليفات ملخص منشورة بعد لصفكم ({effectiveGrade})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يقوم المدرب برفع ملخص الحصة والتكليفات والتطبيق العملي فور انتهاء المحاضرة التدريبية الخاصة بمجموعتكم.
            </p>
          </div>

          {mode === 'trainer_admin' ? (
            <button
              type="button"
              onClick={() => setIsCreatorOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نشر أول ملخص لهذه المرحلة الآن</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>سيتم إشعاركم تلقائياً عند قيام المدرب برفع التلخيص الجديد 🔔</span>
            </div>
          )}
        </div>
      ) : (
        /* MAIN 4 STRUCTURED SECTIONS DISPLAY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SECTION 1: Previous Lecture & Practical Highlights (Col 7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Box 1: What was covered in Lecture */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                    1️⃣
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                      ملخص وتفاصيل ما تم في المحاضرة والمراجعة
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      المراجعة الشاملة، الأسئلة التفاعلية، مسابقة كاهوت، والتطبيق العملي
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {activeRecap.recapSummary?.points?.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5 text-xs leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{pt}</span>
                  </div>
                ))}
              </div>

              {/* Hardware Visual Component Showcase (If Grade 4 or Hardware Lecture) */}
              {(activeRecap.gradeLevel?.includes('رابع') || activeRecap.title?.includes('كيسة') || activeRecap.title?.includes('مكونات')) && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-amber-50/40 dark:from-slate-950 dark:to-slate-950 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span>مكونات الكيسة الخمسة والتشبيهات الذكية:</span>
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      تطبيق عملي بالمعمل
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-base">⚡️</span>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">عمو الكهربائي (Power Supply)</strong>
                        <span className="text-slate-500 text-[10px]">تغذية وتوزيع الكهرباء لجميع القطع</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-base">👩‍🍳</span>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">ماما نوسة (Motherboard)</strong>
                        <span className="text-slate-500 text-[10px]">اللوحة الأم التي تحتضن كل المكونات</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-base">🧠</span>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">المخيخ (CPU)</strong>
                        <span className="text-slate-500 text-[10px]">المعالج ووحدة معالجة وتحويل البيانات</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-base">🐟</span>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">السمكة (RAM)</strong>
                        <span className="text-slate-500 text-[10px]">الذاكرة المؤقتة العشوائية فائقة السرعة</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:col-span-2">
                      <span className="text-base">🔒</span>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">الخزنة الدائمة (Hard Disk)</strong>
                        <span className="text-slate-500 text-[10px]">وحدة التخزين الثابتة لحفظ الملفات والبرامج</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 & 3 & 4: Tasks, Prep & Hero Closing (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Box 2: Required Homework & Multi-page Upload */}
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 md:p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    2️⃣
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                      التكليفات والواجبات المطلوبة
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ يدعم رفع وتصوير أكثر من ورقة/صفحة
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {mode === 'parent_view' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>متابعة إنجاز {studentName ? `الطالب (${studentName})` : 'ابنكم'}:</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                      يمكنك وضع علامة صح بجانب كل مهمة يكملها الطالب في كشكوله للتأكد من جاهزيته للمحاضرة القادمة.
                    </p>
                  </div>
                )}

                {activeRecap.homeworkTasks?.tasks?.map((task, idx) => {
                  const taskKey = `${activeRecap.id}-task-${idx}`;
                  const isChecked = !!parentCheckedTasks[taskKey];

                  return (
                    <div
                      key={idx}
                      onClick={() => mode === 'parent_view' && toggleParentTaskCheck(taskKey)}
                      className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 text-xs font-semibold ${
                        mode === 'parent_view' ? 'cursor-pointer hover:border-amber-400' : ''
                      } ${
                        isChecked 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 line-through opacity-85'
                          : 'bg-amber-50/40 dark:bg-slate-950 border-amber-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {mode === 'parent_view' ? (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleParentTaskCheck(taskKey)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer w-4 h-4"
                        />
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-black">{idx + 1}.</span>
                      )}
                      <span className="flex-1">{task}</span>
                    </div>
                  );
                })}

                {activeRecap.homeworkTasks?.bonusChallenge && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 text-xs font-bold text-purple-900 dark:text-purple-300 flex items-start gap-2">
                    <span className="text-base">🌟</span>
                    <div>
                      <span className="block font-black text-amber-500 text-[10px]">تحدي النجوم الإضافية (بونص):</span>
                      <span>{activeRecap.homeworkTasks.bonusChallenge}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button Trigger */}
              {(onSelectTaskToSubmit || onNavigateToHomework) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToHomework) {
                      onNavigateToHomework(activeRecap.title);
                    } else if (onSelectTaskToSubmit) {
                      onSelectTaskToSubmit(activeRecap.title, activeRecap.gradeLevel || 'الدرس العملي');
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>تصوير ورفع صفحات الواجب الآن للتصحيح 🚀</span>
                </button>
              )}
            </div>

            {/* Box 3: Preparation for Next Lecture */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs">
                  3️⃣
                </div>
                <h4 className="font-black text-xs text-slate-900 dark:text-slate-100">
                  الاستعداد للمحاضرة القادمة والتشويق
                </h4>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {activeRecap.nextLecturePrep?.prepPoints?.map((prep, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-teal-500">📌</span>
                    <span>{prep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 4: Closing Motivational Message */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/50 shadow-md space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Award className="w-4 h-4" />
                <span>رسالة المدرب لأبطال المستقبل:</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 font-medium italic">
                "{activeRecap.closingMessage || 'أبطال النجاح، فخور بتركيزكم وإتقانكم وروح التحدي بالمعمل!'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
