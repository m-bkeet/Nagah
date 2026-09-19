import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Mic, BookOpen, CheckCircle2, Clock, Share2, Copy, Send, 
  Plus, Edit3, Trash2, Check, ChevronDown, ChevronUp, Layers, Award,
  Cpu, HardDrive, Zap, Info, Play, MessageSquare, AlertCircle, RefreshCw, FileText,
  Filter, Users, Calendar, MapPin, Tag, X, Save, ArrowRight
} from 'lucide-react';
import { LectureRecap } from '../../types';
import { detectCurriculum } from '../../domain/curriculumRegistry';

export const GRADE_OPTIONS = [
  'الصف السادس الابتدائي (Grade 6 Languages) - دورة ICT 6',
  'الصف السادس الابتدائي (Grade 6 عربي) - دورة ICT 6',
  'الصف الخامس الابتدائي (Grade 5 Languages) - دورة ICT 5',
  'الصف الخامس الابتدائي (Grade 5 عربي) - دورة ICT 5',
  'الصف الرابع الابتدائي (Grade 4 Languages) - دورة ICT 4',
  'الصف الرابع الابتدائي (Grade 4 عربي) - دورة ICT 4',
  'الصف الأول الإعدادي (Prep 1) - دورة ICT & AI',
  'الصف الثاني الإعدادي (Prep 2)',
  'الصف الثالث الإعدادي (Prep 3)',
  'المرحلة الثانوية (Secondary Stage)',
  'دورة بايثون والذكاء الاصطناعي (Python & AI)',
  'دورة الروبوتكس والإلكترونيات (Robotics & IoT)',
  'دورة التحول الرقمي والحاسب الآلي (ICT / ICDL)',
  'عام لجميع المجموعات (All Groups)'
];

export const SUBJECT_OPTIONS = [
  'تكنولوجيا المعلومات والاتصالات ICT 6 & Computer',
  'تكنولوجيا المعلومات والاتصالات ICT 5 & Computer',
  'تكنولوجيا المعلومات والاتصالات ICT 4 & Computer',
  'تكنولوجيا المعلومات والاتصالات والذكاء الاصطناعي Prep 1',
  'برمجة بايثون وتطبيقات الذكاء الاصطناعي Python & AI',
  'الروبوتكس وتطبيقات الذكاء الاصطناعي Robotics',
  'اللغة الإنجليزية والمحادثة English Languages',
  'الحاسب الآلي وتطبيقات المكاتب ICDL & Office Skills'
];

export const GROUP_OPTIONS = [
  'جروب الصف السادس لغات (ICT 6) - الأحد 4م',
  'جروب الصف السادس عربي (ICT 6) - السبت 4م',
  'جروب الصف الخامس لغات (ICT 5) - السبت 2م',
  'جروب الصف الخامس عربي (ICT 5) - الاثنين 4م',
  'جروب الصف الرابع لغات (ICT 4) - مركز بدر والنجاح',
  'جروب الصف الرابع عربي (ICT 4) - الأحد 2م',
  'جروب الأول الإعدادي لغات (Prep 1) - الاثنين 3م',
  'جروب بايثون والذكاء الاصطناعي - الخميس 4م',
  'جروب الروبوتكس والإلكترونيات - الجمعة 10ص',
  'كل مجموعات المرحلة (All Grade Groups)',
  'جروب مخصص (أدخل اسم المجموعة يدويًا)'
];

export const BRANCH_OPTIONS = [
  'فرع مركز بدر والنجاح (الرئيسي)',
  'فرع إيتاي البارود',
  'أونلاين (Online)',
  'جميع الفروع'
];

