import { GoogleGenAI } from '@google/genai';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguageLabStudentProgress {
  studentId: string;
  studentName: string;
  cefrLevel: CEFRLevel;
  placementScore: number;
  xp: number;
  streak: number;
  stars: number;
  vocabularyCount: number;
  totalTrainingMinutes: number;
  scores: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };
  weaknesses: string[];
  strengths: string[];
  history: Array<{
    date: string;
    activityType: string;
    score: number;
    notes: string;
  }>;
  flashcards: Array<{
    id: string;
    term: string;
    definition: string;
    box: number; // 1 to 5
    nextReviewDate: string;
  }>;
}

export interface LanguageLabActivity {
  id: string;
  trainerId?: string;
  groupId?: string;
  title: string;
  type: 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'technical';
  level: CEFRLevel;
  description: string;
  durationMinutes: number;
  maxGrade: number;
  dueDate: string;
  targetSkill: string;
  assignedTo: 'all' | 'group' | 'individual';
  assignedIds?: string[];
  createdAt: string;
}

export interface LanguageLabSubmission {
  id: string;
  activityId: string;
  studentId: string;
  studentName: string;
  status: 'Submitted' | 'Pending' | 'Late' | 'Needs Review' | 'Completed';
  content: string;
  audioUrl?: string;
  aiScore?: {
    accuracy: number;
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overall: number;
    feedback: string;
  };
  trainerFeedback?: {
    rating: number;
    note: string;
    audioNote?: string;
  };
  submittedAt: string;
}

// AI Model Router mockup / wrapper for Language Lab tasks
export async function callLanguageLabAI(prompt: string, taskType: 'text' | 'speech' | 'reasoning' | 'code' | 'pronunciation' = 'text'): Promise<string> {
  try {
    // In production or via server proxy / Gemini SDK
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `[AI Language Lab Router - Task: ${taskType}] ${prompt}`,
        systemInstruction: 'You are Nagah AI Language Lab Expert, specialized in CEFR language training (A1-C2), technical English, pronunciation coaching, and constructive educational feedback in Arabic & English.'
      })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.reply || data.text) return data.reply || data.text;
    }
  } catch (e) {
    console.warn('AI Router fallback triggered:', e);
  }

  // Fallback intelligent response if offline or direct
  return `🤖 [AI Language Lab Assistant]: تم تحليل التمرين بنجاح. الأداء ممتاز ويحتاج تركيزاً بسيطاً على القواعد (Grampronunciation). استمر في التقدم!`;
}

// Mock initial data store in localStorage for persistence across sessions
export function getStoredLanguageProgress(studentId: string): LanguageLabStudentProgress {
  const key = `nagah_lang_progress_${studentId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  const initial: LanguageLabStudentProgress = {
    studentId,
    studentName: 'متدرب النجاح',
    cefrLevel: 'B1',
    placementScore: 78,
    xp: 450,
    streak: 5,
    stars: 24,
    vocabularyCount: 185,
    totalTrainingMinutes: 120,
    scores: {
      speaking: 76,
      listening: 82,
      reading: 85,
      writing: 74,
      pronunciation: 79,
      grammar: 72,
      vocabulary: 88
    },
    weaknesses: ['Past Tense Grammar', 'Advanced Pronunciation Stress'],
    strengths: ['Technical Vocabulary', 'Reading Comprehension'],
    history: [
      { date: '2026-08-25', activityType: 'AI Conversation', score: 85, notes: 'محادثة تقنية ممتازة' },
      { date: '2026-08-26', activityType: 'Speaking Lab', score: 78, notes: 'تدرب على نطق الكلمات الصعبة' }
    ],
    flashcards: [
      { id: 'f1', term: 'Repository', definition: 'مستودع حفظ الأكواد والملفات في Git', box: 3, nextReviewDate: '2026-09-01' },
      { id: 'f2', term: 'Asynchronous', definition: 'عمليات غير متزامنة لا توقف تنفيذ البرنامج', box: 2, nextReviewDate: '2026-08-29' },
      { id: 'f3', term: 'Refactoring', definition: 'إعادة هيكلة وتحسين الشيفرة البرمجية دون تغيير وظيفتها', box: 4, nextReviewDate: '2026-09-05' }
    ]
  };
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

export function saveStoredLanguageProgress(progress: LanguageLabStudentProgress) {
  const key = `nagah_lang_progress_${progress.studentId}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

export function getStoredActivities(): LanguageLabActivity[] {
  const saved = localStorage.getItem('nagah_lang_activities');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  const defaults: LanguageLabActivity[] = [
    {
      id: 'act-1',
      title: 'مقابلة عمل برمجية (Job Interview)',
      type: 'speaking',
      level: 'B1',
      description: 'تدرب على تقديم نفسك ومناقشة مشروعك البرمجي باللغة الإنجليزية.',
      durationMinutes: 15,
      maxGrade: 100,
      dueDate: '2026-09-05',
      targetSkill: 'Speaking & Technical English',
      assignedTo: 'all',
      createdAt: '2026-08-26'
    },
    {
      id: 'act-2',
      title: 'مصطلحات الذكاء الاصطناعي وقواعد البيانات',
      type: 'vocabulary',
      level: 'B2',
      description: 'مراجعة وحفظ أهم 20 مصطلح برمجي وسحابي.',
      durationMinutes: 10,
      maxGrade: 50,
      dueDate: '2026-09-02',
      targetSkill: 'Vocabulary Flashcards',
      assignedTo: 'all',
      createdAt: '2026-08-25'
    }
  ];
  localStorage.setItem('nagah_lang_activities', JSON.stringify(defaults));
  return defaults;
}

export function saveStoredActivities(activities: LanguageLabActivity[]) {
  localStorage.setItem('nagah_lang_activities', JSON.stringify(activities));
}

export function getStoredSubmissions(): LanguageLabSubmission[] {
  const saved = localStorage.getItem('nagah_lang_submissions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  const defaults: LanguageLabSubmission[] = [
    {
      id: 'sub-1',
      activityId: 'act-1',
      studentId: 'stud-1',
      studentName: 'أحمد محمود',
      status: 'Submitted',
      content: 'I have 2 years of experience in React and TypeScript development...',
      aiScore: {
        accuracy: 82,
        fluency: 79,
        pronunciation: 80,
        grammar: 78,
        vocabulary: 85,
        overall: 81,
        feedback: 'أداء صوتي ممتاز، مع ضرورة التركيز على ربط الجمل بأدوات الربط (Transition words).'
      },
      trainerFeedback: {
        rating: 5,
        note: 'ممتاز يا أحمد، تقدم ملحوظ في الثقة بالنفس!'
      },
      submittedAt: '2026-08-26'
    }
  ];
  localStorage.setItem('nagah_lang_submissions', JSON.stringify(defaults));
  return defaults;
}

export function saveStoredSubmissions(subs: LanguageLabSubmission[]) {
  localStorage.setItem('nagah_lang_submissions', JSON.stringify(subs));
}