// Helper to provide realistic, grade-accurate curriculum template when switching grades
export const getGradeCurriculumTemplate = (grade: string, groupName?: string): Partial<LectureRecap> => {
  const g = grade.toLowerCase();
  
  // Grade 6 / ICT 6 Template
  if (g.includes('سادس') || g.includes('grade 6') || g.includes('ict6') || g.includes('ict 6')) {
    return {
      title: 'المحاضرة 1: أجهزة شبكات الكمبيوتر والتكنولوجيا المتقدمة وتصميم الويب HTML 🌐🚀',
      gradeLevel: grade,
      groupName: groupName || 'جروب الصف السادس لغات (ICT 6) - الأحد 4م',
      subject: 'تكنولوجيا المعلومات والاتصالات ICT 6 & Computer',
      trainerName: 'المهندس / المدرب المعتمد',
      recapSummary: {
        points: [
          '1. مراجعة شاملة وأسئلة تفاعلية ومسابقة كاهوت لتثبيت المفاهيم وتكريم الأبطال المتفوقين.',
          '2. شرح أجهزة شبكات الكمبيوتر (المودم Modem، المحول Switch، الراوتر Router) والفرق بين الشبكات السلكية واللاسلكية.',
          '3. استعراض التكنولوجيا المتقدمة وتطبيقات الذكاء الاصطناعي (AI) والواقع المعزز (AR) والواقع الافتراضي (VR).',
          '4. مقدمة عملية في لغة ترميز النصوص التشعبية (HTML) لبناء صفحات الويب التفاعلية وهيكلة العناصر الأساسية.',
          '5. تطبيق عملي بالمعمل على كتابة كود HTML وبناء صفحة ويب شخصية بسيطة وفحص الاتصال بالأجهزة الذكية.'
        ],
        detailedNotes: 'تمت المحاضرة بتفاعل رائع وفهم عميق للفرق بين المودم والمحول وتطبيق كتابة وسوم HTML في المعمل بنجاح.'
      },
      homeworkTasks: {
        tasks: [
          '1. كتابة الفروق الجوهرية بين المودم (Modem) والمحول (Switch) والراوتر في كشكول التدريب مع رسم توضيحي.',
          '2. كتابة كود HTML بسيط يحتوي على وسم العنوان <h1> وفقرة <p> وقائمة نقطية <ul> في الكشكول.',
          '3. تصوير صفحات الواجب بالكشكول ورفعها عبر بوابة المتدرب للتصحيح الذكي والحصول على النجوم.'
        ],
        bonusChallenge: '🌟 بونص إضافي خاص: إنشاء ملف HTML حقيقي على الكمبيوتر وتجربة فتحه بمتصفح الويب وتصوير الشاشة.',
        allowMultiPageUpload: true
      },
      nextLecturePrep: {
        prepPoints: [
          'التحضير لدرس حماية البيانات والألعاب الإلكترونية وتطبيقات الحوسبة السحابية (Cloud Computing).',
          'إحضار كشكول التدريب وأدوات المعمل والاستعداد لمسابقة كاهوت جديدة.'
        ],
        teaserNotes: 'المحاضرة القادمة سنتعلم كيف نحمي حساباتنا من المخاطر السيبرانية ونخزن ملفاتنا سحابياً!'
      },
      closingMessage: 'أبطال الصف السادس (ICT 6)، نضج فكري وتطبيقي استثنائي في استيعاب التكنولوجيا المتقدمة والشبكات! فخور جداً بتميزكم. 🌐🚀⭐',
      isPublished: true
    };
  }

  // Grade 5 / ICT 5 Template
  if (g.includes('خامس') || g.includes('grade 5') || g.includes('ict5') || g.includes('ict 5')) {
    return {
      title: 'المحاضرة 2: شبكات الحاسوب والإنترنت والأمن السيبراني 🌐🔒',
      gradeLevel: grade,
      groupName: groupName || 'جروب الصف الخامس لغات (ICT 5) - السبت 2م',
      subject: 'تكنولوجيا المعلومات والاتصالات ICT 5 & Computer',
      trainerName: 'المهندس / المدرب المعتمد',
      recapSummary: {
        points: [
          '1. مراجعة أنواع الشبكات (LAN vs WAN) والفرق بين الشبكة المغلقة والمفتوحة.',
          '2. مكونات توصيل الشبكة (الراوتر Router، كابلات Ethernet، منافذ Switch).',
          '3. الإنترنت Internet وشبكة الويب العالمية World Wide Web (WWW).',
          '4. قواعد حماية البيانات وكلمات المرور القوية (Strong Passwords & 2FA).',
          '5. تطبيق عملي بالمعمل على فحص اتصال الشبكة ومشاركة الملفات بأمان.'
        ],
        detailedNotes: 'تم تطبيق ورشة عملية على توصيل الكابلات وفهم عنوان الـ IP وطرق حماية الخصوصية الرقمية.'
      },
      homeworkTasks: {
        tasks: [
          '1. كتابة جدول مقارنة بين شبكة LAN وشبكة WAN في الكشكول.',
          '2. وضع 5 شروط لكلمة المرور الآمنة التي تحمي الحسابات من الاختراق.',
          '3. حل أسئلة نهاية الوحدة وتصوير صفحات الإجابة لرفعها عبر البوابة.'
        ],
        bonusChallenge: '🌟 بونص إضافي: ابتكار كلمة مرور قوية باستخدام كلمات وحروف ورموز وتوضيح سبب قوتها.',
        allowMultiPageUpload: true
      },
      nextLecturePrep: {
        prepPoints: [
          'قراءة درس استراتيجيات البحث المتقدم على محركات البحث (Search Strategies).',
          'إحضار الكشكول ومتابعة المهام في الموعد.'
        ],
        teaserNotes: 'المحاضرة القادمة سنتعلم أسرار وتقنيات البحث الاحترافي والتحقق من مصادر المعلومات!'
      },
      closingMessage: 'أبطال الصف الخامس، أبدعتم في فهم عالم الشبكات، استمروا في تطبيق عادات الأمان الرقمي! 🌐🛡️',
      isPublished: true
    };
  }

  // Prep 1 Template (Official 2024-2026 MOE Curriculum)
  if (g.includes('أول إعدادي') || g.includes('اول اعدادي') || g.includes('prep 1') || g.includes('prep1')) {
    return {
      title: 'المحاضرة 1: التكنولوجيا الخضراء والتحول الرقمي وأنظمة التشغيل الحديثة 🌿💻',
      gradeLevel: grade,
      groupName: groupName || 'جروب الأول الإعدادي لغات (Prep 1) - الاثنين 3م',
      subject: 'تكنولوجيا المعلومات والاتصالات والذكاء الاصطناعي Prep 1',
      trainerName: 'المهندس / المدرب المعتمد',
      recapSummary: {
        points: [
          '1. شرح مفهوم التكنولوجيا الخضراء (Green Technology) ودورها في الاستدامة البيئية وترشيد الطاقة.',
          '2. استعراض التحول الرقمي (Digital Transformation) وتطبيقاته الحكومية والتعليمية والخدمية في مصر.',
          '3. التعرف على أنظمة التشغيل المختلفة (Windows, Android, Linux, iOS) ووظائفها في إدارة العتاد والبرامج.',
          '4. خطوات تثبيت وإلغاء تثبيت البرمجيات وإدارة الأجهزة الرقمية والملحقات ومنافذ التوصيل.',
          '5. إنشاء واستخدام البريد الإلكتروني والحساب المدرسي الموحد والتواصل الرقمي الآمن والمحترف.'
        ],
        detailedNotes: 'تم تطبيق ورشة عمل تفاعلية على تفعيل الحساب الموحد وتجربة أنظمة التشغيل وفهم معايير التكنولوجيا الخضراء وإدارة الطاقة بالأجهزة.'
      },
      homeworkTasks: {
        tasks: [
          '1. كتابة تقرير قصير في الكشكول يوضح 3 أمثلة لتطبيقات التكنولوجيا الخضراء في الأجهزة الذكية.',
          '2. عمل جدول مقارنة بين أنظمة تشغيل الحواسيب (Windows/Linux) وأنظمة الهواتف (Android/iOS).',
          '3. تسجيل الدخول بالبريد المدرسي الموحد وتصوير صفحة الحساب ورفعها عبر البوابة.'
        ],
        bonusChallenge: '🌟 بونص متميز: ابتكار فكرة مشروع رقمي يدعم البيئة المستدامة باستخدام الذكاء الاصطناعي أو إنترنت الأشياء.',
        allowMultiPageUpload: true
      },
      nextLecturePrep: {
        prepPoints: [
          'التحضير لموضوع الحوسبة السحابية (Cloud Storage) وخدمات Google Drive و OneDrive.',
          'تجهيز بيئة العمل لاجتماعات Google Meet وإدارة المشروعات الرقمية.'
        ],
        teaserNotes: 'المحاضرة القادمة سنتعلم كيفية حفظ ملفاتنا سحابياً وإدارتها والعمل الجماعي عبر الإنترنت!'
      },
      closingMessage: 'أبطال الصف الأول الإعدادي، بداية استثنائية ونضج تكنولوجي رائع في استيعاب مفاهيم التكنولوجيا الخضراء والتحول الرقمي! 🌿🚀⭐',
      isPublished: true
    };
  }

  // Python & AI Template
  if (g.includes('بايثون') || g.includes('python')) {
    return {
      title: 'المحاضرة 4: الحلقات التكرارية والقوائم وبناء المشاريع الذكية 🐍⚡',
      gradeLevel: grade,
      groupName: groupName || 'جروب بايثون والذكاء الاصطناعي - الخميس 4م',
      subject: 'برمجة بايثون وتطبيقات الذكاء الاصطناعي Python & AI',
      trainerName: 'المهندس / المدرب المعتمد',
      recapSummary: {
        points: [
          '1. مراجعة الجمل الشرطية If/Else وحل التحديات البرمجية بالمعمل.',
          '2. شرح الحلقات التكرارية For Loop و While Loop وتطبيقاتها العملية.',
          '3. التعامل مع القوائم Lists والدوال المدمجة append, remove, len.',
          '4. بناء مشروع لعبة تخمين الأرقام الذكية والتفاعل مع المستخدم عبر الكونسول.'
        ],
        detailedNotes: 'أظهر المتدربون سرعة فائقة في فهم الحلقات التكرارية وتطبيق المشروع البرمجي في بيئة التطوير.'
      },
      homeworkTasks: {
        tasks: [
          '1. كتابة برنامج بلغة Python يطبع الأعداد الزوجية من 1 إلى 50 باستخدام For Loop.',
          '2. إنشاء قائمة تحتوي على 5 أسماء واستخدام Loop لطباعة كل اسم بالترحيب.',
          '3. تصوير الكود أو رفع ملف الـ .py عبر بوابة المتدرب.'
        ],
        bonusChallenge: '🌟 بونص المحترفين: إضافة عداد للمحاولات داخل لعبة التخمين مع تحديد الحد الأقصى للمحاولات.',
        allowMultiPageUpload: true
      },
      nextLecturePrep: {
        prepPoints: [
          'قراءة مقدمة عن الدوال Functions وكيفية إعادة استخدام الكود البرمجي.',
          'تثبيت مكتبات بايثون الجديدة المطلوبة لمشروع الذكاء الاصطناعي القادم.'
        ],
        teaserNotes: 'المحاضرة القادمة سنبدأ في برمجة دوال مخصصة وربطها بنماذج الذكاء الاصطناعي التوليدي!'
      },
      closingMessage: 'مبرمجو المستقبل، خطواتكم البرمجية ثابتة ومبهرة، أنتم تبنون مهارات العصر! 🐍💻🚀',
      isPublished: true
    };
  }

  // Grade 4 / Default Template
  return {
    title: 'المحاضرة 3: مكونات الكيسة الخمسة والعتاد ودورة معالجة البيانات 💻⚡️',
    gradeLevel: grade || 'الصف الرابع الابتدائي (Grade 4 Languages)',
    groupName: groupName || 'جروب الصف الرابع لغات (ICT 4) - مركز بدر والنجاح',
    subject: 'تكنولوجيا المعلومات والاتصالات ICT 4 & Computer',
    trainerName: 'المهندس / المدرب المعتمد',
    recapSummary: {
      points: [
        '1. مراجعة شاملة Revision على ما تم دراسته سابقاً في الدرس الأول والثاني.',
        '2. أسئلة تفاعلية وتطبيقية ومسابقة كاهوت Kahoot حماسية لتثبيت المفاهيم.',
        '3. حل وتصحيح الواجبات السابقة والتأكد من إتقان كل بطل للأسئلة.',
        '4. فتح Lesson 3 مع عرض فيديو تمهيدي شيق وممتع عن مكونات الكمبيوتر.',
        '5. فتح وفك الـ Case عملياً والتعرف على الأجزاء الداخلية للأجهزة.',
        '6. مكونات الكيسة الخمسة: (عمو الكهربائي = Power Supply ⚡️، ماما نوسة = Motherboard 👩‍🍳، المخيخ = CPU 🧠، السمكة = RAM 🐟، الخزنة = Hard Disk 🔒).',
        '7. دورة البيانات والمعلومات Data vs Information (دخول Data -> تحويل ومعالجة بالمخيخ CPU -> خروج Information مفيدة).'
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
        'تثبيت وحفظ مسميات مكونات الكيسة الخمسة (Power Supply, Motherboard, CPU, RAM, Hard Disk).',
        'إحضار كشكول التدريب وأدوات المعمل والاستعداد لمسابقة كاهوت وتطبيق عملي جديد في المعمل.'
      ],
      teaserNotes: 'المحاضرة القادمة ستشهد تحديات برمجية وعملية تفاعلية وتفكيك كيسات جديدة داخل المعمل!'
    },
    closingMessage: 'أبطال الصف الرابع، فخور جداً بتركيزكم وفهمكم العملي لمكونات الحاسوب، أنتم لستم مستخدمين عاديين بل مهندسون ومبتكرون! ننتظر إبداعاتكم في تلخيص الدروس والتطبيق العملي. 🚀🌟',
    isPublished: true
  };
};

export const getBlankRecapTemplate = (grade: string, groupName?: string): Partial<LectureRecap> => ({
  title: '',
  gradeLevel: grade || GRADE_OPTIONS[0],
  groupName: groupName || GROUP_OPTIONS[0],
  subject: SUBJECT_OPTIONS[0],
  trainerName: 'المهندس / المدرب المعتمد',
  lectureDate: new Date().toISOString(),
  recapSummary: {
    points: [''],
    detailedNotes: ''
  },
  homeworkTasks: {
    tasks: [''],
    bonusChallenge: '',
    allowMultiPageUpload: true
  },
  nextLecturePrep: {
    prepPoints: [''],
    teaserNotes: ''
  },
  closingMessage: 'بالتوفيق يا أبطال النجاح! 🌟',
  isPublished: true
});

interface LectureRecapManagerProps {
  currentGradeLevel?: string;
  studentGradeLevel?: string;
  studentCode?: string;
  studentName?: string;
  mode?: 'trainer_admin' | 'student_view' | 'parent_view';
  onSelectTaskToSubmit?: (taskTitle: string, gradeLevel: string) => void;
  onNavigateToHomework?: (taskTitle: string) => void;
}

export const LectureRecapManager: React.FC<LectureRecapManagerProps> = ({
  currentGradeLevel,
  studentGradeLevel,
  studentCode,
  studentName,
  mode = 'student_view',
  onSelectTaskToSubmit,
  onNavigateToHomework
}) => {
  const [recaps, setRecaps] = useState<LectureRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecapId, setSelectedRecapId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Trainer Quick Tab Filter
  const [trainerGradeFilter, setTrainerGradeFilter] = useState<string>('all');

  // Interactive Parent Checkboxes State
  const [parentCheckedTasks, setParentCheckedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`nagah_parent_task_checks_${studentCode || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleParentTaskCheck = (taskKey: string) => {
    setParentCheckedTasks((prev) => {
      const next = { ...prev, [taskKey]: !prev[taskKey] };
      try {
        localStorage.setItem(`nagah_parent_task_checks_${studentCode || 'guest'}`, JSON.stringify(next));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }
      return next;
    });
  };

  // Creator & Editor Modal State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecapId, setEditingRecapId] = useState<string | null>(null);
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMemoText, setVoiceMemoText] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Selected Group and Grade for new/edited recap
  const initialGrade = currentGradeLevel || GRADE_OPTIONS[0];
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [selectedGroup, setSelectedGroup] = useState<string>(GROUP_OPTIONS[0]);
  const [customGroupInput, setCustomGroupInput] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCH_OPTIONS[0]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  // Form Data State
  const [formData, setFormData] = useState<Partial<LectureRecap>>(() => 
    getGradeCurriculumTemplate(initialGrade, GROUP_OPTIONS[0])
  );

  useEffect(() => {
    loadRecaps();
  }, []);

  // When selectedGrade changes in Creator form, update default curriculum content seamlessly
  const handleGradeChangeInForm = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const template = getGradeCurriculumTemplate(newGrade, selectedGroup);
    setFormData(prev => ({
      ...prev,
      ...template,
      gradeLevel: newGrade,
      groupName: selectedGroup.includes('مخصص') ? (customGroupInput || 'مجموعة مخصصة') : selectedGroup,
      subject: template.subject || prev.subject,
      trainerName: prev.trainerName || 'المهندس / المدرب المعتمد'
    }));
  };

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

  // Open Editor for an existing recap
  const handleOpenEditModal = (recap: LectureRecap) => {
    setIsEditMode(true);
    setEditingRecapId(recap.id);
    setSelectedGrade(recap.gradeLevel || GRADE_OPTIONS[0]);
    setSelectedGroup(recap.groupName || GROUP_OPTIONS[0]);
    setSelectedSubject(recap.subject || SUBJECT_OPTIONS[0]);
    setSelectedBranch(recap.branchId || BRANCH_OPTIONS[0]);
    setFormData({
      ...recap,
      recapSummary: {
        points: recap.recapSummary?.points?.length ? [...recap.recapSummary.points] : [''],
        detailedNotes: recap.recapSummary?.detailedNotes || ''
      },
      homeworkTasks: {
        tasks: recap.homeworkTasks?.tasks?.length ? [...recap.homeworkTasks.tasks] : [''],
        bonusChallenge: recap.homeworkTasks?.bonusChallenge || '',
        allowMultiPageUpload: recap.homeworkTasks?.allowMultiPageUpload ?? true,
        dueDateTime: recap.homeworkTasks?.dueDateTime
      },
      nextLecturePrep: {
        prepPoints: recap.nextLecturePrep?.prepPoints?.length ? [...recap.nextLecturePrep.prepPoints] : [''],
        teaserNotes: recap.nextLecturePrep?.teaserNotes || ''
      },
      closingMessage: recap.closingMessage || ''
    });
    setIsCreatorOpen(true);
  };

  // Open Creator for a new recap
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingRecapId(null);
    const defaultGrade = currentGradeLevel || GRADE_OPTIONS[0];
    setSelectedGrade(defaultGrade);
    setSelectedGroup(GROUP_OPTIONS[0]);
    setCustomGroupInput('');
    setFormData(getGradeCurriculumTemplate(defaultGrade, GROUP_OPTIONS[0]));
    setIsCreatorOpen(true);
  };

  // Apply Grade Template to current form
  const handleApplyGradeTemplate = () => {
    const template = getGradeCurriculumTemplate(selectedGrade, finalGroupName);
    setFormData(prev => ({
      ...prev,
      ...template,
      gradeLevel: selectedGrade,
      groupName: finalGroupName,
      subject: template.subject || prev.subject,
      trainerName: prev.trainerName || 'المهندس / المدرب المعتمد'
    }));
  };

  // Clear Form to Blank
  const handleApplyBlankForm = () => {
    setFormData(getBlankRecapTemplate(selectedGrade, finalGroupName));
  };

  // Helper dynamic list handlers for Form
  const handleAddPoint = () => {
    setFormData(prev => ({
      ...prev,
      recapSummary: {
        ...prev.recapSummary,
        points: [...(prev.recapSummary?.points || []), '']
      }
    }));
  };

  const handleUpdatePoint = (index: number, val: string) => {
    setFormData(prev => {
      const nextPoints = [...(prev.recapSummary?.points || [])];
      nextPoints[index] = val;
      return {
        ...prev,
        recapSummary: {
          ...prev.recapSummary,
          points: nextPoints
        }
      };
    });
  };

  const handleRemovePoint = (index: number) => {
    setFormData(prev => {
      const nextPoints = (prev.recapSummary?.points || []).filter((_, i) => i !== index);
      return {
        ...prev,
        recapSummary: {
          ...prev.recapSummary,
          points: nextPoints.length > 0 ? nextPoints : ['']
        }
      };
    });
  };

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      homeworkTasks: {
        ...prev.homeworkTasks,
        tasks: [...(prev.homeworkTasks?.tasks || []), '']
      }
    }));
  };

  const handleUpdateTask = (index: number, val: string) => {
    setFormData(prev => {
      const nextTasks = [...(prev.homeworkTasks?.tasks || [])];
      nextTasks[index] = val;
      return {
        ...prev,
        homeworkTasks: {
          ...prev.homeworkTasks,
          tasks: nextTasks
        }
      };
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => {
      const nextTasks = (prev.homeworkTasks?.tasks || []).filter((_, i) => i !== index);
      return {
        ...prev,
        homeworkTasks: {
          ...prev.homeworkTasks,
          tasks: nextTasks.length > 0 ? nextTasks : ['']
        }
      };
    });
  };

  const handleAddPrep = () => {
    setFormData(prev => ({
      ...prev,
      nextLecturePrep: {
        ...prev.nextLecturePrep,
        prepPoints: [...(prev.nextLecturePrep?.prepPoints || []), '']
      }
    }));
  };

  const handleUpdatePrep = (index: number, val: string) => {
    setFormData(prev => {
      const nextPrep = [...(prev.nextLecturePrep?.prepPoints || [])];
      nextPrep[index] = val;
      return {
        ...prev,
        nextLecturePrep: {
          ...prev.nextLecturePrep,
          prepPoints: nextPrep
        }
      };
    });
  };

  const handleRemovePrep = (index: number) => {
    setFormData(prev => {
      const nextPrep = (prev.nextLecturePrep?.prepPoints || []).filter((_, i) => i !== index);
      return {
        ...prev,
        nextLecturePrep: {
          ...prev.nextLecturePrep,
          prepPoints: nextPrep.length > 0 ? nextPrep : ['']
        }
      };
    });
  };

  // Determine effective student grade level and curriculum
  const detectedCurriculum = useMemo(() => {
    return detectCurriculum({
      code: studentCode,
      fullName: studentName,
      grade: studentGradeLevel || currentGradeLevel,
      courseName: ''
    });
  }, [studentCode, studentName, studentGradeLevel, currentGradeLevel]);

  const effectiveGrade = (studentGradeLevel || currentGradeLevel || detectedCurriculum.gradeNameAr || '').trim();

  // Smart Matching Logic for Student / Parent / Trainer
  const isMatchingTarget = (recap: LectureRecap) => {
    if (mode === 'trainer_admin') {
      if (trainerGradeFilter === 'all') return true;
      const tf = trainerGradeFilter.toLowerCase();
      const rg = (recap.gradeLevel || '').toLowerCase();
      const rgn = (recap.groupName || '').toLowerCase();
      const rc = (recap.subject || '').toLowerCase();
      return rg.includes(tf) || rgn.includes(tf) || rc.includes(tf);
    }

    if (!effectiveGrade) return true;

    const target = effectiveGrade.toLowerCase();
    const recapGrade = (recap.gradeLevel || '').toLowerCase();
    const recapGroup = (recap.groupName || '').toLowerCase();
    const recapCourse = ((recap as any).courseName || recap.subject || '').toLowerCase();

    // Universal recaps explicitly marked for all groups
    if (recapGrade.includes('جميع المجموعات') || recapGrade.includes('all') || recap.groupId === 'all') {
      return true;
    }

    // STRICT Grade 6 Check:
    const isTargetG6 = target.includes('سادس') || target.includes('grade 6') || target.includes('سادسة') || target.includes('primary 6') || target.includes('ict6') || target.includes('ict 6');
    const isRecapG6 = recapGrade.includes('سادس') || recapGrade.includes('grade 6') || recapGrade.includes('سادسة') || recapGroup.includes('سادس') || recapGroup.includes('ict6') || recapGroup.includes('ict 6') || recapCourse.includes('ict6') || recapCourse.includes('ict 6');

    // STRICT Grade 5 Check:
    const isTargetG5 = target.includes('خامس') || target.includes('grade 5') || target.includes('خامسة') || target.includes('primary 5') || target.includes('ict5') || target.includes('ict 5');
    const isRecapG5 = recapGrade.includes('خامس') || recapGrade.includes('grade 5') || recapGrade.includes('خامسة') || recapGroup.includes('خامس') || recapGroup.includes('ict5') || recapGroup.includes('ict 5') || recapCourse.includes('ict5') || recapCourse.includes('ict 5');

    // STRICT Grade 4 Check:
    const isTargetG4 = target.includes('رابع') || target.includes('grade 4') || target.includes('رابعة') || target.includes('primary 4') || target.includes('ict4') || target.includes('ict 4');
    const isRecapG4 = recapGrade.includes('رابع') || recapGrade.includes('grade 4') || recapGrade.includes('رابعة') || recapGroup.includes('رابع') || recapGroup.includes('ict4') || recapGroup.includes('ict 4') || recapCourse.includes('ict4') || recapCourse.includes('ict 4');

    // STRICT Prep 1 Check:
    const isTargetPrep1 = target.includes('أول إعدادي') || target.includes('اول اعدادي') || target.includes('prep 1') || target.includes('prep1');
    const isRecapPrep1 = recapGrade.includes('أول إعدادي') || recapGrade.includes('اول اعدادي') || recapGrade.includes('prep 1') || recapGroup.includes('إعدادي') || recapGroup.includes('prep 1');

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
    if (isTargetG6) return isRecapG6;
    if (isTargetG5) return isRecapG5;
    if (isTargetG4) return isRecapG4;
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
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleAiStructureVoice(base64Audio);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err: any) {
      alert('تعذر الوصول إلى الميكروفون: ' + err.message);
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
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
          recapSummary: {
            points: Array.isArray(s.recapSummary?.points) ? s.recapSummary.points : (prev.recapSummary?.points || []),
            detailedNotes: s.recapSummary?.detailedNotes || prev.recapSummary?.detailedNotes || ''
          },
          homeworkTasks: {
            tasks: Array.isArray(s.homeworkTasks?.tasks) ? s.homeworkTasks.tasks : (prev.homeworkTasks?.tasks || []),
            bonusChallenge: s.homeworkTasks?.bonusChallenge || prev.homeworkTasks?.bonusChallenge || '',
            allowMultiPageUpload: true
          },
          nextLecturePrep: {
            prepPoints: Array.isArray(s.nextLecturePrep?.prepPoints) ? s.nextLecturePrep.prepPoints : (prev.nextLecturePrep?.prepPoints || []),
            teaserNotes: s.nextLecturePrep?.teaserNotes || prev.nextLecturePrep?.teaserNotes || ''
          },
          closingMessage: s.closingMessage || prev.closingMessage
        }));
        alert(`✨ تم تنظيم وهيكلة ملخص وتاسكات المحاضرة بالذكاء الاصطناعي بنجاح لمرحلة: (${selectedGrade})!`);
      }
    } catch (e: any) {
      alert('تعذر تحويل التسجيل الصوتي بالذكاء الاصطناعي: ' + e.message);
    } finally {
      setIsAiStructuring(false);
    }
  };

  const handleSaveOrPublishRecap = async () => {
    if (!formData.title?.trim()) {
      alert('يرجى إدخال عنوان المحاضرة أولاً.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        gradeLevel: selectedGrade,
        groupName: finalGroupName,
        subject: selectedSubject,
        branchId: selectedBranch,
        recapSummary: {
          points: (formData.recapSummary?.points || []).filter(p => p.trim() !== ''),
          detailedNotes: formData.recapSummary?.detailedNotes || ''
        },
        homeworkTasks: {
          tasks: (formData.homeworkTasks?.tasks || []).filter(t => t.trim() !== ''),
          bonusChallenge: formData.homeworkTasks?.bonusChallenge || '',
          allowMultiPageUpload: formData.homeworkTasks?.allowMultiPageUpload ?? true,
          dueDateTime: formData.homeworkTasks?.dueDateTime
        },
        nextLecturePrep: {
          prepPoints: (formData.nextLecturePrep?.prepPoints || []).filter(p => p.trim() !== ''),
          teaserNotes: formData.nextLecturePrep?.teaserNotes || ''
        }
      };

      let url = '/api/lecture-recaps';
      let method = 'POST';

      if (isEditMode && editingRecapId) {
        url = `/api/lecture-recaps/${editingRecapId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.recap) {
        if (isEditMode) {
          setRecaps((prev) => prev.map(r => r.id === data.recap.id ? data.recap : r));
        } else {
          setRecaps((prev) => [data.recap, ...prev.filter(r => r.id !== data.recap.id)]);
        }
        setSelectedRecapId(data.recap.id);
        setIsCreatorOpen(false);
        setIsEditMode(false);
        setEditingRecapId(null);
        alert(isEditMode ? '✅ تم تعديل ملخص المحاضرة بنجاح!' : '🎉 ' + data.message);
      } else {
        alert(data.error || 'فشل حفظ الملخص');
      }
    } catch (e: any) {
      alert('فشل حفظ الملخص: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف ملخص وتكليف هذه المحاضرة؟')) return;
    try {
      const res = await fetch(`/api/lecture-recaps/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecaps(prev => prev.filter(r => r.id !== id));
        if (selectedRecapId === id) setSelectedRecapId(null);
        alert('🗑️ تم حذف الملخص بنجاح');
      } else {
        alert(data.error || 'فشل حذف الملخص');
      }
    } catch (err: any) {
      alert('تعذر حذف الملخص: ' + err.message);
    }
  };

  const copyForWhatsApp = (recap: LectureRecap) => {
    const pointsText = (recap.recapSummary?.points || []).map((p, i) => `${i + 1}. ${p}`).join('\n');
    const tasksText = (recap.homeworkTasks?.tasks || []).map((t, i) => `${i + 1}. ${t}`).join('\n');
    const prepText = (recap.nextLecturePrep?.prepPoints || []).map((p, i) => `📌 ${p}`).join('\n');

    const text = `
*${recap.title}*
📅 التاريخ: ${new Date(recap.lectureDate).toLocaleDateString('ar-EG')}
🎯 الصف المستهدف: ${recap.gradeLevel}
👥 المجموعة: ${recap.groupName || 'المجموعة المعتمدة'} | المادة: ${recap.subject || 'ICT'}
👨‍🏫 المدرب: ${recap.trainerName || 'المدرب المعتمد'}

*1️⃣ ملخص ما تم في المحاضرة والمراجعة:*
${pointsText}

*2️⃣ التكليفات والواجبات المطلوبة في الكشكول:*
${tasksText}
${recap.homeworkTasks?.bonusChallenge ? `\n🔥 ${recap.homeworkTasks.bonusChallenge}` : ''}

*3️⃣ الاستعداد للمحاضرة القادمة:*
${prepText}

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
      <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
        <p className="text-xs text-slate-600 font-bold">جاري تحميل ملخص وتاسكات المحاضرات المخصصة لمجموعتك...</p>
      </div>
    );
  }

  // Check if hardware box is relevant to this specific recap
  const isHardwareLecture = activeRecap && (
    (activeRecap.gradeLevel?.includes('رابع') || activeRecap.title?.includes('كيسة') || activeRecap.title?.includes('عمو الكهربائي')) &&
    (activeRecap.recapSummary?.points?.some(p => p.includes('كيسة') || p.includes('Power Supply') || p.includes('عمو الكهربائي')) ?? true)
  );

  return (
    <div className="space-y-6 text-slate-800" dir="rtl">
      {/* Top Header & Targeting Banner - Crisp Light Daylight Luxury */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-blue-50/80 border-2 border-amber-200/90 rounded-3xl p-5 md:p-6 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                ملخص وتاسك المحاضرة 📢
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200 flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-600" />
                <span>المرحلة المستهدفة: {activeRecap?.gradeLevel || effectiveGrade || 'الصف السادس الابتدائي'}</span>
              </span>
              {activeRecap?.groupName && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span>{activeRecap.groupName}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>{activeRecap?.title || `ملخص وتكليفات المحاضرة (${effectiveGrade})`}</span>
            </h2>

            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
              الهيكل التعليمي الرباعي المعتمد: ما تم إنجازه وشرحه عملياً، التكليفات والواجبات المطلوبة في الكشكول، الاستعداد والتشويق للمحاضرة القادمة، ورسالة المدرب.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
            {activeRecap && (
              <button
                type="button"
                onClick={() => copyForWhatsApp(activeRecap)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="نسخ صيغة الواتساب الرسمية لأولياء الأمور"
              >
                {copiedId === activeRecap.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ للواتساب ✓</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>نسخ للواتساب 📲</span>
                  </>
                )}
              </button>
            )}

            {mode === 'trainer_admin' && activeRecap && (
              <button
                type="button"
                onClick={() => handleOpenEditModal(activeRecap)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="تعديل هذا الملخص"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>تعديل الملخص ✏️</span>
              </button>
            )}

            {mode === 'trainer_admin' && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>نشر ملخص جديد لمجموعة ➕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TRAINER QUICK FILTER TABS */}
      {mode === 'trainer_admin' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>تصفية المحاضرات حسب المرحلة:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { id: 'all', label: 'عرض الكل' },
              { id: 'سادس', label: 'الصف السادس (ICT 6)' },
              { id: 'خامس', label: 'الصف الخامس (ICT 5)' },
              { id: 'رابع', label: 'الصف الرابع (ICT 4)' },
              { id: 'أول إعدادي', label: 'الأول الإعدادي (Prep 1)' },
              { id: 'بايثون', label: 'بايثون & AI' },
              { id: 'روبوت', label: 'روبوتكس' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTrainerGradeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  trainerGradeFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MULTIPLE RECAPS SELECTOR TABS (If there are multiple lectures for this grade/group) */}
      {visibleRecaps.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>المحاضرات المنشورة:</span>
          </span>
          {visibleRecaps.map((recap) => {
            const isSelected = activeRecap?.id === recap.id;
            return (
              <div
                key={recap.id}
                className={`flex items-center rounded-xl border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRecapId(recap.id)}
                  className="px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <span>{recap.title.split(':')[0] || recap.title}</span>
                </button>
                {mode === 'trainer_admin' && (
                  <div className="flex items-center gap-1 px-1.5 border-r border-slate-200/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(recap);
                      }}
                      className="p-1 text-slate-600 hover:text-amber-700 rounded hover:bg-white/50"
                      title="تعديل هذا الملخص"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRecap(recap.id, e)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-white/50"
                      title="حذف هذا الملخص"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TRAINER CREATOR / EDITOR MODAL */}
      {isCreatorOpen && mode === 'trainer_admin' && (
        <div className="bg-white border-2 border-amber-500/60 rounded-3xl p-5 md:p-7 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm md:text-base text-slate-900">
                {isEditMode ? '✏️ تعديل ملخص وتكليفات المحاضرة' : '➕ إنشاء ونشر ملخص وتاسكات محاضرة جديدة'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatorOpen(false);
                setIsEditMode(false);
                setEditingRecapId(null);
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              إغلاق ✕
            </button>
          </div>

          {/* QUICK TEMPLATE SHORTCUTS */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>أدوات تعبئة النموذج الذكية:</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleApplyGradeTemplate}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition-all cursor-pointer"
              >
                🪄 تطبيق نموذج المنهج المعتمد لهذا الصف
              </button>
              <button
                type="button"
                onClick={handleApplyBlankForm}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
              >
                📝 نموذج فارغ للبدء من الصفر
              </button>
            </div>
          </div>

          {/* STEP 1: TARGET AUDIENCE SELECTION (CRITICAL) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>الخطوة 1: تحديد الصف والمجموعة المستهدفة:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف / المرحلة الدراسية:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => handleGradeChangeInForm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
                >
                  {GRADE_OPTIONS.map((g, idx) => (
                    <option key={idx} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المجموعة / الجروب المستهدف:</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setFormData(prev => ({ ...prev, groupName: e.target.value }));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
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
                <label className="block font-bold text-slate-700 mb-1">المادة / الدورة التدريبية:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setFormData(prev => ({ ...prev, subject: e.target.value }));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
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
                <label className="block font-bold text-slate-700 mb-1">الفرع المعتمد:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
                >
                  {BRANCH_OPTIONS.map((br, idx) => (
                    <option key={idx} value={br}>{br}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedGroup.includes('مخصص') && (
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1">أدخل اسم المجموعة المخصصة:</label>
                <input
                  type="text"
                  value={customGroupInput}
                  onChange={(e) => setCustomGroupInput(e.target.value)}
                  placeholder="مثال: مجموعة سادسة لغات - فرع بدر الأحد 4م"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* STEP 2: AI VOICE MEMO & NOTES */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-600" />
                <span>تسجيل صوتي للمدرب أو كتابة ملاحظات المحاضرة ليقوم الذكاء الاصطناعي بهيكلتها للمجموعة المحددة ({selectedGrade}):</span>
              </span>
              {isRecording && (
                <span className="text-rose-600 font-bold text-xs animate-pulse flex items-center gap-1">
                  ● جاري التسجيل...
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={voiceMemoText}
              onChange={(e) => setVoiceMemoText(e.target.value)}
              placeholder="مثال: راجعنا على أجهزة الشبكات وعملنا كاهوت، وشرحنا الفرق بين المودم والمحول وكتبنا كود HTML بسيط، والواجب المطلوب حل التكليفات في الكشكول وتصوير صفحات الإجابة..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-inner"
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
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
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

          {/* STEP 3: DETAILED 4-SECTION FORM EDITING */}
          <div className="space-y-4">
            {/* Title & Trainer Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان المحاضرة:</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: المحاضرة 1: أجهزة شبكات الكمبيوتر والتكنولوجيا المتقدمة"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المدرب المعتمد:</label>
                <input
                  type="text"
                  value={formData.trainerName || ''}
                  onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
                  placeholder="المهندس / المدرب المعتمد"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 1: Points covered */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>ما تم إنجازه وشرحه بالمحاضرة والتطبيق العملي:</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة نقطة</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.recapSummary?.points || []).map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleUpdatePoint(idx, e.target.value)}
                      placeholder={`نقطة الشرح ${idx + 1}`}
                      className="flex-1 bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                      title="حذف هذه النقطة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Homework & Tasks */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>التكليفات والواجبات المطلوبة في الكشكول:</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة تكليف</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.homeworkTasks?.tasks || []).map((tsk, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={tsk}
                      onChange={(e) => handleUpdateTask(idx, e.target.value)}
                      placeholder={`مهمة الواجب ${idx + 1}`}
                      className="flex-1 bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                      title="حذف هذا التكليف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">تحدي النجوم الإضافية (بونص اختياري):</label>
                <input
                  type="text"
                  value={formData.homeworkTasks?.bonusChallenge || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    homeworkTasks: {
                      ...prev.homeworkTasks,
                      bonusChallenge: e.target.value
                    }
                  }))}
                  placeholder="مثال: 🌟 بونص إضافي خاص: إنشاء ملف HTML حقيقي على الكمبيوتر وتجربة فتحه بالمتصفح..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section 3: Next Lecture Prep */}
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>الاستعداد والتشويق للمحاضرة القادمة:</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddPrep}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة نقطة تحضير</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.nextLecturePrep?.prepPoints || []).map((prp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-5 text-center">📌</span>
                    <input
                      type="text"
                      value={prp}
                      onChange={(e) => handleUpdatePrep(idx, e.target.value)}
                      placeholder={`نقطة الاستعداد ${idx + 1}`}
                      className="flex-1 bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrep(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                      title="حذف هذه النقطة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Closing Message */}
            <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                <span>رسالة المدرب التشجيعية للأبطال:</span>
              </span>
              <textarea
                rows={2}
                value={formData.closingMessage || ''}
                onChange={(e) => setFormData({ ...formData, closingMessage: e.target.value })}
                placeholder="أبطال المستقبل، فخور بتركيزكم وإتقانكم وروح التحدي بالمعمل! 🚀🌟"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsCreatorOpen(false);
                setIsEditMode(false);
                setEditingRecapId(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveOrPublishRecap}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : isEditMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات على الملخص ✓</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>نشر الملخص والتاسك لطلاب ({finalGroupName || selectedGrade}) 📢</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* IF NO RECAPS FOUND FOR THIS STUDENT / GRADE */}
      {!activeRecap ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl border border-amber-200">
            📚
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-black text-base text-slate-900">
              لا توجد تكليفات ملخص منشورة بعد لصفكم ({effectiveGrade})
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              يقوم المدرب برفع ملخص الحصة والتكليفات والتطبيق العملي فور انتهاء المحاضرة التدريبية الخاصة بمجموعتكم.
            </p>
          </div>

          {mode === 'trainer_admin' ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نشر أول ملخص لهذه المرحلة الآن</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>سيتم إشعاركم تلقائياً عند قيام المدرب برفع التلخيص الجديد 🔔</span>
            </div>
          )}
        </div>
      ) : (
        /* MAIN 4 STRUCTURED SECTIONS DISPLAY - PURE LIGHT THEME */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SECTION 1: Previous Lecture & Practical Highlights (Col 7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Box 1: What was covered in Lecture */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-xs">
                    1️⃣
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      ملخص وتفاصيل ما تم في المحاضرة والمراجعة
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      المراجعة الشاملة، الأسئلة التفاعلية، مسابقة كاهوت، والتطبيق العملي
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {activeRecap.recapSummary?.points?.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-semibold">{pt}</span>
                  </div>
                ))}
              </div>

              {/* Hardware Visual Component Showcase (ONLY for Hardware lectures) */}
              {isHardwareLecture && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-amber-50/50 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-amber-600" />
                      <span>مكونات الكيسة الخمسة والتشبيهات الذكية:</span>
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-900 font-black px-2 py-0.5 rounded-md border border-amber-300">
                      تطبيق عملي بالمعمل
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="text-base">⚡️</span>
                      <div>
                        <strong className="block text-slate-900">عمو الكهربائي (Power Supply)</strong>
                        <span className="text-slate-600 text-[10px]">تغذية وتوزيع الكهرباء لجميع القطع</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="text-base">👩‍🍳</span>
                      <div>
                        <strong className="block text-slate-900">ماما نوسة (Motherboard)</strong>
                        <span className="text-slate-600 text-[10px]">اللوحة الأم التي تحتضن كل المكونات</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="text-base">🧠</span>
                      <div>
                        <strong className="block text-slate-900">المخيخ (CPU)</strong>
                        <span className="text-slate-600 text-[10px]">المعالج ووحدة معالجة وتحويل البيانات</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="text-base">🐟</span>
                      <div>
                        <strong className="block text-slate-900">السمكة (RAM)</strong>
                        <span className="text-slate-600 text-[10px]">الذاكرة المؤقتة العشوائية فائقة السرعة</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 sm:col-span-2 shadow-sm">
                      <span className="text-base">🔒</span>
                      <div>
                        <strong className="block text-slate-900">الخزنة الدائمة (Hard Disk)</strong>
                        <span className="text-slate-600 text-[10px]">وحدة التخزين الثابتة لحفظ الملفات والبرامج</span>
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
            <div className="bg-white border-2 border-amber-500/50 rounded-3xl p-5 md:p-6 shadow-md space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                    2️⃣
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      التكليفات والواجبات المطلوبة
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      ✓ يدعم رفع وتصوير أكثر من ورقة/صفحة
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {mode === 'parent_view' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>متابعة إنجاز {studentName ? `الطالب (${studentName})` : 'ابنكم'}:</span>
                    </p>
                    <p className="text-slate-600 text-[10px]">
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
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through opacity-85'
                          : 'bg-amber-50/50 border-amber-200/90 text-slate-800'
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
                        <span className="text-amber-700 font-mono font-black">{idx + 1}.</span>
                      )}
                      <span className="flex-1 leading-relaxed">{task}</span>
                    </div>
                  );
                })}

                {activeRecap.homeworkTasks?.bonusChallenge && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-950 flex items-start gap-2 shadow-sm">
                    <span className="text-base">🌟</span>
                    <div>
                      <span className="block font-black text-amber-600 text-[10px]">تحدي النجوم الإضافية (بونص):</span>
                      <span className="leading-relaxed">{activeRecap.homeworkTasks.bonusChallenge}</span>
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
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>تصوير ورفع صفحات الواجب الآن للتصحيح 🚀</span>
                </button>
              )}
            </div>

            {/* Box 3: Preparation for Next Lecture */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-black text-xs">
                  3️⃣
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  الاستعداد للمحاضرة القادمة والتشويق
                </h4>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                {activeRecap.nextLecturePrep?.prepPoints?.map((prep, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600">📌</span>
                    <span className="font-medium">{prep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 4: Closing Motivational Message - Pure Warm Luxury Light */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white text-slate-900 border-2 border-amber-200/90 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800">
                <Award className="w-4 h-4 text-amber-600" />
                <span>رسالة المدرب لأبطال المستقبل:</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-800 font-semibold italic">
                "{activeRecap.closingMessage || 'أبطال النجاح، فخور بتركيزكم وإتقانكم وروح التحدي بالمعمل!'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
